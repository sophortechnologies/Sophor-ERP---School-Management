// src/modules/asset/enums/asset.enum.ts
export enum AssetCategory {
  IT = 'IT',
  FURNITURE = 'FURNITURE',
  VEHICLE = 'VEHICLE',
  LAB_EQUIPMENT = 'LAB_EQUIPMENT',
  LIBRARY = 'LIBRARY',
  BUILDING = 'BUILDING',
  SPORTS = 'SPORTS',
  OTHER = 'OTHER',
}

export enum AssetStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
  DISPOSED = 'DISPOSED',
  LOST = 'LOST',
}

export enum DepreciationMethod {
  STRAIGHT_LINE = 'STRAIGHT_LINE',
  WRITTEN_DOWN_VALUE = 'WRITTEN_DOWN_VALUE',
}

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  REPAIR = 'REPAIR',
  EMERGENCY = 'EMERGENCY',
  AMC = 'AMC',
  CALIBRATION = 'CALIBRATION',
}

export enum DisposalType {
  SOLD = 'SOLD',
  SCRAPPED = 'SCRAPPED',
  DONATED = 'DONATED',
  LOST = 'LOST',
  STOLEN = 'STOLEN',
}