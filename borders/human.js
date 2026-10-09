// "How we got here": the human family tree and the great journeys of early prehistory.
// Coordinates are [longitude, latitude]. Dates are approximate and given as scientists usually round them.

export const JOURNEYS = {
  outOfAfrica: {
    title: "Out of Africa",
    intro: "Our species evolved in Africa about 300,000 years ago. Around 70,000 to 50,000 years ago, a small group crossed into Arabia and, over tens of thousands of years, their descendants reached every continent except Antarctica.",
    marks: [
      { at: [36, 2], t: "Homo sapiens evolves in Africa", d: "~300,000 years ago", cls: "origin" },
      { at: [-8.9, 31.9], t: "Jebel Irhoud, Morocco: oldest known sapiens fossils", d: "~300,000 years ago", cls: "site" },
      { at: [44, 44], t: "Neanderthals already here", d: "~400,000 to 40,000 years ago", cls: "cousin" },
      { at: [85, 51.4], t: "Denisovans (Denisova Cave, Altai)", d: "lived across Asia", cls: "cousin" },
      { at: [22, -27], t: "Khoisan ancestors stay in southern Africa", d: "a branch over 100,000 years old", cls: "stay" },
    ],
    routes: [
      { name: "Leaving Africa", d: "~70,000 to 50,000 years ago", pts: [[37, 6], [42, 11], [43.5, 12.6], [48, 15], [55, 20], [58, 24]] },
      { name: "Along the coast to India", d: "~60,000 to 50,000 years ago", pts: [[58, 24], [63, 25], [67, 24], [72, 21], [77, 13], [80, 9]] },
      { name: "To Australia", d: "by ~50,000 years ago", side: "right", pts: [[80, 13], [88, 21], [96, 17], [100, 9], [104, 1], [111, -6], [122, -9], [131, -13], [134, -23]] },
      { name: "Into Europe", d: "~45,000 years ago", pts: [[33, 30], [35.5, 33], [36, 37], [29, 40], [22, 43], [14, 46], [3, 47]] },
      { name: "Across Asia", d: "~45,000 to 40,000 years ago", side: "right", pts: [[55, 33], [62, 37], [75, 40], [90, 40], [105, 36], [116, 38], [128, 44]] },
      { name: "Over the Bering land bridge", d: "~20,000 to 15,000 years ago", pts: [[128, 44], [140, 52], [155, 60], [172, 66], [-170, 66], [-158, 63], [-145, 61]] },
      { name: "Down the Americas", d: "Chile by ~14,500 years ago (Monte Verde)", pts: [[-145, 61], [-130, 54], [-122, 45], [-112, 34], [-100, 22], [-88, 15], [-79, 6], [-77, -5], [-74, -20], [-72, -41]] },
    ],
  },
  bantu: {
    title: "The Bantu expansion",
    intro: "From about 3000 to 1000 BC, farming peoples speaking Bantu languages began moving out of the area of today's Nigeria and Cameroon. Over some 3,000 years they spread across central, eastern and southern Africa with crops, cattle and later iron. Most of the 350 million Bantu-language speakers today, from Swahili to Zulu, descend from this movement. The Khoisan, who had lived in the south for far longer, were gradually pushed into drier lands or absorbed.",
    marks: [
      { at: [10, 6], t: "Bantu homeland (Nigeria and Cameroon)", d: "~3000 to 1000 BC", cls: "origin" },
      { at: [17, -29], t: "Khoisan lands shrink", d: "southern Africa", cls: "stay", side: "left" },
    ],
    routes: [
      { name: "West: through the rainforest", d: "~1000 BC to AD 500", pts: [[11, 5], [13, 0], [15, -5], [16, -10], [18, -15], [19, -19]] },
      { name: "East: to the Great Lakes", d: "Great Lakes by ~1000 BC", pts: [[12, 6], [18, 4], [25, 1], [30, -1], [33, -2]] },
      { name: "Down the east coast", d: "South Africa by ~AD 300", pts: [[33, -2], [37, -5], [36, -11], [34, -17], [31, -23], [29, -28]] },
    ],
  },
};

// A simple family tree, drawn as SVG.
export const TREE = `
<svg viewBox="0 0 560 420" class="tree" role="img" aria-label="Human family tree">
  <g class="axis">
    <text x="8" y="44">2 million years ago</text><text x="8" y="134">700,000</text><text x="8" y="224">400,000 to 300,000</text><text x="8" y="404">Today</text>
  </g>
  <path class="trunk" d="M320 60V120M320 150V180M320 180H160V210M320 180V210M320 180H480V210"/>
  <path class="trunk" d="M480 262V380"/>
  <path class="fade" d="M160 262V318"/><path class="fade" d="M320 262V318"/>
  <path class="mix" d="M465 330C420 345 360 345 335 330M465 352C380 380 230 375 175 330"/>
  <g class="node n-er"><rect x="230" y="24" width="180" height="42" rx="12"/><text x="320" y="44">Homo erectus</text><text class="s" x="320" y="58">Africa → first to reach Asia</text></g>
  <g class="node n-he"><rect x="220" y="112" width="200" height="42" rx="12"/><text x="320" y="132">Homo heidelbergensis</text><text class="s" x="320" y="146">Africa &amp; Europe</text></g>
  <g class="node n-ne"><rect x="90" y="210" width="140" height="52" rx="12"/><text x="160" y="232">Neanderthals</text><text class="s" x="160" y="248">Europe, West Asia</text></g>
  <g class="node n-de"><rect x="250" y="210" width="140" height="52" rx="12"/><text x="320" y="232">Denisovans</text><text class="s" x="320" y="248">Asia</text></g>
  <g class="node n-sa"><rect x="410" y="210" width="140" height="52" rx="12"/><text x="480" y="232">Homo sapiens</text><text class="s" x="480" y="248">Africa: us!</text></g>
  <text class="gone" x="160" y="336">gone ~40,000 years ago</text><text class="gone" x="320" y="336">gone</text>
  <text class="mixlbl" x="330" y="372">our ancestors met them and had children</text>
  <g class="node n-us"><rect x="410" y="380" width="140" height="34" rx="12"/><text x="480" y="402">Every human today</text></g>
</svg>`;

export const TREE_NOTES = [
  ["It's a family tree, not a ladder.", "For most of the last 2 million years, several kinds of human lived at the same time, like cousins."],
  ["Homo erectus was the great traveller.", "It walked out of Africa around 1.9 million years ago and reached Java and China, and survived in Java until roughly 110,000 years ago."],
  ["Homo heidelbergensis is the shared grandparent.", "Many scientists think its populations gave rise to Neanderthals in Europe, Denisovans in Asia and us in Africa. (Exactly how is still debated.)"],
  ["We mixed.", "When sapiens left Africa they met Neanderthals and Denisovans. Most people outside Africa carry about 1 to 2% Neanderthal DNA, and many people in Papua New Guinea and Aboriginal Australia carry Denisovan DNA too."],
  ["By 40,000 years ago, we were the last ones left.", "That's why the 10,000 BC map shows only our species: hunter-gatherers everywhere, just as the Ice Age ends and farming is about to begin."],
];
