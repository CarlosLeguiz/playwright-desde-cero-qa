# 5. El ciclo en la practica

Una corrida real del orquestador, con lo que hizo cada agente y lo que salio.

## El equipo armado

| Rol | De donde salio |
|-----|---------------|
| **BA** | Escrito a mano (`ba-agent.md`) |
| **DEV** | Plugin `feature-dev` del marketplace |
| **Code Reviewer** | Escrito a mano (`code-review-agent.md`) |
| **QA** | Escrito a mano (`qa-agent.md`) |
| **Orquestador** | Escrito a mano (`orchestrator.md`) |

Tres de cinco escritos a mano. El criterio: si el rol depende de las convenciones del proyecto, lo escribis vos. El DEV es generico, el revisor y el QA no.

## El pedido

Una frase:

```
Usa el orchestrator: quiero poder filtrar los productos de saucedemo por rango
de precio, con un minimo y un maximo.
```

## Lo primero que paso: reformulo el pedido

Antes de lanzar nada, detecto un problema:

> Saucedemo es un sitio externo, asi que no podemos agregarle un filtro de precio
> a su interfaz. Lo unico que tiene es el desplegable de orden. Por eso te indique
> que construya el filtro del lado de los tests.

Y te ofrecio la alternativa:

> Si tenias en mente otra cosa, decime y lo reoriento. Por ejemplo, si lo que
> querias era verificar el orden por precio que ya trae el desplegable.

**Lo que importa aca:** detecto que el pedido como estaba escrito era imposible, propuso una lectura razonable, y te la dijo antes de gastar diez minutos. No eligio en silencio.

## Etapa 1: el BA

Salida: **10 requerimientos y 16 criterios de aceptacion**.

Y cuatro preguntas que no podia contestar solo:

1. Como implementar el filtro, dado que no se puede tocar la pagina?
2. Que devuelve el filtro por cada producto?
3. Entra un producto que cuesta exactamente el minimo o el maximo?
4. Que pasa si el minimo es mayor que el maximo?

Cada una con una recomendacion marcada, pero sin elegir.

**Esa es la regla del `ba-agent` funcionando:**

```markdown
Cuando el pedido es ambiguo, NO elijas una interpretacion. Listá las opciones
y marcá cual necesita decision del usuario.
```

Sin esa regla, el BA habria elegido "incluidos" o "excluidos" por su cuenta, y te enterarias del criterio recien al leer el codigo. Si lo leias.

## Etapa 2: el control humano

El orquestador **paro**. No creo ningun archivo, no corrio ningun test.

Ese es el paso 2 del `orchestrator.md`:

```markdown
2. PARAR. Presentale los requerimientos al usuario y pedile confirmacion
   explicita antes de seguir. No continues sin respuesta.
```

Es la unica linea del orquestador que evita el modo de falla mas caro: un requerimiento mal interpretado que se propaga por las tres etapas siguientes sin que nadie lo detecte.

Cuatro respuestas, una por pregunta. Treinta segundos.

## Etapas 3 a 5: encadenadas sin parar

Con las respuestas, el orquestador retomo y encadeno:

- **feature-dev** implemento el page object y la funcion de filtro
- **code-review-agent** lo reviso contra las convenciones del `CLAUDE.md`
- **qa-agent** escribio los tests contra los 16 criterios de aceptacion
- Corrio `npx playwright test --project=chromium`

Tiempo total del ciclo: **8 minutos 56 segundos**.

Resultado: **23 tests, todos pasan**, en `laboratorios/12-filtro-precio-saucedemo/`.

Sin commit, porque el orquestador tenia instruccion de no commitear.

## Lo que encontro la revision

Un comentario que mentia, en `InventarioPage.ts:51-52`:

> Dice que si falta el nombre o el precio se obtiene un texto vacio. En realidad
> Playwright se queda esperando hasta que se cumple el tiempo limite.

Es una linea de comentario, no un bug. Pero un comentario que miente es peor que no tener comentario: el proximo que lea el codigo va a asumir que hay un caso vacio manejado, y no lo hay.

**Lo encontro el revisor, no el que escribio el codigo.** Ese es el argumento concreto a favor de separarlos: el que escribio el comentario creia que era verdad.

## Lo que el agente aprendio solo

El `qa-agent` agrego cuatro lineas a su propia memoria (`.claude/agent-memory/playwright-qa.md`) sin que nadie se lo pidiera, y lo reporto.

Las cuatro:

1. Los `data-test` del inventario de saucedemo y como leerlos dentro de cada tarjeta
2. Los precios en orden A-Z, con la advertencia de que el orden de pantalla no es ascendente
3. Un test estatico que escanea codigo buscando `waitForTimeout` y `xpath=` **se matchea a si mismo**, porque esos strings estan en el propio test. Solucion: armar los patrones concatenando strings
4. Comparar un page object contra si mismo no prueba nada

**La cuarta es la mas valiosa**, porque es un principio y no un dato del sitio:

```typescript
// MAL: los dos lados salen del mismo page object
const productos = await inventario.leerProductos();
expect(productos.length).toBe(await inventario.contarProductos());

// BIEN: la verificacion viene de otra fuente
const productos = await inventario.leerProductos();
await expect(page.locator('.inventory_item')).toHaveCount(productos.length);
```

Si el locator del page object esta mal, la primera version da el mismo numero equivocado de los dos lados y el test pasa igual. Es el pariente dificil de ver de la assertion decorativa.

## Lo que hay que revisar antes de commitear

La memoria del agente se lee al empezar cada sesion. Lo que quede ahi se trata como verdad de ahi en adelante.

De las cuatro lineas, tres pasan sin objecion. La segunda tiene precios hardcodeados (29.99, 9.99, 15.99...): si manana saucedemo cambia un precio, la memoria queda mintiendo y el agente la va a creer.

El dato util de esa linea es la segunda mitad, la advertencia sobre el orden. Los precios conviene marcarlos como "verificar contra la pagina antes de usarlos".

```bash
git diff .claude/agent-memory/playwright-qa.md
```

Ese comando antes de cada commit. La memoria se revisa como se revisa el codigo.

## Las cuatro decisiones que quedaron para el humano

Al terminar, el orquestador dejo cuatro cosas sin decidir:

1. Un test de rango verifica que precios salen pero no en que orden. Hay que exigir el orden tambien?
2. `Infinity` no se acepta como maximo, asi que no se puede decir "sin tope". Se deja asi?
3. El comentario que miente. Lo corrijo?
4. El spec no paso por chequeo de tipos porque el repo no tiene TypeScript instalado

Ninguna de las cuatro la podia resolver solo. Las tres primeras son decisiones de producto; la cuarta es una limitacion del entorno que hay que saber que existe.

## El resumen de lo que automatizo y lo que no

| Paso | Quien |
|------|-------|
| Decidir que pedir | Vos |
| Detectar que el pedido era imposible como estaba | El orquestador |
| Convertirlo en requerimientos | BA |
| **Resolver las 4 ambiguedades** | **Vos** |
| Implementar | DEV |
| Revisar | Code Reviewer |
| Escribir y correr los tests | QA |
| **Decidir sobre las 4 cuestiones finales** | **Vos** |
| Revisar que anoto el agente en su memoria | Vos |

Nueve minutos de ejecucion automatica, y dos momentos donde todo se frena a esperarte.

El orquestador automatiza la ejecucion, no el criterio. Lo viste en concreto: te hizo cuatro preguntas al principio y te dejo cuatro decisiones al final, y ninguna de las ocho la podia contestar un agente.