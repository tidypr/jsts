import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getActivityTemplates,
  createActivityTemplate,
  updateActivityTemplate,
  deleteActivityTemplate,
} from '@/features/activityTemplate/actions/activityTemplate.actions';
import { ActivityTemplateInput } from '@/features/activityTemplate/activityTemplate.schema';
import type { ActivityTemplate } from '@/features/activityTemplate/activityTemplate.schema';

// 타이머용 활동 템플릿 조회 (useInTimer = true인 것만)
export function useTimerTemplates(userId: string) {
  return useQuery({
    queryKey: ['activityTemplates', userId, 'timer'],
    queryFn: async () => {
      const result = await getActivityTemplates(userId, true); // timerOnly = true
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: Infinity,
  });
}

// 모든 활동 템플릿 조회
export function useActivityTemplates(userId: string) {
  return useQuery({
    queryKey: ['activityTemplates', userId],
    queryFn: async () => {
      const result = await getActivityTemplates(userId, false);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: Infinity,
  });
}

// 활동 템플릿 생성
export function useCreateActivityTemplate(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ActivityTemplateInput) => {
      const result = await createActivityTemplate(userId, data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onMutate: async (newTemplate) => {
      await queryClient.cancelQueries({ queryKey: ['activityTemplates', userId] });

      const previousTemplates = queryClient.getQueryData<ActivityTemplate[]>([
        'activityTemplates',
        userId,
      ]);

      // 낙관적 업데이트
      const tempId = `temp-${Date.now()}`;
      queryClient.setQueryData<ActivityTemplate[]>(
        ['activityTemplates', userId],
        (old) => {
          const tempTemplate: ActivityTemplate = {
            id: tempId,
            ...newTemplate,
            note: newTemplate.note || null,
            emoji: newTemplate.emoji || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId,
          };
          return [...(old || []), tempTemplate];
        },
      );

      return { previousTemplates };
    },
    onError: (err, newTemplate, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(
          ['activityTemplates', userId],
          context.previousTemplates,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['activityTemplates', userId] });
    },
  });
}

// 활동 템플릿 수정
export function useUpdateActivityTemplate(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      data,
    }: {
      templateId: string;
      data: Partial<ActivityTemplateInput>;
    }) => {
      const result = await updateActivityTemplate(templateId, userId, data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onMutate: async ({ templateId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['activityTemplates', userId] });

      const previousTemplates = queryClient.getQueryData<ActivityTemplate[]>([
        'activityTemplates',
        userId,
      ]);

      // 낙관적 업데이트
      queryClient.setQueryData<ActivityTemplate[]>(
        ['activityTemplates', userId],
        (old) => {
          return (old || []).map((template) => {
            if (template.id === templateId) {
              return {
                ...template,
                ...data,
                updatedAt: new Date(),
              };
            }
            return template;
          });
        },
      );

      return { previousTemplates };
    },
    onError: (err, variables, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(
          ['activityTemplates', userId],
          context.previousTemplates,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['activityTemplates', userId] });
    },
  });
}

// 활동 템플릿 삭제
export function useDeleteActivityTemplate(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const result = await deleteActivityTemplate(templateId, userId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async (templateId) => {
      await queryClient.cancelQueries({ queryKey: ['activityTemplates', userId] });

      const previousTemplates = queryClient.getQueryData<ActivityTemplate[]>([
        'activityTemplates',
        userId,
      ]);

      // 낙관적 업데이트
      queryClient.setQueryData<ActivityTemplate[]>(
        ['activityTemplates', userId],
        (old) => {
          return (old || []).filter((template) => template.id !== templateId);
        },
      );

      return { previousTemplates };
    },
    onError: (err, templateId, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(
          ['activityTemplates', userId],
          context.previousTemplates,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['activityTemplates', userId] });
    },
  });
}
