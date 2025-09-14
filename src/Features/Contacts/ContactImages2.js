import React, { useEffect, useState } from 'react'
import ImageUploader2 from '../../DB/Img/ImageUploader2'
import { supabase } from '../../DB/Supabase'
import { useDispatch, useSelector } from 'react-redux'
import { upsertContact } from '../../Global/contactsSlice'
import ImageUploader3 from '../../DB/Img/ImageUploader3'

/*
  based on the user id, contact id we are giong to load the existing array of images for this contact
  they will be displaye din a things iwth arrows
  when clicked if there is none it opens a file explorere
  if there is one it opens a detail view with arrows that can scroll through images
  there is an edit button at the bottom corner
  when pressed it ppens a window where new image can be added (opens file selct) with the butotn at the start, move them around (changes index values that they are orderd by), delete, add tags tor note to image, etc.

*/
function ContactImages2({contactId, defaultImage, createNewCallback}) {
  const dispatch = useDispatch()

  // This is called after the image uplaoder
  async function updateMainImage(newImagesObjectsArray, contactIdFromUploader){
    console.log("updateMainImage newImagesObjectsArray", newImagesObjectsArray)
    try{
      if(!Array.isArray(newImagesObjectsArray) || newImagesObjectsArray.length === 0) return
      // Pick the first (index 0) image
      const first = newImagesObjectsArray[0]
      const url = first?.public_url
      console.log("updateMainImage url", url)
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
      }
    }catch(err){
      console.error('updateMainImage error:', err)
    }
  }

  return (
    <div>
        <ImageUploader3 
          itemID={contactId} 
          itemIdAttribute={"contact_id"} 
          afterUploadCallback={updateMainImage} 
          defaultImage={defaultImage}
          createNewCallback={createNewCallback}
        ></ImageUploader3>
    </div>
  )
}

export default ContactImages2