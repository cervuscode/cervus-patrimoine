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
                              
 ####   #    #    ##    ##### 
 ####   #    #  #    #  #     

regle 901010:
application :  iliad ;


LIG0 = (1 - positif(RE168 + TAX1649)) * IND_REV ;

LIG1 = (1 - positif(RE168 + TAX1649)) ;

LIG2 = (1 - positif(ANNUL2042)) ;

LIG02 = LIG0 * LIG2 ;

LIG12 = LIG1 * LIG2 ;

LIG01 = (1 - (positif(REVFONC) * (1 - INDREV1A8))) * LIG02 ;

LIG3 = positif(positif(CMAJ + 0) 
       + positif_ou_nul(MAJTX1 - 40) + positif_ou_nul(MAJTX4 - 40)
       + positif_ou_nul(MAJTXPCAP1 - 40) + positif_ou_nul(MAJTXPCAP4 - 40)
       + positif_ou_nul(MAJTXCHR1 - 40) + positif_ou_nul(MAJTXCHR4 - 40)
       + positif_ou_nul(MAJTXC1 - 40) + positif_ou_nul(MAJTXC4 - 40) 
       + positif_ou_nul(MAJTXCVN1 - 40) + positif_ou_nul(MAJTXCVN4 - 40)
       + positif_ou_nul(MAJTXCDIS1 - 40) + positif_ou_nul(MAJTXCDIS4 - 40)
       + positif_ou_nul(MAJTXGLO1 - 40) + positif_ou_nul(MAJTXGLO4 - 40)
       + positif_ou_nul(MAJTXRSE11 - 40) + positif_ou_nul(MAJTXRSE14 - 40)
       + positif_ou_nul(MAJTXRSE51 - 40) + positif_ou_nul(MAJTXRSE54 - 40)
       + positif_ou_nul(MAJTXRSE21 - 40) + positif_ou_nul(MAJTXRSE24 - 40)
       + positif_ou_nul(MAJTXRSE31 - 40) + positif_ou_nul(MAJTXRSE34 - 40)
       + positif_ou_nul(MAJTXRSE41 - 40) + positif_ou_nul(MAJTXRSE44 - 40)
       + positif_ou_nul(MAJTXRSE61 - 40) + positif_ou_nul(MAJTXRSE64 - 40)
       + positif_ou_nul(MAJTXTAXA4 - 40)) ;

CNRLIG12 = (1 - V_CNR) * LIG12 ;

CNRLIG1 = (1 - V_CNR) * LIG1 ;

regle 901020:
application :  iliad ;


LIG0010 = (INDV * INDC * INDP) * (1 - ART1731BIS) * LIG02 ;

LIG0020 = (INDV * (1 - INDC) * (1 - INDP)) * (1 - ART1731BIS) * LIG02 ;

LIG0030 = (INDC * (1 - INDV) * (1 - INDP)) * (1 - ART1731BIS) * LIG02 ;

LIG0040 = (INDP * (1 - INDV) * (1 - INDC)) * (1 - ART1731BIS) * LIG02 ;

LIG0050 = (INDV * INDC * (1 - INDP)) * (1 - ART1731BIS) * LIG02 ;

LIG0060 = (INDV * INDP * (1 - INDC)) * (1 - ART1731BIS) * LIG02 ;

LIG0070 = (INDC * INDP * (1 - INDV)) * (1 - ART1731BIS) * LIG02 ;

LIG10YT = (INDV * INDC * INDP) * ART1731BIS * LIG02 ;

LIG20YT = (INDV * (1 - INDC) * (1 - INDP)) * ART1731BIS * LIG02 ;

LIG30YT = (INDC * (1 - INDV) * (1 - INDP)) * ART1731BIS * LIG02 ;

LIG40YT = (INDP * (1 - INDV) * (1 - INDC)) * ART1731BIS * LIG02 ;

LIG50YT = (INDV * INDC * (1 - INDP)) * ART1731BIS * LIG02 ;

LIG60YT = (INDV * INDP * (1 - INDC)) * ART1731BIS * LIG02 ;

LIG70YT = (INDC * INDP * (1 - INDV)) * ART1731BIS * LIG02 ;

regle 901030:
application :  iliad ;


LIG10V = positif_ou_nul(TSBNV + PRBV + BPCOSAV + GLDGRATV + COD1AI + positif(F10AV * null(TSBNV + PRBV + BPCOSAV + GLDGRATV + COD1AI))) ;
LIG10C = positif_ou_nul(TSBNC + PRBC + BPCOSAC + GLDGRATC + COD1BI + positif(F10AC * null(TSBNC + PRBC + BPCOSAC + GLDGRATC + COD1BI))) ;
LIG10P = positif_ou_nul(somme(i=1..4:TSBNi + PRBi) + COD1CI + COD1DI + COD1EI + COD1FI + positif(F10AP * null(somme(i=1..4:TSBNi + PRBi) + COD1CI + COD1DI + COD1EI + COD1FI))) ;
LIG10 = positif(LIG10V + LIG10C + LIG10P) ;

regle 901040:
application :  iliad ;

LIG1100 = positif(T2RV) * LIG2 ;

LIG899 = positif(RVTOT + LIG1100 + LIG910 + BRCMQ + (RCMFR + REPRCM) * LIG2OP + LIGRCMABT + LIG2RCMABT + LIGPV3VG 
		 + RCMLIB + LIG29 + LIG30 + RFQ + 2REVF + 3REVF + LIG1130 + DFANT + ESFP + RE168 + TAX1649 + R1649 + PREREV)
	 * (1 - positif(LIG0010 + LIG0020 + LIG0030 + LIG0040 + LIG0050 + LIG0060 + LIG0070)) 
	 * (1 - ART1731BIS) * LIG2 ; 

LIG900 = positif(RVTOT + LIG1100 + LIG910 + BRCMQ + (RCMFR + REPRCM) * LIG2OP + LIGRCMABT + LIG2RCMABT + LIGPV3VG 
		 + RCMLIB + LIG29 + LIG30 + RFQ + 2REVF + 3REVF + LIG1130 + DFANT + ESFP + RE168 + TAX1649 + R1649 + PREREV)
	 * positif(LIG0010 + LIG0020 + LIG0030 + LIG0040 + LIG0050 + LIG0060 + LIG0070) 
	 * (1 - ART1731BIS) * LIG2 ; 

LIG899YT = positif(RVTOT + LIG1100 + LIG910 + BRCMQ + (RCMFR + REPRCM) * LIG2OP + LIGRCMABT + LIG2RCMABT + LIGPV3VG 
		   + RCMLIB + LIG29 + LIG30 + RFQ + 2REVF + 3REVF + LIG1130 + DFANT + ESFP + RE168 + TAX1649 + R1649 + PREREV)
	   * (1 - positif(LIG10YT + LIG20YT + LIG30YT + LIG40YT + LIG50YT + LIG60YT + LIG70YT)) 
	   * ART1731BIS * LIG2 ; 

LIG900YT = positif(RVTOT + LIG1100 + LIG910 + BRCMQ + (RCMFR + REPRCM) * LIG2OP + LIGRCMABT + LIG2RCMABT + LIGPV3VG 
		   + RCMLIB + LIG29 + LIG30 + RFQ + 2REVF + 3REVF + LIG1130 + DFANT + ESFP + RE168 + TAX1649 + R1649 + PREREV)
	   * positif(LIG10YT + LIG20YT + LIG30YT + LIG40YT + LIG50YT + LIG60YT + LIG70YT) 
	   * ART1731BIS * LIG2 ; 

regle 901060:
application : iliad  ;

LIGBAM = positif(COD5XB + COD5YB + COD5ZB) * LIG12 ;

LIGBAMPV = positif(BAFPVV + BAFPVC + BAFPVP) * LIG12 ;

LIGBAMMV = positif(COD5XO + COD5YO + COD5ZO) * LIG12 ;

LIGBAMTOT = positif(LIGBAM + LIGBAMPV + LIGBAMMV) * LIG12 ;

LIGCBOIS = positif(BAFORESTV + BAFORESTC + BAFORESTP) * LIG12 ;

LIG13 =  positif(present(BACDEV)+ present(BACREV) + present(COD5AK) 
                 + present(BACDEC) +present(BACREC) + present(COD5BK) 
                 + present(BACDEP)+ present(BACREP) + present(COD5CK) 
                 + present(4BACREV) + present(4BACREC) + present(4BACREP))
	* LIG12 ;

LIGETAL = positif(RN6DEC1 + RN6DEC2 + RN6DEC3) * LIG12 ;

LIGBAMICF1 = (1 - positif(BAFORESTV + BAFORESTC + BAFORESTP + LIG13 + DEFANTBAF + 0)) * LIGBAMTOT ;

LIGBAMICF2 = (1 - LIGBAMICF1) * LIG12 ;

BAFORESTOT = (BAFORESTV + BAFORESTC + BAFORESTP) * (1 - positif(IBAMICF + LIG13 + DEFANTBAF)) ;

regle 901070:
application :  iliad ;

4BAQLV = positif(4BACREV) ;
4BAQLC = positif(4BACREC) ;
4BAQLP = positif(4BACREP) ;

regle 901080:
application : iliad  ;

LIG134V = positif(present(BACREV) + present(BACDEV)+ present(4BACREV)
                  + present(BAFPVV) + present(COD5AK) 
		  + present(COD5XB) + present(COD5XN) + present(COD5XO)) ;

LIG134C = positif(present(BACREC) + present(BACDEC) + present(4BACREC)
                  + present(BAFPVC) + present(COD5BK) 
		  + present(COD5YB) + present(COD5YN) + present(COD5YO)) ;

LIG134P = positif(present(BACREP) + present(BACDEP)  + present(4BACREP)
                  + present(BAFPVP) + present(COD5CK) 
		  + present(COD5ZB) + present(COD5ZN) + present(COD5ZO)) ;

LIG134 = positif(LIG134V + LIG134C + LIG134P + present(DAGRI6) + present(DAGRI5) + present(DAGRI4) + present(DAGRI3) + present(DAGRI2) + present(DAGRI1)) 
	 * (1 - LIGBAMICF1) * (1 - BAFORESTOT) * LIG12 ;

LIGDBAIP = positif(DEFANTBAF + 0) * LIG12 ;

BAHQTAVIS = (1 - positif_ou_nul(BAHQT)) * positif(SHBA + (REVTP - BA1) + REVQTOTQHT - SEUIL_IMPDEFBA) ;

LIGBAHQ = positif(LIG13 + present(DAGRI6) + present(DAGRI5) + present(DAGRI4) + present(DAGRI3) + present(DAGRI2) + present(DAGRI1) + (LIGCBOIS * LIGBAMTOT)) * LIG12 ;

LIGBAQ = positif(present(4BACREV) + present(4BACREC) + present(4BACREP)) * LIG2 ;

regle 901090:
application : iliad  ;

LIG136 = positif(BAQNODEFV + DEFANTBAQV + BAQNODEFC + DEFANTBAQC + BAQNODEFP + DEFANTBAQP) * LIG12 ;

LIG138 = positif(BATMARGTOT) * LIG12 ;

regle 901100:
application : iliad ;

LIGBICPRO = positif(BICNOV + COD5DF + CODCKC + BICDNV 
                    + BICNOC + COD5EF + CODCLC + BICDNC 
		    + BICNOP + COD5FF + CODCMC + BICDNP ) * LIG02 ;

LIGBICPROQ = positif(CODCKC + CODCLC + CODCMC ) * LIG02 ;

LIGMICPV = positif(MIBNPPVV + MIBNPPVC + MIBNPPVP) * LIG02 ;

LIGMICMV = positif(MIBNPDCT + COD5RZ + COD5SZ) * LIG02 ;

LIGBICNP = positif(BICREV + COD5UR + CODCNC + BICDEV 
                   + BICREC + COD5VR + CODCOC + BICDEC 
                   + BICREP + COD5WR + CODCPC + BICDEP ) * LIG02 ;

LIGBICNPQ = positif(CODCNC + CODCOC + CODCPC ) * LIG02 ;

LIG_DEFNPI = positif(present(DEFBIC6) + present(DEFBIC5) + present(DEFBIC4) 
                     + present(DEFBIC3) + present(DEFBIC2) + present(DEFBIC1)) * LIG02 ;

LIGMLOC = positif(present(MIBMEUV) + present(MIBMEUC) + present(MIBMEUP)
		  + present(MIBGITEV) + present(MIBGITEC) + present(MIBGITEP)
		  + present(LOCGITV) + present(LOCGITC) + present(LOCGITP)
		  + present(COD5NW) + present(COD5OW) + present(COD5PW) )
	  * LIG02 ;
 
LIGMLOCAB = positif(MLOCABV + MLOCABC + MLOCABP) * LIG02 ; 

LIGMIBPV = positif(MIBPVV + MIBPVC + MIBPVP) * LIG02 ;

LIGMIBMV = positif(BICPMVCTV + BICPMVCTC + BICPMVCTP) * LIG02 ;

LIGBNCPV = positif(BNCPROPVV + BNCPROPVC + BNCPROPVP) * LIG02 ;

LIGBNCMV = positif(BNCPMVCTV + BNCPMVCTC + BNCPMVCTP) * LIG02 ;

LIGBNCNPPV = positif(BNCNPPVV + BNCNPPVC + BNCNPPVP) * LIG02 ;

LIGBNCNPMV = positif(BNCNPDCT + COD5LD + COD5MD) * LIG02 ;

LIGSPENETPF = positif(BNCPROV + BNCPROC + BNCPROP + BNCPROPVV + BNCPROPVC + BNCPROPVP + BNCPMVCTV + BNCPMVCTC + BNCPMVCTP) * LIG02 ;

LIGBNCPHQ = positif(present(BNCREV) + present(COD5XJ) + present(BNCDEV)
                    +present(BNCREC) + present(COD5YJ) + present(BNCDEC)
                    +present(BNCREP) + present(COD5ZJ) + present(BNCDEP)) * LIG2 ;

LIGBNCAFFQ = positif(present(CODCQC) + present(CODCRC) + present(CODCSC) ) * LIG02 ;

LIGBNCAFF = positif(LIGBNCPHQ + (LIGSPENETPF * LIGBNCAFFQ)) * LIG02 ;

LIGNPLOC = positif(LOCNPCGAV + LOCNPCGAC + LOCNPCGAPAC + LOCDEFNPCGAV + LOCDEFNPCGAC + LOCDEFNPCGAPAC
		   + LOCGITCV + LOCGITCC + LOCGITCP  
		   + COD5EY + COD5FY  + COD5GY 
		   + COD5WE + COD5XE  + COD5YE )
		   * LIG02 ;

LIGNPLOCF = positif(LOCNPCGAV + LOCNPCGAC + LOCNPCGAPAC + LOCDEFNPCGAV + LOCDEFNPCGAC + LOCDEFNPCGAPAC
                   + LNPRODEF10 + LNPRODEF9 + LNPRODEF8 + LNPRODEF7 + LNPRODEF6 + LNPRODEF5
                   + LNPRODEF4 + LNPRODEF3 + LNPRODEF2 + LNPRODEF1
		   + LOCGITCV + LOCGITCC + LOCGITCP  
		   + COD5EY + COD5FY + COD5GY 
		   + COD5WE + COD5XE + COD5YE )
		   * LIG02 ;

LIGDEFNPLOC = positif(TOTDEFLOCNP) * LIG2 ;

LIGDFLOCNPF = positif(DEFLOCNPF) * LIG2 ;

LIGLOCNSEUL = positif(LIGNPLOC + LIGDEFNPLOC + LIGNPLOCF) * LIG2 ;

LIGLOCSEUL = (1 - positif(LIGNPLOC + LIGDEFNPLOC + LIGNPLOCF)) * LIG2 ;

regle 901110:
application : iliad  ;

ABICHQF = max(0 , BICHQF) ;

LIG_BICNPF = positif(LIGBICNP + LIG_DEFNPI) * (1 - LIGMIBNPPOS) * LIG02 ;

LIGBICNPFQ = positif(present(CODCNC) + present(CODCOC) + present(CODCPC) ) * LIG02 ;

regle 901120:
application : iliad  ;

BNCNF = positif(present(BNCREV) + present(COD5XJ) + present(CODCQC) + present(BNCDEV)
                    +present(BNCREC) + present(COD5YJ) + present(CODCRC) + present(BNCDEC)
		    +present(BNCREP) + present(COD5ZJ) + present(CODCSC) + present(BNCDEP)) ;

LIGBNCNF = 1 - BNCNF ;

LIGNOCEP = (present(NOCEPV) + present(NOCEPC) + present(NOCEPP)) * LIG02 ;

NOCEPIMPN = max(0 , NOCEPIMP) ;

regle 901121:
application : iliad  ;

LIGNOCEPIMP = positif(present(BNCAABV) + present(COD5XS) + present(BNCAADV) 
                      + present(BNCAABC) + present(COD5YS) + present(BNCAADC) 
		      + present(BNCAABP) + present(COD5ZS) + present(BNCAADP)
		      + present(BNCNPPVV) + present(BNCNPPVC) + present(BNCNPPVP) + (present(BNCNPDCT) + present(COD5LD) + present(COD5MD)) * LIGNOCEP)
              * (1 - (null(BNCNPHQCV) * null(BNCNPHQCC) * null(BNCNPHQCP))) * (1 - LIGSPENPPOS) * LIG02 ;

LIGNOCEPIMPH = LIGNOCEPIMP + LIGDIDAB * (1 - LIGNOCEPIMP) * (1 - LIGSPENPPOS) * LIG02 ;

LIGNOCEPIMPQ = positif(present(CODCJG) + present(CODCRF) + present(CODCSF) ) * LIG02 ;

regle 901122:
application : iliad  ;

LIGDAB = positif(present(DABNCNP6) + present(DABNCNP5) + present(DABNCNP4)
		 + present(DABNCNP3) + present(DABNCNP2) + present(DABNCNP1)) 
		* LIG02 ;

LIGDIDAB = positif_ou_nul(DIDABNCNP) * LIGDAB * LIG02 ;

LIGDEFBNCNPF = positif(DEFBNCNPF) * LIG2 ;
LIGDEFBANIF  = positif(DEFBANIF) * LIG2 ;
LIGDEFBICNPF = positif(DEFBICNPF) * LIG2 ;
LIGDEFRFNONI = positif(DEFRFNONI) * LIG2 ;

regle 901130:
application :  iliad ;

LIG910 = positif((present(RCMABD) + present(RCMTNC) + present(RCMAV) + present(RCMHAD) + present(RCMHAB) 
                  + present(REGPRIV) + present(COD2TT) + present(COD2VV) + present(COD2WW) + present(COD2YY) 
		  + present(COD2ZZ) + present(COD2VN) + present(COD2VO) + present(COD2VP) + present(COD2TQ)+ present(COD2TZ)) * positif(COD2OP)

		 + (present(RCMAV) + present(COD2YY) + present(COD2VN) ) * (1 - positif(COD2OP))
		 + ((1 - present(BRCMQ)) * present(RCMFR))) * LIG02 ;

LIG2OP = positif(COD2OP + 0) * LIG2 ;

regle 901140: 
application : iliad  ;

LIG1130 = positif(present(REPSOF)) * LIG02 ;

regle 901150:
application : iliad  ;

LIG1950 = INDREV1A8 * positif_ou_nul(REVKIRE) * (1 - positif_ou_nul(IND_TDR)) * LIG2 ;

regle 901160:
application :  iliad ;

LIG29 = positif(present(RFORDI) + present(RFDHIS) + present(RFDANT) + present(RFDORD)) 
        * (1 - LIG30) * IND_REV * LIG12 ;

regle 901170:
application : iliad  ;

LIG30 = positif(RFMIC) * LIG12 ;
LIGREVRF = positif(present(FONCI) + present(REAMOR) + present(CODRBE)) * LIG12 ;

regle 901180:
application :  iliad ;

LIG49 =  INDREV1A8 * positif_ou_nul(DRBG) * LIG2 ;

regle 901190:
application : iliad  ;

LIG52 = positif(present(CHENF1) + present(CHENF2) + present(CHENF3) + present(CHENF4) +present(COD6GX)
                + present(NCHENF1) + present(NCHENF2) + present(NCHENF3) + present(NCHENF4)+present(COD6EX)) 
	* LIG12 ;

regle 901200:
application : iliad  ;

LIG58 = positif(present(PAAV) + present(PAAP)) * LIG52 * LIG12 ;

regle 901210:
application : iliad  ;

LIG585 = positif(present(PAAP) + present(PAAV)) * (1 - LIG52) * LIG12 ;

LIG65 = positif(LIG52 + LIG58 + LIG585 
                + present(CHRFAC) + present(CHNFAC) + present(CHRDED) + present(COD6DR)
		+ present(COD6DG) + present(DPERPC) + present(DPERPP) + present(DPERPV)
                + LIGREPAR) 
       * LIG12 ;

regle 901220:
application : iliad  ;

LIGDPREC = present(CHRFAC) * LIG12 ;

LIGDFACC = (positif(20-V_NOTRAIT+0) * positif(DFACC)
           + (1 - positif(20-V_NOTRAIT+0)) * present(DFACC)) * LIG12 ;

regle 901230:
application :  iliad ;

LIG1390 = positif(positif(ABMAR) + (1 - positif(RI1)) * positif(V_0DN)) * LIG12 ;

regle 901240:
application :  iliad ;

LIG68 = INDREV1A8 * (1 - positif(abs(RNIDF))) * LIG2 ;

regle 901250:
application : iliad  ;

LIGTTPVQ = positif(
                   positif(CARTSV) + positif(CARTSC) + positif(CARTSP1) + positif(CARTSP2)+ positif(CARTSP3)+ positif(CARTSP4)
                   + positif(REMPLAV) + positif(REMPLAC) + positif(REMPLAP1) + positif(REMPLAP2)+ positif(REMPLAP3)+ positif(REMPLAP4)
                   + positif(PEBFV) + positif(PEBFC) + positif(PEBF1) + positif(PEBF2)+ positif(PEBF3)+ positif(PEBF4)
                   + positif(CARPEV) + positif(CARPEC) + positif(CARPEP1) + positif(CARPEP2)+ positif(CARPEP3)+ positif(CARPEP4)
                   + positif(CODRAZ) + positif(CODRBZ) + positif(CODRCZ) + positif(CODRDZ) + positif(CODREZ) + positif(CODRFZ) 
                   + positif(PENSALV) + positif(PENSALC) + positif(PENSALP1) + positif(PENSALP2)+ positif(PENSALP3)+ positif(PENSALP4)
                   + positif(RENTAX) + positif(RENTAX5) + positif(RENTAX6) + positif(RENTAX7)
                   + positif(REVACT) + positif(REVPEA) + positif(PROVIE) + positif(DISQUO) + positif(RESTUC) + positif(INTERE) + positif(CODRYY)
                   + positif(FONCI) + positif(REAMOR) + positif(CODRBE)
                   + positif(4BACREV) + positif(4BACREC) + positif(4BACREP) 
                   + positif(CODDAJ) + positif(CODEAJ) + positif(CODDBJ)+ positif(CODEBJ) + positif(CODRVG)
		   + positif(CODRAF) + positif(CODRAG) + positif(CODRBF) + positif(CODRBG) + positif(CODRCF) + positif(CODRCG)
		   + positif(CODRDF) + positif(CODRDG) + positif(CODREF) + positif(CODRGG) + positif(CODRFF) + positif(CODRFG)
		   + positif(CODRAL) + positif(CODRAM) + positif(CODRBL) + positif(CODRBM) + positif(CODRCL) + positif(CODRCM)
		   + positif(CODRDL) + positif(CODRDM) + positif(CODREL) + positif(CODREM) + positif(CODRFL) + positif(CODRFM)
		   + positif(CODRAR) + positif(CODRBR) + positif(CODRCR) + positif(CODRDR)
		   + positif(CODCJG) + positif(CODCKC) + positif(CODCLC) + positif(CODCMC)
		   + positif(CODCNC) + positif(CODCOC) 
		   + positif(CODCPC) + positif(CODCQC) + positif(CODCRC)
		   + positif(CODCRF) + positif(CODCSC) + positif(CODCSF) 
		   + positif(CODRUA) + positif(CODRSL) + positif(CODRVA)
		   + positif(CODRAI) + positif(CODRBI) + positif(CODRCK)
                  ) * LIG12 ;

regle 901260:
application :  iliad ;

LIGIMPTR = positif(RCMIMPTR) * LIG02 ;

LIGBPTP10 = positif(BPTP10) * LIG02 ;

LIG1430 = positif(BPTP3) * LIG02 ;

LIG1431 = positif(BPTP18) * LIG02 ;

LIG1432 = positif(BPT19) * LIG02 ;

regle 901270:
application :  iliad ;

LIG815 = V_EAD * positif(BPTPD) * LIG02 ;
LIG816 = V_EAG * positif(BPTPG) * LIG02 ;
LIGTXF24 = positif(BPT24) * LIG02 ;
LIGTXF30 = positif_ou_nul(BPCOPTV + BPVSK) * LIG02 ;
LIGTXF40 = positif(BPV40V + 0) * LIG02 ;

regle 901290:
application :  iliad ;
 
LIG81 = positif(present(RDDOUP) + present(DONAUTRE) + present(REPDON03) + present(REPDON04) 
                + present(REPDON05) + present(REPDON06) + present(REPDON07) + present(COD7UH)
                + positif(EXCEDANTA) + positif(EXCEDANTD) + positif(EXCEDANTO))
        * LIG12 ;

LIGCRDIE = positif(REGCI+IND8XRAUTO) * LIG12 ;

regle 901300:
application : iliad  ;

LIG1500 = positif((positif(IPMOND) * positif(present(IPTEFP)+positif(VARIPTEFP)*present(DEFZU))) + positif(INDTEFF) * positif(TEFFREVTOT)) 
	      * (1 - positif(DEFRIMOND)) * CNRLIG12 ;

LIG1510 = positif((positif(IPMOND) * present(IPTEFN)) + positif(INDTEFF) * (1 - positif(TEFFREVTOT))) 
	      * (1 - positif(DEFRIMOND)) * CNRLIG12 ;

LIG1500YT = positif((positif(IPMOND) * positif(present(IPTEFP)+positif(VARIPTEFP)*present(DEFZU))) + positif(INDTEFF) * positif(TEFFREVTOT)) 
	     * positif(positif(max(0,IPTEFP+DEFZU-IPTEFN))+positif(max(0,RMOND+DEFZU-DMOND))) * positif(DEFRIMOND) * CNRLIG12 ;

LIG1510YT =  positif(null(max(0,RMOND+DEFZU-DMOND))+null(max(0,IPTEFP+DEFZU-IPTEFN))) * positif(DEFRIMOND) * CNRLIG12 ;

regle 901310:
application : iliad  ;

LIG1522 = (1 - present(IND_TDR)) * (1 - INDTXMIN) * (1 - INDTXMOY) * V_CNR * LIG2 ;

regle 901320:
application :  iliad ;

LIG1523 = (1 - present(IND_TDR)) * LIG2 ;

regle 901330:
application : iliad  ;

LIG75 = (1 - INDTXMIN) * (1 - INDTXMOY) * (1 - (LIG1500+ LIG1500YT)) * (1 - (LIG1510+ LIG1510YT)) * INDREV1A8 * LIG2 ;

LIG1545 = (1 - present(IND_TDR)) * INDTXMIN * positif(IND_REV) * LIG2 ;

LIG1760 = (1 - present(IND_TDR)) * INDTXMOY * LIG2 ;

LIG1546 = positif(PRODOM + PROGUY) * (1 - positif(V_EAD + V_EAG)) * LIG2 ;

LIG1550 = (1 - present(IND_TDR)) * INDTXMOY * LIG2 ;

LIG74 = (1 - INDTXMIN) * positif(LIG1500 + LIG1510 + LIG1500YT + LIG1510YT) * LIG2 ;

LIGBAMARG = positif(BATMARGTOT) * (1 - present(IND_TDR)) * LIG138 * LIG2 ;

regle 901340:
application :  iliad ;

LIG80 = positif(present(RDREP) + present(DONETRAN)) * LIG12 ;
LIGDONDJ = positif(DDONDJ) * LIG12 ;
LIGDONDO = positif(DDONDO) * LIG12 ;

regle 901350:
application : iliad  ;

LIGRSOCREPR = positif(present(RSOCREPRISE)) * LIG12 ;

regle 901360:
application :  iliad ;

LIG1740 = positif(RECOMP) * LIG2 ;

regle 901370:
application :  iliad ;

LIG1780 = positif(RDCOM + NBACT) * LIG12 ;

regle 901380:
application :  iliad ;

LIG98B = positif(LIG80 + LIGDONDJ + LIGDONDO + LIGFIPC + LIGFIPDOM 
                 + LIGDUFTOT + LIGPINTOT + LIGNORMTOT + LIGPENTY + LIGPMEJEI + COD7GW
                 + LIGREDAGRI + LIGFORET + LIGRESTIMO + LIGRESTIMO1 
	         + LIGCINE + LIGPRESSE + LIGRSOCREPR + LIGLOCANAH
	         + present(PRESCOMP2000) + present(RDPRESREPORT) + present(FCPI) 
		 + present(DSOUFIP) + LIGRIRENOV 
		 + present(DHEBE) + present(DSURV)
	         + LIGLOGDOM + LIGREHAB + LIGRESTREP
		 + LIG1780 + LIG2040 + LIG81 + LIGCRDIE
                 + LIGLOGSOC + LIGDOMSOC1 
		 + LIGCELSOM1 + LIGCELSOM2 + LIGCELSOM3 + LIGCELSOM4
		 + LIGCELSOM5 + LIGCELSOM6 + LIGCELSOM7 + LIGCELSOM8 + LIGCELSOM9
		 + LIGILMNP1 + LIGILMNP3 + LIGILMNP4 + LIGRPTZM
		 + present(DNOUV) + LIGLOCENT + LIGCOLENT + LIGRIDOMPRO)
           * LIG12 ;

LIGRED = LIG98B * (1 - positif(RIDEFRI)) * LIG12 ;

LIGREDYT = LIG98B * positif(RIDEFRI) * LIG12 ;

regle 901390:
application :  iliad ;

LIG1820 = positif(ABADO + ABAGU + RECOMP) * LIG2 ;

LIGIDRS = positif(IDRS4) * positif(LIGRED + LIGREDYT) ;

regle 901400:
application : iliad  ;

LIG106 = positif(RETIR) * LIG2 ;
LIGINRTAX = positif(RETTAXA) * LIG2 ;
LIG10622 = positif(RETIR2224) * LIG2 ;
LIGINRTAX22 = positif(RETTAXA2224) * LIG2 ;
ZIG_INT22 = positif(RETCS2224 + RETPS2224 + RETRD2224) * LIG2 ;

LIGINRPCAP = positif(RETPCAP) * LIG2 ;
LIGINRPCAP2 = positif(RETPCAP2224) * LIG2 ;

LIGINRHAUT = positif(RETHAUTREV) * LIG2 ;
LIGINRHAUT2 = positif(RETCHR2224) * LIG2 ;

regle 901410:
application : iliad  ;

LIG_172810 = positif(NMAJ1) ;

LIGTAXA17281 = positif(NMAJTAXA1) ;

LIGPCAP17281 = positif(NMAJPCAP1) ;

LIGCHR17281 = positif(NMAJCHR1) ;

LIG_NMAJ1 = positif(NMAJ1) * LIG2 ;
LIG_NMAJ3 = positif(NMAJ3) * LIG2 ;
LIG_NMAJ4 = positif(NMAJ4) * LIG2 ;

LIGNMAJTAXA1 = positif(NMAJTAXA1) * LIG2 ;
LIGNMAJTAXA3 = positif(NMAJTAXA3) * LIG2 ;
LIGNMAJTAXA4 = positif(NMAJTAXA4) * LIG2 ;

LIGNMAJPCAP1 = positif(NMAJPCAP1) * LIG2 ;
LIGNMAJPCAP3 = positif(NMAJPCAP3) * LIG2 ;
LIGNMAJPCAP4 = positif(NMAJPCAP4) * LIG2 ;

LIGNMAJCHR1 = positif(NMAJCHR1) * LIG2 ;
LIGNMAJCHR3 = positif(NMAJCHR3) * LIG2 ;
LIGNMAJCHR4 = positif(NMAJCHR4) * LIG2 ;

regle 901420:
application :  iliad ;

LIG109 = positif(LIGIPSOUR + LIGIPAE + LIGPVETR + LIGCIGLO + LIGCICAP + LIGREGCI + LIGCICDHR + LIGMECENAT + LIGCORSE 
                 + LIG2305 + LIGEMPLOI + LIGCI2CK + LIGBPLIB + LIGCIHJA + LIGCIGE + LIGCITEC + LIGCIVHELEC + LIGCICA 
		 + LIGCIGARD + LIG82 + LIGSALDOM + LIGCOTFOR + LIGCIRFOR + LIGCIFORET + LIGCREFAM + LIGCOD8WK + LIGCREBIO + LIGCREGLY + LIGCREHVE
		 + LIGPRESINT + LIGCREFORM + LIGCONGA + LIGMETART + LIGCOD8TE + LIGCOD8CV + LIGVERSLIB) 
         * LIG12 ;

LIGCRED1 = positif(LIGPVETR + LIGCICAP + LIGREGCI + LIGCICDHR + LIGCIGLO + 0) 
	   * (1 - positif(LIGIPSOUR + LIGIPAE + LIGMECENAT + LIGCORSE + LIG2305 + LIGEMPLOI + LIGCI2CK + LIGBPLIB + LIGCIHJA 
                          + LIGCIGE + LIGCICA + LIGCIGARD + LIG82 + LIGSALDOM + LIGCOTFOR + LIGCIRFOR + LIGCIFORET + LIGCREFAM + LIGCOD8WK 
                          + LIGCREBIO + LIGCREGLY + LIGCREHVE + LIGPRESINT + LIGCONGA + LIGMETART + LIGCREFORM + LIGCOD8TE + LIGCOD8CV + LIGVERSLIB + LIGCITEC + LIGCIVHELEC + 0))
	   * LIG12 ;

LIGCRED2 = (1 - positif(LIGPVETR + LIGCICAP + LIGREGCI + LIGCICDHR + LIGCIGLO + 0)) 
	   * positif(LIGIPSOUR + LIGIPAE + LIGMECENAT + LIGCORSE + LIG2305 + LIGEMPLOI + LIGCI2CK + LIGBPLIB + LIGCIHJA 
	             + LIGCIGE + LIGCICA + LIGCIGARD + LIG82 + LIGSALDOM + LIGCOTFOR + LIGCIRFOR + LIGCIFORET + LIGCREFAM + LIGCOD8WK 
                     + LIGCREBIO + LIGCREGLY + LIGCREHVE + LIGPRESINT + LIGCONGA + LIGMETART + LIGCREFORM + LIGCOD8TE + LIGCOD8CV + LIGVERSLIB + LIGCITEC + LIGCIVHELEC + 0)
	   * LIG12 ;

LIGCRED3 = positif(LIGPVETR + LIGCICAP + LIGREGCI + LIGCICDHR + LIGCIGLO + 0) 
	   * positif(LIGIPSOUR + LIGIPAE + LIGMECENAT + LIGCORSE + LIG2305 + LIGEMPLOI + LIGCI2CK + LIGBPLIB + LIGCIHJA 
	             + LIGCIGE + LIGCICA + LIGCIGARD + LIG82 + LIGSALDOM + LIGCOTFOR + LIGCIRFOR + LIGCIFORET + LIGCREFAM + LIGCOD8WK 
                     + LIGCREBIO + LIGCREGLY + LIGCREHVE + LIGPRESINT + LIGCONGA + LIGMETART + LIGCREFORM + LIGCOD8TE + LIGCOD8CV + LIGVERSLIB + LIGCITEC + LIGCIVHELEC + 0)
           * LIG12 ;

regle 901430:
application :  iliad ;

LIGIPSOUR = positif(IPSOUR) * LIG12 ;
LIGIPAE = positif(IPAE) * LIG12 ;
LIGPVETR = positif(present(CIIMPPRO) + present(CIIMPPRO2) + present(COD8XX) + present(COD8XV)) * LIG12 ;
LIGCICAP = present(PRELIBXT) * LIG12 ;
LIGREGCI = positif(positif(REGCIAUTO + CIIMPPRO) + present(COD8XY)) * positif(CICHR) * LIG12 ;
LIGCICDHR = positif(CICDHR) ;
LIGCIGLO = positif(present(COD8XF) + present(COD8XG) + present(COD8XH)) * LIG12 ;

LIGMECENAT = present(RDMECENAT) * LIG12 ;
LIGCORSE = positif(present(CIINVCORSE) + present(IPREPCORSE) + present(CICORSENOW)) * LIG12 ;
LIG2305 = positif(DIAVF2) * LIG12 ;
LIGEMPLOI = positif(COD8UW + COD8TL) * LIG12 ;
LIGCI2CK = positif(COD2CK) * LIG12 ;
LIGBPLIB = (present(RCMLIB) ) * LIG02 ;
LIGCIHJA = positif(CODHJA) * LIG12 ;
LIGCIGE = positif(RDTECH + COD7WI) * LIG12 ;
LIGCICA = positif(BAILOC98) * LIG12 ;
LIGCIGARD = positif(DGARD) * LIG12 ;
LIG82 = positif(present(RDSYVO) + present(RDSYCJ) + present(RDSYPP) ) * LIG12 ;
LIGSALDOM = present(CREAIDE) * LIG12 ;
LIGCOTFOR = positif(COTFORET) * LIG12 ; 
LIGCIRFOR = positif(RDFOREST) * LIG12 ; 
LIGCIFORET = positif(BDCIFORET) * LIG12 ;
LIGCREFAM = positif(CREFAM) * LIG12 ;
LIGCOD8WK = positif(COD8WK) * LIG12 ;
LIGCOD8CV = positif(COD8CV) * LIG12 ;
LIGCREBIO = positif(CREAGRIBIO) * LIG12 ;
LIGCREGLY = positif(CREAGRIGLY) * LIG12 ;
LIGCREHVE = positif(CREAGRIHVE) * LIG12 ;
LIGPRESINT = positif(PRESINTER) * LIG12 ;
LIGCONGA = positif(CRECONGAGRI) * LIG12 ;
LIGMETART = positif(CREARTS) * LIG12 ;
LIGCREFORM = positif(CREFORMCHENT) * LIG12 ;
LIGVERSLIB = positif(AUTOVERSLIB) * LIG12 ;
LIGCOD8TE = positif(COD8TE) * LIG12 ;
LIGCITEC = positif(DTEC) * LIG12 ;
LIGCIVHELEC = positif(BDCIVHELEC) * LIG12 ;

regle 901445:
application :  iliad ;

CREAGRIGLY = COD8WG ;
CREAGRIHVE = COD8WH ;
regle 901440:
application :  iliad ;

LIGBRAS = positif(BRAS) * LIG12 ;
LIGNRBASE = positif(present(NRINET) + present(NRBASE)) * LIG12 ;
LIGBASRET = positif(present(IMPRET) + present(BASRET)) * LIG12 ;

regle 901450:
application : iliad  ;

LIGAVFISC = positif(AVFISCOPTER) * LIG12 ;

regle 901460:
application :  iliad ;

LIG2040 = positif(DNBE + RNBE + RRETU) * LIG12 ;

regle 901470:
application : iliad  ;

LIGRDCSG = positif(positif(V_BTCSGDED) + present(DCSG) + present(RCMSOC) + present(COD2DF)) * LIG12 ;

regle 901480:
application :  iliad ;

LIGTAXANET = positif((present(CESSASSV) + present(CESSASSC)) * INDREV1A8 + TAXANTAFF) * LIG12 ;

LIGPCAPNET = positif((present(PCAPTAXV) + present(PCAPTAXC) + present(COD1CT) + present(COD1DT) + present(COD1ET) + present(COD1FT)) * INDREV1A8 + PCAPANTAFF) * LIG12 ;

LIGHAUTNET = positif(BHAUTREV * INDREV1A8 + CHRPVIMP + HAUTREVANTAF) * LIG12 ;

LIGCDHR = positif(CDHRNET) * LIG12 * (1 - V_CNR);
LIGCDHRTEF = positif(CDHRTEFF) * positif(INDTEFF + IPTEFP) * LIG12  * (1 - V_CNR);
LIGCDHRBRUT = positif(CDHR) * (1-positif(INDTEFF + IPTEFP)) * LIG12  * (1 - V_CNR);

LIG_IRNET = positif(LIGTAXANET + LIGPCAPNET + LIGHAUTNET + LIGCDHR) * LIG2 ;

LIGIRNET = positif(IRNET * LIG_IRNET + LIGTAXANET + LIGPCAPNET + LIGHAUTNET + LIGCDHR) * LIG2 ;

regle 901490:
application :  iliad ;

LIGANNUL = positif(ANNUL2042) ;

regle 901500:
application :  iliad ;

LIG2053 = positif(V_NOTRAIT - 20) * positif(IDEGR) * positif(IREST - SEUIL_8) ;

regle 901510:
application :  iliad ;


LIG2051 = (1 - positif(20 - V_NOTRAIT)) * positif (RECUMBIS) ;

LIGBLOC = positif(V_NOTRAIT - 20) ;

LIGSUP = positif(null(V_NOTRAIT - 26) + null(V_NOTRAIT - 36) + null(V_NOTRAIT - 46) + null(V_NOTRAIT - 56) + null(V_NOTRAIT - 66)) ;

LIGDEG = positif_ou_nul(TOTIRPSANT) * positif(SEUIL_8 - RECUM) 
         * positif(null(V_NOTRAIT - 23) + null(V_NOTRAIT - 33) + null(V_NOTRAIT - 43) + null(V_NOTRAIT - 53) + null(V_NOTRAIT - 63)) ;

LIGRES = (1 - positif(TOTIRPSANT + 0)) * positif_ou_nul(RECUM - SEUIL_8)
         * positif(null(V_NOTRAIT - 23) + null(V_NOTRAIT - 33) + null(V_NOTRAIT - 43) + null(V_NOTRAIT - 53) + null(V_NOTRAIT - 63)) ;

LIGDEGRES = positif(TOTIRPSANT + 0) * positif_ou_nul(RECUM - SEUIL_8) 
            * positif(null(V_NOTRAIT - 23) + null(V_NOTRAIT - 33) + null(V_NOTRAIT - 43) + null(V_NOTRAIT - 53) + null(V_NOTRAIT - 63)) ;

LIGNEMP = positif((1 - null(NAPTEMP)) + null(NAPTEMP) * null(NAPTIR) * null(NAPCRP)) * positif(V_NOTRAIT - 20) ;

LIGEMP = (1 - LIGNEMP) * positif(V_NOTRAIT - 20) ;

LIGACPAS = positif(V_ACPASTOTPANT + V_ACPASTOTNANT + 0) * positif(V_NOTRAIT - 20) ;

LIG2052 = (1 - positif(V_ANTREIR + 0))  * positif(V_NOTRAIT - 20) ;

LIGTAXANT = APPLI_ILIAD * positif(V_NOTRAIT - 20) * positif(V_TAXANT + LIGTAXANET * positif(TAXANET))
            * (1 - LIG2051)  ;

LIGPCAPANT = APPLI_ILIAD * positif(V_NOTRAIT - 20) * positif(V_PCAPANT + LIGPCAPNET * positif(PCAPNET))
             * (1 - LIG2051)  ;

LIGHAUTANT = APPLI_ILIAD * positif(V_NOTRAIT - 20) * positif(V_CHRANT + LIGHAUTNET * positif(HAUTREVNET))
             * (1 - LIG2051)  ;

LIGANTREIR = positif(V_ANTREIR + 0) * (1 - positif(TOTCRA + 0))  * positif(V_NOTRAIT - 20) ;

LIGNANTREIR = positif(V_ANTREIR + 0) * positif(TOTCRA + 0)  * positif(V_NOTRAIT - 20) ;

LIGNONREC = positif(V_NONMERANT + 0)  * positif(V_NOTRAIT - 20) ;

LIGNONREST = positif(V_NONRESTANT + 0)  * positif(V_NOTRAIT - 20) ;

LIGIINET = LIGSUP * (positif(NAPT + 0) + null(IINETCALC)) * positif(V_NOTRAIT - 20) ;

LIGIINETC = LIGSUP * null(NAPT) * positif(IINETCALC + 0) * positif(V_NOTRAIT - 20) ;

LIGIDEGR = positif(LIGDEG + LIGDEGRES) * (positif_ou_nul(IDEGR - SEUIL_8) + null(IDEGR)) * positif(V_NOTRAIT - 20) ;

LIGIDEGRC = positif(LIGDEG + LIGDEGRES) * positif(SEUIL_8 - IDEGR) * positif(IDEGR + 0) * positif(V_NOTRAIT - 20) ;

LIGIREST = positif(LIGRES + LIGDEGRES) * (positif_ou_nul(IREST - SEUIL_8) + null(IREST)) * positif(V_NOTRAIT - 20) ;

LIGIRESTC = positif(LIGRES + LIGDEGRES) * positif(SEUIL_8 - IREST) * positif(IREST + 0) * positif(V_NOTRAIT - 20) ;



LIGNMRR = LIGIRESTC * positif(V_ANTRE - V_NONRESTANT + 0) * positif(V_NOTRAIT - 20) ;
LIGNMRS = LIGIINETC * positif(IINETCALC + 0) * positif(SEUIL_12 - IINETCALC) * (1 - positif(V_ANTRE - V_NONRESTANT)) * positif(V_NOTRAIT - 20) ;



LIGRESINF = positif(LIGIDEGRC + LIGIRESTC) * positif(V_NOTRAIT - 20) ;

regle 901530:
application :  iliad ;


LIGTAXADEG = positif(NATIMP - 71) * positif(TAXADEG) * LIG2 ;

LIGPCAPDEG = positif(NATIMP - 71) * positif(PCAPDEG) * LIG2 ;

LIGHAUTDEG = positif(NATIMP - 71) * positif(HAUTREVDEG) * LIG2 ;

regle 901540:
application : iliad ;

INDCTX = positif(null(V_NOTRAIT - 23) + null(V_NOTRAIT - 33) + null(V_NOTRAIT - 43) + null(V_NOTRAIT - 53) + null(V_NOTRAIT - 63)) ;

INDIS = positif(null(V_NOTRAIT - 14) + null(V_NOTRAIT - 16) + null(V_NOTRAIT - 26) + null(V_NOTRAIT - 36) + null(V_NOTRAIT - 46) + null(V_NOTRAIT - 56) + null(V_NOTRAIT - 66)) ;

LIG2140 = positif((null(V_CNR) * null(NATIMP - 1) * positif_ou_nul(IINET - SEUIL_12)) 
		  + (null(V_CNR - 1) * positif(null(NATIMP - 1) +  null(NATIMP)))
                  + (null(V_REGCO - 3) * positif(NRINET + 0) * positif(12 - NRINET) * positif(61 - CSTOTSSPENA)))
          * (1 - LIG2141)
          * ((((1 - INDCTX) * INDREV1A8 * (1 - (positif(IRANT)*null(NAPT)) ) * LIG2)
                + null(IINET + NAPTOTA) * null(INDREV1A8)) * positif(IND_REV) * positif(20 - V_NOTRAIT)) ;

regle 901550:
application :  iliad ;

LIG2141 = null(IAN + RPEN - IAVT + TAXASSUR + IPCAPTAXT + CHRAPRES - IRANT) 
                  * positif(IRANT)
                  * (1 - LIG2501)
		  * null(V_IND_TRAIT - 4)
		  * (1 - positif(NRINET + 0)) ;

regle 901570:
application : iliad  ;

LIG2150 = (1 - INDCTX) 
	 * positif(IREST)
         * (1 - LIG2140)
         * (1 - positif(IND_REST50))
	 * positif(20 - V_NOTRAIT)
         * LIG2 ;

regle 901590:
application :  iliad ;

LIG2171 = (1 - INDCTX) 
	 * positif(IREST)
	 * (1 - LIG2140)
         * positif(IND_REST50)  
	 * positif(20 - V_NOTRAIT)
	 * LIG2 ;

regle 901610:
application :  iliad ;

LIGRESINF50 = positif(positif(IND_REST50) * positif(IREST) 
                      + positif(RECUM) * (1 - positif_ou_nul(RECUM - SEUIL_8)))  
	      * positif(SEUIL_8 - IREST) * null(LIGRESINF) * LIG2 ;

regle 901640:
application :  iliad ;


IND_NIRED = (1 - INDCTX) * positif(null(CODINI - 3) + null(CODINI - 5) + null(CODINI - 13)) * null(IAVIM + NAPCRPAVIM - TAXASSUR + IPCAPTAXT + CHRAPRES) * null(V_CNR) ; 

regle 901650:
application :  iliad ;


IND_IRNMR = (1 - INDCTX) * null(CODINI - 8) * null(NATIMP) * null(V_CNR) ;

regle 901660:
application :  iliad ;

IND_IRINF80 = (1 - positif(INDCTX)) * (1 - positif(IREST)) * positif(null(CODINI - 9) * null(NATIMP) + null(CODINI - 99)) 
              * positif(SEUIL_12 - IRNET - TAXASSUR - IPCAPTAXT - CHRAPRES - NAPCR) * positif_ou_nul(IAVIM + NAPCRPAVIM - SEUIL_61) * null(V_CNR) ;

regle 901670:
application :  iliad ;


LIGNIIR = null(IDRS3 - IDEC)
          * null(NRINET + 0)
          * null(NATIMP)
          * null(TAXASSUR + IPCAPTAXT + CHRAPRES + NAPCRP)
          * (1 - positif(IREP))
	  * (1 - positif(IPROP))
	  * (1 - positif(IRESTIT))
	  * (1 - positif(IDEGR))
	  * (1 - positif(IMPRET))
	  * (1 - positif(NRINET))
	  * (1 - positif(AVRICIIR + AUTOVERSSUP + IMPETAL19 + IMPETAL20 + IMPETAL21 + IMPETAL22 + IMPETAL23 + COD8UA + COD8UB + CIADCREB3 
	                 + RASCTXIR + RASSALIR + RASACOIR + RASCTXCS + RASCTXPSOL + RASACOCS + RASACOPSOL + RESTITCS + RESTITPSOL))
          * (1 - LIGAUCUN)
          * (1 - LIG2141)
	  * (1 - positif(IBATMARG))
          * (1 - LIG2501)
          * (1 - LIG8FV)
          * (1 - LIGNIDB)
	  * positif(20 - V_NOTRAIT)
          * (1 - V_CNR) * LIG2 ;

LIGNIIRDEG = null(IDRS3 - IDEC)
	     * null(IAMD2)
	     * (1 - positif(IRE))
             * null(TAXASSUR + IPCAPTAXT + CHRAPRES + NAPCRP)
             * (1 - LIG2501)
	     * (1 - positif(IMPRET - SEUIL_12))
	     * (1 - positif(NRINET - SEUIL_12))
	     * positif(V_NOTRAIT - 20)
             * (1 - V_CNR) * LIG2 ;

regle 901680:
application :  iliad ;


LIGCBAIL = null(IDOM11 - DEC11)
           * (1 - positif(IAMD2))
	   * positif_ou_nul(IRPSNET - SEUIL_12)
	   * (1 - positif(AUTOVERSSUP + IMPETAL19 + IMPETAL20 + IMPETAL21 + IMPETAL22 + IMPETAL23 + COD8UA + COD8UB + IBATMARG + IMPRET + NRINET))
	   * (1 - LIGNIDB)
           * (1 - V_CNR)
           * LIG2 ;

regle 901690:
application :  iliad ;

LIGNIDB = null(IDOM11 - DEC11)
          * positif(positif(SEUIL_61 - TAXASSUR - IPCAPTAXTOT - CHRAPRES) * positif(TAXASSUR + IPCAPTAXTOT + CHRAPRES) * positif_ou_nul(NAPTIR)
	            + positif(SEUIL_61 - NAPCRP) * positif(NAPCRP)
	            + positif(SEUIL_12 - NAPTIRNET - PREVSOCNET) * positif(NAPTIRNET + PREVSOCNET))
          * null(NAPTEMPCX)		    
	  * (1 - positif(IREST))
	  * (1 - positif(IREP + IPROP + NRINET + IMPRET + IBATMARG + AUTOVERSSUP + IMPETAL19 + IMPETAL20 + IMPETAL21 + IMPETAL22 + IMPETAL23 + COD8UA + COD8UB))
          * (1 - V_CNR)
          * LIG2 ;  

regle 901700:
application :  iliad ;

LIGNINOUV = null(IDOM11 - DEC11)
            * null(IINET)
	    * positif(positif_ou_nul(TAXASSUR + IPCAPTAXT + CHRAPRES - SEUIL_61)
	              + positif_ou_nul(NAPCRP - SEUIL_61)
		      + positif(AVRICIIR + CIADCREB3 + RASSALIR + RASACOIR + RASCTXIR + RASACOPS + RASCTXPS + RESTITPS))
	    * (1 - positif(IREP + IPROP + NRINET + IMPRET + AUTOVERSSUP + IMPETAL19 + IMPETAL20 + IMPETAL21 + IMPETAL22 + IMPETAL23 + COD8UA + COD8UB + IBATMARG))
	    * (1 - positif(IREST))
	    * (1 - LIGNIDB)
	    * (1 - V_CNR)
	    * LIG2 ;

regle 901710:
application :  iliad ;


LIG400DEG = positif(IAVIM + NAPCRPAVIM)
  	    * positif (SEUIL_61 - (IAVIM + NAPCRPAVIM))
	    * null(ITRED)
	    * positif (IRNET)
	    * (1 - positif(IRNET + V_ANTREIR - SEUIL_61))
            * (1 - V_CNR)
	    * (1 - positif(IMPRET - SEUIL_12))
	    * (1 - positif(NRINET - SEUIL_12))
	    * (1 - LIGNIIRDEG)
	    * positif(V_NOTRAIT - 20)
            * LIG2 ;

regle 901730:
application :  iliad ;
	

LIGAUCUN = positif(IRPSNET + PENAPAS2) * positif(SEUIL_12 - IRPSNET - PENAPAS2) 
	   * (1 - positif(IREST))
           * (1 - LIGNIDB)
	   * (1 - positif(IMPRET))
	   * (1 - positif(NRINET))
           * (1 - V_CNR)
	   * positif(20 - V_NOTRAIT) 
	   * LIG2 ;

regle 901750:
application :  iliad ;

LIG12NMR = positif(IRPSCUM)
           * positif(SEUIL_12 - IRPSCUM)
	   * positif(V_NOTRAIT - 20)
	   * (1 - positif(IMPRET - SEUIL_12)) 
	   * (1 - positif(NRINET - SEUIL_12))
           * (1 - V_CNR) ;

regle 901760:
application :  iliad ;

LIGNIIRAF = null(IDOM11 - DEC11)
            * (1 - positif_ou_nul(IRPSNET))
	    * (1 - positif(INDNIRI + IREP + IPROP + AUTOVERSSUP + IMPETAL19 + IMPETAL20 + IMPETAL21 + IMPETAL22 + IMPETAL23 + COD8UA + COD8UB + IBATMARG))
	    * (1 - LIGNIIRDEG)
            * LIG2 ;

regle 901800:
application :  iliad ;

LIGDIPLOI = positif(INDREV1A8)
            * positif(null(NATIMP - 1) + positif(NAPTEMP))
            * positif(REVFONC) * (1 - V_CNR)
            * LIG12 ;

regle 901810:
application :  iliad ;

LIGDIPLONI = positif(INDREV1A8)
             * positif(null(NATIMP) + positif(IREST) + (1 - positif(NAPTEMP)))
             * positif(REVFONC) * (1 - V_CNR)
	     * (1 - LIGDIPLOI)
             * LIG12 ;

regle 901820:
application :  iliad ;

LIG2355 = positif (
		   IND_NI * (1 - positif(V_ANTRE)) + INDNMR1 + INDNMR2
                   + positif(NAT1BIS) *  null(NAPT) * (positif (IRNET + TAXANET + PCAPNET + HAUTREVNET))
		   + positif(SEUIL_12 - (IAN + RPEN - IAVT + TAXASSUR + IPCAPTAXT + CHRAPRES - IRANT))
				 * positif_ou_nul(IAN + RPEN - IAVT + TAXASSUR + IPCAPTAXT + CHRAPRES - IRANT) 
                  )
          * positif(INDREV1A8)
          * (1 - null(NATIMP - 1) + null(NATIMP - 1) * positif(IRANT))  
	  * (1 - LIGPS)
	  * LIG2 ;

regle 901830:
application :  iliad ;

LIGPENTY = positif(DPENTY) * LIG12 ;
LIGRVG = positif(CODRVG + CODRUA) * LIG12 ;
LIG7GW = positif(COD7GW) * LIG12 ; 
LIGPMEJEI = positif(COD7DZ + COD7CR) * LIG12 ;

regle 901840:
application :  iliad ;

LIG2380 = positif(null(NATIMP) + null(NATIMP - 21) + null(NATIMP - 70) + null(NATIMP - 91))
          * IND_SPR * positif_ou_nul(V_8ZT + CODZRE + CODZRF - RBG1) * positif(V_8ZT + CODZRE + CODZRF)
          * (1 - present(BRAS)) * (1 - present(IPSOUR))
          * V_CNR * LIG2 ;

regle 901850:
application :  iliad ;

LIG2383 = positif_ou_nul(IPSOUR * LIG1 - IAVIM - NAPCRPAVIM)
          * positif(RBG1 - V_8ZT - CODZRE - CODZRF) * present(IPSOUR) 
          * V_CNR * LIG2 ;

regle 901860:
application : iliad  ;

LIG2501 = (1 - positif(IND_REV)) * (1 - V_CNR) * LIG2 ;

LIG25012 = (1 - positif(IND_REV)) * V_CNR * LIG2 ;

LIG8FV = positif(REVFONC) * (1 - INDREV1A8) ;

regle 901870:
application :  iliad ;

LIG2503 = (1 - positif(IND_REV))
          * (1 - positif_ou_nul(IND_TDR))
          * LIG2
          * (1 - V_CNR) ;

regle 901900:
application :  iliad ;

LIG4271 = positif(V_0AB) * LIG12 ;

LIG3710 = positif(20 - V_NOTRAIT) * positif(BOOL_0AZ) * LIG12;

regle 901910:
application :  iliad ;

LIG3720 = (1 - positif(20 - V_NOTRAIT)) * (1 - LIG3730) * LIG12 ;

regle 901920:
application :  iliad ;

LIG3730 = (1 - positif(20 - V_NOTRAIT)) * positif(BOOL_0AZ) * LIG12 ;

regle 901930:
application :  iliad ;

LIG3740 = positif(INDTXMIN) * positif(IND_REV) * LIG12 ;

regle 901940:
application :  iliad ;

LIG3750 = present(V_ZDC) * null(abs(V_ZDC - 1)) * positif(IREST) * LIG12 ;

regle 901950:
application : iliad  ;

LIGPRR2 = positif(PRR2V + PRR2C + PRR2P + PRR2ZV + PRR2ZC + PRR2Z1 + PRR2Z2 + PRR2Z3 + PRR2Z4 
                  + PRR2RAL + PRR2RAM + PRR2RBL + PRR2RBM + PRR2RCL + PRR2RCM + PRR2RDL + PRR2RDM 
		  + PRR2REL + PRR2REM + PRR2RFL + PRR2RFM + PENALIMV + PENALIMC + PENALIMP + PRR2RAI + PRR2RBI + PRR2RCK + 0) * LIG2 ;

regle 901990:
application :  iliad ;

LIG062V = positif(CARPEV + CARPENBAV + PENSALV + PENSALNBV + CODRAZ + CODRAL + CODRAM + CODRAI) ;
LIG062C = positif(CARPEC + CARPENBAC + PENSALC + PENSALNBC + CODRBZ + CODRBL + CODRBM + CODRBI) ;
LIG062P = positif(somme(i=1..4: CARPEPi + CARPENBAPi) + somme(i=1..4: PENSALPi + PENSALNBPi) + CODRCZ + CODRDZ + CODREZ + CODRFZ 
                  + CODRCL + CODRCM  + CODRDL + CODRDM  + CODREL + CODREM  + CODRFL + CODRFM + CODRCK) ;

regle 902000:
application :  iliad ;

LIG066 = somme(i=1..4:PEBFi);

regle 902020:
application :  iliad ;

TSDECV = TSHALLOV + COD1PM + COD1TP + COD1NX + COD1AF + COD1AG ;
TSDECC = TSHALLOC + COD1QM + COD1UP + COD1OX + COD1BF + COD1BG ;
TSDECP = TSHALLO1 + TSHALLO2 + TSHALLO3 + TSHALLO4 + COD1CF + COD1CG
         + COD1DF + COD1DG + COD1EF + COD1EG + COD1FF + COD1FG ;

LIG_SAL = positif_ou_nul(TSDECV + TSDECC + TSDECP) * LIG02 ;

LIG_REVASS = positif_ou_nul(ALLOV + ALLOC + ALLOP) * LIG02 ;

LIGREVAC = positif_ou_nul(COD1GB + COD1HB + REVACPAC) * LIG02 ;

LIGREVEMP = positif_ou_nul(COD1AA + COD1BA + REVEMPAC) * LIG02 ;

LIGREVAAS = positif_ou_nul(COD1GF + COD1HF + REVAAPAC) * LIG02 ;

LIGREVAGA = positif_ou_nul(COD1GG + COD1HG + REVAGA) * LIG02 ;

LIGREVNEXO = positif_ou_nul(COD1GH + COD1HH + COD1IH + COD1JH + COD1KH + COD1LH) * LIG02 ;

LIGPREX = positif_ou_nul(COD1AD + COD1BD + COD1CD + COD1DD + COD1ED + COD1FD) * LIG02 ;

LIG_SALASS = positif(TSBNV + TSBNC + TSBNP + F10AV + F10AC + F10AP)
             * positif_ou_nul(LIG_SAL + LIG_REVASS + LIGREVAC + LIGREVEMP + LIGREVAAS + LIGREVAGA + LIGREVNEXO + LIGPREX - 2)
             * LIG02 ;

LIG_GATASA = positif_ou_nul(BPCOSAV + BPCOSAC + GLDGRATV + GLDGRATC) * LIG02 ;

LIGF10V = positif(F10AV + F10BV) * LIG02 ;

LIGF10C = positif(F10AC + F10BC) * LIG02 ;

LIGF10P = positif(F10AP + F10BP) * LIG02 ;

PENSDECV = PRBRV + COD1AL + COD1AM ;
PENSDECC = PRBRC + COD1BL + COD1BM ;
PENSDECP = PRBR1 + PRBR2 + PRBR3 + PRBR4 + COD1CL + COD1CM
           + COD1DL + COD1DM + COD1EL + COD1EM + COD1FL + COD1FM ;

LIGPENS = positif(PENSDECV + PENSDECC + PENSDECP) * LIG02 ;

LIGPENSQUO = positif(PRQVO + PRQCJ + PRQPC) * LIG02 ;

PNPER = COD1CI + COD1DI + COD1EI + COD1FI ;
LIGPNPER = positif(COD1AI + COD1BI + PNPER) * LIG02 ;

LIGPNPERQ = positif(CODRAI + CODRBI + CODRCK) * LIG02 ;

LIGINVQUO = positif(PRQZV + PRQZC + PRQZP) * LIG02 ;

LIGALIQUO = positif(PENSALV + PENSALC + PENSALP) * LIG02 ;

LIGFOOTQUO = positif(PEBFV + PEBFC + LIG066) * LIG02 ;

regle 902030:
application :  iliad ;


LIGRCMABT = positif(positif(COD2OP) * (present(RCMABD) + present(RCMTNC) + present(RCMAV) + present(RCMHAD) + present(RCMHAB) 
                                       + present(REGPRIV) + present(RCMFR) + present(DEFRCM) + present(DEFRCM2) + present(DEFRCM3) 
				       + present(DEFRCM4) + present(DEFRCM5) + present(DEFRCM6) + present(COD2TT) + present(COD2TZ) + present(COD2VV) 
				       + present(COD2WW) + present(COD2YY) + present(COD2ZZ) + present(COD2VN) + present(COD2VO) 
				       + present(COD2VP) + present(COD2TQ)) 
		    + (1 - positif(COD2OP)) * (present(RCMAV) + present(COD2YY) + present(COD2VN)))
             * positif(INDREV1A8) * LIG12 ;

LIG2RCMABT = positif(positif(COD2OP) *(present(REVACT) + present(REVPEA) + present(PROVIE) + present(DISQUO) + present(RESTUC) + present(INTERE) + present (CODRYY))
                    + (1 - positif(COD2OP)) * (present(REVACT) + present(CODRYY) + positif(PROVIE)))
                * positif(INDREV1A8) * LIG12 ;

LIGPV3VG = positif(PVBAR3VG) * positif(INDREV1A8) * LIG12 ;

LIGPVMTS = positif(PVMTS) * LIG12 ;

regle 902040:
application :  iliad ;


LIG_REPORT = positif(LIGRNIDF + LIGDFRCM + LIGDRFRP + LIGDEFBA
                     + LIGDLMRN + LIGDEFPLOC + LIGBNCDF + LIG2TUV + LIGR2VQR + LIGDRCVM
		     + LIGBAMVV + LIGBAMVC + LIGBAMVP
                     + somme(i=V,C,P:LIGMIBDREPi + LIGMBDREPNPi + LIGSPEDREPi + LIGSPDREPNPi)
                     + LIGREPREPAR + LIGREPREST

                     + LIGRCELZV + LIGRCELSIJ + LIGRCELRIJ
		     + LIGRCELRMN + LIGRCELRQ + LIGRCELIQ + LIGRCELMH + LIGRCELHL + LIGRCELR + LIGRCELP
		     + LIGRCELXHI + LIGRCELZAB + LIGRRCELA + LIGRRCELB + LIGRRCELC + LIGRRCELD + LIGRRCELE + LIGRRCELF 
		     + LIGRRCELG + LIGRRCELH + LIGRRCELI + LIGRRCELJ + LIGRRCELK + LIGRRCELL
                     + LIGRCODMW + LIGRCODMN
                     + LIGRCODPZ + LIGRCODMZ + LIGRCODOY 
                     + LIGREPLOC15 + LIGREPLOC12 + LIGREPLOC11 + LIGREPLOC10 + LIGREPLOC9                      
	             + LIGRPINELTOT + LIGRDNORMTOT
                     + LIGCOMP01

	             + LIGREPQKG + LIGREPCCS + LIGREPCDT + LIGREPPLB + LIGREPTBE 

                     + LIGREPCORSE + LIGRSN + LIGPLAFRSN + LIGREPDON
                     + LIGRCIF + LIGRCIFAD + LIGRCIFSIN + LIGRCIFADSN
                     + LIGPATNATR + LIGREPRECH + LIGREPCICE
		     + IMPETAL5 + LIGREPTZM
	             ) * LIG2 ;

regle 902050:
application : iliad  ;

LIGRNIDF = positif(abs(RNIDF)) * LIG12 ;
LIGRNIDF0 = positif(abs(RNIDF0)) * positif(positif(abs(RNIDF))+positif(FLAGRETARD08+FLAGDEFAUT11)) * LIG12 ;
LIGRNIDF1 = positif(abs(RNIDF1)) * positif(positif(abs(RNIDF))+positif(FLAGRETARD08+FLAGDEFAUT11)) * LIG12 ;
LIGRNIDF2 = positif(abs(RNIDF2)) * positif(positif(abs(RNIDF))+positif(FLAGRETARD08+FLAGDEFAUT11)) * LIG12 ;
LIGRNIDF3 = positif(abs(RNIDF3)) * positif(positif(abs(RNIDF))+positif(FLAGRETARD08+FLAGDEFAUT11)) * LIG12 ;
LIGRNIDF4 = positif(abs(RNIDF4)) * positif(positif(abs(RNIDF))+positif(FLAGRETARD08+FLAGDEFAUT11)) * LIG12 ;
LIGRNIDF5 = positif(abs(RNIDF5)) * positif(positif(abs(RNIDF))+positif(FLAGRETARD08+FLAGDEFAUT11)) * LIG12 ;

regle 902060:
application : iliad  ;

LIGDUFREP = positif(DDUFREP) * LIG12 ;

LIGPIREP = positif(DPIREP) * LIG12 ;

LIGNORMREP = positif(DNORMREP) * LIG12 ;

LIGPROPIREP = positif(DPROPIREP) * LIG12 ;

LIGPROPIREP1 = positif(DPROPIREP1) * LIG12 ;

LIGPROPIREP2 = positif(DPROPIREP2) * LIG12 ;

LIGPINEL = positif(DPINEL) * LIG12 ;

LIGNORMAN = positif(DNORMAN) * LIG12 ;

LIGPINELPRO = positif(DPIRRS) * LIG12 ;

LIGPINELPRO1 = positif(DPIPRO) * LIG12 ;

LIGDUFTOT = LIGDUFREP ;

LIGPINTOT = positif(LIGPIREP + LIGPROPIREP + LIGPROPIREP1 + LIGPROPIREP2 + LIGPINEL + LIGPINELPRO + LIGPINELPRO1) ;

LIGNORMTOT = positif(LIGNORMREP + LIGNORMAN) ;

regle 902070:
application : iliad  ;


LIGRNOLT = positif(RIVNOLT) * LIG12 ;
LIGRNOLT1 = LIGRNOLT * null(RIVNOLT - RIVNOLT8) ;
LIGRNOLT2 = LIGRNOLT * (1 - null(RIVNOLT - RIVNOLT8)) ;

LIGRNOLR = positif(RIVNOLR) * LIG12 ;
LIGRNOLR1 = LIGRNOLR * null(RIVNOLR - RIVNOLR8) ;
LIGRNOLR2 = LIGRNOLR * (1 - null(RIVNOLR - RIVNOLR8)) ;

LIGRNOLS = positif(RIVNOLS) * LIG12 ;
LIGRNOLS1 = LIGRNOLS * null(RIVNOLS - RIVNOLS5) ;
LIGRNOLS2 = LIGRNOLS * (1 - null(RIVNOLS - RIVNOLS5)) ;

LIGRNOLQ = positif(RIVNOLQ) * LIG12 ;
LIGRNOLQ1 = LIGRNOLQ * null(RIVNOLQ - RIVNOLQ5) ;
LIGRNOLQ2 = LIGRNOLQ * (1 - null(RIVNOLQ - RIVNOLQ5)) ;

LIGRNONR = positif(RIVNONR) * LIG12 ;
LIGRNONR1 = LIGRNONR * null(RIVNONR - RIVNONR8) ;
LIGRNONR2 = LIGRNONR * (1 - null(RIVNONR - RIVNONR8)) ;

LIGRNONP = positif(RIVNONP) * LIG12 ;
LIGRNONP1 = LIGRNONP * null(RIVNONP - RIVNONP8) ;
LIGRNONP2 = LIGRNONP * (1 - null(RIVNONP - RIVNONP8)) ;

LIGRNONQ = positif(RIVNONQ) * LIG12 ;
LIGRNONQ1 = LIGRNONQ * null(RIVNONQ - RIVNONQ5) ;
LIGRNONQ2 = LIGRNONQ * (1 - null(RIVNONQ - RIVNONQ5)) ;

LIGRNONO = positif(RIVNONO) * LIG12 ;
LIGRNONO1 = LIGRNONO * null(RIVNONO - RIVNONO5) ;
LIGRNONO2 = LIGRNONO * (1 - null(RIVNONO - RIVNONO5)) ;

LIGRNOPG = positif(RIVNOPG) * LIG12 ;
LIGRNOPG1 = LIGRNOPG * null(RIVNOPG - RIVNOPG8) ;
LIGRNOPG2 = LIGRNOPG * (1 - null(RIVNOPG - RIVNOPG8)) ;

LIGRNONN = positif(RIVNONN) * LIG12 ;
LIGRNONN1 = LIGRNONN * null(RIVNONN - RIVNONN8) ;
LIGRNONN2 = LIGRNONN * (1 - null(RIVNONN - RIVNONN8)) ;

LIGRNOPF = positif(RIVNOPF) * LIG12 ;
LIGRNOPF1 = LIGRNOPF * null(RIVNOPF - RIVNOPF5) ;
LIGRNOPF2 = LIGRNOPF * (1 - null(RIVNOPF - RIVNOPF5)) ;

LIGRNONM = positif(RIVNONM) * LIG12 ;
LIGRNONM1 = LIGRNONM * null(RIVNONM - RIVNONM5) ;
LIGRNONM2 = LIGRNONM * (1 - null(RIVNONM - RIVNONM5)) ;

LIGRNONL = positif(RIVNONL) * LIG12 ;
LIGRNONL1 = LIGRNONL * null(RIVNONL - RIVNONL8) ;
LIGRNONL2 = LIGRNONL * (1 - null(RIVNONL - RIVNONL8)) ;

LIGRNONJ = positif(RIVNONJ) * LIG12 ;
LIGRNONJ1 = LIGRNONJ * null(RIVNONJ - RIVNONJ8) ;
LIGRNONJ2 = LIGRNONJ * (1 - null(RIVNONJ - RIVNONJ8)) ;

LIGRNONK = positif(RIVNONK) * LIG12 ;
LIGRNONK1 = LIGRNONK * null(RIVNONK - RIVNONK5) ;
LIGRNONK2 = LIGRNONK * (1 - null(RIVNONK - RIVNONK5)) ;

LIGRNONI = positif(RIVNONI) * LIG12 ;
LIGRNONI1 = LIGRNONI * null(RIVNONI - RIVNONI5) ;
LIGRNONI2 = LIGRNONI * (1 - null(RIVNONI - RIVNONI5)) ;

LIGRPIVZ = positif(RIVPIVZ) * LIG12 ;
LIGRPIVZ1 = LIGRPIVZ * null(RIVPIVZ - RIVPIVZ8) ;
LIGRPIVZ2 = LIGRPIVZ * (1 - null(RIVPIVZ - RIVPIVZ8)) ;

LIGRPIVX = positif(RIVPIVX) * LIG12 ;
LIGRPIVX1 = LIGRPIVX * null(RIVPIVX - RIVPIVX8) ;
LIGRPIVX2 = LIGRPIVX * (1 - null(RIVPIVX - RIVPIVX8)) ;

LIGRPIVY = positif(RIVPIVY) * LIG12 ;
LIGRPIVY1 = LIGRPIVY * null(RIVPIVY - RIVPIVY5) ;
LIGRPIVY2 = LIGRPIVY * (1 - null(RIVPIVY - RIVPIVY5)) ;

LIGRPIVW = positif(RIVPIVW) * LIG12 ;
LIGRPIVW1 = LIGRPIVW * null(RIVPIVW - RIVPIVW5) ;
LIGRPIVW2 = LIGRPIVW * (1 - null(RIVPIVW - RIVPIVW5)) ;

LIGRPISG = positif(RIVPISG) * LIG12 ;
LIGRPISG1 = LIGRPISG * null(RIVPISG - RIVPISG8) ;
LIGRPISG2 = LIGRPISG * (1 - null(RIVPISG - RIVPISG8)) ;

LIGRPISE = positif(RIVPISE) * LIG12 ;
LIGRPISE1 = LIGRPISE * null(RIVPISE - RIVPISE8) ;
LIGRPISE2 = LIGRPISE * (1 - null(RIVPISE - RIVPISE8)) ;

LIGRPISF = positif(RIVPISF) * LIG12 ;
LIGRPISF1 = LIGRPISF * null(RIVPISF - RIVPISF5) ;
LIGRPISF2 = LIGRPISF * (1 - null(RIVPISF - RIVPISF5)) ;

LIGRPISD = positif(RIVPISD) * LIG12 ;
LIGRPISD1 = LIGRPISD * null(RIVPISD - RIVPISD5) ;
LIGRPISD2 = LIGRPISD * (1 - null(RIVPISD - RIVPISD5)) ;

LIGRPIVG = positif(RIVPIVG) * LIG12 ;
LIGRPIVG1 = LIGRPIVG * null(RIVPIVG - RIVPIVG8) ;
LIGRPIVG2 = LIGRPIVG * (1 - null(RIVPIVG - RIVPIVG8)) ;

LIGRPIVE = positif(RIVPIVE) * LIG12 ;
LIGRPIVE1 = LIGRPIVE * null(RIVPIVE - RIVPIVE8) ;
LIGRPIVE2 = LIGRPIVE * (1 - null(RIVPIVE - RIVPIVE8)) ;

LIGRPIVF = positif(RIVPIVF) * LIG12 ;
LIGRPIVF1 = LIGRPIVF * null(RIVPIVF - RIVPIVF5) ;
LIGRPIVF2 = LIGRPIVF * (1 - null(RIVPIVF - RIVPIVF5)) ;

LIGRPIVD = positif(RIVPIVD) * LIG12 ;
LIGRPIVD1 = LIGRPIVD * null(RIVPIVD - RIVPIVD5) ;
LIGRPIVD2 = LIGRPIVD * (1 - null(RIVPIVD - RIVPIVD5)) ;

LIGRPIQU = positif(RIVPIQU) * LIG12 ;
LIGRPIQU1 = LIGRPIQU * null(RIVPIQU - RIVPIQU8) ;
LIGRPIQU2 = LIGRPIQU * (1 - null(RIVPIQU - RIVPIQU8)) ;

LIGRPIQS = positif(RIVPIQS) * LIG12 ;
LIGRPIQS1 = LIGRPIQS * null(RIVPIQS - RIVPIQS8) ;
LIGRPIQS2 = LIGRPIQS * (1 - null(RIVPIQS - RIVPIQS8)) ;

LIGRPIQT = positif(RIVPIQT) * LIG12 ;
LIGRPIQT1 = LIGRPIQT * null(RIVPIQT - RIVPIQT5) ;
LIGRPIQT2 = LIGRPIQT * (1 - null(RIVPIQT - RIVPIQT5)) ;

LIGRPIQR = positif(RIVPIQR) * LIG12 ;
LIGRPIQR1 = LIGRPIQR * null(RIVPIQR - RIVPIQR5) ;
LIGRPIQR2 = LIGRPIQR * (1 - null(RIVPIQR - RIVPIQR5)) ;

LIGRPIQP = positif(RIVPIQP) * LIG12 ;
LIGRPIQP1 = LIGRPIQP * null(RIVPIQP - RIVPIQP8) ;
LIGRPIQP2 = LIGRPIQP * (1 - null(RIVPIQP - RIVPIQP8)) ;

LIGRPIQN = positif(RIVPIQN) * LIG12 ;
LIGRPIQN1 = LIGRPIQN * null(RIVPIQN - RIVPIQN8) ;
LIGRPIQN2 = LIGRPIQN * (1 - null(RIVPIQN - RIVPIQN8)) ;

LIGRPIQO = positif(RIVPIQO) * LIG12 ;
LIGRPIQO1 = LIGRPIQO * null(RIVPIQO - RIVPIQO5) ;
LIGRPIQO2 = LIGRPIQO * (1 - null(RIVPIQO - RIVPIQO5)) ;

LIGRPIQM = positif(RIVPIQM) * LIG12 ;
LIGRPIQM1 = LIGRPIQM * null(RIVPIQM - RIVPIQM5) ;
LIGRPIQM2 = LIGRPIQM * (1 - null(RIVPIQM - RIVPIQM5)) ;

LIGRPIQL = positif(RIVPIQL) * LIG12 ;
LIGRPIQL1 = LIGRPIQL * null(RIVPIQL - RIVPIQL8) ;
LIGRPIQL2 = LIGRPIQL * (1 - null(RIVPIQL - RIVPIQL8)) ;

LIGRPIQJ = positif(RIVPIQJ) * LIG12 ;
LIGRPIQJ1 = LIGRPIQJ * null(RIVPIQJ - RIVPIQJ8) ;
LIGRPIQJ2 = LIGRPIQJ * (1 - null(RIVPIQJ - RIVPIQJ8)) ;

LIGRPIQK = positif(RIVPIQK) * LIG12 ;
LIGRPIQK1 = LIGRPIQK * null(RIVPIQK - RIVPIQK5) ;
LIGRPIQK2 = LIGRPIQK * (1 - null(RIVPIQK - RIVPIQK5)) ;

LIGRPIQI = positif(RIVPIQI) * LIG12 ;
LIGRPIQI1 = LIGRPIQI * null(RIVPIQI - RIVPIQI5) ;
LIGRPIQI2 = LIGRPIQI * (1 - null(RIVPIQI - RIVPIQI5)) ;

LIGRPIRR = positif(RIVPIRR) * LIG12 ;
LIGRPIRR1 = LIGRPIRR * null(RIVPIRR - RIVPIRR2) ;
LIGRPIRR2 = LIGRPIRR * (1 - null(RIVPIRR - RIVPIRR2)) ;

LIGRPIRS = positif(RIVPIRS) * LIG12 ;
LIGRPIRS1 = LIGRPIRS * null(RIVPIRS - RIVPIRS2) ;
LIGRPIRS2 = LIGRPIRS * (1 - null(RIVPIRS - RIVPIRS2)) ;

LIGRPIRX = positif(RIVPIRX) * LIG12 ;
LIGRPIRX1 = LIGRPIRX * null(RIVPIRX - RIVPIRX2) ;
LIGRPIRX2 = LIGRPIRX * (1 - null(RIVPIRX - RIVPIRX2)) ;

LIGRPIRY = positif(RIVPIRY) * LIG12 ;
LIGRPIRY1 = LIGRPIRY * null(RIVPIRY - RIVPIRY2) ;
LIGRPIRY2 = LIGRPIRY * (1 - null(RIVPIRY - RIVPIRY2)) ;

LIGRPIWA = positif(RIVPIWA) * LIG12 ;
LIGRPIWA1 = LIGRPIWA * null(RIVPIWA - RIVPIWA2) ;
LIGRPIWA2 = LIGRPIWA * (1 - null(RIVPIWA - RIVPIWA2)) ;

LIGRPIWB = positif(RIVPIWB) * LIG12 ;
LIGRPIWB1 = LIGRPIWB * null(RIVPIWB - RIVPIWB2) ;
LIGRPIWB2 = LIGRPIWB * (1 - null(RIVPIWB - RIVPIWB2)) ;

LIGRPIXA = positif(RIVPIXA) * LIG12 ;
LIGRPIXA1 = LIGRPIXA * null(RIVPIXA - RIVPIXA2) ;
LIGRPIXA2 = LIGRPIXA * (1 - null(RIVPIXA - RIVPIXA2)) ;

LIGRPIXB = positif(RIVPIXB) * LIG12 ;
LIGRPIXB1 = LIGRPIXB * null(RIVPIXB - RIVPIXB2) ;
LIGRPIXB2 = LIGRPIXB * (1 - null(RIVPIXB - RIVPIXB2)) ;

LIGRPIRV = positif(RIVPIRV) * LIG12 ;
LIGRPIRV1 = LIGRPIRV * null(RIVPIRV - RIVPIRV2) ;
LIGRPIRV2 = LIGRPIRV * (1 - null(RIVPIRV - RIVPIRV2)) ;

LIGRPIRW = positif(RIVPIRW) * LIG12 ;
LIGRPIRW1 = LIGRPIRW * null(RIVPIRW - RIVPIRW2) ;
LIGRPIRW2 = LIGRPIRW * (1 - null(RIVPIRW - RIVPIRW2)) ;

LIGRPISH = positif(RIVPISH) * LIG12 ;
LIGRPISH1 = LIGRPISH * null(RIVPISH - RIVPISH2) ;
LIGRPISH2 = LIGRPISH * (1 - null(RIVPISH - RIVPISH2)) ;

LIGRPISI = positif(RIVPISI) * LIG12 ;
LIGRPISI1 = LIGRPISI * null(RIVPISI - RIVPISI2) ;
LIGRPISI2 = LIGRPISI * (1 - null(RIVPISI - RIVPISI2)) ;

LIGRDNORMTOT = positif(LIGRNONI + LIGRNONJ + LIGRNONK + LIGRNONL + LIGRNONM + LIGRNONN + LIGRNOPG + LIGRNOPF
                       + LIGRNONR + LIGRNONP + LIGRNONQ + LIGRNONO + LIGRNOLT + LIGRNOLR + LIGRNOLS + LIGRNOLQ) ;

LIGRPINELTOT = positif(LIGRPIVW + LIGRPIVX + LIGRPIVY + LIGRPIVZ + LIGRPISD + LIGRPISE + LIGRPISF + LIGRPISG
                       + LIGRPIVD + LIGRPIVE + LIGRPIVF + LIGRPIVG + LIGRPIQR + LIGRPIQS + LIGRPIQT + LIGRPIQU 
                       + LIGRPIQI + LIGRPIQJ + LIGRPIQK + LIGRPIQL + LIGRPIQM + LIGRPIQN + LIGRPIQO + LIGRPIQP 
		       + LIGRPIRR + LIGRPIRS + LIGRPIRX + LIGRPIRY + LIGRPIWA + LIGRPIWB + LIGRPIXA + LIGRPIXB
		       + LIGRPIRV + LIGRPIRW + LIGRPISH + LIGRPISI) ;

LIGREPTZM = positif(REPTZM) ;

regle 902080:
application : iliad  ;

LIGCELSOM1 = positif(DCELSOM1) * LIG12 ;

LIGCELSOM2 = positif(DCELSOM2) * LIG12 ;

LIGCELSOM3 = positif(DCELSOM3) * LIG12 ;

LIGCELSOM4 = positif(DCELSOM4) * LIG12 ;

LIGCELSOM5 = positif(DCELSOM5) * LIG12 ;

LIGCELSOM6 = positif(DCELSOM6) * LIG12 ;

LIGCELSOM7 = positif(DCELSOM7) * LIG12 ;

LIGCELSOM8 = positif(DCELSOM8) * LIG12 ;

LIGCELSOM9 = positif(DCELSOM9) * LIG12 ;

regle 902090:
application : iliad  ;


LIGRCELZV = positif(RIVCELZMN1) * CNRLIG12 ;
LIGZV1 = LIGRCELZV * null(RIVCELZMN1 - RIVCELZMN3) ;
LIGZV2 = LIGRCELZV * (1 - null(RIVCELZMN1 - RIVCELZMN3)) ;

LIGRCELZAB = positif(RIVCELZAB1) * CNRLIG12 ;
LIGZAB1 = LIGRCELZAB * null(RIVCELZAB1 - RIVCELZAB3) ;
LIGZAB2 = LIGRCELZAB * (1 - null(RIVCELZAB1 - RIVCELZAB3)) ;

LIGRCELSIJ = positif(RIVCELSIJ1) * CNRLIG12 ;
LIGSIJ1 = LIGRCELSIJ * null(RIVCELSIJ1 - RIVCELSIJ3) ;
LIGSIJ2 = LIGRCELSIJ * (1 - null(RIVCELSIJ1 - RIVCELSIJ3)) ;

LIGRCELRIJ = positif(RIVCELJIJ1) * CNRLIG12 ;
LIGRIJ1 = LIGRCELRIJ * null(RIVCELJIJ1 - RIVCELJIJ3) ;
LIGRIJ2 = LIGRCELRIJ * (1 - null(RIVCELJIJ1 - RIVCELJIJ3)) ;

LIGRCELRMN = positif(RIVCELRMN1) * CNRLIG12 ;
LIGRMN1 = LIGRCELRMN * null(RIVCELRMN1 - RIVCELRMN3) ;
LIGRMN2 = LIGRCELRMN * (1 - null(RIVCELRMN1 - RIVCELRMN3)) ;

LIGRCELRQ = positif(RIVCELRQ1) * CNRLIG12 ;
LIGRQ1 = LIGRCELRQ * null(RIVCELRQ1 - RIVCELRQ3) ;
LIGRQ2 = LIGRCELRQ * (1 - null(RIVCELRQ1 - RIVCELRQ3)) ;

LIGRCELIQ = positif(RIVCELIQ1) * CNRLIG12 ;
LIGIQ1 = LIGRCELIQ * null(RIVCELIQ1 - RIVCELIQ3) ;
LIGIQ2 = LIGRCELIQ * (1 - null(RIVCELIQ1 - RIVCELIQ3)) ;

LIGRCELMH = positif(RIVCELMH1) * CNRLIG12 ;
LIGMH1 = LIGRCELMH * null(RIVCELMH1 - RIVCELMH3) ;
LIGMH2 = LIGRCELMH * (1 - null(RIVCELMH1 - RIVCELMH3)) ;

LIGRCELHL = positif(RIVCELHL1) * CNRLIG12 ;
LIGHL1 = LIGRCELHL * null(RIVCELHL1 - RIVCELHL3) ;
LIGHL2 = LIGRCELHL * (1 - null(RIVCELHL1 - RIVCELHL3)) ;

LIGRCELR = positif(RIVCELR1) * CNRLIG12 ;
LIGR1 = LIGRCELR * null(RIVCELR1 - RIVCELR3) ;
LIGR2 = LIGRCELR * (1 - null(RIVCELR1 - RIVCELR3)) ;

LIGRCELP = positif(RIVCELP1) * CNRLIG12 ;
LIGP1 = LIGRCELP * null(RIVCELP1 - RIVCELP3) ;
LIGP2 = LIGRCELP * (1 - null(RIVCELP1 - RIVCELP3)) ;

LIGRCELXHI = positif(RIVCELXHI1) * CNRLIG12 ;
LIGXHI1 = LIGRCELXHI * null(RIVCELXHI1 - RIVCELXHI3) ;
LIGXHI2 = LIGRCELXHI * (1 - null(RIVCELXHI1 - RIVCELXHI3)) ;


LIGRRCELA = positif(RRCELMR + RRCELMD + RRCELML + RRCELNV + RRCELOW + RRCELA) * CNRLIG12 ;

LIGRRCELB = positif(RRCELMQ + RRCELMC + RRCELMK + RRCELNU + RRCELOV + RRCELB) * CNRLIG12 ;

LIGRRCELC = positif(RRCELMP + RRCELMB + RRCELMJ + RRCELNT + RRCELOU + RRCELC) * CNRLIG12 ;

LIGRRCELD = positif(RRCELMO + RRCELMA + RRCELMI + RRCELNS + RRCELOJ + RRCELD) * CNRLIG12 ;

LIGRRCELE = positif(RRCELZI + RRCELUU + RRCELRK + RRCELLK + RRCELIM + RRCELE) * CNRLIG12 ;

LIGRRCELF = positif(RRCELZJ + RRCELUV + RRCELRL + RRCELLL + RRCELIN + RRCELF) * CNRLIG12 ;

LIGRRCELG = positif(RRCELZK + RRCELUW + RRCELRM + RRCELLO + RRCELIO + RRCELG) * CNRLIG12 ;

LIGRRCELH = positif(RRCELZL + RRCELUX + RRCELRN + RRCELLP + RRCELIP + RRCELH) * CNRLIG12 ;

LIGRRCELI = positif(RRCELKD + RRCELPD + RRCELKU + RRCELIY + RRCELVL + RRCELI) * CNRLIG12 ;

LIGRRCELJ = positif(RRCELKC + RRCELPC + RRCELKT + RRCELIX + RRCELVK + RRCELJ) * CNRLIG12 ;

LIGRRCELK = positif(RRCELPE + RRCELKV + RRCELIZ + RRCELVO + RRCELK) * CNRLIG12 ;

LIGRRCELL = positif(RRCELHZ + RRCELIV + RRCELVJ + RRCELL) * CNRLIG12 ;

regle 902100:
application : iliad  ;


LIGPATNATR = positif(REPNATR) * LIG12 ; 

regle 902110:
application : iliad  ;


LIGREPQKG = positif(REPYE + REPYF + REPYG + REPYH + REPYI) * CNRLIG12 ;

LIGREPCCS = positif(REPGS + REPHS + REPIS + REPJS + REPKS) * CNRLIG12 ;

LIGREPCDT = positif(REPGT + REPHT + REPIT + REPJT + REPKT) * CNRLIG12 ;

LIGREPPLB = positif(REPGW + REPHW + REPIW + REPJW + REPKW) * CNRLIG12 ;

LIGREPTBE = positif(REPGU + REPHU + REPIU + REPJU + REPKU) * CNRLIG12 ;


LIGREPDON = positif(REPDONR + REPDONR1 + REPDONR2 + REPDONR3 + REPDONR4) * CNRLIG12 ;
LIGRIDOMPRO = positif(RIDOMPRO) * LIG12 ;

LIGRSN = positif(RINVPECT + RINVPECA + RINVPEDC + RINVPECU + RINVPECW + RINVPECP + RINVPECQ + RINVPECH + RINVPECO + RINVPECI) * CNRLIG12 ;
LIGRSN3 = positif(RINVPECT + RINVPECA + RINVPEDC) * CNRLIG12 ;
LIGRSN2 = positif(RINVPECU + RINVPECW) * CNRLIG12 ;
LIGRSN1 = positif(RINVPECP + RINVPECQ) * CNRLIG12 ;
LIGRSN0 = positif(RINVPECH + RINVPECO + RINVPECI) * CNRLIG12 ;

LIGPLAFRSN = positif(RPLAFPME20 + RPLAFPME21 + R2PLAFPME21 + RPLAFPME22 + RPLAFPME23 + RPLAFPME24) * CNRLIG12 ;
LIGPLAFRSN9 = positif(RPLAFPME21 + R2PLAFPME21) * CNRLIG12 ;

LIGRGWN0 = positif(RINVPEBT + RINVPEBU + RINVPEBW + RINVPEGW) * CNRLIG12 ;

regle 902120:
application :  iliad ;

EXOVOUS = present(TSASSUV) + positif(COD1GH) + positif(COD1AD) + positif(COD1PB) + positif(XETRANV) + positif(EXOCETV) + positif(COD5XA) + positif(MIBEXV) + positif(MIBNPEXV) 
          + positif(BNCPROEXV) + positif(XSPENPV) + positif(XBAV) + positif(XBIPV) + positif(XBINPV) + positif(XBNV) + positif(XBNNPV) 
          + (positif(ABICPDECV) + positif(ABNCPDECV) + positif(HONODECV)) * (1 - V_CNR)
          + positif(AGRIV) + positif(BNCCREAV) ;

EXOCJT = present(TSASSUC) + positif(COD1HH) + positif(COD1BD) + positif(COD1PC) +  positif(XETRANC) + positif(EXOCETC) + positif(COD5YA) + positif(MIBEXC) + positif(MIBNPEXC) 
         + positif(BNCPROEXC) + positif(XSPENPC) + positif(XBAC) + positif(XBIPC) + positif(XBINPC) + positif(XBNC) + positif(XBNNPC) 
         + (positif(ABICPDECC) + positif(ABNCPDECC) + positif(HONODECC)) * (1 - V_CNR)
         + positif(AGRIC) + positif(BNCCREAC) ;
 
EXOPAC = positif(COD1IH + COD1JH + COD1KH + COD1LH+ COD1CD + COD1DD + COD1ED + COD1FD+COD1PD + COD1PE + COD1PF + COD1PG) + positif(COD5ZA) + positif(MIBEXP) + positif(MIBNPEXP) + positif(BNCPROEXP) 
         + positif(XSPENPP) + positif(XBAP) + positif(XBIPP) + positif(XBINPP) + positif(XBNP) + positif(XBNNPP) 
         + (positif(ABICPDECP) + positif(ABNCPDECP) + positif(HONODECP)) * ( 1 - V_CNR )
         + positif(AGRIP) + positif(BNCCREAP) ;

regle 902130:
application :  iliad ;

LIGTITREXVCP = positif(EXOVOUS) * positif(EXOCJT) * positif(EXOPAC) * (1 - LIG2501) * LIG12 ;

LIGTITREXV = positif(EXOVOUS) * (1 - positif(EXOCJT)) * (1 - positif(EXOPAC)) * (1 - LIG2501) * LIG12 ;

LIGTITREXC =  (1 - positif(EXOVOUS)) * positif(EXOCJT) * (1 - positif(EXOPAC)) * (1 - LIG2501) * LIG12 ;

LIGTITREXP =  (1 - positif(EXOVOUS)) * (1 - positif(EXOCJT)) * positif(EXOPAC) * (1 - LIG2501) * LIG12 ;

LIGTITREXVC =  positif(EXOVOUS) * positif(EXOCJT) * (1 - positif(EXOPAC)) * (1 - LIG2501) * LIG12 ;

LIGTITREXVP =  positif(EXOVOUS) * (1 - positif(EXOCJT)) * positif(EXOPAC) * (1 - LIG2501) * LIG12 ;

LIGTITREXCP =  (1 - positif(EXOVOUS)) * positif(EXOCJT) * positif(EXOPAC) * (1 - LIG2501) * LIG12 ;

regle 902140:
application :  iliad ;

EXOCET = EXOCETC + EXOCETV ;
LIGEXOCET = positif(EXOCET) * LIG12 ;

LIGEXBA = positif(COD5XA + COD5YA + COD5ZA) * LIG12 ;
LIGMXBIP =  positif(MIBEXV + MIBEXC + MIBEXP) * LIG12 ;
LIGMXBINP =  positif(MIBNPEXV + MIBNPEXC + MIBNPEXP) * LIG12 ;
LIGSXBN =  positif(BNCPROEXV + BNCPROEXC + BNCPROEXP) * LIG12 ;
LIGXSPEN =  positif(XSPENPV + XSPENPC + XSPENPP) * LIG12 ;
LIGXBIP =  positif(XBIPV + XBIPC + XBIPP) * LIG12 ;
LIGXBINP =  positif(XBINPV + XBINPC + XBINPP) * LIG12 ;
LIGXBP =  positif(XBNV + XBNC + XBNP) * LIG12 ;
LIGXBN =  positif(XBNNPV + XBNNPC + XBNNPP) * LIG12 ;

LIGXHSUP = positif(COD1GH + COD1HH + COD1IH + COD1JH + COD1KH + COD1LH) ;
LIGPREXREP = positif(COD1AD + COD1BD + COD1CD + COD1DD + COD1ED + COD1FD) ;
CODPREX = COD1CD + COD1DD + COD1ED + COD1FD ;
PREXNET = XPRIM1 + XPRIM2 + XPRIM3 + XPRIM4;
LIGPOUEX = positif(COD1PB + COD1PC + COD1PD + COD1PE + COD1PF + COD1PG) ;
CODPOUEX = COD1PD + COD1PE + COD1PF + COD1PG ;
LIGXTSA =  positif(present(TSASSUV) + present(TSASSUC)) * LIG12 ;
LIGXIMPA =  positif(XETRANV + XETRANC) * LIG12 ;
LIGXBA =  positif(XBAV + XBAC + XBAP) * LIG12 ;

LIGBICAP = positif(ABICPDECV + ABICPDECC + ABICPDECP) * CNRLIG12 ;
LIGBNCAP = positif(ABNCPDECV + ABNCPDECC + ABNCPDECP) * CNRLIG12 ;

LIGBAPERP =  positif(BAPERPV + BAPERPC + BAPERPP) * LIG12 ;
LIGBNCCREA =  positif(BNCCREAV + BNCCREAC + BNCCREAP) * LIG12 ;

regle 902150:
application :  iliad ;


TOTPERPV = positif(PERPPLATVANT + PERPDCOTV + PERPPLAFNU2V + PERPPLAFNU1V + PERPPLAFNUNV + PERPPLAFV + PERPPLAFTV) * positif(PERPINDV + PERPINDCV) * (1 - V_CNR) ;
TOTPERPC = positif(PERPPLATCANT + PERPDCOTC + PERPPLAFNU2C + PERPPLAFNU1C + PERPPLAFNUNC + PERPPLAFC + PERPPLAFTC) * positif(PERPINDC + PERPINDCC) * (1 - V_CNR) ;
TOTPERPP = positif(PERPPLATPANT + PERPDCOTP + PERPPLAFNU2P + PERPPLAFNU1P + PERPPLAFNUNP + PERPPLAFP + PERPPLAFTP) * positif(PERPINDP + PERPINDCP) * PERP_BOOL * (1 - V_CNR) ;

TOTPERPIV = positif(PERPPLAFV + PERPPLAFCOMV + PERPDCOTV + PERPPLAFNU2V + PERPPLAFNU1V + PERPPLAFNUNV + PERPPLAFV + PERPPLAFTV) * positif(PERPINDV + PERPINDCV) * (1 - V_CNR) ;
TOTPERPIC = positif(PERPPLAFC + PERPPLAFCOMC + PERPDCOTC + PERPPLAFNU2C + PERPPLAFNU1C + PERPPLAFNUNC + PERPPLAFC + PERPPLAFTC) * positif(PERPINDC + PERPINDCC) * (1 - V_CNR) ;
TOTPERPIP = positif(PERPPLAFP + PERPPLAFCOMP + PERPDCOTP + PERPPLAFNU2P + PERPPLAFNU1P + PERPPLAFNUNP + PERPPLAFP + PERPPLAFTP) * positif(PERPINDP + PERPINDCP) * PERP_BOOL * (1 - V_CNR) ;

TOTPERPMV = positif(PERPPLATVANT + PERPPLAFMU1V + PERPDCOTV + PERPPLAFNU2V + PERPPLAFNU1V + PERPPLAFNUNV + PERPPLAFV + PERPPLAFTV) * positif(PERPINDV + PERPINDCV) * (1 - V_CNR) ;
TOTPERPMC = positif(PERPPLATCANT + PERPPLAFMU1C + PERPDCOTC + PERPPLAFNU2C + PERPPLAFNU1C + PERPPLAFNUNC + PERPPLAFC + PERPPLAFTC) * positif(PERPINDC + PERPINDCC) * (1 - V_CNR) ;
TOTPERPMP = positif(PERPPLATPANT + PERPDCOTP + PERPPLAFNU2P + PERPPLAFNU1P + PERPPLAFNUNP + PERPPLAFP + PERPPLAFTP) * positif(PERPINDP + PERPINDCP) * PERP_BOOL * (1 - V_CNR) ;

TOTPERPMIV = positif(PERPPLAFV + PERPPLAFCOMV + PERPPLAFMU1V + PERPDCOTV + PERPPLAFNU2V + PERPPLAFNU1V + PERPPLAFNUNV + PERPPLAFV + PERPPLAFTV) * positif(PERPINDV + PERPINDCV) * (1 - V_CNR) ;
TOTPERPMIC = positif(PERPPLAFC + PERPPLAFCOMC + PERPPLAFMU1C + PERPDCOTC + PERPPLAFNU2C + PERPPLAFNU1C + PERPPLAFNUNC + PERPPLAFC + PERPPLAFTC) * positif(PERPINDC + PERPINDCC) * (1 - V_CNR) ;
TOTPERPMIP = positif(PERPPLAFP + PERPPLAFCOMP + PERPDCOTP + PERPPLAFNU2P + PERPPLAFNU1P + PERPPLAFNUNP + PERPPLAFP + PERPPLAFTP) * positif(PERPINDP + PERPINDCP) * PERP_BOOL * (1 - V_CNR) ; 

LIGPERP = positif(TOTPERPV + TOTPERPC + TOTPERPP) * (1 - positif(PERPIMPATRIE + PERPMUTU)) ;
LIGPERPI = positif(TOTPERPIV + TOTPERPIC + TOTPERPIP) * positif(PERPIMPATRIE) * (1 - positif(PERPMUTU)) ;
LIGPERPM = positif(TOTPERPMV + TOTPERPMC + TOTPERPMP) * (1 - positif(PERPIMPATRIE)) * positif(PERPMUTU) ;
LIGPERPMI = positif(TOTPERPMIV + TOTPERPMIC + TOTPERPMIP) * positif(PERPIMPATRIE) * positif(PERPMUTU) ;

LIGPERP13 = positif(LIGPERP + LIGPERPM) ;

LIGPERP24 = positif(LIGPERPI + LIGPERPMI) ;

LIGPERP1234 = positif(LIGPERP + LIGPERPI + LIGPERPM + LIGPERPMI) ;

LIGPERPFAM = positif(LIGPERP + LIGPERPI + LIGPERPM + LIGPERPMI) * positif(PERPINDV + PERPINDCV) * positif(PERPINDC + PERPINDCC) * positif(PERPINDP + PERPINDCP) * LIG12 ;

LIGPERPV = positif(LIGPERP + LIGPERPI + LIGPERPM + LIGPERPMI) * positif(PERPINDV + PERPINDCV) * (1 - positif(PERPINDC + PERPINDCC)) * (1 - positif(PERPINDP + PERPINDCP)) * LIG12 ;

LIGPERPC = positif(LIGPERP + LIGPERPI + LIGPERPM + LIGPERPMI) * positif(PERPINDC + PERPINDCC) * (1 - positif(PERPINDV + PERPINDCV)) * (1 - positif(PERPINDP + PERPINDCP)) * LIG12 ;

LIGPERPP = positif(LIGPERP + LIGPERPI + LIGPERPM + LIGPERPMI) * positif(PERPINDP + PERPINDCP) * (1 - positif(PERPINDV + PERPINDCV)) * (1 - positif(PERPINDC + PERPINDCC)) * LIG12 ;

LIGPERPCP =  positif(LIGPERP + LIGPERPI + LIGPERPM + LIGPERPMI) * positif(PERPINDP + PERPINDCP) * positif(PERPINDC + PERPINDCC) * (1 - positif(PERPINDV + PERPINDCV)) * LIG12 ;

LIGPERPVP = positif(LIGPERP + LIGPERPI + LIGPERPM + LIGPERPMI) * positif(PERPINDP + PERPINDCP) * positif(PERPINDV + PERPINDCV) * (1 - positif(PERPINDC + PERPINDCC)) * LIG12 ;

LIGPERPMAR = positif(LIGPERP + LIGPERPI + LIGPERPM + LIGPERPMI) * positif(PERPINDV + PERPINDCV) * positif(PERPINDC + PERPINDCC) * (1 - positif(PERPINDP + PERPINDCP)) * LIG12 ;

regle 902160:
application :  iliad ;

ZIGTAUX1 = positif(BCSG - PVTERPS + (V_CSANT - V_CSNANT)) * (1 - (V_CNR * (1 - positif(ZIG_RF + max(0 , NPLOCNETSF))))) * LIG2 ;

ZIGTAUX4 = positif(BPSOL + (V_PSOLANT - V_PSOLNANT)) * (1 - positif(BCSG820)) * (1 - ZIGTAUX1) * LIG2 ;

ZIGTAUX5 = positif(BPSOL + (V_PSOLANT - V_PSOLNANT)) * positif(BCSG820) * (1 - ZIGTAUX1) * LIG2 ;

regle 902170:
application :  iliad ;

ZIGTITRE = positif(positif(BCSG + (V_CSANT - V_CSNANT) + BRDS + V_RDANT + BPSOL + (V_PSOLANT - V_PSOLNANT)) * (1 - (V_CNR * (1 - positif(ZIG_RF + max(0 , NPLOCNETSF))))) 
		   + positif(BCVNSAL + V_CVNANT + BCDIS + V_CDISANT) + positif(CODZRU + CODZRV)) * LIG2 ;

regle 902180:
application :  iliad ;

ZIG_RVTO = positif(RDRV) * null(3 - INDIRPS) * CNRLIG12 ;

regle 902190:
application :  iliad ;

IND_ZIGRCM = positif(present(RCMABD) + present(RCMAV) + present(RCMHAD) + present(RCMHAB)  
                     + present(RCMTNC) + present(RCMAVFT) + present(REGPRIV)) 
	      * positif(V_NOTRAIT - 20) ;

ZIG_RCM = positif(RDRCM + IND_ZIGRCM) * null(3 - INDIRPS) * CNRLIG12 ;

regle 902200:
application :  iliad ;

IND_ZIGPROF = positif(V_NOTRAIT - 20) * positif( present(RCSV)
                     +present(RCSC)
                     +present(RCSP));
ZIG_PROF = positif(RDNP + IND_ZIGPROF) * null(3 - INDIRPS) * LIG12 ;

regle 902210:
application :  iliad ;

IND_ZIGRFG = positif(V_NOTRAIT - 20) * positif(present(RFORDI) + present(RFDORD) + present(RFDHIS) + present(RFMIC)) ;

ZIG_RF = positif(RDRFPS + IND_ZIGRFG) * null(3 - INDIRPS) * LIG12 ;

regle 902220:
application :  iliad ;

CS_RTF = RDPTP + RDNCP ;

IND_ZIGRTF = positif(V_NOTRAIT - 20) * positif(present(BPCOPTV) + present(BPVRCM)) ;

ZIG_RTF = positif(CS_RTF + IND_ZIGRTF) * null(3 - INDIRPS) * CNRLIG12 ;

ZIGGAINLEV = positif(CVNSALC) * positif(CVNSALAV) * LIG12 ;

regle 902230:
application :  iliad ;


RD_REVETRANG = SALECS + SALECSG + ALLECS + INDECS + PENECS + COD8SA + COD8SB + COD8SC + COD8SW + COD8SX ;


ZIG_REVETR = positif(SALECS + SALECSG + ALLECS + INDECS + PENECS 
                     + COD8SA + COD8SB + COD8SC + COD8SW + COD8SX )
                   * CNRLIG12 ;

regle 902240:
application :  iliad ;

IND_ZIGREVORIGIND = present(ESFP) ;

ZIG_RVORIGND = positif(ESFP + IND_ZIGREVORIGIND) * CNRLIG12 ;

regle 902250:
application :  iliad ;

ZIGRE168 = positif(RE168) * (1 - V_CNR) * LIG2 ;
ZIGTAX1649 = positif(TAX1649) * (1 - V_CNR) * LIG2 ;

ZIGR1649 = positif(R1649) * CNRLIG12 ;
ZIGPREREV = positif(PREREV) * CNRLIG12 ;

regle 902255:
application :  iliad ;


ZIGNONASSU = positif(REVNONASSU) * LIG12 ;

regle 902260:
application :  iliad ;
 
LIGPS = positif(BCSG + BRDS + BPSOL + BCVNSAL + BCDIS + BGLOA 
                + BRSE1 + BRSE2 + BRSE3 + BRSE4 + BRSE5 + BRSE6 + BRSE8 + BCSG820
                + (CODZRU + CODZRV) * LIG1 + 0) * LIG2 ;

NONLIGPS = positif(positif(1 - LIGPS) + positif(null(V_NOTRAIT - 23) + null(V_NOTRAIT - 33) + null(V_NOTRAIT - 43) + null(V_NOTRAIT - 53) + null(V_NOTRAIT - 63))) ;

INDIRPS =  (1 * (1 - LIGPS) * positif(3 - ANTINDIRPS))
	 + (3 * (1- positif((1 - LIGPS) * positif(3 - ANTINDIRPS)))) ;

regle 902270:
application :  iliad ;


ZIGBASECS = positif(BCSG + (V_CSANT - V_CSNANT) + CODZRU + CODZRV + COD8SH + COD8SI) ;
ZIGBASERD = positif(BRDS + V_RDANT) ;
ZIGBASEPS = positif(BPSOL + (V_PSOLANT - V_PSOLNANT) + CODZRU + CODZRV + COD8SH + COD8SI) ;
ZIGBASECVN = positif(BCVNSAL + V_CVNANT) * LIG2 ;
ZIG_BASE = positif(BCSG + BRDS + BPSOL + (V_CSANT - V_CSNANT) + V_RDANT + (V_PSOLANT - V_PSOLNANT) + CODZRU + CODZRV + COD8SH + COD8SI) * LIG2 ;
ZIGCDIS = positif(BCDIS + V_CDISANT) * LIG2 ;
ZIGPVTER = positif(PVTERPS) * LIG2 ;

ZIGGLOA = positif(BGLOA) * (1 - V_CNR) * LIG2 ;
ZIGRSE1 = positif(BRSE1) * LIG2 ; 
ZIGRSE2 = positif(BRSE2) * LIG2 ;
ZIGRSE3 = positif(BRSE3) * LIG2 ;
ZIGRSE4 = positif(BRSE4) * LIG2 ;
ZIGRSE5 = positif(BRSE5) * LIG2 ;
ZIGRSE6 = positif(BRSE6) * LIG2 ;
ZIGRSE8 = positif(BRSE8) * LIG2 ;
ZIGCSG820 = positif(BCSG820) * LIG2 ;

ZIGAUTRE = positif(ZIGGLOA + ZIGRSE1 + ZIGRSE2 + ZIGRSE3 + ZIGRSE4 + ZIGRSE5 + ZIGRSE6 + ZIGRSE8 + ZIGCSG820) ;

ZIGRFRET = positif(COD8YK) * LIG2 ;
ZIGRFDEP = positif(COD8XK) * (1 - positif(CODZRA)) * LIG2 ;
ZIGRFZRA = positif(COD8XK) * positif(CODZRA) * LIG2 ;

regle 902290:
application :  iliad ;

ZIGMONTS = positif(BCVNSAL + V_CVNANT) ;
ZIGMONTCS = positif(BCSG + (V_CSANT - V_CSNANT) + CODZRU + CODZRV) ;
ZIGMONTRD = positif(BRDS + V_RDANT + CODZRU + CODZRV) ;
ZIGMONTPS = positif(BPSOL + (V_PSOLANT - V_PSOLNANT) + CODZRU + CODZRV) ;
ZIG_MONTANT = positif(BCSG + BRDS + BPSOL + (V_CSANT - V_CSNANT) + V_RDANT + (V_PSOLANT - V_PSOLNANT) + CODZRU + CODZRV) * LIG2 ;

regle 902300:
application :  iliad ;


ZIG_INT =  positif(RETCS + RETPS + RETPSOL) * LIG2 ;

ZIGCVN = positif(RETCVN) * LIG2 ;

ZIGINT = positif(RETCDIS) * LIG2 ;

ZIGLOA = positif(RETGLOA) * LIG2 ;

ZIGINT1 = positif(RETRSE1) * LIG2 ;
ZIGINT2 = positif(RETRSE2) * LIG2 ;
ZIGINT3 = positif(RETRSE3) * LIG2 ;
ZIGINT4 = positif(RETRSE4) * LIG2 ;
ZIGINT5 = positif(RETRSE5) * LIG2 ;
ZIGINT6 = positif(RETRSE6) * LIG2 ;
ZIGINT8 = positif(RETRSE8) * LIG2 ;

ZIGINT820 = positif(RETCSG820) * LIG2 ;

ZIGCVN22 = positif(RETCVN2224) ;
ZIGINT22 = positif(RETCDIS2224) ;
ZIGLOA22 = positif(RETGLOA2224) ;

ZIGINT122 = positif(RETRSE12224) * LIG2 ;
ZIGINT222 = positif(RETRSE22224) * LIG2 ;
ZIGINT322 = positif(RETRSE32224) * LIG2 ;
ZIGINT422 = positif(RETRSE42224) * LIG2 ;
ZIGINT522 = positif(RETRSE52224) * LIG2 ;
ZIGINT622 = positif(RETRSE62224) * LIG2 ;
ZIGINT822 = positif(RETRSE82224) * LIG2 ;

regle 902310:
application :  iliad ;

ZIG_PEN17281 = ZIG_PENAMONT * positif(NMAJC1 + NMAJR1 + NMAJPSOL1) * LIG2 ;

ZIG_PENATX4 = ZIG_PENAMONT * positif(NMAJC4 + NMAJP4) * LIG2 ;
ZIGPENATX4 = ZIG_PENAMONT * positif(NMAJR4) * LIG2 ;
ZIG_PENATAUX = ZIG_PENAMONT * positif(NMAJC1 + NMAJPSOL1) * LIG2 ;
ZIGPENATAUX = ZIG_PENAMONT * positif(NMAJR1) * LIG2 ;

ZIGNONR30 = positif(ZIG_PENATX4) * positif(1 - positif(R1649 + PREREV)) * LIG2 ;
ZIGR30 = positif(ZIG_PENATX4) * positif(R1649 + PREREV) * LIG2 ;

ZIGPENACVN = positif(PCVN) * positif(NMAJCVN1) * LIG2 ;
ZIGPENACDIS = positif(PCDIS) * positif(NMAJCDIS1) * LIG2 ;

ZIGPENAGLO1 = positif(PGLOA) * positif(NMAJGLO1) * LIG2 ;

ZIGPENARSE1 = positif(PRSE1) * positif(NMAJRSE11) * LIG2 ;
ZIGPENARSE2 = positif(PRSE2) * positif(NMAJRSE21) * LIG2 ;
ZIGPENARSE3 = positif(PRSE3) * positif(NMAJRSE31) * LIG2 ;
ZIGPENARSE4 = positif(PRSE4) * positif(NMAJRSE41) * LIG2 ;
ZIGPENARSE5 = positif(PRSE5) * positif(NMAJRSE51) * LIG2 ;
ZIGPENARSE6 = positif(PRSE6) * positif(NMAJRSE61) * LIG2 ;
ZIGPENARSE8 = positif(PRSE8) * positif(NMAJRSE81) * LIG2 ;

ZIGPENA8201 = positif(PCSG820) * positif(NMAJC8201) * LIG2 ;

ZIGPENACVN4 = positif(PCVN) * positif(NMAJCVN4) * LIG2 ;
ZIGPENACDIS4 = positif(PCDIS) * positif(NMAJCDIS4) * LIG2 ;

ZIGPENAGLO4 = positif(PGLOA) * positif(NMAJGLO4) * LIG2 ;

ZIGPENARSE14 = positif(PRSE1) * positif(NMAJRSE14) * LIG2 ;
ZIGPENARSE24 = positif(PRSE2) * positif(NMAJRSE24) * LIG2 ;
ZIGPENARSE34 = positif(PRSE3) * positif(NMAJRSE34) * LIG2 ;
ZIGPENARSE44 = positif(PRSE4) * positif(NMAJRSE44) * LIG2 ;
ZIGPENARSE54 = positif(PRSE5) * positif(NMAJRSE54) * LIG2 ;
ZIGPENARSE64 = positif(PRSE6) * positif(NMAJRSE64) * LIG2 ;
ZIGPENARSE84 = positif(PRSE8) * positif(NMAJRSE84) * LIG2 ;

ZIGPENA8204 = positif(PCSG820) * positif(NMAJC8204) * LIG2 ;

regle 902320:
application :  iliad ;

ZIG_PENAMONT = positif(PCSG + PRDS + PPRS + PPSOL) * LIG2 ;

regle 902330:
application :  iliad ;

ZIG_CRDETR = positif(CICSG + CIPRS + CIPSOL) * LIG2 ;

regle 902340 :
application :  iliad ;

ZIGCIGLOA = positif(CIGLOA) * (1 - positif(ANNUL2042)) ;

CGLOAPROV = COD8YL * (1-V_CNR) ;
ZIGCOD8YL = positif(CGLOAPROV) * (1 - positif(ANNUL2042)) ;

ZIGCOD8YT = positif(COD8YT) * (1 - positif(ANNUL2042)) ;

ZIGCDISPROV = positif(CDISPROV) * (1 - positif(ANNUL2042)) ;

ZIGREVXA = positif(CIRSE1) * (1 - positif(ANNUL2042)) ;

ZIGREVXB = positif(CIRSE5) * (1 - positif(ANNUL2042)) ;

ZIGREVXC = positif(CIRSE2) * (1 - positif(ANNUL2042)) ;

ZIGREVXD = positif(CIRSE3) * (1 - positif(ANNUL2042)) ;

ZIGREVXE = positif(CIRSE4) * (1 - positif(ANNUL2042)) ;

ZIGPROVYD = positif(CSPROVYD) * (1 - positif(ANNUL2042)) ;

ZIGPROVYE = positif(CSPROVYE) * (1 - positif(ANNUL2042)) ;

CSPROVRSE2 = CSPROVYF + CSPROVYN ;
ZIGPROVYF = positif(CSPROVRSE2) * (1 - positif(ANNUL2042)) ;

ZIGPROVYG = positif(CSPROVYG) * (1 - positif(ANNUL2042)) ;

CSPROVRSE4 = CSPROVYH + CSPROVYP ;
ZIGPROVYH = positif(CSPROVRSE4) * (1 - positif(ANNUL2042)) ;

ZIGCIRSE6 = positif(CIRSE6) * (1 - positif(ANNUL2042)) ;

ZIGPROVYQ = positif(COD8YQ) * (1 - positif(ANNUL2042)) ;

ZIGPROVZH = positif(COD8ZH) * (1 - positif(ANNUL2042)) ;

CSPROVRSE8 = COD8YV + COD8YX ;
ZIGPROVYV = positif(CSPROVRSE8) * (1 - positif(ANNUL2042)) ;

ZIGCIRSE8 = positif(CIRSE8) * (1 - positif(ANNUL2042)) ;

regle 902350 :
application :  iliad ;

ZIGCSANT = positif(V_CSANT)  ;
ZIGCSNANT = positif(V_CSNANT)  ;

ZIGRDANT = positif(V_RDANT)  ;

ZIGSPASANT = positif(V_PENAPAS2ANT) ;

ZIGPSOLANT = positif(V_PSOLANT)  ;
ZIGPSOLNANT = positif(V_PSOLNANT)  ;

ZIGCVNANT = positif(V_CVNANT)  ;

ZIGCDISANT = positif(V_CDISANT)  ;

ZIGLOANT = positif(V_GLOANT)  ;

ZIG820ANT = positif(V_CSG820ANT)  ;

ZIGRSE1ANT = positif(V_RSE1ANT)  ;
ZIGRSE2ANT = positif(V_RSE2ANT)  ;
ZIGRSE3ANT = positif(V_RSE3ANT)  ;
ZIGRSE4ANT = positif(V_RSE4ANT)  ;
ZIGRSE5ANT = positif(V_RSE5ANT)  ;
ZIGRSE6ANT = positif(V_RSE6ANT)  ;
ZIGRSE8ANT = positif(V_RSE8ANT)  ;

regle 902360:
application :  iliad ;


ZIG_CTRIPROV = positif(CSGIM + PRSPROV) * LIG2 ;

regle 902370:
application :  iliad ;


IND_COLC = positif(BCSG) * positif(PCSG + CICSG + CSGIM) * LIG2 ;

IND_COLR = positif(BRDS) * positif(PRDS + CIRDS + CRDSIM) * LIG2 ;

INDCOLSOL = positif(BPSOL) * positif(PPSOL + CIPSOL + PRSPROV) * LIG2 ;

INDCOLVN = positif(BCVNSAL) * positif(PCVN + CICVN + COD8YT) * LIG2 ;

INDCOL = positif(IND_COLC + INDCOLSOL) ;

IND_COLD = positif(BCDIS) * positif(PCDIS + CDISPROV) * LIG2 ;

INDGLOA = positif(BGLOA) * positif(PGLOA + COD8YL + COD8XM) ;

INDCSG820 = positif(BCSG820) * positif(PCSG820 + COD8ZH) ;

INDRSE1 = positif(BRSE1) * positif(PRSE1 + CIRSE1 + CSPROVYD) ;
INDRSE2 = positif(BRSE2) * positif(PRSE2 + CIRSE2 + CSPROVYF + CSPROVYN + CICSG8TV + CICSG8QV) ;
INDRSE3 = positif(BRSE3) * positif(PRSE3 + CIRSE3 + CSPROVYG) ;
INDRSE4 = positif(BRSE4) * positif(PRSE4 + CIRSE4 + CSPROVYH + CSPROVYP + CICSG8TX + CICSG8QX) ;
INDRSE5 = positif(BRSE5) * positif(PRSE5 + CIRSE5 + CSPROVYE) ;
INDRSE6 = positif(BRSE6) * positif(PRSE6 + CIRSE6 + COD8YQ) ;
INDRSE8 = positif(BRSE8) * positif(PRSE8 + CIRSE8 + COD8YV + COD8YX) ;

IND_CTXC = positif(CS_DEG) * positif(BCSG) * positif(INDCTX) ;

IND_CTXR = positif(CS_DEG) * positif(BRDS) * positif(INDCTX) ;

IND_CTXP = positif(CS_DEG) * positif(BPSOL) * positif(INDCTX) ;

IND_CTXD = positif(CS_DEG) * positif(BCDIS) * positif(INDCTX) ;

INDTRAIT = null(5 - V_IND_TRAIT) ;

INDT = positif(IND_COLC + IND_COLR + INDCOLSOL + IND_CTXC + IND_CTXR + IND_CTXP) * INDTRAIT ;

INDTD = positif(IND_COLD + IND_CTXD) * INDTRAIT ;

regle 902380:
application :  iliad ;

ZIG_NETAP =  positif(BCSG + BRDS + BPSOL + BCVNSAL + BCDIS + BGLOA + BRSE1 + BRSE2 
                     + BRSE3 + BRSE4 + BRSE5 + BRSE6 + BRSE8 + CODZRU + CODZRV) * LIG2 ;

regle 902390:
application :  iliad ;

ZIG_TOTDEG = positif(CRDEG) * positif(INDCTX) ;

ZIG_TITREP = ZIG_NETAP + ZIG_TOTDEG ;

ZIGANNUL = positif(INDCTX) * positif(ANNUL2042) ;

regle 902400:
application :  iliad ;

ZIG_INF8 = positif (CS_DEG) * positif (SEUIL_8 - CS_DEG) * LIG2 ;

regle 902430:
application :  iliad ;


ZIG_CSGDDO = positif(V_IDANT - DCSGD) * positif(IDCSG) * (1 - null(V_IDANT + DCSGD + 0)) * (1 - null(V_IDANT - DCSGD)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIG_CSGDRS = positif(DCSGD - V_IDANT) * positif(IDCSG) * (1 - null(V_IDANT + DCSGD + 0)) * (1 - null(V_IDANT - DCSGD)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIG_CSGDC = positif(ZIG_CSGDDO + ZIG_CSGDRS + null(V_IDANT - DCSGD)) * (1 - null(V_IDANT + DCSGD + 0)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIG_CSGDCOR = positif(ZIG_CSGDDO + ZIG_CSGDRS) * (1 - null(V_IDANT + DCSGD + 0)) * (1 - null(V_IDANT - DCSGD)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGCSGDCOR1 = ZIG_CSGDCOR * null(ANCSDED2 - (ANNEEREV + 1)) ;
ZIGCSGDCOR2 = ZIG_CSGDCOR * null(ANCSDED2 - (ANNEEREV + 2)) ;
ZIGCSGDCOR3 = ZIG_CSGDCOR * null(ANCSDED2 - (ANNEEREV + 3)) ;
ZIGCSGDCOR4 = ZIG_CSGDCOR * null(ANCSDED2 - (ANNEEREV + 4)) ;
ZIGCSGDCOR5 = ZIG_CSGDCOR * null(ANCSDED2 - (ANNEEREV + 5)) ;
ZIGCSGDCOR6 = ZIG_CSGDCOR * null(ANCSDED2 - (ANNEEREV + 6)) ;
ZIGCSGDCOR7 = ZIG_CSGDCOR * null(ANCSDED2 - (ANNEEREV + 7)) ;

regle 902440:
application :  iliad ;

ZIGLODD = positif(V_IDGLOANT - DGLOD) * positif(IDGLO) * (1 - null(V_IDGLOANT + DGLOD + 0)) * (1 - null(V_IDGLOANT - DGLOD)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGLORS = positif(DGLOD - V_IDGLOANT) * positif(IDGLO) * (1 - null(V_IDGLOANT + DGLOD + 0)) * (1 - null(V_IDGLOANT - DGLOD)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGLOCO = positif(ZIGLODD + ZIGLORS + null(V_IDGLOANT - DGLOD)) * (1 - null(V_IDGLOANT + DGLOD + 0)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGLOCOR = positif(ZIGLODD + ZIGLORS) * (1 - null(V_IDGLOANT + DGLOD + 0)) * (1 - null(V_IDGLOANT - DGLOD)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGLOCOR1 = ZIGLOCOR * null(ANCSDED2 - (ANNEEREV + 1)) ;
ZIGLOCOR2 = ZIGLOCOR * null(ANCSDED2 - (ANNEEREV + 2)) ;
ZIGLOCOR3 = ZIGLOCOR * null(ANCSDED2 - (ANNEEREV + 3)) ;
ZIGLOCOR4 = ZIGLOCOR * null(ANCSDED2 - (ANNEEREV + 4)) ;
ZIGLOCOR5 = ZIGLOCOR * null(ANCSDED2 - (ANNEEREV + 5)) ;
ZIGLOCOR6 = ZIGLOCOR * null(ANCSDED2 - (ANNEEREV + 6)) ;
ZIGLOCOR7 = ZIGLOCOR * null(ANCSDED2 - (ANNEEREV + 7)) ;

ZIGRSEDD = positif(V_IDRSEANT - DRSED) * positif(IDRSE) * (1 - null(V_IDRSEANT + DRSED + 0)) 
	    * (1 - null(V_IDRSEANT - DRSED)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGRSERS = positif(DRSED - V_IDRSEANT) * positif(IDRSE) * (1 - null(V_IDRSEANT + DRSED + 0)) 
	    * (1 - null(V_IDRSEANT - DRSED)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGRSECO = positif(ZIGRSEDD + ZIGRSERS + null(V_IDRSEANT - DRSED)) * (1 - null(V_IDRSEANT + DRSED + 0)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGRSECOR = positif(ZIGRSEDD + ZIGRSERS) * (1 - null(V_IDRSEANT + DRSED + 0)) * (1 - null(V_IDRSEANT - DRSED)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGRSECOR1 = ZIGRSECOR * null(ANCSDED2 - (ANNEEREV + 1)) ;
ZIGRSECOR2 = ZIGRSECOR * null(ANCSDED2 - (ANNEEREV + 2)) ;
ZIGRSECOR3 = ZIGRSECOR * null(ANCSDED2 - (ANNEEREV + 3)) ;
ZIGRSECOR4 = ZIGRSECOR * null(ANCSDED2 - (ANNEEREV + 4)) ;
ZIGRSECOR5 = ZIGRSECOR * null(ANCSDED2 - (ANNEEREV + 5)) ;
ZIGRSECOR6 = ZIGRSECOR * null(ANCSDED2 - (ANNEEREV + 6)) ;
ZIGRSECOR7 = ZIGRSECOR * null(ANCSDED2 - (ANNEEREV + 7)) ;

ZIGRSEDD1 = positif(V_IDDPSED1ANT - DPSEDEC1) * positif(IDRSE1) * (1 - null(V_IDDPSED1ANT + DPSEDEC1 + 0)) 
	    * (1 - null(V_IDDPSED1ANT - DPSEDEC1)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGRSERS1 = positif(DPSEDEC1 - V_IDDPSED1ANT) * positif(IDRSE1) * (1 - null(V_IDDPSED1ANT + DPSEDEC1 + 0)) 
	    * (1 - null(V_IDDPSED1ANT - DPSEDEC1)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGRSECO1 = positif(ZIGRSEDD1 + ZIGRSERS1 + null(V_IDDPSED1ANT - DPSEDEC1)) * (1 - null(V_IDDPSED1ANT + DPSEDEC1 + 0)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGRSE1COR = positif(ZIGRSEDD1 + ZIGRSERS1) * (1 - null(V_IDDPSED1ANT + DPSEDEC1 + 0)) * (1 - null(V_IDDPSED1ANT - DPSEDEC1)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGRSE1COR1 = ZIGRSE1COR * null(ANCSDED2 - (ANNEEREV + 1)) ;
ZIGRSE1COR2 = ZIGRSE1COR * null(ANCSDED2 - (ANNEEREV + 2)) ;
ZIGRSE1COR3 = ZIGRSE1COR * null(ANCSDED2 - (ANNEEREV + 3)) ;
ZIGRSE1COR4 = ZIGRSE1COR * null(ANCSDED2 - (ANNEEREV + 4)) ;
ZIGRSE1COR5 = ZIGRSE1COR * null(ANCSDED2 - (ANNEEREV + 5)) ;
ZIGRSE1COR6 = ZIGRSE1COR * null(ANCSDED2 - (ANNEEREV + 6)) ;
ZIGRSE1COR7 = ZIGRSE1COR * null(ANCSDED2 - (ANNEEREV + 7)) ;

ZIGRSEDD2 = positif(V_IDDPSED2ANT - DPSEDEC2) * positif(IDRSE2) * (1 - null(V_IDDPSED2ANT + DPSEDEC2 + 0)) 
	    * (1 - null(V_IDDPSED2ANT - DPSEDEC2)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGRSERS2 = positif(DPSEDEC2 - V_IDDPSED2ANT) * positif(IDRSE2) * (1 - null(V_IDDPSED2ANT + DPSEDEC2 + 0)) 
	    * (1 - null(V_IDDPSED2ANT - DPSEDEC2)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGRSECO2 = positif(ZIGRSEDD2 + ZIGRSERS2 + null(V_IDDPSED2ANT - DPSEDEC2)) * (1 - null(V_IDDPSED2ANT + DPSEDEC2 + 0)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGRSE2COR = positif(ZIGRSEDD2 + ZIGRSERS2) * (1 - null(V_IDDPSED2ANT + DPSEDEC2 + 0)) * (1 - null(V_IDDPSED2ANT - DPSEDEC2)) * positif(V_NOTRAIT - 20) * LIG2 ;

ZIGRSE2COR1 = ZIGRSE2COR * null(ANCSDED2 - (ANNEEREV + 1)) ;
ZIGRSE2COR2 = ZIGRSE2COR * null(ANCSDED2 - (ANNEEREV + 2)) ;
ZIGRSE2COR3 = ZIGRSE2COR * null(ANCSDED2 - (ANNEEREV + 3)) ;
ZIGRSE2COR4 = ZIGRSE2COR * null(ANCSDED2 - (ANNEEREV + 4)) ;
ZIGRSE2COR5 = ZIGRSE2COR * null(ANCSDED2 - (ANNEEREV + 5)) ;
ZIGRSE2COR6 = ZIGRSE2COR * null(ANCSDED2 - (ANNEEREV + 6)) ;
ZIGRSE2COR7 = ZIGRSE2COR * null(ANCSDED2 - (ANNEEREV + 7)) ;

regle 902450:
application :  iliad ;

                 
ZIG_PRIM = positif(NAPCR) * LIG2 ;

regle 902460:
application :  iliad ;


CS_BPCOS = RDNCP ;
RD_BPCOS = CS_BPCOS ;
PS_BPCOS = CS_BPCOS ;

ZIG_BPCOS = positif(CS_BPCOS + RD_BPCOS + PS_BPCOS) * CNRLIG12 ;

regle 902470:
application :  iliad ;


ANCSDED2 = (V_ANCSDED * (1 - null(933 - V_ROLCSG)) + (V_ANCSDED + 1) * null(933 - V_ROLCSG)) * positif(V_ROLCSG + 0)
           + V_ANCSDED * (1 - positif(V_ROLCSG + 0)) ;

ZIG_CSGDPRIM = (1 - positif(V_CSANT + V_RDANT + V_PSANT + V_IDANT)) * positif(IDCSG) * LIG2 ;

ZIG_CSGD99 = ZIG_CSGDPRIM * (1 - null(V_IDANT + DCSGD + 0)) * positif(DCSGD) * positif(20 - V_NOTRAIT) * LIG2 ;

ZIGDCSGD1 = ZIG_CSGD99 * null(ANCSDED2 - (ANNEEREV + 1)) * LIG2 ;
ZIGDCSGD2 = ZIG_CSGD99 * null(ANCSDED2 - (ANNEEREV + 2)) * LIG2 ;
ZIGDCSGD3 = ZIG_CSGD99 * null(ANCSDED2 - (ANNEEREV + 3)) * LIG2 ;
ZIGDCSGD4 = ZIG_CSGD99 * null(ANCSDED2 - (ANNEEREV + 4)) * LIG2 ;
ZIGDCSGD5 = ZIG_CSGD99 * null(ANCSDED2 - (ANNEEREV + 5)) * LIG2 ;
ZIGDCSGD6 = ZIG_CSGD99 * null(ANCSDED2 - (ANNEEREV + 6)) * LIG2 ;

ZIGIDGLO = positif(IDGLO) * (1 - null(V_IDGLOANT + DGLOD + 0))  * positif(20 - V_NOTRAIT) * LIG2 ;

ZIGIDGLO1 = ZIGIDGLO * null(ANCSDED2 - (ANNEEREV + 1)) ;
ZIGIDGLO2 = ZIGIDGLO * null(ANCSDED2 - (ANNEEREV + 2)) ;
ZIGIDGLO3 = ZIGIDGLO * null(ANCSDED2 - (ANNEEREV + 3)) ;
ZIGIDGLO4 = ZIGIDGLO * null(ANCSDED2 - (ANNEEREV + 4)) ;
ZIGIDGLO5 = ZIGIDGLO * null(ANCSDED2 - (ANNEEREV + 5)) ;
ZIGIDGLO6 = ZIGIDGLO * null(ANCSDED2 - (ANNEEREV + 6)) ;

ZIGIDRSE = positif(IDRSE) * (1 - null(V_IDRSEANT + DRSED + 0)) * positif(20 - V_NOTRAIT) * LIG2 ;

ZIGDRSED1 = ZIGIDRSE * null(ANCSDED2 - (ANNEEREV + 1)) ;
ZIGDRSED2 = ZIGIDRSE * null(ANCSDED2 - (ANNEEREV + 2)) ;
ZIGDRSED3 = ZIGIDRSE * null(ANCSDED2 - (ANNEEREV + 3)) ;
ZIGDRSED4 = ZIGIDRSE * null(ANCSDED2 - (ANNEEREV + 4)) ;
ZIGDRSED5 = ZIGIDRSE * null(ANCSDED2 - (ANNEEREV + 5)) ;
ZIGDRSED6 = ZIGIDRSE * null(ANCSDED2 - (ANNEEREV + 6)) ;

ZIGPSE = positif(DPSEDEC1 + DPSEDEC2) * LIG2 ;
ZIGPSE1 = ZIGPSE * null(ANCSDED2 - (ANNEEREV + 1)) ;
ZIGPSE2 = ZIGPSE * null(ANCSDED2 - (ANNEEREV + 2)) ;
ZIGPSE3 = ZIGPSE * null(ANCSDED2 - (ANNEEREV + 3)) ;
ZIGPSE4 = ZIGPSE * null(ANCSDED2 - (ANNEEREV + 4)) ;
ZIGPSE5 = ZIGPSE * null(ANCSDED2 - (ANNEEREV + 5)) ;
ZIGPSE6 = ZIGPSE * null(ANCSDED2 - (ANNEEREV + 6)) ;
ZIGPSEDEC1 = positif(DPSEDEC1) * LIG2 ; 
ZIGPSEDEC2 = positif(DPSEDEC2) * LIG2 ;

regle 902480:
application :  iliad ;

ZIGINFO = positif(ZIG_CSGD99 + ZIGIDGLO + ZIGIDRSE + ZIG_CSGDC + ZIGLOCO + ZIGRSECO) * LIG2 ;

regle 902490:
application :  iliad ;


LIGPVSURSI = positif(PVSURSI + CODRWA) * CNRLIG12 ;

LIGIREXITI = positif(IREXITI) * (1 - positif(IREXITS)) * positif(COD2OP) * CNRLIG12 ;
LIGIREXITIB = positif(IREXITI) * (1 - positif(IREXITS)) * (1 - positif(COD2OP)) * CNRLIG12 ;

LIGIREXITS = positif(IREXITS) * (1 - positif(IREXITI)) * positif(COD2OP) * CNRLIG12 ;
LIGIREXITSA = positif(IREXITS) * (1 - positif(IREXITI)) * (1 - positif(COD2OP)) * CNRLIG12 ;

LIGIREXIT = positif(PVIMPOS + CODRWB) * positif(PVSURSI + CODRWA) * (1 - positif(COD2OP)) * CNRLIG12 ;
LIGIREXITO = positif(PVIMPOS + CODRWB) * positif(PVSURSI + CODRWA) * positif(COD2OP) * CNRLIG12 ;

LIGPV3WBI = positif(PVIMPOS + CODRWB) * CNRLIG12 ;

LIG150BTER = positif(COD3TA + COD3TB) * LIG12 ;
LIG150BPS1 = positif(COD3XM + COD3XD) * LIG12 ;
LIG150BPS2 = positif(COD3XA + COD3YA) * LIG12 ;

LIGSURIMP = positif(SURIMP) * LIG12 ;

LIG_SURSIS = positif(LIGPVSURSI + LIGPV3WBI + LIG150BTER + LIG150BPS1 + LIG150BPS2 + LIGIREXITI + LIGIREXITIB + LIGIREXITS + LIGIREXITSA + LIGIREXIT + LIGIREXITO + LIGSURIMP) * LIG12 ;

LIGSUR = LIG_SURSIS * positif(LIGREPPLU + LIGABDET + LIGABDETP + LIGCOD2DG + LIGRCMSOC + LIGRCMRDS + LIGCOD3SG
                              + LIGCOD3SL + LIGPV3SB + LIGCOD3WH + LIGCOD3BN + LIGRCMIMPAT + LIGABIMPPV + LIGABIMPMV + LIGROBOR
                              + LIGPVIMMO + LIGPVTISOC + LIGMOBNR + LIGZRS) ;

LIGI017 = positif(PVSURSI + PVIMPOS + CODRWA + CODRWB) * V_IND_TRAIT ;

regle 902500:
application :  iliad ;

LIG_CORRECT = positif_ou_nul(IAMD2) * INDREV1A8 * positif(LIG106 + LIG_NMAJ1 + LIG_NMAJ3 + LIG_NMAJ4 + LIGINRTAX + LIGNMAJTAXA1 + LIGNMAJTAXA3 + LIGNMAJTAXA4 
                                                          + LIGINRPCAP + LIGNMAJPCAP1 + LIGNMAJPCAP3 + LIGNMAJPCAP4
							  + LIGINRHAUT + LIGNMAJCHR1 + LIGNMAJCHR3 + LIGNMAJCHR4)  * LIG12 ;

LIGCORRECT = positif_ou_nul(IAMD2) * INDREV1A8 * positif(TAXASSUR + IPCAPTAXT + CHRAPRES) 
             * (1 - positif(LIG106 + LIG_NMAJ1 + LIG_NMAJ3 + LIG_NMAJ4 + LIGINRTAX + LIGNMAJTAXA1 + LIGNMAJTAXA3 + LIGNMAJTAXA4 + LIGINRPCAP + LIGNMAJPCAP1 
	                    + LIGNMAJPCAP3 + LIGNMAJPCAP4 + LIGINRHAUT + LIGNMAJCHR1 + LIGNMAJCHR3 + LIGNMAJCHR4)) * LIG12 ;

regle 902510:
application :  iliad ;

LIG_R8ZT = positif(V_8ZT + 0) * LIG12 ;
LIGRZRE = positif(CODZRE + 0) * LIG12 ;
LIGRZRF = positif(CODZRF + 0) * LIG12 ;

regle 902520:
application :  iliad ;

                 
LIGTXMOYPOS = positif(present(RMOND)+positif(VARRMOND)*present(DEFZU)) * (1 - positif(DEFRIMOND)) * LIG12 ;

LIGTXMOYNEG = positif(DMOND) * (1 - positif(DEFRIMOND)) * LIG12 ;

LIGTXPOSYT = positif(VARRMOND) * positif(IPTXMO) * positif(DEFRIMOND) * LIG12 ;

LIGTXNEGYT = (1 - LIGTXPOSYT) * positif(VARDMOND) * positif(IPTXMO) * positif(DEFRIMOND) * LIG12 ;

LIGTAUX = positif(TXMOYIMP + TXMARJ) ;

LIGTXMOYIMP = positif(TXMOYIMP) * (1 - V_CNR) ;

LIGTXMARJ = positif(TXMARJ) * (1 - positif(present(NRBASE) + present(NRINET) + present(BASRET) + present(IMPRET))) ;

regle 902530:
application :  iliad ;

                 
LIGAMEETREV = positif(INDREV1A8) * LIG12 ;

regle 902540:
application : iliad  ;

LIGBICTOT = positif(MIBNPRV + MIBNPRC + MIBNPRP + present(MIBNPPVV) + present(MIBNPPVC) 
                    + present(MIBNPPVP) + present(MIBNPDCT) + present(COD5RZ) + present(COD5SZ)) * LIG2 ;
                 
LIGMIBNPPOS = positif_ou_nul(MIBNETNPTOT) * (1 - positif(LIGBICNP + DEFNP)) * LIG2 ;

LIGMIBNPNEG = (1 - LIGMIBNPPOS) * LIG2 ;

LIG_MIBP = (positif(somme(i=V,C,P:MIBVENi) + somme(i=V,C,P:MIBPRESi) + abs(MIB_NETCT) + 0)) * LIG2 ; 

LIGMIBPPOS = positif_ou_nul(MIBNETPTOT) * (1 - LIGBICPRO) * LIG2 ;

LIGMIBPNEG = (1 - LIGMIBPPOS) * LIG2 ;

regle 902550:
application : iliad  ;

LIGSPENP = positif(BNCNPV + BNCNPC + BNCNPP + LIGBNCNPPV + LIGBNCNPMV) * LIG2 ;
                 
LIGSPENPPOS = positif_ou_nul(SPENETNPF) * (1 - positif(LIGNOCEP + LIGDAB)) * LIG2 ;

LIGSPENPNEG = (1 - LIGSPENPPOS) * LIG2 ;

regle 902570:
application : iliad  ;


LIGLOGDOM = positif(DLOGDOM) * LIG12 ;

LIGLOGSOC = positif(DLOGSOC) * LIG12 ;

LIGDOMSOC1 = positif(DDOMSOC1) * LIG12 ;

LIGLOCENT = positif(DLOCENT) * LIG12 ;

LIGCOLENT = positif(DCOLENT) * LIG12 ;

LIGREHAB = positif(DREHAB) * LIG12 ;

LIGRESTREP = present(DRESTREP) * LIG12 ;

LIGRESTIMO1 = positif(DRESTIMO1) * LIG12 ;

regle 902580:
application : iliad  ;

LIGREDAGRI = positif(DDIFAGRI) * LIG12 ;
LIGFORET = positif(DFORET) * LIG12 ;

LIGRCIF = positif(REPCIFHSN1 + REPCIF + REPCIM + REPCIHSA) * LIG12 ;
LIGREP7VQ = positif(REPCIFHSN1) * LIG12 ;
LIGREP7VS = positif(REPCIF) * LIG12 ;
LIGREP7VV = positif(REPCIM) * LIG12 ;
LIGREP7UP = positif(REPCIHSA) * LIG12 ;

LIGRCIFAD = positif(REPCIFADHSN1 + REPCIFAD) * LIG12 ;
LIGREP7VR = positif(REPCIFADHSN1) * LIG12 ;
LIGREP7VU = positif(REPCIFAD) * LIG12 ;

LIGRCIFSIN = positif(REPCIFSN5 + REPCIFSN4 + REPCIFSN3 + REPCIFSN2 + REPCIFSN1 + REPCIFSIN + REPCIMSIN + REPCISA) * LIG12 ;
LIGREP7TR = positif(REPCIFSN5) * LIG12 ;
LIGREP7TT = positif(REPCIFSN4) * LIG12 ;
LIGREP7TV = positif(REPCIFSN3) * LIG12 ;
LIGREP7TA = positif(REPCIFSN2) * LIG12 ;
LIGREP7TE = positif(REPCIFSN1) * LIG12 ;
LIGREP7TH = positif(REPCIFSIN) * LIG12 ;
LIGREP7TJ = positif(REPCIMSIN) * LIG12 ;
LIGREP7UT = positif(REPCISA) * LIG12 ;

LIGRCIFADSN = positif(REPCIFADSSN5 + REPCIFADSSN4 + REPCIFADSSN3 + REPCIFADSSN2 + REPCIFADSSN1 + REPCIFADSIN) * LIG12 ;
LIGREP7TS = positif(REPCIFADSSN5) * LIG12 ;
LIGREP7TU = positif(REPCIFADSSN4) * LIG12 ;
LIGREP7TW = positif(REPCIFADSSN3) * LIG12 ;
LIGREP7TB = positif(REPCIFADSSN2) * LIG12 ;
LIGREP7TF = positif(REPCIFADSSN1) * LIG12 ;
LIGREP7TI = positif(REPCIFADSIN) * LIG12 ;

LIGREPREST = positif(REPRESTKZ + REPRESTKY + REPRESTKX + REPRESTXY) * CNRLIG12 ;
LIGREPKZ = positif(REPRESTKZ) * CNRLIG12 ;
LIGREPKY = positif(REPRESTKY) * CNRLIG12 ;
LIGREPKX = positif(REPRESTKX) * CNRLIG12 ;
LIGREPXY = positif(REPRESTXY) * CNRLIG12 ;

LIGFIPC = positif(DFIPC) * LIG12 ;
LIGFIPDOM = positif(DFIPDOM) * LIG12 ;
LIGLOCANAH = positif(DLOCANAH) * LIG12 ;
LIGPRESSE = positif(DPRESSE) * LIG12 ;
LIGCINE = positif(DCINE) * LIG12 ;
LIGRIRENOV = positif(DRIRENOV) * LIG12 ;
LIGREPAR = positif(NUPROPT) * LIG12 ;
LIGREPARN = positif(REPAR) * CNRLIG12 ;
LIGREPAR1 = positif(REPAR1) * CNRLIG12 ;
LIGREPAR2 = positif(REPAR2) * CNRLIG12 ;
LIGREPREPAR = positif(LIGREPARN + LIGREPAR1 + LIGREPAR2) * CNRLIG12 ;

LIGRESTIMO = (present(COD7NX) + present(COD7NY)) * LIG12 ;

LIGRCODMN = positif(COD7MN + 0) * CNRLIG12 ;
LIGMN1 = LIGRCODMN * null(RCODMN1 - RCODMN8) ;
LIGMN2 = LIGRCODMN * (1 - null(RCODMN1 - RCODMN8)) ;

LIGRCODMW = positif(COD7MW + 0) * CNRLIG12 ;
LIGMW1 = LIGRCODMW * null(RCODMW1 - RCODMW8) ;
LIGMW2 = LIGRCODMW * (1 - null(RCODMW1 - RCODMW8)) ;

LIGRCODMZ = positif(COD7MZ + 0) * CNRLIG12 ;
LIGMZ1 = LIGRCODMZ * null(RCODMZ1 - RCODMZ8) ;
LIGMZ2 = LIGRCODMZ * (1 - null(RCODMZ1 - RCODMZ8)) ;

LIGRCODPZ = positif(COD7PZ + 0) * CNRLIG12 ;
LIGPZ1 = LIGRCODPZ * null(RCODPZ1 - RCODPZ8) ;
LIGPZ2 = LIGRCODPZ * (1 - null(RCODPZ1 - RCODPZ8)) ;

LIGRCODOY = positif(COD7OY + 0) * CNRLIG12 ;
LIGOY1 = LIGRCODOY * null(RCODOY1 - RCODOY8) ;
LIGOY2 = LIGRCODOY * (1 - null(RCODOY1 - RCODOY8)) ;

LIGREPLOC15 = positif(REPMEUHX + REPMEUHH + REPMEUKI + REPMEUOE + REPMEUPS + REP13MEU) * CNRLIG12 ;

LIGREPLOC12 = positif(REPMEUHW + REPMEUHG + REPMEUKH + REPMEUOD + REPMEUPR + REP12MEU) * CNRLIG12 ;

LIGREPLOC11 = positif(REPMEUHV + REPMEUHF + REPMEUKG + REPMEUOC + REPMEUPQ + REP11MEU) * CNRLIG12 ;

LIGREPLOC10 = positif(REPMEUHU + REPMEUHE + REPMEUKF + REPMEUOB + REPMEUPP + REP10MEU) * CNRLIG12 ;

LIGREPLOC9 = positif(REPMEUHT + REPMEUHD + REPMEUKE + REPMEUOA + REPMEUPO + REP9MEU) * CNRLIG12 ;

regle 902590:
application : iliad  ;

LIGILMNP1 = positif(DILMNP1) * LIG12 ;
LIGILMNP3 = positif(DILMNP3) * LIG12 ;
LIGILMNP4 = positif(DILMNP4) * LIG12 ;

regle 902600:
application : iliad  ;

LIGTAXASSUR = positif(present(CESSASSV) + present(CESSASSC)) * LIG12 ;
LIGTAXASSURV = present(CESSASSV) * LIG12 ;
LIGTAXASSURC = present(CESSASSC) * LIG12 ;

LIGIPCAPV = present(PCAPTAXV) * LIG12 ;
LIGIPCAPC = present(PCAPTAXC) * LIG12 ;
LIGIPCAPP = (present(COD1CT) + present(COD1DT) + present(COD1ET) + present(COD1FT)) * LIG12 ;
LIGIPCAP = positif(LIGIPCAPV + LIGIPCAPC + LIGIPCAPP) ;

LIGIHAUT = positif(CHRAVANT) * (1-positif(IPTEFP+INDTEFF)) * LIG12 ;

LIGHRTEFF = positif(CHRTEFF) * positif(IPTEFP+INDTEFF) * LIG12 ;

LIGHR3WT = positif(present(COD3WT)) * LIG12 ;

regle 902610:
application : iliad  ;

LIGCOMP01 = positif(BPRESCOMP01) * CNRLIG12 ;

regle 902620:
application : iliad  ;

LIGDEFBA = positif(DEFBA1 + DEFBA2 + DEFBA3 + DEFBA4 + DEFBA5 + DEFBA6) * LIG12 ;
LIGDEFBA1 = positif(DEFBA1) * LIG12 ;
LIGDEFBA2 = positif(DEFBA2) * LIG12 ;
LIGDEFBA3 = positif(DEFBA3) * LIG12 ;
LIGDEFBA4 = positif(DEFBA4) * LIG12 ;
LIGDEFBA5 = positif(DEFBA5) * LIG12 ;
LIGDEFBA6 = positif(DEFBA6) * LIG12 ;

LIGDFRCM = positif(DFRCMN+DFRCM1+DFRCM2+DFRCM3+DFRCM4+DFRCM5) * CNRLIG12 ;
LIGDFRCMN = positif(DFRCMN) * CNRLIG12 ;
LIGDFRCM1 = positif(DFRCM1) * CNRLIG12 ;
LIGDFRCM2 = positif(DFRCM2) * CNRLIG12 ;
LIGDFRCM3 = positif(DFRCM3) * CNRLIG12 ;
LIGDFRCM4 = positif(DFRCM4) * CNRLIG12 ;
LIGDFRCM5 = positif(DFRCM5) * CNRLIG12 ;

LIG2TUV = positif(COD2TU + COD2TV + COD2TW + COD2TX + COD2TY) * LIG12 ;
LIGR2VQR = positif(COD2VQ + COD2VR + COD2VS + COD2VT + COD2VU) * LIG12 ;
LIGDRCVM = positif(DPVRCM) * LIG12 ;
LIGDRFRP = positif(DRFRP) * LIG12 ;

BAMVV = (COD5XN - BAF1AV) * positif(COD5XN - BAF1AV) ;
BAMVC = (COD5YN - BAF1AC) * positif(COD5YN - BAF1AC) ;
BAMVP = (COD5ZN - BAF1AP) * positif(COD5ZN - BAF1AP) ;
LIGBAMVV = positif(BAMVV) * LIG12 ;
LIGBAMVC = positif(BAMVC) * LIG12 ;
LIGBAMVP = positif(BAMVP) * LIG12 ;

LIGDLMRN = positif(DLMRN6 + DLMRN5 + DLMRN4 + DLMRN3 + DLMRN2 + DLMRN1) * LIG12 ;
LIGDLMRN6 = positif(DLMRN6) * LIG12 ;
LIGDLMRN5 = positif(DLMRN5) * LIG12 ;
LIGDLMRN4 = positif(DLMRN4) * LIG12 ;
LIGDLMRN3 = positif(DLMRN3) * LIG12 ;
LIGDLMRN2 = positif(DLMRN2) * LIG12 ;
LIGDLMRN1 = positif(DLMRN1) * LIG12 ;

LIGBNCDF = positif(BNCDF1 + BNCDF2 + BNCDF3 + BNCDF4 + BNCDF5 + BNCDF6) * LIG12 ;
LIGBNCDF6 = positif(BNCDF6) * LIG12 ;
LIGBNCDF5 = positif(BNCDF5) * LIG12 ;
LIGBNCDF4 = positif(BNCDF4) * LIG12 ;
LIGBNCDF3 = positif(BNCDF3) * LIG12 ;
LIGBNCDF2 = positif(BNCDF2) * LIG12 ;
LIGBNCDF1 = positif(BNCDF1) * LIG12 ;

LIGMBDREPNPV = positif(MIBDREPNPV) * LIG12 ;
LIGMBDREPNPC = positif(MIBDREPNPC) * LIG12 ;
LIGMBDREPNPP = positif(MIBDREPNPP) * LIG12 ;

LIGMIBDREPV = positif(MIBDREPV) * LIG12 ;
LIGMIBDREPC = positif(MIBDREPC) * LIG12 ;
LIGMIBDREPP = positif(MIBDREPP) * LIG12 ;

LIGSPDREPNPV = positif(SPEDREPNPV) * LIG12 ;
LIGSPDREPNPC = positif(SPEDREPNPC) * LIG12 ;
LIGSPDREPNPP = positif(SPEDREPNPP) * LIG12 ;

LIGSPEDREPV = positif(SPEDREPV) * LIG12 ;
LIGSPEDREPC = positif(SPEDREPC) * LIG12 ;
LIGSPEDREPP = positif(SPEDREPP) * LIG12 ;

regle 902630:
application :  iliad ;


LIG_MEMO = positif(LIGPRELIB + LIG_SURSIS + LIGREPPLU + LIGABDET + LIGABDETP + LIGROBOR + LIGPVIMMO + LIGPVTISOC 
                   + LIGMOBNR + LIGCOD3WH + LIGCOD3BN + LIGZRS + LIGCOD3SG + LIGCOD3SL)
           + positif(LIG3525 + LIGCOD2DG + LIGRCMSOC + LIGRCMRDS + LIGRCMIMPAT + LIGABIMPPV + LIGABIMPMV + LIGPV3SB) * CNRLIG12 ;

regle 902640:
application :  iliad ;

LIGPRELIB = positif(present(PPLIB) + present(RCMLIB) + present(COD2XX) + present(COD2VM)) * LIG02 ;

LIG3525 = positif(DRTNC) * CNRLIG12 ;

LIGREPPLU = positif(REPPLU) * LIG12 ;
LIGPVIMPOS = positif(PVIMPOS) * LIG12 ;

LIGABDET = positif(GAINABDET) * LIG12 ;
ABDEPRET = ABDETPLUS + COD3TK ;
LIGABDETP = positif(ABDEPRET) * LIG12 ;

LIGCOD3SG = positif(COD3SG) * LIG12 ;
LIGCOD3SL = positif(COD3SL) * LIG12 ;
LIGPV3SB = positif(PVBAR3SB) * LIG12 ;
LIGCOD3WH = positif(PVREPORT) * LIG12 ;
LIGCOD3BN = positif(COD3BN) * LIG12 ;

LIGRCMSOC = positif(RCMSOCDED) * CNRLIG12 ;
LIGRCMRDS = positif(RCMRDS) * CNRLIG12 ;
LIGCOD2DG = positif(COD2DG) * CNRLIG12 ;
LIGRCMIMPAT = positif(RCMIMPAT) * CNRLIG12 ;
LIGABIMPPV = positif(ABIMPPV) * CNRLIG12 ;
LIGABIMPMV = positif(ABIMPMV) * CNRLIG12 ;

LIGCVNSAL = positif(CVNSALC) * LIG12 ;
LIGCDIS = positif(GSALV + GSALC) * CNRLIG12 ;
LIGROBOR = positif(RFROBOR) * LIG12 ;
LIGPVIMMO = positif(PVIMMO) * LIG12 ;
LIGPVTISOC = positif(PVTITRESOC) * LIG12 ;
LIGMOBNR = positif(PVMOBNR) * LIG12 ;

DEPMOB = RDTECH * positif(V_NOTRAIT - 10) ;

LIGZRS = positif(CODZRS) * LIG12 ;

LIGDEFPLOC = positif(DEFLOC1 + DEFLOC2 + DEFLOC3 + DEFLOC4 + DEFLOC5 + DEFLOC6 + DEFLOC7 + DEFLOC8 + DEFLOC9 + DEFLOC10) * LIG12 ;
LIGPLOC1 = positif(DEFLOC1) * LIG12 ;
LIGPLOC2 = positif(DEFLOC2) * LIG12 ;
LIGPLOC3 = positif(DEFLOC3) * LIG12 ;
LIGPLOC4 = positif(DEFLOC4) * LIG12 ;
LIGPLOC5 = positif(DEFLOC5) * LIG12 ;
LIGPLOC6 = positif(DEFLOC6) * LIG12 ;
LIGPLOC7 = positif(DEFLOC7) * LIG12 ;
LIGPLOC8 = positif(DEFLOC8) * LIG12 ;
LIGPLOC9 = positif(DEFLOC9) * LIG12 ;
LIGPLOC10 = positif(DEFLOC10) * LIG12 ;

regle 902650:
application :  iliad ;


LIGDCSGD = positif(DCSGD) * null(5 - V_IND_TRAIT) * INDCTX * LIG12 ;

regle 902660:
application :  iliad ;


LIGREPCORSE = positif(REPCORSE) * LIG12 ;

LIGREPRECH = positif(REPRECH) * LIG12 ;

LIGREPCICE = positif(REPCICE) * LIG12 ;

regle 902670:
application :  iliad ;

LIGIBAEX = positif(REVQTOT) * LIG12 
	     * (1 - INDTXMIN) * (1 - INDTXMOY) 
	     * (1 - V_CNR * (1 - LIG1522)) ;

regle 902680:
application :  iliad  ;

LIGANNUL2042 = LIG02 ;

LIG121 = positif(DEFRITS) * LIGANNUL2042 ;
LIG931 = positif(DEFRIRCM)*positif(RCMFR) * LIGANNUL2042 ;
LIG936 = positif(DEFRIRCM)*positif(REPRCM) * LIGANNUL2042 ;
LIG1111 = positif(DFANTIMPUBAR) * LIGANNUL2042 ;
LIG1112 = positif(DFANTIMPU) * positif(DEFRF4BC) * positif(RDRFPS) * LIGANNUL2042 ;
LIGDFANT = positif(DFANTIMPUQUO) * LIGANNUL2042 ;

regle 902690:
application :  iliad ;

LIGTRCT = positif(V_TRCT) ;

regle 902700:
application :  iliad ;

LIGVERSUP = positif(AUTOVERSSUP) ;
LIGPETAL20 = positif(IMPETAL20) ;
LIGPETAL21 = positif(IMPETAL21) ;
LIGPETAL22 = positif(IMPETAL22) ;
LIGPETAL23 = positif(IMPETAL23) ;


regle 902705:
application :  iliad ;
LIGRPTZM = positif(DPTZM) ;

regle 902710:
application : iliad  ;


INDRESTIT = positif(IREST + 0) ;

INDIMPOS = positif(null(1 - NATIMP) + null(71 - NATIMP) + 0) ;

regle 902720:
application : iliad  ;

INDIAMD1 = null(1 - IND61IR) * null(NAPTIR1) ;
INDNAPCR = null(1 - IND61PS) * positif(RASACOCS + RASACOPSOL + RASCTXCS + RASCTXPSOL + RESTITCS + RESTITPSOL) ;
INDTOTCR = null(1 - IND61PS) * (1 - positif(RASACOCS + RASACOPSOL + RASCTXCS + RASCTXPSOL + RESTITCS + RESTITPSOL)) ;

LIGPSNET = positif(positif(RASACOCS + RASACOPSOL + RASCTXCS + RASCTXPSOL + RESTITCS + RESTITPSOL) + positif(abs(CSNET1) + abs(PSOLNET1))) ;
LIGPSNET1 = positif(positif(abs(CSNET) + abs(PSOLNET)) * positif(RASACOCS + RASACOPSOL + RASCTXCS + RASCTXPSOL + RESTITCS + RESTITPSOL) + positif(abs(CSNET1) + abs(PSOLNET1))) ;

LIGAUTSOC = positif(positif(RSE1NET + RSE2NET + RSE3NET + RSE4NET + RSE5NET + RSE6NET + RSE8NET + CSG820NET + CGLOANET + RDNET + CVNNET + CDISNET) 
                    * positif(RASACOCS + RASACOPSOL + RASCTXCS + RASCTXPSOL + RESTITCS + RESTITPSOL)
                    + positif(PREVAUTSOC)) ;

LIGPRELPS = positif(RASACOCS + RASACOPSOL + RASCTXCS + RASCTXPSOL + RESTITCS + RESTITPSOL) ;

LIGIRBLOC = positif(RASSALIR + RASACOIR + RASCTXIR + AVRICIIR + CIADCREB3 + IMPETAL) ;

LIGPSBLOC = positif(abs(CSNET) + abs(PSOLNET) + RASACOPS + RASCTXPS + RESTITPS + RSE1NET + RSE2NET + RSE3NET 
                    + RSE4NET + RSE5NET + RSE6NET + RSE8NET + CSG820NET + CGLOANET + RDNET + CVNNET + CDISNET) ;

regle isf 902740:
application : iliad  ;

LIG_AVISIFI = (positif(LIM_IFIINF)) * present(IFIPAT);


LIGIFI9AA = positif(COD9AA + 0) * (1 - positif(ANNUL2042)) ;
LIGIFI9AB = positif(COD9AB + 0) * (1 - positif(ANNUL2042)) ;
LIGIFI9AC = positif(COD9AC + 0) * (1 - positif(ANNUL2042)) ;
LIGIFI9AD = positif(COD9AD + 0) * (1 - positif(ANNUL2042)) ;
LIGIFI9BA = positif(COD9BA + 0) * (1 - positif(ANNUL2042)) ;
LIGIFI9BB = positif(COD9BB + 0) * (1 - positif(ANNUL2042)) ;
LIGIFI9CA = positif(COD9CA + 0) * (1 - positif(ANNUL2042)) ;
LIGIFIACT = positif(IFIACT) * (1 - positif(ANNUL2042)) ;

LIGIFI9GF = positif(COD9GF + 0) * (1 - positif(ANNUL2042)) ; 
LIGIFI9GH = positif(COD9GH + 0) * (1 - positif(ANNUL2042)) ;
LIGIFIPAS = positif(IFIPAS) * (1 - positif(ANNUL2042)) ;

LIGIFIBASE =  LIGIFI * (1 - positif(ANNUL2042)) ;

LIGIFI = positif(IFIPAT - LIM_IFIINF)*(1 - positif(ANNUL2042)) ;

LIGIFIDIRECT = positif(LIGIFI9AA + LIGIFI9AB + LIGIFI9AC + LIGIFI9AD + LIGIFI9BA + LIGIFI9BB) * LIGIFI*(1 - positif(ANNUL2042)) ;


LIGIFINDIR = LIGIFIDIRECT * LIGIFI9CA * LIGIFI *(1 - positif(ANNUL2042)) ;

LIGIFINDIR1 = LIGIFI9CA * LIGIFI * (1 - LIGIFINDIR) * (1 - LIGIFIDIRECT) *(1 - positif(ANNUL2042)) ;

LIGIFIDEC = positif(IFI1) * positif(DECIFI) * LIGIFI * (1 - positif(ANNUL2042)) ;  


LIGIFIBRUT = (positif(IFI2) * LIGIFI * (1 - null(5 - V_IND_TRAIT))
             * positif(RDONIFI1 + RDONIFI2)
             * positif(COD9NC + COD9NG)
             + positif(IFI2) * null(5 - V_IND_TRAIT)
             * positif(present(COD9NC) + present(COD9NG))) * LIGIFIDEC * (1 - positif(ANNUL2042)) ;
                       

LIGIFIRAN = (positif(COD9NC) * (1 - null(5 - V_IND_TRAIT)) * LIGIFI 
             + present(COD9NC) * positif(DIFIBASE) * null(5 - V_IND_TRAIT)) * (1 - positif(ANNUL2042)) ;

LIGIFICEE = (positif(COD9NG) * (1 - null(5 - V_IND_TRAIT)) * LIGIFI 
             + present(COD9NG) * positif(DIFIBASE) * null(5 - V_IND_TRAIT)) * (1 - positif(ANNUL2042)) ;

LIGIFIDON =(1 - positif(ANNUL2042))* positif(LIGIFIRAN + LIGIFICEE) * LIGIFI ;

LIGIFIRED =(1 - positif(ANNUL2042))* LIGIFIDON * LIGIFI
            * (1 - positif(null((CODE_2042 + CMAJ_ISF)- 8) + null(CMAJ_ISF - 34)+null((CODE_2042 + CMAJ_ISF)- 11)+null(CODE_2042- 3)+null(CODE_2042- 5)+null(CODE_2042- 55)) * (1 - COD9ZA));

LIGIFIREDPEN8 =(1 - positif(ANNUL2042))* LIGIFIDON * LIGIFI
                * positif(null(CODE_2042 + CMAJ_ISF - 8) + null(CMAJ_ISF - 34) + null(CODE_2042 + CMAJ_ISF - 11) + null(CODE_2042 - 3) + null(CODE_2042 - 5) + null(CODE_2042 - 55))
                * (1 - COD9ZA) ; 

LIGIFIAPR =  positif(IFIETR + IFIPLAF)
             * (1 - LIGIFIIMPU)
             * (positif(IFI3) * LIGIFI * (1 - null(5 - V_IND_TRAIT))
                * positif(RDONIFI1 + RDONIFI2)
                * positif(COD9NC + COD9NG)
                + positif(IFI3) * null(5 - V_IND_TRAIT)
                  * positif(present(COD9NC) + present(COD9NG)))
             * (1 - positif(ANNUL2042)) ;


LIGIFIIMPU =(1 - positif(ANNUL2042))* positif(DIFIBASE) * positif(IFIETR + IFIPLAF)
             * LIGIFIDEC * (1 - positif(COD9NC + COD9NG ))
             * LIGIFI * (1 - positif(ANNUL2042)) 
	     * ((1 - null(5 - V_IND_TRAIT))
                + null(5 - V_IND_TRAIT) * (1 - positif(LIGIFIRED + LIGIFIREDPEN8))) ;


LIGIPLAF = positif(PLAFIFI) * (1-null(5-V_IND_TRAIT))
            * LIGIFI * (1 - positif(ANNUL2042))
	    + positif(PLAFIFI) * positif(DIFIBASE) * (1 - positif(ANNUL2042)) * null(5-V_IND_TRAIT) ; 


LIGIFIE = positif(DIFIBASE) * positif(COD9RS + 0) * (1 - positif(ANNUL2042))
          * (1 - null(5 - V_IND_TRAIT)) * LIGIFI
          + positif(DIFIBASE) * present(COD9RS)
            * (1 - positif(ANNUL2042)) * null(5 - V_IND_TRAIT) ;



LIGIFICOR1 = present(IFI4BIS) * positif(DIFIBASE) * positif(PIFI)
             * (1 - positif(SEUIL_12 - IFI4BIS) * (1 - null(IFI4BIS)))
             * LIGIFI * (1 - positif(ANNUL2042))
             * (1 - positif(V_NOTRAIT-20))
             + positif(V_NOTRAIT-20) * LIGIFI * (1 - positif(ANNUL2042)) ;

LIGIFINOPEN = present(IFITOT) * positif(DIFIBASE) * (1 - positif(PIFI))
              * (1 - LIGIFICOR1) * LIGIFI * (1 - positif(ANNUL2042)) ;
				
LIGIFIRET = positif(RETIFI) * LIGIFI * (1 - positif(ANNUL2042))
            * (1 - positif(SEUIL_12 - IFI4BIS) * (1 - null(IFITOT))) ;

LIGIFIRET22 = LIGIFIRET * positif(RETIFIRED)*(1 - positif(ANNUL2042)) ;
 
LIGNMAJIFI1 = positif(NMAJIFI1) * LIGIFI * (1 - positif(ANNUL2042))
              * (1 - positif(SEUIL_12 - IFI4BIS) * (1-null(IFITOT))) ;

LIGIFI9749 =(1 - positif(ANNUL2042))* LIGNMAJIFI1 * (1 - LIGIFIRET) ;

LIGIFI17281 = positif(NMAJIFI1) * LIGIFI * (1 - positif(ANNUL2042))
              * (1 - positif(SEUIL_12 - IFI4BIS) * (1 - null(IFITOT)))
              * (1 - positif(V_FLAGR34 + null(CMAJ_ISF - 34))) ;

LIGIFI17285 = positif(NMAJIFI1) * LIGIFI * (1 - positif(ANNUL2042))
               * (1 - positif( SEUIL_12 - IFI4BIS) * (1 - null(IFITOT)))
               * positif(V_FLAGR34 + null(CMAJ_ISF - 34)) ;

LIGNMAJIFI4 = positif(NMAJIFI4) * LIGIFI * (1 - positif(ANNUL2042)) * (1 - positif(SEUIL_12 - IFI4BIS) * (1 - null(IFITOT))) ;


LIGIFI1729 = positif(NMAJIFI4) * LIGIFI * (1 - positif(ANNUL2042)) * (1 - positif(SEUIL_12 - IFI4BIS) * (1 - null(IFITOT))) ;

LIGIFIANT = positif(V_ANTIFI) * positif(V_NOTRAIT-20);

INDCTX23 = positif(null(V_NOTRAIT - 23) + null(V_NOTRAIT - 33) + null(V_NOTRAIT - 43) + null(V_NOTRAIT - 53) + null(V_NOTRAIT - 63)) ;

LIGIFINET = (positif(PIFI)*positif(DIFIBASE) * (1-null(5-V_IND_TRAIT))
               * (1 - positif( SEUIL_12 - IFI4BIS)*(1-null(IFITOT)))
              * LIGIFI * (1 - positif(ANNUL2042))
            + (null(5-V_IND_TRAIT)) * positif(LIGIFIRET + LIGNMAJIFI1)
              * positif(IFINAP) * (1 - positif( SEUIL_12 - IFINAP)))
           * (1 - positif(INDCTX23)) ;


INDIS26 = positif(null(V_NOTRAIT - 26) + null(V_NOTRAIT - 36) + null(V_NOTRAIT - 46) + null(V_NOTRAIT - 56) + null(V_NOTRAIT - 66)) ;

LIGIFI9269 = (1 - positif(LIGIFIRET + LIGNMAJIFI1)) * (1 - positif( SEUIL_12 - IFINAP)) * INDIS26 ;

LIGIFIRECOU = present(IFIRECOUVR);

LIGIFIANNUL = present(IFIPAT) * positif(ANNUL2042) ;

IND9HI0 = INDCTX23 * null( 5-V_IND_TRAIT ) * present(IFIPAT);

LIGIFIDEG = (1 - LIGIFIDEGR) * IND9HI0 * positif(IFIDEG) ;

LIGIFIDEGR = (null(2- (positif(SEUIL_8 - IFIDEGR) + positif_ou_nul(IFITOT-SEUIL_12)))
              + null(V_ANTIFI))
             * INDCTX23 * null(5-V_IND_TRAIT) * (1 - positif(ANNUL2042)) ;


LIGIFIZERO = null(IFITOT) * positif(20-V_NOTRAIT) * LIGIFI * (1 - positif(ANNUL2042)) ;	 

LIGIFINMR = positif(SEUIL_12 - IFITOT) * (1 - null(IFITOT))
           * (1 - positif(INDCTX23)) * positif(20 - V_NOTRAIT)
           * LIGIFI * (1 - positif(ANNUL2042)) ;


LIGIFINMRIS = positif(SEUIL_12 - IFINAP) * INDIS26 * positif(V_NOTRAIT - 20) * (1 - positif(ANNUL2042)) ; 

LIGIFI0DEG = IND9HI0 * null(IFI4BIS) * (1 - positif(ANNUL2042)) ;

LIGIFINMRDEG = (1 - LIGIFIDEGR) * (1 - null(IFITOT))
               * positif(SEUIL_12 - IFI4BIS) * positif(DIFIBASE)
               * INDCTX23 * null(5-V_IND_TRAIT) * (1 - positif(ANNUL2042)) ;

LIGIFIINF8 = IND9HI0 * LIGIFIDEGR * (1 - positif(ANNUL2042)) ;

LIGIFINEW = present(IFIPAT) * (1 - positif(20-V_NOTRAIT)) * null(5 - V_IND_TRAIT) * (1 - positif(ANNUL2042)) ;

regle 902745:
application :  iliad ;

LIGIFITRCT = present(IFIPAT) * positif(V_TRCT) ;
LIGPADELIR = positif(CODST1 + CODST2 ) * (1-positif(CODST5)) * (1 - positif(ANNUL2042)) ;
LIGPASDELIR = positif(CODST1 + CODST2 + CODST5) * (1 - positif(ANNUL2042)) ;
LIGPAIR =  positif(CODSU1 + CODSU2 + CODSV1 + CODSV2 ) * (1-positif(CODSZ1)) * (1 - positif(ANNUL2042)) ;
LIGPASIR = positif(CODSU1 + CODSU2 + CODSV1 + CODSV2 + CODSZ1) * (1 - positif(ANNUL2042)) ;
LIGPADELPS = positif(CODST3 + CODST4 ) * (1-positif(CODST6)) * (1 - positif(ANNUL2042)) ;
LIGPASDELPS = positif(CODST3 + CODST4 + CODST6) * (1 - positif(ANNUL2042)) ;
LIGPAPS = positif(CODSW1 + CODSW2 + CODSX1 + CODSX2 ) * (1-positif(CODSZ2)) * (1 - positif(ANNUL2042)) ;
LIGPASPS = positif(CODSW1 + CODSW2 + CODSX1 + CODSX2 + CODSZ2) * (1 - positif(ANNUL2042)) ;
LIGSANCIR = positif(LIGPASDELIR + LIGPASIR + LIGPAIR) ;
LIGSANCPS = positif(LIGPASDELPS + LIGPASPS + LIGPAPS) ;
LIGSANCPAS = positif(LIGSANCIR + LIGSANCPS) ;
LIGPASANC = positif(CODST1 + CODST2 + CODST5 + CODSU1 + CODSU2 + CODSV1 + CODSV2 + CODSZ1 + CODST3 + CODST4 + CODST6 + CODSW1 + CODSW2 + CODSX1 + CODSX2 + CODSZ2) ;
