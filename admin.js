// 🔥 Firebase config (MISMO PROYECTO)
firebase.initializeApp({
    apiKey: "AIzaSyCu44anEiLMD1-Nt9ZpkxKBcv2sfFe4qxQ",
    authDomain: "votacion-talentosacp.firebaseapp.com",
    projectId: "votacion-talentosacp",
    storageBucket: "votacion-talentosacp.firebasestorage.app",
    messagingSenderId: "174461426044",
    appId: "1:174461426044:web:63560aa6c1cfd29187ecf9"
});

const db = firebase.firestore();
const auth = firebase.auth(); // Inicializar Auth

const statusText = document.getElementById("status-text");
const statusIndicator = document.getElementById("status-indicator");
const btnAbrir = document.getElementById("btn-abrir");
const btnCerrar = document.getElementById("btn-cerrar");

// 🔐 LOGIN (Necesario para leer/escribir si las reglas piden auth)
auth.signInAnonymously()
    .then(() => {
        console.log("Admin conectado (Anónimo)");
        initListener();
    })
    .catch((error) => {
        console.error("Error de autenticación:", error);
        statusText.innerText = "Error Auth: " + error.message;
    });

// 🔄 ESCUCHAR ESTADO ACTUAL (Dentro de función para llamar tras login)
function initListener() {
    db.collection("config").doc("QJ46buVKMmRtzCRCgM82").onSnapshot((doc) => {
        if (doc.exists) {
            const estado = doc.data().estado;
            updateUI(estado);
        } else {
            // Si no existe el doc de configuración, intentar crearlo
            createConfig();
        }
    }, (error) => {
        console.error("Error en listener:", error);
        statusText.innerText = "Error Permisos";
    });
}

function createConfig() {
    db.collection("config").doc("QJ46buVKMmRtzCRCgM82").set({ estado: "cerrada" })
        .catch(e => console.error("Error creando config:", e));
}

function updateUI(estado) {
    if (estado === "abierta") {
        statusText.innerText = "ABIERTA";
        statusText.style.color = "#4ade80"; // verde
        btnAbrir.disabled = true;
        btnCerrar.disabled = false;
        btnAbrir.style.opacity = "0.5";
        btnCerrar.style.opacity = "1";
    } else {
        statusText.innerText = "CERRADA";
        statusText.style.color = "#ef4444"; // rojo
        btnAbrir.disabled = false;
        btnCerrar.disabled = true;
        btnAbrir.style.opacity = "1";
        btnCerrar.style.opacity = "0.5";
    }
}

// 🎛️ CAMBIAR ESTADO
window.toggleVotacion = async (nuevoEstado) => {
    const user = auth.currentUser;
    if (!user) {
        alert("⚠️ No estás autenticad. Espera a que cargue el panel.");
        return;
    }

    console.log("Intentando cambiar estado a:", nuevoEstado, "con UID:", user.uid);

    try {
        await db.collection("config").doc("QJ46buVKMmRtzCRCgM82").set({ estado: nuevoEstado });
        // El listener actualizará la UI automáticamente
        alert(`✅ Votación ${nuevoEstado.toUpperCase()} correctamente`);
    } catch (error) {
        console.error("Error al cambiar estado:", error);

        if (error.code === "permission-denied") {
            alert("⛔ ERROR DE PERMISOS: Firebase ha rechazado la escritura.\n\n" +
                "Asegúrate de que las reglas de Firestore permitan escribir en la colección 'config'.\n\n" +
                "Tu UID actual es: " + user.uid);
        } else {
            alert("Error desconocido: " + error.message);
        }
    }
};
