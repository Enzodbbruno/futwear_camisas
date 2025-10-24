// Script Node.js para inserir várias camisas na coleção 'camisas' do Firestore
// Rode: node upload-camisas-massivo.js

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const produtos = [
  // Times Brasileirão
  {
    name: "Camisa Flamengo I 23/24",
    image: "https://images.unsplash.com/photo-1543357480-c60d400e8073?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    size: "M",
    sizes: ["P", "M", "G", "GG"],
    color: "Vermelha/Preta",
    price: 349.99,
    oldPrice: 399.99,
    discount: 13,
    type: "time",
    team: "Flamengo",
    league: "Brasileirão",
    description: "Camisa oficial do Flamengo para a temporada 2023/24.",
    estoque: 20,
    available: true
  },
  {
    name: "Camisa Palmeiras I 23/24",
    image: "https://images.footballfanatics.com/palmeiras/palmeiras-home-shirt-2023-24_ss4_p-13337735+u-1wz0w7j7wz4wq8q8q8q8+v-2wz0w7j7wz4wq8q8q8q8.jpg",
    size: "G",
    sizes: ["P", "M", "G", "GG"],
    color: "Verde",
    price: 349.99,
    type: "time",
    team: "Palmeiras",
    league: "Brasileirão",
    description: "Camisa oficial do Palmeiras 2023/24.",
    estoque: 15,
    available: true
  },
  {
    name: "Camisa Corinthians I 23/24",
    image: "https://images.unsplash.com/photo-1543357480-c60d400e8073?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    size: "G",
    sizes: ["P", "M", "G", "GG"],
    color: "Branca",
    price: 329.99,
    oldPrice: 399.99,
    discount: 18,
    type: "time",
    team: "Corinthians",
    league: "Brasileirão",
    description: "Camisa oficial do Corinthians 2023/24.",
    estoque: 10,
    available: true
  },
  {
    name: "Camisa São Paulo I 23/24",
    image: "https://images.footballfanatics.com/sao-paulo/sao-paulo-home-shirt-2023-24_ss4_p-13337735+u-1wz0w7j7wz4wq8q8q8q8+v-2wz0w7j7wz4wq8q8q8q8.jpg",
    size: "M",
    sizes: ["P", "M", "G", "GG"],
    color: "Branca",
    price: 349.99,
    type: "time",
    team: "São Paulo",
    league: "Brasileirão",
    description: "Camisa oficial do São Paulo 2023/24.",
    estoque: 12,
    available: true
  },
  {
    name: "Camisa Grêmio I 23/24",
    image: "https://images.footballfanatics.com/gremio/gremio-home-shirt-2023-24_ss4_p-13337735+u-1wz0w7j7wz4wq8q8q8q8+v-2wz0w7j7wz4wq8q8q8q8.jpg",
    size: "G",
    sizes: ["P", "M", "G", "GG"],
    color: "Azul/Preta",
    price: 349.99,
    type: "time",
    team: "Grêmio",
    league: "Brasileirão",
    description: "Camisa oficial do Grêmio 2023/24.",
    estoque: 8,
    available: true
  },
  {
    name: "Camisa Internacional I 23/24",
    image: "https://images.footballfanatics.com/internacional/internacional-home-shirt-2023-24_ss4_p-13337735+u-1wz0w7j7wz4wq8q8q8q8+v-2wz0w7j7wz4wq8q8q8q8.jpg",
    size: "M",
    sizes: ["P", "M", "G", "GG"],
    color: "Vermelha",
    price: 349.99,
    type: "time",
    team: "Internacional",
    league: "Brasileirão",
    description: "Camisa oficial do Internacional 2023/24.",
    estoque: 7,
    available: true
  },
  // Seleções
  {
    name: "Camisa Seleção Argentina 2022",
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    size: "M",
    sizes: ["P", "M", "G", "GG"],
    color: "Azul/Branca",
    price: 299.99,
    oldPrice: 399.99,
    discount: 25,
    type: "seleção",
    team: "Argentina",
    league: "Internacional",
    description: "Camisa oficial da Seleção Argentina 2022.",
    estoque: 10,
    available: true
  },
  {
    name: "Camisa Seleção França 2022",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    size: "G",
    sizes: ["P", "M", "G", "GG"],
    color: "Azul",
    price: 299.99,
    type: "seleção",
    team: "França",
    league: "Internacional",
    description: "Camisa oficial da Seleção Francesa 2022.",
    estoque: 8,
    available: true
  },
  {
    name: "Camisa Seleção Alemanha 2022",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    size: "G",
    sizes: ["P", "M", "G", "GG"],
    color: "Branca/Preta",
    price: 299.99,
    type: "seleção",
    team: "Alemanha",
    league: "Internacional",
    description: "Camisa oficial da Seleção Alemã 2022.",
    estoque: 8,
    available: true
  },
  // Times Europeus
  {
    name: "Camisa Real Madrid 23/24",
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
    description: "Camisa titular do Real Madrid para a temporada 2023/24.",
    estoque: 15,
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
    description: "Camisa oficial do Barcelona para a temporada 2023/24.",
    estoque: 10,
    available: true
  },
  {
    name: "Camisa Manchester United Away 23/24",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    size: "G",
    sizes: ["P", "M", "G", "GG"],
    color: "Branca/Verde",
    price: 389.99,
    type: "time",
    team: "Manchester United",
    league: "Premier League",
    description: "Camisa away do Manchester United 2023/24.",
    estoque: 12,
    available: true
  },
  {
    name: "Camisa Chelsea Home 23/24",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    size: "M",
    sizes: ["P", "M", "G", "GG"],
    color: "Azul",
    price: 369.99,
    type: "time",
    team: "Chelsea",
    league: "Premier League",
    description: "Camisa home do Chelsea 2023/24.",
    estoque: 9,
    available: true
  },
  // Retrô
  {
    name: "Camisa Retrô Brasil 1970",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    size: "M",
    sizes: ["P", "M", "G", "GG"],
    color: "Amarelo",
    price: 129.99,
    oldPrice: 249.99,
    discount: 48,
    type: "retrô",
    team: "Brasil",
    league: "Internacional",
    description: "Camisa retrô da Seleção Brasileira de 1970.",
    estoque: 5,
    available: true
  },
  {
    name: "Camisa Retrô Corinthians 1990",
    image: "https://images.unsplash.com/photo-1543357480-c60d400e8073?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    size: "G",
    sizes: ["P", "M", "G", "GG"],
    color: "Branca",
    price: 129.99,
    oldPrice: 229.99,
    discount: 43,
    type: "retrô",
    team: "Corinthians",
    league: "Brasileirão",
    description: "Camisa retrô do Corinthians campeão brasileiro de 1990.",
    estoque: 4,
    available: true
  },
  {
    name: "Camisa Retrô Flamengo 1981",
    image: "https://images.unsplash.com/photo-1543357480-c60d400e8073?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    size: "M",
    sizes: ["P", "M", "G", "GG"],
    color: "Vermelha/Preta",
    price: 129.99,
    oldPrice: 199.99,
    discount: 35,
    type: "retrô",
    team: "Flamengo",
    league: "Brasileirão",
    description: "Camisa retrô do Flamengo campeão mundial de 1981.",
    estoque: 6,
    available: true
  },
  // Mais exemplos para chegar a 30 produtos
  {
    name: "Camisa Retrô Palmeiras 1993",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    size: "G",
    sizes: ["P", "M", "G", "GG"],
    color: "Verde",
    price: 129.99,
    oldPrice: 199.99,
    discount: 35,
    type: "retrô",
    team: "Palmeiras",
    league: "Brasileirão",
    description: "Camisa retrô do Palmeiras campeão brasileiro de 1993.",
    estoque: 3,
    available: true
  },
  {
    name: "Camisa Retrô São Paulo 1992",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    size: "M",
    sizes: ["P", "M", "G", "GG"],
    color: "Branca",
    price: 129.99,
    oldPrice: 199.99,
    discount: 35,
    type: "retrô",
    team: "São Paulo",
    league: "Brasileirão",
    description: "Camisa retrô do São Paulo campeão mundial de 1992.",
    estoque: 2,
    available: true
  },
  {
    name: "Camisa Retrô Grêmio 1995",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    size: "G",
    sizes: ["P", "M", "G", "GG"],
    color: "Azul/Preta",
    price: 129.99,
    oldPrice: 199.99,
    discount: 35,
    type: "retrô",
    team: "Grêmio",
    league: "Brasileirão",
    description: "Camisa retrô do Grêmio campeão da Libertadores de 1995.",
    estoque: 2,
    available: true
  },
  // Camisas com desconto especial
  {
    name: "Camisa Promoção Barcelona 2023",
    image: "https://images.footballfanatics.com/barcelona/barcelona-home-shirt-2023-24_ss4_p-13337735+u-1wz0w7j7wz4wq8q8q8q8+v-2wz0w7j7wz4wq8q8q8q8.jpg",
    size: "M",
    sizes: ["P", "M", "G", "GG"],
    color: "Azul/Preta",
    price: 129.99,
    oldPrice: 299.99,
    discount: 57,
    type: "time",
    team: "Barcelona",
    league: "La Liga",
    description: "Camisa Barcelona 2023 em promoção.",
    estoque: 5,
    available: true
  },
  {
    name: "Camisa Promoção Real Madrid 2023",
    image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/9d7366a7a58a43658f84af3c00325b03_9366/Camisa_1_Real_Madrid_23-24_Branco_IB0087_01_laydown.jpg",
    size: "G",
    sizes: ["P", "M", "G", "GG"],
    color: "Branca",
    price: 129.99,
    oldPrice: 299.99,
    discount: 57,
    type: "time",
    team: "Real Madrid",
    league: "La Liga",
    description: "Camisa Real Madrid 2023 em promoção.",
    estoque: 5,
    available: true
  },
  // Adicione mais produtos se quiser, seguindo o mesmo padrão
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