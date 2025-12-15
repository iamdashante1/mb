"use client";

import { useEffect, useMemo, useState } from "react";

function formatTimestamp(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

export default function DashboardPage() {
  const [rsvps, setRsvps] = useState([]);
  const [tributes, setTributes] = useState([]);
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState("Loading data...");

  async function loadData() {
    try {
      setStatus("Loading data...");
      const response = await fetch("/api/admin/data");
      if (!response.ok) throw new Error("Unable to load data");
      const data = await response.json();
      setRsvps(data.rsvps || []);
      setTributes(data.tributes || []);
      setStatus("");
    } catch (error) {
      setStatus("Unable to load dashboard data. Please try again.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredRsvps = useMemo(() => {
    if (!filter) return rsvps;
    const term = filter.toLowerCase();
    return rsvps.filter((entry) => `${entry.name || ""} ${entry.email || ""}`.toLowerCase().includes(term));
  }, [filter, rsvps]);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">Family Dashboard</p>
          <h1>Tributes &amp; RSVPs for Michele</h1>
          <p className="dashboard__subtitle">Review every RSVP and tribute submitted through the memorial website.</p>
        </div>
        <div className="dashboard__cta">
          <button className="button button--secondary" onClick={loadData}>
            Refresh
          </button>
        </div>
      </header>

      {status ? <p className="dashboard__status">{status}</p> : null}

      <section className="data-grid">
        <article className="card">
          <div className="card__header">
            <div>
              <h2>RSVPs</h2>
              <p className="muted">Attendance confirmations submitted through the memorial page.</p>
            </div>
            <div className="card__actions">
              <div className="search-bar">
                <label htmlFor="rsvp-filter" className="search-bar__label">
                  Search RSVPs
                </label>
                <div className="search-bar__field">
                  <input
                    type="search"
                    id="rsvp-filter"
                    placeholder="Search by name or email"
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="search-bar__input"
                  />
                </div>
                <p className="search-bar__hint">
                  Showing {filteredRsvps.length} entr{filteredRsvps.length === 1 ? "y" : "ies"}. Filter by guest name or email address.
                </p>
              </div>
            </div>
          </div>
          <div className="record-list">
            {!filteredRsvps.length ? (
              <div className="empty-state">{filter ? "No RSVPs match your search." : "No RSVPs yet."}</div>
            ) : (
              filteredRsvps.map((entry) => (
                <article className="record" key={`${entry.email}-${entry.createdAt}`}>
                  <div className="record__header">
                    <p className="record__name">{entry.name || "Anonymous"}</p>
                    <p className="record__meta">
                      {[entry.email, entry.relationship, formatTimestamp(entry.createdAt)].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                  {entry.message ? <p className="record__body">{entry.message}</p> : null}
                </article>
              ))
            )}
          </div>
        </article>

        <article className="card">
          <div className="card__header">
            <div>
              <h2>Tributes</h2>
              <p className="muted">Memories added to the tribute wall.</p>
            </div>
          </div>
          <div className="record-list">
            {!tributes.length ? (
              <div className="empty-state">No tributes yet.</div>
            ) : (
              tributes.map((entry) => (
                <article className="record" key={`${entry.name}-${entry.createdAt}`}>
                  <div className="record__header">
                    <p className="record__name">{entry.name || "Anonymous"}</p>
                    <p className="record__meta">{formatTimestamp(entry.createdAt)}</p>
                  </div>
                  <p className="record__body">{entry.message}</p>
                </article>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
