# Ejemplo desglosado: el test que ya ejecutaste

Cuando instalaste Playwright, se creó un archivo en `tests/example.spec.js`. Ese es el test que corrió cuando ejecutaste `npx playwright test` por primera vez. Ahora que aprendiste async/await, estructura, locators y assertions, vamos a desmenuzarlo línea por línea.

## El código completo

```javascript
const { test, expect } = require('@playwright/test');

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
```

Son dos tests. Vamos uno por uno.

## Test 1: `has title`

### Línea 1: el import

```javascript
const { test, expect } = require('@playwright/test');
```

Traemos las dos funciones fundamentales de Playwright:
- `test`: para declarar cada test
- `expect`: para hacer las verificaciones

Este import va SIEMPRE al principio de cada archivo `.spec.js`.

### Línea 3: la declaración del test

```javascript
test('has title', async ({ page }) => {
```

Desarmemos esto:

- **`test('has title', ...)`**: declaramos un test que se llama "has title" (tiene título). Ese nombre va a aparecer en los reportes.
- **`async`**: obligatorio porque adentro vamos a usar `await`.
- **`({ page })`**: pedimos que Playwright nos prepare el fixture `page` (una pestaña del navegador). Como aprendiste en el archivo de estructura, esto es "destructuring".
- **`=> {`**: sintaxis de arrow function, abre el cuerpo del test.

### Línea 4: la navegación

```javascript
await page.goto('https://playwright.dev/');
```

- **`await`**: esperamos que la navegación termine antes de seguir. Sin esto, la siguiente línea se ejecutaría antes de que la página cargue.
- **`page.goto(url)`**: navegamos a la URL indicada.

En este caso, abrimos la web oficial de Playwright.

### Línea 6: comentario

```javascript
// Expect a title "to contain" a substring.
```

Un comentario en el código. No se ejecuta. Sirve para explicar qué hace la línea de abajo.

En JavaScript (y TypeScript) los comentarios empiezan con `//` (para una sola línea) o van entre `/* */` (para varias líneas).

### Línea 7: la assertion

```javascript
await expect(page).toHaveTitle(/Playwright/);
```

Desarmemos:

- **`await`**: esperamos el resultado de la assertion (recordá que las web-first assertions reintentan hasta cumplirse o hasta el timeout).
- **`expect(page)`**: verificamos algo sobre el objeto `page`.
- **`.toHaveTitle(...)`**: la condición: "que el título sea...".
- **`/Playwright/`**: una expresión regular. Significa "que contenga la palabra Playwright en cualquier parte".

**¿Por qué una regex y no un string exacto?** Porque el título completo de la página es "Fast and reliable end-to-end testing for modern web apps | Playwright". Si compararamos con el string exacto y el equipo de Playwright agrega una palabra al título, el test se rompería. Con la regex, mientras el título contenga "Playwright", el test pasa.

### Línea 8: cierre

```javascript
});
```

- El `}` cierra el cuerpo de la función.
- El `)` cierra la llamada a `test(...)`.
- El `;` termina la sentencia.

### Traducción del test 1 a lenguaje natural

"Cuando entro a playwright.dev, el título de la pestaña debe contener la palabra 'Playwright'."

## Test 2: `get started link`

### Líneas 10 y 11: declaración y navegación

```javascript
test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');
```

Igual que el test 1: declaramos un nuevo test llamado "get started link", pedimos el fixture `page`, y navegamos a la web de Playwright.

Notá que este test empieza desde cero con una pestaña limpia. **No hereda nada del test anterior**. Cada test es independiente.

### Líneas 13 y 14: la acción

```javascript
  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();
```

Desarmemos la línea del click:

- **`page.getByRole('link', { name: 'Get started' })`**: creamos un locator. Buscamos un elemento que:
  - Tiene rol de "link" (o sea, es un `<a>` en HTML)
  - Su texto accesible es "Get started"

  Este es el locator preferido de Playwright: busca por rol semántico y por texto visible al usuario.

- **`.click()`**: hacemos click sobre ese elemento.
- **`await`**: esperamos que el click y sus efectos (probablemente una navegación) terminen antes de seguir.

Después de este click, la página cambia: nos lleva a la sección de instalación.

### Líneas 16 y 17: la verificación

```javascript
  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
```

Desarmemos:

- **`page.getByRole('heading', { name: 'Installation' })`**: buscamos un elemento de tipo "heading" (o sea, un `<h1>`, `<h2>`, `<h3>`, etc.) cuyo texto sea "Installation".
- **`expect(...).toBeVisible()`**: verificamos que ese heading esté visible.
- **`await`**: web-first assertion, reintenta hasta que se cumple o se llega al timeout.

**¿Por qué esta assertion es una buena forma de verificar el click?**

Porque hace lo mismo que vos me dijiste en la conversación anterior sobre el test de login: **el hecho de que aparezca "Installation" como heading significa que el click nos llevó a la página correcta**. No verificamos el click en sí (que sería inútil), verificamos su consecuencia observable.

### Línea 18: cierre

```javascript
});
```

Cierra el segundo test.

### Traducción del test 2 a lenguaje natural

"Cuando entro a playwright.dev y hago click en el link 'Get started', debe aparecer un título 'Installation' en la nueva página."

## Todo junto: el patrón AAA

Los dos tests siguen el patrón **Arrange, Act, Assert** (preparar, actuar, verificar).

### Test 1

- **Arrange**: nada especial, solo navegar
- **Act**: `page.goto(...)` (la navegación es la acción)
- **Assert**: `expect(page).toHaveTitle(...)`

### Test 2

- **Arrange**: `page.goto(...)` (llegar al punto de partida)
- **Act**: hacer click en "Get started"
- **Assert**: verificar que aparezca "Installation"

Este patrón lo vas a ver en TODOS los tests, en cualquier framework, en cualquier lenguaje. Es universal.

## Cómo se ve todo esto al ejecutarse

Cuando corriste `npx playwright test`, Playwright:

1. Encontró el archivo `example.spec.js` en la carpeta `tests/`
2. Identificó los dos tests adentro
3. Los ejecutó en Chromium, Firefox y WebKit (2 tests × 3 navegadores = 6 ejecuciones)
4. Corrió varias en paralelo (para acelerar)
5. Reportó "6 passed" al final

Y todo eso con estos ~18 líneas de código.

## Ejercicio: modificar el test

Ahora que entendés cada línea, probemos modificarlo. Reemplazá el contenido de `example.spec.js` con esto:

```javascript
const { test, expect } = require('@playwright/test');

test('la página tiene el logo de Playwright', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Verificamos que exista una imagen con el alt "Playwright logo"
  await expect(page.getByRole('img', { name: 'Playwright logo' })).toBeVisible();
});

test('el link a la documentación existe', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Verificamos que exista un link llamado "Docs"
  const linkDocs = page.getByRole('link', { name: 'Docs' }).first();
  await expect(linkDocs).toBeVisible();
});

test('al hacer click en "Docs" cambia la URL', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  await page.getByRole('link', { name: 'Docs' }).first().click();

  // Verificamos que la URL contenga "/docs"
  await expect(page).toHaveURL(/\/docs/);
});
```

Ejecutá:

```bash
npx playwright test
```

Si todo está bien, deberías ver 9 tests pasando (3 tests × 3 navegadores).

## Ejercicio bonus: hacé fallar un test a propósito

Modificá una assertion para que falle. Por ejemplo, cambiá:

```javascript
await expect(page).toHaveTitle(/Playwright/);
```

Por:

```javascript
await expect(page).toHaveTitle(/EstoNoExiste/);
```

Corré el test y observá cómo Playwright:

- Marca el test como "failed"
- Muestra qué esperaba y qué encontró en realidad
- Sugiere abrir el trace viewer para debuggear

Volvé a poner el título correcto y verificá que vuelva a pasar.

## Resumen del módulo

En este módulo aprendiste:

- **async/await**: por qué está en todas las líneas y qué pasa si te lo olvidás
- **Estructura de un test**: `test('nombre', async ({ page }) => { ... })` y qué es cada parte
- **Locators**: cómo encontrar elementos como los describiría un usuario (`getByRole` es el rey)
- **Assertions**: cómo verificar comportamiento con `expect(...)`, con auto-retry por default
- **Patrón AAA**: Arrange, Act, Assert, la estructura universal de los tests

Con esto podés leer cualquier test de Playwright y entender qué hace. En el siguiente módulo vamos a aprender a **grabar tests automáticamente** con el codegen, para que no tengas que escribir todo a mano.