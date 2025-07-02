import { FlatList, RefreshControl, View } from "react-native";
import { router } from "expo-router";

import { DictionaryCard } from "../../components/cards";
import {
  DictionaryActionsModal,
  EditDictionaryModal,
} from "../../components/modals";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  ScreenHeader,
  SearchBar,
} from "../../components/ui";
import { Dictionary } from "../../data/DataModels";
import { useDictionaries } from "../../hooks/useDictionaries";
import { Colors, SharedStyles, Spacing } from "../../services/database/styles/SharedStyles";

export default function DictionariesScreen() {
  const {
    loading,
    refreshing,
    error,
    filteredDictionaries,
    searchQuery,
    selectedDictionary,
    showEditModal,
    showActionsModal,
    setSearchQuery,
    setShowEditModal,
    setShowActionsModal,
    onRefresh,
    loadData,
    updateDictionary,
    handleDictionaryMenu,
    handleEditDictionary,
    handleDeleteDictionary,
    handleViewStats,
  } = useDictionaries();

  const handleDictionaryPress = (dictionary: Dictionary) => {
    console.log("Navigate to dictionary:", dictionary);
    router.replace(`/dictionaries/${dictionary.id}`);
  };

  const handleCreatePress = () => {
    router.replace("/dictionaries/create");
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleMenuPress = (dictionary: Dictionary) => {
    handleDictionaryMenu(dictionary);
  };

  const handleEditSave = async (dictionary: Dictionary) => {
    const success = await updateDictionary(dictionary.id, dictionary.title);
    if (success) {
      setShowEditModal(false);
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
  };

  const handleActionsClose = () => {
    setShowActionsModal(false);
  };

  const renderDictionary = ({ item }: { item: Dictionary }) => (
    <DictionaryCard
      dictionary={item}
      onPress={handleDictionaryPress}
      onMenuPress={handleMenuPress}
      showMenu={true}
    />
  );

  const renderSeparator = () => <View style={{ height: Spacing.md }} />;

  return (
    <View style={SharedStyles.container}>
      <ScreenHeader
        title="Dictionaries"
        subtitle="Your word collections"
        showBackButton={true}
        onBackPress={handleBackPress}
        rightIcon="add"
        onRightPress={handleCreatePress}
        onRightPressAccessibilityLabel="Create new dictionary"
      />

      {loading && <LoadingState message="Loading dictionaries..." />}

      {!loading && error && (
        <ErrorState
          title="Failed to load dictionaries"
          message={error}
          onRetry={loadData}
        />
      )}

      {!loading && !error && (
        <View style={SharedStyles.flex1}>
          <View
            style={[/* SharedStyles.paddingHorizontalLg, */ styles.searchContainer]}
          >
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search dictionaries..."
              showFilterButton={false}
            />
          </View>

          {filteredDictionaries.length === 0 && !searchQuery && (
            <EmptyState
              title="No dictionaries yet"
              message="Create your first dictionary to start building your vocabulary collection"
              buttonText="Create Dictionary"
              onButtonPress={handleCreatePress}
              icon="book"
            />
          )}

          {filteredDictionaries.length === 0 && searchQuery && (
            <EmptyState
              title="No dictionaries found"
              message={`No dictionaries match "${searchQuery}"`}
              icon="search"
              showButton={false}
            />
          )}

          {filteredDictionaries.length > 0 && (
            <FlatList
              data={filteredDictionaries}
              renderItem={renderDictionary}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={renderSeparator}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={Colors.primary}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      <EditDictionaryModal
        visible={showEditModal}
        dictionary={selectedDictionary}
        onSave={handleEditSave}
        onCancel={handleEditCancel}
      />

      <DictionaryActionsModal
        visible={showActionsModal}
        dictionary={selectedDictionary}
        onClose={handleActionsClose}
        onEdit={handleEditDictionary}
        onDelete={handleDeleteDictionary}
        onViewStats={handleViewStats}
      />
    </View>
  );
}

const styles = {
  searchContainer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
};
