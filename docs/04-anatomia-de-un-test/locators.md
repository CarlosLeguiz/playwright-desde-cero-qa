# Locators: encontrar elementos en la página

Un locator es la forma en que Playwright encuentra un elemento en la página para poder interactuar con él (clickearlo, escribir en él, verificar su contenido).

Este es el tema más importante de todo Playwright. Un test con buenos locators dura años sin romperse. Un test con malos locators se rompe cada vez que el equipo cambia un color o un layout.

## ¿Qué es un locator?

Cuando escribís:

```javascript
page.getByRole('button', { name: 'Enviar' })
```

Estás creando un locator: una "referencia" a un elemento de la página que dice "buscá el botón que se llama Enviar".

**Importante:** el locator NO ejecuta la búsqueda al momento. Es como una promesa de "cuando la necesites, buscá esto". La búsqueda se ejecuta cuando hacés una acción o assertion sobre él.

```javascript
// Esto NO busca nada todavía
const boton = page.getByRole('button', { name: 'Enviar' });

// Recién acá busca el botón y lo clickea
await boton.click();
```

Esto es útil porque podés guardar locators en variables y reutilizarlos.

## Los locators recomendados por Playwright

Playwright tiene una filosofía clara: **buscá elementos de la forma en que un usuario los percibiría**. No por su ID técnico o su clase CSS, sino por lo que se ve o se lee en la pantalla.

Los locators recomendados, en orden de preferencia:

### 1. `getByRole` (el rey de los locators)

Busca elementos por su rol de accesibilidad (el rol que usan los lectores de pantalla).

```javascript
page.getByRole('button', { name: 'Guardar' })
page.getByRole('link', { name: 'Ir al inicio' })
page.getByRole('heading', { name: 'Bienvenido' })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('checkbox', { name: 'Recordarme' })
```

**¿Por qué es el mejor?** Porque los roles son parte del HTML semántico. Un `<button>` siempre es un botón, aunque el equipo le cambie los estilos, la clase CSS o el ID.

**Roles comunes:**

- `button`: botones
- `link`: enlaces (`<a>`)
- `heading`: títulos (`<h1>` a `<h6>`)
- `textbox`: inputs de texto
- `checkbox`: casillas de verificación
- `radio`: radio buttons
- `combobox`: selects/dropdowns
- `list`: listas
- `listitem`: items de lista
- `img`: imágenes
- `alert`: mensajes de alerta

### 2. `getByLabel` (para formularios)

Busca inputs por el `<label>` que los acompaña.

```javascript
// Para este HTML:
// <label for="email">Email</label>
// <input id="email" type="email">

page.getByLabel('Email')
```

**¿Por qué es bueno?** Porque un formulario bien hecho SIEMPRE tiene labels para accesibilidad, y los labels son visibles al usuario.

### 3. `getByText` (para elementos identificables por su texto)

Busca elementos que contengan un texto específico.

```javascript
page.getByText('Bienvenido, Carlos')
page.getByText('Pedido confirmado')
```

**Cuándo usarlo:** cuando el elemento no tiene un rol claro pero SÍ tiene un texto único que lo identifica.

### 4. `getByPlaceholder` (para inputs con placeholder)

```javascript
// Para: <input placeholder="Buscar productos...">
page.getByPlaceholder('Buscar productos...')
```

### 5. `getByAltText` (para imágenes)

```javascript
// Para: <img alt="Logo de la empresa">
page.getByAltText('Logo de la empresa')
```

### 6. `getByTitle` (para elementos con atributo title)

```javascript
// Para: <button title="Cerrar ventana">X</button>
page.getByTitle('Cerrar ventana')
```

### 7. `getByTestId` (último recurso semántico)

Busca por un atributo `data-testid` puesto especialmente para tests.

```javascript
// Para: <div data-testid="carrito-total">$1.500</div>
page.getByTestId('carrito-total')
```

**Cuándo usarlo:** cuando el elemento no tiene rol, texto ni label útil. Requiere que el equipo de frontend agregue `data-testid` en el código.

## Locators por CSS y XPath (evitar en lo posible)

Playwright también soporta selectores CSS y XPath, pero **son la última opción**.

### CSS

```javascript
page.locator('.btn-primary')
page.locator('#login-button')
page.locator('div.modal > button.close')
```

### XPath

```javascript
page.locator('//button[@class="btn-primary"]')
page.locator('//div[contains(@class, "modal")]//button')
```

**¿Por qué evitarlos?**

- Las clases CSS cambian cuando cambia el diseño
- Los IDs a veces son generados dinámicamente
- XPath es difícil de leer y mantener
- No representan cómo el usuario percibe la interfaz

Solo usalos si:
- El equipo de frontend no puede agregar `data-testid`
- El elemento no tiene texto ni rol único
- Estás testeando código legacy donde no podés cambiar el HTML

## Encadenar locators

Podés combinar locators para ser más específico.

### `.filter()` para filtrar por contenido

```javascript
// Todos los items de lista que contengan el texto "En stock"
page.getByRole('listitem').filter({ hasText: 'En stock' })
```

### `.locator()` para buscar adentro de otro locator

```javascript
// El botón "Comprar" que está dentro del producto con nombre "Zapatillas"
page.getByRole('listitem').filter({ hasText: 'Zapatillas' })
    .getByRole('button', { name: 'Comprar' })
```

### `.first()`, `.last()`, `.nth(index)` para elegir por posición

```javascript
page.getByRole('listitem').first()      // el primero
page.getByRole('listitem').last()       // el último
page.getByRole('listitem').nth(2)       // el tercero (índice 0)
```

## Regla de oro: locators visibles al usuario

Preguntate: "**¿un usuario podría describir este elemento con lo que ve en la pantalla?**"

Si la respuesta es sí, tu locator es bueno:
- "El botón Enviar" → `getByRole('button', { name: 'Enviar' })` ✅
- "El campo de Email" → `getByLabel('Email')` ✅
- "El mensaje de Bienvenido" → `getByText('Bienvenido')` ✅

Si tu locator apunta a algo invisible al usuario, probablemente sea frágil:
- `.locator('.css-1a2b3c4')` ❌ (una clase generada automáticamente)
- `.locator('#btn_12345')` ❌ (un ID dinámico)
- `.locator('div > div > div > span:nth-child(3)')` ❌ (estructura DOM interna)

## Herramientas para descubrir locators

### Playwright Inspector

Corré:

```bash
npx playwright test --debug
```

Se abre el Inspector con una función "Pick Locator". Click sobre cualquier elemento de la página y te sugiere el mejor locator posible.

### Codegen

```bash
npx playwright codegen https://tu-app.com
```

Grabás tus clicks y Playwright genera código con los mejores locators automáticamente. Ideal para aprender viendo qué locator elegiría un experto.

### Extensión de VS Code

La extensión "Playwright Test for VSCode" tiene un botón "Pick locator" que hace lo mismo desde el editor.

## Ejemplos prácticos

### Un formulario de login

```javascript
await page.goto('https://miapp.com/login');
await page.getByLabel('Email').fill('carlos@test.com');
await page.getByLabel('Contraseña').fill('12345');
await page.getByRole('button', { name: 'Ingresar' }).click();
```

### Un checkout de e-commerce

```javascript
await page.getByRole('link', { name: 'Carrito' }).click();
await page.getByRole('button', { name: 'Finalizar compra' }).click();
await page.getByLabel('Dirección de envío').fill('Av. Colón 1234');
await page.getByRole('combobox', { name: 'Provincia' }).selectOption('Córdoba');
await page.getByRole('button', { name: 'Confirmar pedido' }).click();
```

### Interactuar con una fila específica de una tabla

```javascript
const filaCarlos = page.getByRole('row').filter({ hasText: 'Carlos Leguizamón' });
await filaCarlos.getByRole('button', { name: 'Editar' }).click();
```

## Resumen

- Un locator es una referencia a un elemento de la página
- La búsqueda se ejecuta al momento de hacer una acción, no al crear el locator
- Orden de preferencia: `getByRole` → `getByLabel` → `getByText` → `getByPlaceholder` → `getByTestId` → CSS/XPath
- Regla de oro: buscá elementos como los describiría un usuario
- Podés encadenar locators con `.filter()`, `.locator()`, `.first()`, `.last()`, `.nth()`
- Playwright tiene herramientas visuales para descubrir locators (Inspector, Codegen, extensión VS Code)

## Analogía final

Buscar elementos en una página es como pedirle a alguien que te alcance algo en una habitación:

- **Malo:** "traeme el objeto que está en la tercera balda del segundo estante, tercer objeto de izquierda a derecha, el que mide 15 cm"
- **Bueno:** "traeme el libro rojo de García Márquez"

El bueno describe el objeto por lo que ES, no por dónde está. Cuando cambien de lugar los muebles, la instrucción sigue funcionando.

Eso es lo que hace `getByRole('button', { name: 'Enviar' })`: no depende de dónde está el botón ni de qué clase CSS tiene, solo de qué es y cómo se llama.