# Hafız Phase 4 backend

Phase 4 öğretmen görev taslağı, doğrulanmış Kur'an kapsamı, versioned workflow snapshot,
yetkili toplu sınıf gönderimi ve güvenli yayınlama API'lerini ekler.

Koleksiyonlar:

- `hafiz_assignments`: kararlı kök ve yaşam döngüsü
- `hafiz_assignment_revisions`: yayınlandıktan sonra immutable snapshot
- `hafiz_assignment_recipients`: öğrencinin sabit atanmış revizyonu
- `hafiz_assignment_quran_grants`: assignment + revision + öğrenci kapsamlı exact grant

Doğrudan Firestore erişimi rules ile kapalıdır. Öğretmen hedefleri aktif tenant ilişkilerinden,
Kur'an kapsamı onaylı katalogdan sunucu tarafında çözülür. Yayınlanan bir revizyon overwrite
edilmez ve mevcut recipient yeni revizyona sessizce taşınmaz.

Bu faz öğrenci progress transition, audio submission veya review mutation'larını içermez.
