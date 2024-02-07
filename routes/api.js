const express = require('express');
const router = express.Router();
const novedadesModel = require('../models/novedadesModel');
const cloudinary = require('cloudinary').v2;
var nodemailer = require('nodemailer');

//caundo recibo /novedades
router.get('/novedades', async function (req, res, next) {
    let novedades = await novedadesModel.getNovedades();

    novedades = novedades.map(novedades => {
        if(novedades.img_id) {
            const imagen = cloudinary.url(novedades.img_id, {
                width: 400,
                height: 400,
                crop:'fill'
            });
            return {
                ...novedades,
                imagen
        }
    } else {
        return {
            ...novedades,
            imagen: ''
        }
    }
});

res.json(novedades);
});

//caundo recibo /contacto ESTO ES POR EL MAIL

router.post('/contacto', async(req,res)=> {
    const mail = {
        to:'pablosaenz@gmail.com',
        subject: 'Contacto web',
        html:`${req.body.nombre} se contacto a traves de la web y quiere mas informacion. Su mail de contacto es: ${req.body.email}
        <br> Ademas, hizo el siguiente comentario: ${req.body.mensaje}<br>
        Su telefono es: ${req.body.telefono}`
    }

    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    await transport.sendMail(mail)

    res.status(201).json({
        error:false,
        message: 'Mensaje enviado'
    });
});

module.exports = router;