import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

export default function WorkoutTimer({ isActive, onComplete }) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [restTime, setRestTime] = useState(60); // Default 60 seconds rest
  const [isResting, setIsResting] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && isActive) {
      interval = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    } else if (!isRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, isActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTime(0);
    setIsResting(false);
  };

  const handleReset = () => {
    setTime(0);
  };

  const startRestTimer = () => {
    setIsResting(true);
    setTime(0);
    setIsRunning(true);
  };

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-xl z-50">
      <div className="text-center mb-4">
        <div className="text-2xl font-mono font-bold text-gray-100">
          {formatTime(time)}
        </div>
        <div className="text-sm text-gray-400">
          {isResting ? 'Rest Time' : 'Workout Time'}
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2 mb-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="p-2 bg-teal-500 hover:bg-teal-600 text-white rounded-full transition-colors"
          >
            <Play className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}
        
        <button
          onClick={handleReset}
          className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleStop}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={startRestTimer}
          className="flex-1 text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
        >
          Rest
        </button>
        <button
          onClick={() => {
            setIsResting(false);
            setTime(0);
          }}
          className="flex-1 text-xs px-2 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded transition-colors"
        >
          Exercise
        </button>
      </div>

      {onComplete && (
        <button
          onClick={onComplete}
          className="w-full mt-2 text-xs px-2 py-1 bg-lime-500 hover:bg-lime-600 text-white rounded transition-colors"
        >
          Complete Workout
        </button>
      )}
    </div>
  );
}