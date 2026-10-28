/**
 * DATA MATERI EDUKASI STROKE PADA REMAJA
 * Dikelompokkan dalam 4 Level dengan progresivitas edukatif:
 * Level 1: Pengenalan & Definisi Stroke (Apa itu stroke, otak, pembuluh darah, oksigen)
 * Level 2: Faktor Risiko Gaya Hidup Remaja (Vape, begadang, fast food, stres, rebahan)
 * Level 3: Tanda & Gejala FAST / SeGeRa Ke RS (Wajah perot, pelo, lemas separuh badan)
 * Level 4: Pencegahan & Penanganan Darurat Cepat (Golden period, 112, olahraga, gizi seimbang)
 */

const STROKE_KNOWLEDGE = {
  // ==========================================
  // TEKA-TEKI SILANG (TTS)
  // Grid berukuran konsisten dengan koordinat row & col
  // ==========================================
  tts: [
    {
      level: 1,
      title: "Level 1: Mengenal Otak & Stroke",
      subtitle: "Pelajari apa yang terjadi ketika aliran darah ke otak terganggu",
      factBadge: "Otak hanya 2% berat tubuh, tapi butuh 20% suplai oksigen tubuh!",
      gridSize: 10,
      clues: [
        {
          id: "1M",
          direction: "across", // Mendatar
          number: 1,
          row: 1,
          col: 1,
          answer: "OTAK",
          question: "Organ vital di kepala pusat kendali tubuh yang terdampak saat stroke",
          explanation: "Otak mengendalikan pikiran, memori, ucapan, dan gerakan tubuh."
        },
        {
          id: "2M",
          direction: "across",
          number: 2,
          row: 3,
          col: 0,
          answer: "OKSIGEN",
          question: "Zat penting dalam darah yang dibutuhkan sel otak agar tidak mati",
          explanation: "Tanpa oksigen selama 3-4 menit saja, sel-sel saraf otak mulai mengalami kematian."
        },
        {
          id: "3T",
          direction: "down", // Menurun
          number: 3,
          row: 0,
          col: 3,
          answer: "DARAH",
          question: "Cairan tubuh pembawa nutrisi dan oksigen yang mengalir ke otak",
          explanation: "Aliran darah yang tersumbat atau pecah menjadi akar penyebab serangan stroke."
        },
        {
          id: "4M",
          direction: "across",
          number: 4,
          row: 5,
          col: 2,
          answer: "STROKE",
          question: "Kondisi darurat saat pasokan darah ke bagian otak mendadak terhenti/berkurang",
          explanation: "Stroke bukan hanya penyakit orang tua, remaja dan usia muda kini juga bisa terkena."
        },
        {
          id: "5T",
          direction: "down",
          number: 5,
          row: 3,
          col: 5,
          answer: "ISKEMIK",
          question: "Jenis stroke terbanyak yang disebabkan oleh sumbatan bekuan darah",
          explanation: "Sekitar 80-85% kasus stroke adalah stroke iskemik akibat penyumbatan arteri."
        }
      ]
    },
    {
      level: 2,
      title: "Level 2: Ancaman Gaya Hidup Remaja",
      subtitle: "Kenali kebiasaan harian masa kini yang memicu stroke di usia belia",
      factBadge: "Kebiasaan begadang & vape melipatgandakan risiko radang pembuluh darah remaja!",
      gridSize: 11,
      clues: [
        {
          id: "1M",
          direction: "across",
          number: 1,
          row: 1,
          col: 1,
          answer: "BEGADANG",
          question: "Kurang tidur malam kronis yang memicu lonjakan tekanan darah remaja",
          explanation: "Begadang mengacaukan ritme sirkadian dan memicu hipertensi tersembunyi pada remaja."
        },
        {
          id: "2T",
          direction: "down",
          number: 2,
          row: 0,
          col: 4,
          answer: "GARAM",
          question: "Kandungan tinggi pada camilan & junk food yang memicu hipertensi",
          explanation: "Konsumsi natrium berlebih merusak elastisitas dinding pembuluh darah."
        },
        {
          id: "3M",
          direction: "across",
          number: 3,
          row: 4,
          col: 2,
          answer: "VAPING",
          question: "Rokok elektrik beracun yang merusak endotel pembuluh darah remaja",
          explanation: "Zat kimia rokok dan vape memicu pembekuan darah abnormal dan kekakuan arteri."
        },
        {
          id: "4T",
          direction: "down",
          number: 4,
          row: 3,
          col: 6,
          answer: "OBESITAS",
          question: "Penumpukan lemak berlebih akibat pasif gerak dan hobi konsumsi minuman manis",
          explanation: "Obesitas usia muda meningkatkan risiko resistensi insulin dan stroke usia produktif."
        },
        {
          id: "5M",
          direction: "across",
          number: 5,
          row: 7,
          col: 0,
          answer: "STRES",
          question: "Beban psikologis berat yang melepas hormon pemicu lonjakan denyut jantung & tensi",
          explanation: "Kortisol dan adrenalin berlebih saat stres membebani sirkulasi otak."
        }
      ]
    },
    {
      level: 3,
      title: "Level 3: Tanda Bahaya & Deteksi FAST",
      subtitle: "Jangan terlambat! Kenali tanda peringatan dini serangan stroke",
      factBadge: "Ingat metode FAST: Face, Arms, Speech, Time!",
      gridSize: 12,
      clues: [
        {
          id: "1M",
          direction: "across",
          number: 1,
          row: 1,
          col: 2,
          answer: "WAJAH",
          question: "Bagian tubuh yang tampak miring/perot saat tersenyum (Face Drooping)",
          explanation: "Kelumpuhan saraf kranial wajah membuat senyum asimetris dan sudut bibir terkulai."
        },
        {
          id: "2T",
          direction: "down",
          number: 2,
          row: 0,
          col: 4,
          answer: "LENGAN",
          question: "Anggota gerak atas yang mendadak terkulai lemas sebelah (Arm Weakness)",
          explanation: "Bila diminta mengangkat kedua tangan, salah satu lengan akan merosot ke bawah."
        },
        {
          id: "3M",
          direction: "across",
          number: 3,
          row: 4,
          col: 1,
          answer: "PELO",
          question: "Bicara cadel, tidak jelas, atau sulit merangkai kata secara tiba-tiba",
          explanation: "Gangguan pusat bicara di otak (afasia/disartria) menyebabkan suara bergumam tak bermakna."
        },
        {
          id: "4T",
          direction: "down",
          number: 4,
          row: 3,
          col: 7,
          answer: "KEBAS",
          question: "Sensasi kesemutan tebal atau baal di separuh sisi tubuh",
          explanation: "Mati rasa mendadak pada wajah, tangan, atau kaki di satu sisi tubuh adalah tanda bahaya."
        },
        {
          id: "5M",
          direction: "across",
          number: 5,
          row: 7,
          col: 3,
          answer: "WAKTU",
          question: "Faktor krusial ('Time') karena setiap detik 1,9 juta sel saraf bisa mati",
          explanation: "Time is Brain! Semakin cepat sampai ke rumah sakit, semakin besar peluang selamat."
        }
      ]
    },
    {
      level: 4,
      title: "Level 4: Pertolongan & Aksi Pencegahan",
      subtitle: "Langkah penyelamatan 'Golden Period' dan pola hidup cerdik generasi sehat",
      factBadge: "Golden period stroke adalah 3,5 hingga 4,5 jam pertama sejak gejala pertama muncul!",
      gridSize: 12,
      clues: [
        {
          id: "1M",
          direction: "across",
          number: 1,
          row: 1,
          col: 0,
          answer: "EMERGENCY",
          question: "Status gawat darurat medis yang butuh panggilan ambulans / 112 segera",
          explanation: "Jangan tunda membawa pasien atau menusuk jari dengan jarum (itu mitos berbahaya!)."
        },
        {
          id: "2T",
          direction: "down",
          number: 2,
          row: 0,
          col: 4,
          answer: "GOLDEN",
          question: "Jangka waktu emas (3,5 - 4,5 jam) untuk melarutkan sumbatan otak",
          explanation: "Penanganan trombolisis medis dalam 'Golden Period' mencegah kecacatan permanen."
        },
        {
          id: "3M",
          direction: "across",
          number: 3,
          row: 4,
          col: 3,
          answer: "OLAHRAGA",
          question: "Aktivitas fisik rutin 30 menit sehari untuk melancarkan sirkulasi kardiovaskular",
          explanation: "Olahraga aerobik seperti jogging, renang, atau bersepeda menjaga kelenturan pembuluh darah."
        },
        {
          id: "4T",
          direction: "down",
          number: 4,
          row: 3,
          col: 7,
          answer: "NUTRISI",
          question: "Asupan buah, sayur berantioksidan tinggi, serta serat penurun kolesterol jahat",
          explanation: "Pola makan bergizi seimbang melindungi pembuluh darah dari plak aterosklerosis."
        },
        {
          id: "5M",
          direction: "across",
          number: 5,
          row: 8,
          col: 2,
          answer: "TENSI",
          question: "Pemeriksaan tekanan darah berkala untuk mendeteksi hipertensi sedini mungkin",
          explanation: "Hipertensi sering dijuluki 'The Silent Killer' karena jarang bergejala hingga terjadi komplikasi."
        }
      ]
    }
  ],

  // ==========================================
  // CARI KATA (WORD SEARCH)
  // Grid matriks huruf acak dengan kata tersembunyi
  // ==========================================
  wordSearch: [
    {
      level: 1,
      title: "Level 1: Sirkulasi Otak & Istilah Dasar",
      subtitle: "Temukan 5 istilah dasar anatomi dan mekanisme terjadinya stroke",
      factBadge: "Stroke terjadi ketika jaringan otak kekurangan nutrisi dan oksigen secara mendadak.",
      gridSize: 10,
      words: [
        { word: "OTAK", hint: "Pusat pengendali seluruh fungsi organ tubuh manusia." },
        { word: "DARAH", hint: "Cairan pembawa pasokan makanan dan oksigen ke sel otak." },
        { word: "OKSIGEN", hint: "Gas esensial penyokong kelangsungan hidup sel-sel saraf otak." },
        { word: "STROKE", hint: "Defisit neurologis mendadak akibat kelainan vaskular otak." },
        { word: "SUMBATAN", hint: "Blokade pada pipa arteri oleh gumpalan plak atau trombus." }
      ]
    },
    {
      level: 2,
      title: "Level 2: Waspada Gaya Hidup Remaja",
      subtitle: "Cari 6 faktor pemicu stroke yang sering diabaikan oleh generasi muda",
      factBadge: "Lebih dari 10% kasus stroke kini menyerang populasi di bawah usia 45 tahun!",
      gridSize: 11,
      words: [
        { word: "BEGADANG", hint: "Kurang tidur malam yang mengacaukan regulasi tekanan darah." },
        { word: "ROKOK", hint: "Kandungan racun nikotin yang merusak dinding arteri." },
        { word: "VAPING", hint: "Asap aerosol kimiawi berisiko tinggi merusak pembuluh darah." },
        { word: "OBESITAS", hint: "Kelebihan berat badan ekstrem akibat minim gerak fisik." },
        { word: "STRES", hint: "Beban mental berlebihan yang memicu kenaikan hormon kortisol." },
        { word: "JUNKFOOD", hint: "Makanan cepat saji sarat natrium, lemak jenuh, dan pengawet." }
      ]
    },
    {
      level: 3,
      title: "Level 3: Sinyal Darurat FAST & Gejala",
      subtitle: "Temukan 6 kata kunci penting untuk mendeteksi serangan stroke",
      factBadge: "Deteksi dalam hitungan menit menentukan apakah pasien pulih total atau cacat permanen.",
      gridSize: 12,
      words: [
        { word: "WAJAH", hint: "Wajah terkulai sebelah atau tidak simetris saat tersenyum." },
        { word: "LENGAN", hint: "Kelemahan atau kelumpuhan pada salah satu tangan saat diangkat." },
        { word: "PELO", hint: "Bicara terdengar sengau, tidak jelas, atau kacau." },
        { word: "KEBAS", hint: "Sensasi kesemutan tebal mati rasa di separuh tubuh." },
        { word: "PUSING", hint: "Nyeri kepala hebat mendadak berputar yang belum pernah dirasakan." },
        { word: "RABUN", hint: "Penglihatan mendadak kabur atau ganda pada salah satu mata." }
      ]
    },
    {
      level: 4,
      title: "Level 4: Penanganan Emas & Pencegahan",
      subtitle: "Cari 6 aksi pencegahan dan penanganan medis penyelamat nyawa",
      factBadge: "Semakin cepat dibawa ke RS yang memiliki CT Scan, semakin tinggi tingkat kesembuhan!",
      gridSize: 12,
      words: [
        { word: "GOLDEN", hint: "Rentang waktu krusial 3-4,5 jam penanganan medis trombolisis." },
        { word: "AMBULANS", hint: "Kendaraan darurat rujukan cepat menuju unit gawat darurat." },
        { word: "OLAHRAGA", hint: "Latihan fisik rutin membakar kolesterol dan melenturkan nadi." },
        { word: "NUTRISI", hint: "Konsumsi makanan sehat kaya serat sayuran dan antioksidan." },
        { word: "TENSI", hint: "Monitoring tekanan darah rutin untuk mencegah hipertensi tersembunyi." },
        { word: "MEDIS", hint: "Tenaga dokter dan rumah sakit untuk penanganan ilmiah terpercaya." }
      ]
    }
  ]
};
