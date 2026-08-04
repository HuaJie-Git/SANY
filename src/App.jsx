import { useState } from 'react'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import DeviceList from './pages/DeviceList'
import DeviceDetail from './pages/DeviceDetail/DeviceDetail'
import { DEVICES } from './data/devices'
import './App.css'

function App() {
  const [view, setView] = useState('list')
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(0)

  return (
    <div className="sany-shell">
      <Sidebar />
      <div className="sany-workspace">
        <Header />
        <main className="sany-main">
          {view === 'list' ? (
            <DeviceList onSelectDevice={(index) => { setSelectedDeviceIndex(index); setView('detail') }} />
          ) : (
            <DeviceDetail
              device={DEVICES[selectedDeviceIndex]}
              deviceIndex={selectedDeviceIndex}
              totalDevices={DEVICES.length}
              onBack={() => setView('list')}
              onDeviceChange={(index) => setSelectedDeviceIndex(index)}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
