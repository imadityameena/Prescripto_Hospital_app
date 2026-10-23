// Small helpers so every error response has the right HTTP status

const fail = (res, status, message) => res.status(status).json({ success: false, message })

// Unexpected errors: log the details, but don't send internal messages to the browser
const serverError = (res, error) => {
    if (error?.name === 'CastError') {
        return fail(res, 400, 'Invalid id')
    }
    if (error?.code === 11000) {
        return fail(res, 409, 'An account with this email already exists')
    }
    console.error(error)
    return fail(res, 500, 'Something went wrong. Please try again.')
}

export { fail, serverError }
