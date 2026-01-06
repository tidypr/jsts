import Tabs from '@/shared/components/commons/Tabs';

const tabs = [
  { id: 'ranking', label: '랭킹' },
  { id: 'feed', label: '피드' },
  { id: 'friends', label: '친구' },
];

export default function page() {
  return (
    <>
      <Tabs tabs={tabs} />
    </>
  );
}
