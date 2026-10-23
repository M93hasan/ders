import AsyncStorage from '@react-native-async-storage/async-storage';

export const K = {
  COZULEN: 'cozulen_sorular',   // { soruId: { dogruMu, tarih } }
  YANLIS: 'yanlis_kutusu',      // [{ soruId, dersId, uniteNo, ...soru }]
  ODEV: 'gunluk_odevler',       // { '2026-10-22': true }
  HEDEF: 20,                    // günlük soru hedefi
};

export async function oku(anahtar, varsayilan) {
  try {
    const ham = await AsyncStorage.getItem(anahtar);
    return ham ? JSON.parse(ham) : varsayilan;
  } catch { return varsayilan; }
}

export async function yaz(anahtar, deger) {
  try { await AsyncStorage.setItem(anahtar, JSON.stringify(deger)); } catch {}
}

export const bugun = () => new Date().toISOString().slice(0, 10);

export const soruId = (dersId, uniteNo, no) => `${dersId}|${uniteNo}|${no}`;
