# Correr en navegadores específicos

Por default `npx playwright test` corre en los tres motores. Pero muchas veces querés correr en solo uno (para ir más rápido durante desarrollo) o excluir alguno.

## Cómo elegir un solo motor desde la terminal

Podés usar la flag `--project` para elegir en qué motor correr.

### Solo Chromium

```bash
npx playwright test --project=chromium
```

### Solo Firefox

```bash
npx playwright test --project=firefox
```

### Solo WebKit

```bash
npx playwright test --project=webkit
```

### Combinar dos motores

```bash
npx playwright test --project=chromium --project=firefox
```

## Configuración en playwright.config.ts

El archivo `playwright.config.ts` define qué "projects" (navegadores) están disponibles. Por default trae algo así:

```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
],
```

Cada bloque define un "project": un nombre y una configuración de dispositivo. Podés:

- **Comentar** los que no querés usar
- **Agregar** más (por ejemplo, iPhone o Pixel emulado)
- **Modificar** las opciones de cada uno

## Ejemplos prácticos

### Emular un iPhone

```typescript
{
  name: 'Mobile Safari',
  use: { ...devices['iPhone 15'] },
},
```

Con esto, Playwright emula la pantalla, el user agent y el touch de un iPhone 15, corriendo el test en WebKit.

### Emular un Android

```typescript
{
  name: 'Mobile Chrome',
  use: { ...devices['Pixel 8'] },
},
```

### Cambiar la resolución de escritorio

```typescript
{
  name: 'chromium-4k',
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 3840, height: 2160 },
  },
},
```

## Estrategias de ejecución recomendadas

### Durante desarrollo (local)

Correr en un solo motor para ir rápido:

```bash
npx playwright test --project=chromium
```

Cuando el test ya funciona bien, correlo en los tres antes de commitear.

### En CI/CD (GitHub Actions, GitLab, Jenkins)

Correr siempre en los tres motores. En pipelines a veces se corren en paralelo (uno por job) para acelerar.

### Testing focalizado en mobile

Si tu app es principalmente mobile, priorizá WebKit (iOS) y Chromium con perfil de mobile (Android).

## Correr en modo "headed" para verlos

Recordá que podés agregar `--headed` a cualquier comando para ver los navegadores en acción:

```bash
npx playwright test --project=webkit --headed
```

Muy útil para ver diferencias visuales entre motores.

## Correr un test específico

Si solo querés correr un archivo o incluso un test individual:

```bash
# Solo un archivo
npx playwright test tests/login.spec.ts

# Solo un archivo en Chromium
npx playwright test tests/login.spec.ts --project=chromium

# Solo tests que matcheen un texto en el nombre
npx playwright test --grep "checkout"
```

## Resumen

- `--project=chromium` corre solo en Chromium (y equivalentes para los otros)
- Podés combinar flags para elegir varios
- El archivo `playwright.config.ts` define qué navegadores están disponibles
- En desarrollo local, corré en un solo motor para ir rápido
- En CI, corré siempre en los tres para asegurar cobertura completa
- Podés emular dispositivos mobile con `devices['iPhone 15']` u otros