import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../Supabase'
import { setUserId } from '../../Global/authSlice'
import './AuthProvider.css'


function AuthProvider({ children }) {
  const dispatch = useDispatch()
  const userId = useSelector(state => state.auth?.userId)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const { data } = await supabase.auth.getSession()
        const session = data?.session
        const uid = session?.user?.id || null
        if (mounted) {
          dispatch(setUserId(uid))
        }
      } catch (e) {
        // non-fatal
      } finally {
        if (mounted) setChecking(false)
      }
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id || null
      dispatch(setUserId(uid))
    })

    return () => {
      mounted = false
      listener?.subscription?.unsubscribe?.()
    }
  }, [dispatch])

  async function handleSignIn() {
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
  }

  async function handleSignUp() {
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
  }

  if (checking) {
    // Lightweight splash while checking session
    return null
  }

  if (!userId) {
    return (
      <div className="auth-overlay">
        <div className="auth-card">
          <h3 className="auth-title">{mode === 'signin' ? 'Sign in' : 'Create account'}</h3>
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {mode === 'signin' ? (
            <>
              <button className="auth-btn" onClick={handleSignIn}>Sign in</button>
              <button className="auth-btn auth-btn-alt" onClick={() => setMode('signup')}>Create an account</button>
            </>
          ) : (
            <>
              <button className="auth-btn" onClick={handleSignUp}>Create account</button>
              <button className="auth-btn auth-btn-alt" onClick={() => setMode('signin')}>Have an account? Sign in</button>
            </>
          )}
          <div className="auth-error">{error}</div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default AuthProvider