const normalizeHttpBase = (candidate) => {
  if (!candidate || typeof candidate !== 'string' || !candidate.trim()) return null;
  let raw = candidate.trim();
  if (!/^https?:\/\//i.test(raw) && !/^wss?:\/\//i.test(raw)) {
    raw = `https://${raw}`;
  }

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }

  // SockJS endpoints must be http(s), not ws(s).
  if (parsed.protocol === 'ws:') parsed.protocol = 'http:';
  if (parsed.protocol === 'wss:') parsed.protocol = 'https:';
  if (!['http:', 'https:'].includes(parsed.protocol)) return null;

  parsed.pathname = parsed.pathname.replace(/\/+$/, '');
  return parsed.toString().replace(/\/$/, '');
};

export const getSockJsEndpoint = (path = '/ws') => {
  const normalizedPath = `/${String(path || '/ws').replace(/^\/+/, '')}`;

  const wsEnv = import.meta.env.VITE_WEBSOCKET_URL;
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  const backendBase = import.meta.env.VITE_BACKEND_URL;

  const envBase = normalizeHttpBase(wsEnv);
  if (envBase) return `${envBase}${normalizedPath}`;

  const backend = normalizeHttpBase(backendBase);
  if (backend) return `${backend}${normalizedPath}`;

  const apiDerived = normalizeHttpBase((apiBase || '').replace(/\/api\/?$/, ''));
  if (apiDerived) return `${apiDerived}${normalizedPath}`;

  return `http://localhost:8080${normalizedPath}`;
};
