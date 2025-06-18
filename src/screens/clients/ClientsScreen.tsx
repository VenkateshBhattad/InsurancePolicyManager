/**
 * Clients Screen
 * Lists all clients with search functionality
 */

import React, { useEffect } from 'react';
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
  fetchClients,
  selectFilteredClients,
  selectClientsLoading,
  selectClientsError,
  setSearchQuery,
  selectClientsSearchQuery,
} from '../../store/slices/clientsSlice';

// Components
import ClientCard from '../../components/clients/ClientCard';
import ErrorMessage from '../../components/common/ErrorMessage';

// Types
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Client } from '../../types';

type ClientsNavigationProp = StackNavigationProp<RootStackParamList>;

const ClientsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<ClientsNavigationProp>();
  const dispatch = useAppDispatch();

  // Redux state
  const clients = useAppSelector(selectFilteredClients);
  const loading = useAppSelector(selectClientsLoading);
  const error = useAppSelector(selectClientsError);
  const searchQuery = useAppSelector(selectClientsSearchQuery);

  // Load clients on mount
  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchClients());
  };

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleAddClient = () => {
    navigation.navigate('AddEditClient', {});
  };

  const handleClientPress = (client: Client) => {
    navigation.navigate('ClientDetails', { clientId: client.id });
  };

  const renderClient = ({ item }: { item: Client }) => (
    <ClientCard
      client={item}
      onPress={() => handleClientPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
        {searchQuery ? 'No clients found matching your search.' : 'No clients yet. Add your first client to get started.'}
      </Paragraph>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search clients..."
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

      {loading && clients.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Paragraph style={styles.loadingText}>Loading clients...</Paragraph>
        </View>
      ) : (
        <FlatList
          data={clients}
          renderItem={renderClient}
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
        onPress={handleAddClient}
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

export default ClientsScreen;
