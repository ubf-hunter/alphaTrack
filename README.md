<div align="center">

# 📊 alphaTrack

**Système de gestion des résultats d'Alpha Center**
**Alpha Center results management system**

*Back-office (super-admin + saisie) + Portail élève*
*Back-office (super-admin + entry) + Student portal*

[![Licence : MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](LICENSE)
[![pnpm](https://img.shields.io/badge/pnpm-10+-F69220.svg?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Node](https://img.shields.io/badge/Node-20+-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Edge-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

🇫🇷 **Français** · [🇬🇧 English overview](#-english-overview)

</div>

---

**Système de gestion des résultats d'Alpha Center** — back-office (super-admin + saisie) + portail élève.
Référence : [`docs/cahier-des-charges-alpha-center.md`](docs/cahier-des-charges-alpha-center.md).

## Architecture

Monorepo pnpm workspaces :

```
apps/
  admin/         Back-office (super-admin + responsables saisie)
  portail/       Portail élève (mobile-first)
packages/
  shared/        Types DB générés, schemas zod, utils calcul
  ui/            Design system (Tailwind v4, Radix)
supabase/
  migrations/    SQL versionné (6 migrations)
  functions/     Edge Functions Deno (login-admin, login-eleve)
  seed.sql       Jeu de données de test
docs/
  cahier-des-charges-alpha-center.md
```

## Pré-requis

- Node.js ≥ 20
- pnpm ≥ 10
- **Supabase** : soit Docker Desktop (pour `supabase start` local), soit un projet Supabase Cloud.

## Bootstrap (premier clone)

```sh
pnpm install
cp .env.example .env       # remplir SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY, JWT_SECRET
```

## Stack locale Supabase

```sh
pnpm db:start              # démarre Postgres+Auth+Studio (port 54323)
pnpm db:reset              # applique migrations + seed
pnpm db:types              # régénère packages/shared/src/db.types.ts
```

Studio : http://localhost:54323 — API : http://127.0.0.1:54321

## Développement

```sh
pnpm dev:admin             # back-office sur http://localhost:5173
pnpm dev:portail           # portail élève sur http://localhost:5174
```

## Comptes de test (après seed)

| Compte | Matricule | Mot de passe / code | Rôle |
|---|---|---|---|
| Super-admin | `ADM-001` | `SuperAdmin2026!` | Accès total |
| Saisie Yaoundé | `ADM-101` | `SaisieYde2026!` | Sous-centre Yaoundé Odza |
| Saisie Foréké | `ADM-201` | `SaisieFor2026!` | Sous-centre Dschang Foréké |
| Élèves `AC-26-0001` à `AC-26-0030` | — | code 6 chiffres affiché en `NOTICE` lors du seed |

> Les mots de passe seed sont en `must_change_password = true` — l'écran de back-office forcera le renouvellement à la première connexion.

## Scripts

| Commande | Effet |
|---|---|
| `pnpm build` | Build récursif tous les workspaces |
| `pnpm typecheck` | TypeScript strict sur tous |
| `pnpm lint` | ESLint flat config (0 warning toléré) |
| `pnpm test` | Vitest unitaires |
| `pnpm format` | Prettier auto-fix |
| `pnpm db:diff` | Génère une migration à partir des diffs locaux |

## État d'avancement

- ✅ **Phase 0** — Fondations Supabase : schéma, RLS, auth, audit, seed, Edge Functions login. *(en cours, voir prompt-de-démarrage)*
- ⏳ Phase 1 — MVP back-office
- ⏳ Phase 2 — Saisie + calcul + exports
- ⏳ Phase 3 — Portail élève
- ⏳ Phase 4 — Mise en ligne (Vercel)

## Sécurité

- Aucune clé `service_role` en front. Seules `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont exposées.
- RLS activée sur 100 % des tables.
- Mots de passe bcrypt (cost 10–12), politique de complexité côté zod + côté DB.
- Lockout 5 tentatives ratées / 15 min sur les deux Edge Functions de login.
- Audit log immuable des actions sensibles (publication, modif de note publiée).
- Anti-fuite vendredi/samedi : RLS bloque la lecture des notes côté élève tant que `evaluations.statut ≠ 'publie'`.

## Contribuer

Contributions bienvenues — nouveaux exports, améliorations RLS, i18n du portail élève, tests. Le workflow, les conventions et les exigences DB sont détaillés dans [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

Code sous licence **MIT** — voir [LICENSE](LICENSE).

> ⚠️ La licence MIT couvre le **code**. Elle **ne couvre pas** :
> - les **résultats d'examens** stockés en base (données personnelles d'élèves, conformité RGPD à la charge de l'exploitant) ;
> - le nom **Alpha Center** et l'identité visuelle associée.

---

## 🇬🇧 English overview

**alphaTrack** is an **exam results management system** for **Alpha Center** (Yaoundé, Cameroon) — a **pnpm monorepo** shipping:

- an **admin back-office** (super-admin + entry supervisors) for staff;
- a **student portal** (mobile-first) for exam candidates.

### Architecture

- **`apps/admin`** — back-office (Vite + React + TypeScript, Tailwind v4 + Radix)
- **`apps/portail`** — student portal (Vite + React + TypeScript, mobile-first)
- **`packages/shared`** — generated DB types, zod schemas, calculation utilities
- **`packages/ui`** — design system (Tailwind v4, Radix)
- **`supabase/`** — versioned SQL migrations, Edge Functions (`login-admin`, `login-eleve`), seed dataset

### Requirements

- **Node.js ≥ 20**
- **pnpm ≥ 10**
- **Supabase** — either Docker Desktop (for `supabase start` local) or a Supabase Cloud project.

### Quickstart

```bash
pnpm install
cp .env.example .env       # fill SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY, JWT_SECRET
pnpm db:start              # local Supabase stack (Postgres + Auth + Studio)
pnpm db:reset              # apply migrations + seed
pnpm dev:admin             # back-office → http://localhost:5173
pnpm dev:portail           # student portal → http://localhost:5174
```

### Security highlights

- No `service_role` key in the front end.
- **RLS enabled on 100 % of tables.**
- Bcrypt passwords (cost 10–12), complexity policy in both zod and DB.
- Lockout: 5 failed attempts / 15 min on both login Edge Functions.
- **Immutable audit log** on sensitive actions.
- **Anti-leak Friday/Saturday**: RLS blocks student-side note reads until `evaluations.statut = 'publie'`.

### License

Code under the **MIT License** — see [LICENSE](LICENSE). Exam data and the Alpha Center brand are not covered.

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) — workflow, DB-migration rules, code style, code of conduct.

---

<details>
<summary>📁 <strong>Arborescence complète du monorepo</strong> — cliquer pour dérouler</summary>

```
alphaTrack
├─ .cursor
├─ .husky
│  └─ _
│     ├─ applypatch-msg
│     ├─ commit-msg
│     ├─ h
│     ├─ husky.sh
│     ├─ post-applypatch
│     ├─ post-checkout
│     ├─ post-commit
│     ├─ post-merge
│     ├─ post-rewrite
│     ├─ pre-applypatch
│     ├─ pre-auto-gc
│     ├─ pre-commit
│     ├─ pre-merge-commit
│     ├─ pre-push
│     ├─ pre-rebase
│     └─ prepare-commit-msg
├─ .prettierignore
├─ .prettierrc.json
├─ android-chrome-192x192.png
├─ android-chrome-512x512.png
├─ apple-touch-icon.png
├─ apps
│  ├─ admin
│  │  ├─ index.html
│  │  ├─ package.json
│  │  ├─ src
│  │  │  ├─ app.tsx
│  │  │  ├─ hooks
│  │  │  │  ├─ useBulkImport.ts
│  │  │  │  ├─ useCoefficients.ts
│  │  │  │  ├─ useConcours.ts
│  │  │  │  ├─ useDashboardStats.ts
│  │  │  │  ├─ useEleves.ts
│  │  │  │  ├─ useEvaluations.ts
│  │  │  │  ├─ useInscriptions.ts
│  │  │  │  ├─ useMatieres.ts
│  │  │  │  ├─ useNotes.ts
│  │  │  │  ├─ useResultats.ts
│  │  │  │  └─ useSousCentres.ts
│  │  │  ├─ lib
│  │  │  │  ├─ auth-api.ts
│  │  │  │  ├─ auth-context.tsx
│  │  │  │  ├─ auth-storage.ts
│  │  │  │  ├─ csv.ts
│  │  │  │  ├─ env.ts
│  │  │  │  ├─ error-boundary.tsx
│  │  │  │  ├─ evaluation-statut.ts
│  │  │  │  └─ supabase.ts
│  │  │  ├─ main.tsx
│  │  │  ├─ routes
│  │  │  │  ├─ change-password.tsx
│  │  │  │  ├─ dashboard.tsx
│  │  │  │  ├─ eleves
│  │  │  │  │  ├─ confirm-delete.tsx
│  │  │  │  │  ├─ create-modal.tsx
│  │  │  │  │  ├─ edit-modal.tsx
│  │  │  │  │  ├─ import.tsx
│  │  │  │  │  ├─ inscriptions-section.tsx
│  │  │  │  │  ├─ list.tsx
│  │  │  │  │  └─ share-code-block.tsx
│  │  │  │  ├─ evaluations
│  │  │  │  │  ├─ detail.tsx
│  │  │  │  │  ├─ form-modal.tsx
│  │  │  │  │  ├─ list.tsx
│  │  │  │  │  ├─ publish-modal.tsx
│  │  │  │  │  ├─ resultats.tsx
│  │  │  │  │  └─ saisie.tsx
│  │  │  │  ├─ guards.tsx
│  │  │  │  ├─ layout.tsx
│  │  │  │  ├─ login.tsx
│  │  │  │  └─ referentiel
│  │  │  │     ├─ coefficients.tsx
│  │  │  │     ├─ concours.tsx
│  │  │  │     ├─ layout.tsx
│  │  │  │     ├─ matieres.tsx
│  │  │  │     └─ sous-centres.tsx
│  │  │  └─ styles
│  │  │     └─ index.css
│  │  ├─ tsconfig.json
│  │  └─ vite.config.ts
│  └─ portail
│     ├─ index.html
│     ├─ package.json
│     ├─ src
│     │  ├─ app.tsx
│     │  ├─ hooks
│     │  │  └─ useResultats.ts
│     │  ├─ lib
│     │  │  ├─ auth-context.tsx
│     │  │  └─ supabase.ts
│     │  ├─ main.tsx
│     │  ├─ routes
│     │  │  ├─ dashboard.tsx
│     │  │  ├─ evaluation-detail.tsx
│     │  │  └─ login.tsx
│     │  └─ styles
│     │     └─ index.css
│     ├─ tsconfig.json
│     └─ vite.config.ts
├─ docs
│  └─ cahier-des-charges-alpha-center.md
├─ eslint.config.js
├─ favicon-16x16.png
├─ favicon-32x32.png
├─ favicon.ico
├─ favicon.svg
├─ index.html
├─ logo.png
├─ og-image.png
├─ package.json
├─ packages
│  ├─ shared
│  │  ├─ package.json
│  │  ├─ src
│  │  │  ├─ auth
│  │  │  │  ├─ index.ts
│  │  │  │  └─ jwt.ts
│  │  │  ├─ constants.ts
│  │  │  ├─ db.types.ts
│  │  │  ├─ index.ts
│  │  │  ├─ schemas
│  │  │  │  ├─ admin.ts
│  │  │  │  ├─ eleve.ts
│  │  │  │  ├─ evaluation.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ inscription.ts
│  │  │  │  └─ note.ts
│  │  │  └─ utils
│  │  │     ├─ date.ts
│  │  │     ├─ index.ts
│  │  │     ├─ matricule.test.ts
│  │  │     ├─ matricule.ts
│  │  │     ├─ moyenne.test.ts
│  │  │     ├─ moyenne.ts
│  │  │     ├─ rang.test.ts
│  │  │     └─ rang.ts
│  │  └─ tsconfig.json
│  └─ ui
│     ├─ package.json
│     ├─ src
│     │  ├─ components
│     │  │  ├─ Avatar.tsx
│     │  │  ├─ Button.tsx
│     │  │  ├─ Card.tsx
│     │  │  ├─ Field.tsx
│     │  │  ├─ Icon.tsx
│     │  │  ├─ IconButton.tsx
│     │  │  ├─ Input.tsx
│     │  │  ├─ KpiCard.tsx
│     │  │  ├─ Modal.tsx
│     │  │  ├─ Pill.tsx
│     │  │  ├─ Select.tsx
│     │  │  ├─ Switch.tsx
│     │  │  └─ Table.tsx
│     │  ├─ index.ts
│     │  ├─ lib
│     │  │  └─ cn.ts
│     │  └─ styles.css
│     └─ tsconfig.json
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ README.md
├─ repomix-output.xml
├─ supabase
│  ├─ config.toml
│  ├─ functions
│  │  ├─ deno.json
│  │  ├─ login-admin
│  │  │  └─ index.ts
│  │  ├─ login-eleve
│  │  │  └─ index.ts
│  │  └─ _shared
│  │     ├─ cors.ts
│  │     ├─ jwt.ts
│  │     └─ supabase.ts
│  ├─ migrations
│  │  ├─ 20260528000001_init_schema.sql
│  │  ├─ 20260528000002_views_resultats.sql
│  │  ├─ 20260528000003_auth_admins.sql
│  │  ├─ 20260528000004_auth_eleves.sql
│  │  ├─ 20260528000005_audit_log.sql
│  │  ├─ 20260528000006_rls_policies.sql
│  │  ├─ 20260528000007_fix_verify_admin_password.sql
│  │  ├─ 20260528000008_rls_use_app_role.sql
│  │  ├─ 20260528000009_fix_jwt_eleve_id_recursion.sql
│  │  ├─ 20260528000010_audit_set_eleve_code.sql
│  │  └─ 20260528000011_eleves_etablissement_origine.sql
│  └─ seed.sql
└─ tsconfig.base.json

```
```
alphaTrack
├─ .cursor
├─ .husky
│  └─ _
│     ├─ applypatch-msg
│     ├─ commit-msg
│     ├─ h
│     ├─ husky.sh
│     ├─ post-applypatch
│     ├─ post-checkout
│     ├─ post-commit
│     ├─ post-merge
│     ├─ post-rewrite
│     ├─ pre-applypatch
│     ├─ pre-auto-gc
│     ├─ pre-commit
│     ├─ pre-merge-commit
│     ├─ pre-push
│     ├─ pre-rebase
│     └─ prepare-commit-msg
├─ .prettierignore
├─ .prettierrc.json
├─ android-chrome-192x192.png
├─ android-chrome-512x512.png
├─ apple-touch-icon.png
├─ apps
│  ├─ admin
│  │  ├─ index.html
│  │  ├─ package.json
│  │  ├─ src
│  │  │  ├─ app.tsx
│  │  │  ├─ hooks
│  │  │  │  ├─ useBulkImport.ts
│  │  │  │  ├─ useCoefficients.ts
│  │  │  │  ├─ useConcours.ts
│  │  │  │  ├─ useDashboardStats.ts
│  │  │  │  ├─ useEleves.ts
│  │  │  │  ├─ useEvaluations.ts
│  │  │  │  ├─ useInscriptions.ts
│  │  │  │  ├─ useMatieres.ts
│  │  │  │  ├─ useNotes.ts
│  │  │  │  ├─ useResultats.ts
│  │  │  │  └─ useSousCentres.ts
│  │  │  ├─ lib
│  │  │  │  ├─ auth-api.ts
│  │  │  │  ├─ auth-context.tsx
│  │  │  │  ├─ auth-storage.ts
│  │  │  │  ├─ csv.ts
│  │  │  │  ├─ env.ts
│  │  │  │  ├─ error-boundary.tsx
│  │  │  │  ├─ evaluation-statut.ts
│  │  │  │  └─ supabase.ts
│  │  │  ├─ main.tsx
│  │  │  ├─ routes
│  │  │  │  ├─ change-password.tsx
│  │  │  │  ├─ dashboard.tsx
│  │  │  │  ├─ eleves
│  │  │  │  │  ├─ confirm-delete.tsx
│  │  │  │  │  ├─ create-modal.tsx
│  │  │  │  │  ├─ edit-modal.tsx
│  │  │  │  │  ├─ import.tsx
│  │  │  │  │  ├─ inscriptions-section.tsx
│  │  │  │  │  ├─ list.tsx
│  │  │  │  │  └─ share-code-block.tsx
│  │  │  │  ├─ evaluations
│  │  │  │  │  ├─ detail.tsx
│  │  │  │  │  ├─ form-modal.tsx
│  │  │  │  │  ├─ list.tsx
│  │  │  │  │  ├─ publish-modal.tsx
│  │  │  │  │  ├─ resultats.tsx
│  │  │  │  │  └─ saisie.tsx
│  │  │  │  ├─ guards.tsx
│  │  │  │  ├─ layout.tsx
│  │  │  │  ├─ login.tsx
│  │  │  │  └─ referentiel
│  │  │  │     ├─ coefficients.tsx
│  │  │  │     ├─ concours.tsx
│  │  │  │     ├─ layout.tsx
│  │  │  │     ├─ matieres.tsx
│  │  │  │     └─ sous-centres.tsx
│  │  │  └─ styles
│  │  │     └─ index.css
│  │  ├─ tsconfig.json
│  │  └─ vite.config.ts
│  └─ portail
│     ├─ index.html
│     ├─ package.json
│     ├─ src
│     │  ├─ app.tsx
│     │  ├─ hooks
│     │  │  └─ useResultats.ts
│     │  ├─ lib
│     │  │  ├─ auth-context.tsx
│     │  │  └─ supabase.ts
│     │  ├─ main.tsx
│     │  ├─ routes
│     │  │  ├─ dashboard.tsx
│     │  │  ├─ evaluation-detail.tsx
│     │  │  └─ login.tsx
│     │  └─ styles
│     │     └─ index.css
│     ├─ tsconfig.json
│     └─ vite.config.ts
├─ docs
│  └─ cahier-des-charges-alpha-center.md
├─ eslint.config.js
├─ favicon-16x16.png
├─ favicon-32x32.png
├─ favicon.ico
├─ favicon.svg
├─ index.html
├─ logo.png
├─ og-image.png
├─ package.json
├─ packages
│  ├─ shared
│  │  ├─ package.json
│  │  ├─ src
│  │  │  ├─ auth
│  │  │  │  ├─ index.ts
│  │  │  │  └─ jwt.ts
│  │  │  ├─ constants.ts
│  │  │  ├─ db.types.ts
│  │  │  ├─ index.ts
│  │  │  ├─ schemas
│  │  │  │  ├─ admin.ts
│  │  │  │  ├─ eleve.ts
│  │  │  │  ├─ evaluation.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ inscription.ts
│  │  │  │  └─ note.ts
│  │  │  └─ utils
│  │  │     ├─ date.ts
│  │  │     ├─ index.ts
│  │  │     ├─ matricule.test.ts
│  │  │     ├─ matricule.ts
│  │  │     ├─ moyenne.test.ts
│  │  │     ├─ moyenne.ts
│  │  │     ├─ rang.test.ts
│  │  │     └─ rang.ts
│  │  └─ tsconfig.json
│  └─ ui
│     ├─ package.json
│     ├─ src
│     │  ├─ components
│     │  │  ├─ Avatar.tsx
│     │  │  ├─ Button.tsx
│     │  │  ├─ Card.tsx
│     │  │  ├─ Field.tsx
│     │  │  ├─ Icon.tsx
│     │  │  ├─ IconButton.tsx
│     │  │  ├─ Input.tsx
│     │  │  ├─ KpiCard.tsx
│     │  │  ├─ Modal.tsx
│     │  │  ├─ Pill.tsx
│     │  │  ├─ Select.tsx
│     │  │  ├─ Switch.tsx
│     │  │  └─ Table.tsx
│     │  ├─ index.ts
│     │  ├─ lib
│     │  │  └─ cn.ts
│     │  └─ styles.css
│     └─ tsconfig.json
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ README.md
├─ repomix-output.xml
├─ supabase
│  ├─ config.toml
│  ├─ functions
│  │  ├─ deno.json
│  │  ├─ login-admin
│  │  │  └─ index.ts
│  │  ├─ login-eleve
│  │  │  └─ index.ts
│  │  └─ _shared
│  │     ├─ cors.ts
│  │     ├─ jwt.ts
│  │     └─ supabase.ts
│  ├─ migrations
│  │  ├─ 20260528000001_init_schema.sql
│  │  ├─ 20260528000002_views_resultats.sql
│  │  ├─ 20260528000003_auth_admins.sql
│  │  ├─ 20260528000004_auth_eleves.sql
│  │  ├─ 20260528000005_audit_log.sql
│  │  ├─ 20260528000006_rls_policies.sql
│  │  ├─ 20260528000007_fix_verify_admin_password.sql
│  │  ├─ 20260528000008_rls_use_app_role.sql
│  │  ├─ 20260528000009_fix_jwt_eleve_id_recursion.sql
│  │  ├─ 20260528000010_audit_set_eleve_code.sql
│  │  └─ 20260528000011_eleves_etablissement_origine.sql
│  └─ seed.sql
└─ tsconfig.base.json

```