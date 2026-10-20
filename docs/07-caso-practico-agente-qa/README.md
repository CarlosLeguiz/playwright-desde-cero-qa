# 7. Caso practico: construir y auditar un agente de QA

Los modulos anteriores son teoria: que es un locator, como se escribe una assertion, como se le habla a Claude Code. Este es distinto. Es un proyecto completo de punta a punta, con los numeros reales de lo que salio bien y lo que salio mal.

## El planteo

Armar un agente de QA desde una carpeta vacia, apuntarlo a una aplicacion que nunca testeaste, y despues hacer la parte que casi nadie hace: **auditar lo que la IA produjo**.

Aplicacion bajo prueba: [saucedemo.com](https://www.saucedemo.com). Se eligio porque tiene defectos puestos a proposito. Un agente bien instruido los encuentra. Uno mal instruido escribe tests que pasan igual.

## Por que este modulo existe

Ver a un agente generar tests no es lo mismo que tener uno.

La IA escribe codigo plausible en segundos. Lo dificil no es eso. Lo dificil es:

- Decidir **que** testear (la IA no conoce tu negocio)
- Distinguir un **bug real** de un **test mal escrito** cuando algo falla
- Encontrar lo que al agente **se le escapo**
- Decidir si un patron de diseno **vale la pena** o solo agrega archivos

Eso es lo que separa a un QA que usa IA de uno al que la IA reemplaza.

## Los numeros reales de este caso

| Metrica | Resultado |
|---------|-----------|
| Escenarios en el plan de pruebas | 58 (+3 agregados en la revision) |
| Tests generados | 87 |
| Pasaron en la primera corrida | 49 |
| Fallaron en la primera corrida | 38 |
| Fallos por defecto real del producto | 29 |
| Fallos por test mal escrito | 9 |
| Defectos distintos reportados | 19 |

El dato que importa: **el 79% de los fallos eran defectos reales**, no errores del test. Eso es evidencia de que las instrucciones del agente funcionaron. Si hubiera sido al reves, el archivo de instrucciones estaba flojo.

## Contenido

| Archivo | Tema |
|---------|------|
| [01-armar-el-agente.md](01-armar-el-agente.md) | Config, MCP a nivel proyecto, y como escribir instrucciones que produzcan tests utiles |
| [02-plan-de-pruebas.md](02-plan-de-pruebas.md) | Hacer que el agente explore solo, y como revisar su plan con criterio |
| [03-clasificar-fallos.md](03-clasificar-fallos.md) | La habilidad central: bug real vs test mal escrito |
| [04-bug-reports.md](04-bug-reports.md) | Como escribir un reporte de defecto que alguien pueda usar |
| [05-page-object-model.md](05-page-object-model.md) | Que es, cuando conviene y cuando es sobreingenieria |

## El ciclo completo

```
1. Armar el agente       -> config + MCP + instrucciones
2. Explorar              -> el agente navega solo y arma el plan
3. Revisar el plan       -> vos buscas lo que falta
4. Generar               -> el agente escribe los tests
5. Correr                -> primera corrida, numeros crudos
6. Clasificar            -> bug real vs test malo
7. Arreglar los tests    -> solo los que estaban mal escritos
8. Reportar los bugs     -> los defectos reales se documentan
9. Revisar la estructura -> vale la pena refactorizar?
```

Los pasos 1, 3, 6 y 9 son tuyos. Los pasos 2, 4 y 7 los hace la IA. El 5 lo hace la maquina.

Eso es el reparto real del trabajo.

## Lo que la IA no puede hacer

Al terminar este caso, lo que quedo claro:

- El agente **exploro mejor** que yo en mi primera lectura de su propio plan. De tres escenarios que propuse como "faltantes", dos ya estaban cubiertos y el agente me lo marco.
- El agente **encontro defectos** que las instrucciones ni mencionaban, incluidos dos usuarios de prueba que yo no sabia que existian.
- Lo que **no pudo hacer**: decidir que defectos importan, cuales huecos vale la pena cerrar, y si una abstraccion se justifica.

La IA escribe el codigo. La estrategia de testing sigue siendo del QA.