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
 ####   #    #    ##    #####      #     #####  #####   ######         #     #
 ####   #    #  #    #  #          #       #    #    #  ######          #####
regle 301000:
application : bareme , iliad ;

IRN = min(0 , IAN + AVFISCOPTER - IRE) + max(0 , IAN + AVFISCOPTER - IRE) * positif( IAMD1 + 1 - SEUIL_61) ;


regle 301005:
application : bareme , iliad ;
IRNAF = min( 0, IAN - IRE) + max( 0, IAN - IRE) * positif( IAMD1AF + 1 - SEUIL_61) ;

regle 301010:
application : bareme , iliad ;


IAR = min( 0, IAN + AVFISCOPTER - IRE) + max( 0, IAN + AVFISCOPTER - IRE) ;

regle 301015:
application : bareme , iliad ;

IARAF = min(0 , IANAF - IREAF) + max(0 , IANAF - IREAF) + NEGIANAF ;

regle 301020:
application : iliad ;

CREREVET = min(arr((BPTP3 + BPTPD + BPTPG) * TX128/100),arr(CIIMPPRO * TX128/100 ))
	   + min(arr(BPTP19 * TX19/100),arr(CIIMPPRO2 * TX19/100 ))
	   + min (arr(RCMIMPTR * TX075/100),arr(COD8XX * TX075/100)) 
	   + min (arr(BPTP10 * TX10/100),arr(COD8XV * TX10/100)) 
	   ;

CIIMPPROTOT = CIIMPPRO + CIIMPPRO2 + COD8XX + COD8XV;

regle 301030:
application : iliad ;


ICIGLO = min(arr(BPTP18 * TX18/100),arr(COD8XF * TX18/100 ))
      + min(arr(BPTP4I * TX30/100),arr(COD8XG * TX30/100 ))
      + min(arr(BPTP40 * TX41/100),arr(COD8XH * TX41/100 ));

CIGLOTOT = COD8XF + COD8XG + COD8XH ; 
regle 301032:
application : iliad ;

CIGLO = max(0 , min(IRB + TAXASSUR + IPCAPTAXT - AVFISCOPTER - CIRCMAVFT - IRETS1 - ICREREVET , ICIGLO)) ;

regle 301035:
application : iliad ;

CIGLOAF = max(0 , min(IRBAF + TAXASSUR + IPCAPTAXT - CIRCMAVFTAF - IRETS1AF - ICREREVETAF , ICIGLO)) ;

regle 301040:
application : iliad ;


ICREREVET = max(0 , min(IAD11 + ITP - CIRCMAVFT - IRETS1 , min(ITP , CREREVET))) ;

regle 301045:
application : iliad ;

ICREREVETAF = max(0 , min(IAD11 + ITP - CIRCMAVFTAF - IRETS1AF , min(ITP , CREREVET))) ;

regle 301050:
application : iliad , bareme ;

INE = (CIRCMAVFT + ICREREVET + CIGLO + IRETS + CIDONENTR + CICORSE + CIRECH + CICOMPEMPL) * (1 - positif(RE168 + TAX1649)) ;

IAN = max(0 , (IRB - AVFISCOPTER - INE
               + min(TAXASSUR + 0 , max(0 , INE - IRB + AVFISCOPTER)) 
               + min(IPCAPTAXTOT + 0 , max(0 , INE - IRB + AVFISCOPTER - min(TAXASSUR + 0 , max(0 , INE - IRB + AVFISCOPTER))))
	      )
         ) ;
IANINR = max(0 , (IRBINR - AVFISCOPTER - INE
               + min(TAXASSUR + 0 , max(0 , INE - IRBINR + AVFISCOPTER)) 
               + min(IPCAPTAXTOT + 0 , max(0 , INE - IRBINR + AVFISCOPTER - min(TAXASSUR + 0 , max(0 , INE - IRBINR + AVFISCOPTER))))
	      )
         ) ;

regle 301055:
application : iliad , bareme ;

INEAF = (CIRCMAVFTAF + ICREREVETAF + CIGLOAF + IRETSAF + CIDONENTRAF + CICORSEAF + CIRECHAF + CICOMPEMPLAF)
            * (1-positif(RE168+TAX1649));
regle 301057:
application : iliad , bareme ;

IANAF = max( 0, (IRBAF  + ((- CIRCMAVFTAF
                                     - ICREREVETAF
                                     - CIGLOAF
				     - IRETSAF
                                     - CIDONENTRAF
                                     - CICORSEAF
				     - CIRECHAF
                                     - CICOMPEMPLAF)
                                   * (1 - positif(RE168 + TAX1649)))
                  + min(TAXASSUR+0 , max(0,INEAF-IRBAF)) 
                  + min(IPCAPTAXTOT+0 , max(0,INEAF-IRBAF - min(TAXASSUR+0,max(0,INEAF-IRBAF))))
	      )
         ) ;

NEGIANAF = -1 * (min(TAXASSUR+0 , max(0,INEAF-IRBAF))
                 + min(IPCAPTAXTOT+0 , max(0,INEAF-IRBAF - min(TAXASSUR+0,max(0,INEAF-IRBAF))))) ;

regle 301060:
application : iliad ;


IRE = (EPAV + CRICH + CICORSENOW + CIGE + CITEC + CICA + CIGARD + CISYND 
       + CIADCRE + CREFAM + COD8WK + CREAGRIBIO + CRESINTER 
       + CREFORMCHENT + CREARTS + CICONGAGRI + AUTOVERSLIB + COD8CV
       + CI2CK + CIRCOTFOR + CIRFOR + CIFORET + CIHJA + COD8TE + CIVHELEC 
       + CREAGRIHVE + CREAGRIGLY + COD8TL) * (1 - positif(RE168 + TAX1649 + 0)) ;

IREAF = (EPAV + CRICH + CICORSENOW + CIGE + CITEC + CICA + CIGARD + CISYND 
       + CIADCRE + CREFAM + COD8WK + CREAGRIBIO + CRESINTER 
       + CREFORMCHENT + CREARTS + CICONGAGRI + AUTOVERSLIB + COD8CV
       + CI2CK + CIRCOTFOR + CIRFOR + CIFORET + CIHJA + COD8TE + CIVHELEC
       + CREAGRIHVE + CREAGRIGLY + COD8TL) * (1 - positif(RE168 + TAX1649 + 0)) ;

IRE2 = IRE ; 

regle 301065:
application : iliad ;

CIHJA = CODHJA * (1 - positif(RE168 + TAX1649)) * (1 - V_CNR) ;

regle 301070:
application : iliad ;

CRICH =  IPRECH * (1 - positif(RE168+TAX1649));

regle 301080:
application : iliad ;


CIRCMAVFT = max(0 , min(IRB + TAXASSUR + IPCAPTAXT - AVFISCOPTER , RCMAVFT * (1 - V_CNR)));

regle 301085:
application : iliad ;

CIRCMAVFTAF = max(0 , min(IRBAF + TAXASSUR + IPCAPTAXT , RCMAVFT * (1 - V_CNR)));

regle 301100:
application : iliad;
CI2CK = COD2CK * (1 - positif(RE168 + TAX1649)) * (1 - V_CNR);

regle 301110:
application : iliad;


CICA =  arr(BAILOC98 * TX_BAIL / 100) * (1 - positif(RE168 + TAX1649)) ;

regle 301130:
application : iliad ;


IPAE = COD8VL + COD8VM + COD8WM + COD8UM + COD8VN ;

RASIPSOUR = IPSOUR * positif(null(V_REGCO-2) + null(V_REGCO-3)) * (1 - positif(RE168+TAX1649)) ;

RASIPAE = COD8VM + COD8WM + COD8UM ;

regle 301133:
application : iliad ;

IRETS1 = max(0 , min(IRB + TAXASSUR + IPCAPTAXT - AVFISCOPTER - CIRCMAVFT , RASIPSOUR)) ;

regle 301134:
application : iliad ;


IRETS21 = max(0 , min(IRB + TAXASSUR + IPCAPTAXT - AVFISCOPTER - CIRCMAVFT - IRETS1 - ICREREVET - CIGLO , min(COD8PB , COD8VL) * present(COD8PB) + COD8VL * (1 - present(COD8PB)))) 
          * positif(null(V_REGCO - 1) + null(V_REGCO - 3) + null(V_REGCO - 5) + null(V_REGCO - 6)) ;

IRETS22 = max(0 , min(IRB + TAXASSUR + IPCAPTAXT - AVFISCOPTER - CIRCMAVFT - IRETS1 - ICREREVET - CIGLO - IRETS21 , min(COD8PA , RASIPAE) * present(COD8PA) + RASIPAE * (1 - present(COD8PA)))) 
          * positif(null(V_REGCO - 1) + null(V_REGCO - 3) + null(V_REGCO - 5) + null(V_REGCO - 6)) ;
	
IRETS2 = max(0 , min(IRB + TAXASSUR + IPCAPTAXT - AVFISCOPTER - CIRCMAVFT - IRETS1 - ICREREVET - CIGLO - IRETS21 - IRETS22 , min(COD8VO , COD8VN) * present(COD8VO) + COD8VN * (1 - present(COD8VO)))) 
         * positif(null(V_REGCO - 2)) + IRETS21 + IRETS22 ;
	
IRETS = IRETS1 + IRETS2 ;

regle 301135:
application : iliad ;

IRETS1AF = max(0 , min(IRBAF + TAXASSUR + IPCAPTAXT - CIRCMAVFTAF , RASIPSOUR)) ;

regle 301136:
application : iliad ;


IRETS21AF = max(0 , min(IRBAF + TAXASSUR + IPCAPTAXT + - CIRCMAVFTAF - IRETS1AF - ICREREVETAF - CIGLOAF , min(COD8PB , COD8VL) * present(COD8PB) + COD8VL * (1 - present(COD8PB))))
            * positif(null(V_REGCO - 1) + null(V_REGCO - 3) + null(V_REGCO - 5) + null(V_REGCO - 6)) ;

IRETS22AF = max(0 , min(IRBAF + TAXASSUR + IPCAPTAXT - CIRCMAVFTAF - IRETS1AF - ICREREVETAF - CIGLOAF - IRETS21AF , min(COD8PA , RASIPAE) * present(COD8PA) + RASIPAE * (1 - present(COD8PA))))
            * positif(null(V_REGCO - 1) + null(V_REGCO - 3) + null(V_REGCO - 5) + null(V_REGCO - 6)) ;
	
IRETS2AF = max(0 , min(IRBAF + TAXASSUR + IPCAPTAXT - CIRCMAVFTAF - IRETS1AF - ICREREVETAF - CIGLOAF - IRETS21AF - IRETS22AF , min(COD8VO , COD8VN) * present(COD8VO) + COD8VN * (1 - present(COD8VO))))
           * positif(null(V_REGCO - 2)) + IRETS21AF + IRETS22AF ;
	
IRETSAF = IRETS1AF + IRETS2AF ;

regle 301170:
application : iliad ;

BCIDONENTR = RDMECENAT * (1-V_CNR) ;

regle 301172:
application : iliad ;

CIDONENTR = max(0 , min(IRB + TAXASSUR + IPCAPTAXT - AVFISCOPTER - CIRCMAVFT - REI - ICREREVET - CIGLO - IRETS , BCIDONENTR)) ;

regle 301175:
application : iliad ;

CIDONENTRAF = max(0 , min(IRBAF + TAXASSUR + IPCAPTAXT - CIRCMAVFTAF - REI - ICREREVETAF - CIGLOAF - IRETSAF , BCIDONENTR)) ;

regle 301180:
application : iliad ;

CICORSE = max(0 , min(IRB + TAXASSUR + IPCAPTAXT - AVFISCOPTER - CIRCMAVFT - IPPRICORSE - ICREREVET - CIGLO - IRETS - CIDONENTR , CIINVCORSE + IPREPCORSE)) ;

CICORSEAVIS = CICORSE + CICORSENOW ;

TOTCORSE = CIINVCORSE + IPREPCORSE + CICORSENOW ;

regle 301185:
application : iliad ;

CICORSEAF = max(0 , min(IRBAF + TAXASSUR + IPCAPTAXT - CIRCMAVFTAF - IPPRICORSE - ICREREVETAF - CIGLOAF - IRETSAF - CIDONENTRAF , CIINVCORSE + IPREPCORSE)) ;

CICORSEAVISAF = CICORSEAF + CICORSENOW ;

regle 301190:
application : iliad ;

CIRECH = max(0 , min(IRB + TAXASSUR + IPCAPTAXT - AVFISCOPTER - CIRCMAVFT - ICREREVET - CIGLO - IRETS - CIDONENTR - CICORSE , IPCHER)) ;

regle 301195:
application : iliad ;

CIRECHAF = max(0 , min(IRBAF + TAXASSUR + IPCAPTAXT - CIRCMAVFTAF - ICREREVETAF - CIGLOAF - IRETSAF - CIDONENTRAF - CICORSEAF , IPCHER)) ;
regle 301200:
application : iliad ;

CICOMPEMPL = max(0 , min(IRB + TAXASSUR + IPCAPTAXT - AVFISCOPTER - CIRCMAVFT - ICREREVET - CIGLO - IRETS - CIDONENTR - CICORSE - CIRECH , COD8UW)) ;

DIEMPLOI = (COD8UW + COD8TL) * (1 - positif(RE168+TAX1649)) ;

CIEMPLOI = (CICOMPEMPL + COD8TL) * (1 - positif(RE168+TAX1649)) ;

IRECR = abs(min(0 , IRB + TAXASSUR + IPCAPTAXT - AVFISCOPTER - CIRCMAVFT - ICREREVET - CIGLO - IRETS - CIDONENTR - CICORSE - CIRECH - CICOMPEMPL)) ;

regle 301205:
application : iliad ;

CICOMPEMPLAF = max(0 , min(IRBAF + TAXASSUR + IPCAPTAXT - CIRCMAVFTAF - ICREREVETAF - CIGLOAF - IRETSAF - CIDONENTRAF - CICORSEAF - CIRECHAF , COD8UW)) ;

CIEMPLOIAF = (CICOMPEMPLAF + COD8TL) * (1 - positif(RE168+TAX1649)) ;

IRECRAF = abs(min(0 , IRBAF + TAXASSUR + IPCAPTAXT - CIRCMAVFTAF - ICREREVETAF - CIGLOAF - IRETSAF - CIDONENTRAF - CICORSEAF - CIRECHAF - CICOMPEMPLAF)) ;

regle 301210:
application : iliad ;
  
REPCORSE = abs(CIINVCORSE+IPREPCORSE-CICORSE) ;
REPRECH = abs(IPCHER - CIRECH) ;
REPCICE = abs(COD8UW - CICOMPEMPL) ;

regle 301220:
application : iliad ;

CICONGAGRI = CRECONGAGRI * (1-V_CNR) ;

regle 301230:
application : iliad ;

BCICAP = arr(PRELIBXT * TX90/100 * T_PCAPTAX/100) ;

regle 301233:
application : iliad ;

BCICAPAVIS = arr(PRELIBXT * TX90/100) ;

CICAP = max(0 , min(IPCAPTAXTOT , BCICAP)) ;

regle 301235:
application : iliad ;

CICAPAF = CICAP ;

regle 301240:
application : iliad ;

BCICHR = arr(CHRAPRES * ((REGCIAUTO+CIIMPPRO)*(1-present(COD8XY))+COD8XY+0) / 
                        (REVKIREHR*(1-positif(IPTEFP+INDTEFF)) + REVKIREHRTEF * positif(IPTEFP+INDTEFF)));
regle 301242:
application : iliad ;

CICHR = max(0,min(IRB + TAXASSUR + IPCAPTAXT +CHRAPRES - AVFISCOPTER ,min(CHRAPRES,BCICHR)));
regle 301245:
application : iliad ;

CICHRAF = max(0,min(IRBAF + TAXASSUR + IPCAPTAXT +CHRAPRES ,min(CHRAPRES,BCICHR)));
regle 301247:
application : iliad ;

BCICHR3WH = arr(CHRAPRES3WH * (REGCIAUTO*(1-present(COD8XY))+COD8XY+0) / ((REVKIREHR*(1-INDTEFF) + REVKIREHRTEF * INDTEFF)+PVREPORT));

regle 301249:
application : iliad ;

CICHR3WH = max(0,min(IRB + TAXASSUR + IPCAPTAXT +CHRAPRES3WH - AVFISCOPTER ,min(CHRAPRES3WH,BCICHR3WH)));

regle 301252:
application : iliad ;

CICHR3WHAF = max(0,min(IRBAF + TAXASSUR + IPCAPTAXTOT +CHRAPRES3WH -CICAPAF ,min(CHRAPRES3WH,BCICHR3WH)));

regle 301257:
application : iliad ;



DSYND = RDSYVO + RDSYCJ + RDSYPP ;


SOMBCOSV = TSHALLOV + COD1AA + CARTSV + ALLOV + REMPLAV + COD1GB + COD1GF + COD1GG + COD1AF  
           + CODRAF + COD1AG + CODRAG + PRBRV + CARPEV + PALIV + PENSALV + CODDAJ + CODEAJ 
	   + PENINV + CODRAZ + COD1AL + CODRAL + COD1AM + CODRAM + COD1TP + GLDGRATV 
	   + COD1TZ + COD1NX + max(0,COD1GH - LIM5000) + COD1ADRET ;

SOMBCOSC = TSHALLOC + COD1BA + CARTSC + ALLOC + REMPLAC + COD1HB + COD1HF + COD1HG + COD1BF 
           + CODRBF + COD1BG + CODRBG + PRBRC + CARPEC + PALIC + PENSALC + CODDBJ + CODEBJ 
	   + PENINC + CODRBZ + COD1BL + CODRBL + COD1BM + CODRBM + COD1UP + GLDGRATC + COD1OX 
	   + max(0,COD1HH - LIM5000) + COD1BDRET ;

SOMBCOSP = TSHALLO1 + TSHALLO2 + TSHALLO3 + TSHALLO4 + COD1CA + COD1DA + COD1EA + COD1FA   
           + CARTSP1 + CARTSP2 + CARTSP3 + CARTSP4 + ALLO1 + ALLO2 + ALLO3 + ALLO4    
           + REMPLAP1 + REMPLAP2 + REMPLAP3 + REMPLAP4 + COD1IB + COD1IF + COD1JB   
           + COD1JF + COD1KF + COD1LF + COD1CF + COD1DF + COD1EF + COD1FF   
           + CODRCF + CODRDF + CODREF + CODRFF + COD1CG + COD1DG + COD1EG + COD1FG    
           + CODRCG + CODRDG + CODRGG + CODRFG + PRBR1 + PRBR2 + PRBR3 + PRBR4     
           + CARPEP1 + CARPEP2 + CARPEP3 + CARPEP4 + PALI1 + PALI2 + PALI3 + PALI4     
           + PENSALP1 + PENSALP2 + PENSALP3 + PENSALP4 + PENIN1 + PENIN2 + PENIN3 + PENIN4    
           + CODRCZ + CODRDZ + CODREZ + CODRFZ + COD1CL + COD1DL + COD1EL + COD1FL    
           + CODRCL + CODRDL + CODREL + CODRFL + COD1CM + COD1DM + COD1EM + COD1FM    
           + CODRCM + CODRDM + CODREM + CODRFM + COD1IG + COD1JG + COD1KG + COD1LG 
	   + max(0,COD1IH - LIM5000)+ max(0,COD1JH - LIM5000)+ max(0,COD1KH - LIM5000)+ max(0,COD1LH - LIM5000)
	   + PREXRET ;


BCOS = min(RDSYVO+0,arr(TX_BASECOTSYN/100*SOMBCOSV*IND_10V))
      +min(RDSYCJ+0,arr(TX_BASECOTSYN/100*SOMBCOSC*IND_10C))                             
      +min(RDSYPP+0,arr(TX_BASECOTSYN/100*SOMBCOSP*IND_10P));

ASYND = BCOS * (1-V_CNR) ;


CISYND = arr(TX_REDCOTSYN/100 * BCOS) * (1 - V_CNR) ;

regle 301260:
application : iliad ;


IAVF = IRE - EPAV + CICORSE + CIRCMAVFT ;


DIAVF2 = (IPRECH + IPCHER + RCMAVFT ) * (1 - positif(RE168+TAX1649)) + CIRCMAVFT * positif(RE168+TAX1649);


IAVF2 = (IPRECH + CIRECH + CIRCMAVFT + 0) * (1 - positif(RE168 + TAX1649))
        + CIRCMAVFT * positif(RE168 + TAX1649) ;

IAVFGP = IAVF2 + CREFAM ;

regle 301270:
application : iliad ;


I2DH = EPAV ;

regle 301280:
application : iliad ;





 CONDRFR2 = V_BTRFRN2 * (1 - positif(present(RFRN2) + present(COD8XZ)) )   
	+ (RFRN2 * (1 - present(COD8XZ)) )
	+ COD8XZ 
	+ 0 ;

 CONDRFR1 = V_BTRFRN1 * (1 - positif(present(RFRN1) + present(COD8YZ)) )
	+ (RFRN1 * (1 - present(COD8YZ)) )
	+ COD8YZ 
	+ 0 ;





regle 301282:
application : iliad ;


VARIDF = positif( V_INDIDF *  (1-present(CODIDF)) + CODIDF ) + 0 ;


RFRMIN = VARIDF * (null(1-NBPERS) * LIM_IDF1
	+ null(2-NBPERS) * LIM_IDF2
	+ null(3-NBPERS) * LIM_IDF3
	+ null(4-NBPERS) * LIM_IDF4
	+ null(5-NBPERS) * LIM_IDF5
	+ positif(NBPERS-5) * (LIM_IDF5 + (LIM_IDFSUP * (NBPERS-5))) ) 
	+ ( 1- VARIDF) * (null(1-NBPERS) * LIM_NONIDF1
	+ null(2-NBPERS) * LIM_NONIDF2
	+ null(3-NBPERS) * LIM_NONIDF3
	+ null(4-NBPERS) * LIM_NONIDF4
	+ null(5-NBPERS) * LIM_NONIDF5
	+ positif(NBPERS-5) * (LIM_NONIDF5 + (LIM_NONIDFSUPN * (NBPERS-5))) ) ;


RFRMAX = null(1-NBPT)		*	LIM_RFRMAX1
        + null(1.25-NBPT)	*	LIM_RFRMAX125
	+ null(1.50-NBPT)	*	LIM_RFRMAX15
	+ null(1.75-NBPT)	*	LIM_RFRMAX175
	+ null(2-NBPT)		*	LIM_RFRMAX2
	+ null(2.25-NBPT)	*	LIM_RFRMAX225
	+ null(2.5-NBPT)	*	LIM_RFRMAX25
	+ null(2.75-NBPT)	*	LIM_RFRMAX275
	+ null(3-NBPT)		*	LIM_RFRMAX3 
	+ arr( positif(NBPT-3)  *	(LIM_RFRMAX3 + arr((LIM_PSUP1 / 2) * ((NBPT-3)/ (1/4) )) ) 
		) ;


regle 301284:
application : iliad ;



CONDINDR = positif(
	positif(positif(CONDRFR2 - RFRMIN) * positif(RFRMAX - CONDRFR2) 
		+ positif(CONDRFR1 - RFRMIN) * positif(RFRMAX - CONDRFR1))
	* positif(RFRMAX-RFRMIN) + positif(CODAUT));  



regle 301286:
application : iliad ;


BTANTGECUM = (V_BTGECUM * 
	(1 - positif(present(COD7ZZ) + present(COD7ZY) + present(COD7ZX) + present(COD7ZW))) 
	+ COD7ZZ + COD7ZY + COD7ZX + COD7ZW);


BTANTGECUMWL =   V_BTPRT9 * (1 - present(COD7WK)) + COD7WK
	+ V_BTPRT8 * (1 - present(COD7WQ)) + COD7WQ
	+ V_BTPRT7 * (1- present (COD7WH)) + COD7WH
	+ V_BTPRT6 * (1- present (COD7WS)) + COD7WS
	+ V_BTPRT5 * (1- present (COD7XZ)) + COD7XZ
	+ V_BTPRT4 * (1- present (COD7XR)) + COD7XR
	+ V_BTPRT3 * (1- present (COD7XV)) + COD7XV
	+ V_BTPRT2 * (1- present (COD7XG)) + COD7XG
	+ V_BTPRT1 * (1- present (COD7XF)) + COD7XF
	;


P2GE = max(  ((PLAF_GE2 * (1 + BOOL_0AM)
	+ PLAF_GE2_PACQAR * (V_0CH + V_0DP)
	+ PLAF_GE2_PAC * (V_0CR + V_0CF + V_0DJ + V_0DN) )
	- BTANTGECUM) , 0 )
	;


P2GEWL = max(0,PLAF20000 - BTANTGECUMWL);

regle 301288:
application : iliad ;


BGEPAHA = CONDINDR * ( min(COD7WI, P2GE) * (1 - V_CNR)) * present(COD7WI);


BGTECH = min(RDTECH , P2GEWL) * (1 - V_CNR) ;

regle 301290:
application : iliad ;


 BGEPAHA1 = (BGEPAHA * (1 - present(CODAUT) ) )  + ( COD7WI * (present(CODAUT) * present(COD7WI) ) ) ;


BGEDECL = RDTECH + COD7WI ;

TOTBGE = BGTECH + BGEPAHA1 ;


regle 301292:
application : iliad ;


RGEPAHA = (CODAUT * (present(CODAUT) * present(COD7WI) ) ) 
	+ 
	  ( (1 - present(CODAUT)) * BGEPAHA * (TX25 / 100 ) ) ;

RGTECH = (BGTECH *( TX40 / 100));

CIGE = ( (arr (RGTECH + RGEPAHA )) * (1 - positif(RE168 + TAX1649)) ) + 0 ;


DEPENDPDC = BGEPAHA ;


DEPENPPRT = BGTECH ;

regle 301294:
application : iliad ;

GECUM = min(P2GE,BGEPAHA)+(V_BTGECUM * (1 - positif(present(COD7ZY)+present(COD7ZX)+present(COD7ZW) + present(COD7ZZ))) + COD7ZZ + COD7ZW +COD7ZX + COD7ZY);
GECUMWL = max(0,BGTECH + BTANTGECUMWL) ;

BADCRE = min(max(0,CREAIDE-COD7DR) , min((LIM_AIDOMI * (1 - positif(PREMAIDE)) + LIM_PREMAIDE * positif(PREMAIDE)
                            + MAJSALDOM * (positif_ou_nul(ANNEEREV-V_0DA-65) + positif_ou_nul(ANNEEREV-V_0DB-65) * BOOL_0AM
                                           + V_0CF + V_0DJ + V_0DN + (V_0CH + V_0DP)/2+ASCAPA)
                           ) , LIM_AIDOMI3 * (1 - positif(PREMAIDE)) + LIM_PREMAIDE2 * positif(PREMAIDE) ) * (1-positif(INAIDE + 0))
                               +  LIM_AIDOMI2 * positif(INAIDE + 0)) ;

DAIDC = max(0 , CREAIDE - COD7DR) ;
AAIDC = BADCRE * (1 - V_CNR) ;
CIADCRE = max(0 , arr(BADCRE * TX_AIDOMI /100)) * (1 - positif(RE168 + TAX1649)) * (1 - V_CNR) ;
CIADCREB3 = COD7HB ;

regle 301310:
application : iliad ;

DTEC = RISKTEC;
ATEC = positif(DTEC) * DTEC;
CITEC = arr (ATEC * TX40/100);

regle 301330:
application : iliad ;



EM7AVRICI = somme (i=0..7: min (1 , max(0 , V_0Fi + AG_LIMFG - ANNEEREV+1)))
         + somme (j=0..5: min (1 , max(0 , V_0Nj + AG_LIMFG - ANNEEREV+1)))
      + (1 - positif(somme(i=0..7:V_0Fi) + somme(i=0..5: V_0Ni) + 0)) * (V_0CF + V_0DN) ;

EM7QARAVRICI = somme (i=0..5: min (1 , max(0 , V_0Hi + AG_LIMFG - ANNEEREV+1)))
         + somme (j=0..3: min (1 , max(0 , V_0Pj + AG_LIMFG - ANNEEREV+1)))
         + (1 - positif(somme(i=0..5: V_0Hi) + somme(j=0..3: V_0Pj) + 0)) * (V_0CH + V_0DP) ;

EM7 = somme (i=0..7: min (1 , max(0 , V_0Fi + AG_LIMFG - ANNEEREV)))
         + somme (j=0..5: min (1 , max(0 , V_0Nj + AG_LIMFG - ANNEEREV)))
       + ((1 - positif(somme(i=0..7:V_0Fi) + 0)) * V_0CF + (1 - positif(somme(j=0..5: V_0Nj)+ 0)) * V_0DN); 

EM7QAR = somme (i=0..5: min (1 , max(0 , V_0Hi + AG_LIMFG - ANNEEREV)))
         + somme (j=0..5: min (1 , max(0 , V_0Pj + AG_LIMFG - ANNEEREV)))
         + ((1 - positif(somme(i=0..5:V_0Hi) + 0)) * V_0CH + (1 - positif(somme(j=0..5: V_0Pj)+ 0)) * V_0DP); 
	 
BRFG = min(RDGARD1,PLAF_REDGARD) + min(RDGARD2,PLAF_REDGARD)
       + min(RDGARD3,PLAF_REDGARD) + min(RDGARD4,PLAF_REDGARD)
       + min(RDGARD1QAR,PLAF_REDGARDQAR) + min(RDGARD2QAR,PLAF_REDGARDQAR)
       + min(RDGARD3QAR,PLAF_REDGARDQAR) + min(RDGARD4QAR,PLAF_REDGARDQAR)
       ;
RFG1 = arr( (BRFG + CODFGR + CODFHR) * TX_REDGARD /100 ) * (1 -V_CNR) ;
DGARD = somme(i=1..4:RDGARDi)+somme(i=1..4:RDGARDiQAR) + CODFGD + CODFHD ;
AGARD = (BRFG + CODFGR + CODFHR) * (1-V_CNR) ;
CIGARD = RFG1 * (1 - positif(RE168 + TAX1649)) ;

regle 301341:
application : iliad ;



FORESTR = COTFORET ;


BIACOTFOR =  min(FORESTR , PLAF_FOREST1 * (1 + BOOL_0AM)) * (1 - V_CNR) ; 

CIRCOTFOR = max( arr(BIACOTFOR * TX76/100), 0) ;

regle 301342:
application : iliad ;




DFOREST = RDFOREST ;


BIAFOREST = min(RDFOREST, PLAF_FOREST * (1 + BOOL_0AM)) * (1 - V_CNR) ;


CIRFOR = arr( max(0 , BIAFOREST * TX25/100)) * (1 - V_CNR) ;

regle 301350:
application : iliad ;


BDCIFORET = COD7VV + COD7TJ + COD7VS + COD7TH + COD7VU + COD7TI + COD7VQ + COD7TE + COD7VR + COD7TF + COD7VM + COD7TA + COD7VN + COD7TB + COD7TV + COD7TW + COD7TT + COD7TU + COD7TR + COD7TS + COD7TP + COD7TQ + RDFORESTRA + SINISFORET ; 


VARTMP1 = 0 ;

BCIFORETTQ = max(0 , min(COD7TQ , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETTQ ;

BCIFORETTP = max(0 , min(COD7TP , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETTP ;

BCIFORETTS = max(0 , min(COD7TS , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETTS ;

BCIFORETTR = max(0 , min(COD7TR , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETTR ;

BCIFORETTU = max(0 , min(COD7TU , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETTU ;

BCIFORETTT = max(0 , min(COD7TT , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETTT ;

BCIFORETTW = max(0 , min(COD7TW , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETTW ;

BCIFORETTV = max(0 , min(COD7TV , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETTV ;

BCIFORETVN = max(0 , min(COD7VN , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETVN ;

BCIFORETTB = max(0 , min(COD7TB , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETTB ;

BCIFORETVM = max(0 , min(COD7VM , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETVM ;

BCIFORETTA = max(0 , min(COD7TA , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETTA ;

BCIFORETVR = max(0 , min(COD7VR , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETVR ;

BCIFORETTF = max(0 , min(COD7TF , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETTF ;

BCIFORETVQ = max(0 , min(COD7VQ , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETVQ ;

BCIFORETTE = max(0 , min(COD7TE , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETTE ;

BCIFORETVU = max(0 , min(COD7VU , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETVU ;

BCIFORETTI = max(0 , min(COD7TI , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETTI ;

BCIFORETVS = max(0 , min(COD7VS , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETVS ;

BCIFORETTH = max(0 , min(COD7TH , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETTH ;

BCIFORETVV = max(0 , min(COD7VV , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETVV ;

BCIFORETTJ = max(0 , min(COD7TJ , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETTJ ;

BCIFORETUP = max(0 , min(RDFORESTRA , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = VARTMP1 + BCIFORETUP ;

BCIFORETUT = max(0 , min(SINISFORET , max(0 , PLAF_FOREST1 * (1 + BOOL_0AM)-VARTMP1))) * (1-V_CNR) ;
VARTMP1 = 0 ;

BCIFORET = BCIFORETTQ + BCIFORETTP + BCIFORETTS + BCIFORETTR + BCIFORETTU + BCIFORETTT + BCIFORETTW + BCIFORETTV + BCIFORETVN + BCIFORETTB + BCIFORETVM + BCIFORETTA
         + BCIFORETVR + BCIFORETTF + BCIFORETVQ + BCIFORETTE + BCIFORETVU + BCIFORETTI + BCIFORETVS + BCIFORETTH + BCIFORETVV + BCIFORETTJ + BCIFORETUP + BCIFORETUT ;

CIFORET = arr((BCIFORETTP + BCIFORETTR + BCIFORETTT + BCIFORETTV + BCIFORETVM + BCIFORETTA + BCIFORETVQ + BCIFORETTE + BCIFORETVS + BCIFORETTH  
                                                                  ) * TX18/100
        +  (BCIFORETTQ + BCIFORETTS + BCIFORETTU + BCIFORETTW + BCIFORETVN + BCIFORETTB + BCIFORETVR + BCIFORETTF + BCIFORETVU + BCIFORETTI + BCIFORETVV + BCIFORETTJ + BCIFORETUP + BCIFORETUT  
                                                                  ) * TX25/100) ;


CIFOR = CIFORET + CIRFOR + CIRCOTFOR ;								  
regle 301360:
application : iliad ;



VARTMP1 = COD7TQ + COD7TP ;
							   
REPCIFADSSN5 = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7TS
             + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7TS - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7TS ;

REPCIFSN5 = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7TR
          + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7TR - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7TR ;
			     

REPCIFADSSN4 = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7TU
                + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7TU - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7TU ;

REPCIFSN4 = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7TT
             + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7TT - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7TT ;

							   
REPCIFADSSN3 = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7TW
               + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7TW - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7TW ;
							   
REPCIFSN3 = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7TV
             + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7TV - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7TV + COD7VN ;



REPCIFADSSN2 = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7TB
               + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7TB - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7TB + COD7VM ;

REPCIFSN2 = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7TA
            + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7TA - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7TA ;



REPCIFADHSN1 = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7VR
            + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7VR - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7VR ;

REPCIFADSSN1 = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7TF
               + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7TF - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7TF ;

REPCIFHSN1 = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7VQ
             + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7VQ - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7VQ ;

REPCIFSN1 = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7TE
            + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7TE - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7TE ;



REPCIFAD = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7VU 
            + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7VU - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7VU ;
							   
REPCIFADSIN = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7TI
               + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7TI - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7TI ;
							   
REPCIF = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7VS 
          + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7VS - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7VS ;
							   
REPCIFSIN = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7TH
             + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7TH - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7TH ;	   



REPCIM = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7VV
             + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7VV - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7VV ;

REPCIMSIN = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * COD7TJ
             + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , COD7TJ - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + COD7TJ ;



REPCIHSA = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * RDFORESTRA
            + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , RDFORESTRA - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = VARTMP1 + RDFORESTRA ;

REPCISA = (positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM)) * SINISFORET
             + (1 - positif_ou_nul(VARTMP1 - PLAF_FOREST1 * (1 + BOOL_0AM))) * max(0 , SINISFORET - (PLAF_FOREST1 * (1 + BOOL_0AM) - VARTMP1))) * (1 - V_CNR) ;
VARTMP1 = 0 ;


regle 301365:
application : iliad ;


REPSISAAT = REPCIFHSN1 + REPCIF ;

REPSISA = REPCIM + REPCIHSA ;

REP7UA = REPCIFADHSN1 + REPCIFAD ;

REP7UB = REPCIFADSSN6 + REPCIFADSSN5 + REPCIFADSSN4 + REPCIFADSSN3 + REPCIFADSSN2  +  REPCIFADSSN1 + REPCIFADSIN ;

REPAPSISAT = REPCIFSN5 + REPCIFSN4 + REPCIFSN3 + REPCIFSN2 + REPCIFSN1  + REPCIFSIN ;

REPAPSISA = REPCIMSIN + REPCISA ;

regle 301370:
application : iliad ;


CICSG = min(CSGC , arr((IPPNCS + 8SGAUTO) * T_CSGCRDS/100)) ;

CIRDS = min(RDSC , arr((min(REVCSXA , SALECS) + min(REVCSXB , SALECSG + COD8SC)
                        + min(REVCSXC , ALLECS + COD8QV) + min(REVCSXD , INDECS + COD8SW)
                        + min(REVCSXE , PENECS + COD8QX + COD8SX) + min(COD8XI , COD8SA)
                        + min(COD8XJ , COD8SB) + min (COD8XM , GLDGRATV + GLDGRATC)
                        + min(COD8XO , COD8TH  + COD8QH) + min (COD8XN , COD8SD)
                         ) * T_RDS/100)
			)
                      ;

CIPSOL = min(MPSOL , arr((IPPNCS + arr(8SGAUTO)) * TXPSOL/100)) ;

CICVN = min( CVNSALC , arr( min(BCVNSAL,COD8XL) * TX10/100 )) ;

CIGLOA = min( CGLOA , arr ( min(GLDGRATV+GLDGRATC,COD8XM) * T_CSG/100));


CIRSE1 = min( RSE1 , arr( min(SALECS,REVCSXA) * TXTQ/100 ));

RSE8TV = arr(BRSE8TV * TXTV/100) * (1 - positif(ANNUL2042));
RSE8QV = arr(BRSE8QV * TXTV/100) * (1 - positif(ANNUL2042));
RSE8SA = arr(BRSE8SA * TXTV/100) * (1 - positif(ANNUL2042));
CIRSE8TV = min( RSE8TV , arr( min(ALLECS,REVCSXC) * TXTV/100 )) ;
CIRSE8SA = min( RSE8SA , arr(min(COD8SA,COD8XI) * TXTV/100 )) ;
CIRSE2 = min(RSE2, arr(min(ALLECS + COD8QV,REVCSXC)* TXTV/100 + min(COD8SA,COD8XI) * TXTV/100)
                      + CICSG8TV * (1-positif(REVCSXC)) + CICSG8QV * (1-positif(COD8XI)));

CIRSE3 = min( RSE3 , arr( min(COD8SW+INDECS,REVCSXD * TXTW/100 )));

RSE8TX = arr(BRSE8TX * TXTX/100) * (1 - positif(ANNUL2042));
RSE8SB = arr(BRSE8SB * TXTX/100) * (1 - positif(ANNUL2042));
CIRSE8TX = min( RSE8TX , arr( REVCSXE * TXTX/100 )) ;
CIRSE8SB = min( RSE8SB , arr( COD8XJ * TXTX/100 ));
CIRSE4 =  min(RSE4, arr(min(PENECS + COD8QX + COD8SX,REVCSXE)* TXTX/100 + min(COD8XJ,COD8SB) * TXTX/100)
                         + CICSG8TX * (1-positif(REVCSXE)) + CICSG8QX* (1-positif(COD8SB))) ;

CIRSE5 = min( RSE5 , arr( min(SALECSG+COD8SC,REVCSXB) * TXTR/100 ));

CIRSE6 = min( RSE6 , arr(( min( REVCSXB , SALECSG+COD8SC ) +
                           min( REVCSXC , ALLECS + COD8QV ) +
                           min( COD8XI , COD8SA ) +
                           min( COD8XN, COD8SD )  +
                           min( COD8XO, COD8TH + COD8QH )
                         ) * TXCASA/100 ) + CICASA8TH * (1-positif(COD8XO)) + CICASA8QH * (1-positif(COD8XO))
                                          + CICASA8TV * (1-positif(REVCSXC)) + CICASA8QV* (1-positif(REVCSXC)) );


CIRSE8 =  arr((min(COD8XN ,COD8SD) + min(COD8XO , COD8TH + COD8QH)) * TX066/100
                            + (CICSG8TH + CICSG8QH) * (1-positif(COD8XO))) ;

CIRSETOT = CIRSE1 + CIRSE2 + CIRSE3 + CIRSE4 + CIRSE5 + CIRSE8 ;

regle 301380:
application : iliad ;

CRESINTER = PRESINTER ;

regle 301385:
application : iliad ;



BDCIVHELEC = COD7ZQ + COD7ZR + COD7ZS + COD7ZT + COD7ZU + COD7ZV ; 
BCI7ZQ = COD7ZQ * (1-positif(V_BT7ZQ2*(1-null(COD8VC)) +COD8VC +V_BT7ZQ*(1-null(COD8VG)) + COD8VG))+0;
BCI7ZR = COD7ZR * (1-positif(V_BT7ZR2*(1-null(COD8VD)) +COD8VD +V_BT7ZR*(1-null(COD8VH)) + COD8VH))+0;
BCI7ZS = COD7ZS * (1-positif(V_BT7ZS2*(1-null(COD8VE)) +COD8VE +V_BT7ZS*(1-null(COD8VI)) + COD8VI))+0;
BCI7ZT = COD7ZT * (1-positif(V_BT7ZT2*(1-null(COD8VF)) +COD8VF +V_BT7ZT*(1-null(COD8VJ)) + COD8VJ))+0;


CI7ZQ = min(BCI7ZQ * TX75/100,LIM500*(1-positif(COD7YG))+LIM300 * positif(COD7YG))+0;
CI7ZR = min(BCI7ZR * TX75/100,LIM500*(1-positif(COD7YG))+LIM300 * positif(COD7YG))+0;
CI7ZS = min(BCI7ZS * TX75/100,LIM500*(1-positif(COD7YH))+LIM300 * positif(COD7YH))+0;
CI7ZT = min(BCI7ZT * TX75/100,LIM500*(1-positif(COD7YH))+LIM300 * positif(COD7YH))+0;
CI7ZU = min(COD7ZU * TX75/100,LIM500) ;
CI7ZV = min(COD7ZV * TX75/100,LIM500) ;


BCIVHELEC =    (BCI7ZQ + BCI7ZR + BCI7ZS + BCI7ZT + COD7ZU + COD7ZV) * (1-V_CNR) ; 

CIVHELEC = arr(CI7ZQ + CI7ZR + CI7ZS + CI7ZT + CI7ZU + CI7ZV)  * (1-V_CNR);

regle 301390:
application : iliad ;

REST = positif(IRE) * positif(CRESTACID) ;
VARTMP1 = 0 ;

LIBREST = positif(REST) * max(0 , min(AUTOVERSLIB , CRESTACID - VARTMP1)) ;
LIBIMP = positif_ou_nul(LIBREST) * (AUTOVERSLIB - LIBREST) ;
VARTMP1 = VARTMP1 + AUTOVERSLIB ;

8TEREST = positif(REST) * max(0 , min(COD8TE , CRESTACID - VARTMP1)) ;
8TEIMP = positif_ou_nul(8TEREST) * (COD8TE - 8TEREST) ;
VARTMP1 = VARTMP1 + COD8TE ;

AGRREST = positif(REST) * max(0 , min(CICONGAGRI , CRESTACID - VARTMP1)) ;
AGRIMP = positif_ou_nul(AGRREST) * (CICONGAGRI - AGRREST) ;
VARTMP1 = VARTMP1 + CICONGAGRI ;

ARTREST = positif(REST) * max(0 , min(CREARTS , CRESTACID - VARTMP1)) ;
ARTIMP = positif_ou_nul(ARTREST) * (CREARTS - ARTREST) ;
VARTMP1 = VARTMP1 + CREARTS ;

FORREST = positif(REST) * max(0 , min(CREFORMCHENT , CRESTACID - VARTMP1)) ;
FORIMP = positif_ou_nul(FORREST) * (CREFORMCHENT - FORREST) ;
VARTMP1 = VARTMP1 + CREFORMCHENT ;

PSIREST = positif(REST) * max(0 , min(CRESINTER , CRESTACID - VARTMP1)) ;
PSIIMP = positif_ou_nul(PSIREST) * (CRESINTER - PSIREST) ;
VARTMP1 = VARTMP1 + CRESINTER ;

HVEREST = positif(REST) * max(0 , min(CREAGRIHVE , CRESTACID - VARTMP1)) ;
HVEIMP = positif_ou_nul(HVEREST) * (CREAGRIHVE - HVEREST) ;
VARTMP1 = VARTMP1 + CREAGRIHVE ;

GLYREST = positif(REST) * max(0 , min(CREAGRIGLY , CRESTACID - VARTMP1)) ;
GLYIMP = positif_ou_nul(GLYREST) * (CREAGRIGLY - GLYREST) ;
VARTMP1 = VARTMP1 + CREAGRIGLY ;

BIOREST = positif(REST) * max(0 , min(CREAGRIBIO , CRESTACID - VARTMP1)) ;
BIOIMP = positif_ou_nul(BIOREST) * (CREAGRIBIO - BIOREST) ;
VARTMP1 = VARTMP1 + CREAGRIBIO ;

8WKREST = positif(REST) * max(0 , min(COD8WK , CRESTACID - VARTMP1)) ;
8WKIMP = positif_ou_nul(8WKREST) * (COD8WK - 8WKREST) ;
VARTMP1 = VARTMP1 + COD8WK ;

FAMREST = positif(REST) * max(0 , min(CREFAM , CRESTACID - VARTMP1)) ;
FAMIMP = positif_ou_nul(FAMREST) * (CREFAM - FAMREST) ;
VARTMP1 = VARTMP1 + CREFAM ;

8CVREST = positif(REST) * max(0 , min(COD8CV , CRESTACID - VARTMP1)) ;
8CVIMP = positif_ou_nul(8CVREST) * (COD8CV - 8CVREST) ;
VARTMP1 = VARTMP1 + COD8CV ;

ROFREST = positif(REST) * max(0 , min(CIFORET , CRESTACID - VARTMP1)) ;
ROFIMP = positif_ou_nul(ROFREST) * (CIFORET - ROFREST) ;
VARTMP1 = VARTMP1 + CIFORET ;

RIFREST = positif(REST) * max(0 , min(CIRFOR , CRESTACID - VARTMP1)) ;
RIFIMP = positif_ou_nul(ROFREST) * (CIRFOR - RIFREST) ;
VARTMP1 = VARTMP1 + CIRFOR ;

RASREST =  positif(REST) * max(0 , min(CIRCOTFOR , CRESTACID - VARTMP1)) ;
RASIMP = positif_ou_nul(ROFREST) * (CIRCOTFOR - RASREST) ;
VARTMP1 = VARTMP1 + CIRCOTFOR ;

SALREST = positif(REST) * max(0 , min(CIADCRE , CRESTACID - VARTMP1)) ;
SALIMP = positif_ou_nul(SALREST) * (CIADCRE - SALREST) ;
VARTMP1 = VARTMP1 + CIADCRE ;

SYNREST = positif(REST) * max(0 , min(CISYND , CRESTACID - VARTMP1)) ;
SYNIMP = positif_ou_nul(SYNREST) * (CISYND - SYNREST) ;
VARTMP1 = VARTMP1 + CISYND ;

GARREST = positif(REST) * max(0 , min(CIGARD , CRESTACID - VARTMP1)) ;
GARIMP = positif_ou_nul(GARREST) * (CIGARD - GARREST) ;
VARTMP1 = VARTMP1 + CIGARD ;

BAIREST = positif(REST) * max(0 , min(CICA , CRESTACID - VARTMP1)) ;
BAIIMP = positif_ou_nul(BAIREST) * (CICA - BAIREST) ;
VARTMP1 = VARTMP1 + CICA ;

VEHREST = positif(REST) * max(0 , min(CIVHELEC , CRESTACID - VARTMP1)) ;
VEHIMP = positif_ou_nul(CIVHELEC) * (CIVHELEC - VEHREST) ;
VARTMP1 = VARTMP1 + CIVHELEC ;

TECREST = positif(REST) * max(0 , min(CITEC , CRESTACID - VARTMP1)) ;
TECIMP = positif_ou_nul(TECREST) * (CITEC - TECREST) ;
VARTMP1 = VARTMP1 + CITEC ;

AIDREST = positif(REST) * max(0 , min(CIGE , CRESTACID - VARTMP1)) ;
AIDIMP = positif_ou_nul(AIDREST) * (CIGE - AIDREST) ;
VARTMP1 = VARTMP1 + CIGE ;

HJAREST = positif(REST) * max(0 , min(CIHJA , CRESTACID - VARTMP1)) ;
HJAIMP = positif_ou_nul(HJAREST) * (CIHJA - HJAREST) ;
VARTMP1 = VARTMP1 + CIHJA ;

CORREST = positif(REST) * max(0 , min(CICORSENOW , CRESTACID - VARTMP1)) ;
CORIMP = positif_ou_nul(CORREST) * (CICORSENOW - CORREST) ;
VARTMP1 = VARTMP1 + CICORSENOW ;

EMPREST = positif(REST) * max(0 , min(COD8TL , CRESTACID - VARTMP1)) ;
EMPIMP = positif_ou_nul(EMPREST) * (COD8TL - EMPREST) ;
VARTMP1 = VARTMP1 + COD8TL ;

RECREST = positif(REST) * max(0 , min(IPRECH , CRESTACID - VARTMP1)) ;
RECIMP = positif_ou_nul(RECREST) * (IPRECH - RECREST) ;
VARTMP1 = VARTMP1 + IPRECH ;

ASSREST = positif(REST) * max(0 , min(I2DH , CRESTACID - VARTMP1)) ;
ASSIMP = positif_ou_nul(ASSREST) * (I2DH - ASSREST) ;
VARTMP1 = VARTMP1 + I2DH ;

2CKREST = positif(REST) * max(0 , min(CI2CK , CRESTACID - VARTMP1)) ;
2CKIMP = positif_ou_nul(2CKREST) * (CI2CK - 2CKREST) ;
VARTMP1 = 0 ;


ROSFORIMP = ROFIMP + RIFIMP + RASIMP ; 

ROSFOREST = ROFREST + RIFREST + RASREST ; 

