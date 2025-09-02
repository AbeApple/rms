import React from 'react'
import { useDispatch } from 'react-redux'
import { scrollToToday } from '../../../Global/functions'
import { setShowMenu } from '../../../Global/store'
import homeIcon from './icons/home.svg'
import menuIcon from './icons/menu.svg'
import './WeekdayBar.css'

export default function WeekdayBar() {
  const dispatch = useDispatch()
  return (
    <div className='calendarWeekdays'>

    <div className='weekdayBox'>
      <div className='menuButtonContainer' onClick={scrollToToday}>
        <img src={homeIcon} alt="Home" className='menuButtonIcon menuButtonIconLeft' />
      </div>

      <span className='full-day-name'>Sunday</span>
      <span className='short-day-name'>Sun</span>
      <span className='mini-day-name'>S</span>
    </div>

    <div className="weekdayBox">
      <span className='full-day-name'>Monday</span>
      <span className='short-day-name'>Mon</span>
      <span className='mini-day-name'>M</span>
    </div>

    <div className="weekdayBox">
      <span className='full-day-name'>Tuesday</span>
      <span className='short-day-name'>Tue</span>
      <span className='mini-day-name'>T</span>
    </div>
    <div className="weekdayBox">
      <span className='full-day-name'>Wednesday</span>
      <span className='short-day-name'>Wed</span>
      <span className='mini-day-name'>W</span>
    </div>
    <div className="weekdayBox">
      <span className='full-day-name'>Thursday</span>
      <span className='short-day-name'>Thu</span>
      <span className='mini-day-name'>T</span>
    </div>
    <div className="weekdayBox">
      <span className='full-day-name'>Friday</span>
      <span className='short-day-name'>Fri</span>
      <span className='mini-day-name'>F</span>
    </div>
    <div className="weekdayBox">
      <div className='menuButtonContainer' onClick={() => dispatch(setShowMenu(true))}>
        <img src={menuIcon} alt="Menu" className='menuButtonIcon' />
      </div>

      <span className='full-day-name'>Saturday</span>
      <span className='short-day-name'>Sat</span>
      <span className='mini-day-name'>S</span>
    </div>
    {/* <div style={{width: "14px"}}></div> */}
  </div>
  )
}