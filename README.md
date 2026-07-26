# Film CRM

A Progressive Web App (PWA) for filmmakers to manage industry contacts, run outreach campaigns, and assemble film crews — entirely offline, with no backend or login required.

---

## Folder Structure

```
film-crm/
├── index.html              # App entry point
├── package.json            # Node dependencies and scripts
├── vite.config.ts          # Vite build configuration
├── tsconfig.json           # TypeScript config
├── components.json         # shadcn/ui component registry
├── public/
│   ├── manifest.json       # PWA manifest (name, icons, theme)
│   ├── sw.js               # Service worker (offline caching)
│   ├── favicon.svg         # Browser tab icon
│   ├── robots.txt
│   └── icons/
│       ├── icon-192.png    # PWA home screen icon (Android)
│       └── icon-512.png    # PWA splash icon (iOS / larger displays)
└── src/
    ├── main.tsx            # React entry point + service worker registration
    ├── App.tsx             # Router and app shell
    ├── index.css           # Global CSS, dark theme variables
    ├── store.ts            # Zustand global store (persisted to localStorage)
    ├── pages/
    │   ├── Home.tsx              # Command center / dashboard
    │   ├── Contacts.tsx          # Contacts list with filter + search
    │   ├── ContactDetail.tsx     # Contact detail, edit, history
    │   ├── Lists.tsx             # Custom lists (crew formation)
    │   ├── Campaigns.tsx         # Campaign list
    │   ├── CampaignNew.tsx       # Multi-step campaign builder
    │   ├── CampaignWork.tsx      # Campaign execution view
    │   └── Settings.tsx          # Tag management, export/import
    └── components/
        ├── SharedUI.tsx          # TagChip, ActionIcons, shared components
        └── ui/                   # shadcn/ui component library
```

---

## Running Locally

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) — install with `npm i -g pnpm`

### Steps

```bash
# Install dependencies
pnpm install

# Start the dev server
PORT=3000 BASE_PATH=/ pnpm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Building for Production

```bash
PORT=3000 BASE_PATH=/ pnpm run build
```

The compiled output lands in `dist/public/`. That folder is a self-contained static site — copy it to any web host.

---

## Deploying (Static Hosting)

Because Film CRM has **no backend**, it deploys anywhere that can serve static files:

| Platform | Steps |
|---|---|
| **Netlify** | Drag-and-drop `dist/public/` into [app.netlify.com/drop](https://app.netlify.com/drop) |
| **Vercel** | `vercel --prod` from the project root (set build output to `dist/public`) |
| **GitHub Pages** | Push `dist/public/` contents to a `gh-pages` branch |
| **Cloudflare Pages** | Connect repo; build command: `PORT=3000 BASE_PATH=/ pnpm run build`; output dir: `dist/public` |
| **Any static server** | `npx serve dist/public` |

> **Important:** Set `BASE_PATH=/` when building for a root-path deployment. If the app is hosted at a sub-path (e.g. `/film-crm/`), set `BASE_PATH=/film-crm/` to match.

---

## Data & Privacy

All data is stored **locally in your browser** using `localStorage` under the key `film_crm_data`. Nothing is sent to any server.

- **Export**: Settings → Export Data — downloads a single `film-crm-export.json` containing all contacts, campaigns, tags, lists, and settings.
- **Import**: Settings → Import Data — restores the full app state from an export file (asks for confirmation before overwriting).

---

## PWA / Install on Mobile

1. Open the app URL in Chrome (Android) or Safari (iOS).
2. Android: tap the "Add to Home Screen" banner or the browser menu.
3. iOS: tap the Share icon → "Add to Home Screen".
4. The app works fully offline after the first load.

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Zustand** (state management, persisted to localStorage)
- **Tailwind CSS** + **shadcn/ui** (component library)
- **Framer Motion** (animations)
- **Wouter** (client-side routing)
- **PWA**: Web App Manifest + Service Worker (cache-first, offline-capable)
