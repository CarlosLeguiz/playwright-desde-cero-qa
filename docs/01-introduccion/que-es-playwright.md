# ¿Qué es Playwright?

Playwright es un framework de automation testing open source creado por Microsoft. Sirve para automatizar tests end-to-end (E2E) sobre aplicaciones web.

Fue lanzado en 2020 y hoy es uno de los frameworks más usados del mundo para testing E2E, adoptado por empresas como VS Code, Disney+, Adobe y muchas más.

## ¿Qué significa "end-to-end"?

Un test end-to-end simula un usuario real usando la aplicación completa, desde el navegador, no testeando pedacitos de código aislados.

Ejemplo: en vez de testear que una función `calcularTotal()` devuelva el número correcto, un test E2E hace lo que haría un usuario:

1. Abrir el navegador
2. Ir a la web del carrito de compras
3. Agregar productos
4. Ir al checkout
5. Verificar que el total mostrado sea el correcto

Es más lento que un test unitario, pero prueba el sistema completo tal como lo usa un cliente.

## Los tres pilares que hacen a Playwright popular

### 1. Multi-navegador

Un solo test corre en los tres motores principales de navegador:

- Chromium (Chrome, Edge, Brave)
- Firefox
- WebKit (Safari)

Esto es importante porque una app web puede comportarse distinto en cada motor.

### 2. Multi-lenguaje

Podés escribir tus tests en:

- JavaScript / TypeScript
- Python
- Java
- .NET (C#)

En este material usamos TypeScript, que es el lenguaje con mejor soporte y más ejemplos en la comunidad.

### 3. Auto-wait inteligente

En herramientas más viejas (como Selenium), había que agregar `sleep(3)` para esperar que un elemento estuviera listo. Eso hace tests lentos y frágiles.

Playwright espera automáticamente a que cada elemento esté visible, habilitado y listo para interactuar. Vos escribís la acción, él se encarga de esperar lo justo.

## ¿Para qué sirve Playwright en el mundo real?

- Automatizar regresiones (correr cientos de tests en minutos antes de cada deploy)
- Testear flujos críticos (login, pagos, checkout)
- Validar que una app funcione en distintos navegadores y dispositivos
- Testear aplicaciones con IA (chatbots, generadores de contenido)
- Interceptar y mockear llamadas de red para casos difíciles de reproducir manualmente

## ¿Reemplaza al QA manual?

No. Automation y QA manual son complementarios:

- El testing manual explora, encuentra bugs inesperados, valida UX
- El testing automatizado ejecuta rápido los tests conocidos y repetitivos

Un QA que sabe hacer las dos cosas es mucho más valioso que uno que solo hace una.