import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { optimizeImage } from '../utils/image'
import { formatSlotDate, slotToDate, isPastSlot } from '../utils/format'
import { PageHeader, Badge, Spinner, buttonPrimary } from '../components/ui'

// which tab an appointment belongs to
const groupOf = (item) => {
    if (item.cancelled) return 'cancelled'
    if (item.isCompleted || isPastSlot(item.slotDate)) return 'past'
    return 'upcoming'
}

const TABS = [['upcoming', 'Upcoming'], ['past', 'Past'], ['cancelled', 'Cancelled']]

const StatusBadge = ({ item }) => {
    if (item.cancelled) return <Badge color='red'>Cancelled</Badge>
    if (item.isCompleted) return <Badge color='green'>Completed</Badge>
    if (isPastSlot(item.slotDate)) return <Badge>Past</Badge>
    return <Badge color='blue'>Upcoming</Badge>
}

const MyAppointments = () => {

    const { backendUrl, token } = useContext(AppContext)
    const navigate = useNavigate()

    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [payment, setPayment] = useState('')
    const [busyId, setBusyId] = useState('')   // appointment with a request in progress

    const [tab, setTab] = useState('upcoming')

    // Getting User Appointments Data Using API
    const getUserAppointments = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
            if (data.success) {
                setAppointments(data.appointments)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    // Function to cancel appointment Using API
    const cancelAppointment = async (appointmentId) => {

        if (!window.confirm('Cancel this appointment?')) return

        setBusyId(appointmentId)
        try {

            const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
                getUserAppointments()
            } else {
                toast.error(data.message)
            }   

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setBusyId('')
        }

    }

    // Loads Razorpay's checkout script the first time it's needed,
    // instead of on every page of the site
    const loadRazorpay = () => new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve()
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = resolve
        script.onerror = () => reject(new Error('Could not load Razorpay. Please check your connection.'))
        document.body.appendChild(script)
    })

    const initPay = async (order) => {
        await loadRazorpay()
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Appointment Payment',
            description: "Appointment Payment",
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {

                console.log(response)

                try {
                    const { data } = await axios.post(backendUrl + "/api/user/verifyRazorpay", response, { headers: { token } });
                    if (data.success) {
                        navigate('/my-appointments')
                        getUserAppointments()
                    }
                } catch (error) {
                    console.log(error)
                    toast.error(error.message)
                }
            }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    // Function to make payment using razorpay
    const appointmentRazorpay = async (appointmentId) => {
        setBusyId(appointmentId)
        try {
            const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } })
            if (data.success) {
                await initPay(data.order)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setBusyId('')
        }
    }

    // Function to make payment using stripe
    const appointmentStripe = async (appointmentId) => {
        setBusyId(appointmentId)
        try {
            const { data } = await axios.post(backendUrl + '/api/user/payment-stripe', { appointmentId }, { headers: { token } })
            if (data.success) {
                const { session_url } = data
                window.location.replace(session_url)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setBusyId('')
        }
    }



    useEffect(() => {
        if (token) {
            getUserAppointments()
        } else {
            toast.info('Please login to see your appointments')
            navigate('/login', { state: { from: '/my-appointments' } })
        }
    }, [token])

    const counts = TABS.reduce((acc, [key]) => ({ ...acc, [key]: appointments.filter(a => groupOf(a) === key).length }), {})
    const visible = appointments
        .filter(a => groupOf(a) === tab)
        // upcoming: soonest first; others: most recent first
        .sort((a, b) => tab === 'upcoming' ? slotToDate(a.slotDate) - slotToDate(b.slotDate) : slotToDate(b.slotDate) - slotToDate(a.slotDate))

    const actionButton = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-wait'

    return (
        <div className='pb-10'>
            <PageHeader
                title='My appointments'
                subtitle='Track, pay for and manage your bookings.'
                action={<button onClick={() => navigate('/doctors')} className={buttonPrimary}>Book new appointment</button>}
            />

            {loading && <Spinner />}

            {!loading && appointments.length === 0 && (
                <div className='bg-white rounded-2xl border border-gray-200 py-16 px-6 flex flex-col items-center gap-3 text-center'>
                    <p className='text-lg font-medium text-[#262626]'>No appointments yet</p>
                    <p className='text-gray-500 text-sm'>Find a doctor and book your first visit in a minute.</p>
                    <button onClick={() => navigate('/doctors')} className={`${buttonPrimary} mt-2`}>Find a doctor</button>
                </div>
            )}

            {!loading && appointments.length > 0 && (
                <>
                    {/* tabs */}
                    <div className='flex gap-2 mb-5 overflow-x-auto' role='tablist'>
                        {TABS.map(([key, label]) => (
                            <button key={key} role='tab' aria-selected={tab === key} onClick={() => setTab(key)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${tab === key ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40'}`}>
                                {label} <span className={tab === key ? 'text-white/80' : 'text-gray-400'}>({counts[key]})</span>
                            </button>
                        ))}
                    </div>

                    {visible.length === 0 && (
                        <p className='bg-white rounded-2xl border border-gray-200 py-12 text-center text-gray-500 text-sm'>
                            No {tab} appointments.
                        </p>
                    )}

                    <ul className='flex flex-col gap-4'>
                        {visible.map((item) => {
                            const date = slotToDate(item.slotDate)
                            const canPay = !item.cancelled && !item.payment && !item.isCompleted && !isPastSlot(item.slotDate)
                            const canCancel = !item.cancelled && !item.isCompleted && !item.payment && !isPastSlot(item.slotDate)
                            const busy = busyId === item._id

                            return (
                                <li key={item._id} className='bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden'>
                                    <div className='flex flex-col sm:flex-row'>

                                        {/* date block */}
                                        <div className={`flex sm:flex-col items-center justify-center gap-2 sm:gap-0 px-5 py-3 sm:py-5 sm:w-28 shrink-0 ${groupOf(item) === 'upcoming' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-500'}`}>
                                            <span className='text-sm uppercase tracking-wide'>{date.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                                            <span className='text-3xl font-semibold leading-none sm:my-1'>{date.getDate()}</span>
                                            <span className='text-sm'>{date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                                        </div>

                                        {/* details */}
                                        <div className='flex-1 p-5 flex flex-col md:flex-row gap-5'>
                                            <div className='flex gap-4 flex-1 min-w-0'>
                                                <img className='w-16 h-16 rounded-full object-cover object-top bg-[#EAEFFF] shrink-0' src={optimizeImage(item.docData.image, 160)} loading='lazy' decoding='async' alt={item.docData.name} />
                                                <div className='min-w-0 text-sm'>
                                                    <div className='flex flex-wrap items-center gap-2'>
                                                        <p className='text-[#262626] text-base font-semibold'>{item.docData.name}</p>
                                                        <StatusBadge item={item} />
                                                        {item.payment && !item.cancelled && <Badge color='green'>Paid</Badge>}
                                                    </div>
                                                    <p className='text-gray-500'>{item.docData.speciality}</p>
                                                    <p className='mt-2 text-[#262626]'>
                                                        <span className='font-medium'>{item.slotTime}</span>
                                                        <span className='text-gray-400'> · {formatSlotDate(item.slotDate)} · ₹{item.amount}</span>
                                                    </p>
                                                    <p className='text-gray-500 mt-0.5'>{[item.docData.address?.line1, item.docData.address?.line2].filter(Boolean).join(', ')}</p>
                                                </div>
                                            </div>

                                            {/* actions */}
                                            <div className='flex flex-row md:flex-col flex-wrap gap-2 md:w-48 md:justify-center'>
                                                {canPay && payment !== item._id && (
                                                    <button onClick={() => setPayment(item._id)} className={`${actionButton} bg-primary text-white border-primary hover:opacity-90`}>Pay online</button>
                                                )}
                                                {canPay && payment === item._id && (
                                                    <>
                                                        <button disabled={busy} onClick={() => appointmentStripe(item._id)} className={`${actionButton} border-gray-300 hover:bg-gray-50`}>
                                                            <img className='h-5' src={assets.stripe_logo} alt='Pay with Stripe' />
                                                        </button>
                                                        <button disabled={busy} onClick={() => appointmentRazorpay(item._id)} className={`${actionButton} border-gray-300 hover:bg-gray-50`}>
                                                            <img className='h-5' src={assets.razorpay_logo} alt='Pay with Razorpay' />
                                                        </button>
                                                    </>
                                                )}
                                                {canCancel && (
                                                    <button disabled={busy} onClick={() => cancelAppointment(item._id)} className={`${actionButton} border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50`}>
                                                        Cancel
                                                    </button>
                                                )}
                                                {!item.cancelled && !item.isCompleted && item.payment && !isPastSlot(item.slotDate) && (
                                                    <p className='text-xs text-gray-500 md:text-center'>To cancel a paid appointment, please contact the clinic.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </>
            )}
        </div>
    )
}

export default MyAppointments
