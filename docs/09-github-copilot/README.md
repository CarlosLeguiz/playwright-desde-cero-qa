# 9. GitHub Copilot

Copilot es la alternativa de GitHub a Claude Code. Vale conocerla por dos razones: es la que mas se usa en empresas, y en una entrevista te van a preguntar en que se diferencian.

Esta seccion es corta a proposito. El foco del repo sigue siendo Playwright con Claude Code.

## Instalacion

En las versiones nuevas de VS Code viene **built-in**. No hay que instalar nada: aparece en Extensiones con el boton "Disable AI Features" en vez de "Install".

Para abrir el panel de chat: **Ctrl + Cmd + I** en Mac, o el icono de chat en la barra lateral.

Necesita cuenta de GitHub. Hay un plan gratuito con limite mensual de mensajes, suficiente para aprender.

## Los tres modos

| Modo | Que hace | Vos que haces |
|------|----------|---------------|
| **Chat** | Responde preguntas sobre el codigo abierto | Leer y copiar lo que sirva |
| **Edit** | Modifica varios archivos a la vez | Revisar el diff y aceptar o rechazar |
| **Agent** | Planifica, edita, corre comandos e itera solo | Supervisar y corregir el rumbo |

### Chat

Un panel lateral donde preguntas. Ve los archivos que tenes abiertos.

```
Que hace este test?
Por que falla este locator?
```

Util para entender codigo ajeno. No modifica nada.

### Edit

Le pedis un cambio y edita los archivos. Te muestra el diff y vos decidis.

```
Cambia todos los locators CSS de este archivo por getByRole
```

Es el modo mas util para refactors acotados: ves exactamente que cambio antes de aceptar.

### Agent

El mas parecido a lo que venimos haciendo con Claude Code. Le das un objetivo, el planifica los pasos, edita archivos, corre comandos y revisa el resultado.

```
Agrega tests para el flujo de checkout de saucedemo
```

## Comparacion con Claude Code

Lo que tienen en común: los dos leen tu codebase, editan archivos y pueden correr comandos. El modo Agent de Copilot y Claude Code resuelven el mismo problema.

Las diferencias que importan en la practica:

| | Claude Code | Copilot |
|---|---|---|
| **Donde vive** | Terminal | Dentro de VS Code |
| **Convenciones del proyecto** | `CLAUDE.md`, leido automaticamente | Instrucciones personalizadas, menos establecido |
| **Subagentes** | Si, `.claude/agents/` | No del mismo modo |
| **MCP** | Si, estandar | Soporte mas limitado |
| **Marketplace** | `/plugin`, miles de plugins | Extensiones de VS Code |

**La diferencia que mas se nota para lo que venimos haciendo:** el patron de la seccion 8, varios agentes especializados coordinados por un orquestador, no tiene equivalente directo en Copilot. Copilot es un asistente; Claude Code es un asistente que podes dividir en roles.

**La diferencia que mas se nota para el dia a dia:** Copilot vive dentro del editor. Si estas escribiendo codigo y queres una sugerencia inline mientras tipeas, eso lo hace Copilot y Claude Code no.

## Cual usar

No es una u otra. En la practica se usan juntas:

- **Copilot** para completar codigo mientras escribis, y preguntas rapidas sobre el archivo abierto
- **Claude Code** para tareas con varias etapas: explorar un sitio, generar una suite, auditar lo que salio

Si tu equipo ya tiene Copilot con licencia, usalo. Si estas armando un flujo de QA automation con agentes especializados, lo de la seccion 8 no lo vas a poder replicar ahi.

## Para una entrevista

Si te preguntan la diferencia, la respuesta corta:

> Copilot vive en el editor y es mejor para asistencia mientras escribis codigo. Claude Code corre en terminal y es mejor para tareas agenticas de varias etapas, porque permite definir subagentes con roles distintos y conectar herramientas por MCP. Para automatizacion de QA uso Claude Code porque puedo separar el agente que genera tests del que los audita; en Copilot ese agente seria uno solo y se revisa a si mismo.

Esa ultima frase es la que muestra que los usaste y no solo los leiste.