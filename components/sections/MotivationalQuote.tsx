import React from 'react';
import { View, Text } from 'react-native';
import { SharedStyles, Colors, Spacing } from '../../services/database/styles/SharedStyles';

interface Quote {
  text: string;
  translation: string;
}

interface MotivationalQuoteProps {
  quote: Quote;
  title?: string;
}

/**
 * Single Responsibility: Display a motivational quote with translation
 * Open/Closed: Can be extended with different quote display styles
 * Interface Segregation: Only requires quote data
 */
const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({
  quote,
  title = 'Quote of the Day'
}) => {
  return (
    <View style={[SharedStyles.card, styles.container]}>
      <Text style={[SharedStyles.h4, SharedStyles.textPrimary, styles.title]}>
        {title}
      </Text>
      
      <Text style={[SharedStyles.bodyMedium, styles.quoteText]}>
        "{quote.text}"
      </Text>
      
      <Text style={[SharedStyles.bodySmall, SharedStyles.textSecondary, styles.translation]}>
        {quote.translation}
      </Text>
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
  quoteText: {
    fontStyle: 'italic' as const,
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  translation: {
    fontStyle: 'italic' as const,
    lineHeight: 20,
  },
};

export default MotivationalQuote;