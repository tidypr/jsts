import Tabs from '@/shared/components/commons/Tabs';

const tabs = [
  { id: 'general', label: '일반' },
  { id: 'pomodoro', label: '포모도로' },
];

export default function page() {
  return (
    <>
      <Tabs tabs={tabs} />
    </>
  );
}
