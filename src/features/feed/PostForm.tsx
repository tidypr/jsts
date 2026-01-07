'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { CreatePostFormData, createPostFormSchema } from './feedSchema';
import { useCreatePost } from './hooks/useCreatePost';

interface PostFormProps {
  onClose: () => void;
  userId?: string;
}

const categories = [
  { value: 'coding', label: '코딩 챌린지', icon: '💻' },
  { value: 'morning', label: '아침 루틴', icon: '🌅' },
  { value: 'study', label: '스터디 팁', icon: '📚' },
  { value: 'milestone', label: '마일스톤', icon: '🎉' },
  { value: 'question', label: 'Q&A', icon: '❓' },
  { value: 'freetalk', label: '자유 대화', icon: '💬' },
];

export default function PostForm({ onClose, userId }: PostFormProps) {
  // React Query mutation hook
  const { mutate: createPost, isPending } = useCreatePost();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostFormSchema),
    defaultValues: {
      title: '',
      content: '',
      category: '',
      tags: '',
      image: '',
    },
  });

  const watchedCategory = watch('category');
  const watchedTitle = watch('title');
  const watchedContent = watch('content');

  /**
   * 폼 제출 핸들러 - React Query mutation 사용
   */
  const onSubmit = (data: CreatePostFormData) => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 태그 문자열을 배열로 변환
    const tagsArray = data.tags
      ? data.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
          .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
      : [];

    // React Query mutation 실행
    createPost(
      {
        userId,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: tagsArray,
        image: data.image || undefined,
      },
      {
        onSuccess: () => {
          alert('게시물이 작성되었습니다.');
          onClose();
        },
        onError: (error) => {
          alert(error.message || '게시물 작성 중 오류가 발생했습니다.');
        },
      },
    );
  };

  return (
    <div className='min-h-screen px-4 pb-8 pt-6'>
      <div className='mx-auto max-w-md space-y-6'>
        <div className='flex items-center justify-center'>
          <h1 className='text-xl font-bold'>새 게시물 작성</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label className='text-sm text-muted-foreground'>카테고리</Label>
            <Select
              value={watchedCategory}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger
                className='border-[#1f1f1f]'
                data-testid='post-form-category'
              >
                <SelectValue placeholder='카테고리를 선택하세요' />
              </SelectTrigger>
              <SelectContent className='border-[#1f1f1f]'>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className='flex items-center gap-2'>
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className='text-sm text-red-500'>{errors.category.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label className='text-sm text-muted-foreground'>
              제목
              <span className='ml-2 text-xs text-muted-foreground'>
                {watchedTitle.length}/100
              </span>
            </Label>
            <Input
              type='text'
              {...register('title')}
              placeholder='게시물 제목을 입력하세요'
              className='border-[#1f1f1f]'
              data-testid='post-form-title'
            />
            {errors.title && (
              <p className='text-sm text-red-500'>{errors.title.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label className='text-sm text-muted-foreground'>
              내용
              <span className='ml-2 text-xs text-muted-foreground'>
                {watchedContent.length}/1000
              </span>
            </Label>
            <Textarea
              {...register('content')}
              placeholder='오늘 공부한 내용이나 생각을 공유해보세요...'
              className='min-h-[200px] resize-none border-[#1f1f1f]'
              data-testid='post-form-content'
            />
            {errors.content && (
              <p className='text-sm text-red-500'>{errors.content.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label className='text-sm text-muted-foreground'>
              태그 (선택사항)
            </Label>
            <Input
              type='text'
              {...register('tags')}
              placeholder='태그를 쉼표로 구분해서 입력하세요 (예: 공부, 코딩)'
              className='border-[#1f1f1f]'
              data-testid='post-form-tags'
            />
            <p className='text-xs text-muted-foreground'>
              # 기호는 자동으로 추가됩니다
            </p>
          </div>

          <div className='space-y-2'>
            <Label className='text-sm text-muted-foreground'>
              이미지 URL (선택사항)
            </Label>
            <Input
              type='text'
              {...register('image')}
              placeholder='https://example.com/image.jpg'
              className='border-[#1f1f1f]'
              data-testid='post-form-image'
            />
          </div>

          {watchedTitle && watchedContent && (
            <Card className='border-[#22c55e]/30 bg-[#22c55e]/10 p-3'>
              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>미리보기</p>
                <h3 className='font-semibold'>{watchedTitle}</h3>
                <p className='line-clamp-2 text-sm text-muted-foreground'>
                  {watchedContent}
                </p>
              </div>
            </Card>
          )}

          <Button
            type='submit'
            className='w-full bg-[#22c55e] py-6 font-semibold text-black hover:bg-[#22c55e]/90'
            disabled={isPending}
            data-testid='post-form-submit-button'
          >
            {isPending ? '작성 중...' : '게시하기'}
          </Button>

          <Button
            type='button'
            variant='outline'
            className='w-full py-6 font-semibold'
            onClick={onClose}
            disabled={isPending}
            data-testid='post-form-cancel-button'
          >
            취소하기
          </Button>
        </form>
      </div>
    </div>
  );
}
