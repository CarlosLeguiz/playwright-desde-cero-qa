# 3. Clasificar fallos: bug real o test mal escrito

Este es el documento central de la seccion. Es la habilidad que distingue a un QA de alguien que corre scripts.

## La situacion

Corres la suite por primera vez. Salen 38 fallos.

El reflejo del principiante es arreglar los 38 hasta que pasen. Eso es exactamente lo peor que podes hacer: la mitad de esos fallos son bugs reales, y "arreglarlos" significa tapar defectos del producto.

El trabajo es mirar cada uno y decidir: **es la aplicacion la que esta mal, o es mi test?**

## Los numeros de este caso

| Clasificacion | Cantidad |
|---------------|----------|
| Defectos reales del producto | 29 |
| Test mal escrito | 9 |
| **Total de fallos** | **38** |

79% defectos reales. Ese porcentaje es un indicador de la calidad de las instrucciones del agente: si la mayoria de los fallos hubieran sido tests malos, el `CLAUDE.md` estaba flojo.

## El criterio

Una pregunta resuelve el 90% de los casos:

> Si un usuario de verdad hiciera estos pasos a mano, veria el mismo problema?

- **Si** → defecto del producto. Se reporta, el test queda fallando.
- **No** → test mal escrito. Se arregla el test.

## Como verificarlo

No se decide leyendo el codigo. Se decide mirando.

**1. Abri el trace del fallo**

```bash
npx playwright show-report
```

Click en el test fallido. Vas a ver el screenshot exacto del momento del fallo, el DOM en ese instante, y cada paso con su timing.

**2. Hacelo a mano**

Abri el sitio, segui los pasos del test vos mismo. Pasa lo mismo?

**3. Lee el error completo, no la primera linea**

Playwright te dice exactamente que esperaba y que encontro. El `Call log` muestra que intento y cuantas veces.

## Las firmas tipicas de cada categoria

### Firmas de defecto real

**El valor esta mal, pero el elemento esta ahi.**

```
Expected: "Sauce Labs Backpack"
Received: "Sauce Labs Fleece Jacket"
```

El locator funciono, encontro el elemento, lo leyo. La aplicacion devolvio lo que no corresponde. Eso es un bug.

**La accion no tuvo efecto.**

```
Expected: visible
Received: hidden
Call log: waiting for getByTestId('shopping-cart-badge')
```

Clickeaste "Add to cart" y el badge nunca aparecio. Si lo haces a mano y pasa igual, es la app.

**Aparece algo que no deberia.**

Un `alert()` inesperado, un mensaje de error cuando los datos eran validos, una pagina que dice "ITEM NOT FOUND".

### Firmas de test mal escrito

**Strict mode violation.**

```
Error: strict mode violation: getByTestId('inventory-item-name')
resolved to 6 elements
```

Nunca es un bug del producto. Es un locator sin acotar.

En este caso fue exactamente eso: `inventory-item-name` existe 6 veces en el listado y 1 vez en la pagina de detalle. El agente uso el significado de la pagina de detalle sin acotar el locator, asi que en el listado matcheaba 6.

**Timeout en un elemento que si existe.**

```
Timeout 5000ms exceeded waiting for getByTestId('inventory-item-name')
```

Si abris el trace y el elemento esta ahi en el screenshot, el test leyo demasiado rapido. Falta una assertion que espere a que la pagina renderice.

**Pasa solo y falla en paralelo.**

Casi siempre estado compartido. En este proyecto, el carrito vive en localStorage: si un test no limpia `cart-contents`, el siguiente arranca con el carrito del anterior.

**El test asume datos que otro test creo.**

Lo mismo con otro nombre. Cada test tiene que crear lo que necesita.

## Los dos errores que causaron 7 de 9

En este caso, dos causas raiz explicaron casi todos los tests malos.

### Causa 1: leer la pagina antes de que renderice

```js
// MAL
await page.getByTestId('item-4-title-link').click();
const nombre = await page.getByTestId('inventory-item-name').textContent();
```

El click dispara una navegacion. La linea siguiente se ejecuta sin esperar a que la pagina nueva este lista. A veces funciona, a veces no.

```js
// BIEN
await page.getByTestId('item-4-title-link').click();
await expect(page.getByTestId('inventory-details-name')).toBeVisible();
const nombre = await page.getByTestId('inventory-details-name').textContent();
```

La assertion web-first actua como compuerta: espera y reintenta hasta que el elemento este, y recien ahi se lee.

**Por que la IA se equivoco:** escribio la assertion inmediatamente despues del click, asumiendo que navegar es sincronico. Es el error mas comun del codigo generado.

### Causa 2: locator sin acotar

```js
// MAL: matchea 6 elementos en el listado
await expect(page.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Backpack');

// BIEN: acotado al contenedor de la pagina de detalle
await expect(
  page.getByTestId('inventory-item-description').getByTestId('inventory-item-name')
).toHaveText('Sauce Labs Backpack');
```

**Por que la IA se equivoco:** el mismo `data-test` se usa en dos contextos distintos. La IA vio el nombre del atributo y asumio que era unico.

## El caso dificil: un test que falla bien pero igual esta roto

El noveno test malo aparecio despues de la ronda de arreglos, y es el mas interesante.

PROD-15 verifica que el precio del listado coincida con el que se cobra, para `visual_user`. El test fallaba, y fallaba por la razon correcta: los precios del listado son aleatorios, que es un defecto real.

Pero adentro tenia el mismo bug de timing de la Causa 1. La verificacion del precio en la pagina de detalle tiraba strict mode error, asi que **esa parte nunca llegaba a ejecutarse**.

Resultado: el test fallaba correctamente por un motivo, y silenciosamente no verificaba otro.

**La leccion:** que un test falle por la razon correcta no significa que este bien escrito. Un test puede fallar bien y estar parcialmente roto al mismo tiempo. Por eso la clasificacion no termina en "este fallo es real": hay que leer el test completo.

## El fix log

Por cada test que arreglas, una linea sobre por que la IA se equivoco. Formato:

| Test | Que estaba mal | Por que la IA se equivoco | Arreglo |
|------|---------------|--------------------------|---------|
| PROD-07 | Leia el nombre antes de que la pagina de detalle renderizara | Escribio la assertion justo despues del click, asumiendo navegacion sincronica | Assertion web-first sobre un elemento de la pagina de detalle antes de leer |
| PROD-13 | `inventory-item-name` matcheaba 6 elementos | El mismo data-test se usa en el listado y en el detalle | Acotar el locator al contenedor del detalle |

Ese documento no es burocracia. Es lo que te dice **que agregar al `CLAUDE.md`** para que el proximo lote de tests no repita el mismo error.

Si el fix log muestra tres veces "no espero a que renderice", la regla que falta en las instrucciones es: *despues de una navegacion, la primera linea siempre es una assertion sobre la pagina nueva*.

## Lo que nunca se toca

Los tests que fallan por defectos reales **se quedan fallando**.

No se arreglan, no se saltean con `.skip()`, no se debilita la assertion para que pase. Esos fallos son el producto del trabajo: son la prueba de que los bugs existen.

La tentacion de poner la suite en verde es fuerte, sobre todo si corre en CI. Pero una suite verde sobre una app rota no vale nada.

## Checklist por cada fallo

- [ ] Abri el trace y mire el screenshot del momento del fallo
- [ ] Lei el error completo, incluido el call log
- [ ] Hice los pasos a mano en el navegador
- [ ] Decidi: lo veria un usuario real? Si → bug. No → test malo
- [ ] Si es test malo: lo arregle y anote en una linea por que la IA se equivoco
- [ ] Si es bug: lo deje fallando y escribi el reporte
- [ ] Lei el test completo, no solo la linea que fallo