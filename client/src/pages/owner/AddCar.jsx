import React, { useState } from 'react'
import Title from '../../components/owner/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const AddCar = () => {
  const { axios, currency } = useAppContext()

  const [image, setImage] = useState(null)
  const [documentFile, setDocumentFile] = useState(null)

  const [car, setCar] = useState({
    brand: '',
    model: '',
    year: 0,
    pricePerDay: 0,
    category: '',
    transmission: '',
    fuel_type: '',
    seating_capacity: 0,
    location: '',
    description: ''
  })

  const [isLoading, setIsLoading] = useState(false)

  const onSubmitHandler = async e => {
    e.preventDefault()
    if (isLoading) return null

    if (!image) {
      toast.error('Please upload a car photo.')
      return
    }

    if (!documentFile) {
      toast.error('Ownership proof document is required.')
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('document', documentFile)
      formData.append('carData', JSON.stringify(car))

      const { data } = await axios.post('/api/owner/add-car', formData)

      if (data.success) {
        toast.success(data.message)
        setImage(null)
        setDocumentFile(null)

        setCar({
          brand: '',
          model: '',
          year: 0,
          pricePerDay: 0,
          category: '',
          transmission: '',
          fuel_type: '',
          seating_capacity: 0,
          location: '',
          description: ''
        })
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='px-4 py-10 md:px-10 flex-1'>
      <Title
        title='Add New Car'
        subTitle='Fill in details to list a new car for booking, including pricing, availability, and car specifications.'
      />

      <form
        onSubmit={onSubmitHandler}
        className='flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl'
      >
        {/* Car Image */}
        <div className='flex items-center gap-2 w-full'>
          <label htmlFor='car-image'>
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_icon}
              alt=''
              className='h-14 rounded cursor-pointer'
            />
            <input
              type='file'
              id='car-image'
              accept='image/*'
              hidden
              onChange={e => setImage(e.target.files[0])}
            />
          </label>
          <p className='text-sm text-gray-500'>Upload a picture of your car.</p>
        </div>

        {/* Ownership Document */}
        <div className='flex flex-col w-full gap-2'>
          <label htmlFor='ownership-doc' className='font-medium text-gray-600'>
            Ownership proof (registration, insurance, etc.)
          </label>
          <input
            type='file'
            id='ownership-doc'
            accept='application/pdf,image/*'
            onChange={e => setDocumentFile(e.target.files[0] || null)}
            className='px-3 py-2 border border-borderColor rounded-md cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white'
          />
          {documentFile && (
            <span className='text-xs text-gray-500 truncate'>
              Selected: {documentFile.name}
            </span>
          )}
          <p className='text-xs text-gray-400'>
            Provide a clear copy of the vehicle registration, insurance, or
            ownership certificate. PDF or image formats accepted.
          </p>
        </div>

        {/* Car Brand & Model */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='flex flex-col w-full'>
            <label htmlFor=''>Brand</label>
            <input
              type='text'
              placeholder='e.g. BMW, Mercedes, Audi...'
              required
              className='px-2 py-2 mt-1 border border-borderColor rounded-md outline-none'
              value={car.brand}
              onChange={e => setCar({ ...car, brand: e.target.value })}
            />
            {/* it copies all existing properties from car (model, year, etc.) and then updates only brand. */}
          </div>

          <div className='flex flex-col w-full'>
            <label htmlFor=''>Model</label>
            <input
              type='text'
              placeholder='e.g. X5, E-Class, M4...'
              required
              className='px-2 py-2 mt-1 border border-borderColor rounded-md outline-none'
              value={car.model}
              onChange={e => setCar({ ...car, model: e.target.value })}
            />
          </div>
        </div>

        {/* Car Year, Price, Category */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          <div className='flex flex-col w-full'>
            <label htmlFor=''>Year</label>
            <input
              type='number'
              placeholder='2025'
              required
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
              value={car.year}
              onChange={e => setCar({ ...car, year: e.target.value })}
            />
          </div>

          <div className='flex flex-col w-full'>
            <label htmlFor=''>Daily Price ({currency})</label>
            <input
              type='number'
              placeholder='100'
              required
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
              value={car.pricePerDay}
              onChange={e => setCar({ ...car, pricePerDay: e.target.value })}
            />
          </div>

          <div className='flex flex-col w-full'>
            <label htmlFor=''>Category</label>

            <select
              name=''
              id=''
              onChange={e => setCar({ ...car, category: e.target.value })}
              value={car.category}
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
            >
              <option value=''>Select a category</option>
              <option value='Sedan'>Sedan</option>
              <option value='SUV'>SUV</option>
              <option value='Sedan'>Van</option>
            </select>
          </div>
        </div>

        {/* Car Transmission, Fuel Type, Seating Capacity */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          <div className='flex flex-col w-full'>
            <label htmlFor=''>Transmisson</label>

            <select
              name=''
              id=''
              onChange={e => setCar({ ...car, transmission: e.target.value })}
              value={car.transmission}
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
            >
              <option value=''>Select a transmission</option>
              <option value='Automatic'>Automatic</option>
              <option value='Manual'>Manual</option>
              <option value='Semi-Automatic'>Semi-Automatic</option>
            </select>
          </div>

          <div className='flex flex-col w-full'>
            <label htmlFor=''>Fuel Type</label>

            <select
              name=''
              id=''
              onChange={e => setCar({ ...car, fuel_type: e.target.value })}
              value={car.fuel_type}
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
            >
              <option value=''>Select a fuel type</option>
              <option value='Gas'>Gas</option>
              <option value='Diesel'>Diesel</option>
              <option value='Petrol'>Petrol</option>
              <option value='Electric'>Electric</option>
              <option value='Hybrid'>Hybrid</option>
            </select>
          </div>

          <div className='flex flex-col w-full'>
            <label htmlFor=''>Seating Capacity</label>
            <input
              type='number'
              placeholder='4'
              required
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
              value={car.seating_capacity}
              onChange={e =>
                setCar({ ...car, seating_capacity: e.target.value })
              }
            />
          </div>
        </div>

        {/* Car Location */}
        <div className='flex flex-col w-full'>
          <label htmlFor=''>Location</label>

          <select
            name=''
            id=''
            onChange={e => setCar({ ...car, location: e.target.value })}
            value={car.location}
            className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
          >
            <option value=''>Select a location</option>
            <option value='New York'>New York</option>
            <option value='Los Angeles'>Los Angeles</option>
            <option value='Houston'>Houston</option>
            <option value='Chicago'>Chicago</option>
          </select>
        </div>

        {/* Car Description */}
        <div className='flex flex-col w-full'>
          <label htmlFor=''>Description</label>
          <textarea
            rows={5}
            placeholder='e.g. A luxurious SUV with a spacious interior and a powerful engine'
            required
            className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
            value={car.description}
            onChange={e => setCar({ ...car, description: e.target.value })}
          />
        </div>

        <button className='flex items-center gap-2 px-4 py-2.5 mt-4 bg-primary text-white rounded-md font-medium w-max cursor-pointer'>
          <img src={assets.tick_icon} alt='' />
          {isLoading ? 'Listing...' : 'List your car'}
        </button>
      </form>
    </div>
  )
}

export default AddCar
