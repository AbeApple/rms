import "./ImageArrayEditor.css"
import ImageEditBox from "./ImageEditBox"
import { useEffect, useState } from "react"
import { supabase } from "../../../../DB/Supabase"
import SaveStatusIndicator from "../../../../Components/SaveStatusIndicator"

// ImageArrayEditor provides a simple DnD list editor for images.
// Hovered target is highlighted. On drop, rebuilds indices and emits updated array via onReorder.
export default function ImageArrayEditor({ onReorder, imagesArray = [], table = "images" }){

    // Local working copy for immediate UI responsiveness
    const [localImages, setLocalImages] = useState(() => Array.isArray(imagesArray) ? [...imagesArray] : [])

    // DnD state
    const [startIndex, setStartIndex] = useState(null)
    const [hoverIndex, setHoverIndex] = useState(null)

    // Save indicator state
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState(null)

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

    // Optional click handler (reserved for future image viewer integration)
    function handleClick(e, idx){
        e?.stopPropagation?.()
    }

    return (
        <div className="image-array-editor" style={{ position: 'relative' }}>
            <SaveStatusIndicator saving={saving} error={saveError} />
            {localImages?.map((img, idx) => (
                <ImageEditBox
                    key={keyFor(img, idx)}
                    index={idx}
                    image={img}
                    isDragOver={hoverIndex === idx}
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={() => handleDragOver(idx)}
                    onDrop={() => handleDrop(idx)}
                    onDragLeave={() => handleDragLeave(idx)}
                    onClick={(e)=>handleClick(e, idx)}
                />
            ))}
        </div>
    )
}