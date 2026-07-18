"use client";

import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import {
  Check,
  ChevronRight,
  FileVideo2,
  Grid2X2,
  ImageIcon,
  LayoutList,
  Loader2,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import {
  db,
  storage,
} from "@/lib/firebase";

export type Field = {
  key: string;

  label: string;

  type?:
    | "text"
    | "number"
    | "textarea"
    | "boolean"
    | "array"
    | "theme"
    | "image"
    | "video";

  placeholder?: string;

  fullWidth?: boolean;

  helpText?: string;
};

type Row =
  Record<string, unknown> & {
    id: string;
  };

type UploadState = {
  fieldKey: string;

  progress: number;

  fileName: string;
};

type MediaFieldProps = {
  field: Field;

  value: string;

  onChange: (
    value: string
  ) => void;

  uploadState:
    UploadState | null;

  onFile:
    (
      field: Field,
      file: File
    ) => Promise<void>;
};

function MediaField({
  field,
  value,
  onChange,
  uploadState,
  onFile,
}: MediaFieldProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [dragging, setDragging] =
    useState(false);

  const isVideo =
    field.type === "video";

  async function selectFile(
    file?: File
  ) {
    if (!file) {
      return;
    }

    await onFile(
      field,
      file
    );
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setDragging(false);

    selectFile(
      event.dataTransfer.files?.[0]
    );
  }

  return (
    <div
      className={
        `studio-media-field ${
          dragging
            ? "is-dragging"
            : ""
        }`
      }
      onDragEnter={(
        event
      ) => {
        event.preventDefault();

        setDragging(true);
      }}
      onDragOver={(
        event
      ) => {
        event.preventDefault();
      }}
      onDragLeave={() =>
        setDragging(false)
      }
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        hidden
        type="file"
        accept={
          isVideo
            ? "video/mp4,video/webm,video/quicktime"
            : "image/jpeg,image/png,image/webp,image/avif"
        }
        onChange={(
          event: ChangeEvent<HTMLInputElement>
        ) =>
          selectFile(
            event.target
              .files?.[0]
          )
        }
      />

      {value ? (
        <div className="studio-media-preview">
          {isVideo ? (
            <video
              src={value}
              controls
              preload="metadata"
            />
          ) : (
            // Admin preview.
            // Firebase download URL can be remote.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
            />
          )}

          <div className="studio-media-overlay">
            <button
              type="button"
              onClick={() =>
                inputRef.current?.click()
              }
            >
              <UploadCloud
                size={16}
              />

              Değiştir
            </button>

            <button
              type="button"
              className="media-remove"
              onClick={() =>
                onChange("")
              }
            >
              <Trash2
                size={16}
              />

              Kaldır
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="studio-media-empty"
          onClick={() =>
            inputRef.current?.click()
          }
        >
          <span className="media-upload-icon">
            {isVideo ? (
              <FileVideo2 />
            ) : (
              <ImageIcon />
            )}
          </span>

          <strong>
            {isVideo
              ? "Video yükle"
              : "Görsel yükle"}
          </strong>

          <small>
            Dosyayı buraya sürükle
            veya cihazından seç
          </small>

          <em>
            {isVideo
              ? "MP4, WebM veya MOV"
              : "JPG, PNG, WebP veya AVIF"}
          </em>
        </button>
      )}

      {uploadState?.fieldKey ===
        field.key && (
        <div className="studio-upload-progress">
          <div>
            <span>
              {uploadState.fileName}
            </span>

            <strong>
              {Math.round(
                uploadState.progress
              )}
              %
            </strong>
          </div>

          <i>
            <b
              style={{
                width:
                  `${uploadState.progress}%`,
              }}
            />
          </i>
        </div>
      )}
    </div>
  );
}

export default function CollectionManager({
  collectionName,
  title,
  fields,
}: {
  collectionName: string;

  title: string;

  fields: Field[];
}) {
  const [
    rows,
    setRows,
  ] = useState<Row[]>([]);

  const [
    editing,
    setEditing,
  ] = useState<Row | null>(
    null
  );

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(
    null
  );

  const [
    queryText,
    setQueryText,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    "all" | "active" | "passive"
  >("all");

  const [
    viewMode,
    setViewMode,
  ] = useState<
    "table" | "grid"
  >("table");

  const [
    formValues,
    setFormValues,
  ] = useState<
    Record<string, unknown>
  >({});

  const [
    uploadState,
    setUploadState,
  ] =
    useState<UploadState | null>(
      null
    );

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  useEffect(() => {
    return onSnapshot(
      collection(
        db,
        collectionName
      ),

      (snapshot) => {
        setRows(
          snapshot.docs.map(
            (document) => ({
              id: document.id,
              ...document.data(),
            })
          )
        );
      },

      (snapshotError) => {
        console.error(
          `[${collectionName}] listener error`,
          snapshotError
        );

        setError(
          "İçerikler yüklenemedi."
        );
      }
    );
  }, [
    collectionName,
  ]);

  const filteredRows =
    useMemo(() => {
      const normalized =
        queryText
          .trim()
          .toLocaleLowerCase(
            "tr-TR"
          );

      return rows.filter(
        (row) => {
          const passive =
            row.active === false ||
            row.enabled === false;

          if (
            statusFilter ===
              "active" &&
            passive
          ) {
            return false;
          }

          if (
            statusFilter ===
              "passive" &&
            !passive
          ) {
            return false;
          }

          if (!normalized) {
            return true;
          }

          const haystack = [
            row.title,
            row.name,
            row.subtitle,
            row.category,
            row.description,
            row.key,
          ]
            .map((item) =>
              String(item || "")
            )
            .join(" ")
            .toLocaleLowerCase(
              "tr-TR"
            );

          return haystack.includes(
            normalized
          );
        }
      );
    }, [
      rows,
      queryText,
      statusFilter,
    ]);

  function start(
    row?: Row
  ) {
    setEditing(
      row || null
    );

    setFormValues(
      row
        ? { ...row }
        : {}
    );

    setError("");

    setSuccess("");

    setOpen(true);
  }

  function closeModal() {
    if (
      saving ||
      uploadState
    ) {
      return;
    }

    setOpen(false);

    setEditing(null);

    setFormValues({});

    setError("");
  }

  function updateValue(
    key: string,
    value: unknown
  ) {
    setFormValues(
      (current) => ({
        ...current,

        [key]: value,
      })
    );
  }

  async function uploadMedia(
    field: Field,
    file: File
  ) {
    setError("");

    const isVideo =
      field.type === "video";

    const allowedImageTypes =
      new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
      ]);

    const allowedVideoTypes =
      new Set([
        "video/mp4",
        "video/webm",
        "video/quicktime",
      ]);

    const allowed =
      isVideo
        ? allowedVideoTypes.has(
            file.type
          )
        : allowedImageTypes.has(
            file.type
          );

    if (!allowed) {
      setError(
        isVideo
          ? "Desteklenmeyen video formatı."
          : "Desteklenmeyen görsel formatı."
      );

      return;
    }

    const maxSize =
      isVideo
        ? 250 * 1024 * 1024
        : 15 * 1024 * 1024;

    if (
      file.size > maxSize
    ) {
      setError(
        isVideo
          ? "Video en fazla 250 MB olabilir."
          : "Görsel en fazla 15 MB olabilir."
      );

      return;
    }

    const safeName =
      file.name
        .normalize("NFKD")
        .replace(
          /[^a-zA-Z0-9._-]/g,
          "-"
        )
        .toLowerCase();

    const storagePath =
      `admin-content/` +
      `${collectionName}/` +
      `${field.key}/` +
      `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const storageRef =
      ref(
        storage,
        storagePath
      );

    const task =
      uploadBytesResumable(
        storageRef,
        file,
        {
          contentType:
            file.type,

          customMetadata: {
            collection:
              collectionName,

            field:
              field.key,
          },
        }
      );

    setUploadState({
      fieldKey:
        field.key,

      progress: 0,

      fileName:
        file.name,
    });

    await new Promise<void>(
      (
        resolve,
        reject
      ) => {
        task.on(
          "state_changed",

          (snapshot) => {
            const progress =
              (
                snapshot.bytesTransferred /
                snapshot.totalBytes
              ) *
              100;

            setUploadState({
              fieldKey:
                field.key,

              progress,

              fileName:
                file.name,
            });
          },

          (uploadError) => {
            console.error(
              uploadError
            );

            setUploadState(
              null
            );

            reject(
              uploadError
            );
          },

          async () => {
            const url =
              await getDownloadURL(
                task.snapshot.ref
              );

            updateValue(
              field.key,
              url
            );

            updateValue(
              `${field.key}StoragePath`,
              storagePath
            );

            setUploadState(
              null
            );

            resolve();
          }
        );
      }
    ).catch(() => {
      setError(
        "Dosya yüklenemedi."
      );
    });
  }

  async function save(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (uploadState) {
      setError(
        "Dosya yüklemesi tamamlanmadan kaydedemezsin."
      );

      return;
    }

    setSaving(true);

    setError("");

    setSuccess("");

    try {
      const payload:
        Record<
          string,
          unknown
        > = {
        updatedAt:
          serverTimestamp(),
      };

      for (
        const field of fields
      ) {
        const value =
          formValues[
            field.key
          ];

        if (
          field.type ===
          "number"
        ) {
          payload[
            field.key
          ] =
            Number(value || 0);
        } else if (
          field.type ===
          "boolean"
        ) {
          payload[
            field.key
          ] =
            value !== false;
        } else if (
          field.type ===
          "array"
        ) {
          payload[
            field.key
          ] =
            Array.isArray(
              value
            )
              ? value
              : String(
                  value || ""
                )
                  .split("\n")
                  .map(
                    (item) =>
                      item.trim()
                  )
                  .filter(
                    Boolean
                  );
        } else {
          payload[
            field.key
          ] =
            String(
              value || ""
            );
        }

        const mediaPathKey =
          `${field.key}StoragePath`;

        if (
          field.type ===
            "image" ||
          field.type ===
            "video"
        ) {
          payload[
            mediaPathKey
          ] =
            String(
              formValues[
                mediaPathKey
              ] || ""
            );
        }
      }

      if (
        collectionName ===
        "packages"
      ) {
        const title =
          String(
            payload.title || ""
          ).trim();

        const subtitle =
          String(
            payload.subtitle || ""
          ).trim();

        const description =
          String(
            payload.description || ""
          ).trim();

        const priceFrom =
          Number(
            payload.priceFrom || 0
          );

        const features =
          Array.isArray(
            payload.features
          )
            ? payload.features
            : [];

        const theme = String(
          payload.theme || ""
        )
          .trim()
          .toLowerCase();
        const quoteService = String(payload.quoteService || "")
          .trim()
          .toLowerCase();

        if (
          !title ||
          !subtitle ||
          description.length < 20
        ) {
          throw new Error(
            "Paket için başlık, alt başlık ve en az 20 karakter açıklama zorunlu."
          );
        }

        if (priceFrom <= 0) {
          throw new Error(
            "Başlangıç fiyatı sıfırdan büyük olmalı."
          );
        }

        if (
          features.length < 3
        ) {
          throw new Error(
            "Paket en az 3 özellik içermeli."
          );
        }

        if (
          theme &&
          ![
            "dark",
            "light",
            "neon",
            "graphite",
            "royal",
          ].includes(theme)
        ) {
          throw new Error(
            "Geçerli bir kart teması seçmelisin."
          );
        }

        payload.title = title;
        payload.subtitle = subtitle;
        payload.description =
          description;
        payload.theme =
          theme || "dark";
        if (quoteService && !["web", "software", "video", "social", "hybrid"].includes(quoteService)) {
          throw new Error("Teklif akışı web, software, video, social veya hybrid olmalı.");
        }
        payload.quoteService = quoteService;
      }

      if (editing) {
        await updateDoc(
          doc(
            db,
            collectionName,
            editing.id
          ),

          payload
        );
      } else {
        await addDoc(
          collection(
            db,
            collectionName
          ),

          {
            ...payload,

            createdAt:
              serverTimestamp(),
          }
        );
      }

      setSuccess(
        editing
          ? "Kayıt başarıyla güncellendi."
          : "Yeni içerik başarıyla oluşturuldu."
      );

      setOpen(false);

      setEditing(null);

      setFormValues({});
    } catch (
      saveError
    ) {
      console.error(
        saveError
      );

      setError(
        "Kayıt işlemi tamamlanamadı."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeRow(
    row: Row
  ) {
    const approved =
      window.confirm(
        `"${String(
          row.title ||
          row.name ||
          "Bu kayıt"
        )}" kalıcı olarak silinsin mi?`
      );

    if (!approved) {
      return;
    }

    setDeletingId(
      row.id
    );

    try {
      for (
        const field of fields
      ) {
        if (
          field.type !==
            "image" &&
          field.type !==
            "video"
        ) {
          continue;
        }

        const storagePath =
          String(
            row[
              `${field.key}StoragePath`
            ] || ""
          );

        if (storagePath) {
          try {
            await deleteObject(
              ref(
                storage,
                storagePath
              )
            );
          } catch (
            storageError
          ) {
            console.warn(
              "Media delete warning:",
              storageError
            );
          }
        }
      }

      await deleteDoc(
        doc(
          db,
          collectionName,
          row.id
        )
      );
    } catch (
      deleteError
    ) {
      console.error(
        deleteError
      );

      setError(
        "Kayıt silinemedi."
      );
    } finally {
      setDeletingId(
        null
      );
    }
  }

  function renderField(
    field: Field
  ) {
    const value =
      formValues[field.key];

    if (field.type === "theme") {
      const themes = [
        ["dark", "Executive Dark"],
        ["light", "Editorial Ivory"],
        ["neon", "Digital Neon"],
        ["graphite", "Graphite Pro"],
        ["royal", "Royal Blue"],
      ];

      return (
        <div className="studio-theme-picker">
          {themes.map(([themeKey, themeLabel]) => (
            <button
              type="button"
              key={themeKey}
              className={`theme-choice theme-choice-${themeKey} ${String(value || "dark") === themeKey ? "is-selected" : ""}`}
              onClick={() => updateValue(field.key, themeKey)}
            >
              <i />
              <span>{themeLabel}</span>
              {String(value || "dark") === themeKey && <Check size={14} />}
            </button>
          ))}
        </div>
      );
    }

    if (
      field.type ===
        "image" ||
      field.type ===
        "video"
    ) {
      return (
        <MediaField
          field={field}
          value={String(
            value || ""
          )}
          onChange={(
            mediaValue
          ) =>
            updateValue(
              field.key,
              mediaValue
            )
          }
          uploadState={
            uploadState
          }
          onFile={
            uploadMedia
          }
        />
      );
    }

    if (
      field.type ===
        "textarea" ||
      field.type ===
        "array"
    ) {
      return (
        <textarea
          rows={
            field.type ===
            "array"
              ? 7
              : 5
          }
          value={
            field.type ===
              "array" &&
            Array.isArray(
              value
            )
              ? value.join(
                  "\n"
                )
              : String(
                  value || ""
                )
          }
          placeholder={
            field.placeholder
          }
          onChange={(
            event
          ) =>
            updateValue(
              field.key,
              event.target.value
            )
          }
        />
      );
    }

    if (
      field.type ===
      "boolean"
    ) {
      const checked =
        value === undefined
          ? true
          : value !== false;

      return (
        <button
          type="button"
          className={
            `studio-toggle ${
              checked
                ? "is-active"
                : ""
            }`
          }
          onClick={() =>
            updateValue(
              field.key,
              !checked
            )
          }
        >
          <i>
            <Check
              size={14}
            />
          </i>

          <span>
            {checked
              ? "Aktif"
              : "Pasif"}
          </span>
        </button>
      );
    }

    return (
      <input
        type={
          field.type ===
          "number"
            ? "number"
            : "text"
        }
        value={String(
          value ?? ""
        )}
        placeholder={
          field.placeholder
        }
        onChange={(
          event
        ) =>
          updateValue(
            field.key,
            event.target.value
          )
        }
      />
    );
  }

  return (
    <>
      <div className="studio-page-head">
        <div>
          <p className="admin-kicker">
            DROMOCOB CONTENT STUDIO
          </p>

          <h1>
            {title}
          </h1>

          <p>
            İçerik, medya ve yayın
            durumunu tek merkezden
            yönet.
          </p>
        </div>

        <button
          className="studio-create-button"
          onClick={() =>
            start()
          }
        >
          <Plus
            size={18}
          />

          Yeni içerik

          <ChevronRight
            size={17}
          />
        </button>
      </div>

      {error && (
        <div className="studio-alert studio-alert-error">
          {error}

          <button
            onClick={() =>
              setError("")
            }
          >
            <X
              size={15}
            />
          </button>
        </div>
      )}

      {success && (
        <div className="studio-alert studio-alert-success">
          <Check
            size={16}
          />

          {success}
        </div>
      )}

      <section className="studio-toolbar">
        <div className="studio-search">
          <Search
            size={17}
          />

          <input
            value={queryText}
            onChange={(
              event
            ) =>
              setQueryText(
                event.target.value
              )
            }
            placeholder="İçeriklerde ara..."
          />
        </div>

        <div className="studio-filter">
          <SlidersHorizontal
            size={16}
          />

          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event.target
                  .value as
                  | "all"
                  | "active"
                  | "passive"
              )
            }
          >
            <option value="all">
              Tüm durumlar
            </option>

            <option value="active">
              Aktif
            </option>

            <option value="passive">
              Pasif
            </option>
          </select>
        </div>

        <span className="studio-record-count">
          {filteredRows.length}
          {" "}
          kayıt
        </span>

        <div className="studio-view-switch">
          <button
            className={
              viewMode ===
              "table"
                ? "active"
                : ""
            }
            onClick={() =>
              setViewMode(
                "table"
              )
            }
          >
            <LayoutList
              size={17}
            />
          </button>

          <button
            className={
              viewMode ===
              "grid"
                ? "active"
                : ""
            }
            onClick={() =>
              setViewMode(
                "grid"
              )
            }
          >
            <Grid2X2
              size={16}
            />
          </button>
        </div>
      </section>

      {viewMode === "table" ? (
        <section className="studio-content-card">
          <div className="studio-table-head">
            <span>
              İçerik
            </span>

            <span>
              Durum
            </span>

            <span>
              Kayıt ID
            </span>

            <span>
              İşlem
            </span>
          </div>

          {filteredRows.map(
            (row) => {
              const passive =
                row.active ===
                  false ||
                row.enabled ===
                  false;

              const media =
                fields.find(
                  (field) =>
                    (
                      field.type ===
                        "image" ||
                      field.type ===
                        "video"
                    ) &&
                    row[
                      field.key
                    ]
                );

              return (
                <div
                  className="studio-table-row"
                  key={row.id}
                >
                  <div className="studio-record-info">
                    <div className="studio-record-thumb">
                      {media ? (
                        media.type ===
                        "video" ? (
                          <video
                            src={String(
                              row[
                                media.key
                              ]
                            )}
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={String(
                              row[
                                media.key
                              ]
                            )}
                            alt=""
                          />
                        )
                      ) : (
                        <ImageIcon
                          size={19}
                        />
                      )}
                    </div>

                    <div>
                      <strong>
                        {String(
                          row.title ||
                          row.name ||
                          row.key ||
                          "İsimsiz kayıt"
                        )}
                      </strong>

                      <small>
                        {String(
                          row.subtitle ||
                          row.category ||
                          row.description ||
                          ""
                        ).slice(
                          0,
                          90
                        )}
                      </small>
                    </div>
                  </div>

                  <span>
                    <i
                      className={
                        `studio-state ${
                          passive
                            ? "is-passive"
                            : ""
                        }`
                      }
                    >
                      <b />

                      {passive
                        ? "Pasif"
                        : "Yayında"}
                    </i>
                  </span>

                  <code>
                    {row.id.slice(
                      0,
                      12
                    )}
                    …
                  </code>

                  <div className="studio-row-actions">
                    <button
                      onClick={() =>
                        start(row)
                      }
                    >
                      <Pencil
                        size={16}
                      />
                    </button>

                    <button
                      className="delete"
                      disabled={
                        deletingId ===
                        row.id
                      }
                      onClick={() =>
                        removeRow(
                          row
                        )
                      }
                    >
                      {deletingId ===
                      row.id ? (
                        <Loader2
                          size={16}
                          className="spin"
                        />
                      ) : (
                        <Trash2
                          size={16}
                        />
                      )}
                    </button>
                  </div>
                </div>
              );
            }
          )}

          {!filteredRows.length && (
            <div className="studio-empty">
              <span>
                <Plus />
              </span>

              <h3>
                Henüz içerik yok.
              </h3>

              <p>
                İlk dinamik içeriğini
                oluşturarak başla.
              </p>

              <button
                onClick={() =>
                  start()
                }
              >
                Yeni içerik oluştur
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="studio-record-grid">
          {filteredRows.map(
            (row) => {
              const passive =
                row.active ===
                  false ||
                row.enabled ===
                  false;

              const media =
                fields.find(
                  (field) =>
                    field.type ===
                      "image" &&
                    row[field.key]
                );

              return (
                <article
                  className="studio-grid-card"
                  key={row.id}
                >
                  <div className="studio-grid-media">
                    {media ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={String(
                          row[
                            media.key
                          ]
                        )}
                        alt=""
                      />
                    ) : (
                      <ImageIcon />
                    )}

                    <i
                      className={
                        `studio-state ${
                          passive
                            ? "is-passive"
                            : ""
                        }`
                      }
                    >
                      <b />

                      {passive
                        ? "Pasif"
                        : "Yayında"}
                    </i>
                  </div>

                  <div className="studio-grid-copy">
                    <h3>
                      {String(
                        row.title ||
                        row.name ||
                        "İsimsiz kayıt"
                      )}
                    </h3>

                    <p>
                      {String(
                        row.subtitle ||
                        row.description ||
                        ""
                      ).slice(
                        0,
                        110
                      )}
                    </p>

                    <div>
                      <button
                        onClick={() =>
                          start(row)
                        }
                      >
                        <Pencil
                          size={15}
                        />

                        Düzenle
                      </button>

                      <button
                        className="delete"
                        onClick={() =>
                          removeRow(
                            row
                          )
                        }
                      >
                        <Trash2
                          size={15}
                        />
                      </button>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </section>
      )}

      {open && (
        <div className="studio-modal-backdrop">
          <form
            className="studio-editor"
            onSubmit={save}
          >
            <header className="studio-editor-head">
              <div>
                <p className="admin-kicker">
                  {editing
                    ? "EDIT CONTENT"
                    : "CREATE CONTENT"}
                </p>

                <h2>
                  {editing
                    ? "İçeriği düzenle"
                    : "Yeni içerik oluştur"}
                </h2>

                <p>
                  İçerik ve medya
                  detaylarını yapılandır.
                </p>
              </div>

              <button
                type="button"
                className="studio-close"
                onClick={
                  closeModal
                }
              >
                <X />
              </button>
            </header>

            <div className="studio-editor-content">
              {fields.map(
                (field) => (
                  <label
                    key={
                      field.key
                    }
                    className={
                      `studio-field ${
                        field.fullWidth ||
                        field.type ===
                          "textarea" ||
                        field.type ===
                          "array" ||
                        field.type ===
                          "image" ||
                        field.type ===
                          "video"
                          ? "studio-field-full"
                          : ""
                      }`
                    }
                  >
                    <div className="studio-field-head">
                      <strong>
                        {field.label}
                      </strong>

                      {field.helpText && (
                        <small>
                          {
                            field.helpText
                          }
                        </small>
                      )}
                    </div>

                    {renderField(
                      field
                    )}
                  </label>
                )
              )}
            </div>

            <footer className="studio-editor-footer">
              <button
                type="button"
                className="studio-cancel"
                onClick={
                  closeModal
                }
              >
                Vazgeç
              </button>

              <button
                className="studio-save"
                disabled={
                  saving ||
                  Boolean(
                    uploadState
                  )
                }
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="spin"
                    />

                    Kaydediliyor
                  </>
                ) : uploadState ? (
                  <>
                    <UploadCloud
                      size={17}
                    />

                    Medya yükleniyor
                  </>
                ) : (
                  <>
                    <Check
                      size={17}
                    />

                    {editing
                      ? "Değişiklikleri kaydet"
                      : "İçeriği oluştur"}
                  </>
                )}
              </button>
            </footer>
          </form>
        </div>
      )}
    </>
  );
}
