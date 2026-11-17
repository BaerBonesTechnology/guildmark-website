import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useQueryClient } from "@tanstack/react-query";
type Batch = {
  id: string;
  partner_name: string;
  ownership: string;
  status: string;
  rows: {
    model_name: string;
    quantity: number;
    data_wipe_status: string;
    service_requirement: string;
    listed_price_cents: number;
  }[];
};
type Grant = { id: string; partner_id: string; ownership: string };
export function PartnerImports() {
  const [imports, setImports] = useState<Batch[]>([]),
    [grants, setGrants] = useState<Grant[]>([]),
    [allow, setAllow] = useState<Record<string, boolean>>({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const qc = useQueryClient();
  async function load() {
    try {
      const d = await api.get<{ imports: Batch[]; delegations: Grant[] }>(
        "/seller/partner-imports",
      );
      setImports(d.imports.filter((b) => b.status === "pending"));
      setGrants(d.delegations);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Partner imports unavailable");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function action(id: string, action: string) {
    setBusy(true);
    setError("");
    try {
      await api.post("/seller/partner-imports", {
        id,
        action,
        allow_future_drafts: allow[id] === true,
      });
      await load();
      await qc.invalidateQueries({ queryKey: ["my-listings"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }
  if (!imports.length && !grants.length && !error) return null;
  return (
    <section className="gm-service-files">
      <h2>Partner inventory approvals</h2>
      <p>
        Listings remain yours. Approving a batch creates private drafts;
        business verification and publication remain separate.
      </p>
      {error && (
        <p role="alert" className="gm-service-error">
          {error}
        </p>
      )}
      {imports.map((b) => (
        <article key={b.id} className="gm-partner-import">
          <h3>
            {b.partner_name} ·{" "}
            {b.ownership === "own"
              ? "Own business link"
              : "Consigned inventory"}
          </h3>
          <div className="gm-bulk-preview">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units</th>
                  <th>Wipe</th>
                  <th>Service requirement</th>
                  <th>USD / unit</th>
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.model_name}</td>
                    <td>{r.quantity}</td>
                    <td>{r.data_wipe_status}</td>
                    <td>{r.service_requirement.replaceAll("_", " ")}</td>
                    <td>{(r.listed_price_cents / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <label className="flex gap-2 items-start my-3 text-sm">
            <input
              type="checkbox"
              checked={allow[b.id] === true}
              onChange={(e) =>
                setAllow((a) => ({ ...a, [b.id]: e.target.checked }))
              }
            />
            Allow this partner to prepare future draft batches for this
            ownership arrangement. Publication remains with us.
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              className="gm-button gm-button-small"
              disabled={busy}
              onClick={() => action(b.id, "approve")}
            >
              Approve {b.rows.length} draft listings
            </button>
            <button
              className="gm-text-link"
              disabled={busy}
              onClick={() => action(b.id, "reject")}
            >
              Decline import
            </button>
          </div>
        </article>
      ))}
      {grants.length > 0 && (
        <details>
          <summary>Authorized draft imports ({grants.length})</summary>
          {grants.map((g) => (
            <div className="gm-service-file" key={g.id}>
              <span>
                {g.ownership === "own"
                  ? "Own-business partner"
                  : "Consignment partner"}{" "}
                · {g.partner_id}
              </span>
              <button disabled={busy} onClick={() => action(g.id, "revoke")}>
                Revoke future imports
              </button>
            </div>
          ))}
        </details>
      )}
    </section>
  );
}
