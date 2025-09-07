import React, { useState, useEffect } from 'react';
import { Bell, X, Dumbbell, Target } from 'lucide-react';

export default function NotificationBanner() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Check for workout reminders
    const checkReminders = () => {
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      const newNotifications = [];

      // Morning workout reminder (8 AM on weekdays)
      if (hour === 8 && dayOfWeek >= 1 && dayOfWeek <= 5) {
        newNotifications.push({
          id: 'morning-workout',
          type: 'workout',
          title: 'Morning Workout Reminder',
          message: 'Start your day with energy! Time for your morning workout.',
          icon: Dumbbell,
          color: 'teal'
        });
      }

      // Evening workout reminder (6 PM on weekdays)
      if (hour === 18 && dayOfWeek >= 1 && dayOfWeek <= 5) {
        newNotifications.push({
          id: 'evening-workout',
          type: 'workout',
          title: 'Evening Workout Reminder',
          message: 'Finish strong! Your evening workout is waiting.',
          icon: Dumbbell,
          color: 'orange'
        });
      }

      // Nutrition reminder (12 PM daily)
      if (hour === 12) {
        newNotifications.push({
          id: 'lunch-nutrition',
          type: 'nutrition',
          title: 'Nutrition Tracking',
          message: "Don't forget to log your lunch and stay on track with your goals!",
          icon: Target,
          color: 'lime'
        });
      }

      // Only show notifications that haven't been dismissed today
      const today = new Date().toDateString();
      const dismissedToday = JSON.parse(localStorage.getItem('dismissedNotifications') || '{}');
      
      const filteredNotifications = newNotifications.filter(
        notification => !dismissedToday[today]?.includes(notification.id)
      );

      setNotifications(filteredNotifications);
    };

    // Check immediately and then every hour
    checkReminders();
    const interval = setInterval(checkReminders, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const dismissNotification = (notificationId) => {
    const today = new Date().toDateString();
    const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '{}');
    
    if (!dismissed[today]) {
      dismissed[today] = [];
    }
    
    dismissed[today].push(notificationId);
    localStorage.setItem('dismissedNotifications', JSON.stringify(dismissed));
    
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {notifications.map((notification) => {
        const Icon = notification.icon;
        return (
          <div
            key={notification.id}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              notification.color === 'teal' 
                ? 'bg-teal-500 bg-opacity-10 border-teal-500 border-opacity-30' 
                : notification.color === 'orange'
                ? 'bg-orange-500 bg-opacity-10 border-orange-500 border-opacity-30'
                : 'bg-lime-500 bg-opacity-10 border-lime-500 border-opacity-30'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                notification.color === 'teal' 
                  ? 'bg-teal-500 bg-opacity-20' 
                  : notification.color === 'orange'
                  ? 'bg-orange-500 bg-opacity-20'
                  : 'bg-lime-500 bg-opacity-20'
              }`}>
                <Icon className={`w-5 h-5 ${
                  notification.color === 'teal' 
                    ? 'text-teal-400' 
                    : notification.color === 'orange'
                    ? 'text-orange-400'
                    : 'text-lime-400'
                }`} />
              </div>
              <div>
                <h4 className="font-medium text-gray-100">{notification.title}</h4>
                <p className="text-sm text-gray-300">{notification.message}</p>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}