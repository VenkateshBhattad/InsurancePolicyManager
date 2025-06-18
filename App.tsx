/**
 * Insurance Policy Manager App
 * Main entry point for the application
 */

import React, { useEffect, useState } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Store and services
import { store } from './src/store';
import databaseService from './src/services/database';

// Authentication
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Components
import LoadingScreen from './src/components/common/LoadingScreen';
import LoginScreen from './src/screens/LoginScreen';
import AuthenticatedApp from './src/components/AuthenticatedApp';

// Main App Component with Authentication
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' }}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return isAuthenticated ? <AuthenticatedApp /> : <LoginScreen />;
};

// Root App Component
export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database only on mobile platforms
      if (Platform.OS !== 'web') {
        await databaseService.initialize();
      }

      console.log('App initialized successfully');
    } catch (error) {
      console.error('App initialization failed:', error);
    } finally {
      setIsAppLoading(false);
    }
  };

  if (isAppLoading) {
    return (
      <PaperProvider theme={DefaultTheme}>
        <LoadingScreen />
      </PaperProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ReduxProvider store={store}>
          <PaperProvider theme={DefaultTheme}>
            <AppContent />
            <StatusBar style="light" />
          </PaperProvider>
        </ReduxProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}


