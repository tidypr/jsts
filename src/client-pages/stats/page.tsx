'use client';

import Tabs from '@/shared/components/commons/Tabs';
import { useState } from 'react';

const tabs = [
  { id: 'daily', label: '일간' },
  { id: 'weekly', label: '주간' },
  { id: 'monthly', label: '월간' },
  { id: 'yearly', label: '연간' },
];

export default function StatsPage() {
  const [active, setActive] = useState('daily');

  return (
    <>
      <Tabs tabs={tabs} setActiveTab={setActive} activeTab={active} />
      {active === 'daily' && <div>daily</div>}
      {active === 'weekly' && <div>weekly</div>}
      {active === 'monthly' && <div>monthly</div>}
      {active === 'yearly' && <div>yearly</div>}
    </>
  );
}
