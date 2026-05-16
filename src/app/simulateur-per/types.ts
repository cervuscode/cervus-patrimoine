export type Statut = 'celibataire' | 'divorce' | 'marie' | 'pacse' | 'parent_isole';
export type AbattementSalaires = 'forfait10' | 'fraisReels';
export type Profil = 'prudent' | 'equilibre' | 'dynamique';
export type SimStep = 1 | 2 | 3 | 4 | 'result';

export interface SimulateurData {
  // Step 1
  statut: Statut | '';
  nbEnfants: number;
  // Step 2
  salaires: string;
  abattementSalaires: AbattementSalaires;
  fraisReels: string;
  bnc: string;
  bic: string;
  foncier: string;
  // Step 3
  anneeNaissance: string;
  versementMensuel: string;
  profil: Profil;
  // Step 4
  prenom: string;
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
  tauxAnnuel: number;
  capitalFinal: number;
  courbe: Array<{ annee: number; capital: number }>;
  economieFiscale: number;
  versementAnnuel: number;
}

export const INITIAL_DATA: SimulateurData = {
  statut: '',
  nbEnfants: 0,
  salaires: '',
  abattementSalaires: 'forfait10',
  fraisReels: '',
  bnc: '',
  bic: '',
  foncier: '',
  anneeNaissance: '',
  versementMensuel: '',
  profil: 'equilibre',
  prenom: '',
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
