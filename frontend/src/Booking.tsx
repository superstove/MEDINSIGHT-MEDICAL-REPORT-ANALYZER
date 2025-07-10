import React, { useState } from 'react';
import { Search, Calendar, Clock, Stethoscope, GraduationCap, Download, Lightbulb, CheckCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { auth } from './firebase';
import emailjs from '@emailjs/browser';

interface Doctor {
    id: number;
    name: string;
    specialization: string;
    education: string;
    experience: string;
    image: string;
    availability: string[];
}

const doctors: Doctor[] = [
    {
        id: 1,
        name: "Dr. Sarah Johnson",
        specialization: "Cardiologist",
        education: "MD - Cardiology, MBBS",
        experience: "15 years",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400",
        availability: ["Mon - Fri", "9:00 AM - 5:00 PM"]
      },
      {
        id: 2,
        name: "Dr. Michael Chen",
        specialization: "Neurologist",
        education: "MD - Neurology, MBBS",
        experience: "12 years",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
        availability: ["Mon - Sat", "10:00 AM - 6:00 PM"]
      },
      {
        id: 3,
        name: "Dr. Emily Williams",
        specialization: "Pediatrician",
        education: "MD - Pediatrics, MBBS",
        experience: "10 years",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
        availability: ["Tue - Sat", "8:00 AM - 4:00 PM"]
      },
      {
        id: 4,
        name: "Dr. James Anderson",
        specialization: "Orthopedic Surgeon",
        education: "MD - Orthopedics, MBBS",
        experience: "18 years",
        image: "https://images.unsplash.com/photo-1637059824899-a441006a6875?auto=format&fit=crop&q=80&w=400",
        availability: ["Mon - Fri", "8:00 AM - 4:00 PM"]
      },
      {
        id: 5,
        name: "Dr. Maria Garcia",
        specialization: "Dermatologist",
        education: "MD - Dermatology, MBBS",
        experience: "14 years",
        image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400",
        availability: ["Mon - Sat", "9:00 AM - 5:00 PM"]
      },
      {
        id: 6,
        name: "Dr. David Kim",
        specialization: "Psychiatrist",
        education: "MD - Psychiatry, MBBS",
        experience: "16 years",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
        availability: ["Mon - Fri", "10:00 AM - 6:00 PM"]
      },
      {
        id: 7,
        name: "Dr. Lisa Thompson",
        specialization: "Gynecologist",
        education: "MD - Gynecology, MBBS",
        experience: "13 years",
        image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400",
        availability: ["Mon - Sat", "9:00 AM - 5:00 PM"]
      },
      {
        id: 8,
        name: "Dr. Robert Wilson",
        specialization: "ENT Specialist",
        education: "MD - Otolaryngology, MBBS",
        experience: "11 years",
        image: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400",
        availability: ["Tue - Sat", "8:00 AM - 4:00 PM"]
      },
      {
        id: 9,
        name: "Dr. Jennifer Lee",
        specialization: "Ophthalmologist",
        education: "MD - Ophthalmology, MBBS",
        experience: "15 years",
        image: "https://images.unsplash.com/photo-1642391326535-c1bb8e9f4c14?auto=format&fit=crop&q=80&w=400",
        availability: ["Mon - Fri", "9:00 AM - 5:00 PM"]
      },
      {
        id: 10,
        name: "Dr. Thomas Brown",
        specialization: "Dentist",
        education: "DDS, BDS",
        experience: "12 years",
        image: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&q=80&w=400",
        availability: ["Mon - Sat", "10:00 AM - 6:00 PM"]
      },
      {
        id: 11,
        name: "Dr. Patricia Martinez",
        specialization: "Endocrinologist",
        education: "MD - Endocrinology, MBBS",
        experience: "17 years",
        image: "https://images.unsplash.com/photo-1642391326583-5e4d57e6e8c5?auto=format&fit=crop&q=80&w=400",
        availability: ["Mon - Fri", "8:00 AM - 4:00 PM"]
      },
      {
        id: 12,
        name: "Dr. Kevin Taylor",
        specialization: "Pulmonologist",
        education: "MD - Pulmonology, MBBS",
        experience: "14 years",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
        availability: ["Mon - Sat", "9:00 AM - 5:00 PM"]
      },
      {
        id: 13,
        name: "Dr. Amanda White",
        specialization: "Rheumatologist",
        education: "MD - Rheumatology, MBBS",
        experience: "13 years",
        image: "https://images.unsplash.com/photo-1638202993928-7d113c25e3e1?auto=format&fit=crop&q=80&w=400",
        availability: ["Tue - Sat", "8:00 AM - 4:00 PM"]
      },
      {
        id: 14,
        name: "Dr. Christopher Davis",
        specialization: "Urologist",
        education: "MD - Urology, MBBS",
        experience: "16 years",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
        availability: ["Mon - Fri", "9:00 AM - 5:00 PM"]
      },
      {
        id: 15,
        name: "Dr. Michelle Rodriguez",
        specialization: "Nutritionist",
        education: "PhD - Nutrition Science",
        experience: "10 years",
        image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400",
        availability: ["Mon - Sat", "10:00 AM - 6:00 PM"]
      },
      {
        id: 16,
        name: "Dr. Steven Clark",
        specialization: "Oncologist",
        education: "MD - Oncology, MBBS",
        experience: "19 years",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
        availability: ["Mon - Fri", "8:00 AM - 4:00 PM"]
      },
      {
        id: 17,
        name: "Dr. Rachel Green",
        specialization: "Allergist",
        education: "MD - Allergy & Immunology, MBBS",
        experience: "12 years",
        image: "https://images.unsplash.com/photo-1642391326535-c1bb8e9f4c14?auto=format&fit=crop&q=80&w=400",
        availability: ["Mon - Sat", "9:00 AM - 5:00 PM"]
      },
      {
        id: 18,
        name: "Dr. Daniel Lewis",
        specialization: "Gastroenterologist",
        education: "MD - Gastroenterology, MBBS",
        experience: "15 years",
        image: "https://images.unsplash.com/photo-1637059824899-a441006a6875?auto=format&fit=crop&q=80&w=400",
        availability: ["Tue - Sat", "8:00 AM - 4:00 PM"]
      },
      {
        id: 19,
        name: "Dr. Jessica Turner",
        specialization: "Physical Therapist",
        education: "DPT, PT",
        experience: "11 years",
        image: "https://images.unsplash.com/photo-1638202993928-7d113c25e3e1?auto=format&fit=crop&q=80&w=400",
        availability: ["Mon - Fri", "9:00 AM - 5:00 PM"]
      },
      {
        id: 20,
        name: "Dr. Andrew Moore",
        specialization: "Nephrologist",
        education: "MD - Nephrology, MBBS",
        experience: "14 years",
        image: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&q=80&w=400",
        availability: ["Mon - Sat", "10:00 AM - 6:00 PM"]
      }
];

export interface BookingProps {
    onClose: () => void;
    analysisData: {
        summary: string;
        diagnosis: string;
        key_findings: string[];
        urgent_concerns: string;
    };
}

interface BookingDetails {
    doctorName: string;
    patientName: string;
    date: string;
    time: string;
    phone: string;
    email: string;
    reason: string;
}

interface BookingFormData {
    name: string;
    email: string;
    doctorEmail: string;
    phone: string;
    date: string;
    time: string;
    symptoms: string;
}

function Booking({ onClose, analysisData }: BookingProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [bookingStep, setBookingStep] = useState(0);
    const [bookings, setBookings] = useState<BookingDetails[]>([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [formData, setFormData] = useState<BookingFormData>({
        name: '',
        email: '',
        doctorEmail: 'broxedit362@gmail.com',
        phone: '',
        date: '',
        time: '',
        symptoms: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBooking = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setBookingStep(1);
        setShowConfirmation(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const sendConfirmationEmail = async () => {
        try {
            // Initialize EmailJS with your public key
            emailjs.init("M9COXdDHdLUneFwk1");

            const currentUser = auth.currentUser;
            if (!currentUser?.email) {
                throw new Error("No authenticated user found");
            }

            // Template parameters with patient details
            const templateParams = {
                to_email: 'broxedit362@gmail.com',
                to_name: formData.name,
                patient_email: formData.email,
                patient_phone: formData.phone,
                appointment_date: new Date(formData.date).toLocaleDateString(),
                appointment_time: formData.time,
                symptoms: formData.symptoms,
                diagnosis: analysisData.diagnosis || '',
                key_findings: analysisData.key_findings?.join(', ') || '',
                urgent_concerns: analysisData.urgent_concerns || '',
                summary: analysisData.summary || ''
            };

            // Send notification to doctor
            await emailjs.send(
                "service_dyk7geb",
                "template_pg3o014",
                templateParams
            );

            // Save booking to state for Excel export
            const newBooking: BookingDetails = {
                doctorName: selectedDoctor?.name || '',
                patientName: formData.name,
                date: formData.date,
                time: formData.time,
                phone: formData.phone,
                email: formData.email,
                reason: formData.symptoms
            };
            setBookings([...bookings, newBooking]);

        } catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Here you would typically save the booking to your backend/database
            // For now, we'll just simulate an API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Send confirmation emails
            await sendConfirmationEmail();

            setSuccess(true);
            setLoading(false);
        } catch (err: any) {
            setError(err.message || 'Failed to book appointment');
            setLoading(false);
        }
    };

    const resetForm = () => {
        setBookingStep(0);
        setSelectedDoctor(null);
        setShowConfirmation(false);
        setFormData({
            name: '',
            email: '',
            doctorEmail: 'broxedit362@gmail.com',
            phone: '',
            date: '',
            time: '',
            symptoms: ''
        });
    };

    const exportToExcel = () => {
        if (bookings.length === 0) {
            alert("No bookings to export");
            return;
        }
        const ws = XLSX.utils.json_to_sheet(bookings);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bookings");
        XLSX.writeFile(wb, "doctor-appointments.xlsx");
    };

    const suggestDoctor = () => {
        if (analysisData.diagnosis) {
            // Suggest based on diagnosis if available
            const suggestedSpecialization = analysisData.diagnosis.includes('cardiac') ? 'Cardiologist' :
                                          analysisData.diagnosis.includes('neuro') ? 'Neurologist' :
                                          'General Physician';
            
            const suggestedDoctors = doctors.filter(d => 
                d.specialization === suggestedSpecialization
            );
            
            if (suggestedDoctors.length > 0) {
                const doctor = suggestedDoctors[0];
                alert(`Based on your diagnosis, we recommend consulting ${doctor.name}, ${doctor.specialization}`);
                return;
            }
        }
        
        // Fallback to random suggestion
        const randomIndex = Math.floor(Math.random() * doctors.length);
        const suggestedDoctor = doctors[randomIndex];
        alert(`We suggest consulting ${suggestedDoctor.name}, ${suggestedDoctor.specialization}`);
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4">
                <div className="w-full max-w-6xl max-h-[90vh] bg-white rounded-xl overflow-hidden flex flex-col">
                    <div className="bg-white shadow-sm sticky top-0 z-10 p-4 flex justify-between items-center border-b">
                        <h1 className="text-2xl font-bold text-gray-900">Doctor Appointment Booking</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={suggestDoctor}
                                className="flex items-center px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                                title="Get doctor recommendation"
                            >
                                <Lightbulb size={16} className="mr-1" />
                                Suggest
                            </button>
                            <button
                                onClick={exportToExcel}
                                className="flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                title="Export bookings to Excel"
                            >
                                <Download size={16} className="mr-1" />
                                Export
                            </button>
                            <button
                                onClick={onClose}
                                className="flex items-center px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                title="Close booking"
                            >
                                <X size={16} className="mr-1" />
                                Close
                            </button>
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Booking Confirmation</h2>
                                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="text-center py-8">
                                <div className="mb-4 text-green-600">
                                    <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Appointment Booked Successfully!</h3>
                                <p className="text-gray-600 mb-4">
                                    A confirmation email has been sent to {formData.email}
                                </p>
                                <p className="text-gray-600">
                                    The doctor has been notified and will review your case.
                                </p>
                                <button
                                    onClick={resetForm}
                                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4">
            <div className="w-full max-w-6xl max-h-[90vh] bg-white rounded-xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-white shadow-sm sticky top-0 z-10 p-4 flex justify-between items-center border-b">
                    <h1 className="text-2xl font-bold text-gray-900">Doctor Appointment Booking</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={suggestDoctor}
                            className="flex items-center px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                            title="Get doctor recommendation"
                        >
                            <Lightbulb size={16} className="mr-1" />
                            Suggest
                        </button>
                        <button
                            onClick={exportToExcel}
                            className="flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                            title="Export bookings to Excel"
                        >
                            <Download size={16} className="mr-1" />
                            Export
                        </button>
                        <button
                            onClick={onClose}
                            className="flex items-center px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                            title="Close booking"
                        >
                            <X size={16} className="mr-1" />
                            Close
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="overflow-y-auto flex-1 p-4">
                    {/* Analysis Summary */}
                    {analysisData && (
                        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold mb-2 text-blue-800">Your Medical Summary</h2>
                            {analysisData.diagnosis && (
                                <p className="mb-2">
                                    <span className="font-medium">Diagnosis:</span> {analysisData.diagnosis}
                                </p>
                            )}
                            {analysisData.urgent_concerns && (
                                <p className="text-red-600 font-medium">
                                    <span className="font-bold">Urgent:</span> {analysisData.urgent_concerns}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search doctors by name or specialization..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {showConfirmation ? (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                            <div className="bg-white rounded-lg p-6 max-w-md text-center">
                                <CheckCircle className="text-green-500 w-12 h-12 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                                <p className="text-gray-600 mb-4">Your appointment has been scheduled successfully.</p>
                                <button
                                    onClick={resetForm}
                                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Book Another Appointment
                                </button>
                            </div>
                        </div>
                    ) : bookingStep === 0 ? (
                        /* Doctor Listing */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredDoctors.map(doctor => (
                                <div key={doctor.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <img 
                                        src={doctor.image} 
                                        alt={doctor.name} 
                                        className="w-full h-40 object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Doctor+Image';
                                        }}
                                    />
                                    <div className="p-4">
                                        <h2 className="text-lg font-semibold text-gray-900">{doctor.name}</h2>
                                        <div className="flex items-center mt-1 text-gray-600 text-sm">
                                            <Stethoscope size={14} className="mr-1.5" />
                                            <span>{doctor.specialization}</span>
                                        </div>
                                        <div className="flex items-center mt-1 text-gray-600 text-sm">
                                            <GraduationCap size={14} className="mr-1.5" />
                                            <span>{doctor.education}</span>
                                        </div>
                                        <div className="flex items-center mt-1 text-gray-600 text-sm">
                                            <Clock size={14} className="mr-1.5" />
                                            <span>{doctor.experience}</span>
                                        </div>
                                        <div className="mt-3">
                                            <button
                                                onClick={() => handleBooking(doctor)}
                                                className="w-full bg-blue-500 text-white py-1.5 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                            >
                                                Book Appointment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Booking Form */
                        <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 p-4">
                            <h2 className="text-xl font-semibold mb-4">
                                Book Appointment with <span className="text-blue-600">{selectedDoctor?.name}</span>
                            </h2>
                            <p className="text-gray-600 mb-4">{selectedDoctor?.specialization}</p>
                            
                            {error && (
                                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.date}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                        <input
                                            type="time"
                                            name="time"
                                            required
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.time}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor's Email</label>
                                    <input
                                        type="email"
                                        name="doctorEmail"
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={formData.doctorEmail}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Symptoms or Concerns</label>
                                    <textarea
                                        name="symptoms"
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        value={formData.symptoms}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setBookingStep(0)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                    >
                                        Back to Doctors
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors ${
                                            loading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {loading ? 'Booking...' : 'Book Appointment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Booking;
