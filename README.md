# Playwright desde cero para QA

Aprendiendo test automation con Playwright desde QA manual, en español.

Este repositorio documenta mi proceso de aprendizaje de Playwright arrancando sin experiencia previa en automation. Sirve como material de estudio para cualquier persona que venga de QA manual y quiera dar el salto a automatización.

## ¿Qué vas a encontrar acá?

- **Teoría explicada en español**, con foco en QA sin experiencia previa en programación
- **Ejemplos de código ejecutables** que podés correr en tu máquina
- **Ejercicios prácticos** para consolidar cada concepto
- **Un recorrido progresivo**, de menor a mayor complejidad

## Requisitos previos

- Node.js v18 o superior (recomendado v20 o v24 LTS)
- VS Code
- Conocimientos básicos de QA manual (test cases, defectos, flujos de aplicación)
- No hace falta saber programar, vamos desde cero

## Instalación

```bash
git clone https://github.com/TU-USUARIO/playwright-desde-cero-qa.git
cd playwright-desde-cero-qa
npm install
npx playwright install
```

## Correr los tests

```bash
# Correr todos los tests
npx playwright test

# Correr con navegador visible
npx playwright test --headed

# Correr en modo interactivo (UI Mode)
npx playwright test --ui

# Ver el reporte del último run
npx playwright show-report
```

## Estructura del repositorio

- `docs/` teoría organizada por módulos, en el orden en que conviene aprenderla
- `tests/` ejemplos de código ejecutables, uno por tema
- `ejercicios/` retos para practicar cada concepto

## Progreso

- [x] Módulo 1: Introducción a Playwright
- [x] Módulo 2: Instalación y primer test
- [x] Módulo 3: Motores de navegador (Chromium, Firefox, WebKit)
- [ ] Módulo 4: Anatomía de un test (async/await, locators)
- [ ] Módulo 5: Grabar tests con codegen
- [ ] Módulo 6: Locators y buenas prácticas
- [ ] Módulo 7: Acciones (click, fill, type)
- [ ] Módulo 8: Assertions
- [ ] Módulo 9: Hooks
- [ ] Módulo 10: Page Object Model
- [ ] Módulo 11: Testing de apps con IA
- [ ] Módulo 12: CI/CD con GitHub Actions

## Sobre este proyecto

Este material está siendo construido en paralelo al aprendizaje, así que se irá actualizando conforme avancen los módulos. Si encontrás errores o querés sugerir mejoras, los PRs y issues son bienvenidos.

