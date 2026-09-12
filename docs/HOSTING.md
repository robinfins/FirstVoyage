# Putting First Voyage on the web

The build is entirely static — HTML, JS, PNG and SVG, no server code and no build step — so any
static host will serve it. Visiting the domain root redirects to `play/`.

## What a visitor downloads

Measured from a cold load of `play/`: **27.6 MB over 80 requests**, of which 27.4 MB is PNG.
Fourteen files are over 1 MB each; the largest are the parallax layers and character atlases.

That is heavy for a web page. It is fine for a private playtest — and browsers cache it, so only
the first visit pays — but it does shape which host suits, and it is the first thing worth
optimising if the link goes wider. See *Trimming the payload* below.

## GitHub Pages (the one in use)

The repository already has a remote at `github.com/robinfins/AnimePlatformer`.

1. Push `main`.
2. Repository → **Settings** → **Pages** → Source **Deploy from a branch**, branch `main`,
   folder **`/ (root)`**. Save.
3. Wait for the green tick under Settings → Pages, then open the URL it shows. The root redirects
   to `play/`, so the link lands on the game.

The published URL follows the repository name: `https://robinfins.github.io/AnimePlatformer/`.
Renaming the repository to `first-voyage` in Settings → General changes it to
`https://robinfins.github.io/first-voyage/`; GitHub redirects the old URL, and `git remote set-url`
updates this clone. Nothing in the code hard-codes a path, so either name works.

Two things to know:

- Free GitHub Pages serves from **public** repositories only. A private repository needs a paid
  plan. Public means the whole source, including `play/gate.js`, is readable — see the note on the
  gate below.
- `.nojekyll` at the root turns off Jekyll processing, and `robots.txt` plus a `noindex` tag on
  each page asks search engines to stay away. Neither is access control; both just keep a private
  playtest out of results.

### Deploying elsewhere later

| Host | Free bandwidth | Notes |
|---|---|---|
| **GitHub Pages** | 100 GB/month soft | In use. About 3,700 cold visits a month at this payload |
| **Cloudflare Pages** | Unlimited (fair use) | Worth moving to if the link goes wide |
| **Netlify** | 100 GB/month | Drag the folder onto `netlify.com/drop` for an instant URL, no git needed |
| **itch.io** | — | Purpose-built for games, and its project pages support a **real password** (see below) |

## About the four-digit gate

`play/gate.js` asks for a code before the game appears. Be clear about what it is: the check runs
on the visitor's machine, so anyone who opens devtools can read it or delete the overlay, and four
digits is ten thousand guesses for a script. The code is stored as a salted FNV-1a hash so that
"view source" does not simply print it, but that raises the bar only slightly.

It is a doorbell. It stops a link being casually wandered into; it does not keep anyone out.

For access control that actually holds, use the host's own password, which runs before any file is
served:

- **itch.io** — set the project to *Restricted* and give it a password. Free.
- **Cloudflare Access** — put a policy in front of the Pages project. Free for small teams.
- **Netlify** — site-wide or per-directory password protection, on paid plans.

The gate and a host password work together: the host password controls who reaches the site, the
gate is the in-game flavour.

To change the code, compute the hash and replace `EXPECT` in `play/gate.js`:

```sh
node -e "const s='::first-voyage';let h=2166136261;for(const c of ('1234'+s)){h^=c.codePointAt(0);h=Math.imul(h,16777619)>>>0}console.log('0x'+h.toString(16))"
```

A visitor who has entered the code once is remembered via `localStorage` under
`first-voyage-gate`; clearing site data brings the gate back.

## Trimming the payload

Nothing below is required to play — the game never requests it — so a lean deploy can leave it out:

| Folder | Size | What it is |
|---|---|---|
| `assets/chapter-01/characters/` | 12 MB | Original generated sheets, kept as source |
| `assets/chapter-01/cleaned/*-extraction.png`, `*-review.jpg` | — | Cleanup proof sheets |
| `assets/concepts/` | 7.3 MB | Concept art, embedded in `README.md` only |
| `preview/`, `play/qa-chapter.html`, `play/art-review.html` | small | Art-study and QA tools |

The ocean strip is the deliberate exception: `cleaned/ocean-wave-cycle.png` was grown from 163 KB to 623 KB on purpose, because it was being stored at a quarter of the resolution it was cleaned at and magnified back up at runtime. Do not "optimise" it back down. The real win is the fourteen PNGs over 1 MB. They are authored well above the size they are drawn
at — the Sunny ship layer is 1672 px wide and drawn at 1505 — and are full-colour PNG-32. Resizing
to display resolution and quantising to a palette would plausibly take the payload well under
10 MB without a visible difference at this art scale. That has not been done yet.

## Caching

Script, stylesheet and asset URLs carry `?v=` tags, bumped when a file changes, so returning
players are never served a stale mix. Bump them whenever you change a script, `play/style.css`,
or regenerated art; a cached stylesheet against new markup is exactly how the gate first shipped
invisible during development.
