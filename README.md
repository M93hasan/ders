# AÖL Ödevim — Açık Öğretim Lisesi Ödev & Test Uygulaması

> **GitHub Deposu:** https://github.com/M93hasan/ders
> Sorun bildirimi, öneri ve katkı için pull request açabilirsiniz.

PDF ders kitaplarını interaktif ödev ve test uygulamasına dönüştüren,
internetsiz çalışan React Native (Expo) Android uygulaması.

## 1. Kurulum

AOL'de 4 sinif vardir (1=9.sinif ... 4=12.sinif). 34 resmi ders desteklenir:
AKAID, Almanca, Biyoloji, Cografya, Cagdas Turk ve Dunya Tarihi, Demokrasi ve
Insan Haklari, Din Kulturu, Dinler Tarihi, Ekonomi, Felsefe, Fikih, Fizik,
Fransizca, Girisimcilik, Ingilizce, Islam Kultur ve Medeniyeti, Isletme, Kelam,
Kimya, Mantik, Matematik, Mesleki Gelisim Atolyesi, Osmanli Turkcesi,
Peygamberimizin Hayati, Psikoloji, Saglik Bilgisi, Sanat Tarihi, Ortak Turk
Tarihi, Siyer, Sosyoloji, Tarih, Temel Dini Bilgiler, Turk Dili ve Edebiyati,
Inkılap Tarihi ve Ataturkculuk.
Tam katalog: src/dersKatalogu.js


```bash
# Python tarafı (PDF -> JSON)
pip install pymupdf

# Mobil uygulama
npm install
```

## 2. Kullanım Adımları

```bash
# Adım 1: PDF'leri klasöre koy
cp "Tarih 1.pdf" pdf_kitaplar/tarih_1.pdf

# Adım 2: JSON'a dönüştür
python tools/pdf_to_json.py

# Adım 3 (test): Örnek PDF üretip dönüştürmeyi dene
python tools/ornek_pdf_uret.py
python tools/pdf_to_json.py

# Adım 4: Uygulamayı çalıştır
npx expo start
```

## 3. APK Oluşturma

```bash
npm install -g eas-cli
eas login
npx eas build --platform android --profile apk
# Çıkan .apk dosyasını telefona kur
```

## Dosya Yapısı

```
aol_odev_uygulamasi/
├── pdf_kitaplar/          # MEB PDF kitapları buraya
├── tools/
│   ├── pdf_to_json.py     # PDF -> data/dersler.json
│   └── ornek_pdf_uret.py  # Test PDF'i üretir
├── data/dersler.json      # Üretilen veri (uygulama buradan okur)
├── src/
│   ├── depo.js            # AsyncStorage yardımcıları
│   ├── Konfeti.js         # Konfeti animasyonu
│   ├── ortak.js           # Renk & stiller
│   └── ekranlar/
│       ├── AnaSayfa.js    # Dashboard: ilerleme, rozetler, dersler
│       ├── GunlukOdev.js  # Günün görevi + konfeti
│       ├── KitapOkuyucu.js# Reflowable okuyucu, özet, gece modu
│       ├── TestModulu.js  # Şıklı testler, anında geri bildirim
│       └── YanlisKutusu.js# Zayıf noktalar tekrar kutusu
├── App.js                 # Kök bileşen + alt menü
└── package.json
```

## Önemli Not

- MEB PDF'leri baskıya göre farklı biçimde olabilir; `pdf_to_json.py`
  içindeki düzenli ifadeler (UNITE_PAT, SIK_PAT) gerektiğinde ayarlanmalıdır.
- Taranmış (görüntü) PDF'lerde metin yoktur; OCR (Tesseract) gerekir.
- data/dersler.json uygulamaya **gömülü** gelir (require ile okunur),
  bu yüzden tamamen çevrimdışı çalışır.
