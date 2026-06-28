require('dotenv').config();
const fs = require('fs');
const path = require('path');
const supabase = require('../services/supabaseClient');
const BACKUP_DIR = path.join(__dirname, '..', 'backups', new Date().toISOString().split('T')[0]);

async function backupActas() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  // Try simple select with limit, no order-by to avoid timeout
  const { data, error } = await supabase
    .from('actas')
    .select('*')
    .limit(200);

  if (error) {
    console.error('Error selecting actas:', error.message);
    return;
  }

  fs.writeFileSync(path.join(BACKUP_DIR, 'actas.json'), JSON.stringify(data, null, 2), 'utf8');
  console.log(`actas: ${data?.length || 0} rows (no order, first 200)`);
}

backupActas().catch(console.error);
