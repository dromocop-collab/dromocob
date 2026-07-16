"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Activity,
  Calculator,
  FolderKanban,
  Loader2,
  MessagesSquare,
  RefreshCw,
} from "lucide-react";

import {
  auth,
} from "@/lib/firebase";

type Metrics = {
  projects: number;
  quotes: number;
  chats: number;
  sites: number;
};

const EMPTY_METRICS: Metrics = {
  projects: 0,
  quotes: 0,
  chats: 0,
  sites: 0,
};

export default function MetricCards() {
  const [
    metrics,
    setMetrics,
  ] = useState<Metrics>(
    EMPTY_METRICS
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const loadMetrics =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const user =
            auth.currentUser;

          if (!user) {
            throw new Error(
              "Admin oturumu bulunamadı."
            );
          }

          const token =
            await user.getIdToken(
              true
            );

          const response =
            await fetch(
              "/api/admin/dashboard/metrics",
              {
                method: "GET",

                headers: {
                  authorization:
                    `Bearer ${token}`,
                },

                cache: "no-store",
              }
            );

          if (!response.ok) {
            const message =
              await response.text();

            throw new Error(
              message ||
              "Metrikler alınamadı."
            );
          }

          const data =
            await response.json();

          setMetrics(
            data.metrics
          );
        } catch (
          requestError
        ) {
          console.error(
            "[DROMOCOB METRICS]",
            requestError
          );

          setMetrics(
            EMPTY_METRICS
          );

          setError(
            requestError
              instanceof Error
              ? requestError.message
              : "Metrikler alınamadı."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    const timerId = setTimeout(
      () => {
        void loadMetrics();
      },
      0
    );

    return () => {
      clearTimeout(timerId);
    };
  }, [loadMetrics]);

  const cards = [
    {
      icon: FolderKanban,
      title: "Toplam proje",
      value: metrics.projects,
      sub: "Dinamik portföy",
    },
    {
      icon: Calculator,
      title: "Yeni teklifler",
      value: metrics.quotes,
      sub: "İncelenmeyi bekliyor",
    },
    {
      icon: MessagesSquare,
      title: "Açık destek",
      value: metrics.chats,
      sub: "Canlı görüşme",
    },
    {
      icon: Activity,
      title: "Yönetilen site",
      value: metrics.sites,
      sub: "Control Center",
    },
  ];

  return (
    <>
      {error && (
        <div className="metrics-error">
          <div>
            <strong>
              Dashboard verileri
              alınamadı
            </strong>

            <span>
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={loadMetrics}
          >
            <RefreshCw
              size={15}
            />

            Yeniden dene
          </button>
        </div>
      )}

      <div className="metric-grid">
        {cards.map(
          ({
            icon: Icon,
            title,
            value,
            sub,
          }) => (
            <article
              className="metric-card"
              key={title}
            >
              <div>
                <Icon
                  size={19}
                />

                <span>
                  {title}
                </span>
              </div>

              <strong>
                {loading ? (
                  <Loader2
                    size={27}
                    className="spin"
                  />
                ) : (
                  value
                    .toLocaleString(
                      "tr-TR"
                    )
                )}
              </strong>

              <small>
                {sub}
              </small>
            </article>
          )
        )}
      </div>
    </>
  );
}