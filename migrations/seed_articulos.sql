-- =============================================================
-- SEED: Tipologías y artículos para informes de arquitecto
-- Fuente: articulos_consolidados.md
-- Ejecutar en Supabase SQL Editor
-- =============================================================

-- Asegurar que la columna subgrupo existe
ALTER TABLE informe_items ADD COLUMN IF NOT EXISTS subgrupo TEXT;

-- ─────────────────────────────────────────────────────────────
-- TIPOLOGÍAS
-- ─────────────────────────────────────────────────────────────
INSERT INTO informe_tipologia (nombre, descripcion, activo) VALUES
  ('Geriátricos', 'Resolución Ministerial N° 394/09', true),
  ('Clínicas, Sanatorios y Hospitales Privados / Cirugía Ambulatoria', 'Disposición DDMS01-2026-00001098', true);


-- =============================================================
-- ARTÍCULOS: GERIÁTRICOS
-- =============================================================
WITH tip AS (SELECT id FROM informe_tipologia WHERE nombre = 'Geriátricos')
INSERT INTO informe_items (tipologia_id, nro, descripcion, grupo, subgrupo, orden, activo)
SELECT tip.id, t.nro, t.descripcion, t.grupo, t.subgrupo, t.orden, true
FROM tip, (VALUES

  -- REQUISITOS GENERALES EDILICIOS
  ('8.0',     'Establecimientos con internación. Excepto los Hogares de Residencia, tendrán como mínimo las siguientes dependencias: habitaciones; baños; comedor, sala de estar-usos múltiples; consultorio interno y office de enfermería; cocina; despensa; lavadero con tendedero; patio o jardín. Todas las circulaciones y conexiones entre las distintas dependencias deberán ser cubiertas y cerradas.',
              'Requisitos Generales', 'Edilicio', 1),
  ('9.0',     'Establecimientos sin internación. Dispondrán de espacios de uso común (estar, comedor-usos múltiples) con sanitarios en proporción y dimensiones conforme a lo establecido por el Código de Edificación de la localidad, o en subsidio por el vigente en la Municipalidad de Córdoba. Asimismo dispondrán de espacios destinados a alimentación, depósitos de despensa, de elementos diversos de uso y de materiales de limpieza. Dispondrán de espacios separados de los de uso común, destinados al descanso y recreación de los usuarios.',
              'Requisitos Generales', 'Edilicio', 2),
  ('12.0',    'Acceso peatonal. Como regla, deberá implementarse al nivel de la vereda. Se admitirán escalones como excepción, y su aceptación estará condicionada al análisis técnico respectivo. No se aceptarán puertas giratorias como ingreso al edificio.',
              'Requisitos Generales', 'Edilicio', 3),

  -- CIRCULACIONES — GENERALES
  ('13.a.1',  'Queda prohibida la presencia de materiales de terminación de fácil combustión y/o inflamables, en pisos, paredes y techos; y de todo obstáculo que pueda generar accidentes en el desplazamiento de los residentes, o impedir el paso cómodo de la silla de ruedas y/o camilla.',
              'Circulaciones', 'Generales', 4),
  ('13.a.3',  'Los materiales con los que estén construidos los pisos, deberán ser de fácil limpieza, preferentemente antideslizante (siempre que mantengan en el tiempo sus características iniciales).',
              'Circulaciones', 'Generales', 5),
  ('13.a.4',  'Los pasamanos rígidos ubicados en sus laterales, a una altura entre 0,80 a 1,00 m. del NPT (nivel del piso terminado). La sección transversal será de 1" y 1/2. Su terminación será uniforme, suave al tacto y de fácil limpieza. En las zonas de desniveles, el pasamanos acompañará la inclinación de los mismos.',
              'Circulaciones', 'Generales', 6),
  ('13.a.5',  'La iluminación se dispensará mediante artefactos con la intensidad lumínica suficiente para visualizar correctamente el recorrido, tanto en circulaciones verticales como horizontales. El encendido de los artefactos por comando (tecla) de fácil accesibilidad e identificación, se ubicará entre 0,90 a 1,20 m. del NPT.',
              'Circulaciones', 'Generales', 7),
  ('13.a.6',  'La luz de emergencia deberá desplegarse en todo el recorrido, e iluminarlo en su totalidad. Asimismo deberá haber carteles indicadores del recorrido de salida de emergencia.',
              'Circulaciones', 'Generales', 8),

  -- CIRCULACIONES — HORIZONTALES
  ('13.b',    'Las circulaciones horizontales deberán tener un ancho mínimo de 1,00 m. hasta 30 residentes. Los desniveles existentes se salvarán con planos inclinados -rampas-, cuyo ancho mínimo deberá ser de 1,10 mts, pendiente máxima 1:12.',
              'Circulaciones', 'Horizontales', 9),

  -- CIRCULACIONES — VERTICALES
  ('13.c',    'Circulaciones verticales. El acceso a la escalera será a través de las dependencias principales o centrales del edificio, o desde su acceso si así fuera factible conforme el plano presentado. Cumplirá con los requisitos para escalera de primera. Su ancho mínimo será de 1,10 m., el que se mantendrá en todo el recorrido. Los tramos rectos -entre los descansos- no tendrán más de 10 escalones. Los escalones deberán contar con pedadas antideslizantes (pedada mínima 0,26 m.; alzada máxima 0,18 m.) con aristas evidenciadas con material que permita su fácil identificación al ascender o descender y pasamanos sobre ambos laterales. También deberán contar con puertas de protección de 0,90 m. de altura mínima, ubicadas en los arranques superior e inferior de la escalera. Las puertas contarán con un pasador de seguridad, y con apertura en el sentido de la evacuación. No se aceptarán las construidas en madera, o de cualquier otro material de riesgo. No se admitirán escalones compensados o en abanico.',
              'Circulaciones', 'Verticales', 10),

  -- RAMPAS Y ASCENSOR
  ('14.0',    'Rampas. Las rampas deberán cumplir con los siguientes requisitos: a) Estar construidas en albañilería u hormigón; con una pendiente de hasta 12% (sube 12 cm. por cada metro de recorrido horizontal). b) El ancho mínimo será de 1,10 m. c) En el inicio, en el final, y en los cambios de dirección o tramos (máximo hasta 15 m.), deberá existir un descanso o rellano igual al ancho de la misma. d) Contar con puertas de protección, accesorios de seguridad, iluminación y revestimientos de características iguales a las señaladas para la escalera.',
              'Rampas y Ascensor', 'Rampas', 11),
  ('15.0',    'Circulaciones mecanizadas. Ascensor. Los establecimientos que posean más de una planta deberán contar con ascensor. Respecto del mismo se exigirá: a) Certificado de habilitación de uso, otorgado por autoridad competente. b) Constancia mensual de mantenimiento, emitida por control responsable. c) Capacidad mínima para una silla de ruedas y acompañante. d) Localización visual y sonora del coche, interior y exterior o palier. e) El ancho mínimo de acceso -luz libre- permitirá el paso de silla de ruedas. f) La puerta se identificará -simbología y ventanilla-, con seguro de apertura externa. g) Señal de orientación del piso en el cual se estaciona el coche. h) Materiales de revestimiento: no combustibles ni inflamables, de superficies lisas e impermeables. i) Iluminación que permita la visualización de los comandos y de la superficie de desplazamiento.',
              'Rampas y Ascensor', 'Ascensor', 12),

  -- PREVENCIÓN Y SEGURIDAD
  ('16.0',    'Prevención y Seguridad edilicia. El establecimiento geriátrico privado deberá contar en uso y funcionamiento con los siguientes elementos: a) Detectores de humo/temperatura y de fugas de gas. b) Luz de emergencia. c) Extintores. d) Llamadores por cama. e) Disyuntores y llaves térmicas. f) Llaves principal de gas. En las circulaciones involucradas en el recorrido de la evacuación, no se admitirán revestimientos combustibles o inflamables o de riesgo (ej.: maderas sin impregnación ignífuga, telgopor, plásticos, alfombras, nylon, poliéster, etc.). Deberá presentar el Rol de incendio y el Plan de evacuación edilicia, aprobados por autoridad competente.',
              'Prevención y Seguridad', NULL, 13),
  ('17.0',    'Protección de vacíos en el conjunto edificio. Este requisito será de carácter obligatorio para establecimientos con Asistencia Psicogeriatría. Deberán protegerse con defensas de alambre artístico, todos aquellos espacios que involucren riesgo (balcones, ventanas, terrazas, escaleras, vacíos entre niveles, etc.).',
              'Prevención y Seguridad', NULL, 14),

  -- AMBIENTES
  ('23.0',    'Superficie de las dependencias. Deberá existir una relación entre la superficie mínima de las dependencias y el número de adultos mayores alojados, conforme los siguientes requerimientos: a) Comedor: 1,20 m² por persona, con posibilidad de brindar servicio simultáneo a la totalidad de los adultos mayores alojados. Si existieren en el establecimiento comedores ubicados en los diferentes pisos, será necesario un carro transportador, ascensor/es, y/o montacarga u office de distribución de comidas por nivel. b) Estar: 2,00 m² por persona, deberán tener capacidad para albergar como mínimo y de modo simultáneo a los dos tercios del total de adultos mayores alojados. c) Las áreas descubiertas comunes, tendrán una superficie mínima de 1,00 m² por residente. Contarán con jardines, patio embaldosado, y/o superficies como terrazas; accesibles y debidamente equipados para su uso y con el mobiliario apropiado como mesas, bancos y sillas.',
              'Ambientes', 'Superficies', 15),
  ('24.0',    'Iluminación y ventilación. Todos los ambientes deberán cumplir, en lo referente a iluminación y ventilación de estas dependencias, con el coeficiente exigido para local de primera, proporcionada de forma directa, en lo posible permitiendo visuales a los espacios abiertos circundantes.',
              'Ambientes', 'Iluminación y Ventilación', 16),
  ('25.0',    'Terminaciones. Deberán cumplir con los siguientes requisitos: a) Pisos antideslizantes con terminaciones que mantengan esa característica en el tiempo. b) Pisos comunes (excepto esmaltados o pulidos): conformarán una superficie lisa sin saltos o desniveles, de fácil limpieza y sin tratamiento que los transformen en resbaladizos o impliquen riesgo de caídas. c) Pisos de madera: garantizarán impermeabilidad, facilidad de limpieza, y protección contra fuego. Los pisos con cámara de aire no serán admitidos. d) Muros con terminación lisa, preferentemente de revoque fino a la cal o yeso, con pintura lavable. e) Cielorrasos de superficie continua sin perforaciones, de material (a la cal o yeso), o prefabricados que reúnan las características adecuadas.',
              'Ambientes', 'Terminaciones', 17),

  -- HABITACIONES
  ('27.0',    'Habitaciones. Las habitaciones deberán estar vinculadas de acuerdo a criterios de funcionalidad acordes al giro prestacional de este tipo de establecimientos. Las habitaciones tendrán una capacidad de hasta cuatro (4) plazas, con una superficie mínima por residente de 4,50 m², con un cubaje mínimo por residente de 15 m³. Se admitirá hasta un 10% de tolerancia en el total del cubaje. El lado mínimo será de 2,50 m, en tanto que la altura mínima de las mismas será la establecida en las normas de jurisdicción municipal. En el ingreso a cada habitación deberá colocarse un cartel que indique el número de la misma y su capacidad.',
              'Habitaciones', NULL, 18),

  -- ENFERMERÍA Y CONSULTORIO
  ('29.0',    'Área de enfermería. Deberá cumplir con los requisitos: 1) El área destinada a enfermería, deberá contar con la siguiente superficie mínima, de acuerdo a la cantidad total de alojados: 1.a) Hasta 50 plazas: 4,00 m². 1.b) Más de 50 y hasta 100 plazas: 9,00 m². 1.c) Más de 100 plazas: por cada 50 plazas, una estación de 4,00 m². 2) Tendrá adecuada ventilación, que permita la renovación continua del aire; en el caso de que existan ventanas al exterior, es obligatorio su revestimiento con tela mosquitera. 3) Las paredes de esta área serán lisas e impermeables hasta 2,00 m. del NPT. Los pisos y zócalos deberán estar construidos con materiales resistentes al uso y de fácil limpieza. Los cielorrasos deberán ser lisos, continuos y sin perforaciones. 4) Equipamiento: 4.a) Mesada de trabajo con bacha provista de agua fría y caliente. 4.b) Mobiliario para el guardado de medicamentos, con exhibidor/ordenador para los medicamentos de uso diario y que posibilite el archivo para el registro de las historias clínicas de cada residente.',
              'Enfermería y Consultorio', 'Enfermería', 19),
  ('30.0',    'Consultorio Médico. Deberá cumplir con los siguientes requisitos: a) Tendrá las siguientes proporciones como mínimo: Superficie: 7,50 m²; Lado mínimo de 2,50 mts; Altura mínima de 2,40 mts. b) Contará con el siguiente equipamiento: b.1) Pileta o lavamanos. b.2) Baño de uso exclusivo. c) Con respecto a las ventilaciones, terminaciones, pisos y cielorrasos, serán de aplicación los requerimientos establecidos en el artículo anterior. El consultorio médico podrá compartir el mismo espacio con el área de enfermería, siempre y cuando se asegure privacidad en el Consultorio, debiendo accederse desde Enfermería (no al contrario) y estar separado de la misma con tabicamiento cerrado de piso a techo y con puerta e incluir conducto de ventilación al exterior.',
              'Enfermería y Consultorio', 'Consultorio', 20),

  -- BAÑOS
  ('31.0',    'Baños. En todos los casos debe asegurarse la accesibilidad de los artefactos, de modo que no existan impedimentos que obstaculicen el ingreso de los adultos mayores residentes, en especial de aquellos que requieran para su desplazamiento trípodes, bastones, andadores, etc.',
              'Baños', 'General', 21),
  ('31.a',    'Estarán vinculados con el resto de las dependencias mediante circulaciones cerradas lateral y cenitalmente, no debiendo existir servidumbre de paso.',
              'Baños', 'General', 22),
  ('31.b',    'Se clasifican en: b.1) Privativos, de uso exclusivo de una habitación. b.2) Generales -abiertos al uso de todos los residentes- o compartidos. b.3) Individuales, concurrido por única persona. b.4) Colectivos, ubicados en sectores diferenciados.',
              'Baños', 'Clasificación', 23),
  ('31.c',    'Los artefactos ubicados en los baños deberán guardar relación con el número de residentes: c.1) El núcleo mínimo lo constituye un Lavamanos; un Inodoro; un Bidet o Ducha sustituta y una Ducha a piso. Deberá existir un núcleo mínimo por cada seis (6) adultos mayores residentes. El inodoro y el bidet, deberán tener un suplemento de altura para que el plano de asiento o apoyo, se sitúe a 0,47 m del NPT, en el 50% de los artefactos como mínimo. c.2) La Bañera será optativa, pero en el caso de proveerse este servicio, deberá existir una (1) cada cincuenta (50) adultos mayores residentes o fracción mayor de treinta (30).',
              'Baños', 'Artefactos', 24),
  ('32.0',    'Baño para personas con dificultades motoras. Esta área contará con un espacio libre frente a los artefactos, dentro del cual quepa un círculo de 1,50 m. de diámetro, de manera de posibilitar el giro de la silla de ruedas. Además contará obligatoriamente con: a) Lavamanos -tipo ménsula o bacha con mesada-, instalados a 0,80 m. de altura desde el piso hasta el plano superior, con luz libre vertical de 0,66 m., sin pedestal. b) Espejo sobre el lavabo, con ángulo de inclinación que permita la cómoda visualización. c) Inodoro, con acceso lateral. d) Duchas a piso, con duchador manual y flexible con comandos al alcance del residente, y piso antideslizante. e) Broncería a palanca, o cuarto de vuelta en lavamanos y ducha. f) Llamador ubicado próximo al inodoro, con recepción del llamado en tablero principal.',
              'Baños', 'Discapacidad Motora', 25),

  -- COCINA
  ('33.0',    'Cocina. Se instalará en ámbitos que no importen paso hacia ningún otro local a fin de evitar riesgo de contaminación en la preparación de alimentos.',
              'Cocina', 'General', 26),
  ('33.a',    'La superficie mínima tendrá relación con la cantidad de raciones que se provean: a.1) Hasta treinta (30) raciones: 9,00 m². a.2) Más de treinta (30) raciones: La superficie deberá incrementarse en 0,30 m² por cada ración que exceda de esa cantidad.',
              'Cocina', 'Superficie', 27),
  ('33.b',    'Esta dependencia deberá poseer iluminación natural, como mínimo en el veinte por ciento (20%) del total de su superficie.',
              'Cocina', 'Iluminación', 28),
  ('33.c',    'La ventilación natural se corresponderá a un tercio (1/3) de la superficie de iluminación.',
              'Cocina', 'Ventilación', 29),
  ('33.d',    'Deberá contar con el siguiente equipamiento: d.1) Artefacto de Cocina: Hasta 30 raciones: un (1) módulo básico industrial o semi-industrial, o como mínimo 2 artefactos tipo familiar, dotados de 18.000 a 25.000 calorías. De más de 30 raciones y hasta 50: un (1) módulo industrial básico de 4 hornallas y horno, dotado de 25.000 a 35.000 calorías. De más de 50 raciones y hasta 100: un (1) módulo industrial de 4/6 hornallas, 2 hornos y 0,25 m² de plancha o parrilla, dotado de 35.000 a 45.000 calorías. Más de 100 raciones: aumento proporcional del equipamiento conforme lo requiera la Autoridad de Aplicación.',
              'Cocina', 'Equipamiento', 30),
  ('33.e',    'Mesada de apoyo en los costados del artefacto cocina.',
              'Cocina', 'Equipamiento', 31),
  ('33.f',    'Mesada de trabajo impermeable y lavable. Su superficie tendrá relación con la cantidad de raciones: Hasta 30 raciones: superficie mínima de 0,90 m², ancho mínimo de 0,60 m libre de pileta/s. Más de 30 raciones: aumento proporcional conforme lo requiera la Autoridad de Aplicación.',
              'Cocina', 'Equipamiento', 32),
  ('33.g',    'Bacha profunda, conforme los siguientes parámetros mínimos: Un (1) artefacto de 0,40 x 0,60 x 0,35 m. de profundidad, con agua caliente y fría.',
              'Cocina', 'Equipamiento', 33),
  ('33.h',    'Bacha/s común/es (simple o doble). Si se producen hasta treinta (30) raciones, será suficiente una sola. Los muebles bajo mesada serán de materiales incombustibles, lavables y sin puertas, con estante a la vista.',
              'Cocina', 'Equipamiento', 34),
  ('35.0',    'Servicio de alimentación concesionado a terceros. En estos casos se dispondrá de un módulo mínimo (cocina, mesada, bacha, heladera, etc.).',
              'Cocina', 'Servicio Tercerizado', 35),
  ('36.0',    'Dependencias complementarias del área de cocina: Despensa y verdulería. Constituirán espacios cerrados, ubicados en lugares frescos, secos y ventilados, conectados bajo techo; independientes entre sí y del área de producción de cocina. Las terminaciones deberán cumplir con los mismos requisitos exigidos para el área de enfermería. Los pisos deberán contar con desagüe a cloaca. La ventilación deberá ser proporcionada por forzador o conducto. De existir aberturas al exterior, dispondrán de tela metálica de 2mm. La despensa será destinada al depósito de alimentos envasados y secos, equipada con estantería impermeable y lavable. La verdulería será destinada al depósito de alimentos semiperecederos, con tarima que aísle los productos del piso, almacenados en canastos y con ventilación.',
              'Cocina', 'Dependencias Complementarias', 36),

  -- LAVADERO
  ('37.0',    'Lavadero. El servicio de lavadero podrá ser proporcionado por el establecimiento de modo directo o a través de la concesión a un tercero. a) Si el servicio es propio: Hasta 50 plazas: superficie mínima de 6,00 m², con un lado de 1,60 m y una altura de 2,20 m. Equipamiento: hasta 50 camas semi-industrial; más de 50 camas industrial. b) Si el servicio es concesionado a un tercero: Superficie: 3,00 m². Lado: 1,60 m. Altura: 2,20 m. La existencia del convenio de concesión deberá acreditarse adjuntando constancia de pago a través de un recibo oficial. Las terminaciones del área de lavado deberán cumplir con los mismos requerimientos exigidos para los sanitarios, además de contar con desagüe a red cloacal.',
              'Lavadero', NULL, 37),
  ('38.0',    'Dependencias complementarias del lavadero. Deberá contarse con los siguientes depósitos: a) Depósito para ropa sucia, con desagüe a cloaca: Hasta 50 plazas: lugar cerrado, superficie mínima 0,80 m², equipado con piletón de 0,40 x 0,60 x 0,35 m de profundidad, con agua fría y caliente. Ventilación por conducto a los cuatro vientos. Más de 50 plazas: similares requisitos, más una superficie mínima de 1,60 m². b) Depósito para ropa limpia. c) Depósito general, independiente y destinado a almacenar material o productos químicos, etc.',
              'Lavadero', 'Dependencias', 38),

  -- RESIDUOS
  ('39.0',    'Residuos patógenos. Deberá disponerse de un ámbito físico en el que se concentren los residuos generados, a los fines de su recolección y disposición final, cumpliéndose acabadamente con todos los requisitos generales y particulares determinados en la legislación respectiva y su reglamentación.',
              'Residuos', NULL, 39),

  -- ACONDICIONAMIENTO AMBIENTAL
  ('43.0',    'Acondicionamiento ambiental. No se admiten artefactos que puedan implicar riesgo para los residentes (consumir oxígeno, artefactos eléctricos que no cumplan las normas de seguridad, estufas que envíen emanaciones al ambiente, etc.). La circulación de aire podrá ser provista por ventilador de techo o fijo a pared, evitando las extensiones de cables y/o accesibilidad al artefacto, ubicados en todas las habitaciones y áreas comunes.',
              'Acondicionamiento Ambiental', NULL, 40),

  -- A OBSERVAR (no verificables en planos)
  ('31.d',    'Las terminaciones deberán estar realizadas con revestimiento impermeable en paredes (azulejos, cerámicos). En tanto que los pisos y zócalos deberán estar compuestos de materiales impermeables y resistentes al uso.',
              'A Observar', 'Baños', 41),
  ('31.e',    'Las puertas de ingreso tendrán un ancho mínimo -luz libre- que permita el paso de sillas de ruedas. Deben ser de apertura hacia afuera o corredizas, con cerradura de seguridad -llave maestra-, a los fines de posibilitar fácil accesibilidad en casos de rescate. Subsidiariamente, puede incorporarse un portón con apertura hacia el exterior y llave maestra, inscripto dentro de la puerta existente.',
              'A Observar', 'Baños', 42),
  ('31.f',    'La iluminación artificial sobre espejo deberá tener una potencia mínima de setenta y cinco (75) watts.',
              'A Observar', 'Baños', 43),
  ('31.g',    'La luz de emergencia deberá instalarse en al menos un baño por nivel o sector del establecimiento.',
              'A Observar', 'Baños', 44),
  ('31.h',    'Todos los artefactos deberán estar provistos de canillas mezcladoras, con agua fría y caliente. h.1) El lavamanos será de tipo ménsula o bacha con mesada, con descarga a pared, con espacio libre bajo el artefacto para el residente en silla de ruedas. h.2) El inodoro deberá instalarse con espacio suficiente en su entorno que permita el desplazamiento del residente y/o el estacionamiento de una silla de ruedas (0,80 m). h.3) La ducha a piso estará provista de un duchador manual con flexible, llave de transferencia y piso antideslizante. h.4) En el caso de existir bañera, se ubicará en baño de uso general con piso antideslizante, duchador, y como mínimo tendrá dos lados libres. h.5) El sillón para ducha será de material lavable e inoxidable, de estructura sólida, con regatones de goma en sus puntos de apoyo. h.6) En el baño deberá existir un llamador con un pulsador, cuyo llamado se registre en el tablero general. h.7) Los accesorios de seguridad -agarraderas-, serán de caño de sección redonda de 1" ½ de diámetro. En el inodoro, bidet y ducha a piso, deberán tener 0,60 m. de longitud y se instalarán a 0,20 m. del borde superior del artefacto.',
              'A Observar', 'Baños', 45)

) AS t(nro, descripcion, grupo, subgrupo, orden);


-- =============================================================
-- ARTÍCULOS: CLÍNICAS, SANATORIOS Y HOSPITALES PRIVADOS / CIRUGÍA AMBULATORIA
-- =============================================================
WITH tip AS (SELECT id FROM informe_tipologia WHERE nombre = 'Clínicas, Sanatorios y Hospitales Privados / Cirugía Ambulatoria')
INSERT INTO informe_items (tipologia_id, nro, descripcion, grupo, subgrupo, orden, activo)
SELECT tip.id, t.nro, t.descripcion, t.grupo, t.subgrupo, t.orden, true
FROM tip, (VALUES

  -- DOCUMENTACIÓN
  ('6.e',     'Plano digital (formato PDF) a escala, de ubicación y relevamiento conforme a obra del inmueble, con discriminación de áreas, indicando tamaño, destino de cada dependencia, local, aberturas, ventilación e iluminación y memoria descriptiva. Dicho plano deberá contar con rótulo que indique ubicación, nombre de establecimiento, tipología, propietario y la firma del profesional competente y con matrícula vigente.',
              'Documentación', 'Planos', 1),

  -- REQUISITOS GENERALES EDILICIOS
  ('7.b',     'Las medidas de todos los ambientes -áreas reales de uso- deberán ser adecuadas a las funciones que se realizarán en cada uno de ellos. Las áreas de circulación (pasillos y escaleras) deberán permitir libre ingreso, circulación y giro de camillas y/o sillas de ruedas. Deberán contar con rampa de acceso y/o evacuación con pendiente máxima de 12% con piso antideslizante y material incombustible.',
              'Requisitos Generales', 'Edilicio', 2),
  ('7.c',     'Los sectores destinados a la gestión de pacientes, deberán poseer muros lisos, lavables e impermeables hasta un mínimo de 1,70 metros de altura, cielorrasos secos, estancos, sin molduras o salientes y pisos lisos y lavables (no alfombrados).',
              'Requisitos Generales', 'Edilicio', 3),
  ('7.d',     'Los establecimientos con internación y/o área quirúrgica y/o áreas críticas que tengan más de una (1) planta, deberán poseer ascensor/es del tipo "montacamillas"; para el resto de los establecimientos ascensor/es con capacidad para una silla de ruedas. La Dirección General de Regulación Sanitaria podrá autorizar u otorgar plazos para el cumplimiento del presente requisito, por razones debidamente justificadas, en función del tipo de establecimiento y/o de las prácticas o especialidades que se presten en el mismo y que el edificio disponga de ambientes adecuados para uso de personas con dificultades motoras a nivel de planta baja (consultorio/s, baño/s accesible/s, etc.).',
              'Requisitos Generales', 'Edilicio', 4),
  ('7.e',     'En caso de contar con áreas de espera para público, deberán tener ventilación natural o mecánica y asientos en cantidad suficiente de acuerdo a prestaciones de cada sector. Baños: uno (1), accesible al público que permita el ingreso y libre giro de sillas de ruedas, puerta de ingreso con apertura hacia afuera o corrediza, agarraderas empotradas para el inodoro, bacha sostenida con ménsula o flotante para facilitar su uso. Todos los artefactos deberán ser aptos para discapacitados motores.',
              'Requisitos Generales', 'Edilicio', 5),
  ('7.f',     'Los consultorios destinados a la práctica de las especialidades de Tocoginecología y Urología deberán incluir baño privado individual en el consultorio o próximo al mismo, garantizando la privacidad del uso.',
              'Requisitos Generales', 'Edilicio', 6),

  -- CONSULTORIOS
  ('8.a',     'Los consultorios independientes: Estarán a cargo del profesional titular o de un Director Técnico profesional acorde a la habilitación solicitada en caso de ser propiedad de una sociedad.',
              'Consultorios', 'General', 7),
  ('8.b',     'Infraestructura Física conformada por: Consultorio (local de atención), sala de espera/recepción, baño accesible al público.',
              'Consultorios', 'General', 8),
  ('8.c',     'Deberán llevar archivo de historia clínica por paciente.',
              'Consultorios', 'General', 9),
  ('8.d',     'Deberán tener lavatorios instalados, conectados a sus correspondientes redes de provisión de agua y de desagüe cloacal. Se podrá eximir o flexibilizar el cumplimiento del presente requisito en casos debidamente justificados, posibilitando su sustitución por lavatorios portátiles o químicos en función de las prácticas o especialidades que se presten en el establecimiento.',
              'Consultorios', 'General', 10),

  -- KINESIOLOGÍA Y FISIOTERAPIA
  ('9.a',     'Infraestructura: Box mínimo de 6 m² (para un paciente y un profesional, conservando la intimidad para el paciente). Un sector preparado para un mini gimnasio con equipamiento básico para protocolos de rehabilitación, sector para espera y baño accesible. Podrá adicionar hasta 2 camas de pilates reformer para uso traumatológico o estético. Un lavabo cada cuatro boxes, o cada 2 consultorios.',
              'Kinesiología y Fisioterapia', 'Infraestructura', 11),
  ('9.b',     'Equipamiento: La aparatología necesaria para ejercer la profesión, la que deberá tener las aprobaciones de organismos nacionales (ANMAT) o internacionales, presentar habilitación de radiofísica sanitaria en caso de poseer aparatología láser, IPL; y calibraciones periódicas fijadas por normativas vigentes. La conexión eléctrica para los aparatos y líneas de conducción deberán ser suficientes para las necesidades de los mismos.',
              'Kinesiología y Fisioterapia', 'Equipamiento', 12),
  ('9.c',     'Diseño: Ubicación del sector en planta baja. Facilidades para el desplazamiento, evitando largos recorridos y puertas pesadas. De existir rampas para salvar desniveles, las mismas deberán poseer una pendiente en función de la superficie a salvar; se recomiendan las de 8,33%. La dimensión de los espacios dependerá siempre del número de usuarios. En el caso que la actividad se desarrolle en una planta diferente a la baja, el acceso a la misma deberá ser por medio mecánico con capacidad para silla de ruedas.',
              'Kinesiología y Fisioterapia', 'Diseño', 13),
  ('9.d',     'Ventilación e iluminación con nivel de confort acorde a la función (de extrema importancia en áreas de rehabilitación física).',
              'Kinesiología y Fisioterapia', 'Ventilación', 14),
  ('9.e',     'Pisos antideslizantes y todas las terminaciones interiores deben ser revestimientos o tratamientos superficiales duros y resistentes y con bajo requerimiento de mantenimiento, debido a la circulación de sillas de ruedas, camillas y bastones.',
              'Kinesiología y Fisioterapia', 'Terminaciones', 15),
  ('9.f',     'Los vestíbulos y pasos de circulación deberán poseer barrales pasamanos de diámetro no inferior a 1½ pulgadas, ubicadas a una altura entre 0,80 a 0,90 mts y agarraderas fijadas firmemente.',
              'Kinesiología y Fisioterapia', 'Circulación', 16),

  -- ODONTOLOGÍA
  ('10.0',    'El local destinado a la atención deberá tener una superficie mínima de 6 m² con un lado mínimo de dos (2) metros. Deberá tener muros lisos, lavables, cielorrasos estancos, sin molduras o salientes y pisos lavables; los de madera deberán ser plastificados. Contará con el siguiente equipamiento: a) Sillón dental con unidad de turbina, micromotor, torno, jeringa, suctor. b) Salivadera con circulación de agua y con desagüe conectado a la red pública o fuente de agua segura. c) Sistema de esterilización adecuado al nivel de complejidad. d) Sistema de iluminación dirigida. e) Variedad de instrumental mínimo necesario. f) Compresor protegido y aislado acústicamente. g) De poseer equipo de rayos X, su instalación deberá cumplir con la habilitación del equipamiento y locales por autoridad competente. h) Mobiliario y mesadas de terminaciones lavables en todas sus caras; lisos, que permitan su fácil limpieza. Cortinas lisas y lavables.',
              'Odontología', NULL, 17),

  -- FONOAUDIOLOGÍA
  ('11.a',    'Deberá contar con el equipamiento necesario de acuerdo a los estándares de buenas prácticas en la atención profesional.',
              'Fonoaudiología', NULL, 18),
  ('11.b',    'El Gabinete para prácticas audiológicas debe tener una superficie mínima de 3 m² (1,50 m x 2 m como mínimo y 2,10 m de alto) independiente del área de comando. El nivel de ruido interno con la puerta cerrada no debe superar los 40 db.',
              'Fonoaudiología', 'Gabinete', 19),
  ('11.c',    'La aparatología utilizada para realizar diagnóstico fonoaudiológico debe tener las calibraciones periódicas fijadas bajo normas internacionales y los certificados de dichas calibraciones deben obrar en poder del profesional para ser presentados ante la autoridad que lo requiera.',
              'Fonoaudiología', 'Equipamiento', 20),

  -- CENTRO DE SALUD AMBULATORIA
  ('12.a',    'Contar con mecanismos de referencia y contrarreferencia.',
              'Centro de Salud Ambulatoria', NULL, 21),
  ('12.b',    'Convenio con Servicio de Emergencias habilitado.',
              'Centro de Salud Ambulatoria', NULL, 22),
  ('12.c',    'Listado de prácticas que se realicen en el Centro.',
              'Centro de Salud Ambulatoria', NULL, 23),
  ('13.0',    'Deberán contar con instalaciones, equipos, instrumental adecuado a su perfil prestacional que no requiere internación. Los Centros incluidos en esta reglamentación realizarán exclusivamente prácticas ambulatorias no intervencionistas.',
              'Centro de Salud Ambulatoria', NULL, 24),

  -- CIRUGÍA AMBULATORIA
  ('16.0',    'Los quirófanos de intervención de los Centros de Cirugía Mayor Ambulatoria deberán cumplimentar los requerimientos definidos en los Artículos 31 y 32 de la presente y solo podrán realizar cirugía ambulatoria en el marco de lo establecido en las definiciones de Cirugía Mayor Ambulatoria y en las prácticas que la Dirección General de Regulación Sanitaria disponga.',
              'Cirugía Ambulatoria', 'Mayor Ambulatoria', 25),
  ('17.a',    'Cirugía Menor Ambulatoria – Sala de Procedimientos: Ser un local independiente, con una superficie mínima de nueve (9) m².',
              'Cirugía Ambulatoria', 'Menor Ambulatoria', 26),
  ('17.b',    'Contará como mínimo con un área sucia dentro de la sala, con mesada y pileta y con un área limpia separada o individualizada. La mesada deberá tener las dimensiones mínimas para el lavado de equipamiento.',
              'Cirugía Ambulatoria', 'Menor Ambulatoria', 27),
  ('17.c',    'Deberá contar con lavatorio para manos.',
              'Cirugía Ambulatoria', 'Menor Ambulatoria', 28),
  ('17.d',    'Vestuario para paciente ubicado al ingreso de la sala, con mobiliario para guardado de ropa para la preparación.',
              'Cirugía Ambulatoria', 'Menor Ambulatoria', 29),
  ('17.e',    'El diseño deberá prever la circulación de camillas.',
              'Cirugía Ambulatoria', 'Menor Ambulatoria', 30),
  ('17.f',    'Si el paciente necesitara una recuperación mínima deberá contar con el espacio acorde separado con mobiliario correspondiente (camas o sillones) y acceso a baño.',
              'Cirugía Ambulatoria', 'Menor Ambulatoria', 31),
  ('18.0',    'En la sala de procedimiento que se realice Endoscopia deberá contar, además, con un local sucio separado del área limpia, que posea mesada de dimensiones acordes para el lavado de equipamiento, pileta y campana. Deberá contar con filtro por vestuarios, el ingreso será desde circulación pública técnica y se saldrá hacia el área limpia del sector.',
              'Cirugía Ambulatoria', 'Endoscopia', 32),

  -- INTERNACIÓN
  ('23.a',    'Seis (6) camas, como mínimo. Podrá contar con menos de seis camas siempre que esté debidamente justificado ante la Dirección General de Regulación Sanitaria y que cuenten con un shock room acorde a la necesidad. En estos casos se habilitará el establecimiento como Hospital de Pronta Atención.',
              'Internación', 'General', 33),
  ('23.b.1',  'Cocina Central: Deberá contar como mínimo con heladera, anafe, cocina o microondas, mesada, pileta y estantes.',
              'Internación', 'Cocina Central', 34),
  ('23.b.2',  'Contrato vigente de Servicio de Comida: deberá tener office de preparación de infusiones, distribución de comidas, lavado y guardado de vajilla.',
              'Internación', 'Servicio Tercerizado', 35),
  ('23.c',    'Los ambientes de internación deberán ser iluminados y ventilados naturalmente, además poseerán climatización artificial frío/calor. Deberá asegurarse la privacidad, el confort térmico y acústico.',
              'Internación', 'Habitaciones', 36),
  ('23.d',    'Se contará con luz central e individual para cada cama, timbre con señal acústica o luminosa en la cabecera de cada cama, accesible para el paciente en posición de decúbito y en los baños identificados.',
              'Internación', 'Habitaciones', 37),
  ('23.e',    'Las habitaciones se ajustarán en número de camas y baños a las siguientes condiciones: 1) Habitaciones de 1 o 2 camas con baño incluido accesible desde la habitación. 2) Habitaciones de 1 o 2 camas con baño intermedio. Estos baños deberán ser contiguos y de acceso privado desde las habitaciones. 3) Habitaciones de 3 o más camas con baño incluido accesible desde la habitación. Los baños deberán poseer instalación de agua corriente fría y caliente, artefactos (lavatorios, inodoro, inodoro-bidet o accesorio bidet incorporado al inodoro, ducha), accesorios (agarraderas, toallero, porta rollo, perchas y espejo) y sistema antideslizante en el piso bajo la ducha.',
              'Internación', 'Habitaciones', 38),
  ('23.f',    'Camilla transportadora, silla de ruedas y todas las camas serán de tipo ortopédico.',
              'Internación', 'Equipamiento', 39),
  ('23.g',    'Ámbito para depósito de cadáveres cuyas dimensiones mínimas permitan maniobrar y alojar una camilla y que cuente con la ventilación. Este depósito deberá ubicarse preferentemente en un área de servicio.',
              'Internación', NULL, 40),

  -- GUARDIA
  ('24.a',    'El servicio de guardia deberá tener cobertura las 24 horas del día, deberá disponer de al menos un consultorio para atenciones médicas y de enfermería.',
              'Guardia', NULL, 41),
  ('24.b',    'La ubicación en el establecimiento deberá estar preferentemente en relación directa a un ingreso.',
              'Guardia', NULL, 42),
  ('24.c',    'Contar con recepción o atención al público, sala de espera acorde a la cantidad de consultorios. Además, contará con accesibilidad directa a por lo menos un baño accesible.',
              'Guardia', NULL, 43),
  ('25.0',    'De disponer de Unidad de sostenimiento vital / shock room: Este local deberá estar en contacto directo con el servicio de guardia, con puerta en su ingreso (para garantizar privacidad). La superficie mínima por cama deberá permitir el libre giro del profesional. Independiente a esta superficie deberá contar con los sectores de apoyo y depósito de equipamientos.',
              'Guardia', 'Shock Room', 44),

  -- UCI
  ('29.a',    'Se encontrará emplazada en una zona de circulación semi restringida.',
              'UCI', 'Infraestructura', 45),
  ('29.b',    'El número de camas de la Unidad no será menor de cuatro (4). La institución deberá contar como mínimo con diez (10) camas.',
              'UCI', 'Infraestructura', 46),
  ('29.c',    'Deberá tener las mismas dependencias exigidas para las Unidades de Terapia Intensiva, a excepción de la habitación del médico de guardia y baño de personal que podrá encontrarse próximo a la unidad siempre en zona semirestringida. Sala de internación con piletas lavamanos accionadas a pie, a codo o célula electrónica, 1 cada 4 camas. Estación de enfermería con monitores y visión panorámica directa o por video a todas las camas. Área de instrumental y material estéril. Ámbito cerrado para una (1) cama a fin de aislar enfermos sépticos, excitados, con lavabo propio. Local de lavachatas con artefacto chatero y pileta, depósito de chatas y papagayos, y dos (2) contenedores con bolsas colectoras. Área de depósito de camillas y aparatos. Baño para el personal. Zona de vestuario para visitas y personal en tránsito, con pileta instalada lavamanos. Acceso directo y exclusivo, con comunicación al quirófano y sus áreas de apoyo, hermeticidad y divisiones que aseguren privacidad. Los pisos y paredes serán de materiales resistentes al uso, lisos y lavables. La temperatura será de 24° a 26°C, debiendo poseer sistema de calefacción, refrigeración, ventilación y extracción de aire con filtros.',
              'UCI', 'Infraestructura', 47),
  ('29.d',    'La superficie mínima por cama en la sala de internación será de siete con cincuenta metros cuadrados (7,50 m²).',
              'UCI', 'Superficies', 48),

  -- QUIRÓFANO
  ('31.a',    'Poseer circulación exclusiva e independiente del resto del establecimiento, conectado con el internado por trayectos cubiertos y cerrados. Se asegurará que ningún elemento u objeto dificulten la circulación y la limpieza. Este servicio dispondrá de vestuario para personal auxiliar y profesionales, lavabos para el personal interviniente, local para lavado de material sucio o procedimiento que asegure su manejo y área o sector para depósito de material estéril, individualizados y con comunicación directa al quirófano.',
              'Quirófano', 'Circulación', 49),
  ('31.b',    'La organización y funcionamiento operativo del quirófano deberá observar: 1) Las dimensiones del ámbito utilizado deberán asegurar la libre circulación de camillas y personal. 2) Las paredes serán impermeables, lisas y lavables hasta una altura mínima de dos (2) metros, revestidas con azulejos o material similar con juntas cerradas o sin juntas. Deberán evitarse ángulos vivos. 3) Los pisos deberán ser lavables, lisos y estancos y zócalos de tipo sanitario. 4) Los cielorrasos serán secos, lisos e impermeables y de una altura mínima de 3 metros. 5) Deberá existir protección electromagnética, con descarga a tierra. La instalación eléctrica de cada quirófano deberá contar con tablero de aislación y sistema de equipotencialidad. La iluminación interior no podrá ser inferior a 500 luxes y a 10.000 luxes sobre la camilla. 6) La climatización exigida será frío-calor de tipo central o por acondicionadores individuales con filtros, convencionales como mínimo o electrónicos (sistema con filtros HEPA); en lo posible deberá contar con un sistema de control de diferencia de presión. No se permitirán circuladores de aire, estufas, etc.',
              'Quirófano', 'Edilicio', 50),
  ('31.c',    'Sector de ingreso y transferencia de pacientes: será una antecámara previa al quirófano; de dimensiones suficientes para la maniobra de dos (2) camillas. Deberá poseer dos sectores destinados a: uno a la realización de anestesia y otro para la recuperación post operatoria, con comunicación directa entre ambos.',
              'Quirófano', 'Ingreso', 51),
  ('31.d',    'El ingreso del personal auxiliar y profesional será por vestuario donde se realizará el filtro, posterior a él se ubicarán los lavabos, con piletas lavamanos accionadas a pie, a codo o mediante célula electrónica. Los vestuarios podrán ser comunes con los de la Sala de Partos. El ingreso al vestuario deberá realizarse desde la circulación general o de la semi-restringida con salida a la circulación restringida de cada sector.',
              'Quirófano', 'Personal', 52),
  ('31.e',    'Sectores de apoyo: 1) Local/Sector Sucio: para lavado de instrumental y procesamiento de material sucio. Tendrá mesada y pileta. En el caso de existir dos o más quirófanos en la misma área, podrá admitirse que este office sea único siempre y cuando se determinen circulaciones independientes limpia y sucia y no se produzcan cruces entre ambas circulaciones. En caso de no contar con estas circulaciones independientes, deberá presentar un protocolo para el retiro y lavado del instrumental y procesamiento de material sucio. 2) Sector Limpio: área o sector para depósito de material estéril.',
              'Quirófano', 'Sectores Apoyo', 53),
  ('31.f',    'En casos donde el quirófano cuente con ventanas, éstas serán de paño fijo.',
              'Quirófano', 'Edilicio', 54),
  ('32.0',    'Equipamiento del quirófano. El equipamiento será acorde a la complejidad prestacional ofrecida, contando con los siguientes requisitos mínimos: a) Instrumental conforme a las especialidades practicadas. b) Electrobisturí. c) Máquina de anestesia. d) Sistema de aspiración automática. e) Laringoscopio y tubos endotraqueales. f) Botiquín básico que incluya medicación anestésica y para reanimación cardiovascular. g) Caja de traqueotomía. h) Mesa de Cirugía tipo "Mayo" o similar. i) Fuente de energía de emergencia (grupo electrógeno automático propio o general que garantice la provisión de energía no menor a 5 horas). j) Panel de gases medicinales completos. k) Monitor multiparamétrico. l) Cama, camilla o sillón quirúrgico regulable. m) Cardiodesfibrilador. n) Lámpara cialítica (fija o móvil preferentemente de luz blanca).',
              'Quirófano', 'Equipamiento', 55),

  -- SALA DE PARTO Y SERVICIO OBSTÉTRICO
  ('34.a',    'Poseerá circulación exclusiva e independiente del resto del establecimiento, conectado con el internado por trayectos cubiertos y cerrados, integrado al mismo estarán los lavabos para personal, previo filtro por vestuarios, local para lavado de material sucio y área o sector para depósito de material estéril, perfectamente individualizados y con comunicación directa a la sala de partos. El sector podrá vincularse con área de quirófano (mediante puerta esclusa, y apertura controlada) si se trata de una Institución que realice cirugía.',
              'Sala de Parto', 'Circulación', 56),
  ('34.b',    'Sala de partos: 1) Las dimensiones posibilitarán la libre circulación de camillas y personal. 2) Las paredes serán impermeables, lisas y lavables, hasta una altura mínima de 1,70 mts, revestidas con azulejos o material similar. Deberán evitarse ángulos vivos. 3) Los pisos deberán ser lavables, lisos y estancos, zócalos sanitarios. Los cielorrasos serán secos, lisos e impermeables. 4) Deberá haber protección electromagnética, con descarga a tierra. La iluminación interior no podrá ser inferior de 500 luxes y de 5.000 luxes sobre la camilla. 5) La climatización exigida será frío-calor de tipo central o por acondicionadores individuales. No se permitirá circuladores de aire, estufas, etc.',
              'Sala de Parto', 'Edilicio', 57),
  ('34.c',    'Local de recepción del recién nacido: adyacente y con conexión directa desde la sala de partos, para atención del recién nacido.',
              'Sala de Parto', 'Recién Nacido', 58),
  ('34.d',    'Sectores de apoyo: 1) Sucio: office para lavado de instrumental y procesamiento de material sucio. Tendrá mesada y pileta. 2) Limpio: área o sector para depósito de material estéril.',
              'Sala de Parto', 'Sectores Apoyo', 59),
  ('34.e',    'Sector de ingreso y transferencia: Antecámara previa a la Sala de Partos. Contará con habitaciones de pre parto con baño, en conexión directa a la antecámara para el caso de que existan dos o más Salas de Parto.',
              'Sala de Parto', 'Ingreso', 60),
  ('34.f',    'Habitaciones de pre parto: Contará con habitaciones de pre parto con baño, en conexión directa a la antecámara para el caso de que existan dos o más Salas de Parto. Cuando haya una sola sala de partos, las habitaciones de pre parto podrán ser las habitaciones del internado más próximas a la Sala de Partos y áreas de apoyo.',
              'Sala de Parto', 'Pre Parto', 61),
  ('34.g',    'Vestuarios y lavabos para médicos y personal auxiliar quirúrgico: Los vestuarios podrán ser comunes con los del quirófano. El ingreso al vestuario deberá realizarse desde la circulación general o desde la circulación semi restringida, con salida a la circulación restringida de cada sector. Los lavabos serán de uso exclusivo para Partos y distintos a los destinados al quirófano, con ingreso directo a la Sala de Partos y previo filtro por vestuario.',
              'Sala de Parto', 'Personal', 62),
  ('35.0',    'Las Salas de Trabajo de Parto, Parto y Recuperación (UTPR) deben integrarse al Servicio Obstétrico, el que se ubicará próximo al quirófano y a sus áreas de apoyo para asegurar una rápida conexión. Las UTPR deben tener circulación semi-restringida, con áreas de trabajo del personal con comunicación directa y acceso a las áreas de las pacientes. Las Salas de Trabajo de Parto, Parto y Recuperación de la madre y la Recepción y Recuperación del recién nacido deben tener oxígeno y aspiración central y asegurar temperatura por encima de los 24°C.',
              'Sala de Parto', 'UTPR', 63),
  ('36.a',    'El Servicio Obstétrico debe contar con: Vestuarios para público y profesionales con iguales características a las descriptas para la Sala de Parto. Local depósito de ropa limpia e insumos.',
              'Servicio Obstétrico', NULL, 64),
  ('36.b',    'Estación de enfermería con sector limpio y sucio, mesada, piletas y agua corriente caliente y fría.',
              'Servicio Obstétrico', NULL, 65),
  ('36.c',    'Local depósito de ropa limpia e insumos.',
              'Servicio Obstétrico', NULL, 66),
  ('36.d',    'Estar, sanitario y oficinas para el personal.',
              'Servicio Obstétrico', NULL, 67),
  ('37.a',    'Sala de Trabajo de Parto, Parto y Recuperación, propiamente dicha (T.P.R.) con una superficie mínima de veinticinco (25) metros cuadrados. Deberá tener mesada y pileta.',
              'UTPR', 'Sala TPR', 68),
  ('37.b',    'Local depósito transitorio de material sucio y/o descartable.',
              'UTPR', NULL, 69),
  ('37.c',    'Sanitario accesible para pacientes.',
              'UTPR', NULL, 70),
  ('37.d',    'Local depósito transitorio de equipamiento con una superficie mínima de seis metros cuadrados (6 m²). Esta dependencia será susceptible de cambiar su destino, afectándose a Sala de Recepción y Reanimación del recién nacido.',
              'UTPR', NULL, 71),

  -- UTI
  ('41.e',    'La Unidad de Terapia Intensiva debe estar ubicada en zona de circulación semirrestringida.',
              'UTI', 'Infraestructura', 72),
  ('41.f',    'Cuatro (4) camas de terapia intensiva; con un mínimo de doce (12) camas de internación para el establecimiento, sin contar en este último cómputo las de Terapia Intensiva, las incubadoras tanto fijas como de transporte y aquellas camas o cunas que se dediquen a la internación pediátrica con exclusividad.',
              'UTI', 'Infraestructura', 73),
  ('41.g',    'Sala de internación con piletas lavamanos accionadas a pie, a codo o célula electrónica, 1 cada 4 camas. (Puede compartirse con UCI y UCO.)',
              'UTI', 'Infraestructura', 74),
  ('41.h',    'Estación de enfermería con monitores y visión panorámica directa o por video a todas las camas. (Puede compartirse con UCI y UCO.)',
              'UTI', 'Infraestructura', 75),
  ('41.i',    'Área de instrumental y material estéril.',
              'UTI', 'Infraestructura', 76),
  ('41.j',    'Ámbito cerrado para una (1) cama a fin de aislar enfermos sépticos, excitados, con lavabo propio. (Puede compartirse con UCI y UCO.)',
              'UTI', 'Infraestructura', 77),
  ('41.k',    'Local de lavachatas con artefacto chatero y pileta, depósito de chatas y papagayos, y dos (2) contenedores con bolsas colectoras (uno para ropa sucia y otro para material descartable usado). Esta área deberá tener una superficie mínima de 3 m². (Puede compartirse con UCI y UCO.)',
              'UTI', 'Infraestructura', 78),
  ('41.l',    'Área de depósito de camillas y aparatos. (Puede compartirse con UCI y UCO.)',
              'UTI', 'Infraestructura', 79),
  ('41.m',    'Baño para el personal. (Puede compartirse con UCI y UCO.)',
              'UTI', 'Infraestructura', 80),
  ('41.n',    'Habitación para el médico de Guardia con sanitario incluido.',
              'UTI', 'Infraestructura', 81),
  ('41.ñ',    'Zona de vestuario para visitas y personal en tránsito, con pileta instalada lavamanos. (Puede compartirse con UCI y UCO.)',
              'UTI', 'Infraestructura', 82),
  ('41.o',    'Acceso directo y exclusivo, con comunicación al quirófano y sus áreas de apoyo, hermeticidad y divisiones que aseguren privacidad.',
              'UTI', 'Infraestructura', 83),
  ('41.p',    'Los pisos y paredes serán de materiales resistentes al uso, lisos y lavables. La temperatura será de 24° a 26°C, debiendo poseer sistema de calefacción, refrigeración, ventilación y extracción de aire con filtros.',
              'UTI', 'Infraestructura', 84),
  ('41.q',    'En caso de existir otras unidades de Medicina Crítica (UCO-UCI) cuando se encuentren ubicadas en el mismo piso y contiguas, podrán compartir las áreas señaladas como g), h), j), k), l), m), n) y ñ) siempre que no exista tránsito entre las unidades, para cumplir con la normativa de bioseguridad.',
              'UTI', 'Infraestructura', 85),
  ('41.r',    'La Sala de Internación tendrá una superficie mínima de 36 m², siendo el área mínima por cama de 9 m² y el cubaje 23 m³.',
              'UTI', 'Superficies', 86),
  ('41.s',    'Contará con camas de tipo ortopédico o articuladas, doble comando por los pies, laterales, cabecera y pies rebatibles para tener libre acceso desde las cuatro posiciones. Serán rodantes y con plano de apoyo rígido.',
              'UTI', 'Equipamiento', 87),

  -- UCO
  ('49.1',    'En todo lo que no se encuentre específicamente normado en este acápite, será de aplicación subsidiaria por remisión lo dispuesto para las Unidades de Terapia Intensiva.',
              'UCO', NULL, 88),
  ('49.2',    'Con relación al número mínimo de camas exigidas, se tendrá en consideración la distribución geográfica de las otras Unidades de Terapia Intensiva o Coronaria adyacentes, de modo que dos (2) o más establecimientos de la misma localidad o localidades distantes a no más de 30 Km., entre sí, se asocien para alcanzar el número de camas exigido. La Unidad funcionará en una de las Instituciones que posea todos los requisitos exigidos para contenerla y la de mayor número de camas propias.',
              'UCO', NULL, 89),

  -- UTIP
  ('52.a',    'Deberán contar con los mismos espacios físicos requeridos a las Unidades de Terapia Intensiva, con el anexo de un espacio destinado a la preparación de fórmulas lácteas. Sala de internación con piletas lavamanos accionadas a pie, a codo o célula electrónica, 1 cada 4 camas. Estación de enfermería con monitores y visión panorámica directa o por video a todas las camas. Ámbito cerrado para una (1) cama a fin de aislar enfermos sépticos, excitados, con lavabo propio. Local de lavachatas con artefacto chatero y pileta, depósito de chatas y papagayos, y dos (2) contenedores con bolsas colectoras. Área de depósito de camillas y aparatos. Baño para el personal. Zona de vestuario para visitas y personal en tránsito, con pileta instalada lavamanos. Espacio destinado a la preparación de fórmulas lácteas.',
              'UTIP', 'Infraestructura', 90),
  ('52.b',    'La sala de internación tendrá una superficie según sea el número de camas, cunas o incubadoras que posea. La superficie mínima por incubadora y/o cuna será de tres (3) metros cuadrados y para camas pediátricas de seis (6) metros cuadrados.',
              'UTIP', 'Superficies', 91),

  -- UTIN
  ('56.a',    'Debe emplazarse en una zona de circulación semirrestringida.',
              'UTIN', 'Infraestructura', 92),
  ('56.b',    'El número mínimo de unidades de internación será de 4 entre incubadores y/o cunas.',
              'UTIN', 'Infraestructura', 93),
  ('56.c',    'Deberá contar con los ámbitos físicos solicitados a las Unidades de Terapia Intensiva, además de los siguientes: Local depósito para incubadoras, cunas, aparatos, etc. Local para ropa sucia y material usado. Local de fraccionamiento fórmulas lácteas. Área de depósito de ropa limpia. Sala de médicos. Sala de internación con piletas lavamanos accionadas a pie, a codo o célula electrónica, 1 cada 4 camas. Estación de enfermería con monitores y visión panorámica directa o por video a todas las unidades. Local de lavachatas con artefacto chatero y pileta, depósito de chatas y papagayos, y dos (2) contenedores con bolsas colectoras. Área de depósito de aparatos. Baño para el personal.',
              'UTIN', 'Infraestructura', 94),
  ('56.d',    'La sala de internación tendrá sectores claramente diferenciados por paredes o por material liviano desmontable, que permita separar a los pacientes de acuerdo a la complejidad de su patología.',
              'UTIN', 'Infraestructura', 95),
  ('56.e',    'Área de aislamiento para dos (2) unidades, como mínimo, con las mismas características antes descriptas.',
              'UTIN', 'Infraestructura', 96),
  ('56.f',    'La sala de internación tendrá dos (2) piletas: limpia para lavado de manos con exclusividad y sucia para lavado de materiales. Las canillas serán accionadas a codo, pie o electricidad. Deberá tener dispensadores para jabón líquido y para toallas de papel.',
              'UTIN', 'Infraestructura', 97),
  ('56.g',    'El lugar para que visitas y personal de tránsito se vistan antes de entrar deberá tener pileta lavamanos, dispensadores de jabón líquido, toallas de papel y armarios con llave para guardado de ropa.',
              'UTIN', 'Infraestructura', 98),
  ('56.h',    'El local depósito de incubadoras, cunas, aparatos, etc. deberá tener superficie suficiente para que, además, permita realizar tareas de mantenimiento de los equipos depositados.',
              'UTIN', 'Infraestructura', 99),
  ('56.k',    'La sala de internación tendrá una superficie según sea el número de cunas e incubadoras que posea. La superficie mínima por incubadora y/o cuna será de 2 a 3 metros cuadrados, con separación por los cuatro lados entre cada una de 1,30 a 1,50 metros, según modelo de incubadora.',
              'UTIN', 'Superficies', 100),
  ('56.l',    'La iluminación podrá ser artificial, debiendo contar con una fuente central y fuentes individuales difusas. En caso de poseer ventanas al exterior estas serán de paño fijo y vidrio esmerilado.',
              'UTIN', 'Infraestructura', 101),
  ('57.0',    'Las Unidades de Terapia Intensiva Neonatal que funcionen como establecimiento único e independiente, deberán poseer quirófano y sus áreas de apoyo, prestaciones de Diagnóstico por Imágenes, de Laboratorio y de Hemoterapia.',
              'UTIN', NULL, 102),
  ('59.0',    'Las Unidades de Terapia Intensiva Neonatal que funcionen como establecimientos únicos e independientes deberán poseer un local de dimensiones apropiadas para depósito de cadáveres. Deberá estar perfectamente ventilado y en un área de servicio. Además deberán poseer local de esterilización con estufa y autoclave.',
              'UTIN', NULL, 103),

  -- HEMODINAMIA
  ('65.0',    'Los servicios de Hemodinamia deberán tener acceso al quirófano general del establecimiento y contarán con una sala de Hemodinamia de iguales características a las descriptas para quirófanos y áreas de apoyo requeridas en esta reglamentación, a la que se sumará una sala de radiología con sus dependencias propias. El quirófano dedicado a Hemodinamia tendrá una superficie mínima de treinta y cinco (35) metros cuadrados. Los servicios de Hemodinamia cumplirán con normas de bioseguridad, circulación del personal y de provisión de elementos.',
              'Hemodinamia', NULL, 104),

  -- CUIDADOS PALIATIVOS
  ('72.a',    'Estos establecimientos podrán albergar pacientes de ambos sexos con una capacidad mínima de cinco (5) camas.',
              'Cuidados Paliativos', 'Infraestructura', 105),
  ('72.b',    'Deberá conformar una unidad de uso independiente y estar destinado en forma única y exclusiva a los efectos de todo lo que involucran los cuidados paliativos.',
              'Cuidados Paliativos', 'Infraestructura', 106),
  ('72.c',    'Puede tener comunicación con otros usos cuando forme parte de una institución polivalente habilitada. En estos casos, deberá guardar la privacidad de los desplazamientos y asegurar accesos y salidas absolutamente independientes. La Unidad de Cuidados Paliativos puede compartir otros usos con el polivalente tales como servicios generales de mantenimiento, gas natural, cloacas, agua corriente, energía eléctrica, etc.',
              'Cuidados Paliativos', 'Infraestructura', 107),
  ('72.d',    'Los ambientes de internación de pacientes deberán ser iluminados y ventilados naturalmente, poseerán climatización artificial frío/calor. Además, deberá asegurarse la privacidad, el confort térmico y acústico.',
              'Cuidados Paliativos', 'Infraestructura', 108),
  ('72.f',    'Áreas de circulación -pasillos y escaleras- deberán tener iluminación adecuada.',
              'Cuidados Paliativos', 'Infraestructura', 109),
  ('72.g',    'Cada habitación tendrá un lugar de guardado (armario/locker) de las pertenencias del paciente y mesa hospitalaria regulable. Habitaciones de 1 o 2 camas con baño incluido accesible desde la habitación. Habitaciones de 1 o 2 camas con baño intermedio. Estos baños deberán ser contiguos a las habitaciones y con acceso cubierto y cerrado.',
              'Cuidados Paliativos', 'Habitaciones', 110),
  ('72.h',    'Los baños deberán poseer instalación de agua corriente, fría y caliente, artefactos (lavatorios, inodoro, inodoro-bidet o accesorio bidet incorporado al inodoro, ducha), accesorios (agarraderas, toallero, porta rollo, perchero y espejo) y sistema antideslizante, en el piso bajo la ducha.',
              'Cuidados Paliativos', 'Baños', 111),
  ('72.j',    'Un ámbito para depósito de cadáveres cuyas dimensiones mínimas permitan maniobrar y alojar una camilla con la ventilación adecuada. Este depósito deberá ubicarse preferentemente en un área de servicio.',
              'Cuidados Paliativos', NULL, 112),

  -- ONCOLOGÍA
  ('75.a',    'Oficina Administrativa y/o área de recepción para la admisión de pacientes y recepción de medicamentos.',
              'Oncología', 'Infraestructura', 113),
  ('75.b',    'Sala de Espera no menor a 9 m² con iluminación y ventilación natural y/o artificial suficiente.',
              'Oncología', 'Infraestructura', 114),
  ('75.c',    'Baño Accesible público en conexión sala de espera, como mínimo con un sanitario adecuado para el uso de personas con capacidades reducidas, que permita el giro libre de una silla de ruedas.',
              'Oncología', 'Infraestructura', 115),
  ('75.d',    'Consultorios: dos (2) consultorios para revisión de pacientes. Los mismos deberán contar con un lavatorio instalado para el lavado de manos del profesional entre pacientes.',
              'Oncología', 'Infraestructura', 116),
  ('75.e',    'Lavadero (o convenio de servicio).',
              'Oncología', 'Infraestructura', 117),
  ('75.f',    'Central de esterilización (o convenio de servicio).',
              'Oncología', 'Infraestructura', 118),
  ('75.g',    'Laboratorio Bioquímico (o convenio de servicio).',
              'Oncología', 'Infraestructura', 119),
  ('75.h',    'Habitación o cama con elementos de privacidad de recuperación: habitación o cama destinada al paso transitorio para pacientes.',
              'Oncología', 'Infraestructura', 120),
  ('75.i.1',  'Sala de Tratamiento oncológico: ámbito donde se lleva a cabo la administración de las Drogas Oncológicas a los pacientes ambulatorios. Baño accesible: deberá contar como mínimo con un baño adecuado para personas con movilidad reducida con ingreso desde la sala de tratamiento.',
              'Oncología', 'Sala Tratamiento', 121),
  ('75.i.2',  'Office de Enfermería: con visión panorámica directa o por video a todos los puestos. Contará con mesada limpia y sucia, esta última como mínimo con pileta profunda. Deberá estar en relación directa y por medio de ventana, con el local de preparación de medicación oncológica.',
              'Oncología', 'Sala Tratamiento', 122),
  ('75.i.3',  'Vestuario general para personal, paciente y acompañante: deberá ubicarse al ingreso. Lavamanos: deberá ubicarse una pileta profunda al ingreso de la sala y luego del vestuario. Depósito de ropa limpia. Depósito de ropa sucia.',
              'Oncología', 'Sala Tratamiento', 123),
  ('75.i.4',  'Puestos: La superficie mínima por cada puesto será de 5 m², el ancho mínimo será de 1,80 mts. Se sugiere dejar espacio para acompañante y separar los puestos con algún elemento de protección visual como mínimo. Esta superficie es exclusiva para el puesto, no incluye circulación general. Uno de los puestos deberá ser aislado.',
              'Oncología', 'Sala Tratamiento', 124),
  ('75.i.5',  'Zona para preparación de medicamentos oncológicos: ámbito independiente que deberá comunicarse directamente con el office de enfermería. Contará con: Vestuario personal al ingreso. Lavamanos: pileta profunda al ingreso luego del vestuario. Sector de depósito limpio con mesada y pileta.',
              'Oncología', 'Preparación Medicamentos', 125),

  -- DIÁLISIS
  ('80.a',    'Sala de diálisis.',
              'Diálisis', 'Infraestructura', 126),
  ('80.b',    'Sala o sector individualizado con baño para pacientes infectocontagiosos o con indicación de aislamiento.',
              'Diálisis', 'Infraestructura', 127),
  ('80.c',    'Sanitarios en la Unidad, en cada sala, deben diferenciarse en su uso para personal y para pacientes. Los sanitarios de pacientes deberán estar adecuados para el uso de discapacitados motores. Las bachas deberán posibilitar el lavado de la región del acceso vascular, 1 cada 12 puestos y otra para bioseguridad de la prestación. Puesto de enfermería en cada sala, con lavatorio y área limpia para preparación del material y con sector sucio separado.',
              'Diálisis', 'Infraestructura', 128),
  ('80.d',    'Área de depósito de materiales, con capacidad para almacenar stock de insumos y medicamentos.',
              'Diálisis', 'Infraestructura', 129),
  ('80.e',    'Consultorio.',
              'Diálisis', 'Infraestructura', 130),
  ('80.f',    'En el caso de que la unidad de diálisis funcione bajo la modalidad independiente, deberá acreditar convenio con laboratorio bioquímico habilitado.',
              'Diálisis', 'Infraestructura', 131),
  ('80.g',    'El área de recuperación de filtros de hemodiálisis deberá tener ventilación forzada y contará con capacidad suficiente para separar los filtros de los pacientes en tratamiento.',
              'Diálisis', 'Infraestructura', 132),
  ('80.h',    'La Sala de Hemodiálisis contará como mínimo con dos (2) puestos de diálisis, debiendo tener 6 m² de superficie mínima para cada uno de los puestos. Deberá existir la posibilidad de que uno de los puestos funcione para pacientes infecto-contagiosos. Este puesto se ubicará en un sector individualizado y con máquina propia, no podrá tener una superficie menor a 9 m² para un (1) puesto.',
              'Diálisis', 'Infraestructura', 133),
  ('80.i',    'La iluminación podrá ser artificial, debiendo ser adecuada para clara visión, contar con una fuente central y fuentes individuales en la cabecera de cada puesto.',
              'Diálisis', 'Infraestructura', 134),
  ('80.j',    'La temperatura ambiente deberá ser de 24°C a 26°C, debiendo poseer sistema de refrigeración-calefacción que no consuma oxígeno ambiente.',
              'Diálisis', 'Infraestructura', 135),
  ('80.k',    'Sala de reanimación o recuperación.',
              'Diálisis', 'Infraestructura', 136),
  ('80.l',    'Sala de tratamiento de agua donde puede estar el "Mixer" debidamente separado.',
              'Diálisis', 'Infraestructura', 137),
  ('80.m',    'Recinto de limpieza por sala y uno general. Las paredes y los pisos de los locales indicados deberán estar revestidos o pintados con materiales que faciliten su limpieza y desinfección.',
              'Diálisis', 'Infraestructura', 138),
  ('81.a',    'Diálisis peritoneal: Sala de diálisis peritoneal con dos (2) locales de mínimo nueve (9) m² cada uno y un baño adecuado al uso de discapacitados motores. Un local se dedicará al del procedimiento con dos (2) piletas y el otro al control (consultorio) de los pacientes.',
              'Diálisis', 'Peritoneal', 139),
  ('81.b',    'Un área aislada con baño propio para pacientes infecto-contagiosos.',
              'Diálisis', 'Peritoneal', 140),
  ('81.c',    'La temperatura ambiente será de 24°C-26°C, debiendo poseer sistema de refrigeración-calefacción que no consuma oxígeno ambiente.',
              'Diálisis', 'Peritoneal', 141),

  -- CENTRO DE ESTÉTICA CORPORAL
  ('108.0',   'Además de los requisitos generales y/o particulares referidos a consultorio o centro de salud ambulatoria, deberán desempeñarse, según el caso y conforme lo requiera la Dirección General de Regulación Sanitaria, profesionales kinesiólogos, fisioterapeutas, cosmiatras, cosmetólogos y/o demás profesiones o actividades relacionadas con el objeto del mismo, conforme la legislación vigente.',
              'Centro de Estética', NULL, 142)

) AS t(nro, descripcion, grupo, subgrupo, orden);
