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

// 👥 PARTICIPANTES (MISMO ORIGEN QUE script.js)
const participants = [
  { id: "equipo1", name: "NATH DIAZ" },
  { id: "equipo2", name: "KALLPAY ALLUY" },
  { id: "equipo3", name: "VOLVO TRUCKS MINING CONTRACT MOTA ENGIL" },
  { id: "equipo4", name: "LOS JUSTICIEROS" },
  { id: "equipo5", name: "LOONEY TUNES" },
  { id: "equipo6", name: "RESPLANDECER" },
  { id: "equipo7", name: "LOS RENOS HOMOLOGADOS" },
  { id: "equipo8", name: "RITMO MOTRIZ" }
];

// 📊 Chart setup
const ctx = document.getElementById("chart").getContext("2d");

const chart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: participants.map(p => p.name),
    datasets: [{
      label: "Votos",
      data: Array(participants.length).fill(0),
      borderRadius: 10
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: "#e5e7eb",
          font: {
            size: 14,
            weight: "bold"
          }
        }
      },
      x: {
        ticks: {
          color: "#e5e7eb",
          font: {
            size: 13,
            weight: "600"
          },
          maxRotation: 45,
          minRotation: 30
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: "#e5e7eb",
          font: {
            size: 14,
            weight: "bold"
          }
        }
      },
      tooltip: {
        titleFont: { size: 16 },
        bodyFont: { size: 15 }
      }
    }
  }
});

// 🔄 TIEMPO REAL (CARGA INICIAL + ACTUALIZACIÓN)
db.collection("participants").onSnapshot(snapshot => {
  snapshot.forEach(doc => {
    const index = participants.findIndex(p => p.id === doc.id);
    if (index !== -1) {
      chart.data.datasets[0].data[index] = doc.data().votes || 0;
    }
  });
  chart.update();
});
