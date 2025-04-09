// Importar Firebase
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { getDatabase, ref, set, get, child } from "firebase/database";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBew8trsnrf8HtTdCxAxywXRj68l-16dok",
  authDomain: "apuestas-7d5ab.firebaseapp.com",
  projectId: "apuestas-7d5ab",
  storageBucket: "apuestas-7d5ab.firebasestorage.app",
  messagingSenderId: "203035537846",
  appId: "1:203035537846:web:6d1e2ae74d539912f91117",
  measurementId: "G-VT58SL38SX"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener servicios de Firebase
const auth = getAuth();
const db = getFirestore();
const realtimeDb = getDatabase();

// Inicializar dinero ficticio del usuario
let dineroUsuario = 1000; // Dinero ficticio inicial

// Función para registrar un nuevo usuario
function registrarUsuario(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Usuario registrado:", user);
    })
    .catch((error) => {
      console.error("Error al registrar usuario:", error);
    });
}

// Función para iniciar sesión con un usuario existente
function iniciarSesion(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Usuario logueado:", user);
    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error);
    });
}

// Función para mostrar partidos desde Firestore
async function obtenerPartidos() {
  const partidosRef = collection(db, "partidos");
  const snapshot = await getDocs(partidosRef);
  const partidos = snapshot.docs.map(doc => doc.data());
  console.log(partidos);
  return partidos;
}

// Función para realizar una apuesta
function hacerApuesta(cuota, cantidad) {
  if (dineroUsuario >= cantidad) {
    dineroUsuario -= cantidad; // Resta la cantidad apostada
    const ganancia = cuota * cantidad;
    dineroUsuario += ganancia; // Suma las ganancias
    console.log(`Apostaste $${cantidad} y ganaste $${ganancia}. Ahora tienes $${dineroUsuario}.`);
  } else {
    console.log("No tienes suficiente dinero.");
  }
}

// Función para obtener el dinero actual del usuario desde Firebase Realtime Database
function obtenerDineroUsuario() {
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  if (userId) {
    const userRef = ref(realtimeDb, 'usuarios/' + userId);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        dineroUsuario = snapshot.val().dinero;
        console.log("Dinero del usuario:", dineroUsuario);
      } else {
        console.log("No se encontró el dinero del usuario.");
      }
    });
  } else {
    console.log("Usuario no autenticado.");
  }
}

// Función para guardar el dinero del usuario en Firebase Realtime Database
function guardarDineroUsuario() {
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  if (userId) {
    const userRef = ref(realtimeDb, 'usuarios/' + userId);
    set(userRef, {
      dinero: dineroUsuario
    });
  } else {
    console.log("Usuario no autenticado.");
  }
}

// Función para actualizar la base de datos con el resultado de una apuesta
function actualizarApuesta(partidoId, resultado) {
  const partidoRef = doc(db, "partidos", partidoId);
  updateDoc(partidoRef, {
    resultado: resultado // Ejemplo: "Equipo A gana"
  });
}

// Función de ejemplo para hacer una apuesta
document.getElementById("apostarButton").addEventListener("click", () => {
  const cantidad = parseFloat(document.getElementById("cantidadApuesta").value);
  const cuota = 2.5; // Ejemplo de cuota
  if (isNaN(cantidad) || cantidad <= 0) {
    alert("Por favor, ingresa una cantidad válida.");
  } else {
    hacerApuesta(cuota, cantidad);
  }
});

// Función para cargar los partidos en la interfaz
async function cargarPartidos() {
  const partidos = await obtenerPartidos();
  const partidosContainer = document.getElementById("partidosContainer");
  partidosContainer.innerHTML = '';
  partidos.forEach((partido) => {
    const partidoDiv = document.createElement("div");
    partidoDiv.className = "partido";
    partidoDiv.innerHTML = `
      <h3>${partido.equipo1} vs ${partido.equipo2}</h3>
      <p>Cuota Equipo 1: ${partido.cuota1}</p>
      <p>Cuota Equipo 2: ${partido.cuota2}</p>
    `;
    partidosContainer.appendChild(partidoDiv);
  });
}

// Llamar a cargar los partidos al iniciar
cargarPartidos();
