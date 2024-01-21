var pool = require('./bd');

//funcion seleccionar novedades
async function getNovedades(){
        var query = 'select * from novedades';
        var rows = await pool.query(query);
        return rows;
    }

//funcion insertar producto en novedades

async function insertNovedades(obj) {
    try{
        var query = "insert into novedades set ?";
        var rows = await pool.query(query, [obj])
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


//funcion eliminar producto en novedades

async function deleteNovedadesById(id) {
    var query = 'delete from novedades where id = ?';
    var rows =await pool.query(query, [id]);
    return rows;
}


// funcion modificar 2 pasos: 

    //Primero tenemos que llevar solo el campo(id) seleccionado al formd e novedades - GET
async function getNovedadById(id){
    var query = 'select * from novedades where id = ? ';
    var rows = await pool.query(query, [id]);
    return rows[0];
}
    // Actualizamos con el boton modificar 
    async function modificarNovedadById(obj, id) {
        try {
            var query = 'update novedades set ? where id=?';
            var rows = await pool.query(query, [obj, id]);
            return rows;
        } catch (error) {
            throw error;
        }
    }




// se deben llamar a todas las funciones 
module.exports = { getNovedades, insertNovedades, deleteNovedadesById,  getNovedadById, modificarNovedadById }