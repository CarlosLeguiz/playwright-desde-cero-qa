# 04. Correr tests en navegadores específicos

Playwright trae 3 motores integrados (Chromium, Firefox, WebKit) y además puede usar Chrome y Edge "reales" si los tenés instalados. Este archivo cubre cómo configurarlos todos y correr tus tests en el que vos elijas.

Basado en la Lecture 3.5 del PPTX.

## Qué viene por defecto

Cuando instalaste Playwright, se descargaron 3 motores:

- **Chromium**: la base de Chrome, Edge, Brave, Opera, Vivaldi
- **Firefox**: adaptado para automation
- **WebKit**: la base de Safari (iPhone, iPad, Mac)

Esos 3 ya están en tu `playwright.config.js` como "projects". Por eso cuando corrés `npx playwright test` sin más, Playwright corre todo 3 veces (uno por navegador).

## Qué NO viene por defecto

Chrome y Edge "reales" (los que tenés instalados en la Mac para navegar). Son casi iguales a Chromium, pero no idénticos. Si tu app es consumida por usuarios reales de Chrome o Edge, conviene probar en los reales.

## El prompt para configurar todo con Claude Code

Abrí Claude Code:

```bash
claude
```

Pegale:

```
Actualizá mi playwright.config.js para que soporte estos 5 navegadores como projects:
- chromium
- firefox
- webkit
- chrome (el Google Chrome instalado en mi Mac, con channel: 'chrome')
- edge (el Microsoft Edge instalado, con channel: 'msedge')

También:
- Agregá baseURL: 'https://www.saucedemo.com' en el bloque "use" global
- Agregá testIdAttribute: 'data-test' (saucedemo usa data-test en vez del default data-testid)

Después mostrame los comandos para:
- Correr todos los tests en todos los proyectos
- Correr SOLO Firefox con navegador visible
- Correr un archivo específico SOLO en Edge
- Descargar los navegadores que me falten
```

## El config resultante

Claude te lo deja algo así (adaptado a nuestro proyecto):

```javascript
// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: ['tests/**/*.spec.{js,ts}', 'laboratorios/**/*.spec.{js,ts}'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  ],
});
```

**Explicación de las partes nuevas:**

- **`baseURL`**: una URL base por default. Si la configurás, podés hacer `page.goto('/')` o `page.goto('/inventory.html')` sin repetir el dominio.
- **`testIdAttribute`**: por default Playwright busca `data-testid`. Saucedemo usa `data-test`. Esta línea le dice que use ese otro atributo.
- **`channel`**: para los navegadores "reales". `channel: 'chrome'` usa el Chrome instalado en tu Mac; `channel: 'msedge'` usa Edge.

## Los comandos (todos probados)

### Correr TODO en TODOS los proyectos

```bash
npx playwright test
```

### Correr solo en Firefox, con ventana visible

```bash
npx playwright test --project=firefox --headed
```

### Correr un archivo específico, solo en Edge

```bash
npx playwright test laboratorios/02-core-actions-saucedemo/core-actions.spec.ts --project=edge
```

### Descargar los motores oficiales (Chromium, Firefox, WebKit)

```bash
npx playwright install chromium firefox webkit
```

### Instalar Edge (si no lo tenés)

```bash
npx playwright install msedge
```

Chrome y Edge "reales" normalmente ya están en tu Mac. Si no, los descargás desde su web oficial.

### Combinar varios navegadores a la vez

```bash
npx playwright test --project=chromium --project=firefox --project=webkit
```

### Ver qué proyectos tenés configurados

```bash
npx playwright test --list
```

## Resultado típico corriendo 3 navegadores

```
Running 3 tests using 3 workers
  ✓ 1 [chromium] › core-actions.spec.ts:3:5 › standard user puede loguearse (2.1s)
  ✓ 2 [firefox] › core-actions.spec.ts:3:5 › standard user puede loguearse (3.2s)
  ✓ 3 [webkit] › core-actions.spec.ts:3:5 › standard user puede loguearse (2.5s)
  3 passed (8.4s)
```

**Observación interesante:** aunque corrió 3 tests, el tiempo total es ~8s porque corre en paralelo (todos juntos). En serie serían ~8s = 2.1 + 3.2 + 2.5. Playwright lo optimiza solo.

## Estrategia práctica

En tu día a día:

- **Desarrollando un test nuevo**: correlo en 1 solo navegador (`--project=chromium`), más rápido
- **Antes de commitear**: correlo en los 3 motores para verificar
- **En CI/CD**: correlo en los 5 (chromium, firefox, webkit, chrome, edge) para máxima cobertura

## Reto

Tomá el test del Lab 2 (`02-core-actions-saucedemo/core-actions.spec.ts`) y corré SOLO en Firefox y WebKit al mismo tiempo:

```bash
npx playwright test laboratorios/02-core-actions-saucedemo --project=firefox --project=webkit
```

Si en algún motor falla y en el otro no, pegale el error a Claude Code y preguntale "¿este error se debe a una diferencia de comportamiento entre motores?". Esos son los bugs que SOLO encontrás testeando multi-browser.

## Checklist

- [ ] Claude Code actualizó el `playwright.config.js` con los 5 projects
- [ ] Agregó baseURL y testIdAttribute
- [ ] Corriste el test en Firefox solo y pasó
- [ ] Corriste el test en Edge y pasó
- [ ] Si falló en algún motor, pediste a Claude Code que lo diagnostique

## Siguiente

[05. Dropdowns](./05-dropdowns.md): native `<select>` y custom (React, Vue). Los dropdowns son los primeros elementos "complicados" que te vas a cruzar en apps reales.