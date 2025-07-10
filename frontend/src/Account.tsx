import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, User } from 'lucide-react';
import { auth, saveUserProfile, getUserProfile } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';

interface AccountProps {
  onClose: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  profilePic: string;
  dateOfBirth: string;
  age: number;
  bloodGroup: string;
  weight: number;
  gender: string;
  phoneNumber: string;
  emergencyContact: string;
  updatedAt?: string;
}

const defaultProfile: UserProfile = {
  name: '',
  email: '',
  profilePic: 'https://ui-avatars.com/api/?name=User&background=random&size=200',
  dateOfBirth: '',
  age: 0,
  bloodGroup: '',
  weight: 0,
  gender: '',
  phoneNumber: '',
  emergencyContact: ''
};

const Account: React.FC<AccountProps> = ({ onClose }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        setIsSignedIn(true);
        // Fetch user profile data from Firestore
        const userData = await getUserProfile(user.uid);
        if (userData) {
          setProfile(prev => ({
            ...prev,
            email: user.email || '',
            profilePic: user.photoURL || prev.profilePic,
            dateOfBirth: userData.dateOfBirth || '',
            age: userData.age || 0,
            bloodGroup: userData.bloodGroup || '',
            weight: userData.weight || 0,
            gender: userData.gender || '',
            phoneNumber: userData.phoneNumber || '',
            emergencyContact: userData.emergencyContact || '',
            name: userData.name || ''
          }));
        } else {
          setProfile(prev => ({
            ...prev,
            email: user.email || '',
            profilePic: user.photoURL || prev.profilePic,
            name: user.displayName || ''
          }));
        }
      } else {
        setIsSignedIn(false);
        setProfile(defaultProfile);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (name: string) => {
    // Generate a deterministic avatar URL based on name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const defaultName = email.split('@')[0];
      const avatarUrl = getAvatarUrl(defaultName);
      
      // Initialize user profile in Firebase
      await updateProfile(user, {
        displayName: defaultName,
        photoURL: avatarUrl
      });

      // Save initial profile data to Firestore
      await saveUserProfile(user.uid, {
        email: user.email,
        profilePic: avatarUrl,
        dateOfBirth: '',
        age: 0,
        bloodGroup: '',
        weight: 0,
        gender: '',
        phoneNumber: '',
        emergencyContact: '',
        name: defaultName
      });

      setEmail('');
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create account. The email might be already in use.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsSignedIn(false);
      setEmail('');
      setPassword('');
      onClose();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      setError('You must be logged in to save changes');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Update avatar URL based on name
      const avatarUrl = getAvatarUrl(profile.name || profile.email.split('@')[0]);
      
      // Create a clean profile object for saving
      const profileToSave = {
        name: profile.name || '',
        email: profile.email,
        profilePic: avatarUrl,
        dateOfBirth: profile.dateOfBirth || '',
        age: profile.age || 0,
        bloodGroup: profile.bloodGroup || '',
        weight: profile.weight || 0,
        gender: profile.gender || '',
        phoneNumber: profile.phoneNumber || '',
        emergencyContact: profile.emergencyContact || ''
      };

      console.log('Profile data to save:', profileToSave);
      
      // Update profile in Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: profileToSave.name,
        photoURL: avatarUrl
      });
      
      console.log('Auth profile updated, saving to Firestore...');
      
      // Save profile data to Firestore
      await saveUserProfile(auth.currentUser.uid, profileToSave);
      
      console.log('Profile saved successfully');
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error in handleSave:', err);
      setError(err.message || 'Failed to save profile changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleDateChange = (date: string) => {
    setProfile(prev => ({
      ...prev,
      dateOfBirth: date,
      age: calculateAge(date)
    }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Instead of storing the image, generate an avatar URL based on name
      const avatarUrl = getAvatarUrl(profile.name || profile.email.split('@')[0]);
      
      // Update profile with the avatar URL
      setProfile(prev => ({
        ...prev,
        profilePic: avatarUrl
      }));
      setSuccessMessage('Profile picture updated successfully!');
      
      // If we're not in edit mode, save the changes immediately
      if (!isEditing) {
        await handleSave();
      }
    } catch (err) {
      console.error('Error updating profile picture:', err);
      setError('Failed to update profile picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <div className="bg-blue-100 p-4 rounded-full">
                <LogIn className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 ml-4">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-800"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-blue-50 to-white overflow-hidden">
      <div className="sticky top-0 bg-white z-20 px-6 py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
          <div className="flex gap-4">
            {isEditing ? (
              <button
                onClick={handleSave}
                disabled={loading}
                className={`flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200 ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                }`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Edit Profile
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-6">
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
          
          <div className="flex flex-col items-center mb-12">
            <div className="relative mb-6">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="profile-image-input"
              />
              <label
                htmlFor="profile-image-input"
                className="cursor-pointer block"
              >
                <img
                  src={profile.profilePic}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover ring-4 ring-blue-100 shadow-xl hover:opacity-80 transition-opacity"
                />
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm">Change Photo</span>
                  </div>
                )}
              </label>
              <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mt-4">{profile.name || profile.email}</h2>
            {isEditing && (
              <p className="text-sm text-gray-500 mt-2">
                Click on the profile picture to change it (max 2MB)
              </p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Name</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-800">{profile.name || 'Not set'}</p>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Date of Birth</h3>
              {isEditing ? (
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-800">{profile.dateOfBirth}</p>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Age</h3>
              {isEditing ? (
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-800">{profile.age} years</p>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Gender</h3>
              {isEditing ? (
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : (
                <p className="text-lg font-semibold text-gray-800">{profile.gender}</p>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Blood Group</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.bloodGroup}
                  onChange={(e) => setProfile(prev => ({ ...prev, bloodGroup: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-800">{profile.bloodGroup}</p>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Weight (kg)</h3>
              {isEditing ? (
                <input
                  type="number"
                  value={profile.weight}
                  onChange={(e) => setProfile(prev => ({ ...prev, weight: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-800">{profile.weight} kg</p>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Phone Number</h3>
              {isEditing ? (
                <input
                  type="tel"
                  pattern="[0-9]{10}"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10 digit number"
                  maxLength={10}
                />
              ) : (
                <p className="text-lg font-semibold text-gray-800">{profile.phoneNumber}</p>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Emergency Contact</h3>
              {isEditing ? (
                <input
                  type="tel"
                  pattern="[0-9]{10}"
                  value={profile.emergencyContact}
                  onChange={(e) => setProfile(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10 digit number"
                  maxLength={10}
                />
              ) : (
                <p className="text-lg font-semibold text-gray-800">{profile.emergencyContact}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;