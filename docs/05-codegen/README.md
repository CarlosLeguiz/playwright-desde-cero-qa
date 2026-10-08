# Módulo 5: Codegen

Codegen es la feature más impactante de Playwright para alguien que recién arranca. Te permite grabar tests automáticamente navegando por una página web, sin escribir una sola línea de código.

Si ya pasaste por el Módulo 4 y entendés qué son los locators y las assertions, acá vas a ver cómo Playwright **elige automáticamente los mejores locators por vos**, siguiendo las mismas buenas prácticas que aprendiste.

## Contenido del módulo

1. [¿Qué es Codegen?](./que-es-codegen.md)
   - Qué hace y qué no hace
   - Cómo funciona por dentro
   - Cuándo conviene usarlo

2. [Grabar tu primer test](./grabar-primer-test.md)
   - El comando `npx playwright codegen`
   - Las dos ventanas: navegador e Inspector
   - Grabar un flujo completo paso a paso

3. [Ajustar el código generado](./ajustar-el-codigo-generado.md)
   - Por qué nunca hay que usar el código tal cual
   - Agregar assertions
   - Mejorar nombres de test
   - Refactor para que sea mantenible

4. [Limitaciones y buenas prácticas](./limitaciones-y-buenas-practicas.md)
   - Qué cosas el codegen no sabe hacer bien
   - Cuándo escribir a mano es mejor
   - Codegen como herramienta de aprendizaje

## Objetivos de aprendizaje

Al terminar este módulo vas a poder:

- Grabar un test completo usando Codegen
- Entender qué código genera y por qué
- Identificar qué partes del código generado necesitan ajuste
- Agregar assertions al código grabado
- Decidir cuándo usar Codegen y cuándo escribir a mano

## Duración estimada

30 a 45 minutos entre lectura, grabación de tests y práctica.

## Prerrequisitos

- Haber completado el [Módulo 4: Anatomía de un test](../04-anatomia-de-un-test/README.md)
- Entender qué son `getByRole`, `getByText`, `expect` y las assertions

## Nota práctica

Codegen es una herramienta de aprendizaje muy poderosa, pero NO es un reemplazo del conocimiento. Un test generado por Codegen sin revisar es un test mediocre. El valor real de Codegen aparece cuando lo usás como asistente, no como autor.