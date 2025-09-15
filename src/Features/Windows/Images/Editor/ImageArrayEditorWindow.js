import Window from "../../Window"
import "./ImageArrayEditor.css"
import ImageArrayEditor from "./ImageArrayEditor"

/*
    will put this in the image uploader
    then have the image uplaoder have local state to keep track of the edit image array
    and there will be a callback for when the ordere is changed
    
*/
export default function ImageArrayEditorWindow({onReorder, imagesArray, onClose, bucket = "user_images", table = "images", itemID, itemIdAttribute = "contact_id", userId}){

    return (
        <Window
            title="Edit Image Order"
            onClose={onClose}
        >
            <ImageArrayEditor 
                onReorder={onReorder} 
                imagesArray={imagesArray}
                bucket={bucket}
                table={table}
                itemID={itemID}
                itemIdAttribute={itemIdAttribute}
                userId={userId}
            ></ImageArrayEditor>
        </Window>
    )
}