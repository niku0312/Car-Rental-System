import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FaCheck, FaTimes, FaCarSide } from 'react-icons/fa'

const initialModalState = { open: false, type: null, car: null }

const ManageCars = () => {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalState, setModalState] = useState(initialModalState)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchPendingCars = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admintoken')
      const { data } = await axios.get('/api/admin/pending-cars', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setCars(data.cars || [])
      } else {
        toast.error(data.message || 'Failed to fetch cars')
        setCars([])
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      setCars([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingCars()
  }, [])

  const openModal = (car, type) => {
    setModalState({ open: true, type, car })
    setNote('')
  }

  const closeModal = () => {
    if (submitting) return
    setModalState(initialModalState)
    setNote('')
  }

  const modalTitle = useMemo(() => {
    if (modalState.type === 'approve') return 'Approve car listing'
    if (modalState.type === 'reject') return 'Reject car listing'
    return ''
  }, [modalState.type])

  const modalCtaLabel =
    modalState.type === 'reject' ? 'Reject car' : 'Approve car'

  const noteLabel = 'Rejection reason'

  const handleSubmit = async () => {
    if (!modalState.car) return

    const trimmedNote = note.trim()

    if (modalState.type === 'reject' && !trimmedNote) {
      toast.error('Please provide a rejection reason')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('admintoken')
      const endpoint =
        modalState.type === 'approve'
          ? `/api/admin/approve-car/${modalState.car._id}`
          : `/api/admin/reject-car/${modalState.car._id}`

      const payload =
        modalState.type === 'reject' ? { reason: trimmedNote } : {}

      const { data } = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        toast.success(
          modalState.type === 'approve'
            ? 'Car approved successfully'
            : 'Car rejection recorded'
        )
        closeModal()
        fetchPendingCars()
      } else {
        toast.error(data.message || 'Action failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen bg-slate-50 py-8 px-4'>
      <h1 className='text-3xl md:text-4xl font-bold text-blue-900 mb-7'>
        Pending Car Approval
      </h1>
      {loading ? (
        <div className='text-center text-lg text-gray-500 py-10'>
          Loading...
        </div>
      ) : cars.length === 0 ? (
        <div className='text-center text-lg text-amber-600 py-10'>
          No pending cars for approval.
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full shadow border rounded-xl bg-white'>
            <thead className='bg-blue-50'>
              <tr>
                <th className='p-3 text-left'>Car</th>
                <th className='p-3 text-left'>Brand</th>
                <th className='p-3 text-left'>Owner</th>
                <th className='p-3 text-left'>Year</th>
                <th className='p-3 text-left'>Category</th>
                <th className='p-3 text-left'>Price/Day</th>
                <th className='p-3 text-left'>Location</th>
                <th className='p-3 text-left'>Ownership Proof</th>
                <th className='p-3 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map(car => (
                <tr key={car._id} className='border-b last:border-none'>
                  <td className='p-3 flex items-center gap-3'>
                    {car.image && (
                      <img
                        src={car.image}
                        alt={car.brand || 'Car'}
                        className='w-16 h-10 object-cover rounded shadow'
                      />
                    )}
                    <FaCarSide className='text-cyan-700 text-lg' />
                    <span className='font-semibold text-gray-800'>
                      {car.model || '-'}
                    </span>
                  </td>
                  <td className='p-3'>{car.brand || '-'}</td>
                  <td className='p-3'>
                    {car.owner?.name ? (
                      <span className='font-medium'>{car.owner.name}</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className='p-3'>{car.year || '-'}</td>
                  <td className='p-3'>{car.category || '-'}</td>
                  <td className='p-3 text-blue-900 font-bold'>
                    ₹{car.pricePerDay ?? 0}
                  </td>
                  <td className='p-3'>{car.location || '-'}</td>
                  <td className='p-3'>
                    {car.ownershipDocumentUrl ? (
                      <a
                        href={car.ownershipDocumentUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='text-blue-600 hover:text-blue-700 underline text-sm'
                      >
                        View proof
                      </a>
                    ) : (
                      <span className='text-gray-400 text-sm'>Missing</span>
                    )}
                  </td>
                  <td className='p-3 flex items-center gap-4 justify-center'>
                    <button
                      className='bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm'
                      title='Approve'
                      onClick={() => openModal(car, 'approve')}
                    >
                      <FaCheck />
                      Approve
                    </button>
                    <button
                      className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm'
                      title='Reject'
                      onClick={() => openModal(car, 'reject')}
                    >
                      <FaTimes />
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalState.open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'>
          <div className='bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5'>
            <div className='space-y-1'>
              <h2 className='text-xl font-semibold text-gray-800'>
                {modalTitle}
              </h2>
              <p className='text-sm text-gray-500'>
                {modalState.type === 'approve'
                  ? 'Double check the listing details before making it visible to renters. Optionally leave an internal note.'
                  : 'Share a short reason so the owner understands what to fix before they resubmit this listing.'}
              </p>
            </div>

            {modalState.car && (
              <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 space-y-1'>
                <p>
                  <span className='font-medium text-gray-700'>Car:</span>{' '}
                  {modalState.car.brand} {modalState.car.model}
                </p>
                <p>
                  <span className='font-medium text-gray-700'>Owner:</span>{' '}
                  {modalState.car.owner?.name || 'Unknown'}
                </p>
                {modalState.car.location && (
                  <p>
                    <span className='font-medium text-gray-700'>Location:</span>{' '}
                    {modalState.car.location}
                  </p>
                )}
                {modalState.car.ownershipDocumentUrl && (
                  <p>
                    <span className='font-medium text-gray-700'>Proof:</span>{' '}
                    <a
                      href={modalState.car.ownershipDocumentUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='text-blue-600 hover:text-blue-700 underline'
                    >
                      View ownership document
                    </a>
                  </p>
                )}
              </div>
            )}

            {modalState.type === 'reject' && (
              <div className='space-y-2'>
                <label
                  htmlFor='car-note'
                  className='text-sm font-medium text-gray-700'
                >
                  {noteLabel}
                </label>
                <textarea
                  id='car-note'
                  rows={4}
                  className='w-full rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm p-3 resize-none transition'
                  placeholder='Explain why this listing cannot go live yet...'
                  value={note}
                  onChange={event => setNote(event.target.value)}
                  disabled={submitting}
                />
                <p className='text-xs text-gray-500'>
                  This reason will be stored with the owner’s record.
                </p>
              </div>
            )}

            <div className='flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3'>
              <button
                type='button'
                onClick={closeModal}
                className='w-full sm:w-auto px-5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition'
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleSubmit}
                className={`w-full sm:w-auto px-5 py-2 rounded-lg text-white transition ${
                  modalState.type === 'reject'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                } ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={submitting}
              >
                {submitting ? 'Processing…' : modalCtaLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageCars
