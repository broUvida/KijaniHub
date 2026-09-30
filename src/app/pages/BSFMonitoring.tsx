import { useApp } from '../context/AppContext';
import { Bug, Thermometer, Droplets, Scale } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

/**
 * Mock BSF growth data
 */
const growthData = [
  { day: 'Day 1', weight: 2, temp: 28, humidity: 60 },
  { day: 'Day 3', weight: 5, temp: 30, humidity: 62 },
  { day: 'Day 5', weight: 12, temp: 31, humidity: 65 },
  { day: 'Day 7', weight: 23, temp: 32, humidity: 67 },
  { day: 'Day 9', weight: 35, temp: 31, humidity: 66 },
  { day: 'Day 11', weight: 45, temp: 32, humidity: 68 },
  { day: 'Day 13', weight: 52, temp: 31, humidity: 65 },
];

const productionData = [
  { week: 'Week 1', frass: 45, larvae: 12 },
  { week: 'Week 2', frass: 52, larvae: 15 },
  { week: 'Week 3', frass: 48, larvae: 14 },
  { week: 'Week 4', frass: 58, larvae: 17 },
];

/**
 * BSFMonitoring - Black Soldier Fly production monitoring
 * Tracks growth conditions, larvae development, and frass production
 */
export default function BSFMonitoring() {
  const { devices } = useApp();
  const bsfSensors = devices.filter(d => d.type === 'bsf_sensor');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">BSF Production Monitoring</h1>
        <p className="text-gray-600 mt-1">Track Black Soldier Fly farming conditions and production</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Bug size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Units</p>
              <p className="text-2xl font-bold text-gray-800">{bsfSensors.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Thermometer size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Temperature</p>
              <p className="text-2xl font-bold text-gray-800">
                {Math.round(bsfSensors.reduce((sum, s) => sum + s.data.temperature, 0) / bsfSensors.length)}°C
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Droplets size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Humidity</p>
              <p className="text-2xl font-bold text-gray-800">
                {Math.round(bsfSensors.reduce((sum, s) => sum + s.data.humidity, 0) / bsfSensors.length)}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Scale size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Larvae</p>
              <p className="text-2xl font-bold text-gray-800">
                {Math.round(bsfSensors.reduce((sum, s) => sum + s.data.larvaeWeight, 0))} kg
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BSF Unit Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">BSF Unit Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bsfSensors.map((sensor) => (
            <div key={sensor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-800">{sensor.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{sensor.location.address}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  sensor.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {sensor.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Temperature */}
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer size={16} className="text-orange-600" />
                    <span className="text-xs text-gray-600">Temperature</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">{sensor.data.temperature}°C</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Optimal: 28-35°C
                  </p>
                </div>

                {/* Humidity */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets size={16} className="text-blue-600" />
                    <span className="text-xs text-gray-600">Humidity</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">{sensor.data.humidity}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Optimal: 60-70%
                  </p>
                </div>

                {/* Larvae Weight */}
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Bug size={16} className="text-purple-600" />
                    <span className="text-xs text-gray-600">Larvae Weight</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">{sensor.data.larvaeWeight} kg</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Current batch
                  </p>
                </div>

                {/* Feed Rate */}
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale size={16} className="text-green-600" />
                    <span className="text-xs text-gray-600">Feed Rate</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">{sensor.data.feedRate} kg/day</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Daily average
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Last updated: {sensor.lastUpdate.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Larvae Growth Curve */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Larvae Growth Curve</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="weight" stroke="#8b5cf6" fill="#c4b5fd" name="Weight (kg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Environmental Conditions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Environmental Conditions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} name="Temperature (°C)" />
              <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} name="Humidity (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Production */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Production Output</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={productionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="frass" stackId="1" stroke="#10b981" fill="#86efac" name="Frass (kg)" />
            <Area type="monotone" dataKey="larvae" stackId="1" stroke="#8b5cf6" fill="#c4b5fd" name="Larvae Harvested (kg)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Best Practices Info */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">BSF Farming Best Practices</h3>
        <ul className="space-y-1 text-purple-50 text-sm">
          <li>• Maintain temperature between 28-35°C for optimal growth</li>
          <li>• Keep humidity levels at 60-70% to prevent desiccation</li>
          <li>• Feed regularly with organic waste at appropriate ratios</li>
          <li>• Monitor larvae development cycle (10-14 days to maturity)</li>
          <li>• Harvest frass (fertilizer) every 3-4 days for best quality</li>
        </ul>
      </div>
    </div>
  );
}
