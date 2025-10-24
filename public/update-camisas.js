// Script para adicionar novas camisas e atualizar preços existentes no Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBPvUv2sCOeomoHnE0WIPwGmdJ3NHWP2_4",
  authDomain: "futwear-d3c3c.firebaseapp.com",
  projectId: "futwear-d3c3c",
  storageBucket: "futwear-d3c3c.appspot.com",
  messagingSenderId: "696943900731",
  appId: "1:696943900731:web:2c1460cb26e040444d041e",
  measurementId: "G-L6S9FH3PSX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Novas camisas para adicionar
const novasCamisas = [
  {
    name: 'Camisa Corinthians 2024',
    price: 145,
    category: 'times-brasileiros',
    description: 'Camisa oficial do Corinthians temporada 2024',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 60,
    team: 'Corinthians',
    league: 'Brasileirão',
    type: 'Time',
    available: true,
    discount: 0
  },
  {
    name: 'Camisa São Paulo 2024',
    price: 142,
    category: 'times-brasileiros',
    description: 'Camisa oficial do São Paulo temporada 2024',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 55,
    team: 'São Paulo',
    league: 'Brasileirão',
    type: 'Time',
    available: true,
    discount: 0
  },
  {
    name: 'Camisa Santos 2024',
    price: 148,
    category: 'times-brasileiros',
    description: 'Camisa oficial do Santos temporada 2024',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 40,
    team: 'Santos',
    league: 'Brasileirão',
    type: 'Time',
    available: true,
    discount: 0
  },
  {
    name: 'Camisa Vasco 2024',
    price: 143,
    category: 'times-brasileiros',
    description: 'Camisa oficial do Vasco temporada 2024',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 35,
    team: 'Vasco',
    league: 'Brasileirão',
    type: 'Time',
    available: true,
    discount: 0
  },
  {
    name: 'Camisa Botafogo 2024',
    price: 141,
    category: 'times-brasileiros',
    description: 'Camisa oficial do Botafogo temporada 2024',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 30,
    team: 'Botafogo',
    league: 'Brasileirão',
    type: 'Time',
    available: true,
    discount: 0
  },
  {
    name: 'Camisa Argentina 2024',
    price: 155,
    category: 'selecoes',
    description: 'Camisa oficial da Seleção Argentina 2024',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 80,
    team: 'Argentina',
    league: 'Copa do Mundo',
    type: 'Seleção',
    available: true,
    discount: 0
  },
  {
    name: 'Camisa França 2024',
    price: 158,
    category: 'selecoes',
    description: 'Camisa oficial da Seleção Francesa 2024',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 70,
    team: 'França',
    league: 'Copa do Mundo',
    type: 'Seleção',
    available: true,
    discount: 0
  },
  {
    name: 'Camisa Alemanha 2024',
    price: 152,
    category: 'selecoes',
    description: 'Camisa oficial da Seleção Alemã 2024',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 65,
    team: 'Alemanha',
    league: 'Copa do Mundo',
    type: 'Seleção',
    available: true,
    discount: 0
  },
  {
    name: 'Camisa Manchester United 2024',
    price: 162,
    category: 'times-europeus',
    description: 'Camisa oficial do Manchester United temporada 2024',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 75,
    team: 'Manchester United',
    league: 'Premier League',
    type: 'Time',
    available: true,
    discount: 0
  },
  {
    name: 'Camisa Liverpool 2024',
    price: 165,
    category: 'times-europeus',
    description: 'Camisa oficial do Liverpool temporada 2024',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 70,
    team: 'Liverpool',
    league: 'Premier League',
    type: 'Time',
    available: true,
    discount: 0
  }
];

// Função para adicionar novas camisas
async function adicionarNovasCamisas() {
  console.log('🚀 Iniciando adição de novas camisas...');
  
  try {
    for (const camisa of novasCamisas) {
      await addDoc(collection(db, 'camisas'), camisa);
      console.log(`✅ Camisa adicionada: ${camisa.name} - R$ ${camisa.price}`);
    }
    
    console.log('🎉 Todas as novas camisas foram adicionadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao adicionar camisas:', error);
  }
}

// Função para atualizar preços das camisas existentes
async function atualizarPrecosExistentes() {
  console.log('🔄 Iniciando atualização de preços...');
  
  try {
    const camisasSnapshot = await getDocs(collection(db, 'camisas'));
    const precos = [140, 142, 145, 148, 150, 152, 155, 158, 160, 162, 165];
    
    let index = 0;
    for (const docSnapshot of camisasSnapshot.docs) {
      const preco = precos[index % precos.length];
      await updateDoc(doc(db, 'camisas', docSnapshot.id), {
        price: preco
      });
      console.log(`💰 Preço atualizado: ${docSnapshot.data().name} - R$ ${preco}`);
      index++;
    }
    
    console.log('🎉 Todos os preços foram atualizados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao atualizar preços:', error);
  }
}

// Função principal
async function executarAtualizacoes() {
  console.log('🎯 Iniciando atualizações no Firebase...');
  
  // Primeiro atualiza os preços existentes
  await atualizarPrecosExistentes();
  
  // Depois adiciona as novas camisas
  await adicionarNovasCamisas();
  
  console.log('🏁 Todas as atualizações foram concluídas!');
}

// Executar quando o script for carregado
executarAtualizacoes();
