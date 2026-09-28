# Estructura de un test

Todo test de Playwright tiene la misma estructura básica. Una vez que la entendés, todos los tests se leen igual.

## La estructura mínima

```typescript
import { test, expect } from '@playwright/test';

test('nombre del test', async ({ page }) => {
  // acciones y verificaciones
});
```

Vamos a desarmar esta línea por línea.

## El import

```typescript
import { test, expect } from '@playwright/test';
```

Traemos dos funciones desde la librería de Playwright:

- **`test`**: la función que declara un test individual
- **`expect`**: la función que hace verificaciones (assertions)

Este import va SIEMPRE al principio de cada archivo de test. Sin él, ni `test` ni `expect` existen.

## La función `test`

```typescript
test('nombre del test', async ({ page }) => {
  // ...
});
```

`test` recibe dos parámetros:

### Parámetro 1: el nombre del test

Un string que describe qué hace el test. Aparece en:

- La salida de la terminal cuando corrés los tests
- El reporte HTML
- Los mensajes de error cuando algo falla

**Convención:** el nombre debe describir el comportamiento esperado. Ejemplos buenos:

```typescript
test('el usuario puede iniciar sesión con credenciales válidas', ...)
test('muestra error cuando el email es inválido', ...)
test('el carrito refleja el total correcto al agregar productos', ...)
```

Ejemplos malos:

```typescript
test('test1', ...)              // no dice nada
test('login', ...)              // muy genérico
test('probar botón', ...)       // no dice qué se espera
```

### Parámetro 2: la función asíncrona

```typescript
async ({ page }) => {
  // acciones
}
```

Esta es la función que se ejecuta cuando se corre el test. Tiene tres partes importantes:

**a) `async`**: obligatorio, porque adentro vas a usar `await` (ver [async-await.md](./async-await.md))

**b) `({ page })`**: acá viene lo interesante, veamos qué es.

**c) `=> { ... }`**: la sintaxis de "arrow function" (función flecha) de JavaScript moderno. Es equivalente a `function() { ... }` pero más corta.

## ¿Qué es `{ page }`?

Es la parte que más confunde al principio. Vamos por partes.

### Fixtures: el patrón que usa Playwright

Un "fixture" es un recurso que Playwright te prepara automáticamente antes de cada test. El más importante es `page`.

Playwright ofrece varios fixtures listos para usar:

- **`page`**: una pestaña del navegador
- **`browser`**: la instancia completa del navegador
- **`context`**: el contexto del navegador (cookies, storage)
- **`request`**: cliente HTTP para testear APIs

Cuando escribís `({ page })` le estás diciendo a Playwright: "para este test, necesito un `page` (una pestaña). Preparámelo".

### La sintaxis `{ page }` explicada

`{ page }` es "destructuring": una forma de sacar propiedades de un objeto. Es equivalente a:

```typescript
async (fixtures) => {
  const page = fixtures.page;
  // ...
}
```

Pero mucho más corto y limpio.

Si quisieras usar varios fixtures a la vez:

```typescript
test('ejemplo', async ({ page, context, request }) => {
  // acá tenés los tres disponibles
});
```

## El objeto `page`

`page` representa una pestaña del navegador. Es el objeto con el que MÁS vas a interactuar en Playwright.

### Qué podés hacer con `page`

**Navegar:**

```typescript
await page.goto('https://miapp.com');
await page.goBack();
await page.reload();
```

**Encontrar elementos (locators):**

```typescript
page.getByRole('button', { name: 'Enviar' })
page.getByText('Bienvenido')
page.getByLabel('Email')
```

**Ejecutar acciones:**

```typescript
await page.getByRole('button').click();
await page.getByLabel('Email').fill('carlos@test.com');
await page.getByLabel('Password').press('Enter');
```

**Obtener información:**

```typescript
const title = await page.title();
const url = page.url();
const content = await page.content();
```

**Interceptar red:**

```typescript
await page.route('**/api/users', route => route.fulfill({ ... }));
```

Los detalles de cada acción los vemos en los próximos módulos. Por ahora quedate con la idea: **`page` es tu control remoto del navegador**.

## Un test con varias acciones

```typescript
import { test, expect } from '@playwright/test';

test('el usuario puede buscar y ver resultados', async ({ page }) => {
  // 1. Navegar
  await page.goto('https://ejemplo.com');

  // 2. Actuar
  await page.getByLabel('Buscar').fill('Playwright');
  await page.getByRole('button', { name: 'Buscar' }).click();

  // 3. Verificar
  await expect(page.getByText('Resultados de búsqueda')).toBeVisible();
});
```

Este es el patrón más común: **Arrange (preparar) → Act (actuar) → Assert (verificar)**, conocido como AAA.

## Varios tests en un archivo

Podés tener muchos tests en el mismo archivo:

```typescript
import { test, expect } from '@playwright/test';

test('el login funciona con credenciales válidas', async ({ page }) => {
  // ...
});

test('el login muestra error con contraseña incorrecta', async ({ page }) => {
  // ...
});

test('el link de "olvidé mi contraseña" lleva al formulario correcto', async ({ page }) => {
  // ...
});
```

Cada test corre **de forma aislada**: Playwright abre un navegador limpio para cada uno. Un test no puede afectar a otro (no comparten cookies, ni sesión, ni datos).

## Agrupar tests con `test.describe`

Cuando tenés varios tests relacionados, podés agruparlos:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Módulo de login', () => {
  test('funciona con credenciales válidas', async ({ page }) => {
    // ...
  });

  test('falla con contraseña incorrecta', async ({ page }) => {
    // ...
  });

  test('bloquea al usuario después de 3 intentos fallidos', async ({ page }) => {
    // ...
  });
});
```

Ventajas:

- Los reportes muestran los tests agrupados
- Podés aplicar hooks (setup y cleanup) a todo el grupo
- El código queda más organizado

## Resumen

- Todo test empieza con `import { test, expect } from '@playwright/test'`
- La función `test` recibe un nombre descriptivo y una función asíncrona
- `{ page }` es "destructuring" de un fixture: Playwright te prepara una pestaña del navegador
- `page` es tu control remoto: con él navegás, encontrás elementos y ejecutás acciones
- Cada test corre aislado (navegador limpio)
- Usás `test.describe` para agrupar tests relacionados
- El patrón más común es: navegar → actuar → verificar (AAA)

## Analogía final

Pensá en `test()` como un guión de teatro:

- El **nombre del test** es el título de la escena
- La **función async** es el guión propiamente dicho, con las acciones a ejecutar
- **`page`** es el escenario donde ocurre todo
- **`await`** garantiza que cada acción termine antes de la siguiente
- **`expect`** es el crítico que verifica que la escena salió como debía