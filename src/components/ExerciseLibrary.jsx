import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';

const EXERCISE_DATABASE = [
  // Chest
  { id: 1, name: 'Push-ups', category: 'Chest', difficulty: 'Beginner', equipment: 'Bodyweight', sets: 3, reps: 12 },
  { id: 2, name: 'Bench Press', category: 'Chest', difficulty: 'Intermediate', equipment: 'Barbell', sets: 3, reps: 10 },
  { id: 3, name: 'Incline Dumbbell Press', category: 'Chest', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: 3, reps: 10 },
  { id: 4, name: 'Chest Dips', category: 'Chest', difficulty: 'Intermediate', equipment: 'Dip Bars', sets: 3, reps: 8 },
  
  // Back
  { id: 5, name: 'Pull-ups', category: 'Back', difficulty: 'Intermediate', equipment: 'Pull-up Bar', sets: 3, reps: 8 },
  { id: 6, name: 'Deadlifts', category: 'Back', difficulty: 'Advanced', equipment: 'Barbell', sets: 3, reps: 8 },
  { id: 7, name: 'Bent-over Rows', category: 'Back', difficulty: 'Intermediate', equipment: 'Barbell', sets: 3, reps: 10 },
  { id: 8, name: 'Lat Pulldowns', category: 'Back', difficulty: 'Beginner', equipment: 'Cable Machine', sets: 3, reps: 12 },
  
  // Legs
  { id: 9, name: 'Squats', category: 'Legs', difficulty: 'Beginner', equipment: 'Bodyweight', sets: 3, reps: 15 },
  { id: 10, name: 'Lunges', category: 'Legs', difficulty: 'Beginner', equipment: 'Bodyweight', sets: 3, reps: 12 },
  { id: 11, name: 'Bulgarian Split Squats', category: 'Legs', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: 3, reps: 10 },
  { id: 12, name: 'Leg Press', category: 'Legs', difficulty: 'Beginner', equipment: 'Machine', sets: 3, reps: 15 },
  
  // Shoulders
  { id: 13, name: 'Shoulder Press', category: 'Shoulders', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: 3, reps: 10 },
  { id: 14, name: 'Lateral Raises', category: 'Shoulders', difficulty: 'Beginner', equipment: 'Dumbbells', sets: 3, reps: 12 },
  { id: 15, name: 'Pike Push-ups', category: 'Shoulders', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: 3, reps: 8 },
  
  // Arms
  { id: 16, name: 'Bicep Curls', category: 'Arms', difficulty: 'Beginner', equipment: 'Dumbbells', sets: 3, reps: 12 },
  { id: 17, name: 'Tricep Dips', category: 'Arms', difficulty: 'Beginner', equipment: 'Bodyweight', sets: 3, reps: 10 },
  { id: 18, name: 'Hammer Curls', category: 'Arms', difficulty: 'Beginner', equipment: 'Dumbbells', sets: 3, reps: 12 },
  
  // Core
  { id: 19, name: 'Plank', category: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', sets: 3, reps: '30s' },
  { id: 20, name: 'Russian Twists', category: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', sets: 3, reps: 20 },
  { id: 21, name: 'Mountain Climbers', category: 'Core', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: 3, reps: 20 },
  
  // Cardio
  { id: 22, name: 'Burpees', category: 'Cardio', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: 3, reps: 10 },
  { id: 23, name: 'Jumping Jacks', category: 'Cardio', difficulty: 'Beginner', equipment: 'Bodyweight', sets: 3, reps: 30 },
  { id: 24, name: 'High Knees', category: 'Cardio', difficulty: 'Beginner', equipment: 'Bodyweight', sets: 3, reps: '30s' },
];

export default function ExerciseLibrary({ onAddExercise, selectedExercises = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const categories = ['All', ...new Set(EXERCISE_DATABASE.map(ex => ex.category))];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredExercises = EXERCISE_DATABASE.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || exercise.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-lime-400 bg-lime-500 bg-opacity-20';
      case 'Intermediate': return 'text-orange-400 bg-orange-500 bg-opacity-20';
      case 'Advanced': return 'text-red-400 bg-red-500 bg-opacity-20';
      default: return 'text-gray-400 bg-gray-500 bg-opacity-20';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Chest': 'text-blue-400',
      'Back': 'text-green-400',
      'Legs': 'text-purple-400',
      'Shoulders': 'text-yellow-400',
      'Arms': 'text-pink-400',
      'Core': 'text-teal-400',
      'Cardio': 'text-red-400'
    };
    return colors[category] || 'text-gray-400';
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          {difficulties.map(difficulty => (
            <option key={difficulty} value={difficulty}>{difficulty}</option>
          ))}
        </select>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {filteredExercises.map(exercise => {
          const isSelected = selectedExercises.some(ex => ex.id === exercise.id);
          
          return (
            <div
              key={exercise.id}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                isSelected 
                  ? 'border-teal-500 bg-teal-500 bg-opacity-10' 
                  : 'border-slate-600 bg-slate-700 hover:border-slate-500'
              }`}
              onClick={() => onAddExercise && onAddExercise(exercise)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-100">{exercise.name}</h3>
                {!isSelected && (
                  <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${getCategoryColor(exercise.category)}`}>
                    {exercise.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                    {exercise.difficulty}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{exercise.equipment}</span>
                  <span>{exercise.sets} × {exercise.reps}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No exercises found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}