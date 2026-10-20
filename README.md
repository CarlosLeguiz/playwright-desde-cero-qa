# Playwright desde cero para QA

Aprendiendo test automation con Playwright desde QA manual, en español.

Este repositorio documenta mi proceso de aprendizaje de Playwright arrancando sin experiencia previa en automation. Sirve como material de estudio para cualquier persona que venga de QA manual y quiera dar el salto a automatización.

## ¿Qué vas a encontrar acá?

- **Teoría explicada en español**, con foco en QA sin experiencia previa en programación
- **Laboratorios ejecutables** que podés correr en tu máquina
- **Casos prácticos completos**, con los números reales de lo que salió bien y lo que salió mal
- **Un recorrido progresivo**, de menor a mayor complejidad

## Requisitos previos

- Node.js v18 o superior (recomendado v20 o v24 LTS)
- VS Code
- Conocimientos básicos de QA manual (test cases, defectos, flujos de aplicación)
- No hace falta saber programar, vamos desde cero

## Instalación

```bash
git clone https://github.com/CarlosLeguiz/playwright-desde-cero-qa.git
cd playwright-desde-cero-qa
npm install
npx playwright install
```

## Correr los tests

```bash
# Correr todos los tests
npx playwright test

# Un laboratorio puntual
npx playwright test laboratorios/09-loops-saucedemo/ --project=chromium

# Con navegador visible
npx playwright test --headed

# Modo interactivo
npx playwright test --ui

# Ver el reporte del último run
npx playwright show-report
```

## Estructura del repositorio

- `docs/` teoría organizada por módulos, en el orden en que conviene aprenderla
- `laboratorios/` tests ejecutables, uno por concepto
- `.claude/` agentes, skills y memoria del agente de QA
- `.mcp.json` configuración del MCP de Playwright a nivel proyecto

## Módulos

- [x] [01. Introducción a Playwright](./docs/01-introduccion/README.md)
- [x] [02. Instalación y setup](./docs/02-instalacion/README.md)
- [x] [03. Motores de navegador](./docs/03-motores-de-navegador/README.md)
- [x] [04. Anatomía de un test](./docs/04-anatomia-de-un-test/README.md)
- [x] [05. Codegen](./docs/05-codegen/README.md)
- [x] [06. Playwright con Claude Code](./docs/06-playwright-con-claude/README.md)
- [x] [07. Caso práctico: construir y auditar un agente de QA](./docs/07-caso-practico-agente-qa/README.md)
- [x] [08. Orquestación multi-agente](./docs/08-orquestacion-multi-agente/README.md)
- [ ] 09. CI/CD con GitHub Actions
- [ ] 10. Testing de aplicaciones con IA

### Módulo 7: construir y auditar un agente de QA

Proyecto completo de punta a punta sobre saucedemo. Armar un agente desde cero, hacer que explore solo, generar 87 tests, y después la parte que casi nadie hace: auditar lo que la IA produjo.

Los números: 38 fallos en la primera corrida, 29 defectos reales del producto y 9 tests mal escritos. Incluye cómo distinguirlos, cómo escribir bug reports, y por qué el refactor a Page Object Model terminó sobreingenierado.

### Módulo 8: orquestación multi-agente

Cuatro agentes especializados (BA, DEV, Code Reviewer, QA) coordinados por un orquestador. Cómo buscarlos en el marketplace de plugins, cómo verificar que no traigan código malicioso, y dónde se rompe el patrón.

Incluye una corrida real: 9 minutos, 23 tests, y los ocho momentos donde el proceso se frenó a esperar una decisión humana.

## Laboratorios

| # | Tema | Sitio |
|---|------|-------|
| 01 | Por qué async/await | - |
| 02 | Core actions | saucedemo |
| 03 | Localizar elementos | herokuapp |
| 04 | Dropdowns nativos y custom | saucedemo, demoqa |
| 05 | Datepickers e iframes | jqueryui |
| 06 | Tablas | herokuapp |
| 07 | Parent/child chaining | saucedemo |
| 08 | Checkout generado con MCP | saucedemo |
| 09 | Loops y data-driven testing | saucedemo |
| 10 | Logout | saucedemo |
| 12 | Filtro por rango de precio | saucedemo |

## Sobre este proyecto

Este material se construye en paralelo al aprendizaje, así que se actualiza conforme avanzan los módulos. Si encontrás errores o querés sugerir mejoras, los PRs e issues son bienvenidos.