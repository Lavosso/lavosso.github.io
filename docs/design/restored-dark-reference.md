# Restored dark reference

Read/implemented: 2026-10-11. Baseline commit: 7e01f4c2625861b65ba633678539b6e565605002. Historical styling source: 6690eaa:styles.css, the initial dark portfolio. This restores its visual language with new content, readable labels and responsive corrections; it is not a pixel-for-pixel restoration.

Sources: https://grela.tech/cnc-timer/ and https://grela.tech/cnc-timer/style.css (singular), local cnc-timer/style.css and index.html. Public CSS fetched successfully on this date; root palette matches local source and the prompt. Portfolio files: index.html, styles.css, script.js. Timer files are unchanged.

## Semantic palette

| Token | Value | Role |
| --- | --- | --- |
| --bg | #0b0d0f | body background, theme-color |
| --panel | #101316 | cards, current state, skip link |
| --panel2 | #0e1113 | learning surface and markers |
| --text | #e7e5df | main text, headings, current state values |
| --muted | #a7adab | readable labels/navigation; lightened from timer #898f8d |
| --secondary | #b8bcba | descriptive body copy |
| --line | #242a2d | subtle dividers |
| --line-strong | #343b3e | structural borders, hover and status outlines |
| --accent | #d5a563 | hero emphasis, links, idea/in-progress statuses |
| --green | #9bb695 | shipped/working/completed text status |
| --cool | #94afbf | note category accent |
| --focus | #94afbf | keyboard outline |
| --warm | #15120e | existing Alisson card surface |
| --max | 1160px | shell width |

Timer finished red (#c97b7b) is not mapped to portfolio completion: completion uses green plus an explicit text label. Frozen remains labelled frozen; ideas/early development remain amber. No reliability metrics or industrial validation claims are added.

## Typography and components

Inter 400/500/600/700; DM Mono 400/500; system fallbacks. Body line-height 1.65 for portfolio reading (timer 1.5). Hero clamp 54px/7.5vw/104px, .97 line-height; mobile clamp 42px/11vw/62px. Project prose 16px/1.65, learning 16px/1.7, notes 15px, metadata generally 12px/1.6; current-state labels 11px at smallest breakpoint. Avoid timer's 9px metadata scale.

Sticky 72px minimum header, 14px blur, rgba(11,13,15,.86); thin border. Cards and current-state panel radius 10px, surface --panel, thin border; status pills 999px radius and text labels. Learning retains historical 14px radius. No shadows or decorative gradients. Hover moves project cards -2px and strengthens border (.18s); reduced-motion disables transitions and movement. Focus-visible: 2px --focus, 5px offset. Native anchors preserve fragment URLs and keyboard navigation; scroll-padding 100px accounts for header. Skip link is visible on focus.

Shell 1160px maximum, 24px gutters, 14px below 620px. Desktop hero 1.35fr/.65fr with 72px gap; two-column project and about layout; four note columns. At 900px, hero/about/now become one column, notes two, navigation stays visible on its second header row. At 620px projects and notes become one column. All responsive overrides follow base declarations, fixing the original cascade bug. Compact in-progress cards; ideas and paused community are in native details/summary. Existing anchors top/about/projects/learning/notes/now remain.

Selectors and full declarations below are the final source specification; browser measurements and screenshots are recorded separately when available.

## Full declaration inventory

| Selector | Declarations |
| --- | --- |
| `:root` | `color-scheme:dark;--bg:#0b0d0f;--panel:#101316;--panel2:#0e1113;--text:#e7e5df;--muted:#a7adab;--line:#242a2d;--line-strong:#343b3e;--accent:#d5a563;--cool:#94afbf;--green:#9bb695;--warm:#15120e;--secondary:#b8bcba;--focus:#94afbf;--max:1160px` |
| `*` | `box-sizing:border-box` |
| `html` | `scroll-behavior:smooth` |
| `body` | `margin:0;background:var(--bg);color:var(--text);font-family:Inter,system-ui,sans-serif;line-height:1.65;-webkit-font-smoothing:antialiased` |
| `a` | `color:inherit;text-decoration:none` |
| `a:hover` | `color:var(--accent)` |
| `.shell` | `width:min(var(--max),calc(100% - 48px));margin:0 auto` |
| `.site-header` | `position:sticky;top:0;z-index:20;background:rgba(11,13,15,.86);backdrop-filter:blur(14px);border-bottom:1px solid rgba(36,42,45,.8)` |
| `.header-inner` | `min-height:72px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:24px` |
| `.wordmark` | `font:14px "DM Mono",monospace` |
| `.nav` | `display:flex;gap:24px;font:12px/1 "DM Mono",monospace;color:var(--muted)` |
| `.nav a` | `padding:10px 0` |
| `.header-link` | `justify-self:end;font:12px "DM Mono",monospace;color:var(--muted)` |
| `.eyebrow,.section-meta,.section-caption,.project-meta,.project-foot,.note-head,.note-row,.note-type,.principle span` | `font-family:"DM Mono",monospace` |
| `.hero` | `padding:112px 0 92px;display:grid;grid-template-columns:1.35fr .65fr;gap:72px;align-items:end` |
| `.eyebrow` | `margin:0 0 25px;color:var(--muted);font-size:11px;letter-spacing:.02em;text-transform:lowercase` |
| `.hero h1` | `margin:0;font-size:clamp(54px,7.5vw,104px);line-height:.97;letter-spacing:-.065em;font-weight:600` |
| `.hero h1 span` | `color:var(--cool)` |
| `.hero-text` | `max-width:720px;margin:28px 0 0;color:var(--muted);font-size:18px;line-height:1.75` |
| `.hero-links` | `display:flex;gap:24px;margin-top:34px` |
| `.text-link` | `font:12px "DM Mono",monospace;color:var(--muted)` |
| `.text-link.primary` | `color:var(--text)` |
| `.hero-note` | `border-top:1px solid var(--line-strong);border-bottom:1px solid var(--line-strong);padding:13px 0` |
| `.note-head` | `display:flex;justify-content:space-between;color:var(--muted);font-size:9px;text-transform:uppercase;margin-bottom:5px` |
| `.note-row` | `display:grid;grid-template-columns:1fr auto;gap:12px;padding:10px 0;border-top:1px solid rgba(36,42,45,.7);font-size:10px` |
| `.note-row b` | `font-weight:400;color:var(--muted)` |
| `.section` | `padding:92px 0;border-top:1px solid var(--line)` |
| `.section-meta` | `display:flex;gap:14px;align-items:baseline;color:var(--muted);font-size:10px;text-transform:lowercase` |
| `.section-meta span:first-child` | `color:var(--muted)` |
| `.section-head` | `display:flex;justify-content:space-between;align-items:baseline;gap:24px;margin-bottom:20px` |
| `.section-caption` | `margin:0;color:var(--muted);font-size:9px` |
| `.two-col` | `display:grid;grid-template-columns:1fr 1fr;gap:72px` |
| `.copy.large` | `font-size:24px;line-height:1.5;letter-spacing:-.02em` |
| `.copy.large p` | `margin:0 0 22px` |
| `.side-list` | `border-top:1px solid var(--line-strong)` |
| `.side-list>div` | `display:grid;grid-template-columns:130px 1fr;gap:14px;padding:14px 0;border-bottom:1px solid var(--line);font-size:12px` |
| `.side-list span` | `color:var(--muted);font:10px "DM Mono",monospace;text-transform:uppercase` |
| `.side-list strong` | `font-weight:500;color:var(--muted)` |
| `.project-grid` | `display:grid;grid-template-columns:repeat(2,1fr);gap:14px` |
| `.project-card` | `background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:25px;min-height:290px;display:flex;flex-direction:column;transition:transform .18s ease,border-color .18s ease` |
| `.project-card:hover` | `transform:translateY(-2px);border-color:var(--line-strong)` |
| `.project-card.featured` | `grid-column:span 2;min-height:340px;background:var(--panel)` |
| `.project-card.warm` | `background:var(--warm)` |
| `.project-card.shipped .status` | `color:var(--green)` |
| `.project-card.quiet` | `opacity:1` |
| `.project-meta` | `display:flex;justify-content:space-between;color:var(--muted);font-size:9px;text-transform:uppercase` |
| `.status` | `color:var(--accent)` |
| `.project-card h3` | `margin:34px 0 14px;font-size:clamp(25px,2.8vw,36px);line-height:1.08;letter-spacing:-.04em;font-weight:600` |
| `.project-card p` | `margin:0;color:var(--muted);max-width:770px;font-size:14px` |
| `.project-foot` | `margin-top:auto;padding-top:28px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:14px;color:var(--muted);font-size:9px` |
| `.alt` | `background:var(--panel2)` |
| `#learning.alt` | `background:var(--panel2);border:1px solid var(--line);border-radius:14px;padding-left:34px;padding-right:34px;overflow:hidden` |
| `.learning-wrap` | `margin-top:8px;padding:34px 0 18px;border:0;border-radius:0;background:transparent;overflow:visible` |
| `.learning-intro` | `display:flex;justify-content:space-between;align-items:flex-end;gap:36px;margin:0 0 28px` |
| `.learning-kicker` | `margin:0 0 8px;color:var(--muted);font:9px "DM Mono",monospace;text-transform:uppercase;letter-spacing:.04em` |
| `.learning-lead` | `margin:0;max-width:720px;color:var(--muted);font-size:18px;line-height:1.6` |
| `.learning-rule` | `flex:none;color:var(--muted);font:9px "DM Mono",monospace;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap` |
| `.learning-path` | `position:relative;display:grid;gap:0;padding:4px 0` |
| `.learning-path::before` | `content:"";position:absolute;left:24px;top:16px;bottom:16px;width:1px;background:var(--line-strong)` |
| `.learning-step` | `position:relative;display:grid;grid-template-columns:74px 1fr;gap:26px;padding:24px 0` |
| `.learning-step+.learning-step` | `border-top:1px solid var(--line)` |
| `.learning-marker` | `position:relative;z-index:1;display:flex;align-items:center;justify-content:center;width:48px;height:48px;border:1px solid var(--line-strong);border-radius:50%;background:var(--panel2);color:var(--accent);font:10px "DM Mono",monospace` |
| `.learning-content` | `min-width:0;max-width:840px` |
| `.learning-top` | `display:flex;justify-content:space-between;gap:16px;color:var(--muted);font:8px "DM Mono",monospace;text-transform:uppercase;letter-spacing:.03em` |
| `.learning-content h3` | `margin:13px 0 8px;font-size:23px;line-height:1.1;letter-spacing:-.03em` |
| `.learning-content p` | `margin:0;color:var(--muted);font-size:13px;line-height:1.7;max-width:760px` |
| `.learning-tags` | `display:flex;flex-wrap:wrap;gap:6px;margin-top:16px` |
| `.learning-tags span` | `padding:5px 7px;border:1px solid var(--line-strong);border-radius:999px;color:var(--muted);font:7px "DM Mono",monospace;text-transform:uppercase` |
| `.learning-step-ai .learning-marker` | `background:#15120e` |
| `.learning-step-ai .learning-content h3` | `color:var(--muted)` |
| `.learning-wrap .principle` | `margin:16px -34px 0;padding:24px 34px 0;border-top:1px solid var(--line);background:transparent` |
| `.learning-wrap .principle p` | `margin:0` |
| `.header-inner` | `grid-template-columns:1fr auto` |
| `.nav` | `display:none` |
| `.hero,.two-col,.now-grid` | `grid-template-columns:1fr;gap:46px` |
| `.project-card.featured` | `grid-column:span 1` |
| `.notes-grid` | `grid-template-columns:repeat(2,1fr)` |
| `.shell` | `width:min(var(--max),calc(100% - 28px))` |
| `.hero` | `padding:76px 0 66px` |
| `.hero h1` | `font-size:52px` |
| `.hero-text` | `font-size:16px` |
| `.section` | `padding:70px 0` |
| `.project-grid,.notes-grid` | `grid-template-columns:1fr` |
| `.project-card` | `min-height:255px` |
| `.project-card h3` | `margin-top:28px` |
| `.project-foot` | `flex-direction:column` |
| `#learning.alt` | `padding-left:22px;padding-right:22px` |
| `.learning-wrap` | `padding:24px 0 16px` |
| `.learning-step` | `grid-template-columns:58px 1fr;gap:18px;padding:22px 0` |
| `.learning-path::before` | `left:20px` |
| `.learning-wrap .principle` | `margin-left:0;margin-right:0;padding-left:0;padding-right:0` |
| `.learning-marker` | `width:40px;height:40px` |
| `.learning-intro` | `flex-direction:column;align-items:flex-start;gap:12px` |
| `.learning-rule` | `white-space:normal` |
| `.principle` | `grid-template-columns:1fr;gap:8px` |
| `.section-head` | `align-items:flex-start;flex-direction:column;gap:5px` |
| `.closing` | `padding-bottom:80px` |
| `.footer` | `padding:18px 0;flex-direction:column;align-items:flex-start;gap:5px` |
| `.copy.large` | `font-size:21px` |
| `/* merged non-learning styles from v7 */
.notes-grid` | `display:grid;grid-template-columns:repeat(4,1fr);gap:24px` |
| `.note-card` | `border-top:1px solid var(--line-strong);padding-top:18px` |
| `.note-type` | `color:var(--cool);font-size:9px;text-transform:uppercase` |
| `.note-card h3` | `margin:17px 0 11px;font-size:18px;line-height:1.16;letter-spacing:-.02em` |
| `.note-card p` | `margin:0;color:var(--muted);font-size:13px` |
| `.now-section` | `padding-bottom:72px` |
| `.now-grid` | `display:grid;grid-template-columns:1fr 1fr;gap:72px` |
| `.now-section h2` | `margin:0;font-size:clamp(34px,4.3vw,58px);line-height:1.05;letter-spacing:-.045em;font-weight:600` |
| `.now-copy` | `color:var(--muted);font-size:16px` |
| `.now-copy p` | `margin:0 0 20px` |
| `.closing` | `padding:64px 0 112px` |
| `.closing-line` | `height:1px;background:var(--line);margin-bottom:56px` |
| `.closing h2` | `margin:0 0 22px;font-size:clamp(50px,6.2vw,86px);line-height:1;letter-spacing:-.065em` |
| `.closing-copy` | `max-width:590px;color:var(--muted);font-size:15px` |
| `.closing-links` | `display:flex;gap:24px;margin-top:28px;font:11px "DM Mono",monospace;color:var(--muted)` |
| `.footer` | `min-height:70px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;color:var(--muted);font:9px "DM Mono",monospace` |
| `/* Portfolio scale, accessibility and responsive rules follow all base rules. */
.hero h1 span` | `color:var(--accent)` |
| `.hero-text,.project-card p,.learning-content p,.note-card p,.now-copy,.closing-copy` | `color:var(--secondary)` |
| `.eyebrow,.section-meta,.section-caption,.project-meta,.project-foot,.note-head,.note-row,.text-link,.nav,.header-link,.learning-kicker,.learning-rule,.learning-top,.note-type,.footer,.closing-links` | `font-size:12px;line-height:1.6` |
| `.hero-note` | `padding:18px;background:var(--panel);border:1px solid var(--line-strong);border-radius:10px` |
| `.note-row` | `grid-template-columns:minmax(0,1fr) minmax(0,1fr);font-size:12px` |
| `.note-row b` | `text-align:right;color:var(--text)` |
| `.section-meta h2` | `margin:0;font:inherit;color:var(--text)` |
| `.project-meta` | `flex-wrap:wrap;align-items:center;gap:10px` |
| `.status` | `border:1px solid var(--line-strong);border-radius:999px;padding:4px 9px;letter-spacing:.03em` |
| `.project-card p` | `font-size:16px;line-height:1.65` |
| `.project-foot` | `margin-top:24px;padding-top:18px;align-items:flex-start` |
| `.project-foot a` | `flex-shrink:0;color:var(--accent);text-decoration:underline;text-underline-offset:4px` |
| `.featured h3` | `font-size:clamp(36px,4vw,56px)` |
| `.featured` | `border-color:var(--line-strong)` |
| `.group-title` | `margin:48px 0 18px;font-size:23px` |
| `.compact .project-card` | `min-height:0` |
| `.compact h3` | `font-size:25px;margin-top:22px` |
| `.explorations` | `margin-top:28px;border-top:1px solid var(--line-strong);padding-top:20px` |
| `.explorations summary` | `cursor:pointer;font-size:18px;padding:12px 0` |
| `.explorations summary span` | `display:block;color:var(--muted);font:12px/1.6 "DM Mono",monospace` |
| `.explorations .project-grid` | `margin-top:20px` |
| `.learning-content p` | `font-size:16px` |
| `.learning-top` | `font-size:12px` |
| `.learning-marker` | `font-size:12px` |
| `.principle h3` | `font-size:20px` |
| `.principle p` | `color:var(--secondary)` |
| `.note-card` | `background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:20px` |
| `.note-card p` | `font-size:15px` |
| `.hero-links,.closing-links` | `flex-wrap:wrap` |
| `.project-foot span,.side-list strong` | `min-width:0` |
| `:where(a,summary):focus-visible` | `outline:2px solid var(--focus);outline-offset:5px;border-radius:3px` |
| `html` | `scroll-padding-top:100px;scroll-behavior:auto` |
| `a,summary` | `touch-action:manipulation` |
| `.nav a` | `min-height:44px;display:flex;align-items:center` |
| `.skip-link` | `position:fixed;top:8px;left:14px;z-index:30;padding:10px;background:var(--panel);border:1px solid var(--focus);transform:translateY(-150%)` |
| `.skip-link:focus` | `transform:none` |
| `.sr-only` | `position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap` |
| `.header-inner` | `grid-template-columns:1fr auto;gap:4px 20px;padding-top:12px` |
| `.nav` | `display:flex;grid-row:2;grid-column:1/-1;justify-content:space-between;gap:12px` |
| `.hero,.two-col,.now-grid` | `grid-template-columns:1fr;gap:36px` |
| `.notes-grid` | `grid-template-columns:repeat(2,minmax(0,1fr))` |
| `.project-card.featured` | `grid-column:1/-1` |
| `.hero` | `padding-top:72px` |
| `.project-foot` | `flex-direction:column` |
| `.hero-note` | `max-width:520px;width:100%` |
| `.project-grid,.notes-grid` | `grid-template-columns:minmax(0,1fr)` |
| `.hero h1` | `font-size:clamp(42px,11vw,62px);letter-spacing:-.055em` |
| `.hero` | `padding:58px 0` |
| `.hero-text` | `font-size:17px` |
| `.project-card` | `padding:20px;min-height:0` |
| `.project-card.featured` | `min-height:0` |
| `.hero-links` | `gap:16px` |
| `.learning-step` | `grid-template-columns:40px minmax(0,1fr);gap:14px` |
| `.learning-content h3` | `font-size:22px;line-height:1.2` |
| `.side-list>div` | `grid-template-columns:100px minmax(0,1fr)` |
| `.note-row` | `font-size:11px` |
| `.copy.large` | `font-size:21px` |
| `.section` | `padding-top:64px;padding-bottom:64px` |
| `*,*::before,*::after` | `transition:none!important;animation:none!important;scroll-behavior:auto!important` |
| `.project-card:hover` | `transform:none` |

## Browser verification

Chromium rendered 360×900, 390×900, 768×900 and 1440×900, matching light reference viewport settings. Full-page screenshots dark-{width}.png and dark-expanded-{width}.png capture closed/open explorations. No horizontal overflow in any final view or expanded state. Notes have 1/1/2/4 columns; now 1/1/1/2. Mobile nav remains flex. No JavaScript page errors or broken anchors; project nav click updates #projects. Keyboard first focus is Skip to content; reduced-motion transition duration 0s; local /cnc-timer/ HTTP 200 checked without executing push. Desktop dark-1440.png and mobile dark-390.png were visually inspected. See browser-checks.json.
