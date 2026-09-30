export const initialGenres = [
  { id: 1, name: "Romance", slug: "romance", icon: "Heart", count: 1420 },
  { id: 2, name: "Fanfiction", slug: "fanfiction", icon: "BookOpen", count: 980 },
  { id: 3, name: "LGBTQ+", slug: "lgbtq", icon: "Sparkles", count: 640 },
  { id: 4, name: "Fantasy", slug: "fantasy", icon: "Compass", count: 1890 },
  { id: 5, name: "Teen Fiction", slug: "teen-fiction", icon: "Smile", count: 850 },
  { id: 6, name: "Historical Fiction", slug: "historical-fiction", icon: "Clock", count: 430 },
  { id: 7, name: "Paranormal", slug: "paranormal", icon: "Eye", count: 710 },
  { id: 8, name: "Humor", slug: "humor", icon: "Smile", count: 520 },
  { id: 9, name: "Horror", slug: "horror", icon: "Flame", count: 610 },
  { id: 10, name: "Contemporary", slug: "contemporary", icon: "Coffee", count: 780 },
  { id: 11, name: "Diverse Lit", slug: "diverse-lit", icon: "Globe", count: 390 },
  { id: 12, name: "Mystery", slug: "mystery", icon: "Search", count: 920 },
  { id: 13, name: "Thriller", slug: "thriller", icon: "Zap", count: 840 },
  { id: 14, name: "Science Fiction", slug: "sci-fi", icon: "Rocket", count: 1120 },
  { id: 15, name: "Adventure", slug: "adventure", icon: "Map", count: 670 },
  { id: 16, name: "Non-Fiction", slug: "non-fiction", icon: "FileText", count: 280 },
  { id: 17, name: "Poetry", slug: "poetry", icon: "Feather", count: 310 },
  { id: 18, name: "Short Story", slug: "short-story", icon: "Bookmark", count: 490 },
  { id: 19, name: "Werewolf", slug: "werewolf", icon: "Moon", count: 1350 },
  { id: 20, name: "New Adult", slug: "new-adult", icon: "UserCheck", count: 960 },
  { id: 21, name: "Kids Books", slug: "kids-books", icon: "Sparkles", count: 420, ageRating: "3+" },
  { id: 22, name: "Educational Stories", slug: "educational", icon: "BookOpen", count: 310, ageRating: "3+" },
  { id: 23, name: "Fairy Tales & Fables", slug: "fairy-tales", icon: "Compass", count: 280, ageRating: "7+" }
];

export const initialStories = [
  {
    id: 1,
    slug: "the-shadow-alchemist",
    title: "The Shadow Alchemist",
    author: "Elena Vance",
    authorUsername: "elenavance",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    genre: "Fantasy",
    genreSlug: "fantasy",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    description: "In a world where shadows can be transmuted into solid kinetic energy, apprentice Aria uncovers a century-old conspiracy inside the High Clocktower that threatens the fragile armistice between alchemists and the royal court.",
    status: "ongoing",
    language: "en",
    maturity: "everyone",
    ageRating: "13+",
    minAge: 13,
    contentType: "story",
    targetAudience: "Teen & YA",
    mood: "Mysterious",
    trope: "Enemies to Lovers",
    length: "Medium (10-30)",
    isOriginal: true,
    isEditorsPick: true,
    isTrending: true,
    isFanfiction: false,
    reads: 142500,
    votes: 9840,
    commentsCount: 1320,
    lastUpdated: "2 hours ago",
    tags: ["alchemy", "steampunk", "slowburn", "magic-academy", "political-intrigue"],
    ranking: { rank: 1, tag: "Fantasy", totalInTag: "18.9K stories" },
    copyright: "All Rights Reserved",
    chapters: [
      {
        id: 101,
        number: 1,
        title: "The Whispering Observatory",
        publishedAt: "2026-03-12",
        reads: 45200,
        votes: 3100,
        emojis: { "🔥": 84, "❤️": 120, "😭": 12, "👏": 45, "😱": 62 },
        paragraphs: [
          {
            id: 1,
            text: "The brass gears inside the clockwork owl began to whirr, its amethyst eyes glowing with an unearthly luminescence that mirrored the impending dusk over the kingdom of Oakhaven.",
            comments: [
              { id: 1, author: "LoreHunter", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80", time: "2 hours ago", text: "The mechanical owl is definitely tied to the relic mentioned in chapter three!", likes: 14, emojis: { "🔥": 5 } },
              { id: 2, author: "BookishMaya", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", time: "1 hour ago", text: "Obsessed with the atmosphere of this opening scene already.", likes: 8, emojis: { "❤️": 6 } }
            ]
          },
          {
            id: 2,
            text: "Aria leaned against the damp granite railing of the observatory, clutching the parchment whose seal she had broken merely moments ago. The sigil of the Nightfall Order was unmistakable.",
            comments: [
              { id: 3, author: "FantasyFanatic", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80", time: "30 mins ago", text: "Wait... the Nightfall Order was supposed to be eradicated 50 years ago?!", likes: 22, emojis: { "😱": 9 } }
            ]
          },
          {
            id: 3,
            text: "\"You were warned about unlocking the forbidden grimoire,\" a silhouette whispered from the shadows of the arched doorway. It was Keith, draped in his charcoal traveler's cloak.",
            comments: [
              { id: 4, author: "KeithDefender", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80", time: "10 mins ago", text: "KEITH IS HERE! My favorite morally gray character.", likes: 41, emojis: { "❤️": 18 } }
            ]
          },
          {
            id: 4,
            text: "She did not turn immediately. Instead, she let her fingertips graze the edge of her concealed dagger. In this world of shifting allegiances, even childhood companions were suspects.",
            comments: []
          },
          {
            id: 5,
            text: "Outside, thunder rumbled across the jagged peaks of the Dragontail range. The storm had finally arrived, and with it, the truth they had both spent half a decade fleeing.",
            comments: [
              { id: 5, author: "SerenaRain", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80", time: "5 mins ago", text: "Chills! Moving right on to chapter two.", likes: 11, emojis: { "👏": 7 } }
            ]
          }
        ]
      },
      {
        id: 102,
        number: 2,
        title: "Pact of Mercury and Bone",
        publishedAt: "2026-03-19",
        reads: 38900,
        votes: 2750,
        emojis: { "🔥": 44, "❤️": 88, "😭": 5, "👏": 30, "😱": 21 },
        paragraphs: [
          {
            id: 1,
            text: "The parchment crinkled under Aria's fingers. Keith stepped forward into the pale moonbeam, his eyes clouded with an emotion she hadn't seen since the fall of the academy.",
            comments: []
          },
          {
            id: 2,
            text: "\"If the High Council learns that you breached the Vault of Cinders, neither my family's influence nor your alchemical prodigy can shield you,\" he said softly.",
            comments: []
          }
        ]
      }
    ]
  },
  {
    id: 2,
    slug: "neon-hearts-and-rain",
    title: "Neon Hearts & Rain",
    author: "Kenji Sato",
    authorUsername: "kenjisato",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    genre: "Romance",
    genreSlug: "romance",
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    description: "A talented sound engineer working in the rain-slicked backstreets of Shibuya crosses paths with an enigmatic underground cellist who performs only at 3:00 AM.",
    status: "ongoing",
    language: "en",
    maturity: "everyone",
    ageRating: "13+",
    minAge: 13,
    contentType: "story",
    targetAudience: "Young Adult",
    mood: "Romantic",
    trope: "Slow Burn",
    length: "Short (<10)",
    isOriginal: false,
    isEditorsPick: true,
    isTrending: true,
    isFanfiction: false,
    reads: 98200,
    votes: 7120,
    commentsCount: 890,
    lastUpdated: "5 hours ago",
    tags: ["tokyo", "music", "slow-burn", "rainy-days", "found-family"],
    ranking: { rank: 1, tag: "Romance", totalInTag: "14.2K stories" },
    copyright: "All Rights Reserved",
    chapters: [
      {
        id: 201,
        number: 1,
        title: "Frequency 432 Hz",
        publishedAt: "2026-03-10",
        reads: 32000,
        votes: 2100,
        emojis: { "🔥": 34, "❤️": 140, "😭": 18, "👏": 25, "😱": 4 },
        paragraphs: [
          {
            id: 1,
            text: "Shibuya never truly sleeps; it merely alters its heartbeat. At three past midnight, the cacophony of sirens and electronic billboards gave way to the steady rhythm of rain on rusted fire escapes.",
            comments: []
          },
          {
            id: 2,
            text: "Through his studio headphones, Ken heard a lone acoustic frequency cutting through the low hum of city transformers—a cello weeping in the subterranean walkway below.",
            comments: []
          }
        ]
      }
    ]
  },
  {
    id: 3,
    slug: "whispers-in-the-hollow",
    title: "Whispers in the Hollow",
    author: "Marcus Reed",
    authorUsername: "mreed_author",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    genre: "Horror",
    genreSlug: "horror",
    cover: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    description: "When the fog rolls into the isolated Appalachian logging town of Blackwood Creek, townsfolk must lock their doors before twilight. Anyone who answers the knock from the woods never returns the same.",
    status: "completed",
    language: "en",
    maturity: "mature",
    ageRating: "18+",
    minAge: 18,
    isMature: true,
    contentType: "story",
    targetAudience: "Mature Readers (18+)",
    mood: "Dark",
    trope: "Survival",
    length: "Medium (10-30)",
    isOriginal: true,
    isEditorsPick: false,
    isTrending: true,
    isFanfiction: false,
    reads: 76400,
    votes: 5410,
    commentsCount: 640,
    lastUpdated: "Yesterday",
    tags: ["folk-horror", "appalachia", "psychological", "cryptid", "mystery"],
    ranking: { rank: 1, tag: "Horror", totalInTag: "6.1K stories" },
    copyright: "All Rights Reserved",
    chapters: [
      {
        id: 301,
        number: 1,
        title: "Rule Number Seven",
        publishedAt: "2026-02-15",
        reads: 25000,
        votes: 1800,
        emojis: { "🔥": 29, "❤️": 40, "😭": 11, "👏": 19, "😱": 94 },
        paragraphs: [
          {
            id: 1,
            text: "There were seven cardinal rules in Blackwood Creek. The first six dealt with the timber mills and river currents. The seventh rule was handwritten on index cards taped to every motel mirror: Never answer a voice that speaks with your mother's cadence after dark.",
            comments: []
          }
        ]
      }
    ]
  },
  {
    id: 4,
    slug: "starlight-remnants-fanfic",
    title: "Starlight Remnants (The Astral Heir)",
    author: "Astra_Quill",
    authorUsername: "astraquill",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    genre: "Fanfiction",
    genreSlug: "fanfiction",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    description: "A beloved space fantasy alternate universe exploration. When Commander Vane refuses the fleet's orders to abandon the outer rim colony, he finds an exiled princess who commands starship engines with her mind.",
    status: "ongoing",
    language: "en",
    maturity: "everyone",
    ageRating: "7+",
    minAge: 7,
    contentType: "story",
    targetAudience: "Kids & Family (7+)",
    mood: "Uplifting",
    trope: "Found Family",
    length: "Epic (30+)",
    isOriginal: false,
    isEditorsPick: true,
    isTrending: true,
    isFanfiction: true,
    reads: 112000,
    votes: 8400,
    commentsCount: 970,
    lastUpdated: "3 days ago",
    tags: ["fanfiction", "space-opera", "chosen-one", "found-family"],
    ranking: { rank: 1, tag: "Fanfiction", totalInTag: "9.8K stories" },
    copyright: "Creative Commons",
    chapters: [
      {
        id: 401,
        number: 1,
        title: "The Ion Breach",
        publishedAt: "2026-03-01",
        reads: 31000,
        votes: 2400,
        emojis: { "🔥": 55, "❤️": 90, "😭": 8, "👏": 40, "😱": 31 },
        paragraphs: [
          {
            id: 1,
            text: "The bridge alarms sounded like shattered glass over the comms. Vane ignored the flashing crimson alerts and kept his hands firmly on the atmospheric thrusters.",
            comments: []
          }
        ]
      }
    ]
  },
  {
    id: 5,
    slug: "alphas-moonlit-vow",
    title: "The Alpha's Moonlit Vow",
    author: "Selena Ward",
    authorUsername: "selenaward",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    genre: "Werewolf",
    genreSlug: "werewolf",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    description: "Exiled from the Silvercrest Pack at sixteen, Rogue-born Nora returns to the forbidden territory under an assumed name, only to be recognized by the pack's ruthless new Alpha as his fated mate.",
    status: "ongoing",
    language: "en",
    maturity: "mature",
    ageRating: "18+",
    minAge: 18,
    isMature: true,
    contentType: "story",
    targetAudience: "Mature Readers (18+)",
    mood: "Mysterious",
    trope: "Enemies to Lovers",
    length: "Epic (30+)",
    isOriginal: true,
    isEditorsPick: true,
    isTrending: true,
    isFanfiction: false,
    reads: 245000,
    votes: 18900,
    commentsCount: 2450,
    lastUpdated: "1 hour ago",
    tags: ["werewolf", "mate-bond", "badboy", "pack-politics", "slowburn"],
    ranking: { rank: 1, tag: "Werewolf", totalInTag: "13.5K stories" },
    copyright: "All Rights Reserved",
    chapters: [
      {
        id: 501,
        number: 1,
        title: "Scent of Ash and Cedar",
        publishedAt: "2026-03-25",
        reads: 54000,
        votes: 4200,
        emojis: { "🔥": 120, "❤️": 210, "😭": 15, "👏": 60, "😱": 85 },
        paragraphs: [
          {
            id: 1,
            text: "The border stone smelled of dried rain and wolfsbane. Nora stepped across the invisible threshold into Silvercrest territory, heart slamming against her ribs with primal terror.",
            comments: [
              { id: 1, author: "MoonGoddess", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", time: "1 hour ago", text: "The werewolf lore in this story is already top tier! Alpha Damien is coming!", likes: 19, emojis: { "🔥": 8 } }
            ]
          },
          {
            id: 2,
            text: "\"You shouldn't have returned, little rogue,\" a low baritone vibrated right behind her shoulder, laced with the scent of dark cedar and lightning.",
            comments: []
          }
        ]
      }
    ]
  },
  {
    id: 6,
    slug: "syndicate-protocol",
    title: "The Syndicate Protocol",
    author: "Julian Cross",
    authorUsername: "juliancross",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    genre: "Science Fiction",
    genreSlug: "sci-fi",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    description: "In neo-Chicago, memory extraction is the ultimate black-market currency. Rogue cipher Maya steals a classified memory chip only to realize it contains the blueprint for the city's total blackout.",
    status: "ongoing",
    language: "en",
    maturity: "everyone",
    ageRating: "16+",
    minAge: 16,
    contentType: "story",
    targetAudience: "Young Adult (16+)",
    mood: "Dark",
    trope: "Survival",
    length: "Medium (10-30)",
    isOriginal: false,
    isEditorsPick: true,
    isTrending: true,
    isFanfiction: false,
    reads: 89000,
    votes: 6200,
    commentsCount: 780,
    lastUpdated: "6 hours ago",
    tags: ["cyberpunk", "ai", "heist", "conspiracy", "action"],
    ranking: { rank: 1, tag: "Sci-Fi", totalInTag: "11.2K stories" },
    copyright: "All Rights Reserved",
    chapters: [
      {
        id: 601,
        number: 1,
        title: "Cold Boot",
        publishedAt: "2026-03-20",
        reads: 22000,
        votes: 1800,
        emojis: { "🔥": 40, "❤️": 50, "😭": 5, "👏": 30, "😱": 45 },
        paragraphs: [
          {
            id: 1,
            text: "Neural static buzzed in Maya's temple as the optical splice synced. The memory wasn't hers—it belonged to the Director of City Grid.",
            comments: []
          }
        ]
      }
    ]
  },
  {
    id: 7,
    slug: "starlight-fox-whispering-grove",
    title: "The Starlight Fox & The Whispering Grove",
    author: "Oliver Meadow",
    authorUsername: "oliver_meadow",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    genre: "Kids Books",
    genreSlug: "kids-books",
    cover: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    description: "An enchanting bedtime picture story about Barnaby the baby fox who catches a falling star to light the dark hollows for his woodland friends.",
    status: "completed",
    language: "en",
    maturity: "everyone",
    ageRating: "3+",
    minAge: 3,
    contentType: "picture_book",
    targetAudience: "Kids & Family (3+)",
    mood: "Uplifting",
    trope: "Found Family",
    length: "Short (<10)",
    isOriginal: true,
    isEditorsPick: true,
    isTrending: true,
    isFanfiction: false,
    reads: 64200,
    votes: 4950,
    commentsCount: 320,
    lastUpdated: "Yesterday",
    tags: ["kids", "bedtime", "picture-book", "animals", "family-friendly"],
    ranking: { rank: 1, tag: "Kids Books", totalInTag: "4.2K stories" },
    copyright: "All Rights Reserved",
    chapters: [
      {
        id: 701,
        number: 1,
        title: "The Silver Moonbeam",
        publishedAt: "2026-03-24",
        reads: 32100,
        votes: 2450,
        emojis: { "❤️": 140, "👏": 80, "✨": 95 },
        pages: [
          {
            pageNumber: 1,
            image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
            caption: "High atop Silver Fern Hill, Barnaby the little fox gazed up at the velvety night sky.",
            text: "High atop Silver Fern Hill, Barnaby the little fox gazed up at the velvety night sky. The crickets were playing their evening lullaby."
          },
          {
            pageNumber: 2,
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
            caption: "Suddenly, a warm speck of amber starlight floated gently down like an autumn leaf.",
            text: "Suddenly, a warm speck of amber starlight floated gently down like an autumn leaf. 'Don't worry little star,' Barnaby whispered softly. 'I will keep you safe and warm until morning!'"
          }
        ],
        paragraphs: [
          {
            id: 1,
            text: "High atop Silver Fern Hill, Barnaby the little fox gazed up at the velvety night sky. The crickets were playing their evening lullaby.",
            comments: []
          },
          {
            id: 2,
            text: "Suddenly, a warm speck of amber starlight floated gently down like an autumn leaf. 'Don't worry little star,' Barnaby whispered softly. 'I will keep you safe and warm until morning!'",
            comments: []
          }
        ]
      }
    ]
  },
  {
    id: 8,
    slug: "secret-clockwork-dinosaur",
    title: "The Secret of the Clockwork Dinosaur",
    author: "Dr. Clara Higgins",
    authorUsername: "clara_science",
    authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    genre: "Educational Stories",
    genreSlug: "educational",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    description: "Young inventor Leo discovers that the fossils in his grandfather's museum basement are actually brilliant solar-powered gear machines waiting to teach ancient biology!",
    status: "ongoing",
    language: "en",
    maturity: "everyone",
    ageRating: "7+",
    minAge: 7,
    contentType: "story",
    targetAudience: "Kids & Learning (7+)",
    mood: "Uplifting",
    trope: "Found Family",
    length: "Medium (10-30)",
    isOriginal: true,
    isEditorsPick: true,
    isTrending: true,
    isFanfiction: false,
    reads: 48900,
    votes: 3720,
    commentsCount: 410,
    lastUpdated: "3 days ago",
    tags: ["science", "dinosaurs", "learning", "steam", "adventure"],
    ranking: { rank: 1, tag: "Educational", totalInTag: "3.1K stories" },
    copyright: "All Rights Reserved",
    chapters: [
      {
        id: 801,
        number: 1,
        title: "The Stegosaurus Gearbox",
        publishedAt: "2026-03-21",
        reads: 24000,
        votes: 1850,
        emojis: { "👏": 90, "❤️": 65, "💡": 110 },
        paragraphs: [
          {
            id: 1,
            text: "Leo adjusted his copper magnifying goggles. Underneath the fossilized granite rib of the Stegosaurus was a brass lever shaped like a fern leaf.",
            comments: []
          },
          {
            id: 2,
            text: "\"Palaeontology isn't just about rocks, Leo,\" his grandfather smiled gently. \"It's about understanding how life engineered movement millions of years before humans built our first wheel.\"",
            comments: []
          }
        ]
      }
    ]
  }
];

export const initialTestimonials = [
  {
    id: 1,
    author: "Samantha K. Brooks",
    bookTitle: "Tide of Sapphire",
    stats: "2.4M Reads • Traditional Publishing Deal",
    quote: "Publishing chapter-by-chapter on Avora Library allowed me to test pacing in real-time. The paragraph-by-paragraph feedback from my dedicated readers directly shaped the published manuscript that hit international bestseller lists.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 2,
    author: "David Vance",
    bookTitle: "The Clockwork Frontier",
    stats: "890K Reads • Watty Award Winner",
    quote: "The writing tools, analytics, and transparent community interaction gave me the confidence to make writing serialized fiction my full-time vocation.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 3,
    author: "Priya Sharma",
    bookTitle: "Monsoon Melodies",
    stats: "1.1M Reads • Screenplay Optioned",
    quote: "Having my story available seamlessly across mobile web and PWA made it effortless for my global readers in India, the US, and Georgia to read every morning on their commute.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
  }
];

export const initialReaderReactions = [
  {
    id: 1,
    reader: "Camilla Ramos",
    storyTitle: "The Shadow Alchemist",
    chapter: "Chapter 1",
    comment: "I gasped out loud on paragraph 3! The banter between Aria and Keith is unmatched. Can't wait for the next drop.",
    reaction: "🔥 Jaw Dropped",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80"
  },
  {
    id: 2,
    reader: "Tornike M.",
    storyTitle: "Neon Hearts & Rain",
    chapter: "Chapter 4",
    comment: "The visual descriptions of Tokyo in the rain are poetic perfection. Read this while listening to lo-fi beats!",
    reaction: "✨ Pure Art",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80"
  },
  {
    id: 3,
    reader: "Aarav Patel",
    storyTitle: "Starlight Remnants",
    chapter: "Chapter 8",
    comment: "The character arcs in this alternate universe are deeper than the original canon. Truly phenomenal serialized fiction.",
    reaction: "🤯 Mind Blown",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80"
  }
];

export const initialContests = [
  {
    id: 1,
    title: "The Golden Quill Annual Awards 2026",
    slug: "golden-quill-2026",
    tagline: "Celebrating the year's most captivating serialized fiction",
    deadline: "November 30, 2026",
    categories: ["Best Fantasy Worldbuilding", "Best Romance Slow-Burn", "Rising Writer of the Year"],
    prize: "$5,000 Grand Prize + Editorial Contract + Official Badge",
    status: "active",
    entriesCount: 342,
    banner: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    winners: [
      { category: "Best Fantasy", story: "The Shadow Alchemist", author: "Elena Vance" },
      { category: "Best Romance", story: "Neon Hearts & Rain", author: "Kenji Sato" }
    ]
  },
  {
    id: 2,
    title: "Midsummer Sci-Fi Flash Challenge",
    slug: "midsummer-scifi-2026",
    tagline: "Short serialized novellas written under 15,000 words",
    deadline: "August 15, 2026",
    categories: ["Hard Sci-Fi", "Cyberpunk", "Space Opera"],
    prize: "$1,500 Prize Pool + Featured Spotlight",
    status: "completed",
    entriesCount: 188,
    banner: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    winners: [
      { category: "Space Opera", story: "Starlight Remnants", author: "Astra_Quill" }
    ]
  }
];

export const initialCommunitySpaces = [
  {
    id: 1,
    title: "Fantasy & Magic Worldbuilders",
    slug: "fantasy-worldbuilders",
    description: "Discuss hard vs soft magic systems, mythical kingdoms, and map-making for serialized epics.",
    membersCount: 14200,
    threadsCount: 380,
    moderator: "Garth_Archmage",
    icon: "Compass"
  },
  {
    id: 2,
    title: "Romance Trope Enthusiasts",
    slug: "romance-tropes",
    description: "Enemies-to-lovers, fake dating, and soulmates. Share your favorite serialized romance chapters.",
    membersCount: 22100,
    threadsCount: 940,
    moderator: "Elena_Mod",
    icon: "Heart"
  },
  {
    id: 3,
    title: "Author Craft & Publishing Lounge",
    slug: "author-craft",
    description: "Tips on daily word counts, overcoming writer's block, character arcs, and PWA serialization.",
    membersCount: 8900,
    threadsCount: 420,
    moderator: "David_Vance",
    icon: "Feather"
  }
];

export const initialBlogPosts = [
  {
    id: 1,
    title: "How to Structure Serialized Fiction for Maximum Reader Engagement",
    slug: "how-to-structure-serialized-fiction",
    excerpt: "Learn how pacing cliffhangers and paragraph-level dialogue hooks keep readers eagerly anticipating your next chapter release.",
    content: "Serialized storytelling is an art form distinct from traditional novel publication. When writing serialized chapters, every installment needs its own dramatic micro-arc while contributing to the macro-narrative.\n\n### The Anatomy of a Serial Chapter\n1. **The Hook**: Ground your readers immediately in the consequences of the previous chapter.\n2. **The Escalation**: Deepen character motivation or introduce unexpected obstacles.\n3. **The Line-by-Line Reaction Anchor**: Create moments of humor, witty dialogue, or emotional vulnerability that inspire reader annotations.\n4. **The Cliffhanger**: Leave an unresolved question that ensures readers will return for your next drop.",
    author: "Editorial Team",
    date: "March 24, 2026",
    readTime: "6 min read",
    cover: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
    category: "Writing Advice"
  },
  {
    id: 2,
    title: "Why Web Apps (PWA) Are the Future of Digital Reading",
    slug: "why-web-apps-are-the-future-of-reading",
    excerpt: "Say goodbye to 100MB app store downloads. Progressive Web Apps offer offline reading, lightning-fast sync, and instant access on any smartphone.",
    content: "For decades, digital reading was segregated between bulky mobile apps and clunky browser websites. Progressive Web Apps (PWAs) bridge the divide.\n\n### Benefits of Avora Library PWA\n- **Zero Store Barrier**: Instant installation directly from mobile Safari or Chrome.\n- **Offline Progress Caching**: Reads seamlessly even when subway or transit connection drops.\n- **Cross-Device Sync**: Resume on paragraph 4 from your laptop to your phone in milliseconds.",
    author: "Tech & Product Desk",
    date: "March 18, 2026",
    readTime: "4 min read",
    cover: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
    category: "Platform Updates"
  }
];

export const initialRegisteredUsers = [
  { id: 1, name: "Avora Administrator", username: "admin", email: "admin@avoralibrary.com", role: "admin", status: "active", joinedDate: "2026-01-01", storiesCount: 0 }
];

export const initialTransactions = [];

export const initialReadingStreak = {
  currentStreak: 0,
  chaptersReadThisWeek: 0,
  dayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  daysActive: [false, false, false, false, false, false, false]
};

export const initialReadingProgress = {};

export const initialFeatureFlags = {
  enablePaidFeatures: false, // Default soft-launch mode: 100% free with no paywalls
  authorSelfPublishing: true,
  requireStoryApproval: false,
  ageGateEnforced: true,
  defaultItemsPerPage: 9
};

export const initialCmsConfig = {
  // 1. PWA & QR Code Section (Scope 1 & Milestone 1 & User Request)
  pwaSection: {
    enabled: true,
    badgeText: "Progressive Web App (PWA)",
    title: "Read Anywhere on Mobile",
    description: "Install Avora Library directly to your phone screen as a lightweight web app (PWA). No app store downloads required. Reads seamlessly offline and resumes exactly where you left off on phone, tablet, or laptop.",
    buttonText: "Install Web App",
    buttonUrl: "", // blank triggers PWA install prompt / modal
    qrCodeType: "dynamic", // 'dynamic' | 'custom_image'
    qrTargetUrl: "https://avoralibrary.com",
    qrCodeImageUrl: "",
    qrCodeLabel: "Scan QR with Phone",
    qrCodeSublabel: "Instant mobile web app"
  },

  // 2. Footer Social Media Links with Show/Hide and custom URLs
  socialLinks: {
    instagram: {
      enabled: true,
      url: "https://instagram.com/avoralibrary",
      label: "Instagram"
    },
    x: {
      enabled: true,
      url: "https://x.com/avoralibrary",
      label: "X (Twitter)"
    },
    facebook: {
      enabled: true,
      url: "https://facebook.com/avoralibrary",
      label: "Facebook"
    },
    tiktok: {
      enabled: true,
      url: "https://tiktok.com/@avoralibrary",
      label: "TikTok"
    },
    discord: {
      enabled: true,
      url: "https://discord.gg/avoralibrary",
      label: "Discord"
    },
    youtube: {
      enabled: false,
      url: "https://youtube.com/@avoralibrary",
      label: "YouTube"
    }
  },

  // 3. Footer Content & Legal Settings
  footerConfig: {
    tagline: "A responsive, multilingual serialized storytelling web platform and Progressive Web App (PWA). Connecting authors and passionate readers worldwide.",
    copyrightText: "© 2026 Avora Library Platform. All original rights reserved.",
    showSocialLinks: true,
    showLanguageSelector: true,
    showLegalLinks: true
  },

  // 4. Other Website Pages Content (About, Terms, Privacy, Guidelines, Contact, Hero)
  pagesContent: {
    about: {
      title: "About Avora Library",
      subtitle: "Avora Library is a modern, responsive, and multilingual serialized storytelling platform built for community reading and creator empowerment.",
      missionTitle: "Our Mission",
      missionContent: "We believe great storytelling thrives in the open air of community. By enabling line-by-line paragraph reactions, reader badges, and author followings, Avora Library transforms solitary reading into a shared cultural experience.",
      pwaTitle: "Mobile-First Progressive Web App",
      pwaContent: "Rather than locking readers behind hefty app store downloads, Avora Library is built from the ground up as a high-performance Progressive Web App (PWA). Readers in Georgia, India, the United States, and across the globe can install it directly to their phones with one tap and read seamlessly anywhere."
    },
    terms: {
      title: "Terms of Service",
      lastUpdated: "March 2026",
      sections: [
        {
          heading: "1. Acceptance of Terms",
          content: "By accessing and using Avora Library (including as an installed Progressive Web App), you agree to comply with and be bound by these terms. If you do not agree, please discontinue using the service."
        },
        {
          heading: "2. Serialized Author Publishing Rights",
          content: "Authors retain 100% full copyright ownership over all original works, chapters, and storylines published on Avora Library. Authors grant Avora Library a non-exclusive license to host, format, and display the works across web and mobile browsers."
        },
        {
          heading: "3. Reader Conduct & Paragraph Annotations",
          content: "Users may comment line-by-line on chapter paragraphs. Hate speech, harassment, impersonation, or unsolicited spam in annotations will result in immediate moderation suspension or permanent banning."
        },
        {
          heading: "4. Mature & Age-Restricted Content (18+)",
          content: "Works containing mature themes must be accurately flagged as Mature by the author. Readers confirm they meet the legal age of majority in their jurisdiction when passing through the mature age gate."
        }
      ]
    },
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "March 2026",
      sections: [
        {
          heading: "1. Information We Collect",
          content: "We collect information you provide directly to us when creating an account, publishing chapters, voting, or writing comments. We also collect anonymized reading progress stored locally on your device."
        },
        {
          heading: "2. How We Use Information",
          content: "Your information is used strictly to provide personalized reader feeds, chapter notifications, offline reading sync, and to protect the community against abuse."
        },
        {
          heading: "3. Data Retention & Third Parties",
          content: "We do not sell your personal reading data to advertisers. You may request account deletion at any time from your settings."
        }
      ]
    },
    guidelines: {
      title: "Author & Community Guidelines",
      subtitle: "Rules and best practices for serialized fiction creators and readers.",
      content: "Ensure respectful interaction across paragraph discussions. Accurately categorize mature fiction. Respect copyright and original storytelling. Support fellow authors with constructive feedback and paragraph cheers."
    },
    contact: {
      title: "Contact Us",
      subtitle: "Have a question or feedback? Send a direct message to our support desk.",
      supportEmail: "support@avoralibrary.com",
      pressEmail: "press@avoralibrary.com",
      officeAddress: "Avora Library Inc., 100 Storyteller Way, San Francisco, CA"
    },
    hero: {
      badge: "Original Serialized Fiction & Community",
      titlePrefix: "Stories That",
      titleHighlight: "Capture Your Imagination.",
      subtitle: "Stories that capture your imagination. Read chapter by chapter, leave paragraph reactions, and publish your original serialized fiction."
    }
  }
};
