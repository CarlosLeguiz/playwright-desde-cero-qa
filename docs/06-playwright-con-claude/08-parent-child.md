# 08. Parent/Child chaining

En el archivo de tablas usamos esta técnica sin ponerle nombre:

```typescript
await row.getByRole('link', { name: 'edit' }).click();
```

Buscamos "edit" DENTRO de `row`, no en toda la página. Eso es parent/child chaining, la técnica más útil para locators en apps reales.

Basado en la Lecture 3.9 del PPTX.

## El problema que resuelve

Imaginá una lista de productos:

```html
<div class="product">
  <h3>Dell Laptop</h3>
  <p class="price">$899</p>
  <button>Add to cart</button>
</div>

<div class="product">
  <h3>Wireless Mouse</h3>
  <p class="price">$25</p>
  <button>Add to cart</button>
</div>

<div class="product">
  <h3>Monitor</h3>
  <p class="price">$310</p>
  <button>Add to cart</button>
</div>
```

Si pedís `page.getByRole('button', { name: 'Add to cart' })`, matcheás los TRES. Strict mode violation.

¿Cómo clickear SOLO el de "Wireless Mouse"? Dos pasos:

1. Encontrar el producto que contiene el texto "Wireless Mouse"
2. Buscar el botón DENTRO de ese producto

```typescript
const mouseCard = page.locator('.product').filter({ hasText: 'Wireless Mouse' });
await mouseCard.getByRole('button', { name: 'Add to cart' }).click();
```

Eso es parent/child chaining.

## Las 3 formas de hacerlo

### 1. `filter({ hasText })` (la que más vas a usar)

```typescript
// Encontrar el padre que contiene cierto texto, después buscar hijo
const card = page.locator('.product').filter({ hasText: 'Wireless Mouse' });
await card.getByRole('button', { name: 'Add to cart' }).click();
```

Lee natural: "la card que contiene 'Wireless Mouse', clickeá su botón 'Add to cart'".

### 2. `filter({ has: locator })`

```typescript
// Encontrar el padre que contiene cierto elemento (no solo texto)
const soldOutCards = page.locator('.product').filter({
  has: page.locator('button[disabled]')
});
await expect(soldOutCards).toHaveCount(1);
```

Útil cuando el criterio es "la card que tiene un botón deshabilitado", no un texto.

### 3. Chaining directo con `.locator()`

```typescript
// Si ya tenés el padre, podés buscar hijos encadenando
const card = page.getByTestId('product-mouse');
await card.locator('.price').textContent();
await card.getByRole('button').click();
```

Útil cuando el padre tiene un identificador propio (`data-testid`).

## El sitio de práctica

saucedemo.com/inventory.html (después de loguearte con `standard_user` / `secret_sauce`).

Cada producto es una `<div class="inventory_item">`. Vamos a hacer varias cosas sobre un producto específico sin tocar los otros.

## El prompt para Claude Code

Abrí Claude Code:

```bash
claude
```

Pegale:

```
Escribí un test de Playwright en TypeScript para saucedemo.com

Pasos:
1. Logueate como standard_user / secret_sauce
2. En la pagina de inventario, encontrá la card del producto "Sauce Labs Fleece Jacket" (es un div.inventory_item que contiene ese texto)
3. Verificá que esa card tiene precio "$49.99"
4. Clickeá el boton "Add to cart" DENTRO de esa card
5. Verificá que el boton de esa card cambió a "Remove"
6. Verificá que el badge del carrito muestra 1

Usá filter({ hasText }) para scopear a la card. NO uses nth().

Después agregá un segundo test que:
1. Loguee igual
2. Agregue al carrito TODOS los productos cuyo precio sea menor a $16
3. Verifique que el badge del carrito es igual a la cantidad de productos agregados
   (sin hardcodear nombres, descubrirlo iterando)

Guardalo en laboratorios/07-parent-child-saucedemo/parent-child.spec.ts
```

## El código esperado

```typescript
import { test, expect } from '@playwright/test';

test('add specific product using parent-child chaining', async ({ page }) => {
  // Login
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  // Encontrar la card del producto por su nombre
  const jacketCard = page.locator('.inventory_item')
                         .filter({ hasText: 'Sauce Labs Fleece Jacket' });

  // Verificar precio dentro de esa card
  await expect(jacketCard.locator('.inventory_item_price')).toHaveText('$49.99');

  // Click en el boton de ESA card
  await jacketCard.getByRole('button', { name: 'Add to cart' }).click();

  // El boton de esa card ahora dice Remove
  await expect(jacketCard.getByRole('button', { name: 'Remove' })).toBeVisible();

  // Badge del carrito
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});

test('add all products under $16 to the cart', async ({ page }) => {
  // Login
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  const cards = page.locator('.inventory_item');
  const count = await cards.count();
  let added = 0;

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const priceText = await card.locator('.inventory_item_price').innerText();
    const price = Number(priceText.replace('$', ''));

    if (price < 16) {
      await card.getByRole('button', { name: 'Add to cart' }).click();
      added++;
    }
  }

  await expect(page.locator('.shopping_cart_badge')).toHaveText(String(added));
});
```

## Lo clave

**Chaining es composición:**

```typescript
page.locator('.inventory_item')        // 6 cards
    .filter({ hasText: 'Fleece' })     // 1 card (filtrada)
    .getByRole('button')               // 1 botón de ESA card
    .click();
```

Cada paso narrow (acota) el locator. Al final apuntás al botón exacto.

**Es resistente a cambios:**

- Si cambian el orden de los productos: SIGUE FUNCIONANDO (buscamos por texto, no por posición)
- Si agregan un producto nuevo: SIGUE FUNCIONANDO (nuestra card es la misma)
- Si cambian las clases CSS: PUEDE romperse (dependemos de `.inventory_item` y `.inventory_item_price`)

Para hacerlo aún más robusto, podríamos usar `getByTestId('inventory-item')` si existe. Saucedemo tiene `data-test="inventory-item"` en cada card. Con el `testIdAttribute: 'data-test'` que configuramos antes, podrías usar `page.getByTestId('inventory-item')` en vez de `page.locator('.inventory_item')`.

## Correrlo

```bash
npx playwright test laboratorios/07-parent-child-saucedemo/parent-child.spec.ts --project=chromium --headed
```

## Reto

Pedile a Claude Code una variante del test del precio:

```
En vez de hardcodear "$49.99" para la Fleece Jacket, cambiá el test para que:
1. Lea el precio actual de la card de Fleece Jacket
2. Lo guarde en una variable
3. Clickee Add to cart
4. Vaya al carrito (link ".shopping_cart_link")
5. Verifique que en el carrito aparece ese mismo precio

Asi el test valida CONSISTENCIA de datos entre pantallas, no un valor hardcodeado.
```

Este patrón es oro: no verifica un valor fijo (que puede cambiar), verifica que el valor SE MANTIENE a través del flujo.

## Checklist

- [ ] Entendés qué es parent/child chaining
- [ ] Sabés usar `.filter({ hasText })` para scopear por contenido
- [ ] Sabés usar `.filter({ has: locator })` para scopear por presencia de elemento
- [ ] El test de la Fleece Jacket pasa
- [ ] El test de "productos bajo $16" pasa

## Siguiente

[09. Playwright MCP](./09-playwright-mcp.md): el último archivo del módulo. Donde Claude Code deja de ser asistente y pasa a controlar el navegador en vivo.