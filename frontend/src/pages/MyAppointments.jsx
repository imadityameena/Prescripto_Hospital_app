import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { optimizeImage } from '../utils/image'

const MyAppointments = () => {

    const { backendUrl, token } = useContext(AppContext)
    const navigate = useNavigate()

    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [payment, setPayment] = useState('')
    const [busyId, setBusyId] = useState('')   // appointment with a request in progress

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Function to format the date eg. ( 20_1_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2]
    }

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

    return (
        <div>
            <p className='pb-3 mt-12 text-lg font-medium text-gray-600 border-b'>My appointments</p>
            {loading && <p className='py-10 text-center text-gray-500'>Loading your appointments...</p>}
            {!loading && appointments.length === 0 && (
                <div className='py-16 flex flex-col items-center gap-4 text-gray-500'>
                    <p>You have no appointments yet.</p>
                    <button onClick={() => navigate('/doctors')} className='bg-primary text-white px-8 py-2.5 rounded-full'>Find a doctor</button>
                </div>
            )}
            <div className=''>
                {appointments.map((item, index) => (
                    <div key={index} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'>
                        <div>
                            <img className='w-36 bg-[#EAEFFF]' src={optimizeImage(item.docData.image, 300)} loading='lazy' decoding='async' alt={item.docData.name} />
                        </div>
                        <div className='flex-1 text-sm text-[#5E5E5E]'>
                            <p className='text-[#262626] text-base font-semibold'>{item.docData.name}</p>
                            <p>{item.docData.speciality}</p>
                            <p className='text-[#464646] font-medium mt-1'>Address:</p>
                            <p className=''>{item.docData.address.line1}</p>
                            <p className=''>{item.docData.address.line2}</p>
                            <p className=' mt-1'><span className='text-sm text-[#3C3C3C] font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} |  {item.slotTime}</p>
                        </div>
                        <div></div>
                        <div className='flex flex-col gap-2 justify-end text-sm text-center'>
                            {!item.cancelled && !item.payment && !item.isCompleted && payment !== item._id && <button onClick={() => setPayment(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>}
                            {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && <button disabled={busyId === item._id} onClick={() => appointmentStripe(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-wait'><img className='max-w-20 max-h-5' src={assets.stripe_logo} alt='Pay with Stripe' /></button>}
                            {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && <button disabled={busyId === item._id} onClick={() => appointmentRazorpay(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-wait'><img className='max-w-20 max-h-5' src={assets.razorpay_logo} alt='Pay with Razorpay' /></button>}
                            {!item.cancelled && item.payment && !item.isCompleted && <p className='sm:min-w-48 py-2 border rounded text-[#696969]  bg-[#EAEFFF]'>Paid</p>}

                            {item.isCompleted && <p className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Completed</p>}
                            {!item.cancelled && !item.isCompleted && item.payment && <p className='sm:min-w-48 max-w-48 text-xs text-gray-500'>To cancel a paid appointment, please contact the clinic.</p>}

                            {!item.cancelled && !item.isCompleted && !item.payment && <button disabled={busyId === item._id} onClick={() => cancelAppointment(item._id)} className='disabled:opacity-50 disabled:cursor-wait text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appointment</button>}
                            {item.cancelled && !item.isCompleted && <p className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MyAppointments
