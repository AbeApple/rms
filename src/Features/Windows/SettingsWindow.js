import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setShowSettings } from '../../Global/store'
import Window from './Window'

export default function SettingsWindow() {
    const showSettings = useSelector(state => state.ui.showSettings)
    const dispatch = useDispatch()

    if (!showSettings)
        return (<></>)
    else
        return (
            <Window 
                onClose={() => dispatch(setShowSettings(false))}
                className="settingsWindow"
            >
                <div className="windowContent">
                    <h2>Settings</h2>
                    <div className="settingsSection">
                        <h3>Calendar Options</h3>
                        {/* Settings options will go here */}
                    </div>
                </div>
            </Window>
        )
}
