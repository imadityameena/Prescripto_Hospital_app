import React from 'react'
import { Link } from 'react-router-dom'
import { optimizeImage } from '../utils/image'

// A summary number on the dashboard (e.g. "12 Appointments"). Clicking opens the related page.
export const StatCard = ({ icon, value, label, sub, to }) => (
  <Link to={to} className='flex items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all'>
    <img className='w-14 h-14 shrink-0' src={icon} alt='' />
    <div className='min-w-0'>
      <p className='text-2xl font-semibold text-gray-700 truncate'>{value}</p>
      <p className='text-gray-500'>{label}</p>
      {sub && <p className='text-xs text-gray-400 mt-0.5 truncate'>{sub}</p>}
    </div>
  </Link>
)

// true if the slot's day ("23_10_2026") is before today
const isPastSlot = (slotDate = '') => {
  const [day, month, year] = slotDate.split('_').map(Number)
  if (!day || !month || !year) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(year, month - 1, day) < today
}

// Coloured status label for an appointment
export const StatusBadge = ({ item }) => {
  const [text, style] = item.cancelled
    ? ['Cancelled', 'bg-red-50 text-red-600 border-red-200']
    : item.isCompleted
      ? ['Completed', 'bg-green-50 text-green-700 border-green-200']
      : isPastSlot(item.slotDate)
        ? ['Past', 'bg-gray-50 text-gray-600 border-gray-200']
        : ['Upcoming', 'bg-blue-50 text-primary border-blue-200']
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap ${style}`}>{text}</span>
}

// Round photo that is always the same size, whatever the image's shape.
// Without a photo it shows the person's initial.
export const Avatar = ({ src, name = '', size = 40 }) => {
  if (!src) {
    return (
      <span
        aria-hidden='true'
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        className='rounded-full bg-[#EAEFFF] text-primary font-medium flex items-center justify-center shrink-0'
      >
        {(name.trim()[0] || '?').toUpperCase()}
      </span>
    )
  }
  return (
    <img
      src={optimizeImage(src, size * 2)}
      alt=''
      loading='lazy'
      decoding='async'
      style={{ width: size, height: size }}
      className='rounded-full object-cover bg-[#EAEFFF] shrink-0'
    />
  )
}

// Card with a title bar, used for "Latest bookings"
export const Panel = ({ icon, title, action, children }) => (
  <div className='bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden'>
    <div className='flex items-center gap-2.5 px-5 py-4 border-b border-gray-100'>
      <img src={icon} alt='' />
      <p className='font-semibold text-gray-800 flex-1'>{title}</p>
      {action}
    </div>
    {children}
  </div>
)

// Shown while a page's data is loading
export const PageLoader = () => (
  <div className='min-h-[60vh] flex items-center justify-center' role='status' aria-label='Loading'>
    <div className='w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin' />
  </div>
)
