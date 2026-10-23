import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'
import { PageHeader } from '../components/ui'

const icon = (path) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='w-6 h-6' aria-hidden='true'>{path}</svg>
)

const REASONS = [
  { title: 'Efficiency', text: 'Streamlined appointment scheduling that fits into your busy lifestyle.', icon: icon(<><circle cx='12' cy='12' r='10' /><path d='M12 6v6l4 2' /></>) },
  { title: 'Convenience', text: 'Access to a network of trusted healthcare professionals in your area.', icon: icon(<><path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' /><circle cx='12' cy='10' r='3' /></>) },
  { title: 'Personalisation', text: 'Tailored recommendations and reminders to help you stay on top of your health.', icon: icon(<><path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' /><circle cx='12' cy='7' r='4' /></>) },
]

const About = () => {
  return (
    <div className='pb-10'>
      <PageHeader title='About us' subtitle='Making it simple to see the right doctor at the right time.' />

      <section className='bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden grid md:grid-cols-[360px_1fr]'>
        <img className='w-full h-full object-cover bg-[#EAEFFF]' src={assets.about_image} alt='Doctors at Prescripto' />
        <div className='p-6 sm:p-10 flex flex-col justify-center gap-5 text-gray-600 leading-relaxed'>
          <p>Welcome to Prescripto, your trusted partner in managing your healthcare needs conveniently and efficiently.
            At Prescripto, we understand the challenges people face when it comes to scheduling doctor appointments and managing their health records.</p>
          <p>Prescripto is committed to excellence in healthcare technology.
            We continuously improve our platform to make booking easier and to deliver a better experience.
            Whether you're booking your first appointment or managing ongoing care, Prescripto is here to support you every step of the way.</p>
          <div className='rounded-xl bg-[#F2F3FF] p-5'>
            <h2 className='font-semibold text-[#262626]'>Our vision</h2>
            <p className='mt-1'>To create a seamless healthcare experience for every user, bridging the gap between patients and healthcare providers so you can access the care you need, when you need it.</p>
          </div>
        </div>
      </section>

      <h2 className='text-2xl font-semibold text-[#262626] mt-14'>Why choose us</h2>
      <div className='grid md:grid-cols-3 gap-5 mt-5'>
        {REASONS.map(({ title, text, icon }) => (
          <div key={title} className='bg-white rounded-2xl border border-gray-200 p-6 hover:border-primary/40 hover:shadow-md transition-all'>
            <span className='w-12 h-12 rounded-xl bg-[#F2F3FF] text-primary flex items-center justify-center'>{icon}</span>
            <h3 className='font-semibold text-[#262626] mt-4'>{title}</h3>
            <p className='text-sm text-gray-600 mt-1 leading-relaxed'>{text}</p>
          </div>
        ))}
      </div>

      <div className='mt-14 rounded-2xl bg-primary text-white p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <p className='text-xl sm:text-2xl font-semibold'>Ready to book your visit?</p>
          <p className='text-white/80 mt-1'>Find a doctor by speciality and pick a time that suits you.</p>
        </div>
        <Link to='/doctors' onClick={() => scrollTo(0, 0)} className='inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-medium bg-white text-primary hover:bg-[#F2F3FF] transition-colors whitespace-nowrap'>Find a doctor</Link>
      </div>
    </div>
  )
}

export default About
