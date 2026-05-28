-- ============================================================================
-- Alpha Center / alphaTrack — Seed
-- Jeu de données de test : 2 régions, 6 sous-centres, 2 concours, matières,
-- coefficients, 1 super-admin, 2 saisies, 30 élèves répartis, 1 évaluation.
--
-- Codes d'accès et passwords seed (clair) :
--   Super-admin : ADM-001 / SuperAdmin2026!
--   Saisie Ydé : ADM-101 / SaisieYde2026!
--   Saisie Foréké : ADM-201 / SaisieFor2026!
--   Élèves : code d'accès affiché par la console psql (NOTICE).
-- ============================================================================

-- ---------- Régions ---------------------------------------------------------
insert into public.regions (id, nom, jour_composition) values
  ('11111111-1111-1111-1111-111111111111', 'Yaoundé', 'vendredi'),
  ('22222222-2222-2222-2222-222222222222', 'Dschang', 'samedi');

-- ---------- Sous-centres ----------------------------------------------------
insert into public.sous_centres (id, region_id, nom, code, ville) values
  ('aaaa1111-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111', 'Yaoundé Odza', 'YDE-ODZ', 'Yaoundé'),
  ('aaaa2222-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222', 'Dschang Foréké', 'DSC-FOR', 'Dschang'),
  ('aaaa2222-0000-0000-0000-000000000002',
    '22222222-2222-2222-2222-222222222222', 'Dschang Centre', 'DSC-CEN', 'Dschang'),
  ('aaaa2222-0000-0000-0000-000000000003',
    '22222222-2222-2222-2222-222222222222', 'Dschang Foto', 'DSC-FOT', 'Dschang'),
  ('aaaa2222-0000-0000-0000-000000000004',
    '22222222-2222-2222-2222-222222222222', 'Dschang Tsinkop', 'DSC-TSI', 'Dschang'),
  ('aaaa2222-0000-0000-0000-000000000005',
    '22222222-2222-2222-2222-222222222222', 'Dschang Mbing-Mékoum', 'DSC-MBM', 'Dschang');

-- ---------- Concours --------------------------------------------------------
insert into public.concours (id, nom, sigle, description, actif) values
  ('cccc1111-0000-0000-0000-000000000001',
    'École Nationale Supérieure Polytechnique de Yaoundé', 'ENSPY',
    'Concours d''entrée en cycle ingénieur ENSPY', true),
  ('cccc2222-0000-0000-0000-000000000001',
    'Faculté de Médecine et des Sciences Biomédicales', 'FMSB',
    'Concours d''entrée à la FMSB (Université de Yaoundé I)', true);

-- ---------- Matières --------------------------------------------------------
insert into public.matieres (id, nom, code) values
  ('dddd0000-0000-0000-0000-000000000001', 'Mathématiques', 'MATH'),
  ('dddd0000-0000-0000-0000-000000000002', 'Physique', 'PHY'),
  ('dddd0000-0000-0000-0000-000000000003', 'Chimie', 'CHIM'),
  ('dddd0000-0000-0000-0000-000000000004', 'Biologie', 'BIO'),
  ('dddd0000-0000-0000-0000-000000000005', 'SVT', 'SVT'),
  ('dddd0000-0000-0000-0000-000000000006', 'Français', 'FR'),
  ('dddd0000-0000-0000-0000-000000000007', 'Anglais', 'ANG'),
  ('dddd0000-0000-0000-0000-000000000008', 'Culture générale', 'CG');

-- ---------- Concours × Matières (coefficients) ------------------------------
-- ENSPY : pondéré sciences exactes
insert into public.concours_matieres (concours_id, matiere_id, coefficient) values
  ('cccc1111-0000-0000-0000-000000000001', 'dddd0000-0000-0000-0000-000000000001', 5),  -- Math
  ('cccc1111-0000-0000-0000-000000000001', 'dddd0000-0000-0000-0000-000000000002', 5),  -- Physique
  ('cccc1111-0000-0000-0000-000000000001', 'dddd0000-0000-0000-0000-000000000003', 3),  -- Chimie
  ('cccc1111-0000-0000-0000-000000000001', 'dddd0000-0000-0000-0000-000000000006', 2),  -- Français
  ('cccc1111-0000-0000-0000-000000000001', 'dddd0000-0000-0000-0000-000000000007', 2);  -- Anglais

-- FMSB : pondéré sciences biologiques
insert into public.concours_matieres (concours_id, matiere_id, coefficient) values
  ('cccc2222-0000-0000-0000-000000000001', 'dddd0000-0000-0000-0000-000000000003', 4),  -- Chimie
  ('cccc2222-0000-0000-0000-000000000001', 'dddd0000-0000-0000-0000-000000000004', 5),  -- Biologie
  ('cccc2222-0000-0000-0000-000000000001', 'dddd0000-0000-0000-0000-000000000002', 3),  -- Physique
  ('cccc2222-0000-0000-0000-000000000001', 'dddd0000-0000-0000-0000-000000000006', 2),  -- Français
  ('cccc2222-0000-0000-0000-000000000001', 'dddd0000-0000-0000-0000-000000000008', 2);  -- CG

-- ---------- Admins (super-admin + 2 saisies) --------------------------------
-- bcrypt hash généré inline via crypt() pour pouvoir vérifier ensuite.
insert into public.admins (id, matricule, password_hash, role, sous_centre_id, nom, prenom, must_change_password) values
  ('eeee0000-0000-0000-0000-000000000001',
    'ADM-001',
    extensions.crypt('SuperAdmin2026!', extensions.gen_salt('bf', 10)),
    'admin', null, 'Uwayo', 'Béni', true),
  ('eeee0000-0000-0000-0000-000000000002',
    'ADM-101',
    extensions.crypt('SaisieYde2026!', extensions.gen_salt('bf', 10)),
    'saisie', 'aaaa1111-0000-0000-0000-000000000001', 'Mbida', 'Joseph', true),
  ('eeee0000-0000-0000-0000-000000000003',
    'ADM-201',
    extensions.crypt('SaisieFor2026!', extensions.gen_salt('bf', 10)),
    'saisie', 'aaaa2222-0000-0000-0000-000000000001', 'Kamdem', 'Marie', true);

-- ---------- Élèves de test (30 répartis sur les 6 sous-centres) -------------
-- On utilise une boucle plpgsql pour générer 30 élèves avec matricules,
-- codes d'accès aléatoires et inscriptions équilibrées.
do $$
declare
  v_session text := '2025-2026';
  v_seq integer := 1;
  v_eleve_id uuid;
  v_code text;
  v_sc_ids uuid[] := array[
    'aaaa1111-0000-0000-0000-000000000001'::uuid,  -- Yaoundé Odza
    'aaaa2222-0000-0000-0000-000000000001'::uuid,  -- Dschang Foréké
    'aaaa2222-0000-0000-0000-000000000002'::uuid,  -- Dschang Centre
    'aaaa2222-0000-0000-0000-000000000003'::uuid,  -- Dschang Foto
    'aaaa2222-0000-0000-0000-000000000004'::uuid,  -- Dschang Tsinkop
    'aaaa2222-0000-0000-0000-000000000005'::uuid   -- Dschang Mbing-Mékoum
  ];
  v_prenoms_m text[] := array['Jean','Pierre','Paul','Marc','Luc','Éric','Olivier','Henri','Samuel','Daniel','Arnaud','Cédric','Florent','Yannick'];
  v_prenoms_f text[] := array['Marie','Anne','Sylvie','Carine','Diane','Estelle','Nadège','Pauline','Solange','Brigitte','Larissa','Mireille','Edwige','Charlène'];
  v_noms text[] := array['Mbarga','Nkomo','Tchamba','Fokou','Essomba','Kana','Djiogue','Nguefack','Tagne','Mbangué','Etoundi','Atangana','Owona','Belinga','Mbida','Talla','Wandji','Sop','Foyet','Ngo Bell','Mefoudou','Bekono','Onana','Ekamby','Toua','Manga','Beyala','Nzouango','Asse','Akono'];
  v_sexe public.sexe;
  v_prenom text;
  v_nom text;
  v_concours_ids uuid[] := array[
    'cccc1111-0000-0000-0000-000000000001'::uuid,  -- ENSPY
    'cccc2222-0000-0000-0000-000000000001'::uuid   -- FMSB
  ];
  v_sc_id uuid;
  v_concours_id uuid;
begin
  for v_seq in 1..30 loop
    -- Élève
    v_sexe := case when v_seq % 2 = 0 then 'F'::public.sexe else 'M'::public.sexe end;
    v_prenom := case when v_sexe = 'F'
      then v_prenoms_f[1 + ((v_seq - 1) % array_length(v_prenoms_f, 1))]
      else v_prenoms_m[1 + ((v_seq - 1) % array_length(v_prenoms_m, 1))] end;
    v_nom := v_noms[1 + ((v_seq - 1) % array_length(v_noms, 1))];
    v_code := lpad(((100000 + v_seq * 7919) % 900000 + 100000)::text, 6, '0');

    insert into public.eleves (
      id, matricule, nom, prenom, sexe, date_naissance,
      telephone, code_acces_hash
    ) values (
      extensions.uuid_generate_v4(),
      'AC-26-' || lpad(v_seq::text, 4, '0'),
      v_nom, v_prenom, v_sexe,
      date '2007-01-01' + ((v_seq * 17) % 730),
      '+237' || lpad((600000000 + v_seq * 12345)::text, 9, '0'),
      extensions.crypt(v_code, extensions.gen_salt('bf', 10))
    ) returning id into v_eleve_id;

    raise notice 'Élève AC-26-% / code accès : %', lpad(v_seq::text, 4, '0'), v_code;

    -- Une inscription pour chaque élève — réparti rond-robin sur les 6 sous-centres
    -- et les 2 concours (avantage : on a un mix réaliste).
    v_sc_id := v_sc_ids[1 + ((v_seq - 1) % array_length(v_sc_ids, 1))];
    v_concours_id := v_concours_ids[1 + ((v_seq - 1) % array_length(v_concours_ids, 1))];

    insert into public.inscriptions (eleve_id, concours_id, sous_centre_id, session, statut_paiement)
    values (
      v_eleve_id, v_concours_id, v_sc_id, v_session,
      case when v_seq % 5 = 0 then 'non_paye'::public.statut_paiement
           when v_seq % 3 = 0 then 'partiel'::public.statut_paiement
           else 'paye'::public.statut_paiement end
    );

    -- Quelques élèves multi-concours (5 élèves font les 2 concours)
    if v_seq % 6 = 0 then
      insert into public.inscriptions (eleve_id, concours_id, sous_centre_id, session, statut_paiement)
      values (
        v_eleve_id,
        v_concours_ids[1 + ((v_seq) % array_length(v_concours_ids, 1))],
        v_sc_id, v_session, 'paye'
      );
    end if;
  end loop;
end $$;

-- ---------- Une évaluation en brouillon -------------------------------------
insert into public.evaluations (id, libelle, numero, session, date_yaounde, date_dschang, statut)
values (
  'ffff0000-0000-0000-0000-000000000001',
  'Évaluation blanche n°3 — Mai 2026',
  3,
  '2025-2026',
  date '2026-05-29',
  date '2026-05-30',
  'brouillon'
);
