#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AÖL PDF Ders Kitabı -> dersler.json dönüştürücü
Kullanım : python tools/pdf_to_json.py
Girdi    : pdf_kitaplar/*.pdf
Çıktı    : data/dersler.json
Kurulum  : pip install pymupdf   (veya: pip install pdfplumber)
"""
import os, re, json, sys, unicodedata

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_KLASOR = os.path.join(KOK, "pdf_kitaplar")
CIKTI = os.path.join(KOK, "data", "dersler.json")

# --- PDF okuyucu (PyMuPDF tercihli) ---------------------------------
try:
    import fitz  # pymupdf
    def sayfa_metinleri(yol):
        doc = fitz.open(yol)
        return [s.get_text() for s in doc]
    PDF_MOTORU = "pymupdf"
except ImportError:
    import pdfplumber
    def sayfa_metinleri(yol):
        with pdfplumber.open(yol) as pdf:
            return [(s.extract_text() or "") for s in pdf.pages]
    PDF_MOTORU = "pdfplumber"

# --- Yardımcılar ----------------------------------------------------
def norm(s: str) -> str:
    return unicodedata.normalize("NFKC", s or "")

def cumleleri_al(metin, adet=3):
    c = re.split(r'(?<=[.!?])\s+', metin.strip())
    return " ".join(c[:adet])[:600]

UNITE_PAT = re.compile(
    r'(?im)^\s*(?:([0-9]+)\s*\.\s*ÜNİTE|ÜNİTE\s*[:.\-]?\s*([0-9IVXLCDM]+)|([IVXLCDM]+)\s*\.\s*ÜNİTE)'
)
SIK_PAT = re.compile(r'(?m)^\s*([A-E])\s*[)\].:-]\s*(.+?)\s*$')
SORU_BASI = re.compile(r'(?m)^\s*([0-9]{1,2})\s*[.)-]\s+(\S.*)$')

def unite_no_bul(m1, m2, m3):
    ham = m1 or m2 or m3 or ""
    ham = ham.upper().strip()
    if ham.isdigit():
        return int(ham)
    romen = {"I":1,"II":2,"III":3,"IV":4,"V":5,"VI":6,"VII":7,"VIII":8,
             "IX":9,"X":10,"XI":11,"XII":12}
    return romen.get(ham, 0)

def unite_bol(metin):
    """PDF metnini ünite bloklarına ayırır -> [(no, baslik, govde)]"""
    eslesmeler = list(UNITE_PAT.finditer(metin))
    bloklar = []
    for i, e in enumerate(eslesmeler):
        no = unite_no_bul(e.group(1), e.group(2), e.group(3))
        basla = e.end()
        bitis = eslesmeler[i+1].start() if i+1 < len(eslesmeler) else len(metin)
        govde = metin[basla:bitis]
        ilk_satir = govde.strip().splitlines()
        baslik = ""
        for sat in ilk_satir[:5]:
            s = sat.strip()
            if 4 < len(s) < 90 and not s.isupper() is False or True:
                baslik = s
                break
        bloklar.append((no, baslik, govde))
    if not bloklar and len(metin.strip()) > 100:
        bloklar.append((1, "Genel Tekrar", metin))
    return bloklar

def sorulari_parcala(govde):
    """Ünite sonu değerlendirme sorularını şıklarıyla ayıklar."""
    sorular = []
    # Soru numarasıyla başlayan blokları bul
    isaretler = list(SORU_BASI.finditer(govde))
    for i, m in enumerate(isaretler):
        no = int(m.group(1))
        basla = m.start()
        bitis = isaretler[i+1].start() if i+1 < len(isaretler) else len(govde)
        blok = govde[basla:bitis]
        siklar = list(SIK_PAT.finditer(blok))
        if len(siklar) < 2:
            continue  # şıksız satır -> numaralı liste maddesi olabilir
        s = {"no": no, "soru": "", "A": "", "B": "", "C": "", "D": "",
             "dogru": "", "aciklama": ""}
        s["soru"] = blok[siklar[0].start():].split(siklar[0].group(0))[0].strip()
        s["soru"] = (m.group(2) + " " + s["soru"]).strip()[:500]
        onceki_son = None
        for j, sk in enumerate(siklar):
            harf, icerik = sk.group(1), sk.group(2).strip()
            if harf in ("A", "B", "C", "D"):
                sonraki = siklar[j+1].start() if j+1 < len(siklar) else len(blok)
                s[harf] = blok[sk.end():sonraki].strip().replace("\n", " ")[:300]
        if s["A"] and s["B"]:
            sorular.append(s)
    return sorular

def cevap_anahtari_bul(govde):
    """'CEVAP ANAHTARI' bölümünden numara->harf eşlemesi"""
    anahtar = {}
    m = re.search(r'CEVAP\s*ANAHTARI(.*?)(?:\Z|KAYNAKÇA|DİZİN)', govde, re.I | re.S)
    if not m:
        return anahtar
    bolum = m.group(1)
    for sat in bolum.splitlines():
        for a, b in re.findall(r'([0-9]{1,2})\s*[.)-]?\s*([A-E])', sat):
            anahtar[int(a)] = b
    return anahtar

def ozet_cikar(govde, soru_baslangici):
    konu = govde[:soru_baslangici] if soru_baslangici > 200 else govde
    konu = re.sub(r'\s+', ' ', konu)
    return cumleleri_al(konu, 3)

def pdf_isle(yol):
    ad = os.path.splitext(os.path.basename(yol))[0]
    sayfalar = sayfa_metinleri(yol)
    metin = norm("\n".join(sayfalar))
    if len(metin.strip()) < 200:
        print(f"  ! UYARI: {ad}.pdf neredeyse metin içermiyor "
              f"(taranmış PDF?). Atlanıyor.")
        return None
    uniteler = []
    for no, baslik, govde in unite_bol(metin):
        govde = govde.strip()
        # Değerlendirme soruları genelde ünite sonundadır
        degerlendirme = re.search(
            r'(ÜNİTE\s*SONU\s*DEĞERLENDİRME|DEĞERLENDİRME\s*SORULARI|ÖLÇME\s*VE\s*DEĞERLENDİRME)',
            govde, re.I)
        sorular = sorulari_parcala(govde[degerlendirme.start():] if degerlendirme else govde)
        anahtar = cevap_anahtari_bul(govde)
        for sq in sorular:
            if sq["no"] in anahtar:
                sq["dogru"] = anahtar[sq["no"]]
            if not sq["aciklama"]:
                sq["aciklama"] = ("Doğru cevap: " + sq["dogru"]) if sq["dogru"] \
                    else "Bu sorunun açıklaması kitapta yer almıyor."
        uniteler.append({
            "no": no,
            "baslik": baslik or f"{no}. Ünite",
            "ozet": ozet_cikar(govde, degerlendirme.start() if degerlendirme else -1),
            "icerik": re.sub(r'\n{3,}', '\n\n', govde)[:60000],
            "soru_sayisi": len(sorular),
            "sorular": sorular,
        })
    uniteler.sort(key=lambda u: u["no"])
    return {"id": ad.lower().replace(" ", "_"),
            "ad": ad.replace("_", " ").title(),
            "dosya": os.path.basename(yol),
            "uniteler": uniteler}

def main():
    os.makedirs(os.path.dirname(CIKTI), exist_ok=True)
    pdfs = sorted(f for f in os.listdir(PDF_KLASOR) if f.lower().endswith(".pdf"))
    if not pdfs:
        sys.exit(f"HATA: {PDF_KLASOR} içinde PDF bulunamadı.")
    dersler = []
    for p in pdfs:
        yol = os.path.join(PDF_KLASOR, p)
        print(f"İşleniyor: {p}  (motor: {PDF_MOTORU})")
        d = pdf_isle(yol)
        if d:
            toplam_soru = sum(u["soru_sayisi"] for u in d["uniteler"])
            print(f"  -> {len(d['uniteler'])} ünite, {toplam_soru} soru ayıklandı.")
            dersler.append(d)
    with open(CIKTI, "w", encoding="utf-8") as f:
        json.dump({"dersler": dersler}, f, ensure_ascii=False, indent=2)
    print(f"\nTamamlandı: {CIKTI}")

if __name__ == "__main__":
    main()
