import { useDispatch, useSelector } from "react-redux"
import "./ImageArrayEditor.css"
import ImageEditBox from "./ImageEditBox"
import { setEditorDragOverIndex, setEditorDragStartIndex, setSelectedEditImageArray } from "../../../../Global/store"
import { supabase } from "../../../../DB/Supabase"

export default function ImageArrayEditor(){
    const dispatch = useDispatch()
    const images = useSelector(state => state.ui.selectedEditImageArray) || []

    function handleDropOnBox(targetIndex){
        return async (startIdx, dropIdx) => {
            // Ensure indices are numbers
            const s = Number(startIdx)
            const d = Number(dropIdx ?? targetIndex)
            console.log("ImageArrayEditor drop:", { startIndex: s, dropIndex: d })

            if(Number.isNaN(s) || Number.isNaN(d)){
                dispatch(setEditorDragOverIndex(null))
                dispatch(setEditorDragStartIndex(null))
                return
            }
            if(s === d){
                dispatch(setEditorDragOverIndex(null))
                dispatch(setEditorDragStartIndex(null))
                return
            }

            try{
                // Create a new ordered copy by moving element s -> d
                const current = Array.isArray(images) ? [...images] : []
                // Taking the moved image out of the array
                const [moved] = current.splice(s, 1)
                // Putting it back into the array at the destination index
                current.splice(d, 0, moved)

                // Re-number indices 0..n-1 (so a new images array with the index value updated)
                const reIndexed = current.map((img, i) => ({ ...img, index: i }))

                // Persist to DB: update each row's index by id
                // images table: id (bigint), index (text) per schema in App.js comment
                const updates = reIndexed.map(async (img, i) => {
                    const id = img.imageId || img.id
                    if(!id) return null
                    const { error } = await supabase
                        .from('images')
                        .update({ index: i })
                        .eq('id', id)
                    if(error){
                        console.error('Update index error for id', id, error)
                    }
                    return null
                })
                await Promise.all(updates)

                // Update Redux with new order so UI reflects change
                dispatch(setSelectedEditImageArray(reIndexed))
            }catch(err){
                console.error('Error reordering images:', err)
            }finally{
                // Clear drag-over highlight after drop
                dispatch(setEditorDragOverIndex(null))
                dispatch(setEditorDragStartIndex(null))
            }
        }
    }

    if(!Array.isArray(images) || images.length === 0){
        return (<div className="image-array-editor empty">No images to edit</div>)
    }

    return (
        <div className="image-array-editor">
            {images.map((img, idx) => (
                <ImageEditBox
                    key={(img.imageId ?? img.storageKey ?? img.publicUrl ?? "img") + "-" + idx}
                    index={idx}
                    image={img}
                    onDrop={handleDropOnBox(idx)}
                />
            ))}
        </div>
    )
} 