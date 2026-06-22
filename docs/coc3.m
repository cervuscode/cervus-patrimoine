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
verif 1320:
application : iliad  ;


si
   DPVRCM > 0
   et
  ( BPVRCM + GAINPEA  + COD3UA + CODRVG + CODRUA ) > 0

alors erreur A320 ;
verif 13211:
application : iliad  ;

si

positif(COD3SG) = 1
et
positif(BPVRCM + 0) = 0

alors erreur A32101 ;
verif 13212:
application : iliad  ;

si

(COD3SG + 0)  > (BPVRCM + 0)

alors erreur A32102 ;
verif 13221:
application : iliad  ;

si

positif(COD3SL) = 1
et
positif(COD3UA +0) = 0

alors erreur A32201 ;
verif 13222:
application : iliad  ;

si

(COD3SL )  > (COD3UA + 0)

alors erreur A32202 ;
verif 1323:
application : iliad  ;

si
   positif(ABIMPPV + 0) = 1
   et
   positif(ABIMPMV + 0) = 1

alors erreur A323 ;
verif 1325:
application : iliad  ;

si
  (V_MODUL+0) < 1
    et
   V_IND_TRAIT > 0
   et
   positif(PVSURSI + 0) + positif(COD3WM + 0) = 1

alors erreur A325 ;
verif 1326:
application : iliad  ;

si
  (V_MODUL+0) < 1
    et
   V_IND_TRAIT > 0
   et
   positif(PVIMPOS + CODRWB + 0)  + positif(ABPVNOSURSIS + 0) = 1

alors erreur A326 ;
verif 13271:
application : iliad  ;

si
   V_IND_TRAIT > 0
   et
   positif(CODRVG + 0) + positif(CODNVG + 0) = 1

alors erreur A32701 ;
verif 13272:
application : iliad  ;

si
   V_IND_TRAIT > 0
   et
   positif(CODNVG + 0) = 1
   et
   null(4 - CODNVG) = 0

alors erreur A32702 ;
verif 13273:
application : iliad  ;

si
   V_IND_TRAIT > 0
   et
   positif(CODRUA + 0) + positif(CODNUA + 0) = 1

alors erreur A32703 ;
verif 13274:
application : iliad  ;

si
   V_IND_TRAIT > 0
   et
   positif(CODNUA + 0) = 1
   et
   null(4 - CODNUA) = 0

alors erreur A32704 ;
verif 13281:
application : iliad  ;

si
   V_IND_TRAIT > 0
   et
   positif(CODRWA + 0) + positif(CODNWA + 0) = 1

alors erreur A32801 ;
verif 13282:
application : iliad  ;

si
   V_IND_TRAIT > 0
   et
   positif(CODNWA + 0) = 1
   et
   null(4 - CODNWA) = 0

alors erreur A32802 ;
verif 13291:
application : iliad  ;

si
   V_IND_TRAIT > 0
   et
   positif(CODRWB + 0) + positif(CODNWB + 0) = 1

alors erreur A32901 ;
verif 13292:
application : iliad  ;

si
   V_IND_TRAIT > 0
   et
   positif(CODNWB + 0) = 1
   et
   null(4 - CODNWB) = 0

alors erreur A32902 ;
verif 1330:
application : iliad  ;

si
  positif(COD2OP) = 1
  et
((positif(COD3WG) + positif(PVREPORT) ) > 0
  et
(positif(COD3WG) + positif(PVREPORT) ) !=2)

alors erreur A330 ;
verif 1333:
application : iliad  ;

 
si
 (
 (V_IND_TRAIT = 4
 et
 (positif(present(COD3WR) + present(COD3WS)) = 1
 et 
 positif(COD3XN + 0) + positif(COD3WN +0) < 1)
 ou
 (positif(present(COD3WR) + present(COD3WS)) = 0
 et
 positif(COD3XN) + positif(COD3WN) > 0))

 ou

 (V_IND_TRAIT = 5
  et
 (positif(COD3WR + COD3WS) = 1
  et
  positif(COD3XN + 0) + positif(COD3WN +0) < 1)
  ou
 (positif(present(COD3WR) + present(COD3WS)) = 0
  et
 positif(COD3XN) + positif(COD3WN) > 0))
 )

alors erreur A333 ;
verif 1335:
application : iliad  ;

si
 positif(COD3WT) = 1
et
 positif(COD3WN + COD3XN + 0) = 0


alors erreur A335 ;
verif 1336:
application : iliad  ;

si
  (COD2OP + 0) < 1
  et
  positif(COD3SG + COD3SL + CODRSG + CODRSL + 0) > 0

alors erreur A336 ;   
verif 1337:
application : iliad  ;

si
  (COD2OP + 0) < 1
  et
  positif(CODRVG + CODRUA + 0) > 0

alors erreur A337 ;
verif 1338:
application : iliad  ;

si
 present(COD3WP) = 0
 et
 positif(present(COD3WN) +present(COD3XN)) > 0

alors erreur A338 ;
verif 1339:
application : iliad;

si
 present(COD3WP) = 1
 et
 positif(present(COD3WN) + present(COD3XN)) = 0

alors erreur A339 ;
verif 134101:
application : iliad;

si
 COD3TA > 0
 et
 positif(present(COD3XM) + present( COD3XA)) = 0 

alors erreur A34101 ;
verif 134102:
application : iliad;

si 
 COD3XM > 0
 et
 present(COD3TA) = 0

alors erreur A34102 ;
verif 134103:
application : iliad;

si
 COD3XA > 0
 et
 present(COD3TA) = 0

alors erreur A34103 ;
verif 134201:
application : iliad;

si
 COD3TB > 0
 et 
 positif(present(COD3XD) + present(COD3YA)) = 0

alors erreur A34201 ; 
verif 134202:
application : iliad ;

si 
 COD3XD > 0
 et
 present(COD3TB) = 0

alors erreur A34202 ; 
verif 134203:
application : iliad ;

si 
 COD3YA > 0
 et
 present(COD3TB) = 0

alors erreur A34203 ; 
verif 1343:
application : iliad ;

si
 present(COD2OP) = 0
 et
 positif(present(CODRWA) + present(CODRWB)) > 0

alors erreur A343 ; 
verif 1345:
application : iliad ;

si
 V_IND_TRAIT > 0
et 
 positif(COD3AN) + positif(COD3BN) = 2

alors erreur A345 ;
verif 135001:
application : iliad  ;

si
( (V_IND_TRAIT = 4
 et
null(CODRVG - BPVRCM) * positif(present(BPVRCM)) * present (CODRVG) = 1)
 ou
 (V_IND_TRAIT = 5
  et
  null(CODRVG - BPVRCM) * positif(present(BPVRCM)) * present (CODRVG) = 1
  et 
  present(ANNUL2042) = 0)
)

alors erreur A35001 ;
verif 135002:
application : iliad  ;

si
(( V_IND_TRAIT = 4
  et
null(CODRVG - (BPVRCM - COD3SG)) * positif(present(BPVRCM) * present(COD3SG)) * present (CODRVG) = 1)
ou
( V_IND_TRAIT = 5
  et
  null(CODRVG - (BPVRCM - COD3SG)) * positif(present(BPVRCM) * present(COD3SG)) * present (CODRVG) = 1
  et
  present(ANNUL2042) = 0)
)

alors erreur A35002 ;
verif 135003:
application : iliad  ;

si
 ((V_IND_TRAIT = 4
   et
null(CODRUA - COD3UA) * positif(present(COD3UA)) * present (CODRUA) = 1)
ou
(V_IND_TRAIT = 5
   et
   null(CODRUA - COD3UA) * positif(present(COD3UA)) * present (CODRUA) = 1
    et
   present(ANNUL2042) = 0)
 )  

alors erreur A35003 ;
verif 135004:
application : iliad  ;

si
 ((V_IND_TRAIT = 4
   et
null(CODRUA - (COD3UA - COD3SL - ABDETPLUS)) * positif(present(COD3UA) * present(COD3SL) * present(ABDETPLUS)) * present (CODRUA) = 1)
ou
(V_IND_TRAIT = 5
et
   null(CODRUA - (COD3UA - COD3SL - ABDETPLUS)) * positif(present(COD3UA) * present(COD3SL) * present(ABDETPLUS)) * present (CODRUA) = 1
   et
  present(ANNUL2042) = 0)
 )

alors erreur A35004 ;
verif 135005:
application : iliad  ;

si
(( V_IND_TRAIT = 4
  et
null(CODRVG - COD3UA) * positif(present(COD3UA)) * present (CODRVG) = 1)
ou
( V_IND_TRAIT = 5
  et
  null(CODRVG - COD3UA) * positif(present(COD3UA)) * present (CODRVG) = 1
  et
 present(ANNUL2042) = 0)
 ) 

alors erreur A35005 ;
verif 135006:
application : iliad  ;

si
 ((V_IND_TRAIT = 4
   et
null(CODRUA - BPVRCM) * positif(present(BPVRCM)) * present (CODRUA) = 1)
ou
(V_IND_TRAIT = 5
   et
   null(CODRUA - BPVRCM) * positif(present(BPVRCM)) * present (CODRUA) = 1
   et
 present(ANNUL2042) = 0)
 )

alors erreur A35006 ;
verif 135007:
application : iliad  ;

si
((V_IND_TRAIT = 4
   et
null(CODRUA - (BPVRCM - COD3SG)) * positif(present(BPVRCM) * present(COD3SG)) * present (CODRUA) = 1)
ou
(V_IND_TRAIT = 5
   et
   null(CODRUA - (BPVRCM - COD3SG)) * positif(present(BPVRCM) * present(COD3SG)) * present (CODRUA) = 1
 et 
 present(ANNUL2042) = 0)
  )

alors erreur A35007 ;
verif 135008:
application : iliad  ;

si
 ((V_IND_TRAIT = 4
    et
null(CODRVG - (COD3UA - COD3SL - ABDETPLUS)) * positif(present(COD3UA) * present(COD3SL) * present(ABDETPLUS)) * present (CODRVG) = 1)
ou
(V_IND_TRAIT = 5
    et
    null(CODRVG - (COD3UA - COD3SL - ABDETPLUS)) * positif(present(COD3UA) * present(COD3SL) * present(ABDETPLUS)) * present (CODRVG) = 1
    et
    present(ANNUL2042) = 0)
 )

alors erreur A35008 ;
verif 1418:
application : iliad  ;

si
positif(COD4BK) = 1
et
( COD4BK > RFMIC)

alors erreur A418 ;
verif 1419:
application : iliad  ;

si
positif(COD4BK) = 1
et
present(RFMIC) !=1

alors erreur A419 ;
verif 1420:
application :  iliad ;


si
   positif(RFMIC + CODRBE) = 1
   et
   positif(RFORDI + RFDORD + RFDHIS + REAMOR + FONCI + REAMOR) = 1

alors erreur A420 ;
verif 1421:
application :  iliad;

si 
   V_IND_TRAIT > 0
   et
   RFMIC > LIM_MICFON
  
alors erreur A421 ;
verif 1422:
application :  iliad ;

si
   V_IND_TRAIT > 0
   et
   positif(RFROBOR) + positif(RFMIC + COD4EB) + 0 > 1

alors erreur A422 ;
verif 1423:
application :  iliad ;


si
   RFROBOR > 0
   et
   RFDANT > 0
   et
   present(RFORDI) = 0
   et
   present(RFDORD) = 0
   et
   present(RFDHIS) = 0
   
alors erreur A423 ;
verif 1424:
application :  iliad ;


si
   RFROBOR > 0
   et
   (FONCI > 0
    ou
    REAMOR > 0)

alors erreur A424 ;
verif 14251:
application : iliad  ;

si
   (V_IND_TRAIT = 4
    et
    (FONCINB < 2 ou FONCINB > 30))
   ou
   (V_IND_TRAIT = 5
    et
    (FONCINB = 1 ou FONCINB > 30))

alors erreur A42501 ;
verif 14252:
application : iliad  ;

si
   (V_IND_TRAIT = 4
    et
    positif(FONCI) + present(FONCINB) = 1)
   ou
   (V_IND_TRAIT = 5
    et
    positif(FONCI) + positif(FONCINB) = 1)

alors erreur A42502 ;
verif 14261:
application : iliad  ;

si
   (V_IND_TRAIT = 4
    et
    (REAMORNB < 2 ou REAMORNB > 14))
   ou
   (V_IND_TRAIT = 5
    et
    (REAMORNB = 1 ou REAMORNB > 14))

alors erreur A42601 ;
verif 14262:
application : iliad  ;

si
   (V_IND_TRAIT = 4
    et
    positif(REAMOR) + present(REAMORNB) = 1)
   ou
   (V_IND_TRAIT = 5
    et
    positif(REAMOR) + positif(REAMORNB) = 1)

alors erreur A42602 ;
verif 1430:
application : iliad  ;

si
	positif(RFORDI) = 1
et
	positif(RFDORD + RFDHIS + 0) = 1

alors erreur A430 ;
verif 1431:
application : iliad  ;

si
	positif(COD4BL) = 1
et(
	COD4BL > RFORDI
	et( 
	present(RFORDI) = 1
	ou
	positif(FONCI) != 1
	)
)

alors erreur A431 ;
verif 1432:
application : iliad  ;

si
	positif(COD4BL ) = 1
et
	present(RFORDI) !=1
et	
	positif(RFDORD+RFDHIS+FONCI+0)!=1

alors erreur A432 ;
verif 1433:
application : iliad  ;

si
 ((CODRBT > FONCI)
ou
  (present(FONCI) = 0
  et
  positif(CODRBT) = 1)
  )
alors erreur A433 ;
verif 14351:
application : iliad  ;

si
   (V_IND_TRAIT = 4
       et
   (CODNBE < 2 ou CODNBE > 30))
       ou
   (V_IND_TRAIT = 5
       et
   (CODNBE = 1 ou CODNBE > 30))

alors erreur A43501 ;
verif 14352:
application : iliad  ;

si
   (V_IND_TRAIT = 4
       et
   positif(CODRBE) + present(CODNBE) = 1)
       ou
  (V_IND_TRAIT = 5
       et
   positif(CODRBE) + positif(CODNBE) = 1)

alors erreur A43502 ;
verif 1443:
application : iliad  ;

si
 ((CODRBK > CODRBE)
 ou
 (present(CODRBE) = 0
 et
 positif(CODRBK) = 1)
 )
alors erreur A443 ;
verif 1450:
application : iliad;

si
(V_IND_TRAIT = 4 
 et
 present(COD4EA) = 1
 et
 present(COD4EB) = 1)
  ou
 (V_IND_TRAIT = 5
  et
  positif(COD4EA) = 1
  et
  positif(COD4EB) = 1)

alors erreur A450 ;
verif 1451:
application : iliad;

si
(V_IND_TRAIT = 4
 et
  present(COD4EA) = 1
  et
  positif(present(RFMIC) + present(CODRBE)) = 1)
  ou
 (V_IND_TRAIT = 5
  et
  positif(COD4EA) = 1
  et
  positif(RFMIC + CODRBE) = 1)

alors erreur A451 ;
verif 1452:
application : iliad;

si
(V_IND_TRAIT = 4
 et
  present(COD4EB) = 1
  et
  positif(present(RFORDI) + present(RFDORD) + present(RFDHIS) + present(FONCI) + present(REAMOR)) = 1)
  ou
 (V_IND_TRAIT = 5
  et
  positif(COD4EB) = 1
  et
  positif(RFORDI + RFDORD + RFDHIS + FONCI + REAMOR) = 1)

alors erreur A452 ;
verif 15141:
application : iliad;
si
	(COD5AQ + COD5AY) > 0
et
	(present(BACDEV) + present (BACREV)) = 0 

alors erreur A51401 ;
verif 15143:
application : iliad;
si
	(COD5BQ + COD5BY) > 0
et
	(present(BACDEC) + present (BACREC)) = 0

alors erreur A51403 ;
verif 15145:
application : iliad;
si
        (COD5CU + COD5CV) > 0
et
        (present(BACREP) + present (BACDEP)) = 0

alors erreur A51405 ;
verif 15151:
application : iliad;


si
	(COD5DK + COD5DM) > 0
et
	(present(BICNOV) + present (BICDNV)) = 0

alors erreur A51501 ;
verif 15153:
application : iliad;


si
	(COD5EK + COD5EM) > 0
et
	(present(BICNOC) + present (BICDNC)) = 0

alors erreur A51503 ;
verif 15155:
application : iliad;


si
	(COD5UT + COD5UY) > 0
et
	(present(BICREV) + present (BICDEV)) = 0

alors erreur A51505 ;
verif 15157:
application : iliad;


si
	(COD5VT + COD5VY) > 0
et
	(present(BICREC) + present (BICDEC)) = 0

alors erreur A51507 ;
verif 15159:
application : iliad;


si
       COD5FK + COD5FM > 0
et
        present(BICNOP) + present (BICDNP) = 0

alors erreur A51509 ;
verif 151511:
application : iliad;


si
       COD5VQ + COD5VV > 0
et
       present(BICREP) + present (BICDEP) = 0

alors erreur A51511 ;
verif 15161:
application : iliad;


si
	(COD5XP + COD5XH) > 0
et
	(present(BNCREV) + present (BNCDEV)) = 0

alors erreur A51601 ;
verif 15163:
application : iliad;


si
	(COD5YP + COD5YH) > 0
et
	(present(BNCREC) + present (BNCDEC)) = 0

alors erreur A51603 ;
verif 15165:
application : iliad;


si
	(COD5XY + COD5VM) > 0
et
	(present(BNCAABV) + present (BNCAADV)) = 0

alors erreur A51605 ;
verif 15167:
application : iliad;


si
	(COD5YY + COD5WM) > 0
et
	(present(BNCAABC) + present (BNCAADC)) = 0

alors erreur A51607 ;
verif 15169:
application : iliad;


si
        (COD5ZP + COD5ZH) > 0
et
        (present(BNCREP) + present (BNCDEP)) = 0

alors erreur A51609 ;
verif 151611:
application : iliad;


si
        (COD5ZY + COD5ZM) > 0
et
        (present(BNCAABP) + present (BNCAADP)) = 0

alors erreur A51611 ;
verif 151701:
application : iliad  ;

si

 V_NOTRAIT + 0 < 20

  et

positif(COD8UA) = 1

et

(present(COD8UB) + present(COD8UC)) = 0 

alors erreur A51701 ;
verif 151702:
application : iliad  ;

si

V_NOTRAIT + 0 < 20

 et

(COD8UC != 3
et
COD8UC != 5)

alors erreur A51702 ;
verif 151703:
application : iliad  ;

si

V_NOTRAIT + 0 < 20
et
positif(COD8UB) = 1
et
positif(COD8UA + 0) = 0

alors erreur A51703 ;
verif 1518:
application : iliad  ;

si

V_IND_TRAIT > 0
et
(V_MODUL + 0) < 1
et
positif(COD5FA) = 1
et
positif(COD8UA + 0) = 0

alors erreur A518 ;
verif 1538: 
application : iliad  ;


si
   (RCSV > 0 et SOMMEA538VB = 0)
   ou
   (RCSC > 0 et SOMMEA538CB = 0)
   ou
   (RCSP > 0 et SOMMEA538PB = 0)

alors erreur A538 ;
verif 1600:
application : iliad  ;

si
   (V_MODUL+0) < 1
     et
   positif(PERPIMPATRIE+0) != 1
   et
   V_CNR + 0 != 1
   et
   ((positif(PERP_COTV + COD6NS + 0) > 0 et
     present(PERPPLAFCV)*present(PERPPLAFNUV1)*present(PERPPLAFNUV2)*present(PERPPLAFNUV3) = 0)
    ou
    (positif(PERP_COTC+ COD6NT + 0) > 0 et
     present(PERPPLAFCC)*present(PERPPLAFNUC1)*present(PERPPLAFNUC2)*present(PERPPLAFNUC3) = 0)
    ou
    (positif(PERP_COTP+ COD6NU + 0) > 0 et
     present(PERPPLAFCP)*present(PERPPLAFNUP1)*present(PERPPLAFNUP2)*present(PERPPLAFNUP3) = 0))

alors erreur A600 ;
verif 1601:
application : iliad  ;

si
   (V_MODUL+0) < 1
     et
   V_CNR + 0 != 1 
   et
   positif(PERPIMPATRIE+0) != 1
   et
   (PERPPLAFCV > LIM_PERPMAXBT
    ou
    PERPPLAFCC > LIM_PERPMAXBT)

alors erreur A601 ;
verif 1603:
application : iliad  ;

si
 (V_MODUL+0) < 1
   et
   positif(PERPIMPATRIE + 0) != 1
   et
   positif(V_CALCULIR + 0) = 0
   et
   V_CNR + 0 != 1
   et
   (
 (positif_ou_nul(PLAF_PERPV) = 1
  et 
 ((PERPPLAFCV + PERPPLAFNUV3 + PERPPLAFNUV2 + PERPPLAFNUV1) != PLAF_PERPV )) 
  ou
 (positif_ou_nul(PLAF_PERPC) = 1 
 et
 ((PERPPLAFCC + PERPPLAFNUC1 + PERPPLAFNUC2 + PERPPLAFNUC3) != PLAF_PERPC ))
 ou
 (positif_ou_nul(PLAF_PERPP) = 1
  et
   ((PERPPLAFCP + PERPPLAFNUP1 + PERPPLAFNUP2 + PERPPLAFNUP3) != PLAF_PERPP ))
  )

alors erreur A603 ;
verif 1604:
application : iliad  ;

si
   (V_MODUL+0) < 1
     et
   (positif(PERPMUTU) = 1 et (V_0AM + V_0AO = 1) et ((V_REGCO+0) dans (1,3,5,6))
    et positif(PERPIMPATRIE+0) = 0
    et (present(PERPPLAFCV) = 0 ou present(PERPPLAFNUV1) = 0
        ou present(PERPPLAFNUV2) = 0 ou present(PERPPLAFNUV3) = 0
        ou present(PERPPLAFCC) = 0 ou present(PERPPLAFNUC1) = 0
        ou present(PERPPLAFNUC2) = 0 ou present(PERPPLAFNUC3) =0))

alors erreur A604 ;
verif 16051:
application : iliad  ;

si
   (V_MODUL+0) < 1
     et
   V_IND_TRAIT > 0
   et
   PERPV + 0 < EXOCETV + 0
   et
   positif(EXOCETV + 0) = 1

alors erreur A60501 ;
verif 16052:
application : iliad  ;

si
   (V_MODUL+0) < 1
     et
   V_IND_TRAIT > 0
   et
   PERPC + 0 < EXOCETC + 0
   et
   positif(EXOCETC + 0) = 1

alors erreur A60502 ;
verif 16061:
application : iliad  ;

si
   (V_MODUL+0) < 1
        et
  positif(COD6EX) = 1
        et 
present(NCHENF1) + present(NCHENF2) + present(NCHENF3) + present(NCHENF4) < 4

alors erreur A60601 ;
verif 16062:
application : iliad  ;

si
   (V_MODUL+0) < 1
       et
  positif(COD6EX) = 1
       et
  present(COD6EZ) = 0

alors erreur A60602 ;
verif 16063:
application : iliad  ;

si
   (V_MODUL+0) < 1
       et
   positif(COD6GX) = 1
       et
present(CHENF1) + present(CHENF2) + present(CHENF3) + present(CHENF4) < 4

alors erreur A60603 ;
verif 16064:
application : iliad  ;

si
   (V_MODUL+0) < 1
       et
  positif(COD6GX) = 1
       et
  present(COD6GZ) = 0

alors erreur A60604 ;
verif 16065:
application : iliad  ;

si
   (V_MODUL+0) < 1
       et
    positif(COD6GZ) = 1
       et
    present(COD6GX) = 0

alors erreur A60605 ;
verif 1610:
application : iliad  ;

si
   (V_MODUL+0) < 1
   et
  ((V_REGCO +0) dans (1,3,5,6)
   ou
  (VALREGCO+0)  dans (1,3,5,6))
   et
 positif(COD6DR) = 1

alors erreur A610 ;



