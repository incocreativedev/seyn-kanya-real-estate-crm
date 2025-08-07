# 🏢 Tyson Properties Real Estate CRM - Progressive Web App

A modern, full-featured Progressive Web App (PWA) for real estate professionals to manage clients, leads, properties, and reminders. Features offline functionality, cloud database sync, and user authentication.

## 🚀 Features

### 📱 Progressive Web App
- **Installable** on phones, tablets, and desktops
- **Offline functionality** with service worker caching
- **Push notifications** for reminders and updates
- **App shortcuts** for quick actions
- **Auto-updates** with version management

### 🔐 Authentication & Security
- **User registration and login** system
- **JWT-based authentication** with secure token storage
- **Session management** with automatic logout
- **Multi-user support** with data isolation
- **Password security** with hashing and validation

### 📊 CRM Functionality
- **Client Management** - Track customers with budget ranges and preferences
- **Lead Tracking** - Manage potential clients with follow-up dates
- **Property Listings** - Organize real estate inventory with full details
- **Reminders & Tasks** - Never miss important follow-ups
- **Notes & Comments** - Document all client interactions
- **Advanced Search** - Find information quickly across all data

### 🌐 Database & Sync
- **PostgreSQL Database** via Neon cloud hosting
- **Real-time sync** between devices
- **Offline backup** in localStorage
- **Data migration** from local to cloud storage
- **Export functionality** (JSON/CSV) for backups

## 🛠 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Netlify Functions
- **Database**: PostgreSQL (Neon hosting)
- **Deployment**: Netlify with automatic builds
- **PWA**: Service Worker, Web App Manifest
- **Authentication**: JWT tokens with secure session management

## 📥 Installation

### As a Progressive Web App:
1. Visit the deployed site on your device
2. Look for the "📱 Install App" button or browser install prompt
3. Follow prompts to install on your home screen
4. Launch like any native app!

### For Development:
```bash
# Clone the repository
git clone <your-repo-url>
cd seyn-kanya-real-estate-crm

# Install dependencies
npm install

# Start local development server
netlify dev

# Visit http://localhost:8888
```

## 🔧 Configuration

### Environment Variables (Netlify)
Set these in your Netlify dashboard under Site Settings > Environment Variables:

```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

### Deployment
The app is configured for automatic deployment via Netlify:
1. Connect your GitHub repository to Netlify
2. Set the environment variables
3. Deploy automatically on every push to main branch

## 📱 Usage Guide

### First Time Setup
1. **Register**: Create your account with email and password
2. **Login**: Access your personal CRM dashboard
3. **Install**: Add the app to your device's home screen
4. **Import**: Migrate any existing data from localStorage

### Daily Workflow
1. **Check Reminders**: Review today's tasks and follow-ups
2. **Manage Clients**: Add new clients or update existing information
3. **Track Leads**: Follow up on potential customers
4. **Update Properties**: Maintain current property listings
5. **Add Notes**: Document all client interactions

### Offline Usage
- **View Data**: Access previously loaded information
- **Cache Management**: Service worker caches essential data
- **Background Sync**: Changes sync when connection returns
- **Offline Indicator**: Visual feedback for connection status

## 🔒 Security Features

- **Secure Authentication**: Passwords hashed with PBKDF2
- **Session Management**: Automatic token expiration
- **Data Isolation**: Each user sees only their own data
- **HTTPS Required**: All traffic encrypted in production
- **Input Validation**: Server-side validation for all forms

## 📊 Data Management

### Backup & Export
- **Automatic Backup**: Data stored in cloud database
- **Manual Export**: Download JSON or CSV files
- **Migration Tools**: Move data from localStorage to database
- **Version Control**: Database migrations for updates

### Multi-Device Sync
- **Real-time Updates**: Changes sync across all devices
- **Conflict Resolution**: Handles simultaneous edits gracefully
- **Offline Changes**: Queued and synced when connection returns

## 🎯 Keyboard Shortcuts

- `Ctrl/Cmd + K`: Quick search across all data
- `Ctrl/Cmd + N`: Add new client
- `Ctrl/Cmd + P`: Add new property
- `Ctrl/Cmd + R`: Add new reminder

## 🔧 Troubleshooting

### Common Issues
1. **Login Problems**: Clear browser cache and try again
2. **Sync Issues**: Check internet connection and refresh
3. **Install Issues**: Use supported browser (Chrome, Edge, Safari)
4. **Performance**: Clear app cache in settings

### Support
- Check browser console for error messages
- Verify environment variables are set correctly
- Test database connectivity from Netlify dashboard
- Review Netlify function logs for backend issues

## 🚀 Future Enhancements

- **Document Management**: File upload and storage
- **Advanced Reporting**: Analytics and insights
- **Calendar Integration**: Sync with Google Calendar
- **Email Templates**: Automated client communications
- **Team Collaboration**: Multi-agent support
- **Mobile App**: Native iOS/Android versions

## 📄 License

MIT License - See LICENSE file for details.

---

**Built with ❤️ for Real Estate Professionals**

*Tyson Properties Real Estate CRM - Premium property management made simple.*