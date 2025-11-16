import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FaCheck, FaTimes, FaIdBadge } from 'react-icons/fa'

const initialModalState = { open: false, type: null, request: null }

const ManageOwners = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalState, setModalState] = useState(initialModalState)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchVerificationRequests = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admintoken')
      const { data } = await axios.get('/api/admin/verification-requests', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setRequests(data.requests || [])
      } else {
        toast.error(data.message || 'Failed to fetch verification requests')
        setRequests([])
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVerificationRequests()
  }, [])

  const closeModal = () => {
    if (submitting) return
    setModalState(initialModalState)
    setNote('')
  }

  const openModal = (request, type) => {
    setModalState({ open: true, type, request })
    setNote('')
  }

  const modalTitle = useMemo(() => {
    if (modalState.type === 'approve') return 'Approve verification request'
    if (modalState.type === 'reject') return 'Reject verification request'
    return ''
  }, [modalState.type])

  const modalCtaLabel =
    modalState.type === 'reject' ? 'Reject request' : 'Approve request'

  const noteLabel =
    modalState.type === 'reject' ? 'Rejection reason' : 'Admin notes (optional)'

  const handleSubmit = async () => {
    if (!modalState.request) return

    const trimmedNote = note.trim()

    if (modalState.type === 'reject' && !trimmedNote) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('admintoken')
      const endpoint =
        modalState.type === 'approve'
          ? `/api/admin/verification-user/${modalState.request._id}`
          : `/api/admin/reject-user/${modalState.request._id}`

      const payload =
        modalState.type === 'approve'
          ? { adminNotes: trimmedNote }
          : { rejectionReason: trimmedNote }

      const { data } = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        toast.success(
          modalState.type === 'approve'
            ? 'Owner verified successfully'
            : 'Verification request rejected'
        )
        closeModal()
        fetchVerificationRequests()
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
        Owner Verification Requests
      </h1>

      {loading ? (
        <div className='text-center text-lg text-gray-500 py-10'>
          Loading...
        </div>
      ) : requests.length === 0 ? (
        <div className='text-center text-lg text-amber-600 py-10'>
          No pending requests.
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full shadow border rounded-xl bg-white'>
            <thead className='bg-blue-50'>
              <tr>
                <th className='p-3 text-left'>Owner</th>
                <th className='p-3 text-left'>Email</th>
                <th className='p-3 text-left'>Documents</th>
                <th className='p-3 text-left'>Submitted At</th>
                <th className='p-3 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req._id} className='border-b last:border-none'>
                  <td className='p-3 flex items-center gap-3'>
                    <FaIdBadge className='text-indigo-500 text-lg' />
                    <span className='font-semibold text-gray-800'>
                      {req.userId?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className='p-3'>{req.userId?.email || '-'}</td>
                  <td className='p-3'>
                    {req.documents && req.documents.length > 0 ? (
                      <div className='flex flex-col gap-1'>
                        {req.documents.map((docUrl, index) => (
                          <a
                            key={docUrl}
                            href={docUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 underline'
                          >
                            Document {index + 1}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className='text-gray-400'>Not Provided</span>
                    )}
                  </td>
                  <td className='p-3'>
                    {req.submittedAt
                      ? new Date(req.submittedAt).toLocaleString()
                      : '-'}
                  </td>
                  <td className='p-3 flex items-center gap-4 justify-center'>
                    <button
                      className='bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm'
                      title='Approve'
                      onClick={() => openModal(req, 'approve')}
                    >
                      <FaCheck />
                      Approve
                    </button>
                    <button
                      className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm'
                      title='Reject'
                      onClick={() => openModal(req, 'reject')}
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
                  ? 'Confirm the owner has supplied valid documents. You may leave an optional note for record keeping.'
                  : 'Provide a clear reason so the owner understands what to fix before resubmitting.'}
              </p>
            </div>

            {modalState.request && (
              <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 space-y-1'>
                <p>
                  <span className='font-medium text-gray-700'>Owner:</span>{' '}
                  {modalState.request.userId?.name || 'Unknown'}
                </p>
                <p>
                  <span className='font-medium text-gray-700'>Email:</span>{' '}
                  {modalState.request.userId?.email || '-'}
                </p>
                {modalState.request.submittedAt && (
                  <p>
                    <span className='font-medium text-gray-700'>
                      Submitted:
                    </span>{' '}
                    {new Date(modalState.request.submittedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <div className='space-y-2'>
              <label
                htmlFor='admin-note'
                className='text-sm font-medium text-gray-700'
              >
                {noteLabel}
              </label>
              <textarea
                id='admin-note'
                rows={modalState.type === 'reject' ? 4 : 3}
                className='w-full rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm p-3 resize-none transition'
                placeholder={
                  modalState.type === 'reject'
                    ? 'Explain why the documents are insufficient...'
                    : 'Optional note for internal tracking'
                }
                value={note}
                onChange={event => setNote(event.target.value)}
                disabled={submitting}
              />
              {modalState.type === 'reject' && (
                <p className='text-xs text-gray-500'>
                  This message will be shared with the owner.
                </p>
              )}
            </div>

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

export default ManageOwners
