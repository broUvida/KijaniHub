# KijaniSense - IoT Dashboard for Circular Economy

![KijaniSense](https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=300&fit=crop)

## Overview

**KijaniSense** is a comprehensive IoT monitoring platform designed for **Kijani Hub**, a circular economy project in Dar es Salaam, Tanzania. The system provides real-time monitoring and analytics for:

- 🗑️ **Waste Collection** - Smart bin monitoring and collection optimization
- 🐛 **BSF (Black Soldier Fly) Farming** - Growth condition tracking and frass production
- 🌱 **Composting** - Quality monitoring and maturation tracking
- 🔥 **Biogas Production** - Energy generation and gas production metrics
- 💧 **WASH Stations** - Hygiene station usage and supply monitoring

## Key Features

### 📊 Dashboard Overview
- Total waste collected (kg)
- Fertilizer (frass) produced
- Number of households/areas served
- CO₂ emissions reduced (calculated)
- Hygiene station usage statistics
- Real-time device status monitoring

### 📡 IoT Data Integration
- Real-time sensor data simulation
- Temperature, humidity, fill levels, gas production, water usage tracking
- Automatic data updates every 10 seconds
- LocalStorage persistence for offline capability

### 🗺️ Interactive Map
- OpenStreetMap integration showing all device locations
- Color-coded markers by device type
- Detailed device popups with current data
- Coverage area visualization

### 👥 User Roles
- **Admin** - Full system access and control
- **Regional Manager** - Regional monitoring and reporting
- **Volunteer/User** - View data and input readings

### 📈 Data Visualization
- Daily, weekly, and monthly trend charts
- Production graphs and comparisons
- Real-time status indicators
- Quality metrics radar charts

### 🌐 Offline Capability
- LocalStorage for data persistence
- Offline indicator in header
- Pending sync counter when offline
- Automatic sync when connection restored

### 🔔 Smart Notifications
- Bin full alerts (>85% capacity)
- Low soap/water alerts (<20% / <30%)
- Real-time notification badge
- Device-specific notifications

## Technology Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript** - Type safety
- **React Router 7** - Navigation and routing
- **Tailwind CSS v4** - Styling and responsive design
- **Recharts** - Data visualization and charts
- **Leaflet & React-Leaflet** - Interactive maps
- **Lucide React** - Icon library

### Data Management
- **Context API** - Global state management
- **LocalStorage** - Client-side persistence
- **Mock IoT Simulation** - Real-time data generation

### Design
- Green and blue color theme (environment + technology)
- Fully responsive (mobile, tablet, desktop)
- Clean, modern UI with card-based layouts
- Accessible navigation and controls

## Project Structure

```
kijanisense/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── Header.tsx          # Top navigation with notifications
│   │   │   ├── Sidebar.tsx         # Left navigation menu
│   │   │   └── StatCard.tsx        # Reusable metric card
│   │   ├── context/
│   │   │   └── AppContext.tsx      # Global state and IoT simulation
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # Main overview page
│   │   │   ├── WasteTracking.tsx   # Waste bin monitoring
│   │   │   ├── BSFMonitoring.tsx   # BSF production tracking
│   │   │   ├── CompostMonitoring.tsx # Compost quality
│   │   │   ├── BiogasTracking.tsx  # Biogas/energy production
│   │   │   ├── WASHMonitoring.tsx  # Hygiene stations
│   │   │   ├── MapView.tsx         # Interactive map
│   │   │   └── NotFound.tsx        # 404 page
│   │   ├── App.tsx                 # Main app entry
│   │   ├── Root.tsx                # Layout wrapper
│   │   └── routes.tsx              # Route configuration
│   └── styles/
│       ├── index.css               # Main stylesheet
│       ├── theme.css               # Design tokens
│       ├── tailwind.css            # Tailwind imports
│       └── map.css                 # Map-specific styles
├── package.json
└── README.md
```

## Component Documentation

### AppContext
Central state management providing:
- User role management (admin, regional_manager, volunteer)
- IoT device data and real-time updates
- Notification system
- Dashboard metrics calculation
- Online/offline status tracking

### Dashboard
Main overview showing:
- 6 key metric cards (waste, fertilizer, households, CO₂, hygiene, devices)
- Waste collection trend (7-day line chart)
- Production overview (6-month bar chart)
- Device status pie chart
- Recent device update feed

### Individual Module Pages
Each module page includes:
- Summary statistics cards
- Real-time device status monitoring
- Trend charts and visualizations
- Device-specific metrics
- Best practices information
- Maintenance schedules (where applicable)

### MapView
Interactive OpenStreetMap showing:
- All device locations with custom markers
- Clickable popups with device details
- Color-coded legend
- Device list with status indicators
- Geographic coverage information

## Mock Data & Simulation

The application includes comprehensive mock data generation:

### Device Types
1. **Waste Bins** - Fill level, temperature, last collection date
2. **BSF Sensors** - Temperature, humidity, larvae weight, feed rate
3. **Compost Monitors** - Temperature, humidity, pH, moisture
4. **Biogas Meters** - Gas production, pressure, temperature, energy
5. **WASH Stations** - Handwash count, soap level, water level

### Real-time Simulation
- Updates every 10 seconds
- Realistic value fluctuations
- Status changes based on thresholds
- Automatic notification generation

## Metrics & Calculations

### CO₂ Reduction
- Formula: `Total Waste (kg) × 0.4 kg CO₂ per kg waste`
- Represents emissions avoided through circular economy practices

### Fertilizer Production
- Simulated conversion rate from BSF larvae weight
- Factor: `Larvae Weight × 8.5 = Frass (kg)`

### Energy Generation
- Biogas to electricity conversion
- Tracked in kWh per digester

## User Role Features

### Admin
- Full access to all modules
- System-wide statistics
- Can view all notifications
- Access to all device data

### Regional Manager
- Same UI access as Admin
- Intended for regional oversight
- Can monitor specific geographic areas

### Volunteer
- View-only access to data
- Can see current device status
- Useful for field data collection

## Offline Capability

The system supports offline operation:

1. **LocalStorage Persistence**
   - Device data saved locally
   - Survives page refreshes
   - Maintains state across sessions

2. **Online/Offline Detection**
   - Indicator in header
   - Shows pending sync count
   - Auto-sync when reconnected

3. **Data Entry**
   - Can view cached data offline
   - Changes saved locally
   - Sync when connection restored

## Responsive Design

### Mobile (< 768px)
- Collapsible sidebar menu
- Stacked metric cards
- Simplified charts
- Touch-friendly controls

### Tablet (768px - 1024px)
- 2-column layouts
- Optimized chart sizes
- Persistent sidebar option

### Desktop (> 1024px)
- Multi-column grids
- Full sidebar navigation
- Larger charts and visualizations
- Enhanced data tables

## Environmental Impact

KijaniSense helps track and maximize environmental benefits:

- **Waste Diversion** - Keeps organic waste out of landfills
- **Fertilizer Production** - Creates valuable soil amendments
- **Biogas Generation** - Renewable energy production
- **Disease Prevention** - Hygiene station monitoring reduces waterborne illness
- **Carbon Footprint** - Tracks and reduces CO₂ emissions

## Future Expansion Opportunities

### AI & Machine Learning
- Predictive maintenance for bins and stations
- Optimal collection route planning
- Production yield forecasting
- Anomaly detection in sensor data

### Additional Features
- SMS/WhatsApp notifications for rural areas
- Multi-language support (Swahili, English)
- Mobile app for field workers
- Automated reporting and exports
- Integration with payment systems

### Hardware Integration
- Support for real MQTT broker connections
- LoRaWAN sensor integration
- Solar power monitoring
- Weather station integration

## Development Notes

### Code Quality
- Comprehensive inline comments explaining functionality
- TypeScript for type safety
- Modular component architecture
- Reusable utilities and hooks

### Performance
- Optimized re-renders with Context API
- Efficient chart rendering
- Lazy loading for map components
- Debounced real-time updates

### Scalability
- Easy to add new device types
- Extensible notification system
- Modular routing structure
- Configurable update intervals

## Getting Started

This is a **Minimum Viable Product (MVP)** demonstrating the core functionality of an IoT monitoring platform. The mock data simulates real sensor inputs, making it easy to:

1. Visualize the dashboard concept
2. Test user flows and interactions
3. Demonstrate to stakeholders
4. Plan backend integration
5. Expand with real IoT devices

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project was created for Kijani Hub Tanzania's circular economy initiative.

---

**Built with ❤️ for a sustainable future in Tanzania**

For questions or support, contact the Kijani Hub team.
