# Ventajas y desventajas de Playwright

Ser honesto con las limitaciones es una skill de QA. Ninguna herramienta es perfecta para todo.

## Ventajas

### Velocidad

Es más rápido que Selenium porque no usa el protocolo WebDriver. Habla directamente con el navegador usando el Chrome DevTools Protocol y equivalentes en Firefox y WebKit.

En la práctica: una suite que en Selenium tardaba 15 minutos, en Playwright puede tardar 4.

### Menos flaky (menos tests que fallan sin razón)

El auto-wait resuelve la mayoría de los problemas de sincronización que hacen fallar tests intermitentemente. Los tests que hoy pasan y mañana no (sin cambios en el código), casi no existen en Playwright bien escrito.

### Multi-tab y multi-window nativo

Selenium necesita workarounds para manejar pestañas nuevas. Playwright lo maneja como parte del core.

### API moderna

Usa async / await, no callbacks anidados. El código queda limpio y legible incluso para alguien que arranca en programación.

### Trae todo incluido

No necesitás integrar 5 librerías para tener:

- Test runner
- Assertions
- Reportes HTML
- Screenshots automáticos
- Videos de la ejecución
- Traces para debug

Todo viene con la instalación base.

### Comunidad y respaldo

Microsoft respalda el proyecto. Hay actualizaciones constantes, documentación excelente, y la comunidad crece rápido. En 2026 supera los 32 millones de descargas semanales en NPM.

### Multi-lenguaje

Podés usar el mismo framework en TypeScript, Python, Java o .NET. Tu equipo puede elegir el que mejor le venga.

## Desventajas

### Curva de aprendizaje si venís de Selenium

El paradigma async es diferente. Si tenés años de Selenium en la cabeza, hay que desaprender algunas cosas.

### No testea apps nativas de mobile

Playwright solo prueba web (incluyendo mobile web en emuladores). Si necesitás testear una app nativa Android o iOS, tenés que usar Appium u otra herramienta.

### Menos maduro en integraciones legacy

Si tu empresa usa herramientas viejas de QA (algunos test management systems, viejos CI/CD específicos), la integración puede ser más manual que con Selenium. Esto mejora mes a mes.

### Comunidad más chica que Selenium

Selenium tiene 20 años de comunidad acumulada. Playwright tiene 6. Si buscás en Stack Overflow una pregunta bien específica, para Selenium hay más respuestas. Aunque la de Playwright crece rápido.

### Solo browsers modernos

No podés testear en Internet Explorer 11 ni en navegadores antiguos. Si tu app tiene que soportar navegadores legacy, Playwright no es la opción.

## Cuándo NO usar Playwright

- Necesitás testear una app nativa mobile
- Tu app tiene que soportar Internet Explorer o navegadores muy viejos
- Tu equipo ya tiene una inversión grande en Selenium y no hay motivación para migrar
- Necesitás testing de rendimiento pesado, mejor usar herramientas específicas como JMeter o k6

## Cuándo Playwright es la mejor opción

- Empezás un proyecto de automation nuevo
- Testeás una web moderna (SPA con React, Vue, Angular, o server-side rendering)
- Necesitás multi-navegador confiable
- Tenés flujos complejos con múltiples pestañas o iframes
- Testeás features con IA que requieren network interception
- Querés integrar bien con CI/CD moderno