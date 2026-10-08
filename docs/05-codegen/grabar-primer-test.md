# Grabar tu primer test

En este archivo vamos a grabar un test funcional usando Codegen, paso a paso. Al final vas a tener un test real en tu carpeta `tests/` que escribiste SIN tipear código.

## Preparación

Antes de empezar, asegurate de que tu proyecto Playwright esté funcionando. Desde la raíz del proyecto:

```bash
npx playwright test
```

Si pasan los tests, estamos listos.

## Paso 1: Elegir qué grabar

Vamos a grabar un flujo simple en la web de Playwright:

1. Entrar a playwright.dev
2. Ir a la documentación (link "Docs")
3. Buscar el término "locators"
4. Hacer click en uno de los resultados

Pensá siempre el flujo antes de grabarlo. **Grabar sin tener claro qué querés testear produce tests desordenados.**

## Paso 2: Iniciar Codegen

En la terminal, ejecutá:

```bash
npx playwright codegen https://playwright.dev
```

Se abren dos ventanas:

1. **Un navegador Chromium** con la web de Playwright cargada
2. **El Playwright Inspector** al lado, con el código inicial ya generado

El código inicial que vas a ver es algo así:

```javascript
const { test, expect } = require('@playwright/test');

test('test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
});
```

Playwright ya puso el import, la estructura `test()` y la navegación inicial.

## Paso 3: Grabar las acciones

Ahora, en el navegador controlado por Playwright, hacé lo siguiente:

### Acción 1: Click en "Docs"

En la barra de navegación superior, click en el link que dice "Docs".

**Observá el Inspector:** se agregó una línea nueva al código:

```javascript
await page.getByRole('link', { name: 'Docs' }).first().click();
```

Fijate que:

- Usó `getByRole('link', ...)` porque "Docs" es un link
- Agregó `.first()` porque hay más de un elemento con ese nombre en la página
- Puso `await` adelante

Todo esto lo hizo solo, aplicando las buenas prácticas que vos ya aprendiste.

### Acción 2: Click en el campo de búsqueda

En la página de documentación, buscá el ícono o campo que dice "Search" (puede ser una lupa o un input).

**En el Inspector aparece algo como:**

```javascript
await page.getByRole('button', { name: 'Search' }).click();
```

### Acción 3: Escribir "locators" en el buscador

Una vez abierto el buscador, escribí la palabra `locators`.

**En el Inspector aparece:**

```javascript
await page.getByRole('searchbox', { name: 'Search' }).fill('locators');
```

Notá el uso de `.fill()`: es la forma recomendada de poner texto en un input.

### Acción 4: Hacer click en un resultado

Esperá que aparezcan los resultados y hacé click en uno (por ejemplo, el que dice "Locators | Playwright").

**En el Inspector aparece algo como:**

```javascript
await page.getByRole('link', { name: /Locators/ }).first().click();
```

## Paso 4: Agregar una assertion

Un test sin assertions no es un test. Vamos a agregar una.

En el Inspector hay un botón llamado **"Assert visibility"** (ícono de ojo). Hacé click en él y después hacé click sobre el título de la página que te muestra (por ejemplo, un heading que diga "Locators" o similar).

**En el Inspector aparece:**

```javascript
await expect(page.getByRole('heading', { name: 'Locators' })).toBeVisible();
```

Ahora sí, tu test tiene una verificación concreta: "la página debe mostrar un título Locators".

## Paso 5: Detener la grabación

En el Inspector, hacé click en el botón de grabación (el círculo rojo) para pausar la captura. Esto te deja listo el código final.

## Paso 6: Copiar y guardar el test

### Copiar el código del Inspector

En el Inspector hay un botón **"Copy"**. Hacelo click. El código completo del test se copia al portapapeles.

El código final debería verse parecido a esto:

```javascript
const { test, expect } = require('@playwright/test');

test('test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await page.getByRole('link', { name: 'Docs' }).first().click();
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('searchbox', { name: 'Search' }).fill('locators');
  await page.getByRole('link', { name: /Locators/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Locators' })).toBeVisible();
});
```

### Guardarlo en un archivo

En VS Code:

1. Click derecho sobre la carpeta `tests/`
2. "Nuevo archivo"
3. Nombralo `busqueda-docs.spec.js`
4. Pegá el código copiado
5. Guardá con Ctrl+S

### Cerrar las ventanas de Codegen

Cerrá el navegador Chromium y el Inspector. Ya tenés el test guardado.

## Paso 7: Darle un buen nombre al test

El nombre que generó Codegen es `'test'`, que no describe nada. Cambialo por algo descriptivo:

```javascript
test('busca y accede a la documentación de locators', async ({ page }) => {
```

**Buenos nombres describen el COMPORTAMIENTO esperado**, no la acción técnica. "Busca y accede a..." es mejor que "test" o que "test de búsqueda".

## Paso 8: Ejecutar el test

En la terminal:

```bash
npx playwright test busqueda-docs.spec.js
```

Deberías ver que corre y pasa:

```
Running 3 tests using 3 workers
  3 passed (XX.Xs)
```

3 tests porque corre en los tres navegadores (Chromium, Firefox, WebKit).

## Alternativa: guardar directo desde Codegen

Podés usar la opción `--output` para que Codegen guarde el test automáticamente en el archivo que indiques:

```bash
npx playwright codegen --output=tests/busqueda-docs.spec.js https://playwright.dev
```

Cuando cierres el Inspector, el archivo se guarda solo con el contenido grabado. Esta es la forma más rápida.

## Qué acabás de hacer

Sin tipear código, grabaste un test que:

1. Entra a una web
2. Navega a una sección
3. Busca algo
4. Hace click en el resultado
5. Verifica que la página correcta se cargó

Y todo esto con los locators correctos (`getByRole`, `getByLabel`, etc.), con `await` en cada acción, con el import correcto. **Lo mismo que escribiste a mano en el Módulo 4, pero generado automáticamente.**

## Limitaciones de lo que grabaste

El código generado funciona, pero NO está listo para producción. Le falta:

- Un nombre de test descriptivo (lo cambiamos en el paso 7)
- Assertions intermedias para validar pasos clave
- Comentarios explicando qué hace cada bloque
- Posible refactor si vamos a reutilizar partes del flujo

Todo eso lo cubrimos en el siguiente archivo: [ajustar-el-codigo-generado.md](./ajustar-el-codigo-generado.md).

## Ejercicio: grabá tu propio test

Elegí una web pública (tu banco, un e-commerce, tu red social) y grabá un flujo. Ideas:

- En Mercado Libre: buscar un producto y verificar que aparecen resultados
- En Wikipedia: buscar un artículo y verificar que carga
- En GitHub: ir a tu perfil y verificar que aparece tu nombre

**Tip:** si la web te pide login, podés loguearte DENTRO del navegador de Codegen. Las acciones de login también se graban.

## Resumen

- `npx playwright codegen URL` abre el navegador y el Inspector
- Las acciones que hacés en el navegador se traducen a código en tiempo real
- Codegen elige automáticamente los mejores locators
- El botón "Assert visibility" genera assertions con un click
- "Copy" copia el código, o usá `--output` para guardarlo directo
- Siempre revisá el código generado: cambiá el nombre, agregá assertions, limpiá lo innecesario