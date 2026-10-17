# 14. Debugging de tests con MCP y herramientas de Playwright

## El problema

Un test falla. El error dice "Timeout 5000ms exceeded waiting for locator". Y ahora que?

Hay dos caminos: las herramientas propias de Playwright, y pedirle ayuda a Claude con MCP. Lo mejor es combinarlos.

---

## Parte 1: Las herramientas de Playwright

### Trace Viewer (la mas util)

Graba todo lo que paso durante el test: cada accion, screenshot antes y despues, el DOM en cada momento, los pedidos de red.

Activarlo en `playwright.config.js`:

```js
use: {
  trace: 'on-first-retry',  // graba solo cuando reintenta
  // o 'on' para grabar siempre (ocupa mas espacio)
}
```

Verlo despues de un fallo:

```bash
npx playwright show-trace test-results/.../trace.zip
```

O mas facil, abrir el reporte HTML y clickear en el test fallido:

```bash
npx playwright show-report
```

En el trace podes:
- Ver el screenshot exacto del momento del fallo
- Hacer hover sobre cada accion y ver como estaba la pagina
- Inspeccionar el DOM en ese momento (ver si el elemento existia o no)
- Ver cuanto tardo cada paso

### Modo debug (paso a paso)

```bash
npx playwright test archivo.spec.ts --debug
```

Abre el browser y el Inspector de Playwright. Vas clickeando "Next" y ves cada accion ejecutarse. Podes probar locators en vivo desde el Inspector.

### Modo UI (el mas comodo)

```bash
npx playwright test --ui
```

Interfaz grafica donde ves la lista de tests, los corres de a uno, ves el timeline, y podes editar y re-correr sin salir.

### Headed (ver el browser)

```bash
npx playwright test --headed
```

Simplemente muestra el browser mientras corre. A veces con ver que pasa ya entendes el problema.

### Slow motion

```js
// En el config o al lanzar
use: {
  launchOptions: { slowMo: 1000 }  // 1 segundo entre acciones
}
```

Util cuando algo pasa demasiado rapido para verlo.

---

## Parte 2: Debugging con Claude + MCP

Aca esta la diferencia. Con MCP, Claude puede **abrir el sitio y mirarlo el mismo** en vez de adivinar.

### Flujo tipico

**1. Le pasas el error completo**

```
Este test falla:

(pegar el codigo del test)

Error:
TimeoutError: locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Checkout' })

Navega a https://www.saucedemo.com/cart.html (login con standard_user /
secret_sauce) y deci que locator deberia usar.
```

**2. Claude navega y mira**

Con MCP abre el browser, hace el login, llega al carrito, y ve el HTML real. Descubre que el boton no tiene role de button (es un `<a>` estilado como boton) o que el nombre accesible es distinto.

**3. Te da el locator correcto y el porque**

No solo te arregla la linea, te explica que paso. Eso es lo que te hace aprender.

---

## Los 5 errores mas comunes y como diagnosticarlos

### "Timeout exceeded waiting for locator"

Significa: no encontro el elemento en el tiempo dado.

Causas posibles:
- El locator esta mal escrito (typo, mayusculas, texto distinto)
- El elemento esta en un iframe (necesitas `frameLocator`)
- El elemento todavia no cargo (el sitio es lento)
- El elemento nunca aparece (bug real de la app)

Como diagnosticar:
```bash
npx playwright test --debug
```
Y en el Inspector probas el locator en vivo. Si no matchea nada, el problema es el locator.

Con MCP:
```
Navega a (URL) y deci si existe un elemento que matchee
getByRole('button', { name: 'Checkout' }). Si no, cual es el locator correcto.
```

### "Strict mode violation: resolved to N elements"

Significa: el locator matchea varios elementos y Playwright no adivina cual.

Solucion: narrar el locator con `filter()`, chaining, o `first()`/`nth()`.

Con MCP:
```
Este locator matchea 4 elementos: page.getByRole('button', { name: 'Add to cart' })
Navega a (URL) y deci como narrar el locator para que matchee solo el del
producto "Sauce Labs Backpack".
```

### "Element is not visible"

Significa: el elemento existe en el DOM pero no se ve.

Causas:
- Esta tapado por un modal o un banner de cookies
- Tiene `display: none` o `visibility: hidden`
- Esta fuera del viewport y no scrolleo (raro, Playwright scrollea solo)
- Tiene opacity 0

Como diagnosticar: el trace viewer te muestra el screenshot. Si ves un modal tapando todo, ahi esta la respuesta.

### "Element is not enabled"

El boton esta deshabilitado. Normalmente significa que falta llenar un campo requerido antes.

### El test pasa local pero falla en CI

Causas tipicas:
- CI corre headless y el sitio se comporta distinto
- CI es mas lento (necesitas mas timeout)
- Datos de prueba que existen local pero no en el ambiente de CI
- Tests que dependen del orden (en CI corren en paralelo)

---

## Prompt template para debugging con Claude

```
Tengo un test de Playwright que falla.

CODIGO DEL TEST:
(pegar el test completo)

ERROR:
(pegar el error completo con el call log)

CONTEXTO:
- URL: (url)
- Credenciales si hace falta: (user / pass)
- Pasa local pero falla en CI? (si/no)
- Falla siempre o es intermitente?

Navega al sitio con MCP, reproduci el flujo, y deci:
1. Cual es la causa del fallo
2. Como se arregla
3. Si el test tiene otros problemas que no vi
```

---

## Debugging de tests intermitentes (flaky)

Son los peores: pasan 9 de cada 10 veces. Causas tipicas:

**1. Race condition**: el test clickea antes de que la pagina termine de cargar.

Solucion: reemplazar esperas implicitas por assertions web-first.

```js
// Fragil
await page.getByRole('button').click();

// Robusto
await expect(page.getByRole('button')).toBeEnabled();
await page.getByRole('button').click();
```

**2. Sitio externo inestable**: herokuapp, demoqa y similares a veces tiran 503.

Solucion: `retries` en el config.

```js
test.describe.configure({ retries: 2, timeout: 90_000 });
```

**3. Datos que cambian**: el test asume que hay 5 registros, pero otro test creo uno mas.

Solucion: hacer el test independiente (crear sus propios datos, limpiarlos al final).

**Como detectarlos**: corre el test 10 veces seguidas.

```bash
npx playwright test archivo.spec.ts --repeat-each=10
```

---

## Resumen: que usar y cuando

| Situacion | Herramienta |
|-----------|-------------|
| El test falla y no se por que | Trace Viewer |
| Quiero ver el test correr paso a paso | `--debug` |
| Quiero probar locators en vivo | `--debug` + Inspector, o `codegen` |
| No se que locator usar | Claude + MCP navegando el sitio |
| El test es intermitente | `--repeat-each=10` para reproducirlo |
| Quiero entender por que fallo y aprender | Claude + MCP con el error completo |

La combinacion que mejor funciona: Trace Viewer para ver **que** paso, Claude con MCP para entender **por que** y arreglarlo.