# 4. El marketplace de plugins y como verificarlos

No hace falta escribir todos los agentes a mano. Claude Code tiene un catalogo con miles de plugins publicados, muchos con agentes y skills ya armados.

Lo que si hace falta es saber cual elegir y como verificar que no traiga sorpresas.

## Buscar

```
/plugin
```

Se abre el explorador con cinco pestanas:

| Pestana | Para que |
|---------|----------|
| **Discover** | Buscar entre todo el catalogo |
| **Installed** | Ver y desinstalar lo que tenes |
| **Marketplaces** | Los catalogos configurados |
| **Errors** | Plugins que fallaron al cargar |
| **Stats** | Uso |

En Discover escribis el termino y se filtra en vivo. Flechas para moverte, Enter para ver el detalle, Esc para volver.

## Elegir el termino de busqueda correcto

Esto es menos obvio de lo que parece. Buscar el nombre del rol casi nunca funciona.

| Buscas | No pongas | Poné |
|--------|-----------|------|
| Un revisor de codigo | `reviewer` | `code review` |
| Un analista funcional | `BA`, `business analyst` | `product manager`, `spec` |
| Un desarrollador | `developer` | `feature dev` |
| Testing | `tester` | `playwright`, `testing` |

Las siglas cortas (`BA`, `QA`) devuelven ruido porque matchean cualquier palabra que las contenga.

## Elegir entre varios

Una busqueda de `code review` devuelve cuatro opciones. Criterios para decidir:

**Cantidad de instalaciones.** 477K instalaciones significa que mucha gente lo uso y nadie reporto nada raro. 12 instalaciones no significa que sea malo, pero no tenes esa evidencia.

**Quien lo publica.** En la pantalla de detalle fijate el campo `By:` y `Repository:`. Si dice `anthropics/claude-plugins-official`, es oficial. "Anthropic Directory" a secas es solo el catalogo donde esta listado, no quien lo escribio.

**Que tan grande es.** Un plugin con 13 skills para un solo rol es sobreingenieria. Uno que a su vez es un orquestador de seis especialistas va a chocar con el tuyo.

**Si hace lo que necesitas.** La descripcion importa mas que el nombre. `Product Management` servia como BA porque decia "Write feature specs"; los otros de la misma busqueda apuntaban a descubrimiento de usuarios y roadmaps, que no es lo que buscabas.

## Los tres alcances de instalacion

Al instalar te pregunta donde guardarlo. Es la misma logica que vimos con `.mcp.json`:

| Alcance | Donde queda | Quien lo ve |
|---------|-------------|-------------|
| **User scope** | `~/.claude.json` | Vos, en todos tus proyectos |
| **Project scope** | `.claude/settings.json` del repo | Cualquiera que clone el proyecto |
| **Local scope** | Tu maquina, solo este repo | Vos, solo aca |

Para un repo compartido o de portfolio: **project scope**. Se commitea y el que clona recibe la misma configuracion.

## El aviso de confianza

Antes de instalar, Claude Code te muestra:

> Make sure you trust a plugin before installing. Anthropic does not control what MCP servers, files, or other software are included in plugins.

No es formalidad. Un plugin puede traer codigo que se ejecuta en tu maquina.

## Que riesgo tiene cada tipo de contenido

| Contenido | Que es | Riesgo |
|-----------|--------|--------|
| `.md` (skills, agentes, comandos) | Instrucciones de texto | **Bajo.** No se ejecutan. Lo peor es que le digan a Claude algo tonto |
| `plugin.json` | Manifiesto: nombre, version | **Nulo** |
| `.mcp.json` | Declara conexiones a servicios | **Medio.** Hay que mirar a donde apuntan |
| `hooks/` | Se ejecuta automaticamente en cada accion tuya | **Alto** |
| `.py`, `.js`, `.ts`, `.sh` | Codigo que corre con tus permisos | **Alto** |

## El comando para verificar

Despues de instalar:

```bash
find ~/.claude/plugins/cache -type f ! -name "*.md" ! -name "LICENSE"
```

Si no devuelve nada, todo lo que instalaste es markdown y no hay nada que ejecutar.

Si devuelve archivos, miralos uno por uno. Los `plugin.json` son manifiestos inofensivos. Cualquier otra cosa merece un `cat`.

## Un caso real: el `.mcp.json` del plugin de product management

En este proyecto, ese comando devolvio cuatro archivos. Tres eran manifiestos. El cuarto era un `.mcp.json` que declaraba 16 conexiones:

```json
{
  "mcpServers": {
    "slack":     { "type": "http", "url": "https://mcp.slack.com/mcp" },
    "linear":    { "type": "http", "url": "https://mcp.linear.app/mcp" },
    "notion":    { "type": "http", "url": "https://mcp.notion.com/mcp" },
    "figma":     { "type": "http", "url": "https://mcp.figma.com/mcp" },
    "gmail":     { "type": "http", "url": "" }
  }
}
```

Como se evalua:

1. **A donde apuntan.** Todas al dominio oficial de cada servicio. Ningun dominio raro, ninguna IP, nada acortado. Si hubiera visto `http://185.x.x.x/collect`, otra historia.
2. **Son locales o remotas.** `type: http` significa servicio remoto. No ejecuta nada en tu maquina.
3. **Estan activas.** No. Claude Code mostro "1 MCP server needs authentication". Son declaraciones de conexiones **disponibles**; ninguna funciona hasta que autorices OAuth.

Veredicto: inofensivo, pero equipaje. Ese plugin esta pensado para un product manager que saca datos de Jira y Notion. De sus 8 skills, solo uno (`write-spec`) servia para el rol de BA.

## La decision: usar el plugin o escribir el agente

Cuando un plugin trae mucho mas de lo que necesitas, hay dos caminos:

**Dejarlo.** No molesta. Nadie se conecta solo.

**Desinstalarlo y escribir el agente vos.** Diez lineas, cero equipaje, y entendes exactamente que hace.

Para un repo de portfolio conviene la segunda: todo lo que esta ahi lo pusiste a proposito, y podes explicar cada archivo.

En este proyecto se desinstalo `product-management` y se escribio `ba-agent.md` a mano.

## Desinstalar

```
/plugin
```

Pestana **Installed**, seleccionas el plugin, Enter. Ahi te da dos opciones:

- **`y`**: desactivarlo solo para vos. El plugin sigue registrado en el repo.
- **`u`**: desinstalar para todos. Lo saca del `.claude/settings.json`.

Si lo instalaste en project scope y lo queres sacar de verdad, es `u`.

## El plugin que ya tenias instalado sin saberlo

`feature-dev` trae tres agentes propios: `code-architect`, `code-explorer` y `code-reviewer`.

Ese ultimo se superpone con el `code-review-agent` que escribiste vos y con el plugin `code-review`. Tres revisores para el mismo trabajo.

**No es un problema tecnico, es un problema de decision.** El orquestador tiene que decir explicitamente cual usa, o va a elegir el que le parezca en cada corrida y los resultados no van a ser consistentes.

En este proyecto se eligio el propio, porque es el unico que conoce las reglas del `CLAUDE.md`. Los otros dos quedan disponibles para invocar a mano.

## Checklist antes de instalar

- [ ] Busque con un termino que no sea una sigla corta
- [ ] Mire la cantidad de instalaciones
- [ ] Vi el campo `By:` y el repositorio en la pantalla de detalle
- [ ] La descripcion dice que hace lo que necesito, no algo parecido
- [ ] Elegi el alcance correcto (project scope para repos compartidos)

Y despues:

- [ ] Corri el `find` para ver si trajo algo que no sea markdown
- [ ] Si trajo un `.mcp.json`, mire a donde apuntan las conexiones
- [ ] Revise si se superpone con algun agente que ya tenia