const CUBE_OFFICIAL_FIX_VERSION='1.7.0';
(function(){
 if(typeof CUBE_RECIPES==='undefined'||typeof cubeRecipe!=='function')return;
 for(let i=CUBE_RECIPES.length-1;i>=0;i--){if(CUBE_RECIPES[i].category==='크래프트')CUBE_RECIPES.splice(i,1);}
 const crafted=[
 ['블러드','Helm','Ral','Perfect Ruby','Magic Helm/Casque/Armet','치명적 공격 5-10%, 생명력 훔침 1-3%, 생명력 +10-20'],
 ['블러드','Boots','Eth','Perfect Ruby','Magic Light Plated Boots/Battle Boots/Mirrored Boots','생명력 회복 +5-10, 생명력 훔침 1-3%, 생명력 +10-20'],
 ['블러드','Gloves','Nef','Perfect Ruby','Magic Heavy Gloves/Sharkskin Gloves/Vampirebone Gloves','강타 5-10%, 생명력 훔침 1-3%, 생명력 +10-20'],
 ['블러드','Belt','Tal','Perfect Ruby','Magic Belt/Mesh Belt/Mithril Coil','상처 악화 5-10%, 생명력 훔침 1-3%, 생명력 +10-20'],
 ['블러드','Shield','Ith','Perfect Ruby','Magic Spiked Shield/Barbed Shield/Blade Barrier','공격자 피해 4-7, 생명력 훔침 1-3%, 생명력 +10-20'],
 ['블러드','Body Armor','Thul','Perfect Ruby','Magic Plate Mail/Templar Coat/Hellforge Plate','악마 처치 시 생명력 +1-3, 생명력 훔침 1-3%, 생명력 +10-20'],
 ['블러드','Amulet','Amn','Perfect Ruby','Magic Amulet','달리기/걷기 5-10%, 생명력 훔침 1-4%, 생명력 +10-20'],
 ['블러드','Ring','Sol','Perfect Ruby','Magic Ring','힘 +1-5, 생명력 훔침 1-3%, 생명력 +10-20'],
 ['블러드','Weapon','Ort','Perfect Ruby','Magic Axe (Normal/Exceptional/Elite)','피해 증가 35-60%, 생명력 훔침 1-4%, 생명력 +10-20'],
 ['캐스터','Helm','Nef','Perfect Amethyst','Magic Mask/Death Mask/Demonhead','마나 훔침 1-4%, 마나 재생 4-10%, 마나 +10-20'],
 ['캐스터','Boots','Thul','Perfect Amethyst','Magic Boots/Demonhide Boots/Wyrmhide Boots','최대 마나 2-5%, 마나 재생 4-10%, 마나 +10-20'],
 ['캐스터','Gloves','Ort','Perfect Amethyst','Magic Leather Gloves/Demonhide Gloves/Bramble Mitts','처치 시 마나 +1-3, 마나 재생 4-10%, 마나 +10-20'],
 ['캐스터','Belt','Ith','Perfect Amethyst','Magic Light Belt/Sharkskin Belt/Vampirefang Belt','시전 속도 5-10%, 마나 재생 4-10%, 마나 +10-20'],
 ['캐스터','Shield','Eth','Perfect Amethyst','Magic Small Shield/Round Shield/Luna','막기 확률 증가 5-10%, 마나 재생 4-10%, 마나 +10-20'],
 ['캐스터','Body Armor','Tal','Perfect Amethyst','Magic Light Plate/Mage Plate/Archon Plate','처치 시 마나 +1-3, 마나 재생 4-10%, 마나 +10-20'],
 ['캐스터','Amulet','Ral','Perfect Amethyst','Magic Amulet','시전 속도 5-10%, 마나 재생 4-10%, 마나 +10-20'],
 ['캐스터','Ring','Amn','Perfect Amethyst','Magic Ring','마력 +1-5, 마나 재생 4-10%, 마나 +10-20'],
 ['캐스터','Weapon','Tir','Perfect Amethyst','Magic Rod (Scepter/Wand/Staff)','최대 마나 1-5%, 마나 재생 4-10%, 마나 +10-20'],
 ['히트 파워','Helm','Ith','Perfect Sapphire','Magic Full Helm/Basinet/Giant Conch','원거리 방어 +25-50, 피격 시 5% 확률 서리 회오리, 공격자 피해 3-7'],
 ['히트 파워','Boots','Ral','Perfect Sapphire','Magic Chain Boots/Mesh Boots/Boneweave Boots','근접 방어 +25-50, 피격 시 5% 확률 서리 회오리, 공격자 피해 3-7'],
 ['히트 파워','Gloves','Ort','Perfect Sapphire','Magic Chain Gloves/Heavy Bracers/Vambraces','밀쳐내기, 피격 시 5% 확률 서리 회오리, 공격자 피해 3-7'],
 ['히트 파워','Belt','Tal','Perfect Sapphire','Magic Heavy Belt/Battle Belt/Troll Belt','피해의 5-10% 마나로, 피격 시 5% 확률 서리 회오리, 공격자 피해 3-7'],
 ['히트 파워','Shield','Eth','Perfect Sapphire','Magic Gothic Shield/Ancient Shield/Ward','공격자 피해 3-10, 피격 시 5% 확률 서리 회오리, 공격자 피해 3-7'],
 ['히트 파워','Body Armor','Nef','Perfect Sapphire','Magic Field Plate/Sharktooth Armor/Kraken Shell','피격 시 10-20% 확률 서리 회오리 계열 고정 효과'],
 ['히트 파워','Amulet','Thul','Perfect Sapphire','Magic Amulet','공격자 도주 3-11%, 피격 시 5% 확률 서리 회오리, 공격자 피해 3-7'],
 ['히트 파워','Ring','Amn','Perfect Sapphire','Magic Ring','민첩 +1-5, 피격 시 5% 확률 서리 회오리, 공격자 피해 3-7'],
 ['히트 파워','Weapon','Tir','Perfect Sapphire','Magic Blunt Weapon','피해 증가 35-60%, 피격 시 5% 확률 서리 회오리, 공격자 피해 3-7'],
 ['세이프티','Helm','Ith','Perfect Emerald','Magic Crown/Grand Crown/Corona','방어력 증가 10-30%, 번개 저항 5-10%, 마법 피해 감소 1-2, 피해 감소 1-4'],
 ['세이프티','Boots','Ort','Perfect Emerald','Magic Greaves/War Boots/Myrmidon Boots','방어력 증가 10-30%, 화염 저항 5-10%, 마법 피해 감소 1-2, 피해 감소 1-4'],
 ['세이프티','Gloves','Ral','Perfect Emerald','Magic Gauntlets/War Gauntlets/Ogre Gauntlets','방어력 증가 10-30%, 냉기 저항 5-10%, 마법 피해 감소 1-2, 피해 감소 1-4'],
 ['세이프티','Belt','Tal','Perfect Emerald','Magic Sash/Demonhide Sash/Spiderweb Sash','방어력 증가 10-30%, 독 저항 5-10%, 마법 피해 감소 1-2, 피해 감소 1-4'],
 ['세이프티','Shield','Nef','Perfect Emerald','Magic Kite Shield/Dragon Shield/Monarch','방어력 증가 10-30%, 마법 저항 5-10%, 마법 피해 감소 1-2, 피해 감소 1-4'],
 ['세이프티','Body Armor','Eth','Perfect Emerald','Magic Breast Plate/Cuirass/Great Hauberk','방어력 증가 10-30%, 빙결 지속시간 절반, 마법 피해 감소 1-2, 피해 감소 1-4'],
 ['세이프티','Amulet','Thul','Perfect Emerald','Magic Amulet','막기 확률 증가 1-10%, 마법 피해 감소 1-2, 피해 감소 1-4'],
 ['세이프티','Ring','Amn','Perfect Emerald','Magic Ring','활력 +1-5, 마법 피해 감소 1-2, 피해 감소 1-4'],
 ['세이프티','Weapon','Sol','Perfect Emerald','Magic Spear/Javelin (Normal/Exceptional/Elite)','방어력 증가 5-10%, 마법 피해 감소 1-2, 피해 감소 1-4']
 ];
 crafted.forEach(([family,item,rune,gem,base,effect])=>CUBE_RECIPES.push(cubeRecipe('크래프트',`${family} ${item}`,[{key:`rune:${rune}`,count:1},{key:`gem:${gem}`,count:1},{key:'generic:Jewel',count:1},{key:`generic:${base}`,count:1}],`${family} 제작 ${item}`,effect)));
 const extras=[
 cubeRecipe('재설정','생명력 흡수 마법 검',[{key:'generic:Health Potion',count:4},{key:'generic:Ruby Any',count:1},{key:'generic:Magic Sword',count:1}],'생명력 흡수 접미사 마법 검','출력 ilvl 30.'),
 cubeRecipe('저항 장신구','프리즈매틱 목걸이',[{key:'generic:Perfect Gems 6 Types',count:1},{key:'generic:Magic Amulet',count:1}],'모든 저항 +16~20 마법 목걸이','최상급 보석 6종 각 1개.'),
 cubeRecipe('저항 장신구','제이드 반지',[{key:'generic:Magic Ring',count:1},{key:'gem:Perfect Emerald',count:1},{key:'generic:Antidote Potion',count:1}],'독 저항 21~30% 반지'),
 cubeRecipe('저항 장신구','가넷 반지',[{key:'generic:Magic Ring',count:1},{key:'gem:Perfect Ruby',count:1},{key:'generic:Exploding Potion',count:1}],'화염 저항 21~30% 반지'),
 cubeRecipe('저항 장신구','코랄 반지',[{key:'generic:Magic Ring',count:1},{key:'gem:Perfect Topaz',count:1},{key:'generic:Rejuvenation Potion',count:1}],'번개 저항 21~30% 반지'),
 cubeRecipe('저항 장신구','코발트 반지',[{key:'generic:Magic Ring',count:1},{key:'gem:Perfect Sapphire',count:1},{key:'generic:Thawing Potion',count:1}],'냉기 저항 21~30% 반지'),
 cubeRecipe('재설정','가시 마법 방패',[{key:'generic:Magic Shield',count:1},{key:'generic:Spiked Club',count:1},{key:'generic:Skull Any',count:2}],'가시 접미사 마법 방패','출력 ilvl 30.'),
 cubeRecipe('무기 생성','Savage 폴암',[{key:'generic:Diamond Any',count:1},{key:'generic:Staff',count:1},{key:'generic:Kris',count:1},{key:'generic:Belt',count:1}],'Savage 접두사 폴암','피해 증가 66~80%, 출력 ilvl 50.'),
 cubeRecipe('소켓','일반 보석 3개 + 소켓 무기',[{key:'generic:Normal Gem Any',count:3},{key:'generic:Socketed Weapon',count:1}],'소켓 마법 무기','ilvl 30, 1~2소켓으로 재굴림.'),
 cubeRecipe('소켓','최하급 보석 3개 + 마법 무기',[{key:'generic:Chipped Gem Any',count:3},{key:'generic:Magic Weapon',count:1}],'소켓 마법 무기','ilvl 25, 1~2소켓으로 재굴림.'),
 cubeRecipe('소켓','상급 보석 3개 + 마법 무기',[{key:'generic:Flawless Gem Any',count:3},{key:'generic:Magic Weapon',count:1}],'소켓 마법 무기','ilvl 30, 1~2소켓으로 재굴림.'),
 cubeRecipe('품질 복원','저급 무기 → 일반',[{key:'rune:Eld',count:1},{key:'generic:Chipped Gem Any',count:1},{key:'generic:Low Quality Weapon',count:1}],'일반 품질 무기','출력 ilvl 1.'),
 cubeRecipe('품질 복원','저급 방어구 → 일반',[{key:'rune:El',count:1},{key:'generic:Chipped Gem Any',count:1},{key:'generic:Low Quality Armor',count:1}],'일반 품질 방어구','출력 ilvl 1.'),
 cubeRecipe('물약','해독 물약',[{key:'generic:Strangling Gas Potion',count:1},{key:'generic:Healing Potion',count:1}],'해독 물약')
 ];
 const existing=new Set(CUBE_RECIPES.map(r=>`${r.category}|${r.name}`));extras.forEach(r=>{const k=`${r.category}|${r.name}`;if(!existing.has(k))CUBE_RECIPES.push(r);});
 if(typeof renderCubeFilters==='function'&&document.getElementById('cubeCategory')){renderCubeFilters();renderCubeRecipes();}
 console.info(`Companda official cube corrections v${CUBE_OFFICIAL_FIX_VERSION} · ${CUBE_RECIPES.length} recipes`);
})();
