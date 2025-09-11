import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '../Supabase.js'
import "./InputSupabase.css"
import InputCopy from '../../Components/InputCopy.js'
import { formatValue } from '../../Global/functions.js'
/**
 * InputSupabase Component
 * 
 * A generic component for displaying and editing data in Supabase tables
 * Handles both view and edit modes with automatic saving
 * 
 * @param {string} props.table - Database table name
 * @param {string} props.column - Database column name
 * @param {string} props.recordId - Record ID in the database (or 'new' for new records)
 * @param {string} props.defaultValue - Initial value to display
 * @param {string} props.type - Input type (text, textarea, select, etc.)
 * @param {string} props.label - Label for the input field
 * @param {boolean} props.fullWidth - If true, the input will take full width
 * @param {Array} props.options - Options for select inputs
 * @param {boolean} props.viewModeOverride - If true, displays in view-only mode
 * @param {Function} props.onUpdate - Optional callback when value is updated
 */
export default function InputSupabase(props) {

  const {  
    table,
    column,
    recordId,
    defaultValue,
    type = 'text',
    label,
    fullWidth,
    options,
    viewModeOverride,
    onSaveStart = ()=>{},
    // sends back (new value, id, column name)
    onSaved = ()=>{},
    // sends back (new value, new id, column name)
    onCreatedNew,
    showCopyButton,
    placeholder,
    // The parent component can tell this component to defer saving (until the current record creation operation in another inputsupabase completes)
    defer,
    isCreatingRef,
    ...otherProps
  } = props

  // After this amount of inactivity after an input the input will save
  const timeout = 500 // ms
  const inputTimeout = useRef()
  
  // Current value state

  const recordIdRef = useRef()
  useEffect(()=>{
    recordIdRef.current = recordId
  },[recordId])

  // Changes from an input to a display
  const [viewMode, setViewMode] = useState(true)
  
  // Saving and creating state
  const [saveError, setSaveError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  function saveStart(){
    setIsSaving(true)
    setSaveError()
  }
  function saved(data){
    setIsSaving(false)
    onSaved(data)

  }
  function createStart(){
    setSaveError()
    if(isCreatingRef)
      isCreatingRef.current = true
  }
  function created(data){
    if(isCreatingRef)
      isCreatingRef.current = false
    setIsSaving(false)
    if(onCreatedNew)
      onCreatedNew(data)
    else
      onSaved(data)
  }

  // The parent component can set the view mode if the prop changes
  useEffect(() => {
    setViewMode(viewModeOverride)
  }, [viewModeOverride])

  // Saves the data after a delay
  function inputUpdated(value) {
    
    // Clear the timeout so it only saves once after the timeout interval
    clearTimeout(inputTimeout.current)

    // After the timeout interval save the value to the database
    inputTimeout.current = setTimeout(() => {
      // If its not currently creating a new record save the new value
      if(!isCreatingRef || !isCreatingRef.current){
        saveToDb(value)
      }
      // If currently creating a new record wait for that to complete to have id to save it in
      else{
        setTimeout(() => {
          saveToDb(value)
        }, 250);
      }
    }, timeout)
  }

  /**
   * Save data to Supabase database
   * @param {any} value - Value to save
   */
  async function saveToDb(value) {
  
    // Check to ensure proper table and column
    if (!table || !column) {
      console.error('Missing table or column for database operation')
      return
    }
    

    // Format special values if needed (boolean, numbers etc)
    let formattedValue = formatValue(value);
    
    // If saving
    if(recordIdRef.current && recordIdRef.current !== "new"){
      saveStart()

      let result = await supabase
      .from(table)
      .update({ [column]: formattedValue })
      .eq('id', recordIdRef.current)
      .select()

      saved(result?.data[0])

      console.log("saved record result: ", result)

    }
    // If creating
    else{
      createStart()

      let result = await supabase
      .from(table)
      .insert({ [column]: formattedValue })
      .select()

      created(result?.data[0])

      console.log("created record result: ", result)

    }

  }
  
  /**
   * Toggle between view and edit modes
   */
  function toggleEditMode() {
    setViewMode(!viewMode)
  }

  // No need for a separate render function

  // Simplest possible rendering
  if (viewMode) {
    return <span>{defaultValue || ''}</span>
  }
  
  // For edit mode, return the appropriate input directly
  return (
    <>
      {label && <span>{label + ': '}</span>}
      {type === 'textarea' && (
        <textarea 
          className={fullWidth ? 'full-width' : ''}
          placeholder={placeholder || column}
          onChange={(e) => inputUpdated(e.target.value)}
          defaultValue={defaultValue}
        />
      )}
      {type === 'select' && (
        <select 
          className={props.className}
          onChange={(e) => inputUpdated(e.target.value)}
          defaultValue={defaultValue}
        >
          {options?.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      )}
      {type !== 'textarea' && type !== 'select' && (
        <InputCopy 
          {...otherProps} 
          className={fullWidth ? 'full-width' : props.className || 'half-width'}
          showCopyButton={showCopyButton}
          onChange={(e) => inputUpdated(e.target.value)}
          defaultValue={defaultValue}
          placeholder={placeholder || column}
          type={type}
        />
      )}
      {saveError && <small style={{ color: 'red' }}>{saveError}</small>}
    </>
  )
}