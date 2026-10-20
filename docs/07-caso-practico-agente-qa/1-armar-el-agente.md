# 1. Armar el agente desde cero

## El proyecto

```bash
mkdir qa-agent-exercise
cd qa-agent-exercise
npm init playwright@latest
```

El instalador pregunta tres cosas: lenguaje (JavaScript o TypeScript), carpeta de tests, y si instalar los browsers. Nada mas.

## El config

Cuatro ajustes que vale la pena entender, porque cambian como trabajas todos los dias.

```javascript
// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  reporter: 'html',

  use: {
    baseURL: 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

**`baseURL`**: te deja escribir `page.goto('/inventory.html')` en vez de la URL completa en cada test. Si manana testeas el ambiente de staging, cambias una linea.

**`testIdAttribute`**: por defecto `getByTestId()` busca `data-testid`. Saucedemo usa `data-test`. Sin esta linea, ningun `getByTestId` matchea y no entendes por que.

**`trace: 'on-first-retry'`**: cuando un test falla y reintenta, Playwright graba todo: cada accion, screenshot antes y despues, el DOM en cada momento, los pedidos de red. Es la herramienta de debugging mas util que tiene. Grabar siempre (`'on'`) ocupa mucho espacio; en el primer reintento es el punto justo.

**`screenshot: 'only-on-failure'`**: foto solo cuando algo sale mal. Suficiente para el 80% de los casos.

**Un solo browser mientras desarrollas.** Si tenes configurados chromium, firefox y webkit, cada corrida son 3 veces los tests. Mientras escribis, uno solo. Los tres se corren en CI.

## El MCP a nivel proyecto

Hay dos formas de conectar el MCP de Playwright, y la diferencia importa.

| Forma | Donde se guarda | Alcance |
|-------|----------------|---------|
| `claude mcp add playwright npx @playwright/mcp@latest` | `~/.claude.json` | Tu maquina, todos tus proyectos |
| Archivo `.mcp.json` en la raiz | En el repo | Este proyecto, para cualquiera que lo clone |

Para un repo de equipo o un portfolio publico, conviene el archivo:

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

Se commitea, y el que clona el repo ya tiene el MCP configurado sin hacer nada.

**La primera vez que Claude Code detecta un `.mcp.json`, te pide permiso.** Es una medida de seguridad: un MCP puede ejecutar codigo en tu maquina, asi que no confia automaticamente en el archivo de configuracion de un repo ajeno. Si clonas un proyecto random de GitHub con un MCP malicioso adentro, esa pregunta es lo que te protege.

Para verificar que quedo conectado, dentro de Claude Code:

```
/mcp
```

Tiene que aparecer `playwright` con la cantidad de herramientas que expone.

## Las instrucciones del agente

Aca esta el 80% del resultado final. Un archivo `CLAUDE.md` en la raiz, que Claude Code lee solo al arrancar en el proyecto.

La diferencia entre instrucciones vagas y especificas se ve en los numeros: en este caso, de 38 fallos, solo 9 fueron culpa del test. Con instrucciones genericas esa proporcion se invierte.

Siete secciones, en orden de importancia.

### 1. Rol

No alcanza con "sos un QA automation engineer". Hay que decirle para que esta.

```markdown
Tu trabajo no es escribir codigo que pase. Es escribir tests que encuentren bugs.

La aplicacion bajo prueba tiene defectos intencionales. Si todos tus tests pasan
a la primera, probablemente los escribiste mal.

Antes de escribir un test, preguntate: "si esta funcionalidad estuviera rota,
mi test lo detectaria?"
```

Esa ultima linea es la que mas cambia el resultado.

### 2. Politica de locators

Permitidos, en orden estricto. Y sobre todo: **prohibidos**.

```markdown
### Prohibidos

- XPath: en ningun caso.
- Clases CSS: .btn_primary, .css-1x7hj2k. Cambian en cada rediseno.
- Selectores de estructura: div > div > span:nth-child(3).
- .nth() como primera opcion: usar .filter({ hasText }) para narrar el locator.
```

Sin la lista de prohibidos, la IA usa lo primero que funcione. Con la lista, se obliga a buscar el locator estable.

### 3. Politica de assertions

Esta es la que distingue un test de verdad de uno decorativo.

```markdown
### Assertion real

Verifica el RESULTADO de la accion, en el elemento que cambia.

await page.getByRole('button', { name: 'Login' }).click();
await expect(page).toHaveURL(/inventory/);

### Assertion decorativa (prohibida)

Verifica algo que ya era verdad antes de la accion.

await page.getByRole('button', { name: 'Login' }).click();
await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
```

Y la regla que lo cierra:

```markdown
Todo test tiene que poder fallar. Antes de darlo por terminado, deci que habria
que romper en la aplicacion para que el test falle. Si no se te ocurre nada,
la assertion es decorativa.
```

### 4. Estructura de archivos

Un archivo por area funcional. No todo en un solo spec.

```
tests/
├── auth.spec.js        # login, logout, casos de error
├── products.spec.js    # listado y ordenamiento
├── cart.spec.js        # agregar y quitar
└── checkout.spec.js    # flujo de compra
```

### 5. Definicion de "terminado"

Seis condiciones, todas tienen que cumplirse:

1. Pasa al correrlo
2. Se puede explicar en una linea que habria que romper para que falle
3. No tiene ningun locator de la lista de prohibidos
4. No tiene esperas fijas
5. Corre solo, sin depender de que otro test haya corrido antes
6. El nombre describe que verifica, no que hace

### 6. Prohibiciones explicitas con ejemplo

Las tres cosas que mas hace mal el codigo generado por IA. Cada una con el codigo mal y el codigo bien:

- `waitForTimeout`
- Locators por clase CSS
- Tests que dependen de otros tests

Mostrar el ejemplo importa. "No uses esperas fijas" se interpreta de varias formas. El par de bloques de codigo, no.

### 7. Obligacion de explorar

```markdown
Explora la aplicacion con el MCP de Playwright. No generes tests desde supuestos.

Si no viste un elemento en el DOM real, no existe. Nada de inventar locators
porque "normalmente se llaman asi".
```

Este punto resuelve el problema mas comun: la IA genera un test con locators que suenan razonables pero no existen en la pagina.

## Lo que salio mal con las instrucciones

Vale documentarlo: la tabla de usuarios del `CLAUDE.md` tenia cuatro. El sitio tiene seis.

El agente lo detecto durante la exploracion y lo reporto:

> "Two more users than CLAUDE.md lists: error_user and visual_user."

Eso es una ventaja de obligarlo a explorar: cuando tus instrucciones estan incompletas, te lo dice en vez de trabajar con informacion vieja.

## Checklist del setup

- [ ] `npm init playwright@latest` corrido
- [ ] `playwright.config.js` con baseURL, testIdAttribute, trace y screenshot
- [ ] Un solo browser en `projects` mientras desarrollas
- [ ] `.mcp.json` creado y permiso otorgado
- [ ] `/mcp` muestra playwright conectado
- [ ] `CLAUDE.md` con las siete secciones
- [ ] Al menos tres prohibiciones explicitas con ejemplo de codigo