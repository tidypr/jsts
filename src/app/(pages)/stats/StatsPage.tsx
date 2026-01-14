'use client';

import Stats from '@/features/stats';

interface StatsPageProps {
  userId: string;
}

import Tabs from '@/shared/components/commons/Tabs';
import { useState } from 'react';

const tabs = [
  { id: 'daily', label: '일간' },
  { id: 'weekly', label: '주간' },
  { id: 'monthly', label: '월간' },
  { id: 'yearly', label: '연간' },
];

export default function StatsPage({ userId }: StatsPageProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <>
      <Tabs
        tabs={tabs}
        activeTab={activeTab.id}
        setActiveTab={(id) =>
          setActiveTab(tabs.find((tab) => tab.id === id) || tabs[0])
        }
      />
      {activeTab && (
        <Stats
          userId={userId}
          tab={activeTab.id as 'daily' | 'weekly' | 'monthly' | 'yearly'}
        />
      )}
    </>
  );
}
