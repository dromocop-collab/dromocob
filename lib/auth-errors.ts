export function authMessage(code?: string) {
  const m: Record<string,string> = {
    "auth/email-already-in-use":"Bu e-posta zaten kayıtlı.",
    "auth/invalid-email":"Geçerli bir e-posta gir.",
    "auth/weak-password":"Şifren daha güçlü olmalı.",
    "auth/invalid-credential":"E-posta veya şifre hatalı.",
    "auth/too-many-requests":"Çok fazla deneme yapıldı. Biraz sonra tekrar dene.",
    "auth/network-request-failed":"İnternet bağlantısını kontrol et."
  };
  return m[code || ""] || "İşlem tamamlanamadı.";
}
