import Window from "../Window"
import "./ImagesWindow.css"
import { setImagesArray } from "../../../Global/store"
import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"

export default function ImagesWindow(){

    const imagesArray = useSelector(state => state.ui.imagesArray)
    const dispatcher = useDispatch()

    const [index, setIndex] = useState(0)

    function incrementIndex(direction){
        setIndex((index + direction) % imagesArray?.length)
    }

    if(!imagesArray)
        return (<></>)

    return (
        <Window
            onClose={()=>dispatcher(setImagesArray())}
            className="imagesWindow"
        >
            <div 
                className="imagesWindowButton imagesWindowButtonLeft" 
                onClick={()=>incrementIndex(1)}
            >
                {"<"}
            </div>
            <img src={imagesArray[index]}></img>
            <div 
                className="imagesWindowButton imagesWindowButtonRight" 
                onClick={()=>incrementIndex(-1)}
            >
                {">"}
            </div>
            <div className="imageArrayIndex">{(index + 1) + " of " + imagesArray?.length}</div>
        </Window>
    )
}