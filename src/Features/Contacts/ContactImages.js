import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../../DB/Supabase'
import { upsertContact } from '../../Global/contactsSlice'

/**
 * ContactImages
 * - Drag/drop to upload multiple images
 * - Shows per-file upload progress
 * - Saves to storage bucket: user_images under user_images/<user_id>
 * - Inserts rows into images table with { user_id, contact_id, url, file_path, ... }
 * - Saves the first image of a batch to contacts.main_image (JSON)
 * - Displays current main image with arrow navigation to browse others
 */
export default function ContactImages({ contactId, userId, mainImageJson }) {
  const dispatch = useDispatch()

  const [images, setImages] = useState([]) // array of image rows from images table
  const [index, setIndex] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [uploadItems, setUploadItems] = useState([]) // [{name, progress, status}]
  const firstLoadRef = useRef(true)

  const currentImageUrl = useMemo(() => {
    if (images.length === 0) return mainImageJson?.downloadURL || null
    return images[index]?.url || mainImageJson?.downloadURL || null
  }, [images, index, mainImageJson])

  useEffect(() => {
    if (!contactId || !userId) return
    loadImages()
  }, [contactId, userId])

  // Reset index if images change
  useEffect(() => {
    setIndex(0)
  }, [images?.length])

  async function loadImages() {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('images, main_image')
        .eq('id', contactId)
        .eq('user_id', userId)
        .single()
      if (error) throw error
      // Expect images to be an array of fileObjects like [{ bucket, publicUrl, storagePath }]
      setImages(Array.isArray(data?.images) ? data.images : [])
    } catch (e) {
      console.error('Error loading contact images:', e)
      setImages([])
    }
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }
  const onDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const onDrop = async (e) => {
    e.preventDefault()
    setDragOver(false)
    if (!contactId || !userId) return
    const files = Array.from(e.dataTransfer.files || [])
    if (files.length === 0) return

    // Track per-file progress
    const initialUploads = files.map(f => ({ name: f.name, progress: 0, status: 'Queued' }))
    setUploadItems(prev => [...prev, ...initialUploads])

    // Upload sequentially to simplify progress UI
    const uploadedFileObjects = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // Mark uploading
      setUploadItems(prev => prev.map(it => it.name === file.name ? { ...it, status: 'Uploading', progress: 0 } : it))

      try {
        const fileExt = file.name.split('.').pop()
        const uniqueName = `${Date.now()}_${i}.${fileExt}`
        const storagePath = `${userId}/${uniqueName}`
        // Upload to storage
        const { data: uploadData, error: uploadErr } = await supabase
          .storage
          .from('user_images')
          .upload(storagePath, file, { upsert: true, cacheControl: '3600' })
        if (uploadErr) throw uploadErr

        // Get public URL
        const { data: pub } = await supabase
          .storage
          .from('user_images')
          .getPublicUrl(storagePath)

        const fileObject = {
          bucket: 'user_images',
          public_url: pub?.publicUrl,
          storagePath
        }
        uploadedFileObjects.push(fileObject)
        // Mark done
        setUploadItems(prev => prev.map(it => it.name === file.name ? { ...it, status: 'Done', progress: 100 } : it))
      } catch (err) {
        console.error('Upload error:', err)
        setUploadItems(prev => prev.map(it => it.name === file.name ? { ...it, status: 'Error' } : it))
      }
    }

    // Update contacts.images array in DB (prepend new uploads)
    try {
      const { data: existing, error: selErr } = await supabase
        .from('contacts')
        .select('images, main_image')
        .eq('id', contactId)
        .eq('user_id', userId)
        .single()
      if (selErr) throw selErr

      const existingArr = Array.isArray(existing?.images) ? existing.images : []
      const updatedArr = [...uploadedFileObjects, ...existingArr]

      const updates = { images: updatedArr }
      const needMain = (!existing?.main_image || !existing?.main_image?.downloadURL) && uploadedFileObjects.length > 0
      if (needMain) {
        updates.main_image = {
          downloadURL: uploadedFileObjects[0].public_url,
          storageURL: uploadedFileObjects[0].storagePath,
          bucket: uploadedFileObjects[0].bucket
        }
      }

      const { error: updErr } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', contactId)
      if (updErr) throw updErr

      // Update local state and redux cache
      setImages(updatedArr)
      if (updates.main_image) {
        dispatch(upsertContact({ id: contactId, main_image: updates.main_image }))
      }
    } catch (e) {
      console.error('Error updating contact images array:', e)
    }
  }

  const next = useCallback(() => {
    if (images.length === 0) return
    setIndex((prev) => (prev + 1) % images.length)
  }, [images])

  const prev = useCallback(() => {
    if (images.length === 0) return
    setIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images])

  return (
    <div style={{ position: 'relative' }}>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={next}
        title={images.length > 1 ? 'Click to view next image' : 'Drop images to upload'}
        style={{
          height: 160,
          width: 160,
          borderRadius: 6,
          border: dragOver ? '2px dashed #4b9cff' : '1px solid #999',
          background: '#f9fbff',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative'
        }}
     >
        {currentImageUrl ? (
          <img src={currentImageUrl} alt="contact" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        ) : (
          <div style={{ color: '#777', fontSize: 12 }}>Drop images here</div>
        )}
        {images.length > 1 && (
          <>
            <div onClick={(e)=>{e.stopPropagation(); prev();}} style={{ position: 'absolute', left: 4, top: 'calc(50% - 12px)', background: 'rgba(0,0,0,0.35)', color:'#fff', borderRadius: 12, width: 24, height: 24, display:'flex', alignItems:'center', justifyContent:'center', fontSize: 14 }}>&lt;</div>
            <div onClick={(e)=>{e.stopPropagation(); next();}} style={{ position: 'absolute', right: 4, top: 'calc(50% - 12px)', background: 'rgba(0,0,0,0.35)', color:'#fff', borderRadius: 12, width: 24, height: 24, display:'flex', alignItems:'center', justifyContent:'center', fontSize: 14 }}>&gt;</div>
            <div style={{ position: 'absolute', bottom: 4, right: 6, background:'rgba(0,0,0,0.35)', color:'#fff', borderRadius: 10, padding: '2px 6px', fontSize: 11 }}>{index+1}/{images.length}</div>
          </>
        )}
      </div>

      {/* Upload list */}
      {uploadItems.length > 0 && (
        <div style={{ marginTop: 8, maxHeight: 120, overflowY: 'auto' }}>
          {uploadItems.map((u, i) => (
            <div key={`${u.name}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 140, fontSize: 12, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
              <div style={{ flex: 1, height: 6, background: '#e6eef9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${u.progress||0}%`, height: '100%', background: u.status==='Error' ? '#ff6060' : '#4b9cff', transition: 'width 0.2s ease' }} />
              </div>
              <div style={{ width: 64, textAlign: 'right', fontSize: 12, color: u.status==='Error' ? '#ff6060' : '#555' }}>{u.status}{u.progress>0?` ${u.progress}%`:''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
