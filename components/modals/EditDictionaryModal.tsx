import React from 'react';
import { Modal, View } from 'react-native';
import { SharedStyles, Colors } from '../../styles/SharedStyles';
import { Dictionary } from '../../data/DataModels';

// Components
import ScreenHeader from '../ui/layout/ScreenHeader';
import DictionaryForm from '../forms/DictionaryForm';

interface EditDictionaryModalProps {
  visible: boolean;
  dictionary: Dictionary | null;
  onSave: (dictionary: Dictionary) => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Modal for editing existing dictionaries
 * Single Responsibility: Handle dictionary editing flow in modal
 */
const EditDictionaryModal: React.FC<EditDictionaryModalProps> = ({
  visible,
  dictionary,
  onSave,
  onCancel,
  loading = false,
}) => {
  if (!dictionary) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <View style={[SharedStyles.container, { backgroundColor: Colors.background }]}>
        {/* Header */}
        <ScreenHeader
          title="Edit Dictionary"
          subtitle="Update dictionary information"
          showBackButton={true}
          onBackPress={onCancel}
        />

        {/* Form */}
        <DictionaryForm
          dictionary={dictionary}
          onSave={onSave}
          onCancel={onCancel}
          loading={loading}
        />
      </View>
    </Modal>
  );
};

export default EditDictionaryModal;