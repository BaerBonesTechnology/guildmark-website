import { useEffect, useState } from "react";
import { apiJson } from "../lib/api";
import { PageHeader, Card, Button } from "../components/ui";
type Rate = { name: string; description: string; price: string };
type Catalog = {
  version: number;
  services: { name: string; description: string; price_cents: number }[];
};
export function ServicePricingPage() {
  const [rows, setRows] = useState<Rate[]>([]),
    [version, setVersion] = useState(0),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [dirty, setDirty] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const d = await apiJson<Catalog>("/partner/catalog");
      setRows(
        d.services.map((s) => ({
          name: s.name,
          description: s.description,
          price: (s.price_cents / 100).toFixed(2),
        })),
      );
      setVersion(d.version);
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rates unavailable");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    const f = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", f);
    return () => window.removeEventListener("beforeunload", f);
  }, [dirty]);
  function field(i: number, key: keyof Rate, value: string) {
    setRows((r) =>
      r.map((row, j) => (j === i ? { ...row, [key]: value } : row)),
    );
    setDirty(true);
    setNotice("");
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const services = rows.map((r) => {
        if (!/^\d+(?:\.\d{1,2})?$/.test(r.price))
          throw new Error("Enter a price with up to two decimal places.");
        return {
          name: r.name,
          description: r.description,
          price_cents: Math.round(Number(r.price) * 100),
        };
      });
      const d = await apiJson<Catalog>("/partner/catalog", {
        method: "PUT",
        body: JSON.stringify({ version, services }),
      });
      setVersion(d.version);
      setDirty(false);
      setNotice(
        "Services and rates saved. Existing job amounts are unchanged.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <PageHeader
        title="Services & pricing"
        subtitle="Set the services you offer and your price per device."
      />
      <p className="mb-5 text-sm text-slate-500">
        USD per device. These are your listed rates for future quotes. Job scope
        and the final amount must be agreed before work begins.
      </p>
      {error && (
        <p role="alert" className="mb-4 text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mb-4 text-green-700">
          {notice}
        </p>
      )}
      {loading ? (
        <p role="status">Loading rates…</p>
      ) : (
        <form onSubmit={save}>
          <fieldset disabled={busy} className="space-y-4">
            {rows.map((r, i) => (
              <Card key={i} className="p-5">
                <div className="gm-rate-fields">
                  <label>
                    Service name
                    <input
                      required
                      maxLength={80}
                      value={r.name}
                      onChange={(e) => field(i, "name", e.target.value)}
                      placeholder="e.g. Certified data wipe"
                    />
                  </label>
                  <label>
                    Price per device · USD
                    <input
                      required
                      type="text"
                      inputMode="decimal"
                      value={r.price}
                      onChange={(e) => field(i, "price", e.target.value)}
                      placeholder="0.00"
                    />
                  </label>
                </div>
                <label className="gm-rate-description">
                  What’s included
                  <textarea
                    rows={2}
                    maxLength={500}
                    value={r.description}
                    onChange={(e) => field(i, "description", e.target.value)}
                    placeholder="Describe the method, deliverables and any exclusions."
                  />
                </label>
                <button
                  type="button"
                  className="text-sm text-red-700 mt-3"
                  onClick={() => {
                    setRows((old) => old.filter((_, j) => i !== j));
                    setDirty(true);
                  }}
                >
                  Remove service {i + 1}
                </button>
              </Card>
            ))}
            {!rows.length && (
              <Card className="p-6">
                <h2>No services listed yet</h2>
                <p className="text-sm text-slate-500 mt-2">
                  Add a service such as data wipe, reimaging or device testing.
                </p>
              </Card>
            )}
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={rows.length >= 20}
                onClick={() => {
                  setRows((r) => [
                    ...r,
                    { name: "", description: "", price: "" },
                  ]);
                  setDirty(true);
                }}
              >
                Add service
              </Button>
              <Button type="submit" disabled={!dirty}>
                {busy ? "Saving…" : "Save services & rates"}
              </Button>
              <button
                type="button"
                className="text-sm underline"
                onClick={() => {
                  if (
                    !dirty ||
                    window.confirm("Discard unsaved rates and reload?")
                  )
                    void load();
                }}
              >
                Reload saved rates
              </button>
            </div>
          </fieldset>
        </form>
      )}
    </div>
  );
}
