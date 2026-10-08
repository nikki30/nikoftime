// Every stop in the empire. Each one has a reason to zoom in: a street plan, a coastline or a building
// that tells a story from above. `look` is a list of map views, each with a "notice…" fact.
// Coordinates are [longitude, latitude]. Dishes are vegetarian: no meat, fish or egg.
export const PLACES = [
  {
    id: "barcelona", name: "Barcelona", country: "Spain", cc: "es", at: [2.1650, 41.3915],
    look: [
      { at: [2.1650, 41.3915], z: 15.2, t: "Notice how every block has its corners cut off, making little octagons. Ildefons Cerdà planned this district, the Eixample, in 1859. The cut corners let in more light and air, and give carts (now cars and delivery vans) room to turn and stop." },
      { at: [2.1874, 41.4036], z: 14.6, t: "One long avenue, the Diagonal, slices straight across the grid. Cerdà wanted the city's new centre where it meets two other big avenues, at Plaça de les Glòries." },
      { at: [2.1744, 41.4036], z: 17, t: "Gaudí's Sagrada Família fills a whole block of the grid. It has been under construction since 1882." },
    ],
    dish: { name: "Pa amb tomàquet", wiki: "Pa amb tomàquet", what: "Toasted country bread rubbed with a ripe tomato and garlic, then drizzled with olive oil and a pinch of salt. It's crunchy, juicy and garlicky, and it comes with almost every meal in Catalonia." },
  },
  {
    id: "paris", name: "Paris", country: "France", cc: "fr", at: [2.2950, 48.8738],
    look: [
      { at: [2.2950, 48.8738], z: 14.8, t: "Notice the star: twelve avenues shoot out from the Arc de Triomphe. Baron Haussmann rebuilt Paris this way in the 1850s and 60s for Napoleon III, replacing cramped medieval lanes with wide, straight boulevards." },
      { at: [2.3477, 48.8546], z: 15, t: "This island in the Seine, the Île de la Cité, is where Paris began over 2,000 years ago. Notre-Dame sits at its eastern end." },
      { at: [2.3100, 48.8700], z: 12.4, t: "Zoom out and you can follow one straight line from the Louvre, along the Champs-Élysées, through the Arc de Triomphe, all the way to the towers of La Défense. Parisians call it the Axe historique." },
    ],
    dish: { name: "Ratatouille", wiki: "Ratatouille", what: "A slow-cooked stew of aubergine, courgette, peppers, tomato and onion with garlic, olive oil and herbs from Provence. It's soft, sweet and summery, and it tastes even better the next day." },
  },
  {
    id: "amsterdam", name: "Amsterdam", country: "Netherlands", cc: "nl", at: [4.8880, 52.3700],
    look: [
      { at: [4.8880, 52.3700], z: 14.2, t: "Notice the canals curving in half-rings around the old centre, like ripples in a pond. This canal ring was dug in the 1600s, the Dutch Golden Age, and is a UNESCO World Heritage Site." },
      { at: [4.8926, 52.3731], z: 16, t: "Dam Square marks the spot where a dam was built across the Amstel river around 1270. Amstel + dam = Amsterdam." },
    ],
    dish: { name: "Poffertjes", wiki: "Poffertjes", what: "Tiny, fluffy pancakes made with yeast and buckwheat flour, cooked in a special pan full of dimples. They come in a pile, with melting butter and a snowfall of powdered sugar." },
  },
  {
    id: "palmanova", name: "Palmanova", country: "Italy", cc: "it", at: [13.3097, 45.9054],
    look: [
      { at: [13.3097, 45.9054], z: 14.4, t: "Notice the perfect nine-pointed star. The Republic of Venice founded Palmanova in 1593 as a fortress town, designed so defenders on each point could cover the walls next to it." },
      { at: [13.3097, 45.9054], z: 16.8, t: "Streets run out from a six-sided main square like spokes, so soldiers could reach any wall quickly. Napoleon's engineers later added the outermost ring of fortifications." },
    ],
    dish: { name: "Frico", wiki: "Frico", what: "A golden, crispy cake of Montasio cheese and potato from this corner of Italy, Friuli. Think of the best crunchy cheese edge of a pizza, made into a whole dish." },
  },
  {
    id: "manhattan", name: "Manhattan, New York", country: "United States", cc: "us", at: [-73.9855, 40.7580],
    look: [
      { at: [-73.9750, 40.7640], z: 13.6, t: "Notice the grid. The Commissioners' Plan of 1811 laid out numbered streets and avenues across the whole island, long before most of it was built. It's tilted about 29° from true north, so twice a year the sunset lines up with the streets: Manhattanhenge." },
      { at: [-73.9855, 40.7580], z: 16, t: "Broadway is older than the grid and cuts across it at an angle. Wherever it crosses an avenue you get a bow-tie-shaped open space. This one is Times Square." },
      { at: [-73.9665, 40.7812], z: 13.2, t: "Central Park is a giant rectangle carved out of the grid in the 1850s. Every hill, lake and meadow in it was landscaped by people." },
    ],
    dish: { name: "New York-style pizza", wiki: "New York–style pizza", what: "Huge, thin slices you fold in half to eat on the go. The crust is crisp underneath and chewy at the edge, with a light tomato sauce and plenty of mozzarella." },
  },
  {
    id: "jaipur", name: "Jaipur", country: "India", cc: "in", at: [75.8230, 26.9220],
    look: [
      { at: [75.8230, 26.9220], z: 14.4, t: "Notice the straight, wide streets crossing at right angles. Maharaja Sawai Jai Singh II founded Jaipur in 1727 as one of India's first planned cities, laid out in blocks following the ideas of Vastu Shastra." },
      { at: [75.8267, 26.9239], z: 17, t: "This is the Hawa Mahal, the Palace of Winds, with 953 small windows. Royal women could watch street life below without being seen. The old city was painted pink in 1876 to welcome the Prince of Wales." },
      { at: [75.8246, 26.9248], z: 17.4, t: "Those odd shapes are Jantar Mantar, an observatory Jai Singh built. It includes one of the world's largest stone sundials, which tells the time to within a couple of seconds." },
    ],
    dish: { name: "Dal baati churma", wiki: "Dal baati churma", what: "Hard wheat dumplings (baati) baked until crusty, cracked open and soaked in ghee, eaten with spicy lentils and churma, a sweet crumble of the same dough. Rich, smoky and very filling: food for the desert." },
  },
  {
    id: "chandigarh", name: "Chandigarh", country: "India", cc: "in", at: [76.7794, 30.7333],
    look: [
      { at: [76.7794, 30.7333], z: 13, t: "Notice the city is a neat grid of big rectangles called sectors, each roughly 800 m by 1200 m, with its own shops, school and green belt. It was designed by the architect Le Corbusier in the 1950s. There is no Sector 13: it was skipped as unlucky." },
      { at: [76.8040, 30.7590], z: 16, t: "The Capitol Complex sits at the 'head' of the city, against the hills. Le Corbusier's buildings here are a UNESCO World Heritage Site." },
      { at: [76.8077, 30.7525], z: 16.4, t: "This patch is the Rock Garden. A road inspector, Nek Chand, secretly built it from broken tiles, bangles and scrap for nearly 18 years before the city found out." },
    ],
    dish: { name: "Chole bhature", wiki: "Chole bhature", what: "Spicy, tangy chickpea curry with bhature: big puffed-up fried breads, crisp outside and soft inside. A proper Punjabi breakfast that keeps you full until dinner." },
  },
  {
    id: "brasilia", name: "Brasília", country: "Brazil", cc: "br", at: [-47.8828, -15.7939],
    look: [
      { at: [-47.8828, -15.7939], z: 12, t: "Notice the shape: the city centre looks like an aeroplane or a bird with its wings spread. Lúcio Costa planned Brasília from nothing in the late 1950s, and it became Brazil's capital in 1960." },
      { at: [-47.8645, -15.7998], z: 15, t: "Along the 'body' runs the Monumental Axis. At its tip are the twin towers and two bowls of the National Congress, designed by Oscar Niemeyer." },
      { at: [-47.8950, -15.8110], z: 15.6, t: "The 'wings' are made of superquadras: blocks of apartment buildings on stilts, surrounded by trees, each with its own school and shops." },
    ],
    dish: { name: "Brigadeiro", wiki: "Brigadeiro", what: "Small chocolate truffles made from condensed milk, cocoa and butter, rolled in chocolate sprinkles. Soft, fudgy and at every Brazilian birthday party." },
  },
  {
    id: "kyoto", name: "Kyoto", country: "Japan", cc: "jp", at: [135.7600, 35.0050],
    look: [
      { at: [135.7600, 35.0050], z: 14, t: "Notice the tidy grid. Kyoto was founded in 794 as Heian-kyō, the imperial capital, and copied the plan of China's great Tang capital, Chang'an. The east-west streets were numbered: Shijō means Fourth Avenue." },
      { at: [135.7621, 35.0254], z: 15, t: "The Imperial Palace sits in its big park at the north of the grid. In Kyoto, directions are still given as agaru (go up, north, towards the palace) and sagaru (go down, south)." },
    ],
    dish: { name: "Yudōfu", wiki: "Yudōfu", what: "Silky blocks of tofu simmered gently in a kombu seaweed broth and dipped in a light soy sauce. Delicate, warm and calming: a Kyoto speciality near its Zen temples." },
  },
  {
    id: "dubai", name: "Palm Jumeirah, Dubai", country: "United Arab Emirates", cc: "ae", at: [55.1390, 25.1124],
    look: [
      { at: [55.1390, 25.1124], z: 12.2, t: "Notice the palm tree in the sea. These islands didn't exist before 2001: ships sprayed sand dredged from the seabed into place, guided by GPS." },
      { at: [55.1171, 25.1304], z: 14.4, t: "The crescent around the edge is a breakwater of rock. It shields the 'fronds' from waves, and the hotel at its centre is Atlantis." },
    ],
    dish: { name: "Luqaimat", wiki: "Luqaimat", what: "Little dough balls fried until crunchy outside and airy inside, then drizzled with date syrup and sprinkled with sesame. Popular at Ramadan iftars." },
  },
  {
    id: "mexico-city", name: "Mexico City", country: "Mexico", cc: "mx", at: [-99.1332, 19.4326],
    look: [
      { at: [-99.1332, 19.4326], z: 16, t: "Notice the huge empty square, the Zócalo. Mexico City is built on top of Tenochtitlan, the Aztec capital, which stood on an island in Lake Texcoco. The Spanish laid their grid over the Aztec causeways." },
      { at: [-99.1316, 19.4346], z: 17.4, t: "The ruins next to the cathedral are the Templo Mayor, the Aztecs' great temple. They were only uncovered in 1978, when electricians dug up a huge carved stone." },
      { at: [-99.1332, 19.4340], z: 16.8, t: "Because the city sits on soft old lake bed, it is sinking, by tens of centimetres a year in some places. The Metropolitan Cathedral visibly leans." },
    ],
    dish: { name: "Quesadilla de flor de calabaza", wiki: "Squash blossom", what: "A corn tortilla folded around melty Oaxaca cheese and squash blossoms (the flowers of the pumpkin plant), cooked on a hot griddle. Gooey, a little floral, and sold from street stalls everywhere." },
  },
  {
    id: "giza", name: "Giza", country: "Egypt", cc: "eg", at: [31.1342, 29.9792],
    look: [
      { at: [31.1342, 29.9792], z: 15, t: "Notice how square the pyramids sit. The Great Pyramid's sides line up with north, south, east and west almost perfectly, and it was built around 4,500 years ago." },
      { at: [31.2000, 30.0000], z: 9.6, t: "Zoom out and look at the edge of green. Nearly all of Egypt's people live within a few kilometres of the Nile. Step past where the water reaches and it's straight into desert." },
    ],
    dish: { name: "Koshari", wiki: "Koshari", what: "Egypt's favourite street food: rice, lentils and macaroni topped with a spicy tomato sauce, garlicky vinegar, chickpeas and a crown of crispy fried onions. It's cheap and comforting, with a crunch in every bite." },
  },
  {
    id: "marrakech", name: "Marrakech", country: "Morocco", cc: "ma", at: [-7.9891, 31.6258],
    look: [
      { at: [-7.9860, 31.6310], z: 16, t: "Notice the tangle of tiny lanes. The old city, the medina, is a maze of narrow alleys called derbs, many of them dead ends. They kept homes private and shaded, and were hard for invaders to navigate." },
      { at: [-7.9891, 31.6258], z: 17, t: "This open space is Jemaa el-Fnaa. By day it's orange-juice stalls and snake charmers; at night it fills with food stalls, storytellers and musicians. UNESCO lists it as intangible heritage." },
      { at: [-7.9936, 31.6237], z: 17, t: "The Koutoubia Mosque's 12th-century minaret is still the landmark people navigate by, because buildings in the medina are kept low. The whole city is built of red earth, so it's called the Red City." },
    ],
    dish: { name: "Msemen", wiki: "Msemen", what: "Square, flaky flatbreads made by folding thin dough over and over with butter, then pan-frying. Eaten warm with honey and mint tea for breakfast." },
  },
  {
    id: "istanbul", name: "Istanbul", country: "Turkey", cc: "tr", at: [28.9790, 41.0080],
    look: [
      { at: [29.0300, 41.0700], z: 11.4, t: "Notice the strait running through the city. That's the Bosphorus: Istanbul is the only great city that sits on two continents, Europe on the left and Asia on the right." },
      { at: [28.9790, 41.0080], z: 16, t: "Hagia Sophia and the Blue Mosque face each other across a park. Hagia Sophia was finished in 537 and was the largest cathedral in the world for almost a thousand years." },
      { at: [28.9230, 41.0170], z: 14.2, t: "That line running north to south is the Theodosian Walls, built in the 5th century. They protected the city, then Constantinople, for a thousand years." },
    ],
    dish: { name: "Simit", wiki: "Simit", what: "A ring of bread dipped in grape molasses and covered in sesame seeds, then baked. Crunchy and nutty outside, chewy inside, sold from red carts on every corner." },
  },
  {
    id: "beijing", name: "Beijing", country: "China", cc: "cn", at: [116.3972, 39.9163],
    look: [
      { at: [116.3972, 39.9163], z: 15, t: "Notice the huge walled rectangle with a moat. The Forbidden City was the emperors' palace for nearly 500 years. It sits on a north-south line that runs straight through the middle of old Beijing." },
      { at: [116.4030, 39.9370], z: 16.4, t: "These narrow lanes are hutongs: alleys between courtyard houses, some centuries old. Each house turns its back to the street and opens onto a private courtyard." },
      { at: [116.4074, 39.9042], z: 10.4, t: "Zoom out and you'll see ring roads wrapping around the centre, numbered from the 2nd Ring Road (where the old city wall used to be) out to the 6th." },
    ],
    dish: { name: "Tanghulu", wiki: "Tanghulu", what: "Hawthorn berries (or strawberries and grapes) on a skewer, coated in hard sugar syrup that sets like glass. It cracks when you bite it, then the fruit is sour and juicy. A Beijing winter street snack." },
  },
  {
    id: "hanoi", name: "Hanoi", country: "Vietnam", cc: "vn", at: [105.8500, 21.0340],
    look: [
      { at: [105.8500, 21.0340], z: 16, t: "Notice the narrow, deep buildings. Hanoi's Old Quarter is full of 'tube houses', sometimes just a few metres wide but very long, because the street-front was the valuable part for shops." },
      { at: [105.8510, 21.0360], z: 17, t: "Many streets here are named after what was sold on them: Hàng Bạc is Silver Street and Hàng Gai was Hemp Street (today it sells silk). Some trades are still on their old streets." },
      { at: [105.8524, 21.0287], z: 16, t: "Hoàn Kiếm means 'Lake of the Returned Sword'. Legend says an emperor returned a magic sword to a golden turtle that lived in it." },
    ],
    dish: { name: "Phở chay", wiki: "Pho", what: "The vegetarian version of Vietnam's famous noodle soup: flat rice noodles in a clear broth fragrant with star anise, cinnamon and charred ginger, topped with tofu, mushrooms and lots of fresh herbs and lime." },
  },
  {
    id: "singapore", name: "Singapore", country: "Singapore", cc: "sg", at: [103.8607, 1.2834],
    look: [
      { at: [103.8607, 1.2834], z: 14, t: "Notice how much of the shoreline is perfectly straight. A lot of Singapore is reclaimed land: since independence the country has grown by about a quarter by filling in the sea." },
      { at: [103.8636, 1.2816], z: 16, t: "Gardens by the Bay, with its tree-shaped 'Supertrees', sits entirely on land that was sea a few decades ago." },
    ],
    dish: { name: "Cendol", wiki: "Cendol", what: "Shaved ice with coconut milk, gula melaka (dark palm sugar syrup) and bright green, jelly-like noodles flavoured with pandan. Creamy, smoky-sweet and very cooling in the heat." },
  },
  {
    id: "santorini", name: "Santorini", country: "Greece", cc: "gr", at: [25.3960, 36.4040],
    look: [
      { at: [25.3960, 36.4040], z: 10.8, t: "Notice the ring of islands around a lagoon of sea. It's a flooded volcano crater, a caldera. The volcano blew apart in a huge eruption around 3,600 years ago." },
      { at: [25.3753, 36.4618], z: 16, t: "The white villages, like Oia here, cling to the top of the crater's cliffs. Many homes were dug straight into the soft volcanic rock as cave houses, which stay cool in summer." },
    ],
    dish: { name: "Fava", wiki: "Fava (Greek dish)", what: "A silky purée of yellow split peas grown in Santorini's volcanic soil, topped with olive oil, raw onion and capers. Like a smooth, buttery dal." },
  },
  {
    id: "cape-town", name: "Cape Town", country: "South Africa", cc: "za", at: [18.4098, -33.9628],
    look: [
      { at: [18.4098, -33.9628], z: 12.6, t: "Notice the flat-topped mountain right behind the city. Table Mountain's top is a plateau about 3 km wide. When clouds pour over it, locals say the 'tablecloth' is on." },
      { at: [18.4155, -33.9205], z: 16, t: "Bo-Kaap's houses are painted every colour you can think of. It's the historic home of the Cape Malay community, descendants of people brought from Southeast Asia centuries ago, many of them enslaved." },
    ],
    dish: { name: "Chakalaka", wiki: "Chakalaka", what: "A spicy relish of onions, peppers, carrots, tomatoes and baked beans, cooked down with curry powder and chilli. Served with pap (maize porridge) or bread at a braai." },
  },
  {
    id: "lagos", name: "Lagos", country: "Nigeria", cc: "ng", at: [3.3900, 6.4960],
    look: [
      { at: [3.4000, 6.5000], z: 11.8, t: "Notice the long bridge across the lagoon. The Third Mainland Bridge is nearly 12 km long and links Lagos Island to the mainland. Lagos is one of the fastest-growing cities in the world." },
      { at: [3.3900, 6.4960], z: 16, t: "Those rooftops over the water are Makoko, a community of homes on stilts in the lagoon. Many people get around by canoe." },
    ],
    dish: { name: "Puff-puff", wiki: "Puff-puff", what: "Soft, sweet fried dough balls made with yeast, a bit like a doughnut but airier. Sold by street vendors and served at every party." },
  },
  {
    id: "nairobi", name: "Nairobi", country: "Kenya", cc: "ke", at: [36.8580, -1.3733],
    look: [
      { at: [36.8400, -1.3400], z: 11.2, t: "Notice the city's edge meets open grassland. That's Nairobi National Park, where you can photograph lions, rhinos and giraffes with skyscrapers in the background. Few capital cities have a national park on their doorstep." },
    ],
    dish: { name: "Sukuma wiki and ugali", wiki: "Sukuma wiki", what: "Collard greens fried with onion and tomato, served with ugali, a firm maize porridge you pinch off with your fingers to scoop up the greens. Sukuma wiki means 'push the week' in Swahili: cheap food to get you to payday." },
  },
  {
    id: "cusco", name: "Cusco", country: "Peru", cc: "pe", at: [-71.9781, -13.5167],
    look: [
      { at: [-71.9781, -13.5167], z: 15.6, t: "Notice the squares and streets packed into a valley. Cusco was the capital of the Inca Empire. Many Spanish colonial buildings stand on top of Inca stone walls." },
      { at: [-71.9755, -13.5150], z: 18, t: "On this street is the famous twelve-angled stone: Inca masons fitted huge stones together so tightly, without mortar, that you can't slip a knife blade between them. The walls survive earthquakes that knocked down the buildings on top." },
      { at: [-71.9817, -13.5094], z: 15.6, t: "Tradition says the Incas laid out Cusco in the shape of a puma, with the zigzag walls of Sacsayhuamán, up here on the hill, as its head." },
    ],
    dish: { name: "Choclo con queso", wiki: "Choclo", what: "Andean corn on the cob with huge, chewy, pale kernels, served with a slab of fresh salty cheese. Simple, filling street food." },
  },
  {
    id: "buenos-aires", name: "Buenos Aires", country: "Argentina", cc: "ar", at: [-58.3816, -34.6037],
    look: [
      { at: [-58.3816, -34.6037], z: 15, t: "Notice how wide that road is: Avenida 9 de Julio, with up to 7 lanes in each direction, is one of the widest avenues in the world. The Obelisk stands in the middle." },
      { at: [-58.3712, -34.6083], z: 15.4, t: "The grid of square blocks (manzanas, about 100 m on a side) starts at Plaza de Mayo. Spanish colonial law told settlers to build towns this way, around a main square." },
    ],
    dish: { name: "Provoleta", wiki: "Provoleta", what: "A thick disc of provolone cheese grilled until it's crisp outside and molten inside, then sprinkled with oregano and chilli. Argentina's way to start a barbecue." },
  },
  {
    id: "reykjavik", name: "Reykjavík", country: "Iceland", cc: "is", at: [-21.9266, 64.1417],
    look: [
      { at: [-21.9266, 64.1417], z: 16, t: "Notice the church at the top of the hill. Hallgrímskirkja's stepped concrete front was inspired by the basalt columns that form when lava cools." },
      { at: [-21.9326, 64.1504], z: 16, t: "The glass building on the harbour is Harpa, the concert hall. Its facade is also based on basalt columns. Reykjavík is the world's northernmost capital of a sovereign state." },
    ],
    dish: { name: "Skyr", wiki: "Skyr", what: "Thick, creamy cultured dairy, technically a soft cheese but eaten like yogurt. Tangy, high in protein, and often served with berries and a little cream." },
  },
  {
    id: "seoul", name: "Seoul", country: "South Korea", cc: "kr", at: [126.9780, 37.5690],
    look: [
      { at: [126.9780, 37.5700], z: 15, t: "Notice the thin stream running through downtown. Cheonggyecheon was covered by a road and an elevated motorway for decades. In 2005 the city tore down the motorway and brought the stream back as a park." },
      { at: [126.9770, 37.5796], z: 15, t: "Gyeongbokgung Palace has a mountain behind it and faces south. That follows pungsu, Korean geomancy (like feng shui): mountains to the back, water to the front." },
    ],
    dish: { name: "Hotteok", wiki: "Hotteok", what: "A sweet pancake filled with brown sugar, cinnamon and chopped nuts, fried until crisp. The filling melts into a hot syrup, so bite carefully. A winter street snack." },
  },
  {
    id: "sydney", name: "Sydney", country: "Australia", cc: "au", at: [151.2153, -33.8568],
    look: [
      { at: [151.2130, -33.8545], z: 15, t: "Notice the white sails on the point. Jørn Utzon's Sydney Opera House opened in 1973. Its shells are all cut from the surface of one imaginary sphere, which is what finally made them possible to build." },
      { at: [151.2300, -33.8400], z: 12.4, t: "Zoom out to see Sydney Harbour's wiggly coastline. It's a drowned river valley: when sea levels rose after the last ice age, the sea flooded the river's branches." },
    ],
    dish: { name: "Vegemite on toast", wiki: "Vegemite", what: "Hot buttered toast with a thin scrape of Vegemite, a dark, salty yeast-extract spread. Very savoury and a bit like a soy-sauce hit. Spread it thin." },
  },
  {
    id: "london", name: "London", country: "United Kingdom", cc: "gb", at: [-0.0900, 51.5142],
    look: [
      { at: [-0.0900, 51.5142], z: 15, t: "Notice how crooked the lanes are here. After the Great Fire of 1666, Christopher Wren drew up a plan for neat avenues, but people rebuilt on their old plots, so the City of London kept its medieval street pattern." },
      { at: [-0.0984, 51.5138], z: 16.4, t: "Wren did get to rebuild St Paul's Cathedral, with its famous dome. Planning rules still protect views of it from across London." },
      { at: [-0.0150, 51.4950], z: 13, t: "The Thames loops around a peninsula here: the Isle of Dogs, now home to the towers of Canary Wharf, which used to be docks." },
    ],
    dish: { name: "Crumpets", wiki: "Crumpet", what: "Spongy griddle cakes full of little holes on top. Toast them and the butter melts down into every hole. Perfect with tea." },
  },
  {
    id: "jatiluwih", name: "Jatiluwih, Bali", country: "Indonesia", cc: "id", at: [115.1310, -8.3700],
    look: [
      { at: [115.1310, -8.3700], z: 15, t: "Notice the hillside carved into steps. These are rice terraces, watered by subak, a 1,000-year-old system of shared canals run by farmers and water temples. It is a UNESCO World Heritage Site." },
    ],
    dish: { name: "Tempeh", wiki: "Tempeh", what: "Soybeans fermented into a firm cake, from neighbouring Java and eaten all over Indonesia. Fried until golden, it's nutty and crisp, often tossed in sweet soy sauce and chilli." },
  },
  {
    id: "bhaktapur", name: "Bhaktapur", country: "Nepal", cc: "np", at: [85.4280, 27.6722],
    look: [
      { at: [85.4280, 27.6722], z: 16.2, t: "Notice the brick squares packed with temples. Bhaktapur was one of three rival kingdoms in the Kathmandu Valley, and each built its own royal Durbar Square." },
      { at: [85.4293, 27.6716], z: 17.6, t: "The five-storey Nyatapola temple, built in 1702, is one of the tallest pagodas in Nepal. It survived the big earthquakes of 1934 and 2015." },
    ],
    dish: { name: "Veg momo", wiki: "Momo (food)", what: "Steamed dumplings filled with cabbage, onion, ginger and spices, dunked in a fiery tomato-sesame achar. Soft, juicy and impossible to stop eating." },
  },
  {
    id: "sigiriya", name: "Sigiriya", country: "Sri Lanka", cc: "lk", at: [80.7603, 7.9570],
    look: [
      { at: [80.7580, 7.9570], z: 15.4, t: "Notice the huge rock rising out of the jungle, about 180 m tall. In the 5th century King Kashyapa built a palace on top. You climbed up between the paws of a giant stone lion." },
      { at: [80.7520, 7.9565], z: 16.4, t: "To the west are symmetrical water gardens, some of the oldest landscaped gardens in the world. Some fountains still work in the rainy season." },
    ],
    dish: { name: "Appam", wiki: "Appam", what: "Bowl-shaped pancakes of fermented rice batter and coconut milk: crispy, lacy edges and a soft, spongy centre. Eaten with a coconut-chilli sambol or curry. Sri Lankans call them hoppers." },
  },
  {
    id: "quebec", name: "Québec City", country: "Canada", cc: "ca", at: [-71.2075, 46.8123],
    look: [
      { at: [-71.2075, 46.8123], z: 15, t: "Notice the walls around the old town. Québec is the only city north of Mexico that still has its fortified walls." },
      { at: [-71.2047, 46.8119], z: 16.6, t: "The castle-like hotel on the cliff is the Château Frontenac, said to be the most photographed hotel in the world." },
    ],
    dish: { name: "Maple taffy", wiki: "Maple taffy", what: "Boiled maple syrup poured onto clean snow, where it sets into a soft, chewy toffee you roll up on a stick. A spring treat at sugar shacks." },
  },
  {
    id: "karlsruhe", name: "Karlsruhe", country: "Germany", cc: "de", at: [8.4044, 49.0134],
    look: [
      { at: [8.4044, 49.0134], z: 14, t: "Notice the fan. Karlsruhe was founded in 1715 with its palace at the centre and 32 streets radiating out from the palace tower, like the spokes of a wheel. The city calls itself the 'fan city'." },
    ],
    dish: { name: "Brezel", wiki: "Pretzel", what: "The classic southern German pretzel: dipped in lye before baking, which gives it a shiny, dark brown crust and a chewy inside, plus big flakes of salt." },
  },
  {
    id: "lisbon", name: "Lisbon", country: "Portugal", cc: "pt", at: [-9.1380, 38.7110],
    look: [
      { at: [-9.1380, 38.7110], z: 16, t: "Notice the neat grid between the hills. In 1755 an earthquake, tsunami and fire destroyed this district. The Marquis of Pombal rebuilt it with straight streets and buildings with a wooden 'cage' inside designed to flex in earthquakes." },
      { at: [-9.1364, 38.7075], z: 16.4, t: "Praça do Comércio opens straight onto the river, where the royal palace stood before the earthquake. Ships once landed right at its steps." },
    ],
    dish: { name: "Tremoços", wiki: "Lupinus albus", what: "Yellow lupin beans soaked and brined, eaten as a snack with a cold drink. You pop the bean out of its skin into your mouth: salty and firm, a bit like edamame." },
  },
  {
    id: "bangkok", name: "Bangkok", country: "Thailand", cc: "th", at: [100.4913, 13.7500],
    look: [
      { at: [100.4950, 13.7540], z: 14.4, t: "Notice the old centre is ringed by canals. Rattanakosin Island isn't a natural island: canals (khlongs) were dug to cut it off from the land when the city was founded in 1782." },
      { at: [100.4913, 13.7500], z: 16, t: "Inside it is the Grand Palace, home to the Emerald Buddha. Bangkok's full ceremonial name is one of the longest place names in the world." },
    ],
    dish: { name: "Mango sticky rice", wiki: "Mango sticky rice", what: "Sweet ripe mango with sticky rice cooked in sweetened coconut milk, topped with salty coconut cream and crunchy mung beans. Warm, creamy and tropical." },
  },
  {
    id: "cartagena", name: "Cartagena", country: "Colombia", cc: "co", at: [-75.5480, 10.4236],
    look: [
      { at: [-75.5480, 10.4236], z: 15.4, t: "Notice the thick walls around the old town. The Spanish built them over two centuries to protect the treasure ships that sailed from here." },
      { at: [-75.5394, 10.4227], z: 16.2, t: "On the hill is Castillo San Felipe de Barajas, the biggest fortress Spain built in the Americas, full of tunnels designed to carry sound so defenders could hear attackers coming." },
    ],
    dish: { name: "Arepa", wiki: "Arepa", what: "A thick corn-flour cake toasted on a griddle until crisp outside and soft inside, split and stuffed with cheese that melts into it." },
  },
  {
    id: "angkor", name: "Angkor Wat", country: "Cambodia", cc: "kh", at: [103.8670, 13.4125],
    look: [
      { at: [103.8670, 13.4125], z: 14.8, t: "Notice the giant square moat, about 190 m wide. Angkor Wat was built in the 12th century and is the largest religious monument in the world. Unusually, it faces west." },
    ],
    dish: { name: "Num ansom chek", wiki: "Num ansom", what: "Sticky rice wrapped around a ripe banana inside banana leaves and steamed. Sweet, chewy and fragrant from the leaf." },
  },
  {
    id: "petra", name: "Petra", country: "Jordan", cc: "jo", at: [35.4513, 30.3216],
    look: [
      { at: [35.4513, 30.3216], z: 16.6, t: "Notice how the canyon opens suddenly. You reach Petra through the Siq, a narrow gorge, and come out facing the Treasury, carved straight into the rose-red rock by the Nabataeans about 2,000 years ago." },
    ],
    dish: { name: "Falafel", wiki: "Falafel", what: "Crispy fried balls of ground chickpeas, herbs and spices, tucked into warm flatbread with tahini, pickles and tomato. Crunchy outside, green and fluffy inside." },
  },
];

export const TITLES = [
  [0, "Wanderer"], [3, "Traveller"], [7, "Explorer"], [12, "Consul"], [18, "Governor"], [26, "Emperor"], [PLACES.length, "Emperor of the whole Roamin' Empire"],
];
