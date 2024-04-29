document.addEventListener('DOMContentLoaded', function () {
    verCarrProduct();
    ifVacio();

    // Evento del botoncitoou "Comprar"
    const comprarButton = document.querySelector('#totales button');
    comprarButton.addEventListener('click', () => {
        const carrito = JSON.parse(localStorage.getItem('cart')) || [];
        if (carrito.length > 0) { // Verificar si el carrito no está vacío
            enviarCompraAlServidor(carrito);
        } else {
            console.log('El carrito está vacío. No se puede realizar la compra.');
        }
    });
});

const addToCart = product => {
    // Obtener el carrito de localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex !== -1) {
        // Si el producto ya existe en el carrito, incremento la cantidad
        cart[existingProductIndex].quantity++;
    } else {
        // Agrego el producto al carrito
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    // Guardar el carrito en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    verCarrProduct();
    ifVacio();
};

const eliminarDelCarrito = productId => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    verCarrProduct();
    ifVacio();
};

const subirCant = productId => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = cart.find(item => item.id === productId);
    if (product) {
        product.quantity++;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        verCarrProduct();
    }
};

const bajarCant = productId => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = cart.find(item => item.id === productId);
    if (product && product.quantity > 1) {
        product.quantity--;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        verCarrProduct();
    }
};

const verCarrProduct = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const contenedorCarritou = document.getElementById('cart-container');
    const mensajeCarritoVacio = document.getElementById('carrito-vacio');
    const elementoTotal = document.getElementById('total');

    contenedorCarritou.innerHTML = '';
    let totalCuenta = 0;

    if (cart.length === 0) {
        mensajeCarritoVacio.style.display = 'block';
        elementoTotal.textContent = '$0.00'; // Si el carrito está vacío, muestra $0.00 como el precio total
    } else {
        mensajeCarritoVacio.style.display = 'none';

        cart.forEach(product => {
            const productElement = document.createElement('div');
            productElement.classList.add('cart-item');

            const img = document.createElement('img');
            img.src = product.image;
            img.alt = product.title;
            productElement.appendChild(img);

            const title = document.createElement('span');
            title.textContent = `${product.title} x ${product.quantity}`;
            productElement.appendChild(title);

            const price = document.createElement('span');
            const precioTotalProducto = product.price * product.quantity; // Precio total para este producto
            price.textContent = `$${precioTotalProducto.toFixed(2)}`; // Muestra el precio total para este producto
            productElement.appendChild(price);

            totalCuenta += precioTotalProducto; // Sumo el precio total de este producto al precio total general

            // Botón para disminuir la cantidad
            const decreaseButton = document.createElement('button');
            decreaseButton.textContent = '-';
            decreaseButton.addEventListener('click', () => bajarCant(product.id));
            productElement.appendChild(decreaseButton);

            // Botoooonnn para aumentar la cantidad
            const increaseButton = document.createElement('button');
            increaseButton.textContent = '+';
            increaseButton.addEventListener('click', () => subirCant(product.id));
            productElement.appendChild(increaseButton);

            // Botooooooooooon para eliminar el producto
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Eliminar';
            removeButton.addEventListener('click', () => eliminarDelCarrito(product.id));
            productElement.appendChild(removeButton);

            contenedorCarritou.appendChild(productElement);
        });

        elementoTotal.textContent = `$${totalCuenta.toFixed(2)}`; // muestra el precio total???
    }
};

const updateCartCount = () => {
    const cartCount = document.getElementById('cantidad');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = totalItems;
};

const ifVacio = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const comprarButton = document.querySelector('#totales button');

    if (cart.length > 0) {
        comprarButton.removeAttribute('disabled'); // Habilitar el botón
    } else {
        comprarButton.setAttribute('disabled', true); // Deshabilitar el botón
    }
};

const enviarCompraAlServidor = async (carrito) => {
    try {
        const respuesta = await fetch('/compras', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(carrito)
        });
        const datosRespuesta = await respuesta.json();
        console.log('Respuesta del servidor:', datosRespuesta);
        // Limpiar el carrito y mostrar mensaje de agradecimiento si la compra fue exitosa
        if (respuesta.ok) {
            const contenedorProductos = document.getElementById('cart-container');
            contenedorProductos.innerHTML = ''; // Limpiar contenido del carrito
            const mensajeAgradecimiento = document.createElement('p');
            mensajeAgradecimiento.textContent = '¡Gracias por su compra!';
            contenedorProductos.appendChild(mensajeAgradecimiento);
            // Limpiar el localStorage solo si la compra se envió correctamente
            localStorage.removeItem('cart');
            // Redirigir al usuario al index después de un breve tiempo (por ejemplo, 3 segundos)
            setTimeout(() => {
                window.location.href = '/index.html'; // Cambiar la URL al index
            }, 2000); // Esperar 2 segundos antes de redirigir
        }
    } catch (error) {
        console.error('Error al enviar la compra al servidor:', error);
    }
};

// Limpiar el localStorage al abandonar la página del carrito
window.addEventListener('beforeunload', () => {
    // Remueve esta línea, ya que ahora la limpieza se hace después de enviar la compra
});


