/**
 * Client Details Screen
 * Shows detailed information about a specific client
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Paragraph, useTheme } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

type ClientDetailsRouteProp = RouteProp<RootStackParamList, 'ClientDetails'>;

interface ClientDetailsScreenProps {
  route: ClientDetailsRouteProp;
}

const ClientDetailsScreen: React.FC<ClientDetailsScreenProps> = ({ route }) => {
  const theme = useTheme();
  const { clientId } = route.params;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Title style={{ color: theme.colors.onSurface }}>
          Client Details
        </Title>
        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
          Client ID: {clientId}
        </Paragraph>
        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
          Detailed client view will be implemented here.
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

export default ClientDetailsScreen;
