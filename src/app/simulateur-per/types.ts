export type Statut = 'celibataire' | 'divorce' | 'marie' | 'pacse' | 'parent_isole';
export type AbattementSalaires = 'forfait10' | 'fraisReels';
export type Profil = 'prudent' | 'equilibre' | 'dynamique';
export type Objectif = 'reduire_impots' | 'preparer_retraite' | 'dynamiser_epargne';
export type StatutPro = 'salarie' | 'fonctionnaire' | 'independant' | 'liberal';
export type SimStep = 1 | 2 | 3 | 4 | 'result';

export interface SimulateurData {
  // Étape 1 — Situation
  statut: Statut | '';
  nbEnfants: number;
  gardeParentale: boolean | null; // true = parent isolé (case T), null = non applicable

  // Étape 2 — Revenus
  salaireMensuel: string;          // mensuel saisi, × 12 dans compute()
  abattementSalaires: AbattementSalaires;
  fraisReels: string;
  revenusConjoint: string;         // mensuel net du conjoint (marié/pacsé), × 12
  autresRevenus: boolean | null;   // null = pas encore répondu
  bnc: string;
  bic: string;
  foncier: string;

  // Étape 3 — Projet
  anneeNaissance: string;
  ageRetraite: string;             // défaut '64'
  versementInitial: string;        // apport unique, 0 par défaut
  versementMensuel: string;
  profil: Profil;

  // Étape 4 — Objectif & statut pro
  objectif: Objectif | '';
  statutPro: StatutPro | '';

  // Étape 4 — Coordonnées
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  otpCode: string;
  otpSent: boolean;
  otpVerified: boolean;
  consentementRdv: boolean;
  consentementRgpd: boolean;
}

export interface ComputedResults {
  partsBase: number;
  partsTotal: number;
  revenuImposable: number;
  tmi: number;
  nAnnees: number;
  ageRetraiteNum: number;
  tauxAnnuel: number;
  capitalFinal: number;
  courbe: Array<{ annee: number; capital: number }>;
  economieFiscale: number;
  versementAnnuel: number;
  // Fiscalité PER détaillée
  impotAvant: number;      // impôt IR annuel avant PER
  impotApres: number;      // impôt IR annuel après déduction PER
  pasMensAvant: number;    // prélèvement à la source mensuel avant PER
  pasMensApres: number;    // prélèvement à la source mensuel après PER
  economieMensuelle: number; // coût réel mensuel du versement (versement - économie/12)
}

export const INITIAL_DATA: SimulateurData = {
  statut: '',
  nbEnfants: 0,
  gardeParentale: null,
  salaireMensuel: '',
  abattementSalaires: 'forfait10',
  fraisReels: '',
  revenusConjoint: '',
  autresRevenus: null,
  bnc: '',
  bic: '',
  foncier: '',
  anneeNaissance: '',
  ageRetraite: '64',
  versementInitial: '',
  versementMensuel: '',
  profil: 'equilibre',
  objectif: '',
  statutPro: '',
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  otpCode: '',
  otpSent: false,
  otpVerified: false,
  consentementRdv: false,
  consentementRgpd: false,
};

export const PROFIL_TAUX: Record<Profil, number> = {
  prudent: 0.03,
  equilibre: 0.04,
  dynamique: 0.05,
};
