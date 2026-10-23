import React, { useContext, useMemo, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'
import { specialityData } from '../assets/assets'
import DoctorCard, { DoctorCardSkeleton } from '../components/DoctorCard'
import { PageHeader, inputClass } from '../components/ui'
import { plural } from '../utils/format'

const Doctors = () => {

  const { speciality } = useParams()
  const navigate = useNavigate()
  const { doctors, doctorsLoading } = useContext(AppContext)

  const [search, setSearch] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return doctors.filter(doc =>
      (!speciality || doc.speciality === speciality) &&
      (!availableOnly || doc.available) &&
      (!q || doc.name.toLowerCase().includes(q) || doc.speciality.toLowerCase().includes(q))
    )
  }, [doctors, speciality, search, availableOnly])

  const pill = (active) =>
    `px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${active ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40'}`

  return (
    <div className='pb-10'>
      <PageHeader
        title={speciality ? plural(speciality) : 'Find a doctor'}
        subtitle='Browse trusted doctors and book a visit in a minute.'
      />

      {/* search + availability */}
      <div className='flex flex-col sm:flex-row gap-3 sm:items-center'>
        <div className='relative flex-1'>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 mt-0.5' aria-hidden='true'>
            <circle cx='11' cy='11' r='8' /><path d='m21 21-4.3-4.3' />
          </svg>
          <label htmlFor='doctor-search' className='sr-only'>Search doctors</label>
          <input id='doctor-search' type='search' placeholder='Search by name or speciality'
            value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputClass(false)} mt-0 pl-9`} />
        </div>
        <label className='flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none'>
          <input type='checkbox' checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} className='w-4 h-4 accent-primary' />
          Available only
        </label>
      </div>

      {/* speciality filters */}
      <div className='flex gap-2 mt-4 overflow-x-auto scroll-x' role='group' aria-label='Filter by speciality'>
        <button type='button' aria-pressed={!speciality} onClick={() => navigate('/doctors')} className={pill(!speciality)}>All</button>
        {specialityData.map(({ speciality: name }) => (
          <button key={name} type='button' aria-pressed={speciality === name}
            onClick={() => navigate(speciality === name ? '/doctors' : `/doctors/${name}`)}
            className={pill(speciality === name)}>
            {name}
          </button>
        ))}
      </div>

      {!doctorsLoading && (
        <p className='text-sm text-gray-500 mt-4'>{filtered.length} {filtered.length === 1 ? 'doctor' : 'doctors'} found</p>
      )}

      <div className='mt-4 grid grid-cols-auto-sm sm:grid-cols-auto gap-3 sm:gap-5'>
        {doctorsLoading && Array.from({ length: 8 }).map((_, i) => <DoctorCardSkeleton key={i} />)}
        {filtered.map(doc => <DoctorCard key={doc._id} doctor={doc} />)}
      </div>

      {!doctorsLoading && filtered.length === 0 && (
        <div className='bg-white rounded-2xl border border-gray-200 py-14 text-center'>
          <p className='font-medium text-[#262626]'>No doctors match your search</p>
          <button onClick={() => { setSearch(''); setAvailableOnly(false); navigate('/doctors') }} className='mt-2 text-primary text-sm hover:underline'>
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}

export default Doctors
