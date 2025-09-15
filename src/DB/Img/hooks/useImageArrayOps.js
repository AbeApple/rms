import { supabase } from "../../Supabase"

// Reusable image array operations for uploader/editor
// Config expects: { table, bucket, userId, itemID, itemIdAttribute }
export default function useImageArrayOps() {
  async function uploadFilesToStorage(files = [], bucket) {
    const uploadPromises = files.map(async (file) => {
      const fileStorageResponse = await supabase.storage
        .from(bucket)
        .upload(file?.name, file, { upsert: true });
      if (fileStorageResponse.error) return null
      const publicUrlResponse = await supabase.storage
        .from(bucket)
        .getPublicUrl(fileStorageResponse?.data?.path)
      return {
        bucket,
        public_url: publicUrlResponse?.data?.publicUrl,
        storage_key: fileStorageResponse?.data?.path,
      }
    })
    const results = await Promise.all(uploadPromises)
    return results.filter(Boolean)
  }

  async function fetchExistingImages({ table, userId, itemID, itemIdAttribute }) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .eq(itemIdAttribute, itemID)
      .order('index', { ascending: true })
    if (error) throw error
    return data || []
  }

  function shiftIndices(array = [], shiftBy = 0) {
    return array.map((image) => ({ id: image.id, index: (image.index ?? 0) + shiftBy }))
  }

  async function upsertRows({ table }, rows = []) {
    if (!rows || rows.length === 0) return null
    const { data, error } = await supabase
      .from(table)
      .upsert(rows, { onConflict: 'id' })
      .select('*')
    if (error) throw error
    return data
  }

  async function insertRows({ table }, rows = []) {
    if (!rows || rows.length === 0) return null
    const { data, error } = await supabase
      .from(table)
      .insert(rows)
      .select('*')
    if (error) throw error
    return data
  }

  // Drop files onto editor/uploader: prepend new images and shift existing
  async function processDroppedFiles(files, cfg) {
    const { table, bucket, userId, itemID, itemIdAttribute } = cfg

    // 1) Upload
    const newImagesData = await uploadFilesToStorage(files, bucket)
    if (!newImagesData || newImagesData.length === 0) return []

    // 2) Fetch existing and shift
    const existing = await fetchExistingImages({ table, userId, itemID, itemIdAttribute })
    const shiftedExisting = shiftIndices(existing, newImagesData.length)
    await upsertRows({ table }, shiftedExisting)

    // 3) Insert new at indices 0..n-1
    const newRows = newImagesData.map((img, index) => ({
      ...img,
      user_id: userId,
      [itemIdAttribute]: itemID,
      index,
    }))
    await insertRows({ table }, newRows)

    // 4) Return refreshed full list
    const refreshed = await fetchExistingImages({ table, userId, itemID, itemIdAttribute })
    return refreshed
  }

  // Delete a single image row and update indices for the rest
  async function deleteImageAndReindex(idx, array, cfg) {
    const { table, bucket } = cfg
    const img = array?.[idx]
    if (!img) return array

    // Storage delete (best effort)
    const storageKey = img?.storage_key || img?.storageKey
    if (bucket && storageKey) {
      await supabase.storage.from(bucket).remove([storageKey])
    }

    // DB row delete
    if (img?.id) {
      await supabase.from(table).delete().eq('id', img.id)
    }

    // Reindex rest and upsert indices
    const remaining = array.filter((_, i) => i !== idx)
    const reindexed = remaining.map((it, i) => ({ ...it, index: i }))
    const rows = reindexed.map(it => ({ id: it?.id, index: it?.index })).filter(r => r.id != null)
    await upsertRows({ table }, rows)

    return reindexed
  }

  return {
    uploadFilesToStorage,
    fetchExistingImages,
    shiftIndices,
    upsertRows,
    insertRows,
    processDroppedFiles,
    deleteImageAndReindex,
  }
}
