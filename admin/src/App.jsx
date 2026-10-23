import React, { Suspense, lazy, useContext } from 'react'
import { DoctorContext } from './context/DoctorContext';
import { AdminContext } from './context/AdminContext';
import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login';

// Pages load on demand, so the first visit downloads less code
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'))
const AllAppointments = lazy(() => import('./pages/Admin/AllAppointments'))
const AddDoctor = lazy(() => import('./pages/Admin/AddDoctor'))
const DoctorsList = lazy(() => import('./pages/Admin/DoctorsList'))
const DoctorAppointments = lazy(() => import('./pages/Doctor/DoctorAppointments'))
const DoctorDashboard = lazy(() => import('./pages/Doctor/DoctorDashboard'))
const DoctorProfile = lazy(() => import('./pages/Doctor/DoctorProfile'))

const App = () => {

  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)

  return dToken || aToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Suspense fallback={<div className='flex-1 min-h-[60vh] flex items-center justify-center'><div className='w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin' /></div>}>
        <Routes>
            <Route path='/' element={<Navigate to={aToken ? '/admin-dashboard' : '/doctor-dashboard'} replace />} />
            <Route path='/admin-dashboard' element={<Dashboard />} />
            <Route path='/all-appointments' element={<AllAppointments />} />
            <Route path='/add-doctor' element={<AddDoctor />} />
            <Route path='/doctor-list' element={<DoctorsList />} />
            <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
            <Route path='/doctor-appointments' element={<DoctorAppointments />} />
            <Route path='/doctor-profile' element={<DoctorProfile />} />
            <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Suspense>
      </div>
    </div>
  ) : (
    <>
      <ToastContainer />
      <Login />
    </>
  )
}

export default App