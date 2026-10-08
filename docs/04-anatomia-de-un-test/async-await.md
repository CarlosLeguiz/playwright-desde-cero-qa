# Async/await: por qué está en todos lados

Si abrís cualquier test de Playwright, vas a ver las palabras `async` y `await` en casi todas las líneas. No son decoración: son fundamentales para que Playwright funcione. Este archivo explica por qué.

## El problema que resuelven

Imaginá que en tu vida real hacés estas 3 tareas:

1. Poner agua a hervir (5 minutos)
2. Hacer una llamada telefónica (10 minutos)
3. Contestar un mail (2 minutos)

Si las hacés una detrás de otra (síncrono):
- Tiempo total: 5 + 10 + 2 = 17 minutos

Pero si mientras hierve el agua hacés la llamada y contestás el mail (asíncrono):
- Tiempo total: 10 minutos (el más largo)

Programar de forma asíncrona es exactamente eso: mientras esperás que algo termine, podés hacer otras cosas.

## ¿Por qué le importa a Playwright?

En un test, muchas acciones tardan tiempo:

- Cargar una página web (500 ms a varios segundos)
- Esperar que aparezca un elemento
- Hacer un click y esperar la reacción
- Escribir texto letra por letra
- Recibir respuesta de una API

Si Playwright hiciera todo síncrono, el navegador se congelaría mientras espera. En vez de eso, cada acción devuelve una **Promise** (promesa): un objeto que dice "voy a terminar en algún momento, avisá cuando quieras el resultado".

## ¿Qué es una Promise?

Una Promise es un objeto de JavaScript que representa una operación que aún no terminó. Puede estar en 3 estados:

1. **Pending** (pendiente): todavía trabajando
2. **Fulfilled** (cumplida): terminó bien
3. **Rejected** (rechazada): terminó con error

Cuando escribís:

```javascript
page.goto('https://playwright.dev/');
```

Esto NO navega inmediatamente. Devuelve una Promise que dice "voy a navegar, cuando termine te aviso".

## Acá entra `await`

`await` significa literalmente "esperá". Le dice a JavaScript: "no pases a la línea siguiente hasta que esta Promise termine".

```javascript
await page.goto('https://playwright.dev/');
// La línea de abajo NO se ejecuta hasta que la página cargue
await page.getByRole('button').click();
```

Sin `await`, JavaScript pasaría a la línea siguiente sin esperar, y todo explotaría (el navegador estaría todavía cargando cuando ya le pediste hacer click).

## Y ahora `async`

Para poder usar `await` dentro de una función, esa función tiene que estar marcada como `async`. Es la contraparte obligatoria.

```javascript
// ❌ Esto NO funciona
function miTest() {
  await page.goto('...'); // Error: await solo funciona en funciones async
}

// ✅ Esto SÍ funciona
async function miTest() {
  await page.goto('...'); // OK
}
```

En los tests de Playwright vas a ver siempre esta estructura:

```javascript
test('nombre del test', async ({ page }) => {
  //                    ^^^^^ obligatorio si vas a usar await adentro
  await page.goto('...');
  await page.getByRole('button').click();
});
```

## Regla práctica

**Cualquier línea que empiece con `page.` o `expect(...)` casi siempre lleva `await` adelante.**

Ejemplos:

```javascript
await page.goto('https://ejemplo.com');
await page.getByRole('link', { name: 'Login' }).click();
await page.getByLabel('Usuario').fill('carlos');
await expect(page).toHaveTitle('Mi App');
await expect(page.getByText('Bienvenido')).toBeVisible();
```

## Qué pasa si te olvidás un `await`

Es el error más común cuando arrancás. El código no falla explícitamente, pero pasa una de estas cosas:

1. **El test pasa cuando no debería**: como no esperaste, la assertion se hace antes de que el elemento aparezca, y falla o pasa por casualidad
2. **El test se comporta raro**: acciones que salen fuera de orden
3. **Warnings en la consola**: tu editor te avisa que estás ignorando una Promise (más obvio en TypeScript, pero también visible en JavaScript con `// @ts-check`)

Ejemplo real de bug típico:

```javascript
// ❌ Bug sutil: falta el await
test('login', async ({ page }) => {
  await page.goto('https://miapp.com');
  page.getByLabel('Email').fill('carlos@test.com'); // Falta await
  await page.getByRole('button', { name: 'Ingresar' }).click();
  // A veces pasa, a veces falla, porque el .fill() no terminó cuando se hizo el click
});
```

**Regla de oro:** si tu editor (VS Code con la extensión de Playwright) te subraya algo, prestale atención. Suele ser un `await` faltante.

## `await` no es magia lenta

Un error común es pensar que `await` "hace lento" el test. No es así. `await` espera EXACTAMENTE lo necesario, ni un milisegundo más. Si la página carga en 300 ms, `await` sigue en 300 ms.

Lo que hace `await` es garantizar que el orden esté bien.

## Resumen

- Todo en Playwright es asíncrono porque las acciones del navegador tardan
- Cada acción devuelve una **Promise**
- `await` significa "esperá a que esta Promise termine antes de seguir"
- Para usar `await`, la función debe estar marcada como `async`
- Regla práctica: si empieza con `page.` o `expect(...)`, va con `await`
- Olvidarse un `await` es el bug más común, siempre revisá si tu test falla raro

## Analogía final

Imaginate que estás dando una orden a un mozo en un restaurante:

- **Sin `await`**: le dirías "un café", das media vuelta y te vas, sin esperar respuesta. No sabés si te va a traer el café o no.
- **Con `await`**: le pedís el café y esperás ahí hasta que llegue. Recién cuando el café está en tu mesa, seguís con lo próximo.

Eso es `await`: garantiza que la acción realmente terminó antes de pasar a la siguiente.