import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { User, Save, Target, Activity } from 'lucide-react';

export default function ProfilePage() {
  const { userProfile, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    age: userProfile?.age || '',
    weight: userProfile?.weight || '',
    height: userProfile?.height || '',
    fitnessGoal: userProfile?.fitnessGoal || 'maintenance'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateProfile({
        ...formData,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height)
      });
      setEditing(false);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Calculate BMI
  const bmi = userProfile?.weight && userProfile?.height 
    ? (userProfile.weight / Math.pow(userProfile.height / 100, 2)).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Profile</h1>
        <p className="text-gray-400">Manage your personal information and fitness goals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-100">Personal Information</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-primary"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Fitness Goal
                  </label>
                  <select
                    name="fitnessGoal"
                    value={formData.fitnessGoal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="endurance">Endurance</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Display Name</label>
                    <p className="text-gray-100">{userProfile?.displayName || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Email</label>
                    <p className="text-gray-100">{userProfile?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Age</label>
                    <p className="text-gray-100">{userProfile?.age || 'Not set'} years</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Weight</label>
                    <p className="text-gray-100">{userProfile?.weight || 'Not set'} kg</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Height</label>
                    <p className="text-gray-100">{userProfile?.height || 'Not set'} cm</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Fitness Goal</label>
                    <p className="text-gray-100 capitalize">
                      {userProfile?.fitnessGoal?.replace('_', ' ') || 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* BMI Card */}
          {bmi && (
            <div className="card">
              <div className="flex items-center mb-4">
                <Activity className="h-5 w-5 text-teal-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-100">BMI</h3>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-teal-400">{bmi}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {bmi < 18.5 ? 'Underweight' :
                   bmi < 25 ? 'Normal' :
                   bmi < 30 ? 'Overweight' : 'Obese'}
                </p>
              </div>
            </div>
          )}

          {/* Goals Card */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Target className="h-5 w-5 text-orange-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-100">Daily Goals</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Calories</span>
                <span className="text-sm font-medium text-gray-100">
                  {userProfile?.fitnessGoal === 'weight_loss' ? '1800' :
                   userProfile?.fitnessGoal === 'muscle_gain' ? '2500' : '2200'} kcal
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Protein</span>
                <span className="text-sm font-medium text-gray-100">
                  {Math.round((userProfile?.weight || 70) * 1.6)}g
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Workouts/week</span>
                <span className="text-sm font-medium text-gray-100">4-5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}