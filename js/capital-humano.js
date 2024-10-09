var idUsuario;
var idPuesto;

function ajustarElementos(){  
}

$(document).ready(function() {
  ajustarElementos(); //Obligatoria
  cargarAsuetos(); 
  filtrarAreas();
  cargarSolicitudes();
  cargarPuestos();
  cargarNivelesDeDominio();
  agregarListeners(); //Obligatoria
});

$(window).resize(function() {
  ajustarElementos();
});

$(window).load(function() {
  ajustarElementos();
});

function agregarListeners(){
    $(".contenedor-fecha-asueto").css("display", "none");
    $(".contenedor-tipo-permisos").css("display", "none");

    $(".boton-mostrar-dia").click(function (){
        $(".contenedor-asuetos").css("display", "none");
        $(".contenedor-fecha-asueto").css("display", "block");
    });
    $(".boton-agregar-dia").click(insertarAsueto);

    $(".boton-cancelar-dia").click(function (){
        $(".campo-fecha-asuesto").val("");
        // $(".contenedor-asuetos").css("display", "block");
        $(".contenedor-asuetos").show();
        $(".contenedor-fecha-asueto").hide();
    });


    //PERMISOS - Despliega contenedor-formulario
    $(".boton-mostrar-permiso").click(function(){
        $(".contenedor-tabla-permisos").hide();
        $(".contenedor-tipo-permisos").hide();
        $(".contenedor-anadir-permisos").show();
        $(".campos-permisos-adm").hide();

        $(".contenedor-administrar-permisos .contenedor-titulo .celda").html("ADMINISTRACIÓN DE PERMISOS Y VACACIONES - Agregar permiso.");

        $(".campo-adm-tipo-permiso").change(function(){
            if($(".campo-adm-tipo-permiso:checked").length>0){
                $(".campos-permisos-adm").show();
                $(".campo-adm-tipo-permiso:not(:checked)").each(function(){
                    $(this).parent().hide();
                });
            }
            else{
                $(".campos-permisos-adm").hide();
                $(".campo-adm-tipo-permiso:not(:checked)").each(function(){
                    $(this).parent().show();
                });
            }
        
            $(".contenedor-fecha-inicio-adm").hide();
            $(".campo-horas-inicio-adm").hide();
            $(".campo-horas-fin-adm").hide();
        
            //Tiempo determinado
            if($("#campo-adm-tipo-permiso1").prop("checked")){
                $(".contenedor-fecha-inicio-adm").show();
                $(".contenedor-fecha-fin-adm").hide();
                $(".contenedor-horarios-adm").show();
                $(".campo-texto-inicio-adm").show();
                $(".campo-horas-inicio-adm").show();
                $(".campo-horas-fin-adm").show();
            }
        
            //Llegar tarde, salir temprano
            if($("#campo-adm-tipo-permiso2").prop("checked")||$("#campo-adm-tipo-permiso3").prop("checked")){
                $(".campo-texto-inicio").hide()
                $(".contenedor-fecha-inicio-adm").show();
                $(".contenedor-fecha-fin-adm").hide();
                $(".contenedor-horarios-adm").show();
                $(".campo-texto-inicio-adm").hide();
                $(".campo-horas-fin-adm").show();
            }
        
            //Con goce de sueldo, sin goce de sueldo
            if($("#campo-adm-tipo-permiso4").prop("checked")||$("#campo-adm-tipo-permiso5").prop("checked")){
                $(".contenedor-fecha-inicio-adm").show();
                $(".contenedor-fecha-fin-adm").show();
                $(".contenedor-horarios-adm").hide();
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
            if($("#campo-adm-tipo-permiso1").prop("checked")){
                $(".filtro-hora-inicio-adm").html(htmlTodoHorario);
                $(".filtro-hora-fin-adm").html(htmlTodoHorario);
            }
        
            if($("#campo-adm-tipo-permiso2").prop("checked")){
                $(".filtro-hora-fin-adm").html(htmlHorasIniciales);
            }
    
            if($("#campo-adm-tipo-permiso3").prop("checked")){
                $(".filtro-hora-fin-adm").html(htmlHorasFinales);
            }
        });
    });

    $(".boton-solicitar-permiso-adm").click(function(){
        $(".boton-solicitar-permiso-adm").hide();
        if($(".campo-fecha-inicio-adm").val()!=""){
    
          //Si es de tipo 1, validar que no hay mas de 5 horas de permiso
            var tipoPermiso=$(".campo-adm-tipo-permiso:checked").attr("data-tipo");
            console.log(tipoPermiso);
            var horariosValidos=true;
            if(tipoPermiso==1){
                var horaInicio=new Date(2000,1,1,$(".filtro-hora-inicio-adm").val(), $(".filtro-minuto-inicio-adm").val(), 0,0);
                var horaFin=new Date(2000,1,1,$(".filtro-hora-fin-adm").val(), $(".filtro-minuto-fin-adm").val(), 0,0);
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
                    inicio:$(".campo-fecha-inicio-adm").val(),
                    fin:$(".campo-fecha-fin-adm").val(),
                    tipo:tipoPermiso,
                    usuario:idUsuario
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
                            solicitarPermiso:1,
                            tipo:$(".campo-adm-tipo-permiso:checked").attr("data-tipo"),
                            fechaInicio:$(".campo-fecha-inicio-adm").val(),
                            fechaFin:$(".campo-fecha-fin-adm").val(),
                            horaInicio:$(".filtro-hora-inicio-adm").val(),
                            horaFin:$(".filtro-hora-fin-adm").val(),
                            minutoInicio:$(".filtro-minuto-inicio-adm").val(),
                            minutoFin:$(".filtro-minuto-fin-adm").val(),
                            motivo:$(".campo-texto-motivo-adm").val(),
                            usuario:idUsuario
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
                                    $(".campo-fecha-inicio-adm").val("");
                                    $(".campo-fecha-fin-adm").val("");
                                    $(".filtro-hora-inicio-adm").val("8");
                                    $(".filtro-hora-fin-adm").val("8");
                                    $(".filtro-minuto-inicio-adm").val("00");
                                    $(".filtro-minuto-fin-adm").val("00");
                                    $(".campo-texto-motivo-adm").val("");
                                    alert("Tu solicitud de permiso se generó exitosamente");
                                    $(".boton-solicitar-permiso-adm").show();
                                    // if(permisoSolicitudes){
                                    //     cargarSolicitudes();
                                    // }
                                }
                            });
                        }
                        else{
                            alert("Por favor indica el motivo de tu solicitud");
                            $(".boton-solicitar-permiso-adm").show();
                        }      
                    }
                    else{
                        if(respuesta_json.codigo==-1){
                        alert("Por favor revisa las fechas de tu solicitud");
                        $(".boton-solicitar-permiso-adm").show();
                        }
                    else{
                        if(respuesta_json.codigo==-2){
                            alert("No tienes sesión inicada o ha expirado, por favor inicia sesión nuevamente");
                            $(".boton-solicitar-permiso-adm").show();
                        } 
                    else{
                        if(respuesta_json.codigo==-3){
                            //alert("Los permisos deben solicitarse con al menos 2 días de anticipación");
                            alert("Los permisos deben solicitarse con al menos 1 día hábil de anticipación");
                            $(".boton-solicitar-permiso-adm").show();
                        } 
                        else{
                            if(respuesta_json.codigo==-4){
                                //alert("Los permisos deben solicitarse con al menos 2 días de anticipación");
                                alert("Solo puedes solicitar 2 permisos durante un mes");
                                $(".boton-solicitar-permiso-adm").show();
                            } 
                        else{
                            if(respuesta_json.codigo==-5){
                                //alert("Los permisos deben solicitarse con al menos 2 días de anticipación");
                                alert("Solo puedes solicitar 3 permisos durante un mes");
                                $(".boton-solicitar-permiso-adm").show();
                            } 
                            else{
                                if(respuesta_json.codigo==-6){
                                    //alert("Los permisos deben solicitarse con al menos 2 días de anticipación");
                                    alert("Por favor verifica las fechas de tu permiso");
                                    $(".boton-solicitar-permiso-adm").show();
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
            $(".boton-solicitar-permiso-adm").show();
          }
        }
        else{
          alert("Por favor, indica la fecha para la que solicitas permiso");
          $(".boton-solicitar-permiso-adm").show();
        }    
    });

    $(".boton-cancelar-permiso-adm").click(function (){
        $(".contenedor-tabla-permisos").show();
        $(".contenedor-tipo-permisos").show();
        $(".contenedor-anadir-permisos").hide();
        $(".contenedor-administrar-permisos .contenedor-titulo .celda").html("ADMINISTRACIÓN DE PERMISOS Y VACACIONES.");
    });

    ///BOTOENES PERMISO VACACIONES - Despliega contenedor - formulario
    $(".boton-mostrar-permiso-vacaciones").click(function(){
        $(".contenedor-tabla-vacaciones").hide();
        $(".contenedor-tipo-permisos").hide();
        $(".contenedor-anadir-vacaciones").show();
        $(".contenedor-administrar-permisos .contenedor-titulo .celda").html("ADMINISTRACIÓN DE PERMISOS Y VACACIONES - Agregar/quitar días.");
    });

    $(".boton-agregar-permiso-vacaciones").click(insertarVacaciones);

    $(".boton-cancelar-permiso-vacaciones").click(function(){
        $(".campo-dias-agregar").val("");
        $(".campo-concepto").val("");
        $(".campo-fecha-agregar").val("");
        $(".contenedor-anadir-vacaciones").hide();
        $(".contenedor-tabla-vacaciones").show();
        $(".contenedor-tipo-permisos").show();
        $(".contenedor-administrar-permisos .contenedor-titulo .celda").html("ADMINISTRACIÓN DE PERMISOS Y VACACIONES.");
    });

    //BOTONES PERMISO COMERCIAL
    $(".boton-mostrar-permiso-comercial").click(function (){
        $(".contenedor-tabla-comercial").hide();
        $(".contenedor-tipo-permisos").hide();
        $(".contenedor-anadir-comercial").show();

        $(".contenedor-administrar-permisos .contenedor-titulo .celda").html("ADMINISTRACIÓN DE PERMISOS Y VACACIONES - Agregar permiso comercial.");
    });

    $(".boton-cancelar-permiso-comercial").click(function (){
        $(".campo-fecha-agregar-comercial").val("");
        $(".campo-motivo-comercial").val("");

        $(".filtro-hora-inicio-comercial").val(9);
        $(".filtro-hora-fin-comercial").val(9);
        $(".filtro-minuto-inicio-comercial").val(9);
        $(".filtro-minuto-fin-comercial").val(9);

        $(".contenedor-anadir-comercial").hide();
        $(".contenedor-tabla-comercial").show();
        $(".contenedor-tipo-permisos").show();

        $(".contenedor-administrar-permisos .contenedor-titulo .celda").html("ADMINISTRACIÓN DE PERMISOS Y VACACIONES.");
    });

    $(".boton-regresar-datos-puestos").click(function(){
        $(".contenedor-informacion-metas-colaborador").hide();
        $(".contenedor-filtros-metas").show();
    });

    $(".boton-agregar-permiso-comercial").click(function(){
        
    });

    $(".boton-regresar-datos-puestos").click(limpiarFormularioPuesto);
    $(".boton-guardar-datos-puestos").click(guardarPuesto);
    
    
}

///CAPITAL HUMANO - DIAS DE ASUETO
function cargarAsuetos(){
    var datos={
      listaFestivos:1
    };

    $.ajax({
      url: "./lib_php/updPermisosVacaciones.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      var elemHTML = '';
      if (respuesta_json.isExito == 1){
        var fechas=respuesta_json.datos;

        var configuracionTabla={
        titulos:["Fechas"],
        campos:["fecha"],
        clases:["columna-fecha"],
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

        elemHTML+=crearTabla(fechas, configuracionTabla);
      }

      $(".lista-dias-asuetos").html(elemHTML);
      $(".lista-dias-asuetos .celda-acciones-fila .eliminar-elemento").click(eliminarAsueto);
    });
}

function insertarAsueto(){
    var datos={
      insertarAsueto:1,
      fecha:$(".campo-fecha-asuesto").val()
    };

    console.log(datos);

    if($(".campo-fecha-asuesto").val()!=""){
        $.ajax({
            url: "./lib_php/updPermisosVacaciones.php",
            type: "POST",
            dataType: "json",
            data: datos
        }).always(function(respuesta_json){
            if (respuesta_json.isExito == 1){
                cargarAsuetos();
                $(".campo-fecha-asuesto").val("");
                $(".contenedor-asuetos").css("display", "block");
                $(".contenedor-fecha-asueto").css("display", "none");
            }
            else{
                alert("Ocurrió un error al registrar el día feriado, por favor intenta nuevamente");
            }
        });   
    }else{
        alert("El campo de fecha esta vacio");
    }
}

function eliminarAsueto(event){
    let idAsueto=$(event.target).closest(".fila-datos").attr("data-id");
    let informacionAsueto=$(event.target).parent().parent().prev().text();

    console.log(idAsueto);

    var datos = {
        eliminarAsueto:1,
        id:idAsueto
    };

    if(window.confirm("¿Confirma la eliminación del día feriado? \n"+informacionAsueto+"")){
        $.ajax({
            url: "./lib_php/updPermisosVacaciones.php",
            type: "POST",
            dataType: "json",
            data: datos
        }).always(function(respuesta_json){
            console.log(respuesta_json);
            if (respuesta_json.isExito == 1){
                cargarAsuetos();
                $(".campo-fecha-asuesto").val("");
            }
            else{
                alert("Ocurrió un error al eliminar el día feriado, por favor intenta nuevamente");
            }
        });
    }
}

//CAPITAL HUMANO - ADMINISTRACION
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
        console.log(respuesta_json);
        var areas = respuesta_json.datos;
        var elemHTML_select='<option value='+-1+'>Seleccione un área</option>';
        for(var i=0;i<areas.length;i++){
            elemHTML_select+='<option value="'+areas[i].id+'">'+areas[i].nombre+ '</option>';
        }

        $("select.campo-area").html(elemHTML_select);
        $("select.campo-area").change(filtrarUsuarios);

        $("select.campo-area-puesto").html(elemHTML_select);
        $("select.filtro-area-metas").html(elemHTML_select);
        $("select.filtro-area-metas").change(cargarUsuariosMetas);

        $(".campo-filtro-nombre-metas").on("input", cargarUsuariosMetas);

        filtrarUsuarios();
        cargarUsuariosMetas();
    });
}

function filtrarUsuarios(){
    var datos={
        listadoActivos: 1,
        area: $("select.campo-area").val(),
        activos: 1
    };

    $.ajax({
        url: "./lib_php/updUsuarios.php",
        type: "POST",
        dataType: "json",
        data: datos
    }).always(function(respuesta_json){
        console.log(respuesta_json);
        var elemHTML='';
        if (respuesta_json.isExito == 1){
            var usuarios = respuesta_json.datos;
            var configuracionTabla={
            titulos:["Nombre","Área","Puesto"],
            campos:["nombre","area","puesto"],
            clases:["columna-nombre","columna-area","columna-puesto"],
            atributos:[
                {
                nombre:"data-id",
                campo:"id"
                },
            ],
            eliminar:true
            };
            elemHTML+=crearTabla(usuarios, configuracionTabla);  
        }

        $(".lista-administracion-usuarios").html(elemHTML);
        $(".contenedor-administrar-permisos").hide();
        $(".lista-administracion-usuarios .tabla-datos .columna-nombre").click(cargarSolicitudesVacacionesPermisos);
    }); 
}

function cargarSolicitudesVacacionesPermisos(event){
    idUsuario=$(event.target).closest(".fila-datos").attr("data-id");
    let informacionUsuario=$(event.target).text();

    console.log(idUsuario);
    console.log(informacionUsuario);

    $(".contenedor-informacion-usuario").html("Usuario: " + informacionUsuario);

    $(".contenedor-datos-usuarios").hide();
    $(".contenedor-tipo-permisos").show();
    $(".contenedor-administrar-permisos").show();

    $(".contenedor-usuario-permisos").hide();
    $(".contenedor-usuario-vacaciones").hide();
    $(".contenedor-usuario-comercial").hide();
    
    cargarVacaciones(idUsuario);
    cargarPermisos(idUsuario);
    cargarPermisosComerciales(idUsuario);
    
    ///FALTA ADM DE PERMISOS Y PERMISOS COMERCIALES
    $(".campo-administracion-permiso").change(function(){
        if($("#adm-permisos").prop("checked")){
            $(".contenedor-usuario-vacaciones").hide();
            $(".contenedor-usuario-comercial").hide();
            $(".contenedor-usuario-permisos").show();
            $(".boton-regresar-permiso").click(limpiarPermisosVacaciones);     
        }
        else{
            if($("#adm-vacaciones").prop("checked")){
                $(".contenedor-usuario-permisos").hide();
                $(".contenedor-usuario-comercial").hide();
                $(".contenedor-usuario-vacaciones").show();
                $(".boton-regresar-permiso-vacaciones").click(limpiarPermisosVacaciones);                
            }else{
                if($("#adm-comercial").prop("checked")){
                    $(".contenedor-usuario-permisos").hide();
                    $(".contenedor-usuario-vacaciones").hide();
                    $(".contenedor-usuario-comercial").show();
                    $(".boton-regresar-permiso-comercial").click(limpiarPermisosVacaciones); 
                }
            }
        }
    });
    // cargarPermisosComerciales(idUsuario);
}

function limpiarPermisosVacaciones(){
    // $(".contenedor-informacion-usuario").html("");
    $(".lista-usuario-vacaciones").html('');
    $(".contenedor-vacaciones-disponibles").html('');
    $(".contenedor-informacion-usuario").html('');
    $(".contenedor-vacaciones-disponibles").html('');
    $(".lista-usuario-comercial").html('');

    $(".contenedor-administrar-permisos").hide();
    $(".contenedor-datos-usuarios").show();
    // $(".contenedor-datos-usuarios").show();
    // $(".contenedor-administracion-permisos").hide();

    // $(".contenedor-usuario-permisos").hide();
    // $(".contenedor-usuario-vacaciones").hide();
    // $(".contenedor-usuario-comercial").hide();

    inputs_radio=document.getElementsByName("administracion-permiso");
    for (i=0; i<inputs_radio.length; i++){
        inputs_radio[i].checked=false;
    }
}

//CARGAR PERMISOS - CAPITAL HUMANO
function cargarPermisos(idUsuario){
    var datos={
      permisosPorUsuario:1,
      idUsuario:idUsuario
    };
    console.log(datos);
    $.ajax({
      url: "./lib_php/updPermisosVacaciones.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      var elemHTML='';
      if (respuesta_json.isExito == 1){
        var permisos = respuesta_json.datos;
        var configuracionTabla={
        titulos:["Fecha","Tipo de permiso","Aprobado"],
        campos:["periodo","tipo","estatus"],
        clases:["columna-periodo","columna-tipo","columna-estatus"],
        atributos:[
            {
            nombre:"data-id",
            campo:"id"
            },
        ],
        eliminar:true
        };
        elemHTML+=crearTabla(permisos, configuracionTabla);

        $(".lista-usuario-permisos").html(elemHTML);

      }else{
        $(".lista-usuario-permisos").html("<div class='sin-datos'> NO HAY PERMISOS REGISTRADOS. </div>");
      }
    });
}

//CARGAR VACACIONES - CAPITAL HUMANO
function cargarVacaciones(idUsuario){
    var datos={
      vacacionesPorUsuario:1,
      idUsuario:idUsuario
    };

    $.ajax({
      url: "./lib_php/updPermisosVacaciones.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      var elemHTML='';
      if (respuesta_json.isExito == 1){
        var vacaciones = respuesta_json.datos;
        var configuracionTabla={
        titulos:["Fecha","Cantidad","Aprobado"],
        campos:["fecha","cantidad","concepto"],
        clases:["columna-fecha","columna-cantidad","columna-concepto"],
        atributos:[
            {
            nombre:"data-id",
            campo:"id"
            },
        ],
        eliminar:true
        };
        elemHTML+=crearTabla(vacaciones, configuracionTabla);

        var sumaDiasVacaciones = respuesta_json.datos;
        var resultadoDiasVaciones = 0;

        for(var i=0;i<sumaDiasVacaciones.length; i++){
            resultadoDiasVaciones += sumaDiasVacaciones[i].cantidad;
        }
        if(resultadoDiasVaciones<0){
            resultadoDiasVaciones=0;
        }
        $(".lista-usuario-vacaciones").html(elemHTML);

        //ELIMINAR VACACIONES POR ID DEL ELEMENTO Y ID DEL USUARIO
        $(".lista-usuario-vacaciones .eliminar-elemento").click(eliminarVacaciones);

        $(".contenedor-vacaciones-disponibles").html("Días de vacaciones disponibles: "+resultadoDiasVaciones);
        
      }else{
        $(".lista-usuario-vacaciones").html("<div class='sin-datos'> NO HAY PERMISOS REGISTRADOS. </div>");
      }
    }); 
}

function insertarVacaciones(){
    var datos={
        guardarVacaciones:1,
        idUsuario:idUsuario,
        cantidad:$(".campo-dias-agregar").val(),
        fecha:$(".campo-fecha-agregar").val(),
        concepto:$(".campo-concepto").val()
    };

    if(datos.cantidad != "" && datos.fecha != "" && datos.concepto !=""){
        $.ajax({
            url: "./lib_php/updPermisosVacaciones.php",
            type: "POST",
            dataType: "json",
            data: datos
        }).always(function(respuesta_json){
        console.log(respuesta_json);
        if (respuesta_json.isExito == 1){
            $(".campo-dias-agregar").val("");
            $(".campo-fecha-agregar").val("");
            $(".campo-concepto").val("");
            // $(".contenedor-anadir-vacaciones").hide();
            // $(".contenedor-administrar-permisos").show();
    
            $(".campo-concepto").val("");
            $(".contenedor-anadir-vacaciones").hide();
    
            $(".contenedor-tabla-vacaciones").show();
            $(".contenedor-tipo-permisos").show();
    
            cargarSolicitudesVacacionesPermisos(idUsuario);
        }
        });
    } else{
        alert("Uno de los campos esta vacio");
    }
}

function eliminarVacaciones(event){
    let idVacacion=$(event.target).closest(".fila-datos").attr("data-id");
    
    let fechaVaciones=$(event.target).parent().parent().prev().prev().prev().text();
    let cantidadVacaciones=$(event.target).parent().parent().prev().prev().text();
    let aprobadasVacaciones=$(event.target).parent().parent().prev().text();

    let confirmarEliminar = confirm(`Eliminar el siguiente elemento? : ${fechaVaciones + ' ' + cantidadVacaciones + ' ' + aprobadasVacaciones}`);

    if(confirmarEliminar){
        console.log("BORRAR VACACIONES "+idVacacion);
        var datos={
            borrarVacaciones:1,
            id:idVacacion
        };

        $.ajax({
            url: "./lib_php/updPermisosVacaciones.php",
            type: "POST",
            dataType: "json",
            data: datos
        }).always(function(respuesta_json){
            console.log(respuesta_json);
            if (respuesta_json.isExito == 1){
                cargarVacaciones(idUsuario);
            }
        });
    }
}

//CAPITAL HUMANO - PERMISOS COMERCIALES
function cargarPermisosComerciales(idUsuario){
    var datos={
      permisosComercialesPorUsuario:1,
      idUsuario:idUsuario
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
        var elemHTML = "";
        var comerciales = respuesta_json.datos;

        comerciales.forEach(function(item) {
            if (!item.hasOwnProperty('tipo')){
                item.tipo = "Comercial";
            }
        });

        var configuracionTabla={
            titulos:["Fecha","Tipo","Aprobado"],
            campos:["fecha", "tipo", "estatus"],
            clases:["columna-fecha", "columna-tipo","columna-estatus"],
            atributos:[
                {
                    nombre:"data-id",
                    campo:"id"
                },
            ],
            eliminar:true
        };

        elemHTML+=crearTabla(comerciales, configuracionTabla);

        $(".lista-usuario-comercial").html(elemHTML);
        $(".lista-usuario-comercial .fila-datos .eliminar-elemento").click(borrarPermisoComercial);
          
      }else{
        $(".lista-usuario-comercial").html("<div class='sin-datos'> NO HAY PERMISOS REGISTRADOS. </div>");  
      }
    });
}

function borrarPermisoComercial(event){
    let idPermiso=$(event.target).closest(".fila-datos").attr("data-id");

    if(window.confirm("¿Confirma que desea eliminar el permiso comercial?")){
        console.log("BORRAR PERMISO "+idPermiso);

        var datos={
            borrarPermisoComercial:1,
            id:idPermiso
        };

        $.ajax({
            url: "./lib_php/updPermisosVacaciones.php",
            type: "POST",
            dataType: "json",
            data: datos
        }).always(function(respuesta_json){
            console.log(respuesta_json);
            if (respuesta_json.isExito == 1){
                cargarPermisosComerciales(idUsuario);
            }
        });  
    }
    
}

// CAPITAL HUMANO - SOLICITUDES DE PERMISOS
function cargarSolicitudes(){
    var datos={
        filtrarPermisos:1
    };
    $.ajax({
        url: "./lib_php/updPermisosVacaciones.php",
        type: "POST",
        dataType: "json",
        data: datos
    }).always(function(respuesta_json){
        console.log(respuesta_json);
        if (respuesta_json.isExito == 1){
            var elemHTML = "";
            var permisos = respuesta_json.datos;

            var configuracionTabla={
                titulos:["Nombre","Tipo", "Creacion", "Autorizado" ],
                campos:["usuario", "tipo", "creacion", "autorizadoJefe"],
                clases:["columna-nombre", "columna-tipo","columna-creacion", "columna-autorizadoJefe"],
                atributos:[
                    {
                        nombre:"data-id",
                        campo:"id"
                    },
                ],
                eliminar:true
            };
            elemHTML+=crearTabla(permisos, configuracionTabla);

            $(".lista-solicitudes-permisos").html(elemHTML);
            $(".lista-solicitudes-permisos .fila-datos .columna-nombre").click(autorizarPermiso);
        }
    });

    var datos={
        filtrarVacaciones:1
    };

    $.ajax({
        url: "./lib_php/updPermisosVacaciones.php",
        type: "POST",
        dataType: "json",
        data: datos
    }).always(function(respuesta_json){
        console.log(respuesta_json);
        if (respuesta_json.isExito == 1){
            var elemHTML = "";
            var vacaciones = respuesta_json.datos;

            var configuracionTabla={
                titulos:["Nombre","Periodo", "Creacion", "Autorizado" ],
                campos:["usuario", "periodo", "creacion", "autorizadoJefe"],
                clases:["columna-nombre", "columna-periodo","columna-creacion", "columna-autorizadoJefe"],
                atributos:[
                    {
                        nombre:"data-id",
                        campo:"id"
                    },
                ],
                eliminar:true
            };

            elemHTML+=crearTabla(vacaciones, configuracionTabla);

            $(".lista-solicitudes-vacaciones").html(elemHTML);
            $(".lista-solicitudes-vacaciones .fila-datos .columna-nombre").click(autorizarPermisoVacaciones);
        }
    });

    var datos={
        filtrarPermisosComerciales:1
    };
    $.ajax({
        url: "./lib_php/updPermisosVacaciones.php",
        type: "POST",
        dataType: "json",
        data: datos
    }).always(function(respuesta_json){
        console.log(respuesta_json);
        if (respuesta_json.isExito == 1){
            var elemHTML = "";
            var comerciales = respuesta_json.datos;

            var configuracionTabla={
                titulos:["Nombre","Fecha", "Creacion", "Autorizado" ],
                campos:["usuario", "fecha", "creacion", "autorizadoJefe"],
                clases:["columna-nombre", "columna-fecha","columna-creacion", "columna-autorizadoJefe"],
                atributos:[
                    {
                        nombre:"data-id",
                        campo:"id"
                    },
                ],
                eliminar:true
            };
            
            elemHTML+=crearTabla(comerciales, configuracionTabla);
            $(".lista-solicitudes-comercial").html(elemHTML);
            $(".lista-solicitudes-comercial .fila-datos .columna-nombre").click(autorizarPermisoComercial);
        }
    });

    $(".contenedor-lista-solicitudes").hide();
    $(".campo-solicitudes-permisos").change(function(){
        if($("#solicitudes-permisos").prop("checked")){
            $(".contenedor-lista-solicitudes").show();
            $(".lista-solicitudes-comercial").hide();
            $(".lista-solicitudes-vacaciones").hide();
            $(".lista-solicitudes-permisos").show();
        }
        else{
            if($("#solicitudes-vacaciones").prop("checked")){
                $(".contenedor-lista-solicitudes").show();
                $(".lista-solicitudes-comercial").hide();
                $(".lista-solicitudes-permisos").hide();
                $(".lista-solicitudes-vacaciones").show();              
            }else{
                if($("#solicitudes-comerciales").prop("checked")){
                    $(".contenedor-lista-solicitudes").show();
                    $(".lista-solicitudes-permisos").hide();
                    $(".lista-solicitudes-vacaciones").hide();
                    $(".lista-solicitudes-comercial").show();
                }
            }
        }
    });
}


function cargarPuestos(){
    var datos={
      listaPuestos:1
    }
    $.ajax({
      url: "./lib_php/updPuestos.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
        console.log(respuesta_json);
        if (respuesta_json.isExito == 1){
            var puestos=respuesta_json.datos;
            var htmlPuestos='';
            if (respuesta_json.isExito == 1){
        
                var configuracionTabla={
                titulos:["Puesto", "Aréa"],
                campos:["nombrePuesto", "nombreArea"],
                clases:["columna-puesto", "columna-area"],
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
                htmlPuestos+=crearTabla(puestos, configuracionTabla);
            }

            $(".contenedor-lista-puestos").html(htmlPuestos);
            $(".contenedor-datos-puestos").hide();
            $(".contenedor-lista-puestos .fila-datos .columna-puesto").click(detallePuesto);
        }
    });  
}

function detallePuesto(event){
    
    idPuesto=$(event.target).closest(".fila-datos").attr("data-id");

    var datos={
      detallePuesto:1,
      id:idPuesto
    };

    $.ajax({
      url: "./lib_php/updPuestos.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if (respuesta_json.isExito == 1){
        $(".contenedor-datos-puestos").show();
        $(".contenedor-lista-puestos").hide();

        $(".campo-titulo-puesto").val(respuesta_json.datos.titulo);
        $(".campo-area-puesto").val(respuesta_json.datos.area);
  
        var nivelesDominio=respuesta_json.datos.nivelesDominio;
        for(var i=0;i<nivelesDominio.length;i++){
          var nivelDominio=nivelesDominio[i];
          console.log(".fila-rubro data-id['"+nivelDominio.id+"'] select");
          $(".fila-rubro[data-id='"+nivelDominio.id+"'] select").val(nivelDominio.nivel);
        }
      }
    });
}

function limpiarFormularioPuesto(){
    $(".contenedor-datos-puestos").hide();
    $(".contenedor-lista-puestos").show();

    $(".campo-titulo-puesto").val("");
    $(".campo-area-puesto").val("");
}

function cargarNivelesDeDominio(){
    var datos={
      competenciasPorPuesto:1,
      puesto:1
    };

    $.ajax({
      url: "./lib_php/updEvaluacionMetas.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if (respuesta_json.isExito == 1){
        var htmlDominio=''+'<div class="contenedor-titulo">NIVELES DE DIMINIO</div>';
        for(var i=0;i<respuesta_json.datos.length;i++){
          htmlDominio+=''+
          '<div class="fila-rubro" data-id="'+respuesta_json.datos[i].idRubro+'">'+
            '<div class="celda celda-titulo-rubro" >'+
              respuesta_json.datos[i].nombreRubro+
            '</div>'+
            '<div class="celda celda-campo-dominio" >'+
              '<select>'+
                '<option value="1">1</option>'+
                '<option value="2">2</option>'+
                '<option value="3">3</option>'+
                '<option value="4">4</option>'+
              '</select>'+
            '</div>'+
          '</div>'+
          '';
        }
        $(".contenedor-campo-dominio-puesto").html(htmlDominio);
      }
    });
}

function guardarPuesto(){
    var datos={
      titulo:$(".campo-titulo-puesto").val(),
      area:$(".campo-area-puesto").val(),
      nivelesDominio:[]
    }
  
    var mensaje="";
    
    if(idPuesto!=-1){
      datos.modificarPuesto=1;
      datos.id=idPuesto;
      mensaje="El puesto se modificó exitosamente";
    }else{
      datos.guardarPuesto=1;
      mensaje="El puesto se guardó exitosamente";
    }
  
    $(".contenedor-campo-dominio-puesto .fila-rubro").each(function(){
      var nivelDominio={
        id:$(this).attr("data-id"),
        nivel:$(this).find("select").val()
      };
      datos.nivelesDominio.push(nivelDominio);
    });

    datos.nivelesDominio=JSON.stringify(datos.nivelesDominio);
  
    console.log(datos);

    $.ajax({
      url: "./lib_php/updPuestos.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if (respuesta_json.isExito == 1){
        alert(mensaje);
        // limpiarFormularioPuesto();
        // mostrarFormularioPuesto();
        // detallePuesto();
        // cargarPuestos();
      }
    });
}

function cargarUsuariosMetas(){
    var datos={
      filtrarUsuariosMetas:1,
      nombre:$(".campo-filtro-nombre-metas").val(),
      area:$(".filtro-area-metas").val()
    }

    $.ajax({
        url: "./lib_php/updEvaluacionMetas.php",
        type: "POST",
        dataType: "json",
        data: datos
    }).always(function(respuesta_json){
        console.log(respuesta_json);

        if (respuesta_json.isExito == 1){
            var metas=respuesta_json.datos;
            var htmlPuestos ='';
            var configuracionTabla={
                titulos:["Nombre", "Área"],
                campos:["nombre", "area"],
                clases:["columna-nombre", "columna-area"],
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

            htmlPuestos+=crearTabla(metas, configuracionTabla);
            $(".lista-usuarios-metas").html(htmlPuestos);

            $(".lista-usuarios-metas .fila-datos .columna-nombre").click(mostrarMetasUsuario);
        }
    });  
}

function mostrarMetasUsuario(event){
    var idUsuario = $(event.target).closest(".fila-datos").attr("data-id");
    var nombreUsuario = $(event.target).closest(".fila-datos").find(".columna-nombre").html();

    $(".contenedor-informacion-metas-colaborador .celda-nombre-colaborador").html(nombreUsuario);

    var datos={
      id:idUsuario,
      metasColaborador:1
    }

    $.ajax({
      url: "./lib_php/updEvaluacionMetas.php",
      type: "POST",
      dataType: "json",
      data: datos
    }).always(function(respuesta_json){
      console.log(respuesta_json);
      if (respuesta_json.isExito == 1){
        var metas=respuesta_json.datos;
        var htmlMetas=''
        var sumaPuntajes=0;
        var validadas=false;
        for(var i=0;i<metas.length;i++){
          var meta=metas[i];
          htmlMetas+=`
              <div class="clabs-bloque-meta" data-colaborador="`+idUsuario+`" data-meta="`+meta.id+`">
                <div>
                    <span class="etiqueta-campo">Título de la meta</span>
                    <br>
                    <input class="campo campo-contenedor-titulo-meta" placeholder="Título de la meta" disabled value="`+meta.titulo+`">
                    <br><br>
                </div>
                <br/>
                <div>
                    <span class="etiqueta-campo">Descripción de la meta</span>
                    <br>
                    <textarea type="text" class="campo campo-descripcion-meta" placeholder="Descripción detallada de la meta" style="height: 103px; width: 807px;"  disabled>`+meta.descripcion+`</textarea>
                    <br><br>
                </div>
                <br/>
                <div>
                  <span class="etiqueta-campo">Descripción de las evidencias esperadas</span>
                  <br>`;
          for(var j=0;j<meta.evidencias.length;j++){
            var evidencia=meta.evidencias[j];
            htmlMetas+=`
              <input type="text" class="campo-evidencia-meta campo-formulario" class="campo-formulario " placeholder="Evidencia de la meta" disabled value="`+evidencia+`"> `;
          }
          htmlMetas+=`
                  <br><br>
                </div>
                <br/>
                <div>
                  <span class="etiqueta-campo">Archivo de evidencias</span>
                  <br/>`;
          if(meta.archivo!=""&&meta.archivo!=null){
          htmlMetas+=`
                  <a href="./evidencias/`+meta.archivo+`" target="_blank">Descargar</a>`;
          }
          else{
              htmlMetas+=`El colaborador no ha registrado archivo de evidencias para la meta`; 
          }
          htmlMetas+=`
                </div>
                <br><br>         
                <br/>
              </div>
          `;
          sumaPuntajes+=Number(meta.ponderacion);
          if(meta.validada==1||meta.validada=="1"){
            validadas=true;
          }
        }
        $(".contenedor-lista-metas-colaborador").html(htmlMetas);
        $(".contenedor-informacion-metas-colaborador").css("display", "block");
        $(".contenedor-filtros-metas").hide();
      }
    });
}

function autorizarPermiso(event){
    let idPermiso=$(event.target).closest(".fila-datos").attr("data-id");
    window.open("http://localhost/intranet-2023/sistema/autorizarPermiso.php?permiso=" + idPermiso, "_blank");
}

function autorizarPermisoVacaciones(event){
    let idPermiso=$(event.target).closest(".fila-datos").attr("data-id");
    window.open("http://localhost/intranet-2023/sistema/autorizarPermisoVacaciones.php?permiso=" + idPermiso, "_blank");
}

function autorizarPermisoComercial(event) {
    let idPermiso=$(event.target).closest(".fila-datos").attr("data-id");
    window.open("http://localhost/intranet-2023/sistema/autorizarPermisoComercial.php?permiso=" + idPermiso, "_blank");
}