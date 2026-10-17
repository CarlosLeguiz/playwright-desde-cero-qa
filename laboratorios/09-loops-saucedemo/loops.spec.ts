/* PROMPT:Crea la carpeta laboratorios/09-loops-saucedemo/ y adentro el archivo loops.spec.ts

Genera 3 tests de Playwright en TypeScript sobre https://www.saucedemo.com

Login: standard_user / secret_sauce
El sitio usa data-test como atributo (testIdAttribute ya esta configurado)

TEST 1 - Recorrer todos los productos con for clasico:
- Login
- Contar cuantos productos hay con .inventory_item
- Recorrerlos con un for e imprimir nombre y precio de cada uno
- Verificar que cada producto tiene precio visible
- Verificar que hay exactamente 6 productos

TEST 2 - Filtrar por condicion:
- Login
- Recorrer todos los productos
- Guardar en un array los que cuestan menos de $16
- Imprimir el array con console.log
- Verificar que encontro al menos 2 productos

TEST 3 - Data-driven con varios usuarios:
- Fuera del test, define un array con estos casos:
  { usuario: 'standard_user', password: 'secret_sauce', exito: true }
  { usuario: 'locked_out_user', password: 'secret_sauce', exito: false }
  { usuario: 'standard_user', password: 'wrong_password', exito: false }
- Genera un test por cada caso usando for...of
- Si exito es true, verificar que la URL contiene inventory
- Si exito es false, verificar que aparece el mensaje de error

Reglas:
- El loop del test 3 va AFUERA del test(), para generar tests independientes
- Nada de waitForTimeout
- Comentarios en espanol explicando por que cada loop */

// Lab 09 - Loops en Playwright sobre saucedemo
// Correr: npx playwright test laboratorios/09-loops-saucedemo/loops.spec.ts

import { test, expect, Page } from '@playwright/test';

// testIdAttribute = 'data-test' ya esta en playwright.config, asi que
// getByTestId('username') busca [data-test="username"].
async function login(page: Page, usuario: string, password: string) {
  await page.goto('/');
  await page.getByTestId('username').fill(usuario);
  await page.getByTestId('password').fill(password);
  await page.getByTestId('login-button').click();
}

test.describe('Loops - saucedemo', () => {
  test('recorrer todos los productos con for clasico', async ({ page }) => {
    await login(page, 'standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory/);

    const productos = page.locator('.inventory_item');
    // Esperamos a que aparezca al menos uno antes de contar:
    // count() no espera, devuelve lo que haya en ese instante.
    await expect(productos.first()).toBeVisible();
    const total = await productos.count();

    // Usamos for clasico porque necesitamos el indice (i) para usar nth(i)
    // y para numerar lo que imprimimos.
    for (let i = 0; i < total; i++) {
      const producto = productos.nth(i);
      const nombre = await producto.getByTestId('inventory-item-name').textContent();
      const precio = producto.getByTestId('inventory-item-price');

      console.log(`${i + 1}. ${nombre} - ${await precio.textContent()}`);

      // Cada tarjeta tiene que mostrar su precio
      await expect(precio).toBeVisible();
    }

    // toHaveCount reintenta hasta que se cumpla (a diferencia de count())
    await expect(productos).toHaveCount(6);
  });

  test('filtrar productos que cuestan menos de $16', async ({ page }) => {
    await login(page, 'standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory/);

    const productos = page.locator('.inventory_item');
    await expect(productos.first()).toBeVisible();

    const baratos: { nombre: string; precio: number }[] = [];

    // for...of sobre all(): no necesitamos el indice, solo cada tarjeta.
    // Dentro del loop aplicamos la condicion y guardamos los que la cumplen.
    for (const producto of await productos.all()) {
      const nombre = (await producto.getByTestId('inventory-item-name').textContent()) ?? '';
      const precioTexto = (await producto.getByTestId('inventory-item-price').textContent()) ?? '';
      const precio = Number(precioTexto.replace('$', ''));

      if (precio < 16) {
        baratos.push({ nombre, precio });
      }
    }

    console.log('Productos de menos de $16:', baratos);

    expect(baratos.length).toBeGreaterThanOrEqual(2);
  });
});

// Casos para el test data-driven: cada objeto es un escenario de login.
const casosLogin = [
  { usuario: 'standard_user', password: 'secret_sauce', exito: true },
  { usuario: 'locked_out_user', password: 'secret_sauce', exito: false },
  { usuario: 'standard_user', password: 'wrong_password', exito: false },
];

test.describe('Login data-driven', () => {
  // El for...of va AFUERA de test() a proposito: asi Playwright registra
  // un test independiente por cada caso. Si uno falla, los demas igual corren,
  // cada uno aparece con su nombre en el reporte y pueden correr en paralelo.
  // Si el loop estuviera adentro de un solo test, el primer fallo cortaria el resto.
  for (const caso of casosLogin) {
    // El titulo tiene que ser unico, por eso incluye usuario y password.
    test(`login ${caso.usuario} / ${caso.password} -> ${caso.exito ? 'exito' : 'error'}`, async ({ page }) => {
      await login(page, caso.usuario, caso.password);

      if (caso.exito) {
        await expect(page).toHaveURL(/inventory/);
      } else {
        await expect(page.getByTestId('error')).toBeVisible();
      }
    });
  }
});
