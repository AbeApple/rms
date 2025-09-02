import { useRef, useState } from "react"
import "./InputCopy.css"

export default function InputCopy({props}){
    
    const [showMenu, setShowMenu] = useState(false)
    const inputRef = useRef()

    return (
        <div className="inputCopyContainer">
            <div
                onClick={()=>setShowMenu(!showMenu)}
                className="inputCopyButton" 
                // onClick(copy the input contents to clipboard)   
            >
                {/* Copy icon */}
                C
            </div>
            {/* pass all props through to this input */}
            <input props={props} ref={inputRef}></input>
        </div>
    )
}