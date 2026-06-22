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
                              
 ####    ####    ####
 ####    ####    ####
verif 1700:
application : iliad  ;

si
   (V_MODUL+0) < 1
     et
   RDCOM > 0
   et
   SOMMEA700 = 0

alors erreur A700 ;
verif 1702:
application :  iliad ;

si
   (V_MODUL+0) < 1
   et
   ((V_REGCO +0) dans (1,3,5,6)
   ou
   (VALREGCO+0)  non dans (2))
   et
   INTDIFAGRI * positif(INTDIFAGRI) + 0 > RCMHAB * positif(RCMHAB) + 0

alors erreur A702 ;
verif 17071:
application :  iliad ;


si
  (V_MODUL+0) < 1
   et
   RDENS + RDENL + RDENU > V_0CF + V_0DJ + V_0DN + 0

alors erreur A70701 ;
verif 17072:
application :  iliad ;


si
  (V_MODUL+0) < 1
   et
   RDENSQAR + RDENLQAR + RDENUQAR > V_0CH + V_0DP + 0

alors erreur A70702 ;
verif 17111:
application :  iliad ;


si
  (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   INAIDE > 0
   et
   positif( CREAIDE + 0) = 0

alors erreur A71101 ;
verif 17112:
application :  iliad ;

si
  (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   ASCAPA >0
   et 
   positif (CREAIDE + 0) = 0

alors erreur A71102 ;
verif 17113:
application :  iliad ;

si
  (V_MODUL+0) < 1
  et
  V_IND_TRAIT > 0
  et
   PREMAIDE > 0
   et
   positif(CREAIDE + 0) = 0

alors erreur A71103 ;
verif 17114:
application :  iliad ;

si
  (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   COD7DR > 0
   et
   positif(CREAIDE + 0) = 0

alors erreur A71104 ;
verif 17115:
application :  iliad ;

si
  (V_MODUL+0) < 1
   et
   V_IND_TRAIT = 4
   et
   COD7HB > 0
   et
   positif(CREAIDE + 0) = 0

alors erreur A71105 ;
verif 17121:
application :  iliad ;


si
  (V_MODUL+0) < 1
   et
   PRESCOMP2000 + 0 > PRESCOMPJUGE
   et
   positif(PRESCOMPJUGE) = 1

alors erreur A712 ;
verif non_auto_cc 1713:
application :  iliad ;


si
   (V_MODUL+0) < 1
   et
   (PRESCOMPJUGE + 0 > 0 et PRESCOMP2000 + 0 = 0)
   ou
   (PRESCOMPJUGE + 0 = 0 et PRESCOMP2000 + 0 > 0)

alors erreur A713 ;
verif 1714:
application :  iliad ;


si
   (V_MODUL+0) < 1
   et
   RDPRESREPORT + 0 > 0
   et
   PRESCOMPJUGE + PRESCOMP2000 + 0 > 0

alors erreur A714 ;
verif 1715:
application :  iliad ;

si
  (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   RDPRESREPORT + 0 > LIM_REPCOMPENS

alors erreur A715 ;
verif 1716:
application :  iliad ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   ((SUBSTITRENTE < PRESCOMP2000 + 0)
    ou
    (SUBSTITRENTE > 0 et present(PRESCOMP2000) = 0))

alors erreur A716 ;
verif 1719:
application :  iliad ;


si
  (V_MODUL+0) < 1
   et
   RDMECENAT > 0
   et
   SOMMEA719 = 0

alors erreur A719 ;
verif 17368:
application :  iliad ;

si
  (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   positif(COD7QI) + positif(COD7QJ) + positif(COD7QK) + positif(COD7QL) + positif(COD7NI) + positif(COD7NJ) + positif(COD7NK) + positif(COD7NL) + 0 > 2

alors erreur A73608 ;
verif 17369:
application :  iliad ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   positif(COD7QM) + positif(COD7QN) + positif(COD7QO) + positif(COD7QP) + positif(COD7NM) + positif(COD7NN) + positif(COD7PF) + positif(COD7PG) + 0 > 2

alors erreur A73609 ;
verif 173610:
application :  iliad ;

si
  (V_MODUL+0) < 1
  et
  V_IND_TRAIT > 0
  et
  positif(COD7VD) + positif(COD7VE) + positif(COD7VF) +positif(COD7VG) + positif(COD7QR) + positif(COD7QS) + positif(COD7QT) + positif(COD7QU)+ positif(COD7NO) + positif(COD7NP) + positif(COD7NQ) + positif(COD7NR) + positif(COD7FA) + positif(COD7FC) + positif(COD7FD) + 0 > 2

alors erreur A73610 ;
verif 173611:
application :  iliad ;

si
  (V_MODUL+0) < 1
  et
  V_IND_TRAIT > 0
  et
  positif(COD7VW) + positif(COD7VX) + positif(COD7VY) +positif(COD7VZ) + positif(COD7SD) + positif(COD7SE) + positif(COD7SF) + positif(COD7SG)+ positif(COD7LQ) + positif(COD7LR) + positif(COD7LS) + positif(COD7LT) + 0 > 2

alors erreur A73611 ;
verif 17371:
application :  iliad ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   (COD7YE + 0) < 1
   et
   positif(COD7ZN) + positif(COD7YP) + 0 > 1

alors erreur A73701 ;
verif 17372:
application :  iliad ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   (COD7YE + 0) < 1
   et
   positif(COD7ZG) + positif(COD7ZH) + positif(COD7YN) + positif(COD7YO) + 0 > 1

alors erreur A73702 ;
verif 17373:
application :  iliad ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   (COD7YE + 0) < 1
   et
   positif(COD7ZC) + positif(COD7ZD) + positif(COD7ZE) + positif(COD7ZF) + positif(COD7XN) + positif(COD7YA) + positif(COD7YC) + positif(COD7YM) + 0 > 1

alors erreur A73703 ;
verif 17374:
application :  iliad ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   (COD7YE + 0) < 1
   et
   positif(COD7YD) + positif(COD7YF) + positif(COD7ZA) + positif(COD7ZB) + positif(COD7XD) + positif(COD7XE) + positif(COD7XL) + positif(COD7XM) + 0 > 1 

alors erreur A73704 ;
verif 17375:
application :  iliad ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   (COD7YE + 0) < 1
   et   
   positif(COD7YB) + positif(COD7XC) + 0 > 1

alors erreur A73705 ;
verif 17376:
application :  iliad ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   (COD7YE + 0) < 1
   et   
   positif(COD7IR) + positif(COD7IS) + positif(COD7IT) + positif(COD7IU) + positif(COD7HY) + positif(COD7IJ) + positif(COD7IQ) + positif(COD7IW) + positif(COD7CB) + positif(COD7CC) + positif(COD7CF) + positif(COD7CG) + positif(COD7BI) + positif(COD7BQ) + positif(COD7BX) + positif(COD7BY) + 0 > 1

alors erreur A73706 ;
verif 17377:
application :  iliad ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   (COD7YE + 0) < 1
   et
   positif(COD7CN) + positif(COD7DX) + 0 > 1 

alors erreur A73707 ;
verif 17378:
application :  iliad ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   (COD7YE + 0) = 0
   et
   positif(COD7GH) + positif(COD7GI) + positif(COD7KA) + positif(COD7KB) + 0 > 1  

alors erreur A73708 ;
verif 17379:
application :  iliad ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   (COD7YE + 0) = 0
   et
   positif(COD7HA) + positif(COD7HJ) + positif(COD7HK) + positif(COD7HN) + positif(COD7CJ) + positif(COD7CK) + positif(COD7CL) + positif(COD7CM) + positif(COD7BZ) + positif(COD7DI) + positif(COD7DU) + positif(COD7DV) + 0 > 1

alors erreur A73709 ;
verif 173710:
application :  iliad ;

si
(V_MODUL+0) < 1
  et
 V_IND_TRAIT > 0
  et
 (COD7YE + 0) = 0
  et
  positif(COD7GJ) + positif(COD7KK) + 0 > 1

alors erreur A73710 ;
verif 17401:
application :  iliad ;

si
  (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   (CODHFR + CODHFW + CODHGW + CODHHW + CODHIW + CODHJW  + 0) > PLAF_INVDOM6

alors erreur A74001 ;
verif 1744:
application : iliad  ;

si
 (V_MODUL+0) < 1
 et
 present(COD7WS) + present(COD7WH) + present(COD7WK) + present(COD7WQ) + present(COD7XR) +  present(COD7XZ) +  present(COD7XV) + present(COD7XG) + present(COD7XF) > 0
 et
 present(COD7WS) + present(COD7WH) + present(COD7WK) + present(COD7WQ)+ present(COD7XR) + present(COD7XZ) + present(COD7XV) + present(COD7XG) + present(COD7XF) < 9

alors erreur A744 ;
verif 1745:
application : iliad  ;

si
  (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   positif_ou_nul(COD7ZW + COD7ZX + COD7ZY + COD7ZZ) = 1
   et
   positif_ou_nul(COD7ZW) + positif_ou_nul(COD7ZX) + positif_ou_nul(COD7ZY) + positif_ou_nul(COD7ZZ) < 4

alors erreur A745 ;
verif 175001:
application : iliad  ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   positif(COD7WI) > 0
   et
   present(V_0AM) + present(V_0AX) = 2
   et 
  present(V_0AB) + present(V_0AU) = 0 
   et
  present(COD8XZ) + present(COD8YZ) != 2 

alors erreur A75001 ;
verif 175002:
application : iliad  ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   positif(COD7WI) > 0
   et
   present(V_0AO) + present(V_0AX) = 2
   et
   present(V_0AB) = 0
   et
   present(COD8XZ) + present(COD8YZ) != 2

alors erreur A75002 ;
verif 175003:
application : iliad  ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   positif(COD7WI) > 0
   et
   present(V_0AD) + present(V_0AY) = 2
   et
   present(COD8XZ) + present(COD8YZ) != 2

alors erreur A75003 ;
verif 175004:
application : iliad  ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   positif(COD7WI) > 0
   et
   present(V_0AV) + present(V_0AZ) = 2
   et
   present(COD8XZ) + present(COD8YZ) != 2
   et
   (
   (present(V_BTRFRN1) * (1-present(RFRN1)) + present(V_BTRFRN2) * (1-present(RFRN2))) != 2
      ou
   (present(RFRN1) * (1-present(V_BTRFRN1)) + present(RFRN2) * (1-present(V_BTRFRN2))) != 2
   )

alors erreur A75004 ;
verif 175005:
application : iliad  ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   positif(COD7WI)  = 1
   et
   positif(V_BTXYZ1) = 1
   et
   (present(V_BTOPTSEP1) = 0
   ou 
   positif(V_BTOPTSEP1) =0 )
   et
   present(COD8XZ) = 0

alors erreur A75005 ;
verif 175006:
application : iliad  ;

si
   (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   positif(COD7WI)  = 1
   et
   positif(V_BTXYZ1) = 1
   et
   positif(V_BTOPTSEP1) = 1
   et
   (
   (present(COD8XZ) * (1-present(COD8YZ)) + present(COD8YZ) * (1-present(COD8XZ))) = 1
   ou
   present(COD8XZ) * present(COD8YZ) = 0
   )

alors erreur A75006 ;
verif 175007:
application : iliad  ;

si
  (V_MODUL+0) < 1
   et
   V_IND_TRAIT > 0
   et
   positif(COD7WI)  = 1
   et
   positif(V_BTXYZ2) = 1
   et
   positif(V_BTOPTSEP2) = 1
   et
   present(COD8XZ) = 0

alors erreur A75007 ;
verif 176001:
application : iliad  ;
	
si
 V_IND_TRAIT > 0
 et
 CODFGD > 0
 et 
 present(RDGARD1) + present(RDGARD2) + present(RDGARD3) + present(RDGARD4) < 4

 alors erreur A76001 ;
verif 176002:
application : iliad  ;

si
 V_IND_TRAIT > 0
 et 
 CODFGD > 0
 et 
 present(CODFGR) = 0

alors erreur A76002 ; 
verif 176003:
application : iliad  ;

si
 V_IND_TRAIT > 0
 et
 CODFHD > 0
 et
 present(RDGARD1QAR) + present(RDGARD2QAR) + present(RDGARD3QAR) + present(RDGARD4QAR) < 4

alors erreur A76003 ;
verif 176004:
application : iliad  ;

si
 V_IND_TRAIT > 0
  et
  CODFHD > 0
  et
  present(CODFHR) = 0

alors erreur A76004 ;
verif 1761: 
application : iliad  ;

si
   (V_MODUL+0) < 1
  et
  (
  (CIGARD > 0
  et
  1 - V_CNR > 0
  et
  positif(RDGARD1) + positif(RDGARD2) + positif(RDGARD3) + positif(RDGARD4) + positif(CODFGD) > EM7 + 0)
  ou
 (CIGARD > 0
  et
  1 - V_CNR > 0
  et
  positif(RDGARD1QAR) + positif(RDGARD2QAR) + positif(RDGARD3QAR) + positif(RDGARD4QAR) + positif(CODFHD) > EM7QAR + 0)
  )

alors erreur A761 ;
