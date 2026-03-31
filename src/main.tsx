import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { TimelineDataProvider } from './context/TimelineDataContext';
import AdminPanel from './components/admin/AdminPanel';
import DandelionAnimation from './components/dandelion/DandelionAnimation';
import './styles/global.css';

type Route = 'app' | 'admin' | 'dandelion';

function hashToRoute(hash: string): Route {
  if (hash === '#admin') return 'admin';
  if (hash === '#dandelion') return 'dandelion';
  return 'app';
}

function Root() {
  const [route, setRoute] = useState<Route>(hashToRoute(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(hashToRoute(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route === 'dandelion') return <DandelionAnimation />;

  return (
    <TimelineDataProvider>
      {route === 'admin' ? <AdminPanel /> : <App />}
    </TimelineDataProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
