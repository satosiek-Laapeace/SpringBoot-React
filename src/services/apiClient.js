const normalizeResponse = (payload) => {
  const data = payload && Object.hasOwn(payload, 'data') ? payload.data : payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  return data ?? null;
};

export const requestAPI = async (endpoint, { skipAuth = false, preservePage = false, ...options } = {}) => {
  let response;
  try {
    const token = localStorage.getItem('token');
    const headers = new Headers(options.headers);
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');
    if (skipAuth) {
      headers.delete('Authorization');
    } else if (token) {
      headers.set('Authorization', 'Bearer ' + token);
    }
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    if (options.body && !isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    response = await fetch(endpoint, { ...options, headers });
  } catch {
    throw new Error('Unable to reach the FarmCraft server. Check that Spring Boot is running.');
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const fallbackMessage = response.status === 502
      ? 'The frontend proxy could not reach Spring Boot. Start Farm_CraftMarket on port 8082, or set VITE_API_PROXY_TARGET to its address, then restart Vite.'
      : `Request failed (${response.status}).`;
    const error = new Error(payload?.message || payload?.error || fallbackMessage);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  try {
    const payload = await response.json();
    return preservePage ? (payload && Object.hasOwn(payload, 'data') ? payload.data : payload) : normalizeResponse(payload);
  } catch {
    throw new Error(`The FarmCraft server returned an invalid response for ${endpoint}.`);
  }
};

export const optionalRequestAPI = async (endpoint, options = {}) => {
  try {
    return await requestAPI(endpoint, options);
  } catch (error) {
    if (error.status !== 401 && error.status !== 403) {
      console.warn(`Spring Boot API ${endpoint}: ${error.message}`);
    }
    return null;
  }
};

export const requestAllPagesAPI = async (fetchPage, { pageSize = 100, maxPages = 100 } = {}) => {
  const records = [];
  for (let page = 0; page < maxPages; page += 1) {
    const batch = await fetchPage({ page, size: pageSize });
    if (!Array.isArray(batch)) throw new Error('The server returned an unsupported paginated response.');
    records.push(...batch);
    if (batch.length < pageSize) return records;
  }
  throw new Error(`The result exceeded the ${maxPages * pageSize} record pagination safety limit.`);
};
