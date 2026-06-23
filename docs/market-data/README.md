# Données de marché — Lot 10 « Résilience des marchés »

Séries annuelles utilisées par le simulateur « Résilience des marchés »
(`src/lib/market-data.ts`). **Valeurs annuelles = point de décembre de chaque
année** (ou la valeur disponible la plus proche), normalisées pour la lisibilité
en RDV (un point par an).

## Fichiers de ce dossier

| Fichier | Contenu | Source |
|---|---|---|
| `msci-world-annual.csv` | MSCI World, valeur de décembre par an (1969→2025), base 10 000 en déc. 1969 | MSCI Inc. |
| `sp500-shiller-annual.csv` | S&P 500 (S&P Composite), prix nominal `P` de décembre par an (1969→2025) | Robert J. Shiller (Yale) |

> ⚠️ Les fichiers **bruts** (MSCI mensuel `chart.csv`, Shiller `ie_data.xls`) ne
> sont **pas** committés (trop lourds). Seuls les CSV dérivés annuels le sont.
> Le script `scripts/build-market-data.ts` régénère ces CSV à partir des bruts
> (à exécuter en local, voir ci-dessous).

## Sources primaires

- **S&P 500** — Robert J. Shiller, *Irrational Exuberance*, Yale University.
  Fichier `ie_data.xls`, feuille `Data`, colonne `P` (prix nominal mensuel).
  <http://www.econ.yale.edu/~shiller/data.htm>
- **MSCI World** — MSCI Inc. (indice net/gross selon export), base 10 000 en
  décembre 1969. Export mensuel `MM/YYYY,valeur`.
- **Livret A** — Banque de France (taux **moyen annuel** 1970→2026), codé en dur
  dans `market-data.ts`. Compilation : toutsurmesfinances.com.
- **Fonds euros (assurance-vie)** — France Assureurs (ex-FFSA) / ACPR, rendement
  moyen annuel net de frais de gestion. **Série fiable depuis 1994 uniquement**
  (avant, pas de série annuelle publique standardisée). Codé en dur.

## Régénération (local uniquement)

```bash
# Les fichiers bruts doivent être présents localement (ex. ~/Downloads).
npx --yes tsx scripts/build-market-data.ts
```

Le script lit les bruts, extrait la valeur de décembre par an et réécrit les CSV
dérivés de ce dossier (+ log des tableaux pour `market-data.ts`).

## Mention obligatoire (rendue sous chaque graphique)

> S&P 500 : Robert J. Shiller (Yale) · MSCI World : MSCI Inc. · Livret A : Banque
> de France · Fonds euros : France Assureurs — Données indicatives, performances
> passées ne préjugent pas des performances futures.

Récupération : juin 2026.
