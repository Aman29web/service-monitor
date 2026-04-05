import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchNode } from '../api/nodesApi';
import { io } from 'socket.io-client';

export default function NodeDetail() {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const [node, setNode] = useState(null);

  useEffect(() => {
    fetchNode(nodeId).then(setNode);

    const socket = io(import.meta.env.VITE_MASTER_URL || 'http://localhost:4000');
    socket.on(`node:heartbeat:${nodeId}`, setNode);
    return () => socket.disconnect();
  }, [nodeId]);

  if (!node) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>;

  const metrics = [
    { label: 'CPU Usage', value: `${node.cpuUsage?.toFixed(2)}%`, bar: node.cpuUsage, color: 'bg-blue-500' },
    { label: 'Memory Usage', value: `${node.memoryUsage?.toFixed(2)}%`, bar: node.memoryUsage, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white mb-6 flex items-center gap-1 text-sm">
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold mb-1">{node.hostname || node.nodeId}</h1>
        <p className="text-gray-400 font-mono text-sm mb-6">{node.nodeId}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: 'IP Address', value: node.ipAddress },
            { label: 'Status', value: node.status },
            { label: 'Platform', value: node.platform },
            { label: 'Node Version', value: node.nodeVersion },
            { label: 'Open Ports', value: node.openPorts?.join(', ') || 'none' },
            { label: 'Last Heartbeat', value: node.lastHeartbeat ? new Date(node.lastHeartbeat).toLocaleString() : 'N/A' },
          ].map(item => (
            <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">{item.label}</p>
              <p className="font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        {metrics.map(m => (
          <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">{m.label}</span>
              <span className="font-bold">{m.value}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div className={`${m.color} h-3 rounded-full transition-all duration-500`} style={{ width: `${m.bar}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}