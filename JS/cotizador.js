// js/cotizador.js

export function calcularCuota(valorEquipo, tasaAnual, factorAntiguedad) {
  // Fórmula exacta del TP: Math.round(valor * tasaAnual / 12 * factorAntiguedad)
  const cuota = Math.round((valorEquipo * tasaAnual) / 12 * factorAntiguedad);
  return cuota;
}

export function obtenerFactorAntiguedad(antiguedad) {
  switch (antiguedad) {
    case 'menos-1':
      return 1.00;
    case '1-2':
      return 1.10;
    case 'mas-2':
      return 1.25;
    default:
      return 1.00;
  }
}