# 06. Date Pickers e iframes

Los date pickers son el componente que más dolor de cabeza da en automation. Hay dos tipos y, para empeorar, suelen vivir dentro de **iframes**, un contenedor que Playwright trata como si fuera otra página.

Basado en la Lecture 3.7 del PPTX.

## Los dos tipos de date fields

### 1. Native `<input type="date">`

Es un input HTML común. Chrome, Firefox y Safari le ponen cada uno su propio calendario, pero vos lo llenás como cualquier input:

```typescript
await page.getByLabel('Fecha de nacimiento').fill('2026-12-25');
```

**Siempre formato ISO (YYYY-MM-DD)**, no importa cómo lo muestre el browser.

### 2. Calendar widget (jQuery UI, Material, React DatePicker, etc.)

Un calendario custom hecho con `<div>`, `<a>`, `<table>`. Hay que:

1. Abrir el calendario (click en el input)
2. Navegar al mes correcto (click en Next/Prev varias veces)
3. Clickear el día

Mucho más complejo. Y encima suele estar dentro de un iframe.

## ¿Qué es un iframe?

Un iframe es una página HTML DENTRO de otra página. Como una ventana embebida. Playwright, por default, SOLO ve la página principal. Para interactuar con lo que está dentro del iframe, hay que usar `frameLocator()`.

Si tu test falla con "elemento no encontrado" pero vos lo ves clarísimo en la página, revisá si el elemento está dentro de un iframe.

**Para detectarlo:** click derecho sobre el elemento → Inspect. Si en el HTML ves un `<iframe>` por encima, el elemento está adentro.

## El sitio de práctica: jqueryui.com/datepicker

El calendario de jQuery UI está metido en un iframe (`<iframe class="demo-frame">`). Es un caso real de los que vas a encontrar en apps viejas.

## El prompt para Claude Code (clave: avisar del iframe)

Abrí Claude Code:

```bash
claude
```

Pegale:

```
En https://jqueryui.com/datepicker/ hay un input de fecha y un calendario tipo jQuery UI.
IMPORTANTE: el input y el calendario estan DENTRO de un <iframe class="demo-frame">.
Si no usas frameLocator, no vas a encontrar nada.

Escribí un test de Playwright en TypeScript que:

1. Vaya a https://jqueryui.com/datepicker/
2. Entre al iframe class="demo-frame"
3. Abra el calendario (click en #datepicker)
4. Haga click en "Next" hasta llegar a December 2026 (max 24 clicks por seguridad)
5. Clickee el dia 25 (usa exact: true porque 25 puede ser substring de 25, 52, 125)
6. Verifique que el input #datepicker tiene valor "12/25/2026"

Comparar mes y año como spans separados (.ui-datepicker-month y .ui-datepicker-year).

Guardalo en laboratorios/05-datepicker-jquery/datepicker.spec.ts
```

## El código esperado

```typescript
import { test, expect } from '@playwright/test';

test('pick Christmas 2026 on jQuery UI datepicker', async ({ page }) => {
  await page.goto('https://jqueryui.com/datepicker/');

  // frameLocator entra al iframe
  const frame = page.frameLocator('.demo-frame');

  // Abrir el calendario
  await frame.locator('#datepicker').click();

  // Locators del mes y año actual
  const month = frame.locator('.ui-datepicker-month');
  const year = frame.locator('.ui-datepicker-year');

  // Loop con limite de seguridad
  for (let i = 0; i < 24; i++) {
    const currentMonth = await month.innerText();
    const currentYear = await year.innerText();
    if (currentMonth === 'December' && currentYear === '2026') break;
    await frame.getByTitle('Next').click();
  }

  // Click en el dia. exact: true evita matchear 25 dentro de "25" (fecha previa)
  await frame.locator('.ui-datepicker-calendar')
             .getByRole('link', { name: '25', exact: true }).click();

  // Verificar el valor
  await expect(frame.locator('#datepicker')).toHaveValue('12/25/2026');
});
```

## Puntos clave del código

- **`frameLocator('.demo-frame')`**: entra al iframe. A partir de acá, TODO lo que buscamos lo buscamos dentro de ese iframe, no en la página principal.
- **Loop con límite**: si el calendario tuviera un bug y nunca llegara a December 2026, el test no se cuelga infinito. Falla al intento 24. Siempre poné un límite en loops.
- **`exact: true` en el día**: sin esto, Playwright puede matchear "25" dentro de "125" o "251". Pequeño detalle, gran bug.

## Correrlo

Salí de Claude Code y:

```bash
npx playwright test laboratorios/05-datepicker-jquery/datepicker.spec.ts --project=chromium --headed
```

Correlo con `--headed` la primera vez para ver el calendario abrirse y los clicks de "Next". Es la parte más visual del módulo.

## Reto

Pedile a Claude Code un test que elija una fecha PASADA (ej: 15 March 2025):

```
Modifica el test para elegir el 15 de Marzo de 2025. Como es una fecha pasada,
el calendario arranca mas adelante y hay que ir hacia ATRAS. Hace que el test
compare la fecha actual con la target y elija Next o Prev automaticamente.
```

## Checklist

- [ ] Entendés qué es un iframe y por qué Playwright no lo ve por default
- [ ] Usaste `frameLocator()` para entrar al iframe
- [ ] El loop tiene límite de seguridad
- [ ] Pusiste `exact: true` en el día

## Siguiente

[07. Tablas](./07-tablas.md): el componente más común en apps empresariales. Filas, columnas, data-driven.