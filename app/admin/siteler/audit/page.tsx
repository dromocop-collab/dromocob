"use client";

import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

type EventRow = {
  id: string;
  siteId?: string;
  type?: string;
  status?: string;
  health?: string;
  commandId?: string;
  remoteStatus?: number;
};

export default function SiteAuditPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(collection(db, "site_events"), orderBy("createdAt", "desc"), limit(200));
    return onSnapshot(
      q,
      snap => {
        setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as EventRow)));
        setError("");
      },
      snapshotError => {
        setEvents([]);
        setError(snapshotError.message || "Site olayları okunamadı.");
      }
    );
  }, []);

  return <>
    <div className="admin-title">
      <div><p className="admin-kicker">FLEET AUDIT LOG</p><h1>Site Event Log</h1><p>Son 200 kontrol ve health olayı.</p></div>
    </div>
    {error && <div className="admin-alert">{error}</div>}
    <section className="admin-panel admin-table-panel">
      <div className="admin-table">
        <div className="table-row table-head"><span>Event</span><span>Durum</span><span>Site</span><span>HTTP</span></div>
        {events.map(event => <div className="table-row" key={event.id}>
          <span><strong>{event.type || "event"}</strong><small>{event.commandId || event.id}</small></span>
          <span><i className="state-pill">{event.status || event.health || "—"}</i></span>
          <span><code>{event.siteId?.slice(0, 10) || "—"}</code></span>
          <span>{event.remoteStatus || "—"}</span>
        </div>)}
      </div>
    </section>
  </>;
}
