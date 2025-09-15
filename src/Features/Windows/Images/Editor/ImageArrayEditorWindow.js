import Window from "../../Window"
import "./ImageArrayEditor.css"
import ImageArrayEditor from "./ImageArrayEditor"

/*
    will put this in the image uploader
    then have the image uplaoder have local state to keep track of the edit image array
    and there will be a callback for when the ordere is changed
    
*/
export default function ImageArrayEditorWindow({onReorder, imagesArray, onClose}){

    return (
        <Window
            title="Edit Image Order"
            onClose={onClose}
        >
            <ImageArrayEditor 
                onReorder={onReorder} 
                imagesArray={imagesArray}
            ></ImageArrayEditor>
        </Window>
    )
}