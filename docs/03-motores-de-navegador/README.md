# Módulo 3: Motores de navegador

Cuando Playwright corre un test, no lo hace en un solo navegador. Por default lo corre en los tres motores principales del mundo. Este módulo explica qué son esos motores, por qué importa testear en los tres, y cómo elegir cuál usar en cada momento.

## Contenido del módulo

1. [¿Qué son los motores de navegador?](./que-son-los-motores.md)
   - Concepto de motor de renderizado
   - Por qué le importa a un QA

2. [Chromium, Firefox y WebKit](./chromium-firefox-webkit.md)
   - Qué es cada uno
   - Qué navegadores del mundo real usan cada motor
   - Diferencias prácticas que un QA se encuentra

3. [Correr en navegadores específicos](./correr-en-navegadores-especificos.md)
   - Cómo elegir un solo motor para debug rápido
   - Configuración en `playwright.config.ts`
   - Estrategias de ejecución para desarrollo vs CI

## Objetivos de aprendizaje

Al terminar este módulo vas a poder:

- Explicar qué es un motor de navegador y por qué existen varios
- Identificar los tres motores que Playwright soporta y sus navegadores derivados
- Elegir cuándo correr en los tres motores y cuándo en uno solo
- Modificar la configuración de Playwright para adaptarla a tu flujo

## Duración estimada

20 a 30 minutos.