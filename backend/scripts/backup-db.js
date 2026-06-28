require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const supabase = require('../services/supabaseClient');

const TABLES = [
  'usuarios',
  'actas',
  'actas_respuestas',
  'actas_fotos',
  'actas_firmas',
  'informes',
  'informe_items',
  'template_tipologia',
  'template_secciones',
  'template_campos',
  'informe_tipologia',
  'encabezado_config',
  'informe_items',
];

const BACKUP_DIR = path.join(__dirname, '..', 'backups', new Date().toISOString().split('T')[0]);

async function backup() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  for (const table of TABLES) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.warn(`[WARN] ${table}: ${error.message}`);
        continue;
      }
      const filePath = path.join(BACKUP_DIR, `${table}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data || [], null, 2), 'utf8');
      console.log(`[OK] ${table}: ${(data || []).length} rows → ${filePath}`);
    } catch (err) {
      console.warn(`[WARN] ${table}: ${err.message}`);
    }
  }

  // Schema SQL export via information_schema
  try {
    const { data: tables } = await supabase.rpc('get_schema_sql');
    if (tables) {
      fs.writeFileSync(path.join(BACKUP_DIR, 'schema.sql'), tables, 'utf8');
      console.log(`[OK] schema.sql → ${BACKUP_DIR}`);
    }
  } catch {
    console.log('[INFO] schema export via RPC not available, skipping');
  }

  console.log(`\nBackup complete: ${BACKUP_DIR}`);
}

backup().catch(console.error);
