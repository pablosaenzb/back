var express = require('express');
var router = express.Router();
var novedadesModel = require('../../models/novedadesModel');
var util = require('util');
var cloudinary = require('cloudinary').v2;
const uploader = util.promisify(cloudinary.uploader.upload); //uploasd de subir imagen
const destroy = util.promisify(cloudinary.uploader.destroy); //destroy para borra iamgend e cloudinary si la borro en mi programa con modificar producto

const pool = require('../../models/bd');

// ene sta seccion vinculamos la BD y las fucniones creadas en: MODELS-novedadesModel.js



//para listar las novedades
router.get('/', async function (req,res, next){

    var novedades = await novedadesModel.getNovedades(); 

    //listar iamgenes

    novedades = novedades.map(novedad => {
        if (novedad.img_id) {
            const imagen = cloudinary.image(novedad.img_id, {
                width:100,
                height:100,
                crop: 'fill'
            });
            return{
                ...novedad,
                imagen   //si tengo la imagen la muestro
            }
        } else {
            return{
                ...novedad,
                imagen:'' // si no tengo la iamgen muestro vacio
            }
        }
    });
    //listar iamgenes fin


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
       //imagenes - Agregar
       var img_id='';
       if (req.files && Object.keys(req.files).length > 0) {
        imagen = req.files.imagen;
        img_id = (await uploader(imagen.tempFilePath)).public_id;
    }    
       //imagenesfin - Agregar - tambien modificamos el if de acontinuacion 
        if (req.body.nombre !== "" && req.body.marca !== "" && req.body.precio !== "" && req.body.observaciones !== "") {
            await novedadesModel.insertNovedades(
                {
                    ...req.body,
                    img_id
                });
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

    //Eliminar imagen
    let novedad = await novedadesModel.getNovedadById(id);
    if (novedad.img_id) {
        await (destroy(novedad.img_id));
    }
    //Eliminar imagen fin

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

        //modificar o cambiar imagen
        let img_id = req.body.img_original;
        let borrar_img_vieja = false;
        if(req.body.img_delete === "1") { // este 1 coresponde al valor 1 de modificar.hbs
            img_id = null;
            borrar_img_vieja = true;
        } else {
            if (req.files && Object.keys(req.files).length > 0){
                imagen = req.files.imagen;
                img_id = (await uploader(imagen.tempFilePath)).public_id;
                borrar_img_vieja = true;
            }
        }
        if (borrar_img_vieja && req.body.img_original){
            await (destroy(req.body.img_original));
        }
        // modificar o cambiar iamgen fin

        var obj = {
            Nombre: req.body.nombre,
            Marca: req.body.marca,
            Precio: req.body.precio,
            Observaciones: req.body.observaciones,
            img_id
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