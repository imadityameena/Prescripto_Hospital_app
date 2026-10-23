import jwt from "jsonwebtoken";
import { fail, serverError } from "../utils/respond.js";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { cancelAndReleaseSlot } from "../utils/slots.js";
import { parseAddress } from "../utils/upload.js";

// API for doctor Login 
const loginDoctor = async (req, res) => {

    try {

        const { email, password } = req.body
        const user = await doctorModel.findOne({ email })

        if (!user) {
            return fail(res, 401, "Invalid credentials")
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id, role: 'doctor' }, process.env.JWT_SECRET, { expiresIn: '7d' })
            res.json({ success: true, token })
        } else {
            fail(res, 401, "Invalid credentials")
        }


    } catch (error) {
        serverError(res, error)
    }
}

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {

        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

        res.json({ success: true, appointments })

    } catch (error) {
        serverError(res, error)
    }
}

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
    try {

        const { docId, appointmentId } = req.body

        // only cancels this doctor's own appointment, and frees the slot
        const cancelled = await cancelAndReleaseSlot(appointmentId, { docId })
        if (cancelled) {
            return res.json({ success: true, message: 'Appointment Cancelled' })
        }

        fail(res, 400, 'Appointment not found or cannot be cancelled')

    } catch (error) {
        serverError(res, error)
    }

}

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
    try {

        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
            return res.json({ success: true, message: 'Appointment Completed' })
        }

        fail(res, 400, 'Appointment not found')

    } catch (error) {
        serverError(res, error)
    }

}

// API to get all doctors list for Frontend
const doctorList = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({ success: true, doctors })

    } catch (error) {
        serverError(res, error)
    }

}

// API to change doctor availablity for Admin and Doctor Panel
const changeAvailablity = async (req, res) => {
    try {

        const { docId } = req.body

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: 'Availablity Changed' })

    } catch (error) {
        serverError(res, error)
    }
}

// API to get doctor profile for  Doctor Panel
const doctorProfile = async (req, res) => {
    try {

        const { docId } = req.body
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({ success: true, profileData })

    } catch (error) {
        serverError(res, error)
    }
}

// API to update doctor profile data from  Doctor Panel
const updateDoctorProfile = async (req, res) => {
    try {

        const { docId, fees, address, available, about } = req.body

        const feesNumber = Number(fees)
        if (!Number.isFinite(feesNumber) || feesNumber <= 0) {
            return fail(res, 400, "Fees must be a positive number")
        }

        const parsedAddress = parseAddress(address)
        if (!parsedAddress || !parsedAddress.line1) {
            return fail(res, 400, "Please enter a valid address")
        }

        await doctorModel.findByIdAndUpdate(docId, {
            fees: feesNumber,
            address: parsedAddress,
            available: Boolean(available),
            about: String(about || ''),
        })

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        serverError(res, error)
    }
}

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {

        const { docId } = req.body

        const [appointments, patientIds, earningsResult, latestAppointments] = await Promise.all([
            appointmentModel.countDocuments({ docId }),
            appointmentModel.distinct('userId', { docId }),
            // online = paid through Stripe/Razorpay; cash = completed without online payment
            appointmentModel.aggregate([
                { $match: { docId, cancelled: false, $or: [{ isCompleted: true }, { payment: true }] } },
                { $group: { _id: '$payment', total: { $sum: '$amount' } } },
            ]),
            appointmentModel.find({ docId }).sort({ date: -1 }).limit(5).lean(),
        ])

        const earningsOnline = earningsResult.find(r => r._id === true)?.total || 0
        const earningsCash = earningsResult.find(r => r._id === false)?.total || 0

        const dashData = {
            earnings: earningsOnline + earningsCash,
            earningsOnline,
            earningsCash,
            appointments,
            patients: patientIds.length,
            latestAppointments
        }

        res.json({ success: true, dashData })

    } catch (error) {
        serverError(res, error)
    }
}

export {
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    doctorList,
    changeAvailablity,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile
}