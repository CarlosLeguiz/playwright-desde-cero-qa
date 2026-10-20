# 5. Page Object Model: cuando conviene y cuando no

Es el patron que te van a preguntar en cualquier entrevista de QA automation. Y es el que mas se aplica mal, porque se ensena como "la forma correcta" sin decir cuando deja de serlo.

## El problema que resuelve

Sin POM, los locators viven adentro de los tests:

```js
test('AUTH-01: login valido', async ({ page }) => {
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory/);
});
```

Esas tres lineas estan repetidas en 20 tests. Si el dev cambia el placeholder de "Username" a "User", corregis 20 archivos.

## La solucion

Una clase por pantalla, que guarda los locators y las acciones:

```js
// pages/LoginPage.js
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usuario = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.botonLogin = page.getByRole('button', { name: 'Login' });
    this.mensajeError = page.getByTestId('error');
  }

  async ir() {
    await this.page.goto('/');
  }

  async login(usuario, password) {
    await this.usuario.fill(usuario);
    await this.password.fill(password);
    await this.botonLogin.click();
  }

  async textoDelError() {
    return this.mensajeError.textContent();
  }
}
```

Y el test queda:

```js
test('AUTH-01: login valido', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.ir();
  await loginPage.login('standard_user', 'secret_sauce');
  await expect(page).toHaveURL(/inventory/);
});
```

Ahora el locator esta en un solo lugar.

## Las dos reglas que casi todos rompen

### Regla 1: las assertions van en el test, no en el page object

```js
// MAL: la clase decide si esta bien
class LoginPage {
  async verificarLoginExitoso() {
    await expect(this.page).toHaveURL(/inventory/);
  }
}

// BIEN: la clase devuelve estado, el test juzga
class LoginPage {
  async urlActual() {
    return this.page.url();
  }
}
```

Por que importa: si la assertion vive adentro de la clase, dos tests que necesitan verificar cosas distintas sobre la misma pantalla terminan peleando por el mismo metodo. Y leyendo el test no sabes que verifica.

El page object responde **que hay en la pantalla**. El test decide **si eso esta bien**.

### Regla 2: no queda ningun locator suelto en el test

Si en tu spec todavia hay un `page.getByRole(...)`, ese locator se te escapo. El punto del patron es que haya un solo lugar donde buscarlos.

## El resultado de este caso

Se refactorizaron 87 tests a 7 clases: `LoginPage`, `InventoryPage`, `ProductDetailsPage`, `CartPage`, `CheckoutInfoPage`, `CheckoutOverviewPage`, `CheckoutCompletePage`.

Verificacion despues del refactor: 57 pasan, 30 fallan, los mismos tests y con el mismo mensaje de error. Nada se debilito para que el refactor se viera limpio.

**Ese chequeo es obligatorio.** Un refactor que cambia que tests pasan no es un refactor, es una reescritura. Si despues de mover codigo tenes 58 verdes en vez de 57, rompiste una assertion sin darte cuenta.

## El veredicto honesto

Y aca viene la parte que no se ensena: **el refactor fue parcialmente util y estuvo sobreingenierado**.

**Lo que mejoro de verdad:** login y checkout-informacion, que se repetian en muchos tests. Un cambio de locator ahi ahora cuesta una edicion en vez de veinte.

**Lo que no:** varias clases envuelven pantallas que tocan dos o tres tests. Para esas, la clase es puro costo: un archivo mas que abrir para entender que hace el test.

La forma correcta para una suite de este tamano habria sido mas chica:

- Una clase de login
- Una de inventario
- Un componente para el header compartido
- Un componente de lista de items, reutilizado por carrito y overview
- Un modulo de helpers de checkout, sin clase

Mismo ahorro, la mitad del codigo.

## La regla general

El Page Object Model rinde **en proporcion a cuantos tests comparten una pantalla**.

| Situacion | Conviene? |
|-----------|-----------|
| 20 tests pasan por el login | Si, claramente |
| 3 tests tocan la pagina de confirmacion | No, es un archivo extra para nada |
| Una suite de 10 tests en total | No, el patron agrega mas complejidad de la que ahorra |
| Una suite de 200 tests sobre 8 pantallas | Si, sin discusion |

Aplicarlo uniformemente a todas las pantallas, sin importar cuanto se usa cada una, agrega estructura sin agregar valor.

## La pregunta para decidir

Antes de crear una clase para una pantalla:

> Cuantos tests tocan esta pantalla, y cuantos locators comparten?

- Mas de cinco tests, o mas de tres locators compartidos → clase
- Menos → una funcion helper, o dejarlo en el spec

## Por que importa en una entrevista

Si te preguntan "que es el Page Object Model", la respuesta completa tiene tres partes:

1. **Que es**: los locators y acciones viven en clases por pantalla, los tests solo tienen pasos y assertions.
2. **Que resuelve**: un cambio de locator cuesta una edicion en vez de N.
3. **Cuando no usarlo**: en suites chicas, o para pantallas que tocan pocos tests, agrega mas de lo que ahorra.

La tercera parte es la que casi nadie dice, y es la que muestra que lo aplicaste y no solo lo leiste.

## Checklist del refactor

- [ ] Una clase por pantalla, no por funcionalidad
- [ ] Los locators viven en el constructor de la clase
- [ ] Las assertions quedaron en los specs
- [ ] No quedo ningun locator suelto en los specs
- [ ] Corri la suite despues: mismos tests pasando y fallando que antes
- [ ] Revise si cada clase se justifica por cuantos tests la usan