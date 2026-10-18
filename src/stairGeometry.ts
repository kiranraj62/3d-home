// Shared by the 3D stair and plan. +X goes out from the hall; +Z is courtyard-facing.
type StairBlock = { x: number; y: number; z: number; args: [number, number, number] };
const treadThickness = 0.16;
const width = 1.05;
const entryX = 3;
const turnX = 4.68;
const arrivalX = 3.15;
const groundTop = 0.20;
const middleTop = 1.38;
const upperTop = 3.20;
const lowerRun = (turnX - entryX) / 6;
const upperRun = (turnX - arrivalX) / 8;

export const lowerSteps: StairBlock[] = Array.from({ length: 6 }, (_, i) => ({
  x: entryX + (i + 0.5) * lowerRun,
  y: groundTop + (i + 1) * (middleTop - groundTop) / 7 - treadThickness / 2,
  z: 0.42,
  args: [lowerRun, treadThickness, width],
}));
export const upperSteps: StairBlock[] = Array.from({ length: 8 }, (_, i) => ({
  x: turnX - (i + 0.5) * upperRun,
  y: middleTop + (i + 1) * (upperTop - middleTop) / 9 - treadThickness / 2,
  z: -1.55,
  args: [upperRun, treadThickness, width],
}));
// The cross-landing stops at the outside edges of the two flights.
// Its west edge meets the top of the lower flight and the foot of the upper flight.
const landingStartZ = upperSteps[0].z - width / 2;
const landingEndZ = lowerSteps[0].z + width / 2;
export const middleLanding: StairBlock = {
  x: turnX + width / 2, y: middleTop - treadThickness / 2, z: (landingStartZ + landingEndZ) / 2,
  args: [width, treadThickness, landingEndZ - landingStartZ],
};
export const topLanding: StairBlock = {
  x: 2.70, y: upperTop - 0.10, z: -1.55, args: [0.90, 0.20, 1.25],
};
export const stairRoute: [number, number][] = [
  [entryX, 0.42], [middleLanding.x, 0.42],
  [middleLanding.x, -1.55], [2.25, -1.55],
];
