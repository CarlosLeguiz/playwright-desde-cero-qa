# 09. Playwright MCP: Claude maneja el navegador

En todos los archivos anteriores, Claude Code hacía UNA cosa: generar código de tests. Vos corrías ese código y verificabas que funcione.

Con **Playwright MCP** Claude Code hace algo MUY distinto: controla un navegador real EN VIVO. Vos le decís "andá a saucedemo, logueate, agregá al carrito" y él hace cada paso en un browser abierto, mientras VE lo que pasa. Después escribe el test resultante.

Es la diferencia entre un asistente que te dice "escribí este código" y un junior que te dice "ya lo probé, funciona, acá está el test".

Basado en la Lecture 3.10 del PPTX.

## Qué es MCP

MCP (Model Context Protocol) es un estándar que le permite a Claude Code conectarse con herramientas externas. "Playwright MCP" es una herramienta que le da a Claude Code acceso a estos superpoderes:

- `navigate(url)`: abrir una página
- `click(element)`: clickear algo
- `type(element, text)`: escribir
- `snapshot()`: ver el DOM accesible actual

El `snapshot()` es la clave: Claude Code "ve" la página como un lector de pantalla. Roles y nombres accesibles, exactamente lo que necesita para elegir buenos locators.

## Setup (una sola vez)

**Paso 1:** desde la terminal, estando en la raíz del proyecto:

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

Esto conecta el MCP server de Playwright con tu Claude Code.

**Paso 2 (opcional):** instalar también los "agents" de Playwright:

```bash
npx playwright init-agents --loop=claude
```

Esto configura workflows de agentes para generación de tests más estructurada. No es obligatorio para arrancar.

## Un prompt real con MCP

Abrí Claude Code:

```bash
claude
```

Y pegale este prompt (fijate que acá le pedís que USE el browser, no solo que escriba código):

```
Usa Playwright MCP para abrir https://www.saucedemo.com

Logueate como standard_user / secret_sauce.
Agregá "Sauce Labs Backpack" al carrito, andá al checkout.
Ingresá: First Name "Ali", Last Name "Raza", Zip "54000".
Finalizá la orden.

Para cada paso, anotá el locator que usaste (preferí getByRole y getByPlaceholder).
Después escribí un test que replique todo el flujo en laboratorios/08-mcp-checkout/checkout.spec.ts
y correlo. Si falla, arreglalo hasta que pase.

Listame los locators que tuviste que ajustar entre lo que viste con MCP y lo que terminó funcionando en el test.
```

## Qué va a pasar

1. Claude Code abre un browser Chromium controlado por él mismo
2. Lo ves navegar, loguearse, hacer clicks, llenar formularios (si está en modo visible)
3. Para cada acción, toma un snapshot del DOM accesible y elige el mejor locator
4. Al final, escribe el `.spec.ts` con todo el flujo
5. Lo corre, y si falla, lo ajusta solo

Es MUY cercano a lo que haría un QA experimentado.

## El test que debería generar

```typescript
import { test, expect } from '@playwright/test';

test('standard user completes checkout', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.locator('#add-to-cart-sauce-labs-backpack').click();
  await page.locator('.shopping_cart_link').click();
  await page.getByRole('button', { name: 'Checkout' }).click();

  await page.getByPlaceholder('First Name').fill('Ali');
  await page.getByPlaceholder('Last Name').fill('Raza');
  await page.getByPlaceholder('Zip/Postal Code').fill('54000');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();

  await expect(
    page.getByRole('heading', { name: 'Thank you for your order!' })
  ).toBeVisible();
});
```

Fijate que son casi todos `getByRole` y `getByPlaceholder`. Eso NO es casualidad: el snapshot MCP devuelve rol + nombre, así que Claude Code naturalmente elige esos locators.

## Por qué esto es tan distinto

En los archivos anteriores:

```
Vos → copiás HTML → Claude Code → escribe código → vos lo corrés → verificás
```

Con MCP:

```
Vos → le decís qué hacer → Claude Code lo HACE → escribe el código → lo corre → te muestra el resultado
```

Pasás de ser el QA que ejecuta a ser el QA que coordina. Perfecto para flujos complejos donde no querés copiar HTML de 10 pantallas.

## Caso real sugerido por el curso

```
Usa Playwright MCP para loguearte en saucedemo como problem_user 
(password secret_sauce). Explorá la página de productos y encontrá 
cualquier cosa que se vea rota.

Despues decime qué bugs encontraste y escribí tests que FALLEN 
porque esos bugs existen.
```

`problem_user` es un usuario especial de saucedemo con bugs intencionales (imágenes equivocadas, etc.). Es el ejercicio ideal para que veas a Claude Code haciendo exploratory testing real.

## Limitaciones

- MCP necesita que la app sea accesible desde tu máquina (no funciona con intranets corporativas sin VPN)
- Los agents todavía son experimentales, pueden fallar o cambiar entre versiones
- Para flujos muy largos (20+ pasos) a veces se pierde contexto, mejor dividir
- Consume más tokens de tu plan Claude Pro que generar código tradicional

## Checklist

- [ ] Agregaste el MCP server con `claude mcp add playwright npx @playwright/mcp@latest`
- [ ] Pediste a Claude Code que haga el flujo del checkout usando MCP
- [ ] Claude Code generó el `.spec.ts` y lo corrió
- [ ] Entendés la diferencia entre "Claude escribe código" vs "Claude maneja el browser"

## Cierre del módulo

Felicitaciones, completaste el **Módulo 6: Playwright con Claude Code**. Ahora podés:

- Pedirle a Claude Code que genere tests desde cero (archivo 01)
- Pedirle mapas de locators de páginas enteras (archivo 02)
- Debuggear sus errores comunes (archivo 03)
- Correrlos en los 4 motores de navegador (archivo 04)
- Manejar dropdowns, datepickers, iframes, tablas, parent/child (archivos 05-08)
- Dejar que Claude Code controle el browser él mismo (archivo 09)

Ese es el skillset completo que diferencia a un QA tradicional de un "QA aumentado por IA".

## Siguiente

Volvé al [README del módulo](./README.md). O arrancamos un módulo nuevo sobre:
- Page Object Model
- CI/CD con GitHub Actions
- Testing de apps con LLMs (lo específico de tu laburo)