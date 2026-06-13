# CLAUDE.md — Cervus Patrimoine

Contexte projet pour les sessions Claude. À lire en premier.

## Projet
- **Cervus Patrimoine** — cabinet de gestion de patrimoine **indépendant** (CGP).
- Site **Next.js 14 (App Router) / TypeScript / Tailwind CSS**, déployé sur **Vercel** (deploys auto depuis `main`).
- Repo GitHub : **cervuscode/cervus-patrimoine**.
- Domaine de prod : **cervuspatrimoine.fr** (SANS tiret — ne jamais écrire `cervus-patrimoine.fr`).
- Email contact : `contact@cervuspatrimoine.fr`. ORIAS n° 25006770.

## Architecture (dossiers)
- `src/app/(site)/` — pages publiques avec Navbar + Footer (route group). Home = `(site)/page.tsx`. Pages légales : mentions-legales, politique-de-confidentialite, reclamations, conflits-d-interets, qui-sommes-nous, services, reserver. Contient aussi `simulateur-interets-composes/` (outil SEO public, voir section dédiée).
- `src/app/simulateur-per/` — simulateur PER (HORS route group, layout minimal).
- `src/app/simulateur-assurance-vie/` — simulateur Assurance-vie (HORS route group, calqué sur le PER).
- `src/app/api/` — routes serveur (capture, CRM, PDF).
- `src/lib/` — moteurs de calcul + intégrations (`fiscal-engine.ts`, `av-engine.ts`, `interets-composes.ts`, `pipedrive.ts`).
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
- ✅ **Capture CRM AV branchée (étape 3 FAITE, committée `08c14d9`)** : `QEmailAV` → `check-contact {produit:"AV"}` ; `QTelephoneAV` → OTP réel (send-otp/verify-otp `produit:"AV"`) + mark-pending ; `SimulateurFormAV` → early-contact-av (écran tel) puis submit-av. Consentements ajoutés à `AVFormData`.
- ✅ **PDF AV FAIT** : `src/app/api/submit-av/PdfDocumentAV.tsx` (calqué sur `PdfDocument` PER, charte Cervus, scénario unique si `purgeUtile=false`, jamais le mot "purge", mention indicative/non contractuelle). Généré en base64 et joint au payload Make (`pdf` + `nom_fichier`) dans **submit-av ET early-contact-av**.

## Simulateur Intérêts composés (public, SEO — `/simulateur-interets-composes`)
- Outil **100 % public** : AUCUNE capture/OTP, AUCUNE route API, AUCUN Make/Brevo/Pipedrive, AUCUN PDF. Calcul live côté client.
- Page : `src/app/(site)/simulateur-interets-composes/page.tsx` (server component — metadata SEO "calcul intérêts composés", JSON-LD WebApplication + FAQPage, H1 unique, CTA, contenu éditorial H2/H3 ~750 mots, mention). Hérite du **noindex global** (aucune exception).
- Interactif : `SimulateurInteretsComposes.tsx` (client) — sliders avec **saisie manuelle au clic** sur la valeur ; fréquence mensuel/annuel ; inflation togglable ; imposition forfaitaire des gains (`Aucune`/`PFU 30 %`/`PS 17,2 %`, sur les GAINS seuls, **aucune enveloppe nommée**) ; graphique recharts aires empilées ; CTA principal → `/simulateur-per`, secondaire → `/reserver`.
- Sliders Capital initial & Versement : **échelle non-linéaire** (linéaire sur 75 % « zone de confort » 0→100 k€ / 0→2 k€, puis géométrique sur le dernier quart jusqu'à 5 M€ / 10 k€). Saisie manuelle exacte (clampée au max). Styles `.cervus-range` dans `globals.css`.
- Moteur : `src/lib/interets-composes.ts` — `calculerInteretsComposes()` pur, **6 tests** (`src/lib/__tests__/interets-composes.test.ts`). Capitalisation mensuelle au taux équivalent `(1+r)^(1/12)−1` ou annuelle, versements en fin de période, fiscalité sur gains, déflation inflation (€ constants). Conventions documentées en commentaire.

## Capture & CRM (routes API) — paramétrées "par produit" (défaut PER)
- `api/check-contact` — doublon détecté par **appartenance aux listes du produit** : `{email?, telephone?, produit?}`, défaut PER (#5/#6), AV (#11/#12). Un client PER peut faire une simu AV.
- `api/send-otp` / `api/verify-otp` — Twilio Verify (SMS). Whitelist de numéros de test. Migration listes Brevo paramétrée par produit : PER #6→#5, AV #11→#12 (`verify-otp` accepte `produit?`).
- `api/early-contact` (PER) / `api/early-contact-av` — fiche anticipée avant OTP : Brevo #6 (PER) / #11 (AV) + webhook Make `type=sans_otp` + Pipedrive (otpVerifie=false). **PER et AV avec PDF inline base64.**
- `api/submit` (PER) / `api/submit-av` — après OTP : Brevo #5 (PER) / #12 (AV) + webhook Make `type=otp_valide` + Pipedrive (otpVerifie=true). **PER et AV avec PDF inline base64.**
- `api/mark-pending` — marque la simu en attente si l'utilisateur quitte avant l'OTP (PER + AV).

## Pipedrive (`src/lib/pipedrive.ts`) — généralisé "par produit"
- Clés de champs custom résolues dynamiquement par nom (pas de hash en dur), cache 10 min.
- Cœur générique `syncProductToPipedrive` (param `produit` obligatoire) ; `syncToPipedrive` (wrapper PER : Produit "PER", Source "Simu-PER", titre "PER - …") et `syncAVToPipedrive` (Produit "AV", Source "Simu-AV", titre "AV - …", champs deal AV : Horizon, Capital net avec/sans, Gain net optimisé + réutilisés Versement initial/mensuel, Capital projeté).
- **Matching deal par PERSONNE + PRODUIT** (`findOpenDealForPersonAndProduct(personId, produit)`, produit OBLIGATOIRE) : filtre sur le champ texte **`Produit`** (comparaison trim+casse). On ne réutilise/déplace JAMAIS le deal d'un autre produit, on n'écrase JAMAIS son `Produit`. Une personne peut avoir un deal PER ouvert ET un deal AV ouvert simultanément. Les deux wrappers passent `produit` : `syncToPipedrive`→"PER", `syncAVToPipedrive`→"AV". Si aucun deal ouvert du produit (ou champ `Produit` introuvable) → création d'un nouveau deal.
- Routing pipeline selon OTP (commun PER/AV) : `Leads`/`Tel Validé` (OTP) vs `Leads sans OTP`/`Simulation effectuée`. Person = champs communs ; Deal = champs spécifiques produit.

## Brevo & Make
- Brevo = CRM/listes/attributs. Make = envoi des emails (variables du **payload webhook** au moment de l'envoi, PDF inline base64 — pas de `PDF_URL` stocké).
- Attributs Brevo : communs (PRENOM, NOM, TELEPHONE…) ; PER (capital projeté, économie fiscale…) ; **AV créés** (`AV_CAPITAL_BRUT`, `AV_CAPITAL_NET_SANS/AVEC`, `AV_GAIN_NET`, `AV_HORIZON`, `AV_VERSEMENT_INITIAL/MENSUEL`, `AV_PROFIL`, `AV_SITUATION`). Listes AV #11/#12 créées.
- **Webhooks Make SÉPARÉS** : PER = `MAKE_WEBHOOK_URL`, AV = `MAKE_WEBHOOK_URL_AV` (scénario dédié isolé). Payload AV : `{produit:"AV", type, email, prenom, nom, telephone (submit-av seul), pdf (base64), nom_fichier, capital_brut, capital_net_sans/avec, gain_net, horizon, versement_initial/mensuel, profil_investisseur, situation}`. **PDF inline base64 inclus** (`pdf` exclu des logs).

## Conventions
- **Charte** : bronze `#795D48`, bronze foncé `#5D4738`, crème `#F2EDE8`, sombre `#0f0f0f`. Titres `font-cormorant`, corps `font-inter`. Boutons pilule `rounded-[50px]`. Cartes lisibles = fond crème + texte sombre (jamais petit texte sur fond sombre).
- **`noindex` ACTIF** dans `src/app/layout.tsx` (`robots: "noindex, nofollow"`) — **NE JAMAIS LE RETIRER** (site en pré-lancement).
- **Réglementaire (pré-COA)** : statut intermédiaire → ne pas recommander de produit précis ; simulations = "pédagogiques indicatives, non contractuelles". **Validation fiscale humaine requise avant mise en ligne** d'un moteur. **JAMAIS le mot "purge" côté client** (savoir-faire confidentiel) → utiliser "optimisation" / "Gain net avec Cervus Patrimoine".
- `AnimatedSection` : reveal au scroll (IntersectionObserver, rootMargin -12%, reduced-motion respecté).

## État d'avancement
**FAIT** : home complète, CTA → /reserver, simulateur PER en prod, moteur AV validé + parcours front + page résultats, câblage CRM AV "par produit" (`08c14d9`), **PDF AV** (`PdfDocumentAV` + branchement submit-av/early-contact-av), **simulateur public Intérêts composés** (SEO, lien navbar ajouté). Côté Brevo (listes #11/#12 + attributs AV_*) et Pipedrive (champ Produit "AV", champs deal AV) : créés.
**RESTE (actions hors-repo, finition AV)** :
1. **Template email AV** dans Brevo/Make.
2. **Cloner les 2 scénarios Make AV** (envoi immédiat + rattrapage 15 min) branchés sur `MAKE_WEBHOOK_URL_AV`, exploitant le PDF inline désormais envoyé.
3. **Renseigner `MAKE_WEBHOOK_URL_AV` dans Vercel** (sinon webhook AV no-op).

## Règles de travail
- **tsc + lint doivent passer** avant tout commit (`npx tsc --noEmit` + `npx next lint`).
- **Ne pas committer/pousser sans validation** de l'utilisateur (sauf demande explicite). Étapes moteur/fiscal = montrer les résultats d'abord.
- **Architecture "par produit"** pour scaler (PER, AV, puis PEA/CTO/SCPI…) : éviter le mono-produit en dur.
- **Un chantier à la fois.** Ne pas toucher au PER, à `/reserver`, aux pages légales, au `noindex`.
- Commits : messages clairs, terminés par la ligne `Co-Authored-By: Claude ...`.
