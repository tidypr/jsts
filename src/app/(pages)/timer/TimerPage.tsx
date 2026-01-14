'use client';

import { AllTimerList } from '@/features/timer';
import TimerList from '@/features/timerlist/index';
// import TimeAddBtn from '@/features/timerlist/TimeAddBtn';
import Tabs from '@/shared/components/commons/Tabs';
import { useState } from 'react';

const tabs = [
  { id: 'mylist', label: '내 목록' },
  // { id: 'favorite', label: '즐겨찾기' },
  { id: 'all', label: '전체' },
  // { id: 'pomodoro', label: '포모도로(준비 중)' },
];

export default function TimerPage({ userId }: { userId: string }) {
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
      {activeTab.id === 'mylist' && (
        <TimerList userId={userId} tab={activeTab.id} />
      )}
      {activeTab.id === 'all' && (
        <AllTimerList userId={userId} tab={activeTab.id} />
      )}
    </>
  );
}
