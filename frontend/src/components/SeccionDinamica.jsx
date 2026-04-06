import { SECCION_LABELS } from '../utils/constants';

const CAMPOS_POR_SECCION = {
  conclusion: [
    { key: 'observado', label: 'Observado' },
    { key: 'director_tecnico', label: 'Director Técnico' },
    { key: 'laboratorio', label: 'Laboratorio' },
    { key: 'hemoterapia', label: 'Hemoterapia' },
    { key: 'radiofisica', label: 'Radiofísica' },
    { key: 'hemodialisis', label: 'Hemodiálisis' },
  ],

  registros: [
    { key: 'reg_his_cli', label: 'Registro de Historias Clínicas', type: 'text' },
    { key: 'tipo', label: 'Tipo', type: 'text' },
    { key: 'rev_hc', label: 'Revisión de HC', type: 'boolean' },
    { key: 'comp', label: 'Completas', type: 'boolean' },
    { key: 'incomp', label: 'Incompletas', type: 'boolean' },
    { key: 'ri_mc', label: 'Reglamento Interno / Manual de Procedimientos', type: 'text' },
    { key: 'ad_priv', label: 'Aditamento privado / Denominación correcta', type: 'text' },
  ],

  datos_generales: [
    { key: 'cant_pl', label: 'Cantidad de Plantas', type: 'number' },
    { key: 'fec_ult_ins', label: 'Fecha última inspección del conservador', type: 'date' },
    { key: 'pos_mon_asc', label: 'Posee Montacamillas / Ascensores', type: 'text' },
    { key: 'banio_dis', label: 'Baño para público discapacitado mixtos', type: 'text' },
    { key: 'lib_ing', label: 'Libre ingreso, circulación y giro de camillas', type: 'text' },
    { key: 'luc_aut', label: 'Luces autónomas de emergencia', type: 'text' },
    { key: 'equi_ele', label: 'Equipo Electrógeno', type: 'text' },
    { key: 'pl_ev_vi', label: 'Plan Evacuación vigente', type: 'text' },
    { key: 'ex_inc', label: 'Extinguidores de Incendios', type: 'text' },
    { key: 'sal_eme', label: 'Salida de Emergencia', type: 'text' },
    { key: 'hab_bomb', label: 'Habilitación Bomberos', type: 'text' },
    { key: 'sil_rue', label: 'Silla de Ruedas', type: 'text' },
    { key: 'to_cam_ort', label: 'Todas las camas tipo Ortopedia', type: 'text' },
    { key: 'pos_pla', label: 'Posee planos inclinados', type: 'text' },
  ],

  sector_internacion: [
    { key: 'cond_edil', label: 'Condiciones Edilicias', type: 'text' },
    { key: 'are_res', label: 'Área de Residuos', type: 'text' },
    { key: 'h1_inc', label: 'Habitación 1 cama — Baño incluido', type: 'number' },
    { key: 'h1_con', label: 'Habitación 1 cama — Baño contiguo', type: 'number' },
    { key: 'h2_inc', label: 'Habitación 2 camas — Baño incluido', type: 'number' },
    { key: 'h2_con', label: 'Habitación 2 camas — Baño contiguo', type: 'number' },
    { key: 'h3_inc', label: 'Habitación 3 camas — Baño incluido', type: 'number' },
    { key: 'h3_con', label: 'Habitación 3 camas — Baño contiguo', type: 'number' },
    { key: 'otr', label: 'Otras habitaciones', type: 'number' },
    { key: 'tot_habit', label: 'Total de Habitaciones', type: 'number' },
    { key: 'cam_ort_nro', label: 'Camas ortopédicas N°', type: 'number' },
    { key: 'llam_banio', label: 'Llamador en los baños', type: 'text' },
    { key: 'loc_dep', label: 'Local dimensiones apropiadas depósito', type: 'text' },
    { key: 'per_vent', label: 'Perfectamente ventilado', type: 'text' },
    { key: 'ubi_are_ser', label: 'Ubicado en área de servicio', type: 'text' },
    { key: 'ilu_nat', label: 'Iluminación natural', type: 'text' },
    { key: 'vent_natu', label: 'Ventilación natural', type: 'text' },
    { key: 'cli_fri_cal', label: 'Climatización frío-calor', type: 'text' },
    { key: 'ilu_art_cen', label: 'Iluminación artificial central', type: 'text' },
    { key: 'ilu_art_ind', label: 'Iluminación artificial individual', type: 'text' },
    { key: 'llam_ind', label: 'Llamador individual', type: 'text' },
    { key: 'priv', label: 'Privacidad', type: 'text' },
  ],

  enfermeria: [
    { key: 'loc_prop', label: 'Posee local propio', type: 'text' },
    { key: 'bot_urg', label: 'Botiquín de urgencia', type: 'text' },
    { key: 'tub_oxi', label: 'Tubo de oxígeno', type: 'text' },
    { key: 'mes_pil', label: 'Mesada con Pileta', type: 'text' },
    { key: 'arm_vit', label: 'Armario o vitrina', type: 'text' },
    { key: 'ar_suc', label: 'Área sucia', type: 'text' },
    { key: 'ar_lim', label: 'Área limpia', type: 'text' },
  ],

  area_quirurgica: [
    { key: 'cant_quir', label: 'Cantidad de quirófanos', type: 'number' },
    { key: 'c_n_par', label: 'Cumple Normas Paredes', type: 'text' },
    { key: 'c_n_pis', label: 'Cumple Normas Pisos', type: 'text' },
    { key: 'c_n_tec', label: 'Cumple Normas Techos', type: 'text' },
    { key: 'cir_exc', label: 'Circulación exclusiva', type: 'text' },
    { key: 'in_tr_pac', label: 'Ingreso y transferencia de pacientes', type: 'text' },
    { key: 'ves_prop', label: 'Vestuario propio', type: 'text' },
    { key: 'po_ve_pa_fi', label: 'Posee ventana con paño fijo', type: 'text' },
    { key: 's_suc', label: 'Sector sucio', type: 'text' },
    { key: 'c_dir_quir', label: 'Comunicación directa a quirófano', type: 'text' },
    { key: 'dep_mat_es', label: 'Depósito material estéril', type: 'text' },
    { key: 'il_adec', label: 'Iluminación adecuada', type: 'text' },
    { key: 'cli_fio_calor', label: 'Climatización frío-calor', type: 'text' },
    { key: 'ac_comp_pre', label: 'Acorde a la complejidad prestacional', type: 'text' },
    { key: 'card', label: 'Cardiodesfibrilador', type: 'text' },
    { key: 'bot_anes', label: 'Botiquín básico anestesia', type: 'text' },
    { key: 'bot_rea', label: 'Botiquín básico reanimación CV', type: 'text' },
    { key: 'larin', label: 'Laringoscopía', type: 'text' },
    { key: 'tub_endo', label: 'Tubos endotraqueales', type: 'text' },
    { key: 'ca_traq', label: 'Caja de traqueotomía', type: 'text' },
    { key: 'mon_multi', label: 'Monitor multiparamétrico', type: 'text' },
    { key: 'res_auto', label: 'Respirador automático', type: 'text' },
    { key: 'me_mayo', label: 'Mesa de cirugía Tipo Mayo o similar', type: 'text' },
    { key: 'elec', label: 'Electrobisturí', type: 'text' },
    { key: 'ins_esp', label: 'Instrumental s/especialidades', type: 'text' },
  ],

  obstetricia: [
    { key: 'sal_par', label: 'Posee sala de parto', type: 'text' },
    { key: 'sal_rec', label: 'Posee sala de recuperación', type: 'text' },
    { key: 'rec_recnac', label: 'Posee recepción de recién nacido', type: 'text' },
    { key: 'cant_sal_par', label: 'Cantidad de salas de partos', type: 'number' },
    { key: 'c_normas_par', label: 'Cumple normas paredes', type: 'text' },
    { key: 'c_normas_pis', label: 'Cumple normas pisos', type: 'text' },
    { key: 'c_normas_tec', label: 'Cumple normas techos', type: 'text' },
    { key: 'circ_excl', label: 'Circulación exclusiva', type: 'text' },
    { key: 'ie_pac', label: 'Ingreso y transferencia de pacientes', type: 'text' },
    { key: 'cl_frio_calor', label: 'Climatización frío-calor', type: 'text' },
    { key: 'sal_recep', label: 'Sala de Recepción', type: 'text' },
    { key: '1c3_par', label: '1 c/3 sala de partos', type: 'text' },
    { key: '6e', label: '6 enchufes', type: 'text' },
    { key: 've_pro', label: 'Vestuario propio', type: 'text' },
    { key: 'lav_pre', label: 'Lavabos previo filtro de vestuarios', type: 'text' },
    { key: 's_sucio', label: 'Sector sucio', type: 'text' },
    { key: 'ccd_sp', label: 'Comunicación directa a SP', type: 'text' },
    { key: 's_limp', label: 'Sector Limpio', type: 'text' },
    { key: 'cc_dir_sp', label: 'Comunicación directa de SP', type: 'text' },
    { key: 'hpre_are', label: 'Habitación preparto en el área', type: 'text' },
    { key: 'hpre_inte', label: 'Habitación preparto en el internado', type: 'text' },
    { key: 'il_adecuada', label: 'Iluminación adecuada', type: 'text' },
    { key: 'pro_des_tie', label: 'Protección con descarga a tierra', type: 'text' },
    { key: '1cp_2rn', label: '1 caja de paro c/equipamiento para 2 RN simultáneos', type: 'text' },
    { key: '1p_c2ox', label: '1 panel c/2 oxígenos 1 aspiración 1 aire comprimido', type: 'text' },
    { key: 'm_rec_rn', label: 'Mesa de recepción acolchada c/calorificación p/2 RN', type: 'text' },
  ],

  laboratorio: [
    { key: 'hab_cob', label: 'Habilitación por COBICO', type: 'text' },
    { key: 'son', label: 'Interno / Externo', type: 'text' },
    { key: 'es', label: 'Propio / Contratado', type: 'text' },
  ],

  guardia: [
    { key: 'nro_camas_guardia', label: 'N° de Camas', type: 'number' },
    { key: 'c_e_guardia', label: 'Coincide con edificación', type: 'text' },
    { key: 'p_guardia', label: 'Planos', type: 'text' },
    { key: 'medicos_guardia', label: 'Médicos (N°)', type: 'number' },
    { key: 'enfermeras_guardia', label: 'Enfermeras (N°)', type: 'number' },
    { key: 'cardi_guardia', label: 'Cardiodesfibrilador', type: 'text' },
    { key: 'elec_guardia', label: 'Electrocardiógrafo', type: 'text' },
    { key: 'm_m_guardia', label: 'Oxímetro de pulso / monitor multiparamétrico', type: 'text' },
    { key: 'e_p_n_guardia', label: 'Equipo para nebulizaciones', type: 'text' },
    { key: 'c_d_p_guardia', label: 'Carro de paro completo', type: 'text' },
  ],

  uco: [
    { key: 'nro_camas_uco', label: 'N° de Camas', type: 'number' },
    { key: 'planos_uco', label: 'Planos', type: 'text' },
    { key: 'c_c_e_uco', label: 'Coincide con edificación', type: 'text' },
    { key: 's_v_uco', label: 'Signos vitales', type: 'text' },
    { key: 'b_d', label: 'Balance diario', type: 'text' },
    { key: 'v_i_e_uco', label: 'Volúmenes de ingresos y egresos', type: 'text' },
    { key: 'm_uco', label: 'Medicación', type: 'text' },
    { key: 'u_z_c_s_uco', label: 'Unidad en zona de circulación semirrestringida', type: 'text' },
    { key: 's_i_p_l_uco', label: 'Sala de internación c/pileta lavamanos', type: 'text' },
    { key: 'o_d_e_uco', label: 'Office de enfermería', type: 'text' },
    { key: 'mon_uco', label: 'Monitores', type: 'text' },
    { key: 'l_r_m_u_uco', label: 'Local de ropa y material usado', type: 'text' },
    { key: 'a_l_uco', label: 'Área lavachatas', type: 'text' },
    { key: 'd_c_a_uco', label: 'Depósito de camillas y aparatología', type: 'text' },
    { key: 's_m_uco', label: 'Sala de médicos', type: 'text' },
    { key: 'g_e_uco', label: 'Grupo electrógeno', type: 'text' },
    { key: 'a_c_d_uco', label: 'Acceso directo y exclusivo', type: 'text' },
    { key: 'f_c_c_uco', label: 'Fácil comunicación c/cirugía', type: 'text' },
    { key: 'pr_uco', label: 'Privacidad', type: 'text' },
    { key: 'c_o_a_uco', label: 'Camas ortopédicas o articuladas', type: 'text' },
    { key: 'd_c_uco', label: 'Doble comando', type: 'text' },
    { key: 'ro_uco', label: 'Rodantes', type: 'text' },
    { key: 'p_a_r_uco', label: 'Plano apoyo rígido', type: 'text' },
    { key: 'a_p_uco', label: 'Acceso desde 4 posiciones', type: 'text' },
    { key: 'v_p_d_c_uco', label: 'Visión panorámica directa a todas las camas', type: 'text' },
    { key: 'l_i_m_uco', label: 'Local de Instrumental y material estéril', type: 'text' },
    { key: 'l_c_c_uco', label: 'Local cerrado c/1 cama para aislamiento', type: 'text' },
    { key: 'e_v_h_uco', label: 'Evoluciones diarias en Historia Clínica', type: 'text' },
    { key: 'v_v_p_uco', label: 'Vestuario para visitas c/pileta lavamanos', type: 'text' },
    { key: 'h_c_uco', label: 'Habitación c/baño propio para médico de Guardia', type: 'text' },
    { key: 'c_l_uco', label: 'Comparte algún local UCI / UCO', type: 'text' },
    { key: 'p_u_uco', label: 'Posee otras Unidades de UCI / UCO', type: 'text' },
    { key: 'd_t_e_uco', label: 'Diez tomas de electricidad por cama', type: 'text' },
    { key: 's_i_uco', label: 'Sistema de Iluminación de Emergencia', type: 'text' },
    { key: 'herm_uco', label: 'Hermeticidad', type: 'text' },
    { key: 's_t_s_uco', label: 'Superficie total sala internación', type: 'text' },
    { key: 'i_n_uco', label: 'Iluminación natural', type: 'text' },
    { key: 'i_a_uco', label: 'Iluminación artificial central', type: 'text' },
    { key: 'i_i_uco', label: 'Iluminación Individual', type: 'text' },
    { key: 'v_a_e_p_uco', label: 'Ventanas al exterior De paño fijo', type: 'text' },
    { key: 'e_asp_uco', label: 'Equipo de aspiración', type: 'text' },
    { key: 'res_mec_vol_uco', label: 'Respirador mecánico volumétrico', type: 'text' },
    { key: 'e_des_sin_uco', label: 'Equipo de desfibrilación y sincronizador', type: 'text' },
    { key: 'bo_inf_uco', label: 'Bomba de infusión', type: 'text' },
    { key: 'car1_uco', label: 'Carro de urgencias', type: 'text' },
    { key: 'lari_uco', label: 'Laringoscopios', type: 'text' },
    { key: 'masc_uco', label: 'Máscara', type: 'text' },
    { key: 'res_ambu_uco', label: 'Resucitador tipo AMBU', type: 'text' },
    { key: 'tens_uco', label: 'Tensiómetro', type: 'text' },
    { key: 'nebu_uco', label: 'Nebulizador', type: 'text' },
    { key: 'el_in_endo_uco', label: 'Elementos para intubación endotraqueal', type: 'text' },
    { key: 'sis_por_as_uco', label: 'Sistema portátil de aspiración p/drenaje', type: 'text' },
    { key: 'cat_naso_uco', label: 'Equipos para cateterización nasogástrica', type: 'text' },
    { key: 'e_pun_raq_uco', label: 'Equipos para punción raquídea', type: 'text' },
    { key: 'e_pun_abd_uco', label: 'Equipo para punción abdominal', type: 'text' },
    { key: 'car_par_uco', label: 'Carro de paro', type: 'text' },
    { key: 'ox_pul_por_uco', label: 'Oxímetro de pulso portátil', type: 'text' },
    { key: 'elec_uco', label: 'Electrocardiógrafo', type: 'text' },
    { key: 'mar2cat_uco', label: 'Marcapaso transitorio con 2 catéteres', type: 'text' },
    { key: 'eqrx_uco', label: 'Equipo portátil de Rx 100 Ma/100 Kv', type: 'text' },
    { key: 'el_traq_uco', label: 'Elementos para traqueotomía', type: 'text' },
    { key: 'bol_uco', label: 'Bolsa', type: 'text' },
    { key: 'ada_uco', label: 'Adaptador', type: 'text' },
    { key: 'car_cur_uco', label: 'Carro de curación', type: 'text' },
    { key: 'ins_exa_uco', label: 'Instrumental de examen', type: 'text' },
    { key: 'il_ind_uco', label: 'Iluminación individual', type: 'text' },
    { key: 'sis_tor_uco', label: 'Sistema de aspiración torácica', type: 'text' },
    { key: 'cat_ves_uco', label: 'Equipos para cateterización vesical', type: 'text' },
    { key: 'cat_cat_ven_uco', label: 'Equipos para cateterización venosa', type: 'text' },
    { key: 'e_pun_tor_uco', label: 'Equipo para punción torácica', type: 'text' },
    { key: 'bot24_uco', label: 'Botiquín c/medicamentos para urgencias de 24 hs', type: 'text' },
  ],

  uti: [
    { key: 'nro_camas_uti', label: 'N° de Camas', type: 'number' },
    { key: 'planos_uti', label: 'Planos', type: 'text' },
    { key: 'c_c_e_uti', label: 'Coincide con edificación', type: 'text' },
    { key: 'martrans_nouco_uti', label: 'Marcapaso transitorio (si no tiene UCO)', type: 'text' },
    { key: 'suptot_uti', label: 'Superficie total sala internación', type: 'number' },
  ],

  utin: [
    { key: 'of_enf_m_utin', label: 'Office de enfermería con monitores', type: 'text' },
    { key: 'ar_de_rl_utin', label: 'Área de depósito ropa limpia', type: 'text' },
    { key: 'pil_mat', label: 'Pileta para material', type: 'text' },
    { key: 'dep_utin', label: 'Depósito para incubadora/cuna/aparatos', type: 'text' },
    { key: 'cam_a_codo_utin', label: 'Camillas accionadas a codo', type: 'text' },
    { key: 'loc_for_lac_utin', label: 'Local de fórmulas lácteas', type: 'text' },
    { key: 'ex_air_fil_utin', label: 'Extractor de aire con filtro', type: 'text' },
    { key: 'sis_cal_ref_utin', label: 'Sistema calefacción refrigeración', type: 'text' },
    { key: 'tom_ele_cam_utin', label: 'Ocho tomas de electricidad por cama', type: 'text' },
    { key: 'in_cu_utin', label: 'Incubadoras', type: 'text' },
    { key: 'air_com_utin', label: 'Aire comprimido', type: 'text' },
    { key: 'aspi_utin', label: 'Aspiración', type: 'text' },
    { key: 'uni_ais_utin', label: 'Unidades de aislamiento', type: 'text' },
    { key: 'con_mon_utin', label: 'Consola de monitoreo', type: 'text' },
    { key: 'cunas_utin', label: 'Cunas', type: 'text' },
    { key: 'mon_card_utin', label: 'Monitores cardiorrespiratorios', type: 'text' },
    { key: 'bom_per_jer_utin', label: 'Bomba de perfusión de jeringa', type: 'text' },
    { key: 'bom_per_con_utin', label: 'Bomba de perfusión continua', type: 'text' },
    { key: 'spo_lumi_utin', label: 'Spot de luminoterapia', type: 'text' },
    { key: 'oxi_pul_utin', label: 'Oxímetro de pulso', type: 'text' },
  ],

  hemodinamia: [
    { key: 'nro_camas_hemo', label: 'N° de Camas', type: 'number' },
    { key: 'planos_hemo', label: 'Planos', type: 'text' },
    { key: 'coed_hemo', label: 'Coincide con edificación', type: 'text' },
    { key: 'jefserv_hemo', label: 'Jefe de Servicio', type: 'text' },
    { key: 'med_hemo', label: 'Médico', type: 'text' },
    { key: 'enfprof_hemo', label: 'Enfermero profesional', type: 'text' },
    { key: 'meradi_hemo', label: 'Médico radiólogo', type: 'text' },
    { key: 'meanes_hemo', label: 'Médico anestesista', type: 'text' },
    { key: 'arcc_hemo', label: 'Arco en C o paralelogramo deformable', type: 'text' },
    { key: 'mecate_hemo', label: 'Mesa de Cateterismo', type: 'text' },
    { key: 'intima_hemo', label: 'Intensificador de imágenes', type: 'text' },
    { key: 'tubrayx_hemo', label: 'Tubo de rayos X', type: 'text' },
    { key: 'genpul_hemo', label: 'Generadores pulsados por tetrodos', type: 'text' },
    { key: 'elec_hemo', label: 'Electrocardiógrafo', type: 'text' },
    { key: 'oxipul_hemo', label: 'Oxímetro de pulso', type: 'text' },
    { key: 'cardio_hemo', label: 'Cardiodesfibrilador', type: 'text' },
    { key: 'iny_con_hemo', label: 'Inyectora de contraste', type: 'text' },
    { key: 'mondig_hemo', label: 'Monitor digital', type: 'text' },
  ],

  hospital_dia: [
    { key: 'nro_camas_hdd', label: 'N° de Camas', type: 'number' },
    { key: 'plan_hdd', label: 'Planos', type: 'text' },
    { key: 'coed_hdd', label: 'Coincide con edificación', type: 'text' },
    { key: 'jefserv_hdd', label: 'Jefe de Servicio', type: 'text' },
    { key: 'medonc_hdd', label: 'Médico oncológico', type: 'text' },
    { key: 'trsoc_hdd', label: 'Trabajador social', type: 'text' },
    { key: 'enf_hdd', label: 'Enfermeros', type: 'text' },
    { key: 'kine_hdd', label: 'Kinesiólogo', type: 'text' },
    { key: 'psico_hdd', label: 'Psicólogo', type: 'text' },
    { key: 'nutri_hdd', label: 'Nutricionista', type: 'text' },
    { key: 'sillonc_hdd', label: 'Sillón de Oncología', type: 'text' },
    { key: 'colanti_hdd', label: 'Colchón antiescaras', type: 'text' },
    { key: 'bominf_hdd', label: 'Bomba de infusión', type: 'text' },
    { key: 'caflula_hdd', label: 'Campana de flujo laminar', type: 'text' },
    { key: 'bala_hdd', label: 'Balanza de uso clínico con cartabón', type: 'text' },
    { key: 'equimon_hdd', label: 'Equipo de monitoreo presión arterial', type: 'text' },
    { key: 'oxipul_hdd', label: 'Oxímetro de pulso', type: 'text' },
  ],

  quirurgicos_inscripcion: [
    { key: 'nro_camas_quir', label: 'N° Total de Camas', type: 'number' },
    { key: 'plan_quir', label: 'Planos', type: 'text' },
    { key: 'tisoc_quir', label: 'Tipo de Sociedad', type: 'text' },
    { key: 'adpriv_quir', label: 'Aditamiento Privado', type: 'text' },
    { key: 'dirlis_quir', label: 'Director y Listado de Profesionales', type: 'text' },
    { key: 'noprac_quir', label: 'Nómina de prácticas ambulatorias', type: 'text' },
    { key: 'conest_quir', label: 'Convenio con establecimientos polivalentes', type: 'text' },
    { key: 'consereme_quir', label: 'Convenio con Servicio de Emergencias', type: 'text' },
    { key: 'consertras_quir', label: 'Convenio con Traslado de Residuos Patógenos', type: 'text' },
    { key: 'orgfunc_quir', label: 'Organigrama funcional', type: 'text' },
    { key: 'apa_quir', label: 'Aparatología', type: 'text' },
    { key: 'coined_quir', label: 'Coincide con edificación', type: 'text' },
    { key: 'noproc_quir', label: 'Nómina de procedimientos', type: 'text' },
    { key: 'conlab_quir', label: 'Convenio con Laboratorio', type: 'text' },
  ],

  quirurgicos_direccion_funcionamiento: [
    { key: 'regcnftra_quir', label: 'Registro de Enfermedades Transmisibles', type: 'text' },
    { key: 'regint_quir', label: 'Reglamento Interno', type: 'text' },
    { key: 'nropla_quir', label: 'Número de Plantas', type: 'number' },
    { key: 'ascmon_quir', label: 'Ascensor / Montacamillas', type: 'text' },
    { key: 'disdif_quir', label: 'Disyuntor diferencial', type: 'text' },
    { key: 'evainc_quir', label: 'Plan de evacuación de Incendios', type: 'text' },
    { key: 'reghisclin_quir', label: 'Registro de Historias Clínicas Completo', type: 'text' },
    { key: 'ext_quir', label: 'Extinguidores', type: 'text' },
    { key: 'habbomb_quir', label: 'Habilitación de Bomberos', type: 'text' },
    { key: 'plincl_quir', label: 'Plano inclinado', type: 'text' },
    { key: 'saleme_quir', label: 'Salida de Emergencia', type: 'text' },
    { key: 'arpatho_quir', label: 'Área para residuos patógenos', type: 'text' },
    { key: 'nrocons_quir', label: 'N° de Consultorios', type: 'number' },
    { key: 'il_quir', label: 'Iluminación', type: 'text' },
    { key: 'vent_quir', label: 'Ventilación', type: 'text' },
    { key: 'pri_quir', label: 'Privacidad', type: 'text' },
    { key: 'lav_quir', label: 'Lavabos', type: 'text' },
    { key: 'aresp_quir', label: 'Área de Espera', type: 'text' },
    { key: 'sup_quir', label: 'Superficie', type: 'number' },
    { key: 'nroasi_quir', label: 'N° de asientos', type: 'number' },
    { key: 'banpub_quir', label: 'Baño para público / personal', type: 'text' },
  ],

  quirurgicos_enfermeria: [
    { key: 'locprop_quir', label: 'Local propio', type: 'text' },
    { key: 'tubox_quir', label: 'Tubo oxígeno', type: 'text' },
    { key: 'este_quir', label: 'Estetoscopio', type: 'text' },
    { key: 'cacur_quir', label: 'Caja de Curaciones', type: 'text' },
    { key: 'arproc_quir', label: 'Área procesamiento Limpios y Usados', type: 'text' },
    { key: 'arm_quir', label: 'Armario o Vitrinas', type: 'text' },
    { key: 'boturg_quir', label: 'Botiquín urgencia', type: 'text' },
    { key: 'mepil_quir', label: 'Mesada con pileta', type: 'text' },
    { key: 'est_quir', label: 'Estantes', type: 'text' },
    { key: 'sirue_quir', label: 'Silla de ruedas', type: 'text' },
    { key: 'hel_quir', label: 'Heladera', type: 'text' },
    { key: 'tensi_quir', label: 'Tensiómetro', type: 'text' },
  ],

  quirurgicos_area_internacion: [
    { key: 'habrec_quir', label: 'Habitación de recuperación y/o prácticas clínicas', type: 'text' },
    { key: 'boc_quir', label: 'Boca de oxígeno', type: 'text' },
    { key: 'poban_quir', label: 'Posee baño privado o compartido', type: 'text' },
    { key: 'pocamort_quir', label: 'Posee cama ortopédica', type: 'text' },
    { key: 'libgir_quir', label: 'Libre giro de camillas', type: 'text' },
    { key: 'can_quir', label: 'Cantidad', type: 'number' },
    { key: 'lav_quiru', label: 'Lavabos', type: 'text' },
    { key: 'priva_quir', label: 'Privacidad', type: 'text' },
    { key: 'llamind_quir', label: 'Llamador individual', type: 'text' },
    { key: 'climat_quir', label: 'Climatización', type: 'text' },
    { key: 'tuoxig_quir', label: 'Tubo de Oxígeno', type: 'text' },
    { key: 'bovac_quir', label: 'Boca de Vacío', type: 'text' },
    { key: 'habped_quir', label: 'Habitación Pediátrica Diferenciada', type: 'text' },
    { key: 'habpacesp_quir', label: 'Habitación Pacientes Especiales', type: 'text' },
    { key: 'nro_quirofnos_quir', label: 'N° de quirófanos', type: 'number' },
    { key: 'obs1_quir', label: 'Observaciones quirófano', type: 'text' },
    { key: 'quir_dimen', label: 'Quirófano: dimensiones', type: 'text' },
    { key: 'pisos_quir', label: 'Pisos', type: 'text' },
    { key: 'paredes_quir', label: 'Paredes', type: 'text' },
    { key: 'vest_quir', label: 'Vestuarios', type: 'text' },
    { key: 'ingtran_quir', label: 'Ingreso y Transferencia de Pacientes', type: 'text' },
    { key: 'comdir_quir', label: 'Comunicación directa a Quirófano', type: 'text' },
    { key: 'obs2_quir', label: 'Observaciones sala recuperación', type: 'text' },
    { key: 'techos_quir', label: 'Techo', type: 'text' },
    { key: 'salrecu_quir', label: 'Sala de Recuperación', type: 'text' },
    { key: 'ilum_quir', label: 'Iluminación', type: 'text' },
    { key: 'climati_quir', label: 'Climatización', type: 'text' },
    { key: 'lavprev_quir', label: 'Lavabos filtro previo por Vestuario', type: 'text' },
    { key: 'salpre_quir', label: 'Sala de Pre-Anestesia', type: 'text' },
    { key: 'arapoy_quir', label: 'Área de Apoyo para material sucio', type: 'text' },
  ],

  quirurgicos_equipamiento: [
    { key: 'botbas_quir', label: 'Botiquín básico c/anestésicos y p/reanimación CV', type: 'text' },
    { key: 'laritub_quir', label: 'Laringoscopio y Tubos Endotraqueales', type: 'text' },
    { key: 'cajtraq_quir', label: 'Caja traqueostomía', type: 'text' },
    { key: 'mon_quir', label: 'Monitor', type: 'text' },
    { key: 'electro_quir', label: 'Electrobisturí', type: 'text' },
    { key: 'asauto_quir', label: 'Aspirador automático', type: 'text' },
    { key: 'oxipul_quir', label: 'Oxímetro de pulso', type: 'text' },
    { key: 'lamcial_quir', label: 'Lámpara cialítica', type: 'text' },
    { key: 'memasi_quir', label: 'Mesa cirugía Mayor o similar', type: 'text' },
    { key: 'instru_quir', label: 'Instrumental', type: 'text' },
    { key: 'fuenepro_quir', label: 'Fuente energía propia', type: 'text' },
    { key: 'gruele_quir', label: 'Grupo electrógeno', type: 'text' },
    { key: 'resauto_quir', label: 'Respirador automático', type: 'text' },
    { key: 'tuboxi_quir', label: 'Tubo de Oxígeno', type: 'text' },
    { key: 'cardi_quir', label: 'Cardiodesfibrilador', type: 'text' },
  ],

  quirurgicos_esterilizacion: [
    { key: 'est_quir', label: 'Estufa', type: 'text' },
    { key: 'conempauto_quir', label: 'Contrato con empresa autorizada', type: 'text' },
    { key: 'autocl_quir', label: 'Autoclave', type: 'text' },
    { key: 'matdes_quir', label: 'Material descartable', type: 'text' },
  ],

  hemodialisis_direccion_funcionamiento: [
    { key: 'indiaind_hemodi', label: 'Unidad de Diálisis Independiente', type: 'text' },
    { key: 'repsico_hemodi', label: 'Registro de Psicofármacos Actualizado', type: 'text' },
    { key: 'reenftra_hemodi', label: 'Registro de Enfermedades Transmisibles', type: 'text' },
    { key: 'regint_hemodi', label: 'Reglamento Interno', type: 'text' },
    { key: 'plevac_hemodi', label: 'Plan de Evacuación', type: 'text' },
    { key: 'habbomb_hemodi', label: 'Habilitación de Bomberos', type: 'text' },
    { key: 'nobio_hemodi', label: 'Normas bioseguridad expuestas', type: 'text' },
    { key: 'nopromed_hemodi', label: 'Normas de Procedimientos para Médicos', type: 'text' },
    { key: 'noproenf_hemodi', label: 'Normas de Procedimientos para Enfermeras', type: 'text' },
    { key: 'nroins_hemodi', label: 'Nro de Inscripción INCUCAI y/o ECODAI', type: 'text' },
    { key: 'insc_hemodi', label: 'Carpetas de Inscripción INCUCAI y/o ECODAI', type: 'text' },
    { key: 'conv_int_hemodi', label: 'Convenio de Internación', type: 'text' },
    { key: 'regclincomp_hemodi', label: 'Registro Historia Clínica completa', type: 'text' },
    { key: 'cant_pues_hemo', label: 'Cantidad de puestos', type: 'number' },
  ],

  hemodialisis_analisis_agua: [
    { key: 'fisquim_hemodi', label: 'Análisis Fisicoquímico', type: 'text' },
    { key: 'ulfisqui_hemodi', label: 'Fecha último análisis fisicoquímico', type: 'date' },
    { key: 'bacterio_hemodi', label: 'Análisis Bacteriológico', type: 'text' },
    { key: 'ulbacte_hemodi', label: 'Fecha último análisis bacteriológico', type: 'date' },
  ],

  hemodialisis_serologia: [
    { key: 'hiv_hemodi', label: 'HIV (Personal)', type: 'text' },
    { key: 'hepb_hemodi', label: 'Hepatitis B (Personal)', type: 'text' },
    { key: 'hepc_hemodi', label: 'Hepatitis C (Personal)', type: 'text' },
    { key: 'obs_hemodi', label: 'Observaciones', type: 'text' },
    { key: 'perenf_hemodi', label: 'Planillas de Personal Enfermería', type: 'text' },
    { key: 'hivpa_hemodi', label: 'HIV (Pacientes)', type: 'text' },
    { key: 'hb_hemodi', label: 'Hepatitis B (Pacientes)', type: 'text' },
    { key: 'hc_hemodi', label: 'Hepatitis C (Pacientes)', type: 'text' },
    { key: 'libreu_hemodi', label: 'Libro de Reusos', type: 'text' },
    { key: 'cmaxreus_hemodi', label: 'Cantidad máxima de reusos', type: 'number' },
  ],

  hemodialisis_serologia_personal: [
    { key: 'hiv_hemodi', label: 'VIH', type: 'text' },
    { key: 'hepb_hemodi', label: 'Hepatitis B', type: 'text' },
    { key: 'hepc_hemodi', label: 'Hepatitis C', type: 'text' },
    { key: 'fecha_serologia_personal', label: 'Fecha último control serológico', type: 'date' },
  ],

  hemodialisis_serologia_pacientes: [
    { key: 'hivpa_hemodi', label: 'VIH', type: 'text' },
    { key: 'hb_hemodi', label: 'Hepatitis B', type: 'text' },
    { key: 'hc_hemodi', label: 'Hepatitis C', type: 'text' },
    { key: 'fecha_serologia_pacientes', label: 'Fecha último control serológico', type: 'date' },
  ],

  estetica_inscripcion: [
    { key: 'nro_cam_rec', label: 'N° Total de Camas de recuperación', type: 'number' },
    { key: 'ti_soc', label: 'Tipo de Sociedad', type: 'text' },
    { key: 'ad_priv', label: 'Aditamento Privado', type: 'text' },
    { key: 'pla', label: 'Planos', type: 'text' },
    { key: 'cer_au_lab', label: 'Certificado autorización Laboratorio', type: 'text' },
    { key: 'cer_au_ind', label: 'Certificado autorización Individual', type: 'text' },
    { key: 'cer_hab_hemo', label: 'Certificado Habilitación Hemoterapia', type: 'text' },
    { key: 'nom_pra_amb', label: 'Nómina de prácticas ambulatorias', type: 'text' },
    { key: 'conv_serv', label: 'Convenio Servicio de Emergencias / Unidades Móviles', type: 'text' },
    { key: 'dir_lis_pro', label: 'Director y Listado de Profesionales', type: 'text' },
    { key: 'org_func', label: 'Organigrama funcional', type: 'text' },
    { key: 'apar', label: 'Aparatología', type: 'text' },
    { key: 'cer_au_dia_ima', label: 'Certificado autorización Diagnóstico x Imágenes', type: 'text' },
    { key: 'hab_in_eq', label: 'Certificado Habilitación de la Instalación del Equipo', type: 'text' },
    { key: 'sel_ley', label: 'Sellado de Ley', type: 'text' },
    { key: 'con_poliv', label: 'Convenio con establecimientos polivalentes', type: 'text' },
  ],

  estetica_direccion_funcionamiento: [
    { key: 'reg_enf_trans', label: 'Registro de Enfermedades Transmisibles', type: 'text' },
    { key: 'reg_int', label: 'Reglamento Interno', type: 'text' },
    { key: 'reg_psico', label: 'Registro de Psicofármacos', type: 'text' },
    { key: 'reg_his_cli_comp', label: 'Registro de Historias Clínicas Completo', type: 'text' },
    { key: 'minu', label: 'Municipalidad', type: 'text' },
    { key: 'prov', label: 'Provincia', type: 'text' },
    { key: 'gas', label: 'Gas', type: 'text' },
    { key: 'agua', label: 'Agua', type: 'text' },
    { key: 'luz', label: 'Luz', type: 'text' },
    { key: 'otr', label: 'Otras', type: 'text' },
    { key: 'nro_plantas', label: 'Número de Plantas', type: 'number' },
    { key: 'asc_mon', label: 'Ascensor / Montacamillas', type: 'text' },
    { key: 'pla_inc', label: 'Plano inclinado', type: 'text' },
    { key: 'sal_emerg', label: 'Salida de Emergencia', type: 'text' },
    { key: 'pl_eva_inc', label: 'Plan de evacuación de Incendios', type: 'text' },
  ],

  estetica_consultorios: [
    { key: 'nro', label: 'Número de consultorios', type: 'number' },
    { key: 'vent', label: 'Ventilación', type: 'text' },
    { key: 'lavabos', label: 'Lavabos', type: 'text' },
    { key: 'sup', label: 'Superficie', type: 'number' },
    { key: 'ba_disc', label: 'Baño para discapacitados', type: 'text' },
    { key: 'techo', label: 'Techo', type: 'text' },
    { key: 'paredes', label: 'Paredes', type: 'text' },
    { key: 'con_emp_aut', label: 'Contrato con empresa autorizada', type: 'text' },
    { key: 'mi_ad_pres', label: 'Microscopio adecuado a las prestaciones', type: 'text' },
    { key: 'ba_term', label: 'Baño termostatizado', type: 'text' },
    { key: 'es_cul', label: 'Estufa de cultivo', type: 'text' },
    { key: 'ilum', label: 'Iluminación', type: 'text' },
    { key: 'priva', label: 'Privacidad', type: 'text' },
    { key: 'ar_es', label: 'Área de Espera', type: 'text' },
    { key: 'nro_asientos', label: 'N° de asientos', type: 'number' },
    { key: 'cons_c_ba', label: 'Consultorio c/baño incluido', type: 'text' },
    { key: 'pisos', label: 'Pisos', type: 'text' },
    { key: 'estu', label: 'Estufa', type: 'text' },
    { key: 'ma_des', label: 'Material descartable', type: 'text' },
    { key: 'centrif', label: 'Centrífuga', type: 'text' },
    { key: 'fotoco', label: 'Fotocolorímetro', type: 'text' },
    { key: 'es_esf', label: 'Estufa de esterilización', type: 'text' },
  ],

  opticas_local: [
    { key: 'art11', label: 'Óptico regente presente (Art. 11)', type: 'text' },
    { key: 'art7', label: 'Presentó Planos Art. 7', type: 'text' },
    { key: 'librec', label: 'Libro Recetario / Fichero / Respaldo informático', type: 'text' },
    { key: 'ilad_loc', label: 'Iluminación adecuada Art. 13 a)', type: 'text' },
    { key: 'interpu', label: 'Interpupilómetro Art. 13 a)', type: 'text' },
    { key: 'car_pru', label: 'Cartilla de prueba para visión cercana', type: 'text' },
    { key: 'art12_anexo', label: 'Anexo o dependientes de consultorios médicos', type: 'text' },
    { key: 'diplo_exhi', label: 'Diploma/s exhibido/s Art. 7', type: 'text' },
    { key: 'mostr', label: 'Mostrador Art. 13 a)', type: 'text' },
    { key: 'esp_mostr', label: 'Espejo para mostrador', type: 'text' },
    { key: 'mue_col', label: 'Muestrario de colores de cristales', type: 'text' },
    { key: 'car_opt', label: 'Cartel de optotipo Art. 13 a)', type: 'text' },
  ],

  opticas_taller: [
    { key: 'fronto', label: 'Frontofocómetro', type: 'text' },
    { key: 'esfero', label: 'Esferómetro', type: 'text' },
    { key: 'pin_adap', label: 'Pinzas de adaptación', type: 'text' },
    { key: 'ban_opt', label: 'Banco Óptico o Mesa de Trabajo', type: 'text' },
    { key: 'des_var', label: 'Destornilladores Varios', type: 'text' },
    { key: 'stock_cris', label: 'Stock de Cristales', type: 'text' },
    { key: 'arm_metal', label: 'Armazones metal (50)', type: 'text' },
    { key: 'calis', label: 'Calisoires Varios', type: 'text' },
    { key: 'pu_vidia', label: 'Punta de Vidia o Máquina Cortadora', type: 'text' },
    { key: 'especi', label: 'Especímetro', type: 'text' },
    { key: 'calef', label: 'Calefactor', type: 'text' },
    { key: 'ma_bise', label: 'Máquina Biseladora o Calibradora', type: 'text' },
    { key: 'lim_var', label: 'Limas Varias', type: 'text' },
    { key: 'mart', label: 'Martillo', type: 'text' },
    { key: 'arm_iny', label: 'Armazones inyectados (50)', type: 'text' },
    { key: 'tal_perf', label: 'Taladro o Perforador de Mano', type: 'text' },
    { key: 'mach_var', label: 'Machos Varios', type: 'text' },
  ],

  opticas_gabinete_contactologia: [
    { key: 'sal_de_esp', label: 'Sala de Espera', type: 'text' },
    { key: 'frontofo', label: 'Frontofocómetro', type: 'text' },
    { key: 'la_luz_ne', label: 'Lámpara de luz negra o de cobalto', type: 'text' },
    { key: 'lupa4', label: 'Lupa de 4 o más aumentos con red milimetrada', type: 'text' },
    { key: 'ta_conve', label: 'Tabla de conversión de dioptrías a milímetros', type: 'text' },
    { key: 'optoti', label: 'Optotipo de refracción o proyección', type: 'text' },
    { key: 'len_cont', label: 'Caja de pruebas de lentes de contacto', type: 'text' },
    { key: 'si_apo_cli', label: 'Sillón c/apoya cabeza para pacientes', type: 'text' },
    { key: 'oftalmo', label: 'Oftalmómetro / Queratómetro', type: 'text' },
    { key: 'cri12', label: 'Caja de pruebas de cristales 12+ dioptrías', type: 'text' },
    { key: 'jue_tabl', label: 'Juego de tablas de distancia de vértice', type: 'text' },
    { key: 'med_dia', label: 'Medidor de diámetro', type: 'text' },
    { key: 'lavabo', label: 'Lavabo', type: 'text' },
    { key: 'la_ilu_fro', label: 'Lámpara para iluminación frontal', type: 'text' },
  ],

  centamb_inscripcion: [
    { key: 'form', label: 'Formulario', type: 'text' },
    { key: 'ad_privad', label: 'Aditamiento Privado', type: 'text' },
    { key: 'cer_auto_lab', label: 'Certificado autorización Laboratorio', type: 'text' },
    { key: 'conv_est', label: 'Convenio con establecimientos polivalentes', type: 'text' },
    { key: 'org_func', label: 'Organigrama funcional', type: 'text' },
    { key: 'planos', label: 'Planos', type: 'text' },
    { key: 'no_pra_amb', label: 'Nómina de prácticas ambulatorias', type: 'text' },
    { key: 'tip_socie', label: 'Tipo de Sociedad', type: 'text' },
    { key: 'dir_lis_prof', label: 'Director y Listado de Profesionales', type: 'text' },
    { key: 'cer_rayx', label: 'Certificado habilitación equipo de Rayos X', type: 'text' },
    { key: 'con_serv_eme', label: 'Convenio Servicio de Emergencias', type: 'text' },
    { key: 'aparato', label: 'Aparatología', type: 'text' },
    { key: 'cer_hab_hem', label: 'Certificado Habilitación Hemoterapia', type: 'text' },
  ],

  centamb_direccion_funcionamiento: [
    { key: 'nro_plantas', label: 'N° de Plantas', type: 'number' },
    { key: 'nro_consultorios', label: 'N° de Consultorios', type: 'number' },
    { key: 'asc_monta', label: 'Ascensor / Montacamillas', type: 'text' },
    { key: 'ilum', label: 'Iluminación', type: 'text' },
    { key: 'sali_eme', label: 'Salida de Emergencia', type: 'text' },
    { key: 'ventil', label: 'Ventilación', type: 'text' },
    { key: 'reg_hiscli', label: 'Registro de Historias Clínicas Completo', type: 'text' },
    { key: 'priva', label: 'Privacidad', type: 'text' },
    { key: 'pla_incli', label: 'Plano inclinado', type: 'text' },
    { key: 'lavab', label: 'Lavabos', type: 'text' },
    { key: 'plan_evac', label: 'Plan de evacuación', type: 'text' },
    { key: 'con_c_ban', label: 'Consultorio c/baño', type: 'text' },
    { key: 'ar_espe', label: 'Área de Espera', type: 'text' },
    { key: 'tec', label: 'Techo', type: 'text' },
    { key: 'sup', label: 'Superficie', type: 'number' },
    { key: 'ban_disca', label: 'Baño discapacitados', type: 'text' },
    { key: 'nro_asientos', label: 'N° de asientos', type: 'number' },
  ],

  centamb_esterilizacion: [
    { key: 'est_autoc', label: 'Estufa y Autoclave', type: 'text' },
    { key: 'con_emp_auto', label: 'Contrato con empresa autorizada', type: 'text' },
    { key: 'mat_desc', label: 'Material descartable', type: 'text' },
    { key: 'micro_presta', label: 'Microscopio adecuado a las prestaciones', type: 'text' },
    { key: 'centrif', label: 'Centrífuga', type: 'text' },
    { key: 'ban_termo', label: 'Baño termostatizado', type: 'text' },
    { key: 'fotocol', label: 'Fotocolorímetro', type: 'text' },
    { key: 'es_cul', label: 'Estufa de cultivo', type: 'text' },
    { key: 'es_este', label: 'Estufa de esterilización', type: 'text' },
    { key: 'helad', label: 'Heladera', type: 'text' },
  ],

  quirurgicos_general: [
    { key: 'quirurgicos_quirofanos', label: 'Quirófanos' },
    { key: 'quirurgicos_sala_recuperacion', label: 'Sala de recuperación' },
    { key: 'quirurgicos_esterilizacion', label: 'Sala de esterilización' },
    { key: 'quirurgicos_equipamiento', label: 'Equipamiento completo' },
    { key: 'quirurgicos_anestesiologo', label: 'Personal anestésico' },
  ],
  consultorios_general: [
    { key: 'consultorios_equipados', label: 'Consultorios equipados' },
    { key: 'sala_espera', label: 'Sala de espera' },
    { key: 'sanitarios', label: 'Sanitarios diferenciados' },
    { key: 'mesa_reconocimiento', label: 'Mesa de reconocimiento' },
    { key: 'iluminacion', label: 'Iluminación adecuada' },
  ],
  laboratorio_general: [
    { key: 'lab_equipos', label: 'Equipos analizadores' },
    { key: 'lab_cabinas', label: 'Cabinas de bioseguridad' },
    { key: 'lab_residuos', label: 'Contenedores de residuos' },
    { key: 'lab_personal', label: 'Personal técnico capacitado' },
  ],
  hemoterapia_general: [
    { key: 'hemo_banco', label: 'Banco de sangre' },
    { key: 'hemo_heladera', label: 'Heladera refrigerada' },
    { key: 'hemo_freezer', label: 'Freezer de plasma' },
    { key: 'hemo_control_temp', label: 'Control de temperatura' },
  ],
  radiodiagnostico_general: [
    { key: 'radio_equipos', label: 'Equipos de Rayos X' },
    { key: 'radio_proteccion', label: 'Protección radiológica' },
    { key: 'radio_dosimetro', label: 'Dosímetro personal' },
    { key: 'radio_licencia', label: 'Licencia de Radiofísica' },
  ],
  internacion_general: [
    { key: 'int_habitaciones', label: 'Habitaciones adecuadas' },
    { key: 'int_llamado', label: 'Sistema de llamado enfermería' },
    { key: 'int_gases', label: 'Gases medicinales' },
    { key: 'int_ropa', label: 'Ropa de cama' },
  ],
  emergencias_general: [
    { key: 'eme_shockroom', label: 'Shock room' },
    { key: 'eme_ambulancia', label: 'Ambulancia propia' },
    { key: 'eme_cardioversor', label: 'Cardioversor' },
    { key: 'eme_oxigeno', label: 'Oxígeno medicinal' },
  ],
  salud_mental_general: [
    { key: 'sm_habitaciones', label: 'Habitaciones seguras' },
    { key: 'sm_terapia', label: 'Sala de terapia grupal' },
    { key: 'sm_psiquiatra', label: 'Psiquiatra de guardia' },
    { key: 'sm_contencion', label: 'Registro de contención' },
  ],
  odontologia_general: [
    { key: 'odo_unidades', label: 'Unidades odontológicas' },
    { key: 'odo_rx', label: 'Rayos X odontológico' },
    { key: 'odo_esterilizacion', label: 'Esterilización' },
    { key: 'odo_desinfeccion', label: 'Desinfección correcta' },
  ],
  optica_general: [
    { key: 'opt_instrumentos', label: 'Instrumentos de medición' },
    { key: 'opt_optometrista', label: 'Optometrista' },
    { key: 'opt_lentes', label: 'Lentes de prueba' },
  ],
  farmacia_general: [
    { key: 'farma_deposito', label: 'Depósito de medicamentos' },
    { key: 'farma_control_temp', label: 'Control de temperatura' },
    { key: 'farma_farmaceutico', label: 'Farmacéutico' },
    { key: 'farma_stock', label: 'Stock de emergencia' },
  ],
  direccion_funcionamiento: [
    { key: 'direccion_existe', label: 'Existencia de Dirección Técnica' },
    { key: 'registro_profesionales', label: 'Registro de profesionales' },
    { key: 'libros_rubricados', label: 'Libros rubricados' },
    { key: 'habilitacion_vigente', label: 'Habilitación vigente' },
    { key: 'seguro_rc', label: 'Seguro de responsabilidad civil' },
    { key: 'botiquin', label: 'Botiquín de primeros auxilios' },
    { key: 'cartel_emergencia', label: 'Cartel de emergencia' },
  ],
};

export default function SeccionDinamica({ tipo, datos, onChange }) {
  const campos = CAMPOS_POR_SECCION[tipo] || [];
  const titulo = SECCION_LABELS[tipo] || tipo;

  const handleToggle = (key, valor) => {
    onChange({ [key]: valor });
  };

  const handleTextChange = (key, valor) => {
    onChange({ [key]: valor });
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-bold text-lg mb-4 text-gray-800 uppercase">{titulo}</h3>
      
      <div className="space-y-3">
        {campos.map((campo) => {
          if (campo.type === 'date') {
            return (
              <div key={campo.key} className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">{campo.label}</label>
                <input
                  type="date"
                  value={datos[campo.key] || ''}
                  onChange={(e) => onChange({ [campo.key]: e.target.value })}
                  className="p-3 border border-gray-300 rounded-lg"
                />
              </div>
            );
          }

          if (campo.type === 'number') {
            return (
              <div key={campo.key} className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">{campo.label}</label>
                <input
                  type="number"
                  value={datos[campo.key] || ''}
                  onChange={(e) => onChange({ [campo.key]: parseInt(e.target.value) || '' })}
                  className="p-3 border border-gray-300 rounded-lg"
                />
              </div>
            );
          }

          if (campo.type === 'text') {
            return (
              <div key={campo.key} className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">{campo.label}</label>
                <input
                  type="text"
                  value={datos[campo.key] || ''}
                  onChange={(e) => handleTextChange(campo.key, e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg"
                />
              </div>
            );
          }

          return (
            <div key={campo.key} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-base">{campo.label}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle(campo.key, true)}
                  className={`px-6 py-2 rounded-lg font-semibold text-lg transition-colors ${
                    datos[campo.key] === true
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  SI
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle(campo.key, false)}
                  className={`px-6 py-2 rounded-lg font-semibold text-lg transition-colors ${
                    datos[campo.key] === false
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  NO
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
