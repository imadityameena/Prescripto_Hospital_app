import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import DoctorCard, { DoctorCardSkeleton } from './DoctorCard'

const TopDoctors = () => {

    const navigate = useNavigate()
    const { doctors, doctorsLoading } = useContext(AppContext)

    return (
        <section className='flex flex-col items-center gap-3 my-16 text-[#262626] md:mx-10'>
            <h2 className='text-3xl font-medium'>Top doctors to book</h2>
            <p className='sm:w-1/2 text-center text-sm text-gray-500'>Experienced doctors across specialities, ready to see you this week.</p>
            <div className='w-full grid grid-cols-auto-sm sm:grid-cols-auto gap-3 sm:gap-5 pt-5'>
                {doctorsLoading && Array.from({ length: 5 }).map((_, i) => <DoctorCardSkeleton key={i} />)}
                {doctors.slice(0, 10).map(doc => <DoctorCard key={doc._id} doctor={doc} />)}
            </div>
            <button onClick={() => { navigate('/doctors'); scrollTo(0, 0) }}
                className='mt-8 px-10 py-3 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition-colors'>
                View all doctors
            </button>
        </section>
    )
}

export default TopDoctors
