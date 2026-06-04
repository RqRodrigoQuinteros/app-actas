-- Backfill: copia firmas viejas de actas a actas_firmas
-- Ejecutar DESPUES de migration_firmas.sql

INSERT INTO actas_firmas (acta_id, tipo, firma_base64)
SELECT id, 'inspector', firma_inspector_base64
FROM actas
WHERE firma_inspector_base64 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM actas_firmas WHERE acta_id = actas.id AND tipo = 'inspector');

INSERT INTO actas_firmas (acta_id, tipo, firma_base64)
SELECT id, 'responsable', firma_responsable_base64
FROM actas
WHERE firma_responsable_base64 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM actas_firmas WHERE acta_id = actas.id AND tipo = 'responsable');
