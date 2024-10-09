var idAreaIso = -1;
var tituloEditar = "EDITAR DOCUMENTO";
var tituloNuevo = "NUEVO DOCUMENTO";
var componenteArchivo = "";

function ajustarElementos(){  
}

$(document).ready(function() {
  ajustarElementos(); //Obligatoria
  agregarListeners(); //Obligatoria
  //Traer la lista de las areas activas
  cargarAreas();
  cargarTiposDocumento();
  filtrarDocumentosIso();
  limpiarFormulario();

});

$( window ).resize(function() {
  ajustarElementos();
});

function agregarListeners(){
  $(".boton-formulario-area-iso").click(desplegarFormularioAreas);
  $(".boton-formulario-documento-iso").click(desplegarFormularioDocumentos);
  $(".boton-formulario-buscar-iso").click(filtrarDocumentosIso);
  $(".boton-formulario-regresar-documento-iso").click(limpiarFormulario);

  $("select.filtro-area-documento-iso").change(filtrarDocumentosIso);
  $("select.filtro-tipo-documento-iso").change(filtrarDocumentosIso);
  // $(".campo-clave-iso").on("keydown",filtrarDocumentosIso);
  $(".campo-modificacion-iso").change(filtrarDocumentosIso);
  $(".boton-formulario-guardar-documento-iso").click(guardarArchivo);
}

function limpiarFormulario(){
  $(".campo-documento-clave-iso").val("");
  $(".filtro-tipo-documento-nuevo").val("");
  $(".campo-documento-titulo-iso").val("");
  
  $('input[type="checkbox"][data-id]').prop('checked', false);

  $(".bloque[data-seccion='3'] .contenedor-campos-nuevo-documento-iso .contenedor-titulo").html(tituloNuevo);
  $(".bloque").hide();
  $(".bloque[data-seccion='2']").show();
  $(".celda[data-seccion='2']").addClass("seleccionado");
  $(".celda[data-seccion='3']").removeClass("seleccionado");
  $(".submenu .opcion[data-seccion='3']").html(tituloNuevo);

  $(".campo-modificacion-iso").val("");
  $(".campo-documento-version-iso").val("");
  $("#subir-documento-nuevo").val("");
  $("#campo-acceso-directo").prop("checked", false);

  $(".contenedor-campo-archivo").show();

  componenteArchivo = new ClabsComponenteArchivo();
  componenteArchivo.inicializarComponenteArchivo($(".contenedor-campo-archivo")); 
  // componenteArchivo.inicializarComponenteArchivo(componente);
}

// COORDINACION ISO - CARGAR AREAS
function cargarAreas(){
  var datos={
    listadoAreasActivas: 1,
  };

  $.ajax({
    url: "./lib_php/updISO.php",
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

    //carga los select
    var elemHTML_select="<option value='-1'>Selecciona un área iso</option>";
    for(var i=0;i<areas.length;i++){
      elemHTML_select+='<option value="'+areas[i].id+'">'+areas[i].nombre+ '</option>';
    }

    $("select.filtro-area-documento-iso").html(elemHTML_select);

    $(".lista-areas-coordiso").html(elemHTML);
    $(".lista-areas-coordiso .fila-datos .columna-nombre").click(desplegarFormularioAreas);
    $(".lista-areas-coordiso .celda-acciones-fila .eliminar-elemento").click(eliminarAreaIso);

    // INPUTS DEL AREA NUEVO DOCUMENTO ISO
    var htmlInput='';
    for(var i=0;i<areas.length; i++){
      htmlInput+='<input type="checkbox" class="cbarea" data-id='+areas[i].id+'>'+areas[i].nombre+'</input><br>';
    }

    $(".contenedor-areas-checklist-nuevo-documento-iso").html(htmlInput);
  });
}

function desplegarFormularioAreas(event){
  idAreaIso=$(event.target).closest(".fila-datos").attr("data-id");
  var nombreAreaIso = $(event.target).closest(".fila-datos").find(".columna-nombre").html();

  htmlAreas_Iso = `
  <div class="contenedor-formulario-nueva-area">
    <div class="contenedor-campo contenedor-campo-nueva-area-iso">
        <input class="campo campo-nueva-area-iso">
        <div class="hint">Nombre.</div>
    </div>
    <div class="boton-container alinear-derecha">
      <div class="boton boton-guardar-area-iso">AGREGAR ÁREA</div>
      <div class="boton boton-cancelar-area-iso">CANCELAR</div>
    </div>
  </div>
  `;

  $(".lista-areas-coordiso").html(htmlAreas_Iso);

  if(idAreaIso!=undefined){
    $(".campo-nueva-area-iso").val(nombreAreaIso);
    $(".contenedor-campo-areas-coordiso .contenedor-titulo").html("MODIFICAR ÁREA");
    $(".submenu .seleccionado").html("MODIFICAR ÁREA");
    $(".boton-guardar-area-iso").html("MODIFICAR");
  }else{
    $(".contenedor-campo-areas-coordiso .contenedor-titulo").html("AGREGAR NUEVA ÁREA");
    $(".submenu .seleccionado").html("NUEVA ÁREA");
  }

  $(".boton-formulario-area-iso").hide();

  $(".boton-guardar-area-iso").click(function(){
    guardarAreaIso(idAreaIso)
  });

  $(".boton-cancelar-area-iso").click(function(){
    $(".contenedor-campo-areas-coordiso .contenedor-titulo").html("ÁREAS");
    $(".submenu .seleccionado").html("ÁREAS");
    cargarAreas();
    $(".boton-formulario-area-iso").show();
  });
}

function guardarAreaIso(idAreaIso){
  datos = {
    nombre:$(".campo-nueva-area-iso").val()
  }

  if(idAreaIso!=undefined){
    datos.id = idAreaIso;
    datos.modificarArea = 1;
    console.log("editar");
  }else{
    datos.nuevaArea = 1;
    console.log("agregar");
  }

  if(datos.nombre!=""){
    $.ajax({
      url: "./lib_php/updISO.php",
      type: "POST",
      dataType: "json",
      data: datos,
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if(respuesta_json.isExito==1){
        $(".contenedor-campo-areas-coordiso .contenedor-titulo").html("ÁREAS");
        $(".submenu .seleccionado").html("ÁREAS");
        cargarAreas();
        $(".boton-formulario-area-iso").show();
      }
    });
  }else{
    alert("El campo nombre se encuentra vacio");
  }
}

function eliminarAreaIso(event){
  var idArea = $(event.target).closest(".fila-datos").attr("data-id");
  var nombreArea = $(event.target).closest(".fila-datos").find(".columna-nombre").html();

  datos = {
    eliminarArea:1,
    idArea: idArea
  }

  let confirmarEliminar = confirm(`Eliminar la siguiente área: ${nombreArea}`);

  if(confirmarEliminar){
    mensajeExito="El area se elimino correctamente";

    $.ajax({
      url: "./lib_php/updISO.php",
      type: "POST",
      dataType: "json",
      data: datos,
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if (respuesta_json.isExito == 1){
        mostrarMensaje(mensajeExito);
        cargarAreas();
      }
    });
  }
}

function cargarTiposDocumento(){
  var datos={
    listadoDocumentosActivos: 1,
  };

  $.ajax({
    url: "./lib_php/updISO.php",
    type: "POST",
    dataType: "json",
    data: datos,
  }).always(function(respuesta_json){
    console.log(respuesta_json);
    var elemHTML = '';
    if (respuesta_json.isExito == 1){
      var documento = respuesta_json.datos;
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
      elemHTML+=crearTabla(documento, configuracionTabla);
    }

    var elemHTML_select="<option value='-1'>Selecciona un tipo de documento</option>";
    for(var i=0;i<documento.length;i++){
      elemHTML_select+='<option value="'+documento[i].id+'">'+documento[i].nombre+ '</option>';
    }
    $("select.filtro-tipo-documento-iso").html(elemHTML_select);
    $("select.filtro-tipo-documento-nuevo").html(elemHTML_select);

    $(".lista-documento-coordiso").html(elemHTML);
    $(".lista-documento-coordiso .fila-datos .columna-nombre").click(desplegarFormularioDocumentos);
    $(".lista-documento-coordiso .celda-acciones-fila .eliminar-elemento").click(eliminarTipoDocumento);
  });
}

function desplegarFormularioDocumentos(event){
  idTipoDocIso = $(event.target).closest(".fila-datos").attr("data-id");
  var nombreTipoDocIso = $(event.target).closest(".fila-datos").find(".columna-nombre").html();

  htmlDoc_Iso = `
  <div class="contenedor-formulario-nuevo-documento">
    <div class="contenedor-campo contenedor-campo-nuevo-documento-iso">
        <input class="campo campo-nuevo-documento-iso">
        <div class="hint">Nombre.</div>
    </div>

    <div class="boton-container alinear-derecha">
      <div class="boton boton-guardar-documento-iso">AGREGAR DOCUMENTO</div>
      <div class="boton boton-cancelar-documento-iso">CANCELAR</div>
    </div>
  </div>
  `;

  $(".lista-documento-coordiso").html(htmlDoc_Iso);

  if(idTipoDocIso!=undefined){
    $(".campo-nuevo-documento-iso").val(nombreTipoDocIso);

    $(".contenedor-lista-documentos-activos .contenedor-titulo").html("MODIFICAR DOCUMENTO");
    $(".submenu .seleccionado").html("MODIFICAR DOCUMENTO");
    $(".boton-guardar-documento-iso").html("MODIFICAR");
  }else{
    $(".contenedor-lista-documentos-activos .contenedor-titulo").html("AGREGAR NUEVO DOCUMENTO");
    $(".submenu .seleccionado").html("NUEVO DOCUMENTO");
  }

  $(".boton-formulario-documento-iso").hide();

  $(".boton-guardar-documento-iso").click(function(){
    guardarTipoDocumentoIso(idTipoDocIso);
  });

  $(".boton-cancelar-documento-iso").click(function(){
    $(".contenedor-lista-documentos-activos .contenedor-titulo").html("TIPOS DE DOCUMENTOS");
    $(".submenu .seleccionado").html("TIPOS DE DOCUMENTOS");
    cargarTiposDocumento();
    $(".boton-formulario-documento-iso").show();
  });
}

function guardarTipoDocumentoIso(idTipoDocIso){
  datos = {
    nombre:$(".campo-nuevo-documento-iso").val()
  }
  
  if(idTipoDocIso!=undefined){
    datos.id = idTipoDocIso;
    datos.modificarTipo = 1;
    console.log("editar");
  }else{
    datos.nuevoTipoDocumento = 1;
    console.log("agregar");
  }

  if(datos.nombre!=""){
    $.ajax({
      url: "./lib_php/updISO.php",
      type: "POST",
      dataType: "json",
      data: datos,
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if(respuesta_json.isExito==1){
        alert("El tipo de documento se ha guardado con exito");
        $(".contenedor-lista-documentos-activos .contenedor-titulo").html("TIPOS DE DOCUMENTOS");
        $(".submenu .seleccionado").html("TIPOS DE DOCUMENTOS");
        cargarTiposDocumento();
        $(".boton-formulario-documento-iso").show();
      }
    });
  }else{
    alert("El campo nombre no debe estar vacío");
  }
}

function eliminarTipoDocumento(event){
  var idTipo = $(event.target).closest(".fila-datos").attr("data-id");
  var nombreTipoDoc = $(event.target).closest(".fila-datos").find(".columna-nombre").html();

  datos = {
    eliminarTipoDocumento:1,
    idTipo: idTipo
  }

  let confirmarEliminar = confirm(`Eliminar el siguiente tipo de documento: ${nombreTipoDoc}`);

  if(confirmarEliminar){
    mensajeExito="El tipo de documento se elimino correctamente";

    $.ajax({
      url: "./lib_php/updISO.php",
      type: "POST",
      dataType: "json",
      data: datos,
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if (respuesta_json.isExito == 1){
        mostrarMensaje(mensajeExito);
        cargarTiposDocumento();
      }
    });
  }
}

function filtrarDocumentosIso(){
  var filtroArea=$("select.filtro-area-documento-iso").val();
  if (filtroArea==null) {
    filtroArea=-1;
  }
  var filtroTipo=$("select.filtro-tipo-documento-iso").val();
  if (filtroTipo==null) {
    filtroTipo=-1;
  }

  datos = {
    filtrarDocumentos: 1,
    texto:$(".campo-clave-iso").val(),
    area:filtroArea,
    tipo:filtroTipo,
    fecha:$(".campo-modificacion-iso").val()
  }
  console.log(datos);

  $.ajax({
    url: "./lib_php/updISO.php",
    type: "POST",
    dataType: "json",
    data: datos,
  }).always(function(respuesta_json){
    console.log(respuesta_json);
    var elemHTML = '';
    if (respuesta_json.isExito == 1){
      var documentos = respuesta_json.datos;
      var configuracionTabla={
        titulos:["TITULO", "CLAVE", "FECHA"],
        campos:["titulo", "clave", "fecha"],
        clases:["columna-titulo", "columna-clave", "columna-fecha"],
        atributos:[
          {
            nombre:"data-id",
            campo:"id"
          },
        ],
        acciones:[{
          clase: "acceso-archivo",
          nombre:"Archivo",
          icono:"A"
        }],
        eliminar:true
      };
      elemHTML+=crearTabla(documentos, configuracionTabla);
    }
    $(".lista-documentos-iso").html(elemHTML);

    $(".lista-documentos-iso .fila-datos .columna-titulo").click(mostrarInformacionDocumento);
    $(".lista-documentos-iso .celda-acciones-fila .eliminar-elemento").click(eliminarDocumento);
    $(".lista-documentos-iso .celda-acciones-fila .acceso-archivo").click(function(){
    });
  });
}

function eliminarDocumento(event){
  var idDocumento = $(event.target).closest(".fila-datos").attr("data-id");
  var nombreDocumento = $(event.target).closest(".fila-datos").find(".columna-titulo").html();

  datos = {
    eliminarDocumento:1,
    idDocumento: idDocumento
  }

  let confirmarEliminar = confirm(`Eliminar el siguiente documento: ${nombreDocumento}`);

  if(confirmarEliminar){
    $.ajax({
      url: "./lib_php/updISO.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if (respuesta_json.isExito == 1){
        console.log(respuesta_json.datos);
        filtrarDocumentosIso();
      }
    });
  }
}

function mostrarInformacionDocumento(event){
  var idDocumento = $(event.target).closest(".fila-datos").attr("data-id");

  datos = {
    detalleDocumento: 1,
    idDocumento:idDocumento
  }

  $.ajax({
    url: "./lib_php/updISO.php",
    type: "POST",
    dataType: "json",
    data: datos,
  }).always(function(respuesta_json){
    console.log(respuesta_json);
    if(respuesta_json.isExito){
      var detalleDocumento = respuesta_json.datos;

      $(".campo-documento-clave-iso").val(detalleDocumento.clave);
      $(".filtro-tipo-documento-nuevo").val(detalleDocumento.tipo);
      $(".campo-documento-titulo-iso").val(detalleDocumento.titulo);

      if(detalleDocumento.areas!=null){
        detalleDocumento.areas.forEach(function(id) {
          $('input[type="checkbox"][data-id="' + id.idArea + '"]').prop('checked', true);
        });
      }

      console.log(detalleDocumento.accesoDirecto);

      if(detalleDocumento.accesoDirecto){
        $("#campo-acceso-directo").prop("checked", true);
      }

      $(".bloque[data-seccion='3'] .contenedor-campos-nuevo-documento-iso .contenedor-titulo").html(tituloEditar);
      $(".bloque").hide();
      $(".bloque[data-seccion='3']").show();
      $(".celda[data-seccion='3']").addClass("seleccionado");
      $(".celda[data-seccion='2']").removeClass("seleccionado");
      $(".submenu .opcion[data-seccion='3']").html(tituloEditar);

      $(".campo-modificacion-nuevo-iso").val(detalleDocumento.fechaEmision);

      if(detalleDocumento.ultimaVersion.version){
        $(".campo-documento-version-iso").val(detalleDocumento.ultimaVersion.version);
      }else{
        $(".campo-documento-version-iso").val("");
      }
      
      $("#subir-documento-nuevo").val(detalleDocumento.ultimaVersion.archivo);
      $(".contenedor-campo-archivo").hide();
    }
  });
}

function guardarArchivo(){
  var acceso = 0;

  if ($('#campo-acceso-directo').is(':checked')){
    acceso = 1;
  }

  datos = {
    nuevoDocumento: 1,
    clave : $(".campo-documento-clave-iso").val(),
    titulo : $(".campo-documento-titulo-iso").val(),
    fechaCreacion  : $(".campo-modificacion-nuevo-iso").val(),
    tipo : $("select.filtro-tipo-documento-nuevo").val(),
    version : $(".campo-documento-version-iso").val(),
    archivo : $(".contenedor-campo-archivo").data("ruta"),
    accesoDirecto : acceso
  }


  // let checkboxes = document.querySelectorAll('.cbarea');
  // let selectedAreas = [];

  // checkboxes.forEach(function(checkbox) {
  //     if (checkbox.checked) {
  //       let area = {
  //         id: checkbox.getAttribute('data-id')
  //       };
  //       selectedAreas.push(area);
  //     }
  // });
  

  var areas=new Array();

  $(".cbarea").each(function(){
    if($(this).prop('checked')==true){
      areas.push($(this).attr("data-id"));
    }
  });

  datos.areas=JSON.stringify(areas);

  // Mostrar el array resultante en la consola

  if(datos.titulo!="" && datos.fechaCreacion!="" && $(".contenedor-campo-archivo").data("ruta")!=undefined && $(".campo-documento-version-iso").val()!=""){
    datos.archivo = $(".contenedor-campo-archivo").data("ruta");

    $.ajax({
      url: "./lib_php/updISO.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if (respuesta_json.isExito == 1){
        
        // respuesta_json.mensaje;
        // limpiarCamposDocumento();
        // cargarDocumentos();
      }
    });
  }else{
    alert("VERIFIQUE QUE LOS CAMPOS NO ESTEN VACIOS");
  }
}

function descargarArchivo(event){
  let idPermiso=$(event.target).closest(".fila-datos").attr("data-id");
  // window.open("http://localhost/intranet-2023/sistema/documentos/iso/, "+"",_blank);
  // console.log(idPermiso);
}