import React, { useEffect, useState } from 'react'
import { supabaseClient } from '../../../../Global/DB/SupabaseClient'
import ImgSupabaseStorage from './ImgSupabaseStorage'
import '../DBInput.css'

/**
 * ImgSupabaseDB Component
 * 
 * A generic component for displaying and managing a single image stored in Supabase
 * Handles database updates for image metadata
 * 
 * @param {Object} props
 * @param {Object} props.imageData - Image data object containing downloadURL, storageURL, etc.
 * @param {string} props.bucket - Supabase storage bucket name
 * @param {string} props.table - Database table name
 * @param {string} props.recordId - Record ID in the database
 * @param {string} props.dbColumn - Database column name that contains the image data
 * @param {string} props.storagePath - Path in storage where the image will be stored
 * @param {string} props.imgClass - CSS class for styling the image container
 * @param {string} props.imgStyle - Inline style for the image
 * @param {boolean} props.viewModeOverride - If true, displays in view mode only
 */
export default function ImgSupabaseDB({
  imageData,
  bucket,
  table,
  recordId,
  dbColumn,
  storagePath,
  imgClass,
  imgStyle,
  viewModeOverride
}) {
  
  // State for view/edit mode
  const [viewMode, setViewMode] = useState(true)
  
  // Update viewMode based on parent prop
  useEffect(() => {
    setViewMode(viewModeOverride)
  }, [viewModeOverride])

  /**
   * Updates the image data in the database
   * @param {Object} newImageData - New image data to store
   */
  async function updateImageInDB(newImageData) {
    console.log("updateImageInDB ", newImageData)
    console.log("table: ", table, "dbColumn: ", dbColumn, "recordId: ", recordId)
    if (!table || !recordId) {
      console.error('Missing table or record ID for database update')
      return
    }

    try {
      // Update the database with the new image data directly in the specified column
      const { error: updateError } = await supabaseClient
        .from(table)
        .update({ [dbColumn]: newImageData })
        .eq('id', recordId)
      
      if (updateError) {
        console.error('Error updating image in database:', updateError)
      }
    } catch (error) {
      console.error('Error in updateImageInDB:', error)
    }
  }

  /**
   * Deletes an image from the database
   */
  async function deleteImageFromDB() {
    if (!table || !recordId) {
      console.error('Missing table or record ID for database update')
      return
    }

    try {
      // Set the column to null to remove the image data
      const { error: updateError } = await supabaseClient
        .from(table)
        .update({ [dbColumn]: null })
        .eq('id', recordId)
      
      if (updateError) {
        console.error('Error deleting image from database:', updateError)
      }
    } catch (error) {
      console.error('Error in deleteImageFromDB:', error)
    }
  }

  return (
    <ImgSupabaseStorage
      currentImageJson={imageData}
      bucket={bucket}
      storagePath={storagePath}
      imageKey={dbColumn}
      onImageUploaded={updateImageInDB}
      onImageDeleted={deleteImageFromDB}
      imgStyle={imgStyle}
      imgClass={imgClass}
      viewMode={viewMode}
    />
  )
}