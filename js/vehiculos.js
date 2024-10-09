var meses=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
var mesesCortos=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Octu","Nov","Dic"];
var dias=["Lunes","Martes","Miércoles","Jueves","Viernes", "Sábado", "Domingo"];
var diasCortos=["Lun","Mar","Mie","Jue","Vie", "Sab", "Dom"];
//var horarios=["08:00","08:30","09:00","09:30","10:00", "10:30", "11:00","11:30", "12:00","12:30", "13:00","13:30", "14:00","14:30", "15:00","15:30", "16:00","16:30", "17:00","17:30", "18:00","18:30", "19:00","19:30"];
var horarios=["08:00","09:00","10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
var horariosTxt=["08:00 - 09:00","09:00 - 10:00","10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00","16:00 - 17:00", "17:00 - 18:00","18:00 - 19:00", "19:00 - 20:00"];
var horasReservar=new Array();

var vehiculoSeleccionado;
var nombreVehiculoSeleccionado = "";
var fechaSeleccionada="";

var idVehiculoSeleccionado=-1;
var tituloNuevo="NUEVO VEHICULO.";
var tituloEditar="MODIFICAR VEHICULO.";

function ajustarElementos(){  
}

$(document).ready(function() {
  ajustarElementos(); //Obligatoria
  agregarListeners(); //Obligatoria
  cargarVehiculos();
});

$( window ).resize(function() {
  ajustarElementos();
});

$(window).load(function() {
  ajustarElementos();
});

function agregarListeners(){
  $(".boton-guardar-vehiculos").click(guardarVehiculo);
  $(".boton-cancelar-vehiculos").click(limpiarFormulario);
}

function limpiarFormulario(){
  idVehiculoSeleccionado=-1;
  $(".campo-vehiculos").val("");
  $(".bloque").hide();
  $(".bloque[data-seccion='0']").show();

  $(".celda[data-seccion='0']").addClass("seleccionado");
  $(".celda[data-seccion='1']").removeClass("seleccionado");

  $(".bloque[data-seccion='1'] .contenedor-titulo").html(tituloNuevo);
  $(".submenu .opcion[data-seccion='1']").html(tituloNuevo);
}

function cargarVehiculos() {
    var datos={
      mostrarVehiculos: 1,
    };

    console.log(datos);

    $.ajax({
      url: "./lib_php/updVehiculos.php",
      type: "POST",
      dataType: "json",
      data: datos,
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      var elemHTML='';
      if (respuesta_json.isExito == 1){
        var vehiculos = respuesta_json.datos;
  
        vehiculos = vehiculos.map(function(vehiculo){
          if (!vehiculo.reservaciones) {
            vehiculo.reservaciones = "Ver";
          }
          return vehiculo;
        });
        var configuracionTabla={
          titulos:["Nombre", "Reservaciones"],
          campos:["nombre", "reservaciones"],
          clases:["columna-nombre", "columna-reservaciones"],
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
        elemHTML+=crearTabla(vehiculos, configuracionTabla);  
      }
      $(".lista-vehiculos").html(elemHTML);
      $(".lista-vehiculos .fila-datos .columna-nombre").click(editarVehiculo);
      $(".lista-vehiculos .fila-datos .columna-reservaciones").click(mostrarDisponibilidadDia);
      

      //$(".fila-datos-vehiculos").click(editarVehiculo);
      $(".lista-vehiculos .fila-datos .eliminar-elemento").click(eliminarVehiculo);
      
      limpiarFormulario();
    });
}

function cargarOpcionesUsuarios(){
  var datos={
    usuariosPermitidos:1
  }; 

  $.ajax({
    url: "./lib_php/updVehiculos.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json);
    if (respuesta_json.isExito == 1){
      var elemHTML='';
      for(i=0;i<respuesta_json.datos.length;i++){
        elemHTML+='<option value="'+respuesta_json.datos[i].id+'">'+respuesta_json.datos[i].nombre+'</option>';
      }
      $("select.campo-filtro-usuario").html(elemHTML);
    }
  });

}

function guardarVehiculo() {
  var datos={
    nombre:$(".campo-vehiculos").val()
  }
  var mensajeExito="";
  
  console.log(idVehiculoSeleccionado);
  if(idVehiculoSeleccionado==-1){
    datos.agregarVehiculo=1;
    mensajeExito="El vehiculo se creó correctamente";
    datos.activo=1;
  }
  else{
    datos.editarVehiculo=1;
    datos.id=idVehiculoSeleccionado;
    mensajeExito="El vehiculo se modificó correctamente";
    console.log("editar vehiculo ");
  }
  if(!vacio(datos.nombre)){
    console.log(datos);
    $.ajax({
      url: "./lib_php/updVehiculos.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if (respuesta_json.isExito == 1){
        mostrarMensaje(mensajeExito);
        cargarVehiculos();
      }
    }); 
  }
  else{
    alert("Por favor indica el nombre del área");
  }
}

//EDITAR VEHICULO
function editarVehiculo (event) {
  idVehiculoSeleccionado=$(event.target).closest(".fila-datos").attr("data-id");
  console.log(idVehiculoSeleccionado);

  var datos={
    mostrarVehiculoPorId:1,
    id:idVehiculoSeleccionado
  };

  $.ajax({
    url: "./lib_php/updVehiculos.php",
    type: "POST",
    dataType: "json",
    data: datos,
  }).always(function(respuesta_json){
    //console.log(respuesta_json);
    if (respuesta_json.isExito == 1){  
      console.log(respuesta_json);
      $(".campo-vehiculos").val(respuesta_json.datos[0].nombre);
      $(".bloque[data-seccion='1'] .contenedor-titulo").html(tituloEditar);
      $(".bloque").hide();
      $(".bloque[data-seccion='1']").show();
      $(".celda[data-seccion='1']").addClass("seleccionado");
      $(".celda[data-seccion='0']").removeClass("seleccionado");
      $(".submenu .opcion[data-seccion='1']").html(tituloEditar);
    }
  }); 
}

//ELIMINAR VEHICULO
function eliminarVehiculo(event){
  let idVehiculoEliminar=$(event.target).closest(".fila-datos").attr("data-id");

  let informacionVehiculo=$(event.target).parent().parent().prev().text();
  
  var datos = {
    id:idVehiculoEliminar
  };

  let confirmarEliminar = confirm(`Eliminar el siguiente elemento: ${informacionVehiculo}`);

  if(confirmarEliminar){
    datos.eliminarVehiculo = 1;
    mensajeExito="El vehiculo se elimino correctamente";
  }
  
  $.ajax({
    url: "./lib_php/updVehiculos.php",
    type: "POST",
    dataType: "json",
    data: datos,
  }).always(function(respuesta_json){
    console.log(respuesta_json)
    if (respuesta_json.isExito == 1){
      
      mostrarMensaje(mensajeExito);
      cargarVehiculos();
    }
  }); 
}

function mostrarDisponibilidadDia(event){
  var dia=1;
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate()+1);
  fechaSeleccionada=tomorrow.getDate()+"/"+(tomorrow.getMonth()+1)+"/"+tomorrow.getFullYear();
  
  if (typeof event !== 'undefined') {
    var componente=$(event.target);
    vehiculoSeleccionado=$(componente).closest(".fila-datos").attr("data-id");
    nombreVehiculoSeleccionado= $(componente).closest(".fila-datos").find(".columna-nombre").html();
  }
  
  console.log(vehiculoSeleccionado);

  var datos={
    reservacionesDia:1,
    vehiculo:vehiculoSeleccionado,
    dia:dia
  };
  
  console.log(datos);

  $.ajax({
    url: "./lib_php/updVehiculos.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json);
    if (respuesta_json.isExito == 1){

      $(".bloque[data-seccion='1'] .contenedor-titulo").html("AGENDA");
      $(".bloque").hide();
      $(".contenedor-nuevo-vehiculo").hide();
      $(".contenedor-calendario-campos").show();
      $(".bloque[data-seccion='1']").show();
      $(".submenu .opcion[data-seccion='0']").removeClass("seleccionado");
      $(".submenu .opcion[data-seccion='1']").addClass("seleccionado");
      $(".submenu .opcion[data-seccion='1']").html("AGENDA");

      //Generar HTML con los horarios del día
      var tituloHTML=`
        <div class="contenedor-titulo titulo-agenda-vehiculos">
          <div class="celda">`+nombreVehiculoSeleccionado+`</div><br>
          <div class="celda">`+fechaSeleccionada+`</div>
        </div>`;

      $(".contenedor-titulo-calendario-vehiculos").html(tituloHTML);
      
      var elemHTML=''+
        '<div class="contenedor-horarios">'+
          '<br>'+
        '';
        
      for(i=0;i<horarios.length;i++){
        elemHTML+=''+
          '<div class="contenedor-reservacion">'+
            '<div class="celda-hora" >'+horariosTxt[i]+'</div>';
        //DIBUJAR CUADROS VACIOS, CON ID
        elemHTML+=''+
            '<div class="celda-info-reservacion celda-disponible" data-hora="'+i+'" id="hora-'+i+'">'+
              '<div class="celda-titulo-reservacion" >Disponible</div>'+
              '<div class="celda-usuario-reservacion celda-reservar celda-reservar-libre">Reservar</div>';
            '</div>';
        elemHTML+=''+
          '</div>';
      }

      elemHTML+=''+
          '<br><br><div class="boton-container contenedor-boton-tabla-agendar alinear-derecha">'+
            '<div class="boton boton-crear-reservacion-vehiculos">'+
              'SIGUIENTE'+
            '</div>'+
            '&nbsp;'+
            '<div class="boton boton-cancelar-reservacion-vehiculos" >'+
              'CANCELAR'+
            '</div>'+
          '</div>'+
        '</div>';

      $(".contenedor-campos-calendario-vehiculos").html(elemHTML);
      

      $(".boton-cancelar-reservacion-vehiculos").click(function(){
        cargarVehiculos();
        // desplazar_submenu(0);
        horasReservar=new Array();

        $(".bloque[data-seccion='1'] .contenedor-titulo").html("NUEVO VEHICULO");
        $(".bloque").show();
        $(".contenedor-nuevo-vehiculo").show();
        $(".contenedor-calendario-campos").hide();
        $(".bloque[data-seccion='1']").hide();
        $(".submenu .opcion[data-seccion='0']").addClass("seleccionado");
        $(".submenu .opcion[data-seccion='1']").removeClass("seleccionado");
        $(".submenu .opcion[data-seccion='1']").html("NUEVO VEHICULO");
      });

      $(".boton-crear-reservacion-vehiculos").click(function(){
        // $(".celda-usuario-reservacion").removeClass("celda-reservar");
        interfazFormularioReserva();
        $(".contenedor-boton-tabla-agendar").hide();
        $(".celda-usuario-reservacion").removeClass("celda-reservar-libre");
        $(".celda-usuario-reservacion").removeClass("celda-reservar");
      });

      var constanteFecha="2024/11/01";
      for(i=0;i<respuesta_json.datos.length;i++){
        var strInicio=respuesta_json.datos[i]["horaInicio"];
        console.log(strInicio);
        var dateInicioReservacion=new Date(constanteFecha+" "+strInicio);
        var strFin=respuesta_json.datos[i]["horaFin"];
        var dateFinReservacion=new Date(constanteFecha+" "+strFin);
        console.log("Reservación DE "+strInicio+" A "+strFin);
        //Iterar en los horarios para dibujar la que corresponde
        var encontrado=false;
        //Buscar el horario de inicio de la reservación en todos los horarios del día
        for(j=0;j<horarios.length;j++){
          var dateHorario=new Date(constanteFecha+" "+horarios[j]);
          if(!encontrado){

            if(dateHorario.getTime()==dateInicioReservacion.getTime()){
              console.log("ENCONTRADO");
              encontrado=true;
              var elemHTML=''+
              '<div class="celda-titulo-reservacion" data-id="'+respuesta_json.datos[i]["id"]+'">'+
                respuesta_json.datos[i]["titulo"];
              elemHTML+=''+
                '<div class="botones-reservacion">';
              if(permisoAdministrar||permisoReservar){
                elemHTML+=''+
                  '<div class="boton-eliminar-reservacion">Cancelar</div>&nbsp;&nbsp;&nbsp;';
              }
              elemHTML+=''+
                  '<div class="boton-detalle-reservacion">'+
                    'Más'+
                    '<input type="hidden" class="contenedor-descripcion-reservacion" value="'+respuesta_json.datos[i]["descripcion"]+'">'+
                  '</div>'+
                '</div>';
              
              elemHTML+=''+
              '</div>'+
              '<div class="celda-usuario-reservacion">'+respuesta_json.datos[i]["usuario"]+'</div>';
              
              $("#hora-"+j).html(elemHTML);
              $("#hora-"+j).removeClass("celda-disponible");
              $("#hora-"+j).addClass("celda-ocupada");
              $("#hora-"+j).css("border-bottom", "none");
            }                  
          }else{
            if(dateHorario.getTime()<dateFinReservacion.getTime()){
              $("#hora-"+j).css("border-bottom", "none");
              $("#hora-"+j).css("border-top", "none");
              $("#hora-"+j).removeClass("celda-disponible");
              $("#hora-"+j).addClass("celda-ocupada");
              $("#hora-"+j).html("");
            }

          }
        }
      }

      $(".boton-detalle-reservacion").click(function(){
        var descripcion=$(this).find("input").val();
        popupDetalleReservacion(descripcion);
      });

      $(".boton-eliminar-reservacion").click(function(){
        if(window.confirm("¿Confirma la eliminación de la reservación?")){
          var idReservacion=$(this).parent().parent().attr("data-id");

          var datos={
            idReservacion:idReservacion,
            eliminarReservacion:1
          };
          $.ajax({
            url: "./lib_php/updVehiculos.php",
            type: "POST",
            dataType: "json",
            data: datos
          }).always(function(respuesta_json){
            console.log(respuesta_json);
            if (respuesta_json.isExito == 1){
              console.log(respuesta_json.mensaje);
              alert("La reservación fue eliminada exitosamente");
              //mostrarCalendario();
              cargarVehiculos();
            }
            else{
              alert("Ocurrió un error al agendar la reservación, intenta nuevamente")
            }
          });
        }
      });

      $(".celda-reservar-libre").click(function(){
        if($(this).html()=="Reservar"){
          var horaReserva=Number($(this).parent().attr("data-hora"));

          horasReservar.push(horaReserva);
          habilitarReservas();             
        }else{
          var horaReserva=Number($(this).parent().attr("data-hora"));
          for(i=0;i<horasReservar.length;i++){
            if(Number(horasReservar[i])==horaReserva){
              horasReservar.splice(i,1);
              if(horasReservar.length>0){
                habilitarReservas();  
              }else{
                deshabilitarReservas();
              }           
              break;
            }
          }
        }
      });
    }
  });  
}


function interfazFormularioReserva(){
  $(".contenedor-campos-agenda-vehiculos").show();
  var principioReserva=horarios.length;
  var finReserva=-1;

  for(i=0;i<horasReservar.length;i++){
    if(horasReservar[i]<principioReserva){
      principioReserva=horasReservar[i];
    }
    if(horasReservar[i]>finReserva){
      finReserva=horasReservar[i];
    }
  }

  var strInicio=horarios[principioReserva] + ":00";
  var strFin=horariosTxt[finReserva].split(" - ")[1] + ":00";

  var elemHTML=`
  <br><div class="contenedor-titulo">
    <div class="celda" style="font-weight: bolder">DATOS PARA RESERVAR:</div>
  </div
  `;

  if(permisoAdministrar){
    elemHTML+=`
    <br><br><div class="contenedor-campo contenedor-campo-usuario-vehiculos">
      <select class="campo campo-filtro-usuario"></select>
      <div class="hint">Reservado.</div>
    </div>
    `;
  }

  elemHTML+=`
    <div class="contenedor-campo contenedor-campo-actividad">
      <select class="campo campo-filtro-actividad">
        <option value="Interna">Interna</option>
        <option value="Externa">Externa</option>
      </select>
    </div><br/>
    <div class="contenedor-campo contenedor-campo-descripcion-agenda">
      <textarea class="campo campo-descripcion-agenda" style="width: 600px; height: 190px;"></textarea>
      <div class="hint">Detalle.</div>
    </div>
    <div class="boton-container contenedor-boton-forumario-agenda-vehiculos">
        <div class="boton boton-guardar-cita-vehiculo">GUARDAR</div>
        <div class="boton boton-cancelar-cita-vehiculo">CANCELAR</div>
    </div>
  `;  

  $(".contenedor-campos-agenda-vehiculos").html(elemHTML);              

  if(permisoAdministrar){
    cargarOpcionesUsuarios();
    console.log("ENTRA VEHIOCUI")
  }

  $(".boton-cancelar-cita-vehiculo").click(function(){
    $(".contenedor-campos-agenda-vehiculos").css("display", "none");
    $(".celda-usuario-reservacion").addClass("celda-reservar-libre");
    $(".celda-usuario-reservacion").addClass("celda-reservar");
    horasReservar=new Array();
    mostrarDisponibilidadDia();
    // $(".celda-usuario-reservacion").addClass("celda-reservar-libre");
    // $(".celda-usuario-reservacion").removeClass("celda-reservar");
    // $(".celda-info-reservacion").removeClass("celda-reservar-reservada");

    $(".contenedor-boton-tabla-agendar").show();
  });

  $(".boton-guardar-cita-vehiculo").click(function(){
    var idUsuario=-1;

    if(permisoAdministrar){
      idUsuario=$(".campo-filtro-usuario").val()
    }

    var partesFecha = fechaSeleccionada.split('/');

    console.log(partesFecha);
    var dia = partesFecha[0].padStart(2, '0');
    var mes = partesFecha[1].padStart(2, '0');
    var anio = partesFecha[2];

    var fechaFormateada = anio + "-" + mes + "-" + dia;

    var datos={
      idVehiculo:vehiculoSeleccionado,
      nombreVehiculo:nombreVehiculoSeleccionado,
      fecha:fechaFormateada,
      horaInicio:strInicio,
      horaFin:strFin,
      usuario:idUsuario,
      titulo:$(".campo-filtro-actividad").val(),
      descripcion:$(".campo-descripcion-agenda").val(),
      reservar:1
    };

    // console.log(datos);

    if(datos.descripcion!=""){
      $.ajax({
        url: "./lib_php/updVehiculos.php",
        type: "POST",
        dataType: "json",
        data: datos
      }).always(function(respuesta_json){
        console.log(respuesta_json);
        if (respuesta_json.isExito == 1){
          console.log(respuesta_json.mensaje);
          alert("La reservación fue agendada exitosamente");
          $(".contenedor-campos-agenda-vehiculos").hide();

          cargarVehiculos();
          horasReservar=new Array();

          $(".bloque[data-seccion='1'] .contenedor-titulo").html("NUEVO VEHICULO");
          $(".bloque").show();
          $(".contenedor-nuevo-vehiculo").show();
          $(".contenedor-calendario-campos").hide();
          $(".bloque[data-seccion='1']").hide();
          $(".submenu .opcion[data-seccion='0']").addClass("seleccionado");
          $(".submenu .opcion[data-seccion='1']").removeClass("seleccionado");
          $(".submenu .opcion[data-seccion='1']").html("NUEVO VEHICULO");

          
          // cargarVehiculos();
        }else{
          alert("Ocurrió un error al agendar la reservación, intenta nuevamente")
        }
      });
    }else{
      alert("Por favor indica el detalle de la reservación");
    }
  });
}

function habilitarReservas(){
  var principioReserva=horarios.length;
  var finReserva=-1;

  for(i=0;i<horasReservar.length;i++){
    if(horasReservar[i]<principioReserva){
      principioReserva=horasReservar[i];
    }
    if(horasReservar[i]>finReserva){
      finReserva=horasReservar[i];
    }
  }

  $(".celda-reservar").each(function(){
    var indice=Number($(this).parent().attr("data-hora"));
    if(indice==principioReserva-1||indice==finReserva+1){
      $(this).parent().removeClass("celda-reservar-reservada");
      $(this).parent().removeClass("celda-reservar-deshabilitada");
      $(this).parent().find(".celda-titulo-reservacion").html("Disponible");
      $(this).parent().find(".celda-usuario-reservacion").html("Reservar");
    }else{
      if(indice>=principioReserva&&indice<=finReserva){
        $(this).parent().addClass("celda-reservar-reservada");
        $(this).parent().find(".celda-titulo-reservacion").html("Seleccionado");
        $(this).parent().find(".celda-usuario-reservacion").html("");
        if(indice==principioReserva||indice==finReserva){
          $(this).parent().find(".celda-usuario-reservacion").html("Liberar");
        }
      }
      else{
        $(this).parent().addClass("celda-reservar-deshabilitada");
        $(this).parent().children().each(function(){
          $(this).html("&nbsp;");
        });
      }
    }
  });

  // if($("#confirmar-reservacion").size()==0){
  //   var elemReservar='<div id="confirmar-reservacion" style="position:fixed;top:0px;right:0px;background-color:#762023;color:white;line-height:30px;padding-left:10px;padding-right:5px;z-index:10;text-decoration:underline;cursor:pointer">Confirmar Reservación</div>';
  //   $("body").append(elemReservar);
  //   $("#confirmar-reservacion").click(function(){
  //     interfazFormularioReserva();
  //   });    
  // }else{
  //   $("#confirmar-reservacion").css("display", "block");
  // }
}

function deshabilitarReservas(){
  $(".celda-reservar").each(function(){
    $(this).parent().removeClass("celda-reservar-reservada");
    $(this).parent().removeClass("celda-reservar-deshabilitada");
    $(this).parent().find(".celda-titulo-reservacion").html("Disponible");
    $(this).parent().find(".celda-usuario-reservacion").html("Reservar");
  });
  // $("#confirmar-reservacion").remove();
}