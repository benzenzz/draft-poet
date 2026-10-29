# POET

Website of Câu lạc bộ Thiện nguyện POET: static pages plus a Cloudflare Worker for donations and admin.

| Path | What it is |
|---|---|
| `index.html`, `team/`, `du-an/`, `dong-hanh/`, `tinh-nguyen-vien/`, `blog/`, `admin/` | The pages. All except `index.html` and `admin/` are generated: edit `data/` and `tools/site-templates.mjs`, then build. |
| `ung-ho/` | PayOS return and cancel pages, plus the checkout bridge. The Worker only accepts these exact paths. |
| `worker/` | Cloudflare Worker (PayOS, donations, admin, business deals). See `worker/PLAN.md`. |
| `assets/`, `fonts/` | Images, icons, fonts. |
| `config.js` | The one place that holds the Worker URL (`window.POET_API_BASE`). |
| `docs/` | The benefits PDF linked from the site. |
| `vercel.json` | Trailing slashes, and old `/v2/...` links redirect to `/...`. |

```
node tools/build-site.mjs              # regenerate the HTML
node tools/preview.mjs                 # http://127.0.0.1:8766/
node --test tools/tests/*.test.mjs     # site tests
node --test worker/test/*.mjs          # Worker tests
```

Design and motion rules for this project are in `AGENTS.md`.
