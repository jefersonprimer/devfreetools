import { promises as fs } from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";

interface DocsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DocSlugPage({ params }: DocsPageProps) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "docs", "api", `${slug}.md`);

  try {
    const content = await fs.readFile(filePath, "utf8");

    return (
      <div className="max-w-4xl">
        <article className="prose dark:prose-invert prose-blue prose-headings:font-bold prose-code:bg-muted prose-code:p-1 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </article>
      </div>
    );
  } catch (error) {
    console.error(`Error reading doc file: ${filePath}`, error);
    notFound();
  }
}

export async function generateStaticParams() {
  const docsDir = path.join(process.cwd(), "docs", "api");
  try {
    const files = await fs.readdir(docsDir);
    return files
      .filter((file) => file.endsWith(".md"))
      .map((file) => ({
        slug: file.replace(".md", ""),
      }));
  } catch (e) {
    return [];
  }
}
