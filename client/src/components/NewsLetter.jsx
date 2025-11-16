import React, { useState } from 'react'
import { motion as Motion } from 'motion/react'
import toast from 'react-hot-toast'

const NewsLetter = () => {
  const [email, setEmail] = useState('')
  const [feedback, setFeedback] = useState(null)

  const handleSubscribe = event => {
    event.preventDefault()
    const trimmedEmail = email.trim()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid email address.'
      })
      toast.error('Enter a valid email to subscribe')
      return
    }

    setFeedback({
      type: 'success',
      message: 'Thanks! We will keep you posted with our best offers.'
    })
    toast.success('Subscribed successfully')
    setEmail('')
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.3 }}
      className='flex flex-col items-center justify-center text-center space-y-2 max-md:px-4 my-10 mb-40'
    >
      <Motion.h1
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className='md:text-4xl text-2xl font-semibold'
      >
        Never Miss a Deal!
      </Motion.h1>

      <Motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className='md:text-lg text-gray-500/70 pb-8'
      >
        Subscribe to get the latest offers, new arrivals, and exclusive
        discounts
      </Motion.p>

      <Motion.form
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 20 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        onSubmit={handleSubscribe}
        className='flex items-center justify-between max-w-2xl w-full md:h-13 h-12'
      >
        <input
          className='border border-gray-300 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-500'
          type='email'
          placeholder='Enter your email id'
          required
          value={email}
          onChange={event => setEmail(event.target.value)}
        />
        <button
          type='submit'
          className='md:px-12 px-8 h-full text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer rounded-md rounded-l-none'
        >
          Subscribe
        </button>
      </Motion.form>
      {feedback && (
        <p
          className={`text-sm mt-3 ${
            feedback.type === 'success' ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {feedback.message}
        </p>
      )}
    </Motion.div>
  )
}

export default NewsLetter
