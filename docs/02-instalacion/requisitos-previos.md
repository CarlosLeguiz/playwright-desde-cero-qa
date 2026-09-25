# Requisitos previos

Antes de instalar Playwright necesitás dos herramientas: Node.js y VS Code.

## Node.js

Node.js es el "motor" que ejecuta JavaScript y TypeScript fuera del navegador. Playwright lo necesita para funcionar.

### Versión mínima

**Node.js 18 o superior.** Se recomienda usar una versión LTS (Long Term Support) reciente como la 20 o la 22.

### Cómo verificar si lo tenés

Abrí una terminal (PowerShell en Windows, Terminal en Mac/Linux) y ejecutá:

```bash
node --version
```

Si te devuelve algo tipo `v20.11.0` o `v24.15.0`, estás bien.

Si te dice "comando no encontrado" o similar, tenés que instalarlo.

### Cómo verificar npm

`npm` es el gestor de paquetes de Node.js. Se instala automáticamente con Node.js.

```bash
npm --version
```

Debería devolverte algo tipo `10.2.4` o similar.

### Cómo instalar Node.js

1. Entrá a [nodejs.org](https://nodejs.org)
2. Descargá la versión **LTS** (la que dice "Recommended for Most Users")
3. Ejecutá el instalador con las opciones por defecto
4. Cerrá y volvé a abrir la terminal
5. Verificá con `node --version`

## VS Code

VS Code es el editor de código más usado para Playwright. Trae extensiones específicas que te van a facilitar la vida.

### Cómo verificar si lo tenés

```bash
code --version
```

Si te devuelve una versión, estás listo.

### Cómo instalarlo

1. Entrá a [code.visualstudio.com](https://code.visualstudio.com)
2. Descargalo para tu sistema operativo
3. Instalalo con las opciones por defecto
4. **Importante en Windows**: asegurate de tildar la opción "Add to PATH" durante la instalación (viene tildada por default)

### Extensiones recomendadas

Una vez instalado VS Code, instalá estas dos extensiones desde el panel de Extensions (Ctrl + Shift + X):

- **Playwright Test for VSCode** (de Microsoft): permite correr tests desde la interfaz de VS Code
- **GitLens** (opcional pero útil): mejora la integración con Git

## Git

Git es el sistema de control de versiones que vamos a usar para subir el proyecto a GitHub.

### Cómo verificar si lo tenés

```bash
git --version
```

### Cómo instalarlo

- **Windows**: descargalo de [git-scm.com](https://git-scm.com)
- **Mac**: viene preinstalado con Xcode Command Line Tools. Ejecutá `xcode-select --install`
- **Linux**: `sudo apt install git` (Ubuntu/Debian) o el equivalente en tu distribución

### Configuración inicial (una sola vez)

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

Usá el mismo email que tenés en GitHub.

## Cuenta de GitHub

Si vas a subir tu proyecto (recomendado para portfolio), necesitás una cuenta en [github.com](https://github.com). Es gratuita.

## Resumen

Antes de seguir con la instalación de Playwright, verificá que tenés todo esto:

- Node.js 18 o superior
- npm funcionando
- VS Code instalado
- Git instalado y configurado
- Cuenta de GitHub creada