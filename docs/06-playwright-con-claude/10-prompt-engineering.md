# 10. Prompt Engineering para Testing con Playwright

## Que es Prompt Engineering

Es el arte de escribirle instrucciones claras a Claude Code para que genere exactamente el test que necesitas. Un buen prompt genera un test que funciona a la primera. Un mal prompt genera codigo que tenes que corregir a mano.

---

## 1. Zero Shot - Prompt directo sin ejemplo

Le das una instruccion simple sin contexto adicional. Funciona para cosas comunes.

**Cuando usarlo:** para flujos estandar que cualquier sitio tiene (login, navegacion, formularios basicos).

**Prompt:**
```
Genera un test de Playwright en TypeScript que haga login en https://www.saucedemo.com
con usuario "standard_user" y password "secret_sauce", y verifique que llega a la
pagina de productos.
```

**Resultado esperado:** Claude genera un test funcional porque saucedemo es un sitio conocido y el flujo de login es estandar.

**Limitacion:** si el sitio tiene una estructura rara o componentes custom, Claude puede adivinar mal los locators porque no tiene contexto del HTML real.

---

## 2. Few Shot - Prompt con ejemplo incluido

Le das uno o dos ejemplos de tests que ya funcionan, y le pedis que genere uno similar. Claude entiende el patron y lo replica.

**Cuando usarlo:** cuando queres que el nuevo test siga el mismo estilo, estructura o convenciones que los que ya tenes.

**Prompt:**
```
Aca tenes un test que ya funciona para login en saucedemo:

import { test, expect } from '@playwright/test';

test('login exitoso', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory/);
});

Ahora genera un test similar que verifique que el usuario "locked_out_user"
con password "secret_sauce" muestra un mensaje de error al intentar hacer login.
Usa el mismo estilo y los mismos locators.
```

**Por que funciona mejor:** Claude no tiene que adivinar la estructura del sitio ni tu estilo de codigo. Copia el patron y lo adapta.

---

## 3. Advanced - Metodo de 4 pasos (Capture > Prompt > Verify > Harden)

Es el metodo mas confiable. Le das a Claude el HTML real del sitio para que no adivine nada.

### Paso 1: Capture (Capturar el HTML)

1. Abri el sitio en Chrome
2. Click derecho sobre el elemento que queres testear
3. Click en "Inspect" (se abre DevTools)
4. Click derecho sobre el tag HTML resaltado
5. Copy > Copy outerHTML

### Paso 2: Prompt (Armar el prompt con contexto)

```
Genera un test de Playwright en TypeScript para agregar un producto al carrito.

URL: https://www.saucedemo.com/inventory.html
Sitio: e-commerce de practica, ya logueado

HTML del producto:
<div class="inventory_item" data-test="inventory-item">
  <div class="inventory_item_img">
    <a href="#" data-test="item-4-img-link">
      <img src="/static/media/sauce-backpack.jpg" alt="Sauce Labs Backpack">
    </a>
  </div>
  <div class="inventory_item_description">
    <div class="inventory_item_label">
      <a href="#" data-test="item-4-title-link">
        <div data-test="inventory-item-name">Sauce Labs Backpack</div>
      </a>
      <div data-test="inventory-item-desc">carry.all" /></div>
    </div>
    <div class="pricebar">
      <div data-test="inventory-item-price">$29.99</div>
      <button data-test="add-to-cart-sauce-labs-backpack">Add to cart</button>
    </div>
  </div>
</div>

HTML del carrito (header):
<a class="shopping_cart_link" data-test="shopping-cart-link">
  <span class="shopping_cart_badge" data-test="shopping-cart-badge">1</span>
</a>

Requisitos:
- Usar getByTestId como locator principal (el sitio usa data-test)
- Verificar que el badge del carrito muestra "1" despues de agregar
- Verificar que el boton cambia de "Add to cart" a "Remove"
```

### Paso 3: Verify (Correr el test)

```bash
npx playwright test agregar-producto.spec.ts --headed
```

Si falla, copias el error y se lo pegas a Claude: "Este test falla con este error: (error). Corregilo."

### Paso 4: Harden (Endurecer el test)

Una vez que pasa, pedile a Claude que lo haga mas robusto:

```
El test pasa. Ahora:
- Agrega un segundo producto y verifica que el badge muestra "2"
- Verifica que ambos productos aparecen en la pagina del carrito
- Agrega manejo de timeout por si el sitio esta lento
```

---

## 4. Patrones de prompts por situacion

### Login con multiples escenarios

```
Genera tests de Playwright para el login de https://www.saucedemo.com
con estos escenarios:
1. Login exitoso con standard_user / secret_sauce -> llega a /inventory.html
2. Login con locked_out_user / secret_sauce -> muestra error "locked out"
3. Login con campos vacios -> muestra error de validacion
4. Login con password incorrecta -> muestra error

Usa getByPlaceholder para los inputs y getByRole para el boton.
Agrupa todo con test.describe('Login').
```

### CRUD (crear, leer, actualizar, eliminar)

```
Genera un test de Playwright que:
1. Haga login en (URL) con (credenciales)
2. Cree un nuevo (registro/item/usuario) con estos datos: (datos)
3. Verifique que aparece en la lista
4. Lo edite cambiando (campo) a (nuevo valor)
5. Verifique el cambio
6. Lo elimine
7. Verifique que ya no aparece

HTML del formulario de creacion:
(pegar outerHTML)

HTML de la tabla/lista:
(pegar outerHTML)
```

### Tablas con datos dinamicos

```
Genera un test de Playwright que:
1. Navegue a (URL)
2. Encuentre la fila que contiene "(texto unico)" en la tabla
3. Lea el valor de la columna "(nombre columna)" de esa fila
4. Verifique que el valor es "(esperado)"

HTML de la tabla:
(pegar outerHTML del <table>)

Usa .filter({ hasText }) para encontrar la fila y getByRole('cell') para las celdas.
```

### Formulario con validaciones

```
Genera tests de Playwright para el formulario de (URL):
1. Submit con todos los campos llenos -> exito
2. Submit con email invalido -> error "Invalid email"
3. Submit sin campos requeridos -> error por cada campo

HTML del formulario:
(pegar outerHTML)

Usa getByLabel para los campos y toBeVisible/toHaveText para los errores.
```

### Flujo completo (end-to-end)

```
Genera un test end-to-end de Playwright que haga todo el flujo de compra:
1. Login
2. Agregar 2 productos al carrito
3. Ir al carrito
4. Checkout: llenar nombre, apellido, codigo postal
5. Verificar el total
6. Confirmar la compra
7. Verificar el mensaje de confirmacion

URL: https://www.saucedemo.com
Credenciales: standard_user / secret_sauce

Para cada paso, usa los locators mas estables (getByTestId si hay data-test,
getByRole si no).
```

---

## 5. Errores comunes en prompts

### Prompt vago (malo)

```
Testea la pagina de login
```

Problema: Claude no sabe que sitio, que credenciales, que verificar, ni que locators usar. Va a inventar todo.

### Prompt sin HTML (regular)

```
Genera un test que agregue un producto al carrito en saucedemo
```

Funciona porque saucedemo es conocido, pero en un sitio de tu empresa Claude va a adivinar mal los locators.

### Prompt completo (bueno)

```
Genera un test de Playwright en TypeScript que agregue el producto
"Sauce Labs Backpack" al carrito en https://www.saucedemo.com/inventory.html.

El sitio usa data-test como atributo de test. El boton de agregar tiene
data-test="add-to-cart-sauce-labs-backpack". El badge del carrito tiene
data-test="shopping-cart-badge".

Verifica que el badge muestra "1" despues de agregar.
```

### Regla general

Mientras mas contexto le des (URL, HTML, credenciales, que verificar, que locators usar), mejor es el resultado. El prompt ideal tiene:

1. **Que hacer** (la accion)
2. **Donde** (URL)
3. **Con que** (credenciales, datos)
4. **Como** (HTML, locators preferidos)
5. **Que verificar** (assertions esperadas)

---

## 6. Template master reutilizable

Copia este template y completalo cada vez que necesites un test nuevo:

```
Genera un test de Playwright en [TypeScript/JavaScript] para [SITIO].

URL: [url completa]
Contexto: [que es el sitio, en que estado esta (logueado, pagina especifica)]

Flujo a testear:
1. [paso 1]
2. [paso 2]
3. [paso 3]

HTML relevante:
[pegar outerHTML de los elementos clave]

Verificaciones:
- [que debe pasar al final]
- [que valores verificar]

Restricciones:
- Usar [getByRole/getByTestId/getByLabel] como locator principal
- [timeout especial si el sitio es lento]
- [agrupar con test.describe si son varios escenarios]
```

---

## Resumen

| Nivel | Cuando usarlo | Calidad del resultado |
|-------|--------------|----------------------|
| Zero Shot | Flujos comunes en sitios conocidos | Funciona ~60% de las veces |
| Few Shot | Cuando ya tenes tests de referencia | Funciona ~80% de las veces |
| Advanced (4 pasos) | Siempre que puedas | Funciona ~95% de las veces |

La diferencia entre un QA que usa IA bien y uno que no, esta en la calidad de los prompts. El codigo lo genera Claude, pero la estrategia de testing sigue siendo tuya.