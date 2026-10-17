    # 15. Errores comunes al generar tests con IA

Los problemas que te vas a encontrar usando Claude Code + MCP, y como evitarlos.

---

## 1. Aceptar el primer resultado sin revisarlo

**El error**: Claude genera un test, pasa, lo commiteas. Listo.

**Por que es un problema**: que un test pase no significa que sirva. Puede estar verificando algo trivial, o nada.

```js
// Esto "pasa" pero no prueba nada
test('login funciona', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  // Verifica que el boton de login sigue visible, no que el login funciono
});
```

**La solucion**: rompelo a proposito. Cambia la password a una incorrecta. Si el test sigue pasando, la assertion no sirve.

---

## 2. Locators fragiles que la IA eligio por comodidad

**El error**: Claude usa un selector CSS que funciona hoy pero se rompe manana.

```js
// Fragil: clase generada por el framework
await page.locator('.css-1x7hj2k').click();

// Fragil: depende de la estructura exacta del DOM
await page.locator('div > div > div:nth-child(3) > button').click();

// Fragil: depende de la posicion
await page.locator('button').nth(7).click();
```

**Por que pasa**: si no le diste contexto suficiente, Claude copia lo primero que funciona.

**La solucion**: pedile explicitamente la prioridad de locators.

```
Usa getByRole como primera opcion. Si no alcanza, getByLabel o getByTestId.
No uses selectores CSS con clases generadas ni posiciones (nth).
```

---

## 3. Esperas fijas (waitForTimeout)

**El error**:

```js
await page.getByRole('button', { name: 'Submit' }).click();
await page.waitForTimeout(3000);
await expect(page.getByText('Guardado')).toBeVisible();
```

**Por que es malo**: si tarda 0.5s perdes 2.5s. Si tarda 4s, falla igual. Y cuando tenes 200 tests, esos 3 segundos son 10 minutos de pipeline.

**La solucion**: las web-first assertions ya esperan.

```js
await page.getByRole('button', { name: 'Submit' }).click();
await expect(page.getByText('Guardado')).toBeVisible();
```

Si Claude te mete un `waitForTimeout`, pedile que lo saque.

---

## 4. Tests que dependen de otros tests

**El error**:

```js
test('crear usuario', async ({ page }) => { /* crea el usuario Pepe */ });
test('editar usuario', async ({ page }) => { /* edita a Pepe */ });
test('borrar usuario', async ({ page }) => { /* borra a Pepe */ });
```

**Por que es malo**: Playwright corre los tests en paralelo por defecto. El orden no esta garantizado. Y si el primero falla, los otros dos fallan en cascada sin razon.

**La solucion**: cada test crea lo que necesita y limpia al final. O usa `beforeEach` para el setup comun.

```js
test.beforeEach(async ({ page }) => {
  // crear el usuario de prueba
});

test.afterEach(async ({ page }) => {
  // borrarlo
});
```

---

## 5. Credenciales hardcodeadas en el codigo

**El error**:

```js
await page.getByLabel('Password').fill('MiPasswordReal123!');
```

Y eso termina en GitHub.

**La solucion**: variables de entorno.

```js
await page.getByLabel('Password').fill(process.env.TEST_PASSWORD);
```

Con un archivo `.env` que esta en `.gitignore`.

Claude no sabe cuales de tus datos son sensibles. Decile:

```
Usa variables de entorno para las credenciales, no las hardcodees.
```

---

## 6. Darle a Claude un sitio que no puede ver

**El error**: le pedis un test de la app interna de tu empresa, que esta detras de VPN.

```
Genera un test para https://app-interna.miempresa.local/dashboard
```

Claude no puede llegar ahi. Va a inventar locators.

**La solucion**: pegarle el outerHTML de los elementos. Es el metodo del paso "Capture" del workflow de 4 pasos.

---

## 7. Prompts sin contexto suficiente

**El error**:

```
Genera un test de login
```

Claude no sabe: que sitio, que credenciales, que verificar, si hay captcha, si redirige, nada.

**La solucion**: el template del documento de prompt engineering. Minimo: URL, datos, flujo, que verificar, y el HTML si el sitio no es publico.

---

## 8. No configurar testIdAttribute

**El error**: tu sitio usa `data-test` (como saucedemo) pero `getByTestId` busca `data-testid` por defecto. Nada matchea.

**La solucion**: en `playwright.config.js`:

```js
use: {
  testIdAttribute: 'data-test',
}
```

Decile a Claude que atributo usa tu sitio.

---

## 9. Correr todo en todos los browsers desde el principio

**El error**: tenes 4 projects configurados (chromium, firefox, webkit, chrome) y cada vez que corres un test lo corres 4 veces.

**Por que molesta**: desarrollas mas lento, y si falla en webkit no sabes si es tu test o una diferencia del browser.

**La solucion**: mientras desarrollas, un solo browser.

```bash
npx playwright test --project=chromium
```

Los 4 browsers los corres en CI, no en tu maquina mientras escribis.

---

## 10. Confiar en que la IA sabe tu negocio

**El error**: pedirle "genera los tests importantes de mi app".

Claude no sabe:
- Cual es el flujo que mas plata genera
- Que modulo tuvo 3 bugs en produccion el mes pasado
- Que el 80% de los usuarios usa esa pantalla

**La solucion**: la estrategia de testing la decidis vos. Claude escribe el codigo.

---

## 11. MCP desconectado sin darte cuenta

**El error**: le pedis a Claude que navegue un sitio y te dice que no puede, o peor, inventa lo que vio.

**Como verificar**:

```bash
claude mcp list
```

Tiene que aparecer `playwright` en la lista.

Si no esta:

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

---

## 12. Dejar que el contexto se llene de basura

**El error**: una conversacion de 3 horas donde pegaste 15 archivos completos, 40 errores y 2 HTMLs enteros. Claude empieza a dar respuestas peores.

**La solucion**: `/context` para ver cuanto ocupaste. Conversacion nueva cuando cambias de tema. `/compact` para comprimir.

---

## Checklist antes de commitear un test generado por IA

- [ ] Lo corri y pasa
- [ ] Lo rompi a proposito y falla (la assertion sirve)
- [ ] No tiene `waitForTimeout`
- [ ] Los locators son `getByRole` / `getByLabel` / `getByTestId`, no CSS fragil
- [ ] No tiene credenciales hardcodeadas
- [ ] Corre solo, sin depender de otros tests
- [ ] El nombre del test describe que verifica
- [ ] Si el sitio es lento, tiene retries o timeout ajustado

---

## La regla que resume todo

La IA genera codigo rapido. Vos decidis si ese codigo es un test de verdad.

Un test que pasa siempre, incluso cuando la app esta rota, es peor que no tener test: te da confianza falsa.