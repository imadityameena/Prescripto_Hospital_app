import React, { useContext, useMemo } from 'react'
import { AppContext } from '../context/AppContext'
import DoctorCard from './DoctorCard'
import { plural } from '../utils/format'

const RelatedDoctors = ({ speciality, docId }) => {

    const { doctors } = useContext(AppContext)

    const related = useMemo(
        () => doctors.filter(doc => doc.speciality === speciality && doc._id !== docId).slice(0, 5),
        [doctors, speciality, docId]
    )

    if (related.length === 0) return null

    return (
        <section className='mt-16'>
            <h2 className='text-2xl font-semibold text-[#262626]'>Other {plural(speciality).toLowerCase()}</h2>
            <p className='text-sm text-gray-500 mt-1'>Doctors with the same speciality you can book instead.</p>
            <div className='mt-5 grid grid-cols-auto-sm sm:grid-cols-auto gap-3 sm:gap-5'>
                {related.map(doc => <DoctorCard key={doc._id} doctor={doc} />)}
            </div>
        </section>
    )
}

export default RelatedDoctors
