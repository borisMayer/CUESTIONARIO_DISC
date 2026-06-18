// ============================================================
//  Cerebro central del Cuestionario DISC (Cloudflare Worker)
//  Reúne TODAS las evaluaciones de cualquier dispositivo.
//  Mismo enfoque que el "termómetro emocional".
//
//  Requiere un KV Namespace enlazado con el nombre:  DB
// ============================================================

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const KEY = "registros";

export default {
  async fetch(request, env) {
    // Preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    // Leer todos los registros
    if (request.method === "GET") {
      const data = await env.DB.get(KEY);
      const registros = data ? JSON.parse(data) : [];
      return json({ total: registros.length, registros: registros });
    }

    // Guardar / eliminar / vaciar
    if (request.method === "POST") {
      let body;
      try { body = await request.json(); }
      catch (e) { return json({ ok: false, error: "JSON inválido" }, 400); }

      const data = await env.DB.get(KEY);
      let registros = data ? JSON.parse(data) : [];

      if (body.accion === "vaciar") {
        registros = [];
      } else if (body.accion === "eliminar" && body.id) {
        registros = registros.filter(function (r) { return r.id !== body.id; });
      } else {
        // Nuevo registro: aseguramos id y fecha por si vinieran vacíos
        if (!body.id) body.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        if (!body.fechaRegistro) body.fechaRegistro = new Date().toISOString();
        registros.push(body);
      }

      await env.DB.put(KEY, JSON.stringify(registros));
      return json({ ok: true, total: registros.length });
    }

    return json({ ok: false, error: "Método no soportado" }, 405);
  }
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ "Content-Type": "application/json" }, CORS)
  });
}
