import React from 'react'
import { isMobile } from 'react-device-detect'
import './Window.css'

export default function Window({onClose, children, className = ''}) {
  // Calculate window style based on mobile detection
  const windowStyle = isMobile ? { height: 'calc(95vh - 80px)' } : {};

  return (
    <div className={`window ${className}`} style={windowStyle}>
        {onClose && <div className='closeButton' onClick={onClose}>x</div>}
        {children}
    </div>
  )
}