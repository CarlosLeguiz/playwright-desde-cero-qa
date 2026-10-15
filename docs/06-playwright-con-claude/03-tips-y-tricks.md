# 03. Tips y Tricks: cómo evitar los 3 errores clásicos

Después de usar Claude Code un rato, vas a chocarte con los mismos problemas una y otra vez. Este archivo cubre los 3 errores más comunes y 6 hábitos para que Claude te dé mejores locators siempre.

Basado en la Lecture 3.4 del PPTX.

## Error 1: Strict mode violation

Es EL error que todos los que arrancan con Playwright ven en algún momento.

**Qué dice:**

```
Error: locator.click: Error: strict mode violation:
getByRole('button', { name: 'Add to cart' }) resolved to 6 elements:
    1) <button id="add-to-cart-sauce-labs-backpack" ...>Add to cart</button>
    2) <button id="add-to-cart-sauce-labs-bike-light" ...>Add to cart</button>
    3) <button id="add-to-cart-sauce-labs-bolt-t-shirt" ...>Add to cart</button>
    ...
```

**Qué significa:** tu locator matchea más de un elemento. Playwright se niega a adivinar cuál querías. Es una feature, no un bug: te está protegiendo de un test que silenciosamente clickea el botón equivocado.

**Cómo lo arreglás:**

NO uses `.first()` o `.nth(0)` como primera opción. Esos locators se rompen apenas el orden de los elementos cambie (por ejemplo, cuando un usuario ordena los productos).

En vez de eso, **copiá el error completo y pegáselo a Claude Code**. Pedile un locator más específico. Ejemplo:

```
Este locator fallo en saucedemo.com/inventory.html:
page.getByRole('button', { name: 'Add to cart' })

Necesito el boton "Add to cart" especifico de "Sauce Labs Bike Light".
Dame un locator que apunte dentro de la card de ese producto, NO con .nth(1), 
porque el orden cambia cuando el usuario ordena los productos.
```

Lo que Claude debería devolverte:

```typescript
// Encontrar la card por el nombre del producto, despues el boton adentro
const bikeLightCard = page.locator('.inventory_item')
                          .filter({ hasText: 'Sauce Labs Bike Light' });
await bikeLightCard.getByRole('button', { name: 'Add to cart' }).click();
```

Esto es "parent-child chaining": encontrás el padre (la card del producto) por algo único (su nombre), después buscás el hijo (el botón) adentro.

## Error 2: Claude inventa atributos que no existen

A veces Claude te sugiere locators con atributos que SUENAN razonables pero no están en el HTML real. Ejemplo:

```typescript
// Claude te sugiere:
await page.locator('[data-cy="login-button"]').click();

// Pero el HTML real NO tiene data-cy en ningun lado:
<button class="radius" type="submit">Login</button>
```

Este es el bug más peligroso: el test parece válido, pero timeoutea porque el locator nunca matchea nada.

**Cómo evitarlo:** la última línea del master prompt dice "Solo usá atributos que existan en el HTML que te pasé". Si Claude igual inventa algo, pegale el HTML de nuevo y recordá la regla.

También: **pegá siempre el HTML del elemento Y de su padre**, no solo del tag solo. Más contexto, menos invención.

## Error 3: Locators sin contexto (muy ambiguos)

```typescript
// Esto puede fallar silenciosamente si hay varios "Save" en la pagina
await page.getByText('Save').click();
```

En apps reales hay muchos "Save" (uno por sección, uno en el modal, uno en la toolbar). `getByText` sin más contexto es frágil.

**Fix:** usá `exact: true` cuando los nombres se parezcan:

```typescript
await page.getByRole('button', { name: 'Save', exact: true }).click();
```

Y si varios botones tienen EXACTAMENTE "Save", scopealo a un contenedor:

```typescript
await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
```

## Los 6 hábitos que mejoran los locators de Claude

Poné estos hábitos en práctica cada vez que uses Claude Code para generar locators:

### 1. Pegá el bloque padre, no un tag solo

Mal: `<button>Login</button>`
Bien: `<form id="login">...<button>Login</button>...</form>`

Más contexto = Claude entiende mejor dónde está el elemento.

### 2. Pegá el error COMPLETO cuando algo falle

Incluí cada elemento que Playwright listó en el strict mode violation, no solo "falló". Claude necesita ver qué otros matches existen para encontrarte uno único.

### 3. Decile explícitamente "solo atributos de mi HTML"

Esto está en el master prompt. Si Claude igual inventa un `data-cy` o un `data-testid` que no existe, recordale la regla.

### 4. Pedí `exact: true` cuando los nombres se superpongan

Si tenés "Save" y "Save draft" en la misma pantalla, pedí explícitamente que use `exact: true`. Si no, Playwright matchea "Save" dentro de "Save draft" y te matchea los dos.

### 5. Pedí una assertion con cada locator

No te conformes con "acá tenés el locator para hacer click". Pedí que después del click haga una assertion que confirme que el click funcionó (ej: `await expect(page).toHaveURL(...)` o `await expect(...).toBeVisible()`).

### 6. Prohibí `.first()` y `.nth()` para elementos que pueden moverse

Si el orden puede cambiar (listas que se ordenan, resultados de búsqueda), `.nth(0)` es una bomba de tiempo. Pedí locators que identifiquen el elemento por algo único de ÉL (su nombre, su data-testid), no por su posición.

## Un prompt mejorado que aplica los 6 hábitos

Guardá este prompt y usalo en vez del master prompt cuando necesites algo más estricto:

```
Sos un ingeniero senior de automation testing con Playwright.
Tarea: [lo que querés automatizar]

Reglas DURAS:
- Dame locators en TypeScript con prioridad: getByRole > getByLabel > getByPlaceholder > getByText > getByTestId > CSS > XPath
- NO uses .first(), .last() ni .nth() si el orden puede cambiar
- NO inventes atributos: solo los que existen en el HTML que te paso
- Usá exact: true si hay nombres que se parecen (ej: "Save" y "Save draft")
- Por cada locator: una línea con el motivo, un fallback alternativo, y una assertion que valide que la acción funcionó
- Si una assertion requiere web-first retry, usá expect(locator).toSomething(), nunca waitForTimeout

HTML:
[pegá el bloque padre acá]

Objetivo del test (en lenguaje natural):
[describí qué querés que haga]
```

## Reto

Abrí [saucedemo.com](https://www.saucedemo.com) (logueate como `standard_user`), inspeccioná la página de inventario, copiá el HTML de la card del "Sauce Labs Onesie" (incluyendo su padre), y pedile a Claude Code un locator para el precio de ESE producto específico. El precio real es `$7.99`.

Pedile:

```
Dame un locator en TypeScript para leer el precio del producto "Sauce Labs Onesie" 
en saucedemo.com/inventory.html. Agregá una assertion que verifique que el precio es "$7.99".

HTML del producto:
[pegá el HTML copiado]

Reglas: locator robusto que no dependa del orden en la pagina (puede cambiar con el sort).
```

## Siguiente

[04. Correr en navegadores](./04-navegadores.md): configurar Chromium, Firefox, WebKit, Chrome y Edge con la ayuda de Claude Code.