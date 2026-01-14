'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface EditProfileImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentImage: string | null;
  onSuccess: (newImageUrl: string) => void;
}

export function EditProfileImageDialog({
  open,
  onOpenChange,
  currentImage,
  onSuccess,
}: EditProfileImageDialogProps) {
  const [preview, setPreview] = useState<string | null>(currentImage);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      toast.error('오류', {
        description: '이미지 파일만 업로드 가능합니다',
      });
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('오류', {
        description: '파일 크기는 5MB 이하여야 합니다',
      });
      return;
    }

    setSelectedFile(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview(currentImage);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('오류', {
        description: '이미지를 선택해주세요',
      });
      return;
    }

    try {
      setIsUploading(true);

      // 1. 이미지 업로드
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadResult.success) {
        throw new Error(uploadResult.error || '이미지 업로드에 실패했습니다');
      }

      // 2. 프로필 업데이트
      const updateResponse = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: uploadResult.data.url }),
      });

      const updateResult = await updateResponse.json();

      if (!updateResponse.ok || !updateResult.success) {
        throw new Error(updateResult.error || '프로필 업데이트에 실패했습니다');
      }

      toast.success('성공', {
        description: '프로필 사진이 성공적으로 변경되었습니다',
      });

      onSuccess(uploadResult.data.url);
      onOpenChange(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('오류', {
        description:
          error instanceof Error ? error.message : '업로드에 실패했습니다',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>프로필 사진 변경</DialogTitle>
          <DialogDescription>
            새로운 프로필 사진을 업로드해주세요
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='flex flex-col items-center gap-4'>
              {/* 이미지 미리보기 */}
              {preview && (
                <div className='relative h-32 w-32'>
                  <Image
                    src={preview}
                    alt='프로필 미리보기'
                    fill
                    className='rounded-full object-cover'
                  />
                  {selectedFile && (
                    <button
                      type='button'
                      onClick={handleRemoveImage}
                      className='absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      disabled={isUploading}
                    >
                      <X className='h-4 w-4' />
                    </button>
                  )}
                </div>
              )}

              {/* 파일 선택 버튼 */}
              <div className='flex flex-col items-center gap-2'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleFileSelect}
                  className='hidden'
                  disabled={isUploading}
                />
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className='mr-2 h-4 w-4' />
                  {selectedFile ? '다른 이미지 선택' : '이미지 선택'}
                </Button>
                <p className='text-xs text-muted-foreground'>
                  JPG, PNG, GIF (최대 5MB)
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              취소
            </Button>
            <Button type='submit' disabled={isUploading || !selectedFile}>
              {isUploading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
