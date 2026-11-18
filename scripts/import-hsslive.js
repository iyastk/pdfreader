const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} = require('firebase/firestore');

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

const ITEMS = [
  // Kerala Padavali
  {
    rawSubject: 'Malayalam',
    title: 'Kerala Padavali - Model Question Paper 2026 (Set A)',
    url: 'https://drive.google.com/open?id=1USvvTubaIrlf56jz0mDCXH8BmPfsJKvS&usp=drive_copy',
  },
  {
    rawSubject: 'Malayalam',
    title: 'Kerala Padavali - Model Question Paper 2026 (Set B)',
    url: 'https://drive.google.com/open?id=1IUgRMLNQQAjIjmd07eagtQSVvpZxa9NM&usp=drive_copy',
  },
  {
    rawSubject: 'Malayalam',
    title: 'Kerala Padavali - Model Question Paper 2026 (Set C)',
    url: 'https://drive.google.com/file/d/1IcZ1sGYO4it4rbl0f9BUEmIZJv29q7t9/view',
  },

  // Adisthana Padavali
  {
    rawSubject: 'Malayalam',
    title: 'Adisthana Padavali - Model Question Paper 2026 (Set A)',
    url: 'https://drive.google.com/open?id=1iTTEczY8qWMSknahUjlb3D0ufXxYo_Xm&usp=drive_copy',
  },
  {
    rawSubject: 'Malayalam',
    title: 'Adisthana Padavali - Model Question Paper 2026 (Set B)',
    url: 'https://drive.google.com/open?id=1NAVyzSMXkilhWFOrAWVasOeYm_sq4dBV&usp=drive_copy',
  },
  {
    rawSubject: 'Malayalam',
    title: 'Adisthana Padavali - Model Question Paper 2026 (Set C)',
    url: 'https://drive.google.com/open?id=1PlDFio_ZG3mMtwT87s23UjLCk3QXZ2Fd&usp=drive_copy',
  },

  // English
  {
    rawSubject: 'English',
    title: 'English - Model Question Paper 2026 (Set A)',
    url: 'https://drive.google.com/open?id=1PZRMBW9RJpVAnbMlXE7skB9mXpGIxlEG&usp=drive_copy',
  },
  {
    rawSubject: 'English',
    title: 'English - Model Question Paper 2026 (Set B)',
    url: 'https://drive.google.com/open?id=1z0z-hUIPSW0k5ML6qOSt3Xk_XVccmcIZ&usp=drive_copy',
  },
  {
    rawSubject: 'English',
    title: 'English - Model Question Paper 2026 (Set C)',
    url: 'https://drive.google.com/open?id=10vwANNq_E_vcuXUbTWaNb2gzlqOm_MvC&usp=drive_copy',
  },

  // Hindi
  {
    rawSubject: 'Hindi',
    title: 'Hindi - Model Question Paper 2026 (Set A)',
    url: 'https://drive.google.com/open?id=15GGql1j_gHrCrk-Hp2JmipKwZ5bT1WRY&usp=drive_copy',
  },
  {
    rawSubject: 'Hindi',
    title: 'Hindi - Model Question Paper 2026 (Set B)',
    url: 'https://drive.google.com/open?id=14qDkcq92r7CVQF9wQd3HyImlL5ql07AB&usp=drive_copy',
  },
  {
    rawSubject: 'Hindi',
    title: 'Hindi - Model Question Paper 2026 (Set C)',
    url: 'https://drive.google.com/open?id=1IlcT2fNGk4EA2Qsvp_BmRmFCuUTJmPzi&usp=drive_copy',
  },

  // Physics (EM)
  {
    rawSubject: 'Physics',
    title: 'Physics (English Medium) - Model Question Paper 2026 (Set A)',
    url: 'https://drive.google.com/open?id=1x62kw05G-zoWQgTYZHJuIjWbeyQ1DaM6&usp=drive_copy',
  },
  {
    rawSubject: 'Physics',
    title: 'Physics (English Medium) - Model Question Paper 2026 (Set B)',
    url: 'https://drive.google.com/open?id=168lPfE0z42jV1ml968KzAIVa58frLhYJ&usp=drive_copy',
  },
  {
    rawSubject: 'Physics',
    title: 'Physics (English Medium) - Model Question Paper 2026 (Set C)',
    url: 'https://drive.google.com/open?id=15C3xO6y1MVzkDhNtXDklBx9_TFtbcvTu&usp=drive_copy',
  },

  // Physics (MM)
  {
    rawSubject: 'Physics',
    title: 'Physics (Malayalam Medium) - Model Question Paper 2026 (Set A)',
    url: 'https://drive.google.com/open?id=1v37AKZTUqStQKAUQ-F_mFfqUtTehxBU0&usp=drive_copy',
  },
  {
    rawSubject: 'Physics',
    title: 'Physics (Malayalam Medium) - Model Question Paper 2026 (Set B)',
    url: 'https://drive.google.com/open?id=1DrAKFQdyIkNfML3el8MeoKvXGtecpFMV&usp=drive_copy',
  },
  {
    rawSubject: 'Physics',
    title: 'Physics (Malayalam Medium) - Model Question Paper 2026 (Set C)',
    url: 'https://drive.google.com/open?id=1lZuYYdMbCjlSzt2cEjFSrG41vAgwtUuD&usp=drive_copy',
  },

  // Chemistry (EM)
  {
    rawSubject: 'Chemistry',
    title: 'Chemistry (English Medium) - Model Question Paper 2026 (Set A)',
    url: 'https://drive.google.com/open?id=15_hhXf5gq3j-sZYWJGXwNZmY3x6zCAUT&usp=drive_copy',
  },
  {
    rawSubject: 'Chemistry',
    title: 'Chemistry (English Medium) - Model Question Paper 2026 (Set B)',
    url: 'https://drive.google.com/open?id=149YnsVs3KyWoeic-cGyt0J41ChwSYipE&usp=drive_copy',
  },
  {
    rawSubject: 'Chemistry',
    title: 'Chemistry (English Medium) - Model Question Paper 2026 (Set C)',
    url: 'https://drive.google.com/open?id=1kKh5LmHibgwAEg50CiNaEEt6MhOfD8Qy&usp=drive_copy',
  },

  // Chemistry (MM)
  {
    rawSubject: 'Chemistry',
    title: 'Chemistry (Malayalam Medium) - Model Question Paper 2026 (Set A)',
    url: 'https://drive.google.com/open?id=1OsEJq6li1ehmrI5y0osPKCAiYc9k-M4H&usp=drive_copy',
  },
  {
    rawSubject: 'Chemistry',
    title: 'Chemistry (Malayalam Medium) - Model Question Paper 2026 (Set B)',
    url: 'https://drive.google.com/open?id=1_bp35p3ZXgkiXMYAeM7b6K26UtSb2IWl&usp=drive_copy',
  },
  {
    rawSubject: 'Chemistry',
    title: 'Chemistry (Malayalam Medium) - Model Question Paper 2026 (Set C)',
    url: 'https://drive.google.com/open?id=11kvl_WHCpzz6Pb0CcNVRCp24WJsQ4_kP&usp=drive_copy',
  },

  // Mathematics (EM)
  {
    rawSubject: 'Maths',
    title: 'Mathematics (English Medium) - Model Question Paper 2026 (Set A)',
    url: 'https://drive.google.com/open?id=1iNPmMO-jy_ZUhdsMMAAKDXAqBqXNhFbH&usp=drive_copy',
  },
  {
    rawSubject: 'Maths',
    title: 'Mathematics (English Medium) - Model Question Paper 2026 (Set B)',
    url: 'https://drive.google.com/open?id=1AxVlGyD-L6AxLL8GJeJxCo8sBn92Twfk&usp=drive_copy',
  },
  {
    rawSubject: 'Maths',
    title: 'Mathematics (English Medium) - Model Question Paper 2026 (Set C)',
    url: 'https://drive.google.com/open?id=16qQhOnwsVyoqYevyssIIxSS0ffrM9sSI&usp=drive_copy',
  },

  // Mathematics (MM)
  {
    rawSubject: 'Maths',
    title: 'Mathematics (Malayalam Medium) - Model Question Paper 2026 (Set A)',
    url: 'https://drive.google.com/open?id=11k6Gr-2cQz7MuYulDvLVE8EXYUrXT3D6&usp=drive_copy',
  },
  {
    rawSubject: 'Maths',
    title: 'Mathematics (Malayalam Medium) - Model Question Paper 2026 (Set B)',
    url: 'https://drive.google.com/open?id=1e-LtPWXZHFmPD32qixUgaADm7FuyuSNC&usp=drive_copy',
  },
  {
    rawSubject: 'Maths',
    title: 'Mathematics (Malayalam Medium) - Model Question Paper 2026 (Set C)',
    url: 'https://drive.google.com/open?id=115_pXf9_kNQ1jOv7P6J3wmLls_ghNdQr&usp=drive_copy',
  },

  // Biology (EM)
  {
    rawSubject: 'Biology',
    title: 'Biology (English Medium) - Model Question Paper 2026 (Set A)',
    url: 'https://drive.google.com/open?id=1lVTP9Z1s-202SofxVUrocx325SI4qAvh&usp=drive_copy',
  },
  {
    rawSubject: 'Biology',
    title: 'Biology (English Medium) - Model Question Paper 2026 (Set B)',
    url: 'https://drive.google.com/open?id=1SKe3bxEPZabzneNl8RtweBtH_bI1MzAi&usp=drive_copy',
  },
  {
    rawSubject: 'Biology',
    title: 'Biology (English Medium) - Model Question Paper 2026 (Set C)',
    url: 'https://drive.google.com/open?id=1sgRbG07IVbZG_Qaq9Wg6-6Mk7c11ZM6J&usp=drive_copy',
  },

  // Biology (MM)
  {
    rawSubject: 'Biology',
    title: 'Biology (Malayalam Medium) - Model Question Paper 2026 (Set A)',
    url: 'https://drive.google.com/open?id=1wQlCnnHaEhtbavyyFlUB1wjazzCbW1GK&usp=drive_copy',
  },
  {
    rawSubject: 'Biology',
    title: 'Biology (Malayalam Medium) - Model Question Paper 2026 (Set B)',
    url: 'https://drive.google.com/open?id=1IJi51sxfRMAJtuSi7exmIzTuIegDWbv8&usp=drive_copy',
  },
  {
    rawSubject: 'Biology',
    title: 'Biology (Malayalam Medium) - Model Question Paper 2026 (Set C)',
    url: 'https://drive.google.com/open?id=1wysQ4xvGK0oW2PJI-KJuoiAsteGTLRil&usp=drive_copy',
  },

  // Social Science (EM)
  {
    rawSubject: 'social science',
    title: 'Social Science (English Medium) - Model Question Paper 2026 (Set A)',
    url: 'https://drive.google.com/open?id=1oYPnSU2dxbpINRv3gQYJy1GLAcAU0wK6&usp=drive_copy',
  },
  {
    rawSubject: 'social science',
    title: 'Social Science (English Medium) - Model Question Paper 2026 (Set B)',
    url: 'https://drive.google.com/open?id=1VBcx6pK1i6ACbz6Gyg90_KN1-6ry2LD0&usp=drive_copy',
  },
  {
    rawSubject: 'social science',
    title: 'Social Science (English Medium) - Model Question Paper 2026 (Set C)',
    url: 'https://drive.google.com/open?id=1UMTejaCkKKD_9YcsrwsR4jpDfG1zI-nT&usp=drive_copy',
  },

  // Social Science (MM)
  {
    rawSubject: 'social science',
    title: 'Social Science (Malayalam Medium) - Model Question Paper 2026 (Set A)',
    url: 'https://drive.google.com/open?id=1l17o7Lomfd2X93DsPK0cDQy4qPzlTQf7&usp=drive_copy',
  },
  {
    rawSubject: 'social science',
    title: 'Social Science (Malayalam Medium) - Model Question Paper 2026 (Set B)',
    url: 'https://drive.google.com/open?id=1ResCRcDPuUJNNaU_YT8C_LOPM9nMMNbJ&usp=drive_copy',
  },
  {
    rawSubject: 'social science',
    title: 'Social Science (Malayalam Medium) - Model Question Paper 2026 (Set C)',
    url: 'https://drive.google.com/open?id=1zBlctpOjRTOXQR6vLzjQdP-BLzpzwwzD&usp=drive_copy',
  },
];

async function run() {
  console.log('Fetching existing categories and documents...');
  const catSnap = await getDocs(collection(db, 'categories'));
  const catMap = {}; // name.toLowerCase() -> id
  catSnap.forEach((doc) => {
    catMap[doc.data().name.trim().toLowerCase()] = doc.id;
  });

  // Ensure Malayalam category exists
  if (!catMap['malayalam']) {
    console.log('Creating Malayalam category...');
    const newCatRef = await addDoc(collection(db, 'categories'), {
      name: 'Malayalam',
      createdAt: serverTimestamp(),
    });
    catMap['malayalam'] = newCatRef.id;
    console.log(`Created Malayalam category with id: ${newCatRef.id}`);
  }

  // Fetch existing documents to prevent duplicate links
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

  for (const item of ITEMS) {
    const embedUrl = convertDriveLink(item.url);
    if (existingUrls.has(embedUrl) || existingUrls.has(item.url)) {
      console.log(`[SKIP - Already exists] ${item.title}`);
      skippedCount++;
      continue;
    }

    const targetCatKey = item.rawSubject.trim().toLowerCase();
    const categoryId = catMap[targetCatKey];
    if (!categoryId) {
      console.error(`Error: Category "${item.rawSubject}" not found in Firestore!`);
      continue;
    }

    await addDoc(collection(db, 'documents'), {
      title: item.title,
      categoryId,
      type: 'drive_link',
      fileUrl: embedUrl,
      createdAt: serverTimestamp(),
    });

    existingUrls.add(embedUrl);
    console.log(`[ADDED] ${item.title} -> Category ID: ${categoryId}`);
    addedCount++;
  }

  console.log(`\n--- IMPORT COMPLETE ---`);
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped (already exist): ${skippedCount}`);
  console.log(`Total processed: ${ITEMS.length}`);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Import failed:', err);
    process.exit(1);
  });
