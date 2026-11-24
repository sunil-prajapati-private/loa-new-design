import { useState } from 'react';
import App from './App.jsx';
import ClaimDemo from './ClaimDemo.jsx';
export default function DemoRoot() {
  const [page, setPage] = useState('loa');
  const navigate = (next) => { setPage(next); window.scrollTo({ top: 0, behavior: 'instant' }); };
  return <><div hidden={page !== 'loa'}><App onNavigate={navigate} /></div><div hidden={page !== 'claims'}><ClaimDemo onNavigate={navigate} /></div></>;
}
