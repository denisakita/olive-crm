export interface Barrel {
  id: string;
  barrelNumber: string;
  capacity: number;
  currentVolume: number;
  status: 'empty' | 'partial' | 'full';
  fillingDate?: Date;
  emptyingDate?: Date;
  location: string;
  supplier?: string;
  qualityGrade: 'A' | 'B' | 'C' | 'Premium';
  notes?: string;
}


export interface BarrelTransaction {
  id: string;
  barrelId: string;
  date: Date;
  type: 'fill' | 'empty' | 'transfer' | 'sample';
  volumeChange: number;
  previousVolume: number;
  newVolume: number;
  reason?: string;
  performedBy: string;
  relatedOrderId?: string;
}

export interface BarrelStatistics {
  totalBarrels: number;
  emptyBarrels: number;
  partialBarrels: number;
  fullBarrels: number;
  totalCapacity: number;
  totalCurrentVolume: number;
  utilizationRate: number;
  bottleCapacity: number;
  averageAge: number;
}

export interface BottleCoverage {
  barrelId: string;
  currentBottles: number;
  maxBottles: number;
  bottleSize: number;
  coveragePercentage: number;
}
