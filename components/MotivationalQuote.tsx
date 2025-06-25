import React from 'react';
import { View, Text } from 'react-native';
import { GlobalStyles, Colors, Spacing } from '../styles/GlobalStyles';

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
    <View style={[GlobalStyles.card, styles.container]}>
      <Text style={[GlobalStyles.h4, GlobalStyles.textPrimary, styles.title]}>
        {title}
      </Text>
      
      <Text style={[GlobalStyles.bodyMedium, styles.quoteText]}>
        "{quote.text}"
      </Text>
      
      <Text style={[GlobalStyles.bodySmall, GlobalStyles.textSecondary, styles.translation]}>
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