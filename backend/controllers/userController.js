import jwt from "jsonwebtoken";
import { fail, serverError } from "../utils/respond.js";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { uploadToCloudinary, parseAddress } from "../utils/upload.js";
import { patientRedirectBase } from "../config/origins.js";
import stripe from "stripe";
import razorpay from 'razorpay';
import { validateSlot, reserveSlot, releaseSlot, cancelAndReleaseSlot } from "../utils/slots.js";

// Gateway Initialize
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Returns an error message if the user can't pay for this appointment, otherwise null
const checkPayable = (appointmentData, userId) => {
    if (!appointmentData || appointmentData.cancelled) return 'Appointment Cancelled or not found'
    if (appointmentData.userId !== userId) return 'Unauthorized action'
    if (appointmentData.payment) return 'Appointment already paid'
    return null
}

// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return fail(res, 400, 'Missing Details')
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return fail(res, 400, "Please enter a valid email")
        }

        // validating strong password
        if (password.length < 8) {
            return fail(res, 400, "Please enter a strong password")
        }

        if (await userModel.exists({ email })) {
            return fail(res, 409, "An account with this email already exists")
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.json({ success: true, token })

    } catch (error) {
        serverError(res, error)
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return fail(res, 401, "Invalid credentials")
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' })
            res.json({ success: true, token })
        }
        else {
            fail(res, 401, "Invalid credentials")
        }
    } catch (error) {
        serverError(res, error)
    }
}

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        serverError(res, error)
    }
}

// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return fail(res, 400, "Data Missing")
        }

        const parsedAddress = parseAddress(address)
        if (!parsedAddress) {
            return fail(res, 400, "Please enter a valid address")
        }

        if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
            return fail(res, 400, "Please enter a valid phone number")
        }

        if (!['Male', 'Female', 'Not Selected'].includes(gender)) {
            return fail(res, 400, "Please select a valid gender")
        }

        const update = { name, phone, address: parsedAddress, dob, gender }

        if (imageFile) {
            update.image = await uploadToCloudinary(imageFile)
        }

        await userModel.findByIdAndUpdate(userId, update)

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        serverError(res, error)
    }
}

// API to book appointment 
const bookAppointment = async (req, res) => {

    try {

        const { userId, docId, slotDate, slotTime } = req.body

        const slotError = validateSlot(slotDate, slotTime)
        if (slotError) {
            return fail(res, 400, slotError)
        }

        // snapshot of the doctor stored on the appointment (without password, email or booking history)
        const docData = await doctorModel.findById(docId).select("-password -email -slots_booked").lean()

        if (!docData) {
            return fail(res, 404, 'Doctor not found')
        }

        if (!docData.available) {
            return fail(res, 409, 'Doctor Not Available')
        }

        const reserved = await reserveSlot(docId, slotDate, slotTime)
        if (!reserved) {
            return fail(res, 409, 'Slot Not Available')
        }

        const userData = await userModel.findById(userId).select("-password").lean()

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        try {
            await new appointmentModel(appointmentData).save()
        } catch (error) {
            // free the slot again if the appointment couldn't be saved
            await releaseSlot(docId, slotDate, slotTime)
            throw error
        }

        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        serverError(res, error)
    }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body

        // Paid appointments can't be cancelled online (no refund flow); the clinic handles those
        const appointment = await appointmentModel.findById(appointmentId).select('userId payment').lean()
        if (appointment && appointment.userId === userId && appointment.payment) {
            return fail(res, 409, 'Paid appointments cannot be cancelled online. Please contact the clinic.')
        }

        // only cancels the user's own unpaid appointment, and frees the doctor's slot
        const cancelled = await cancelAndReleaseSlot(appointmentId, { userId, payment: false })
        if (!cancelled) {
            return fail(res, 400, 'Appointment not found or cannot be cancelled')
        }

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        serverError(res, error)
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        serverError(res, error)
    }
}

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        const error = checkPayable(appointmentData, userId)
        if (error) {
            return fail(res, 400, error)
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        serverError(res, error)
    }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { userId, razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        const appointmentData = await appointmentModel.findById(orderInfo.receipt)
        if (!appointmentData || appointmentData.userId !== userId) {
            return fail(res, 403, 'Unauthorized action')
        }

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            res.json({ success: true, message: "Payment Successful" })
        }
        else {
            fail(res, 400, 'Payment Failed')
        }
    } catch (error) {
        serverError(res, error)
    }
}

// API to make payment of appointment using Stripe
const paymentStripe = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const redirectBase = patientRedirectBase(req.headers.origin)

        const appointmentData = await appointmentModel.findById(appointmentId)

        const error = checkPayable(appointmentData, userId)
        if (error) {
            return fail(res, 400, error)
        }

        const currency = process.env.CURRENCY

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: "Appointment Fees"
                },
                unit_amount: appointmentData.amount * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            // Stripe replaces {CHECKOUT_SESSION_ID} with the real session id
            success_url: `${redirectBase}/verify?success=true&appointmentId=${appointmentData._id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${redirectBase}/verify?success=false&appointmentId=${appointmentData._id}`,
            line_items: line_items,
            mode: 'payment',
            metadata: { appointmentId: appointmentData._id.toString() },
        })

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        serverError(res, error)
    }
}

const verifyStripe = async (req, res) => {
    try {

        const { userId, appointmentId, sessionId } = req.body

        if (!sessionId) {
            return fail(res, 400, 'Payment Failed')
        }

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (!appointmentData || appointmentData.userId !== userId) {
            return fail(res, 403, 'Unauthorized action')
        }

        // Check with Stripe that this session was paid and belongs to this appointment
        const session = await stripeInstance.checkout.sessions.retrieve(sessionId)
        if (session.payment_status !== 'paid' || session.metadata?.appointmentId !== appointmentId) {
            return fail(res, 400, 'Payment Failed')
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
        res.json({ success: true, message: 'Payment Successful' })

    } catch (error) {
        serverError(res, error)
    }

}

export {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay,
    paymentStripe,
    verifyStripe
}