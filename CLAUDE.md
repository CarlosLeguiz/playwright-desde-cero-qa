# Convenciones del proyecto

Repo de aprendizaje de Playwright. Material en espanol para QA que vienen de testing manual.

## Estructura

- docs/ - teoria en espanol, numerada por modulo
- laboratorios/ - tests ejecutables, uno por concepto
- playwright.config.js - config principal

## Lenguaje

- Modulos 1-5: JavaScript (.spec.js)
- Modulo 6 en adelante: TypeScript (.spec.ts)
- El config soporta ambos via testMatch

## Prioridad de locators

1. getByRole
2. getByLabel
3. getByPlaceholder
4. getByText
5. getByTestId
6. CSS solo con id, nunca con clases generadas
7. XPath: no usar

## Reglas

- Nunca waitForTimeout. Usar assertions web-first.
- Cada test es independiente.
- Para elementos repetidos, usar .filter({ hasText }) antes que .nth().
- Nombres de tests en espanol, descriptivos de QUE se verifica.

## Sitios de practica

- saucedemo.com (usa data-test, no data-testid)
- the-internet.herokuapp.com (lento, necesita retries)
- demoqa.com (dropdowns custom de React)
- jqueryui.com/datepicker (iframes)

## Config

- testIdAttribute: 'data-test'
- baseURL: 'https://www.saucedemo.com'
- Projects: chromium, firefox, webkit, chrome

## Comentarios

Los tests son material didactico. Comentar el POR QUE de cada decision de locator,
no el QUE hace la linea.