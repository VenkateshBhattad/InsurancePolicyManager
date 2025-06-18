/**
 * Policies Screen
 * Lists all policies with search and filter functionality
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  Searchbar,
  FAB,
  useTheme,
  ActivityIndicator,
  Paragraph,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

// Redux imports
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchPolicies,
  selectFilteredPolicies,
  selectPoliciesLoading,
  selectPoliciesError,
  setSearchQuery,
  selectPoliciesSearchQuery,
} from '../../store/slices/policiesSlice';

// Components
import PolicyCard from '../../components/policies/PolicyCard';
import ErrorMessage from '../../components/common/ErrorMessage';

// Types
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Policy } from '../../types';

type PoliciesNavigationProp = StackNavigationProp<RootStackParamList>;

const PoliciesScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<PoliciesNavigationProp>();
  const dispatch = useAppDispatch();

  // Redux state
  const policies = useAppSelector(selectFilteredPolicies);
  const loading = useAppSelector(selectPoliciesLoading);
  const error = useAppSelector(selectPoliciesError);
  const searchQuery = useAppSelector(selectPoliciesSearchQuery);

  // Load policies on mount
  useEffect(() => {
    dispatch(fetchPolicies());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchPolicies());
  };

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleAddPolicy = () => {
    navigation.navigate('AddEditPolicy', {});
  };

  const handlePolicyPress = (policy: Policy) => {
    navigation.navigate('PolicyDetails', { policyId: policy.id });
  };

  const renderPolicy = ({ item }: { item: Policy }) => (
    <PolicyCard
      policy={item}
      onPress={() => handlePolicyPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
        {searchQuery ? 'No policies found matching your search.' : 'No policies yet. Add your first policy to get started.'}
      </Paragraph>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search policies..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      {error && (
        <ErrorMessage
          message={error.message}
          onRetry={handleRefresh}
          style={styles.errorContainer}
        />
      )}

      {loading && policies.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Paragraph style={styles.loadingText}>Loading policies...</Paragraph>
        </View>
      ) : (
        <FlatList
          data={policies}
          renderItem={renderPolicy}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddPolicy}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  errorContainer: {
    margin: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default PoliciesScreen;
