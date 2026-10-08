# Ajustar el código generado

Codegen te da un punto de partida, no un test listo para producción. Es como un primer boceto: tiene la forma general bien, pero necesita trabajo. En este archivo vemos qué le falta a un test grabado y cómo mejorarlo paso a paso.

## El código tal como sale de Codegen

Supongamos que grabaste este flujo en Mercado Libre:

1. Entrás a mercadolibre.com.ar
2. Escribís "notebook" en el buscador
3. Presionás Enter
4. Hacés click en el primer resultado
5. Hacés click en "Comprar ahora"

Codegen te genera algo así:

```javascript
const { test, expect } = require('@playwright/test');

test('test', async ({ page }) => {
  await page.goto('https://www.mercadolibre.com.ar/');
  await page.getByRole('combobox', { name: 'Buscar productos, marcas y más…' }).click();
  await page.getByRole('combobox', { name: 'Buscar productos, marcas y más…' }).fill('notebook');
  await page.getByRole('combobox', { name: 'Buscar productos, marcas y más…' }).press('Enter');
  await page.getByRole('link', { name: /Notebook/i }).first().click();
  await page.getByRole('link', { name: 'Comprar ahora' }).click();
});
```

Este código funciona. Si lo guardás y lo ejecutás, cumple con lo que grabaste. Pero NO es un buen test. Vamos a ver por qué y cómo mejorarlo.

## Problema 1: nombre del test genérico

Codegen pone siempre `'test'` como nombre. Es inútil.

### Antes

```javascript
test('test', async ({ page }) => {
```

### Después

```javascript
test('el usuario puede buscar un producto y acceder al checkout', async ({ page }) => {
```

**Regla:** el nombre del test debe describir el COMPORTAMIENTO que estás verificando, no las acciones mecánicas. "el usuario puede..." es mejor que "test de búsqueda" o "flujo de compra".

Mal nombre: "test de ML"
Nombre decente: "flujo de búsqueda en Mercado Libre"
Buen nombre: "el usuario puede buscar un producto y acceder al checkout"

## Problema 2: no tiene assertions

Un test sin assertions es un script. Si cualquier paso del flujo falla, Playwright te lo avisa (porque el click no encuentra el elemento), pero no verificás NADA del contenido o estado de la página.

### Antes

```javascript
await page.goto('https://www.mercadolibre.com.ar/');
await page.getByRole('combobox', { name: 'Buscar productos, marcas y más…' }).fill('notebook');
await page.getByRole('combobox', { name: 'Buscar productos, marcas y más…' }).press('Enter');
// nada más, no verificamos nada
```

### Después

```javascript
await page.goto('https://www.mercadolibre.com.ar/');

// Verificamos que estamos en la home correcta
await expect(page).toHaveTitle(/Mercado Libre Argentina/);

await page.getByRole('combobox', { name: 'Buscar productos, marcas y más…' }).fill('notebook');
await page.getByRole('combobox', { name: 'Buscar productos, marcas y más…' }).press('Enter');

// Verificamos que aparecieron resultados de búsqueda
await expect(page.getByText(/resultados para notebook/i)).toBeVisible();
```

**Regla:** distribuí assertions a lo largo del test. Cada etapa importante debería tener una verificación. Si algo falla, el mensaje de error te dice EN QUÉ paso falló.

## Problema 3: locators repetidos

Fijate cómo Codegen repite el locator largo del buscador tres veces:

```javascript
await page.getByRole('combobox', { name: 'Buscar productos, marcas y más…' }).click();
await page.getByRole('combobox', { name: 'Buscar productos, marcas y más…' }).fill('notebook');
await page.getByRole('combobox', { name: 'Buscar productos, marcas y más…' }).press('Enter');
```

Esto es feo y propenso a bugs: si el label cambia, hay que modificarlo en 3 lugares.

### Mejor

```javascript
const buscador = page.getByRole('combobox', { name: 'Buscar productos, marcas y más…' });
await buscador.fill('notebook');
await buscador.press('Enter');
```

Guardamos el locator en una variable y lo reutilizamos. Más limpio, más mantenible, menos propenso a errores. Y notá que eliminamos el primer `.click()` porque `.fill()` ya hace foco en el campo automáticamente (Codegen a veces agrega acciones redundantes).

**Regla:** si usás el mismo locator más de una vez, guardalo en una `const`.

## Problema 4: acciones innecesarias

Codegen graba TODO lo que hacés, incluyendo cosas inútiles. Ejemplos típicos:

- Un `.click()` en un input seguido de un `.fill()` (el `.fill()` ya hace foco solo)
- Un scroll que hiciste para ver un elemento (Playwright scrollea solo cuando necesita)
- Un click en un link que después anulaste y volviste atrás

**Regla:** revisá el código y eliminá cualquier acción que no sea estrictamente necesaria para el flujo.

## Problema 5: no hay comentarios

Para alguien que lee el test tres semanas después (incluido vos mismo), no es obvio qué está probando cada bloque.

### Después

```javascript
test('el usuario puede buscar un producto y acceder al checkout', async ({ page }) => {
  // Setup: navegar a la home
  await page.goto('https://www.mercadolibre.com.ar/');
  await expect(page).toHaveTitle(/Mercado Libre Argentina/);

  // Acción: buscar un producto
  const buscador = page.getByRole('combobox', { name: 'Buscar productos, marcas y más…' });
  await buscador.fill('notebook');
  await buscador.press('Enter');
  await expect(page.getByText(/resultados para notebook/i)).toBeVisible();

  // Acción: entrar al primer producto
  await page.getByRole('link', { name: /Notebook/i }).first().click();
  await expect(page.getByRole('button', { name: 'Comprar ahora' })).toBeVisible();

  // Acción: ir al checkout
  await page.getByRole('button', { name: 'Comprar ahora' }).click();

  // Verificación final: estamos en el checkout
  await expect(page).toHaveURL(/checkout/);
});
```

**Regla:** usá comentarios para marcar las etapas del test (setup, acciones, verificaciones). Hace que el código se lea como una historia.

## Problema 6: locators frágiles por texto exacto

A veces Codegen usa textos muy específicos que pueden cambiar. Por ejemplo:

```javascript
await page.getByRole('button', { name: 'Comprar ahora' }).click();
```

Si mañana cambian el texto a "Comprar ya" o "Comprá ahora", el test se rompe.

### Opción más robusta: usar regex

```javascript
await page.getByRole('button', { name: /Comprar/i }).click();
```

La regex `/Comprar/i` matchea cualquier texto que contenga "Comprar" (sin importar mayúsculas gracias a la `i`). Más resiliente.

**Regla:** si el texto exacto puede variar (traducciones, A/B testing, cambios menores), usá regex para hacer el locator más flexible. Pero no te excedas: una regex demasiado amplia puede matchear cosas que no querías.

## Problema 7: no hay manejo de datos de prueba

Codegen hardcodea los valores que escribiste. Si querés probar con otros datos, hay que modificar el test cada vez.

### Antes

```javascript
await buscador.fill('notebook');
```

### Después (si vas a reusar el test con distintos términos)

```javascript
const terminoBusqueda = 'notebook';
await buscador.fill(terminoBusqueda);
await expect(page.getByText(new RegExp(`resultados para ${terminoBusqueda}`, 'i'))).toBeVisible();
```

O, cuando aprendas tests parametrizados (más adelante), vas a poder correr el mismo test con 10 términos distintos sin duplicar código.

**Regla:** cuando empezás, está bien hardcodear datos. Cuando el test madura, abstraelos.

## Checklist de ajuste

Después de grabar un test con Codegen, revisá esta lista:

- [ ] ¿El nombre describe el comportamiento esperado?
- [ ] ¿Hay al menos una assertion al final?
- [ ] ¿Hay assertions intermedias en los pasos clave?
- [ ] ¿Los locators repetidos están guardados en variables?
- [ ] ¿Las acciones innecesarias (clicks previos a fills, scrolls) están eliminadas?
- [ ] ¿Hay comentarios marcando las etapas del test?
- [ ] ¿Los locators por texto exacto están donde corresponden, o conviene usar regex?
- [ ] ¿El test corre y pasa en Chromium, Firefox y WebKit?

## Comparación antes/después completa

### Antes (lo que te da Codegen)

```javascript
const { test, expect } = require('@playwright/test');

test('test', async ({ page }) => {
  await page.goto('https://www.mercadolibre.com.ar/');
  await page.getByRole('combobox', { name: 'Buscar productos, marcas y más…' }).click();
  await page.getByRole('combobox', { name: 'Buscar productos, marcas y más…' }).fill('notebook');
  await page.getByRole('combobox', { name: 'Buscar productos, marcas y más…' }).press('Enter');
  await page.getByRole('link', { name: /Notebook/i }).first().click();
  await page.getByRole('link', { name: 'Comprar ahora' }).click();
});
```

### Después (test revisado y profesional)

```javascript
const { test, expect } = require('@playwright/test');

test('el usuario puede buscar un producto y acceder al checkout', async ({ page }) => {
  // Setup: navegar a la home
  await page.goto('https://www.mercadolibre.com.ar/');
  await expect(page).toHaveTitle(/Mercado Libre Argentina/);

  // Acción: buscar un producto
  const buscador = page.getByRole('combobox', { name: 'Buscar productos, marcas y más…' });
  await buscador.fill('notebook');
  await buscador.press('Enter');
  await expect(page.getByText(/resultados para notebook/i)).toBeVisible();

  // Acción: entrar al primer producto
  await page.getByRole('link', { name: /Notebook/i }).first().click();
  await expect(page.getByRole('button', { name: /Comprar/i })).toBeVisible();

  // Acción: ir al checkout
  await page.getByRole('button', { name: /Comprar/i }).click();

  // Verificación final: estamos en el checkout
  await expect(page).toHaveURL(/checkout/);
});
```

**Resultado:** mismo flujo, pero ahora es un test real que verifica comportamiento, es legible, mantenible y resistente a cambios menores en la UI.

## El valor que vos agregás

Codegen te ahorra ~70% del trabajo mecánico (escribir locators, agregar awaits, estructurar el test). El 30% restante es TU trabajo como QA:

- Decidir qué verificar
- Elegir buenos nombres
- Hacer el código mantenible
- Entender qué partes son críticas vs secundarias
- Prever qué puede cambiar en el futuro

Ese 30% es lo que diferencia un test útil de un script inútil. Codegen no lo puede hacer por vos.

## Resumen

- El código de Codegen es un punto de partida, no un test terminado
- Cambialo el nombre, agregá assertions, saca lo redundante, poné comentarios
- Guardá locators repetidos en variables
- Usá regex en locators cuyos textos pueden variar
- Checklist antes de considerar el test "listo"
- Codegen hace el 70% mecánico, vos hacés el 30% que importa