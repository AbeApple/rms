import React, { useState } from 'react'
import { supabaseClient } from '../../../../Global/DB/SupabaseClient'
import { dateString } from '../../../../Global/Functions'
import ConfirmationDialog from '../../../../Features/Windows/ConfirmationDialog/ConfirmationDialog'
import ImgSelector from './ImgSelector'

/**
 * ImgSupabaseStorage Component
 * 
 * A generic component that handles image upload to Supabase storage
 * Uses ImgSelector for the visual interface and handles backend operations
 * 
 * @param {Object} props
 * @param {Object} props.currentImageJson - Current image data with downloadURL, storageURL, etc.
 * @param {string} props.bucket - Supabase storage bucket name
 * @param {string} props.storagePath - Path within the bucket where the image will be stored
 * @param {string} props.imageKey - Identifier for the image (used in filename)
 * @param {Function} props.onImageUploaded - Callback when image is uploaded
 * @param {Function} props.onImageDeleted - Callback when image is deleted
 * @param {Object} props.imgStyle - Custom styles for the image
 * @param {string} props.imgClass - CSS class for the image container
 * @param {boolean} props.viewMode - If true, displays in view-only mode
 */
export default function ImgSupabaseStorage({
  currentImageJson,
  bucket,
  storagePath,
  imageKey,
  onImageUploaded,
  onImageDeleted,
  imgStyle,
  imgClass,
  viewMode = false
}) {
  // Component state
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState()
  const [showProgressBar, setShowProgressBar] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  /**
   * Upload an image to Supabase storage
   * @param {File} file - The file to upload
   */
  async function uploadImage(file) {
    if (!file || !bucket || !storagePath) return

    setShowProgressBar(true)
    setProgress(0)

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${imageKey || 'image'}_${Date.now()}.${fileExt}`
      const filePath = `${storagePath}/${fileName}`
      
      // Upload the file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabaseClient
        .storage
        .from(bucket)
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600',
          onUploadProgress: (progress) => {
            console.log("onUploadProgress ", progress)
            const calculatedProgress = Math.round((progress.loaded / progress.total) * 100)
            setProgress(calculatedProgress)
          }
        })
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        setShowProgressBar(false)
        return
      }
      
      // Get the public URL
      const { data: publicUrlData } = await supabaseClient
        .storage
        .from(bucket)
        .getPublicUrl(filePath)

      console.log("data: ", publicUrlData)
      
      // If there is already an image there delete it
      if (currentImageJson?.storageURL) {
        await deleteImage()
      }
      
      // Create new image data object
      const newImageData = {
        downloadURL: publicUrlData.publicUrl,
        storageURL: filePath,
        name: fileName,
        uploadDate: dateString()
      }
      
      // Update preview
      setPreviewUrl(publicUrlData.publicUrl)
      
      // Call the callback with the new image data
      if (onImageUploaded && typeof onImageUploaded === 'function') {
        onImageUploaded(newImageData)
      }
      
      // Hide progress bar after a delay
      setTimeout(() => {
        setShowProgressBar(false)
      }, 2000)
      
    } catch (error) {
      console.error('Error in uploadImage:', error)
      setShowProgressBar(false)
    }
  }

  /**
   * Delete an image from Supabase storage
   */
  async function deleteImage() {
    if (!currentImageJson?.storageURL) return

    try {
      // Extract the path from the storage URL
      const pathParts = currentImageJson.storageURL.split('/')
      const fileName = pathParts[pathParts.length - 1]
      const filePath = `${storagePath}/${fileName}`
      
      // Delete the image from Supabase storage
      const { error } = await supabaseClient
        .storage
        .from(bucket)
        .remove([filePath])
      
      if (error) {
        console.error('Error deleting image from storage:', error)
      }
      
      // Call the callback after deletion
      if (onImageDeleted && typeof onImageDeleted === 'function') {
        onImageDeleted(imageKey)
      }
    } catch (error) {
      console.error('Error in deleteImage:', error)
    }
    setShowDeleteConfirm(false)
    setPreviewUrl(null)
  }

  /**
   * Handle image selection from ImgSelector
   * @param {File} file - The selected file
   */
  function handleImageSelected(file) {
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
      uploadImage(file)
    }
  }

  /**
   * Handle delete button click from ImgSelector
   */
  function handleDeleteClick() {
    setShowDeleteConfirm(true)
  }

  return (
    <>
      <ImgSelector
        imageUrl={currentImageJson?.downloadURL || previewUrl}
        imageId={imageKey}
        onImageSelected={handleImageSelected}
        onDeleteClick={handleDeleteClick}
        imgStyle={imgStyle}
        imgClass={imgClass}
        viewMode={viewMode}
        showProgress={showProgressBar}
        progress={progress}
      />

      {/* Image Deletion Confirmation */}
      {showDeleteConfirm && (
        <ConfirmationDialog
          onConfirm={deleteImage}
          onCancel={()=>setShowDeleteConfirm(false)}
          message={"Delete Image"}
        >
        </ConfirmationDialog>
      )}
    </>
  )
}