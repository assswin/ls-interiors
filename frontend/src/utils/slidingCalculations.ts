
export type SlidingModelId =
  | "58-2"
  | "58-2.5"
  | "58-3"
  | "58-4"
  | "66-2"
  | "66-3";

export type MeasurementUnit = "inches" | "cm" | "mm";

export interface SlidingCalculationInput {
  modelId: SlidingModelId;
  height: number;
  width: number;
  unit: MeasurementUnit;
  toleranceMm?: number;
  applyTolerance?: boolean;
  heightAdditionalMm?: number;
  widthAdditionalMm?: number;
}

export interface SlidingCalculationResult {
  originalHeightMm: number;
  originalWidthMm: number;
  outerFrameHeight: number;
  outerFrameWidth: number;
  sashHeight: number;
  sashWidth: number;
  sashHeightPieces: number;
  sashWidthPieces: number;
  interlock: number | null;
  glassHeight: number;
  glassWidth: number;
  meshHeight: number | null;
  meshWidth: number | null;
}

export function convertToMm(
  value: number,
  unit: MeasurementUnit
): number {
  switch (unit) {
    case "inches":
      return value * 25.4;
    case "cm":
      return value * 10;
    case "mm":
      return value;
    default:
      throw new Error("Unsupported measurement unit");
  }
}

export function calculateSlidingWindow(
  input: SlidingCalculationInput
): SlidingCalculationResult {
  const {
    modelId,
    height,
    width,
    unit,
    toleranceMm = 0,
    applyTolerance = true,
    heightAdditionalMm = 0,
    widthAdditionalMm = 0,
  } = input;

  if (!Number.isFinite(height) || !Number.isFinite(width)) {
    throw new Error("Height and Width must be valid numbers");
  }

  if (height <= 0 || width <= 0) {
    throw new Error("Height and Width must be greater than zero");
  }

  if (
    !Number.isFinite(toleranceMm) ||
    !Number.isFinite(heightAdditionalMm) ||
    !Number.isFinite(widthAdditionalMm)
  ) {
    throw new Error("Tolerance and additional adjustments must be valid numbers");
  }

  const originalHeightMm = convertToMm(height, unit);
  const originalWidthMm = convertToMm(width, unit);

  // Apply tolerance only to Outer Frame.
  const allowance = applyTolerance ? toleranceMm : 0;

  // Height and Width receive their own fraction adjustments.
  const H =
    originalHeightMm + allowance + heightAdditionalMm;

  const W =
    originalWidthMm + allowance + widthAdditionalMm;

  let result: Omit<
    SlidingCalculationResult,
    | "originalHeightMm"
    | "originalWidthMm"
    | "outerFrameHeight"
    | "outerFrameWidth"
  >;

  switch (modelId) {
    case "58-2":
      result = {
        sashHeight: H - 94,
        sashWidth: W / 2 - 11,
        glassHeight: H - 94 - 94,
        glassWidth: W / 2 - 11 - 94,
        sashHeightPieces: 4,
        sashWidthPieces: 4,
        interlock: H - 94 - 5,
        meshHeight: null,
        meshWidth: null,
      };
      break;

    case "58-2.5":
      result = {
        sashHeight: H - 82,
        sashWidth: (W - 10) / 2,
        glassHeight: H - 82 - 94,
        glassWidth: (W - 10) / 2 - 94,
        sashHeightPieces: 4,
        sashWidthPieces: 4,
        interlock: H - 82 - 5,
        meshHeight: H - 10,
        meshWidth: (W - 10) / 2,
      };
      break;

    case "58-3":
      result = {
        sashHeight: H - 91,
        sashWidth: W / 3 + 11,
        glassHeight: H - 91 - 94,
        glassWidth: W / 3 + 11 - 94,
        sashHeightPieces: 6,
        sashWidthPieces: 6,
        interlock: H - 91 - 5,
        meshHeight: null,
        meshWidth: null,
      };
      break;

    case "58-4":
      result = {
        sashHeight: H - 92,
        sashWidth: W / 4 + 11,
        glassHeight: H - 92 - 95,
        glassWidth: W / 4 + 11 - 95,
        sashHeightPieces: 8,
        sashWidthPieces: 8,
        interlock: H - 92 - 5,
        meshHeight: null,
        meshWidth: null,
      };
      break;

    case "66-2":
      result = {
        sashHeight: H - 94,
        sashWidth: (W - 22) / 2,
        glassHeight: H - 94 - 112,
        glassWidth: (W - 22) / 2 - 112,
        sashHeightPieces: 4,
        sashWidthPieces: 4,
        interlock: H - 94 - 5,
        meshHeight: null,
        meshWidth: null,
      };
      break;

    case "66-3":
      result = {
        sashHeight: H - 88,
        sashWidth: (W + 48) / 3,
        glassHeight: H - 88 - 112,
        glassWidth: (W + 48) / 3 - 112,
        sashHeightPieces: 6,
        sashWidthPieces: 6,
        interlock: H - 88 - 5,
        meshHeight: null,
        meshWidth: null,
      };
      break;

    default:
      throw new Error("Invalid Sliding Window model");
  }

  return {
    originalHeightMm,
    originalWidthMm,
    outerFrameHeight: H,
    outerFrameWidth: W,
    ...result,
  };
}
