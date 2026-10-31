// js/pago.js

export function simularPago(numero) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const limpio = numero.replace(/\s/g, '');
      resolve(
        limpio === '4000000000000002'
          ? { ok: false, motivo: 'Tarjeta rechazada' }
          : { ok: true }
      );
    }, 1500);
  });
}

export function generarPoliza(contador = 123) {
  // Número de póliza: POL-AAAA-NNNNNN[cite: 7]
  const anio = new Date().getFullYear();
  const secuencia = String(contador).padStart(6, '0');
  return `POL-${anio}-${secuencia}`;
}