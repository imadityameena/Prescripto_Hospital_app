import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

// slotDate looks like "23_10_2026" (day_month_year, month starts at 1)
// slotTime looks like "10:30 AM"
const SLOT_DATE_RE = /^(\d{1,2})_(\d{1,2})_(\d{4})$/
const SLOT_TIME_RE = /^(0[1-9]|1[0-2]):(00|30) (AM|PM)$/

// Returns an error message if the slot is malformed or in the past, otherwise null
const validateSlot = (slotDate, slotTime) => {
    const dateMatch = SLOT_DATE_RE.exec(slotDate || '')
    if (!dateMatch || !SLOT_TIME_RE.test(slotTime || '')) {
        return 'Please select a valid date and time'
    }
    const [, day, month, year] = dateMatch.map(Number)
    const slotDay = new Date(year, month - 1, day)
    if (slotDay.getDate() !== day || slotDay.getMonth() !== month - 1) {
        return 'Please select a valid date and time'
    }
    // allow one day of slack: the server may run in UTC while the patient is behind UTC
    const yesterday = new Date()
    yesterday.setHours(0, 0, 0, 0)
    yesterday.setDate(yesterday.getDate() - 1)
    if (slotDay < yesterday) {
        return 'Cannot book a slot in the past'
    }
    return null
}

// Atomically reserves a slot. Returns true if reserved, false if it was already taken
// or the doctor is unavailable. Doing this in one query prevents two requests
// from booking the same slot at the same time.
const reserveSlot = async (docId, slotDate, slotTime) => {
    const path = `slots_booked.${slotDate}`
    const updated = await doctorModel.findOneAndUpdate(
        { _id: docId, available: true, [path]: { $ne: slotTime } },
        { $push: { [path]: slotTime } }
    )
    return Boolean(updated)
}

const releaseSlot = async (docId, slotDate, slotTime) => {
    await doctorModel.findByIdAndUpdate(docId, { $pull: { [`slots_booked.${slotDate}`]: slotTime } })
}

// Cancels an appointment (if not already cancelled) and frees the doctor's slot.
// `filter` can add ownership conditions such as { userId } or { docId }.
// Returns the cancelled appointment, or null if nothing matched.
const cancelAndReleaseSlot = async (appointmentId, filter = {}) => {
    const appointment = await appointmentModel.findOneAndUpdate(
        { _id: appointmentId, cancelled: false, isCompleted: false, ...filter },
        { cancelled: true }
    )
    if (appointment) {
        await releaseSlot(appointment.docId, appointment.slotDate, appointment.slotTime)
    }
    return appointment
}

export { validateSlot, reserveSlot, releaseSlot, cancelAndReleaseSlot }
