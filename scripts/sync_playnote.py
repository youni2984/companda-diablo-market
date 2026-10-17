from __future__ import annotations

import json
import re
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

START_URL = "https://www.playnote.co.kr/trade/itemmarket?index=1"
OUT = Path("data/playnote-items.json")
HEADERS = {
    "User-Agent": "Companda-D2R-Helper/1.6 (+https://github.com/youni2984/companda-diablo-market; public-market-sync)",
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.6",
}
MAX_PAGES = 20
DELAY_SECONDS = 2.0


def clean(s: str | None) -> str:
    return re.sub(r"\s+", " ", (s or "")).strip()


def num(s: str | None):
    m = re.search(r"([\d,]+)", s or "")
    return int(m.group(1).replace(",", "")) if m else None


def parse_options(text: str):
    options = []
    # Playnote public cards render option labels and values in adjacent text.
    patterns = [
        r"([^\n]{1,40}?)(?:\+|-)?\s*([+-]?\d+(?:\.\d+)?)\s*(?:%|퍼센트)?",
    ]
    for pattern in patterns:
        for label, value in re.findall(pattern, text):
            label = clean(label)
            if any(k in label for k in ["레벨", "리뷰", "개당", "종료", "거래 서버", "x "]):
                continue
            if len(label) < 2:
                continue
            options.append({"label": label[-40:], "value": value})
    # stable de-dup
    seen = set()
    out = []
    for o in options:
        key = (o["label"], o["value"])
        if key not in seen:
            seen.add(key)
            out.append(o)
    return out[:24]


def infer_category(text: str, name: str) -> str:
    candidates = ["룬워드", "유니크", "세트", "무기", "방어구", "직업 전용", "부적", "룬", "보석", "재료", "기타"]
    for c in candidates:
        if c in text:
            return c
    if name.endswith("룬"):
        return "룬"
    if "횃불" in name or "애니참" in name:
        return "부적"
    return "기타"


def parse_listing_node(node):
    text = node.get_text("\n", strip=True)
    flat = clean(text)
    if "P" not in flat or "거래 서버" not in flat:
        return None

    price_match = re.search(r"(?:개당\s*)?([\d,]+)P", flat)
    if not price_match:
        return None
    price = int(price_match.group(1).replace(",", ""))

    # Item names on public cards usually occur before x N개 or before 옵션.
    name_match = re.search(r"거래 서버\s*·?\s*[^\n]+?\s+(.+?)\s+x\s*\d+개", flat)
    if not name_match:
        name_match = re.search(r"([^·]+?)\s+x\s*\d+개", flat)
    name = clean(name_match.group(1)) if name_match else ""
    name = re.sub(r"^(?:악군|레저렉션)[^ ]*\s+", "", name)
    if not name or len(name) > 90:
        return None

    qty_match = re.search(r"x\s*([\d,]+)개", flat)
    qty = int(qty_match.group(1).replace(",", "")) if qty_match else 1
    server_match = re.search(r"거래 서버\s*·?\s*([^\n]+?)(?=\s+" + re.escape(name) + r"|\s+x\s*\d+개)", flat)
    server = clean(server_match.group(1)) if server_match else ""
    status = "거래완료" if "거래완료" in flat else "거래중" if "거래중" in flat else "판매중" if "판매중" in flat else ""
    category = infer_category(flat, name)

    href = None
    a = node if getattr(node, "name", None) == "a" else node.find("a", href=True)
    if a and a.get("href"):
        href = urljoin(START_URL, a["href"])

    return {
        "name": name,
        "category": category,
        "server": server,
        "status": status,
        "quantity": qty,
        "priceP": price,
        "unitPriceP": price,
        "options": parse_options(text),
        "url": href,
    }


def extract_listings(html: str):
    soup = BeautifulSoup(html, "html.parser")
    listings = []

    # Prefer links/cards whose visible text has server + quantity + P price.
    nodes = soup.find_all(["a", "li", "article", "div"])
    for node in nodes:
        text = clean(node.get_text(" ", strip=True))
        if "거래 서버" not in text or "P" not in text or "개" not in text:
            continue
        item = parse_listing_node(node)
        if item:
            listings.append(item)

    # De-duplicate nested containers by core listing tuple.
    unique = {}
    for x in listings:
        key = (x["name"], x["server"], x["priceP"], x["quantity"], x["url"])
        unique[key] = x
    return list(unique.values())


def discover_next_urls(html: str, current_url: str):
    soup = BeautifulSoup(html, "html.parser")
    urls = []
    for a in soup.find_all("a", href=True):
        href = urljoin(current_url, a["href"])
        if "playnote.co.kr/trade/itemmarket" not in href:
            continue
        if href != current_url and href not in urls:
            urls.append(href)
    return urls


def aggregate(listings):
    groups = defaultdict(list)
    for x in listings:
        groups[(x["name"], x["category"])].append(x)

    items = []
    for (name, category), rows in groups.items():
        prices = sorted(x["unitPriceP"] for x in rows if isinstance(x.get("unitPriceP"), int))
        if not prices:
            continue
        n = len(prices)
        median = prices[n // 2] if n % 2 else round((prices[n // 2 - 1] + prices[n // 2]) / 2)
        option_labels = sorted({o["label"] for x in rows for o in x.get("options", [])})
        items.append({
            "name": name,
            "category": category,
            "listingCount": len(rows),
            "price": {"currency": "P", "min": prices[0], "median": median, "max": prices[-1]},
            "servers": sorted({x["server"] for x in rows if x["server"]}),
            "optionLabels": option_labels[:40],
            "samples": rows[:12],
        })
    items.sort(key=lambda x: (-x["listingCount"], x["name"]))
    return items


def main():
    session = requests.Session()
    session.headers.update(HEADERS)

    queue = [START_URL]
    visited = set()
    all_listings = []

    while queue and len(visited) < MAX_PAGES:
        url = queue.pop(0)
        if url in visited:
            continue
        visited.add(url)
        try:
            r = session.get(url, timeout=20)
            r.raise_for_status()
        except Exception as exc:
            print(f"skip {url}: {exc}")
            continue
        if "로그인하고 플레이노트 거래를 시작" not in r.text and "아이템" not in r.text:
            print(f"unexpected page: {url}")
            continue
        found = extract_listings(r.text)
        print(f"{url}: {len(found)} public listings")
        all_listings.extend(found)
        for nxt in discover_next_urls(r.text, url):
            if nxt not in visited and nxt not in queue:
                queue.append(nxt)
        time.sleep(DELAY_SECONDS)

    # Global de-dup.
    uniq = {}
    for x in all_listings:
        key = (x["name"], x["server"], x["priceP"], x["quantity"], x["url"])
        uniq[key] = x
    listings = list(uniq.values())
    items = aggregate(listings)

    previous = {}
    if OUT.exists():
        try:
            previous = json.loads(OUT.read_text(encoding="utf-8"))
        except Exception:
            previous = {}

    # Never wipe a good snapshot because of a temporary block or markup change.
    if not items and previous.get("items"):
        print("No new public items parsed; keeping previous snapshot.")
        return

    payload = {
        "source": START_URL,
        "scope": "public-listings-only",
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "listingCount": len(listings),
        "itemCount": len(items),
        "items": items,
        "notes": [
            "로그인·인증 우회 없이 공개 아이템 마켓에 표시되는 정보만 수집합니다.",
            "가격은 등록가 표본이며 실제 거래 완료가를 보장하지 않습니다.",
            "사이트 구조 변경 또는 접근 제한 시 기존 스냅샷을 유지합니다.",
        ],
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"saved {len(items)} items / {len(listings)} listings")


if __name__ == "__main__":
    main()
