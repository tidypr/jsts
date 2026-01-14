import { getPointHistory } from '@/features/profile/pointHistory.actions';
import PointHistoryPage from './PointHistoryPage';

export default async function PointHistory() {
  const result = await getPointHistory();
  const pointHistory = result.success && result.data ? result.data : [];

  return <PointHistoryPage pointHistory={pointHistory} />;
}
