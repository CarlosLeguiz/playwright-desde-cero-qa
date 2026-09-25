# Estructura del proyecto

Cuando corriste `npm init playwright@latest`, se crearon varias carpetas y archivos. Entender qué es cada uno te da una base sólida antes de empezar a escribir tests.

## Vista general

```
playwright-desde-cero-qa/
├── node_modules/
├── tests/
│   └── example.spec.ts
├── .gitignore
├── package.json
├── package-lock.json
└── playwright.config.ts
```

Vamos uno por uno.

## node_modules/

Esta es la carpeta más pesada del proyecto. Adentro viven todas las librerías que Playwright necesita para funcionar (miles de archivos).

**Subcarpetas típicas:**

- `.bin/`: los "ejecutables" (los comandos que podés correr, como `playwright`)
- `@playwright/`: el paquete oficial de tests de Playwright
- `@types/`: definiciones de tipos de TypeScript (para el autocompletado del editor)
- `playwright/` y `playwright-core/`: el motor que controla los navegadores
- `undici-types/`: una librería auxiliar para peticiones HTTP

**Reglas de oro:**

- NUNCA edites nada acá adentro
- Si borrás la carpeta, la recuperás con `npm install`
- NO se sube a GitHub (por eso está en `.gitignore`)
- Puede pesar cientos de MB, es normal

## tests/

Acá vas a vivir vos. Es la carpeta donde van todos los tests que escribas.

Adentro viene por default:

- `example.spec.ts`: un test de ejemplo que trae Playwright

**Convención importante:** los archivos de tests siempre terminan en `.spec.ts` o `.test.ts`. Playwright busca automáticamente todos los archivos con esa terminación y los ejecuta cuando corrés `npx playwright test`.

## .gitignore

Un archivo de texto que le dice a Git qué archivos NO subir al repositorio.

Por default incluye:

```
node_modules/
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```

**Qué significa cada línea:**

- `node_modules/`: la carpeta de dependencias, que es pesada y regenerable con `npm install`
- `/test-results/`: resultados de cada corrida de tests (screenshots, videos, traces)
- `/playwright-report/`: el reporte HTML que se abre con `show-report`
- `/blob-report/`: reportes para procesamiento posterior
- `/playwright/.cache/`: cache interno de Playwright

**Por qué se excluyen:** son archivos generados automáticamente. No aportan valor en el repo y ocupan espacio.

## package.json

El "documento de identidad" del proyecto. Un archivo pequeño en formato JSON que describe:

- El nombre del proyecto
- Su versión
- Qué librerías usa (dependencias)
- Qué scripts personalizados podés correr

Ejemplo típico:

```json
{
  "name": "playwright-desde-cero-qa",
  "version": "1.0.0",
  "devDependencies": {
    "@playwright/test": "^1.55.0",
    "@types/node": "^22.10.0"
  }
}
```

**Concepto clave: `devDependencies`**

Son librerías que solo se usan en desarrollo, no en producción. Playwright es una `devDependency` porque solo se usa para tests, no forma parte de la app final.

Cuando alguien clona tu proyecto y ejecuta `npm install`, Node.js lee este archivo y baja todas las librerías listadas.

## package-lock.json

Un archivo más largo que `package.json`. Guarda las versiones EXACTAS de todas las librerías (incluidas las sublibrerías, y las sublibrerías de las sublibrerías, y así en cadena).

**¿Para qué sirve?** Para que si vos y tu compañero clonan el proyecto, ambos tengan exactamente las mismas versiones de todo. Sin este archivo, uno podría tener una versión más nueva de una dependencia interna y los tests comportarse distinto.

**Nunca lo edites a mano.** Se actualiza solo con `npm install`.

## playwright.config.ts

El archivo de configuración de Playwright. Este SÍ lo vas a editar seguido a medida que aprendas.

**Define cosas como:**

- ¿En qué navegadores correr los tests? (Chromium, Firefox, WebKit)
- ¿Cuánto tiempo esperar antes de fallar un test? (timeouts)
- ¿Correr tests en paralelo o de a uno?
- ¿Qué URL base usar para tu app?
- ¿Sacar screenshots cuando falla un test?
- ¿Grabar video de la ejecución?
- ¿Qué tipo de reporte generar?

Es el "panel de control" de Playwright. Por default trae una configuración bastante razonable, así que no lo tocás hasta que necesites algo específico.

## Resumen visual: qué toco y qué no

| Carpeta / Archivo | ¿Lo edito? | ¿Se sube a Git? |
|---|---|---|
| `node_modules/` | Nunca | No |
| `tests/` | Todo el tiempo | Sí |
| `.gitignore` | Rara vez | Sí |
| `package.json` | A veces | Sí |
| `package-lock.json` | Nunca | Sí |
| `playwright.config.ts` | Seguido | Sí |

## Carpetas que aparecen después

A medida que corras tests, van a aparecer estas carpetas nuevas (todas ignoradas por Git):

- `test-results/`: screenshots, videos y traces de cada corrida
- `playwright-report/`: el reporte HTML

Podés borrarlas cuando quieras, se regeneran solas.