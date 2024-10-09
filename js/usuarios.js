var idCategoriaSeleccionada=-1;
var idUsuarioSeleccionado=-1;
var idUsuarioPermisoSeleccionado=-1;
var idPermisoSeleccionado=-1;

let verificarCheckbox = -1;

var nuevoTituloExpedientes = "AGREGAR NUEVA CATEGORIA.";
var editarTituloExpedientes = "EDITAR CATEGORIA.";

var nuevoTituloUsuarios = "NUEVO USUARIO.";
var editarTituloUsuarios = "EDITAR USUARIO";

var tituloPermisos = "ADMINISTRAR PERMISOS";


function ajustarElementos(){  
}

$(document).ready(function() {
  ajustarElementos(); //Obligatoria
  agregarListeners(); //Obligatoria
  filtrarAreas();
  filtrarSucursal();
  filtrarJefes();
  filtrarCategoriaExpediente();
});

$( window ).resize(function() {
  ajustarElementos();
});

$(window).load(function() {
  ajustarElementos();
});

function agregarListeners(){
    $(".boton-guardar-usuarios").click(guardarUsuario);
    $(".boton-cancelar-usuarios").click(limpiarFormularioUsuarios);
    $(".boton-nueva-categoria").click(agregarCategoriaExpediente);

    $(".boton-guardar-categoria").click(guardarCategoriaExpediente);
    $(".boton-cancelar-categoria").click(limpiarFormularioCategorias);

}

function limpiarFormularioCategorias(){
    idCategoriaSeleccionada = -1;
    $(".lista-categorias-expedientes").show();
    $(".formulario-nueva-categoria").hide();
    $(".bloque[data-seccion='2'] .contenedor-titulo").html("CATEGORÍA DE LOS EXPEDIENTES.");
    $(".boton-nueva-categoria").show();

}

function limpiarFormularioUsuarios(){
    $('.campo-correo').val("");
    //$('.campo-contrasenia').val();
    $('.campo-nombre').val("");
    $('.campo-apaterno').val("");
    $('.campo-amaterno').val("");
    $('.campo-puesto').val("");
    $('select.campo-area-nuevo').val("");
    $('.campo-extension').val("");
    $('select.campo-sucursal').val("");
    $('.campo-telefono').val("");
    $('.campo-sexo').val("");

    $('.campo-fecha-nacimiento').val("");
    $('select.campo-jefedirecto').val("");
    
    $(".bloque").hide();
    $(".bloque[data-seccion='0']").show();
    $(".celda[data-seccion='0']").addClass("seleccionado");
    $(".celda[data-seccion='1']").removeClass("seleccionado");
    $(".bloque[data-seccion='1'] .titulo-seccion").html(nuevoTituloUsuarios);
    $(".submenu .opcion[data-seccion='1']").html(nuevoTituloUsuarios);

    //filtrarUsuarios();
}

function agregarCategoriaExpediente(){
    $(".lista-categorias-expedientes").hide();
    $(".formulario-nueva-categoria").show();
    $(".bloque[data-seccion='2'] .contenedor-titulo").html(nuevoTituloExpedientes);
    $(".boton-nueva-categoria").hide();
    $(".nombre-categoria").val("");
}

function filtrarSucursal(){
    var datos={
        listadoActivas: 1,
      };
      $.ajax({
          url: "./lib_php/updSucursales.php",
          type: "POST",
          dataType: "json",
          data: datos
      }).always(function(respuesta_json){
          //console.log(respuesta_json);
          if (respuesta_json.isExito == 1){
            var sucursales = respuesta_json.datos;
            var elemHTML_suc='<option value='+-1+'>Seleccione una sucursal</option>';
            for(var i=0;i<sucursales.length;i++){
                elemHTML_suc+='<option value="'+sucursales[i].id+'">'+sucursales[i].nombre+ '</option>';
            }
            $("select.campo-sucursal").html(elemHTML_suc); 
          }
      });
}

//FILTRAR AREAS (select .campo-jefe)
function filtrarJefes(){
    var datos={
        listadoActivos: 1,
        area: -1,
        activos: 1
    };
    //console.log(datos);
    $.ajax({
        url: "./lib_php/updUsuarios.php",
        type: "POST",
        dataType: "json",
        data: datos
    }).always(function(respuesta_json){
        console.log(respuesta_json);
        if (respuesta_json.isExito == 1){
            var jefes = respuesta_json.datos;
            var elemHTML_jefe='<option value='+-1+'>Seleccione un jefe</option>';
            for(var i=0;i<jefes.length;i++){
                elemHTML_jefe+='<option value="'+jefes[i].id+'">'+jefes[i].nombre+' - '+jefes[i].area+'</option>';
            }
            $("select.campo-jefedirecto").html(elemHTML_jefe); 
        }
    });
}

//FILTRAR AREAS (select .campo-area)
function filtrarAreas(){
    var datos={
        listadoActivas: 1,
    };
    $.ajax({
        url: "./lib_php/updAreas.php",
        type: "POST",
        dataType: "json",
        data: datos,
    }).always(function(respuesta_json){
        //console.log(respuesta_json);
        var areas = respuesta_json.datos;
        var elemHTML_select='<option value='+-1+'>Seleccione un área</option>';
        for(var i=0;i<areas.length;i++){
            elemHTML_select+='<option value="'+areas[i].id+'">'+areas[i].nombre+ '</option>';
        }      
        $("select.campo-area").html(elemHTML_select);
        $("select.campo-area").change(filtrarUsuarios);
        $("select.campo-estatus").change(filtrarUsuarios);
        filtrarUsuarios();
    });
}

//FILTRAR USUARIOS
function filtrarUsuarios(){
    var datos={
        listadoActivos: 1,
        area: $("select.campo-area").val(),
        activos: $("select.campo-estatus").val()
    };

    console.log(datos)
    $.ajax({
        url: "./lib_php/updUsuarios.php",
        type: "POST",
        dataType: "json",
        data: datos
        }).always(function(respuesta_json){
            //console.log(respuesta_json);
            var elemHTML='';
            if (respuesta_json.isExito == 1){
                var usuarios = respuesta_json.datos;
                var configuracionTabla={
                titulos:["Nombre","Area","Puesto"],
                campos:["nombre","area","puesto"],
                clases:["columna-nombre","columna-area","columna-puesto"],
                atributos:[
                    {
                    nombre:"data-id",
                    campo:"id"
                    },
                ],
                acciones:[{
                    clase: "acceso-permisos",
                    nombre:"Permisos",
                    icono:"A"
                }],
                eliminar:true
                };
                elemHTML+=crearTabla(usuarios, configuracionTabla);  
            }
            $(".lista-usuarios").html(elemHTML);
            
            $(".lista-usuarios .fila-datos .acceso-permisos").click(filtrarCategoriaPermisos);
            $(".lista-usuarios .fila-datos .columna-nombre").click(editarUsuario);
            $(".lista-usuarios .fila-datos .eliminar-elemento").click(eliminarUsuario);
    }); 
}

//EDITAR USUARIOS --> $
function editarUsuario(event){
    idUsuarioSeleccionado=$(event.target).closest(".fila-datos").attr("data-id");
    console.log(idUsuarioSeleccionado);

    var datos={
        detalle:1,
        id:idUsuarioSeleccionado
    };

    $.ajax({
        url: "./lib_php/updUsuarios.php",
        type: "POST",
        dataType: "json",
        data: datos,
    }).always(function(respuesta_json){
        console.log(respuesta_json);
        if (respuesta_json.isExito == 1){
            $('.campo-correo').val(respuesta_json.datos.correo);
            //$('.campo-contrasenia').val();
            $('.campo-nombre').val(respuesta_json.datos.nombre);
            $('.campo-apaterno').val(respuesta_json.datos.paterno);
            $('.campo-amaterno').val(respuesta_json.datos.materno);
            $('.campo-puesto').val(respuesta_json.datos.puesto);
            $('select.campo-area-nuevo').val(respuesta_json.datos.area);
            $('.campo-extension').val(respuesta_json.datos.extension);
            $('select.campo-sucursal').val(respuesta_json.datos.sucursal);
            $('.campo-telefono').val(respuesta_json.datos.telefono);
            $('.campo-sexo').val(respuesta_json.datos.sexo);

            $('.campo-fecha-nacimiento').val(respuesta_json.datos.nacimiento);
            $('select.campo-jefedirecto').val(respuesta_json.datos.jefe);

            
            $(".bloque[data-seccion='1'] .titulo-seccion").html(editarTituloUsuarios);
            $(".bloque").hide();
            $(".bloque[data-seccion='1']").show();
            $(".celda[data-seccion='1']").addClass("seleccionado");
            $(".celda[data-seccion='0']").removeClass("seleccionado");
            $(".submenu .opcion[data-seccion='1']").html(editarTituloUsuarios);
        }
    });
}

//GUARDAR USUARIOS
function guardarUsuario() {
    datos = {
        correo: $('.campo-correo').val(),
        contrasenia: $('.campo-contrasenia').val(),
        nombre: $('.campo-nombre').val(),
        paterno: $('.campo-apaterno').val(),
        materno: $('.campo-amaterno').val(),
        puesto: $('.campo-puesto').val(),
        area: $('select.campo-area-nuevo').val(),
        extension: $('.campo-extension').val(),
        sucursal: $('select.campo-sucursal').val(),
        telefono: $('.campo-telefono').val(),
        sexo: $('.campo-sexo').val(),
        nacimiento: $('.campo-fecha-nacimiento').val(),
        jefe: $('select.campo-jefedirecto').val(),

        confirmacion: $('.campo-confirmacion').val(),
        puesto2023: $('.campo-puesto2023').val()
    }

    if(idUsuarioSeleccionado==-1){
        datos.nuevoUsuario = 1;
        console.log("NUEVO USUARIO");
        $.ajax({
            url: "./lib_php/updUsuarios.php",
            type: "POST",
            dataType: "json",
            data: datos,
        }).always(function(respuesta_json){
            console.log(respuesta_json);
            if(respuesta_json.isExito==1){
                alert("Se agrego el usuario");
            }else{
                alert("Error al agregar usuario: VERIFIQUE LOS DATOS");
            }
        });  
    }else{
        datos.nuevoUsuario = 1;
        console.log("NUEVO USUARIO");
        $.ajax({
            url: "./lib_php/updUsuarios.php",
            type: "POST",
            dataType: "json",
            data: datos,
        }).always(function(respuesta_json){
            console.log(respuesta_json);
            if(respuesta_json.isExito==1){
                alert("Se agrego el usuario");
            }else{
                alert("Error al agregar usuario: VERIFIQUE LOS DATOS");
            }
        }); 
        console.log(idUsuarioSeleccionado);
        console.log("EDITAR USUARIO");
    }
}

//FITRAR CATEGORIAS EXPEDIENTES
function filtrarCategoriaExpediente(){
    var datos = {
        filtrarExpedientes: 1
    }
    $.ajax({
        url: "./lib_php/updUsuarios.php",
        type: "POST",
        dataType: "json",
        data: datos
        }).always(function(respuesta_json){
            //console.log(respuesta_json);
            var elemHTML='';
            if (respuesta_json.isExito == 1){
                var expedientes = respuesta_json.datos;
                var configuracionTabla={
                titulos:["Nombre"],
                campos:["nombre"],
                clases:["columna-nombre-expediente"],
                atributos:[
                    {
                    nombre:"data-id",
                    campo:"id"
                    },
                ],
                acciones:[
                ],
                eliminar:true
                };
                elemHTML+=crearTabla(expedientes, configuracionTabla);  
                $(".lista-categorias-expedientes").html(elemHTML); 
                

                $(".bloque[data-seccion='2'] .fila-datos .columna-nombre-expediente").click(editarCategoriaExpedientes);
                $(".bloque[data-seccion='2'] .fila-datos .eliminar-elemento").click(eliminarCategoriaExpedientes);
            }
            
            //$(".fila-datos-vehiculos").click(editarVehiculo);
            //limpiarFormulario();
    }); 
}

//GUARDAR CATEGORIAS EXPEDIENTES
function guardarCategoriaExpediente(){
    datos = {
        //nuevoExpediente: 1,
        expediente: $(".nombre-categoria").val(),
    }
    if(idCategoriaSeleccionada==-1){
        datos.nuevoExpediente = 1;
        console.log("AGREGAR UN NUEVO EXPEDIENTE");
    }else{
        datos.modificarExpediente = 1;
        datos.id=idCategoriaSeleccionada;
        console.log("EDITAR EXPEDIENTE");
    }

    $.ajax({
        url: "./lib_php/updUsuarios.php",
        type: "POST",
        dataType: "json",
        data: datos
    }).always(function(respuesta_json){
        console.log(respuesta_json);
        if(respuesta_json.isExito==1){
            alert("Se ha realizado con exito");
            limpiarFormularioCategorias();
        }
    }); 
}

//EDITAR EXPEDIENTES
function editarCategoriaExpedientes(event){
    idCategoriaSeleccionada=$(event.target).closest(".fila-datos").attr("data-id");
    //console.log(idCategoriaSeleccionada);

    var datos={
        mostrarExpedientePorId:1,
        id:idCategoriaSeleccionada
    };

    $.ajax({
        url: "./lib_php/updUsuarios.php",
        type: "POST",
        dataType: "json",
        data: datos,
    }).always(function(respuesta_json){
        //console.log(respuesta_json);
        if (respuesta_json.isExito == 1){  
            console.log(respuesta_json);
            $(".nombre-categoria").val(respuesta_json.datos[0].nombre);
            $(".lista-categorias-expedientes").hide();
            $(".formulario-nueva-categoria").show();
            $(".bloque[data-seccion='2'] .contenedor-titulo").html(editarTituloExpedientes);
            $(".boton-nueva-categoria").hide();
        }
     });
}

//ELIMINAR USUARIOS
function eliminarUsuario(event){

    let idUsuarioEliminar=$(event.target).closest(".fila-datos").attr("data-id");
    let informacionUsuario=$(event.target).parent().parent().prev().prev().prev().text();
    console.log(idUsuarioEliminar)
    
    var datos = {
        id:idUsuarioEliminar
    };

    let confirmarEliminar = confirm(`Eliminar el siguiente usuario: ${informacionUsuario}`);

    if(confirmarEliminar){

        datos.eliminarUsuario = 1;

        mensajeExito="El usuario se elimino correctamente";
        $.ajax({
        url: "./lib_php/updUsuarios.php",
        type: "POST",
        dataType: "json",
        data: datos,
        }).always(function(respuesta_json){
        console.log(respuesta_json)
        if (respuesta_json.isExito == 1){
            mostrarMensaje(mensajeExito);
            filtrarUsuarios();
        }
        }); 
    }
}

function eliminarCategoriaExpedientes(event){
    let idExpedienteEliminar=$(event.target).closest(".fila-datos").attr("data-id");
    let informacionExpediente=$(event.target).parent().parent().prev().text();

    var datos = {
        id:idExpedienteEliminar
    };

    let confirmarEliminar = confirm(`Eliminar el siguiente tipo de expediente: ${informacionExpediente}`);

    if(confirmarEliminar){

        datos.eliminarExpediente = 1;
        mensajeExito="El expediente se elimino correctamente";

        $.ajax({
            url: "./lib_php/updUsuarios.php",
            type: "POST",
            dataType: "json",
            data: datos
        }).always(function(respuesta_json){
            console.log(respuesta_json)
            if (respuesta_json.isExito == 1){
                mostrarMensaje(mensajeExito);
                filtrarCategoriaExpediente();
            }
        });
    }
}

function consultarPermisos(){
    datos = {
        consultaPermisos:1,
        id:idUsuarioPermisoSeleccionado,
        idCategoria:$("select.campo-tipopermiso").val()
    };

    $.ajax({
        url: "./lib_php/updUsuarios.php",
        type: "POST",
        dataType: "json",
        data: datos,
    }).always(function(respuesta_json){
        console.log(respuesta_json);
        
        if(respuesta_json.isExito==1){

            var elemHTML ='';
            var expedientes = respuesta_json.datos;     

            var configuracionTabla={
                titulos:["Categoría","Descripcion","Habilitado"],
                campos:["categoria","descripcion","habilitado"],
                clases:["columna-categoria", "columna-descripcion", "columna-habilitado"],
                atributos:[
                    {
                    nombre:"data-id",
                    campo:"id"
                    },
                ],
                acciones:[
                ],
                eliminar:true
            };

            for(let i=0;i<expedientes.length;i++){
                expedientes[i]["habilitado"] = `<input type="checkbox" class="permiso-checkbox" ${expedientes[i]["habilitado"] === 1 ? 'checked' : ''} >`;
            };

            elemHTML+=crearTabla(expedientes, configuracionTabla);
 
            $(".contenedor-tabla").html(elemHTML);
            $(".fila-datos .columna-habilitado .permiso-checkbox").click(cambiarPermisos);
        }
    });
}

function filtrarCategoriaPermisos(event){
    idUsuarioPermisoSeleccionado=$(event.target).closest(".fila-datos").attr("data-id");

    let infoNombreUsuario=$(event.target).parent().parent().prev().prev().prev().text();
    let infoAreaUsuario=$(event.target).parent().parent().prev().prev().text();

    datos = {
        filtrarCategoriaPermisos:1
    };

    let infoUsuario = `<br><div class="contenedor-informacion"> ${"Área: " + infoAreaUsuario} <br> ${" Usuario: " + infoNombreUsuario} <div class="contenedor-categoria"> 
    <br> <select class="campo campo-tipopermiso"> </select> <div class="hint">Categoria.</div> <br> <div class="contenedor-tabla"> </div> </div>`;
    $(".lista-permisos").html(infoUsuario);

    $.ajax({
        url: "./lib_php/updUsuarios.php",
        type: "POST",
        dataType: "json",
        data: datos
    }).always(function(respuesta_json){
        
        if(respuesta_json.isExito==1){
            var listaTipoPermisos = respuesta_json.datos;
            var HTMLselect = '';

            $(".bloque[data-seccion='0'] .contenedor-titulo").html(tituloPermisos);
            $(".bloque[data-seccion='0'] .seccion-formulario").hide();
            $(".submenu .opcion[data-seccion='0'").html("Administrar permisos");
            $(".lista-usuarios").html("");

            HTMLselect='<option value='+-1+'>Seleccione una categoria de permisos</option>';


            for(var i=0;i<listaTipoPermisos.length;i++){
                HTMLselect+='<option value="'+listaTipoPermisos[i].id+'">'+listaTipoPermisos[i].nombre+ '</option>';
            }

            $(".campo-tipopermiso").html(HTMLselect);

            $(".campo-tipopermiso").change(consultarPermisos);
            consultarPermisos();
        }
    });
}

function cambiarPermisos(event){
    idPermisoSeleccionado=$(event.target).closest(".fila-datos").attr("data-id");
    verificarCheckbox=$(event.target).is(':checked');

    console.log(idPermisoSeleccionado);
    console.log(verificarCheckbox);

    datos={
        cambiarPermisos:1,
        idPermiso:idPermisoSeleccionado,
        idUsuario:idUsuarioPermisoSeleccionado,
    };

    if(verificarCheckbox){
        datos.accion=1;
    }else{
        datos.accion=2
    }

    $.ajax({
        url: "./lib_php/updUsuarios.php",
        type: "POST",
        dataType: "json",
        data: datos,
    }).always(function (respuesta_json){
        console.log(respuesta_json);
    });
}