import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NodeDetail from './pages/NodeDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/node/:nodeId" element={<NodeDetail />} />
      </Routes>
    </BrowserRouter>
  );
}