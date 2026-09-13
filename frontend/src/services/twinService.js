import api from './api';

const twinService = {
  getCrowdDensity: (day, slot) => api.get(`/twin/crowd-density?day=${day}&slot=${slot}`),
  getEnergyForecast: (day) => api.get(`/twin/energy-forecast?day=${day}`),
  getResourceUtilization: () => api.get('/twin/utilization'),
  simulateScenario: (params) => api.post('/twin/simulate-scenario', params),
  getCongestionPrediction: () => api.get('/twin/predictions/congestion'),
  getEnergyPrediction: () => api.get('/twin/predictions/energy'),
  getCommandSnapshot: () => api.get('/twin/command'),
  getSpatialIndex: (horizon = 'NOW') => api.get(`/twin/spatial?horizon=${horizon}`),
  getSpatialBuilding: (id, horizon = 'NOW') => api.get(`/twin/spatial/buildings/${id}?horizon=${horizon}`),
  getSpatialRoom: (id, horizon = 'NOW') => api.get(`/twin/spatial/rooms/${id}?horizon=${horizon}`),
  getCampusState: () => api.get('/twin/state'),
  getSimulatedSources: () => api.get('/twin/sources'),
  getSimulationCatalog: () => api.get('/twin/simulate-scenario'),
  getExperience: () => api.get('/intelligence/experience'),
  getAlertCenter: () => api.get('/intelligence/alerts'),
  updateAlertStatus: (key, status) => api.post('/intelligence/alerts/status', { key, status }),
  getDecisions: () => api.get('/intelligence/decisions'),
  reviewDecision: (key) => api.post('/intelligence/decisions/review', { key }),
  authorizeDecision: (key, optionId) => api.post('/intelligence/decisions/authorize', { key, optionId }),
  checkDecisionOutcome: (id) => api.post(`/intelligence/decisions/${id}/outcome`)
};

export default twinService;
