# Hafız Phase 2 — Kurumsal İlişki Katmanı

Hafız istemcisi için kurum, profil, sınıf ve ilişki verileri yalnızca Firebase Admin kullanan
`/api/hafiz/*` rotalarından sunulur. Firestore istemci kuralları ilgili koleksiyonları tamamen
kapatır.

## Güvenlik sınırı

- `requireHafizContext` her istekte iptal kontrolü yapılmış Firebase token, aktif kullanıcı,
  üyelik ve kurum verisini doğrular.
- Rol body/query içinden okunmaz.
- `requireInstitutionAccess` tenant sınırını zorunlu kılar; platformlar arası yönetim yalnızca
  `hafizPlatformAdmin` custom claim'i ile açılır.
- Öğretmen, veli ve öğrenci detay uçları ilişki politikasını sunucuda uygular ve yetkisiz kaydı
  `NOT_FOUND` ile gizler.
- Oluşturma, güncelleme ve ilişki durumu değişiklikleri `hafiz_audit_events` içine aktör ve kaynak
  kimliğiyle yazılır.

## Dağıtım gereksinimleri

Uygulama koduyla birlikte `firestore.indexes.json` ve `firestore.rules` dağıtılmalıdır. Backend
runtime'ında Firebase Admin kimlik bilgileri bulunmalıdır. Yeni oluşturulan Firebase kullanıcıları
için davet/parola belirleme e-postası operasyonel akışta ayrıca gönderilmelidir.
