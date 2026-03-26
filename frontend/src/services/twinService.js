import api from './api';

const twinService = {
  getCrowdDensity: (day, slot) => api.get(`/twin/crowd-density?day=${day}&slot=${slot}`),
  getEnergyForecast: (day) => api.get(`/twin/energy-forecast?day=${day}`),
  getResourceUtilization: () => api.get('/twin/utilization'),
  simulateScenario: (params) => api.post('/twin/simulate-scenario', params),
  getCongestionPrediction: () => api.get('/twin/predictions/congestion'),
  getEnergyPrediction: () => api.get('/twin/predictions/energy')
};

export default twinService;
