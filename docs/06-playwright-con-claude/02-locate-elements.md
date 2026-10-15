# 02. Locate Elements on Web Applications

En el archivo anterior le pedimos a Claude un test completo. Acá vamos un paso antes: le pedimos un **mapa de locators** para toda una página. Es útil cuando estás explorando una app nueva o cuando el formulario tiene muchos campos y querés verlos todos juntos antes de armar el test.

Basado en la Lecture 3.3 del PPTX.

## Cómo Playwright "ve" una página

Cada elemento del DOM tiene dos cosas que importan para Playwright:

- **Rol**: qué ES el elemento (button, link, textbox, checkbox, heading, searchbox)
- **Accessible name**: el nombre que un lector de pantalla leería. Suele ser el label, el texto del botón, o un `aria-label`.

`getByRole('button', { name: 'Login' })` significa literalmente "el botón que un usuario llamaría Login". Si decís lo que ves en pantalla, el locator suele ser estable aunque los developers cambien las clases CSS.

**Para ver el rol de un elemento:** Chrome DevTools, pestaña Elements, panel "Accessibility" (al lado del inspector de estilos). Ahí ves rol y accessible name tal cual los lee Playwright.

## El sitio de práctica

[the-internet.herokuapp.com/login](https://the-internet.herokuapp.com/login)

Credenciales:
- Usuario: `tomsmith`
- Password: `SuperSecretPassword!`

El HTML del formulario es simple pero tiene algunas trampas:

```html
<form name="login" id="login" action="/authenticate" method="post">
  <div class="row">
    <label for="username">Username</label>
    <input type="text" name="username" id="username">
  </div>
  <div class="row">
    <label for="password">Password</label>
    <input type="password" name="password" id="password">
  </div>
  <button class="radius" type="submit">
    <i class="fa fa-2x fa-sign-in"> Login</i>
  </button>
</form>
```

Fijate que:
- Los inputs tienen `label` linkeado con `for=`, así que `getByLabel` va a funcionar
- El botón tiene su texto DENTRO de un `<i>` (icon tag), pero el accessible name sigue siendo "Login"

## El prompt para pedirle el mapa completo

Antes del test, vamos a pedirle a Claude una tabla con todos los locators de esta página. Esto es útil para planificar antes de automatizar.

Abrí Claude Code:

```bash
claude
```

Pegale:

```
Para cada elemento interactivo del siguiente HTML, dame una tabla con:
elemento | mejor locator en Playwright | fallback | por qué

HTML:
[pega acá el HTML del form del login de arriba]

Después, escribí un test de Playwright en TypeScript que:
1. Vaya a https://the-internet.herokuapp.com/login
2. Loguee con tomsmith / SuperSecretPassword!
3. Verifique que aparece el mensaje verde "You logged into a secure area!"

Guardalo en laboratorios/03-locate-elements-herokuapp/locate-elements.spec.ts
```

## La tabla que debería devolverte

| Elemento | Mejor locator | Fallback | Por qué |
|---|---|---|---|
| Username | `getByLabel('Username')` | `page.locator('#username')` | El label está linkeado con `for="username"` |
| Password | `getByLabel('Password')` | `page.locator('#password')` | Igual, label linkeado |
| Login | `getByRole('button', { name: 'Login' })` | `page.locator('button[type="submit"]')` | El accessible name viene del texto interno |
| Mensaje de éxito | `page.locator('#flash')` | `getByText('You logged into a secure area!')` | Aparece solo después del login |

## El código que Claude debería generar

```typescript
import { test, expect } from '@playwright/test';

test('login con usuario valido', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/login');

  await page.getByLabel('Username').fill('tomsmith');
  await page.getByLabel('Password').fill('SuperSecretPassword!');
  await page.getByRole('button', { name: 'Login' }).click();

  // Usamos toContainText porque el #flash tambien contiene un link
  // de cerrar la notificacion (×), que no queremos matchear.
  await expect(page.locator('#flash'))
    .toContainText('You logged into a secure area!');

  // Doble verificacion: si aparece el link "Logout" estamos realmente adentro.
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
});
```

## Correrlo

```bash
npx playwright test laboratorios/03-locate-elements-herokuapp/locate-elements.spec.ts --headed --project=chromium
```

## Verificar cada locator con UI Mode

Esta es la parte "Verify" del método de 4 pasos. Corré el test en modo UI:

```bash
npx playwright test --ui
```

En la interfaz:

1. Seleccioná el test y presioná el botón Run
2. Al terminar, hacé click en "Pick locator" en la parte de abajo del snapshot
3. Pegá cada locator de la tabla que te dio Claude
4. Mirá cuántos elementos se iluminan: 1 = perfecto, 0 o varios = volvé a Claude con el error

Esta es la receta profesional. Nunca confíes en el locator sin verificarlo.

## Reto

Pedile a Claude Code que agregue un test negativo: loguear con credenciales inválidas (ej: `wrong_user` / `wrong_pass`) y verificar que aparece el mensaje de error (el mismo `#flash` pero con otro texto, probablemente "Your username is invalid!").

## Checklist antes de pasar al siguiente archivo

- [ ] Claude Code generó el mapa de locators como tabla
- [ ] El test positivo pasa
- [ ] El test negativo pasa
- [ ] Verificaste al menos uno de los locators con UI Mode

## Siguiente

[03. Tips y Tricks](./03-tips-y-tricks.md): los 3 errores más comunes y los 6 hábitos que mejoran drásticamente los locators que te da Claude.