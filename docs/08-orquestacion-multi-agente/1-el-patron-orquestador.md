# 1. El patron orquestador

## Que es

Un agente cuyo unico trabajo es decidir **a quien le toca** y **en que orden**, y pasar la salida de uno como entrada del siguiente.

No escribe codigo. No escribe tests. No revisa nada. Reparte.

## En que se diferencia de encadenar prompts a mano

Sin orquestador, el flujo lo manejas vos:

```
Vos: "Escribi los requerimientos para la pantalla de login"
     [lees la salida]
Vos: "Ahora implementalo"
     [copias los requerimientos al prompt]
Vos: "Ahora revisa ese codigo"
     [copias el codigo al prompt]
Vos: "Ahora escribi los tests"
```

Funciona. El problema es que sos vos el que acarrea el contexto de un paso al siguiente, y sos vos el que se acuerda de que el paso de revision existe.

Con orquestador:

```
Vos: "Necesito una pantalla de login con recuperacion de contrasena"

Orquestador: delega al BA
             recibe los requerimientos
             delega al DEV con esos requerimientos
             recibe el codigo
             delega al Code Reviewer con ese codigo
             recibe las criticas
             si hay criticas graves, vuelve al DEV
             delega al QA
             te devuelve el resultado
```

La diferencia real no es ahorrarte tipeo. Es que **el proceso queda escrito en algun lado** en vez de vivir en tu cabeza. Si manana lo hace otra persona, sigue los mismos pasos.

## El flujo completo

```
Pedido del usuario
       |
       v
  [ORQUESTADOR]
       |
       v
     [BA] -----> requerimientos + criterios de aceptacion
       |
       v
  <<< PUNTO DE CONTROL HUMANO >>>
       |
       v
    [DEV] -----> codigo
       |
       v
 [CODE REVIEWER] -----> criticas
       |
       +--- hay problemas graves? ---> vuelve al DEV
       |
       v
     [QA] -----> tests + reporte de defectos
       |
       v
   Resultado
```

El unico punto de control humano obligatorio esta despues del BA. El archivo 03 explica por que ahi y no al final.

## Como se arma en Claude Code

Cada agente es un archivo markdown en `.claude/agents/`. El frontmatter define el nombre y, sobre todo, **cuando se usa**.

```markdown
---
name: ba-agent
description: Convierte un pedido de negocio en requerimientos tecnicos con criterios de aceptacion. Usar como primer paso de cualquier funcionalidad nueva.
---

(instrucciones del agente)
```

El `description` es lo que Claude Code lee para decidir si invocarlo. Si esta mal escrito, el agente nunca se usa.

El orquestador es otro archivo mas, pero sus instrucciones son distintas: en vez de describir una tarea, describen un proceso.

```markdown
---
name: orquestador
description: Coordina el ciclo completo de una funcionalidad nueva: requerimientos, implementacion, revision y testing. Usar cuando el pedido abarca mas de una etapa.
---

Tu trabajo es coordinar, no ejecutar. No escribas codigo, requerimientos ni tests
vos mismo. Delega cada etapa al agente que corresponde.

## El orden

1. ba-agent: convierte el pedido en requerimientos
2. PARAR. Presentale los requerimientos al usuario y pedile confirmacion
   antes de seguir.
3. dev-agent: implementa los requerimientos aprobados
4. code-review-agent: revisa el codigo
5. Si la revision encuentra problemas de correctitud o seguridad, volve al
   paso 3 con las criticas. Maximo dos vueltas; si en la tercera sigue habiendo
   problemas graves, parar y reportarselo al usuario.
6. qa-agent: escribe los tests

## Reglas

- Pasale a cada agente solo lo que necesita para su tarea, no todo el historial.
- No resumas ni reinterpretes la salida de un agente antes de pasarla al
  siguiente. Pasala tal cual.
- Si un agente devuelve algo que no entendes o que contradice lo anterior,
  parar y preguntarle al usuario. No improvises.
- Al terminar, decile al usuario que hizo cada agente, en tres lineas.
```

## Las tres reglas que hacen que funcione

**Pasale a cada agente solo lo que necesita.** Si le mandas todo el historial, el agente se distrae con informacion que no le corresponde y el contexto se llena de ruido. El DEV no necesita saber como el BA llego a los requerimientos.

**No resumas la salida de un agente.** Es la tentacion mas grande del orquestador: "el BA dijo esto, se lo paso resumido al DEV". Cada resumen pierde informacion, y el que la pierde no es el que la va a necesitar.

**Limite de vueltas.** Sin un maximo, DEV y Code Reviewer pueden quedar en un ciclo: el revisor pide un cambio, el dev lo hace, el revisor encuentra otra cosa. Dos vueltas y despues decide un humano.

## Lo que el orquestador no hace

**No valida.** Si el BA entrega requerimientos equivocados, el orquestador los pasa al DEV sin cuestionarlos. No tiene criterio sobre el dominio del problema, solo sobre el orden de los pasos.

**No decide que importa.** Si el Code Reviewer devuelve 15 observaciones, el orquestador no sabe cuales son criticas y cuales son gusto personal. Por eso en las instrucciones hay que decirle explicitamente que tipo de hallazgo dispara una vuelta al DEV (correctitud y seguridad) y cual no (estilo).

**No reemplaza al product owner.** El pedido inicial sigue siendo tuyo, y la definicion de "terminado" tambien.

## El paralelo con la seccion 7

En la seccion 7 el reparto era:

```
1. Armar el agente       -> vos
2. Explorar              -> IA
3. Revisar el plan       -> vos
4. Generar               -> IA
5. Correr                -> maquina
6. Clasificar            -> vos
7. Arreglar tests        -> IA
8. Reportar bugs         -> vos + IA
9. Revisar estructura    -> vos
```

Con orquestador, los pasos 2, 4 y 7 quedan encadenados automaticamente. Los pasos 1, 3, 6 y 9 siguen siendo tuyos.

El orquestador automatiza la **ejecucion**, no el **criterio**.