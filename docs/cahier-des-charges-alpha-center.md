# Cahier des charges — Système de gestion des résultats
### Alpha Center · Préparation aux concours des grandes écoles (Cameroun)

> Document de conception fonctionnelle et technique
> Version 1.0 — Mai 2026
> Stack cible : React + Tailwind CSS v4 (front) · Supabase / PostgreSQL (back)

---

## 1. Contexte et présentation

Alpha Center est un centre de préparation aux concours d'entrée dans les grandes écoles camerounaises (ENSPY, FMSB, etc.). Les élèves s'inscrivent pour préparer **un concours précis** et composent des **évaluations blanches** récurrentes, organisées simultanément dans plusieurs centres :

- **Région de Yaoundé** : 1 sous-centre — composition le **vendredi**.
- **Région de Dschang** : 5 sous-centres — composition le **samedi**.

Pour une même évaluation et un même concours, **tous les sous-centres composent exactement la même épreuve**. C'est cette uniformité qui rend les classements (sous-centre, régional, national) légitimes.

Le système doit gérer les notes, calculer automatiquement les moyennes et les trois niveaux de classement, produire des bulletins exportables (PDF et Excel), et offrir un **portail de consultation** aux élèves sur `eleves.alphacenter.cm`.

Volume cible au lancement : **500 élèves et plus**, plusieurs concours, plusieurs évaluations par mois.

---

## 2. Objectifs

1. **Centraliser** les notes de tous les sous-centres dans une base unique et fiable.
2. **Automatiser** entièrement le calcul des moyennes pondérées et des trois rangs (aucun calcul manuel).
3. **Sécuriser** la confidentialité : un élève ne consulte que ses propres résultats.
4. **Gérer la publication** pour éviter toute fuite entre le vendredi (Yaoundé) et le samedi (Dschang).
5. **Exporter** les résultats individuels et collectifs en PDF et Excel.
6. **Offrir un portail élève** clair, rapide et utilisable sur mobile (contexte réseau camerounais).

---

## 3. Périmètre

### Dans le périmètre (v1)
- Administration des concours, matières, coefficients, sous-centres, élèves.
- Création et gestion des évaluations blanches.
- Saisie des notes (manuelle + import CSV/Excel).
- Calcul automatique : moyenne pondérée, rang sous-centre / régional / national, effectifs.
- Portail élève (authentification, consultation, historique).
- Exports PDF (bulletin individuel) et Excel (listes/classements).
- Gestion de la publication (embargo vendredi → samedi).

### Hors périmètre (v1, à étudier plus tard)
- Paiement en ligne des inscriptions.
- Notifications SMS/WhatsApp automatiques des résultats.
- Application mobile native (le portail web responsive suffit).
- Saisie des copies en ligne / correction numérique.
- Statistiques pédagogiques avancées (progression par matière sur l'année) — prévu en v2.

---

## 4. Hypothèses de conception (à valider)

> Ces choix par défaut structurent le modèle. Dis-moi si l'un d'eux ne correspond pas à ta réalité.

| # | Hypothèse retenue | Alternative possible |
|---|---|---|
| H1 | Un élève peut préparer **un ou plusieurs concours** (modélisé via une table `inscriptions`, ce qui couvre les deux cas sans rien changer). | — |
| H2 | Les **coefficients sont fixes par concours** ; ils sont « figés » (snapshot) au moment du calcul d'une évaluation pour préserver l'historique. | Coefficients variables par évaluation. |
| H3 | Les notes sont **sur 20**. La moyenne = Σ(note × coef) / Σ(coef). | Notes sur 100 / barème variable. |
| H4 | Les **ex-aequo** partagent le même rang, avec saut de rang ensuite (`RANK` : 1, 1, 3). | Rang dense (1, 1, 2). |
| H5 | Un élève **absent à une matière** reçoit 0 par défaut (modifiable) ; absent à toute l'évaluation → **« Non classé »**. | Exclusion de la matière du calcul. |
| H6 | Authentification élève par **matricule + code d'accès personnel** remis à l'inscription. | Matricule + date de naissance. |

---

## 5. Acteurs et rôles

| Rôle | Description | Accès |
|---|---|---|
| **Super-administrateur** | Toi / la direction. Configure tout, publie les résultats. | Total |
| **Responsable de saisie (sous-centre)** | Saisit les notes de son sous-centre uniquement. | Restreint à son sous-centre |
| **Administrateur régional** *(optionnel)* | Supervise une région, valide les saisies. | Lecture/validation d'une région |
| **Élève** | Consulte ses résultats et ses rangs après publication. | Ses propres données uniquement |
| **Visiteur** | Public du site vitrine. | Pages publiques |

La séparation **saisie ≠ publication** est essentielle : un responsable de sous-centre saisit, mais seul le super-admin publie.

---

## 6. Architecture technique

```
┌─────────────────────────────────────────────────────────┐
│                    FRONT-END (React + Tailwind v4)        │
│                                                           │
│   ┌──────────────┐   ┌──────────────┐   ┌─────────────┐  │
│   │ Back-office  │   │ Portail élève│   │ Site vitrine│  │
│   │   (admin)    │   │ eleves.…cm   │   │ alphacenter │  │
│   └──────┬───────┘   └──────┬───────┘   └──────┬──────┘  │
└──────────┼──────────────────┼──────────────────┼─────────┘
           │      API auto-générée + Auth + RLS    │
┌──────────▼──────────────────▼──────────────────▼─────────┐
│                    SUPABASE (PostgreSQL)                   │
│   Tables · Vues de classement (SQL) · Auth · RLS · Storage │
└───────────────────────────────────────────────────────────┘
```

**Choix techniques recommandés**

- **Front** : React 18+, Vite, Tailwind CSS v4, React Router. Bibliothèques : `@supabase/supabase-js`, `@tanstack/react-query` (cache/données), `react-hook-form` + `zod` (formulaires/validation), `xlsx` (SheetJS, export Excel), génération PDF côté serveur ou via template HTML→PDF.
- **Back** : Supabase — PostgreSQL, API REST/GraphQL auto-générée, **Auth** intégrée, **Row-Level Security (RLS)** pour la confidentialité, **Storage** (photos élèves, PDF générés). Les classements vivent dans des **vues SQL** qui se recalculent seules.
- **Hébergement** : Vercel ou Netlify pour les fronts. DNS : `alphacenter.cm` (vitrine) et `eleves.alphacenter.cm` (portail) pointés dessus.
- **Génération PDF** : recommandé via une **Edge Function** Supabase (template HTML → PDF) pour un rendu identique et imprimable, plutôt que côté navigateur (plus fragile).

---

## 7. Modèle de données

Neuf tables principales. La **table `inscriptions`** est la colonne vertébrale : elle relie une personne à un concours dans un sous-centre, et c'est à elle que se rattachent les notes.

### 7.1 Schéma relationnel

```
regions ──< sous_centres ──< inscriptions >── concours
                                  │              │
                                  │              └──< concours_matieres >── matieres
                                  │
eleves ──────────────────────────┘
                                  │
                            inscriptions ──< notes >── matieres
                                                │
                                          evaluations
```

### 7.2 Description des tables

**`regions`** — les 2 régions
`id`, `nom` (Yaoundé / Dschang), `jour_composition` (vendredi / samedi)

**`sous_centres`** — les 6 sous-centres
`id`, `region_id` (FK), `nom`, `code`, `ville`

**`concours`** — ENSPY, FMSB, …
`id`, `nom`, `sigle`, `description`, `actif` (booléen)

**`matieres`** — liste globale des matières
`id`, `nom`, `code`

**`concours_matieres`** — quelles matières et quels coefficients pour chaque concours
`id`, `concours_id` (FK), `matiere_id` (FK), `coefficient`
→ *C'est ici que vit la pondération.* Une ligne par couple (concours, matière).

**`eleves`** — la personne
`id`, `matricule` (unique), `nom`, `prenom`, `sexe`, `date_naissance`, `telephone`, `email`, `photo_url`, `code_acces` (haché), `cree_le`

**`inscriptions`** — un élève inscrit à un concours dans un sous-centre
`id`, `eleve_id` (FK), `concours_id` (FK), `sous_centre_id` (FK), `session` (ex. 2025-2026), `statut_paiement`, `statut` (actif/inactif), `date_inscription`
→ Un même élève peut avoir plusieurs inscriptions (plusieurs concours). **Les notes se rattachent à l'inscription, pas à l'élève.**

**`evaluations`** — un événement daté (« Blanc n°3 — Mai 2026 »)
`id`, `libelle`, `numero`, `session`, `date_yaounde`, `date_dschang`, `statut` (voir §9), `publie_le`
→ Globale : tous les concours actifs composent lors de cette évaluation.

**`notes`** — le cœur du système
`id`, `inscription_id` (FK), `evaluation_id` (FK), `matiere_id` (FK), `note`, `absent` (booléen), `saisie_par`, `saisie_le`
→ Une ligne par (inscription × évaluation × matière). La matière doit appartenir au concours de l'inscription (contrainte de cohérence).

### 7.3 Vue de calcul (résultats et rangs)

Une **vue SQL** `v_resultats` agrège tout automatiquement. Pour chaque (inscription, évaluation), elle calcule la moyenne pondérée puis les trois rangs :

```sql
-- Étape 1 : moyenne pondérée par inscription/évaluation
WITH moyennes AS (
  SELECT
    n.inscription_id,
    n.evaluation_id,
    i.concours_id,
    i.sous_centre_id,
    sc.region_id,
    SUM(n.note * cm.coefficient) / NULLIF(SUM(cm.coefficient), 0) AS moyenne
  FROM notes n
  JOIN inscriptions i        ON i.id = n.inscription_id
  JOIN sous_centres sc       ON sc.id = i.sous_centre_id
  JOIN concours_matieres cm  ON cm.concours_id = i.concours_id
                            AND cm.matiere_id  = n.matiere_id
  GROUP BY n.inscription_id, n.evaluation_id, i.concours_id,
           i.sous_centre_id, sc.region_id
)
-- Étape 2 : les trois rangs, tous "partitionnés" par (évaluation, concours)
SELECT
  m.*,
  RANK() OVER (PARTITION BY evaluation_id, concours_id
               ORDER BY moyenne DESC)                      AS rang_national,
  RANK() OVER (PARTITION BY evaluation_id, concours_id, region_id
               ORDER BY moyenne DESC)                      AS rang_regional,
  RANK() OVER (PARTITION BY evaluation_id, concours_id, sous_centre_id
               ORDER BY moyenne DESC)                      AS rang_sous_centre,
  COUNT(*) OVER (PARTITION BY evaluation_id, concours_id)              AS effectif_national,
  COUNT(*) OVER (PARTITION BY evaluation_id, concours_id, region_id)   AS effectif_regional,
  COUNT(*) OVER (PARTITION BY evaluation_id, concours_id, sous_centre_id) AS effectif_sous_centre
FROM moyennes m;
```

> **Principe à retenir** : tous les classements se calculent **à l'intérieur d'un même couple (évaluation, concours)**. On ne compare jamais un élève ENSPY à un élève FMSB. Les trois rangs ne sont que trois « zooms » (national → régional → sous-centre) sur le même classement.

L'affichage d'un rang se fait toujours avec l'effectif : **« 5ᵉ / 120 »**, sinon le rang n'a pas de sens.

---

## 8. Règles de gestion

| Règle | Détail |
|---|---|
| **RG1 — Moyenne** | Moyenne pondérée = Σ(note × coef) / Σ(coef), notes sur 20. |
| **RG2 — Périmètre du rang** | Toujours dans (évaluation, concours). Trois niveaux : sous-centre, région, national. |
| **RG3 — Ex-aequo** | Même rang partagé, saut ensuite (RANK). Affichage avec effectif. |
| **RG4 — Absence partielle** | Note 0 par défaut (paramétrable), drapeau `absent` conservé pour le bulletin. |
| **RG5 — Absence totale** | Aucune note → statut « Non classé », exclu des rangs mais visible dans les listes. |
| **RG6 — Cohérence matière/concours** | Une note ne peut concerner qu'une matière appartenant au concours de l'inscription. |
| **RG7 — Figement des coefficients** | Les coefficients utilisés sont ceux en vigueur lors du calcul ; un changement ultérieur ne réécrit pas l'historique. |
| **RG8 — Publication** | Les résultats ne sont visibles côté élève qu'après passage de l'évaluation au statut « Publié ». |
| **RG9 — Unicité matricule / code** | Matricule unique ; code d'accès personnel, stocké haché. |

---

## 9. Cycle de vie d'une évaluation (workflow)

C'est ce mécanisme qui résout le risque de fuite vendredi → samedi.

```
[Brouillon] → [Composition] → [Saisie des notes] → [Calculé] → [Publié] → [Archivé]
```

1. **Brouillon** — l'admin crée l'évaluation, fixe les dates (Yaoundé vendredi, Dschang samedi).
2. **Composition** — les épreuves ont lieu. Yaoundé compose le vendredi, Dschang le samedi.
3. **Saisie des notes** — chaque sous-centre saisit ses notes (manuel ou import). **Aucun résultat visible côté élève.**
4. **Calculé** — l'admin lance le calcul ; moyennes et rangs sont générés et vérifiables en interne.
5. **Publié** — l'admin publie (jamais avant le samedi soir). Les élèves accèdent alors à leurs résultats.
6. **Archivé** — l'évaluation rejoint l'historique consultable.

> **Anti-fuite** : tant que le statut n'est pas « Publié », le portail élève ne renvoie rien pour cette évaluation. Yaoundé ne peut donc pas connaître les résultats avant que Dschang ait composé.

---

## 10. Fonctionnalités détaillées par module

### 10.1 Back-office — Administration

**Gestion des référentiels**
- CRUD concours (création, activation/désactivation).
- CRUD matières.
- Association matières ↔ concours avec **coefficients** (table `concours_matieres`).
- CRUD régions et sous-centres.

**Gestion des élèves et inscriptions**
- Création d'un élève (état civil, contact, photo, génération automatique du matricule et du code d'accès).
- Inscription d'un élève à un ou plusieurs concours, rattaché à un sous-centre.
- Import en masse des élèves via CSV/Excel.
- Recherche, filtres (par sous-centre, concours, statut de paiement), édition.

**Gestion des évaluations**
- Création d'une évaluation (libellé, numéro, dates Yaoundé/Dschang, session).
- Tableau de bord du statut (combien de sous-centres ont saisi, combien manquent).
- Bouton **Calculer** puis **Publier** (avec garde-fou : confirmation explicite).

### 10.2 Module de saisie des notes

- Accès restreint : un responsable ne voit **que son sous-centre**.
- Sélection : évaluation → concours → matière → liste des élèves concernés.
- **Saisie en grille** (type tableur) : une ligne par élève, une colonne par matière, navigation au clavier.
- Marquage **« absent »** par case à cocher.
- **Import CSV/Excel** : indispensable pour 500+ élèves. Modèle téléchargeable (colonnes : matricule, matière, note). Validation à l'import (matricule inconnu, note hors 0–20, doublon) avec rapport d'erreurs avant validation finale.
- Indicateur de complétude (« 118 / 120 notes saisies »).

### 10.3 Module calcul et classement

- Déclenché par l'admin sur une évaluation.
- Calcul des moyennes pondérées + trois rangs + effectifs (vue SQL).
- Tableau de contrôle interne : classements complets par concours, repérage des « non classés ».
- Possibilité de recalculer après correction d'une note.

### 10.4 Module exports

**Export PDF — bulletin individuel**
- En-tête Alpha Center (logo, identité élève, photo, concours, sous-centre, évaluation).
- Tableau des notes par matière avec coefficients.
- Moyenne générale.
- Les trois rangs avec effectifs (sous-centre / région / national).
- Mention (Non classé, Absent) le cas échéant.
- Mise en page imprimable, format A4.

**Export Excel**
- Classement complet d'un concours pour une évaluation (toutes colonnes : matricule, nom, notes par matière, moyenne, 3 rangs).
- Liste des inscrits par sous-centre.
- Export filtrable (par concours, sous-centre, région).

**Export PDF — classements collectifs** (optionnel v1.1)
- Palmarès par concours (top N national / régional).

### 10.5 Portail élève — `eleves.alphacenter.cm`

- **Connexion** : matricule + code d'accès personnel.
- **Tableau de bord** : dernière évaluation publiée en avant.
- **Détail d'un résultat** : notes par matière, moyenne, et les trois rangs avec effectifs et formulation claire (« Tu es 5ᵉ sur 120 au niveau national en ENSPY »).
- **Historique** : toutes les évaluations publiées passées, avec courbe d'évolution de la moyenne et du rang (visuel motivant).
- **Téléchargement** de son bulletin PDF.
- **Confidentialité stricte** : via RLS, un élève ne peut techniquement accéder qu'à ses propres données, même en manipulant les requêtes.
- **Responsive mobile-first** (beaucoup d'élèves consulteront sur téléphone, en données mobiles → pages légères).

### 10.6 Site vitrine — `alphacenter.cm`

- Présentation du centre, des concours préparés, des sous-centres.
- Modalités et formulaire d'inscription (ou prise de contact).
- Lien clair vers le portail de consultation des résultats.
- Calendrier des évaluations blanches.
- Cohérent avec ton travail de pré-lancement (identité visuelle, supports de communication).

---

## 11. Spécifications des écrans (synthèse)

| Écran | Module | Contenu clé |
|---|---|---|
| Tableau de bord admin | Back-office | KPIs : élèves, évaluations en cours, taux de saisie |
| Gestion concours/matières | Back-office | CRUD + grille des coefficients |
| Fiche élève / inscriptions | Back-office | État civil + concours rattachés |
| Création évaluation | Back-office | Dates, session, statut |
| Grille de saisie | Saisie | Tableur élèves × matières + import |
| Contrôle des classements | Calcul | Tableaux triables, repérage anomalies |
| Connexion élève | Portail | Matricule + code |
| Mon résultat | Portail | Notes, moyenne, 3 rangs, PDF |
| Mon historique | Portail | Évolution moyenne/rang |
| Accueil vitrine | Vitrine | Présentation + accès portail |

---

## 12. Sécurité et confidentialité

- **Authentification** : Supabase Auth (sessions JWT). Mots de passe / codes hachés.
- **Row-Level Security (RLS)** : règle de base — un élève n'accède qu'aux lignes où `eleve_id` correspond à son compte ; un responsable de saisie n'accède qu'à son `sous_centre_id`. C'est appliqué **côté base**, donc inviolable depuis le front.
- **Séparation des rôles** : saisie ≠ calcul ≠ publication.
- **Embargo de publication** : aucun résultat servi tant que `statut ≠ publié` (anti-fuite vendredi/samedi).
- **Journalisation** : traçabilité des saisies et modifications de notes (`saisie_par`, `saisie_le`).
- **Sauvegardes** : sauvegardes automatiques de la base (Supabase) + export Excel périodique de sécurité.

---

## 13. Exigences non fonctionnelles

| Catégorie | Exigence |
|---|---|
| **Performance** | Calcul des rangs < 2 s pour 500+ élèves (les vues SQL le permettent largement). |
| **Charge** | Pic de consultation le jour de publication → cache (React Query) et requêtes optimisées. |
| **Mobile** | Portail mobile-first, pages légères (réseau mobile camerounais). |
| **Disponibilité** | Portail accessible 24/7 ; hébergement géré (Vercel/Supabase). |
| **Accessibilité** | Contrastes, tailles de police lisibles, navigation simple. |
| **Évolutivité** | Modèle extensible (nouveaux concours, sessions annuelles) sans refonte. |
| **Maintenabilité** | Code React modulaire, composants réutilisables, typage (TypeScript recommandé). |

---

## 14. Roadmap proposée (MVP → V2)

**Phase 0 — Fondations (semaine 1)**
Schéma Supabase, tables, vues de classement, RLS de base, jeu de données de test.

**Phase 1 — MVP back-office (semaines 2–3)**
Référentiels (concours, matières, coefficients, sous-centres), élèves + import CSV, création d'évaluation, saisie des notes, calcul.

**Phase 2 — Exports (semaine 4)**
Bulletin PDF individuel + export Excel des classements.

**Phase 3 — Portail élève (semaines 4–5)**
Authentification, consultation résultats + rangs, historique, téléchargement PDF, responsive.

**Phase 4 — Site vitrine + mise en ligne (semaine 5–6)**
Pages publiques, DNS (`alphacenter.cm`, `eleves.alphacenter.cm`), tests de bout en bout, lancement.

**V2 (après lancement)**
Notifications SMS/WhatsApp, statistiques pédagogiques, palmarès publics, paiement en ligne.

---

## 15. Questions ouvertes à trancher

1. Un élève peut-il réellement préparer **plusieurs concours** simultanément ? (le modèle le permet déjà via `inscriptions`).
2. Quelles **infos d'inscription** sont obligatoires vs facultatives (photo ? statut de paiement détaillé ?).
3. Les **coefficients** peuvent-ils changer d'une évaluation à l'autre, ou sont-ils stables par concours ?
4. Règle exacte pour les **absents** : 0, exclusion, ou non classé selon le cas ?
5. Mode d'authentification élève préféré : **code personnel** ou **date de naissance** ?
6. Faut-il un rôle **administrateur régional** distinct, ou seulement super-admin + responsables de sous-centre ?

---

## 16. Glossaire

- **Évaluation blanche** : examen blanc daté, organisé simultanément dans tous les sous-centres.
- **Concours** : filière préparée (ENSPY, FMSB…) ; définit les matières et coefficients.
- **Inscription** : lien entre un élève, un concours et un sous-centre.
- **Sous-centre** : lieu de composition (5 à Dschang, 1 à Yaoundé).
- **Rang national / régional / sous-centre** : classement de l'élève dans son concours, à trois échelles.
- **Effectif** : nombre d'élèves dans le périmètre du rang (« 5ᵉ / 120 »).
- **RLS** : Row-Level Security, sécurité au niveau des lignes de la base.

---

*Document de travail — destiné à évoluer après validation des points du §15.*
