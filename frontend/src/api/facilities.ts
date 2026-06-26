import { apiClient } from "./client";
import type { FacilityMaster, FacilityMasterCreate } from "../types";

export const facilitiesApi = {
  list: () => apiClient.get<FacilityMaster[]>("/facilities/").then((r) => r.data),
  get: (id: string) => apiClient.get<FacilityMaster>(`/facilities/${id}`).then((r) => r.data),
  create: (body: FacilityMasterCreate) => apiClient.post<FacilityMaster>("/facilities/", body).then((r) => r.data),
  update: (id: string, body: Partial<FacilityMasterCreate>) =>
    apiClient.patch<FacilityMaster>(`/facilities/${id}`, body).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/facilities/${id}`),
};
