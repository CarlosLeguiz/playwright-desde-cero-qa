// Lab 10 - Logout en saucedemo
// Run: npx playwright test laboratorios/10-logout-saucedemo/logout.spec.ts --project=chromium

import { test, expect } from '@playwright/test';

// Cada test arranca con su propio login: asi ninguno depende de que otro haya corrido antes.
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Los inputs no tienen <label> visible, solo placeholder: por eso getByPlaceholder y no getByLabel.
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory\.html/);
});

test('el boton Logout cierra la sesion y vuelve a la pantalla de login', async ({ page }) => {
  // El menu hamburguesa es un <button> con nombre accesible "Open Menu": getByRole es la primera opcion.
  await page.getByRole('button', { name: 'Open Menu' }).click();

  // Ojo: en el HTML Logout es un <a>, pero sin href, asi que el arbol de accesibilidad lo
  // expone como "button" y no como "link". El rol se saca del snapshot, no del tag.
  // No hace falta esperar la animacion del menu: el click espera solo a que sea clickeable.
  await page.getByRole('button', { name: 'Logout' }).click();

  // Dos verificaciones: la URL volvio a la raiz y el formulario de login esta visible.
  // Solo la URL no alcanza: podria redirigir a una pagina en blanco.
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});

test('despues del Logout no se puede volver al inventario sin loguearse', async ({ page }) => {
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

  // Esto es lo que realmente prueba que la sesion se borro: un logout que solo
  // redirige pero deja la cookie viva pasaria el test anterior y fallaria este.
  await page.goto('/inventory.html');

  // El mensaje de error no tiene rol ni label propio, pero si data-test="error":
  // getByTestId es mas estable que matchear el texto completo, que es largo y podria cambiar.
  await expect(page.getByTestId('error')).toContainText(
    "You can only access '/inventory.html' when you are logged in"
  );
  await expect(page).toHaveURL('/');
});
