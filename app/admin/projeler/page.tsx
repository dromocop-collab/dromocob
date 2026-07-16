import CollectionManager from "@/components/admin/collection-manager";

export default function AdminProjectsPage() {
  return (
    <CollectionManager
      collectionName="projects"
      title="Projeler"
      fields={[
        {
          key: "coverImage",
          label: "Proje kapak görseli",
          type: "image",
          fullWidth: true,
          helpText:
            "Portföy kartında gösterilecek ana görsel.",
        },

        {
          key: "showreel",
          label: "Proje videosu",
          type: "video",
          fullWidth: true,
          helpText:
            "Projenin reel veya tanıtım videosu.",
        },

        {
          key: "title",
          label: "Proje adı",
          placeholder:
            "AKC Oto Kılıf",
        },

        {
          key: "category",
          label: "Kategori",
          placeholder:
            "Web Development",
        },

        {
          key: "subtitle",
          label: "Kısa açıklama",
          placeholder:
            "Otomotiv sektörüne özel dijital deneyim.",
        },

        {
          key: "description",
          label: "Proje hikayesi",
          type: "textarea",
          fullWidth: true,
        },

        {
          key: "services",
          label: "Verilen hizmetler",
          type: "array",
          fullWidth: true,
          placeholder:
            "Web tasarım\nFrontend geliştirme\nFirebase\nSEO",
        },

        {
          key: "client",
          label: "Müşteri",
        },

        {
          key: "year",
          label: "Yıl",
          type: "number",
        },

        {
          key: "projectUrl",
          label: "Proje bağlantısı",
          placeholder:
            "https://...",
        },

        {
          key: "order",
          label: "Sıralama",
          type: "number",
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