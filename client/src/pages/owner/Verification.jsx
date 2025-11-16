import React, { useEffect, useMemo, useState } from 'react'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const statusConfig = {
  none: {
    label: 'Verification Required',
    helper:
      'Upload your government-issued ID and ownership proof to start the verification process.',
    tone: 'text-amber-600 bg-amber-50 border-amber-200'
  },
  pending: {
    label: 'Pending Review',
    helper:
      'Our admin team is reviewing your documents. We will notify you by email once a decision is made.',
    tone: 'text-blue-600 bg-blue-50 border-blue-200'
  },
  approved: {
    label: 'Approved',
    helper:
      'Your owner profile is fully verified. You can now add and manage cars without restrictions.',
    tone: 'text-emerald-600 bg-emerald-50 border-emerald-200'
  },
  rejected: {
    label: 'Rejected',
    helper:
      'Please review the feedback below, fix the issues, and resubmit your documents.',
    tone: 'text-red-600 bg-red-50 border-red-200'
  }
}

const Verification = () => {
  const { axios, user, fetchUser } = useAppContext()
  const [statusPayload, setStatusPayload] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const verificationStatus = useMemo(() => {
    const fromRequest = statusPayload?.verificationStatus
    const fromUser = user?.verificationStatus
    return (fromRequest || fromUser || 'none').toLowerCase()
  }, [statusPayload, user])

  const isVerified = statusPayload?.isVerified || user?.isVerified
  const canSubmit =
    !isVerified &&
    (verificationStatus === 'none' || verificationStatus === 'rejected')

  const fetchStatus = async () => {
    if (!user) return

    setRefreshing(true)
    try {
      const { data } = await axios.get('/api/verification/status')
      if (data.success) {
        setStatusPayload(data)
      } else {
        toast.error(data.message || 'Unable to fetch verification status')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id])

  const handleFileChange = event => {
    const selected = Array.from(event.target.files || []).slice(0, 5)
    setFiles(selected)
  }

  const resetForm = () => {
    setFiles([])
    const fileInput = document.getElementById('verification-documents')
    if (fileInput) fileInput.value = ''
  }

  const submitRequest = async event => {
    event.preventDefault()
    if (!files.length) {
      toast.error('Please attach at least one supporting document')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      files.forEach(file => formData.append('documents', file))

      const { data } = await axios.post(
        '/api/verification/request-owner',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )

      if (data.success) {
        toast.success(data.message || 'Verification request submitted')
        resetForm()
        await fetchStatus()
        await fetchUser()
      } else {
        toast.error(data.message || 'Failed to submit verification request')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const statusMeta = statusConfig[verificationStatus] || statusConfig.none
  const latestRequest = statusPayload?.request

  if (loading) {
    return (
      <div className='px-4 pt-10 md:px-10 flex-1'>
        <p>Loading verification details...</p>
      </div>
    )
  }

  return (
    <div className='px-4 pt-10 md:px-10 flex-1'>
      <Title
        title='Owner Verification'
        subTitle='Submit proof of identity and vehicle ownership to unlock the ability to publish listings on the marketplace.'
      />

      <div className={`border ${statusMeta.tone} rounded-xl p-5 mb-8`}>
        <h2 className='text-lg font-semibold'>{statusMeta.label}</h2>
        <p className='text-sm mt-2'>{statusMeta.helper}</p>

        {verificationStatus === 'rejected' && (
          <p className='mt-3 text-sm text-red-600'>
            <span className='font-medium'>Admin feedback:</span>{' '}
            {statusPayload?.rejectionReason || 'No reason provided'}
          </p>
        )}

        {verificationStatus === 'pending' && latestRequest?.submittedAt && (
          <p className='mt-3 text-sm'>
            Submitted on {new Date(latestRequest.submittedAt).toLocaleString()}.
            We usually respond within 24 hours.
          </p>
        )}

        {isVerified && (
          <p className='mt-3 text-sm'>
            Thank you for completing verification. You can now add cars under
            the “Add Car” tab.
          </p>
        )}
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 items-start'>
        <form
          onSubmit={submitRequest}
          className='border border-borderColor rounded-xl p-6 space-y-5'
        >
          <div>
            <h3 className='font-medium text-lg'>Upload documents</h3>
            <p className='text-sm text-gray-500 mt-1'>
              Accepted formats: JPG, PNG, or PDF. Maximum 5 files per request.
            </p>
          </div>

          <label
            htmlFor='verification-documents'
            className={`block w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
              canSubmit
                ? 'border-primary/40 bg-primary/5 hover:bg-primary/10'
                : 'border-borderColor bg-gray-50 cursor-not-allowed'
            }`}
          >
            <span className='font-medium block mb-1'>
              Drag & drop files here or click to browse
            </span>
            <span className='text-xs text-gray-500'>
              Ensure details are clearly visible.
            </span>
            <input
              id='verification-documents'
              type='file'
              multiple
              accept='.jpg,.jpeg,.png,.pdf'
              onChange={handleFileChange}
              disabled={!canSubmit || submitting}
              className='hidden'
            />
          </label>

          {files.length > 0 && (
            <div className='bg-gray-50 border border-borderColor rounded-lg p-4 space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-600'>
                  Selected files ({files.length})
                </span>
                <button
                  type='button'
                  onClick={resetForm}
                  className='text-xs text-primary hover:underline'
                >
                  Clear
                </button>
              </div>
              <ul className='text-sm text-gray-600 space-y-1'>
                {files.map(file => (
                  <li key={file.name}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type='submit'
            disabled={!canSubmit || submitting}
            className={`w-full py-2.5 rounded-lg font-medium text-white transition ${
              canSubmit
                ? 'bg-primary hover:bg-primary-dull'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit for verification'}
          </button>

          {verificationStatus === 'pending' && (
            <p className='text-xs text-gray-500'>
              Need to update your documents? Wait for the current request to
              complete before resubmitting.
            </p>
          )}
        </form>

        <div className='border border-borderColor rounded-xl p-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='font-medium text-lg'>Latest submission</h3>
            <button
              type='button'
              onClick={fetchStatus}
              disabled={refreshing}
              className='text-sm text-primary hover:underline disabled:text-gray-400'
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {latestRequest ? (
            <>
              <p className='text-sm text-gray-600'>
                Submitted:{' '}
                {new Date(latestRequest.submittedAt).toLocaleString()}
              </p>
              <p className='text-sm text-gray-600 capitalize'>
                Status: {latestRequest.status}
              </p>

              {latestRequest.documents?.length ? (
                <div>
                  <p className='text-sm font-medium text-gray-700 mb-2'>
                    Documents
                  </p>
                  <ul className='space-y-2 text-sm'>
                    {latestRequest.documents.map((docUrl, index) => (
                      <li key={docUrl}>
                        <a
                          href={docUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-primary hover:underline'
                        >
                          Document {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className='text-sm text-gray-500'>No documents on record.</p>
              )}

              {latestRequest.adminNotes && (
                <p className='text-sm text-gray-600'>
                  <span className='font-medium text-gray-700'>
                    Admin notes:
                  </span>{' '}
                  {latestRequest.adminNotes}
                </p>
              )}
            </>
          ) : (
            <p className='text-sm text-gray-500'>
              No verification requests submitted yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Verification
