// js/render.js
import { solicitud, irAPaso } from './estado.js';
import { calcularCuota, obtenerFactorAntiguedad } from './cotizador.js';

let planesCache = null;

// Carga inicial de planes.json[cite: 6, 8]
export async function cargarPlanes() {
  if (!planesCache) {
    try {
      const res = await fetch('data/planes.json');
      planesCache = await res.json();
    } catch (err) {
      console.error('Error al cargar planes.json:', err);
    }
  }
  return planesCache;
}

export async function render() {
  // 1. Mostrar/Ocultar secciones según solicitud.paso
  document.querySelectorAll('[data-paso]').forEach((sec) => {
    sec.hidden = Number(sec.dataset.paso) !== solicitud.paso;
  });

  // 2. Renderizar el Stepper de pasos (Pasos 1 a 4)[cite: 5, 8, 13]
  renderStepper();

  // 3. Renderizar vista de Planes (Paso 2)
  if (solicitud.paso === 2) {
    await renderPlanes();
  }

  // 4. Renderizar Resumen lateral / barra mobile (Pasos 2, 3, 4)[cite: 5, 8, 14]
  if (solicitud.paso >= 2 && solicitud.paso <= 4) {
    await renderResumen();
  }

  // 5. Renderizar Pantalla de Éxito o Error (Pasos 5 y 6)[cite: 5, 7, 8]
  if (solicitud.paso === 5) {
    renderExito();
  } else if (solicitud.paso === 6) {
    renderError();
  }
}

// Expone render globalmente para irAPaso
window.renderizarApp = render;

function renderStepper() {
  const stepperContainer = document.getElementById('stepper-container');
  if (!stepperContainer) return;

  // Si estamos en inicio (0), éxito (5) o error (6), ocultamos el stepper
  if (solicitud.paso === 0 || solicitud.paso >= 5) {
    stepperContainer.classList.add('hidden');
    return;
  }

  stepperContainer.classList.remove('hidden');

  const pasosNombres = ['Cotizar', 'Elegir plan', 'Datos', 'Pago'];
  stepperContainer.innerHTML = pasosNombres.map((nombre, idx) => {
    const numPaso = idx + 1;
    let estadoClase = 'bg-slate-200 text-slate-600'; // Pendiente
    if (numPaso < solicitud.paso) {
      estadoClase = 'bg-emerald-600 text-white'; // Completo[cite: 4, 5]
    } else if (numPaso === solicitud.paso) {
      estadoClase = 'bg-[#4F46E5] text-white font-bold'; // Activo[cite: 4, 5]
    }

    return `
      <div class="flex items-center gap-2">
        <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm ${estadoClase}">
          ${numPaso < solicitud.paso ? '✓' : numPaso}
        </span>
        <span class="text-sm font-medium ${numPaso === solicitud.paso ? 'text-slate-900 font-bold' : 'text-slate-500'}">
          ${nombre}
        </span>
      </div>
    `;
  }).join('<div class="h-px bg-slate-200 flex-1 mx-2"></div>');
}

async function renderPlanes() {
  const contenedorPlanes = document.getElementById('contenedor-planes');
  if (!contenedorPlanes) return;

  const planes = await cargarPlanes();
  if (!planes) return;

  const factor = obtenerFactorAntiguedad(solicitud.equipo.antiguedad);

  contenedorPlanes.innerHTML = planes.map((p) => {
    const cuota = calcularCuota(solicitud.equipo.valor, p.tasaAnual, factor);
    const formatoCuota = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(cuota);
    const seleccionado = solicitud.plan === p.id;

    return `
      <label class="card border p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between ${seleccionado ? 'border-[#4F46E5] bg-[#EEF2FF] ring-2 ring-[#4F46E5]' : 'border-slate-200 bg-white'}">
        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-lg text-slate-900">${p.nombre}</span>
            ${p.recomendado ? '<span class="badge bg-[#4F46E5] text-white text-xs px-2 py-0.5 rounded-full font-semibold">Recomendado</span>' : ''}
          </div>
          <div class="text-2xl font-extrabold text-[#3730A3] my-2">${formatoCuota}<span class="text-xs font-normal text-slate-500"> / mes</span></div>
          <ul class="text-xs text-slate-600 space-y-1 my-4">
            ${p.coberturas.map(c => `<li class="flex items-center gap-1"><span class="text-emerald-600 font-bold">✓</span> ${c}</li>`).join('')}
          </ul>
        </div>
        <div class="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
          <input type="radio" name="plan" value="${p.id}" ${seleccionado ? 'checked' : ''} class="w-4 h-4 text-[#4F46E5]">
          <span class="text-xs font-semibold text-slate-700">${seleccionado ? 'Seleccionado' : 'Elegir este plan'}</span>
        </div>
      </label>
    `;
  }).join('');
}

async function renderResumen() {
  const contenedores = document.querySelectorAll('.resumen-compra');
  if (contenedores.length === 0) return;

  const planes = await cargarPlanes();
  const planElegido = planes ? planes.find(p => p.id === solicitud.plan) : null;
  const factor = obtenerFactorAntiguedad(solicitud.equipo.antiguedad);
  const cuota = planElegido ? calcularCuota(solicitud.equipo.valor, planElegido.tasaAnual, factor) : 0;

  const formatoValor = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(solicitud.equipo.valor);
  const formatoCuota = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(cuota);

  const html = `
    <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-sm">
      <h3 class="font-bold text-slate-900 border-b border-slate-100 pb-2">Resumen de la cotización</h3>
      <div class="flex justify-between"><span class="text-slate-500">Equipo:</span> <span class="font-semibold text-slate-800">${solicitud.equipo.marca.toUpperCase()} ${solicitud.equipo.modelo}</span></div>
      <div class="flex justify-between"><span class="text-slate-500">Valor:</span> <span class="font-semibold text-slate-800">${formatoValor}</span></div>
      ${planElegido ? `<div class="flex justify-between"><span class="text-slate-500">Plan:</span> <span class="font-semibold text-slate-800">${planElegido.nombre}</span></div>` : ''}
      <div class="border-t border-slate-100 pt-2 flex justify-between items-center font-bold text-base">
        <span class="text-slate-900">Total mensual:</span>
        <span class="text-[#3730A3]">${formatoCuota}</span>
      </div>
    </div>
  `;

  contenedores.forEach(c => c.innerHTML = html);
}

function renderExito() {
  const elNombre = document.getElementById('exito-nombre');
  const elEmail = document.getElementById('exito-email');
  const elPoliza = document.getElementById('exito-poliza');

  if (elNombre) elNombre.textContent = `${solicitud.titular.nombre} ${solicitud.titular.apellido}`;
  if (elEmail) elEmail.textContent = solicitud.titular.email;
  if (elPoliza) elPoliza.textContent = solicitud.poliza;
}

function renderError() {
  // Mantiene los datos en el estado para poder reintentar[cite: 5, 7, 13]
}