# El Viaje de Dulcinea del Toboso — Portal oficial

Web estática del proyecto, construida con [Astro](https://astro.build). Estética siglo XVII, animación cinematográfica, y contenido separado del código.

## Puesta en marcha (en tu PC)

```bash
npm install     # solo la primera vez
npm run dev     # servidor local en http://localhost:4321
npm run build   # genera la web final en dist/
```

## Cómo actualizar cuando publiques un vídeo

Edita **un solo archivo**: `src/data/etapas.json`

Cada capítulo (villa) contiene sus **jornadas** — los vídeos, numerados como I.1, I.2, I.3…

1. Para publicar un vídeo, pega su enlace en el `url` del jornada:
   ```json
   "jornadas": [
     { "titulo": "La noche en que las estrellas se movieron", "url": "https://youtube.com/watch?v=XXXX" },
     { "titulo": "La plática imposible con Cervantes", "url": "" }
   ]
   ```
   Una jornada con `url` vacío aparece como "Aún por escribir"; con enlace, pasa a "▶ Ver vídeo" automáticamente.
2. Puedes **añadir jornadas nuevos en cualquier momento** (basta añadir otra línea `{ "titulo": ..., "url": ... }`).
3. Cuando termines todos los jornadas de una villa, cambia su `estado` a `"publicado"` y pon `"estado": "actual"` en la siguiente.
4. Guarda y haz push (o `npm run build` y sube `dist/`).

El mapa, las filas de capítulos (con su contador "x de y jornadas") y el panel de detalle se actualizan solos.

## Despliegue recomendado: Cloudflare Pages (gratis)

1. Sube este proyecto a un repositorio de GitHub.
2. En Cloudflare Pages → *Create project* → conecta el repo.
3. Framework preset: **Astro** (build `npm run build`, output `dist`).
4. En tu panel DNS, apunta `dulcinea.tudominio.es` al proyecto de Pages.

Cada `git push` publica la web nueva en segundos.

## Estructura

```
src/data/etapas.json    ← ÚNICO archivo a tocar al publicar vídeos
src/data/aliados.json   ← negocios escuderos
src/pages/index.astro   ← estructura de la página (HTML)
src/styles/global.css   ← toda la estética 1616
src/scripts/portal.js   ← animaciones e interacción de los mapas
src/layouts/Base.astro  ← <head>, fuentes y SEO
```

## Pendiente / ideas siguientes

- Formulario real en «Hacerse escudero» (puede ser un simple `mailto:` o un formulario de Cloudflare/Tally).
- Página individual por municipio (`src/pages/villa/[slug].astro`) con más turismo y todos sus vídeos.
- Automatizar `etapas.json` desde la API de YouTube (etiquetando los vídeos por municipio).
"# dulcinea-web"  
