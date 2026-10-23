import jwt from "jsonwebtoken"
import { DEMO_MESSAGE } from "../utils/demo.js"

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers
        if (!atoken) {
            return res.status(401).json({ success: false, message: 'Not Authorized Login Again' })
        }
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)
        const isDemo = token_decode.demo === true
        if (token_decode.role !== 'admin' || (!isDemo && token_decode.email !== process.env.ADMIN_EMAIL)) {
            return res.status(401).json({ success: false, message: 'Not Authorized Login Again' })
        }
        // demo admins can look but not change anything
        if (isDemo && req.method !== 'GET') {
            return res.status(403).json({ success: false, message: DEMO_MESSAGE })
        }
        req.isDemo = isDemo
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({ success: false, message: 'Session expired. Please login again' })
    }
}

export default authAdmin;
