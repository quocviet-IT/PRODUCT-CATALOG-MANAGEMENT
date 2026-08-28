# -*- coding: utf-8 -*-
"""Chuyen PRD markdown thanh trang HTML de xuat ban Artifact."""
import io, re, html, sys

SRC = r"C:\Users\pit010\catalogue-quote-system\docs\superpowers\specs\2026-08-28-catalogue-quote-system-design.md"
OUT = r"C:\Users\pit010\catalogue-quote-system\docs\prd.html"

md = io.open(SRC, encoding="utf-8").read().split("\n")

# ---------- inline ----------
def inline(t):
    t = html.escape(t, quote=False)
    codes = []
    def stash(m):
        codes.append(m.group(1))
        return "\x00%d\x00" % (len(codes) - 1)
    t = re.sub(r"`([^`]+)`", stash, t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"<em>\1</em>", t)
    t = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', t)
    t = re.sub(r"\x00(\d+)\x00", lambda m: "<code>%s</code>" % codes[int(m.group(1))], t)
    return t

def slug(t):
    t = re.sub(r"[^0-9A-Za-z]+", "-", t).strip("-").lower()
    return t or "s"

# ---------- pass 1: gom khoi ----------
out = []
toc = []
i = 0
n = len(md)
open_card = False
open_section = False

def close_card():
    global open_card
    if open_card:
        out.append("</article>")
        open_card = False

def close_section():
    global open_section
    close_card()
    if open_section:
        out.append("</section>")
        open_section = False

PRIO_CLASS = {"P0": "p0", "P1": "p1", "P2": "p2"}

while i < n:
    line = md[i]
    s = line.strip()

    # --- fenced code ---
    if s.startswith("```"):
        i += 1
        buf = []
        while i < n and not md[i].strip().startswith("```"):
            buf.append(html.escape(md[i], quote=False))
            i += 1
        i += 1
        out.append('<div class="scroll"><pre><code>%s</code></pre></div>' % "\n".join(buf))
        continue

    # --- horizontal rule -> ket thuc section ---
    if s == "---":
        close_section()
        i += 1
        continue

    # --- H1 ---
    if s.startswith("# ") and not s.startswith("## "):
        out.append('<header class="masthead"><p class="eyebrow">Product Requirements Document</p><h1>%s</h1></header>' % inline(s[2:]))
        i += 1
        continue

    # --- H2 ---
    if s.startswith("## "):
        close_section()
        txt = s[3:]
        m = re.match(r"^(\d+)\.\s+(.*)$", txt)
        num, title = (m.group(1), m.group(2)) if m else ("", txt)
        sid = "s%s-%s" % (num, slug(title)) if num else slug(title)
        toc.append((num, title, sid))
        out.append('<section id="%s"><h2>%s<span class="h2-title">%s</span></h2>'
                   % (sid, ('<span class="h2-num">%s</span>' % num) if num else "", inline(title)))
        open_section = True
        i += 1
        continue

    # --- H3 ---
    if s.startswith("### "):
        close_card()
        out.append("<h3>%s</h3>" % inline(s[4:]))
        i += 1
        continue

    # --- H4: the yeu cau ---
    if s.startswith("#### "):
        close_card()
        txt = s[5:]
        m = re.match(r"^([A-G]\d+)\.\s+(.*?)\s*\u00b7\s*(P[012])\s*$", txt)
        if m:
            rid, title, prio = m.groups()
            out.append('<article class="req" id="req-%s">'
                       '<div class="req-head"><span class="req-id">%s</span>'
                       '<h4>%s</h4><span class="chip %s">%s</span></div>'
                       % (rid, rid, inline(title), PRIO_CLASS[prio], prio))
        else:
            out.append('<article class="req"><div class="req-head"><h4>%s</h4></div>' % inline(txt))
        open_card = True
        i += 1
        continue

    # --- bang ---
    if s.startswith("|"):
        rows = []
        while i < n and md[i].strip().startswith("|"):
            rows.append(md[i].strip())
            i += 1
        def cells(r):
            r = r.strip()
            if r.startswith("|"): r = r[1:]
            if r.endswith("|"): r = r[:-1]
            return [c.strip() for c in r.split("|")]
        head = cells(rows[0])
        body = rows[2:] if len(rows) > 1 and set(rows[1].replace("|", "").replace(" ", "")) <= set("-:") else rows[1:]
        has_head = any(c for c in head)
        t = ['<div class="scroll"><table>']
        if has_head:
            t.append("<thead><tr>%s</tr></thead>" % "".join("<th>%s</th>" % inline(c) for c in head))
        t.append("<tbody>")
        if not has_head:
            t.append("<tr>%s</tr>" % "".join("<td>%s</td>" % inline(c) for c in head))
        for r in body:
            t.append("<tr>%s</tr>" % "".join("<td>%s</td>" % inline(c) for c in cells(r)))
        t.append("</tbody></table></div>")
        out.append("".join(t))
        continue

    # --- blockquote ---
    if s.startswith("> "):
        buf = []
        while i < n and md[i].strip().startswith(">"):
            buf.append(md[i].strip().lstrip(">").strip())
            i += 1
        out.append("<blockquote>%s</blockquote>" % inline(" ".join(buf)))
        continue

    # --- danh sach ---
    if re.match(r"^[-*]\s+", s) or re.match(r"^\d+\.\s+", s):
        ordered = bool(re.match(r"^\d+\.\s+", s))
        items = []
        while i < n:
            cur = md[i].strip()
            if re.match(r"^[-*]\s+", cur):
                items.append(re.sub(r"^[-*]\s+", "", cur))
            elif re.match(r"^\d+\.\s+", cur):
                items.append(re.sub(r"^\d+\.\s+", "", cur))
            elif cur and md[i].startswith("  ") and items:
                items[-1] += " " + cur
            else:
                break
            i += 1
        tag = "ol" if ordered else "ul"
        out.append("<%s>%s</%s>" % (tag, "".join("<li>%s</li>" % inline(x) for x in items), tag))
        continue

    # --- doan van ---
    if s:
        buf = [s]
        i += 1
        while i < n and md[i].strip() and not re.match(r"^(#|\||>|```|---|[-*]\s|\d+\.\s)", md[i].strip()):
            buf.append(md[i].strip())
            i += 1
        txt = " ".join(buf)
        cls = ""
        if txt.startswith("*Kết quả:*"):
            cls = ' class="outcome"'
        elif txt.startswith("**Tiêu chí nghiệm thu:**"):
            cls = ' class="acceptance"'
        out.append("<p%s>%s</p>" % (cls, inline(txt)))
        continue

    i += 1

close_section()
body_html = "\n".join(out)

toc_html = "".join(
    '<li><a href="#%s"><span class="toc-num">%s</span><span>%s</span></a></li>' % (sid, num, html.escape(title, quote=False))
    for num, title, sid in toc
)

CSS = """
:root{
  --paper:#F5F7F5; --surface:#FFFFFF; --surface-2:#EBEFED; --sunken:#F0F3F1;
  --ink:#141D1B; --ink-2:#3D4B48; --ink-3:#6C7C77;
  --rule:#D5DCD9; --rule-2:#E4E9E7;
  --accent:#0B6E63; --accent-ink:#07564D; --accent-soft:#DBEBE8;
  --amber:#8A5A0B; --amber-soft:#F4E8D0;
  --shadow:0 1px 2px rgba(20,29,27,.05), 0 8px 24px -16px rgba(20,29,27,.28);
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --paper:#0D1312; --surface:#151D1B; --surface-2:#1D2725; --sunken:#111917;
    --ink:#E7EEEB; --ink-2:#B2C1BD; --ink-3:#7C8E89;
    --rule:#2A3936; --rule-2:#222E2C;
    --accent:#54C2B2; --accent-ink:#7BD6C8; --accent-soft:#123330;
    --amber:#D9A458; --amber-soft:#33270F;
    --shadow:0 1px 2px rgba(0,0,0,.4), 0 8px 24px -16px rgba(0,0,0,.7);
  }
}
:root[data-theme="dark"]{
  --paper:#0D1312; --surface:#151D1B; --surface-2:#1D2725; --sunken:#111917;
  --ink:#E7EEEB; --ink-2:#B2C1BD; --ink-3:#7C8E89;
  --rule:#2A3936; --rule-2:#222E2C;
  --accent:#54C2B2; --accent-ink:#7BD6C8; --accent-soft:#123330;
  --amber:#D9A458; --amber-soft:#33270F;
  --shadow:0 1px 2px rgba(0,0,0,.4), 0 8px 24px -16px rgba(0,0,0,.7);
}

*{box-sizing:border-box}
body{
  margin:0; background:var(--paper); color:var(--ink);
  font-family:"Source Serif 4",Georgia,"Times New Roman",serif;
  font-size:17px; line-height:1.68;
  -webkit-font-smoothing:antialiased;
}
.ui,h1,h2,h3,h4,th,.chip,.eyebrow,.toc,.req-id,figcaption,.legend{
  font-family:"Be Vietnam Pro",system-ui,"Segoe UI",Arial,sans-serif;
}
code,pre{font-family:"IBM Plex Mono",ui-monospace,"Cascadia Mono",Consolas,monospace}

.wrap{display:grid; grid-template-columns:250px minmax(0,1fr); gap:56px;
      max-width:1160px; margin:0 auto; padding:0 28px 96px}

/* ---- rail ---- */
.rail{position:sticky; top:0; align-self:start; max-height:100vh; overflow-y:auto;
      padding:40px 0 40px; border-right:1px solid var(--rule-2)}
.rail .mark{display:flex; align-items:baseline; gap:8px; margin-bottom:26px}
.rail .mark b{font-family:"Be Vietnam Pro",sans-serif; font-weight:800; font-size:15px; letter-spacing:-.02em}
.rail .mark span{font-family:"IBM Plex Mono",monospace; font-size:11px; color:var(--ink-3)}
.toc{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:1px}
.toc a{display:grid; grid-template-columns:22px 1fr; gap:8px; align-items:baseline;
       padding:6px 10px 6px 4px; border-radius:5px; text-decoration:none;
       color:var(--ink-2); font-size:13.5px; line-height:1.35; font-weight:500}
.toc a:hover{background:var(--surface-2); color:var(--ink)}
.toc a:focus-visible{outline:2px solid var(--accent); outline-offset:1px}
.toc-num{font-family:"IBM Plex Mono",monospace; font-size:11px; color:var(--ink-3); font-variant-numeric:tabular-nums}
.toc-mobile{display:none}

/* ---- doc ---- */
main{min-width:0; padding-top:40px; max-width:74ch}
.masthead{padding:36px 0 30px; border-bottom:3px solid var(--ink); margin-bottom:8px}
.eyebrow{margin:0 0 12px; font-size:11px; font-weight:600; letter-spacing:.16em;
         text-transform:uppercase; color:var(--accent)}
h1{margin:0; font-size:clamp(30px,4.2vw,44px); line-height:1.1; font-weight:800;
   letter-spacing:-.035em; text-wrap:balance}

section{padding-top:44px}
h2{display:flex; align-items:baseline; gap:14px; margin:0 0 22px;
   font-size:25px; font-weight:800; letter-spacing:-.025em; line-height:1.2; text-wrap:balance;
   padding-bottom:12px; border-bottom:1px solid var(--rule)}
.h2-num{font-family:"IBM Plex Mono",monospace; font-size:13px; font-weight:500;
        color:var(--accent); flex:none; padding-top:3px; font-variant-numeric:tabular-nums}
h3{margin:38px 0 14px; font-size:17.5px; font-weight:700; letter-spacing:-.01em; color:var(--ink)}
h4{margin:0; font-size:15.5px; font-weight:700; letter-spacing:-.01em; flex:1 1 auto}
p{margin:0 0 15px}
a{color:var(--accent-ink)}
strong{font-weight:600; color:var(--ink)}
ul,ol{margin:0 0 16px; padding-left:1.15em; display:flex; flex-direction:column; gap:7px}
li{padding-left:.15em}
li::marker{color:var(--ink-3)}

/* ---- the yeu cau ---- */
.req{background:var(--surface); border:1px solid var(--rule); border-radius:9px;
     padding:18px 20px 6px; margin:0 0 14px; box-shadow:var(--shadow)}
.req-head{display:flex; align-items:center; gap:11px; flex-wrap:wrap; margin-bottom:12px}
.req-id{font-family:"IBM Plex Mono",monospace; font-size:11px; font-weight:500;
        color:var(--accent); background:var(--accent-soft);
        padding:3px 7px; border-radius:4px; letter-spacing:.04em}
.chip{font-size:10.5px; font-weight:700; letter-spacing:.07em; padding:3px 8px; border-radius:20px}
.chip.p0{background:var(--accent); color:var(--paper)}
:root[data-theme="dark"] .chip.p0{color:#08211E}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .chip.p0{color:#08211E}}
.chip.p1{background:var(--amber-soft); color:var(--amber); border:1px solid var(--amber)}
.chip.p2{background:var(--surface-2); color:var(--ink-3); border:1px solid var(--rule)}
.req p{margin:0 0 13px}
.req>*:last-child{margin-bottom:14px}

.acceptance{border-left:2px solid var(--accent); padding:2px 0 2px 14px;
            font-size:15.5px; color:var(--ink-2)}
.outcome{font-size:15.5px; color:var(--ink-2)}

/* ---- bang & code ---- */
.scroll{overflow-x:auto; margin:0 0 20px; border-radius:8px; border:1px solid var(--rule)}
table{border-collapse:collapse; width:100%; font-size:14.5px;
      font-family:"Be Vietnam Pro",sans-serif; background:var(--surface)}
th{text-align:left; font-weight:600; font-size:11.5px; letter-spacing:.07em; text-transform:uppercase;
   color:var(--ink-3); padding:11px 14px; background:var(--surface-2);
   border-bottom:1px solid var(--rule); white-space:nowrap}
td{padding:11px 14px; border-bottom:1px solid var(--rule-2); vertical-align:top;
   line-height:1.5; font-variant-numeric:tabular-nums}
tbody tr:last-child td{border-bottom:0}
pre{margin:0; padding:18px 20px; background:var(--sunken); overflow-x:auto}
pre code{font-size:12.5px; line-height:1.62; color:var(--ink-2); background:none; padding:0; border:0}
code{font-size:.87em; background:var(--surface-2); color:var(--accent-ink);
     padding:1px 5px; border-radius:4px; border:1px solid var(--rule-2)}

blockquote{margin:0 0 20px; padding:16px 20px; background:var(--accent-soft);
           border-left:3px solid var(--accent); border-radius:0 8px 8px 0;
           font-size:16px; color:var(--ink)}
blockquote strong{color:var(--ink)}

@media (max-width:900px){
  .wrap{grid-template-columns:1fr; gap:0; padding:0 20px 72px}
  .rail{position:static; max-height:none; border-right:0; border-bottom:1px solid var(--rule);
        padding:24px 0 18px}
  .toc-mobile{display:block}
  .toc-mobile summary{cursor:pointer; font-family:"Be Vietnam Pro",sans-serif;
    font-size:13px; font-weight:600; color:var(--ink-2); padding:6px 0; list-style:none}
  .toc-mobile summary::-webkit-details-marker{display:none}
  .toc-mobile summary::before{content:"\\25B8 "; color:var(--accent)}
  .toc-mobile[open] summary::before{content:"\\25BE "}
  .toc-desktop{display:none}
  main{padding-top:24px; max-width:none}
  body{font-size:16px}
  h2{font-size:22px; flex-wrap:wrap; gap:8px}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important; transition:none!important}}
"""

page = """<title>Catalogue Quote PRD</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap">
<style>%s</style>
<div class="wrap">
  <nav class="rail">
    <div class="mark"><b>Catalogue Quote System</b><span>PRD-CQS-001</span></div>
    <div class="toc-desktop"><ul class="toc">%s</ul></div>
    <details class="toc-mobile"><summary>Mục lục</summary><ul class="toc">%s</ul></details>
  </nav>
  <main>%s</main>
</div>
""" % (CSS, toc_html, toc_html, body_html)

io.open(OUT, "w", encoding="utf-8").write(page)
print("Da ghi:", OUT)
print("Muc:", len(toc), "| bytes:", len(page.encode("utf-8")))
