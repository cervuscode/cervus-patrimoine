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
                                                                         #####
 ####   #    #    ##    #####      #     #####  #####   ######          #     #
 ####   #    #  #    #  #          #       #    #    #  ######          #######
regle 201000:
application : iliad ;

NAPINI = ( IRN + PIR - IRANT )* (1 - INDTXMIN) *(1 - INDTXMOY)
       + min(0, IRN + PIR - IRANT) * (INDTXMIN + INDTXMOY)
       + max(0, IRN + PIR - IRANT) * 
                                (INDTXMIN*positif((IAVIMBIS-NAPCRPAVIM)-SEUIL_61 )
			       + INDTXMOY* positif((IAVIMO-NAPCRPAVIM)-SEUIL_61))
                      + BRASAR ;

RC1INI = positif( NAPINI + 1 - SEUIL_12 ) ;

regle 201010:
application : iliad ;


NAPTOT = IRCUM + TAXACUM + PCAPCUM + HAUTREVCUM + CDHRCUM - RECUMIR ;

regle 201020:
application : iliad ;


NAPTOTA = V_IRPSANT - V_ANTRE ;
NAPTOTAIR = V_TOTIRANT - V_TOTIRNANT - V_ANTREIR ;
TOTCRA = V_ANTCR - V_NANTCR ;
TOTIRPSANT = V_IRPSANT - V_NONMERANT + V_NONRESTANT - V_ANTRE ;

regle 201030:
application : iliad ;

OCEDIMP = IRNIN ;

regle 201040:
application : iliad ;

IRNIN = (IRN - IRANT+CODZRA) * positif(IRN - IRANT+CODZRA) ;

regle isf 201050:
application : iliad ;

IFI4BASE = IFI4BIS * positif_ou_nul(IFI4BIS - SEUIL_12) ;

IFIBASE_INR = IFI4BIS;
IFIIN = IFI4BASE;
regle 201060:
application : iliad ;

NIRNINBIS = abs(min(0,IAN + AVFISCOPTER - IRE-CODCOA+CODZRA))*positif_ou_nul(CODCOA);
NCSBASEBIS = abs(min(0,CSG - CSGIM  - CS9YP-CODCOB))*positif_ou_nul(CODCOB);
NRDBASEBIS = abs(min(0,RDSN - CRDSIM  - RD9YP-CODCOR))*positif_ou_nul(CODCOR);
NPSOLBASEBIS = abs(min(0,PSOL - PRSPROV  - PS9YP-CODCOD)*positif_ou_nul(CODCOD));
NIRNIN = min(0,IAN + AVFISCOPTER - IRE-CODCOA-COD8EA+CODZRA)*positif_ou_nul(IAN + AVFISCOPTER - IRE)*positif_ou_nul(CODCOA);
NCSBASE = min(0,CSG - CSGIM  - CS9YP-CODCOB)*positif_ou_nul(CODCOB);
NRDBASE = min(0,RDSN - CRDSIM  - RD9YP-CODCOR)*positif_ou_nul(CODCOR);
NPSOLBASE = min(0,PSOL - PRSPROV  - PS9YP-CODCOD)*positif_ou_nul(CODCOD);
NCVNBASE = min(0,CVNN - COD8YT  - CVN9YP-CODCOE-NCVNBASE_PA)*positif_ou_nul(CODCOE);
NCDISBASE = min(0,CDIS - CDISPROV  - CDIS9YP-CODCOF-NCDISBASE_PA)*positif_ou_nul(CODCOF);
NC820BASE = min(0,MCSG820 - COD8ZH -C8209YP-CODCOQ-NC820BASE_PA)*positif_ou_nul(CODCOQ);
NGLOBASE = min(0,CSGLOA - COD8YL  - GLO9YP-CODCOG-NGLOBASE_PA)*positif_ou_nul(CODCOG);
NRSE1BASE = min(0,RSE1N - CSPROVYD - RSE19YP-CODCOT-NRSE1BASE_PA)*positif_ou_nul(CODCOT);
NRSE2BASE = (min(0, max(0, RSE8TV - CIRSE8TV - CSPROVYF) + max(0, RSE8SA -CIRSE8SA - CSPROVYN) - RSE29YP-CODCOL)-NRSE2BASE_PA)*positif_ou_nul(CODCOL);
NRSE3BASE = min(0,RSE3N - CSPROVYG - RSE39YP-CODCOM-NRSE3BASE_PA)*positif_ou_nul(CODCOM);
NRSE4BASE = min(0, RSE4N  - CSPROVYH - CSPROVYP - RSE49YP-CODCOO-NRSE4BASE_PA)*positif_ou_nul(CODCOO);
NRSE5BASE = min(0,RSE5N - CSPROVYE - RSE59YP-CODCOJ-NRSE5BASE_PA)*positif_ou_nul(CODCOJ);
NRSE6BASE = min(0,RSE6N - COD8YQ - RSE69YP-CODCOP-NRSE6BASE_PA)*positif_ou_nul(CODCOP);
NRSE8BASE = min(0,RSE8N - COD8YV -COD8YX - RSE89YP-CODCOH-NRSE8BASE_PA)*positif_ou_nul(CODCOH);
NTAXABASE = min(0,TAXASSUR - TAXA9YI -CODCOU-NTAXABASE_PA)*positif_ou_nul(CODCOU);
NPCAPBASE = min(0,IPCAPTAXT - CAP9YI -CODCOV-NPCAPBASE_PA)*positif_ou_nul(CODCOV);
NCHRBASE = min(0,IHAUTREVT +CHRPVIMP- CHR9YI -CODCOX-NCHRBASE_PA)*positif_ou_nul(CODCOX);
IRNIN_INR = (1-ANNUL2042) * (max(0 , min(0 , IAN + AVFISCOPTER - IRE - CODCOA + CODZRA)
                               + max(0 , IAN + AVFISCOPTER - IRE - CODCOA + CODZRA)
                                                     * positif(IAMD1 + 1 + V_ANTREIR - SEUIL_61) - IRANT
                                                                 -IR9YI*(1-positif(IND_PASSAGE-1))-max(IR9YI_P,IR9YI_PA)*positif(IND_PASSAGE-1)
                                                                   +max(0,NIRNINBIS_A-NIRNINBIS))
                   * positif(min(0 , IAN + AVFISCOPTER - IRE - CODCOA + CODZRA)
                                    + max(0 , IAN + AVFISCOPTER - IRE - CODCOA + CODZRA)
                                                           * positif(IAMD1 + 1 + V_ANTREIR - SEUIL_61) - IRANT
                                                 -IR9YI*(1-positif(IND_PASSAGE-1))-max(IR9YI_P,IR9YI_PA)*positif(IND_PASSAGE-1))
                                                + max(0,min(SOMPASIR_REF,max(SOMPASIR_A,SOMPASIR_P+SOMPASIR_PA))- SOMPASIR) * positif(DIFFSOMPASIR)
						+ (positif(RED_A+REDA_A -RED) * (RED_A+REDA_A -RED)
						+ positif(INE_A+INEA_A - INE) * (INE_A+INEA_A - INE)
						+ positif(IRE_A+IREA_A - IRE) * (IRE_A+IREA_A - IRE)) * positif(CODFRD))
                                                       ;
CSBASE_INR = (1-ANNUL2042) * (max(0 , CSG - CSGIM - CODCOB-CS9YP*(1-positif(IND_PASSAGE-1))-max(CS9YP_P,CS9YP_PA)*positif(IND_PASSAGE-1))+max(0,NCSBASEBIS_A-NCSBASEBIS) 
                                                + max(0,min(SOMPASCS_REF,max(SOMPASCS_A,SOMPASCS_P+SOMPASCS_PA))- SOMPASCS) * positif(DIFFSOMPASCS));
RDBASE_INR = (1-ANNUL2042) * (max(0 , RDSN - CRDSIM - CODCOR-RD9YP*(1-positif(IND_PASSAGE-1))-max(RD9YP_P,RD9YP_PA)*positif(IND_PASSAGE-1))+max(0,NRDBASEBIS_A-NRDBASEBIS) 
                                                + max(0,min(SOMPASRD_REF,max(SOMPASRD_A,SOMPASRD_P+SOMPASRD_PA))- SOMPASRD) * positif(DIFFSOMPASCS));
PSOLBASE_INR = (1-ANNUL2042) * (max(0 , PSOL - PRSPROV - CODCOD-PS9YP*(1-positif(IND_PASSAGE-1))-max(PS9YP_P,PS9YP_PA)*positif(IND_PASSAGE-1))
                                                   +max(0,NPSOLBASEBIS_A-NPSOLBASEBIS) 
                                                + max(0,min(SOMPASPS_REF,max(SOMPASPS_A,SOMPASPS_P+SOMPASPS_PA))- SOMPASPS) * positif(DIFFSOMPASCS));
PSOLBASEMAJO_INR = (1-ANNUL2042) * (max(0 , PSOL - PRSPROV - CODCOD-PS9YP*(1-positif(IND_PASSAGE-1))-max(PS9YP_P,PS9YP_PA)*positif(IND_PASSAGE-1)) 
                                                + max(0,min(SOMPASPS_REF,max(SOMPASPS_A,SOMPASPS_P+SOMPASPS_PA))- SOMPASPS) * positif(DIFFSOMPASCS));
CVNBASE_INR = (1-ANNUL2042) * (max(0,CVNN - COD8YT  -CODCOE-CVN9YP*(1-positif(IND_PASSAGE-1))-max(CVN9YP_P,CVN9YP_PA)*positif(IND_PASSAGE-1))
                                                + max(0,min(SOMPASCVN_REF,max(SOMPASCVN_A,SOMPASCVN_P+SOMPASCVN_PA))- SOMPASCVN) * positif(DIFFSOMPASCS));
CDISBASE_INR = (1-ANNUL2042) * (max(0,CDIS - CDISPROV  -CODCOF-CDIS9YP*(1-positif(IND_PASSAGE-1))-max(CDIS9YP_P,CDIS9YP_PA)*positif(IND_PASSAGE-1))
                                                + max(0,min(SOMPASCDIS_REF,max(SOMPASCDIS_A,SOMPASCDIS_P+SOMPASCDIS_PA))- SOMPASCDIS) * positif(DIFFSOMPASCS));
C820BASE_INR = (1-ANNUL2042) * (max(0,MCSG820 - COD8ZH -CODCOQ-C8209YP*(1-positif(IND_PASSAGE-1))-max(C8209YP_P,C8209YP_PA)*positif(IND_PASSAGE-1))
                                                + max(0,min(SOMPASC820_REF,max(SOMPASC820_A,SOMPASC820_P+SOMPASC820_PA))- SOMPASC820) * positif(DIFFSOMPASCS));
GLOBASE_INR = (1-ANNUL2042) * (max(0,CSGLOA - COD8YL  -CODCOG-GLO9YP*(1-positif(IND_PASSAGE-1))-max(GLO9YP_P,GLO9YP_PA)*positif(IND_PASSAGE-1))
                                                + max(0,min(SOMPASGLO_REF,max(SOMPASGLO_A,SOMPASGLO_P+SOMPASGLO_PA))- SOMPASGLO) * positif(DIFFSOMPASCS));
RSE1BASE_INR = (1-ANNUL2042) * (max(0,RSE1N - CSPROVYD -CODCOT-RSE19YP*(1-positif(IND_PASSAGE-1))-max(RSE19YP_P,RSE19YP_PA)*positif(IND_PASSAGE-1))
                                                + max(0,min(SOMPASRSE1_REF,max(SOMPASRSE1_A,SOMPASRSE1_P+SOMPASRSE1_PA))- SOMPASRSE1) * positif(DIFFSOMPASCS));
RSE2BASE_INR = (1-ANNUL2042) * (max(0, max(0, RSE8TV - CIRSE8TV - CSPROVYF) + RSE8QV + max(0, RSE8SA -CIRSE8SA - CSPROVYN) -CODCOL)-RSE29YP*(1-positif(IND_PASSAGE-1))-max(RSE29YP_P,RSE29YP_PA)*positif(IND_PASSAGE-1) 
                                                + max(0,min(SOMPASRSE2_REF,max(SOMPASRSE2_A,SOMPASRSE2_P+SOMPASRSE2_PA))- SOMPASRSE2) * positif(DIFFSOMPASCS));
RSE3BASE_INR = (1-ANNUL2042) * (max(0,RSE3N - CSPROVYG -CODCOM)-RSE39YP*(1-positif(IND_PASSAGE-1))-max(RSE39YP_P,RSE39YP_PA)*positif(IND_PASSAGE-1)
                                                + max(0,min(SOMPASRSE3_REF,max(SOMPASRSE3_A,SOMPASRSE3_P+SOMPASRSE3_PA))- SOMPASRSE3) * positif(DIFFSOMPASCS));
RSE4BASE_INR = (1-ANNUL2042) * (max(0, RSE4N  - CSPROVYH -CODCOO)-RSE49YP*(1-positif(IND_PASSAGE-1))-max(RSE49YP_P,RSE49YP_PA)*positif(IND_PASSAGE-1)
                                                + max(0,min(SOMPASRSE4_REF,max(SOMPASRSE4_A,SOMPASRSE4_P+SOMPASRSE4_PA))- SOMPASRSE4) * positif(DIFFSOMPASCS));
RSE5BASE_INR = (1-ANNUL2042) * (max(0,RSE5N - CSPROVYE -CODCOJ)-RSE59YP*(1-positif(IND_PASSAGE-1))-max(RSE59YP_P,RSE59YP_PA)*positif(IND_PASSAGE-1)
                                                + max(0,min(SOMPASRSE5_REF,max(SOMPASRSE5_A,SOMPASRSE5_P+SOMPASRSE5_PA))- SOMPASRSE5) * positif(DIFFSOMPASCS));
RSE6BASE_INR = (1-ANNUL2042) * (max(0,RSE6N - COD8YQ -CODCOP)-RSE69YP*(1-positif(IND_PASSAGE-1))-max(RSE69YP_P,RSE69YP_PA)*positif(IND_PASSAGE-1)
                                                + max(0,min(SOMPASRSE6_REF,max(SOMPASRSE6_A,SOMPASRSE6_P+SOMPASRSE6_PA))- SOMPASRSE6) * positif(DIFFSOMPASCS));
RSE8BASE_INR = (1-ANNUL2042) * (max(0,RSE8N - COD8YV -COD8YX -CODCOH)-RSE89YP*(1-positif(IND_PASSAGE-1))-max(RSE89YP_P,RSE89YP_PA)*positif(IND_PASSAGE-1)
                                                + max(0,min(SOMPASRSE8_REF,max(SOMPASRSE8_A,SOMPASRSE8_P+SOMPASRSE8_PA))- SOMPASRSE8) * positif(DIFFSOMPASCS));
TAXABASE_INR = (1-ANNUL2042) * (arr(max(TAXASSUR -CODCOU-TAXA9YI*(1-positif(IND_PASSAGE-1))-max(TAXA9YI_P,TAXA9YI_PA)*positif(IND_PASSAGE-1)
                                                + max(0,min(SOMPASTAXA_REF,max(SOMPASTAXA_A,SOMPASTAXA_P+SOMPASTAXA_PA))- SOMPASTAXA) * positif(DIFFSOMPASIR)
                              + min(0,min( 0, IAN + AVFISCOPTER - IRE) + max( 0, IAN + AVFISCOPTER - IRE )  * positif( IAMD1 + 1 + V_ANTREIR - SEUIL_61)
                                             - IRANT-IR9YI*(1-positif(IND_PASSAGE-1))-max(IR9YI_P,IR9YI_PA)*positif(IND_PASSAGE-1)),0))) * positif(IAMD1 + 1 + V_ANTREIR - SEUIL_61);
PCAPBASE_INR = (1-ANNUL2042) * (arr(max(IPCAPTAXT -CODCOV -CAP9YI*(1-positif(IND_PASSAGE-1))-max(CAP9YI_P,CAP9YI_PA)*positif(IND_PASSAGE-1)
                                                + max(0,min(SOMPASCAP_REF,max(SOMPASCAP_A,SOMPASCAP_P+SOMPASCAP_PA))- SOMPASCAP) * positif(DIFFSOMPASIR)
                                          + min(0,min( 0, IAN + AVFISCOPTER - IRE ) + max( 0, IAN + AVFISCOPTER - IRE )  * positif( IAMD1 + 1 + V_ANTREIR - SEUIL_61)
                                      - IRANT + TAXASSUR-(IR9YI+TAXA9YI)*(1-positif(IND_PASSAGE-1))
                                       -max(IR9YI_P+TAXA9YI_P,IR9YI_PA+TAXA9YI_PA)*positif(IND_PASSAGE-1)),0))) * positif(IAMD1 + 1 + V_ANTREIR - SEUIL_61);
CHRBASE_INR = (1-ANNUL2042) * (arr(max(IHAUTREVT +CHRPVIMP -CODCOX -CHR9YI*(1-positif(IND_PASSAGE-1))-max(CHR9YI_P,CHR9YI_PA)*positif(IND_PASSAGE-1)
                                                + max(0,min(SOMPASCHR_REF,max(SOMPASCHR_A,SOMPASCHR_P+SOMPASCHR_PA))- SOMPASCHR) * positif(DIFFSOMPASIR)
                                          + min(0,min( 0, IAN + AVFISCOPTER - IRE) + max( 0, IAN + AVFISCOPTER - IRE)  * positif( IAMD1 + 1 + V_ANTREIR - SEUIL_61)
                                        - IRANT+TAXASSUR + IPCAPTAXT+ TAXASSUR+IPCAPTAXT-(IR9YI+TAXA9YI+CAP9YI)*(1-positif(IND_PASSAGE-1))
					 -max(IR9YI_P+TAXA9YI_P+CAP9YI_P,IR9YI_PA+TAXA9YI_PA+CAP9YI_PA)*positif(IND_PASSAGE-1)),0))) * positif(IAMD1 + 1 + V_ANTREIR - SEUIL_61) ;


CSPROVRSE6 = COD8YQ;

CSBASE = max(0 , CSG - CSGIM - CODCOB-CS9YP) ;
RDBASE = max(0 , RDSN - CRDSIM - CODCOR)-RD9YP ;
PSOLBASE = max(0 , PSOL - PRSPROV - CODCOD-PS9YP) ;
CVNBASE = max(0,CVNN - COD8YT -CODCOE)-CVN9YP;
CDISBASE = max(0,CDIS - CDISPROV-CODCOF)-CDIS9YP ;
C820BASE = max(0,MCSG820 - COD8ZH-CODCOQ)-C8209YP;
GLOBASE = max(0,CSGLOA - COD8YL -CODCOG)-GLO9YP;
RSE1BASE = max(0,RSE1N - CSPROVYD-CODCOT)-RSE19YP;
RSE2BASE = max(0,max(0, RSE8TV - CIRSE8TV - CSPROVYF) 
         + max(0, RSE8SA - CIRSE8SA - CSPROVYN)-CODCOL)-RSE29YP ;
RSE3BASE = max(0,RSE3N - CSPROVYG-CODCOM)-RSE39YP;
RSE4BASE = max(0, RSE4N - CSPROVYH - CSPROVYP-CODCOO)-RSE49YP ;
RSE5BASE = max(0,RSE5N - CSPROVYE -CODCOJ)-RSE59YP;
RSE6BASE = max(0,RSE6N - COD8YQ-CODCOP)-RSE69YP ;
RSE8BASE = max(0,RSE8N - COD8YV - COD8YX - CODCOH)-RSE89YP;
TAXABASE = arr(max(TAXASSUR + min(0,IRN - IRANT)-CODCOU,0)-TAXA9YI) * positif(IAMD1 + 1 - SEUIL_61);
PCAPBASE = arr(max(IPCAPTAXT + min(0,IRN - IRANT + TAXASSUR-CODCOV-IR9YI-TAXA9YI),0)-CAP9YI) * positif(IAMD1 + 1 - SEUIL_61);
CHRBASE = arr(max(IHAUTREVT + CHRPVIMP + min(0 , IRN - IRANT + TAXASSUR + IPCAPTAXT - CODCOX-IR9YI-TAXA9YI-CAP9YI) , 0)-CHR9YI) * positif(IAMD1 + 1 - SEUIL_61) ;

IRBASE_I = (IRN -IRANT)*positif(IRN+1-SEUIL_12);

IRBASE_N = (IRN - IRANT)*(1 - positif (IRN-IRANT + TAXABASE_IRECT+CAPBASE_IRECT+HRBASE_IRECT))
           + (IAN - min( IAN , IRE )) * positif (IRN-IRANT + TAXABASE_IRECT+CAPBASE_IRECT+HRBASE_IRECT);
TAXABASE_I = TAXASSUR * positif(IAMD1 + 1 - SEUIL_61);
TAXABASE_N = arr(max(TAXASSUR + min(0,IRN - IRANT),0)) * positif(IAMD1 + 1 - SEUIL_61);
CAPBASE_I = IPCAPTAXT * positif(IAMD1 + 1 - SEUIL_61);
CAPBASE_N = arr(max(IPCAPTAXT + min(0,IRN - IRANT + TAXASSUR),0)) * positif(IAMD1 + 1 - SEUIL_61);
HRBASE_I = (IHAUTREVT +CHRPVIMP)* positif(IAMD1 + 1 - SEUIL_61);
HRBASE_N = arr(max(IHAUTREVT+CHRPVIMP + min(0 , IRN - IRANT + TAXASSUR + IPCAPTAXT) , 0)) * positif(IAMD1 + 1 - SEUIL_61) ;


IRNN = IRNIN ;

regle 201070:
application : iliad ;

PIR = (INCIR_NET
       + NMAJ1 + NMAJ3 + NMAJ4 
       + arr((BTO) * TXINT / 100)* positif(CMAJ)) * (1-INDTXMIN)
       + 
      (INCIR_NET
       + NMAJ1 + NMAJ3 + NMAJ4 
       + arr((BTO) * TXINT / 100)* positif(CMAJ)
       ) * positif_ou_nul(IAMD1 - SEUIL_TXMIN) * INDTXMIN
       ;

PPSOL = (
       INCPSOL_NET 
       + NMAJPSOL1+ NMAJPSOL4
       + arr(max(0,MPSOL-PRSPROV-CIPSOL-max(0,PS9YP)) * TXINT / 100)* positif(CMAJ)
              ) * positif_ou_nul(CSTOTSSPENA - SEUIL_61);


PCSG = (
       INCCS_NET
       + NMAJC1 + NMAJC4
       + arr(max(0,CSGC-CSGIM-CICSG-CS9YP) * TXINT / 100) * positif(CMAJ)
       ) * positif_ou_nul(CSTOTSSPENA - SEUIL_61);


PRDS = (
       INCRD_NET
       + NMAJR1 + NMAJR4
       + arr(max(0,RDSC-CRDSIM-CIRDS-RD9YP) * TXINT / 100) * positif(CMAJ)
       ) * positif_ou_nul(CSTOTSSPENA - SEUIL_61);


PCVN = (
       INCCVN_NET
       + NMAJCVN1 + NMAJCVN4
       + arr(max(0,CVNN - COD8YT-CVN9YP) * TXINT / 100) * positif(CMAJ)
       ) * positif_ou_nul(CSTOTSSPENA - SEUIL_61);


PTAXA = (INCTAXA_NET
        + NMAJTAXA1 + NMAJTAXA3 + NMAJTAXA4
        + arr(max(0,TAXASSUR- min(TAXASSUR+0,max(0,INE-IRB+AVFISCOPTER))+min(0,IRN - IRANT)-TAXA9YI) * TXINT / 100
	     )* positif(CMAJ)
	) 
         * (1-INDTXMIN)
        + (INCTAXA_NET
        + NMAJTAXA1 + NMAJTAXA3 + NMAJTAXA4
        + arr(max(0,TAXASSUR- min(TAXASSUR+0,max(0,INE-IRB+AVFISCOPTER))+min(0,IRN - IRANT)-TAXA9YI) * TXINT / 100
	     )* positif(CMAJ)
	  )
	   * positif_ou_nul(IAMD1 - SEUIL_TXMIN) * INDTXMIN;
PPCAP = ( INCPCAP_NET
         + NMAJPCAP1 + NMAJPCAP3 + NMAJPCAP4
         + arr(max(0,IPCAPTAXT- min(IPCAPTAXT+0,max(0,INE-IRB+AVFISCOPTER-TAXASSUR))+min(0,IRN - IRANT+TAXASSUR)-CAP9YI) * TXINT / 100
	      )* positif(CMAJ)
        ) 
         * (1-INDTXMIN)
       +(INCPCAP_NET
       + NMAJPCAP1 + NMAJPCAP3 + NMAJPCAP4
       + arr(max(0,IPCAPTAXT- min(IPCAPTAXT+0,max(0,INE-IRB+AVFISCOPTER-TAXASSUR))+min(0,IRN - IRANT+TAXASSUR)-CAP9YI) * TXINT / 100
            )* positif(CMAJ)
	 )
	  * positif_ou_nul(IAMD1 - SEUIL_TXMIN) * INDTXMIN;

PHAUTREV  = ( INCCHR_NET
       + NMAJCHR1 + NMAJCHR3 + NMAJCHR4
         + arr(max(0,IHAUTREVT+CHRPVIMP+min(0,IRN - IRANT+TAXASSUR+IPCAPTAXT)-CHR9YI) * TXINT / 100)* positif(CMAJ)
	 ) * (1-INDTXMIN)
       + (INCCHR_NET
       + NMAJCHR1 + NMAJCHR3 + NMAJCHR4
         + arr(max(0,IHAUTREVT+CHRPVIMP+min(0,IRN - IRANT+TAXASSUR+IPCAPTAXT)-CHR9YI) * TXINT / 100)* positif(CMAJ)
	 ) * positif_ou_nul(IAMD1 - SEUIL_TXMIN) * INDTXMIN;


PGLOA = (
       INCGLOA_NET
       + NMAJGLO1 + NMAJGLO4
       + arr(max(0,GLOBASE)* TXINT / 100) * positif(CMAJ)
       ) * positif_ou_nul(CSTOTSSPENA - SEUIL_61);

PRSE1 = (
       INCRSE1_NET
       + NMAJRSE11 + NMAJRSE14
         + arr(max(0,RSE1 -CIRSE1 -CSPROVYD-RSE19YP)* TXINT / 100) * positif(CMAJ)
	 ) * positif_ou_nul(CSTOTSSPENA - SEUIL_61);

PRSE2 = (
      	  INCRSE2_NET
       	  + NMAJRSE21 + NMAJRSE24
          + arr(max(0, RSE2N-RSE29YP-CSPROVYF) * TXINT / 100
               ) * positif(CMAJ)
        ) * positif_ou_nul(CSTOTSSPENA - SEUIL_61);
PRSE3 = (
       INCRSE3_NET
       + NMAJRSE31 + NMAJRSE34
         + arr(max(0,RSE3 -CIRSE3 -CSPROVYG-RSE39YP)* TXINT / 100) * positif(CMAJ)
	 ) * positif_ou_nul(CSTOTSSPENA - SEUIL_61);
PRSE4 = (
      	          INCRSE4_NET
       		+ NMAJRSE41 + NMAJRSE44
                + arr(max(0,RSE4 - CIRSE4 - CSPROVRSE4 - RSE49YP)* TXINT / 100) * positif(CMAJ)
        ) * positif_ou_nul(CSTOTSSPENA - SEUIL_61);

PRSE5 = (
       INCRSE5_NET
       + NMAJRSE51 + NMAJRSE54
         + arr(max(0,RSE5 -CIRSE5 -CSPROVYE-RSE59YP)* TXINT / 100) * positif(CMAJ)
	 ) * positif_ou_nul(CSTOTSSPENA - SEUIL_61);
PRSE6 = (
       INCRSE6_NET
       + NMAJRSE61 + NMAJRSE64
         + arr(max(0,RSE6BASE -RSE69YP)* TXINT / 100) * positif(CMAJ)
	 ) * positif_ou_nul(CSTOTSSPENA - SEUIL_61);
PRSE8 = (
       INCRSE8_NET
       + NMAJRSE81 + NMAJRSE84
         + arr(max(0,RSE8BASE -RSE89YP)* TXINT / 100) * positif(CMAJ)
	 ) * positif_ou_nul(CSTOTSSPENA - SEUIL_61);
PCSG92=PRSE8;
PCDIS = (
       INCCDIS_NET
       + NMAJCDIS1 + NMAJCDIS4
         + arr(max(0,CDIS-CDISPROV-CDIS9YP) * TXINT / 100) * positif(CMAJ)
	 ) * positif_ou_nul(CSTOTSSPENA - SEUIL_61);
PCSG820 = (
       INCC820_NET
       + NMAJC8201 + NMAJC8204
         + arr(max(0,MCSG820-COD8ZH-C8209YP) * TXINT / 100) * positif(CMAJ)
	 ) * positif_ou_nul(CSTOTSSPENA - SEUIL_61);

PDEG = max(0,PIR_A + PTAXA_A + PPCAP_A - PCHR_A - PIR - PTAXA - PPCAP - PHAUTREV);

regle 201090:
application : iliad ;

TOTPENIR = (PIR + PTAXA + PHAUTREV + PPCAP)
             * positif ( positif_ou_nul(VARIR61-SEUIL_61)
                              + positif_ou_nul(VARIRDROIT-SEUIL_61) + positif(COD8NZ+COD8NA+COD8NB) + positif(DIFFSOMPASIR)
                             ) ;

TOTPENCS = (PPSOL+ PCSG + PRDS + PCVN + PCDIS + PGLOA + PRSE1 + PRSE2 + PRSE3 + PRSE4 + PRSE5 + PRSE6+PRSE8+PCSG820) * positif(positif_ou_nul(VARPS61-SEUIL_61) + positif(DIFFSOMPASCS));

INCTOTIR = RETIR + RETTAXA + RETPCAP + RETHAUTREV ;

INCTOTCS = RETCS+RETRD+RETPS+RETPSOL+RETCVN+RETCDIS+RETGLOA
           +RETRSE1+RETRSE2+RETRSE3+RETRSE4
           +RETRSE5+RETRSE6+RETRSE8+RETCSG820;
RETIRCSTOT = INCTOTIR + INCTOTCS ;

regle 201100:
application : iliad;


PTOT = PIR ;

regle 201110:
application : iliad ;


ILI_SYNT_IR =  (1-ANNUL2042) * (positif(TOTIRCUM - NONMER - RECUMIR + NONREST - TOTPENIR) * max(0 , IRCUM - NONMER + NONREST - PIR)
              + (1 - positif(TOTIRCUM - NONMER - RECUMIR + NONREST - TOTPENIR)) * (TOTIRCUM - NONMER - RECUMIR + NONREST - TOTPENIR)) ;

PIRNEG = (1-ANNUL2042) * abs(min(0 , IRCUM - NONMER + NONREST - PIR)) ;

ILI_SYNT_TAXA = (1-ANNUL2042) * (positif(TOTIRCUM - NONMER - RECUMIR + NONREST - TOTPENIR) * max(0,TAXACUM - PTAXA - PIRNEG)
               + (1 - positif(TOTIRCUM - NONMER - RECUMIR + NONREST - TOTPENIR)) * 0);

PTAXANEG = (1-ANNUL2042) * abs(min(0 , TAXACUM - PTAXA - PIRNEG)) ;

ILI_SYNT_CAP = (1-ANNUL2042) * (positif(TOTIRCUM - NONMER - RECUMIR + NONREST - TOTPENIR) * max(0 , PCAPCUM - PPCAP - PTAXANEG)
               + (1 - positif(TOTIRCUM - NONMER - RECUMIR + NONREST - TOTPENIR)) * 0) ;

PPCAPNEG = (1-ANNUL2042) * abs(min(0 , PCAPCUM - PPCAP - PTAXANEG)) ;

ILI_SYNT_CHR = (1-ANNUL2042) * (positif(TOTIRCUM - NONMER - RECUMIR + NONREST - TOTPENIR) * max(0 , HAUTREVCUM - PHAUTREV - PPCAPNEG)
               + (1 - positif(TOTIRCUM - NONMER - RECUMIR + NONREST - TOTPENIR)) * 0) ;

PCHRNEG = (1-ANNUL2042) * abs(min(0 , HAUTREVCUM - PHAUTREV - PPCAPNEG)) ;

ILI_SYNT_CDHR = (1-ANNUL2042) * (positif(TOTIRCUM - NONMER - RECUMIR + NONREST - TOTPENIR) * max(0 , CDHRCUM - PCDHR - PCHRNEG)
               + (1 - positif(TOTIRCUM - NONMER - RECUMIR + NONREST - TOTPENIR)) * 0) ;

ILI_SYNT_TOTIR = (1-ANNUL2042) * (ILI_SYNT_IR + ILI_SYNT_TAXA + ILI_SYNT_CAP + ILI_SYNT_CHR ) * (1-APPLI_BATCH);

regle 201120:
application : iliad ;


ILIIRNET =  (1-ANNUL2042) * (positif_ou_nul(TOTIRCUM - RECUMIR - TOTPENIR + ACPASIR) * max(0,IRCUM-PIR)
              + (1 - positif_ou_nul(TOTIRCUM - RECUMIR - TOTPENIR + ACPASIR)) * (TOTIRCUM - RECUMIR - TOTPENIR + ACPASIR));

PIRNETNEG =  (1-ANNUL2042) * max(0,PIR-IRCUM);

ILITAXANET = (1-ANNUL2042) * (positif_ou_nul(TOTIRCUM - RECUMIR - TOTPENIR + ACPASIR) * max(0,TAXACUM - PTAXA - PIRNETNEG)
	       + (1 - positif_ou_nul(TOTIRCUM - RECUMIR - TOTPENIR + ACPASIR)) * 0);

PTAXANETNEG =  (1-ANNUL2042) * max(0,PIR+PTAXA-IRCUM-TAXACUM);

ILICAPNET = (1-ANNUL2042) * (positif_ou_nul(TOTIRCUM - RECUMIR - TOTPENIR + ACPASIR) * max(0,PCAPCUM -PPCAP-PTAXANETNEG)
	       + (1 - positif_ou_nul(TOTIRCUM - RECUMIR - TOTPENIR + ACPASIR)) * 0);

PPCAPNETNEG =  (1-ANNUL2042) * max(0,PIR+PTAXA+PPCAP-IRCUM-TAXACUM-PCAPCUM);

ILICHRNET = (1-ANNUL2042) * (positif_ou_nul(TOTIRCUM - RECUMIR - TOTPENIR + ACPASIR) * max(0,HAUTREVCUM-PHAUTREV-PPCAPNETNEG) 
	       + (1 - positif_ou_nul(TOTIRCUM - RECUMIR - TOTPENIR + ACPASIR)) * 0);

ILITOTIRNET = (1 - ANNUL2042) * (ILIIRNET + ILITAXANET + ILICAPNET + ILICHRNET) ;

ILITOTPSNET = (1 - ANNUL2042) * max(0, NAPCRB61 - TOTPENCS) ;

TOTTP = TTPVQ + REVTP ;

TOTIRE = IREP - ITRED - IRE - INE ;
regle 201130:
application : iliad ;


MAJOTOT28IR = NMAJ1     +
               NMAJTAXA1 +
               NMAJPCAP1 +
               NMAJCHR1 ;

MAJOTOT28PS = NMAJC1 +
               NMAJR1    +
                NMAJPSOL1    +
                NMAJCVN1  +
                NMAJCDIS1 +
                NMAJC8201 +
                NMAJGLO1  +
                NMAJRSE11 +
                NMAJRSE21 +
                NMAJRSE31 +
                NMAJRSE41 +
                NMAJRSE51 +
                NMAJRSE61 +
                NMAJRSE81 ;
MAJO1728TOT = MAJOTOT28IR + MAJOTOT28PS ;

