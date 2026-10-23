import React from 'react'
import { assets } from '../assets/assets'
import { PageHeader } from '../components/ui'

const icon = (path) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='w-5 h-5' aria-hidden='true'>{path}</svg>
)

const DETAILS = [
  { label: 'Our office', value: <>54709 Willms Station<br />Suite 350, Washington, USA</>, icon: icon(<><path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' /><circle cx='12' cy='10' r='3' /></>) },
  { label: 'Phone', value: <a href='tel:+14155550132' className='hover:text-primary'>(415) 555-0132</a>, icon: icon(<path d='M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z' />) },
  { label: 'Email', value: <a href='mailto:prescripto@gmail.com' className='hover:text-primary'>prescripto@gmail.com</a>, icon: icon(<><rect x='2' y='4' width='20' height='16' rx='2' /><path d='m22 7-10 6L2 7' /></>) },
]

const Contact = () => {
  return (
    <div className='pb-10'>
      <PageHeader title='Contact us' subtitle="Questions about a booking or payment? We're happy to help." />

      <section className='bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden grid md:grid-cols-[360px_1fr]'>
        <img className='w-full h-full object-cover bg-[#EAEFFF]' src={assets.contact_image} alt='Prescripto clinic' />
        <div className='p-6 sm:p-10 flex flex-col justify-center gap-6'>
          {DETAILS.map(({ label, value, icon }) => (
            <div key={label} className='flex gap-4'>
              <span className='w-11 h-11 shrink-0 rounded-xl bg-[#F2F3FF] text-primary flex items-center justify-center'>{icon}</span>
              <div>
                <p className='text-sm text-gray-500'>{label}</p>
                <p className='text-[#262626] mt-0.5'>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Contact
