// components/sections/ProgressChart.tsx - Fixed with proper null checks
import React from "react";
import { Text, View } from "react-native";

import { DailyProgress } from "../../data/DataModels";
import {
  Colors,
  DeviceUtils,
  SharedStyles,
  Spacing,
} from "../../styles/SharedStyles";

interface ProgressChartProps {
  dailyProgress?: DailyProgress[] | null;
  title?: string;
  daysToShow?: number;
}

/**
 * Single Responsibility: Display a bar chart of daily progress
 * Open/Closed: Can be extended with different chart types without modification
 * Interface Segregation: Only requires necessary progress data
 */
const ProgressChart: React.FC<ProgressChartProps> = ({
  dailyProgress = [],
  title = "Words Studied This Week",
  daysToShow = 7,
}) => {
  // Ensure dailyProgress is an array
  const safeProgress = Array.isArray(dailyProgress) ? dailyProgress : [];

  // Generate last N days including days with no activity
  const generateDaysData = () => {
    const days = [];
    const today = new Date();

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      // Find existing progress for this date (with null check)
      const existingProgress = safeProgress.find(
        (progress) => progress && progress.date === dateString,
      );

      days.push({
        date: dateString,
        wordsStudied: existingProgress?.wordsStudied || 0,
        testsCompleted: existingProgress?.testsCompleted || 0,
        timeSpent: existingProgress?.timeSpent || 0,
        accuracy: existingProgress?.accuracy || 0,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: date.getDate(),
      });
    }

    return days;
  };

  const daysData = generateDaysData();
  const maxWords = Math.max(...daysData.map((day) => day.wordsStudied), 1);

  // Show loading state if no data
  if (!dailyProgress && dailyProgress !== null) {
    return (
      <View style={[SharedStyles.card, styles.container]}>
        <Text style={[SharedStyles.h4, SharedStyles.textPrimary, styles.title]}>
          {title}
        </Text>
        <View
          style={[
            styles.chartContainer,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={[SharedStyles.body, SharedStyles.textTertiary]}>
            Loading progress data...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[SharedStyles.card, styles.container]}>
      <Text style={[SharedStyles.h4, SharedStyles.textPrimary, styles.title]}>
        {title}
      </Text>

      <View style={styles.chartContainer}>
        {daysData.map((day, index) => {
          const height = maxWords > 0 ? (day.wordsStudied / maxWords) * 100 : 0;
          const isToday = day.date === new Date().toISOString().split("T")[0];

          return (
            <View key={day.date} style={styles.barContainer}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: `${Math.max(height, 4)}%`, // Minimum height for visibility
                    backgroundColor:
                      day.wordsStudied > 0
                        ? Colors.primary
                        : Colors.backgroundTertiary,
                    opacity: day.wordsStudied > 0 ? 1 : 0.3,
                  },
                ]}
              />
              <Text
                style={[
                  SharedStyles.caption,
                  isToday
                    ? SharedStyles.textPrimary
                    : SharedStyles.textTertiary,
                  styles.dayLabel,
                ]}
              >
                {day.dayName}
              </Text>
              <Text
                style={[
                  SharedStyles.caption,
                  day.wordsStudied > 0
                    ? SharedStyles.textSecondary
                    : SharedStyles.textMuted,
                  { fontWeight: isToday ? "600" : "400" },
                ]}
              >
                {day.wordsStudied}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: Colors.primary }]}
          />
          <Text style={[SharedStyles.caption, SharedStyles.textTertiary]}>
            Words studied
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: Colors.backgroundTertiary, opacity: 0.3 },
            ]}
          />
          <Text style={[SharedStyles.caption, SharedStyles.textTertiary]}>
            No activity
          </Text>
        </View>
      </View>

      {/* Show message if no data available */}
      {safeProgress.length === 0 && (
        <View style={styles.noDataContainer}>
          <Text
            style={[
              SharedStyles.caption,
              SharedStyles.textTertiary,
              { textAlign: "center" },
            ]}
          >
            Start studying to see your progress here!
          </Text>
        </View>
      )}
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
  chartContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    height: 120,
    marginBottom: Spacing.md,
  },
  barContainer: {
    flex: 1,
    flexDirection: "column" as const,
    alignItems: "center" as const,
  },
  chartBar: {
    width: DeviceUtils.getValue(20, 28),
    backgroundColor: Colors.primary,
    borderRadius: 3,
    minHeight: 4,
  },
  dayLabel: {
    marginTop: Spacing.xs,
  },
  legend: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  noDataContainer: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
};

export default ProgressChart;
