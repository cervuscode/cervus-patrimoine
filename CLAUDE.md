# CLAUDE.md — Cervus Patrimoine

Contexte projet pour les sessions Claude. À lire en premier.

## Projet
- **Cervus Patrimoine** — cabinet de gestion de patrimoine **indépendant** (CGP).
- Site **Next.js 14 (App Router) / TypeScript / Tailwind CSS**, déployé sur **Vercel** (deploys auto depuis `main`).
- Repo GitHub : **cervuscode/cervus-patrimoine**.
- Domaine de prod : **cervuspatrimoine.fr** (SANS tiret — ne jamais écrire `cervus-patrimoine.fr`).
- Email contact : `contact@cervuspatrimoine.fr`. ORIAS n° 25006770.

## Architecture (dossiers)
- `src/app/(site)/` — pages publiques avec Navbar + Footer (route group). Home = `(site)/page.tsx`. Pages légales : mentions-legales, politique-de-confidentialite, reclamations, conflits-d-interets, qui-sommes-nous, services, reserver.
- `src/app/simulateur-per/` — simulateur PER (HORS route group, layout minimal).
- `src/app/simulateur-assurance-vie/` — simulateur Assurance-vie (HORS route group, calqué sur le PER).
- `src/app/api/` — routes serveur (capture, CRM, PDF).
- `src/lib/` — moteurs de calcul + intégrations (`fiscal-engine.ts`, `av-engine.ts`, `pipedrive.ts`).
- `src/components/` — globaux (Navbar, Footer, AnimatedSection, ProfilCarousel, SchedulerPipedrive…).
- `public/` — assets (`/videos/hero-15s.mp4`, `/images/...`). Déposer images/vidéos ici.

## /reserver
Page hébergeant le **Pipedrive Scheduler** (iframe, `SchedulerPipedrive.tsx`). TOUS les CTA RDV pointent vers `/reserver`. Calendly a été entièrement retiré.

## Simulateur PER (existant, NE PAS CASSER)
- Parcours : `simulateur-per/components/SimulateurForm.tsx` orchestre 16 écrans `Q*.tsx` (Q0→Q15). État unique `SimulateurData` (`types.ts`), navigation conditionnelle.
- Moteur : `src/lib/fiscal-engine.ts` (parts, revenu imposable, TMI, projection PER, économie fiscale) — **validé, 35 tests** (`src/__tests__/fiscal-engine.test.ts`).
- Résultats : `ResultPage.tsx` (stats + AreaChart recharts + CTA `/reserver`).
- PDF : `src/app/api/submit/PdfDocument.tsx` (@react-pdf/renderer).

## Simulateur Assurance-vie (nouveau, front terminé)
- Moteur : `src/lib/av-engine.ts` — **VALIDÉ, 4 tests** (`src/lib/__tests__/av-engine.test.ts`). Capitalisation mensuelle, optimisation des plus-values (rachat partiel/abattement + réinvestissement), seuil **150 000 € apprécié sur les primes NETTES** (`base`), taux IR **7,5 %/12,8 %** au prorata, `gainNetCervus = capitalNetAvec − capitalNetSans`. Marge de déclenchement ×1,1, seuil de pertinence 250 € → `purgeUtile`. Expose `courbe` (trajectoires) + `debugAV()`.
- Parcours : `components/SimulateurFormAV.tsx` — **un seul écran de saisie groupée** (`QParametresAV` : versements, horizon 2–40 ans, profil, situation) puis capture (`QIdentiteAV`, `QEmailAV`, `QTelephoneAV`). Calcul live via `calculerAV`.
- Résultats : `components/ResultPageAV.tsx` — hero bronze foncé sur le chiffre clé, cartes capital, graphique en **valeur nette** (avec ≥ sans), CTA `/reserver`. Si `purgeUtile=false` → scénario unique + encadré transparence (jamais d'opposition "avec Cervus" trompeuse).
- ⚠️ **Capture CRM PAS encore branchée** (TODO étape 3) : `QEmailAV`/`QTelephoneAV` simulent l'OTP, `SimulateurFormAV.handleSubmit` n'appelle aucune route. TODO marqués en commentaire.

## Capture & CRM (routes API)
- `api/check-contact` — détecte un contact existant (Brevo) par email/téléphone. **Aujourd'hui mono-produit** → à rendre "par produit" (ne pas bloquer une simu AV pour un client PER).
- `api/send-otp` / `api/verify-otp` — Twilio Verify (SMS). Whitelist de numéros de test. À la validation OTP : migration listes Brevo (#6 sans OTP → #5).
- `api/early-contact` — fiche anticipée (avant OTP) : Brevo liste #6 + webhook Make `type=sans_otp` + Pipedrive (otpVerifie=false).
- `api/submit` — après OTP : Brevo liste #5 + PDF + webhook Make `type=otp_valide` + Pipedrive (otpVerifie=true).
- `api/mark-pending` — marque la simu en attente si l'utilisateur quitte avant l'OTP.

## Pipedrive (`src/lib/pipedrive.ts`)
- Clés de champs custom résolues dynamiquement par nom (pas de hash en dur), cache 10 min.
- Person upsert par email. **Deal** : `findOpenDealForPerson` cherche le deal ouvert le plus récent (AUJOURD'HUI tous produits confondus → à filtrer par produit). Champ **`Produit`** en dur `"PER"`. Routing pipeline selon OTP : `Leads`/`Tel Validé` (OTP) vs `Leads sans OTP`/`Simulation effectuée`.
- Person = champs communs (réutilisables AV) ; Deal = champs spécifiques produit.

## Brevo & Make
- Brevo = CRM/listes/attributs. Make = envoi des emails (variables du **payload webhook** au moment de l'envoi, PDF inline base64 — pas de `PDF_URL` stocké).
- Attributs Brevo : communs (nom, revenus, téléphone…) vs spécifiques produit (PER : capital projeté, économie fiscale…). À dédoubler pour l'AV.

## Conventions
- **Charte** : bronze `#795D48`, bronze foncé `#5D4738`, crème `#F2EDE8`, sombre `#0f0f0f`. Titres `font-cormorant`, corps `font-inter`. Boutons pilule `rounded-[50px]`. Cartes lisibles = fond crème + texte sombre (jamais petit texte sur fond sombre).
- **`noindex` ACTIF** dans `src/app/layout.tsx` (`robots: "noindex, nofollow"`) — **NE JAMAIS LE RETIRER** (site en pré-lancement).
- **Réglementaire (pré-COA)** : statut intermédiaire → ne pas recommander de produit précis ; simulations = "pédagogiques indicatives, non contractuelles". **Validation fiscale humaine requise avant mise en ligne** d'un moteur. **JAMAIS le mot "purge" côté client** (savoir-faire confidentiel) → utiliser "optimisation" / "Gain net avec Cervus Patrimoine".
- `AnimatedSection` : reveal au scroll (IntersectionObserver, rootMargin -12%, reduced-motion respecté).

## État d'avancement
**FAIT** : home complète (refonte premium, bandeaux image, sections Conseil/PER/AV/Dirigeants/Approche), bascule CTA → /reserver, nettoyage Calendly, simulateur PER en prod, moteur AV validé + parcours front + page résultats vendeur.
**RESTE — ÉTAPE 3 (câblage CRM AV "par produit")** :
1. `check-contact` par produit (ne bloque la simu AV que sur doublon AV, pas PER).
2. OTP réel branché dans le parcours AV (`QTelephoneAV` → send-otp/verify-otp).
3. `submit-av` (ou `submit` paramétré `produit`) → Brevo (attributs/listes AV), Make (`produit=AV`), Pipedrive.
4. `pipedrive.ts` : `syncToPipedrive(..., produit)` avec `findOpenDealForPerson` **filtré par Produit** + `Produit`/`Source` paramétrés + mapping deal AV. Person inchangée.
5. Ne PAS casser le PER. Côté Make/Brevo/Pipedrive : champs/listes/scénarios AV à créer (actions manuelles à signaler).

## Règles de travail
- **tsc + lint doivent passer** avant tout commit (`npx tsc --noEmit` + `npx next lint`).
- **Ne pas committer/pousser sans validation** de l'utilisateur (sauf demande explicite). Étapes moteur/fiscal = montrer les résultats d'abord.
- **Architecture "par produit"** pour scaler (PER, AV, puis PEA/CTO/SCPI…) : éviter le mono-produit en dur.
- **Un chantier à la fois.** Ne pas toucher au PER, à `/reserver`, aux pages légales, au `noindex`.
- Commits : messages clairs, terminés par la ligne `Co-Authored-By: Claude ...`.
