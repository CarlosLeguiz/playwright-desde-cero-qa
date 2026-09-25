# Chromium, Firefox y WebKit en Playwright

Cuando instalaste Playwright y corrió el instalador, descargó estos tres motores en tu máquina. No te instaló Chrome, Firefox y Safari completos, sino solo los motores puros necesarios para correr tests.

## Chromium

**Motor de:** Chrome, Edge, Brave, Opera, Vivaldi, Arc, y otros.

**Qué es Chromium exactamente:**

Chromium es el proyecto open source detrás de Chrome. Google construye Chrome tomando Chromium como base y agregándole:

- Sincronización con cuenta Google
- Servicios propios (traducción, pago, etc.)
- Actualizaciones automáticas
- Logo y marca

**Playwright usa Chromium puro**, sin todo lo de marca de Google. Es prácticamente idéntico a Chrome desde el punto de vista de comportamiento web.

**Cuota de usuarios que representa:** el motor con más usuarios del mundo. Si tu app funciona en Chromium, funciona en Chrome, Edge, Brave y varios más.

## Firefox

**Motor de:** Firefox y algunos navegadores derivados menores.

**Qué es Firefox en Playwright:**

Playwright usa una versión de Firefox especialmente adaptada para automation. El motor Gecko es distinto a Blink y a WebKit, así que tests que pasan en Chromium a veces fallan acá por diferencias reales de comportamiento.

**Cuota de usuarios que representa:** minoritaria (~3%) pero fiel. Muchos usuarios técnicos y organizaciones que priorizan privacidad usan Firefox.

**Diferencias típicas con Chromium:**

- Manejo distinto de descargas y uploads
- Algunas APIs de JavaScript se comportan levemente distinto
- Renderizado de fuentes puede variar

## WebKit

**Motor de:** Safari en Mac, iPhone y iPad.

**Por qué es CRÍTICO testear en WebKit:**

Todos los iPhones y iPads del mundo usan Safari o navegadores que en iOS obligadamente usan WebKit por dentro (Apple no permite otros motores en iOS). Si tu app tiene usuarios mobile, WebKit no es opcional: es obligatorio.

**Diferencias típicas con Chromium:**

- CSS con features nuevas puede no estar soportado
- Timing de animaciones diferente
- Comportamiento de scroll distinto en mobile
- Fechas y zonas horarias con particularidades
- Manejo de foco y teclado con matices

**Nota importante:** Playwright corre WebKit incluso en Windows y Linux. Vos podés testear cómo se comportaría tu app en Safari sin tener un Mac. Eso es una ventaja enorme.

## Cuota de mercado combinada

Con estos tres motores, Playwright cubre:

- Chromium: usuarios de Chrome, Edge, Brave, Opera, Vivaldi (~65%)
- WebKit: usuarios de Safari en Mac, iPhone, iPad (~20%)
- Firefox: usuarios de Firefox (~3%)

Total aproximado: **~88% de los usuarios web del mundo cubiertos**.

## Nombres que confunden un poco

Un cuadro para dejarlo claro:

| Uso el nombre... | Estoy hablando de... |
|---|---|
| Chrome | El navegador de Google (marca comercial) |
| Chromium | El proyecto open source detrás de Chrome |
| Blink | El motor de renderizado (dentro de Chromium) |
| Safari | El navegador de Apple (marca) |
| WebKit | El motor de renderizado que usa Safari |
| Firefox | El navegador de Mozilla (marca) |
| Gecko | El motor de renderizado que usa Firefox |

En Playwright decimos "Chromium", "Firefox" y "WebKit" para referirnos a los tres motores.

## Ejecución en paralelo

Cuando corrés `npx playwright test`, Playwright NO ejecuta los tres motores en serie (uno después del otro). Los corre **en paralelo**, aprovechando los núcleos de tu CPU.

Ejemplo real: en una máquina con 8 núcleos, un test corre en Chromium, Firefox y WebKit al mismo tiempo, y termina en el tiempo del más lento, no en la suma de los tres.

## Resumen

- Chromium: el más importante por volumen de usuarios
- WebKit: crítico para cubrir mobile (iOS)
- Firefox: complementa para tener buena cobertura total
- Los tres se instalan y se corren automáticamente con una sola instalación
- Playwright los corre en paralelo, no en serie