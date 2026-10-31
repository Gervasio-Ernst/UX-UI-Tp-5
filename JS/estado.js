// js/estado.js

export const solicitud = {
  paso: 0, // 0 = inicio/catálogo, 1..4 = checkout, 5 = éxito, 6 = error de pago
  equipo: {
    marca: '',
    modelo: '',
    valor: 0,
    antiguedad: ''
  },
  plan: 'plus', // 'plus' viene preseleccionado por defecto según el TP
  titular: {
    nombre: '',
    apellido: '',
    dni: '',
    nacimiento: '',
    email: '',
    celular: '',
    terminos: false
  },
  pago: {
    metodo: 'credito',
    tarjeta: '',
    vencimiento: '',
    cvv: '',
    titular: ''
  },
  poliza: null
};

// Función para cambiar de paso y forzar el redibujado
export function irAPaso(n) {
  solicitud.paso = n;
  // Llamaremos a render() aquí una vez que esté creado
  if (typeof window.renderizarApp === 'function') {
    window.renderizarApp();
  }
}