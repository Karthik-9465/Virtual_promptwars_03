import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const CarbonContext = createContext();

export const useCarbon = () => useContext(CarbonContext);

export const CarbonProvider = ({ children }) => {
  const { showToast, refreshProfileState, refreshUserGamification } = useAuth();
  
  const [analytics, setAnalytics] = useState(null);
  const [footprints, setFootprints] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [goals, setGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingCarbon, setLoadingCarbon] = useState(false);

  const fetchAnalyticsSummary = async () => {
    try {
      setLoadingCarbon(true);
      const data = await api.getAnalyticsSummary();
      setAnalytics(data);
      setFootprints(data.footprints || []);
      setRecommendations(data.activeRecommendations || []);
      setNotifications(data.recentNotifications || []);
      
      // Sync level & XP changes to AuthContext if available
      if (data.profile) {
        refreshUserGamification({
          xpPoints: data.profile.xpPoints,
          streakDays: data.profile.streakDays,
          level: data.profile.level,
        });
      }
    } catch (error) {
      console.error('Error fetching analytics summary:', error.message);
    } finally {
      setLoadingCarbon(false);
    }
  };

  const fetchRecommendationsOnly = async () => {
    try {
      const data = await api.getRecommendations();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error.message);
    }
  };

  const fetchGoalsOnly = async () => {
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error.message);
    }
  };

  const fetchNotificationsOnly = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
    }
  };

  const performRecommendationAction = async (recId, status) => {
    try {
      const res = await api.performAction(recId, status);
      
      if (status === 'completed') {
        const xpEarned = res.gamification ? res.gamification.xpPoints - (analytics?.profile?.xpPoints || 0) : 0;
        showToast(`Action completed! +${xpEarned} XP. Streak: ${res.gamification?.streakDays || 1} days 🔥`);
        
        if (res.gamification && res.gamification.newlyUnlockedBadges && res.gamification.newlyUnlockedBadges.length > 0) {
          setTimeout(() => {
            showToast(`🎖️ New badge unlocked: ${res.gamification.newlyUnlockedBadges.join(', ')}!`, 'success');
          }, 1500);
        }
        
        // Update local gamification numbers
        if (res.gamification) {
          refreshUserGamification(res.gamification);
        }
      } else {
        showToast('Action dismissed.');
      }

      // Refresh data
      await fetchAnalyticsSummary();
      await fetchRecommendationsOnly();
      await fetchGoalsOnly();
    } catch (error) {
      showToast(error.message || 'Failed to apply recommendation action', 'error');
    }
  };

  const regenerateUserRecommendations = async () => {
    try {
      setLoadingCarbon(true);
      const res = await api.regenerateRecommendations();
      setRecommendations(res.recommendations || []);
      showToast('Recommendations pool regenerated successfully.');
      await fetchAnalyticsSummary();
    } catch (error) {
      showToast(error.message || 'Failed to regenerate recommendations', 'error');
    } finally {
      setLoadingCarbon(false);
    }
  };

  const createUserGoal = async (goalData) => {
    try {
      await api.createGoal(goalData);
      showToast('New goal activated successfully!');
      await fetchGoalsOnly();
      await fetchAnalyticsSummary();
    } catch (error) {
      showToast(error.message || 'Failed to create goal', 'error');
      throw error;
    }
  };

  const updateUserGoal = async (id, goalData) => {
    try {
      await api.updateGoal(id, goalData);
      showToast('Goal updated successfully.');
      await fetchGoalsOnly();
    } catch (error) {
      showToast(error.message || 'Failed to update goal', 'error');
      throw error;
    }
  };

  const deleteUserGoal = async (id) => {
    try {
      await api.deleteGoal(id);
      showToast('Goal deleted.');
      await fetchGoalsOnly();
      await fetchAnalyticsSummary();
    } catch (error) {
      showToast(error.message || 'Failed to delete goal', 'error');
    }
  };

  const dismissNotification = async (id) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error.message);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('All notifications marked as read.');
    } catch (error) {
      console.error('Failed to mark all read:', error.message);
    }
  };

  const syncCalculatorForm = async (formData) => {
    try {
      setLoadingCarbon(true);
      const res = await api.updateProfile(formData);
      refreshProfileState(res.profile);
      showToast('Calculations updated and profile saved!');
      await fetchAnalyticsSummary();
      await fetchRecommendationsOnly();
    } catch (error) {
      showToast(error.message || 'Failed to update profile settings', 'error');
      throw error;
    } finally {
      setLoadingCarbon(false);
    }
  };

  return (
    <CarbonContext.Provider
      value={{
        analytics,
        footprints,
        recommendations,
        goals,
        notifications,
        loadingCarbon,
        fetchAnalyticsSummary,
        fetchRecommendationsOnly,
        fetchGoalsOnly,
        fetchNotificationsOnly,
        performRecommendationAction,
        regenerateUserRecommendations,
        createUserGoal,
        updateUserGoal,
        deleteUserGoal,
        dismissNotification,
        markAllNotificationsAsRead,
        syncCalculatorForm,
      }}
    >
      {children}
    </CarbonContext.Provider>
  );
};
