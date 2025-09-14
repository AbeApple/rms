import { useDispatch, useSelector } from "react-redux"
import "./ImageArrayEditor.css"
import { setEditorDragOverIndex, setEditorDragStartIndex, setImagesWindowArray, setImagesWindowIndex } from "../../../../Global/store"

export default function ImageEditBox({ index, image, onDrop }){
    const dispatch = useDispatch()
    const dragOverIndex = useSelector(state => state.ui.editorDragOverIndex)
    const dragStartIndex = useSelector(state => state.ui.editorDragStartIndex)
    const editorImages = useSelector(state => state.ui.selectedEditImageArray) || []
    const isDragOver = dragOverIndex === index

    function handleDragStart(e){
        e.dataTransfer.effectAllowed = "move"
        dispatch(setEditorDragStartIndex(index))
    }

    function handleDragOver(e){
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        dispatch(setEditorDragOverIndex(index))
    }

    function handleDrop(e){
        e.preventDefault()
        e.stopPropagation()
        if(typeof onDrop === 'function') onDrop(dragStartIndex, index)
        dispatch(setEditorDragOverIndex(null))
    }

    function handleDragLeave(){
        // Only clear if leaving this box
        if(isDragOver) dispatch(setEditorDragOverIndex(null))
    }

    const url = image?.public_url || ""

    return (
        <div
            className={`image-edit-box ${isDragOver ? 'edit-box-drop' : ''}`}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onClick={(e)=>{ e.stopPropagation(); dispatch(setImagesWindowArray(editorImages)); dispatch(setImagesWindowIndex(index)); }}
            title={`Index: ${index}`}
        >
            {url ? (
                <img src={url} alt={`img-${index}`} />
            ) : (
                <div className="placeholder">No image</div>
            )}
        </div>
    )
}