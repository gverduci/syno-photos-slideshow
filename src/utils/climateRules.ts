// TODO: mode these functions openhab to centralize climate-related calculations
// and use them both in the API route and in the UI component

export const dewPointCalculation = (temperature: number, humidity: number): number => {
  // Magnus formula for dew point calculation
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100);
  const dewPoint = (b * alpha) / (a - alpha);
  return parseFloat(dewPoint.toFixed(2));
};

export const isComfortableClimate = (temperature: number, humidity: number): boolean => {
  // Define comfortable climate conditions
  return temperature >= 20 && temperature <= 25 && humidity >= 30 && humidity <= 60;
};

export const classifyClimate = (temperature: number, humidity: number): 'cold' | 'comfortable' | 'hot' => {
  if (temperature < 20) {
    return 'cold';
  } else if (temperature > 25) {
    return 'hot';
  } else {
    return 'comfortable';
  }
};

export const classjfyDewPoint = (dewPoint: number): string => {
    if (dewPoint < 10) {
        return 'Low risk of mold growth';
    } else if (dewPoint > 14) {
        return 'High risk of mold growth';
    } else {
        return 'Moderate risk of mold growth';
    }
};

export const getDevPointColor = (dewPoint: number): string => {
    if (dewPoint < 10) {
        return '#00ffa2ff'; // Blue for low dew point
    } else if (dewPoint >= 10 && dewPoint <= 14) {
        return '#FFFF00'; // Yellow for moderate dew point
    } else {
        return '#FF4500'; // Red for high dew point
    }
}

const disconfortAssessment = (temperature: number, humidity: number): number => {
    const discomfortIndex = temperature - (0.55 - 0.0055 * humidity) * (temperature - 14.5);
    let diEffects = 0;
    switch(true) {
      case discomfortIndex <= 10.0:
        diEffects = 0
        break;
      case discomfortIndex>10.0 && discomfortIndex<=15.0:
        diEffects = 1
        break;
      case discomfortIndex>15.0  &&  discomfortIndex<=18.0:
        diEffects = 2
        break;
      case discomfortIndex>18.0  &&  discomfortIndex<=21.0:
        diEffects = 3
        break;
      case discomfortIndex>21.0  &&  discomfortIndex<=24.0:
        diEffects = 4
        break;
      case discomfortIndex>24.0  &&  discomfortIndex<=27.0:
        diEffects = 5
        break;
      case discomfortIndex>27.0  &&  discomfortIndex<=29.0:
        diEffects = 6
        break;
      case discomfortIndex>29.0  &&  discomfortIndex<=32.0:
        diEffects = 7
        break;
      case discomfortIndex>32.0:
        diEffects = 8
        break;
    }
    return diEffects
};

const disconfortColorLevels = ['#008cffff', '#00eeffff', '#00ff99ff', '#00ff40ff', '#c3ff00ff', '#ffea00ff', '#ff9100ff', '#ff5500ff', '#FF0000'];


const disconfortLabelLevels = [
      "Extremely Uncomfortable",
      "Moderately Uncomfortable",
      "Relatively Comfortable",
      "Comfortable",
      "Less than 50% of the population feel uncomfortable",
      "More than 50% of the population feel uncomfortable",
      "Most of population feels uncomfortable",
      "Everyone feels severe stress",
      "State of medical emergency"
    ];

export const getDisconfortColor = (temperature: number, humidity: number): string => {
    const diLevel = disconfortAssessment(temperature, humidity);
    return disconfortColorLevels[diLevel];
};

export const getDisconfortLabel = (temperature: number, humidity: number): string => {
    const diLevel = disconfortAssessment(temperature, humidity);
    return disconfortLabelLevels[diLevel];
}

export const assessClimateConditions = (temperature: number, humidity: number) => {
    const dewPoint = dewPointCalculation(temperature, humidity);
    const climateClass = classifyClimate(temperature, humidity);
    const dewPointClass = classjfyDewPoint(dewPoint);

    return {
        dewPoint,
        climateClass,
        dewPointClass
    };
};

