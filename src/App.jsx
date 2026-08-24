import { useEffect, useState } from 'react'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import DeviceList from './pages/DeviceList'
import DeviceDetail from './pages/DeviceDetail/DeviceDetail'
import HomeDashboard from './pages/HomeDashboard'
import { DEVICES } from './data/devices'
import './App.css'

function readRoute() {
  const route = window.location.hash.replace(/^#\/?/, '')
  if (route.startsWith('devices/')) {
    const code = decodeURIComponent(route.slice('devices/'.length))
    const index = DEVICES.findIndex((device) => device.code === code)
    return { view: 'detail', deviceIndex: index >= 0 ? index : 0 }
  }
  if (route === 'devices') return { view: 'list', deviceIndex: 0 }
  return { view: 'home', deviceIndex: 0 }
}

function App() {
  const initialRoute = readRoute()
  const [view, setView] = useState(initialRoute.view)
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(initialRoute.deviceIndex)
  const [listPreset, setListPreset] = useState(null)

  useEffect(() => {
    const handleRouteChange = () => {
      const route = readRoute()
      setView(route.view)
      setSelectedDeviceIndex(route.deviceIndex)
      if (route.view !== 'list') setListPreset(null)
    }
    window.addEventListener('hashchange', handleRouteChange)
    return () => window.removeEventListener('hashchange', handleRouteChange)
  }, [])

  const navigate = (nextView, options = {}) => {
    if (nextView === 'home') {
      setListPreset(null)
      window.location.hash = '/home'
      return
    }
    if (nextView === 'list') {
      setListPreset(options.preset || null)
      if (window.location.hash === '#/devices') setView('list')
      else window.location.hash = '/devices'
      return
    }
    if (nextView === 'detail') {
      const index = options.index ?? 0
      setSelectedDeviceIndex(index)
      window.location.hash = `/devices/${encodeURIComponent(DEVICES[index]?.code || DEVICES[0].code)}`
    }
  }

  return (
    <div className="sany-shell">
      <Sidebar activeKey={view === 'home' ? 'home' : 'devices'} onNavigate={navigate} />
      <div className="sany-workspace">
        <Header />
        <main className="sany-main">
          {view === 'home' && (
            <HomeDashboard
              onOpenDevice={(index) => navigate('detail', { index })}
              onOpenList={(preset) => navigate('list', { preset })}
            />
          )}
          {view === 'list' && (
            <DeviceList
              preset={listPreset}
              onClearPreset={() => setListPreset(null)}
              onSelectDevice={(index) => navigate('detail', { index })}
            />
          )}
          {view === 'detail' && (
            <DeviceDetail
              device={DEVICES[selectedDeviceIndex]}
              deviceIndex={selectedDeviceIndex}
              totalDevices={DEVICES.length}
              onBack={() => navigate('list')}
              onDeviceChange={(index) => navigate('detail', { index })}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
