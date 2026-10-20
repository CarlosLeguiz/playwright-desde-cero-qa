# 3. Donde se rompe el patron

El orquestador parece robusto porque cada agente revisa al anterior. No es asi. Tiene modos de falla propios, y el mas grave es invisible mientras ocurre.

## Falla 1: el error que se propaga desde el principio

**El escenario.** El BA interpreta mal el pedido. El DEV implementa esos requerimientos correctamente. El Code Reviewer revisa ese codigo y no encuentra problemas, porque el codigo esta bien. El QA escribe tests contra los criterios de aceptacion y todos pasan.

Resultado: codigo correcto, bien revisado, bien testeado, que resuelve el problema que no era.

**Por que ninguno lo detecta.** Cada agente confia en lo que le llego. El Code Reviewer revisa codigo contra requerimientos, no requerimientos contra la realidad. El QA testea contra criterios de aceptacion, no contra la intencion original.

Nadie en la cadena tiene el contexto para decir "esto no era lo que se pidio", porque ninguno vio el pedido original excepto el BA.

**Por eso el control humano va despues del BA.** Es el unico momento donde el error todavia cuesta una conversacion de dos minutos. Dos etapas mas adelante cuesta rehacer todo.

```
Pedido -> [BA] -> <<< CONTROL HUMANO >>> -> [DEV] -> [Review] -> [QA]
                         ^
                         |
            el unico punto donde un error
            del requerimiento es barato
```

**Como implementarlo.** En las instrucciones del orquestador, explicitamente:

```markdown
2. PARAR. Presentale los requerimientos al usuario y pedile confirmacion
   antes de seguir.
```

Sin esa linea, el orquestador encadena los cuatro pasos y te entrega el resultado final. Que es lo que parece eficiente y es lo que mas caro sale.

## Falla 2: el ciclo infinito entre DEV y Reviewer

**El escenario.** El Reviewer pide un cambio. El DEV lo hace. El Reviewer revisa de nuevo y encuentra otra cosa. Tres vueltas despues siguen iterando sobre preferencias de estilo.

**Las dos defensas:**

Limite de vueltas en el orquestador:

```markdown
5. Si la revision encuentra problemas de correctitud o seguridad, volve al
   paso 3 con las criticas. Maximo dos vueltas; si en la tercera sigue
   habiendo problemas graves, parar y reportarselo al usuario.
```

Y criterio de que dispara una vuelta, en el Reviewer:

```markdown
- Solo "bloqueante" para correctitud y seguridad. Estilo nunca bloquea.
```

Sin las dos, el ciclo no termina solo.

## Falla 3: el orquestador que resume

**El escenario.** El BA entrega 12 requerimientos detallados. El orquestador, tratando de ser util, le pasa al DEV un resumen de 4 lineas.

El DEV implementa el resumen. Los otros 8 requerimientos no existen para nadie mas en la cadena.

**Por que pasa.** Resumir parece lo correcto: el contexto es caro, el agente siguiente no necesita todo. Pero el que decide que es importante no es el que lo va a usar.

**La regla:**

```markdown
- No resumas ni reinterpretes la salida de un agente antes de pasarla al
  siguiente. Pasala tal cual.
```

Si la salida es demasiado larga para pasar entera, el problema es que la tarea era demasiado grande. Dividila en dos ciclos, no la comprimas.

## Falla 4: agentes que cruzan su frontera

**Los sintomas tipicos:**

| Sintoma | Que paso |
|---------|----------|
| El BA entrega requerimientos que dicen que libreria usar | Cruzo hacia el DEV |
| El DEV devuelve codigo con sus propios tests | Cruzo hacia el QA |
| El Code Reviewer reescribe la funcionalidad a su manera | Cruzo hacia el DEV |
| El QA "arregla" la aplicacion para que el test pase | Cruzo hacia el DEV, y ademas tapo un bug |

El ultimo es el mas grave y el mas comun. Un QA que modifica el codigo de la aplicacion para que su test pase esta borrando el defecto que encontro.

**La defensa:** cada agente tiene una seccion "Lo que nunca haces". No es decorativa; es lo que mantiene el patron funcionando.

## Falla 5: usar el patron para algo chico

Cuatro agentes coordinados para cambiar el texto de un boton es puro costo: cuatro invocaciones, cuatro contextos, y un resultado que hubieras conseguido pidiendolo directo.

**Cuando el patron rinde:**

- El trabajo tiene etapas genuinamente distintas
- El sesgo de "me reviso a mi mismo" importa
- Vas a repetir el mismo flujo muchas veces

**Cuando no:**

- Una sola etapa (solo escribir tests, solo revisar codigo)
- Un cambio chico
- Una exploracion donde todavia no sabes que queres

Es el mismo criterio que vimos con Page Object Model en la seccion 7: el patron no es bueno ni malo, es proporcional al tamano del problema.

## Falla 6: creer que mas agentes es mejor

La tentacion despues de armar cuatro es armar ocho: un arquitecto, un especialista en seguridad, un redactor de documentacion, un DevOps.

Cada agente agregado suma coordinacion, puntos de falla y oportunidades de que algo se pierda entre etapas. El valor de agregar uno nuevo tiene que superar ese costo.

La pregunta antes de crear uno:

> Este rol produce algo que ninguno de los que ya tengo produce, y lo necesito en la mayoria de los ciclos?

Si la respuesta es "a veces viene bien", no es un agente. Es una instruccion dentro de uno de los que ya tenes.

## Los controles humanos, resumidos

| Momento | Control | Por que ahi |
|---------|---------|-------------|
| Despues del BA | **Obligatorio.** Leer los requerimientos y confirmarlos | Unico punto donde un error del requerimiento es barato |
| Despues del Review, en la tercera vuelta | **Obligatorio.** Decidir si se sigue o se para | El ciclo no termina solo |
| Despues del QA | **Recomendado.** Clasificar los fallos | El agente puede confundir un bug real con un test malo |
| Al final | Revisar el resultado completo | Lo de siempre |

El primero es el que mas ahorra. Los demas son higiene.

## La conclusion incomoda

El orquestador automatiza la ejecucion, no el criterio.

Te ahorra acarrear contexto entre pasos y te garantiza que la etapa de revision no se saltea. No te ahorra entender el problema, decidir que importa, ni verificar que lo que salio sirve.

Si el patron te deja sin mirar lo que produce, no estas ahorrando trabajo. Estas acumulando una deuda que se paga cuando alguien descubre que los cuatro agentes trabajaron perfectamente sobre el requerimiento equivocado.