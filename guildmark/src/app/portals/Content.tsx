import { PromotionCreative } from "../components/PromotionSlot";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  useBlocker,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router";
import {
  ArrowLeft,
  Bold,
  ImagePlus,
  List,
  Heading2,
  Link2,
  Plus,
  Save,
  Eye,
  History,
  Upload,
  FileText,
} from "lucide-react";
import { useApi } from "../../../../devdash/src/hooks/useAuth";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { contentKinds, type ContentKind } from "../lib/contentKinds";
import { ArticleBody } from "../components/blog/ArticleBody";

export type ContentAccess = { can_publish_content: boolean };
export type Draft = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  body: string;
  seo_title: string;
  seo_description: string;
  cover_id: string;
  cover_alt: string;
  date: string;
  placement?: string;
  cta_label?: string;
  target_url?: string;
  disclosure?: string;
  sponsor?: string;
  starts_at?: string;
  ends_at?: string;
  priority?: string;
};
type Post = {
  id: string;
  draft: Draft;
  version: number;
  published: Draft | null;
  published_revision: number | null;
  updated_at: string;
};
type Media = {
  id: string;
  name: string;
  alt: string;
  url: string;
  size: number;
  content_type: string;
};
type Revision = {
  version: number;
  draft: Draft;
  action: string;
  actor_name: string;
  created_at: string;
  source_revision?: number;
};
const empty: Draft = {
  title: "",
  slug: "",
  excerpt: "",
  category: "",
  author: "",
  body: "",
  seo_title: "",
  seo_description: "",
  cover_id: "",
  cover_alt: "",
  date: "",
  placement: "marketplace-banner",
  cta_label: "",
  target_url: "",
  disclosure: "announcement",
  sponsor: "",
  starts_at: "",
  ends_at: "",
  priority: "0",
};
const message = (e: unknown) =>
  e instanceof Error
    ? e.message
    : "The content request could not be completed.";
function ErrorText({ error }: { error: string }) {
  return error ? (
    <p role="alert" className="cms-error">
      {error}
    </p>
  ) : null;
}

export function ContentPosts({ kind = "blog" }: { kind?: ContentKind }) {
  const config = contentKinds[kind];
  const api = useApi(),
    ref = useRef(api);
  ref.current = api;
  const [posts, setPosts] = useState<Post[]>([]),
    [cursor, setCursor] = useState<string | null>(null),
    [busy, setBusy] = useState(true),
    [error, setError] = useState("");
  async function load(after?: string) {
    setBusy(true);
    setError("");
    try {
      const r = await ref.current<{
        posts: Post[];
        next_cursor: string | null;
      }>(`${config.api}${after ? `?cursor=${encodeURIComponent(after)}` : ""}`);
      setPosts((old) => (after ? [...old, ...r.posts] : r.posts));
      setCursor(r.next_cursor);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <div className="cms-page">
      <header className="cms-heading">
        <div>
          <p className="cms-kicker">Content workspace</p>
          <h1>{config.label}</h1>
          <p>Prepare drafts, preview the page and publish when it’s ready.</p>
        </div>
        <Button asChild>
          <Link to={`${config.edit}/new`}>
            <Plus size={16} />
            New {config.noun}
          </Link>
        </Button>
      </header>
      <ErrorText error={error} />
      <div className="cms-panel">
        {busy && !posts.length ? (
          <p role="status">Loading content…</p>
        ) : !posts.length ? (
          <div className="cms-empty">
            <FileText size={30} />
            <h2>Your next {config.noun} starts here</h2>
            <p>
              Draft privately. Public content changes only when a publisher
              approves it.
            </p>
          </div>
        ) : (
          <ul className="cms-post-list">
            {posts.map((p) => (
              <li key={p.id}>
                <div>
                  <Link
                    className="cms-post-title"
                    to={`${config.edit}/${p.id}`}
                  >
                    {p.draft.title}
                  </Link>
                  <p className="cms-muted">
                    {kind === "promotion"
                      ? p.draft.placement
                      : `${config.public}/${p.draft.slug}`}
                  </p>
                  <p className="cms-muted">
                    Updated {new Date(p.updated_at).toLocaleString()}
                  </p>
                </div>
                <span className={`cms-badge ${p.published ? "cms-live" : ""}`}>
                  {p.published
                    ? p.published_revision === p.version
                      ? "Published"
                      : "Published · draft changes"
                    : "Draft"}
                </span>
                <Button asChild variant="outline">
                  <Link to={`${config.edit}/${p.id}`}>Edit {config.noun}</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="cms-actions">
        <Button variant="outline" disabled={busy} onClick={() => load()}>
          Refresh content
        </Button>
        {cursor && (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => load(cursor)}
          >
            Load more content
          </Button>
        )}
      </div>
    </div>
  );
}

export function MediaLibrary({ onSelect }: { onSelect?: (m: Media) => void }) {
  const api = useApi(),
    ref = useRef(api);
  ref.current = api;
  const [media, setMedia] = useState<Media[]>([]),
    [cursor, setCursor] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [alt, setAlt] = useState(""),
    [file, setFile] = useState<File | null>(null),
    [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  async function load(after?: string) {
    setBusy(true);
    setError("");
    try {
      const r = await ref.current<{
        media: Media[];
        next_cursor: string | null;
      }>(
        `/admin/content/media${after ? `?cursor=${encodeURIComponent(after)}` : ""}`,
      );
      setMedia((old) => (after ? [...old, ...r.media] : r.media));
      setCursor(r.next_cursor);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (
        file.size > 5 * 1024 * 1024 ||
        !["image/png", "image/jpeg", "image/webp"].includes(file.type)
      )
        throw new Error("Choose a PNG, JPEG or WebP image up to 5 MB.");
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onerror = () => reject(new Error("Image could not be read."));
        r.onload = () => resolve(String(r.result).split(",")[1]);
        r.readAsDataURL(file);
      });
      const m = await ref.current<Media>("/admin/content/media", {
        method: "POST",
        body: JSON.stringify({ name: file.name, alt, base64 }),
      });
      setFile(null);
      setAlt("");
      if (fileInput.current) fileInput.current.value = "";
      setNotice("Image uploaded and ready to use.");
      await load();
      if (onSelect) onSelect(m);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={onSelect ? "cms-picker" : "cms-page"}>
      {!onSelect && (
        <header className="cms-heading">
          <div>
            <p className="cms-kicker">Content workspace</p>
            <h1>Media library</h1>
            <p>Upload once. Reuse images across your content.</p>
          </div>
        </header>
      )}
      <form onSubmit={upload} className="cms-panel cms-upload">
        <div>
          <h2>
            <Upload size={18} />
            Add an image
          </h2>
          <p className="cms-muted">
            PNG, JPEG or WebP, up to 5 MB. Use public editorial images; uploaded
            images can be viewed by anyone with their link.
          </p>
        </div>
        <label>
          Image file
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={busy}
          />
        </label>
        <label>
          Image description
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            required
            maxLength={300}
            placeholder="Describe what the image shows"
            disabled={busy}
          />
        </label>
        <Button type="submit" disabled={busy || !file || !alt.trim()}>
          {busy ? "Working…" : "Upload image"}
        </Button>
      </form>
      <ErrorText error={error} />
      {notice && (
        <p role="status" className="cms-notice">
          {notice}
        </p>
      )}
      <div className="cms-media-grid">
        {media.map((m) => (
          <article className="cms-media-card" key={m.id}>
            <img src={m.url} alt={m.alt} loading="lazy" />
            <div>
              <h3>{m.name}</h3>
              <p>{m.alt}</p>
              <p className="cms-muted">{Math.ceil(m.size / 1024)} KB</p>
              {onSelect && (
                <Button variant="outline" onClick={() => onSelect(m)}>
                  Use image
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
      {!busy && !media.length && (
        <p className="cms-empty">No images yet. Add the first image above.</p>
      )}
      <div className="cms-actions">
        <Button variant="outline" disabled={busy} onClick={() => load()}>
          Refresh images
        </Button>
        {cursor && (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => load(cursor)}
          >
            Load more images
          </Button>
        )}
      </div>
    </div>
  );
}

export function ContentEditor({ kind = "blog" }: { kind?: ContentKind }) {
  const config = contentKinds[kind];
  const { id } = useParams(),
    isNew = !id || id === "new",
    navigate = useNavigate(),
    { can_publish_content: canPublish } = useOutletContext<ContentAccess>();
  const api = useApi(),
    ref = useRef(api);
  ref.current = api;
  const [post, setPost] = useState<Post | null>(null),
    [draft, setDraft] = useState<Draft>(empty),
    [saved, setSaved] = useState(JSON.stringify(empty)),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(!isNew),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [picker, setPicker] = useState<"cover" | "body" | null>(null),
    [coverUrl, setCoverUrl] = useState(""),
    [preview, setPreview] = useState(false),
    [revisions, setRevisions] = useState<Revision[] | null>(null),
    [historyCursor, setHistoryCursor] = useState<string | null>(null),
    [selected, setSelected] = useState<Revision | null>(null),
    [confirm, setConfirm] = useState<
      "publish" | "unpublish" | "restore" | null
    >(null);
  const textarea = useRef<HTMLTextAreaElement>(null),
    newId = useRef(crypto.randomUUID()),
    dirty = JSON.stringify(draft) !== saved;
  const blocker = useBlocker(dirty && !busy);
  useEffect(() => {
    if (!draft.cover_id) {
      setCoverUrl("");
      return;
    }
    let active = true;
    ref
      .current<Media>(`/admin/content/media/${draft.cover_id}`)
      .then((m) => {
        if (active) setCoverUrl(m.url);
      })
      .catch(() => {
        if (active) setCoverUrl("");
      });
    return () => {
      active = false;
    };
  }, [draft.cover_id]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  useEffect(() => {
    if (isNew) return;
    let active = true;
    setLoading(true);
    ref
      .current<Post>(`${config.api}/${id}`)
      .then((p) => {
        if (active) {
          setPost(p);
          setDraft(p.draft);
          setSaved(JSON.stringify(p.draft));
        }
      })
      .catch((e) => {
        if (active) setError(message(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, isNew, config.api]);
  useEffect(() => {
    if (isNew && post && !dirty)
      navigate(`${config.edit}/${post.id}`, { replace: true });
  }, [post, isNew, dirty, navigate, config.edit]);
  function field(key: keyof Draft, value: string) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function insert(before: string, after = "") {
    const t = textarea.current;
    if (!t) return;
    const start = t.selectionStart,
      end = t.selectionEnd;
    field(
      "body",
      draft.body.slice(0, start) +
        before +
        draft.body.slice(start, end) +
        after +
        draft.body.slice(end),
    );
    requestAnimationFrame(() => {
      t.focus();
      t.setSelectionRange(start + before.length, end + before.length);
    });
  }
  async function history(after?: string) {
    setError("");
    try {
      const r = await ref.current<{
        revisions: Revision[];
        next_cursor: string | null;
      }>(
        `${config.api}/${post!.id}/revisions${after ? `?cursor=${encodeURIComponent(after)}` : ""}`,
      );
      setRevisions((old) =>
        after ? [...(old ?? []), ...r.revisions] : r.revisions,
      );
      setHistoryCursor(r.next_cursor);
    } catch (e) {
      setError(message(e));
    }
  }
  async function action(kind: "save" | "publish" | "unpublish" | "restore") {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const creating = !post;
      const p = await ref.current<Post>(
        creating ? config.api : `${config.api}/${post.id}`,
        {
          method: "POST",
          body: JSON.stringify({
            id: creating ? newId.current : post.id,
            action: kind,
            version: post?.version ?? 0,
            ...(kind === "save" ? { draft } : {}),
            ...(kind === "restore" ? { revision: selected!.version } : {}),
          }),
        },
      );
      setPost(p);
      setDraft(p.draft);
      setSaved(JSON.stringify(p.draft));
      setConfirm(null);
      setRevisions(null);
      setSelected(null);
      setNotice(
        kind === "publish"
          ? `${config.noun === "FAQ" ? "FAQ" : config.noun[0].toUpperCase() + config.noun.slice(1)} published. It is available on the website when its placement and schedule apply.`
          : kind === "unpublish"
            ? "Content unpublished. Your draft and history are retained."
            : kind === "restore"
              ? "Revision restored as a new draft. The live content is unchanged until you publish."
              : "Draft saved. The public content is unchanged.",
      );
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  if (!loading && !isNew && !post && error)
    return (
      <div className="cms-page">
        <ErrorText error={error} />
        <Link to={config.list} className="cms-back">
          Back to content
        </Link>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry loading content
        </Button>
      </div>
    );
  if (loading)
    return (
      <p role="status" className="cms-page">
        Loading content…
      </p>
    );
  return (
    <div className="cms-page">
      <Link className="cms-back" to={config.list}>
        <ArrowLeft size={16} />
        All {config.label.toLowerCase()}
      </Link>
      <header className="cms-heading">
        <div>
          <p className="cms-kicker">
            {post?.published ? "Published content" : "Private draft"}
          </p>
          <h1>{`${post ? "Edit" : "New"} ${config.noun}`}</h1>
          <p>
            {dirty
              ? "You have unsaved changes."
              : post
                ? `Saved · revision ${post.version}`
                : "Start with a title and a permanent URL."}
          </p>
        </div>
        <div className="cms-actions">
          <Button variant="outline" onClick={() => setPreview(!preview)}>
            <Eye size={16} />
            {preview ? "Edit text" : "Preview draft"}
          </Button>
          <Button disabled={busy || !dirty} onClick={() => action("save")}>
            <Save size={16} />
            {busy ? "Saving…" : "Save draft"}
          </Button>
        </div>
      </header>
      <ErrorText error={error} />
      {notice && (
        <p role="status" className="cms-notice">
          {notice}
        </p>
      )}
      {preview ? (
        <section className="cms-panel cms-preview" aria-label="Draft preview">
          <p className="cms-preview-label">
            Private preview ·{" "}
            {dirty ? "includes unsaved changes" : "saved draft"}
          </p>
          {kind === "promotion" ? (
            <PromotionCreative promotion={{ ...draft, cover_url: coverUrl }} />
          ) : (
            <>
              <p className="cms-kicker">{draft.category}</p>
              <h1>{draft.title || "Untitled content"}</h1>
              <p>{draft.excerpt}</p>
              {config.byline && (
                <p className="cms-muted">By {draft.author || "GuildMark"}</p>
              )}
              {coverUrl && (
                <img
                  className="cms-cover"
                  src={coverUrl}
                  alt={draft.cover_alt}
                />
              )}
              <ArticleBody body={draft.body} />
            </>
          )}
        </section>
      ) : (
        <div className="cms-editor-grid">
          <div className="cms-panel cms-fields">
            <label>
              {config.title}
              <input
                maxLength={160}
                value={draft.title}
                onChange={(e) => field("title", e.target.value)}
                placeholder={
                  kind === "faq"
                    ? "What would your customer ask?"
                    : "Give your content a clear title"
                }
              />
            </label>
            <label>
              {kind === "promotion"
                ? "Creative ID"
                : kind === "blog"
                  ? "Article URL"
                  : "Content URL"}
              <span className="cms-muted">
                {kind === "promotion"
                  ? "Internal identifier"
                  : `${config.public}/`}
              </span>
              <input
                maxLength={100}
                value={draft.slug}
                onChange={(e) => field("slug", e.target.value)}
                disabled={!!post}
                placeholder="your-content-title"
              />
              <span className="cms-muted">
                {kind === "promotion"
                  ? "A permanent internal ID for this creative; it does not create a public page."
                  : "The URL stays fixed after the first save so existing links keep working."}
              </span>
            </label>
            <label>
              {kind === "blog"
                ? "Excerpt"
                : kind === "faq"
                  ? "Short summary (optional)"
                  : kind === "page"
                    ? "Page summary (optional)"
                    : "Summary"}
              <textarea
                rows={3}
                maxLength={320}
                value={draft.excerpt}
                onChange={(e) => field("excerpt", e.target.value)}
                placeholder="A short introduction for the content list"
              />
            </label>
            {kind !== "promotion" && (
              <div className="cms-field-pair">
                <label>
                  {kind === "page" || kind === "faq"
                    ? "Category (optional)"
                    : "Category"}
                  <input
                    maxLength={60}
                    value={draft.category}
                    onChange={(e) => field("category", e.target.value)}
                  />
                </label>
                {config.byline && (
                  <label>
                    {kind === "help" ? "Author (optional)" : "Author"}
                    <input
                      maxLength={100}
                      value={draft.author}
                      onChange={(e) => field("author", e.target.value)}
                    />
                  </label>
                )}
              </div>
            )}
            <div>
              <label htmlFor="cms-body">{config.body}</label>
              {kind !== "promotion" && (
                <div className="cms-toolbar" aria-label="Formatting tools">
                  <button
                    type="button"
                    aria-label="Bold text"
                    onClick={() => insert("**", "**")}
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Heading"
                    onClick={() => insert("\n## ")}
                  >
                    <Heading2 size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Bullet list"
                    onClick={() => insert("\n- ")}
                  >
                    <List size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Insert link"
                    onClick={() => insert("[", "](https://example.com)")}
                  >
                    <Link2 size={16} />
                  </button>
                  <button type="button" onClick={() => setPicker("body")}>
                    <ImagePlus size={16} />
                    Insert image
                  </button>
                  <span className="cms-muted">Markdown supported</span>
                </div>
              )}
              <textarea
                ref={textarea}
                id="cms-body"
                className={kind === "promotion" ? "" : "cms-body-input"}
                rows={kind === "promotion" ? 4 : 18}
                maxLength={100000}
                value={draft.body}
                onChange={(e) => field("body", e.target.value)}
                placeholder={
                  kind === "faq"
                    ? "Write a clear, useful answer…"
                    : "Write your content here…"
                }
              />
            </div>
          </div>
          <aside className="cms-sidebar">
            {kind === "promotion" && (
              <section className="cms-panel cms-fields">
                <h2>Placement settings</h2>
                <label>
                  Website slot
                  <select
                    aria-label="Website slot"
                    value={draft.placement || "marketplace-banner"}
                    onChange={(e) => field("placement", e.target.value)}
                  >
                    {[
                      "marketplace-banner",
                      "marketplace-native",
                      "home-banner",
                      "content-banner",
                    ].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Disclosure
                  <select
                    aria-label="Disclosure"
                    value={draft.disclosure || "announcement"}
                    onChange={(e) => field("disclosure", e.target.value)}
                  >
                    <option value="announcement">GuildMark announcement</option>
                    <option value="sponsored">Sponsored</option>
                  </select>
                </label>
                {[
                  ["sponsor", "Sponsor name"],
                  ["cta_label", "Button label"],
                  ["target_url", "Destination URL"],
                  ["priority", "Priority (0–1000)"],
                  ["starts_at", "Starts at (UTC, optional)"],
                  ["ends_at", "Ends at (UTC, optional)"],
                ].map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      value={draft[key as keyof Draft] || ""}
                      onChange={(e) =>
                        field(key as keyof Draft, e.target.value)
                      }
                      placeholder={
                        key.endsWith("_at")
                          ? "2026-12-01T00:00:00Z"
                          : key === "target_url"
                            ? "/marketplace or https://…"
                            : undefined
                      }
                    />
                  </label>
                ))}
                <p className="cms-muted">
                  Highest priority active creative wins each slot. Equal
                  priorities use a stable ID order. End time is exclusive. Empty
                  slots take no space. Native placements appear only alongside
                  results. Publishing still requires an administrator.
                </p>
              </section>
            )}

            <section className="cms-panel cms-fields">
              <h2>Publishing</h2>
              <p className="cms-muted">
                {canPublish
                  ? "Publish the saved draft or take this content off the website."
                  : "You can prepare and preview drafts. An administrator must publish them."}
              </p>
              {post?.published && kind !== "promotion" && (
                <a
                  className="cms-text-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${config.public}/${post.draft.slug}`}
                >
                  View published content ↗
                </a>
              )}
              {canPublish && (
                <Button
                  disabled={busy || !post || dirty}
                  onClick={() => setConfirm("publish")}
                >
                  {post?.published
                    ? "Publish changes"
                    : `Publish ${config.noun}`}
                </Button>
              )}
              {canPublish && post?.published && (
                <Button
                  variant="outline"
                  disabled={busy || dirty}
                  onClick={() => setConfirm("unpublish")}
                >
                  Unpublish {config.noun}
                </Button>
              )}
              {dirty && (
                <p className="cms-muted">Save your draft before publishing.</p>
              )}
              {post && (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => history()}
                >
                  <History size={16} />
                  Revision history
                </Button>
              )}
            </section>
            {config.cover && (
              <section className="cms-panel cms-fields">
                <h2>Cover image</h2>
                <Button variant="outline" onClick={() => setPicker("cover")}>
                  {draft.cover_id ? "Change cover image" : "Choose cover image"}
                </Button>
                {draft.cover_id && (
                  <>
                    {coverUrl && (
                      <img
                        className="cms-cover"
                        src={coverUrl}
                        alt={draft.cover_alt}
                      />
                    )}
                    <label>
                      Cover image description
                      <input
                        maxLength={300}
                        value={draft.cover_alt}
                        onChange={(e) => field("cover_alt", e.target.value)}
                      />
                    </label>
                    <button
                      className="cms-text-link"
                      onClick={() =>
                        setDraft((d) => ({ ...d, cover_id: "", cover_alt: "" }))
                      }
                    >
                      Remove cover image
                    </button>
                  </>
                )}
              </section>
            )}
            {kind !== "promotion" && (
              <section className="cms-panel cms-fields">
                <h2>Search and sharing</h2>
                {config.byline && (
                  <label>
                    Display date
                    <input
                      type="date"
                      value={draft.date ?? ""}
                      onChange={(e) => field("date", e.target.value)}
                    />
                    <span className="cms-muted">
                      Leave empty to use the publication date.
                    </span>
                  </label>
                )}
                <label>
                  SEO title
                  <input
                    value={draft.seo_title}
                    maxLength={160}
                    onChange={(e) => field("seo_title", e.target.value)}
                    placeholder="Defaults to the content title"
                  />
                </label>
                <label>
                  SEO description
                  <textarea
                    rows={3}
                    value={draft.seo_description}
                    maxLength={320}
                    onChange={(e) => field("seo_description", e.target.value)}
                    placeholder="Defaults to the summary"
                  />
                </label>
              </section>
            )}
          </aside>
        </div>
      )}
      <Dialog
        open={!!picker}
        onOpenChange={(v) => {
          if (!v) setPicker(null);
        }}
      >
        <DialogContent className="cms-dialog cms-media-dialog">
          <DialogHeader>
            <DialogTitle>Choose an image</DialogTitle>
            <DialogDescription>
              Use an existing image or upload a new one.
            </DialogDescription>
          </DialogHeader>
          <MediaLibrary
            onSelect={(m) => {
              if (picker === "cover")
                setDraft((d) => ({ ...d, cover_id: m.id, cover_alt: m.alt }));
              else {
                const escaped = m.alt.replace(/[\[\]\\]/g, "");
                setDraft((d) => ({
                  ...d,
                  body: d.body + `\n\n![${escaped}](${m.url})\n`,
                }));
              }
              setPicker(null);
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={revisions !== null}
        onOpenChange={(v) => {
          if (!v) {
            setRevisions(null);
            setSelected(null);
          }
        }}
      >
        <DialogContent className="cms-dialog">
          <DialogHeader>
            <DialogTitle>Revision history</DialogTitle>
            <DialogDescription>
              Inspect a saved version. Restoring it creates a new draft and
              preserves the published article.
            </DialogDescription>
          </DialogHeader>
          <ul className="cms-history">
            {revisions?.map((r) => (
              <li key={r.version}>
                <button
                  onClick={() => setSelected(r)}
                  aria-pressed={selected?.version === r.version}
                >
                  <strong>
                    Revision {r.version} · {r.action}
                  </strong>
                  <span>
                    {r.actor_name} · {new Date(r.created_at).toLocaleString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {historyCursor && (
            <Button variant="outline" onClick={() => history(historyCursor)}>
              Load older revisions
            </Button>
          )}
          {selected && (
            <section className="cms-revision">
              <h2>{selected.draft.title}</h2>
              {kind === "promotion" ? (
                <>
                  <PromotionCreative promotion={selected.draft} />
                  <p>
                    Slot: {selected.draft.placement} · Priority:{" "}
                    {selected.draft.priority}
                  </p>
                  <p>
                    UTC schedule: {selected.draft.starts_at || "Immediately"} —{" "}
                    {selected.draft.ends_at || "No end"}
                  </p>
                </>
              ) : (
                <ArticleBody body={selected.draft.body} />
              )}
              <Button
                disabled={busy || dirty}
                onClick={() => setConfirm("restore")}
              >
                Restore revision {selected.version} as draft
              </Button>
              {dirty && <p>Save your current changes before restoring.</p>}
            </section>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!confirm}
        onOpenChange={(v) => {
          if (!v && !busy) setConfirm(null);
        }}
      >
        <DialogContent className="cms-dialog">
          <DialogHeader>
            <DialogTitle>
              {confirm === "publish"
                ? `Publish this ${config.noun}?`
                : confirm === "unpublish"
                  ? `Unpublish this ${config.noun}?`
                  : "Restore this revision?"}
            </DialogTitle>
            <DialogDescription>
              {confirm === "publish"
                ? "The saved draft will replace the content visible to everyone on the website."
                : confirm === "unpublish"
                  ? "This content will be removed from the website. Your draft and revision history remain available."
                  : "The selected revision will become a new draft. Publishing it remains a separate action."}
            </DialogDescription>
          </DialogHeader>
          <ErrorText error={error} />
          <div className="cms-actions">
            <Button disabled={busy} onClick={() => confirm && action(confirm)}>
              {busy ? "Working…" : "Confirm"}
            </Button>
            <Button
              disabled={busy}
              variant="outline"
              onClick={() => setConfirm(null)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={blocker.state === "blocked"}>
        <DialogContent className="cms-dialog">
          <DialogHeader>
            <DialogTitle>Leave unsaved changes?</DialogTitle>
            <DialogDescription>
              Your latest edits have not been saved.
            </DialogDescription>
          </DialogHeader>
          <div className="cms-actions">
            <Button
              onClick={() => blocker.state === "blocked" && blocker.reset()}
            >
              Keep editing
            </Button>
            <Button
              variant="outline"
              onClick={() => blocker.state === "blocked" && blocker.proceed()}
            >
              Discard and leave
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
