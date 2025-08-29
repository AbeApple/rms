import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import "./Window.css"
import { setShowSettings } from '../../Global/store'

export default function SettingsWindow() {
    const showSettings = useSelector(state => state.ui.showSettings)
    const dispatch = useDispatch()

    if (!showSettings)
        return (<></>)
    else
        return (
            <div className="window">
                <div className='closeButton' onClick={() => dispatch(setShowSettings(false))}>x</div>
                <div className="windowContent">
                    <h2>Settings</h2>
                    <div className="settingsSection">
                        <h3>Calendar Options</h3>
                        {/* Settings options will go here */}
                    </div>
                </div>
            </div>
        )
}
