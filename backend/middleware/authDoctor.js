import jwt from 'jsonwebtoken'
import { DEMO_MESSAGE } from '../utils/demo.js'

// doctor authentication middleware
const authDoctor = async (req, res, next) => {
    const { dtoken } = req.headers
    if (!dtoken) {
        return res.status(401).json({ success: false, message: 'Not Authorized Login Again' })
    }
    try {
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
        if (token_decode.role !== 'doctor') {
            return res.status(401).json({ success: false, message: 'Not Authorized Login Again' })
        }
        // demo doctors can look but not change anything
        if (token_decode.demo === true && req.method !== 'GET') {
            return res.status(403).json({ success: false, message: DEMO_MESSAGE })
        }
        req.isDemo = token_decode.demo === true
        req.body.docId = token_decode.id
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({ success: false, message: 'Session expired. Please login again' })
    }
}

export default authDoctor;
