# 13. Token Efficiency

## Que es un token

Un token es un pedacito de texto (mas o menos 4 caracteres, o 3/4 de palabra). Todo lo que le mandas a Claude y todo lo que te responde se mide en tokens.

Por que te importa:

1. **Limite de contexto**: Claude tiene un limite de cuanto texto puede manejar en una conversacion. Si lo llenas de basura, se queda sin espacio para lo importante.
2. **Costo**: si usas la API, pagas por token. En Claude Code con suscripcion, hay limites de uso.
3. **Calidad**: contexto lleno de ruido = respuestas peores. Claude se "distrae" con informacion irrelevante.

---

## El problema con MCP y las paginas web

Cuando Claude navega un sitio con Playwright MCP, puede traer el HTML completo de la pagina. Un sitio moderno puede tener 500 KB de HTML. Eso son cientos de miles de tokens, la mayoria basura (scripts, estilos inline, divs anidados sin sentido).

Ejemplo real: el HTML completo de la pagina de productos de saucedemo son unas 15.000 palabras. El HTML que realmente necesitas para generar el test son unas 50.

---

## Tecnicas para gastar menos

### 1. Snapshot en vez de HTML completo

Playwright MCP tiene un modo "accessibility snapshot" que devuelve solo la estructura semantica (roles, nombres, estados), no el HTML crudo.

```
Usa el snapshot de accesibilidad en vez del HTML completo
```

El snapshot de una pagina es ~10x mas chico que el HTML y contiene justo lo que necesitas para los locators (roles y nombres accesibles).

### 2. Pedir solo la seccion que importa

En vez de:
```
Navega a la pagina de productos y genera un test
```

Mejor:
```
Navega a la pagina de productos. Mirame solo el primer .inventory_item
y el badge del carrito. Con eso genera el test.
```

### 3. Copy outerHTML manual (el metodo mas barato)

Si ya sabes que elemento queres testear, no hace falta que Claude navegue nada:

1. DevTools > Inspect sobre el elemento
2. Click derecho > Copy > Copy outerHTML
3. Pegalo en el prompt

Le estas dando 20 lineas en vez de 5.000. El test sale igual de bien.

### 4. Reutilizar contexto en vez de repetirlo

Mal:
```
[prompt 1] Aca va todo el HTML... genera el test de login
[prompt 2] Aca va todo el HTML otra vez... genera el test de carrito
```

Bien:
```
[prompt 1] Aca va el HTML... genera el test de login
[prompt 2] Ahora, con el mismo contexto, genera el test de carrito
```

Claude ya tiene el HTML de la conversacion. No se lo repitas.

### 5. Cerrar la conversacion cuando cambias de tema

Si terminaste con los tests de login y vas a arrancar con los de reportes, abri una conversacion nueva. Arrastrar 50.000 tokens de contexto viejo no te ayuda.

### 6. No pegues archivos enteros si solo cambia una funcion

Mal:
```
Aca esta mi archivo de 400 lineas, cambia el locator del boton de submit
```

Bien:
```
En mi test tengo esta linea:
await page.locator('.btn-primary').click();

Cambiala para que use getByRole
```

---

## Cuando SI conviene gastar tokens

No se trata de ahorrar siempre. Hay casos donde darle mas contexto vale la pena:

- **Primera vez en un sitio nuevo**: dejalo navegar y explorar. Vas a gastar, pero despues tenes el contexto para varios tests.
- **Debugging de algo raro**: pegale el error completo, el stack trace, el HTML. Necesita todo para encontrar el problema.
- **Refactor grande**: si le pedis que reorganice toda la suite, necesita verla toda.

La regla: gasta tokens en entender el problema, ahorralos en tareas repetitivas.

---

## Como saber cuanto estas gastando

En Claude Code:

```bash
/cost
```

Te muestra el consumo de la sesion actual.

```bash
/context
```

Te muestra cuanto del contexto esta ocupado.

Si ves que el contexto esta al 80%, es momento de cerrar y abrir una conversacion nueva (o usar `/compact` para comprimir lo que hay).

---

## Comparacion practica

Generar el mismo test de "agregar producto al carrito":

| Metodo | Tokens aprox | Calidad del test |
|--------|-------------|------------------|
| MCP navegando con HTML completo | ~80.000 | Buena |
| MCP con accessibility snapshot | ~8.000 | Buena |
| outerHTML pegado a mano | ~500 | Buena |
| Sin contexto (zero shot) | ~100 | Mala (adivina locators) |

Conclusion: el outerHTML pegado a mano es el punto dulce. MCP sirve cuando no sabes que hay en la pagina o el flujo tiene muchos pasos.

---

## Resumen

1. No le des el HTML completo si podes darle 20 lineas
2. Usa accessibility snapshot en vez de HTML crudo cuando uses MCP
3. No repitas contexto que Claude ya tiene
4. Conversacion nueva cuando cambias de tema
5. Chequea `/context` de vez en cuando
6. Gasta tokens donde agregan valor (entender), ahorralos donde no (repetir)