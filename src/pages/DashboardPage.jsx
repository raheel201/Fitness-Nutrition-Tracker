import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { collection, query, where, orderBy, limit, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Calendar, Target, TrendingUp, Activity, Plus } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import Modal from '../components/Modal';
import NotificationBanner from '../components/NotificationBanner';

export default function DashboardPage() {
  const { currentUser, userProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    weeklyWorkouts: 0,
    todayCalories: 0,
    weeklyCalories: 0,
    currentStreak: 0
  });
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuickWorkout, setShowQuickWorkout] = useState(false);
  const [showQuickMeal, setShowQuickMeal] = useState(false);
  
  // Quick workout state
  const [quickWorkout, setQuickWorkout] = useState({
    name: '',
    duration: 30,
    exercises: []
  });
  
  // Quick meal state
  const [quickMeal, setQuickMeal] = useState({
    foodName: '',
    calories: 0,
    quantity: 1
  });

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);

      // Fetch all workouts for the user first
      const allWorkoutsQuery = query(
        collection(db, 'workouts'),
        where('userId', '==', currentUser.uid)
      );
      const allWorkoutsSnapshot = await getDocs(allWorkoutsQuery);
      
      // Filter completed workouts from this week
      const completedWorkouts = allWorkoutsSnapshot.docs.filter(doc => {
        const data = doc.data();
        if (!data.completed || !data.completedAt) return false;
        
        const completedDate = data.completedAt.toDate();
        return completedDate >= weekStart && completedDate <= weekEnd;
      });
      
      // Fetch today's nutrition
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const nutritionQuery = query(
        collection(db, 'nutrition'),
        where('userId', '==', currentUser.uid)
      );
      const nutritionSnapshot = await getDocs(nutritionQuery);
      
      // Filter today's nutrition
      const todayNutrition = nutritionSnapshot.docs.filter(doc => {
        const data = doc.data();
        if (!data.date || !data.date.toDate) return false;
        
        const nutritionDate = data.date.toDate();
        return nutritionDate >= todayStart && nutritionDate < todayEnd;
      });
      
      // Get recent completed workouts
      const recentWorkouts = allWorkoutsSnapshot.docs
        .filter(doc => doc.data().completed)
        .sort((a, b) => {
          const aDate = a.data().completedAt?.toDate() || new Date(0);
          const bDate = b.data().completedAt?.toDate() || new Date(0);
          return bDate - aDate;
        })
        .slice(0, 5);

      // Calculate stats
      const weeklyWorkouts = completedWorkouts.length;
      const todayCalories = todayNutrition.reduce((total, doc) => {
        return total + (doc.data().calories || 0);
      }, 0);

      // Calculate weekly average calories
      const weeklyNutrition = nutritionSnapshot.docs.filter(doc => {
        const data = doc.data();
        if (!data.date || !data.date.toDate) return false;
        const nutritionDate = data.date.toDate();
        return nutritionDate >= weekStart && nutritionDate <= weekEnd;
      });
      
      const weeklyCalories = weeklyNutrition.reduce((total, doc) => {
        return total + (doc.data().calories || 0);
      }, 0);

      setStats({
        weeklyWorkouts,
        todayCalories,
        weeklyCalories: Math.round(weeklyCalories / 7),
        currentStreak: weeklyWorkouts // Simplified streak calculation
      });

      setRecentWorkouts(recentWorkouts.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickWorkout = async () => {
    if (!quickWorkout.name) return;
    
    try {
      await addDoc(collection(db, 'workouts'), {
        name: quickWorkout.name,
        duration: quickWorkout.duration,
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 12 },
          { name: 'Squats', sets: 3, reps: 15 },
          { name: 'Plank', sets: 3, reps: '30s' }
        ],
        userId: currentUser.uid,
        createdAt: new Date(),
        completedAt: new Date(),
        completed: true
      });
      
      setShowQuickWorkout(false);
      setQuickWorkout({ name: '', duration: 30, exercises: [] });
      showSuccess('Workout logged successfully!');
      fetchDashboardData(); // Refresh stats
    } catch (error) {
      console.error('Error logging quick workout:', error);
      showError('Failed to log workout. Please try again.');
    }
  };

  const handleQuickMeal = async () => {
    if (!quickMeal.foodName || !quickMeal.calories) return;
    
    try {
      const now = new Date();
      // Use today's date at midnight for consistency
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const mealData = {
        userId: currentUser.uid,
        date: today,
        foodName: quickMeal.foodName,
        serving: '1 serving',
        quantity: quickMeal.quantity,
        calories: quickMeal.calories * quickMeal.quantity,
        protein: Math.round(quickMeal.calories * quickMeal.quantity * 0.15 / 4), // Rough estimate
        carbs: Math.round(quickMeal.calories * quickMeal.quantity * 0.5 / 4),
        fat: Math.round(quickMeal.calories * quickMeal.quantity * 0.35 / 9),
        createdAt: now
      };
      
      console.log('Adding quick meal:', mealData);
      await addDoc(collection(db, 'nutrition'), mealData);
      
      setShowQuickMeal(false);
      setQuickMeal({ foodName: '', calories: 0, quantity: 1 });
      showSuccess('Meal logged successfully!');
      fetchDashboardData(); // Refresh stats
    } catch (error) {
      console.error('Error logging quick meal:', error);
      showError('Failed to log meal. Please try again.');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color === 'blue' ? 'bg-blue-500 bg-opacity-20' : 
                                                    color === 'green' ? 'bg-lime-500 bg-opacity-20' : 
                                                    color === 'purple' ? 'bg-purple-500 bg-opacity-20' : 
                                                    'bg-orange-500 bg-opacity-20'}`}>
          <Icon className={`h-6 w-6 ${color === 'blue' ? 'text-blue-400' : 
                                      color === 'green' ? 'text-lime-400' : 
                                      color === 'purple' ? 'text-purple-400' : 
                                      'text-orange-400'}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">
          Welcome back, {userProfile?.displayName || 'User'}!
        </h1>
        <p className="text-gray-400">Here's your fitness overview for today</p>
      </div>

      {/* Notification Banner */}
      <NotificationBanner />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="This Week's Workouts"
          value={stats.weeklyWorkouts}
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Today's Calories"
          value={`${stats.todayCalories} kcal`}
          icon={Target}
          color="green"
        />
        <StatCard
          title="Weekly Average"
          value={`${Math.round(stats.weeklyCalories / 7)} kcal`}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          icon={Calendar}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <button 
            onClick={() => setShowQuickWorkout(true)}
            className="p-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-teal-500 hover:bg-teal-500 hover:bg-opacity-10 transition-colors group"
          >
            <Activity className="h-8 w-8 text-gray-400 group-hover:text-teal-400 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-medium text-gray-300 group-hover:text-teal-300">Quick Workout</p>
          </button>
          <button 
            onClick={() => setShowQuickMeal(true)}
            className="p-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-orange-500 hover:bg-orange-500 hover:bg-opacity-10 transition-colors group"
          >
            <Target className="h-8 w-8 text-gray-400 group-hover:text-orange-400 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-medium text-gray-300 group-hover:text-orange-300">Quick Meal</p>
          </button>
          <button 
            onClick={() => navigate('/analytics')}
            className="p-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-purple-500 hover:bg-purple-500 hover:bg-opacity-10 transition-colors group"
          >
            <TrendingUp className="h-8 w-8 text-gray-400 group-hover:text-purple-400 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-medium text-gray-300 group-hover:text-purple-300">View Analytics</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Recent Workouts</h2>
        {recentWorkouts.length > 0 ? (
          <div className="space-y-3">
            {recentWorkouts.map((workout) => (
              <div key={workout.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-slate-600">
                <div>
                  <p className="font-medium text-gray-100">{workout.name}</p>
                  <p className="text-sm text-gray-400">
                    {workout.completedAt && format(workout.completedAt.toDate(), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-100">
                    {workout.duration || 0} min
                  </p>
                  <p className="text-sm text-gray-400">
                    {workout.exercises?.length || 0} exercises
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No workouts yet. Start your fitness journey!</p>
          </div>
        )}
      </div>

      {/* Quick Workout Modal */}
      <Modal
        isOpen={showQuickWorkout}
        onClose={() => setShowQuickWorkout(false)}
        title="Quick Workout Log"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Workout Name
            </label>
            <input
              type="text"
              value={quickWorkout.name}
              onChange={(e) => setQuickWorkout(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., Morning Cardio, Quick Strength"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={quickWorkout.duration}
              onChange={(e) => setQuickWorkout(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              min="1"
            />
          </div>
          
          <div className="bg-slate-700 border border-slate-600 p-3 rounded-lg">
            <p className="text-sm text-gray-300 mb-2">This will log a basic workout with:</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Push-ups (3 sets × 12 reps)</li>
              <li>• Squats (3 sets × 15 reps)</li>
              <li>• Plank (3 sets × 30s)</li>
            </ul>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowQuickWorkout(false)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleQuickWorkout}
              disabled={!quickWorkout.name}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              Log Workout
            </button>
          </div>
        </div>
      </Modal>

      {/* Quick Meal Modal */}
      <Modal
        isOpen={showQuickMeal}
        onClose={() => setShowQuickMeal(false)}
        title="Quick Meal Log"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Food Name
            </label>
            <input
              type="text"
              value={quickMeal.foodName}
              onChange={(e) => setQuickMeal(prev => ({ ...prev, foodName: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., Chicken Salad, Protein Shake"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Calories per serving
            </label>
            <input
              type="number"
              value={quickMeal.calories}
              onChange={(e) => setQuickMeal(prev => ({ ...prev, calories: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              min="1"
              placeholder="300"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Quantity
            </label>
            <input
              type="number"
              step="0.5"
              value={quickMeal.quantity}
              onChange={(e) => setQuickMeal(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              min="0.1"
            />
          </div>
          
          {quickMeal.calories > 0 && (
            <div className="bg-slate-700 border border-slate-600 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-100">
                Total: {quickMeal.calories * quickMeal.quantity} calories
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Macros will be estimated based on typical food composition
              </p>
            </div>
          )}
          
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowQuickMeal(false)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleQuickMeal}
              disabled={!quickMeal.foodName || !quickMeal.calories}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              Log Meal
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}