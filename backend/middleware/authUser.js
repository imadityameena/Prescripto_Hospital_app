import jwt from 'jsonwebtoken'

// user authentication middleware
const authUser = async (req, res, next) => {
    const { token } = req.headers
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not Authorized Login Again' })
    }
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        if (token_decode.role !== 'user') {
            return res.status(401).json({ success: false, message: 'Not Authorized Login Again' })
        }
        req.body.userId = token_decode.id
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({ success: false, message: 'Session expired. Please login again' })
    }
}

export default authUser;
