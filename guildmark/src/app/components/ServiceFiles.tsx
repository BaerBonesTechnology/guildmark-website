import { useEffect, useRef, useState } from "react";
import {
  getAccessToken as customerToken,
  setAccessToken as setCustomerToken,
} from "../lib/api";
import {
  getAccessToken as partnerToken,
  setAccessToken as setPartnerToken,
} from "../../../../partners/src/lib/api";
import { apiUrl } from "../config";
type StoredFile = {
  id: string;
  name: string;
  size: number;
  kind: "iso" | "certificate";
  status: string;
  offset: number;
};
export function ServiceFiles({
  path,
  audience,
  kind,
  canUpload = true,
  onUploaded,
}: {
  path: string;
  audience: "buyer" | "partner";
  kind: "iso" | "certificate";
  canUpload?: boolean;
  onUploaded?: () => void;
}) {
  const [allowed, setAllowed] = useState(true);
  const [files, setFiles] = useState<StoredFile[]>([]),
    [file, setFile] = useState<File | null>(null),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const pending = useRef<StoredFile | null>(null),
    input = useRef<HTMLInputElement>(null),
    abort = useRef(false);
  async function request(
    url: string,
    init: RequestInit = {},
    retry = true,
  ): Promise<Response> {
    const token = (audience === "partner" ? partnerToken : customerToken)();
    const res = await fetch(apiUrl + url, {
      ...init,
      credentials: "include",
      headers: {
        ...init.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.status === 401 && retry) {
      const r = await fetch(
        apiUrl +
          (audience === "partner" ? "/partner/auth/refresh" : "/auth/refresh"),
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        },
      );
      if (r.ok) {
        const d = await r.json();
        (audience === "partner" ? setPartnerToken : setCustomerToken)(
          d.access_token,
        );
        return request(url, init, false);
      }
    }
    return res;
  }
  async function json<T>(url: string, init: RequestInit = {}): Promise<T> {
    const r = await request(url, init);
    const d = await r.json();
    if (!r.ok)
      throw new Error(d.message || "File request failed. Please retry.");
    return d;
  }
  async function load() {
    try {
      const d = await json<{ files: StoredFile[]; upload_allowed?: boolean }>(
        path,
      );
      setFiles(d.files);
      setAllowed(d.upload_allowed !== false);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Files unavailable.");
    }
  }
  useEffect(() => {
    void load();
    return () => {
      abort.current = true;
    };
  }, [path, canUpload]);
  useEffect(() => {
    const f = (e: BeforeUnloadEvent) => {
      if (busy) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", f);
    return () => window.removeEventListener("beforeunload", f);
  }, [busy]);
  async function upload() {
    if (!file) return;
    const limit = kind === "iso" ? 10 * 1024 ** 3 : 20 * 1024 ** 2;
    if (
      file.size > limit ||
      !file.name.toLowerCase().endsWith(kind === "iso" ? ".iso" : ".pdf")
    ) {
      setError(
        kind === "iso"
          ? "Choose an ISO image up to 10 GiB."
          : "Choose a PDF up to 20 MiB.",
      );
      return;
    }
    setBusy(true);
    abort.current = false;
    setError("");
    setNotice("");
    try {
      let state = pending.current;
      if (!state) {
        state = await json<StoredFile>(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, size: file.size }),
        });
        pending.current = state;
      } else state = await json<StoredFile>(path + "/" + state.id);
      let retries = 0;
      while (state.status !== "complete") {
        if (abort.current) {
          setNotice("Upload paused. Keep this page open and retry to resume.");
          return;
        }
        const end = Math.min(file.size, state.offset + 8 * 1024 * 1024);
        try {
          const res = await request(path + "/" + state.id, {
            method: "PUT",
            headers: {
              "Content-Type": "application/octet-stream",
              "X-Upload-Offset": String(state.offset),
            },
            body: file.slice(state.offset, end),
          });
          const d = await res.json();
          if (res.status === 409 && retries++ < 3) {
            state = await json<StoredFile>(path + "/" + state.id);
            continue;
          }
          if (!res.ok)
            throw new Error(
              d.message || "Upload interrupted. Retry to resume.",
            );
          state = d;
          pending.current = state;
          retries = 0;
          setProgress(Math.round((state!.offset / file.size) * 100));
        } catch (e) {
          throw e;
        }
      }
      pending.current = null;
      setFile(null);
      if (input.current) input.current.value = "";
      setNotice("File uploaded privately and ready to download.");
      await load();
      onUploaded?.();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Upload interrupted. Retry to resume.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function download(f: StoredFile) {
    setError("");
    try {
      const d = await json<{ url: string }>(path + "/" + f.id, {
        method: "POST",
      });
      const a = document.createElement("a");
      a.href = apiUrl.replace(/\/api$/, "") + d.url;
      a.download = f.name;
      a.rel = "noreferrer";
      document.body.append(a);
      a.click();
      a.remove();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download unavailable.");
    }
  }
  return (
    <section
      className="gm-service-files"
      aria-label={kind === "iso" ? "Reimage image" : "Service certificate"}
    >
      <button
        type="button"
        className="gm-text-link"
        onClick={() => void load()}
      >
        Refresh files
      </button>
      <h3>
        {audience === "partner"
          ? "Service files"
          : kind === "iso"
            ? "Buyer-supplied reimage image"
            : "PDF certificate"}
      </h3>
      <p>
        {audience === "partner" ? "Download the buyer’s image when supplied. Upload your PDF certificate when this job is awaiting certification (up to 20 MiB)." : kind === "iso"
          ? "Optional ISO, up to 10 GiB. The assigned partner can download it. Upload only images your business is authorized to use. The image locks when reimaging starts."
          : "Upload the service certificate as a PDF, up to 20 MiB. It will be available to the order participants."}
      </p>
      {files.map((f) => (
        <div className="gm-service-file" key={f.id}>
          <div>
            <strong>{f.name}</strong>
            <small>
              {f.kind === "iso" ? "ISO image" : "PDF certificate"} ·{" "}
              {(f.size / 1024 / 1024).toFixed(1)} MiB
            </small>
          </div>
          <button type="button" onClick={() => download(f)}>
            Download {f.kind === "iso" ? "ISO" : "PDF"}
          </button>
        </div>
      ))}
      {!files.length && !error && (
        <p className="gm-service-muted">No file supplied.</p>
      )}
      {canUpload && allowed && (
        <div className="gm-service-upload">
          <label>
            {kind === "iso" ? "Choose ISO image" : "Choose PDF certificate"}
            <input
              ref={input}
              type="file"
              accept={kind === "iso" ? ".iso" : "application/pdf,.pdf"}
              disabled={busy}
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                pending.current = null;
                setProgress(0);
                setError("");
              }}
            />
          </label>
          {file && (
            <p>
              {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MiB
            </p>
          )}
          {(busy || progress > 0) && (
            <>
              <progress
                aria-label="Upload progress"
                max={100}
                value={progress}
              />
              <p role="status">
                {busy ? "Uploading" : "Uploaded"} {progress}%
              </p>
            </>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="gm-button gm-button-small"
              disabled={busy || !file}
              onClick={upload}
            >
              {busy
                ? "Uploading…"
                : pending.current
                  ? "Retry upload"
                  : "Upload file"}
            </button>
            {busy && (
              <button
                type="button"
                onClick={() => {
                  abort.current = true;
                }}
              >
                Pause after this chunk
              </button>
            )}
          </div>
        </div>
      )}
      {canUpload && !allowed && (
        <p role="status">
          Uploads are locked for this order’s current service stage.
        </p>
      )}
      {error && (
        <p role="alert" className="gm-service-error">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}
