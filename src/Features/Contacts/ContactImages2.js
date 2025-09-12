import React, { useEffect, useState } from 'react'
import ImageUploader2 from '../../DB/Img/ImageUploader2'
import { supabase } from '../../DB/Supabase'
import { useDispatch, useSelector } from 'react-redux'
import { upsertContact } from '../../Global/contactsSlice'

/*
  based on the user id, contact id we are giong to load the existing array of images for this contact
  they will be displaye din a things iwth arrows
  when clicked if there is none it opens a file explorere
  if there is one it opens a detail view with arrows that can scroll through images
  there is an edit button at the bottom corner
  when pressed it ppens a window where new image can be added (opens file selct) with the butotn at the start, move them around (changes index values that they are orderd by), delete, add tags tor note to image, etc.

*/
function ContactImages2({contactId}) {
  const userId = useSelector(state => state?.auth?.userId)
  const dispatch = useDispatch()
  const [existingImages, setExistingImages] = useState([])

  // Load existing images for this contact/user
  useEffect(() => {
    let ignore = false
    async function load() {
      try{
        if(!contactId || !userId){
          setExistingImages([])
          return
        }
        const { data, error } = await supabase
          .from('images')
          .select('id, index, public_url, bucket, storage_key')
          .eq('user_id', userId)
          .eq('item_id', contactId)
          .order('index', { ascending: true })
        if(error){
          console.log('Error loading images:', error)
          if(!ignore) setExistingImages([])
          return
        }
        const mapped = (data || []).map(r => ({
          imageId: r.id,
          index: parseInt(r.index ?? '0', 10) || 0,
          bucket: r.bucket,
          storageKey: r.storage_key,
          publicUrl: r.public_url,
        }))
        if(!ignore) setExistingImages(mapped)
      }catch(err){
        console.error('load images error:', err)
        if(!ignore) setExistingImages([])
      }
    }
    load()
    return () => { ignore = true }
  }, [contactId, userId])

  // This is called after the image uplaoder
  async function updateMainImage(newImagesObjectsArray){
    try{
      if(!Array.isArray(newImagesObjectsArray) || newImagesObjectsArray.length === 0) return
      // Pick the first (index 0) image
      const first = newImagesObjectsArray[0]
      const url = first?.publicUrl
      if(!url || !contactId) return
      // Update contacts.main_image with the download url string
      const { error } = await supabase
        .from('contacts')
        .update({ main_image: url })
        .eq('id', contactId)
      if(error){
        console.log('Error updating contact main image:', error)
      } else {
        // Keep Redux store in sync with DB
        dispatch(upsertContact({ id: contactId, main_image: url }))
      }
    }catch(err){
      console.error('updateMainImage error:', err)
    }
  }

  return (
    <div>
        <ImageUploader2 itemID={contactId} existingImagesArray={existingImages} afterUploadCallback={updateMainImage}></ImageUploader2>
    </div>
  )
}

export default ContactImages2