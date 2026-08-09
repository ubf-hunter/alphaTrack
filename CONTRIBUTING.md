# Politique d'utilisation & Guide de contribution

> **English version below** — see [Usage Policy & Contribution Guide](#usage-policy--contribution-guide).

Merci de l'intérêt que vous portez à **alphaTrack**. Ce document réunit les règles d'utilisation du projet et la marche à suivre pour y contribuer.

---

## 1. Politique d'utilisation

### 1.1 Licence

Le **code source** de ce dépôt est distribué sous **licence MIT** — voir [LICENSE](LICENSE). Vous pouvez :

- l'utiliser à des fins personnelles ou commerciales ;
- le modifier, le forker, le redistribuer ;
- l'intégrer à d'autres projets ouverts ou propriétaires.

À condition de conserver la mention de copyright et le texte de la licence dans toute redistribution du code source.

### 1.2 Ce que la MIT NE couvre PAS

- Les **résultats d'examens** stockés en base sont des **données personnelles d'élèves** — conformité RGPD / lois camerounaises à la charge de l'exploitant.
- Les **jeux de données de sujets, corrigés, coefficients** peuvent appartenir à Alpha Center et ne sont pas redistribuables sans accord.
- Le nom **Alpha Center** et l'identité visuelle associée restent la propriété d'Alpha Center.

### 1.3 Données personnelles et mineurs

⚠️ Les élèves sont en grande majorité **mineurs** au moment du concours. Toute personne déployant ce code en production doit :

- obtenir le **consentement parental** conformément à la loi ;
- limiter la collecte au strict nécessaire ;
- offrir un mécanisme d'export et de suppression des données à la demande de l'élève ou du parent ;
- sécuriser les canaux d'accès (HTTPS obligatoire, RLS activée, audit log immuable).

Le projet est **conçu autour de ces contraintes** — ne les affaiblissez pas.

### 1.4 Absence de garantie

Le logiciel est fourni **« tel quel »**, sans garantie d'aucune sorte. L'auteur ne peut être tenu responsable des dommages, pertes de données, fuites ou erreurs de calcul résultant de son utilisation.

### 1.5 Signalement de vulnérabilité

Le projet gère des **données sensibles** (résultats de concours pour des mineurs). Une faille peut entraîner **fuite anticipée** ou **modification frauduleuse** de notes.

**Ne créez pas d'issue publique.** Contactez directement l'auteur avec :

- une description du problème ;
- une preuve de concept minimale ;
- l'impact potentiel (fuite / modification / DoS).

Un délai raisonnable de correction sera respecté avant toute divulgation publique.

---

## 2. Guide de contribution

### 2.1 Types de contributions bienvenues

- 🐛 **Correctifs** — bugs UI, saisie, calcul de moyennes
- ♿ **Accessibilité** — le portail élève doit rester utilisable sur téléphone bas-de-gamme
- 🧪 **Tests** — Vitest pour la logique, tests d'intégration pour les Edge Functions
- 🔐 **Sécurité** — durcissement RLS, audit log, protection Edge Functions
- ⚡ **Performance** — le portail élève est consulté en pic (jours de résultats)
- 📚 **Documentation** — cahier des charges, guides de déploiement
- 🌍 **Internationalisation** — bases i18n pour un futur déploiement anglophone

### 2.2 Avant de commencer

- **Ouvrez une issue** avant tout travail conséquent.
- **Lisez le cahier des charges** ([`docs/cahier-des-charges-alpha-center.md`](docs/cahier-des-charges-alpha-center.md)) pour comprendre les contraintes métier avant de proposer une refonte.

### 2.3 Workflow

1. **Forkez** le dépôt.
2. Créez une **branche dédiée** :
   ```bash
   git checkout -b feat/nom-court
   ```
   - `feat/…` — nouvelle fonctionnalité
   - `fix/…` — correctif
   - `docs/…` — documentation
   - `db/…` — migration Supabase / modification RLS
   - `sec/…` — durcissement sécurité (précisez le CVE-like concerné)
   - `perf/…` — optimisation
3. **Committez** avec des messages clairs à l'impératif :
   ```
   feat(admin): ajoute l'export PDF des résultats par sous-centre
   fix(portail): corrige l'affichage des notes après publication
   db: ajoute la table challenge_streaks
   sec: durcit la Edge Function login-eleve contre le brute force
   ```
4. **Poussez** votre branche et **ouvrez une pull request** vers `main`.
5. Décrivez le **contexte**, la **motivation** et la **façon de tester** dans la PR — inclure des captures pour les changements UI.

### 2.4 Style de code

- **TypeScript strict** — pas de `any` non justifié.
- **ESLint flat config** — `pnpm lint` doit passer avec **0 warning**.
- **Prettier** — `pnpm format` avant commit (une hook Husky s'en charge).
- **Zod** pour toute validation à la frontière (API, formulaires).
- **React Query** pour tout data-fetching Supabase — pas d'appel direct depuis un composant.
- **Types générés** — après toute migration DB, regénérez `packages/shared/src/db.types.ts` avec `pnpm db:types`.
- **Tailwind v4** + composants **Radix** — respectez le design system dans `packages/ui`.

### 2.5 Base de données et RLS

Toute modification du schéma :

1. Doit être écrite en **migration SQL versionnée** dans `supabase/migrations/` (jamais d'édition rétroactive d'une migration déjà mergée).
2. Doit inclure ou mettre à jour les **politiques RLS** correspondantes — aucune table publique sans RLS.
3. Doit être testée en local (`pnpm db:reset`) et documentée dans la PR.
4. Pour toute Edge Function : test unitaire + test d'intégration obligatoires.

**Toute PR qui désactive RLS, expose une clé `service_role` côté front, ou contourne le contrôle d'accès sera systématiquement refusée.**

### 2.6 Code de conduite

**Respect mutuel.** Aucune forme de harcèlement, discrimination ou attaque personnelle ne sera tolérée dans les issues, les PR ou les discussions. Les retours doivent porter sur le code, jamais sur les personnes.

### 2.7 Contact

- **Auteur** : Béni Uwayo — [@ubf-hunter](https://github.com/ubf-hunter)
- **Issues** : [github.com/ubf-hunter/alphaTrack/issues](https://github.com/ubf-hunter/alphaTrack/issues)

---

# Usage Policy & Contribution Guide

Thanks for your interest in **alphaTrack**. This document brings together the usage rules and the steps to follow to contribute.

---

## 1. Usage Policy

### 1.1 License

The **source code** in this repository is distributed under the **MIT License** — see [LICENSE](LICENSE). You may:

- use it for personal or commercial purposes;
- modify, fork, redistribute it;
- integrate it into other open or proprietary projects.

Provided you keep the copyright notice and license text in any source code redistribution.

### 1.2 What MIT does NOT cover

- **Exam results** stored in the database are **student personal data** — GDPR / Cameroonian law compliance is the operator's responsibility.
- **Datasets of exam papers, corrections, coefficients** may belong to Alpha Center and are not redistributable without agreement.
- The **Alpha Center** name and associated visual identity remain the property of Alpha Center.

### 1.3 Personal data and minors

⚠️ Students are largely **minors** at the time of the exam. Anyone deploying this code in production must:

- obtain **parental consent** as required by law;
- limit data collection to the strict minimum;
- provide a mechanism to export and delete data on request from the student or parent;
- secure access channels (HTTPS mandatory, RLS enabled, immutable audit log).

The project is **designed around these constraints** — do not weaken them.

### 1.4 No warranty

The software is provided **"as is"**, without warranty of any kind. The author cannot be held liable for damage, data loss, leaks or calculation errors resulting from its use.

### 1.5 Reporting a vulnerability

The project handles **sensitive data** (exam results for minors). A flaw can result in **early leak** or **fraudulent modification** of grades.

**Do not open a public issue.** Contact the author directly with:

- a description of the problem;
- a minimal proof of concept;
- the potential impact (leak / modification / DoS).

A reasonable delay will be observed before any public disclosure.

---

## 2. Contribution Guide

### 2.1 Welcome contribution types

- 🐛 **Fixes** — UI bugs, entry, average calculations
- ♿ **Accessibility** — the student portal must remain usable on a low-end phone
- 🧪 **Tests** — Vitest for logic, integration tests for Edge Functions
- 🔐 **Security** — RLS hardening, audit log, Edge Function protection
- ⚡ **Performance** — the student portal is hit at peak (results days)
- 📚 **Documentation** — requirements spec, deployment guides
- 🌍 **Internationalization** — i18n foundations for a future English-speaking deployment

### 2.2 Before you start

- **Open an issue** before any substantial work.
- **Read the requirements spec** ([`docs/cahier-des-charges-alpha-center.md`](docs/cahier-des-charges-alpha-center.md)) to understand business constraints before proposing a rewrite.

### 2.3 Workflow

1. **Fork** the repository.
2. Create a **dedicated branch**:
   ```bash
   git checkout -b feat/short-name
   ```
   - `feat/…` — new feature
   - `fix/…` — bug fix
   - `docs/…` — documentation
   - `db/…` — Supabase migration / RLS change
   - `sec/…` — security hardening (specify the CVE-like concerned)
   - `perf/…` — optimization
3. **Commit** with clear, imperative messages:
   ```
   feat(admin): add PDF export of results per sub-center
   fix(portail): correct note display after publication
   db: add challenge_streaks table
   sec: harden login-eleve Edge Function against brute force
   ```
4. **Push** your branch and **open a pull request** to `main`.
5. Describe the **context**, **motivation** and **how to test** in the PR — include screenshots for UI changes.

### 2.4 Code style

- **Strict TypeScript** — no unjustified `any`.
- **ESLint flat config** — `pnpm lint` must pass with **0 warning**.
- **Prettier** — `pnpm format` before commit (a Husky hook handles this).
- **Zod** for any validation at the boundary (API, forms).
- **React Query** for all Supabase data-fetching — no direct call from a component.
- **Generated types** — after any DB migration, regenerate `packages/shared/src/db.types.ts` with `pnpm db:types`.
- **Tailwind v4** + **Radix** components — respect the design system in `packages/ui`.

### 2.5 Database and RLS

Any schema modification:

1. Must be written as a **versioned SQL migration** in `supabase/migrations/` (never edit a merged migration retroactively).
2. Must include or update the corresponding **RLS policies** — no public table without RLS.
3. Must be tested locally (`pnpm db:reset`) and documented in the PR.
4. For any Edge Function: unit test + integration test are mandatory.

**Any PR that disables RLS, exposes a `service_role` key on the frontend, or bypasses access control will be systematically refused.**

### 2.6 Code of conduct

**Mutual respect.** No form of harassment, discrimination or personal attack will be tolerated in issues, PRs or discussions. Feedback must be about the code, never about individuals.

### 2.7 Contact

- **Author**: Béni Uwayo — [@ubf-hunter](https://github.com/ubf-hunter)
- **Issues**: [github.com/ubf-hunter/alphaTrack/issues](https://github.com/ubf-hunter/alphaTrack/issues)
