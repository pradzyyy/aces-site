import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const STATUS_OPTIONS = [
  "ALL",
  "SUBMITTED",
  "SHORTLISTED",
  "REJECTED",
  "SELECTED",
];

const INTERVIEW_OPTIONS = [
  "ALL",
  "NOT_SCHEDULED",
  "SCHEDULED",
  "COMPLETED",
];

export default function Console() {
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [interviewFilter, setInterviewFilter] =
    useState("ALL");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================================================
  // AUTH
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          window.location.href = "/console/login";
          return;
        }

        const { data: isAdmin, error: adminError } =
          await supabase.rpc("is_admin");

        if (adminError || !isAdmin) {
          await supabase.auth.signOut();
          window.location.href = "/console/login";
          return;
        }

        if (mounted) {
          setAuthorized(true);
          setSessionLoading(false);
        }
      } catch (err) {
        console.error(err);
        window.location.href = "/console/login";
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (!currentSession) {
          window.location.href = "/console/login";
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // =========================================================
  // FETCH APPLICATIONS
  // =========================================================

  const fetchApplications = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const { data, error: fetchError } =
        await supabase
          .from("applications")
          .select(`
            id,
            application_code,
            name,
            email,
            phone,
            year,
            branch,
            division,
            batch,
            primary_domain,
            secondary_domain,
            why_aces,
            experience,
            status,
            interview_status,
            submitted_at
          `)
          .order("submitted_at", {
            ascending: false,
          });

      if (fetchError) {
        console.error(fetchError);
        setError(
          "UNABLE TO LOAD APPLICATIONS."
        );
        return;
      }

      setApplications(data || []);

      if (selectedApplication) {
        const updated =
          (data || []).find(
            (application) =>
              application.id ===
              selectedApplication.id
          );

        if (updated) {
          setSelectedApplication(updated);
        }
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
    if (!authorized) return;

    fetchApplications();
  }, [authorized]);

  // =========================================================
  // FILTERING
  // =========================================================

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        !query ||
        application.application_code
          ?.toLowerCase()
          .includes(query) ||
        application.name
          ?.toLowerCase()
          .includes(query) ||
        application.email
          ?.toLowerCase()
          .includes(query) ||
        application.primary_domain
          ?.toLowerCase()
          .includes(query) ||
        application.secondary_domain
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        application.status === statusFilter;

      const matchesInterview =
        interviewFilter === "ALL" ||
        application.interview_status ===
          interviewFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesInterview
      );
    });
  }, [
    applications,
    search,
    statusFilter,
    interviewFilter,
  ]);

  // =========================================================
  // COUNTS
  // =========================================================

  const counts = useMemo(() => {
    return {
      total: applications.length,

      submitted: applications.filter(
        (item) => item.status === "SUBMITTED"
      ).length,

      shortlisted: applications.filter(
        (item) => item.status === "SHORTLISTED"
      ).length,

      selected: applications.filter(
        (item) => item.status === "SELECTED"
      ).length,

      rejected: applications.filter(
        (item) => item.status === "REJECTED"
      ).length,

      scheduled: applications.filter(
        (item) =>
          item.interview_status === "SCHEDULED"
      ).length,
    };
  }, [applications]);

  // =========================================================
  // UPDATE APPLICATION
  // =========================================================

  const updateApplication = async (
    applicationId,
    field,
    value
  ) => {
    if (!selectedApplication) return;

    setSaving(true);
    setError("");

    try {
      const { data, error: updateError } =
        await supabase
          .from("applications")
          .update({
            [field]: value,
          })
          .eq("id", applicationId)
          .select()
          .single();

      if (updateError) {
        console.error(updateError);
        setError(
          "COULD NOT UPDATE APPLICATION."
        );
        return;
      }

      setSelectedApplication(data);

      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? data
            : application
        )
      );
    } catch (err) {
      console.error(err);
      setError("UPDATE FAILED.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/console/login";
  };

  // =========================================================
  // LOADING / AUTH
  // =========================================================

  if (
    sessionLoading ||
    (authorized && loading)
  ) {
    return (
      <main className="console-page console-loading">
        <div className="console-frame" />

        <div className="console-loading-text">
          <span>ACES://CONSOLE</span>
          <strong>LOADING SYSTEM...</strong>
        </div>

        <style>{consoleStyles}</style>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  // =========================================================
  // MAIN CONSOLE
  // =========================================================

  return (
    <main className="console-page">
      <div className="console-frame" />

      {/* HEADER */}

      <header className="console-header">
        <div>
          <div className="console-brand">
            ACES<span>/</span>CONSOLE
          </div>

          <div className="console-header-sub">
            RECRUITMENT / 2026
          </div>
        </div>

        <div className="console-header-actions">
          <button
            type="button"
            onClick={() =>
              fetchApplications(true)
            }
            disabled={refreshing}
          >
            {refreshing
              ? "REFRESHING..."
              : "↻ REFRESH"}
          </button>

          <button
            type="button"
            onClick={logout}
          >
            LOGOUT ↗
          </button>
        </div>
      </header>

      {/* ERROR */}

      {error && (
        <div className="console-global-error">
          {error}
        </div>
      )}

      {/* STATS */}

      <section className="console-stats">
        <Stat
          label="TOTAL"
          value={counts.total}
        />

        <Stat
          label="SUBMITTED"
          value={counts.submitted}
        />

        <Stat
          label="SHORTLISTED"
          value={counts.shortlisted}
        />

        <Stat
          label="SELECTED"
          value={counts.selected}
        />

        <Stat
          label="REJECTED"
          value={counts.rejected}
        />

        <Stat
          label="INTERVIEW / SCHEDULED"
          value={counts.scheduled}
        />
      </section>

      {/* MAIN CONTENT */}

      <section className="console-workspace">
        {/* LIST */}

        <div className="console-list-panel">
          <div className="console-panel-heading">
            <div>
              <span>APPLICATIONS</span>

              <strong>
                {filteredApplications.length}
              </strong>
            </div>

            <div className="console-panel-note">
              LIVE DATABASE
            </div>
          </div>

          {/* FILTERS */}

          <div className="console-filters">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="SEARCH NAME / ID / EMAIL / DOMAIN"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              {STATUS_OPTIONS.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status === "ALL"
                    ? "ALL APPLICATIONS"
                    : status}
                </option>
              ))}
            </select>

            <select
              value={interviewFilter}
              onChange={(event) =>
                setInterviewFilter(
                  event.target.value
                )
              }
            >
              {INTERVIEW_OPTIONS.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status === "ALL"
                      ? "ALL INTERVIEWS"
                      : status}
                  </option>
                )
              )}
            </select>
          </div>

          {/* TABLE */}

          <div className="console-table-wrap">
            {filteredApplications.length === 0 ? (
              <div className="console-empty">
                NO APPLICATIONS MATCH YOUR SEARCH.
              </div>
            ) : (
              <table className="console-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>APPLICANT</th>
                    <th>YEAR</th>
                    <th>DOMAIN</th>
                    <th>STATUS</th>
                    <th>INTERVIEW</th>
                    <th>SUBMITTED</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map(
                    (application) => (
                      <tr
                        key={application.id}
                        className={
                          selectedApplication?.id ===
                          application.id
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setSelectedApplication(
                            application
                          )
                        }
                      >
                        <td>
                          <span className="console-code">
                            {
                              application.application_code
                            }
                          </span>
                        </td>

                        <td>
                          <strong>
                            {application.name}
                          </strong>

                          <small>
                            {application.email}
                          </small>
                        </td>

                        <td>
                          {application.year}
                        </td>

                        <td>
                          <div className="console-domain-primary">
                            {application.primary_domain || "—"}
                          </div>

                          {application.secondary_domain && (
                            <div className="console-domain-secondary">
                              + {application.secondary_domain}
                            </div>
                          )}
                        </td>

                        <td>
                          <StatusBadge
                            value={
                              application.status
                            }
                          />
                        </td>

                        <td>
                          <StatusBadge
                            value={
                              application.interview_status
                            }
                          />
                        </td>

                        <td>
                          {formatDate(
                            application.submitted_at
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* DETAIL */}

        <aside className="console-detail">
          {!selectedApplication ? (
            <div className="console-detail-empty">
              <span>APPLICATION INSPECTOR</span>

              <strong>
                SELECT AN APPLICANT
              </strong>

              <p>
                Click an application from the
                database to inspect the complete
                submission.
              </p>
            </div>
          ) : (
            <ApplicationDetail
              application={
                selectedApplication
              }
              saving={saving}
              onStatusChange={(value) =>
                updateApplication(
                  selectedApplication.id,
                  "status",
                  value
                )
              }
              onInterviewChange={(value) =>
                updateApplication(
                  selectedApplication.id,
                  "interview_status",
                  value
                )
              }
              onClose={() =>
                setSelectedApplication(null)
              }
            />
          )}
        </aside>
      </section>

      <style>{consoleStyles}</style>
    </main>
  );
}

// =========================================================
// SMALL COMPONENTS
// =========================================================

function Stat({ label, value }) {
  return (
    <div className="console-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusBadge({ value }) {
  return (
    <span
      className={`status-badge status-${String(
        value
      ).toLowerCase()}`}
    >
      {value}
    </span>
  );
}

function ApplicationDetail({
  application,
  saving,
  onStatusChange,
  onInterviewChange,
  onClose,
}) {
  return (
    <div className="console-detail-inner">
      <div className="detail-top">
        <div>
          <span>APPLICATION</span>

          <strong>
            {application.application_code}
          </strong>
        </div>

        <button
          type="button"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="detail-name">
        {application.name}
      </div>

      <div className="detail-email">
        {application.email}
      </div>

      <div className="detail-actions">
        <label>
          <span>APPLICATION STATUS</span>

          <select
            value={application.status}
            onChange={(event) =>
              onStatusChange(
                event.target.value
              )
            }
            disabled={saving}
          >
            <option value="SUBMITTED">
              SUBMITTED
            </option>

            <option value="SHORTLISTED">
              SHORTLISTED
            </option>

            <option value="REJECTED">
              REJECTED
            </option>

            <option value="SELECTED">
              SELECTED
            </option>
          </select>
        </label>

        <label>
          <span>INTERVIEW STATUS</span>

          <select
            value={
              application.interview_status
            }
            onChange={(event) =>
              onInterviewChange(
                event.target.value
              )
            }
            disabled={saving}
          >
            <option value="NOT_SCHEDULED">
              NOT SCHEDULED
            </option>

            <option value="SCHEDULED">
              SCHEDULED
            </option>

            <option value="COMPLETED">
              COMPLETED
            </option>
          </select>
        </label>
      </div>

      <DetailGroup title="CONTACT">
        <DetailRow
          label="PHONE"
          value={application.phone}
        />

        <DetailRow
          label="EMAIL"
          value={application.email}
        />
      </DetailGroup>

      <DetailGroup title="ACADEMICS">
        <DetailRow
          label="YEAR"
          value={application.year}
        />

        <DetailRow
          label="BRANCH"
          value={application.branch}
        />

        <DetailRow
          label="DIVISION"
          value={application.division}
        />

        <DetailRow
          label="BATCH"
          value={application.batch}
        />
      </DetailGroup>

      <DetailGroup title="DOMAINS">
        <DetailRow
          label="PRIMARY"
          value={
            application.primary_domain
          }
        />

        <DetailRow
          label="SECONDARY"
          value={
            application.secondary_domain ||
            "—"
          }
        />
      </DetailGroup>

      <DetailGroup title="WHY ACES">
        <div className="detail-long-text">
          {application.why_aces}
        </div>
      </DetailGroup>

      <DetailGroup title="EXPERIENCE">
        <div className="detail-long-text">
          {application.experience ||
            "No previous experience provided."}
        </div>
      </DetailGroup>

      <div className="detail-submitted">
        SUBMITTED{" "}
        {formatDate(application.submitted_at)}
      </div>
    </div>
  );
}

function DetailGroup({ title, children }) {
  return (
    <div className="detail-group">
      <div className="detail-group-title">
        {title}
      </div>

      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
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

// =========================================================
// STYLES
// =========================================================

const consoleStyles = `
  .console-page {
    min-height: 100svh;
    background: #f2f0e9;
    color: #0a0a0a;
    font-family: "DM Sans", sans-serif;
    padding: 34px;
    position: relative;
    overflow-x: hidden;
  }

  .console-frame {
    position: fixed;
    inset: 7px;
    border: 1px solid rgba(0,0,0,.18);
    pointer-events: none;
    z-index: 20;
  }

  .console-loading {
    display: grid;
    place-items: center;
    min-height: 100svh;
  }

  .console-loading-text {
    display: flex;
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .console-loading-text span,
  .console-loading-text strong {
    font-family: "DM Mono", monospace;
  }

  .console-loading-text span {
    font-size: 9px;
    letter-spacing: .16em;
    color: #777;
  }

  .console-loading-text strong {
    font-size: 15px;
    letter-spacing: .08em;
  }

  .console-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(0,0,0,.15);
  }

  .console-brand {
    font-family: "Space Grotesk", sans-serif;
    font-weight: 700;
    font-size: 24px;
    letter-spacing: -.06em;
  }

  .console-brand span {
    color: #0066ff;
  }

  .console-header-sub,
  .console-panel-heading span,
  .console-panel-note {
    margin-top: 7px;
    font-family: "DM Mono", monospace;
    font-size: 8px;
    letter-spacing: .12em;
    color: #777;
  }

  .console-header-actions {
    display: flex;
    gap: 10px;
  }

  .console-header-actions button {
    border: 1px solid rgba(0,0,0,.18);
    background: transparent;
    padding: 10px 14px;
    font-family: "DM Mono", monospace;
    font-size: 8px;
    letter-spacing: .08em;
    cursor: pointer;
  }

  .console-header-actions button:hover {
    background: #0a0a0a;
    color: #f2f0e9;
  }

  .console-global-error {
    margin-top: 15px;
    padding: 12px 15px;
    border: 1px solid rgba(180,0,0,.25);
    color: #9f2020;
    font-family: "DM Mono", monospace;
    font-size: 9px;
    letter-spacing: .08em;
  }

  .console-stats {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    border-bottom: 1px solid rgba(0,0,0,.15);
  }

  .console-stat {
    min-height: 130px;
    padding: 22px 18px;
    border-right: 1px solid rgba(0,0,0,.13);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .console-stat:last-child {
    border-right: 0;
  }

  .console-stat span {
    font-family: "DM Mono", monospace;
    font-size: 8px;
    letter-spacing: .1em;
    color: #777;
  }

  .console-stat strong {
    font-family: "Space Grotesk", sans-serif;
    font-size: clamp(38px, 5vw, 62px);
    line-height: .8;
    letter-spacing: -.08em;
  }

  .console-workspace {
    margin-top: 22px;
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(360px, .75fr);
    min-height: calc(100vh - 270px);
    border-top: 1px solid rgba(0,0,0,.15);
    border-left: 1px solid rgba(0,0,0,.15);
  }

  .console-list-panel,
  .console-detail {
    min-width: 0;
    border-right: 1px solid rgba(0,0,0,.15);
  }

  .console-detail {
    background: rgba(255,255,255,.18);
  }

  .console-panel-heading {
    padding: 17px 18px;
    border-bottom: 1px solid rgba(0,0,0,.15);
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .console-panel-heading > div:first-child {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .console-panel-heading strong {
    font-family: "Space Grotesk", sans-serif;
    font-size: 19px;
  }

  .console-filters {
    display: grid;
    grid-template-columns: 1.6fr 1fr 1fr;
    border-bottom: 1px solid rgba(0,0,0,.15);
  }

  .console-filters input,
  .console-filters select {
    min-width: 0;
    border: 0;
    border-right: 1px solid rgba(0,0,0,.14);
    background: transparent;
    padding: 14px;
    outline: none;
    color: #0a0a0a;
    font-family: "DM Mono", monospace;
    font-size: 8px;
    letter-spacing: .05em;
  }

  .console-table-wrap {
    overflow: auto;
    max-height: calc(100vh - 390px);
  }

  .console-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 940px;
  }

  .console-table th {
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

  .console-table td {
    padding: 12px;
    border-bottom: 1px solid rgba(0,0,0,.10);
    vertical-align: middle;
    font-size: 11px;
  }

  .console-table tbody tr {
    cursor: pointer;
    transition: background .18s ease;
  }

  .console-table tbody tr:hover,
  .console-table tbody tr.active {
    background: rgba(32,227,178,.08);
  }

  .console-table td strong {
    display: block;
    font-family: "Space Grotesk", sans-serif;
    font-size: 12px;
  }

  .console-table td small {
    display: block;
    margin-top: 3px;
    font-size: 9px;
    color: #777;
  }

  .console-code {
    font-family: "DM Mono", monospace;
    font-size: 8px;
    letter-spacing: .04em;
  }

  .console-domain-primary {
    font-size: 10px;
    line-height: 1.25;
  }

  .console-domain-secondary {
    margin-top: 4px;
    color: #777;
    font-family: "DM Mono", monospace;
    font-size: 7px;
    letter-spacing: .03em;
    line-height: 1.2;
  }

  .console-empty {
    padding: 60px 20px;
    text-align: center;
    font-family: "DM Mono", monospace;
    color: #777;
    font-size: 9px;
    letter-spacing: .1em;
  }

  .status-badge {
    display: inline-block;
    padding: 5px 7px;
    font-family: "DM Mono", monospace;
    font-size: 7px;
    letter-spacing: .06em;
    border: 1px solid rgba(0,0,0,.16);
    white-space: nowrap;
  }

  .status-selected {
    border-color: #20a986;
  }

  .status-shortlisted {
    border-color: #0066ff;
  }

  .status-rejected {
    opacity: .55;
  }

  .status-completed {
    border-color: #20a986;
  }

  .console-detail {
    position: sticky;
    top: 0;
    align-self: start;
    height: calc(100vh - 270px);
    overflow-y: auto;
  }

  .console-detail-inner {
    padding: 22px;
  }

  .console-detail-empty {
    height: 100%;
    min-height: 400px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: 1px dashed rgba(0,0,0,.15);
    color: #777;
  }

  .console-detail-empty span {
    font-family: "DM Mono", monospace;
    font-size: 8px;
    letter-spacing: .12em;
  }

  .console-detail-empty strong {
    margin-top: 12px;
    color: #0a0a0a;
    font-family: "Space Grotesk", sans-serif;
    font-size: 30px;
    letter-spacing: -.05em;
  }

  .console-detail-empty p {
    margin-top: 10px;
    max-width: 300px;
    font-size: 12px;
    line-height: 1.5;
  }

  .detail-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 17px;
    border-bottom: 1px solid rgba(0,0,0,.15);
  }

  .detail-top span {
    display: block;
    font-family: "DM Mono", monospace;
    font-size: 8px;
    letter-spacing: .1em;
    color: #777;
  }

  .detail-top strong {
    display: block;
    margin-top: 5px;
    font-family: "DM Mono", monospace;
    font-size: 11px;
  }

  .detail-top button {
    border: 0;
    background: transparent;
    cursor: pointer;
    font-size: 23px;
  }

  .detail-name {
    margin-top: 22px;
    font-family: "Space Grotesk", sans-serif;
    font-size: clamp(34px, 4vw, 50px);
    line-height: .88;
    letter-spacing: -.07em;
  }

  .detail-email {
    margin-top: 8px;
    color: #777;
    font-size: 11px;
  }

  .detail-actions {
    margin-top: 24px;
    display: grid;
    gap: 10px;
  }

  .detail-actions label {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .detail-actions label span {
    font-family: "DM Mono", monospace;
    font-size: 7px;
    letter-spacing: .1em;
    color: #777;
  }

  .detail-actions select {
    border: 1px solid rgba(0,0,0,.18);
    background: transparent;
    padding: 11px;
    font-family: "DM Mono", monospace;
    font-size: 9px;
    outline: none;
  }

  .detail-group {
    margin-top: 28px;
    padding-top: 15px;
    border-top: 1px solid rgba(0,0,0,.14);
  }

  .detail-group-title {
    margin-bottom: 11px;
    font-family: "DM Mono", monospace;
    font-size: 8px;
    letter-spacing: .12em;
    color: #777;
  }

  .detail-row {
    display: grid;
    grid-template-columns: 95px 1fr;
    gap: 14px;
    padding: 7px 0;
  }

  .detail-row span {
    font-family: "DM Mono", monospace;
    font-size: 7px;
    color: #777;
  }

  .detail-row strong {
    font-size: 11px;
    font-weight: 500;
    word-break: break-word;
  }

  .detail-long-text {
    font-size: 12px;
    line-height: 1.65;
    white-space: pre-wrap;
  }

  .detail-submitted {
    margin-top: 28px;
    padding-top: 14px;
    border-top: 1px solid rgba(0,0,0,.14);
    color: #777;
    font-family: "DM Mono", monospace;
    font-size: 7px;
    letter-spacing: .09em;
  }

  @media (max-width: 1100px) {
    .console-stats {
      grid-template-columns: repeat(3, 1fr);
    }

    .console-workspace {
      grid-template-columns: 1fr;
    }

    .console-detail {
      position: relative;
      height: auto;
      min-height: 500px;
    }
  }

  @media (max-width: 700px) {
    .console-page {
      padding: 22px;
    }

    .console-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .console-header-actions {
      width: 100%;
    }

    .console-header-actions button {
      flex: 1;
    }

    .console-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .console-stat:nth-child(2n) {
      border-right: 0;
    }

    .console-filters {
      grid-template-columns: 1fr;
    }

    .console-filters input,
    .console-filters select {
      border-right: 0;
      border-bottom: 1px solid rgba(0,0,0,.14);
    }

    .console-table-wrap {
      max-height: 500px;
    }
  }
`;