import { SECCION_LABELS } from '../utils/constants';

export const CAMPOS_POR_SECCION = {
  conclusion: [
    { key: 'observado', label: 'Observado' },
    { key: 'director_tecnico', label: 'Director Técnico' },
    { key: 'laboratorio', label: 'Laboratorio' },
    { key: 'hemoterapia', label: 'Hemoterapia' },
    { key: 'radiofisica', label: 'Radiofísica' },
    { key: 'hemodialisis', label: 'Hemodiálisis' },
  ],

  registros: [
    { key: 'reg_his_cli', label: 'Registro de Historias Clínicas' },
    { key: 'rev_hc', label: 'Revisión de HC' },
    { key: 'comp', label: 'Completas' },
    { key: 'incomp', label: 'Incompletas' },
    { key: 'ri_mc', label: 'Reglamento Interno / Manual de Procedimientos' },
    { key: 'ad_priv', label: 'Aditamento privado / Denominación correcta' },
  ],

  datos_generales: [
    { key: 'cant_pl', label: 'Cantidad de Plantas', type: 'number' },
    { key: 'fec_ult_ins', label: 'Fecha última inspección del conservador', type: 'date' },
    { key: 'pos_mon_asc', label: 'Posee Montacamillas / Ascensores' },
    { key: 'banio_dis', label: 'Baño para público discapacitado mixtos' },
    { key: 'lib_ing', label: 'Libre ingreso, circulación y giro de camillas' },
    { key: 'luc_aut', label: 'Luces autónomas de emergencia' },
    { key: 'equi_ele', label: 'Equipo Electrógeno' },
    { key: 'pl_ev_vi', label: 'Plan Evacuación vigente' },
    { key: 'ex_inc', label: 'Extinguidores de Incendios' },
    { key: 'sal_eme', label: 'Salida de Emergencia' },
    { key: 'hab_bomb', label: 'Habilitación Bomberos' },
    { key: 'sil_rue', label: 'Silla de Ruedas' },
    { key: 'to_cam_ort', label: 'Todas las camas tipo Ortopedia' },
    { key: 'pos_pla', label: 'Posee planos inclinados' },
  ],

  consultorios_externos: [
    { key: 'cons_ext', label: 'Posee Consultorios Externos' },
    { key: 'cant_tot', label: 'Cantidad total de consultorios', type: 'number' },
    { key: 'can_cons', label: 'Consultorios con baño privado y vestuario', type: 'number' },
    { key: 'cons_lav', label: 'Consultorio con lavabo' },
  ],

  consultorios_salud_mental: [
    { key: 'con_sal_men', label: 'Posee Consultorios Salud Mental' },
    { key: 'ven_plan_evac', label: 'Fecha vencimiento Plan Evacuación', type: 'date' },
    { key: 'ven_bomb', label: 'Fecha vencimiento Bomberos', type: 'date' },
    { key: 'ven_exti', label: 'Fecha vencimiento Extinguidores', type: 'date' },
  ],

  la_institucion_posee: [
    { key: 'vac_hab', label: 'Vacunatorio habilitado' },
    { key: 'bot_dro_urg', label: 'Botiquín con drogas para urgencias' },
    { key: 'far_prov', label: 'Farmacia o provisión de medicamentos habilitados' },
    { key: 'bco_san', label: 'Banco de Sangre y/o Servicio de Med. Transfusional' },
    { key: 'ate_per', label: 'Con atención permanente (24 hs)' },
  ],

  radiofisica: [
    { key: 'dia_ima_hab', label: 'Diagnóstico por imagen habilitados' },
    { key: 'den_os', label: 'Densitometría ósea habilitados' },
    { key: 'tac', label: 'TAC habilitados' },
    { key: 'rad_sim_hab', label: 'Radiología simple habilitados' },
    { key: 'eco_hab', label: 'Ecografía habilitados' },
    { key: 'mam_hab', label: 'Mamografía habilitados' },
    { key: 'pet', label: 'PET habilitados' },
    { key: 'rmn', label: 'RMN habilitados' },
    { key: 'rad_con_hab', label: 'Radiología contrastada habilitados' },
  ],

  sector_internacion: [
    { key: 'cond_edil', label: 'Condiciones Edilicias' },
    { key: 'are_res', label: 'Área de Residuos' },
    { key: 'h1_inc', label: 'Habitación 1 cama — Baño incluido', type: 'number' },
    { key: 'h1_con', label: 'Habitación 1 cama — Baño contiguo', type: 'number' },
    { key: 'h2_inc', label: 'Habitación 2 camas — Baño incluido', type: 'number' },
    { key: 'h2_con', label: 'Habitación 2 camas — Baño contiguo', type: 'number' },
    { key: 'h3_inc', label: 'Habitación 3 camas — Baño incluido', type: 'number' },
    { key: 'h3_con', label: 'Habitación 3 camas — Baño contiguo', type: 'number' },
    { key: 'otr', label: 'Otras habitaciones', type: 'number' },
    { key: 'tot_habit', label: 'Total de Habitaciones', type: 'number' },
    { key: 'cam_ort_nro', label: 'Camas ortopédicas N°', type: 'number' },
    { key: 'llam_banio', label: 'Llamador en los baños' },
    { key: 'loc_dep', label: 'Local dimensiones apropiadas depósito' },
    { key: 'per_vent', label: 'Perfectamente ventilado' },
    { key: 'ubi_are_ser', label: 'Ubicado en área de servicio' },
    { key: 'ilu_nat', label: 'Iluminación natural' },
    { key: 'vent_natu', label: 'Ventilación natural' },
    { key: 'cli_fri_cal', label: 'Climatización frío-calor' },
    { key: 'ilu_art_cen', label: 'Iluminación artificial central' },
    { key: 'ilu_art_ind', label: 'Iluminación artificial individual' },
    { key: 'llam_ind', label: 'Llamador individual' },
    { key: 'priv', label: 'Privacidad' },
  ],

  enfermeria: [
    { key: 'loc_prop', label: 'Posee local propio' },
    { key: 'bot_urg', label: 'Botiquín de urgencia' },
    { key: 'tub_oxi', label: 'Tubo de oxígeno' },
    { key: 'mes_pil', label: 'Mesada con Pileta' },
    { key: 'arm_vit', label: 'Armario o vitrina' },
    { key: 'ar_suc', label: 'Área sucia' },
    { key: 'ar_lim', label: 'Área limpia' },
  ],

  area_quirurgica: [
    { key: 'cant_quir', label: 'Cantidad de quirófanos', type: 'number' },
    { key: 'c_n_par', label: 'Cumple Normas Paredes' },
    { key: 'c_n_pis', label: 'Cumple Normas Pisos' },
    { key: 'c_n_tec', label: 'Cumple Normas Techos' },
    { key: 'cir_exc', label: 'Circulación exclusiva' },
    { key: 'in_tr_pac', label: 'Ingreso y transferencia de pacientes' },
    { key: 'ves_prop', label: 'Vestuario propio' },
    { key: 'po_ve_pa_fi', label: 'Posee ventana con paño fijo' },
    { key: 's_suc', label: 'Sector sucio' },
    { key: 'c_dir_quir', label: 'Comunicación directa a quirófano' },
    { key: 'dep_mat_es', label: 'Depósito material estéril' },
    { key: 'il_adec', label: 'Iluminación adecuada' },
    { key: 'cli_fio_calor', label: 'Climatización frío-calor' },
    { key: 'ac_comp_pre', label: 'Acorde a la complejidad prestacional' },
    { key: 'card', label: 'Cardiodesfibrilador' },
    { key: 'bot_anes', label: 'Botiquín básico anestesia' },
    { key: 'bot_rea', label: 'Botiquín básico reanimación CV' },
    { key: 'larin', label: 'Laringoscopía' },
    { key: 'tub_endo', label: 'Tubos endotraqueales' },
    { key: 'ca_traq', label: 'Caja de traqueotomía' },
    { key: 'mon_multi', label: 'Monitor multiparamétrico' },
    { key: 'res_auto', label: 'Respirador automático' },
    { key: 'me_mayo', label: 'Mesa de cirugía Tipo Mayo o similar' },
    { key: 'elec', label: 'Electrobisturí' },
    { key: 'ins_esp', label: 'Instrumental s/especialidades' },
  ],

  obstetricia: [
    { key: 'sal_par', label: 'Posee sala de parto' },
    { key: 'sal_rec', label: 'Posee sala de recuperación' },
    { key: 'rec_recnac', label: 'Posee recepción de recién nacido' },
    { key: 'cant_sal_par', label: 'Cantidad de salas de partos', type: 'number' },
    { key: 'c_normas_par', label: 'Cumple normas paredes' },
    { key: 'c_normas_pis', label: 'Cumple normas pisos' },
    { key: 'c_normas_tec', label: 'Cumple normas techos' },
    { key: 'circ_excl', label: 'Circulación exclusiva' },
    { key: 'ie_pac', label: 'Ingreso y transferencia de pacientes' },
    { key: 'cl_frio_calor', label: 'Climatización frío-calor' },
    { key: 'sal_recep', label: 'Sala de Recepción' },
    { key: '1c3_par', label: '1 c/3 sala de partos' },
    { key: '6e', label: '6 enchufes' },
    { key: 've_pro', label: 'Vestuario propio' },
    { key: 'lav_pre', label: 'Lavabos previo filtro de vestuarios' },
    { key: 's_sucio', label: 'Sector sucio' },
    { key: 'ccd_sp', label: 'Comunicación directa a SP' },
    { key: 's_limp', label: 'Sector Limpio' },
    { key: 'cc_dir_sp', label: 'Comunicación directa de SP' },
    { key: 'hpre_are', label: 'Habitación preparto en el área' },
    { key: 'hpre_inte', label: 'Habitación preparto en el internado' },
    { key: 'il_adecuada', label: 'Iluminación adecuada' },
    { key: 'pro_des_tie', label: 'Protección con descarga a tierra' },
    { key: '1cp_2rn', label: '1 caja de paro c/equipamiento para 2 RN simultáneos' },
    { key: '1p_c2ox', label: '1 panel c/2 oxígenos 1 aspiración 1 aire comprimido' },
    { key: 'm_rec_rn', label: 'Mesa de recepción acolchada c/calorificación p/2 RN' },
  ],

  laboratorio: [
    { key: 'hab_cob', label: 'Habilitación por COBICO' },
    { key: 'son', label: 'Interno / Externo' },
    { key: 'es', label: 'Propio / Contratado' },
  ],

  guardia: [
    { key: 'nro_camas_guardia', label: 'N° de Camas', type: 'number' },
    { key: 'c_e_guardia', label: 'Coincide con edificación' },
    { key: 'p_guardia', label: 'Planos' },
    { key: 'medicos_guardia', label: 'Médicos (N°)', type: 'number' },
    { key: 'enfermeras_guardia', label: 'Enfermeras (N°)', type: 'number' },
    { key: 'cardi_guardia', label: 'Cardiodesfibrilador' },
    { key: 'elec_guardia', label: 'Electrocardiógrafo' },
    { key: 'm_m_guardia', label: 'Oxímetro de pulso / monitor multiparamétrico' },
    { key: 'e_p_n_guardia', label: 'Equipo para nebulizaciones' },
    { key: 'c_d_p_guardia', label: 'Carro de paro completo' },
  ],

  uco: [
    { key: 'nro_camas', label: 'N° de Camas', type: 'number' },
    { key: 'planos', label: 'Planos' },
    { key: 'c_c_e', label: 'Coincide con edificación' },
    { key: 's_v', label: 'Signos vitales' },
    { key: 'b_d', label: 'Balance diario' },
    { key: 'v_i_e', label: 'Volúmenes de ingresos y egresos' },
    { key: 'm', label: 'Medicación' },
    { key: 'u_z_c_s', label: 'Unidad en zona de circulación semirrestringida' },
    { key: 's_i_p_l', label: 'Sala de internación c/pileta lavamanos' },
    { key: 'o_d_e', label: 'Office de enfermería' },
    { key: 'mon', label: 'Monitores' },
    { key: 'l_r_m_u', label: 'Local de ropa y material usado' },
    { key: 'a_l', label: 'Área lavachatas' },
    { key: 'd_c_a', label: 'Depósito de camillas y aparatología' },
    { key: 's_m', label: 'Sala de médicos' },
    { key: 'g_e', label: 'Grupo electrógeno' },
    { key: 'a_c_d', label: 'Acceso directo y exclusivo' },
    { key: 'f_c_c', label: 'Fácil comunicación c/cirugía' },
    { key: 'pr', label: 'Privacidad' },
    { key: 'c_o_a', label: 'Camas ortopédicas o articuladas' },
    { key: 'd_c', label: 'Doble comando' },
    { key: 'ro', label: 'Rodantes' },
    { key: 'p_a_r', label: 'Plano apoyo rígido' },
    { key: 'a_p', label: 'Acceso desde 4 posiciones' },
    { key: 'v_p_d_c', label: 'Visión panorámica directa a todas las camas' },
    { key: 'l_i_m', label: 'Local de Instrumental y material estéril' },
    { key: 'l_c_c', label: 'Local cerrado c/1 cama para aislamiento' },
    { key: 'e_v_h', label: 'Evoluciones diarias en Historia Clínica' },
    { key: 'v_v_p', label: 'Vestuario para visitas c/pileta lavamanos' },
    { key: 'h_c', label: 'Habitación c/baño propio para médico de Guardia' },
    { key: 'c_l', label: 'Comparte algún local UCI / UCO' },
    { key: 'p_u', label: 'Posee otras Unidades de UCI / UCO' },
    { key: 'd_t_e', label: 'Diez tomas de electricidad por cama' },
    { key: 's_i', label: 'Sistema de Iluminación de Emergencia' },
    { key: 'herm', label: 'Hermeticidad' },
    { key: 's_t_s', label: 'Superficie total sala internación' },
    { key: 'i_n', label: 'Iluminación natural' },
    { key: 'i_a', label: 'Iluminación artificial central' },
    { key: 'i_i', label: 'Iluminación Individual' },
    { key: 'v_a_e_p', label: 'Ventanas al exterior De paño fijo' },
    { key: 'e_asp', label: 'Equipo de aspiración' },
    { key: 'res_mec_vol', label: 'Respirador mecánico volumétrico' },
    { key: 'e_des_sin', label: 'Equipo de desfibrilación y sincronizador' },
    { key: 'bo_inf', label: 'Bomba de infusión' },
    { key: 'car1', label: 'Carro de urgencias' },
    { key: 'lari', label: 'Laringoscopios' },
    { key: 'masc', label: 'Máscara' },
    { key: 'res_ambu', label: 'Resucitador tipo AMBU' },
    { key: 'tens', label: 'Tensiómetro' },
    { key: 'nebu', label: 'Nebulizador' },
    { key: 'el_in_endo', label: 'Elementos para intubación endotraqueal' },
    { key: 'sis_por_as', label: 'Sistema portátil de aspiración p/drenaje' },
    { key: 'cat_naso', label: 'Equipos para cateterización nasogástrica' },
    { key: 'e_pun_raq', label: 'Equipos para punción raquídea' },
    { key: 'e_pun_abd', label: 'Equipo para punción abdominal' },
    { key: 'car_par', label: 'Carro de paro' },
    { key: 'ox_pul_por', label: 'Oxímetro de pulso portátil' },
    { key: 'elec', label: 'Electrocardiógrafo' },
    { key: 'mar2cat', label: 'Marcapaso transitorio con 2 catéteres' },
    { key: 'eqrx', label: 'Equipo portátil de Rx 100 Ma/100 Kv' },
    { key: 'el_traq', label: 'Elementos para traqueotomía' },
    { key: 'bol', label: 'Bolsa' },
    { key: 'ada', label: 'Adaptador' },
    { key: 'car_cur', label: 'Carro de curación' },
    { key: 'ins_exa', label: 'Instrumental de examen' },
    { key: 'il_ind', label: 'Iluminación individual' },
    { key: 'sis_tor', label: 'Sistema de aspiración torácica' },
    { key: 'cat_ves', label: 'Equipos para cateterización vesical' },
    { key: 'cat_cat_ven', label: 'Equipos para cateterización venosa' },
    { key: 'e_pun_tor', label: 'Equipo para punción torácica' },
    { key: 'bot24', label: 'Botiquín c/medicamentos para urgencias de 24 hs' },
  ],

  uti: [
    { key: 'nro_camas', label: 'N° de Camas', type: 'number' },
    { key: 'planos', label: 'Planos' },
    { key: 'c_c_e', label: 'Coincide con edificación' },
    { key: 'martrans_nouco', label: 'Marcapaso transitorio (si no tiene UCO)' },
    { key: 'suptot', label: 'Superficie total sala internación', type: 'number' },
  ],

  utin: [
    { key: 'of_enf_m_utin', label: 'Office de enfermería con monitores' },
    { key: 'ar_de_rl_utin', label: 'Área de depósito ropa limpia' },
    { key: 'pil_mat', label: 'Pileta para material' },
    { key: 'dep_utin', label: 'Depósito para incubadora/cuna/aparatos' },
    { key: 'cam_a_codo_utin', label: 'Camillas accionadas a codo' },
    { key: 'loc_for_lac_utin', label: 'Local de fórmulas lácteas' },
    { key: 'ex_air_fil_utin', label: 'Extractor de aire con filtro' },
    { key: 'sis_cal_ref_utin', label: 'Sistema calefacción refrigeración' },
    { key: 'tom_ele_cam_utin', label: 'Ocho tomas de electricidad por cama' },
    { key: 'in_cu_utin', label: 'Incubadoras' },
    { key: 'air_com_utin', label: 'Aire comprimido' },
    { key: 'aspi_utin', label: 'Aspiración' },
    { key: 'uni_ais_utin', label: 'Unidades de aislamiento' },
    { key: 'con_mon_utin', label: 'Consola de monitoreo' },
    { key: 'cunas_utin', label: 'Cunas' },
    { key: 'mon_card_utin', label: 'Monitores cardiorrespiratorios' },
    { key: 'bom_per_jer_utin', label: 'Bomba de perfusión de jeringa' },
    { key: 'bom_per_con_utin', label: 'Bomba de perfusión continua' },
    { key: 'spo_lumi_utin', label: 'Spot de luminoterapia' },
    { key: 'oxi_pul_utin', label: 'Oxímetro de pulso' },
  ],

  hemodinamia: [
    { key: 'nro_camas_hemo', label: 'N° de Camas', type: 'number' },
    { key: 'planos_hemo', label: 'Planos' },
    { key: 'coed_hemo', label: 'Coincide con edificación' },
    { key: 'jefserv_hemo', label: 'Jefe de Servicio' },
    { key: 'med_hemo', label: 'Médico' },
    { key: 'enfprof_hemo', label: 'Enfermero profesional' },
    { key: 'meradi_hemo', label: 'Médico radiólogo' },
    { key: 'meanes_hemo', label: 'Médico anestesista' },
    { key: 'arcc_hemo', label: 'Arco en C o paralelogramo deformable' },
    { key: 'mecate_hemo', label: 'Mesa de Cateterismo' },
    { key: 'intima_hemo', label: 'Intensificador de imágenes' },
    { key: 'tubrayx_hemo', label: 'Tubo de rayos X' },
    { key: 'genpul_hemo', label: 'Generadores pulsados por tetrodos' },
    { key: 'elec_hemo', label: 'Electrocardiógrafo' },
    { key: 'oxipul_hemo', label: 'Oxímetro de pulso' },
    { key: 'cardio_hemo', label: 'Cardiodesfibrilador' },
    { key: 'iny_con_hemo', label: 'Inyectora de contraste' },
    { key: 'mondig_hemo', label: 'Monitor digital' },
  ],

  hospital_dia: [
    { key: 'nro_camas_hdd', label: 'N° de Camas', type: 'number' },
    { key: 'plan_hdd', label: 'Planos' },
    { key: 'coed_hdd', label: 'Coincide con edificación' },
    { key: 'jefserv_hdd', label: 'Jefe de Servicio' },
    { key: 'medonc_hdd', label: 'Médico oncológico' },
    { key: 'trsoc_hdd', label: 'Trabajador social' },
    { key: 'enf_hdd', label: 'Enfermeros' },
    { key: 'kine_hdd', label: 'Kinesiólogo' },
    { key: 'psico_hdd', label: 'Psicólogo' },
    { key: 'nutri_hdd', label: 'Nutricionista' },
    { key: 'sillonc_hdd', label: 'Sillón de Oncología' },
    { key: 'colanti_hdd', label: 'Colchón antiescaras' },
    { key: 'bominf_hdd', label: 'Bomba de infusión' },
    { key: 'caflula_hdd', label: 'Campana de flujo laminar' },
    { key: 'bala_hdd', label: 'Balanza de uso clínico con cartabón' },
    { key: 'equimon_hdd', label: 'Equipo de monitoreo presión arterial' },
    { key: 'oxipul_hdd', label: 'Oxímetro de pulso' },
  ],

  quirurgicos_inscripcion: [
    { key: 'nro_camas_quir', label: 'N° Total de Camas', type: 'number' },
    { key: 'plan_quir', label: 'Planos' },
    { key: 'tisoc_quir', label: 'Tipo de Sociedad' },
    { key: 'adpriv_quir', label: 'Aditamiento Privado' },
    { key: 'dirlis_quir', label: 'Director y Listado de Profesionales' },
    { key: 'noprac_quir', label: 'Nómina de prácticas ambulatorias' },
    { key: 'conest_quir', label: 'Convenio con establecimientos polivalentes' },
    { key: 'consereme_quir', label: 'Convenio con Servicio de Emergencias' },
    { key: 'consertras_quir', label: 'Convenio con Traslado de Residuos Patógenos' },
    { key: 'orgfunc_quir', label: 'Organigrama funcional' },
    { key: 'apa_quir', label: 'Aparatología' },
    { key: 'coined_quir', label: 'Coincide con edificación' },
    { key: 'noproc_quir', label: 'Nómina de procedimientos' },
    { key: 'conlab_quir', label: 'Convenio con Laboratorio' },
  ],

  quirurgicos_direccion_funcionamiento: [
    { key: 'regcnftra_quir', label: 'Registro de Enfermedades Transmisibles' },
    { key: 'regint_quir', label: 'Reglamento Interno' },
    { key: 'nropla_quir', label: 'Número de Plantas', type: 'number' },
    { key: 'ascmon_quir', label: 'Ascensor / Montacamillas' },
    { key: 'disdif_quir', label: 'Disyuntor diferencial' },
    { key: 'evainc_quir', label: 'Plan de evacuación de Incendios' },
    { key: 'reghisclin_quir', label: 'Registro de Historias Clínicas Completo' },
    { key: 'ext_quir', label: 'Extinguidores' },
    { key: 'habbomb_quir', label: 'Habilitación de Bomberos' },
    { key: 'plincl_quir', label: 'Plano inclinado' },
    { key: 'saleme_quir', label: 'Salida de Emergencia' },
    { key: 'arpatho_quir', label: 'Área para residuos patógenos' },
    { key: 'nrocons_quir', label: 'N° de Consultorios', type: 'number' },
    { key: 'il_quir', label: 'Iluminación' },
    { key: 'vent_quir', label: 'Ventilación' },
    { key: 'pri_quir', label: 'Privacidad' },
    { key: 'lav_quir', label: 'Lavabos' },
    { key: 'aresp_quir', label: 'Área de Espera' },
    { key: 'sup_quir', label: 'Superficie', type: 'number' },
    { key: 'nroasi_quir', label: 'N° de asientos', type: 'number' },
    { key: 'banpub_quir', label: 'Baño para público / personal' },
  ],

  quirurgicos_enfermeria: [
    { key: 'locprop_quir', label: 'Local propio' },
    { key: 'tubox_quir', label: 'Tubo oxígeno' },
    { key: 'este_quir', label: 'Estetoscopio' },
    { key: 'cacur_quir', label: 'Caja de Curaciones' },
    { key: 'arproc_quir', label: 'Área procesamiento Limpios y Usados' },
    { key: 'arm_quir', label: 'Armario o Vitrinas' },
    { key: 'boturg_quir', label: 'Botiquín urgencia' },
    { key: 'mepil_quir', label: 'Mesada con pileta' },
    { key: 'est_quir', label: 'Estantes' },
    { key: 'sirue_quir', label: 'Silla de ruedas' },
    { key: 'hel_quir', label: 'Heladera' },
    { key: 'tensi_quir', label: 'Tensiómetro' },
  ],

  quirurgicos_area_internacion: [
    { key: 'habrec_quir', label: 'Habitación de recuperación y/o prácticas clínicas' },
    { key: 'boc_quir', label: 'Boca de oxígeno' },
    { key: 'poban_quir', label: 'Posee baño privado o compartido' },
    { key: 'pocamort_quir', label: 'Posee cama ortopédica' },
    { key: 'libgir_quir', label: 'Libre giro de camillas' },
    { key: 'can_quir', label: 'Cantidad', type: 'number' },
    { key: 'lav_quiru', label: 'Lavabos' },
    { key: 'priva_quir', label: 'Privacidad' },
    { key: 'llamind_quir', label: 'Llamador individual' },
    { key: 'climat_quir', label: 'Climatización' },
    { key: 'tuoxig_quir', label: 'Tubo de Oxígeno' },
    { key: 'bovac_quir', label: 'Boca de Vacío' },
    { key: 'habped_quir', label: 'Habitación Pediátrica Diferenciada' },
    { key: 'habpacesp_quir', label: 'Habitación Pacientes Especiales' },
    { key: 'nro_quirofnos_quir', label: 'N° de quirófanos', type: 'number' },
    { key: 'obs1_quir', label: 'Observaciones quirófano', type: 'textarea' },
    { key: 'quir_dimen', label: 'Quirófano: dimensiones' },
    { key: 'pisos_quir', label: 'Pisos' },
    { key: 'paredes_quir', label: 'Paredes' },
    { key: 'vest_quir', label: 'Vestuarios' },
    { key: 'ingtran_quir', label: 'Ingreso y Transferencia de Pacientes' },
    { key: 'comdir_quir', label: 'Comunicación directa a Quirófano' },
    { key: 'obs2_quir', label: 'Observaciones sala recuperación', type: 'textarea' },
    { key: 'techos_quir', label: 'Techo' },
    { key: 'salrecu_quir', label: 'Sala de Recuperación' },
    { key: 'ilum_quir', label: 'Iluminación' },
    { key: 'climati_quir', label: 'Climatización' },
    { key: 'lavprev_quir', label: 'Lavabos filtro previo por Vestuario' },
    { key: 'salpre_quir', label: 'Sala de Pre-Anestesia' },
    { key: 'arapoy_quir', label: 'Área de Apoyo para material sucio' },
  ],

  quirurgicos_equipamiento: [
    { key: 'botbas_quir', label: 'Botiquín básico c/anestésicos y p/reanimación CV' },
    { key: 'laritub_quir', label: 'Laringoscopio y Tubos Endotraqueales' },
    { key: 'cajtraq_quir', label: 'Caja traqueostomía' },
    { key: 'mon_quir', label: 'Monitor' },
    { key: 'electro_quir', label: 'Electrobisturí' },
    { key: 'asauto_quir', label: 'Aspirador automático' },
    { key: 'oxipul_quir', label: 'Oxímetro de pulso' },
    { key: 'lamcial_quir', label: 'Lámpara cialítica' },
    { key: 'memasi_quir', label: 'Mesa cirugía Mayor o similar' },
    { key: 'instru_quir', label: 'Instrumental' },
    { key: 'fuenepro_quir', label: 'Fuente energía propia' },
    { key: 'gruele_quir', label: 'Grupo electrógeno' },
    { key: 'resauto_quir', label: 'Respirador automático' },
    { key: 'tuboxi_quir', label: 'Tubo de Oxígeno' },
    { key: 'cardi_quir', label: 'Cardiodesfibrilador' },
  ],

  quirurgicos_esterilizacion: [
    { key: 'est_quir', label: 'Estufa' },
    { key: 'conempauto_quir', label: 'Contrato con empresa autorizada' },
    { key: 'autocl_quir', label: 'Autoclave' },
    { key: 'matdes_quir', label: 'Material descartable' },
  ],

  hemodialisis_direccion_funcionamiento: [
    { key: 'indiaind_hemodi', label: 'Unidad de Diálisis Independiente' },
    { key: 'repsico_hemodi', label: 'Registro de Psicofármacos Actualizado' },
    { key: 'reenftra_hemodi', label: 'Registro de Enfermedades Transmisibles' },
    { key: 'regint_hemodi', label: 'Reglamento Interno' },
    { key: 'plevac_hemodi', label: 'Plan de Evacuación' },
    { key: 'habbomb_hemodi', label: 'Habilitación de Bomberos' },
    { key: 'nobio_hemodi', label: 'Normas bioseguridad expuestas' },
    { key: 'nopromed_hemodi', label: 'Normas de Procedimientos para Médicos' },
    { key: 'noproenf_hemodi', label: 'Normas de Procedimientos para Enfermeras' },
    { key: 'nroins_hemodi', label: 'Nro de Inscripción INCUCAI y/o ECODAI' },
    { key: 'insc_hemodi', label: 'Carpetas de Inscripción INCUCAI y/o ECODAI' },
    { key: 'conv_int_hemodi', label: 'Convenio de Internación' },
    { key: 'regclincomp_hemodi', label: 'Registro Historia Clínica completa' },
    { key: 'cant_pues_hemo', label: 'Cantidad de puestos', type: 'number' },
  ],

  hemodialisis_analisis_agua: [
    { key: 'fisquim_hemodi', label: 'Análisis Fisicoquímico' },
    { key: 'ulfisqui_hemodi', label: 'Fecha último análisis fisicoquímico', type: 'date' },
    { key: 'bacterio_hemodi', label: 'Análisis Bacteriológico' },
    { key: 'ulbacte_hemodi', label: 'Fecha último análisis bacteriológico', type: 'date' },
  ],

  hemodialisis_serologia: [
    { key: 'hiv_hemodi', label: 'HIV (Personal)' },
    { key: 'hepb_hemodi', label: 'Hepatitis B (Personal)' },
    { key: 'hepc_hemodi', label: 'Hepatitis C (Personal)' },
    { key: 'obs_hemodi', label: 'Observaciones', type: 'textarea' },
    { key: 'perenf_hemodi', label: 'Planillas de Personal Enfermería' },
    { key: 'hivpa_hemodi', label: 'HIV (Pacientes)' },
    { key: 'hb_hemodi', label: 'Hepatitis B (Pacientes)' },
    { key: 'hc_hemodi', label: 'Hepatitis C (Pacientes)' },
    { key: 'libreu_hemodi', label: 'Libro de Reusos' },
    { key: 'cmaxreus_hemodi', label: 'Cantidad máxima de reusos', type: 'number' },
  ],

  hemodialisis_serologia_personal: [
    { key: 'hiv_hemodi', label: 'VIH' },
    { key: 'hepb_hemodi', label: 'Hepatitis B' },
    { key: 'hepc_hemodi', label: 'Hepatitis C' },
    { key: 'fecha_serologia_personal', label: 'Fecha último control serológico', type: 'date' },
  ],

  hemodialisis_serologia_pacientes: [
    { key: 'hivpa_hemodi', label: 'VIH' },
    { key: 'hb_hemodi', label: 'Hepatitis B' },
    { key: 'hc_hemodi', label: 'Hepatitis C' },
    { key: 'fecha_serologia_pacientes', label: 'Fecha último control serológico', type: 'date' },
  ],

  estetica_inscripcion: [
    { key: 'nro_cam_rec', label: 'N° Total de Camas de recuperación', type: 'number' },
    { key: 'ti_soc', label: 'Tipo de Sociedad' },
    { key: 'ad_priv', label: 'Aditamento Privado' },
    { key: 'pla', label: 'Planos' },
    { key: 'cer_au_lab', label: 'Certificado autorización Laboratorio' },
    { key: 'cer_au_ind', label: 'Certificado autorización Individual' },
    { key: 'cer_hab_hemo', label: 'Certificado Habilitación Hemoterapia' },
    { key: 'nom_pra_amb', label: 'Nómina de prácticas ambulatorias' },
    { key: 'conv_serv', label: 'Convenio Servicio de Emergencias / Unidades Móviles' },
    { key: 'dir_lis_pro', label: 'Director y Listado de Profesionales' },
    { key: 'org_func', label: 'Organigrama funcional' },
    { key: 'apar', label: 'Aparatología' },
    { key: 'cer_au_dia_ima', label: 'Certificado autorización Diagnóstico x Imágenes' },
    { key: 'hab_in_eq', label: 'Certificado Habilitación de la Instalación del Equipo' },
    { key: 'sel_ley', label: 'Sellado de Ley' },
    { key: 'con_poliv', label: 'Convenio con establecimientos polivalentes' },
  ],

  estetica_direccion_funcionamiento: [
    { key: 'reg_enf_trans', label: 'Registro de Enfermedades Transmisibles' },
    { key: 'reg_int', label: 'Reglamento Interno' },
    { key: 'reg_psico', label: 'Registro de Psicofármacos' },
    { key: 'reg_his_cli_comp', label: 'Registro de Historias Clínicas Completo' },
    { key: 'minu', label: 'Municipalidad' },
    { key: 'prov', label: 'Provincia' },
    { key: 'gas', label: 'Gas' },
    { key: 'agua', label: 'Agua' },
    { key: 'luz', label: 'Luz' },
    { key: 'otr', label: 'Otras' },
    { key: 'nro_plantas', label: 'Número de Plantas', type: 'number' },
    { key: 'asc_mon', label: 'Ascensor / Montacamillas' },
    { key: 'pla_inc', label: 'Plano inclinado' },
    { key: 'sal_emerg', label: 'Salida de Emergencia' },
    { key: 'pl_eva_inc', label: 'Plan de evacuación de Incendios' },
  ],

  estetica_consultorios: [
    { key: 'nro', label: 'Número de consultorios', type: 'number' },
    { key: 'vent', label: 'Ventilación' },
    { key: 'lavabos', label: 'Lavabos' },
    { key: 'sup', label: 'Superficie', type: 'number' },
    { key: 'ba_disc', label: 'Baño para discapacitados' },
    { key: 'techo', label: 'Techo' },
    { key: 'paredes', label: 'Paredes' },
    { key: 'con_emp_aut', label: 'Contrato con empresa autorizada' },
    { key: 'mi_ad_pres', label: 'Microscopio adecuado a las prestaciones' },
    { key: 'ba_term', label: 'Baño termostatizado' },
    { key: 'es_cul', label: 'Estufa de cultivo' },
    { key: 'ilum', label: 'Iluminación' },
    { key: 'priva', label: 'Privacidad' },
    { key: 'ar_es', label: 'Área de Espera' },
    { key: 'nro_asientos', label: 'N° de asientos', type: 'number' },
    { key: 'cons_c_ba', label: 'Consultorio c/baño incluido' },
    { key: 'pisos', label: 'Pisos' },
    { key: 'estu', label: 'Estufa' },
    { key: 'ma_des', label: 'Material descartable' },
    { key: 'centrif', label: 'Centrífuga' },
    { key: 'fotoco', label: 'Fotocolorímetro' },
    { key: 'es_esf', label: 'Estufa de esterilización' },
  ],

  opticas_local: [
    { key: 'art11', label: 'Óptico regente presente (Art. 11)' },
    { key: 'art7', label: 'Presentó Planos Art. 7' },
    { key: 'librec', label: 'Libro Recetario / Fichero / Respaldo informático' },
    { key: 'ilad_loc', label: 'Iluminación adecuada Art. 13 a)' },
    { key: 'interpu', label: 'Interpupilómetro Art. 13 a)' },
    { key: 'car_pru', label: 'Cartilla de prueba para visión cercana' },
    { key: 'art12_anexo', label: 'Anexo o dependientes de consultorios médicos' },
    { key: 'diplo_exhi', label: 'Diploma/s exhibido/s Art. 7' },
    { key: 'mostr', label: 'Mostrador Art. 13 a)' },
    { key: 'esp_mostr', label: 'Espejo para mostrador' },
    { key: 'mue_col', label: 'Muestrario de colores de cristales' },
    { key: 'car_opt', label: 'Cartel de optotipo Art. 13 a)' },
  ],

  opticas_taller: [
    { key: 'fronto', label: 'Frontofocómetro' },
    { key: 'esfero', label: 'Esferómetro' },
    { key: 'pin_adap', label: 'Pinzas de adaptación' },
    { key: 'ban_opt', label: 'Banco Óptico o Mesa de Trabajo' },
    { key: 'des_var', label: 'Destornilladores Varios' },
    { key: 'stock_cris', label: 'Stock de Cristales' },
    { key: 'arm_metal', label: 'Armazones metal (50)' },
    { key: 'calis', label: 'Calisoires Varios' },
    { key: 'pu_vidia', label: 'Punta de Vidia o Máquina Cortadora' },
    { key: 'especi', label: 'Especímetro' },
    { key: 'calef', label: 'Calefactor' },
    { key: 'ma_bise', label: 'Máquina Biseladora o Calibradora' },
    { key: 'lim_var', label: 'Limas Varias' },
    { key: 'mart', label: 'Martillo' },
    { key: 'arm_iny', label: 'Armazones inyectados (50)' },
    { key: 'tal_perf', label: 'Taladro o Perforador de Mano' },
    { key: 'mach_var', label: 'Machos Varios' },
  ],

  opticas_gabinete_contactologia: [
    { key: 'sal_de_esp', label: 'Sala de Espera' },
    { key: 'frontofo', label: 'Frontofocómetro' },
    { key: 'la_luz_ne', label: 'Lámpara de luz negra o de cobalto' },
    { key: 'lupa4', label: 'Lupa de 4 o más aumentos con red milimetrada' },
    { key: 'ta_conve', label: 'Tabla de conversión de dioptrías a milímetros' },
    { key: 'optoti', label: 'Optotipo de refracción o proyección' },
    { key: 'len_cont', label: 'Caja de pruebas de lentes de contacto' },
    { key: 'si_apo_cli', label: 'Sillón c/apoya cabeza para pacientes' },
    { key: 'oftalmo', label: 'Oftalmómetro / Queratómetro' },
    { key: 'cri12', label: 'Caja de pruebas de cristales 12+ dioptrías' },
    { key: 'jue_tabl', label: 'Juego de tablas de distancia de vértice' },
    { key: 'med_dia', label: 'Medidor de diámetro' },
    { key: 'lavabo', label: 'Lavabo' },
    { key: 'la_ilu_fro', label: 'Lámpara para iluminación frontal' },
  ],

  centamb_inscripcion: [
    { key: 'form', label: 'Formulario' },
    { key: 'ad_privad', label: 'Aditamiento Privado' },
    { key: 'cer_auto_lab', label: 'Certificado autorización Laboratorio' },
    { key: 'conv_est', label: 'Convenio con establecimientos polivalentes' },
    { key: 'org_func', label: 'Organigrama funcional' },
    { key: 'planos', label: 'Planos' },
    { key: 'no_pra_amb', label: 'Nómina de prácticas ambulatorias' },
    { key: 'tip_socie', label: 'Tipo de Sociedad' },
    { key: 'dir_lis_prof', label: 'Director y Listado de Profesionales' },
    { key: 'cer_rayx', label: 'Certificado habilitación equipo de Rayos X' },
    { key: 'con_serv_eme', label: 'Convenio Servicio de Emergencias' },
    { key: 'aparato', label: 'Aparatología' },
    { key: 'cer_hab_hem', label: 'Certificado Habilitación Hemoterapia' },
  ],

  centamb_direccion_funcionamiento: [
    { key: 'nro_plantas', label: 'N° de Plantas', type: 'number' },
    { key: 'nro_consultorios', label: 'N° de Consultorios', type: 'number' },
    { key: 'asc_monta', label: 'Ascensor / Montacamillas' },
    { key: 'ilum', label: 'Iluminación' },
    { key: 'sali_eme', label: 'Salida de Emergencia' },
    { key: 'ventil', label: 'Ventilación' },
    { key: 'reg_hiscli', label: 'Registro de Historias Clínicas Completo' },
    { key: 'priva', label: 'Privacidad' },
    { key: 'pla_incli', label: 'Plano inclinado' },
    { key: 'lavab', label: 'Lavabos' },
    { key: 'plan_evac', label: 'Plan de evacuación' },
    { key: 'con_c_ban', label: 'Consultorio c/baño' },
    { key: 'ar_espe', label: 'Área de Espera' },
    { key: 'tec', label: 'Techo' },
    { key: 'sup', label: 'Superficie', type: 'number' },
    { key: 'ban_disca', label: 'Baño discapacitados' },
    { key: 'nro_asientos', label: 'N° de asientos', type: 'number' },
  ],

  centamb_esterilizacion: [
    { key: 'est_autoc', label: 'Estufa y Autoclave' },
    { key: 'con_emp_auto', label: 'Contrato con empresa autorizada' },
    { key: 'mat_desc', label: 'Material descartable' },
    { key: 'micro_presta', label: 'Microscopio adecuado a las prestaciones' },
    { key: 'centrif', label: 'Centrífuga' },
    { key: 'ban_termo', label: 'Baño termostatizado' },
    { key: 'fotocol', label: 'Fotocolorímetro' },
    { key: 'es_cul', label: 'Estufa de cultivo' },
    { key: 'es_este', label: 'Estufa de esterilización' },
    { key: 'helad', label: 'Heladera' },
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

// Componente para renderizar una sola instancia de UTI o UCO
function UnidadCuidados({ tipo, index, datos, onChange, onRemove, puedeEliminar }) {
  const campos = CAMPOS_POR_SECCION[tipo] || [];
  const labelTipo = tipo === 'uti' ? 'UTI' : 'UCO';

  const handleCampo = (key, valor) => {
    onChange(index, { ...datos, [key]: valor });
  };

  return (
    <div className="mb-4 p-4 bg-white rounded-lg border-2 border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-blue-800">{labelTipo} #{index + 1}</h4>
        {puedeEliminar && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 text-sm font-semibold px-3 py-1 rounded border border-red-300 hover:border-red-500"
          >
            Eliminar
          </button>
        )}
      </div>

      {/* Nombre personalizado */}
      <div className="flex flex-col mb-3">
        <label className="text-sm text-gray-600 mb-1">Nombre / identificación (ej: {labelTipo} Piso 3)</label>
        <input
          type="text"
          value={datos.nombre || ''}
          onChange={(e) => handleCampo('nombre', e.target.value)}
          placeholder={`Nombre de la ${labelTipo} (opcional)`}
          className="p-3 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="space-y-3">
        {campos.map((campo) => {
          if (campo.type === 'number') {
            return (
              <div key={campo.key} className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">{campo.label}</label>
                <input
                  type="number"
                  value={datos[campo.key] || ''}
                  onChange={(e) => handleCampo(campo.key, parseInt(e.target.value) || '')}
                  className="p-3 border border-gray-300 rounded-lg"
                />
              </div>
            );
          }
          return (
            <div key={campo.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <span className="text-base">{campo.label}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCampo(campo.key, true)}
                  className={`px-6 py-2 rounded-lg font-semibold text-lg transition-colors ${
                    datos[campo.key] === true ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >SI</button>
                <button
                  type="button"
                  onClick={() => handleCampo(campo.key, false)}
                  className={`px-6 py-2 rounded-lg font-semibold text-lg transition-colors ${
                    datos[campo.key] === false ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >NO</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Componente wrapper para secciones con múltiples unidades (UTI / UCO)
function SeccionMultipleUnidades({ tipo, unidades, onChange }) {
  const labelTipo = tipo === 'uti' ? 'UTI' : 'UCO';
  const titulo = SECCION_LABELS[tipo] || tipo;

  const handleCambioUnidad = (index, datosActualizados) => {
    const nuevas = unidades.map((u, i) => i === index ? datosActualizados : u);
    onChange(nuevas);
  };

  const agregarUnidad = () => {
    onChange([...unidades, { nombre: '' }]);
  };

  const eliminarUnidad = (index) => {
    onChange(unidades.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-800 uppercase">{titulo}</h3>
        <button
          type="button"
          onClick={agregarUnidad}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700"
        >
          + Agregar {labelTipo}
        </button>
      </div>

      {unidades.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">
          No hay {labelTipo}s agregadas. Presioná "+ Agregar {labelTipo}" para comenzar.
        </p>
      )}

      {unidades.map((unidad, index) => (
        <UnidadCuidados
          key={index}
          tipo={tipo}
          index={index}
          datos={unidad}
          onChange={handleCambioUnidad}
          onRemove={eliminarUnidad}
          puedeEliminar={unidades.length > 1}
        />
      ))}
    </div>
  );
}

export default function SeccionDinamica({ tipo, datos, onChange }) {
  // UTI y UCO tienen manejo especial: array de unidades
  if (tipo === 'uti' || tipo === 'uco') {
    const arrayKey = tipo === 'uti' ? 'utis' : 'ucos';
    const unidades = Array.isArray(datos[arrayKey]) ? datos[arrayKey] : [{ nombre: '' }];
    return (
      <SeccionMultipleUnidades
        tipo={tipo}
        unidades={unidades}
        onChange={(nuevasUnidades) => onChange({ [arrayKey]: nuevasUnidades })}
      />
    );
  }

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

          if (campo.type === 'textarea') {
            return (
              <div key={campo.key} className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">{campo.label}</label>
                <textarea
                  value={datos[campo.key] || ''}
                  onChange={(e) => handleTextChange(campo.key, e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg"
                  rows={3}
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