# Limitaciones y buenas prácticas

Codegen es una herramienta potente pero limitada. Entender dónde falla te permite usarla bien y saber cuándo volver a escribir código a mano. Este archivo cierra el módulo con una visión realista.

## Lo que Codegen NO sabe hacer

### 1. No decide qué assertions tienen sentido

Codegen puede generar assertions si vos le decís con el botón "Assert visibility" o "Assert text". Pero NO sabe qué vale la pena verificar.

Ejemplos de assertions que Codegen nunca va a sugerir por su cuenta:

- Verificar que el total del carrito refleje la suma de los precios
- Verificar que después de un error, el formulario mantenga los datos ingresados
- Verificar que un email de confirmación tenga el nombre correcto del usuario
- Verificar que una API responde con el status esperado

Esas decisiones requieren pensar como QA. Codegen solo graba lo que vos le decís.

### 2. No maneja lógica condicional

Codegen graba una secuencia lineal: paso 1, paso 2, paso 3. No sabe hacer cosas como:

```javascript
if (await page.getByText('Modo oscuro').isVisible()) {
  await page.getByText('Modo oscuro').click();
}
```

Cualquier `if`, `for`, `while` o manejo de errores lo tenés que escribir vos.

### 3. No reutiliza código

Si grabás 5 tests que empiezan todos haciendo login, Codegen te da 5 veces el mismo bloque de login. No sabe:

- Extraer código común a un `beforeEach`
- Armar un Page Object
- Usar fixtures custom

Todo eso es trabajo manual que vemos en módulos posteriores.

### 4. No sabe manejar datos de prueba dinámicos

Codegen hardcodea los valores que escribís. Si querés que el test corra con un email aleatorio cada vez (útil para no colisionar con registros previos), tenés que modificar el código a mano:

```javascript
const emailUnico = `test-${Date.now()}@example.com`;
await page.getByLabel('Email').fill(emailUnico);
```

Esto Codegen no lo genera.

### 5. No sabe testear APIs

Si tu test necesita hacer una llamada HTTP directa (por ejemplo, para preparar datos antes del test o verificar una respuesta de backend), Codegen no puede ayudarte. Tenés que escribirlo a mano:

```javascript
const response = await request.get('https://api.miapp.com/usuarios/123');
expect(response.status()).toBe(200);
```

### 6. No sabe interceptar o mockear red

Para testear apps con IA (chatbots, generadores de contenido), es común querer mockear la respuesta del backend. Codegen no genera eso:

```javascript
await page.route('**/api/chat', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ respuesta: 'Hola, soy una respuesta mockeada' })
  });
});
```

Todo esto es a mano.

### 7. Puede generar locators frágiles en apps mal diseñadas

Codegen aplica buenas prácticas, pero depende del HTML de la página. Si la app no tiene roles semánticos, labels o textos únicos, Codegen va a caer a CSS o XPath, que son frágiles.

Ejemplo real: en una app con `<div>` por todos lados y sin labels, Codegen puede generar algo así:

```javascript
await page.locator('div:nth-child(3) > div > button').click();
```

Eso se rompe con cualquier cambio de layout. Si ves esto en tu código generado, es señal de que:

- O la app tiene problemas de accesibilidad (y hay que avisarle al equipo frontend)
- O tenés que escribir el locator a mano usando `data-testid` u otra estrategia

### 8. No puede grabar en Firefox o Safari por default

Codegen graba en Chromium por default. Si querés grabar específicamente en Firefox o WebKit, usá:

```bash
npx playwright codegen --browser=firefox https://miapp.com
npx playwright codegen --browser=webkit https://miapp.com
```

Para la mayoría de los casos, grabar en Chromium y después correr en los tres navegadores funciona bien.

## Buenas prácticas con Codegen

### Usalo como herramienta de descubrimiento, no como autor principal

Codegen es ideal para:

- Explorar una app nueva y entender qué locators están disponibles
- Armar el esqueleto de un flujo complejo
- Aprender buenas prácticas viendo qué locators elegiría un experto

NO es ideal para:

- Entregar tests productivos sin revisar
- Mantener una suite grande (los tests necesitan refactor y abstracción)

### Combinalo con el "Pick Locator"

El botón "Pick locator" del Inspector es tu amigo cuando estás escribiendo tests a mano. En vez de intentar adivinar qué locator usar, abrís Codegen con `npx playwright codegen https://tu-app.com`, usás "Pick locator" sobre el elemento que te interesa, copiás el locator sugerido, y lo pegás en tu código.

Esto combina lo mejor de ambos mundos: código escrito con criterio humano, locators elegidos por una herramienta experta.

### Ejecutá siempre el test grabado antes de subirlo

Después de grabar y ajustar, SIEMPRE corré el test al menos una vez antes de hacer commit:

```bash
npx playwright test tu-test.spec.js
```

Codegen puede generar código que funciona en el momento de grabarlo pero falla cuando la página carga de forma distinta (por timing, caching, etc). Validá que pasa de forma estable.

### Hacé commit del test SIN los artefactos de grabación

Codegen a veces deja carpetas temporales. Confirmá que tu `.gitignore` excluya:

```
test-results/
playwright-report/
blob-report/
playwright/.cache/
```

Son las que Playwright crea por default. Si por alguna razón se agregó alguna carpeta más tras grabar, excluila también.

### Usá --output para iterar más rápido

Si vas a grabar varios tests, usá la flag `--output` para que se guarden solos:

```bash
npx playwright codegen --output=tests/login.spec.js https://miapp.com
```

Grabás, cerrás el navegador, y el archivo queda listo en la carpeta. Después editás a mano.

### Grabá por partes, no todo de una

Para flujos complejos (ej: registro + login + navegación + compra + logout), es tentador grabar todo seguido. Pero es un error. Mejor:

1. Grabá cada bloque por separado
2. Reviselo y ajustalo individualmente
3. Al final, los combinás en el test final (o en varios tests chicos)

Un test grabado de 50 líneas sin revisar es ingobernable.

## Cuándo escribir a mano desde cero (sin Codegen)

Momentos donde Codegen más estorba que ayuda:

- Tests parametrizados (data-driven): el patrón de "repetir el mismo flujo con 10 datos distintos" es más fácil a mano
- Tests con setup complejo (crear usuarios, insertar datos vía API antes del test)
- Tests con assertions sobre lógica de negocio compleja (sumas, cálculos, validaciones específicas)
- Refactor de tests existentes (Codegen no entiende lo que ya tenés escrito)
- Tests sobre funciones específicas del backend (API testing)

En esos casos, es mejor arrancar desde cero en el editor.

## El workflow recomendado

Para alguien que arranca con Playwright y Codegen, este flujo funciona bien:

1. Pensá qué querés testear (el "caso de prueba" como QA manual)
2. Grabá un primer intento con Codegen
3. Guardalo en un archivo `.spec.js`
4. Aplicá el checklist del archivo [ajustar-el-codigo-generado.md](./ajustar-el-codigo-generado.md)
5. Corré el test y verificá que pasa
6. Corré el test 2 o 3 veces más para confirmar que es estable (no es flaky)
7. Hacé commit

A medida que vayas ganando experiencia, vas a usar menos Codegen para flujos simples (los escribís más rápido a mano) y más Codegen para descubrir locators o explorar apps nuevas.

## Resumen

- Codegen tiene límites claros: no decide assertions, no maneja lógica, no reutiliza código
- Es ideal para arrancar y para descubrir locators, no para producir tests finales
- "Pick locator" es la feature más útil del Inspector cuando ya sabés qué hacés
- Siempre revisá, ajustá y validá el código antes de subirlo
- A medida que mejores, vas a usar Codegen menos y de forma más estratégica
- El criterio de QA sigue siendo tuyo, Codegen es solo tu asistente