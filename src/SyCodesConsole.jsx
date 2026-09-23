import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

export default function SyCodesConsole() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("ALL");
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [error, setError] = useState("");

  const checkAccess = async () => {
    const { data, error: accessError } = await supabase.rpc(
      "is_technical_lead"
    );

    if (accessError || data !== true) {
      setError("TECHNICAL LEAD ACCESS REQUIRED.");
      setAuthorized(false);
      return false;
    }

    setAuthorized(true);
    return true;
  };

  const fetchRegistrations = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const allowed = await checkAccess();
      if (!allowed) return;

      const { data, error: fetchError } = await supabase
        .from("sy_coding_registrations")
        .select(`
          id,
          registration_code,
          name,
          email,
          phone,
          roll_number,
          year,
          division,
          batch,
          status,
          registered_at
        `)
        .order("registered_at", { ascending: false });

      if (fetchError) {
        console.error(fetchError);
        setError("UNABLE TO LOAD SE CODING REGISTRATIONS.");
        return;
      }

      setRegistrations(data || []);

      if (selected) {
        const updated = (data || []).find((item) => item.id === selected.id);
        if (updated) setSelected(updated);
      }
    } catch (err) {
      console.error(err);
      setError("DATABASE CONNECTION FAILED.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session) {
          setError("CONSOLE SESSION REQUIRED.");
          setLoading(false);
          return;
        }

        const { data: technical, error: technicalError } =
          await supabase.rpc("is_technical_lead");

        if (!mounted) return;

        if (technicalError || technical !== true) {
          setError("TECHNICAL LEAD ACCESS REQUIRED.");
          setLoading(false);
          return;
        }

        setAuthorized(true);
        await fetchRegistrations();
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError("DATABASE CONNECTION FAILED.");
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const divisions = useMemo(
    () => [...new Set(registrations.map((item) => item.division).filter(Boolean))].sort(),
    [registrations]
  );

  const batches = useMemo(
    () => [...new Set(registrations.map((item) => item.batch).filter(Boolean))].sort(),
    [registrations]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return registrations.filter((item) => {
      const matchesSearch =
        !query ||
        item.registration_code?.toLowerCase().includes(query) ||
        item.name?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.phone?.toLowerCase().includes(query) ||
        item.roll_number?.toLowerCase().includes(query) ||
        item.division?.toLowerCase().includes(query) ||
        item.batch?.toLowerCase().includes(query);

      const matchesDivision =
        divisionFilter === "ALL" || item.division === divisionFilter;

      const matchesBatch =
        batchFilter === "ALL" || item.batch === batchFilter;

      return matchesSearch && matchesDivision && matchesBatch;
    });
  }, [registrations, search, divisionFilter, batchFilter]);

  if (loading) {
    return (
      <section className="syc-console-section syc-console-loading">
        <span>ACES://CONSOLE/SE-CODING</span>
        <strong>LOADING REGISTRATIONS...</strong>
        <style>{styles}</style>
      </section>
    );
  }

  if (!authorized) {
    return (
      <section className="syc-console-section syc-console-loading">
        <span>ACCESS DENIED</span>
        <strong>{error || "TECHNICAL LEAD ACCESS REQUIRED."}</strong>
        <style>{styles}</style>
      </section>
    );
  }

  return (
    <section className="syc-console-section">
      <div className="syc-console-heading">
        <div>
          <span>05 / SE CODING COMPETITION</span>
          <h1>REGISTRATIONS.</h1>
        </div>

        <div className="syc-console-meta">
          <span>26 SEP 2026</span>
          <span>OFFLINE / HACKERRANK</span>
          <span>STATUS: REGISTERED</span>
        </div>
      </div>

      {error && <div className="syc-console-error">{error}</div>}

      <div className="syc-console-stats">
        <div>
          <span>TOTAL REGISTRATIONS</span>
          <strong>{registrations.length}</strong>
        </div>
        <div>
          <span>ELIGIBILITY</span>
          <strong>SY</strong>
        </div>
        <div>
          <span>DEADLINE</span>
          <strong>25 SEP · 12 PM</strong>
        </div>
        <div>
          <span>PLATFORM</span>
          <strong>HACKERRANK</strong>
        </div>
      </div>

      <div className="syc-console-workspace">
        <div className="syc-console-list">
          <div className="syc-console-list-head">
            <div>
              <span>REGISTERED STUDENTS</span>
              <strong>{filtered.length}</strong>
            </div>
            <button
              type="button"
              onClick={() => fetchRegistrations(true)}
              disabled={refreshing}
            >
              {refreshing ? "REFRESHING..." : "↻ REFRESH"}
            </button>
          </div>

          <div className="syc-console-filters">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="SEARCH NAME / ID / EMAIL / PHONE / ROLL"
            />

            <select
              value={divisionFilter}
              onChange={(event) => setDivisionFilter(event.target.value)}
            >
              <option value="ALL">ALL DIVISIONS</option>
              {divisions.map((division) => (
                <option key={division} value={division}>
                  DIVISION {division}
                </option>
              ))}
            </select>

            <select
              value={batchFilter}
              onChange={(event) => setBatchFilter(event.target.value)}
            >
              <option value="ALL">ALL BATCHES</option>
              {batches.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
          </div>

          <div className="syc-console-table-wrap">
            {filtered.length === 0 ? (
              <div className="syc-console-empty">
                NO REGISTRATIONS MATCH YOUR SEARCH.
              </div>
            ) : (
              <table className="syc-console-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>APPLICANT</th>
                    <th>ROLL</th>
                    <th>DIV / BATCH</th>
                    <th>STATUS</th>
                    <th>REGISTERED</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className={selected?.id === item.id ? "active" : ""}
                      onClick={() => setSelected(item)}
                    >
                      <td>
                        <span className="syc-console-code">
                          {item.registration_code}
                        </span>
                      </td>
                      <td>
                        <strong>{item.name}</strong>
                        <small>{item.email}</small>
                      </td>
                      <td>{item.roll_number}</td>
                      <td>{item.division} / {item.batch}</td>
                      <td>
                        <span className="syc-status">{item.status}</span>
                      </td>
                      <td>{formatDate(item.registered_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <aside className="syc-console-detail">
          {!selected ? (
            <div className="syc-console-detail-empty">
              <span>REGISTRATION INSPECTOR</span>
              <strong>SELECT A STUDENT</strong>
              <p>Click a registration to inspect the complete submission.</p>
            </div>
          ) : (
            <div className="syc-console-detail-inner">
              <div className="syc-detail-top">
                <div>
                  <span>REGISTRATION</span>
                  <strong>{selected.registration_code}</strong>
                </div>
                <button type="button" onClick={() => setSelected(null)}>×</button>
              </div>

              <div className="syc-detail-name">{selected.name}</div>
              <div className="syc-detail-email">{selected.email}</div>

              <DetailGroup title="CONTACT">
                <DetailRow label="PHONE" value={selected.phone} />
                <DetailRow label="EMAIL" value={selected.email} />
              </DetailGroup>

              <DetailGroup title="ACADEMICS">
                <DetailRow label="YEAR" value={selected.year} />
                <DetailRow label="BRANCH" value="COMPUTER ENGINEERING" />
                <DetailRow label="ROLL NUMBER" value={selected.roll_number} />
                <DetailRow label="DIVISION" value={selected.division} />
                <DetailRow label="BATCH" value={selected.batch} />
              </DetailGroup>

              <DetailGroup title="REGISTRATION">
                <DetailRow label="STATUS" value={selected.status} />
                <DetailRow label="REGISTERED" value={formatDate(selected.registered_at)} />
              </DetailGroup>
            </div>
          )}
        </aside>
      </div>

      <style>{styles}</style>
    </section>
  );
}

function DetailGroup({ title, children }) {
  return (
    <div className="syc-detail-group">
      <div className="syc-detail-group-title">{title}</div>
      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="syc-detail-row">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const styles = `
  .syc-console-section {
    margin-top: 22px;
    border-top: 1px solid rgba(0,0,0,.15);
  }

  .syc-console-loading {
    min-height: 420px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 12px;
    text-align: center;
    font-family: "DM Mono", monospace;
  }

  .syc-console-loading span { font-size: 8px; letter-spacing: .12em; color: #777; }
  .syc-console-loading strong { font-size: 13px; letter-spacing: .07em; }

  .syc-console-heading {
    padding: 30px 0 25px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 30px;
    border-bottom: 1px solid rgba(0,0,0,.15);
  }

  .syc-console-heading > div > span,
  .syc-console-meta,
  .syc-console-list-head span,
  .syc-console-stats span,
  .syc-detail-top span,
  .syc-detail-group-title,
  .syc-detail-row span {
    font-family: "DM Mono", monospace;
  }

  .syc-console-heading > div > span {
    font-size: 8px;
    letter-spacing: .1em;
    color: #777;
  }

  .syc-console-heading h1 {
    margin: 10px 0 0;
    font-family: "Space Grotesk", sans-serif;
    font-size: clamp(46px, 6vw, 82px);
    line-height: .8;
    letter-spacing: -.075em;
  }

  .syc-console-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    font-size: 8px;
    letter-spacing: .08em;
    color: #777;
  }

  .syc-console-error {
    margin-top: 15px;
    padding: 12px 15px;
    border: 1px solid rgba(180,0,0,.25);
    color: #9f2020;
    font-family: "DM Mono", monospace;
    font-size: 9px;
    letter-spacing: .08em;
  }

  .syc-console-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-bottom: 1px solid rgba(0,0,0,.15);
  }

  .syc-console-stats > div {
    min-height: 115px;
    padding: 18px;
    border-right: 1px solid rgba(0,0,0,.13);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .syc-console-stats > div:last-child { border-right: 0; }
  .syc-console-stats span { font-size: 7px; letter-spacing: .1em; color: #777; }
  .syc-console-stats strong { font-family: "Space Grotesk", sans-serif; font-size: 27px; letter-spacing: -.05em; }

  .syc-console-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(330px, .7fr);
    min-height: 560px;
    border-left: 1px solid rgba(0,0,0,.15);
  }

  .syc-console-list,
  .syc-console-detail { min-width: 0; border-right: 1px solid rgba(0,0,0,.15); }
  .syc-console-detail { background: rgba(255,255,255,.18); }

  .syc-console-list-head {
    min-height: 62px;
    padding: 12px 17px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    border-bottom: 1px solid rgba(0,0,0,.15);
  }

  .syc-console-list-head > div { display: flex; align-items: center; gap: 12px; }
  .syc-console-list-head span { font-size: 8px; letter-spacing: .1em; color: #777; }
  .syc-console-list-head strong { font-family: "Space Grotesk", sans-serif; font-size: 18px; }
  .syc-console-list-head button {
    border: 1px solid rgba(0,0,0,.18);
    background: transparent;
    padding: 9px 12px;
    font-family: "DM Mono", monospace;
    font-size: 7px;
    letter-spacing: .08em;
    cursor: pointer;
  }
  .syc-console-list-head button:hover { background: #0a0a0a; color: #f2f0e9; }

  .syc-console-filters {
    display: grid;
    grid-template-columns: 1.7fr .7fr .8fr;
    border-bottom: 1px solid rgba(0,0,0,.15);
  }

  .syc-console-filters input,
  .syc-console-filters select {
    min-width: 0;
    border: 0;
    border-right: 1px solid rgba(0,0,0,.14);
    background: transparent;
    padding: 14px;
    outline: none;
    color: #0a0a0a;
    font-family: "DM Mono", monospace;
    font-size: 8px;
  }

  .syc-console-table-wrap { overflow: auto; max-height: 610px; }
  .syc-console-table { width: 100%; border-collapse: collapse; min-width: 780px; }
  .syc-console-table th {
    position: sticky;
    top: 0;
    z-index: 2;
    background: #f2f0e9;
    text-align: left;
    padding: 11px 12px;
    border-bottom: 1px solid rgba(0,0,0,.18);
    font-family: "DM Mono", monospace;
    font-size: 7px;
    letter-spacing: .1em;
    color: #777;
  }

  .syc-console-table td {
    padding: 12px;
    border-bottom: 1px solid rgba(0,0,0,.10);
    vertical-align: middle;
    font-size: 10px;
  }

  .syc-console-table tbody tr { cursor: pointer; transition: background .18s ease; }
  .syc-console-table tbody tr:hover,
  .syc-console-table tbody tr.active { background: rgba(32,227,178,.08); }
  .syc-console-table td strong { display: block; font-family: "Space Grotesk", sans-serif; font-size: 12px; }
  .syc-console-table td small { display: block; margin-top: 3px; font-size: 8px; color: #777; }
  .syc-console-code { font-family: "DM Mono", monospace; font-size: 8px; letter-spacing: .04em; }
  .syc-status { padding: 5px 7px; border: 1px solid #20a986; font-family: "DM Mono", monospace; font-size: 7px; letter-spacing: .06em; }

  .syc-console-empty {
    padding: 60px 20px;
    text-align: center;
    font-family: "DM Mono", monospace;
    color: #777;
    font-size: 9px;
    letter-spacing: .1em;
  }

  .syc-console-detail { position: sticky; top: 0; align-self: start; height: 560px; overflow-y: auto; }
  .syc-console-detail-inner { padding: 22px; }
  .syc-console-detail-empty {
    height: 100%;
    min-height: 400px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: 1px dashed rgba(0,0,0,.15);
    color: #777;
  }
  .syc-console-detail-empty span { font-family: "DM Mono", monospace; font-size: 8px; letter-spacing: .12em; }
  .syc-console-detail-empty strong { margin-top: 12px; color: #0a0a0a; font-family: "Space Grotesk", sans-serif; font-size: 28px; letter-spacing: -.05em; }
  .syc-console-detail-empty p { margin-top: 10px; max-width: 300px; font-size: 12px; line-height: 1.5; }

  .syc-detail-top { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 17px; border-bottom: 1px solid rgba(0,0,0,.15); }
  .syc-detail-top span { display: block; font-size: 8px; letter-spacing: .1em; color: #777; }
  .syc-detail-top strong { display: block; margin-top: 5px; font-family: "DM Mono", monospace; font-size: 11px; }
  .syc-detail-top button { border: 0; background: transparent; cursor: pointer; font-size: 23px; }
  .syc-detail-name { margin-top: 22px; font-family: "Space Grotesk", sans-serif; font-size: clamp(32px, 3.5vw, 48px); line-height: .88; letter-spacing: -.07em; }
  .syc-detail-email { margin-top: 8px; color: #777; font-size: 11px; word-break: break-word; }
  .syc-detail-group { margin-top: 28px; padding-top: 15px; border-top: 1px solid rgba(0,0,0,.14); }
  .syc-detail-group-title { margin-bottom: 11px; font-size: 8px; letter-spacing: .12em; color: #777; }
  .syc-detail-row { display: grid; grid-template-columns: 100px 1fr; gap: 14px; padding: 7px 0; }
  .syc-detail-row span { font-size: 7px; color: #777; }
  .syc-detail-row strong { font-size: 11px; font-weight: 500; word-break: break-word; }

  @media (max-width: 1100px) {
    .syc-console-stats { grid-template-columns: repeat(2, 1fr); }
    .syc-console-stats > div:nth-child(2n) { border-right: 0; }
    .syc-console-workspace { grid-template-columns: 1fr; }
    .syc-console-detail { position: relative; height: auto; min-height: 500px; }
  }

  @media (max-width: 700px) {
    .syc-console-heading { display: block; }
    .syc-console-meta { margin-top: 18px; align-items: flex-start; }
    .syc-console-stats { grid-template-columns: 1fr 1fr; }
    .syc-console-filters { grid-template-columns: 1fr; }
    .syc-console-filters input,
    .syc-console-filters select { border-right: 0; border-bottom: 1px solid rgba(0,0,0,.14); }
    .syc-console-table-wrap { max-height: 500px; }
  }
`;
