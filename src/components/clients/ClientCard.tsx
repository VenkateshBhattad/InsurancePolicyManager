/**
 * Client Card Component
 * Displays client information in a card format
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Avatar, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

// Types
import { Client } from '../../types';

interface ClientCardProps {
  client: Client;
  onPress?: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onPress }) => {
  const theme = useTheme();

  const getInitials = () => {
    return `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <Avatar.Text
              size={48}
              label={getInitials()}
              style={{ backgroundColor: theme.colors.primaryContainer }}
              labelStyle={{ color: theme.colors.onPrimaryContainer }}
            />
            <View style={styles.clientInfo}>
              <Title style={[styles.name, { color: theme.colors.onSurface }]}>
                {client.firstName} {client.lastName}
              </Title>
              <View style={styles.contactInfo}>
                <View style={styles.contactRow}>
                  <MaterialIcons
                    name="email"
                    size={16}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Paragraph style={[styles.contactText, { color: theme.colors.onSurfaceVariant }]}>
                    {client.email}
                  </Paragraph>
                </View>
                <View style={styles.contactRow}>
                  <MaterialIcons
                    name="phone"
                    size={16}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Paragraph style={[styles.contactText, { color: theme.colors.onSurfaceVariant }]}>
                    {client.phone}
                  </Paragraph>
                </View>
              </View>
            </View>
          </View>
          
          {client.address && (
            <View style={styles.addressContainer}>
              <MaterialIcons
                name="location-on"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Paragraph
                style={[styles.address, { color: theme.colors.onSurfaceVariant }]}
                numberOfLines={2}
              >
                {client.address}
              </Paragraph>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  content: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  contactInfo: {
    gap: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    flex: 1,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  address: {
    fontSize: 13,
    flex: 1,
  },
});

export default ClientCard;
