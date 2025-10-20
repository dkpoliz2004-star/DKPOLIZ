// Productos y carrito
let productos = JSON.parse(localStorage.getItem("productos")) || [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let promoDia = localStorage.getItem("promoDia") || "";

// Mostrar productos en index
function mostrarProductos() {
  const lista = document.getElementById("lista-productos");
  if(!lista) return;
  lista.innerHTML = "";
  productos.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p>Precio: $${p.precio}</p>
      <button onclick="agregarCarrito(${i})">Agregar al carrito</button>
    `;
    lista.appendChild(div);
  });
}

// Agregar al carrito
function agregarCarrito(idx) {
  carrito.push(productos[idx]);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  alert("Producto agregado al carrito");
}

// Mostrar promo
function mostrarPromo() {
  const promoEl = document.getElementById("promo-dia");
  if(!promoEl) return;
  promoEl.innerHTML = promoDia ? `<h3>Promo del Día: ${promoDia}</h3>` : "<p>No hay promo del día</p>";
}

// Admin - Agregar producto
const formProducto = document.getElementById("form-producto");
if(formProducto) {
  formProducto.addEventListener("submit", e => {
    e.preventDefault();
    const p = {
      nombre: document.getElementById("nombre").value,
      precio: document.getElementById("precio").value,
      categoria: document.getElementById("categoria").value,
      talla: document.getElementById("talla").value,
      color: document.getElementById("color").value,
      imagen: document.getElementById("imagen").value
    };
    productos.push(p);
    localStorage.setItem("productos", JSON.stringify(productos));
    mostrarProductos();
    formProducto.reset();
    alert("Producto agregado");
  });
}

// Admin - Actualizar promo
const formPromo = document.getElementById("form-promo");
if(formPromo) {
  formPromo.addEventListener("submit", e => {
    e.preventDefault();
    promoDia = document.getElementById("promo-nombre").value;
    localStorage.setItem("promoDia", promoDia);
    mostrarPromo();
    formPromo.reset();
    alert("Promo actualizada");
  });
}

// Inicializar
mostrarProductos();
mostrarPromo();
