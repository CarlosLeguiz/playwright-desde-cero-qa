# Assertions: verificar que las cosas pasan

Un test sin assertions no es un test. Es un script que hace clicks y no verifica nada. Las assertions son las que le dan valor a la automatización: son las que dicen "esto tiene que estar así, si no está así, el test falla".

## ¿Qué es una assertion?

Una assertion (afirmación, en español) es una verificación de que algo cumple una condición esperada. En Playwright se hacen con la función `expect`.

Estructura básica:

```javascript
await expect(algo).condicion();
```

Se lee como una oración en inglés: "espero que [algo] cumpla [condición]".

Ejemplo:

```javascript
await expect(page.getByText('Bienvenido')).toBeVisible();
// Traducido: "espero que el texto 'Bienvenido' sea visible"
```

Si la condición se cumple, el test sigue. Si no se cumple, el test falla con un mensaje descriptivo.

## Los dos tipos de assertions

En Playwright hay dos categorías:

### 1. Assertions sobre la página (o elementos)

Se usan con `await` y reintentan automáticamente hasta que se cumplen o se llega al timeout.

```javascript
await expect(page).toHaveTitle('Mi App');
await expect(page.getByText('Cargando')).toBeHidden();
```

### 2. Assertions sobre valores estáticos

Se usan SIN `await` y NO reintentan. Verifican valores comunes de JavaScript.

```javascript
expect(2 + 2).toBe(4);
expect(['a', 'b', 'c']).toContain('b');
```

**La regla:** si estás verificando algo del navegador (elementos, URL, título), usá `await`. Si verificás un valor común de JavaScript, no.

## Web-first assertions: la magia del auto-retry

Esta es una de las features más importantes de Playwright.

Cuando escribís:

```javascript
await expect(page.getByText('Pedido confirmado')).toBeVisible();
```

Playwright NO falla inmediatamente si el texto no está. En vez de eso:

1. Busca el elemento
2. Si no está, espera un poquito
3. Vuelve a buscar
4. Si no está, espera un poquito más
5. Repite hasta 5 segundos por default

Recién si después de 5 segundos el elemento no apareció, falla el test.

**¿Por qué es importante?** Porque muchas cosas en una web moderna son asíncronas:

- Un mensaje de éxito que aparece después de una llamada al backend
- Un producto que se agrega al carrito con una animación
- Una respuesta de IA que tarda varios segundos en aparecer

Con web-first assertions no necesitás poner `sleep(3)` ni `waitForElement()`. Playwright espera lo justo, ni más ni menos.

## Assertions más comunes sobre elementos

### `toBeVisible` / `toBeHidden`

```javascript
await expect(page.getByText('Bienvenido')).toBeVisible();
await expect(page.getByText('Cargando...')).toBeHidden();
```

### `toHaveText`

Verifica que el elemento tenga un texto exacto.

```javascript
await expect(page.getByRole('heading')).toHaveText('Panel de control');
```

### `toContainText`

Verifica que el elemento contenga un texto (más flexible que `toHaveText`).

```javascript
await expect(page.getByRole('alert')).toContainText('error');
```

### `toBeEnabled` / `toBeDisabled`

Verifica el estado de un botón o input.

```javascript
await expect(page.getByRole('button', { name: 'Enviar' })).toBeEnabled();
await expect(page.getByRole('button', { name: 'Enviar' })).toBeDisabled();
```

### `toBeChecked`

Verifica un checkbox o radio.

```javascript
await expect(page.getByLabel('Acepto los términos')).toBeChecked();
```

### `toHaveValue`

Verifica el valor de un input.

```javascript
await expect(page.getByLabel('Email')).toHaveValue('carlos@test.com');
```

### `toHaveCount`

Verifica cuántos elementos hay que matcheen el locator.

```javascript
await expect(page.getByRole('listitem')).toHaveCount(5);
```

Útil para verificar que se muestran N resultados de una búsqueda, N items en un carrito, etc.

### `toHaveAttribute`

Verifica un atributo HTML de un elemento.

```javascript
await expect(page.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
```

## Assertions sobre la página

### `toHaveTitle`

Verifica el título de la página (lo que aparece en la pestaña del navegador).

```javascript
await expect(page).toHaveTitle('Mi App - Inicio');
```

Podés usar expresiones regulares para que sea más flexible:

```javascript
await expect(page).toHaveTitle(/Mi App/);
// Pasa si el título contiene "Mi App" en cualquier parte
```

### `toHaveURL`

Verifica la URL actual.

```javascript
await expect(page).toHaveURL('https://miapp.com/dashboard');
await expect(page).toHaveURL(/\/dashboard/); // regex, más flexible
```

Muy útil para verificar redirects.

## Assertions negativas con `.not`

Cualquier assertion se puede invertir con `.not`.

```javascript
// El elemento NO debe ser visible
await expect(page.getByText('Cargando')).not.toBeVisible();

// El botón NO debe estar deshabilitado
await expect(page.getByRole('button', { name: 'Enviar' })).not.toBeDisabled();

// La URL NO debe contener /error
await expect(page).not.toHaveURL(/\/error/);
```

## Cambiar el timeout de una assertion

Por default, las web-first assertions esperan hasta 5 segundos. Podés modificarlo para casos especiales:

```javascript
// Esperar hasta 30 segundos (útil para respuestas de IA que tardan)
await expect(page.getByText('Análisis completo')).toBeVisible({ timeout: 30000 });
```

El timeout se pasa en milisegundos: 30000 = 30 segundos.

## Un test completo con varias assertions

```javascript
const { test, expect } = require('@playwright/test');

test('el usuario puede completar la compra', async ({ page }) => {
  // Preparar
  await page.goto('https://tienda-demo.com');

  // Verificar estado inicial
  await expect(page).toHaveTitle(/Tienda Demo/);
  await expect(page.getByRole('link', { name: 'Carrito (0)' })).toBeVisible();

  // Agregar producto
  await page.getByRole('button', { name: 'Agregar al carrito' }).first().click();
  await expect(page.getByRole('link', { name: 'Carrito (1)' })).toBeVisible();

  // Ir al carrito y verificar
  await page.getByRole('link', { name: 'Carrito (1)' }).click();
  await expect(page).toHaveURL(/\/cart/);
  await expect(page.getByRole('listitem')).toHaveCount(1);

  // Checkout
  await page.getByRole('button', { name: 'Finalizar compra' }).click();
  await expect(page.getByText('Pedido confirmado')).toBeVisible();
  await expect(page.getByText(/Nro de orden: \d+/)).toBeVisible();
});
```

Notá cómo las assertions están distribuidas a lo largo del test. Cada una verifica un paso intermedio, no solo el resultado final. Esto se llama **checkpoints** y es una buena práctica: si algo falla en el medio, el mensaje de error te dice exactamente en qué paso pasó.

## Assertions sobre valores comunes (sin await)

Cuando verificás valores que NO vienen del navegador, no lleva `await`:

```javascript
// Comparaciones simples
expect(2 + 2).toBe(4);
expect('hola').toBe('hola');

// Verificar que algo NO es null o undefined
expect(usuario).not.toBeNull();

// Verificar que una lista contiene algo
expect(['manzana', 'pera', 'banana']).toContain('pera');

// Verificar el tamaño de una lista
expect(carrito.items).toHaveLength(3);

// Verificar objetos parciales
expect(usuario).toMatchObject({ nombre: 'Carlos', ciudad: 'Córdoba' });
```

## Mensajes personalizados

Podés agregar un mensaje que aparezca cuando la assertion falle. Ayuda a debuggear más rápido.

```javascript
await expect(page.getByText('Bienvenido'), 'El mensaje de bienvenida debería aparecer después del login').toBeVisible();
```

Si falla, el mensaje aparece en el reporte y en la salida de la terminal.

## Soft assertions

Por default, cuando una assertion falla, el test se detiene inmediatamente. Con "soft assertions" el test continúa y acumula todos los errores para reportarlos al final.

```javascript
await expect.soft(page.getByText('Título 1')).toBeVisible();
await expect.soft(page.getByText('Título 2')).toBeVisible();
await expect.soft(page.getByText('Título 3')).toBeVisible();
// Si los tres fallan, el test reporta los tres errores al final
```

Útil cuando querés verificar muchas cosas independientes en un test.

## Buenas prácticas

**1. Verificá el estado esperado, no la ausencia de errores.**

En vez de:
```javascript
// ❌ ambiguo
await expect(page.getByText('Error')).not.toBeVisible();
```

Preferí:
```javascript
// ✅ claro
await expect(page.getByText('Pedido confirmado')).toBeVisible();
```

**2. Un test debe tener al menos una assertion.**

Si no verifica nada, no es un test. Es un script.

**3. Las assertions deben verificar el comportamiento, no la implementación.**

Verificá lo que ve el usuario, no detalles técnicos como IDs internos o clases CSS.

**4. Distribuí assertions a lo largo del test.**

Assertions intermedias ayudan a identificar dónde falla exactamente.

**5. Los mensajes de error deben ser claros.**

Cuando alguien vea el reporte tres semanas después, debe entender qué se estaba verificando.

## Resumen

- Las assertions se hacen con `expect(...)`
- Sobre elementos del navegador: usan `await` y reintentan automáticamente
- Sobre valores comunes de JS: no usan `await`
- Web-first assertions esperan hasta 5 segundos por default (se puede modificar)
- Las más comunes: `toBeVisible`, `toHaveText`, `toContainText`, `toBeEnabled`, `toHaveCount`, `toHaveURL`, `toHaveTitle`
- Con `.not` invertís cualquier assertion
- Distribuí assertions a lo largo del test para identificar puntos de fallo

## Analogía final

Las assertions son como los checkpoints de un GPS. No solo te llevan al destino, te van confirmando en el camino:

- "Pasaste la primera rotonda" ✅
- "Doblaste a la izquierda correctamente" ✅
- "Estás a 200 metros del destino" ✅
- "Llegaste" ✅

Si algo sale mal, sabés exactamente en qué paso. Un test sin assertions es como un GPS que solo te dice "empezaste a manejar", pero no te avisa nunca más si vas bien o mal.