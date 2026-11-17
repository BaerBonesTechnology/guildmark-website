import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { InsightPage } from "../../pages/Insights";

/** The editor and public page share rendering. Arbitrary HTML is never executed. */
export function ArticleBody({ body }: { body: string }) {
  return (
    <div className="gm-article-body">
      {body
        .split(/<insight-report\s*\/?>(?:<\/insight-report>)?/i)
        .map((part, i, all) => (
          <div key={i}>
            <ReactMarkdown skipHtml remarkPlugins={[remarkGfm]}>
              {part}
            </ReactMarkdown>
            {i < all.length - 1 && <InsightPage inDrawer />}
          </div>
        ))}
    </div>
  );
}
