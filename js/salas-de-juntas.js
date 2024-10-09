var idSalaSeleccionada=-1;
var tituloNuevo="NUEVA SALA.";
var tituloEditar="MODIFICAR SALA.";

var meses=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
var mesesCortos=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Octu","Nov","Dic"];
var dias=["Lunes","Martes","Miércoles","Jueves","Viernes", "Sábado", "Domingo"];
var diasCortos=["Lun","Mar","Mie","Jue","Vie", "Sab", "Dom"];
var horarios=["08:00","08:30","09:00","09:30","10:00", "10:30", "11:00","11:30", "12:00","12:30", "13:00","13:30", "14:00","14:30", "15:00","15:30", "16:00","16:30", "17:00","17:30", "18:00","18:30", "19:00","19:30"];
var horariosTxt=["08:00 - 08:30","08:30 - 09:00","09:00 - 09:30","09:30 - 10:00","10:00 - 10:30", "10:30 - 11:00", "11:00 - 11:30","11:30 - 12:00", "12:00 - 12:30","12:30 - 13:00", "13:00 - 13:30","13:30 - 14:00", "14:00 - 14:30","14:30 - 15:00", "15:00 - 15:30","15:30 - 16:00", "16:00 - 16:30","16:30 - 17:00", "17:00 - 17:30","17:30 - 18:00", "18:00 - 18:30","18:30 - 19:00", "19:00 - 19:30","19:30 - 20:00"];
var horasReservar=new Array();

var ultimaSalaCalendario=-1;
var ultimoNombreCalendario=-"";
var ultimoMesCalendario=-1;
var ultimoAnioCalendario=-1;

function ajustarElementos(){
}

$(document).ready(function() {
  ajustarElementos(); //Obligatoria
  agregarListeners(); //Obligatoria
  cargarSalas();
});

$( window ).resize(function() {
  ajustarElementos();
});

$(window).load(function() {
  ajustarElementos();
})

function agregarListeners(){
  $(".boton-guardar-salas").click(guardarSalas);
  $(".boton-cancelar-salas").click(limpiarFormulario);
}

function limpiarFormulario(){
  idVehiculoSeleccionado=-1;
  $(".campo-sala-nombre").val("");
  $(".campo-sala-cupo").val("");
  $(".bloque").hide();
  $(".bloque[data-seccion='0']").show();

  $(".bloque[data-seccion='1'] .contenedor-titulo").html(tituloNuevo);
  $(".submenu .opcion[data-seccion='1']").html(tituloNuevo);
}

function cargarSalas(){
  var datos={
      mostrarSalas: 1
  };
  console.log(datos);
  $.ajax({
      url: "./lib_php/updSalas.php",
      type: "POST",
      dataType: "json",
      data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json);
    var elemHTML='';
    if (respuesta_json.isExito == 1){
      var salas = respuesta_json.datos;

      salas = salas.map(function(sala) {
        if (!sala.reservaciones) {
          sala.reservaciones = "Ver";
        }
        return sala;
      });
      var configuracionTabla={
        titulos:["Nombre", "Cupo", "Reservaciones"],
        campos:["nombre", "cupo", "reservaciones"],
        clases:["columna-nombre", "columna-cupo", "columna-reservaciones"],
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
      elemHTML+=crearTabla(salas, configuracionTabla);  
    }
    $(".lista-salas").html(elemHTML);
    $(".lista-salas .fila-datos .columna-nombre").click(editarSalas);
    $(".lista-salas .fila-datos .columna-reservaciones").click(function(){
      ultimoMesCalendario=-1;
      ultimoAnioCalendario=-1;
      mostrarCalendario($(this));
    });
    limpiarFormulario();
  });
}

function guardarSalas(){
    var datos={
        nombre:$(".campo-sala-nombre").val(),
        cupo:$(".campo-sala-cupo").val()
    }
    var mensajeExito="";
    valido = true;
    var dato_ = datos.cupo;

    console.log(dato_);

    if(idSalaSeleccionada==-1){
      datos.agregarSalas=1;
      mensajeExito="La sala se creó correctamente";
      console.log("Agregar");
    }
    else{
      datos.editarSalas=1;
      datos.id=idSalaSeleccionada;
      mensajeExito="La sala se modificó correctamente";
      console.log("Editar");
    }
    //console.log(datos);
    if(!vacio(datos.nombre)&&!vacio(datos.cupo)&&datos.cupo>=0){
      console.log(datos);
      $.ajax({
        url: "./lib_php/updSalas.php",
        type: "POST",
        dataType: "json",
        data: datos
      }).always(function(respuesta_json){
        console.log(respuesta_json);
        if (respuesta_json.isExito == 1){
          mostrarMensaje(mensajeExito);
          cargarSalas();
      }});
    }else{
      alert("Por favor indica el nombre de la sala y el cupo");
    }
}

function editarSalas (event) {
    idSalaSeleccionada=$(event.target).closest(".fila-datos").attr("data-id");
    console.log(idSalaSeleccionada);
    //console.log("Salas cargando");
    var datos={
      mostrarSalasPorId:1,
      id:idSalaSeleccionada
    };
  
    $.ajax({
      url: "./lib_php/updSalas.php",
      type: "POST",
      dataType: "json",
      data: datos,
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if (respuesta_json.isExito == 1){
        $(".campo-sala-nombre").val(respuesta_json.datos[0].nombre);
        $(".campo-sala-cupo").val(respuesta_json.datos[0].cupo);
        $(".bloque[data-seccion='1'] .contenedor-titulo").html(tituloEditar);
        $(".bloque").hide();
        $(".bloque[data-seccion='1']").show();

        $(".submenu .opcion[data-seccion='0']").removeClass("seleccionado");
        $(".submenu .opcion[data-seccion='1']").addClass("seleccionado");

        $(".submenu .opcion[data-seccion='1']").html(tituloEditar);
      }
    });
}

function mostrarCalendario(componente, grupo){
  //Obtener mes y año de los filtros
  if (typeof grupo !== 'undefined') {
    grupo=true;
  }else{
    grupo=false;
  }

  horasReservar=new Array();

  var idSala;
  var nombreSala;

  if (typeof componente !== 'undefined') {
    idSala = $(componente).closest(".fila-datos").attr("data-id");
    nombreSala= $(componente).closest(".fila-datos").find(".columna-nombre").html();
    ultimoNombreCalendario=nombreSala;
    ultimaSalaCalendario=idSala;
  }else{
    idSala=ultimaSalaCalendario;
    nombreSala=ultimoNombreCalendario;
  }

  var datos={
    mostrarCalendario:1,
    sala:idSala,
    mes:ultimoMesCalendario,
    anio:ultimoAnioCalendario
  };

  $.ajax({
    url: "./lib_php/updSalas.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json);

    if (respuesta_json.isExito == 1){
      $(".bloque[data-seccion='1'] .contenedor-titulo").html("AGENDA");
      $(".bloque").hide();
      $(".contenedor-nueva-sala-juntas").hide();
      $(".contenedor-calendario-campos").show();
      $(".bloque[data-seccion='1']").show();
      $(".submenu .opcion[data-seccion='0']").removeClass("seleccionado");
      $(".submenu .opcion[data-seccion='1']").addClass("seleccionado");
      $(".submenu .opcion[data-seccion='1']").html("AGENDA");

      if(ultimoMesCalendario==-1){
        ultimoMesCalendario=(new Date().getMonth())+1;
        console.log(ultimoMesCalendario);
      }

      if(ultimoAnioCalendario==-1){
        ultimoAnioCalendario=(new Date().getFullYear());
        console.log(ultimoAnioCalendario);
      }

      respuesta=respuesta_json.datos;

      elemHTML='<br>'+
        '<div class="contenedor-titulo-nombre-sala">'+nombreSala+'</div>'+
        '<br><div class="contenedor-titulo-nombre-mes">'+
        '<span class="boton-mes-anterior" style="cursor:pointer;">  ··  </span>'+
        meses[Number(respuesta.mes)-1]+' '+respuesta.anio+
        '<span  class="boton-mes-siguiente" style="cursor:pointer;">  ··  </span></div>'+
        '<input type="hidden" class="campo-id-sala" value="'+idSala+'">'+
        '<input type="hidden" class="campo-nombre-sala" value="'+nombreSala+'"><br/>';

      $(".contenedor-campos-calendario-titulos").html(elemHTML);

      elemHTML='<br><br><div class="titulos-calendario">';
      for(var i=0;i<dias.length;i++){
        elemHTML+='<div class="titulo-calendario">'+dias[i]+'</div>'+'<div class="titulo-calendario-movil">'+diasCortos[i]+'</div>';
      }

      elemHTML+='</div>';
      elemHTML+='<div class="fila-calendario">';

      var contadorDiasSemana=0;
      for(i=1;i<respuesta.diaInicioMes;i++){
        elemHTML+='<div class="celda-calendario" data-fecha="">&nbsp;</div>';
        contadorDiasSemana++;
      }
      //Suponemos 12 horas, 24 espacios para citas
      for(i=1;i<=respuesta.ultimoDiaMes;i++){
        var altoOcupacion=respuesta["citas"][i]*45/horarios.length;
        elemHTML+='<div class="celda-calendario" data-fecha="'+respuesta.anio+'-'+respuesta.mes+'-'+i+'" >'+i+
        '<div class="barra-verde"></div>'+
        '<div class="barra-ocupacion" style="height:'+altoOcupacion+'px"></div>'+
        '</div>';
        contadorDiasSemana++;
        if(contadorDiasSemana==7){
          elemHTML+='</div><div class="fila-calendario">';
          contadorDiasSemana=0;
        }
      }

      elemHTML+='</div><br>';
    
      $(".contenedor-campos-calendario-salas-juntas").html(elemHTML);

      // btnElemnt=''+
      //   '<div class="boton-container alinear-derecha contenedor-boton-agendar-salas" style="display: none;">'+
      //     '<div class="boton boton-guardar-horarios">SIGUIENTE</div>'+
      //     '<div class="boton boton-cancelar-calendario">CANCELAR</div>'+
      //   '</div>';

      btnElement = `<br><br><div class="boton-container alinear-derecha contenedor-boton-agendar-salas">
        <div class="boton boton-guardar-horarios">SIGUIENTE</div>
        <div class="boton boton-cancelar-calendario">CANCELAR</div>
      </div>`;

      $(".contenedor-boton-calendario-salas-juntas").html(btnElement);
      
      $(".boton-mes-anterior").click(function(){
        console.log("anterior");
        ultimoMesCalendario--;
        if(ultimoMesCalendario==0){
          ultimoMesCalendario=12;
          ultimoAnioCalendario--;
        }
        mostrarCalendario();
      });

      $(".boton-mes-siguiente").click(function(){
        ultimoMesCalendario++;
        if(ultimoMesCalendario==13){
          ultimoMesCalendario=1;
          ultimoAnioCalendario++;
        }
        mostrarCalendario();
        console.log("siguiente");
      });

      $(".boton-cancelar-calendario").click(function(){
        $(".bloque[data-seccion='1'] .contenedor-titulo").html(tituloNuevo);
        $(".bloque").hide();
        $(".contenedor-nueva-sala-juntas").show();
        $(".contenedor-calendario-campos").hide();
        $(".bloque[data-seccion='0']").show();

        $(".submenu .opcion[data-seccion='0']").addClass("seleccionado");
        $(".submenu .opcion[data-seccion='1']").removeClass("seleccionado");

        $(".submenu .opcion[data-seccion='1']").html(tituloNuevo);
        $(".contenedor-campos-agenda-salas-juntas").html("");
      });

      $(".celda-calendario").click(function(){
        mostrarDia($(this));
      });
      $(".submenu .opcion[data-seccion='0']").removeClass("seleccionado");
      $(".submenu .opcion[data-seccion='1']").addClass("seleccionado");
    }
  });
}

function mostrarDia(componente){
  var dataFecha=componente.attr("data-fecha");
  var htmlSelector=$(".contenedor-campos-agenda-salas-juntas").html("");
  console.log(htmlSelector)

  $(".contenedor-boton-agendar-salas").css("display", "block");


  if(dataFecha!=""){
    var datos={
      fecha:dataFecha,
      idSala:$(".campo-id-sala").val(),
      desglosarCitas:1
    }

    console.log(datos);
    $.ajax({
      url: "./lib_php/updSalas.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if (respuesta_json.isExito == 1){
        console.log(respuesta_json.datos);
        /*if(htmlSelector==""){
          $("#contenedor-selector-sala").css("display", "none");  
        }
        else{
         $("#contenedor-selector-sala").css("display", "block");   
        }*/

        // $("#contenedor-selector-sala").css("display", "none");  
        // $("#contenedor-detalle-sala").css("display", "none");
        // $("#contenedor-horario-sala").css("display", "block");
        // $("#contenedor-formulario-sala").css("display", "none");
        // var elemHTML=''+
        //   '<div style="color:#762023;font-size:25px;text-align:center;font-weight:bold;">'+nombreSala+'</div>'+
        //   '<div style="color:#762023;font-size:25px;text-align:center;font-weight:bold;">'+getDateNormal(dataFecha)+'</div>'+
        //   '<input type="hidden" id="campo-fecha-cita" value="'+dataFecha+'"><br/>'+
        // '';
        var elemHTML = "<div class='nombre-fecha-seleccionada'>"+dataFecha+"</div>";
        elemHTML += '<input type="hidden" class="campo-fecha-cita" value="'+dataFecha+'"><br/>';
        for(i=0;i<horarios.length;i++){
          elemHTML+='<div class="contenedor-cita">'+
            '<div class="celda-hora">'+horariosTxt[i]+'</div>';
          elemHTML+='<div class="celda-info-cita celda-disponible" data-hora="'+i+'" id="hora-'+i+'">'+
            '<div class="celda-titulo-cita">Disponible</div>'+
            '<div class="celda-usuario-cita celda-reservar celda-reservar-libre">Reservar</div>';
          '</div>';
          elemHTML+='</div>';
        }

        // elemHTML+=''+
        //   '<div>'+ '<br>'
        //     '<div class="boton boton-guardar-agendar-sala">'+
        //       'AGENDAR'+
        //     '</div>'+
        //     '<div class="boton boton-cancelar-agendar-sala">'+
        //       'CANCELAR'+
        //     '</div>'+
        //   '</div>';
        
        $(".contenedor-campos-agenda-salas-juntas").html(elemHTML);

      //   $("#boton-cancelar-cita").click(function(){
      //     var htmlSelector=$("#contenedor-selector-sala").html();
      //     if(htmlSelector==""){
      //       $("#contenedor-selector-sala").css("display", "none");  
      //     }
      //     else{
      //       $("#contenedor-selector-sala").css("display", "block");
      //     }
          
      //     $("#contenedor-horario-sala").css("display", "none");
      //     $("#contenedor-formulario-sala").css("display", "none");
      //     $("#contenedor-detalle-sala").css("display", "block");
      //     horasReservar=new Array();
      //     deshabilitarReservas();
      //   });

        $(".boton-guardar-horarios").click(function(){

          interfazFormularioReserva();
        });
      //   //ITERAR SOBRE TODAS LAS CITAS, PARA RELLENAR LAS CELDAS
        var constanteFecha="2018/01/01";
        for(i=0;i<respuesta_json.datos.length;i++){
          var strInicio=respuesta_json.datos[i]["horaInicio"];
          var dateInicioCita=new Date(constanteFecha+" "+strInicio);

          var strFin=respuesta_json.datos[i]["horaFin"];
          var dateFinCita=new Date(constanteFecha+" "+strFin);
          console.log("CITA DE "+strInicio+" A "+strFin);
          //Iterar en los horarios para dibujar la que corresponde
          var encontrado=false;
          for(j=0;j<horarios.length;j++){
            var dateHorario=new Date(constanteFecha+" "+horarios[j]);
            if(!encontrado){
              console.log(dateHorario);
              console.log(dateHorario.getTime());
              console.log(dateInicioCita);
              console.log(dateInicioCita.getTime());
              if(dateHorario.getTime()==dateInicioCita.getTime()){
                console.log("ENCONTRADO");
                encontrado=true;
                var elemHTML=''+
                '<div class="celda-titulo-cita" data-id="'+respuesta_json.datos[i]["id"]+'">'+
                  respuesta_json.datos[i]["titulo"];

                //PENDIENTE verificar que tenga permiso para quitar la cita
                
                console.log("EL ID DEL USUARIO ACTUAL ES "+idUsuarioSesion)
                
                elemHTML+=''+
                  '<div class="botones-cita">';
                if(permisoAdministrar||respuesta_json.datos[i]["idUsuario"]==idUsuarioSesion){
                  elemHTML+=''+
                    '<div class="boton-eliminar-cita">Eliminar</div>';
                }
                elemHTML+=''+
                    '<div class="boton-detalle-cita">'+
                      'Detalles'+
                      '<input type="hidden" class="contenedor-descripcion-cita" value="'+respuesta_json.datos[i]["descripcion"]+'">'+
                    '</div>'+
                  '</div>';
                
                elemHTML+=''+
                '</div>'+
                '<div class="celda-usuario-cita">'+respuesta_json.datos[i]["usuario"]+'</div>';
                
                $("#hora-"+j).html(elemHTML);
                $("#hora-"+j).removeClass("celda-disponible");
                $("#hora-"+j).addClass("celda-ocupada");
                $("#hora-"+j).css("border-bottom", "none");
              }                  
            }
            else{
              if(dateHorario.getTime()<dateFinCita.getTime()){
                $("#hora-"+j).css("border-bottom", "none");
                $("#hora-"+j).css("border-top", "none");
                $("#hora-"+j).removeClass("celda-disponible");
                $("#hora-"+j).addClass("celda-ocupada");
                $("#hora-"+j).html("");
              }
            }
          }
        }

        $(".boton-detalle-cita").click(function(){
          var descripcion=$(this).find("input").val();
          alert(descripcion);
        });

        $(".boton-eliminar-cita").click(function(){
          var idCita=$(this).parent().parent().attr("data-id");
          console.log(idCita);

          var datos={
            idCita:idCita,
            eliminarCita:1
          };
          $.ajax({
            url: "./lib_php/updSalas.php",
            type: "POST",
            dataType: "json",
            data: datos
          }).always(function(respuesta_json){
            console.log(respuesta_json);
            if (respuesta_json.isExito == 1){
              mostrarCalendario();
              $(".contenedor-campos-agenda-salas-juntas").html("");
              mostrarMensaje("LA CITA SE ELIMINO CON EXITO");
              //Llevar a la vista del día, refrescando la informacion
            }
            else{
              alert("Ocurrió un error al eliminar la cita, intente nuevamente")
            }
          });
        });

        $(".celda-reservar-libre").click(function(){
          if($(this).html()=="Reservar"){
            var horaReserva=Number($(this).parent().attr("data-hora"));
            horasReservar.push(horaReserva);
            habilitarReservas();                 
          }
          else{
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
}


function habilitarReservas(){
  console.log(horarios.length);
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

  console.log("INICIO "+principioReserva);
  console.log("FIN "+finReserva);
  $(".celda-reservar").each(function(){
    var indice=Number($(this).parent().attr("data-hora"));
    if(indice==principioReserva-1||indice==finReserva+1){
      $(this).parent().removeClass("celda-reservar-reservada");
      $(this).parent().removeClass("celda-reservar-deshabilitada");
      $(this).parent().find(".celda-titulo-cita").html("Disponible");
      $(this).parent().find(".celda-usuario-cita").html("Reservar");
    }else{
      if(indice>=principioReserva&&indice<=finReserva){
        $(this).parent().addClass("celda-reservar-reservada");
        $(this).parent().find(".celda-titulo-cita").html("Seleccionado");
        $(this).parent().find(".celda-usuario-cita").html("");
        if(indice==principioReserva||indice==finReserva){
          $(this).parent().find(".celda-usuario-cita").html("Liberar");
        }
      }else{
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
  // }
  // else{
  //   $("#confirmar-reservacion").css("display", "block");
  // }
}

function deshabilitarReservas(){
  $(".celda-reservar").each(function(){
    $(this).parent().removeClass("celda-reservar-reservada");
    $(this).parent().removeClass("celda-reservar-deshabilitada");
    $(this).parent().find(".celda-titulo-cita").html("Disponible");
    $(this).parent().find(".celda-usuario-cita").html("Reservar");
  });
  $(".confirmar-reservacion").remove();
}

function interfazFormularioReserva(){

  var nombreSala=$(".campo-nombre-sala").val();
  var fechaCita=$(".campo-fecha-cita").val();

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

  var strInicio=horarios[principioReserva];
  var strFin=horariosTxt[finReserva].split(" - ")[1];
  console.log(strInicio);
  console.log(strFin);


  var formularioReserva = `
  <div class="contenedor-formulario-datos-agendar">
    <div class="contenedor-titulo">
        <div class="celda" style="font-weight: bold;">`+nombreSala+`</div><br>
        <div class="celda" style="font-weight: bolder;">`+fechaCita+'|'+strInicio+' - '+ strFin + `</div>
    </div><br>
    <div class="contenedor-campo contenedor-campo-usuario-agenda-sala">
        <select class="campo campo-filtro-usuario"></select>
        <div class="hint">Reservado.</div>
    </div>
    <div class="contenedor-campo contenedor-campo-usuario-agenda-sala">
        <select class="campo campo-filtro-actividad">
          <option value="Clientes">Clientes</option>
          <option value="Proveedores">Proveedores</option>
          <option value="Interna">Interna</option>
        </select>
        <div class="hint">Actividad.</div>
    </div>
    <div class="contenedor-campo contenedor-campo-detalle-agenda-sala">
      <textarea class="campo campo-detalle-agenda-sala" style="width: 678px; height: 190px;"></textarea>
      <div class="hint">Detalle.</div>
    </div><br>
    <div class="boton-container alinear-derecha contenedor-boton-agendar-salas">
      <div class="boton contenedor-boton-guardar-popup-agenda">AGENDAR</div>
      <div class="boton contenedor-boton-cancelar-popup-agenda">REGRESAR</div>
    </div>
  </div>`;

  cargarOpcionesUsuarios();
  mostrarPopup(100, 70);
  cargarPopup(formularioReserva);

  $(".contenedor-boton-cancelar-popup-agenda").click(function(){
    $(".campo-detalle-agenda-sala").val("");
    cerrarPopup();
    
  });

  $(".contenedor-boton-guardar-popup-agenda").click(function(){
    var idUsuario=-1;
    if(permisoAdministrar){
      idUsuario=$(".campo-filtro-usuario").val()
    }

    var datos={
      idSala:$(".campo-id-sala").val(),
      fecha:$(".campo-fecha-cita").val(),
      horaInicio:strInicio,
      horaFin:strFin,
      usuario:idUsuario,
      titulo:$(".campo-filtro-actividad").val(),
      descripcion:$(".campo-detalle-agenda-sala").val(),
      reservar:1
    };

    console.log(datos);
    $.ajax({
      url: "./lib_php/updSalas.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      if (respuesta_json.isExito == 1){
        console.log(respuesta_json.mensaje);
        alert("La cita fue agendada exitosamente");
        mostrarCalendario();
        $(".contenedor-campos-agenda-salas-juntas").html("");
        cerrarPopup();
      }
      else{
        alert("Ocurrió un error al agendar la cita, intenta nuevamente")
      }
    });

  });
  

  // $(".contenedor-agregar-participante").css("display", "none");
  // $(".contenedor-campo-participantes-cita").css("display", "block");

  // $("select.filtro-area").val(0);
  // $(".resultados-filtro-participantes").html("");

  // contenedorParticipantesPopup = $(".celda-participantes-citas");
  // $(".celda-participantes-principal").html(contenedorParticipantesPopup);

  // refrescarEnAgregar = -1;
  // refrescarParticipantes();

  // cerrarPopup();
}

function cargarOpcionesUsuarios(){
  var datos={
    usuariosPermitidos:1
  };  
  $.ajax({
    url: "./lib_php/updSalas.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    if (respuesta_json.isExito == 1){
      var elemHTML='';
      for(i=0;i<respuesta_json.datos.length;i++){
        elemHTML+='<option value="'+respuesta_json.datos[i].id+'">'+respuesta_json.datos[i].nombre+'</option>';
      }
      $("select.campo-filtro-usuario").html(elemHTML);
    }
  });
}