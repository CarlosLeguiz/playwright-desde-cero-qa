# 01. Core Actions

Las 5 acciones que vas a usar en el 90% de tus tests. Después de este archivo vas a poder escribir un test completo con Claude Code sin tocar documentación.

Basado en la Lecture 3.2 del PPTX.

## Las 5 acciones

| Acción | Playwright | Para qué |
|---|---|---|
| Navegar | `page.goto(url)` | Abrir una página |
| Escribir | `locator.fill(text)` | Llenar inputs (user, password) |
| Clickear | `locator.click()` | Botones, links, checkboxes |
| Hover | `locator.hover()` | Pasar el mouse sin clickear |
| Verificar | `expect(locator).toBeVisible()` | Confirmar que algo apareció |

Todas, excepto los locators crudos, llevan `await` adelante.

## El sitio de práctica

Vamos a usar [saucedemo.com](https://www.saucedemo.com), el sitio demo oficial para automation.

Credenciales:
- Usuario: `standard_user`
- Password: `secret_sauce`

Hay varios usuarios más (`locked_out_user`, `problem_user`, etc.) que vamos a usar en otros archivos para testear casos negativos.

## El prompt que le pedís a Claude Code

Abrí Claude Code en tu proyecto:

```bash
claude
```

Y pedile esto (copialo tal cual):

```
Escribí un test de Playwright en TypeScript para https://www.saucedemo.com

Pasos:
1. Loguearte como standard_user / secret_sauce
2. Verificar que la URL contiene "inventory.html" y la página tiene título "Products"
3. Hacer hover sobre el botón "Open Menu"
4. Agregar "Sauce Labs Backpack" al carrito
5. Verificar que el badge del carrito muestra 1

Usá web-first assertions. Nunca uses waitForTimeout.
Guardalo en laboratorios/02-core-actions-saucedemo/core-actions.spec.ts
```

Claude te va a crear el archivo solo. Si no lo hace, pedile que lo haga explícitamente.

## El código que debería generar

Esto es lo que esperamos como output:

```typescript
import { test, expect } from '@playwright/test';

test('standard user puede loguearse y agregar al carrito', async ({ page }) => {
  // 1. Login
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  // 2. Verificar que llegamos a la página de productos
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.locator('.title')).toHaveText('Products');

  // 3. Hover en el menú
  await page.getByRole('button', { name: 'Open Menu' }).hover();

  // 4. Agregar producto al carrito
  await page.locator('#add-to-cart-sauce-labs-backpack').click();

  // 5. Verificar el badge del carrito
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});
```

## Qué está pasando acá

- `import { test, expect } from '@playwright/test'` es la sintaxis de TypeScript (en JS vimos `const { test, expect } = require(...)`). Las dos hacen lo mismo.
- `getByPlaceholder('Username')` encontró el input por su placeholder visible. Es la mejor opción cuando no hay label.
- `getByRole('button', { name: 'Login' })` encontró el botón por su rol semántico.
- `#add-to-cart-sauce-labs-backpack` usa el id del botón. En saucedemo los ids vienen del nombre del producto, son estables.
- `toHaveURL(/inventory\.html/)` y `toHaveText('Products')` son web-first assertions: reintentan solas hasta 5 segundos. No necesitamos `waitForTimeout`.

## Correrlo

Si Claude Code guardó el archivo en `laboratorios/02-core-actions-saucedemo/core-actions.spec.ts`:

```bash
npx playwright test laboratorios/02-core-actions-saucedemo/core-actions.spec.ts --headed --project=chromium
```

Debería pasar al primer intento. Si falla, lo más común es:

- Saucedemo cambió el texto de algún botón: pegale el error a Claude y pedile que ajuste el locator
- Internet lento y las web-first assertions se timeoutearon: subí el timeout o corré de nuevo

## Reto: un test negativo

Pedile a Claude Code:

```
Agregá otro test en el mismo archivo: loguearte como "locked_out_user"
con password "secret_sauce" y verificar que aparece el mensaje de error.
El mensaje real es "Epic sadface: Sorry, this user has been locked out."
Usá toContainText para que el test no se rompa por puntuación.
```

Si lo hace bien, deberías tener dos tests en el archivo: uno positivo (login ok) y uno negativo (user bloqueado).

## Checklist antes de pasar al siguiente archivo

- [ ] Claude Code está instalado y logueado
- [ ] Ajustaste el `testMatch` del `playwright.config.js` para aceptar `.spec.ts`
- [ ] Corriste el test positivo y pasó
- [ ] Corriste el test negativo y pasó
- [ ] Entendés qué hace cada línea del código generado
- [ ] Si Claude te sugirió un locator con `.nth()` o clases hasheadas, le pediste alternativa

## Siguiente

[02. Locate Elements](./02-locate-elements.md): le pedimos a Claude un mapa completo de locators de una página entera.