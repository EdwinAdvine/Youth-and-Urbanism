/**
 * Plan Features Service
 *
 * API client for managing per-plan feature toggles (super admin).
 */

import apiClient from '../api';

export interface AvailableFeature {
  key: string;
  name: string;
}

export interface PlanFeature {
  id: string;
  plan_id: string;
  feature_key: string;
  feature_name: string;
  is_enabled: boolean;
  config: Record<string, unknown> | null;
  display_order: number;
}

export interface PlanFeatureCreate {
  feature_key: string;
  feature_name: string;
  is_enabled?: boolean;
  config?: Record<string, unknown> | null;
  display_order?: number;
}

export interface PlanFeatureUpdate {
  feature_name?: string;
  is_enabled?: boolean;
  config?: Record<string, unknown> | null;
  display_order?: number;
}

class PlanFeaturesService {
  async getAvailableFeatures(): Promise<AvailableFeature[]> {
    const response = await apiClient.get('/api/v1/admin/plan-features/available');
    return response.data.data;
  }

  async getPlanFeatures(planId: string): Promise<{ plan_id: string; plan_name: string; features: PlanFeature[] }> {
    const response = await apiClient.get(`/api/v1/admin/plan-features/plans/${planId}`);
    return response.data.data;
  }

  async addFeature(planId: string, body: PlanFeatureCreate): Promise<PlanFeature> {
    const response = await apiClient.post(`/api/v1/admin/plan-features/plans/${planId}`, body);
    return response.data.data;
  }

  async updateFeature(planId: string, featureId: string, body: PlanFeatureUpdate): Promise<PlanFeature> {
    const response = await apiClient.put(`/api/v1/admin/plan-features/plans/${planId}/${featureId}`, body);
    return response.data.data;
  }

  async removeFeature(planId: string, featureId: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/plan-features/plans/${planId}/${featureId}`);
  }
}

export default new PlanFeaturesService();
