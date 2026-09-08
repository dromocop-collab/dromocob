# Universal Content / Packs

Bağımsız v1 içerik yayın sistemi. Release Center'da UNIVERSAL CONTENT → Packs bölümünden paket oluşturulur. Her dosya ortak veya bir host'a özel seçilir. Hedefler: after-effects, premiere, final-cut, resolve. Preset/template klasörleri host'a uygun ZIP olarak eklenir; bu sürüm dosyaları uygulamalar arasında dönüştürmez veya host içine kurmaz.

## Akış

1. Bu yeni dosyaları normal web dağıtımıyla yayınlayın. İlk katalog boş olmalıdır: `public/downloads/ultra/packs/manifest.json`. Eski AE dosyalarını değiştirmeyin.
2. Release Center'da kimlik, ad, sürüm, hedefler ve dosyaları girin. İlk sürümde rollback alanları boş; sonraki sürümde canlı katalogdaki previousVersion ve manifestSHA256 değerlerini girin.
3. Paketi oluşturun; çıktı seçilen klasörün `universal-packs/{id}-{version}` altındadır. Çıktıların üzerine yazılmaz.
4. “Yayını doğrula” ile web repo klasörünü seçin. Şema ve dosya hash'leri ağ erişimi olmadan doğrulanır.
5. “GitHub’a yayınla” aynı çıktı için ayrı yayıncıyı çalıştırır. Ortamda `UNIVERSAL_PACKS_GITHUB_TOKEN` veya GitHub CLI oturumu gerekir. Token Keychain/secret manager üzerinden sağlanmalıdır; dosyaya veya komuta literal yazılmamalıdır.

Komut satırı alternatifi:

```sh
python3 scripts/universal-packs/publish.py --bundle /absolute/path/to/pack
python3 scripts/universal-packs/publish.py --bundle /absolute/path/to/pack --publish
```

## Namespace ve otomasyon

- Repository: dromocop-collab/dromocob, branch: main.
- Ayrı GitHub etiketi: `ultra-pack-{id}-v{version}`. AE `v{version}` etiketleri kullanılmaz; GitHub “latest release” işareti değiştirilmez.
- Yeni yayıncı: `scripts/universal-packs/publish.py`. Mevcut Swift AE push kodu/derleme scriptleri çağrılmaz.
- Payload'lar önce draft GitHub release'e yüklenir, release yayınlanır, public payload SHA-256 doğrulanır. Ancak bundan sonra katalog yazılır.
- `public/downloads/ultra/packs/releases/{id}/{version}/pack.json`: değişmez sürüm kaydı.
- `public/downloads/ultra/packs/history/{sha256}.json`: önceki kataloğun tam kopyası.
- `public/downloads/ultra/packs/manifest.json`: aktif katalog, revision ve previousRevisionSHA256.
- Git tree commit'i yalnızca bu namespace'teki dosyaları içerir. Main referansı force=false ile güncellenir; eşzamanlı AE commit'i üzerine yazılmaz.
- Web dağıtımı normal repo dağıtım mekanizmasına bağlıdır. Yerel dosyaların hazırlanması deploy anlamına gelmez.
- Ayrı admin API / Firestore koleksiyonu bu v1 için gerekmez; statik katalog tek veri kaynağıdır. Mevcut Request Center ve lisans backend'i aynen kalır.

## Geri dönüş ve hata kurtarma

Tek pack için daha önce yayımlanmış değişmez kaydı etkinleştirmek:

```sh
python3 scripts/universal-packs/publish.py --bundle /absolute/path/to/pack --publish --rollback 1.0.0
```

Bundle pack.json kimliği geri döndürülecek paketi belirler. Komut mevcut katalogdan diğer paketleri korur, önceki kataloğu history altında saklar. Rollback hedefinin sürüm kaydı bulunmalıdır. Önceden kullanılmış sürüm numarası yeni payload ile tekrar yayımlanamaz.

Yeni kaynak kodunu geri almak için yalnızca bu eklemenin dosyalarını ve ReleaseCenterView.swift içindeki Universal Content navigasyon eklemesini geri alın. AE pipeline'ına müdahale etmeyin. Tam yerel snapshot bu çalışmanın work/snapshots klasöründedir.

Upload/hash/commit başarısızlığında katalog etkinleştirilmez; kullanılmayan draft veya yayınlanmış pack release'i kalabilir. Aynı etiketle otomatik üzerine yazma yoktur. Hatanın nedenini giderin; catalogda etkin olmadığını doğrulayarak yalnızca ilgili `ultra-pack-*` etiketli başarısız release'i GitHub'dan temizleyin veya yeni sürümle yeniden oluşturun. Main güncelleme yanıtı bağlantı yüzünden belirsizse tekrar işlemden önce katalog ve commit'i okuyun. AE release'lerini silmeyin/değiştirmeyin.

## Test

```sh
python3 -m unittest discover -s scripts/universal-packs -p 'test_*.py' -v
node scripts/universal-packs/test-regression.cjs
```

Request Center testleri gerçek route kodunu mock Firestore/admin guard ile çalıştırır; canlı müşteri verisine yazmaz. Pack yayın testleri GitHub yazımını simüle eder. Canlı GitHub yayın/deploy testi ayrıca gerçek bir deneme paketi gerektirir.
