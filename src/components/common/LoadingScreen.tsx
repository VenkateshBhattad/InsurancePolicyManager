/**
 * Loading Screen Component
 * Shows loading indicator during app initialization
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Title, useTheme } from 'react-native-paper';

const LoadingScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Title style={[styles.title, { color: theme.colors.onBackground }]}>
        Insurance Policy Manager
      </Title>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: '600',
  },
});

export default LoadingScreen;
