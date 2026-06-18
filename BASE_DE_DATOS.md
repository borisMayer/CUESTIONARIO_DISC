# Base de datos de resultados

Cada vez que una persona completa el cuestionario y genera su informe, el resultado
se guarda automáticamente para análisis posterior. Funciona igual que el
**termómetro emocional**: hay un "cerebro" central (un **Cloudflare Worker**) que
reúne **todas** las evaluaciones de cualquier dispositivo en un solo lugar.

## Dos modos de funcionamiento

- **Con servidor central configurado (recomendado):** todos los resultados, desde
  cualquier teléfono o computador, llegan a una sola base de datos. La pantalla
  "📊 Base de datos" los muestra todos y permite exportarlos.
- **Sin configurar (por defecto):** cada dispositivo guarda sus propios registros
  localmente como respaldo. Sirve para probar, pero no centraliza.

En ambos casos siempre queda una copia local de respaldo en el navegador.

## Campos que se registran

`id`, `fechaRegistro`, `nombre`, `cargo`, `genero`, `fechaAnalisis`,
`perfilResumen`, `perfilInterno`, `perfilExterno`,
puntajes internos `I_D/I_I/I_S/I_C`, externos `E_D/E_I/E_S/E_C`,
resumen `R_D/R_I/R_S/R_C` y `tensionMax` (% máximo de adaptación).

## Activar el servidor central (Cloudflare Worker)

1. Entra a Cloudflare → **Workers & Pages → Create → Worker**. Dale un nombre,
   por ejemplo `disc`.
2. Reemplaza el código por el del archivo **`worker.js`** de este repositorio.
3. Crea un almacenamiento **KV**: en Cloudflare ve a **Storage & Databases → KV →
   Create namespace** (por ejemplo `disc_resultados`).
4. Enlaza ese KV al Worker: en el Worker, **Settings → Bindings → Add → KV namespace**.
   - **Variable name (nombre del binding):** `DB`  ← debe llamarse exactamente así.
   - **KV namespace:** el que creaste.
5. **Deploy.** Cloudflare te dará una URL del tipo
   `https://disc.tu-usuario.workers.dev`.
6. En `index.html`, busca la línea:

   ```javascript
   const CONFIG = { endpoint: "" };
   ```

   y pega tu URL entre las comillas:

   ```javascript
   const CONFIG = { endpoint: "https://disc.tu-usuario.workers.dev" };
   ```

   Guarda y sube el cambio. Desde ese momento todas las evaluaciones se centralizan.

## API del Worker (referencia)

- `GET /` → devuelve `{ total, registros: [...] }` con todas las evaluaciones.
- `POST /` con el JSON de un registro → lo agrega.
- `POST /` con `{ "accion": "eliminar", "id": "..." }` → elimina un registro.
- `POST /` con `{ "accion": "vaciar" }` → borra todos.

## Analizar los datos

Desde la pantalla "📊 Base de datos":
- **Exportar CSV (Excel):** separador `;` y BOM UTF-8 para que Excel en Chile
  abra las columnas y los acentos correctamente.
- **Exportar JSON:** para procesarlo con otras herramientas.
