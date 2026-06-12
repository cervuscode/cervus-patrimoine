import type { AVProfil } from "@/lib/av-engine";

// Données du parcours Assurance-vie (front uniquement à ce stade).
export interface AVFormData {
  // Paramètres de simulation
  versementInitial: string; // saisi (€), parsé en number pour le moteur
  versementMensuel: string; // saisi (€)
  dureeAnnees: number; // horizon
  profil: AVProfil;
  marie: boolean | null; // null = pas encore répondu (abattement 4600 / 9200)

  // Coordonnées (capture — non branchée au CRM pour l'instant)
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

export const AV_INITIAL: AVFormData = {
  versementInitial: "",
  versementMensuel: "",
  dureeAnnees: 15,
  profil: "equilibre",
  marie: null,
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  otpCode: "",
  otpSent: false,
  otpVerified: false,
  consentementRdv: false,
  consentementRgpd: false,
};

export const AV_PROFILS: { value: AVProfil; label: string; taux: number }[] = [
  { value: "prudent", label: "Prudent", taux: 3 },
  { value: "equilibre", label: "Équilibré", taux: 4 },
  { value: "responsable", label: "Responsable", taux: 4 },
  { value: "dynamique", label: "Dynamique", taux: 5 },
];
