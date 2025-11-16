import React, { useState } from 'react'
import { assets, menuLinks } from '../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion as Motion } from 'motion/react'

const Navbar = () => {
  const {
    setShowLogin,
    user,
    logout,
    isOwner,
    axios,
    setIsOwner,
    fetchUser,
    globalSearch,
    setGlobalSearch
  } = useAppContext()

  const location = useLocation()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  //if admin token exists
  const isAdminLoggedIn = !!localStorage.getItem('admintoken')

  const handleAdminLogin = () => {
    if (isAdminLoggedIn) {
      navigate('/admin/dashboard')
    } else {
      navigate('/admin/login')
    }
  }

  const changeRole = async () => {
    if (!user) {
      toast.error('Please login to list your cars')
      // setShowLogin(true);
      return
    }

    try {
      const { data } = await axios.post('/api/owner/change-role')

      if (data.success) {
        setIsOwner(true)
        toast.success(data.message)
        await fetchUser()
        navigate('/owner/verification')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleOwnerClick = () => {
    if (!isOwner) {
      changeRole()
      return
    }

    if (user?.isVerified) {
      navigate('/owner')
    } else {
      navigate('/owner/verification')
    }
  }

  const ownerButtonLabel = isOwner
    ? user?.isVerified
      ? 'Dashboard'
      : 'Complete Verification'
    : 'List Cars'

  const handleNavSearch = event => {
    event.preventDefault()
    const query = globalSearch.trim()

    if (query.length === 0) {
      setGlobalSearch('')
      navigate('/cars')
    } else {
      setGlobalSearch(query)
      navigate(`/cars?search=${encodeURIComponent(query)}`)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      // initial={{ y: -20, opacity: 0 }}
      // animate={{ y: 0, opacity: 1 }}
      // transition={{ duration: 0.5 }}
      className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 text-gray-600 border-b border-borderColor relative transition-all ${location.pathname === '/' && 'bg-light'
        }`}
    >
      <Link to='/'>
        <Motion.img
          whileHover={{ scale: 1.05 }}
          src={assets.logo}
          alt='logo'
          className='h-8'
        />
      </Link>

      <div
        className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16 max-sm:border-t border-borderColor right-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 transition-all duration-300 z-50 ${location.pathname === '/' ? 'bg-light' : 'bg-white'
          } ${open ? 'max-sm: translate-x-0' : 'max-sm:translate-x-full'}`}
      >
        {menuLinks.map((link, index) => (
          <Link key={index} to={link.path}>
            {link.name}
          </Link>
        ))}

        <form
          onSubmit={handleNavSearch}
          className='hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56'
        >
          <input
            type='search'
            className='py-1.5 w-full bg-transparent outline-none placeholder-gray-500'
            placeholder='Search cars'
            value={globalSearch}
            onChange={event => setGlobalSearch(event.target.value)}
            aria-label='Search cars'
          />
          <button
            type='submit'
            className='p-1 text-gray-500 hover:text-gray-700 transition'
          >
            <img src={assets.search_icon} alt='search' />
          </button>
        </form>

        <div className='flex max-sm:flex-col items-start sm:items-center gap-6'>
          <button onClick={handleOwnerClick} className='cursor-pointer'>
            {ownerButtonLabel}
          </button>

          <button
            onClick={() => {
              user ? logout() : setShowLogin(true)
            }}
            className='cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg'
          >
            {user ? 'Logout' : 'Login'}
          </button>

          {/* <button onClick={handleAdminLogin} className='cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg ml-2'>Admin{' '}</button> */}
        </div>
      </div>

      <button
        className='sm:hidden cursor-pointer'
        aria-label='Menu'
        onClick={() => setOpen(!open)}
      >
        <img src={open ? assets.close_icon : assets.menu_icon} alt='menu' />
      </button>
    </div>
  )
}
export default Navbar
