// Appointments store full copies of the patient and doctor. Lists and dashboards
// only need a few fields, so we send just those (much smaller responses).
// The default patient photo is a ~5 KB inline image, so it's left out and the
// panel shows the patient's initial instead.

const realImage = (image) => (typeof image === 'string' && !image.startsWith('data:') ? image : '')

const slimAppointment = (a) => ({
    _id: a._id,
    userId: a.userId,
    docId: a.docId,
    slotDate: a.slotDate,
    slotTime: a.slotTime,
    amount: a.amount,
    date: a.date,
    cancelled: a.cancelled,
    payment: a.payment,
    isCompleted: a.isCompleted,
    userData: {
        name: a.userData?.name,
        image: realImage(a.userData?.image),
        dob: a.userData?.dob,
        gender: a.userData?.gender,
    },
    docData: {
        name: a.docData?.name,
        image: a.docData?.image,
        speciality: a.docData?.speciality,
        address: a.docData?.address,
    },
})

const slimAppointments = (list) => list.map(slimAppointment)

export { slimAppointments }
