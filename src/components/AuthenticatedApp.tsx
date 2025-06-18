import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import SimpleAppNavigator from '../navigation/SimpleAppNavigator';
import dataSyncService from '../services/dataSyncService';

const AuthenticatedApp: React.FC = () => {
  const { user, signOut, getAccessToken } = useAuth();
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncMessage, setSyncMessage] = useState('Syncing data...');

  useEffect(() => {
    performInitialSync();
  }, []);

  const performInitialSync = async () => {
    try {
      if (!user?.email) {
        setIsSyncing(false);
        return;
      }

      setSyncMessage('Connecting to Google Sheets...');
      const accessToken = await getAccessToken();

      if (!accessToken) {
        setIsSyncing(false);
        return;
      }

      setSyncMessage('Syncing your data...');
      const result = await dataSyncService.syncOnStartup(accessToken, user.email);

      if (result.success) {
        console.log('Sync completed:', result.message);
        if (result.clientsImported || result.policiesImported) {
          Alert.alert(
            'Data Imported',
            `Successfully imported your data from Google Sheets:\n• ${result.clientsImported || 0} clients\n• ${result.policiesImported || 0} policies`,
            [{ text: 'OK' }]
          );
        } else if (result.clientsExported || result.policiesExported) {
          console.log(`Data exported: ${result.clientsExported} clients, ${result.policiesExported} policies`);
        }
      } else {
        console.error('Sync failed:', result.message);
        Alert.alert(
          'Sync Warning',
          `Data sync encountered an issue:\n${result.message}\n\nYou can continue using the app with local data.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error during initial sync:', error);
      Alert.alert(
        'Sync Error',
        'Failed to sync with Google Sheets. You can continue using the app with local data.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  if (isSyncing) {
    return (
      <View style={styles.syncContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.syncMessage}>{syncMessage}</Text>
        <Text style={styles.syncSubtext}>Setting up your cloud backup...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* User Header */}
      <SafeAreaView edges={['top']} style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitial}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Main App */}
      <SimpleAppNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  userHeader: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  signOutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  syncContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    paddingHorizontal: 32,
  },
  syncMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  syncSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AuthenticatedApp;
