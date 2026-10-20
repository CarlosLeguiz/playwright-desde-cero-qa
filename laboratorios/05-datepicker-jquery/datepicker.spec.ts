// Lab 05 - Datepicker de jQuery UI dentro de un iframe
// Run: npx playwright test laboratorios/05-datepicker-jquery/datepicker.spec.ts --project=chromium

import { test, expect } from '@playwright/test';

test('elegir el dia 15 de dentro de dos meses completa el input con la fecha en formato MM/DD/YYYY', async ({ page }) => {
  // La fecha objetivo se calcula desde hoy: una fecha fija (ej. 12/25/2026)
  // deja de funcionar el dia que pasa, porque "Next" ya no llega nunca.
  const hoy = new Date();
  const objetivo = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 15);
  const mesEnIngles = objetivo.toLocaleString('en-US', { month: 'long' });
  const anio = objetivo.getFullYear();
  const mm = String(objetivo.getMonth() + 1).padStart(2, '0');

  await page.goto('https://jqueryui.com/datepicker/');

  // page.locator() no entra en iframes: hay que pasar por frameLocator().
  // El iframe no tiene id, title ni nombre accesible, solo src y una clase.
  // El src dice QUE demo carga, la clase es solo estilo: por eso se filtra por src.
  const demo = page.frameLocator('iframe[src*="datepicker/default.html"]');

  // El input no tiene <label> ("Date:" es texto suelto) ni placeholder,
  // asi que getByLabel/getByPlaceholder no lo encuentran. Tiene id: CSS por id es valido.
  const input = demo.locator('#datepicker');
  await input.click();

  // El popup no tiene rol (es un div), pero si un id fijo que pone jQuery UI.
  const calendario = demo.locator('#ui-datepicker-div');
  await expect(calendario).toBeVisible();

  // "Next" es un <a> sin href: no tiene rol de link ni de button, pero si title="Next".
  // getByTitle es semantico y no depende de las clases ui-* del widget.
  await calendario.getByTitle('Next').click();
  await calendario.getByTitle('Next').click();

  // Verificar el encabezado antes de elegir el dia: si la navegacion fallo,
  // el error dice "estaba en el mes equivocado" y no "el input tiene otra fecha".
  await expect(calendario).toContainText(`${mesEnIngles} ${anio}`);

  // Los dias son links con el numero como nombre. exact: true evita que "15"
  // matchee por substring con otros dias (sin exact, "1" matchearia "10", "11", ...).
  await calendario.getByRole('link', { name: '15', exact: true }).click();

  await expect(input).toHaveValue(`${mm}/15/${anio}`);
  // Al elegir una fecha el widget se cierra solo: si quedara abierto, algo se rompio.
  await expect(calendario).toBeHidden();
});
