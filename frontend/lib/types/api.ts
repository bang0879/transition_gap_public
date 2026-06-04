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
  b_quadrant_to_be: string;
  pain_point_dispersion: number;
}

export interface AlignmentConflictOut {
  id: string;
  title: string;
  detail: string;
  severity: string;
  penalty: number;
  domains: string[];
}

export interface AlignmentOut {
  score: number;
  base_score: number;
  total_penalty: number;
  conflicts: AlignmentConflictOut[];
}

export interface AlignmentMapVectorOut {
  domain_id: string;
  domain_name: string;
  x: number;
  y: number;
  magnitude: number;
  direction_label: string;
  evidence: string[];
}

export interface AlignmentMapConflictOut {
  id: string;
  title: string;
  detail: string;
  domains: string[];
  severity: string;
}

export interface AlignmentAxisOut {
  domain_id: string;
  domain_name: string;
  left_label: string;
  right_label: string;
  philosophy_label: string;
  philosophy_note: string | null;
  actual_label: string;
  policy_direction: string;
  alignment_percent: number;
  status_label: "일치" | "주의" | "심각";
  philosophy_position: number;
  actual_position: number;
  tension: number;
  tension_level: "aligned" | "watch" | "misaligned";
  headline: string;
  evidence: string[];
  business_risk: string | null;
}

export interface AlignmentMapOut {
  alignment_score: number;
  alignment_level: string;
  dispersion: number;
  centroid_x: number;
  centroid_y: number;
  headline: string;
  summary: string;
  vectors: AlignmentMapVectorOut[];
  axes?: AlignmentAxisOut[];
  conflicts: AlignmentMapConflictOut[];
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
  alignment: AlignmentOut;
  alignment_map?: AlignmentMapOut;
  insights: InsightOut[];
}
