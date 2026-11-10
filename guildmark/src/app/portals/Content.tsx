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

export function ContentPosts() {
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
      }>(
        `/admin/content/posts${after ? `?cursor=${encodeURIComponent(after)}` : ""}`,
      );
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
          <h1>Blog articles</h1>
          <p>Prepare drafts, preview the page and publish when it’s ready.</p>
        </div>
        <Button asChild>
          <Link to="/admin/content/posts/new">
            <Plus size={16} />
            New article
          </Link>
        </Button>
      </header>
      <ErrorText error={error} />
      <div className="cms-panel">
        {busy && !posts.length ? (
          <p role="status">Loading articles…</p>
        ) : !posts.length ? (
          <div className="cms-empty">
            <FileText size={30} />
            <h2>Your next article starts here</h2>
            <p>
              Draft privately. The public blog changes only when a publisher
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
                    to={`/admin/content/posts/${p.id}`}
                  >
                    {p.draft.title}
                  </Link>
                  <p className="cms-muted">/blog/{p.draft.slug}</p>
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
                  <Link to={`/admin/content/posts/${p.id}`}>Edit article</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="cms-actions">
        <Button variant="outline" disabled={busy} onClick={() => load()}>
          Refresh articles
        </Button>
        {cursor && (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => load(cursor)}
          >
            Load more articles
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
            <p>Upload once. Reuse images across your articles.</p>
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

export function ContentEditor() {
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
      .current<Post>(`/admin/content/posts/${id}`)
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
  }, [id, isNew]);
  useEffect(() => {
    if (isNew && post && !dirty)
      navigate(`/admin/content/posts/${post.id}`, { replace: true });
  }, [post, isNew, dirty, navigate]);
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
        `/admin/content/posts/${post!.id}/revisions${after ? `?cursor=${encodeURIComponent(after)}` : ""}`,
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
        creating ? "/admin/content/posts" : `/admin/content/posts/${post.id}`,
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
          ? "Article published. It is now visible on the public blog."
          : kind === "unpublish"
            ? "Article unpublished. Your draft and history are retained."
            : kind === "restore"
              ? "Revision restored as a new draft. The live article is unchanged until you publish."
              : "Draft saved. The public article is unchanged.",
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
        <Link to="/admin/content" className="cms-back">
          Back to articles
        </Link>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry loading article
        </Button>
      </div>
    );
  if (loading)
    return (
      <p role="status" className="cms-page">
        Loading article…
      </p>
    );
  return (
    <div className="cms-page">
      <Link className="cms-back" to="/admin/content">
        <ArrowLeft size={16} />
        All articles
      </Link>
      <header className="cms-heading">
        <div>
          <p className="cms-kicker">
            {post?.published ? "Published article" : "Private draft"}
          </p>
          <h1>{post ? "Edit article" : "New article"}</h1>
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
          <p className="cms-kicker">{draft.category}</p>
          <h1>{draft.title || "Untitled article"}</h1>
          <p>{draft.excerpt}</p>
          <p className="cms-muted">By {draft.author || "Author"}</p>
          {coverUrl && (
            <img className="cms-cover" src={coverUrl} alt={draft.cover_alt} />
          )}
          <ArticleBody body={draft.body} />
        </section>
      ) : (
        <div className="cms-editor-grid">
          <div className="cms-panel cms-fields">
            <label>
              Article title
              <input
                maxLength={160}
                value={draft.title}
                onChange={(e) => field("title", e.target.value)}
                placeholder="Give your article a clear title"
              />
            </label>
            <label>
              Article URL<span className="cms-muted">/blog/</span>
              <input
                maxLength={100}
                value={draft.slug}
                onChange={(e) => field("slug", e.target.value)}
                disabled={!!post}
                placeholder="your-article-title"
              />
              <span className="cms-muted">
                The URL stays fixed after the first save so existing links keep
                working.
              </span>
            </label>
            <label>
              Excerpt
              <textarea
                rows={3}
                maxLength={320}
                value={draft.excerpt}
                onChange={(e) => field("excerpt", e.target.value)}
                placeholder="A short introduction for the blog list"
              />
            </label>
            <div className="cms-field-pair">
              <label>
                Category
                <input
                  maxLength={60}
                  value={draft.category}
                  onChange={(e) => field("category", e.target.value)}
                />
              </label>
              <label>
                Author
                <input
                  maxLength={100}
                  value={draft.author}
                  onChange={(e) => field("author", e.target.value)}
                />
              </label>
            </div>
            <div>
              <label htmlFor="cms-body">Article body</label>
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
              <textarea
                ref={textarea}
                id="cms-body"
                className="cms-body-input"
                rows={18}
                maxLength={100000}
                value={draft.body}
                onChange={(e) => field("body", e.target.value)}
                placeholder="Write your article here…"
              />
            </div>
          </div>
          <aside className="cms-sidebar">
            <section className="cms-panel cms-fields">
              <h2>Publishing</h2>
              <p className="cms-muted">
                {canPublish
                  ? "Publish the saved draft or take the article off the public blog."
                  : "You can prepare and preview drafts. An administrator must publish them."}
              </p>
              {post?.published && (
                <a
                  className="cms-text-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`/blog/${post.draft.slug}`}
                >
                  View published article ↗
                </a>
              )}
              {canPublish && (
                <Button
                  disabled={busy || !post || dirty}
                  onClick={() => setConfirm("publish")}
                >
                  {post?.published ? "Publish changes" : "Publish article"}
                </Button>
              )}
              {canPublish && post?.published && (
                <Button
                  variant="outline"
                  disabled={busy || dirty}
                  onClick={() => setConfirm("unpublish")}
                >
                  Unpublish article
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
            <section className="cms-panel cms-fields">
              <h2>Search and sharing</h2>
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
              <label>
                SEO title
                <input
                  value={draft.seo_title}
                  maxLength={160}
                  onChange={(e) => field("seo_title", e.target.value)}
                  placeholder="Defaults to the article title"
                />
              </label>
              <label>
                SEO description
                <textarea
                  rows={3}
                  value={draft.seo_description}
                  maxLength={320}
                  onChange={(e) => field("seo_description", e.target.value)}
                  placeholder="Defaults to the excerpt"
                />
              </label>
            </section>
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
              <ArticleBody body={selected.draft.body} />
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
                ? "Publish this article?"
                : confirm === "unpublish"
                  ? "Unpublish this article?"
                  : "Restore this revision?"}
            </DialogTitle>
            <DialogDescription>
              {confirm === "publish"
                ? "The saved draft will replace the article visible to everyone on the blog."
                : confirm === "unpublish"
                  ? "The article will be removed from the public blog. Your draft and revision history remain available."
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
