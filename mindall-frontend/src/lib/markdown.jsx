// Renders a subset of Markdown: headings, bullets, bold, italic
export const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 8 }} />);
      i++; continue;
    }
    if (line.startsWith("### ")) {
      elements.push(<div key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600, color: "#1A1A1A", marginTop: 16, marginBottom: 4 }}>{line.replace("### ", "")}</div>);
      i++; continue;
    }
    if (line.startsWith("## ")) {
      elements.push(<div key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "#1A1A1A", marginTop: 18, marginBottom: 6 }}>{line.replace("## ", "")}</div>);
      i++; continue;
    }
    if (line.startsWith("# ")) {
      elements.push(<div key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 500, color: "#1A1A1A", marginTop: 20, marginBottom: 8 }}>{line.replace("# ", "")}</div>);
      i++; continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const bulletLines = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        bulletLines.push(lines[i].replace(/^[-*] /, ""));
        i++;
      }
      elements.push(
        <ul key={i} style={{ paddingLeft: 20, margin: "6px 0", display: "flex", flexDirection: "column", gap: 4 }}>
          {bulletLines.map((b, bi) => (
            <li key={bi} style={{ fontSize: 14, lineHeight: 1.7, color: "#2A2A2A" }}
              dangerouslySetInnerHTML={{ __html: b.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>") }}
            />
          ))}
        </ul>
      );
      continue;
    }
    elements.push(
      <p key={i} style={{ fontSize: 14, lineHeight: 1.85, color: "#2A2A2A", margin: "2px 0" }}
        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>") }}
      />
    );
    i++;
  }
  return elements;
};