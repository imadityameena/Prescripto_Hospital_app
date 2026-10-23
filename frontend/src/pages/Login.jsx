import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { assets } from '../assets/assets'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ADMIN_SITE = import.meta.env.VITE_ADMIN_URL || 'https://prescripto-hospital-app-pxla.vercel.app'
const TODAY = new Date().toISOString().slice(0, 10)

// ---------- password strength ----------

const passwordChecks = (password) => ({
  length: password.length >= 8,
  letter: /[A-Za-z]/.test(password),
  number: /\d/.test(password),
  mixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
  symbol: /[^A-Za-z0-9]/.test(password),
})

// Minimum the server accepts: 8+ characters with a letter and a number
const meetsPolicy = (checks) => checks.length && checks.letter && checks.number

const passwordStrength = (password) => {
  if (!password) return null
  const checks = passwordChecks(password)
  if (!meetsPolicy(checks)) return { level: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-600' }
  const extras = [checks.mixedCase, checks.symbol, password.length >= 12].filter(Boolean).length
  if (extras === 0) return { level: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' }
  if (extras === 1) return { level: 3, label: 'Good', color: 'bg-lime-500', text: 'text-lime-700' }
  return { level: 4, label: 'Strong', color: 'bg-green-600', text: 'text-green-700' }
}

// ---------- small building blocks ----------

const inputBase = 'w-full rounded-lg border px-3 py-2.5 mt-1 text-[#262626] bg-white outline-none focus-visible:outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'

const Field = ({ id, label, optional, error, hint, children }) => (
  <div>
    <label htmlFor={id} className='font-medium text-[#262626]'>
      {label} {optional && <span className='font-normal text-gray-400'>(optional)</span>}
    </label>
    {children}
    {error
      ? <p id={`${id}-error`} className='text-red-500 text-xs mt-1'>{error}</p>
      : hint && <p className='text-gray-400 text-xs mt-1'>{hint}</p>}
  </div>
)

const PasswordInput = ({ id, value, onChange, error, placeholder, autoComplete }) => {
  const [show, setShow] = useState(false)
  const [capsLock, setCapsLock] = useState(false)

  const checkCaps = (e) => setCapsLock(e.getModifierState && e.getModifierState('CapsLock'))

  return (
    <>
      <div className='relative'>
        <input id={id} type={show ? 'text' : 'password'} autoComplete={autoComplete} placeholder={placeholder}
          value={value} onChange={onChange} onKeyUp={checkCaps} onKeyDown={checkCaps} onBlur={() => setCapsLock(false)}
          aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputBase} pr-16 ${error ? 'border-red-400' : 'border-[#DADADA]'}`} />
        <button type='button' onClick={() => setShow(prev => !prev)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className='absolute right-2 top-1/2 -translate-y-1/2 mt-0.5 px-2 py-1 text-xs font-medium text-primary hover:underline'>
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {capsLock && <p className='text-amber-600 text-xs mt-1'>Caps Lock is on</p>}
    </>
  )
}

const StrengthMeter = ({ password }) => {
  const strength = passwordStrength(password)
  const checks = passwordChecks(password)
  const rules = [
    [checks.length, 'At least 8 characters'],
    [checks.letter && checks.number, 'A letter and a number'],
    [checks.mixedCase, 'Upper and lower case letters'],
    [checks.symbol, 'A symbol (e.g. ! @ #)'],
  ]

  return (
    <div className='mt-2' aria-live='polite'>
      <div className='flex gap-1'>
        {[1, 2, 3, 4].map(i => (
          <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${strength && i <= strength.level ? strength.color : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className='text-xs mt-1 text-gray-500'>
        Password strength: <span className={`font-medium ${strength ? strength.text : 'text-gray-400'}`}>{strength ? strength.label : '—'}</span>
      </p>
      <ul className='grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5 mt-1.5 text-xs'>
        {rules.map(([ok, text], i) => (
          <li key={text} className={ok ? 'text-green-600' : 'text-gray-400'}>
            {ok ? '✓' : '○'} {text}{i < 2 ? '' : ' (recommended)'}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------- page ----------

const emptyForm = {
  name: '', email: '', password: '', confirmPassword: '',
  phone: '', gender: '', dob: '', line1: '', line2: '',
}

const Login = () => {

  // "/login?mode=signup" opens the sign-up tab
  const [searchParams] = useSearchParams()
  const [state, setState] = useState(searchParams.get('mode') === 'signup' ? 'Sign Up' : 'Login')
  const [step, setStep] = useState(1)   // sign-up step: 1 = account, 2 = personal details

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { backendUrl, token, setToken } = useContext(AppContext)

  const isSignUp = state === 'Sign Up'

  // page to go back to after logging in (e.g. the booking page)
  const redirectTo = location.state?.from || '/'

  const switchMode = (mode) => {
    setState(mode)
    setStep(1)
    setErrors({})
    setFormError('')
  }

  useEffect(() => {
    switchMode(searchParams.get('mode') === 'signup' ? 'Sign Up' : 'Login')
  }, [searchParams])

  useEffect(() => {
    if (token) {
      navigate(redirectTo, { replace: true })
    }
  }, [token])

  // update one field and clear its error
  const update = (field) => (e) => {
    const value = e.target.value
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const inputClass = (field) => `${inputBase} ${errors[field] ? 'border-red-400' : 'border-[#DADADA]'}`
  const errorProps = (field) => ({ 'aria-invalid': Boolean(errors[field]), 'aria-describedby': errors[field] ? `${field}-error` : undefined })

  // ---------- validation ----------

  const validateLogin = () => {
    const e = {}
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Please enter a valid email address'
    if (!form.password) e.password = 'Please enter your password'
    return e
  }

  const validateAccountStep = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Please enter your full name'
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Please enter a valid email address'
    if (!meetsPolicy(passwordChecks(form.password))) e.password = 'Use at least 8 characters with a letter and a number'
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const validateDetailsStep = () => {
    const e = {}
    const digits = form.phone.replace(/\D/g, '')
    if (!/^[0-9+\-\s()]+$/.test(form.phone.trim()) || digits.length < 10 || digits.length > 15) e.phone = 'Please enter a valid mobile number'
    if (!form.gender) e.gender = 'Please select an option'
    if (!form.dob) e.dob = 'Please enter your date of birth'
    else if (form.dob > TODAY) e.dob = 'Date of birth cannot be in the future'
    if (!form.line1.trim()) e.line1 = 'Please enter your address'
    return e
  }

  const showErrors = (e) => {
    setErrors(e)
    const first = Object.keys(e)[0]
    if (first) document.getElementById(first)?.focus()
    return Object.keys(e).length === 0
  }

  // ---------- submit ----------

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setFormError('')

    if (!isSignUp) {
      if (!showErrors(validateLogin())) return
    } else if (step === 1) {
      if (showErrors(validateAccountStep())) setStep(2)
      return
    } else if (!showErrors(validateDetailsStep())) {
      return
    }

    setSubmitting(true)
    try {

      const { data } = isSignUp
        ? await axios.post(backendUrl + '/api/user/register', {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
          gender: form.gender,
          dob: form.dob,
          address: { line1: form.line1.trim(), line2: form.line2.trim() },
        })
        : await axios.post(backendUrl + '/api/user/login', { email: form.email.trim(), password: form.password })

      if (data.success) {
        localStorage.setItem('token', data.token)
        setToken(data.token)
        toast.success(isSignUp ? 'Account created. Welcome to Prescripto!' : 'Welcome back!')
      } else {
        setFormError(data.message)
      }

    } catch (error) {
      console.log(error)
      // an existing email is a step 1 problem, so take the user back there
      if (isSignUp && error.response?.status === 409) setStep(1)
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }

  }

  // ---------- render ----------

  const title = !isSignUp ? 'Log in to your account' : step === 1 ? 'Create your account' : 'A few more details'
  const subtitle = !isSignUp
    ? 'Log in to book and manage your appointments.'
    : step === 1 ? 'Start with your login details.' : 'Doctors use these to prepare for your visit.'

  return (
    <div className='min-h-[80vh] flex items-center justify-center py-10'>
      <div className='w-full max-w-5xl grid md:grid-cols-[2fr_3fr] rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white'>

        {/* ---------- Left: brand panel (desktop only) ---------- */}
        <div className='hidden md:flex flex-col justify-between bg-primary text-white p-10 relative overflow-hidden'>
          <div className='relative z-10'>
            <p className='text-3xl font-semibold leading-tight'>
              {isSignUp ? 'Your health, booked in minutes' : 'Welcome back to Prescripto'}
            </p>
            <ul className='mt-6 flex flex-col gap-3 text-sm text-white/90'>
              <li className='flex items-start gap-2'><span aria-hidden='true'>✓</span> Book with trusted doctors across specialities</li>
              <li className='flex items-start gap-2'><span aria-hidden='true'>✓</span> Pick a time that suits you, 7 days ahead</li>
              <li className='flex items-start gap-2'><span aria-hidden='true'>✓</span> Pay online and track all your appointments</li>
              <li className='flex items-start gap-2'><span aria-hidden='true'>✓</span> Your details are only shared with your doctor</li>
            </ul>
            <div className='flex items-center gap-3 mt-8 text-sm text-white/90'>
              <img className='w-24' src={assets.group_profiles} alt='' />
              <p>Join patients booking<br />with Prescripto</p>
            </div>
          </div>
          <img className='relative z-10 w-52 self-end -mb-10 mt-6' src={assets.appointment_img} alt='' />
        </div>

        {/* ---------- Right: form ---------- */}
        <form onSubmit={onSubmitHandler} noValidate className='p-6 sm:p-10 flex flex-col text-sm text-[#5E5E5E]'>

          {/* Login / Sign up switch */}
          <div className='grid grid-cols-2 bg-[#F2F3FF] rounded-full p-1 mb-6' role='tablist'>
            {['Login', 'Sign Up'].map((mode) => (
              <button key={mode} type='button' role='tab' aria-selected={state === mode} onClick={() => switchMode(mode)}
                className={`py-2 rounded-full font-medium transition-all ${state === mode ? 'bg-white text-primary shadow' : 'text-gray-500 hover:text-gray-700'}`}>
                {mode === 'Login' ? 'Login' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Sign-up progress */}
          {isSignUp && (
            <div className='mb-5'>
              <div className='flex justify-between text-xs font-medium mb-1.5'>
                <span className={step === 1 ? 'text-primary' : 'text-gray-400'}>1. Account</span>
                <span className={step === 2 ? 'text-primary' : 'text-gray-400'}>2. Personal details</span>
              </div>
              <div className='h-1.5 bg-gray-100 rounded-full overflow-hidden'>
                <div className={`h-full bg-primary transition-all duration-300 ${step === 1 ? 'w-1/2' : 'w-full'}`} />
              </div>
            </div>
          )}

          <h1 className='text-2xl font-semibold text-[#262626]'>{title}</h1>
          <p className='mt-1 mb-6'>{subtitle}</p>

          {formError && (
            <p role='alert' className='mb-4 rounded-lg bg-red-50 border border-red-200 text-red-600 px-3 py-2'>{formError}</p>
          )}

          {/* ---------- Login ---------- */}
          {!isSignUp && (
            <div className='flex flex-col gap-4'>
              <Field id='email' label='Email' error={errors.email}>
                <input id='email' type='email' autoComplete='email' placeholder='you@example.com'
                  value={form.email} onChange={update('email')} {...errorProps('email')} className={inputClass('email')} />
              </Field>
              <Field id='password' label='Password' error={errors.password}>
                <PasswordInput id='password' value={form.password} onChange={update('password')} error={errors.password}
                  placeholder='Your password' autoComplete='current-password' />
              </Field>
            </div>
          )}

          {/* ---------- Sign up, step 1: account ---------- */}
          {isSignUp && step === 1 && (
            <div className='flex flex-col gap-4'>
              <Field id='name' label='Full name' error={errors.name}>
                <input id='name' type='text' autoComplete='name' placeholder='e.g. Priya Sharma'
                  value={form.name} onChange={update('name')} {...errorProps('name')} className={inputClass('name')} />
              </Field>
              <Field id='email' label='Email' error={errors.email}>
                <input id='email' type='email' autoComplete='email' placeholder='you@example.com'
                  value={form.email} onChange={update('email')} {...errorProps('email')} className={inputClass('email')} />
              </Field>
              <Field id='password' label='Password' error={errors.password}>
                <PasswordInput id='password' value={form.password} onChange={update('password')} error={errors.password}
                  placeholder='Create a password' autoComplete='new-password' />
                <StrengthMeter password={form.password} />
              </Field>
              <Field id='confirmPassword' label='Confirm password' error={errors.confirmPassword}
                hint={form.confirmPassword && form.confirmPassword === form.password ? '✓ Passwords match' : ''}>
                <PasswordInput id='confirmPassword' value={form.confirmPassword} onChange={update('confirmPassword')} error={errors.confirmPassword}
                  placeholder='Type the password again' autoComplete='new-password' />
              </Field>
            </div>
          )}

          {/* ---------- Sign up, step 2: personal details ---------- */}
          {isSignUp && step === 2 && (
            <div className='grid sm:grid-cols-2 gap-4'>
              <Field id='phone' label='Mobile number' error={errors.phone} hint='Include country code if outside India'>
                <input id='phone' type='tel' inputMode='tel' autoComplete='tel' placeholder='e.g. 98765 43210'
                  value={form.phone} onChange={update('phone')} {...errorProps('phone')} className={inputClass('phone')} />
              </Field>
              <Field id='gender' label='Gender' error={errors.gender}>
                <select id='gender' value={form.gender} onChange={update('gender')} {...errorProps('gender')} className={inputClass('gender')}>
                  <option value='' disabled>Select</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                  <option value='Other'>Other</option>
                  <option value='Not Selected'>Prefer not to say</option>
                </select>
              </Field>
              <div className='sm:col-span-2'>
                <Field id='dob' label='Date of birth' error={errors.dob}>
                  <input id='dob' type='date' autoComplete='bday' max={TODAY} min='1900-01-01'
                    value={form.dob} onChange={update('dob')} {...errorProps('dob')} className={inputClass('dob')} />
                </Field>
              </div>
              <div className='sm:col-span-2'>
                <Field id='line1' label='Address' error={errors.line1}>
                  <input id='line1' type='text' autoComplete='address-line1' placeholder='House no., street'
                    value={form.line1} onChange={update('line1')} {...errorProps('line1')} className={inputClass('line1')} />
                </Field>
              </div>
              <div className='sm:col-span-2'>
                <Field id='line2' label='Address line 2' optional>
                  <input id='line2' type='text' autoComplete='address-line2' placeholder='Area, city, PIN code'
                    value={form.line2} onChange={update('line2')} className={inputClass('line2')} />
                </Field>
              </div>
            </div>
          )}

          {/* ---------- Buttons ---------- */}
          <div className='mt-6 flex gap-3'>
            {isSignUp && step === 2 && (
              <button type='button' onClick={() => { setStep(1); setErrors({}); setFormError('') }}
                className='px-6 py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50'>
                Back
              </button>
            )}
            <button type='submit' disabled={submitting}
              className='flex-1 bg-primary text-white py-3 rounded-full text-base hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-wait'>
              {submitting ? 'Please wait...' : !isSignUp ? 'Login' : step === 1 ? 'Continue' : 'Create account'}
            </button>
          </div>

          <p className='mt-5 text-center'>
            {isSignUp
              ? <>Already have an account? <button type='button' onClick={() => switchMode('Login')} className='text-primary font-medium hover:underline'>Log in</button></>
              : <>New to Prescripto? <button type='button' onClick={() => switchMode('Sign Up')} className='text-primary font-medium hover:underline'>Create an account</button></>
            }
          </p>

          {/* staff login lives on the admin panel (it also has a read-only demo) */}
          <div className='mt-6 pt-5 border-t border-gray-100 text-center text-xs text-gray-500'>
            Doctor or admin?{' '}
            <a href={ADMIN_SITE} className='text-primary font-medium hover:underline'>Staff login →</a>
            <span className='block mt-1 text-gray-400'>Includes a read-only demo, no password needed</span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
