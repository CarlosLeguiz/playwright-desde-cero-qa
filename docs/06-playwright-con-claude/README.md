# Módulo 6: Playwright con Claude Code

Este módulo es la columna vertebral del repo. Hasta acá aprendimos Playwright "a mano": escribir locators, armar tests, debuggear. En este módulo cambiamos de velocidad: usamos Claude Code dentro de VS Code para que escriba, corra y mantenga los tests con nosotros, mientras nosotros ejercemos el criterio de QA.

Basado en el "Module 3: Playwright Locators with Claude" del curso que seguimos con mis compañeros de trabajo. **Este módulo usa TypeScript**, siguiendo el PPTX original del curso.

## Por qué TypeScript solo en este módulo

Los módulos 1 al 5 están en JavaScript (es lo que usamos en el laburo). Pero el curso de locators con Claude está íntegramente en TypeScript, y como el objetivo es que puedas seguir las clases con tus compañeros al pie de la letra, en este módulo respetamos ese formato.

**Playwright soporta ambos lenguajes sin configuración extra.** Un mismo proyecto puede tener tests `.spec.js` y `.spec.ts` conviviendo.

Diferencias prácticas entre JS y TS que vas a ver acá:

- Los imports usan `import { test, expect } from '@playwright/test'` en vez de `require(...)`
- Los archivos terminan en `.spec.ts` en vez de `.spec.js`
- A veces vas a ver tipos (anotaciones como `: string`, `: Page`), aunque Playwright no te obliga a ponerlos

## La idea en una frase

Claude propone, Playwright prueba. Claude es tu pair tester, no tu fuente de verdad. El navegador tiene la última palabra.

## El método de 4 pasos (lo vas a usar siempre)

Cada vez que quieras automatizar algo nuevo, vas a repetir estos 4 pasos:

### 1. Capture

Abrí la página en el navegador. Click derecho sobre el elemento que te interesa, "Inspect" (DevTools). Copiá el HTML con "Copy outerHTML". Idealmente copiá el bloque padre, no un tag solo, así Claude tiene contexto.

### 2. Prompt

Pegale a Claude Code el HTML y usá el "master prompt" (abajo). Pedile locators ranqueados por prioridad, con una razón y un fallback por cada uno.

### 3. Verify

Corré el test con `npx playwright test --ui`. Usá el botón "Pick locator" para pegar cada locator sugerido y confirmar que resuelve a UN SOLO elemento. Si resuelve a cero o a varios, volvé a Claude con el error.

### 4. Harden

Si el locator depende del orden (`.nth(0)`), de clases hasheadas (`.css-abc123`), o de IDs autogenerados, pedile a Claude una alternativa más estable. Un buen locator sobrevive a redesigns.

## El master prompt (template base)

Copialo tal cual, cambiá solo la línea "Tarea":

```
Sos un ingeniero senior de automation testing con Playwright.
Tarea: [lo que querés automatizar]

Dame locators de Playwright en TypeScript con esta prioridad:
getByRole > getByLabel > getByPlaceholder > getByText > getByTestId > CSS > XPath

Reglas:
- Cada locator debe matchear exactamente un elemento.
- Nada de IDs autogenerados, clases hasheadas, o nth-child a menos que sea inevitable.
- Una línea de razón y un fallback por cada locator.
- Solo usá atributos que existan en el HTML que te pasé.
```

## Contenido del módulo

1. [Core Actions](./01-core-actions.md): las 5 acciones básicas (goto, fill, click, hover, assertion) con saucedemo.com
2. [Locate Elements](./02-locate-elements.md): pedirle a Claude un mapa de locators de toda una página (herokuapp)
3. [Tips y Tricks](./03-tips-y-tricks.md): strict mode, 6 hábitos para mejores locators
4. [Correr en navegadores](./04-navegadores.md): Chromium, Firefox, WebKit, Chrome, Edge
5. [Dropdowns](./05-dropdowns.md): native select y custom (React)
6. [Date Pickers](./06-datepickers.md): iframes y calendarios tipo jQuery UI
7. [Tablas](./07-tablas.md): filas, columnas, data-driven
8. [Parent/Child chaining](./08-parent-child.md): subir y bajar en el DOM
9. [Playwright MCP](./09-playwright-mcp.md): dejar que Claude maneje el navegador en vivo

## Sitios de práctica que usamos

Todos los sitios son públicos y están pensados para automation:

- https://www.saucedemo.com (login, productos, carrito, sort)
- https://the-internet.herokuapp.com (login, tablas, dropdowns)
- https://jqueryui.com/datepicker (calendar en iframe)
- https://demoqa.com/select-menu (dropdowns custom)

## Prerrequisitos

- Haber completado los Módulos 1 al 5
- Tener Claude Code instalado y logueado (sección se instala con `npm install -g @anthropic-ai/claude-code`)
- Cuenta de Claude Pro activa

## Cómo usar el módulo

Lee cada archivo en orden. Cada uno tiene:

- Qué cubre
- El prompt EXACTO que le pedís a Claude Code
- El código TypeScript que debería generar
- Cómo correrlo y verificarlo
- Un reto para practicar

## Fuente

Module 3 "Playwright Locators with Claude" del curso de Playwright + IA que estoy haciendo con mis compañeros.