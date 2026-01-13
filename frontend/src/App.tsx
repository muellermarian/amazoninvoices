import "./index.css";
import { useState, useEffect } from "react";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center py-10">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-blue-800 text-center">
          Amazon Business Sandbox Reports
        </h1>
        {loading && <p className="text-blue-600 text-center">Loading...</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-blue-200 rounded-lg">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-4 py-2 text-left text-blue-700">
                    Report ID
                  </th>
                  <th className="px-4 py-2 text-left text-blue-700">Type</th>
                  <th className="px-4 py-2 text-left text-blue-700">Status</th>
                  <th className="px-4 py-2 text-left text-blue-700">Created</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r: Report) => (
                  <tr
                    key={r.reportId}
                    className="even:bg-blue-50 hover:bg-blue-100 transition"
                  >
                    <td className="px-4 py-2 font-mono text-xs">
                      {r.reportId}
                    </td>
                    <td className="px-4 py-2">{r.reportType}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          r.processingStatus === "IN_PROGRESS"
                            ? "inline-block px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs"
                            : "inline-block px-2 py-1 rounded bg-green-100 text-green-800 text-xs"
                        }
                      >
                        {r.processingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {new Date(r.createdTime).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <footer className="mt-10 text-blue-400 text-xs">
        Amazon Business API Sandbox Demo
      </footer>
    </div>
  );
}
