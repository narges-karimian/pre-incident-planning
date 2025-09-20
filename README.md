# Pre-Incident Planning System

A comprehensive web application for emergency response planning and building risk assessment, built with Vue.js and Quasar Framework.

## 🚀 Overview

The Pre-Incident Planning System is a sophisticated emergency management platform designed to help fire departments, emergency responders, and building managers assess and plan for potential incidents. The system provides interactive mapping, building assessment tools, hazard identification, and AI-powered incident planning capabilities.

## ✨ Key Features

### 🗺️ Interactive Mapping

- **OpenStreetMap Integration**: Real-time mapping with Leaflet.js
- **Location Search**: Advanced search functionality for buildings and addresses
- **Equipment Visualization**: Interactive markers for emergency equipment and resources
- **Floor-by-Floor Navigation**: Detailed floor plans with equipment positioning

### 🏢 Building Assessment

- **Comprehensive Building Profiles**: Detailed building information collection
- **Risk Assessment**: Fire risk and incident risk evaluation
- **Floor Management**: Multi-floor building support with equipment mapping
- **Checklist System**: Standardized assessment checklists

### ⚠️ Hazard Management

- **Hazard Identification**: Comprehensive hazard icon system
- **Resource Management**: Emergency response resource categorization
- **USAR Integration**: Urban Search and Rescue resource mapping
- **Access Hazard Assessment**: Building access point evaluation

### 🤖 AI-Powered Planning

- **Pre-Incident Planning (PIP)**: AI-generated incident response plans
- **Building Data Analysis**: Automated risk assessment and recommendations
- **Smart Recommendations**: Context-aware emergency response suggestions

### 📱 Modern User Experience

- **Responsive Design**: Mobile-first approach with PWA capabilities
- **Persian/Farsi Support**: Full RTL language support
- **Real-time Updates**: Live data synchronization
- **Offline Capabilities**: IndexedDB for offline data storage

## 🛠️ Technology Stack

### Frontend

- **Vue.js 3**: Progressive JavaScript framework
- **Quasar Framework**: Vue.js based UI framework
- **Pinia**: State management
- **Vue Router**: Client-side routing
- **Vue i18n**: Internationalization

### Mapping & Visualization

- **Leaflet.js**: Interactive maps
- **Vue-Leaflet**: Vue integration for Leaflet
- **OpenStreetMap**: Map tiles and geocoding

### Development Tools

- **Vite**: Fast build tool
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **PostCSS**: CSS processing

### Mobile Support

- **Capacitor**: Cross-platform mobile development
- **PWA**: Progressive Web App capabilities

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm
- Git

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd preIncidentPlanning
   ```

2. **Install dependencies**

   ```bash
   # Using pnpm (recommended)
   pnpm install

   # Or using npm
   npm install

   # Or using yarn
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   OPEN_STREET_TILE_API=https://tile.openstreetmap.org/{z}/{x}/{y}.png
   API_BASE_URL=http://localhost:8000
   ```

4. **Start development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Build for production**
   ```bash
   pnpm build
   # or
   npm run build
   ```

## 🏗️ Project Structure

```
src/
├── components/           # Reusable Vue components
│   ├── aiDialog.vue     # AI planning dialog
│   ├── BuildingInfoDialog.vue
│   ├── FloorSelector.vue
│   ├── SearchBox.vue
│   └── EditBuildingForms/ # Building form components
├── pages/               # Application pages
│   ├── IndexPage.vue    # Main map interface
│   ├── EditBuildingPage.vue
│   ├── ProfilePage.vue
│   └── auth/           # Authentication pages
├── stores/              # Pinia state management
│   ├── auth/           # Authentication state
│   ├── shared/         # Shared application state
│   ├── search/         # Search functionality
│   └── fireStation/   # Fire station data
├── utils/               # Utility functions
│   ├── hazardIconData/ # Hazard and resource icons
│   ├── hazardIcons.js
│   └── indexedDB.js    # Offline storage
├── css/                 # Global styles
├── i18n/               # Internationalization
└── router/             # Vue Router configuration
```

## 🔧 Configuration

### Quasar Configuration

The application uses Quasar Framework with the following key configurations:

- **Language**: Persian (fa)
- **Icons**: Material Icons
- **Build Target**: Modern browsers (ES2022+)
- **Router Mode**: Hash routing

### Mobile Development

For mobile app development:

```bash
# Add mobile platforms
npx cap add android
npx cap add ios

# Build and sync
pnpm build
npx cap sync
```

## 🚀 Deployment

### Web Deployment

1. Build the application:

   ```bash
   pnpm build
   ```

2. Deploy the `dist/spa` folder to your web server

### Mobile Deployment

1. Build the web assets:

   ```bash
   pnpm build
   ```

2. Sync with Capacitor:

   ```bash
   npx cap sync
   ```

3. Open in native IDEs:
   ```bash
   npx cap open android
   npx cap open ios
   ```

## 📱 Features in Detail

### Building Assessment Workflow

1. **Search & Select**: Find buildings using the search interface
2. **Basic Information**: Collect building details and specifications
3. **Floor Planning**: Map floors and equipment locations
4. **Hazard Identification**: Assess and categorize potential hazards
5. **Risk Evaluation**: Generate risk scores and recommendations
6. **Plan Generation**: Create AI-powered incident response plans

### Equipment Management

- **Resource Icons**: Comprehensive icon library for emergency equipment
- **Status Tracking**: Real-time equipment status monitoring
- **Location Mapping**: Precise positioning on building floors
- **Category Management**: Organized by emergency response types

### User Management

- **Authentication**: Secure user login and session management
- **Role-based Access**: Different access levels for various user types
- **Profile Management**: User information and preferences

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Narges Karimian** - _Initial work_ - [nargeskarimian1551@gmail.com](mailto:nargeskarimian1551@gmail.com)

## 🙏 Acknowledgments

- Quasar Framework team for the excellent Vue.js framework
- OpenStreetMap contributors for mapping data
- Vue.js community for the progressive framework
- Emergency response professionals for domain expertise

## 📞 Support

For support and questions, please contact:

- Email: nargeskarimian1551@gmail.com
- Create an issue in the repository

---

**Note**: This application is designed for emergency response planning and should be used in conjunction with proper emergency management protocols and training.
