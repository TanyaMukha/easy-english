import React from 'react';
import { Modal, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SharedStyles, Colors, Spacing } from '../../styles/SharedStyles';
import { Dictionary } from '../../data/DataModels';
import { DictionaryService } from '../../services/DictionaryService';

interface DictionaryActionsModalProps {
  visible: boolean;
  dictionary: Dictionary | null;
  onClose: () => void;
  onEdit: (dictionary: Dictionary) => void;
  onDelete: (dictionary: Dictionary) => void;
  onViewStats: (dictionary: Dictionary) => void;
}

interface ActionItem {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
  destructive?: boolean;
}

/**
 * Modal for dictionary context actions
 * Single Responsibility: Handle dictionary action selection
 */
const DictionaryActionsModal: React.FC<DictionaryActionsModalProps> = ({
  visible,
  dictionary,
  onClose,
  onEdit,
  onDelete,
  onViewStats,
}) => {
  if (!dictionary) {
    return null;
  }

  const handleEdit = () => {
    onClose();
    onEdit(dictionary);
  };

  const handleViewStats = () => {
    onClose();
    onViewStats(dictionary);
  };

  const handleExport = async () => {
    onClose();
    
    try {
      // TODO: Implement dictionary export functionality
      Alert.alert(
        'Export Dictionary',
        'Export functionality will be implemented soon.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export dictionary');
    }
  };

  const handleDuplicate = async () => {
    onClose();
    
    try {
      // TODO: Implement dictionary duplication
      Alert.alert(
        'Duplicate Dictionary',
        'Duplication functionality will be implemented soon.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to duplicate dictionary');
    }
  };

  const handleDelete = () => {
    onClose();
    
    Alert.alert(
      'Delete Dictionary',
      `Are you sure you want to delete "${dictionary.title}"? This action cannot be undone and will also delete all words in this dictionary.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(),
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      const response = await DictionaryService.delete(dictionary.id);
      
      if (response.success) {
        onDelete(dictionary);
      } else {
        Alert.alert('Error', response.error || 'Failed to delete dictionary');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete dictionary');
    }
  };

  const actions: ActionItem[] = [
    {
      icon: 'create-outline',
      title: 'Edit Dictionary',
      subtitle: 'Change title and settings',
      color: Colors.primary,
      onPress: handleEdit,
    },
    {
      icon: 'stats-chart-outline',
      title: 'View Statistics',
      subtitle: 'See learning progress',
      color: Colors.accent,
      onPress: handleViewStats,
    },
    {
      icon: 'copy-outline',
      title: 'Duplicate Dictionary',
      subtitle: 'Create a copy',
      color: Colors.success,
      onPress: handleDuplicate,
    },
    {
      icon: 'download-outline',
      title: 'Export Dictionary',
      subtitle: 'Save as backup file',
      color: Colors.warning,
      onPress: handleExport,
    },
    {
      icon: 'trash-outline',
      title: 'Delete Dictionary',
      subtitle: 'Remove permanently',
      color: Colors.error,
      onPress: handleDelete,
      destructive: true,
    },
  ];

  const renderAction = (action: ActionItem) => (
    <TouchableOpacity
      key={action.title}
      style={[styles.actionItem, action.destructive && styles.destructiveAction]}
      onPress={action.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
        <Ionicons name={action.icon as any} size={24} color={action.color} />
      </View>
      <View style={styles.actionContent}>
        <Text style={[SharedStyles.bodyLarge, SharedStyles.textPrimary]}>
          {action.title}
        </Text>
        <Text style={[SharedStyles.bodySmall, SharedStyles.textSecondary]}>
          {action.subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal as any}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={[SharedStyles.h4, SharedStyles.textPrimary]} numberOfLines={2}>
                {dictionary.title}
              </Text>
              <Text style={[SharedStyles.bodySmall, SharedStyles.textSecondary]}>
                Dictionary actions
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Actions List */}
          <View style={styles.content}>
            {actions.map(renderAction)}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: Spacing.lg,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
  },
  closeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.md,
  },
  content: {
    padding: Spacing.md,
  },
  actionItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  destructiveAction: {
    backgroundColor: Colors.errorBg,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: Spacing.md,
  },
  actionContent: {
    flex: 1,
  },
};

export default DictionaryActionsModal;