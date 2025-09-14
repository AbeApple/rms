import React, { useMemo } from 'react'
import Window from '../Features/Windows/Window'
import { useDispatch, useSelector } from 'react-redux'
import { setImagesWindowArray, setImagesWindowIndex } from '../Global/store'
import './ImageArrayViewer.css'

function ImageArrayViewer() {
  
    // get imageArrayToView from redux 
    const dispatch = useDispatch()
    const imagesWindowArray = useSelector(state => state.ui.imagesWindowArray)
    const index = useSelector(state => state.ui.imagesWindowIndex) ?? 0

    function nextImage(){
        if(!imagesWindowArray?.length) return
        let nextIndex = (index + 1) % imagesWindowArray.length
        dispatch(setImagesWindowIndex(nextIndex))
    }
    function lastImage(){
        if(!imagesWindowArray?.length) return
        let lastIndex = index - 1
        if(lastIndex < 0) lastIndex = imagesWindowArray.length - 1
        dispatch(setImagesWindowIndex(lastIndex))
    }

    const currentItem = useMemo(()=> imagesWindowArray?.[index], [imagesWindowArray, index])
    const currentUrl = useMemo(()=>{
        if(!currentItem) return ''
        return currentItem.public_url || currentItem.publicUrl || ''
    },[currentItem])

    if(!imagesWindowArray) return(<></>)

    return (
        <Window
            title="Images"
            onClose={()=>dispatch(setImagesWindowArray(null))}
            className="images-viewer-window"
        >
            <div className="imageArrayViewer">
                <button className="nav-btn nav-left" onClick={lastImage}>{"<"}</button>
                <img key={index} className="image-view" src={currentUrl} alt="image" onClick={()=>dispatch(setImagesWindowIndex(index))} />
                <button className="nav-btn nav-right" onClick={nextImage}>{">"}</button>
                <div className="bottom-bar">{`${index + 1} of ${imagesWindowArray?.length || 0}`} {currentItem?.index !== undefined ? `| index: ${currentItem.index}` : ''}</div>
            </div>
        </Window>
    )
}

export default ImageArrayViewer