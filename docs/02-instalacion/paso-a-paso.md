# Instalación paso a paso

Con Node.js y VS Code listos, vamos a crear el proyecto Playwright.

## Paso 1: Crear la carpeta del proyecto

Abrí una terminal y navegá al lugar donde querés guardar el proyecto. Por ejemplo, tu carpeta Documents:

```bash
cd Documents
```

Creá una carpeta nueva:

```bash
mkdir playwright-desde-cero-qa
```

Entrá en ella:

```bash
cd playwright-desde-cero-qa
```

La terminal debería mostrarte algo tipo:

```
PS C:\Users\Usuario\Documents\playwright-desde-cero-qa>
```

## Paso 2: Ejecutar el instalador de Playwright

Estando parado dentro de la carpeta, ejecutá:

```bash
npm init playwright@latest
```

Este comando descarga y ejecuta el instalador oficial de Playwright.

## Paso 3: Responder las preguntas del instalador

Te va a hacer 4 preguntas. Estas son las respuestas recomendadas.

### Pregunta 1: ¿TypeScript o JavaScript?

```
Do you want to use TypeScript or JavaScript?
> TypeScript
```

**Elegí TypeScript** (viene por default, dale Enter).

TypeScript es JavaScript con "tipos". Te ayuda a evitar errores porque el editor te avisa si estás usando algo mal. Es el estándar profesional para Playwright.

### Pregunta 2: ¿Dónde poner los tests?

```
Where to put your end-to-end tests?
> tests
```

**Dejá `tests`** (default, Enter). Es la convención estándar.

### Pregunta 3: ¿Agregar workflow de GitHub Actions?

```
Add a GitHub Actions workflow?
> false
```

**Respondé No** por ahora. Vamos a agregarlo más adelante cuando lleguemos al módulo de CI/CD.

### Pregunta 4: ¿Instalar navegadores?

```
Install Playwright browsers?
> true
```

**Elegí Yes** (Enter). Esto descarga los tres motores: Chromium, Firefox y WebKit. Pesa cerca de 500 MB y tarda unos minutos.

## Paso 4: Esperar a que termine

Vas a ver cómo se descargan varios paquetes. Al final aparece un mensaje:

```
Happy hacking! 🎭
```

El emoji 🎭 (máscaras de teatro) es el logo de Playwright, porque "playwright" en inglés significa "dramaturgo". Los tests son los "guiones" y los navegadores los "actores".

## Paso 5: Abrir el proyecto en VS Code

Desde la misma terminal:

```bash
code .
```

El punto significa "abrir la carpeta actual". VS Code se abre con tu proyecto listo.

## Paso 6: Correr el test de ejemplo

Playwright viene con un archivo de test de ejemplo. Vamos a correrlo para verificar que todo funciona.

En la terminal de VS Code (Ctrl + ñ o Terminal > New Terminal):

```bash
npx playwright test
```

Deberías ver algo así:

```
Running 6 tests using 6 workers

  6 passed (10.4s)
```

**¿Por qué 6 tests si el archivo solo tiene 2?** Porque cada test corre en los tres navegadores (Chromium, Firefox y WebKit). 2 × 3 = 6.

## Ver el reporte visual

Ejecutá:

```bash
npx playwright show-report
```

Se te abre un navegador con un reporte HTML detallado de cada test.

## Ver los navegadores ejecutando en vivo

Por defecto los tests corren "headless" (sin ventana visible). Si querés ver los navegadores en acción:

```bash
npx playwright test --headed
```

## Modo interactivo

Este es el modo más útil cuando estás aprendiendo:

```bash
npx playwright test --ui
```

Se abre una interfaz gráfica donde podés correr tests uno por uno, ver cada paso, y explorar el DOM.

## Todo instalado

Con estos pasos ya tenés Playwright funcionando en tu máquina. En el siguiente archivo vamos a entender qué carpetas y archivos se crearon con la instalación y qué hace cada uno.