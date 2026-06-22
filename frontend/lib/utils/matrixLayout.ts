export interface MatrixPoint {
  x: number;
  y: number;
}

const PLOT_LEFT = 22;
const PLOT_RIGHT = 478;
const PLOT_TOP = 24;
const PLOT_BOTTOM = 384;

export const MATRIX_LAYOUT = {
  viewBoxWidth: 500,
  viewBoxHeight: 448,
  plotLeft: PLOT_LEFT,
  plotRight: PLOT_RIGHT,
  plotTop: PLOT_TOP,
  plotBottom: PLOT_BOTTOM,
  plotWidth: PLOT_RIGHT - PLOT_LEFT,
  plotHeight: PLOT_BOTTOM - PLOT_TOP,
  centerX: (PLOT_LEFT + PLOT_RIGHT) / 2,
  centerY: (PLOT_TOP + PLOT_BOTTOM) / 2,
  legendX: 28,
  legendY: 394,
  legendWidth: 444,
  legendHeight: 40,
} as const;
export const MATRIX_QUADRANT_LABEL_BOXES = {
  topLeft: { x: 32, y: 42, width: 180, height: 58 },
  topRight: { x: 288, y: 42, width: 180, height: 58 },
  bottomLeft: { x: 32, y: 304, width: 180, height: 58 },
  bottomRight: { x: 288, y: 304, width: 180, height: 58 },
} as const;
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

export function matrixPointToSvg(point: MatrixPoint): MatrixPoint {
  return {
    x: MATRIX_LAYOUT.plotLeft + clamp01(point.x) * MATRIX_LAYOUT.plotWidth,
    y: MATRIX_LAYOUT.plotBottom - clamp01(point.y) * MATRIX_LAYOUT.plotHeight,
  };
}

function overlapsMarker(point: MatrixPoint, box: { x: number; y: number; width: number; height: number }, markerRadius: number): boolean {
  return (
    point.x + markerRadius >= box.x &&
    point.x - markerRadius <= box.x + box.width &&
    point.y + markerRadius >= box.y &&
    point.y - markerRadius <= box.y + box.height
  );
}

export function matrixMarkerDisplayPosition(point: MatrixPoint): MatrixPoint {
  const actual = matrixPointToSvg(point);
  const markerPadding = 24;
  const markerRadius = 13;
  const labelGap = 8;
  let x = clamp(actual.x, MATRIX_LAYOUT.plotLeft + markerPadding, MATRIX_LAYOUT.plotRight - markerPadding);
  let y = clamp(actual.y, MATRIX_LAYOUT.plotTop + markerPadding, MATRIX_LAYOUT.plotBottom - markerPadding);
  const displayPoint = { x, y };

  const topBoxes = [MATRIX_QUADRANT_LABEL_BOXES.topLeft, MATRIX_QUADRANT_LABEL_BOXES.topRight];
  if (topBoxes.some((box) => overlapsMarker(displayPoint, box, markerRadius))) {
    y = Math.max(y, MATRIX_QUADRANT_LABEL_BOXES.topRight.y + MATRIX_QUADRANT_LABEL_BOXES.topRight.height + labelGap + markerRadius);
  }

  const bottomBoxes = [MATRIX_QUADRANT_LABEL_BOXES.bottomLeft, MATRIX_QUADRANT_LABEL_BOXES.bottomRight];
  if (bottomBoxes.some((box) => overlapsMarker(displayPoint, box, markerRadius))) {
    y = Math.min(y, MATRIX_QUADRANT_LABEL_BOXES.bottomLeft.y - labelGap - markerRadius);
  }

  return {
    x,
    y: clamp(y, MATRIX_LAYOUT.plotTop + markerPadding, MATRIX_LAYOUT.plotBottom - markerPadding),
  };
}

export function matrixToBeDisplayPosition(point: MatrixPoint): MatrixPoint {
  return matrixMarkerDisplayPosition(point);
}
