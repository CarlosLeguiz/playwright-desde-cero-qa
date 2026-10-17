# 11. Loops en Playwright

## Para que sirven

Para repetir una accion sobre varios elementos sin escribir el mismo codigo N veces. Tres casos tipicos en testing:

1. No sabes cuantos elementos hay (lista de productos, filas de tabla)
2. Necesitas repetir hasta que algo pase (navegar un calendario)
3. Queres correr el mismo test con datos distintos (data-driven)

---

## Los 3 tipos de loop que vas a usar

### for clasico: cuando necesitas el indice

```js
const productos = page.locator('.inventory_item');
const cantidad = await productos.count();

for (let i = 0; i < cantidad; i++) {
  const nombre = await productos.nth(i).locator('.inventory_item_name').textContent();
  console.log(`Producto ${i + 1}: ${nombre}`);
}
```

Clave: `count()` te dice cuantos hay, `nth(i)` agarra el que esta en la posicion i.

### for...of: cuando tenes un array de datos

```js
const usuarios = ['standard_user', 'problem_user', 'performance_glitch_user'];

for (const usuario of usuarios) {
  await page.getByPlaceholder('Username').fill(usuario);
  // ...
}
```

Mas limpio que el `for` clasico cuando no necesitas el indice.

### while: cuando no sabes cuantas vueltas vas a dar

```js
let mesActual = await page.locator('.ui-datepicker-month').textContent();
let intentos = 0;

while (mesActual !== 'December' && intentos < 12) {
  await page.getByRole('button', { name: 'Next' }).click();
  mesActual = await page.locator('.ui-datepicker-month').textContent();
  intentos++;
}
```

**Importante:** siempre agrega un limite de seguridad (`intentos < 12`). Sin eso, si algo falla el test queda colgado hasta el timeout.

---

## Caso 1: recorrer una lista de elementos

Verificar que todos los productos tienen precio:

```js
test('todos los productos tienen precio', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/inventory.html');

  const productos = page.locator('.inventory_item');
  const cantidad = await productos.count();

  expect(cantidad).toBeGreaterThan(0);

  for (let i = 0; i < cantidad; i++) {
    const precio = productos.nth(i).locator('.inventory_item_price');
    await expect(precio).toBeVisible();
  }
});
```

---

## Caso 2: filtrar por condicion

Encontrar todos los productos abajo de $16:

```js
test('productos economicos', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/inventory.html');

  const productos = page.locator('.inventory_item');
  const cantidad = await productos.count();
  const baratos = [];

  for (let i = 0; i < cantidad; i++) {
    const item = productos.nth(i);
    const textoPrecio = await item.locator('.inventory_item_price').textContent();
    const precio = parseFloat(textoPrecio.replace('$', ''));

    if (precio < 16) {
      const nombre = await item.locator('.inventory_item_name').textContent();
      baratos.push({ nombre, precio });
    }
  }

  console.log('Productos abajo de $16:', baratos);
  expect(baratos.length).toBeGreaterThan(0);
});
```

---

## Caso 3: data-driven testing (el mas util en el trabajo)

En vez de escribir 3 tests casi identicos, generas los tests desde un array:

```js
const casosDeLogin = [
  { usuario: 'standard_user', password: 'secret_sauce', exito: true },
  { usuario: 'locked_out_user', password: 'secret_sauce', exito: false },
  { usuario: 'standard_user', password: 'wrong_password', exito: false },
];

for (const caso of casosDeLogin) {
  test(`login con ${caso.usuario} / ${caso.password}`, async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.getByPlaceholder('Username').fill(caso.usuario);
    await page.getByPlaceholder('Password').fill(caso.password);
    await page.getByRole('button', { name: 'Login' }).click();

    if (caso.exito) {
      await expect(page).toHaveURL(/inventory/);
    } else {
      await expect(page.locator('[data-test="error"]')).toBeVisible();
    }
  });
}
```

**Resultado:** Playwright genera 3 tests separados, cada uno con su propio nombre en el reporte. Si manana agregas un cuarto caso al array, el test se crea solo.

**El loop va AFUERA del test**, no adentro. Asi se crean tests independientes. Si pones el loop adentro de un solo test, cuando falle uno de los casos se corta todo.

---

## Caso 4: leer datos de una tabla

Encontrar la fila con el valor mas alto:

```js
test('encontrar el producto mas caro', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/inventory.html');

  const productos = page.locator('.inventory_item');
  const cantidad = await productos.count();

  let maxPrecio = 0;
  let masCaro = '';

  for (let i = 0; i < cantidad; i++) {
    const item = productos.nth(i);
    const textoPrecio = await item.locator('.inventory_item_price').textContent();
    const precio = parseFloat(textoPrecio.replace('$', ''));

    if (precio > maxPrecio) {
      maxPrecio = precio;
      masCaro = await item.locator('.inventory_item_name').textContent();
    }
  }

  console.log(`Mas caro: ${masCaro} a $${maxPrecio}`);
  expect(masCaro).toBe('Sauce Labs Fleece Jacket');
});
```

---

## Atajo: allTextContents()

Si solo necesitas los textos, no hace falta loop:

```js
// Con loop (lento)
const nombres = [];
for (let i = 0; i < cantidad; i++) {
  nombres.push(await productos.nth(i).textContent());
}

// Sin loop (rapido)
const nombres = await page.locator('.inventory_item_name').allTextContents();
```

Metodos similares: `all()` (devuelve array de locators), `allInnerTexts()`.

---

## Errores comunes

### 1. Olvidar el await adentro del loop

```js
// MAL: no espera, el test sigue sin que termine la accion
for (let i = 0; i < 5; i++) {
  page.getByRole('button').nth(i).click();
}

// BIEN
for (let i = 0; i < 5; i++) {
  await page.getByRole('button').nth(i).click();
}
```

### 2. Usar forEach con async (no funciona)

```js
// MAL: forEach no espera los await adentro
productos.forEach(async (p) => {
  await p.click();
});

// BIEN: usa for...of
for (const p of await productos.all()) {
  await p.click();
}
```

### 3. while sin limite de seguridad

```js
// MAL: si nunca encuentra el mes, loop infinito
while (mes !== 'December') { ... }

// BIEN
let intentos = 0;
while (mes !== 'December' && intentos < 12) { ...; intentos++; }
```

### 4. Modificar el DOM mientras iteras

Si borras filas de una tabla dentro del loop, los indices se corren. Solucion: itera de atras para adelante.

```js
for (let i = cantidad - 1; i >= 0; i--) {
  await filas.nth(i).getByRole('button', { name: 'Remove' }).click();
}
```

---

## Resumen

| Situacion | Loop a usar |
|-----------|-------------|
| Recorrer elementos del DOM por indice | `for` clasico con `count()` y `nth(i)` |
| Recorrer un array de datos | `for...of` |
| Repetir hasta que pase algo | `while` con limite de seguridad |
| Generar varios tests con datos distintos | `for...of` con el `test()` adentro |
| Solo necesitas los textos | `allTextContents()`, sin loop |