'use client';

import TimerList from '@/features/timerlist/index';
// import TimeAddBtn from '@/features/timerlist/TimeAddBtn';
import Tabs from '@/shared/components/commons/Tabs';
import { useState } from 'react';

const tabs = [
  { id: 'general', label: '일반' },
  { id: 'pomodoro', label: '준비 중' },
];

export default function TimerPage({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <>
      <Tabs
        disabled
        tabs={tabs}
        activeTab={activeTab.id}
        setActiveTab={(id) =>
          setActiveTab(tabs.find((tab) => tab.id === id) || tabs[0])
        }
      />
      <TimerList userId={userId} tab={activeTab.id} />
    </>
  );
}
