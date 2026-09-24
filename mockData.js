export const mockUserProfile = {
  fullName: "Kayal Shankar",
  email: "kayal@cloudzen.ai",
  language: "en", // 'en' | 'si' | 'ta'
  userType: "student", // 'student' | 'farmer' | 'hiker' | 'traveller' | 'fisherman' | 'other'
  healthAlerts: ["heatstroke", "uv_exposure"],
  voiceAlertsEnabled: true,
  locationPermissionGranted: true,
  city: "Colombo",
  district: "Colombo",
  province: "Western Province",
  country: "Sri Lanka",
};

export const mockCurrentWeather = {
  city: "Colombo",
  district: "Colombo",
  country: "Sri Lanka 🇱🇰",
  temperature: 32,
  feelsLike: 37,
  condition: "Partly Cloudy",
  conditionIcon: "weather-partly-cloudy",
  humidity: 82,
  windSpeed: "18 km/h SW",
  uvIndex: 9,
  uvLevel: "Very High",
  airQualityIndex: 45,
  airQualityLevel: "Good",
  pressure: "1012 hPa",
  visibility: "10 km",
  sunrise: "06:04 AM",
  sunset: "06:28 PM",
  hourlyForecast: [
    { time: "Now", temp: 32, icon: "weather-partly-cloudy", rainProb: "20%" },
    { time: "12 PM", temp: 34, icon: "weather-sunny", rainProb: "10%" },
    { time: "02 PM", temp: 33, icon: "weather-pouring", rainProb: "75%" },
    { time: "04 PM", temp: 30, icon: "weather-rainy", rainProb: "85%" },
    { time: "06 PM", temp: 28, icon: "weather-partly-cloudy", rainProb: "30%" },
    { time: "08 PM", temp: 27, icon: "weather-night", rainProb: "15%" },
  ]
};

export const mockAiReport = {
  reportId: "rep-colombo-001",
  title: "Colombo Weather Intelligence Brief",
  greeting: "Good morning, Kayal!",
  summary: "Very high UV exposure expected until 1:30 PM. Heavy monsoonal rain likely after 2:00 PM with potential short-term localized flooding near low-lying roads.",
  riskLevel: "MODERATE",
  riskColor: "#F97316", // Orange
  personalizedAdvisory: "🎓 Student Tip: If you have afternoon lectures or outdoor sports, complete outdoor activities before 1:30 PM. Carry a sturdy umbrella and keep electronic devices waterproofed.",
  healthAlerts: [
    {
      type: "Heatstroke & Dehydration",
      severity: "HIGH",
      advice: "Apparent temperature reaches 37°C around noon. Drink at least 2.5L of water today."
    },
    {
      type: "UV Radiation Burn",
      severity: "VERY HIGH",
      advice: "UV index peaks at 9 between 11 AM and 2 PM. Sunscreen SPF 50+ strongly recommended."
    }
  ],
  forecastOutlook: "Rain clouds clearing by 6:30 PM giving way to a breezy evening at 27°C.",
  clothingSuggestion: "Breathable cotton attire + light rain jacket + UV sunglasses.",
  funFact: "Sri Lanka's southwest monsoon (Yala) brings heavy moisture from the Indian Ocean between May and September!",
  generatedAt: "10:15 AM today"
};

export const mockDisasterAlerts = [
  {
    id: "alert-001",
    title: "Heavy Rainfall & Localized Flood Watch",
    type: "Flood",
    typeIcon: "water-alert",
    severity: "warning", // advisory | watch | warning | emergency
    severityLabel: "WARNING",
    source: "DMC Sri Lanka / OWM",
    time: "30 mins ago",
    affectedArea: "Kelani River Basin & Colombo Suburban Roads",
    distance: "5 km away",
    description: "Meteorological Department issues heavy rainfall warning exceeding 75mm in Western Province.",
    safetyBrief: [
      "Avoid driving through flooded underpasses near Armor Street and Baseline Road.",
      "Keep emergency contacts (117) saved on speed dial.",
      "Store valuable documents in waterproof bags."
    ],
    emergencyContacts: [
      { name: "Disaster Management Centre (DMC)", phone: "117" },
      { name: "Police Emergency", phone: "119" },
      { name: "Ambulance Rescue Service", phone: "1990" }
    ]
  },
  {
    id: "alert-002",
    title: "High Sea Swell & Rough Coastal Waters",
    type: "Marine Hazard",
    typeIcon: "wave",
    severity: "watch",
    severityLabel: "WATCH",
    source: "Sri Lanka Navy Hydrographic Dept",
    time: "2 hours ago",
    affectedArea: "Western & Southern Coastal Belt (Galle to Colombo)",
    distance: "12 km away",
    description: "Wind speeds up to 50 km/h causing wave heights between 2.5m – 3.0m.",
    safetyBrief: [
      "Naval and fishing communities advised not to venture into deep sea.",
      "Beachgoers should refrain from swimming due to rip currents."
    ],
    emergencyContacts: [
      { name: "Navy Rescue Hotline", phone: "011-2421414" },
      { name: "DMC Hotline", phone: "117" }
    ]
  }
];

export const mockClothingRecommendation = {
  summary: "Lightweight, moisture-wicking clothes recommended for humid morning conditions, plus rain protection for the afternoon.",
  items: [
    { category: "Top Wear", recommendation: "Breathable Light Cotton Shirt / T-Shirt", icon: "tshirt-crew" },
    { category: "Bottom Wear", recommendation: "Lightweight Linen Pants / Shorts", icon: "human-legs" },
    { category: "Footwear", recommendation: "Water-resistant Sandals or Quick-Dry Shoes", icon: "shoe-formal" }
  ],
  accessories: [
    { item: "Folding Umbrella", icon: "umbrella", priority: "Must Have" },
    { item: "UV400 Sunglasses", icon: "glasses", priority: "Recommended" },
    { item: "Sunscreen SPF 50+", icon: "bottle-tonic", priority: "Essential" }
  ],
  proTip: "Humidity is at 82%. Avoid heavy denim or synthetic fabrics that trap heat."
};

export const mockOutdoorSafety = {
  activities: [
    { id: "walking", name: "Walking", icon: "walk", riskScore: 25, status: "LOW RISK" },
    { id: "jogging", name: "Jogging", icon: "run", riskScore: 40, status: "MODERATE" },
    { id: "cycling", name: "Cycling", icon: "bike", riskScore: 65, status: "HIGH RISK" },
    { id: "hiking", name: "Hiking", icon: "hiking", riskScore: 80, status: "DANGEROUS" },
    { id: "swimming", name: "Beach/Swim", icon: "swim", riskScore: 75, status: "HIGH RISK" },
    { id: "farming", name: "Farming", icon: "sprout", riskScore: 50, status: "MODERATE" },
  ],
  bestTimeWindow: {
    start: "06:30 AM",
    end: "10:30 AM",
    reason: "Coolest temperatures (27°C - 29°C) and low rain probability before afternoon heat."
  },
  checklist: [
    { id: "1", text: "Carry at least 1.5L of clean drinking water", checked: true },
    { id: "2", text: "Apply UV protection before stepping outside", checked: true },
    { id: "3", text: "Pack waterproof casing for phone & wallet", checked: false },
    { id: "4", text: "Inform family of your planned route", checked: false }
  ]
};

export const mockRoutes = [
  {
    id: "route-1",
    title: "Via A1 Colombo - Kandy Highway",
    distance: "114 km",
    duration: "2 hr 45 min",
    riskLevel: "SAFE",
    riskScore: 20,
    riskColor: "#22C55E",
    weatherOnRoute: "Clear sky up to Warakapola; light drizzle near Kadugannawa.",
    highlights: ["Smoothest road surface", "Low flood risk", "Multiple rest stops"],
    coordinates: {
      origin: { latitude: 6.9271, longitude: 79.8612 },
      destination: { latitude: 7.2906, longitude: 80.6337 }
    }
  },
  {
    id: "route-2",
    title: "Via E04 Central Expressway",
    distance: "128 km",
    duration: "2 hr 20 min",
    riskLevel: "MODERATE",
    riskScore: 55,
    riskColor: "#F59E0B",
    weatherOnRoute: "Strong crosswinds (45 km/h) near Mirigama interchange.",
    highlights: ["Fastest route", "High speed winds", "Toll required"],
    coordinates: {
      origin: { latitude: 6.9271, longitude: 79.8612 },
      destination: { latitude: 7.2906, longitude: 80.6337 }
    }
  },
  {
    id: "route-3",
    title: "Via Low Level Road (Avissawella)",
    distance: "105 km",
    duration: "3 hr 15 min",
    riskLevel: "HAZARDOUS",
    riskScore: 85,
    riskColor: "#EF4444",
    weatherOnRoute: "Heavy monsoon downpour & high risk of waterlogging near Hanwella.",
    highlights: ["Shorter distance", "Flood-prone stretches", "Heavy traffic"],
    coordinates: {
      origin: { latitude: 6.9271, longitude: 79.8612 },
      destination: { latitude: 7.2906, longitude: 80.6337 }
    }
  }
];
