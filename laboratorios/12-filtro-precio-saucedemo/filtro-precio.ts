// Lab 12 - Funcion pura para filtrar productos por rango de precio.
//
// Por que una funcion pura separada del page object:
// - No toca el navegador: recibe una lista y devuelve otra. Asi la logica del
//   rango (limites inclusivos, validaciones) se puede razonar y probar sin
//   depender de que saucedemo cargue.
// - El page object (InventarioPage) solo se ocupa de LEER la pantalla y le pasa
//   el resultado a esta funcion. Cada pieza tiene una sola responsabilidad.

export interface Producto {
  nombre: string;
  precio: number;
}

// Muestra el valor recibido en el mensaje de error. Los strings van entre
// comillas para que "1" (texto) no se confunda con 1 (numero) al leer el error.
function describir(valor: unknown): string {
  return typeof valor === 'string' ? `"${valor}"` : String(valor);
}

// Valida un limite del rango. Recibe `unknown` a proposito: en un test alguien
// puede pasar un string o undefined, y queremos un error claro que diga CUAL
// parametro esta mal, no un resultado silenciosamente vacio.
function validarLimite(valor: unknown, parametro: 'minimo' | 'maximo'): number {
  // typeof descarta strings, undefined, null, etc.
  // Number.isFinite descarta NaN (y tambien Infinity, para que el rango
  // siempre tenga valores concretos).
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new Error(`El parametro "${parametro}" debe ser un numero valido (se recibio: ${describir(valor)})`);
  }
  if (valor < 0) {
    throw new Error(`El parametro "${parametro}" no puede ser negativo (se recibio: ${valor})`);
  }
  return valor;
}

// Valida el rango completo. Se exporta para que el page object pueda fallar
// ANTES de leer la pantalla si los parametros ya vienen mal.
export function validarRango(min: number, max: number): void {
  // El orden importa: primero el minimo, despues el maximo y recien ahi la
  // comparacion entre ambos. Asi el mensaje siempre apunta al primer problema.
  validarLimite(min, 'minimo');
  validarLimite(max, 'maximo');
  if (min > max) {
    throw new Error('El minimo no puede ser mayor que el maximo');
  }
}

// Devuelve los productos cuyo precio esta entre min y max, AMBOS INCLUIDOS.
// - Si ninguno cumple, devuelve [] (no es un error: es un resultado valido).
// - Usa filter, que respeta el orden original: el resultado sale en el mismo
//   orden en que vinieron los productos (el de la pantalla).
// - Devuelve objetos nuevos para que quien use el resultado no modifique
//   sin querer la lista original.
export function filtrarPorRangoDePrecio(productos: Producto[], min: number, max: number): Producto[] {
  validarRango(min, max);
  return productos
    .filter((producto) => producto.precio >= min && producto.precio <= max)
    .map((producto) => ({ ...producto }));
}

// Convierte el texto de la pantalla ("$29.99") al numero 29.99.
// La expresion regular es estricta a proposito: si el formato cambia o el texto
// viene vacio, preferimos un error que nombre el producto antes que un 0 o un
// NaN que haga pasar (o fallar) un test por la razon equivocada.
export function parsearPrecio(texto: string, nombreProducto: string): number {
  const coincidencia = /^\$(\d+(?:\.\d{1,2})?)$/.exec(texto.trim());
  if (!coincidencia) {
    throw new Error(`No se pudo leer el precio "${texto}" del producto "${nombreProducto}"`);
  }
  return Number(coincidencia[1]);
}
