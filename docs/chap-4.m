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
                                                                    #
 ####   #    #    ##    #####      #     #####  #####   ######      #    
 ####   #    #  #    #  #          #       #    #    #  ######           #
regle 401000:
application : bareme , iliad ;


IRB = IAMD2 ; 
IRBINR = IAMD2INR ; 
IRB2 = IAMD2 + TAXASSUR + IPCAPTAXTOT + CHRAPRES ;

regle 401020:
application : bareme , iliad ;


IAMD1 = IAD11 + IBATMARG + ITP + PVMTS + REI + AVFISCOPTER + AUTOVERSSUP + IMPETAL19 + IMPETAL20 + IMPETAL21 + IMPETAL22 + IMPETAL23
        + COD8UA + COD8UB + TAXASSUR + IPCAPTAXTOT + CHRAPRES + BRASAR + NRINET + IMPRET + CODZRA ;

regle 401023:
application : bareme , iliad ;

IRBAF = IAD11  + ITP + PVMTS + REI + AUTOVERSSUP + IMPETAL19 + IMPETAL20 + IMPETAL21 + IMPETAL22 + IMPETAL23 + COD8UA + COD8UB;

regle 401025:
application : bareme , iliad ;

IAMD2 = IAD11 + IBATMARG + ITP + PVMTS + REI + AVFISCOPTER + AUTOVERSSUP + IMPETAL19 + IMPETAL20 + IMPETAL21 + IMPETAL22 + IMPETAL23 + COD8UA + COD8UB ;
IAMD2INR = IAD11INR + IBATMARG + ITP + PVMTS + REI + AVFISCOPTER + AUTOVERSSUP + IMPETAL19 + IMPETAL20 + IMPETAL21 + IMPETAL22 + IMPETAL23 + COD8UA + COD8UB ;
IAMD2TH = positif_ou_nul(IAMD2 - SEUIL_61) * IAMD2 ;


regle 401030:
application : bareme , iliad ;
IAVIM2 = IAMD1 + PTOT + PTAXA + PPCAP + PHAUTREV + CDHR;

regle 401060:
application : iliad ;

DOMITPD = arr(BN1 + SPEPV + BI12F + BA1) * (TX896/100) * positif(V_EAD);
DOMITPG = arr(BN1 + SPEPV + BI12F + BA1) * (TX768/100) * positif(V_EAG);
DOMAVTD = arr((BN1 + SPEPV + BI12F + BA1) * (TX128 - TX896)/100) * positif(V_EAD);
DOMAVTG = arr((BN1 + SPEPV + BI12F + BA1) * (TX128 - TX768)/100) * positif(V_EAG);
DOMAVTO = DOMAVTD + DOMAVTG;
DOMABDB = max(PLAF_RABDOM - ABADO , 0) * positif(V_EAD)
          + max(PLAF_RABGUY - ABAGU , 0) * positif(V_EAG);
DOMDOM = max(DOMAVTO - DOMABDB , 0) * positif(V_EAD + V_EAG);
ITP = 
        arr((BPTP4 * TX30/100) 
       +  DOMITPD + DOMITPG
       +(BPTP3 * TX128/100)
       + (BPTP10 * TX10/100)
       + (BPTP40 * TX41/100)
       + DOMDOM * positif(V_EAD + V_EAG)
       + (BPTP18 * TX18/100)
       + (BPTP5 * TX128/100) * positif(FLAG_EXIT)
       + (BPTPSJ * TX19/100)
       + (BPTPWI * TX24/100)
       + (BPTPWJ * TX19/100)
       + (BPTPPI * TX50/100)
       + IMPOT75
       + (BPTP24 * TX24/100)
	  )
       * (1 - positif(present(TAX1649)+present(RE168))) ; 

regle 401070:
application : iliad ;


REVTP = BPTP4 + BPTP3 + BPTP10 + BPTP40 + BPTP18 + (BPTP5 * positif(FLAG_EXIT)) + BPTPSJ + BPTPWI + BPTPWJ + BPTPPI + RCMIMPTR + BPTP24 + BPTPD + BPTPG ;

regle 401080:
application : iliad ;


BPTP3 =(BTP3A*(1 - positif(V_EAD + V_EAG)) + (1-positif(COD2OP))*(BTPM3VG+BTPM3UA+BPTPSB+BTPM3TJ+COD3SZ+RCMIMPTN+BPTPVT)+ (1-positif(COD3CN))*COD3AN)*(1-positif(present(TAX1649)+present(RE168)));


BPTP10 = PVINDUSPBIC + PVINDUSNPBIC  + PVINDUSPBNC + PVINDUSBA ;
 
regle 401085:
application : iliad ;

BTP3A =(BN1 + SPEPV + BI12F + BA1 );
BPTPD = BTP3A * positif(V_EAD)*(1-positif(present(TAX1649)+present(RE168)));
BPTPG = BTP3A * positif(V_EAG)*(1-positif(present(TAX1649)+present(RE168)));
BTP3G = BPVRCM;


BTPM3VG =(1-positif(COD2OP))*BPVRCM * (1-positif(present(TAX1649)+present(RE168)))  
                      + positif (COD2OP)* (max(0,(BPVRCM-COD3SG))) * (1-positif(present(TAX1649)+present(RE168))); 

BTPM3UA =(1-positif(COD2OP))*(max(0,(COD3UA-ABDETPLUS)))*(1-positif(present(TAX1649)+present(RE168)))
         +(positif(COD2OP)) * ((max(0,(COD3UA-ABDETPLUS-COD3SL)))* (1-positif(present(TAX1649)+present(RE168))));

BTPM3TJ =(1-positif(COD2OP))*(max(0,(COD3TJ-COD3TK)))*(1-positif(present(TAX1649)+present(RE168)))
         +(positif(COD2OP)) * ((max(0,(COD3TJ-COD3TK)))* (1-positif(present(TAX1649)+present(RE168))));

BPTPWI = COD3WI * (1-positif(present(TAX1649)+present(RE168))) ;

BPTPWJ = COD3WJ * (1-positif(present(TAX1649)+present(RE168))) ;

BPTPVT = GAINPEA * (1-positif(COD2OP)) *(1-positif(present(TAX1649)+present(RE168)));

BPTP18 = BPV18V * (1-positif(present(TAX1649)+present(RE168))) ;

BPTP4 = (BPCOPTV + BPVSK) * (1 - positif(present(TAX1649) + present(RE168))) ;
BPTP4I = BPCOPTV * (1 - positif(present(TAX1649) + present(RE168))) ;

BPTP40 = BPV40V * (1-positif(present(TAX1649)+present(RE168))) ;

BPTP5 = (PVIMPOS * (1-positif(present(TAX1649)+present(RE168))) + PVSURSI) * (1-present(COD2OP));

BPTPSJ = BPVSJ * (1-positif(present(TAX1649)+present(RE168))) ;
BPTPSK = BPVSK * (1-positif(present(TAX1649)+present(RE168)));



BPTPSB = PVTAXSB * (1-positif(present(TAX1649)+present(RE168))) ;

BTPM3SB  = BPTPSB *(1-positif(present(TAX1649)+present(RE168))) ;

BTPM3SZ = COD3SZ * (1-positif(present(TAX1649)+present(RE168)));

BPTPPI = COD3PI  * (1-positif(present(TAX1649)+present(RE168))) ;
BPTP19 = BPVSJ * (1 - positif(present(TAX1649) + present(RE168))) ;

BPTP24 = RCM2FA * (1 - positif(present(TAX1649) + present(RE168))) * (1 - V_CNR) ;
ITPRCM =( arr(BPTP24 * TX24/100));

BPT19 = BPTP19 + BPTPWJ ;

BPT24 = BPTP24 + BPTPWI ;

regle 401090:
application : iliad ;


REI = IPREP + IPPRICORSE ;

regle 401100:
application : bareme , iliad ;

IAD11 = ( max(0,IDOM11-DEC11-RED) *(1-positif(V_CNR))
        + positif(V_CNR) *max(0 , IDOM11 - RED) )
                                * (1-positif(RE168+TAX1649))
        + positif(RE168+TAX1649) * (IDOM16 - DEC6); 
IAD11INR = ( max(0,IDOM11-DEC11-RED_1) *(1-positif(V_CNR))
        + positif(V_CNR) *max(0 , IDOM11 - RED_1) )
                                * (1-positif(RE168+TAX1649))
        + positif(RE168+TAX1649) * (IDOM16 - DEC6); 
IAD13 = ( max(0,IDOM13-DEC13) *(1-positif(V_CNR))
        + positif(V_CNR) *max(0 , IDOM13 - RED3WG) )
                                * (1-positif(RE168+TAX1649))
        + positif(RE168+TAX1649) * IDOM16 ;

regle 401105:
application : bareme , iliad ;

3WBHORBAR = arr(PVIMPOS * positif(1-COD2OP) * TX128/100) * (1 - V_CNR);
3WAHORBAR = arr(PVSURSI * positif(1-COD2OP) * TX128/100) * (1 - V_CNR);
regle 401112:
application : bareme , iliad ;

IREXITI = present(FLAG_EXIT) * abs(IAD11 - V_ID113WB) * positif(positif(PVIMPOS)+positif(CODRWB)) * (1 - V_CNR) * positif(COD2OP) + 3WBHORBAR;

IREXITS = (
           abs(V_ID113WA-V_ID113WB) * positif(positif(PVIMPOS)+positif(CODRWB))
         + abs(V_ID113WA-IAD11) * (1-positif(positif(PVIMPOS)+positif(CODRWB)))
          ) 
          * present(FLAG_EXIT) * positif(positif(PVSURSI)+positif(CODRWA))
          * (1 - V_CNR) * positif(COD2OP) + 3WAHORBAR;


regle 401113:
application : bareme , iliad ;
EXITTAX3 = (V_ID113WB * positif(positif(PVIMPOS)+positif(CODRWB)) + NAPTIR * positif(positif(PVSURSI)+positif(CODRWA)) * (1-positif(positif(PVIMPOS)+positif(CODRWB)))) * (1 - V_CNR) ;


PVCREA = PVSURSI + CODRWA ;

PVCREB = PVIMPOS + CODRWB ;
regle 401115:
application : bareme , iliad ;



PVMTS =arr(COD3WR + COD3WS) ;

regle 401120:
application : bareme , iliad ;

IREXIT = IREXITI + IREXITS;
regle 401140:
application : bareme , iliad ;


DEC11 = min(max(arr((SEUIL_DECOTE1 * (1 - BOOL_0AM)) + (SEUIL_DECOTE2 * BOOL_0AM) - (IDOM11 * 45.25/100)) , 0) , IDOM11) * (1 - V_CNR) ;

DEC12 = min(max(arr((SEUIL_DECOTE1 * (1 - BOOL_0AM)) + (SEUIL_DECOTE2 * BOOL_0AM) - (IDOM12 * 45.25/100)) , 0) , IDOM12) * (1 - V_CNR) ;

DEC13 = min(max(arr((SEUIL_DECOTE1 * (1 - BOOL_0AM)) + (SEUIL_DECOTE2 * BOOL_0AM) - (IDOM13 * 45.25/100)) , 0) , IDOM13) * (1 - V_CNR) ;

DEC6 = min(max(arr((SEUIL_DECOTE1 * (1 - BOOL_0AM)) + (SEUIL_DECOTE2 * BOOL_0AM) - (IDOM16 * 45.25/100)) , 0) , IDOM16) * (1 - V_CNR) ;

regle 401150:
application : iliad ;

ART1731BIS = positif(positif(SOMMERI_2+SOMMEBIC_2+SOMMEBA_2+SOMMEBNC_2+SOMMELOC_2+SOMMERF_2+SOMMERCM_2+SOMMEMOND_2+SOMMEGLOBAL_2) + PREM8_11) ;

regle 401160:
application : iliad ;

      
RED =  RREPA + RDONDJ + RDONDO +  RLOCANAH + RDIFAGRI + RPRESSE + RFORET + RFIPDOM 
      + RFIPC + RCINE + RRESTIMO 
      + RSOCREPR + RRPRESCOMP + RHEBE + RSURV + RINNO + RSOUFIP
      + RRIRENOV + RLOGDOM + RCOMP + RRETU + RDONS + CRDIE
      + RDUFREP + RPINELTOT + RNORMTOT + RNOUV + RPENTOT  
      + RREHAB + RRESTREP + RRESTIMO1
      + RCELTOT + RLOCNPRO + RPTZM 
      + RDOMSOC1 + RLOGSOC + RCOLENT + RLOCENT;
RED_1 =  RREPA_1  + RDONDJ_1 + RDONDO_1 + RLOCANAH_1 + RDIFAGRI_1 + RPRESSE_1 + RFORET_1 + RFIPDOM_1 
      + RFIPC_1 + RCINE_1 + RRESTIMO_1 
      + RSOCREPR_1 + RRPRESCOMP_1 + RHEBE_1 + RSURV_1 + RINNO_1 + RSOUFIP_1
      + RRIRENOV_1 + RLOGDOM_1 + RCOMP_1 + RRETU_1 + RDONS_1 + CRDIE
      + ADUFREPFV_1 + ADUFREPFW_1 + ADUFREPFX_1 + ADUFREPFU_1
      + RPINELTOT_1 + RNORMTOT_1 + RNOUV_1 + RPENTOT_1 
      + RREHAB_1 + RRESTREP_1 + RRESTIMO1_1
      + RCELTOT_1 + RLOCNPRO_1 + RPTZM_1 
      + RDOMSOC1_1 + RLOGSOC_1 + RCOLENT_1 + RLOCENT_1
       ;

REDTL = ASURV + ACOMP ;

CIMPTL = ATEC + TOTBGE ;


regle 401170:
application : bareme ;

RED = V_9UY ;

regle 401180:
application : iliad ;

DPRESSE = COD7MY + COD7MX ;

APRESSE_1 = (min(COD7MY , LIM10000 * (1 + BOOL_0AM)) + min(COD7MX , max(0 , LIM10000 * (1 + BOOL_0AM) - COD7MY))) * (1 - V_CNR) ;
APRESSE = positif(null(V_IND_TRAIT-4)+COD9ZA) * (APRESSE_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(APRESSE_1,max(max(APRESSE_P,APRESSE_PA),APRESSE1731))*(1-V_INDTEO)+APRESSE_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RAPRESSE = arr(min(COD7MY , LIM10000 * (1 + BOOL_0AM)) * TX50/100 + min(COD7MX , max(0 , LIM10000 * (1 + BOOL_0AM) - COD7MY)) * TX30/100) * (1 - V_CNR) ;

RPRESSE_1 = max(min(RAPRESSE , IDOM11-DEC11-RREPA- RDONDJ - RDONDO - RLOCANAH -RDIFAGRI) , 0) ;
RPRESSE =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RPRESSE_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RPRESSE_1,max(max(RPRESSE_P,RPRESSE_PA),RPRESSE1731))*(1-V_INDTEO)+RPRESSE_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401185:
application : iliad ;

DFORET = FORET ;

AFORET_1 = min(DFORET , LIM_FORET) * (1 - V_CNR) ;

AFORET = positif(null(V_IND_TRAIT-4)+COD9ZA) * (AFORET_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
         + (max(0,min(AFORET_1,max(max(AFORET_P,AFORET_PA),AFORET1731))*(1-V_INDTEO)+AFORET_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RAFORET = arr(AFORET * TX_FORET/100) * (1 - V_CNR) ;

RFORET_1 = max(min(RAFORET , IDOM11-DEC11-RREPA-RDONDJ- RDONDO - RLOCANAH-RDIFAGRI-RPRESSE) , 0) ;

RFORET =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RFORET_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RFORET_1,max(max(RFORET_P,RFORET_PA),RFORET1731))*(1-V_INDTEO)+RFORET_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401190:
application : iliad ;

DFIPDOM = FIPDOMCOM ;

AFIPDOM_1 = min(FIPDOMCOM , LIMFIPDOM * (1 + BOOL_0AM)) * (1 - V_CNR) ;
AFIPDOM = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AFIPDOM_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(AFIPDOM_1 , max(max(AFIPDOM_P,AFIPDOM_PA),AFIPDOM1731))*(1-V_INDTEO)+AFIPDOM_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

RFIPDOMCOM = arr(min(FIPDOMCOM , LIMFIPDOM * (1 + BOOL_0AM)) * TX30/100) * (1 - V_CNR) ;

RFIPDOM_1 = max(min(RFIPDOMCOM , IDOM11-DEC11-RREPA-RDONDJ- RDONDO - RLOCANAH-RDIFAGRI-RPRESSE-RFORET-RCINE) , 0) ;
RFIPDOM = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RFIPDOM_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RFIPDOM_1 , max(max(RFIPDOM_P,RFIPDOM_PA),RFIPDOM1731))*(1-V_INDTEO)+RFIPDOM_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

regle 401200:
application : iliad ;

DFIPC = FIPCORSE ;

AFIPC_1 = min(FIPCORSE , LIM_FIPCORSE * (1 + BOOL_0AM)) * (1 - V_CNR) ;
AFIPC = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AFIPC_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(AFIPC_1 , max(max(AFIPC_P,AFIPC_PA),AFIPC1731))*(1-V_INDTEO)+AFIPC_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

RFIPCORSE = arr(min(FIPCORSE , LIM_FIPCORSE * (1 + BOOL_0AM)) * TX30/100) * (1 - V_CNR) ;

RFIPC_1 = max(min(RFIPCORSE , IDOM11-DEC11-RREPA-RDONDJ- RDONDO - RLOCANAH-RDIFAGRI-RPRESSE-RFORET-RCINE-RFIPDOM) , 0) ;
RFIPC = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RFIPC_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RFIPC_1 , max(max(RFIPC_P,RFIPC_PA),RFIPC1731))*(1-V_INDTEO)+RFIPC_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

regle 401210:
application : iliad ;

BSURV = min(RDRESU , PLAF_RSURV + PLAF_COMPSURV * (EAC + V_0DN) + PLAF_COMPSURVQAR * (V_0CH + V_0DP)) * (1 - V_CNR) ;

RRS = arr(BSURV * TX_REDSURV / 100) * (1 - V_CNR) ;

DSURV = RDRESU ;

ASURV = positif(null(V_IND_TRAIT-4)+COD9ZA) * (BSURV) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
        + (max(0,min(BSURV,max(max(BSURV_P,BSURV_PA),BSURV1731))*(1-V_INDTEO)+BSURV*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RSURV_1 = max(min(RRS , IDOM11-DEC11-RREPA-RDONDJ- RDONDO-RLOCANAH-RDIFAGRI-RPRESSE-RFORET-RFIPDOM-RFIPC
			            -RCINE-RRESTIMO-RSOCREPR-RRPRESCOMP-RHEBE ) , 0) ;
RSURV =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSURV_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSURV_1,max(max(RSURV_P,RSURV_PA),RSURV1731))*(1-V_INDTEO)+RSURV_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401220:
application : iliad ;


DCINE = COD7EN + CINE1 + CINE2 ;

ACINE_1 = max(0 , min(DCINE , min(arr(max(SOFIRNG,RNG) * TX_CINE3/100) , PLAF_CINE))) * (1 - V_CNR) ;
ACINE = positif(null(V_IND_TRAIT-4)+COD9ZA) * (ACINE_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
        + (max(0,min(ACINE_1,max(max(ACINE_P,ACINE_PA),ACINE1731))*(1-V_INDTEO)+ACINE_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RRCN1 = min(COD7EN , min(arr(max(SOFIRNG , RNG) * TX_CINE3/100) , PLAF_CINE)) ;
RRCN2 = min(CINE1 , max(min(arr(max(SOFIRNG , RNG) * TX_CINE3/100) , PLAF_CINE) - RRCN1 , 0)) ;
RRCN3 = min(CINE2 , max(min(arr(max(SOFIRNG , RNG) * TX_CINE3/100) , PLAF_CINE) - RRCN1 - RRCN2 , 0)) ;

RRCN = arr((RRCN1 * TX48/100) + (RRCN2 * TX_CINE1/100) + (RRCN3 * TX_CINE2/100)) * (1 - V_CNR) ;

RCINE_1 = max(min(RRCN , IDOM11-DEC11-RREPA-RDONDJ-RDONDO-RLOCANAH-RDIFAGRI- RPRESSE - RFORET) , 0) ;
RCINE =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RCINE_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RCINE_1,max(max(RCINE_P,RCINE_PA),RCINE1731))*(1-V_INDTEO)+RCINE_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401230:
application : iliad ;


BSOUFIP = min(FFIP , max(0,LIM_SOUFIP * (1 + BOOL_0AM) ) ) ;

RFIP = arr(BSOUFIP * TX_REDFIP / 100) * (1 - V_CNR) ;

DSOUFIP = FFIP ;

ASOUFIP_1 = (BSOUFIP) * (1 - V_CNR) ;
ASOUFIP = positif(null(V_IND_TRAIT-4)+COD9ZA) * (ASOUFIP_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(ASOUFIP_1,max(max(ASOUFIP_P,ASOUFIP_PA),ASOUFIP1731))*(1-V_INDTEO)+ASOUFIP_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RSOUFIP_1 = max(min(RFIP , IDOM11-DEC11-RREPA-RDONDJ-RDONDO-RLOCANAH-RDIFAGRI-RPRESSE-RFORET-RFIPDOM-RFIPC
			   -RCINE-RRESTIMO-RSOCREPR-RRPRESCOMP-RHEBE-RSURV-RINNO) , 0 ) ;
RSOUFIP =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSOUFIP_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSOUFIP_1,max(max(RSOUFIP_P,RSOUFIP_PA),RSOUFIP1731))*(1-V_INDTEO)+RSOUFIP_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401240:
application : iliad ;


BRENOV = min(RIRENOV , PLAF_RENOV) * (1 - V_CNR) ;

RENOV = arr(BRENOV * TX_RENOV / 100) * (1 - V_CNR) ;

DRIRENOV = RIRENOV ;

ARIRENOV = positif(null(V_IND_TRAIT-4)+COD9ZA) * (BRENOV) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(BRENOV,max(max(BRENOV_P,BRENOV_PA),BRENOV1731))*(1-V_INDTEO)+BRENOV*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RRIRENOV_1 = max(min(RENOV , IDOM11-DEC11-RREPA-RDONDJ-RDONDO-RLOCANAH-RDIFAGRI-RPRESSE-RFORET-RFIPDOM-RFIPC-RCINE
			     -RRESTIMO-RSOCREPR-RRPRESCOMP-RHEBE-RSURV-RINNO-RSOUFIP) , 0 ) ;
RRIRENOV =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RRIRENOV_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RRIRENOV_1,max(max(RRIRENOV_P,RRIRENOV_PA),RRIRENOV1731))*(1-V_INDTEO)+RRIRENOV_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401250:
application : iliad ;


NCOMP = max(1 , NBACT) * present(RDCOM) ;

DCOMP = RDCOM ;
ACOMP_1 = min(RDCOM , PLAF_FRCOMPTA * max(1 , NBACT)) * present(RDCOM) ;
ACOMP = positif(null(V_IND_TRAIT-4)+COD9ZA) * (ACOMP_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
        + (max(0,min(ACOMP_1,max(max(ACOMP_P,ACOMP_PA),ACOMP1731))*(1-V_INDTEO)+ACOMP_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401260:
application : iliad ;

RCOMP_1 = max(min(ACOMP , RRI1 - RLOGDOM) , 0) ;
RCOMP =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RCOMP_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RCOMP_1,max(max(RCOMP_P,RCOMP_PA),RCOMP1731))*(1-V_INDTEO)+RCOMP_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401265:
application : iliad ;

CONDPINEL = 1 - (null(2 - V_REGCO) + null(3 - V_REGCO) * V_INDVB31) * (1 - positif(COD7QH)) ;
CONDNORMD = 1 - (null(2 - V_REGCO) + null(3 - V_REGCO) * V_INDVB31) * (1 - positif(COD7QF)) ;

regle 401270:
application : iliad ;


ADUFREPFV_1 = (min(DUFLOFV , LIMREPDUF) * (1 - COD7QV) + DUFLOFV * COD7QV) * (1 - V_CNR) ;
ADUFREPFV = positif(null(V_IND_TRAIT-4)+COD9ZA) * (ADUFREPFV_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
            + (max(0,min(ADUFREPFV_1,max(max(ADUFREPFV_P,ADUFREPFV_PA),ADUFREPFV1731))*(1-V_INDTEO)+ADUFREPFV_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

ADUFREPFW_1 = (min(COD7FW , LIMREPDUF) * (1 - COD7QV) + COD7FW * COD7QV) * (1 - V_CNR) ;
ADUFREPFW = positif(null(V_IND_TRAIT-4)+COD9ZA) * (ADUFREPFW_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
            + (max(0,min(ADUFREPFW_1,max(max(ADUFREPFW_P,ADUFREPFW_PA),ADUFREPFW1731))*(1-V_INDTEO)+ADUFREPFW_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

ADUFREPFX_1 = (min(COD7FX , LIMREPDUF) * (1 - COD7QV) + COD7FX * COD7QV) * (1 - V_CNR) ;
ADUFREPFX = positif(null(V_IND_TRAIT-4)+COD9ZA) * (ADUFREPFX_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
            + (max(0,min(ADUFREPFX_1,max(max(ADUFREPFX_P,ADUFREPFX_PA),ADUFREPFX1731))*(1-V_INDTEO)+ADUFREPFX_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

ADUFREPFU_1 = (min(COD7FU , LIMREPDUF) * (1 - COD7QV) + COD7FU * COD7QV) * (1 - V_CNR) ;
ADUFREPFU = positif(null(V_IND_TRAIT-4)+COD9ZA) * (ADUFREPFU_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
            + (max(0,min(ADUFREPFU_1,max(max(ADUFREPFU_P,ADUFREPFU_PA),ADUFREPFU1731))*(1-V_INDTEO)+ADUFREPFU_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

DDUFREP = DUFLOFV + COD7FW + COD7FX + COD7FU ;
ADUFREP = ADUFREPFV + ADUFREPFW + ADUFREPFX + ADUFREPFU ;

regle 401272:
application : iliad ;


APIREPRZ_1 = (min(PINELRZ , LIMREPPIN4) * (1 - COD7QV) + PINELRZ * COD7QV) * (1 - V_CNR) ;
APIREPRZ = positif(null(V_IND_TRAIT-4)+COD9ZA) * APIREPRZ_1 * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(APIREPRZ_1,max(max(APIREPRZ_P,APIREPRZ_PA),APIREPRZ1731))*(1-V_INDTEO)+APIREPRZ_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

APIREPTZ_1 = (min(PINELTZ , LIMREPPIN5) * (1 - COD7QV) + PINELTZ * COD7QV) * (1 - V_CNR) ;
APIREPTZ = positif(null(V_IND_TRAIT-4)+COD9ZA) * APIREPTZ_1 * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(APIREPTZ_1,max(max(APIREPTZ_P,APIREPTZ_PA),APIREPTZ1731))*(1-V_INDTEO)+APIREPTZ_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

APIREPRB_1 = (min(COD7RB , LIMREPPIN4) * (1 - COD7QV) + COD7RB * COD7QV) * (1 - V_CNR) ;
APIREPRB = positif(null(V_IND_TRAIT-4)+COD9ZA) * APIREPRB_1 * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(APIREPRB_1,max(max(APIREPRB_P,APIREPRB_PA),APIREPRB1731))*(1-V_INDTEO)+APIREPRB_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

APIREPRD_1 = (min(COD7RD , LIMREPPIN5) * (1 - COD7QV) + COD7RD * COD7QV) * (1 - V_CNR) ;
APIREPRD = positif(null(V_IND_TRAIT-4)+COD9ZA) * APIREPRD_1 * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(APIREPRD_1,max(max(APIREPRD_P,APIREPRD_PA),APIREPRD1731))*(1-V_INDTEO)+APIREPRD_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

APIREPRF_1 = (min(COD7RF , LIMREPPIN4) * (1 - COD7QV) + COD7RF * COD7QV) * (1 - V_CNR) ;
APIREPRF = positif(null(V_IND_TRAIT-4)+COD9ZA) * APIREPRF_1 * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(APIREPRF_1,max(max(APIREPRF_P,APIREPRF_PA),APIREPRF1731))*(1-V_INDTEO)+APIREPRF_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

APIREPRH_1 = (min(COD7RH , LIMREPPIN5) * (1 - COD7QV) + COD7RH * COD7QV) * (1 - V_CNR) ;
APIREPRH = positif(null(V_IND_TRAIT-4)+COD9ZA) * APIREPRH_1 * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(APIREPRH_1,max(max(APIREPRH_P,APIREPRH_PA),APIREPRH1731))*(1-V_INDTEO)+APIREPRH_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

APIREPJM_1 = (min(COD7JM , LIMREPPIN1) * (1 - COD7QV) + COD7JM * COD7QV) * CONDPINEL ;
APIREPJM = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIREPJM_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIREPJM_1 , max(max(APIREPJM_P,APIREPJM_PA),APIREPJM1731))*(1-V_INDTEO)+APIREPJM_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIREPKM_1 = (min(COD7KM , LIMREPPIN1) * (1 - COD7QV) + COD7KM * COD7QV) * CONDPINEL ;
APIREPKM = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIREPKM_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIREPKM_1 , max(max(APIREPKM_P,APIREPKM_PA),APIREPKM1731))*(1-V_INDTEO)+APIREPKM_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIREPLM_1 = (min(COD7LM , LIMREPPIN3) * (1 - COD7QV) + COD7LM * COD7QV) * CONDPINEL ;
APIREPLM = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIREPLM_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIREPLM_1 , max(max(APIREPLM_P,APIREPLM_PA),APIREPLM1731))*(1-V_INDTEO)+APIREPLM_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIREPMM_1 = (min(COD7MM , LIMREPPIN2) * (1 - COD7QV) + COD7MM * COD7QV) * CONDPINEL ;
APIREPMM = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIREPMM_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIREPMM_1 , max(max(APIREPMM_P,APIREPMM_PA),APIREPMM1731))*(1-V_INDTEO)+APIREPMM_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIREPJN_1 = (min(COD7JN , LIMREPPIN1) * (1 - COD7QV) + COD7JN * COD7QV) * CONDPINEL ;
APIREPJN = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIREPJN_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIREPJN_1 , max(max(APIREPJN_P,APIREPJN_PA),APIREPJN1731))*(1-V_INDTEO)+APIREPJN_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIREPJO_1 = (min(COD7JO , LIMREPPIN1) * (1 - COD7QV) + COD7JO * COD7QV) * CONDPINEL ;
APIREPJO = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIREPJO_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIREPJO_1 , max(max(APIREPJO_P,APIREPJO_PA),APIREPJO1731))*(1-V_INDTEO)+APIREPJO_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIREPJP_1 = (min(COD7JP , LIMREPPIN3) * (1 - COD7QV) + COD7JP * COD7QV) * CONDPINEL ;
APIREPJP = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIREPJP_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIREPJP_1 , max(max(APIREPJP_P,APIREPJP_PA),APIREPJP1731))*(1-V_INDTEO)+APIREPJP_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIREPJQ_1 = (min(COD7JQ , LIMREPPIN2) * (1 - COD7QV) + COD7JQ * COD7QV) * CONDPINEL ;
APIREPJQ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIREPJQ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIREPJQ_1 , max(max(APIREPJQ_P,APIREPJQ_PA),APIREPJQ1731))*(1-V_INDTEO)+APIREPJQ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIJV_1 = (min(COD7JV , LIMREPPIN1) * (1 - COD7QV) + COD7JV * COD7QV) * CONDPINEL ;
APIJV = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIJV_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIJV_1 , max(max(APIJV_P,APIJV_PA),APIJV1731))*(1-V_INDTEO)+APIJV_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIJW_1 = (min(COD7JW , LIMREPPIN1) * (1 - COD7QV) + COD7JW * COD7QV) * CONDPINEL ;
APIJW = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIJW_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIJW_1 , max(max(APIJW_P,APIJW_PA),APIJW1731))*(1-V_INDTEO)+APIJW_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIJX_1 = (min(COD7JX , LIMREPPIN3) * (1 - COD7QV) + COD7JX * COD7QV) * CONDPINEL ;
APIJX = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIJX_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIJX_1 , max(max(APIJX_P,APIJX_PA),APIJX1731))*(1-V_INDTEO)+APIJX_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIJY_1 = (min(COD7JY , LIMREPPIN2) * (1 - COD7QV) + COD7JY * COD7QV) * CONDPINEL ;
APIJY = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIJY_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIJY_1 , max(max(APIJY_P,APIJY_PA),APIJY1731))*(1-V_INDTEO)+APIJY_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIJI_1 = (min(COD7JI , LIMREPPIN1) * (1 - COD7QV) + COD7JI * COD7QV) * CONDPINEL ;
APIJI = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIJI_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIJI_1 , max(max(APIJI_P,APIJI_PA),APIJI1731))*(1-V_INDTEO)+APIJI_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIJJ_1 = (min(COD7JJ , LIMREPPIN1) * (1 - COD7QV) + COD7JJ * COD7QV) * CONDPINEL ;
APIJJ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIJJ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIJJ_1 , max(max(APIJJ_P,APIJJ_PA),APIJJ1731))*(1-V_INDTEO)+APIJJ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIJK_1 = (min(COD7JK , LIMREPPIN3) * (1 - COD7QV) + COD7JK * COD7QV) * CONDPINEL ;
APIJK = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIJK_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIJK_1 , max(max(APIJK_P,APIJK_PA),APIJK1731))*(1-V_INDTEO)+APIJK_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIJL_1 = (min(COD7JL , LIMREPPIN2) * (1 - COD7QV) + COD7JL * COD7QV) * CONDPINEL ;
APIJL = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIJL_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIJL_1 , max(max(APIJL_P,APIJL_PA),APIJL1731))*(1-V_INDTEO)+APIJL_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIIA_1 = (min(COD7IA , LIMREPPIN1) * (1 - COD7QV) + COD7IA * COD7QV) * CONDPINEL ;
APIIA = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIIA_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIIA_1 , max(max(APIIA_P,APIIA_PA),APIIA1731))*(1-V_INDTEO)+APIIA_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIIB_1 = (min(COD7IB , LIMREPPIN1) * (1 - COD7QV) + COD7IB * COD7QV) * CONDPINEL ;
APIIB = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIIB_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIIB_1 , max(max(APIIB_P,APIIB_PA),APIIB1731))*(1-V_INDTEO)+APIIB_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIIC_1 = (min(COD7IC , LIMREPPIN3) * (1 - COD7QV) + COD7IC * COD7QV) * CONDPINEL ;
APIIC = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIIC_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIIC_1 , max(max(APIIC_P,APIIC_PA),APIIC1731))*(1-V_INDTEO)+APIIC_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIID_1 = (min(COD7ID , LIMREPPIN2) * (1 - COD7QV) + COD7ID * COD7QV) * CONDPINEL ;
APIID = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIID_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(APIID_1 , max(max(APIID_P,APIID_PA),APIID1731))*(1-V_INDTEO)+APIID_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DPIREP = PINELRZ + PINELTZ + COD7RB + COD7RD + COD7RF + COD7RH + COD7JM + COD7KM + COD7LM + COD7MM + COD7JN + COD7JO + COD7JP + COD7JQ 
	 + COD7JV + COD7JW + COD7JX + COD7JY + COD7JI + COD7JJ + COD7JK + COD7JL + COD7IA + COD7IB + COD7IC + COD7ID ;

APIREP = APIREPRZ + APIREPTZ + APIREPRB + APIREPRD + APIREPRF + APIREPRH + APIREPJM + APIREPKM + APIREPLM + APIREPMM + APIREPJN + APIREPJO + APIREPJP + APIREPJQ 
	 + APIJV + APIJW + APIJX + APIJY + APIJI + APIJJ + APIJK + APIJL + APIIA + APIIB + APIIC + APIID ;

regle 401273:
application : iliad ;


APIPK_1 = (min(COD7PK , LIMREPPIN4) * (1 - COD7QV) + COD7PK * COD7QV) * (1 - V_CNR) ;
APIPK = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIPK_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(APIPK_1 , max(max(APIPK_P,APIPK_PA),APIPK1731))*(1-V_INDTEO)+APIPK_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIPL_1 = (min(COD7PL , LIMREPPIN5) * (1 - COD7QV) + COD7PL * COD7QV) * (1 - V_CNR) ;
APIPL = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIPL_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(APIPL_1 , max(max(APIPL_P,APIPL_PA),APIPL1731))*(1-V_INDTEO)+APIPL_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIPM_1 = (min(COD7PM , LIMREPPIN4) * (1 - COD7QV) + COD7PM * COD7QV) * (1 - V_CNR) ;
APIPM = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIPM_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(APIPM_1 , max(max(APIPM_P,APIPM_PA),APIPM1731))*(1-V_INDTEO)+APIPM_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIPN_1 = (min(COD7PN , LIMREPPIN5) * (1 - COD7QV) + COD7PN * COD7QV) * (1 - V_CNR) ;
APIPN = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIPN_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(APIPN_1 , max(max(APIPN_P,APIPN_PA),APIPN1731))*(1-V_INDTEO)+APIPN_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DPROPIREP = COD7PK + COD7PL + COD7PM + COD7PN ;
APROPIREP = APIPK + APIPL + APIPM + APIPN ;


APIOF_1 = (min(COD7OF , LIMREPPIN4) * (1 - COD7QV) + COD7OF * COD7QV) * (1 - V_CNR) ;
APIOF = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIOF_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(APIOF_1 , max(max(APIOF_P,APIOF_PA),APIOF1731))*(1-V_INDTEO)+APIOF_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIOG_1 = (min(COD7OG , LIMREPPIN5) * (1 - COD7QV) + COD7OG * COD7QV) * (1 - V_CNR) ;
APIOG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIOG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(APIOG_1 , max(max(APIOG_P,APIOG_PA),APIOG1731))*(1-V_INDTEO)+APIOG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APINA_1 = (min(COD7NA , LIMREPPIN4) * (1 - COD7QV) + COD7NA * COD7QV) * (1 - V_CNR) ;
APINA = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APINA_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(APINA_1 , max(max(APINA_P,APINA_PA),APINA1731))*(1-V_INDTEO)+APINA_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APINB_1 = (min(COD7NB , LIMREPPIN5) * (1 - COD7QV) + COD7NB * COD7QV) * (1 - V_CNR) ;
APINB = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APINB_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(APINB_1 , max(max(APINB_P,APINB_PA),APINB1731))*(1-V_INDTEO)+APINB_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APINC_1 = (min(COD7NC , LIMREPPIN4) * (1 - COD7QV) + COD7NC * COD7QV) * (1 - V_CNR) ;
APINC = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APINC_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(APINC_1 , max(max(APINC_P,APINC_PA),APINC1731))*(1-V_INDTEO)+APINC_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APIND_1 = (min(COD7ND , LIMREPPIN5) * (1 - COD7QV) + COD7ND * COD7QV) * (1 - V_CNR) ;
APIND = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APIND_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(APIND_1 , max(max(APIND_P,APIND_PA),APIND1731))*(1-V_INDTEO)+APIND_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DPROPIREP1 = COD7OF + COD7OG + COD7NA + COD7NB + COD7NC + COD7ND ;
APROPIREP1 = APIOF + APIOG + APINA + APINB + APINC + APIND ;


APISY_1 = (min(COD7SY , LIMREPPIN4) * (1 - COD7QV) + COD7SY * COD7QV) * (1 - V_CNR) ;
APISY = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APISY_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(APISY_1 , max(max(APISY_P,APISY_PA),APISY1731))*(1-V_INDTEO)+APISY_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

APISZ_1 = (min(COD7SZ , LIMREPPIN5) * (1 - COD7QV) + COD7SZ * COD7QV) * (1 - V_CNR) ;
APISZ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * APISZ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(APISZ_1 , max(max(APISZ_P,APISZ_PA),APISZ1731))*(1-V_INDTEO)+APISZ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DPROPIREP2 = COD7SY + COD7SZ ;
APROPIREP2 = APISY + APISZ ;

regle 401274:
application : iliad ;


ANORMJA_1 = (min(COD7JA , LIMREPPIN1) * (1 - COD7QV) + COD7JA * COD7QV) * CONDNORMD ;
ANORMJA = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANORMJA_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANORMJA_1 , max(max(ANORMJA_P,ANORMJA_PA),ANORMJA1731))*(1-V_INDTEO)+ANORMJA_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANORMJB_1 = (min(COD7JB , LIMREPPIN1) * (1 - COD7QV) + COD7JB * COD7QV) * CONDNORMD ;
ANORMJB = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANORMJB_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANORMJB_1 , max(max(ANORMJB_P,ANORMJB_PA),ANORMJB1731))*(1-V_INDTEO)+ANORMJB_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANORMJC_1 = (min(COD7JC , LIMREPPIN3) * (1 - COD7QV) + COD7JC * COD7QV) * CONDNORMD ;
ANORMJC = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANORMJC_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANORMJC_1 , max(max(ANORMJC_P,ANORMJC_PA),ANORMJC1731))*(1-V_INDTEO)+ANORMJC_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANORMJD_1 = (min(COD7JD , LIMREPPIN2) * (1 - COD7QV) + COD7JD * COD7QV) * CONDNORMD ;
ANORMJD = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANORMJD_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANORMJD_1 , max(max(ANORMJD_P,ANORMJD_PA),ANORMJD1731))*(1-V_INDTEO)+ANORMJD_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANORMJR_1 = (min(COD7JR , LIMREPPIN1) * (1 - COD7QV) + COD7JR * COD7QV) * CONDNORMD ;
ANORMJR = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANORMJR_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANORMJR_1 , max(max(ANORMJR_P,ANORMJR_PA),ANORMJR1731))*(1-V_INDTEO)+ANORMJR_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANORMJS_1 = (min(COD7JS , LIMREPPIN1) * (1 - COD7QV) + COD7JS * COD7QV) * CONDNORMD ;
ANORMJS = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANORMJS_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANORMJS_1 , max(max(ANORMJS_P,ANORMJS_PA),ANORMJS1731))*(1-V_INDTEO)+ANORMJS_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANORMJT_1 = (min(COD7JT , LIMREPPIN3) * (1 - COD7QV) + COD7JT * COD7QV) * CONDNORMD ;
ANORMJT = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANORMJT_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANORMJT_1 , max(max(ANORMJT_P,ANORMJT_PA),ANORMJT1731))*(1-V_INDTEO)+ANORMJT_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANORMJU_1 = (min(COD7JU , LIMREPPIN2) * (1 - COD7QV) + COD7JU * COD7QV) * CONDNORMD ;
ANORMJU = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANORMJU_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANORMJU_1 , max(max(ANORMJU_P,ANORMJU_PA),ANORMJU1731))*(1-V_INDTEO)+ANORMJU_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANORMLG_1 = (min(COD7LG , LIMREPPIN1) * (1 - COD7QV) + COD7LG * COD7QV) * CONDNORMD ;
ANORMLG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANORMLG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANORMLG_1 , max(max(ANORMLG_P,ANORMLG_PA),ANORMLG1731))*(1-V_INDTEO)+ANORMLG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANORMLH_1 = (min(COD7LH , LIMREPPIN1) * (1 - COD7QV) + COD7LH * COD7QV) * CONDNORMD ;
ANORMLH = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANORMLH_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANORMLH_1 , max(max(ANORMLH_P,ANORMLH_PA),ANORMLH1731))*(1-V_INDTEO)+ANORMLH_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANORMLI_1 = (min(COD7LI , LIMREPPIN3) * (1 - COD7QV) + COD7LI * COD7QV) * CONDNORMD ;
ANORMLI = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANORMLI_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANORMLI_1 , max(max(ANORMLI_P,ANORMLI_PA),ANORMLI1731))*(1-V_INDTEO)+ANORMLI_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANORMLJ_1 = (min(COD7LJ , LIMREPPIN2) * (1 - COD7QV) + COD7LJ * COD7QV) * CONDNORMD ;
ANORMLJ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANORMLJ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANORMLJ_1 , max(max(ANORMLJ_P,ANORMLJ_PA),ANORMLJ1731))*(1-V_INDTEO)+ANORMLJ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANOJE_1 = (min(COD7JE , LIMREPPIN1) * (1 - COD7QV) + COD7JE * COD7QV) * CONDNORMD ;
ANOJE = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANOJE_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANOJE_1 , max(max(ANOJE_P,ANOJE_PA),ANOJE1731))*(1-V_INDTEO)+ANOJE_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANOJF_1 = (min(COD7JF , LIMREPPIN1) * (1 - COD7QV) + COD7JF * COD7QV) * CONDNORMD ;
ANOJF = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANOJF_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANOJF_1 , max(max(ANOJF_P,ANOJF_PA),ANOJF1731))*(1-V_INDTEO)+ANOJF_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANOJG_1 = (min(COD7JG , LIMREPPIN3) * (1 - COD7QV) + COD7JG * COD7QV) * CONDNORMD ;
ANOJG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANOJG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANOJG_1 , max(max(ANOJG_P,ANOJG_PA),ANOJG1731))*(1-V_INDTEO)+ANOJG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANOJH_1 = (min(COD7JH , LIMREPPIN2) * (1 - COD7QV) + COD7JH * COD7QV) * CONDNORMD ;
ANOJH = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANOJH_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANOJH_1 , max(max(ANOJH_P,ANOJH_PA),ANOJH1731))*(1-V_INDTEO)+ANOJH_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANOIE_1 = (min(COD7IE , LIMREPPIN1) * (1 - COD7QV) + COD7IE * COD7QV) * CONDNORMD ;
ANOIE = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANOIE_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANOIE_1 , max(max(ANOIE_P,ANOIE_PA),ANOIE1731))*(1-V_INDTEO)+ANOIE_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANOIF_1 = (min(COD7IF , LIMREPPIN1) * (1 - COD7QV) + COD7IF * COD7QV) * CONDNORMD ;
ANOIF = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANOIF_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANOIF_1 , max(max(ANOIF_P,ANOIF_PA),ANOIF1731))*(1-V_INDTEO)+ANOIF_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANOIG_1 = (min(COD7IG , LIMREPPIN3) * (1 - COD7QV) + COD7IG * COD7QV) * CONDNORMD ;
ANOIG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANOIG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANOIG_1 , max(max(ANOIG_P,ANOIG_PA),ANOIG1731))*(1-V_INDTEO)+ANOIG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ANOIH_1 = (min(COD7IH , LIMREPPIN2) * (1 - COD7QV) + COD7IH * COD7QV) * CONDNORMD ;
ANOIH = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ANOIH_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ANOIH_1 , max(max(ANOIH_P,ANOIH_PA),ANOIH1731))*(1-V_INDTEO)+ANOIH_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DNORMREP = COD7JA + COD7JB + COD7JC + COD7JD + COD7JR + COD7JS + COD7JT + COD7JU + COD7LG + COD7LH + COD7LI + COD7LJ + COD7JE + COD7JF + COD7JG + COD7JH + COD7IE + COD7IF + COD7IG + COD7IH ;
ANORMREP = ANORMJA + ANORMJB + ANORMJC + ANORMJD + ANORMJR + ANORMJS + ANORMJT + ANORMJU + ANORMLG + ANORMLH + ANORMLI + ANORMLJ + ANOJE + ANOJF + ANOJG + ANOJH + ANOIE + ANOIF + ANOIG + ANOIH ;

regle 401276:
application : iliad ;


BAS7QL = min(COD7QL , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7QL ;

BAS7NL = min(COD7NL , LIMDUFLO - VARTMP1) * CONDNORMD ;
VARTMP1 = VARTMP1 + BAS7NL ;

BAS7QP = min(COD7QP , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7QP ;

BAS7PG = min(COD7PG , LIMDUFLO - VARTMP1) * CONDNORMD ;
VARTMP1 = VARTMP1 + BAS7PG ;

BAS7VG = min(COD7VG , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7VG ;

BAS7NR = min(COD7NR , LIMDUFLO - VARTMP1) * CONDNORMD ;
VARTMP1 = VARTMP1 + BAS7NR ;

BAS7QU = min(COD7QU , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7QU ;

BAS7VZ = min(COD7VZ , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7VZ ;

BAS7LT = min(COD7LT , LIMDUFLO - VARTMP1) * CONDNORMD ;
VARTMP1 = VARTMP1 + BAS7LT ;

BAS7SG = min(COD7SG , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7SG ;

BAS7QK = min(COD7QK , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7QK ;

BAS7NK = min(COD7NK , LIMDUFLO - VARTMP1) * CONDNORMD ;
VARTMP1 = VARTMP1 + BAS7NK ;

BAS7QO = min(COD7QO , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7QO ;

BAS7PF = min(COD7PF , LIMDUFLO - VARTMP1) * CONDNORMD ;
VARTMP1 = VARTMP1 + BAS7PF ;

BAS7VF = min(COD7VF , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7VF ;

BAS7NQ = min(COD7NQ , LIMDUFLO - VARTMP1) * CONDNORMD ;
VARTMP1 = VARTMP1 + BAS7NQ ;

BAS7QT = min(COD7QT , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7QT ;

BAS7VY = min(COD7VY , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7VY ;

BAS7LS = min(COD7LS , LIMDUFLO - VARTMP1) * CONDNORMD ;
VARTMP1 = VARTMP1 + BAS7LS ;

BAS7SF = min(COD7SF , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7SF ;

BAS7QJ = min(COD7QJ , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7QJ ;

BAS7NJ = min(COD7NJ , LIMDUFLO - VARTMP1) * CONDNORMD ;
VARTMP1 = VARTMP1 + BAS7NJ ;

BAS7QN = min(COD7QN , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7QN ;

BAS7NN = min(COD7NN , LIMDUFLO - VARTMP1) * CONDNORMD ;
VARTMP1 = VARTMP1 + BAS7NN ;

BAS7VE = min(COD7VE , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7VE ;

BAS7NP = min(COD7NP , LIMDUFLO - VARTMP1) * CONDNORMD ;
VARTMP1 = VARTMP1 + BAS7NP ;

BAS7QS = min(COD7QS , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7QS ;

BAS7VX = min(COD7VX , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7VX ;

BAS7LR = min(COD7LR , LIMDUFLO - VARTMP1) * CONDNORMD ;
VARTMP1 = VARTMP1 + BAS7LR ;

BAS7SE = min(COD7SE , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7SE ;

BAS7QI = min(COD7QI , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7QI ;

BAS7NI = min(COD7NI , LIMDUFLO - VARTMP1) * CONDNORMD ;
VARTMP1 = VARTMP1 + BAS7NI ;

BAS7QM = min(COD7QM , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7QM ;

BAS7NM = min(COD7NM , LIMDUFLO - VARTMP1) * CONDNORMD ;
VARTMP1 = VARTMP1 + BAS7NM ;

BAS7VD = min(COD7VD , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7VD ;

BAS7NO = min(COD7NO , LIMDUFLO - VARTMP1) * CONDNORMD ;
VARTMP1 = VARTMP1 + BAS7NO ;

BAS7QR = min(COD7QR , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7QR ;

BAS7VW = min(COD7VW , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = VARTMP1 + BAS7VW ;

BAS7LQ = min(COD7LQ , LIMDUFLO - VARTMP1) * CONDNORMD ;
VARTMP1 = VARTMP1 + BAS7LQ ;

BAS7SD = min(COD7SD , LIMDUFLO - VARTMP1) * CONDPINEL ;
VARTMP1 = 0 ;

BAS7RR = min(COD7RR , LIMDUFLO) * (1 - V_CNR) ;
BAS7RS = min(COD7RS , LIMDUFLO - BAS7RR) * (1 - V_CNR) ;

BAS7RX = min(COD7RX , LIMDUFLO) * (1 - V_CNR) ;
BAS7RY = min(COD7RY , LIMDUFLO - BAS7RX) * (1 - V_CNR) ;

BAS7WA = min(COD7WA , LIMDUFLO) * (1 - V_CNR) ;
BAS7WB = min(COD7WB , LIMDUFLO - BAS7WA) * (1 - V_CNR) ;

BAS7XA = min(COD7XA , LIMDUFLO) * (1 - V_CNR) ;
BAS7XB = min(COD7XB , LIMDUFLO - BAS7XA) * (1 - V_CNR) ;

BAS7RV = min(COD7RV , LIMDUFLO) * (1 - V_CNR) ;
BAS7RW = min(COD7RW , LIMDUFLO - BAS7RV) * (1 - V_CNR) ;

BAS7SH = min(COD7SH , LIMDUFLO) * (1 - V_CNR) ;
BAS7SI = min(COD7SI , LIMDUFLO - BAS7SH) * (1 - V_CNR) ;

regle 401278:
application : iliad ;

DNORMAN = COD7NI + COD7NJ + COD7NK + COD7NL + COD7NM + COD7NN + COD7PF + COD7PG + COD7NO + COD7NP + COD7NQ + COD7NR + COD7LQ + COD7LR + COD7LS + COD7LT ;

ANORMAN = (arr(BAS7NI/6) + arr(BAS7NJ/9) + arr(BAS7NK/6) + arr(BAS7NL/9) + arr(BAS7NM/6) + arr(BAS7NN/9) + arr(BAS7PF/6) + arr(BAS7PG/9) 
	  + arr(BAS7NO/6) + arr(BAS7NP/9) + arr(BAS7NQ/6) + arr(BAS7NR/9) + arr(BAS7LQ/6) + arr(BAS7LR/9) + arr(BAS7LS/6) + arr(BAS7LT/9)) * (1-positif(PREM8_11)) ;

RNORABCD = arr(arr(BAS7NI/6) * TX12/100) + arr(arr(BAS7NJ/9) * TX18/100) + arr(arr(BAS7NK/6) * TX23/100) + arr(arr(BAS7NL/9) * TX29/100) 
	   + arr(arr(BAS7NM/6) * TX12/100) + arr(arr(BAS7NN/9) * TX18/100) + arr(arr(BAS7PF/6) * TX23/100) + arr(arr(BAS7PG/9) * TX29/100) 
	   + arr(arr(BAS7NO/6) * TX12/100) + arr(arr(BAS7NP/9) * TX18/100) + arr(arr(BAS7NQ/6) * TX23/100) + arr(arr(BAS7NR/9) * TX29/100) 
	   + arr(arr(BAS7LQ/6) * TX12/100) + arr(arr(BAS7LR/9) * TX18/100) + arr(arr(BAS7LS/6) * TX23/100) + arr(arr(BAS7LT/9) * TX29/100) ;

DPINEL = COD7SD + COD7SE + COD7SF + COD7SG + COD7VW + COD7VX + COD7VY + COD7VZ
         + COD7VD + COD7VE + COD7VF + COD7VG + COD7QR + COD7QS + COD7QT + COD7QU 
         + COD7QI + COD7QJ + COD7QK + COD7QL + COD7QM + COD7QN + COD7QO + COD7QP ;

APINEL = (arr(BAS7SD/6) + arr(BAS7SE/9) + arr(BAS7SF/6) + arr(BAS7SG/9) + arr(BAS7VW/6) + arr(BAS7VX/9) + arr(BAS7VY/6) + arr(BAS7VZ/9)
         + arr(BAS7VE/9) + arr(BAS7VD/6) + arr(BAS7VG/9) + arr(BAS7VF/6) + arr(BAS7QS/9) + arr(BAS7QR/6) + arr(BAS7QU/9) + arr(BAS7QT/6)
         + arr(BAS7QJ/9) + arr(BAS7QI/6) + arr(BAS7QL/9) + arr(BAS7QK/6) + arr(BAS7QN/9) + arr(BAS7QM/6) + arr(BAS7QP/9) + arr(BAS7QO/6))*(1-positif(PREM8_11));

RPINABCD = arr(arr(BAS7SD/6) * TX09/100) + arr(arr(BAS7SE/9) * TX12/100) + arr(arr(BAS7SF/6) * TX20/100) + arr(arr(BAS7SG/9) * TX23/100)
           + arr(arr(BAS7VZ/9) * TX29/100) + arr(arr(BAS7VY/6) * TX23/100) + arr(arr(BAS7VX/9) * TX18/100) + arr(arr(BAS7VW/6) * TX12/100)
           + arr(arr(BAS7VG/9) * TX29/100) + arr(arr(BAS7VF/6) * TX23/100) + arr(arr(BAS7VE/9) * TX18/100) + arr(arr(BAS7VD/6) * TX12/100)
           + arr(arr(BAS7QU/9) * TX26/100) + arr(arr(BAS7QT/6) * TX215/100) + arr(arr(BAS7QS/9) * TX15/100) + arr(arr(BAS7QR/6) * TX105/100) 
	   + arr(arr(BAS7QL/9) * TX29/100) + arr(arr(BAS7QK/6) * TX23/100) + arr(arr(BAS7QJ/9) * TX18/100) + arr(arr(BAS7QI/6) * TX12/100) 
	   + arr(arr(BAS7QP/9) * TX29/100) + arr(arr(BAS7QO/6) * TX23/100) + arr(arr(BAS7QN/9) * TX18/100) + arr(arr(BAS7QM/6) * TX12/100) ;

DPIRRS = COD7RR + COD7RS + COD7RX + COD7RY + COD7WA + COD7WB + COD7XA + COD7XB ;

APIRRS = (arr(BAS7RR/3) + arr(BAS7RS/3) + arr(BAS7RX/3) + arr(BAS7RY/3) + arr(BAS7WA/3) + arr(BAS7WB/3) + arr(BAS7XA/3) + arr(BAS7XB/3)) * (1-positif(PREM8_11)) ;

RPINRRS = arr(arr(BAS7RR/3) * TX06/100) + arr(arr(BAS7RS/3) * TX06/100) + arr(arr(BAS7RX/3) * TX06/100) + arr(arr(BAS7RY/3) * TX06/100) 
          + arr(arr(BAS7WA/3) * TX03/100) + arr(arr(BAS7WB/3) * TX03/100) + arr(arr(BAS7XA/3) * TX03/100) + arr(arr(BAS7XB/3) * TX03/100) ;

DPIPRO = COD7RV + COD7RW + COD7SH + COD7SI ;

APIPRO = (arr(BAS7RV/3) + arr(BAS7RW/3) + arr(BAS7SH/3) + arr(BAS7SI/3)) * (1-positif(PREM8_11)) ;

RPIPRO = arr(arr(BAS7RV/3) * TX03/100) + arr(arr(BAS7RW/3) * TX03/100) + arr(arr(BAS7SH/3) * TX03/100) + arr(arr(BAS7SI/3) * TX03/100) ;

regle 401280:
application : iliad ;


RRI1DUPI = RRI1 - RLOGDOM - RCOMP - RRETU - RDONS - CRDIE ;
VARTMP1 = 0 ;

regle 401282:
application : iliad ;

RDUFREP_1 = max(0 , min(ADUFREP , RRI1DUPI)) ;
RDUFREP = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RDUFREP_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RDUFREP_1,max(max(RDUFREP_P,RDUFREP_PA),RDUFREP1731))*(1-V_INDTEO)+RDUFREP_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = RDUFREP ;

RPIREPRZ_1 = max(0 , min(APIREPRZ , RRI1DUPI - VARTMP1)) ;
RPIREPRZ = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RPIREPRZ_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RPIREPRZ_1,max(max(RPIREPRZ_P,RPIREPRZ_PA),RPIREPRZ1731))*(1-V_INDTEO)+RPIREPRZ_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RPIREPRZ ;

RPIREPTZ_1 = max(0 , min(APIREPTZ , RRI1DUPI - VARTMP1)) ;
RPIREPTZ = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RPIREPTZ_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RPIREPTZ_1,max(max(RPIREPTZ_P,RPIREPTZ_PA),RPIREPTZ1731))*(1-V_INDTEO)+RPIREPTZ_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RPIREPTZ ;

RPIREPRB_1 = max(0 , min(APIREPRB , RRI1DUPI - VARTMP1)) ;
RPIREPRB = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RPIREPRB_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RPIREPRB_1,max(max(RPIREPRB_P,RPIREPRB_PA),RPIREPRB1731))*(1-V_INDTEO)+RPIREPRB_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RPIREPRB ;

RPIREPRD_1 = max(0 , min(APIREPRD , RRI1DUPI - VARTMP1)) ;
RPIREPRD = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RPIREPRD_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RPIREPRD_1,max(max(RPIREPRD_P,RPIREPRD_PA),RPIREPRD1731))*(1-V_INDTEO)+RPIREPRD_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RPIREPRD ;

RPIREPRF_1 = max(0 , min(APIREPRF , RRI1DUPI - VARTMP1)) ;
RPIREPRF = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RPIREPRF_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RPIREPRF_1,max(max(RPIREPRF_P,RPIREPRF_PA),RPIREPRF1731))*(1-V_INDTEO)+RPIREPRF_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RPIREPRF ;

RPIREPRH_1 = max(0 , min(APIREPRH , RRI1DUPI - VARTMP1)) ;
RPIREPRH = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RPIREPRH_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RPIREPRH_1,max(max(RPIREPRH_P,RPIREPRH_PA),RPIREPRH1731))*(1-V_INDTEO)+RPIREPRH_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RPIREPRH ;

RPIREPJM_1 = max(0 , min(APIREPJM , RRI1DUPI - VARTMP1)) ;
RPIREPJM = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RPIREPJM_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RPIREPJM_1,max(max(RPIREPJM_P,RPIREPJM_PA),RPIREPJM1731))*(1-V_INDTEO)+RPIREPJM_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RPIREPJM ;

RNORMJA_1 = max(0 , min(ANORMJA , RRI1DUPI - VARTMP1)) ;
RNORMJA = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RNORMJA_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RNORMJA_1,max(max(RNORMJA_P,RNORMJA_PA),RNORMJA1731))*(1-V_INDTEO)+RNORMJA_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RNORMJA ;

RPIREPKM_1 = max(0 , min(APIREPKM , RRI1DUPI - VARTMP1)) ;
RPIREPKM = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RPIREPKM_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RPIREPKM_1,max(max(RPIREPKM_P,RPIREPKM_PA),RPIREPKM1731))*(1-V_INDTEO)+RPIREPKM_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RPIREPKM ;

RNORMJB_1 = max(0 , min(ANORMJB , RRI1DUPI - VARTMP1)) ;
RNORMJB = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RNORMJB_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RNORMJB_1,max(max(RNORMJB_P,RNORMJB_PA),RNORMJB1731))*(1-V_INDTEO)+RNORMJB_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RNORMJB ;

RPIREPLM_1 = max(0 , min(APIREPLM , RRI1DUPI - VARTMP1)) ;
RPIREPLM = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RPIREPLM_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RPIREPLM_1,max(max(RPIREPLM_P,RPIREPLM_PA),RPIREPLM1731))*(1-V_INDTEO)+RPIREPLM_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RPIREPLM ;

RNORMJC_1 = max(0 , min(ANORMJC , RRI1DUPI - VARTMP1)) ;
RNORMJC = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RNORMJC_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RNORMJC_1,max(max(RNORMJC_P,RNORMJC_PA),RNORMJC1731))*(1-V_INDTEO)+RNORMJC_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RNORMJC ;

RPIREPMM_1 = max(0 , min(APIREPMM , RRI1DUPI - VARTMP1)) ;
RPIREPMM = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIREPMM_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(RPIREPMM_1 , max(max(RPIREPMM_P,RPIREPMM_PA),RPIREPMM1731))*(1-V_INDTEO)+RPIREPMM_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIREPMM ;

RNORMJD_1 = max(0 , min(ANORMJD , RRI1DUPI - VARTMP1)) ;
RNORMJD = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNORMJD_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNORMJD_1 , max(max(RNORMJD_P,RNORMJD_PA),RNORMJD1731))*(1-V_INDTEO)+RNORMJD_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNORMJD ;

RPIJN_1 = max(0 , min(APIREPJN , RRI1DUPI - VARTMP1)) ;
RPIJN = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIJN_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIJN_1 , max(max(RPIJN_P,RPIJN_PA),RPIJN1731))*(1-V_INDTEO)+RPIJN_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIJN ;

RNORMJR_1 = max(0 , min(ANORMJR , RRI1DUPI - VARTMP1)) ;
RNORMJR = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNORMJR_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNORMJR_1 , max(max(RNORMJR_P,RNORMJR_PA),RNORMJR1731))*(1-V_INDTEO)+RNORMJR_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNORMJR ;

RPIJO_1 = max(0 , min(APIREPJO , RRI1DUPI - VARTMP1)) ;
RPIJO = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIJO_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIJO_1 , max(max(RPIJO_P,RPIJO_PA),RPIJO1731))*(1-V_INDTEO)+RPIJO_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIJO ;

RNORMJS_1 = max(0 , min(ANORMJS , RRI1DUPI - VARTMP1)) ;
RNORMJS = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNORMJS_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNORMJS_1 , max(max(RNORMJS_P,RNORMJS_PA),RNORMJS1731))*(1-V_INDTEO)+RNORMJS_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNORMJS ;

RPIJP_1 = max(0 , min(APIREPJP , RRI1DUPI - VARTMP1)) ;
RPIJP = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIJP_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIJP_1 , max(max(RPIJP_P,RPIJP_PA),RPIJP1731))*(1-V_INDTEO)+RPIJP_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIJP ;

RNORMJT_1 = max(0 , min(ANORMJT , RRI1DUPI - VARTMP1)) ;
RNORMJT = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNORMJT_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNORMJT_1 , max(max(RNORMJT_P,RNORMJT_PA),RNORMJT1731))*(1-V_INDTEO)+RNORMJT_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNORMJT ;

RPIJQ_1 = max(0 , min(APIREPJQ , RRI1DUPI - VARTMP1)) ;
RPIJQ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIJQ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIJQ_1 , max(max(RPIJQ_P,RPIJQ_PA),RPIJQ1731))*(1-V_INDTEO)+RPIJQ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIJQ ;

RNORMJU_1 = max(0 , min(ANORMJU , RRI1DUPI - VARTMP1)) ;
RNORMJU = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNORMJU_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNORMJU_1 , max(max(RNORMJU_P,RNORMJU_PA),RNORMJU1731))*(1-V_INDTEO)+RNORMJU_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNORMJU ;

RPIJV_1 = max(0 , min(APIJV , RRI1DUPI - VARTMP1)) ;
RPIJV = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIJV_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIJV_1 , max(max(RPIJV_P,RPIJV_PA),RPIJV1731))*(1-V_INDTEO)+RPIJV_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIJV ;

RNORMLG_1 = max(0 , min(ANORMLG , RRI1DUPI - VARTMP1)) ;
RNORMLG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNORMLG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNORMLG_1 , max(max(RNORMLG_P,RNORMLG_PA),RNORMLG1731))*(1-V_INDTEO)+RNORMLG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNORMLG ;

RPIJW_1 = max(0 , min(APIJW , RRI1DUPI - VARTMP1)) ;
RPIJW = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIJW_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIJW_1 , max(max(RPIJW_P,RPIJW_PA),RPIJW1731))*(1-V_INDTEO)+RPIJW_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIJW ;

RNORMLH_1 = max(0 , min(ANORMLH , RRI1DUPI - VARTMP1)) ;
RNORMLH = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNORMLH_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNORMLH_1 , max(max(RNORMLH_P,RNORMLH_PA),RNORMLH1731))*(1-V_INDTEO)+RNORMLH_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNORMLH ;

RPIJX_1 = max(0 , min(APIJX , RRI1DUPI - VARTMP1)) ;
RPIJX = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIJX_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIJX_1 , max(max(RPIJX_P,RPIJX_PA),RPIJX1731))*(1-V_INDTEO)+RPIJX_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIJX ;

RNORMLI_1 = max(0 , min(ANORMLI , RRI1DUPI - VARTMP1)) ;
RNORMLI = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNORMLI_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNORMLI_1 , max(max(RNORMLI_P,RNORMLI_PA),RNORMLI1731))*(1-V_INDTEO)+RNORMLI_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNORMLI ;

RPIJY_1 = max(0 , min(APIJY , RRI1DUPI - VARTMP1)) ;
RPIJY = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIJY_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIJY_1 , max(max(RPIJY_P,RPIJY_PA),RPIJY1731))*(1-V_INDTEO)+RPIJY_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIJY ;

RNORMLJ_1 = max(0 , min(ANORMLJ , RRI1DUPI - VARTMP1)) ;
RNORMLJ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNORMLJ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNORMLJ_1 , max(max(RNORMLJ_P,RNORMLJ_PA),RNORMLJ1731))*(1-V_INDTEO)+RNORMLJ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNORMLJ ;

RPIJI_1 = max(0 , min(APIJI , RRI1DUPI - VARTMP1)) ;
RPIJI = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIJI_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIJI_1 , max(max(RPIJI_P,RPIJI_PA),RPIJI1731))*(1-V_INDTEO)+RPIJI_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIJI ;

RNOJE_1 = max(0 , min(ANOJE , RRI1DUPI - VARTMP1)) ;
RNOJE = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNOJE_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNOJE_1 , max(max(RNOJE_P,RNOJE_PA),RNOJE1731))*(1-V_INDTEO)+RNOJE_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNOJE ;

RPIJJ_1 = max(0 , min(APIJJ , RRI1DUPI - VARTMP1)) ;
RPIJJ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIJJ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIJJ_1 , max(max(RPIJJ_P,RPIJJ_PA),RPIJJ1731))*(1-V_INDTEO)+RPIJJ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIJJ ;

RNOJF_1 = max(0 , min(ANOJF , RRI1DUPI - VARTMP1)) ;
RNOJF = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNOJF_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNOJF_1 , max(max(RNOJF_P,RNOJF_PA),RNOJF1731))*(1-V_INDTEO)+RNOJF_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNOJF ;

RPIJK_1 = max(0 , min(APIJK , RRI1DUPI - VARTMP1)) ;
RPIJK = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIJK_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIJK_1 , max(max(RPIJK_P,RPIJK_PA),RPIJK1731))*(1-V_INDTEO)+RPIJK_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIJK ;

RNOJG_1 = max(0 , min(ANOJG , RRI1DUPI - VARTMP1)) ;
RNOJG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNOJG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNOJG_1 , max(max(RNOJG_P,RNOJG_PA),RNOJG1731))*(1-V_INDTEO)+RNOJG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNOJG ;

RPIJL_1 = max(0 , min(APIJL , RRI1DUPI - VARTMP1)) ;
RPIJL = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIJL_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIJL_1 , max(max(RPIJL_P,RPIJL_PA),RPIJL1731))*(1-V_INDTEO)+RPIJL_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIJL ;

RNOJH_1 = max(0 , min(ANOJH , RRI1DUPI - VARTMP1)) ;
RNOJH = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNOJH_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNOJH_1 , max(max(RNOJH_P,RNOJH_PA),RNOJH1731))*(1-V_INDTEO)+RNOJH_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNOJH ;

RPIIA_1 = max(0 , min(APIIA , RRI1DUPI - VARTMP1)) ;
RPIIA = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIIA_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIIA_1 , max(max(RPIIA_P,RPIIA_PA),RPIIA1731))*(1-V_INDTEO)+RPIIA_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIIA ;

RNOIE_1 = max(0 , min(ANOIE , RRI1DUPI - VARTMP1)) ;
RNOIE = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNOIE_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNOIE_1 , max(max(RNOIE_P,RNOIE_PA),RNOIE1731))*(1-V_INDTEO)+RNOIE_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNOIE ;

RPIIB_1 = max(0 , min(APIIB , RRI1DUPI - VARTMP1)) ;
RPIIB = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIIB_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIIB_1 , max(max(RPIIB_P,RPIIB_PA),RPIIB1731))*(1-V_INDTEO)+RPIIB_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIIB ;

RNOIF_1 = max(0 , min(ANOIF , RRI1DUPI - VARTMP1)) ;
RNOIF = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNOIF_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNOIF_1 , max(max(RNOIF_P,RNOIF_PA),RNOIF1731))*(1-V_INDTEO)+RNOIF_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNOIF ;

RPIIC_1 = max(0 , min(APIIC , RRI1DUPI - VARTMP1)) ;
RPIIC = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIIC_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIIC_1 , max(max(RPIIC_P,RPIIC_PA),RPIIC1731))*(1-V_INDTEO)+RPIIC_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIIC ;

RNOIG_1 = max(0 , min(ANOIG , RRI1DUPI - VARTMP1)) ;
RNOIG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNOIG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNOIG_1 , max(max(RNOIG_P,RNOIG_PA),RNOIG1731))*(1-V_INDTEO)+RNOIG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNOIG ;

RPIID_1 = max(0 , min(APIID , RRI1DUPI - VARTMP1)) ;
RPIID = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIID_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIID_1 , max(max(RPIID_P,RPIID_PA),RPIID1731))*(1-V_INDTEO)+RPIID_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIID ;

RNOIH_1 = max(0 , min(ANOIH , RRI1DUPI - VARTMP1)) ;
RNOIH = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNOIH_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RNOIH_1 , max(max(RNOIH_P,RNOIH_PA),RNOIH1731))*(1-V_INDTEO)+RNOIH_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNOIH ;

RPIPK_1 = max(0 , min(APIPK , RRI1DUPI - VARTMP1)) ;
RPIPK = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIPK_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIPK_1 , max(max(RPIPK_P,RPIPK_PA),RPIPK1731))*(1-V_INDTEO)+RPIPK_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIPK ;

RPIPL_1 = max(0 , min(APIPL , RRI1DUPI - VARTMP1)) ;
RPIPL = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIPL_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIPL_1 , max(max(RPIPL_P,RPIPL_PA),RPIPL1731))*(1-V_INDTEO)+RPIPL_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIPL ;

RPIPM_1 = max(0 , min(APIPM , RRI1DUPI - VARTMP1)) ;
RPIPM = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIPM_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIPM_1 , max(max(RPIPM_P,RPIPM_PA),RPIPM1731))*(1-V_INDTEO)+RPIPM_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIPM ;

RPIPN_1 = max(0 , min(APIPN , RRI1DUPI - VARTMP1)) ;
RPIPN = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIPN_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIPN_1 , max(max(RPIPN_P,RPIPN_PA),RPIPN1731))*(1-V_INDTEO)+RPIPN_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIPN ;

RPIOF_1 = max(0 , min(APIOF , RRI1DUPI - VARTMP1)) ;
RPIOF = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIOF_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIOF_1 , max(max(RPIOF_P,RPIOF_PA),RPIOF1731))*(1-V_INDTEO)+RPIOF_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIOF ;

RPIOG_1 = max(0 , min(APIOG , RRI1DUPI - VARTMP1)) ;
RPIOG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIOG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIOG_1 , max(max(RPIOG_P,RPIOG_PA),RPIOG1731))*(1-V_INDTEO)+RPIOG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIOG ;

RPINA_1 = max(0 , min(APINA , RRI1DUPI - VARTMP1)) ;
RPINA = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPINA_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPINA_1 , max(max(RPINA_P,RPINA_PA),RPINA1731))*(1-V_INDTEO)+RPINA_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPINA ;

RPINB_1 = max(0 , min(APINB , RRI1DUPI - VARTMP1)) ;
RPINB = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPINB_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPINB_1 , max(max(RPINB_P,RPINB_PA),RPINB1731))*(1-V_INDTEO)+RPINB_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPINB ;

RPINC_1 = max(0 , min(APINC , RRI1DUPI - VARTMP1)) ;
RPINC = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPINC_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPINC_1 , max(max(RPINC_P,RPINC_PA),RPINC1731))*(1-V_INDTEO)+RPINC_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPINC ;

RPIND_1 = max(0 , min(APIND , RRI1DUPI - VARTMP1)) ;
RPIND = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIND_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIND_1 , max(max(RPIND_P,RPIND_PA),RPIND1731))*(1-V_INDTEO)+RPIND_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIND ;

RPISY_1 = max(0 , min(APISY , RRI1DUPI - VARTMP1)) ;
RPISY = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPISY_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPISY_1 , max(max(RPISY_P,RPISY_PA),RPISY1731))*(1-V_INDTEO)+RPISY_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPISY ;

RPISZ_1 = max(0 , min(APISZ , RRI1DUPI - VARTMP1)) ;
RPISZ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPISZ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPISZ_1 , max(max(RPISZ_P,RPISZ_PA),RPISZ1731))*(1-V_INDTEO)+RPISZ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPISZ ;

RPIQL_1 = max(0 , min(arr(arr(BAS7QL/9) * TX29/100) , RRI1DUPI - VARTMP1)) ;
RPIQL = positif(null(V_IND_TRAIT-4) + COD9ZA) * RPIQL_1 * (1-positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
        + (max(0,min(RPIQL_1 , max(max(RPIQL_P,RPIQL_PA),RPIQL1731))*(1-V_INDTEO)+RPIQL_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0 ;
VARTMP1 = VARTMP1 + RPIQL ;

RNONL_1 = max(0 , min(arr(arr(BAS7NL/9) * TX29/100) , RRI1DUPI - VARTMP1)) ;
RNONL = positif(null(V_IND_TRAIT-4) + COD9ZA) * RNONL_1 * (1-positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
        + (max(0,min(RNONL_1 , max(max(RNONL_P,RNONL_PA),RNONL1731))*(1-V_INDTEO)+RNONL_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0 ;
VARTMP1 = VARTMP1 + RNONL ;

RPIQP_1 = max(0 , min(arr(arr(BAS7QP/9) * TX29/100) , RRI1DUPI - VARTMP1)) ;
RPIQP = positif(null(V_IND_TRAIT-4) + COD9ZA) * RPIQP_1 * (1-positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
        + (max(0,min(RPIQP_1 , max(max(RPIQP_P,RPIQP_PA),RPIQP1731))*(1-V_INDTEO)+RPIQP_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0 ;
VARTMP1 = VARTMP1 + RPIQP ;

RNOPG_1 = max(0 , min(arr(arr(BAS7PG/9) * TX29/100) , RRI1DUPI - VARTMP1)) ;
RNOPG = positif(null(V_IND_TRAIT-4) + COD9ZA) * RNOPG_1 * (1-positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
        + (max(0,min(RNOPG_1 , max(max(RNOPG_P,RNOPG_PA),RNOPG1731))*(1-V_INDTEO)+RNOPG_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0 ;
VARTMP1 = VARTMP1 + RNOPG ;

RPIVG_1 = max(0 , min(arr(arr(BAS7VG/9) * TX29/100) , RRI1DUPI - VARTMP1)) ;
RPIVG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIVG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIVG_1 , max(max(RPIVG_P,RPIVG_PA),RPIVG1731))*(1-V_INDTEO)+RPIVG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIVG ;

RNONR_1 = max(0 , min(arr(arr(BAS7NR/9) * TX29/100) , RRI1DUPI - VARTMP1)) ;
RNONR = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNONR_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RNONR_1 , max(max(RNONR_P,RNONR_PA),RNONR1731))*(1-V_INDTEO)+RNONR_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNONR ;

RPIQU_1 = max(0 , min(arr(arr(BAS7QU/9) * TX26/100) , RRI1DUPI - VARTMP1)) ;
RPIQU = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIQU_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIQU_1 , max(max(RPIQU_P,RPIQU_PA),RPIQU1731))*(1-V_INDTEO)+RPIQU_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIQU ;

RPIVZ_1 = max(0 , min(arr(arr(BAS7VZ/9) * TX29/100) , RRI1DUPI - VARTMP1)) ;
RPIVZ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIVZ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIVZ_1 , max(max(RPIVZ_P,RPIVZ_PA),RPIVZ1731))*(1-V_INDTEO)+RPIVZ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIVZ ;

RNOLT_1 = max(0 , min(arr(arr(BAS7LT/9) * TX29/100) , RRI1DUPI - VARTMP1)) ;
RNOLT = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNOLT_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RNOLT_1 , max(max(RNOLT_P,RNOLT_PA),RNOLT1731))*(1-V_INDTEO)+RNOLT_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNOLT ;

RPISG_1 = max(0 , min(arr(arr(BAS7SG/9) * TX23/100) , RRI1DUPI - VARTMP1)) ;
RPISG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPISG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPISG_1 , max(max(RPISG_P,RPISG_PA),RPISG1731))*(1-V_INDTEO)+RPISG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPISG ;

RPIQK_1 = max(0 , min(arr(arr(BAS7QK/6) * TX23/100) , RRI1DUPI - VARTMP1)) ;
RPIQK = positif(null(V_IND_TRAIT-4) + COD9ZA) * RPIQK_1 * (1-positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
        + (max(0,min(RPIQK_1 , max(max(RPIQK_P,RPIQK_PA),RPIQK1731))*(1-V_INDTEO)+RPIQK_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0 ;
VARTMP1 = VARTMP1 + RPIQK ;

RNONK_1 = max(0 , min(arr(arr(BAS7NK/6) * TX23/100) , RRI1DUPI - VARTMP1)) ;
RNONK = positif(null(V_IND_TRAIT-4) + COD9ZA) * RNONK_1 * (1-positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
        + (max(0,min(RNONK_1 , max(max(RNONK_P,RNONK_PA),RNONK1731))*(1-V_INDTEO)+RNONK_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0 ;
VARTMP1 = VARTMP1 + RNONK ;

RPIQO_1 = max(0 , min(arr(arr(BAS7QO/6) * TX23/100) , RRI1DUPI - VARTMP1)) ;
RPIQO = positif(null(V_IND_TRAIT-4) + COD9ZA) * RPIQO_1 * (1-positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
        + (max(0,min(RPIQO_1 , max(max(RPIQO_P,RPIQO_PA),RPIQO1731))*(1-V_INDTEO)+RPIQO_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0 ;
VARTMP1 = VARTMP1 + RPIQO ;

RNOPF_1 = max(0 , min(arr(arr(BAS7PF/6) * TX23/100) , RRI1DUPI - VARTMP1)) ;
RNOPF = positif(null(V_IND_TRAIT-4) + COD9ZA) * RNOPF_1 * (1-positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
        + (max(0,min(RNOPF_1 , max(max(RNOPF_P,RNOPF_PA),RNOPF1731))*(1-V_INDTEO)+RNOPF_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0 ;
VARTMP1 = VARTMP1 + RNOPF ;

RPIVF_1 = max(0 , min(arr(arr(BAS7VF/6) * TX23/100) , RRI1DUPI - VARTMP1)) ;
RPIVF = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIVF_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIVF_1 , max(max(RPIVF_P,RPIVF_PA),RPIVF1731))*(1-V_INDTEO)+RPIVF_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIVF ;

RNONQ_1 = max(0 , min(arr(arr(BAS7NQ/6) * TX23/100) , RRI1DUPI - VARTMP1)) ;
RNONQ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNONQ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RNONQ_1 , max(max(RNONQ_P,RNONQ_PA),RNONQ1731))*(1-V_INDTEO)+RNONQ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNONQ ;

RPIQT_1 = max(0 , min(arr(arr(BAS7QT/6) * TX215/100) , RRI1DUPI - VARTMP1)) ;
RPIQT = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIQT_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIQT_1 , max(max(RPIQT_P,RPIQT_PA),RPIQT1731))*(1-V_INDTEO)+RPIQT_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIQT ;

RPIVY_1 = max(0 , min(arr(arr(BAS7VY/6) * TX23/100) , RRI1DUPI - VARTMP1)) ;
RPIVY = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIVY_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIVY_1 , max(max(RPIVY_P,RPIVY_PA),RPIVY1731))*(1-V_INDTEO)+RPIVY_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIVY ;

RNOLS_1 = max(0 , min(arr(arr(BAS7LS/6) * TX23/100) , RRI1DUPI - VARTMP1)) ;
RNOLS = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNOLS_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RNOLS_1 , max(max(RNOLS_P,RNOLS_PA),RNOLS1731))*(1-V_INDTEO)+RNOLS_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNOLS ;

RPISF_1 = max(0 , min(arr(arr(BAS7SF/6) * TX20/100) , RRI1DUPI - VARTMP1)) ;
RPISF = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPISF_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPISF_1 , max(max(RPISF_P,RPISF_PA),RPISF1731))*(1-V_INDTEO)+RPISF_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPISF ;

RPIQJ_1 = max(0 , min(arr(arr(BAS7QJ/9) * TX18/100) , RRI1DUPI - VARTMP1)) ;
RPIQJ = positif(null(V_IND_TRAIT-4) + COD9ZA) * RPIQJ_1 * (1-positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
        + (max(0,min(RPIQJ_1 , max(max(RPIQJ_P,RPIQJ_PA),RPIQJ1731))*(1-V_INDTEO)+RPIQJ_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0 ;
VARTMP1 = VARTMP1 + RPIQJ ;

RNONJ_1 = max(0 , min(arr(arr(BAS7NJ/9) * TX18/100) , RRI1DUPI - VARTMP1)) ;
RNONJ = positif(null(V_IND_TRAIT-4) + COD9ZA) * RNONJ_1 * (1-positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
        + (max(0,min(RNONJ_1 , max(max(RNONJ_P,RNONJ_PA),RNONJ1731))*(1-V_INDTEO)+RNONJ_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0 ;
VARTMP1 = VARTMP1 + RNONJ ;

RPIQN_1 = max(0 , min(arr(arr(BAS7QN/9) * TX18/100) , RRI1DUPI - VARTMP1)) ;
RPIQN = positif(null(V_IND_TRAIT-4) + COD9ZA) * RPIQN_1 * (1-positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
        + (max(0,min(RPIQN_1 , max(max(RPIQN_P,RPIQN_PA),RPIQN1731))*(1-V_INDTEO)+RPIQN_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0 ;
VARTMP1 = VARTMP1 + RPIQN ;

RNONN_1 = max(0 , min(arr(arr(BAS7NN/9) * TX18/100) , RRI1DUPI - VARTMP1)) ;
RNONN = positif(null(V_IND_TRAIT-4) + COD9ZA) * RNONN_1 * (1-positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
        + (max(0,min(RNONN_1 , max(max(RNONN_P,RNONN_PA),RNONN1731))*(1-V_INDTEO)+RNONN_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0 ;
VARTMP1 = VARTMP1 + RNONN ;

RPIVE_1 = max(0 , min(arr(arr(BAS7VE/9) * TX18/100) , RRI1DUPI - VARTMP1)) ;
RPIVE = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIVE_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIVE_1 , max(max(RPIVE_P,RPIVE_PA),RPIVE1731))*(1-V_INDTEO)+RPIVE_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIVE ;

RNONP_1 = max(0 , min(arr(arr(BAS7NP/9) * TX18/100) , RRI1DUPI - VARTMP1)) ;
RNONP = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNONP_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RNONP_1 , max(max(RNONP_P,RNONP_PA),RNONP1731))*(1-V_INDTEO)+RNONP_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNONP ;

RPIQS_1 = max(0 , min(arr(arr(BAS7QS/9) * TX15/100) , RRI1DUPI - VARTMP1)) ;
RPIQS = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIQS_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIQS_1 , max(max(RPIQS_P,RPIQS_PA),RPIQS1731))*(1-V_INDTEO)+RPIQS_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIQS ;

RPIVX_1 = max(0 , min(arr(arr(BAS7VX/9) * TX18/100) , RRI1DUPI - VARTMP1)) ;
RPIVX = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIVX_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIVX_1 , max(max(RPIVX_P,RPIVX_PA),RPIVX1731))*(1-V_INDTEO)+RPIVX_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIVX ;

RNOLR_1 = max(0 , min(arr(arr(BAS7LR/9) * TX18/100) , RRI1DUPI - VARTMP1)) ;
RNOLR = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNOLR_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RNOLR_1 , max(max(RNOLR_P,RNOLR_PA),RNOLR1731))*(1-V_INDTEO)+RNOLR_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNOLR ;

RPISE_1 = max(0 , min(arr(arr(BAS7SE/9) * TX12/100) , RRI1DUPI - VARTMP1)) ;
RPISE = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPISE_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPISE_1 , max(max(RPISE_P,RPISE_PA),RPISE1731))*(1-V_INDTEO)+RPISE_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPISE ;

RPIQI_1 = max(0 , min(arr(arr(BAS7QI/6) * TX12/100) , RRI1DUPI - VARTMP1)) ;
RPIQI = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIQI_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIQI_1 , max(max(RPIQI_P,RPIQI_PA),RPIQI1731))*(1-V_INDTEO)+RPIQI_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIQI ;

RNONI_1 = max(0 , min(arr(arr(BAS7NI/6) * TX12/100) , RRI1DUPI - VARTMP1)) ;
RNONI = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNONI_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RNONI_1 , max(max(RNONI_P,RNONI_PA),RNONI1731))*(1-V_INDTEO)+RNONI_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNONI ;

RPIQM_1 = max(0 , min(arr(arr(BAS7QM/6) * TX12/100) , RRI1DUPI - VARTMP1)) ;
RPIQM = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIQM_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIQM_1 , max(max(RPIQM_P,RPIQM_PA),RPIQM1731))*(1-V_INDTEO)+RPIQM_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIQM ;

RNONM_1 = max(0 , min(arr(arr(BAS7NM/6) * TX12/100) , RRI1DUPI - VARTMP1)) ;
RNONM = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNONM_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RNONM_1 , max(max(RNONM_P,RNONM_PA),RNONM1731))*(1-V_INDTEO)+RNONM_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNONM ;

RPIVD_1 = max(0 , min(arr(arr(BAS7VD/6) * TX12/100) , RRI1DUPI - VARTMP1)) ;
RPIVD = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIVD_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIVD_1 , max(max(RPIVD_P,RPIVD_PA),RPIVD1731))*(1-V_INDTEO)+RPIVD_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIVD ;

RNONO_1 = max(0 , min(arr(arr(BAS7NO/6) * TX12/100) , RRI1DUPI - VARTMP1)) ;
RNONO = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNONO_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RNONO_1 , max(max(RNONO_P,RNONO_PA),RNONO1731))*(1-V_INDTEO)+RNONO_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNONO ;

RPIQR_1 = max(0 , min(arr(arr(BAS7QR/6) * TX105/100) , RRI1DUPI - VARTMP1)) ;
RPIQR = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIQR_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIQR_1 , max(max(RPIQR_P,RPIQR_PA),RPIQR1731))*(1-V_INDTEO)+RPIQR_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIQR ;

RPIVW_1 = max(0 , min(arr(arr(BAS7VW/6) * TX12/100) , RRI1DUPI - VARTMP1)) ;
RPIVW = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIVW_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIVW_1 , max(max(RPIVW_P,RPIVW_PA),RPIVW1731))*(1-V_INDTEO)+RPIVW_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIVW ;

RNOLQ_1 = max(0 , min(arr(arr(BAS7LQ/6) * TX12/100) , RRI1DUPI - VARTMP1)) ;
RNOLQ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RNOLQ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RNOLQ_1 , max(max(RNOLQ_P,RNOLQ_PA),RNOLQ1731))*(1-V_INDTEO)+RNOLQ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RNOLQ ;

RPISD_1 = max(0 , min(arr(arr(BAS7SD/6) * TX09/100) , RRI1DUPI - VARTMP1)) ;
RPISD = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPISD_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPISD_1 , max(max(RPISD_P,RPISD_PA),RPISD1731))*(1-V_INDTEO)+RPISD_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPISD ;


RPIWA_1 = max(0 , min(arr(arr(BAS7WA/3) * TX03/100) , RRI1DUPI - VARTMP1)) ;
RPIWA = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIWA_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIWA_1 , max(max(RPIWA_P,RPIWA_PA),RPIWA1731))*(1-V_INDTEO)+RPIWA_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIWA ;

RPIWB_1 = max(0 , min(arr(arr(BAS7WB/3) * TX03/100) , RRI1DUPI - VARTMP1)) ;
RPIWB = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIWB_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIWB_1 , max(max(RPIWB_P,RPIWB_PA),RPIWB1731))*(1-V_INDTEO)+RPIWB_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIWB ;

RPIXA_1 = max(0 , min(arr(arr(BAS7XA/3) * TX03/100) , RRI1DUPI - VARTMP1)) ;
RPIXA = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIXA_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIXA_1 , max(max(RPIXA_P,RPIXA_PA),RPIXA1731))*(1-V_INDTEO)+RPIXA_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIXA ;

RPIXB_1 = max(0 , min(arr(arr(BAS7XB/3) * TX03/100) , RRI1DUPI - VARTMP1)) ;
RPIXB = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIXB_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIXB_1 , max(max(RPIXB_P,RPIXB_PA),RPIXB1731))*(1-V_INDTEO)+RPIXB_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIXB ;

RPIRR_1 = max(0 , min(arr(arr(BAS7RR/3) * TX06/100) , RRI1DUPI - VARTMP1)) ;
RPIRR = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIRR_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIRR_1 , max(max(RPIRR_P,RPIRR_PA),RPIRR1731))*(1-V_INDTEO)+RPIRR_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIRR ;

RPIRS_1 = max(0 , min(arr(arr(BAS7RS/3) * TX06/100) , RRI1DUPI - VARTMP1)) ;
RPIRS = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIRS_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIRS_1 , max(max(RPIRS_P,RPIRS_PA),RPIRS1731))*(1-V_INDTEO)+RPIRS_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIRS ;

RPIRX_1 = max(0 , min(arr(arr(BAS7RX/3) * TX06/100) , RRI1DUPI - VARTMP1)) ;
RPIRX = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIRX_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIRX_1 , max(max(RPIRX_P,RPIRX_PA),RPIRX1731))*(1-V_INDTEO)+RPIRX_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIRX ;

RPIRY_1 = max(0 , min(arr(arr(BAS7RY/3) * TX06/100) , RRI1DUPI - VARTMP1)) ;
RPIRY = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIRY_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIRY_1 , max(max(RPIRY_P,RPIRY_PA),RPIRY1731))*(1-V_INDTEO)+RPIRY_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIRY ;

RPIRV_1 = max(0 , min(arr(arr(BAS7RV/3) * TX03/100) , RRI1DUPI - VARTMP1)) ;
RPIRV = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIRV_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIRV_1 , max(max(RPIRV_P,RPIRV_PA),RPIRV1731))*(1-V_INDTEO)+RPIRV_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIRV ;

RPIRW_1 = max(0 , min(arr(arr(BAS7RW/3) * TX03/100) , RRI1DUPI - VARTMP1)) ;
RPIRW = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPIRW_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPIRW_1 , max(max(RPIRW_P,RPIRW_PA),RPIRW1731))*(1-V_INDTEO)+RPIRW_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPIRW ;

RPISH_1 = max(0 , min(arr(arr(BAS7SH/3) * TX03/100) , RRI1DUPI - VARTMP1)) ;
RPISH = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPISH_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPISH_1 , max(max(RPISH_P,RPISH_PA),RPISH1731))*(1-V_INDTEO)+RPISH_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RPISH ;

RPISI_1 = max(0 , min(arr(arr(BAS7SI/3) * TX03/100) , RRI1DUPI - VARTMP1)) ;
RPISI = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RPISI_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RPISI_1 , max(max(RPISI_P,RPISI_PA),RPISI1731))*(1-V_INDTEO)+RPISI_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = 0 ;

regle 401284:
application : iliad ;

RNORMREP = RNORMJA + RNORMJB + RNORMJC + RNORMJD + RNORMJR + RNORMJS + RNORMJT + RNORMJU 
           + RNORMLG + RNORMLH + RNORMLI + RNORMLJ + RNOJE + RNOJF + RNOJG + RNOJH + RNOIE + RNOIF + RNOIG + RNOIH ;

RNORMAN = RNONI + RNONJ + RNONK + RNONL + RNOPG + RNOPF + RNONN + RNONM 
          + RNONO + RNONP + RNONQ + RNONR + RNOLQ + RNOLR + RNOLS + RNOLT ;

RNORMTOT = RNORMREP + RNORMAN ;

RNORMTOT_1 = RNORMJA_1 + RNORMJB_1 + RNORMJC_1 + RNORMJD_1 + RNORMJR_1 + RNORMJS_1 + RNORMJT_1 + RNORMJU_1 + RNORMLG_1 + RNORMLH_1 
             + RNORMLI_1 + RNORMLJ_1 + RNOJE_1 + RNOJF_1 + RNOJG_1 + RNOJH_1 + RNOIE_1 + RNOIF_1 + RNOIG_1 + RNOIH_1 
	     + RNONI_1 + RNONJ_1 + RNONK_1 + RNONL_1 + RNOPG_1 + RNOPF_1 + RNONN_1 + RNONM_1 
	     + RNONO_1 + RNONP_1 + RNONQ_1 + RNONR_1 + RNOLQ_1 + RNOLR_1 + RNOLS_1 + RNOLT_1 ;

RPIREP = RPIREPRZ + RPIREPTZ + RPIREPRB + RPIREPRD + RPIREPRF
         + RPIREPRH + RPIREPJM + RPIREPKM + RPIREPLM + RPIREPMM + RPIJN + RPIJO + RPIJP + RPIJQ + RPIJV + RPIJW + RPIJX + RPIJY 
	 + RPIJI + RPIJJ + RPIJK + RPIJL + RPIIA + RPIIB + RPIIC + RPIID ;

RPINEL = RPIVD + RPIVE + RPIVF + RPIVG + RPIQR + RPIQS + RPIQT + RPIQU + RPISD + RPISE + RPISF + RPISG
         + RPIQO + RPIQP + RPIQM + RPIQN + RPIQI + RPIQJ + RPIQK + RPIQL + RPIVW + RPIVX + RPIVY + RPIVZ ;

RPROPIREP = RPIPK + RPIPL + RPIPM + RPIPN ;

RPROPIREP1 = RPIOF + RPIOG + RPINA + RPINB + RPINC + RPIND ;

RPROPIREP2 = RPISY + RPISZ ;

RPROPINEL = RPIRR + RPIRS + RPIRX + RPIRY + RPIWA + RPIWB + RPIXA + RPIXB ;

RPROPINEL1 = RPIRV + RPIRW + RPISH + RPISI ;

RPINELTOT = RPIREP + RPINEL + RPROPIREP + RPROPIREP1 + RPROPIREP2 + RPROPINEL + RPROPINEL1 ;

RPINELTOT_1 = max(0,min(APIREPRZ_1 + APIREPTZ_1 + APIREPRB_1 + APIREPRD_1 + APIREPRF_1 + APIREPRH_1
                        + APIREPJM_1 + APIREPKM_1 + APIREPLM_1 + APIREPMM_1 + RPIJN_1 + RPIJO_1 + RPIJP_1 + RPIJQ_1 + RPIJV_1 + RPIJW_1 + RPIJX_1 + RPIJY_1 
			+ RPIJI_1 + RPIJJ_1 + RPIJK_1 + RPIJL_1 + RPIIA_1 + RPIIB_1 + RPIIC_1 + RPIID_1 , RRI1DUPI))
              + RPIVD_1 + RPIVE_1 + RPIVF_1 + RPIVG_1 + RPIQR_1 + RPIQS_1 + RPIQT_1 + RPIQU_1 + RPISD_1 + RPISE_1 + RPISF_1 + RPISG_1 
	      + RPIQO_1 + RPIQP_1 + RPIQM_1 + RPIQN_1 + RPIQI_1 + RPIQJ_1 + RPIQK_1 + RPIQL_1 + RPIVW_1 + RPIVX_1 + RPIVY_1 + RPIVZ_1
	      + RPIPK_1 + RPIPL_1 + RPIPM_1 + RPIPN_1 + RPIOF_1 + RPIOG_1 + RPINA_1 + RPINB_1 + RPINC_1 + RPIND_1 + RPISY_1 + RPISZ_1 
	      + RPIRR_1 + RPIRS_1 + RPIRX_1 + RPIRY_1 + RPIWA_1 + RPIWB_1 + RPIXA_1 + RPIXB_1 + RPIRV_1 + RPIRW_1 + RPISH_1 + RPISI_1 ;

regle 401290:
application : iliad ;

RIVPIVZ = arr(arr(BAS7VZ/9) * (TX29/100)) ;
RIVPIVZ8 = max(0 , arr(BAS7VZ * (TX29/100)) - 8 * RIVPIVZ) ; 

RIVPIVX = arr(arr(BAS7VX/9) * (TX18/100)) ;
RIVPIVX8 = max(0 , arr(BAS7VX * (TX18/100)) - 8 * RIVPIVX) ;

RIVPIVY = arr(arr(BAS7VY/6) * (TX23/100)) ;
RIVPIVY5 = max(0 , arr(BAS7VY * (TX23/100)) - 5 * RIVPIVY) ;

RIVPIVW = arr(arr(BAS7VW/6) * (TX12/100)) ;
RIVPIVW5 = max(0 , arr(BAS7VW * (TX12/100)) - 5 * RIVPIVW) ;

RIVPISG = arr(arr(BAS7SG/9) * (TX23/100)) ;
RIVPISG8 = max(0 , arr(BAS7SG * (TX23/100)) - 8 * RIVPISG) ; 

RIVPISE = arr(arr(BAS7SE/9) * (TX12/100)) ;
RIVPISE8 = max(0 , arr(BAS7SE * (TX12/100)) - 8 * RIVPISE) ;

RIVPISF = arr(arr(BAS7SF/6) * (TX20/100)) ;
RIVPISF5 = max(0 , arr(BAS7SF * (TX20/100)) - 5 * RIVPISF) ;

RIVPISD = arr(arr(BAS7SD/6) * (TX09/100)) ;
RIVPISD5 = max(0 , arr(BAS7SD * (TX09/100)) - 5 * RIVPISD) ;


RIVPIVG = arr(arr(BAS7VG/9) * (TX29/100)) ;
RIVPIVG8 = max(0 , arr(BAS7VG * (TX29/100)) - 8 * RIVPIVG) ; 

RIVPIVE = arr(arr(BAS7VE/9) * (TX18/100)) ;
RIVPIVE8 = max(0 , arr(BAS7VE * (TX18/100)) - 8 * RIVPIVE) ;

RIVPIVF = arr(arr(BAS7VF/6) * (TX23/100)) ;
RIVPIVF5 = max(0 , arr(BAS7VF * (TX23/100)) - 5 * RIVPIVF) ;

RIVPIVD = arr(arr(BAS7VD/6) * (TX12/100)) ;
RIVPIVD5 = max(0 , arr(BAS7VD * (TX12/100)) - 5 * RIVPIVD) ;

RIVPIQU = arr(arr(BAS7QU/9) * (TX26/100)) ;
RIVPIQU8 = max(0 , arr(BAS7QU * (TX26/100)) - 8 * RIVPIQU) ; 

RIVPIQS = arr(arr(BAS7QS/9) * (TX15/100)) ;
RIVPIQS8 = max(0 , arr(BAS7QS * (TX15/100)) - 8 * RIVPIQS) ;

RIVPIQT = arr(arr(BAS7QT/6) * (TX215/100)) ;
RIVPIQT5 = max(0 , arr(BAS7QT * (TX215/100)) - 5 * RIVPIQT) ;

RIVPIQR = arr(arr(BAS7QR/6) * (TX105/100)) ;
RIVPIQR5 = max(0 , arr(BAS7QR * (TX105/100)) - 5 * RIVPIQR) ;


RIVPIQP = arr(arr(BAS7QP/9) * (TX29/100)) ;
RIVPIQP8 = max(0 , arr(BAS7QP * (TX29/100)) - 8 * RIVPIQP) ; 

RIVPIQN = arr(arr(BAS7QN/9) * (TX18/100)) ;
RIVPIQN8 = max(0 , arr(BAS7QN * (TX18/100)) - 8 * RIVPIQN) ;

RIVPIQO = arr(arr(BAS7QO/6) * (TX23/100)) ;
RIVPIQO5 = max(0 , arr(BAS7QO * (TX23/100)) - 5 * RIVPIQO) ;

RIVPIQM = arr(arr(BAS7QM/6) * (TX12/100)) ;
RIVPIQM5 = max(0 , arr(BAS7QM * (TX12/100)) - 5 * RIVPIQM) ;


RIVPIQL = arr(arr(BAS7QL/9) * (TX29/100)) ;
RIVPIQL8 = max(0 , arr(BAS7QL * (TX29/100)) - 8 * RIVPIQL) ; 

RIVPIQJ = arr(arr(BAS7QJ/9) * (TX18/100)) ;
RIVPIQJ8 = max(0 , arr(BAS7QJ * (TX18/100)) - 8 * RIVPIQJ) ;

RIVPIQK = arr(arr(BAS7QK/6) * (TX23/100)) ;
RIVPIQK5 = max(0 , arr(BAS7QK * (TX23/100)) - 5 * RIVPIQK) ;

RIVPIQI = arr(arr(BAS7QI/6) * (TX12/100)) ;
RIVPIQI5 = max(0 , arr(BAS7QI * (TX12/100)) - 5 * RIVPIQI) ;


RIVNOLT = arr(arr(BAS7LT/9) * TX29/100) ;
RIVNOLT8 = max(0 , arr(BAS7LT * TX29/100) - 8 * RIVNOLT) ;

RIVNOLR = arr(arr(BAS7LR/9) * TX18/100) ;
RIVNOLR8 = max(0 , arr(BAS7LR * TX18/100) - 8 * RIVNOLR) ;

RIVNOLS = arr(arr(BAS7LS/6) * TX23/100) ;
RIVNOLS5 = max(0 , arr(BAS7LS * TX23/100) - 5 * RIVNOLS) ;

RIVNOLQ = arr(arr(BAS7LQ/6) * TX12/100) ;
RIVNOLQ5 = max(0 , arr(BAS7LQ * TX12/100) - 5 * RIVNOLQ) ;


RIVNONR = arr(arr(BAS7NR/9) * TX29/100) ;
RIVNONR8 = max(0 , arr(BAS7NR * TX29/100) - 8 * RIVNONR) ;

RIVNONP = arr(arr(BAS7NP/9) * TX18/100) ;
RIVNONP8 = max(0 , arr(BAS7NP * TX18/100) - 8 * RIVNONP) ;

RIVNONQ = arr(arr(BAS7NQ/6) * TX23/100) ;
RIVNONQ5 = max(0 , arr(BAS7NQ * TX23/100) - 5 * RIVNONQ) ;

RIVNONO = arr(arr(BAS7NO/6) * TX12/100) ;
RIVNONO5 = max(0 , arr(BAS7NO * TX12/100) - 5 * RIVNONO) ;


RIVNOPG = arr(arr(BAS7PG/9) * TX29/100) ;
RIVNOPG8 = max(0 , arr(BAS7PG * TX29/100) - 8 * RIVNOPG) ;

RIVNONN = arr(arr(BAS7NN/9) * TX18/100) ;
RIVNONN8 = max(0 , arr(BAS7NN * TX18/100) - 8 * RIVNONN) ;

RIVNOPF = arr(arr(BAS7PF/6) * TX23/100) ;
RIVNOPF5 = max(0 , arr(BAS7PF * TX23/100) - 5 * RIVNOPF) ;

RIVNONM = arr(arr(BAS7NM/6) * TX12/100) ;
RIVNONM5 = max(0 , arr(BAS7NM * TX12/100) - 5 * RIVNONM) ;


RIVNONL = arr(arr(BAS7NL/9) * TX29/100) ;
RIVNONL8 = max(0 , arr(BAS7NL * TX29/100) - 8 * RIVNONL) ;

RIVNONJ = arr(arr(BAS7NJ/9) * TX18/100) ;
RIVNONJ8 = max(0 , arr(BAS7NJ * TX18/100) - 8 * RIVNONJ) ;

RIVNONK = arr(arr(BAS7NK/6) * TX23/100) ;
RIVNONK5 = max(0 , arr(BAS7NK * TX23/100) - 5 * RIVNONK) ;

RIVNONI = arr(arr(BAS7NI/6) * TX12/100) ;
RIVNONI5 = max(0 , arr(BAS7NI * TX12/100) - 5 * RIVNONI) ;


RIVPIRR = arr(arr(BAS7RR/3) * (TX06/100)) * (1 - V_CNR) ;
RIVPIRR2 = max(0 , arr(BAS7RR * (TX06/100)) - 2 * RIVPIRR) * (1 - V_CNR) ;

RIVPIRS = arr(arr(BAS7RS/3) * (TX06/100)) * (1 - V_CNR) ;
RIVPIRS2 = max(0 , arr(BAS7RS * (TX06/100)) - 2 * RIVPIRS) * (1 - V_CNR) ;

RIVPIRX = arr(arr(BAS7RX/3) * (TX06/100)) * (1 - V_CNR) ;
RIVPIRX2 = max(0 , arr(BAS7RX * (TX06/100)) - 2 * RIVPIRX) * (1 - V_CNR) ;

RIVPIRY = arr(arr(BAS7RY/3) * (TX06/100)) * (1 - V_CNR) ;
RIVPIRY2 = max(0 , arr(BAS7RY * (TX06/100)) - 2 * RIVPIRY) * (1 - V_CNR) ;

RIVPIWA = arr(arr(BAS7WA/3) * (TX03/100)) * (1 - V_CNR) ;
RIVPIWA2 = max(0 , arr(BAS7WA * (TX03/100)) - 2 * RIVPIWA) * (1 - V_CNR) ;

RIVPIWB = arr(arr(BAS7WB/3) * (TX03/100)) * (1 - V_CNR) ;
RIVPIWB2 = max(0 , arr(BAS7WB * (TX03/100)) - 2 * RIVPIWB) * (1 - V_CNR) ;

RIVPIXA = arr(arr(BAS7XA/3) * (TX03/100)) * (1 - V_CNR) ;
RIVPIXA2 = max(0 , arr(BAS7XA * (TX03/100)) - 2 * RIVPIXA) * (1 - V_CNR) ;

RIVPIXB = arr(arr(BAS7XB/3) * (TX03/100)) * (1 - V_CNR) ;
RIVPIXB2 = max(0 , arr(BAS7XB * (TX03/100)) - 2 * RIVPIXB) * (1 - V_CNR) ;

RIVPIRV = arr(arr(BAS7RV/3) * (TX03/100)) * (1 - V_CNR) ;
RIVPIRV2 = max(0 , arr(BAS7RV * (TX03/100)) - 2 * RIVPIRV) * (1 - V_CNR) ;

RIVPIRW = arr(arr(BAS7RW/3) * (TX03/100)) * (1 - V_CNR) ;
RIVPIRW2 = max(0 , arr(BAS7RW * (TX03/100)) - 2 * RIVPIRW) * (1 - V_CNR) ;

RIVPISH = arr(arr(BAS7SH/3) * (TX03/100)) * (1 - V_CNR) ;
RIVPISH2 = max(0 , arr(BAS7SH * (TX03/100)) - 2 * RIVPISH) * (1 - V_CNR) ;

RIVPISI = arr(arr(BAS7SI/3) * (TX03/100)) * (1 - V_CNR) ;
RIVPISI2 = max(0 , arr(BAS7SI * (TX03/100)) - 2 * RIVPISI) * (1 - V_CNR) ;

REPIVZ = RIVPIVZ * 7 + RIVPIVZ8 ;
REPIVX = RIVPIVX * 7 + RIVPIVX8 ;
REPIVY = RIVPIVY * 4 + RIVPIVY5 ;
REPIVW = RIVPIVW * 4 + RIVPIVW5 ;
REPISG = RIVPISG * 7 + RIVPISG8 ;
REPISE = RIVPISE * 7 + RIVPISE8 ;
REPISF = RIVPISF * 4 + RIVPISF5 ;
REPISD = RIVPISD * 4 + RIVPISD5 ;
REPIVG = RIVPIVG * 7 + RIVPIVG8 ;
REPIVE = RIVPIVE * 7 + RIVPIVE8 ;
REPIVF = RIVPIVF * 4 + RIVPIVF5 ;
REPIVD = RIVPIVD * 4 + RIVPIVD5 ;
REPIQU = RIVPIQU * 7 + RIVPIQU8 ;
REPIQS = RIVPIQS * 7 + RIVPIQS8 ;
REPIQT = RIVPIQT * 4 + RIVPIQT5 ;
REPIQR = RIVPIQR * 4 + RIVPIQR5 ;
REPIQP = RIVPIQP * 7 + RIVPIQP8 ;
REPIQN = RIVPIQN * 7 + RIVPIQN8 ;
REPIQO = RIVPIQO * 4 + RIVPIQO5 ;
REPIQM = RIVPIQM * 4 + RIVPIQM5 ;
REPIQL = RIVPIQL * 7 + RIVPIQL8 ;
REPIQJ = RIVPIQJ * 7 + RIVPIQJ8 ;
REPIQK = RIVPIQK * 4 + RIVPIQK5 ;
REPIQI = RIVPIQI * 4 + RIVPIQI5 ;
RENOPG = RIVNOPG * 7 + RIVNOPG8 ;
RENONN = RIVNONN * 7 + RIVNONN8 ;
RENOPF = RIVNOPF * 4 + RIVNOPF5 ;
RENONM = RIVNONM * 4 + RIVNONM5 ;
RENONL = RIVNONL * 7 + RIVNONL8 ;
RENONJ = RIVNONJ * 7 + RIVNONJ8 ;
RENONK = RIVNONK * 4 + RIVNONK5 ;
RENONI = RIVNONI * 4 + RIVNONI5 ;
RENONO = RIVNONO * 4 + RIVNONO5 ;
RENONP = RIVNONP * 7 + RIVNONP8 ;
RENONQ = RIVNONQ * 4 + RIVNONQ5 ;
RENONR = RIVNONR * 7 + RIVNONR8 ;
RENOLQ = RIVNOLQ * 4 + RIVNOLQ5 ;
RENOLR = RIVNOLR * 7 + RIVNOLR8 ;
RENOLS = RIVNOLS * 4 + RIVNOLS5 ;
RENOLT = RIVNOLT * 7 + RIVNOLT8 ;
REPIRR = RIVPIRR + RIVPIRR2 ;
REPIRS = RIVPIRS + RIVPIRS2 ;
REPIRX = RIVPIRX + RIVPIRX2 ;
REPIRY = RIVPIRY + RIVPIRY2 ;
REPIWA = RIVPIWA + RIVPIWA2 ;
REPIWB = RIVPIWB + RIVPIWB2 ;
REPIXA = RIVPIXA + RIVPIXA2 ;
REPIXB = RIVPIXB + RIVPIXB2 ;
REPIRV = RIVPIRV + RIVPIRV2 ;
REPIRW = RIVPIRW + RIVPIRW2 ;
REPISH = RIVPISH + RIVPISH2 ;
REPISI = RIVPISI + RIVPISI2 ;

regle 401300:
application : iliad ;

DCELSOM1 = COD7MS + COD7MT + COD7MU + COD7MV + COD7MO + COD7MA + COD7MP + COD7MB + COD7MQ + COD7MC + COD7MR + COD7MD 
           + COD7MI + COD7MJ + COD7MK + COD7ML + COD7NS + COD7NT + COD7NU + COD7NV + COD7OJ + COD7OU + COD7OV + COD7OW ;

ACELSOM1 = DCELSOM1 * ( 1 - V_CNR ) * (1 - positif(PREM8_11));

regle 401301:
application : iliad ;

REDUCAVTCEL = RREPA + RDONDJ + RDONDO + RLOCANAH + RDIFAGRI + RPRESSE + RFORET + RFIPDOM + RFIPC + RCINE + RRESTIMO + RSOCREPR + RRPRESCOMP 
              + RHEBE + RSURV + RINNO + RSOUFIP + RRIRENOV + RLOGDOM + RCOMP + RRETU + RDONS + CRDIE + RDUFREP + RPINELTOT 
	      + RNORMTOT + RNOUV + RPENTOT + RREHAB + RRESTREP + RRESTIMO1 ;

VARTMP1 = DEC11 + REDUCAVTCEL ;

RCELMS_1 = max(min(COD7MS , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELMS = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELMS_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELMS_1 , max(max(RCELMS_P,RCELMS_PA),RCELMS1731))*(1-V_INDTEO)+RCELMS_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELMS ;

RCELMT_1 = max(min(COD7MT , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELMT = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELMT_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELMT_1 , max(max(RCELMT_P,RCELMT_PA),RCELMT1731))*(1-V_INDTEO)+RCELMT_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELMT ;

RCELMU_1 = max(min(COD7MU , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELMU = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELMU_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELMU_1 , max(max(RCELMU_P,RCELMU_PA),RCELMU1731))*(1-V_INDTEO)+RCELMU_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELMU ;

RCELMV_1 = max(min(COD7MV , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELMV = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELMV_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELMV_1 , max(max(RCELMV_P,RCELMV_PA),RCELMV1731))*(1-V_INDTEO)+RCELMV_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELMV ;

RCELMO_1 = max(min(COD7MO , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELMO = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELMO_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELMO_1 , max(max(RCELMO_P,RCELMO_PA),RCELMO1731))*(1-V_INDTEO)+RCELMO_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELMO ;

RCELMP_1 = max(min(COD7MP , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELMP = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELMP_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELMP_1 , max(max(RCELMP_P,RCELMP_PA),RCELMP1731))*(1-V_INDTEO)+RCELMP_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELMP ;

RCELMQ_1 = max(min(COD7MQ , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELMQ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELMQ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELMQ_1 , max(max(RCELMQ_P,RCELMQ_PA),RCELMQ1731))*(1-V_INDTEO)+RCELMQ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELMQ ;

RCELMR_1 = max(min(COD7MR , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELMR = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELMR_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELMR_1 , max(max(RCELMR_P,RCELMR_PA),RCELMR1731))*(1-V_INDTEO)+RCELMR_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELMR ;

RCELMA_1 = max(min(COD7MA , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELMA = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELMA_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELMA_1 , max(max(RCELMA_P,RCELMA_PA),RCELMA1731))*(1-V_INDTEO)+RCELMA_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELMA ;

RCELMB_1 = max(min(COD7MB , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELMB = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELMB_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELMB_1 , max(max(RCELMB_P,RCELMB_PA),RCELMB1731))*(1-V_INDTEO)+RCELMB_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELMB ;

RCELMC_1 = max(min(COD7MC , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELMC = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELMC_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELMC_1 , max(max(RCELMC_P,RCELMC_PA),RCELMC1731))*(1-V_INDTEO)+RCELMC_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELMC ;

RCELMD_1 = max(min(COD7MD , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELMD = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELMD_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELMD_1 , max(max(RCELMD_P,RCELMD_PA),RCELMD1731))*(1-V_INDTEO)+RCELMD_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELMD ;

RCELMI_1 = max(min(COD7MI , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELMI = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELMI_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELMI_1 , max(max(RCELMI_P,RCELMI_PA),RCELMI1731))*(1-V_INDTEO)+RCELMI_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELMI ;

RCELMJ_1 = max(min(COD7MJ , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELMJ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELMJ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELMJ_1 , max(max(RCELMJ_P,RCELMJ_PA),RCELMJ1731))*(1-V_INDTEO)+RCELMJ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELMJ ;

RCELMK_1 = max(min(COD7MK , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELMK = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELMK_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELMK_1 , max(max(RCELMK_P,RCELMK_PA),RCELMK1731))*(1-V_INDTEO)+RCELMK_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELMK ;

RCELML_1 = max(min(COD7ML , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELML = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELML_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELML_1 , max(max(RCELML_P,RCELML_PA),RCELML1731))*(1-V_INDTEO)+RCELML_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELML ;

RCELNS_1 = max(min(COD7NS , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELNS = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELNS_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELNS_1 , max(max(RCELNS_P,RCELNS_PA),RCELNS1731))*(1-V_INDTEO)+RCELNS_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELNS ;

RCELNT_1 = max(min(COD7NT , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELNT = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELNT_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELNT_1 , max(max(RCELNT_P,RCELNT_PA),RCELNT1731))*(1-V_INDTEO)+RCELNT_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELNT ;

RCELNU_1 = max(min(COD7NU , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELNU = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELNU_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELNU_1 , max(max(RCELNU_P,RCELNU_PA),RCELNU1731))*(1-V_INDTEO)+RCELNU_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELNU ;

RCELNV_1 = max(min(COD7NV , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELNV = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELNV_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELNV_1 , max(max(RCELNV_P,RCELNV_PA),RCELNV1731))*(1-V_INDTEO)+RCELNV_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELNV ;

RCELOJ_1 = max(min(COD7OJ , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELOJ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELOJ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELOJ_1 , max(max(RCELOJ_P,RCELOJ_PA),RCELOJ1731))*(1-V_INDTEO)+RCELOJ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELOJ ;

RCELOU_1 = max(min(COD7OU , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELOU = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELOU_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELOU_1 , max(max(RCELOU_P,RCELOU_PA),RCELOU1731))*(1-V_INDTEO)+RCELOU_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELOU ;

RCELOV_1 = max(min(COD7OV , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELOV = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELOV_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELOV_1 , max(max(RCELOV_P,RCELOV_PA),RCELOV1731))*(1-V_INDTEO)+RCELOV_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELOV ;

RCELOW_1 = max(min(COD7OW , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELOW = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELOW_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELOW_1 , max(max(RCELOW_P,RCELOW_PA),RCELOW1731))*(1-V_INDTEO)+RCELOW_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = 0 ;

RCELSOM1 = RCELMS + RCELMT + RCELMU + RCELMV + RCELMO + RCELMA + RCELMP + RCELMB + RCELMQ + RCELMC + RCELMR + RCELMD 
           + RCELMI + RCELMJ + RCELMK + RCELML + RCELNS + RCELNT + RCELNU + RCELNV + RCELOJ + RCELOU + RCELOV + RCELOW ;

RCELSOM1_1 = RCELMS_1 + RCELMT_1 + RCELMU_1 + RCELMV_1 + RCELMO_1 + RCELMA_1 + RCELMP_1 + RCELMB_1 + RCELMQ_1 + RCELMC_1 + RCELMR_1 + RCELMD_1 
             + RCELMI_1 + RCELMJ_1 + RCELMK_1 + RCELML_1 + RCELNS_1 + RCELNT_1 + RCELNU_1 + RCELNV_1 + RCELOJ_1 + RCELOU_1 + RCELOV_1 + RCELOW_1 ;

regle 401302:
application : iliad ;

DCELSOM2 = COD7YI + COD7ZI + COD7YJ + COD7ZJ + COD7YK + COD7ZK + COD7YL + COD7ZL + COD7UU + COD7UV + COD7UW + COD7UX 
           + COD7RK + COD7RL + COD7RM + COD7RN + COD7LK + COD7LL + COD7LO + COD7LP + COD7IM + COD7IN + COD7IO + COD7IP ;

ACELSOM2 = DCELSOM2 * (1 - V_CNR) * (1 - positif(PREM8_11));

regle 401303:
application : iliad ;

VARTMP1 = DEC11 + REDUCAVTCEL + RCELSOM1 ;

RCELYI_1 = max(min(COD7YI , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELYI = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELYI_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELYI_1 , max(max(RCELYI_P,RCELYI_PA),RCELYI1731))*(1-V_INDTEO)+RCELYI_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELYI ;

RCELYJ_1 = max(min(COD7YJ , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELYJ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELYJ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELYJ_1 , max(max(RCELYJ_P,RCELYJ_PA),RCELYJ1731))*(1-V_INDTEO)+RCELYJ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELYJ ;

RCELYK_1 = max(min(COD7YK , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELYK = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELYK_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELYK_1 , max(max(RCELYK_P,RCELYK_PA),RCELYK1731))*(1-V_INDTEO)+RCELYK_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELYK ;

RCELYL_1 = max(min(COD7YL , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELYL = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELYL_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELYL_1 , max(max(RCELYL_P,RCELYL_PA),RCELYL1731))*(1-V_INDTEO)+RCELYL_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELYL ;

RCELZI_1 = max(min(COD7ZI , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELZI = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELZI_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELZI_1 , max(max(RCELZI_P,RCELZI_PA),RCELZI1731))*(1-V_INDTEO)+RCELZI_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELZI ;

RCELZJ_1 = max(min(COD7ZJ , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELZJ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELZJ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELZJ_1 , max(max(RCELZJ_P,RCELZJ_PA),RCELZJ1731))*(1-V_INDTEO)+RCELZJ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELZJ ;

RCELZK_1 = max(min(COD7ZK , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELZK = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELZK_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELZK_1 , max(max(RCELZK_P,RCELZK_PA),RCELZK1731))*(1-V_INDTEO)+RCELZK_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELZK ;

RCELZL_1 = max(min(COD7ZL , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELZL = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELZL_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34  -CMAJ)))
         + (max(0 , min(RCELZL_1 , max(max(RCELZL_P,RCELZL_PA),RCELZL1731))*(1-V_INDTEO)+RCELZL_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELZL ;

RCELKD_1 = max(min(COD7KD , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELKD = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELKD_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELKD_1 , max(max(RCELKD_P,RCELKD_PA),RCELKD1731))*(1-V_INDTEO)+RCELKD_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELKD ;

RCELKC_1 = max(min(COD7KC , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELKC = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELKC_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELKC_1 , max(max(RCELKC_P,RCELKC_PA),RCELKC1731))*(1-V_INDTEO)+RCELKC_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELKC ;

RCELUU_1 = max(min(COD7UU , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELUU = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELUU_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34  -CMAJ)))
         + (max(0 , min(RCELUU_1 , max(max(RCELUU_P,RCELUU_PA),RCELUU1731))*(1-V_INDTEO)+RCELUU_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELUU ;

RCELUV_1 = max(min(COD7UV , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELUV = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELUV_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34  -CMAJ)))
         + (max(0 , min(RCELUV_1 , max(max(RCELUV_P,RCELUV_PA),RCELUV1731))*(1-V_INDTEO)+RCELUV_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELUV ;

RCELUW_1 = max(min(COD7UW , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELUW = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELUW_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34  -CMAJ)))
         + (max(0 , min(RCELUW_1 , max(max(RCELUW_P,RCELUW_PA),RCELUW1731))*(1-V_INDTEO)+RCELUW_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELUW ;

RCELUX_1 = max(min(COD7UX , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELUX = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELUX_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34  -CMAJ)))
         + (max(0 , min(RCELUX_1 , max(max(RCELUX_P,RCELUX_PA),RCELUX1731))*(1-V_INDTEO)+RCELUX_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELUX ;

RCELPD_1 = max(min(COD7PD , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELPD = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELPD_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELPD_1 , max(max(RCELPD_P,RCELPD_PA),RCELPD1731))*(1-V_INDTEO)+RCELPD_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELPD ;

RCELPC_1 = max(min(COD7PC , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELPC = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELPC_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELPC_1 , max(max(RCELPC_P,RCELPC_PA),RCELPC1731))*(1-V_INDTEO)+RCELPC_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELPC ;

RCELPE_1 = max(min(COD7PE , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELPE = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELPE_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELPE_1 , max(max(RCELPE_P,RCELPE_PA),RCELPE1731))*(1-V_INDTEO)+RCELPE_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELPE ;

RCELRK_1 = max(min(COD7RK , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELRK = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELRK_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34  -CMAJ)))
         + (max(0 , min(RCELRK_1 , max(max(RCELRK_P,RCELRK_PA),RCELRK1731))*(1-V_INDTEO)+RCELRK_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELRK ;

RCELRL_1 = max(min(COD7RL , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELRL = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELRL_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34  -CMAJ)))
         + (max(0 , min(RCELRL_1 , max(max(RCELRL_P,RCELRL_PA),RCELRL1731))*(1-V_INDTEO)+RCELRL_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELRL ;

RCELRM_1 = max(min(COD7RM , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELRM = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELRM_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34  -CMAJ)))
         + (max(0 , min(RCELRM_1 , max(max(RCELRM_P,RCELRM_PA),RCELRM1731))*(1-V_INDTEO)+RCELRM_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELRM ;

RCELRN_1 = max(min(COD7RN , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELRN = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELRN_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34  -CMAJ)))
         + (max(0 , min(RCELRN_1 , max(max(RCELRN_P,RCELRN_PA),RCELRN1731))*(1-V_INDTEO)+RCELRN_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELRN ;

RCELHZ_1 = max(min(COD7HZ , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELHZ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELHZ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELHZ_1 , max(max(RCELHZ_P,RCELHZ_PA),RCELHZ1731))*(1-V_INDTEO)+RCELHZ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELHZ ;

RCELKU_1 = max(min(COD7KU , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELKU = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELKU_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELKU_1 , max(max(RCELKU_P,RCELKU_PA),RCELKU1731))*(1-V_INDTEO)+RCELKU_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELKU ;

RCELKT_1 = max(min(COD7KT , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELKT = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELKT_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELKT_1 , max(max(RCELKT_P,RCELKT_PA),RCELKT1731))*(1-V_INDTEO)+RCELKT_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELKT ;

RCELKV_1 = max(min(COD7KV , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELKV = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELKV_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELKV_1 , max(max(RCELKV_P,RCELKV_PA),RCELKV1731))*(1-V_INDTEO)+RCELKV_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELKV ;

RCELLK_1 = max(min(COD7LK , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELLK = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELLK_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34  -CMAJ)))
         + (max(0 , min(RCELLK_1 , max(max(RCELLK_P,RCELLK_PA),RCELLK1731))*(1-V_INDTEO)+RCELLK_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELLK ;

RCELLL_1 = max(min(COD7LL , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELLL = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELLL_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34  -CMAJ)))
         + (max(0 , min(RCELLL_1 , max(max(RCELLL_P,RCELLL_PA),RCELLL1731))*(1-V_INDTEO)+RCELLL_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELLL ;

RCELLO_1 = max(min(COD7LO , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELLO = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELLO_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34  -CMAJ)))
         + (max(0 , min(RCELLO_1 , max(max(RCELLO_P,RCELLO_PA),RCELLO1731))*(1-V_INDTEO)+RCELLO_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELLO ;

RCELLP_1 = max(min(COD7LP , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELLP = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELLP_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34  -CMAJ)))
         + (max(0 , min(RCELLP_1 , max(max(RCELLP_P,RCELLP_PA),RCELLP1731))*(1-V_INDTEO)+RCELLP_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELLP ;

RCELIV_1 = max(min(COD7IV , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELIV = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELIV_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELIV_1 , max(max(RCELIV_P,RCELIV_PA),RCELIV1731))*(1-V_INDTEO)+RCELIV_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELIV ;

RCELIY_1 = max(min(COD7IY , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELIY = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELIY_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELIY_1 , max(max(RCELIY_P,RCELIY_PA),RCELIY1731))*(1-V_INDTEO)+RCELIY_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELIY ;

RCELIX_1 = max(min(COD7IX , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELIX = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELIX_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELIX_1 , max(max(RCELIX_P,RCELIX_PA),RCELIX1731))*(1-V_INDTEO)+RCELIX_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELIX ;

RCELIZ_1 = max(min(COD7IZ , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELIZ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELIZ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELIZ_1 , max(max(RCELIZ_P,RCELIZ_PA),RCELIZ1731))*(1-V_INDTEO)+RCELIZ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELIZ ;

RCELIM_1 = max(min(COD7IM , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELIM = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELIM_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELIM_1 , max(max(RCELIM_P,RCELIM_PA),RCELIM1731))*(1-V_INDTEO)+RCELIM_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELIM ;

RCELIN_1 = max(min(COD7IN , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELIN = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELIN_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELIN_1 , max(max(RCELIN_P,RCELIN_PA),RCELIN1731))*(1-V_INDTEO)+RCELIN_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELIN ;

RCELIO_1 = max(min(COD7IO , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELIO = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELIO_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELIO_1 , max(max(RCELIO_P,RCELIO_PA),RCELIO1731))*(1-V_INDTEO)+RCELIO_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELIO ;

RCELIP_1 = max(min(COD7IP , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELIP = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELIP_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELIP_1 , max(max(RCELIP_P,RCELIP_PA),RCELIP1731))*(1-V_INDTEO)+RCELIP_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELIP ;

RCELVJ_1 = max(min(COD7VJ , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELVJ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELVJ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELVJ_1 , max(max(RCELVJ_P,RCELVJ_PA),RCELVJ1731))*(1-V_INDTEO)+RCELVJ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELVJ ;

RCELVL_1 = max(min(COD7VL , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELVL = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELVL_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELVL_1 , max(max(RCELVL_P,RCELVL_PA),RCELVL1731))*(1-V_INDTEO)+RCELVL_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELVL ;

RCELVK_1 = max(min(COD7VK , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELVK = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELVK_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELVK_1 , max(max(RCELVK_P,RCELVK_PA),RCELVK1731))*(1-V_INDTEO)+RCELVK_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELVK ;

RCELVO_1 = max(min(COD7VO , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELVO = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELVO_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RCELVO_1 , max(max(RCELVO_P,RCELVO_PA),RCELVO1731))*(1-V_INDTEO)+RCELVO_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = 0 ;

RCELSOM2 = RCELYI + RCELZI + RCELYJ + RCELZJ + RCELYK + RCELZK + RCELYL + RCELZL + RCELUU + RCELUV + RCELUW + RCELUX 
           + RCELRK + RCELRL + RCELRM + RCELRN + RCELLK + RCELLL + RCELLO + RCELLP + RCELIM + RCELIN + RCELIO + RCELIP ;

RCELSOM2_1 = RCELYI_1 + RCELZI_1 + RCELYJ_1 + RCELZJ_1 + RCELYK_1 + RCELZK_1 + RCELYL_1 + RCELZL_1 + RCELUU_1 + RCELUV_1 + RCELUW_1 + RCELUX_1 
             + RCELRK_1 + RCELRL_1 + RCELRM_1 + RCELRN_1 + RCELLK_1 + RCELLL_1 + RCELLO_1 + RCELLP_1 + RCELIM_1 + RCELIN_1 + RCELIO_1 + RCELIP_1 ;

regle 401304:
application : iliad ;

DCELSOM5 = COD7HZ + COD7KC + COD7PC + COD7KT + COD7KD + COD7PD + COD7KU + COD7PE + COD7KV + COD7IV + COD7IX + COD7IY + COD7IZ + COD7VJ + COD7VL + COD7VK + COD7VO ;

ACELSOM5 = DCELSOM5 * (1 - V_CNR) * (1 - positif(PREM8_11));

regle 401305:
application : iliad ;

RCELSOM5 = RCELHZ + RCELKC + RCELPC + RCELKT + RCELKD + RCELPD + RCELKU + RCELPE + RCELKV + RCELIV + RCELIY + RCELIX + RCELIZ + RCELVJ + RCELVL + RCELVK + RCELVO ;

RCELSOM5_1 = RCELHZ_1 + RCELKC_1 + RCELPC_1 + RCELKT_1 + RCELKD_1 + RCELPD_1 + RCELKU_1 + RCELPE_1 + RCELKV_1 + RCELIV_1 + RCELIY_1 + RCELIX_1 + RCELIZ_1 + RCELVJ_1 + RCELVL_1 + RCELVK_1 + RCELVO_1 ;

regle 401306:
application : iliad ;

ACELREPWW_1 = (min(LIMREPSC7 , CELREPWW) * (1 - COD7YE) + CELREPWW * COD7YE) * (1 - V_CNR) ;
ACELREPWW = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ACELREPWW_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
            + (max(0 , min(ACELREPWW_1 , max(max(ACELREPWW_P,ACELREPWW_PA),ACELREPWW1731))*(1-V_INDTEO)+ACELREPWW_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ACELREPWV_1 = (min(LIMREPSC7 , CELREPWV) * (1 - COD7YE) + CELREPWV * COD7YE) * (1 - V_CNR) ;
ACELREPWV = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ACELREPWV_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
            + (max(0 , min(ACELREPWV_1 , max(max(ACELREPWV_P,ACELREPWV_PA),ACELREPWV1731))*(1-V_INDTEO)+ACELREPWV_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ; 

ACELREPWU_1 = (min(LIMREPSC6 , CELREPWU) * (1 - COD7YE) + CELREPWU * COD7YE) * (1 - V_CNR) ;
ACELREPWU = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ACELREPWU_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
            + (max(0 , min(ACELREPWU_1 , max(max(ACELREPWU_P,ACELREPWU_PA),ACELREPWU1731))*(1-V_INDTEO)+ACELREPWU_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ACELREPWT_1 = (min(LIMREPSC4 , CELREPWT) * (1 - COD7YE) + CELREPWT * COD7YE) * (1 - V_CNR) ;
ACELREPWT = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ACELREPWT_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
            + (max(0 , min(ACELREPWT_1 , max(max(ACELREPWT_P,ACELREPWT_PA),ACELREPWT1731))*(1-V_INDTEO)+ACELREPWT_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ACELRU_1 = (min(LIMREPSC3 , COD7RU) * (1 - COD7YE) + COD7RU * COD7YE) * (1 - V_CNR) ;
ACELRU = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ACELRU_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ACELRU_1 , max(max(ACELRU_P,ACELRU_PA),ACELRU1731))*(1-V_INDTEO)+ACELRU_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ACELRT_1 = (min(LIMREPSC4 , COD7RT) * (1 - COD7YE) + COD7RT * COD7YE) * (1 - V_CNR) ;
ACELRT = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ACELRT_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ACELRT_1 , max(max(ACELRT_P,ACELRT_PA),ACELRT1731))*(1-V_INDTEO)+ACELRT_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DCELSOM4 = CELREPWW + CELREPWV + CELREPWU + CELREPWT + COD7RU + COD7RT ;

ACELSOM4 = ACELREPWW + ACELREPWV + ACELREPWU + ACELREPWT + ACELRU + ACELRT ;

regle 401308:
application : iliad ;

VARTMP1 = DEC11 + REDUCAVTCEL + RCELSOM1 + RCELSOM2 + RCELSOM5 ;

RCELREPWW_1 = max(min(ACELREPWW , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELREPWW =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RCELREPWW_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RCELREPWW_1,max(max(RCELREPWW_P,RCELREPWW_PA),RCELREPWW1731))*(1-V_INDTEO)+RCELREPWW_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RCELREPWW ;

RCELREPWV_1 = max(min(ACELREPWV , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELREPWV =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RCELREPWV_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RCELREPWV_1,max(max(RCELREPWV_P,RCELREPWV_PA),RCELREPWV1731))*(1-V_INDTEO)+RCELREPWV_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RCELREPWV ;

RCELREPWU_1 = max(min(ACELREPWU , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELREPWU =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RCELREPWU_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RCELREPWU_1,max(max(RCELREPWU_P,RCELREPWU_PA),RCELREPWU1731))*(1-V_INDTEO)+RCELREPWU_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RCELREPWU ;

RCELREPWT_1 = max(min(ACELREPWT , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELREPWT =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RCELREPWT_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RCELREPWT_1,max(max(RCELREPWT_P,RCELREPWT_PA),RCELREPWT1731))*(1-V_INDTEO)+RCELREPWT_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RCELREPWT ;

RCELRU_1 = max(min(ACELRU , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELRU =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RCELRU_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RCELRU_1,max(max(RCELRU_P,RCELRU_PA),RCELRU1731))*(1-V_INDTEO)+RCELRU_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RCELRU ;

RCELRT_1 = max(min(ACELRT , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELRT =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RCELRT_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RCELRT_1,max(max(RCELRT_P,RCELRT_PA),RCELRT1731))*(1-V_INDTEO)+RCELRT_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = 0 ;

RCELSOM4 = RCELREPWW + RCELREPWV + RCELREPWU + RCELREPWT + RCELRU + RCELRT ;

RCELSOM4_1 = min(ACELREPWW_1 + ACELREPWV_1 + ACELREPWU_1 + ACELREPWT_1 + ACELRU_1 + ACELRT_1
	         , IDOM11-(DEC11 + REDUCAVTCEL + RCELSOM1_1 + RCELSOM2_1 + RCELSOM5_1)) ;

regle 401310:
application : iliad ;

ASC601_1 = (min(LIMREPSC3 * (1 - COD7YE) , COD7AN) + (COD7YE * COD7AN)) * (1 - V_CNR) ;
ASC601 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC601_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC601_1 , max(max(ASC601_P,ASC601_PA),ASC6011731))*(1-V_INDTEO)+ASC601_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC602_1 = (min(LIMREPSC11 * (1 - COD7YE) , COD7AM) + (COD7YE * COD7AM)) * (1 - V_CNR) ;
ASC602 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC602_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC602_1 , max(max(ASC602_P,ASC602_PA),ASC6021731))*(1-V_INDTEO)+ASC602_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC603_1 = (min(LIMREPSC12 * (1 - COD7YE) , COD7AL) + (COD7YE * COD7AL)) * (1 - V_CNR) ;
ASC603 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC603_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC603_1 , max(max(ASC603_P,ASC603_PA),ASC6031731))*(1-V_INDTEO)+ASC603_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC604_1 = (min(LIMREPSC2 * (1 - COD7YE) , COD7AK) + (COD7YE * COD7AK)) * (1 - V_CNR) ;
ASC604 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC604_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC604_1 , max(max(ASC604_P,ASC604_PA),ASC6041731))*(1-V_INDTEO)+ASC604_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC605_1 = (min(LIMREPSC3 * (1 - COD7YE) , COD7AX) + (COD7YE * COD7AX)) * (1 - V_CNR) ;
ASC605 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC605_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC605_1 , max(max(ASC605_P,ASC605_PA),ASC6051731))*(1-V_INDTEO)+ASC605_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC606_1 = (min(LIMREPSC11 * (1 - COD7YE) , COD7AW) + (COD7YE * COD7AW)) * (1 - V_CNR) ;
ASC606 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC606_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC606_1 , max(max(ASC606_P,ASC606_PA),ASC6061731))*(1-V_INDTEO)+ASC606_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC607_1 = (min(LIMREPSC12 * (1 - COD7YE) , COD7AV) + (COD7YE * COD7AV)) * (1 - V_CNR) ;
ASC607 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC607_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC607_1 , max(max(ASC607_P,ASC607_PA),ASC6071731))*(1-V_INDTEO)+ASC607_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC608_1 = (min(LIMREPSC2 * (1 - COD7YE) , COD7AO) + (COD7YE * COD7AO)) * (1 - V_CNR) ;
ASC608 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC608_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC608_1 , max(max(ASC608_P,ASC608_PA),ASC6081731))*(1-V_INDTEO)+ASC608_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC609_1 = (min(LIMREPSC11 * (1 - COD7YE) , COD7AY) + (COD7YE * COD7AY)) * (1 - V_CNR) ;
ASC609 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC609_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC609_1 , max(max(ASC609_P,ASC609_PA),ASC6091731))*(1-V_INDTEO)+ASC609_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC610_1 = (min(LIMREPSC12 * (1 - COD7YE) , COD7AZ) + (COD7YE * COD7AZ)) * (1 - V_CNR) ;
ASC610 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC610_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC610_1 , max(max(ASC610_P,ASC610_PA),ASC6101731))*(1-V_INDTEO)+ASC610_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC611_1 = (min(LIMREPSC2 * (1 - COD7YE) , COD7BP) + (COD7YE * COD7BP)) * (1 - V_CNR) ;
ASC611 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC611_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC611_1 , max(max(ASC611_P,ASC611_PA),ASC6111731))*(1-V_INDTEO)+ASC611_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC612_1 = (min(LIMREPSC12 * (1 - COD7YE) , COD7BR) + (COD7YE * COD7BR)) * (1 - V_CNR) ;
ASC612 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC612_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC612_1 , max(max(ASC612_P,ASC612_PA),ASC6121731))*(1-V_INDTEO)+ASC612_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC613_1 = (min(LIMREPSC2 * (1 - COD7YE) , COD7BV) + (COD7YE * COD7BV)) * (1 - V_CNR) ;
ASC613 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC613_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC613_1 , max(max(ASC613_P,ASC613_PA),ASC6131731))*(1-V_INDTEO)+ASC613_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC614_1 = (min(LIMREPSC3 * (1 - COD7YE) , COD7ER) + (COD7YE * COD7ER)) * (1 - V_CNR) ;
ASC614 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC614_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC614_1 , max(max(ASC614_P,ASC614_PA),ASC6141731))*(1-V_INDTEO)+ASC614_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC615_1 = (min(LIMREPSC11 * (1 - COD7YE) , COD7EQ) + (COD7YE * COD7EQ)) * (1 - V_CNR) ;
ASC615 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC615_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC615_1 , max(max(ASC615_P,ASC615_PA),ASC6151731))*(1-V_INDTEO)+ASC615_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC616_1 = (min(LIMREPSC12 * (1 - COD7YE) , COD7EM) + (COD7YE * COD7EM)) * (1 - V_CNR) ;
ASC616 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC616_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC616_1 , max(max(ASC616_P,ASC616_PA),ASC6161731))*(1-V_INDTEO)+ASC616_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC617_1 = (min(LIMREPSC2 * (1 - COD7YE) , COD7EL) + (COD7YE * COD7EL)) * (1 - V_CNR) ;
ASC617 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC617_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC617_1 , max(max(ASC617_P,ASC617_PA),ASC6171731))*(1-V_INDTEO)+ASC617_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC618_1 = (min(LIMREPSC3 * (1 - COD7YE) , COD7FA) + (COD7YE * COD7FA)) * (1 - V_CNR) ;
ASC618 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC618_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC618_1 , max(max(ASC618_P,ASC618_PA),ASC6181731))*(1-V_INDTEO)+ASC618_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC619_1 = (min(LIMREPSC11 * (1 - COD7YE) , COD7EX) + (COD7YE * COD7EX)) * (1 - V_CNR) ;
ASC619 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC619_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC619_1 , max(max(ASC619_P,ASC619_PA),ASC6191731))*(1-V_INDTEO)+ASC619_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC620_1 = (min(LIMREPSC12 * (1 - COD7YE) , COD7EW) + (COD7YE * COD7EW)) * (1 - V_CNR) ;
ASC620 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC620_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC620_1 , max(max(ASC620_P,ASC620_PA),ASC6201731))*(1-V_INDTEO)+ASC620_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC621_1 = (min(LIMREPSC2 * (1 - COD7YE) , COD7EV) + (COD7YE * COD7EV)) * (1 - V_CNR) ;
ASC621 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC621_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC621_1 , max(max(ASC621_P,ASC621_PA),ASC6211731))*(1-V_INDTEO)+ASC621_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC622_1 = (min(LIMREPSC12 * (1 - COD7YE) , COD7FC) + (COD7YE * COD7FC)) * (1 - V_CNR) ;
ASC622 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC622_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC622_1 , max(max(ASC622_P,ASC622_PA),ASC6221731))*(1-V_INDTEO)+ASC622_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC623_1 = (min(LIMREPSC2 * (1 - COD7YE) , COD7FD) + (COD7YE * COD7FD)) * (1 - V_CNR) ;
ASC623 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC623_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ASC623_1 , max(max(ASC623_P,ASC623_PA),ASC6231731))*(1-V_INDTEO)+ASC623_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DCELSOM6 = COD7AN + COD7AM + COD7AL + COD7AK + COD7AX + COD7AW + COD7AV + COD7AO + COD7AY + COD7AZ + COD7BP + COD7BR + COD7BV 
           + COD7ER + COD7EQ + COD7EM + COD7EL + COD7FA + COD7EX + COD7EW + COD7EV + COD7FC + COD7FD ;

ACELSOM6 = ASC601 + ASC602 + ASC603 + ASC604 + ASC605 + ASC606 + ASC607 + ASC608 + ASC609 + ASC610 + ASC611 + ASC612 + ASC613
           + ASC614 + ASC615 + ASC616 + ASC617 + ASC618 + ASC619 + ASC620 + ASC621 + ASC622 + ASC623 ;

regle 401312:
application : iliad ;

VARTMP1 = DEC11 + REDUCAVTCEL + RCELSOM1 + RCELSOM2 + RCELSOM5 + RCELSOM4 ;

RSC601_1 = max(min(ASC601 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC601 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC601_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC601_1 , max(max(RSC601_P,RSC601_PA),RSC6011731))*(1-V_INDTEO)+RSC601_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC601 ;

RSC602_1 = max(min(ASC602 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC602 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC602_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC602_1 , max(max(RSC602_P,RSC602_PA),RSC6021731))*(1-V_INDTEO)+RSC602_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC602 ;

RSC603_1 = max(min(ASC603 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC603 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC603_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC603_1 , max(max(RSC603_P,RSC603_PA),RSC6031731))*(1-V_INDTEO)+RSC603_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC603 ;

RSC604_1 = max(min(ASC604 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC604 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC604_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC604_1 , max(max(RSC604_P,RSC604_PA),RSC6041731))*(1-V_INDTEO)+RSC604_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC604 ;

RSC605_1 = max(min(ASC605 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC605 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC605_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC605_1 , max(max(RSC605_P,RSC605_PA),RSC6051731))*(1-V_INDTEO)+RSC605_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC605 ;

RSC606_1 = max(min(ASC606 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC606 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC606_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC606_1 , max(max(RSC606_P,RSC606_PA),RSC6061731))*(1-V_INDTEO)+RSC606_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC606 ;

RSC607_1 = max(min(ASC607 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC607 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC607_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC607_1 , max(max(RSC607_P,RSC607_PA),RSC6071731))*(1-V_INDTEO)+RSC607_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC607 ;

RSC608_1 = max(min(ASC608 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC608 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC608_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC608_1 , max(max(RSC608_P,RSC608_PA),RSC6081731))*(1-V_INDTEO)+RSC608_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC608 ;

RSC609_1 = max(min(ASC609 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC609 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC609_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC609_1 , max(max(RSC609_P,RSC609_PA),RSC6091731))*(1-V_INDTEO)+RSC609_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC609 ;

RSC610_1 = max(min(ASC610 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC610 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC610_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC610_1 , max(max(RSC610_P,RSC610_PA),RSC6101731))*(1-V_INDTEO)+RSC610_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC610 ;

RSC611_1 = max(min(ASC611 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC611 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC611_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC611_1 , max(max(RSC611_P,RSC611_PA),RSC6111731))*(1-V_INDTEO)+RSC611_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC611 ;

RSC612_1 = max(min(ASC612 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC612 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC612_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC612_1 , max(max(RSC612_P,RSC612_PA),RSC6121731))*(1-V_INDTEO)+RSC612_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC612 ;

RSC613_1 = max(min(ASC613 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC613 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC613_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC613_1 , max(max(RSC613_P,RSC613_PA),RSC6131731))*(1-V_INDTEO)+RSC613_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC613 ;

RSC614_1 = max(min(ASC614 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC614 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC614_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC614_1 , max(max(RSC614_P,RSC614_PA),RSC6141731))*(1-V_INDTEO)+RSC614_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC614 ;

RSC615_1 = max(min(ASC615 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC615 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC615_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC615_1 , max(max(RSC615_P,RSC615_PA),RSC6151731))*(1-V_INDTEO)+RSC615_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC615 ;

RSC616_1 = max(min(ASC616 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC616 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC616_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC616_1 , max(max(RSC616_P,RSC616_PA),RSC6161731))*(1-V_INDTEO)+RSC616_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC616 ;

RSC617_1 = max(min(ASC617 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC617 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC617_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC617_1 , max(max(RSC617_P,RSC617_PA),RSC6171731))*(1-V_INDTEO)+RSC617_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC617 ;

RSC618_1 = max(min(ASC618 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC618 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC618_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC618_1 , max(max(RSC618_P,RSC618_PA),RSC6181731))*(1-V_INDTEO)+RSC618_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC618 ;

RSC619_1 = max(min(ASC619 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC619 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC619_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC619_1 , max(max(RSC619_P,RSC619_PA),RSC6191731))*(1-V_INDTEO)+RSC619_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC619 ;

RSC620_1 = max(min(ASC620 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC620 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC620_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC620_1 , max(max(RSC620_P,RSC620_PA),RSC6201731))*(1-V_INDTEO)+RSC620_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC620 ;

RSC621_1 = max(min(ASC621 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC621 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC621_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC621_1 , max(max(RSC621_P,RSC621_PA),RSC6211731))*(1-V_INDTEO)+RSC621_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC621 ;

RSC622_1 = max(min(ASC622 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC622 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC622_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC622_1 , max(max(RSC622_P,RSC622_PA),RSC6221731))*(1-V_INDTEO)+RSC622_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC622 ;

RSC623_1 = max(min(ASC623 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC623 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC623_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC623_1 , max(max(RSC623_P,RSC623_PA),RSC6231731))*(1-V_INDTEO)+RSC623_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = 0 ;

RCELSOM6 = RSC601 + RSC602 + RSC603 + RSC604 + RSC605 + RSC606 + RSC607 + RSC608 + RSC609 + RSC610 + RSC611 + RSC612 + RSC613 
           + RSC614 + RSC615 + RSC616 + RSC617 + RSC618 + RSC619 + RSC620 + RSC621 + RSC622 + RSC623 ;

RCELSOM6_1 = min(ASC601_1 + ASC602_1 + ASC603_1 + ASC604_1 + ASC605_1 + ASC606_1 + ASC607_1 + ASC608_1 + ASC609_1 + ASC610_1 + ASC611_1 + ASC612_1 + ASC613_1 
                 + ASC614_1 + ASC615_1 + ASC616_1 + ASC617_1 + ASC618_1 + ASC619_1 + ASC620_1 + ASC621_1 + ASC622_1 + ASC623_1 
                 , IDOM11-(DEC11 + REDUCAVTCEL + RCELSOM1 + RCELSOM2 + RCELSOM5 + RCELSOM4)) ;

regle 401314:
application : iliad ;

ASC801_1 = (min(LIMREPSC11 * (1 - COD7YE) , COD7DA) + (COD7YE * COD7DA)) * (1 - V_CNR) ;
ASC801 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC801_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC801_1 , max(max(ASC801_P,ASC801_PA),ASC8011731))*(1-V_INDTEO)+ASC801_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC802_1 = (min(LIMREPSC11 * (1 - COD7YE) , COD7DD) + (COD7YE * COD7DD)) * (1 - V_CNR) ;
ASC802 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC802_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC802_1 , max(max(ASC802_P,ASC802_PA),ASC8021731))*(1-V_INDTEO)+ASC802_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC803_1 = (min(LIMREPSC3 * (1 - COD7YE) , COD7DE) + (COD7YE * COD7DE)) * (1 - V_CNR) ;
ASC803 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC803_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC803_1 , max(max(ASC803_P,ASC803_PA),ASC8031731))*(1-V_INDTEO)+ASC803_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC804_1 = (min(LIMREPSC11 * (1 - COD7YE) , COD7DF) + (COD7YE * COD7DF)) * (1 - V_CNR) ;
ASC804 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC804_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC804_1 , max(max(ASC804_P,ASC804_PA),ASC8041731))*(1-V_INDTEO)+ASC804_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC805_1 = (min(LIMREPSC12 * (1 - COD7YE) , COD7DH) + (COD7YE * COD7DH)) * (1 - V_CNR) ;
ASC805 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC805_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC805_1 , max(max(ASC805_P,ASC805_PA),ASC8051731))*(1-V_INDTEO)+ASC805_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC806_1 = (min(LIMREPSC2 * (1 - COD7YE) , COD7DJ) + (COD7YE * COD7DJ)) * (1 - V_CNR) ;
ASC806 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC806_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC806_1 , max(max(ASC806_P,ASC806_PA),ASC8061731))*(1-V_INDTEO)+ASC806_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC807_1 = (min(LIMREPSC11 * (1 - COD7YE) , COD7DK) + (COD7YE * COD7DK)) * (1 - V_CNR) ;
ASC807 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC807_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC807_1 , max(max(ASC807_P,ASC807_PA),ASC8071731))*(1-V_INDTEO)+ASC807_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC808_1 = (min(LIMREPSC12 * (1 - COD7YE) , COD7DM) + (COD7YE * COD7DM)) * (1 - V_CNR) ;
ASC808 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC808_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC808_1 , max(max(ASC808_P,ASC808_PA),ASC8081731))*(1-V_INDTEO)+ASC808_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC809_1 = (min(LIMREPSC2 * (1 - COD7YE) , COD7DN) + (COD7YE * COD7DN)) * (1 - V_CNR) ;
ASC809 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC809_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC809_1 , max(max(ASC809_P,ASC809_PA),ASC8091731))*(1-V_INDTEO)+ASC809_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DCELSOM8 = COD7DA + COD7DD + COD7DE + COD7DF + COD7DH + COD7DJ + COD7DK + COD7DM + COD7DN ;
ACELSOM8 = ASC801 + ASC802 + ASC803 + ASC804 + ASC805 + ASC806 + ASC807 + ASC808 + ASC809 ;

regle 402314:
application : iliad ;

VARTMP1 = DEC11 + REDUCAVTCEL + RCELSOM1 + RCELSOM2 + RCELSOM5 + RCELSOM4 + RCELSOM6 ;

RSC801_1 = max(min(ASC801 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC801 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC801_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC801_1 , max(max(RSC801_P,RSC801_PA),RSC8011731))*(1-V_INDTEO)+RSC801_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC801 ;

RSC802_1 = max(min(ASC802 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC802 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC802_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC802_1 , max(max(RSC802_P,RSC802_PA),RSC8021731))*(1-V_INDTEO)+RSC802_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC802 ;

RSC803_1 = max(min(ASC803 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC803 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC803_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC803_1 , max(max(RSC803_P,RSC803_PA),RSC8031731))*(1-V_INDTEO)+RSC803_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC803 ;

RSC804_1 = max(min(ASC804 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC804 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC804_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC804_1 , max(max(RSC804_P,RSC804_PA),RSC8041731))*(1-V_INDTEO)+RSC804_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC804 ;

RSC805_1 = max(min(ASC805 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC805 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC805_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC805_1 , max(max(RSC805_P,RSC805_PA),RSC8051731))*(1-V_INDTEO)+RSC805_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC805 ;

RSC806_1 = max(min(ASC806 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC806 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC806_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC806_1 , max(max(RSC806_P,RSC806_PA),RSC8061731))*(1-V_INDTEO)+RSC806_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC806 ;

RSC807_1 = max(min(ASC807 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC807 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC807_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC807_1 , max(max(RSC807_P,RSC807_PA),RSC8071731))*(1-V_INDTEO)+RSC807_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC807 ;

RSC808_1 = max(min(ASC808 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC808 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC808_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC808_1 , max(max(RSC808_P,RSC808_PA),RSC8081731))*(1-V_INDTEO)+RSC808_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC808 ;

RSC809_1 = max(min(ASC809 , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC809 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC809_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC809_1 , max(max(RSC809_P,RSC809_PA),RSC8091731))*(1-V_INDTEO)+RSC809_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = 0 ;

RCELSOM8 = RSC801 + RSC802 + RSC803 + RSC804 + RSC805 + RSC806 + RSC807 + RSC808 + RSC809 ;
RCELSOM8_1 = RSC801_1 + RSC802_1 + RSC803_1 + RSC804_1 + RSC805_1 + RSC806_1 + RSC807_1 + RSC808_1 + RSC809_1 ;

regle 401315:
application : iliad ;

ASC7SJ_1 = (min(LIMREPSC11 * (1 - COD7YE) , COD7SJ) + (COD7YE * COD7SJ)) * (1 - V_CNR) ;
ASC7SJ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC7SJ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC7SJ_1 , max(max(ASC7SJ_P,ASC7SJ_PA),ASC7SJ1731))*(1-V_INDTEO)+ASC7SJ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC7SK_1 = (min(LIMREPSC3 * (1 - COD7YE) , COD7SK) + (COD7YE * COD7SK)) * (1 - V_CNR) ;
ASC7SK = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC7SK_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC7SK_1 , max(max(ASC7SK_P,ASC7SK_PA),ASC7SK1731))*(1-V_INDTEO)+ASC7SK_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC7SR_1 = (min(LIMREPSC12 * (1 - COD7YE) , COD7SR) + (COD7YE * COD7SR)) * (1 - V_CNR) ;
ASC7SR = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC7SR_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC7SR_1 , max(max(ASC7SR_P,ASC7SR_PA),ASC7SR1731))*(1-V_INDTEO)+ASC7SR_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC7TC_1 = (min(LIMREPSC11 * (1 - COD7YE) , COD7TC) + (COD7YE * COD7TC)) * (1 - V_CNR) ;
ASC7TC = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC7TC_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC7TC_1 , max(max(ASC7TC_P,ASC7TC_PA),ASC7TC1731))*(1-V_INDTEO)+ASC7TC_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC7TD_1 = (min(LIMREPSC3 * (1 - COD7YE) , COD7TD) + (COD7YE * COD7TD)) * (1 - V_CNR) ;
ASC7TD = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC7TD_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC7TD_1 , max(max(ASC7TD_P,ASC7TD_PA),ASC7TD1731))*(1-V_INDTEO)+ASC7TD_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC7UA_1 = (min(LIMREPSC11 * (1 - COD7YE) , COD7UA) + (COD7YE * COD7UA)) * (1 - V_CNR) ;
ASC7UA = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC7UA_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC7UA_1 , max(max(ASC7UA_P,ASC7UA_PA),ASC7UA1731))*(1-V_INDTEO)+ASC7UA_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC7UB_1 = (min(LIMREPSC12 * (1 - COD7YE) , COD7UB) + (COD7YE * COD7UB)) * (1 - V_CNR) ;
ASC7UB = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC7UB_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC7UB_1 , max(max(ASC7UB_P,ASC7UB_PA),ASC7UB1731))*(1-V_INDTEO)+ASC7UB_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC7UE_1 = (min(LIMREPSC2 * (1 - COD7YE) , COD7UE) + (COD7YE * COD7UE)) * (1 - V_CNR) ;
ASC7UE = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC7UE_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC7UE_1 , max(max(ASC7UE_P,ASC7UE_PA),ASC7UE1731))*(1-V_INDTEO)+ASC7UE_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC7UG_1 = (min(LIMREPSC11 * (1 - COD7YE) , COD7UG) + (COD7YE * COD7UG)) * (1 - V_CNR) ;
ASC7UG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC7UG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC7UG_1 , max(max(ASC7UG_P,ASC7UG_PA),ASC7UG1731))*(1-V_INDTEO)+ASC7UG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC7UI_1 = (min(LIMREPSC12 * (1 - COD7YE) , COD7UI) + (COD7YE * COD7UI)) * (1 - V_CNR) ;
ASC7UI = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC7UI_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC7UI_1 , max(max(ASC7UI_P,ASC7UI_PA),ASC7UI1731))*(1-V_INDTEO)+ASC7UI_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ASC7UK_1 = (min(LIMREPSC2 * (1 - COD7YE) , COD7UK) + (COD7YE * COD7UK)) * (1 - V_CNR) ;
ASC7UK = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ASC7UK_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(ASC7UK_1 , max(max(ASC7UK_P,ASC7UK_PA),ASC7UK1731))*(1-V_INDTEO)+ASC7UK_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DCELSOM9 = COD7SJ + COD7SK + COD7SR + COD7TC + COD7TD + COD7UA + COD7UB + COD7UE + COD7UG + COD7UI + COD7UK ;
ACELSOM9 = ASC7SJ + ASC7SK + ASC7SR + ASC7TC + ASC7TD + ASC7UA + ASC7UB + ASC7UE + ASC7UG + ASC7UI + ASC7UK ;

regle 402315:
application : iliad ;

VARTMP1 = DEC11 + REDUCAVTCEL + RCELSOM1 + RCELSOM2 + RCELSOM5 + RCELSOM4 + RCELSOM6 + RCELSOM8 ;

RSC7SJ_1 = max(min(ASC7SJ , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC7SJ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC7SJ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC7SJ_1 , max(max(RSC7SJ_P,RSC7SJ_PA),RSC7SJ1731))*(1-V_INDTEO)+RSC7SJ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC7SJ ;

RSC7SK_1 = max(min(ASC7SK , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC7SK = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC7SK_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC7SK_1 , max(max(RSC7SK_P,RSC7SK_PA),RSC7SK1731))*(1-V_INDTEO)+RSC7SK_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC7SK ;

RSC7SR_1 = max(min(ASC7SR , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC7SR = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC7SR_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC7SR_1 , max(max(RSC7SR_P,RSC7SR_PA),RSC7SR1731))*(1-V_INDTEO)+RSC7SR_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC7SR ;

RSC7TC_1 = max(min(ASC7TC , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC7TC = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC7TC_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC7TC_1 , max(max(RSC7TC_P,RSC7TC_PA),RSC7TC1731))*(1-V_INDTEO)+RSC7TC_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC7TC ;

RSC7TD_1 = max(min(ASC7TD , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC7TD = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC7TD_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC7TD_1 , max(max(RSC7TD_P,RSC7TD_PA),RSC7TD1731))*(1-V_INDTEO)+RSC7TD_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC7TD ;

RSC7UA_1 = max(min(ASC7UA , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC7UA = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC7UA_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC7UA_1 , max(max(RSC7UA_P,RSC7UA_PA),RSC7UA1731))*(1-V_INDTEO)+RSC7UA_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC7UA ;

RSC7UB_1 = max(min(ASC7UB , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC7UB = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC7UB_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC7UB_1 , max(max(RSC7UB_P,RSC7UB_PA),RSC7UB1731))*(1-V_INDTEO)+RSC7UB_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC7UB ;

RSC7UE_1 = max(min(ASC7UE , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC7UE = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC7UE_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC7UE_1 , max(max(RSC7UE_P,RSC7UE_PA),RSC7UE1731))*(1-V_INDTEO)+RSC7UE_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC7UE ;

RSC7UG_1 = max(min(ASC7UG , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC7UG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC7UG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC7UG_1 , max(max(RSC7UG_P,RSC7UG_PA),RSC7UG1731))*(1-V_INDTEO)+RSC7UG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC7UG ;

RSC7UI_1 = max(min(ASC7UI , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC7UI = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC7UI_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC7UI_1 , max(max(RSC7UI_P,RSC7UI_PA),RSC7UI1731))*(1-V_INDTEO)+RSC7UI_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC7UI ;

RSC7UK_1 = max(min(ASC7UK , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC7UK = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC7UK_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RSC7UK_1 , max(max(RSC7UK_P,RSC7UK_PA),RSC7UK1731))*(1-V_INDTEO)+RSC7UK_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = 0 ;

RCELSOM9 = RSC7SJ + RSC7SK + RSC7SR + RSC7TC + RSC7TD + RSC7UA + RSC7UB + RSC7UE + RSC7UG + RSC7UI + RSC7UK ;
RCELSOM9_1 = RSC7SJ_1 + RSC7SK_1 + RSC7SR_1 + RSC7TC_1 + RSC7TD_1 + RSC7UA_1 + RSC7UB_1 + RSC7UE_1 + RSC7UG_1 + RSC7UI_1 + RSC7UK_1 ;

regle 401316:
application : iliad ;

DCELP1A = COD7ZN + COD7YP ;
ACELP1A_1 = arr((min(DCELP1A , LIMCELLIER) * (1 - COD7YE) + DCELP1A * COD7YE) /3) * (1 - V_CNR) ;
ACELP1A = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ACELP1A_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ACELP1A_1 , max(max(ACELP1A_P,ACELP1A_PA),ACELP1A1731))*(1-V_INDTEO)+ACELP1A_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DCELP1B = COD7ZH + COD7ZG + COD7YN + COD7YO ;
ACELP1B_1 = arr((min(DCELP1B , LIMCELLIER) * (1 - COD7YE) + DCELP1B * COD7YE) /3) * (1 - V_CNR) ;
ACELP1B = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ACELP1B_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ACELP1B_1 , max(max(ACELP1B_P,ACELP1B_PA),ACELP1B1731))*(1-V_INDTEO)+ACELP1B_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DCELP1C = COD7ZC + COD7ZD + COD7ZE + COD7ZF + COD7XN + COD7YA + COD7YC + COD7YM ;
ACELP1C_1 = arr((min(DCELP1C , LIMCELLIER) * (1 - COD7YE) + DCELP1C * COD7YE) /3) * (1 - V_CNR) ;
ACELP1C = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ACELP1C_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ACELP1C_1 , max(max(ACELP1C_P,ACELP1C_PA),ACELP1C1731))*(1-V_INDTEO)+ACELP1C_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DCELP1D = COD7YD + COD7YF + COD7ZA + COD7ZB + COD7XD + COD7XE + COD7XL + COD7XM ;
ACELP1D_1 = arr((min(DCELP1D , LIMCELLIER) * (1 - COD7YE) + DCELP1D * COD7YE) /3) * (1 - V_CNR) ;
ACELP1D = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ACELP1D_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ACELP1D_1 , max(max(ACELP1D_P,ACELP1D_PA),ACELP1D1731))*(1-V_INDTEO)+ACELP1D_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DCELP1E = COD7YB + COD7XC ;
ACELP1E_1 = arr((min(DCELP1E , LIMCELLIER) * (1 - COD7YE) + DCELP1E * COD7YE) /3) * (1 - V_CNR) ;
ACELP1E = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ACELP1E_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ACELP1E_1 , max(max(ACELP1E_P,ACELP1E_PA),ACELP1E1731))*(1-V_INDTEO)+ACELP1E_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;


PCEL1A = arr(ACELP1A * (TX06/100)) ;
PCEL1A_1 = arr(ACELP1A_1 * (TX06/100)) ;

PCEL1B = arr(ACELP1B * (TX06/100)) ;
PCEL1B_1 = arr(ACELP1B_1 * (TX06/100)) ;

PCEL1C = arr(ACELP1C * (TX06/100)) * positif(COD7ZD + COD7ZE + COD7YA + COD7YC)
         + arr(ACELP1C * (TX05/100)) * positif(COD7ZC + COD7ZF + COD7XN + COD7YM) ;
PCEL1C_1 = arr(ACELP1C_1 * (TX06/100)) * positif(COD7ZD + COD7ZE + COD7YA + COD7YC)
           + arr(ACELP1C_1 * (TX05/100)) * positif(COD7ZC + COD7ZF + COD7XN + COD7YM) ;

PCEL1D = arr(ACELP1D * (TX05/100)) * positif(COD7YF + COD7ZA + COD7XE + COD7XL)
         + arr(ACELP1D * (TX04/100)) * positif(COD7YD + COD7ZB + COD7XD + COD7XM) ;
PCEL1D_1 = arr(ACELP1D_1 * (TX05/100)) * positif(COD7YF + COD7ZA + COD7XE + COD7XL)
           + arr(ACELP1D_1 * (TX04/100)) * positif(COD7YD + COD7ZB + COD7XD + COD7XM) ;

PCEL1E = arr(ACELP1E * (TX04/100)) ;
PCEL1E_1 = arr(ACELP1E_1 * (TX04/100)) ;

regle 401318:
application : iliad ;

VARTMP1 = DEC11 + REDUCAVTCEL + RCELSOM1 + RCELSOM2 + RCELSOM5 + RCELSOM4 + RCELSOM6 + RCELSOM8 + RCELSOM9 ;

RCELP1A_1 = max(min(PCEL1A , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELP1A = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELP1A_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RCELP1A_1 , max(max(RCELP1A_P,RCELP1A_PA),RCELP1A1731))*(1-V_INDTEO)+RCELP1A_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELP1A ;

RCELP1B_1 = max(min(PCEL1B , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELP1B = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELP1B_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RCELP1B_1 , max(max(RCELP1B_P,RCELP1B_PA),RCELP1B1731))*(1-V_INDTEO)+RCELP1B_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELP1B ;

RCELP1C_1 = max(min(PCEL1C , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELP1C = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELP1C_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RCELP1C_1 , max(max(RCELP1C_P,RCELP1C_PA),RCELP1C1731))*(1-V_INDTEO)+RCELP1C_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELP1C ;

RCELP1D_1 = max(min(PCEL1D , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELP1D = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELP1D_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RCELP1D_1 , max(max(RCELP1D_P,RCELP1D_PA),RCELP1D1731))*(1-V_INDTEO)+RCELP1D_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCELP1D ;

RCELP1E_1 = max(min(PCEL1E , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RCELP1E = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCELP1E_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RCELP1E_1 , max(max(RCELP1E_P,RCELP1E_PA),RCELP1E1731))*(1-V_INDTEO)+RCELP1E_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = 0 ;

DCELSOM7 = DCELP1A + DCELP1B + DCELP1C + DCELP1D + DCELP1E ;

ACELSOM7 = ACELP1A + ACELP1B + ACELP1C + ACELP1D + ACELP1E ;

RCELSOM7 = RCELP1A + RCELP1B + RCELP1C + RCELP1D + RCELP1E ;

RCELSOM7_1 = min(PCEL1A_1 + PCEL1B_1 + PCEL1C_1 + PCEL1D_1 + PCEL1E_1  
                 , IDOM11 - (DEC11 + REDUCAVTCEL + RCELSOM1_1 + RCELSOM2_1 + RCELSOM5_1 + RCELSOM4_1 + RCELSOM6_1 + RCELSOM8_1 + RCELSOM9_1)) ;

regle 401320:
application : iliad ;

DCELP2A = COD7GJ + COD7KK ;
ACELP2A_1 = arr((min(DCELP2A , LIMCELLIER) * (1 - COD7YE) + DCELP2A * COD7YE) /3) * (1 - V_CNR) ;
ACELP2A = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ACELP2A_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ACELP2A_1 , max(max(ACELP2A_P,ACELP2A_PA),ACELP2A1731))*(1-V_INDTEO)+ACELP2A_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DCELP2B = COD7GH + COD7GI + COD7KA + COD7KB ;
ACELP2B_1 = arr((min(DCELP2B , LIMCELLIER) * (1 - COD7YE) + DCELP2B * COD7YE) /3) * (1 - V_CNR) ;
ACELP2B = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ACELP2B_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ACELP2B_1 , max(max(ACELP2B_P,ACELP2B_PA),ACELP2B1731))*(1-V_INDTEO)+ACELP2B_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DCELP2C = COD7IR + COD7IS + COD7IT + COD7IU + COD7HY + COD7IJ + COD7IQ + COD7IW + COD7CB + COD7CC + COD7CF + COD7CG + COD7BI + COD7BQ + COD7BX + COD7BY ;
ACELP2C_1 = arr((min(DCELP2C , LIMCELLIER) * (1 - COD7YE) + DCELP2C * COD7YE) /3) * (1 - V_CNR) ;
ACELP2C = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ACELP2C_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ACELP2C_1 , max(max(ACELP2C_P,ACELP2C_PA),ACELP2C1731))*(1-V_INDTEO)+ACELP2C_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DCELP2D = COD7HA + COD7HJ + COD7HK + COD7HN + COD7CJ + COD7CK + COD7CL + COD7CM + COD7BZ + COD7DI + COD7DU + COD7DV ;
ACELP2D_1 = arr((min(DCELP2D , LIMCELLIER) * (1 - COD7YE) + DCELP2D * COD7YE) /3) * (1 - V_CNR) ;
ACELP2D = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ACELP2D_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ACELP2D_1 , max(max(ACELP2D_P,ACELP2D_PA),ACELP2D1731))*(1-V_INDTEO)+ACELP2D_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

DCELP2E = COD7CN + COD7DX ;
ACELP2E_1 = arr((min(DCELP2E , LIMCELLIER) * (1 - COD7YE) + DCELP2E * COD7YE) /3) * (1 - V_CNR) ;
ACELP2E = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ACELP2E_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ACELP2E_1 , max(max(ACELP2E_P,ACELP2E_PA),ACELP2E1731))*(1-V_INDTEO)+ACELP2E_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;


PCEL2A = arr(ACELP2A * (TX06/100)) ;
PCEL2A_1 = arr(ACELP2A_1 * (TX06/100)) ;

PCEL2B = arr(ACELP2B * (TX06/100)) ;
PCEL2B_1 = arr(ACELP2B_1 * (TX06/100)) ;

PCEL2C = arr(ACELP2C * (TX05/100)) * positif(COD7IR + COD7IU + COD7HY + COD7IW + COD7CB + COD7CG + COD7BI + COD7BY)
         + arr(ACELP2C * (TX06/100)) * positif(COD7IS + COD7IT + COD7IJ + COD7IQ + COD7CC + COD7CF + COD7BQ + COD7BX) ;
PCEL2C_1 = arr(ACELP2C_1 * (TX05/100)) * positif(COD7IR + COD7IU + COD7HY + COD7IW + COD7CB + COD7CG + COD7BI + COD7BY)
           + arr(ACELP2C_1 * (TX06/100)) * positif(COD7IS + COD7IT + COD7IJ + COD7IQ + COD7CC + COD7CF + COD7BQ + COD7BX) ;

PCEL2D = arr(ACELP2D * (TX04/100)) * positif(COD7HA + COD7HN + COD7CJ + COD7CM + COD7BZ + COD7DV)
         + arr(ACELP2D * (TX05/100)) * positif(COD7HJ + COD7HK + COD7CK + COD7CL + COD7DI + COD7DU) ;
PCEL2D_1 = arr(ACELP2D_1 * (TX04/100)) * positif(COD7HA + COD7HN + COD7CJ + COD7CM + COD7BZ + COD7DV)
           + arr(ACELP2D_1 * (TX05/100)) * positif(COD7HJ + COD7HK + COD7CK + COD7CL + COD7DI + COD7DU) ;

PCEL2E = arr(ACELP2E * (TX04/100)) ;
PCEL2E_1 = arr(ACELP2E_1 * (TX04/100)) ;

regle 401322:
application : iliad ;

VARTMP1 = DEC11 + REDUCAVTCEL + RCELSOM1 + RCELSOM2 + RCELSOM5 + RCELSOM4 + RCELSOM6 + RCELSOM8 + RCELSOM9 + RCELSOM7 ;

RSC301_1 = max(min(PCEL2C , IDOM11 - VARTMP1) , 0) * positif(COD7IR + COD7IS + COD7IT + COD7IU) * (1 - V_CNR) ;
RSC301 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC301_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSC301_1 , max(max(RSC301_P,RSC301_PA),RSC3011731))*(1-V_INDTEO)+RSC301_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC301 ;

RSC302_1 = max(min(PCEL2B , IDOM11 - VARTMP1) , 0) * positif(COD7GI + COD7GH) * (1 - V_CNR) ;
RSC302 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC302_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSC302_1 , max(max(RSC302_P,RSC302_PA),RSC3021731))*(1-V_INDTEO)+RSC302_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC302 ;

RSC303_1 = max(min(PCEL2A , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RSC303 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC303_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSC303_1 , max(max(RSC303_P,RSC303_PA),RSC3031731))*(1-V_INDTEO)+RSC303_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC303 ;

RSC304_1 = max(min(PCEL2B , IDOM11 - VARTMP1) , 0) * positif(COD7KA + COD7KB) * (1 - V_CNR) ;
RSC304 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC304_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSC304_1 , max(max(RSC304_P,RSC304_PA),RSC3041731))*(1-V_INDTEO)+RSC304_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC304 ;

RSC305_1 = max(min(PCEL2C , IDOM11 - VARTMP1) , 0) * positif(COD7HY + COD7IJ + COD7IQ + COD7IW) * (1 - V_CNR) ;
RSC305 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC305_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSC305_1 , max(max(RSC305_P,RSC305_PA),RSC3051731))*(1-V_INDTEO)+RSC305_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC305 ;

RSC306_1 = max(min(PCEL2D , IDOM11 - VARTMP1) , 0) * positif(COD7HA + COD7HJ + COD7HK + COD7HN) * (1 - V_CNR) ;
RSC306 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC306_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSC306_1 , max(max(RSC306_P,RSC306_PA),RSC3061731))*(1-V_INDTEO)+RSC306_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC306 ;

RSC307_1 = max(min(PCEL2C , IDOM11 - VARTMP1) , 0) * positif(COD7CB + COD7CC + COD7CF + COD7CG) * (1 - V_CNR) ;
RSC307 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC307_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSC307_1 , max(max(RSC307_P,RSC307_PA),RSC3071731))*(1-V_INDTEO)+RSC307_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC307 ;

RSC308_1 = max(min(PCEL2D , IDOM11 - VARTMP1) , 0) * positif(COD7CJ + COD7CK + COD7CL + COD7CM) * (1 - V_CNR) ;
RSC308 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC308_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSC308_1 , max(max(RSC308_P,RSC308_PA),RSC3081731))*(1-V_INDTEO)+RSC308_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC308 ;

RSC309_1 = max(min(PCEL2E , IDOM11 - VARTMP1) , 0) * positif(COD7CN) * (1 - V_CNR) ;
RSC309 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC309_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSC309_1 , max(max(RSC309_P,RSC309_PA),RSC3091731))*(1-V_INDTEO)+RSC309_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC309 ;

RSC310_1 = max(min(PCEL2C , IDOM11 - VARTMP1) , 0) * positif(COD7BI + COD7BQ + COD7BX + COD7BY) * (1 - V_CNR) ;
RSC310 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC310_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSC310_1 , max(max(RSC310_P,RSC310_PA),RSC3101731))*(1-V_INDTEO)+RSC310_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC310 ;

RSC311_1 = max(min(PCEL2D , IDOM11 - VARTMP1) , 0) * positif(COD7BZ + COD7DI + COD7DU + COD7DV) * (1 - V_CNR) ;
RSC311 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC311_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSC311_1 , max(max(RSC311_P,RSC311_PA),RSC3111731))*(1-V_INDTEO)+RSC311_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSC311 ;

RSC312_1 = max(min(PCEL2E , IDOM11 - VARTMP1) , 0) * positif(COD7DX) * (1 - V_CNR) ;
RSC312 = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSC312_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSC312_1 , max(max(RSC312_P,RSC312_PA),RSC3121731))*(1-V_INDTEO)+RSC312_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = 0 ;

DCELSOM3 = DCELP2A + DCELP2B + DCELP2C + DCELP2D + DCELP2E ;

ACELSOM3 = ACELP2A + ACELP2B + ACELP2C + ACELP2D + ACELP2E ;

RCELSOM3 = RSC301 + RSC302 + RSC303 + RSC304 + RSC305 + RSC306 + RSC307 + RSC308 + RSC309 + RSC310 + RSC311 + RSC312 ;

RCELSOM3_1 = min(PCEL2A_1 + PCEL2B_1 + PCEL2C_1 + PCEL2D_1 + PCEL2E_1
                 , IDOM11 - ( DEC11 + REDUCAVTCEL + RCELSOM1_1 + RCELSOM2_1 + RCELSOM5_1 + RCELSOM4_1 + RCELSOM6_1 + RCELSOM8_1 + RCELSOM9_1 + RCELSOM7_1)) ;

RCELTOT = RCELSOM1 + RCELSOM2 + RCELSOM5 + RCELSOM4 + RCELSOM6 + RCELSOM8 + RCELSOM9 + RCELSOM7 + RCELSOM3 ;

RCELTOT_1 = RCELSOM1_1 + RCELSOM2_1 + RCELSOM5_1 + RCELSOM4_1 + RCELSOM6_1 + RCELSOM8_1 + RCELSOM9_1 + RCELSOM7_1 + RCELSOM3_1 ;

regle 401324:
application : iliad ;


RIVCELZMN1 = (PCEL1A * (1 - positif(PREM8_11)) + PCEL1A_1 * positif(PREM8_11)) * (1 - V_CNR) ;

RIVCELZMN3 = (arr(min(DCELP1A , LIMCELLIER * (1 - COD7YE) + DCELP1A * COD7YE) * TX06/100) - (2 * RIVCELZMN1)) * (1 - V_CNR) ;

REPCELZMN = RIVCELZMN1 + RIVCELZMN3 ;

RIVCELZAB1 = (PCEL1B * (1 - positif(PREM8_11)) + PCEL1B_1 * positif(PREM8_11)) * (1 - V_CNR) ;

RIVCELZAB3 = (arr(min(DCELP1B , LIMCELLIER * (1 - COD7YE) + DCELP1B * COD7YE) * TX06/100) - (2 * RIVCELZAB1)) * (1 - V_CNR) ;

REPCELZAB = RIVCELZAB1 + RIVCELZAB3 ;

RIVCELSIJ1 = (PCEL1C * (1 - positif(PREM8_11)) + PCEL1C_1 * positif(PREM8_11)) * (1 - V_CNR) ;

RIVCELSIJ3 = (arr(min(DCELP1C , LIMCELLIER * (1 - COD7YE) + DCELP1C * COD7YE) 
              * (TX05/100 * positif(COD7ZC + COD7ZF + COD7XN + COD7YM) + TX06/100 * positif(COD7ZD + COD7ZE + COD7YA + COD7YC)))
	      - (2 * RIVCELSIJ1)) * (1 - V_CNR) ;

REPCELSIJKL = RIVCELSIJ1 + RIVCELSIJ3 ;

RIVCELRMN1 = (PCEL1D * (1 - positif(PREM8_11)) + PCEL1D_1 * positif(PREM8_11)) * (1 - V_CNR) ;

RIVCELRMN3 = (arr(min(DCELP1D , LIMCELLIER * (1 - COD7YE) + DCELP1D * COD7YE)
              * (TX04/100 * positif(COD7YD + COD7ZB + COD7XD + COD7XM) + TX05/100 * positif(COD7YF + COD7ZA + COD7XE + COD7XL)))
	      - (2 * RIVCELRMN1)) * (1 - V_CNR) ;

REPCELRMNOP = RIVCELRMN1 + RIVCELRMN3 ;

RIVCELRQ1 = (PCEL1E * (1 - positif(PREM8_11)) + PCEL1E_1 * positif(PREM8_11)) * (1 - V_CNR) ;

RIVCELRQ3 = (arr(min(DCELP1E , LIMCELLIER * (1 - COD7YE) + DCELP1E * COD7YE) * TX04/100) - (2 * RIVCELRQ1)) * (1 - V_CNR) ;

REPCELRQ = RIVCELRQ1 + RIVCELRQ3 ;

RIVCELIQ1 = (PCEL2A * (1 - positif(PREM8_11)) + PCEL2A_1 * positif(PREM8_11)) * (1 - V_CNR) ;

RIVCELIQ3 = (arr(min(DCELP2A , LIMCELLIER * (1 - COD7YE) + DCELP2A * COD7YE) * TX06/100) - (2 * RIVCELIQ1)) * (1 - V_CNR) ;

REPCELIQ = RIVCELIQ1 + RIVCELIQ3 ;

RIVCELHL1 = (PCEL2B * (1 - positif(PREM8_11)) + PCEL2B_1 * positif(PREM8_11)) * (1 - V_CNR) ;

RIVCELHL3 = (arr(min(DCELP2B , LIMCELLIER * (1 - COD7YE) + DCELP2B * COD7YE) * TX06/100) - (2 * RIVCELHL1)) * (1 - V_CNR) ;

REPCELHL = RIVCELHL1 + RIVCELHL3 ;

RIVCELR1 = (PCEL2C * (1 - positif(PREM8_11)) + PCEL2C_1 * positif(PREM8_11)) * positif(COD7IR + COD7IS + COD7IT + COD7IU + COD7HY + COD7IJ + COD7IQ + COD7IW) * (1 - V_CNR) ;

RIVCELR3 = (arr(min(DCELP2C , LIMCELLIER * (1 - COD7YE) + DCELP2C * COD7YE)
            * (TX05/100 * positif(COD7IR + COD7IU + COD7HY + COD7IW) + TX06/100 * positif(COD7IS + COD7IT + COD7IJ + COD7IQ)))
	    - (2 * RIVCELR1)) * (1 - V_CNR) ;

REPCELR = RIVCELR1 + RIVCELR3 ;

RIVCELP1 = (PCEL2D * (1 - positif(PREM8_11)) + PCEL2D_1 * positif(PREM8_11)) * positif(COD7HA + COD7HJ + COD7HK + COD7HN) * (1 - V_CNR) ;

RIVCELP3 = (arr(min(DCELP2D , LIMCELLIER * (1 - COD7YE) + DCELP2D * COD7YE)
            * (TX04/100 * positif(COD7HA + COD7HN) + TX05/100 * positif(COD7HJ + COD7HK)))
	    - (2 * RIVCELP1)) * (1 - V_CNR) ;

REPCELP = RIVCELP1 + RIVCELP3 ;

RIVCELXHI1 = (PCEL2C * (1 - positif(PREM8_11)) + PCEL2C_1 * positif(PREM8_11)) * positif(COD7CB + COD7CC + COD7CF + COD7CG + COD7BI + COD7BQ + COD7BX + COD7BY) * (1 - V_CNR) ;

RIVCELXHI3 = (arr(min(DCELP2C , LIMCELLIER * (1 - COD7YE) + DCELP2C * COD7YE)
              * (TX05/100 * positif(COD7CB + COD7CG + COD7BI + COD7BY) + TX06/100 * positif(COD7CC + COD7CF + COD7BQ + COD7BX))) 
              - (2 * RIVCELXHI1)) * (1 - V_CNR) ;

REPCELXHIJK = RIVCELXHI1 + RIVCELXHI3 ;

RIVCELJIJ1 = (PCEL2D * (1 - positif(PREM8_11)) + PCEL2D_1 * positif(PREM8_11)) * positif(COD7CJ + COD7CK + COD7CL + COD7CM + COD7BZ + COD7DI + COD7DU + COD7DV) * (1 - V_CNR) ;

RIVCELJIJ3 = (arr(min(DCELP2D , LIMCELLIER * (1 - COD7YE) + DCELP2D * COD7YE) 
              * (TX04/100 * positif(COD7CJ + COD7CM + COD7BZ + COD7DV) + TX05/100 * positif(COD7CK + COD7CL + COD7DI + COD7DU)))
              - (2 * RIVCELJIJ1)) * (1 - V_CNR) ;

REPCELJIJ = RIVCELJIJ1 + RIVCELJIJ3 ;

RIVCELMH1 = (PCEL2E * (1 - positif(PREM8_11)) + PCEL2E_1 * positif(PREM8_11)) * (1 - V_CNR) ;

RIVCELMH3 = (arr(min(DCELP2E , LIMCELLIER * (1 - COD7YE) + DCELP2E * COD7YE) * TX04/100) - (2 * RIVCELMH1)) * (1 - V_CNR) ;

REPCELMH = RIVCELMH1 + RIVCELMH3 ;

regle 401350:
application : iliad ;


RRCELMV = max(0 , COD7MV - RCELMV) * (1 - V_CNR) ; 

RRCELMR = max(0 , COD7MR - RCELMR) * (1 - V_CNR) ;

RRCELMD = max(0 , COD7MD - RCELMD) * (1 - V_CNR) ; 

RRCELML = max(0 , COD7ML - RCELML) * (1 - V_CNR) ; 

RRCELNV = max(0 , COD7NV - RCELNV) * (1 - V_CNR) ;

RRCELOW = max(0 , COD7OW - RCELOW) * (1 - V_CNR) ;

RRCELA = (max(0 , ACELREPWT + ACELRT 
                  - RCELREPWT - RCELRT) * positif(null(V_IND_TRAIT - 4)+positif(1 - COD9ZA) * (1-positif(PREM8_11))*  null(V_IND_TRAIT - 5))
	  + max(0 , (min(ACELREPWT_1 , max(max(ACELREPWT_P,ACELREPWT_PA),ACELREPWT1731)) *(1-V_INDTEO)+ACELREPWT_1*V_INDTEO)
	  + (min(ACELRT_1 , max(max(ACELRT_P,ACELRT_PA),ACELRT1731)) *(1-V_INDTEO)+ACELRT_1*V_INDTEO)
	    - (min(RCELREPWT_1 , max(max(RCELREPWT_P,RCELREPWT_PA),RCELREPWT1731) )*(1-V_INDTEO)+RCELREPWT_1*V_INDTEO)
	    - (min(RCELRT_1 , max(max(RCELRT_P,RCELRT_PA),RCELRT1731))*(1-V_INDTEO)+RCELRT_1*V_INDTEO) )
	     * positif(1 - COD9ZA) * positif(PREM8_11)*  null(V_IND_TRAIT - 5)) * (1 - V_CNR) ;


RRCELMU = max(0 , COD7MU - RCELMU) * (1 - V_CNR) ; 

RRCELMQ = max(0 , COD7MQ - RCELMQ) * (1 - V_CNR) ; 

RRCELMC = max(0 , COD7MC - RCELMC) * (1 - V_CNR) ; 

RRCELMK = max(0 , COD7MK - RCELMK) * (1 - V_CNR) ; 

RRCELNU = max(0 , COD7NU - RCELNU) * (1 - V_CNR) ;

RRCELOV = max(0 , COD7OV - RCELOV) * (1 - V_CNR) ;

RRCELB = (max(0 , ACELREPWU + ACELRU 
                  - RCELREPWU - RCELRU) * positif(null(V_IND_TRAIT - 4)+positif(1 - COD9ZA) * (1-positif(PREM8_11))*  null(V_IND_TRAIT - 5))
	  + max(0 , (min(ACELREPWU_1 , max(max(ACELREPWU_P,ACELREPWU_PA),ACELREPWU1731) )*(1-V_INDTEO)+ACELREPWU_1*V_INDTEO)
	  + (min(ACELRU_1 , max(max(ACELRU_P,ACELRU_PA),ACELRU1731) )*(1-V_INDTEO)+ACELRU_1*V_INDTEO)
	   - (min(RCELREPWU_1 , max(max(RCELREPWU_P,RCELREPWU_PA),RCELREPWU1731) )*(1-V_INDTEO)+RCELREPWU_1*V_INDTEO)
	   - (min(RCELRU_1 , max(max(RCELRU_P,RCELRU_PA),RCELRU1731))*(1-V_INDTEO)+RCELRU_1*V_INDTEO) )
	     * positif(1 - COD9ZA) * positif(PREM8_11)*  null(V_IND_TRAIT - 5)) * (1 - V_CNR) ;


RRCELMT = max(0 , COD7MT - RCELMT) * (1 - V_CNR) ; 

RRCELMP = max(0 , COD7MP - RCELMP) * (1 - V_CNR) ; 

RRCELMB = max(0 , COD7MB - RCELMB) * (1 - V_CNR) ; 

RRCELMJ = max(0 , COD7MJ - RCELMJ) * (1 - V_CNR) ; 

RRCELNT = max(0 , COD7NT - RCELNT) * (1 - V_CNR) ;

RRCELOU = max(0 , COD7OU - RCELOU) * (1 - V_CNR) ;

RRCELC = (max(0 , ACELREPWV - RCELREPWV) 
           * positif(null(V_IND_TRAIT - 4)+positif(1 - COD9ZA) * (1-positif(PREM8_11))*  null(V_IND_TRAIT - 5))
	  + max(0 , (min(ACELREPWV_1 , max(max(ACELREPWV_P,ACELREPWV_PA),ACELREPWV1731) )*(1-V_INDTEO)+ACELREPWV_1*V_INDTEO)
	    - (min(RCELREPWV_1 , max(max(RCELREPWV_P,RCELREPWV_PA),RCELREPWV1731))*(1-V_INDTEO)+RCELREPWV_1*V_INDTEO) )
	     * positif(1 - COD9ZA) * positif(PREM8_11)*  null(V_IND_TRAIT - 5)) * (1 - V_CNR) ;


RRCELMS = max(0 , COD7MS - RCELMS) * (1 - V_CNR) ; 

RRCELMO = max(0 , COD7MO - RCELMO) * (1 - V_CNR) ; 

RRCELMA = max(0 , COD7MA - RCELMA) * (1 - V_CNR) ; 

RRCELMI = max(0 , COD7MI - RCELMI) * (1 - V_CNR) ; 

RRCELNS = max(0 , COD7NS - RCELNS) * (1 - V_CNR) ;

RRCELOJ = max(0 , COD7OJ - RCELOJ) * (1 - V_CNR) ;

RRCELD = (max(0 , ACELREPWW - RCELREPWW) 
           * positif(null(V_IND_TRAIT - 4)+positif(1 - COD9ZA) * (1-positif(PREM8_11))*  null(V_IND_TRAIT - 5))
	  + max(0 , (min(ACELREPWW_1 , max(max(ACELREPWW_P,ACELREPWW_PA),ACELREPWW1731) )*(1-V_INDTEO)+ACELREPWW_1*V_INDTEO)
		    - (min(RCELREPWW_1 , max(max(RCELREPWW_P,RCELREPWW_PA),RCELREPWW1731))*(1-V_INDTEO)+RCELREPWW_1*V_INDTEO)
               ) * positif(1 - COD9ZA) * positif(PREM8_11)*  null(V_IND_TRAIT - 5)) * (1 - V_CNR) ;


RRCELYI = max(0 , COD7YI - RCELYI) * (1 - V_CNR) ;

RRCELZI = max(0 , COD7ZI - RCELZI) * (1 - V_CNR) ;

RRCELUU = max(0 , COD7UU - RCELUU) * (1 - V_CNR) ;

RRCELRK = max(0 , COD7RK - RCELRK) * (1 - V_CNR) ;

RRCELLK = max(0 , COD7LK - RCELLK) * (1 - V_CNR) ;

RRCELIM = max(0 , COD7IM - RCELIM) * (1 - V_CNR) ;

RRCELE = (max(0 , PCEL1A - RCELP1A + (PCEL1B - RCELP1B) * positif(COD7ZH + COD7YO) + ASC601 + ASC605 + ASC614 + ASC618 - RSC601 - RSC605 - RSC614 - RSC618) 
	   * positif(null(V_IND_TRAIT - 4)+positif(1 - COD9ZA) * (1-positif(PREM8_11))*  null(V_IND_TRAIT - 5))
	  + max(0 , PCEL1A_1 - (min(RCELP1A_1 , max(max(RCELP1A_P,RCELP1A_PA),RCELP1A1731) )*(1-V_INDTEO)+RCELP1A_1*V_INDTEO)
		    + (PCEL1B_1 - (min(RCELP1B_1 , max(max(RCELP1B_P,RCELP1B_PA),RCELP1B1731) )*(1-V_INDTEO)+RCELP1B_1*V_INDTEO)) * positif(COD7ZH + COD7YO)
		    + (min(ASC601_1 , max(max(ASC601_P , ASC601_PA) , ASC6011731))*(1-V_INDTEO) + ASC601_1*V_INDTEO)
		    + (min(ASC605_1 , max(max(ASC605_P , ASC605_PA) , ASC6051731))*(1-V_INDTEO) + ASC605_1*V_INDTEO)
		    + (min(ASC614_1 , max(max(ASC614_P , ASC614_PA) , ASC6141731))*(1-V_INDTEO) + ASC614_1*V_INDTEO)
		    + (min(ASC618_1 , max(max(ASC618_P , ASC618_PA) , ASC6181731))*(1-V_INDTEO) + ASC618_1*V_INDTEO)
		    - (min(RSC601_1 , max(max(RSC601_P , RSC601_PA) , RSC6011731))*(1-V_INDTEO) + RSC601_1*V_INDTEO)
		    - (min(RSC605_1 , max(max(RSC605_P , RSC605_PA) , RSC6051731))*(1-V_INDTEO) + RSC605_1*V_INDTEO)
		    - (min(RSC614_1 , max(max(RSC614_P , RSC614_PA) , RSC6141731))*(1-V_INDTEO) + RSC614_1*V_INDTEO)
		    - (min(RSC618_1 , max(max(RSC618_P , RSC618_PA) , RSC6181731))*(1-V_INDTEO) + RSC618_1*V_INDTEO)
	       ) * positif(1 - COD9ZA) * positif(PREM8_11)*  null(V_IND_TRAIT - 5)) * (1 - V_CNR) ;


RRCELYJ = max(0 , COD7YJ - RCELYJ) * (1 - V_CNR) ;

RRCELZJ = max(0 , COD7ZJ - RCELZJ) * (1 - V_CNR) ;

RRCELUV = max(0 , COD7UV - RCELUV) * (1 - V_CNR) ;

RRCELRL = max(0 , COD7RL - RCELRL) * (1 - V_CNR) ;

RRCELLL = max(0 , COD7LL - RCELLL) * (1 - V_CNR) ;

RRCELIN = max(0 , COD7IN - RCELIN) * (1 - V_CNR) ;

RRCELF = (max(0 , (PCEL1B - RCELP1B) * positif(COD7ZG + COD7YN) + (PCEL1C - RCELP1C) * positif(COD7ZD + COD7YA) 
                  + ASC602 + ASC606 + ASC609 + ASC615 + ASC619 - RSC602 - RSC606 - RSC609 - RSC615 - RSC619)  
	   * positif(null(V_IND_TRAIT - 4)+positif(1 - COD9ZA) * (1-positif(PREM8_11))*  null(V_IND_TRAIT - 5))
	  + max(0 , (PCEL1B_1 - (min(RCELP1B_1 , max(max(RCELP1B_P,RCELP1B_PA),RCELP1B1731) )*(1-V_INDTEO)+RCELP1B_1*V_INDTEO)) * positif(COD7ZG + COD7YN)
	            + (PCEL1C_1 - (min(RCELP1C_1 , max(max(RCELP1C_P,RCELP1C_PA),RCELP1C1731) )*(1-V_INDTEO)+RCELP1C_1*V_INDTEO)) * positif(COD7ZD + COD7YA)
	            + (min(ASC602_1 , max(max(ASC602_P , ASC602_PA) , ASC6021731))*(1-V_INDTEO) + ASC602_1*V_INDTEO)
		    + (min(ASC606_1 , max(max(ASC606_P , ASC606_PA) , ASC6061731))*(1-V_INDTEO) + ASC606_1*V_INDTEO)
		    + (min(ASC609_1 , max(max(ASC609_P , ASC609_PA) , ASC6091731))*(1-V_INDTEO) + ASC609_1*V_INDTEO)
		    + (min(ASC615_1 , max(max(ASC615_P , ASC615_PA) , ASC6151731))*(1-V_INDTEO) + ASC615_1*V_INDTEO)
		    + (min(ASC619_1 , max(max(ASC619_P , ASC619_PA) , ASC6191731))*(1-V_INDTEO) + ASC619_1*V_INDTEO)
		    - (min(RSC602_1 , max(max(RSC602_P , RSC602_PA) , RSC6021731))*(1-V_INDTEO) + RSC602_1*V_INDTEO)
		    - (min(RSC606_1 , max(max(RSC606_P , RSC606_PA) , RSC6061731))*(1-V_INDTEO) + RSC606_1*V_INDTEO)
		    - (min(RSC609_1 , max(max(RSC609_P , RSC609_PA) , RSC6091731))*(1-V_INDTEO) + RSC609_1*V_INDTEO)
		    - (min(RSC615_1 , max(max(RSC615_P , RSC615_PA) , RSC6151731))*(1-V_INDTEO) + RSC615_1*V_INDTEO)
		    - (min(RSC619_1 , max(max(RSC619_P , RSC619_PA) , RSC6191731))*(1-V_INDTEO) + RSC619_1*V_INDTEO)
	       ) * positif(1 - COD9ZA) * positif(PREM8_11)*  null(V_IND_TRAIT - 5)) * (1 - V_CNR) ;


RRCELYK = max(0 , COD7YK - RCELYK) * (1 - V_CNR) ;

RRCELZK = max(0 , COD7ZK - RCELZK) * (1 - V_CNR) ;

RRCELUW = max(0 , COD7UW - RCELUW) * (1 - V_CNR) ;

RRCELRM = max(0 , COD7RM - RCELRM) * (1 - V_CNR) ;

RRCELLO = max(0 , COD7LO - RCELLO) * (1 - V_CNR) ;

RRCELIO = max(0 , COD7IO - RCELIO) * (1 - V_CNR) ;

RRCELG = (max(0 , (PCEL1C - RCELP1C) * positif(COD7ZC + COD7ZE + COD7ZF + COD7XN + COD7YC + COD7YM) 
                  + (PCEL1D - RCELP1D) * positif(COD7YF + COD7XE)
                  + ASC603 + ASC607 + ASC610 + ASC612 + ASC616 + ASC620 + ASC622 - RSC603 - RSC607 - RSC610 - RSC612 - RSC616 - RSC620 - RSC622)  
	   * positif(null(V_IND_TRAIT - 4)+positif(1 - COD9ZA) * (1-positif(PREM8_11))*  null(V_IND_TRAIT - 5))
	  + max(0 , (PCEL1C_1 - (min(RCELP1C_1 , max(max(RCELP1C_P,RCELP1C_PA),RCELP1C1731) )*(1-V_INDTEO)+RCELP1C_1*V_INDTEO)) * positif(COD7ZC + COD7ZE + COD7ZF + COD7XN + COD7YC + COD7YM)
                    + (PCEL1D_1 - (min(RCELP1D_1 , max(max(RCELP1D_P,RCELP1D_PA),RCELP1D1731) )*(1-V_INDTEO)+RCELP1D_1*V_INDTEO)) * positif(COD7YF + COD7XE)
	            + (min(ASC603_1 , max(max(ASC603_P , ASC603_PA) , ASC6031731))*(1-V_INDTEO) + ASC603_1*V_INDTEO)
	            + (min(ASC607_1 , max(max(ASC607_P , ASC607_PA) , ASC6071731))*(1-V_INDTEO) + ASC607_1*V_INDTEO)
	            + (min(ASC610_1 , max(max(ASC610_P , ASC610_PA) , ASC6101731))*(1-V_INDTEO) + ASC610_1*V_INDTEO)
		    + (min(ASC612_1 , max(max(ASC612_P , ASC612_PA) , ASC6121731))*(1-V_INDTEO) + ASC612_1*V_INDTEO)
		    + (min(ASC616_1 , max(max(ASC616_P , ASC616_PA) , ASC6161731))*(1-V_INDTEO) + ASC616_1*V_INDTEO)
		    + (min(ASC620_1 , max(max(ASC620_P , ASC620_PA) , ASC6201731))*(1-V_INDTEO) + ASC620_1*V_INDTEO)
		    + (min(ASC622_1 , max(max(ASC622_P , ASC622_PA) , ASC6221731))*(1-V_INDTEO) + ASC622_1*V_INDTEO)
		    - (min(RSC603_1 , max(max(RSC603_P , RSC603_PA) , RSC6031731))*(1-V_INDTEO) + RSC603_1*V_INDTEO)
		    - (min(RSC607_1 , max(max(RSC607_P , RSC607_PA) , RSC6071731))*(1-V_INDTEO) + RSC607_1*V_INDTEO)
		    - (min(RSC610_1 , max(max(RSC610_P , RSC610_PA) , RSC6101731))*(1-V_INDTEO) + RSC610_1*V_INDTEO)
		    - (min(RSC612_1 , max(max(RSC612_P , RSC612_PA) , RSC6121731))*(1-V_INDTEO) + RSC612_1*V_INDTEO)
		    - (min(RSC616_1 , max(max(RSC616_P , RSC616_PA) , RSC6161731))*(1-V_INDTEO) + RSC616_1*V_INDTEO)
		    - (min(RSC620_1 , max(max(RSC620_P , RSC620_PA) , RSC6201731))*(1-V_INDTEO) + RSC620_1*V_INDTEO)
		    - (min(RSC622_1 , max(max(RSC622_P , RSC622_PA) , RSC6221731))*(1-V_INDTEO) + RSC622_1*V_INDTEO)
	       ) * positif(1 - COD9ZA) * positif(PREM8_11)*  null(V_IND_TRAIT - 5)) * (1 - V_CNR) ;


RRCELYL = max(0 , COD7YL - RCELYL) * (1 - V_CNR) ;

RRCELZL = max(0 , COD7ZL - RCELZL) * (1 - V_CNR) ;

RRCELUX = max(0 , COD7UX - RCELUX) * (1 - V_CNR) ;

RRCELRN = max(0 , COD7RN - RCELRN) * (1 - V_CNR) ;

RRCELLP = max(0 , COD7LP - RCELLP) * (1 - V_CNR) ;

RRCELIP = max(0 , COD7IP - RCELIP) * (1 - V_CNR) ;

RRCELH = (max(0 , (PCEL1D - RCELP1D) * positif(COD7YD + COD7ZA + COD7ZB + COD7XD + COD7XL + COD7XM)
                  + PCEL1E + ASC604 + ASC608 + ASC611 + ASC613 + ASC617 + ASC621 + ASC623 
		  - RCELP1E - RSC604 - RSC608 - RSC611 - RSC613 - RSC617 - RSC621 - RSC623)  
	   * positif(null(V_IND_TRAIT - 4)+positif(1 - COD9ZA) * (1-positif(PREM8_11))*  null(V_IND_TRAIT - 5))
	  + max(0 , (PCEL1D_1 - (min(RCELP1D_1 , max(max(RCELP1D_P,RCELP1D_PA),RCELP1D1731) )*(1-V_INDTEO)+RCELP1D_1*V_INDTEO)) * positif(COD7YD + COD7ZA + COD7ZB + COD7XD + COD7XL + COD7XM) 
		    + (PCEL1E_1 - (min(RCELP1E_1 , max(max(RCELP1E_P,RCELP1E_PA),RCELP1E1731) )*(1-V_INDTEO)+RCELP1E_1*V_INDTEO))
		    + (min(ASC604_1 , max(max(ASC604_P , ASC604_PA) , ASC6041731))*(1-V_INDTEO) + ASC604_1*V_INDTEO)
		    + (min(ASC608_1 , max(max(ASC608_P , ASC608_PA) , ASC6081731))*(1-V_INDTEO) + ASC608_1*V_INDTEO)
		    + (min(ASC611_1 , max(max(ASC611_P , ASC611_PA) , ASC6111731))*(1-V_INDTEO) + ASC611_1*V_INDTEO)
	            + (min(ASC613_1 , max(max(ASC613_P , ASC613_PA) , ASC6131731))*(1-V_INDTEO) + ASC613_1*V_INDTEO)
	            + (min(ASC617_1 , max(max(ASC617_P , ASC617_PA) , ASC6171731))*(1-V_INDTEO) + ASC617_1*V_INDTEO)
	            + (min(ASC621_1 , max(max(ASC621_P , ASC621_PA) , ASC6211731))*(1-V_INDTEO) + ASC621_1*V_INDTEO)
		    + (min(ASC623_1 , max(max(ASC623_P , ASC623_PA) , ASC6231731))*(1-V_INDTEO) + ASC623_1*V_INDTEO)
		    - (min(RSC604_1 , max(max(RSC604_P , RSC604_PA) , RSC6041731))*(1-V_INDTEO) + RSC604_1*V_INDTEO)
		    - (min(RSC608_1 , max(max(RSC608_P , RSC608_PA) , RSC6081731))*(1-V_INDTEO) + RSC608_1*V_INDTEO)
		    - (min(RSC611_1 , max(max(RSC611_P , RSC611_PA) , RSC6111731))*(1-V_INDTEO) + RSC611_1*V_INDTEO)
		    - (min(RSC613_1 , max(max(RSC613_P , RSC613_PA) , RSC6131731))*(1-V_INDTEO) + RSC613_1*V_INDTEO)
		    - (min(RSC617_1 , max(max(RSC617_P , RSC617_PA) , RSC6171731))*(1-V_INDTEO) + RSC617_1*V_INDTEO)
	            - (min(RSC621_1 , max(max(RSC621_P , RSC621_PA) , RSC6211731))*(1-V_INDTEO) + RSC621_1*V_INDTEO)
		    - (min(RSC623_1 , max(max(RSC623_P , RSC623_PA) , RSC6231731))*(1-V_INDTEO) + RSC623_1*V_INDTEO)
	       ) * positif(1 - COD9ZA) * positif(PREM8_11)*  null(V_IND_TRAIT - 5)) * (1 - V_CNR) ;

RRCELKD = max(0 , COD7KD - RCELKD) * (1 - V_CNR) ;

RRCELPD = max(0 , COD7PD - RCELPD) * (1 - V_CNR) ;

RRCELKU = max(0 , COD7KU - RCELKU) * (1 - V_CNR) ;

RRCELIY = max(0 , COD7IY - RCELIY) * (1 - V_CNR) ;

RRCELVL = max(0 , COD7VL - RCELVL) * (1 - V_CNR) ;

RRCELI = (max(0 , (PCEL2B - RSC302 - RSC304) * positif(COD7GH + COD7KA) + (PCEL2C - RSC301 - RSC305 - RSC307 - RSC310) * positif(COD7IS + COD7IJ + COD7CC + COD7BQ) 
                  + ASC802 + ASC804 + ASC807 + ASC7SJ + ASC7TC + ASC7UA + ASC7UG - RSC802 - RSC804 - RSC807 - RSC7SJ - RSC7TC - RSC7UA - RSC7UG) 
	   * positif(null(V_IND_TRAIT - 4)+positif(1 - COD9ZA) * (1-positif(PREM8_11))*null(V_IND_TRAIT - 5))
	  + max(0 , (min(ASC802_1 , max(max(ASC802_P , ASC802_PA) , ASC8021731))*(1-V_INDTEO) + ASC802_1*V_INDTEO)
	            + (min(ASC804_1 , max(max(ASC804_P , ASC804_PA) , ASC8041731))*(1-V_INDTEO) + ASC804_1*V_INDTEO)
	            + (min(ASC807_1 , max(max(ASC807_P , ASC807_PA) , ASC8071731))*(1-V_INDTEO) + ASC807_1*V_INDTEO)
	            + (min(ASC7SJ_1 , max(max(ASC7SJ_P , ASC7SJ_PA) , ASC7SJ1731))*(1-V_INDTEO) + ASC7SJ_1*V_INDTEO)
	            + (min(ASC7TC_1 , max(max(ASC7TC_P , ASC7TC_PA) , ASC7TC1731))*(1-V_INDTEO) + ASC7TC_1*V_INDTEO)
	            + (min(ASC7UA_1 , max(max(ASC7UA_P , ASC7UA_PA) , ASC7UA1731))*(1-V_INDTEO) + ASC7UA_1*V_INDTEO)
	            + (min(ASC7UG_1 , max(max(ASC7UG_P , ASC7UG_PA) , ASC7UG1731))*(1-V_INDTEO) + ASC7UG_1*V_INDTEO)
	            + (PCEL2B_1 - (min(RSC302_1 , max(max(RSC302_P,RSC302_PA),RSC3021731))*(1-V_INDTEO)+RSC302_1*V_INDTEO)
		                - (min(RSC304_1 , max(max(RSC304_P,RSC304_PA),RSC3041731))*(1-V_INDTEO)+RSC304_1*V_INDTEO)) * positif(COD7GH + COD7KA)
	            + (PCEL2C_1 - (min(RSC301_1 , max(max(RSC301_P,RSC301_PA),RSC3011731))*(1-V_INDTEO)+RSC301_1*V_INDTEO)
		                - (min(RSC305_1 , max(max(RSC305_P,RSC305_PA),RSC3051731))*(1-V_INDTEO)+RSC305_1*V_INDTEO)
		                - (min(RSC307_1 , max(max(RSC307_P,RSC307_PA),RSC3071731))*(1-V_INDTEO)+RSC307_1*V_INDTEO)
		                - (min(RSC310_1 , max(max(RSC310_P,RSC310_PA),RSC3101731))*(1-V_INDTEO)+RSC310_1*V_INDTEO)) * positif(COD7IS + COD7IJ + COD7CC + COD7BQ)
	            - (min(RSC802_1 , max(max(RSC802_P , RSC802_PA) , RSC8021731))*(1-V_INDTEO) + RSC802_1*V_INDTEO)
	            - (min(RSC804_1 , max(max(RSC804_P , RSC804_PA) , RSC8041731))*(1-V_INDTEO) + RSC804_1*V_INDTEO)
	            - (min(RSC807_1 , max(max(RSC807_P , RSC807_PA) , RSC8071731))*(1-V_INDTEO) + RSC807_1*V_INDTEO)
	            - (min(RSC7SJ_1 , max(max(RSC7SJ_P , RSC7SJ_PA) , RSC7SJ1731))*(1-V_INDTEO) + RSC7SJ_1*V_INDTEO)
	            - (min(RSC7TC_1 , max(max(RSC7TC_P , RSC7TC_PA) , RSC7TC1731))*(1-V_INDTEO) + RSC7TC_1*V_INDTEO)
	            - (min(RSC7UA_1 , max(max(RSC7UA_P , RSC7UA_PA) , RSC7UA1731))*(1-V_INDTEO) + RSC7UA_1*V_INDTEO)
	            - (min(RSC7UG_1 , max(max(RSC7UG_P , RSC7UG_PA) , RSC7UG1731))*(1-V_INDTEO) + RSC7UG_1*V_INDTEO)
	       ) * positif(1 - COD9ZA) * positif(PREM8_11)*  null(V_IND_TRAIT - 5)) * (1 - V_CNR) ;

RRCELKC = max(0 , COD7KC - RCELKC) * (1 - V_CNR) ;

RRCELPC = max(0 , COD7PC - RCELPC) * (1 - V_CNR) ;

RRCELKT = max(0 , COD7KT - RCELKT) * (1 - V_CNR) ;

RRCELIX = max(0 , COD7IX - RCELIX) * (1 - V_CNR) ;

RRCELVK = max(0 , COD7VK - RCELVK) * (1 - V_CNR) ;

RRCELJ = (max(0 , (PCEL2C - RSC301 - RSC305 - RSC307 - RSC310) 
                   * positif(COD7IR + COD7IT + COD7IU + COD7HY + COD7IQ + COD7IW + COD7CB + COD7CF + COD7CG + COD7BI + COD7BX + COD7BY) 
                  + (PCEL2D - RSC306 - RSC308 - RSC311) * positif(COD7HJ + COD7CK + COD7DI) + ASC805 + ASC808 + ASC7SR + ASC7UB + ASC7UI - RSC805 - RSC808 - RSC7SR - RSC7UB - RSC7UI) 
	   * positif(null(V_IND_TRAIT - 4)+positif(1 - COD9ZA) * (1-positif(PREM8_11))* null(V_IND_TRAIT - 5))
	  + max(0 , (min(ASC805_1 , max(max(ASC805_P , ASC805_PA) , ASC8051731))*(1-V_INDTEO) + ASC805_1*V_INDTEO)
	            + (min(ASC808_1 , max(max(ASC808_P , ASC808_PA) , ASC8081731))*(1-V_INDTEO) + ASC808_1*V_INDTEO)
	            + (min(ASC7SR_1 , max(max(ASC7SR_P , ASC7SR_PA) , ASC7SR1731))*(1-V_INDTEO) + ASC7SR_1*V_INDTEO)
	            + (min(ASC7UB_1 , max(max(ASC7UB_P , ASC7UB_PA) , ASC7UB1731))*(1-V_INDTEO) + ASC7UB_1*V_INDTEO)
	            + (min(ASC7UI_1 , max(max(ASC7UI_P , ASC7UI_PA) , ASC7UI1731))*(1-V_INDTEO) + ASC7UI_1*V_INDTEO)
	            + (PCEL2C_1 - (min(RSC301_1 , max(max(RSC301_P,RSC301_PA),RSC3011731))*(1-V_INDTEO)+RSC301_1*V_INDTEO)
		                - (min(RSC305_1 , max(max(RSC305_P,RSC305_PA),RSC3051731))*(1-V_INDTEO)+RSC305_1*V_INDTEO)
		                - (min(RSC307_1 , max(max(RSC307_P,RSC307_PA),RSC3071731))*(1-V_INDTEO)+RSC307_1*V_INDTEO)
				- (min(RSC310_1 , max(max(RSC310_P,RSC310_PA),RSC3101731))*(1-V_INDTEO)+RSC310_1*V_INDTEO)
		                  ) * positif(COD7IR + COD7IT + COD7IU + COD7HY + COD7IQ + COD7IW + COD7CB + COD7CF + COD7CG + COD7BI + COD7BX + COD7BY)
	            + (PCEL2D_1 - (min(RSC306_1 , max(max(RSC306_P,RSC306_PA),RSC3061731))*(1-V_INDTEO)+RSC306_1*V_INDTEO)
		                - (min(RSC308_1 , max(max(RSC308_P,RSC308_PA),RSC3081731))*(1-V_INDTEO)+RSC308_1*V_INDTEO)
				- (min(RSC311_1 , max(max(RSC311_P,RSC311_PA),RSC3111731))*(1-V_INDTEO)+RSC311_1*V_INDTEO)
		                  ) * positif(COD7HJ + COD7CK + COD7DI)
	            - (min(RSC805_1 , max(max(RSC805_P , RSC805_PA) , RSC8051731))*(1-V_INDTEO) + RSC805_1*V_INDTEO)
	            - (min(RSC808_1 , max(max(RSC808_P , RSC808_PA) , RSC8081731))*(1-V_INDTEO) + RSC808_1*V_INDTEO)
	            - (min(RSC7SR_1 , max(max(RSC7SR_P , RSC7SR_PA) , RSC7SR1731))*(1-V_INDTEO) + RSC7SR_1*V_INDTEO)
	            - (min(RSC7UB_1 , max(max(RSC7UB_P , RSC7UB_PA) , RSC7UB1731))*(1-V_INDTEO) + RSC7UB_1*V_INDTEO)
	            - (min(RSC7UI_1 , max(max(RSC7UI_P , RSC7UI_PA) , RSC7UI1731))*(1-V_INDTEO) + RSC7UI_1*V_INDTEO)
	       ) * positif(1 - COD9ZA) * positif(PREM8_11)*  null(V_IND_TRAIT - 5)) * (1 - V_CNR) ;

RRCELPE = max(0 , COD7PE - RCELPE) * (1 - V_CNR) ;

RRCELKV = max(0 , COD7KV - RCELKV) * (1 - V_CNR) ;

RRCELIZ = max(0 , COD7IZ - RCELIZ) * (1 - V_CNR) ;

RRCELVO = max(0 , COD7VO - RCELVO) * (1 - V_CNR) ;

RRCELK = (max(0 , (PCEL2D - RSC306 - RSC308 - RSC311) * positif(COD7HA + COD7HK + COD7HN + COD7CJ + COD7CL + COD7CM + COD7BZ + COD7DU + COD7DV) + PCEL2E - RSC309 - RSC312
                  + ASC806 + ASC809 + ASC7UE + ASC7UK - RSC806 - RSC809 - RSC7UE - RSC7UK)  
	   * positif(null(V_IND_TRAIT - 4)+positif(1 - COD9ZA) * (1-positif(PREM8_11))*  null(V_IND_TRAIT - 5))
	  + max(0 , (min(ASC806_1 , max(max(ASC806_P , ASC806_PA) , ASC8061731))*(1-V_INDTEO) + ASC806_1*V_INDTEO)
	            + (min(ASC809_1 , max(max(ASC809_P , ASC809_PA) , ASC8091731))*(1-V_INDTEO) + ASC809_1*V_INDTEO)
	            + (min(ASC7UE_1 , max(max(ASC7UE_P , ASC7UE_PA) , ASC7UE1731))*(1-V_INDTEO) + ASC7UE_1*V_INDTEO)
	            + (min(ASC7UK_1 , max(max(ASC7UK_P , ASC7UK_PA) , ASC7UK1731))*(1-V_INDTEO) + ASC7UK_1*V_INDTEO)
	            + (PCEL2D_1 - (min(RSC306_1 , max(max(RSC306_P,RSC306_PA),RSC3061731))*(1-V_INDTEO)+RSC306_1*V_INDTEO)
		                - (min(RSC308_1 , max(max(RSC308_P,RSC308_PA),RSC3081731))*(1-V_INDTEO)+RSC308_1*V_INDTEO)
				- (min(RSC311_1 , max(max(RSC311_P,RSC311_PA),RSC3111731))*(1-V_INDTEO)+RSC311_1*V_INDTEO)
		                ) * positif(COD7HA + COD7HK + COD7HN + COD7CJ + COD7CL + COD7CM + COD7BZ + COD7DU + COD7DV)
	            + PCEL2E_1 - (min(RSC309_1 , max(max(RSC309_P,RSC309_PA),RSC3091731))*(1-V_INDTEO)+RSC309_1*V_INDTEO)
                               - (min(RSC312_1 , max(max(RSC312_P,RSC312_PA),RSC3121731))*(1-V_INDTEO)+RSC312_1*V_INDTEO)
	            - (min(RSC806_1 , max(max(RSC806_P , RSC806_PA) , RSC8061731))*(1-V_INDTEO) + RSC806_1*V_INDTEO)
	            - (min(RSC809_1 , max(max(RSC809_P , RSC809_PA) , RSC8091731))*(1-V_INDTEO) + RSC809_1*V_INDTEO) 
	            - (min(RSC7UE_1 , max(max(RSC7UE_P , RSC7UE_PA) , RSC7UE1731))*(1-V_INDTEO) + RSC7UE_1*V_INDTEO) 
	            - (min(RSC7UK_1 , max(max(RSC7UK_P , RSC7UK_PA) , RSC7UK1731))*(1-V_INDTEO) + RSC7UK_1*V_INDTEO) 
	       ) * positif(1 - COD9ZA) * positif(PREM8_11)*  null(V_IND_TRAIT - 5)) * (1 - V_CNR) ;

RRCELHZ = max(0 , COD7HZ - RCELHZ) * (1 - V_CNR) ;

RRCELIV = max(0 , COD7IV - RCELIV) * (1 - V_CNR) ;

RRCELVJ = max(0 , COD7VJ - RCELVJ) * (1 - V_CNR) ;

RRCELL = (max(0 , PCEL2A - RSC303 + (PCEL2B - RSC302 - RSC304) * positif(COD7GI + COD7KB) + ASC801 + ASC803 + ASC7SK + ASC7TD - RSC801 - RSC803 - RSC7SK - RSC7TD) 
           * positif(null(V_IND_TRAIT - 4)+positif(1 - COD9ZA) * (1-positif(PREM8_11))*  null(V_IND_TRAIT - 5))
	  + max(0 , (min(ASC801_1 , max(max(ASC801_P , ASC801_PA) , ASC8011731))*(1-V_INDTEO) + ASC801_1*V_INDTEO)
	             + (min(ASC803_1 , max(max(ASC803_P , ASC803_PA) , ASC8031731))*(1-V_INDTEO) + ASC803_1*V_INDTEO)
	             + (min(ASC7SK_1 , max(max(ASC7SK_P , ASC7SK_PA) , ASC7SK1731))*(1-V_INDTEO) + ASC7SK_1*V_INDTEO)
	             + (min(ASC7TD_1 , max(max(ASC7TD_P , ASC7TD_PA) , ASC7TD1731))*(1-V_INDTEO) + ASC7TD_1*V_INDTEO)
	             + PCEL2A_1 - (min(RSC303_1 , max(max(RSC303_P,RSC303_PA),RSC3031731))*(1-V_INDTEO)+RSC303_1*V_INDTEO)
	             + (PCEL2B_1 - (min(RSC302_1 , max(max(RSC302_P,RSC302_PA),RSC3021731))*(1-V_INDTEO)+RSC302_1*V_INDTEO)
		                 - (min(RSC304_1 , max(max(RSC304_P,RSC304_PA),RSC3041731))*(1-V_INDTEO)+RSC304_1*V_INDTEO)) * positif(COD7GI + COD7KB)
	             - (min(RSC801_1 , max(max(RSC801_P , RSC801_PA) , RSC8011731))*(1-V_INDTEO) + RSC801_1*V_INDTEO)
	             - (min(RSC803_1 , max(max(RSC803_P , RSC803_PA) , RSC8031731))*(1-V_INDTEO) + RSC803_1*V_INDTEO)
	             - (min(RSC7SK_1 , max(max(RSC7SK_P , RSC7SK_PA) , RSC7SK1731))*(1-V_INDTEO) + RSC7SK_1*V_INDTEO)
	             - (min(RSC7TD_1 , max(max(RSC7TD_P , RSC7TD_PA) , RSC7TD1731))*(1-V_INDTEO) + RSC7TD_1*V_INDTEO)
	     ) * positif(1 - COD9ZA) * positif(PREM8_11)*  null(V_IND_TRAIT - 5)) * (1 - V_CNR) ;

regle 401390 :
application : iliad ;

RRI1 = IDOM11 - DEC11 - RREPA - RDONDJ - RDONDO - RLOCANAH - RDIFAGRI - RPRESSE - RFORET - RFIPDOM - RFIPC 
              - RCINE - RRESTIMO - RSOCREPR - RRPRESCOMP - RHEBE - RSURV - RINNO - RSOUFIP - RRIRENOV ;

regle 401400 :
application : iliad ;


BAH = (min (RVCURE,LIM_CURE) + min(RCCURE,LIM_CURE)) * (1 - V_CNR) ;

RAH = arr (BAH * TX_CURE /100) ;

DHEBE = RVCURE + RCCURE ;

AHEBE = positif(null(V_IND_TRAIT-4)+COD9ZA) * BAH * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
        + (max(0,min(BAH,max(max(BAH_P,BAH_PA),BAH1731))*(1-V_INDTEO)+BAH*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RHEBE_1 = max( min( RAH , IDOM11-DEC11-RREPA-RDONDJ-RDONDO-RLOCANAH-RDIFAGRI-RPRESSE-RFORET-RFIPDOM-RFIPC
			-RCINE-RRESTIMO-RSOCREPR-RRPRESCOMP) , 0 );
RHEBE =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RHEBE_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RHEBE_1,max(max(RHEBE_P,RHEBE_PA),RHEBE1731))*(1-V_INDTEO)+RHEBE_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401410:
application : iliad ;


DREPA = RDREP + DONETRAN ;

EXCEDANTA = max(0 , RDREP + DONETRAN - PLAF_REDREPAS) ;

BAALIM = min(DREPA , PLAF_REDREPAS) * (1 - V_CNR) ;

RAALIM = arr(BAALIM * TX_REDREPAS/100) * (1 - V_CNR) ;

AREPA = positif(null(V_IND_TRAIT-4)+COD9ZA) * BAALIM * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
        + (max(0,min(BAALIM,max(max(BAALIM_P,BAALIM_PA),BAALIM1731))*(1-V_INDTEO)+BAALIM*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RREPA_1 = max(min(RAALIM , IDOM11-DEC11) , 0) ;

RREPA =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RREPA_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RREPA_1,max(max(RREPA_P,RREPA_PA),RREPA1731))*(1-V_INDTEO)+RREPA_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401411:
application : iliad ;


DDONDJ = COD7UJ ;

BADONJ = min(DDONDJ , PLAF_SAUVPAT) ;

EXCEDANTD = max(0 , DDONDJ - PLAF_REDREPAS) ;

RANDJ = arr(BADONJ * TX_REDREPAS/100) * (1 - V_CNR) ;

ADONDJ = (positif(null(V_IND_TRAIT - 4) + COD9ZA) * BADONJ * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(BADONJ , max(max(BADONJ_P,BADONJ_PA),BADONJ1731))*(1-V_INDTEO)+BADONJ*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0) * (1 - V_CNR) ;

RDONDJ_1 = max(min(RANDJ , IDOM11 - DEC11 - RREPA) , 0) ;

RDONDJ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RDONDJ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RDONDJ_1 , max(max(RDONDJ_P,RDONDJ_PA),RDONDJ1731))*(1-V_INDTEO)+RDONDJ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

regle 401412:
application : iliad ;


DDONDO = COD7UO ;

BADONO = min(DDONDO , LIM2000) ;

EXCEDANTO = max(0 , DDONDO - LIM2000) ;

RANDO = arr(BADONO * TX_REDREPAS/100) * (1 - V_CNR) ;

ADONDO = (positif(null(V_IND_TRAIT - 4) + COD9ZA) * BADONO * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(BADONO, max(max(BADONO_P,BADONO_PA),BADONO1731))*(1-V_INDTEO)+BADONO*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0) * (1 - V_CNR) ;

RDONDO_1 = max(min(RANDO, IDOM11 - DEC11 - RREPA - RDONDJ),0) ;

RDONDO = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RDONDO_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
        + (max(0 , min(RDONDO_1 , max(max(RDONDO_P,RDONDO_PA),RDONDO1731))*(1-V_INDTEO)+RDONDO_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

regle 401415:
application : iliad ;


DLOCANAH = COD7BK + COD7BL + COD7BM + COD7BN + COD7BO ;

ALOCANAH = (COD7BK + COD7BL + COD7BM + COD7BN + COD7BO) * positif((null(V_REGCO - 3) * positif(V_INDVB31) * positif(COD7AA)) + (null(V_REGCO - 3) * (1 - positif(V_INDVB31)))  
                                                                  + (null(V_REGCO - 2) * positif(COD7AA)) + null(V_REGCO - 1) + null(V_REGCO - 4) + null(V_REGCO - 5) + null(V_REGCO - 6)) ;

RLOCANA = (COD7BK * TX15/100 + COD7BL * TX20/100 + COD7BM * TX35/100 + COD7BN * TX40/100 + COD7BO * TX65/100) * positif((null(V_REGCO - 3) * positif(V_INDVB31) * positif(COD7AA)) + (null(V_REGCO - 3) * (1-positif(V_INDVB31))) 
                                                                                                                        + (null(V_REGCO - 2) * positif(COD7AA)) + null(V_REGCO - 1) + null(V_REGCO - 4) + null(V_REGCO - 5) + null(V_REGCO - 6)) ;



RLOCANAH_1 = arr(max(min(RLOCANA, IDOM11 - DEC11 - RREPA - RDONDJ - RDONDO) , 0)) ;

RLOCANAH = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RLOCANAH_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RLOCANAH_1,max(max(RLOCANAH_P,RLOCANAH_PA),RLOCANAH1731))*(1-V_INDTEO)+RLOCANAH_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
regle 401420:
application : iliad ;
 
DNOUV =  COD7CX + COD7CS + COD7CT + COD7CA + COD7DC + COD7CU + COD7CW + COD7CP + COD7CQ + COD7CI + COD7CH + COD7CO + COD7BS + COD7BT + COD7BU + COD7BW + COD7GW ;

BSN1 = min (DNOUV , LIM_TITPRISE * (1 + BOOL_0AM)) ;



BSNCS = max(0, min(COD7CS , LIM_TITPRISE * (1 + BOOL_0AM))) ;
RSNNCS = BSNCS * TX25/100 ;

BSNCX = max(0, min(COD7CX , LIM_TITPRISE * (1 + BOOL_0AM) - BSNCS)) ;
RSNNCX = BSNCX * TX18/100 ;

BSNCA = max(0, min(COD7CA , LIM_TITPRISE * (1 + BOOL_0AM) - BSNCS - BSNCX)) ;
RSNNCA = BSNCA * TX25/100 ;

BSNDC = max(0, min(COD7DC , LIM_TITPRISE * (1 + BOOL_0AM) - BSNCS - BSNCX - BSNCA)) ;
RSNNDC = BSNDC * TX25/100 ;

BSNCT = max(0, min(COD7CT , LIM_TITPRISE * (1 + BOOL_0AM) - BSNCS - BSNCX - BSNCA - BSNDC)) ;
RSNNCT = BSNCT * TX18/100 ;

BSNCW = max(0, min(COD7CW , LIM_TITPRISE * (1 + BOOL_0AM) - BSNCS - BSNCX - BSNCA - BSNDC - BSNCT)) ;
RSNNCW = BSNCW * TX25/100 ;

BSNCU = max(0, min(COD7CU , LIM_TITPRISE * (1 + BOOL_0AM) - BSNCS - BSNCX - BSNCA - BSNDC - BSNCT - BSNCW)) ;
RSNNCU = BSNCU * TX18/100 ;

BSNCQ = max(0, min(COD7CQ , LIM_TITPRISE * (1 + BOOL_0AM) - BSNCS - BSNCX - BSNCA - BSNDC - BSNCT - BSNCW - BSNCU)) ;
RSNNCQ = BSNCQ * TX25/100 ;

BSNCP = max(0, min(COD7CP , LIM_TITPRISE * (1 + BOOL_0AM) - BSNCS - BSNCX - BSNCA - BSNDC - BSNCT - BSNCW - BSNCU - BSNCQ)) ;
RSNNCP = BSNCP * TX18/100 ;

BSNCO = max(0, min(COD7CO , LIM_TITPRISE * (1 + BOOL_0AM) - BSNCS - BSNCX - BSNCA - BSNDC - BSNCT - BSNCW - BSNCU - BSNCQ - BSNCP)) ;
RSNNCO = BSNCO * TX25/100 ;

BSNCH = max(0, min(COD7CH , LIM_TITPRISE * (1 + BOOL_0AM) - BSNCS - BSNCX - BSNCA - BSNDC - BSNCT - BSNCW - BSNCU - BSNCQ - BSNCP - BSNCO)) ;
RSNNCH = BSNCH * TX18/100 ;

BSNCI = max(0, min(COD7CI , LIM_TITPRISE * (1 + BOOL_0AM) - BSNCS - BSNCX - BSNCA - BSNDC - BSNCT - BSNCW - BSNCU - BSNCQ - BSNCP - BSNCO - BSNCH)) ;
RSNNCI = BSNCI * TX18/100 ;

BSNBS = max(0, min(COD7BS , LIM_TITPRISE * (1 + BOOL_0AM) - BSNCS - BSNCX - BSNCA - BSNDC - BSNCT - BSNCW - BSNCU - BSNCQ - BSNCP - BSNCO - BSNCH - BSNCI)) ;
RSNNBS = BSNBS * TX25/100 ;

BSNBT = max(0, min(COD7BT , LIM_TITPRISE * (1 + BOOL_0AM) - BSNCS - BSNCX - BSNCA - BSNDC - BSNCT - BSNCW - BSNCU - BSNCQ - BSNCP - BSNCO - BSNCH - BSNCI - BSNBS)) ;
RSNNBT = BSNBT * TX25/100 ;

BSNBU = max(0, min(COD7BU , LIM_TITPRISE * (1 + BOOL_0AM) - BSNCS - BSNCX - BSNCA - BSNDC - BSNCT - BSNCW - BSNCU - BSNCQ - BSNCP - BSNCO - BSNCH - BSNCI - BSNBS - BSNBT)) ;
RSNNBU = BSNBU * TX25/100 ;

BSNBW = max(0, min(COD7BW , LIM_TITPRISE * (1 + BOOL_0AM) - BSNCS - BSNCX - BSNCA - BSNDC - BSNCT - BSNCW - BSNCU - BSNCQ - BSNCP - BSNCO - BSNCH - BSNCI - BSNBS - BSNBT - BSNBU)) ;
RSNNBW = BSNBW * TX25/100 ;

BSNGW = max(0, min(COD7GW , LIM_TITPRISE * (1 + BOOL_0AM) - BSNCS - BSNCX - BSNCA - BSNDC - BSNCT - BSNCW - BSNCU - BSNCQ - BSNCP - BSNCO - BSNCH - BSNCI - BSNBS - BSNBT - BSNBU - BSNBW)) ;
RSNNGW = BSNGW * TX25/100 ;

RSN = arr(RSNNCS + RSNNCX + RSNNCA + RSNNDC + RSNNCT + RSNNCW + RSNNCU  + RSNNCQ + RSNNCP + RSNNCO + RSNNCH + RSNNCI + RSNNBS + RSNNBT + RSNNBU + RSNNBW + RSNNGW) * (1 - V_CNR) ;

ANOUV = (positif(null(V_IND_TRAIT-4) + COD9ZA) * (BSN1 + BSN2) * (1 - positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
         + (max(0,min(BSN1 + BSN2 , max(max(BSN1_P+BSN2_P,BSN1_PA+BSN2_PA),BSN11731 + BSN21731))*(1-V_INDTEO)+(BSN1 + BSN2)*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5) + 0) * (1 - V_CNR) ;

regle 401430:
application : iliad ;


VARTMP1 = RLOGDOM + RCOMP + RRETU + RDONS + CRDIE + RDUFREP + RPINELTOT + RNORMTOT ;


RSNCS_1 = max(0, min(RSNNCS , RRI1 - VARTMP1)) ;
RSNCS =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNCS_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
         + (max(0,min(RSNCS_1,max(max(RSNCS_P,RSNCS_PA),RSNCS1731))*(1-V_INDTEO)+RSNCS_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSNCS ;

RSNCX_1 = max(0, min(RSNNCX , RRI1 - VARTMP1)) ;
RSNCX =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNCX_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSNCX_1,max(max(RSNCX_P,RSNCX_PA),RSNCX1731))*(1-V_INDTEO)+RSNCX_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSNCX ;

RSNCA_1 = max(0, min(RSNNCA , RRI1 - VARTMP1)) ;
RSNCA =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNCA_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSNCA_1,max(max(RSNCA_P,RSNCA_PA),RSNCA1731))*(1-V_INDTEO)+RSNCA_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSNCA ;

RSNDC_1 = max(0, min(RSNNDC , RRI1 - VARTMP1)) ;
RSNDC =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNDC_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSNDC_1,max(max(RSNDC_P,RSNDC_PA),RSNDC1731))*(1-V_INDTEO)+RSNDC_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSNDC ;

RSNCT_1 = max(0, min(RSNNCT , RRI1 - VARTMP1)) ;
RSNCT =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNCT_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSNCT_1,max(max(RSNCT_P,RSNCT_PA),RSNCT1731))*(1-V_INDTEO)+RSNCT_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSNCT ;

RSNCW_1 = max(0, min(RSNNCW , RRI1 - VARTMP1)) ;
RSNCW =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNCW_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSNCW_1,max(max(RSNCW_P,RSNCW_PA),RSNCW1731))*(1-V_INDTEO)+RSNCW_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSNCW ;

RSNCU_1 = max(0, min(RSNNCU , RRI1 - VARTMP1)) ;
RSNCU =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNCU_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSNCU_1,max(max(RSNCU_P,RSNCU_PA),RSNCU1731))*(1-V_INDTEO)+RSNCU_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSNCU ;

RSNCQ_1 = max(0, min(RSNNCQ , RRI1 - VARTMP1)) ;
RSNCQ =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNCQ_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSNCQ_1,max(max(RSNCQ_P,RSNCQ_PA),RSNCQ1731))*(1-V_INDTEO)+RSNCQ_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSNCQ ;

RSNCP_1 = max(0, min(RSNNCP , RRI1 - VARTMP1)) ;
RSNCP =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNCP_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSNCP_1,max(max(RSNCP_P,RSNCP_PA),RSNCP1731))*(1-V_INDTEO)+RSNCP_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSNCP ;

RSNCO_1 = max(0, min(RSNNCO , RRI1 - VARTMP1)) ;
RSNCO =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNCO_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSNCO_1,max(max(RSNCO_P,RSNCO_PA),RSNCO1731))*(1-V_INDTEO)+RSNCO_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSNCO ;


RSNCH_1 = max(0, min(RSNNCH , RRI1 - VARTMP1)) ;
RSNCH =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNCH_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSNCH_1,max(max(RSNCH_P,RSNCH_PA),RSNCH1731))*(1-V_INDTEO)+RSNCH_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSNCH ;

RSNCI_1 = max(0, min(RSNNCI , RRI1 - VARTMP1)) ;
RSNCI =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNCI_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSNCI_1,max(max(RSNCI_P,RSNCI_PA),RSNCI1731))*(1-V_INDTEO)+RSNCI_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSNCI ;

RSNBS_1 = max(0, min(RSNNBS , RRI1 - VARTMP1)) ;
RSNBS =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNBS_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSNBS_1,max(max(RSNBS_P,RSNBS_PA),RSNBS1731))*(1-V_INDTEO)+RSNBS_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSNBS ;

RSNBT_1 = max(0, min(RSNNBT , RRI1 - VARTMP1)) ;
RSNBT =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNBT_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSNBT_1,max(max(RSNBT_P,RSNBT_PA),RSNBT1731))*(1-V_INDTEO)+RSNBT_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSNBT ;

RSNBU_1 = max(0, min(RSNNBU , RRI1 - VARTMP1)) ;
RSNBU =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNBU_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSNBU_1,max(max(RSNBU_P,RSNBU_PA),RSNBU1731))*(1-V_INDTEO)+RSNBU_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSNBU ;


RSNBW_1 = max(0, min(RSNNBW , RRI1 - VARTMP1)) ;
RSNBW =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNBW_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSNBW_1,max(max(RSNBW_P,RSNBW_PA),RSNBW1731))*(1-V_INDTEO)+RSNBW_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSNBW ;

RSNGW_1 = max(0, min(RSNNGW , RRI1 - VARTMP1)) ;
RSNGW =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSNGW_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSNGW_1,max(max(RSNGW_P,RSNGW_PA),RSNGW1731))*(1-V_INDTEO)+RSNGW_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = 0 ;

RNOUV_1 = arr(RSNCS_1 + RSNCX_1 + RSNCA_1 + RSNDC_1 + RSNCT_1 + RSNCW_1 + RSNCU_1 + RSNCQ_1 + RSNCP_1 + RSNCO_1 + RSNCH_1 + RSNCI_1 + RSNBS_1 + RSNBT_1 + RSNBU_1 + RSNBW_1 + RSNGW_1 ) ; 

RNOUV = arr(RSNCS + RSNCX + RSNCA + RSNDC + RSNCT + RSNCW + RSNCU + RSNCQ + RSNCP + RSNCO + RSNCH + RSNCI + RSNBS + RSNBT + RSNBU + RSNBW + RSNGW) * (1 - V_CNR) ;

regle 401435:
application : iliad ;


DROUVB = min(COD7CH + COD7CO + COD7CT + COD7CU + COD7CW + COD7CP + COD7CQ + COD7CA + COD7DC + COD7CI + COD7BT + COD7BU + COD7BW + COD7GW, LIM_TITPRISE * (1 + BOOL_0AM) - COD7CX - COD7CS - COD7BS)  ;

RINVPECA = max(0 , COD7CA - max(0 , LIM_TITPRISE * (1 + BOOL_0AM) - ( COD7CS + COD7CX)))* (1 - V_CNR) ;

RINVPEDC = max(0 , COD7DC - max(0 , LIM_TITPRISE * (1 + BOOL_0AM) - ( COD7CS + COD7CX + COD7CA)))* (1 - V_CNR) ;

RINVPECT = max(0 , COD7CT - max(0 , LIM_TITPRISE * (1 + BOOL_0AM) - (COD7CS + COD7CX + COD7CA + COD7DC)))* (1 - V_CNR) ;

RINVPECW = max(0 , COD7CW - max(0 , LIM_TITPRISE * (1 + BOOL_0AM) - (COD7CS + COD7CX + COD7CA + COD7DC + COD7CT)))* (1 - V_CNR) ;

RINVPECU = max(0 , COD7CU - max(0 , LIM_TITPRISE * (1 + BOOL_0AM) - (COD7CS + COD7CX + COD7CA + COD7DC + COD7CT + COD7CW)))* (1 - V_CNR) ;

RINVPECQ = max(0 , COD7CQ - max(0 , LIM_TITPRISE * (1 + BOOL_0AM) - (COD7CS + COD7CX + COD7CA + COD7DC + COD7CT + COD7CW + COD7CU)))* (1 - V_CNR) ;

RINVPECP = max(0 , COD7CP - max(0 , LIM_TITPRISE * (1 + BOOL_0AM) - (COD7CS + COD7CX + COD7CA + COD7DC + COD7CT + COD7CW + COD7CU + COD7CQ)))* (1 - V_CNR) ;

RINVPECO = max(0 , COD7CO - max(0 , LIM_TITPRISE * (1 + BOOL_0AM) - (COD7CS + COD7CX + COD7CA + COD7DC + COD7CT + COD7CW + COD7CU + COD7CQ + COD7CP)))* (1 - V_CNR) ;

RINVPECH =  max(0 , COD7CH - max(0 , LIM_TITPRISE * (1 + BOOL_0AM) - (COD7CS + COD7CX + COD7CA + COD7DC + COD7CT + COD7CW + COD7CU + COD7CQ + COD7CP + COD7CO)))* (1 - V_CNR) ;

RINVPECI = max(0 , COD7CI - max(0 , LIM_TITPRISE * (1 + BOOL_0AM) - (COD7CS + COD7CX + COD7CA + COD7DC + COD7CT + COD7CW + COD7CU + COD7CQ + COD7CP + COD7CO + COD7CH)))* (1 - V_CNR) ;


RINVPEBT = max(0 , COD7BT - max(0 , LIM_TITPRISE * (1 + BOOL_0AM) - (COD7CS + COD7CX + COD7CA + COD7DC + COD7CT + COD7CW + COD7CU + COD7CQ + COD7CP + COD7CO + COD7CH + COD7CI + COD7BS)))* (1 - V_CNR) ;

RINVPEBU = max(0 , COD7BU - max(0 , LIM_TITPRISE * (1 + BOOL_0AM) - (COD7CS + COD7CX + COD7CA + COD7DC + COD7CT + COD7CW + COD7CU + COD7CQ + COD7CP + COD7CO + COD7CH + COD7CI + COD7BS + COD7BT)))* (1 - V_CNR) ;

RINVPEBW = max(0 , COD7BW - max(0 , LIM_TITPRISE * (1 + BOOL_0AM) - (COD7CS + COD7CX + COD7CA + COD7DC + COD7CT + COD7CW + COD7CU + COD7CQ + COD7CP + COD7CO + COD7CH + COD7CI + COD7BS + COD7BT + COD7BU)))* (1 - V_CNR) ;

RINVPEGW = max(0 , COD7GW - max(0 , LIM_TITPRISE * (1 + BOOL_0AM) - (COD7CS + COD7CX + COD7CA + COD7DC + COD7CT + COD7CW + COD7CU + COD7CQ + COD7CP + COD7CO + COD7CH + COD7CI + COD7BS + COD7BT + COD7BU + COD7BW)))* (1 - V_CNR) ;

regle 401440:
application : iliad ;


DPENTCY = COD7CY ;
APENTCY_1 = COD7CY * positif(COD7CY) * (1 - V_CNR) ;
APENTCY = positif(null(V_IND_TRAIT-4)+COD9ZA) * (APENTCY_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(APENTCY_1,max(max(APENTCY_P,APENTCY_PA),APENTCY1731))*(1-V_INDTEO)+APENTCY_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RPENTCY_1 = max(min(APENTCY , RRI1-RLOGDOM-RCOMP-RRETU-RDONS-CRDIE-RDUFREP-RPINELTOT-RNORMTOT-RNOUV) , 0) ;
RPENTCY = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RPENTCY_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RPENTCY_1,max(max(RPENTCY_P,RPENTCY_PA),RPENTCY1731))*(1-V_INDTEO)+RPENTCY_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

DPENTDY = COD7DY ;
APENTDY_1 = COD7DY * positif(COD7DY) * (1 - V_CNR) ;
APENTDY = positif(null(V_IND_TRAIT-4)+COD9ZA) * (APENTDY_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(APENTDY_1,max(max(APENTDY_P,APENTDY_PA),APENTDY1731))*(1-V_INDTEO)+APENTDY_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RPENTDY_1 = max(min(APENTDY , RRI1-RLOGDOM-RCOMP-RRETU-RDONS-CRDIE-RDUFREP-RPINELTOT-RNORMTOT-RNOUV-RPENTCY) , 0) ;
RPENTDY =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RPENTDY_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RPENTDY_1,max(max(RPENTDY_P,RPENTDY_PA),RPENTDY1731))*(1-V_INDTEO)+RPENTDY_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

DPENTEY = COD7EY ;
APENTEY_1 = COD7EY * positif(COD7EY) * (1 - V_CNR) ;
APENTEY = positif(null(V_IND_TRAIT-4)+COD9ZA) * (APENTEY_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(APENTEY_1,max(max(APENTEY_P,APENTEY_PA),APENTEY1731))*(1-V_INDTEO)+APENTEY_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RPENTEY_1 = max(min(APENTEY , RRI1-RLOGDOM-RCOMP-RRETU-RDONS-CRDIE-RDUFREP-RPINELTOT-RNORMTOT-RNOUV-RPENTCY- RPENTDY) , 0) ;
RPENTEY =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RPENTEY_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RPENTEY_1,max(max(RPENTEY_P,RPENTEY_PA),RPENTEY1731))*(1-V_INDTEO)+RPENTEY_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

DPENTFY = COD7FY ;
APENTFY_1 = COD7FY * positif(COD7FY) * (1 - V_CNR) ;
APENTFY = positif(null(V_IND_TRAIT-4)+COD9ZA) * (APENTFY_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(APENTFY_1,max(max(APENTFY_P,APENTFY_PA),APENTFY1731))*(1-V_INDTEO)+APENTFY_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RPENTFY_1 = max(min(APENTFY , RRI1-RLOGDOM-RCOMP-RRETU-RDONS-CRDIE-RDUFREP-RPINELTOT-RNORMTOT-RNOUV-RPENTCY-RPENTDY-RPENTEY) , 0);
RPENTFY =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RPENTFY_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RPENTFY_1,max(max(RPENTFY_P,RPENTFY_PA),RPENTFY1731))*(1-V_INDTEO)+RPENTFY_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;


DPENTEK = COD7EK ;
APENTEK_1 = COD7EK * positif(COD7EK) * (1 - V_CNR) ;
APENTEK = positif(null(V_IND_TRAIT-4)+COD9ZA) * (APENTEK_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(APENTEK_1,max(max(APENTEK_P,APENTEK_PA),APENTEK1731))*(1-V_INDTEO)+APENTEK_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RPENTEK_1 =  max(min(APENTEK , RRI1-RLOGDOM-RCOMP-RRETU-RDONS-CRDIE-RDUFREP-RPINELTOT-RNORMTOT-RNOUV-RPENTCY-RPENTDY-RPENTEY-RPENTFY) , 0) ;
RPENTEK =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RPENTEK_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
        + (max(0,min(RPENTEK_1,max(max(RPENTEK_P,RPENTEK_PA),RPENTEK1731))*(1-V_INDTEO)+RPENTEK_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;


DPENTGY = COD7GY ;
APENTGY_1 = COD7GY * positif(COD7GY) * (1 - V_CNR) ;
APENTGY = positif(null(V_IND_TRAIT-4)+COD9ZA) * (APENTGY_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(APENTGY_1,max(max(APENTGY_P,APENTGY_PA),APENTGY1731))*(1-V_INDTEO)+APENTGY_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RPENTGY_1 =  max(min(APENTGY , RRI1-RLOGDOM-RCOMP-RRETU-RDONS-CRDIE-RDUFREP-RPINELTOT-RNORMTOT-RNOUV-RPENTCY-RPENTDY-RPENTEY-RPENTFY-RPENTEK) , 0) ;
RPENTGY =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RPENTGY_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RPENTGY_1,max(max(RPENTGY_P,RPENTGY_PA),RPENTGY1731))*(1-V_INDTEO)+RPENTGY_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;



DPENTY = DPENTCY + DPENTDY + DPENTEY + DPENTFY + DPENTGY + DPENTEK ;  

APENTY = APENTCY + APENTDY + APENTEY + APENTFY + APENTGY + APENTEK ; 

RPENTY = RPENTCY + RPENTDY + RPENTEY + RPENTFY + RPENTGY + RPENTEK ;
regle 401450:
application : iliad ;

RPENTOT = RPENTCY + RPENTDY + RPENTEY + RPENTFY + RPENTGY + RPENTEK + RPMEJEI;
RPENTOT_1 = RPENTCY_1 + RPENTDY_1 + RPENTEY_1 + RPENTFY_1 + RPENTGY_1 + RPENTEK_1 + RPMEJEI_1;

regle 401460:
application : iliad ;




RPLAFPME24 = arr(max(0 ,RSNCO + RSNCH + RSNGW + RSNCI - 10000)) * (1 - V_CNR) * positif(AVFISCOPTER) ;

RPLAFPME20 = arr(max(0 ,(RSNCO + RSNCH + RSNGW + RSNCI + RSNCX + RSNCS + RSNBS + RPENTDY) - (10000 + RPLAFPME24))) * positif(AVFISCOPTER) ;

RPLAFPME21 = arr(max(0 ,(RSNCO + RSNCH + RSNGW + RSNCI + RSNCX + RSNCS + RSNBS + RPENTDY + RSNCT + RSNCA + RPENTEY) - (10000 +RPLAFPME24 + RPLAFPME20))) * positif(AVFISCOPTER) ;

RPLAFPME22 = arr(max(0 , (RSNCO + RSNCH + RSNGW + RSNCI + RSNCX + RSNCS + RSNBS + RPENTDY + RSNCT + RSNCA + RPENTEY + RSNCU + RSNCW + RSNBU + RPENTFY) - (10000 + RPLAFPME24 + RPLAFPME20 + RPLAFPME21))) * positif(AVFISCOPTER) ;

RPLAFPME23 = arr(max(0 , (RSNCO + RSNCH + RSNGW + RSNCI + RSNCX + RSNCS + RSNBS + RPENTDY + RSNCT + RSNCA + RPENTEY + RSNCU + RSNCW + RSNBU + RPENTFY + RSNCP + RSNCQ +RSNBW + RPENTGY ) - (10000  + RPLAFPME24 + RPLAFPME20 + RPLAFPME21 + RPLAFPME22 ))) * positif(AVFISCOPTER) ;

R2PLAFPME21 = arr(max(0 , (RSNCO + RSNCH + RSNGW + RSNCI + RSNCX + RSNCS + RSNBS + RPENTDY + RSNCT + RSNCA + RPENTEY + RSNCU + RSNCW + RSNBU + RPENTFY + RSNCP + RSNCQ + RSNBW + RPENTGY + RSNDC + RSNBT + RPENTEK) - (13000 + RPLAFPME24 + RPLAFPME20 + RPLAFPME21 + RPLAFPME22 + RPLAFPME23))) * positif(AVFISCOPTER) ;


regle 401470:
application : iliad ;


AILMHO_1 = COD7HO * (1 - V_CNR) ;
AILMHO =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMHO_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMHO_1,max(max(AILMHO_P,AILMHO_PA),AILMHO1731))*(1-V_INDTEO)+AILMHO_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

AILMHT_1 = COD7HT * (1 - V_CNR) ;
AILMHT =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMHT_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMHT_1,max(max(AILMHT_P,AILMHT_PA),AILMHT1731))*(1-V_INDTEO)+AILMHT_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

AILMHD_1 = COD7HD * (1 - V_CNR) ;
AILMHD = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMHD_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMHD_1 , max(max(AILMHD_P,AILMHD_PA),AILMHD1731))*(1-V_INDTEO)+AILMHD_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMHP_1 = COD7HP * (1 - V_CNR) ;
AILMHP = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMHP_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMHP_1 , max(max(AILMHP_P,AILMHP_PA),AILMHP1731))*(1-V_INDTEO)+AILMHP_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMHU_1 = COD7HU * (1 - V_CNR) ;
AILMHU =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMHU_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMHU_1,max(max(AILMHU_P,AILMHU_PA),AILMHU1731))*(1-V_INDTEO)+AILMHU_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

AILMHE_1 = COD7HE * (1 - V_CNR) ;
AILMHE = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMHE_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMHE_1 , max(max(AILMHE_P,AILMHE_PA),AILMHE1731))*(1-V_INDTEO)+AILMHE_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMHQ_1 = COD7HQ * (1 - V_CNR) ;
AILMHQ =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMHQ_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMHQ_1,max(max(AILMHQ_P,AILMHQ_PA),AILMHQ1731))*(1-V_INDTEO)+AILMHQ_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

AILMHV_1 = COD7HV * (1 - V_CNR) ;
AILMHV =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMHV_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMHV_1,max(max(AILMHV_P,AILMHV_PA),AILMHV1731))*(1-V_INDTEO)+AILMHV_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

AILMHF_1 = COD7HF * (1 - V_CNR) ;
AILMHF = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMHF_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMHF_1 , max(max(AILMHF_P,AILMHF_PA),AILMHF1731))*(1-V_INDTEO)+AILMHF_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMHR_1 = COD7HR * (1 - V_CNR) ;
AILMHR =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMHR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMHR_1,max(max(AILMHR_P,AILMHR_PA),AILMHR1731))*(1-V_INDTEO)+AILMHR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

AILMHW_1 = COD7HW * (1 - V_CNR) ;
AILMHW =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMHW_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMHW_1,max(max(AILMHW_P,AILMHW_PA),AILMHW1731))*(1-V_INDTEO)+AILMHW_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

AILMHG_1 = COD7HG * (1 - V_CNR) ;
AILMHG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMHG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMHG_1 , max(max(AILMHG_P,AILMHG_PA),AILMHG1731))*(1-V_INDTEO)+AILMHG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMHS_1 = COD7HS * (1 - V_CNR) ;
AILMHS =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMHS_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMHS_1,max(max(AILMHS_P,AILMHS_PA),AILMHS1731))*(1-V_INDTEO)+AILMHS_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

AILMHX_1 = COD7HX * (1 - V_CNR) ;
AILMHX =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMHX_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMHX_1,max(max(AILMHX_P,AILMHX_PA),AILMHX1731))*(1-V_INDTEO)+AILMHX_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

AILMHH_1 = COD7HH * (1 - V_CNR) ;
AILMHH = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMHH_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMHH_1 , max(max(AILMHH_P,AILMHH_PA),AILMHH1731))*(1-V_INDTEO)+AILMHH_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMKE_1 = COD7KE * (1 - V_CNR) ;
AILMKE = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMKE_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMKE_1 , max(max(AILMKE_P,AILMKE_PA),AILMKE1731))*(1-V_INDTEO)+AILMKE_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMKF_1 = COD7KF * (1 - V_CNR) ;
AILMKF = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMKF_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMKF_1 , max(max(AILMKF_P,AILMKF_PA),AILMKF1731))*(1-V_INDTEO)+AILMKF_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMKG_1 = COD7KG * (1 - V_CNR) ;
AILMKG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMKG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMKG_1 , max(max(AILMKG_P,AILMKG_PA),AILMKG1731))*(1-V_INDTEO)+AILMKG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMKH_1 = COD7KH * (1 - V_CNR) ;
AILMKH = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMKH_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMKH_1 , max(max(AILMKH_P,AILMKH_PA),AILMKH1731))*(1-V_INDTEO)+AILMKH_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMKI_1 = COD7KI * (1 - V_CNR) ;
AILMKI = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMKI_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMKI_1 , max(max(AILMKI_P,AILMKI_PA),AILMKI1731))*(1-V_INDTEO)+AILMKI_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMOA_1 = COD7OA * (1 - V_CNR) ;
AILMOA = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMOA_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMOA_1 , max(max(AILMOA_P,AILMOA_PA),AILMOA1731))*(1-V_INDTEO)+AILMOA_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMOB_1 = COD7OB * (1 - V_CNR) ;
AILMOB = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMOB_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMOB_1 , max(max(AILMOB_P,AILMOB_PA),AILMOB1731))*(1-V_INDTEO)+AILMOB_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMOC_1 = COD7OC * (1 - V_CNR) ;
AILMOC = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMOC_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMOC_1 , max(max(AILMOC_P,AILMOC_PA),AILMOC1731))*(1-V_INDTEO)+AILMOC_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMOD_1 = COD7OD * (1 - V_CNR) ;
AILMOD = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMOD_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMOD_1 , max(max(AILMOD_P,AILMOD_PA),AILMOD1731))*(1-V_INDTEO)+AILMOD_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMOE_1 = COD7OE * (1 - V_CNR) ;
AILMOE = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMOE_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMOE_1 , max(max(AILMOE_P,AILMOE_PA),AILMOE1731))*(1-V_INDTEO)+AILMOE_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMPO_1 = COD7PO * (1 - V_CNR) ;
AILMPO = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMPO_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMPO_1 , max(max(AILMPO_P,AILMPO_PA),AILMPO1731))*(1-V_INDTEO)+AILMPO_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMPP_1 = COD7PP * (1 - V_CNR) ;
AILMPP = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMPP_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMPP_1 , max(max(AILMPP_P,AILMPP_PA),AILMPP1731))*(1-V_INDTEO)+AILMPP_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMPQ_1 = COD7PQ * (1 - V_CNR) ;
AILMPQ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMPQ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMPQ_1 , max(max(AILMPQ_P,AILMPQ_PA),AILMPQ1731))*(1-V_INDTEO)+AILMPQ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMPR_1 = COD7PR * (1 - V_CNR) ;
AILMPR = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMPR_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMPR_1 , max(max(AILMPR_P,AILMPR_PA),AILMPR1731))*(1-V_INDTEO)+AILMPR_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

AILMPS_1 = COD7PS * (1 - V_CNR) ;
AILMPS = positif(null(V_IND_TRAIT - 4) + COD9ZA) * AILMPS_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(AILMPS_1 , max(max(AILMPS_P,AILMPS_PA),AILMPS1731))*(1-V_INDTEO)+AILMPS_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
	  
DILMNP1 = COD7HD + COD7HO + COD7HT + COD7HE  
          + COD7HP + COD7HU + COD7HF + COD7HQ + COD7HV + COD7HG 
	  + COD7HR + COD7HW + COD7HH + COD7HS + COD7HX 
	  + COD7KE + COD7KF + COD7KG + COD7KH + COD7KI + COD7OA + COD7OB + COD7OC + COD7OD + COD7OE + COD7PO + COD7PP + COD7PQ + COD7PR+ COD7PS;

AILMNP1 = AILMHD + AILMHO + AILMHT + AILMHE  
          + AILMHP + AILMHU + AILMHF + AILMHQ + AILMHV + AILMHG 
	  + AILMHR + AILMHW + AILMHH + AILMHS + AILMHX 
	  + AILMKE + AILMKF + AILMKG + AILMKH + AILMKI + AILMOA + AILMOB + AILMOC + AILMOD + AILMOE + AILMPO + AILMPP + AILMPQ + AILMPR+AILMPS;


BILMOT = min(LIMREPLOC8 , COD7OT) * (1 - COD7OZ) + COD7OT * COD7OZ ;
AILMOT_1 = (BILMOT) * (1 - V_CNR) ;
AILMOT =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMOT_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMOT_1,max(max(AILMOT_P,AILMOT_PA),AILMOT1731))*(1-V_INDTEO)+AILMOT_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

BILMOS = min(LIMREPLOC8 , COD7OS) * (1 - COD7OZ) + COD7OS * COD7OZ ;
AILMOS_1 = (BILMOS) * (1 - V_CNR) ;
AILMOS =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMOS_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMOS_1,max(max(AILMOS_P,AILMOS_PA),AILMOS1731))*(1-V_INDTEO)+AILMOS_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

BILMOR = min(LIMREPLOC6 , COD7OR) * (1 - COD7OZ) + COD7OR * COD7OZ ;
AILMOR_1 = (BILMOR) * (1 - V_CNR) ;
AILMOR =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMOR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMOR_1,max(max(AILMOR_P,AILMOR_PA),AILMOR1731))*(1-V_INDTEO)+AILMOR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

BILMOQ = min(LIMREPLOC5 , COD7OQ) * (1 - COD7OZ) + COD7OQ * COD7OZ ;
AILMOQ_1 = (BILMOQ) * (1 - V_CNR) ;
AILMOQ =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMOQ_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMOQ_1,max(max(AILMOQ_P,AILMOQ_PA),AILMOQ1731))*(1-V_INDTEO)+AILMOQ_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

BILMOP = min(LIMREPLOC11 , COD7OP) * (1 - COD7OZ) + COD7OP * COD7OZ ;
AILMOP_1 = (BILMOP) * (1 - V_CNR) ;
AILMOP =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMOP_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMOP_1,max(max(AILMOP_P,AILMOP_PA),AILMOP1731))*(1-V_INDTEO)+AILMOP_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

BILMSA = min(LIMREPLOC11 , COD7SA) * (1 - COD7OZ) + COD7SA * COD7OZ ;
AILMSA_1 = (BILMSA) * (1 - V_CNR) ;
AILMSA =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMSA_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMSA_1,max(max(AILMSA_P,AILMSA_PA),AILMSA1731))*(1-V_INDTEO)+AILMSA_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

BILMSB = min(LIMREPLOC2 , COD7SB) * (1 - COD7OZ) + COD7SB * COD7OZ ;
AILMSB_1 = (BILMSB) * (1 - V_CNR) ;
AILMSB =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMSB_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMSB_1,max(max(AILMSB_P,AILMSB_PA),AILMSB1731))*(1-V_INDTEO)+AILMSB_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

BILMSC = min(LIMREPLOC9 , COD7SC) * (1 - COD7OZ) + COD7SC * COD7OZ ;
AILMSC_1 = (BILMSC) * (1 - V_CNR) ;
AILMSC =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMSC_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMSC_1,max(max(AILMSC_P,AILMSC_PA),AILMSC1731))*(1-V_INDTEO)+AILMSC_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

BILMSN = min(LIMREPLOC11 , COD7SN) * (1 - COD7OZ) + COD7SN * COD7OZ ;
AILMSN_1 = (BILMSN) * (1 - V_CNR) ;
AILMSN =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMSN_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMSN_1,max(max(AILMSN_P,AILMSN_PA),AILMSN1731))*(1-V_INDTEO)+AILMSN_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

BILMSO = min(LIMREPLOC2 , COD7SO) * (1 - COD7OZ) + COD7SO * COD7OZ ;
AILMSO_1 = (BILMSO) * (1 - V_CNR) ;
AILMSO =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMSO_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMSO_1,max(max(AILMSO_P,AILMSO_PA),AILMSO1731))*(1-V_INDTEO)+AILMSO_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

BILMSP = min(LIM10000 , COD7SP) * (1 - COD7OZ) + COD7SP * COD7OZ ;
AILMSP_1 = (BILMSP) * (1 - V_CNR) ;
AILMSP =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMSP_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMSP_1,max(max(AILMSP_P,AILMSP_PA),AILMSP1731))*(1-V_INDTEO)+AILMSP_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
BILMSM = min(LIM10000 , COD7SM) * (1 - COD7OZ) + COD7SM * COD7OZ ;
AILMSM_1 = (BILMSM) * (1 - V_CNR) ;
AILMSM =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMSM_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMSM_1,max(max(AILMSM_P,AILMSM_PA),AILMSM1731))*(1-V_INDTEO)+AILMSM_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

BILMSS = min(LIM10000 , COD7SS) * (1 - COD7OZ) + COD7SS * COD7OZ ;
AILMSS_1 = (BILMSS) * (1 - V_CNR) ;
AILMSS =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMSS_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMSS_1,max(max(AILMSS_P,AILMSS_PA),AILMSS1731))*(1-V_INDTEO)+AILMSS_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

BILMST = min(LIM10000 , COD7ST) * (1 - COD7OZ) + COD7ST * COD7OZ ;
AILMST_1 = (BILMST) * (1 - V_CNR) ;
AILMST =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMST_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMST_1,max(max(AILMST_P,AILMST_PA),AILMST1731))*(1-V_INDTEO)+AILMST_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

BILMSX = min(LIM10000 , COD7SX) * (1 - COD7OZ) + COD7SX * COD7OZ ;
AILMSX_1 = (BILMSX) * (1 - V_CNR) ;
AILMSX =positif(null(V_IND_TRAIT-4)+COD9ZA) * (AILMSX_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(AILMSX_1,max(max(AILMSX_P,AILMSX_PA),AILMSX1731))*(1-V_INDTEO)+AILMSX_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

DILMNP3 = COD7OP + COD7OQ + COD7OR + COD7OS + COD7OT + COD7SA + COD7SB + COD7SC + COD7SN + COD7SO + COD7SP + COD7SM + COD7SS + COD7ST + COD7SX;

AILMNP3 = AILMOP + AILMOQ + AILMOR + AILMOS + AILMOT + AILMSA + AILMSB + AILMSC + AILMSN + AILMSO + AILMSP + AILMSM + AILMSS + AILMST + AILMSX;

regle 401500:
application : iliad ;

VARTMP1 = DEC11 + REDUCAVTCEL + RCELTOT ;

RILMHO_1 = max(min(COD7HO , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMHO = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMHO_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMHO_1 , max(max(RILMHO_P,RILMHO_PA),RILMHO1731))*(1-V_INDTEO)+RILMHO_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMHO ;


RILMHP_1 = max(min(COD7HP , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMHP = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMHP_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMHP_1 , max(max(RILMHP_P,RILMHP_PA),RILMHP1731))*(1-V_INDTEO)+RILMHP_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMHP ;


RILMHQ_1 = max(min(COD7HQ , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMHQ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMHQ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMHQ_1 , max(max(RILMHQ_P,RILMHQ_PA),RILMHQ1731))*(1-V_INDTEO)+RILMHQ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMHQ ;


RILMHR_1 = max(min(COD7HR , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMHR = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMHR_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMHR_1 , max(max(RILMHR_P,RILMHR_PA),RILMHR1731))*(1-V_INDTEO)+RILMHR_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMHR ;


RILMHS_1 = max(min(COD7HS , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMHS = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMHS_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMHS_1 , max(max(RILMHS_P,RILMHS_PA),RILMHS1731))*(1-V_INDTEO)+RILMHS_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMHS ;


RILMHT_1 = max(min(COD7HT , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMHT = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMHT_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMHT_1 , max(max(RILMHT_P,RILMHT_PA),RILMHT1731))*(1-V_INDTEO)+RILMHT_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMHT ;

REPMEUHT = (COD7HT - RILMHT) * (1 - V_CNR) ;

RILMHU_1 = max(min(COD7HU , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMHU = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMHU_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMHU_1 , max(max(RILMHU_P,RILMHU_PA),RILMHU1731))*(1-V_INDTEO)+RILMHU_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMHU ;

REPMEUHU = (COD7HU - RILMHU) * (1 - V_CNR) ;

RILMHV_1 = max(min(COD7HV , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMHV = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMHV_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMHV_1 , max(max(RILMHV_P,RILMHV_PA),RILMHV1731))*(1-V_INDTEO)+RILMHV_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMHV ;

REPMEUHV = (COD7HV - RILMHV) * (1 - V_CNR) ;

RILMHW_1 = max(min(COD7HW , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMHW = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMHW_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMHW_1 , max(max(RILMHW_P,RILMHW_PA),RILMHW1731))*(1-V_INDTEO)+RILMHW_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMHW ;

REPMEUHW = (COD7HW - RILMHW) * (1 - V_CNR) ;

RILMHX_1 = max(min(COD7HX , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMHX = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMHX_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMHX_1 , max(max(RILMHX_P,RILMHX_PA),RILMHX1731))*(1-V_INDTEO)+RILMHX_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMHX ;

REPMEUHX = (COD7HX - RILMHX) * (1 - V_CNR) ;

RILMHD_1 = max(min(COD7HD , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMHD = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMHD_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMHD_1 , max(max(RILMHD_P,RILMHD_PA),RILMHD1731))*(1-V_INDTEO)+RILMHD_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMHD ;

REPMEUHD = (COD7HD - RILMHD) * (1 - V_CNR) ;

RILMHE_1 = max(min(COD7HE , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMHE = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMHE_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMHE_1 , max(max(RILMHE_P,RILMHE_PA),RILMHE1731))*(1-V_INDTEO)+RILMHE_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMHE ;

REPMEUHE = (COD7HE - RILMHE) * (1 - V_CNR) ;

RILMHF_1 = max(min(COD7HF , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMHF = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMHF_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMHF_1 , max(max(RILMHF_P,RILMHF_PA),RILMHF1731))*(1-V_INDTEO)+RILMHF_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMHF ;

REPMEUHF = (COD7HF - RILMHF) * (1 - V_CNR) ;

RILMHG_1 = max(min(COD7HG , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMHG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMHG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMHG_1 , max(max(RILMHG_P,RILMHG_PA),RILMHG1731))*(1-V_INDTEO)+RILMHG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMHG ;

REPMEUHG = (COD7HG - RILMHG) * (1 - V_CNR) ;

RILMHH_1 = max(min(COD7HH , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMHH = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMHH_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMHH_1 , max(max(RILMHH_P,RILMHH_PA),RILMHH1731))*(1-V_INDTEO)+RILMHH_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMHH ;

REPMEUHH = (COD7HH - RILMHH) * (1 - V_CNR) ;

RILMKE_1 = max(min(COD7KE , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMKE = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMKE_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMKE_1 , max(max(RILMKE_P,RILMKE_PA),RILMKE1731))*(1-V_INDTEO)+RILMKE_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMKE ;

REPMEUKE = (COD7KE - RILMKE) * (1 - V_CNR) ;

RILMKF_1 = max(min(COD7KF , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMKF = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMKF_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMKF_1 , max(max(RILMKF_P,RILMKF_PA),RILMKF1731))*(1-V_INDTEO)+RILMKF_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMKF ;

REPMEUKF = (COD7KF - RILMKF) * (1 - V_CNR) ;

RILMKG_1 = max(min(COD7KG , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMKG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMKG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMKG_1 , max(max(RILMKG_P,RILMKG_PA),RILMKG1731))*(1-V_INDTEO)+RILMKG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
	 VARTMP1 = VARTMP1 + RILMKG ;

REPMEUKG = (COD7KG - RILMKG) * (1 - V_CNR) ;

RILMKH_1 = max(min(COD7KH , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMKH = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMKH_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMKH_1 , max(max(RILMKH_P,RILMKH_PA),RILMKH1731))*(1-V_INDTEO)+RILMKH_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMKH ;

REPMEUKH = (COD7KH - RILMKH) * (1 - V_CNR) ;

RILMKI_1 = max(min(COD7KI , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMKI = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMKI_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMKI_1 , max(max(RILMKI_P,RILMKI_PA),RILMKI1731))*(1-V_INDTEO)+RILMKI_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMKI ;

REPMEUKI = (COD7KI - RILMKI) * (1 - V_CNR) ;

RILMOA_1 = max(min(COD7OA , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMOA = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMOA_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMOA_1 , max(max(RILMOA_P,RILMOA_PA),RILMOA1731))*(1-V_INDTEO)+RILMOA_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMOA ;

RILMOB_1 = max(min(COD7OB , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMOB = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMOB_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMOB_1 , max(max(RILMOB_P,RILMOB_PA),RILMOB1731))*(1-V_INDTEO)+RILMOB_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMOB ;

RILMOC_1 = max(min(COD7OC , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMOC = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMOC_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMOC_1 , max(max(RILMOC_P,RILMOC_PA),RILMOC1731))*(1-V_INDTEO)+RILMOC_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMOC ;

RILMOD_1 = max(min(COD7OD , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMOD = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMOD_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMOD_1 , max(max(RILMOD_P,RILMOD_PA),RILMOD1731))*(1-V_INDTEO)+RILMOD_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMOD ;

RILMOE_1 = max(min(COD7OE , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMOE = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMOE_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMOE_1 , max(max(RILMOE_P,RILMOE_PA),RILMOE1731))*(1-V_INDTEO)+RILMOE_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMOE ;

RILMPO_1 = max(min(COD7PO , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMPO = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMPO_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMPO_1 , max(max(RILMPO_P,RILMPO_PA),RILMPO1731))*(1-V_INDTEO)+RILMPO_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMPO ;

RILMPP_1 = max(min(COD7PP , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMPP = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMPP_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMPP_1 , max(max(RILMPP_P,RILMPP_PA),RILMPP1731))*(1-V_INDTEO)+RILMPP_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMPP ;

RILMPQ_1 = max(min(COD7PQ , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMPQ = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMPQ_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMPQ_1 , max(max(RILMPQ_P,RILMPQ_PA),RILMPQ1731))*(1-V_INDTEO)+RILMPQ_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMPQ ;

RILMPR_1 = max(min(COD7PR , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMPR = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMPR_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMPR_1 , max(max(RILMPR_P,RILMPR_PA),RILMPR1731))*(1-V_INDTEO)+RILMPR_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RILMPR ;

RILMPS_1 = max(min(COD7PS , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMPS = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RILMPS_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RILMPS_1 , max(max(RILMPS_P,RILMPS_PA),RILMPS1731))*(1-V_INDTEO)+RILMPS_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = 0 ;

REPMEUOA = (COD7OA - RILMOA) * (1 - V_CNR) ;
REPMEUOB = (COD7OB - RILMOB) * (1 - V_CNR) ;
REPMEUOC = (COD7OC - RILMOC) * (1 - V_CNR) ;
REPMEUOD = (COD7OD - RILMOD) * (1 - V_CNR) ;
REPMEUOE = (COD7OE - RILMOE) * (1 - V_CNR) ;
REPMEUPO = (COD7PO - RILMPO) * (1 - V_CNR) ;
REPMEUPP = (COD7PP - RILMPP) * (1 - V_CNR) ;
REPMEUPQ = (COD7PQ - RILMPQ) * (1 - V_CNR) ;
REPMEUPR = (COD7PR - RILMPR) * (1 - V_CNR) ;
REPMEUPS = (COD7PS - RILMPS) * (1 - V_CNR) ;

RILMNP1 = RILMHD + RILMHO + RILMHT + RILMHE + RILMHP + RILMHU + RILMHF
          + RILMHQ + RILMHV + RILMHG + RILMHR + RILMHW + RILMHH
	  + RILMHS + RILMHX + RILMKE + RILMKF + RILMKG + RILMKH + RILMKI 
	  + RILMOA + RILMOB + RILMOC + RILMOD + RILMOE + RILMPO + RILMPP + RILMPQ + RILMPR + RILMPS;

RILMNP1_1 = RILMHD_1 + RILMHO_1 + RILMHT_1 + RILMHE_1 + RILMHP_1 + RILMHU_1 + RILMHF_1 
            + RILMHQ_1 + RILMHV_1 + RILMHG_1 + RILMHR_1 + RILMHW_1 + RILMHH_1 
	    + RILMHS_1 + RILMHX_1 + RILMKE_1 + RILMKF_1 + RILMKG_1 + RILMKH_1 + RILMKI_1 
	    + RILMOA_1 + RILMOB_1 + RILMOC_1 + RILMOD_1 + RILMOE_1 + RILMPO_1+RILMPP_1+RILMPQ_1+RILMPR_1+RILMPS_1;

regle 401680:
application : iliad ;

VARTMP1 = DEC11 + REDUCAVTCEL + RCELTOT + RILMNP1 ;

RILMOT_1 = max(min(BILMOT , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMOT =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RILMOT_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RILMOT_1,max(max(RILMOT_P,RILMOT_PA),RILMOT1731))*(1-V_INDTEO)+RILMOT_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RILMOT ;

RILMOS_1 = max(min(BILMOS , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMOS =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RILMOS_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RILMOS_1,max(max(RILMOS_P,RILMOS_PA),RILMOS1731))*(1-V_INDTEO)+RILMOS_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RILMOS ;

RILMOR_1 = max(min(BILMOR , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMOR =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RILMOR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RILMOR_1,max(max(RILMOR_P,RILMOR_PA),RILMOR1731))*(1-V_INDTEO)+RILMOR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RILMOR ;

RILMOQ_1 = max(min(BILMOQ , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMOQ =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RILMOQ_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RILMOQ_1,max(max(RILMOQ_P,RILMOQ_PA),RILMOQ1731))*(1-V_INDTEO)+RILMOQ_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RILMOQ ;

RILMOP_1 = max(min(BILMOP , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMOP =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RILMOP_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RILMOP_1,max(max(RILMOP_P,RILMOP_PA),RILMOP1731))*(1-V_INDTEO)+RILMOP_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RILMOP ;

RILMSC_1 = max(min(BILMSC , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMSC =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RILMSC_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RILMSC_1,max(max(RILMSC_P,RILMSC_PA),RILMSC1731))*(1-V_INDTEO)+RILMSC_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RILMSC ;

RILMSB_1 = max(min(BILMSB , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMSB =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RILMSB_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RILMSB_1,max(max(RILMSB_P,RILMSB_PA),RILMSB1731))*(1-V_INDTEO)+RILMSB_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RILMSB ;

RILMSA_1 = max(min(BILMSA , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMSA =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RILMSA_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RILMSA_1,max(max(RILMSA_P,RILMSA_PA),RILMSA1731))*(1-V_INDTEO)+RILMSA_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RILMSA ;

RILMSO_1 = max(min(BILMSO , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMSO =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RILMSO_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RILMSO_1,max(max(RILMSO_P,RILMSO_PA),RILMSO1731))*(1-V_INDTEO)+RILMSO_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RILMSO ;

RILMSN_1 = max(min(BILMSN , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMSN =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RILMSN_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RILMSN_1,max(max(RILMSN_P,RILMSN_PA),RILMSN1731))*(1-V_INDTEO)+RILMSN_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RILMSN ;

RILMSP_1 = max(min(BILMSP , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMSP =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RILMSP_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RILMSP_1,max(max(RILMSP_P,RILMSP_PA),RILMSP1731))*(1-V_INDTEO)+RILMSP_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RILMSP ;

RILMSM_1 = max(min(BILMSM , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMSM =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RILMSM_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RILMSM_1,max(max(RILMSM_P,RILMSM_PA),RILMSM1731))*(1-V_INDTEO)+RILMSM_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RILMSM ;

RILMSS_1 = max(min(BILMSS , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMSS =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RILMSS_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RILMSS_1,max(max(RILMSS_P,RILMSS_PA),RILMSS1731))*(1-V_INDTEO)+RILMSS_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RILMSS ;

RILMST_1 = max(min(BILMST , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMST =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RILMST_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RILMST_1,max(max(RILMST_P,RILMST_PA),RILMST1731))*(1-V_INDTEO)+RILMST_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RILMST ;

RILMSX_1 = max(min(BILMSX , IDOM11 - VARTMP1) , 0) * (1 - V_CNR) ;
RILMSX =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RILMSX_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RILMSX_1,max(max(RILMSX_P,RILMSX_PA),RILMSX1731))*(1-V_INDTEO)+RILMSX_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

VARTMP1 = 0 ;
RILMNP3 = RILMOP + RILMOQ + RILMOR + RILMOS + RILMOT + RILMSA + RILMSB + RILMSC + RILMSN + RILMSO + RILMSP + RILMSM + RILMSS + RILMST + RILMSX ;

RILMNP3_1 = RILMOP_1 + RILMOQ_1 + RILMOR_1 + RILMOS_1 + RILMOT_1 + RILMSA_1 + RILMSB_1 + RILMSC_1 + RILMSN_1 + RILMSO_1 + RILMSP_1 + RILMSM_1 + RILMSS_1 + RILMST_1 + RILMSX_1 ;

REPMEUOT = (BILMOT - RILMOT) * (1 - V_CNR) ;
REPMEUOS = (BILMOS - RILMOS) * (1 - V_CNR) ;
REPMEUOR = (BILMOR - RILMOR) * (1 - V_CNR) ;
REPMEUOQ = (BILMOQ - RILMOQ) * (1 - V_CNR) ;
REPMEUOP = (BILMOP - RILMOP) * (1 - V_CNR) ;
REPMEUSA = (BILMSA - RILMSA) * (1 - V_CNR) ;
REPMEUSB = (BILMSB - RILMSB) * (1 - V_CNR) ;
REPMEUSC = (BILMSC - RILMSC) * (1 - V_CNR) ;
REPMEUSN = (BILMSN - RILMSN) * (1 - V_CNR) ;
REPMEUSO = (BILMSO - RILMSO) * (1 - V_CNR) ;
REPMEUSP = (BILMSP - RILMSP) * (1 - V_CNR) ;
REPMEUSM = (BILMSM - RILMSM) * (1 - V_CNR) ;
REPMEUSS = (BILMSS - RILMSS) * (1 - V_CNR) ;
REPMEUST = (BILMST - RILMST) * (1 - V_CNR) ;
REPMEUSX = (BILMSX - RILMSX) * (1 - V_CNR) ;

regle 401750:
application : iliad ;


DCODMN = COD7MN ;
ACODMN_1 = min(DCODMN , PLAF_RESINEUV) * (1 - V_CNR) ;
ACODMN =positif(null(V_IND_TRAIT-4)+COD9ZA) * (ACODMN_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(ACODMN_1,max(max(ACODMN_P,ACODMN_PA),ACODMN1731))*(1-V_INDTEO)+ACODMN_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

DCODMW = COD7MW ;
ACODMW_1 = min(DCODMW , PLAF_RESINEUV) * (1 - V_CNR) ;
ACODMW =positif(null(V_IND_TRAIT-4)+COD9ZA) * (ACODMW_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(ACODMW_1,max(max(ACODMW_P,ACODMW_PA),ACODMW1731))*(1-V_INDTEO)+ACODMW_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

DCODMZ = COD7MZ ;
ACODMZ_1 = min(DCODMZ , PLAF_RESINEUV) * (1 - V_CNR) ;
ACODMZ =positif(null(V_IND_TRAIT-4)+COD9ZA) * (ACODMZ_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(ACODMZ_1,max(max(ACODMZ_P,ACODMZ_PA),ACODMZ1731))*(1-V_INDTEO)+ACODMZ_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

DCODPZ = COD7PZ ;
ACODPZ_1 = min(DCODPZ , PLAF_RESINEUV) * (1 - V_CNR) ;
ACODPZ =positif(null(V_IND_TRAIT-4)+COD9ZA) * (ACODPZ_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(ACODPZ_1,max(max(ACODPZ_P,ACODPZ_PA),ACODPZ1731))*(1-V_INDTEO)+ACODPZ_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

DCODOY = COD7OY ;
ACODOY_1 = min(DCODOY , PLAF_RESINEUV) * (1 - V_CNR) ;
ACODOY =positif(null(V_IND_TRAIT-4)+COD9ZA) * (ACODOY_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(ACODOY_1,max(max(ACODOY_P,ACODOY_PA),ACODOY1731))*(1-V_INDTEO)+ACODOY_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;


RETCODMN = arr((ACODMN * TX11/100) /9) ;
RETCODMN_1 = arr((ACODMN_1 * TX11/100) /9) ;

RETCODMW = arr((ACODMW * TX11/100) /9) ;
RETCODMW_1 = arr((ACODMW_1 * TX11/100) /9) ;

RETCODMZ = arr((ACODMZ * TX11/100) /9) ;
RETCODMZ_1 = arr((ACODMZ_1 * TX11/100) /9) ;

RETCODPZ = arr((ACODPZ * TX11/100) /9) ;
RETCODPZ_1 = arr((ACODPZ_1 * TX11/100) /9) ;

RETCODOY = arr((ACODOY * TX11/100) /9) ;
RETCODOY_1 = arr((ACODOY_1 * TX11/100) /9) ;

regle 401770:
application : iliad ;

VARTMP1 = DEC11 + REDUCAVTCEL + RCELTOT + RILMNP1 + RILMNP3 ;

RCODOY_1 = max(min(RETCODOY , IDOM11 - VARTMP1) , 0) ;
RCODOY =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RCODOY_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RCODOY_1,max(max(RCODOY_P,RCODOY_PA),RCODOY1731))*(1-V_INDTEO)+RCODOY_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RCODOY ;

REPMEUOY = (RETCODOY * (1-PREM8_11) + RETCODOY_1 * PREM8_11  - RCODOY) * positif(COD7OY + 0) * (1 - V_CNR) ;

RCODPZ_1 = max(min(RETCODPZ , IDOM11 - VARTMP1) , 0) ;
RCODPZ =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RCODPZ_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RCODPZ_1,max(max(RCODPZ_P,RCODPZ_PA),RCODPZ1731))*(1-V_INDTEO)+RCODPZ_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RCODPZ ;

REPMEUPZ = (RETCODPZ * (1-PREM8_11) + RETCODPZ_1 * PREM8_11 - RCODPZ) * positif(COD7PZ + 0) * (1 - V_CNR) ;

RCODMZ_1 = max(min(RETCODMZ , IDOM11 - VARTMP1) , 0) ;
RCODMZ =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RCODMZ_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RCODMZ_1,max(max(RCODMZ_P,RCODMZ_PA),RCODMZ1731))*(1-V_INDTEO)+RCODMZ_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RCODMZ ;

REPMEUMZ = (RETCODMZ * (1-PREM8_11) + RETCODMZ_1 * PREM8_11  - RCODMZ) * positif(COD7MZ + 0) * (1 - V_CNR) ;

RCODMW_1 = max(min(RETCODMW , IDOM11 - VARTMP1) , 0) ;
RCODMW = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCODMW_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34  -CMAJ)))
         + (max(0 , min(RCODMW_1 , max(max(RCODMW_P,RCODMW_PA),RCODMW1731))*(1-V_INDTEO)+RCODMW_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RCODMW ;

REPMEUMW = (RETCODMW * (1-PREM8_11) + RETCODMW_1 * PREM8_11 - RCODMW) * positif(COD7MW + 0) * (1 - V_CNR) ;

RCODMN_1 = max(min(RETCODMN , IDOM11 - VARTMP1) , 0) ;
RCODMN = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RCODMN_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34  -CMAJ)))
         + (max(0 , min(RCODMN_1 , max(max(RCODMN_P,RCODMN_PA),RCODMN1731))*(1-V_INDTEO)+RCODMN_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = 0 ;

REPMEUMN = (RETCODMN * (1-PREM8_11) + RETCODMN_1 * PREM8_11 - RCODMN) * positif(COD7MN + 0) * (1 - V_CNR) ;


DILMNP4 = DCODOY + DCODPZ + DCODMZ + DCODMW + DCODMN ;

AILMNP4 = ACODOY + ACODPZ + ACODMZ + ACODMW + ACODMN ;

RILMNP4 = RCODOY + RCODPZ + RCODMZ + RCODMW + RCODMN ;
RILMNP4_1 = RETCODOY_1 + RETCODPZ_1 + RETCODMZ_1 + RETCODMW_1 + RETCODMN_1 ;

RLOCNPRO = RILMNP1 + RILMNP3 + RILMNP4 ;

RLOCNPRO_1 = RILMNP1_1 + RILMNP3_1 + RILMNP4_1 ;

regle 401810:
application : iliad ;


REP13MEU = REPMEUOY + REPMEUOP + REPMEUSA + REPMEUPZ + REPMEUMZ  + REPMEUMW + REPMEUSN + REPMEUSP + REPMEUSM + REPMEUSS + REPMEUST + REPMEUSX + REPMEUMN ;

REP12MEU = REPMEUOQ + REPMEUSB + REPMEUSO ; 

REP11MEU = REPMEUOR + REPMEUSC ;

REP10MEU = REPMEUOS ;

REP9MEU = REPMEUOT ; 
           
regle 401820:
application : iliad ;

RCODMN1 = arr((ACODMN * (1-PREM8_11) + ACODMN_1 * PREM8_11)* TX11/100/9) ;
RCODMN8 = (arr((ACODMN * (1-PREM8_11) + ACODMN_1 * PREM8_11) * TX11/100) - 8 * RCODMN1) * (1 - V_CNR) ;

REPLOCMN = (RCODMN8 + RCODMN1 * 7) ;

RCODMW1 = arr((ACODMW * (1-PREM8_11) + ACODMW_1 * PREM8_11) * TX11/100/9) ;
RCODMW8 = (arr((ACODMW * (1-PREM8_11) + ACODMW_1 * PREM8_11) * TX11/100) - 8 * RCODMW1) * (1 - V_CNR) ;

REPLOCMW = (RCODMW8 + RCODMW1 * 7) ;

RCODMZ1 = arr((ACODMZ * (1-PREM8_11) + ACODMZ_1 * PREM8_11)* TX11/100/9) ;
RCODMZ8 = (arr((ACODMZ * (1-PREM8_11) + ACODMZ_1 * PREM8_11) * TX11/100) - 8 * RCODMZ1) * (1 - V_CNR) ;

REPLOCMZ = (RCODMZ8 + RCODMZ1 * 7) ;

RCODPZ1 = arr((ACODPZ * (1-PREM8_11) + ACODPZ_1 * PREM8_11)* TX11/100/9) ;
RCODPZ8 = (arr((ACODPZ * (1-PREM8_11) + ACODPZ_1 * PREM8_11) * TX11/100) - 8 * RCODPZ1) * (1 - V_CNR) ;

REPLOCPZ = (RCODPZ8 + RCODPZ1 * 7) ;

RCODOY1 = arr((ACODOY * (1-PREM8_11) + ACODOY_1 * PREM8_11)* TX11/100/9) ;
RCODOY8 = (arr((ACODOY * (1-PREM8_11) + ACODOY_1 * PREM8_11) * TX11/100) - 8 * RCODOY1) * (1 - V_CNR) ;

REPLOCOY = (RCODOY8 + RCODOY1 * 7) ;

regle 401830:
application : iliad ;


BSOCREP = min(RSOCREPRISE , LIM_SOCREPR * ( 1 + BOOL_0AM)) ;

RSOCREP = arr ( TX_SOCREPR/100 * BSOCREP ) * (1 - V_CNR);

DSOCREPR = RSOCREPRISE;

ASOCREPR = (positif(null(V_IND_TRAIT-4) + COD9ZA) * BSOCREP * (1-positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
            + (max(0 , min(BSOCREP,max(max(BSOCREP_P,BSOCREP_PA),BSOCREP1731))*(1-V_INDTEO)+BSOCREP*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5) + 0) * (1 - V_CNR) ;

RSOCREPR_1 = max( min( RSOCREP , IDOM11-DEC11-RREPA-RDONDJ-RDONDO-RLOCANAH-RDIFAGRI-RPRESSE
                                             -RFORET-RFIPDOM-RFIPC-RCINE-RRESTIMO) , 0 );
RSOCREPR =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSOCREPR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSOCREPR_1,max(max(RSOCREPR_P,RSOCREPR_PA),RSOCREPR1731))*(1-V_INDTEO)+RSOCREPR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401835:
application : iliad ;



RCOD7KZ_1 = max(0 , min(COD7KZ , IDOM11-DEC11-RREPA-RDONDJ-RDONDO-RLOCANAH-RDIFAGRI-RPRESSE-RFORET-RFIPDOM-RFIPC-RCINE-RRESTIMO-RSOCREPR
                                     -RRPRESCOMP-RHEBE-RSURV-RINNO-RSOUFIP-RRIRENOV-RLOGDOM-RCOMP-RRETU-RDONS-CRDIE
				     -RDUFREP-RPINELTOT-RNORMTOT-RNOUV-RPENTOT-RREHAB))  * (1 - null(V_REGCO - 2));
RCOD7KZ =(positif(null(V_IND_TRAIT-4)+COD9ZA) * (RCOD7KZ_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RCOD7KZ_1,max(max(RCOD7KZ_P,RCOD7KZ_PA),RCOD7KZ1731))*(1-V_INDTEO)+RCOD7KZ_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0)  * (1 - null(V_REGCO - 2));

REPRESTKZ = max(0 , COD7KZ - RCOD7KZ) * (1 - null(V_REGCO - 2)) ;

RCOD7KY_1 = max(0 , min(COD7KY , IDOM11-DEC11-RREPA-RDONDJ-RDONDO-RLOCANAH-RDIFAGRI-RPRESSE-RFORET-RFIPDOM-RFIPC-RCINE-RRESTIMO-RSOCREPR
                                     -RRPRESCOMP-RHEBE-RSURV-RINNO-RSOUFIP-RRIRENOV-RLOGDOM-RCOMP-RRETU-RDONS-CRDIE
                                     -RDUFREP-RPINELTOT-RNORMTOT-RNOUV-RPENTOT-RREHAB-RCOD7KZ))  * (1 - null(V_REGCO - 2));
RCOD7KY =(positif(null(V_IND_TRAIT-4)+COD9ZA) * (RCOD7KY_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RCOD7KY_1,max(max(RCOD7KY_P,RCOD7KY_PA),RCOD7KY1731))*(1-V_INDTEO)+RCOD7KY_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0)  * (1 - null(V_REGCO - 2));

REPRESTKY = max(0 , COD7KY - RCOD7KY) * (1 - null(V_REGCO - 2)) ;


RCOD7KX_1 = max(0 , min(COD7KX , IDOM11-DEC11-RREPA-RDONDJ-RDONDO-RLOCANAH-RDIFAGRI-RPRESSE-RFORET-RFIPDOM-RFIPC-RCINE-RRESTIMO-RSOCREPR
                                     -RRPRESCOMP-RHEBE-RSURV-RINNO-RSOUFIP-RRIRENOV-RLOGDOM-RCOMP-RRETU-RDONS-CRDIE
                                     -RDUFREP-RPINELTOT-RNORMTOT-RNOUV-RPENTOT-RREHAB-RCOD7KZ-RCOD7KY))  * (1 - null(V_REGCO - 2));
RCOD7KX =(positif(null(V_IND_TRAIT-4)+COD9ZA) * (RCOD7KX_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RCOD7KX_1,max(max(RCOD7KX_P,RCOD7KX_PA),RCOD7KX1731))*(1-V_INDTEO)+RCOD7KX_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0)  * (1 - null(V_REGCO - 2));

REPRESTKX = max(0 , COD7KX - RCOD7KX) * (1 - null(V_REGCO - 2)) ;

DRESTREP = COD7KZ + COD7KY + COD7KX;
ARESTREP = DRESTREP ;
RRESTREP = RCOD7KZ + RCOD7KY + RCOD7KX; 
RRESTREP_1 = RCOD7KZ_1+RCOD7KY_1 + RCOD7KX_1; 

regle 401840:
application : iliad ;


DRESTIMO = COD7NX + COD7NY ;


DRESTIMO1 = COD7TX + COD7TY ;


RESTIMONX = min(COD7NX , LIM_RESTIMO) ;

RRESTIMONX_1 = max(min(RESTIMONX * TX30/100 , IDOM11-DEC11-RREPA-RDONDJ-RDONDO-RLOCANAH-RFIPDOM
                                                  -RDIFAGRI-RPRESSE-RFORET-RFIPC-RCINE) , 0) ;
RRESTIMONX =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RRESTIMONX_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RRESTIMONX_1,max(max(RRESTIMONX_P,RRESTIMONX_PA),RRESTIMONX1731))*(1-V_INDTEO)+RRESTIMONX_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RESTIMONY = min(COD7NY , max(0,LIM_RESTIMO - RESTIMONX)) ;

RRESTIMONY_1 = max(min(RESTIMONY * TX22/100 , IDOM11-DEC11-RREPA-RDONDJ-RDONDO-RLOCANAH-RFIPDOM
                                                  -RDIFAGRI-RPRESSE-RFORET-RFIPC-RCINE-RRESTIMONX ) , 0) ;
RRESTIMONY =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RRESTIMONY_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RRESTIMONY_1,max(max(RRESTIMONY_P,RRESTIMONY_PA),RRESTIMONY1731))*(1-V_INDTEO)+RRESTIMONY_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401844:
application : iliad ;


RESTIMOTX = min(COD7TX , max(0,LIM_RESTIMO1 - V_BTDRIMM3 * (1-present(COD7SU)) - V_BTDRIMM2 * (1-present(COD7SV)) - V_BTDRIMM1 * (1-present(COD7SW)) - COD7SU - COD7SV - COD7SW)) ;
											                                            

RESTIMOTY = min(COD7TY , max(0,(LIM_RESTIMO1 - RESTIMOTX - V_BTDRIMM3 * (1-present(COD7SU)) - V_BTDRIMM2 * (1-present(COD7SV)) - V_BTDRIMM1 * (1-present(COD7SW)) - COD7SU - COD7SV - COD7SW))) ;

regle 401845:
application : iliad ;

ARESTIMO_1 = (RESTIMONX + RESTIMONY) * (1 - V_CNR) ;
ARESTIMO = positif(null(V_IND_TRAIT-4)+COD9ZA) * (ARESTIMO_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(ARESTIMO_1,max(max(ARESTIMO_P,ARESTIMO_PA),ARESTIMO1731))*(1-V_INDTEO)+ARESTIMO_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RETRESTIMO = arr((RESTIMONX * TX30/100) + (RESTIMONY * TX22/100)) * (1 - V_CNR) ;

RRESTIMO_1 = max (min (RETRESTIMO , IDOM11-DEC11-RREPA-RDONDJ-RDONDO-RLOCANAH-RFIPDOM
                               -RDIFAGRI-RPRESSE-RFORET-RFIPC-RCINE) , 0) ;
RRESTIMO =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RRESTIMO_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RRESTIMO_1,max(max(RRESTIMO_P,RRESTIMO_PA),RRESTIMO1731))*(1-V_INDTEO)+RRESTIMO_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401847:
application : iliad ;

ARESTIMO1_1 = (RESTIMOTX + RESTIMOTY) * (1 - V_CNR) ;
ARESTIMO1 = positif(null(V_IND_TRAIT-4)+COD9ZA) * (ARESTIMO1_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
            + (max(0,min(ARESTIMO1_1,max(max(ARESTIMO1_P,ARESTIMO1_PA),ARESTIMO11731))*(1-V_INDTEO)+ARESTIMO1_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RETRESTIMO_2 = arr((RESTIMOTX * TX30/100) + (RESTIMOTY * TX22/100) ) * (1 - V_CNR) ;

RRESTIMO1_1 = max(min(RETRESTIMO_2 , IDOM11-DEC11-RREPA-RDONDJ-RDONDO-RLOCANAH-RDIFAGRI-RPRESSE-RFORET-RFIPDOM-RFIPC
                                           -RCINE-RRESTIMO-RSOCREPR-RRPRESCOMP-RHEBE-RSURV- RINNO-RSOUFIP-RRIRENOV-RLOGDOM-RCOMP- RRETU-RDONS
					   -CRDIE-RDUFREP-RPINELTOT-RNORMTOT-RNOUV-RPENTOT-RREHAB-RRESTREP),0);
RRESTIMO1 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RRESTIMO1_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RRESTIMO1_1,max(max(RRESTIMO1_P,RRESTIMO1_PA),RRESTIMO11731))*(1-V_INDTEO)+RRESTIMO1_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;


A12RRESTIMO = RRESTIMO * (1 - V_CNR) ;

REPRESTXY = max(0 , RETRESTIMO_2 - RRESTIMO1) * (1 - V_CNR) ;

regle 401850:
application : iliad ;

REVDON = max(0 , RBL1 + TOTALQUOHT - SDDD - SDC1);


BDON7UH = min(LIM15000 , COD7UH);

BASEDONB = REPDON03 + REPDON04 + REPDON05 + REPDON06 + REPDON07 + RDDOUP + COD7UH + DONAUTRE;
BASEDONP = RDDOUP + BDON7UH + DONAUTRE + EXCEDANTA + EXCEDANTD + EXCEDANTO;

BONS = null(4 - V_IND_TRAIT) * arr(min(REPDON03 + REPDON04 + REPDON05 + REPDON06 + REPDON07 + BASEDONP , REVDON * TX_BASEDUP/100))
     + null(5 - V_IND_TRAIT) * arr(min(REPDON03 + REPDON04 + REPDON05 + REPDON06 + REPDON07 + BASEDONP , 
       min(REVDON,max(max(REVDON_P,REVDON_PA),REVDON1731)) * TX_BASEDUP/100));

regle 401860:
application : iliad ;


BASEDONF = null(4 - V_IND_TRAIT) * min(REPDON03 , arr(REVDON * TX_BASEDUP/100))
           + null(5 - V_IND_TRAIT) * min(REPDON03 , arr(min(REVDON,max(max(REVDON_P,REVDON_PA),REVDON1731)) * TX_BASEDUP/100));
REPDON = null(4 - V_IND_TRAIT) * max(BASEDONF + REPDON04 + REPDON05 + REPDON06 + REPDON07 + BASEDONP - arr(REVDON * TX_BASEDUP/100) , 0) * (1 - V_CNR)
      +  null(5 - V_IND_TRAIT) * (max(BASEDONF + REPDON04 + REPDON05 + REPDON06 + REPDON07 + BASEDONP
                                - arr(min(REVDON,max(max(REVDON_P,REVDON_PA),REVDON1731)) * TX_BASEDUP/100) , 0) * (1-positif(PREM8_11)) 
				+ (BASEDONF + REPDON04 + REPDON05 + REPDON06 + REPDON07 + BASEDONP) * positif(PREM8_11) * (1 - V_CNR));

REPDONR4 = (null(4 - V_IND_TRAIT) * (positif_ou_nul(BASEDONF - arr(REVDON * (TX_BASEDUP)/100)) * REPDON04
                  + (1 - positif_ou_nul(BASEDONF - arr(REVDON * (TX_BASEDUP)/100)))
                * max(REPDON04 + (BASEDONF - arr(REVDON * (TX_BASEDUP)/100)),0))
           + null(5 - V_IND_TRAIT) * (positif_ou_nul(BASEDONF - arr(min(REVDON,max(max(REVDON_P,REVDON_PA),REVDON1731)) * (TX_BASEDUP)/100)) * REPDON04
               + (1 - positif_ou_nul(BASEDONF - arr(min(REVDON,max(max(REVDON_P,REVDON_PA),REVDON1731)) * (TX_BASEDUP)/100)))
                     * max(REPDON04 + (BASEDONF - arr(min(REVDON,max(max(REVDON_P,REVDON_PA),REVDON1731)) * (TX_BASEDUP)/100)),0))
                )
           * (1 - V_CNR);

REPDONR3 = (null(4 - V_IND_TRAIT) * (positif_ou_nul(BASEDONF + REPDON04 - arr(REVDON * (TX_BASEDUP)/100)) * REPDON05
               + (1 - positif_ou_nul(BASEDONF + REPDON04 - arr(REVDON * (TX_BASEDUP)/100)))
                     * max(REPDON05 + (BASEDONF + REPDON04 - arr(REVDON * (TX_BASEDUP)/100)),0))
                + null(5 - V_IND_TRAIT) * (positif_ou_nul(BASEDONF + REPDON04 - arr(min(REVDON,max(max(REVDON_P,REVDON_PA),REVDON1731)) * (TX_BASEDUP)/100)) * REPDON05
            + (1 - positif_ou_nul(BASEDONF + REPDON04 - arr(min(REVDON,max(max(REVDON_P,REVDON_PA),REVDON1731)) * (TX_BASEDUP)/100)))
                  * max(REPDON05 + (BASEDONF + REPDON04 - arr(min(REVDON,max(max(REVDON_P,REVDON_PA),REVDON1731)) * (TX_BASEDUP)/100)),0))
             )
               * (1 - V_CNR);

REPDONR2 = (null(4 - V_IND_TRAIT) * (positif_ou_nul(BASEDONF + REPDON04 + REPDON05 - arr(REVDON * (TX_BASEDUP)/100)) * REPDON06
            + (1 - positif_ou_nul(BASEDONF + REPDON04 + REPDON05 - arr(REVDON * (TX_BASEDUP)/100)))
                  * max(REPDON06 + (BASEDONF + REPDON04 + REPDON05 - arr(REVDON * (TX_BASEDUP)/100)),0))
            +  null(5 - V_IND_TRAIT) * (positif_ou_nul(BASEDONF + REPDON04 + REPDON05 
	                                   - arr(min(REVDON,max(max(REVDON_P,REVDON_PA),REVDON1731)) * (TX_BASEDUP)/100)) * REPDON06
                 + (1 - positif_ou_nul(BASEDONF + REPDON04 + REPDON05 - arr(min(REVDON,max(max(REVDON_P,REVDON_PA),REVDON1731)) * (TX_BASEDUP)/100)))
             * max(REPDON06 + (BASEDONF + REPDON04 + REPDON05 - arr(min(REVDON,max(max(REVDON_P,REVDON_PA),REVDON1731)) * (TX_BASEDUP)/100)),0))
                  )
             * (1 - V_CNR);
REPDONR1 = (null(4 - V_IND_TRAIT) * (positif_ou_nul(BASEDONF + REPDON04 + REPDON05 + REPDON06 - arr(REVDON * (TX_BASEDUP)/100)) * REPDON07
            + (1 - positif_ou_nul(BASEDONF + REPDON04 + REPDON05 + REPDON06 - arr(REVDON * (TX_BASEDUP)/100)))
                  * max(REPDON07 + (BASEDONF + REPDON04 + REPDON05 + REPDON06 - arr(REVDON * (TX_BASEDUP)/100)),0))
             +  null(5 - V_IND_TRAIT) * (positif_ou_nul(BASEDONF + REPDON04 + REPDON05 + REPDON06 
	                                      - arr(min(REVDON,max(max(REVDON_P,REVDON_PA),REVDON1731)) * (TX_BASEDUP)/100)) * REPDON07
                 + (1 - positif_ou_nul(BASEDONF + REPDON04 + REPDON05 + REPDON06 - arr(min(REVDON,max(max(REVDON_P,REVDON_PA),REVDON1731)) * (TX_BASEDUP)/100)))
               * max(REPDON07 + (BASEDONF + REPDON04 + REPDON05 + REPDON06 - arr(min(REVDON,max(max(REVDON_P,REVDON_PA),REVDON1731)) * (TX_BASEDUP)/100)),0))
                  )
             * (1 - V_CNR);

REPDONR = max(REPDON - REPDONR1 - REPDONR2 - REPDONR3 - REPDONR4 , 0) * (1 - V_CNR);
regle 401870:
application : iliad ;


RONS = arr(BONS * TX_REDDON /100) * (1 - V_CNR);

DDONS = REPDON03 + REPDON04 + REPDON05 + REPDON06 + REPDON07 + RDDOUP + COD7UH + DONAUTRE;

ADONS_1 = BONS * (1 - V_CNR) ;
ADONS = positif(null(V_IND_TRAIT-4)+COD9ZA) * (ADONS_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
        + (max(0,min(ADONS_1,max(max(ADONS_P,ADONS_PA),ADONS1731))*(1-V_INDTEO)+ADONS_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401880:
application : iliad ;

RDONS_1 = max(min(RONS , RRI1-RLOGDOM-RCOMP-RRETU) , 0);
RDONS = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RDONS_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
     + (max(0,min(RDONS_1,max(max(RDONS_P,RDONS_PA),RDONS1731))*(1-V_INDTEO)+RDONS_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401885:
application : iliad ;

CRCFA = arr(IPQ1 * REGCIAUTO / (RB01 + TONEQUO  )) * (1 - positif(RE168 + TAX1649)) ;

regle 401887:
application : iliad ;

CRDIE = max( min( CRCFA , RRI1-RLOGDOM-RCOMP-RRETU-RDONS) , 0 ) ;

regle 401890:
application : iliad ;


SEUILRED1 = arr((arr(RI1)+REVQUO) / NBPT) ;

regle 401900:
application : iliad ;


RETUD = arr((RDENS * MTRC) + (RDENL * MTRL) + (RDENU * MTRS) + (RDENSQAR * MTRC /2) + (RDENLQAR * MTRL /2) + (RDENUQAR * MTRS /2)) 
        * (1 - V_CNR) ;

DNBE = RDENS + RDENL + RDENU + RDENSQAR + RDENLQAR + RDENUQAR ;

RNBE = DNBE ;

regle 401910:
application : iliad ;

RRETU_1 = max(min(RETUD , RRI1-RLOGDOM-RCOMP) , 0) ;
RRETU =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RRETU_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RRETU_1,max(max(RRETU_P,RRETU_PA),RRETU1731))*(1-V_INDTEO)+RRETU_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401920:
application : iliad ;


BFCPIGQ = min(FCPI , max(0 , PLAF_FCPI * (1 + BOOL_0AM) ) * (1 - V_CNR)) ;

DFCPI = FCPI ;
BFCPI =  BFCPIGQ  * (1 - V_CNR) ;

RFCPI = arr(BFCPIGQ * TX_FCPI/100) * (1 - V_CNR) ; 

RINNO_1 = max(0 , min(RFCPI , IDOM11-DEC11-RREPA-RDONDJ-RDONDO-RLOCANAH-RFIPDOM-RDIFAGRI-RPRESSE-RFORET
                                  -RFIPC-RCINE-RRESTIMO-RSOCREPR-RRPRESCOMP-RHEBE-RSURV)) ;
RINNO =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RINNO_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RINNO_1,max(max(RINNO_P,RINNO_PA),RINNO1731))*(1-V_INDTEO)+RINNO_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 401930:
application : iliad ;


BPRESCOMP =(RDPRESREPORT 
	   + (1-positif(RDPRESREPORT+0)) * 
	   arr(
	         ((1 - present(SUBSTITRENTE)) * 
                  arr (
                 null(PRESCOMP2000 - PRESCOMPJUGE)
                   * min(PLAFPRESCOMP,PRESCOMP2000)
	         + positif(PRESCOMPJUGE - PRESCOMP2000)
                   * (positif_ou_nul(PLAFPRESCOMP -PRESCOMPJUGE))
                   * PRESCOMP2000
	         + positif(PRESCOMPJUGE - PRESCOMP2000)
                    * (1 - positif_ou_nul(PLAFPRESCOMP -PRESCOMPJUGE))
                    * PLAFPRESCOMP * PRESCOMP2000/PRESCOMPJUGE
                       )
	       +
             present(SUBSTITRENTE) *
                  arr (
                   null(PRESCOMP2000 - SUBSTITRENTE)
		   * 
		   (positif_ou_nul(PLAFPRESCOMP - PRESCOMPJUGE)*SUBSTITRENTE
		   + 
		   positif(PRESCOMPJUGE-PLAFPRESCOMP)*arr(PLAFPRESCOMP*SUBSTITRENTE/PRESCOMPJUGE))
                 + 
		   positif(SUBSTITRENTE - PRESCOMP2000)
		   * (positif_ou_nul(PLAFPRESCOMP - PRESCOMPJUGE)*PRESCOMP2000
		   + 
		   positif(PRESCOMPJUGE-PLAFPRESCOMP)*arr(PLAFPRESCOMP*(SUBSTITRENTE/PRESCOMPJUGE)*(PRESCOMP2000/SUBSTITRENTE)))
                       )
	           )
                )
              )
               *(1 - V_CNR);


RPRESCOMP = arr (BPRESCOMP * TX_PRESCOMP / 100) * (1 -V_CNR);
BPRESCOMP01 = max(0,(1 - present(SUBSTITRENTE)) * 
                   (  positif_ou_nul(PLAFPRESCOMP -PRESCOMPJUGE)
                       * (PRESCOMPJUGE - BPRESCOMP)
                     + positif(PRESCOMPJUGE - PLAFPRESCOMP)
                       * (PLAFPRESCOMP - BPRESCOMP)
                   )
	       +
             present(SUBSTITRENTE) *
                   (  positif_ou_nul(PLAFPRESCOMP -PRESCOMPJUGE)
                       * (SUBSTITRENTE - PRESCOMP2000)
                     + positif(PRESCOMPJUGE - PLAFPRESCOMP)
		     *arr(PLAFPRESCOMP*(SUBSTITRENTE/PRESCOMPJUGE)*((SUBSTITRENTE-PRESCOMP2000)/SUBSTITRENTE))
                   )
		* (1 - V_CNR)
		);
DPRESCOMP = PRESCOMP2000 + RDPRESREPORT ;

APRESCOMP = (positif(null(V_IND_TRAIT-4) + COD9ZA) * BPRESCOMP * (1-positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
             + (max(0 , min(BPRESCOMP,max(max(BPRESCOMP_P,BPRESCOMP_PA),BPRESCOMP1731))*(1-V_INDTEO)+BPRESCOMP*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0) * (1 - V_CNR) ;

RRPRESCOMP_1 = max( min( RPRESCOMP , IDOM11-DEC11-RREPA-RDONDJ-RDONDO-RLOCANAH-RFIPDOM-RDIFAGRI-RPRESSE-RFORET
                                                 -RFIPC-RCINE-RRESTIMO-RSOCREPR) , 0) ;
RRPRESCOMP =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RRPRESCOMP_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RRPRESCOMP_1,max(max(RRPRESCOMP_P,RRPRESCOMP_PA),RRPRESCOMP1731))*(1-V_INDTEO)+RRPRESCOMP_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RPRESCOMPREP = max( min( RPRESCOMP , IDOM11-DEC11-RREPA-RDONDJ-RDONDO-RLOCANAH-RFIPDOM-RDIFAGRI-RPRESSE-RFORET
				      -RFIPC-RCINE-RRESTIMO-RSOCREPR) , 0) * positif(RDPRESREPORT) ;

RPRESCOMPAN = RRPRESCOMP * (1-positif(RDPRESREPORT)) ;

regle 401980:
application : iliad ;


BDIFAGRI = min(INTDIFAGRI , LIM_DIFAGRI * (1 + BOOL_0AM)) * (1 - V_CNR) ;

DDIFAGRI = INTDIFAGRI ;

ADIFAGRI = positif(null(V_IND_TRAIT-4)+COD9ZA) * (BDIFAGRI) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(BDIFAGRI,max(max(BDIFAGRI_P,BDIFAGRI_PA),BDIFAGRI1731))*(1-V_INDTEO)+BDIFAGRI*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RAGRI = arr(BDIFAGRI * TX_DIFAGRI / 100) ;

RDIFAGRI_1 = max(min(RAGRI , IDOM11-DEC11-RREPA-RDONDJ-RDONDO-RLOCANAH) , 0) ;
RDIFAGRI = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RDIFAGRI_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(RDIFAGRI_1 , max(max(RDIFAGRI_P,RDIFAGRI_PA),RDIFAGRI1731))*(1-V_INDTEO)+RDIFAGRI_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

regle 401990:
application : iliad ;


ITRED = min( RED , IDOM11-DEC11) ;

regle 402000:
application : iliad ;


NNRI2 = max(0 , RRI1 - (DLOGDOM + ACOMP + RETUD + RONS + CRCFA + ADUFREP + APIREP + APROPIREP 
                        + APROPIREP1 + APROPIREP2 + ANORMREP + RPINABCD + RPINRRS + RPIPRO + RNORABCD
			+ RSN + COD7CY + COD7DY + COD7EY + COD7FY + COD7GY + COD7EK + arr(APMEJEIDZ * TX50/100 + APMEJEICR * TX30/100)
			+ DCELSOM1 + DCELSOM2 + ACELSOM4 + DCELSOM5 + ACELSOM6 + ACELSOM8 + ACELSOM9
			+ PCEL1A + PCEL1B + PCEL1C + PCEL1D + PCEL1E + PCEL2A + PCEL2B + PCEL2C + PCEL2D + PCEL2E
			+ RETCODOU + RETCODOY + RETCODPZ + RETCODMZ + RETCODMW + RETCODMN + COD7KX + COD7KY + COD7KZ 
			+ COD8PZ + AILMNP1 + AILMNP3 + RRREHAP + arr(RESTIMOTX*TX30/100) + arr(RESTIMOTY*TX22/100))) ; 

regle 402010:
application : iliad ;




DLOGDOM = INVLOG2008 + INVLGDEB2009 + INVLGDEB + INVLGAUTRE + INVLGDEB2010 + INVLOG2009 + INVOMLOGOA + INVOMLOGOB 
          + INVOMLOGOC + INVOMLOGOH + INVOMLOGOI + INVOMLOGOJ + INVOMLOGOK + INVOMLOGOL + INVOMLOGOM + INVOMLOGON 
          + INVOMLOGOO + INVOMLOGOP + INVOMLOGOQ + INVOMLOGOR + INVOMLOGOS + INVOMLOGOT + INVOMLOGOU + INVOMLOGOV 
          + INVOMLOGOW 
          + CODHOD + CODHOE + CODHOF + CODHOG + CODHOX + CODHOY + CODHOZ + CODHUA + CODHUB + CODHUC + CODHUD + CODHUE 
          + CODHUF + CODHUG + CODHUH + CODHUI + CODHUJ + CODHUK + CODHUL + CODHUM + CODHUN + CODHUO + CODHUP + CODHUQ
	  + CODHUR + CODHUS + CODHUT + CODHUU + CODHVA + CODHVB + CODHVC + CODHVD + CODHVE + CODHVF + CODHVG + CODHVJ 
	  + CODHVK + CODHVL + CODHVM + CODHVN ;


DDOMSOC1 = CODHYC + CODHYD + CODHYE + CODHYF + CODHYG + CODHYH ;

DLOGSOC = CODHYI ;


DCOLENT = CODHFN + CODHFO + CODHFP + CODHFR + CODHFS + CODHFT + CODHFU + CODHFW + CODHGS + CODHGT + CODHGU + CODHGW 
          + CODHHS + CODHHT + CODHHU + CODHHW + CODHIS + CODHIT + CODHIU + CODHIW + CODHJS + CODHJT + CODHJU + CODHJW ;

DLOCENT = CODHKS + CODHKT + CODHKU + CODHKW ;

regle 402020:
application : iliad ;



TOTALPLAF1 = INVRETYD + INVRETYC + INVRETYE + INVRETYF + INVRETYG + INVRETYH + INVRETYI + INVRETQL + INVRETQM 
	     + INVRETQD + INVRETOB + INVRETOC + INVRETOM + INVRETON + INVRETOD + INVRETUA + INVRETUH + INVRETUO + INVRETVA
	     + INVRETYDR + INVRETYCR + INVRETYER + INVRETYFR + INVRETYGR + INVRETYHR + INVRETYIR
	     ;

TOTALPLAF2 = INVRETOI + INVRETOJ + INVRETOK + INVRETOP + INVRETOQ + INVRETOR + INVRETOE + INVRETOF + INVRETUB + INVRETUC 
             + INVRETUI + INVRETUJ + INVRETUP + INVRETUQ + INVRETVB + INVRETVC ;

TOTALPLAF3 = INVRETFT + INVRETFO + INVRETFS + INVRETFN + INVRETFP + INVRETFU + INVRETFR 
	     + INVRETFW + INVRETGT + INVRETGS + INVRETGU + INVRETGW + INVRETHT + INVRETHS + INVRETHU + INVRETHW + INVRETIT + INVRETIS + INVRETIU + INVRETIW
	     + INVRETJT + INVRETJS + INVRETJU + INVRETJW + INVRETKT + INVRETKS + INVRETKU + INVRETKW
	     + INVRETOT + INVRETOU + INVRETOV + INVRETOW + INVRETOG + INVRETOX + INVRETOY 
	     + INVRETOZ + INVRETUD + INVRETUE + INVRETUF + INVRETUG + INVRETUK + INVRETUL + INVRETUM + INVRETUN + INVRETUR + INVRETUS 
	     + INVRETUT + INVRETUU + INVRETVD + INVRETVE + INVRETVF + INVRETVG + INVRETVJ + INVRETVK + INVRETVL + INVRETVM + INVRETVN
	     + INVRETFTR + INVRETFOR + INVRETFSR + INVRETFNR 
	     + INVRETGTR + INVRETGSR + INVRETHTR + INVRETHSR + INVRETITR + INVRETISR + INVRETJTR + INVRETJSR + INVRETKTR + INVRETKSR ;

RNIDOM1 = arr((RNG + TTPVQ) * TX15/100) * (1 - V_CNR) ;

RNIDOM2 = arr((RNG + TTPVQ) * TX13/100) * (1 - V_CNR) ;

RNIDOM3 = arr((RNG + TTPVQ) * TX11/100) * (1 - V_CNR) ;

INDPLAF1 = positif(RNIDOM1 - TOTALPLAF1) * (1 - V_CNR) ;

regle 402022:
application : iliad ;


VARTMP1 = 0 ;

INVRETYDA = min(arr(NINVRETYD * TX30 / 100) , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETYDA ;

INVRETYCA = min(arr(NINVRETYC * TX35 / 100) , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETYCA ;

INVRETYEA = min(arr(NINVRETYE * TX30 / 100) , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETYEA ;

INVRETYFA = min(arr(NINVRETYF * TX30 / 100) , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETYFA ;

INVRETYGA = min(arr(NINVRETYG * TX30 / 100) , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETYGA ;

INVRETYHA = min(arr(NINVRETYH * TX30 / 100) , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETYHA ;

INVRETYIA = min(arr(NINVRETYI * TX30 / 100) , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETYIA ;

INVRETQLA = min(NINVRETQL , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETQLA ;

INVRETQMA = min(NINVRETQM , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETQMA ;

INVRETQDA = min(NINVRETQD , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETQDA ;

INVRETOBA = min(NINVRETOB , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOBA ;

INVRETOCA = min(NINVRETOC , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOCA ;

INVRETOMA = min(NINVRETOM , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOMA ;

INVRETONA = min(NINVRETON , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETONA ;

INVRETODA = min(NINVRETOD , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETODA ;

INVRETUAA = min(NINVRETUA , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUAA ;

INVRETUHA = min(NINVRETUH , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUHA ;

INVRETUOA = min(NINVRETUO , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUOA ;

INVRETVAA = min(NINVRETVA , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETVAA ;

INVRETYDRA = min(NINVRETYDR , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETYDRA ;

INVRETYCRA = min(NINVRETYCR , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETYCRA ;

INVRETYERA = min(NINVRETYER , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETYERA ;

INVRETYFRA = min(NINVRETYFR , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETYFRA ;

INVRETYGRA = min(NINVRETYGR , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETYGRA ;

INVRETYHRA = min(NINVRETYHR , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETYHRA ;

INVRETYIRA = min(NINVRETYIR , max(0 , RNIDOM1 - VARTMP1)) ;
VARTMP1 = 0 ;

TOTALPLAFA = INVRETYDA + INVRETYCA + INVRETYEA + INVRETYFA + INVRETYGA + INVRETYHA + INVRETYIA
	     + INVRETQLA + INVRETQMA + INVRETQDA + INVRETOBA + INVRETOCA + INVRETOMA + INVRETONA + INVRETODA + INVRETUAA + INVRETUHA + INVRETUOA + INVRETVAA 
	     + INVRETYDRA + INVRETYCRA + INVRETYERA + INVRETYFRA + INVRETYGRA + INVRETYHRA + INVRETYIRA ; 

INDPLAF2 = positif(RNIDOM2 - TOTALPLAF2 - TOTALPLAFA) ;

regle 402024:
application : iliad ;


VARTMP1 = 0 ;
MAXDOM2 = max(0,RNIDOM2 - TOTALPLAFA) ;

INVRETOIA = min(NINVRETOI , max(0 , MAXDOM2 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOIA ;

INVRETOJA = min(NINVRETOJ , max(0 , MAXDOM2 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOJA ;

INVRETOKA = min(NINVRETOK , max(0 , MAXDOM2 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOKA ;

INVRETOPA = min(NINVRETOP , max(0 , MAXDOM2 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOPA ;

INVRETOQA = min(NINVRETOQ , max(0 , MAXDOM2 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOQA ;

INVRETORA = min(NINVRETOR , max(0 , MAXDOM2 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETORA ;

INVRETOEA = min(NINVRETOE , max(0 , MAXDOM2 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOEA ;

INVRETOFA = min(NINVRETOF , max(0 , MAXDOM2 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOFA ;

INVRETUBA = min(NINVRETUB , max(0 , MAXDOM2 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUBA ;

INVRETUCA = min(NINVRETUC , max(0 , MAXDOM2 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUCA ;

INVRETUIA = min(NINVRETUI , max(0 , MAXDOM2 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUIA ;

INVRETUJA = min(NINVRETUJ , max(0 , MAXDOM2 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUJA ;

INVRETUPA = min(NINVRETUP , max(0 , MAXDOM2 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUPA ;

INVRETUQA = min(NINVRETUQ , max(0 , MAXDOM2 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUQA ;

INVRETVBA = min(NINVRETVB , max(0 , MAXDOM2 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETVBA ;

INVRETVCA = min(NINVRETVC , max(0 , MAXDOM2 - VARTMP1)) ;
VARTMP1 = 0 ;

TOTALPLAFB = INVRETOIA + INVRETOJA 
             + INVRETOKA + INVRETOPA + INVRETOQA + INVRETORA + INVRETOEA + INVRETOFA + INVRETUBA + INVRETUCA + INVRETUIA + INVRETUJA 
	     + INVRETUPA + INVRETUQA + INVRETVBA + INVRETVCA ;
 
INDPLAF3 = positif(RNIDOM3 - TOTALPLAF3 - TOTALPLAFA - TOTALPLAFB) ;

regle 402026:
application : iliad ;


VARTMP1 = 0 ;
MAXDOM3 = max(0,RNIDOM3 -TOTALPLAFA-TOTALPLAFB) ;

INVRETFTA = min(arr(NINVRETFT*TX34/100) , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETFTA ;

INVRETFOA = min(arr(NINVRETFO*TX375/100) , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETFOA ;

INVRETFSA = min(arr(NINVRETFS*TX44/100) , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETFSA ;

INVRETFNA = min(arr(NINVRETFN*TX4737/100) , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETFNA ;

INVRETGTA = min(arr(NINVRETGT*TX34/100) , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETGTA ;

INVRETGSA = min(arr(NINVRETGS*TX44/100) , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETGSA ;

INVRETHTA = min(arr(NINVRETHT*TX34/100) , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETHTA ;

INVRETHSA = min(arr(NINVRETHS*TX44/100) , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETHSA ;

INVRETITA = min(arr(NINVRETIT*TX34/100) , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETITA ;

INVRETISA = min(arr(NINVRETIS*TX44/100) , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETISA ;

INVRETJTA = min(arr(NINVRETJT*TX34/100) , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETJTA ;

INVRETJSA = min(arr(NINVRETJS*TX44/100) , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETJSA ;

INVRETKTA = min(arr(NINVRETKT*TX34/100) , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETKTA ;

INVRETKSA = min(arr(NINVRETKS*TX44/100) , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETKSA ;

INVRETFPA = min(NINVRETFP , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETFPA ;

INVRETFUA = min(NINVRETFU , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETFUA ;

INVRETFRA = min(NINVRETFR , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETFRA ;

INVRETFWA = min(NINVRETFW , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETFWA ;

INVRETGUA = min(NINVRETGU , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETGUA ;

INVRETGWA = min(NINVRETGW , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETGWA ;

INVRETHUA = min(NINVRETHU , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETHUA ;

INVRETHWA = min(NINVRETHW , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETHWA ;

INVRETIUA = min(NINVRETIU , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETIUA ;

INVRETIWA = min(NINVRETIW , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETIWA ;

INVRETJUA = min(NINVRETJU , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETJUA ;

INVRETJWA = min(NINVRETJW , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETJWA ;

INVRETKUA = min(NINVRETKU , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETKUA ;

INVRETKWA = min(NINVRETKW , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETKWA ;

INVRETOTA = min(NINVRETOT , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOTA ;

INVRETOUA = min(NINVRETOU , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOUA ;

INVRETOVA = min(NINVRETOV , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOVA ;

INVRETOWA = min(NINVRETOW , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOWA ;

INVRETOGA = min(NINVRETOG , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOGA ;

INVRETOXA = min(NINVRETOX , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOXA ;

INVRETOYA = min(NINVRETOY , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOYA ;

INVRETOZA = min(NINVRETOZ , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETOZA ;

INVRETUDA = min(NINVRETUD , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUDA ;

INVRETUEA = min(NINVRETUE , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUEA ;

INVRETUFA = min(NINVRETUF , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUFA ;

INVRETUGA = min(NINVRETUG , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUGA ;

INVRETUKA = min(NINVRETUK , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUKA ;

INVRETULA = min(NINVRETUL , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETULA ;

INVRETUMA = min(NINVRETUM , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUMA ;

INVRETUNA = min(NINVRETUN , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUNA ;

INVRETURA = min(NINVRETUR , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETURA ;

INVRETUSA = min(NINVRETUS , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUSA ;

INVRETUTA = min(NINVRETUT , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUTA ;

INVRETUUA = min(NINVRETUU , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETUUA ;

INVRETVDA = min(NINVRETVD , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETVDA ;

INVRETVEA = min(NINVRETVE , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETVEA ;

INVRETVFA = min(NINVRETVF , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETVFA ;

INVRETVGA = min(NINVRETVG , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETVGA ;

INVRETVJA = min(NINVRETVJ , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETVJA ;

INVRETVKA = min(NINVRETVK , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETVKA ;

INVRETVLA = min(NINVRETVL , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETVLA ;

INVRETVMA = min(NINVRETVM , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETVMA ;

INVRETVNA = min(NINVRETVN , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETVNA ;

INVRETFTRA = min(NINVRETFTR , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETFTRA ;

INVRETFORA = min(NINVRETFOR , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETFORA ;

INVRETFSRA = min(NINVRETFSR , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETFSRA ;

INVRETFNRA = min(NINVRETFNR , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETFNRA ;

INVRETGTRA = min(NINVRETGTR , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETGTRA ;

INVRETGSRA = min(NINVRETGSR , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETGSRA ;

INVRETHTRA = min(NINVRETHTR , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETHTRA ;

INVRETHSRA = min(NINVRETHSR , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETHSRA ;

INVRETITRA = min(NINVRETITR , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETITRA ;

INVRETISRA = min(NINVRETISR , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETISRA ;

INVRETJTRA = min(NINVRETJTR , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETJTRA ;

INVRETJSRA = min(NINVRETJSR , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETJSRA ;

INVRETKTRA = min(NINVRETKTR , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = VARTMP1 + INVRETKTRA ;

INVRETKSRA = min(NINVRETKSR , max(0 , MAXDOM3 - VARTMP1)) ;
VARTMP1 = 0 ;

TOTALPLAFC = INVRETFTA + INVRETFOA + INVRETFSA + INVRETFNA
	     + INVRETGTA + INVRETGSA + INVRETHTA + INVRETHSA + INVRETITA + INVRETISA + INVRETJTA + INVRETJSA + INVRETKTA + INVRETKSA
	     + INVRETFPA + INVRETFUA + INVRETFRA + INVRETFWA + INVRETGUA + INVRETGWA + INVRETHUA + INVRETHWA + INVRETIUA + INVRETIWA + INVRETJUA + INVRETJWA + INVRETKUA + INVRETKWA
	     + INVRETOTA + INVRETOUA + INVRETOVA + INVRETOWA 
	     + INVRETOGA + INVRETOXA + INVRETOYA + INVRETOZA + INVRETUDA + INVRETUEA + INVRETUFA + INVRETUGA + INVRETUKA + INVRETULA + INVRETUMA + INVRETUNA + INVRETURA 
	     + INVRETUSA + INVRETUTA + INVRETUUA + INVRETVDA + INVRETVEA + INVRETVFA + INVRETVGA + INVRETVJA + INVRETVKA + INVRETVLA + INVRETVMA + INVRETVNA
	     + INVRETFTRA + INVRETFORA + INVRETFSRA + INVRETFNRA + INVRETGTRA + INVRETGSRA + INVRETHTRA + INVRETHSRA 
	     + INVRETITRA + INVRETISRA + INVRETJTRA + INVRETJSRA + INVRETKTRA + INVRETKSRA ;

INDPLAF = positif(TOTALPLAFA + TOTALPLAFB + TOTALPLAFC - TOTALPLAF1 - TOTALPLAF2 - TOTALPLAF3) * positif(INDPLAF1 + INDPLAF2 + INDPLAF3) * positif(OPTPLAF15) ;


ALOGDOM_1 = (INVLOG2008 + INVLGDEB2009 + INVLGDEB + INVOMLOGOA + INVOMLOGOH + INVOMLOGOL + INVOMLOGOO + INVOMLOGOS
                      + (INVRETQL + INVRETQM + INVRETQD + INVRETOB + INVRETOC + INVRETOM + INVRETON + INVRETOI + INVRETOJ + INVRETOK + INVRETOP 
			 + INVRETOQ + INVRETOR + INVRETOT + INVRETOU + INVRETOV + INVRETOW + INVRETOD + INVRETOE + INVRETOF + INVRETOG
                         + INVRETOX + INVRETOY + INVRETOZ + INVRETUA + INVRETUB + INVRETUC + INVRETUD + INVRETUE + INVRETUF + INVRETUG
                         + INVRETUH + INVRETUI + INVRETUJ + INVRETUK + INVRETUL + INVRETUM + INVRETUN + INVRETUO + INVRETUP + INVRETUQ 
			 + INVRETUR + INVRETUS + INVRETUT + INVRETUU + INVRETVA + INVRETVB + INVRETVC + INVRETVD + INVRETVE + INVRETVF
			 + INVRETVG + INVRETVJ + INVRETVK + INVRETVL + INVRETVM + INVRETVN) * (1 - INDPLAF)
		      + (INVRETQLA + INVRETQMA + INVRETQDA + INVRETOBA + INVRETOCA + INVRETOMA + INVRETONA + INVRETOIA + INVRETOJA + INVRETOKA 
			 + INVRETOPA + INVRETOQA + INVRETORA + INVRETOTA + INVRETOUA + INVRETOVA + INVRETOWA + INVRETODA + INVRETOEA + INVRETOFA 
			 + INVRETOGA + INVRETOXA + INVRETOYA + INVRETOZA + INVRETUAA + INVRETUBA + INVRETUCA + INVRETUDA + INVRETUEA + INVRETUFA 
			 + INVRETUGA + INVRETUHA + INVRETUIA + INVRETUJA + INVRETUKA + INVRETULA + INVRETUMA + INVRETUNA + INVRETUOA + INVRETUPA 
			 + INVRETUQA + INVRETURA + INVRETUSA + INVRETUTA + INVRETUUA + INVRETVAA + INVRETVBA + INVRETVCA + INVRETVDA + INVRETVEA 
			 + INVRETVFA + INVRETVGA + INVRETVJA + INVRETVKA + INVRETVLA + INVRETVMA + INVRETVNA) * INDPLAF)
	     * (1 - V_CNR) ;
ALOGDOM = positif(null(V_IND_TRAIT-4)+COD9ZA) * (ALOGDOM_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(ALOGDOM_1,max(max(ALOGDOM_P,ALOGDOM_PA),ALOGDOM1731))*(1-V_INDTEO)+ALOGDOM_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

ALOGSOC_1 = ((INVRETYI + INVRETYIR) * (1 - INDPLAF) + (INVRETYIA + INVRETYIRA) * INDPLAF) * (1 - V_CNR) ;
ALOGSOC = positif(null(V_IND_TRAIT - 4) + COD9ZA) * ALOGSOC_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(ALOGSOC_1 , max(max(ALOGSOC_P,ALOGSOC_PA),ALOGSOC1731))*(1-V_INDTEO)+ALOGSOC_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

ADOMSOC1_1 = ((INVRETYC + INVRETYD + INVRETYE + INVRETYF + INVRETYG + INVRETYH
	       + INVRETYCR + INVRETYDR + INVRETYER + INVRETYFR + INVRETYGR + INVRETYHR) * (1 - INDPLAF) 
	     + (INVRETYCA + INVRETYDA + INVRETYEA + INVRETYFA + INVRETYGA + INVRETYHA
		+ INVRETYCRA + INVRETYDRA + INVRETYERA + INVRETYFRA + INVRETYGRA + INVRETYHRA) * INDPLAF) 
              * (1 - V_CNR) ;
ADOMSOC1 = positif(null(V_IND_TRAIT-4)+COD9ZA) * (ADOMSOC1_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(ADOMSOC1_1,max(max(ADOMSOC1_P,ADOMSOC1_PA),ADOMSOC11731))*(1-V_INDTEO)+ADOMSOC1_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

ALOCENT_1 = ((INVRETKT + INVRETKS + INVRETKU + INVRETKW
              + INVRETKTR + INVRETKSR) * (1 - INDPLAF)
            + (INVRETKTA + INVRETKSA + INVRETKUA + INVRETKWA
               + INVRETKTRA + INVRETKSRA) * INDPLAF)
            * (1 - V_CNR) ;
ALOCENT = positif(null(V_IND_TRAIT-4)+COD9ZA) * (ALOCENT_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(ALOCENT_1,max(max(ALOCENT_P,ALOCENT_PA),ALOCENT1731))*(1-V_INDTEO)+ALOCENT_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

ACOLENT_1 = ((INVRETFT + INVRETFO + INVRETFS + INVRETFN + INVRETFP + INVRETFU + INVRETFR + INVRETFW + INVRETGT + INVRETGS + INVRETGU + INVRETGW 
              + INVRETHT + INVRETHS + INVRETHU + INVRETHW + INVRETIT + INVRETIS + INVRETIU + INVRETIW + INVRETJT + INVRETJS + INVRETJU + INVRETJW
	      + INVRETFTR + INVRETFOR + INVRETFSR + INVRETFNR + INVRETGTR + INVRETGSR + INVRETHTR + INVRETHSR + INVRETITR + INVRETISR + INVRETJTR + INVRETJSR) * (1 - INDPLAF) 
	   + (INVRETFTA + INVRETFOA + INVRETFSA + INVRETFNA + INVRETFPA + INVRETFUA + INVRETFRA + INVRETFWA + INVRETGTA + INVRETGSA + INVRETGUA + INVRETGWA 
	      + INVRETHTA + INVRETHSA + INVRETHUA + INVRETHWA + INVRETITA + INVRETISA + INVRETIUA + INVRETIWA + INVRETJTA + INVRETJSA + INVRETJUA + INVRETJWA
	      + INVRETFTRA + INVRETFORA + INVRETFSRA + INVRETFNRA + INVRETGTRA + INVRETGSRA + INVRETHTRA + INVRETHSRA + INVRETITRA + INVRETISRA + INVRETJTRA + INVRETJSRA) * INDPLAF) 
	     * (1 - V_CNR) ;

ACOLENT = positif(null(V_IND_TRAIT-4)+COD9ZA) * (ACOLENT_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(ACOLENT_1,max(max(ACOLENT_P,ACOLENT_PA),ACOLENT1731))*(1-V_INDTEO)+ACOLENT_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

regle 402030:
application : iliad ;


VARTMP1 = 0 ;

NINVRETQB = max(min(INVLOG2008 , RRI1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETQB ;

NINVRETQC = max(min(INVLGDEB2009 , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETQC ;

NINVRETQT = max(min(INVLGDEB , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETQT ;

NINVRETOA = max(min(INVOMLOGOA , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOA ;

NINVRETOH = max(min(INVOMLOGOH , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOH ;

NINVRETOL = max(min(INVOMLOGOL , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOL ;

NINVRETOO = max(min(INVOMLOGOO , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOO ;

NINVRETOS = max(min(INVOMLOGOS , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOS ;

NINVRETQL = max(min(INVLGAUTRE , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETQL ;

NINVRETQM = max(min(INVLGDEB2010 , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETQM ;

NINVRETQD = max(min(INVLOG2009 , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETQD ;

NINVRETOB = max(min(INVOMLOGOB , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOB ;

NINVRETOC = max(min(INVOMLOGOC , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOC ;

NINVRETOI = max(min(INVOMLOGOI , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOI ;

NINVRETOJ = max(min(INVOMLOGOJ , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOJ ;

NINVRETOK = max(min(INVOMLOGOK , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOK ;

NINVRETOM = max(min(INVOMLOGOM , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOM ;

NINVRETON = max(min(INVOMLOGON , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETON ;

NINVRETOP = max(min(INVOMLOGOP , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOP ;

NINVRETOQ = max(min(INVOMLOGOQ , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOQ ; 

NINVRETOR = max(min(INVOMLOGOR , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOR ;

NINVRETOT = max(min(INVOMLOGOT , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOT ;

NINVRETOU = max(min(INVOMLOGOU , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOU ;

NINVRETOV = max(min(INVOMLOGOV , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOV ;

NINVRETOW = max(min(INVOMLOGOW , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOW ;

NINVRETOD = max(min(CODHOD , RRI1-VARTMP1) , 0) * (1 - V_CNR) ; 
VARTMP1 = VARTMP1 + NINVRETOD ;

NINVRETOE = max(min(CODHOE , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOE ;

NINVRETOF = max(min(CODHOF , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOF ;

NINVRETOG = max(min(CODHOG , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOG ;

NINVRETOX = max(min(CODHOX , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOX ;

NINVRETOY = max(min(CODHOY , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOY ;

NINVRETOZ = max(min(CODHOZ , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETOZ ;

NINVRETUA = max(min(CODHUA , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUA ;

NINVRETUB = max(min(CODHUB , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUB ;

NINVRETUC = max(min(CODHUC , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUC ;

NINVRETUD = max(min(CODHUD , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUD ; 

NINVRETUE = max(min(CODHUE , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUE ;

NINVRETUF = max(min(CODHUF , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUF ;

NINVRETUG = max(min(CODHUG , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUG ;

NINVRETUH = max(min(CODHUH , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUH ;

NINVRETUI = max(min(CODHUI , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUI ;

NINVRETUJ = max(min(CODHUJ , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUJ ;

NINVRETUK = max(min(CODHUK , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUK ;

NINVRETUL = max(min(CODHUL , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUL ;

NINVRETUM = max(min(CODHUM , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUM ;

NINVRETUN = max(min(CODHUN , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUN ;

NINVRETUO = max(min(CODHUO , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUO ;

NINVRETUP = max(min(CODHUP , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUP ;

NINVRETUQ = max(min(CODHUQ , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUQ ;

NINVRETUR = max(min(CODHUR , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUR ;

NINVRETUS = max(min(CODHUS , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUS ;

NINVRETUT = max(min(CODHUT , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUT ;

NINVRETUU = max(min(CODHUU , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETUU ; 

NINVRETVA = max(min(CODHVA , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETVA ;

NINVRETVB = max(min(CODHVB , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETVB ;

NINVRETVC = max(min(CODHVC , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETVC ;

NINVRETVD = max(min(CODHVD , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETVD ;

NINVRETVE = max(min(CODHVE , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETVE ;

NINVRETVF = max(min(CODHVF , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETVF ;

NINVRETVG = max(min(CODHVG , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETVG ;

NINVRETVJ = max(min(CODHVJ , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETVJ ;

NINVRETVK = max(min(CODHVK , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETVK ;

NINVRETVL = max(min(CODHVL , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETVL ;

NINVRETVM = max(min(CODHVM , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETVM ;

NINVRETVN = max(min(CODHVN , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = 0 ; 

regle 402040:
application : iliad ;


VARTMP1 = 0 ;

NINVRETYD = max(min(CODHYD , NNRI2-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETYD ;

NINVRETYC = max(min(CODHYC , NNRI2-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETYC ;

NINVRETYE = max(min(CODHYE , NNRI2-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETYE ;

NINVRETYF = max(min(CODHYF , NNRI2-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETYF ;

NINVRETYG = max(min(CODHYG , NNRI2-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETYG ;

NINVRETYH = max(min(CODHYH , NNRI2-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETYH ;

NINVRETYI = max(min(CODHYI , NNRI2-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = 0 ;

NRDOMSOC1 = NINVRETYD + NINVRETYC + NINVRETYE + NINVRETYF + NINVRETYG + NINVRETYH ;

NRLOGSOC = NINVRETYI ;


NINVRETYDR = NINVRETYD - arr(NINVRETYD * TX30 / 100) ;

NINVRETYCR = NINVRETYC - arr(NINVRETYC * TX35 / 100) ;

NINVRETYER = NINVRETYE - arr(NINVRETYE * TX30 / 100) ;

NINVRETYFR = NINVRETYF - arr(NINVRETYF * TX30 / 100) ;

NINVRETYGR = NINVRETYG - arr(NINVRETYG * TX30 / 100) ;

NINVRETYHR = NINVRETYH - arr(NINVRETYH * TX30 / 100) ;

NINVRETYIR = NINVRETYI - arr(NINVRETYI * TX30 / 100) ;

regle 402050:
application : iliad ;


VARTMP1 = 0 ;

INVRETYD = min(arr(NINVRETYD * TX30 / 100) , max(0 , PLAF_INVDOM - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETYD ;

INVRETYC = min(arr(NINVRETYC * TX35 / 100) , max(0 , PLAF_INVDOM - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETYC ;

INVRETYE = min(arr(NINVRETYE * TX30 / 100) , max(0 , PLAF_INVDOM - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETYE ;

INVRETYF = min(arr(NINVRETYF * TX30 / 100) , max(0 , PLAF_INVDOM - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETYF ;

INVRETYG = min(arr(NINVRETYG * TX30 / 100) , max(0 , PLAF_INVDOM - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETYG ;

INVRETYH = min(arr(NINVRETYH * TX30 / 100) , max(0 , PLAF_INVDOM - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETYH ;

INVRETYI = min(arr(NINVRETYI * TX30 / 100) , max(0 , PLAF_INVDOM - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = 0 ;

INVRETSOC = INVRETYD + INVRETYC + INVRETYE + INVRETYF + INVRETYG + INVRETYH + INVRETYI ;


INVRETYDR = min(arr(INVRETYD * 7 / 3) , NINVRETYD - INVRETYD) * (1 - null(1 - abs(arr(INVRETYD * 7 / 3) - (NINVRETYD - INVRETYD))))
                + (NINVRETYD - INVRETYD) * null(1 - abs(arr(INVRETYD * 7 / 3) - (NINVRETYD - INVRETYD))) ;

INVRETYCR = min(arr(INVRETYC * 13 / 7) , NINVRETYC - INVRETYC) * (1 - null(1 - abs(arr(INVRETYC * 13 / 7) - (NINVRETYC - INVRETYC))))
                + (NINVRETYC - INVRETYC) * null(1 - abs(arr(INVRETYC * 13 / 7) - (NINVRETYC - INVRETYC))) ;

INVRETYER = min(arr(INVRETYE * 7 / 3) , NINVRETYE - INVRETYE) * (1 - null(1 - abs(arr(INVRETYE * 7 / 3) - (NINVRETYE - INVRETYE))))
                + (NINVRETYE - INVRETYE) * null(1 - abs(arr(INVRETYE * 7 / 3) - (NINVRETYE - INVRETYE))) ;

INVRETYFR = min(arr(INVRETYF * 7 / 3) , NINVRETYF - INVRETYF) * (1 - null(1 - abs(arr(INVRETYF * 7 / 3) - (NINVRETYF - INVRETYF))))
                + (NINVRETYF - INVRETYF) * null(1 - abs(arr(INVRETYF * 7 / 3) - (NINVRETYF - INVRETYF))) ;

INVRETYGR = min(arr(INVRETYG * 7 / 3) , NINVRETYG - INVRETYG) * (1 - null(1 - abs(arr(INVRETYG * 7 / 3) - (NINVRETYG - INVRETYG))))
                + (NINVRETYG - INVRETYG) * null(1 - abs(arr(INVRETYG * 7 / 3) - (NINVRETYG - INVRETYG))) ;

INVRETYHR = min(arr(INVRETYH * 7 / 3) , NINVRETYH - INVRETYH) * (1 - null(1 - abs(arr(INVRETYH * 7 / 3) - (NINVRETYH - INVRETYH))))
                + (NINVRETYH - INVRETYH) * null(1 - abs(arr(INVRETYH * 7 / 3) - (NINVRETYH - INVRETYH))) ;

INVRETYIR = min(arr(INVRETYI * 7 / 3) , NINVRETYI - INVRETYI) * (1 - null(1 - abs(arr(INVRETYI * 7 / 3) - (NINVRETYI - INVRETYI))))
                + (NINVRETYI - INVRETYI) * null(1 - abs(arr(INVRETYI * 7 / 3) - (NINVRETYI - INVRETYI))) ;

regle 402070:
application : iliad ;


NINVENT12 = NRLOGSOC + NRDOMSOC1 ;


VARTMP1 = 0 ;

NINVRETFT = max(min(CODHFT , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETFT ;

NINVRETFO = max(min(CODHFO , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETFO ;

NINVRETFS = max(min(CODHFS , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETFS ;

NINVRETFN = max(min(CODHFN , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETFN ;

NINVRETFP = max(min(CODHFP , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETFP ;

NINVRETFU = max(min(CODHFU , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETFU ;

NINVRETFR = max(min(CODHFR , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETFR ;

NINVRETFW = max(min(CODHFW , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETFW ;

NINVRETGT = max(min(CODHGT , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETGT ;

NINVRETGU = max(min(CODHGU , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETGU ;

NINVRETGW = max(min(CODHGW , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETGW ;

NINVRETGS = max(min(CODHGS , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETGS ;

NINVRETHT = max(min(CODHHT , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETHT ;

NINVRETHU = max(min(CODHHU , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETHU ;

NINVRETHW = max(min(CODHHW , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETHW ;

NINVRETHS = max(min(CODHHS , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETHS ;

NINVRETIT = max(min(CODHIT , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETIT ;

NINVRETIS = max(min(CODHIS , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETIS ;

NINVRETIU = max(min(CODHIU , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETIU ;

NINVRETIW = max(min(CODHIW , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETIW ;

NINVRETJT = max(min(CODHJT , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETJT ;

NINVRETJS = max(min(CODHJS , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETJS ;

NINVRETJU = max(min(CODHJU , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETJU ;

NINVRETJW = max(min(CODHJW , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETJW ;

NINVRETKT = max(min(CODHKT , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETKT ;

NINVRETKS = max(min(CODHKS , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETKS ;

NINVRETKU = max(min(CODHKU , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + NINVRETKU ;

NINVRETKW = max(min(CODHKW , NNRI2-NINVENT12-VARTMP1) , 0) * (1 - V_CNR) ;
VARTMP1 = 0 ;


NINVRETFTR = NINVRETFT - arr(NINVRETFT * TX34/100) ;

NINVRETFOR = NINVRETFO - arr(NINVRETFO * TX375/100) ;

NINVRETFSR = NINVRETFS - arr(NINVRETFS * TX44/100) ;

NINVRETFNR = NINVRETFN - arr(NINVRETFN * TX4737/100) ;

NINVRETGTR = NINVRETGT - arr(NINVRETGT * TX34/100) ;

NINVRETGSR = NINVRETGS - arr(NINVRETGS * TX44/100) ;

NINVRETHTR = NINVRETHT - arr(NINVRETHT * TX34/100) ;

NINVRETHSR = NINVRETHS - arr(NINVRETHS * TX44/100) ;

NINVRETITR = NINVRETIT - arr(NINVRETIT * TX34/100) ;

NINVRETISR = NINVRETIS - arr(NINVRETIS * TX44/100) ;

NINVRETJTR = NINVRETJT - arr(NINVRETJT * TX34/100) ;

NINVRETJSR = NINVRETJS - arr(NINVRETJS * TX44/100) ;

NINVRETKTR = NINVRETKT - arr(NINVRETKT * TX34/100) ;

NINVRETKSR = NINVRETKS - arr(NINVRETKS * TX44/100) ;

regle 402080:
application : iliad ;


VARTMP1 = 0 ;

INVRETFT = min(arr(NINVRETFT * TX34/100) , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETFT ;

INVRETFO = min(arr(NINVRETFO * TX375/100) , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETFO ;

INVRETFS = min(arr(NINVRETFS * TX44/100) , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETFS ;

INVRETFN = min(arr(NINVRETFN * TX4737/100) , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETFN ;

INVRETGT = min(arr(NINVRETGT * TX34/100) , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETGT ;

INVRETGS = min(arr(NINVRETGS * TX44/100) , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETGS ;

INVRETHT = min(arr(NINVRETHT * TX34/100) , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETHT ;

INVRETHS = min(arr(NINVRETHS * TX44/100) , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETHS ;

INVRETIT = min(arr(NINVRETIT * TX34/100) , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETIT ;

INVRETIS = min(arr(NINVRETIS * TX44/100) , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETIS ;

INVRETJT = min(arr(NINVRETJT * TX34/100) , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETJT ;

INVRETJS = min(arr(NINVRETJS * TX44/100) , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETJS ;

INVRETKT = min(arr(NINVRETKT * TX34/100) , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETKT ;

INVRETKS = min(arr(NINVRETKS * TX44/100) , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETKS ;

INVRETFP = min(NINVRETFP , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETFP ;

INVRETFU = min(NINVRETFU , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETFU ;

INVRETGU = min(NINVRETGU , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETGU ;

INVRETHU = min(NINVRETHU , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETHU ;

INVRETIU = min(NINVRETIU , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETIU ;

INVRETJU = min(NINVRETJU , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETJU ;

INVRETKU = min(NINVRETKU , max(0 , PLAF_INVDOM4 -INVRETSOC-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = 0 ;

INVRETENT = INVRETFT + INVRETFO 
	    + INVRETFS + INVRETFN + INVRETGT + INVRETGS + INVRETHT + INVRETHS + INVRETIT + INVRETIS + INVRETJT + INVRETJS + INVRETKT + INVRETKS
	    + INVRETFP + INVRETFU + INVRETGU + INVRETHU + INVRETIU + INVRETJU + INVRETKU ;

INVRETFR = NINVRETFR ;

INVRETFW = NINVRETFW ;

INVRETGW = NINVRETGW ;

INVRETHW = NINVRETHW ;

INVRETIW = NINVRETIW ;

INVRETJW = NINVRETJW ;

INVRETKW = NINVRETKW ;


INVRETFTR = min(arr(INVRETFT * 33/17) , NINVRETFT - INVRETFT) * (1 - null(1 - abs(arr(INVRETFT * 33/17) - (NINVRETFT - INVRETFT))))
            + (NINVRETFT - INVRETFT) * null(1 - abs(arr(INVRETFT * 33/17) - (NINVRETFT - INVRETFT))) ;

INVRETFOR = min(arr(INVRETFO * 5/3) , NINVRETFO - INVRETFO) * (1 - null(1 - abs(arr(INVRETFO * 5/3) - (NINVRETFO - INVRETFO))))
            + (NINVRETFO - INVRETFO) * null(1 - abs(arr(INVRETFO * 5/3) - (NINVRETFO - INVRETFO))) ;

INVRETFSR = min(arr(INVRETFS * 14/11) , NINVRETFS - INVRETFS) * (1 - null(1 - abs(arr(INVRETFS * 14/11) - (NINVRETFS - INVRETFS))))
            + (NINVRETFS - INVRETFS) * null(1 - abs(arr(INVRETFS * 14/11) - (NINVRETFS - INVRETFS))) ;

INVRETFNR = min(arr(INVRETFN * 10/9) , NINVRETFN - INVRETFN) * (1 - null(1 - abs(arr(INVRETFN * 10/9) - (NINVRETFN - INVRETFN))))
            + (NINVRETFN - INVRETFN) * null(1 - abs(arr(INVRETFN * 10/9) - (NINVRETFN - INVRETFN))) ;

INVRETGTR = min(arr(INVRETGT * 33/17) , NINVRETGT - INVRETGT) * (1 - null(1 - abs(arr(INVRETGT * 33/17) - (NINVRETGT - INVRETGT))))
            + (NINVRETGT - INVRETGT) * null(1 - abs(arr(INVRETGT * 33/17) - (NINVRETGT - INVRETGT))) ;

INVRETGSR = min(arr(INVRETGS * 14/11) , NINVRETGS - INVRETGS) * (1 - null(1 - abs(arr(INVRETGS * 14/11) - (NINVRETGS - INVRETGS))))
            + (NINVRETGS - INVRETGS) * null(1 - abs(arr(INVRETGS * 14/11) - (NINVRETGS - INVRETGS))) ;

INVRETHTR = min(arr(INVRETHT * 33/17) , NINVRETHT - INVRETHT) * (1 - null(1 - abs(arr(INVRETHT * 33/17) - (NINVRETHT - INVRETHT))))
            + (NINVRETHT - INVRETHT) * null(1 - abs(arr(INVRETHT * 33/17) - (NINVRETHT - INVRETHT))) ;

INVRETHSR = min(arr(INVRETHS * 14/11) , NINVRETHS - INVRETHS) * (1 - null(1 - abs(arr(INVRETHS * 14/11) - (NINVRETHS - INVRETHS))))
            + (NINVRETHS - INVRETHS) * null(1 - abs(arr(INVRETHS * 14/11) - (NINVRETHS - INVRETHS))) ;

INVRETITR = min(arr(INVRETIT * 33/17) , NINVRETIT - INVRETIT) * (1 - null(1 - abs(arr(INVRETIT * 33/17) - (NINVRETIT - INVRETIT))))
            + (NINVRETIT - INVRETIT) * null(1 - abs(arr(INVRETIT * 33/17) - (NINVRETIT - INVRETIT))) ;

INVRETISR = min(arr(INVRETIS * 14/11) , NINVRETIS - INVRETIS) * (1 - null(1 - abs(arr(INVRETIS * 14/11) - (NINVRETIS - INVRETIS))))
            + (NINVRETIS - INVRETIS) * null(1 - abs(arr(INVRETIS * 14/11) - (NINVRETIS - INVRETIS))) ;

INVRETJTR = min(arr(INVRETJT * 33/17) , NINVRETJT - INVRETJT) * (1 - null(1 - abs(arr(INVRETJT * 33/17) - (NINVRETJT - INVRETJT))))
            + (NINVRETJT - INVRETJT) * null(1 - abs(arr(INVRETJT * 33/17) - (NINVRETJT - INVRETJT))) ;

INVRETJSR = min(arr(INVRETJS * 14/11) , NINVRETJS - INVRETJS) * (1 - null(1 - abs(arr(INVRETJS * 14/11) - (NINVRETJS - INVRETJS))))
            + (NINVRETJS - INVRETJS) * null(1 - abs(arr(INVRETJS * 14/11) - (NINVRETJS - INVRETJS))) ;

INVRETKTR = min(arr(INVRETKT * 33/17) , NINVRETKT - INVRETKT) * (1 - null(1 - abs(arr(INVRETKT * 33/17) - (NINVRETKT - INVRETKT))))
            + (NINVRETKT - INVRETKT) * null(1 - abs(arr(INVRETKT * 33/17) - (NINVRETKT - INVRETKT))) ;

INVRETKSR = min(arr(INVRETKS * 14/11) , NINVRETKS - INVRETKS) * (1 - null(1 - abs(arr(INVRETKS * 14/11) - (NINVRETKS - INVRETKS))))
            + (NINVRETKS - INVRETKS) * null(1 - abs(arr(INVRETKS * 14/11) - (NINVRETKS - INVRETKS))) ;

regle 402100:
application : iliad ;


VARTMP1 = 0 ;

INVRETQB = NINVRETQB ; 

INVRETQC = NINVRETQC ; 

INVRETQT = NINVRETQT ; 

INVRETQL = min(NINVRETQL , max(0 , PLAF_INVDOM -INVRETSOC-INVRETENT)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETQL ;

INVRETQM = min(NINVRETQM , max(0 , PLAF_INVDOM -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETQM ;

INVRETQD = min(NINVRETQD , max(0 , PLAF_INVDOM -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETQD ;

INVRETOB = min(NINVRETOB , max(0 , PLAF_INVDOM -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOB ;

INVRETOC = min(NINVRETOC , max(0 , PLAF_INVDOM -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOC ;

INVRETOI = min(NINVRETOI , max(0 , PLAF_INVDOM3 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOI ;

INVRETOJ = min(NINVRETOJ , max(0 , PLAF_INVDOM3 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOJ ;

INVRETOK = min(NINVRETOK , max(0 , PLAF_INVDOM3 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOK ;

INVRETOM = min(NINVRETOM , max(0 , PLAF_INVDOM -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOM ;

INVRETON = min(NINVRETON , max(0 , PLAF_INVDOM -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETON ;

INVRETOP = min(NINVRETOP , max(0 , PLAF_INVDOM3 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOP ;

INVRETOQ = min(NINVRETOQ , max(0 , PLAF_INVDOM3 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOQ ;

INVRETOR = min(NINVRETOR , max(0 , PLAF_INVDOM3 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOR ;

INVRETOT = min(NINVRETOT , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOT ;

INVRETOU = min(NINVRETOU , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOU ;

INVRETOV = min(NINVRETOV , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOV ;

INVRETOW = min(NINVRETOW , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOW ;

INVRETOD = min(NINVRETOD , max(0 , PLAF_INVDOM -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOD ;

INVRETOE = min(NINVRETOE , max(0 , PLAF_INVDOM3 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOE ;

INVRETOF = min(NINVRETOF , max(0 , PLAF_INVDOM3 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOF ;

INVRETOG = min(NINVRETOG , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOG ;

INVRETOX = min(NINVRETOX , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOX ;

INVRETOY = min(NINVRETOY , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOY ;

INVRETOZ = min(NINVRETOZ , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETOZ ;

INVRETUA = min(NINVRETUA , max(0 , PLAF_INVDOM -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUA ;

INVRETUB = min(NINVRETUB , max(0 , PLAF_INVDOM3 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUB ;

INVRETUC = min(NINVRETUC , max(0 , PLAF_INVDOM3 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUC ;

INVRETUD = min(NINVRETUD , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUD ;

INVRETUE = min(NINVRETUE , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUE ;

INVRETUF = min(NINVRETUF , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUF ;

INVRETUG = min(NINVRETUG , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUG ;

INVRETUH = min(NINVRETUH , max(0 , PLAF_INVDOM -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUH ;

INVRETUI = min(NINVRETUI , max(0 , PLAF_INVDOM3 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUI ;

INVRETUJ = min(NINVRETUJ , max(0 , PLAF_INVDOM3 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUJ ;

INVRETUK = min(NINVRETUK , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUK ;

INVRETUL = min(NINVRETUL , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUL ;

INVRETUM = min(NINVRETUM , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUM ;

INVRETUN = min(NINVRETUN , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUN ;

INVRETUO = min(NINVRETUO , max(0 , PLAF_INVDOM -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUO ;

INVRETUP = min(NINVRETUP , max(0 , PLAF_INVDOM3 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUP ;

INVRETUQ = min(NINVRETUQ , max(0 , PLAF_INVDOM3 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUQ ;

INVRETUR = min(NINVRETUR , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUR ;

INVRETUS = min(NINVRETUS , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUS ;

INVRETUT = min(NINVRETUT , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUT ;

INVRETUU = min(NINVRETUU , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETUU ;

INVRETVA = min(NINVRETVA , max(0 , PLAF_INVDOM -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETVA ;

INVRETVB = min(NINVRETVB , max(0 , PLAF_INVDOM3 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETVB ;

INVRETVC = min(NINVRETVC , max(0 , PLAF_INVDOM3 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETVC ;

INVRETVD = min(NINVRETVD , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETVD ;

INVRETVE = min(NINVRETVE , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETVE ;

INVRETVF = min(NINVRETVF , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETVF ;

INVRETVG = min(NINVRETVG , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETVG ;

INVRETVJ = min(NINVRETVJ , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETVJ ;

INVRETVK = min(NINVRETVK , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETVK ;

INVRETVL = min(NINVRETVL , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETVL ;

INVRETVM = min(NINVRETVM , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + INVRETVM ;

INVRETVN = min(NINVRETVN , max(0 , PLAF_INVDOM4 -INVRETSOC-INVRETENT-VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = 0 ;

INVRETLOG = INVRETQL + INVRETQM + INVRETQD + INVRETOB + INVRETOC + INVRETOI + INVRETOJ + INVRETOK + INVRETOM + INVRETON + INVRETOP + INVRETOQ
            + INVRETOR + INVRETOT + INVRETOU + INVRETOV + INVRETOW + INVRETOD + INVRETOE + INVRETOF + INVRETOG + INVRETOX + INVRETOY + INVRETOZ 
            + INVRETUA + INVRETUB + INVRETUC + INVRETUD + INVRETUE + INVRETUF + INVRETUG + INVRETUH + INVRETUI + INVRETUJ + INVRETUK + INVRETUL
            + INVRETUM + INVRETUN + INVRETUO + INVRETUP + INVRETUQ + INVRETUR + INVRETUS + INVRETUT + INVRETUU + INVRETVA + INVRETVB + INVRETVC
	    + INVRETVD + INVRETVE + INVRETVF + INVRETVG + INVRETVJ + INVRETVK + INVRETVL + INVRETVM + INVRETVN ;

regle 402060:
application : iliad ;


RLOGDOM_1 = min(ALOGDOM_1 ,RRI1) * (1 - V_CNR);
RLOGDOM = (1 - V_CNR) * ( null(4-V_IND_TRAIT) * min(ALOGDOM , RRI1)
                        + null(5-V_IND_TRAIT) * (min(RLOGDOM_1,max(max(RLOGDOM_P,RLOGDOM_PA),RLOGDOM1731))*(1-V_INDTEO)+RLOGDOM_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11)));

RINVDOMTOMLG = RLOGDOM ;

regle 402110:
application : iliad ;


RRISUP = RRI1 - RLOGDOM - RCOMP - RRETU - RDONS - CRDIE - RLOCNPRO - RDUFREP - RPINELTOT - RNORMTOT - RNOUV 
              - RPENTOT - RREHAB - RRESTREP - RRESTIMO1 - RCELTOT ; 


RDOMSOC1 = min(ADOMSOC1 , RRISUP) * (1 - V_CNR) ;
RDOMSOC1_1 = min(ADOMSOC1_1 , RRISUP) * (1 - V_CNR) ;

RLOGSOC = min(ALOGSOC , max(0 , RRISUP - ADOMSOC1)) * (1 - V_CNR) ;
RLOGSOC_1 = min(ALOGSOC_1 , max(0 , RRISUP - ADOMSOC1)) * (1 - V_CNR) ;

RLOGSOCTEO = (arr((((INVRETYD + INVRETYDR) * (1 - INDPLAF) + (INVRETYDA + INVRETYDRA) * INDPLAF)) * TX70/100)
              + arr((((INVRETYC + INVRETYCR) * (1 - INDPLAF) + (INVRETYCA + INVRETYCRA) * INDPLAF)) * TX65/100)
              + arr((((INVRETYE + INVRETYER) * (1 - INDPLAF) + (INVRETYEA + INVRETYERA) * INDPLAF)) * TX70/100)
              + arr((((INVRETYF + INVRETYFR) * (1 - INDPLAF) + (INVRETYFA + INVRETYFRA) * INDPLAF)) * TX70/100)
              + arr((((INVRETYG + INVRETYGR) * (1 - INDPLAF) + (INVRETYGA + INVRETYGRA) * INDPLAF)) * TX70/100)
              + arr((((INVRETYH + INVRETYHR) * (1 - INDPLAF) + (INVRETYHA + INVRETYHRA) * INDPLAF)) * TX70/100)
              + arr((((INVRETYI + INVRETYIR) * (1 - INDPLAF) + (INVRETYIA + INVRETYIRA) * INDPLAF)) * TX70/100)
             ) * (1 - V_CNR) ; 

regle 402120:
application : iliad ;


RCOLENT = min(ACOLENT , max(0 , RRISUP - ALOGSOC - ADOMSOC1)) * (1 - V_CNR) ;
RCOLENT_1 = min(ACOLENT_1 , max(0 , RRISUP - ALOGSOC_1 - ADOMSOC1_1)) * (1 - V_CNR) ;

RLOCENT = min(ALOCENT , max(0 , RRISUP - ALOGSOC - ADOMSOC1 - ACOLENT)) * (1 - V_CNR) ;
RLOCENT_1 = min(ALOCENT_1 , max(0 , RRISUP - ALOGSOC_1 - ADOMSOC1_1 - ACOLENT_1)) * (1 - V_CNR) ;

RIDOMENT = RLOCENT ;

RCOLENTTEO = (arr(((INVRETFN + INVRETFNR) * (1 - INDPLAF) + (INVRETFNA + INVRETFNRA) * INDPLAF) * TX5263/100)
              + arr(((INVRETFO + INVRETFOR) * (1 - INDPLAF) + (INVRETFOA + INVRETFORA) * INDPLAF) * TX625/100)
              + arr(((INVRETFS + INVRETFSR) * (1 - INDPLAF) + (INVRETFSA + INVRETFSRA) * INDPLAF) * TX56/100)
              + arr(((INVRETFT + INVRETFTR) * (1 - INDPLAF) + (INVRETFTA + INVRETFTRA) * INDPLAF) * TX66/100)

              + arr(((INVRETGS + INVRETGSR) * (1 - INDPLAF) + (INVRETGSA + INVRETGSRA) * INDPLAF) * TX56/100)
              + arr(((INVRETGT + INVRETGTR) * (1 - INDPLAF) + (INVRETGTA + INVRETGTRA) * INDPLAF) * TX66/100)
              + arr(((INVRETHS + INVRETHSR) * (1 - INDPLAF) + (INVRETHSA + INVRETHSRA) * INDPLAF) * TX56/100)
              + arr(((INVRETHT + INVRETHTR) * (1 - INDPLAF) + (INVRETHTA + INVRETHTRA) * INDPLAF) * TX66/100)
              + arr(((INVRETIS + INVRETISR) * (1 - INDPLAF) + (INVRETISA + INVRETISRA) * INDPLAF) * TX56/100)
              + arr(((INVRETIT + INVRETITR) * (1 - INDPLAF) + (INVRETITA + INVRETITRA) * INDPLAF) * TX66/100)
              + arr(((INVRETJS + INVRETJSR) * (1 - INDPLAF) + (INVRETJSA + INVRETJSRA) * INDPLAF) * TX56/100)
              + arr(((INVRETJT + INVRETJTR) * (1 - INDPLAF) + (INVRETJTA + INVRETJTRA) * INDPLAF) * TX66/100)
              + arr(((INVRETKS + INVRETKSR) * (1 - INDPLAF) + (INVRETKSA + INVRETKSRA) * INDPLAF) * TX56/100)
              + arr(((INVRETKT + INVRETKTR) * (1 - INDPLAF) + (INVRETKTA + INVRETKTRA) * INDPLAF) * TX66/100)
              ) * (1 - V_CNR) ;

regle 402130:
application : iliad ;


RRIREP_1 = RRI1 - DLOGDOM - RCOMP_1 - RRETU_1 - RDONS_1 - CRDIE - RLOCNPRO_1 - RDUFREP_1 - RPINELTOT_1 - RNORMTOT_1 - RNOUV_1 
                - RPENTOT_1 - RREHAB_1 - RRESTREP_1 - RRESTIMO1_1 - RCELTOT_1 - RPTZM_1 ;

RRIREP = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RRIREP_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RRIREP_1 , max(max(RRIREP_P,RRIREP_PA),RRIREP1731))*(1-V_INDTEO)+RRIREP_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;


VARTMP1 = CODHYD + CODHYC ;

REPYE = max(0 , CODHYE - max(0 , RRIREP - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHYE ;

REPDOMSOC4 = REPYE ;


REPYF = max(0 , CODHYF - max(0 , RRIREP - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHYF ;

REPDOMSOC3 = REPYF ;


REPYG = max(0 , CODHYG - max(0 , RRIREP - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHYG ;

REPDOMSOC2 = REPYG ;


REPYH = max(0 , CODHYH - max(0 , RRIREP - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHYH ;

REPDOMSOC1 = REPYH ;


REPYI = max(0 , CODHYI - max(0 , RRIREP - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHYI ;

REPDOMSOC = REPYI ;



REPENT5 = CODHFT + CODHFO + CODHFS + CODHFN + CODHFP + CODHFU + CODHFR + CODHFW ;


REPGT = max(0 , CODHGT - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHGT ; 

REPGS = max(0 , CODHGS - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHGS ; 

REPGU = max(0 , CODHGU - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHGU ; 

REPGW = max(0 , CODHGW - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHGW ;

REPDOMENTR4 = REPGT + REPGS + REPGU + REPGW ;


REPHT = max(0 , CODHHT - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHHT ; 

REPHS = max(0 , CODHHS - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHHS ; 

REPHU = max(0 , CODHHU - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHHU ; 

REPHW = max(0 , CODHHW - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHHW ;

REPDOMENTR3 = REPHT + REPHS + REPHU + REPHW ;


REPIT = max(0 , CODHIT - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHIT ; 

REPIS = max(0 , CODHIS - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHIS ; 

REPIU = max(0 , CODHIU - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHIU ; 

REPIW = max(0 , CODHIW - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHIW ;

REPDOMENTR2 = REPIT + REPIS + REPIU + REPIW ;


REPJT = max(0 , CODHJT - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHJT ; 

REPJS = max(0 , CODHJS - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHJS ; 

REPJU = max(0 , CODHJU - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHJU ; 

REPJW = max(0 , CODHJW - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHJW ; 

REPDOMENTR1 = REPJT + REPJS + REPJU + REPJW ;


REPKT = max(0 , CODHKT - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHKT ; 

REPKS = max(0 , CODHKS - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHKS ; 

REPKU = max(0 , CODHKU - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + CODHKU ; 

REPKW = max(0 , CODHKW - max(0 , RRIREP - REPENT5 - VARTMP1)) * (1 - V_CNR) ;
VARTMP1 = 0 ;

REPDOMENTR = REPKT + REPKS + REPKU + REPKW ;




RIDEFRI = (1-COD9ZA+0) * (positif(positif(RED_1 - RED1731+0+SOMMERI1731*positif(RED_1))
                    + positif(RDONIFI_1+RDONIFI2_1 - (RDONIFI11731 + RDONIFI21731)*positif(RDONIFI_1+RDONIFI2_1) * ART1731BISIFI)) * positif(1-PREM8_11)
                    + positif(positif(RED1731+0 + SOMMERI1731)+ positif(RDONIFI_1+RDONIFI2_1 - (RDONIFI11731 + RDONIFI21731))) * positif(PREM8_11)) * null(V_IND_TRAIT - 5);
       
regle 4666:
application : iliad ;

TOTRI3WG = RAPRESSE + RAFORET + RFIPDOMCOM + RFIPCORSE + RRS + RRCN + RFIP + RENOV + ACOMP
           + ADUFREP + APIREP + ANORMREP + RPINABCD + RPINRRS + RPIPRO + RNORABCD
	   + COD7MS + COD7MT + COD7MU + COD7MV
	   + CELREPWT + CELREPWU + CELREPWV + CELREPWW 
           + COD7RU + COD7RT
	   + RAH + RAALIM + RSNNCL + RSNNCC + RSNNCR
	   + RSNNCX + RSN + APLAFREPME4 + APENTCY + APENTDY + APENTEY + APENTFY + APENTGY  
	   + DILMNP1 + DILMNP3 
	   + RETCODOU + RETCODOY + RETCODPZ + RETCODMZ + RETCODMW + RETCODMN + RSOCREP + RETRESTIMO + RONS 
	   + CRCFA + RETUD + RFCPI + RPRESCOMP 
	   + RAGRI + TOTINVDOM ;

regle 4700:
application : iliad ;
RED3WG =  max( min(TOTRI3WG , IDOM13-DEC13) , 0 ) ;
regle 4800:
application : iliad ;

TOTINVDOM = INVLOG2008 + INVLGDEB2009 + INVLGDEB + INVOMLOGOA
           +INVOMLOGOH + INVOMLOGOL + INVOMLOGOO + INVOMLOGOS
           +(INVRETQL * (1 - INDPLAF) + INVRETQLA * INDPLAF)
           +(INVRETQM * (1 - INDPLAF) + INVRETQMA * INDPLAF)
           +(INVRETQD * (1 - INDPLAF) + INVRETQDA * INDPLAF)
           +(INVRETOB * (1 - INDPLAF) + INVRETOBA * INDPLAF)
           +(INVRETOC * (1 - INDPLAF) + INVRETOCA * INDPLAF)
           +(INVRETOI * (1 - INDPLAF) + INVRETOIA * INDPLAF)
           +(INVRETOJ * (1 - INDPLAF) + INVRETOJA * INDPLAF)
           +(INVRETOK * (1 - INDPLAF) + INVRETOKA * INDPLAF)
           +(INVRETOM * (1 - INDPLAF) + INVRETOMA * INDPLAF)
           +(INVRETON * (1 - INDPLAF) + INVRETONA * INDPLAF)
           +(INVRETOP * (1 - INDPLAF) + INVRETOPA * INDPLAF)
           +(INVRETOQ * (1 - INDPLAF) + INVRETOQA * INDPLAF)
           +(INVRETOR * (1 - INDPLAF) + INVRETORA * INDPLAF)
           +(INVRETOT * (1 - INDPLAF) + INVRETOTA * INDPLAF)
           +(INVRETOU * (1 - INDPLAF) + INVRETOUA * INDPLAF)
           +(INVRETOV * (1 - INDPLAF) + INVRETOVA * INDPLAF)
           +(INVRETOW * (1 - INDPLAF) + INVRETOWA * INDPLAF)
           +(INVRETOD * (1 - INDPLAF) + INVRETODA * INDPLAF)
           +(INVRETOE * (1 - INDPLAF) + INVRETOEA * INDPLAF)
           +(INVRETOF * (1 - INDPLAF) + INVRETOFA * INDPLAF)
           +(INVRETOG * (1 - INDPLAF) + INVRETOGA * INDPLAF)
           +(INVRETOX * (1 - INDPLAF) + INVRETOXA * INDPLAF)
           +(INVRETOY * (1 - INDPLAF) + INVRETOYA * INDPLAF)
           +(INVRETOZ * (1 - INDPLAF) + INVRETOZA * INDPLAF)
           +(INVRETUA * (1 - INDPLAF) + INVRETUAA * INDPLAF)
           +(INVRETUB * (1 - INDPLAF) + INVRETUBA * INDPLAF)
           +(INVRETUC * (1 - INDPLAF) + INVRETUCA * INDPLAF)
           +(INVRETUD * (1 - INDPLAF) + INVRETUDA * INDPLAF)
           +(INVRETUE * (1 - INDPLAF) + INVRETUEA * INDPLAF)
           +(INVRETUF * (1 - INDPLAF) + INVRETUFA * INDPLAF)
           +(INVRETUG * (1 - INDPLAF) + INVRETUGA * INDPLAF)
           +(INVRETUH * (1 - INDPLAF) + INVRETUHA * INDPLAF)
           +(INVRETUI * (1 - INDPLAF) + INVRETUIA * INDPLAF)
           +(INVRETUJ * (1 - INDPLAF) + INVRETUJA * INDPLAF)
           +(INVRETUK * (1 - INDPLAF) + INVRETUKA * INDPLAF)
           +(INVRETUL * (1 - INDPLAF) + INVRETULA * INDPLAF)
           +(INVRETUM * (1 - INDPLAF) + INVRETUMA * INDPLAF)
           +(INVRETUN * (1 - INDPLAF) + INVRETUNA * INDPLAF)
           +(INVRETUO * (1 - INDPLAF) + INVRETUOA * INDPLAF)
           +(INVRETUP * (1 - INDPLAF) + INVRETUPA * INDPLAF)
           +(INVRETUQ * (1 - INDPLAF) + INVRETUQA * INDPLAF)
           +(INVRETUR * (1 - INDPLAF) + INVRETURA * INDPLAF)
           +(INVRETUS * (1 - INDPLAF) + INVRETUSA * INDPLAF)
           +(INVRETUT * (1 - INDPLAF) + INVRETUTA * INDPLAF)
           +(INVRETUU * (1 - INDPLAF) + INVRETUUA * INDPLAF)
           +(INVRETVA * (1 - INDPLAF) + INVRETVAA * INDPLAF)
           +(INVRETVB * (1 - INDPLAF) + INVRETVBA * INDPLAF)
           +(INVRETVC * (1 - INDPLAF) + INVRETVCA * INDPLAF)
           +(INVRETVD * (1 - INDPLAF) + INVRETVDA * INDPLAF)
           +(INVRETVE * (1 - INDPLAF) + INVRETVEA * INDPLAF)
           +(INVRETVF * (1 - INDPLAF) + INVRETVFA * INDPLAF)
           +(INVRETVG * (1 - INDPLAF) + INVRETVGA * INDPLAF)
           +(INVRETVJ * (1 - INDPLAF) + INVRETVJA * INDPLAF)
           +(INVRETVK * (1 - INDPLAF) + INVRETVKA * INDPLAF) 
           +(INVRETVL * (1 - INDPLAF) + INVRETVLA * INDPLAF) 
           +(INVRETVM * (1 - INDPLAF) + INVRETVMA * INDPLAF) 
           +(INVRETVN * (1 - INDPLAF) + INVRETVNA * INDPLAF) ;

regle 402160 :
application : iliad ;

DREHAB = COD7XX ;

AREHAB_1 = DREHAB * (1 - V_CNR) ;
AREHAB = positif(null(V_IND_TRAIT-4)+COD9ZA) * (AREHAB_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
         + (max(0,min(AREHAB_1,max(max(AREHAB_P,AREHAB_PA),AREHAB1731))*(1-V_INDTEO)+AREHAB_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;

RRREHAP = arr(AREHAB_1 * TX20/100) ;

regle 402161 :
application : iliad ;

RREHAB_1 = max(min(RRREHAP , RRI1-RLOGDOM-RCOMP-RRETU-RDONS-CRDIE-RDUFREP-RPINELTOT-RNORMTOT-RNOUV-RPENTOT) , 0) ;
RREHAB = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RREHAB_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max(0 , min(RREHAB_1 , max(max(RREHAB_P,RREHAB_PA),RREHAB1731))*(1-V_INDTEO)+RREHAB_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;

regle 402165 :
application : iliad ;



VARTMP1 = DEC11 + REDUCAVTCEL + RCELTOT + RILMNP1 + RILMNP3 + RCODOY + RCODMN + RCODPZ + RCODMZ + RCODMW ;
DPTZM = COD8PZ ;

APTZM_1 = max(0,  min(max(0, DPTZM), IDOM11 - VARTMP1) );
APTZM = positif (null (V_IND_TRAIT - 4) + COD9ZA) * (APTZM_1) * (1 - positif (null (8 - CMAJ) + null (11 - CMAJ) + null (34 - CMAJ) ) )
         + (max(0,min(APTZM_1, max (max (APTZM_P,APTZM_PA), APTZM1731) )*(1 - V_INDTEO)
	 + APTZM_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5) + 0 ;

RPTZM_1 = positif (APTZM) * APTZM ;
RPTZM = positif (null (V_IND_TRAIT - 4) + COD9ZA) * RPTZM_1 * (1 - positif (null (8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max (0 , min (RPTZM_1 , max (max (RPTZM_P,RPTZM_PA),RPTZM1731)) * (1 - V_INDTEO)
	 + RPTZM_1 * V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11) ) ) * null (V_IND_TRAIT - 5) + 0 ;


REPTZM = max(0 , DPTZM - RPTZM) ;

VARTMP1 = 0 ;
regle 402167 :
application : iliad ;


DPMEJEI = COD7DZ + COD7CR;

APMEJEIDZ = min(COD7DZ , LIM50000 * (1 + BOOL_0AM)) * (1 - V_CNR) ;
APMEJEICR = min(COD7CR , LIM75000 * (1 + BOOL_0AM)) * (1 - V_CNR) ;
APMEJEI_1 = (min(COD7DZ , LIM50000 * (1 + BOOL_0AM)) + min(COD7CR , LIM75000 * (1 + BOOL_0AM))) * (1 - V_CNR) ;
APMEJEI  = positif (null (V_IND_TRAIT - 4) + COD9ZA) * (APMEJEI_1) * (1 - positif (null (8 - CMAJ) + null (11 - CMAJ) + null (34 - CMAJ) ) )
         + (max(0,min(APMEJEI_1, max (max (APMEJEI_P,APMEJEI_PA), APMEJEI1731) )*(1 - V_INDTEO)
	 + APMEJEI_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5) + 0 ;

regle 402168 :
application : iliad ;

RPMEJEI_1 = max(min(arr(APMEJEIDZ * TX50/100 + APMEJEICR * TX30/100) , RRI1-RLOGDOM-RCOMP-RRETU-RDONS-CRDIE-RDUFREP-RPINELTOT-RNORMTOT-RNOUV
		   -RPENTCY - RPENTDY - RPENTEY - RPENTFY - RPENTGY - RPENTEK) , 0) ;
RPMEJEI = positif (null (V_IND_TRAIT - 4) + COD9ZA) * RPMEJEI_1 * (1 - positif (null (8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
         + (max (0 , min (RPMEJEI_1 , max (max (RPMEJEI_P,RPMEJEI_PA),RPMEJEI1731)) * (1 - V_INDTEO)
	 + RPMEJEI_1 * V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11) ) ) * null (V_IND_TRAIT - 5) + 0 ;

