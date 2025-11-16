import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import CarDetails from './pages/CarDetails'
import Cars from './pages/Cars'
import MyBookings from './pages/MyBookings'
import Footer from './components/Footer'
import Layout from './pages/owner/Layout'
import Dashboard from './pages/owner/Dashboard'
import AddCar from './pages/owner/AddCar'
import ManageCar from './pages/owner/ManageCars'
import ManageBookings from './pages/owner/ManageBookings'
import Login from './components/Login'
import { Toaster } from 'react-hot-toast'
import { useAppContext } from './context/AppContext'
import AdminLogin from './pages/Admin/Login'
import AdminDashboard from './pages/Admin/Dashboard'
import ManageOwners from './pages/Admin/ManageOwners'
import ManageCars from './pages/Admin/ManageCars'
import ManageUsers from './pages/Admin/ManageUsers'
import AdminLayout from './components/Admin/AdminLayout'
import Verification from './pages/owner/Verification'

const App = () => {
  const { showLogin } = useAppContext()
  // console.log("APP showLogin:", showLogin, "type:", typeof showLogin);

  const location = useLocation()

  const isOwnerPath = location.pathname.startsWith('/owner')
  const isAdminPath = location.pathname.startsWith('/admin')

  //combine both conditions
  const hideNavAndFooter = isOwnerPath || isAdminPath

  return (
    <>
      {showLogin && <Login />}

      {!hideNavAndFooter && <Navbar />}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/car-details/:id' element={<CarDetails />} />
        <Route path='/cars' element={<Cars />} />
        <Route path='/my-bookings' element={<MyBookings />} />

        <Route path='/owner' element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path='add-car' element={<AddCar />} />
          <Route path='manage-cars' element={<ManageCar />} />
          <Route path='verification' element={<Verification />} />

          <Route path='manage-bookings' element={<ManageBookings />} />
        </Route>

        <Route path='/admin/login' element={<AdminLogin />} />

        <Route element={<AdminLayout />}>
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
          <Route path='/admin/manage-owners' element={<ManageOwners />} />
          <Route path='/admin/manage-cars' element={<ManageCars />} />
          <Route path='/admin/manage-users' element={<ManageUsers />} />
        </Route>
      </Routes>

      {!hideNavAndFooter && <Footer />}

      <Toaster />
    </>
  )
}

export default App
