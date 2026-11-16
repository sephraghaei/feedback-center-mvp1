import ReactMarkdown from "react-markdown";

function keepLineBreaks(source: string): string {
  if (!source.includes("\n")) return source;
  let fenced = false;
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  return lines
    .map((line, index) => {
      if (/^\s*```/.test(line)) {
        fenced = !fenced;
        return line;
      }
      const next = lines[index + 1];
      if (
        !fenced &&
        next !== undefined &&
        line.trim() !== "" &&
        next.trim() !== "" &&
        !line.endsWith("  ")
      ) {
        return `${line}  `;
      }
      return line;
    })
    .join("\n");
}

export default function Markdown({ source, className = "fb-prose" }: { source: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {keepLineBreaks(source)}
      </ReactMarkdown>
    </div>
  );
}
