'use client';

import { Feed } from '@/features/feed';
import Friend from '@/features/friend';
import RankList from '@/features/rank';
import Tabs from '@/shared/components/commons/Tabs';
import { useState } from 'react';

const tabs = [
  { id: 'feed', label: '피드' },
  { id: 'ranking', label: '랭킹' },
  { id: 'friends', label: '친구' },
];

export default function SocialPage({
  session,
}: {
  session: { user: { id: string } };
}) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <>
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'feed' && <Feed />}
      {activeTab === 'ranking' && <RankList />}
      {activeTab === 'friends' && <Friend userId={session.user.id} />}
    </>
  );
}
