/**
 * API client for bike theft dashboard backend
 */

export interface SummaryStats {
    total_thefts: number;
    avg_damage: number;
    min_date: string | null;
    max_date: string | null;
    attempt_rate: number;
    successful_thefts: number;
}

export interface TimeSeriesData {
    date: string;
    count: number;
}

export interface BicycleTypeData {
    type: string;
    count: number;
}

export interface HourlyData {
    hour: number;
    count: number;
}

export interface FinancialDamageData {
    range: string;
    count: number;
}

export interface DashboardData {
    summary: SummaryStats;
    timeSeries: TimeSeriesData[];
    bicycleTypes: BicycleTypeData[];
    hourlyDistribution: HourlyData[];
    financialDamage: FinancialDamageData[];
}

const API_BASE_URL = '/api';

async function fetchAPI<T>(endpoint: string): Promise<T> {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
}

export async function getDashboardData(): Promise<DashboardData> {
    return fetchAPI<DashboardData>('/dashboard-data');
}

export async function getSummary(): Promise<SummaryStats> {
    return fetchAPI<SummaryStats>('/summary');
}

export async function getTimeSeries(): Promise<TimeSeriesData[]> {
    return fetchAPI<TimeSeriesData[]>('/time-series');
}

export async function getBicycleTypes(): Promise<BicycleTypeData[]> {
    return fetchAPI<BicycleTypeData[]>('/bicycle-types');
}

export async function getHourlyDistribution(): Promise<HourlyData[]> {
    return fetchAPI<HourlyData[]>('/hourly-distribution');
}

export async function getFinancialDamage(): Promise<FinancialDamageData[]> {
    return fetchAPI<FinancialDamageData[]>('/financial-damage');
}

export interface LORMetric {
    id: string;
    cases: number;
    damage: number;
}

export interface LORStats {
    plr: LORMetric[];
    bzr: LORMetric[];
}

export interface DailyStats {
    has_data: boolean;
    case_count: number;
    total_damage: number;
    date: string;
    lor_stats?: LORStats;
}

export interface WeeklyComparisonDay {
    weekday: string;
    w1: {
        date: string;
        cases: number;
        damage: number;
        lor_stats: LORStats;
    };
    w2: {
        date: string;
        cases: number;
        damage: number;
        lor_stats: LORStats;
    };
}

export async function fetchDailyStats(date: string, bikeType?: string): Promise<DailyStats> {
    const url = bikeType
        ? `/daily-stats?date=${date}&bike_type=${encodeURIComponent(bikeType)}`
        : `/daily-stats?date=${date}`;
    return fetchAPI<DailyStats>(url);
}

export const fetchWeeklyComparison = (date: string, bikeType?: string) => {
    const url = bikeType
        ? `/weekly-comparison?date=${date}&bike_type=${encodeURIComponent(bikeType)}`
        : `/weekly-comparison?date=${date}`;
    return fetchAPI<WeeklyComparisonDay[]>(url);
}

export const fetchBikeCategories = () =>
    fetchAPI<string[]>('/bike-categories');

export const fetchLORGeoJSON = () =>
    fetchAPI<any>('/lor-geojson');

export const fetchBZRGeoJSON = () =>
    fetchAPI<any>('/bzr-geojson');
