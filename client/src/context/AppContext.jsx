/* eslint-disable react-refresh/only-export-components */
import { useContext } from 'react'
import { createContext } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useEffect } from 'react'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

export const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const navigate = useNavigate()
  const currency = import.meta.env.VITE_CURRENCY

  const [token, _setToken] = useState(localStorage.getItem('token')) // initialize with localStorage
  const [user, setUser] = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  // const [isAdmin, setAdmin] = useState(false); //ADMIN
  const [showLogin, setShowLogin] = useState(false)
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')

  const [cars, setCars] = useState([])
  const [globalSearch, setGlobalSearch] = useState('')

  const [checkingAuth, setCheckingAuth] = useState(true)

  //function to check if user is logged in
  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/api/user/data')
      console.log('user data response:', data)

      if (data.success) {
        setUser(data.user)
        const ownerStatus = data.user.role === 'owner'
        setIsOwner(ownerStatus)
        setGlobalSearch('')
        localStorage.setItem('isOwner', JSON.stringify(ownerStatus))
        console.log('Set isOwner to: ', ownerStatus)
      } else {
        //Only navigate if explicitly not authorized
        setIsOwner(false)
        localStorage.removeItem('isOwner')
      }
    } catch (error) {
      const status = error.response?.status
      if (status && [401, 403].includes(status)) {
        console.warn('Auth check failed (likely logged out):', status)
      } else {
        toast.error('Failed to fetch user')
        toast.error(error.message)
      }
      setIsOwner(false)
      localStorage.removeItem('isOwner')
      // Don't navigate here - let layout handle it
    } finally {
      setCheckingAuth(false)
    }
  }

  //function to check if admin is logged in

  //function to fetch all cars from the server
  const fetchCars = async () => {
    try {
      const { data } = await axios.get('/api/user/cars')
      data.success ? setCars(data.cars) : toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
  }

  // wrapper for updating token so side-effects happen in one place
  const handleSetToken = newToken => {
    if (newToken) {
      // store token & set axios header
      localStorage.setItem('token', newToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      _setToken(newToken)

      // immediately fetch user so UI updates without a refresh
      fetchUser()
    } else {
      // clearing token //logout-like behavior
      localStorage.removeItem('token')
      axios.defaults.headers.common['Authorization'] = ''
      _setToken(null)
      setUser(null)
      setIsOwner(false)
      localStorage.removeItem('isOwner')
    }
  }

  // logout uses handleSetToken to centralize logic
  const logout = () => {
    handleSetToken(null)
    toast.success('You have been logged out')
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      // call the wrapper so headers + fetchUser happen consistently
      handleSetToken(savedToken)
    } else {
      setCheckingAuth(false)
    }

    fetchCars()
    // We intentionally run this effect once on mount to bootstrap auth + cars
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = {
    navigate,
    currency,
    axios,
    user,
    setUser,
    token,
    setToken: handleSetToken,
    isOwner,
    setIsOwner,
    fetchUser,
    showLogin,
    setShowLogin,
    logout,
    fetchCars,
    cars,
    setCars,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
    checkingAuth,
    setCheckingAuth,
    globalSearch,
    setGlobalSearch
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  return useContext(AppContext)
}
