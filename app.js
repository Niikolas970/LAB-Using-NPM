const  datePicker = document.getElementById("datePicker");
const errorMensaje = document.getElementById("errorMessage");

function validarFechas(){
    const fechaSeleccionada = new Date(datePicker.value);

    const hoy = new Date();

    hoy.setHours(0,0,0,0);

    if(fechaSeleccionada > hoy){
        errorMensaje.textContent = ` No puedes seleccionar una fecha futura, por favor intentalo de nuevo`;

        errorMensaje.style.display = "block";

        return false;
    }

    errorMensaje.style.display = "none";

    return true;
}
const btnData = document.getElementById("loadDateBtn");

btnData.addEventListener("click", function(){
    if (!validarFechas()){
        return
    }
    console.log("Fecha validada");
    
})

function obtenerFavorito() {
    return JSON.parse(localStorage.getItem("favoritos")) || [];
}

function guardarFavoritos(apod){
    const favoritos = obtenerFavorito();

    const existe = favoritos.some(favorito => favoritos.date === apod.date);

    if(existe){
        alert ("Este ya esta guardado en favoritos");
        return
    }
    favoritos.push(apod);

    localStorage.setItem("favoritos"), JSON.stringify(favoritos);
}