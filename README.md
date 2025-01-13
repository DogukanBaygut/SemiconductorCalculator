# Yarı İletken Hesaplayıcı ve Simülatör

Bu proje, yarı iletken malzemelerin özelliklerini hesaplamak ve çeşitli elektronik devreleri simüle etmek için geliştirilmiş bir web uygulamasıdır.

## Özellikler

### Ana Hesaplayıcı
- Yarı iletken malzeme parametrelerinin hesaplanması
- Bant yapısı ve enerji seviyelerinin 3D görselleştirmesi
- Sıcaklık ve katkılama etkilerinin analizi
- İnteraktif parametre ayarlama

### LED Simülasyonu
- Farklı LED tiplerinin (Kırmızı, Yeşil, Mavi, Beyaz) simülasyonu
- İleri voltaj ve akım hesaplamaları
- Güç tüketimi ve verimlilik analizi
- Gerçek zamanlı LED parlaklık gösterimi
- I-V karakteristik eğrisi
- Güç-Voltaj grafiği

### Devre Simülasyonu
- Çeşitli devre tiplerinin analizi:
  - Diyot devreleri
  - Köprü doğrultucu
  - Gerilim regülatörü
  - Yükselteç
  - Anahtarlama devreleri
- Dalga şekli analizi
- Verimlilik ve güç hesaplamaları
- Dalgalanma ve regülasyon analizi

## Hesaplanan Fiziksel Parametreler ve Formüller

### Yarı İletken Hesaplamaları
- Built-in potansiyel: Vbi = (kT/q)ln(NaNd/ni²)
- Depletion genişliği: W = √(2ε(Na+Nd)Vbi/qNaNd)
- Elektrik alan: E = (qNd/ε)x
- Yük yoğunluğu: ρ = qNd (n-bölgesi), -qNa (p-bölgesi)
- İletkenlik: σ = q(nμn + pμp)

### LED Hesaplamaları
- İleri akım: IF = IS(e^(VF/VT) - 1)
- Güç tüketimi: P = VF × IF
- Verimlilik: η = (Poptik/Pelektrik) × 100
- Işık şiddeti: Iv = IF × η × K (K: LED'e özgü sabit)

### Devre Hesaplamaları
- Diyot düşümü: VD = VF + IFRD
- Dalgalanma gerilimi: Vr = Ip/(2fC)
- Regülasyon: R = ((VNL - VFL)/VFL) × 100
- Verimlilik: η = (Pçıkış/Pgiriş) × 100
- Güç kaybı: PD = VIN × IIN - VOUT × IOUT

### Kullanılan Sabitler
- Boltzmann sabiti (k): 1.380649 × 10^-23 J/K
- Elektronik yük (q): 1.602176634 × 10^-19 C
- Mutlak sıcaklık (T): 300K (varsayılan)
- Silisyum için ni: 1.5 × 10^10 cm^-3
- Vakum dielektrik sabiti (ε0): 8.854 × 10^-14 F/cm

## Teknik Özellikler
- Dinamik tema değiştirme (Açık/Koyu)
- Çoklu dil desteği (Türkçe/İngilizce)
- Responsive tasarım
- İnteraktif grafikler ve görselleştirmeler
- Gerçek zamanlı hesaplamalar

## Kullanılan Teknolojiler
- HTML5
- CSS3
- JavaScript
- Three.js (3D görselleştirme)
- Chart.js (Grafik çizimi)

## Kurulum
1. Projeyi klonlayın
2. İndex.html dosyasını bir web tarayıcısında açın
3. Herhangi bir ek kurulum gerekmez

## Geliştirme Planı
- [ ] Yeni devre tipleri ekleme
- [ ] PCB tasarım aracı
- [ ] Komponent veritabanı
- [ ] Simülasyon sonuçlarını dışa aktarma
- [ ] Eğitim modülü ve örnekler

## Lisans
Bu proje MIT lisansı altında lisanslanmıştır.

## Proje Sahibi
Doğukan Avcı

## Son Güncelleme
27.03.2024 