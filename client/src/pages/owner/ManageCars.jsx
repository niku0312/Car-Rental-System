import React, { useCallback, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
// import { pre } from 'motion/react-client'

const ManageCars = () => {
  const { isOwner, axios, currency, setCars } = useAppContext()

  const [ownerCars, setOwnerCars] = useState([])
  const [deleteState, setDeleteState] = useState({ open: false, car: null })
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchOwnerCars = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/owner/cars')
      if (data.success) {
        setOwnerCars(data.cars)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }, [axios])

  //toggle availability (updates both local and global states)
  const toggleAvailability = async carId => {
    try {
      const { data } = await axios.post('/api/owner/toggle-car', { carId })
      if (data.success) {
        toast.success(data.message)

        //update local list instantly
        setOwnerCars(prev =>
          prev.map(car =>
            car._id === carId ? { ...car, isAvailable: !car.isAvailable } : car
          )
        )

        //update global shared cars list
        setCars(prev =>
          prev.map(car =>
            car._id === carId ? { ...car, isAvailable: !car.isAvailable } : car
          )
        )
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  //delete a car (sync local + global instantly)

  const deleteCar = async carId => {
    try {
      setDeleteLoading(true)
      const { data } = await axios.post('/api/owner/delete-car', { carId })
      if (data.success) {
        toast.success('Car Deleted Successfully')

        //update both local and global state by filtering out deleted car
        setOwnerCars(prev => prev.filter(car => car._id !== carId))
        setCars(prev => prev.filter(car => car._id !== carId))
        setDeleteState({ open: false, car: null })
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  useEffect(() => {
    if (isOwner) {
      fetchOwnerCars()
    }
  }, [isOwner, fetchOwnerCars])

  return (
    <div className='px-4 pt-10 md:px-10 w-full'>
      <Title
        title='Manage Cars'
        subTitle='View all listed cars, update their details, or remove them from the booking platform'
      />

      <div className='max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>
        <table className='w-full border-collapse text-left text-sm text-gray-600'>
          <thead className='text-gray-500'>
            <tr>
              <th className='p-3 font-medium'>Car</th>
              <th className='p-3 font-medium max-md:hidden'>Category</th>
              <th className='p-3 font-medium'>Price</th>
              <th className='p-3 font-medium max-md:hidden'>Review status</th>
              <th className='p-3 font-medium'>Actions</th>
            </tr>
          </thead>

          <tbody>
            {ownerCars.map(car => {
              const approvalStatus =
                car.approvalStatus ||
                (car.isApprovedByAdmin ? 'approved' : 'pending')
              const rejectionReason = car.rejectionReason || ''

              return (
                <tr key={car._id} className='border-t border-borderColor'>
                  <td className='p-3 flex items-center gap-3'>
                    <img
                      src={car.image}
                      alt=''
                      className='h-12 w-12 aspect-square rounded-md object-cover'
                    />

                    <div className='max-md:hidden'>
                      <p className='font-medium'>
                        {car.brand} {car.model}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {car.seating_capacity} • {car.transmission}
                      </p>
                    </div>
                  </td>

                  <td className='p-3 max-md:hidden'>{car.category}</td>
                  <td className='p-3'>
                    {currency}
                    {car.pricePerDay}/day
                  </td>

                  <td className='p-3 max-md:hidden'>
                    {approvalStatus === 'approved' ? (
                      <div className='flex flex-col gap-1'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            car.isAvailable
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {car.isAvailable
                            ? 'Live & bookable'
                            : 'Approved (hidden)'}
                        </span>
                        <span className='text-[10px] uppercase tracking-wide text-gray-400'>
                          Approved by admin
                        </span>
                      </div>
                    ) : approvalStatus === 'pending' ? (
                      <div className='flex flex-col gap-1'>
                        <span className='px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-600'>
                          Pending admin review
                        </span>
                        <span className='text-[10px] uppercase tracking-wide text-gray-400'>
                          We will notify you once decided
                        </span>
                      </div>
                    ) : (
                      <div className='flex flex-col gap-1'>
                        <span className='px-3 py-1 rounded-full text-xs bg-red-100 text-red-500'>
                          Rejected
                        </span>
                        {rejectionReason && (
                          <span className='text-xs text-red-400 max-w-[220px]'>
                            {rejectionReason}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className='flex items-center gap-3 p-3'>
                    {approvalStatus === 'approved' ? (
                      <img
                        onClick={() => toggleAvailability(car._id)}
                        src={
                          car.isAvailable
                            ? assets.eye_close_icon
                            : assets.eye_icon
                        }
                        alt='toggle availability'
                        className='cursor-pointer'
                      />
                    ) : (
                      <img
                        src={assets.eye_icon}
                        alt='availability locked'
                        className='opacity-30 cursor-not-allowed'
                        title='Available after admin approval'
                      />
                    )}
                    <img
                      onClick={() => setDeleteState({ open: true, car })}
                      src={assets.delete_icon}
                      alt='delete car'
                      className='cursor-pointer'
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {deleteState.open && deleteState.car && (
        <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4'>
            <div className='space-y-1'>
              <h2 className='text-xl font-semibold text-gray-800'>
                Delete listing?
              </h2>
              <p className='text-sm text-gray-500'>
                This removes the car from your owner dashboard and renters will
                no longer see it.
              </p>
            </div>

            <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 space-y-1'>
              <p>
                <span className='font-medium text-gray-700'>Car:</span>{' '}
                {deleteState.car.brand} {deleteState.car.model}
              </p>
              <p>
                <span className='font-medium text-gray-700'>Price:</span>{' '}
                {currency}
                {deleteState.car.pricePerDay}/day
              </p>
              <p>
                <span className='font-medium text-gray-700'>Status:</span>{' '}
                {deleteState.car.isAvailable ? 'Live' : 'Hidden'}
              </p>
            </div>

            <div className='flex flex-col-reverse sm:flex-row sm:justify-end gap-3'>
              <button
                type='button'
                onClick={() => setDeleteState({ open: false, car: null })}
                className='w-full sm:w-auto px-5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={() => deleteCar(deleteState.car._id)}
                disabled={deleteLoading}
                className={`w-full sm:w-auto px-5 py-2 rounded-lg text-white transition ${
                  deleteLoading
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {deleteLoading ? 'Deleting…' : 'Delete car'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageCars
