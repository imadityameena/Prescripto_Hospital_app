import React, { useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { StatCard, StatusBadge, Avatar, Panel, PageLoader } from '../../components/DashboardParts'

const DoctorDashboard = () => {

  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, formatMoney } = useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getDashData()
    }
  }, [dToken])

  if (!dashData) return <PageLoader />

  return (
    <div className='w-full max-w-6xl p-5 flex flex-col gap-6'>

      <h1 className='text-lg font-medium text-gray-800'>Dashboard</h1>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        <StatCard
          to='/doctor-appointments'
          icon={assets.earning_icon}
          value={formatMoney(dashData.earnings)}
          label='Earnings'
          sub={`Online ${formatMoney(dashData.earningsOnline)} · Cash ${formatMoney(dashData.earningsCash)}`}
        />
        <StatCard to='/doctor-appointments' icon={assets.appointments_icon} value={dashData.appointments} label='Appointments' />
        <StatCard to='/doctor-appointments' icon={assets.patients_icon} value={dashData.patients} label='Patients' />
      </div>

      <Panel
        icon={assets.list_icon}
        title='Latest bookings'
        action={<Link to='/doctor-appointments' className='text-sm text-primary hover:underline'>View all</Link>}
      >
        {dashData.latestAppointments.length === 0 && (
          <p className='px-5 py-10 text-center text-sm text-gray-500'>No bookings yet.</p>
        )}

        <ul className='divide-y divide-gray-100'>
          {dashData.latestAppointments.map((item) => (
            <li className='flex items-center gap-3 px-5 py-3 hover:bg-gray-50' key={item._id}>
              <Avatar src={item.userData.image} name={item.userData.name} />
              <div className='flex-1 min-w-0 text-sm'>
                <p className='text-gray-800 font-medium truncate'>{item.userData.name}</p>
                <p className='text-gray-500'>{slotDateFormat(item.slotDate)} · {item.slotTime}</p>
              </div>
              <span className='hidden sm:block text-sm text-gray-600 w-20 text-right'>{formatMoney(item.amount)}</span>
              {item.cancelled || item.isCompleted
                ? <StatusBadge item={item} />
                : <div className='flex items-center gap-1'>
                  <StatusBadge item={item} />
                  <button type='button' onClick={() => cancelAppointment(item._id)} title='Cancel appointment' aria-label='Cancel appointment'><img className='w-9' src={assets.cancel_icon} alt='' /></button>
                  <button type='button' onClick={() => completeAppointment(item._id)} title='Mark as completed' aria-label='Mark as completed'><img className='w-9' src={assets.tick_icon} alt='' /></button>
                </div>
              }
            </li>
          ))}
        </ul>
      </Panel>

    </div>
  )
}

export default DoctorDashboard
