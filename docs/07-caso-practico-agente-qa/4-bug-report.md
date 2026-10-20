# 4. Escribir bug reports

Un test que falla no es un reporte de defecto. El test le habla a la suite; el reporte le habla a una persona que tiene que arreglarlo.

## La regla del uno a uno que no aplica

En este caso hubo 29 fallos por defectos reales, pero solo 19 defectos distintos.

Un mismo bug rompe varios tests. El carrito que sobrevive al logout rompe dos escenarios. Los botones de agregar que no funcionan en `problem_user` y `error_user` son el mismo defecto contado dos veces.

**Un reporte por defecto, no por test fallido.** Si abris 29 tickets para 19 bugs, el equipo de desarrollo cierra 10 como duplicados y pierde confianza en tus reportes.

## El formato

```markdown
### BUG-01: Listing prices are randomised on every render for visual_user

- **Severity:** Critical. The customer sees a price that differs from what they
  are charged.
- **Affected users:** visual_user
- **Preconditions:** logged in as visual_user, on /inventory.html
- **Steps to reproduce:**
  1. Log in as visual_user / secret_sauce
  2. Note the price shown for "Sauce Labs Backpack"
  3. Reload the page
  4. Note the price again
  5. Add the product to the cart and proceed to the checkout overview
- **Expected result:** the price is $29.99 at every step.
- **Actual result:** the listing shows a different random value on each render
  ($30.91, then $52.61). The details page and the checkout overview both show
  $29.99.
- **Caught by:** PROD-15, "listing price matches the price charged"
- **Notes:** this is one of the intentional defects of the demo app, but it is
  the defect class that matters most in a real system.
```

## Los seis campos, y por que cada uno

**Titulo.** Una linea que dice que esta roto, no donde lo encontraste. "Login no funciona" es inutil. "Double-clicking Finish submits the order twice" se entiende sin abrir el ticket.

**Severidad.** Con una linea que la justifique. Volvemos a esto abajo.

**Usuarios afectados.** Cambia la prioridad por completo. Un bug que solo pasa con un usuario de prueba no es lo mismo que uno que afecta a todos.

**Precondiciones.** El estado necesario para reproducirlo. Sin esto, el dev prueba en otro estado, no lo ve, y cierra el ticket como "no reproducible".

**Pasos.** Numerados, y lo bastante especificos para que alguien los siga **sin leer el codigo del test**. Este es el campo donde mas se falla: escribir "correr PROD-15" no es un paso.

**Esperado vs actual.** Los dos. "No funciona" no dice que esperabas.

**Que test lo detecta.** Cierra el circulo: cuando el dev lo arregle, sabe que correr para verificar.

## Severidad por impacto real, no por ruido

El error comun es asignar severidad por lo escandaloso que se ve el fallo. Una imagen rota se ve mucho; un calculo de impuestos mal no se ve.

El criterio correcto es el costo en el mundo real.

| Severidad | Criterio | Ejemplo de este caso |
|-----------|----------|---------------------|
| **Critical** | Pierde plata, datos o seguridad | Doble click en Finish envia la orden dos veces. Checkout de $0.00 con el carrito vacio. Precios aleatorios que no coinciden con lo cobrado. |
| **High** | Bloquea un flujo principal | Finish no hace nada, la orden no se puede completar. Los links de producto abren el producto equivocado. |
| **Medium** | Funciona mal pero hay forma de seguir | El orden se resetea al navegar. "Reset App State" deja botones viejos hasta recargar. |
| **Low** | Cosmetico, sin impacto funcional | Imagenes rotas. Iconos desalineados. |

El ejemplo que ordena todo: **una imagen rota es Low, un impuesto mal calculado es Critical**, aunque la imagen se vea y el impuesto no.

## El caso que no es un bug

Uno de los reportes de este caso quedo como **"necesita decision de producto"** en vez de como defecto confirmado.

El campo de codigo postal acepta `abc!@#`. El test esperaba una validacion de formato y fallo.

Pero: nadie especifico nunca cual es el formato valido. Los codigos postales varian por pais; algunos tienen letras. Reportarlo como bug es adivinar un requerimiento que no existe.

El reporte quedo asi:

```markdown
### BUG-18: Postal code field accepts any characters

- **Status:** Needs a product decision, not confirmed as a defect.
- **Observed:** the field accepts "abc!@#" and the form submits.
- **Question for the product owner:** what is the expected format? Postal codes
  vary by country and some contain letters, so "digits only" may be wrong.
- **Caught by:** CHK-07
```

**Esa distincion es trabajo de QA, no de automatizacion.** Un junior reporta 19 bugs. Alguien con criterio reporta 18 bugs y 1 pregunta.

## Que no poner

**Codigo del test.** El reporte tiene que servirle a alguien que no abre tu repo. Referencia el test, no lo pegues.

**Especulacion sobre la causa.** "Seguramente es un problema del estado de React" no ayuda y suele estar mal. Reportas lo que observaste.

**Varios defectos en un reporte.** Si el titulo necesita un "y", son dos tickets.

**Lo que no viste.** En este caso el agente anoto durante la exploracion que `visual_user` tenia titulos desalineados, pero esa corrida especifica no lo reprodujo. El reporte no lo reclama. Solo se reporta lo que el test efectivamente vio.

## Ordenar por severidad

El archivo arranca con los Critical. Quien lo abre tiene que ver primero lo que mas duele.

Una tabla resumen al principio ayuda:

| ID | Severidad | Titulo | Usuarios |
|----|-----------|--------|----------|
| BUG-01 | Critical | Listing prices randomised on every render | visual_user |
| BUG-02 | Critical | Double-clicking Finish submits the order twice | todos |
| BUG-03 | Critical | Checkout completes with an empty cart at $0.00 | todos |
| ... | | | |

## Checklist

- [ ] Un reporte por defecto, no por test fallido
- [ ] Titulo que se entiende sin abrir el ticket
- [ ] Severidad por impacto real, con una linea que la justifique
- [ ] Pasos que alguien puede seguir sin leer codigo
- [ ] Esperado y actual, los dos
- [ ] Referencia al test que lo detecta
- [ ] Ordenados peor primero
- [ ] Lo que depende de una definicion de producto queda como pregunta, no como bug