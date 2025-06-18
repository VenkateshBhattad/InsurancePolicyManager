/**
 * Policy Card Component
 * Displays policy information in a card format
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Chip, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

// Types
import { Policy, PolicyStatus } from '../../types';
import { statusColors, policyTypeColors } from '../../constants/theme';

interface PolicyCardProps {
  policy: Policy;
  onPress?: () => void;
}

const PolicyCard: React.FC<PolicyCardProps> = ({ policy, onPress }) => {
  const theme = useTheme();

  const getStatusColor = () => {
    const colors = statusColors[policy.status];
    return theme.dark ? colors.dark : colors.light;
  };

  const getStatusIcon = () => {
    switch (policy.status) {
      case PolicyStatus.ACTIVE:
        return 'check-circle';
      case PolicyStatus.EXPIRED:
        return 'cancel';
      case PolicyStatus.PENDING:
        return 'schedule';
      case PolicyStatus.CANCELLED:
        return 'block';
      default:
        return 'help';
    }
  };

  const getPolicyTypeColor = () => {
    return policyTypeColors[policy.policyType] || policyTypeColors.other;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <View style={styles.policyInfo}>
              <Title style={[styles.policyNumber, { color: theme.colors.onSurface }]}>
                {policy.policyNumber}
              </Title>
              <Paragraph style={[styles.company, { color: theme.colors.onSurfaceVariant }]}>
                {policy.insuranceCompany}
              </Paragraph>
            </View>
            <Chip
              icon={getStatusIcon()}
              mode="outlined"
              compact
              style={{
                backgroundColor: getStatusColor() + '20',
                borderColor: getStatusColor(),
              }}
              textStyle={{ color: getStatusColor(), fontSize: 12 }}
            >
              {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
            </Chip>
          </View>
          
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <MaterialIcons
                name="category"
                size={16}
                color={getPolicyTypeColor()}
              />
              <Paragraph style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                {policy.policyType.charAt(0).toUpperCase() + policy.policyType.slice(1)} Insurance
              </Paragraph>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons
                name="attach-money"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Paragraph style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                ${policy.premiumAmount.toLocaleString()} premium
              </Paragraph>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons
                name="event"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Paragraph style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                {format(parseISO(policy.startDate), 'MMM dd, yyyy')} - {format(parseISO(policy.endDate), 'MMM dd, yyyy')}
              </Paragraph>
            </View>
          </View>

          {policy.agentNotes && (
            <View style={styles.notesContainer}>
              <MaterialIcons
                name="note"
                size={14}
                color={theme.colors.onSurfaceVariant}
              />
              <Paragraph
                style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}
                numberOfLines={2}
              >
                {policy.agentNotes}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  policyInfo: {
    flex: 1,
    marginRight: 12,
  },
  policyNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  company: {
    fontSize: 14,
  },
  details: {
    gap: 6,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    flex: 1,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  notes: {
    fontSize: 12,
    flex: 1,
    fontStyle: 'italic',
  },
});

export default PolicyCard;
