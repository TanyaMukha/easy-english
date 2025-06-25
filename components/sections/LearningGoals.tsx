import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalStyles, Colors, Spacing } from '../../styles/GlobalStyles';

interface LearningGoalsProps {
  currentStreak: number;
  dailyGoal: number;
  todayProgress: number;
  title?: string;
}

/**
 * Single Responsibility: Display daily learning goals and progress
 * Open/Closed: Can be extended with additional goal types
 * Interface Segregation: Only requires goal-related data
 */
const LearningGoals: React.FC<LearningGoalsProps> = ({
  currentStreak,
  dailyGoal,
  todayProgress,
  title = "Today's Progress"
}) => {
  const progressPercentage = Math.min((todayProgress / dailyGoal) * 100, 100);

  return (
    <View style={[GlobalStyles.card, styles.container]}>
      <Text style={[GlobalStyles.h4, GlobalStyles.textPrimary, styles.title]}>
        {title}
      </Text>
      
      {/* Daily Goal Progress */}
      <View style={styles.goalSection}>
        <View style={styles.goalHeader}>
          <Text style={[GlobalStyles.bodyMedium, GlobalStyles.textSecondary]}>
            Daily Goal
          </Text>
          <Text style={[GlobalStyles.bodyMedium, GlobalStyles.textPrimary]}>
            {todayProgress}/{dailyGoal} words
          </Text>
        </View>
        <View style={GlobalStyles.progressBarContainer}>
          <View 
            style={[
              GlobalStyles.progressBarFill, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
      </View>

      {/* Current Streak */}
      <View style={styles.streakContainer}>
        <Ionicons name="flame" size={24} color={Colors.warning} />
        <View style={styles.streakInfo}>
          <Text style={[GlobalStyles.h5, GlobalStyles.textPrimary]}>
            {currentStreak} days
          </Text>
          <Text style={[GlobalStyles.bodySmall, GlobalStyles.textSecondary]}>
            Current streak
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = {
  container: {
    marginTop: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.lg,
  },
  goalSection: {
    marginBottom: Spacing.lg,
  },
  goalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: Spacing.xs,
  },
  streakContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  streakInfo: {
    marginLeft: Spacing.md,
  },
};

export default LearningGoals;