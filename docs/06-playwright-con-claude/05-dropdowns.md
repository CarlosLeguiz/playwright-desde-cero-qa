# 05. Dropdowns: nativos y custom

Los dropdowns son el primer elemento "complicado" que te vas a cruzar en apps reales. Parecen simples (un menú para elegir una opción) pero vienen en dos sabores que se tratan muy distinto.

Basado en la Lecture 3.6 del PPTX.

## Los dos tipos de dropdowns

### 1. Nativos (`<select>` de HTML)

Son los dropdowns de toda la vida. HTML puro:

```html
<select class="product_sort_container">
  <option value="az">Name (A to Z)</option>
  <option value="za">Name (Z to A)</option>
  <option value="lohi">Price (low to high)</option>
  <option value="hilo">Price (high to low)</option>
</select>
```

**Características:**

- El browser los renderiza nativo (en Mac usan el estilo de macOS, por ejemplo)
- Playwright tiene un método específico: `selectOption()`
- Super simples de automatizar

### 2. Custom (React, Vue, Material UI, etc.)

Son los que simulan ser dropdowns pero están armados con `<div>` y `<button>`. Dan más flexibilidad de diseño pero más dolor para testear:

```html
<div class="dropdown">
  <button class="trigger">Select a country</button>
  <ul class="options">
    <li>Argentina</li>
    <li>Brasil</li>
    <li>Chile</li>
  </ul>
</div>
```

**Características:**

- Looks modernos y animaciones
- NO funciona con `selectOption()` porque no son `<select>` reales
- Hay que clickear el trigger primero, esperar que aparezcan las opciones, clickear la opción

## Sitios de práctica

- Nativo: **saucedemo.com** tiene un sort dropdown
- Custom: **demoqa.com/select-menu** tiene varios de React

## Dropdown nativo: ejemplo con saucedemo

Después de loguearte, hay un combo "Sort" arriba a la derecha. Vamos a:

1. Loguearnos
2. Elegir "Price (low to high)"
3. Verificar que los precios están ordenados de menor a mayor (test REAL, no solo el click)

### El prompt para Claude Code

```
Escribí un test en TypeScript para saucedemo.com que:

1. Logueee como standard_user / secret_sauce
2. En la pagina de inventario, use el dropdown nativo <select> con data-test="product-sort-container"
3. Elija "Price (low to high)" por su LABEL visible, no por su value
4. Verifique que el valor interno del select es "lohi"
5. Lea todos los precios (.inventory_item_price), convirtalos a numeros, y verifique que estan ordenados de menor a mayor

El HTML del select es:
<select class="product_sort_container" data-test="product-sort-container">
  <option value="az">Name (A to Z)</option>
  <option value="za">Name (Z to A)</option>
  <option value="lohi">Price (low to high)</option>
  <option value="hilo">Price (high to low)</option>
</select>

Guardalo en laboratorios/04-dropdowns-saucedemo/sort-price.spec.ts
```

### El código esperado

```typescript
import { test, expect } from '@playwright/test';

test('sort by price low to high actually orders prices', async ({ page }) => {
  // Login
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  // Elegimos la opcion por LABEL (lo que ve el usuario)
  await page.locator('[data-test="product-sort-container"]')
            .selectOption({ label: 'Price (low to high)' });

  // Verificamos el valor interno
  await expect(page.locator('[data-test="product-sort-container"]'))
            .toHaveValue('lohi');

  // Leemos todos los precios como texto
  const priceTexts = await page.locator('.inventory_item_price').allTextContents();

  // Convertimos "$7.99" -> 7.99
  const prices = priceTexts.map(t => Number(t.replace('$', '')));

  // Verificamos que estan ordenados ascending
  const sorted = [...prices].sort((a, b) => a - b);
  expect(prices).toEqual(sorted);
});
```

### Las 3 formas de usar `selectOption`

Esto es importante. `selectOption` tiene 3 formas de identificar la opción:

```typescript
// Por LABEL (lo que ve el usuario)
await select.selectOption({ label: 'Price (low to high)' });

// Por VALUE (el value interno del <option>)
await select.selectOption('lohi');

// Por INDEX (posición en la lista)
await select.selectOption({ index: 2 });
```

**Preferí siempre por LABEL.** Es más legible y sobrevive mejor a cambios (si el dev cambia los values internos de "lohi" a "price_asc", el test no se rompe).

## Dropdown custom: ejemplo con demoqa

En demoqa.com/select-menu hay varios menús. Vamos con el "Select Value" (el primero).

### HTML (simplificado)

```html
<div class="css-2b097c-container">
  <div class="css-yk16xz-control">
    <div class="css-1hwfws3">
      <div class="css-1wa3eu0-placeholder">Select Option</div>
    </div>
  </div>
</div>
```

Fijate: no hay `<select>`, son divs con clases hasheadas (típico React).

### El prompt para Claude Code

```
Escribí un test en TypeScript para demoqa.com/select-menu que:

1. Vaya a https://demoqa.com/select-menu
2. Clickeé el dropdown custom "Select Value" (es un React Select, no un select nativo)
3. Elija la opción "Group 2, option 2"
4. Verifique que el valor seleccionado se muestra en el componente

El dropdown es un React Select con placeholder "Select Option" o similar.
Las opciones aparecen después de clickear el trigger.

Guardalo en laboratorios/04-dropdowns-demoqa/custom-select.spec.ts
```

### El código esperado (patrón genérico para dropdowns custom)

```typescript
import { test, expect } from '@playwright/test';

test('select a value from the React custom dropdown', async ({ page }) => {
  await page.goto('https://demoqa.com/select-menu');

  // 1. Click en el trigger del dropdown
  await page.locator('#withOptGroup').click();

  // 2. Esperar que aparezcan las opciones y clickear la que queremos
  await page.getByText('Group 2, option 2', { exact: true }).click();

  // 3. Verificar que el valor se muestra en el componente
  await expect(page.locator('#withOptGroup')).toContainText('Group 2, option 2');
});
```

## Diferencias prácticas

| | Nativo | Custom |
|---|---|---|
| HTML | `<select>` + `<option>` | `<div>` + eventos JS |
| Método Playwright | `selectOption()` | `click()` + `click()` |
| Clicks necesarios | 1 (automático) | 2 (abrir y elegir) |
| Esperar animaciones | No | A veces sí |
| Más estable | Sí | Requiere más cuidado |

## Reto

En demoqa.com/select-menu hay OTROS 3 dropdowns además del React Select:

- "Select One" (otro React Select)
- "Old Style Select Menu" (un `<select>` nativo)
- Un multi-select

Elegí uno y pedile a Claude Code que te arme un test que interactúe con él. Si es nativo, usá `selectOption`. Si es custom, usá el patrón de 2 clicks.

## Checklist

- [ ] Lab 4 con el sort nativo de saucedemo pasa (y verifica el orden real de precios)
- [ ] Lab 4 con el dropdown custom de demoqa pasa
- [ ] Entendés la diferencia entre `selectOption` y clicks encadenados
- [ ] Preferís siempre `label` sobre `value` cuando usás `selectOption`

## Siguiente

[06. Date Pickers](./06-datepickers.md): iframes y calendarios. El tipo de componente que más dolores de cabeza da en automation.