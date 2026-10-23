// Demo mode: lets visitors (e.g. recruiters) look around the admin and doctor
// panels without a password. Demo tokens are read-only, and patients' private
// details are hidden because anyone with the link can see the demo.

const DEMO_MESSAGE = 'Demo mode is read-only. Changes are disabled.'

// "Priya Sharma" -> "Priya S."
const shortName = (name = '') => {
    const [first = 'Patient', ...rest] = String(name).trim().split(/\s+/)
    const last = rest.pop()
    return last ? `${first} ${last[0].toUpperCase()}.` : first
}

const maskPatient = (userData = {}) => ({
    name: shortName(userData.name),
    image: userData.image,
    gender: userData.gender,
    dob: userData.dob,          // only used to show the age
    email: 'hidden in demo',
    phone: 'hidden in demo',
    address: { line1: 'hidden in demo', line2: '' },
})

const maskAppointment = (appointment) => {
    const plain = appointment.toObject ? appointment.toObject() : appointment
    return { ...plain, userData: maskPatient(plain.userData) }
}

const maskAppointments = (appointments) => appointments.map(maskAppointment)

const maskDoctor = (doctor) => {
    const plain = doctor?.toObject ? doctor.toObject() : doctor
    return plain ? { ...plain, email: 'hidden in demo' } : plain
}

export { DEMO_MESSAGE, maskAppointments, maskDoctor }
