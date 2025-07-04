import React from 'react';
import { View, Text } from 'react-native';
import { SharedStyles, Colors, Spacing } from '../../styles/SharedStyles';
import QuickActionButton from '../ui/buttons/QuickActionButton';

interface ShortcutItem {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface QuickShortcutsSectionProps {
  title?: string;
  shortcuts: ShortcutItem[];
}

/**
 * Single Responsibility: Display quick shortcuts to main app sections
 * Open/Closed: Can be extended with new shortcut types
 * Interface Segregation: Only requires shortcuts data
 */
const QuickShortcutsSection: React.FC<QuickShortcutsSectionProps> = ({
  title = 'Quick Actions',
  shortcuts
}) => {
  return (
    <View style={[SharedStyles.paddingHorizontalLg, styles.container]}>
      <Text style={[SharedStyles.h3, SharedStyles.textPrimary, styles.title]}>
        {title}
      </Text>
      
      {shortcuts.map((shortcut, index) => (
        <QuickActionButton
          key={index}
          title={shortcut.title}
          subtitle={shortcut.subtitle}
          icon={shortcut.icon}
          color={shortcut.color}
          onPress={shortcut.onPress}
        />
      ))}
    </View>
  );
};

const styles = {
  container: {
    marginTop: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.md,
  },
};

export default QuickShortcutsSection;