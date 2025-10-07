import { Route, Routes, Navigate, Link } from 'react-router-dom'
import Login from './pages/Login'
import AssetsList from './pages/AssetsList'

export default function App() {
  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between mb-6">
        <Link to="/" className="text-2xl font-bold">Sorty</Link>
        <nav className="space-x-4">
          <Link to="/assets">Activos</Link>
          <Link to="/login">Ingresar</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/assets" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/assets" element={<AssetsList />} />
      </Routes>
    </div>
  )
}