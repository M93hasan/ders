#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test amaçlı örnek AÖL tarzı PDF üretir (reportlab gerekli)."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Klasor = os.path.join(KOK, "pdf_kitaplar")
os.makedirs(Klasor, exist_ok=True)

# Türkçe karakter destekli TTF font kaydet
for ad, yol in [
    ("UniFont", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ("UniFont", "/usr/share/fonts/truetype/freefont/FreeSans.ttf"),
]:
    if os.path.exists(yol):
        try:
            pdfmetrics.registerFont(TTFont("UniFont", yol))
            break
        except Exception:
            pass
FONT = "UniFont" if "UniFont" in pdfmetrics.getRegisteredFontNames() else "Helvetica"

icerik = [
    ("TARİH_1.PDF", "TARİH 1", [
        (1, "Tarihin Konusu ve Kaynakları", [
            "Tarih, insanlık tarihini inceler. Tarih olayları neden-sonuç ilişkisi içinde inceler.",
            "İlk ve orta çağlarda tarih yazıcılığı gelişti. Herodot tarihin babası sayılır.",
            "Tarih kaynakları; yazılı kaynaklar, sözlü kaynaklar ve arkeolojik kaynaklardır.",
            "Tarih bilimi toplumların kimliğini korumasına yardımcı olur."],
         [("Tarih biliminin temel kaynakları aşağıdakilerden hangisi değildir?",
           ["Yazılı kaynaklar", "Sözlü kaynaklar", "Rüya tabirleri", "Arkeolojik kaynaklar"], "C"),
          ("Herodot hangi alanda bilinen ilk yazarlardandır?",
           ["Felsefe", "Tarih", "Astronomi", "Tıp"], "B"),
          ("Tarih olayları hangi ilişki içinde inceler?",
           ["Neden-sonuç", "Rastgele", "Sadece kronolojik", "Sadece ekonomik"], "A"),
          ("Arkeolojik kaynaklara örnek olarak hangisi verilebilir?",
           ["Destan", "Kitabe", "Mektup", "Anı"], "B")]),
        (2, "İslamiyet Öncesi Türk Tarihi", [
            "Türklerin ilk yerleşim bölgeleri Orta Asya'dır. Orhun yazıtları önemli kaynaklardır.",
            "Göktürkler, Uygurlar ve Karahanlılar Türk tarihinin önemli devletleridir.",
            "İslamiyet öncesi Türklerde göçebe hayat tarzı hüküm sürmüştür."],
         [("Orhun yazıtları hangi döneme aittir?",
           ["Göktürk", "Selçuklu", "Osmanlı", "Cumhuriyet"], "A"),
          ("Türklerin ilk yerleşim bölgesi neresidir?",
           ["Anadolu", "Orta Asya", "Kırım", "Hindistan"], "B")]),
    ]),
    ("EDEBİYAT_1.PDF", "EDEBİYAT 1", [
        (1, "Edebiyat ve Toplum", [
            "Edebiyat toplumun aynasıdır. Dil ve anlatım edebiyatın temel ögeleridir.",
            "Divan edebiyatı halk edebiyatından farklı özellikler taşır."],
         [("Edebiyat toplumun ne olarak nitelenir?",
           ["Aynası", "Arşivi", "Haritası", "Defteri"], "A"),
          ("Divan edebiyatının dili hangisidir?",
           ["Halk dili", "Ağır Osmanlı Türkçesi", "Arapça karma", "Basit Türkçe"], "B")]),
    ]),
]

for dosya, ders, uniteler in icerik:
    c = canvas.Canvas(os.path.join(Klasor, dosya), pagesize=A4)
    c.setFont(FONT, 10)
    g = c.beginText(50, 800)
    g.setFont(FONT, 10)
    for no, baslik, paragraflar, sorular in uniteler:
        g.textLine(f"{no}. ÜNİTE: {baslik}")
        g.textLine("")
        for p_ in paragraflar:
            for sat in [p_[i:i+85] for i in range(0, len(p_), 85)]:
                g.textLine(sat)
            g.textLine("")
        g.textLine("ÜNİTE SONU DEĞERLENDİRME SORULARI")
        for i, (soru, siklar, dogru) in enumerate(sorular, 1):
            g.textLine(f"{i}. {soru}")
            for h, sik in zip("ABCD", siklar):
                g.textLine(f"{h}) {sik}")
            g.textLine("")
        g.textLine("CEVAP ANAHTARI")
        g.textLine("  ".join(f"{i}) {d_}" for i, (_, _, d_) in enumerate(sorular, 1)))
        g.textLine("")
    c.drawText(g)
    c.showPage()
    c.save()
    print("Üretildi:", dosya)
