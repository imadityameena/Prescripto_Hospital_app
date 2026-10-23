import React from 'react'
import { Link } from 'react-router-dom'
import { optimizeImage } from '../utils/image'
import { formatMoney } from '../utils/format'

// One doctor in a grid (home page, all doctors, related doctors)
const DoctorCard = ({ doctor }) => (
  <Link
    to={`/appointment/${doctor._id}`}
    onClick={() => scrollTo(0, 0)}
    className='group block bg-white border border-[#E3E8FF] rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 transition-all duration-300'
  >
    <div className='bg-[#EAEFFF] group-hover:bg-[#DDE3FF] transition-colors'>
      <img className='w-full aspect-square object-cover object-top' src={optimizeImage(doctor.image, 400)} loading='lazy' decoding='async' alt={doctor.name} />
    </div>
    <div className='p-3 sm:p-4'>
      <p className={`flex items-center gap-1.5 text-xs sm:text-sm ${doctor.available ? 'text-green-600' : 'text-gray-500'}`}>
        <span className={`w-2 h-2 rounded-full ${doctor.available ? 'bg-green-500' : 'bg-gray-400'}`} aria-hidden='true' />
        {doctor.available ? 'Available' : 'Not available'}
      </p>
      <p className='text-[#262626] text-base sm:text-lg font-medium mt-1 truncate'>{doctor.name}</p>
      <p className='text-gray-500 text-sm truncate'>{doctor.speciality}</p>
      <div className='flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-sm'>
        <span className='text-gray-500'>{doctor.experience}</span>
        <span className='font-medium text-[#262626]'>{formatMoney(doctor.fees)}</span>
      </div>
    </div>
  </Link>
)

// Grey placeholder shown while doctors are loading
export const DoctorCardSkeleton = () => (
  <div className='bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse' aria-hidden='true'>
    <div className='w-full aspect-square bg-gray-100' />
    <div className='p-4 flex flex-col gap-2'>
      <div className='h-3 w-16 bg-gray-100 rounded' />
      <div className='h-4 w-3/4 bg-gray-100 rounded' />
      <div className='h-3 w-1/2 bg-gray-100 rounded' />
    </div>
  </div>
)

export default DoctorCard
