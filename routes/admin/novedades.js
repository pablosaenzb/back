var express = require('express');
var router = express.Router();
var novedadesModel = require('../../models/novedadesModel');
const pool = require('../../models/bd');

// ene sta seccion vinculamos la BD y las fucniones creadas en: MODELS-novedadesModel.js



//para listar las novedades
router.get('/', async function (req,res, next){

    var novedades = await novedadesModel.getNovedades(); 

    res.render('admin/novedades', {
        layout:'admin/layout',
        usuario: req.session.nombre, novedades

    });
});

//para AGREGAR las novedades
router.get('/agregar', (req, res, next) => {
    res.render('admin/agregar', {
        layout: 'admin/layout'
    })
})

//para INSERTAR novedades (post) mencionamos 2 factores. El primero:
// se peude insertar la novedad correctamente, el segundo con error (todos los campos son requeridos)
// !== "" Si es diferente a vacio, se carga(aunque tenga solo 1 numero o 1 letra)
//el message del error se lo vinculamos a agregar.hbs
router.post('/agregar', async (req, res, next) => {
    try {
        if (req.body.nombre !== "" && req.body.marca !== "" && req.body.precio !== "" && req.body.observaciones !== "") {
            await novedadesModel.insertNovedades(req.body);
            res.redirect('/admin/novedades');
        } else {
            res.render('admin/agregar', {
                layout: 'admin/layout',
                error: true,
                message: '*Todos los campos son requeridos'
            });
        }
    } catch (error) {
        console.error(error);
        res.render('admin/agregar', {
            layout: 'admin/layout',
            error: true,
            message: '*No se cargó la novedad'
        });
    }
});

//para ELIMINAR las novedades
router.get('/eliminar/:id', async (req,res, next) => {
    var id = req.params.id;

    await novedadesModel.deleteNovedadesById(id);
    res.redirect('/admin/novedades');
});

//para MODIFICAR las novedades:
    // 1 - Traer las vistas del elemento que deseamos modificar - GET
    // var id =req.params.id; = captura el id deseado
router.get('/modificar/:id', async (req, res, next) => {
    var id =req.params.id;
    var novedad = await novedadesModel.getNovedadById(id);
    
    console.log(req.params.id);
    res.render('admin/modificar', {
        layout: 'admin/layout',
        novedad
    })
});

    //2 - Actualizamos - Metodo post para incertar
router.post('/modificar', async (req, res, next) => {
    try {
        var obj = {
            Nombre: req.body.nombre,
            Marca: req.body.marca,
            Precio: req.body.precio,
            Observaciones: req.body.observaciones
        }
        
        await novedadesModel.modificarNovedadById(obj, req.body.id);
        res.redirect('/admin/novedades');
    
    }catch (error) {
        console.log(error)
        res.render('admin/modificar', {
            layout:'admin/layout',
            error: true,
            message: 'No se modifico la novedad'
        })
    }
})


module.exports = router;