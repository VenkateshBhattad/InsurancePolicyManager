/**
 * Renewal Card Component
 * Displays policy renewal information
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Chip, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { format, differenceInDays, parseISO } from 'date-fns';

// Types
import { Policy } from '../../types';

interface RenewalCardProps {
  policy: Policy;
  onPress?: () => void;
}

const RenewalCard: React.FC<RenewalCardProps> = ({ policy, onPress }) => {
  const theme = useTheme();

  const endDate = parseISO(policy.endDate);
  const daysUntilExpiry = differenceInDays(endDate, new Date());
  
  const getUrgencyColor = () => {
    if (daysUntilExpiry <= 7) return theme.colors.error;
    if (daysUntilExpiry <= 15) return theme.colors.warning;
    return theme.colors.info;
  };

  const getUrgencyText = () => {
    if (daysUntilExpiry <= 0) return 'Expired';
    if (daysUntilExpiry === 1) return '1 day left';
    return `${daysUntilExpiry} days left`;
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
              icon="event"
              mode="outlined"
              compact
              style={{
                backgroundColor: getUrgencyColor() + '20',
                borderColor: getUrgencyColor(),
              }}
              textStyle={{ color: getUrgencyColor(), fontSize: 12 }}
            >
              {getUrgencyText()}
            </Chip>
          </View>
          
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <MaterialIcons
                name="category"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Paragraph style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                {policy.policyType.charAt(0).toUpperCase() + policy.policyType.slice(1)}
              </Paragraph>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons
                name="attach-money"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Paragraph style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                ${policy.premiumAmount.toLocaleString()}
              </Paragraph>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons
                name="event"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Paragraph style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                Expires {format(endDate, 'MMM dd, yyyy')}
              </Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    elevation: 1,
  },
  content: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  policyInfo: {
    flex: 1,
  },
  policyNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  company: {
    fontSize: 14,
  },
  details: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
  },
});

export default RenewalCard;
