# Hafız Kur'an Veri Kümesi Kaynak ve Import Politikası

## Kesin kural

Production veritabanına doğrulanmamış, kaynağı belirsiz, lisansı eksik veya checksum'ı eşleşmeyen
Kur'an metni aktarılamaz. Repository'ye production metni veya örnek olarak üretilmiş ayet metni
eklenmez.

## Onay ön koşulları

Her edition aşağıdaki kanıtları taşımalıdır:

- yayıncı/sağlayıcı adı ve HTTPS kaynak adresi,
- açık kullanım/lisans bilgisi,
- kaynak veri sürümü,
- metni doğrulayan yetkili kurum veya kurul,
- ISO biçimli doğrulama tarihi,
- kurum içi onay/ticket referansı,
- canonical JSON üzerinden hesaplanan SHA-256 `contentChecksum`.

Dataset sahipliği ve lisansın mobil uygulamada yeniden dağıtıma izin verdiği hukuk/ürün sahibi
tarafından ayrıca teyit edilmelidir. Yazılım doğrulaması dini/metinsel onayın yerine geçmez.

## Şema

Kök alanları `schemaVersion: 1`, `edition`, `juzs[]`, `surahs[]`, `pages[]` ve `ayahs[]` şeklindedir.
Canonical ayet kimliği `surahNumber:ayahNumber` biçimindedir. Sayfa kayıtları ayet kimliklerini;
ayetler sure, cüz ve sayfa numaralarını taşır. Edition kimliği sürümler arasında yeniden
kullanılmamalıdır.

## Yerel doğrulama

Onaylı Tanzil Uthmani kaynağından üretim artefaktı hazırlamak için:

```bash
HAFIZ_QURAN_APPROVAL_REFERENCE="kurum-ici-onay-referansi" \
  npm run quran:build:tanzil -- /absolute/path/tanzil-uthmani.json
```

Bu komut metni Tanzil'in resmi indirme adresinden, 604 sayfalık Medine Mushafı yapısal
metadata'sını Tanzil'in resmi metadata adresinden indirir. Uthmani 1.1 ve metadata 1.0 sürüm
işaretlerini, 6.236 ayet / 114 sure / 30 cüz / 604 sayfa bütünlüğünü denetler; metni değiştirmeden
canonical şemaya dönüştürür ve checksum'u hesaplar. Üretilen dosya repository'ye eklenmemeli,
değiştirilemez bir release artefaktı olarak saklanmalıdır.

Kaynak metin Tanzil Project tarafından CC BY 3.0 ile sunulur. Uygulama ve dağıtılan artefakt,
Tanzil atfını ve `https://tanzil.net` bağlantısını görünür biçimde korumalı; metin değiştirilemez.

Önce checksum hesaplanır:

```bash
npm run quran:validate -- /absolute/path/approved-dataset.json --checksum-only
```

Hesaplanan değer `edition.contentChecksum` alanına yetkili veri hazırlayıcı tarafından yazıldıktan
sonra tam doğrulama çalıştırılır:

```bash
npm run quran:validate -- /absolute/path/approved-dataset.json
```

Doğrulayıcı şunları denetler:

- tekrar eden veya eksik sayfa, sure, cüz ve ayet kimlikleri,
- sayfa numaralarının kesintisiz olması,
- sure ayet sayıları ve ayet sıraları,
- sure/cüz başlangıç ve bitiş sayfaları,
- sayfa–ayet–cüz çapraz referansları,
- her ayetin tam bir sayfada yer alması,
- kaynak/onay metadatası ve SHA-256 checksum.

## Production import

1. Kaynak ve lisans kanıtları bağımsız olarak incelenir.
2. Yerel doğrulama başarılı tamamlanır.
3. Platform yöneticisi iOS yönetim ekranından aynı JSON'u sunucuya doğrulatır.
4. Sunucu raporu hatasızsa import eylemi açılır.
5. Import sırasında edition `IMPORTING` durumundadır ve katalogda görünmez.
6. Tüm cüz, sure, sayfa ve ayet yazımları tamamlanınca edition `ACTIVE` olur ve audit olayı yazılır.
7. Kısmi hata durumunda edition `FAILED` kalır; hiçbir öğretmen veya öğrenci içeriği okuyamaz.

Import öncesi ve sonrası kaynak dosyası, checksum, onay kaydı ve doğrulama raporu değiştirilemez
bir release artefaktı olarak saklanmalıdır.

## Görev kıraati

`LISTEN` adımında öğretmen ayrıca ses yüklemez. Sunucu, öğrencinin yetkili görev çözümleyicisinden
çıkan sıralı canonical ayet kimliklerini Mishari Rashid al-Afasy kıraat yollarına dönüştürür ve
yalnızca aynı assignment-scoped yanıtta döndürür. Ses dosyaları Quran Foundation'ın
`https://verses.quran.foundation/Alafasy/mp3/` CDN alanından yayınlanır. İstemciye bağımsız ayet,
sayfa veya sure için genel bir ses tarama endpoint'i verilmez; görev kapsamı dışındaki ayetler ses
listesine giremez. Sağlayıcı veya kıraat değişikliği yayınlanmadan önce kaynak sürekliliği, kullanım
koşulları ve örnek dosya bütünlüğü yeniden doğrulanmalıdır.

### Kendi lisanslı kıraat arşivini kullanma

Sesleri ayet başına MP3 olarak HTTPS üzerinden yayınlanan bir klasöre yükleyin. Dosya adı üç
haneli sure ve üç haneli ayet numarasının birleşimidir: Fâtiha 1 `001001.mp3`, Bakara 255
`002255.mp3`. Ardından production ortamında `HAFIZ_QURAN_AUDIO_BASE_URL` değişkenini MP3
klasörünün kök adresine ayarlayın ve servisi yeniden yayınlayın. Uygulama görev kapsamındaki
ayetlerin adreslerini bu kökten otomatik üretir; öğretmenin her görev için ayrıca ses seçmesi
gerekmez. Yalnızca yayınlama ve uygulama içinde kullanma hakkınız bulunan kayıtları kullanın.
