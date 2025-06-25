import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalStyles, Colors, Spacing, DeviceUtils } from '../styles/GlobalStyles';

interface CollectionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  count: number;
  onPress: () => void;
}

interface WordCollectionsSectionProps {
  title?: string;
  collections: CollectionItem[];
  onSeeAllPress: () => void;
  seeAllText?: string;
}

/**
 * Single Responsibility: Display a horizontal list of word collections (dictionaries, sets, units)
 * Open/Closed: Can be extended with different collection types
 * Interface Segregation: Only requires collection data and handlers
 */
const WordCollectionsSection: React.FC<WordCollectionsSectionProps> = ({
  title = 'Your Collections',
  collections,
  onSeeAllPress,
  seeAllText = 'See all'
}) => {
  const renderCollection = ({ item }: { item: CollectionItem }) => (
    <TouchableOpacity 
      style={[GlobalStyles.card, styles.collectionCard]} 
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon as any} size={24} color={item.color} />
        </View>
        <View style={styles.countBadge}>
          <Text style={[GlobalStyles.caption, styles.countText]}>
            {item.count}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={[GlobalStyles.bodyLarge, GlobalStyles.textPrimary, styles.cardTitle]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[GlobalStyles.bodySmall, GlobalStyles.textSecondary]} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
      
      <View style={styles.cardFooter}>
        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );

  const renderSeparator = () => <View style={{ width: Spacing.md }} />;

  return (
    <View style={styles.container}>
      <View style={[GlobalStyles.flexRow, GlobalStyles.paddingHorizontalLg, styles.header]}>
        <Text style={[GlobalStyles.h3, GlobalStyles.textPrimary]}>
          {title}
        </Text>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
          <Text style={[GlobalStyles.bodyMedium, styles.seeAllText]}>
            {seeAllText}
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={collections}
        renderItem={renderCollection}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={renderSeparator}
      />
    </View>
  );
};

const styles = {
  container: {
    marginTop: Spacing.lg,
  },
  header: {
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.md,
  },
  seeAllText: {
    color: Colors.primary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  collectionCard: {
    width: DeviceUtils.getValue(160, 180),
    height: DeviceUtils.getValue(120, 140),
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: DeviceUtils.getValue(36, 40),
    height: DeviceUtils.getValue(36, 40),
    borderRadius: DeviceUtils.getValue(18, 20),
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  countBadge: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 10,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center' as const,
  },
  countText: {
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    fontSize: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  cardTitle: {
    fontWeight: '600' as const,
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  cardFooter: {
    alignItems: 'flex-end' as const,
  },
};

export default WordCollectionsSection;