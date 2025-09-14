import { useDispatch, useSelector } from "react-redux"
import Window from "../../Window"
import "./ImageArrayEditor.css"
import ImageArrayEditor from "./ImageArrayEditor"
import { setSelectedEditImageArray } from "../../../../Global/store"

export default function ImageArrayEditorWindow(){

    const selectedEditImageArray = useSelector(state => state.ui.selectedEditImageArray)
    const dispatch = useDispatch()

    if(!selectedEditImageArray) return (<></>)

    return (
        <Window
            title="Edit Image Order"
            onClose={()=>dispatch(setSelectedEditImageArray())}
        >
            <ImageArrayEditor></ImageArrayEditor>
        </Window>
    )
}