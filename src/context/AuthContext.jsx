import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  getToken,
  setToken,
  fetchMe,
  login as apiLogin,
  signup as apiSignup,
  deleteAccount as apiDeleteAccount,
  requestOtp as apiRequestOtp,
  verifyOtp as apiVerifyOtp,
} from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    fetchMe()
      .then((res) => setUser(res.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (creds) => {
    const res = await apiLogin(creds)
    setToken(res.token)
    setUser(res.user)
    return res.user
  }, [])

  const signup = useCallback(async (data) => {
    const res = await apiSignup(data)
    setToken(res.token)
    setUser(res.user)
    return res.user
  }, [])

  const requestOtp = useCallback(async (email) => {
    await apiRequestOtp({ email })
  }, [])

  const loginWithOtp = useCallback(async ({ email, code, name }) => {
    const res = await apiVerifyOtp({ email, code, name })
    setToken(res.token)
    setUser(res.user)
    return res.user
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const deleteAccount = useCallback(async () => {
    await apiDeleteAccount()
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, requestOtp, loginWithOtp, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
