// DoctorCard.tsx
import React from "react";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  imageUrl: string;
  experience: string;
  qualifications: string;
  location: string;
}

const DoctorCard: React.FC<{ doctor: Doctor }> = ({ doctor }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img className="w-full h-48 object-cover" src={doctor.imageUrl} alt={doctor.name} />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{doctor.name}</h3>
        <p className="text-gray-600 text-sm">{doctor.specialization}</p>
        <p className="text-gray-500 text-xs mt-2">
          {doctor.experience} | {doctor.qualifications}
        </p>
        <p className="text-gray-500 text-xs mt-1">Location: {doctor.location}</p>
        <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;