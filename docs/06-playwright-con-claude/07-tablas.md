# 07. Tablas: filas, columnas, data-driven

Las tablas son el componente MÁS común en apps empresariales (CRM, admin panels, reportes, dashboards). Y son el componente que peor se automatiza si no sabés las dos reglas de oro.

Basado en la Lecture 3.8 del PPTX.

## Las dos reglas de oro

### Regla 1: NO busques filas por `.nth(0)` o `.first()`

Las tablas se pueden ordenar (click en el header). Si tu test espera que "Carlos" esté en la fila 2, el día que un usuario clickeé el header de "Nombre" para ordenar alfabéticamente, tu test se rompe.

**Siempre buscá la fila por algo ÚNICO de ella**: un email, un ID, un número de factura.

### Regla 2: NO busques columnas por posición fija

Si tu test lee la columna 3 porque "la fecha está siempre ahí", el día que el equipo agregue una columna nueva antes, tu test lee la columna equivocada.

**Siempre buscá la columna por su nombre de header.**

## El sitio de práctica

[the-internet.herokuapp.com/tables](https://the-internet.herokuapp.com/tables)

Hay dos tablas. Vamos con la primera (`#table1`), que tiene columnas:

| Last Name | First Name | Email | Due | Web Site | Action |
|---|---|---|---|---|---|

El Email es ÚNICO, perfecto para identificar filas.

## El prompt para Claude Code

Abrí Claude Code:

```bash
claude
```

Pegale:

```
Escribí un test de Playwright en TypeScript para https://the-internet.herokuapp.com/tables

Usá la tabla con id="table1".

El test debe:
1. Encontrar la fila del usuario con email "fbach@yahoo.com" (NO uses nth, el orden puede cambiar al ordenar)
2. Verificar que esa fila tiene "$51.00" en la columna Due. IMPORTANTE: buscá el índice de la columna Due por el texto del header, no hardcodeado.
3. Hacer click en el link "edit" DENTRO de esa fila (no uses getByRole global, que matchearia varios edit)
4. Verificar que la URL termina en #edit

Tambien, en el mismo archivo, otro test que:
1. Lea TODAS las filas de la tabla
2. Convierta la columna Due a numero
3. Encuentre el email del usuario que mas debe
4. Verifique que es "jdoe@hotmail.com" con $100.00 (si la data del sitio no cambio)

El sitio es publico y a veces es lento, agregá retries: 2 y timeout: 60000 al describe.

Guardalo en laboratorios/06-tables-herokuapp/tables.spec.ts
```

## El código esperado

```typescript
import { test, expect } from '@playwright/test';

test.describe.configure({ retries: 2, timeout: 60_000 });

test.describe('Table 1 scenarios', () => {

  test('find a specific row by email and read its Due column', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/tables');

    const table = page.locator('#table1');

    // Buscar el indice de la columna Due por el texto del header
    const headers = await table.locator('thead th').allInnerTexts();
    const dueCol = headers.findIndex(h => h.trim() === 'Due');

    // Buscar la fila por email (unico)
    const row = table.locator('tbody tr').filter({ hasText: 'fbach@yahoo.com' });
    await expect(row.locator('td').nth(dueCol)).toHaveText('$51.00');

    // Click en edit DENTRO de esa fila
    await row.getByRole('link', { name: 'edit' }).click();
    await expect(page).toHaveURL(/#edit$/);
  });

  test('find the user with the highest amount due', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/tables');

    const table = page.locator('#table1');
    const headers = await table.locator('thead th').allInnerTexts();
    const dueCol = headers.findIndex(h => h.trim() === 'Due');
    const emailCol = headers.findIndex(h => h.trim() === 'Email');

    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();

    let top = { email: '', due: 0 };

    // nth(i) ESTA BIEN aca: estamos iterando TODAS las filas, el orden no importa
    for (let i = 0; i < rowCount; i++) {
      const cells = rows.nth(i).locator('td');
      const dueText = await cells.nth(dueCol).innerText();
      const due = Number(dueText.replace('$', ''));

      if (due > top.due) {
        top = {
          email: await cells.nth(emailCol).innerText(),
          due,
        };
      }
    }

    expect(top.email).toBe('jdoe@hotmail.com');
    expect(top.due).toBe(100);
  });
});
```

## Lo clave del código

### Buscar el índice de la columna por nombre

```typescript
const headers = await table.locator('thead th').allInnerTexts();
const dueCol = headers.findIndex(h => h.trim() === 'Due');
```

- Leemos los textos de todos los `<th>` del `<thead>`
- Buscamos cuál es el índice del header "Due"
- Si mañana agregan una columna nueva antes, `findIndex` encuentra el nuevo índice solo

Esto es RESISTENTE a cambios de schema de la tabla.

### Filtrar fila por contenido único

```typescript
const row = table.locator('tbody tr').filter({ hasText: 'fbach@yahoo.com' });
```

- `filter({ hasText: ... })` busca todas las `<tr>` que contengan ese texto
- Como el email es único, matchea exactamente una
- Si el usuario cambia su email, el test falla (lo que querés: te enteras del cambio real)

### Scopear acciones DENTRO de la fila

```typescript
await row.getByRole('link', { name: 'edit' }).click();
```

- Hay un "edit" POR CADA fila (muchos). `getByRole` global clickearía el equivocado.
- Al pedirlo dentro de `row`, lo scopeas: encuentra el "edit" de ESA fila específica.
- Esto es "parent-child chaining" (lo profundizamos en el siguiente archivo).

### Cuándo SÍ está bien usar `.nth()`

Las dos reglas de oro dicen "nunca para elementos que puedan reordenarse". En el segundo test iteramos TODAS las filas, el orden no nos importa (buscamos el máximo). Ahí `nth(i)` está bien, lo usamos como índice de loop, no como "la fila importante".

**Resumen:**
- `nth()` para IDENTIFICAR una fila específica: mal
- `nth()` para ITERAR todas las filas en un loop: bien

## Correrlo

```bash
npx playwright test laboratorios/06-tables-herokuapp/tables.spec.ts --project=chromium --headed
```

Herokuapp es lento, pueden tardar los 60s de timeout.

## Reto

Pedile a Claude Code un test adicional:

```
Agregá un test que:
1. Clickeé el header "Email" para ordenar la tabla por email
2. Lea el email de la primera fila
3. Clickeé "Email" de nuevo (para ordenar al reves)
4. Lea el email de la primera fila
5. Verifique que ambos son distintos (confirma que el sort funciona)
```

Este test prueba FUNCIONALIDAD de la tabla, no solo datos. Importante en apps reales.

## Checklist

- [ ] Entendés por qué `.nth()` para identificar filas es malo pero para iterar está bien
- [ ] Entendés por qué buscar columnas por nombre de header las hace resistentes
- [ ] El test de "fila por email" pasa
- [ ] El test del "máximo" pasa
- [ ] Agregaste retries + timeout (herokuapp es lento)

## Siguiente

[08. Parent/Child chaining](./08-parent-child.md): cómo subir y bajar en el DOM. La técnica que usamos acá para scopear "edit DENTRO de row" la vamos a formalizar.