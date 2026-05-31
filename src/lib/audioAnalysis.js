export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function analyzeFrequencyBands(frequencyData, sampleRate, fftSize) {
  const binWidth = sampleRate / fftSize;
  let bassSum = 0;
  let bassCount = 0;
  let midSum = 0;
  let midCount = 0;
  let highSum = 0;
  let highCount = 0;

  for (let index = 1; index < frequencyData.length; index += 1) {
    const frequency = index * binWidth;
    const normalized = frequencyData[index] / 255;

    if (frequency < 180) {
      bassSum += normalized;
      bassCount += 1;
    } else if (frequency < 2200) {
      midSum += normalized;
      midCount += 1;
    } else if (frequency < 9000) {
      highSum += normalized;
      highCount += 1;
    }
  }

  return {
    bass: bassCount ? bassSum / bassCount : 0,
    mid: midCount ? midSum / midCount : 0,
    high: highCount ? highSum / highCount : 0,
  };
}
