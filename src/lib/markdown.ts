/**
 * Tiny Markdown → HTML renderer for blog posts.
 * Supports: headings, paragraphs, bold/italic, links, images, lists, code blocks, hr.
 * Escapes HTML by default. No external deps.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(md: string): string {
  let s = escapeHtml(md);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" loading="lazy" class="blog-img" />',
  );
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, text, href) => {
      const safe = String(href);
      const isInternal = safe.startsWith("/") || safe.startsWith("#");
      const rel = isInternal ? "" : ' rel="noopener noreferrer" target="_blank"';
      return `<a href="${escapeHtml(safe)}"${rel}>${text}</a>`;
    },
  );
  return s;
}

export function renderMarkdown(md: string): string {
  const lines = (md || "").replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  let inUl = false;
  let inOl = false;
  let inCode = false;
  let codeBuf: string[] = [];

  const closeLists = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCode) {
        out.push(`<pre class="blog-pre"><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
        codeBuf = [];
        inCode = false;
      } else {
        closeLists();
        inCode = true;
      }
      i++;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      i++;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      closeLists();
      out.push("<hr />");
      i++;
      continue;
    }

    const h = /^(#{1,4})\s+(.+)$/.exec(line);
    if (h) {
      closeLists();
      const level = h[1].length;
      out.push(`<h${level} id="${slugId(h[2])}">${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (!inUl) {
        closeLists();
        out.push("<ul>");
        inUl = true;
      }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
      i++;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (!inOl) {
        closeLists();
        out.push("<ol>");
        inOl = true;
      }
      out.push(`<li>${inline(line.replace(/^\d+\.\s+/, ""))}</li>`);
      i++;
      continue;
    }

    if (line.trim() === "") {
      closeLists();
      i++;
      continue;
    }

    closeLists();
    // paragraph — gather consecutive non-empty non-special lines
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("```") &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^---+$/.test(lines[i].trim())
    ) {
      para.push(lines[i]);
      i++;
    }
    out.push(`<p>${inline(para.join(" "))}</p>`);
  }
  closeLists();
  if (inCode) {
    out.push(`<pre class="blog-pre"><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
  }
  return out.join("\n");
}

function slugId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
