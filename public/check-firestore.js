// Script para verificar e popular o Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBPvUv2sCOeomoHnE0WIPwGmdJ3NHWP2_4",
  authDomain: "futwear-3eae2.firebaseapp.com",
  projectId: "futwear-3eae2",
  storageBucket: "futwear-3eae2.appspot.com",
  messagingSenderId: "555630014709",
  appId: "1:555630014709:web:2c1460cb26e040444d041e",
  measurementId: "G-L6S9FH3PSX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dados de exemplo para popular o Firestore
const sampleProducts = [
  {
    name: 'Camisa Flamengo 2024',
    price: 140,
    category: 'times-brasileiros',
    description: 'Camisa oficial do Flamengo temporada 2024',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 50,
    team: 'Flamengo',
    league: 'Brasileirão',
    type: 'Time',
    available: true,
    discount: 0,
    destaque: true
  },
  {
    name: 'Camisa Palmeiras 2024',
    price: 135,
    category: 'times-brasileiros',
    description: 'Camisa oficial do Palmeiras temporada 2024',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 45,
    team: 'Palmeiras',
    league: 'Brasileirão',
    type: 'Time',
    available: true,
    discount: 10,
    destaque: false
  },
  {
    name: 'Camisa Brasil 2024',
    price: 150,
    category: 'selecoes',
    description: 'Camisa oficial da Seleção Brasileira 2024',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 100,
    team: 'Brasil',
    league: 'Copa do Mundo',
    type: 'Seleção',
    available: true,
    discount: 0,
    destaque: true
  },
  {
    name: 'Camisa Real Madrid 2024',
    price: 150,
    category: 'times-europeus',
    description: 'Camisa oficial do Real Madrid temporada 2024',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 70,
    team: 'Real Madrid',
    league: 'La Liga',
    type: 'Time',
    available: true,
    discount: 15,
    destaque: false
  },
  {
    name: 'Camisa Barcelona 2024',
    price: 150,
    category: 'times-europeus',
    description: 'Camisa oficial do Barcelona temporada 2024',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 65,
    team: 'Barcelona',
    league: 'La Liga',
    type: 'Time',
    available: true,
    discount: 0,
    destaque: true
  },
  {
    name: 'Camisa Corinthians 2024',
    price: 145,
    category: 'times-brasileiros',
    description: 'Camisa oficial do Corinthians temporada 2024',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 55,
    team: 'Corinthians',
    league: 'Brasileirão',
    type: 'Time',
    available: true,
    discount: 20,
    destaque: false
  }
];

async function checkAndPopulateFirestore() {
  try {
    console.log('🔍 Verificando coleção "camisas"...');

    // Verificar se a coleção existe e tem dados
    const camisasRef = collection(db, 'camisas');
    const snapshot = await getDocs(camisasRef);

    console.log(`📊 Encontrados ${snapshot.docs.length} produtos na coleção "camisas"`);

    if (snapshot.docs.length === 0) {
      console.log('📝 Coleção vazia, populando com dados de exemplo...');

      for (const product of sampleProducts) {
        try {
          await addDoc(camisasRef, product);
          console.log(`✅ Adicionado: ${product.name}`);
        } catch (error) {
          console.error(`❌ Erro ao adicionar ${product.name}:`, error);
        }
      }

      console.log('🎉 Coleção populada com sucesso!');
    } else {
      console.log('✅ Coleção já possui dados');
      snapshot.docs.forEach(doc => {
        console.log(`- ${doc.data().name} (${doc.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar Firestore:', error);
    console.error('Detalhes:', error.message);
  }
}

// Executar quando a página carregar
document.addEventListener('DOMContentLoaded', checkAndPopulateFirestore);

// Exportar para uso em outros scripts
window.checkAndPopulateFirestore = checkAndPopulateFirestore;
