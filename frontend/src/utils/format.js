// Date and profile helpers shared by several pages

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "23_10_2026" (day_month_year, month starts at 1) -> Date
export const slotToDate = (slotDate = '') => {
  const [day, month, year] = slotDate.split('_').map(Number)
  return new Date(year, month - 1, day)
}

// "23_10_2026" -> "23 Oct 2026"
export const formatSlotDate = (slotDate = '') => {
  const [day, month, year] = slotDate.split('_')
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`
}

// "23_10_2026" -> "Fri"
export const slotWeekday = (slotDate) =>
  slotToDate(slotDate).toLocaleDateString('en-IN', { weekday: 'short' })

// true if the slot's day is before today
export const isPastSlot = (slotDate) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return slotToDate(slotDate) < today
}

// "2016-05-09" -> "9 May 2016", or '' when not set
export const formatDob = (dob) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob || '')) return ''
  const [y, m, d] = dob.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

// "2016-05-09" -> 10, or null when not set
export const ageFrom = (dob) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob || '')) return null
  const birth = new Date(dob + 'T00:00:00')
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--
  return age
}

// "Neurologist" -> "Neurologists", "Pediatricians" stays as is
export const plural = (word = '') => (word.endsWith('s') ? word : `${word}s`)

// values older accounts were created with, which really mean "not filled in"
export const isUnset = (value) => !value || value === 'Not Selected' || /^0+$/.test(String(value))
