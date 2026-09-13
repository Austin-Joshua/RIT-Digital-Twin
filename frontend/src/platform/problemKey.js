export function parseProblemKey(raw) {
  const parts = String(raw || '').split(':');
  if (parts.length !== 3) return null;
  if (parts[0] !== 'crowd' && parts[0] !== 'infrastructure') return null;
  if (!/^[1-9]\d*$/.test(parts[1]) || !/^[1-9]\d*$/.test(parts[2])) return null;
  return {
    type: parts[0],
    buildingId: parts[1],
    roomId: parts[2],
  };
}

export function buildingFromProblemKey(raw) {
  return parseProblemKey(raw)?.buildingId || '';
}
