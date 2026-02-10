import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, usersAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount: validate existing token
  useEffect(() => {
    const saved = localStorage.getItem('diro_user')
    if (!saved) {
      setLoading(false)
      return
    }
    try {
      const parsed = JSON.parse(saved)
      if (!parsed.token) {
        localStorage.removeItem('diro_user')
        setLoading(false)
        return
      }
      // Set user immediately so token is available for API calls
      setUser(parsed)
      // Validate token by fetching fresh profile
      usersAPI.getProfile()
        .then((data) => {
          const freshUser = { ...data.user, token: parsed.token }
          setUser(freshUser)
          localStorage.setItem('diro_user', JSON.stringify(freshUser))
        })
        .catch(() => {
          // Token invalid — clear everything
          setUser(null)
          localStorage.removeItem('diro_user')
        })
        .finally(() => setLoading(false))
    } catch {
      localStorage.removeItem('diro_user')
      setLoading(false)
    }
  }, [])

  const login = async (email, password, role) => {
    const data = await authAPI.login(email, password, role)
    const userData = { ...data.user, token: data.token }
    setUser(userData)
    localStorage.setItem('diro_user', JSON.stringify(userData))
    return userData
  }

  const signup = async (name, email, password, role) => {
    const data = await authAPI.register(name, email, password, role)
    const userData = { ...data.user, token: data.token }
    setUser(userData)
    localStorage.setItem('diro_user', JSON.stringify(userData))
    return userData
  }

  const updateUser = (data) => {
    setUser((prev) => {
      const updated = { ...prev, ...data }
      localStorage.setItem('diro_user', JSON.stringify(updated))
      return updated
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('diro_user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
