import { logoutAction } from '@/shared/actions/auth.actions';
import { Button } from '@/shared/components/ui/button';

export default function LogoutBtn() {
  return (
    <form action={logoutAction}>
      <Button
        variant='outline'
        className='h-14 w-full rounded-full border-2 text-base font-semibold'
        data-testid='logout-button'
      >
        로그아웃
      </Button>
    </form>
  );
}
