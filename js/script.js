// script.js - DK Poliz conectado con Google Sheets API

const API_URL = "https://script.google.com/macros/s/AKfycbyRpU5Q6YH9mbRvMV3HuNpbIQudUbRysxo1cY4T7Ttko1JvNCEvBRHKI6_nM0Ko9_bf/exec";

let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// ========== CARGAR PRODUCTOS DESDE GOOGLE SHEETS ==========
async function cargarProductos() {
  try {
    const res = await fetch(`${API_URL}?sheet=productos`);
    productos = await res.json();
    
    // Filtrar solo productos disponibles en vista
    productos = productos.filter(p => p.disponible_en_vista === 'si');
    
    mostrarProductos();
    mostrarProductosPromo();
    actualizarContadorCarrito();
  } catch (error) {
    console.error('Error al cargar productos:', error);
    document.getElementById('lista-productos').innerHTML = 
      '<p style="color: #e50914;">Error al cargar productos. Intenta recargar la página.</p>';
  }
}

// ========== MOSTRAR PRODUCTOS EN INDEX ==========
function mostrarProductos() {
  const lista = document.getElementById("lista-productos");
  if (!lista) return;

  lista.innerHTML = "";

  if (productos.length === 0) {
    lista.innerHTML = '<p>No hay productos disponibles</p>';
    return;
  }

  productos.forEach((p) => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" onerror="this.src='https://via.placeholder.com/250x300?text=Sin+Imagen'">
      <h3>${p.nombre}</h3>
      <p class="categoria">${p.categoria} | ${p.talla} | ${p.color}</p>
      <p class="precio">$${Number(p.precio).toLocaleString('es-CO')}</p>
      ${p.promo === 'si' ? '<span class="badge-promo">🔥 PROMO</span>' : ''}
      <button onclick='agregarAlCarrito(${JSON.stringify(p)})'>Agregar al carrito</button>
    `;
    lista.appendChild(div);
  });
}

// ========== MOSTRAR PRODUCTOS EN PROMO ==========
function mostrarProductosPromo() {
  const promoDiv = document.getElementById("promo-dia");
  if (!promoDiv) return;

  const productosEnPromo = productos.filter(p => p.promo === 'si');

  if (productosEnPromo.length === 0) {
    promoDiv.innerHTML = '<p>No hay promociones activas</p>';
    return;
  }

  promoDiv.innerHTML = "";
  productosEnPromo.forEach(p => {
    const div = document.createElement("div");
    div.className = "producto promo-producto";
    div.innerHTML = `
      <span class="badge-promo">🔥 ${p.promo_nombre || 'OFERTA'}</span>
      <img src="${p.imagen}" alt="${p.nombre}" onerror="this.src='https://via.placeholder.com/250x300?text=Sin+Imagen'">
      <h3>${p.nombre}</h3>
      <p class="categoria">${p.categoria} | ${p.talla} | ${p.color}</p>
      <p class="precio">$${Number(p.precio).toLocaleString('es-CO')}</p>
      <button onclick='agregarAlCarrito(${JSON.stringify(p)})'>Agregar al carrito</button>
    `;
    promoDiv.appendChild(div);
  });
}

// ========== AGREGAR AL CARRITO ==========
function agregarAlCarrito(producto) {
  // Verificar si el producto ya existe en el carrito
  const existe = carrito.find(p => p.id === producto.id && p.talla === producto.talla && p.color === producto.color);
  
  if (existe) {
    existe.cantidad = (existe.cantidad || 1) + 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
  
  // Mostrar notificación
  mostrarNotificacion(`✅ ${producto.nombre} agregado al carrito`);
}

// ========== ACTUALIZAR CONTADOR DEL CARRITO ==========
function actualizarContadorCarrito() {
  const contador = document.getElementById("cart-count");
  const contadorFlotante = document.getElementById("cart-float-count");
  
  const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
  
  if (contador) contador.textContent = totalItems;
  if (contadorFlotante) contadorFlotante.textContent = totalItems;
}

// ========== NOTIFICACIÓN ==========
function mostrarNotificacion(mensaje) {
  const notif = document.createElement('div');
  notif.className = 'notificacion';
  notif.textContent = mensaje;
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    font-weight: bold;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 2000);
}

// ========== CARRITO.HTML ==========
function renderCarrito() {
  const carritoLista = document.getElementById("carrito-lista");
  const totalElement = document.getElementById("carrito-total");
  
  if (!carritoLista) return;

  carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carritoLista.innerHTML = "";

  if (carrito.length === 0) {
    carritoLista.innerHTML = '<p class="carrito-vacio">🛒 El carrito está vacío</p>';
    if (totalElement) totalElement.textContent = "Total: $0";
    return;
  }

  let total = 0;

  carrito.forEach((prod, index) => {
    const subtotal = Number(prod.precio) * (prod.cantidad || 1);
    total += subtotal;

    const div = document.createElement("div");
    div.className = "carrito-item";
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}" onerror="this.src='https://via.placeholder.com/100?text=Sin+Imagen'">
      <div class="carrito-item-info">
        <h3>${prod.nombre}</h3>
        <p>${prod.categoria} | ${prod.talla} | ${prod.color}</p>
        <p class="precio">$${Number(prod.precio).toLocaleString('es-CO')}</p>
      </div>
      <div class="carrito-item-cantidad">
        <button onclick="cambiarCantidad(${index}, -1)">-</button>
        <span>${prod.cantidad || 1}</span>
        <button onclick="cambiarCantidad(${index}, 1)">+</button>
      </div>
      <div class="carrito-item-subtotal">
        <p>$${subtotal.toLocaleString('es-CO')}</p>
        <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">🗑️</button>
      </div>
    `;
    carritoLista.appendChild(div);
  });

  if (totalElement) {
    totalElement.textContent = `Total: $${total.toLocaleString('es-CO')}`;
  }
}

function cambiarCantidad(index, cambio) {
  carrito[index].cantidad = (carrito[index].cantidad || 1) + cambio;
  
  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1);
  }
  
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderCarrito();
  actualizarContadorCarrito();
}

function eliminarDelCarrito(index) {
  if (confirm('¿Eliminar este producto del carrito?')) {
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderCarrito();
    actualizarContadorCarrito();
  }
}

function vaciarCarrito() {
  if (confirm('¿Vaciar todo el carrito?')) {
    carrito = [];
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderCarrito();
    actualizarContadorCarrito();
  }
}

// ========== ADMIN - CARGAR PRODUCTOS ==========
async function cargarProductosAdmin() {
  try {
    const res = await fetch(`${API_URL}?sheet=productos`);
    productos = await res.json();
    mostrarProductosAdmin();
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
}

function mostrarProductosAdmin() {
  const lista = document.getElementById("lista-admin-productos");
  if (!lista) return;

  lista.innerHTML = "<h3>Productos Registrados:</h3>";

  if (productos.length === 0) {
    lista.innerHTML += '<p>No hay productos registrados</p>';
    return;
  }

  productos.forEach(p => {
    const div = document.createElement("div");
    div.className = "producto-admin";
    div.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" width="100" onerror="this.src='https://via.placeholder.com/100?text=Sin+Imagen'">
      <div class="producto-admin-info">
        <h4>${p.nombre}</h4>
        <p>Precio: $${Number(p.precio).toLocaleString('es-CO')}</p>
        <p>${p.categoria} | ${p.talla} | ${p.color}</p>
        <p>Visible: ${p.disponible_en_vista} | Promo: ${p.promo}</p>
      </div>
      <div class="producto-admin-acciones">
        <button onclick='editarProducto(${JSON.stringify(p)})'>✏️ Editar</button>
        <button onclick='eliminarProducto("${p.id}")' class="btn-eliminar">🗑️ Eliminar</button>
      </div>
    `;
    lista.appendChild(div);
  });
}

// ========== ADMIN - AGREGAR/EDITAR PRODUCTO ==========
const formProducto = document.getElementById("form-producto");
let productoEditando = null;

if (formProducto) {
  formProducto.addEventListener("submit", async (e) => {
    e.preventDefault();

    const producto = {
      nombre: document.getElementById("nombre").value.trim(),
      precio: document.getElementById("precio").value.trim(),
      categoria: document.getElementById("categoria").value.trim(),
      talla: document.getElementById("talla").value.trim(),
      color: document.getElementById("color").value.trim(),
      imagen: document.getElementById("imagen").value.trim(),
      disponible_en_vista: document.getElementById("disponible").value,
      promo: document.getElementById("promo").value,
      promo_nombre: document.getElementById("promo-nombre-prod").value.trim()
    };

    const action = productoEditando ? 'update' : 'add';
    const id = productoEditando || new Date().getTime();

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          sheet: 'productos',
          action: action,
          id: id,
          data: producto
        })
      });

      const result = await res.json();

      if (result.success) {
        alert(productoEditando ? '✅ Producto actualizado' : '✅ Producto agregado');
        formProducto.reset();
        productoEditando = null;
        document.getElementById("btn-guardar-prod").textContent = "Agregar Producto";
        document.getElementById("btn-cancelar-prod").style.display = "none";
        cargarProductosAdmin();
      } else {
        alert('⚠️ Error al guardar producto');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('⚠️ Error de conexión');
    }
  });
}

function editarProducto(p) {
  productoEditando = p.id;
  document.getElementById("nombre").value = p.nombre;
  document.getElementById("precio").value = p.precio;
  document.getElementById("categoria").value = p.categoria;
  document.getElementById("talla").value = p.talla;
  document.getElementById("color").value = p.color;
  document.getElementById("imagen").value = p.imagen;
  document.getElementById("disponible").value = p.disponible_en_vista;
  document.getElementById("promo").value = p.promo;
  document.getElementById("promo-nombre-prod").value = p.promo_nombre || '';
  
  document.getElementById("btn-guardar-prod").textContent = "Guardar Cambios";
  document.getElementById("btn-cancelar-prod").style.display = "inline-block";
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicionProducto() {
  productoEditando = null;
  document.getElementById("form-producto").reset();
  document.getElementById("btn-guardar-prod").textContent = "Agregar Producto";
  document.getElementById("btn-cancelar-prod").style.display = "none";
}

async function eliminarProducto(id) {
  if (!confirm('¿Eliminar este producto?')) return;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        sheet: 'productos',
        action: 'delete',
        id: id
      })
    });

    const result = await res.json();

    if (result.success) {
      alert('🗑️ Producto eliminado');
      cargarProductosAdmin();
    } else {
      alert('⚠️ Error al eliminar');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('⚠️ Error de conexión');
  }
}

// ========== INICIALIZACIÓN ==========
document.addEventListener("DOMContentLoaded", () => {
  // Página index
  if (document.getElementById("lista-productos")) {
    cargarProductos();
  }

  // Página carrito
  if (document.getElementById("carrito-lista")) {
    renderCarrito();
  }

  // Página admin
  if (document.getElementById("lista-admin-productos")) {
    cargarProductosAdmin();
  }

  // Actualizar contador en todas las páginas
  actualizarContadorCarrito();
});