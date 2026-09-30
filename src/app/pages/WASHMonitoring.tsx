import { useApp } from '../context/AppContext';
import { Droplets, Sparkles, HandMetal, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

/**
 * Mock WASH usage data
 */
const hourlyUsage = [
  { hour: '6AM', usage: 45 },
  { hour: '8AM', usage: 78 },
  { hour: '10AM', usage: 52 },
  { hour: '12PM', usage: 89 },
  { hour: '2PM', usage: 67 },
  { hour: '4PM', usage: 71 },
  { hour: '6PM', usage: 43 },
];

const weeklyTrend = [
  { day: 'Mon', usage: 412, refills: 2 },
  { day: 'Tue', usage: 458, refills: 1 },
  { day: 'Wed', usage: 523, refills: 3 },
  { day: 'Thu', usage: 489, refills: 2 },
  { day: 'Fri', usage: 567, refills: 2 },
  { day: 'Sat', usage: 234, refills: 1 },
  { day: 'Sun', usage: 189, refills: 0 },
];

/**
 * WASHMonitoring - Monitor hygiene station usage and supplies
 * Tracks handwashing events, soap/water levels, and maintenance needs
 */
export default function WASHMonitoring() {
  const { devices } = useApp();
  const washStations = devices.filter(d => d.type === 'wash_station');

  const totalUsageToday = washStations.reduce((sum, s) => sum + s.data.handwashCount, 0);
  const avgSoapLevel = washStations.reduce((sum, s) => sum + s.data.soapLevel, 0) / washStations.length;
  const avgWaterLevel = washStations.reduce((sum, s) => sum + s.data.waterLevel, 0) / washStations.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">WASH Station Monitoring</h1>
        <p className="text-gray-600 mt-1">Track hygiene station usage and supply levels</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Droplets size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Stations</p>
              <p className="text-2xl font-bold text-gray-800">{washStations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <HandMetal size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Usage Today</p>
              <p className="text-2xl font-bold text-gray-800">{totalUsageToday}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Sparkles size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Soap Level</p>
              <p className="text-2xl font-bold text-gray-800">{Math.round(avgSoapLevel)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-teal-100 p-3 rounded-lg">
              <Users size={24} className="text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Weekly Users</p>
              <p className="text-2xl font-bold text-gray-800">2,872</p>
            </div>
          </div>
        </div>
      </div>

      {/* WASH Station Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Station Status & Supply Levels</h3>
        <div className="space-y-4">
          {washStations.map((station) => {
            const needsAttention = station.data.soapLevel < 20 || station.data.waterLevel < 30;

            return (
              <div 
                key={station.id} 
                className={`border rounded-lg p-5 hover:shadow-md transition-shadow ${
                  needsAttention ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">{station.name}</h4>
                      {needsAttention && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          ⚠️ Attention Needed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{station.location.address}</p>

                    {/* Usage Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <HandMetal size={16} className="text-green-600" />
                          <span className="text-xs text-gray-600">Handwashing Events</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{station.data.handwashCount}</p>
                        <p className="text-xs text-gray-500 mt-1">Today</p>
                      </div>

                      <div className={`rounded-lg p-3 ${
                        station.data.soapLevel < 20 ? 'bg-red-50' : 'bg-purple-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={16} className={station.data.soapLevel < 20 ? 'text-red-600' : 'text-purple-600'} />
                          <span className="text-xs text-gray-600">Soap Level</span>
                        </div>
                        <p className={`text-2xl font-bold ${
                          station.data.soapLevel < 20 ? 'text-red-700' : 'text-gray-800'
                        }`}>
                          {Math.round(station.data.soapLevel)}%
                        </p>
                        {station.data.soapLevel < 20 && (
                          <p className="text-xs text-red-600 mt-1 font-medium">Refill needed!</p>
                        )}
                      </div>

                      <div className={`rounded-lg p-3 ${
                        station.data.waterLevel < 30 ? 'bg-red-50' : 'bg-blue-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Droplets size={16} className={station.data.waterLevel < 30 ? 'text-red-600' : 'text-blue-600'} />
                          <span className="text-xs text-gray-600">Water Level</span>
                        </div>
                        <p className={`text-2xl font-bold ${
                          station.data.waterLevel < 30 ? 'text-red-700' : 'text-gray-800'
                        }`}>
                          {Math.round(station.data.waterLevel)}%
                        </p>
                        {station.data.waterLevel < 30 && (
                          <p className="text-xs text-red-600 mt-1 font-medium">Refill needed!</p>
                        )}
                      </div>
                    </div>

                    {/* Supply Level Bars */}
                    <div className="space-y-3">
                      {/* Soap Level Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Soap Supply</span>
                          <span>{Math.round(station.data.soapLevel)}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              station.data.soapLevel < 20 ? 'bg-red-500' :
                              station.data.soapLevel < 50 ? 'bg-yellow-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${station.data.soapLevel}%` }}
                          />
                        </div>
                      </div>

                      {/* Water Level Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Water Supply</span>
                          <span>{Math.round(station.data.waterLevel)}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              station.data.waterLevel < 30 ? 'bg-red-500' :
                              station.data.waterLevel < 50 ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${station.data.waterLevel}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-300 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Last updated: {station.lastUpdate.toLocaleString()}
                  </p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    station.status === 'online' ? 'bg-green-100 text-green-700' :
                    station.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {station.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Usage */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Usage Pattern (Today)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="usage" fill="#10b981" name="Handwashing Events" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Usage & Refills</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="usage" stroke="#10b981" strokeWidth={2} name="Usage Count" />
              <Line yAxisId="right" type="monotone" dataKey="refills" stroke="#f59e0b" strokeWidth={2} name="Refills" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Maintenance Schedule */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Maintenance & Refill Schedule</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Station</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Soap Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Water Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Est. Refill Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {washStations.map((station) => {
                const daysUntilSoapRefill = Math.ceil((station.data.soapLevel / 100) * 10);
                const daysUntilWaterRefill = Math.ceil((station.data.waterLevel / 100) * 7);
                const priority = station.data.soapLevel < 20 || station.data.waterLevel < 30 ? 'High' :
                                station.data.soapLevel < 50 || station.data.waterLevel < 50 ? 'Medium' : 'Low';

                return (
                  <tr key={station.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{station.name}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        station.data.soapLevel < 20 ? 'text-red-600' :
                        station.data.soapLevel < 50 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {Math.round(station.data.soapLevel)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        station.data.waterLevel < 30 ? 'text-red-600' :
                        station.data.waterLevel < 50 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {Math.round(station.data.waterLevel)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {Math.min(daysUntilSoapRefill, daysUntilWaterRefill) <= 0 
                        ? 'Today' 
                        : `${Math.min(daysUntilSoapRefill, daysUntilWaterRefill)} days`
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        priority === 'High' ? 'bg-red-100 text-red-700' :
                        priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {priority}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Impact Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-6 text-white">
          <h4 className="text-lg font-semibold mb-2">🧼 Total Handwashing Events</h4>
          <p className="text-3xl font-bold mb-1">2,872</p>
          <p className="text-sm text-blue-100">This week across all stations</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-6 text-white">
          <h4 className="text-lg font-semibold mb-2">🏥 Disease Prevention</h4>
          <p className="text-3xl font-bold mb-1">~85%</p>
          <p className="text-sm text-green-100">Reduction in waterborne illness risk</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-6 text-white">
          <h4 className="text-lg font-semibold mb-2">👥 Community Reach</h4>
          <p className="text-3xl font-bold mb-1">1,200+</p>
          <p className="text-sm text-purple-100">Regular users per week</p>
        </div>
      </div>

      {/* WASH Best Practices */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-3">WASH (Water, Sanitation, Hygiene) Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-50 text-sm">
          <div>
            <p className="font-semibold mb-2">Critical Handwashing Times:</p>
            <ul className="space-y-1">
              <li>• Before preparing or eating food</li>
              <li>• After using the toilet</li>
              <li>• After handling waste or garbage</li>
              <li>• After touching animals</li>
              <li>• When caring for the sick</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Proper Technique (20+ seconds):</p>
            <ul className="space-y-1">
              <li>• Wet hands with clean water</li>
              <li>• Apply soap and lather well</li>
              <li>• Scrub palms, backs, between fingers, under nails</li>
              <li>• Rinse thoroughly with clean water</li>
              <li>• Dry with clean cloth or air dry</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}