import { useRef, useState } from "react"
import "./InputCopy.css"

export default function InputCopy(props){
    
    const [copied, setCopied] = useState(false)
    const inputRef = useRef()

    // Function to copy input content to clipboard
    const copyToClipboard = () => {
        if (inputRef.current) {
            inputRef.current.select()
            document.execCommand('copy')
            // Show copied feedback
            setCopied(true)
            // Reset copied state after 2 seconds
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="inputCopyContainer">
            <div
                onClick={copyToClipboard}
                className={`inputCopyButton ${copied ? 'copied' : ''}`}
                title="Copy to clipboard"
            >
                {/* Copy icon using SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
            </div>
            {/* Spread all props to the input tag */}
            <input 
                {...props} 
                ref={inputRef}
            />
        </div>
    )
}