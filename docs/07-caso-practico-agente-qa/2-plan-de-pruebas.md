# 2. El plan de pruebas: exploracion autonoma y revision critica

## Por que un plan antes del codigo

El error mas comun al automatizar con IA es pedirle tests directamente. Sale codigo que funciona y cubre lo obvio.

Un plan escrito primero te obliga a pensar **que** se testea antes de **como**. Y te da algo que podes revisar en cinco minutos, en vez de 87 archivos de codigo.

## Hacer que el agente explore solo

La instruccion clave es no contarle nada sobre el sitio.

```
Explore https://www.saucedemo.com using the Playwright MCP server.

Do not assume anything about what this site does. Navigate it yourself, log in,
click through every screen you find, and discover the flows on your own.

Then write a test plan to test-plan.md covering at least these areas:
- Authentication, including failure cases
- Product listing and sorting
- Cart add and remove
- Full checkout flow

For each scenario include:
- A scenario ID (AUTH-01, PROD-01, CART-01, CHK-01...)
- What it verifies
- Preconditions
- Steps
- Expected result
- Priority (high / medium / low)

Do NOT generate any test code yet. Only the plan.
```

Dos cosas importantes de ese prompt:

**"Do not assume anything"** evita que trabaje desde lo que ya sabe de saucedemo por haberlo visto en su entrenamiento. Lo obliga a mirar la version real que esta online hoy.

**"Do NOT generate any test code yet"** es lo que separa el paso de pensar del paso de escribir. Sin esa linea, arranca a codear a los dos minutos.

## Que tarda

En este caso: 13 minutos y unas 40 navegaciones.

Es lento y esta bien. Esta haciendo lo que haria un QA manual el primer dia: abrir cada pantalla, probar cada usuario, anotar lo raro.

Un agente que te devuelve un plan en 30 segundos no exploro nada, lo invento.

## Lo que encontro

El plan salio con 58 escenarios. Pero lo valioso fueron los hallazgos que **no estaban en las instrucciones**:

**Dos usuarios que yo no sabia que existian.** El `CLAUDE.md` listaba cuatro. La pagina de login lista seis: aparecieron `error_user` y `visual_user`, los dos con defectos reales.

**Defectos en el usuario "normal".** Yo asumia que `standard_user` funcionaba bien y los bugs estaban solo en los usuarios rotos. No:

- "Reset App State" vacia el carrito pero los botones siguen diciendo "Remove" hasta que recargas
- El carrito sobrevive al logout: el siguiente usuario que entra hereda el carrito del anterior

**El carrito vive en localStorage.** Detalle tecnico que cambia como se escriben los tests: cada uno tiene que limpiar o sembrar `cart-contents`, si no se contaminan entre si.

## La parte tuya: revisar el plan

Aca es donde el ejercicio se pone interesante. Hay que encontrar lo que se le escapo.

Mi primer intento fue malo, y vale documentarlo.

Propuse tres escenarios como "faltantes":

1. Acceso directo por URL sin sesion
2. Boton Atras del browser despues del logout
3. Persistencia del orden al navegar

Cuando le pedi al agente que los implementara, me respondio:

> "AUTH-14 and AUTH-15 overlap with existing plan items (AUTH-10, AUTH-11)."

Dos de los tres ya estaban cubiertos. Yo habia leido el plan por arriba y asumi los huecos en vez de verificarlos.

**La leccion:** revisar un plan de 58 escenarios no es leerlo en diagonal. Si vas a decir "esto falta", tenes que buscar primero si ya esta.

## Como encontrar huecos de verdad

Lo que funciono fue preguntar en vez de asumir. Le tire una lista de candidatos y le pedi que verificara cada uno contra el plan:

```
Gap analysis. For each of the following, tell me whether the plan already covers it.
Answer yes (with the scenario ID) or no. Do not write any code.

1. Item total equals the exact sum of the individual item prices in the cart,
   verified against the prices shown on the product listing.
2. Tax equals the subtotal times 8% rounded to the cent, not truncated.
3. Total equals item total plus tax, to the cent.
4. Submitting the same order twice: double-clicking Finish, or pressing browser
   back from the complete page and clicking Finish again.
5. Cart badge disappears (not "shows 0") after a completed order.
```

Respuesta: 2 y 3 cubiertos, 1 cubierto indirectamente, **4 no cubierto**, 5 cubierto pero con un test debil.

De ahi salieron los agregados genuinos.

## De donde sacar los candidatos

Los cinco de arriba no salieron de la nada. Hay patrones que los planes generados casi siempre dejan afuera:

**Aritmetica verificada contra el origen.** Los planes verifican consistencia interna ("total = subtotal + impuesto") pero rara vez trazan el numero hasta donde el usuario lo vio. Un bug de precios aguas arriba mantiene todas las sumas internas coherentes y aun asi cobra mal.

**Acciones repetidas.** El plan prueba el camino feliz una vez. Que pasa si haces doble click? Si apretas Atras y volves a intentar? Esos son los bugs que cuestan plata.

**Estado que persiste entre pantallas.** Elegiste un filtro, navegaste, volviste. Sigue el filtro? Los planes prueban cada pantalla aislada.

**Estado que persiste entre sesiones.** El carrito sobrevive al logout? Los datos de un usuario llegan al siguiente?

**El camino de vuelta.** El plan prueba A → B → C. Que pasa yendo C → B → A?

## Los tres que quedaron

| ID | Escenario | Resultado |
|----|-----------|-----------|
| PROD-17 | El orden elegido persiste al navegar | Defecto real: se resetea a A→Z al volver de un producto |
| CHK-17 | Una orden no se puede enviar dos veces | **Defecto real**: doble click en Finish dispara el handler dos veces |
| CHK-18 | El total cobrado coincide con los precios del listado | Pasa, pero cierra un hueco que el plan cubria solo indirecto |

CHK-17 es el mas valioso. El plan probaba el checkout como un unico camino hacia adelante y nunca volvia sobre una orden completada. En un sistema real, una orden duplicada es un cliente cobrado dos veces: el fallo mas caro de todo el flujo.

## Documentar la revision honestamente

En el plan final, la seccion de agregados no dice "el agente se perdio tres cosas". Dice:

```markdown
## Tester review of the agent's plan

I initially proposed two scenarios: direct URL access without a session, and browser
back after logout. Both were already covered. I withdrew them rather than duplicate
coverage.

This is worth recording. The agent's exploration was more thorough than my first read
of the plan suggested, and two of my three initial "gaps" were my error, not the
agent's.
```

Esa honestidad vale mas que inventar tres hallazgos. Muestra que revisaste de verdad y que el proceso te corrigio.

## Resumen

1. Pedi el plan antes que el codigo, explicitamente
2. No le cuentes nada del sitio: que explore
3. Si tarda 30 segundos, no exploro
4. Para revisar, verifica antes de afirmar que algo falta
5. Busca en los patrones que los planes generados ignoran: aritmetica contra el origen, acciones repetidas, estado que persiste, el camino de vuelta
6. Documenta tambien lo que propusiste mal