// js/app.js
import { solicitud, irAPaso } from './estado.js';
import { render, cargarPlanes } from './render.js';
import * as V from './validaciones.js';
import { simularPago, generarPoliza } from './pago.js';

document.addEventListener('DOMContentLoaded', async () => {
  await cargarPlanes();
  render();

  // --- BOTONES GENERALES DE NAVEGACIÓN ---
  document.querySelectorAll('[data-action="ir-paso"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const paso = Number(e.currentTarget.dataset.pasoTarget);
      irAPaso(paso);
    });
  });

  document.querySelectorAll('[data-action="volver-inicio"]').forEach(btn => {
    btn.addEventListener('click', () => {
      // Reiniciar solicitud[cite: 5]
      solicitud.equipo = { marca: '', modelo: '', valor: 0, antiguedad: '' };
      solicitud.plan = 'plus';
      solicitud.titular = { nombre: '', apellido: '', dni: '', nacimiento: '', email: '', celular: '', terminos: false };
      solicitud.pago = { metodo: 'credito', tarjeta: '', vencimiento: '', cvv: '', titular: '' };
      solicitud.poliza = null;
      irAPaso(0);
    });
  });

  // --- PASO 1: COTIZAR ---
  const formCotizar = document.getElementById('form-cotizar');
  const btnVerPlanes = document.getElementById('btn-ver-planes');

  if (formCotizar) {
    const inputsPaso1 = formCotizar.querySelectorAll('select, input');
    
    inputsPaso1.forEach(input => {
      input.addEventListener('blur', () => validarCampoPaso1(input));
      input.addEventListener('input', () => {
        guardarDatosPaso1();
        validarFormularioPaso1();
      });
    });

    formCotizar.addEventListener('submit', (e) => {
      e.preventDefault(); // Evita recarga de página[cite: 16]
      if (validarFormularioPaso1(true)) {
        irAPaso(2);
      }
    });
  }

  function guardarDatosPaso1() {
    const marca = document.getElementById('marca')?.value || '';
    const modelo = document.getElementById('modelo')?.value || '';
    const valorBruto = document.getElementById('valor')?.value || '';
    const valorLimpio = Number(valorBruto.replace(/\D/g, '')); // Limpiar strings[cite: 15]
    const antiguedad = formCotizar?.querySelector('input[name="antiguedad"]:checked')?.value || '';

    solicitud.equipo = { marca, modelo, valor: valorLimpio, antiguedad };
  }

  function validarCampoPaso1(input) {
    guardarDatosPaso1();
    let err = null;
    if (input.id === 'marca') err = V.validarMarca(solicitud.equipo.marca);
    if (input.id === 'modelo') err = V.validarModelo(solicitud.equipo.modelo);
    if (input.id === 'valor') err = V.validarValor(solicitud.equipo.valor);
    if (input.name === 'antiguedad') err = V.validarAntiguedad(solicitud.equipo.antiguedad);

    mostrarErrorCampo(input, err);
  }

  function validarFormularioPaso1(mostrarTodos = false) {
    guardarDatosPaso1();
    const e1 = V.validarMarca(solicitud.equipo.marca);
    const e2 = V.validarModelo(solicitud.equipo.modelo);
    const e3 = V.validarValor(solicitud.equipo.valor);
    const e4 = V.validarAntiguedad(solicitud.equipo.antiguedad);

    const esValido = !e1 && !e2 && !e3 && !e4;
    if (btnVerPlanes) btnVerPlanes.disabled = !esValido;

    if (mostrarTodos) {
      if (document.getElementById('marca')) mostrarErrorCampo(document.getElementById('marca'), e1);
      if (document.getElementById('modelo')) mostrarErrorCampo(document.getElementById('modelo'), e2);
      if (document.getElementById('valor')) mostrarErrorCampo(document.getElementById('valor'), e3);
      const antInput = formCotizar?.querySelector('input[name="antiguedad"]');
      if (antInput) mostrarErrorCampo(antInput, e4);
    }

    return esValido;
  }

  // --- PASO 2: ELEGIR PLAN ---
  const contenedorPlanes = document.getElementById('contenedor-planes');
  if (contenedorPlanes) {
    contenedorPlanes.addEventListener('change', (e) => {
      if (e.target.name === 'plan') {
        solicitud.plan = e.target.value;
        render();
      }
    });
  }

  // --- PASO 3: DATOS PERSONALES ---
  const formDatos = document.getElementById('form-datos');
  const btnContinuarPago = document.getElementById('btn-continuar-pago');

  if (formDatos) {
    const inputsPaso3 = formDatos.querySelectorAll('input');

    inputsPaso3.forEach(input => {
      input.addEventListener('blur', () => validarCampoPaso3(input));
      input.addEventListener('input', () => {
        guardarDatosPaso3();
        validarFormularioPaso3();
      });
    });

    formDatos.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validarFormularioPaso3(true)) {
        irAPaso(4);
      }
    });
  }

  function guardarDatosPaso3() {
    solicitud.titular = {
      nombre: document.getElementById('nombre')?.value || '',
      apellido: document.getElementById('apellido')?.value || '',
      dni: document.getElementById('dni')?.value || '',
      nacimiento: document.getElementById('nacimiento')?.value || '',
      email: document.getElementById('email')?.value || '',
      celular: document.getElementById('celular')?.value || '',
      terminos: document.getElementById('terminos')?.checked || false
    };
  }

  function validarCampoPaso3(input) {
    guardarDatosPaso3();
    let err = null;
    if (input.id === 'nombre') err = V.validarNombreApellido(solicitud.titular.nombre);
    if (input.id === 'apellido') err = V.validarNombreApellido(solicitud.titular.apellido);
    if (input.id === 'dni') err = V.validarDNI(solicitud.titular.dni);
    if (input.id === 'nacimiento') err = V.validarNacimiento(solicitud.titular.nacimiento);
    if (input.id === 'email') err = V.validarEmail(solicitud.titular.email);
    if (input.id === 'celular') err = V.validarCelular(solicitud.titular.celular);
    if (input.id === 'terminos') err = V.validarTerminos(solicitud.titular.terminos);

    mostrarErrorCampo(input, err);
  }

  function validarFormularioPaso3(mostrarTodos = false) {
    guardarDatosPaso3();
    const t = solicitud.titular;
    const e1 = V.validarNombreApellido(t.nombre);
    const e2 = V.validarNombreApellido(t.apellido);
    const e3 = V.validarDNI(t.dni);
    const e4 = V.validarNacimiento(t.nacimiento);
    const e5 = V.validarEmail(t.email);
    const e6 = V.validarCelular(t.celular);
    const e7 = V.validarTerminos(t.terminos);

    const esValido = !e1 && !e2 && !e3 && !e4 && !e5 && !e6 && !e7;
    if (btnContinuarPago) btnContinuarPago.disabled = !esValido;

    if (mostrarTodos) {
      ['nombre','apellido','dni','nacimiento','email','celular','terminos'].forEach(id => {
        const el = document.getElementById(id);
        if (el) validarCampoPaso3(el);
      });
    }

    return esValido;
  }

  // --- PASO 4: PAGO SIMULADO ---
  const formPago = document.getElementById('form-pago');
  const btnPagar = document.getElementById('btn-pagar');

  if (formPago) {
    formPago.addEventListener('submit', async (e) => {
      e.preventDefault();

      const tarjeta = document.getElementById('tarjeta')?.value || '';
      const vencimiento = document.getElementById('vencimiento')?.value || '';
      const cvv = document.getElementById('cvv')?.value || '';
      const titularPago = document.getElementById('titular-pago')?.value || '';

      const e1 = V.validarTarjeta(tarjeta);
      const e2 = V.validarVencimiento(vencimiento);
      const e3 = V.validarCVV(cvv);
      const e4 = V.validarTitular(titularPago);

      mostrarErrorCampo(document.getElementById('tarjeta'), e1);
      mostrarErrorCampo(document.getElementById('vencimiento'), e2);
      mostrarErrorCampo(document.getElementById('cvv'), e3);
      mostrarErrorCampo(document.getElementById('titular-pago'), e4);

      if (e1 || e2 || e3 || e4) return;

      solicitud.pago = { metodo: 'credito', tarjeta, vencimiento, cvv, titular: titularPago };

      // Estado de carga[cite: 5]
      if (btnPagar) {
        btnPagar.disabled = true;
        btnPagar.textContent = 'Procesando...';
      }

      const res = await simularPago(tarjeta);

      if (btnPagar) {
        btnPagar.disabled = false;
        btnPagar.textContent = 'Pagar y contratar';
      }

      if (res.ok) {
        solicitud.poliza = generarPoliza();
        irAPaso(5); // Éxito
      } else {
        irAPaso(6); // Error[cite: 5, 8]
      }
    });
  }

  // Función genérica para reflejar accesibilidad y errores[cite: 6, 13, 15]
  function mostrarErrorCampo(inputElement, mensajeError) {
    if (!inputElement) return;
    const fieldGroup = inputElement.closest('.field') || inputElement.closest('fieldset') || inputElement.parentElement;
    if (!fieldGroup) return;

    let alertEl = fieldGroup.querySelector('[role="alert"]');

    if (mensajeError) {
      fieldGroup.setAttribute('data-invalid', 'true');
      inputElement.setAttribute('aria-invalid', 'true');
      if (!alertEl) {
        alertEl = document.createElement('p');
        alertEl.setAttribute('role', 'alert');
        alertEl.className = 'text-xs text-red-600 mt-1 font-medium';
        fieldGroup.appendChild(alertEl);
      }
      alertEl.textContent = mensajeError;
    } else {
      fieldGroup.removeAttribute('data-invalid');
      inputElement.removeAttribute('aria-invalid');
      if (alertEl) alertEl.remove();
    }
  }
});