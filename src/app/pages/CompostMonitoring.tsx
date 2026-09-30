import { useApp } from '../context/AppContext';
import { Leaf, Thermometer, Droplets, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

/**
 * Mock compost maturity data
 */
const maturityData = [
  { day: 'Day 0', temp: 25, pH: 6.5, moisture: 60 },
  { day: 'Day 7', temp: 55, pH: 7.0, moisture: 55 },
  { day: 'Day 14', temp: 65, pH: 7.5, moisture: 50 },
  { day: 'Day 21', temp: 60, pH: 7.8, moisture: 48 },
  { day: 'Day 28', temp: 50, pH: 7.5, moisture: 45 },
  { day: 'Day 35', temp: 40, pH: 7.2, moisture: 50 },
  { day: 'Day 42', temp: 30, pH: 7.0, moisture: 55 },
];

const qualityMetrics = [
  { metric: 'Temperature', value: 75, fullMark: 100 },
  { metric: 'Moisture', value: 85, fullMark: 100 },
  { metric: 'pH Balance', value: 90, fullMark: 100 },
  { metric: 'Aeration', value: 70, fullMark: 100 },
  { metric: 'Nutrient Content', value: 80, fullMark: 100 },
];

/**
 * CompostMonitoring - Monitor compost quality and maturation
 * Tracks temperature, pH, moisture, and overall compost health
 */
export default function CompostMonitoring() {
  const { devices } = useApp();
  const compostMonitors = devices.filter(d => d.type === 'compost_monitor');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Compost Quality Monitoring</h1>
        <p className="text-gray-600 mt-1">Track composting process and ensure optimal conditions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Leaf size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Sites</p>
              <p className="text-2xl font-bold text-gray-800">{compostMonitors.length}</p>
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
                {Math.round(compostMonitors.reduce((sum, c) => sum + c.data.temperature, 0) / compostMonitors.length)}°C
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
              <p className="text-sm text-gray-600">Avg Moisture</p>
              <p className="text-2xl font-bold text-gray-800">
                {Math.round(compostMonitors.reduce((sum, c) => sum + c.data.moisture, 0) / compostMonitors.length)}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Activity size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg pH Level</p>
              <p className="text-2xl font-bold text-gray-800">
                {(compostMonitors.reduce((sum, c) => sum + c.data.pH, 0) / compostMonitors.length).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compost Sites Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Compost Site Status</h3>
        <div className="space-y-4">
          {compostMonitors.map((monitor) => {
            // Determine compost maturity stage based on temperature
            const getMaturityStage = (temp: number) => {
              if (temp > 55) return { stage: 'Active/Thermophilic', color: 'orange', progress: 40 };
              if (temp > 40) return { stage: 'Cooling/Curing', color: 'yellow', progress: 70 };
              return { stage: 'Mature/Ready', color: 'green', progress: 100 };
            };

            const maturity = getMaturityStage(monitor.data.temperature);

            return (
              <div key={monitor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">{monitor.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        maturity.color === 'green' ? 'bg-green-100 text-green-700' :
                        maturity.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {maturity.stage}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{monitor.location.address}</p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Maturity Progress</span>
                        <span>{maturity.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            maturity.color === 'green' ? 'bg-green-500' :
                            maturity.color === 'yellow' ? 'bg-yellow-500' :
                            'bg-orange-500'
                          }`}
                          style={{ width: `${maturity.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-orange-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Thermometer size={14} className="text-orange-600" />
                          <span className="text-xs text-gray-600">Temp</span>
                        </div>
                        <p className="text-lg font-bold text-gray-800">{monitor.data.temperature}°C</p>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Droplets size={14} className="text-blue-600" />
                          <span className="text-xs text-gray-600">Moisture</span>
                        </div>
                        <p className="text-lg font-bold text-gray-800">{monitor.data.moisture}%</p>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Activity size={14} className="text-purple-600" />
                          <span className="text-xs text-gray-600">pH</span>
                        </div>
                        <p className="text-lg font-bold text-gray-800">{monitor.data.pH}</p>
                      </div>

                      <div className="bg-green-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Leaf size={14} className="text-green-600" />
                          <span className="text-xs text-gray-600">Quality</span>
                        </div>
                        <p className="text-lg font-bold text-gray-800">
                          {monitor.data.pH >= 6.5 && monitor.data.pH <= 8.0 ? 'Good' : 'Fair'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Last updated: {monitor.lastUpdate.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maturity Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Composting Process Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={maturityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} name="Temperature (°C)" />
              <Line yAxisId="right" type="monotone" dataKey="pH" stroke="#8b5cf6" strokeWidth={2} name="pH Level" />
              <Line yAxisId="right" type="monotone" dataKey="moisture" stroke="#3b82f6" strokeWidth={2} name="Moisture (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quality Radar */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Quality Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={qualityMetrics}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Quality Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Composting Stages Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-800 mb-2">🔥 Active Phase (Days 1-14)</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Temperature: 55-75°C</li>
            <li>• High microbial activity</li>
            <li>• Turn pile every 3-4 days</li>
            <li>• Monitor moisture levels</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">⏳ Cooling Phase (Days 15-35)</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Temperature: 40-55°C</li>
            <li>• Decomposition slows</li>
            <li>• Less frequent turning</li>
            <li>• pH stabilizes to 7-8</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">✅ Mature Phase (Day 35+)</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Temperature: 25-40°C</li>
            <li>• Dark, crumbly texture</li>
            <li>• Earthy smell</li>
            <li>• Ready for use</li>
          </ul>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Optimal Composting Conditions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-50 text-sm">
          <div>
            <p className="font-semibold mb-2">Temperature Management:</p>
            <ul className="space-y-1">
              <li>• Maintain 55-65°C for pathogen elimination</li>
              <li>• Turn pile if temperature exceeds 70°C</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Moisture & Aeration:</p>
            <ul className="space-y-1">
              <li>• Keep moisture at 40-60% (feels like wrung sponge)</li>
              <li>• Ensure adequate oxygen through regular turning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
