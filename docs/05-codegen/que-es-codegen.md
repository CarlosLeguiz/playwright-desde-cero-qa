# ¿Qué es Codegen?

Codegen es una herramienta incluida en Playwright que **genera código de test automáticamente** mientras vos navegás e interactuás con una página web.

Dicho de otra forma: hacés clicks, llenás formularios y navegás como un usuario normal, y Playwright va escribiendo el código del test en paralelo. Al final tenés un test funcional sin haber escrito una sola línea a mano.

## El comando

Se ejecuta así:

```bash
npx playwright codegen https://sitio-a-testear.com
```

También podés ejecutarlo sin URL (abre el navegador en blanco):

```bash
npx playwright codegen
```

Al correrlo se abren **dos ventanas**:

1. **Un navegador Chromium** controlado por Playwright, con la URL indicada
2. **El Playwright Inspector**, una ventana aparte que muestra el código generado

A medida que hacés clicks, escribís o navegás en el navegador, el Inspector va escribiendo el código del test en tiempo real.

## ¿Cómo funciona por dentro?

Codegen hace tres cosas en paralelo:

### 1. Observa tus acciones

Captura todo lo que hacés: clicks, teclas presionadas, formularios llenados, scrolls, navegaciones.

### 2. Elige el mejor locator automáticamente

Esto es lo más impresionante. Para cada elemento con el que interactuás, Codegen analiza el DOM y elige el locator más estable usando el mismo orden de preferencia que vos ya aprendiste:

1. `getByRole` (preferido)
2. `getByLabel`
3. `getByText`
4. `getByPlaceholder`
5. `getByTestId`
6. CSS/XPath (último recurso)

Si un botón se puede ubicar por su rol y texto, Codegen va a usar `getByRole('button', { name: '...' })`, no una clase CSS random. Si un input tiene un `<label>`, va a usar `getByLabel`.

### 3. Escribe código válido de Playwright

El código generado:

- Incluye el require correcto
- Usa `async/await` en cada acción
- Tiene la estructura `test('nombre', async ({ page }) => { ... })`
- Es ejecutable tal cual se copie

## Un ejemplo real

Si vos:

1. Abrís playwright.dev
2. Hacés click en "Get started"
3. Hacés click en "Writing tests"

Codegen genera algo como:

```javascript
const { test, expect } = require('@playwright/test');

test('test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await page.getByRole('link', { name: 'Get started' }).click();
  await page.getByRole('link', { name: 'Writing tests' }).click();
});
```

Fijate que:

- Agregó el require automáticamente
- Usó `getByRole` para los dos links, con el texto correcto
- Puso `await` en cada acción
- La estructura `test(...)` ya está lista

Lo único que falta: un buen nombre de test y assertions. Eso lo agregás vos (el próximo archivo del módulo lo cubre).

## Features importantes del Inspector

El Playwright Inspector (la ventana aparte) tiene varios botones y opciones útiles:

### Botón "Record"

Prende/apaga la grabación. Si lo apagás, podés navegar sin que se registre el código (útil para explorar la página sin generar basura).

### Botón "Pick locator"

Click sobre cualquier elemento del navegador y te muestra el locator exacto que Playwright elegiría. **MUY útil cuando estás escribiendo un test a mano y no sabés qué locator usar.**

### Botón "Assert visibility"

Después de clickearlo, hacé click sobre un elemento del navegador y genera automáticamente:

```javascript
await expect(page.getByText('...')).toBeVisible();
```

### Botón "Assert text"

Similar: genera un `expect(...).toHaveText(...)` sobre el elemento que selecciones.

### Botón "Assert value"

Para inputs: genera `expect(...).toHaveValue(...)`.

### Selector de lenguaje

Por default genera JavaScript. Podés cambiarlo a TypeScript, Python, Java o C# desde el dropdown. El código generado se adapta al lenguaje elegido.

### Botón "Copy"

Copia todo el código generado al portapapeles para pegarlo en tu archivo de test.

## Opciones útiles del comando

### Elegir dispositivo (emular mobile)

```bash
npx playwright codegen --device="iPhone 15" https://playwright.dev
```

El navegador se abre con la pantalla de un iPhone 15 y el user agent correspondiente.

### Elegir navegador

```bash
npx playwright codegen --browser=firefox https://playwright.dev
npx playwright codegen --browser=webkit https://playwright.dev
```

Útil para grabar tests pensados en un navegador específico.

### Guardar directo a un archivo

```bash
npx playwright codegen --output=tests/mi-test.spec.js https://playwright.dev
```

El código generado se escribe directamente en el archivo indicado.

### Grabar con credenciales guardadas (storage state)

```bash
npx playwright codegen --load-storage=auth.json https://miapp.com
```

Si ya tenés una sesión guardada en `auth.json`, el navegador se abre ya logueado. Útil para no tener que loguearte a mano cada vez que grabás un test.

## Cuándo conviene usar Codegen

### Casos donde Codegen brilla

- **Estás arrancando y querés aprender cómo se ve un test real** mirando lo que genera un experto
- **No sabés qué locator usar** para un elemento específico (usá "Pick locator")
- **Querés armar rápido un primer esqueleto** de un flujo complejo (login, checkout, etc.)
- **Estás explorando una página nueva** y querés documentar un flujo para después escribir tests
- **Trabajás con un formulario largo** y escribir cada campo a mano es tedioso

### Casos donde Codegen NO es ideal

- **Para tests productivos sin revisar**: nunca uses el código tal cual sin ajustarlo
- **Para flujos con lógica compleja** (loops, condiciones, data-driven): hay que escribir a mano
- **Para tests con mocks de red o fixtures custom**: Codegen no sabe generar eso
- **Para refactorizar un test existente**: Codegen no entiende tu código actual

## Codegen no es magia

Es importante que entiendas esto: **Codegen no "piensa" como QA**. Hace lo que le pedís sin discernir:

- No decide qué assertion tiene sentido verificar
- No sabe que ciertas partes del test son flaky
- No agrupa tests relacionados en `describe`
- No reutiliza código (Page Object Model lo tenés que armar vos)
- No distingue entre tests críticos y nice-to-have

Es un **asistente** que te ahorra tiempo en la parte mecánica (escribir locators, agregar awaits), pero el diseño del test sigue siendo tu trabajo.

## Analogía

Codegen es como la cámara de un auto para estacionar en reversa. Te ayuda muchísimo a ver qué pasa atrás, te muestra las líneas guía, te avisa si estás cerca de algo. Pero vos seguís siendo el que decide dónde estacionar, cómo girar el volante, y cuándo frenar.

Un conductor novato que mira solo la cámara va a chocar. Un conductor experto que la ignora va a estacionar más lento. Lo mismo con Codegen: usalo como herramienta, no como piloto automático.

## Resumen

- Codegen genera código de test grabando lo que hacés en un navegador
- Usa los mismos locators preferidos que vos aprendiste a usar manualmente
- Se abre con `npx playwright codegen URL`
- Tiene botones para generar assertions automáticamente
- Puede emular dispositivos y navegadores específicos
- Es útil para arrancar rápido, descubrir locators y aprender
- NO reemplaza al criterio de un QA: el código generado siempre necesita revisión