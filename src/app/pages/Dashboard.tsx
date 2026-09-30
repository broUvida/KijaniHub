import { Trash2, Leaf, Home, CloudRain, Droplets, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import InfoBanner from '../components/InfoBanner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import VolunteerDashboard from './VolunteerDashboard';
import RegionalManagerDashboard from './RegionalManagerDashboard';

/**
 * Mock historical data for charts
 */
const wasteCollectionData = [
  { date: 'Mar 14', waste: 320, id: 'w1' },
  { date: 'Mar 15', waste: 380, id: 'w2' },
  { date: 'Mar 16', waste: 420, id: 'w3' },
  { date: 'Mar 17', waste: 390, id: 'w4' },
  { date: 'Mar 18', waste: 450, id: 'w5' },
  { date: 'Mar 19', waste: 480, id: 'w6' },
  { date: 'Mar 20', waste: 520, id: 'w7' },
];

const productionData = [
  { month: 'Oct', frass: 280, compost: 340, id: 'p1' },
  { month: 'Nov', frass: 320, compost: 380, id: 'p2' },
  { month: 'Dec', frass: 360, compost: 420, id: 'p3' },
  { month: 'Jan', frass: 410, compost: 460, id: 'p4' },
  { month: 'Feb', frass: 450, compost: 490, id: 'p5' },
  { month: 'Mar', frass: 520, compost: 540, id: 'p6' },
];

const deviceStatusData = [
  { name: 'Online', value: 6, color: '#10b981', id: 'online' },
  { name: 'Warning', value: 2, color: '#f59e0b', id: 'warning' },
  { name: 'Offline', value: 0, color: '#ef4444', id: 'offline' },
];

/**
 * Dashboard - Main overview page showing all key metrics
 * Displays total waste, fertilizer, households served, CO2 reduction, and device status
 * Shows different views for Admin vs Volunteer roles
 */
export default function Dashboard() {
  const { metrics, devices, userRole } = useApp();

  // If user is a volunteer, show the volunteer-specific dashboard
  if (userRole === 'volunteer') {
    return <VolunteerDashboard />;
  }

  if (userRole === 'regional_manager') {
    return <RegionalManagerDashboard />;
  }

  // Admin and Regional Manager view
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Real-time monitoring of Kijani Hub operations</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title="Total Waste Collected"
          value={`${metrics.totalWasteCollected.toLocaleString()} kg`}
          icon={Trash2}
          color="green"
          subtitle="All collection points"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Fertilizer (Frass) Produced"
          value={`${metrics.fertilizerProduced.toLocaleString()} kg`}
          icon={Leaf}
          color="purple"
          subtitle="From BSF farming"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Households Served"
          value={metrics.householdsServed.toLocaleString()}
          icon={Home}
          color="blue"
          subtitle="Across Dar es Salaam"
        />
        <StatCard
          title="CO₂ Emissions Reduced"
          value={`${metrics.co2Reduced.toLocaleString()} kg`}
          icon={CloudRain}
          color="teal"
          subtitle="Environmental impact"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Hygiene Station Usage"
          value={metrics.hygieneUsage.toLocaleString()}
          icon={Droplets}
          color="blue"
          subtitle="Handwashing events"
          trend={{ value: 22, isPositive: true }}
        />
        <StatCard
          title="Active IoT Devices"
          value={`${metrics.activeDevices}/${metrics.totalDevices}`}
          icon={Activity}
          color="orange"
          subtitle="System health"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Collection Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Waste Collection Trend (7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={wasteCollectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="waste" stroke="#10b981" strokeWidth={2} name="Waste (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Production Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Production Overview (6 Months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="frass" fill="#8b5cf6" name="Frass (kg)" />
              <Bar dataKey="compost" fill="#10b981" name="Compost (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Device Status and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Device Status</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={deviceStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {deviceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {deviceStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-800">{item.value} devices</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Device Updates */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Device Updates</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {devices.slice(0, 5).map((device) => (
              <div key={device.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  device.status === 'online' ? 'bg-green-500' :
                  device.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{device.name}</p>
                  <p className="text-xs text-gray-500">{device.location.address}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Updated: {device.lastUpdate.toLocaleTimeString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                  device.status === 'online' ? 'bg-green-100 text-green-700' :
                  device.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {device.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <InfoBanner
        title="Welcome to KijaniSense MVP"
        message="This dashboard displays simulated IoT data. Real-time updates occur every 10 seconds. Data is stored in your browser's LocalStorage for offline access. Use the sidebar to explore different modules."
        type="info"
      />

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">About KijaniSense</h3>
        <p className="text-emerald-50">
          KijaniSense is an IoT-powered platform for monitoring circular economy operations at Kijani Hub, Tanzania. 
          This system tracks waste management, Black Soldier Fly farming, composting, biogas production, and hygiene stations 
          to maximize environmental impact and operational efficiency.
        </p>
      </div>
    </div>
  );
}