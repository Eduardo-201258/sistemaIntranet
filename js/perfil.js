/*PERFIL*/
var archivoFoto="";
var archivoFirma="";


var idJefe=-1;
var idUsuario=-1;
var nombreUsuario="";
var paternoUsuario="";
var maternoUsuario="";
var areaUsuario="";
var refrescarEnAgregar = -1;
var usuarioComercial=true;

var autorizados=[];
var participantes=[];
var usuarios;

/*CALENDARIO*/
var diasSemana=["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
var meses=["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];

//-1 si se está viendo el calendario del usuario, o si es otro usuario, el id del otro usuario
var calendarioSeleccionado=-1;
var nombreCalendarioSeleccionado="";

//Bandera que se inicializa cada que se cambia el dueño del calendario
var primeraCargaDelUsuario=false;
//Bandera para NO mostrar la alerta la primera vez, cuando se carga el calendario del usuario
var primeraCargaCalendario=true;


function guardarPerfil(){
  //Mando todos los datos, y en el controlador hago una u otra consulta de acuerdo a los permisos
  var datos={
    guardarPerfil:1,
    nombre:$(".campo-nombre").val(),
    paterno:$(".campo-paterno").val(),
    materno:$(".campo-materno").val(),
    nacimiento:$(".campo-fecha-nacimiento").val(),
    estadoCivil:$(".campo-estado-civil").val(),
    nacionalidad:$(".campo-nacionalidad").val(),
    numeroHijos:$(".campo-numero-hijos").val(),
    sexo:$(".campo-sexo").val(),

    telefono:$(".campo-telefono").val(),
    extension:$(".campo-extension").val(),
    celular:$(".campo-celular").val(),
    correoPersonal:$(".campo-correo-personal").val(),
    direccion:$(".campo-direccion").val(),
    colonia:$(".campo-colonia").val(),
    cp:$(".campo-codigo-postal").val(),
    municipio:$(".campo-municipio").val(),

    correo:$(".campo-correo").val(),

    sucursal:$(".campo-sucursal").val(),
    area:$(".campo-area").val(),
    puesto:$(".campo-puesto").val(),
    jefe:$(".campo-jefe").val(),
    seguro:$(".campo-seguro").val(),
    curp:$(".campo-curp").val(),
    rfc:$(".campo-rfc").val(),
    ingreso:$(".campo-ingreso").val(),

    enfermedades:$(".campo-enfermedades").val(),
    alergias:$(".campo-alergias").val(),
    tipoSangre:$(".campo-tipo-sangre").val(),
    contactoEmergencia:$(".campo-contacto-emergencia").val(),
    telefonoEmergencia:$(".campo-telefono-emergencia").val(),

    foto:archivoFoto.getArchivo(),
    firma:archivoFirma.getArchivo(),
  }
  
  console.log("GUARDAR PERFIL");
  $.ajax({
    url: "./lib_php/updUsuarios.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json);
    if (respuesta_json.isExito == 1){
      mostrarMensaje("Tu perfil se actualizó correctamente");
    }
  }); 
}

function guardarContrasenia(){
  var contraseniaAnterior=$(".campo-contrasenia").val();
  var contraseniaNueva=$(".campo-nueva-contrasenia").val();
  var confirmacion=$(".campo-confirmar-contrasenia").val();

  if(vacio(contraseniaNueva)||vacio(contraseniaAnterior)||vacio(confirmacion)){
    mostrarError("Por favor completa todos los campos");
    return;
  }
  if(!contraseniaValida(contraseniaNueva)){
    //El error ya lo muestra la función
    return; 
  }
  if(contraseniaNueva!=confirmacion){
    mostrarError("La nueva contraseña y la confirmación no coinciden");
    return;
  }

  var datos={
    contraseniaAnterior:md5Script(contraseniaAnterior),
    contraseniaNueva:md5Script(contraseniaNueva),
    cambiarContrasenia:1
  };

  $.ajax({
    url: "./lib_php/updUsuarios.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json);
    if (respuesta_json.isExito == 1){
      mostrarExito("La contraseña se cambió correctamente");
      $(".campo-contrasenia").val("");
      $(".campo-nueva-contrasenia").val("");
      $(".campo-confirmar-contrasenia").val("");
    }
    else{
      if(respuesta_json.codigo==-10){
        mostrarError("La contraseña anterior no es correcta");
      }
    }
  });
}

/*CALENDARIO*/
function cargarCalendario(){
  //Calcular mes y año actual
  var d = new Date();
  var mesActual=d.getMonth()+1;
  var anioActual=d.getFullYear();
  var diaActual=d.getDate();

  //Rellenar el filtro de meses
  var elemHTML='';
  for(var i=0;i<meses.length;i++){
    var seleccionado="";
    if(i+1==mesActual){
      seleccionado="selected";
    }
    elemHTML+='<option value="'+i+'"  '+seleccionado+'>'+meses[i]+'</option>';
  }
  $("select.filtro-mes").html(elemHTML);

  //Rellenar el filtro de años (desde un año anterior hasta 2 años a futuro)
  elemHTML='';
  for (var i=anioActual-1;i<anioActual+3;i++){
    var seleccionado="";
    if(i==anioActual){
      seleccionado="selected";
    }
    elemHTML+='<option value="'+i+'" '+seleccionado+'>'+i+'</option>';
  }
  $("select.filtro-anio").html(elemHTML);

  //Mostrar el calendario de acuerdo al mes y año seleccionado
  $(".filtro-anio, .filtro-mes").change(mostrarCalendario);

  primeraCargaDelUsuario=true;
  mostrarCalendario();

  //Mandar cargar el calendario para el día de hoy
  cargarCitasDia(diaActual+"/"+mesActual+"/"+anioActual); 
  

  // $(".boton-agregar-participantes").click(function(){
  //   $(".contenedor-agregar-participante").css("display", "block");
  //   $(".contenedor-campo-participantes-cita").css("display", "none");
  // });  

  // $(".boton-cancelar-participantes").click(function(){
  //   $(".contenedor-agregar-participante").css("display", "none");
  //   $(".contenedor-campo-participantes-cita").css("display", "block");
  //   refrescarParticipantes();
  // });

  // $(".contenedor-agregar-participante .filtro-area").change(filtrarAgregarParticipante);
  // $(".contenedor-agregar-participante .filtro-nombre").keyup(filtrarAgregarParticipante);
}

//Mostrar calendario que corresponde a la fecha y año de los filtros
function mostrarCalendario(){
  //Obtener mes y año de los filtros
  var mes=$(".filtro-mes").val();
  var anio=$(".filtro-anio").val();

  //Calcular el número de días que tiene el mes
  var ultimoDelMes=new Date(anio, Number(mes)+1, 0).getDate();

  //Mandar traer los eventos del mes, se manda 
    //el último dia del mes, para la consulta del between
    //el id del usuario de quien se consultará el calendario
  var datos={
    mes:Number(mes)+1,
    calendarioSeleccionado:calendarioSeleccionado,
    anio:anio,
    ultimoDelMes:ultimoDelMes,
    eventosMes:1
  };

  console.log(datos);
  $.ajax({
    url: "./lib_php/updCalendario.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json);
    if (respuesta_json.isExito == 1){
      var citasDelMes=respuesta_json.datos;
      var elemHTMLCalendario='';
      //INTERFAZ - Primera fila del calendario (mes y flechas < >)
      elemHTMLCalendario+='<div class="celda flecha-atras-calendario"><</div>';
      elemHTMLCalendario+='<div class="celda nombre-mes-calendario ">'+meses[mes]+'</div>';
      elemHTMLCalendario+='<div class="celda flecha-adelante-calendario">></div>';

      //Se lleva la cuenta de cuadros del calendario para pintar correctamente los bordes en la ultima columna  
      var contadorCuadrosCalendario=0;

      //INTERFAZ - Segunda fila del calendario (Días de la semana)
      elemHTMLCalendario+='<div class="contenedor-dias-calendario">';
      for(var i=0;i<diasSemana.length;i++){
        var claseUltimoFila="";
        if(i==diasSemana.length-1){
          claseUltimoFila=" cuadro-dia-ultima-fila ";
        }
        elemHTMLCalendario+='<div class="celda celda-calendario titulo-dia-calendario ">'+diasSemana[i].substr(0,3)+'</div>';
      }

      //INTERFAZ - Celdas vacías para días de la semana antes del día primero
      //Obtener el dia de la semana en que empezó el mes

      var d=new Date(anio, Number(mes), 1, 0,0,0);
      var diaInicio=d.getDay();

      for(var i=0;i<diaInicio;i++){
        var claseUltimoFila="";
        elemHTMLCalendario+='<div class="celda-calendario">&nbsp;</div>';
        contadorCuadrosCalendario++;
      }

      //INTERFAZ - Celdas con todos los días del mes 
      for(var i=1;i<=ultimoDelMes;i++){
        //Cada día del mes, hacer una sumatoria de minutos ocupados por citas, para pintar una barra de ocupación estimada (8 horas es un 100%)
        var minutosCitaDia=0;
        for(var j=0;j<citasDelMes.length;j++){
          var dtInicio=desglosarDateTime(citasDelMes[j].inicio);
          var dtFin=desglosarDateTime(citasDelMes[j].fin);
          if(dtInicio.dia==i){
            minutosCitaDia+=(Number(dtFin.hora)*60+Number(dtFin.minuto))-(Number(dtInicio.hora)*60+Number(dtInicio.minuto));
          }
        }
        var porcentajeOcupacion=minutosCitaDia*100/480;
        if(porcentajeOcupacion>100){
          porcentajeOcupacion=100;
        }

        elemHTMLCalendario+=''+
        '<div class="celda-calendario cuadro-dia-accion" data-fecha="'+i+'/'+(Number(mes)+1)+'/'+anio+'">'+
          '<div class="barra-ocupacion-diaria" style="height:'+porcentajeOcupacion+'%"></div>'+
          i+
        '</div>';
        contadorCuadrosCalendario++;
      }

      //INTERFAZ - Celdas vacías para los días que faltan a partir del último de mes para completar los 7 días de la útima fila
      var diasFaltantes=7-contadorCuadrosCalendario%7;
      for(var i=0;i<diasFaltantes;i++){
        elemHTMLCalendario+='<div class="celda-calendario">&nbsp;</div>';
        contadorCuadrosCalendario++;
      }

      elemHTMLCalendario+='</div>';

      //INTERFAZ - Mostrar calendario
      $(".cuadricula-calendario").html(elemHTMLCalendario);


      //CLICK - Para cada día del mes, cargar las citas de ese día
      $(".cuadro-dia-accion").click(function(){
        var fecha=$(this).attr("data-fecha");
        $(".contenedor-citas-dia").show();
        cargarCitasDia(fecha);
      });

      $(".flecha-atras-calendario").click(function(){
        mesAnterior();
      });

      $(".flecha-adelante-calendario").click(function(){
        mesSiguiente();
      });    
    
      if(primeraCargaDelUsuario){
        primeraCargaDelUsuario=false;
        if(!primeraCargaCalendario){
          if(calendarioSeleccionado==-1){
            alert("Regresaste a la vista de tu calendario");
          }
          else{
            alert("Cambiaste al calendario de "+nombreCalendarioSeleccionado);
          }          
        }
        primeraCargaCalendario=false;
      }
    
    }
  });
}

function mesAnterior(){

  let mesAnterior = $("select.filtro-mes").val();
  console.log(mesAnterior);

  if(mesAnterior==0){
    $("select.filtro-mes").val(11);
  }else{
    mesAnterior--;
    $("select.filtro-mes").val(mesAnterior);
  }
  mostrarCalendario();
}

function mesSiguiente(){

  let mesSiguiente = $("select.filtro-mes").val();
  console.log(mesSiguiente);

  if(mesSiguiente==11){
    $("select.filtro-mes").val(0);
  }else{
    mesSiguiente++;
    $("select.filtro-mes").val(mesSiguiente);
  }
  
  mostrarCalendario();
}

//Traer y mostrar las citas de una fecha
function cargarCitasDia(fecha){
  //Traer las citas del día
  var datos={
    fecha:fecha,
    listaCitas:1,
    calendarioSeleccionado:calendarioSeleccionado
  };

  $.ajax({
    url: "./lib_php/updCalendario.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    //Si las citas se cargaron exitosamente
    if (respuesta_json.isExito == 1){

      fechaSeleccionada=fecha;
      //Ocultar el formulario para agendar cita
      $(".contenedor-nueva-cita").css("display", "none");
      //Mostrar los horarios
      $(".contenedor-citas-dia").css("display", "block");
      //Actualizar el cuadro de día que se muestra como seleccionado
      $(".cuadro-dia-seleccionado").removeClass("cuadro-dia-seleccionado");
      $('.cuadro-dia-accion[data-fecha="'+fecha+'"]').addClass("cuadro-dia-seleccionado");
      //Actualizar el título de la lista de horarios del día
      $(".titulo-citas").html("Citas para el día "+fecha);
      //Mostrar las citas
      mostrarCitasDia(respuesta_json.datos);
      console.log(respuesta_json.datos);

      cancelarNuevaCita();
    }
  });
}

//Mostrar las citas que se tienen agendadas para el día
function mostrarCitasDia(datos){
  var $elemHTML='';
  
  //Limpiar la info de eventos de la fecha seleccionada anteriormente
  $(".contenedor-resumen-cita").remove();

  //hacer el scroll desde las 0 a las 8 am (para resaltar que se refrescó el día)
  $(".contenedor-fijo-horario").scrollTop(0);
  $(".contenedor-fijo-horario").animate({
    scrollTop:465
  },1000);

  //Mostrar cada evento del día, cada minuto es un pixel
  for(var i=0;i<datos.length;i++){
    console.log("ENTRA");
    //Calcular el minuto del día en que empieza y termina el evento
    var fechaInicio=desglosarDateTime(datos[i].inicio);
    var fechaFin=desglosarDateTime(datos[i].fin);
    var tempInicio=Number(fechaInicio.hora)*60+Number(fechaInicio.minuto);
    var tempFinal=Number(fechaFin.hora)*60+Number(fechaFin.minuto);

    var posY=tempInicio;
    var altura=tempFinal-tempInicio-2;

    var marcaEstatus="";
    if(datos[i].estatus==0){
      marcaEstatus='<div class="marca-estatus marca-estatus-pendiente"></div>';
    }
    if(datos[i].estatus==1){
      marcaEstatus='<div class="marca-estatus marca-estatus-confirmada"></div>';
    }
      
    var elemHTML='<div class="contenedor-resumen-cita" style="top:'+posY+'px;height:'+altura+'px;" data-id="'+datos[i].id+'">'+
      '<div class="interno-resumen-cita">'+
        '<div class="titulo-resumen-cita"><span class="tinto">'+fechaInicio.hora+":"+fechaInicio.minuto+"-"+fechaFin.hora+':'+fechaFin.minuto+'</span>&nbsp;&nbsp;'+datos[i].titulo+'</div>'+
        marcaEstatus+
      '</div>'+
    '</div>';
    $(".contenedor-desplazable-horario").append(elemHTML);
  }

  //Al hacer click, ir al formulario para modificar la cita
  $(".contenedor-resumen-cita").click(function(){
    var idCita=$(this).attr("data-id");
    mostrarModificarCita(idCita);
  });
}

//MODIFICAR CITAS
function mostrarModificarCita(idCita){
  var datos={
    id:idCita,
    detalleCita:1
  }
  $.ajax({
    url: "./lib_php/updCalendario.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json);
    if (respuesta_json.isExito == 1){

      idCitaSeleccionada=respuesta_json.datos.id;
      var horaInicio=desglosarDateTime(respuesta_json.datos.inicio);
      var horaFin=desglosarDateTime(respuesta_json.datos.fin);
      $(".campo-titulo-cita").val(respuesta_json.datos.titulo);
      $(".campo-descripcion").val(respuesta_json.datos.descripcion);
      $(".campo-hora-inicio").val(Number(horaInicio.hora));
      $(".campo-minuto-inicio").val(Number(horaInicio.minuto));
      $(".campo-hora-fin").val(Number(horaFin.hora));
      $(".campo-minuto-fin").val(Number(horaFin.minuto));
      $(".contenedor-nueva-cita").show();
      $(".contenedor-citas-dia").hide();

      if(calendarioSeleccionado==-1){
        activarCamposCita();
      }
      else{
        desactivarCamposCita();
      }

      var estatus=-1;
      participantes=[];
      for(var i=0;i<respuesta_json.datos.participantes.length;i++){
        for(var j=0;j<usuarios.length;j++){
          var partesParticipante=respuesta_json.datos.participantes[i].split("|");
          if(usuarios[j].id==partesParticipante[0]){
            participantes.push({
              id:usuarios[j].id,
              nombre:usuarios[j].nombre,
              paterno:usuarios[j].paterno,
              materno:usuarios[j].materno
            });
            if(partesParticipante[0]==idUsuario){
              estatus=partesParticipante[1];
            }
          }
        }
      }

      if(estatus!=-1){
        var nombreEstatus="Pendiente";
        if(estatus==1){
          nombreEstatus="Confirmada";
        }
        var botonAceptar='';
        if(estatus==0){
          botonAceptar='<div class="modificar-boton-confirmar-cita" data-id="'+respuesta_json.datos.id+'">Confirmar</div>';
        }
        var botonCancelar='\n<div class="modificar-boton-cancelar-cita"  data-id="'+respuesta_json.datos.id+'">Rechazar</div>';

        var elemHTML='<div class="subtitulo-formulario">Estatus de la cita.</div>';
        elemHTML+='<br><div class="titulo-estatus">La cita tiene estatus: <div class="estatus-cita">' + nombreEstatus + '</div></div>';
        elemHTML+='<div class="contenedor-botones">';
        elemHTML+=botonAceptar;
        elemHTML+=botonCancelar;
        elemHTML+='</div>';
        $(".contenedor-aceptar-rechazar").html(elemHTML)

        $(".modificar-boton-confirmar-cita").click(function(e){
          var idCita=$(this).attr("data-id");
          var datos={
            confirmar:1,
            id:idCita
          };
          $.ajax({
            url: "./lib_php/updCalendario.php",
            type: "POST",
            dataType: "json",
            data: datos
          }).always(function(respuesta_json){
            console.log(respuesta_json);
            if (respuesta_json.isExito == 1){
              alert("La cita se confirmó con éxito");
              $(".cuadro-dia-seleccionado").click();
            }
          });
        });

        $(".modificar-boton-cancelar-cita").click(function(e){
          if(window.confirm("¿Confirma que desea rechazar la cita?")){


            var idCita=$(this).attr("data-id");
            var datos={
              rechazar:1,
              id:idCita
            };
            $.ajax({
              url: "./lib_php/updCalendario.php",
              type: "POST",
              dataType: "json",
              data: datos
            }).always(function(respuesta_json){
              console.log(respuesta_json);
              if (respuesta_json.isExito == 1){
                alert("La cita se rechazó con éxito");
                $(".cuadro-dia-seleccionado").click();
              }
            });
          }
        });

      }
      else{
        $(".contenedor-aceptar-rechazar").html("");
      }
      $(".boton-agendar-cita").hide();
      if(calendarioSeleccionado==-1){
        $(".boton-modificar-cita").show();  
        $(".titulo-nueva-cita").html("Modificar Cita");
      }
      else{
        $(".boton-modificar-cita").hide();  
        $(".titulo-nueva-cita").html("Detalle de la Cita"); 
      }
      refrescarParticipantes();
    }
    else{
      alert("Ocurrió un error, intenta nuevamente");
    }
  });
}

function activarCamposCita(){
  $(".campo-hora-inicio").prop("disabled", false);
  $(".campo-hora-fin").prop("disabled", false);
  $(".campo-minuto-inicio").prop("disabled", false);
  $(".campo-minuto-fin").prop("disabled", false);  
  $(".campo-titulo-cita").prop("disabled", false);
  $(".campo-descripcion").prop("disabled", false);
  $(".boton-cancelar-cita").html("CANCELAR"); 
}

function desactivarCamposCita(){
  $(".campo-hora-inicio").prop("disabled", true);
  $(".campo-hora-fin").prop("disabled", true);
  $(".campo-minuto-inicio").prop("disabled", true);
  $(".campo-minuto-fin").prop("disabled", true);
  $(".campo-titulo-cita").prop("disabled", true);
  $(".campo-descripcion").prop("disabled", true);
  $(".boton-cancelar-cita").html("REGRESAR"); 
}

//AGENDAR CITAS
function agendarCita(){
  var datos={
    agendarCita:1,
    fecha:fechaSeleccionada,
    horaInicio:$(".campo-hora-inicio").val(),
    minutoInicio:$(".campo-minuto-inicio").val(),
    horaFin:$(".campo-hora-fin").val(),
    minutoFin:$(".campo-minuto-fin").val(),
    titulo:$(".campo-titulo-cita").val(),
    descripcion:$(".campo-descripcion").val(),
    participantes:[]
  }

  $(".contenedor-participantes-agregados .participante-agregado").each(function(){
    datos.participantes.push($(this).attr("data-id"));
  });

  if(datos.titulo.trim()!=""){
    if(datos.participantes.length>0){
      if(Number(datos.horaInicio)<Number(datos.horaFin)||(Number(datos.horaInicio)==Number(datos.horaFin)&&Number(datos.minutoInicio)<Number(datos.minutoFin))){
        //Se hace el stringify hasta acá para que funcione la validación de length (si se hace sobre cadena [] NO es vacío)
        datos.participantes=JSON.stringify(datos.participantes);
        console.log(datos)
        $.ajax({
          url: "./lib_php/updCalendario.php",
          type: "POST",
          dataType: "json",
          data: datos
        }).always(function(respuesta_json){
          console.log(respuesta_json);
          if (respuesta_json.isExito == 1){
            alert("La cita se agendó exitosamente");
            $(".contenedor-citas-dia").css("display", "block");
            $(".contenedor-nueva-cita").css("display", "none");
            cargarCitasDia(fechaSeleccionada);
            cargarCalendario();
          }
          else{
            var conflictos=respuesta_json.datos.conflictos;
            if(conflictos.length>0){
              var mensaje="No se pudo agendar la cita, los siguientes usuarios tienen ocupada su agenda:\n"
              for(var i=0;i<conflictos.length;i++){
                for(var j=0;j<participantes.length;j++){
                  if(participantes[j].id==conflictos[i]){
                    mensaje+=participantes[j].paterno+" "+participantes[j].materno+" "+participantes[j].nombre+"\n";
                  }
                }
              }
              alert(mensaje);
            }
          }
        });
      }
      else{
        alert("La hora de inicio debe ser menor a la hora de fin");
      }
    }
    else{
      alert("Es necesario registrar al menos un participante");  
    }
  }
  else{
    alert("El nombre de la reunión es obligatorio");
  }  
}


//Traer la lista de calendarios compartidos conmigo
function cargarCalendariosAbiertos(){
  var datos={
    calendariosCompartidos:1    
  }

  $.ajax({
    url: "./lib_php/updCalendario.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json.datos);
    if (respuesta_json.isExito == 1){
      var autorizadosExito=respuesta_json.datos.autorizados;
      var elemHTML='';
      if(autorizadosExito.length>0){
        for(var i=0;i<autorizadosExito.length;i++){
            elemHTML+='<div class="calendario-abierto" data-id="'+autorizadosExito[i].id+'">'+autorizadosExito[i].paterno+' '+autorizadosExito[i].materno+" "+autorizadosExito[i].nombre+'</div>';      
        }
        $(".contenedor-calendarios-compartidos").html(elemHTML);
        $(".calendario-abierto").click(function(){
          var idOtorgante=$(this).attr("data-id");
          nombreCalendarioSeleccionado=$(this).html();
          cargarCalendarioAjeno(idOtorgante);
        });
      }
    }
  });
}

function cargarCalendarioAjeno(idOtorgante){
  calendarioSeleccionado=idOtorgante;
  $(".calendario-abierto").removeClass("calendario-ajeno-activo");
  $(".calendario-abierto[data-id='"+idOtorgante+"']").addClass("calendario-ajeno-activo");
  $(".contenedor-celda-autorizados").hide();
  $(".contenedor-titulo .celda").html("Calendario de "+nombreCalendarioSeleccionado);
  $(".contenedor-ver-mi-calendario").show();
  cargarCalendario();
}

function cargarMiCalendario(){
  calendarioSeleccionado=-1;
  $(".calendario-abierto").removeClass("calendario-ajeno-activo");
  $(".contenedor-celda-autorizados").show();
  $(".contenedor-titulo .celda").html("Mi Calendario");
  $(".contenedor-ver-mi-calendario").hide();
  
  cargarCalendario();
}

/*Traer la lista de usuarios autorizados*/
function cargarUsuariosAutorizados(){
  var datos={
    listaAutorizados:1
  }
  $.ajax({
    url: "./lib_php/updCalendario.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json)
    if (respuesta_json.isExito == 1){
      console.log(respuesta_json.datos);

      var respuestaUsuarios = respuesta_json.datos;

      for(let i=0;i<respuestaUsuarios.length;i++){
        autorizados.push(respuestaUsuarios[i]);
      }

      console.log(respuesta_json.datos);
      
      if(respuesta_json.datos.length>0){

        var autorizadosRespuesta=respuesta_json.datos;
        var elemHTML='';

        for(var i=0;i<autorizadosRespuesta.length;i++){
          console.log("ENTRA");
          elemHTML+=''+
          '<div class="autorizado-agregado" data-id="'+autorizadosRespuesta[i].id+'">'+
            '<span class="boton-eliminar-autorizado" data-id="'+autorizadosRespuesta[i].id+'">X</span>'+autorizadosRespuesta[i].paterno+' '+autorizadosRespuesta[i].materno+' '+autorizadosRespuesta[i].nombre+
          '</div>';
        }
      }
      else{
        var elemHTML="<div class='sin-resultados'>Nadie está autorizado para ver tu calendario</div>";
      }

      $(".contenedor-autorizados").html(elemHTML);

      $(".boton-eliminar-autorizado").click(function(){
        var idRemover=$(this).attr("data-id");
        removerAutorizado(idRemover);
        
        for(var i=0;i<autorizados.length;i++){
          if(autorizados[i].id==idRemover){
            autorizados.splice(i, 1);
            $(this).parent().remove();
          }
        }
      });
    }
  });
}

//USUARIOS AUTORIZADOS A ACCEDER A CALENDARIO
function registrarAutorizados(){
  var datos={
    actualizarAutorizados:1, 
    autorizados:[]
  }
  for(var i=0;i<autorizados.length;i++){
    datos.autorizados.push(autorizados[i].id);
  }
  datos.autorizados=JSON.stringify(datos.autorizados);

  console.log(datos);

  $.ajax({
    url: "./lib_php/updCalendario.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json);
    if (respuesta_json.isExito == 1){
      //La respuesta trae los usuarios a los que s eles dió el permiso con éxito
      var autorizadosExito=respuesta_json.datos.autorizados;
      var elemHTML='';

      if(autorizadosExito.length>0){

        for(var i=0;i<autorizadosExito.length;i++){

          for(var j=0;j<usuarios.length;j++){
            if(usuarios[j].id==autorizadosExito[i]){
              elemHTML+=''+
                '<div class="autorizado-agregado" data-id="'+usuarios[j].id+'">'+
                  '<span class="boton-eliminar-autorizado" data-id="'+usuarios[j].id+'">X</span>'+usuarios[j].paterno+' '+usuarios[j].materno+' '+usuarios[j].nombre+
                '</div>';      
            }
          }          
        }
      }
      else{
        elemHTML='Nadie está autorizado para ver tu calendario';
      }
      $(".contenedor-autorizados").html(elemHTML);

      $(".boton-eliminar-autorizado").click(function(){
        var idRemover=$(this).attr("data-id");

        removerAutorizado(idRemover);
        
        for(var i=0;i<autorizados.length;i++){
          if(autorizados[i].id==idRemover){
            autorizados.splice(i, 1);
            $(this).parent().remove();
          }
        }
      });
    }
  });
  // cargarCalendario();
}

function removerAutorizado(idRemover){
  console.log("QUITAR AUTORIZACION A "+idRemover);

  if(window.confirm("¿Confirma que desea retirar la autorización?")){
      
    //REMOVER EN BASE DE DATOS Y SI ES ÉXITO, QUITARLO DE INTERFAZ
    var componenteRemover=$(".contenedor-eliminar-autorizado[data-id='"+idRemover+"']").parent();
    var datos={
      eliminarAutorizado:1,
      id:idRemover
    }
    $.ajax({
      url: "./lib_php/updCalendario.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if(respuesta_json.isExito == 1){
        for(var i=0;i<autorizados.length;i++){
          if(autorizados[i].id==idRemover){
            console.log("ENTRA "+idRemover);
            autorizados.splice(i, 1);
            componenteRemover.remove();
            if(autorizados.length==0){
              var elemHTML="<div style='font-size:13px'>Nadie está autorizado para ver tu calendario</div>";
              $(".contenedor-autorizados").html(elemHTML);
            }
            break;
          }
        }
      }
      else{
        alert("Ocurrió un error, por favor intenta nuevamente");
      }
    });
  }
}

function mostrarAgendarCita(event){
  if(calendarioSeleccionado==-1){
    var hora=$(event.target).closest(".contenedor-hora").find(".etiqueta-hora").attr("data-hora");

    horaSeleccionada=hora;

    $(".titulo-nueva-cita").html("Agendar Cita ("+fechaSeleccionada+")")
    $(".contenedor-nueva-cita").css("display", "block");
    $(".contenedor-citas-dia").css("display", "none");
    
    $(".boton-modificar-cita").hide();
    $(".boton-agendar-cita").show();
    
    $(".contenedor-aceptar-rechazar").html("");

    $(".campo-hora-inicio").val(horaSeleccionada);
    $(".campo-hora-fin").val(Number(horaSeleccionada)+1);
    $(".campo-minuto-inicio").val(0);
    $(".campo-minuto-fin").val(0);
    $(".campo-titulo-cita").val("");
    $(".campo-descripcion").val("");
    //Inicializar la lista de participantes, con sólo el organizador

    participantes=[{
      id:idUsuario,
      nombre:nombreUsuario,
      paterno:paternoUsuario,
      materno:maternoUsuario,
      area:areaUsuario
    }];  

    refrescarEnAgregar = -1;
    refrescarParticipantes();

    
  }
}


function refrescarParticipantes(){
  var elemHTML='';
  if(participantes.length>0){
    for(var i=0;i<participantes.length;i++){

      elemHTML+='<div class="participante-agregado" data-id="'+participantes[i].id+'">&nbsp;';
      if(calendarioSeleccionado==-1){
        elemHTML+='<span class="contenedor-eliminar-participante" data-id="'+participantes[i].id+'">X</span>';
      }
      elemHTML+='&nbsp;&nbsp;'+participantes[i].nombre+' '+participantes[i].paterno+' '+participantes[i].materno+'</div>';  
    }
  }
  else{
    elemHTML='No hay participantes agregados para esta cita';
  }
  $(".contenedor-participantes-agregados").html(elemHTML);
  $(".contenedor-eliminar-participante").click(function(){ 
    var idRemover=$(this).attr("data-id");
    for(var i=0;i<participantes.length;i++){
      if(participantes[i].id==idRemover){
        participantes.splice(i, 1);
        $(this).parent().remove();
      }
    }
  });
  if(calendarioSeleccionado==-1 && refrescarEnAgregar==-1){
    $(".boton-agregar-participantes").show();
  }
  else{
    $(".boton-agregar-participantes").hide(); 
  }
}

function cancelarNuevaCita(){
  console.log("ENTRA");
  $(".contenedor-citas-dia").show();
  $(".contenedor-nueva-cita").hide();
}

$( window ).resize(function() {
  ajustarElementos();
});


$(window).load(function() {
  ajustarElementos();
})

$(document).ready(function() {
  ajustarElementos();
  
  cargarListaAreas();
  cargarUsuarios();
  // cargarUsuariosAreas();
  inicializarCalendario();

  archivoFoto=new ComponenteFotografia();
  archivoFoto.inicializarComponenteFotografia($(".contenedor-campo-foto")); 

  archivoFirma=new ComponenteFotografia();
  archivoFirma.inicializarComponenteFotografia($(".contenedor-campo-firma")); 

  /*CALENDARIO*/
  cargarCalendario();
  cargarUsuariosAutorizados();
  cargarCalendariosAbiertos();
  cargarVacacionesPermisos();
  agregarListeners();

});


function agregarListeners(){
  $(".campo-area").change(filtrarPuestos);
  $(".boton-guardar-perfil").click(guardarPerfil);
  $(".boton-guardar-contasenia").click(guardarContrasenia);
  $(".campo-confirmar-contrasenia").keyup(function(e){
    if(e.keyCode == 13){
      guardarContrasenia();
  }
  });

}

function ajustarElementos(){
  
}

var areas=[];
function cargarListaAreas(){
  var datos={
    listadoActivas:1
  };
  
  $.ajax({
    url: "./lib_php/updAreas.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json)
    if (respuesta_json.isExito == 1){
      areas=respuesta_json.datos;
      var elemHTML=''+
      '<option value="0">Seleccione</option>';
      for(i=0;i<respuesta_json.datos.length;i++){
        elemHTML+='<option value="'+respuesta_json.datos[i]["id"]+'">'+respuesta_json.datos[i]["nombre"]+'</option>';
      }
      $(".campo-area").html(elemHTML);
      $(".filtro-area").html(elemHTML);
      $(".filtro-area-autorizados").html(elemHTML);

      //Cargar el formulario de sucursales, y al terminar, los datos del usuario
      cargarListaSucursales();
    }
  });
}

var sucursales=[];
function cargarListaSucursales(){
  var datos={
    listadoActivas:1
  };
  $.ajax({
    url: "./lib_php/updSucursales.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json)
    if (respuesta_json.isExito == 1){
      sucursales=respuesta_json.datos;
      var elemHTML=''+
      '<option value="-1">Seleccione una sucursal</option>';
      for(i=0;i<respuesta_json.datos.length;i++){
        elemHTML+='<option value="'+respuesta_json.datos[i]["id"]+'">'+respuesta_json.datos[i]["nombre"]+'</option>';
      }
      $(".campo-sucursal").html(elemHTML);

      //Poblar el formulario con los datos del usuario
      cargarPuestos();
      
    }
  });
}

function cargarPuestos(){
  var datos={
    listaPuestos:1
  };
  $.ajax({
    url: "./lib_php/updPuestos.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json)
    if (respuesta_json.isExito == 1){
      puestos=respuesta_json.datos;
      cargarDatosUsuario();
    }
  });
}


function filtrarPuestos(){
  console.log(puestos);
  var areaSeleccionada=$(".campo-area").val();
  //console.log(areaSeleccionada)
  var htmlPuestos='';
  for(var i=0;i<puestos.length;i++){
    if(puestos[i].idArea==areaSeleccionada){
      htmlPuestos+=`<option value="`+puestos[i].id+`">`+puestos[i].nombre+`</option>`;      
    }
    $("select.campo-puesto").html(htmlPuestos);
  }
}


function cargarDatosUsuario(){
  var datos={
    id:-1,
    detalle:1
  }
  $.ajax({
    url: "./lib_php/updUsuarios.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json.datos)
    if (respuesta_json.isExito == 1){

      if(respuesta_json.datos.comercial==1||respuesta_json.datos.comercial=="1"){
        usuarioComercial=true;
      }

      var datosUsuario=respuesta_json.datos;

      idUsuario=datosUsuario.id;
      nombreUsuario=respuesta_json.datos.nombre;
      paternoUsuario=respuesta_json.datos.paterno;
      maternoUsuario=respuesta_json.datos.materno;
      areaUsuario=areaString(datosUsuario.area);
      $(".campo-nombre").val(datosUsuario.nombre);
      $(".campo-paterno").val(datosUsuario.paterno);
      $(".campo-materno").val(datosUsuario.materno);
      $(".campo-fecha-nacimiento").val(datosUsuario.nacimiento);
      $(".campo-estado-civil").val(datosUsuario.estadoCivil);
      $(".campo-nacionalidad").val(datosUsuario.nacionalidad);
      $(".campo-numero-hijos").val(datosUsuario.numeroHijos);
      $("select.campo-sexo").val(datosUsuario.sexo);

      $(".campo-telefono").val(datosUsuario.telefono);
      $(".campo-extension").val(datosUsuario.extension);
      $(".campo-celular").val(datosUsuario.celular);
      $(".campo-correo-personal").val(datosUsuario.correoPersonal);
      $(".campo-direccion").val(datosUsuario.direccion);
      $(".campo-colonia").val(datosUsuario.colonia);
      $(".campo-codigo-postal").val(datosUsuario.cp);
      $(".campo-municipio").val(datosUsuario.municipio);

      $(".campo-correo").val(datosUsuario.correo);

      $(".campo-sucursal").val(datosUsuario.sucursal);
      $(".campo-area").val(datosUsuario.area);
      $(".campo-puesto").val(datosUsuario.puestoCatalogo);
      $(".campo-jefe").val(datosUsuario.nombreJefe);
      $(".campo-seguro").val(datosUsuario.nss);
      $(".campo-curp").val(datosUsuario.curp);
      $(".campo-rfc").val(datosUsuario.rfc);
      $(".campo-ingreso").val(datosUsuario.ingreso);

      $(".campo-enfermedades").val(datosUsuario.enfermedades);
      $(".campo-alergias").val(datosUsuario.alergias);
      $(".campo-tipo-sangre").val(datosUsuario.tipoSangre);
      $(".campo-contacto-emergencia").val(datosUsuario.nombreEmergencia);
      $(".campo-telefono-emergencia").val(datosUsuario.telefonoEmergencia);

      $(".dato-nombre").html(datosUsuario.nombre);
      $(".dato-paterno").html(datosUsuario.paterno);
      $(".dato-materno").html(datosUsuario.materno);
      $(".dato-fecha-nacimiento").html(datosUsuario.nacimientoNormal);
      $(".dato-sexo").html(sexoString(datosUsuario.sexo));

      $(".dato-telefono").html(datosUsuario.telefono);
      $(".dato-extension").html(datosUsuario.extension);

      $(".dato-correo").html(datosUsuario.correo);

      $(".dato-sucursal").html(sucursalString(datosUsuario.sucursal));
      $(".dato-area").html(areaString(datosUsuario.area));
      $(".dato-puesto").html(puestoString(datosUsuario.puestoCatalogo));
      $(".dato-jefe").html(datosUsuario.nombreJefe);
      $(".dato-ingreso").html(datosUsuario.ingresoNormal);

      filtrarPuestos();
      archivoFoto.setArchivo(datosUsuario.foto);
      archivoFirma.setArchivo(datosUsuario.firma);

      if(usuarioComercial){
        var HTMLinput = `<input type="radio" value="2" name="tipo-solicitud" id="radio-comercial" class="campo-tipo-solicitud">
        <label for="solicitar-vaciones">Solicitar permiso comercial.</label>`;

        $(".contenedor-tipo-solicitud").append(HTMLinput);
      }
      else{
        $(".contenedor-formato-comercial").remove();
      }

      $(".campo-tipo-solicitud").change(function(){
        if($("#radio-vacaciones").prop("checked")){
          $(".contenedor-formato-permisos").hide();
          $(".contenedor-formato-vacaciones").show();
          $(".contenedor-formato-comercial").hide();
        }
        else{
          if($("#radio-permisos").prop("checked")){
            $(".contenedor-formato-permisos").show();
            $(".contenedor-formato-vacaciones").hide();
            $(".contenedor-formato-comercial").hide();
          }
          else{
            if($("#radio-comercial").prop("checked")){
              $(".contenedor-formato-permisos").hide();
              $(".contenedor-formato-vacaciones").hide();
              $(".contenedor-formato-comercial").show();
            }
          }
        }
      });
      cargarUsuarios();
    }
  });
}

function inicializarCalendario(){
  $(".contenedor-hora").click(mostrarAgendarCita);

  //POPUP PARTICIPANTE
  var contenedorParticipantes = $(".celda-participantes-citas");

  $(".boton-agregar-participantes").click(function(){

    var contenedorParticipantesPopup = contenedorParticipantes;

    mostrarPopup(800, 600);
    cargarPopup(contenedorParticipantesPopup);
    
    $(".contenedor-agregar-participante").css("display", "block");
    $(".boton-agregar-participantes").hide();

    $("select.filtro-area").change(filtrar);
    $(".filtro-nombre").keyup(function(){filtrar();});
  });

  //CANCELAR PARTICIPANTE
  $(".boton-cancelar-participante").click(function(){
    $(".contenedor-agregar-participante").css("display", "none");
    $(".contenedor-campo-participantes-cita").css("display", "block");

    $("select.filtro-area").val(0);
    $(".resultados-filtro-participantes").html("");

    contenedorParticipantesPopup = $(".celda-participantes-citas");
    $(".celda-participantes-principal").html(contenedorParticipantesPopup);

    refrescarEnAgregar = -1;
    refrescarParticipantes();

    cerrarPopup();
  });

  $(".boton-cancelar-autorizados").hide();
  $(".contenedor-agregar-autorizados").hide();

  //POPUP AUTORIZADOS
  var contenedorAutorizados = $(".celda-autorizados");

  //AGREGAR AUTORIZADOS
  $(".boton-agregar-autorizados").click(function(){
    var contenedorAutorizadosPopup = contenedorAutorizados;
    
    mostrarPopup(800, 600);
    cargarPopup(contenedorAutorizadosPopup);

    $(".contenedor-autorizados").css("display", "block");
    $(".contenedor-agregar-autorizados").show();
    $(".boton-cancelar-autorizados").show();
    $(".boton-agregar-autorizados").hide();

    $("select.filtro-area-autorizados").change(filtrarAutorizar);
    $(".filtro-nombre-autorizados").keyup(function(){filtrarAutorizar();});
    //limpiarFiltrosAutorizar();
  });

  $(".boton-cancelar-autorizados").click(function(){
    $(".contenedor-agregar-autorizados").css("display", "none");
    $("select.filtro-area-autorizados").val(0);
    $(".resultados-filtro-autorizados").html("");
    $(".boton-agregar-autorizados").show();
    $(".contenedor-agregar-autorizados").hide();

    contenedorAutorizadosPopup = $(".celda-autorizados");
    $(".celda-autorizados-principal").html(contenedorAutorizadosPopup);

    registrarAutorizados();
    cerrarPopup();
  });
  
  // $(".mascara-popup").click(function (){
  //   $(".contenedor-agregar-autorizados").css("display", "none");
  //   $("select.filtro-area-autorizados").val(0);
  //   $(".resultados-filtro-autorizados").html("");
  //   $(".boton-agregar-autorizados").show();
  //   $(".contenedor-agregar-autorizados").hide();

  //   contenedorAutorizadosPopup = $(".celda-autorizados");

  //   $(".celda-autorizados-principal").html(contenedorAutorizadosPopup);
  //   cerrarPopup();
  // });

  //CANCELAR AUTORIZADOS
  $(".boton-cancelar-cita").click(function(){
    $(".contenedor-citas-dia").css("display", "block");
    $(".contenedor-nueva-cita").css("display", "none");
  });


  $(".boton-agendar-cita").click(function(){
    $(".contenedor-nueva-cita").show();
    $(".contenedor-citas").hide();
    $(".contenedor-agregar-participante").hide();
    agendarCita();
    
  });

  $(".boton-ver-mi-calendario").click(cargarMiCalendario);  

}


function filtrar(){
  var areaSeleccionada=$(".filtro-area").val();
  var nombreFiltro=$(".filtro-nombre").val();
  var resultados=[];
  for(var i=0;i<usuarios.length;i++){
    var areaCoincide=false;
    if(areaSeleccionada!=-1){
      if(areaSeleccionada==usuarios[i].idArea){
        areaCoincide=true;
      }
    }
    else{
      areaCoincide=true;
    }

    var nombreCoincide=false;
    if(nombreFiltro!=""){
      
      if(accentsTidy((usuarios[i].paterno+" "+usuarios[i].materno+" "+usuarios[i].nombre).toLowerCase()).indexOf(accentsTidy(nombreFiltro.toLowerCase()))!=-1){
        nombreCoincide=true;
      }
    }
    else{
      nombreCoincide=true;
    }

    var yaAgregado=false;
    for(var j=0;j<participantes.length;j++){
      if(participantes[j].id==usuarios[i].id){
        yaAgregado=true;
      }
    }
    if(areaCoincide&&nombreCoincide&&!yaAgregado){
      resultados.push(usuarios[i]);
    }
  }

  var elemHTML='';
  if(resultados.length>0){
    for(var i=0;i<resultados.length;i++){
      elemHTML+='<!--div class="contenedor-participantes-agregados"--><div class="participante-agregado" data-id="'+resultados[i].id+'">'+resultados[i].paterno+' '+resultados[i].materno+" "+resultados[i].nombre+'</div><!--/div-->';
    }
    $(".resultados-filtro-participantes").html(elemHTML);
  }
  else{
    elemHTML='No se encontraron resultados';
    $(".resultados-filtro-participantes").html(elemHTML); 
  }

  $(".resultados-filtro-participantes .participante-agregado").click(function(){
    var idAgregar=$(this).attr("data-id");
    for(var i=0;i<usuarios.length;i++){
      if(usuarios[i].id==idAgregar){
        participantes.push(usuarios[i]);
      }
    }
    $(this).remove();
    refrescarEnAgregar = 1;
    refrescarParticipantes();
  }); 
}

function filtrarAutorizar(){
  var areaSeleccionada=$(".filtro-area-autorizados").val();
  var nombreFiltro=$(".filtro-nombre-autorizados").val();

  var resultados=[];

  for(var i=0;i<usuarios.length;i++){
    var areaCoincide=false;
    if(areaSeleccionada!=-1){
      if(areaSeleccionada==usuarios[i].idArea){
        areaCoincide=true;
      }
    }
    else{
      areaCoincide=true;
    }

    var nombreCoincide=false;
    if(nombreFiltro!=""){
      
      if(accentsTidy((usuarios[i].paterno+" "+usuarios[i].materno+" "+usuarios[i].nombre).toLowerCase()).indexOf(accentsTidy(nombreFiltro.toLowerCase()))!=-1){
        nombreCoincide=true;
      }
    }
    else{
      nombreCoincide=true;
    }

    var yaAgregado=false;
    for(var j=0;j<autorizados.length;j++){
      if(autorizados[j].id==usuarios[i].id){
        yaAgregado=true;
      }
    }
    if(areaCoincide&&nombreCoincide&&!yaAgregado){
      resultados.push(usuarios[i]);
    }
  }

  var elemHTML='';
  if(resultados.length>0){
    for(var i=0;i<resultados.length;i++){
      elemHTML+='<div class="autorizado-filtrado" data-id="'+resultados[i].id+'">'+resultados[i].paterno+' '+resultados[i].materno+" "+resultados[i].nombre+'</div>';
    }
    $(".resultados-filtro-autorizados").html(elemHTML);
  }
  else{
    elemHTML='No se encontraron resultados';
    $(".resultados-filtro-autorizados").html(elemHTML); 
  }

  $(".resultados-filtro-autorizados .autorizado-filtrado").click(function(){
    var idAgregar=$(this).attr("data-id");
    for(var i=0;i<usuarios.length;i++){
      if(usuarios[i].id==idAgregar){
        autorizados.push(usuarios[i]);
      }
    }
    $(this).remove();

    // console.log(autorizados);
    // refrescarAutorizados();
    registrarAutorizados();
  });
}

function refrescarAutorizados(){
  var elemHTML='';
  if(autorizados.length>0){
    for(var i=0;i<autorizados.length;i++){
      console.log(autorizados[i]);
      elemHTML+='<div class="autorizado-agregado" data-id="'+autorizados[i].id+'">&nbsp;<span class="boton-eliminar-autorizado" data-id="'+autorizados[i].id+'">X</span>&nbsp;&nbsp;'+autorizados[i].paterno+' '+autorizados[i].materno+" "+autorizados[i].nombre+'</div>';  
    }
  }
  else{
    elemHTML='<div class="autorizado-agregado">Tu calendario no ha sido compartido<div>';
  }
  $(".contenedor-autorizados").html(elemHTML);

  $(".boton-eliminar-autorizado").click(function(){
    var idRemover=$(this).attr("data-id");
    removerAutorizado(idRemover);
    
    for(var i=0;i<autorizados.length;i++){
      if(autorizados[i].id==idRemover){
        autorizados.splice(i, 1);
        $(this).parent().remove();
      }
    }
  });
}

function cargarUsuarios(){
  var datos={
    listaUsuarios:1,
    area:-1
  }
  $.ajax({
    url: "./lib_php/updUsuarios.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json)
    usuarios=respuesta_json.datos;
  });
}

function vacacionesPermisos(){
}

function sexoString(sexo){
  if(sexo==1){
    return "Hombre";
  }
  else{
    if(sexo==2){
      return "Mujer";
    }
  }
}

function sucursalString(sucursal){
  for(var i=0;i<sucursales.length;i++){
    if(sucursales[i].id==sucursal){
      return sucursales[i].nombre;
    }
  }
  return "";
}

function areaString(area){
  for(var i=0;i<areas.length;i++){
    if(areas[i].id==area){
      return areas[i].nombre;
    }
  }
  return "";
}

function puestoString(puesto){
  for(var i=0;i<puestos.length;i++){
    if(puestos[i].id==puesto){
      return puestos[i].nombre;
    }
  }
  return "";
}

function desglosarDateTime(dt){
  var partes=dt.split(" ");
  var fecha=partes[0];
  var hora=partes[1];
  partes=fecha.split("-");
  var resultado={
    anio:partes[0],
    mes:partes[1],
    dia:partes[2],
  }
  partes=hora.split(":");
  resultado.hora=partes[0];
  resultado.minuto=partes[1];
  resultado.segundo=partes[2];
  return resultado;
}

function cargarVacacionesPermisos(){
  cargarVacacionesEmpleado();

  $(".contenedor-formato-permisos").hide();
  $(".contenedor-formato-vacaciones").hide();
  $(".contenedor-formato-comercial").hide();
  $(".campos-permisos").hide();

  $(".campo-tipo-permiso").change(function(){
    if($(".campo-tipo-permiso:checked").length>0){
      $(".campos-permisos").show();
      $(".campo-tipo-permiso:not(:checked)").each(function(){
        $(this).parent().hide();
      });
    }
    else{
      $(".campos-permisos").hide();
      $(".campo-tipo-permiso:not(:checked)").each(function(){
        $(this).parent().show();
      });
    }

    $(".contenedor-fecha-inicio").hide();
    $(".campo-horas-inicio").hide();
    $(".campo-horas-fin").hide();

    //Tiempo determinado
    if($("#campo-tipo-permiso1").prop("checked")){
      $(".contenedor-fecha-inicio").show();
      $(".contenedor-fecha-fin").hide();
      $(".contenedor-horarios").show();
      $(".campo-texto-inicio").show();
      $(".campo-horas-inicio").show();
      $(".campo-horas-fin").show();
    }
    
    //Llegar tarde, salir temprano
    if($("#campo-tipo-permiso2").prop("checked")||$("#campo-tipo-permiso3").prop("checked")){
      $(".campo-texto-inicio").hide()
      $(".contenedor-fecha-inicio").show();
      $(".contenedor-fecha-fin").hide();
      $(".contenedor-horarios").show();
      $(".campo-horas-fin").show();
    }

    //Con goce de sueldo, sin goce de sueldo
    if($("#campo-tipo-permiso4").prop("checked")||$("#campo-tipo-permiso5").prop("checked")){
      $(".contenedor-fecha-inicio").show();
      $(".contenedor-fecha-fin").show();
      $(".contenedor-horarios").hide();
    }

    var htmlHorasFinales=''+
    '<option value="14">14</option>'+
    '<option value="15">15</option>'+
    '<option value="16">16</option>'+
    '<option value="17">17</option>'+
    '';

    var htmlHorasIniciales=''+
    '<option value="9">9</option>'+
    '<option value="10">10</option>'+
    '<option value="11">11</option>'+
    '<option value="12">12</option>'+
    '';

    var htmlTodoHorario=''+
    '<option value="9">9</option>'+
    '<option value="10">10</option>'+
    '<option value="11">11</option>'+
    '<option value="12">12</option>'+
    '<option value="13">13</option>'+
    '<option value="14">14</option>'+
    '<option value="15">15</option>'+
    '<option value="16">16</option>'+
    '<option value="17">17</option>'+
    '';

    //Ajustar las horas disponibles en los permisos
    if($("#campo-tipo-permiso1").prop("checked")){
      $(".filtro-hora-inicio").html(htmlTodoHorario);
      $(".filtro-hora-fin").html(htmlTodoHorario);
    }

    if($("#campo-tipo-permiso2").prop("checked")){
      $(".filtro-hora-fin").html(htmlHorasIniciales);
    }

    if($("#campo-tipo-permiso3").prop("checked")){
      $(".filtro-hora-fin").html(htmlHorasFinales);
    }
  });

  // $("#cb-permiso").click();

  $(".boton-solicitar-vacaciones").click(function(){
    var datos={
      validarSolicitudVacaciones:1,
      inicio:$(".campo-fecha-inicio-vacaciones").val(),
      fin:$(".campo-fecha-fin-vacaciones").val(),
    }

    console.log(datos);

    $.ajax({
      url: "./lib_php/updPermisosVacaciones.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if (respuesta_json.isExito == 1){
        var datos={
          solicitarVacaciones:1,
          fechaInicio:$(".campo-fecha-inicio-vacaciones").val(),
          fechaFin:$(".campo-fecha-fin-vacaciones").val()
        };
        console.log(datos);
        $.ajax({
          url: "./lib_php/updPermisosVacaciones.php",
          type: "POST",
          dataType: "json",
          data: datos
        }).always(function(respuesta_json){
          console.log(respuesta_json);
          if (respuesta_json.isExito == 1){
            $(".campo-fecha-inicio-vacaciones").val("");
            $(".campo-fecha-fin-vacaciones").val("");
            alert("Tu solicitud de vacaciones se generó exitosamente");
          }
        });
      }
      else{
        if(respuesta_json.codigo==-1){
          alert("Por favor revisa las fechas de tu solicitud");
        }
        else{
          if(respuesta_json.codigo==-2){
            alert("No tienes sesión inicada o ha expirado, por favor inicia sesión nuevamente");
          } 
          else{
            if(respuesta_json.codigo==-3){
              alert("No tienes días de vacaciones suficientes para las fechas de tu solicitud");
            } 
            else{
              if(respuesta_json.codigo==-4){
                alert("Las vacaciones deben solicitarse con al menos 5 días de anticipación");
              }
              else{
                if(respuesta_json.codigo==-5){
                  alert("No puedes solicitar más de 12 días hábiles de vacaciones");
                }
                else{
                  if(respuesta_json.codigo==-6){
                    alert("Debes solicitar al menos 2 días hábiles de vacaciones");
                  } 
                }
              }
            }
          }
        }
      }
    });
  });

  $(".boton-solicitar-permiso").click(function(){
    // $(".boton-solicitar-permiso").hide();

    if($(".campo-fecha-inicio").val()!=""){

      //Si es de tipo 1, validar que no hay mas de 5 horas de permiso
      var tipoPermiso=$(".campo-tipo-permiso:checked").attr("data-tipo");

      var horariosValidos=true;
  
      if(tipoPermiso==1){
        var horaInicio=new Date(2000,1,1,$(".filtro-hora-inicio").val(), $(".filtro-minuto-inicio").val(), 0,0);
        var horaFin=new Date(2000,1,1,$(".filtro-hora-fin").val(), $(".filtro-minuto-fin").val(), 0,0);
        var diferencia=horaFin.getTime()-horaInicio.getTime();

        if(diferencia<=0){
          horariosValidos=false;
          alert("La hora final debe ser mayor a la hora inicial del permiso");
        }

        if(diferencia>(1000*60*60*4)){
          horariosValidos=false
          alert("El tiempo máximo del permiso es de 4 horas.");
        }
      }
      if(horariosValidos){
        var datos={
          validarSolicitudPermiso:1,
          inicio:$(".campo-fecha-inicio").val(),
          tipo:tipoPermiso,
          fin:$(".campo-fecha-fin").val()
        }
        console.log(datos);
        $.ajax({
          url: "./lib_php/updPermisosVacaciones.php",
          type: "POST",
          dataType: "json",
          data: datos
        }).always(function(respuesta_json){

          console.log(respuesta_json); //

          if (respuesta_json.isExito == 1){
            var datos={
              solicitarPermiso:1,
              tipo:$(".campo-tipo-permiso:checked").attr("data-tipo"),
              fechaInicio:$(".campo-fecha-inicio").val(),
              fechaFin:$(".campo-fecha-fin").val(),
              horaInicio:$(".filtro-hora-inicio").val(),
              horaFin:$(".filtro-hora-fin").val(),
              minutoInicio:$(".filtro-minuto-inicio").val(),
              minutoFin:$(".filtro-minuto-fin").val(),
              motivo:$(".campo-texto-motivo").val()
            };

            console.log(datos);

            if(datos.motivo.trim()!=""){
              $.ajax({
                url: "./lib_php/updPermisosVacaciones.php",
                type: "POST",
                dataType: "json",
                data: datos
              }).always(function(respuesta_json){
                console.log(respuesta_json);
                if (respuesta_json.isExito == 1){
                  $(".campo-fecha-inicio").val("");
                  $(".campo-fecha-fin").val("");
                  $(".filtro-hora-inicio").val("8");
                  $(".filtro-hora-fin").val("8");
                  $(".filtro-minuto-inicio").val("00");
                  $(".filtro-minuto-fin").val("00");
                  $(".campo-texto-motivo").val("");
                  alert("Tu solicitud de permiso se generó exitosamente");
                  $(".boton-solicitar-permiso").show();
                }
              });
            }
            else{
              alert("Por favor indica el motivo de tu solicitud");
              $(".boton-solicitar-permiso").show();
            }
          
          }else{
            if(respuesta_json.codigo==-1){
              alert("Por favor revisa las fechas de tu solicitud");
              $(".boton-solicitar-permiso").show();
            }
            else{
              if(respuesta_json.codigo==-2){
                alert("No tienes sesión inicada o ha expirado, por favor inicia sesión nuevamente");

              } 
              else{
                if(respuesta_json.codigo==-3){
                  //alert("Los permisos deben solicitarse con al menos 2 días de anticipación");
                  alert("Los permisos deben solicitarse con al menos 1 día hábil de anticipación");
                  $(".boton-solicitar-permiso").show();
                } 
                else{
                  if(respuesta_json.codigo==-4){
                    //alert("Los permisos deben solicitarse con al menos 2 días de anticipación");
                    alert("Solo puedes solicitar 2 permisos durante un mes");
                    $(".boton-solicitar-permiso").show();
                  } 
                  else{
                    if(respuesta_json.codigo==-5){
                      //alert("Los permisos deben solicitarse con al menos 2 días de anticipación");
                      alert("Solo puedes solicitar 3 días sin goce de sueldo durante el año");
                      $(".boton-solicitar-permiso").show();
                    } 
                    else{
                      if(respuesta_json.codigo==-6){
                        //alert("Los permisos deben solicitarse con al menos 2 días de anticipación");
                        alert("Por favor verifica las fechas de tu permiso");
                        $(".boton-solicitar-permiso").show();
                      } 
                    }
                  }
                }
              }
            }
          }
        });           
      }
      else{
        $(".boton-solicitar-permiso").show();
      }
    }
    else{
      alert("Por favor, indica la fecha para la que solicitas permiso");
      $(".boton-solicitar-permiso").show();
    }
  });

  $(".boton-solicitar-permiso-comercial").click(function(){

    var datos={
      validarPermisoComercial:1,
      fecha:$(".campo-fecha-comercial").val(),
      horaInicio:$("select.filtro-hora-inicio-comercial").val()+":"+$("select.filtro-minuto-inicio-comercial").val(),
      horaFin:$("select.filtro-hora-fin-comercial").val()+":"+$("select.filtro-minuto-fin-comercial").val()
    }
    console.log(datos);
    if(datos.fecha==""){
      alert("La fecha de la solicitud es obligatoria");
    }else{
      $.ajax({
        url: "./lib_php/updPermisosVacaciones.php",
        type: "POST",
        dataType: "json",
        data: datos
      }).always(function(respuesta_json){
        console.log(respuesta_json);
        if (respuesta_json.isExito == 1){
          var datos={
            solicitarPermisoComercial:1,
            fecha:$(".campo-fecha-comercial").val(),
            horaInicio:$("select.filtro-hora-inicio-comercial").val()+":"+$("select.filtro-minuto-inicio-comercial").val(),
            horaFin:$("select.filtro-hora-fin-comercial").val()+":"+$("select.filtro-minuto-fin-comercial").val(),
            comentarios:$(".campo-motivo-comercial").val(),
            nombreCliente:$(".campo-cliente-comercial").val(),
            telefonoCliente:$(".campo-telefono-comercial").val()
          };
          console.log(datos);
          $.ajax({
            url: "./lib_php/updPermisosVacaciones.php",
            type: "POST",
            dataType: "json",
            data: datos
          }).always(function(respuesta_json){
            console.log(respuesta_json);
            if (respuesta_json.isExito == 1){
              $(".campo-fecha-comercial").val("");
              $("#campo-inicio-comercial").val("-1");
              $("#campo-fin-comercial").val("-1");
              $(".campo-motivo-comercial").val("");
              $(".campo-cliente-comercial").val("");
              $(".campo-telefono-comercial").val("");
              alert("Tu solicitud de permiso comercial generó exitosamente");
            }
          });
        }
        else{
          if(respuesta_json.codigo==-1){
            alert("Revisa la fecha de tu solicitud");
          }
          else{
            if(respuesta_json.codigo==-2){
              alert("No tienes sesión inicada o ha expirado, por favor inicia sesión nuevamente");
            } 
            else{
              if(respuesta_json.codigo==-3){
                alert("Ya utilizaste el tiempo disponible para permisos comerciales esta semana");
              } 
              else{
                if(respuesta_json.codigo==-4){
                  alert("Tu solicitud de permiso excede el tiempo disponible para permisos comerciales por semana");
                }
                else{
                  if(respuesta_json.codigo==-5){
                    alert("Revisa los horarios de tu solicitud");
                  } 
                }
              }
            }
          }
        }
      });
    }
  });
}

function cargarVacacionesEmpleado(){
  var datos={
    consultarVacaciones:1
  };
  console.log(datos);
  $.ajax({
    url: "./lib_php/updPermisosVacaciones.php",
    type: "POST",
    dataType: "json",
    data: datos
  }).always(function(respuesta_json){
    console.log(respuesta_json);
    var htmlTabla='';
    if (respuesta_json.isExito == 1){

      var vacaciones = respuesta_json.datos;
      var configuracionTabla={
        titulos:["Fecha", "Cantidad", "Concepto"],
        campos:["fecha","cantidad", "concepto"],
        clases:["columna-fecha", "columna-cantidad", "columna-concepto"],
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

      var sumaDiasVacaciones = respuesta_json.datos;
      var resultadoDiasVaciones = 0;
      console.log(sumaDiasVacaciones)

      for(var i=0;i<sumaDiasVacaciones.length; i++){
        resultadoDiasVaciones += sumaDiasVacaciones[i].cantidad;
      }

      htmlTabla+=crearTabla(vacaciones, configuracionTabla); 
    
      // if(respuesta_json.datos.length>0){
      //   var saldoVacaciones=0;
      //   htmlTabla=''+
      //   '<div class="encabezado-tabla">'+
      //     '<div class="celda-tabla ancho-15">Fecha</div>'+
      //     '<div class="celda-tabla ancho-10">Días</div>'+
      //     '<div class="celda-tabla ancho-75">Concepto</div>'+
      //   '</div>'+
      //   '';
      //   for(var i=0;i<respuesta_json.datos.length;i++){
      //     saldoVacaciones+=Number(respuesta_json.datos[i].cantidad);
      //     htmlTabla+=''+
      //       '<div class="fila-tabla">'+
      //         '<div class="celda-tabla ancho-15">'+respuesta_json.datos[i].fecha+'</div>'+
      //         '<div class="celda-tabla ancho-10">'+respuesta_json.datos[i].cantidad+'</div>'+
      //         '<div class="celda-tabla ancho-75">'+respuesta_json.datos[i].concepto+'</div>'+
      //       '</div>'+
      //       '';
      //   }
      //   htmlTabla+=
      //       '<div class="fila-total">'+
      //         '<div class="celda-tabla ancho-15"></div>'+
      //         '<div class="celda-tabla ancho-10">'+saldoVacaciones+'</div>'+
      //         '<div class="celda-tabla ancho-75"></div>'+
      //       '</div>'+
      //       '';
      // }
      // else{
      //   htmlTabla+='No tienes movimientos en tu expediente de vacaciones';
      // }
      // $(".contenedor-historial").html(htmlTabla);
    }
    $(".contenedor-historial").html(htmlTabla);
    $(".contenedor-vacaciones-disponibles").html("Días de vacaciones disponibles: "+resultadoDiasVaciones);

    $(".eliminar-elemento").hide();
  });
}

accentsTidy = function(s){
    var r=s.toLowerCase();
    r = r.replace(new RegExp(/\s/g),"");
    r = r.replace(new RegExp(/[àáâãäå]/g),"a");
    r = r.replace(new RegExp(/æ/g),"ae");
    r = r.replace(new RegExp(/ç/g),"c");
    r = r.replace(new RegExp(/[èéêë]/g),"e");
    r = r.replace(new RegExp(/[ìíîï]/g),"i");
    r = r.replace(new RegExp(/ñ/g),"n");                
    r = r.replace(new RegExp(/[òóôõö]/g),"o");
    r = r.replace(new RegExp(/œ/g),"oe");
    r = r.replace(new RegExp(/[ùúûü]/g),"u");
    r = r.replace(new RegExp(/[ýÿ]/g),"y");
    r = r.replace(new RegExp(/\W/g),"");
    return r;
};

function cargarUsuariosAreas() {
  $("#test-areas").html("<h1> hola </h1>");
}