import jwt from "jsonwebtoken";
import { fail, serverError } from "../utils/respond.js";
import { maskAppointments, maskDoctor } from "../utils/demo.js";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { uploadToCloudinary, parseAddress } from "../utils/upload.js";
import userModel from "../models/userModel.js";
import { cancelAndReleaseSlot } from "../utils/slots.js";

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ role: 'admin', email }, process.env.JWT_SECRET, { expiresIn: '1d' })
            res.json({ success: true, token })
        } else {
            fail(res, 401, "Invalid credentials")
        }

    } catch (error) {
        serverError(res, error)
    }

}


// API for the read-only demo admin (no password, used on the login page)
const demoLoginAdmin = async (req, res) => {
    try {
        const token = jwt.sign({ role: 'admin', demo: true }, process.env.JWT_SECRET, { expiresIn: '2h' })
        res.json({ success: true, token })
    } catch (error) {
        serverError(res, error)
    }
}

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments: req.isDemo ? maskAppointments(appointments) : appointments })

    } catch (error) {
        serverError(res, error)
    }

}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body

        const cancelled = await cancelAndReleaseSlot(appointmentId)
        if (!cancelled) {
            return fail(res, 400, 'Appointment not found or cannot be cancelled')
        }

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        serverError(res, error)
    }

}

// API for adding Doctor
const addDoctor = async (req, res) => {

    try {

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return fail(res, 400, "Missing Details")
        }

        if (!imageFile) {
            return fail(res, 400, "Please upload a doctor image")
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return fail(res, 400, "Please enter a valid email")
        }

        // validating strong password
        if (password.length < 8) {
            return fail(res, 400, "Please enter a strong password")
        }

        const feesNumber = Number(fees)
        if (!Number.isFinite(feesNumber) || feesNumber <= 0) {
            return fail(res, 400, "Fees must be a positive number")
        }

        const parsedAddress = parseAddress(address)
        if (!parsedAddress || !parsedAddress.line1) {
            return fail(res, 400, "Please enter a valid address")
        }

        if (await doctorModel.exists({ email })) {
            return fail(res, 409, "A doctor with this email already exists")
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUrl = await uploadToCloudinary(imageFile)

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees: feesNumber,
            address: parsedAddress,
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()
        res.json({ success: true, message: 'Doctor Added' })

    } catch (error) {
        serverError(res, error)
    }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors: req.isDemo ? doctors.map(maskDoctor) : doctors })

    } catch (error) {
        serverError(res, error)
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        // count in the database instead of loading every record
        const [doctors, patients, appointments, latestAppointments] = await Promise.all([
            doctorModel.countDocuments(),
            userModel.countDocuments(),
            appointmentModel.countDocuments(),
            appointmentModel.find({}).sort({ date: -1 }).limit(5).lean(),
        ])

        const dashData = {
            doctors, appointments, patients,
            latestAppointments: req.isDemo ? maskAppointments(latestAppointments) : latestAppointments,
        }

        res.json({ success: true, dashData })

    } catch (error) {
        serverError(res, error)
    }
}

export {
    loginAdmin,
    demoLoginAdmin,
    appointmentsAdmin,
    appointmentCancel,
    addDoctor,
    allDoctors,
    adminDashboard
}