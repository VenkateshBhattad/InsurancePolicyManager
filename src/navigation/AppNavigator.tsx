/**
 * Main App Navigator
 * Handles navigation structure and routing
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import PoliciesScreen from '../screens/policies/PoliciesScreen';
import ClientsScreen from '../screens/clients/ClientsScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import PolicyDetailsScreen from '../screens/policies/PolicyDetailsScreen';
import AddEditPolicyScreen from '../screens/policies/AddEditPolicyScreen';
import ClientDetailsScreen from '../screens/clients/ClientDetailsScreen';
import AddEditClientScreen from '../screens/clients/AddEditClientScreen';

// Import types
import { RootStackParamList, MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Policies':
              iconName = 'description';
              break;
            case 'Clients':
              iconName = 'people';
              break;
            case 'Calendar':
              iconName = 'event';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'help';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#ccc',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#ccc',
        },
        headerTitleStyle: {
          color: '#000',
          fontSize: 20,
          fontWeight: '600',
        },
        headerTintColor: '#000',
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerTitle: 'Insurance Manager',
        }}
      />
      <Tab.Screen
        name="Policies"
        component={PoliciesScreen}
        options={{
          title: 'Policies',
          headerTitle: 'Policies',
        }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientsScreen}
        options={{
          title: 'Clients',
          headerTitle: 'Clients',
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: 'Calendar',
          headerTitle: 'Renewal Calendar',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
const RootStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#ccc',
        },
        headerTitleStyle: {
          color: '#000',
          fontSize: 18,
          fontWeight: '600',
        },
        headerTintColor: '#000',
        cardStyle: {
          backgroundColor: '#fff',
        },
      }}
    >
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PolicyDetails"
        component={PolicyDetailsScreen}
        options={{
          title: 'Policy Details',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="AddEditPolicy"
        component={AddEditPolicyScreen}
        options={({ route }) => ({
          title: route.params?.policyId ? 'Edit Policy' : 'Add Policy',
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name="ClientDetails"
        component={ClientDetailsScreen}
        options={{
          title: 'Client Details',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="AddEditClient"
        component={AddEditClientScreen}
        options={({ route }) => ({
          title: route.params?.clientId ? 'Edit Client' : 'Add Client',
          headerBackTitleVisible: false,
        })}
      />
    </Stack.Navigator>
  );
};

// Main App Navigator Component
const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: '#1976d2',
          background: '#fff',
          card: '#fff',
          text: '#000',
          border: '#ccc',
          notification: '#f44336',
        },
      }}
    >
      <RootStackNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
