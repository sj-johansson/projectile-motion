// Ideal kastbana för gymnasiefysik.
// Antaganden:
// - konstant tyngdacceleration g = 9,81 m/s^2
// - inget luftmotstånd
// - samma start- och landningshöjd
// - rörelsen sker i ett plan och endast gravitationskraften påverkar föremålet
// - x-axeln är horisontell, y-axeln är vertikal och y = 0 vid startpunkten
//
// SI-enheter:
// - v0 i m/s
// - θ i grader
// - x och y i meter
// - t i sekunder
//
// Referens: för ett kast med start- och landningsnivå lika är
// flygtiden T = 2 * v0 * sin(θ) / g
// räckvidden R = v0^2 * sin(2θ) / g
// maxhöjden H = (v0^2 * sin^2(θ)) / (2g)

export const gravitationalAcceleration = 9.81; // m/s^2

/**
 * Omvandlar grader till radianer.
 * @param {number} degrees - vinkel i grader
 * @returns {number} vinkel i radianer
 */
export function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Beräknar horisontell hastighetskomponent.
 * @param {number} initialSpeed - startfart i m/s
 * @param {number} angleDegrees - kastvinkel i grader
 * @returns {number} vx i m/s
 */
export function calculateHorizontalVelocity(initialSpeed, angleDegrees) {
  const angle = degreesToRadians(angleDegrees);
  return initialSpeed * Math.cos(angle);
}

/**
 * Beräknar vertikal hastighetskomponent.
 * @param {number} initialSpeed - startfart i m/s
 * @param {number} angleDegrees - kastvinkel i grader
 * @returns {number} vy i m/s
 */
export function calculateVerticalVelocity(initialSpeed, angleDegrees) {
  const angle = degreesToRadians(angleDegrees);
  return initialSpeed * Math.sin(angle);
}

/**
 * Beräknar flygtiden för ett kast med lika start- och landningshöjd.
 * @param {number} initialSpeed - startfart i m/s
 * @param {number} angleDegrees - kastvinkel i grader
 * @returns {number} flygtid i sekunder
 */
export function calculateFlightTime(initialSpeed, angleDegrees) {
  const verticalVelocity = calculateVerticalVelocity(initialSpeed, angleDegrees);
  return (2 * verticalVelocity) / gravitationalAcceleration;
}

/**
 * Beräknar projektionsbanans räckvidd.
 * @param {number} initialSpeed - startfart i m/s
 * @param {number} angleDegrees - kastvinkel i grader
 * @returns {number} räckvidd i meter
 */
export function calculateRange(initialSpeed, angleDegrees) {
  const angle = degreesToRadians(angleDegrees);
  const squaredSpeed = initialSpeed * initialSpeed;
  return (squaredSpeed * Math.sin(2 * angle)) / gravitationalAcceleration;
}

/**
 * Beräknar maximal höjd för ett kast med lika start- och landningshöjd.
 * @param {number} initialSpeed - startfart i m/s
 * @param {number} angleDegrees - kastvinkel i grader
 * @returns {number} maxhöjd i meter
 */
export function calculateMaxHeight(initialSpeed, angleDegrees) {
  const verticalVelocity = calculateVerticalVelocity(initialSpeed, angleDegrees);
  return (verticalVelocity * verticalVelocity) / (2 * gravitationalAcceleration);
}

/**
 * Beräknar banans position vid en viss tid.
 * x(t) = v0 * cos(θ) * t
 * y(t) = v0 * sin(θ) * t - 0.5 * g * t^2
 *
 * @param {number} initialSpeed - startfart i m/s
 * @param {number} angleDegrees - kastvinkel i grader
 * @param {number} timeSeconds - tid i sekunder
 * @returns {{x: number, y: number}} position i meter
 */
export function calculatePosition(initialSpeed, angleDegrees, timeSeconds) {
  const angle = degreesToRadians(angleDegrees);
  const vx = initialSpeed * Math.cos(angle);
  const vy = initialSpeed * Math.sin(angle);

  const x = vx * timeSeconds;
  const y = vy * timeSeconds - 0.5 * gravitationalAcceleration * timeSeconds * timeSeconds;

  return { x, y };
}

/**
 * Skapar en lista med punkter som beskriver banan från start till landning.
 * Varje punkt innehåller x, y och t. Metoden använder enhetlig tidsstepping.
 *
 * @param {number} initialSpeed - startfart i m/s
 * @param {number} angleDegrees - kastvinkel i grader
 * @param {number} sampleCount - antal punkter i banan
 * @returns {Array<{x: number, y: number, t: number}>} banpunkter
 */
export function buildTrajectory(initialSpeed, angleDegrees, sampleCount = 180) {
  const flightTime = calculateFlightTime(initialSpeed, angleDegrees);
  const points = [];

  for (let i = 0; i <= sampleCount; i += 1) {
    const t = (flightTime * i) / sampleCount;
    const position = calculatePosition(initialSpeed, angleDegrees, t);
    points.push({
      x: position.x,
      y: position.y,
      t,
    });
  }

  return points;
}

/**
 * Sammanfattning av de viktigaste fysikaliska egenskaperna för en ideal kastbana.
 *
 * @param {number} initialSpeed - startfart i m/s
 * @param {number} angleDegrees - kastvinkel i grader
 * @returns {{
 *   initialSpeed: number,
 *   angleDegrees: number,
 *   horizontalVelocity: number,
 *   verticalVelocity: number,
 *   flightTime: number,
 *   range: number,
 *   maxHeight: number,
 *   gravity: number,
 *   trajectory: Array<{x: number, y: number, t: number}>
 * }}
 */
export function describeProjectileMotion(initialSpeed, angleDegrees) {
  return {
    initialSpeed,
    angleDegrees,
    horizontalVelocity: calculateHorizontalVelocity(initialSpeed, angleDegrees),
    verticalVelocity: calculateVerticalVelocity(initialSpeed, angleDegrees),
    flightTime: calculateFlightTime(initialSpeed, angleDegrees),
    range: calculateRange(initialSpeed, angleDegrees),
    maxHeight: calculateMaxHeight(initialSpeed, angleDegrees),
    gravity: gravitationalAcceleration,
    trajectory: buildTrajectory(initialSpeed, angleDegrees),
  };
}
