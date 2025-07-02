import { FlatList, RefreshControl, View } from "react-native";
import { router } from "expo-router";

import { SetCard } from "../../components/cards";
import { EditSetModal, SetActionsModal } from "../../components/modals";
import {
  EmptyState,
  ErrorState,
  FloatingActionButton,
  LoadingState,
  ScreenHeader,
  SearchBar,
} from "../../components/ui";
import { Set } from "../../data/DataModels";
import { useSets } from "../../hooks/useSets";
import { Colors, SharedStyles, Spacing } from "../../styles/SharedStyles";
import { SetCreateRequest, SetStats, SetUpdateRequest } from "services/database";
import { generateGuid } from "utils/guid";

/**
 * All Sets Screen with full CRUD support
 * Single Responsibility: Display and manage all word sets
 * Open/Closed: Can be extended with additional set management features
 */
export default function SetsScreen() {
  const {
    loading,
    refreshing,
    error,
    filteredSets,
    searchQuery,
    selectedSet,
    showEditModal,
    showActionsModal,
    setSearchQuery,
    setShowEditModal,
    setShowActionsModal,
    onRefresh,
    createSet,
    updateSet,
    handleSetMenu,
    handleEditSet,
    handleDeleteSet,
    handleViewStats,
    handleManageWords,
  } = useSets();

  const handleSetPress = (set: Set) => {
    console.log("Navigate to set details:", set.id);
    router.push(`/sets/${set.id}`);
  };

  const handleCreatePress = () => {
    console.log("Navigate to create set");
    router.push("/sets/create");
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleMenuPress = (set: Set) => {
    handleSetMenu(set as unknown as SetStats);
  };

  const handleEditSave = async (set: Set) => {
    const success = await updateSet(set.id, set as SetUpdateRequest);
    if (success) {
      setShowEditModal(false);
    }
    return success;
  };

  const handleCreateSave = async (set: Set) => {
    // Ensure guid is present for SetCreateRequest
    const { id, guid, title, description } = set;
    const createRequest = {
      id: id || 0,
      guid: guid || generateGuid(),
      title,
      description,
    };
    const success = await createSet(createRequest as SetCreateRequest);
    if (success) {
      setShowEditModal(false);
    }
    return success;
  };

  const renderSet = ({ item }: { item: Set }) => (
    <SetCard
      set={item}
      onPress={handleSetPress}
      onMenuPress={handleMenuPress}
      showProgress={true}
      showMenu={true}
    />
  );

  const renderSeparator = () => <View style={{ height: Spacing.md }} />;

  const renderEmptyState = () => (
    <EmptyState
      icon="list"
      title="No Word Sets"
      message="Create your first word set to organize your vocabulary learning"
      buttonText="Create Set"
      onButtonPress={handleCreatePress}
    />
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return <LoadingState message="Loading sets..." />;
    }

    if (error) {
      return (
        <ErrorState
          title="Failed to Load Sets"
          message={error}
          buttonText="Try Again"
          onRetry={onRefresh}
        />
      );
    }

    if (filteredSets.length === 0 && !searchQuery.trim()) {
      return renderEmptyState();
    }

    if (filteredSets.length === 0 && searchQuery.trim()) {
      return (
        <EmptyState
          icon="search"
          title="No Sets Found"
          message={`No sets match "${searchQuery}"`}
          buttonText="Clear Search"
          onButtonPress={() => setSearchQuery("")}
        />
      );
    }

    return (
      <FlatList
        data={filteredSets as unknown as Set[]}
        renderItem={renderSet}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={renderSeparator}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={SharedStyles.container}>
      {/* Header */}
      <ScreenHeader
        title="Word Sets"
        subtitle={`${filteredSets.length} sets`}
        showBackButton={true}
        onBackPress={handleBackPress}
        rightIcon="plus"
        onRightPress={handleCreatePress}
      />

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search sets..."
        // containerStyle={styles.searchContainer}
      />

      {/* Content */}
      {renderContent()}

      {/* Floating Action Button */}
      {!loading && filteredSets.length > 0 && (
        <FloatingActionButton
          icon="plus"
          onPress={handleCreatePress}
          accessibilityLabel="Create new set"
        />
      )}

      {/* Edit Set Modal */}
      {/* <EditSetModal
        visible={showEditModal}
        set={selectedSet}
        onClose={() => setShowEditModal(false)}
        onSave={selectedSet ? handleEditSave : handleCreateSave}
        mode={selectedSet ? "edit" : "create"}
      /> */}

      {/* Set Actions Modal */}
      {/* <SetActionsModal
        visible={showActionsModal}
        set={selectedSet}
        onClose={() => setShowActionsModal(false)}
        onEdit={handleEditSet}
        onDelete={handleDeleteSet}
        onViewStats={handleViewStats}
        onManageWords={handleManageWords}
      /> */}
    </View>
  );
}

const styles = {
  searchContainer: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  listContainer: {
    paddingBottom: 100, // Space for FAB
  },
};
