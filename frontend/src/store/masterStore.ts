import { create } from "zustand";
import type { FacilityMaster, TransportType } from "../types";
import { apiClient } from "../api/client";

interface MasterStore {
  facilities: FacilityMaster[];
  transportTypes: TransportType[];
  loaded: boolean;
  load: () => Promise<void>;
}

export const useMasterStore = create<MasterStore>((set) => ({
  facilities: [],
  transportTypes: [],
  loaded: false,

  load: async () => {
    const [fRes, tRes] = await Promise.all([
      apiClient.get<FacilityMaster[]>("/facilities/"),
      apiClient.get<TransportType[]>("/transport-types/"),
    ]);
    set({ facilities: fRes.data, transportTypes: tRes.data, loaded: true });
  },
}));
