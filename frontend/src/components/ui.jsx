import React from 'react'

// Shared building blocks so every page has the same look:
// white rounded cards, soft borders, primary-coloured pill buttons.

export const inputClass = (hasError) =>
  `w-full rounded-lg border px-3 py-2.5 mt-1 text-[#262626] bg-white outline-none focus-visible:outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${hasError ? 'border-red-400' : 'border-[#DADADA]'}`

export const buttonPrimary =
  'inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-wait'

export const buttonSecondary =
  'inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 bg-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60'

export const PageHeader = ({ title, subtitle, action }) => (
  <div className='flex flex-wrap items-end justify-between gap-3 pt-6 pb-6'>
    <div>
      <h1 className='text-2xl sm:text-3xl font-semibold text-[#262626]'>{title}</h1>
      {subtitle && <p className='text-gray-500 mt-1'>{subtitle}</p>}
    </div>
    {action}
  </div>
)

export const Card = ({ title, action, children, className = '' }) => (
  <section className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
    {title && (
      <div className='flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100'>
        <h2 className='font-semibold text-[#262626]'>{title}</h2>
        {action}
      </div>
    )}
    <div className='p-5 sm:p-6'>{children}</div>
  </section>
)

export const Field = ({ id, label, optional, error, hint, children }) => (
  <div>
    <label htmlFor={id} className='text-sm font-medium text-[#262626]'>
      {label} {optional && <span className='font-normal text-gray-400'>(optional)</span>}
    </label>
    {children}
    {error
      ? <p className='text-red-500 text-xs mt-1'>{error}</p>
      : hint && <p className='text-gray-400 text-xs mt-1'>{hint}</p>}
  </div>
)

// label / value row used on read-only details
export const DetailRow = ({ label, children }) => (
  <div className='grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-3 py-2.5 text-sm'>
    <dt className='text-gray-500'>{label}</dt>
    <dd className='text-[#262626] break-words'>{children}</dd>
  </div>
)

export const NotSet = () => <span className='text-gray-400 italic'>Not added</span>

const BADGE_STYLES = {
  blue: 'bg-blue-50 text-primary border-blue-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  gray: 'bg-gray-50 text-gray-600 border-gray-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
}

export const Badge = ({ color = 'gray', children }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap ${BADGE_STYLES[color]}`}>
    {children}
  </span>
)

export const Spinner = () => (
  <div className='min-h-[50vh] flex items-center justify-center' role='status' aria-label='Loading'>
    <div className='w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin' />
  </div>
)
