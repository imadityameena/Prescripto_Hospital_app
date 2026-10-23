// Sites allowed to call this API

const PATIENT_SITE = "https://prescripto-hospital-app.vercel.app"
const ADMIN_SITE = "https://prescripto-hospital-app-pxla.vercel.app"

const isDev = process.env.NODE_ENV !== "production"

// Any localhost port is allowed in development (Vite picks the next free port)
const LOCALHOST = /^http:\/\/localhost:\d+$/

const isAllowedOrigin = (origin) =>
    origin === PATIENT_SITE || origin === ADMIN_SITE || (isDev && LOCALHOST.test(origin || ""))

// Where Stripe sends the patient back after paying. Only trusted sites are used,
// so a request can't redirect patients to some other website.
const patientRedirectBase = (origin) =>
    origin && origin !== ADMIN_SITE && isAllowedOrigin(origin) ? origin : PATIENT_SITE

export { isAllowedOrigin, patientRedirectBase }
