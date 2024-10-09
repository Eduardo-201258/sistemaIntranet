class ClabsComponenteArchivo{

  constructor(){
    this.contenedor="";
    this.archivoResultado="";
    this.rutaResultado="";
    this.elemento=null;
    this.aleatorio=null;   
    this.textoBoton="Subir fotografía" ;
    this.textoBoton2="Cambiar fotografía" ;
    this.defaultOn="default-on.jpg";
  }

  inicializarComponenteArchivo(elemento, editable=true, eliminable=true){
    this.elemento=elemento;
    var rutaArchivoSubida=elemento.attr("data-uploader");
    var rutaArchivoResultado=elemento.attr("data-ruta-archivo");
    this.rutaResultado=elemento.attr("data-ruta-archivo");
    var extensiones=elemento.attr("data-extensiones");
    this.aleatorio=Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));

    var defaultOn=elemento.attr("default-on");
    if(defaultOn===undefined||defaultOn==""){
      defaultOn="default-on.jpg"
    }
    console.log(defaultOn);
    this.defaultOn=defaultOn;

    if(elemento.attr("data-boton")!=""){
      this.textoBoton = elemento.attr("data-boton");
      this.textoBoton2 = elemento.attr("data-boton-cambiar");
    }

    var imagenDefault=elemento.attr("data-default");

    console.log(rutaArchivoSubida);
    console.log(rutaArchivoResultado);
    console.log("ES EDITABLE "+editable);
    var html=''+
      '<form class="form-subir-archivo" action="'+rutaArchivoSubida+'" method="post">'+
          '<input type="file" name="subir-archivo" id="subir-archivo-'+this.aleatorio+'"  accept="'+extensiones+'" >'+
      '</form>'+
      '<div class="clabs-estatus-archivo-subido clabs-estatus-archivo-subido-'+this.aleatorio+'"><img class="clabs-contenedor-img" src="'+this.rutaResultado+imagenDefault+'"></div>'+
      '<label for="subir-archivo-'+this.aleatorio+'">'+
        '<div class="clabs-boton-archivo clabs-boton-archivo-'+this.aleatorio+'">'+this.textoBoton+'</div>';
      if(editable){
        console.log("texto boton "+this.textoBoton2);
        html += '<div class="clabs-boton-cambiar-archivo clabs-boton-cambiar-archivo-'+this.aleatorio+'">'+this.textoBoton2+'</div>';
      }
      html+=''+
      '</label>';      
      if(eliminable){
        html += '<div class="clabs-boton-eliminar-archivo clabs-boton-eliminar-archivo-'+this.aleatorio+'">Eliminar</div>';
      }
      html +=
      '<div class="clabs-avance-subida-'+this.aleatorio+'"></div>'+
      '<div class="clabs-resultado-subida clabs-resultado-subida-'+this.aleatorio+'"></div>'+
    '';
    elemento.find(".contenedor-componente-principal").html(html);
    var thisReference=this;
    $(".clabs-boton-eliminar-archivo-"+this.aleatorio).click(function(){
      var attrRuta=$(this).closest(".clabs-contenedor-campo").attr("data-ruta-archivo");
      var attrArchivo=$(this).closest(".clabs-contenedor-campo").attr("data-default");
      $(this).closest(".clabs-contenedor-campo").attr("data-ruta", "");
      if(!attrArchivo.endsWith(".jpg")&&!attrArchivo.endsWith(".jpeg")&&!attrArchivo.endsWith(".png")){
        $(this).closest(".clabs-contenedor-campo").find("img").attr("src", attrRuta+this.defaultOn);
      }  
      else{
        $(this).closest(".clabs-contenedor-campo").find("img").attr("src", attrRuta+attrArchivo);  
      }    
      thisReference.archivoResultado=imagenDefault;
      //$(this).closest(".clabs-contenedor-campo-imagen").remove();
    });

    this.contenedor=elemento;

    elemento.find("input").change(function(){
      elemento.find(".form-subir-archivo").submit();
    });

    var thisReference=this;

    elemento.find('.form-subir-archivo').submit(function(event){
      console.log(elemento);
      var componente=thisReference.contenedor.find("input");
      console.log("HAY COMPONENTE CORRECTO EN EL SUBMIT "+componente);
      if(componente.val()){
        event.preventDefault();
        console.log($(this));
        $(this).ajaxSubmit({
          target: '.clabs-resultado-subida-'+thisReference.aleatorio,
        
          beforeSubmit:function(){
            $(".clabs-avance-subida-"+thisReference.aleatorio).html("0%");
            $(".clabs-avance-subida-"+thisReference.aleatorio).css("display", "block");
            $(".clabs-boton-archivo-"+thisReference.aleatorio).css("display", "none");
            $(".clabs-estatus-archivo-subido-"+thisReference.aleatorio).html("Subiendo archivo");
          },

          uploadProgress: function(event, position, total, percentageComplete){
            $(".clabs-avance-subida-"+thisReference.aleatorio).html(percentageComplete+"%");
            $(".clabs-boton-archivo-"+thisReference.aleatorio).css("display", "none");
            $(".clabs-estatus-archivo-subido-"+thisReference.aleatorio).html("Subiendo archivo");
          },
          success:function(){
            //$(".soag-input-recurso").css("display", "block");
            $(".clabs-avance-subida-"+thisReference.aleatorio).css("display", "none");
            var resultado=$(".clabs-resultado-subida-"+thisReference.aleatorio).html();
            console.log(resultado);
            var partes=resultado.split("_");
            if(partes[0]=="1"){
              elemento.attr("data-ruta", partes[1])
              //$(".clabs-boton-archivo-"+thisReference.aleatorio).css("display", "inline-block");
              var html='<a href="'+rutaArchivoResultado+partes[1]+'" target="_blank">';
              if(!partes[1].endsWith(".jpg")&&!partes[1].endsWith(".jpeg")&&!partes[1].endsWith(".png")){
                html='<img class="clabs-contenedor-img" src="'+rutaArchivoResultado+thisReference.defaultOn+'">';
              }  
              else{
                html='<img class="clabs-contenedor-img" src="'+rutaArchivoResultado+partes[1]+'">';
              }                  
              html+='</a>';
              $(".clabs-estatus-archivo-subido-"+thisReference.aleatorio).html(html);
              $(".clabs-boton-cambiar-archivo-"+thisReference.aleatorio).css("display", "inline-block");
              thisReference.archivoResultado=partes[1];

              if(callbackUpload!=='undefined'){
                callbackUpload(elemento);
              }
            }
            else{
              alert("Hubo un error al subir el archivo, verifica que tenga la extensión sea permitida, y que pese menos de 2MB.");
              elemento.attr("data-ruta", "")
              //$(".soag-imagen-actual").attr("src", rutaImagenes+imagenDefault);
              $(".clabs-estatus-archivo-subido-"+thisReference.aleatorio).html("Hubo un error al subir el archivo");
              $(".clabs-boton-archivo-"+thisReference.aleatorio).css("display", "inline-block");
              thisReference.archivoResultado="";
            }
          },
          resetForm: true
        });
      }
      return false;
    });
  }

  setArchivo(nombreArchivo, editable=true){
    if(nombreArchivo!=""&&nombreArchivo!=null){
      console.log("SETEANDO imagen"+nombreArchivo);
      $(".clabs-boton-archivo-"+this.aleatorio).css("display", "none");
      this.elemento.attr("data-ruta", nombreArchivo)
      //$(".clabs-estatus-archivo-subido-"+this.aleatorio).html('<a href="'+this.rutaResultado+nombreArchivo+'" target="_blank">Ver archivo registrado</a>');
      var html='<a href="'+this.rutaResultado+nombreArchivo+'" target="_blank">';
      if(!nombreArchivo.endsWith(".jpg")&&!nombreArchivo.endsWith(".jpeg")&&!nombreArchivo.endsWith(".png")){
        html+='<img class="clabs-contenedor-img" src="'+this.rutaResultado+this.defaultOn+'">';
      }else{
        html+='<img class="clabs-contenedor-img" src="'+this.rutaResultado+nombreArchivo+'">';  
      }
      html+='</a>';
      console.log("PONIENDO "+this.rutaResultado+nombreArchivo);
      $(".clabs-estatus-archivo-subido-"+this.aleatorio).html(html);
      $(".clabs-boton-cambiar-archivo-"+this.aleatorio).css("display", "inline-block");
      this.archivoResultado=nombreArchivo;
    }
  }

  getArchivo(){
    return archivoResultado;
  }
}