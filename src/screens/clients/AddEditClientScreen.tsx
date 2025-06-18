/**
 * Add/Edit Client Screen
 * Form for creating or editing clients
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  useTheme,
  HelperText,
  Card,
  Title,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Redux imports
import { useAppDispatch, useAppSelector } from '../../store';
import {
  createClient,
  updateClient,
  fetchClientById,
  selectSelectedClient,
  selectClientsLoading,
  selectClientsError,
} from '../../store/slices/clientsSlice';

// Types
import { RootStackParamList, ClientFormData } from '../../types';

// Validation schema
const clientSchema = yup.object().shape({
  firstName: yup.string().required('First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().required('Phone number is required').min(10, 'Phone number must be at least 10 digits'),
  address: yup.string().required('Address is required').min(5, 'Address must be at least 5 characters'),
  dateOfBirth: yup.date().required('Date of birth is required').max(new Date(), 'Date of birth cannot be in the future'),
});

type AddEditClientRouteProp = RouteProp<RootStackParamList, 'AddEditClient'>;
type AddEditClientNavigationProp = StackNavigationProp<RootStackParamList>;

interface AddEditClientScreenProps {
  route: AddEditClientRouteProp;
}

const AddEditClientScreen: React.FC<AddEditClientScreenProps> = ({ route }) => {
  const theme = useTheme();
  const navigation = useNavigation<AddEditClientNavigationProp>();
  const dispatch = useAppDispatch();

  const { clientId } = route.params;
  const isEditing = !!clientId;

  // Redux state
  const selectedClient = useAppSelector(selectSelectedClient);
  const loading = useAppSelector(selectClientsLoading);
  const error = useAppSelector(selectClientsError);

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<ClientFormData>({
    resolver: yupResolver(clientSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: new Date(),
    },
  });

  // Load client data if editing
  useEffect(() => {
    if (isEditing && clientId) {
      dispatch(fetchClientById(clientId));
    }
  }, [dispatch, isEditing, clientId]);

  // Populate form when client data is loaded
  useEffect(() => {
    if (isEditing && selectedClient) {
      setValue('firstName', selectedClient.firstName);
      setValue('lastName', selectedClient.lastName);
      setValue('email', selectedClient.email);
      setValue('phone', selectedClient.phone);
      setValue('address', selectedClient.address);
      setValue('dateOfBirth', new Date(selectedClient.dateOfBirth));
    }
  }, [isEditing, selectedClient, setValue]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      const clientData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        dateOfBirth: data.dateOfBirth.toISOString(),
      };

      if (isEditing && clientId) {
        await dispatch(updateClient({ clientId, updates: clientData })).unwrap();
        Alert.alert('Success', 'Client updated successfully');
      } else {
        await dispatch(createClient(clientData)).unwrap();
        Alert.alert('Success', 'Client created successfully');
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save client. Please try again.');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={[styles.title, { color: theme.colors.onSurface }]}>
            {isEditing ? 'Edit Client' : 'Add New Client'}
          </Title>

          {/* First Name */}
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="First Name *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.firstName}
                  mode="outlined"
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.firstName}>
                  {errors.firstName?.message}
                </HelperText>
              </View>
            )}
          />

          {/* Last Name */}
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Last Name *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.lastName}
                  mode="outlined"
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.lastName}>
                  {errors.lastName?.message}
                </HelperText>
              </View>
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Email *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.email}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.email}>
                  {errors.email?.message}
                </HelperText>
              </View>
            )}
          />

          {/* Phone */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Phone Number *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.phone}
                  mode="outlined"
                  keyboardType="phone-pad"
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.phone}>
                  {errors.phone?.message}
                </HelperText>
              </View>
            )}
          />

          {/* Address */}
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Address *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.address}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.address}>
                  {errors.address?.message}
                </HelperText>
              </View>
            )}
          />

          {/* Date of Birth - For now, we'll use a simple text input */}
          {/* In a full implementation, you'd use a date picker */}
          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Date of Birth (YYYY-MM-DD) *"
                  value={value.toISOString().split('T')[0]}
                  onChangeText={(text) => {
                    const date = new Date(text);
                    if (!isNaN(date.getTime())) {
                      onChange(date);
                    }
                  }}
                  onBlur={onBlur}
                  error={!!errors.dateOfBirth}
                  mode="outlined"
                  placeholder="YYYY-MM-DD"
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.dateOfBirth}>
                  {errors.dateOfBirth?.message}
                </HelperText>
              </View>
            )}
          />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={[styles.button, styles.cancelButton]}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={[styles.button, styles.saveButton]}
              disabled={!isValid || loading}
              loading={loading}
            >
              {isEditing ? 'Update' : 'Save'}
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    marginRight: 6,
  },
  saveButton: {
    marginLeft: 6,
  },
});

export default AddEditClientScreen;
