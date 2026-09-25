# Playwright vs otras herramientas

Comparación honesta de Playwright frente a las herramientas más populares del mercado.

## Tabla resumen

| Feature | Playwright | Cypress | Selenium | Puppeteer |
|---|---|---|---|---|
| Velocidad | Muy alta | Alta | Media | Alta |
| Flakiness | Muy baja | Media | Alta | Baja |
| Multi-lenguaje | 5 lenguajes | Solo JS/TS | Muchos | Solo JS/TS |
| Multi-browser | 3 motores | Limitado | Todos | Solo Chromium |
| Auto-wait | Sí | Sí | No | Parcial |
| Multi-tab | Nativo | Complicado | Manual | Nativo |
| Debug visual | Trace Viewer | Time Travel | Limitado | Limitado |
| Comunidad | Grande y creciendo | Grande | Enorme | Media |

## Playwright vs Selenium

Selenium es el estándar histórico. Existe desde 2004.

**Selenium tiene a favor:**
- 20 años de comunidad acumulada
- Soporte de casi cualquier navegador, incluso viejos
- Grid distribuido muy maduro
- Integraciones con casi cualquier herramienta legacy

**Playwright tiene a favor:**
- Mucho más rápido
- Mucho menos flaky
- API moderna y limpia
- Todo incluido, no necesita librerías extra
- Mejor manejo de apps modernas (SPAs, iframes, popups)

**¿Cuál elegir?**
- Proyecto nuevo, app moderna: Playwright, sin dudas
- Proyecto con inversión grande en Selenium: seguir con Selenium
- Necesitás testear IE11 o navegadores muy viejos: Selenium

## Playwright vs Cypress

Cypress es el "rival directo" moderno de Playwright.

**Cypress tiene a favor:**
- Interfaz de usuario muy pulida
- Time Travel (ver estado del DOM en cada paso) muy visual
- Muy popular en el mundo del frontend

**Playwright tiene a favor:**
- Multi-navegador de verdad (Cypress tiene soporte limitado en Firefox y WebKit)
- Multi-lenguaje (Cypress es solo JavaScript / TypeScript)
- Multi-tab y multi-window (Cypress no puede)
- Multi-origen sin problemas (Cypress tiene limitaciones fuertes)
- Más rápido en general
- Trace Viewer más completo que Time Travel

**¿Cuál elegir?**
- App simple, un solo navegador, un equipo de frontend contento con Cypress: Cypress
- Necesitás multi-navegador serio: Playwright
- Tu app tiene multi-tab, iframes complejos, o autenticación entre dominios: Playwright

## Playwright vs Puppeteer

Puppeteer es una librería de Google para controlar Chromium.

**Puppeteer tiene a favor:**
- Muy simple para tareas específicas de scraping
- Muy liviano

**Playwright tiene a favor:**
- Multi-navegador (Puppeteer es solo Chromium)
- Multi-lenguaje
- Framework de testing completo (Puppeteer es solo automatización de navegador)
- Web-first assertions
- Trace Viewer

Nota curiosa: los creadores originales de Puppeteer se fueron de Google a Microsoft y crearon Playwright. Playwright es básicamente "Puppeteer evolucionado" con todo lo que aprendieron.

**¿Cuál elegir?**
- Scraping web simple: Puppeteer o Playwright, ambos van bien
- Testing E2E: Playwright, sin dudas

## Conclusión

Para un QA que arranca en automation en 2026, Playwright es la mejor apuesta:

- Es la herramienta con más crecimiento
- La comunidad y las oportunidades laborales van en aumento
- Cubre casi todos los casos de uso modernos
- Es la elección recomendada de empresas líderes

Si aprendés Playwright bien, aprender otra herramienta después es fácil, porque los conceptos son transferibles.