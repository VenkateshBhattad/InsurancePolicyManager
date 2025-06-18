import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import databaseService from './database';

interface SyncResult {
  success: boolean;
  message: string;
  clientsImported?: number;
  policiesImported?: number;
  clientsExported?: number;
  policiesExported?: number;
}

class DataSyncService {
  private async getStoredSpreadsheetId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('spreadsheetId');
    } catch (error) {
      console.error('Error getting stored spreadsheet ID:', error);
      return null;
    }
  }

  private async storeSpreadsheetId(spreadsheetId: string): Promise<void> {
    try {
      await SecureStore.setItemAsync('spreadsheetId', spreadsheetId);
    } catch (error) {
      console.error('Error storing spreadsheet ID:', error);
    }
  }

  async syncOnStartup(accessToken: string, userEmail: string): Promise<SyncResult> {
    try {
      console.log('Starting data sync...');

      // For Expo Go compatibility, use local storage as "cloud" backup
      const cloudKey = `cloud_backup_${userEmail}`;

      // Check if local database has data
      const localClients = await databaseService.getAllClients();
      const localPolicies = await databaseService.getAllPolicies();

      if (localClients.length === 0 && localPolicies.length === 0) {
        // No local data, try to import from "cloud" (SecureStore)
        return await this.importDataFromCloud(cloudKey);
      } else {
        // Local data exists, export to "cloud" (SecureStore)
        return await this.exportLocalDataToCloud(cloudKey, localClients, localPolicies);
      }
    } catch (error) {
      console.error('Error during sync:', error);
      return {
        success: false,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async importDataFromCloud(cloudKey: string): Promise<SyncResult> {
    try {
      console.log('Importing data from cloud backup...');

      const cloudData = await SecureStore.getItemAsync(cloudKey);

      if (!cloudData) {
        return {
          success: true,
          message: 'No cloud backup found - starting fresh',
        };
      }

      const parsedData = JSON.parse(cloudData);

      // Import clients
      let clientsImported = 0;
      for (const client of parsedData.clients || []) {
        if (client.phoneNumber && client.firstName) {
          await databaseService.addClient({
            firstName: client.firstName,
            lastName: client.lastName,
            phoneNumber: client.phoneNumber,
          });
          clientsImported++;
        }
      }

      // Import policies
      let policiesImported = 0;
      for (const policy of parsedData.policies || []) {
        if (policy.policyNo && policy.clientPhoneNumber) {
          await databaseService.addPolicy({
            dateFrom: policy.dateFrom,
            dateTo: policy.dateTo,
            typeOfPolicy: policy.typeOfPolicy,
            policyNo: policy.policyNo,
            endorsementNo: policy.endorsementNo,
            premiumRs: policy.premiumRs.toString(),
            sumInsured: policy.sumInsured.toString(),
            location: policy.location,
            remarks: policy.remarks,
            clientPhoneNumber: policy.clientPhoneNumber,
          });
          policiesImported++;
        }
      }

      return {
        success: true,
        message: `Successfully imported ${clientsImported} clients and ${policiesImported} policies from cloud backup`,
        clientsImported,
        policiesImported,
      };
    } catch (error) {
      console.error('Error importing from cloud:', error);
      throw error;
    }
  }

  private async exportLocalDataToCloud(cloudKey: string, localClients: any[], localPolicies: any[]): Promise<SyncResult> {
    try {
      console.log('Exporting local data to cloud backup...');

      const cloudData = {
        clients: localClients.map(client => ({
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          fullName: client.fullName,
          phoneNumber: client.phoneNumber,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt,
        })),
        policies: localPolicies.map(policy => ({
          id: policy.id,
          dateFrom: policy.dateFrom,
          dateTo: policy.dateTo,
          typeOfPolicy: policy.typeOfPolicy,
          policyNo: policy.policyNo,
          endorsementNo: policy.endorsementNo,
          premiumRs: policy.premiumRs,
          sumInsured: policy.sumInsured,
          location: policy.location,
          remarks: policy.remarks,
          clientPhoneNumber: policy.clientPhoneNumber,
          clientId: policy.clientId,
          createdAt: policy.createdAt,
          updatedAt: policy.updatedAt,
        })),
        lastSync: new Date().toISOString(),
      };

      await SecureStore.setItemAsync(cloudKey, JSON.stringify(cloudData));

      return {
        success: true,
        message: `Successfully backed up ${localClients.length} clients and ${localPolicies.length} policies to cloud`,
        clientsExported: localClients.length,
        policiesExported: localPolicies.length,
      };
    } catch (error) {
      console.error('Error exporting to cloud:', error);
      throw error;
    }
  }

  async manualSync(accessToken: string, userEmail: string, direction: 'import' | 'export'): Promise<SyncResult> {
    try {
      const cloudKey = `cloud_backup_${userEmail}`;

      if (direction === 'import') {
        return await this.importDataFromCloud(cloudKey);
      } else {
        const localClients = await databaseService.getAllClients();
        const localPolicies = await databaseService.getAllPolicies();
        return await this.exportLocalDataToCloud(cloudKey, localClients, localPolicies);
      }
    } catch (error) {
      console.error('Error during manual sync:', error);
      return {
        success: false,
        message: `Manual sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async getCloudBackupInfo(userEmail: string): Promise<{ hasBackup: boolean; lastSync?: string; clientCount?: number; policyCount?: number }> {
    try {
      const cloudKey = `cloud_backup_${userEmail}`;
      const cloudData = await SecureStore.getItemAsync(cloudKey);

      if (!cloudData) {
        return { hasBackup: false };
      }

      const parsedData = JSON.parse(cloudData);
      return {
        hasBackup: true,
        lastSync: parsedData.lastSync,
        clientCount: parsedData.clients?.length || 0,
        policyCount: parsedData.policies?.length || 0,
      };
    } catch (error) {
      console.error('Error getting cloud backup info:', error);
      return { hasBackup: false };
    }
  }
}

export default new DataSyncService();
