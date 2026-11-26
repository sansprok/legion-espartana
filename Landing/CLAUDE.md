# Landing "Legión Espartana" — contexto para Claude

Página de presentación (landing) para Carlos, cliente en Chile, marca
"Un espartano jamás se rinde". Es una página **estática**: `index.html` (HTML, CSS y JS
en un solo archivo) + `logo.webp`. Sin backend ni base de datos.

## Publicación
- Destino: **Netlify**, en un **sitio nuevo**, independiente del de UBRIT.
  Se publica arrastrando esta carpeta a https://app.netlify.com/drop
  (no requiere build). Solo deben subirse `index.html`, `logo.webp` y los recursos de la página
  (no `CLAUDE.md`; si se agregan archivos de trabajo, publicar una subcarpeta limpia).
- Historial: estuvo temporalmente en la raíz del backend de UBRIT (Render,
  `ubrit-backend/client/dist`). Hay que retirarla de ahí cuando esté en Netlify
  (pendiente, se hace desde la conversación de UBRIT). No volver a publicarla en UBRIT.

## Contenido actual
Navegación, hero con logo, cuenta regresiva al próximo reto (lunes 5:00), método,
planes con precios en CLP, **planes por edad** (35–60 años × Recluta/Guerrero/Espartano),
cronómetro de rutina, generador de reto de 30 días, rangos (Recluta → Leyenda),
app "próximamente", preguntas frecuentes, botón flotante de WhatsApp y selector
de idioma ES/EN (guardado en localStorage `legion-lang`).
- Contacto: WhatsApp (constante `WA` en el script). Los formularios no envían datos:
  abren WhatsApp con el mensaje armado.
- Estilo: fondo #0d0c0b, dorado #c9a24e / #e8c77d, rojo #9e1b1f; tipografías Oswald + Inter.
- Todo texto nuevo debe existir en **español e inglés** (sistema de traducción al final del script).

## Próximo trabajo: mascota
El usuario quiere un **personaje mascota** que acompañe durante la navegación e
interactúe en los ejercicios diarios (cronómetro, reto de 30 días, planes por edad).
Ideas a evaluar con el usuario antes de implementar:
- Personaje propio (original) con estética espartana; definir nombre y personalidad.
- Formato: SVG o imágenes con varias expresiones (saluda, anima, celebra, descansa),
  burbuja de diálogo con frases cortas y motivadoras.
- Reacciones: al cargar, al hacer scroll por secciones, al iniciar/pausar/terminar el
  cronómetro, en descansos, al cambiar de nivel o edad, al completar la rutina.
- Debe poder minimizarse, no tapar botones en celular y respetar `prefers-reduced-motion`.
- Pensarlo reutilizable: la misma mascota irá después en la app Legión (`../Frontend`).

## Proyecto relacionado
`../Backend` y `../Frontend`: app Legión (Angular 9 + Nebular 5 + Node/Mongo), en
construcción; ver `../CLAUDE.md` si existe. La instalación quedó pausada por falta de
espacio en el disco C:.

## Reglas del usuario
- Textos formales y claros. Commit/push solo cuando se pida. Borrados con confirmación.
