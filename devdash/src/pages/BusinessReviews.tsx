import { useCallback, useEffect, useRef, useState } from "react";
import { BadgeCheck, RefreshCw } from "lucide-react";
import { useApi } from "../hooks/useAuth";

interface Application {
  id: string; legal_name: string; email: string; registration_country: string;
  registration_number: string; website: string; representative_role: string;
  status: string; revision: number; reason?: string; internal_evidence?: string;
  submitted_at: string; reviewed_at?: string; reviewed_by?: string;
}
interface ReviewEvent { action: string; actor_id: string; reason?: string; submitted_at?: string; reviewed_at?: string; revision: number }
interface ReviewPage { applications: Application[]; next_cursor: string | null }
const STATUSES = ["pending", "needs_information", "approved", "rejected"];
const LABELS: Record<string, string> = { pending: "Awaiting review", needs_information: "More information requested", approved: "Approved", rejected: "Denied" };

/** Standalone page: both the integrated admin portal and DevDash can mount it. */
export function BusinessReviews() {
  const apiFetch = useApi();
  const request = useRef(apiFetch); request.current = apiFetch;
  const [status, setStatus] = useState("pending");
  const [rows, setRows] = useState<Application[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [selected, setSelected] = useState<Application | null>(null);
  const [history, setHistory] = useState<ReviewEvent[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [decision, setDecision] = useState("approved");
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [registry, setRegistry] = useState(false);
  const [authority, setAuthority] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const generation = useRef(0);
  const load = useCallback(async (after?: string) => {
    const current = ++generation.current;
    setLoading(true); setError("");
    try {
      const page = await request.current<ReviewPage>(`/admin/business-verifications?status=${status}${after ? `&cursor=${encodeURIComponent(after)}` : ""}`);
      if (generation.current !== current) return;
      setRows(previous => after ? [...previous, ...page.applications] : page.applications);
      setCursor(page.next_cursor);
    } catch (failure) { if (generation.current === current) setError(failure instanceof Error ? failure.message : "Could not load applications."); }
    finally { if (generation.current === current) setLoading(false); }
  }, [status]);
  useEffect(() => {setRows([]); setSelected(null); void load(); return () => { generation.current++; };}, [load]);
  useEffect(() => {
    setHistory([]); setHistoryError("");
    if (!selected) return;
    let active = true;
    request.current<{ events: ReviewEvent[] }>(`/admin/business-verifications?company_id=${encodeURIComponent(selected.id)}`).then(data => {if (active) setHistory(data.events);}).catch(() => {if (active) setHistoryError("Could not load audit history. Refresh to retry.");});
    return () => {active = false;};
  }, [selected?.id]);

  function select(application: Application) {
    setSelected(application); setReason(""); setEvidence(""); setRegistry(false); setAuthority(false); setDecision("approved"); setError(""); setNotice("");
  }
  async function review(event: React.FormEvent) {
    event.preventDefault(); if (!selected || saving) return;
    setSaving(true); setError(""); setNotice("");
    try {
      await request.current("/admin/business-verifications", { method: "POST", body: JSON.stringify({ company_id: selected.id, revision: selected.revision, decision, reason, internal_evidence: evidence, registry_checked: registry, authority_checked: authority }) });
      setNotice(`${selected.legal_name}: ${LABELS[decision]}. The reason and reviewer were recorded.`);
      setSelected(null); await load();
    } catch (failure) {setError(failure instanceof Error ? failure.message : "Decision could not be saved. Refresh before trying again.");}
    finally {setSaving(false);}
  }
  return <div className="p-6 text-slate-200">
    <header className="flex flex-wrap items-start justify-between gap-4 mb-6"><div><h1 className="text-xl font-semibold text-white flex items-center gap-2"><BadgeCheck size={22}/>Business verification</h1><p className="text-sm text-slate-400 mt-2 max-w-2xl">Review seller business verification applications. Approve only after checking registration and the applicant’s authority. Denial blocks new sales; it does not close the customer’s account.</p></div><button className="px-3 py-2 border border-slate-700 rounded text-sm flex items-center gap-2" disabled={loading || saving} onClick={() => {setSelected(null); void load();}}><RefreshCw size={15}/>Refresh queue</button></header>
    <p className="text-xs text-slate-400 mb-4">Restricted to active super admins and compliance staff. Every decision requires a reason visible to the applicant.</p>
    <label className="block text-sm mb-5">Application status <select className="ml-3 bg-slate-900 border border-slate-700 rounded px-3 py-2" value={status} disabled={saving} onChange={event => setStatus(event.target.value)}>{STATUSES.map(value => <option key={value} value={value}>{LABELS[value]}</option>)}</select></label>
    {notice && <p role="status" className="text-green-400 mb-4">{notice}</p>}
    {error && <p role="alert" className="text-red-400 mb-4">{error}</p>}
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <section aria-label="Applications" className="border border-slate-800 rounded-lg overflow-hidden">
        {loading && rows.length === 0 ? <p role="status" className="p-5 text-slate-400">Loading applications…</p> : rows.length === 0 ? <p className="p-5 text-slate-400">{error ? "Applications are unavailable." : "No applications in this status."}</p> : <ul>{rows.map(application => <li key={application.id} className="border-b border-slate-800 last:border-0"><button className={`p-4 w-full text-left hover:bg-slate-800 ${selected?.id === application.id ? "bg-slate-800" : "bg-slate-900"}`} disabled={saving} onClick={() => select(application)} aria-pressed={selected?.id === application.id}><strong className="text-white block">{application.legal_name}</strong><span className="block text-sm text-slate-400 break-all mt-1">{application.email}</span><span className="block text-xs text-slate-400 mt-2">{application.registration_country} · {new Date(application.submitted_at).toLocaleDateString()}</span></button></li>)}</ul>}
        {cursor && <button className="p-4 w-full text-sm text-blue-400" disabled={loading || saving} onClick={() => void load(cursor)}>Load more applications</button>}
      </section>
      <section className="border border-slate-800 rounded-lg p-5 min-w-0" aria-label="Application review">
        {!selected ? <p className="text-sm text-slate-400">Select a business to inspect its application and review history.</p> : <>
          <h2 className="text-lg text-white font-semibold break-words">{selected.legal_name}</h2>
          <dl className="text-sm mt-4 space-y-3">
            {[['Work email', selected.email], ['Registration country', selected.registration_country], ['Registration number', selected.registration_number], ['Website (applicant supplied)', selected.website], ['Applicant’s role', selected.representative_role], ['Status', LABELS[selected.status]], ['Last reviewer', selected.reviewed_by], ['Decision reason', selected.reason], ['Internal evidence', selected.internal_evidence]].map(([label, value]) => value ? <div key={label}><dt className="text-slate-400">{label}</dt><dd className="text-slate-200 break-words whitespace-pre-wrap">{value}</dd></div> : null)}
          </dl>
          <p className="text-xs text-slate-400 mt-4">Email ownership was confirmed before submission. The website is applicant supplied; independently locate the official registry and verify representation.</p>
          {selected.status === "pending" && <form onSubmit={review} className="mt-6"><fieldset disabled={saving} className="space-y-4"><legend className="text-sm font-semibold text-white mb-3">Record your decision</legend>
            <label className="block text-sm">Decision<select className="block w-full mt-2 bg-slate-900 border border-slate-700 rounded p-2" value={decision} onChange={event => setDecision(event.target.value)}><option value="approved">Approve badge</option><option value="needs_information">Request more information</option><option value="rejected">Deny badge</option></select></label>
            {decision === "approved" && <div className="space-y-3 text-sm"><label className="flex gap-2 items-start"><input type="checkbox" required checked={registry} onChange={event => setRegistry(event.target.checked)}/>I checked the business against the official registry.</label><label className="flex gap-2 items-start"><input type="checkbox" required checked={authority} onChange={event => setAuthority(event.target.checked)}/>I checked the applicant’s authority to represent this business.</label></div>}
            <label className="block text-sm">Internal evidence {decision !== "approved" && "(optional)"}<textarea className="block w-full mt-2 bg-slate-900 border border-slate-700 rounded p-2" rows={4} maxLength={4000} required={decision === "approved"} value={evidence} onChange={event => setEvidence(event.target.value)} placeholder="Registry source and record checked; how representation was established. Do not paste sensitive identity documents."/></label>
            <label className="block text-sm">Reason shown to applicant<textarea className="block w-full mt-2 bg-slate-900 border border-slate-700 rounded p-2" rows={3} required maxLength={2000} value={reason} onChange={event => setReason(event.target.value)}/></label>
            <button className="w-full bg-blue-600 text-white rounded px-4 py-3 disabled:opacity-50" type="submit">{saving ? "Saving decision…" : "Save decision and reason"}</button>
          </fieldset></form>}
          <h3 className="text-sm font-semibold text-white mt-6 mb-3">Audit history</h3>
          {historyError && <p role="alert" className="text-red-400 text-sm">{historyError}</p>}
          <ol className="text-sm space-y-3">{history.map((entry, index) => <li key={`${entry.revision}-${index}`} className="border-t border-slate-800 pt-3"><strong>{entry.action}</strong><p className="text-xs text-slate-400">Revision {entry.revision} · {entry.actor_id} · {new Date(entry.reviewed_at ?? entry.submitted_at ?? "").toLocaleString()}</p>{entry.reason && <p className="whitespace-pre-wrap break-words mt-1">{entry.reason}</p>}</li>)}</ol>
        </>}
      </section>
    </div>
  </div>;
}
