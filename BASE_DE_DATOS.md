# Base de datos de resultados

Cada vez que una persona completa el cuestionario y genera su informe, el sistema
guarda automáticamente un registro con sus resultados para análisis posterior.

## ¿Dónde se guardan los datos?

Por defecto, los registros se guardan en el **almacenamiento local del navegador**
(`localStorage`) del dispositivo donde se rindió el test. Esto significa que:

- Los datos quedan en **ese navegador y ese equipo**.
- No se comparten automáticamente entre distintos computadores o teléfonos.
- Si se borra la caché/datos del navegador, se pierden (por eso conviene exportar).

Para conservarlos y analizarlos, usa el botón **📊 Base de datos → Exportar CSV (Excel)**
o **Exportar JSON** de forma periódica.

## Campos que se registran

`fechaRegistro`, `nombre`, `cargo`, `genero`, `fechaAnalisis`,
`perfilResumen`, `perfilInterno`, `perfilExterno`,
puntajes internos `I_D/I_I/I_S/I_C`, externos `E_D/E_I/E_S/E_C`,
resumen `R_D/R_I/R_S/R_C` y `tensionMax` (% máximo de adaptación).

## (Opcional) Base de datos central en Google Sheets

Si quieres que **todos los resultados, desde cualquier dispositivo**, lleguen a una
sola planilla, sigue estos pasos:

1. Crea una planilla nueva en Google Sheets.
2. Menú **Extensiones → Apps Script** y pega este código:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  const headers = ['fechaRegistro','nombre','cargo','genero','fechaAnalisis',
    'perfilResumen','perfilInterno','perfilExterno',
    'I_D','I_I','I_S','I_C','E_D','E_I','E_S','E_C',
    'R_D','R_I','R_S','R_C','tensionMax'];
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  sheet.appendRow(headers.map(h => (data[h] !== undefined ? data[h] : '')));
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. **Implementar → Nueva implementación → Aplicación web.**
   - "Ejecutar como": tú mismo.
   - "Quién tiene acceso": **Cualquier usuario**.
   - Copia la **URL de la aplicación web** que te entrega.
4. En `index.html`, busca la línea:

   ```javascript
   const SHEETS_WEBHOOK_URL = '';
   ```

   y pega tu URL entre las comillas. Guarda y sube el cambio.

Desde ese momento, además de guardarse localmente, cada resultado se agregará como
una fila nueva en tu planilla, lista para analizar con tablas dinámicas, gráficos, etc.

> Nota: el envío usa `mode: 'no-cors'`, por lo que la app no lee la respuesta del
> script; el registro se agrega igualmente. Si algo falla, el resultado siempre
> queda guardado localmente como respaldo.
