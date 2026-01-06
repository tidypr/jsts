import { googleLoginAction } from '@/shared/actions/auth.actions';
import { Button } from '@/shared/components/ui/button';
import Image from 'next/image';

export default function GoogleLoginBtn({ isLoading }: { isLoading: boolean }) {
  return (
    <form action={googleLoginAction}>
      <Button
        type='submit'
        disabled={isLoading}
        variant='outline'
        className='flex w-full items-center justify-center gap-2 rounded-2xl border-border bg-secondary py-4 text-foreground disabled:opacity-50'
        data-testid={`google-login-button`}
      >
        <Image
          src='https://authjs.dev/img/providers/google.svg'
          alt='google Logo'
          width={20}
          height={20}
          className={`h-4 w-4 capitalize`}
        />
        Continue With Google
      </Button>
    </form>
  );
}
