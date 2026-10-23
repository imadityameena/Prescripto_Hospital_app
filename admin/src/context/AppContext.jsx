import { createContext } from "react";


export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currency = import.meta.env.VITE_CURRENCY
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Function to format the date eg. ( 20_1_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2]
    }

    // Function to calculate the age from a date of birth eg. ( 2000-01-20 => 24 )
    const calculateAge = (dob) => {
        const birthDate = new Date(dob)
        if (isNaN(birthDate)) return '-'   // dob not set ("Not Selected")

        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const birthdayNotYetThisYear =
            today.getMonth() < birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
        if (birthdayNotYetThisYear) age--
        return age
    }

    // Formats an amount as money, e.g. 1500 => "$1,500".
    // VITE_CURRENCY can be a code ("USD", "INR") or a symbol ("$").
    const formatMoney = (amount) => {
        const value = Number(amount) || 0
        if (/^[A-Z]{3}$/.test(currency || '')) {
            try {
                return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency, minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 }).format(value)
            } catch { /* unknown code: fall through */ }
        }
        return `${currency || ''}${value.toLocaleString('en-US')}`
    }

    const value = {
        backendUrl,
        currency,
        formatMoney,
        slotDateFormat,
        calculateAge,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider