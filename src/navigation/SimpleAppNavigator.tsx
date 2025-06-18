/**
 * Simple App Navigator
 * Working version that bypasses theme issues
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, TextInput, Platform, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Contacts from 'expo-contacts';
import DateTimePicker from '@react-native-community/datetimepicker';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { useAuth } from '../context/AuthContext';
import dataSyncService from '../services/dataSyncService';

// Simple App Navigator Component with working functionality
const SimpleAppNavigator: React.FC = () => {
  const { user, getAccessToken } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [clients, setClients] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form states
  const [showClientForm, setShowClientForm] = useState(false);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [showUpdatePolicyConfirm, setShowUpdatePolicyConfirm] = useState(false);
  const [pendingClientUpdate, setPendingClientUpdate] = useState<any>(null);

  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<'client' | 'policy'>('client');

  // Policy filter states
  const [policyFilter, setPolicyFilter] = useState('');
  const [showPolicyFilterPicker, setShowPolicyFilterPicker] = useState(false);

  // Client form data
  const [clientForm, setClientForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });

  // Policy form data
  const [policyForm, setPolicyForm] = useState(() => ({
    dateFrom: new Date(),
    dateTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    typeOfPolicy: '',
    policyNo: '',
    endorsementNo: '',
    premiumRs: '',
    sumInsured: '',
    location: '',
    remarks: '',
    clientPhoneNumber: ''
  }));

  // Date picker states
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);

  const showModal = (title: string, message: string) => {
    setModalContent({ title, message });
    setModalVisible(true);
  };

  const resetClientForm = () => {
    setClientForm({
      firstName: '',
      lastName: '',
      phoneNumber: ''
    });
  };

  const resetPolicyForm = () => {
    setPolicyForm({
      dateFrom: new Date(),
      dateTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      typeOfPolicy: '',
      policyNo: '',
      endorsementNo: '',
      premiumRs: '',
      sumInsured: '',
      location: '',
      remarks: '',
      clientPhoneNumber: ''
    });
  };

  // Contact picker states
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPickingForClient, setIsPickingForClient] = useState(true);

  const fetchFromContacts = async (forClientForm = true) => {
    try {
      if (Platform.OS === 'web') {
        showModal('Not Available on Web', 'Contact fetching is only available on mobile devices.\n\nPlease manually enter the details.');
        return;
      }

      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        showModal('Permission Required', 'Please grant contacts permission to fetch information from your contacts.');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        // Filter contacts that have both name and phone number
        const validContacts = data.filter(contact =>
          contact.name && contact.phoneNumbers && contact.phoneNumbers.length > 0
        );

        if (validContacts.length > 0) {
          setContacts(validContacts);
          setFilteredContacts(validContacts);
          setSearchQuery('');
          setIsPickingForClient(forClientForm);
          setShowContactPicker(true);
        } else {
          showModal('No Valid Contacts', 'No contacts found with both name and phone number.');
        }
      } else {
        showModal('No Contacts Found', 'No contacts found on your device.');
      }
    } catch (error) {
      showModal('Error', 'Failed to fetch contacts. Please enter details manually.');
    }
  };

  const selectContact = (contact: any) => {
    if (showPolicyFilterPicker) {
      // For policy filtering
      selectClientForFilter(contact);
    } else if (isPickingForClient) {
      // For client form
      setClientForm({
        firstName: contact.name.split(' ')[0] || '',
        lastName: contact.name.split(' ').slice(1).join(' ') || '',
        phoneNumber: contact.phoneNumbers[0].number || ''
      });
      setShowContactPicker(false);
      setSearchQuery('');
      showModal('Contact Selected!', `Selected: ${contact.name}\nPhone: ${contact.phoneNumbers[0].number}\n\nYou can edit the details before saving.`);
    } else {
      // For policy form client phone
      setPolicyForm({
        ...policyForm,
        clientPhoneNumber: contact.phoneNumbers[0].number || ''
      });
      setShowContactPicker(false);
      setSearchQuery('');
      showModal('Contact Selected!', `Selected: ${contact.name}\nPhone: ${contact.phoneNumbers[0].number}\n\nYou can edit the details before saving.`);
    }
  };

  const searchContacts = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(query.toLowerCase()) ||
        (contact.phoneNumbers[0]?.number || '').includes(query)
      );
      setFilteredContacts(filtered);
    }
  };

  const formatDate = (date: Date) => {
    if (!date || !(date instanceof Date)) {
      return new Date().toLocaleDateString('en-GB');
    }
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const onDateFromChange = (event: any, selectedDate?: Date) => {
    setShowDateFromPicker(false);
    if (selectedDate) {
      setPolicyForm({...policyForm, dateFrom: selectedDate});
    }
  };

  const onDateToChange = (event: any, selectedDate?: Date) => {
    setShowDateToPicker(false);
    if (selectedDate) {
      setPolicyForm({...policyForm, dateTo: selectedDate});
    }
  };

  const addClient = () => {
    setEditingClient(null);
    resetClientForm();
    setShowClientForm(true);
  };

  const editClient = (client: any) => {
    setEditingClient(client);
    setClientForm({
      firstName: client.firstName,
      lastName: client.lastName || '',
      phoneNumber: client.phoneNumber
    });
    setShowClientForm(true);
  };

  const confirmDeleteClient = (client: any) => {
    setDeleteTarget(client);
    setDeleteType('client');
    setShowDeleteConfirm(true);
  };

  const confirmDeletePolicy = (policy: any) => {
    setDeleteTarget(policy);
    setDeleteType('policy');
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (deleteType === 'client') {
      const linkedPolicies = getPoliciesForClient(deleteTarget);
      if (linkedPolicies.length > 0) {
        showModal('Cannot Delete Client', `Cannot delete ${deleteTarget.fullName} because they have ${linkedPolicies.length} linked policy(ies):\n\n${linkedPolicies.map(p => `• ${p.policyNo}`).join('\n')}\n\nPlease delete the policies first.`);
        setShowDeleteConfirm(false);
        return;
      }

      const updatedClients = clients.filter(c => c.id !== deleteTarget.id);
      setClients(updatedClients);
      showModal('Client Deleted', `Successfully deleted ${deleteTarget.fullName}`);
    } else {
      const updatedPolicies = policies.filter(p => p.id !== deleteTarget.id);
      setPolicies(updatedPolicies);
      const client = getClientForPolicy(deleteTarget);
      showModal('Policy Deleted', `Successfully deleted policy ${deleteTarget.policyNo}${client ? ` for ${client.fullName}` : ''}`);
    }

    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const submitClient = () => {
    if (!clientForm.firstName || !clientForm.phoneNumber) {
      showModal('Required Fields Missing', 'Please fill in all required fields:\n• First Name\n• Phone Number');
      return;
    }

    if (editingClient) {
      // Editing existing client
      // Check for duplicate phone number (excluding current client)
      const existingClient = clients.find(c => c.phoneNumber === clientForm.phoneNumber && c.id !== editingClient.id);
      if (existingClient) {
        showModal('Phone Number Already Exists', `Another client with phone number ${clientForm.phoneNumber} already exists:\n\n${existingClient.fullName}\n\nPlease use a different phone number.`);
        return;
      }

      const updatedClient = {
        ...editingClient,
        firstName: clientForm.firstName,
        lastName: clientForm.lastName,
        fullName: `${clientForm.firstName} ${clientForm.lastName}`,
        phoneNumber: clientForm.phoneNumber,
        updatedAt: new Date().toLocaleDateString()
      };

      // Check if phone number changed and if it's linked to policies
      const linkedPolicies = policies.filter(p => p.clientPhoneNumber === editingClient.phoneNumber);
      if (editingClient.phoneNumber !== clientForm.phoneNumber && linkedPolicies.length > 0) {
        // Phone number changed and has linked policies - ask for confirmation
        setPendingClientUpdate(updatedClient);
        setShowUpdatePolicyConfirm(true);
        return;
      }

      // Update client without policy updates
      const updatedClients = clients.map(c => c.id === editingClient.id ? updatedClient : c);
      setClients(updatedClients);
      setShowClientForm(false);
      setEditingClient(null);
      resetClientForm();
      showModal('Client Updated!', `Successfully updated ${updatedClient.fullName}\n\nPhone: ${updatedClient.phoneNumber}\nUpdated: ${updatedClient.updatedAt}`);
    } else {
      // Adding new client
      // Check for duplicate phone number
      const existingClient = clients.find(c => c.phoneNumber === clientForm.phoneNumber);
      if (existingClient) {
        showModal('Client Already Exists', `A client with phone number ${clientForm.phoneNumber} already exists:\n\n${existingClient.fullName}\nAdded: ${existingClient.createdAt}\n\nPlease use a different phone number or edit the existing client.`);
        return;
      }

      const newClient = {
        id: Date.now(),
        firstName: clientForm.firstName,
        lastName: clientForm.lastName,
        fullName: `${clientForm.firstName} ${clientForm.lastName}`,
        phoneNumber: clientForm.phoneNumber,
        createdAt: new Date().toLocaleDateString()
      };

      setClients([...clients, newClient]);
      setShowClientForm(false);
      resetClientForm();
      showModal('Client Added!', `Successfully added ${newClient.fullName}\n\nPhone: ${newClient.phoneNumber}\nAdded: ${newClient.createdAt}\n\nTotal Clients: ${clients.length + 1}`);
    }
  };

  // Helper function to get client for a policy
  const getClientForPolicy = (policy: any) => {
    return clients.find(c => c.phoneNumber === policy.clientPhoneNumber);
  };

  // Helper function to get policies for a client
  const getPoliciesForClient = (client: any) => {
    return policies.filter(p => p.clientPhoneNumber === client.phoneNumber);
  };

  const confirmUpdatePolicies = (updatePolicies: boolean) => {
    if (!pendingClientUpdate) return;

    const oldPhoneNumber = editingClient.phoneNumber;
    const newPhoneNumber = pendingClientUpdate.phoneNumber;

    // Update client
    const updatedClients = clients.map(c => c.id === editingClient.id ? pendingClientUpdate : c);
    setClients(updatedClients);

    if (updatePolicies) {
      // Update all linked policies with new phone number
      const updatedPolicies = policies.map(p =>
        p.clientPhoneNumber === oldPhoneNumber
          ? { ...p, clientPhoneNumber: newPhoneNumber, clientName: pendingClientUpdate.fullName }
          : p
      );
      setPolicies(updatedPolicies);

      const linkedPoliciesCount = policies.filter(p => p.clientPhoneNumber === oldPhoneNumber).length;
      showModal('Client and Policies Updated!', `Successfully updated ${pendingClientUpdate.fullName}\n\nPhone: ${pendingClientUpdate.phoneNumber}\nUpdated: ${pendingClientUpdate.updatedAt}\n\n${linkedPoliciesCount} linked policies were also updated with the new phone number.`);
    } else {
      showModal('Client Updated!', `Successfully updated ${pendingClientUpdate.fullName}\n\nPhone: ${pendingClientUpdate.phoneNumber}\nUpdated: ${pendingClientUpdate.updatedAt}\n\nNote: Linked policies still reference the old phone number.`);
    }

    setShowClientForm(false);
    setShowUpdatePolicyConfirm(false);
    setEditingClient(null);
    setPendingClientUpdate(null);
    resetClientForm();
  };

  const addPolicy = () => {
    setEditingPolicy(null);
    resetPolicyForm();
    setShowPolicyForm(true);
  };

  const editPolicy = (policy: any) => {
    setEditingPolicy(policy);
    setPolicyForm({
      dateFrom: new Date(policy.dateFrom),
      dateTo: new Date(policy.dateTo),
      typeOfPolicy: policy.typeOfPolicy,
      policyNo: policy.policyNo,
      endorsementNo: policy.endorsementNo,
      premiumRs: policy.premiumRs.toString(),
      sumInsured: policy.sumInsured.toString(),
      location: policy.location,
      remarks: policy.remarks,
      clientPhoneNumber: policy.clientPhoneNumber
    });
    setShowPolicyForm(true);
  };

  const submitPolicy = () => {
    if (!policyForm.dateTo || !policyForm.policyNo || !policyForm.premiumRs ||
        !policyForm.clientPhoneNumber) {
      showModal('Required Fields Missing', 'Please fill in all required fields:\n• Date Due\n• Policy No\n• Premium Rs\n• Client Phone Number');
      return;
    }

    let client = clients.find(c => c.phoneNumber === policyForm.clientPhoneNumber);

    // If client doesn't exist, create a new one
    if (!client) {
      const newClient = {
        id: Date.now() - 1, // Ensure different ID from policy
        firstName: 'New Client', // Default name, user can edit later
        lastName: '',
        fullName: 'New Client',
        phoneNumber: policyForm.clientPhoneNumber,
        createdAt: new Date().toLocaleDateString()
      };

      // Add the new client to the clients array
      const updatedClients = [...clients, newClient];
      setClients(updatedClients);
      client = newClient;
    }

    if (editingPolicy) {
      // Editing existing policy
      // Check for duplicate policy number (excluding current policy)
      const existingPolicy = policies.find(p => p.policyNo === policyForm.policyNo && p.id !== editingPolicy.id);
      if (existingPolicy) {
        showModal('Policy Number Already Exists', `Another policy with number ${policyForm.policyNo} already exists.\n\nPlease use a different policy number.`);
        return;
      }

      const updatedPolicy = {
        ...editingPolicy,
        dateFrom: formatDate(policyForm.dateFrom),
        dateTo: formatDate(policyForm.dateTo),
        typeOfPolicy: policyForm.typeOfPolicy || 'General',
        policyNo: policyForm.policyNo,
        endorsementNo: policyForm.endorsementNo || '',
        premiumRs: parseFloat(policyForm.premiumRs),
        sumInsured: parseFloat(policyForm.sumInsured) || 0,
        location: policyForm.location || '',
        remarks: policyForm.remarks || '',
        clientPhoneNumber: policyForm.clientPhoneNumber,
        clientId: client.id,
        updatedAt: new Date().toLocaleDateString()
      };

      const updatedPolicies = policies.map(p => p.id === editingPolicy.id ? updatedPolicy : p);
      setPolicies(updatedPolicies);
      setShowPolicyForm(false);
      setEditingPolicy(null);
      resetPolicyForm();
      showModal('Policy Updated!', `Successfully updated policy ${updatedPolicy.policyNo}\n\nClient: ${client.fullName}\nPhone: ${client.phoneNumber}\nType: ${updatedPolicy.typeOfPolicy}\nPremium: ₹${updatedPolicy.premiumRs}\nPeriod: ${updatedPolicy.dateFrom} to ${updatedPolicy.dateTo}`);
    } else {
      // Adding new policy
      // Check for duplicate policy number
      const existingPolicy = policies.find(p => p.policyNo === policyForm.policyNo);
      if (existingPolicy) {
        showModal('Policy Number Already Exists', `A policy with number ${policyForm.policyNo} already exists.\n\nPlease use a different policy number.`);
        return;
      }

      // Check if this is a new client that was just created
      const isNewClient = !clients.some(c => c.phoneNumber === policyForm.clientPhoneNumber);

      const newPolicy = {
        id: Date.now(),
        dateFrom: formatDate(policyForm.dateFrom),
        dateTo: formatDate(policyForm.dateTo),
        typeOfPolicy: policyForm.typeOfPolicy || 'General',
        policyNo: policyForm.policyNo,
        endorsementNo: policyForm.endorsementNo || '',
        premiumRs: parseFloat(policyForm.premiumRs),
        sumInsured: parseFloat(policyForm.sumInsured) || 0,
        location: policyForm.location || '',
        remarks: policyForm.remarks || '',
        clientPhoneNumber: policyForm.clientPhoneNumber, // Foreign key
        clientId: client.id, // Additional reference
        createdAt: new Date().toLocaleDateString()
      };

      setPolicies([...policies, newPolicy]);
      setShowPolicyForm(false);
      resetPolicyForm();

      const clientPoliciesCount = policies.filter(p => p.clientPhoneNumber === client.phoneNumber).length + 1;
      const successMessage = isNewClient
        ? `Successfully created policy ${newPolicy.policyNo} and new client!\n\n✅ New Client Created:\nName: ${client.fullName}\nPhone: ${client.phoneNumber}\n\n✅ Policy Created:\nType: ${newPolicy.typeOfPolicy}\nPremium: ₹${newPolicy.premiumRs}\nPeriod: ${newPolicy.dateFrom} to ${newPolicy.dateTo}\n\n💡 You can edit the client name in the Clients tab.`
        : `Successfully created policy ${newPolicy.policyNo}\n\nClient: ${client.fullName}\nPhone: ${client.phoneNumber}\nType: ${newPolicy.typeOfPolicy}\nPremium: ₹${newPolicy.premiumRs}\nPeriod: ${newPolicy.dateFrom} to ${newPolicy.dateTo}\n\nThis client now has ${clientPoliciesCount} policy(ies).`;

      showModal('Policy Created!', successMessage);
    }
  };

  // Policy filtering and sorting
  const getFilteredAndSortedPolicies = () => {
    let filteredPolicies = policies;

    // Apply filter if set
    if (policyFilter) {
      filteredPolicies = policies.filter(p => p.clientPhoneNumber === policyFilter);
    }

    // Sort by due date (ascending)
    return filteredPolicies.sort((a, b) => {
      const dateA = new Date(a.dateTo.split('/').reverse().join('-')); // Convert DD/MM/YYYY to YYYY-MM-DD
      const dateB = new Date(b.dateTo.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
  };

  const clearPolicyFilter = () => {
    setPolicyFilter('');
  };

  const selectClientForFilter = (contact: any) => {
    setPolicyFilter(contact.phoneNumbers[0].number);
    setShowPolicyFilterPicker(false);
    const client = clients.find(c => c.phoneNumber === contact.phoneNumbers[0].number);
    showModal('Filter Applied', `Showing policies for: ${client ? client.fullName : 'Unknown Client'}\nPhone: ${contact.phoneNumbers[0].number}`);
  };

  const sendWhatsAppReminder = (client: any, policy: any) => {
    const phoneNumber = client.phoneNumber.replace(/[^\d]/g, ''); // Remove non-digits
    const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`; // Add country code if needed

    const message = `Hello ${client.firstName},

Hope you are doing well!

This is a friendly reminder that your insurance policy is due for renewal:

📋 Policy Details:
• Policy No: ${policy.policyNo}
• Type: ${policy.typeOfPolicy}
• Current Premium: ₹${policy.premiumRs}
• Due Date: ${policy.dateTo}

To ensure continuous coverage, please renew your policy before the due date.

For any queries or to proceed with renewal, please feel free to contact us.

Thank you for choosing our services!

Best regards,
Insurance Team`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(whatsappUrl);
        } else {
          showModal('WhatsApp Not Available', 'WhatsApp is not installed on this device.\n\nPlease install WhatsApp to send reminders.');
        }
      })
      .catch(() => {
        showModal('Error', 'Failed to open WhatsApp. Please try again.');
      });
  };

  const handleManualSync = async (direction: 'import' | 'export') => {
    if (!user?.email) {
      showModal('Authentication Required', 'Please sign in to sync data with Google Sheets.');
      return;
    }

    try {
      setIsSyncing(true);
      const accessToken = await getAccessToken();

      if (!accessToken) {
        showModal('Authentication Error', 'Failed to get access token. Please sign in again.');
        return;
      }

      const result = await dataSyncService.manualSync(accessToken, user.email, direction);

      if (result.success) {
        if (direction === 'import') {
          // Refresh the local data after import
          // Note: In a real app, you'd reload from the database
          showModal('Import Successful', result.message);
        } else {
          showModal('Export Successful', result.message);
        }
      } else {
        showModal('Sync Failed', result.message);
      }
    } catch (error) {
      console.error('Manual sync error:', error);
      showModal('Sync Error', 'An unexpected error occurred during sync.');
    } finally {
      setIsSyncing(false);
    }
  };

  const showCloudBackupInfo = async () => {
    if (!user?.email) {
      showModal('Authentication Required', 'Please sign in to view cloud backup information.');
      return;
    }

    try {
      const backupInfo = await dataSyncService.getCloudBackupInfo(user.email);

      if (backupInfo.hasBackup) {
        const lastSyncDate = backupInfo.lastSync ? new Date(backupInfo.lastSync).toLocaleString() : 'Unknown';
        showModal(
          'Cloud Backup Info',
          `✅ Cloud backup available\n\n📊 Backup Contents:\n• ${backupInfo.clientCount || 0} clients\n• ${backupInfo.policyCount || 0} policies\n\n🕒 Last sync: ${lastSyncDate}\n\n💡 Your data is safely backed up and can be restored on any device.`
        );
      } else {
        showModal(
          'No Cloud Backup',
          '❌ No cloud backup found\n\n💡 Use "Export to Cloud" to create your first backup.'
        );
      }
    } catch (error) {
      showModal('Error', 'Failed to get cloud backup information.');
    }
  };

  const renderDashboard = () => (
    <ScrollView style={styles.content}>
      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={addClient}>
            <Text style={styles.primaryButtonText}>Add Client</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={addPolicy}>
            <Text style={styles.secondaryButtonText}>Add Policy</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => {
              const clientsWithPolicies = clients.filter(c => getPoliciesForClient(c).length > 0).length;
              showModal('Total Clients', `You have ${clients.length} clients\n${clientsWithPolicies} with policies, ${clients.length - clientsWithPolicies} without policies\n\n${clients.length === 0 ? 'Add your first client to get started!' : 'Recent clients:\n' + clients.slice(-3).map(c => `• ${c.fullName} (${getPoliciesForClient(c).length} policies)`).join('\n')}`);
            }}
          >
            <Text style={styles.statNumber}>{clients.length}</Text>
            <Text style={styles.statLabel}>Total Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => {
              const policiesWithClients = policies.map(p => {
                const client = getClientForPolicy(p);
                return `• ${p.policyNo} - ${client ? client.fullName : 'Unknown Client'}`;
              });
              showModal('Active Policies', `You have ${policies.length} policies\n\n${policies.length === 0 ? 'Create your first policy!' : 'Recent policies:\n' + policiesWithClients.slice(-3).join('\n')}`);
            }}
          >
            <Text style={styles.statNumber}>{policies.length}</Text>
            <Text style={styles.statLabel}>Active Policies</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => {
              const totalPremium = policies.reduce((sum, p) => sum + p.premiumRs, 0);
              showModal('Total Premium', `Total premium value: ₹${totalPremium}\n\n${policies.length === 0 ? 'No policies yet' : `Average premium: ₹${Math.round(totalPremium / policies.length)}\nHighest premium: ₹${Math.max(...policies.map(p => p.premiumRs))}\n\nTop clients by premium:\n` + clients.map(c => {
                const clientPolicies = getPoliciesForClient(c);
                const clientTotal = clientPolicies.reduce((sum, p) => sum + p.premiumRs, 0);
                return { name: c.fullName, total: clientTotal };
              }).filter(c => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 3).map(c => `• ${c.name}: ₹${c.total}`).join('\n')}`);
            }}
          >
            <Text style={styles.statNumber}>₹{policies.reduce((sum, p) => sum + p.premiumRs, 0)}</Text>
            <Text style={styles.statLabel}>Total Premium</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => {
              const renewalsWithClients = policies.map(p => {
                const client = getClientForPolicy(p);
                return `• ${p.policyNo} (${client ? client.fullName : 'Unknown'}) - ${p.dateTo}`;
              });
              showModal('Renewals Due', `${policies.length} policies to review\n\n${policies.length === 0 ? 'No renewals yet' : 'Upcoming renewals:\n' + renewalsWithClients.slice(0, 5).join('\n')}`);
            }}
          >
            <Text style={styles.statNumber}>{policies.length}</Text>
            <Text style={styles.statLabel}>Renewals Due</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Top 5 Renewal Policies */}
      {policies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Upcoming Renewals</Text>
          {getFilteredAndSortedPolicies().slice(0, 5).map(policy => {
            const client = getClientForPolicy(policy);
            const clientName = client ? client.fullName : 'Unknown Client';
            const daysUntilDue = Math.ceil((new Date(policy.dateTo.split('/').reverse().join('-')).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <View key={policy.id} style={styles.renewalItem}>
                <TouchableOpacity
                  style={styles.renewalInfo}
                  onPress={() => showModal(
                    `${policy.policyNo} - Renewal Due`,
                    `Client: ${clientName}\nPhone: ${client?.phoneNumber || policy.clientPhoneNumber}\nPolicy: ${policy.policyNo}\nType: ${policy.typeOfPolicy}\nPremium: ₹${policy.premiumRs}\nDue Date: ${policy.dateTo}\nDays Until Due: ${daysUntilDue > 0 ? daysUntilDue : 'OVERDUE'}`
                  )}
                >
                  <Text style={styles.renewalPolicyNo}>{policy.policyNo}</Text>
                  <Text style={styles.renewalClient}>{clientName}</Text>
                  <Text style={[styles.renewalDue, daysUntilDue <= 7 ? styles.renewalUrgent : daysUntilDue <= 30 ? styles.renewalSoon : styles.renewalNormal]}>
                    Due: {policy.dateTo} ({daysUntilDue > 0 ? `${daysUntilDue} days` : 'OVERDUE'})
                  </Text>
                </TouchableOpacity>
                {client && (
                  <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={() => sendWhatsAppReminder(client, policy)}
                  >
                    <WhatsAppIcon size={16} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );

  const renderClients = () => (
    <ScrollView style={styles.content}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Clients ({clients.length})</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={addClient}
          >
            <Text style={styles.addButtonText}>+ Add Client</Text>
          </TouchableOpacity>
        </View>
        {clients.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No clients yet</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={addClient}>
              <Text style={styles.primaryButtonText}>Add First Client</Text>
            </TouchableOpacity>
          </View>
        ) : (
          clients.map(client => {
            const clientPolicies = getPoliciesForClient(client);
            const policyCount = clientPolicies.length;

            return (
              <View key={client.id} style={styles.listItem}>
                <TouchableOpacity
                  style={styles.clientInfo}
                  onPress={() => {
                    const policyDetails = policyCount > 0
                      ? `\n\nPolicies (${policyCount}):\n` + clientPolicies.map(p => `• ${p.policyNo} - ₹${p.premiumRs}`).join('\n')
                      : '\n\nNo policies yet.';
                    showModal(
                      client.fullName,
                      `Phone: ${client.phoneNumber}\nAdded: ${client.createdAt}${client.updatedAt ? `\nLast Updated: ${client.updatedAt}` : ''}${policyDetails}`
                    );
                  }}
                >
                  <Text style={styles.listItemTitle}>{client.fullName}</Text>
                  <Text style={styles.listItemSubtitle}>{client.phoneNumber}</Text>
                  <Text style={styles.policyCount}>{policyCount} policy(ies)</Text>
                </TouchableOpacity>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => editClient(client)}
                  >
                    <Text style={styles.editButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => confirmDeleteClient(client)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );

  const renderPolicies = () => {
    const filteredPolicies = getFilteredAndSortedPolicies();
    const filterClient = policyFilter ? clients.find(c => c.phoneNumber === policyFilter) : null;

    return (
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Policies ({filteredPolicies.length}{policies.length !== filteredPolicies.length ? ` of ${policies.length}` : ''})
            </Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addPolicy}
              >
                <Text style={styles.addButtonText}>+ Add Policy</Text>
              </TouchableOpacity>
              {Platform.OS !== 'web' && (
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => {
                    setShowPolicyFilterPicker(true);
                    fetchFromContacts(false);
                  }}
                >
                  <Text style={styles.filterButtonText}>📱 Filter</Text>
                </TouchableOpacity>
              )}
              {policyFilter && (
                <TouchableOpacity
                  style={styles.clearFilterButton}
                  onPress={clearPolicyFilter}
                >
                  <Text style={styles.clearFilterButtonText}>✕ Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {policyFilter && filterClient && (
            <View style={styles.filterInfo}>
              <Text style={styles.filterInfoText}>
                Showing policies for: {filterClient.fullName} ({policyFilter})
              </Text>
            </View>
          )}

          {filteredPolicies.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {policyFilter ? 'No policies found for this client' : 'No policies yet'}
              </Text>
              <TouchableOpacity style={styles.primaryButton} onPress={addPolicy}>
                <Text style={styles.primaryButtonText}>Create First Policy</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredPolicies.map(policy => {
              const client = getClientForPolicy(policy);
              const clientName = client ? client.fullName : 'Unknown Client';
              const clientPhone = client ? client.phoneNumber : policy.clientPhoneNumber;

              return (
                <View key={policy.id} style={styles.listItem}>
                  <TouchableOpacity
                    style={styles.clientInfo}
                    onPress={() => showModal(
                      policy.policyNo,
                      `Client: ${clientName}\nPhone: ${clientPhone}\nType: ${policy.typeOfPolicy}\nPremium: ₹${policy.premiumRs}${policy.sumInsured > 0 ? `\nSum Insured: ₹${policy.sumInsured}` : ''}\nPeriod: ${policy.dateFrom} to ${policy.dateTo}${policy.location ? `\nLocation: ${policy.location}` : ''}${policy.endorsementNo ? `\nEndorsement: ${policy.endorsementNo}` : ''}${policy.remarks ? `\nRemarks: ${policy.remarks}` : ''}${policy.updatedAt ? `\nLast Updated: ${policy.updatedAt}` : ''}`
                    )}
                  >
                    <Text style={styles.listItemTitle}>{policy.policyNo}</Text>
                    <Text style={styles.listItemSubtitle}>{clientName} • {clientPhone}</Text>
                    <Text style={styles.policyDetails}>₹{policy.premiumRs} • Due: {policy.dateTo}</Text>
                  </TouchableOpacity>
                  <View style={styles.actionButtons}>
                    {client && (
                      <TouchableOpacity
                        style={styles.whatsappButton}
                        onPress={() => sendWhatsAppReminder(client, policy)}
                      >
                        <WhatsAppIcon size={16} color="white" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => editPolicy(policy)}
                    >
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => confirmDeletePolicy(policy)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return renderDashboard();
      case 'Clients': return renderClients();
      case 'Policies': return renderPolicies();
      case 'Calendar':
        return (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Renewal Calendar</Text>
              <Text style={styles.emptyText}>Calendar view coming soon!</Text>
            </View>
          </View>
        );
      case 'Settings':
        return (
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>

              {/* User Info */}
              <View style={styles.settingsCard}>
                <Text style={styles.settingsCardTitle}>Account</Text>
                <Text style={styles.settingsText}>Signed in as: {user?.name || 'Unknown'}</Text>
                <Text style={styles.settingsText}>Email: {user?.email || 'Unknown'}</Text>
              </View>

              {/* Cloud Sync */}
              <View style={styles.settingsCard}>
                <Text style={styles.settingsCardTitle}>☁️ Cloud Backup</Text>
                <Text style={styles.settingsDescription}>
                  Backup your data to the cloud for safe storage and cross-device access.
                </Text>

                <View style={styles.syncButtons}>
                  <TouchableOpacity
                    style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
                    onPress={() => handleManualSync('export')}
                    disabled={isSyncing}
                  >
                    {isSyncing ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.syncButtonText}>📤 Export to Cloud</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.syncButton, styles.importButton, isSyncing && styles.syncButtonDisabled]}
                    onPress={() => handleManualSync('import')}
                    disabled={isSyncing}
                  >
                    {isSyncing ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.syncButtonText}>📥 Import from Cloud</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={showCloudBackupInfo}
                >
                  <Text style={styles.linkButtonText}>ℹ️ Cloud Backup Info</Text>
                </TouchableOpacity>
              </View>

              {/* App Info */}
              <View style={styles.settingsCard}>
                <Text style={styles.settingsCardTitle}>App Information</Text>
                <Text style={styles.settingsText}>Version: 1.0.0</Text>
                <Text style={styles.settingsText}>Total Clients: {clients.length}</Text>
                <Text style={styles.settingsText}>Total Policies: {policies.length}</Text>
              </View>
            </View>
          </ScrollView>
        );
      default: return renderDashboard();
    }
  };

  return (
    <View style={styles.container}>
      {/* Content */}
      {renderContent()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {['Dashboard', 'Clients', 'Policies', 'Calendar', 'Settings'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.navTab, activeTab === tab && styles.activeNavTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.navTabText, activeTab === tab && styles.activeNavTabText]}>
              {tab === 'Dashboard' && '📊'}
              {tab === 'Clients' && '👥'}
              {tab === 'Policies' && '📋'}
              {tab === 'Calendar' && '📅'}
              {tab === 'Settings' && '⚙️'}
            </Text>
            <Text style={[styles.navTabLabel, activeTab === tab && styles.activeNavTabLabel]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Info Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalContent.title}</Text>
            <Text style={styles.modalMessage}>{modalContent.message}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Client Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showClientForm}
        onRequestClose={() => setShowClientForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formModalContent}>
            <ScrollView>
              <Text style={styles.formTitle}>{editingClient ? 'Edit Client' : 'Add New Client'}</Text>

              {Platform.OS !== 'web' && (
                <TouchableOpacity style={styles.contactsButton} onPress={fetchFromContacts}>
                  <Text style={styles.contactsButtonText}>📱 Fetch from Contacts</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.fieldLabel}>First Name *</Text>
              <TextInput
                style={styles.textInput}
                value={clientForm.firstName}
                onChangeText={(text) => setClientForm({...clientForm, firstName: text})}
                placeholder="Enter first name"
              />

              <Text style={styles.fieldLabel}>Last Name</Text>
              <TextInput
                style={styles.textInput}
                value={clientForm.lastName}
                onChangeText={(text) => setClientForm({...clientForm, lastName: text})}
                placeholder="Enter last name"
              />

              <Text style={styles.fieldLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                value={clientForm.phoneNumber}
                onChangeText={(text) => setClientForm({...clientForm, phoneNumber: text})}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />

              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowClientForm(false);
                    resetClientForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={submitClient}
                >
                  <Text style={styles.submitButtonText}>{editingClient ? 'Update Client' : 'Add Client'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Policy Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPolicyForm}
        onRequestClose={() => setShowPolicyForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formModalContent}>
            <ScrollView>
              <Text style={styles.formTitle}>{editingPolicy ? 'Edit Policy' : 'Add New Policy'}</Text>

              <Text style={styles.fieldLabel}>Date From *</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDateFromPicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {policyForm.dateFrom ? formatDate(policyForm.dateFrom) : 'Select date'}
                </Text>
                <Text style={styles.datePickerIcon}>📅</Text>
              </TouchableOpacity>

              <Text style={styles.fieldLabel}>Date Due *</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDateToPicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {policyForm.dateTo ? formatDate(policyForm.dateTo) : 'Select date'}
                </Text>
                <Text style={styles.datePickerIcon}>📅</Text>
              </TouchableOpacity>

              <Text style={styles.fieldLabel}>Type of Policy</Text>
              <TextInput
                style={styles.textInput}
                value={policyForm.typeOfPolicy}
                onChangeText={(text) => setPolicyForm({...policyForm, typeOfPolicy: text})}
                placeholder="e.g., Motor, Health, Life"
              />

              <Text style={styles.fieldLabel}>Policy No *</Text>
              <TextInput
                style={styles.textInput}
                value={policyForm.policyNo}
                onChangeText={(text) => setPolicyForm({...policyForm, policyNo: text})}
                placeholder="Enter policy number"
              />

              <Text style={styles.fieldLabel}>Endorsement No</Text>
              <TextInput
                style={styles.textInput}
                value={policyForm.endorsementNo}
                onChangeText={(text) => setPolicyForm({...policyForm, endorsementNo: text})}
                placeholder="Enter endorsement number (optional)"
              />

              <Text style={styles.fieldLabel}>Premium Rs *</Text>
              <TextInput
                style={styles.textInput}
                value={policyForm.premiumRs}
                onChangeText={(text) => setPolicyForm({...policyForm, premiumRs: text})}
                placeholder="Enter premium amount"
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Sum Insured</Text>
              <TextInput
                style={styles.textInput}
                value={policyForm.sumInsured}
                onChangeText={(text) => setPolicyForm({...policyForm, sumInsured: text})}
                placeholder="Enter sum insured"
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                value={policyForm.location}
                onChangeText={(text) => setPolicyForm({...policyForm, location: text})}
                placeholder="Enter location (optional)"
              />

              <Text style={styles.fieldLabel}>Remarks</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={policyForm.remarks}
                onChangeText={(text) => setPolicyForm({...policyForm, remarks: text})}
                placeholder="Enter remarks (optional)"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.fieldLabel}>Client Phone Number *</Text>
              {Platform.OS !== 'web' && (
                <TouchableOpacity
                  style={styles.contactsButton}
                  onPress={() => fetchFromContacts(false)}
                >
                  <Text style={styles.contactsButtonText}>📱 Fetch from Contacts</Text>
                </TouchableOpacity>
              )}
              <TextInput
                style={styles.textInput}
                value={policyForm.clientPhoneNumber}
                onChangeText={(text) => setPolicyForm({...policyForm, clientPhoneNumber: text})}
                placeholder="Enter client's phone number"
                keyboardType="phone-pad"
              />
              <Text style={styles.helpText}>
                💡 If the client doesn't exist, we'll create one automatically
              </Text>

              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowPolicyForm(false);
                    resetPolicyForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={submitPolicy}
                >
                  <Text style={styles.submitButtonText}>{editingPolicy ? 'Update Policy' : 'Create Policy'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Contact Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showContactPicker}
        onRequestClose={() => {
          setShowContactPicker(false);
          setSearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formModalContent}>
            <Text style={styles.formTitle}>Select Contact</Text>

            {/* Search Input */}
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={searchContacts}
              placeholder="Search contacts by name or phone..."
              clearButtonMode="while-editing"
            />

            {/* Contact List */}
            <ScrollView style={styles.contactsList} showsVerticalScrollIndicator={true}>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact, index) => (
                  <TouchableOpacity
                    key={`contact-${index}-${contact.id || contact.name}`}
                    style={styles.contactItem}
                    onPress={() => selectContact(contact)}
                    activeOpacity={0.6}
                    delayPressIn={0}
                  >
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>
                      {contact.phoneNumbers[0]?.number || 'No phone'}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>
                    {searchQuery ? 'No contacts found matching your search' : 'No contacts available'}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.contactPickerCancelButton}
              onPress={() => {
                setShowContactPicker(false);
                setSearchQuery('');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.contactPickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDeleteConfirm}
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Delete</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this {deleteType}?
              {'\n\n'}
              {deleteType === 'client' && deleteTarget && (
                <>
                  <Text style={{fontWeight: 'bold'}}>{deleteTarget.fullName}</Text>
                  {'\n'}Phone: {deleteTarget.phoneNumber}
                  {'\n\n'}This action cannot be undone.
                </>
              )}
              {deleteType === 'policy' && deleteTarget && (
                <>
                  <Text style={{fontWeight: 'bold'}}>Policy: {deleteTarget.policyNo}</Text>
                  {'\n'}Client: {getClientForPolicy(deleteTarget)?.fullName || 'Unknown'}
                  {'\n'}Premium: ₹{deleteTarget.premiumRs}
                  {'\n\n'}This action cannot be undone.
                </>
              )}
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={executeDelete}
              >
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Policy Update Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showUpdatePolicyConfirm}
        onRequestClose={() => setShowUpdatePolicyConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Linked Policies?</Text>
            <Text style={styles.modalMessage}>
              This client's phone number is linked to {policies.filter(p => p.clientPhoneNumber === editingClient?.phoneNumber).length} policy(ies).
              {'\n\n'}
              Would you like to update the policies with the new phone number?
              {'\n\n'}
              • <Text style={{fontWeight: 'bold'}}>Yes</Text>: Update policies with new phone number
              {'\n'}
              • <Text style={{fontWeight: 'bold'}}>No</Text>: Keep policies with old phone number
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => confirmUpdatePolicies(false)}
              >
                <Text style={styles.cancelButtonText}>No, Keep Old</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => confirmUpdatePolicies(true)}
              >
                <Text style={styles.submitButtonText}>Yes, Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Pickers */}
      {showDateFromPicker && (
        <DateTimePicker
          value={policyForm.dateFrom || new Date()}
          mode="date"
          display="default"
          onChange={onDateFromChange}
        />
      )}

      {showDateToPicker && (
        <DateTimePicker
          value={policyForm.dateTo || new Date()}
          mode="date"
          display="default"
          onChange={onDateToChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },

  content: {
    flex: 1,
    padding: 16,
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1976d2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  secondaryButtonText: {
    color: '#1976d2',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresList: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  tabsContainer: {
    gap: 8,
  },
  tab: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTab: {
    backgroundColor: '#1976d2',
  },
  tabText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  activeTabText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingVertical: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavTab: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  navTabText: {
    fontSize: 20,
    marginBottom: 4,
  },
  navTabLabel: {
    fontSize: 12,
    color: '#666',
  },
  activeNavTabText: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeNavTabLabel: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  listItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#1976d2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  formModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 20,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#1976d2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contactsButton: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  contactsButtonText: {
    color: '#1976d2',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  datePickerIcon: {
    fontSize: 18,
  },
  contactsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  contactItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  contactPickerCancelButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 16,
  },
  contactPickerCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  clientInfo: {
    flex: 1,
  },
  editButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1976d2',
    marginLeft: 12,
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  policyDetails: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  policyCount: {
    fontSize: 12,
    color: '#1976d2',
    marginTop: 2,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f44336',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteConfirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  filterButtonText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '600',
  },
  clearFilterButton: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  clearFilterButtonText: {
    color: '#f44336',
    fontSize: 12,
    fontWeight: '600',
  },
  filterInfo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  filterInfoText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#388e3c',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  renewalItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  renewalInfo: {
    flex: 1,
  },
  renewalPolicyNo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  renewalClient: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  renewalDue: {
    fontSize: 12,
    fontWeight: '500',
  },
  renewalUrgent: {
    color: '#f44336',
  },
  renewalSoon: {
    color: '#ff9800',
  },
  renewalNormal: {
    color: '#4caf50',
  },
  whatsappButton: {
    backgroundColor: '#25d366',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
    justifyContent: 'center',
  },
  whatsappButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 8,
  },
  settingsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  settingsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  settingsDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  syncButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  syncButton: {
    flex: 1,
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  importButton: {
    backgroundColor: '#4caf50',
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  linkButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  linkButtonText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SimpleAppNavigator;
