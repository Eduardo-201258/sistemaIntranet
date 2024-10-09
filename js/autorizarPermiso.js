$(document).ready(function(){

  detalleSolicitudPermiso();
  agregarListeners();
   
});

function agregarListeners(){
  $(".boton-validar-solicitud").click(function(){
    var datos={
      autorizarPermiso:1,
      idSolicitud:idSolicitud,
      observaciones:$(".campo-observaciones").val()
    };

    $.ajax({
      url: "./lib_php/updPermisosVacaciones.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if(respuesta_json.isExito==1){
          alert("La solicitud fue autorizada exitosamente");
          $(".boton-rechazar-solicitud").remove();
          $(".boton-validar-solicitud").remove();
          $("input").attr("disabled", "disabled");
          $("textarea").attr("disabled", "disabled");
          $(".contenedor-acciones-rh").html("Solicitud procesada");
      }
      else{
          alert("Hubo un error al autorizar la solicitud");
      }
    });
  });


  $(".boton-rechazar-solicitud").click(function(){
    var datos={
      rechazarPermiso:1,
      idSolicitud:idSolicitud,
      observaciones:$(".campo-observaciones").val()
    };

    $.ajax({
      url: "./lib_php/updPermisosVacaciones.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if(respuesta_json.isExito==1){
        alert("La solicitud fue rechazada exitosamente");
        $(".boton-rechazar-solicitud").remove();
        $(".boton-validar-solicitud").remove();
        $("input").attr("disabled", "disabled");
        $("textarea").attr("disabled", "disabled");
      }
      else{
        alert("Hubo un error al rechazar la solicitud");
      }
    });
  });


  $(".boton-validar-solicitud-rh").click(function(){
    var datos={
      autorizarPermisoRH:1,
      idSolicitud:idSolicitud
    };
    $.ajax({
      url: "./lib_php/updPermisosVacaciones.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if (respuesta_json.isExito == 1){
        $(".contenedor-acciones-rh").html("La solicitud fue validada exitosamente");
      }
    });
  });

  $(".boton-rechazar-solicitud-rh").click(function(){
    var datos={
      rechazarPermisoRH:1,
      idSolicitud:idSolicitud
    };
    
    $.ajax({
      url: "./lib_php/updPermisosVacaciones.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if (respuesta_json.isExito == 1){
        $(".contenedor-acciones-rh").html("La solicitud fue rechazada exitosamente");
      }
    });
  });
}

function detalleSolicitudPermiso(){
    var datos={
      detalleSolicitudPermiso:1,
      idSolicitud:idSolicitud
    }
    $.ajax({
      url: "./lib_php/updPermisosVacaciones.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);

      var datosUsuario = respuesta_json.datos;

      if (respuesta_json.isExito == 1){
        console.log(datosUsuario);

        //Ocultar campos, de acuerdo al tipo de permiso
        $(".campo-nombre-colaborador").val(datosUsuario.usuario);
        $(".campo-area").val(datosUsuario.area);
        $(".campo-fecha-ingreso").val(datosUsuario.ingreso);
        $(".campo-tipo-permiso").val(datosUsuario.tipo);
        $(".campo-fecha-solicitud").val(datosUsuario.inicioSolicitud);
        $(".campo-fecha-fin-solicitud").val(datosUsuario.finSolicitud);
        $(".campo-hora-entrada").val(datosUsuario.horaInicio);
        $(".campo-hora-salida").val(datosUsuario.horaFin);
        $(".campo-motivo").val(datosUsuario.motivo);
        $(".campo-observaciones").val(datosUsuario.observaciones);

        //Llegar tarde
        if(datosUsuario.idTipo=="2"){
            $(".contenedor-campo-hora-entrada").hide();
            $(".contenedor-campo-fecha-fin-solicitud").hide();
        }
        else{
          //Salir temprano
          if(datosUsuario.idTipo=="3"){
              $(".contenedor-campo-hora-entrada").hide();
              $(".contenedor-campo-fecha-fin-solicitud").hide();
          } 
          else{
            //Faltar con goce
            if(datosUsuario.idTipo=="4"){
              $(".contenedor-campo-hora-entrada").hide();
              $(".contenedor-campo-hora-salida").hide();
              $(".campo-fecha-fin-solicitud").hide();
            } 
            else{
              //Faltar sin goce
              if(datosUsuario.idTipo=="5"){
                $(".contenedor-campo-hora-entrada").hide();
                $(".contenedor-campo-hora-salida").hide()
              } 
            }
          }
        }

        if(datosUsuario.autorizado!="0"){

          var estatus=" aceptada ";
          
          if(datosUsuario.autorizado=="2"||datosUsuario.autorizado==2){

            estatus=" rechazada ";
            $(".contenedor-acciones-rh").html("La solicitud fue rechazada por el jefe directo.");

          }else{

            $(".contenedor-boton-solicitudes").html("La solicitud fue"+estatus+"el "+datosUsuario.autorizacion);
            $(".campo-observaciones").prop("disabled", true);

          }
        }else{
          // $("#campo-inicio-otorgada").val(respuesta_json.datos.inicioSolicitud);
          // $("#campo-fin-otorgada").val(respuesta_json.datos.finSolicitud);
          $(".contenedor-acciones-rh").html("La solicitud no ha sido procesada por el jefe directo.");
        }
        if(datosUsuario.estatusRH!=0){
          var estatusRH="";
          if(datosUsuario.estatusRH==1){
            estatusRH="La solicitud fue validada por Capital Humano el "+datosUsuario.fechaRH+" a las "+datosUsuario.horaRH;
          }
          else{
            estatusRH="La solicitud fue cancelada por Capital Humano el "+datosUsuario.fechaRH+" a las "+datosUsuario.horaRH;  
          }
          $(".contenedor-acciones-rh").html(estatusRH);
          $(".detalle-autorizado-rh").remove();
        }
      }
    });  
}