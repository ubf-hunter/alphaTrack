# alphaTrack

Système de gestion des résultats d'Alpha Center — back-office + portail élève.
Référence : `docs/cahier-des-charges-alpha-center.md`.

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
