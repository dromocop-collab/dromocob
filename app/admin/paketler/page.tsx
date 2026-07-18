import CollectionManager from "@/components/admin/collection-manager";

export default function AdminPackagesPage() {
  return (
    <CollectionManager
      collectionName="packages"
      title="Paketler"
      fields={[
        {
          key: "image",
          label: "Paket kapak görseli",
          type: "image",
          fullWidth: true,
          helpText:
            "Web sitesinde paket kartında kullanılacak ana görsel.",
        },

        {
          key: "promoVideo",
          label: "Tanıtım videosu",
          type: "video",
          fullWidth: true,
          helpText:
            "Opsiyonel paket tanıtım videosu.",
        },

        {
          key: "title",
          label: "Paket adı",
          placeholder:
            "Kurumsal Web Pro",
        },

        {
          key: "subtitle",
          label: "Alt başlık",
          placeholder:
            "Markanı dijitalde güçlü konumlandır.",
        },

        {
          key: "priceFrom",
          label: "Başlangıç fiyatı",
          type: "number",
          placeholder: "25000",
        },

        {
          key: "badge",
          label: "Rozet",
          placeholder:
            "En çok tercih edilen",
        },

        {
          key: "theme",
          label: "Kart teması",
          type: "theme",
          helpText:
            "Marka sunumuna uygun premium kart görünümünü seç.",
        },

        {
          key: "description",
          label: "Açıklama",
          type: "textarea",
          fullWidth: true,
          placeholder:
            "Paketin kimler için uygun olduğunu ayrıntılı anlat.",
        },

        {
          key: "deliveryTime",
          label: "Teslim süresi",
          placeholder:
            "2-4 hafta",
        },

        {
          key: "supportWindow",
          label: "Destek penceresi",
          placeholder:
            "60 gün",
        },

        {
          key: "maxRevision",
          label: "Maksimum revizyon",
          type: "number",
          placeholder: "3",
        },

        {
          key: "guarantee",
          label: "Güvence notu",
          type: "textarea",
          fullWidth: true,
          placeholder:
            "İlk 30 gün performans takibi ve teknik optimizasyon desteği.",
        },

        {
          key: "features",
          label: "Paket özellikleri",
          type: "array",
          fullWidth: true,
          helpText:
            "Her satıra tek bir paket özelliği yaz.",
          placeholder:
            "Özel arayüz tasarımı\nMobil uyumlu yapı\nSEO altyapısı\nAdmin paneli",
        },

        {
          key: "idealFor",
          label: "İdeal müşteri segmenti",
          type: "array",
          fullWidth: true,
          helpText:
            "Her satıra tek bir hedef segment yaz.",
          placeholder:
            "Yeni marka\nE-ticaret markası\nB2B kurumsal firma",
        },

        {
          key: "kpiFocus",
          label: "Odak KPI'lar",
          type: "array",
          fullWidth: true,
          helpText:
            "Paketin optimize ettiği KPI metriklerini satır satır yaz.",
          placeholder:
            "Lead sayısı\nDönüşüm oranı\nMüşteri başına gelir",
        },

        {
          key: "cta",
          label: "Buton metni",
          placeholder:
            "Teklif al",
        },

        {
          key: "order",
          label: "Sıralama",
          type: "number",
          placeholder: "1",
        },

        {
          key: "featured",
          label: "Öne çıkar",
          type: "boolean",
        },

        {
          key: "active",
          label: "Yayın durumu",
          type: "boolean",
        },
      ]}
    />
  );
}
