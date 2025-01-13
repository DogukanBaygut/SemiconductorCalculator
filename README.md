# PN Junction Simulator

Bu proje, yarıiletken PN junction'ın fiziksel özelliklerini ve davranışlarını simüle eden interaktif bir web uygulamasıdır.

## Özellikler

### 1. Temel Hesaplamalar
- Taşıyıcı yoğunluğu (elektron ve boşluk)
- İletkenlik
- Built-in potansiyel
- Depletion bölgesi genişliği

### 2. Grafiksel Gösterimler
- Band diyagramı
  - İletim bandı (Ec)
  - Valans bandı (Ev)
  - Fermi seviyesi (Ef)
  - Quasi-Fermi seviyeleri (forward/reverse bias durumunda)

- Elektrik alan dağılımı
- Yük yoğunluğu dağılımı
- Potansiyel dağılımı

### 3. Ayarlanabilir Parametreler
- Yarıiletken malzeme seçimi (Si, Ge, GaAs)
- Sıcaklık
- Donör konsantrasyonu (Nd)
- Akseptör konsantrasyonu (Na)
- Elektron ve boşluk mobilitesi
- Bias voltajı

## Kullanım

1. Yarıiletken malzemeyi seçin
2. İstediğiniz parametreleri girin
3. Bias voltajını ayarlayın
4. "Hesapla" butonuna tıklayın
5. Sonuçları ve grafikleri inceleyin

## Teknik Detaylar

### Kullanılan Teknolojiler
- HTML5
- CSS3
- JavaScript
- Chart.js (grafik çizimi için)

### Hesaplanan Fiziksel Parametreler
- Built-in potansiyel (Vbi)
- Depletion bölgesi genişliği (W)
- Elektrik alan dağılımı (E)
- Yük yoğunluğu dağılımı (ρ)
- Potansiyel dağılımı (V)
- Taşıyıcı yoğunlukları (n, p)
- İletkenlik (σ)

### Formüller ve Hesaplamalar
- Built-in potansiyel: Vbi = (kT/q)ln(NaNd/ni²)
- Depletion genişliği: W = √(2ε(Na+Nd)Vbi/qNaNd)
- Elektrik alan: E = (qNd/ε)x
- Yük yoğunluğu: ρ = qNd (n-bölgesi), -qNa (p-bölgesi)
- İletkenlik: σ = q(nμn + pμp)

## Veri Dışa Aktarma
- Hesaplanan değerler JSON formatında dışa aktarılabilir
- Grafikler ve sonuçlar kaydedilebilir

## Geliştirici Notları
- Tüm hesaplamalar gerçek fiziksel sabitleri kullanır
- Sıcaklık bağımlı hesaplamalar dahil edilmiştir
- Bias voltajının etkisi tüm parametrelerde hesaba katılmıştır

## Lisans
MIT License

## İletişim
[İletişim bilgileriniz] 