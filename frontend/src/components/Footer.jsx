import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const ADMIN_SITE = import.meta.env.VITE_ADMIN_URL || 'https://prescripto-hospital-app-pxla.vercel.app'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10  mt-40 text-sm'>

        <div>
          <img className='mb-5 w-40' src={assets.logo} alt='Prescripto' />
          <p className='w-full md:w-2/3 text-gray-600 leading-6'>Prescripto is your trusted partner for accessible and reliable healthcare.  
We connect you with experienced doctors across multiple specialties.  
Book appointments anytime, anywhere — your health is our priority.  
</p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li><Link to='/' onClick={() => scrollTo(0, 0)} className='hover:text-primary'>Home</Link></li>
            <li><Link to='/doctors' onClick={() => scrollTo(0, 0)} className='hover:text-primary'>All doctors</Link></li>
            <li><Link to='/about' onClick={() => scrollTo(0, 0)} className='hover:text-primary'>About us</Link></li>
            <li><Link to='/contact' onClick={() => scrollTo(0, 0)} className='hover:text-primary'>Contact</Link></li>
            <li><a href={ADMIN_SITE} className='hover:text-primary'>Doctor / Admin login</a></li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li><a href='tel:+12124567890' className='hover:text-primary'>+1-212-456-7890</a></li>
            <li><a href='mailto:prescripto@gmail.com' className='hover:text-primary'>prescripto@gmail.com</a></li>
          </ul>
        </div>

      </div>

      <div>
        <hr />
        <p className='py-5 text-sm text-center'>Copyright {new Date().getFullYear()} © Prescripto.com - All Rights Reserved.</p>
      </div>

    </div>
  )
}

export default Footer
