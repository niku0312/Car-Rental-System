import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import CarCard from '../components/CarCard'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion as Motion } from 'motion/react'
// import { delay } from "motion";

const Cars = () => {
  //getting search params from url
  const [searchParams] = useSearchParams()
  const pickupLocation = searchParams.get('pickupLocation')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')
  const searchQuery = useMemo(
    () => searchParams.get('search') || '',
    [searchParams]
  )

  const { cars, axios, globalSearch, setGlobalSearch } = useAppContext()

  const [input, setInput] = useState('')

  const isSearchData = pickupLocation && pickupDate && returnDate

  const [filteredCars, setFilteredCars] = useState([])

  // const applyFilter = async () => {
  //   if (input === '') {
  //     setFilteredCars(cars);
  //     return null;
  //   }

  //   const filtered = cars.filter((car) => {
  //     return car.brand.toLowerCase().includes(input.toLowerCase())
  //       || car.model.toLowerCase().includes(input.toLowerCase())
  //       || car.category.toLowerCase().includes(input.toLowerCase())
  //       || car.transmission.toLowerCase().includes(input.toLowerCase())
  //       // || car.location.toLowerCase().includes(input.toLowerCase());
  //   })
  //   setFilteredCars(filtered)
  // }

  //Filter available cars and apply search input filter when cars or input changes
  useEffect(() => {
    if (!isSearchData) {
      let filtered = cars.filter(car => car.isAvailable)

      if (input !== '') {
        filtered = filtered.filter(
          car =>
            car.brand.toLowerCase().includes(input.toLowerCase()) ||
            car.model.toLowerCase().includes(input.toLowerCase()) ||
            car.category.toLowerCase().includes(input.toLowerCase()) ||
            car.transmission.toLowerCase().includes(input.toLowerCase())
        )
      }
      setFilteredCars(filtered)
    }
  }, [input, cars, isSearchData])

  // const searchCarAvailability = async () => {
  //   const { data } = await axios.post('/api/bookings/check-availability', { location: pickupLocation, pickupDate, returnDate })

  //   if (data.success) {
  //     setFilteredCars(data.availableCars);
  //     if (data.availableCars.length === 0) {
  //       toast('No Cars available')
  //     }
  //     return null;
  //   }
  // }

  // Search available cars from backend if booking search data exists
  const searchCarAvailability = useCallback(async () => {
    try {
      const { data } = await axios.post('/api/bookings/check-availability', {
        location: pickupLocation,
        pickupDate,
        returnDate
      })

      if (data.success) {
        setFilteredCars(data.availableCars)
        if (data.availableCars.length === 0) {
          toast('No Cars available')
        }
      }
    } catch (error) {
      toast.error(error.message)
    }
  }, [axios, pickupLocation, pickupDate, returnDate])

  useEffect(() => {
    if (isSearchData) {
      searchCarAvailability()
    }
  }, [isSearchData, searchCarAvailability])

  useEffect(() => {
    if (isSearchData) {
      setInput('')
      setGlobalSearch('')
      return
    }

    if (searchQuery === '') return

    setInput(prev => (prev === searchQuery ? prev : searchQuery))
    setGlobalSearch(prev => (prev === searchQuery ? prev : searchQuery))
  }, [isSearchData, searchQuery, setGlobalSearch])

  useEffect(() => {
    if (isSearchData) return
    setInput(prev => (prev === globalSearch ? prev : globalSearch))
  }, [globalSearch, isSearchData])

  const handleInputChange = event => {
    const value = event.target.value
    setInput(value)
    setGlobalSearch(value)
  }

  // useEffect(() => {
  //   isSearchData && searchCarAvailability()
  // }, []);

  // useEffect(() => {
  //   cars.length > 0 && !isSearchData && applyFilter();
  // }, [input, cars])

  return (
    <div>
      <Motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className='flex flex-col items-center py-20 bg-light max-md:px-4'
      >
        <Title
          title='Available cars'
          subTitle='Browse our selection of premium vehicles available for your next adventure'
        />

        <div
          // initial={{ opacity: 0, y: 20 }}
          // animate={{ opacity: 1, y: 0 }}
          // transition={{ duration: 0.3, ease: 0.5 }}

          className='flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow'
        >
          <img src={assets.search_icon} alt='' className='w-4.5 h-4.5 mr-2' />

          <input
            onChange={handleInputChange}
            value={input}
            type='text'
            placeholder='Search by make, model, or features'
            className='w-full h-full outline-none text-gray-500'
          />

          <img src={assets.filter_icon} alt='' className='w-4.5 h-4.5 ml-2' />
        </div>
      </Motion.div>

      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'
      >
        <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto'>
          Showing {filteredCars.length} Cars
        </p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
          {filteredCars.map((car, index) => (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              key={index}
            >
              <CarCard car={car} />
            </Motion.div>
          ))}
        </div>
      </Motion.div>
    </div>
  )
}

export default Cars
