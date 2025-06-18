/**
 * Calendar Screen
 * Shows renewal calendar and upcoming renewals
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Paragraph, useTheme } from 'react-native-paper';

const CalendarScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Title style={{ color: theme.colors.onSurface }}>
          Renewal Calendar
        </Title>
        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
          Calendar view will be implemented here to show upcoming policy renewals.
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

export default CalendarScreen;
