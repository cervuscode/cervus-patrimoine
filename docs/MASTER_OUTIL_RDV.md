# Master Doc — Outil RDV Conseiller (Espace Partenaire Cervus)

> **Document de cadrage autoportant — Cervus Patrimoine**
> Auteur : Auguste Dechery · ORIAS 25006770 · SIREN 944 972 553
> Statut : cadrage v2 validé, Lot 0 en cours
> À committer dans `/docs/MASTER_OUTIL_RDV.md` du repo `cervuscode/cervus-patrimoine`
> Lisible sans contexte préalable.
> **v2 (19 juin 2026)** — révisions : séparation Simulation/Découverte RDV (jamais d'écrasement), code client auto-incrémenté, précision Lot 13 (3 pièces, formulaire Next.js natif), confirmation Supabase Storage + checklist RLS.

---

## 0. Résumé en une page

L'outil RDV Conseiller est un **espace web authentifié, interne au cabinet**, hébergé sur le sous-domaine `app.cervuspatrimoine.fr`, qui sert de **poste de pilotage pendant les rendez-vous clients**. C'est ce qui fait la différence entre Cervus et un simple vendeur de PER : il donne au client l'impression d'une vraie valeur ajoutée, avec des simulations personnalisées en direct et des livrables imprimables (PDF).

**L'idée maîtresse (l'invariant) :** une **vue client unique** alimente automatiquement tous les outils du RDV. On saisit/corrige une donnée une seule fois, et tous les simulateurs s'en servent. On ne ressaisit jamais — mais on n'écrase jamais non plus une donnée de simulation : voir §4.1.

**Décision d'architecture centrale :** **Pipedrive est l'unique source de vérité.** L'outil lit les infos de simulation déjà capturées dans Pipedrive, Auguste les enrichit pendant le RDV (dans des champs séparés, jamais en écrasant), et tout ressort en **note sur le deal**. Pas de base de données dédiée pour la partie RDV → moins de surface d'attaque, moins de coût, moins de contraintes RGPD. (Une base type Supabase n'intervient qu'au tout dernier module : le KYC/pièces jointes, §8.)

**Confidentialité à l'écran :** chaque client est identifié par un **code client court** (ex. `C-0042`), jamais par son nom en clair sur les écrans partagés — voir §4.2.

---

## 1. Objectif & raison d'être

Matérialiser la valeur ajoutée Cervus pendant les RDV, via :
- un accès rapide à une **fiche client vivante** (lue depuis Pipedrive) ;
- des **simulateurs personnalisés** qui se préremplissent depuis cette fiche ;
- des **livrables imprimables** (PDF) remis au client.

Positionnement de marque à refléter partout : **indépendance & transparence**, ton pédagogique.

---

## 2. Structure des rendez-vous (le contexte métier)

| RDV | Durée | Canal | Contenu | Rôle de l'outil |
|-----|-------|-------|---------|-----------------|
| **R1** | 30 min | Téléphone | Bilan patrimonial (surtout les questions) + explication du PER | **Prise de notes structurée** → enrichit la fiche (champs « Découverte RDV ») |
| **R2** | 45 min | Visio | Rendu du bilan, mode de gestion, projection, proposition PER (modes de gestion, historique de perf, options type garantie décès, rôle du cabinet, espace en ligne, frais) + liste des pièces nécessaires | **Reprise + enrichissement** de la fiche, simulateurs personnalisés, partage d'écran, impression PDF |
| **R3** | — | — | Relecture des docs + signature | Hors périmètre de la prise de RDV elle-même. Déclenche l'envoi du **lien KYC sécurisé** (§8) |

---

## 3. Architecture (décisions actées)

### 3.1 — Flux de données : Pipedrive de bout en bout
1. L'outil **lit Pipedrive** (Person + Deal) → récupère les infos de simulation déjà capturées par le site public, **et** les infos de découverte RDV si une fiche a déjà été enrichie lors d'un RDV précédent.
2. Auguste **enrichit / corrige** ces infos pendant le RDV, dans l'outil, dans les champs « Découverte RDV » dédiés — **jamais dans les champs « Simulation »**, qui restent un instantané figé de ce que le client a déclaré seul sur le site public (voir §4.1).
3. En sortie, tout **ressort en NOTE sur le Deal** (réutilise `lib/pipedrive.ts` existant).
4. **Aucune donnée client persistée hors Pipedrive** (à l'exception, plus tard, des tokens et fichiers du module KYC — voir §8, qui vit dans Supabase et reste isolé). L'outil est un poste de travail temporaire, pas un système de stockage.

**Règle de priorité des données :** Pipedrive est la source au **chargement** de la fiche (snapshot initial), qui combine Simulation + Découverte RDV existante. Dès qu'Auguste touche un champ « Découverte RDV » en séance, **l'état local de la session fait foi** pour les simulateurs ; à la fin, on resynchronise vers Pipedrive (note + champs clés « Découverte RDV »). Pas de double source qui se contredit côté simulateurs internes — voir la règle de lecture en §4.1.

### 3.2 — Authentification : Google OAuth restreint au domaine
- **NextAuth + Google OAuth**, restriction stricte au domaine Workspace `cervuspatrimoine.fr` (paramètre `hd`, **revérifié côté serveur** sur le domaine de l'email retourné — ne jamais faire confiance au seul paramètre `hd`, falsifiable côté client).
- Accès employés Cervus uniquement (Auguste, puis Sandro quand il sera réglementairement actif — la restriction de domaine couvre déjà son compte Workspace sans reconfiguration future). **Aucun mot de passe stocké côté Cervus** → surface d'attaque crédentielle déléguée à Google.
- **Pas d'espace client public** (écarté : faible valeur, risque RGPD).

### 3.3 — Hébergement : sur le même repo, sous-domaine dédié
- Repo Next.js existant `cervuscode/cervus-patrimoine`, **même projet Vercel**.
- Sous-domaine dédié `app.cervuspatrimoine.fr`, routé par **middleware Next.js selon le hostname** vers un groupe de routes dédié (ex. `/app/(conseiller)/...`). Le site public sur `cervuspatrimoine.fr` ne doit subir aucune régression.
- DNS géré via Squarespace Domains (ex-Google Domains, racheté en 2023).
- `noindex` maintenu sur tout l'espace conseiller, comme sur le reste du site.

### 3.4 — Moteur fiscal : réutilisation, jamais modification
- L'outil **importe `src/lib/fiscal-engine.ts` tel quel**. Fichier HIGH-RISK : on le **consomme**, on ne le touche jamais. Même moteur que le site public → zéro divergence de calcul.

---

## 4. La vue client (cœur de l'invariant)

Lue depuis Pipedrive, éditable en RDV, renvoyée en note.

### 4.1 — Simulation vs Découverte RDV : deux groupes de champs, jamais de fusion par écrasement

**Décision actée :** pour tout champ qui peut exister à la fois côté simulation publique et côté RDV (ex. revenu imposable, situation familiale, épargne existante), on maintient **deux champs Pipedrive distincts**, jamais un seul champ écrasé :

- Groupe **« Simulation »** (déjà existant côté site public) : ce que le client a déclaré seul, en ligne. Reste un instantané figé, jamais modifié par l'outil RDV.
- Groupe **« Découverte RDV »** (nouveau) : ce qu'Auguste a confirmé, corrigé ou complété en RDV (R1 puis R2). Peut diverger de la Simulation — c'est attendu et utile (ex. le client avait mal estimé son revenu net imposable dans le simulateur).

**Pourquoi cette séparation plutôt qu'un écrasement :**
- Traçabilité complète : on garde un historique de l'écart entre ce que le prospect a déclaré seul et ce qu'Auguste a établi avec lui — utile commercialement (mesurer la fiabilité de l'auto-déclaration) et en cas de contrôle.
- Aucun risque de perte de donnée si une correction RDV s'avère elle-même erronée.

**Règle de priorité de lecture pour les simulateurs internes (Lot 2+) :** si un champ « Découverte RDV » existe et est renseigné, il est utilisé en priorité par les simulateurs de l'outil RDV. Sinon, fallback sur le champ « Simulation ». Cette règle de priorité est gérée dans le code de l'outil RDV, jamais en écrasant la donnée source dans Pipedrive.

**Implémentation Pipedrive :** nouveau groupe de champs Deal et/ou Person « Découverte RDV », miroir du groupe « Simulation » existant pour les champs concernés, créé au Lot 1.

### 4.2 — Code client (confidentialité à l'écran)

Pour permettre à Auguste de **partager son écran sans afficher le nom du client en clair**, chaque fiche se voit attribuer un **code client court**, format `C-0042`, affiché en lieu et place du nom sur les vues partageables de l'outil.

- **Génération : auto-incrémentée par l'outil**, à la création de la fiche (premier RDV / première ouverture dans l'outil). Logique technique exacte (compteur dédié vs scan du max existant via API Pipedrive) à trancher au Lot 1.
- Stocké comme champ Person ou Deal dans Pipedrive (à trancher au Lot 1 selon le rattachement le plus naturel).
- Sur la fiche Pipedrive elle-même (back-office, jamais partagée à l'écran client), Auguste voit le code ET le nom — la correspondance reste consultable à tout moment côté Pipedrive.

### 4.3 — Champs de la vue client

**Identité :** prénom, nom, âge / année de naissance, **code client**
**Situation :** statut marital, parts fiscales, enfants, garde
**Professionnel :** profession, statut (salarié / TNS / dirigeant)
**Revenus :** revenu imposable, foncier / BNC / BIC
**Profil investisseur**
**Épargne existante :** versements PER, AV, autre épargne, immobilier
**Notes libres R1**

→ Chacun des champs ci-dessus (hors identité/code) existe potentiellement en double : Simulation / Découverte RDV, selon la règle du §4.1.

### Panneau persistant (« petite tête » toujours à l'écran)
Un panneau ouvrable à tout moment **par-dessus n'importe quelle app**, affichant le **code client** et permettant de **corriger les champs « Découverte RDV »** en direct. Toute modification se **propage instantanément** aux simulateurs ouverts (selon la règle de priorité §4.1).

### Propagation (qui consomme quoi)
| App / outil | Données consommées depuis la fiche |
|-------------|-------------------------------------|
| Simulateur PER | revenu, parts, TMI calculée, versements (Découverte RDV en priorité, sinon Simulation) |
| Simulateur AV | revenu, profil, horizon |
| Comparateur AV vs PER | fiche complète (TMI déterminante) |
| Pyramide de l'épargne + répartition | épargne existante, immobilier |
| Plafonds de versement (individuel + TNS) | statut professionnel |
| Simulateur d'impôt | parts + revenus (via `fiscal-engine.ts`) |

---

## 5. Les outils internes (les « petites apps »)

Accessibles **individuellement** depuis l'espace conseiller (usage rapide en RDV), et préremplis par la fiche quand un client est ouvert.

- **Recherche / création client**
  - Bouton « chercher un client » : **champ libre**, PAS de liste déroulante (sécurité partage d'écran). Recherche par nom (back-office) ou par code client.
  - Bouton « créer un client » → page de recueil d'infos (R1), génère le code client.
- **Simulateur PER en RDV** — choix profil / durée / fiscalité à la sortie. **3 sorties :**
  1. Capital final intégral (hypothèse : tout sort sur la même tranche, celle sélectionnée)
  2. Capital fractionné sur 20 ans, le non-sorti restant placé en fonds euro à **2 %**
  3. Montant de la rente (à côté, en comparaison)
- **Simulateur d'impôt** — simple interface au-dessus de `fiscal-engine.ts`. **ZÉRO ajout au moteur** (il calcule déjà l'IR ; on ne fait que l'exposer).
- **Illustration du mécanisme de réduction d'impôt** — colonnes par tranche selon les parts (ex. 60 k€ de revenu, 6 k€ de versement) → le client voit l'effet de ses versements.
- **Comparateur AV vs PER** — double usage : mettre en avant le PER (effet de levier) OU décourager les TMI à 11 % (fiscalité plus-value AV + souplesse).
- **Plafonds de versement** — individuel + TNS (affichage conditionnel au statut).
- **Résilience des marchés** — MSCI World depuis 1970 + S&P 500 longue période. **Data déjà fournie par Auguste.**
- **Pyramide de l'épargne + répartition** — situe l'épargne, **valorise l'immobilier**.

---

## 6. Livrables

- **Impression PDF** de chaque simulation personnalisée (réutiliser la logique PDF existante du site).
- **Présentations web paramétrées** (remplacent le PowerPoint) — template web éditable peuplé par la fiche, plutôt qu'un fichier PPTX généré en code (qui perdrait l'éditabilité). **Sous-chantier séparé, reporté** (Lot 12).

---

## 7. Future-proof — ce qui reste à brancher plus tard

L'architecture doit accueillir sans refonte :
- **REB + questionnaire KYC LCB-FT** remplis par le client (formulaire, contenu réglementaire exact à finaliser plus tard — voir §8) ;
- **Dépôt de pièces jointes** (pièce d'identité, RIB, justificatif de domicile — 3 pièces ; avis d'imposition **exclu du périmètre actuel**).

→ Voir §8 pour le module complet. **Le mécanisme (lien sécurisé, formulaire, dépôt fichiers) est construit au Lot 13, dans l'ordre normal des lots — après les simulateurs (Lots 4-10).** Seul le **contenu réglementaire exact** des questions KYC/REB est volontairement reporté à plus tard (finalisé séparément, sans bloquer la construction du mécanisme). Activation effective au passage COA/CIF et aux premières souscriptions.

---

## 8. Module KYC / REB / LCB-FT + pièces jointes (Lot 13, dernier lot du socle RDV)

> **Pas d'espace client permanent.** À la mise en place du contrat (R3), Auguste génère un **lien unique sécurisé** envoyé au client.

### 8.1 — Flux
- **Lien à usage unique**, jeton aléatoire imprévisible, à durée de vie courte (mêmes mécanismes qu'un lien bancaire de réinitialisation). Lié à un seul client/deal. Expire après usage ou X jours.
- Le client ouvre → remplit le **formulaire KYC/REB/LCB-FT codé en Next.js natif** (pas d'outil tiers type Typeform — voir §8.3) → dépose ses **3 pièces** (identité, RIB, justificatif de domicile) → classement.
- À la soumission : écriture des réponses formatées en note structurée sur le Deal Pipedrive (réutilise `lib/pipedrive.ts`) + le token est marqué « utilisé », expire immédiatement.

### 8.2 — Stockage : Supabase Storage (confirmé)

**Décision actée après comparatif (Supabase vs Google Drive vs S3 vs Typeform) :** Supabase Storage, **bucket dédié et isolé** du reste du système (notamment isolé du Google Drive existant qui sert au stockage des PDF marketing — pas de mélange d'usages).

**Pourquoi Supabase plutôt que Google Drive :**
- Lien à usage unique avec token imprévisible et expiration : mécanisme natif côté table Postgres Supabase. Google Drive n'a pas d'équivalent natif — il faudrait bricoler la même couche de sécurité applicative par-dessus l'API Drive, pour un bénéfice nul et un point de défaillance supplémentaire.
- RLS (Row Level Security) : la policy d'accès est écrite dans la base, auditable en une requête, plutôt qu'éclatée entre code applicatif et permissions Drive.
- Hébergement UE garanti explicitement (région à choisir au provisioning), plus simple à démontrer en cas de contrôle CNIL que la zone de stockage Workspace.
- Coût négligeable (gratuit jusqu'à 1 Go, puis ~0,021 $/Go).

**Pourquoi pas Typeform pour le formulaire :**
- Hébergement hors UE / conformité non garantie pour ce type de données.
- Pas de mécanisme de lien à usage unique natif (même limite que Drive).
- Pont supplémentaire nécessaire pour rapatrier les réponses vers Pipedrive (webhook/Make) — alors qu'un formulaire Next.js natif écrit directement où on veut, sans étape intermédiaire fragile.
- Coût d'abonnement récurrent pour un outil généraliste, alors que le besoin est très spécifique.
- Cohérence de marque : formulaire sur le propre nom de domaine, même charte, pas de logo tiers qui casse la confiance indépendance/transparence.

**Limite assumée du formulaire natif :** pas d'éditeur drag-and-drop — modifier une question nécessite un commit Claude Code, pas une édition no-code. Cohérent avec la méthode de travail actuelle (Auguste pilote déjà tout via prompts).

### 8.3 — ⚠️ Checklist sécurité RLS (point d'attention cyber n°1, à appliquer explicitement au Lot 13)
- Bucket **privé par défaut** — jamais de bucket/listing public.
- Policy RLS qui vérifie le token avant tout accès en lecture ou écriture — pas d'accès anonyme non vérifié.
- Expiration forcée du token (usage unique OU durée de vie courte, le premier des deux déclencheurs qui survient).
- Aucune URL signée à durée de vie longue ou réutilisable après usage.
- Le prompt Claude Code du Lot 13 doit contenir cette checklist explicitement, pas une instruction vague type « configure Supabase ».

### 8.4 — Structure des blocs (contenu à finaliser plus tard)
Modeler la structure sur Eilau : Identité / Revenus & Fiscalité / Patrimoine / Profil investisseur (MIF) / Conformité LCB-FT / Détails affaire. **Le mécanisme (formulaire, dépôt, stockage, écriture Pipedrive) est construit maintenant dans l'ordre des lots ; le contenu exact des questions de chaque bloc est rédigé séparément, sans bloquer le Lot 13.**

---

## 9. Découpage en lots (un chantier à la fois)

> Le socle (auth + fiche + propagation) doit exister avant toute app, car chaque app lit la fiche. Une fois les lots 0-3 posés, les simulateurs sont indépendants → ordre libre selon priorité commerciale. Le Lot 13 reste en dernier dans l'ordre normal (après les simulateurs), conformément à la décision actée — seul le contenu réglementaire du KYC est reporté, pas le mécanisme. Chaque lot = commit + validation screenshot avant le suivant. Fenêtre Claude Code neuve par lot.

| Lot | Contenu | Dépend de | Validation |
|-----|---------|-----------|------------|
| **0** | Socle : auth Google (`hd` + vérif serveur), sous-domaine `app.cervuspatrimoine.fr`, coquille, `noindex` | — | Connexion compte Workspace OK ; compte externe refusé |
| **1** | Lecture Pipedrive + vue client (Simulation + Découverte RDV) + recherche par nom/code + génération code client + **panneau persistant** | 0 | Ouvrir un client → infos préremplies → corriger un champ Découverte RDV dans le panneau → Simulation inchangée |
| **2** | Intégration `fiscal-engine.ts` (consommation seule) + propagation (état partagé TMI/revenu/parts, règle de priorité Découverte RDV > Simulation) | 1 | Fiche remplie → bonne TMI/impôt (croiser un cas du tableau fiscal 2026) |
| **3** | Écriture de la note enrichie → Deal Pipedrive (matching personne + Produit, champs Découverte RDV) | 1-2 | Enrichir une fiche → note sur le bon deal, Simulation non écrasée |
| **4** | Simulateur d'impôt (le plus simple, sur `fiscal-engine.ts`) | 2 | Croiser plusieurs cas du tableau fiscal 2026 |
| **5** | Simulateur PER en RDV (3 sorties) | 2 | Ouvrir une fiche → PER prérempli → 3 sorties correctes |
| **6** | Illustration réduction d'impôt (colonnes par tranche) | 2 | Cas 60k / 6k → tranches et effet corrects |
| **7** | Comparateur AV vs PER | 2 | TMI 30 % → PER avantagé ; TMI 11 % → AV avantagée |
| **8** | Plafonds de versement (individuel + TNS) | 1-2 | Salarié → individuel ; TNS → plafond TNS en plus |
| **9** | Pyramide de l'épargne + répartition | 1 | Fiche renseignée → pyramide cohérente |
| **10** | Résilience des marchés (MSCI/S&P, data fournie) | 0 | Graphique lisible, partageable |
| **11** | Impression PDF des livrables | 4+ | PDF propre, charté, imprimable |
| **12** | Présentations web paramétrées (ex-PowerPoint) | socle | À cadrer séparément |
| **13** | KYC/REB/LCB-FT (3 pièces) + coffre fichiers via lien sécurisé (Supabase Storage, RLS, formulaire Next.js natif) | socle + COA/CIF pour activation | À cadrer en détail au démarrage du lot, revue conformité dédiée, checklist RLS §8.3 obligatoire |
| **14** | Bilan Patrimonial Automatisé (voir §14) — synthèse + IFI + succession/DMTG + plus-value immo + projection retraite + flux financiers, livrable PDF multi-pages | socle + plusieurs nouveaux moteurs de calcul | À cadrer en détail au démarrage du lot — chantier de l'ampleur d'un nouveau fiscal-engine.ts, pas un simulateur unitaire |

> **Onglet "Autres simulateurs" :** au fur et à mesure que de nouveaux simulateurs sont identifiés comme pistes futures (au-delà des Lots 4-10 déjà cadrés) — ex. inspirés d'outils concurrents repérés en veille — ils sont listés dans un onglet dédié "Autres simulateurs" du `CLAUDE.md`, pas immédiatement ajoutés au tableau des lots ci-dessus. Ils ne deviennent un lot numéroté qu'une fois explicitement priorisés par Auguste. Voir §14 pour le premier exemple (Bilan Patrimonial Automatisé).

---

## 10. Méthode de travail (à respecter pour être utile)

- **Auguste ne code pas.** Fournir des **prompts Claude Code complets et prêts à coller** — jamais de snippets partiels ni de recherche-remplacement à assembler à la main.
- **Sprints itératifs**, validation par **screenshot** à chaque palier. Confirmer chaque étape avant la suivante.
- **Anticipation aval :** un changement (nouvelle question / nouvel output) impose souvent de mettre à jour plusieurs couches en même temps (champs Pipedrive, propagation, simulateurs). Ne jamais modifier une couche en isolation.
- **Optimisation coût Claude Code :** fenêtre neuve à chaque commit ; demander **explicitement** la mise à jour de `CLAUDE.md` ; toujours commit/push avant de fermer une fenêtre.
- **Un chantier à la fois.**

---

## 11. Sécurité connexe — routes API du site public (à traiter avant de lever le noindex)

Indépendant de l'outil RDV mais soulevé dans la même réflexion cyber :
- Les routes `/api/*` sont publiquement accessibles par nature. `/api/early-contact` (sans OTP) est ouverte → un bot pourrait injecter de faux leads.
- À ajouter **avant déréférencement + Google Ads** : rate-limiting, validation stricte des entrées, honeypot anti-bot.
- Pas urgent tant que le site est en `noindex`. **Bloquant avant la levée du noindex.** Audit des routes réelles à planifier (nécessite lecture du code).

---

## 12. Hors périmètre (confirmé)

- Espace **client public** (écarté : faible valeur, risque RGPD).
- Souscription / génération de contrat en ligne (R3 = signature).
- Modification de `fiscal-engine.ts` (consommation seule).
- Avis d'imposition dans le dépôt de pièces du Lot 13 (3 pièces seulement : identité, RIB, justificatif de domicile).
- Outil tiers type Typeform pour le formulaire KYC (formulaire Next.js natif retenu).

---

---

## 13. Les invariants à ne jamais oublier

1. **Pipedrive = source de vérité** pour le RDV. Pas de base dédiée avant le Lot 13 (KYC, où Supabase intervient en complément isolé, jamais en remplacement).
2. **Fiche unique** qui pilote tous les simulateurs. On ne ressaisit jamais — et on n'écrase jamais un champ Simulation par une correction RDV : deux champs séparés (§4.1), règle de priorité de lecture côté code uniquement.
3. **`fiscal-engine.ts` est HIGH-RISK** : consommation seule, jamais de modification. Relancer toute la suite de tests si le périmètre fiscal est touché.
4. **Auth = Google OAuth restreint au domaine `cervuspatrimoine.fr`**, avec vérification serveur du domaine de l'email (pas seulement le paramètre `hd`). Aucun mot de passe stocké.
5. **Pas de liste déroulante de clients** (recherche par champ libre) — sécurité partage d'écran. **Code client (`C-0042`) affiché à l'écran, jamais le nom en clair**, sur les vues partageables.
6. **`noindex` maintenu** sur tout l'espace, y compris `app.cervuspatrimoine.fr`.
7. **Charte :** bronze `#795D48`, bronze foncé `#5D4738`, crème `#F2EDE8`, sombre `#0f0f0f` ; Cormorant (titres) / Inter (corps) ; boutons pilule.
8. **Supabase uniquement au Lot 13** (KYC/fichiers via lien sécurisé), bucket isolé du Drive existant, hébergement UE, RLS stricte (checklist §8.3 obligatoire).
9. **Auguste ne code pas :** prompts Claude Code complets, prêts à coller.

---

## 14. Idée future — Bilan Patrimonial Automatisé (Lot 14, non cadré en détail)

> Repéré en veille concurrentielle (outil "Majors", juin 2026) — référence de niveau à viser, pas un cahier des charges figé. Volontairement non priorisé maintenant ; à cadrer en détail le jour où ce lot est lancé.

**Constat sur la faisabilité (analyse du 20 juin 2026) :** la quasi-totalité de la valeur de ce type de bilan est du **calcul déterministe**, pas de la génération IA — exactement la même philosophie que `fiscal-engine.ts` :

- **Calcul pur (sans IA), réutilisant/étendant les moteurs existants ou à créer sur le même modèle :**
  - Synthèse patrimoniale (actif net, répartition par classe d'actifs) — agrégation des données saisies
  - IFI (barème + plafonnement art. 979) — nouveau moteur isolé, même rigueur que le moteur IR (tests croisés DGFiP/BOFiP)
  - Plus-value immobilière (abattements durée de détention)
  - Succession/DMTG (barèmes par lien de parenté, abattements)
  - Projection retraite (capital projeté, méthode des 4 %)
  - Flux financiers (revenus/charges/capacité d'épargne)
  - Scores composites (diversification, préparation succession) — formule pondérée à définir et valider, pas de l'IA

- **Ce qui nécessiterait un vrai chantier de règles métier (PAS de génération IA libre, pour les mêmes raisons de fiabilité/responsabilité que le reste de l'outil) :**
  - Les paragraphes de "lecture experte" : à remplacer par une **bibliothèque de templates de phrases conditionnelles** écrits à l'avance (ex. "si concentration immobilière > X% alors phrase Y"), déterministes et auditables — pas de génération libre dans un document à enjeu réglementaire (cabinet engageant sa responsabilité, art. L.541-8-1 CMF)
  - Les références légales citées : codées en dur par condition détectée (ex. "si IFI > seuil → afficher art. 974 CGI"), pas de RAG — largement suffisant pour un usage interne à cas limités

**Pourquoi reporté :** ampleur comparable à la création de plusieurs nouveaux `fiscal-engine.ts` (IFI, succession, plus-value immo) + une bibliothèque de templates de recommandations + un formulaire de collecte complet (identité, patrimoine ligne à ligne, flux) + un module PDF multi-pages bien plus riche que les PDF actuels. Net dépassement du périmètre d'un simulateur unitaire (Lots 4-10).

**Quand ce lot sera lancé :** cadrage dédié nécessaire (quels moteurs en premier, quelle structure de formulaire de collecte, quelle bibliothèque de templates, quel format PDF).

---
