import { api } from './api';

export interface PlanDayVideo {
  id: string;
  workout_plan_id: string;
  order: number;
  link: string;
}

type ServiceResult<T> = {
  data: T | null;
  error: string | null;
};

export async function getVideoByPlanDay(
  planId: string,
  order: number
): Promise<ServiceResult<PlanDayVideo | null>> {
  try {
    const data = await api.get<PlanDayVideo | null>(
      `/videos/resolve?planId=${encodeURIComponent(planId)}&order=${encodeURIComponent(String(order))}`
    );
    return { data, error: null };
  } catch (error) {
    console.error('Get video by day error:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Không thể tải video theo ngày',
    };
  }
}
