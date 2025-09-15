import React, { useEffect, useState } from 'react'
import { supabase } from '../../DB/Supabase'
import { useDispatch, useSelector } from 'react-redux'
import { upsertContact } from '../../Global/contactsSlice'
import ImageUploader from '../../DB/Img/ImageUploader'

/*
  based on the user id, contact id we are giong to load the existing array of images for this contact
  they will be displaye din a things iwth arrows
  when clicked if there is none it opens a file explorere
  if there is one it opens a detail view with arrows that can scroll through images
  there is an edit button at the bottom corner
  when pressed it ppens a window where new image can be added (opens file selct) with the butotn at the start, move them around (changes index values that they are orderd by), delete, add tags tor note to image, etc.

*/
export default function ContactImages({contactId, defaultImage, createNewCallback, setDbStatusCallback = ()=>{}, onMainImageUpdated}) {
  const dispatch = useDispatch()

  // Single callback used for both: after upload and after reorder.
  // Sets contacts.main_image to the first image's public_url and updates Redux + parent local state.
  async function onReorderCallback(newImagesObjectsArray, contactIdFromUploader){
    console.log("onReorderCallback newImagesObjectsArray", newImagesObjectsArray)
    try{
      if(!Array.isArray(newImagesObjectsArray) || newImagesObjectsArray.length === 0) return
      // Pick the first (index 0) image
      const first = newImagesObjectsArray[0]
      const url = first?.public_url
      console.log("onReorderCallback url", url)
      const idToUpdate = contactIdFromUploader || contactId
      console.log("contactId", idToUpdate)

      if(!url || !idToUpdate) return
      // Update contacts.main_image with the download url string
      const { error } = await supabase
        .from('contacts')
        .update({ main_image: url })
        .eq('id', idToUpdate)

      // TODO Upsert into contacts in redux so global state is up to date

      if(error){
        console.log('Error updating contact main image:', error)
      } else {
        // Keep Redux store in sync with DB
        dispatch(upsertContact({ id: idToUpdate, main_image: url }))
        // Notify parent ContactBox to update its local state immediately (so UI updates without refresh)
        if(typeof onMainImageUpdated === 'function') onMainImageUpdated(url)
        if(typeof setDbStatusCallback === 'function') setDbStatusCallback('Saved')
      }
    }catch(err){
      console.error('onReorderCallback error:', err)
    }
  }

  return (
    <div>
        <ImageUploader 
          itemID={contactId} 
          itemIdAttribute={"contact_id"} 
          afterUploadCallback={onReorderCallback} 
          onReorder={onReorderCallback}
          defaultImage={defaultImage}
          createNewCallback={createNewCallback}
          setDbStatusCallback={setDbStatusCallback}
        ></ImageUploader>
    </div>
  )
}