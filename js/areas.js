var idAreaSeleccionada=-1;
var tituloNuevo="NUEVA ÁREA.";
var tituloEditar="MODIFICAR ÁREA.";

function ajustarElementos(){  
}

$(document).ready(function() {
  ajustarElementos(); //Obligatoria
  agregarListeners(); //Obligatoria
  limpiarFormulario();
  //Traer la lista de las areas activas
  cargarAreas();
});

$( window ).resize(function() {
  ajustarElementos();
});

$(window).load(function() {
  ajustarElementos();
});

function agregarListeners(){
  $(".boton-guardar-area").click(guardarArea);
  $(".boton-cancelar-area").click(limpiarFormulario);
}

function limpiarFormulario(){
  idAreaSeleccionada=-1;
  $(".campo-nombre").val("");
  $("select.campo-jefe").html("<option value='-1'>Selecciona el jefe del área</option>");
  $(".bloque").hide();
  $(".bloque[data-seccion='0']").show();

  $(".celda[data-seccion='0']").addClass("seleccionado");
  $(".celda[data-seccion='1']").removeClass("seleccionado");

  $(".bloque[data-seccion='1'] .contenedor-titulo").html(tituloNuevo);
  $(".submenu .opcion[data-seccion='1']").html(tituloNuevo);
}

function cargarAreas() {
  var datos={
    listadoActivas: 1,
  };
  $.ajax({
    url: "./lib_php/updAreas.php",
    type: "POST",
    dataType: "json",
    data: datos,
  }).always(function(respuesta_json){
    console.log(respuesta_json);
    var elemHTML = '';
    if (respuesta_json.isExito == 1){
      var areas = respuesta_json.datos;
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
      elemHTML+=crearTabla(areas, configuracionTabla);
    }
    $(".lista-areas").html(elemHTML);

    $(".fila-datos .columna-nombre").click(editarArea);
    limpiarFormulario();
  });
}

function editarArea(event){
  idAreaSeleccionada=$(event.target).closest(".fila-datos").attr("data-id");

  var datos={
    cargarEmpleadosPorArea:1,
    id:idAreaSeleccionada,
    estatus: 1
  };
  console.log(datos);
  $.ajax({
    url: "./lib_php/updAreas.php",
    type: "POST",
    dataType: "json",
    data: datos,
  }).always(function(respuesta_json){
    console.log(respuesta_json);
    if (respuesta_json.isExito == 1){
      //Cargar el select de los empleados del area
      var empleadosArea = respuesta_json.datos;
      var elemHTML_select="<option value='-1'>Selecciona el jefe del área</option>";
      for(var i=0;i<empleadosArea.length;i++){
        elemHTML_select+='<option value="'+empleadosArea[i].id+'">'+empleadosArea[i].nombre+ '</option>';
      }      
      $("select.campo-jefe").html(elemHTML_select);

      var datos={
        detalle:1,
        id:idAreaSeleccionada
      };

      $.ajax({
        url: "./lib_php/updAreas.php",
        type: "POST",
        dataType: "json",
        data: datos,
      }).always(function(respuesta_json){
        console.log(respuesta_json);
        if (respuesta_json.isExito == 1){  
          $(".campo-nombre").val(respuesta_json.datos.nombre);
          $("select.campo-jefe").val(respuesta_json.datos.jefe);

          $(".bloque[data-seccion='1'] .contenedor-titulo").html(tituloEditar);
          $(".bloque").hide();
          $(".bloque[data-seccion='1']").show();

          $(".celda[data-seccion='0']").removeClass("seleccionado");
          $(".celda[data-seccion='1']").addClass("seleccionado");

          $(".submenu .opcion[data-seccion='1']").html(tituloEditar);
        }
      });   
    }
  });  
}

function guardarArea(){
  var datos={
    nombre:$(".campo-nombre").val(),
    jefe:$("select.campo-jefe").val()
  }
  var mensajeExito="";
  if(idAreaSeleccionada==-1){
    datos.nuevo=1;
    mensajeExito="El área se creó correctamente";
  }else{
    datos.modificar=1;
    datos.id=idAreaSeleccionada;
    mensajeExito="El área se modificó correctamente";
  }
  
  if(!vacio(datos.nombre)){
    console.log(datos);
    $.ajax({
      url: "./lib_php/updAreas.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if (respuesta_json.isExito == 1){
        mostrarMensaje(mensajeExito);
        cargarAreas();
      }
    }); 
  }
  else{
    alert("Por favor indica el nombre del área");
  }
}