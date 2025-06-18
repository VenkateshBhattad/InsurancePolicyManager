/**
 * Add/Edit Policy Screen
 * Form for creating or editing policies
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
  Menu,
  Divider,
  Chip,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Redux imports
import { useAppDispatch, useAppSelector } from '../../store';
import {
  createPolicy,
  updatePolicy,
  fetchPolicyById,
  selectSelectedPolicy,
  selectPoliciesLoading,
  selectPoliciesError,
} from '../../store/slices/policiesSlice';
import {
  fetchClients,
  selectAllClients,
} from '../../store/slices/clientsSlice';

// Types
import { RootStackParamList, PolicyFormData, PolicyType, PolicyStatus } from '../../types';

// Validation schema
const policySchema = yup.object().shape({
  policyNumber: yup.string().required('Policy number is required').min(3, 'Policy number must be at least 3 characters'),
  clientId: yup.string().required('Client is required'),
  policyType: yup.string().oneOf(Object.values(PolicyType)).required('Policy type is required'),
  premiumAmount: yup.string().required('Premium amount is required').matches(/^\d+(\.\d{1,2})?$/, 'Invalid premium amount'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().required('End date is required').min(yup.ref('startDate'), 'End date must be after start date'),
  status: yup.string().oneOf(Object.values(PolicyStatus)).required('Status is required'),
  insuranceCompany: yup.string().required('Insurance company is required').min(2, 'Insurance company must be at least 2 characters'),
  agentNotes: yup.string().optional(),
});

type AddEditPolicyRouteProp = RouteProp<RootStackParamList, 'AddEditPolicy'>;
type AddEditPolicyNavigationProp = StackNavigationProp<RootStackParamList>;

interface AddEditPolicyScreenProps {
  route: AddEditPolicyRouteProp;
}

const AddEditPolicyScreen: React.FC<AddEditPolicyScreenProps> = ({ route }) => {
  const theme = useTheme();
  const navigation = useNavigation<AddEditPolicyNavigationProp>();
  const dispatch = useAppDispatch();

  const { policyId, clientId } = route.params;
  const isEditing = !!policyId;

  // Local state for dropdowns
  const [clientMenuVisible, setClientMenuVisible] = useState(false);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  // Redux state
  const selectedPolicy = useAppSelector(selectSelectedPolicy);
  const loading = useAppSelector(selectPoliciesLoading);
  const error = useAppSelector(selectPoliciesError);
  const clients = useAppSelector(selectAllClients);

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm<PolicyFormData>({
    resolver: yupResolver(policySchema),
    mode: 'onChange',
    defaultValues: {
      policyNumber: '',
      clientId: clientId || '',
      policyType: PolicyType.AUTO,
      premiumAmount: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      status: PolicyStatus.ACTIVE,
      insuranceCompany: '',
      agentNotes: '',
    },
  });

  const watchedClientId = watch('clientId');
  const watchedPolicyType = watch('policyType');
  const watchedStatus = watch('status');

  // Load data on mount
  useEffect(() => {
    dispatch(fetchClients());
    if (isEditing && policyId) {
      dispatch(fetchPolicyById(policyId));
    }
  }, [dispatch, isEditing, policyId]);

  // Populate form when policy data is loaded
  useEffect(() => {
    if (isEditing && selectedPolicy) {
      setValue('policyNumber', selectedPolicy.policyNumber);
      setValue('clientId', selectedPolicy.clientId);
      setValue('policyType', selectedPolicy.policyType);
      setValue('premiumAmount', selectedPolicy.premiumAmount.toString());
      setValue('startDate', new Date(selectedPolicy.startDate));
      setValue('endDate', new Date(selectedPolicy.endDate));
      setValue('status', selectedPolicy.status);
      setValue('insuranceCompany', selectedPolicy.insuranceCompany);
      setValue('agentNotes', selectedPolicy.agentNotes || '');
    }
  }, [isEditing, selectedPolicy, setValue]);

  const onSubmit = async (data: PolicyFormData) => {
    try {
      const policyData = {
        policyNumber: data.policyNumber.trim(),
        clientId: data.clientId,
        policyType: data.policyType,
        premiumAmount: parseFloat(data.premiumAmount),
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        status: data.status,
        insuranceCompany: data.insuranceCompany.trim(),
        agentNotes: data.agentNotes?.trim() || undefined,
      };

      if (isEditing && policyId) {
        await dispatch(updatePolicy({ policyId, updates: policyData })).unwrap();
        Alert.alert('Success', 'Policy updated successfully');
      } else {
        await dispatch(createPolicy(policyData)).unwrap();
        Alert.alert('Success', 'Policy created successfully');
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save policy. Please try again.');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Select Client';
  };

  const getPolicyTypeLabel = (type: PolicyType) => {
    return type.charAt(0).toUpperCase() + type.slice(1) + ' Insurance';
  };

  const getStatusLabel = (status: PolicyStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={[styles.title, { color: theme.colors.onSurface }]}>
            {isEditing ? 'Edit Policy' : 'Add New Policy'}
          </Title>

          {/* Policy Number */}
          <Controller
            control={control}
            name="policyNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Policy Number *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.policyNumber}
                  mode="outlined"
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.policyNumber}>
                  {errors.policyNumber?.message}
                </HelperText>
              </View>
            )}
          />

          {/* Client Selection */}
          <Controller
            control={control}
            name="clientId"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <Menu
                  visible={clientMenuVisible}
                  onDismiss={() => setClientMenuVisible(false)}
                  anchor={
                    <TextInput
                      label="Client *"
                      value={getClientName(value)}
                      onFocus={() => setClientMenuVisible(true)}
                      error={!!errors.clientId}
                      mode="outlined"
                      style={styles.input}
                      right={<TextInput.Icon icon="chevron-down" />}
                      editable={false}
                    />
                  }
                >
                  {clients.map((client) => (
                    <Menu.Item
                      key={client.id}
                      onPress={() => {
                        onChange(client.id);
                        setClientMenuVisible(false);
                      }}
                      title={`${client.firstName} ${client.lastName}`}
                      leadingIcon="account"
                    />
                  ))}
                </Menu>
                <HelperText type="error" visible={!!errors.clientId}>
                  {errors.clientId?.message}
                </HelperText>
              </View>
            )}
          />

          {/* Policy Type */}
          <Controller
            control={control}
            name="policyType"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <Menu
                  visible={typeMenuVisible}
                  onDismiss={() => setTypeMenuVisible(false)}
                  anchor={
                    <TextInput
                      label="Policy Type *"
                      value={getPolicyTypeLabel(value)}
                      onFocus={() => setTypeMenuVisible(true)}
                      error={!!errors.policyType}
                      mode="outlined"
                      style={styles.input}
                      right={<TextInput.Icon icon="chevron-down" />}
                      editable={false}
                    />
                  }
                >
                  {Object.values(PolicyType).map((type) => (
                    <Menu.Item
                      key={type}
                      onPress={() => {
                        onChange(type);
                        setTypeMenuVisible(false);
                      }}
                      title={getPolicyTypeLabel(type)}
                      leadingIcon="shield"
                    />
                  ))}
                </Menu>
                <HelperText type="error" visible={!!errors.policyType}>
                  {errors.policyType?.message}
                </HelperText>
              </View>
            )}
          />

          {/* Premium Amount */}
          <Controller
            control={control}
            name="premiumAmount"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Premium Amount *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.premiumAmount}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  left={<TextInput.Icon icon="currency-usd" />}
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.premiumAmount}>
                  {errors.premiumAmount?.message}
                </HelperText>
              </View>
            )}
          />

          {/* Insurance Company */}
          <Controller
            control={control}
            name="insuranceCompany"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Insurance Company *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.insuranceCompany}
                  mode="outlined"
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.insuranceCompany}>
                  {errors.insuranceCompany?.message}
                </HelperText>
              </View>
            )}
          />

          {/* Status */}
          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <Menu
                  visible={statusMenuVisible}
                  onDismiss={() => setStatusMenuVisible(false)}
                  anchor={
                    <TextInput
                      label="Status *"
                      value={getStatusLabel(value)}
                      onFocus={() => setStatusMenuVisible(true)}
                      error={!!errors.status}
                      mode="outlined"
                      style={styles.input}
                      right={<TextInput.Icon icon="chevron-down" />}
                      editable={false}
                    />
                  }
                >
                  {Object.values(PolicyStatus).map((status) => (
                    <Menu.Item
                      key={status}
                      onPress={() => {
                        onChange(status);
                        setStatusMenuVisible(false);
                      }}
                      title={getStatusLabel(status)}
                      leadingIcon="check-circle"
                    />
                  ))}
                </Menu>
                <HelperText type="error" visible={!!errors.status}>
                  {errors.status?.message}
                </HelperText>
              </View>
            )}
          />

          {/* Start Date - Simplified for now */}
          <Controller
            control={control}
            name="startDate"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Start Date (YYYY-MM-DD) *"
                  value={value.toISOString().split('T')[0]}
                  onChangeText={(text) => {
                    const date = new Date(text);
                    if (!isNaN(date.getTime())) {
                      onChange(date);
                    }
                  }}
                  error={!!errors.startDate}
                  mode="outlined"
                  placeholder="YYYY-MM-DD"
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.startDate}>
                  {errors.startDate?.message}
                </HelperText>
              </View>
            )}
          />

          {/* End Date - Simplified for now */}
          <Controller
            control={control}
            name="endDate"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="End Date (YYYY-MM-DD) *"
                  value={value.toISOString().split('T')[0]}
                  onChangeText={(text) => {
                    const date = new Date(text);
                    if (!isNaN(date.getTime())) {
                      onChange(date);
                    }
                  }}
                  error={!!errors.endDate}
                  mode="outlined"
                  placeholder="YYYY-MM-DD"
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.endDate}>
                  {errors.endDate?.message}
                </HelperText>
              </View>
            )}
          />

          {/* Agent Notes */}
          <Controller
            control={control}
            name="agentNotes"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Agent Notes"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  style={styles.input}
                />
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

export default AddEditPolicyScreen;
