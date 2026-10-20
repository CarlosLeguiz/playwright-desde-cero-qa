# 17. Configuracion completa del agente de QA

El documento 16 cubre las tres piezas basicas. Este es el setup completo: seis archivos que convierten a Claude Code en un QA que conoce tu proyecto, recuerda lo que aprendio y revisa su propio trabajo.

---

## Estructura final

```
playwright-desde-cero-qa/
├── .mcp.json                                    # acceso al navegador
├── CLAUDE.md                                    # convenciones del proyecto
├── .claude/
│   ├── agents/
│   │   ├── qa-agent.md                          # genera tests
│   │   └── code-review-agent.md                 # revisa tests
│   ├── skills/
│   │   └── generar-test-playwright/
│   │       └── SKILL.md                         # procedimiento de 4 pasos
│   └── agent-memory/
│       └── playwright-qa.md                     # lo aprendido entre sesiones
├── docs/
├── laboratorios/
└── playwright.config.js
```

---

## Que hace cada pieza

| Archivo | Rol | Analogia |
|---------|-----|----------|
| `.mcp.json` | Le da acceso al navegador | Los ojos |
| `CLAUDE.md` | Las reglas del proyecto | El manual de la empresa |
| `qa-agent.md` | Como pensar al escribir un test | El QA que escribe |
| `code-review-agent.md` | Como criticar un test | El QA senior que revisa |
| `SKILL.md` | El procedimiento paso a paso | El checklist de la tarea |
| `playwright-qa.md` | Lo aprendido en sesiones anteriores | El cuaderno de notas |

La diferencia entre agente y skill, que es la que mas confunde:

- **Agente** = un *quien*. Un rol con criterio propio. Decide.
- **Skill** = un *como*. Un procedimiento que se repite siempre igual. Ejecuta.

Un agente puede usar varios skills. Un skill no tiene criterio, solo pasos.

---

## 1. `.mcp.json` - acceso al navegador

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Sin esto Claude escribe tests a ciegas. Con esto abre el sitio, lo navega y saca los locators reales.

**Las dos formas de configurar MCP:**

| Forma | Donde vive | Alcance |
|-------|-----------|---------|
| `claude mcp add playwright npx @playwright/mcp@latest` | `~/.claude.json` | Tu maquina, todos tus proyectos |
| `.mcp.json` en la raiz | En el repo | Este proyecto, para cualquiera que lo clone |

Se pueden tener las dos a la vez. No se cruzan: el de proyecto tiene prioridad.

La primera vez que Claude Code detecta un `.mcp.json` te pide permiso, porque un MCP puede ejecutar codigo en tu maquina. Es una medida de seguridad por si clonas un repo ajeno.

---

## 2. `CLAUDE.md` - las convenciones

Claude Code lo lee automaticamente al arrancar en el proyecto. Es el onboarding que le darias a alguien nuevo en el equipo.

Que poner:
- Estructura de carpetas y para que es cada una
- Prioridad de locators
- Reglas que no se rompen (nada de `waitForTimeout`, tests independientes)
- Particularidades de los sitios que testeas
- Como comentar el codigo

Que no poner: cosas que estan en la documentacion de Playwright. Claude ya las sabe.

---

## 3. `qa-agent.md` - el que escribe

```markdown
---
name: qa-agent
description: Genera tests de Playwright siguiendo las convenciones del proyecto.
---
```

El `description` del frontmatter es lo que Claude Code lee para decidir cuando invocarlo solo. Si esta mal escrito, el agente nunca se usa.

El cuerpo define como debe pensar: que verificar antes de codear, que estructura usar, que explicar despues, que no hacer nunca.

---

## 4. `code-review-agent.md` - el que revisa

Un segundo agente con el rol opuesto: no escribe, critica.

Por que tener dos agentes separados en vez de uno que haga todo: el que escribe esta sesgado a defender lo que escribio. El que revisa llega sin ese sesgo.

Revisa en orden de gravedad:
1. Assertions que no prueban nada (lo mas grave)
2. Locators fragiles
3. Esperas fijas
4. Dependencias entre tests
5. Datos hardcodeados

---

## 5. `SKILL.md` - el procedimiento

El metodo de 4 pasos convertido en procedimiento fijo:

1. **Capture**: conseguir el HTML real (MCP o `Copy outerHTML`)
2. **Prompt**: confirmar flujo, datos y que significa que el test paso
3. **Verify**: correrlo y leer el error completo si falla
4. **Harden**: romperlo a proposito, sacar waits fijos, revisar locators

La diferencia con tenerlo en `CLAUDE.md`: el skill se invoca cuando la tarea encaja, no esta siempre en contexto. Eso ahorra tokens.

---

## 6. `agent-memory/playwright-qa.md` - el cuaderno

Claude Code arranca de cero en cada sesion. Este archivo es la memoria que el agente lee al empezar y actualiza al terminar.

Que va adentro:
- Comportamientos raros de cada sitio (herokuapp tira 503, demoqa usa dropdowns de React)
- Locators que fallaron y por que
- Decisiones de arquitectura del proyecto
- Errores que ya se cometieron

Que no va: resultados de un test puntual, cosas que estan en la documentacion.

**Para que funcione**, el agente tiene que tener la instruccion de leerla y actualizarla. Eso va al principio de `qa-agent.md`:

```markdown
## Memoria

Antes de hacer cualquier cosa, lee `.claude/agent-memory/playwright-qa.md`.
Al terminar, si descubriste algo que va a servir mas adelante, agregalo ahi.
```

---

## Como se usa todo junto

Pedis un test:

```
Genera un test para el datepicker de jqueryui
```

Lo que pasa por detras:

1. Claude lee `CLAUDE.md` (sabe la estructura, la prioridad de locators, las reglas)
2. Invoca al `qa-agent` porque la tarea encaja con su `description`
3. El agente lee `agent-memory/playwright-qa.md` y descubre que jqueryui tiene un iframe y que el dia necesita `exact: true`
4. Usa el skill `generar-test-playwright` y sigue los 4 pasos
5. Con el MCP navega el sitio y saca los locators reales
6. Escribe el test en `laboratorios/`, en TypeScript, con comentarios en espanol
7. Te dice como correrlo y como romperlo
8. Si aprendio algo nuevo, lo anota en la memoria

Todo eso desde un prompt de una linea.

---

## Antes y despues

| | Sin configurar | Configurado |
|---|---|---|
| Prompt tipico | 15 lineas de contexto | 1 linea |
| Locators | Hay que pedirlos explicitamente | Siempre la prioridad correcta |
| Consistencia entre tests | Varia segun como pediste | Uniforme |
| Conocimiento de los sitios | Se lo explicas cada vez | Lo recuerda |
| Revision de calidad | La haces vos a mano | La hace el code-review-agent |
| Onboarding de alguien nuevo | Le explicas todo | Clona el repo y ya |

---

## Orden de creacion

Si arrancas de cero en otro proyecto, este es el orden que tiene sentido:

1. `.mcp.json` (sin ojos no ve nada)
2. `CLAUDE.md` (sin contexto adivina)
3. `qa-agent.md` (el que hace el trabajo)
4. `agent-memory/` (empieza vacia, se llena sola)
5. `SKILL.md` (cuando ya sabes cual es tu procedimiento repetido)
6. `code-review-agent.md` (cuando ya tenes tests que revisar)

Los primeros tres son el minimo util. Los otros tres son el salto de calidad.

---

## Que falta para el setup completo

Lo que todavia no tenemos y vale la pena:

- **`.claude/settings.local.json`**: permisos del proyecto. Define que comandos puede correr Claude sin preguntarte cada vez (por ejemplo, `npx playwright test`).
- **`.github/workflows/`**: GitHub Actions, para que los tests corran solos en cada push.
- **Slash commands propios**: `/nuevo-test`, `/revisar-suite`, comandos que arrancan un flujo predefinido.

Eso es el modulo que sigue.