# Sources officielles DGFiP — Calculette IR (référence de vérité fiscale)

Ce dossier contient le **code source officiel du moteur de calcul de l'impôt sur le
revenu de la DGFiP** (langage M / MLANG), utilisé comme **référence de vérité** pour les
règles fiscales implémentées dans le moteur Cervus (`src/lib/fiscal-engine.ts`,
`src/lib/contributions-hauts-revenus.ts`, plafond PER, etc.).

## Provenance

- **Dépôt officiel** : <https://gitlab.adullact.net/dgfip/impots-nationaux-revenu-patrimoine-particuliers/calculette-ir>
- **Millésime utilisé** : `sources2024m_3_13` — moteur de **calcul de l'IR 2025 au titre
  des revenus perçus en 2024** (cf. en-tête de chaque fichier `.m`).
- **Licence** : **CeCILL 2.1** (logiciel libre, droit français — voir fichier `LICENCE`).
  Copyright DGFiP. Le fait d'accéder à ces fichiers vaut acceptation de la licence.

## Fichiers clés exploités

| Fichier | Contenu |
|---|---|
| `chap-thr.m` | CEHR (règle 80000) **et** CDHR (règles 80050-80090) — formules + commentaires |
| `chap-perp.m` | Plafond de déductibilité épargne retraite / PER (règle 31015) |
| `tgvI.m` | Définition des constantes (`const=…`) : seuils, taux, plafonds |

Constantes vérifiées et reprises dans le code Cervus :

- **CEHR** : `LIMHR1=250000`, `LIMHR2=500000`, `TXHR1=3 %`, `TXHR2=4 %` (seuils ×2 couple).
- **CDHR** : `TX20=20 %`, `LIM_DHRCDV=330000` (décote), `TX825=82,5 %`,
  `MAJCOUPDHR=12500`, `MAJPERSDHR=1500`. NB : dans le moteur du rôle, la CDHR est codée
  mais **neutralisée (× 0)** pour ce millésime (recouvrement par acompte séparé) ; la
  formule canonique figure en commentaires de `chap-thr.m`.
- **Plafond PER** : `TX_PERPPLAF=10 %`, `LIM_PERPMIN=4637`, `LIM_PERPMAX=37094`
  (valeurs PASS 2024 = 46 368 €).

## ⚠️ Mise à jour des paramètres 2026 dans le moteur Cervus

Les sources ci-dessus sont le **millésime revenus 2024**. Les paramètres numériques
utilisés par le moteur Cervus (qui cible le **barème 2026 / revenus 2025**) ont été
**mis à jour manuellement** depuis les sources officielles les plus récentes :

- **Barème IR 2026** (tranches, décote, plafond QF) : voir `src/lib/fiscal-engine.ts`.
- **PASS 2025 = 47 100 €** → plancher PER **4 710 €**, plafond **37 680 €**
  (voir `src/lib/per-quick.ts`). Les valeurs DGFiP ci-dessus (4 637 / 37 094) sont
  basées sur le PASS 2024 et servent de contrôle de cohérence de la **structure** du calcul.
- **CEHR / CDHR** : seuils, taux et majorations **reconduits par la LF 2026** (inchangés
  vs les constantes ci-dessus) — voir `src/lib/contributions-hauts-revenus.ts`.

Pour mettre à jour un nouveau millésime : récupérer la version correspondante depuis le
dépôt officiel, vérifier les constantes dans `tgvI.m`, et ajuster les paramètres Cervus.
