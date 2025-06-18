/**
 * Dashboard Screen
 * Main overview screen showing statistics and upcoming renewals
 */

import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Redux imports
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchDashboardData,
  selectDashboardStats,
  selectUpcomingRenewals,
  selectDashboardLoading,
  selectDashboardError,
} from '../../store/slices/dashboardSlice';

// Components
import StatsCard from '../../components/dashboard/StatsCard';
import RenewalCard from '../../components/dashboard/RenewalCard';
import ErrorMessage from '../../components/common/ErrorMessage';

// Types
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

type DashboardNavigationProp = StackNavigationProp<RootStackParamList>;

const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<DashboardNavigationProp>();
  const dispatch = useAppDispatch();

  // Redux state
  const stats = useAppSelector(selectDashboardStats);
  const upcomingRenewals = useAppSelector(selectUpcomingRenewals);
  const loading = useAppSelector(selectDashboardLoading);
  const error = useAppSelector(selectDashboardError);

  // Load dashboard data on mount
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDashboardData());
  };

  const handleAddPolicy = () => {
    navigation.navigate('AddEditPolicy', {});
  };

  const handleAddClient = () => {
    navigation.navigate('AddEditClient', {});
  };

  const handleViewPolicies = () => {
    navigation.navigate('Main', { screen: 'Policies' });
  };

  const handleViewClients = () => {
    navigation.navigate('Main', { screen: 'Clients' });
  };

  const handleViewCalendar = () => {
    navigation.navigate('Main', { screen: 'Calendar' });
  };

  if (loading && !stats.totalPolicies) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Paragraph style={styles.loadingText}>Loading dashboard...</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
    >
      {error && (
        <ErrorMessage
          message={error.message}
          onRetry={handleRefresh}
          style={styles.errorContainer}
        />
      )}

      {/* Welcome Section */}
      <Card style={[styles.welcomeCard, { backgroundColor: '#d3e3fd' }]}>
        <Card.Content>
          <Title style={{ color: '#001c38' }}>
            Welcome to Insurance Manager
          </Title>
          <Paragraph style={{ color: '#001c38' }}>
            Manage your clients and policies efficiently
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Quick Actions</Title>
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              icon="plus"
              onPress={handleAddPolicy}
              style={styles.actionButton}
            >
              Add Policy
            </Button>
            <Button
              mode="outlined"
              icon="account-plus"
              onPress={handleAddClient}
              style={styles.actionButton}
            >
              Add Client
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Statistics Overview */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Overview</Title>
          <View style={styles.statsGrid}>
            <StatsCard
              title="Total Policies"
              value={stats.totalPolicies}
              icon="description"
              color={theme.colors.primary}
              onPress={handleViewPolicies}
            />
            <StatsCard
              title="Active Policies"
              value={stats.activePolicies}
              icon="check-circle"
              color={theme.colors.success}
              onPress={handleViewPolicies}
            />
            <StatsCard
              title="Total Clients"
              value={stats.totalClients}
              icon="people"
              color={theme.colors.secondary}
              onPress={handleViewClients}
            />
            <StatsCard
              title="Upcoming Renewals"
              value={stats.upcomingRenewals}
              icon="event"
              color={stats.upcomingRenewals > 0 ? theme.colors.warning : theme.colors.outline}
              onPress={handleViewCalendar}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Premium Value */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Total Premium Value</Title>
          <View style={styles.premiumContainer}>
            <MaterialIcons
              name="attach-money"
              size={32}
              color={theme.colors.success}
            />
            <Title style={[styles.premiumValue, { color: theme.colors.success }]}>
              ${stats.totalPremiumValue.toLocaleString()}
            </Title>
          </View>
        </Card.Content>
      </Card>

      {/* Upcoming Renewals */}
      {upcomingRenewals.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title>Upcoming Renewals</Title>
              <Chip
                icon="event"
                mode="outlined"
                compact
                style={{ backgroundColor: theme.colors.warningContainer }}
              >
                {upcomingRenewals.length}
              </Chip>
            </View>
            {upcomingRenewals.slice(0, 5).map((policy) => (
              <RenewalCard
                key={policy.id}
                policy={policy}
                onPress={() => navigation.navigate('PolicyDetails', { policyId: policy.id })}
              />
            ))}
            {upcomingRenewals.length > 5 && (
              <Button
                mode="text"
                onPress={handleViewCalendar}
                style={styles.viewAllButton}
              >
                View All Renewals
              </Button>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Empty State */}
      {stats.totalPolicies === 0 && (
        <Card style={styles.card}>
          <Card.Content style={styles.emptyState}>
            <MaterialIcons
              name="description"
              size={64}
              color={theme.colors.outline}
            />
            <Title style={{ color: theme.colors.onSurfaceVariant }}>
              No Policies Yet
            </Title>
            <Paragraph style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Start by adding your first client and policy to get started with managing your insurance business.
            </Paragraph>
            <Button
              mode="contained"
              icon="plus"
              onPress={handleAddPolicy}
              style={styles.emptyStateButton}
            >
              Add Your First Policy
            </Button>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    marginBottom: 16,
  },
  welcomeCard: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  premiumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  premiumValue: {
    marginLeft: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateButton: {
    marginTop: 16,
  },
});

export default DashboardScreen;
