// components/words/WordModalsContainer.tsx

import React from "react";
import { View } from "react-native";

import FilterModal from "./FilterModal";
import ScreenHeader from "./ScreenHeader";
import WordActionsModal from "./WordActionsModal";
import WordForm from "./WordForm";
import { WordFilters, WordWithExamples } from "../data/DataModels";
import { Colors } from "../styles/GlobalStyles";

interface WordModalsContainerProps {
  // Add Word Modal
  showAddModal: boolean;
  onAddCancel: () => void;
  onAddSave: (word: WordWithExamples) => void;
  dictionaryId: number;

  // Edit Word Modal
  showEditModal: boolean;
  selectedWord: WordWithExamples | null;
  onEditCancel: () => void;
  onEditSave: (word: WordWithExamples) => void;

  // Filter Modal
  showFilters: boolean;
  filters: WordFilters;
  onFiltersChange: (filters: WordFilters) => void;
  onFiltersClose: () => void;

  // Actions Modal
  showActionsModal: boolean;
  onActionsClose: () => void;
  onEdit: (word: WordWithExamples) => void;
  onDelete: (word: WordWithExamples) => void;
  onViewStats: (word: WordWithExamples) => void;
  onPractice: (word: WordWithExamples) => void;
}

/**
 * Single Responsibility: Manage all word-related modals
 * Open/Closed: Can be extended with new modal types
 * Interface Segregation: Groups related modal functionality
 */
const WordModalsContainer: React.FC<WordModalsContainerProps> = ({
  showAddModal,
  onAddCancel,
  onAddSave,
  dictionaryId,
  showEditModal,
  selectedWord,
  onEditCancel,
  onEditSave,
  showFilters,
  filters,
  onFiltersChange,
  onFiltersClose,
  showActionsModal,
  onActionsClose,
  onEdit,
  onDelete,
  onViewStats,
  onPractice,
}) => {
  return (
    <>
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScreenHeader
              title="Add New Word"
              subtitle="Add to your vocabulary"
              showBackButton={true}
              onBackPress={onAddCancel}
            />
            <WordForm
              dictionaryId={dictionaryId}
              onSave={onAddSave}
              onCancel={onAddCancel}
            />
          </View>
        </View>
      )}

      {showEditModal && selectedWord && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScreenHeader
              title="Edit Word"
              subtitle="Update word information"
              showBackButton={true}
              onBackPress={onEditCancel}
            />
            <WordForm
              word={selectedWord}
              dictionaryId={dictionaryId}
              onSave={onEditSave}
              onCancel={onEditCancel}
            />
          </View>
        </View>
      )}

      <FilterModal
        visible={showFilters}
        filters={filters}
        onFiltersChange={onFiltersChange}
        onClose={onFiltersClose}
      />

      <WordActionsModal
        visible={showActionsModal}
        word={selectedWord}
        onClose={onActionsClose}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewStats={onViewStats}
        onPractice={onPractice}
      />
    </>
  );
};

const styles = {
  modalOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
};

export default WordModalsContainer;
