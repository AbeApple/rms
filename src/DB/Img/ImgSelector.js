import React, { useRef } from 'react'
import '../DBInput.css'

/**
 * ImgSelector Component
 * 
 * A reusable component for image selection and display
 * Handles image preview, drag and drop, file selection
 * 
 * @param {Object} props
 * @param {string} props.imageUrl - URL of the current image to display
 * @param {string} props.imageId - Unique identifier for the image input
 * @param {Function} props.onImageSelected - Callback when image is selected
 * @param {Function} props.onDeleteClick - Callback when delete button is clicked
 * @param {Object} props.imgStyle - Custom styles for the image
 * @param {string} props.imgClass - CSS class for the image container
 * @param {boolean} props.viewMode - If true, displays in view-only mode
 * @param {boolean} props.showProgress - Whether to show progress bar
 * @param {number} props.progress - Progress percentage (0-100)
 */
export default function ImgSelector({
  imageUrl,
  imageId,
  onImageSelected,
  onDeleteClick,
  imgStyle,
  imgClass,
  viewMode = false,
  showProgress = false,
  progress = 0
}) {
  const imageInputRef = useRef()

  // Event handlers
  function fileDragOver(e) {
    e.preventDefault()
  }

  function fileSelection(e) {
    const file = e.target?.files[0]
    if (file && onImageSelected) {
      onImageSelected(file)
    }
  }

  function fileDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer?.files[0]
    console.log("fileDrop: ", file)
    if (file && onImageSelected) {
      onImageSelected(file)
    }
  }

  function handleDeleteClick(e) {
    e.stopPropagation()
    e.preventDefault()
    if (onDeleteClick) {
      onDeleteClick()
    }
  }

  function selectNewImage(e) {
    e.stopPropagation()
    e.preventDefault()
    imageInputRef.current?.click()
  }

  return (
    <div className={"imgSupabaseView " + (imgClass || '')} >
      {imageUrl && <img src={imageUrl} alt="" style={imgStyle}/> }
      
      {!viewMode && !imageUrl &&
        <>
          <label 
            className='imgSupabaseLabel' 
            htmlFor={`imageInput-${imageId || 'default'}`}
            onDragOver={fileDragOver} 
            onDrop={fileDrop} 
          >
            Select or Drop Image
          </label>
          <input 
            className="hidden" 
            type="file" 
            id={`imageInput-${imageId || 'default'}`} 
            ref={imageInputRef}
            onChange={fileSelection}
            accept="image/*"
          />
        </>
      }
      
      {!viewMode && imageUrl &&
        <div 
          className="deleteImageBtn" 
          onClick={handleDeleteClick}
          title="Delete image"
        >
          X
        </div>
      }

      {showProgress && (
        <div className="progressBar">
          <div className="progressBarInner" style={{width: `${progress}%`}}></div>
          <div className="progressBarText">{Math.round(progress)}%</div>
        </div>
      )}
    </div>
  )
}