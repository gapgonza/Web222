// Función para manejar el paso del mouse sobre la descripción
function handleDescriptionHover() {
    const descriptions = document.querySelectorAll('.description');
    descriptions.forEach(description => {
        description.addEventListener('mouseover', function () {
            const fullDescription = this.getAttribute('data-full-description');
            this.textContent = fullDescription;
        });

        description.addEventListener('mouseout', function () {
            const truncatedDescription = this.textContent.slice(0, 30) + '...';
            this.textContent = truncatedDescription;
        });
    });
}

// Función para manejar el clic en el botón "Agregar al carrito"
function handleAddToCartClick() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function () {
            const productCard = this.closest('.card');
            const productId = productCard.dataset.productId;
            const productTitle = productCard.querySelector('h3').textContent;
            const productPrice = parseFloat(productCard.dataset.price);
            const productImage = productCard.querySelector('img').src; 

            const product = {
                id: productId,
                title: productTitle,
                price: productPrice,
                image: productImage 
            };
            addToCart(product);
        });
    });
}



// Función para actualizar el número de elementos en el carrito en la interfaz de usuario
function updateCartCount() {
    const cartCount = document.getElementById('cuenta-carrito');
    const cart = getCart();
    cartCount.textContent = cart.length;
}

// Función para obtener el carrito del localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Función para agregar un producto al carrito
function addToCart(product) {
    const cart = getCart();
    const productWithImage = {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image // Asegúrate de incluir la URL de la imagen aquí
    };
    cart.push(productWithImage);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(); // Actualizar el número de elementos en el carrito
}


// Función para obtener los productos traducidos y sus descuentos
function getTranslatedProducts(done) {
    fetch('http://localhost:3000/productos')
        .then(response => response.json())
        .then(products => {
            // Obtener los descuentos
            fetch('http://localhost:3000/descuentos')
                .then(response => response.json())
                .then(discounts => {
                    // Integrar los descuentos en los productos
                    products.forEach(product => {
                        const discount = discounts.find(discount => discount.id === product.id);
                        if (discount) {
                            product.discount = discount.porcentaje;
                        } else {
                            product.discount = 0;
                        }
                    });
                    done(products);
                })
                .catch(error => console.error('Error fetching discounts:', error));
        })
        .catch(error => console.error('Error fetching translated products:', error));
}

// Función para obtener los productos con descuento del servidor
function getDiscountedProducts(done) {
    fetch('http://localhost:3000/descuentos')
        .then(response => response.json())
        .then(data => {
            done(data);
        })
        .catch(error => console.error('Error fetching discounted products:', error));
}

// Función para obtener los productos con descuento del servidor
function getDiscountedProducts(done) {
    fetch('http://localhost:3000/descuentos')
        .then(response => response.json())
        .then(data => {
            done(data);
        })
        .catch(error => console.error('Error fetching discounted products:', error));
}

// Función para cargar los productos en la página
function loadProducts() {
    // Función para obtener los productos traducidos
    function getTranslatedProducts(done) {
        fetch('http://localhost:3000/productos')
            .then(response => response.json())
            .then(data => {
                done(data);
            })
            .catch(error => console.error('Error fetching translated products:', error));
    }

    // Obtener los productos en oferta (supongamos que está disponible en una variable productosEnOferta)
    const productosEnOferta = [1, 3, 8, 12, 17];

    // Función para cargar los productos en la página
    getTranslatedProducts(data => {
        //para saber si se guardan bien los datso
        console.log("Productos para cargar:", data);
        getDiscountedProducts(discounts => {
            const discountsMap = new Map();
            discounts.forEach(discount => {
                discountsMap.set(discount.id, discount.descuento);
            });

            data.forEach((producto, index) => {
                const truncatedDescription = producto.description.slice(0, 30) + '...'; // Obtener los primeros 30 caracteres de la descripción
                const isProductoEnOferta = productosEnOferta.includes(index + 1); // Verificar si el producto está en oferta

                let precioConDescuento = producto.price; // Precio inicial

                // Aplicar descuento si el producto está en oferta
                if (isProductoEnOferta) {
                    const descuento = discountsMap.get(producto.id) || 0;
                    precioConDescuento = producto.price * (1 - descuento / 100);
                }

                const article = document.createRange().createContextualFragment(/*html*/`
<article>
    <section id="productos-container">
        <div class="card ${isProductoEnOferta ? 'oferta' : ''}" 
             data-product-id="${index}" 
             data-price="${producto.price}"
             data-image="${producto.image}"> <!-- Agregar el atributo data-image -->
            <img src="${producto.image}" alt="Producto"></img>
            <h3>${producto.title}</h3>
            <p class="description" data-full-description="${producto.description}">${truncatedDescription}</p>
            <p class="discount">Descuento: ${isProductoEnOferta ? discountsMap.get(producto.id) || 0 : 0}%</p>
            <p>Precio: $${producto.price}</p>
            <p>Precio con descuento: $${precioConDescuento.toFixed(2)}</p>
            <button class="add-to-cart-btn">Añadir al carrito</button>
        </div>
    </section>
</article>
`);


                const main = document.querySelector("main");
                main.append(article);


            });

            updateCartCount();
            // Agregar eventos para mostrar descripción completa al pasar el mouse
            const descriptions = document.querySelectorAll('.description');
            descriptions.forEach(description => {
                description.addEventListener('mouseover', function () {
                    const fullDescription = this.getAttribute('data-full-description');
                    this.textContent = fullDescription;
                });

                description.addEventListener('mouseout', function () {
                    const truncatedDescription = this.textContent.slice(0, 30) + '...';
                    this.textContent = truncatedDescription;
                });
            });

            // Agregar evento de clic para añadir al carrito
            const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
            addToCartButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const productCard = this.closest('.card');
                    const productId = productCard.dataset.productId;
                    const productTitle = productCard.querySelector('h3').textContent;
                    const productPriceText = productCard.dataset.price; // Obtener el precio del atributo data-price
                    const productPrice = parseFloat(productPriceText); // Convertir el precio a número
                    const productImage = productCard.dataset.image;


                    const product = {
                        id: productId,
                        title: productTitle,
                        price: parseFloat(productPrice),
                        image: productImage
                    };
                    addToCart(product);
                });
            });
        });
    });
}


// Cargar los productos en la página al cargarla
loadProducts();



// HASTA ACA ANDA LO QUE ANDE LO METEMOS ARRIBA
