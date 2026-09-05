"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { auth } from "@/lib/firebase";

import {
  Activity,
  AppWindow,
  Ban,
  CheckCircle2,
  Copy,
  KeyRound,
  Laptop,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

// MARK: - Types

type LicenseStatus =
  | "active"
  | "suspended"
  | "revoked"
  | "expired";

type LicensePlan =
  | "trial"
  | "pro"
  | "business"
  | "lifetime";

type ProductID =
  | "dromocob-all-apps"
  | "dromocob-ultra-ae"
  | "pixel-resizer-pro"
  | "ai-upscaler"
  | "background-remover"
  | "watermark-studio"
  | "image-compressor"
  | "video-converter";

type LicenseRow = {
  id: string;

  ownerEmail: string;
  ownerUid?: string | null;
  customerName?: string;

  keySuffix?: string;

  status: LicenseStatus;
  plan: LicensePlan;

  products: ProductID[];

  maxDevices: number;
  offlineGraceDays?: number;

  startsAt?: string;
  expiresAt?: string | null;

  notes?: string;

  createdAt?: string;
  updatedAt?: string;
};

type ActivationRow = {
  id: string;

  licenseId?: string;
  userId?: string;
  userEmail?: string;

  productId?: ProductID;

  deviceHash?: string;
  deviceName?: string;

  platform?: string;
  appVersion?: string;
  osVersion?: string;

  active?: boolean;

  createdAt?: string;
  updatedAt?: string;
  lastValidatedAt?: string;
};

type EventRow = {
  id: string;

  type?: string;

  licenseId?: string;
  activationId?: string;
  productId?: ProductID;
  userId?: string;

  createdAt?: string;
};

type LicenseListResponse = {
  ok: boolean;

  licenses?: LicenseRow[];
  activations?: ActivationRow[];
  events?: EventRow[];

  settings?: {
    trialDays?: number;
    ultraTrialDays?: number;
    ultraUpdate?: UltraUpdateSettings;
  };

  error?: string;
};

type CreateLicenseResponse = {
  ok: boolean;
  id?: string;
  licenseKey?: string;
  error?: string;
};

type UpdateTrialResponse = {
  ok: boolean;

  settings?: {
    trialDays?: number;
    ultraTrialDays?: number;
    ultraUpdate?: UltraUpdateSettings;
  };

  error?: string;
};

type UltraUpdateSettings = {
  version: string;
  url: string;
  sha256: string;
  changelog: string;
  zxpUrl: string;
  zxpSha256: string;
};

type LicenseForm = {
  ownerEmail: string;
  customerName: string;

  plan: LicensePlan;
  product: ProductID;

  maxDevices: string;
  expiresAt: string;
  offlineGraceDays: string;

  notes: string;
};

// MARK: - Products

const PRODUCTS: ReadonlyArray<{
  id: ProductID;
  name: string;
}> = [
  {
    id: "dromocob-all-apps",
    name: "Dromocob Apps — Tümü",
  },
  {
    id: "pixel-resizer-pro",
    name: "Pixel Resizer PRO",
  },
  {
    id: "dromocob-ultra-ae",
    name: "Dromocob Ultra — After Effects",
  },
  {
    id: "ai-upscaler",
    name: "AI Upscaler",
  },
  {
    id: "background-remover",
    name: "Background Remover",
  },
  {
    id: "watermark-studio",
    name: "Watermark Studio",
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
  },
  {
    id: "video-converter",
    name: "Video Converter",
  },
];

const DEFAULT_FORM: LicenseForm = {
  ownerEmail: "",
  customerName: "",

  plan: "pro",
  product: "dromocob-all-apps",

  maxDevices: "2",
  expiresAt: "",
  offlineGraceDays: "7",

  notes: "",
};

// MARK: - Helpers

async function getAdminToken() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "Admin oturumu bulunamadı."
    );
  }

  const value =
    await user.getIdToken();

  if (!value) {
    throw new Error(
      "Admin kimlik doğrulaması alınamadı."
    );
  }

  return value;
}

async function parseJSON<T>(
  response: Response
): Promise<T> {
  const text =
    await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Sunucu geçersiz JSON döndürdü. HTTP ${response.status}`
    );
  }
}

function productName(
  productID: string
) {
  return (
    PRODUCTS.find(
      product =>
        product.id === productID
    )?.name ??
    productID
  );
}

function formatDate(
  value: unknown
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      String(value)
    );

  if (
    !Number.isFinite(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function statusLabel(
  status: LicenseStatus
) {
  switch (status) {
    case "active":
      return "AKTİF";

    case "suspended":
      return "ASKIDA";

    case "revoked":
      return "İPTAL";

    case "expired":
      return "SÜRESİ DOLMUŞ";
  }
}

function planLabel(
  plan: LicensePlan
) {
  switch (plan) {
    case "trial":
      return "TRIAL";

    case "pro":
      return "PRO";

    case "business":
      return "BUSINESS";

    case "lifetime":
      return "LIFETIME";
  }
}

// MARK: - Component

export default function LicenseControlCenter() {
  const [
    licenses,
    setLicenses,
  ] =
    useState<LicenseRow[]>([]);

  const [
    activations,
    setActivations,
  ] =
    useState<ActivationRow[]>([]);

  const [
    events,
    setEvents,
  ] =
    useState<EventRow[]>([]);

  const [
    busy,
    setBusy,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    query,
    setQuery,
  ] =
    useState("");

  const [
    showCreate,
    setShowCreate,
  ] =
    useState(false);

  const [
    createdKey,
    setCreatedKey,
  ] =
    useState("");

  const [
    creating,
    setCreating,
  ] =
    useState(false);

  const [
    actionLicenseID,
    setActionLicenseID,
  ] =
    useState<string | null>(
      null
    );

  const [
    trialDays,
    setTrialDays,
  ] =
    useState("7");

  const [
    savingTrial,
    setSavingTrial,
  ] =
    useState(false);

  const [ultraTrialDays, setUltraTrialDays] = useState("7");
  const [savingUltraTrial, setSavingUltraTrial] = useState(false);
  const [ultraUpdate, setUltraUpdate] = useState<UltraUpdateSettings>({ version: "2.5.0", url: "", sha256: "", changelog: "", zxpUrl: "", zxpSha256: "" });
  const [savingUltraUpdate, setSavingUltraUpdate] = useState(false);
  const [ultraUpdateSaved, setUltraUpdateSaved] = useState(false);

  const [
    form,
    setForm,
  ] =
    useState<LicenseForm>(
      DEFAULT_FORM
    );

  // MARK: - Load

  const load =
    useCallback(
      async (
        options?: {
          silent?: boolean;
        }
      ) => {
        const silent =
          options?.silent ??
          false;

        try {
          if (silent) {
            setRefreshing(true);
          } else {
            setBusy(true);
          }

          setError("");

          const idToken =
            await getAdminToken();

          const response =
            await fetch(
              "/api/admin/licenses",
              {
                method: "GET",

                headers: {
                  Authorization:
                    `Bearer ${idToken}`,
                },

                cache: "no-store",
              }
            );

          const data =
            await parseJSON<LicenseListResponse>(
              response
            );

          if (
            !response.ok ||
            !data.ok
          ) {
            throw new Error(
              data.error ||
                "Lisans verileri alınamadı."
            );
          }

          setLicenses(
            data.licenses ??
              []
          );

          setActivations(
            data.activations ??
              []
          );

          setEvents(
            data.events ??
              []
          );

          const serverTrialDays =
            Number(
              data.settings
                ?.trialDays ??
                7
            );

          setTrialDays(
            String(
              Number.isFinite(
                serverTrialDays
              )
                ? Math.max(
                    1,
                    Math.min(
                      30,
                      Math.round(
                        serverTrialDays
                      )
                    )
                  )
                : 7
            )
          );
          setUltraTrialDays(String(Math.max(0, Math.min(30, Math.round(Number(data.settings?.ultraTrialDays ?? serverTrialDays))))));
          if (data.settings?.ultraUpdate) setUltraUpdate(data.settings.ultraUpdate);
        } catch (reason) {
          setError(
            reason instanceof
              Error
              ? reason.message
              : "Lisans verileri alınamadı."
          );
        } finally {
          setBusy(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  // MARK: - Filter

  const visible =
    useMemo(() => {
      const normalized =
        query
          .trim()
          .toLowerCase();

      if (!normalized) {
        return licenses;
      }

      return licenses.filter(
        license => {
          const haystack = [
            license.customerName,
            license.ownerEmail,
            license.keySuffix,
            license.status,
            license.plan,
            ...license.products,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(
            normalized
          );
        }
      );
    }, [
      licenses,
      query,
    ]);

  // MARK: - Metrics

  const metrics =
    useMemo(() => {
      const activeLicenses =
        licenses.filter(
          item =>
            item.status ===
            "active"
        ).length;

      const activeDevices =
        activations.filter(
          item =>
            item.active ===
            true
        ).length;

      const customers =
        new Set(
          licenses
            .map(
              item =>
                item.ownerEmail
                  ?.trim()
                  .toLowerCase()
            )
            .filter(Boolean)
        ).size;

      return {
        total:
          licenses.length,

        activeLicenses,

        activeDevices,

        customers,
      };
    }, [
      licenses,
      activations,
    ]);

  // MARK: - Create

  async function createLicense(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (creating) {
      return;
    }

    const email =
      form.ownerEmail
        .trim()
        .toLowerCase();

    const customerName =
      form.customerName.trim();

    const maxDevices =
      Number(
        form.maxDevices
      );

    const offlineGraceDays =
      Number(
        form.offlineGraceDays
      );

    if (
      !email.includes("@")
    ) {
      setError(
        "Geçerli bir müşteri e-postası gir."
      );

      return;
    }

    if (
      customerName.length <
      2
    ) {
      setError(
        "Müşteri adı en az 2 karakter olmalı."
      );

      return;
    }

    if (
      !Number.isInteger(
        maxDevices
      ) ||
      maxDevices < 1 ||
      maxDevices > 100
    ) {
      setError(
        "Cihaz limiti 1 ile 100 arasında olmalı."
      );

      return;
    }

    if (
      !Number.isInteger(
        offlineGraceDays
      ) ||
      offlineGraceDays <
        1 ||
      offlineGraceDays >
        30
    ) {
      setError(
        "Offline grace 1 ile 30 gün arasında olmalı."
      );

      return;
    }

    try {
      setCreating(true);
      setError("");

      const idToken =
        await getAdminToken();

      const response =
        await fetch(
          "/api/admin/licenses",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${idToken}`,
            },

            body:
              JSON.stringify(
                {
                  ownerEmail:
                    email,

                  customerName,

                  plan:
                    form.plan,

                  products: [
                    form.product,
                  ],

                  maxDevices,

                  offlineGraceDays,

                  expiresAt:
                    form.expiresAt ||
                    null,

                  notes:
                    form.notes.trim(),
                }
              ),
          }
        );

      const data =
        await parseJSON<CreateLicenseResponse>(
          response
        );

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ||
            "Lisans oluşturulamadı."
        );
      }

      if (
        !data.licenseKey
      ) {
        throw new Error(
          "Sunucu lisans anahtarını döndürmedi."
        );
      }

      setCreatedKey(
        data.licenseKey
      );

      setShowCreate(
        false
      );

      setForm(
        DEFAULT_FORM
      );

      await load({
        silent: true,
      });
    } catch (reason) {
      setError(
        reason instanceof
          Error
          ? reason.message
          : "Lisans oluşturulamadı."
      );
    } finally {
      setCreating(false);
    }
  }

  // MARK: - Status

  async function updateStatus(
    license: LicenseRow,
    status: LicenseStatus
  ) {
    if (
      actionLicenseID
    ) {
      return;
    }

    if (
      license.status ===
        "revoked" &&
      status === "active"
    ) {
      setError(
        "İptal edilmiş lisans yeniden etkinleştirilemez. Yeni lisans oluştur."
      );

      return;
    }

    if (
      status ===
      "revoked"
    ) {
      const approved =
        window.confirm(
          "Bu lisans kalıcı olarak iptal edilecek ve aktif cihaz oturumları kapatılacak. Devam edilsin mi?"
        );

      if (!approved) {
        return;
      }
    }

    try {
      setActionLicenseID(
        license.id
      );

      setError("");

      const idToken =
        await getAdminToken();

      const response =
        await fetch(
          `/api/admin/licenses/${license.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${idToken}`,
            },

            body:
              JSON.stringify(
                {
                  status,
                }
              ),
          }
        );

      const data =
        await parseJSON<{
          ok?: boolean;
          error?: string;
        }>(
          response
        );

      if (
        !response.ok ||
        data.ok === false
      ) {
        throw new Error(
          data.error ||
            "Lisans durumu güncellenemedi."
        );
      }

      await load({
        silent: true,
      });
    } catch (reason) {
      setError(
        reason instanceof
          Error
          ? reason.message
          : "Lisans durumu güncellenemedi."
      );
    } finally {
      setActionLicenseID(
        null
      );
    }
  }

  // MARK: - Trial

  async function saveTrialDays() {
    if (savingTrial) {
      return;
    }

    const value =
      Number(
        trialDays
      );

    if (
      !Number.isInteger(
        value
      ) ||
      value < 1 ||
      value > 30
    ) {
      setError(
        "Deneme süresi 1 ile 30 gün arasında olmalı."
      );

      return;
    }

    try {
      setSavingTrial(
        true
      );

      setError("");

      const idToken =
        await getAdminToken();

      const response =
        await fetch(
          "/api/admin/licenses",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${idToken}`,
            },

            body:
              JSON.stringify(
                {
                  trialDays:
                    value,
                }
              ),
          }
        );

      const data =
        await parseJSON<UpdateTrialResponse>(
          response
        );

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ||
            "Deneme süresi güncellenemedi."
        );
      }

      setTrialDays(
        String(
          data.settings
            ?.trialDays ??
            value
        )
      );
    } catch (reason) {
      setError(
        reason instanceof
          Error
          ? reason.message
          : "Deneme süresi güncellenemedi."
      );
    } finally {
      setSavingTrial(
        false
      );
    }
  }

  async function saveUltraTrialDays() {
    const value = Number(ultraTrialDays);
    if (savingUltraTrial || !Number.isInteger(value) || value < 1 || value > 30) { setError("Dromocob Ultra deneme süresi 1 ile 30 gün arasında olmalı."); return; }
    try {
      setSavingUltraTrial(true); setError("");
      const response = await fetch("/api/admin/licenses", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getAdminToken()}` }, body: JSON.stringify({ trialDays: value, productId: "dromocob-ultra-ae" }) });
      const data = await parseJSON<UpdateTrialResponse>(response);
      if (!response.ok || !data.ok) throw new Error(data.error || "Ultra deneme süresi güncellenemedi.");
      setUltraTrialDays(String(data.settings?.ultraTrialDays ?? value));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Ultra deneme süresi güncellenemedi."); }
    finally { setSavingUltraTrial(false); }
  }

  async function saveUltraUpdate() {
    const version = ultraUpdate.version.trim();
    const url = ultraUpdate.url.trim();
    const sha256 = ultraUpdate.sha256.trim().toLowerCase();
    const zxpUrl = ultraUpdate.zxpUrl.trim();
    const zxpSha256 = ultraUpdate.zxpSha256.trim().toLowerCase();
    if (savingUltraUpdate || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) { setError("Sürümü 2.5.0 biçiminde gir."); return; }
    if (!url.startsWith("https://") || !zxpUrl.startsWith("https://")) { setError("ZXP ve güncelleme ZIP bağlantıları HTTPS olmalı."); return; }
    if (!/^[a-f0-9]{64}$/i.test(sha256) || !/^[a-f0-9]{64}$/i.test(zxpSha256)) { setError("Her iki SHA-256 değeri de 64 karakter olmalı."); return; }
    try {
      setSavingUltraUpdate(true); setUltraUpdateSaved(false); setError("");
      const response = await fetch("/api/admin/licenses", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getAdminToken()}` }, body: JSON.stringify({ action: "ultra-update", ultraUpdate: { ...ultraUpdate, version, url, sha256, zxpUrl, zxpSha256 } }) });
      const data = await parseJSON<UpdateTrialResponse>(response);
      if (!response.ok || !data.ok) throw new Error(data.error || "Ultra güncellemesi yayınlanamadı.");
      if (data.settings?.ultraUpdate) setUltraUpdate(data.settings.ultraUpdate);
      setUltraUpdateSaved(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Ultra güncellemesi yayınlanamadı."); }
    finally { setSavingUltraUpdate(false); }
  }

  // MARK: - Clipboard

  async function copyLicenseKey() {
    if (!createdKey) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        createdKey
      );
    } catch {
      setError(
        "Lisans anahtarı panoya kopyalanamadı."
      );
    }
  }

  // MARK: - UI

  return (
    <div className="license-os">

      <div className="admin-title license-title">
        <div>
          <p>
            DROMOCOB / LICENSE CLOUD
          </p>

          <h1>
            Lisans Kontrol Merkezi
          </h1>

          <p>
            Tek hesap, tek lisans altyapısı,
            bütün Dromocob uygulamaları.
          </p>
        </div>

        <button
          type="button"
          className="admin-action"
          onClick={() =>
            setShowCreate(true)
          }
        >
          <Plus size={16} />

          Yeni lisans
        </button>
      </div>

      <div className="license-metrics">
        <Metric
          icon={KeyRound}
          label="Toplam lisans"
          value={metrics.total}
        />

        <Metric
          icon={CheckCircle2}
          label="Aktif lisans"
          value={
            metrics.activeLicenses
          }
        />

        <Metric
          icon={Laptop}
          label="Aktif cihaz"
          value={
            metrics.activeDevices
          }
        />

        <Metric
          icon={Users}
          label="Müşteri"
          value={
            metrics.customers
          }
        />
      </div>

      <section
        className="admin-panel"
        style={{
          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between",

          flexWrap:
            "wrap",

          gap:
            18,

          padding:
            20,

          marginBottom:
            18,
        }}
      >
        <div>
          <strong>
            Ücretsiz kullanım süresi
          </strong>

          <p
            style={{
              margin:
                "5px 0 0",

              opacity:
                0.68,
            }}
          >
            Yeni kurulumlar lisans istemeden
            bu süre boyunca tüm özellikleri
            kullanır.
          </p>
        </div>

        <div
          style={{
            display:
              "flex",

            alignItems:
              "center",

            gap:
              10,
          }}
        >
          <input
            aria-label="Deneme süresi"
            type="number"
            min={1}
            max={30}
            step={1}
            value={trialDays}
            onChange={
              event =>
                setTrialDays(
                  event.target
                    .value
                )
            }
            style={{
              width:
                76,
            }}
          />

          <span>
            gün
          </span>

          <button
            type="button"
            className="admin-action"
            onClick={() =>
              void saveTrialDays()
            }
            disabled={
              savingTrial
            }
          >
            {savingTrial
              ? "Kaydediliyor…"
              : "Süreyi kaydet"}
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 18, paddingLeft: 18, borderLeft: "1px solid rgba(255,255,255,.12)" }}>
          <strong style={{ fontSize: 11 }}>Dromocob Ultra</strong>
          <input aria-label="Dromocob Ultra deneme süresi" type="number" min={1} max={30} step={1} value={ultraTrialDays} onChange={event => setUltraTrialDays(event.target.value)} style={{ width: 76 }} />
          <span>gün</span>
          <button type="button" className="admin-action" onClick={() => void saveUltraTrialDays()} disabled={savingUltraTrial}>{savingUltraTrial ? "Kaydediliyor…" : "Ultra süresini kaydet"}</button>
        </div>
      </section>

      <section className="admin-panel" style={{ display: "grid", gap: 14, padding: 20, marginBottom: 18 }}>
        <div>
          <strong>Dromocob Ultra yayın merkezi</strong>
          <p style={{ margin: "5px 0 0", opacity: 0.68 }}>ZXP ilk kurulum içindir. Güncelleme ZIP&apos;i paneldeki Güncelle düğmesine gönderilir ve SHA-256 ile doğrulanır.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "140px minmax(0,1fr)", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}><span>Sürüm</span><input aria-label="Ultra sürümü" value={ultraUpdate.version} onChange={event => setUltraUpdate(current => ({ ...current, version: event.target.value }))} placeholder="2.5.0" /></label>
          <label style={{ display: "grid", gap: 6 }}><span>İlk kurulum ZXP linki</span><input aria-label="Ultra ZXP linki" value={ultraUpdate.zxpUrl} onChange={event => setUltraUpdate(current => ({ ...current, zxpUrl: event.target.value }))} placeholder="https://dromocob.tr/downloads/Dromocob-Ultra-2.5.0.zxp" /></label>
        </div>
        <label style={{ display: "grid", gap: 6 }}><span>ZXP SHA-256</span><input aria-label="Ultra ZXP SHA-256" value={ultraUpdate.zxpSha256} onChange={event => setUltraUpdate(current => ({ ...current, zxpSha256: event.target.value }))} placeholder="64 karakter SHA-256" /></label>
        <label style={{ display: "grid", gap: 6 }}><span>Panel güncelleme ZIP linki</span><input aria-label="Ultra güncelleme ZIP linki" value={ultraUpdate.url} onChange={event => setUltraUpdate(current => ({ ...current, url: event.target.value }))} placeholder="https://dromocob.tr/downloads/Dromocob-Ultra-2.5.0-update.zip" /></label>
        <label style={{ display: "grid", gap: 6 }}><span>Güncelleme ZIP SHA-256</span><input aria-label="Ultra güncelleme SHA-256" value={ultraUpdate.sha256} onChange={event => setUltraUpdate(current => ({ ...current, sha256: event.target.value }))} placeholder="64 karakter SHA-256" /></label>
        <label style={{ display: "grid", gap: 6 }}><span>Yenilik notu</span><textarea aria-label="Ultra yenilik notu" rows={3} value={ultraUpdate.changelog} onChange={event => setUltraUpdate(current => ({ ...current, changelog: event.target.value }))} placeholder="Yeni Carousel akışı, Türkçe arayüz ve performans iyileştirmeleri." /></label>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><button type="button" className="admin-action" onClick={() => void saveUltraUpdate()} disabled={savingUltraUpdate}>{savingUltraUpdate ? "Yayınlanıyor…" : "Ultra güncellemesini yayınla"}</button>{ultraUpdateSaved && <span style={{ color: "#77d348", fontWeight: 800 }}>✓ API kaydı güncellendi</span>}</div>
      </section>

      {error && (
        <div
          className="admin-alert"
          role="alert"
        >
          {error}
        </div>
      )}

      {createdKey && (
        <div className="license-key-reveal">
          <ShieldCheck />

          <div>
            <small>
              YALNIZCA ŞİMDİ GÖSTERİLİR
            </small>

            <strong>
              {createdKey}
            </strong>
          </div>

          <button
            type="button"
            onClick={() =>
              void copyLicenseKey()
            }
          >
            <Copy size={16} />

            Kopyala
          </button>

          <button
            type="button"
            onClick={() =>
              setCreatedKey("")
            }
          >
            <X size={16} />

            Kapat
          </button>
        </div>
      )}

      <div className="license-toolbar">
        <label>
          <Search size={15} />

          <input
            value={query}
            onChange={
              event =>
                setQuery(
                  event.target
                    .value
                )
            }
            placeholder="Lisans, müşteri veya e-posta ara"
          />
        </label>

        <button
          type="button"
          onClick={() =>
            void load({
              silent:
                true,
            })
          }
          disabled={
            refreshing
          }
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? "spin"
                : ""
            }
          />

          Yenile
        </button>
      </div>

      <div className="license-layout">

        <section className="admin-panel license-list">
          <PanelHead
            icon={KeyRound}
            title="Lisanslar"
            subtitle="Plan, cihaz ve ürün kapsamı"
          />

          {busy ? (
            <div className="empty-state">
              Lisans ağı senkronize ediliyor…
            </div>
          ) : visible.length ===
            0 ? (
            <div className="empty-state">
              Lisans bulunamadı.
            </div>
          ) : (
            visible.map(
              license => (
                <article
                  key={
                    license.id
                  }
                >
                  <div className="license-avatar">
                    <AppWindow
                      size={
                        18
                      }
                    />
                  </div>

                  <div className="license-identity">

                    <strong>
                      {license.customerName ||
                        license.ownerEmail}
                    </strong>

                    <small>
                      {
                        license.ownerEmail
                      }
                      {" · "}
                      •••••
                      {license.keySuffix ||
                        "-----"}
                    </small>

                    <div>
                      <i
                        className={`state-pill ${
                          license.status !==
                          "active"
                            ? "state-off"
                            : ""
                        }`}
                      >
                        {statusLabel(
                          license.status
                        )}
                      </i>

                      <span>
                        {planLabel(
                          license.plan
                        )}
                      </span>

                      <span>
                        {
                          license.maxDevices
                        }{" "}
                        cihaz
                      </span>
                    </div>
                  </div>

                  <div className="license-products">
                    {license.products.map(
                      product => (
                        <em
                          key={
                            product
                          }
                        >
                          {productName(
                            product
                          )}
                        </em>
                      )
                    )}
                  </div>

                  <div className="license-actions">

                    {license.status ===
                    "active" ? (
                      <button
                        type="button"
                        disabled={
                          actionLicenseID ===
                          license.id
                        }
                        onClick={() =>
                          void updateStatus(
                            license,
                            "suspended"
                          )
                        }
                      >
                        <Ban
                          size={
                            15
                          }
                        />

                        Askıya al
                      </button>
                    ) : license.status ===
                      "suspended" ? (
                      <button
                        type="button"
                        disabled={
                          actionLicenseID ===
                          license.id
                        }
                        onClick={() =>
                          void updateStatus(
                            license,
                            "active"
                          )
                        }
                      >
                        <CheckCircle2
                          size={
                            15
                          }
                        />

                        Etkinleştir
                      </button>
                    ) : null}

                    {license.status !==
                      "revoked" && (
                      <button
                        type="button"
                        className="danger"
                        aria-label="Lisansı iptal et"
                        disabled={
                          actionLicenseID ===
                          license.id
                        }
                        onClick={() =>
                          void updateStatus(
                            license,
                            "revoked"
                          )
                        }
                      >
                        <Ban
                          size={
                            15
                          }
                        />
                      </button>
                    )}
                  </div>
                </article>
              )
            )
          )}
        </section>

        <aside className="admin-panel license-feed">
          <PanelHead
            icon={Activity}
            title="Aktivasyon akışı"
            subtitle="Canlı güvenlik olayları"
          />

          {events.length ===
          0 ? (
            <div className="empty-state">
              Henüz lisans olayı yok.
            </div>
          ) : (
            events
              .slice(
                0,
                20
              )
              .map(
                event => (
                  <div
                    key={
                      event.id
                    }
                  >
                    <span />

                    <p>
                      <strong>
                        {String(
                          event.type ||
                            "event"
                        )
                          .replaceAll(
                            "_",
                            " "
                          )
                          .toUpperCase()}
                      </strong>

                      <small>
                        {event.productId
                          ? productName(
                              event.productId
                            )
                          : event.licenseId ||
                            "Sistem"}
                      </small>
                    </p>

                    <time>
                      {formatDate(
                        event.createdAt
                      )}
                    </time>
                  </div>
                )
              )
          )}
        </aside>
      </div>

      {showCreate && (
        <div
          className="modal-backdrop"
          onMouseDown={() =>
            !creating &&
            setShowCreate(
              false
            )
          }
        >
          <form
            className="admin-modal license-create"
            onSubmit={
              createLicense
            }
            onMouseDown={
              event =>
                event.stopPropagation()
            }
          >
            <p className="eyebrow">
              SECURE LICENSE ISSUER
            </p>

            <h2>
              Yeni lisans oluştur
            </h2>

            <div className="admin-form-grid">

              <label>
                Müşteri adı

                <input
                  required
                  autoComplete="name"
                  value={
                    form.customerName
                  }
                  onChange={
                    event =>
                      setForm(
                        current => ({
                          ...current,

                          customerName:
                            event
                              .target
                              .value,
                        })
                      )
                  }
                />
              </label>

              <label>
                E-posta

                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={
                    form.ownerEmail
                  }
                  onChange={
                    event =>
                      setForm(
                        current => ({
                          ...current,

                          ownerEmail:
                            event
                              .target
                              .value,
                        })
                      )
                  }
                />
              </label>

              <label>
                Plan

                <select
                  value={
                    form.plan
                  }
                  onChange={
                    event =>
                      setForm(
                        current => ({
                          ...current,

                          plan:
                            event
                              .target
                              .value as LicensePlan,
                        })
                      )
                  }
                >
                  <option value="trial">
                    Trial
                  </option>

                  <option value="pro">
                    Pro
                  </option>

                  <option value="business">
                    Business
                  </option>

                  <option value="lifetime">
                    Lifetime
                  </option>
                </select>
              </label>

              <label>
                Uygulama

                <select
                  value={
                    form.product
                  }
                  onChange={
                    event =>
                      setForm(
                        current => ({
                          ...current,

                          product:
                            event
                              .target
                              .value as ProductID,
                        })
                      )
                  }
                >
                  {PRODUCTS.map(
                    product => (
                      <option
                        key={
                          product.id
                        }
                        value={
                          product.id
                        }
                      >
                        {
                          product.name
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Cihaz limiti

                <input
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  value={
                    form.maxDevices
                  }
                  onChange={
                    event =>
                      setForm(
                        current => ({
                          ...current,

                          maxDevices:
                            event
                              .target
                              .value,
                        })
                      )
                  }
                />
              </label>

              <label>
                Offline grace

                <input
                  type="number"
                  min={1}
                  max={30}
                  step={1}
                  value={
                    form.offlineGraceDays
                  }
                  onChange={
                    event =>
                      setForm(
                        current => ({
                          ...current,

                          offlineGraceDays:
                            event
                              .target
                              .value,
                        })
                      )
                  }
                />
              </label>

              <label>
                Bitiş tarihi

                <input
                  type="date"
                  value={
                    form.expiresAt
                  }
                  disabled={
                    form.plan ===
                    "lifetime"
                  }
                  onChange={
                    event =>
                      setForm(
                        current => ({
                          ...current,

                          expiresAt:
                            event
                              .target
                              .value,
                        })
                      )
                  }
                />
              </label>

              <label>
                Not

                <textarea
                  maxLength={2000}
                  value={
                    form.notes
                  }
                  onChange={
                    event =>
                      setForm(
                        current => ({
                          ...current,

                          notes:
                            event
                              .target
                              .value,
                        })
                      )
                  }
                />
              </label>
            </div>

            <div className="license-modal-actions">

              <button
                type="button"
                disabled={
                  creating
                }
                onClick={() =>
                  setShowCreate(
                    false
                  )
                }
              >
                Vazgeç
              </button>

              <button
                className="admin-action"
                type="submit"
                disabled={
                  creating
                }
              >
                {creating ? (
                  <RefreshCw
                    size={
                      15
                    }
                    className="spin"
                  />
                ) : (
                  <KeyRound
                    size={
                      15
                    }
                  />
                )}

                {creating
                  ? "Lisans üretiliyor…"
                  : "Güvenli lisans üret"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// MARK: - Metric

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof KeyRound;
  label: string;
  value: number;
}) {
  return (
    <div>
      <span>
        <Icon size={18} />
      </span>

      <p>
        <small>
          {label}
        </small>

        <strong>
          {value}
        </strong>
      </p>
    </div>
  );
}

// MARK: - Panel Head

function PanelHead({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof KeyRound;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="panel-head">
      <div>
        <span className="panel-icon">
          <Icon size={18} />
        </span>

        <div>
          <h2>
            {title}
          </h2>

          <p>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
