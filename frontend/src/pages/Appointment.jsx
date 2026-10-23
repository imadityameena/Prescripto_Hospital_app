import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import axios from 'axios'
import { toast } from 'react-toastify'
import { optimizeImage } from '../utils/image'
import { Badge, Spinner, buttonPrimary } from '../components/ui'

const Appointment = () => {

    const { docId } = useParams()
    const { doctors, doctorsLoading, currencySymbol, backendUrl, token, getDoctosData } = useContext(AppContext)
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const [docInfo, setDocInfo] = useState(false)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')
    const [booking, setBooking] = useState(false)

    const navigate = useNavigate()

    const fetchDocInfo = async () => {
        const docInfo = doctors.find((doc) => doc._id === docId)
        setDocInfo(docInfo)
    }

    // Same format on every browser, eg. "09:30 AM". The server checks for this exact format.
    const formatSlotTime = (date) => {
        const hours = date.getHours()
        const hour12 = hours % 12 === 0 ? 12 : hours % 12
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${String(hour12).padStart(2, '0')}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`
    }

    const getAvailableSolts = async () => {

        setDocSlots([])

        // getting current date
        let today = new Date()

        for (let i = 0; i < 7; i++) {

            // getting date with index 
            let currentDate = new Date(today)
            currentDate.setDate(today.getDate() + i)

            // setting end time of the date with index
            let endTime = new Date()
            endTime.setDate(today.getDate() + i)
            endTime.setHours(21, 0, 0, 0)

            // setting hours 
            if (today.getDate() === currentDate.getDate()) {
                currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
                currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
            } else {
                currentDate.setHours(10)
                currentDate.setMinutes(0)
            }

            let timeSlots = [];


            while (currentDate < endTime) {
                let formattedTime = formatSlotTime(currentDate);

                let day = currentDate.getDate()
                let month = currentDate.getMonth() + 1
                let year = currentDate.getFullYear()

                const slotDate = day + "_" + month + "_" + year
                const slotTime = formattedTime

                const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true

                if (isSlotAvailable) {

                    // Add slot to array
                    timeSlots.push({
                        datetime: new Date(currentDate),
                        time: formattedTime
                    })
                }

                // Increment current time by 30 minutes
                currentDate.setMinutes(currentDate.getMinutes() + 30);
            }

            setDocSlots(prev => ([...prev, timeSlots]))

        }

    }

    const bookAppointment = async () => {

        if (!token) {
            toast.warning('Login to book appointment')
            return navigate('/login', { state: { from: `/appointment/${docId}` } })
        }

        if (!slotTime || !docSlots[slotIndex] || docSlots[slotIndex].length === 0) {
            return toast.warning('Please select a time slot')
        }

        const date = docSlots[slotIndex][0].datetime

        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()

        const slotDate = day + "_" + month + "_" + year

        setBooking(true)
        try {

            const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime }, { headers: { token } })
            if (data.success) {
                toast.success(data.message)
                getDoctosData()
                navigate('/my-appointments')
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setBooking(false)
        }

    }

    useEffect(() => {
        if (doctors.length > 0) {
            fetchDocInfo()
        }
    }, [doctors, docId])

    useEffect(() => {
        if (docInfo) {
            getAvailableSolts()
        }
    }, [docInfo])

    // start on the first day that still has free times (e.g. today may be full)
    useEffect(() => {
        if (docSlots.length === 7 && (docSlots[slotIndex] || []).length === 0) {
            const firstOpen = docSlots.findIndex(day => day.length > 0)
            if (firstOpen !== -1) setSlotIndex(firstOpen)
        }
    }, [docSlots])

    // the 7 days shown in the date picker (index matches docSlots)
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() + i)
        return d
    })

    // split the chosen day's times into morning / afternoon / evening
    const timeGroups = (docSlots[slotIndex] || []).reduce((groups, slot) => {
        const hour = slot.datetime.getHours()
        const key = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'
        groups[key] = [...(groups[key] || []), slot]
        return groups
    }, {})

    const chosenDay = days[slotIndex]

    if (!docInfo) {
        return doctorsLoading
            ? <Spinner />
            : (
                <div className='py-20 text-center'>
                    <p className='text-lg font-medium text-[#262626]'>Doctor not found</p>
                    <button onClick={() => navigate('/doctors')} className={`${buttonPrimary} mt-4`}>Browse doctors</button>
                </div>
            )
    }

    return (
        <div className='pt-6 pb-10'>

            {/* ---------- Doctor profile ---------- */}
            <section className='bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row'>
                <div className='bg-primary md:w-72 shrink-0 flex items-end justify-center'>
                    <img className='w-full max-w-72 aspect-square object-cover object-top' src={optimizeImage(docInfo.image, 600)} alt={docInfo.name} />
                </div>
                <div className='flex-1 p-6 sm:p-8'>
                    <div className='flex flex-wrap items-center gap-2'>
                        <h1 className='text-2xl sm:text-3xl font-semibold text-[#262626]'>{docInfo.name}</h1>
                        <img className='w-5' src={assets.verified_icon} alt='Verified' />
                    </div>
                    <p className='text-gray-600 mt-1'>{docInfo.degree} · {docInfo.speciality}</p>
                    <div className='flex flex-wrap gap-2 mt-3'>
                        <Badge>{docInfo.experience} experience</Badge>
                        {docInfo.available ? <Badge color='green'>Accepting appointments</Badge> : <Badge>Not available</Badge>}
                    </div>

                    <h2 className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-5'>About <img className='w-3' src={assets.info_icon} alt='' /></h2>
                    <p className='text-sm text-gray-600 max-w-[700px] mt-1 leading-relaxed'>{docInfo.about}</p>

                    <dl className='grid sm:grid-cols-2 gap-4 mt-5 text-sm'>
                        <div className='rounded-xl bg-[#F8F9FD] px-4 py-3'>
                            <dt className='text-gray-500'>Consultation fee</dt>
                            <dd className='text-lg font-semibold text-[#262626]'>{currencySymbol}{docInfo.fees}</dd>
                        </div>
                        <div className='rounded-xl bg-[#F8F9FD] px-4 py-3'>
                            <dt className='text-gray-500'>Clinic address</dt>
                            <dd className='text-[#262626]'>{[docInfo.address?.line1, docInfo.address?.line2].filter(Boolean).join(', ')}</dd>
                        </div>
                    </dl>
                </div>
            </section>

            {/* ---------- Booking ---------- */}
            {!docInfo.available
                ? <p className='mt-6 px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-600 text-sm'>This doctor is not accepting appointments right now. Please choose another doctor below.</p>
                : (
                    <section className='mt-6 grid lg:grid-cols-[1fr_320px] gap-6 items-start'>
                        <div className='min-w-0 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6'>
                            <h2 className='font-semibold text-[#262626]'>Choose a date</h2>
                            <div className='flex gap-2 sm:gap-3 mt-4 scroll-x'>
                                {days.map((day, index) => {
                                    const full = (docSlots[index] || []).length === 0
                                    const active = slotIndex === index
                                    return (
                                        <button type='button' key={index} disabled={full} aria-pressed={active}
                                            onClick={() => { setSlotIndex(index); setSlotTime('') }}
                                            className={`shrink-0 w-16 py-3 rounded-2xl border text-center transition-colors ${active ? 'bg-primary text-white border-primary' : full ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50'}`}>
                                            <span className='block text-xs uppercase'>{index === 0 ? 'Today' : daysOfWeek[day.getDay()]}</span>
                                            <span className='block text-xl font-semibold'>{day.getDate()}</span>
                                            <span className='block text-xs'>{full ? 'Full' : day.toLocaleDateString('en-IN', { month: 'short' })}</span>
                                        </button>
                                    )
                                })}
                            </div>

                            <h2 className='font-semibold text-[#262626] mt-6'>Choose a time</h2>
                            {Object.keys(timeGroups).length === 0 && <p className='text-sm text-gray-500 mt-3'>No free times on this day. Please pick another date.</p>}
                            {['Morning', 'Afternoon', 'Evening'].filter(k => timeGroups[k]).map(group => (
                                <div key={group} className='mt-4'>
                                    <p className='text-xs font-medium uppercase tracking-wide text-gray-400'>{group}</p>
                                    <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-2'>
                                        {timeGroups[group].map(slot => (
                                            <button type='button' key={slot.time} aria-pressed={slot.time === slotTime} onClick={() => setSlotTime(slot.time)}
                                                className={`py-2 rounded-lg border text-sm transition-colors ${slot.time === slotTime ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50'}`}>
                                                {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* summary */}
                        <aside className='bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 lg:sticky lg:top-6'>
                            <h2 className='font-semibold text-[#262626]'>Booking summary</h2>
                            <dl className='mt-4 text-sm divide-y divide-gray-100'>
                                <div className='flex justify-between py-2.5'><dt className='text-gray-500'>Doctor</dt><dd className='text-[#262626] text-right'>{docInfo.name}</dd></div>
                                <div className='flex justify-between py-2.5'><dt className='text-gray-500'>Date</dt><dd className='text-[#262626]'>{chosenDay.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</dd></div>
                                <div className='flex justify-between py-2.5'><dt className='text-gray-500'>Time</dt><dd className={slotTime ? 'text-[#262626]' : 'text-gray-400'}>{slotTime || 'Not selected'}</dd></div>
                                <div className='flex justify-between py-2.5'><dt className='text-gray-500'>Fee</dt><dd className='font-semibold text-[#262626]'>{currencySymbol}{docInfo.fees}</dd></div>
                            </dl>
                            <button onClick={bookAppointment} disabled={booking} className={`${buttonPrimary} w-full mt-4 py-3`}>
                                {booking ? 'Booking...' : slotTime ? 'Book appointment' : 'Select a time to book'}
                            </button>
                            <p className='text-xs text-gray-400 mt-3 text-center'>You can pay online or at the clinic.</p>
                        </aside>
                    </section>
                )}

            <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
        </div>
    )
}

export default Appointment
