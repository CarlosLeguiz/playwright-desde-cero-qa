// Lab 12 - Page object de la pantalla de inventario de saucedemo.
//
// Regla del Page Object Model (ver docs/07-caso-practico-agente-qa/5-page-object-model.md):
// la clase responde QUE HAY en la pantalla; el test decide si eso esta bien.
// Por eso aca no hay ningun expect(): solo locators y lectura de datos.
//
// Precondicion: el test ya hizo login y esta en /inventory.html.

import { Locator, Page } from '@playwright/test';
import { filtrarPorRangoDePrecio, parsearPrecio, Producto, validarRango } from './filtro-precio';

export class InventarioPage {
  readonly page: Page;
  readonly tarjetas: Locator;

  constructor(page: Page) {
    this.page = page;
    // getByTestId y no getByRole: las tarjetas son <div> sin rol accesible
    // propio, asi que no hay un role que las identifique. saucedemo pone
    // data-test="inventory-item" en cada una (testIdAttribute = 'data-test'
    // en el config). Evitamos '.inventory_item' porque una clase de estilos
    // puede cambiar sin que cambie el comportamiento.
    this.tarjetas = page.getByTestId('inventory-item');
  }

  // Nombre de una tarjeta. Se busca DENTRO de la tarjeta (parent/child):
  // un getByTestId global devolveria los 6 nombres y no sabriamos cual va con
  // cual precio. getByTestId y no getByText porque no conocemos el texto de
  // antemano: justamente lo queremos leer.
  private nombreDe(tarjeta: Locator): Locator {
    return tarjeta.getByTestId('inventory-item-name');
  }

  // Precio de una tarjeta. Mismo criterio: acotado a la tarjeta y por
  // data-test, porque el precio es un <div> sin rol ni label.
  private precioDe(tarjeta: Locator): Locator {
    return tarjeta.getByTestId('inventory-item-price');
  }

  // Lee todos los productos tal como se ven en pantalla, en ese mismo orden.
  async leerProductos(): Promise<Producto[]> {
    // all() no espera: devuelve lo que haya en ese instante. waitFor() espera
    // a que aparezca la primera tarjeta (espera por estado, no por tiempo:
    // nada de waitForTimeout). Sin esto, si la pagina tarda, leeriamos [].
    await this.tarjetas.first().waitFor();

    const productos: Producto[] = [];
    // for...of sobre all(): all() devuelve las tarjetas en orden de DOM, que es
    // el orden visual. Por eso el resultado respeta el orden de la pantalla.
    for (const tarjeta of await this.tarjetas.all()) {
      const nombre = (await this.nombreDe(tarjeta).textContent())?.trim() ?? '';
      const textoPrecio = (await this.precioDe(tarjeta).textContent()) ?? '';
      productos.push({ nombre, precio: parsearPrecio(textoPrecio, nombre) });
    }
    return productos;
  }

  // Devuelve los productos con precio entre min y max (ambos incluidos),
  // en el orden de la pantalla. Solo lee: no clickea ni cambia el orden,
  // asi que la pantalla queda igual que antes.
  async productosEnRango(min: number, max: number): Promise<Producto[]> {
    // Validamos antes de leer: si los parametros estan mal no tiene sentido
    // recorrer la pantalla, y el error sale mas rapido y mas claro.
    validarRango(min, max);
    const productos = await this.leerProductos();
    return filtrarPorRangoDePrecio(productos, min, max);
  }
}
