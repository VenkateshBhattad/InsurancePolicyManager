/**
 * Stats Card Component
 * Displays a statistic with icon and value
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

interface StatsCardProps {
  title: string;
  value: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  onPress?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  onPress,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Card style={[styles.card, { backgroundColor: '#fff' }]}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <MaterialIcons name={icon} size={24} color={color} />
            <Title style={[styles.value, { color: '#000' }]}>
              {value.toLocaleString()}
            </Title>
          </View>
          <Paragraph style={[styles.title, { color: '#666' }]}>
            {title}
          </Paragraph>
        </Card.Content>
      </Card>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 150,
  },
  card: {
    elevation: 2,
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default StatsCard;
