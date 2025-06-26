import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SharedStyles, Colors, Spacing } from '../../styles/SharedStyles';

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
    <View style={[SharedStyles.card, styles.container]}>
      <Text style={[SharedStyles.h4, SharedStyles.textPrimary, styles.title]}>
        {title}
      </Text>
      
      {/* Daily Goal Progress */}
      <View style={styles.goalSection}>
        <View style={styles.goalHeader}>
          <Text style={[SharedStyles.bodyMedium, SharedStyles.textSecondary]}>
            Daily Goal
          </Text>
          <Text style={[SharedStyles.bodyMedium, SharedStyles.textPrimary]}>
            {todayProgress}/{dailyGoal} words
          </Text>
        </View>
        <View style={SharedStyles.progressBarContainer}>
          <View 
            style={[
              SharedStyles.progressBarFill, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
      </View>

      {/* Current Streak */}
      <View style={styles.streakContainer}>
        <Ionicons name="flame" size={24} color={Colors.warning} />
        <View style={styles.streakInfo}>
          <Text style={[SharedStyles.h5, SharedStyles.textPrimary]}>
            {currentStreak} days
          </Text>
          <Text style={[SharedStyles.bodySmall, SharedStyles.textSecondary]}>
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