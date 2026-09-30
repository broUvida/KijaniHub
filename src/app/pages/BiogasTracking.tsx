import { useApp } from '../context/AppContext';
import { Flame, Gauge, Zap, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

/**
 * Mock biogas production data
 */
const dailyProduction = [
  { hour: '00:00', gas: 2.1, energy: 5.2 },
  { hour: '04:00', gas: 2.5, energy: 6.1 },
  { hour: '08:00', gas: 3.2, energy: 7.8 },
  { hour: '12:00', gas: 3.8, energy: 9.3 },
  { hour: '16:00', gas: 3.5, energy: 8.5 },
  { hour: '20:00', gas: 2.8, energy: 6.8 },
];

const monthlyData = [
  { month: 'Oct', gas: 85, energy: 210 },
  { month: 'Nov', gas: 92, energy: 225 },
  { month: 'Dec', gas: 88, energy: 215 },
  { month: 'Jan', gas: 95, energy: 232 },
  { month: 'Feb', gas: 102, energy: 248 },
  { month: 'Mar', gas: 108, energy: 265 },
];

/**
 * BiogasTracking - Monitor biogas production and energy generation
 * Tracks gas production rates, pressure, temperature, and energy output
 */
export default function BiogasTracking() {
  const { devices } = useApp();
  const biogasMeters = devices.filter(d => d.type === 'biogas_meter');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Biogas & Energy Production</h1>
        <p className="text-gray-600 mt-1">Monitor biogas generation and energy output</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Flame size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Digesters</p>
              <p className="text-2xl font-bold text-gray-800">{biogasMeters.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Gauge size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Gas Today</p>
              <p className="text-2xl font-bold text-gray-800">
                {biogasMeters.reduce((sum, m) => sum + m.data.gasProduction, 0).toFixed(1)} m³
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Zap size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Energy Generated</p>
              <p className="text-2xl font-bold text-gray-800">
                {biogasMeters.reduce((sum, m) => sum + m.data.energyGenerated, 0).toFixed(1)} kWh
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Growth</p>
              <p className="text-2xl font-bold text-gray-800">+15%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Biogas Digester Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Biogas Digester Status</h3>
        <div className="space-y-4">
          {biogasMeters.map((meter) => {
            // Calculate efficiency rating
            const efficiency = meter.data.gasProduction > 3 ? 'Excellent' : 
                             meter.data.gasProduction > 2 ? 'Good' : 'Fair';
            const efficiencyColor = efficiency === 'Excellent' ? 'green' :
                                   efficiency === 'Good' ? 'blue' : 'yellow';

            return (
              <div key={meter.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">{meter.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        efficiencyColor === 'green' ? 'bg-green-100 text-green-700' :
                        efficiencyColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {efficiency} Performance
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{meter.location.address}</p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Gas Production */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Gauge size={16} className="text-blue-600" />
                          <span className="text-xs text-gray-600">Gas Production</span>
                        </div>
                        <p className="text-xl font-bold text-gray-800">{meter.data.gasProduction} m³</p>
                        <p className="text-xs text-gray-500 mt-1">Per day</p>
                      </div>

                      {/* Pressure */}
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Gauge size={16} className="text-purple-600" />
                          <span className="text-xs text-gray-600">Pressure</span>
                        </div>
                        <p className="text-xl font-bold text-gray-800">{meter.data.pressure} bar</p>
                        <p className="text-xs text-gray-500 mt-1">Current</p>
                      </div>

                      {/* Temperature */}
                      <div className="bg-orange-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Flame size={16} className="text-orange-600" />
                          <span className="text-xs text-gray-600">Temperature</span>
                        </div>
                        <p className="text-xl font-bold text-gray-800">{meter.data.temperature}°C</p>
                        <p className="text-xs text-gray-500 mt-1">Digester temp</p>
                      </div>

                      {/* Energy */}
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap size={16} className="text-yellow-600" />
                          <span className="text-xs text-gray-600">Energy Output</span>
                        </div>
                        <p className="text-xl font-bold text-gray-800">{meter.data.energyGenerated.toFixed(1)} kWh</p>
                        <p className="text-xs text-gray-500 mt-1">Total generated</p>
                      </div>
                    </div>

                    {/* Production Rate Indicator */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Production Rate</span>
                        <span>{Math.round((meter.data.gasProduction / 5) * 100)}% of capacity</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            meter.data.gasProduction > 3 ? 'bg-green-500' :
                            meter.data.gasProduction > 2 ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min(100, (meter.data.gasProduction / 5) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Last updated: {meter.lastUpdate.toLocaleString()}
                  </p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    meter.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {meter.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Production */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Gas Production (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyProduction}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="gas" stroke="#3b82f6" fill="#93c5fd" name="Gas Production (m³)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Energy Generation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Energy Generation (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyProduction}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="energy" stroke="#eab308" strokeWidth={2} name="Energy (kWh)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Production Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="gas" stroke="#3b82f6" fill="#93c5fd" name="Total Gas (m³)" />
            <Area yAxisId="right" type="monotone" dataKey="energy" stroke="#eab308" fill="#fde047" name="Total Energy (kWh)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Impact Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-6 text-white">
          <h4 className="text-lg font-semibold mb-2">🌍 CO₂ Equivalent Saved</h4>
          <p className="text-3xl font-bold mb-1">2,847 kg</p>
          <p className="text-sm text-green-100">By replacing fossil fuels with biogas</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
          <h4 className="text-lg font-semibold mb-2">⚡ Homes Powered</h4>
          <p className="text-3xl font-bold mb-1">~35 homes</p>
          <p className="text-sm text-blue-100">Based on average daily production</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-6 text-white">
          <h4 className="text-lg font-semibold mb-2">💰 Cost Savings</h4>
          <p className="text-3xl font-bold mb-1">TZS 1.2M</p>
          <p className="text-sm text-orange-100">Monthly energy cost reduction</p>
        </div>
      </div>

      {/* Biogas Info */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-3">About Biogas Production</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-orange-50 text-sm">
          <div>
            <p className="font-semibold mb-2">Production Process:</p>
            <ul className="space-y-1">
              <li>• Anaerobic digestion of organic waste</li>
              <li>• Optimal temperature: 30-40°C (mesophilic)</li>
              <li>• Retention time: 20-40 days</li>
              <li>• Produces 60% methane, 40% CO₂</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Applications:</p>
            <ul className="space-y-1">
              <li>• Cooking fuel for households</li>
              <li>• Electricity generation via generators</li>
              <li>• Heating for BSF and compost operations</li>
              <li>• Digestate used as organic fertilizer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
