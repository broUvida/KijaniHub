import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Newspaper, MapPin, Camera, Send, Calendar, Users, TrendingUp, Award } from 'lucide-react';

/**
 * VolunteerDashboard - News feed and field reporting interface for volunteers
 */
export default function VolunteerDashboard() {
  const { devices } = useApp();
  const [reportForm, setReportForm] = useState({
    location: '',
    deviceId: '',
    observation: '',
    issueType: 'maintenance',
    priority: 'medium',
  });
  const [submittedReports, setSubmittedReports] = useState<any[]>([]);

  const newsUpdates = [
    {
      id: 1,
      date: 'March 20, 2026',
      title: 'Record Month: 520kg of Waste Processed!',
      excerpt: 'Our team achieved a milestone by processing 520kg of organic waste in a single week, producing 180kg of premium frass fertilizer.',
      category: 'Achievement',
      image: '🏆',
    },
    {
      id: 2,
      date: 'March 18, 2026',
      title: 'New WASH Station Installed in Kinondoni',
      excerpt: 'Thanks to community support, we successfully installed our 3rd WASH station serving over 400 households.',
      category: 'Expansion',
      image: '💧',
    },
    {
      id: 3,
      date: 'March 15, 2026',
      title: 'BSF Production Increases by 25%',
      excerpt: 'Improved monitoring and optimized conditions led to a 25% increase in Black Soldier Fly larvae production.',
      category: 'Success',
      image: '📈',
    },
    {
      id: 4,
      date: 'March 12, 2026',
      title: 'Partnership with Green Africa Foundation',
      excerpt: 'Kijani Hub partners with Green Africa Foundation to expand circular economy initiatives across East Africa.',
      category: 'Partnership',
      image: '🤝',
    },
    {
      id: 5,
      date: 'March 10, 2026',
      title: 'Community Training: 50+ Residents Educated',
      excerpt: 'Our hygiene awareness program reached 50+ community members, teaching proper handwashing and waste segregation.',
      category: 'Education',
      image: '📚',
    },
    {
      id: 6,
      date: 'March 5, 2026',
      title: '25 Tons of CO₂ Emissions Prevented',
      excerpt: 'Our waste diversion and biogas initiatives have prevented 25,000kg of CO₂ emissions equivalent this quarter.',
      category: 'Impact',
      image: '🌍',
    },
  ];

  const volunteerTasks = [
    { id: 1, task: 'Monitor WASH Station - Kariakoo', status: 'pending', dueDate: 'Mar 22' },
    { id: 2, task: 'Community Education Session', status: 'completed', dueDate: 'Mar 20' },
    { id: 3, task: 'Waste Collection Site Visit', status: 'in-progress', dueDate: 'Mar 21' },
    { id: 4, task: 'Report BSF Farm Conditions', status: 'pending', dueDate: 'Mar 23' },
  ];

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport = {
      ...reportForm,
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      status: 'submitted',
    };
    setSubmittedReports([newReport, ...submittedReports]);
    setReportForm({
      location: '',
      deviceId: '',
      observation: '',
      issueType: 'maintenance',
      priority: 'medium',
    });
    alert('Report submitted successfully! Thank you for your contribution.');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, Volunteer!</h1>
        <p className="text-blue-100">
          Stay updated with the latest progress and report your field observations
        </p>
      </div>

      {/* Quick Stats for Volunteers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Users className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Volunteers</p>
              <p className="text-2xl font-bold text-gray-800">45</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <MapPin className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Sites</p>
              <p className="text-2xl font-bold text-gray-800">{devices.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Reports This Month</p>
              <p className="text-2xl font-bold text-gray-800">128</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Award className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Your Reports</p>
              <p className="text-2xl font-bold text-gray-800">{submittedReports.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* News & Updates - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* News Feed */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-6">
              <Newspaper className="text-emerald-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Latest News & Progress</h2>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {newsUpdates.map((news) => (
                <div key={news.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl flex-shrink-0">{news.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                          {news.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          <Calendar className="inline" size={12} /> {news.date}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2">{news.title}</h3>
                      <p className="text-sm text-gray-600">{news.excerpt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submitted Reports */}
          {submittedReports.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Submitted Reports</h3>
              <div className="space-y-3">
                {submittedReports.slice(0, 3).map((report) => (
                  <div key={report.id} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-gray-800">{report.location}</span>
                      <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full">
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{report.observation}</p>
                    <p className="text-xs text-gray-500">{report.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Tasks & Reporting */}
        <div className="space-y-6">
          {/* Your Tasks */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Tasks</h3>
            <div className="space-y-3">
              {volunteerTasks.map((task) => (
                <div key={task.id} className="border-l-4 border-l-emerald-500 bg-gray-50 p-3 rounded">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-gray-800">{task.task}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'completed' ? 'bg-green-100 text-green-700' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status}
                    </span>
                    <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Field Report Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Submit Field Report</h3>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location/Area
                </label>
                <input
                  type="text"
                  required
                  value={reportForm.location}
                  onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                  placeholder="e.g., Kariakoo Market"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Device (Optional)
                </label>
                <select
                  value={reportForm.deviceId}
                  onChange={(e) => setReportForm({ ...reportForm, deviceId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select a device</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Type
                </label>
                <select
                  value={reportForm.issueType}
                  onChange={(e) => setReportForm({ ...reportForm, issueType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="maintenance">Maintenance Needed</option>
                  <option value="observation">General Observation</option>
                  <option value="success">Success Story</option>
                  <option value="concern">Community Concern</option>
                  <option value="suggestion">Improvement Suggestion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={reportForm.priority}
                  onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observation/Details
                </label>
                <textarea
                  required
                  value={reportForm.observation}
                  onChange={(e) => setReportForm({ ...reportForm, observation: e.target.value })}
                  placeholder="Describe what you observed..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Submit Report
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
