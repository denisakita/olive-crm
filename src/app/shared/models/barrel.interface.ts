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

