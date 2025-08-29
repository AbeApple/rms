import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import "./Window.css"
import { setSelectedDay } from '../../Global/store'
import { dateString } from '../../Global/functions'

export default function DayWindow() {
    
    const selectedDay = useSelector(state => state.calendar.selectedDay)
    const disptch = useDispatch()

    if(!selectedDay)
        return(<></>)
    else
        return (
            <div className="window">
                <div className='closeButton' onClick={()=>disptch(setSelectedDay())}>x</div>
                <div>{"selectedDay: " + selectedDay}</div>
                <input type="date" defaultValue={selectedDay}></input>
            </div>
        )
}