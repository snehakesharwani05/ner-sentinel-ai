/**
 * Intelligent Risk Service
 * Transparent normalized weighted additive risk model for NER terrain, weather, and road disruptions.
 * 
 * Final Risk Score = (w_terrain * T) + (w_condition * C) + (w_weather * W) + (w_disruption * D)
 * Bounded strictly between 0.00 and 1.00.
 */

// Default Configurable Weights (Must sum to 1.0)
const DEFAULT_WEIGHTS = {
  terrain: 0.25,     // 25%
  condition: 0.20,   // 20%
  weather: 0.25,     // 25%
  disruption: 0.30    // 30%
};

// Normalized Factor Ratings (0.00 to 1.00)
const TERRAIN_RATINGS = {
  plain: 0.00,
  hilly: 0.35,
  steep_mountain: 0.70,
  high_pass: 1.00
};

const CONDITION_RATINGS = {
  good: 0.00,
  fair: 0.35,
  poor: 0.70,
  critical: 1.00
};

const DISRUPTION_RATINGS = {
  cleared: 0.00,
  low: 0.25,
  moderate: 0.50,
  high: 0.75,
  critical_blocked: 1.00
};

/**
 * Returns severity band string for a normalized risk score (0.00 - 1.00)
 */
function getSeverityBand(score) {
  if (score >= 0.75) return 'Critical';
  if (score >= 0.50) return 'High';
  if (score >= 0.25) return 'Moderate';
  return 'Low';
}

/**
 * Calculates normalized risk score (0.00 to 1.00) for a road segment.
 * @param {Object} segment Road segment row from SQLite
 * @param {Object|null} disruption Active disruption object if present
 * @param {Object|null} weather Weather object for location if present
 * @param {Object} customWeights Optional custom weight overrides
 * @returns {Object} { riskScore, severityBand, isBlocked, breakdown }
 */
function evaluateSegmentRisk(segment, disruption = null, weather = null, customWeights = {}) {
  const weights = { ...DEFAULT_WEIGHTS, ...customWeights };

  // 1. Terrain Risk (0.0 - 1.0)
  const terrainScore = TERRAIN_RATINGS[segment.terrain_type] ?? 0.0;

  // 2. Road Condition Risk (0.0 - 1.0)
  const conditionScore = CONDITION_RATINGS[segment.road_condition] ?? 0.0;

  // 3. Disruption Risk (0.0 - 1.0)
  let disruptionScore = 0.0;
  let isBlocked = false;

  if (disruption && disruption.status === 'active') {
    if (disruption.severity === 'critical_blocked') {
      isBlocked = true;
      disruptionScore = 1.0;
    } else {
      disruptionScore = DISRUPTION_RATINGS[disruption.severity] ?? 0.25;
    }
  }

  // 4. Weather Risk (0.0 - 1.0)
  let weatherScore = 0.0;
  if (weather) {
    const rainfallNorm = Math.min(1.0, (weather.rainfall_mm_24h || 0) / 200.0); // 200mm = max rainfall index
    const landslideNorm = Math.min(1.0, Math.max(0.0, weather.landslide_risk_index || 0));
    weatherScore = Math.min(1.0, (0.5 * rainfallNorm) + (0.5 * landslideNorm));
  }

  // Weighted Additive Formula
  const rawRiskScore = (weights.terrain * terrainScore) +
                       (weights.condition * conditionScore) +
                       (weights.weather * weatherScore) +
                       (weights.disruption * disruptionScore);

  const riskScore = isBlocked ? Infinity : Number(Math.min(1.0, Math.max(0.0, rawRiskScore)).toFixed(2));
  const normalizedScoreForBand = isBlocked ? 1.0 : riskScore;
  const severityBand = getSeverityBand(normalizedScoreForBand);

  return {
    riskScore,
    severityBand,
    isBlocked,
    breakdown: {
      terrain: { type: segment.terrain_type, score: terrainScore, weight: weights.terrain },
      condition: { status: segment.road_condition, score: conditionScore, weight: weights.condition },
      weather: { score: Number(weatherScore.toFixed(2)), weight: weights.weather },
      disruption: {
        status: isBlocked ? 'CRITICAL_BLOCKED' : (disruption ? disruption.severity : 'none'),
        score: disruptionScore,
        weight: weights.disruption
      }
    }
  };
}

module.exports = {
  evaluateSegmentRisk,
  getSeverityBand,
  DEFAULT_WEIGHTS,
  TERRAIN_RATINGS,
  CONDITION_RATINGS,
  DISRUPTION_RATINGS
};
