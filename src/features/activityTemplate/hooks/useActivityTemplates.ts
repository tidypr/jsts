import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getActivityTemplates,
  createActivityTemplate,
  updateActivityTemplate,
  deleteActivityTemplate,
} from '../actions/activityTemplate.actions';
import { ActivityTemplateInput } from '../activityTemplate.schema';

// 활동 템플릿 조회
export function useActivityTemplates(userId: string, timerOnly: boolean = false) {
  return useQuery({
    queryKey: ['activityTemplates', userId, timerOnly],
    queryFn: async () => {
      const result = await getActivityTemplates(userId, timerOnly);
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
    onSuccess: () => {
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
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activityTemplates', userId] });
    },
  });
}
