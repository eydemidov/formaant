export type VowelProfile = 'modern-rp-male' | 'modern-rp-female' | 'american-male' | 'american-female' | 'mandarin-male' | 'mandarin-female' | 'french-male' | 'french-female' | 'japanese-male' | 'japanese-female';

export interface ProfileVowel {
  symbol: string;
  f1: number;
  f2: number;
  f1Min?: number | null;
  f1Max?: number | null;
  f2Min?: number | null;
  f2Max?: number | null;
  description: string;
}

export const VOWEL_RANGE_ALLOWANCE = 0.05;

export const vowelProfiles: Record<VowelProfile, ProfileVowel[]> = {
  'modern-rp-female': [
    { symbol: 'iː', f1: 350, f2: 2623, f1Min: 281, f1Max: 427, f2Min: 2562, f2Max: 2738, description: 'FLEECE' },
    { symbol: 'ɪ', f1: 457, f2: 2071, f1Min: 384, f1Max: 536, f2Min: 1936, f2Max: 2183, description: 'KIT' },
    { symbol: 'ɛ', f1: 636, f2: 1919, f1Min: 502, f1Max: 712, f2Min: 1843, f2Max: 2025, description: 'DRESS' },
    { symbol: 'a', f1: 845, f2: 1663, f1Min: 677, f1Max: 974, f2Min: 1615, f2Max: 1746, description: 'TRAP' },
    { symbol: 'ʉː', f1: 347, f2: 1853, f1Min: 286, f1Max: 425, f2Min: 1725, f2Max: 1932, description: 'GOOSE' },
    { symbol: 'ʊ̈', f1: 444, f2: 1492, f1Min: 351, f1Max: 565, f2Min: 1322, f2Max: 1616, description: 'FOOT' },
    { symbol: 'oː', f1: 425, f2: 818, f1Min: 363, f1Max: 512, f2Min: 759, f2Max: 917, description: 'THOUGHT' },
    { symbol: 'ɔ', f1: 576, f2: 1037, f1Min: 521, f1Max: 633, f2Min: 970, f2Max: 1135, description: 'LOT' },
    { symbol: 'ʌ', f1: 700, f2: 1413, f1Min: 623, f1Max: 742, f2Min: 1265, f2Max: 1521, description: 'STRUT' },
    { symbol: 'əː', f1: 599, f2: 1683, f1Min: 475, f1Max: 693, f2Min: 1641, f2Max: 1758, description: 'NURSE' },
    { symbol: 'ɑː', f1: 718, f2: 1186, f1Min: 645, f1Max: 765, f2Min: 1080, f2Max: 1312, description: 'START/PALM' },
    // { symbol: 'ɑɪ', f1: 767, f2: 1274, f1Min: 701, f1Max: 861, f2Min: 1181, f2Max: 1388, description: 'PRICE onset' },
    // { symbol: 'ɑɪ', f1: 499, f2: 2170, f1Min: 370, f1Max: 640, f2Min: 2033, f2Max: 2398, description: 'PRICE glide' },
    // { symbol: 'ao', f1: 828, f2: 1620, f1Min: 675, f1Max: 949, f2Min: 1554, f2Max: 1681, description: 'MOUTH onset' },
    // { symbol: 'ao', f1: 552, f2: 1300, f1Min: 391, f1Max: 723, f2Min: 1147, f2Max: 1408, description: 'MOUTH glide' },
    // { symbol: 'əʊ̈', f1: 570, f2: 1687, f1Min: 460, f1Max: 653, f2Min: 1612, f2Max: 1772, description: 'GOAT onset' },
    // { symbol: 'əʊ̈', f1: 392, f2: 1752, f1Min: 315, f1Max: 514, f2Min: 1561, f2Max: 1912, description: 'GOAT glide' },
    // { symbol: 'ɛɪ', f1: 565, f2: 2068, f1Min: 455, f1Max: 667, f2Min: 1989, f2Max: 2191, description: 'FACE onset' },
    // { symbol: 'ɛɪ', f1: 411, f2: 2411, f1Min: 307, f1Max: 562, f2Min: 2324, f2Max: 2482, description: 'FACE glide' },
  ],
  'modern-rp-male': [
    { symbol: 'iː', f1: 290, f2: 2364, f1Min: 273, f1Max: 307, f2Min: 2174, f2Max: 2569, description: 'FLEECE' },
    { symbol: 'ɪ', f1: 394, f2: 1829, f1Min: 361, f1Max: 418, f2Min: 1732, f2Max: 1945, description: 'KIT' },
    { symbol: 'ɛ', f1: 546, f2: 1723, f1Min: 481, f1Max: 621, f2Min: 1631, f2Max: 1818, description: 'DRESS' },
    { symbol: 'a', f1: 698, f2: 1545, f1Min: 666, f1Max: 748, f2Min: 1444, f2Max: 1599, description: 'TRAP' },
    { symbol: 'ʉː', f1: 317, f2: 1684, f1Min: 302, f1Max: 327, f2Min: 1573, f2Max: 1826, description: 'GOOSE' },
    { symbol: 'ʊ̈', f1: 390, f2: 1345, f1Min: 350, f1Max: 414, f2Min: 1221, f2Max: 1476, description: 'FOOT' },
    { symbol: 'oː', f1: 405, f2: 747, f1Min: 340, f1Max: 472, f2Min: 672, f2Max: 841, description: 'THOUGHT' },
    { symbol: 'ɔ', f1: 545, f2: 957, f1Min: 491, f1Max: 598, f2Min: 841, f2Max: 1043, description: 'LOT' },
    { symbol: 'ʌ', f1: 610, f2: 1261, f1Min: 560, f1Max: 684, f2Min: 1225, f2Max: 1364, description: 'STRUT' },
    { symbol: 'əː', f1: 503, f2: 1490, f1Min: 458, f1Max: 543, f2Min: 1418, f2Max: 1612, description: 'NURSE' },
    { symbol: 'ɑː', f1: 625, f2: 1120, f1Min: 565, f1Max: 685, f2Min: 1061, f2Max: 1197, description: 'START/PALM' },
    // { symbol: 'ɑɪ', f1: 632, f2: 1174, f1Min: 563, f1Max: 726, f2Min: 1108, f2Max: 1238, description: 'PRICE onset' },
    // { symbol: 'ɑɪ', f1: 395, f2: 1951, f1Min: 356, f1Max: 447, f2Min: 1808, f2Max: 2181, description: 'PRICE glide' },
    // { symbol: 'ao', f1: 667, f2: 1468, f1Min: 628, f1Max: 709, f2Min: 1367, f2Max: 1641, description: 'MOUTH onset' },
    // { symbol: 'ao', f1: 439, f2: 1157, f1Min: 372, f1Max: 541, f2Min: 922, f2Max: 1388, description: 'MOUTH glide' },
    // { symbol: 'əʊ̈', f1: 493, f2: 1438, f1Min: 470, f1Max: 560, f2Min: 1327, f2Max: 1555, description: 'GOAT onset' },
    // { symbol: 'əʊ̈', f1: 348, f2: 1523, f1Min: 324, f1Max: 375, f2Min: 1301, f2Max: 1624, description: 'GOAT glide' },
    // { symbol: 'ɛɪ', f1: 492, f2: 1761, f1Min: 448, f1Max: 572, f2Min: 1591, f2Max: 1845, description: 'FACE onset' },
    // { symbol: 'ɛɪ', f1: 341, f2: 2206, f1Min: 305, f1Max: 383, f2Min: 1999, f2Max: 2515, description: 'FACE glide' },
  ],
  'american-male': [
    { symbol: 'i', f1: 340, f2: 2338, f1Min: 293, f1Max: 432, f2Min: 2061, f2Max: 2640, description: 'FLEECE / heed' },
    { symbol: 'ɪ', f1: 459, f2: 1941, f1Min: 393, f1Max: 547, f2Min: 1745, f2Max: 2383, description: 'KIT / hid' },
    { symbol: 'ɛ', f1: 592, f2: 1774, f1Min: 523, f1Max: 691, f2Min: 1590, f2Max: 2225, description: 'DRESS / head' },
    { symbol: 'æ', f1: 613, f2: 1863, f1Min: 545, f1Max: 720, f2Min: 1624, f2Max: 2324, description: 'TRAP / had' },
    { symbol: 'ɑ', f1: 757, f2: 1326, f1Min: 645, f1Max: 954, f2Min: 1001, f2Max: 1565, description: 'LOT / hod (cot vowel)' },
    { symbol: 'ɔ', f1: 670, f2: 1046, f1Min: 615, f1Max: 811, f2Min: 881, f2Max: 1195, description: 'THOUGHT / hawed' },
    { symbol: 'ʌ', f1: 618, f2: 1243, f1Min: 554, f1Max: 691, f2Min: 1046, f2Max: 1446, description: 'STRUT / hud' },
    { symbol: 'ɝ', f1: 460, f2: 1406, f1Min: 392, f1Max: 555, f2Min: 1199, f2Max: 1546, description: 'NURSE / heard' },
    { symbol: 'ʊ', f1: 483, f2: 1208, f1Min: 434, f1Max: 548, f2Min: 980, f2Max: 1401, description: 'FOOT / hood' },
    { symbol: 'u', f1: 375, f2: 971, f1Min: 309, f1Max: 443, f2Min: 746, f2Max: 1148, description: 'GOOSE / who’d' },
    // { symbol: 'eɪ', f1: 479, f2: 2089, f1Min: 432, f1Max: 554, f2Min: 1900, f2Max: 2532, description: 'FACE / hayed onset' },
    // { symbol: 'eɪ', f1: 400, f2: 2229, f1Min: 328, f1Max: 479, f2Min: 1991, f2Max: 2630, description: 'FACE / hayed glide' },
    // { symbol: 'oʊ', f1: 511, f2: 936, f1Min: 447, f1Max: 568, f2Min: 788, f2Max: 1126, description: 'GOAT / hoed onset' },
    // { symbol: 'oʊ', f1: 435, f2: 898, f1Min: 372, f1Max: 500, f2Min: 664, f2Max: 1186, description: 'GOAT / hoed glide' },
  ],
  'american-female': [
    { symbol: 'i', f1: 436, f2: 2767, f1Min: 325, f1Max: 524, f2Min: 2364, f2Max: 3066, description: 'FLEECE / heed' },
    { symbol: 'ɪ', f1: 521, f2: 2268, f1Min: 429, f1Max: 619, f2Min: 2085, f2Max: 2574, description: 'KIT / hid' },
    { symbol: 'ɛ', f1: 728, f2: 2032, f1Min: 590, f1Max: 938, f2Min: 1789, f2Max: 2381, description: 'DRESS / head' },
    { symbol: 'æ', f1: 756, f2: 2140, f1Min: 649, f1Max: 922, f2Min: 1897, f2Max: 2504, description: 'TRAP / had' },
    { symbol: 'ɑ', f1: 918, f2: 1558, f1Min: 715, f1Max: 1117, f2Min: 1237, f2Max: 1864, description: 'LOT / hod (cot vowel)' },
    { symbol: 'ɔ', f1: 816, f2: 1261, f1Min: 671, f1Max: 938, f2Min: 1047, f2Max: 1551, description: 'THOUGHT / hawed' },
    { symbol: 'ʌ', f1: 752, f2: 1510, f1Min: 624, f1Max: 921, f2Min: 1137, f2Max: 1816, description: 'STRUT / hud' },
    { symbol: 'ɝ', f1: 511, f2: 1595, f1Min: 446, f1Max: 617, f2Min: 1398, f2Max: 2005, description: 'NURSE / heard' },
    { symbol: 'ʊ', f1: 562, f2: 1383, f1Min: 495, f1Max: 649, f2Min: 985, f2Max: 1674, description: 'FOOT / hood' },
    { symbol: 'u', f1: 455, f2: 1090, f1Min: 341, f1Max: 538, f2Min: 785, f2Max: 1611, description: 'GOOSE / who’d' },
    // { symbol: 'eɪ', f1: 534, f2: 2514, f1Min: 441, f1Max: 643, f2Min: 2232, f2Max: 2834, description: 'FACE / hayed onset' },
    // { symbol: 'eɪ', f1: 447, f2: 2693, f1Min: 357, f1Max: 544, f2Min: 2347, f2Max: 3106, description: 'FACE / hayed glide' },
    // { symbol: 'oʊ', f1: 603, f2: 1078, f1Min: 444, f1Max: 698, f2Min: 803, f2Max: 1412, description: 'GOAT / hoed onset' },
    // { symbol: 'oʊ', f1: 472, f2: 996, f1Min: 423, f1Max: 563, f2Min: 762, f2Max: 1264, description: 'GOAT / hoed glide' },
  ],
  'mandarin-female': [
    { symbol: 'i', f1: 311, f2: 2871, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'i; close front' },
    { symbol: 'u', f1: 354, f2: 762, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'u; close back rounded' },
    { symbol: 'y', f1: 305, f2: 2411, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'ü; close front rounded' },
    { symbol: 'o', f1: 654, f2: 947, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'o; back rounded' },
    { symbol: 'ɤ', f1: 622, f2: 1334, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'e; back unrounded' },
    { symbol: 'a', f1: 952, f2: 1371, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'a; open' },
    { symbol: 'ɿ', f1: 399, f2: 1762, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'ï; apical vowel' },
    { symbol: 'ʅ', f1: 416, f2: 2092, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'î; retroflex apical vowel' },
    { symbol: 'ə', f1: 656, f2: 1370, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'ë; mid central' },
    { symbol: 'ɛ', f1: 856, f2: 2119, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'ê; open-mid front' },
  ],
  'mandarin-male': [
    { symbol: 'i', f1: 279, f2: 2240, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'i; close front' },
    { symbol: 'u', f1: 342, f2: 701, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'u; close back rounded' },
    { symbol: 'y', f1: 280, f2: 1992, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'ü; close front rounded' },
    { symbol: 'o', f1: 532, f2: 817, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'o; back rounded' },
    { symbol: 'ɤ', f1: 501, f2: 1163, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'e; back unrounded' },
    { symbol: 'a', f1: 795, f2: 1168, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'a; open' },
    { symbol: 'ɿ', f1: 355, f2: 1410, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'ï; apical vowel' },
    { symbol: 'ʅ', f1: 351, f2: 1719, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'î; retroflex apical vowel' },
    { symbol: 'ə', f1: 525, f2: 1179, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'ë; mid central' },
    { symbol: 'ɛ', f1: 705, f2: 1789, f1Min: null, f1Max: null, f2Min: null, f2Max: null, description: 'ê; open-mid front' },
  ],
  'french-female': [
    { symbol: 'i', f1: 348, f2: 2365, description: 'i' },
    { symbol: 'y', f1: 371, f2: 2063, description: 'u' },
    { symbol: 'e', f1: 423, f2: 2176, description: 'é' },
    { symbol: 'ɛ', f1: 526, f2: 2016, description: 'è' },
    { symbol: 'a', f1: 685, f2: 1677, description: 'a' },
    { symbol: 'œ', f1: 436, f2: 1643, description: 'œ' },
    { symbol: 'ø', f1: 420, f2: 1693, description: 'eu' },
    { symbol: 'ɔ', f1: 528, f2: 1347, description: 'open o' },
    { symbol: 'o', f1: 438, f2: 1140, description: 'closed o' },
    { symbol: 'u', f1: 404, f2: 1153, description: 'ou' },
  ],
  'french-male': [
    { symbol: 'i', f1: 310, f2: 2005, description: 'i' },
    { symbol: 'y', f1: 336, f2: 1803, description: 'u' },
    { symbol: 'e', f1: 370, f2: 1850, description: 'é' },
    { symbol: 'ɛ', f1: 438, f2: 1717, description: 'è' },
    { symbol: 'a', f1: 557, f2: 1444, description: 'a' },
    { symbol: 'œ', f1: 400, f2: 1445, description: 'œ' },
    { symbol: 'ø', f1: 384, f2: 1474, description: 'eu' },
    { symbol: 'ɔ', f1: 456, f2: 1203, description: 'open o' },
    { symbol: 'o', f1: 397, f2: 1041, description: 'closed o' },
    { symbol: 'u', f1: 371, f2: 1105, description: 'ou' },
  ],
  'japanese-male': [
    { symbol: 'i', f1: 301, f1Min: 271, f1Max: 385, f2: 2154, f2Min: 1901, f2Max: 2390, description: 'close front' },
    { symbol: 'e', f1: 443, f1Min: 388, f1Max: 523, f2: 1947, f2Min: 1741, f2Max: 2109, description: 'mid front' },
    { symbol: 'a', f1: 687, f1Min: 587, f1Max: 817, f2: 1283, f2Min: 1195, f2Max: 1421, description: 'open central' },
    { symbol: 'o', f1: 462, f1Min: 418, f1Max: 569, f2: 949, f2Min: 875, f2Max: 1067, description: 'mid back rounded' },
    { symbol: 'u', f1: 348, f1Min: 319, f1Max: 415, f2: 1435, f2Min: 1302, f2Max: 1486, description: 'high central Japanese /u/' },
  ],
  'japanese-female': [
    { symbol: 'i', f1: 346, f1Min: 259, f1Max: 406, f2: 2639, f2Min: 2383, f2Max: 2978, description: 'close front' },
    { symbol: 'e', f1: 516, f1Min: 422, f1Max: 640, f2: 2302, f2Min: 2144, f2Max: 2613, description: 'mid front' },
    { symbol: 'a', f1: 801, f1Min: 686, f1Max: 868, f2: 1530, f2Min: 1373, f2Max: 1637, description: 'open central' },
    { symbol: 'o', f1: 526, f1Min: 433, f1Max: 653, f2: 1127, f2Min: 988, f2Max: 1319, description: 'mid back rounded' },
    { symbol: 'u', f1: 434, f1Min: 353, f1Max: 529, f2: 1645, f2Min: 1437, f2Max: 1806, description: 'high central Japanese /u/' },
  ],
};

export function isWithinProfileRange(f1: number, f2: number, reference: ProfileVowel): boolean {
  return (reference.f1Min == null || f1 >= reference.f1Min * (1 - VOWEL_RANGE_ALLOWANCE)) &&
    (reference.f1Max == null || f1 <= reference.f1Max * (1 + VOWEL_RANGE_ALLOWANCE)) &&
    (reference.f2Min == null || f2 >= reference.f2Min * (1 - VOWEL_RANGE_ALLOWANCE)) &&
    (reference.f2Max == null || f2 <= reference.f2Max * (1 + VOWEL_RANGE_ALLOWANCE));
}
