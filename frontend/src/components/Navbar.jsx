import React, { useContext, useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { optimizeImage } from '../utils/image'

const Navbar = () => {

  const navigate = useNavigate()

  const location = useLocation()

  const [showMenu, setShowMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef(null)
  const { token, setToken, userData } = useContext(AppContext)

  const logout = () => {
    localStorage.removeItem('token')
    setToken(false)
    setShowMenu(false)
    navigate('/login')
  }

  // close menus when the page changes
  useEffect(() => {
    setShowMenu(false)
    setShowProfileMenu(false)
  }, [location.pathname])

  // close the profile menu when clicking anywhere else
  useEffect(() => {
    const onClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-[#ADADAD]'>
      <Link to='/'><img className='w-44' src={assets.logo} alt='Prescripto home' /></Link>
      <ul className='md:flex items-start gap-5 font-medium hidden'>
        <NavLink to='/' >
          <li className='py-1'>HOME</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to='/doctors' >
          <li className='py-1'>ALL DOCTORS</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to='/about' >
          <li className='py-1'>ABOUT</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to='/contact' >
          <li className='py-1'>CONTACT</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
      </ul>

      <div className='flex items-center gap-4 '>
        {
          token && userData
            ? <div ref={profileMenuRef} className='relative'>
              <button
                type='button'
                onClick={() => setShowProfileMenu(prev => !prev)}
                aria-haspopup='menu'
                aria-expanded={showProfileMenu}
                aria-label='Account menu'
                className='flex items-center gap-2 cursor-pointer'
              >
                <img className='w-8 h-8 object-cover rounded-full' src={optimizeImage(userData.image, 80)} alt='' />
                <img className={`w-2.5 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} src={assets.dropdown_icon} alt='' />
              </button>
              {showProfileMenu && (
                <div role='menu' className='absolute right-0 top-full mt-3 min-w-48 bg-white border border-gray-200 shadow-lg rounded-lg flex flex-col p-2 text-base font-medium text-gray-600 z-30'>
                  <button role='menuitem' onClick={() => navigate('/my-profile')} className='text-left px-3 py-2 rounded hover:bg-gray-50 hover:text-black'>My Profile</button>
                  <button role='menuitem' onClick={() => navigate('/my-appointments')} className='text-left px-3 py-2 rounded hover:bg-gray-50 hover:text-black'>My Appointments</button>
                  <button role='menuitem' onClick={logout} className='text-left px-3 py-2 rounded hover:bg-gray-50 hover:text-black'>Logout</button>
                </div>
              )}
            </div>
            : <div className='hidden md:flex items-center gap-4'>
              <button onClick={() => navigate('/login')} className='font-medium text-gray-700 hover:text-primary'>Login</button>
              <button onClick={() => navigate('/login?mode=signup')} className='bg-primary text-white px-8 py-3 rounded-full font-light'>Create account</button>
            </div>
        }
        <button type='button' onClick={() => setShowMenu(true)} className='md:hidden' aria-label='Open menu'>
          <img className='w-6' src={assets.menu_icon} alt='' />
        </button>

        {/* ---- Mobile Menu ---- */}
        <div className={`md:hidden ${showMenu ? 'fixed w-full' : 'h-0 w-0'} right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
          <div className='flex items-center justify-between px-5 py-6'>
            <img src={assets.logo} className='w-36' alt='Prescripto' />
            <button type='button' onClick={() => setShowMenu(false)} aria-label='Close menu'>
              <img src={assets.cross_icon} className='w-7' alt='' />
            </button>
          </div>
          <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
            <NavLink onClick={() => setShowMenu(false)} to='/'><p className='px-4 py-2 rounded full inline-block'>HOME</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/doctors' ><p className='px-4 py-2 rounded full inline-block'>ALL DOCTORS</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/about' ><p className='px-4 py-2 rounded full inline-block'>ABOUT</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/contact' ><p className='px-4 py-2 rounded full inline-block'>CONTACT</p></NavLink>
          </ul>

          {/* ---- Account links (the desktop button and profile menu are hidden on phones) ---- */}
          <div className='flex flex-col items-center gap-2 mt-6 pt-6 mx-5 border-t text-base font-medium'>
            {token
              ? <>
                <NavLink onClick={() => setShowMenu(false)} to='/my-profile'><p className='px-4 py-2 rounded full inline-block'>MY PROFILE</p></NavLink>
                <NavLink onClick={() => setShowMenu(false)} to='/my-appointments'><p className='px-4 py-2 rounded full inline-block'>MY APPOINTMENTS</p></NavLink>
                <button onClick={logout} className='px-4 py-2 text-red-500'>LOGOUT</button>
              </>
              : <button onClick={() => { setShowMenu(false); navigate('/login') }} className='bg-primary text-white px-8 py-3 rounded-full font-light'>Login / Create account</button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar