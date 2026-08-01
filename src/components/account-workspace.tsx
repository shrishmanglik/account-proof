"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Database,
  FileCheck2,
  Fingerprint,
  Gauge,
  Link2,
  LockKeyhole,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { AccountHealthReviewReceipt, HumanDecisionReceipt, SignalStatus } from "@/domain/contracts";
import { syntheticAccountReviewRequest, syntheticIncompleteAccountReviewRequest } from "@/fixtures/synthetic-account";

type RequestState = "IDLE" | "LOADING" | "READY" | "ERROR";

const statusMeta: Record<SignalStatus, { label: string; className: string }> = {
  GREEN: { label: "Green", className: "status-green" },
  AMBER: { label: "Watch", className: "status-amber" },
  RED: { label: "At risk", className: "status-red" },
  UNKNOWN: { label: "Unknown", className: "status-unknown" },
};

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message ?? "The operation did not complete.");
  return payload as T;
}

export function AccountWorkspace() {
  const [requestState, setRequestState] = useState<RequestState>("IDLE");
  const [review, setReview] = useState<AccountHealthReviewReceipt | null>(null);
  const [decision, setDecision] = useState<HumanDecisionReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [incomplete, setIncomplete] = useState(false);

  const request = useMemo(
    () => incomplete ? syntheticIncompleteAccountReviewRequest : syntheticAccountReviewRequest,
    [incomplete],
  );

  async function runReview() {
    setRequestState("LOADING");
    setReview(null);
    setDecision(null);
    setError(null);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request),
      });
      setReview(await readJson<AccountHealthReviewReceipt>(response));
      setRequestState("READY");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The review could not be completed.");
      setRequestState("ERROR");
    }
  }

  async function recordEscalation() {
    if (!review) return;
    setError(null);
    try {
      const response = await fetch("/api/decisions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reviewReceipt: review,
          reviewerId: "synthetic-account-owner",
          reviewerRole: "ACCOUNT_OWNER",
          decision: "ESCALATE",
          rationale: "Reconcile support and customer evidence before the business review.",
          reviewedDigest: review.receiptDigest,
          acknowledgedEvidence: true,
        }),
      });
      setDecision(await readJson<HumanDecisionReceipt>(response));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The decision could not be recorded.");
    }
  }

  function changeFixture() {
    setIncomplete((current) => !current);
    setRequestState("IDLE");
    setReview(null);
    setDecision(null);
    setError(null);
  }

  return (
    <main className="app-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="AccountProof home">
          <span className="brand-mark">AP</span>
          <span>AccountProof</span>
        </a>
        <div className="nav-links" aria-label="Page sections">
          <a href="#workspace">Workspace</a>
          <a href="#proof">Proof model</a>
          <a href="#boundaries">Boundaries</a>
        </div>
        <span className="demo-chip"><CircleDot size={14} /> Synthetic demo</span>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><ShieldCheck size={15} /> Evidence-bound technical account operations</div>
          <h1>A green dashboard is not a healthy account.</h1>
          <p className="hero-lede">
            AccountProof reconciles CRM, support, deployment, customer, and renewal evidence before a technical account team calls the account healthy.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#workspace">Inspect the workflow <ArrowRight size={17} /></a>
            <a className="button button-quiet" href="#proof">See the proof model</a>
          </div>
          <div className="claim-boundary">
            <LockKeyhole size={17} />
            <p><strong>Public work sample.</strong> No live integrations, customer data, employer affiliation, or autonomous customer action.</p>
          </div>
        </div>

        <div className="hero-visual" aria-label="Account evidence contradiction preview">
          <div className="visual-header">
            <span>Synthetic Account 0042</span>
            <span className="review-state"><AlertTriangle size={14} /> Escalation required</span>
          </div>
          <div className="signal-rail">
            <SignalPill label="CRM" status="GREEN" />
            <span className="rail-line" />
            <SignalPill label="Support" status="RED" />
            <span className="rail-line" />
            <SignalPill label="Customer" status="RED" />
          </div>
          <div className="join-finding">
            <Fingerprint size={24} />
            <div><strong>False-green join detected</strong><span>CRM confidence conflicts with customer-visible state.</span></div>
          </div>
          <div className="receipt-strip"><FileCheck2 size={16} /> rules/1.0.0 · 5/5 evidence receipts · human review required</div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Product operating boundaries">
        <span><Check size={15} /> Deterministic rules first</span>
        <span><Check size={15} /> Exact evidence beside every finding</span>
        <span><Check size={15} /> Human owns the customer decision</span>
        <span><Check size={15} /> UNKNOWN remains visible</span>
      </section>

      <section className="workspace-section" id="workspace">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Live local workflow · synthetic evidence</span>
            <h2>Account reliability workspace</h2>
          </div>
          <button className="fixture-toggle" type="button" onClick={changeFixture}>
            <RefreshCw size={15} /> {incomplete ? "Restore complete evidence" : "Simulate missing source"}
          </button>
        </div>

        <div className="account-bar">
          <div><span>Account</span><strong>Synthetic Account 0042</strong></div>
          <div><span>Region</span><strong>Canada</strong></div>
          <div><span>Review owner</span><strong>Technical account manager</strong></div>
          <div><span>Stop authority</span><strong>Head of TAM</strong></div>
        </div>

        <div className="workspace-grid">
          <div className="evidence-panel">
            <div className="panel-heading">
              <div><Database size={19} /><h3>Evidence spine</h3></div>
              <span>{request.evidence.length} / 5 sources</span>
            </div>
            <div className="evidence-list">
              {request.evidence.map((item) => (
                <article className="evidence-card" key={item.evidenceId}>
                  <div className="evidence-topline">
                    <span className={`status-dot ${statusMeta[item.status].className}`} aria-hidden="true" />
                    <strong>{item.system}</strong>
                    <span className={`status-label ${statusMeta[item.status].className}`}>{statusMeta[item.status].label}</span>
                  </div>
                  <p>{item.summary}</p>
                  <div className="evidence-meta">
                    <span><UserCheck size={13} /> {item.ownerRole}</span>
                    <span><Clock3 size={13} /> {new Date(item.observedAt).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                    <span><Link2 size={13} /> {item.evidenceId}</span>
                  </div>
                </article>
              ))}
              {incomplete && (
                <article className="evidence-card missing-card">
                  <AlertTriangle size={18} />
                  <div><strong>Customer evidence missing</strong><p>The expected denominator stays visible; an absent source cannot become a clean result.</p></div>
                </article>
              )}
            </div>
          </div>

          <div className="decision-panel">
            <div className="panel-heading">
              <div><Gauge size={19} /><h3>Decision trace</h3></div>
              <span>rules/1.0.0</span>
            </div>

            {requestState === "IDLE" && (
              <div className="empty-state">
                <Route size={32} />
                <h4>Trace the account join</h4>
                <p>Validate all five receipts, expose contradictions, and produce one reviewable next action.</p>
                <button className="button button-primary run-button" type="button" onClick={runReview}>Run evidence-bound review <ChevronRight size={17} /></button>
              </div>
            )}

            {requestState === "LOADING" && (
              <div className="empty-state" aria-live="polite">
                <RefreshCw className="spin" size={30} />
                <h4>Validating exact receipts</h4>
                <p>Checking authority, expected set, freshness, conflicts, and replay identity.</p>
              </div>
            )}

            {requestState === "ERROR" && (
              <div className="empty-state error-state" aria-live="polite">
                <AlertTriangle size={30} />
                <h4>Review held</h4>
                <p>{error}</p>
                <button className="button button-primary" type="button" onClick={runReview}>Retry exact request</button>
              </div>
            )}

            {requestState === "READY" && review && (
              <div className="review-result" aria-live="polite">
                <div className={`result-banner ${review.state === "HELD_INCOMPLETE" ? "held" : "escalate"}`}>
                  <AlertTriangle size={19} />
                  <div><span>Deterministic outcome</span><strong>{review.state.replaceAll("_", " ")}</strong></div>
                </div>
                <div className="counts-row">
                  <Metric label="Expected" value={review.stageCounts.expected} />
                  <Metric label="Observed" value={review.stageCounts.observed} />
                  <Metric label="Missing" value={review.stageCounts.missing} />
                  <Metric label="Stale" value={review.stageCounts.stale} />
                </div>
                <div className="finding-stack">
                  {review.findings.map((finding) => (
                    <article key={finding.code}>
                      <span>{finding.severity}</span>
                      <h4>{finding.title}</h4>
                      <p>{finding.explanation}</p>
                      <small>{finding.evidenceIds.length ? finding.evidenceIds.join(" · ") : "No source receipt available"}</small>
                    </article>
                  ))}
                </div>
                <div className="receipt-box" id="proof">
                  <div><FileCheck2 size={17} /><strong>Evidence receipt</strong></div>
                  <dl>
                    <div><dt>Receipt</dt><dd>{review.receiptId}</dd></div>
                    <div><dt>Rule version</dt><dd>{review.rulesVersion}</dd></div>
                    <div><dt>Human authority</dt><dd>{review.humanAuthority}</dd></div>
                    <div><dt>External action</dt><dd>NOT AUTHORIZED</dd></div>
                  </dl>
                  <p>{review.nextAction}</p>
                </div>
                {!decision && review.state !== "HELD_INCOMPLETE" && (
                  <button className="button button-primary decision-button" type="button" onClick={recordEscalation}>
                    <UserCheck size={17} /> Record escalation decision
                  </button>
                )}
                {decision && (
                  <div className="decision-recorded">
                    <Check size={18} />
                    <div><strong>Human decision recorded</strong><span>{decision.decisionReceiptId} · no external action authorized</span></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="model-section" id="boundaries">
        <div className="section-heading model-heading">
          <div><span className="section-kicker">Authority by design</span><h2>The model never owns the account.</h2></div>
          <p>AccountProof separates repeatable calculation from contextual assistance and consequential human judgment.</p>
        </div>
        <div className="boundary-grid">
          <BoundaryCard icon={<Activity />} index="01" title="Deterministic software" body="Validates scope, sources, freshness, expected sets, contradictions, receipt identity, and reconciliation." footer="Implemented · required at runtime" />
          <BoundaryCard icon={<Sparkles />} index="02" title="Bounded AI" body="May later propose a cited summary or next-best question from approved evidence. It cannot alter truth or act." footer="Proposed · absent from runtime" />
          <BoundaryCard icon={<UserCheck />} index="03" title="Named human" body="Owns account health, escalation, customer communication, support disposition, and renewal judgment." footer="Implemented as an explicit gate" />
        </div>
      </section>

      <footer>
        <div className="brand"><span className="brand-mark">AP</span><span>AccountProof</span></div>
        <p>Open work sample · synthetic data · deterministic-first · no employer affiliation</p>
        <a href="https://github.com/shrishmanglik/account-proof">Inspect the source <ArrowRight size={15} /></a>
      </footer>
    </main>
  );
}

function SignalPill({ label, status }: { label: string; status: SignalStatus }) {
  const meta = statusMeta[status];
  return <div className="signal-pill"><span className={`status-dot ${meta.className}`} /><span>{label}</span><strong className={meta.className}>{meta.label}</strong></div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div><strong>{value}</strong><span>{label}</span></div>;
}

function BoundaryCard({ icon, index, title, body, footer: cardFooter }: { icon: React.ReactNode; index: string; title: string; body: string; footer: string }) {
  return <article className="boundary-card"><div className="boundary-icon">{icon}<span>{index}</span></div><h3>{title}</h3><p>{body}</p><small>{cardFooter}</small></article>;
}
