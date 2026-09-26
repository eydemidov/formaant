export type VowelProfile = 'modern-rp-male' | 'modern-rp-female';

export interface ProfileVowel {
  symbol: string;
  f1: number;
  f2: number;
  f1Min: number;
  f1Max: number;
  f2Min: number;
  f2Max: number;
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
};

export function isWithinProfileRange(f1: number, f2: number, reference: ProfileVowel): boolean {
  return f1 >= reference.f1Min * (1 - VOWEL_RANGE_ALLOWANCE) &&
    f1 <= reference.f1Max * (1 + VOWEL_RANGE_ALLOWANCE) &&
    f2 >= reference.f2Min * (1 - VOWEL_RANGE_ALLOWANCE) &&
    f2 <= reference.f2Max * (1 + VOWEL_RANGE_ALLOWANCE);
}
