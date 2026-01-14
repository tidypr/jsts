'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';
import { updateProfileNameSchema } from '../profile.schema';
import { Loader2 } from 'lucide-react';

interface EditNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string | null;
  onSuccess: (newName: string) => void;
}

export function EditNameDialog({
  open,
  onOpenChange,
  currentName,
  onSuccess,
}: EditNameDialogProps) {
  const [name, setName] = useState(currentName || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 유효성 검사
      const validatedData = updateProfileNameSchema.parse({ name });

      setIsLoading(true);

      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: validatedData.name }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '이름 업데이트에 실패했습니다');
      }

      toast.success('성공', {
        description: '이름이 성공적으로 변경되었습니다',
      });

      onSuccess(validatedData.name);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error('오류', {
          description: error.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>이름 변경</DialogTitle>
          <DialogDescription>새로운 이름을 입력해주세요</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>이름</Label>
              <Input
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='이름을 입력하세요'
                disabled={isLoading}
                maxLength={50}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
