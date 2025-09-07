import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Plus, Target, Apple, TrendingUp, Trash2, Search, RefreshCw } from 'lucide-react';
import Modal from '../components/Modal';
import { format } from 'date-fns';

const FOOD_DATABASE = [
  { id: 1, name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, serving: '1 medium' },
  { id: 2, name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100g' },
  { id: 3, name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8, serving: '1 cup cooked' },
  { id: 4, name: 'Broccoli', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, serving: '1 cup' },
  { id: 5, name: 'Salmon', calories: 208, protein: 22, carbs: 0, fat: 12, serving: '100g' },
  { id: 6, name: 'Oatmeal', calories: 147, protein: 5.4, carbs: 25, fat: 2.8, serving: '1 cup cooked' },
  { id: 7, name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0.7, serving: '170g' },
  { id: 8, name: 'Almonds', calories: 164, protein: 6, carbs: 6, fat: 14, serving: '28g (24 nuts)' },
  { id: 9, name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11, serving: '2 large' },
  { id: 10, name: 'Avocado', calories: 234, protein: 2.9, carbs: 12, fat: 21, serving: '1 medium' },
  { id: 11, name: 'Sweet Potato', calories: 112, protein: 2, carbs: 26, fat: 0.1, serving: '1 medium' },
  { id: 12, name: 'Quinoa', calories: 222, protein: 8, carbs: 39, fat: 3.6, serving: '1 cup cooked' },
  { id: 13, name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, serving: '100g' },
  { id: 14, name: 'Tuna', calories: 144, protein: 30, carbs: 0, fat: 1, serving: '100g' },
  { id: 15, name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, serving: '1 medium' },
  { id: 16, name: 'Protein Shake', calories: 120, protein: 25, carbs: 3, fat: 1, serving: '1 scoop' },
  { id: 17, name: 'Whole Wheat Bread', calories: 81, protein: 4, carbs: 14, fat: 1.1, serving: '1 slice' },
  { id: 18, name: 'Peanut Butter', calories: 188, protein: 8, carbs: 8, fat: 16, serving: '2 tbsp' }
];

export default function NutritionPage() {
  const { currentUser, userProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [meals, setMeals] = useState([]);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Calculate daily goals based on user profile
  const dailyGoals = {
    calories: userProfile?.fitnessGoal === 'weight_loss' ? 1800 : 
              userProfile?.fitnessGoal === 'muscle_gain' ? 2500 : 2200,
    protein: Math.round((userProfile?.weight || 70) * 1.6), // 1.6g per kg
    carbs: 250,
    fat: 70
  };

  useEffect(() => {
    if (currentUser) {
      fetchMeals();
    }
  }, [currentUser, selectedDate]);

  const fetchMeals = async () => {
    try {
      // Get all nutrition data for the user first, then filter by date
      const mealsQuery = query(
        collection(db, 'nutrition'),
        where('userId', '==', currentUser.uid)
      );
      
      const snapshot = await getDocs(mealsQuery);
      
      // Filter meals for the selected date
      const selectedDateObj = new Date(selectedDate);
      const dateStart = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate());
      const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);
      
      const mealsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(meal => {
          if (!meal.date || !meal.date.toDate) return false;
          const mealDate = meal.date.toDate();
          return mealDate >= dateStart && mealDate < dateEnd;
        })
        .sort((a, b) => {
          const aDate = a.date?.toDate() || new Date(0);
          const bDate = b.date?.toDate() || new Date(0);
          return bDate - aDate;
        });
      
      console.log('Fetched meals for date:', selectedDate, mealsData);
      setMeals(mealsData);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMeal = async () => {
    if (!selectedFood) return;

    // Create a proper date object for the selected date
    const selectedDateObj = new Date(selectedDate);
    const mealDate = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate());

    const mealData = {
      userId: currentUser.uid,
      date: mealDate,
      foodName: selectedFood.name,
      serving: selectedFood.serving,
      quantity: quantity,
      calories: Math.round(selectedFood.calories * quantity),
      protein: Math.round(selectedFood.protein * quantity * 10) / 10,
      carbs: Math.round(selectedFood.carbs * quantity * 10) / 10,
      fat: Math.round(selectedFood.fat * quantity * 10) / 10,
      createdAt: new Date()
    };

    try {
      console.log('Adding meal:', mealData);
      await addDoc(collection(db, 'nutrition'), mealData);
      setShowAddMealModal(false);
      setSelectedFood(null);
      setQuantity(1);
      setSearchTerm('');
      showSuccess('Food added successfully!');
      fetchMeals();
    } catch (error) {
      console.error('Error adding meal:', error);
      showError('Failed to add food. Please try again.');
    }
  };

  const deleteMeal = async (mealId) => {
    if (!window.confirm('Are you sure you want to delete this meal?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'nutrition', mealId));
      showSuccess('Meal deleted successfully!');
      fetchMeals();
    } catch (error) {
      console.error('Error deleting meal:', error);
      showError('Failed to delete meal. Please try again.');
    }
  };

  // Calculate daily totals
  const dailyTotals = meals.reduce((totals, meal) => ({
    calories: totals.calories + (meal.calories || 0),
    protein: totals.protein + (meal.protein || 0),
    carbs: totals.carbs + (meal.carbs || 0),
    fat: totals.fat + (meal.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const filteredFoods = FOOD_DATABASE.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const MacroCard = ({ title, current, goal, color }) => {
    const percentage = Math.min((current / goal) * 100, 100);
    
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-300">{title}</h3>
          <span className="text-sm text-gray-400">{Math.round(current)}/{goal}g</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${color === 'red' ? 'bg-red-500' : 
                                          color === 'blue' ? 'bg-blue-500' : 
                                          'bg-yellow-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{Math.round(percentage)}% of goal</p>
      </div>
    );
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
          <h1 className="text-2xl font-bold text-gray-100">Nutrition Tracker</h1>
          <p className="text-gray-400">Track your daily nutrition and reach your goals</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <button
            onClick={fetchMeals}
            className="p-2 bg-slate-700 border border-slate-600 rounded-md text-gray-400 hover:text-gray-200 hover:bg-slate-600 transition-colors"
            title="Refresh meals"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddMealModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Food
          </button>
        </div>
      </div>

      {/* Daily Overview */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">
          Daily Overview - {format(new Date(selectedDate), 'MMMM d, yyyy')}
        </h2>
        
        {/* Calories Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-100">Calories</h3>
            <span className="text-lg font-bold text-gray-100">
              {Math.round(dailyTotals.calories)} / {dailyGoals.calories}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-teal-500 to-orange-500"
              style={{ width: `${Math.min((dailyTotals.calories / dailyGoals.calories) * 100, 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {Math.round((dailyTotals.calories / dailyGoals.calories) * 100)}% of daily goal
          </p>
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <MacroCard
            title="Protein"
            current={dailyTotals.protein}
            goal={dailyGoals.protein}
            color="red"
          />
          <MacroCard
            title="Carbs"
            current={dailyTotals.carbs}
            goal={dailyGoals.carbs}
            color="blue"
          />
          <MacroCard
            title="Fat"
            current={dailyTotals.fat}
            goal={dailyGoals.fat}
            color="yellow"
          />
        </div>
      </div>

      {/* Meals List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Today's Meals</h2>
          <span className="text-sm text-gray-400">
            {meals.length} meal{meals.length !== 1 ? 's' : ''} found
          </span>
        </div>
        {meals.length > 0 ? (
          <div className="space-y-3">
            {meals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-slate-600">
                <div>
                  <p className="font-medium text-gray-100">
                    {meal.foodName} {meal.quantity > 1 && `(${meal.quantity}x)`}
                  </p>
                  <p className="text-sm text-gray-400">{meal.serving}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium text-gray-100">{meal.calories} kcal</p>
                    <p className="text-sm text-gray-400">
                      P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMeal(meal.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-10 rounded-md transition-colors"
                    title="Delete meal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Apple className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No meals logged for this date</p>
          </div>
        )}
      </div>

      {/* Add Meal Modal */}
      <Modal
        isOpen={showAddMealModal}
        onClose={() => setShowAddMealModal(false)}
        title="Add Food"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Search Food
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Search for food..."
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto border border-slate-600 rounded-md bg-slate-700">
            {filteredFoods.map(food => (
              <div
                key={food.id}
                className={`p-3 hover:bg-slate-600 cursor-pointer border-b border-slate-600 transition-colors ${
                  selectedFood?.id === food.id ? 'bg-teal-500 bg-opacity-20 border-teal-500' : ''
                }`}
                onClick={() => setSelectedFood(food)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-100">{food.name}</p>
                    <p className="text-sm text-gray-400">{food.serving}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-100">{food.calories} kcal</p>
                    <p className="text-xs text-gray-400">
                      P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedFood && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <div className="mt-2 p-2 bg-slate-700 border border-slate-600 rounded">
                <p className="text-sm font-medium text-gray-100">
                  Total: {Math.round(selectedFood.calories * quantity)} kcal
                </p>
                <p className="text-xs text-gray-400">
                  P: {Math.round(selectedFood.protein * quantity * 10) / 10}g | 
                  C: {Math.round(selectedFood.carbs * quantity * 10) / 10}g | 
                  F: {Math.round(selectedFood.fat * quantity * 10) / 10}g
                </p>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowAddMealModal(false)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={addMeal}
              disabled={!selectedFood}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              Add Food
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}