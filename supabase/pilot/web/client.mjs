// Read-only pilot adapter. No production API selection and no admin credentials.
export function createTrialClient({url, publishableKey, storage = globalThis.sessionStorage, fetchImpl = globalThis.fetch, now = Date.now}) {
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url) || !/^sb_publishable_/.test(publishableKey)) throw Error('Revisa la configuración de la prueba.');
  const storageKey = 'evolva:supabase-trial:' + new URL(url).hostname;
  let epoch = 0, session = null, refreshing = null;
  const pending = new Map();
  const failure = (message, status = 400) => Object.assign(Error(message), {status});
  const stale = () => failure('La sesión cambió. Vuelve a consultar.', 409);
  const clean = data => data && typeof data.access_token === 'string' && typeof data.refresh_token === 'string' && Number.isFinite(data.expires_at)
    ? {access_token:data.access_token, refresh_token:data.refresh_token, expires_at:data.expires_at} : null;
  try { session = clean(JSON.parse(storage?.getItem(storageKey) || 'null')); } catch { try {storage?.removeItem(storageKey);} catch {} }
  const save = value => {
    session = value;
    try {
      if (value) storage?.setItem(storageKey, JSON.stringify(value));
      else storage?.removeItem(storageKey);
    } catch { /* Keep the current tab usable when session storage is unavailable. */ }
  };
  async function json(path, body, token) {
    let response;
    try {
      response = await fetchImpl(url + path, {method:'POST', credentials:'omit', cache:'no-store', referrerPolicy:'no-referrer',
        headers:{apikey:publishableKey, 'Content-Type':'application/json', ...(token ? {Authorization:'Bearer ' + token} : {})},
        body:JSON.stringify(body), signal:AbortSignal.timeout(15000)});
    } catch { throw failure('No se pudo conectar. Revisa tu conexión y vuelve a intentar.', 503); }
    let result;
    try { result = await response.json(); } catch { if(response.ok) return null; result = {}; }
    if (!response.ok) {
      if (path.startsWith('/auth/v1/token')) throw failure(response.status === 429 ? 'Espera un momento antes de volver a intentar.' : 'Correo o contraseña incorrectos, o acceso aún no habilitado.', response.status);
      throw failure(response.status === 401 ? 'Tu sesión venció. Ingresa de nuevo.' : response.status === 403 ? 'La cuenta no tiene datos de prueba habilitados.' : 'No se pudo consultar la información. Intenta de nuevo.', response.status);
    }
    return result;
  }
  const normalized = data => clean({...data, expires_at:Number(data.expires_at) || Math.floor(now()/1000) + Number(data.expires_in)});
  const revoke = token => token ? json('/auth/v1/logout?scope=local', {}, token) : Promise.resolve();
  async function validSession() {
    if (!session) throw failure('Inicia sesión para continuar.', 401);
    if (session.expires_at > now()/1000 + 30) return session;
    if (refreshing) return refreshing;
    const version = epoch, before = session;
    const work = (async () => {
      try {
        const next = normalized(await json('/auth/v1/token?grant_type=refresh_token', {refresh_token:before.refresh_token}));
        if (version !== epoch) throw stale();
        if (!next) throw failure('Inicia sesión de nuevo.', 401);
        save(next); return next;
      } catch (error) {
        if (version === epoch && [400,401,403].includes(error.status)) { epoch++; save(null); pending.clear(); }
        throw error;
      }
    })();
    refreshing = work;
    try { return await work; } finally { if(refreshing === work) refreshing = null; }
  }
  async function read(data, enrollmentId = null) {
    const result = await json('/rest/v1/rpc/evolva_trial_dashboard', {p_enrollment_id:enrollmentId}, data.access_token);
    if (!result?.ok || result.trial !== true || !/^EVOLVA-[0-9]{6}$/.test(result.student?.matricula || '')) throw failure('La respuesta de la prueba no es válida.', 502);
    return result;
  }
  return {
    hasSession: () => !!session,
    async login(email, password) {
      email = String(email || '').trim().toLowerCase();
      if (!/^[0-9]{6}@evolvacademy\.mx$/.test(email) || typeof password !== 'string' || !password || password.length > 200) throw failure('Escribe tu correo institucional y la contraseña.');
      const version = ++epoch, previous = session; save(null); pending.clear();
      if(previous) await revoke(previous.access_token).catch(()=>{});
      const data = normalized(await json('/auth/v1/token?grant_type=password', {email, password}));
      if (version !== epoch) { await revoke(data?.access_token).catch(()=>{}); throw stale(); }
      if (!data) throw failure('No se pudo iniciar la sesión.', 502);
      let dashboard;
      try { dashboard = await read(data); }
      catch(error) { await revoke(data.access_token).catch(()=>{}); throw error; }
      if (version !== epoch) { await revoke(data.access_token).catch(()=>{}); throw stale(); }
      save(data); return dashboard;
    },
    async dashboard(enrollmentId = null) {
      if(enrollmentId !== null && !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(enrollmentId)) throw failure('Elige una inscripción válida.');
      const version = epoch, key = JSON.stringify([version,enrollmentId]);
      if(pending.has(key)) return pending.get(key);
      const work = (async () => {
        const current = await validSession();
        if(version !== epoch) throw stale();
        let result;
        try { result = await read(current,enrollmentId); }
        catch(error) { if(version === epoch && error.status === 401) {epoch++; save(null); pending.clear();} throw error; }
        if(version !== epoch) throw stale();
        return result;
      })();
      pending.set(key, work);
      try { return await work; } finally { if(pending.get(key) === work) pending.delete(key); }
    },
    async logout() {
      const previous = session; ++epoch; save(null); pending.clear();
      try { await revoke(previous?.access_token); }
      catch { throw failure('La sesión se cerró en este navegador. No se pudo confirmar el cierre en el servidor.', 503); }
    }
  };
}
