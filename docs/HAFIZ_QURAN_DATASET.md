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
