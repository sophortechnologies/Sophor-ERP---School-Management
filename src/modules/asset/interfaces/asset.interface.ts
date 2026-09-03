// src/modules/asset/interfaces/asset.interface.ts
export interface DepreciationResult {
  annual: number;
  monthly: number;
  currentValue: number;
  accumulatedDepreciation: number;
}

export interface DepreciationScheduleItem {
  year: number;
  openingValue: number;
  depreciationAmount: number;
  closingValue: number;
}

export interface AssetDashboardStats {
  totalAssets: number;
  totalValue: number;
  depreciatedValue: number;
  assetsByCategory: Record<string, number>;
  assetsByStatus: Record<string, number>;
  maintenanceDueCount: number;
  warrantyExpiringCount: number;
}

export interface AssetReport {
  totalAssets: number;
  totalOriginalCost: number;
  totalCurrentValue: number;
  totalDepreciation: number;
  assets: AssetSummary[];
}

export interface AssetSummary {
  id: number;
  assetTag: string;
  name: string;
  category: string;
  purchaseCost: number;
  currentValue: number;
  status: string;
  assignedTo: string | null;
}

export interface AssetSummary {
  id: number;
  assetTag: string;
  name: string;
  category: string;
  purchaseCost: number;
  currentValue: number;
  status: string;
  assignedTo: string | null;
}

export interface AssetSummary {
  id: number;
  assetTag: string;
  name: string;
  category: string;
  purchaseCost: number;
  currentValue: number;
  status: string;
  assignedTo: string | null;
}