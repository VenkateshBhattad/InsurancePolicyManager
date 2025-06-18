/**
 * Error Message Component
 * Displays error messages with retry functionality
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Card, Title, Paragraph, Button, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
  showIcon?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  style,
  showIcon = true,
}) => {
  const theme = useTheme();

  return (
    <Card style={[styles.container, { backgroundColor: theme.colors.errorContainer }, style]}>
      <Card.Content style={styles.content}>
        {showIcon && (
          <MaterialIcons
            name="error-outline"
            size={32}
            color={theme.colors.onErrorContainer}
            style={styles.icon}
          />
        )}
        <Title style={[styles.title, { color: theme.colors.onErrorContainer }]}>
          Something went wrong
        </Title>
        <Paragraph style={[styles.message, { color: theme.colors.onErrorContainer }]}>
          {message}
        </Paragraph>
        {onRetry && (
          <Button
            mode="contained"
            onPress={onRetry}
            style={[styles.retryButton, { backgroundColor: theme.colors.error }]}
            labelStyle={{ color: theme.colors.onError }}
          >
            Try Again
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    elevation: 2,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
});

export default ErrorMessage;
