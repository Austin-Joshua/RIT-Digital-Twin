export const SOURCE = {
  LIVE: 'LIVE',
  SIMULATED: 'SIMULATED',
  HISTORICAL: 'HISTORICAL',
  PREDICTED: 'PREDICTED',
  ESTIMATED: 'ESTIMATED',
};

export function sourceOf(record, fallback = SOURCE.ESTIMATED) {
  const raw = record?.source || record?.sourceClass;
  const name = raw ? String(raw).toUpperCase() : '';
  if (SOURCE[name]) return name;
  if (record?.isSimulated === true) return SOURCE.SIMULATED;
  if (record?.isSimulated === false) return SOURCE.ESTIMATED;
  return fallback;
}

/** Read a simulation body whether the API returns fields or a resultJson string. */
export function unwrapSimulation(body) {
  if (!body || typeof body !== 'object') return body;
  if (body.fleetOverview || body.congestionLevel || body.currentUsageAvg) return body;
  if (typeof body.resultJson !== 'string') return body;
  try {
    const parsed = JSON.parse(body.resultJson);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { ...parsed, source: body.source || parsed.source || SOURCE.SIMULATED, resultJson: body.resultJson };
    }
    return parsed;
  } catch {
    return body;
  }
}
