import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {

  const { dToken, setDToken, isDemo: isDemoDoctor } = useContext(DoctorContext)
  const { aToken, setAToken, isDemo: isDemoAdmin } = useContext(AdminContext)
  const isDemo = aToken ? isDemoAdmin : isDemoDoctor

  const navigate = useNavigate()

  const logout = () => {
    navigate('/')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
  }

  return (
    <div className='flex justify-between items-center gap-2 px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-1.5 sm:gap-2 text-xs min-w-0'>
        <Link to='/'><img className='w-28 sm:w-40' src={assets.admin_logo} alt='Prescripto admin home' /></Link>
        <p className='border px-2 sm:px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600 whitespace-nowrap'>{aToken ? 'Admin' : 'Doctor'}</p>
        {isDemo && (
          <p className='px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap' title='You can look around, but changes are disabled'>
            Demo<span className='hidden sm:inline'> · read-only</span>
          </p>
        )}
      </div>
      <button onClick={() => logout()} className='bg-primary text-white text-sm px-4 sm:px-10 py-2 rounded-full whitespace-nowrap shrink-0'>{isDemo ? 'Exit demo' : 'Logout'}</button>
    </div>
  )
}

export default Navbar