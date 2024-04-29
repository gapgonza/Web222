const express = require('express');
const cors = require('cors');
const fs = require('fs');
const translate = require("node-google-translate-skidz");
const path = require('path');
const app = express();

app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))

// Función para traducir una descripción del inglés al español utilizando node-google-translate-skidz
const traducirDescripcion = async (descripcion) => {
    try {
        return new Promise((resolve, reject) => {
            translate({ text: descripcion, source: 'en', target: 'es' }, (traduccion) => {
                if (traduccion && traduccion.translation) {
                    resolve(traduccion.translation);
                } else {
                    reject('Error al traducir la descripción');
                }
            });
        });
    } catch (error) {
        console.error('Error al traducir la descripción:', error);
        return descripcion; // Si hay un error, devolvemos la descripción original
    }
};

app.post('/compras', (req, res) => {
    const nuevaCompra = req.body;
    
    // Formar un ejemplo de compra
    fs.readFile('./compras.json', (error, data) => {
        if (error) {
            console.error('Error al leer el archivo de compras:', error);
            return res.status(500).send('Error interno del servidor');
        }
        let compras = JSON.parse(data);
        compras.push(nuevaCompra);
        fs.writeFile('./compras.json', JSON.stringify(compras), () => {
            console.log('Compra registrada');
            res.type('application/json');
            res.sendFile(path.join(__dirname, 'compras.json'));
        });
    });
});

// Ruta para ver el contenido del archivo de compras
app.get('/compras-json', (req, res) => {
    fs.readFile('./compras.json', 'utf8', (error, data) => {
        if (error) {
            console.error('Error al leer el archivo de compras:', error);
            return res.status(500).send('Error interno del servidor');
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

///products para mostar los productos en lista
app.get('/productos', (req, res) => {
    fs.readFile('./products.json', 'utf8', (error, data) => {
        if (error) {
            console.error('Error al leer el archivo de productos:', error);
            return res.status(500).send('Error interno del servidor');
        }
        const productos = JSON.parse(data);
        
        // Traducir las descripciones de los productos
        const promesasTraduccion = productos.map(producto => {
            return new Promise((resolve, reject) => {
                translate({ text: producto.description, source: 'en', target: 'es' }, (traduccion) => {
                    if (traduccion && traduccion.translation) {
                        producto.description = traduccion.translation;
                        resolve();
                    } else {
                        reject('Error al traducir la descripción');
                    }
                });
            });
        });

        // Esperar a que todas las traducciones se completen antes de enviar la respuesta al cliente
        Promise.all(promesasTraduccion)
            .then(() => {
                res.json(productos);
            })
            .catch(error => {
                console.error('Error al traducir las descripciones:', error);
                res.status(500).send('Error interno del servidor');
            });
    });
});

// hacer un endpoint
app.get('/descuentos',(req,res)=>{
    res.type('application/json')
    res.sendFile(path.join(__dirname, 'descuentos.json'))
})



app.listen(3000, () =>
    console.log('Server listening on port 3000!'));
