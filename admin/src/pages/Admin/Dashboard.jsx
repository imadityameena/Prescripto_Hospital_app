import React, { useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { StatCard, StatusBadge, Avatar, Panel, PageLoader } from '../../components/DashboardParts'

const Dashboard = () => {

  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext)
  const { slotDateFormat, formatMoney } = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getDashData()
    }
  }, [aToken])

  if (!dashData) return <PageLoader />

  return (
    <div className='w-full max-w-6xl p-5 flex flex-col gap-6'>

      <h1 className='text-lg font-medium text-gray-800'>Dashboard</h1>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        <StatCard to='/doctor-list' icon={assets.doctor_icon} value={dashData.doctors} label='Doctors' />
        <StatCard to='/all-appointments' icon={assets.appointments_icon} value={dashData.appointments} label='Appointments' />
        <StatCard to='/all-appointments' icon={assets.patients_icon} value={dashData.patients} label='Patients' />
      </div>

      <Panel
        icon={assets.list_icon}
        title='Latest bookings'
        action={<Link to='/all-appointments' className='text-sm text-primary hover:underline'>View all</Link>}
      >
        {dashData.latestAppointments.length === 0 && (
          <p className='px-5 py-10 text-center text-sm text-gray-500'>No bookings yet.</p>
        )}

        <ul className='divide-y divide-gray-100'>
          {dashData.latestAppointments.map((item) => (
            <li className='flex items-center gap-3 px-5 py-3 hover:bg-gray-50' key={item._id}>
              <Avatar src={item.docData.image} name={item.docData.name} />
              <div className='flex-1 min-w-0 text-sm'>
                <p className='text-gray-800 font-medium truncate'>{item.docData.name}</p>
                <p className='text-gray-500 truncate'>
                  {item.userData.name} · {slotDateFormat(item.slotDate)} · {item.slotTime}
                </p>
              </div>
              <span className='hidden sm:block text-sm text-gray-600 w-20 text-right'>{formatMoney(item.amount)}</span>
              <StatusBadge item={item} />
              {!item.cancelled && !item.isCompleted && (
                <button type='button' onClick={() => cancelAppointment(item._id)} title='Cancel appointment' aria-label='Cancel appointment'>
                  <img className='w-9' src={assets.cancel_icon} alt='' />
                </button>
              )}
            </li>
          ))}
        </ul>
      </Panel>

    </div>
  )
}

export default Dashboard
