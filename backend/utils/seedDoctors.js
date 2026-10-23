import "dotenv/config";
import bcrypt from "bcrypt";
import connectDB from "../config/mongodb.js";
import doctorModel from "../models/doctorModel.js";

const femaleDoctorNumbers = new Set([2, 5, 9, 11, 13, 15]);

const rawDoctors = [
  {
    name: "Dr. Richard James",
    image:
      "https://res.cloudinary.com/dbx7m6zjs/image/upload/v1775065772/doc1_k25gzj.png",
    speciality: "General physician",
    degree: "MBBS",
    experience: "4 Years",
    about:
      "Dr. Richard James has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 50,
    address: {
      line1: "17th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    name: "Dr. Emily Larson",
    image:
      "https://res.cloudinary.com/dbx7m6zjs/image/upload/v1775065894/doc2_nlweux.png",
    speciality: "Gynecologist",
    degree: "MBBS",
    experience: "3 Years",
    about:
      "Dr. Emily Larson has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 60,
    address: {
      line1: "27th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    name: "Dr. Sarah Patel",
    image:
      "https://res.cloudinary.com/dbx7m6zjs/image/upload/v1775065896/doc14_gltdrb.png",
    speciality: "Dermatologist",
    degree: "MBBS",
    experience: "1 Year",
    about:
      "Dr. Sarah Patel has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 30,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    name: "Dr. Christopher Lee",
    image:
      "https://res.cloudinary.com/dbx7m6zjs/image/upload/v1775065894/doc10_znp0mm.png",
    speciality: "Pediatricians",
    degree: "MBBS",
    experience: "2 Years",
    about:
      "Dr. Christopher Lee has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 40,
    address: {
      line1: "47th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    name: "Dr. Jennifer Garcia",
    image:
      "https://res.cloudinary.com/dbx7m6zjs/image/upload/v1775065895/doc9_ia8rdp.png",
    speciality: "Neurologist",
    degree: "MBBS",
    experience: "4 Years",
    about:
      "Dr. Jennifer Garcia has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 50,
    address: {
      line1: "57th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    name: "Dr. Andrew Williams",
    image:
      "https://res.cloudinary.com/dbx7m6zjs/image/upload/v1775065894/doc8_bq9zx0.png",
    speciality: "Neurologist",
    degree: "MBBS",
    experience: "4 Years",
    about:
      "Dr. Andrew Williams has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 50,
    address: {
      line1: "57th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    name: "Dr. Christopher Davis",
    image:
      "https://res.cloudinary.com/dbx7m6zjs/image/upload/v1775065895/doc12_zyo26d.png",
    speciality: "General physician",
    degree: "MBBS",
    experience: "4 Years",
    about:
      "Dr. Christopher Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 50,
    address: {
      line1: "17th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    name: "Dr. Timothy White",
    image:
      "https://res.cloudinary.com/dbx7m6zjs/image/upload/v1775065896/doc3_tgmtu6.png",
    speciality: "Gynecologist",
    degree: "MBBS",
    experience: "3 Years",
    about:
      "Dr. Timothy White has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 60,
    address: {
      line1: "27th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    name: "Dr. Ava Mitchell",
    image:
      "https://res.cloudinary.com/dbx7m6zjs/image/upload/v1775065895/doc11_uow6xu.png",
    speciality: "Dermatologist",
    degree: "MBBS",
    experience: "1 Year",
    about:
      "Dr. Ava Mitchell has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 30,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    name: "Dr. Jeffrey King",
    image:
      "https://res.cloudinary.com/dbx7m6zjs/image/upload/v1775065896/doc4_upbvs4.png",
    speciality: "Pediatricians",
    degree: "MBBS",
    experience: "2 Years",
    about:
      "Dr. Jeffrey King has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 40,
    address: {
      line1: "47th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    name: "Dr. Zoe Kelly",
    image:
      "https://res.cloudinary.com/dbx7m6zjs/image/upload/v1775065896/doc15_ara2fy.png",
    speciality: "Gastroenterologist",
    degree: "MBBS",
    experience: "4 Years",
    about:
      "Dr. Zoe Kelly has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 50,
    address: {
      line1: "57th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    name: "Dr. Patrick Harris",
    image:
      "https://res.cloudinary.com/dbx7m6zjs/image/upload/v1775065896/doc6_vu9mdy.png",
    speciality: "Neurologist",
    degree: "MBBS",
    experience: "4 Years",
    about:
      "Dr. Patrick Harris has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 50,
    address: {
      line1: "57th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    name: "Dr. Chloe Evans",
    image:
      "https://res.cloudinary.com/dbx7m6zjs/image/upload/v1775065896/doc13_slv5k7.png",
    speciality: "General physician",
    degree: "MBBS",
    experience: "4 Years",
    about:
      "Dr. Chloe Evans has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 50,
    address: {
      line1: "17th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    name: "Dr. Ryan Martinez",
    image: "https://res.cloudinary.com/dbx7m6zjs/image/upload/v1775065894/doc7_h5akch.png",
    speciality: "Gynecologist",
    degree: "MBBS",
    experience: "3 Years",
    about:
      "Dr. Ryan Martinez has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 60,
    address: {
      line1: "27th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    name: "Dr. Amelia Hill",
    image:
      "https://res.cloudinary.com/dbx7m6zjs/image/upload/v1775065896/doc5_g9rhc9.png",
    speciality: "Dermatologist",
    degree: "MBBS",
    experience: "1 Year",
    about:
      "Dr. Amelia Hill has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 30,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
];

const buildSeedDoctors = async () => {
  // The password comes from the environment so it is never stored in the repo
  const seedPassword = process.env.SEED_DOCTOR_PASSWORD;
  if (!seedPassword || seedPassword.length < 8) {
    throw new Error("Set SEED_DOCTOR_PASSWORD (at least 8 characters) in backend/.env before seeding");
  }
  const hashedPassword = await bcrypt.hash(seedPassword, 10);

  return rawDoctors.map((doctor, index) => {
    const doctorNumber = index + 1;
    return {
      name: doctor.name,
      email: `doctor${doctorNumber}@prescripto.com`,
      password: hashedPassword,
      image: doctor.image,
      speciality: doctor.speciality,
      degree: doctor.degree,
      experience: doctor.experience,
      about: doctor.about,
      available: true,
      fees: doctor.fees,
      slots_booked: {},
      address: doctor.address,
      date: Date.now() + doctorNumber,
      gender: femaleDoctorNumbers.has(doctorNumber) ? "female" : "male",
    };
  });
};

const seedDoctors = async () => {
  try {
    await connectDB();

    const doctors = await buildSeedDoctors();

    await doctorModel.deleteMany({
      email: { $regex: /^doctor\d+@prescripto\.com$/ },
    });

    await doctorModel.insertMany(doctors);

    console.log("Doctors seeded successfully.");
    console.log("Seeded doctors use the password from SEED_DOCTOR_PASSWORD.");
    process.exit(0);
  } catch (error) {
    console.error("Doctor seeding failed:", error.message);
    process.exit(1);
  }
};

seedDoctors();
