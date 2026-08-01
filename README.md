# Dromocob Platform + License Cloud

Dromocob web sitesi, yönetim paneli ve bütün masaüstü uygulamalarının ortak lisans altyapısıdır. Lisans anahtarları Firestore'a açık metin olarak yazılmaz; SHA-256 özeti tutulur. Cihaza verilen çevrimdışı makbuzlar P-256 / ES256 ile imzalanır ve istemci tarafında doğrulanır.

## Modüller

- `/admin/lisanslar`: lisans oluşturma, askıya alma/iptal, cihaz ve aktivasyon akışı
- `/api/licenses/activate`: hesap + ürün + cihaz doğrulaması ve aktivasyon
- `/api/licenses/validate`: token yenileme ve çevrimdışı makbuz rotasyonu
- `/api/licenses/deactivate`: cihaz oturumunu kapatma
- `/api/licenses/apps`: ürün kataloğu, minimum sürüm ve makbuz açık anahtarı
- Firebase Functions: süre bitirme, aktivasyon kapatma, log saklama ve lisans e-posta kuyruğu
- PhotoResize macOS: Firebase hesap girişi, Keychain, trial, cihaz izi, imzalı receipt ve offline grace

## Yerel kurulum

Gereksinimler: Node.js 22, npm, Firebase CLI ve Xcode 17+.

```bash
cp .env.example .env.local
./scripts/generate-license-keys.sh
npm install
cd functions && npm install && cd ..
npm run dev
```

Anahtar üretiminden çıkan özel anahtarı yalnızca sunucu ortamındaki `DROMOCOB_LICENSE_PRIVATE_KEY` değişkenine, açık anahtarı `DROMOCOB_LICENSE_PUBLIC_KEY` değişkenine koyun. PEM satır sonlarını Vercel/Firebase değişkenlerinde `\\n` biçiminde saklayabilirsiniz. Özel anahtarı repoya veya macOS uygulamasına eklemeyin.

## Firebase

1. `.firebaserc` içindeki projeyi doğrulayın veya `firebase use <project-id>` çalıştırın.
2. Admin kullanıcılarının `users/{uid}.role` alanını `super_admin`, `admin`, `license_manager` veya `support` yapın.
3. Firestore e-posta kuyruğu için Firebase Trigger Email eklentisini `mail` koleksiyonuyla yapılandırın.
4. Kuralları, indexleri ve zamanlanmış fonksiyonları yayınlayın:

```bash
./scripts/deploy-license-cloud.sh
```

Scheduled Functions için Firebase projesinin Blaze planında olması gerekir.

## PhotoResize yapılandırması

Uygulama `pixel-resizer-pro` ürün kimliğini kullanır. Bundle ID: `com.cihat.photoResize`, minimum macOS: 14. Uygulamadaki `LicenseAPI.swift` içinde production alan adı ve Firebase Web API anahtarı tanımlıdır. App Store / dağıtım öncesinde:

- Release signing ve hardened runtime'ı açın.
- Network entitlement dışında gereksiz entitlement eklemeyin.
- `CFBundleShortVersionString` değerini `/api/licenses/apps` minimum/latest sürümleriyle eşleyin.
- Debug ve Release buildlerini, ardından imzalama/notarization akışını çalıştırın.

## Güvenlik modeli

- Lisans anahtarı yalnızca oluşturulduğu anda gösterilir.
- Sunucuda anahtar özeti, son karakterleri ve metadata saklanır.
- Aktivasyon Firebase ID token ile kullanıcıya bağlanır.
- Cihaz parmak izi SHA-256 ile anonimleştirilir.
- Receipt cihaz, kullanıcı, ürün ve son kullanma tarihine bağlıdır.
- Keychain verileri `ThisDeviceOnly` erişim sınıfıyla tutulur.
- Saat geri alma denetimi ve sınırlı offline grace bulunur.
- Firestore istemcilerinin lisans koleksiyonlarına doğrudan erişimi kapalıdır.

## Kalite kapıları

```bash
npm run lint
npm run build
cd functions && npm run build
xcodebuild -project photoResize.xcodeproj -scheme photoResize -configuration Release -destination 'platform=macOS' CODE_SIGNING_ALLOWED=NO build
```

Gerçek lisans aktivasyon uçtan uca testi için production ortam değişkenleri, yayınlanmış Firebase index/functions ve doğrulanmış admin rolü gerekir.
