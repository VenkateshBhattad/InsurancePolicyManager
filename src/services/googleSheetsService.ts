import { Platform } from 'react-native';

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt?: string;
}

interface Policy {
  id: number;
  dateFrom: string;
  dateTo: string;
  typeOfPolicy: string;
  policyNo: string;
  endorsementNo: string;
  premiumRs: number;
  sumInsured: number;
  location: string;
  remarks: string;
  clientPhoneNumber: string;
  clientId: number;
  createdAt: string;
  updatedAt?: string;
}

interface SheetsData {
  clients: Client[];
  policies: Policy[];
}

class GoogleSheetsService {
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  private driveUrl = 'https://www.googleapis.com/drive/v3';

  async createSpreadsheet(accessToken: string, userEmail: string): Promise<string> {
    try {
      // Create a new spreadsheet
      const createResponse = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: `Insurance Policy Manager - ${userEmail}`,
          },
          sheets: [
            {
              properties: {
                title: 'Clients',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 10,
                },
              },
            },
            {
              properties: {
                title: 'Policies',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 15,
                },
              },
            },
          ],
        }),
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create spreadsheet: ${createResponse.statusText}`);
      }

      const spreadsheet = await createResponse.json();
      const spreadsheetId = spreadsheet.spreadsheetId;

      // Set up headers for both sheets
      await this.setupSheetHeaders(accessToken, spreadsheetId);

      return spreadsheetId;
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw error;
    }
  }

  private async setupSheetHeaders(accessToken: string, spreadsheetId: string): Promise<void> {
    const clientHeaders = [
      'ID', 'First Name', 'Last Name', 'Full Name', 'Phone Number', 'Created At', 'Updated At'
    ];

    const policyHeaders = [
      'ID', 'Date From', 'Date To', 'Type of Policy', 'Policy No', 'Endorsement No',
      'Premium Rs', 'Sum Insured', 'Location', 'Remarks', 'Client Phone Number',
      'Client ID', 'Created At', 'Updated At'
    ];

    const requests = [
      {
        range: 'Clients!A1:G1',
        values: [clientHeaders],
      },
      {
        range: 'Policies!A1:N1',
        values: [policyHeaders],
      },
    ];

    for (const request of requests) {
      await fetch(`${this.baseUrl}/${spreadsheetId}/values/${request.range}?valueInputOption=RAW`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: request.values,
        }),
      });
    }
  }

  async findUserSpreadsheet(accessToken: string, userEmail: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.driveUrl}/files?q=name contains 'Insurance Policy Manager' and name contains '${userEmail}' and mimeType='application/vnd.google-apps.spreadsheet'`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search for spreadsheet: ${response.statusText}`);
      }

      const data = await response.json();
      return data.files && data.files.length > 0 ? data.files[0].id : null;
    } catch (error) {
      console.error('Error finding user spreadsheet:', error);
      return null;
    }
  }

  async readData(accessToken: string, spreadsheetId: string): Promise<SheetsData> {
    try {
      const [clientsResponse, policiesResponse] = await Promise.all([
        fetch(`${this.baseUrl}/${spreadsheetId}/values/Clients!A2:G1000`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }),
        fetch(`${this.baseUrl}/${spreadsheetId}/values/Policies!A2:N1000`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }),
      ]);

      const clientsData = await clientsResponse.json();
      const policiesData = await policiesResponse.json();

      const clients: Client[] = (clientsData.values || []).map((row: any[]) => ({
        id: parseInt(row[0]) || 0,
        firstName: row[1] || '',
        lastName: row[2] || '',
        fullName: row[3] || '',
        phoneNumber: row[4] || '',
        createdAt: row[5] || '',
        updatedAt: row[6] || undefined,
      }));

      const policies: Policy[] = (policiesData.values || []).map((row: any[]) => ({
        id: parseInt(row[0]) || 0,
        dateFrom: row[1] || '',
        dateTo: row[2] || '',
        typeOfPolicy: row[3] || '',
        policyNo: row[4] || '',
        endorsementNo: row[5] || '',
        premiumRs: parseFloat(row[6]) || 0,
        sumInsured: parseFloat(row[7]) || 0,
        location: row[8] || '',
        remarks: row[9] || '',
        clientPhoneNumber: row[10] || '',
        clientId: parseInt(row[11]) || 0,
        createdAt: row[12] || '',
        updatedAt: row[13] || undefined,
      }));

      return { clients, policies };
    } catch (error) {
      console.error('Error reading data from sheets:', error);
      throw error;
    }
  }

  async writeData(accessToken: string, spreadsheetId: string, data: SheetsData): Promise<void> {
    try {
      const clientRows = data.clients.map(client => [
        client.id,
        client.firstName,
        client.lastName,
        client.fullName,
        client.phoneNumber,
        client.createdAt,
        client.updatedAt || '',
      ]);

      const policyRows = data.policies.map(policy => [
        policy.id,
        policy.dateFrom,
        policy.dateTo,
        policy.typeOfPolicy,
        policy.policyNo,
        policy.endorsementNo,
        policy.premiumRs,
        policy.sumInsured,
        policy.location,
        policy.remarks,
        policy.clientPhoneNumber,
        policy.clientId,
        policy.createdAt,
        policy.updatedAt || '',
      ]);

      // Clear existing data and write new data
      await Promise.all([
        // Clear clients sheet
        fetch(`${this.baseUrl}/${spreadsheetId}/values/Clients!A2:G1000:clear`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }),
        // Clear policies sheet
        fetch(`${this.baseUrl}/${spreadsheetId}/values/Policies!A2:N1000:clear`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }),
      ]);

      // Write new data
      if (clientRows.length > 0) {
        await fetch(`${this.baseUrl}/${spreadsheetId}/values/Clients!A2:G${clientRows.length + 1}?valueInputOption=RAW`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: clientRows,
          }),
        });
      }

      if (policyRows.length > 0) {
        await fetch(`${this.baseUrl}/${spreadsheetId}/values/Policies!A2:N${policyRows.length + 1}?valueInputOption=RAW`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: policyRows,
          }),
        });
      }
    } catch (error) {
      console.error('Error writing data to sheets:', error);
      throw error;
    }
  }
}

export default new GoogleSheetsService();
