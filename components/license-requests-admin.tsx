"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  UserRound,
  XCircle,
} from "lucide-react";

import { auth } from "@/lib/firebase";

type LicenseRequestStatus =
  | "pending"
  | "contacted"
  | "approved"
  | "rejected";

type LicenseRequest = {
  id: string;

  name?: string;
  email?: string;
  phone?: string;

  productId?: string;
  productName?: string;

  plan?: string;

  company?: string;
  message?: string;

  status?: LicenseRequestStatus;

  adminNote?: string;

  createdAt?: string;
  updatedAt?: string;
};

type LicenseRequestsResponse = {
  ok?: boolean;
  requests?: LicenseRequest[];
  error?: string;
};

const statusOptions: {
  value: LicenseRequestStatus;
  label: string;
}[] = [
  {
    value: "pending",
    label: "Bekliyor",
  },
  {
    value: "contacted",
    label: "İletişime geçildi",
  },
  {
    value: "approved",
    label: "Onaylandı",
  },
  {
    value: "rejected",
    label: "Reddedildi",
  },
];

async function adminToken() {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "Admin oturumu bulunamadı.",
    );
  }

  return user.getIdToken();
}

function formatDate(
  value?: string,
) {
  if (!value) {
    return "Şimdi";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Şimdi";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function normalizeStatus(
  value?: string,
): LicenseRequestStatus {
  switch (value) {
    case "contacted":
    case "approved":
    case "rejected":
      return value;

    default:
      return "pending";
  }
}

function statusLabel(
  status:
    LicenseRequestStatus,
) {
  return (
    statusOptions.find(
      item =>
        item.value ===
        status,
    )?.label ??
    "Bekliyor"
  );
}

export default function LicenseRequestsAdmin() {
  const [
    requests,
    setRequests,
  ] =
    useState<
      LicenseRequest[]
    >([]);

  const [
    busy,
    setBusy,
  ] =
    useState(true);

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
    selectedId,
    setSelectedId,
  ] =
    useState<
      string | null
    >(null);

  const [
    note,
    setNote,
  ] =
    useState("");

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const load =
    useCallback(
      async () => {
        setBusy(true);
        setError("");

        try {
          const token =
            await adminToken();

          const response =
            await fetch(
              "/api/admin/license-requests",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
                cache:
                  "no-store",
              },
            );

          const data =
            (await response
              .json()) as LicenseRequestsResponse;

          if (
            !response.ok
          ) {
            throw new Error(
              data.error ||
                "Lisans talepleri alınamadı.",
            );
          }

          setRequests(
            Array.isArray(
              data.requests,
            )
              ? data.requests
              : [],
          );

        } catch (
          reason
        ) {
          setError(
            reason instanceof
              Error
              ? reason.message
              : "Lisans talepleri alınamadı.",
          );

        } finally {
          setBusy(false);
        }
      },
      [],
    );

  useEffect(() => {
    void load();
  }, [load]);

  const visibleRequests =
    useMemo(() => {
      const term =
        query
          .trim()
          .toLowerCase();

      if (!term) {
        return requests;
      }

      return requests.filter(
        item =>
          [
            item.name,
            item.email,
            item.phone,
            item.company,
            item.productId,
            item.productName,
            item.plan,
            item.message,
            item.status,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(term),
      );
    }, [
      requests,
      query,
    ]);

  const selected =
    requests.find(
      item =>
        item.id ===
        selectedId,
    ) ?? null;

  useEffect(() => {
    setNote(
      selected?.adminNote ??
        "",
    );
  }, [selected]);

  const metrics =
    useMemo(
      () => ({
        total:
          requests.length,

        pending:
          requests.filter(
            item =>
              normalizeStatus(
                item.status,
              ) ===
              "pending",
          ).length,

        contacted:
          requests.filter(
            item =>
              normalizeStatus(
                item.status,
              ) ===
              "contacted",
          ).length,

        approved:
          requests.filter(
            item =>
              normalizeStatus(
                item.status,
              ) ===
              "approved",
          ).length,
      }),
      [requests],
    );

  async function updateRequest(
    id: string,
    values: {
      status?:
        LicenseRequestStatus;
      adminNote?:
        string;
    },
  ) {
    setSaving(true);
    setError("");

    try {
      const token =
        await adminToken();

      const response =
        await fetch(
          `/api/admin/license-requests/${id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                values,
              ),
          },
        );

      const data =
        await response
          .json()
          .catch(
            () => ({}),
          );

      if (
        !response.ok
      ) {
        throw new Error(
          data.error ||
            "Talep güncellenemedi.",
        );
      }

      setRequests(
        previous =>
          previous.map(
            item =>
              item.id ===
              id
                ? {
                    ...item,
                    ...values,
                    updatedAt:
                      new Date().toISOString(),
                  }
                : item,
          ),
      );

    } catch (
      reason
    ) {
      setError(
        reason instanceof
          Error
          ? reason.message
          : "Talep güncellenemedi.",
      );

    } finally {
      setSaving(false);
    }
  }

  async function saveNote() {
    if (!selected) {
      return;
    }

    await updateRequest(
      selected.id,
      {
        adminNote:
          note.trim(),
      },
    );
  }

  return (
    <div className="license-request-admin">
      <header className="license-request-admin__header">
        <div>
          <p>
            DROMOCOB /
            LICENSE SALES
          </p>

          <h1>
            Lisans
            Talepleri
          </h1>

          <span>
            Web sitesinden gelen
            lisans ve satın alma
            taleplerini tek
            merkezden yönet.
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            void load()
          }
          disabled={busy}
        >
          <RefreshCw
            size={16}
            className={
              busy
                ? "spin"
                : undefined
            }
          />

          Yenile
        </button>
      </header>

      <section className="license-request-admin__metrics">
        <Metric
          icon={
            MessageSquareText
          }
          label="Toplam talep"
          value={metrics.total}
        />

        <Metric
          icon={Clock3}
          label="Bekleyen"
          value={
            metrics.pending
          }
        />

        <Metric
          icon={Activity}
          label="İletişimde"
          value={
            metrics.contacted
          }
        />

        <Metric
          icon={CheckCircle2}
          label="Onaylanan"
          value={
            metrics.approved
          }
        />
      </section>

      {error && (
        <div className="license-request-admin__error">
          {error}
        </div>
      )}

      <div className="license-request-admin__toolbar">
        <label>
          <Search
            size={16}
          />

          <input
            value={query}
            onChange={event =>
              setQuery(
                event.target
                  .value,
              )
            }
            placeholder="Müşteri, e-posta, ürün veya plan ara"
          />
        </label>

        <span>
          {
            visibleRequests.length
          }{" "}
          kayıt
        </span>
      </div>

      <div className="license-request-admin__layout">
        <section className="license-request-admin__list">
          {busy ? (
            <div className="license-request-admin__empty">
              Lisans talepleri
              yükleniyor…
            </div>
          ) : visibleRequests
              .length === 0 ? (
            <div className="license-request-admin__empty">
              Lisans talebi
              bulunamadı.
            </div>
          ) : (
            visibleRequests.map(
              item => {
                const status =
                  normalizeStatus(
                    item.status,
                  );

                return (
                  <button
                    type="button"
                    key={
                      item.id
                    }
                    className={`license-request-row ${
                      selectedId ===
                      item.id
                        ? "is-selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedId(
                        item.id,
                      )
                    }
                  >
                    <div className="license-request-row__avatar">
                      <UserRound
                        size={18}
                      />
                    </div>

                    <div className="license-request-row__identity">
                      <strong>
                        {item.name ||
                          item.email ||
                          "İsimsiz müşteri"}
                      </strong>

                      <small>
                        {item.email ||
                          "E-posta yok"}
                      </small>

                      <div>
                        <span
                          className={`license-request-status status-${status}`}
                        >
                          {statusLabel(
                            status,
                          )}
                        </span>

                        <em>
                          {item.plan
                            ?.toUpperCase() ||
                            "PLAN YOK"}
                        </em>
                      </div>
                    </div>

                    <div className="license-request-row__product">
                      <small>
                        ÜRÜN
                      </small>

                      <strong>
                        {item.productName ||
                          item.productId ||
                          "Belirtilmedi"}
                      </strong>
                    </div>

                    <time>
                      {formatDate(
                        item.createdAt,
                      )}
                    </time>
                  </button>
                );
              },
            )
          )}
        </section>

        <aside className="license-request-admin__detail">
          {!selected ? (
            <div className="license-request-admin__placeholder">
              <ShieldCheck
                size={38}
              />

              <h2>
                Talep seç
              </h2>

              <p>
                Detayları görmek ve
                durum güncellemek için
                soldaki kayıtlardan birini
                seç.
              </p>
            </div>
          ) : (
            <>
              <div className="license-request-admin__detail-head">
                <div>
                  <small>
                    LICENSE REQUEST
                  </small>

                  <h2>
                    {selected.name ||
                      "Müşteri"}
                  </h2>

                  <span>
                    {selected.productName ||
                      selected.productId ||
                      "Ürün belirtilmedi"}
                  </span>
                </div>

                <span
                  className={`license-request-status status-${normalizeStatus(
                    selected.status,
                  )}`}
                >
                  {statusLabel(
                    normalizeStatus(
                      selected.status,
                    ),
                  )}
                </span>
              </div>

              <div className="license-request-admin__info-grid">
                <Info
                  icon={Mail}
                  label="E-posta"
                  value={
                    selected.email ||
                    "Belirtilmedi"
                  }
                />

                <Info
                  icon={
                    Smartphone
                  }
                  label="Telefon"
                  value={
                    selected.phone ||
                    "Belirtilmedi"
                  }
                />

                <Info
                  icon={
                    UserRound
                  }
                  label="Firma"
                  value={
                    selected.company ||
                    "Belirtilmedi"
                  }
                />

                <Info
                  icon={
                    CheckCircle2
                  }
                  label="Plan"
                  value={
                    selected.plan ||
                    "Belirtilmedi"
                  }
                />
              </div>

              <div className="license-request-admin__message">
                <small>
                  MÜŞTERİ NOTU
                </small>

                <p>
                  {selected.message ||
                    "Müşteri ek bir not bırakmadı."}
                </p>
              </div>

              <div className="license-request-admin__status-panel">
                <small>
                  TALEP DURUMU
                </small>

                <div>
                  {statusOptions.map(
                    option => (
                      <button
                        type="button"
                        key={
                          option.value
                        }
                        className={
                          normalizeStatus(
                            selected.status,
                          ) ===
                          option.value
                            ? "is-active"
                            : undefined
                        }
                        disabled={
                          saving
                        }
                        onClick={() =>
                          void updateRequest(
                            selected.id,
                            {
                              status:
                                option.value,
                            },
                          )
                        }
                      >
                        {option.value ===
                          "rejected" && (
                          <XCircle
                            size={14}
                          />
                        )}

                        {option.value !==
                          "rejected" && (
                          <CheckCircle2
                            size={14}
                          />
                        )}

                        {
                          option.label
                        }
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="license-request-admin__note">
                <label
                  htmlFor="admin-license-note"
                >
                  ADMIN NOTU
                </label>

                <textarea
                  id="admin-license-note"
                  value={note}
                  onChange={event =>
                    setNote(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Müşteriyle görüşme, ödeme veya lisans notunu yaz..."
                  rows={6}
                />

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    void saveNote()
                  }
                >
                  {saving
                    ? "Kaydediliyor…"
                    : "Notu Kaydet"}
                </button>
              </div>

              <footer className="license-request-admin__detail-footer">
                <span>
                  Oluşturuldu
                  <strong>
                    {formatDate(
                      selected.createdAt,
                    )}
                  </strong>
                </span>

                <span>
                  Son güncelleme
                  <strong>
                    {formatDate(
                      selected.updatedAt,
                    )}
                  </strong>
                </span>
              </footer>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof Activity;
  label: string;
  value: number;
}) {
  return (
    <article>
      <span>
        <Icon
          size={18}
        />
      </span>

      <div>
        <small>
          {label}
        </small>

        <strong>
          {value}
        </strong>
      </div>
    </article>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div>
      <Icon
        size={16}
      />

      <span>
        <small>
          {label}
        </small>

        <strong>
          {value}
        </strong>
      </span>
    </div>
  );
}