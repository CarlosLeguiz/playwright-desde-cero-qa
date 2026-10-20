# 8. Orquestacion multi-agente

En la seccion 7 armamos dos agentes sueltos: uno que escribe tests y otro que los revisa. Vos decidias cual usar en cada momento.

Esta seccion es el paso siguiente: varios agentes especializados coordinados por un **orquestador**, que decide a quien le toca y en que orden.

## El equipo

Cuatro agentes que replican los roles de un equipo de software:

| Agente | Rol | Que recibe | Que entrega |
|--------|-----|-----------|-------------|
| **BA** | Business Analyst | Un pedido en lenguaje de negocio | Requerimientos y criterios de aceptacion |
| **DEV** | Desarrollador | Los requerimientos | El codigo implementado |
| **Code Reviewer** | Revisor | El codigo | Criticas: bugs, deuda tecnica, riesgos |
| **QA** | Testing | El codigo aprobado | Tests automatizados y reporte de defectos |

Mas el **orquestador**, que no hace ninguna de esas tareas. Su unico trabajo es repartir.

## Por que no un solo agente que haga todo

Tres razones, en orden de importancia.

**1. Sesgo.** Un agente que escribe el codigo y despues lo revisa defiende lo que escribio. En la corrida real documentada en el archivo 05, el revisor encontro un comentario que mentia sobre el comportamiento del codigo. El que lo escribio creia que era verdad.

**2. Instrucciones mas precisas.** Un agente con un solo trabajo puede tener instrucciones largas y especificas sobre ese trabajo. Uno que hace cuatro cosas tiene instrucciones genericas sobre las cuatro.

**3. Contexto mas limpio.** Cada agente arranca con lo que necesita para su tarea, no con todo el historial del proyecto.

## Contenido

| Archivo | Tema |
|---------|------|
| [01-el-patron-orquestador.md](01-el-patron-orquestador.md) | Que es un orquestador, el flujo completo, y en que se diferencia de encadenar prompts |
| [02-los-cuatro-agentes.md](02-los-cuatro-agentes.md) | Como escribir cada agente: rol, entrada, salida, y que no debe hacer |
| [03-donde-se-rompe.md](03-donde-se-rompe.md) | Los seis modos de falla del patron y donde van los controles humanos |
| [04-marketplace-y-seguridad.md](04-marketplace-y-seguridad.md) | Buscar agentes ya hechos con `/plugin`, elegirlos, y verificar que no traigan codigo malicioso |
| [05-el-ciclo-en-la-practica.md](05-el-ciclo-en-la-practica.md) | Una corrida real de punta a punta: 9 minutos, 23 tests, y los ocho momentos donde todo se freno a esperar un humano |

## El punto que importa mas

Un orquestador no valida, reparte.

Si el BA interpreta mal el pedido, el DEV implementa bien los requerimientos equivocados, el revisor no encuentra nada porque el codigo esta bien, y el QA escribe tests que pasan contra criterios equivocados.

Resultado: codigo correcto, revisado y testeado, que resuelve el problema que no era.

Por eso el control humano va **despues del BA**, no al final. Es el unico punto donde un error todavia cuesta una conversacion de dos minutos.

En la corrida documentada en el archivo 05 eso se ve en concreto: el BA entrego 10 requerimientos y se freno con cuatro preguntas que no podia contestar solo. Treinta segundos de respuesta evitaron nueve minutos de trabajo sobre supuestos equivocados.

## Armarlos a mano o bajarlos del marketplace

Las dos cosas. El criterio:

| Situacion | Que conviene |
|-----------|--------------|
| El rol depende de tus convenciones | Escribirlo vos |
| El rol es generico | Bajarlo del marketplace |
| El plugin trae mucho mas de lo que necesitas | Escribirlo vos |

En el proyecto de ejemplo: BA, Code Reviewer, QA y el orquestador escritos a mano; DEV bajado del marketplace. El archivo 04 explica como buscar, elegir y verificar.

## Cuando no usar el patron

Para una tarea chica, el orquestador es puro costo: cuatro agentes coordinados para arreglar un typo.

Rinde cuando el trabajo tiene etapas de verdad distintas, cuando el sesgo de "me reviso a mi mismo" importa, y cuando vas a repetir el mismo flujo muchas veces.

Es la misma logica que vimos con Page Object Model en la seccion 7: el patron no es bueno o malo, es proporcional al tamano del problema.