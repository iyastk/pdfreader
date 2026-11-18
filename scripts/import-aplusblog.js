const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = {
  apiKey: 'AIzaSyDFEbRePoY9ceZwjjWzHNo9aqJTtaJdl8w',
  authDomain: 'pdfreader-f74ea.firebaseapp.com',
  projectId: 'pdfreader-f74ea',
  storageBucket: 'pdfreader-f74ea.firebasestorage.app',
  messagingSenderId: '777347589000',
  appId: '1:777347589000:web:b1c0e512855b0dd0ab103d',
  measurementId: 'G-FDPQJN3Z9X',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function convertDriveLink(url) {
  const trimmed = url.trim();
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
  }
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch) {
    return `https://drive.google.com/file/d/${idParamMatch[1]}/preview`;
  }
  return trimmed;
}

const path = require('path');
const jsonPath = fs.existsSync('aplusblog_extracted.json')
  ? 'aplusblog_extracted.json'
  : path.resolve(__dirname, '../../aplusblog_extracted.json');
const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

function formatTitle(item) {
  const s = item.subject;
  let t = item.linkText;
  if (!t || t === '&nbsp;') {
    t = 'Question Paper';
  }

  // Format type
  let docType = 'Question Paper';
  if (t.toLowerCase().includes('answer')) {
    docType = 'Answer Key';
  }

  let medium = '';
  if (t.includes('[EM]')) medium = ' (English Medium)';
  else if (t.includes('[MM]')) medium = ' (Malayalam Medium)';

  let subjectName = s;
  if (s === 'MATHEMATICS') subjectName = 'Mathematics';
  else if (s === 'BIOLOGY') subjectName = 'Biology';
  else if (s === 'SOCIAL SCIENCE') subjectName = 'Social Science';
  else if (s === 'CHEMISTRY') subjectName = 'Chemistry';
  else if (s === 'PHYSICS') subjectName = 'Physics';
  else if (s === 'HINDI') subjectName = 'Hindi';
  else if (s === 'ENGLISH') subjectName = 'English';
  else if (s === 'SANSKRIT') subjectName = 'Sanskrit';
  else if (s === 'URDU') subjectName = 'Urdu';
  else if (s === 'ARABIC') subjectName = 'Arabic';
  else if (s === 'MALAYALAM BT') subjectName = 'Kerala Padavali';
  else if (s === 'MALAYALAM AT') subjectName = 'Adisthana Padavali';

  return `${subjectName}${medium} - Model Exam 2026 ${docType}`;
}

function getCategoryName(rawSubject) {
  const s = rawSubject.toUpperCase();
  if (s.includes('MATH')) return 'Maths';
  if (s.includes('BIOLOGY')) return 'Biology';
  if (s.includes('SOCIAL')) return 'social science';
  if (s.includes('CHEM')) return 'Chemistry';
  if (s.includes('PHYSIC')) return 'Physics';
  if (s.includes('HINDI')) return 'Hindi';
  if (s.includes('ENGLISH')) return 'English';
  if (s.includes('MALAYALAM')) return 'Malayalam';
  if (s.includes('ARABIC')) return 'Arabic';
  if (s.includes('URDU')) return 'Urdu';
  if (s.includes('SANSKRIT')) return 'Sanskrit';
  return rawSubject;
}

async function run() {
  console.log('Fetching existing categories and documents...');
  const catSnap = await getDocs(collection(db, 'categories'));
  const catMap = {}; // name.toLowerCase() -> id
  catSnap.forEach((doc) => {
    catMap[doc.data().name.trim().toLowerCase()] = doc.id;
  });

  const docSnap = await getDocs(collection(db, 'documents'));
  const existingUrls = new Set();
  docSnap.forEach((d) => {
    const data = d.data();
    if (data.fileUrl) {
      existingUrls.add(data.fileUrl);
    }
  });

  console.log(`Found ${existingUrls.size} existing document URLs in database.`);

  let addedCount = 0;
  let skippedCount = 0;

  for (const item of rawData) {
    if (!item.url || item.linkText === '&nbsp;') continue;

    const embedUrl = convertDriveLink(item.url);
    if (existingUrls.has(embedUrl) || existingUrls.has(item.url)) {
      console.log(`[SKIP - Already exists] ${item.url.slice(0, 50)}`);
      skippedCount++;
      continue;
    }

    const catName = getCategoryName(item.subject);
    const catKey = catName.trim().toLowerCase();

    // Create category if it doesn't exist
    if (!catMap[catKey]) {
      console.log(`Creating category "${catName}"...`);
      const newCat = await addDoc(collection(db, 'categories'), {
        name: catName,
        createdAt: serverTimestamp(),
      });
      catMap[catKey] = newCat.id;
      console.log(`Created category "${catName}" with ID ${newCat.id}`);
    }

    const categoryId = catMap[catKey];
    const title = formatTitle(item);

    await addDoc(collection(db, 'documents'), {
      title,
      categoryId,
      type: 'drive_link',
      fileUrl: embedUrl,
      createdAt: serverTimestamp(),
    });

    existingUrls.add(embedUrl);
    console.log(`[ADDED] ${title} -> Category: ${catName}`);
    addedCount++;
  }

  console.log(`\n--- IMPORT COMPLETE ---`);
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Failed:', e);
    process.exit(1);
  });
