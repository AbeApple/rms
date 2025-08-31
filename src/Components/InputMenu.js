export default function InputMenu(){
    
    const [showMenu, setShowMenu] = useState(false)

    return (
        <div>
            <div onClick={()=>setShowMenu(!showMenu)}></div>
            <input></input>
            {showMenu && <div></div>}
        </div>
    )
}