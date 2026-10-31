// js/validaciones.js

export function validarMarca(marca) {
  return marca && marca.trim() !== '' ? null : 'Elegí una marca';
}

export function validarModelo(modelo) {
  return modelo && modelo.trim().length >= 2 && modelo.trim().length <= 40 
    ? null 
    : 'Ingresá el modelo del equipo';
}

export function validarValor(valor) {
  const num = Number(valor);
  return !isNaN(num) && num >= 100000 && num <= 2500000 
    ? null 
    : 'El valor debe estar entre $100.000 y $2.500.000';
}

export function validarAntiguedad(antiguedad) {
  return antiguedad && antiguedad !== '' ? null : 'Indicá la antigüedad';
}

export function validarNombreApellido(texto) {
  return texto && texto.trim().length >= 2 ? null : 'Ingresá tu nombre / apellido';
}

export function validarDNI(dni) {
  const regex = /^\d{7,8}$/;
  return regex.test(dni) ? null : 'El DNI debe tener 7 u 8 números';
}

export function validarNacimiento(fecha) {
  if (!fecha) return 'Tenés que ser mayor de edad';
  const hoy = new Date();
  const nacimiento = new Date(fecha);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad >= 18 ? null : 'Tenés que ser mayor de edad';
}

export function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) ? null : 'Ingresá un email válido';
}

export function validarCelular(celular) {
  // Limpia espacios y guiones, espera 10 dígitos (ej: 1155551234)
  const limpio = celular.replace(/[\s-]/g, '');
  const regex = /^\d{10}$/;
  return regex.test(limpio) ? null : 'Ej.: 11 5555-1234';
}

export function validarTerminos(terminos) {
  return terminos ? null : 'Tenés que aceptar los términos';
}

export function validarTarjeta(tarjeta) {
  const limpio = tarjeta.replace(/\s/g, '');
  const regex = /^\d{16}$/;
  return regex.test(limpio) ? null : 'Número de tarjeta inválido';
}

export function validarVencimiento(vencimiento) {
  // Formato MM/AA
  const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!regex.test(vencimiento)) return 'Vencimiento inválido';

  const [mes, anio] = vencimiento.split('/');
  const fechaActual = new Date();
  const anioActual = Number(String(fechaActual.getFullYear()).slice(-2));
  const mesActual = fechaActual.getMonth() + 1;

  const numMes = Number(mes);
  const numAnio = Number(anio);

  if (numAnio > anioActual || (numAnio === anioActual && numMes >= mesActual)) {
    return null;
  }
  return 'Vencimiento inválido';
}

export function validarCVV(cvv) {
  const regex = /^\d{3}$/;
  return regex.test(cvv) ? null : 'CVV inválido';
}

export function validarTitular(titular) {
  return titular && titular.trim() !== '' ? null : 'Ingresá el nombre del titular';
}