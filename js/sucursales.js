var idSucursalSeleccionada=-1;
var tituloNuevo="NUEVA SUCURSAL.";
var tituloEditar="MODIFICAR SUCURSAL.";

function ajustarElementos(){  
}

$(document).ready(function() {
  ajustarElementos(); //Obligatoria
  agregarListeners(); //Obligatoria
  cargarSucursales();

});

$( window ).resize(function() {
  ajustarElementos();
});

$(window).load(function() {
  ajustarElementos();
})

function agregarListeners(){
    $(".boton-guardar-sucursal").click(guardarSucursal);
    $(".boton-cancelar-sucursal").click(limpiarFormulario);
}
  
function limpiarFormulario(){
    idSucursalSeleccionada=-1;
    $(".campo-nombre-sucursal").val("");
    $(".bloque").hide();
    $(".bloque[data-seccion='0']").show();

    $(".celda[data-seccion='0']").addClass("seleccionado");
    $(".celda[data-seccion='1']").removeClass("seleccionado");

    $(".bloque[data-seccion='1'] .contenedor-titulo").html(tituloNuevo);
    $(".submenu .opcion[data-seccion='1']").html(tituloNuevo);
}

function cargarSucursales(){
    var datos={
      listadoActivas: 1,
    };
    console.log(datos);

    $.ajax({
        url: "./lib_php/updSucursales.php",
        type: "POST",
        dataType: "json",
        data: datos
    }).always(function(respuesta_json){
        console.log(respuesta_json);
        var elemHTML='';
        if (respuesta_json.isExito == 1){
          var sucursales = respuesta_json.datos;
    
          var configuracionTabla={
            titulos:["Nombre"],
            campos:["nombre"],
            clases:["columna-nombre"],
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
          elemHTML+=crearTabla(sucursales, configuracionTabla);
        }
        $(".lista-sucursales").html(elemHTML);
        $(".lista-sucursales .fila-datos .columna-nombre").click(editarSucursal);
        limpiarFormulario();
    });
}

function guardarSucursal() {
    var datos={
        nombre:$(".campo-nombre-sucursal").val()
    }
    var mensajeExito="";
      
    console.log(idSucursalSeleccionada);
    if(idSucursalSeleccionada==-1){
        datos.agregarSucursal=1;
        mensajeExito="La sucursal se creó correctamente";
        datos.activo=1;
    }
    else{
      datos.editarSucursal=1;
      datos.id=idSucursalSeleccionada;
      mensajeExito="La sucursal se modificó correctamente";
      console.log("editar vehiculo ");
    }

    console.log(datos);
    if(!vacio(datos.nombre)){
        console.log(datos);
        $.ajax({
          url: "./lib_php/updSucursales.php",
          type: "POST",
          dataType: "json",
          data: datos
        }).always(function(respuesta_json){
          console.log(respuesta_json);
          if (respuesta_json.isExito == 1){
            mostrarMensaje(mensajeExito);
            cargarSucursales();
          }
        });
    }
    else{
        alert("Por favor indica el nombre del área");
    }
    
}

function editarSucursal(event){
  idSucursalSeleccionada=$(event.target).closest(".fila-datos").attr("data-id");

  var datos={
    sucursalesPorId:1,
    id:idSucursalSeleccionada
  };
  
  //obtener sucursal por ID
  $.ajax({
    url: "./lib_php/updSucursales.php",
    type: "POST",
    dataType: "json",
    data: datos,
  }).always(function(respuesta_json){
    if (respuesta_json.isExito == 1){  
        console.log(respuesta_json);
        $(".campo-nombre-sucursal").val(respuesta_json.datos[0].nombre);
        $(".bloque[data-seccion='1'] .contenedor-titulo").html(tituloEditar);
        $(".bloque").hide();
        $(".bloque[data-seccion='1']").show();

        $(".celda[data-seccion='1']").addClass("seleccionado");
        $(".celda[data-seccion='0']").removeClass("seleccionado");
        $(".submenu .opcion[data-seccion='1']").html(tituloEditar);
    }
  });  
}
