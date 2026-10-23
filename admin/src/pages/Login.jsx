import axios from 'axios'
import React, { useContext, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const PATIENT_SITE = import.meta.env.VITE_PATIENT_URL || 'https://prescripto-hospital-app.vercel.app'

const Login = () => {

  const [state, setState] = useState('Admin')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [demoLoading, setDemoLoading] = useState('')   // 'Admin' | 'Doctor' while a demo login runs
  const [formError, setFormError] = useState('')

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)

  // save the token for the right role; App.jsx then shows the dashboard
  const saveToken = (role, token) => {
    if (role === 'Admin') {
      localStorage.setItem('aToken', token)
      setAToken(token)
    } else {
      localStorage.setItem('dToken', token)
      setDToken(token)
    }
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setFormError('')

    if (!email.trim() || !password) {
      return setFormError('Please enter your email and password')
    }

    setSubmitting(true)
    try {
      const endpoint = state === 'Admin' ? '/api/admin/login' : '/api/doctor/login'
      const { data } = await axios.post(backendUrl + endpoint, { email: email.trim(), password })
      if (data.success) {
        saveToken(state, data.token)
      } else {
        setFormError(data.message)
      }
    } catch (error) {
      console.log(error)
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // read-only demo session, no password needed
  const startDemo = async (role) => {
    setFormError('')
    setDemoLoading(role)
    try {
      const endpoint = role === 'Admin' ? '/api/admin/demo-login' : '/api/doctor/demo-login'
      const { data } = await axios.post(backendUrl + endpoint)
      if (data.success) {
        saveToken(role, data.token)
        toast.info(`You're exploring the ${role.toLowerCase()} demo. Changes are disabled.`)
      } else {
        setFormError(data.message)
      }
    } catch (error) {
      console.log(error)
      setFormError(error.message)
    } finally {
      setDemoLoading('')
    }
  }

  const inputClass = 'w-full rounded-lg border border-[#DADADA] px-3 py-2.5 mt-1 text-[#262626] outline-none focus-visible:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'

  return (
    <div className='min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center px-4 py-10'>
      <img className='w-44 mb-6' src={assets.admin_logo} alt='Prescripto' />

      <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-8 text-sm text-[#5E5E5E]'>

        {/* Admin / Doctor switch */}
        <div className='grid grid-cols-2 bg-[#F2F3FF] rounded-full p-1 mb-6' role='tablist'>
          {['Admin', 'Doctor'].map((role) => (
            <button key={role} type='button' role='tab' aria-selected={state === role}
              onClick={() => { setState(role); setFormError('') }}
              className={`py-2 rounded-full font-medium transition-all ${state === role ? 'bg-white text-primary shadow' : 'text-gray-500 hover:text-gray-700'}`}>
              {role}
            </button>
          ))}
        </div>

        <h1 className='text-2xl font-semibold text-[#262626]'>{state} login</h1>
        <p className='mt-1 mb-6'>{state === 'Admin' ? 'Manage doctors and appointments.' : 'See and manage your appointments.'}</p>

        {formError && (
          <p role='alert' className='mb-4 rounded-lg bg-red-50 border border-red-200 text-red-600 px-3 py-2'>{formError}</p>
        )}

        <form onSubmit={onSubmitHandler} noValidate className='flex flex-col gap-4'>
          <div>
            <label htmlFor='email' className='font-medium text-[#262626]'>Email</label>
            <input id='email' type='email' autoComplete='username' placeholder={state === 'Admin' ? 'admin@example.com' : 'doctor@example.com'}
              value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor='password' className='font-medium text-[#262626]'>Password</label>
            <div className='relative'>
              <input id='password' type={showPassword ? 'text' : 'password'} autoComplete='current-password' placeholder='Your password'
                value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-16`} />
              <button type='button' onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className='absolute right-2 top-1/2 -translate-y-1/2 mt-0.5 px-2 py-1 text-xs font-medium text-primary hover:underline'>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button type='submit' disabled={submitting || Boolean(demoLoading)}
            className='mt-2 bg-primary text-white w-full py-3 rounded-full text-base hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-wait'>
            {submitting ? 'Please wait...' : `Log in as ${state.toLowerCase()}`}
          </button>
        </form>

        {/* ---------- Demo ---------- */}
        <div className='flex items-center gap-3 my-6 text-xs text-gray-400'>
          <span className='h-px flex-1 bg-gray-200' /> JUST LOOKING? <span className='h-px flex-1 bg-gray-200' />
        </div>

        <p className='text-center mb-3'>Explore the panels with a read-only demo. No password needed.</p>
        <div className='grid grid-cols-2 gap-3'>
          {['Admin', 'Doctor'].map((role) => (
            <button key={role} type='button' onClick={() => startDemo(role)} disabled={submitting || Boolean(demoLoading)}
              className='py-2.5 rounded-full border border-primary text-primary font-medium hover:bg-primary hover:text-white transition-colors disabled:opacity-60 disabled:cursor-wait'>
              {demoLoading === role ? 'Opening...' : `Try ${role.toLowerCase()} demo`}
            </button>
          ))}
        </div>
      </div>

      <a href={PATIENT_SITE} className='mt-6 text-sm text-gray-500 hover:text-primary'>
        Looking to book an appointment? <span className='text-primary font-medium'>Go to the patient site →</span>
      </a>
    </div>
  )
}

export default Login
