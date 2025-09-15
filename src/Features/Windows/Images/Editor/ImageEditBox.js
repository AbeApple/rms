import "./ImageArrayEditor.css"

// The index values used for reordering are i
// Simple presentational edit box for DnD with local-state driven props
// Props:
// - index: number for display/debug
// - image: the image object (expects public_url)
// - isDragOver: bool to highlight when hovered during drag
// - onDragStart, onDragOver, onDrop, onDragLeave, onClick: handlers provided by parent
export default function ImageEditBox({ index, image, isDragOver, onDragStart, onDragOver, onDrop, onDragLeave, onClick }){
    // URL to render
    const url = image?.public_url || ""

    // Local wrappers to ensure consistent DnD behavior
    function handleDragStart(e){
        e.dataTransfer.effectAllowed = "move"
        onDragStart?.(e)
    }

    function handleDragOver(e){
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        onDragOver?.(e)
    }

    function handleDrop(e){
        e.preventDefault()
        e.stopPropagation()
        onDrop?.(e)
    }

    function handleDragLeave(e){
        onDragLeave?.(e)
    }

    function handleClick(e){
        onClick?.(e)
    }

    return (
        <div
            className={`image-edit-box ${isDragOver ? 'edit-box-drop' : ''}`}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
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