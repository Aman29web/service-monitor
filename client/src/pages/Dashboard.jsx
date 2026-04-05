import { useState, useEffect, useCallback } from 'react';
import { fetchNodes } from '../api/nodesApi';
import { useSocket } from '../hooks/useSocket';
import { useNavigate } from 'react-router-dom';

const statusBadge = (status) => {
  const colors = { UP: 'bg-emerald-500', DOWN: 'bg-red-500', UNKNOWN: 'bg-gray-500' };
  return (
    <span className={`${colors[status] || 'bg-gray-400'} text-white text-xs font-bold px-2 py-1 rounded-full`}>
      {status}
    </span>
  );
};

export default function Dashboard() {
  const [nodes, setNodes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleNodesUpdate = useCallback((updated) => setNodes(updated), []);
  const handleAlert = useCallback((alert) => {
    setAlerts(prev => [alert, ...prev].slice(0, 5));
    setTimeout(() => setAlerts(prev => prev.filter(a => a !== alert)), 8000);
  }, []);

  useSocket(handleNodesUpdate, handleAlert);

  useEffect(() => {
    fetchNodes().then(setNodes).finally(() => setLoading(false));
  }, []);

  const upCount = nodes.filter(n => n.status === 'UP').length;
  const downCount = nodes.filter(n => n.status === 'DOWN').length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      {/* Alert toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {alerts.map((a, i) => (
          <div key={i} className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
            <span>🔴</span>
            <span className="text-sm">{a.message}</span>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-white">🖥 Service Health Monitor</h1>
        <p className="text-gray-400 mb-6 text-sm">Real-time distributed node monitoring</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Nodes', value: nodes.length, color: 'text-white' },
            { label: 'Nodes UP', value: upCount, color: 'text-emerald-400' },
            { label: 'Nodes DOWN', value: downCount, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-sm">{s.label}</p>
              <p className={`text-4xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
              <tr>
                {['Node ID', 'IP Address', 'Status', 'CPU', 'Memory', 'Open Ports', 'Last Heartbeat', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-500">Loading nodes...</td></tr>
              ) : nodes.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-500">No slave nodes registered yet.</td></tr>
              ) : nodes.map(node => (
                <tr key={node.nodeId} className="border-t border-gray-800 hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{node.nodeId}</td>
                  <td className="px-4 py-3">{node.ipAddress}</td>
                  <td className="px-4 py-3">{statusBadge(node.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-700 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${node.cpuUsage}%` }} />
                      </div>
                      <span>{node.cpuUsage?.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-700 rounded-full h-1.5">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${node.memoryUsage}%` }} />
                      </div>
                      <span>{node.memoryUsage?.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {node.openPorts?.length ? node.openPorts.join(', ') : 'none'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {node.lastHeartbeat ? new Date(node.lastHeartbeat).toLocaleTimeString() : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/node/${node.nodeId}`)}
                      className="text-blue-400 hover:text-blue-300 text-xs underline"
                    >
                      Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}