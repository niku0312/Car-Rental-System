import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FaUser, FaUserShield, FaUserTie } from 'react-icons/fa'

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admintoken')
      const { data } = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setUsers(data.users || [])
      } else {
        toast.error(data.message || 'Failed to load users')
        setUsers([])
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const getRoleIcon = role => {
    switch (role) {
      case 'admin':
        return <FaUserShield className='text-indigo-600' />
      case 'owner':
        return <FaUserTie className='text-blue-600' />
      default:
        return <FaUser className='text-emerald-600' />
    }
  }

  const formatVerification = user => {
    if (user.isVerified) return 'Verified'
    if (user.verificationStatus === 'pending') return 'Pending'
    if (user.verificationStatus === 'rejected') return 'Rejected'
    return 'Not Verified'
  }

  return (
    <div className='min-h-screen bg-slate-50 py-8 px-4'>
      <h1 className='text-3xl md:text-4xl font-bold text-blue-900 mb-7'>
        Manage Users
      </h1>
      {loading ? (
        <div className='text-center text-lg text-gray-500 py-10'>
          Loading...
        </div>
      ) : users.length === 0 ? (
        <div className='text-center text-lg text-amber-600 py-10'>
          No users found.
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full shadow border rounded-xl bg-white'>
            <thead className='bg-blue-50'>
              <tr>
                <th className='p-3 text-left'>Name</th>
                <th className='p-3 text-left'>Email</th>
                <th className='p-3 text-left'>Role</th>
                <th className='p-3 text-left'>Verification</th>
                <th className='p-3 text-left'>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className='border-b last:border-none'>
                  <td className='p-3 font-semibold flex items-center gap-2'>
                    {getRoleIcon(user.role)}
                    {user.name}
                  </td>
                  <td className='p-3'>{user.email}</td>
                  <td className='p-3 capitalize'>
                    <span
                      className={
                        user.role === 'admin'
                          ? 'font-bold text-indigo-700'
                          : user.role === 'owner'
                          ? 'font-bold text-blue-600'
                          : 'font-bold text-emerald-700'
                      }
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className='p-3'>{formatVerification(user)}</td>
                  <td className='p-3'>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ManageUsers
