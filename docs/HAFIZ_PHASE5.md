# Hafız Phase 5 backend

Phase 5, öğrencinin yayınlanmış assignment snapshot'ına bağlı çalışma
durumunu ve güvenli ilerleme mutasyonlarını ekler.

## Güvenlik modeli

- Her istek aktif `STUDENT` membership ve institution kapsamıyla çalışır.
- Recipient kimliği sunucuda `assignmentId_studentMembershipId` olarak türetilir;
  istemcinin gönderdiği öğrenci kimliğine güvenilmez.
- Step state transition'ı sunucuda doğrulanır. `LOCKED` veya teacher-controlled
  bir adım istemci tarafından tamamlanamaz.
- Page context, assignment revision'ındaki exact Quran scope'a yeniden göre kontrol edilir.
- Progress event'leri idempotent `clientEventId` ile append-only kaydedilir.
- Doğrudan Firestore ve private audio Storage erişimi rules tarafından kapalıdır.

## Durum semantiği

Öğrenciye ait zorunlu adımlar tamamlandığında recipient
`STUDENT_WORK_COMPLETE` olur. `TEACHER_APPROVED` üretilmez; teacher-controlled
adımlar `AWAITING_REVIEW` kalır. Sequential ve non-sequential akışlar aynı
saf state machine tarafından yönetilir.

## Veri ve API

- `GET /api/hafiz/student/today`
- `GET /api/hafiz/student/assignments/:assignmentId`
- `POST /api/hafiz/student/assignments/:assignmentId/progress`
- `POST /api/hafiz/student/assignments/:assignmentId/help`
- `POST /api/hafiz/student/assignments/:assignmentId/difficulty`
- `POST /api/hafiz/student/assignments/:assignmentId/audio-submission`

Audio dosyası private bucket yoluna alınır; metadata `scanStatus: PENDING`
olarak kaydedilir. Zararlı içerik taraması, playback yetkilendirmesi ve öğretmen
review kuyruğu Phase 6 kapsamında tamamlanacaktır.
