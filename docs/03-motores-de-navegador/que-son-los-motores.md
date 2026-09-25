# ¿Qué son los motores de navegador?

Un navegador (Chrome, Firefox, Safari, Edge, Brave, Opera, etc.) tiene por dentro un componente clave que se llama **motor de renderizado**.

## ¿Qué hace el motor?

El motor es el software que:

- Interpreta el código HTML de la página
- Aplica los estilos CSS
- Ejecuta el código JavaScript
- Dibuja los píxeles en la pantalla
- Maneja las interacciones del usuario (clicks, scrolls, formularios)

Cuando abrís una web, el motor traduce el código que envía el servidor en la interfaz visual que ves.

## Solo hay 3 motores principales en el mundo

Aunque existen decenas de navegadores, todos por dentro usan uno de estos tres motores:

| Motor | Creado por | Navegadores que lo usan |
|---|---|---|
| **Blink (Chromium)** | Google | Chrome, Edge, Brave, Opera, Vivaldi, Arc |
| **Gecko** | Mozilla | Firefox y derivados |
| **WebKit** | Apple | Safari (Mac, iPhone, iPad) |

Es como los autos: hay muchas marcas, pero pocos fabricantes de motores.

## ¿Por qué esto le importa a un QA?

Porque **una misma página web puede verse o comportarse distinto según el motor**. Ejemplos típicos que se ven en el trabajo real:

- Un CSS que se ve perfecto en Chrome pero se rompe en Safari
- Un formulario que valida bien en Firefox pero no en Chrome
- Una animación que va suave en Chromium pero lenta en WebKit
- Fechas o zonas horarias que se interpretan distinto entre motores
- APIs modernas de JavaScript soportadas en un motor y no en otro
- Comportamientos de foco (focus) diferentes entre navegadores

Si testeás solo en Chrome, tu app puede estar rota para los usuarios de iPhone (que usan Safari, o sea WebKit) y no te enterás hasta que se quejan.

## Cuota de mercado aproximada (2026)

- Chromium (Chrome + Edge + Brave + otros): ~65%
- WebKit (Safari): ~20%
- Gecko (Firefox): ~3%
- Otros: el resto

Testear en Chromium y WebKit ya cubre ~85% de los usuarios. Sumar Firefox lleva la cobertura a ~88%. Por eso Playwright soporta esos tres.

## ¿Y Internet Explorer?

IE está oficialmente descontinuado. Su reemplazo (Edge Legacy) también. Los navegadores modernos abandonaron los motores viejos.

**Playwright no soporta Internet Explorer.** Si tu app tiene que testearse en IE11 por requerimientos legacy, tenés que usar Selenium.

## Resumen

- Los motores son el "cerebro" del navegador
- Hay tres motores principales: Chromium/Blink, Firefox/Gecko y WebKit
- Testear en los tres es una práctica profesional porque las apps pueden fallar distinto en cada uno
- Playwright corre en los tres con una sola línea de código