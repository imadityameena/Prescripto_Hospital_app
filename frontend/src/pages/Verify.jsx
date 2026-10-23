import axios from 'axios';
import React, { useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const Verify = () => {

    const [searchParams, setSearchParams] = useSearchParams()

    const success = searchParams.get("success")
    const appointmentId = searchParams.get("appointmentId")
    const sessionId = searchParams.get("session_id")

    const { backendUrl, token } = useContext(AppContext)

    const navigate = useNavigate()

    // Function to verify stripe payment
    const verifyStripe = async () => {

        // patient closed the Stripe page without paying
        if (success !== 'true') {
            toast.info('Payment cancelled')
            return navigate("/my-appointments")
        }

        try {

            const { data } = await axios.post(backendUrl + "/api/user/verifyStripe", { appointmentId, sessionId }, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        } finally {
            navigate("/my-appointments")
        }

    }

    useEffect(() => {
        if (token && appointmentId && success) {
            verifyStripe()
        } else {
            navigate("/my-appointments")
        }
    }, [token])

    return (
        <div className='min-h-[60vh] flex items-center justify-center'>
            <div className="w-20 h-20 border-4 border-gray-300 border-t-4 border-t-primary rounded-full animate-spin"></div>
        </div>
    )
}

export default Verify