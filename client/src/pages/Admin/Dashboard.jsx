import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  FaUsers,
  FaUserShield,
  FaCar,
  FaClipboardList,
  FaCheck,
  FaUserCheck,
  FaUserTimes,
  FaClock,
  FaBan
} from 'react-icons/fa'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admintoken')
    if (!token) {
      navigate('/admin/login')
      return
    }

    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/admin/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (data.success) {
          setStats(data.stats)
        } else {
          toast.error(data.message || 'Failed to load dashboard stats')
          setStats(null)
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [navigate])

  const cards = useMemo(() => {
    if (!stats) return []

    return [
      // {
      //   label: 'Total Users',
      //   value: stats.users.total,
      //   icon: <FaUsers className='text-blue-700' />
      // },
      {
        label: 'Total Owners',
        value: stats.users.owners,
        icon: <FaUserShield className='text-indigo-600' />
      },
      {
        label: 'Verified Owners',
        value: stats.users.verifiedOwners,
        icon: <FaUserCheck className='text-emerald-600' />
      },
      {
        label: 'Regular Users',
        value: stats.users.regularUsers,
        icon: <FaUserTimes className='text-amber-600' />
      },
      {
        label: 'Pending Owner Verifications',
        value: stats.verifications.pending,
        icon: <FaClock className='text-yellow-500' />
      },
      // {
      //   label: 'Total Cars',
      //   value: stats.cars.total,
      //   icon: <FaCar className='text-cyan-700' />
      // },
      {
        label: 'Approved Cars',
        value: stats.cars.approved,
        icon: <FaCheck className='text-green-600' />
      },
      {
        label: 'Pending Car Verifications',
        value: stats.cars.pending,
        icon: <FaClock className='text-yellow-500' />
      },
      // {
      //   label: 'Total Bookings',
      //   value: stats.bookings.total,
      //   icon: <FaClipboardList className='text-blue-400' />
      // },
      // {
      //   label: 'Confirmed Bookings',
      //   value: stats.bookings.confirmed,
      //   icon: <FaCheck className='text-green-600' />
      // },
      // {
      //   label: 'Pending Bookings',
      //   value: stats.bookings.pending,
      //   icon: <FaClock className='text-yellow-500' />
      // },
      // {
      //   label: 'Cancelled Bookings',
      //   value: stats.bookings.cancelled,
      //   icon: <FaBan className='text-red-600' />
      // }
    ]
  }, [stats])

  if (loading) {
    return (
      <div className='flex justify-center items-center my-12 text-lg font-semibold text-gray-500'>
        Loading dashboard...
      </div>
    )
  }

  if (!stats) {
    return (
      <div className='flex justify-center items-center my-12 text-lg font-semibold text-red-500'>
        Unable to load dashboard stats.
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-50 py-8 px-6'>
      <h1 className='text-4xl md:text-5xl font-bold text-blue-900 mb-8 tracking-tight'>
        Admin Dashboard
      </h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7'>
        {cards.map(card => (
          <div
            key={card.label}
            className='flex bg-white rounded-2xl shadow-md hover:shadow-xl transition-all py-7 px-6 items-center'
          >
            <div className='rounded-full flex items-center justify-center h-14 w-14 bg-blue-50 mr-6 text-3xl'>
              {card.icon}
            </div>
            <div className='flex flex-col'>
              <span className='text-gray-700 text-base font-semibold'>
                {card.label}
              </span>
              <span className='mt-1 text-3xl font-extrabold text-blue-900'>
                {card.value ?? '-'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard
