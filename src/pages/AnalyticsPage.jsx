import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { format, subDays, startOfDay } from 'date-fns';
import { TrendingUp, Activity, Target } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsPage() {
  const { currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState('7'); // 7, 30, 90 days
  const [calorieData, setCalorieData] = useState([]);
  const [workoutData, setWorkoutData] = useState([]);
  const [macroData, setMacroData] = useState({ protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchAnalyticsData();
    }
  }, [currentUser, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const days = parseInt(timeRange);
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      // Fetch nutrition data
      const nutritionQuery = query(
        collection(db, 'nutrition'),
        where('userId', '==', currentUser.uid)
      );
      const nutritionSnapshot = await getDocs(nutritionQuery);

      // Fetch workout data
      const workoutQuery = query(
        collection(db, 'workouts'),
        where('userId', '==', currentUser.uid)
      );
      const workoutSnapshot = await getDocs(workoutQuery);

      // Process nutrition data
      const dailyCalories = {};
      let totalMacros = { protein: 0, carbs: 0, fat: 0, count: 0 };

      nutritionSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.date && data.date.toDate) {
          const nutritionDate = data.date.toDate();
          if (nutritionDate >= startDate && nutritionDate <= endDate) {
            const dateKey = format(nutritionDate, 'yyyy-MM-dd');
            
            if (!dailyCalories[dateKey]) {
              dailyCalories[dateKey] = 0;
            }
            dailyCalories[dateKey] += data.calories || 0;

            totalMacros.protein += data.protein || 0;
            totalMacros.carbs += data.carbs || 0;
            totalMacros.fat += data.fat || 0;
            totalMacros.count++;
          }
        }
      });

      // Process workout data
      const dailyWorkouts = {};
      workoutSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.completed && data.completedAt && data.completedAt.toDate) {
          const workoutDate = data.completedAt.toDate();
          if (workoutDate >= startDate && workoutDate <= endDate) {
            const dateKey = format(workoutDate, 'yyyy-MM-dd');
            
            if (!dailyWorkouts[dateKey]) {
              dailyWorkouts[dateKey] = 0;
            }
            dailyWorkouts[dateKey]++;
          }
        }
      });

      // Create arrays for charts
      const labels = [];
      const calories = [];
      const workouts = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(endDate, i);
        const dateKey = format(date, 'yyyy-MM-dd');
        const label = format(date, 'MMM d');
        
        labels.push(label);
        calories.push(dailyCalories[dateKey] || 0);
        workouts.push(dailyWorkouts[dateKey] || 0);
      }

      setCalorieData({ labels, data: calories });
      setWorkoutData({ labels, data: workouts });
      
      // Average macros
      if (totalMacros.count > 0) {
        setMacroData({
          protein: Math.round(totalMacros.protein / totalMacros.count),
          carbs: Math.round(totalMacros.carbs / totalMacros.count),
          fat: Math.round(totalMacros.fat / totalMacros.count)
        });
      }

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calorieChartData = {
    labels: calorieData.labels || [],
    datasets: [
      {
        label: 'Daily Calories',
        data: calorieData.data || [],
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const workoutChartData = {
    labels: workoutData.labels || [],
    datasets: [
      {
        label: 'Workouts Completed',
        data: workoutData.data || [],
        backgroundColor: 'rgba(132, 204, 22, 0.8)',
        borderColor: 'rgb(132, 204, 22)',
        borderWidth: 1,
      },
    ],
  };

  const macroChartData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [macroData.protein, macroData.carbs, macroData.fat],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
          'rgb(249, 115, 22)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#f1f5f9',
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#475569',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#475569',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Analytics</h1>
          <p className="text-gray-400">Track your progress and trends</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-500 bg-opacity-20">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Avg Daily Calories</p>
              <p className="text-2xl font-bold text-gray-100">
                {Math.round((calorieData.data || []).reduce((a, b) => a + b, 0) / (calorieData.data?.length || 1))}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-lime-500 bg-opacity-20">
              <Activity className="h-6 w-6 text-lime-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Workouts</p>
              <p className="text-2xl font-bold text-gray-100">
                {(workoutData.data || []).reduce((a, b) => a + b, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-500 bg-opacity-20">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Workout Frequency</p>
              <p className="text-2xl font-bold text-gray-100">
                {Math.round(((workoutData.data || []).reduce((a, b) => a + b, 0) / parseInt(timeRange)) * 7)} /week
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Calorie Intake Trend</h2>
          <Line data={calorieChartData} options={chartOptions} />
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Workout Frequency</h2>
          <Bar data={workoutChartData} options={chartOptions} />
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Average Macro Distribution</h2>
        <div className="max-w-md mx-auto">
          <Doughnut 
            data={macroChartData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: '#f1f5f9',
                  },
                },
              },
            }} 
          />
        </div>
      </div>
    </div>
  );
}