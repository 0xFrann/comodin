# Vale de Franco

Una tarjeta digital, numerada, que vale por 1 día de Franco. Se emite desde el celular en medio de una charla y se manda por WhatsApp.

- `index.html`: la tarjeta pública. Lee el link `…/comodin/#007-xxxx` y muestra el número, el nombre y la fecha.
- `emitir.html`: el emisor. Guarda nombre, WhatsApp y nota en un repo privado y arma el mensaje para mandar.
- `assets/config.js`: tus datos, la dirección pública y el repo del registro.
- `herramientas/og.html`: genera la imagen de vista previa que muestra WhatsApp.

## Cómo se guardan las cosas

| Qué | Dónde | Quién lo ve |
| --- | --- | --- |
| Número, nombre y fecha de cada tarjeta | En el propio link, ofuscados | Quien tenga el link |
| Registro completo (nombre, WhatsApp, nota, canjeado) | `emisiones.json` en el repo privado `comodin-registro` | Solo vos |
| Token de GitHub | `localStorage` del navegador donde lo cargaste | Solo ese navegador |

El link no lleva cifrado real: la clave está en `config.js`, que es público. Sirve para que el nombre no se lea a simple vista, y solo contiene lo que la otra persona ya ve en su tarjeta. Lo sensible (teléfonos y notas) nunca sale del repo privado.

## Puesta en marcha

1. Subí estos archivos a un repo **público** `0xfrann/comodin` y activá GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root).
2. Creá un repo **privado** `0xfrann/comodin-registro`. Puede estar vacío.
3. Creá un [token fine-grained](https://github.com/settings/personal-access-tokens/new):
   - Repository access: *Only select repositories* → `comodin-registro`
   - Permissions → Repository → **Contents: Read and write**
4. Abrí `https://0xfrann.github.io/comodin/emitir.html` en tu celular, pegá el token y listo. Conviene agregarla a la pantalla de inicio.
5. Abrí `herramientas/og.html`, descargá `og.png` y subilo a la raíz del repo, así el link llega con imagen.

## Uso

1. Escribís nombre, WhatsApp (opcional) y una nota.
2. Tocás **Emitir**: se guarda en el registro con el próximo número.
3. **Enviar a … por WhatsApp** abre el chat con esa persona y el mensaje con el link. **Compartir la imagen** manda la tarjeta como foto (en celulares que lo permiten).

En el registro podés buscar, ver la nota, marcar como canjeado y volver a compartir cualquier vale.

Si cambiás la `clave` en `config.js`, los links ya enviados siguen mostrando el número pero pierden el nombre.

## Antes de cada deploy

Corré `python3 herramientas/version.py`. Le pone una versión nueva (`?v=...`) a los estilos, scripts e imágenes, así los navegadores bajan lo nuevo en vez de usar lo que tenían guardado.
