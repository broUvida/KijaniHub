import { useApp } from '../context/AppContext';
import { Trash2, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

/**
 * Mock data for waste tracking charts
 */
const weeklyData = [
  { day: 'Mon', collected: 420, target: 500 },
  { day: 'Tue', collected: 480, target: 500 },
  { day: 'Wed', collected: 520, target: 500 },
  { day: 'Thu', collected: 450, target: 500 },
  { day: 'Fri', collected: 590, target: 500 },
  { day: 'Sat', collected: 610, target: 500 },
  { day: 'Sun', collected: 380, target: 500 },
];

const monthlyTrend = [
  { month: 'Sep', waste: 12500 },
  { month: 'Oct', waste: 14200 },
  { month: 'Nov', waste: 15800 },
  { month: 'Dec', waste: 16500 },
  { month: 'Jan', waste: 18200 },
  { month: 'Feb', waste: 19100 },
  { month: 'Mar', waste: 21300 },
];

/**
 * WasteTracking - Monitor smart bin fill levels and collection data
 * Shows real-time bin status, collection schedules, and trends
 */
export default function WasteTracking() {
  const { devices } = useApp();
  const wasteBins = devices.filter(d => d.type === 'waste_bin');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Waste Collection Tracking</h1>
        <p className="text-gray-600 mt-1">Monitor smart bins and optimize collection routes</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Trash2 size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Bins</p>
              <p className="text-2xl font-bold text-gray-800">{wasteBins.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Fill Level</p>
              <p className="text-2xl font-bold text-gray-800">
                {Math.round(wasteBins.reduce((sum, b) => sum + b.data.fillLevel, 0) / wasteBins.length)}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Collections This Week</p>
              <p className="text-2xl font-bold text-gray-800">23</p>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Bins Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Smart Bin Status</h3>
        <div className="space-y-4">
          {wasteBins.map((bin) => (
            <div key={bin.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{bin.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{bin.location.address}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                    <span>Temp: {bin.data.temperature}°C</span>
                    <span>Last Collection: {Math.floor((Date.now() - bin.data.lastCollection.getTime()) / (1000 * 60 * 60 * 24))} days ago</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Fill Level:</span>
                    <span className={`text-lg font-bold ${
                      bin.data.fillLevel > 85 ? 'text-red-600' :
                      bin.data.fillLevel > 60 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {Math.round(bin.data.fillLevel)}%
                    </span>
                  </div>
                  
                  {/* Fill Level Bar */}
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        bin.data.fillLevel > 85 ? 'bg-red-500' :
                        bin.data.fillLevel > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${bin.data.fillLevel}%` }}
                    />
                  </div>
                  
                  {bin.data.fillLevel > 85 && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      Collection Needed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Collection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Collection vs Target</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="collected" fill="#10b981" name="Collected (kg)" />
              <Bar dataKey="target" fill="#94a3b8" name="Target (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Collection Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="waste" stroke="#10b981" strokeWidth={2} name="Total Waste (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Collection Schedule */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Collection Schedule</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Bin Location</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Current Fill</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Scheduled Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {wasteBins.map((bin, idx) => {
                const daysUntil = Math.floor(Math.random() * 7) + 1;
                const priority = bin.data.fillLevel > 85 ? 'High' : bin.data.fillLevel > 60 ? 'Medium' : 'Low';
                
                return (
                  <tr key={bin.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{bin.name}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        bin.data.fillLevel > 85 ? 'text-red-600' :
                        bin.data.fillLevel > 60 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {Math.round(bin.data.fillLevel)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(Date.now() + daysUntil * 24 * 60 * 60 * 1000).toLocaleDateString()}
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
    </div>
  );
}
