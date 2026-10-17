const ITEM_VISUAL_VERSION = '1.4.0';

const ITEM_QUALITY_COLORS = {
  normal:   { label:'일반', ui:'#d7d7d7', material:'#8d8f93' },
  magic:    { label:'마법', ui:'#6b8cff', material:'#687aa8' },
  rare:     { label:'희귀', ui:'#f2df55', material:'#a98f3b' },
  set:      { label:'세트', ui:'#45c55a', material:'#3d7d48' },
  unique:   { label:'고유', ui:'#c7a36b', material:'#806b4d' },
  runeword: { label:'룬어', ui:'#d6cda2', material:'#8f8463' },
  crafted:  { label:'제작', ui:'#e4974d', material:'#8d5e39' }
};

// 실제 3D 모델/텍스처가 연결되면 item.visualColor / materialPreset이 최우선입니다.
// 품질 색상은 이름표/미확인 아이템용 보조값일 뿐, 착용 외형을 강제로 품질색으로 칠하지 않습니다.
const MATERIAL_PRESETS = {
  steel:   { base:'#73777c', metalness:0.85, roughness:0.28 },
  darkSteel:{ base:'#34383d', metalness:0.9, roughness:0.32 },
  gold:    { base:'#9b7b36', metalness:0.9, roughness:0.24 },
  bronze:  { base:'#775136', metalness:0.72, roughness:0.36 },
  leather: { base:'#5d3f2c', metalness:0.05, roughness:0.82 },
  bone:    { base:'#c0b79d', metalness:0.02, roughness:0.7 },
  cloth:   { base:'#56545e', metalness:0.0, roughness:0.92 },
  wood:    { base:'#68482e', metalness:0.0, roughness:0.86 },
  crystal: { base:'#779ab7', metalness:0.18, roughness:0.12, opacity:0.82 },
  demon:   { base:'#542b32', metalness:0.42, roughness:0.48 }
};

const SLOT_MATERIAL_DEFAULTS = {
  head:'steel', body:'steel', shield:'steel', weaponMain:'steel', weaponOff:'steel',
  gloves:'leather', boots:'leather', belt:'leather', grimoire:'leather'
};

const KNOWN_ITEM_VISUALS = {
  '할리퀸 관모': { slot:'head', materialPreset:'cloth', visualColor:'#5f6b49', accentColor:'#2c3026' },
  '수수께끼': { slot:'body', inheritBase:true },
  '영혼': { inheritBase:true },
  '불사조': { slot:'shield', materialPreset:'gold', visualColor:'#876525', emissiveColor:'#3c1b09', emissiveIntensity:0.16 },
  '꿈': { materialPreset:'darkSteel', visualColor:'#41404a', accentColor:'#70604b' },
  '인내': { slot:'body', inheritBase:true },
  '명예의 굴레': { slot:'body', inheritBase:true }
};

function normalizeVisualItem(item = {}) {
  const quality = item.quality || 'normal';
  const slot = item.slot || item.equipSlot || 'body';
  const known = KNOWN_ITEM_VISUALS[item.nameKo || item.name] || {};
  const presetKey = item.materialPreset || known.materialPreset || SLOT_MATERIAL_DEFAULTS[slot] || 'steel';
  const preset = MATERIAL_PRESETS[presetKey] || MATERIAL_PRESETS.steel;
  const baseColor = item.visualColor || known.visualColor || item.baseVisualColor || preset.base;

  return {
    name: item.nameKo || item.name || '알 수 없는 아이템',
    slot,
    quality,
    uiColor: ITEM_QUALITY_COLORS[quality]?.ui || ITEM_QUALITY_COLORS.normal.ui,
    baseColor,
    accentColor: item.accentColor || known.accentColor || baseColor,
    metalness: Number(item.metalness ?? known.metalness ?? preset.metalness ?? 0),
    roughness: Number(item.roughness ?? known.roughness ?? preset.roughness ?? 0.5),
    opacity: Number(item.opacity ?? known.opacity ?? preset.opacity ?? 1),
    emissiveColor: item.emissiveColor || known.emissiveColor || '#000000',
    emissiveIntensity: Number(item.emissiveIntensity ?? known.emissiveIntensity ?? 0),
    inheritBase: Boolean(item.inheritBase ?? known.inheritBase),
    textureId: item.textureId || known.textureId || null,
    materialPreset: presetKey
  };
}

function buildWearVisual(item = {}, baseItem = {}) {
  const v = normalizeVisualItem(item);
  if (v.inheritBase && baseItem.visualColor) {
    v.baseColor = baseItem.visualColor;
    v.accentColor = baseItem.accentColor || baseItem.visualColor;
  }
  if (v.inheritBase && baseItem.materialPreset && MATERIAL_PRESETS[baseItem.materialPreset]) {
    const p = MATERIAL_PRESETS[baseItem.materialPreset];
    v.metalness = p.metalness;
    v.roughness = p.roughness;
    v.materialPreset = baseItem.materialPreset;
  }
  return v;
}

// Three.js/Babylon.js 연결부에서 mesh.material에 이 값을 적용하면 됩니다.
function applyWearColorToMaterial(material, item, baseItem = {}) {
  if (!material) return null;
  const v = buildWearVisual(item, baseItem);

  if (material.color?.set) material.color.set(v.baseColor);
  if ('metalness' in material) material.metalness = v.metalness;
  if ('roughness' in material) material.roughness = v.roughness;
  if ('opacity' in material) material.opacity = v.opacity;
  if ('transparent' in material) material.transparent = v.opacity < 1;
  if (material.emissive?.set) material.emissive.set(v.emissiveColor);
  if ('emissiveIntensity' in material) material.emissiveIntensity = v.emissiveIntensity;
  material.needsUpdate = true;
  return v;
}

window.CompandaItemVisual = {
  version: ITEM_VISUAL_VERSION,
  qualityColors: ITEM_QUALITY_COLORS,
  materialPresets: MATERIAL_PRESETS,
  knownItemVisuals: KNOWN_ITEM_VISUALS,
  normalize: normalizeVisualItem,
  build: buildWearVisual,
  apply: applyWearColorToMaterial
};

console.info(`Companda item visual v${ITEM_VISUAL_VERSION} · wear color matching ready`);
