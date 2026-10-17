# 16. Crear un agente de QA con Claude Code

## Que es un "agente" en este contexto

No es un robot ni nada magico. Un agente es Claude Code **configurado con contexto permanente** sobre tu proyecto: que convenciones seguis, que locators preferis, que sitios testeas, que reglas no se rompen nunca.

Sin agente, cada vez que pedis un test tenes que explicar todo desde cero. Con agente, Claude ya sabe como trabajas.

La diferencia practica:

**Sin agente:**
```
Genera un test de login en saucedemo. Usa getByRole como primera opcion,
no uses waitForTimeout, el sitio usa data-test no data-testid, poneme
comentarios en espanol explicando los locators, el archivo va en
laboratorios/, en TypeScript...
```

**Con agente:**
```
Genera un test de login en saucedemo
```

El agente ya tiene todo lo demas.

---

## Las tres piezas

Un agente de QA en Claude Code se arma con tres archivos. Cada uno cumple una funcion distinta.

### 1. `.mcp.json` - las herramientas

Le da a Claude acceso al navegador. Sin esto, Claude escribe tests "a ciegas" basandose en lo que le contas. Con esto, abre el sitio, lo navega, y saca los locators reales.

**Por que un archivo y no el comando `claude mcp add`:**

Hay dos formas de configurar MCP:

| Forma | Donde se guarda | Alcance |
|-------|----------------|---------|
| `claude mcp add playwright ...` | `~/.claude.json` | Solo tu maquina, todos tus proyectos |
| `.mcp.json` en la raiz del proyecto | En el repo | El proyecto, para cualquiera que lo clone |

Para un repo publico o un proyecto de equipo, conviene el archivo: se commitea, y el que clona ya tiene el MCP andando sin configurar nada.

### 2. `CLAUDE.md` - las convenciones

Es un archivo que Claude Code lee automaticamente al arrancar en ese proyecto. Ahi van las reglas de la casa: estructura de carpetas, prioridad de locators, que esta prohibido, que sitios usas.

Es el equivalente a la documentacion de onboarding que le darias a un QA nuevo en el equipo.

### 3. `.claude/agents/qa-agent.md` - el especialista

Un subagente con instrucciones especificas para una tarea. Mientras `CLAUDE.md` describe el proyecto, el agente describe **como pensar** al escribir un test: que verificar antes de codear, que explicar despues, que no hacer nunca.

Claude lo invoca solo cuando la tarea encaja con su descripcion, o lo llamas vos por nombre.

---

## Crear las tres piezas

Parado en la raiz del proyecto:

```bash
cd ~/Documents/playwright-desde-cero-qa
```

### Paso 1: configurar MCP a nivel proyecto

```bash
cat > .mcp.json << 'EOF'
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
EOF
```

### Paso 2: escribir las convenciones

```bash
cat > CLAUDE.md << 'EOF'
# Convenciones del proyecto

Repo de aprendizaje de Playwright. Material en espanol para QA que vienen de testing manual.

## Estructura

- `docs/` - teoria en espanol, numerada por modulo
- `laboratorios/` - tests ejecutables, uno por concepto
- `playwright.config.js` - config principal

## Lenguaje

- Modulos 1-5: JavaScript (.spec.js)
- Modulo 6 en adelante: TypeScript (.spec.ts)
- El config soporta ambos via testMatch

## Como escribir tests

### Locators (prioridad estricta)

1. `getByRole('button', { name: 'Login' })`
2. `getByLabel('Username')`
3. `getByPlaceholder('Search...')`
4. `getByText('Welcome')`
5. `getByTestId('submit')`
6. CSS solo con id (`#login-form`), nunca con clases generadas
7. XPath: no usar

### Reglas

- Nunca `waitForTimeout`. Usar assertions web-first.
- Cada test es independiente: crea lo que necesita, no depende de otros.
- Credenciales de sitios publicos de practica se pueden hardcodear.
- Para elementos repetidos, usar `.filter({ hasText })` antes que `.nth()`.
- Nombres de tests en espanol, descriptivos de QUE se verifica.

### Sitios de practica

- https://www.saucedemo.com (usa `data-test`, no `data-testid`)
- https://the-internet.herokuapp.com (lento, necesita retries)
- https://demoqa.com (dropdowns custom de React)
- https://jqueryui.com/datepicker (iframes)

### Config

- `testIdAttribute: 'data-test'` (por saucedemo)
- `baseURL: 'https://www.saucedemo.com'`
- Projects: chromium, firefox, webkit, chrome

## Comentarios

Los tests son material didactico. Comentar el POR QUE de cada decision de locator,
no el QUE hace la linea.
EOF
```

### Paso 3: crear el agente

```bash
mkdir -p .claude/agents

cat > .claude/agents/qa-agent.md << 'EOF'
---
name: qa-agent
description: Genera tests de Playwright siguiendo las convenciones del proyecto. Usar cuando se pida crear, modificar o debuggear un test.
---

Sos un QA automation engineer especializado en Playwright.

## Antes de escribir codigo

1. Si el sitio es publico y tenes MCP disponible, navegalo y saca los locators reales.
   No adivines.
2. Si el sitio no es accesible, pedi el outerHTML de los elementos clave.
3. Pregunta que debe verificar el test si no esta claro. Un test sin una assertion
   real no sirve.

## Al escribir el test

Segui la prioridad de locators de CLAUDE.md sin excepciones.

Estructura:
- `test.describe()` para agrupar
- `test.beforeEach()` para el setup repetido (goto, login)
- Un `test()` por escenario, nunca varios escenarios en uno

Cada test tiene que poder fallar. Si la assertion verifica algo que siempre es
verdad, no sirve.

## Despues de escribir

Deci explicitamente:
1. Que locators usaste y por que esos
2. Que verifica el test
3. Como romperlo a proposito para comprobar que la assertion funciona
4. Si el sitio es inestable, si hace falta retries

## Nunca

- `waitForTimeout`
- Selectores CSS con clases generadas (`.css-1x7hj2k`)
- `.nth()` cuando se puede usar `.filter({ hasText })`
- Tests que dependen de que otro test haya corrido antes
EOF
```

### Paso 4: reiniciar Claude Code

```
/exit
```

Y volves a entrar con `claude`. Esto hace que tome la config nueva.

### Paso 5: verificar

```bash
claude mcp list
```

Tiene que aparecer `playwright`. Si lo tenias configurado antes con `claude mcp add`, va a aparecer dos veces. Para dejar solo la del proyecto:

```bash
claude mcp remove playwright
```

---

## Usar el agente

Una vez configurado, pedis tests normalmente:

```
Genera un test que verifique que el filtro de precio ordena de menor a mayor
en saucedemo
```

Claude va a:
1. Leer `CLAUDE.md` y saber que el sitio usa `data-test`, que preferis `getByRole`, donde va el archivo
2. Invocar al `qa-agent` porque la tarea es generar un test
3. Navegar el sitio con MCP para ver los locators reales
4. Escribir el test siguiendo tus reglas
5. Explicarte los locators y como romperlo

Tambien lo podes llamar por nombre:

```
Usa el qa-agent para revisar si laboratorios/07-parent-child-saucedemo/
tiene algun locator fragil
```

---

## Que cambia en la practica

| | Sin agente | Con agente |
|---|---|---|
| Prompt tipico | 15 lineas de contexto | 1 linea |
| Locators | Hay que pedirlos explicitamente | Siempre la prioridad correcta |
| Consistencia entre tests | Varia segun como pediste | Uniforme |
| Onboarding de alguien nuevo | Le explicas todo a mano | Clona el repo y ya |

---

## Ampliarlo despues

Esto es la base. Se puede crecer con:

- **Mas agentes especializados**: uno para revisar tests existentes, otro para generar datos de prueba, otro para migrar tests de Selenium.
- **Slash commands**: comandos propios tipo `/nuevo-test` que arrancan un flujo predefinido.
- **Mas MCPs**: conectar Jira para leer los casos de prueba, o la base de datos para validar datos.

Todo eso esta en el modulo que sigue.

---

## Resumen

Tres archivos, tres funciones:

- `.mcp.json` le da **ojos** (puede ver el sitio)
- `CLAUDE.md` le da **contexto** (sabe como es tu proyecto)
- `.claude/agents/qa-agent.md` le da **criterio** (sabe como pensar un test)

Juntos convierten a Claude Code de "una IA que escribe codigo" en "un QA que conoce tu proyecto".