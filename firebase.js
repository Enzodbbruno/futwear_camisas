// Importa as funções necessárias dos SDKs do Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Adicione os SDKs dos produtos Firebase que você deseja usar
// https://firebase.google.com/docs/web/setup#available-libraries

// Configuração do Firebase da sua aplicação web
// Para Firebase JS SDK v7.20.0 e posterior, measurementId é opcional
const firebaseConfig = {
  apiKey: "AIzaSyBPvUv2sCOeomoHnE0WIPwGmdJ3NHWP2_4",
  authDomain: "futwear-d3c3c.firebaseapp.com",
  projectId: "futwear-d3c3c",
  storageBucket: "futwear-d3c3c.firebasestorage.app",
  messagingSenderId: "696943900731",
  appId: "1:696943900731:web:2c1460cb26e040444d041e",
  measurementId: "G-L6S9FH3PSX"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); 