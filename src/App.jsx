import { useEffect, useState } from 'react'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import DeviceList from './pages/DeviceList'
import DeviceDetail from './pages/DeviceDetail/DeviceDetail'
import HomeDashboard from './pages/HomeDashboard'
import MessageCenter from './pages/MessageCenter'
import NotificationPopover from './pages/NotificationPopover'
import EscEventPage from './pages/EscEventPage'
import EscEventDetailPage from './pages/EscEventDetailPage'
import BusinessModulePage from './pages/BusinessModulePage'
import { DEVICES } from './data/devices'
import { ESC_EVENT_STORAGE_KEY, acknowledgeEscEvent, readEscEvent } from './data/escEvent'
import './App.css'

const BUSINESS_VIEWS = [
  'dashboard', 'reports', 'people-monitor', 'people-stats', 'people-detail', 'people-config', 'projects',
  'map-monitor', 'warning-center', 'maintenance', 'service', 'parts-wanted', 'parts-delivery',
  'repair-list', 'repair-approval', 'repair-parts', 'repair-engineers', 'repair-vehicles',
  'cost-detail', 'workload-detail', 'cost-summary', 'terminals', 'tenant', 'personal', 'org', 'users', 'roles',
  'fleet', 'audit',
]

function readRoute() {
  const route = window.location.hash.replace(/^#\/?/, '')
  if (route.startsWith('devices/')) {
    const [codePart, query] = route.slice('devices/'.length).split('?')
    const code = decodeURIComponent(codePart)
    const index = DEVICES.findIndex((device) => device.code === code)
    const tab = new URLSearchParams(query || '').get('tab')
    return { view: 'detail', deviceIndex: index >= 0 ? index : 0, tab }
  }
  if (route === 'devices') return { view: 'list', deviceIndex: 0 }
  if (route === 'messages' || route === 'notifications') return { view: 'list', deviceIndex: 0 }
  if (route.startsWith('esc-events/')) return { view: 'esc-event-detail', escEventId: route.slice('esc-events/'.length), deviceIndex: 0 }
  if (route === 'esc-events') return { view: 'esc-events', deviceIndex: 0 }
  if (route.split('?')[0] === 'maintenance') return { view: 'maintenance', deviceIndex: 0 }
  if (BUSINESS_VIEWS.includes(route)) return { view: route, deviceIndex: 0 }
  if (route === 'workbench' || route === 'home') return { view: 'workbench', deviceIndex: 0 }
  return { view: 'workbench', deviceIndex: 0 }
}

function App() {
  const initialRoute = readRoute()
  const [view, setView] = useState(initialRoute.view)
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(initialRoute.deviceIndex)
  const [detailTab, setDetailTab] = useState(initialRoute.tab || '实时状态')
  const [listPreset, setListPreset] = useState(null)
  const [detailReturnView, setDetailReturnView] = useState('list')
  const [escEvent, setEscEvent] = useState(() => readEscEvent())
  const [selectedEscEventId, setSelectedEscEventId] = useState(initialRoute.escEventId || 'esc-1')
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [messageCenterOpen, setMessageCenterOpen] = useState(false)
  const [messageCategory, setMessageCategory] = useState('all')

  useEffect(() => {
    const syncEscEvent = (event) => {
      if (event.key === ESC_EVENT_STORAGE_KEY) setEscEvent(readEscEvent())
    }
    window.addEventListener('storage', syncEscEvent)
    return () => window.removeEventListener('storage', syncEscEvent)
  }, [])

  useEffect(() => {
    const handleRouteChange = () => {
      const route = readRoute()
      setView(route.view)
      setSelectedDeviceIndex(route.deviceIndex)
      setDetailTab(route.tab || '实时状态')
      if (route.escEventId) setSelectedEscEventId(route.escEventId)
      if (route.view !== 'list') setListPreset(null)
    }
    window.addEventListener('hashchange', handleRouteChange)
    return () => window.removeEventListener('hashchange', handleRouteChange)
  }, [])

  const navigate = (nextView, options = {}) => {
    if (nextView === 'home' || nextView === 'workbench') {
      setListPreset(null)
      window.location.hash = '/workbench'
      return
    }
    if (nextView === 'list' || nextView === 'devices') {
      setListPreset(options.preset || null)
      if (window.location.hash === '#/devices') setView('list')
      else window.location.hash = '/devices'
      return
    }
    if (nextView === 'esc-events') {
      setListPreset(null)
      window.location.hash = '/esc-events'
      return
    }
    if (nextView === 'esc-event-detail') {
      const eventId = options.eventId || 'esc-1'
      setSelectedEscEventId(eventId)
      window.location.hash = `/esc-events/${eventId}`
      return
    }
    if (BUSINESS_VIEWS.includes(nextView)) {
      setListPreset(null)
      const statusQuery = nextView === 'maintenance' && options.status ? `?status=${encodeURIComponent(options.status)}` : ''
      window.location.hash = `/${nextView}${statusQuery}`
      return
    }
    if (nextView === 'detail') {
      const index = options.index ?? 0
      setSelectedDeviceIndex(index)
      setDetailTab(options.tab || '实时状态')
      setDetailReturnView(options.returnTo || 'list')
      const tabQuery = options.tab ? `?tab=${encodeURIComponent(options.tab)}` : ''
      window.location.hash = `/devices/${encodeURIComponent(DEVICES[index]?.code || DEVICES[0].code)}${tabQuery}`
    }
  }

  return (
    <div className="sany-shell">
      <Sidebar activeKey={view === 'esc-event-detail' ? 'esc-events' : view === 'workbench' ? 'workbench' : view === 'list' || view === 'detail' ? 'devices' : view} onNavigate={navigate} />
      <div className="sany-workspace">
        <Header onOpenNotifications={() => setNotificationOpen(true)} />
        <main className="sany-main">
          {view === 'workbench' && (
            <HomeDashboard
              onOpenDevice={(index, tab) => navigate('detail', { index, tab })}
              onOpenList={(preset) => navigate('list', { preset })}
              onOpenBusiness={(nextView, options) => navigate(nextView, options)}
            />
          )}
          {view === 'esc-events' && <EscEventPage onOpenDetail={(eventId) => navigate('esc-event-detail', { eventId })}/>}
          {view === 'esc-event-detail' && <EscEventDetailPage eventId={selectedEscEventId} onBack={() => navigate('esc-events')} onSelectEvent={(eventId) => navigate('esc-event-detail', { eventId })}/>}
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
              onBack={() => navigate(detailReturnView)}
              backLabel={detailReturnView === 'messages' ? '返回消息中心' : detailReturnView === 'esc-events' ? '返回ESC事件' : '返回设备列表'}
              onDeviceChange={(index) => navigate('detail', { index })}
              initialTab={detailTab}
              escEvent={DEVICES[selectedDeviceIndex]?.type?.includes('搅拌') && DEVICES[selectedDeviceIndex]?.code === escEvent.serialNumber ? escEvent : null}
            />
          )}
          {BUSINESS_VIEWS.includes(view) && <BusinessModulePage moduleKey={view} />}
        </main>
      </div>
      {notificationOpen && <NotificationPopover
        onClose={() => setNotificationOpen(false)}
        onOpenEsc={() => { setNotificationOpen(false); navigate('esc-event-detail', { eventId: 'esc-1' }) }}
        onOpenMore={() => { setNotificationOpen(false); setMessageCategory('all'); setMessageCenterOpen(true) }}
        onOpenCategory={() => { setNotificationOpen(false); setMessageCategory('care'); setMessageCenterOpen(true) }}
        onReadAll={() => setEscEvent(acknowledgeEscEvent())}
      />}
      {messageCenterOpen && <MessageCenter
        key={messageCategory}
        initialCategory={messageCategory}
        escEvent={escEvent}
        onAcknowledge={() => setEscEvent(acknowledgeEscEvent())}
        onClose={() => setMessageCenterOpen(false)}
        onOpenEsc={() => { setMessageCenterOpen(false); navigate('esc-event-detail', { eventId: 'esc-1' }) }}
      />}
    </div>
  )
}

export default App
