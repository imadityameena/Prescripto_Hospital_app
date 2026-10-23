import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '₹'
    const backendUrl = process.env.NODE_ENV !== "production"
  ? "http://localhost:4000"  // Local
  : "https://prescripto-hospital-backend.vercel.app"; // Deployed


    const [doctors, setDoctors] = useState([])
    const [doctorsLoading, setDoctorsLoading] = useState(true)
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [userData, setUserData] = useState(false)

    // Getting Doctors using API
    const getDoctosData = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setDoctorsLoading(false)
        }

    }

    // Getting User Profile using API
    const loadUserProfileData = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })

            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }


    // Show the server's error message, and log out when the session has expired
    useEffect(() => {
        const id = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.data?.message) {
                    error.message = error.response.data.message
                }
                const headers = error.config?.headers
                const sentToken = headers?.get ? headers.get('token') : headers?.['token']
                if (error.response?.status === 401 && sentToken) {
                    localStorage.removeItem('token')
                    setToken('')
                    setUserData(false)
                }
                return Promise.reject(error)
            }
        )
        return () => axios.interceptors.response.eject(id)
    }, [])

    useEffect(() => {
        getDoctosData()
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
        }
    }, [token])

    const value = {
        doctors, getDoctosData, doctorsLoading,
        currencySymbol,
        backendUrl,
        token, setToken,
        userData, setUserData, loadUserProfileData
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider
