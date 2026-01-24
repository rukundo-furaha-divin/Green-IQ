// Safe Zone Scoring Algorithm
// This utility calculates safety scores for locations based on climate resilience,
// green infrastructure, and waste management capabilities

export class SafeZoneScorer {
  constructor() {
    this.weights = {
      climateResilience: 0.25,
      greenInfrastructure: 0.25,
      wasteManagement: 0.20,
      emergencyCapacity: 0.15,
      communityRating: 0.10,
      airQuality: 0.05
    };
  }

  // Calculate overall safety score (0-100)
  calculateSafetyScore(zoneData) {
    const scores = {
      climateResilience: this.calculateClimateResilienceScore(zoneData),
      greenInfrastructure: this.calculateGreenInfrastructureScore(zoneData),
      wasteManagement: this.calculateWasteManagementScore(zoneData),
      emergencyCapacity: this.calculateEmergencyCapacityScore(zoneData),
      communityRating: this.calculateCommunityRatingScore(zoneData),
      airQuality: this.calculateAirQualityScore(zoneData)
    };

    let totalScore = 0;
    Object.keys(scores).forEach(key => {
      totalScore += scores[key] * this.weights[key];
    });

    return Math.round(totalScore);
  }

  // Climate resilience scoring (0-100)
  calculateClimateResilienceScore(zoneData) {
    let score = 100;

    // Deduct points for climate risks
    zoneData.climateRisks.forEach(risk => {
      if (risk.includes('High')) score -= 30;
      else if (risk.includes('Moderate')) score -= 15;
      else if (risk.includes('Low')) score -= 5;
    });

    // Bonus for flood protection
    if (zoneData.greenInfrastructure.includes('Flood barriers')) score += 10;
    if (zoneData.greenInfrastructure.includes('Elevated structures')) score += 10;

    // Bonus for heat protection
    if (zoneData.greenInfrastructure.includes('Green roof')) score += 10;
    if (zoneData.greenInfrastructure.includes('Cooling systems')) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  // Green infrastructure scoring (0-100)
  calculateGreenInfrastructureScore(zoneData) {
    let score = 0;
    const infrastructure = zoneData.greenInfrastructure;

    // Renewable energy
    if (infrastructure.includes('Solar panels')) score += 20;
    if (infrastructure.includes('Wind turbines')) score += 15;
    if (infrastructure.includes('Waste-to-energy')) score += 25;

    // Water management
    if (infrastructure.includes('Rainwater harvesting')) score += 15;
    if (infrastructure.includes('Water recycling')) score += 15;
    if (infrastructure.includes('Water purification')) score += 10;

    // Green spaces
    if (infrastructure.includes('Community garden')) score += 10;
    if (infrastructure.includes('Urban forest')) score += 15;
    if (infrastructure.includes('Biodiversity garden')) score += 10;
    if (infrastructure.includes('Vertical gardens')) score += 10;

    // Additional green features
    if (infrastructure.includes('Green roof')) score += 10;
    if (infrastructure.includes('Natural ventilation')) score += 5;

    return Math.min(100, score);
  }

  // Waste management scoring (0-100)
  calculateWasteManagementScore(zoneData) {
    let score = 0;

    // Recycling centers proximity
    const recyclingCenters = zoneData.recyclingCenters || 0;
    if (recyclingCenters >= 5) score += 30;
    else if (recyclingCenters >= 3) score += 20;
    else if (recyclingCenters >= 1) score += 10;

    // Waste processing capabilities
    if (zoneData.greenInfrastructure.includes('Waste-to-energy')) score += 25;
    if (zoneData.greenInfrastructure.includes('Composting facilities')) score += 15;
    if (zoneData.greenInfrastructure.includes('Recycling facilities')) score += 20;

    // Waste reduction features
    if (zoneData.features.includes('Waste processing')) score += 10;
    if (zoneData.features.includes('Community education')) score += 5;

    // Bonus for comprehensive waste management
    if (score >= 60) score += 10;

    return Math.min(100, score);
  }

  // Emergency capacity scoring (0-100)
  calculateEmergencyCapacityScore(zoneData) {
    const capacity = zoneData.emergencyCapacity || 0;
    
    if (capacity >= 200) return 100;
    else if (capacity >= 150) return 85;
    else if (capacity >= 100) return 70;
    else if (capacity >= 50) return 50;
    else return 30;
  }

  // Community rating scoring (0-100)
  calculateCommunityRatingScore(zoneData) {
    const rating = zoneData.communityRating || 0;
    return Math.round(rating * 20); // Convert 5-star rating to 0-100
  }

  // Air quality scoring (0-100)
  calculateAirQualityScore(zoneData) {
    const airQuality = zoneData.airQuality || 'Unknown';
    
    switch (airQuality.toLowerCase()) {
      case 'excellent': return 100;
      case 'good': return 80;
      case 'moderate': return 60;
      case 'poor': return 30;
      case 'very poor': return 10;
      default: return 50;
    }
  }

  // Get detailed score breakdown
  getScoreBreakdown(zoneData) {
    return {
      climateResilience: {
        score: this.calculateClimateResilienceScore(zoneData),
        weight: this.weights.climateResilience,
        weightedScore: this.calculateClimateResilienceScore(zoneData) * this.weights.climateResilience
      },
      greenInfrastructure: {
        score: this.calculateGreenInfrastructureScore(zoneData),
        weight: this.weights.greenInfrastructure,
        weightedScore: this.calculateGreenInfrastructureScore(zoneData) * this.weights.greenInfrastructure
      },
      wasteManagement: {
        score: this.calculateWasteManagementScore(zoneData),
        weight: this.weights.wasteManagement,
        weightedScore: this.calculateWasteManagementScore(zoneData) * this.weights.wasteManagement
      },
      emergencyCapacity: {
        score: this.calculateEmergencyCapacityScore(zoneData),
        weight: this.weights.emergencyCapacity,
        weightedScore: this.calculateEmergencyCapacityScore(zoneData) * this.weights.emergencyCapacity
      },
      communityRating: {
        score: this.calculateCommunityRatingScore(zoneData),
        weight: this.weights.communityRating,
        weightedScore: this.calculateCommunityRatingScore(zoneData) * this.weights.communityRating
      },
      airQuality: {
        score: this.calculateAirQualityScore(zoneData),
        weight: this.weights.airQuality,
        weightedScore: this.calculateAirQualityScore(zoneData) * this.weights.airQuality
      }
    };
  }

  // Get safety level description
  getSafetyLevel(score) {
    if (score >= 85) return { level: 'Excellent', color: '#4CAF50', description: 'Very safe with comprehensive climate resilience and green infrastructure' };
    if (score >= 70) return { level: 'Good', color: '#FF9800', description: 'Safe with good climate resilience and waste management capabilities' };
    if (score >= 50) return { level: 'Moderate', color: '#FFC107', description: 'Moderately safe with basic climate protection features' };
    return { level: 'Limited', color: '#F44336', description: 'Limited safety features - consider alternative locations' };
  }

  // Get improvement recommendations
  getImprovementRecommendations(zoneData) {
    const recommendations = [];
    const breakdown = this.getScoreBreakdown(zoneData);

    if (breakdown.climateResilience.score < 70) {
      recommendations.push({
        category: 'Climate Resilience',
        priority: 'High',
        suggestions: [
          'Install flood barriers and drainage systems',
          'Add cooling systems for heatwave protection',
          'Implement early warning systems',
          'Create elevated emergency shelters'
        ]
      });
    }

    if (breakdown.greenInfrastructure.score < 60) {
      recommendations.push({
        category: 'Green Infrastructure',
        priority: 'High',
        suggestions: [
          'Install solar panels for renewable energy',
          'Implement rainwater harvesting systems',
          'Create community gardens and green spaces',
          'Add waste-to-energy facilities'
        ]
      });
    }

    if (breakdown.wasteManagement.score < 50) {
      recommendations.push({
        category: 'Waste Management',
        priority: 'Medium',
        suggestions: [
          'Establish recycling centers nearby',
          'Implement composting facilities',
          'Add waste processing capabilities',
          'Create waste reduction education programs'
        ]
      });
    }

    if (breakdown.emergencyCapacity.score < 60) {
      recommendations.push({
        category: 'Emergency Capacity',
        priority: 'Medium',
        suggestions: [
          'Expand emergency shelter capacity',
          'Add medical facilities and supplies',
          'Improve communication systems',
          'Create backup power systems'
        ]
      });
    }

    return recommendations;
  }

  // Calculate distance-based safety score (for nearby locations)
  calculateDistanceBasedScore(baseScore, distanceKm) {
    if (distanceKm <= 1) return baseScore;
    if (distanceKm <= 3) return baseScore * 0.9;
    if (distanceKm <= 5) return baseScore * 0.8;
    if (distanceKm <= 10) return baseScore * 0.7;
    return baseScore * 0.6;
  }

  // Get climate risk assessment
  getClimateRiskAssessment(zoneData) {
    const risks = zoneData.climateRisks || [];
    const assessment = {
      overallRisk: 'Low',
      riskFactors: [],
      mitigationMeasures: []
    };

    let riskScore = 0;
    risks.forEach(risk => {
      if (risk.includes('High')) riskScore += 3;
      else if (risk.includes('Moderate')) riskScore += 2;
      else if (risk.includes('Low')) riskScore += 1;
    });

    if (riskScore >= 6) assessment.overallRisk = 'High';
    else if (riskScore >= 3) assessment.overallRisk = 'Moderate';
    else assessment.overallRisk = 'Low';

    // Add specific risk factors
    if (risks.some(r => r.includes('flood'))) {
      assessment.riskFactors.push('Flood Risk');
      assessment.mitigationMeasures.push('Elevated structures, flood barriers, drainage systems');
    }

    if (risks.some(r => r.includes('heat'))) {
      assessment.riskFactors.push('Heat Risk');
      assessment.mitigationMeasures.push('Cooling centers, green roofs, shade structures');
    }

    if (risks.some(r => r.includes('air'))) {
      assessment.riskFactors.push('Air Quality Risk');
      assessment.mitigationMeasures.push('Air purification systems, indoor facilities');
    }

    return assessment;
  }
}

// Export singleton instance
export const safeZoneScorer = new SafeZoneScorer();

// Utility functions for external use
export const calculateZoneScore = (zoneData) => {
  return safeZoneScorer.calculateSafetyScore(zoneData);
};

export const getScoreBreakdown = (zoneData) => {
  return safeZoneScorer.getScoreBreakdown(zoneData);
};

export const getSafetyLevel = (score) => {
  return safeZoneScorer.getSafetyLevel(score);
};

export const getImprovementRecommendations = (zoneData) => {
  return safeZoneScorer.getImprovementRecommendations(zoneData);
};

export const getClimateRiskAssessment = (zoneData) => {
  return safeZoneScorer.getClimateRiskAssessment(zoneData);
}; 