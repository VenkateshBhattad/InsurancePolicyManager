/**
 * Settings Screen
 * App settings and preferences
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Paragraph, useTheme } from 'react-native-paper';

const SettingsScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Title style={{ color: theme.colors.onSurface }}>
          Settings
        </Title>
        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
          Settings interface will be implemented here for notifications, sync, and app preferences.
        </Paragraph>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
});

export default SettingsScreen;
