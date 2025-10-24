// Script Node.js para inserir produtos na coleção 'camisas' do Firestore
// Rode: node upload-camisas.js

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const produtos = [
  {
    name: "Camisa Titular Real Madrid 23/24",
    image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/9d7366a7a58a43658f84af3c00325b03_9366/Camisa_1_Real_Madrid_23-24_Branco_IB0087_01_laydown.jpg",
    size: "M",
    sizes: ["P", "M", "G", "GG"],
    color: "Branco",
    price: 399.99,
    oldPrice: 449.99,
    discount: 11,
    type: "time",
    team: "Real Madrid",
    league: "La Liga",
    description: "Camisa titular do Real Madrid para a temporada 2023/24. Modelo oficial Adidas, tecido Climalite, escudo bordado.",
    estoque: 15,
    available: true
  },
  {
    name: "Camisa do Brasil 2023",
    image: "https://images.unsplash.com/photo-1614624532983-4fe0333299c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    size: "G",
    sizes: ["P", "M", "G", "GG"],
    color: "Amarelo",
    price: 349.90,
    type: "seleção",
    team: "Brasil",
    league: "Internacional",
    description: "Camisa oficial da Seleção Brasileira 2023. Tecido leve, escudo bordado, modelo torcedor.",
    estoque: 20,
    available: true
  },
  {
    name: "Camisa Barcelona 2023/24",
    image: "https://images.footballfanatics.com/barcelona/barcelona-home-shirt-2023-24_ss4_p-13337735+u-1wz0w7j7wz4wq8q8q8q8+v-2wz0w7j7wz4wq8q8q8q8.jpg",
    size: "P",
    sizes: ["P", "M", "G", "GG"],
    color: "Preta",
    price: 349.90,
    type: "time",
    team: "Barcelona",
    league: "La Liga",
    description: "Camisa oficial do Barcelona para a temporada 2023/24. Produto Nike, escudo bordado, alta qualidade.",
    estoque: 10,
    available: true
  }
];

async function inserirProdutos() {
  for (const produto of produtos) {
    await db.collection('camisas').add(produto);
    console.log(`Produto inserido: ${produto.name}`);
  }
  console.log('Todos os produtos foram inseridos!');
  process.exit();
}

inserirProdutos(); 