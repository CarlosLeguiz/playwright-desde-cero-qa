# Laboratorio 1: Why async and await in Playwright

Material basado en la Lecture 11 (Section 3) del curso. Explica por qué Playwright usa `async` y `await` en todas sus líneas, con dos tests ejecutables y tres experimentos para romper el código a propósito y ver qué pasa.

## Qué cubre

- Por qué Node.js (y Playwright) son asíncronos
- Qué hace `async` en la función del test
- Qué hace `await` antes de cada acción
- Los tres errores clásicos de olvidar cada keyword

## Cómo correrlo

Desde la raíz del proyecto:

```bash
npx playwright test laboratorios/01-async-await-why/async-await-why.spec.js --headed
```

El `--headed` abre las ventanas de navegador para que veas la ejecución en vivo. Si no te interesa verlo, podés sacarlo.

Para correr solo en Chromium (más rápido, suficiente para la demo):

```bash
npx playwright test laboratorios/01-async-await-why/async-await-why.spec.js --headed --project=chromium
```

## Los tres experimentos de la clase

Después de ver que los tests corren bien, el valor del laboratorio está en romperlos a propósito para entender qué protege cada keyword. Hacé estos experimentos uno por uno y después restaurá el código:

### Experimento 1: borrar el `await` del `page.goto`

En el primer test, cambiá:

```javascript
await page.goto('https://playwright.dev/');
```

Por:

```javascript
page.goto('https://playwright.dev/');
```

Corré el test. El error que aparece es:

```
page.goto: Navigation failed because page was closed
```

**Por qué:** sin `await`, el goto arranca pero la función sigue de largo. La siguiente línea (`expect`) corre antes de que el navegador termine de cargar.

Restaurá el `await` antes de seguir.

### Experimento 2: borrar el `await` del `expect`

En el mismo test, cambiá:

```javascript
await expect(page).toHaveTitle(/Playwright/);
```

Por:

```javascript
expect(page).toHaveTitle(/Playwright/);
```

Corré el test. Esta vez el error dice que el título es `null` o que la assertion no se cumplió.

**Por qué:** sin `await`, la assertion no espera a que la página termine de cargar el título. Verifica el estado "actual" (vacío) y falla.

Restaurá el `await`.

### Experimento 3: borrar el `async` de la función

Cambiá:

```javascript
test('correct - each step waits for the previous one', async ({ page }) => {
```

Por:

```javascript
test('correct - each step waits for the previous one', ({ page }) => {
```

Corré. El error es de sintaxis:

```
SyntaxError: await is only valid in async functions
```

**Por qué:** `await` solo puede usarse dentro de funciones marcadas como `async`. Sin esa marca, JavaScript ni siquiera deja correr el código.

Restaurá el `async`.

## Lo que te llevás del laboratorio

- `async` habilita el uso de `await` adentro de la función
- `await` pausa hasta que la promesa se resuelva y devuelve el valor real
- Olvidar `await` genera tests flaky o errores de "elemento no encontrado"
- Olvidar `async` genera errores de sintaxis (más obvios de detectar)

## Fuente

Lecture 11, Section 3 del curso de Playwright + IA que estamos siguiendo con mis compañeros.