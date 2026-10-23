// Shared checks for patient details (used by sign-up and profile update)

const GENDERS = ['Male', 'Female', 'Other', 'Not Selected']

const isValidPhone = (phone) => {
    const value = String(phone || '').trim()
    const digits = value.replace(/\D/g, '')
    return /^[0-9+\-\s()]+$/.test(value) && digits.length >= 10 && digits.length <= 15
}

const isValidGender = (gender) => GENDERS.includes(gender)

// dob must be a real "YYYY-MM-DD" date in the past, and not more than 120 years ago.
// Existing accounts may still have "Not Selected", which is allowed when allowUnset is true.
const isValidDob = (dob, { allowUnset = false } = {}) => {
    if (allowUnset && dob === 'Not Selected') return true
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob || '')) return false
    const date = new Date(dob + 'T00:00:00')
    if (isNaN(date) || date.toISOString().slice(0, 10) !== dob) return false
    const now = new Date()
    const oldest = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate())
    return date <= now && date >= oldest
}

// At least 8 characters, with at least one letter and one number
const isStrongEnoughPassword = (password) =>
    typeof password === 'string' && password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)

export { GENDERS, isValidPhone, isValidGender, isValidDob, isStrongEnoughPassword }
