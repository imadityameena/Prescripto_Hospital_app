import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { optimizeImage } from '../utils/image'
import { formatDob, ageFrom, isUnset } from '../utils/format'
import { PageHeader, Card, Field, DetailRow, NotSet, Badge, Spinner, inputClass, buttonPrimary, buttonSecondary } from '../components/ui'

const TODAY = new Date().toISOString().slice(0, 10)
const MAX_PHOTO_MB = 5

// copy of the profile that the form edits, so "Cancel" can throw changes away
const toDraft = (user) => ({
  name: user.name || '',
  phone: isUnset(user.phone) ? '' : user.phone,
  line1: user.address?.line1 || '',
  line2: user.address?.line2 || '',
  gender: user.gender || 'Not Selected',
  dob: /^\d{4}-\d{2}-\d{2}$/.test(user.dob || '') ? user.dob : '',
})

const MyProfile = () => {

  const { token, backendUrl, userData, loadUserProfileData } = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)
  const [draft, setDraft] = useState(null)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // temporary URL for the new photo preview
  useEffect(() => {
    if (!image) return setPreview('')
    const url = URL.createObjectURL(image)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [image])

  const startEdit = () => {
    setDraft(toDraft(userData))
    setErrors({})
    setIsEdit(true)
  }

  const cancelEdit = () => {
    setIsEdit(false)
    setImage(null)
    setErrors({})
  }

  const update = (field) => (e) => {
    setDraft(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const choosePhoto = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file')
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) return toast.error(`Photo must be ${MAX_PHOTO_MB} MB or smaller`)
    setImage(file)
  }

  const validate = () => {
    const e = {}
    const digits = draft.phone.replace(/\D/g, '')
    if (!draft.name.trim()) e.name = 'Please enter your name'
    if (!/^[0-9+\-\s()]+$/.test(draft.phone.trim()) || digits.length < 10 || digits.length > 15) e.phone = 'Please enter a valid mobile number'
    if (draft.dob && draft.dob > TODAY) e.dob = 'Date of birth cannot be in the future'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', draft.name.trim())
      formData.append('phone', draft.phone.trim())
      formData.append('address', JSON.stringify({ line1: draft.line1.trim(), line2: draft.line2.trim() }))
      formData.append('gender', draft.gender)
      formData.append('dob', draft.dob || 'Not Selected')
      if (image) formData.append('image', image)

      const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })

      if (data.success) {
        toast.success('Profile updated')
        await loadUserProfileData()
        cancelEdit()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (!userData) return <Spinner />

  const age = ageFrom(userData.dob)
  const photo = preview || optimizeImage(userData.image, 320)
  const hasAddress = userData.address?.line1 || userData.address?.line2

  return (
    <div className='pb-10'>
      <PageHeader
        title='My profile'
        subtitle='Your details are shared only with the doctors you book.'
        action={!isEdit && <button onClick={startEdit} className={buttonPrimary}>Edit profile</button>}
      />

      <form onSubmit={saveProfile} noValidate className='grid lg:grid-cols-[320px_1fr] gap-6 items-start'>

        {/* ---------- Left: photo and summary ---------- */}
        <Card className='lg:sticky lg:top-6'>
          <div className='flex flex-col items-center text-center'>
            <div className='relative'>
              <img src={photo} alt='Profile photo' className='w-32 h-32 rounded-full object-cover bg-[#EAEFFF] border-4 border-white shadow' />
              {isEdit && (
                <label htmlFor='photo' className='absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow hover:opacity-90' title='Change photo'>
                  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='w-4 h-4' aria-hidden='true'>
                    <path d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' /><circle cx='12' cy='13' r='4' />
                  </svg>
                  <span className='sr-only'>Change photo</span>
                </label>
              )}
              <input id='photo' type='file' accept='image/*' className='sr-only' onChange={(e) => { choosePhoto(e.target.files[0]); e.target.value = '' }} />
            </div>

            {isEdit
              ? <div className='w-full mt-5 text-left'>
                <Field id='name' label='Full name' error={errors.name}>
                  <input id='name' value={draft.name} onChange={update('name')} autoComplete='name' className={inputClass(errors.name)} />
                </Field>
                {image && <p className='text-xs text-gray-500 mt-3'>New photo selected · <button type='button' onClick={() => setImage(null)} className='text-primary hover:underline'>Undo</button></p>}
              </div>
              : <>
                <p className='mt-4 text-xl font-semibold text-[#262626]'>{userData.name}</p>
                <p className='text-sm text-gray-500 break-all'>{userData.email}</p>
                <div className='flex flex-wrap justify-center gap-2 mt-3'>
                  <Badge color='blue'>Patient</Badge>
                  {!isUnset(userData.gender) && <Badge>{userData.gender}</Badge>}
                  {age !== null && <Badge>{age} years</Badge>}
                </div>
              </>
            }
          </div>

          {!isEdit && (
            <Link to='/my-appointments' className='mt-6 flex items-center justify-between rounded-xl bg-[#F2F3FF] px-4 py-3 text-sm font-medium text-primary hover:bg-[#E2E5FF] transition-colors'>
              My appointments <span aria-hidden='true'>→</span>
            </Link>
          )}
        </Card>

        {/* ---------- Right: details ---------- */}
        <div className='flex flex-col gap-6'>
          <Card title='Contact information'>
            {isEdit
              ? <div className='grid sm:grid-cols-2 gap-4'>
                <Field id='email' label='Email' hint='Email cannot be changed'>
                  <input id='email' value={userData.email} disabled className={`${inputClass(false)} bg-gray-50 text-gray-500 cursor-not-allowed`} />
                </Field>
                <Field id='phone' label='Mobile number' error={errors.phone}>
                  <input id='phone' type='tel' autoComplete='tel' value={draft.phone} onChange={update('phone')} placeholder='e.g. 98765 43210' className={inputClass(errors.phone)} />
                </Field>
                <div className='sm:col-span-2'>
                  <Field id='line1' label='Address'>
                    <input id='line1' autoComplete='address-line1' value={draft.line1} onChange={update('line1')} placeholder='House no., street' className={inputClass(false)} />
                  </Field>
                </div>
                <div className='sm:col-span-2'>
                  <Field id='line2' label='Address line 2' optional>
                    <input id='line2' autoComplete='address-line2' value={draft.line2} onChange={update('line2')} placeholder='Area, city, PIN code' className={inputClass(false)} />
                  </Field>
                </div>
              </div>
              : <dl className='divide-y divide-gray-100 -my-2.5'>
                <DetailRow label='Email'>{userData.email}</DetailRow>
                <DetailRow label='Mobile'>{isUnset(userData.phone) ? <NotSet /> : userData.phone}</DetailRow>
                <DetailRow label='Address'>
                  {hasAddress
                    ? <>{userData.address.line1}{userData.address.line2 && <><br />{userData.address.line2}</>}</>
                    : <NotSet />}
                </DetailRow>
              </dl>
            }
          </Card>

          <Card title='Personal details'>
            {isEdit
              ? <div className='grid sm:grid-cols-2 gap-4'>
                <Field id='gender' label='Gender'>
                  <select id='gender' value={draft.gender} onChange={update('gender')} className={inputClass(false)}>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                    <option value='Other'>Other</option>
                    <option value='Not Selected'>Prefer not to say</option>
                  </select>
                </Field>
                <Field id='dob' label='Date of birth' error={errors.dob}>
                  <input id='dob' type='date' max={TODAY} min='1900-01-01' value={draft.dob} onChange={update('dob')} className={inputClass(errors.dob)} />
                </Field>
              </div>
              : <dl className='divide-y divide-gray-100 -my-2.5'>
                <DetailRow label='Gender'>{isUnset(userData.gender) ? <NotSet /> : userData.gender}</DetailRow>
                <DetailRow label='Date of birth'>
                  {formatDob(userData.dob) ? <>{formatDob(userData.dob)} <span className='text-gray-400'>· {age} years</span></> : <NotSet />}
                </DetailRow>
              </dl>
            }
          </Card>

          {isEdit && (
            <div className='flex flex-wrap justify-end gap-3'>
              <button type='button' onClick={cancelEdit} disabled={saving} className={buttonSecondary}>Cancel</button>
              <button type='submit' disabled={saving} className={buttonPrimary}>{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default MyProfile
