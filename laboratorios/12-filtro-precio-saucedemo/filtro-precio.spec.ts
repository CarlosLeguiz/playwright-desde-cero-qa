// Lab 12 - Filtrar productos de saucedemo por rango de precio
// Run: npx playwright test laboratorios/12-filtro-precio-saucedemo --project=chromium
//
// Que se prueba: la utilidad InventarioPage.productosEnRango(min, max), que lee
// los productos de la pantalla y devuelve los que caen en el rango (limites
// incluidos). No es un filtro de la interfaz: saucedemo no tiene uno.
//
// Precios de standard_user en orden Name A to Z (el orden por defecto):
//   Backpack 29.99 | Bike Light 9.99 | Bolt T-Shirt 15.99 |
//   Fleece Jacket 49.99 | Onesie 7.99 | T-Shirt (Red) 15.99

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { InventarioPage } from './InventarioPage';
import { parsearPrecio, Producto } from './filtro-precio';

// Los criterios hablan de "los precios del resultado", no de su orden: el orden
// tiene su propio test (CA-12). Ordenamos antes de comparar para que un test de
// limites no falle por un tema de orden que no es lo que esta verificando.
function preciosOrdenados(productos: Producto[]): number[] {
  return productos.map((p) => p.precio).sort((a, b) => a - b);
}

test.describe('Filtro por rango de precio en el inventario de saucedemo', () => {
  let inventario: InventarioPage;

  // Cada test hace su propio login: ninguno depende de que otro haya corrido
  // antes (CA-15). Se puede correr cualquiera solo con --grep.
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Los inputs no tienen <label>, solo placeholder: por eso getByPlaceholder
    // y no getByLabel.
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    // El boton tiene rol y nombre accesible: getByRole es la primera opcion.
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\.html/);
    inventario = new InventarioPage(page);
  });

  test.describe('Rangos validos', () => {
    test('CA-01: un rango normal (9 a 16) devuelve los 3 productos de 9.99, 15.99 y 15.99', async () => {
      const resultado = await inventario.productosEnRango(9, 16);

      expect(resultado).toHaveLength(3);
      expect(preciosOrdenados(resultado)).toEqual([9.99, 15.99, 15.99]);
    });

    test('CA-02: el limite inferior esta incluido (7.99 a 9.99 devuelve 7.99 y 9.99)', async () => {
      const resultado = await inventario.productosEnRango(7.99, 9.99);

      // En pantalla salen [9.99, 7.99] (Bike Light va antes que Onesie en A-Z).
      // El CA pide el conjunto de precios, no el orden: por eso se ordena.
      expect(resultado).toHaveLength(2);
      expect(preciosOrdenados(resultado)).toEqual([7.99, 9.99]);
    });

    test('CA-03: el limite superior esta incluido (29.99 a 49.99 devuelve 29.99 y 49.99)', async () => {
      const resultado = await inventario.productosEnRango(29.99, 49.99);

      expect(resultado).toHaveLength(2);
      expect(preciosOrdenados(resultado)).toEqual([29.99, 49.99]);
    });

    test('CA-04: un rango de un solo valor (49.99 a 49.99) devuelve solo el producto de 49.99', async () => {
      const resultado = await inventario.productosEnRango(49.99, 49.99);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].precio).toBe(49.99);
    });

    test('CA-05: un rango que cubre todo (0 a 1000) devuelve tantos productos como tarjetas hay en pantalla', async ({ page }) => {
      const resultado = await inventario.productosEnRango(0, 1000);

      // El total de pantalla se cuenta con un locator propio del test y no con
      // el del page object: si el page object leyera mal, compararlo contra si
      // mismo daria siempre verdadero. data-test porque la tarjeta es un <div>
      // sin rol accesible.
      const tarjetasEnPantalla = page.getByTestId('inventory-item');
      await expect(tarjetasEnPantalla).toHaveCount(6);
      expect(resultado).toHaveLength(6);
    });

    test('CA-08: la comparacion es exacta al centavo (15.99 devuelve 2, 16.00 devuelve 0)', async () => {
      const exacto = await inventario.productosEnRango(15.99, 15.99);
      const unCentavoMas = await inventario.productosEnRango(16.0, 16.0);

      expect(exacto).toHaveLength(2);
      expect(preciosOrdenados(exacto)).toEqual([15.99, 15.99]);
      expect(unCentavoMas).toEqual([]);
    });
  });

  test.describe('Rangos sin resultados', () => {
    test('CA-06: un rango entre precios (16 a 29) devuelve una lista vacia sin lanzar error', async () => {
      // Si lanzara error, el await rechaza y el test falla ahi mismo.
      const resultado = await inventario.productosEnRango(16, 29);

      expect(resultado).toEqual([]);
    });

    test('CA-07: un rango por arriba de todos los precios (50 a 100) devuelve una lista vacia', async () => {
      const resultado = await inventario.productosEnRango(50, 100);

      expect(resultado).toEqual([]);
    });
  });

  test.describe('Parametros invalidos', () => {
    // productosEnRango es async: el error llega como promesa rechazada, por eso
    // rejects.toThrow y no toThrow a secas.

    test('CA-09: min mayor que max (30 a 10) lanza "El minimo no puede ser mayor que el maximo"', async () => {
      await expect(inventario.productosEnRango(30, 10)).rejects.toThrow(
        'El minimo no puede ser mayor que el maximo'
      );
    });

    test('CA-10: un minimo negativo (-5) lanza un error que nombra el parametro "minimo"', async () => {
      await expect(inventario.productosEnRango(-5, 10)).rejects.toThrow(/"minimo"/);
    });

    test('CA-10: un maximo negativo (-1) lanza un error que nombra el parametro "maximo"', async () => {
      await expect(inventario.productosEnRango(0, -1)).rejects.toThrow(/"maximo"/);
    });

    test('CA-11: un minimo NaN lanza un error que nombra el parametro "minimo"', async () => {
      await expect(inventario.productosEnRango(NaN, 10)).rejects.toThrow(/"minimo"/);
    });

    test('CA-11: un maximo NaN lanza un error que nombra el parametro "maximo"', async () => {
      await expect(inventario.productosEnRango(0, NaN)).rejects.toThrow(/"maximo"/);
    });

    test('CA-11: un minimo de tipo string ("10") lanza un error que nombra el parametro "minimo"', async () => {
      // Cast a proposito: el tipo `number` no deja pasar un string, pero en JS
      // (o con datos que vienen de afuera) puede llegar igual. Queremos ver que
      // la validacion en tiempo de ejecucion lo frena.
      await expect(
        inventario.productosEnRango('10' as unknown as number, 20)
      ).rejects.toThrow(/"minimo"/);
    });

    test('CA-11: un maximo undefined lanza un error que nombra el parametro "maximo"', async () => {
      await expect(
        inventario.productosEnRango(0, undefined as unknown as number)
      ).rejects.toThrow(/"maximo"/);
    });
  });

  test.describe('Orden, forma del resultado y efecto en la pantalla', () => {
    test('CA-12: el resultado respeta el orden de los nombres en pantalla (Name A to Z)', async ({ page }) => {
      const resultado = await inventario.productosEnRango(0, 1000);

      // Los nombres de pantalla se leen con un locator del test, no del page
      // object, por la misma razon que en CA-05. data-test porque el nombre es
      // un <div> sin rol, y no getByText porque justamente queremos leer el
      // texto, no buscarlo.
      const nombresEnPantalla = (await page.getByTestId('inventory-item-name').allTextContents()).map((n) =>
        n.trim()
      );

      // Chequeo de que realmente estamos en orden A-Z: si el sitio cambiara el
      // orden por defecto, este test tiene que avisarlo y no pasar de casualidad.
      expect(nombresEnPantalla).toEqual([...nombresEnPantalla].sort());
      expect(resultado.map((p) => p.nombre)).toEqual(nombresEnPantalla);
    });

    test('CA-13: cada producto del resultado tiene nombre no vacio y precio numerico finito', async () => {
      const resultado = await inventario.productosEnRango(0, 1000);

      // Sin este chequeo, un resultado vacio haria pasar el for de abajo sin
      // verificar nada.
      expect(resultado.length).toBeGreaterThan(0);
      for (const producto of resultado) {
        expect(producto.nombre.trim()).not.toBe('');
        expect(typeof producto.precio).toBe('number');
        expect(Number.isFinite(producto.precio)).toBe(true);
      }
    });

    test('CA-14: usar la utilidad no cambia la pantalla (siguen 6 tarjetas y la URL es /inventory.html)', async ({ page }) => {
      await inventario.productosEnRango(9, 16);

      // Mismo locator data-test de la tarjeta que en CA-05: las tarjetas no
      // tienen rol accesible.
      await expect(page.getByTestId('inventory-item')).toHaveCount(6);
      await expect(page).toHaveURL(/\/inventory\.html$/);
    });
  });
});

// Estos tests no abren el navegador: prueban la funcion pura que convierte el
// texto de la pantalla en numero. Por eso estan fuera del describe con login.
test.describe('Lectura del precio desde el texto de pantalla (P5)', () => {
  test('convierte "$29.99" al numero 29.99', () => {
    expect(parsearPrecio('$29.99', 'Backpack')).toBe(29.99);
  });

  test('un precio que no se puede leer lanza error nombrando el producto en vez de devolver 0', () => {
    expect(() => parsearPrecio('', 'Backpack')).toThrow('No se pudo leer el precio "" del producto "Backpack"');
    expect(() => parsearPrecio('29.99', 'Backpack')).toThrow(/Backpack/);
  });
});

// CA-16: revision estatica del codigo del lab. Lee los archivos como texto.
test.describe('Convenciones del lab 12 (CA-16)', () => {
  const carpeta = __dirname;
  const archivos = ['InventarioPage.ts', 'filtro-precio.ts', 'filtro-precio.spec.ts'];

  // Los patrones se arman concatenando para que este mismo archivo, que se
  // revisa a si mismo, no matchee por tener escrito el patron.
  const prohibidos: { descripcion: string; patron: RegExp }[] = [
    { descripcion: 'llamada a waitForTimeout', patron: new RegExp('\\.wait' + 'ForTimeout\\s*\\(') },
    { descripcion: 'XPath', patron: new RegExp("(xpa" + "th=|locator\\(\\s*['\"`]\\s*/" + '/)') },
    { descripcion: 'selector CSS por clase', patron: new RegExp("locator\\(\\s*['\"`][^'\"`]*\\" + '.[a-zA-Z_]') },
  ];

  for (const archivo of archivos) {
    test(`${archivo} no usa waitForTimeout, XPath ni selectores CSS por clase`, () => {
      const codigo = fs.readFileSync(path.join(carpeta, archivo), 'utf-8');
      for (const { descripcion, patron } of prohibidos) {
        expect(codigo, `${archivo} contiene ${descripcion}`).not.toMatch(patron);
      }
    });
  }
});
