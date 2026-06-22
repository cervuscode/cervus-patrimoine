#*************************************************************************************************************************
#
#Copyright or © or Copr.[DGFIP][2025]
#
#Ce logiciel a été initialement développé par la Direction Générale des 
#Finances Publiques pour permettre le calcul de l'impôt sur le revenu 2025 
#au titre des revenus perçus en 2024. La présente version a permis la 
#génération du moteur de calcul des chaînes de taxation des rôles d'impôt 
#sur le revenu de ce millésime.
#
#Ce logiciel est régi par la licence CeCILL 2.1 soumise au droit français 
#et respectant les principes de diffusion des logiciels libres. Vous pouvez 
#utiliser, modifier et/ou redistribuer ce programme sous les conditions de 
#la licence CeCILL 2.1 telle que diffusée par le CEA, le CNRS et l'INRIA  sur 
#le site "http://www.cecill.info".
#
#Le fait que vous puissiez accéder à cet en-tête signifie que vous avez pris 
#connaissance de la licence CeCILL 2.1 et que vous en avez accepté les termes.
#
#**************************************************************************************************************************
                              
 ####    ####     #
 ####    ####     #
verif 5:
application :  iliad ;

si
   (APPLI_COLBERT + 0) < 1
   et
   V_ZDC + 0 = 0
   et
   V_BTMUL = 0
   et
   V_0AX+0 = 0 et V_0AY+0 = 0 et V_0AZ+0= 0
   et
   V_BTRNI > LIM_BTRNI10
   et
   RNI < V_BTRNI/5
   et
   V_BTANC + 0 = 1
   et
   ((V_BTNI1 + 0) non dans (50,92))
   et
   V_IND_TRAIT = 4

alors erreur DD05 ;
verif 11: 
application :  iliad ;

si
   RFMIC > 0
   et
   RFDANT> 0

alors erreur DD11 ;
verif 16:
application :  iliad ;

si
   APPLI_BATCH + APPLI_ILIAD = 1
   et
   APPLI_COLBERT = 0
   et
   1 - V_CNR > 0
   et
   CHRFAC > 0
   et
   V_0CR > 0
   et
   RFACC != 0

alors erreur DD16 ;
verif 18:
application :  iliad ;


si
   (APPLI_COLBERT + 0) < 1
   et
   DAR > LIM_CONTROLE
   et
   V_BTRNI > 0
   et
   ((V_BTNI1+0) non dans (50,92))
   et
   V_IND_TRAIT = 4

alors erreur DD18 ;
verif 22:
application :  iliad ;


si
  (APPLI_COLBERT + 0) < 1
   et
   (V_BTCSGDED * (1-present(DCSG)) + DCSG) > V_BTCSGDED +  LIM_CONTROLE
   et
   1 - V_CNR > 0
   et
   RDCSG > 0
   et
   (((APPLI_ILIAD =  1 et positif(APPLI_COLBERT + 0) != 1) et V_NOTRAIT+0 < 16)
    ou
    ((V_BTNI1+0) non dans (50,92) et APPLI_BATCH = 1))

alors erreur DD22 ;
