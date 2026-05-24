export interface IssueOut {
  title: string;
  description: string;
  severity: string;
}

export interface ScoreBreakdownItem {
  factor: string;
  value: string;
  impact: number;
  note: string;
  implication: string;
}

export interface AreaAnalysisOut {
  area_id: string;
  area_name: string;
  score: number;
  benchmark: number;
  gap: number;
  priority: number;
  difficulty: string;
  status_text: string;
  issues: IssueOut[];
  recommendation: string;
  tags: string[];
  score_breakdown: ScoreBreakdownItem[];
}

export interface BlindSpotTip {
  label: string;
  tip: string;
  formula: string;
}

export interface VisibilityOut {
  score: number;
  tier: string;
  tier_message: string;
  blind_spots: string[];
  blind_spot_labels: string[];
  blind_spot_tips: BlindSpotTip[];
}

export interface MatrixOut {
  a_x_as_is: number;
  a_y_as_is: number;
  a_x_to_be: number;
  a_y_to_be: number;
  b_x_as_is: number;
  b_y_as_is: number;
  b_x_to_be: number | null;
  b_y_to_be: number | null;
  a_quadrant_as_is: string;
  a_quadrant_to_be: string;
  b_quadrant_as_is: string;
  pain_point_dispersion: number;
}

export interface InsightOut {
  headline: string;
  detail: string;
  source: string;
}

export interface DiagnoseResponse {
  areas: AreaAnalysisOut[];
  visibility: VisibilityOut;
  matrix: MatrixOut;
  insights: InsightOut[];
}
