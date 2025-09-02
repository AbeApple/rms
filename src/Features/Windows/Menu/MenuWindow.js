import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setShowMenu } from '../../../Global/store'
import Window from '../Window'
import "./MenuWindow.css"
import Settings from "./Settings/Settings"
import Search from "./Search/Search"
import Stats from "./Stats/Stats"

export default function MenuWindow() {
    const showMenu = useSelector(state => state.ui.showMenu)
    const dispatch = useDispatch()

    const [tab, setTab] = useState("Search")
    const tabs = ["Search", "Stats", "Settings"]

    if (!showMenu)
        return (<></>)
    else
        return (
            <Window 
                onClose={() => dispatch(setShowMenu(false))}
                className="menuWindow"
            >
                <div className="windowContent">
                    <div className='menuTabs'>
                        {tabs.map(tabName => (
                            <div 
                                onClick={()=>setTab(tabName)}
                                className={'menuTab '+(tabName === tab ? "selected":"")} 
                            >
                                {tabName}
                            </div>
                        ))}
                    </div>
                    {tab === "Search" &&
                        <Search></Search>
                    }
                    {tab === "Stats" &&
                        <Stats></Stats>
                    }
                    {tab === "Settings" &&
                        <Settings></Settings>
                    }
                </div>
            </Window>
        )
}
