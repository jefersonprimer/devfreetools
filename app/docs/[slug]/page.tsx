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
        <article className="prose dark:prose-invert prose-neutral max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-table:text-foreground/90 prose-strong:text-foreground prose-a:text-[#DC5A5A] hover:prose-a:text-[#DC5A5A]/80 prose-code:text-[#DC5A5A] dark:prose-code:text-[#DC5A5A] prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-pre:bg-zinc-50 dark:prose-pre:bg-zinc-900/50 prose-pre:border prose-pre:border-border">
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
