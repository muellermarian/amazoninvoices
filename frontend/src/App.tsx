import "./index.css";

import { useState, useEffect } from "react";

function getStatusClass(status: string) {
  if (status === "DONE") return "bg-green-100 text-green-800";
  if (status === "IN_PROGRESS")
    return "bg-yellow-100 text-yellow-800 animate-pulse";
  return "bg-gray-100 text-gray-800";
}

interface Report {
  reportId: string;
  reportType: string;
  dataStartTime: string;
  dataEndTime: string;
  createdTime: string;
  processingStatus: string;
  processingStartTime: string;
  processingEndTime: string;
}

export default function App() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => {
        setReports(data.reports || []);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load reports");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex flex-col items-center justify-start p-4 sm:p-8">
      <div className="w-full max-w-6xl h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">
            Amazon Business
          </h1>
          <p className="text-xl opacity-90">Sandbox Reports Dashboard</p>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-hidden flex flex-col">
          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}
          {error && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-red-800 mb-2">{error}</h2>
                <p className="text-red-600">
                  Check backend logs at localhost:3001
                </p>
              </div>
            </div>
          )}
          {!loading && !error && reports.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div className="max-w-md">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">
                  No reports yet
                </h2>
                <p className="text-gray-500">
                  Reports will appear here once generated
                </p>
              </div>
            </div>
          )}
          {!loading && !error && reports.length > 0 && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-6 rounded-2xl text-white text-center">
                  <div className="text-3xl font-bold">{reports.length}</div>
                  <div className="text-sm opacity-90">Total Reports</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white text-center">
                  <div className="text-3xl font-bold">
                    {
                      reports.filter((r) => r.processingStatus === "DONE")
                        .length
                    }
                  </div>
                  <div className="text-sm opacity-90">Completed</div>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                      <th className="p-4 text-left font-semibold text-gray-700 border-b border-gray-200">
                        Report ID
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700 border-b border-gray-200">
                        Type
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700 border-b border-gray-200">
                        Status
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700 border-b border-gray-200">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr
                        key={r.reportId}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <td
                          className="p-4 font-mono text-sm text-gray-900 max-w-xs truncate"
                          title={r.reportId}
                        >
                          {r.reportId}
                        </td>
                        <td className="p-4 capitalize text-gray-700">
                          {r.reportType}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                              r.processingStatus
                            )}`}
                          >
                            {r.processingStatus.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {new Date(r.createdTime).toLocaleString("de-DE")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-100 p-4 text-xs text-gray-500 text-center border-t border-gray-200">
          Amazon Business API Sandbox • localhost:3001/api/reports
        </div>
      </div>
    </div>
  );
}
