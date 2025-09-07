import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Plus, Play, Check, Clock, Dumbbell, Trash2, Timer } from 'lucide-react';
import Modal from '../components/Modal';
import WorkoutTimer from '../components/WorkoutTimer';
import ExerciseLibrary from '../components/ExerciseLibrary';

const EXERCISE_LIBRARY = [
  { id: 1, name: 'Push-ups', category: 'Chest', sets: 3, reps: 12 },
  { id: 2, name: 'Squats', category: 'Legs', sets: 3, reps: 15 },
  { id: 3, name: 'Pull-ups', category: 'Back', sets: 3, reps: 8 },
  { id: 4, name: 'Plank', category: 'Core', sets: 3, reps: '30s' },
  { id: 5, name: 'Lunges', category: 'Legs', sets: 3, reps: 12 },
  { id: 6, name: 'Burpees', category: 'Cardio', sets: 3, reps: 10 },
  { id: 7, name: 'Deadlifts', category: 'Back', sets: 3, reps: 8 },
  { id: 8, name: 'Bench Press', category: 'Chest', sets: 3, reps: 10 }
];

export default function WorkoutsPage() {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [workouts, setWorkouts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    exercises: [],
    scheduledFor: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (currentUser) {
      fetchWorkouts();
    }
  }, [currentUser]);

  const fetchWorkouts = async () => {
    try {
      const workoutsQuery = query(
        collection(db, 'workouts'),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(workoutsQuery);
      const workoutsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWorkouts(workoutsData);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWorkout = async () => {
    if (!newWorkout.name || newWorkout.exercises.length === 0) return;

    try {
      await addDoc(collection(db, 'workouts'), {
        ...newWorkout,
        userId: currentUser.uid,
        createdAt: new Date(),
        completed: false,
        scheduledFor: new Date(newWorkout.scheduledFor)
      });
      
      setNewWorkout({ name: '', exercises: [], scheduledFor: new Date().toISOString().split('T')[0] });
      setShowCreateModal(false);
      showSuccess('Workout created successfully!');
      fetchWorkouts();
    } catch (error) {
      console.error('Error creating workout:', error);
      showError('Failed to create workout. Please try again.');
    }
  };

  const startWorkout = (workout) => {
    setActiveWorkout(workout);
  };

  const completeWorkout = async (workoutId) => {
    try {
      await updateDoc(doc(db, 'workouts', workoutId), {
        completed: true,
        completedAt: new Date()
      });
      setActiveWorkout(null);
      showSuccess('Workout completed!');
      fetchWorkouts();
    } catch (error) {
      console.error('Error completing workout:', error);
      showError('Failed to complete workout. Please try again.');
    }
  };

  const deleteWorkout = async (workoutId) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'workouts', workoutId));
      showSuccess('Workout deleted successfully!');
      fetchWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
      showError('Failed to delete workout. Please try again.');
    }
  };

  const addExerciseToWorkout = (exercise) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...exercise, id: Date.now() }]
    }));
  };

  const removeExerciseFromWorkout = (exerciseId) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
    }));
  };

  const WorkoutCard = ({ workout }) => (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">{workout.name}</h3>
        <div className="flex items-center space-x-2">
          {workout.completed ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lime-500 bg-opacity-20 text-lime-400">
              <Check className="w-3 h-3 mr-1" />
              Completed
            </span>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => startWorkout(workout)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-teal-500 hover:bg-teal-600 shadow-lg transition-colors"
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </button>
              {activeWorkout?.id === workout.id && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500 bg-opacity-20 text-orange-400">
                  <Timer className="w-3 h-3 mr-1" />
                  Active
                </span>
              )}
            </div>
          )}
          <button
            onClick={() => deleteWorkout(workout.id)}
            className="inline-flex items-center p-2 text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-10 rounded-md transition-colors"
            title="Delete workout"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        {workout.exercises?.map((exercise, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-slate-700 rounded">
            <span className="text-sm font-medium text-gray-200">{exercise.name}</span>
            <span className="text-sm text-gray-400">
              {exercise.sets} × {exercise.reps}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center text-sm text-gray-600">
        <Clock className="w-4 h-4 mr-1" />
        Scheduled: {workout.scheduledFor && new Date(workout.scheduledFor.seconds * 1000).toLocaleDateString()}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Workouts</h1>
          <p className="text-gray-400">Plan and track your workout routines</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Workout
        </button>
      </div>

      {/* Workouts Grid */}
      {workouts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {workouts.map(workout => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-100 mb-2">No workouts yet</h3>
          <p className="text-gray-400 mb-4">Create your first workout to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Workout
          </button>
        </div>
      )}

      {/* Create Workout Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Workout"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Workout Name
            </label>
            <input
              type="text"
              value={newWorkout.name}
              onChange={(e) => setNewWorkout(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., Upper Body Strength"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Scheduled Date
            </label>
            <input
              type="date"
              value={newWorkout.scheduledFor}
              onChange={(e) => setNewWorkout(prev => ({ ...prev, scheduledFor: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Add Exercises
            </label>
            <ExerciseLibrary 
              onAddExercise={addExerciseToWorkout}
              selectedExercises={newWorkout.exercises}
            />
          </div>

          {newWorkout.exercises.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Selected Exercises
              </label>
              <div className="space-y-2">
                {newWorkout.exercises.map(exercise => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between p-2 bg-teal-500 bg-opacity-20 border border-teal-500 border-opacity-30 rounded"
                  >
                    <span className="text-sm font-medium text-gray-100">{exercise.name}</span>
                    <button
                      onClick={() => removeExerciseFromWorkout(exercise.id)}
                      className="text-red-400 hover:text-red-300 text-lg font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={createWorkout}
              disabled={!newWorkout.name || newWorkout.exercises.length === 0}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              Create Workout
            </button>
          </div>
        </div>
      </Modal>

      {/* Workout Timer */}
      <WorkoutTimer
        isActive={!!activeWorkout}
        onComplete={() => activeWorkout && completeWorkout(activeWorkout.id)}
      />
    </div>
  );
}