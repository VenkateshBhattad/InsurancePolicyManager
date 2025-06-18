# Insurance Policy Manager

A comprehensive React Native mobile application for insurance agents to manage client policies, track renewals, and send automated reminders. Built with Expo, TypeScript, and Material Design 3.

## 🚀 Features

### Core Functionality
- **Policy Management**: Add, edit, delete, and view insurance policies
- **Client Management**: Maintain comprehensive client database with contact information
- **Renewal Tracking**: Automatic calculation and tracking of policy renewal dates
- **Dashboard Analytics**: Overview of policies, upcoming renewals, and key statistics
- **Search & Filter**: Advanced search and filtering capabilities for policies and clients
- **Offline-First**: Full functionality without internet connection using SQLite

### Advanced Features
- **Push Notifications**: Automated renewal reminders with configurable intervals
- **Cloud Sync**: Google Sheets integration for data backup and synchronization
- **Material Design 3**: Modern, professional UI following Google's design guidelines
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Data Export**: Export functionality for data migration and reporting

## 📱 Screenshots

*Screenshots will be added after testing on device*

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Database**: SQLite (expo-sqlite)
- **UI Library**: React Native Paper (Material Design 3)
- **Navigation**: React Navigation 6
- **Forms**: React Hook Form with Yup validation
- **Cloud Sync**: Google Sheets API
- **Notifications**: Expo Notifications
- **Date Handling**: date-fns

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or later recommended)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd InsurancePolicyManager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run start:safe
   ```
   
   *Note: Use `start:safe` if you're using Node.js v24+ to avoid TypeScript compatibility issues*

4. **Run on device/simulator**
   - **Android**: `npm run android` or scan QR code with Expo Go app
   - **iOS**: `npm run ios` or scan QR code with Expo Go app
   - **Web**: `npm run web`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (ErrorMessage, LoadingScreen)
│   ├── dashboard/      # Dashboard-specific components
│   ├── policies/       # Policy-related components
│   └── clients/        # Client-related components
├── constants/          # App constants and theme configuration
├── navigation/         # Navigation configuration
├── screens/           # Screen components
│   ├── dashboard/     # Dashboard screens
│   ├── policies/      # Policy management screens
│   ├── clients/       # Client management screens
│   ├── calendar/      # Calendar and renewal screens
│   └── settings/      # Settings screens
├── services/          # API and database services
├── store/            # Redux store and slices
│   └── slices/       # Redux slices for different features
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## 🗄 Database Schema

### Clients Table
- `id` (TEXT PRIMARY KEY)
- `firstName` (TEXT NOT NULL)
- `lastName` (TEXT NOT NULL)
- `email` (TEXT NOT NULL)
- `phone` (TEXT NOT NULL)
- `address` (TEXT NOT NULL)
- `dateOfBirth` (TEXT NOT NULL)
- `createdAt` (TEXT NOT NULL)
- `updatedAt` (TEXT NOT NULL)

### Policies Table
- `id` (TEXT PRIMARY KEY)
- `policyNumber` (TEXT NOT NULL UNIQUE)
- `clientId` (TEXT NOT NULL, FOREIGN KEY)
- `policyType` (TEXT NOT NULL)
- `premiumAmount` (REAL NOT NULL)
- `startDate` (TEXT NOT NULL)
- `endDate` (TEXT NOT NULL)
- `status` (TEXT NOT NULL)
- `insuranceCompany` (TEXT NOT NULL)
- `agentNotes` (TEXT)
- `createdAt` (TEXT NOT NULL)
- `updatedAt` (TEXT NOT NULL)

### Additional Tables
- `renewal_reminders` - For tracking scheduled reminders
- `sync_log` - For tracking data changes for cloud sync

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Google Sheets API Configuration (Optional)
GOOGLE_SHEETS_API_KEY=your_api_key_here
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here

# App Configuration
APP_ENV=development
```

### Google Sheets Integration Setup
1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create service account credentials
4. Share your Google Sheet with the service account email
5. Add credentials to your app configuration

## 📱 Building for Production

### Android APK/AAB
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
npm run build:android
```

### iOS IPA
```bash
# Build for iOS
npm run build:ios
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Features Roadmap

### Phase 1 (Current)
- [x] Basic CRUD operations for clients and policies
- [x] SQLite database integration
- [x] Material Design 3 UI
- [x] Navigation structure
- [x] Redux state management

### Phase 2 (Next)
- [ ] Google Sheets cloud synchronization
- [ ] Push notifications for renewals
- [ ] Calendar view for renewals
- [ ] Advanced search and filtering
- [ ] Data export functionality

### Phase 3 (Future)
- [ ] Document storage and photo capture
- [ ] Commission tracking
- [ ] Advanced reporting and analytics
- [ ] Multi-agent support
- [ ] Integration with insurance company APIs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ankita Jhawarils**
- Email: ankitagj7@gmail.com

## 🙏 Acknowledgments

- React Native and Expo teams for the excellent development platform
- Material Design team for the comprehensive design system
- Open source community for the amazing libraries and tools

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page for existing solutions
2. Create a new issue with detailed information
3. Contact the author via email

---

**Note**: This app is designed for professional use by insurance agents. Ensure you comply with local data protection regulations when handling client information.
