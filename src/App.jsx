import { useState } from 'react'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import DeviceList from './pages/DeviceList'
import DeviceDetail from './pages/DeviceDetail/DeviceDetail'
import { DEVICES } from './data/devices'

function App() {
  const [view, setView] = useState('list')
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(0)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <main style={{ flex: 1, overflow: 'auto' }}>
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
