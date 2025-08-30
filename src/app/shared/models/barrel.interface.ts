export interface Barrel {
  id?: number;
  barrel_number: string;
  capacity: number;
  current_volume: number;
  available_capacity?: number;
  filling_date?: Date | string;
  emptying_date?: Date | string;
  location: string;
  notes?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface BarrelTransaction {
  id?: number;
  barrel: number;
  type: 'fill' | 'empty' | 'transfer';
  volume_change: number;
  previous_volume: number;
  new_volume: number;
  reason?: string;
  performed_by?: string;
  created_at?: Date | string;
}

export interface BarrelStatistics {
  total_barrels: number;
  total_capacity: number;
  total_current_volume: number;
  top_locations: Array<{
    location: string;
    count: number;
    total_volume: number;
  }>;
}

export interface BarrelFillRequest {
  volume: number;
  reason?: string;
}

export interface BarrelEmptyRequest {
  volume: number;
  reason?: string;
}

export interface BarrelTransferRequest {
  target_barrel_id: number;
  volume: number;
  reason?: string;
}

export interface BarrelOperationResponse {
  message: string;
  volume_added?: number;
  volume_removed?: number;
  volume_transferred?: number;
  new_volume: number;
  source_barrel?: Barrel;
  target_barrel?: Barrel;
}