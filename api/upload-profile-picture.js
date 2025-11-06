import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file, userId, fileName, fileType } = req.body;

    if (!file || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Converte a string base64 para buffer
    const buffer = Buffer.from(file.split(',')[1], 'base64');
    
    // Cria um nome de arquivo único
    const fileExt = fileType.split('/')[1];
    const uniqueFileName = `${userId}-${Date.now()}.${fileExt}`;
    const storagePath = `profile-pics/${uniqueFileName}`;
    
    // Cria uma referência para o arquivo no Storage
    const storageRef = ref(storage, storagePath);
    
    // Faz o upload do arquivo
    await uploadBytes(storageRef, buffer, {
      contentType: fileType,
      customMetadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString()
      }
    });
    
    // Obtém a URL de download
    const downloadURL = await getDownloadURL(storageRef);
    
    return res.status(200).json({
      success: true,
      url: downloadURL,
      path: storagePath
    });
    
  } catch (error) {
    console.error('Erro no upload da imagem:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao fazer upload da imagem',
      details: error.message
    });
  }
}
