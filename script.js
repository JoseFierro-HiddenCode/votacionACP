// 🔥 Firebase config
if (typeof firebase === 'undefined') {
  console.error("❌ Firebase no está definido.");
} else {
  console.log("✅ Firebase SDK detectado.");
}
firebase.initializeApp({
  apiKey: "AIzaSyCu44anEiLMD1-Nt9ZpkxKBcv2sfFe4qxQ",
  authDomain: "votacion-talentosacp.firebaseapp.com",
  projectId: "votacion-talentosacp",
  storageBucket: "votacion-talentosacp.firebasestorage.app",
  messagingSenderId: "174461426044",
  appId: "1:174461426044:web:63560aa6c1cfd29187ecf9"
});

const auth = firebase.auth();
const db = firebase.firestore();

// 👥 Participantes
const participants = [
  { id: "equipo1", name: "NATH DIAZ", img: "img/Nath_diaz.jpeg" },
  { id: "equipo2", name: "KALLPAY ALLUY", img: "img/Kallpay_Ayllu.jpeg" },
  { id: "equipo3", name: "VOLVO TRUCKS MINING CONTRACT MOTA ENGIL", img: "img/volvo.jpeg" },
  { id: "equipo4", name: "LOS JUSTICIEROS", img: "img/Los_Justicieros.jpeg" },
  { id: "equipo5", name: "LOONEY TUNES", img: "img/Looney_tunes.jpeg" },
  { id: "equipo6", name: "RESPLANDECER", img: "img/Resplandecer.jpeg" },
  { id: "equipo7", name: "LOS RENOS HOMOLOGADOS", img: "img/Renos_Homologados.png" },
  { id: "equipo8", name: "RITMO MOTRIZ", img: "img/Ritmo_Motriz.jpeg" }
];

// 🧱 Mostrar tarjetas
const container = document.getElementById("participants");
container.innerHTML = ""; // Limpiar contenedor

participants.forEach(p => {
  const card = document.createElement("div");
  card.className = "card";

  const img = document.createElement("img");
  img.src = p.img;
  img.alt = p.name;

  const h3 = document.createElement("h3");
  h3.innerText = p.name;

  const btn = document.createElement("button");
  btn.innerText = "Votar";

  // Bind directo del evento (Soluciona problemas de scope)
  btn.addEventListener("click", () => {
    vote(p.id);
  });

  card.appendChild(img);
  card.appendChild(h3);
  card.appendChild(btn);

  container.appendChild(card);
});

// 🔐 Login anónimo
auth.signInAnonymously()
  .then((userCredential) => {
    console.log(`✅ Login exitoso. UID: ${userCredential.user.uid}`);
  })
  .catch((error) => {
    console.error(`❌ Error en login: ${error.message}`);
  });

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("👤 Usuario autenticado detectado.");
  } else {
    console.warn("⚠️ Usuario no autenticado.");
  }
});

// 🔄 STATUS LISTENER (TIEMPO REAL)
db.collection("config").doc("QJ46buVKMmRtzCRCgM82").onSnapshot((doc) => {
  const estado = doc.exists ? doc.data().estado : "cerrada";
  const botones = document.querySelectorAll("button");

  if (estado === "abierta") {
    botones.forEach(b => {
      b.disabled = false;
      b.innerText = "Votar";
      b.style.opacity = "1";
      b.style.cursor = "pointer";
    });
  } else {
    botones.forEach(b => {
      b.disabled = true;
      b.innerText = "Votación Cerrada";
      b.style.opacity = "0.5";
      b.style.cursor = "not-allowed";
    });
  }
});

// 🗳️ VOTAR
async function vote(teamId) {
  // 1. Verificar estado antes de intentar nada
  const configDoc = await db.collection("config").doc("QJ46buVKMmRtzCRCgM82").get();
  const estado = configDoc.exists ? configDoc.data().estado : "cerrada";

  if (estado !== "abierta") {
    alert("⛔ La votación está cerrada en este momento.");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("⚠️ Error de autenticación. Recarga la página.");
    return;
  }

  const voteRef = db.collection("votes").doc(user.uid);

  // 2. Verificar si ya votó
  const doc = await voteRef.get();
  if (doc.exists) {
    alert("⚠️ Ya has votado anteriormente.");
    return;
  }

  // 3. Registrar voto
  try {
    await voteRef.set({
      team: teamId,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    await db.collection("participants").doc(teamId).set({
      votes: firebase.firestore.FieldValue.increment(1)
    }, { merge: true });

    alert("¡Voto registrado con éxito! 🎉");

    // Deshabilitar botones localmente para feedback inmediato
    document.querySelectorAll("button").forEach(b => b.disabled = true);

  } catch (error) {
    console.error("Error al votar:", error);
    alert("Hubo un error al registrar tu voto. Intenta nuevamente.");
  }
}


