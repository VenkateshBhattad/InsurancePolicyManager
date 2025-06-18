/**
 * Policy Details Screen
 * Shows detailed information about a specific policy
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Paragraph, useTheme } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

type PolicyDetailsRouteProp = RouteProp<RootStackParamList, 'PolicyDetails'>;

interface PolicyDetailsScreenProps {
  route: PolicyDetailsRouteProp;
}

const PolicyDetailsScreen: React.FC<PolicyDetailsScreenProps> = ({ route }) => {
  const theme = useTheme();
  const { policyId } = route.params;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Title style={{ color: theme.colors.onSurface }}>
          Policy Details
        </Title>
        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
          Policy ID: {policyId}
        </Paragraph>
        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
          Detailed policy view will be implemented here.
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

export default PolicyDetailsScreen;
