import "./ImageArrayEditor.css"
import ImageEditBox from "./ImageEditBox"
import { useEffect, useState } from "react"
import { supabase } from "../../../../DB/Supabase"
import SaveStatusIndicator from "../../../../Components/SaveStatusIndicator"
import useImageArrayOps from "../../../../DB/Img/hooks/useImageArrayOps"

// ImageArrayEditor provides a simple DnD list editor for images.
// Hovered target is highlighted. On drop, rebuilds indices and emits updated array via onReorder.
export default function ImageArrayEditor({ onReorder, imagesArray = [], table = "images", bucket = "user_images", itemID, itemIdAttribute = "contact_id", userId }){

    // Local working copy for immediate UI responsiveness
    const [localImages, setLocalImages] = useState(() => Array.isArray(imagesArray) ? [...imagesArray] : [])

    // DnD state
    const [startIndex, setStartIndex] = useState(null)
    const [hoverIndex, setHoverIndex] = useState(null)

    // Save indicator state
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState(null)
    const [openMenuIndex, setOpenMenuIndex] = useState(null)
    const ops = useImageArrayOps()

    // Keep local state in sync with parent updates
    useEffect(() => {
        setLocalImages(Array.isArray(imagesArray) ? [...imagesArray] : [])
    }, [imagesArray])

    // Compute a stable key for each item
    const keyFor = (img, idx) => (img?.id ?? img?.imageId ?? img?.storage_key ?? img?.public_url ?? "img") + "-" + idx

    // Perform reorder and rebuild index attributes
    async function commitReorder(start, target){
        if(start === null || target === null) return
        if(start === target) return

        // Create new order by moving item from start to target
        const arr = [...localImages]
        const [moved] = arr.splice(start, 1)
        arr.splice(target, 0, moved)

        // Rebuild index fields to match array positions
        const updated = arr.map((img, newIdx) => ({ ...img, index: newIdx }))

        // Optimistically update local UI
        setLocalImages(updated)

        // Persist new indices with a single batch upsert
        try{
            setSaving(true)
            setSaveError(null)
            const rows = updated
                .map(img => ({ id: img?.id, index: img?.index }))
                .filter(r => r.id != null && typeof r.index === 'number')

            if(rows.length > 0){
                const { error } = await supabase
                    .from(table)
                    .upsert(rows, { onConflict: 'id' })
                    .select('*')

                if(error){
                    console.error('Reorder upsert error:', error)
                    setSaveError('Save error')
                }
            }

            // Notify parent with full updated array (for e.g. setting main image)
            onReorder?.(updated)
        }catch(err){
            console.error("commitReorder error:", err)
            setSaveError('Save error')
        } finally {
            setSaving(false)
        }
    }

    // Delete using shared ops
    async function deleteImage(idx){
        try{
            setSaving(true); setSaveError(null)
            const cfg = { table, bucket, userId, itemID, itemIdAttribute }
            const reindexed = await ops.deleteImageAndReindex(idx, localImages, cfg)
            setLocalImages(reindexed)
            onReorder?.(reindexed)
        }catch(err){
            console.error('deleteImage error:', err)
            setSaveError('Save error')
        }finally{
            setSaving(false)
        }
    }

    // Handle dropping new files using shared ops
    async function handleFilesDropped(files){
        if(!Array.isArray(files) || files.length === 0) return
        try{
            setSaving(true); setSaveError(null)
            const cfg = { table, bucket, userId, itemID, itemIdAttribute }
            const updated = await ops.processDroppedFiles(files, cfg)
            setLocalImages(updated)
            onReorder?.(updated)
        }catch(err){
            console.error('handleFilesDropped error:', err)
            setSaveError('Save error')
        }finally{
            setSaving(false)
        }
    }

    function handleContainerDragOver(e){
        // Allow file drop
        if(e?.dataTransfer?.types?.includes?.('Files')){
            e.preventDefault()
        }
    }
    function handleContainerDrop(e){
        if(e?.dataTransfer?.files && e.dataTransfer.files.length > 0){
            e.preventDefault()
            e.stopPropagation()
            const files = Array.from(e.dataTransfer.files)
            handleFilesDropped(files)
        }
    }

    // Handlers passed to each box
    function handleDragStart(idx){
        setStartIndex(idx)
    }
    function handleDragOver(idx){
        setHoverIndex(idx)
    }
    function handleDragLeave(idx){
        // Only clear if this index was the current hover
        setHoverIndex(prev => (prev === idx ? null : prev))
    }
    async function handleDrop(idx){
        const target = idx
        await commitReorder(startIndex, target)
        // Reset transient DnD state
        setStartIndex(null)
        setHoverIndex(null)
    }

    function handleClick(e, idx){
        e?.stopPropagation?.()
    }

    return (
        <div className="image-array-editor" style={{ position: 'relative' }} onDragOver={handleContainerDragOver} onDrop={handleContainerDrop}>
            <SaveStatusIndicator saving={saving} error={saveError} />
            {localImages?.map((img, idx) => (
                <div key={keyFor(img, idx)} style={{ position: 'relative' }}>
                    {/* Options button */}
                    <div style={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }}>
                        <button className="image-options-button" title="Options" onClick={(e)=>{ e.stopPropagation(); setOpenMenuIndex(prev=> prev===idx ? null : idx) }}>
                            ⋮
                        </button>
                        {openMenuIndex === idx && (
                            <div className="image-options-menu" style={{ position: 'absolute', top: 24, right: 0, background: 'white', border: '1px solid #ddd', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                <div className="image-options-item" style={{ padding: '6px 10px', cursor: 'pointer' }} onClick={(e)=>{ e.stopPropagation(); setOpenMenuIndex(null); deleteImage(idx) }}>Delete</div>
                            </div>
                        )}
                    </div>

                    <ImageEditBox
                        index={idx}
                        image={img}
                        isDragOver={hoverIndex === idx}
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={() => handleDragOver(idx)}
                        onDrop={() => handleDrop(idx)}
                        onDragLeave={() => handleDragLeave(idx)}
                        onClick={(e)=>handleClick(e, idx)}
                    />
                </div>
            ))}
        </div>
    )
}