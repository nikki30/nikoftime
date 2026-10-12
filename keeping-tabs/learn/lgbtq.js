export const TRACK = {
  id: "lgbtq",
  intro: "By the end you’ll know what the letters in LGBTQIA+ mean, how queer rights were won and lost from Stonewall to Section 377, and why the law still looks so different in Delhi, Port of Spain, Taipei and Kampala.",
  topics: [
    { id: "basics", title: "The words", icon: "🔤", blurb: "Sex, gender, orientation, pronouns and what each letter means." },
    { id: "history", title: "A short history", icon: "📜", blurb: "From Berlin and Stonewall to the AIDS crisis and the rainbow flag." },
    { id: "south-asia", title: "India and South Asia", icon: "🪷", blurb: "Hijra traditions, Section 377 and the court cases that changed India." },
    { id: "law", title: "Law around the world", icon: "⚖️", blurb: "Where love is still a crime, where it can marry, and the Caribbean in between." },
    { id: "life", title: "Health, family and culture", icon: "🎭", blurb: "Minority stress, family acceptance, ballroom, film and Indigenous identities." }
  ],
  placement: [
    { q: "What does the “A” in LGBTQIA+ most commonly stand for?", options: ["Ally only", "Asexual (and often aromantic)", "Androgynous", "Activist"], answer: 1, topic: "basics", explain: "The A usually stands for asexual (and often aromantic and agender too). Allies matter, but the letter is about identities." },
    { q: "Which pair is correctly matched?", options: ["Sexual orientation: who you are", "Gender identity: who you are attracted to", "Sex: biological traits like chromosomes and anatomy", "Cisgender: attracted to the same gender"], answer: 2, topic: "basics", explain: "Sex refers to bodily traits. Gender identity is your inner sense of self, orientation is about attraction, and cisgender means your gender matches the sex recorded at birth." },
    { q: "The Stonewall uprising in 1969 took place in which city?", options: ["San Francisco", "London", "Berlin", "New York"], answer: 3, topic: "history", explain: "It began after a police raid on the Stonewall Inn in Greenwich Village, New York, in the early hours of 28 June 1969." },
    { q: "Which was the first country to open civil marriage to same-sex couples?", options: ["The Netherlands", "Denmark", "Canada", "Spain"], answer: 0, topic: "history", explain: "The Netherlands, in April 2001. Denmark had created registered partnerships earlier, in 1989, but not marriage." },
    { q: "In 2018, which Indian Supreme Court judgment decriminalised consensual same-sex relations?", options: ["NALSA v. Union of India", "Navtej Singh Johar v. Union of India", "Koushal v. Naz Foundation", "Puttaswamy v. Union of India"], answer: 1, topic: "south-asia", explain: "Navtej Singh Johar (6 September 2018) read down Section 377. Koushal (2013) had done the opposite, and NALSA (2014) was about transgender rights." },
    { q: "What did the Supreme Court of India decide in the 2023 marriage equality case (Supriyo)?", options: ["It legalised same-sex marriage nationwide", "It declined to recognise same-sex marriage and left it to Parliament", "It recriminalised same-sex relations", "It struck down the Transgender Persons Act"], answer: 1, topic: "south-asia", explain: "In October 2023 the court said it could not create a right to marry under existing law and left the question to Parliament." },
    { q: "Which was the first place in Asia to legalise same-sex marriage?", options: ["Japan", "Thailand", "Taiwan", "India"], answer: 2, topic: "law", explain: "Taiwan, in May 2019, after a 2017 constitutional court ruling. Thailand followed in January 2025." },
    { q: "Why do so many Commonwealth countries share similar anti-sodomy laws?", options: ["They copied each other in the 1990s", "Many inherited them from British colonial penal codes", "A UN treaty required them", "They all date from ancient religious courts"], answer: 1, topic: "law", explain: "British colonial penal codes, including India’s 1860 Code, spread near-identical clauses across Asia, Africa and the Caribbean." },
    { q: "Which Indigenous term, adopted in 1990, describes some Native North American people with both masculine and feminine spirits?", options: ["Two-Spirit", "Fa’afafine", "Hijra", "Kathoey"], answer: 0, topic: "life", explain: "Two-Spirit was adopted at an Indigenous gathering in Winnipeg in 1990. Fa’afafine is Samoan, hijra South Asian and kathoey Thai." },
    { q: "The “minority stress” idea explains higher rates of depression among LGBTQ people mainly by pointing to:", options: ["Something inherent in being LGBTQ", "Genetics alone", "Lack of exercise", "Stigma, discrimination and hiding one’s identity"], answer: 3, topic: "life", explain: "Minority stress research (associated with psychologist Ilan Meyer) links the gap to outside pressures like rejection, prejudice and concealment, not to identity itself." }
  ],
  lessons: [
    {
      id: "the-letters", topic: "basics", level: 1, minutes: 4,
      title: "What the letters mean",
      hook: "LGBTQIA+ looks like alphabet soup, but every letter is a person who once had no word for themselves.",
      body: [
        "L is lesbian: women attracted to women. G is gay: men attracted to men, though many people of any gender use “gay” too. B is bisexual: attracted to more than one gender. These three are about who you’re drawn to.",
        "T is transgender: people whose gender is different from the sex they were assigned at birth. This letter is about who you are, not who you love. A trans woman can be straight, lesbian or bisexual, just like anyone else.",
        "Q is queer, an old insult that many people reclaimed in the 1980s and 1990s as a proud umbrella word. Some use Q for “questioning” too. I is intersex: people born with bodies that don’t fit typical definitions of male or female.",
        "A is usually asexual (little or no sexual attraction) and sometimes aromantic or agender. The plus sign is an honest admission: language keeps growing. You’ll also see LGBT, LGBTQ or LGBTQ+; they point at the same community."
      ],
      points: [
        "L, G, B (and A) describe attraction; T describes gender identity.",
        "Q is queer or questioning; I is intersex, a matter of bodies.",
        "The acronym varies, but it names one broad community."
      ],
      india: "Indian activists often say “LGBTQIA+” alongside local words like hijra, kothi and thirunangai, which don’t map neatly onto Western letters.",
      world: "Thailand has its own everyday words, such as kathoey for trans women and “tom” and “dee” for lesbian couples.",
      quiz: [
        { q: "Which letter is about gender identity rather than attraction?", options: ["L", "B", "T"], answer: 2, explain: "T (transgender) describes who someone is. L, G and B describe who someone is attracted to." },
        { q: "What does the I in LGBTQIA+ stand for?", options: ["Intersex", "Identity", "Inclusive", "Independent"], answer: 0, explain: "Intersex: people born with variations in sex characteristics such as chromosomes, hormones or anatomy." }
      ],
      think: "Which of these words did you first hear as an insult, and which as a description? What changed?",
      deeper: [ { t: "LGBTQ (Wikipedia)", url: "https://en.wikipedia.org/wiki/LGBTQ" } ]
    },
    {
      id: "sex-gender-orientation", topic: "basics", level: 1, minutes: 5,
      title: "Sex, gender and orientation: three different dials",
      hook: "Your body, your sense of self and who you fall for are three separate questions.",
      body: [
        "Think of three dials. The first is sex: bodily traits like chromosomes, hormones and anatomy. A doctor usually records it at birth, which is why people say “assigned male at birth” or “assigned female at birth”.",
        "The second is gender identity: your inner sense of being a woman, a man, both, neither or something else. Gender expression is how you show it, through clothes, hair, voice and manner. Expression and identity don’t always match, and that’s fine.",
        "The third is sexual orientation: who you’re attracted to. It is separate from the other two. Knowing someone is trans tells you nothing about who they love.",
        "Cisgender (or cis) means your gender identity matches the sex you were assigned at birth. It comes from Latin “cis”, meaning “on this side of”, the opposite of “trans”, meaning “across”. It isn’t an insult; it’s just a name for the majority."
      ],
      points: [
        "Sex, gender identity and orientation are separate things.",
        "Gender expression (how you look and act) is different again.",
        "Cisgender simply means not transgender."
      ],
      india: "In 2014 India’s Supreme Court said in the NALSA judgment that gender identity is a matter of self, not of medical tests, a striking statement for its time.",
      quiz: [
        { q: "A trans woman who is attracted to women is best described as:", options: ["Gay man", "A woman who is lesbian or queer", "Cisgender"], answer: 1, explain: "Her gender is woman; her orientation is toward women, so lesbian or queer fits, depending on what she prefers." },
        { q: "What does “cis” mean in Latin?", options: ["Across", "Against", "On this side of"], answer: 2, explain: "Cis means “on this side of”, the counterpart to trans, “across”." }
      ],
      think: "Which of the three dials have you never had to think about? What does that tell you about the people who do?",
      deeper: [
        { t: "Gender identity (Wikipedia)", url: "https://en.wikipedia.org/wiki/Gender_identity" },
        { t: "Sexual orientation (Wikipedia)", url: "https://en.wikipedia.org/wiki/Sexual_orientation" }
      ]
    },
    {
      id: "nonbinary-intersex-ace", topic: "basics", level: 2, minutes: 5,
      title: "Beyond two boxes: non-binary, intersex and asexual",
      hook: "Some people are neither only men nor only women, and some bodies were never only one or the other.",
      body: [
        "Non-binary people don’t identify only as a man or only as a woman. Some feel like both, some neither, some move between. Many use “they/them” pronouns, though not all do. Genderqueer and genderfluid are related words.",
        "Intersex is about bodies, not identity. Intersex people are born with variations in chromosomes, hormones or anatomy. Estimates of how common this is vary a lot depending on which conditions are counted. A long-running concern is surgery on intersex babies before they can consent.",
        "Asexual (“ace”) people feel little or no sexual attraction. Aromantic (“aro”) people feel little or no romantic attraction. These are spectrums: some people are grey-asexual, or only feel attraction after a deep emotional bond (demisexual).",
        "None of these is new. What is new is having shared words, which help people find each other and ask doctors, employers and governments for fair treatment."
      ],
      points: [
        "Non-binary means not exclusively man or woman.",
        "Intersex is about physical sex traits, and is separate from being trans.",
        "Asexual and aromantic are about attraction, and come in shades."
      ],
      world: "Germany added a third option, “divers”, to birth registration in 2018 after its constitutional court ruled on a case brought by an intersex person.",
      quiz: [
        { q: "Intersex refers to:", options: ["A gender identity", "Variations in physical sex characteristics", "A sexual orientation"], answer: 1, explain: "Intersex describes bodies: chromosomes, hormones or anatomy that don’t fit typical male or female categories." },
        { q: "Someone who feels romantic love but little sexual attraction might call themselves:", options: ["Asexual", "Aromantic", "Pansexual", "Genderfluid"], answer: 0, explain: "Asexual is about sexual attraction. Aromantic would mean little romantic attraction." }
      ],
      think: "If you had to describe your gender without using the words “man” or “woman”, what would you say?",
      deeper: [
        { t: "Non-binary gender (Wikipedia)", url: "https://en.wikipedia.org/wiki/Non-binary_gender" },
        { t: "Intersex (Wikipedia)", url: "https://en.wikipedia.org/wiki/Intersex" },
        { t: "Asexuality (Wikipedia)", url: "https://en.wikipedia.org/wiki/Asexuality" }
      ]
    },
    {
      id: "pronouns-coming-out-allyship", topic: "basics", level: 2, minutes: 4,
      title: "Pronouns, coming out and being an ally",
      hook: "Coming out isn’t one moment. For most people it’s a decision they make again with every new colleague.",
      body: [
        "Pronouns are the words we use instead of a name: she, he, they. Using the ones someone asks for is basic courtesy, like pronouncing their name properly. Singular “they” is old English; writers have used it for centuries.",
        "Coming out means telling others you are LGBTQ. It’s rarely a single announcement. People come out to friends, then family, then at work, and re-decide at each new job. Being “outed” (having someone else reveal it) can be dangerous where laws or families are hostile.",
        "An ally is a person, often straight or cis, who supports LGBTQ people. Good allyship is mostly quiet and practical: correcting a misgendering, not repeating someone’s private news, making sure a policy covers same-sex partners.",
        "At work, small things matter. Inclusive health insurance, gender-neutral toilets, and leaders who don’t laugh at the joke all signal whether it’s safe to be yourself."
      ],
      points: [
        "Use the pronouns and names people ask for.",
        "Coming out is repeated, personal and never owed to anyone.",
        "Allyship is shown in everyday actions more than in slogans."
      ],
      india: "Several Indian companies now extend health insurance to same-sex partners voluntarily, since the law does not recognise these relationships as marriages (as of 2025).",
      quiz: [
        { q: "Being “outed” means:", options: ["Choosing to come out publicly", "Having someone else reveal your identity without consent", "Leaving the LGBTQ community"], answer: 1, explain: "Outing is when someone else discloses it, which takes the choice away and can put people at risk." },
        { q: "Which is an example of practical allyship at work?", options: ["Posting a rainbow logo once a year", "Asking a colleague to prove they are trans", "Checking that the parental leave policy covers same-sex couples", "Telling the team about a colleague’s partner"], answer: 2, explain: "Fixing a policy changes real lives. Sharing someone’s private life without permission does harm." }
      ],
      think: "As you grow toward staff engineer, what is one policy or habit in your team you could quietly make more inclusive?",
      deeper: [ { t: "Coming out (Wikipedia)", url: "https://en.wikipedia.org/wiki/Coming_out" } ]
    },
    {
      id: "before-stonewall", topic: "history", level: 1, minutes: 5,
      title: "Stonewall and the first Pride",
      hook: "Pride began as a riot against a police raid, and the first marches were an anniversary of that night.",
      body: [
        "In the early hours of 28 June 1969, New York police raided the Stonewall Inn, a gay bar in Greenwich Village. Raids were routine. This time the crowd fought back, and protests went on for several nights.",
        "The people at the front included drag queens, trans women of colour, butch lesbians and street kids. Marsha P. Johnson and Sylvia Rivera became symbols of that night, though exactly who did what remains debated by historians.",
        "Stonewall was not the first protest. Activists had picketed in the 1960s, and there was a riot at Compton’s Cafeteria in San Francisco in 1966. But Stonewall lit a fuse.",
        "On 28 June 1970, the first anniversary, thousands marched in New York in the Christopher Street Liberation Day march. Chicago, Los Angeles and San Francisco held events too. That is why Pride month is June."
      ],
      points: [
        "Stonewall began with a police raid on 28 June 1969.",
        "Trans women and drag queens of colour were central to it.",
        "The first Pride marches in 1970 marked its anniversary."
      ],
      india: "India’s first Pride walk is usually dated to Kolkata in July 1999, when a small group walked in what they called a Friendship Walk.",
      quiz: [
        { q: "Why is Pride month held in June?", options: ["It’s the start of summer", "It marks the Stonewall uprising of June 1969", "A UN resolution chose it"], answer: 1, explain: "The first marches in June 1970 commemorated Stonewall, and the date stuck." },
        { q: "Which earlier protest is often cited as a forerunner of Stonewall?", options: ["The Compton’s Cafeteria riot, San Francisco, 1966", "The Salt March, 1930", "The Paris Commune, 1871"], answer: 0, explain: "The 1966 Compton’s Cafeteria riot, led largely by trans women, came three years before Stonewall." }
      ],
      think: "Why do you think the people with the least to lose were the first to fight back?",
      deeper: [
        { t: "Stonewall riots (Wikipedia)", url: "https://en.wikipedia.org/wiki/Stonewall_riots" },
        { t: "Pride parade (Wikipedia)", url: "https://en.wikipedia.org/wiki/Pride_parade" }
      ]
    },
    {
      id: "aids-act-up", topic: "history", level: 2, minutes: 5,
      title: "The AIDS crisis and ACT UP",
      hook: "In the 1980s a generation of gay men watched friends die while governments barely spoke the word AIDS.",
      body: [
        "In June 1981 the US Centers for Disease Control reported rare pneumonia in five young gay men in Los Angeles. It was the first official report of what became known as AIDS, caused by the virus HIV.",
        "Fear and stigma spread faster than facts. Some called it a “gay plague”. Patients lost jobs and homes; some hospitals refused to treat them. Many gay communities built their own care networks.",
        "In 1987 activists in New York founded ACT UP (AIDS Coalition to Unleash Power). They staged sit-ins at drug regulators and pharmaceutical firms and pushed to speed up drug trials and cut prices. Their slogan was “Silence = Death”.",
        "In 1996 combination antiretroviral therapy arrived and HIV became, for those with access, a manageable condition. Today people on effective treatment cannot pass HIV on through sex, a finding summed up as “U=U” (undetectable equals untransmittable)."
      ],
      points: [
        "AIDS was first reported in 1981 and hit gay men hard.",
        "ACT UP (1987) changed how drugs are tested and priced.",
        "Treatment since 1996 has made HIV manageable for those with access."
      ],
      world: "South Africa’s Treatment Action Campaign, founded in 1998, fought the government and drug firms for affordable HIV medicine, and Indian generic drug makers helped bring prices down sharply in the early 2000s.",
      quiz: [
        { q: "What does “U=U” mean?", options: ["Universal treatment equals universal health", "Undetectable equals untransmittable", "United we stand"], answer: 1, explain: "A person whose HIV is suppressed to undetectable levels by treatment does not transmit it sexually." },
        { q: "When was ACT UP founded?", options: ["1969", "1981", "1987", "1996"], answer: 2, explain: "ACT UP was founded in New York in 1987." }
      ],
      think: "What does the AIDS crisis teach about what happens when a group is not seen as worth saving?",
      deeper: [
        { t: "ACT UP (Wikipedia)", url: "https://en.wikipedia.org/wiki/ACT_UP" },
        { t: "HIV/AIDS (Wikipedia)", url: "https://en.wikipedia.org/wiki/HIV/AIDS" }
      ]
    },
    {
      id: "berlin-to-amsterdam", topic: "history", level: 3, minutes: 6,
      title: "From Berlin’s lost institute to the first weddings",
      hook: "The world’s first institute studying sexuality opened in Berlin in 1919. The Nazis looted it 14 years later.",
      body: [
        "Magnus Hirschfeld, a German Jewish doctor, founded the Institute for Sexual Science in Berlin in 1919. It researched sexuality and gender, counselled people, and helped some of the earliest gender-affirming surgeries. In May 1933 Nazi students raided it and burned its library.",
        "Under the Nazis, thousands of gay men were sent to concentration camps and marked with a pink triangle. After the war, many survivors were not recognised as victims, and West Germany kept the harsh law for decades.",
        "Change came in waves. England and Wales partly decriminalised sex between men in 1967. In 1973 the American Psychiatric Association stopped classing homosexuality as a mental illness; the World Health Organization followed on 17 May 1990, now marked as IDAHOBIT.",
        "Denmark created registered partnerships in 1989. Then on 1 April 2001 the Netherlands opened full civil marriage to same-sex couples, a world first. Meanwhile Gilbert Baker’s rainbow flag, first flown in San Francisco in 1978, had become a global symbol."
      ],
      points: [
        "Hirschfeld’s Berlin institute (1919) was destroyed by the Nazis in 1933.",
        "Medicine stopped calling homosexuality a disorder in 1973 (US) and 1990 (WHO).",
        "The Netherlands held the world’s first same-sex weddings in 2001."
      ],
      india: "Hirschfeld visited India on a world lecture tour in the early 1930s, a reminder that these debates were global even then.",
      world: "The rainbow flag first flew on 25 June 1978 in San Francisco. The 2018 Progress Pride version adds black, brown, pink, light blue and white stripes for people of colour and trans people.",
      quiz: [
        { q: "What is marked on 17 May each year?", options: ["The first Pride march", "The day WHO removed homosexuality from its list of disorders (IDAHOBIT)", "The Stonewall raid"], answer: 1, explain: "On 17 May 1990 the WHO removed homosexuality from its disease classification. The day is now the International Day Against Homophobia, Biphobia and Transphobia." },
        { q: "Who designed the original rainbow Pride flag?", options: ["Harvey Milk", "Gilbert Baker", "Magnus Hirschfeld", "Daniel Quasar"], answer: 1, explain: "Gilbert Baker designed it in 1978. Daniel Quasar created the Progress Pride version in 2018." }
      ],
      think: "Progress can be destroyed, as in Berlin in 1933. What makes rights stick?",
      deeper: [
        { t: "Magnus Hirschfeld (Wikipedia)", url: "https://en.wikipedia.org/wiki/Magnus_Hirschfeld" },
        { t: "Gilbert Baker (Wikipedia)", url: "https://en.wikipedia.org/wiki/Gilbert_Baker" }
      ]
    },
    {
      id: "hijra-and-thirunangai", topic: "south-asia", level: 1, minutes: 5,
      title: "Hijra, kothi and thirunangai: older than the acronym",
      hook: "South Asia had recognised gender-variant communities for centuries before anyone said “transgender”.",
      body: [
        "Hijras are a community of trans women and intersex and gender-variant people across India, Pakistan, Bangladesh and Nepal. Many live in households led by a guru, with chelas (disciples), and keep traditions of blessing weddings and births.",
        "Hijras appear in Hindu epics and served in Mughal courts. Under British rule, the Criminal Tribes Act of 1871 labelled “eunuchs” as criminal by birth in some provinces, deepening stigma that lasted long after independence.",
        "In Tamil Nadu, trans women are called aravani or, more respectfully, thirunangai (trans men: thirunambi). Each year at the Koovagam festival near Villupuram, thousands gather to re-enact the story of Aravan, who married Krishna in female form (Mohini) before his sacrifice.",
        "Kothi is a word used in parts of India for feminine men who are often attracted to men. These local terms are their own categories, not translations of Western ones."
      ],
      points: [
        "Hijra communities have long histories and their own structures.",
        "Colonial law (1871) branded them criminal, a stigma that lingers.",
        "Tamil words thirunangai and thirunambi are respectful terms for trans women and men."
      ],
      india: "Tamil Nadu set up a Transgender (Aravanigal) Welfare Board in 2008, one of the first states to do so.",
      world: "Bangladesh officially recognised hijras as a third gender in 2013.",
      quiz: [
        { q: "What does thirunangai mean?", options: ["A Tamil term for trans women", "A Hindi word for priest", "A festival in Kerala"], answer: 0, explain: "Thirunangai is a respectful Tamil term for trans women; thirunambi is for trans men." },
        { q: "Which colonial law branded “eunuchs” as criminal in parts of British India?", options: ["Indian Penal Code, 1860", "Criminal Tribes Act, 1871", "Government of India Act, 1935"], answer: 1, explain: "The Criminal Tribes Act of 1871 targeted hijras, among other communities." }
      ],
      think: "What do local words like thirunangai capture that an imported acronym might miss?",
      deeper: [
        { t: "Hijra (South Asia) (Wikipedia)", url: "https://en.wikipedia.org/wiki/Hijra_(South_Asia)" },
        { t: "Koovagam (Wikipedia)", url: "https://en.wikipedia.org/wiki/Koovagam" }
      ]
    },
    {
      id: "section-377", topic: "south-asia", level: 2, minutes: 6,
      title: "Section 377: 158 years and a long court fight",
      hook: "A law written by British officials in 1860 was struck down by India’s Supreme Court in 2018, after it had flip-flopped once.",
      body: [
        "Section 377 of the Indian Penal Code, enacted in 1860 under British rule, punished “carnal intercourse against the order of nature” with up to life imprisonment. It was used to harass, blackmail and arrest gay men and trans people.",
        "In 2009 the Delhi High Court, in a case brought by the Naz Foundation, an HIV charity, ruled that criminalising consensual adult sex violated the Constitution. For four years, India felt different.",
        "Then in December 2013, in Suresh Kumar Koushal v. Naz Foundation, the Supreme Court reversed it. It said only a “minuscule fraction” of people were affected and left change to Parliament.",
        "On 6 September 2018, five judges ruled unanimously in Navtej Singh Johar v. Union of India that Section 377 could not apply to consensual adults. Justice Indu Malhotra wrote that history owed LGBT people an apology. Lawyers Menaka Guruswamy and Arundhati Katju were among those who argued the case."
      ],
      points: [
        "Section 377 dates from the colonial Penal Code of 1860.",
        "Delhi High Court struck it down in 2009; the Supreme Court restored it in 2013.",
        "Navtej Singh Johar (2018) decriminalised consensual same-sex relations."
      ],
      india: "In 2024 India replaced the Penal Code with the Bharatiya Nyaya Sanhita, which has no equivalent of Section 377. Critics noted this left a gap for prosecuting non-consensual sex against men.",
      world: "Section 377’s wording was copied into penal codes across British colonies, from Singapore and Malaysia to parts of East Africa.",
      quiz: [
        { q: "Which ruling restored Section 377 in 2013?", options: ["Naz Foundation", "Suresh Kumar Koushal", "Navtej Singh Johar"], answer: 1, explain: "Koushal (2013) overturned the 2009 Delhi High Court ruling." },
        { q: "How many judges decided Navtej Singh Johar, and how?", options: ["Five, unanimously", "Three, by 2 to 1", "Nine, by 5 to 4"], answer: 0, explain: "A five-judge Constitution Bench ruled unanimously in 2018." }
      ],
      think: "The 2013 court called LGBT Indians a “minuscule fraction”. Should rights depend on how many people need them?",
      deeper: [
        { t: "Section 377 of the Indian Penal Code (Wikipedia)", url: "https://en.wikipedia.org/wiki/Section_377_of_the_Indian_Penal_Code" },
        { t: "Navtej Singh Johar v. Union of India (Wikipedia)", url: "https://en.wikipedia.org/wiki/Navtej_Singh_Johar_v._Union_of_India" }
      ]
    },
    {
      id: "nalsa-and-trans-act", topic: "south-asia", level: 2, minutes: 5,
      title: "NALSA, the third gender and the 2019 Act",
      hook: "India’s Supreme Court recognised a third gender in 2014, four years before it decriminalised gay sex.",
      body: [
        "In April 2014, in National Legal Services Authority (NALSA) v. Union of India, the Supreme Court recognised transgender people as a “third gender” with fundamental rights. It said people could self-identify their gender without surgery, and told governments to provide reservations in education and jobs.",
        "Hijra activist Laxmi Narayan Tripathi was one of the petitioners. The ruling was hailed worldwide as one of the most progressive of its time.",
        "Parliament then passed the Transgender Persons (Protection of Rights) Act, 2019. It bans discrimination in education, jobs and healthcare. But many trans groups opposed it.",
        "Their criticisms: a trans person must get a certificate from a district magistrate, which they say undercuts self-identification; changing to “male” or “female” requires proof of surgery; it set lower penalties for sexual abuse of trans people than for comparable offences against women; and it did not include the reservations NALSA had asked for."
      ],
      points: [
        "NALSA (2014) recognised a third gender and self-identification.",
        "The 2019 Act bans discrimination but requires official certification.",
        "Trans activists say the Act falls short of NALSA in key ways."
      ],
      india: "Kerala announced a state transgender policy in 2015, among the first in India, and states differ widely in how well they implement trans welfare schemes.",
      world: "Pakistan passed its own Transgender Persons Act in 2018 allowing self-identification. In 2023 its Federal Shariat Court struck down key parts; appeals were pending as of 2025.",
      quiz: [
        { q: "What did NALSA (2014) say about gender identity?", options: ["It must be proven with surgery", "People can self-identify their gender", "Only two genders exist in law"], answer: 1, explain: "NALSA affirmed self-identification as part of personal autonomy." },
        { q: "Which is a common criticism of the 2019 Act?", options: ["It recriminalised same-sex relations", "It requires a certificate from a district magistrate", "It applies only in Tamil Nadu"], answer: 1, explain: "Activists argue the certification process contradicts the self-identification principle of NALSA." }
      ],
      think: "Why might a community prefer no law at all to a law that recognises them on someone else’s terms?",
      deeper: [
        { t: "NALSA v. Union of India (Wikipedia)", url: "https://en.wikipedia.org/wiki/National_Legal_Services_Authority_v._Union_of_India" },
        { t: "Transgender Persons (Protection of Rights) Act, 2019 (Wikipedia)", url: "https://en.wikipedia.org/wiki/Transgender_Persons_(Protection_of_Rights)_Act,_2019" }
      ]
    },
    {
      id: "marriage-in-south-asia", topic: "south-asia", level: 3, minutes: 5,
      title: "Marriage: Delhi says wait, Kathmandu moves",
      hook: "In October 2023 India’s Supreme Court said no to same-sex marriage, weeks before Nepal registered its first one.",
      body: [
        "In Supriyo Chakraborty v. Union of India, decided on 17 October 2023, a five-judge bench heard petitions from same-sex couples asking to marry under the Special Marriage Act.",
        "All five judges agreed the court could not rewrite marriage law; that was Parliament’s job. By 3 to 2, they also declined to recognise civil unions. The minority, including Chief Justice D.Y. Chandrachud, would have recognised a right to form a union.",
        "The court did say queer couples should not face discrimination, and the government agreed to form a committee to look at practical rights, such as joint bank accounts and hospital decisions. Progress on that has been slow (as of 2025).",
        "Nepal went further. Its Supreme Court recognised a third gender in 2007 in the Sunil Babu Pant case, and its 2015 constitution mentions sexual and gender minorities. After a 2023 Supreme Court interim order, a same-sex couple registered their marriage in November 2023, widely reported as South Asia’s first."
      ],
      points: [
        "India’s Supreme Court (2023) left same-sex marriage to Parliament.",
        "A 3 to 2 majority also declined to recognise civil unions.",
        "Nepal registered a same-sex marriage in 2023 under an interim court order."
      ],
      world: "Sri Lanka still had colonial-era clauses criminalising same-sex relations as of 2025, although bills to repeal them have been debated.",
      quiz: [
        { q: "What did all five judges agree on in Supriyo (2023)?", options: ["Same-sex marriage is legal", "Changing marriage law is for Parliament", "Section 377 should return"], answer: 1, explain: "The bench was unanimous that the court could not itself create a right to marry under existing statutes." },
        { q: "Which South Asian country recognised a third gender through its Supreme Court in 2007?", options: ["Nepal", "Bangladesh", "Sri Lanka"], answer: 0, explain: "Nepal’s Supreme Court did so in the Sunil Babu Pant case in 2007." }
      ],
      think: "Is it better for rights to come from courts, which can move fast, or parliaments, which carry more democratic weight?",
      deeper: [
        { t: "LGBTQ rights in India (Wikipedia)", url: "https://en.wikipedia.org/wiki/LGBT_rights_in_India" },
        { t: "LGBTQ rights in Nepal (Wikipedia)", url: "https://en.wikipedia.org/wiki/LGBT_rights_in_Nepal" }
      ]
    },
    {
      id: "map-of-the-law", topic: "law", level: 1, minutes: 5,
      title: "A map of the law: crime in some places, marriage in others",
      hook: "In 2025 a gay couple could marry in Bangkok but face prison a few hours’ flight away.",
      body: [
        "Around 60-plus countries still criminalise consensual same-sex relations, according to groups like the Human Dignity Trust and ILGA World (numbers shift as courts and parliaments act). A handful allow the death penalty in law.",
        "A large share of these laws are colonial inheritances. Britain spread anti-sodomy clauses through its penal codes across South Asia, Africa, the Caribbean and the Pacific.",
        "At the other end, close to 40 countries allowed same-sex marriage as of 2025, mostly in Europe and the Americas. Taiwan became the first in Asia in May 2019, after its constitutional court gave the legislature two years to act.",
        "Thailand’s marriage equality law took effect on 23 January 2025, the first in Southeast Asia. Many couples married on the very first day."
      ],
      points: [
        "Roughly 60-plus countries still criminalise same-sex relations.",
        "Many of those laws were inherited from British colonial codes.",
        "Taiwan (2019) and Thailand (2025) lead Asia on marriage equality."
      ],
      india: "India sits in the middle: decriminalised since 2018, but with no legal recognition of same-sex couples as of 2025.",
      world: "In Africa, Botswana’s High Court decriminalised same-sex relations in 2019, and its Court of Appeal upheld that in 2021.",
      quiz: [
        { q: "Which was the first country in Southeast Asia to legalise same-sex marriage?", options: ["Vietnam", "Philippines", "Thailand"], answer: 2, explain: "Thailand, whose law took effect in January 2025." },
        { q: "Why do many former British colonies share anti-sodomy laws?", options: ["Colonial penal codes spread them", "They signed a treaty together", "Independence constitutions required them"], answer: 0, explain: "British-drafted codes, like India’s 1860 Code, were copied across the empire." }
      ],
      think: "If a law was imposed by a colonial power, who gets to decide whether it is now “traditional”?",
      deeper: [
        { t: "Same-sex marriage (Wikipedia)", url: "https://en.wikipedia.org/wiki/Same-sex_marriage" },
        { t: "Sodomy law (Wikipedia)", url: "https://en.wikipedia.org/wiki/Sodomy_law" },
        { t: "Human Dignity Trust", url: "https://www.humandignitytrust.org/" }
      ]
    },
    {
      id: "caribbean-courts", topic: "law", level: 2, minutes: 6,
      title: "The Caribbean’s courtroom wave",
      hook: "Since 2016, one Caribbean court after another has struck down buggery laws, and Trinidad’s fight is still not over.",
      body: [
        "In 2016 Belize’s Supreme Court ruled in favour of activist Caleb Orozco that the country’s anti-sodomy law was unconstitutional. It was the first such win in the English-speaking Caribbean, and Belize’s Court of Appeal largely upheld it in 2019.",
        "In Trinidad and Tobago, Jason Jones, a Trinidadian-born activist, challenged the Sexual Offences Act. In April 2018 the High Court agreed that the sections criminalising gay sex were unconstitutional. Celebrations followed in Port of Spain.",
        "The government appealed. In 2025 the Court of Appeal overturned the 2018 ruling, relying on a “savings clause” that shields laws older than the constitution. As of 2025 the matter was expected to go to the Privy Council in London, so the legal position is contested.",
        "Elsewhere the wave continued: Antigua and Barbuda and St Kitts and Nevis in 2022, Barbados in December 2022, Dominica in 2024. Jamaica and Guyana still had such laws as of 2025."
      ],
      points: [
        "Belize (2016) was the first English-speaking Caribbean country to lose its buggery law in court.",
        "Trinidad’s 2018 win was overturned on appeal in 2025 and remains contested.",
        "Antigua, St Kitts, Barbados and Dominica followed between 2022 and 2024."
      ],
      india: "Like Section 377, Caribbean buggery laws came from British colonial law, and Indian judgments such as Navtej have been cited in Caribbean courts.",
      quiz: [
        { q: "Whose case led to Belize’s 2016 ruling?", options: ["Jason Jones", "Caleb Orozco", "Audre Lorde"], answer: 1, explain: "Caleb Orozco brought the Belize case." },
        { q: "What is a “savings clause” in Caribbean constitutions?", options: ["A rule about national budgets", "A clause shielding laws that existed before independence from challenge", "A clause protecting religious freedom only"], answer: 1, explain: "Savings clauses protect pre-independence laws, which makes colonial-era laws harder to strike down." }
      ],
      think: "If a court win can be reversed years later, what else do activists need besides a judgment?",
      deeper: [
        { t: "LGBTQ rights in Trinidad and Tobago (Wikipedia)", url: "https://en.wikipedia.org/wiki/LGBT_rights_in_Trinidad_and_Tobago" },
        { t: "LGBTQ rights in Belize (Wikipedia)", url: "https://en.wikipedia.org/wiki/LGBT_rights_in_Belize" }
      ]
    },
    {
      id: "uganda-and-backlash", topic: "law", level: 3, minutes: 5,
      title: "Backlash: Uganda’s 2023 law and the global split",
      hook: "While some countries were writing marriage laws, Uganda wrote one with the death penalty.",
      body: [
        "In May 2023 Uganda’s President Yoweri Museveni signed the Anti-Homosexuality Act. It kept life imprisonment for same-sex relations and allowed the death penalty for “aggravated homosexuality”, which covers certain repeat or other specified cases.",
        "It also criminalised “promotion” of homosexuality, which rights groups said could reach journalists, landlords and health workers. Reports of evictions, attacks and arrests followed.",
        "In August 2023 the World Bank paused new public financing to Uganda, and the United States imposed some visa restrictions. In April 2024 Uganda’s Constitutional Court upheld most of the law, striking down a few sections.",
        "Supporters framed it as protecting African culture and families. Critics, including many African activists, point out that the anti-sodomy laws themselves were colonial imports, and that some campaigns behind the law were linked to foreign religious groups."
      ],
      points: [
        "Uganda’s 2023 law includes the death penalty for “aggravated” cases.",
        "Its Constitutional Court upheld most of it in 2024.",
        "The debate over “cultural tradition” cuts both ways."
      ],
      world: "Ghana’s parliament passed a strict anti-LGBTQ bill in 2024, but it was not signed into law at that time; its status remained in dispute in later years.",
      quiz: [
        { q: "What did the World Bank do in August 2023?", options: ["Paused new public financing to Uganda", "Doubled loans to Uganda", "Opened an office in Kampala"], answer: 0, explain: "It paused new funding, saying the law contradicted its values." },
        { q: "What did Uganda’s Constitutional Court do in April 2024?", options: ["Struck down the whole law", "Upheld most of it", "Referred it to the African Union"], answer: 1, explain: "It upheld most of the Act, removing a few sections." }
      ],
      think: "When outside powers cut aid to protest a law, does that help the people it targets, or risk a backlash against them?",
      deeper: [ { t: "Anti-Homosexuality Act, 2023 (Wikipedia)", url: "https://en.wikipedia.org/wiki/Anti-Homosexuality_Act,_2023" } ]
    },
    {
      id: "minority-stress", topic: "life", level: 1, minutes: 5,
      title: "Minority stress and mental health",
      hook: "LGBTQ people report more depression and anxiety, and the research points at the world around them, not at who they are.",
      body: [
        "Many studies find higher rates of depression, anxiety and suicidal thoughts among LGBTQ people, especially young people and trans people.",
        "The “minority stress” model, developed by psychologist Ilan Meyer in the early 2000s, explains why. Outside stress (rejection, harassment, discrimination) adds to inner stress (hiding who you are, expecting rejection, absorbing shame).",
        "The good news is that the same research shows what helps. Supportive families, accepting schools, friends who know, and legal protections are all linked to better mental health.",
        "This matters at work too. Constantly editing your weekend stories to hide a partner is tiring. Teams where people can be open often get more of their energy and honesty."
      ],
      points: [
        "Higher rates of distress are linked to stigma, not identity.",
        "Hiding who you are is itself a source of stress.",
        "Acceptance from family, friends and law protects mental health."
      ],
      india: "India’s Mental Healthcare Act 2017 bars discrimination on the basis of sexual orientation in mental healthcare, one of the first Indian laws to mention it.",
      quiz: [
        { q: "In the minority stress model, which is an “internal” stressor?", options: ["Being refused a job", "Concealing one’s identity", "A police raid"], answer: 1, explain: "Concealment and internalised shame are internal; discrimination and violence are external." },
        { q: "Which factor is linked to better mental health in LGBTQ youth?", options: ["Family acceptance", "Keeping identity secret from everyone", "Avoiding friends"], answer: 0, explain: "Research consistently links family and social acceptance to better outcomes." }
      ],
      think: "What small signal at work tells someone it’s safe to mention their partner?",
      deeper: [ { t: "Minority stress (Wikipedia)", url: "https://en.wikipedia.org/wiki/Minority_stress" } ]
    },
    {
      id: "conversion-therapy-and-family", topic: "life", level: 2, minutes: 5,
      title: "Conversion therapy and family acceptance",
      hook: "In 2021 a Madras High Court judge said he would first educate himself before ruling on a lesbian couple’s case, and then he did.",
      body: [
        "“Conversion therapy” means attempts to change someone’s sexual orientation or gender identity, through counselling, religious rituals, drugs or worse. Major medical bodies say it doesn’t work and causes harm.",
        "Countries have begun to ban it. Malta passed the first national ban in Europe in 2016. Canada made it a crime in 2022. Others, including Germany, France and New Zealand, have restrictions of their own.",
        "In India, a lesbian couple in Tamil Nadu went to the Madras High Court in 2021 for protection from their families. Justice N. Anand Venkatesh attended counselling to understand their lives, then issued guidelines and called for an end to conversion therapy. In 2022 the National Medical Commission said doctors offering it would be guilty of professional misconduct.",
        "Family is often where the hardest part happens. Many LGBTQ Indians face pressure to marry. Parent support groups, such as Sweekar in India, help families move from fear to acceptance."
      ],
      points: [
        "Conversion therapy is discredited and harmful.",
        "Malta (2016) and Canada (2022) are among countries that ban it.",
        "India’s medical regulator treated it as misconduct from 2022."
      ],
      india: "The Madras High Court case (S. Sushma v. Commissioner of Police, 2021) is a Tamil Nadu story often cited across India.",
      quiz: [
        { q: "Which country passed Europe’s first national conversion therapy ban in 2016?", options: ["Germany", "Malta", "Ireland"], answer: 1, explain: "Malta was first in Europe, in 2016." },
        { q: "Which Indian court’s 2021 ruling called for an end to conversion therapy?", options: ["Delhi High Court", "Bombay High Court", "Madras High Court"], answer: 2, explain: "Justice Anand Venkatesh of the Madras High Court." }
      ],
      think: "What would help a parent you know move from worry to acceptance?",
      deeper: [ { t: "Conversion therapy (Wikipedia)", url: "https://en.wikipedia.org/wiki/Conversion_therapy" } ]
    },
    {
      id: "ballroom-film-and-indigenous", topic: "life", level: 3, minutes: 6,
      title: "Ballroom, film and identities beyond the West",
      hook: "Voguing began in Harlem ballrooms, decades before Madonna made it a hit.",
      body: [
        "Ballroom culture grew among Black and Latino queer and trans people in Harlem. People formed “houses” led by “mothers”, chosen families for those rejected by their own. At balls they competed in categories, walking and voguing for trophies. The 1990 documentary Paris Is Burning brought it to wider audiences.",
        "South Asian art has its own queer story. Ismat Chughtai’s short story Lihaaf (1942) led to an obscenity trial. Deepa Mehta’s film Fire (1996) sparked attacks on cinemas. Aligarh (2016) told of a professor suspended after being filmed with a man. In Tamil, Super Deluxe (2019) featured Vijay Sethupathi as a trans woman.",
        "Many cultures have long recognised more than two genders. In North America, “Two-Spirit” was adopted in 1990 at an Indigenous gathering in Winnipeg as a pan-Indigenous term. In Samoa, fa’afafine are people assigned male at birth who live in a feminine gender role and are a recognised part of society.",
        "These traditions remind us that rigid two-box thinking is not universal. Colonial law and missionaries often worked to suppress them."
      ],
      points: [
        "Ballroom houses gave chosen families to rejected queer youth.",
        "South Asian books and films have long explored queer lives, often amid controversy.",
        "Two-Spirit and fa’afafine show gender diversity in many cultures."
      ],
      world: "Sri Lankan-Canadian writer Shyam Selvadurai’s novel Funny Boy (1994) follows a Tamil boy in Colombo coming to terms with his sexuality amid ethnic violence.",
      quiz: [
        { q: "In ballroom culture, a “house” is:", options: ["A nightclub", "A chosen family led by a mother", "A dance move"], answer: 1, explain: "Houses are chosen families that compete together and support each other." },
        { q: "Which 1996 film by Deepa Mehta sparked protests in India?", options: ["Fire", "Aligarh", "Super Deluxe", "Fashion"], answer: 0, explain: "Fire, about two sisters-in-law who fall in love, led to attacks on cinemas in 1998." }
      ],
      think: "Which story, film or book first showed you a queer life? How did it shape what you thought?",
      deeper: [
        { t: "Ball culture (Wikipedia)", url: "https://en.wikipedia.org/wiki/Ball_culture" },
        { t: "Two-spirit (Wikipedia)", url: "https://en.wikipedia.org/wiki/Two-spirit" },
        { t: "Fire (1996 film) (Wikipedia)", url: "https://en.wikipedia.org/wiki/Fire_(1996_film)" }
      ]
    }
  ],
  glossary: [
    { term: "LGBTQIA+", aliases: ["LGBTQ", "LGBT", "LGBTQ+", "LGBTQIA"], def: "Lesbian, gay, bisexual, transgender, queer or questioning, intersex, asexual, plus others. An umbrella for sexual and gender minorities." },
    { term: "Lesbian", aliases: ["lesbians"], def: "A woman attracted to women." },
    { term: "Gay", aliases: [], def: "Attracted to people of the same gender. Used mainly for men, but by many others too." },
    { term: "Bisexual", aliases: ["bi", "bisexuality"], def: "Attracted to more than one gender." },
    { term: "Pansexual", aliases: ["pan"], def: "Attracted to people regardless of their gender." },
    { term: "Transgender", aliases: ["trans", "trans woman", "trans man"], def: "Someone whose gender identity differs from the sex they were assigned at birth." },
    { term: "Cisgender", aliases: ["cis"], def: "Someone whose gender identity matches the sex they were assigned at birth." },
    { term: "Queer", aliases: [], def: "A once-hostile word now reclaimed by many as a broad, proud term for LGBTQ identities." },
    { term: "Intersex", aliases: [], def: "Born with sex characteristics (chromosomes, hormones or anatomy) that don’t fit typical male or female categories." },
    { term: "Asexual", aliases: ["ace", "asexuality"], def: "Experiencing little or no sexual attraction." },
    { term: "Aromantic", aliases: ["aro"], def: "Experiencing little or no romantic attraction." },
    { term: "Non-binary", aliases: ["nonbinary", "enby", "genderqueer"], def: "A gender identity that is not exclusively man or woman." },
    { term: "Gender identity", aliases: [], def: "A person’s inner sense of their own gender." },
    { term: "Gender expression", aliases: [], def: "How someone shows gender outwardly, through clothes, voice, hair or behaviour." },
    { term: "Sexual orientation", aliases: ["orientation"], def: "Who a person is romantically or sexually attracted to." },
    { term: "Pronouns", aliases: ["they/them"], def: "Words used in place of a name, like she, he or they. Using someone’s chosen pronouns is a basic courtesy." },
    { term: "Coming out", aliases: ["came out"], def: "Telling others you are LGBTQ. Usually a repeated, personal process." },
    { term: "Outing", aliases: ["outed"], def: "Revealing someone’s LGBTQ identity without their consent." },
    { term: "Ally", aliases: ["allyship", "allies"], def: "Someone, often straight or cis, who actively supports LGBTQ people." },
    { term: "Homophobia", aliases: ["homophobic", "transphobia", "biphobia"], def: "Prejudice or hostility toward gay people. Transphobia and biphobia are the same for trans and bisexual people." },
    { term: "Misgendering", aliases: ["misgender"], def: "Referring to someone with the wrong gender, name or pronouns." },
    { term: "Deadnaming", aliases: ["deadname"], def: "Using a trans person’s former name without their consent." },
    { term: "Gender dysphoria", aliases: ["dysphoria"], def: "Distress some trans people feel when their body or how others see them doesn’t match their gender." },
    { term: "Gender-affirming care", aliases: ["gender affirming care", "transition"], def: "Social, medical or legal steps that help a trans person live as their gender, such as hormones, surgery or a name change." },
    { term: "Hijra", aliases: ["hijras"], def: "A long-established South Asian community of trans women and intersex and gender-variant people, often living in guru-led households." },
    { term: "Thirunangai", aliases: ["aravani", "thirunambi"], def: "Respectful Tamil term for trans women; thirunambi is used for trans men. Aravani is an older term." },
    { term: "Kothi", aliases: [], def: "A term used in parts of India for feminine men, often attracted to men." },
    { term: "Third gender", aliases: [], def: "A legal or social category for people who are neither man nor woman, recognised in India, Nepal, Pakistan and Bangladesh." },
    { term: "Section 377", aliases: ["377"], def: "The colonial-era Indian Penal Code clause criminalising “unnatural” sex, read down for consenting adults in 2018." },
    { term: "Decriminalisation", aliases: ["decriminalization", "decriminalised", "decriminalized"], def: "Removing criminal penalties for an act, here consensual same-sex relations. It is not the same as equal rights." },
    { term: "Marriage equality", aliases: ["same-sex marriage", "gay marriage"], def: "Allowing same-sex couples to marry on the same terms as opposite-sex couples." },
    { term: "Civil union", aliases: ["civil partnership", "registered partnership"], def: "A legal status giving couples some or most rights of marriage without the name." },
    { term: "Buggery law", aliases: ["sodomy law", "anti-sodomy law"], def: "A law criminalising anal sex, used mainly against gay men; many date from British colonial codes." },
    { term: "Savings clause", aliases: [], def: "A constitutional clause that protects laws in force before independence from being struck down, important in Caribbean cases." },
    { term: "Conversion therapy", aliases: ["conversion practices"], def: "Discredited attempts to change someone’s sexual orientation or gender identity." },
    { term: "Minority stress", aliases: [], def: "Extra chronic stress faced by stigmatised groups, linked to worse health outcomes." },
    { term: "Pride", aliases: ["Pride month", "Pride march", "Pride parade"], def: "Celebrations and marches, often in June, that began as the anniversary of the 1969 Stonewall uprising." },
    { term: "Stonewall", aliases: ["Stonewall riots", "Stonewall uprising"], def: "Protests after a 1969 police raid on the Stonewall Inn, New York, seen as the spark of modern LGBTQ activism." },
    { term: "Two-Spirit", aliases: ["two spirit"], def: "A pan-Indigenous North American term, adopted in 1990, for people with both masculine and feminine spirits or roles." },
    { term: "IDAHOBIT", aliases: ["IDAHOT"], def: "International Day Against Homophobia, Biphobia and Transphobia, 17 May, marking WHO’s 1990 removal of homosexuality from its list of disorders." }
  ],
  facts: [
    { fact: "The Stonewall uprising began on 28 June 1969 after a police raid on a New York bar; the first Pride marches marked its anniversary in 1970.", source: "Encyclopaedia Britannica" },
    { fact: "The Netherlands became the first country to allow same-sex marriage, on 1 April 2001.", source: "Government of the Netherlands" },
    { fact: "The World Health Organization removed homosexuality from its classification of diseases on 17 May 1990.", source: "World Health Organization" },
    { fact: "The American Psychiatric Association removed homosexuality from its list of mental disorders in 1973.", source: "American Psychiatric Association" },
    { fact: "India’s Supreme Court read down Section 377 for consenting adults on 6 September 2018, in a unanimous five-judge ruling.", source: "Supreme Court of India, Navtej Singh Johar v. Union of India, 2018" },
    { fact: "In 2014, India’s Supreme Court recognised transgender people as a third gender with fundamental rights.", source: "Supreme Court of India, NALSA v. Union of India, 2014" },
    { fact: "India’s 2011 Census was the first to count people outside “male” and “female”, recording about 490,000 people under “other”.", source: "Census of India, 2011" },
    { fact: "Taiwan became the first place in Asia to legalise same-sex marriage, on 24 May 2019.", source: "Reuters, 2019" },
    { fact: "Thailand’s marriage equality law took effect on 23 January 2025, the first in Southeast Asia.", source: "BBC News, 2025" },
    { fact: "Around 60-plus countries still criminalised consensual same-sex relations in the mid-2020s, many under laws inherited from British colonial rule.", source: "Human Dignity Trust, 2024" },
    { fact: "Belize’s Supreme Court struck down its anti-sodomy law in 2016, the first such ruling in the English-speaking Caribbean.", source: "Supreme Court of Belize, Orozco v. Attorney General, 2016" },
    { fact: "Uganda’s Anti-Homosexuality Act of 2023 allows the death penalty for “aggravated homosexuality”; its Constitutional Court upheld most of it in 2024.", source: "UN Human Rights Office, 2023; BBC News, 2024" },
    { fact: "The rainbow Pride flag, designed by Gilbert Baker, first flew in San Francisco in June 1978.", source: "Museum of Modern Art (MoMA), which added it to its collection in 2015" },
    { fact: "Alan Turing, convicted in 1952 for homosexual acts, received a posthumous royal pardon in 2013.", source: "UK Ministry of Justice, 2013" }
  ],
  people: [
    { name: "Marsha P. Johnson", years: "1945–1992", where: "United States", why: "A Black trans activist and drag performer linked to the Stonewall uprising, who co-founded STAR to house and support homeless trans youth." },
    { name: "Sylvia Rivera", years: "1951–2002", where: "United States", why: "A Latina trans activist who co-founded STAR with Marsha P. Johnson and fought for trans people to be included in the gay rights movement." },
    { name: "Harvey Milk", years: "1930–1978", where: "United States", why: "One of the first openly gay elected officials in the US, on San Francisco’s Board of Supervisors from 1978 until he was assassinated that November." },
    { name: "Audre Lorde", years: "1934–1992", where: "United States and the Caribbean", why: "A poet of Grenadian heritage who called herself “Black, lesbian, mother, warrior, poet”; her essays shaped ideas about difference and intersectionality. She spent her last years in St Croix." },
    { name: "Bayard Rustin", years: "1912–1987", where: "United States", why: "A gay civil rights strategist who organised the 1963 March on Washington, often sidelined because of his sexuality." },
    { name: "Alan Turing", years: "1912–1954", where: "United Kingdom", why: "A founder of computer science and wartime codebreaker, prosecuted in 1952 for homosexuality; his story drove later pardons." },
    { name: "Magnus Hirschfeld", years: "1868–1935", where: "Germany", why: "A doctor who founded the Institute for Sexual Science in Berlin in 1919 and campaigned to decriminalise homosexuality, before the Nazis destroyed his work." },
    { name: "Christine Jorgensen", years: "1926–1989", where: "United States", why: "An American whose gender-affirming surgery in Denmark made world headlines in 1952, making trans people visible to millions." },
    { name: "Laxmi Narayan Tripathi", years: "born 1979", where: "India", why: "A hijra activist and petitioner in the 2014 NALSA case that recognised a third gender in India." },
    { name: "Manvendra Singh Gohil", years: "born 1965", where: "India", why: "A prince of the former royal family of Rajpipla in Gujarat who came out publicly in 2006 and works on HIV and LGBTQ welfare." },
    { name: "Menaka Guruswamy and Arundhati Katju", years: "", where: "India", why: "Supreme Court lawyers who argued for decriminalisation in the Section 377 case; in 2019 they spoke publicly about being a couple." },
    { name: "Grace Banu", years: "", where: "India (Tamil Nadu)", why: "A Dalit trans activist from Tamil Nadu who studied engineering and campaigns for reservations for trans people in education and jobs." },
    { name: "Jason Jones", years: "", where: "Trinidad and Tobago", why: "A Trinidadian-born LGBTQ activist whose case led the High Court in 2018 to rule Trinidad’s laws against gay sex unconstitutional, a ruling contested on appeal." },
    { name: "Caleb Orozco", years: "", where: "Belize", why: "An activist whose case led Belize’s Supreme Court in 2016 to strike down the anti-sodomy law, a first in the English-speaking Caribbean." },
    { name: "Audrey Tang", years: "born 1981", where: "Taiwan", why: "A self-taught programmer who became Taiwan’s first digital minister (2016–2024) and the first transgender person in its cabinet." },
    { name: "Sunil Babu Pant", years: "born 1972", where: "Nepal", why: "Founder of the Blue Diamond Society and petitioner in the 2007 case where Nepal’s Supreme Court recognised a third gender; he was also Nepal’s first openly gay MP." }
  ]
};
