export type Lesson = {
  id: string;
  title: string;
  arabicTitle: string;
  description: string;
  grade: "VII" | "VIII" | "IX";
  level: "Pemula" | "Menengah";
  duration: string;
  color: string;
  icon: string;
  words: { arabic: string; latin: string; meaning: string; example: string }[];
  dialogue: { speaker: string; arabic: string; meaning: string }[];
};

export const lessons: Lesson[] = [
  {
    id: "greetings",
    title: "Salam dan Perkenalan",
    arabicTitle: "التَّحِيَّةُ وَالتَّعَارُفُ",
    description: "Belajar menyapa, memperkenalkan diri, dan menanyakan kabar.",
    grade: "VII",
    level: "Pemula",
    duration: "10 menit",
    color: "mint",
    icon: "👋",
    words: [
      { arabic: "السَّلَامُ عَلَيْكُمْ", latin: "As-salāmu 'alaikum", meaning: "Semoga keselamatan tercurah kepadamu", example: "السَّلَامُ عَلَيْكُمْ يَا أَحْمَدُ" },
      { arabic: "مَا اسْمُكَ؟", latin: "Mā ismuka?", meaning: "Siapa namamu? (laki-laki)", example: "مَا اسْمُكَ يَا صَدِيقِي؟" },
      { arabic: "اِسْمِي", latin: "Ismī", meaning: "Nama saya", example: "اِسْمِي فَاطِمَةُ" },
      { arabic: "كَيْفَ حَالُكَ؟", latin: "Kaifa ḥāluka?", meaning: "Bagaimana kabarmu? (laki-laki)", example: "كَيْفَ حَالُكَ الْيَوْمَ؟" },
    ],
    dialogue: [
      { speaker: "أَحْمَدُ", arabic: "السَّلَامُ عَلَيْكُمْ", meaning: "Assalamu'alaikum." },
      { speaker: "عَلِيٌّ", arabic: "وَعَلَيْكُمُ السَّلَامُ", meaning: "Wa'alaikumussalam." },
      { speaker: "أَحْمَدُ", arabic: "مَا اسْمُكَ؟", meaning: "Siapa namamu?" },
      { speaker: "عَلِيٌّ", arabic: "اِسْمِي عَلِيٌّ. وَمَا اسْمُكَ؟", meaning: "Nama saya Ali. Siapa namamu?" },
    ],
  },
  {
    id: "family",
    title: "Keluargaku",
    arabicTitle: "أُسْرَتِي",
    description: "Menyebutkan anggota keluarga dan menjelaskan hubungan keluarga.",
    grade: "VII",
    level: "Pemula",
    duration: "12 menit",
    color: "peach",
    icon: "👨‍👩‍👧",
    words: [
      { arabic: "أَبٌ", latin: "Abun", meaning: "Ayah", example: "هَذَا أَبِي" },
      { arabic: "أُمٌّ", latin: "Ummun", meaning: "Ibu", example: "هَذِهِ أُمِّي" },
      { arabic: "أَخٌ", latin: "Akhun", meaning: "Saudara laki-laki", example: "لِي أَخٌ وَاحِدٌ" },
      { arabic: "أُخْتٌ", latin: "Ukhtun", meaning: "Saudara perempuan", example: "أُخْتِي طَالِبَةٌ" },
    ],
    dialogue: [
      { speaker: "مَرْيَمُ", arabic: "مَنْ هَذَا؟", meaning: "Siapa ini?" },
      { speaker: "سَلْمَى", arabic: "هَذَا أَبِي", meaning: "Ini ayah saya." },
      { speaker: "مَرْيَمُ", arabic: "وَمَنْ هَذِهِ؟", meaning: "Dan siapa ini?" },
      { speaker: "سَلْمَى", arabic: "هَذِهِ أُمِّي", meaning: "Ini ibu saya." },
    ],
  },
  {
    id: "school",
    title: "Di Sekolah",
    arabicTitle: "فِي الْمَدْرَسَةِ",
    description: "Mengenal benda di kelas, mata pelajaran, dan kegiatan sekolah.",
    grade: "VII",
    level: "Pemula",
    duration: "15 menit",
    color: "lavender",
    icon: "🏫",
    words: [
      { arabic: "مَدْرَسَةٌ", latin: "Madrasatun", meaning: "Sekolah", example: "مَدْرَسَتِي جَمِيلَةٌ" },
      { arabic: "كِتَابٌ", latin: "Kitābun", meaning: "Buku", example: "هَذَا كِتَابٌ جَدِيدٌ" },
      { arabic: "قَلَمٌ", latin: "Qalamun", meaning: "Pulpen", example: "عِنْدِي قَلَمٌ أَزْرَقُ" },
      { arabic: "مُعَلِّمٌ", latin: "Mu'allimun", meaning: "Guru laki-laki", example: "الْمُعَلِّمُ فِي الْفَصْلِ" },
    ],
    dialogue: [
      { speaker: "الْمُعَلِّمُ", arabic: "أَيْنَ كِتَابُكَ؟", meaning: "Di mana bukumu?" },
      { speaker: "الطَّالِبُ", arabic: "كِتَابِي عَلَى الْمَكْتَبِ", meaning: "Buku saya di atas meja." },
    ],
  },
  {
    id: "hobbies",
    title: "Hobi dan Kegemaran",
    arabicTitle: "الْهِوَايَةُ",
    description: "Mengungkapkan hobi, kesukaan, dan aktivitas waktu luang.",
    grade: "VIII",
    level: "Pemula",
    duration: "12 menit",
    color: "yellow",
    icon: "⚽",
    words: [
      { arabic: "هِوَايَةٌ", latin: "Hiwāyatun", meaning: "Hobi", example: "هِوَايَتِي الْقِرَاءَةُ" },
      { arabic: "قِرَاءَةٌ", latin: "Qirā'atun", meaning: "Membaca", example: "أُحِبُّ الْقِرَاءَةَ" },
      { arabic: "رِيَاضَةٌ", latin: "Riyāḍatun", meaning: "Olahraga", example: "أُمَارِسُ الرِّيَاضَةَ" },
      { arabic: "رَسْمٌ", latin: "Rasmun", meaning: "Menggambar", example: "أُحِبُّ الرَّسْمَ" },
    ],
    dialogue: [
      { speaker: "زَيْدٌ", arabic: "مَا هِوَايَتُكَ؟", meaning: "Apa hobimu?" },
      { speaker: "عُمَرُ", arabic: "هِوَايَتِي لَعِبُ كُرَةِ الْقَدَمِ", meaning: "Hobi saya bermain sepak bola." },
    ],
  },
  {
    id: "daily",
    title: "Kegiatan Sehari-hari",
    arabicTitle: "الْأَعْمَالُ الْيَوْمِيَّةُ",
    description: "Menceritakan rutinitas dari bangun tidur hingga malam hari.",
    grade: "VIII",
    level: "Menengah",
    duration: "15 menit",
    color: "blue",
    icon: "🌤️",
    words: [
      { arabic: "أَسْتَيْقِظُ", latin: "Astaiqiẓu", meaning: "Saya bangun tidur", example: "أَسْتَيْقِظُ فِي السَّاعَةِ الْخَامِسَةِ" },
      { arabic: "أَذْهَبُ", latin: "Adhhabu", meaning: "Saya pergi", example: "أَذْهَبُ إِلَى الْمَدْرَسَةِ" },
      { arabic: "أَدْرُسُ", latin: "Adrusu", meaning: "Saya belajar", example: "أَدْرُسُ اللُّغَةَ الْعَرَبِيَّةَ" },
      { arabic: "أَنَامُ", latin: "Anāmu", meaning: "Saya tidur", example: "أَنَامُ فِي السَّاعَةِ التَّاسِعَةِ" },
    ],
    dialogue: [
      { speaker: "عَائِشَةُ", arabic: "مَتَى تَذْهَبِينَ إِلَى الْمَدْرَسَةِ؟", meaning: "Kapan kamu pergi ke sekolah?" },
      { speaker: "زَيْنَبُ", arabic: "أَذْهَبُ فِي السَّاعَةِ السَّابِعَةِ", meaning: "Saya pergi pukul tujuh." },
    ],
  },
  {
    id: "market",
    title: "Di Pasar",
    arabicTitle: "فِي السُّوقِ",
    description: "Berlatih bertanya harga, membeli barang, dan bertransaksi.",
    grade: "IX",
    level: "Menengah",
    duration: "15 menit",
    color: "pink",
    icon: "🛍️",
    words: [
      { arabic: "سُوقٌ", latin: "Sūqun", meaning: "Pasar", example: "أَذْهَبُ إِلَى السُّوقِ" },
      { arabic: "بِكَمْ؟", latin: "Bikam?", meaning: "Berapa harganya?", example: "بِكَمْ هَذَا الْكِتَابُ؟" },
      { arabic: "رَخِيصٌ", latin: "Rakhīṣun", meaning: "Murah", example: "هَذَا الْقَمِيصُ رَخِيصٌ" },
      { arabic: "غَالٍ", latin: "Ghālin", meaning: "Mahal", example: "هَذَا الْحِذَاءُ غَالٍ" },
    ],
    dialogue: [
      { speaker: "الْمُشْتَرِي", arabic: "بِكَمْ هَذَا الْكِتَابُ؟", meaning: "Berapa harga buku ini?" },
      { speaker: "الْبَائِعُ", arabic: "بِعَشَرَةِ آلَافِ رُوبِيَّةٍ", meaning: "Sepuluh ribu rupiah." },
    ],
  },
];

export const vocabulary = lessons.flatMap((lesson) =>
  lesson.words.map((word) => ({ ...word, category: lesson.title, lessonId: lesson.id }))
);

export type QuizQuestion = {
  question: string;
  arabic: string;
  options: string[];
  answer: number;
  explanation: string;
};

export const quizQuestions: QuizQuestion[] = [
  {
    question: "Apa arti dari kalimat berikut?",
    arabic: "مَا اسْمُكَ؟",
    options: ["Siapa namamu?", "Di mana rumahmu?", "Apa hobimu?", "Bagaimana kabarmu?"],
    answer: 0,
    explanation: "مَا اسْمُكَ؟ berarti 'Siapa namamu?' Kalimat ini digunakan untuk menanyakan nama lawan bicara laki-laki.",
  },
  {
    question: "Pilih bahasa Arab yang tepat untuk 'Ibu saya'.",
    arabic: "...",
    options: ["أَبِي", "أُمِّي", "أَخِي", "أُخْتِي"],
    answer: 1,
    explanation: "أُمِّي (ummī) berarti ibu saya. أَبِي berarti ayah saya.",
  },
  {
    question: "Apa arti kata كِتَابٌ?",
    arabic: "كِتَابٌ",
    options: ["Pulpen", "Meja", "Buku", "Sekolah"],
    answer: 2,
    explanation: "كِتَابٌ (kitābun) berarti buku.",
  },
  {
    question: "Lengkapi ungkapan salam berikut.",
    arabic: "السَّلَامُ عَلَيْكُمْ ...",
    options: ["صَبَاحُ الْخَيْرِ", "وَعَلَيْكُمُ السَّلَامُ", "مَعَ السَّلَامَةِ", "شُكْرًا"],
    answer: 1,
    explanation: "Jawaban salam السَّلَامُ عَلَيْكُمْ adalah وَعَلَيْكُمُ السَّلَامُ.",
  },
  {
    question: "Apa arti بِكَمْ؟ ketika berbelanja?",
    arabic: "بِكَمْ؟",
    options: ["Di mana?", "Siapa?", "Kapan?", "Berapa harganya?"],
    answer: 3,
    explanation: "بِكَمْ؟ digunakan untuk menanyakan harga suatu barang: 'Berapa harganya?'.",
  },
];

export const roleplays = [
  { id: "introduce", title: "Berkenalan dengan Teman", subtitle: "Saling menyapa dan memperkenalkan diri", icon: "🤝", level: "Pemula", color: "mint", prompt: "Kita sedang berkenalan di hari pertama sekolah. Kamu adalah teman sekelas siswa. Mulai dengan salam dan tanyakan nama, kelas, serta asal. Ajukan satu pertanyaan setiap giliran." },
  { id: "classroom", title: "Di Dalam Kelas", subtitle: "Berbicara dengan guru dan teman", icon: "📚", level: "Pemula", color: "lavender", prompt: "Kita sedang berada di kelas bahasa Arab. Kamu berperan sebagai guru yang ramah. Tanyakan benda-benda di kelas dan instruksi sederhana. Ajukan satu pertanyaan setiap giliran." },
  { id: "canteen", title: "Di Kantin Sekolah", subtitle: "Memesan makanan dan minuman", icon: "🥪", level: "Menengah", color: "peach", prompt: "Kita berada di kantin sekolah. Kamu adalah penjual kantin dan siswa adalah pembeli. Latih ungkapan meminta, memilih makanan, bertanya harga, dan mengucapkan terima kasih. Ajukan satu pertanyaan setiap giliran." },
  { id: "market", title: "Berbelanja di Pasar", subtitle: "Bertanya harga dan menawar barang", icon: "🛍️", level: "Menengah", color: "yellow", prompt: "Kita berada di pasar. Kamu adalah pedagang dan siswa adalah pembeli. Gunakan kosakata sederhana tentang barang, harga, jumlah, mahal, dan murah. Ajukan satu pertanyaan setiap giliran." },
  { id: "hobby", title: "Membicarakan Hobi", subtitle: "Bercerita tentang kegemaran", icon: "⚽", level: "Pemula", color: "blue", prompt: "Kita sedang berbincang tentang hobi. Kamu adalah teman siswa. Tanyakan hobi, kegiatan akhir pekan, dan alasan menyukai aktivitas tersebut. Ajukan satu pertanyaan setiap giliran." },
  { id: "daily", title: "Rutinitas Harian", subtitle: "Menceritakan kegiatan sehari-hari", icon: "🌤️", level: "Menengah", color: "pink", prompt: "Kita sedang bertukar cerita tentang rutinitas harian. Tanyakan kapan siswa bangun, pergi ke sekolah, belajar, dan tidur. Ajukan satu pertanyaan setiap giliran." },
];
