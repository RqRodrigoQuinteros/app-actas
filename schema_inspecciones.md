# Schema de Inspecciones Sanitarias
> Dirección General de Regulación Sanitaria — Ministerio de Salud, Córdoba, Argentina  
> Fuente: `ACTA_DE_INSPECCION_-_AVILA.xlsx` + `A_REVISAR_ACTAS.pdf`  
> Estado: completo basado en fuentes reales

---

## Tipologías

| Key interno | Nombre legible |
|---|---|
| `QUIRURGICOS` | Quirúrgicos |
| `HEMODIALISIS` | Hemodiálisis (servicio dentro de clínica) |
| `ESTETICA` | Estética |
| `ONCOLOGICO` | Oncológico |
| `OPTICAS` | Ópticas |
| `CENTROSAMBULATORIOS` | Centros Ambulatorios |
| `CLINICA` | Clínica / Internación (tipología general polivalente) |

> **Nota:** La tipología se define en la celda `ACTA!D2`. Las secciones de Guardia, UTI, UCO, UTIN, Hemodinamia, Hospital de Día y Sala de Parto son **subsecciones condicionales** que se activan o desactivan según checkboxes en las celdas `ACTA!F7`–`ACTA!F15`, independientemente de la tipología principal.

---

## Encabezado del Acta (común a todas las tipologías)

| Key (`DATOS_ACTA`) | Label visible | Type | Notas |
|---|---|---|---|
| `NRO_EXPEDIENTE` | N° Expediente Digital | text | Valor libre |
| `DIA` / `MES` / `ANIO` | Fecha | date | Calculado automático desde `ACTA!C4` |
| `HORA` | Hora | time | Automático desde `ACTA!C5` |
| `INS_V` | Inspección Virtual | boolean | SI / NO |
| `INS_P` | Inspección Presencial | boolean | SI / NO |
| `NOMBRE_ESTABLECIMIENTO` | Establecimiento | text | `ACTA!C8` |
| `RAZON_SOCIAL` | Razón Social | text | `ACTA!C9` |
| `DIRECCION_ESTABLECIMIENTO` | Dirección | text | `ACTA!C10` |
| `LOCALIDAD_ESTABLECIMIENTO` | Localidad | text | `ACTA!C11` |
| `EMAIL` | Email | text | `ACTA!C12` |
| `TELEFONO` | Teléfono | text | `ACTA!C13` |
| `INSPECTOR` | Nombre Inspector | text | Selección desplegable; DNI se autocompleta |
| `DNI_INSPECTOR` | DNI Inspector | text | Calculado via VLOOKUP |
| `RADIO_COND` | Radiofísica | boolean | `ACTA!C16` |
| `HEMOTERAPIA_COND` | Hemoterapia | boolean | `ACTA!F16` |
| `TIPO_INSPECCION` | Tipo de Inspección | text | Habilitación / Rutina / Denuncia |
| `FECHA_HAB` | Fecha de Habilitación | date | Valor libre |
| `RESOLUCION` | Resolución N° | text | Valor libre |
| `DIRECTOR_TECNICO` | Director Técnico | text | Nombre libre |
| `DNI_DT` | DNI Director Técnico | text | Valor libre |
| `MATRICULA_DT` | Matrícula Director Técnico | text | Valor libre |
| `RESPONSABLE_INS` | Responsable | text | Valor libre |
| `DNI_RESP` | DNI Responsable | text | Valor libre |
| `CARAC_DE` | En carácter de... | text | Valor libre |

### Checkboxes de subsecciones activas (encabezado)

| Celda `ACTA` | Label | Type | Activa sección |
|---|---|---|---|
| `ACTA!F7` | Guardia | boolean | `guardia` |
| `ACTA!F8` | UTI | boolean | `uti` |
| `ACTA!F9` | UCO | boolean | `uco` |
| `ACTA!F10` | Quirófano | boolean | `quirofano_tipologia` |
| `ACTA!F11` | Oncológico / Hospital de Día | boolean | `hospital_dia` |
| `ACTA!F12` | UTIN | boolean | `utin` |
| `ACTA!F13` | Hemodiálisis | boolean | `hemodialisis_servicio` |
| `ACTA!F14` | Sala de Procedimiento | boolean | — |
| `ACTA!F15` | Hemodinamia | boolean | `hemodinamia` |
| `ACTA!C16` | Radiofísica | boolean | — |
| `ACTA!F16` | Hemoterapia | boolean | — |

---

## Sección: `registros`
**Título en PDF:** Registros

| Key | Label | Type | Notas |
|---|---|---|---|
| `REG_HIS_CLI` | Registro de Historias Clínicas | text | Posee / No posee (desplegable) |
| `TIPO` | Tipo | text | Manual / Digital / Mixta |
| `REV_HC` | Revisión de HC | boolean | |
| `COMP` | Completas | boolean | |
| `INCOMP` | Incompletas | boolean | |
| `RI_MC` | Reglamento Interno / Manual de Procedimientos | text | Texto libre |
| `AD_PRIV` | Aditamento privado / Denominación correcta | text | Texto libre |

---

## Sección: `datos_generales`
**Título en PDF:** Datos Generales

| Key | Label | Type | Notas |
|---|---|---|---|
| `CANT_PL` | Cantidad de Plantas | number | |
| `FEC_ULT_INS` | Fecha última inspección del conservador | date | |
| `POS_MON_ASC` | Posee Montacamillas / Ascensores | text | Montacamillas / Ascensor / Ambos / No |
| `BANIO_DIS` | Baño para público discapacitado mixtos | text | |
| `LIB_ING` | Libre ingreso, circulación y giro de camillas | text | |
| `LUC_AUT` | Luces autónomas de emergencia | text | |
| `EQUI_ELE` | Equipo Electrógeno | text | |
| `PL_EV_VI` | Plan Evacuación vigente | text | |
| `EX_INC` | Extinguidores de Incendios (vigente o no) | text | |
| `SAL_EME` | Salida de Emergencia | text | |
| `HAB_BOMB` | Habilitación Bomberos | text | |
| `SIL_RUE` | Silla de Ruedas | text | |
| `TO_CAM_ORT` | Todas las camas tipo Ortopedia | text | |
| `POS_PLA` | Posee planos inclinados | text | |

---

## Sección: `consultorios_externos`
**Título en PDF:** Consultorios Externos
> Condicional: activa si `ACTA!C35 = TRUE`

| Key | Label | Type |
|---|---|---|
| `CONS_EXT` | Posee Consultorios Externos | boolean |
| `CANT_TOT` | Cantidad total de consultorios | number |
| `CAN_CONS` | Consultorios con baño privado y vestuario | number |
| `CONS_LAV` | Consultorio con lavabo | text |

---

## Sección: `consultorios_salud_mental`
**Título en PDF:** Consultorios Salud Mental
> Condicional: activa si `ACTA!F35 = TRUE`

| Key | Label | Type |
|---|---|---|
| `CON_SAL_MEN` | Posee Consultorios Salud Mental | boolean |
| `VEN_PLAN_EVAC` | Fecha vencimiento Plan Evacuación | date |
| `VEN_BOMB` | Fecha vencimiento Bomberos | date |
| `VEN_EXTI` | Fecha vencimiento Extinguidores | date |

---

## Sección: `la_institucion_posee`
**Título en PDF:** La Institución Posee

| Key | Label | Type |
|---|---|---|
| `VAC_HAB` | Vacunatorio habilitado | text |
| `BOT_DRO_URG` | Botiquín con drogas para urgencias por área y piso | text |
| `FAR_PROV` | Farmacia o provisión de medicamentos habilitados | text |
| `BCO_SAN` | Banco de Sangre y/o Servicio de Med. Transfusional | text |
| `ATE_PER` | Con atención permanente (24 hs) | text |
| `BOT_ARE_PIS` | Botiquín con drogas por área y piso (2) | text |

---

## Sección: `radiofisica`
**Título en PDF:** Radiofísica

| Key | Label | Type | Notas |
|---|---|---|---|
| `DIA_IMA_HAB` | Diagnóstico por imagen habilitados | text | SI / NO / No posee |
| `DEN_OS` | Densitometría ósea habilitados | text | SI / NO / No posee |
| `TAC` | TAC habilitados | text | SI / NO / No posee |
| `RAD_SIM_HAB` | Radiología simple habilitados | text | SI / NO / No posee |
| `ECO_HAB` | Ecografía habilitados | text | SI / NO / No posee |
| `MAM_HAB` | Mamografía habilitados | text | SI / NO / No posee |
| `PET` | PET habilitados | text | SI / NO / No posee |
| `RMN` | RMN habilitados | text | SI / NO / No posee |
| `RAD_CON_HAB` | Radiología contrastada habilitados | text | SI / NO / No posee |

---

## Sección: `sector_internacion`
**Título en PDF:** Sector de Internación — Cumple y Área de Residuos

| Key | Label | Type |
|---|---|---|
| `COND_EDIL` | Condiciones Edilicias | text |
| `ARE_RES` | Área de Residuos | text |

### N° de Camas y Baños por Habitación

| Key | Label | Type |
|---|---|---|
| `H1_INC` | Habitación 1 cama — Baño incluido | number |
| `H1_CON` | Habitación 1 cama — Baño contiguo | number |
| `H2_INC` | Habitación 2 camas — Baño incluido | number |
| `H2_CON` | Habitación 2 camas — Baño contiguo | number |
| `H3_INC` | Habitación 3 camas — Baño incluido | number |
| `H3_CON` | Habitación 3 camas — Baño contiguo | number |
| `OTR` | Otras habitaciones | number |
| `TOT_HABIT` | Total de Habitaciones | number |
| `CAM_ORT_NRO` | Camas ortopédicas N° | number |
| `LLAM_BANIO` | Llamador en los baños | text |

### Depósito de Cadáveres

| Key | Label | Type |
|---|---|---|
| `LOC_DEP` | Local dimensiones apropiadas depósito | text |
| `PER_VENT` | Perfectamente ventilado | text |
| `UBI_ARE_SER` | Ubicado en área de servicio | text |

### Ambientes de Internación y Atención

| Key | Label | Type |
|---|---|---|
| `ILU_NAT` | Iluminación natural | text |
| `VENT_NATU` | Ventilación natural | text |
| `CLI_FRI_CAL` | Climatización frío-calor | text |
| `ILU_ART_CEN` | Iluminación artificial central | text |
| `ILU_ART_IND` | Iluminación artificial individual | text |
| `LLAM_IND` | Llamador individual | text |
| `PRIV` | Privacidad | text |

---

## Sección: `enfermeria`
**Título en PDF:** Enfermería

| Key | Label | Type |
|---|---|---|
| `LOC_PROP` | Posee local propio | text |
| `BOT_URG` | Botiquín de urgencia | text |
| `TUB_OXI` | Tubo de oxígeno | text |
| `MES_PIL` | Mesada con Pileta | text |
| `ARM_VIT` | Armario o vitrina | text |
| `AR_SUC` | Área sucia | text |
| `AR_LIM` | Área limpia | text |

---

## Sección: `area_quirurgica`
**Título en PDF:** Área Quirúrgica

| Key | Label | Type |
|---|---|---|
| `CANT_QUIR` | Cantidad de quirófanos | number |
| `C_N_PAR` | Cumple Normas Paredes | text |
| `C_N_PIS` | Cumple Normas Pisos | text |
| `C_N_TEC` | Cumple Normas Techos | text |
| `CIR_EXC` | Circulación exclusiva | text |
| `IN_TR_PAC` | Ingreso y transferencia de pacientes | text |
| `VES_PROP` | Vestuario propio | text |
| `PO_VE_PA_FI` | Posee ventana con paño fijo | text |
| `S_SUC` | Sector sucio | text |
| `C_DIR_QUIR` | Comunicación directa a quirófano | text |
| `DEP_MAT_ES` | Depósito material estéril | text |
| `IL_ADEC` | Iluminación adecuada | text |
| `CLI_FIO_CALOR` | Climatización frío-calor | text |
| `AC_COMP_PRE` | Acorde a la complejidad prestacional | text |
| `CARD` | Cardiodesfibrilador | text |
| `BOT_ANES` | Botiquín básico anestesia | text |
| `BOT_REA` | Botiquín básico reanimación CV | text |
| `LARIN` | Laringoscopía | text |
| `TUB_ENDO` | Tubos endotraqueales | text |
| `CA_TRAQ` | Caja de traqueotomía | text |
| `MON_MULTI` | Monitor multiparamétrico | text |
| `RES_AUTO` | Respirador automático | text |
| `ME_MAYO` | Mesa de cirugía Tipo Mayo o similar | text |
| `ELEC` | Electrobisturí | text |
| `INS_ESP` | Instrumental s/especialidades | text |

---

## Sección: `obstetricia`
**Título en PDF:** Obstetricia

| Key | Label | Type |
|---|---|---|
| `SAL_PAR` | Posee sala de parto | text |
| `SAL_REC` | Posee sala de recuperación | text |
| `REC_RECNAC` | Posee recepción de recién nacido | text |
| `CANT_SAL_PAR` | Cantidad de salas de partos | number |
| `C_NORMAS_PAR` | Cumple normas paredes | text |
| `C_NORMAS_PIS` | Cumple normas pisos | text |
| `C_NORMAS_TEC` | Cumple normas techos | text |
| `CIRC_EXCL` | Circulación exclusiva | text |
| `IE_PAC` | Ingreso y transferencia de pacientes | text |
| `CL_FRIO_CALOR` | Climatización frío-calor | text |
| `SAL_RECEP` | Sala de Recepción (1 caja de paro / 2 RN simultáneos) | text |
| `1C3_PAR` | 1 c/3 sala de partos | text |
| `6E` | 6 enchufes | text |
| `VE_PRO` | Vestuario propio | text |
| `LAV_PRE` | Lavabos previo filtro de vestuarios | text |
| `S_SUCIO` | Sector sucio | text |
| `CCD_SP` | Comunicación directa a SP | text |
| `S_LIMP` | Sector Limpio | text |
| `CC_DIR_SP` | Comunicación directa de SP | text |
| `HPRE_ARE` | Habitación preparto en el área | text |
| `HPRE_INTE` | Habitación preparto en el internado | text |
| `IL_ADECUADA` | Iluminación adecuada | text |
| `PRO_DES_TIE` | Protección con descarga a tierra | text |
| `1CP_2RN` | 1 caja de paro c/equipamiento para 2 RN simultáneos | text |
| `1P_C2OX` | 1 panel c/2 oxígenos 1 aspiración 1 aire comprimido | text |
| `M_REC_RN` | Mesa de recepción acolchada c/calorificación p/2 RN | text |

---

## Sección: `laboratorio`
**Título en PDF:** Laboratorio

| Key | Label | Type |
|---|---|---|
| `HAB_COB` | Habilitación por COBICO | text |
| `Son` | Interno / Externo | text |
| `Es` | Propio / Contratado | text |

---

## Sección: `guardia`
**Título en PDF:** Guardia
> Condicional: activa si `ACTA!F7 = TRUE`

| Key | Label | Type |
|---|---|---|
| `NRO_CAMAS_GUARDIA` | N° de Camas | number |
| `C_E_GUARDIA` | Coincide con edificación | text |
| `P_GUARDIA` | Planos | text |
| `MEDICOS_GUARDIA` | Médicos (N°) | number |
| `ENFERMERAS_GUARDIA` | Enfermeras (N°) | number |
| `CARDI_GUARDIA` | Cardiodesfibrilador | text |
| `ELEC_GUARDIA` | Electrocardiógrafo | text |
| `M_M_GUARDIA` | Oxímetro de pulso / monitor multiparamétrico | text |
| `E_P_N_GUARDIA` | Equipo para nebulizaciones | text |
| `C_D_P_GUARDIA` | Carro de paro completo | text |

---

## Sección: `uco`
**Título en PDF:** Unidad Coronaria de Cuidados Intensivos (UCO)
> Condicional: activa si `ACTA!F9 = TRUE`

| Key | Label | Type |
|---|---|---|
| `NRO_CAMAS_UCO` | N° de Camas | number |
| `PLANOS_UCO` | Planos | text |
| `C_C_E_UCO` | Coincide con edificación | text |
| `S_V_UCO` | Signos vitales | text |
| `B_D` | Balance diario | text |
| `V_I_E_UCO` | Volúmenes de ingresos y egresos | text |
| `M_UCO` | Medicación | text |
| `U_Z_C_S_UCO` | Unidad en zona de circulación semirrestringida | text |
| `S_I_P_L_UCO` | Sala de internación c/pileta lavamanos | text |
| `O_D_E_UCO` | Office de enfermería | text |
| `MON_UCO` | Monitores | text |
| `L_R_M_U_UCO` | Local de ropa y material usado | text |
| `A_L_UCO` | Área lavachatas | text |
| `D_C_A_UCO` | Depósito de camillas y aparatología | text |
| `S_M_UCO` | Sala de médicos | text |
| `G_E_UCO` | Grupo electrógeno | text |
| `A_C_D_UCO` | Acceso directo y exclusivo | text |
| `F_C_C_UCO` | Fácil comunicación c/cirugía | text |
| `PR_UCO` | Privacidad | text |
| `C_O_A_UCO` | Camas ortopédicas o articuladas | text |
| `D_C_UCO` | Doble comando | text |
| `RO_UCO` | Rodantes | text |
| `P_A_R_UCO` | Plano apoyo rígido | text |
| `A_P_UCO` | Acceso desde 4 posiciones | text |
| `V_P_D_C_UCO` | Visión panorámica directa a todas las camas | text |
| `L_I_M_UCO` | Local de Instrumental y material estéril | text |
| `L_C_C_UCO` | Local cerrado c/1 cama para aislamiento | text |
| `E_V_H_UCO` | Evoluciones diarias en Historia Clínica | text |
| `V_V_P_UCO` | Vestuario para visitas c/pileta lavamanos | text |
| `H_C_UCO` | Habitación c/baño propio para médico de Guardia | text |
| `C_L_UCO` | Comparte algún local UCI / UCO | text |
| `P_U_UCO` | Posee otras Unidades de UCI / UCO | text |
| `D_T_E_UCO` | Diez tomas de electricidad por cama | text |
| `S_I_UCO` | Sistema de Iluminación de Emergencia | text |
| `HERM_UCO` | Hermeticidad | text |
| `S_T_S_UCO` | Superficie total sala internación | text |
| `I_N_UCO` | Iluminación natural | text |
| `I_A_UCO` | Iluminación artificial central | text |
| `I_I_UCO` | Iluminación Individual | text |
| `V_A_E_P_UCO` | Ventanas al exterior De paño fijo | text |
| `E_ASP_UCO` | Equipo de aspiración | text |
| `RES_MEC_VOL_UCO` | Respirador mecánico volumétrico | text |
| `E_DES_SIN_UCO` | Equipo de desfibrilación y sincronizador | text |
| `BO_INF_UCO` | Bomba de infusión | text |
| `CAR1_UCO` | Carro de urgencias | text |
| `LARI_UCO` | Laringoscopios | text |
| `MASC_UCO` | Máscara | text |
| `RES_AMBU_UCO` | Resucitador tipo AMBU | text |
| `TENS_UCO` | Tensiómetro | text |
| `NEBU_UCO` | Nebulizador | text |
| `EL_IN_ENDO_UCO` | Elementos para intubación endotraqueal | text |
| `SIS_POR_AS_UCO` | Sistema portátil de aspiración p/drenaje | text |
| `CAT_NASO_UCO` | Equipos para cateterización nasogástrica | text |
| `E_PUN_RAQ_UCO` | Equipos para punción raquídea | text |
| `E_PUN_ABD_UCO` | Equipo para punción abdominal | text |
| `CAR_PAR_UCO` | Carro de paro | text |
| `OX_PUL_POR_UCO` | Oxímetro de pulso portátil | text |
| `ELEC_UCO` | Electrocardiógrafo | text |
| `MAR2CAT_UCO` | Marcapaso transitorio con 2 catéteres | text |
| `EQRX_UCO` | Equipo portátil de Rx 100 Ma/100 Kv | text |
| `EL_TRAQ_UCO` | Elementos para traqueotomía | text |
| `BOL_UCO` | Bolsa | text |
| `ADA_UCO` | Adaptador | text |
| `CAR_CUR_UCO` | Carro de curación | text |
| `INS_EXA_UCO` | Instrumental de examen | text |
| `IL_IND_UCO` | Iluminación individual | text |
| `SIS_TOR_UCO` | Sistema de aspiración torácica | text |
| `CAT_VES_UCO` | Equipos para cateterización vesical | text |
| `CAT_CAT_VEN_UCO` | Equipos para cateterización venosa | text |
| `E_PUN_TOR_UCO` | Equipo para punción torácica | text |
| `BOT24_UCO` | Botiquín c/medicamentos para urgencias de 24 hs | text |

---

## Sección: `uti`
**Título en PDF:** Unidad de Terapia Intensiva (UTI)
> Condicional: activa si `ACTA!F8 = TRUE`
> Estructura idéntica a UCO con sufijo `_UTI`. Agrega además:

| Key extra | Label | Type |
|---|---|---|
| `MARTRANS_NOUCO_UTI` | Marcapaso transitorio (si no tiene UCO) | text |
| `SUPTOT_UTI` | Superficie total sala internación | number |

---

## Sección: `utin`
**Título en PDF:** Unidad de Terapia Intensiva Neonatal (UTIN)
> Condicional: activa si `ACTA!F12 = TRUE`

Incluye la misma estructura base que UTI/UCO con sufijo `_UTIN`, más los campos específicos neonatales:

| Key | Label | Type |
|---|---|---|
| `OF_ENF_M_UTIN` | Office de enfermería con monitores | text |
| `AR_DE_RL_UTIN` | Área de depósito ropa limpia | text |
| `PIL_MAT` | Pileta para material | text |
| `DEP_UTIN` | Depósito para incubadora/cuna/aparatos | text |
| `CAM_A_CODO_UTIN` | Camillas accionadas a codo c/dispensador líquido | text |
| `LOC_FOR_LAC_UTIN` | Local de fórmulas lácteas | text |
| `EX_AIR_FIL_UTIN` | Extractor de aire con filtro | text |
| `SIS_CAL_REF_UTIN` | Sistema calefacción refrigeración | text |
| `TOM_ELE_CAM_UTIN` | Ocho tomas de electricidad por cama con tablero independiente | text |
| `INCU_UTIN` | Incubadoras | text |
| `AIR_COM_UTIN` | Aire comprimido | text |
| `ASPI_UTIN` | Aspiración | text |
| `UNI_AIS_UTIN` | Unidades de aislamiento | text |
| `CON_MON_UTIN` | Consola de monitoreo | text |
| `CUNAS_UTIN` | Cunas | text |

#### Equipamiento UTIN (cada 8 unidades)

| Key | Label | Type |
|---|---|---|
| `INC_SER_CERR_UTIN` | Incubadoras a servocontrol de circuito cerrado 6 | text |
| `INC_SER_RES_UTIN` | Incubadoras a servocontrol de reserva 2 | text |
| `INC_TRAN_UTIN` | Incubadora de Transporte 2 | text |
| `INC_SERV_UTIN` | Incubadoras servocunas 2 | text |
| `MON_TR_OXI_UTIN` | Monitores transcutáneos de oxígeno 1 | text |
| `RES_NEO_UTIN` | Respirador Neonatal SIMV/INV 2 | text |
| `MEZ_OXI_AIR_COM_UTIN` | Mezclador O₂-aire comprimido (Blender) 8 | text |
| `HALO_UTIN` | Halocefálico con tapa rebatible 3+3 | text |
| `EQ_REA_COMP_UTIN` | Equipo para reanimación completo 2 | text |
| `AS_REG_MAN_UTIN` | Aspirador regulable con manómetro 1 | text |
| `SIN_DES_UTIN` | Sincronizador desfibrilador con paletas neonatal 1 | text |
| `BAL_ELE_UTIN` | Balanza electrónica 1 | text |
| `ELECTRO_UTIN` | Electrocardiógrafo 1 | text |
| `PEDIO_UTIN` | Pediómetro 1 | text |
| `ECO_DOPPLER_UTIN` | Ecógrafo portátil ECO Doppler color 1 | text |
| `COC_2_UTIN` | Cocina 2 hornallas FÓRMULA LÁCTEA | text |
| `HEL_LAC_UTIN` | Heladera FÓRMULA LÁCTEA | text |
| `OX_AIR_AS_UTIN` | O₂, aire comprimido y aspiración central 1 toma/unidad | text |
| `TUB_OXI_POR_UTIN` | Tubos de oxígeno portátil 2 | text |
| `MON_CARD_UTIN` | Monitores cardiorrespiratorios 4 | text |
| `TENS_NEON_UTIN` | Tensiómetro Neonatal efecto Doppler 2 | text |
| `BOM_PER_JER_UTIN` | Bomba de perfusión de jeringa 4 | text |
| `BOM_PER_CON_UTIN` | Bomba de perfusión continua 4 | text |
| `SPO_LUMI_UTIN` | Spot de luminoterapia 4 | text |
| `OXI_PUL_UTIN` | Oxímetro de pulso 4 | text |
| `CAN_ART_UTIN` | Canalización arteria umbilical / punción lumbar / PVC / etc. | text |
| `CAL_HUM_UTIN` | Calentador humidificador tipo Fishel Paykel 6 | text |
| `BAL_NEO_INC_UTIN` | Balanzas neonatales/incubadoras 6 | text |
| `LAB_QUI_UTIN` | Cronograma: Lab. bioquímico | text |
| `RAD_UTIN` | Cronograma: Radiología | text |
| `HEMO_UTIN` | Cronograma: Hemoterapia | text |

---

## Sección: `hemodinamia`
**Título en PDF:** Hemodinamia
> Condicional: activa si `ACTA!F15 = TRUE`

| Key | Label | Type |
|---|---|---|
| `NRO_CAMAS_HEMO` | N° de Camas | number |
| `PLANOS_HEMO` | Planos | text |
| `COED_HEMO` | Coincide con edificación | text |
| `JEFSERV_HEMO` | Jefe de Servicio | text |
| `MED_HEMO` | Médico | text |
| `ENFPROF_HEMO` | Enfermero profesional | text |
| `MERADI_HEMO` | Médico radiólogo | text |
| `MEANES_HEMO` | Médico anestesista | text |
| `ARCC_HEMO` | Arco en C o paralelogramo deformable | text |
| `MECATE_HEMO` | Mesa de Cateterismo | text |
| `INTIMA_HEMO` | Intensificador de imágenes | text |
| `TUBRAYX_HEMO` | Tubo de rayos X | text |
| `GENPUL_HEMO` | Generadores pulsados por tetrodos | text |
| `ELEC_HEMO` | Electrocardiógrafo | text |
| `OXIPUL_HEMO` | Oxímetro de pulso | text |
| `CARDIO_HEMO` | Cardiodesfibrilador | text |
| `INY_CON_HEMO` | Inyectora de contraste | text |
| `MONDIG_HEMO` | Monitor digital | text |

---

## Sección: `hospital_dia`
**Título en PDF:** Hospital de Día
> Condicional: activa si `ACTA!F11 = TRUE`

| Key | Label | Type |
|---|---|---|
| `NRO_CAMAS_HDD` | N° de Camas | number |
| `PLAN_HDD` | Planos | text |
| `COED_HDD` | Coincide con edificación | text |
| `JEFSERV_HDD` | Jefe de Servicio | text |
| `MEDONC_HDD` | Médico oncológico | text |
| `TRSOC_HDD` | Trabajador social | text |
| `ENF_HDD` | Enfermeros | text |
| `KINE_HDD` | Kinesiólogo | text |
| `PSICO_HDD` | Psicólogo | text |
| `NUTRI_HDD` | Nutricionista | text |
| `SILLONC_HDD` | Sillón de Oncología | text |
| `COLANTI_HDD` | Colchón antiescaras | text |
| `BOMINF_HDD` | Bomba de infusión | text |
| `CAFLULA_HDD` | Campana de flujo laminar | text |
| `BALA_HDD` | Balanza de uso clínico con cartabón | text |
| `EQUIMON_HDD` | Equipo de monitoreo presión arterial | text |
| `OXIPUL_HDD` | Oxímetro de pulso | text |

---

## Tipología: `QUIRURGICOS` — Secciones específicas

**Secciones (en orden):**
1. `encabezado`
2. `quirurgicos_inscripcion`
3. `quirurgicos_direccion_funcionamiento`
4. `quirurgicos_consultorios`
5. `quirurgicos_enfermeria`
6. `quirurgicos_area_internacion`
7. `quirurgicos_equipamiento`
8. `quirurgicos_esterilizacion`

### `quirurgicos_inscripcion`
**Título:** De la Inscripción y Habilitación

| Key | Label | Type |
|---|---|---|
| `NRO_CAMAS_QUIR` | N° Total de Camas | number |
| `PLAN_QUIR` | Planos | text |
| `TISOC_QUIR` | Tipo de Sociedad | text |
| `ADPRIV_QUIR` | Aditamiento Privado | text |
| `DIRLIS_QUIR` | Director y Listado de Profesionales | text |
| `NOPRAC_QUIR` | Nómina de prácticas ambulatorias | text |
| `CONEST_QUIR` | Convenio con establecimientos polivalentes | text |
| `CONSEREME_QUIR` | Convenio con Servicio de Emergencias | text |
| `CONSERTRAS_QUIR` | Convenio con Traslado de Residuos Patógenos | text |
| `ORGFUNC_QUIR` | Organigrama funcional | text |
| `APA_QUIR` | Aparatología | text |
| `COINED_QUIR` | Coincide con edificación | text |
| `NOPROC_QUIR` | Nómina de procedimientos | text |
| `CONLAB_QUIR` | Convenio con Laboratorio | text |

### `quirurgicos_direccion_funcionamiento`
**Título:** De la Dirección y Funcionamiento

| Key | Label | Type |
|---|---|---|
| `REGENFTRA_QUIR` | Registro de Enfermedades Transmisibles | text |
| `REGINT_QUIR` | Reglamento Interno | text |
| `NROPLA_QUIR` | Número de Plantas | number |
| `ASCMON_QUIR` | Ascensor / Montacamillas | text |
| `DISDIF_QUIR` | Disyuntor diferencial | text |
| `EVAINC_QUIR` | Plan de evacuación de Incendios | text |
| `REGHISCLIN_QUIR` | Registro de Historias Clínicas Completo | text |
| `EXT_QUIR` | Extinguidores | text |
| `HABBOMB_QUIR` | Habilitación de Bomberos | text |
| `PLINCL_QUIR` | Plano inclinado | text |
| `SALEME_QUIR` | Salida de Emergencia | text |
| `ARPATO_QUIR` | Área para residuos patógenos | text |
| `NROCONS_QUIR` | N° de Consultorios | number |
| `IL_QUIR` | Iluminación | text |
| `VENT_QUIR` | Ventilación | text |
| `PRI_QUIR` | Privacidad | text |
| `LAV_QUIR` | Lavabos | text |
| `ARESP_QUIR` | Área de Espera | text |
| `SUP_QUIR` | Superficie | number |
| `NROASI_QUIR` | N° de asientos | number |
| `BANPUB_QUIR` | Baño para público / personal | text |

### `quirurgicos_enfermeria`
**Título:** Enfermería

| Key | Label | Type |
|---|---|---|
| `LOCPROP_QUIR` | Local propio | text |
| `TUBOX_QUIR` | Tubo oxígeno | text |
| `ESTE_QUIR` | Estetoscopio | text |
| `CACUR_QUIR` | Caja de Curaciones | text |
| `ARPROC_QUIR` | Área procesamiento Limpios y Usados | text |
| `ARM_QUIR` | Armario o Vitrinas | text |
| `BOTURG_QUIR` | Botiquín urgencia | text |
| `MEPIL_QUIR` | Mesada con pileta | text |
| `EST_QUIR` | Estantes | text |
| `SIRUE_QUIR` | Silla de ruedas | text |
| `HEL_QUIR` | Heladera | text |
| `TENSI_QUIR` | Tensiómetro | text |

### `quirurgicos_area_internacion`
**Título:** Área Internación

| Key | Label | Type | Notas |
|---|---|---|---|
| `HABREC_QUIR` | Habitación de recuperación y/o prácticas clínicas | text | |
| `BOC_QUIR` | Boca de oxígeno | text | |
| `POBAN_QUIR` | Posee baño privado o compartido | text | |
| `POCAMORT_QUIR` | Posee cama ortopédica | text | |
| `LIBGIR_QUIR` | Libre giro de camillas | text | |
| `CAN_QUIR` | Cantidad | number | |
| `LAV_QUIRU` | Lavabos | text | |
| `PRIVA_QUIR` | Privacidad | text | |
| `LLAMIND_QUIR` | Llamador individual | text | |
| `CLIMAT_QUIR` | Climatización | text | |
| `TUOXIG_QUIR` | Tubo de Oxígeno | text | |
| `BOVAC_QUIR` | Boca de Vacío | text | |
| `HABPED_QUIR` | Habitación Pediátrica Diferenciada | text | |
| `HABPACESP_QUIR` | Habitación Pacientes Especiales (crítico-semicrítico) | text | |
| `NRO_QUIROFNOS_QUIR` | N° de quirófanos | number | |
| `OBS1_QUIR` | Observaciones quirófano | text | Texto libre |
| `QUIR_DIMEN` | Quirófano: dimensiones | text | |
| `PISOS_QUIR` | Pisos | text | |
| `PAREDES_QUIR` | Paredes | text | |
| `VEST_QUIR` | Vestuarios | text | |
| `INGTRAN_QUIR` | Ingreso y Transferencia de Pacientes | text | |
| `COMDIR_QUIR` | Comunicación directa a Quirófano | text | |
| `OBS2_QUIR` | Observaciones sala recuperación | text | Texto libre |
| `TECHOS_QUIR` | Techos | text | |
| `SALRECU_QUIR` | Sala de Recuperación | text | |
| `ILUM_QUIR` | Iluminación | text | |
| `CLIMATI_QUIR` | Climatización | text | |
| `LAVPREV_QUIR` | Lavabos filtro previo por Vestuario | text | |
| `SALPRE_QUIR` | Sala de Pre-Anestesia (No excluyente) | text | |
| `ARAPOY_QUIR` | Área de Apoyo para material sucio | text | |

### `quirurgicos_equipamiento`
**Título:** Del Equipamiento

| Key | Label | Type |
|---|---|---|
| `BOTBAS_QUIR` | Botiquín básico c/anestésicos y p/reanimación CV | text |
| `LARITUB_QUIR` | Laringoscopio y Tubos Endotraqueales | text |
| `CAJTRAQ_QUIR` | Caja traqueostomía | text |
| `MON_QUIR` | Monitor | text |
| `ELECTRO_QUIR` | Electrobisturí | text |
| `ASAUTO_QUIR` | Aspirador automático | text |
| `OXIPUL_QUIR` | Oxímetro de pulso | text |
| `LAMCIAL_QUIR` | Lámpara cialítica | text |
| `MEMASI_QUIR` | Mesa cirugía Mayor o similar | text |
| `INSTRU_QUIR` | Instrumental | text |
| `FUENEPRO_QUIR` | Fuente energía propia | text |
| `GRUELE_QUIR` | Grupo electrógeno | text |
| `RESAUTO_QUIR` | Respirador automático | text |
| `TUBOXI_QUIR` | Tubo de Oxígeno | text |
| `CARDI_QUIR` | Cardiodesfibrilador | text |

### `quirurgicos_esterilizacion`
**Título:** Esterilización

| Key | Label | Type |
|---|---|---|
| `EST_QUIR` | Estufa | text |
| `CONEMPAUTO_QUIR` | Contrato con empresa autorizada | text |
| `AUTOCL_QUIR` | Autoclave | text |
| `MATDES_QUIR` | Material descartable | text |

---

## Tipología: `HEMODIALISIS` (servicio)

**Secciones (en orden):**
1. `hemodialisis_direccion_funcionamiento`
2. `hemodialisis_analisis_agua`
3. `hemodialisis_serologia`

### `hemodialisis_direccion_funcionamiento`

| Key | Label | Type |
|---|---|---|
| `INDIAIND_HEMODI` | Unidad de Diálisis Independiente | text |
| `REPSICO_HEMODI` | Registro de Psicofármacos Actualizado | text |
| `REENFTRA_HEMODI` | Registro de Enfermedades Transmisibles | text |
| `REGINT_HEMODI` | Reglamento Interno | text |
| `PLEVAC_HEMODI` | Plan de Evacuación | text |
| `HABBOMB_HEMODI` | Habilitación de Bomberos | text |
| `NOBIO_HEMODI` | Normas bioseguridad expuestas | text |
| `NOPROMED_HEMODI` | Normas de Procedimientos para Médicos | text |
| `NOPROENF_HEMODI` | Normas de Procedimientos para Enfermeras | text |
| `NROINS_HEMODI` | Nro de Inscripción INCUCAI y/o ECODAI | text |
| `INSC_HEMODI` | Carpetas de Inscripción INCUCAI y/o ECODAI | text |
| `CONV_INT_HEMODI` | Convenio de Internación | text |
| `REGCLINCOMP_HEMODI` | Registro Historia Clínica completa | text |
| `CANT_PUES_HEMO` | Cantidad de puestos | number |

### `hemodialisis_analisis_agua`

| Key | Label | Type | Notas |
|---|---|---|---|
| `FISQUIM_HEMODI` | Análisis Fisicoquímico | text | |
| `ULFISQUI_HEMODI` | Fecha último análisis fisicoquímico | date | Valor libre |
| `BACTERIO_HEMODI` | Análisis Bacteriológico | text | |
| `ULBACTE_HEMODI` | Fecha último análisis bacteriológico | date | Valor libre |

### `hemodialisis_serologia`

| Key | Label | Type | Notas |
|---|---|---|---|
| `HIV_HEMODI` | HIV (Personal) | text | |
| `HEPB_HEMODI` | Hepatitis B (Personal) | text | |
| `HEPC_HEMODI` | Hepatitis C (Personal) | text | |
| `OBS_HEMODI` | Observaciones | text | Texto libre |
| `PERENF_HEMODI` | Planillas de Personal Enfermería | text | |
| `HIVPA_HEMODI` | HIV (Pacientes) | text | |
| `HB_HEMODI` | Hepatitis B (Pacientes) | text | |
| `HC_HEMODI` | Hepatitis C (Pacientes) | text | |
| `LIBREU_HEMODI` | Libro de Reusos | text | |
| `CMAXREU_HEMODI` | Cantidad máxima de reusos | number | |

---

## Tipología: `ESTETICA` / `ONCOLOGICO`

**Secciones (en orden):**
1. `estetica_inscripcion`
2. `estetica_direccion_funcionamiento`
3. `estetica_consultorios`

### `estetica_inscripcion`

| Key | Label | Type |
|---|---|---|
| `NRO_CAM_REC` | N° Total de Camas de recuperación | number |
| `TI_SOC` | Tipo de Sociedad | text |
| `AD_PRIV` | Aditamento Privado | text |
| `PLA` | Planos | text |
| `CER_AU_LAB` | Certificado autorización Laboratorio | text |
| `CER_AU_IND` | Certificado autorización Individual | text |
| `CER_HAB_HEMO` | Certificado Habilitación Hemoterapia | text |
| `NOM_PRA_AMB` | Nómina de prácticas ambulatorias | text |
| `CONV_SERV` | Convenio Servicio de Emergencias / Unidades Móviles | text |
| `DIR_LIS_PRO` | Director y Listado de Profesionales | text |
| `ORG_FUNC` | Organigrama funcional | text |
| `APAR` | Aparatología | text |
| `CER_AU_DIA_IMA` | Certificado autorización Diagnóstico x Imágenes | text |
| `HAB_IN_EQ` | Certificado Habilitación de la Instalación del Equipo | text |
| `SEL_LEY` | Sellado de Ley | text |
| `CON_POLIV` | Convenio con establecimientos polivalentes | text |

### `estetica_direccion_funcionamiento`

| Key | Label | Type |
|---|---|---|
| `REG_ENF_TRANS` | Registro de Enfermedades Transmisibles | text |
| `REG_INT` | Reglamento Interno | text |
| `REG_PSICO` | Registro de Psicofármacos | text |
| `REG_HIS_CLI_COMP` | Registro de Historias Clínicas Completo | text |
| `MINU` | Municipalidad | text |
| `PROV` | Provincia | text |
| `GAS` | Gas | text |
| `AGUA` | Agua | text |
| `LUZ` | Luz | text |
| `OTR` | Otras | text |
| `NRO_PLANTAS` | Número de Plantas | number |
| `ASC_MON` | Ascensor / Montacamillas | text |
| `PLA_INC` | Plano inclinado | text |
| `SAL_EMERG` | Salida de Emergencia | text |
| `PL_EVA_INC` | Plan de evacuación de Incendios | text |

### `estetica_consultorios`

| Key | Label | Type |
|---|---|---|
| `NRO` | Número de consultorios | number |
| `VENT` | Ventilación | text |
| `LAVABOS` | Lavabos | text |
| `SUP` | Superficie | number |
| `BA_DISC` | Baño para discapacitados | text |
| `TECHO` | Techo | text |
| `PAREDES` | Paredes | text |
| `CON_EMP_AUT` | Contrato con empresa autorizada | text |
| `MI_AD_PRES` | Microscopio adecuado a las prestaciones | text |
| `BA_TERM` | Baño termostatizado | text |
| `ES_CUL` | Estufa de cultivo | text |
| `ILUM` | Iluminación | text |
| `PRIVA` | Privacidad | text |
| `AR_ES` | Área de Espera | text |
| `NRO_ASIENTOS` | N° de asientos | number |
| `CONS_C_BA` | Consultorio c/baño incluido | text |
| `PISOS` | Pisos | text |
| `ESTU` | Estufa | text |
| `MA_DES` | Material descartable | text |
| `CENTRIF` | Centrífuga | text |
| `FOTOCO` | Fotocolorímetro | text |
| `ES_ESF` | Estufa de esterilización | text |

#### Prestaciones Bioquímicas (Estética/Oncológico)

| Key | Label | Type |
|---|---|---|
| `AMILA` | Amilasemia | text |
| `GR_SANG` | Grupo sanguíneo | text |
| `RE_ERI` | Recuento de eritrocitos | text |
| `BACTE_DIR` | Bacteriología directa | text |
| `CALCEMIA` | Calcemia | text |
| `COLES` | Colesterolemia | text |
| `OBSE` | Observaciones | text |
| `G.O.T.` | GOT | text |
| `GLUCEMIA` | Glucemia | text |
| `REC_PLAQ` | Recuento de plaquetas | text |
| `LATEX` | Látex | text |
| `URE_URI` | Uremia y Uricemia | text |
| `PRO_C` | Proteína C Reactiva | text |
| `ANTIES_0` | Antiestreptolisina O | text |
| `FAC_RH` | Factor Rh | text |
| `REC_LEUCO` | Recuento de leucocitos | text |
| `BILI` | Bilirrubinemia | text |
| `DOS_HEMO` | Dosaje de hemoglobina | text |
| `ERITRO` | Eritrosedimentación | text |
| `FOS_ALC` | Fosfatasa alcalina | text |
| `G.P.T.` | GPT | text |
| `CREAT` | Creatininemia | text |
| `TEST_EMB` | Test de embarazo | text |
| `TIE_COA` | Tiempo de coagulación y sangría | text |
| `HEMATOCR` | Hematocrito | text |

---

## Tipología: `OPTICAS`

**Secciones (en orden):**
1. `opticas_local`
2. `opticas_taller`
3. `opticas_gabinete_contactologia`

### `opticas_local`
**Título:** Local (Art. 7, 11, 12, 13)

| Key | Label | Type |
|---|---|---|
| `ART11` | Óptico regente presente (Art. 11) | text |
| `ART7` | Presentó Planos Art. 7 | text |
| `LIBREC` | Libro Recetario / Fichero / Respaldo informático | text |
| `ILAD_LOC` | Iluminación adecuada Art. 13 a) | text |
| `INTERPU` | Interpupilómetro Art. 13 a) | text |
| `CAR_PRU` | Cartilla de prueba para visión cercana | text |
| `ART12_ANEXO` | Anexo o dependientes de consultorios médicos | text |
| `DIPLO_EXHI` | Diploma/s exhibido/s Art. 7 | text |
| `MOSTR` | Mostrador Art. 13 a) | text |
| `ESP_MOSTR` | Espejo para mostrador | text |
| `MUE_COL` | Muestrario de colores de cristales | text |
| `CAR_OPT` | Cartel de optotipo Art. 13 a) | text |

### `opticas_taller`
**Título:** Art. 8 Taller

| Key | Label | Type |
|---|---|---|
| `FRONTO` | Frontofocómetro | text |
| `ESFERO` | Esferómetro | text |
| `PIN_ADAP` | Pinzas de adaptación | text |
| `BAN_OPT` | Banco Óptico o Mesa de Trabajo | text |
| `DES_VAR` | Destornilladores Varios | text |
| `STOCK_CRIS` | Stock de Cristales | text |
| `ARM_METAL` | Armazones metal (50) | text |
| `CALIS` | Calisoires Varios | text |
| `PU_VIDIA` | Punta de Vidia o Máquina Cortadora | text |
| `ESPECI` | Especímetro | text |
| `CALEF` | Calefactor | text |
| `MA_BISE` | Máquina Biseladora o Calibradora | text |
| `LIM_VAR` | Limas Varias | text |
| `MART` | Martillo | text |
| `ARM_INY` | Armazones inyectados (50) | text |
| `TAL_PERF` | Taladro o Perforador de Mano | text |
| `MACH_VAR` | Machos Varios | text |

### `opticas_gabinete_contactologia`
**Título:** Gabinete de Contactología

| Key | Label | Type |
|---|---|---|
| `SAL_DE_ESP` | Sala de Espera | text |
| `FRONTOFO` | Frontofocómetro | text |
| `LA_LUZ_NE` | Lámpara de luz negra o de cobalto | text |
| `LUPA4` | Lupa de 4 o más aumentos con red milimetrada | text |
| `TA_CONVE` | Tabla de conversión de dioptrías a milímetros | text |
| `OPTOTI` | Optotipo de refracción o proyección | text |
| `LEN_CONT` | Caja de pruebas de lentes de contacto | text |
| `SI_APO_CLI` | Sillón c/apoya cabeza para pacientes | text |
| `OFTALMO` | Oftalmómetro / Queratómetro | text |
| `CRI12` | Caja de pruebas de cristales 12+ dioptrías | text |
| `JUE_TABL` | Juego de tablas de distancia de vértice | text |
| `MED_DIA` | Medidor de diámetro | text |
| `LAVABO` | Lavabo | text |
| `LA_ILU_FRO` | Lámpara para iluminación frontal | text |

---

## Tipología: `CENTROSAMBULATORIOS`

**Secciones (en orden):**
1. `centamb_inscripcion`
2. `centamb_direccion_funcionamiento`
3. `centamb_esterilizacion`

### `centamb_inscripcion`

| Key | Label | Type |
|---|---|---|
| `FORM` | Formulario | text |
| `AD_PRIVAD` | Aditamiento Privado | text |
| `CER_AUTO_LAB` | Certificado autorización Laboratorio | text |
| `CONV_EST` | Convenio con establecimientos polivalentes | text |
| `ORG_FUNC` | Organigrama funcional | text |
| `PLANOS` | Planos | text |
| `NO_PRA_AMB` | Nómina de prácticas ambulatorias | text |
| `TIP_SOCIE` | Tipo de Sociedad | text |
| `DIR_LIS_PROF` | Director y Listado de Profesionales | text |
| `CER_RAYX` | Certificado habilitación equipo de Rayos X | text |
| `CON_SERV_EME` | Convenio Servicio de Emergencias | text |
| `APARATO` | Aparatología | text |
| `CER_HAB_HEM` | Certificado Habilitación Hemoterapia | text |

### `centamb_direccion_funcionamiento`

| Key | Label | Type |
|---|---|---|
| `NRO_PLANTAS` | N° de Plantas | number |
| `NRO_CONSULTORIOS` | N° de Consultorios | number |
| `ASC_MONTA` | Ascensor / Montacamillas | text |
| `ILUM` | Iluminación | text |
| `SALI_EME` | Salida de Emergencia | text |
| `VENTIL` | Ventilación | text |
| `REG_HISCLI` | Registro de Historias Clínicas Completo | text |
| `PRIVA` | Privacidad | text |
| `PLA_INCLI` | Plano inclinado | text |
| `LAVAB` | Lavabos | text |
| `PLAN_EVAC` | Plan de evacuación | text |
| `CON_C_BAN` | Consultorio c/baño | text |
| `AR_ESPE` | Área de Espera | text |
| `TEC` | Techo | text |
| `SUP` | Superficie | number |
| `BAN_DISCA` | Baño discapacitados | text |
| `NRO_ASIENTOS` | N° de asientos | number |

### `centamb_esterilizacion`

| Key | Label | Type |
|---|---|---|
| `EST_AUTOC` | Estufa y Autoclave | text |
| `CON_EMP_AUTO` | Contrato con empresa autorizada | text |
| `MAT_DESC` | Material descartable | text |
| `MICRO_PRESTA` | Microscopio adecuado a las prestaciones | text |
| `CENTRIF` | Centrífuga | text |
| `BAN_TERMO` | Baño termostatizado | text |
| `FOTOCOL` | Fotocolorímetro | text |
| `ES_CUL` | Estufa de cultivo | text |
| `EST_ESTE` | Estufa de esterilización | text |
| `HELAD` | Heladera | text |

---

## Inspectores (tabla `Dni_ins`)

| Nombre | DNI |
|---|---|
| FABIAN AVILA | 92854906 |
| CRISTIAN RECALDE | 25202207 |
| DIEGO CLAVERO | 18302479 |
| ESTEBAN ANDRES GARATE | 26179040 |
| FABIAN EDUARDO RINALDI | 17597097 |
| PAULA ANDREA RUIZ | 20307675 |
| SERGIO GERMAN ARROYO | 20363941 |
| JOSE LUIS PATRIGNANI | 24188491 |
| PABLO VALLE | 22078426 |
| MOIRA MAZA | 25608474 |
| FLORENCIA MEJIASE | 39822099 |
| CAMILA PUCA | 41530952 |

---

## Reglas especiales globales

### Lógica condicional (desde `DATOS_ACTA`)
```
QUIR_COND     = IF(ACTA!D2 = "QUIRURGICOS",           "SI", "NO CORRESPONDE")
OPT_COND      = IF(ACTA!D2 = "OPTICAS",               "SI", "NO CORRESPONDE")
ES_ONC_COND   = IF(OR(D2="ESTETICA", D2="ONCOLOGICO"), "SI", "NO CORRESPONDE")
CENAMB_COND   = IF(ACTA!D2 = "CENTROSAMBULATORIOS",   "SI", "NO CORRESPONDE")
HEMODIA_COND  = IF(ACTA!F13, "SI", "NO CORRESPONDE")
UTI_COND      = IF(ACTA!F8,  "SI", "NO CORRESPONDE")
UCO_COND      = IF(ACTA!F9,  "SI", "NO CORRESPONDE")
UTI_NEO_COND  = IF(ACTA!F12, "SI", "NO CORRESPONDE")
HEMODINA_COND = IF(ACTA!F15, "SI", "NO CORRESPONDE")
DT_COND       = IF(ACTA!C19="", "NO", "SI")
```

### Campos calculados
- `DNI_INSPECTOR`: VLOOKUP sobre hoja `Dni_ins` usando nombre del inspector
- `DIA`, `MES`, `ANIO`: Extraídos de `ACTA!C4` con DAY(), PROPER(TEXT()), YEAR()
- `TOT_HABIT`: SUM de filas de camas incluidas + contiguas
- `LAB_COND`: `IF(ACTA!C109="", "SI", "")` — indica si el lab. es externo

### Campos críticos (rojo si NO / vacío)
Aunque el Excel no tiene regla explícita de color, funcionalmente estos campos son de cumplimiento obligatorio:
- Director Técnico (`DT_COND`)
- Habilitación de Bomberos
- Plan de Evacuación vigente
- Análisis de Agua Fisicoquímico y Bacteriológico (Hemodiálisis)
- Convenio de Internación (Hemodiálisis)
- Habilitación COBICO (Laboratorio)
- Normas de bioseguridad expuestas (Hemodiálisis)

### Observaciones — campos de texto libre
- `OBS_HEMODI` — Observaciones Hemodiálisis
- `OBS1_QUIR`, `OBS2_QUIR` — Observaciones secciones Quirúrgicos
- `OBSERVACIONES` — campo global del acta (key en `DATOS_ACTA`, no mapeado aún)
- `OBSE` en prestaciones bioquímicas (Estética/Oncológico)

---

*Generado a partir de: `ACTA_DE_INSPECCION_-_AVILA.xlsx` (hojas ACTA, DATOS_ACTA, Dni_ins) + `A_REVISAR_ACTAS.pdf`*
