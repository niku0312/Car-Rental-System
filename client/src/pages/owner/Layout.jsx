import React from 'react'
import NavbarOwner from '../../components/owner/NavbarOwner'
import Sidebar from '../../components/owner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { useEffect } from 'react'
import { div } from 'motion/react-client'

const Layout = () => {

  const { isOwner, navigate, checkingAuth } = useAppContext()

  useEffect(() => {
    //only redirect after auth check is complete
    if (!isOwner && !checkingAuth) {
      console.log('Redirecting to home - not an owner');
      navigate('/');
    }
  }, [isOwner, checkingAuth, navigate])

  //show loading state while checking auth
  if (checkingAuth) {
    return(
       <div className="flex items-center justify-center h-screen">
      <p>Loading...</p>
    </div>
    )
  }

  //Block rendering for non-owners
  if(!isOwner){
    return null;
  }

  return (
    <div className='flex flex-col'>
      <NavbarOwner />
      <div className='flex'>
        <Sidebar />
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
