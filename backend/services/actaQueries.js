const supabase = require('./supabaseClient');

async function fetchFirmas(actaId) {
  try {
    const { data, error } = await supabase
      .from('actas_firmas')
      .select('firma_base64, tipo')
      .eq('acta_id', actaId);

    if (error) {
      console.error('Error fetching firmas for acta', actaId, error);
      return {};
    }

    const result = {};
    (data || []).forEach(item => {
      if (item.tipo === 'inspector' && item.firma_base64) result.firma_inspector_base64 = item.firma_base64;
      if (item.tipo === 'responsable' && item.firma_base64) result.firma_responsable_base64 = item.firma_base64;
    });
    return result;
  } catch (err) {
    console.error('Error fetching firmas for acta', actaId, err);
    return {};
  }
}

async function fetchFotos(actaId) {
  try {
    const { data, error } = await supabase
      .from('actas_fotos')
      .select('url')
      .eq('acta_id', actaId)
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error fetching fotos for acta', actaId, error);
      return { fotos_urls: [] };
    }

    const fotos = (data || []).map((item) => item.url).filter(Boolean);
    return { fotos_urls: fotos };
  } catch (err) {
    console.error('Error fetching fotos for acta', actaId, err);
    return { fotos_urls: [] };
  }
}

async function getActaWithRelations(actaId) {
  const [actaResult, firmas, fotos] = await Promise.all([
    supabase
      .from('actas')
      .select('*, inspector:usuarios!actas_inspector_id_fkey(nombre, dni)')
      .eq('id', actaId)
      .single(),
    fetchFirmas(actaId),
    fetchFotos(actaId),
  ]);

  if (actaResult.error || !actaResult.data) {
    return { error: actaResult.error || 'Acta no encontrada' };
  }

  const merged = {
    ...actaResult.data,
    ...firmas,
    ...fotos,
  };

  if ((!merged.fotos_urls || merged.fotos_urls.length === 0) && Array.isArray(actaResult.data.fotos_urls)) {
    merged.fotos_urls = actaResult.data.fotos_urls;
  }
  if (!merged.firma_inspector_base64 && actaResult.data.firma_inspector_base64) {
    merged.firma_inspector_base64 = actaResult.data.firma_inspector_base64;
  }
  if (!merged.firma_responsable_base64 && actaResult.data.firma_responsable_base64) {
    merged.firma_responsable_base64 = actaResult.data.firma_responsable_base64;
  }

  return merged;
}

async function replaceFotos(actaId, urls) {
  if (!Array.isArray(urls)) return;

  const { error: deleteError } = await supabase
    .from('actas_fotos')
    .delete()
    .eq('acta_id', actaId);

  if (deleteError) throw deleteError;

  if (urls.length === 0) return;

  const rows = urls.map((url, index) => ({ acta_id: actaId, url, orden: index }));
  const { error: insertError } = await supabase
    .from('actas_fotos')
    .insert(rows);

  if (insertError) throw insertError;
}

async function upsertFirma(actaId, tipo, firmaBase64) {
  if (!firmaBase64) return;

  const { data: existing, error: selectError } = await supabase
    .from('actas_firmas')
    .select('id')
    .eq('acta_id', actaId)
    .eq('tipo', tipo)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    throw selectError;
  }

  if (existing && existing.id) {
    const { error } = await supabase
      .from('actas_firmas')
      .update({ firma_base64: firmaBase64 })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('actas_firmas')
      .insert({ acta_id: actaId, tipo, firma_base64: firmaBase64 });
    if (error) throw error;
  }
}

module.exports = { fetchFirmas, fetchFotos, getActaWithRelations, replaceFotos, upsertFirma };
