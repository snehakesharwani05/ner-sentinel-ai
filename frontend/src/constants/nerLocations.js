export const NER_STATES = [
  {
    id: "AS",
    name: "Assam",
    bbox: [89.7, 24.1, 96.0, 28.0],
    cities: [
      { name: "Guwahati", lat: 26.1445, lng: 91.7362 },
      { name: "Dispur", lat: 26.1500, lng: 91.7898 },
      { name: "Silchar", lat: 24.8333, lng: 92.7789 },
      { name: "Dibrugarh", lat: 27.4728, lng: 94.9120 },
      { name: "Jorhat", lat: 26.7509, lng: 94.2037 },
      { name: "Nagaon", lat: 26.3466, lng: 92.6841 },
      { name: "Tinsukia", lat: 27.4922, lng: 95.3468 },
      { name: "Bongaigaon", lat: 26.5024, lng: 90.5574 },
      { name: "Tezpur", lat: 26.6528, lng: 92.7926 },
      { name: "Sivasagar", lat: 26.9826, lng: 94.6426 },
      { name: "Karimganj", lat: 24.8690, lng: 92.3590 },
      { name: "Hailakandi", lat: 24.6833, lng: 92.5667 },
      { name: "Goalpara", lat: 26.1700, lng: 90.6200 },
      { name: "Dhubri", lat: 26.0207, lng: 89.9744 },
      { name: "Barpeta", lat: 26.3200, lng: 91.0000 },
      { name: "Nalbari", lat: 26.4447, lng: 91.4398 },
      { name: "Mangaldai", lat: 26.4387, lng: 92.0367 },
      { name: "North Lakhimpur", lat: 27.2366, lng: 94.1037 },
      { name: "Dhemaji", lat: 27.4800, lng: 94.5800 },
      { name: "Golaghat", lat: 26.5200, lng: 93.9700 },
      { name: "Diphu", lat: 25.8450, lng: 93.4300 },
      { name: "Haflong", lat: 25.1700, lng: 93.0200 },
      { name: "Kokrajhar", lat: 26.4000, lng: 90.2700 },
      { name: "Kajalgaon (Chirang)", lat: 26.5400, lng: 90.4900 },
      { name: "Mushalpur (Baksa)", lat: 26.5800, lng: 91.4000 },
      { name: "Udalguri", lat: 26.7400, lng: 92.0900 },
      { name: "Morigaon", lat: 26.2500, lng: 92.3400 },
      { name: "Hojai", lat: 26.0000, lng: 92.8600 },
      { name: "Sonari (Charaideo)", lat: 27.0200, lng: 95.0200 },
      { name: "Garmur (Majuli)", lat: 26.9600, lng: 94.2200 },
      { name: "Biswanath Chariali", lat: 26.7300, lng: 93.1500 },
      { name: "Hatsingimari", lat: 25.6800, lng: 89.8800 },
      { name: "Pathsala (Bajali)", lat: 26.4900, lng: 91.1700 },
      { name: "Tamulpur", lat: 26.6300, lng: 91.5700 },
      { name: "Jagiroad Hub", lat: 26.1200, lng: 92.2100 }
    ] // 35 Hubs
  },
  {
    id: "AR",
    name: "Arunachal Pradesh",
    bbox: [91.5, 26.6, 97.5, 29.5],
    cities: [
      { name: "Itanagar", lat: 27.0844, lng: 93.6053 },
      { name: "Naharlagun", lat: 27.1050, lng: 93.6950 },
      { name: "Tawang", lat: 27.5861, lng: 91.8594 },
      { name: "Pasighat", lat: 28.0665, lng: 95.3268 },
      { name: "Ziro", lat: 27.5950, lng: 93.8340 },
      { name: "Bomdila", lat: 27.2645, lng: 92.4230 },
      { name: "Dirang", lat: 27.3500, lng: 92.2300 },
      { name: "Roing", lat: 28.1400, lng: 95.8300 },
      { name: "Tezu", lat: 27.9200, lng: 96.1600 },
      { name: "Namsai", lat: 27.6700, lng: 95.8600 },
      { name: "Changlang", lat: 27.1200, lng: 95.7300 },
      { name: "Khonsa", lat: 27.0200, lng: 95.5700 },
      { name: "Longding", lat: 26.8500, lng: 95.2300 },
      { name: "Aalo", lat: 28.1700, lng: 94.8000 },
      { name: "Yingkiong", lat: 28.6300, lng: 94.9200 },
      { name: "Daporijo", lat: 27.9800, lng: 94.2200 },
      { name: "Koloriang", lat: 27.9000, lng: 93.3500 },
      { name: "Seppa", lat: 27.3500, lng: 93.0300 },
      { name: "Anini", lat: 28.7900, lng: 95.9000 },
      { name: "Hawai", lat: 27.8800, lng: 96.8000 },
      { name: "Palin", lat: 27.7200, lng: 93.6100 },
      { name: "Raga", lat: 27.7800, lng: 94.0700 },
      { name: "Basar", lat: 27.9800, lng: 94.6700 },
      { name: "Jamin", lat: 27.7700, lng: 93.3000 },
      { name: "Boleng", lat: 28.3300, lng: 94.9700 },
      { name: "Bhalukpong Gate", lat: 27.0100, lng: 92.6500 }
    ] // 26 Hubs
  },
  {
    id: "ML",
    name: "Meghalaya",
    bbox: [89.8, 25.0, 92.8, 26.1],
    cities: [
      { name: "Shillong", lat: 25.5788, lng: 91.8933 },
      { name: "Tura", lat: 25.5144, lng: 90.2032 },
      { name: "Jowai", lat: 25.4526, lng: 92.2035 },
      { name: "Nongpoh", lat: 25.9034, lng: 91.8810 },
      { name: "Williamnagar", lat: 25.4900, lng: 90.6100 },
      { name: "Baghmara", lat: 25.1900, lng: 90.6400 },
      { name: "Resubelpara", lat: 25.9100, lng: 90.6000 },
      { name: "Ampati", lat: 25.4600, lng: 89.9300 },
      { name: "Khliehriat", lat: 25.3500, lng: 92.3600 },
      { name: "Mawkyrwat", lat: 25.3700, lng: 91.4500 },
      { name: "Mairang", lat: 25.5600, lng: 91.6400 },
      { name: "Byrnihat Corridor", lat: 26.0500, lng: 91.8700 }
    ] // 12 Hubs
  },
  {
    id: "NL",
    name: "Nagaland",
    bbox: [93.3, 25.2, 95.3, 27.0],
    cities: [
      { name: "Kohima", lat: 25.6751, lng: 94.1086 },
      { name: "Dimapur", lat: 25.9090, lng: 93.7266 },
      { name: "Mokokchung", lat: 26.3248, lng: 94.5165 },
      { name: "Tuensang", lat: 26.2800, lng: 94.8300 },
      { name: "Wokha", lat: 26.1000, lng: 94.2600 },
      { name: "Zunheboto", lat: 25.9700, lng: 94.5200 },
      { name: "Mon", lat: 26.7500, lng: 95.0700 },
      { name: "Phek", lat: 25.6600, lng: 94.5000 },
      { name: "Kiphire", lat: 25.8700, lng: 94.7800 },
      { name: "Longleng", lat: 26.4700, lng: 94.8100 },
      { name: "Peren", lat: 25.5200, lng: 93.7300 },
      { name: "Noklak", lat: 26.1900, lng: 95.0000 },
      { name: "Chumoukedima", lat: 25.8100, lng: 93.7600 },
      { name: "Niuland", lat: 25.9500, lng: 93.9000 },
      { name: "Tseminyu", lat: 25.9200, lng: 94.2100 },
      { name: "Shamator", lat: 26.0500, lng: 94.8800 }
    ] // 16 Hubs
  },
  {
    id: "MN",
    name: "Manipur",
    bbox: [93.0, 23.8, 94.8, 25.7],
    cities: [
      { name: "Imphal West", lat: 24.8170, lng: 93.9368 },
      { name: "Imphal East (Porompat)", lat: 24.8200, lng: 93.9600 },
      { name: "Churachandpur", lat: 24.3333, lng: 93.6833 },
      { name: "Thoubal", lat: 24.6300, lng: 93.9900 },
      { name: "Bishnupur", lat: 24.6300, lng: 93.7600 },
      { name: "Ukhrul", lat: 25.1100, lng: 94.3600 },
      { name: "Senapati", lat: 25.2667, lng: 94.0167 },
      { name: "Tamenglong", lat: 24.9800, lng: 93.4900 },
      { name: "Chandel", lat: 24.3200, lng: 94.0000 },
      { name: "Kangpokpi", lat: 25.1500, lng: 93.9700 },
      { name: "Jiribam Railhead", lat: 24.8000, lng: 93.1200 },
      { name: "Kakching", lat: 24.4800, lng: 93.9800 },
      { name: "Tengnoupal (Moreh Border)", lat: 24.3900, lng: 94.1500 },
      { name: "Kamjong", lat: 24.9300, lng: 94.5000 },
      { name: "Noney", lat: 24.7800, lng: 93.6200 },
      { name: "Pherzawl", lat: 24.2500, lng: 93.1800 }
    ] // 16 Hubs
  },
  {
    id: "MZ",
    name: "Mizoram",
    bbox: [92.2, 21.9, 93.5, 24.5],
    cities: [
      { name: "Aizawl", lat: 23.7271, lng: 92.7176 },
      { name: "Lunglei", lat: 22.8833, lng: 92.7333 },
      { name: "Champhai", lat: 23.4750, lng: 93.3283 },
      { name: "Kolasib (Bhairabi Gate)", lat: 24.2200, lng: 92.6800 },
      { name: "Serchhip", lat: 23.3400, lng: 92.8500 },
      { name: "Lawngtlai", lat: 22.5300, lng: 92.8900 },
      { name: "Siaha", lat: 22.4900, lng: 92.9800 },
      { name: "Mamit", lat: 23.9300, lng: 92.4900 },
      { name: "Hnahthial", lat: 22.9600, lng: 92.9300 },
      { name: "Khawzawl", lat: 23.5300, lng: 93.1800 },
      { name: "Saitual", lat: 23.9700, lng: 92.5700 }
    ] // 11 Hubs
  },
  {
    id: "TR",
    name: "Tripura",
    bbox: [91.1, 22.9, 92.4, 24.5],
    cities: [
      { name: "Agartala", lat: 23.8315, lng: 91.2868 },
      { name: "Dharmanagar", lat: 24.3769, lng: 92.1645 },
      { name: "Udaipur", lat: 23.5333, lng: 91.4833 },
      { name: "Kailashahar", lat: 24.3300, lng: 92.0100 },
      { name: "Ambassa", lat: 23.9200, lng: 91.8500 },
      { name: "Belonia", lat: 23.2500, lng: 91.4500 },
      { name: "Khowai", lat: 24.0600, lng: 91.6000 },
      { name: "Bishramganj (Sepahijala)", lat: 23.6300, lng: 91.3100 }
    ] // 8 Hubs
  },
  {
    id: "SK",
    name: "Sikkim",
    bbox: [88.0, 27.0, 88.9, 28.1],
    cities: [
      { name: "Gangtok", lat: 27.3389, lng: 88.6065 },
      { name: "Namchi", lat: 27.1667, lng: 88.3500 },
      { name: "Geyzing", lat: 27.2800, lng: 88.2500 },
      { name: "Mangan", lat: 27.5000, lng: 88.5333 },
      { name: "Soreng", lat: 27.1700, lng: 88.2000 },
      { name: "Pakyong Airport Hub", lat: 27.2300, lng: 88.5900 }
    ] // 6 Hubs
  }
];

// Calculate Total Tracked Logistics Hubs
export const TOTAL_NER_HUBS_COUNT = NER_STATES.reduce((acc, st) => acc + st.cities.length, 0); // 127 Hubs

export const ALL_NER_REGION = {
  id: "ALL",
  name: "All Northeast States (NER Overview)",
  bbox: [88.0, 21.0, 98.0, 29.5],
  cities: NER_STATES.flatMap(st => st.cities)
};
