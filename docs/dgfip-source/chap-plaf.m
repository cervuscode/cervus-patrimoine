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


regle 8200:
application : iliad  ;


LIMIT12 = 18000 + max(0, arr( max(0, RI1 + TONEQUO1) * (4/100))) 
		     * (1 - positif(VARRMOND))
	        + max(0, 
		      arr( max(0, 
				VARRMOND 
				 + TONEQUOM1
			      )* (4/100))
		      ) 
		      * positif(VARRMOND);



LIMIT11 = 18000 + max(0, arr( max(0, RI1 + TONEQUO1) * (6/100))) 
		     * (1 - positif(VARRMOND))
	        + max(0, 
		      arr( max(0, 
			        VARRMOND
				  + TONEQUOM1
			      ) * (6/100))
		      ) 
		      * positif(VARRMOND);



LIMIT10 = 20000 + max(0, arr( max(0, RI1 + TONEQUO1) * (8/100))) 
		     * (1 - positif(VARRMOND))
	        + max(0, 
		      arr( max(0,
				VARRMOND
				  + TONEQUOM1
			      ) * (8/100))
		     ) 
		     * positif(VARRMOND);



LIMIT9 = 25000 + max(0, arr( max(0, RI1 + TONEQUO1) * (10/100))) 
		    * (1 - positif(VARRMOND))
               + max(0, 
		     arr( max(0,
			       VARRMOND
				 + TONEQUOM1
			     ) * (10/100))
		    ) 
		    * positif(VARRMOND);
		     
regle 82021:
application : iliad  ;

IRBTEO = max(0 , V_IAD11TEO - min(RRISUP , RLOGSOCTEO + RCOLENTTEO) + ITP + PVMTS + REI + AUTOVERSSUP
                     + IMPETAL19 + IMPETAL20 + IMPETAL21 + IMPETAL22 + IMPETAL23 + COD8UA + COD8UB) ;

IANTEO = max( 0, (IRBTEO - V_INETEO
                 + min(TAXASSUR+0 , max(0,V_INETEO-IRBTEO))
                 + min(IPCAPTAXTOT+0 , max(0,V_INETEO-IRBTEO - min(TAXASSUR+0,max(0,V_INETEO-IRBTEO))))
              )
         )
       ;
NEGIANTEO =  -1 * (min(TAXASSUR+0 , max(0,V_INETEO-IRBTEO))
		 + min(IPCAPTAXTOT+0 , max(0,V_INETEO-IRBTEO - min(TAXASSUR+0,max(0,V_INETEO-IRBTEO))))) ;

IARTEO = min( 0, IANTEO - V_IRETEO ) + max( 0, IANTEO - V_IRETEO ) + NEGIANTEO;
regle 820211:
application : iliad  ;
AVFISCO = (IARTEO - IARAF)* positif_ou_nul(V_INDTEO);

regle 82025:
application : iliad  ;
DIFFTEOREEL = AVFISCO * (1 - V_INDTEO)* positif_ou_nul(V_INDTEO);

regle 8202:
application : iliad  ;
AVFISCOPTER = (AVPLAF9 + AVPLAF10 + AVPLAF11 + AVPLAF12 + AVPLAF13) * positif_ou_nul(V_INDTEO);
regle 82463:
application : iliad  ;


A13RSOC = max(0 , RSOCHYD + RSOCHYDR + RSOCHYC + RSOCHYCR
		  + RSOCHYE + RSOCHYER + RSOCHYF + RSOCHYFR + RSOCHYG + RSOCHYGR + RSOCHYH + RSOCHYHR + RSOCHYI + RSOCHYIR
                  - arr((((INVRETYC + INVRETYCR) * (1 - INDPLAF) + (INVRETYCA + INVRETYCRA) * INDPLAF)) * TX65/100)
                  - arr((((INVRETYD + INVRETYDR) * (1 - INDPLAF) + (INVRETYDA + INVRETYDRA) * INDPLAF)
		       + ((INVRETYE + INVRETYER) * (1 - INDPLAF) + (INVRETYEA + INVRETYERA) * INDPLAF)
		       + ((INVRETYF + INVRETYFR) * (1 - INDPLAF) + (INVRETYFA + INVRETYFRA) * INDPLAF)
		       + ((INVRETYG + INVRETYGR) * (1 - INDPLAF) + (INVRETYGA + INVRETYGRA) * INDPLAF)
		       + ((INVRETYH + INVRETYHR) * (1 - INDPLAF) + (INVRETYHA + INVRETYHRA) * INDPLAF)
		       + ((INVRETYI + INVRETYIR) * (1 - INDPLAF) + (INVRETYIA + INVRETYIRA) * INDPLAF)) * TX70/100)
             ) * (1 - V_CNR) ;

regle 82473:
application : iliad  ;


A13RENT = (RLOCHFP + RLOCHFR + RLOCHFU + RLOCHGU + RLOCHGW + RLOCHHU + RLOCHHW + RLOCHIU + RLOCHIW + RLOCHJU + RLOCHJW + RLOCHKU + RLOCHKW + RLOCHFW 
           + max (0 , RLOCHFN + RLOCHGT + RLOCHGS + RLOCHHT + RLOCHHS + RLOCHIT + RLOCHIS + RLOCHJT + RLOCHJS + RLOCHKT + RLOCHKS + RLOCHFO + RLOCHFS + RLOCHFT 
	              + RLOCHFNR + RLOCHGTR + RLOCHGSR + RLOCHHTR + RLOCHHSR + RLOCHITR + RLOCHISR + RLOCHJTR + RLOCHJSR + RLOCHKTR + RLOCHKSR + RLOCHFOR + RLOCHFSR 
		      + RLOCHFTR 
                    - (
		         arr(((INVRETFN + INVRETFNR) * (1 - INDPLAF) + (INVRETFNA + INVRETFNRA) * INDPLAF) * TX5263/100)
                       + arr(((INVRETGT + INVRETGTR) * (1 - INDPLAF) + (INVRETGTA + INVRETGTRA) * INDPLAF) * TX66/100)
                       + arr(((INVRETGS + INVRETGSR) * (1 - INDPLAF) + (INVRETGSA + INVRETGSRA) * INDPLAF) * TX56/100)
                       + arr(((INVRETHT + INVRETHTR) * (1 - INDPLAF) + (INVRETHTA + INVRETHTRA) * INDPLAF) * TX66/100)
                       + arr(((INVRETHS + INVRETHSR) * (1 - INDPLAF) + (INVRETHSA + INVRETHSRA) * INDPLAF) * TX56/100)
                       + arr(((INVRETIT + INVRETITR) * (1 - INDPLAF) + (INVRETITA + INVRETITRA) * INDPLAF) * TX66/100)
                       + arr(((INVRETIS + INVRETISR) * (1 - INDPLAF) + (INVRETISA + INVRETISRA) * INDPLAF) * TX56/100)
                       + arr(((INVRETJT + INVRETJTR) * (1 - INDPLAF) + (INVRETJTA + INVRETJTRA) * INDPLAF) * TX66/100)
                       + arr(((INVRETJS + INVRETJSR) * (1 - INDPLAF) + (INVRETJSA + INVRETJSRA) * INDPLAF) * TX56/100)
                       + arr(((INVRETKT + INVRETKTR) * (1 - INDPLAF) + (INVRETKTA + INVRETKTRA) * INDPLAF) * TX66/100)
                       + arr(((INVRETKS + INVRETKSR) * (1 - INDPLAF) + (INVRETKSA + INVRETKSRA) * INDPLAF) * TX56/100)
		       + arr(((INVRETFO + INVRETFOR) * (1 - INDPLAF) + (INVRETFOA + INVRETFORA) * INDPLAF) * TX625/100)
		       + arr(((INVRETFS + INVRETFSR) * (1 - INDPLAF) + (INVRETFSA + INVRETFSRA) * INDPLAF) * TX56/100)
		       + arr(((INVRETFT + INVRETFTR) * (1 - INDPLAF) + (INVRETFTA + INVRETFTRA) * INDPLAF) * TX66/100)
		       )
                  )
             ) * (1 - V_CNR) ;

regle 8249:
application : iliad  ;
BA10RFOR  = arr(BASE7UTF * TX25 / 100 ) ;
A10RFOR_1 = max(0 , min(BA10RFOR , RRI1-RLOGDOMTOT-RCOMP-RRETU-RDONS-CRDIE-RDUFREP-RPINELTOT-RNORMTOT-RNOUV-RPENTDY-RPENTEY)) ;

A10RFOR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (A10RFOR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(A10RFOR_1,max(max(A10RFOR_P,A10RFOR_PA),A10RFOR1731))*(1-V_INDTEO)+A10RFOR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0 ;

regle 8250:
application : iliad  ;
A13REELA = RLOCANAH + RFIPDOM + RFIPC + RPRESSE + RINNO + RSOUFIP + RRIRENOV + RDUFREP 
           + RPIREPRZ + RPIREPRB + RPIREPRF + RPIREPJM + RPIREPKM 
	   + RPIQI + RPIQJ + RPIJN + RPIJO + RPIQM + RPIQN + RPIJV + RPIJW + RPIJI + RPIJJ 
	   + RPIPK + RPIPM + RPIVD + RPIVE + RPIQR + RPIQS + RPIRR + RPIWA + RPIRV + RPIVW + RPIVX 
	   + RPISD + RPISE + RPIIA + RPIIB + RPIXA + RPIRX + RPIOF + RPINA + RPINC + RPISH + RPISY 
	   + RNOJE + RNOJF + RNONO + RNONP + RNOLQ + RNOLR + RNOIE + RNOIF
           + RNORMJA + RNORMJB + RNORMJR + RNORMJS + RNORMLG + RNORMLH + RNONI + RNONJ + RNONM + RNONN
           + arr(RSNCS + RSNCX + RSNCA + RSNCT + RSNCW + RSNCU + RSNCP + RSNCQ + RSNCH + RSNCI + RSNBS + RSNBU + RSNGW + RSNCO + RSNBW)
           + max(0 , arr(RSNDC + RSNBT) + RPENTEK - LIM3000)
	   + RPENTCY + RPENTDY + RPENTEY + RPENTFY + RPENTGY
           + CIGARD + CIADCRE + CIRFOR + CIRCOTFOR + CIFORET + CIVHELEC 
	   + RILMHS + RILMHX + RILMHH + RILMSA + RILMSN + RILMSP 
	   + RILMOP + RILMSM + RILMSS + RILMST + RILMSX + RILMPS + RILMKI + RILMOE + RCODOY + RCODPZ + RCODMZ + RCODMW + RCODMN
	   + RREHAB ;

A13REELB = RCINE
           + RPIREPTZ + RPIREPRD + RPIREPRH + RPIREPLM + RPIREPMM 
	   + RPIQK + RPIQL + RPIJP + RPIJQ + RPIQO + RPIQP + RPIJX + RPIJY + RPIJK + RPIJL 
	   + RPIPL + RPIPN + RPIVF + RPIVG + RPIQT + RPIQU + RPIRS + RPIWB + RPIRW + RPIVY + RPIVZ 
	   + RPISF + RPISG + RPIIC + RPIID + RPIXB + RPIRY + RPIOG + RPINB + RPIND + RPISI + RPISZ
	   + RNONQ + RNONR + RNOJG + RNOJH + RNOLS + RNOLT + RNOIG + RNOIH
	   + RNORMJC + RNORMJD + RNORMJT + RNORMJU + RNORMLI + RNORMLJ + RNONK + RNONL + RNOPF + RNOPG
	   + RLOG32 + RLOG39 + RLOG46 + RLOG53 + RLOG60 + RLOGHVJ + RLOGHVK + RLOGHVL + RLOGHVM + RLOGHVN
           + A13RSOC + A13RENT ;

regle 8254:
application : iliad  ;
AUBAINE13A = max(0 , min(A13REELA , DIFFTEOREEL)) ;
AUBAINE13B = max(0 , min(A13REELB , DIFFTEOREEL - AUBAINE13A)) ;

regle 8255:
application : iliad  ;


A12REEL = RCELMV + RCELMR + RCELMD + RCELYL + RCELZL + RCELREPWT + RCELRT 
	  + RCELPE + RCELUX + RCELML + RCELRN + RCELKV + RCELNV + RCELLP + RCELIZ
	  + RCELP1D * positif(COD7YD + COD7ZA + COD7ZB + COD7XD + COD7XL + COD7XM) 
	  + RCELP1E + RSC604 + RSC608 + RSC611 + RSC613 + RSC806 + RSC809
	  + RSC308 * positif(COD7CJ + COD7CL + COD7CM) + RSC309 + RCELOW 
	  + RSC617 + RSC621 + RSC623 + RCELIP + RSC306 * positif(COD7HA + COD7HK + COD7HN) 
	  + RSC311 * positif(COD7BZ + COD7DU + COD7DV) + RSC312 + RSC7UE + RSC7UK + RCELVO
          + RILMHR + RILMHW + RILMHG + RILMOQ + RILMSB + RILMSO + RILMKH + RILMOD + RILMPR 
          + RLOG25 + RLOG31 + RLOG38 + RLOG45 + RLOG52 + RLOG59
          + A12RSOC + A12RENT ;

regle 8256:
application : iliad  ;
AUBAINE12 = max(0 , min(A12REEL , DIFFTEOREEL - AUBAINE13A - AUBAINE13B)) ;

regle 8260:
application : iliad  ;


A11REEL = RLOG16 + RLOG21 + RLOG24 + RLOG28 + RLOG30
          + RLOG35 + RLOG37 + RLOG42 + RLOG44 + RLOG49
          + RLOG51 + RLOG56 + RLOG58
          + A11RSOC 
	  + RCELMU + RCELMQ + RCELMC + RCELYK + RCELZK + RCELKC + RCELREPWU
	  + RCELRU + RCELPC + RCELUW + RCELMK + RCELRM + RCELKT + RCELNU + RCELLO + RCELIX
	  + RSC603 + RSC607 + RSC610 + RSC612 + RSC805 + RSC808 + RSC301 * positif(COD7IR + COD7IT + COD7IU)
	  + RSC307 * positif(COD7CB + COD7CF + COD7CG) + RSC308 * positif(COD7CK)
	  + RCELP1D * positif(COD7XE + COD7YF) + RCELP1C * positif(COD7ZC + COD7ZE + COD7ZF + COD7XN + COD7YC + COD7YM) 
	  + RCELOV + RSC616 + RSC620 + RSC622 + RCELIO + RSC306 * positif(COD7HJ) + RSC305 * positif(COD7HY + COD7IQ + COD7IW)
	  + RSC310 * positif(COD7BI + COD7BX + COD7BY) + RSC311 * positif(COD7DI) + RSC7SR + RSC7UB + RSC7UI + RCELVK
	  + RILMSC + RILMHQ + RILMHV + RILMOR + RILMHF + RILMKG + RILMOC + RILMPQ
          + A11RFOR ;

regle 8261:
application : iliad  ;
AUBAINE11 = max(0 , min(A11REEL , DIFFTEOREEL - AUBAINE13A - AUBAINE13B - AUBAINE12)) ;

regle 8262:
application : iliad  ;

A10REEL = RLOG11 + RLOG13 + RLOG15 + RLOG18 + RLOG20 + RLOG23 + RLOG26 + RLOG27
          + RLOG29 + RLOG33 + RLOG34 + RLOG36 + RLOG40 + RLOG41 + RLOG43
          + RLOG47 + RLOG48 + RLOG50 + RLOG54 + RLOG55 + RLOG57
          + A10RSOC 
          + RCELMT + RCELMP + RCELMB + RCELYJ + RCELZJ + RCELKD + RCELREPWV
	  + RCELPD + RCELUV + RCELMJ + RCELRL + RCELKU + RCELNT + RCELLL + RCELIY 
	  + RSC602 + RSC606 + RSC609 + RSC802 + RSC804 + RSC807 + RSC301 * positif(COD7IS)
	  + RSC307 * positif(COD7CC) + RSC302 * positif(COD7GH) + RCELOU
	  + RSC615 + RSC619 + RCELIN + RSC305 * positif(COD7IJ) + RSC304 * positif(COD7KA)
	  + RSC310 * positif(COD7BQ) + RSC7SJ + RSC7TC + RSC7UA + RSC7UG + RCELVL
	  + RCELP1B * positif(COD7ZG + COD7YN) + RCELP1C * positif(COD7ZD + COD7YA)
          + RILMHP + RILMHU + RILMOS + RILMHE + RILMKF + RILMOB + RILMPP
          + A10RFOR ;

regle 8263:
application : iliad  ;
AUBAINE10 = max(0 , min(A10REEL , DIFFTEOREEL - AUBAINE13A - AUBAINE13B - AUBAINE12 - AUBAINE11)) ;

regle 8280:
application : iliad  ;

AUBAINE9 = max(0 , DIFFTEOREEL - AUBAINE13A - AUBAINE13B - AUBAINE12 - AUBAINE11 - AUBAINE10) ;

regle 8290:
application : iliad ;

AVPLAF13A = max(0, AUBAINE13A - LIM10000 ) * positif(DIFFTEOREEL) ;

AVPLAF13B = max(0, min(AUBAINE13A , LIM10000) + AUBAINE13B - LIM18000 ) * positif(DIFFTEOREEL) ;

AVPLAF13 = AVPLAF13A + AVPLAF13B ;

AVPLAF12 = max(0, AUBAINE13A + AUBAINE13B + AUBAINE12 
                  - AVPLAF13 - LIMIT12) * positif(DIFFTEOREEL);
AVPLAF11 = max(0, AUBAINE13A + AUBAINE13B + AUBAINE12 + AUBAINE11 
                  - AVPLAF13 - AVPLAF12 - LIMIT11) * positif(DIFFTEOREEL);
AVPLAF10 = max(0, AUBAINE13A + AUBAINE13B + AUBAINE12 + AUBAINE11 + AUBAINE10 
                  - AVPLAF13 - AVPLAF12 - AVPLAF11 - LIMIT10) * positif(DIFFTEOREEL);
AVPLAF9  = max(0, AUBAINE13A + AUBAINE13B + AUBAINE12 + AUBAINE11 + AUBAINE10 + AUBAINE9 
                  - AVPLAF13 - AVPLAF12 - AVPLAF11 - AVPLAF10 - LIMIT9) * positif(DIFFTEOREEL) ;

regle 8321:
application : iliad  ;
RFTEO = RFORDI + RFROBOR ; 
regle 8331:
application : iliad  ;

RFNTEO = (RFORDI + RFROBOR - min(
                                     min(RFDORD,RFDORD1731+0) * positif(ART1731BIS) + RFDORD * (1 - ART1731BIS)
                                    + min(RFDANT,RFDANT1731+0) * positif(ART1731BIS) + RFDANT * (1 - ART1731BIS) ,
                                    RFORDI + RFROBOR
                                ) 
                           - RFDHIS * (1 - ART1731BIS)
         ) * present(RFROBOR) + RRFI * (1-present(RFROBOR));

regle 8341:
application : iliad  ;
RRFTEO = RFNTEO ;

regle 8400 :
application : iliad  ;

RLOG01_1 = max(min(INVLOG2008 , RRI1) , 0) * (1 - V_CNR) ;
RLOG01 = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG01_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
         + (max(0,min(RLOG01_1,max(max(RLOG01_P,RLOG01_PA),RLOG011731))*(1-V_INDTEO)+RLOG01_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = RLOG01 ;

RLOG02_1 = max(min(INVLGDEB2009 , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
RLOG02 = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG02_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
         + (max(0,min(RLOG02_1,max(max(RLOG02_P,RLOG02_PA),RLOG021731))*(1-V_INDTEO)+RLOG02_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG02 ;

RLOG03_1 = max(min(INVLGDEB , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
RLOG03 = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG03_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
         + (max(0,min(RLOG03_1,max(max(RLOG03_P,RLOG03_PA),RLOG031731))*(1-V_INDTEO)+RLOG03_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG03 ;

RLOG04_1 = max(min(INVOMLOGOA , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
RLOG04 = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG04_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
         + (max(0,min(RLOG04_1,max(max(RLOG04_P,RLOG04_PA),RLOG041731))*(1-V_INDTEO)+RLOG04_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG04 ;

RLOG05_1 = max(min(INVOMLOGOH , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
RLOG05 = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG05_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
         + (max(0,min(RLOG05_1,max(max(RLOG05_P,RLOG05_PA),RLOG051731))*(1-V_INDTEO)+RLOG05_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG05 ;

RLOG06_1 = max(min(INVOMLOGOL , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
RLOG06 = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG06_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
         + (max(0,min(RLOG06_1,max(max(RLOG06_P,RLOG06_PA),RLOG061731))*(1-V_INDTEO)+RLOG06_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG06 ;

RLOG07_1 = max(min(INVOMLOGOO , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
RLOG07 = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG07_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
         + (max(0,min(RLOG07_1,max(max(RLOG07_P,RLOG07_PA),RLOG071731))*(1-V_INDTEO)+RLOG07_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG07 ;

RLOG08_1 = max(min(INVOMLOGOS , RRI1-VARTMP1) , 0) * (1 - V_CNR) ;
RLOG08 = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG08_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
         + (max(0,min(RLOG08_1,max(max(RLOG08_P,RLOG08_PA),RLOG081731))*(1-V_INDTEO)+RLOG08_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG08 ;

RLOG09_1 = max(min((INVRETQL * (1 - INDPLAF) + INVRETQLA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG09 = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG09_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
         + (max(0,min(RLOG09_1,max(max(RLOG09_P,RLOG09_PA),RLOG091731))*(1-V_INDTEO)+RLOG09_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG09 ;

RLOG10_1 = max(min((INVRETQM * (1 - INDPLAF) + INVRETQMA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG10 = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG10_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
         + (max(0,min(RLOG10_1,max(max(RLOG10_P,RLOG10_PA),RLOG101731))*(1-V_INDTEO)+RLOG10_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG10 ;

RLOG11_1 = max(min((INVRETQD * (1 - INDPLAF) + INVRETQDA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG11 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG11_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG11_1,max(max(RLOG11_P,RLOG11_PA),RLOG111731))*(1-V_INDTEO)+RLOG11_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG11 ;

RLOG12_1 = max(min((INVRETOB * (1 - INDPLAF) + INVRETOBA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG12 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG12_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG12_1,max(max(RLOG12_P,RLOG12_PA),RLOG121731))*(1-V_INDTEO)+RLOG12_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG12 ;

RLOG13_1 = max(min((INVRETOC * (1 - INDPLAF) + INVRETOCA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG13 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG13_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG13_1,max(max(RLOG13_P,RLOG13_PA),RLOG131731))*(1-V_INDTEO)+RLOG13_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG13 ;

RLOG14_1 = max(min((INVRETOI * (1 - INDPLAF) + INVRETOIA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG14 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG14_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG14_1,max(max(RLOG14_P,RLOG14_PA),RLOG141731))*(1-V_INDTEO)+RLOG14_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG14 ;

RLOG15_1 = max(min((INVRETOJ * (1 - INDPLAF) + INVRETOJA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG15 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG15_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG15_1,max(max(RLOG15_P,RLOG15_PA),RLOG151731))*(1-V_INDTEO)+RLOG15_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG15 ;

RLOG16_1 = max(min((INVRETOK * (1 - INDPLAF) + INVRETOKA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG16 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG16_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG16_1,max(max(RLOG16_P,RLOG16_PA),RLOG161731))*(1-V_INDTEO)+RLOG16_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG16 ;

RLOG17_1 = max(min((INVRETOM * (1 - INDPLAF) + INVRETOMA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG17 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG17_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG17_1,max(max(RLOG17_P,RLOG17_PA),RLOG171731))*(1-V_INDTEO)+RLOG17_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG17 ;

RLOG18_1 = max(min((INVRETON * (1 - INDPLAF) + INVRETONA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG18 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG18_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG18_1,max(max(RLOG18_P,RLOG18_PA),RLOG181731))*(1-V_INDTEO)+RLOG18_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG18 ;

RLOG19_1 = max(min((INVRETOP * (1 - INDPLAF) + INVRETOPA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG19 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG19_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG19_1,max(max(RLOG19_P,RLOG19_PA),RLOG191731))*(1-V_INDTEO)+RLOG19_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG19 ;

RLOG20_1 = max(min((INVRETOQ * (1 - INDPLAF) + INVRETOQA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG20 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG20_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG20_1,max(max(RLOG20_P,RLOG20_PA),RLOG201731))*(1-V_INDTEO)+RLOG20_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG20 ;

RLOG21_1 = max(min((INVRETOR * (1 - INDPLAF) + INVRETORA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG21 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG21_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG21_1,max(max(RLOG21_P,RLOG21_PA),RLOG211731))*(1-V_INDTEO)+RLOG21_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG21 ;

RLOG22_1 = max(min((INVRETOT * (1 - INDPLAF) + INVRETOTA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG22 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG22_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG22_1,max(max(RLOG22_P,RLOG22_PA),RLOG221731))*(1-V_INDTEO)+RLOG22_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG22 ;

RLOG23_1 = max(min((INVRETOU * (1 - INDPLAF) + INVRETOUA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG23 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG23_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG23_1,max(max(RLOG23_P,RLOG23_PA),RLOG231731))*(1-V_INDTEO)+RLOG23_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG23 ;

RLOG24_1 = max(min((INVRETOV * (1 - INDPLAF) + INVRETOVA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG24 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG24_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG24_1,max(max(RLOG24_P,RLOG24_PA),RLOG241731))*(1-V_INDTEO)+RLOG24_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG24 ;

RLOG25_1 = max(min((INVRETOW * (1 - INDPLAF) + INVRETOWA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG25 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG25_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG25_1,max(max(RLOG25_P,RLOG25_PA),RLOG251731))*(1-V_INDTEO)+RLOG25_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG25 ;

RLOG26_1 = max(min((INVRETOD * (1 - INDPLAF) + INVRETODA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG26 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG26_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG26_1,max(max(RLOG26_P,RLOG26_PA),RLOG261731))*(1-V_INDTEO)+RLOG26_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG26 ;

RLOG27_1 = max(min((INVRETOE * (1 - INDPLAF) + INVRETOEA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG27 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG27_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG27_1,max(max(RLOG27_P,RLOG27_PA),RLOG271731))*(1-V_INDTEO)+RLOG27_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG27 ;

RLOG28_1 = max(min((INVRETOF * (1 - INDPLAF) + INVRETOFA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG28 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG28_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG28_1,max(max(RLOG28_P,RLOG28_PA),RLOG281731))*(1-V_INDTEO)+RLOG28_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG28 ;

RLOG29_1 = max(min((INVRETOG * (1 - INDPLAF) + INVRETOGA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG29 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG29_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG29_1,max(max(RLOG29_P,RLOG29_PA),RLOG291731))*(1-V_INDTEO)+RLOG29_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG29 ;

RLOG30_1 = max(min((INVRETOX * (1 - INDPLAF) + INVRETOXA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG30 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG30_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG30_1,max(max(RLOG30_P,RLOG30_PA),RLOG301731))*(1-V_INDTEO)+RLOG30_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG30 ;

RLOG31_1 = max(min((INVRETOY * (1 - INDPLAF) + INVRETOYA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG31 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG31_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG31_1,max(max(RLOG31_P,RLOG31_PA),RLOG311731))*(1-V_INDTEO)+RLOG31_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG31 ;

RLOG32_1 = max(min((INVRETOZ * (1 - INDPLAF) + INVRETOZA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG32 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG32_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG32_1,max(max(RLOG32_P,RLOG32_PA),RLOG321731)))*(1-V_INDTEO)+RLOG32_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11)) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG32 ;

RLOG33_1 = max(min((INVRETUA * (1 - INDPLAF) + INVRETUAA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG33 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG33_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG33_1,max(max(RLOG33_P,RLOG33_PA),RLOG331731))*(1-V_INDTEO)+RLOG33_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG33 ;

RLOG34_1 = max(min((INVRETUB * (1 - INDPLAF) + INVRETUBA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG34 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG34_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG34_1,max(max(RLOG34_P,RLOG34_PA),RLOG341731))*(1-V_INDTEO)+RLOG34_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG34 ;

RLOG35_1 = max(min((INVRETUC * (1 - INDPLAF) + INVRETUCA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG35 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG35_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG35_1,max(max(RLOG35_P,RLOG35_PA),RLOG351731))*(1-V_INDTEO)+RLOG35_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG35 ;

RLOG36_1 = max(min((INVRETUD * (1 - INDPLAF) + INVRETUDA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG36 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG36_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG36_1,max(max(RLOG36_P,RLOG36_PA),RLOG361731))*(1-V_INDTEO)+RLOG36_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG36 ;

RLOG37_1 = max(min((INVRETUE * (1 - INDPLAF) + INVRETUEA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG37 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG37_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG37_1,max(max(RLOG37_P,RLOG37_PA),RLOG371731))*(1-V_INDTEO)+RLOG37_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG37 ;

RLOG38_1 = max(min((INVRETUF * (1 - INDPLAF) + INVRETUFA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG38 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG38_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG38_1,max(max(RLOG38_P,RLOG38_PA),RLOG381731))*(1-V_INDTEO)+RLOG38_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG38 ;

RLOG39_1 = max(min((INVRETUG * (1 - INDPLAF) + INVRETUGA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG39 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG39_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG39_1,max(max(RLOG39_P,RLOG39_PA),RLOG391731))*(1-V_INDTEO)+RLOG39_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG39 ;

RLOG40_1 = max(min((INVRETUH * (1 - INDPLAF) + INVRETUHA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG40 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG40_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG40_1,max(max(RLOG40_P,RLOG40_PA),RLOG401731))*(1-V_INDTEO)+RLOG40_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG40 ;

RLOG41_1 = max(min((INVRETUI * (1 - INDPLAF) + INVRETUIA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG41 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG41_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG41_1,max(max(RLOG41_P,RLOG41_PA),RLOG411731))*(1-V_INDTEO)+RLOG41_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG41 ;

RLOG42_1 = max(min((INVRETUJ * (1 - INDPLAF) + INVRETUJA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG42 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG42_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG42_1,max(max(RLOG42_P,RLOG42_PA),RLOG421731))*(1-V_INDTEO)+RLOG42_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG42 ;

RLOG43_1 = max(min((INVRETUK * (1 - INDPLAF) + INVRETUKA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG43 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG43_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG43_1,max(max(RLOG43_P,RLOG43_PA),RLOG431731))*(1-V_INDTEO)+RLOG43_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG43 ;

RLOG44_1 = max(min((INVRETUL * (1 - INDPLAF) + INVRETULA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG44 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG44_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG44_1,max(max(RLOG44_P,RLOG44_PA),RLOG441731))*(1-V_INDTEO)+RLOG44_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG44 ;

RLOG45_1 = max(min((INVRETUM * (1 - INDPLAF) + INVRETUMA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG45 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG45_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG45_1,max(max(RLOG45_P,RLOG45_PA),RLOG451731))*(1-V_INDTEO)+RLOG45_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG45 ;

RLOG46_1 = max(min((INVRETUN * (1 - INDPLAF) + INVRETUNA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG46 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG46_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG46_1,max(max(RLOG46_P,RLOG46_PA),RLOG461731))*(1-V_INDTEO)+RLOG46_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG46 ;

RLOG47_1 = max(min((INVRETUO * (1 - INDPLAF) + INVRETUOA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG47 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG47_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG47_1,max(max(RLOG47_P,RLOG47_PA),RLOG471731))*(1-V_INDTEO)+RLOG47_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG47 ;

RLOG48_1 = max(min((INVRETUP * (1 - INDPLAF) + INVRETUPA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG48 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG48_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG48_1,max(max(RLOG48_P,RLOG48_PA),RLOG481731))*(1-V_INDTEO)+RLOG48_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG48 ;

RLOG49_1 = max(min((INVRETUQ * (1 - INDPLAF) + INVRETUQA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG49 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG49_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG49_1,max(max(RLOG49_P,RLOG49_PA),RLOG491731))*(1-V_INDTEO)+RLOG49_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG49 ;

RLOG50_1 = max(min((INVRETUR * (1 - INDPLAF) + INVRETURA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG50 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG50_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG50_1,max(max(RLOG50_P,RLOG50_PA),RLOG501731))*(1-V_INDTEO)+RLOG50_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG50 ;

RLOG51_1 = max(min((INVRETUS * (1 - INDPLAF) + INVRETUSA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG51 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG51_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG51_1,max(max(RLOG51_P,RLOG51_PA),RLOG511731))*(1-V_INDTEO)+RLOG51_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG51 ;

RLOG52_1 = max(min((INVRETUT * (1 - INDPLAF) + INVRETUTA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG52 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG52_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG52_1,max(max(RLOG52_P,RLOG52_PA),RLOG521731))*(1-V_INDTEO)+RLOG52_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG52 ;

RLOG53_1 = max(min((INVRETUU * (1 - INDPLAF) + INVRETUUA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG53 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG53_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG53_1,max(max(RLOG53_P,RLOG53_PA),RLOG531731))*(1-V_INDTEO)+RLOG53_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG53 ;

RLOG54_1 = max(min((INVRETVA * (1 - INDPLAF) + INVRETVAA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG54 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG54_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG54_1,max(max(RLOG54_P,RLOG54_PA),RLOG541731))*(1-V_INDTEO)+RLOG54_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG54 ;

RLOG55_1 = max(min((INVRETVB * (1 - INDPLAF) + INVRETVBA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG55 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG55_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG55_1,max(max(RLOG55_P,RLOG55_PA),RLOG551731))*(1-V_INDTEO)+RLOG55_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG55 ;

RLOG56_1 = max(min((INVRETVC * (1 - INDPLAF) + INVRETVCA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG56 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG56_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG56_1,max(max(RLOG56_P,RLOG56_PA),RLOG561731))*(1-V_INDTEO)+RLOG56_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG56 ;

RLOG57_1 = max(min((INVRETVD * (1 - INDPLAF) + INVRETVDA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG57 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG57_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG57_1,max(max(RLOG57_P,RLOG57_PA),RLOG571731))*(1-V_INDTEO)+RLOG57_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG57 ;

RLOG58_1 = max(min((INVRETVE * (1 - INDPLAF) + INVRETVEA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG58 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG58_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG58_1,max(max(RLOG58_P,RLOG58_PA),RLOG581731))*(1-V_INDTEO)+RLOG58_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG58 ;

RLOG59_1 = max(min((INVRETVF * (1 - INDPLAF) + INVRETVFA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG59 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG59_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG59_1,max(max(RLOG59_P,RLOG59_PA),RLOG591731))*(1-V_INDTEO)+RLOG59_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG59 ;

RLOG60_1 = max(min((INVRETVG * (1 - INDPLAF) + INVRETVGA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOG60 =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOG60_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOG60_1,max(max(RLOG60_P,RLOG60_PA),RLOG601731))*(1-V_INDTEO)+RLOG60_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOG60 ;

RLOGHVJ_1 = max(min((INVRETVJ * (1 - INDPLAF) + INVRETVJA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOGHVJ =positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOGHVJ_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOGHVJ_1,max(max(RLOGHVJ_P,RLOGHVJ_PA),RLOGHVJ1731))*(1-V_INDTEO)+RLOGHVJ_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOGHVJ ;

RLOGHVK_1 = max(min((INVRETVK * (1 - INDPLAF) + INVRETVKA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOGHVK = positif(null(V_IND_TRAIT-4) + COD9ZA) * (RLOGHVK_1) * (1 - positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
          + (max(0,min(RLOGHVK_1,max(max(RLOGHVK_P,RLOGHVK_PA),RLOGHVK1731))*(1-V_INDTEO)+RLOGHVK_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5) + 0 ;
VARTMP1 = VARTMP1 + RLOGHVK ;

RLOGHVL_1 = max(min((INVRETVL * (1 - INDPLAF) + INVRETVLA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOGHVL = positif(null(V_IND_TRAIT-4) + COD9ZA) * (RLOGHVL_1) * (1 - positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
          + (max(0,min(RLOGHVL_1,max(max(RLOGHVL_P,RLOGHVL_PA),RLOGHVL1731))*(1-V_INDTEO)+RLOGHVL_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5) + 0 ;
VARTMP1 = VARTMP1 + RLOGHVL ;

RLOGHVM_1 = max(min((INVRETVM * (1 - INDPLAF) + INVRETVMA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOGHVM = positif(null(V_IND_TRAIT-4) + COD9ZA) * (RLOGHVM_1) * (1 - positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
          + (max(0,min(RLOGHVM_1,max(max(RLOGHVM_P,RLOGHVM_PA),RLOGHVM1731))*(1-V_INDTEO)+RLOGHVM_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5) + 0 ;
VARTMP1 = VARTMP1 + RLOGHVM ;

RLOGHVN_1 = max(min((INVRETVN * (1 - INDPLAF) + INVRETVNA * INDPLAF) , RRI1 - VARTMP1) , 0) * (1 - V_CNR) ;
RLOGHVN = positif(null(V_IND_TRAIT-4) + COD9ZA) * (RLOGHVN_1) * (1 - positif(null(8-CMAJ) + null(11-CMAJ) + null(34-CMAJ)))
          + (max(0,min(RLOGHVN_1,max(max(RLOGHVN_P,RLOGHVN_PA),RLOGHVN1731))*(1-V_INDTEO)+RLOGHVN_1*V_INDTEO) * positif(1-COD9ZA) * (1-positif(PREM8_11))) * null(V_IND_TRAIT-5) + 0 ;
VARTMP1 = 0 ;

RLOGDOMTOT = (1 - V_INDTEO) * (somme(i=1..60: RLOGi) + RLOGHVJ + RLOGHVK + RLOGHVL + RLOGHVM + RLOGHVN) ;
RLOGDOMTOT_1 = (1 - V_INDTEO) * (somme(i=1..60: RLOGi_1) + RLOGHVJ_1 + RLOGHVK_1 + RLOGHVL_1 + RLOGHVM_1 + RLOGHVN_1) ;

RLOGDOMTEO = (RLOG01 + RLOG02 + RLOG03 + RLOG04 + RLOG05 + RLOG06 + RLOG07 + RLOG08) ;

regle 8401 :
application : iliad  ;


VARTMP1 = 0 ;

RSOCHYD_1 = arr(max(min((INVRETYD * (1 - INDPLAF) + INVRETYDA * INDPLAF) , RRISUP - VARTMP1) , 0)) * (1 - V_CNR) ;
RSOCHYD = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSOCHYD_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSOCHYD_1,max(max(RSOCHYD_P,RSOCHYD_PA),RSOCHYD1731))*(1-V_INDTEO)+RSOCHYD_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSOCHYD ;

RSOCHYC_1 = arr(max(min((INVRETYC * (1 - INDPLAF) + INVRETYCA * INDPLAF) , RRISUP - VARTMP1) , 0)) * (1 - V_CNR) ;
RSOCHYC = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSOCHYC_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RSOCHYC_1,max(max(RSOCHYC_P,RSOCHYC_PA),RSOCHYC1731))*(1-V_INDTEO)+RSOCHYC_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSOCHYC ;

RSOCHYDR_1 = arr(max(min((INVRETYDR * (1 - INDPLAF) + INVRETYDRA * INDPLAF) , RRISUP - VARTMP1) , 0)) * (1 - V_CNR) ;
RSOCHYDR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSOCHYDR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RSOCHYDR_1,max(max(RSOCHYDR_P,RSOCHYDR_PA),RSOCHYDR1731))*(1-V_INDTEO)+RSOCHYDR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSOCHYDR ;

RSOCHYCR_1 = arr(max(min((INVRETYCR * (1 - INDPLAF) + INVRETYCRA * INDPLAF) , RRISUP - VARTMP1) , 0)) * (1 - V_CNR) ;
RSOCHYCR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RSOCHYCR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RSOCHYCR_1,max(max(RSOCHYCR_P,RSOCHYCR_PA),RSOCHYCR1731))*(1-V_INDTEO)+RSOCHYCR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RSOCHYCR ;

RSOCHYE_1 = arr(max(min((INVRETYE * (1 - INDPLAF) + INVRETYEA * INDPLAF) , RRISUP - VARTMP1) , 0)) * (1 - V_CNR) ;
RSOCHYE = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSOCHYE_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSOCHYE_1 ,max(max(RSOCHYE_PA,RSOCHYE_PA),RSOCHYE1731))*(1-V_INDTEO)+RSOCHYE_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSOCHYE ;

RSOCHYER_1 = arr(max(min((INVRETYER * (1 - INDPLAF) + INVRETYERA * INDPLAF) , RRISUP - VARTMP1) , 0)) * (1 - V_CNR) ;
RSOCHYER = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSOCHYER_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(RSOCHYER_1 ,max(max(RSOCHYER_P,RSOCHYER_PA),RSOCHYER1731))*(1-V_INDTEO)+RSOCHYER_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSOCHYER ;

RSOCHYF_1 = arr(max(min((INVRETYF * (1 - INDPLAF) + INVRETYFA * INDPLAF) , RRISUP - VARTMP1) , 0)) * (1 - V_CNR) ;
RSOCHYF = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSOCHYF_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSOCHYF_1 ,max(max(RSOCHYF_P,RSOCHYF_PA),RSOCHYF1731))*(1-V_INDTEO)+RSOCHYF_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSOCHYF ;

RSOCHYFR_1 = arr(max(min((INVRETYFR * (1 - INDPLAF) + INVRETYFRA * INDPLAF) , RRISUP - VARTMP1) , 0)) * (1 - V_CNR) ;
RSOCHYFR = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSOCHYFR_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(RSOCHYFR_1 ,max(max(RSOCHYFR_P,RSOCHYFR_PA),RSOCHYFR1731))*(1-V_INDTEO)+RSOCHYFR_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSOCHYFR ;

RSOCHYG_1 = arr(max(min((INVRETYG * (1 - INDPLAF) + INVRETYGA * INDPLAF) , RRISUP - VARTMP1) , 0)) * (1 - V_CNR) ;
RSOCHYG = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSOCHYG_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSOCHYG_1 , max(max(RSOCHYG_P,RSOCHYG_PA),RSOCHYG1731))*(1-V_INDTEO)+RSOCHYG_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSOCHYG ;

RSOCHYGR_1 = arr(max(min((INVRETYGR * (1 - INDPLAF) + INVRETYGRA * INDPLAF) , RRISUP - VARTMP1) , 0)) * (1 - V_CNR) ;
RSOCHYGR = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSOCHYGR_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(RSOCHYGR_1 , max(max(RSOCHYGR_P,RSOCHYGR_PA),RSOCHYGR1731))*(1-V_INDTEO)+RSOCHYGR_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSOCHYGR ;

RSOCHYH_1 = arr(max(min((INVRETYH * (1 - INDPLAF) + INVRETYHA * INDPLAF) , RRISUP - VARTMP1) , 0)) * (1 - V_CNR) ;
RSOCHYH = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSOCHYH_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSOCHYH_1 , max(max(RSOCHYH_P,RSOCHYH_PA),RSOCHYH1731))*(1-V_INDTEO)+RSOCHYH_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSOCHYH ;

RSOCHYHR_1 = arr(max(min((INVRETYHR * (1 - INDPLAF) + INVRETYHRA * INDPLAF) , RRISUP - VARTMP1) , 0)) * (1 - V_CNR) ;
RSOCHYHR = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSOCHYHR_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(RSOCHYHR_1 , max(max(RSOCHYHR_P,RSOCHYHR_PA),RSOCHYHR1731))*(1-V_INDTEO)+RSOCHYHR_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = 0 ;

regle 8402 :
application : iliad  ;


VARTMP1 = 0 ;

RSOCHYI_1 = arr(max(min((INVRETYI * (1 - INDPLAF) + INVRETYIA * INDPLAF) , RRISUP - RDOMSOC1 - VARTMP1) , 0)) * (1 - V_CNR) ;
RSOCHYI = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSOCHYI_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
          + (max(0 , min(RSOCHYI_1 , max(max(RSOCHYI_P,RSOCHYI_PA),RSOCHYI1731))*(1-V_INDTEO)+RSOCHYI_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = VARTMP1 + RSOCHYI ;

RSOCHYIR_1 = arr(max(min((INVRETYIR * (1 - INDPLAF) + INVRETYIRA * INDPLAF) , RRISUP - RDOMSOC1 - VARTMP1) , 0)) * (1 - V_CNR) ;
RSOCHYIR = positif(null(V_IND_TRAIT - 4) + COD9ZA) * RSOCHYIR_1 * (1 - positif(null(8 - CMAJ) + null(11 - CMAJ) + null(34 - CMAJ)))
           + (max(0 , min(RSOCHYIR_1 , max(max(RSOCHYIR_P,RSOCHYIR_PA),RSOCHYIR1731))*(1-V_INDTEO)+RSOCHYIR_1*V_INDTEO) * positif(1 - COD9ZA) * (1 - positif(PREM8_11))) * null(V_IND_TRAIT - 5) + 0 ;
VARTMP1 = 0 ;

regle 8403 :
application : iliad  ;


VARTMP1 = 0 ;
RRILOC = RRISUP - RDOMSOC1 - RLOGSOC ;

RLOCHFT_1 = max(min((INVRETFT * (1 - INDPLAF) + INVRETFTA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHFT = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHFT_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHFT_1,max(max(RLOCHFT_P,RLOCHFT_PA),RLOCHFT1731))*(1-V_INDTEO)+RLOCHFT_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHFT ;

RLOCHFO_1 = max(min((INVRETFO * (1 - INDPLAF) + INVRETFOA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHFO = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHFO_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHFO_1,max(max(RLOCHFO_P,RLOCHFO_PA),RLOCHFO1731))*(1-V_INDTEO)+RLOCHFO_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHFO ;

RLOCHFS_1 = max(min((INVRETFS * (1 - INDPLAF) + INVRETFSA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHFS = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHFS_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHFS_1,max(max(RLOCHFS_P,RLOCHFS_PA),RLOCHFS1731))*(1-V_INDTEO)+RLOCHFS_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHFS ;

RLOCHFN_1 = max(min((INVRETFN * (1 - INDPLAF) + INVRETFNA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHFN = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHFN_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHFN_1,max(max(RLOCHFN_P,RLOCHFN_PA),RLOCHFN1731))*(1-V_INDTEO)+RLOCHFN_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHFN ;

RLOCHFP_1 = max(min((INVRETFP * (1 - INDPLAF) + INVRETFPA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHFP = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHFP_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHFP_1,max(max(RLOCHFP_P,RLOCHFP_PA),RLOCHFP1731))*(1-V_INDTEO)+RLOCHFP_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHFP ;

RLOCHFU_1 = max(min((INVRETFU * (1 - INDPLAF) + INVRETFUA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHFU = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHFU_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHFU_1,max(max(RLOCHFU_P,RLOCHFU_PA),RLOCHFU1731))*(1-V_INDTEO)+RLOCHFU_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHFU ;

RLOCHFR_1 = max(min((INVRETFR * (1 - INDPLAF) + INVRETFRA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHFR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHFR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHFR_1,max(max(RLOCHFR_P,RLOCHFR_PA),RLOCHFR1731))*(1-V_INDTEO)+RLOCHFR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHFR ;

RLOCHFW_1 = max(min((INVRETFW * (1 - INDPLAF) + INVRETFWA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHFW = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHFW_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHFW_1,max(max(RLOCHFW_P,RLOCHFW_PA),RLOCHFW1731))*(1-V_INDTEO)+RLOCHFW_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHFW ;

RLOCHGT_1 = max(min((INVRETGT * (1 - INDPLAF) + INVRETGTA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHGT = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHGT_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHGT_1,max(max(RLOCHGT_P,RLOCHGT_PA),RLOCHGT1731))*(1-V_INDTEO)+RLOCHGT_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHGT ;

RLOCHGS_1 = max(min((INVRETGS * (1 - INDPLAF) + INVRETGSA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHGS = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHGS_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHGS_1,max(max(RLOCHGS_P,RLOCHGS_PA),RLOCHGS1731))*(1-V_INDTEO)+RLOCHGS_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHGS ;

RLOCHGU_1 = max(min((INVRETGU * (1 - INDPLAF) + INVRETGUA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHGU = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHGU_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHGU_1,max(max(RLOCHGU_P,RLOCHGU_PA),RLOCHGU1731))*(1-V_INDTEO)+RLOCHGU_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHGU ;

RLOCHGW_1 = max(min((INVRETGW * (1 - INDPLAF) + INVRETGWA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHGW = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHGW_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHGW_1,max(max(RLOCHGW_P,RLOCHGW_PA),RLOCHGW1731))*(1-V_INDTEO)+RLOCHGW_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHGW ;

RLOCHFTR_1 = max(min((INVRETFTR * (1 - INDPLAF) + INVRETFTRA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHFTR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHFTR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RLOCHFTR_1,max(max(RLOCHFTR_P,RLOCHFTR_PA),RLOCHFTR1731))*(1-V_INDTEO)+RLOCHFTR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHFTR ;

RLOCHFOR_1 = max(min((INVRETFOR * (1 - INDPLAF) + INVRETFORA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHFOR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHFOR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RLOCHFOR_1,max(max(RLOCHFOR_PA,RLOCHFOR_PA),RLOCHFOR1731))*(1-V_INDTEO)+RLOCHFOR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHFOR ;

RLOCHFSR_1 = max(min((INVRETFSR * (1 - INDPLAF) + INVRETFSRA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHFSR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHFSR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RLOCHFSR_1,max(max(RLOCHFSR_P,RLOCHFSR_PA),RLOCHFSR1731))*(1-V_INDTEO)+RLOCHFSR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHFSR ;

RLOCHFNR_1 = max(min((INVRETFNR * (1 - INDPLAF) + INVRETFNRA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHFNR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHFNR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RLOCHFNR_1,max(max(RLOCHFNR_P,RLOCHFNR_PA),RLOCHFNR1731))*(1-V_INDTEO)+RLOCHFNR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHFNR ;

RLOCHGTR_1 = max(min((INVRETGTR * (1 - INDPLAF) + INVRETGTRA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHGTR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHGTR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RLOCHGTR_1,max(max(RLOCHGTR_P,RLOCHGTR_PA),RLOCHGTR1731))*(1-V_INDTEO)+RLOCHGTR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHGTR ;

RLOCHGSR_1 = max(min((INVRETGSR * (1 - INDPLAF) + INVRETGSRA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHGSR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHGSR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RLOCHGSR_1,max(max(RLOCHGSR_P,RLOCHGSR_PA),RLOCHGSR1731))*(1-V_INDTEO)+RLOCHGSR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHGSR ;

RLOCHHT_1 = max(min((INVRETHT * (1 - INDPLAF) + INVRETHTA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHHT = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHHT_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHHT_1,max(max(RLOCHHT_P,RLOCHHT_PA),RLOCHHT1731))*(1-V_INDTEO)+RLOCHHT_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHHT ;

RLOCHHS_1 = max(min((INVRETHS * (1 - INDPLAF) + INVRETHSA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHHS = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHHS_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHHS_1,max(max(RLOCHHS_P,RLOCHHS_PA),RLOCHHS1731))*(1-V_INDTEO)+RLOCHHS_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHHS ;

RLOCHHU_1 = max(min((INVRETHU * (1 - INDPLAF) + INVRETHUA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHHU = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHHU_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHHU_1,max(max(RLOCHHU_P,RLOCHHU_PA),RLOCHHU1731))*(1-V_INDTEO)+RLOCHHU_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHHU ;

RLOCHHW_1 = max(min((INVRETHW * (1 - INDPLAF) + INVRETHWA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHHW = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHHW_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHHW_1,max(max(RLOCHHW_P,RLOCHHW_PA),RLOCHHW1731))*(1-V_INDTEO)+RLOCHHW_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHHW ;

RLOCHHTR_1 = max(min((INVRETHTR * (1 - INDPLAF) + INVRETHTRA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHHTR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHHTR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RLOCHHTR_1,max(max(RLOCHHTR_P,RLOCHHTR_PA),RLOCHHTR1731))*(1-V_INDTEO)+RLOCHHTR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHHTR ;

RLOCHHSR_1 = max(min((INVRETHSR * (1 - INDPLAF) + INVRETHSRA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHHSR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHHSR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RLOCHHSR_1,max(max(RLOCHHSR_P,RLOCHHSR_PA),RLOCHHSR1731))*(1-V_INDTEO)+RLOCHHSR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHHSR ;

RLOCHIT_1 = max(min((INVRETIT * (1 - INDPLAF) + INVRETITA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHIT = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHIT_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHIT_1,max(max(RLOCHIT_P,RLOCHIT_PA),RLOCHIT1731))*(1-V_INDTEO)+RLOCHIT_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHIT ;

RLOCHIS_1 = max(min((INVRETIS * (1 - INDPLAF) + INVRETISA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHIS = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHIS_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHIS_1,max(max(RLOCHIS_P,RLOCHIS_PA),RLOCHIS1731))*(1-V_INDTEO)+RLOCHIS_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHIS ;

RLOCHIU_1 = max(min((INVRETIU * (1 - INDPLAF) + INVRETIUA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHIU = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHIU_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHIU_1,max(max(RLOCHIU_P,RLOCHIU_PA),RLOCHIU1731))*(1-V_INDTEO)+RLOCHIU_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHIU ;

RLOCHIW_1 = max(min((INVRETIW * (1 - INDPLAF) + INVRETIWA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHIW = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHIW_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHIW_1,max(max(RLOCHIW_P,RLOCHIW_PA),RLOCHIW1731))*(1-V_INDTEO)+RLOCHIW_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHIW ;

RLOCHITR_1 = max(min((INVRETITR * (1 - INDPLAF) + INVRETITRA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHITR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHITR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RLOCHITR_1,max(max(RLOCHITR_P,RLOCHITR_PA),RLOCHITR1731))*(1-V_INDTEO)+RLOCHITR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHITR ;

RLOCHISR_1 = max(min((INVRETISR * (1 - INDPLAF) + INVRETISRA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHISR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHISR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RLOCHISR_1,max(max(RLOCHISR_P,RLOCHISR_PA),RLOCHISR1731))*(1-V_INDTEO)+RLOCHISR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHISR ;

RLOCHJT_1 = max(min((INVRETJT * (1 - INDPLAF) + INVRETJTA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHJT = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHJT_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHJT_1,max(max(RLOCHJT_P,RLOCHJT_PA),RLOCHJT1731))*(1-V_INDTEO)+RLOCHJT_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHJT ;

RLOCHJS_1 = max(min((INVRETJS * (1 - INDPLAF) + INVRETJSA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHJS = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHJS_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHJS_1,max(max(RLOCHJS_P,RLOCHJS_PA),RLOCHJS1731))*(1-V_INDTEO)+RLOCHJS_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHJS ;

RLOCHJU_1 = max(min((INVRETJU * (1 - INDPLAF) + INVRETJUA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHJU = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHJU_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHJU_1,max(max(RLOCHJU_P,RLOCHJU_PA),RLOCHJU1731))*(1-V_INDTEO)+RLOCHJU_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHJU ;

RLOCHJW_1 = max(min((INVRETJW * (1 - INDPLAF) + INVRETJWA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHJW = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHJW_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHJW_1,max(max(RLOCHJW_P,RLOCHJW_PA),RLOCHJW1731))*(1-V_INDTEO)+RLOCHJW_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHJW ;

RLOCHJTR_1 = max(min((INVRETJTR * (1 - INDPLAF) + INVRETJTRA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHJTR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHJTR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RLOCHJTR_1,max(max(RLOCHJTR_P,RLOCHJTR_PA),RLOCHJTR1731))*(1-V_INDTEO)+RLOCHJTR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHJTR ;

RLOCHJSR_1 = max(min((INVRETJSR * (1 - INDPLAF) + INVRETJSRA * INDPLAF) , RRILOC - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHJSR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHJSR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RLOCHJSR_1,max(max(RLOCHJSR_P,RLOCHJSR_PA),RLOCHJSR1731))*(1-V_INDTEO)+RLOCHJSR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = 0 ;

regle 8404 :
application : iliad  ;

VARTMP1 = 0 ;
RRIRENT = RRISUP - RDOMSOC1 - RLOGSOC - RCOLENT ;

RLOCHKT_1 = max(min((INVRETKT * (1 - INDPLAF) + INVRETKTA * INDPLAF) , RRIRENT - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHKT = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHKT_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHKT_1,max(max(RLOCHKT_P,RLOCHKT_PA),RLOCHKT1731))*(1-V_INDTEO)+RLOCHKT_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHKT ;

RLOCHKS_1 = max(min((INVRETKS * (1 - INDPLAF) + INVRETKSA * INDPLAF) , RRIRENT - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHKS = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHKS_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHKS_1,max(max(RLOCHKS_P,RLOCHKS_PA),RLOCHKS1731))*(1-V_INDTEO)+RLOCHKS_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHKS ;

RLOCHKU_1 = max(min((INVRETKU * (1 - INDPLAF) + INVRETKUA * INDPLAF) , RRIRENT - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHKU = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHKU_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHKU_1,max(max(RLOCHKU_P,RLOCHKU_PA),RLOCHKU1731))*(1-V_INDTEO)+RLOCHKU_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHKU ;

RLOCHKW_1 = max(min((INVRETKW * (1 - INDPLAF) + INVRETKWA * INDPLAF) , RRIRENT - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHKW = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHKW_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
          + (max(0,min(RLOCHKW_1,max(max(RLOCHKW_P,RLOCHKW_PA),RLOCHKW1731))*(1-V_INDTEO)+RLOCHKW_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHKW ;

RLOCHKTR_1 = max(min((INVRETKTR * (1 - INDPLAF) + INVRETKTRA * INDPLAF) , RRIRENT - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHKTR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHKTR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RLOCHKTR_1,max(max(RLOCHKTR_P,RLOCHKTR_PA),RLOCHKTR1731))*(1-V_INDTEO)+RLOCHKTR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = VARTMP1 + RLOCHKTR ;

RLOCHKSR_1 = max(min((INVRETKSR * (1 - INDPLAF) + INVRETKSRA * INDPLAF) , RRIRENT - VARTMP1) , 0) * (1 - V_CNR) ;
RLOCHKSR = positif(null(V_IND_TRAIT-4)+COD9ZA) * (RLOCHKSR_1) * (1-positif(null(8-CMAJ)+null(11-CMAJ)+null(34-CMAJ)))
           + (max(0,min(RLOCHKSR_1,max(max(RLOCHKSR_P,RLOCHKSR_PA),RLOCHKSR1731))*(1-V_INDTEO)+RLOCHKSR_1*V_INDTEO)*positif(1-COD9ZA)*(1-positif(PREM8_11))) * null(V_IND_TRAIT-5)+0;
VARTMP1 = 0;

