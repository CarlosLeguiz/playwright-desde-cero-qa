// Lab 12 - automationexercise.com, Test Case 2: Login User with correct email and password
// Run: npx playwright test laboratorios/12-automationexercise/login-correcto.spec.ts --project=chromium

import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

// El baseURL del config apunta a saucedemo, asi que aca se usan URLs completas.
const SITIO = 'https://automationexercise.com';

// El Test Case 2 necesita una cuenta que ya exista y la borra al final.
// Si la cuenta fuera fija, el test solo podria correr una vez y no en paralelo
// (chromium y firefox se pisarian). Por eso cada test crea su propio usuario.
let usuario: { nombre: string; email: string; password: string };

test.beforeEach(async ({ page, request }) => {
  // El sitio muestra un anuncio de Google a pantalla completa (#google_vignette)
  // que intercepta clicks y deja la pagina aria-hidden. No es parte de lo que
  // se testea, asi que se bloquean los dominios de anuncios antes de navegar.
  await page.route(/googlesyndication\.com|doubleclick\.net|googleadservices\.com|adtrafficquality\.google/, (route) =>
    route.abort()
  );

  // randomUUID y no Date.now(): con --repeat-each dos copias del mismo test corren
  // en paralelo y pueden caer en el mismo milisegundo. Pasaba: la API respondia
  // "Email already exists!" y una copia borraba la cuenta que la otra estaba usando.
  usuario = {
    nombre: 'QA Lab12',
    email: `qa.lab12.${randomUUID()}@example.com`,
    password: 'Clave123',
  };

  // Crear la cuenta por la UI seria testear el registro (Test Case 1), no el login.
  // La API del sitio la crea en un request, sin depender de otro test.
  const respuesta = await request.post(`${SITIO}/api/createAccount`, {
    form: {
      name: usuario.nombre,
      email: usuario.email,
      password: usuario.password,
      title: 'Mr',
      birth_date: '1',
      birth_month: '1',
      birth_year: '1990',
      firstname: 'QA',
      lastname: 'Lab12',
      company: 'Lab',
      address1: 'Calle 123',
      address2: '',
      country: 'Canada',
      zipcode: '1000',
      state: 'BA',
      city: 'CABA',
      mobile_number: '1155555555',
    },
  });
  // Esta API responde HTTP 200 siempre: el resultado real esta en el body.
  // Se compara tambien el message para que, si falla, el error diga POR QUE.
  expect(await respuesta.json()).toMatchObject({ responseCode: 201, message: 'User created!' });
});

// Si el test falla antes de "Delete Account", la cuenta quedaria viva en el sitio.
// Si el test ya la borro, este DELETE responde "not found" y no pasa nada.
test.afterEach(async ({ request }) => {
  await request.delete(`${SITIO}/api/deleteAccount`, {
    form: { email: usuario.email, password: usuario.password },
  });
});

test('el login con email y password correctos muestra "Logged in as" y permite borrar la cuenta', async ({ page }) => {
  await page.goto(SITIO);
  // El titulo identifica la home sin depender del carrusel, que repite sus headings en cada slide.
  await expect(page).toHaveTitle('Automation Exercise');

  // El nombre accesible incluye un icono (" Signup / Login"), pero getByRole
  // matchea por substring por defecto, asi que alcanza con el texto visible.
  await page.getByRole('link', { name: 'Signup / Login' }).click();
  await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

  // En esta pagina hay DOS textbox "Email Address": el del login y el del signup.
  // Los <form> no tienen nombre accesible, asi que se acota al form que contiene
  // el boton "Login". Asi se desambigua por rol, sin .nth() ni clases.
  const formLogin = page.locator('form').filter({ has: page.getByRole('button', { name: 'Login', exact: true }) });
  await formLogin.getByRole('textbox', { name: 'Email Address' }).fill(usuario.email);
  await formLogin.getByRole('textbox', { name: 'Password' }).fill(usuario.password);
  await formLogin.getByRole('button', { name: 'Login', exact: true }).click();

  // Esta es la assertion que prueba el login: el header muestra el nombre del
  // usuario recien creado. Un login fallido deja el form con un mensaje de error.
  await expect(page.getByText(`Logged in as ${usuario.nombre}`)).toBeVisible();

  await page.getByRole('link', { name: 'Delete Account' }).click();

  // El caso dice 'ACCOUNT DELETED!' en mayusculas, pero eso es CSS (text-transform).
  // En el DOM, y en el nombre accesible, el texto es "Account Deleted!".
  await expect(page.getByRole('heading', { name: 'Account Deleted!' })).toBeVisible();
});
