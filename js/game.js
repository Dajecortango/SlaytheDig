        /* ==========================================================================
           DATABASE DELLE CAMPAGNE
           ========================================================================== */
        const campaignsDatabase = {
            tutorial: {
                id: "tutorial",
                title: "Un brusco risveglio",
                badge: "Tutorial",
                description: "Dopo la grande battaglia, il vino ha avuto la meglio. Riuscirai a rientrare prima dell'ira del Capitano?",
                coverImage: "immagini/inizio_campagna.png",
                introText: "Aprite gli occhi. Il soffitto è di roccia irregolare, umida e gocciolante. Una luce fioca filtra dall'esterno, accompagnata dal rumore di un martellare persistente di un fabbro dentro il tuo cranio. Hai un sapore di birra torbida in bocca. Intorno a te, sparsi sul pavimento di pietra, ci sono i tuoi familiari, chi sta abbracciando un barile vuoto urlando frasi sconnesse su chissà quale cugina, chi ha il gambesone infilato al contrario e non riesce a toglierlo... Fuori dalla grotta c'è solo nebbia e il ringhio lontano di qualcosa che speri vivamente non siano lupi affamati.",

                heroes: [
                    { name: "Curio Dignitas", str: 4, int: 1, fth: 2, maxHp: 4, hp: 4, dmg: 1, base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [] },
                    { name: "Prometeo Dignitas", str: 3, int: 2, fth: 2, maxHp: 4, hp: 4, dmg: 1, base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [] },
                    { name: "Temistocle Dignitas", str: 4, int: 2, fth: 1, maxHp: 4, hp: 4, dmg: 1, base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [] },
                    { name: "Caino Dignitas", str: 3, int: 3, fth: 1, maxHp: 4, hp: 4, dmg: 1, base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [] },
                    { name: "Ottavio Dignitas", str: 5, int: 1, fth: 1, maxHp: 4, hp: 4, dmg: 1, base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [] }
                ],
                abilities: {
                    "Curio Dignitas": [{name: "+1 Forza", type: "passive_stat", stat: "str", val: 1}, {name: "+1 HP", type: "passive_stat", stat: "hp", val: 1}],
                    "Prometeo Dignitas": [{name: "+1 Intelligenza", type: "passive_stat", stat: "int", val: 1}, {name: "+1 Fede", type: "passive_stat", stat: "fth", val: 1}],
                    "Temistocle Dignitas": [{name: "+1 HP", type: "passive_stat", stat: "hp", val: 1}, {name: "+1 Fede", type: "passive_stat", stat: "fth", val: 1}],
                    "Caino Dignitas": [{name: "+1 Intelligenza", type: "passive_stat", stat: "int", val: 1}, {name: "+1 HP", type: "passive_stat", stat: "hp", val: 1}],
                    "Ottavio Dignitas": [{name: "+1 HP", type: "passive_stat", stat: "hp", val: 1}, {name: "+1 Fede", type: "passive_stat", stat: "fth", val: 1}]
                },
                initialArmory: [
                    { id: "spada", name: "Spada", str: 1, desc: "+1 Forza" },
                    { id: "ascia", name: "Ascia", dmg: 1, desc: "+1 Danno" },
                    { id: "alabarda", name: "Alabarda", help_bonus_val: 1, desc: "+1 Tiro Aiuto" },
                    { id: "scudo", name: "Scudo", def_bonus: 1, desc: "+1 Tiro Difesa" },
                    { id: "armatura_leggera", name: "Armatura leggera", armor: 1, desc: "+1 Punti Armatura" },
                    { id: "armatura_pesante", name: "Armatura pesante", armor: 2, att_penalty: 1, desc: "+2 Punti Armatura, -1 Attacco" },
                    { id: "libro_fede", name: "Libro di fede", fth: 1, desc: "+1 Fede" },
                    { id: "tomo_conoscenza", name: "Tomo di conoscenza", int: 1, desc: "+1 Intelligenza" },
                    { id: "unguento", name: "Unguento lenitivo", type: "consumable_heal", heal_val: 2, desc: "Consumabile: Cura 2 HP" }
                ],

                enemies: {
                    cinghiali: { name: "Cinghiali", hp: 5, maxHp: 5, att: 4, dmg: 1, ca: 6, desc: "Un fruscio improvviso squarcia il silenzio della nebbia mattutina. Sagome scure e massicce emergono dal grigiore: cinghiali con zanne ricurve terrificanti." },
                    disertori: { name: "Disertori", hp: 6, maxHp: 6, att: 6, dmg: 1, ca: 6, desc: "Dalla cortina di nebbia spuntano soldati: disertori affamati e disperati, armati di lance e spade. Vi squadrano con odio." },
                    lupi: { name: "Lupi", hp: 5, maxHp: 5, att: 4, dmg: 2, ca: 6, desc: "Dalle carcasse emergono fauci sbavate: un branco di lupi affamati si aggira tra i cadaveri in cerca di prede." },
                    banditi: { name: "Banditi", hp: 6, maxHp: 6, att: 7, dmg: 2, ca: 7, desc: "Banditi spietati che approfittano del caos della guerra vi sbarrano la strada, attratti dal fumo del falò." },
                    profanatori: { name: "Profanatori", hp: 6, maxHp: 6, att: 4, dmg: 2, ca: 7, desc: "Uomini armati di ascia e pala cercano tombe da depredare. Nessuno può profanare un caduto del Leone." },
                    sergente: { name: "Sergente", hp: 8, maxHp: 8, att: 6, dmg: 3, ca: 8, desc: "Una truppa regolare sopravvissuta, guidata da un sergente con corazza insanguinata. Si sfoderano le armi." }
                },
                challenges: {
                    fede7: {
                        title: "Un piccolo santuario",
                        desc: "Una nicchia nella roccia ospita una statuetta sacra.",
                        ignoreText: "Proseguite oltre senza fermarvi...",
                        successText: "Omaggiate gli dei e notate un riflesso prezioso tra i sassi.",
                        failText: "Storditi, fate cadere goffamente la statuetta a terra.",
                        stat: "fth", cd: 7,
                        reward: { type: "relic", name: "Anello d'Arvale", desc: "+1 fede a tutti", apply: () => party.forEach(h => h.fth += 1) },
                        punishment: { type: "curse", name: "-15% ricompensa monete", desc: "Monete future ridotte del 15%", apply: () => activeCurses.push("Maledizione: -15% monete") }
                    },
                    intel7: {
                        title: "Tracce nel fango",
                        desc: "Strane impronte indicano una lotta o qualcos'altro...",
                        ignoreText: "Tutta la zona è piena di fango, non sono rilevanti.",
                        successText: "Riconoscete le tracce dei piegamenti fatti da ubriachi ieri notte e ritrovate materiale disperso!",
                        failText: "Non riuscite a decifrare nulla e fuggite frettolosamente.",
                        stat: "int", cd: 7,
                        reward: { type: "relic", name: "Armatura d'ordinanza", desc: "+1 HP max a tutti", apply: () => party.forEach(h => { h.maxHp += 1; h.hp += 1; }) },
                        punishment: { type: "curse", name: "Sbornia pesante", desc: "-1 ai tiri attacco", apply: () => party.forEach(h => h.att_penalty = (h.att_penalty || 0) + 1) }
                    },
                    fede7_2: {
                        title: "Lamenti nelle nebbie",
                        desc: "Popolani in processione piangono i caduti verso una fossa comune.",
                        ignoreText: "Non avete tempo da perdere, affrettate il passo.",
                        successText: "Vi raccogliete in silenzio e aiutate a posare un caduto. Ricevete la loro benedizione.",
                        failText: "I fumi e l'odore nauseabondo vi respingono.",
                        stat: "fth", cd: 7,
                        reward: { type: "relic", name: "Benedetti da Jag Antar", desc: "+1 ai tiri di attacco", apply: () => party.forEach(h => h.att_bonus = (h.att_bonus || 0) + 1) },
                        punishment: { type: "curse", name: "Maledetti dai popolani", desc: "-1 fede al party", apply: () => party.forEach(h => h.fth = Math.max(0, h.fth - 1)) }
                    },
                    intel8: {
                        title: "Ricordi della marcia",
                        desc: "Solchi di carri pesanti. Saprete capire quale direzione hanno preso?",
                        ignoreText: "Meglio seguire l'istinto.",
                        successText: "Vi ricordate improvvisamente di avere la mappa nel borsello!",
                        failText: "Non ricordate nulla e procedete a caso.",
                        stat: "int", cd: 8,
                        reward: { type: "relic", name: "Mappa della regione", desc: "+1 intelligenza al party", apply: () => party.forEach(h => h.int += 1) },
                        punishment: { type: "curse", name: "Cattiva memoria", desc: "-1 intelligenza al party", apply: () => party.forEach(h => h.int = Math.max(0, h.int - 1)) }
                    },
                    fede8: {
                        title: "Onore ai caduti",
                        desc: "Trovate il corpo di un commilitone abbandonato.",
                        ignoreText: "Troppo tardi, lasciate il corpo dove si trova.",
                        successText: "Scavate una fossa degna e placate la vostra coscienza.",
                        failText: "La paura dell'adunata vi fa desistere a metà dell'opera.",
                        stat: "fth", cd: 8
                    },
                    scelta_finale: {
                        title: "Accampamento",
                        desc: "Varcate l'ingresso del campo principale. Il capitano vi starà cercando?",
                        ignoreText: "Correte a capofitto verso le vostre tende.",
                        successText: "Rientrate eludendo le guardie senza farvi notare.",
                        failText: "Nel buio inciampate contro le riserve di provviste allarmando l'intero campo.",
                        stat: "fth", cd: 9
                    }
                },
                merchants: {
                    1: "Un mercante con un carretto di fortuna vi propone cianfrusaglie e armamenti di seconda mano.",
                    2: "Un carrettiere offre provviste e scambi veloci lungo il sentiero.",
                    3: "Una carovana di profughi baratta ciò che ha con un po' di denaro per cibarsi.",
                    4: "Mercanti itineranti vendono merci sottratte agli accampamenti abbandonati."
                },
                rests: {
                    1: "Un focolare quasi spento tra due massi: il calore della cenere vi ristora.",
                    2: "Una radura riparata dalla nebbia vi concede una breve pausa.",
                    3: "In cima al colle vedete la sagoma della meta: un ultimo respiro prima della fine."
                },
                treasures: {
                    1: "Sulle rive del torrente ritrovate i vostri fagotti abbandonati.",
                    2: "Un forziere abbandonato dai fuggiaschi sulle sponde del fiume.",
                    3: "Il cadavere di un commilitone stringe tra le mani un manufatto prezioso."
                },
                lootItems: null,
                mapNodes: [
                    { id: 0, level: 0, x: 400, type: "combat", enemy: "cinghiali", title: "Livello 1 - Scontro 1", icon: "🗡️", done: false, active: true, next: [1, 2], image: "immagini/scontro_cinghiali.jpg" },
                    { id: 1, level: 1, x: 300, type: "challenge", challengeId: "fede7", title: "Livello 2 - Sfida 1", icon: "❓", done: false, active: false, next: [3, 4], image: "immagini/santuario.png" },
                    { id: 2, level: 1, x: 500, type: "challenge", challengeId: "intel7", title: "Livello 2 - Sfida 2", icon: "❓", done: false, active: false, next: [4, 5], image: "immagini/tracce_fango.png" },
                    { id: 3, level: 2, x: 200, type: "treasure", treasureId: 1, title: "Livello 3 - Tesoro 1", icon: "💎", done: false, active: false, next: [6, 7], image: "immagini/tesoro_fiume.png" },
                    { id: 4, level: 2, x: 400, type: "combat", enemy: "disertori", title: "Livello 3 - Scontro 2", icon: "🗡️", done: false, active: false, next: [7, 8], image: "immagini/scontro_disertori.png" },
                    { id: 5, level: 2, x: 600, type: "merchant", merchantId: 1, title: "Livello 3 - Mercante 1", icon: "🪙", done: false, active: false, next: [8, 9], image: "immagini/mercante_carretto.jpg" },
                    { id: 6, level: 3, x: 180, type: "merchant", merchantId: 2, title: "Livello 4 - Mercante 2", icon: "🪙", done: false, active: false, next: [10], image: "immagini/mercante_carovana.jfif" },
                    { id: 7, level: 3, x: 340, type: "combat", enemy: "lupi", title: "Livello 4 - Scontro 3", icon: "🗡️", done: false, active: false, next: [10, 11], image: "immagini/scontro_lupi.jpg" },
                    { id: 8, level: 3, x: 500, type: "rest", restId: 1, title: "Livello 4 - Riposo 1", icon: "⛺", done: false, active: false, next: [11, 12], image: "immagini/riposo_focolare.jpg" },
                    { id: 9, level: 3, x: 620, type: "treasure", treasureId: 2, title: "Livello 4 - Tesoro 2", icon: "💎", done: false, active: false, next: [12], image: "immagini/tesoro_fiume.png" },
                    { id: 10, level: 4, x: 250, type: "rest", restId: 2, title: "Livello 5 - Riposo 2", icon: "⛺", done: false, active: false, next: [13], image: "immagini/riposo_colle.jpg" },
                    { id: 11, level: 4, x: 400, type: "challenge", challengeId: "fede7_2", title: "Livello 5 - Sfida 3", icon: "❓", done: false, active: false, next: [13, 14], image: "immagini/lamenti_nebbia.jpg" },
                    { id: 12, level: 4, x: 550, type: "combat", enemy: "banditi", title: "Livello 5 - Scontro 4", icon: "⚔️", done: false, active: false, next: [14, 15], image: "immagini/scontro_banditi.png" },
                    { id: 13, level: 5, x: 260, type: "elite", enemy: "sergente", title: "Livello 6 - Scontro Elite 1", icon: "👹", done: false, active: false, next: [16], image: "immagini/scontro_sergente.jpg" },
                    { id: 14, level: 5, x: 400, type: "treasure", treasureId: 3, title: "Livello 6 - Tesoro 3", icon: "💎", done: false, active: false, next: [17, 18], image: "immagini/tesoro_cadavere.jpg" },
                    { id: 15, level: 5, x: 540, type: "challenge", challengeId: "intel8", title: "Livello 6 - Sfida 4", icon: "❓", done: false, active: false, next: [19, 18], image: "immagini/ricordi_marcia.jfif" },
                    { id: 16, level: 6, x: 180, type: "merchant", merchantId: 3, title: "Livello 7 - Mercante 3", icon: "🪙", done: false, active: false, next: [20], image: "immagini/mercante_profugo.jpg" },
                    { id: 17, level: 6, x: 340, type: "challenge", challengeId: "fede8", title: "Livello 7 - Sfida 5", icon: "❓", done: false, active: false, next: [20], image: "immagini/onore_caduti.jpg" },
                    { id: 18, level: 6, x: 500, type: "combat", enemy: "profanatori", title: "Livello 7 - Scontro 5", icon: "🗡️", done: false, active: false, next: [20], image: "immagini/scontro_profanatori.jpg" },
                    { id: 19, level: 6, x: 620, type: "merchant", merchantId: 4, title: "Livello 7 - Mercante 4", icon: "🪙", done: false, active: false, next: [20], image: "immagini/mercante_carovana.png" },
                    { id: 20, level: 7, x: 400, type: "rest", restId: 3, title: "Livello 8 - Riposo 3", icon: "⛺", done: false, active: false, next: [21], image: "immagini/riposo_finale.jpg" },
                    { id: 21, level: 8, x: 400, type: "challenge", challengeId: "scelta_finale", title: "Livello 9 - Meta", icon: "👑", done: false, active: false, next: [], image: "immagini/accampamento_arrivo.jpg" }
                ]
            },

            // --- CAMPAGNA: VIAGGIO DI ASTARTE (15 LIVELLI + BOSS FINALE) ---
            astarte_ch1: {
                id: "astarte_ch1",
                title: "Viaggio di Astarte, capitolo uno",
                badge: "Nuova Campagna",
                description: "Inizia il pellegrinaggio di Astarte attraverso terre sconosciute e rovine dimenticate.",
                coverImage: "immagini/astarte_capitolo_uno.jpg",
                introText: "Astarte si stringe nel mantello mentre il vento freddo delle alture spazza la pietraia. Davanti a voi si snoda una pista dimenticata, segnata dal sangue di vecchi conflitti e dal respiro pesante di creature che reclamano queste lande. La spedizione comincia.",

                heroes: [
                    { name: "Icaro", str: 3, int: 3, fth: 1, maxHp: 4, hp: 4, dmg: 1, base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [] },
                    { name: "Astarte", str: 2, int: 3, fth: 2, maxHp: 4, hp: 4, dmg: 1, base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [] },
                    { name: "Ascadeo", str: 3, int: 1, fth: 3, maxHp: 4, hp: 4, dmg: 1, base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [] },
                    { name: "Zeno", str: 3, int: 2, fth: 2, maxHp: 4, hp: 4, dmg: 1, base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [] },
                    { name: "Dioforo", str: 2, int: 4, fth: 1, maxHp: 4, hp: 4, dmg: 1, base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [] }
                ],
                abilities: {
                    "Icaro": [
                        {
                            id: "icaro_oro",
                            name: "Fammi dare un’occhiata",
                            desc: "Passiva: se dà il colpo di grazia ad un nemico, aumenta l'oro guadagnato del 30%",
                            isCombatActive: false,
                            apply: (hero) => { hero.bonusLootGoldLastHit = 0.30; }
                        },
                        {
                            id: "icaro_trucchi",
                            name: "Trucchi del mestiere",
                            desc: "Attiva (1 volta per scontro): tira due dadi per attaccare e tiene il più alto",
                            isCombatActive: true,
                            actionName: "Trucchi del mestiere (2 dadi attacco)"
                        }
                    ],
                    "Astarte": [
                        {
                            id: "astarte_veleni",
                            name: "Veleni ed altri composti",
                            desc: "Passiva: cosparge le lame con composti alchemici (+1 al Danno permanente)",
                            isCombatActive: false,
                            apply: (hero) => { hero.dmg += 1; }
                        },
                        {
                            id: "astarte_affondo",
                            name: "Affondo mortale",
                            desc: "Attiva (1 volta per scontro): attacco speciale che infligge danno raddoppiato",
                            isCombatActive: true,
                            actionName: "Affondo mortale (Doppio Danno)"
                        }
                    ],
                    "Ascadeo": [
                        {
                            id: "ascadeo_ghiaccio",
                            name: "Abitante del GhiaccioEterno",
                            desc: "Passiva: ottiene 1 punto di armatura naturale permanente",
                            isCombatActive: false,
                            apply: (hero) => {
                                hero.base_armor += 1;
                                hero.current_armor += 1;
                            }
                        },
                        {
                            id: "ascadeo_segnato",
                            name: "Segnato da Hvid",
                            desc: "Attiva (1 volta per scontro): colpo speciale che stordisce l'avversario per il suo turno",
                            isCombatActive: true,
                            actionName: "Segnato da Hvid (Stordisce Nemico)"
                        }
                    ],
		    "Zeno": [
                        {
                            id: "zeno_colpo_benedetto",
                            name: "Colpo benedetto",
                            desc: "Attiva (1 volta per scontro): aggiunge il valore di Fede al Danno inflitto",
                            isCombatActive: true,
                            actionName: "Colpo benedetto (+Fede al Danno)"
                        },
                        {
                            id: "zeno_addestramento",
                            name: "Addestramento marziale",
                            desc: "Passiva: ottiene permanentemente +1 a Forza",
                            isCombatActive: false,
                            apply: (hero) => { hero.str += 1; }
                        }
                    ],
                    "Dioforo": [
                        {
                            id: "dioforo_era_solo_una_prova",
                            name: "Era solo una prova!",
                            desc: "Passiva: quando affronta una prova di Intelligenza o Fede tira 2 dadi e tiene il migliore",
                            isCombatActive: false,
                            apply: (hero) => { hero.hasAdvantageOnIntFth = true; }
                        },
                        {
                            id: "dioforo_penna",
                            name: "La penna ferisce più della spada",
                            desc: "Attiva (1 volta per scontro): aggiunge il valore di Intelligenza al tiro per colpire",
                            isCombatActive: true,
                            actionName: "La penna ferisce più della spada (+Intelligenza ad Attacco)"
                        }
                    ]
                },
                initialArmory: [
                    { id: "pugnale_rapido", name: "Pugnale Rapido", rarity: "comune", str: 1, desc: "+1 Forza" },
                    { id: "ascia_taglialegna", name: "Ascia da Taglialegna", rarity: "comune", dmg: 1, desc: "+1 Danno" },
                    { id: "bastone_rinforzato", name: "Bastone Rinforzato", rarity: "comune", help_bonus_val: 1, desc: "+1 Tiro Aiuto" },
                    { id: "scudo_legno", name: "Scudo Tondo di Legno", rarity: "comune", def_bonus: 1, desc: "+1 Tiro Difesa" },
                    { id: "corazza_cuoio", name: "Corazza di Cuoio Bollito", rarity: "comune", armor: 1, desc: "+1 Armatura" },
                    { id: "amuleto_legno_santo", name: "Amuleto di Legno Santo", rarity: "comune", fth: 1, desc: "+1 Fede" },
                    { id: "taccuino_cartografo", name: "Taccuino del Cartografo", rarity: "comune", int: 1, desc: "+1 Intelligenza" },
                    { id: "balsamo_curativo", name: "Balsamo Lenitivo", rarity: "comune", type: "consumable_heal", heal_val: 2, desc: "Consumabile: Cura 2 HP" }
                ],

                enemies: {
                    // SCONTRI NORMALI (14)
                    banditi_strada: {
                        name: "Banditi della strada", hp: 8, maxHp: 8, att: 7, dmg: 1, ca: 7,
                        desc: "Dalle ombre di un terrapieno sbucano figure coperte da mantelli lisi e logorati dalla polvere e dalla pioggia. Impugnano spade scheggiate e clave ferrate, con i volti seminascosti da cappucci sudici. Ti sbarrano la strada con sorrisi mefistofelici, affamati di bottino e indifferenti alla vita umana; per loro la vostra spedizione è solo l'ennesima facile preda da spolpare nel fango del sentiero."
                    },
                    briganti_pedaggio: {
                        name: "Briganti del pedaggio", hp: 10, maxHp: 9, att: 7, dmg: 1, ca: 7,
                        desc: "Hanno occupato una strettoia naturale della via, sbarrandola con assi di legno chiodate e spuntoni. Indossano pezzi di armature rubate e spaiate, ostentando un'autorità fasulla ma armata fino ai denti. Ti guardano dall'alto in basso con arroganza, stringendo balestre e picche sporche di sangue, pronti a esigere un tributo nel sangue se rifiutate di cedere ogni vostro avere."
                    },
                    branco_lupi: {
                        name: "Branco di lupi", hp: 9, maxHp: 9, att: 8, dmg: 1, ca: 8,
                        desc: "Un ringhio profondo e gutturale rompe il silenzio della boscaglia. Dalla boscaglia emergono occhi gialli e famelici, fauci sbavate e pelo fitto irto di brina. È un branco di lupi invernali, grossi e spietati, guidati dal freddo e dalla fame disperata. Circondano il gruppo con movimenti fluidi e coordinati, studiando le vostre posture alla ricerca di un momento di distrazione per azzannare alla gola."
                    },
                    disertori: {
                        name: "Banda di disertori", hp: 10, maxHp: 10, att: 8, dmg: 2, ca: 8,
                        desc: "Soldati sbandati di un esercito ormai dissolto, con le divise lacerate e prive di insegne, ridotte a stracci sudici. Hanno lo sguardo perso, segnato dalla paranoia e dalla disperazione della guerra perduta. Armati di lance arrugginite e cortelli da campo, vi squadrano con un misto di terrore e rabbia cieca: non hanno più nulla da perdere e sono disposti a tutto pur di sottrarvi le provviste e gli abiti di dosso."
                    },
                    predoni: {
                        name: "Predoni", hp: 12, maxHp: 12, att: 7, dmg: 2, ca: 9,
                        desc: "Guerrieri nomadi e spietati delle lande di confine, agili e letali, specializzati negli agguati lungo i valichi montani. Indossano corazze leggere di pelle e pellicce, armati di scimitarre ricurve e coltelli da lancio che luccicano debolmente nella penombra. Si muovono rapidamente tra i massi, sfruttando ogni copertura per colpire i punti deboli della compagnia con tattiche mordi e fuggi."
                    },
                    cani_caccia: {
                        name: "Cani da caccia rinselvatichiti", hp: 7, maxHp: 7, att: 7, dmg: 1, ca: 6,
                        desc: "Segugi da guerra e mastini abbandonati dagli eserciti in rotta, ridotti a carcasse pelle e ossa dalla fame. Riuniti in una muta famelica, si muovono bassi tra le felci secche, coordinandosi con latrati strozzati prima di scattare verso le caviglie della compagnia."
                    },
                    sciacalli_cadaveri: {
                        name: "Sciacalli di cadaveri", hp: 8, maxHp: 8, att: 6, dmg: 1, ca: 8,
                        desc: "Figuri viscidi armati di coltellacci e zappe da scavo, sorpresi a spogliare le carcasse lungo il ciglio del sentiero. Vedendovi arrivare, non esitano a brandire i ferri sporchi di terra e ruggine per mettere a tacere eventuali testimoni e allargare il proprio bottino."
                    },
                    orso_bruno: {
                        name: "Orso bruno selvaggio", hp: 12, maxHp: 12, att: 9, dmg: 2, ca: 7,
                        desc: "Un enorme maschio solitario, reso nervoso e feroce dalla scarsità di cibo prima dell'inverno. Svegliato dal passaggio dei vostri passi, si solleva a tutta altezza tra i massi abbattendo gli artigli con rugli furibondi per difendere la sua gola."
                    },
                    balestrieri_disertori: {
                        name: "Balestrieri disertori", hp: 11, maxHp: 11, att: 8, dmg: 2, ca: 9,
                        desc: "Tiratori scelti fuggiti dai ranghi dell'esercito regolare, appostati dietro muretti a secco e rocce sporgenti. Con le balestre cariche e dardi con punta a foglia, aprono il fuoco senza preavviso, pronti a bersagliarvi dalla distanza."
                    },
                    cinghiali_pietraie: {
                        name: "Cinghiali delle pietraie", hp: 8, maxHp: 8, att: 7, dmg: 1, ca: 7,
                        desc: "Una coppia di cinghiali massicci e aggressivi, con la pelle indurita da anni di pascolo tra le rocce taglienti. Sentendosi messi all'angolo nel canalone cieco, abbassano le zanne affilate e caricano a testa bassa senza curarsi delle vostre armi."
                    },
                    picchieri_sbandati: {
                        name: "Picchieri della milizia sbandata", hp: 12, maxHp: 12, att: 7, dmg: 1, ca: 8,
                        desc: "Una linea di fanti contadini un tempo arruolati a forza, ora rimasti senza paga né comando. Serrano i ranghi piantando a terra lunghe aste scheggiate, formando una barriera di punte acuminata e pericolosa per chiunque tenti di avvicinarsi frontalmente."
                    },
                    esploratori_predoni: {
                        name: "Esploratori predoni", hp: 8, maxHp: 8, att: 7, dmg: 1, ca: 8,
                        desc: "L'avanguardia agile delle bande montane. Armati di archi corti e corte sciabole, si muovono silenziosi tra i dirupi per saggiare la resistenza della vostra carovana con colpi rapidi e ritirate repentine."
                    },
                    fabbro_rinnegato: {
                        name: "Fabbro rinnegato e sgherri", hp: 10, maxHp: 10, att: 7, dmg: 2, ca: 9,
                        desc: "Un artigiano delle armate campali datosi al brigantaggio insieme a due manovali. Impugna una mazza da forgia pesante e pinze incandescenti, protetto da un grembiale chiodato capace di deflettere i colpi di striscio."
                    },
                    cani_corsi: {
                        name: "Branco di cani corsi feroci", hp: 12, maxHp: 12, att: 9, dmg: 2, ca: 7,
                        desc: "Cani da presa sfuggiti alle tenute saccheggiate a valle. Grossi, silenziosi e privi di collare, sbarrano il sentiero ringhiando a denti stretti, pronti ad azzannare le braccia armate per trascinare a terra chiunque avanzi."
                    },

                    // SCONTRI ELITE (4)
                    capitano_predoni: {
                        name: "Capitano dei predoni", hp: 10, maxHp: 10, att: 7, dmg: 2, ca: 7,
                        desc: "Una figura imponente e massiccia avvolta in una pesante corazza di cuoio bollito e metallo nero. Impugna un'ascia bipenne intrisa di vecchia ruggine e sangue secco, emanando un'aura di brutale autorità sui suoi sottoposti. Ti fissa con un ghigno sprezzante, gli occhi freddi di un veterano della violenza che ha ridotto la predazione a mestiere: per superarlo dovrete spezzare la sua furia inarrestabile."
                    },
                    tremabosco: {
                        name: "Tremabosco Infuriato", hp: 14, maxHp: 14, att: 9, dmg: 2, ca: 7,
                        desc: "Un possente fruscio tra i rami spezzati anticipa l'arrivo di una mole mastodontica: un colosso ricoperto di fitto pelo bruno, con la corporatura massiccia di un toro e la testa armata di zanne ricurve simili a spade. Il Tremabosco Striato fiuta l'aria con il muso ricurvo, raspando furioso il terreno con zampe possenti mentre si raccoglie per una carica devastante. La foresta ammutolisce al suo cospetto."
                    },
                    mastino_bokgar: {
                        name: "Mastino di Bokgar", hp: 10, maxHp: 10, att: 7, dmg: 3, ca: 8,
                        desc: "Dall'oscurità delle rovine emergono sagome scure e fameliche, avvolte da un silenzio innaturale. I Mastini di Bokgar, antichi parassiti notturni sopravvissuti per secoli in cavità dimenticate, avanzano con movimenti furtivi e uno sguardo vitreo privo di paura. Le loro fauci digrignano in attesa di spolpare la carne viva, mentre il loro corpo tradisce il terrore viscerale per la luce, che li rende ancora più aggressivi e disperati."
                    },
                    boia_rinnegati: {
                        name: "Boia dei Rinnegati", hp: 14, maxHp: 14, att: 7, dmg: 3, ca: 9,
                        desc: "Un colosso umano avvolto in un grembiule di cuoio annerito e macchiato, con il volto celato da un cappuccio di canapa grezza. Poggia sulle spalle una pesante mannaia d'acciaio grezzo, usata tanto per tagliare legna quanto per punire disertori e viandanti. Attorno a lui regna un silenzio sinistro: è la retroguardia spietata delle bande montane, abituato a finire i feriti con fredda brutalità."
                    },

                    // BOSS FINALE (1)
                    hungrabarn: {
                        name: "Hungrabarn", hp: 16, maxHp: 16, att: 9, dmg: 4, ca: 9,
                        desc: "Dall'ombra più profonda della sala emerge una sagoma colossale, un relitto vivente di una razza che il mondo credeva estinta. L'Hungrabarn si erge in tutta la sua spaventosa imponenza, raggiungendo altezze titaniche, con membra possenti e uno sguardo affamato che brama carne umana. Tra le sue mani artigliate e ai suoi piedi si calpestano teschi e ossa accumulate nei secoli, mentre un ruggito primordiale e sordo scuote le rovine. La fine della spedizione si misura adesso contro questo incubo di carne e pietra."
                    }
                },

                challenges: {
                    // INTELLIGENZA (6)
                    carro_rovesciato: {
                        title: "Il carro rovesciato",
                        desc: "Il silenzio del sentiero montano è rotto solo dal cigolio sinistro di un raggio spezzato. Un pesante carro mercantile giace coricato su un fianco, il carico giace in bilico precario tra terreno ed il peso stesso del carro. Le corde che tenevano serrate le cassepanche si sono sfilacciate e il minimo sbilanciamento del peso rischia di seppellire ciò che rimane di valore sotto l'enorme peso del mezzo. Tra le assi crepate, infatti, scorgi le venature metalliche di una cassa rinforzata con serratura a combinazione, tipica delle gilde mercantili del Sud.",
                        ignoreText: "Non avete tempo da perdere per frugare tra i rottami altrui. Stringete le cinghie degli zaini e proseguite lungo il passo montano.",
                        successText: "Analizzando il centro di gravità del relitto, puntellate l'asse maestro con due robusti rami d'acero e disinnescate con calma il meccanismo a scatto della serratura della cassa in metallo. All'interno trovate qualche moneta d’oro ma vi sorge una domanda: perché fuggire abbandonando tutto?",
                        failText: "Toccate il montante sbagliato: il legno cede con uno schianto secco, il carro seppellisce la cassa e i detriti vi piombano addosso, scuotendo la squadra. La cassa ed il suo contenuto sono persi per sempre.",
                        stat: "int", cd: 7,
                        reward: { type: "coins", name: "15 Monete d'Oro", desc: "+15 monete alla cassa della compagnia", apply: () => partyCoins += 15 },
                        punishment: null
                    },
                    pietra_miliare: {
                        title: "La pietra miliare",
                        desc: "Accanto a un bivio soffocato da rovi e ortiche sorge un cippo di calcare grigio, eroso da decenni di piogge torrenziali e coperto da una crosta di licheni giallastri. Si tratta di un'antica pietra di confine, incisa con misurazioni topografiche, rilievi vallivi e distanze in leghe risalenti a prima della frammentazione dei ducati. Molti nomi sono stati scalpellati via dal tempo, ma chi possiede memoria storica e metodo geometrico può ancora raccordare quei riferimenti alle cime innevate all'orizzonte.",
                        ignoreText: "Non ha senso perdere le ultime ore di luce a grattare muschio da sassi secolari. La strada principale è fangosa, ma almeno sapete dove poggiare i piedi.",
                        successText: "Raschiando con cura i depositi calcarei e calcolando la declinazione delle vette circostanti, identificate un vecchio tracciato lastricato che vi conduce ad un tesoro nascosto.",
                        failText: "Fraintendete un'abbreviazione cartografica e scambiate una conca franosa per una scorciatoia carrozzabile. Il gruppo marcia a vuoto per ore in mezzo a pozzanghere gelide e pietraie instabili.",
                        stat: "int", cd: 7,
                        reward: { type: "relic", name: "Corno antico", desc: "Durante il terzo turno tutti gli eroi ottengono +1 al danno" },
                        punishment: { type: "curse", name: "Gelo nelle ossa", desc: "-1 a tutti i tiri per colpire del party finché non visiterete un'area di riposo", apply: () => { activeCurses.push("Gelo nelle ossa (-1 tiri per colpire)"); party.forEach(h => h.att_penalty = (h.att_penalty || 0) + 1); } }
                    },
                    mercante_bloccato: {
                        title: "Il mercante bloccato",
                        desc: "Una serie di urla furiose e lo schiocco sordo di un frustino risuonano oltre una curva cieca. Un mercante tarchiato, con le vesti lorde di melma, sta tentando inutilmente di incitare due cavalli esausti: la ruota posteriore del suo massiccio carro coperto è sprofondata in una buca d'argilla fino al mozzo, incastrandosi contro un ceppo sommerso. L'uomo è nel panico, convinto che le grida attireranno i predoni delle colline, e rischia solo di spezzare le zampe alle bestie continuando a frustarle.",
                        ignoreText: "Non sono affari vostri e non avete alcuna intenzione di rischiare uno scontro con eventuali banditi attirati da quel baccano. Superate l'impantanamento tenendovi al limitare della macchia.",
                        successText: "Calmate il carrettiere con fermezza, fate allentare i finimenti e utilizzate due tronchi come leve fulcrate sulle pietre del ciglio stradale. Con una distribuzione ottimale della forza, il carro risale dal fango in pochi istanti senza un graffio. Grato per l'aiuto, l'uomo vi cede un cimelio prezioso.",
                        failText: "Posizionate la leva nel punto di massima tensione dell'asse di frassino: la struttura schiocca e si spezza a metà, lasciando il carro irrimediabilmente inservibile. Il mercante vi copre di insulti e maledizioni velenose.",
                        stat: "int", cd: 8,
                        reward: { type: "relic", name: "Lasciapassare mercantile", desc: "Gli oggetti dai mercanti sono scontati di 3 monete" },
                        punishment: { type: "curse", name: "Rancore del Mercante", desc: "I mercanti futuri applicheranno un sovrapprezzo di 2 monete su ogni articolo", apply: () => activeCurses.push("Rancore del Mercante (+2 monete prezzi)") }
                    },
                    ponte_marcio: {
                        title: "Il ponte marcio",
                        desc: "La mulattiera si arresta di colpo sul ciglio di una gola impressionante, in fondo alla quale infuriano le rapide spumose di un fiume montano. L'unico collegamento con la sponda opposta è una passerella di corda e assi di conifera, palesemente abbandonata da anni. Il legno è annerito dall'umidità, molte traversine mancano del tutto e i canapi portanti appaiono sfilacciati dal vento implacabile che risale dal fondovalle. Attraversare alla cieca significa precipitare nel vuoto.",
                        ignoreText: "Il buon senso prevale sulla fretta. Voltate le spalle al precipizio e vi preparate a risalire la gola per ore alla ricerca di un guado sicuro a monte.",
                        successText: "Esaminate attentamente la tensione dei cavi e la consistenza delle fibre legnose, individuando con esattezza le sole assi ancora ancorate ai travetti di sostegno. Guidate i compagni passo dopo passo, facendoli procedere a intervalli regolari senza generare oscillazioni pericolose. Alla fine del ponte trovate una pietra incisa di rune antiche.",
                        failText: "Una trave all'apparenza solida si polverizza sotto il peso di uno scarpone. Nel disperato tentativo di non cadere vi aggrappate alle corde sfilacciate, ma lo strattone disorienta la squadra.",
                        stat: "int", cd: 8,
                        reward: { type: "relic", name: "Pietra del focolare", desc: "Durante il riposo rimuove una maledizione casuale" },
                        punishment: { type: "injury", name: "Marcia estenuante", desc: "Tutti i membri del party subiscono 1 danno immediato agli HP", apply: () => party.forEach(h => h.hp = Math.max(1, h.hp - 1)) }
                    },
                    strada_scompare: {
                        title: "La strada scompare",
                        desc: "Il sentiero battuto entra in una vasta pianura di pietrisco e detriti alluvionali per poi svanire completamente, cancellato da una frana recente. Davanti a voi si estende una distesa informe avvolta da un banco di nebbia lattiginosa che toglie ogni punto di riferimento; l'aria fredda fa eco a rumori ingannevoli di ciottoli che rotolano, e ovunque si aprono inghiottitoi e sabbie mobili argillose pronti a inghiottire chiunque metta un piede fuori posto.",
                        ignoreText: "Senza una rotta chiara è follia avventurarsi nel grigiore. Decidete di accamparvi alla cieca sperando che il sole del pomeriggio dissipi la foschia.",
                        successText: "Con metodo e sangue freddo, analizzate la granulometria dei detriti, l'orientamento delle striature sulle rocce levigate dall'antico passaggio dell'acqua e la direzione delle correnti d'aria fredda, ricostruendo fedelmente la direttrice originale fino a sbucare dall'altra parte della gola.",
                        failText: "Seguite un falso avvallamento che vi conduce dritti dentro un pantano ingannevole. Camminate in cerchio per ore nel gelo della nebbia, sprofondando nel fango fino alle ginocchia prima di ritrovare la riva.",
                        stat: "int", cd: 9,
                        reward: { type: "relic", name: "Frammento di matrice", desc: "La prossima sfida fallita diventa un successo, poi si rompe" },
                        punishment: { type: "injury", name: "Marcia estenuante", desc: "Tutti i membri del party subiscono 1 danno immediato agli HP", apply: () => party.forEach(h => h.hp = Math.max(1, h.hp - 1)) }
                    },
                    pedaggio: {
                        title: "Il pedaggio",
                        desc: "Una solida palizzata di tronchi appuntiti sbarra la gola nel suo punto più stretto. Da una torretta improvvisata scendono quattro individui corazzati con piastre arrugginite. In un attimo venite circondati da almeno altri 10 uomini che impugnano balestre cariche. I quattro uomini di fronte a voi esibiscono pergamene con sigilli di ceralacca consunti. Con tono perentorio e mani sulle impugnature, dichiarano di riscuotere il 'Tributo di Pace della Frontiera' per ogni viaggiatore armato, chiedendo un pedaggio in oro.",
                        ignoreText: "Non intendete fare accordi con briganti travestiti da guardie né rischiare frecce nella schiena; fate dietrofront cercando un valico montano impervio.",
                        successText: "Con sguardo glaciale analizzate la pergamena, notando che lo stemma feudale impresso nella cera appartiene a una casata palesemente inventata e che i formulari giuridici sono pieni di errori grossolani. Esponete la truffa con tale precisione normativa e sicurezza che i malviventi, intimoriti dalle vostre conoscenze, abbassano la sbarra ed in cambio del vostro silenzio vi offrono un antico amuleto.",
                        failText: "Vi impappinate nel contestare le ordinanze e mostrate insicurezza: i falsi gabellieri mangiano la foglia, diventano aggressivi e vi intimoriscono con le balestre spianate, pretendendo il doppio della somma come sanzione per oltraggio.",
                        stat: "int", cd: 9,
                        reward: { type: "relic", name: "Dente del grande lupo", desc: "Dopo ogni scontro l'eroe con meno HP recupera 1 HP" },
                        punishment: { type: "penalty", name: "Pedaggio forzato", desc: "Perdete immediatamente 12 monete d'oro dal fondo comune", apply: () => partyCoins = Math.max(0, partyCoins - 12) }
                    },

                    // FEDE (8)
                    guerriero_morto_neve: {
                        title: "Il guerriero morto nella neve",
                        desc: "Ai piedi di un abete monumentale, quasi del tutto sepolto da un cumulo di neve fresca e aghi di pino, siede il cadavere intatto di un cavaliere errante. La cotta di maglia è intessuta di brina e le labbra sono serrate in una smorfia serena. Tra i guanti d'arme congelati stringe al petto un reliquiario d'argento cesellato, mentre la sua spada giace piantata a terra come una croce solitaria. L'aria attorno a lui è straordinariamente immobile, priva persino del fischio del vento.",
                        ignoreText: "La terra è dura come il ferro e scavare una fossa con questo gelo spezzerebbe solo le vostre lame. Lasciate che la neve continui il suo lavoro e passate oltre.",
                        successText: "Vi inginocchiate nel fango gelato e intonate l'inno di accompagnamento per le anime dei combattenti solitari mentre preparate una pira funeraria. Quando terminate la litania, una tenue luce illumina il reliquiario e una calda pace interiore scaccia i brividi del freddo.",
                        failText: "Tentate di sfilare il reliquiario con impazienza prima ancora di aver reso omaggio al caduto. Le dita rigide del cavaliere sembrano serrare la presa, un soffio di gelo spettrale investe l'intero gruppo e la statuetta sacra si scheggia sul selciato.",
                        stat: "fth", cd: 7,
                        reward: { type: "relic", name: "Frammento di Yr-Drazul", desc: "+1 a tutti i tiri di dado" },
                        punishment: { type: "curse", name: "Sacrilego", desc: "-1 Fede a tutti i membri del party", apply: () => { activeCurses.push("Sacrilego (-1 Fede)"); party.forEach(h => h.fth = Math.max(0, h.fth - 1)); } }
                    },
                    pellegrino: {
                        title: "Il pellegrino",
                        desc: "Seduto sopra una pietra liscia al bordo del sentiero c'è un vecchio pellegrino in abiti di lana grezza consumata. Le sue caviglie sono tumefatte dal cammino e la pelle del volto è arsa dalle intemperie, ma i suoi occhi trasmettono una calma solenne e profonda. Regge una ciotola di legno incisa con simboli liturgici e, scorgendovi, alza lo sguardo mormorando debolmente una richiesta di comunione spirituale prima che le sue forze lo abbandonino del tutto.",
                        ignoreText: "Non avete provviste né parole da sprecare per chi si è incamminato a morire su queste strade desolate. Tirate dritto distogliendo lo sguardo.",
                        successText: "Vi fermate, condividete con lui un sorso d'acqua pura e recitate insieme i versetti sacri, unendo i vostri respiri nella litania. Prima di congedarsi, il vecchio vi traccia una croce di cenere benedetta sulla fronte, infondendo protezione a tutta la compagnia.",
                        failText: "La vostra preghiera è frettolosa, meccanica e distratta dalla fretta di ripartire. Il pellegrino percepisce l'ipocrisia del gesto, scuote mestamente la testa e rovescia la ciotola nel fango: un senso di pesantezza grava sullo spirito di tutti.",
                        stat: "fth", cd: 7,
                        reward: { type: "relic", name: "Favore di Valgoren", desc: "Quando un eroe recupera HP, cura 1 HP ad un altro eroe casuale" },
                        punishment: { type: "curse", name: "Fede Inaridita", desc: "Durante le prove di fede tira due dadi e usa il risultato più basso", apply: () => activeCurses.push("Fede Inaridita (Svantaggio prove Fede)") }
                    },
                    cavallo_senza_cavaliere: {
                        title: "Il cavallo senza cavaliere",
                        desc: "Una maestosa giumenta da guerra nera come la pece, con la sella sfondata e la testiera strappata, galoppa nervosamente in una radura circondata da tronchi bruciati. La bestia ha le narici dilatate, schiuma bianca alla bocca e gli occhi iniettati di terrore: fissa l'oscurità della macchia ringhiando quasi come un cane da caccia e calpesta furente il terreno. Qualcosa di empio o demoniaco ha massacrato il suo cavaliere poco lontano e il terrore la rende pronta a sventrare chiunque provi ad avvicinarsi.",
                        ignoreText: "Gli zoccoli ferrati di quel destriero potrebbero sfondare una corazza d'acciaio. Vi muovete rasentando gli alberi dal lato opposto, lasciando che la fiera si sfoghi da sola.",
                        successText: "Avanzate a mani nude, senza toccare le armi, modulando la voce sui toni calmi e profondi degli antichi canti di pacificazione dei boschi. Con fede incrollabile poggiate il palmo sulla fronte sudata dell'animale: il terrore svanisce all'istante, la giumenta china il capo e vi consente di recuperare le sacche da sella intatte del suo precedente padrone.",
                        failText: "Il vostro canto tradisce un tremito di paura collettiva. La bestia percepisce l'esitazione come una minaccia, nitrisce furibonda e carica il gruppo, travolgendoli e ferendo i compagni prima di fuggire nella boscaglia.",
                        stat: "fth", cd: 8,
                        reward: { type: "relic", name: "Idolo del cacciatore", desc: "+1 al danno durante gli scontri elite" },
                        punishment: { type: "injury", name: "Carica violenta", desc: "Tutti i membri del party subiscono 1 danno immediato agli HP", apply: () => party.forEach(h => h.hp = Math.max(1, h.hp - 1)) }
                    },
                    cappella_viandante: {
                        title: "La cappella del viandante",
                        desc: "Una minuscola edicola votiva in blocchi di tufo si affaccia sul sentiero, parzialmente sventrata dal passaggio recente di sciacalli. L'icona in legno della divinità tutelare è stata strappata dalla nicchia e gettata nel fango, l'acquasantiera è colma di foglie marce e le offerte di grano e cera sono state calpestate con disprezzo sacrilego. L'atmosfera all'interno della volta è opprimente, intrisa del fetore rancido della profanazione.",
                        ignoreText: "Non è compito vostro riconsacrare gli altari abbattuti in tempo di guerra. Vi segnate rapidamente e accelerate il passo per non attardare la marcia.",
                        successText: "Ripulite con devozione la nicchia, rimettete al suo posto l'icona ripulita dal fango e accendete un piccolo cero recitando la formula di riparazione sacra. L'aria si fa d'improvviso tersa, profumata di mirra e resina, e una calda benedizione ristora le membra stanche del gruppo.",
                        failText: "Nel rimettere mano all'altare pronunciate le formule sacre in modo confuso e disordinato. Una folata di vento putrido spegne la fiamma e frantuma l'icona in legno: la profanazione del luogo ricade negativamente sull'intera carovana.",
                        stat: "fth", cd: 9,
                        reward: { type: "relic", name: "Occhio del corvo", desc: "Diminuisce di 1 la statistica attacco dei mostri" },
                        punishment: { type: "curse", name: "Presagio di Morte", desc: "La Morte vi dà la caccia: aumenta tutti i danni subiti di 1", apply: () => activeCurses.push("Presagio di Morte (+1 danno subito)") }
                    },
                    sentiero_rune: {
                        title: "Il sentiero delle rune",
                        desc: "Per una cinquantina di passi la mulattiera si trasforma in un basolato cerimoniale arcaico: lastre di basalto nero su cui sono incise profonde rune d'interdizione consacrate a spiriti antichi. Chiunque calpesti quelle pietre con animo empio o pensieri d'orgoglio viene sopraffatto da un senso vertiginoso di nausea, ronzii metallici nelle orecchie e un terrore cieco che spinge alla fuga disordinata.",
                        ignoreText: "Aggirate il tratto lastricato facendovi largo a colpi di lama tra un intrico spinoso e ripido, spendendo tempo prezioso pur di evitare il selciato.",
                        successText: "Recitate ad alta voce le antiche parole di sottomissione e riverenza alle forze del caos primordiale, muovendovi a piedi nudi e a capo chino lungo la linea mediana delle rune. Il basalto sotto di voi emana un piacevole tepore benefico e le incisioni brillano di una flebile luce azzurrina che infonde vigore alle vostre menti.",
                        failText: "La concentrazione del gruppo si spezza sotto il peso del dubbio; un senso improvviso di claustrofobia e terrore viscerale assale la carovana, lasciandovi storditi e con la mente offuscata.",
                        stat: "fth", cd: 9,
                        reward: { type: "relic", name: "Anello del giuramento", desc: "+3 al tiro per la prossima sfida, poi la reliquia si rompe" },
                        punishment: { type: "curse", name: "Tormento Mentale", desc: "-1 a Intelligenza a tutta la compagnia", apply: () => { activeCurses.push("Tormento Mentale (-1 Int)"); party.forEach(h => h.int = Math.max(0, h.int - 1)); } }
                    },
                    forca_crocevia: {
                        title: "La forca al crocevia",
                        desc: "Dove quattro sentieri si incrociano in mezzo a una brughiera brulla, sorge un'alta forca di quercia annerita dal fuoco. Tre corpi senza nome pendono dalle corde oscillando pesantemente al vento gelido: sono stati lasciati lì come macabro monito militare e le loro bocche spalancate sembrano ancora urlare in silenzio. Attorno all'albero l'erba è morta e un ronzio inquietante di sussurri spettrali turba i sensi di chiunque si avvicini al crocevia.",
                        ignoreText: "Distogliete lo sguardo da quello scempio, vi tappate le orecchie per non ascoltare il cigolio delle corde e accelerate il passo oltre il quadrivio.",
                        successText: "Con passo solenne vi portate sotto i cappi, componete i corpi per quanto possibile e intonate l'antico esorcismo di liberazione dei morti insepolti, tracciando con la cenere un cerchio di requie. I sussurri si placano all'istante, le corde tacciono e una sensazione di protezione avvolge le vostre lame.",
                        failText: "L'orrore della scena paralizza la compagnia e la litania si trasforma in un balbettio collettivo. L'inquietudine degli impiccati si lega alla psiche del gruppo: una cappa di angoscia opprime tutti i membri.",
                        stat: "fth", cd: 9,
                        reward: { type: "relic", name: "Marchio di Jag Antar", desc: "Se un eroe viene ridotto a 0 HP, rimane a 1 HP, poi si rompe" },
                        punishment: { type: "curse", name: "Ombra sul Cuore", desc: "-1 a Fede a tutta la compagnia", apply: () => { activeCurses.push("Ombra sul Cuore (-1 Fede)"); party.forEach(h => h.fth = Math.max(0, h.fth - 1)); } }
                    },
                    rifugio_abbandonato: {
                        title: "Il rifugio abbandonato",
                        desc: "Una capanna di cacciatori mezza divelta dal gelo sporge da un costone roccioso. La porta è scardinata, ma all'interno l'occhio esperto nota che le assi del pavimento nascondono un meccanismo di trappole a scatto rudimentali, montate con corde tese e falci da fieno per proteggere una botola interrata.",
                        ignoreText: "La capanna sembra troppo instabile e il rischio di far scattare una tagliola o far crollare il tetto non vale la pena; proseguite lungo la cresta.",
                        successText: "Esaminando con attenzione la tensione dei fili e i contrappesi di piombo, disarmate le trappole a forbice una dopo l'altra. Nella botola asciutta trovate provviste intatte e un antico manufatto intagliato.",
                        failText: "Tranciate la corda sbagliata: una sbarra uncinata scatta con violenza schiaffeggiando il gruppo ed emettendo un fragore metallico che disorienta la spedizione.",
                        stat: "int", cd: 8,
                        reward: { type: "relic", name: "Sigillo runico", desc: "+2 al tiro delle prossime 2 prove, poi si rompe" },
                        punishment: { type: "injury", name: "Marcia estenuante", desc: "Tutti i membri del party subiscono 1 danno immediato agli HP", apply: () => party.forEach(h => h.hp = Math.max(1, h.hp - 1)) }
                    },
                    cippo_giuramento: {
                        title: "Il cippo del giuramento",
                        desc: "Al centro di una radura battuta dal vento sorge un mucchio di pietre consacrate attorno a una vecchia insegna militare spezzata. Su di essa sono ancora legati nastri votivi scoloriti, lasciati da guardie e viandanti prima di affrontare i passi montani per chiedere la clemenza del cielo.",
                        ignoreText: "I vecchi dei della strada non fermeranno il gelo né le lame; tirate dritto senza perdere tempo in devozioni.",
                        successText: "Riannodate i nastri votivi, recitate il giuramento del pellegrino e ponete un sasso in cima al tumulo in segno di rispetto. Un senso di incrollabile fermezza e sollievo spirituale si posa sulla compagnia.",
                        failText: "Durante la deposizione del sasso, un gesto distratto fa franare l'intero cumulo sul fango. Il silenzio che segue è cupo e accusatorio, lasciando la carovana priva di conforto.",
                        stat: "fth", cd: 8,
                        reward: { type: "relic", name: "Lanterna dei morti", desc: "+1 permanente alla caratteristica Fede di tutti gli eroi", apply: () => party.forEach(h => h.fth += 1) },
                        punishment: { type: "curse", name: "Sacrilego", desc: "-1 Fede a tutti i membri del party", apply: () => { activeCurses.push("Sacrilego (-1 Fede)"); party.forEach(h => h.fth = Math.max(0, h.fth - 1)); } }
                    }
                },

                // Descrizione uniforme del mercante per tutti i 7 nodi
                merchants: {
                    default: "Al ciglio della strada scorgete un carretto coperto da teli cerati, trainato da un mulo paziente e stipato di bauli, gabbie e cianfrusaglie. Un mercante viandante, avvolto in un pastrano consumato da mille viaggi, vi accoglie con un sorriso d'intesa sollevando una mano. Gira queste terre desolate da anni barattando arnesi, erbe e ferri forgiati con chiunque abbia monete buone da spendere."
                },

                // Descrizione uniforme del riposo per tutti i 6 nodi
                rests: {
                    default: "Trovate un angolo di pace in mezzo alla natura selvaggia: la quiete della radura vi ricorda all'improvviso tutto il peso e la stanchezza che vi portate sulle spalle. Accendete un piccolo focolare protetto dal vento e vi fermate a riscaldare corpo e spirito, raccogliendo le forze prima di rimettervi in marcia lungo il sentiero."
                },

                treasures: {},

                // CATALOGO COMPLETO OGGETTI PER RARITÀ
                lootItems: [
                    // COMUNI
                    { id: "pugnale_rapido", name: "Pugnale Rapido", rarity: "comune", str: 1, desc: "+1 Forza" },
                    { id: "ascia_taglialegna", name: "Ascia da Taglialegna", rarity: "comune", dmg: 1, desc: "+1 Danno" },
                    { id: "bastone_rinforzato", name: "Bastone Rinforzato", rarity: "comune", help_bonus_val: 1, desc: "+1 Tiro Aiuto" },
                    { id: "scudo_legno", name: "Scudo Tondo di Legno", rarity: "comune", def_bonus: 1, desc: "+1 Tiro Difesa" },
                    { id: "corazza_cuoio", name: "Corazza di Cuoio Bollito", rarity: "comune", armor: 1, desc: "+1 Armatura" },
                    { id: "amuleto_legno_santo", name: "Amuleto di Legno Santo", rarity: "comune", fth: 1, desc: "+1 Fede" },
                    { id: "taccuino_cartografo", name: "Taccuino del Cartografo", rarity: "comune", int: 1, desc: "+1 Intelligenza" },
                    { id: "balsamo_curativo", name: "Balsamo Lenitivo", rarity: "comune", type: "consumable_heal", heal_val: 2, desc: "Consumabile: Cura 2 HP" },

                    // RARI
                    { id: "spada_norgrad", name: "Spada di Norgrad", rarity: "raro", str: 1, dmg: 1, desc: "+1 Forza, +1 Danno" },
                    { id: "alabarda_guardia", name: "Alabarda da Guardia", rarity: "raro", str: 1, help_bonus_val: 1, desc: "+1 Forza, +1 Tiro Aiuto" },
                    { id: "mannaia_pesante", name: "Mannaia Pesante", rarity: "raro", dmg: 2, att_penalty: 1, desc: "+2 Danni, -1 al tiro per Colpire" },
                    { id: "scudo_ferro", name: "Scudo Rinforzato in Ferro", rarity: "raro", armor: 1, def_bonus: 1, desc: "+1 Armatura, +1 Tiro Difesa" },
                    { id: "corazza_scaglie", name: "Corazza a Scaglie", rarity: "raro", armor: 2, att_penalty: 1, desc: "+2 Armatura, -1 al tiro per Colpire" },
                    { id: "tomo_proibito", name: "Tomo della Conoscenza Proibita", rarity: "raro", int: 2, desc: "+2 Intelligenza" },
                    { id: "reliquiario_tascabile", name: "Reliquiario Tascabile", rarity: "raro", fth: 2, desc: "+2 Fede" },
                    { id: "pozione_rigenerazione", name: "Pozione di Rigenerazione", rarity: "raro", type: "consumable_full", desc: "Consumabile: Ripristina 100% HP" },
                    { id: "unguento_fortificante", name: "Unguento Fortificante", rarity: "raro", type: "consumable_heal", heal_val: 3, desc: "Consumabile: Cura 3 HP" },

                    // EPICI
                    { id: "lama_acciaio_lunare", name: "Lama d'Acciaio Lunare", rarity: "epico", str: 2, dmg: 1, desc: "+2 Forza, +1 Danno" },
                    { id: "martello_breccia", name: "Martello della Breccia", rarity: "epico", dmg: 3, att_penalty: 1, desc: "+3 Danni, -1 al tiro per Colpire" },
                    { id: "gorgiera_veterano", name: "Gorgiera del Veterano", rarity: "epico", armor: 2, def_bonus: 1, desc: "+2 Armatura, +1 Tiro Difesa" },
                    { id: "corazza_piastre_leone", name: "Corazza a Piastre del Leone", rarity: "epico", armor: 3, att_penalty: 1, desc: "+3 Armatura, -1 al tiro per Colpire" },
                    { id: "cappa_sussurri", name: "Cappa dei Sussurri Antichi", rarity: "epico", fth: 2, int: 1, help_bonus_val: 1, desc: "+2 Fede, +1 Intelligenza, +1 Aiuto" },
                    { id: "simbolo_jag_antar", name: "Simbolo Primordiale di Jag Antar", rarity: "epico", fth: 2, str: 1, desc: "+2 Fede, +1 Forza" },
                    { id: "elisir_sangue_vivo", name: "Elisir di Sangue Vivo", rarity: "epico", type: "consumable_full", desc: "Consumabile: Ripristina tutti gli HP" }
                ],

                // SCALATA: 16 LIVELLI (0-15), INIZIA CON SCONTRO, LIVELLO 14 RIPOSO GARANTITO, LIVELLO 15 BOSS
                mapNodes: [
                    // Livello 0 (Partenza: 2 nodi SCONTRO)
                    { id: 0, level: 0, x: 300, type: "combat", enemy: "banditi_strada", title: "Livello 1 - Scontro Ovest", icon: "🗡️", done: false, active: true, next: [2, 3], image: "immagini/banditi_strada.jpg" },
                    { id: 1, level: 0, x: 500, type: "combat", enemy: "cani_caccia", title: "Livello 1 - Scontro Est", icon: "🗡️", done: false, active: true, next: [3, 4], image: "immagini/cani_caccia.jfif" },

                    // Livello 1 (3 nodi)
                    { id: 2, level: 1, x: 250, type: "challenge", challengeId: "carro_rovesciato", title: "Livello 2 - Sfida", icon: "❓", done: false, active: false, next: [5], image: "immagini/sfida.jpg" },
                    { id: 3, level: 1, x: 400, type: "combat", enemy: "sciacalli_cadaveri", title: "Livello 2 - Scontro", icon: "🗡️", done: false, active: false, next: [6, 7], image: "immagini/sciacalli_cadaveri.jpg" },
                    { id: 4, level: 1, x: 550, type: "merchant", merchantId: "default", title: "Livello 2 - Mercante", icon: "🪙", done: false, active: false, next: [7, 8], image: "immagini/mercante_viaggiatore.jpg" },

                    // Livello 2 (4 nodi)
                    { id: 5, level: 2, x: 200, type: "combat", enemy: "briganti_pedaggio", title: "Livello 3 - Scontro", icon: "🗡️", done: false, active: false, next: [9], image: "immagini/briganti_pedaggio.jpg" },
                    { id: 6, level: 2, x: 330, type: "rest", restId: "default", title: "Livello 3 - Riposo", icon: "⛺", done: false, active: false, next: [10], image: "immagini/riposo.jpg" },
                    { id: 7, level: 2, x: 470, type: "challenge", challengeId: "guerriero_morto_neve", title: "Livello 3 - Sfida", icon: "❓", done: false, active: false, next: [10], image: "immagini/guerriero_morto_neve.jpg" },
                    { id: 8, level: 2, x: 600, type: "combat", enemy: "cinghiali_pietraie", title: "Livello 3 - Scontro", icon: "🗡️", done: false, active: false, next: [11], image: "immagini/scontro_cinghiali.jpg" },

                    // Livello 3 (3 nodi)
                    { id: 9, level: 3, x: 260, type: "merchant", merchantId: "default", title: "Livello 4 - Mercante", icon: "🪙", done: false, active: false, next: [12, 13], image: "immagini/mercante_viaggiatore.jpg" },
                    { id: 10, level: 3, x: 400, type: "elite", enemy: "capitano_predoni", title: "Livello 4 - Capitano dei Predoni", icon: "👹", done: false, active: false, next: [13, 14], image: "immagini/capitano_predoni.jpg" },
                    { id: 11, level: 3, x: 540, type: "rest", restId: "default", title: "Livello 4 - Riposo", icon: "⛺", done: false, active: false, next: [13, 14], image: "immagini/riposo.jpg" },

                    // Livello 4 (3 nodi)
                    { id: 12, level: 4, x: 260, type: "challenge", challengeId: "pietra_miliare", title: "Livello 5 - Sfida", icon: "❓", done: false, active: false, next: [15, 16], image: "immagini/pietra_miliare.jpg" },
                    { id: 13, level: 4, x: 400, type: "combat", enemy: "branco_lupi", title: "Livello 5 - Scontro", icon: "🗡️", done: false, active: false, next: [16, 17], image: "immagini/branco_lupi.jpg" },
                    { id: 14, level: 4, x: 540, type: "challenge", challengeId: "pellegrino", title: "Livello 5 - Sfida", icon: "❓", done: false, active: false, next: [17, 18], image: "immagini/pellegrino.jpg" },

                    // Livello 5 (4 nodi)
                    { id: 15, level: 5, x: 200, type: "combat", enemy: "disertori", title: "Livello 6 - Scontro", icon: "🗡️", done: false, active: false, next: [19], image: "immagini/disertori.jpg" },
                    { id: 16, level: 5, x: 330, type: "merchant", merchantId: "default", title: "Livello 6 - Mercante", icon: "🪙", done: false, active: false, next: [19], image: "immagini/mercante_viaggiatore.jpg" },
                    { id: 17, level: 5, x: 470, type: "rest", restId: "default", title: "Livello 6 - Riposo", icon: "⛺", done: false, active: false, next: [20], image: "immagini/riposo.jpg" },
                    { id: 18, level: 5, x: 600, type: "combat", enemy: "esploratori_predoni", title: "Livello 6 - Scontro", icon: "🗡️", done: false, active: false, next: [20], image: "immagini/esploratori_predoni.jpg" },

                    // Livello 6 (2 nodi - Bivio Elite)
                    { id: 19, level: 6, x: 300, type: "elite", enemy: "tremabosco", title: "Livello 7 - Tremabosco Striato", icon: "👹", done: false, active: false, next: [21, 22], image: "immagini/tremabosco.jpg" },
                    { id: 20, level: 6, x: 500, type: "elite", enemy: "mastino_bokgar", title: "Livello 7 - Mastino di Bokgar", icon: "👹", done: false, active: false, next: [22, 23], image: "immagini/mastino_bogkar.jpg" },

                    // Livello 7 (3 nodi)
                    { id: 21, level: 7, x: 260, type: "rest", restId: "default", title: "Livello 8 - Riposo", icon: "⛺", done: false, active: false, next: [24], image: "immagini/riposo.jpg" },
                    { id: 22, level: 7, x: 400, type: "merchant", merchantId: "default", title: "Livello 8 - Mercante", icon: "🪙", done: false, active: false, next: [25, 26], image: "immagini/mercante_viaggiatore.jpg" },
                    { id: 23, level: 7, x: 540, type: "challenge", challengeId: "cavallo_senza_cavaliere", title: "Livello 8 - Sfida", icon: "❓", done: false, active: false, next: [27], image: "immagini/cavallo_senza_cavaliere.jpg" },

                    // Livello 8 (4 nodi)
                    { id: 24, level: 8, x: 200, type: "challenge", challengeId: "mercante_bloccato", title: "Livello 9 - Sfida", icon: "❓", done: false, active: false, next: [28], image: "immagini/mercante_bloccato.jpg" },
                    { id: 25, level: 8, x: 330, type: "combat", enemy: "predoni", title: "Livello 9 - Scontro", icon: "🗡️", done: false, active: false, next: [28, 29], image: "immagini/predoni.jpg" },
                    { id: 26, level: 8, x: 470, type: "challenge", challengeId: "cappella_viandante", title: "Livello 9 - Sfida", icon: "❓", done: false, active: false, next: [29, 30], image: "immagini/cappella_viandante.jpg" },
                    { id: 27, level: 8, x: 600, type: "combat", enemy: "orso_bruno", title: "Livello 9 - Scontro", icon: "🗡️", done: false, active: false, next: [30], image: "immagini/orso_bruno.jpg" },

                    // Livello 9 (3 nodi)
                    { id: 28, level: 9, x: 260, type: "combat", enemy: "balestrieri_disertori", title: "Livello 10 - Scontro", icon: "🗡️", done: false, active: false, next: [31], image: "immagini/balestrieri_disertori.jpg" },
                    { id: 29, level: 9, x: 400, type: "merchant", merchantId: "default", title: "Livello 10 - Mercante", icon: "🪙", done: false, active: false, next: [32], image: "immagini/mercante_viaggiatore.jpg" },
                    { id: 30, level: 9, x: 540, type: "challenge", challengeId: "ponte_marcio", title: "Livello 10 - Sfida", icon: "❓", done: false, active: false, next: [32, 33], image: "immagini/ponte_marcio.jpg" },

                    // Livello 10 (3 nodi)
                    { id: 31, level: 10, x: 260, type: "challenge", challengeId: "sentiero_rune", title: "Livello 11 - Sfida", icon: "❓", done: false, active: false, next: [34, 35], image: "immagini/sentiero_rune.jpg" },
                    { id: 32, level: 10, x: 400, type: "combat", enemy: "picchieri_sbandati", title: "Livello 11 - Scontro", icon: "🗡️", done: false, active: false, next: [35, 36], image: "immagini/picchieri_sbandati.jpg" },
                    { id: 33, level: 10, x: 540, type: "challenge", challengeId: "strada_scompare", title: "Livello 11 - Sfida", icon: "❓", done: false, active: false, next: [36, 37], image: "immagini/strada_scompare.jpg" },

                    // Livello 11 (4 nodi)
                    { id: 34, level: 11, x: 200, type: "merchant", merchantId: "default", title: "Livello 12 - Mercante", icon: "🪙", done: false, active: false, next: [38], image: "immagini/mercante_viaggiatore.jpg" },
                    { id: 35, level: 11, x: 330, type: "combat", enemy: "fabbro_rinnegato", title: "Livello 12 - Scontro", icon: "🗡️", done: false, active: false, next: [38, 39], image: "immagini/fabbro_rinnegato.jpg" },
                    { id: 36, level: 11, x: 470, type: "challenge", challengeId: "forca_crocevia", title: "Livello 12 - Sfida", icon: "❓", done: false, active: false, next: [39, 40], image: "immagini/forca_crocevia.jpg" },
                    { id: 37, level: 11, x: 600, type: "combat", enemy: "cani_corsi", title: "Livello 12 - Scontro", icon: "🗡️", done: false, active: false, next: [40], image: "immagini/cani_corsi.jpg" },

                    // Livello 12 (3 nodi - 4° Elite)
                    { id: 38, level: 12, x: 260, type: "elite", enemy: "boia_rinnegati", title: "Livello 13 - Boia dei Rinnegati", icon: "👹", done: false, active: false, next: [41], image: "immagini/boia_rinnegati.jpg" },
                    { id: 39, level: 12, x: 400, type: "challenge", challengeId: "pedaggio", title: "Livello 13 - Sfida", icon: "❓", done: false, active: false, next: [41, 42], image: "immagini/pedaggio.jpg" },
                    { id: 40, level: 12, x: 540, type: "rest", restId: "default", title: "Livello 13 - Riposo", icon: "⛺", done: false, active: false, next: [42], image: "immagini/riposo.jpg" },

                    // Livello 13 (2 nodi)
                    { id: 41, level: 13, x: 320, type: "challenge", challengeId: "rifugio_abbandonato", title: "Livello 14 - Sfida", icon: "❓", done: false, active: false, next: [43, 44], image: "immagini/rifugio_abbandonato.jpg" },
                    { id: 42, level: 13, x: 480, type: "challenge", challengeId: "cippo_giuramento", title: "Livello 14 - Sfida", icon: "❓", done: false, active: false, next: [43, 44], image: "immagini/cippo_giuramento.jpg" },

                    // Livello 14 (2 nodi - RIPOSO OBBLIGATORIO PRIMA DEL BOSS)
                    { id: 43, level: 14, x: 320, type: "rest", restId: "default", title: "Livello 15 - Ultimo Bivacco Ovest", icon: "⛺", done: false, active: false, next: [45], image: "immagini/riposo.jpg" },
                    { id: 44, level: 14, x: 480, type: "rest", restId: "default", title: "Livello 15 - Ultimo Bivacco Est", icon: "⛺", done: false, active: false, next: [45], image: "immagini/riposo.jpg" },

                    // Livello 15 (BOSS FINALE)
                    { id: 45, level: 15, x: 400, type: "combat", enemy: "hungrabarn", title: "Livello 16 - Hungrabarn (Boss)", icon: "👑", done: false, active: false, next: [], image: "immagini/hungrabarn.jpg" }
                ]
            }
        };

        /* ==========================================================================
           STATO GLOBALE RUNTIME
           ========================================================================== */
        let currentCampaign = null;
        let stsMapNodes = [];
        let enemies = {};
        let challengesData = {};
        let restsData = {};
        let merchantsData = {};
        let treasuresData = {};

        let campaignHeroes = [];
        let campaignAbilities = {};
        let campaignArmory = [];

        let partySize = 3;
        let party = [];
        let partyCoins = 0;
        let unlockedRelics = [];
        let activeCurses = [];
        let currentNodeId = null;
        let challengeState = null;

        // Stato della presentazione: schermata attiva, fase e round del combattimento, statistiche
        let currentScreenId = 'screenStart';
        let combatPhase = 'none';
        let combatRound = 0;
        const newExpeditionStats = () => ({ combatsWon: 0, challengesPassed: 0, challengesFailed: 0, coinsEarned: 0, itemsFound: 0 });
        let expeditionStats = newExpeditionStats();
	function hasRelic(relicName) {
    return unlockedRelics.some(r => r.name === relicName);
}

function breakRelic(relicName) {
    const idx = unlockedRelics.findIndex(r => r.name === relicName);
    if (idx > -1) {
        unlockedRelics.splice(idx, 1);
        updatePartyStatusBars();
    }
}
	


        let gameItems = [
            { id: "spada_affilata", name: "Spada affilata", str: 1, dmg: 1, desc: "+1 Forza, +1 Danno" },
            { id: "ascia_pesante", name: "Ascia pesante", dmg: 2, desc: "+2 Danni" },
            { id: "armatura_leggera_loot", name: "Armatura leggera", armor: 1, desc: "+1 Armatura" },
            { id: "armatura_pesante_loot", name: "Armatura pesante", armor: 2, att_penalty: 1, desc: "+2 Armatura, -1 Tiro Attacco" },
            { id: "pozione", name: "Pozione di guarigione", type: "consumable_full", desc: "Consumabile: Recupera 100% HP" },
            { id: "amuleto", name: "Amuleto sacro", fth: 1, desc: "+1 Fede" },
            { id: "anello", name: "Anello della concentrazione", int: 1, desc: "+1 Intelligenza" },
            { id: "scudo_pesante", name: "Scudo pesante", armor: 1, def_bonus: 1, desc: "+1 Armatura, +1 Tiro Difesa" }
        ];

        /* ==========================================================================
           SISTEMA DI SALVATAGGIO / CARICAMENTO (LOCALSTORAGE)
           ========================================================================== */
        function checkSavedGame() {
            const saved = localStorage.getItem("dignitas_savegame");
            const btn = document.getElementById("btnContinueSavedGame");
            if (saved && btn) {
                btn.classList.remove("hidden");
            }
        }

        function saveGame() {
            if (!currentCampaign || party.length === 0) {
                alert("Non c'è nessuna partita in corso da salvare!");
                return;
            }

            const saveData = {
                campaignId: currentCampaign.id,
                party: party,
                partyCoins: partyCoins,
                unlockedRelics: unlockedRelics.map(r => ({ name: r.name, desc: r.desc })),
                activeCurses: activeCurses,
                stsMapNodes: stsMapNodes,
                currentNodeId: currentNodeId,
                expeditionStats: expeditionStats,
                timestamp: new Date().toLocaleString("it-IT")
            };

            try {
                localStorage.setItem("dignitas_savegame", JSON.stringify(saveData));
                alert(`Partita salvata con successo! (${saveData.timestamp})`);
                checkSavedGame();
            } catch (e) {
                alert("Errore durante il salvataggio: memoria piena o non disponibile.");
            }
        }

        function loadGame() {
            const rawSave = localStorage.getItem("dignitas_savegame");
            if (!rawSave) {
                alert("Nessun salvataggio trovato!");
                return;
            }

            try {
                const data = JSON.parse(rawSave);
                const rawCamp = campaignsDatabase[data.campaignId];
                if (!rawCamp) {
                    alert("Campagna del salvataggio non trovata nel database!");
                    return;
                }

                currentCampaign = JSON.parse(JSON.stringify(rawCamp));
                stsMapNodes = data.stsMapNodes;
                enemies = currentCampaign.enemies;
                challengesData = rawCamp.challenges;
                restsData = currentCampaign.rests;
                merchantsData = currentCampaign.merchants;
                treasuresData = currentCampaign.treasures;

                campaignHeroes = currentCampaign.heroes || [];
                campaignAbilities = rawCamp.abilities || {};
                campaignArmory = currentCampaign.initialArmory || [];

                party = data.party;
                partyCoins = data.partyCoins;
                activeCurses = data.activeCurses || [];
                expeditionStats = Object.assign(newExpeditionStats(), data.expeditionStats || {});
                displayedCoins = data.partyCoins;
                currentNodeId = data.currentNodeId;

                // Ricostruiamo i riferimenti alle funzioni per abilità e reliquie
                party.forEach(hero => {
                    if (hero.chosenAbility) {
                        const heroAbList = campaignAbilities[hero.name] || [];
                        const fullAb = heroAbList.find(a => a.name === hero.chosenAbility.name || a.id === hero.chosenAbility.id);
                        if (fullAb) hero.chosenAbility = fullAb;
                    }
                });

                unlockedRelics = (data.unlockedRelics || []).map(savedRelic => {
                    for (const k in challengesData) {
                        if (challengesData[k].reward && challengesData[k].reward.name === savedRelic.name) {
                            return challengesData[k].reward;
                        }
                    }
                    return savedRelic;
                });

                document.getElementById('mapCampaignHeader').textContent = `Mappa: ${currentCampaign.title}`;
                updatePartyStatusBars();
                startMap();
                alert(`Partita caricata con successo! Salvata il: ${data.timestamp}`);
            } catch (err) {
                alert("Errore durante il caricamento del file di salvataggio.");
                console.error(err);
            }
        }

        window.addEventListener('DOMContentLoaded', () => {
            checkSavedGame();
        });

        function goToCampaigns() {
            showScreen('screenCampaigns');
            const grid = document.getElementById('campaignsGridList');
            const campaigns = Object.values(campaignsDatabase);
            grid.innerHTML = campaigns.map((c, idx) => `
                <div class="campaign-card" tabindex="0" role="button" data-index="${idx}" onclick="onCampaignCardClick(${idx}, '${c.id}')" onkeydown="if(event.key==='Enter'){selectCampaign('${c.id}')}">
                    <div>
                        <div class="campaign-cover"><img src="${c.coverImage}" alt="${c.title}"></div>
                        <span class="campaign-badge">${c.badge}</span>
                        <h3>${c.title}</h3>
                        <p>${c.description}</p>
                    </div>
                    <button class="btn-small" tabindex="-1">Scegli Spedizione</button>
                </div>
            `).join('');

            document.getElementById('campaignDots').innerHTML = campaigns.map((c, idx) => `
                <button class="carousel-dot" onclick="goToCampaignSlide(${idx})" aria-label="${c.title}"></button>
            `).join('') + `<span class="carousel-counter" id="campaignCounter"></span>`;

            bindCampaignCarousel();
            activeCampaignSlide = 0;
            requestAnimationFrame(() => {
                grid.style.scrollBehavior = 'auto';
                goToCampaignSlide(0);
                grid.style.scrollBehavior = '';
            });
        }

        /* ---------- Carosello campagne ---------- */
        let activeCampaignSlide = 0;
        let campaignWheelLock = false;

        function campaignCards() {
            return Array.from(document.querySelectorAll('#campaignsGridList .campaign-card'));
        }

        function goToCampaignSlide(idx) {
            const track = document.getElementById('campaignsGridList');
            const cards = campaignCards();
            if (cards.length === 0) return;
            idx = Math.max(0, Math.min(cards.length - 1, idx));
            const card = cards[idx];
            track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2 });
            activeCampaignSlide = idx;
            updateCampaignCarouselState();
        }

        function scrollCampaigns(dir) {
            goToCampaignSlide(activeCampaignSlide + dir);
        }

        // Clic su una scheda laterale: la porta al centro; clic sulla scheda centrale: la sceglie
        function onCampaignCardClick(idx, campaignId) {
            if (idx !== activeCampaignSlide) {
                goToCampaignSlide(idx);
                return;
            }
            selectCampaign(campaignId);
        }

        function updateCampaignCarouselState() {
            const track = document.getElementById('campaignsGridList');
            const cards = campaignCards();
            if (cards.length === 0) return;

            const center = track.scrollLeft + track.clientWidth / 2;
            let nearest = 0;
            let bestDist = Infinity;
            cards.forEach((card, i) => {
                const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
                if (dist < bestDist) { bestDist = dist; nearest = i; }
            });
            activeCampaignSlide = nearest;

            cards.forEach((card, i) => card.classList.toggle('is-active', i === nearest));
            document.querySelectorAll('#campaignDots .carousel-dot').forEach((dot, i) => dot.classList.toggle('is-active', i === nearest));
            document.getElementById('campaignCounter').textContent = `${nearest + 1} / ${cards.length}`;
            document.getElementById('campaignPrev').disabled = nearest === 0;
            document.getElementById('campaignNext').disabled = nearest === cards.length - 1;
        }

        function bindCampaignCarousel() {
            const track = document.getElementById('campaignsGridList');
            if (track.dataset.bound) return;
            track.dataset.bound = 'true';

            let rafPending = false;
            track.addEventListener('scroll', () => {
                if (rafPending) return;
                rafPending = true;
                requestAnimationFrame(() => { rafPending = false; updateCampaignCarouselState(); });
            });

            // La rotella del mouse scorre di una campagna alla volta
            track.addEventListener('wheel', e => {
                const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
                if (Math.abs(delta) < 4) return;
                e.preventDefault();
                if (campaignWheelLock) return;
                campaignWheelLock = true;
                scrollCampaigns(delta > 0 ? 1 : -1);
                setTimeout(() => { campaignWheelLock = false; }, 450);
            }, { passive: false });

            window.addEventListener('resize', () => {
                if (!document.getElementById('screenCampaigns').classList.contains('hidden')) goToCampaignSlide(activeCampaignSlide);
            });

            document.addEventListener('keydown', e => {
                if (document.getElementById('screenCampaigns').classList.contains('hidden')) return;
                if (!document.getElementById('wc3Modal').classList.contains('hidden')) return;
                if (e.key === 'ArrowLeft') { e.preventDefault(); scrollCampaigns(-1); }
                else if (e.key === 'ArrowRight') { e.preventDefault(); scrollCampaigns(1); }
            });
        }

        function selectCampaign(campaignId) {
            const rawCamp = campaignsDatabase[campaignId];
            if(!rawCamp) return;

            currentCampaign = JSON.parse(JSON.stringify(rawCamp));

            stsMapNodes = currentCampaign.mapNodes;
            enemies = currentCampaign.enemies;
            // Le sfide vengono dal database originale: la copia JSON perderebbe le funzioni apply di reliquie e maledizioni
            challengesData = rawCamp.challenges;
            restsData = currentCampaign.rests;
            merchantsData = currentCampaign.merchants;
            treasuresData = currentCampaign.treasures;

            campaignHeroes = currentCampaign.heroes || [];
            campaignAbilities = rawCamp.abilities || {};
            campaignArmory = currentCampaign.initialArmory || [];

            if (currentCampaign.lootItems && currentCampaign.lootItems.length > 0) {
                gameItems = currentCampaign.lootItems;
            }

            document.getElementById('campaignIntroTitle').textContent = currentCampaign.title;
            document.getElementById('campaignIntroImg').src = currentCampaign.coverImage;
            document.getElementById('campaignIntroDesc').innerHTML = `<strong>Descrizione:</strong> ${currentCampaign.introText}`;
            document.getElementById('mapCampaignHeader').textContent = `Mappa: ${currentCampaign.title}`;

            setupPartySizeSelector();
            startPartyCreation();
        }

        function setupPartySizeSelector() {
            const sizeSelect = document.getElementById('partySizeSelect');
            const totalHeroes = campaignHeroes.length;
            const minSize = Math.min(3, totalHeroes);
            const maxSize = Math.min(5, totalHeroes);

            sizeSelect.innerHTML = '';
            for(let s = minSize; s <= maxSize; s++) {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = `${s} Eroi`;
                if(s === minSize) opt.selected = true;
                sizeSelect.appendChild(opt);
            }
            document.getElementById('partyStepText').textContent = `Scegli quanti membri comporranno la spedizione (${minSize} - ${maxSize}):`;
        }

        function showScreen(screenId) {
            currentScreenId = screenId;
            if (screenId !== 'screenCombat') combatPhase = 'none';
            document.querySelectorAll('.container > div').forEach(div => div.classList.add('hidden'));
            const screen = document.getElementById(screenId);
            screen.classList.remove('hidden');
            screen.classList.remove('screen-enter');
            void screen.offsetWidth;
            screen.classList.add('screen-enter');
            document.getElementById('gameContainer').scrollTop = 0;
            updatePartyStatusBars();
            updateMenuMusic(screenId);
            startPendingTypewriters(screen);
        }

        /* ---------- Audio: musica dei menu ed effetti sonori ---------- */
        const MENU_MUSIC_SCREENS = ['screenStart', 'screenCampaigns', 'screenParty'];
        let currentAudioScreen = 'screenStart';
        let soundMuted = false;
        let musicFadeTimer = null;
        try { soundMuted = localStorage.getItem('dignitas_muted') === '1'; } catch (e) {}

        function fadeMusicTo(target, onDone) {
            const music = document.getElementById('menuMusic');
            clearInterval(musicFadeTimer);
            musicFadeTimer = setInterval(() => {
                const step = 0.05;
                const next = music.volume + Math.sign(target - music.volume) * step;
                if (Math.abs(target - music.volume) <= step) {
                    music.volume = target;
                    clearInterval(musicFadeTimer);
                    if (onDone) onDone();
                } else {
                    music.volume = Math.min(1, Math.max(0, next));
                }
            }, 60);
        }

        // Avvia o ferma la musica in base alla schermata attiva
        function updateMenuMusic(screenId) {
            if (screenId) currentAudioScreen = screenId;
            const music = document.getElementById('menuMusic');
            const shouldPlay = MENU_MUSIC_SCREENS.includes(currentAudioScreen);

            if (shouldPlay && music.paused) {
                music.volume = 0;
                music.play().then(() => fadeMusicTo(gameOptions.musicVolume)).catch(() => {
                    // Il browser blocca l'audio finché l'utente non interagisce con la pagina
                });
            } else if (!shouldPlay && !music.paused) {
                fadeMusicTo(0, () => { music.pause(); music.currentTime = 0; });
            }
        }

        // Riproduce un effetto sonoro rispettando il silenziamento globale
        function playSfx(src, volume = 0.7) {
            if (soundMuted) return;
            const sfx = new Audio(src);
            sfx.volume = Math.min(1, volume * gameOptions.sfxVolume);
            sfx.play().catch(() => {});
        }

        // Suono di clic su pulsanti e schede nei menu (schermata iniziale, campagne, eroi ed equipaggiamento)
        const CLICK_SFX = 'audio/click.ogg';
        const CLICKABLE_SELECTOR = 'button, .campaign-card, .armory-btn';
        const clickSfxPreload = new Audio(CLICK_SFX);
        clickSfxPreload.preload = 'auto';

        document.addEventListener('click', e => {
            if (!MENU_MUSIC_SCREENS.includes(currentAudioScreen)) return;
            const target = e.target.closest(CLICKABLE_SELECTOR);
            if (!target || target.disabled) return;
            playSfx(CLICK_SFX, 0.8);
        }, true);

        function applySoundState() {
            document.querySelectorAll('audio, video').forEach(media => { media.muted = soundMuted; });
        }

        // Il silenziamento si imposta dalla finestra Opzioni
        function setSoundMuted(muted) {
            soundMuted = muted;
            try { localStorage.setItem('dignitas_muted', soundMuted ? '1' : '0'); } catch (e) {}
            applySoundState();
            updateMenuMusic();
        }

        // I browser avviano l'audio solo dopo la prima interazione dell'utente
        function unlockAudioOnce() {
            updateMenuMusic();
            document.removeEventListener('pointerdown', unlockAudioOnce);
            document.removeEventListener('keydown', unlockAudioOnce);
        }
        document.addEventListener('pointerdown', unlockAudioOnce);
        document.addEventListener('keydown', unlockAudioOnce);

        window.addEventListener('DOMContentLoaded', () => {
            applySoundState();
            updateMenuMusic('screenStart');
        });

        function updatePartyStatusBars() {
            const container = document.getElementById('partyStatusBarContent');
            animateCoinCounter(partyCoins);

            document.getElementById('topBarRelics').textContent = unlockedRelics.length;
            document.getElementById('topBarRelicsWrap').dataset.tip = unlockedRelics.length > 0
                ? `Reliquie||${unlockedRelics.map(r => `<b style="color:var(--relic-color)">${r.name}</b>: ${r.desc}`).join('<br>')}`
                : 'Reliquie||Nessuna reliquia ottenuta.';

            document.getElementById('topBarCurses').textContent = activeCurses.length;
            document.getElementById('topBarCursesWrap').dataset.tip = activeCurses.length > 0
                ? `Maledizioni||${activeCurses.join('<br>')}`
                : 'Maledizioni||Nessuna maledizione attiva.';

            document.body.classList.toggle('no-party', party.length === 0);
            document.getElementById('consoleCount').textContent = party.length > 0
                ? `${party.filter(p => p.hp > 0).length}/${party.length}`
                : '—';

            if (party.length === 0) {
                container.innerHTML = `<div class="console-empty">Nessun eroe reclutato</div>`;
                return;
            }

            container.innerHTML = party.map(heroCardHtml).join('');
            fxDiffHeroes();
            renderTurnBar();
        }

        window.useConsumableFromTopbar = function(heroName, itemIdx) {
            let hero = party.find(p => p.name === heroName);
            if(!hero) return;
            let item = hero.items[itemIdx];
            if(!item || !item.type || !item.type.startsWith('consumable')) return;

            openModal(
                item.name,
                `<p>${item.desc}</p><p>A quale membro della spedizione vuoi applicarlo?</p>`,
                party.map(p => ({
                    label: `${p.name} (HP ${p.hp}/${p.maxHp})`,
                    disabled: p.hp <= 0,
                    onClick: () => useConsumable(hero.name, itemIdx, p.name)
                })).concat([{ label: 'Annulla', className: 'btn-danger' }])
            );
        };


        function startPartyCreation() {
            showScreen('screenParty');
            party = [];
            partyCoins = 0;
            displayedCoins = 0;
            unlockedRelics = [];
            activeCurses = [];
            expeditionStats = newExpeditionStats();
            document.getElementById('partyConfigArea').classList.remove('hidden');
            document.getElementById('heroCreationArea').classList.add('hidden');
            document.getElementById('abilityArea').classList.add('hidden');
            document.getElementById('armoryArea').classList.remove('hidden');
            document.getElementById('armoryArea').classList.add('hidden');
            document.getElementById('btnProceedHero').classList.add('hidden');
            updatePartyStatusBars();
        }

        function confirmPartySize() {
            partySize = parseInt(document.getElementById('partySizeSelect').value);
            document.getElementById('partyConfigArea').classList.add('hidden');
            document.getElementById('heroCreationArea').classList.remove('hidden');
            document.getElementById('partyHeaderTitle').textContent = "Reclutamento Eroi";
            document.getElementById('partyNarrativeBox').innerHTML = `<strong>Descrizione:</strong> Scegli i membri che comporranno la squadra e assegna loro le abilità e l'armeria iniziale.`;
            loadHeroGridOptions();
        }

        function loadHeroGridOptions() {
            const gridContainer = document.getElementById('heroGridButtons');
            const availableHeroes = campaignHeroes.filter(h => !party.some(p => p.name === h.name));

            gridContainer.innerHTML = availableHeroes.map(h => `
                <button class="armory-btn" onclick="selectHeroCard('${h.name}')">
                    <span class="hero-portrait small ${heroPortraitClass(h.name)}" style="--hue:${heroHue(h.name)}">${heroPortraitInner(h.name)}</span>
                    <span class="tile-text">
                        <strong>${h.name}</strong>
                        <span class="tile-sub stat-chips">
                            <span class="stat-chip"><i>FOR</i>${h.str}</span>
                            <span class="stat-chip"><i>INT</i>${h.int}</span>
                            <span class="stat-chip"><i>FED</i>${h.fth}</span>
                            <span class="stat-chip"><i>HP</i>${h.maxHp}</span>
                        </span>
                    </span>
                </button>
            `).join('');
        }

        let activeHeroForCreation = null;
        function selectHeroCard(heroName) {
            activeHeroForCreation = JSON.parse(JSON.stringify(campaignHeroes.find(h => h.name === heroName)));
            document.getElementById('heroCreationArea').classList.add('hidden');

            const heroAbilities = campaignAbilities[heroName] || [];
            if(heroAbilities.length > 0) {
                document.getElementById('abilityArea').classList.remove('hidden');
                document.getElementById('abilityButtons').innerHTML = heroAbilities.map((ab, idx) => `
                    <button class="armory-btn" onclick="selectAbility(${idx})" style="width:100%; margin:5px 0;">
                        ${abilityIconHtml(ab)}
                        <span class="tile-text">
                            <strong>${ab.name}</strong>
                            ${ab.desc ? `<span class="tile-sub">${ab.desc}</span>` : ''}
                        </span>
                    </button>
                `).join('');
            } else {
                document.getElementById('armoryArea').classList.remove('hidden');
                document.getElementById('btnProceedHero').classList.remove('hidden');
                loadArmoryOptions();
            }
        }

        function selectAbility(idx) {
            const chosen = campaignAbilities[activeHeroForCreation.name][idx];
            activeHeroForCreation.chosenAbility = chosen;

            if(chosen.type === 'passive_stat') {
                if(chosen.stat === 'str') activeHeroForCreation.str += chosen.val;
                else if(chosen.stat === 'int') activeHeroForCreation.int += chosen.val;
                else if(chosen.stat === 'fth') activeHeroForCreation.fth += chosen.val;
                else if(chosen.stat === 'hp') { activeHeroForCreation.maxHp += chosen.val; activeHeroForCreation.hp += chosen.val; }
            }
            else if(chosen.apply) {
                chosen.apply(activeHeroForCreation);
            }

            document.getElementById('abilityArea').classList.add('hidden');
            document.getElementById('armoryArea').classList.remove('hidden');
            document.getElementById('btnProceedHero').classList.remove('hidden');
            loadArmoryOptions();
        }

        function loadArmoryOptions() {
            const hasItem = activeHeroForCreation.items.length > 0;
            document.getElementById('inventoryCountText').textContent = hasItem ?
                `Oggetto scelto: ${activeHeroForCreation.items[0].name} (Clicca di nuovo per deselezionare)` : `Seleziona 1 oggetto iniziale (Max 1):`;

            document.getElementById('btnProceedHero').disabled = !hasItem;

            document.getElementById('armoryButtons').innerHTML = campaignArmory.map((item, idx) => {
                const isSelected = hasItem && activeHeroForCreation.items[0].name === item.name;
                return `
                    <button class="armory-btn ${isSelected ? 'selected' : ''}" onclick="togglePickItem(${idx})">
                        ${itemIconHtml(item)}
                        <span class="tile-text">
                            <strong>${item.name}</strong>
                            <span class="tile-sub">${item.desc}</span>
                            ${isSelected ? '<span class="tile-tag">Selezionato</span>' : ''}
                        </span>
                    </button>
                `;
            }).join('');
        }

        function togglePickItem(idx) {
            const item = campaignArmory[idx];
            const hasItem = activeHeroForCreation.items.length > 0;

            if (hasItem) {
                if (activeHeroForCreation.items[0].name === item.name) {
                    revertItemEffects(activeHeroForCreation.items[0], activeHeroForCreation);
                    activeHeroForCreation.items = [];
                } else {
                    revertItemEffects(activeHeroForCreation.items[0], activeHeroForCreation);
                    activeHeroForCreation.items = [];
                    let newItem = JSON.parse(JSON.stringify(item));
                    activeHeroForCreation.items.push(newItem);
                    applyItemEffects(newItem, activeHeroForCreation);
                }
            } else {
                let newItem = JSON.parse(JSON.stringify(item));
                activeHeroForCreation.items.push(newItem);
                applyItemEffects(newItem, activeHeroForCreation);
            }
            loadArmoryOptions();
        }

        function nextHero() {
            party.push(activeHeroForCreation);
            updatePartyStatusBars();
            document.getElementById('armoryArea').classList.add('hidden');
            document.getElementById('btnProceedHero').classList.add('hidden');

            if(party.length < partySize) {
                document.getElementById('heroCreationArea').classList.remove('hidden');
                loadHeroGridOptions();
            } else {
                showScreen('screenCampaignIntro');
            }
        }

        function startMap() {
            showScreen('screenMap');
            renderStsMap();
            setTimeout(() => {
                const wrapper = document.getElementById('stsMapWrapper');
                const token = document.getElementById('partyToken');
                // Centra la vista sul segnalino della compagnia (o sul fondo della mappa all'inizio)
                wrapper.scrollTop = token
                    ? parseFloat(token.style.top) - wrapper.clientHeight * 0.6
                    : wrapper.scrollHeight;
            }, 50);
        }

        function renderStsMap() {
            const nodesContainer = document.getElementById('stsMapNodesContainer');
            const svgContainer = document.getElementById('stsMapSvg');
            Array.from(nodesContainer.children).forEach(child => { if(child.id !== 'stsMapSvg') child.remove(); });

            let maxLevel = Math.max(...stsMapNodes.map(n => n.level), 1);
            const totalLevels = maxLevel + 1;
            const containerHeight = Math.max(900, totalLevels * 175);
            nodesContainer.style.height = `${containerHeight}px`;
            svgContainer.style.height = `${containerHeight}px`;
            svgContainer.setAttribute("viewBox", `0 0 800 ${containerHeight}`);

            const stepY = (containerHeight - 140) / maxLevel;

            const currentActiveNode = stsMapNodes.find(n => n.active);
            const currentLevel = currentActiveNode ? currentActiveNode.level : (stsMapNodes.filter(n => n.done).length > 0 ? Math.max(...stsMapNodes.filter(n => n.done).map(n => n.level)) + 1 : 0);

            let svgLinesHtml = '';
            stsMapNodes.forEach(node => {
                node.next.forEach(nextId => {
                    const targetNode = stsMapNodes.find(n => n.id === nextId);
                    if(targetNode) {
                        const y1 = containerHeight - (node.level * stepY + 70);
                        const y2 = containerHeight - (targetNode.level * stepY + 70);

                        let pathClass = "";
                        if (targetNode.active && node.done) pathClass = "path-open";
                        else if (targetNode.active) pathClass = "path-next";
                        else if (node.done && targetNode.done) pathClass = "path-taken";
                        else if (node.done) pathClass = "path-closed";
                        else if (targetNode.level < currentLevel) pathClass = "path-closed";

                        svgLinesHtml += `<line class="${pathClass}" x1="${node.x}" y1="${y1}" x2="${targetNode.x}" y2="${y2}" />`;
                    }
                });
            });
            svgContainer.innerHTML = svgLinesHtml;
            renderMapLegend();

            stsMapNodes.forEach(node => {
                let statusClass = "upcoming";
                if (node.done) {
                    statusClass = "completed";
                } else if (node.active) {
                    statusClass = "available";
                } else if (node.level < currentLevel && !node.done) {
                    statusClass = "excluded";
                }

                const nodeEl = document.createElement('div');
                nodeEl.className = `sts-node node-${node.type} ${statusClass}`;
                nodeEl.style.left = `${node.x}px`;
                nodeEl.style.top = `${containerHeight - (node.level * stepY + 70)}px`;
                const isBoss = node.level === maxLevel || node.type === 'captain';
                if (isBoss) {
                    nodeEl.setAttribute('data-boss', 'true');
                    nodeEl.classList.add('node-goal');
                }

                nodeEl.innerHTML = svgIcon(isBoss ? 'crown' : (NODE_ICON[node.type] || 'question'));
                if(node.active && !node.done) {
                    nodeEl.onclick = () => selectStsNode(node.id);
                }
                nodesContainer.appendChild(nodeEl);
            });

            renderPartyToken(nodesContainer, containerHeight, stepY);
            renderExpeditionProgress(maxLevel);
        }

        /* ---------- Segnalino della compagnia sulla mappa ---------- */
        let lastPartyTokenPos = null;

        function renderPartyToken(nodesContainer, containerHeight, stepY) {
            const doneNodes = stsMapNodes.filter(n => n.done);
            if (doneNodes.length === 0) {
                // Prima del primo nodo il segnalino non si vede: entrerà dal fondo della mappa
                const firstLevel = stsMapNodes.filter(n => n.level === 0);
                const avgX = firstLevel.reduce((s, n) => s + n.x, 0) / Math.max(1, firstLevel.length);
                lastPartyTokenPos = { x: avgX, y: containerHeight + 60, nodes: stsMapNodes };
                return;
            }
            const last = doneNodes.reduce((a, b) => (b.level > a.level ? b : a));
            const pos = { x: last.x, y: containerHeight - (last.level * stepY + 70) };

            const token = document.createElement('div');
            token.id = 'partyToken';
            token.className = 'party-token';
            token.innerHTML = `<svg viewBox="0 0 64 72" aria-hidden="true">
                <path d="M32 3 L60 12 V34 C60 52 47 64 32 69 C17 64 4 52 4 34 V12 Z" fill="url(#gradGold)" stroke="#000" stroke-width="2"/>
                <path d="M32 10 L54 17 V34 C54 48 44 58 32 62 C20 58 10 48 10 34 V17 Z" fill="url(#gradRed)" stroke="#000"/>
                <text x="32" y="46" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-weight="900" font-size="28" fill="url(#gradGold)" stroke="#000" stroke-width="1">D</text>
            </svg>`;
            token.dataset.tip = 'La Compagnia||Posizione attuale della spedizione.';

            const from = lastPartyTokenPos && lastPartyTokenPos.nodes === stsMapNodes ? lastPartyTokenPos : null;
            const moves = from && (from.x !== pos.x || from.y !== pos.y) && animationsEnabled();
            const start = moves ? from : pos;
            token.style.left = `${start.x}px`;
            token.style.top = `${start.y}px`;
            nodesContainer.appendChild(token);

            if (moves) {
                token.classList.add('moving');
                void token.offsetWidth;
                token.style.left = `${pos.x}px`;
                token.style.top = `${pos.y}px`;
                setTimeout(() => token.classList.remove('moving'), 950);
            }
            lastPartyTokenPos = { x: pos.x, y: pos.y, nodes: stsMapNodes };
        }

        /* ---------- Titolo dell'evento prima di entrare nel nodo ---------- */
        let nodeBannerBusy = false;

        function nodeBannerInfo(node) {
            const maxLevel = Math.max(...stsMapNodes.map(n => n.level));
            const isBoss = node.level === maxLevel || node.type === 'captain';
            let kind = NODE_LABEL[node.type] || 'Evento';
            let title = kind;
            if ((node.type === 'combat' || node.type === 'elite') && enemies[node.enemy]) title = enemies[node.enemy].name;
            else if (node.type === 'challenge' && challengesData[node.challengeId]) title = challengesData[node.challengeId].title;
            if (isBoss) kind = node.type === 'challenge' ? 'Prova Finale' : 'Scontro Finale';
            return { kind, title, sub: node.title, icon: isBoss ? 'crown' : (NODE_ICON[node.type] || 'question'), isBoss };
        }

        function selectStsNode(id) {
            if (nodeBannerBusy) return;
            const node = stsMapNodes.find(n => n.id === id);
            if (!node) return;
            if (!animationsEnabled()) { enterStsNode(id); return; }

            nodeBannerBusy = true;
            const info = nodeBannerInfo(node);
            const banner = document.createElement('div');
            banner.className = `event-banner ${info.isBoss ? 'boss' : ''}`;
            banner.innerHTML = `
                <div class="event-banner-inner">
                    <div class="event-banner-icon">${svgIcon(info.icon)}</div>
                    <div class="event-banner-kind">${info.kind}</div>
                    <div class="event-banner-title">${info.title}</div>
                    <div class="event-banner-sub">${info.sub}</div>
                </div>`;
            document.body.appendChild(banner);

            // La schermata cambia sotto il titolo, poi il titolo sfuma
            setTimeout(() => enterStsNode(id), 1000);
            setTimeout(() => { banner.remove(); nodeBannerBusy = false; }, 1500);
        }

        function enterStsNode(id) {
            currentNodeId = id;
            const node = stsMapNodes.find(n => n.id === id);

            if(node.type === 'combat' || node.type === 'elite') {
                if(node.image) document.getElementById('combatImg').src = node.image;
                startCombat(node.enemy);
            }
            else if(node.type === 'challenge') {
                if(node.image) document.getElementById('challengeImg').src = node.image;
                startChallenge(node.challengeId);
            }
            else if(node.type === 'rest') {
                if(node.image) document.getElementById('restImg').src = node.image;
                startRest(node.restId);
            }
            else if(node.type === 'merchant') {
                if(node.image) document.getElementById('merchantImg').src = node.image;
                startMerchant(node.merchantId);
            }
            else if(node.type === 'treasure') {
                if(node.image) document.getElementById('treasureImg').src = node.image;
                startTreasure(node.treasureId);
            }
            else if(node.type === 'captain') {
                startCaptainFinale();
            }
        }

        function advanceNode() {
            const currentNode = stsMapNodes.find(n => n.id === currentNodeId);
            if(currentNode) {
                currentNode.done = true;
                currentNode.active = false;
                stsMapNodes.forEach(n => { if(n.level === currentNode.level && n.active) n.active = false; });

                if(currentNode.next.length === 0) {
                    showScreen('screenVictory');
                    return;
                }

                currentNode.next.forEach(nextId => {
                    const nextNode = stsMapNodes.find(n => n.id === nextId);
                    if(nextNode) nextNode.active = true;
                });
            }
            startMap();
        }

        function applyItemEffects(item, hero) {
            if(item.str) hero.str += item.str;
            if(item.dmg) hero.dmg += item.dmg;
            if(item.armor) hero.base_armor += item.armor;
            if(item.att_penalty) hero.att_penalty += item.att_penalty;
            if(item.def_bonus) hero.def_bonus += item.def_bonus;
            if(item.help_bonus_val) hero.help_bonus_val += item.help_bonus_val;
            if(item.fth) hero.fth += item.fth;
            if(item.int) hero.int += item.int;
        }

        function revertItemEffects(item, hero) {
            if(item.str) hero.str -= item.str;
            if(item.dmg) hero.dmg -= item.dmg;
            if(item.armor) hero.base_armor -= item.armor;
            if(item.att_penalty) hero.att_penalty -= item.att_penalty;
            if(item.def_bonus) hero.def_bonus += item.def_bonus;
            if(item.help_bonus_val) hero.help_bonus_val += item.help_bonus_val;
            if(item.fth) hero.fth -= item.fth;
            if(item.int) hero.int -= item.int;
        }

        window.useConsumable = function(heroName, itemIdx, targetName = null) {
            let hero = party.find(p => p.name === heroName);
            if(!hero) return;
            let item = hero.items[itemIdx];
            if(!item || !item.type || !item.type.startsWith('consumable')) return;

            let target = targetName ? party.find(p => p.name === targetName) : hero;
            if(!target || target.hp <= 0) {
                alert("Bersaglio non valido o non disponibile!");
                return;
            }

            if(item.type === 'consumable_heal') {
                target.hp = Math.min(target.maxHp, target.hp + item.heal_val);
                hero.items.splice(itemIdx, 1);
                updatePartyStatusBars();
                triggerConsumableFeedback(hero, target, item);
            } else if(item.type === 'consumable_full') {
                target.hp = target.maxHp;
                hero.items.splice(itemIdx, 1);
                updatePartyStatusBars();
                triggerConsumableFeedback(hero, target, item);
            }
        };

        function triggerConsumableFeedback(hero, target, item) {
            const log = document.getElementById('combatLog');
            if(log && !document.getElementById('screenCombat').classList.contains('hidden')) {
                logCombat(`🧪 ${hero.name} usa ${item.name} su ${target.name}!`);
            } else {
                alert(`${hero.name} ha usato ${item.name} su ${target.name}!`);
            }
        }

        let discardCallback = null;
        let heroNeedingDiscard = null;

        function assignItemToHero(item, hero, callback) {
            let newItem = JSON.parse(JSON.stringify(item));
            hero.items.push(newItem);
            applyItemEffects(newItem, hero);
            updatePartyStatusBars();

            if (hero.items.length > 3) {
                heroNeedingDiscard = hero;
                discardCallback = callback;
                showScreen('screenDiscard');
                renderDiscardScreen();
            } else {
                callback();
            }
        }

        function renderDiscardScreen() {
            document.getElementById('discardHeroName').textContent = heroNeedingDiscard.name;
            document.getElementById('discardItemsList').innerHTML = heroNeedingDiscard.items.map((it, idx) => `
                <button class="armory-btn" onclick="executeDiscard(${idx})">
                    ${itemIconHtml(it)}
                    <span class="tile-text">
                        <strong>${it.name}</strong>
                        <span class="tile-sub">${it.desc}</span>
                        <span class="tile-tag danger">Scarta</span>
                    </span>
                </button>
            `).join('');
        }

        function executeDiscard(idx) {
            const itemToRemove = heroNeedingDiscard.items[idx];
            revertItemEffects(itemToRemove, heroNeedingDiscard);
            heroNeedingDiscard.items.splice(idx, 1);
            updatePartyStatusBars();
            discardCallback();
        }

        /* ==========================================================================
           LOGICA COMBATTIMENTO ED ESECUZIONE ABILITA'
           ========================================================================== */
        let activeEnemy = null;
        let helpBonus = 0;
        let chosenAction = null;
        let currentActiveHero = null;
        let killerHero = null;

        function startCombat(enemyKey) {
    showScreen('screenCombat');
    activeEnemy = JSON.parse(JSON.stringify(enemies[enemyKey]));
    activeEnemy.isStunned = false;
    
    // Reliquia: Occhio del corvo
    if (hasRelic("Occhio del corvo")) activeEnemy.att = Math.max(1, activeEnemy.att - 1);
    
    // Flag per Scudo dell'Atamano
    party.atamanoUsed = false;

    helpBonus = 0;
    killerHero = null;

            document.getElementById('combatDescBox').innerHTML = `<strong>Descrizione:</strong> ${activeEnemy.desc}`;

            party.forEach(h => {
                if(h.hp > 0) {
                    h.current_armor = h.base_armor;
                    h.abilityUsedThisCombat = false;
                } else {
                    h.current_armor = 0;
                }
            });
            fxResyncHeroes();
            combatRound = 0;
            document.getElementById('combatLootBtn').classList.remove('btn-attention');

            document.getElementById('combatLog').innerHTML = `Combatti contro ${activeEnemy.name}! (Armature e Abilità ripristinate)<br>`;
            startHeroesTurnCycle();
        }

        function logCombat(text) {
            const log = document.getElementById('combatLog');
            log.innerHTML += text + "<br>";
            log.scrollTop = log.scrollHeight;
        }

        function updateEnemyInfoUI() {
            let hpPercent = clampPct(activeEnemy.hp, activeEnemy.maxHp);
            let stunBadge = activeEnemy.isStunned ? `<span class="stun-badge">Stordito</span>` : '';

            document.getElementById('enemyInfo').innerHTML = `
                <div class="enemy-head">
                    <div class="icon-frame enemy-emblem">${svgIcon('skull')}</div>
                    <div class="enemy-main">
                        <div class="enemy-name">${activeEnemy.name}${stunBadge}</div>
                        <div class="hp-bar-container big">
                            <div class="hp-bar-fill ${hpClass(hpPercent)}" style="width: ${hpPercent}%;"></div>
                            <div class="hp-bar-text">${Math.max(0, activeEnemy.hp)} / ${activeEnemy.maxHp}</div>
                        </div>
                    </div>
                </div>
                <div class="enemy-stats">
                    <span data-tip="Classe Armatura||Il totale di Forza + d6 necessario per colpire.">${svgIcon('shield')} CA <b>${activeEnemy.ca}</b></span>
                    <span data-tip="Attacco||Il totale necessario per difendersi o aiutare.">${svgIcon('sword')} Att <b>${activeEnemy.att}</b></span>
                    <span data-tip="Danno||Danni inflitti a ogni attacco del nemico.">${svgIcon('drop')} Dmg <b>${activeEnemy.dmg}</b></span>
                </div>
            `;
            fxDiffEnemy();
        }

        function startHeroesTurnCycle() {
            party.forEach(h => { if(h.hp > 0) h.hasActed = false; });
            combatRound++;
            updateEnemyInfoUI();
            showHeroSelectionPhase();
        }

        function showHeroSelectionPhase() {
            document.getElementById('heroTurnSection').classList.remove('hidden');
            document.getElementById('monsterTurnSection').classList.add('hidden');
            document.getElementById('combatNextBtn').classList.add('hidden');
            document.getElementById('combatLootBtn').classList.add('hidden');
            document.getElementById('heroChoiceArea').classList.remove('hidden');
            document.getElementById('heroActionControlArea').classList.add('hidden');
            document.getElementById('combatItemSubmenu').classList.add('hidden');

            const available = party.filter(p => p.hp > 0 && !p.hasActed);
            if(available.length === 0) { startMonsterTurn(); return; }
            combatPhase = 'heroes';
            currentActiveHero = null;
            document.getElementById('combatHeroSelect').innerHTML = available.map(h => `<option value="${h.name}">${h.name} (HP: ${h.hp})</option>`).join('');
            updatePartyStatusBars();
        }

        function confirmCombatHeroChoice() {
            currentActiveHero = party.find(p => p.name === document.getElementById('combatHeroSelect').value);
            document.getElementById('heroChoiceArea').classList.add('hidden');
            document.getElementById('heroActionControlArea').classList.remove('hidden');
            document.getElementById('combatActionButtons').classList.remove('hidden');
            document.getElementById('combatItemSubmenu').classList.add('hidden');
            document.getElementById('combatDiceArea').classList.add('hidden');

            const rollBtn = document.getElementById('rollCombatBtn');
            rollBtn.disabled = false;

            document.getElementById('activeCombatantText').textContent = `Tocca a: ${currentActiveHero.name}`;
            updatePartyStatusBars();

            const btnAbility = document.getElementById('btnCombatAbility');
            if (currentActiveHero.chosenAbility) {
                btnAbility.querySelector('.cmd-ability-icon').innerHTML = abilityCmdIconHtml(currentActiveHero.chosenAbility);
            }
            const hasCombatAbility = currentActiveHero.chosenAbility && currentActiveHero.chosenAbility.isCombatActive;
            const alreadyUsed = currentActiveHero.abilityUsedThisCombat;

            if (hasCombatAbility && !alreadyUsed) {
                btnAbility.disabled = false;
                btnAbility.style.display = "";
                btnAbility.dataset.tip = `${currentActiveHero.chosenAbility.name} [T]||${currentActiveHero.chosenAbility.desc}`;
                btnAbility.querySelector('.cmd-ability-label').textContent = currentActiveHero.chosenAbility.name;
                btnAbility.querySelector('.cmd-sub').textContent = '1 per scontro';
            } else if (hasCombatAbility && alreadyUsed) {
                btnAbility.disabled = true;
                btnAbility.style.display = "";
                btnAbility.querySelector('.cmd-ability-label').textContent = currentActiveHero.chosenAbility.name;
                btnAbility.querySelector('.cmd-sub').textContent = 'Usata';
                btnAbility.dataset.tip = `${currentActiveHero.chosenAbility.name}||Già utilizzata in questo scontro`;
            } else {
                btnAbility.disabled = true;
                btnAbility.style.display = "none";
            }
            updateActionPreviews(currentActiveHero);
        }

        /* ---------- Anteprima dell'esito sui pulsanti azione ---------- */
        // Probabilità di ottenere almeno 'needed' con un d6 (o il migliore di due d6)
        function rollChance(needed, twoDice) {
            if (needed <= 1) return 1;
            if (needed > 6) return 0;
            const fail = (needed - 1) / 6;
            return twoDice ? 1 - fail * fail : 1 - fail;
        }

        function chanceText(needed, twoDice) {
            const pct = Math.round(rollChance(needed, twoDice) * 100);
            if (needed <= 1) return { short: 'Sicuro', long: 'Riuscita garantita', pct };
            if (needed > 6) return { short: 'Impossibile', long: 'Nessun risultato del dado basta', pct };
            return { short: `${needed}+ · ${pct}%`, long: `Ti serve ${needed} o più sul dado${twoDice ? ' (tieni il migliore di due)' : ''}: ${pct}% di riuscita`, pct };
        }

        // Stessi calcoli usati da executeCombatHeroRoll, mostrati prima del tiro
        function updateActionPreviews(hero) {
            if (!hero || !activeEnemy) return;
            const attackNeeded = activeEnemy.ca - hero.str - helpBonus + (hero.att_penalty || 0);
            const defendNeeded = activeEnemy.att - hero.str - (hero.def_bonus || 0);
            const helpNeeded = activeEnemy.att - hero.str - (hero.help_bonus_val || 0);

            const setPreview = (id, title, desc, needed, twoDice) => {
                const btn = document.getElementById(id);
                const info = chanceText(needed, twoDice);
                btn.querySelector('.cmd-sub').textContent = info.short;
                btn.querySelector('.cmd-sub').dataset.chance = info.pct >= 67 ? 'high' : (info.pct >= 34 ? 'mid' : 'low');
                btn.dataset.tip = `${title}||${desc}<br><span class="tip-hint">${info.long}</span>`;
            };

            setPreview('cmdAttack', 'Attacca [Q]', `Forza + d6 contro CA ${activeEnemy.ca}. Se riesci infliggi ${hero.dmg} danni.`, attackNeeded, false);
            setPreview('cmdDefend', 'Difendi [W]', `Forza + d6 contro l'attacco nemico (${activeEnemy.att}). Se riesci ottieni +1 Armatura.`, defendNeeded, false);
            setPreview('cmdHelp', 'Aiuta [E]', `Forza + d6 contro l'attacco nemico (${activeEnemy.att}). Se riesci il prossimo attacco ottiene +1.`, helpNeeded, false);

            const ability = hero.chosenAbility;
            if (ability && ability.isCombatActive && !hero.abilityUsedThisCombat) {
                let needed = attackNeeded;
                if (ability.id === 'dioforo_penna') {
                    needed = activeEnemy.ca - (hero.str + hero.int) - helpBonus + (hero.att_penalty || 0);
                }
                setPreview('btnCombatAbility', `${ability.name} [T]`, ability.desc, needed, ability.id === 'icaro_trucchi');
            }
      }
        function selectCombatAction(action) {
            chosenAction = action;
            if (action === 'use_item') {
                let consumables = currentActiveHero.items.filter(it => it.type && it.type.startsWith('consumable'));
                if (consumables.length === 0) {
                    alert("Questo eroe non ha oggetti consumabili nello zaino!");
                    return;
                }
                document.getElementById('combatActionButtons').classList.add('hidden');
                document.getElementById('combatItemSubmenu').classList.remove('hidden');

                document.getElementById('combatConsumableSelect').innerHTML = currentActiveHero.items
                    .map((it, idx) => ({ it, idx }))
                    .filter(obj => obj.it.type && obj.it.type.startsWith('consumable'))
                    .map(obj => `<option value="${obj.idx}">${obj.it.name} (${obj.it.desc})</option>`)
                    .join('');

                document.getElementById('combatTargetSelect').innerHTML = party
                    .map(p => `<option value="${p.name}">${p.name} (HP: ${p.hp}/${p.maxHp})</option>`)
                    .join('');
            } else {
                document.getElementById('combatActionButtons').classList.add('hidden');
                document.getElementById('combatDiceArea').classList.remove('hidden');
                document.getElementById('diceCombatResult').textContent = "Tira il dado...";
                document.getElementById('rollCombatBtn').disabled = false;
            }
        }

        function cancelCombatItemSubmenu() {
            document.getElementById('combatItemSubmenu').classList.add('hidden');
            document.getElementById('combatActionButtons').classList.remove('hidden');
        }

        function executeCombatUseItem() {
            let itemIdx = parseInt(document.getElementById('combatConsumableSelect').value);
            let targetName = document.getElementById('combatTargetSelect').value;

            useConsumable(currentActiveHero.name, itemIdx, targetName);

            currentActiveHero.hasActed = true;
            document.getElementById('combatItemSubmenu').classList.add('hidden');
            document.getElementById('heroActionControlArea').classList.add('hidden');

            const available = party.filter(p => p.hp > 0 && !p.hasActed);
            if (available.length === 0) {
                startMonsterTurn();
            } else {
                showHeroSelectionPhase();
            }
        }

        function executeCombatHeroRoll() {
            const rollBtn = document.getElementById('rollCombatBtn');
            if (rollBtn.disabled) return;

            const diceBox = document.getElementById('diceCombat');
            rollBtn.disabled = true;
            diceBox.classList.add('rolling');

            let counter = 0;
            const interval = setInterval(() => {
                diceBox.textContent = Math.floor(Math.random() * 6) + 1;
                counter += 50;
                if(counter >= 500) {
                    clearInterval(interval);
                    diceBox.classList.remove('rolling');

                    const hero = currentActiveHero;
                    const enemyHpBefore = activeEnemy.hp;
                    const armorBefore = hero.current_armor;

                    if(chosenAction === 'attack') {
                        const roll = Math.floor(Math.random() * 6) + 1;
                        diceBox.textContent = roll;
                        
                        // Modificatori Reliquie Attacco/Danno
                        let relicAttBonus = 0;
                        let relicDmgBonus = 0;
                        const isElite = stsMapNodes.find(n => n.id === currentNodeId)?.type === 'elite';

                        if (combatRound === 1 && hasRelic("Stendardo da battaglia")) relicAttBonus += 1;
                        if (combatRound === 2 && hasRelic("Zanna del leone bianco")) relicDmgBonus += 2;
                        if (combatRound === 3 && hasRelic("Corno antico")) relicDmgBonus += 1;
                        if (isElite) {
                            if (hasRelic("Idolo del cacciatore")) relicDmgBonus += 1;
                            if (hasRelic("Catena di Norgrad")) relicAttBonus += 1;
                        }

                        let total = roll + hero.str + helpBonus - (hero.att_penalty || 0) + relicAttBonus;
                        helpBonus = 0;
                        
                        logCombat(`${hero.name} attacca: Tiro ${roll} + Forza ${hero.str} ${relicAttBonus > 0 ? '+ Reliquia' : ''} = ${total} (CA: ${activeEnemy.ca})`);

                        if(total >= activeEnemy.ca) {
                            let finalDmg = hero.dmg + relicDmgBonus;
                            activeEnemy.hp -= finalDmg;
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">SUCCESSO!</span> ${finalDmg} danni.`;
                            logCombat(`Colpo riuscito! Infliggi ${finalDmg} danni.`);
                            if (activeEnemy.hp <= 0) killerHero = hero;
                        } else {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">MANCATO!</span>`;
                        }
                    }
                    else if(chosenAction === 'ability') {
    hero.abilityUsedThisCombat = true;
    const abId = hero.chosenAbility.id;

    if (abId === 'zeno_colpo_benedetto') {
        const roll = Math.floor(Math.random() * 6) + 1;
        diceBox.textContent = roll;
        let total = roll + hero.str + helpBonus - (hero.att_penalty || 0);
        helpBonus = 0;
        let totalDmg = hero.dmg + (hero.fth || 0);
        logCombat(`✨ ${hero.name} infonde il colpo di fede sacra! Tiro ${roll} + Forza ${hero.str} = ${total} (CA: ${activeEnemy.ca})`);

        if (total >= activeEnemy.ca) {
            activeEnemy.hp -= totalDmg;
            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">COLPO BENEDETTO!</span> Infliggi ${totalDmg} danni (${hero.dmg} base + ${hero.fth} Fede)!`;
            logCombat(`La luce divina guida la lama: infliggi ${totalDmg} danni!`);
            if (activeEnemy.hp <= 0) killerHero = hero;
        } else {
            document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">MANCATO!</span>`;
        }
    }
    else if (abId === 'dioforo_penna') {
        const roll = Math.floor(Math.random() * 6) + 1;
        diceBox.textContent = roll;
        let intBonus = hero.int || 0;
        let total = roll + hero.str + intBonus + helpBonus - (hero.att_penalty || 0);
        helpBonus = 0;
        logCombat(`📜 ${hero.name} sfrutta l'intelletto! Tiro ${roll} + Forza ${hero.str} + Int ${intBonus} = ${total} (CA: ${activeEnemy.ca})`);

        if (total >= activeEnemy.ca) {
            activeEnemy.hp -= hero.dmg;
            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">COLPO A SEGNO!</span> ${hero.dmg} danni.`;
            logCombat(`Un calcolo perfetto individua il punto debole: infliggi ${hero.dmg} danni!`);
            if (activeEnemy.hp <= 0) killerHero = hero;
        } else {
            document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">MANCATO!</span>`;
        }
    }
    else if (abId === 'icaro_trucchi') {
                            const d1 = Math.floor(Math.random() * 6) + 1;
                            const d2 = Math.floor(Math.random() * 6) + 1;
                            const roll = Math.max(d1, d2);
                            diceBox.textContent = roll;
                            let total = roll + hero.str + helpBonus - (hero.att_penalty || 0);
                            helpBonus = 0;
                            logCombat(`✨ ${hero.name} usa Trucchi del Mestiere! Tira [${d1}, ${d2}] -> Tiene ${roll}. Totale: ${total} (CA: ${activeEnemy.ca})`);

                            if (total >= activeEnemy.ca) {
                                activeEnemy.hp -= hero.dmg;
                                document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">COLPO A SEGNO!</span> ${hero.dmg} danni.`;
                                if (activeEnemy.hp <= 0) killerHero = hero;
                            } else {
                                document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">MANCATO!</span>`;
                            }
                        }
                        else if (abId === 'astarte_affondo') {
                            const roll = Math.floor(Math.random() * 6) + 1;
                            diceBox.textContent = roll;
                            let total = roll + hero.str + helpBonus - (hero.att_penalty || 0);
                            helpBonus = 0;
                            let extraDmg = hero.dmg * 2;
                            logCombat(`🗡️ ${hero.name} scatena Affondo Mortale! Tiro ${roll} + Forza ${hero.str} = ${total} (CA: ${activeEnemy.ca})`);

                            if (total >= activeEnemy.ca) {
                                activeEnemy.hp -= extraDmg;
                                fxNextEnemyHitCritical = true;
                                document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">COLPO CRITICO!</span> Infliggi ${extraDmg} danni raddoppiati!`;
                                logCombat(`L'affondo trafigge il nemico infliggendo ${extraDmg} danni!`);
                                if (activeEnemy.hp <= 0) killerHero = hero;
                            } else {
                                document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">MANCATO!</span>`;
                            }
                        }
                        else if (abId === 'ascadeo_segnato') {
                            const roll = Math.floor(Math.random() * 6) + 1;
                            diceBox.textContent = roll;
                            let total = roll + hero.str + helpBonus - (hero.att_penalty || 0);
                            helpBonus = 0;
                            logCombat(`❄️ ${hero.name} colpisce nel nome di Hvid! Tiro ${roll} + Forza ${hero.str} = ${total} (CA: ${activeEnemy.ca})`);

                            if (total >= activeEnemy.ca) {
                                activeEnemy.hp -= hero.dmg;
                                activeEnemy.isStunned = true;
                                document.getElementById('diceCombatResult').innerHTML = `<span style="color:#3498db;">STORDITO!</span> ${hero.dmg} danni e nemico congelato per un turno.`;
                                logCombat(`Il nemico barcolla congelato dal gelo di Hvid: salterà il prossimo attacco!`);
                                if (activeEnemy.hp <= 0) killerHero = hero;
                            } else {
                                document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">MANCATO!</span>`;
                            }
                        }
                    }
                    else if(chosenAction === 'defend') {
                        const roll = Math.floor(Math.random() * 6) + 1;
                        diceBox.textContent = roll;
                        let total = roll + hero.str + (hero.def_bonus || 0);
                        logCombat(`${hero.name} si difende: Tiro ${roll} + Forza ${hero.str} = ${total}`);
                        if(total >= activeEnemy.att) {
                            hero.current_armor += 1;
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">DIFESA RIUSCITA!</span> +1 Armatura.`;
                            logCombat(`${hero.name} alza la guardia (+1 Armatura).`);
                        } else {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">FALLITO.</span>`;
                        }
                    }
                    else if(chosenAction === 'help') {
                        const roll = Math.floor(Math.random() * 6) + 1;
                        diceBox.textContent = roll;
                        let total = roll + hero.str + (hero.help_bonus_val || 0);
                        logCombat(`${hero.name} aiuta: Tiro ${roll} + Forza ${hero.str} = ${total}`);
                        if(total >= activeEnemy.att) {
                            helpBonus = 1;
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">AIUTO RIUSCITO!</span> +1 al prossimo.`;
                        } else {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">FALLITO.</span>`;
                        }
                    }

                    hero.hasActed = true;
                    updateEnemyInfoUI();
                    updatePartyStatusBars();

                    // Esiti senza variazione di HP: mancato, fallito, aiuto riuscito
                    if ((chosenAction === 'attack' || chosenAction === 'ability') && activeEnemy.hp === enemyHpBefore) {
                        fxFloatOn(document.getElementById('enemyInfo'), 'Mancato', 'miss');
                    } else if (chosenAction === 'defend' && hero.current_armor === armorBefore) {
                        fxFloatOnHero(hero, 'Fallito', 'miss');
                    } else if (chosenAction === 'help') {
                        const helped = document.getElementById('diceCombatResult').textContent.includes('RIUSCITO');
                        fxFloatOnHero(hero, helped ? '+1 al prossimo' : 'Fallito', helped ? 'buff' : 'miss');
                    }

                    if(activeEnemy.hp <= 0) {
                        logCombat(`Hai sconfitto ${activeEnemy.name}! Vittoria!`);
                        document.getElementById('combatLootBtn').classList.remove('hidden');
                        document.getElementById('heroActionControlArea').classList.add('hidden');
                        return;
                    }
                    document.getElementById('combatNextBtn').classList.remove('hidden');
                }
            }, 50);
        }

        function proceedCombatPhase() {
            document.getElementById('combatNextBtn').classList.add('hidden');
            showHeroSelectionPhase();
        }

        function startMonsterTurn() {
            combatPhase = 'monster';
            currentActiveHero = null;
            updatePartyStatusBars();
            document.getElementById('heroTurnSection').classList.add('hidden');
            document.getElementById('monsterTurnSection').classList.remove('hidden');

            if(activeEnemy.isStunned) {
                activeEnemy.isStunned = false;
                document.getElementById('monsterTurnText').textContent = `${activeEnemy.name} è stordito e non può attaccare!`;
                logCombat(`⏳ ${activeEnemy.name} si riprende dallo stordimento e salta il turno!`);
                updateEnemyInfoUI();

                document.getElementById('monsterTargetArea').classList.add('hidden');
                document.getElementById('combatNextBtn').classList.remove('hidden');
                document.getElementById('combatNextBtn').onclick = function() {
                    document.getElementById('combatNextBtn').classList.add('hidden');
                    document.getElementById('monsterTargetArea').classList.remove('hidden');
                    document.getElementById('combatNextBtn').onclick = proceedCombatPhase;
                    startHeroesTurnCycle();
                };
                return;
            }

            document.getElementById('monsterTargetArea').classList.remove('hidden');
            document.getElementById('monsterTurnText').textContent = `Turno di ${activeEnemy.name}!`;
            document.getElementById('monsterTargetSelect').innerHTML = party.filter(p => p.hp > 0).map(h => `<option value="${h.name}">${h.name} (HP: ${h.hp})</option>`).join('');
        }

        function executeMonsterAttack() {
            const target = party.find(p => p.name === document.getElementById('monsterTargetSelect').value);
            logCombat(`--- ${activeEnemy.name} attacca ${target.name}! ---`);

            let incomingDamage = activeEnemy.dmg;

            // Reliquia: Scudo dell'Atamano (annulla il primo attacco)
            if (hasRelic("Scudo dell'Atamano") && !party.atamanoUsed) {
                party.atamanoUsed = true;
                incomingDamage = 0;
                logCombat(`🛡️ Lo Scudo dell'Atamano assorbe completamente il primo colpo del combattimento!`);
            }

            if (target.current_armor > 0 && incomingDamage > 0) {
                if (target.current_armor >= incomingDamage) {
                    target.current_armor -= incomingDamage;
                    logCombat(`L'armatura assorbe interamente il colpo!`);
                    incomingDamage = 0;
                } else {
                    incomingDamage -= target.current_armor;
                    logCombat(`L'armatura si infrange. I restanti ${incomingDamage} colpiscono gli HP!`);
                    target.current_armor = 0;
                }
            }

            if (incomingDamage > 0) {
                // Reliquia: Marchio di Jag Antar (salvavita)
                if (target.hp - incomingDamage <= 0 && hasRelic("Marchio di Jag Antar")) {
                    target.hp = 1;
                    breakRelic("Marchio di Jag Antar");
                    logCombat(`✨ Il Marchio di Jag Antar si infrange, salvando ${target.name} da morte certa!`);
                } else {
                    target.hp = Math.max(0, target.hp - incomingDamage);
                    logCombat(`${target.name} subisce ${incomingDamage} danni agli HP!`);
                }
            }

            updatePartyStatusBars();

            if(party.every(p => p.hp <= 0)) {
                showScreen('screenDefeat');
                return;
            }

            document.getElementById('monsterTurnSection').classList.add('hidden');
            document.getElementById('combatNextBtn').classList.remove('hidden');
            document.getElementById('combatNextBtn').onclick = function() {
                document.getElementById('combatNextBtn').classList.add('hidden');
                document.getElementById('combatNextBtn').onclick = proceedCombatPhase;
                startHeroesTurnCycle();
            };
        }

        let currentLootItem = null;

        function triggerLoot() {
            showScreen('screenLoot');

            // Reliquia: Dente del grande lupo
            if (hasRelic("Dente del grande lupo")) {
                let lowestHero = party.filter(h => h.hp > 0).reduce((prev, curr) => prev.hp < curr.hp ? prev : curr);
                if (lowestHero && lowestHero.hp < lowestHero.maxHp) {
                    lowestHero.hp += 1;
                }
            }

            const coinAmounts = [3, 5, 7, 9, 12];
            let coins = coinAmounts[Math.floor(Math.random() * coinAmounts.length)];

            if (killerHero && killerHero.bonusLootGoldLastHit) {
                let bonus = Math.floor(coins * killerHero.bonusLootGoldLastHit);
                coins += bonus;
                logCombat(`💰 [Fammi dare un'occhiata] ${killerHero.name} trova ${bonus} monete extra dal cadavere!`);
            }

            if (activeCurses.includes("Maledizione: -15% monete")) {
                coins = Math.floor(coins * 0.85);
            }

            partyCoins += coins;

            // Filtro bottino: controlla se il nodo corrente è élite/boss
            const currentNode = stsMapNodes.find(n => n.id === currentNodeId);
            const isEliteCombat = currentNode && (currentNode.type === 'elite' || currentNode.type === 'captain');

            let availableLootPool = gameItems;
            
            // Se gli oggetti hanno definita la rarità e lo scontro è normale, esclude gli epici
            if (!isEliteCombat && gameItems.some(i => i.rarity)) {
                const nonEpicItems = gameItems.filter(i => i.rarity !== 'epico');
                if (nonEpicItems.length > 0) {
                    availableLootPool = nonEpicItems;
                }
            }

            currentLootItem = availableLootPool[Math.floor(Math.random() * availableLootPool.length)];
            expeditionStats.itemsFound++;

            document.getElementById('lootCoinsText').textContent = coins;
            document.getElementById('lootItemName').textContent = currentLootItem.name;
            document.getElementById('lootItemDesc').textContent = currentLootItem.desc;
            revealAsCard(document.querySelector('#screenLoot .loot-panel'), 0);
            document.getElementById('lootHeroSelect').innerHTML = party.filter(p => p.hp > 0).map(h => `<option value="${h.name}">${h.name}</option>`).join('');

            updatePartyStatusBars();
        }

        function confirmLootAssignment() {
            const hero = party.find(p => p.name === document.getElementById('lootHeroSelect').value);
            assignItemToHero(currentLootItem, hero, () => {
                advanceNode();
            });
        }

        let currentTreasureItems = [];
        let selectedTreasureItem = null;

        function startTreasure(treasureId) {
            showScreen('screenTreasure');
            const descText = treasuresData[treasureId] || "Un antico forziere cattura la vostra attenzione.";
            document.getElementById('treasureDescBox').innerHTML = `<strong>Descrizione:</strong> ${descText}`;
        }

        function openTreasure() {
            showScreen('screenTreasureLoot');
            const coinAmounts = [5, 8, 10, 15];
            let coins = coinAmounts[Math.floor(Math.random() * coinAmounts.length)];

            if (activeCurses.includes("Maledizione: -15% monete")) {
                coins = Math.floor(coins * 0.85);
            }

            partyCoins += coins;

            currentTreasureItems = [];
            for(let i = 0; i < 3; i++) {
                let randomItm = gameItems[Math.floor(Math.random() * gameItems.length)];
                currentTreasureItems.push(randomItm);
            }

            document.getElementById('treasureCoinsText').textContent = coins;
            document.getElementById('treasureAssignArea').classList.add('hidden');
            document.getElementById('btnExitTreasure').classList.remove('hidden');

            // Lo scrigno si apre, poi monete e oggetti compaiono come carte
            const chestDelay = playChestAnimation();
            coinFlightDelay = chestDelay;
            renderTreasureItemsGrid();
            document.querySelectorAll('#treasureItemsList .armory-btn').forEach((card, i) => revealAsCard(card, chestDelay + i * 160));
            updatePartyStatusBars();
            coinFlightDelay = 0;
        }

        function renderTreasureItemsGrid() {
            document.getElementById('treasureItemsList').innerHTML = currentTreasureItems.map((it, idx) => {
                if(!it) {
                    return `<div class="armory-btn taken"><span class="tile-text"><strong>Prelevato</strong></span></div>`;
                }
                return `
                    <button class="armory-btn" onclick="selectTreasureItem(${idx})">
                        ${itemIconHtml(it)}
                        <span class="tile-text">
                            <strong>${it.name}</strong>
                            <span class="tile-sub">${it.desc}</span>
                            <span class="tile-tag">Prendi</span>
                        </span>
                    </button>
                `;
            }).join('');
        }

        let selectedTreasureIndex = null;
        function selectTreasureItem(idx) {
            selectedTreasureIndex = idx;
            selectedTreasureItem = currentTreasureItems[idx];

            document.getElementById('treasureItemsList').classList.add('hidden');
            document.getElementById('btnExitTreasure').classList.add('hidden');
            document.getElementById('treasureAssignArea').classList.remove('hidden');

            document.getElementById('selectedTreasureName').textContent = selectedTreasureItem.name;
            document.getElementById('selectedTreasureDesc').textContent = selectedTreasureItem.desc;
            document.getElementById('treasureHeroSelect').innerHTML = party.filter(p => p.hp > 0).map(h => `<option value="${h.name}">${h.name}</option>`).join('');
        }

        function cancelTreasureItemSelection() {
            document.getElementById('treasureAssignArea').classList.add('hidden');
            document.getElementById('treasureItemsList').classList.remove('hidden');
            document.getElementById('btnExitTreasure').classList.remove('hidden');
        }

        function confirmTreasureAssignment() {
            const hero = party.find(p => p.name === document.getElementById('treasureHeroSelect').value);
            expeditionStats.itemsFound++;
            assignItemToHero(selectedTreasureItem, hero, () => {
                currentTreasureItems[selectedTreasureIndex] = null;
                cancelTreasureItemSelection();
                renderTreasureItemsGrid();
            });
        }

        let merchantItemsWithPrices = [];
        let currentMerchantItem = null;

       function startMerchant(merchantId) {
    showScreen('screenMerchant');
    const descText = merchantsData[merchantId] || merchantsData.default || "Un mercante di passaggio offre i suoi beni.";
    document.getElementById('merchantDescBox').innerHTML = `<strong>Descrizione:</strong> ${descText}`;

    document.getElementById('merchantAssignArea').classList.add('hidden');
    document.getElementById('merchantItemsList').classList.remove('hidden');
    document.getElementById('btnExitMerchant').classList.remove('hidden');

    merchantItemsWithPrices = [];
    
    // Divisione per rarità
    const commons = gameItems.filter(i => i.rarity === 'comune');
    const rares = gameItems.filter(i => i.rarity === 'raro');
    const epics = gameItems.filter(i => i.rarity === 'epico');

    // Il mercante offre sempre: 1 comune, 1 raro, 1 raro o epico
    let shopPool = [
        commons[Math.floor(Math.random() * commons.length)],
        rares[Math.floor(Math.random() * rares.length)],
        (Math.random() > 0.7 && epics.length > 0) ? epics[Math.floor(Math.random() * epics.length)] : rares[Math.floor(Math.random() * rares.length)]
    ];

    shopPool.forEach(item => {
        if (!item) return;
        let basePrice = item.rarity === 'comune' ? (Math.floor(Math.random() * 3) + 4) : 
                       (item.rarity === 'raro' ? (Math.floor(Math.random() * 6) + 9) : 
                       (Math.floor(Math.random() * 8) + 18)); // Epico

        // Applica gli sconti delle reliquie
        if (hasRelic("Moneta di fredlos")) basePrice = Math.floor(basePrice * 0.5);
        if (hasRelic("Lasciapassare mercantile")) basePrice = Math.max(1, basePrice - 3);

        merchantItemsWithPrices.push({ item, price: basePrice });
    });

    renderMerchantShop();
}

        function renderMerchantShop() {
            document.getElementById('merchantItemsList').innerHTML = merchantItemsWithPrices.map((entry, idx) => {
                if(!entry) {
                    return `<div class="armory-btn taken"><span class="tile-text"><strong>Venduto</strong></span></div>`;
                }
                const canAfford = partyCoins >= entry.price;
                return `
                    <button class="armory-btn ${canAfford ? '' : 'unaffordable'}" onclick="tryBuyMerchantItem(${idx})">
                        ${itemIconHtml(entry.item)}
                        <span class="tile-text">
                            <strong>${entry.item.name}</strong>
                            <span class="tile-sub">${entry.item.desc}</span>
                        </span>
                        <span class="price ${canAfford ? '' : 'too-much'}"><span class="coin"></span>${entry.price}</span>
                    </button>
                `;
            }).join('');
        }

        function tryBuyMerchantItem(idx) {
            let entry = merchantItemsWithPrices[idx];
            if(partyCoins < entry.price) {
                alert("Non hai abbastanza monete per questo oggetto!");
                return;
            }

            partyCoins -= entry.price;
            currentMerchantItem = entry.item;
            merchantItemsWithPrices[idx] = null;

            document.getElementById('merchantItemsList').classList.add('hidden');
            document.getElementById('btnExitMerchant').classList.add('hidden');
            document.getElementById('merchantAssignArea').classList.remove('hidden');
            document.getElementById('merchantHeroSelect').innerHTML = party.filter(p => p.hp > 0).map(h => `<option value="${h.name}">${h.name}</option>`).join('');

            updatePartyStatusBars();
        }

        function confirmMerchantAssignment() {
            const hero = party.find(p => p.name === document.getElementById('merchantHeroSelect').value);
            document.getElementById('merchantAssignArea').classList.add('hidden');
            assignItemToHero(currentMerchantItem, hero, () => {
                document.getElementById('merchantItemsList').classList.remove('hidden');
                document.getElementById('btnExitMerchant').classList.remove('hidden');
                renderMerchantShop();
            });
        }

        /* ==========================================================================
           GESTIONE SFIDE
           ========================================================================== */
        function startChallenge(challengeId) {
            showScreen('screenChallenge');
            challengeState = challengesData[challengeId] || {
                title: "Sfida",
                desc: "descrizione da scrivere",
                ignoreText: "descrizione da scrivere",
                successText: "descrizione da scrivere",
                failText: "descrizione da scrivere",
                stat: "str",
                cd: 6
            };

            document.getElementById('challengeTitle').textContent = challengeState.title;
            document.getElementById('challengeNarrativeBox').innerHTML = `<strong>Descrizione:</strong> ${challengeState.desc}`;

            document.getElementById('challengeStage1').classList.remove('hidden');
            document.getElementById('challengeStage2').classList.add('hidden');
            document.getElementById('diceChallengeSection').classList.add('hidden');
            document.getElementById('closeChallengeBtn').classList.add('hidden');

            document.getElementById('closeChallengeBtn').onclick = advanceNode;
        }

        function challengeChoose(approach) {
            if(!approach) {
                document.getElementById('challengeNarrativeBox').innerHTML = `<strong>Descrizione:</strong> ${challengeState.ignoreText}`;
                document.getElementById('challengeStage1').classList.add('hidden');
                document.getElementById('closeChallengeBtn').classList.remove('hidden');
                return;
            }
            document.getElementById('challengeNarrativeBox').innerHTML = `<strong>Descrizione:</strong> Un membro della compagnia si fa avanti per affrontare la prova.`;
            document.getElementById('challengeStage1').classList.add('hidden');
            document.getElementById('challengeStage2').classList.remove('hidden');
            document.getElementById('challengeHeroSelect').innerHTML = party.filter(p => p.hp > 0).map(h => `<option value="${h.name}">${h.name}</option>`).join('');
        }

        let selectedChallengeHero = null;
        function confirmChallengeHero() {
            selectedChallengeHero = party.filter(p => p.hp > 0).find(p => p.name === document.getElementById('challengeHeroSelect').value);
            document.getElementById('challengeStage2').classList.add('hidden');
            document.getElementById('diceChallengeSection').classList.remove('hidden');

            const statKey = challengeState.stat ? challengeState.stat.toUpperCase() : "STAT";
            document.getElementById('challengeCdText').textContent = `Prova di ${statKey} (Classe di Difficoltà: ${challengeState.cd})`;
            document.getElementById('rollChallengeBtn').disabled = false;
            document.getElementById('diceChallenge').textContent = "6";
        }

        function executeChallengeRoll() {
            const rollBtn = document.getElementById('rollChallengeBtn');
            const diceBox = document.getElementById('diceChallenge');
            rollBtn.disabled = true; diceBox.classList.add('rolling');

            let counter = 0;
            const interval = setInterval(() => {
                diceBox.textContent = Math.floor(Math.random() * 6) + 1;
                counter += 50;
                if(counter >= 500) {
                    clearInterval(interval);
                    let roll = Math.floor(Math.random() * 6) + 1;
                    
                    // Abilità passiva di Dioforo: "Era solo una prova!"
                    if (selectedChallengeHero && selectedChallengeHero.hasAdvantageOnIntFth && (challengeState.stat === 'int' || challengeState.stat === 'fth')) {
                        const roll2 = Math.floor(Math.random() * 6) + 1;
                        logCombat ? logCombat(`🎲 [Era solo una prova!] ${selectedChallengeHero.name} tira due dadi [${roll}, ${roll2}]`) : null;
                        roll = Math.max(roll, roll2);
                    }

                    diceBox.textContent = roll;
                    diceBox.classList.remove('rolling');

                    let statValue = 0;
                    if(selectedChallengeHero) {
                        if(challengeState.stat === 'int') statValue = selectedChallengeHero.int || 0;
                        else if(challengeState.stat === 'fth') statValue = selectedChallengeHero.fth || 0;
                        else if(challengeState.stat === 'str') statValue = selectedChallengeHero.str || 0;
                    }

                    // Modificatori Reliquie Sfide
                    let relicBonus = 0;
                    if (hasRelic("Anello del giuramento")) {
                        relicBonus += 3;
                        breakRelic("Anello del giuramento");
                    }
                    if (hasRelic("Sigillo runico")) {
                        relicBonus += 2;
                        party.sigilloCharges = (party.sigilloCharges || 0) + 1;
                        if (party.sigilloCharges >= 2) breakRelic("Sigillo runico");
                    }

                    let total = roll + statValue + relicBonus;
                    
                    // Reliquia: Frammento di matrice (converte il fallimento in successo)
                    if (total < challengeState.cd && hasRelic("Frammento di matrice")) {
                        total = challengeState.cd;
                        breakRelic("Frammento di matrice");
                    }

                    if(total >= challengeState.cd) {
                        let rewardMsg = "";
                        if (challengeState.reward) {
                            unlockedRelics.push(challengeState.reward);
                            if (typeof challengeState.reward.apply === "function") {
                                challengeState.reward.apply();
                            }
                            rewardMsg = `<br><strong style="color:var(--relic-color);">Reliquia ottenuta: ${challengeState.reward.name} (${challengeState.reward.desc})</strong>`;
                            showOutcomeOverlay('relic', challengeState.reward);
                        }
                        expeditionStats.challengesPassed++;
                        document.getElementById('challengeNarrativeBox').innerHTML = `<strong>Successo! (${total} vs CD ${challengeState.cd})</strong><br>${challengeState.successText || 'Prova superata!'}${rewardMsg}`;

                        if (challengeState.stat === 'scelta_finale' || challengeState.title === "Accampamento") {
                            document.getElementById('closeChallengeBtn').onclick = () => showScreen('screenVictory');
                        } else {
                            document.getElementById('closeChallengeBtn').onclick = advanceNode;
                        }
                    } else {
                        let punishmentMsg = "";
                        if (challengeState.punishment) {
                            const cursesBefore = activeCurses.length;
                            if (typeof challengeState.punishment.apply === "function") {
                                challengeState.punishment.apply();
                            }
                            // Molte maledizioni modificano solo gli eroi: le registriamo comunque
                            // perché compaiano nel contatore in alto e nel Diario
                            if (activeCurses.length === cursesBefore) {
                                activeCurses.push(`${challengeState.punishment.name} (${challengeState.punishment.desc})`);
                            }
                            punishmentMsg = `<br><strong style="color:var(--curse-color);">Maledizione subita: ${challengeState.punishment.name} (${challengeState.punishment.desc})</strong>`;
                            showOutcomeOverlay('curse', challengeState.punishment);
                        }
                        expeditionStats.challengesFailed++;
                        document.getElementById('challengeNarrativeBox').innerHTML = `<strong>Fallimento! (${total} vs CD ${challengeState.cd})</strong><br>${challengeState.failText || 'Prova fallita!'}${punishmentMsg}`;
                        document.getElementById('closeChallengeBtn').onclick = advanceNode;
                    }

                    updatePartyStatusBars();
                    document.getElementById('closeChallengeBtn').classList.remove('hidden');
                }
            }, 50);
        }

        function startRest(restId) {
            showScreen('screenRest');
            const restDesc = restsData[restId] || "Trovate un luogo sicuro dove riposare e recuperare le forze.";
            document.getElementById('restDescBox').innerHTML = `<strong>Descrizione:</strong> ${restDesc}`;

            let healsExtra = unlockedRelics.some(r => r.name === "Unguento dell'erborista") ? 1 : 0;

            party.forEach(h => {
                if(h.hp > 0) h.hp = Math.min(h.maxHp, h.hp + healsExtra);
            });
// Reliquia: Pietra del focolare (rimuove 1 maledizione a caso)
            if (hasRelic("Pietra del focolare") && activeCurses.length > 0) {
                const rIdx = Math.floor(Math.random() * activeCurses.length);
                activeCurses.splice(rIdx, 1);
            }
            updatePartyStatusBars();
        }

        function startCaptainFinale() {
            showScreen('screenCaptain');
            document.getElementById('captainHeroSelect').innerHTML = party.filter(p => p.hp > 0).map(h => `<option value="${h.name}">${h.name}</option>`).join('');
        }

        let captainActionType = ''; let selectedCaptainHero = null;
        function captainAction(type) {
            captainActionType = type;
            selectedCaptainHero = party.find(p => p.name === document.getElementById('captainHeroSelect').value);
            document.getElementById('captainHeroSelect').style.display = 'none';
            document.getElementById('diceCaptainSection').classList.remove('hidden');
        }

        function executeCaptainRoll() {
            const rollBtn = document.getElementById('rollCaptainBtn');
            const diceBox = document.getElementById('diceCaptain');
            rollBtn.disabled = true; diceBox.classList.add('rolling');

            let counter = 0;
            const interval = setInterval(() => {
                diceBox.textContent = Math.floor(Math.random() * 6) + 1;
                counter += 50;
                if(counter >= 500) {
                    clearInterval(interval);
                    const roll = Math.floor(Math.random() * 6) + 1;
                    diceBox.textContent = roll; diceBox.classList.remove('rolling');

                    if (captainActionType === 'force') {
                        document.getElementById('resultCaptainLog').innerHTML = `<span style="color:#ff4d4d;">RAMANZINA!</span> Perdi il 50% degli HP.`;
                        selectedCaptainHero.hp = Math.max(1, Math.floor(selectedCaptainHero.hp / 2));
                    } else {
                        let statVal = captainActionType === 'faith' ? selectedCaptainHero.fth : selectedCaptainHero.int;
                        let cd = 6;
                        if(roll + statVal >= cd) {
                            document.getElementById('resultCaptainLog').innerHTML = `<span style="color:var(--gold);">VITTORIA!</span> Meta raggiunta!`;
                        } else {
                            document.getElementById('resultCaptainLog').innerHTML = `<span style="color:#ff4d4d;">FALLITO!</span>`;
                        }
                    }
                    updatePartyStatusBars();

                    const endBtn = document.getElementById('endGameBtn');
                    endBtn.classList.remove('hidden');
                    endBtn.textContent = "Vedi Vittoria / Fine Campagna";
                    endBtn.onclick = () => showScreen('screenVictory');
                }
            }, 50);
        }

        /* =========================================================
           INTERFACCIA "REIGN OF CHAOS": icone, tooltip, modali, tasti
           ========================================================= */
        const ICONS = {
            sword: '<path d="M19.5 4.5L9 15M19.5 4.5V8M19.5 4.5H16M6.5 12.5l5 5M8.2 15.8L4.5 19.5"/>',
            axe: '<path d="M5 20L15.5 6.5"/><path d="M12.5 4.5c3.2-1.4 6.6.6 7.5 4-2.2 0-4.2 1-5.3 3.1-1.3-2.4-2.2-4.6-2.2-7.1z"/>',
            spear: '<path d="M4.5 19.5L16 8"/><path d="M16 8l1.2-4.2L21 2.9l-.9 3.8z"/><path d="M13.5 6.5l4 4"/>',
            shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M12 7v10M8.5 11h7"/>',
            armor: '<path d="M8 4l4 2 4-2 4 3-2 4v9H6v-9L4 7z"/><path d="M9 12h6M12 6v14"/>',
            book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><path d="M12 6.5v5M9.8 8.5h4.4"/>',
            potion: '<path d="M10 3h4M10.5 3v5L6 16a3 3 0 0 0 2.6 5h6.8A3 3 0 0 0 18 16l-4.5-8V3"/><path d="M8 14h8"/>',
            amulet: '<path d="M6 3l6 7.5L18 3"/><circle cx="12" cy="15" r="5"/><circle cx="12" cy="15" r="1.6"/>',
            ring: '<circle cx="12" cy="14.5" r="6"/><path d="M9.5 6.5L12 3l2.5 3.5L12 8.5z"/>',
            bag: '<path d="M9 4h6l-1.5 3h-3z"/><path d="M10.5 7C6 9 4 13 4 16a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4c0-3-2-7-6.5-9"/>',
            pouch: '<path d="M9 4h6l-1.5 3h-3z"/><path d="M10.5 7C6 9 4 13 4 16a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4c0-3-2-7-6.5-9"/><path d="M14 11.5h-3a1.3 1.3 0 0 0 0 2.6h2a1.3 1.3 0 0 1 0 2.6h-3M12 10.5v1M12 16.7v1"/>',
            skull: '<path d="M12 3a7 7 0 0 0-7 7c0 2.5 1.3 4 2.5 5v3h9v-3c1.2-1 2.5-2.5 2.5-5a7 7 0 0 0-7-7z"/><circle cx="9.3" cy="10.5" r="1.6"/><circle cx="14.7" cy="10.5" r="1.6"/><path d="M10 18v2.5M12 18v2.5M14 18v2.5"/>',
            question: '<circle cx="12" cy="12" r="9"/><path d="M9.3 9.3a2.8 2.8 0 1 1 4.2 2.4c-.9.5-1.5 1.2-1.5 2.2v.6"/><path d="M12 17.4v.2"/>',
            chest: '<rect x="3" y="10" width="18" height="10" rx="1"/><path d="M3 10c0-4 3-6 9-6s9 2 9 6M3 13.5h18"/><rect x="10.5" y="12" width="3" height="4"/>',
            fire: '<path d="M12 3c1 3 4.5 4.6 4.5 8.5a4.5 4.5 0 0 1-9 0c0-2 1-3.4 2.2-4.4 0 2 .9 3.2 2 3.2 0-3-1.1-4.3.3-7.3z"/><path d="M4 21l16-3.5M4 17.5L20 21"/>',
            crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/><path d="M5 16h14"/>',
            drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
            star: '<path d="M12 2.5l2.6 6 6.4.6-4.9 4.2 1.5 6.3L12 16.3 6.4 19.6l1.5-6.3L3 9.1l6.4-.6z"/>',
            rune: '<path d="M12 2l8 5v10l-8 5-8-5V7z"/><path d="M12 7v10M9 9.5l6 5M15 9.5l-6 5"/>'
        };

        function svgIcon(name) {
            return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.bag}</svg>`;
        }

        function esc(str) {
            return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        function itemIconName(item) {
            const key = `${item.id || ''} ${item.name}`.toLowerCase();
            if (/pozione|unguento|balsamo/.test(key)) return 'potion';
            if (/ascia/.test(key)) return 'axe';
            if (/pugnale/.test(key)) return 'sword';
            if (/corazza/.test(key)) return 'armor';
            if (/balsamo/.test(key)) return 'potion';
            if (/alabarda/.test(key)) return 'spear';
            if (/spada/.test(key)) return 'sword';
            if (/scudo/.test(key)) return 'shield';
            if (/armatura/.test(key)) return 'armor';
            if (/libro|tomo/.test(key)) return 'book';
            if (/amuleto/.test(key)) return 'amulet';
            if (/anello/.test(key)) return 'ring';
            return 'bag';
        }

        function itemCategory(item) {
            const icon = itemIconName(item);
            if (icon === 'potion') return 'consumable';
            if (['sword', 'axe', 'spear'].includes(icon)) return 'weapon';
            if (['shield', 'armor'].includes(icon)) return 'armor';
            return 'arcane';
        }

        // Icone raster in stile WC3 per tipo di oggetto; gli altri tipi usano l'icona SVG
        const ITEM_IMAGES = {
            axe: 'immagini/icone/BTNOrcMeleeUpOne.webp'
        };

        // Icone raster per singolo oggetto (id); hanno la precedenza su quelle per tipo
        const ITEM_IMAGES_BY_ID = {
            pugnale_rapido: 'immagini/icone/BTNArcaniteMelee.png',
            amuleto_viandante: 'immagini/icone/BTNNecklace.png',
            tomo_alchemico: 'immagini/icone/BTNSorceressMaster.png',
            corazza_nordica: 'immagini/icone/BTNLeatherUpgradeOne.png',
            balsamo_curativo: 'immagini/icone/BTNSnazzyPotion-Reforged.png',
            spada_affilata: 'immagini/icone/BTNSteelMelee.png',
            scudo_pesante: 'immagini/icone/BTNShieldOfHonor.png'
        };

        function itemImageSrc(item) {
            return ITEM_IMAGES_BY_ID[item.id] || ITEM_IMAGES[itemIconName(item)];
        }

        function itemIconInner(item) {
            const src = itemImageSrc(item);
            return src ? `<img class="item-img" src="${src}" alt="">` : svgIcon(itemIconName(item));
        }

        function itemIconHtml(item) {
            const hasImage = !!itemImageSrc(item);
            return `<span class="icon-frame ic-${itemCategory(item)} ${hasImage ? 'has-img' : ''}">${itemIconInner(item)}</span>`;
        }

        // Icone raster WC3 per abilità, indicizzate per id abilità; le altre usano l'icona SVG
        const ABILITY_IMAGES = {
            astarte_veleni: 'immagini/icone/BTNCorrosiveBreath.png',
            astarte_affondo: 'immagini/icone/BTNSacrifice.png',
            icaro_oro: 'immagini/icone/BTNMagicalSentry.png',
            icaro_trucchi: 'immagini/icone/BTNSilence-Reforged.png',
            ascadeo_ghiaccio: 'immagini/icone/BTNFreezingBreath.png',
            ascadeo_segnato: 'immagini/icone/BTNFrostWolf.png'
        };

        function abilityIconHtml(ability) {
            const src = ABILITY_IMAGES[ability.id];
            if (src) return `<span class="icon-frame ic-arcane has-img"><img class="item-img" src="${src}" alt=""></span>`;
            return `<span class="icon-frame ic-arcane">${svgIcon(ability.isCombatActive ? 'star' : 'rune')}</span>`;
        }

        function abilityCmdIconHtml(ability) {
            const src = ABILITY_IMAGES[ability.id];
            return src ? `<img class="cmd-img" src="${src}" alt="">` : svgIcon('star');
        }

        function abilityMarkHtml(ability) {
            const src = ABILITY_IMAGES[ability.id];
            return src ? `<img class="ability-mark" src="${src}" alt="">` : '★';
        }

        // Ritratti degli eroi per nome; senza ritratto si usa l'iniziale su sfondo colorato.
        // pos = punto dell'immagine da tenere al centro, zoom = ingrandimento sul volto
        // woundedSrc = ritratto usato quando gli HP scendono a woundedHp o meno
        const HERO_PORTRAITS = {
            'Icaro': {
                src: 'immagini/ritratti/icaro.jpg',
                woundedSrc: 'immagini/ritratti/icaro_ferito.jpg',
                woundedHp: 2,
                pos: '58% 42%',
                zoom: 1.6
            }
        };

        // Precarica i ritratti "feriti" per evitare lo sfarfallio al cambio
        Object.values(HERO_PORTRAITS).forEach(p => { if (p.woundedSrc) new Image().src = p.woundedSrc; });

        function heroPortraitInner(name, hp) {
            const p = HERO_PORTRAITS[name];
            if (!p) return `<span>${name.charAt(0)}</span>`;
            const wounded = p.woundedSrc && typeof hp === 'number' && hp <= p.woundedHp;
            const src = wounded ? p.woundedSrc : p.src;
            return `<img class="portrait-img" src="${src}" alt="${name}" style="object-position:${p.pos}; transform:scale(${p.zoom}); transform-origin:${p.pos};">`;
        }

        function heroPortraitClass(name) {
            return HERO_PORTRAITS[name] ? 'has-portrait' : '';
        }

        const HERO_HUES = [4, 212, 38, 285, 130];
        function heroHue(name) {
            const idx = campaignHeroes.findIndex(b => b.name === name);
            if (idx >= 0) return HERO_HUES[idx % HERO_HUES.length];
            let hash = 0;
            for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
            return hash;
        }

        function clampPct(value, max) {
            return max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
        }

        function hpClass(pct) {
            return pct > 60 ? '' : (pct > 30 ? 'hp-mid' : 'hp-low');
        }

        function heroCardHtml(h) {
            const hpPct = clampPct(h.hp, h.maxHp);
            const armorMax = Math.max(h.base_armor, h.current_armor);
            const armorPct = clampPct(h.current_armor, armorMax);
            const slotCount = Math.max(3, h.items.length);
            let slots = '';
            for (let i = 0; i < slotCount; i++) {
                const it = h.items[i];
                if (!it) { slots += `<div class="inv-slot empty"></div>`; continue; }
                const usable = it.type && it.type.startsWith('consumable');
                const tip = `${it.name}||${it.desc}${usable ? '<br><span class="tip-hint">Clicca per usare</span>' : ''}`;
                const hasImage = !!itemImageSrc(it);
                slots += `<div class="inv-slot ic-${itemCategory(it)} ${usable ? 'usable' : ''} ${hasImage ? 'has-img' : ''}" data-tip="${esc(tip)}" ${usable ? `onclick="useConsumableFromTopbar('${h.name}', ${i})"` : ''}>${itemIconInner(it)}</div>`;
            }

            return `
                <div class="hero-mini-card ${h.hp <= 0 ? 'dead' : ''} ${heroTurnClass(h)}" data-hero="${esc(h.name)}">
                    <div class="hero-portrait ${heroPortraitClass(h.name)}" style="--hue:${heroHue(h.name)}">${heroPortraitInner(h.name, h.hp)}</div>
                    <div class="hero-bars">
                        <div class="hero-card-name" title="${esc(h.name)}">${h.name}</div>
                        <div class="hp-bar-container" data-tip="Punti Vita||${h.hp} su ${h.maxHp}">
                            <div class="hp-bar-fill ${hpClass(hpPct)}" style="width: ${hpPct}%;"></div>
                            <div class="hp-bar-text">${h.hp}/${h.maxHp}</div>
                        </div>
                        <div class="hp-bar-container armor" data-tip="Armatura||${h.current_armor} attuale su ${h.base_armor} base. Assorbe i danni prima degli HP e si rigenera a ogni scontro.">
                            <div class="hp-bar-fill" style="width: ${armorPct}%;"></div>
                            <div class="hp-bar-text">${h.current_armor}/${h.base_armor}</div>
                        </div>
                    </div>
                    <div class="hero-stats">
                        <span data-tip="Forza||Si somma ai tiri di attacco, difesa e aiuto."><i>FOR</i>${h.str}</span>
                        <span data-tip="Intelligenza||Usata nelle prove di intelletto."><i>INT</i>${h.int}</span>
                        <span data-tip="Fede||Usata nelle prove di fede."><i>FED</i>${h.fth}</span>
                        <span data-tip="Danno||Danni inflitti con un attacco riuscito."><i>DAN</i>${h.dmg}</span>
                    </div>
                    ${h.chosenAbility ? `<div class="hero-ability" data-tip="${esc(h.chosenAbility.name + "||" + (h.chosenAbility.desc || ""))}">${abilityMarkHtml(h.chosenAbility)} ${h.chosenAbility.name}</div>` : ""}
                    <div class="hero-inventory">${slots}<span class="inv-label">Zaino</span></div>
                </div>`;
        }

        const NODE_ICON = { combat: 'sword', elite: 'skull', challenge: 'question', rest: 'fire', merchant: 'pouch', treasure: 'chest', captain: 'crown' };
        const NODE_LABEL = { combat: 'Scontro', elite: 'Scontro Elite', challenge: 'Sfida', rest: 'Riposo', merchant: 'Mercante', treasure: 'Tesoro', captain: 'Meta' };

        function renderMapLegend() {
            const legend = document.getElementById('mapLegend');
            if (legend.childElementCount > 0) return;
            legend.innerHTML = ['combat', 'elite', 'challenge', 'treasure', 'merchant', 'rest'].map(type => `
                <span><span class="sts-node node-${type} legend-dot">${svgIcon(NODE_ICON[type])}</span>${NODE_LABEL[type]}</span>
            `).join('') + `<span><span class="sts-node node-goal legend-dot">${svgIcon('crown')}</span>Meta</span>`;
        }

        /* ---------- Finestra modale ---------- */
        function openModal(title, bodyHtml, actions, options = {}) {
            document.querySelector('#wc3Modal .modal-box').classList.toggle('wide', !!options.wide);
            document.getElementById('wc3ModalTitle').textContent = title;
            document.getElementById('wc3ModalBody').innerHTML = bodyHtml;
            const actionsBox = document.getElementById('wc3ModalActions');
            actionsBox.innerHTML = '';
            (actions || [{ label: 'OK' }]).forEach(action => {
                const btn = document.createElement('button');
                btn.textContent = action.label;
                if (action.className) btn.className = action.className;
                if (action.disabled) btn.disabled = true;
                btn.addEventListener('click', () => {
                    closeModal();
                    if (action.onClick) action.onClick();
                });
                actionsBox.appendChild(btn);
            });
            document.getElementById('wc3Modal').classList.remove('hidden');
            const first = actionsBox.querySelector('button:not(:disabled)');
            if (first) first.focus();
        }

        function closeModal() {
            document.getElementById('wc3Modal').classList.add('hidden');
        }

        // Gli avvisi del gioco usano la finestra in stile WC3 invece di quella del browser
        window.alert = function(message) {
            openModal('Avviso', `<p>${message}</p>`, [{ label: 'OK' }]);
        };

        /* ---------- Tooltip ---------- */
        const tooltipEl = document.getElementById('wc3Tooltip');

        function positionTooltip(e) {
            const pad = 16;
            const rect = tooltipEl.getBoundingClientRect();
            let x = e.clientX + pad;
            let y = e.clientY + pad;
            if (x + rect.width > window.innerWidth - 8) x = e.clientX - rect.width - pad;
            if (y + rect.height > window.innerHeight - 8) y = e.clientY - rect.height - pad;
            tooltipEl.style.left = `${Math.max(8, x)}px`;
            tooltipEl.style.top = `${Math.max(8, y)}px`;
        }

        document.addEventListener('mouseover', e => {
            const target = e.target.closest('[data-tip]');
            if (!target) { tooltipEl.classList.remove('show'); return; }
            const [title, body] = target.dataset.tip.split('||');
            tooltipEl.innerHTML = `<div class="tip-title">${title}</div>${body ? `<div class="tip-body">${body}</div>` : ''}`;
            tooltipEl.classList.add('show');
            positionTooltip(e);
        });
        document.addEventListener('mousemove', e => {
            if (tooltipEl.classList.contains('show')) positionTooltip(e);
        });
        document.addEventListener('mousedown', () => tooltipEl.classList.remove('show'));

        /* ---------- Tasti rapidi (griglia QWER come la plancia comandi di WC3) ---------- */
        function isUsable(el) {
            return el && !el.disabled && el.offsetParent !== null;
        }

        document.addEventListener('keydown', e => {
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            const modalOpen = !document.getElementById('wc3Modal').classList.contains('hidden');
            if (modalOpen) {
                if (e.key === 'Escape') closeModal();
                return;
            }
            if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;

            const hotkeys = { q: 'cmdAttack', w: 'cmdDefend', e: 'cmdHelp', r: 'cmdItem', t: 'btnCombatAbility' };
            const cmd = document.getElementById(hotkeys[e.key.toLowerCase()]);
            if (isUsable(cmd)) { e.preventDefault(); cmd.click(); return; }

            if (e.key === ' ' && document.activeElement.tagName !== 'BUTTON') {
                const roll = ['rollCombatBtn', 'rollChallengeBtn', 'rollCaptainBtn']
                    .map(id => document.getElementById(id))
                    .find(isUsable);
                if (roll) { e.preventDefault(); roll.click(); }
            }
        });

        /* ---------- Segnaposto per immagini mancanti ---------- */
        function markMissingImage(img) {
            const box = img.parentElement;
            if (!box) return;
            box.classList.add('img-missing');
            box.setAttribute('data-alt', img.alt || '');
        }
        document.addEventListener('error', e => {
            if (e.target.tagName === 'IMG') markMissingImage(e.target);
        }, true);
        document.addEventListener('load', e => {
            if (e.target.tagName === 'IMG' && e.target.parentElement) e.target.parentElement.classList.remove('img-missing');
        }, true);
        document.querySelectorAll('img').forEach(img => {
            if (img.complete && img.naturalWidth === 0) markMissingImage(img);
        });

        /* ---------- Numeri fluttuanti e colpi ---------- */
        const fxLayer = document.createElement('div');
        fxLayer.className = 'fx-layer';
        document.body.appendChild(fxLayer);

        const fxHeroSeen = new WeakMap();   // eroe -> { hp, armor } dell'ultimo aggiornamento
        const fxEnemySeen = new WeakMap();  // nemico -> { hp, stunned }
        let fxNextEnemyHitCritical = false;

        // Scritte ravvicinate sullo stesso bersaglio vengono impilate per non sovrapporsi
        const fxStacks = new Map();

        function fxFloatOn(el, text, kind, delay = 0) {
            if (!gameOptions.floatingNumbers || !el || el.offsetParent === null) return;
            const rect = el.getBoundingClientRect();
            const key = el.id || el.dataset.hero || 'fx';
            const now = performance.now();
            const stack = fxStacks.get(key);
            const slot = stack && now - stack.time < 500 ? stack.slot + 1 : 0;
            fxStacks.set(key, { time: now, slot });

            const float = document.createElement('div');
            float.className = `fx-float ${kind}`;
            float.textContent = text;
            float.style.left = `${rect.left + rect.width / 2 + (Math.random() * 16 - 8)}px`;
            float.style.top = `${rect.top + Math.min(rect.height * 0.25, 40) - slot * 30}px`;
            float.style.animationDelay = `${delay}ms`;
            fxLayer.appendChild(float);
            setTimeout(() => float.remove(), 1200 + delay);
        }

        function fxHit(el) {
            if (!el || !animationsEnabled()) return;
            el.classList.remove('fx-hit');
            void el.offsetWidth;
            el.classList.add('fx-hit');
            setTimeout(() => el.classList.remove('fx-hit'), 450);
        }

        function heroCardEl(hero) {
            return document.querySelector(`.hero-mini-card[data-hero="${CSS.escape(hero.name)}"]`);
        }

        function fxFloatOnHero(hero, text, kind) {
            fxFloatOn(heroCardEl(hero), text, kind);
        }

        // Confronta HP e armatura degli eroi con l'aggiornamento precedente e mostra le variazioni
        function fxDiffHeroes() {
            party.forEach(hero => {
                const prev = fxHeroSeen.get(hero);
                fxHeroSeen.set(hero, { hp: hero.hp, armor: hero.current_armor });
                if (!prev) return;
                const card = heroCardEl(hero);
                const dHp = hero.hp - prev.hp;
                const dArmor = hero.current_armor - prev.armor;
                if (dHp < 0 || dArmor < 0) fxHit(card);
                if (dArmor < 0) fxFloatOn(card, `${dArmor} Armatura`, 'armor');
                if (dArmor > 0) fxFloatOn(card, `+${dArmor} Armatura`, 'armor');
                if (dHp < 0) fxFloatOn(card, `${dHp}`, 'dmg', dArmor !== 0 ? 180 : 0);
                if (dHp > 0) fxFloatOn(card, `+${dHp}`, 'heal');
            });
        }

        // Registra lo stato attuale senza animazioni (es. armature ripristinate a inizio scontro)
        function fxResyncHeroes() {
            party.forEach(hero => fxHeroSeen.set(hero, { hp: hero.hp, armor: hero.current_armor }));
        }

        function fxDiffEnemy() {
            if (!activeEnemy) return;
            const prev = fxEnemySeen.get(activeEnemy);
            fxEnemySeen.set(activeEnemy, { hp: activeEnemy.hp, stunned: activeEnemy.isStunned });
            const box = document.getElementById('enemyInfo');
            if (activeEnemy.hp > 0) box.classList.remove('defeated');
            if (!prev) return;
            if (activeEnemy.hp <= 0 && prev.hp > 0) onEnemyDefeated(box);
            const dHp = activeEnemy.hp - prev.hp;
            if (dHp < 0) {
                fxHit(box);
                fxFloatOn(box, `${dHp}`, fxNextEnemyHitCritical ? 'crit' : 'dmg');
            }
            if (activeEnemy.isStunned && !prev.stunned) fxFloatOn(box, 'Stordito', 'stun', 200);
            fxNextEnemyHitCritical = false;
        }

        /* ---------- Testo narrativo a macchina da scrivere ---------- */
        const TYPE_MIN_LENGTH = 40;
        const typingState = new WeakMap();

        function stopTypewriter(box, reveal) {
            const state = typingState.get(box);
            if (!state) return;
            cancelAnimationFrame(state.raf);
            if (reveal) state.parts.forEach(p => { p.node.data = p.text; });
            box.classList.remove('typing');
            box.removeAttribute('title');
            typingState.delete(box);
        }

        function startTypewriter(box) {
            stopTypewriter(box, false);
            delete box.dataset.typePending;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || gameOptions.textSpeed <= 0) return;

            const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
            const parts = [];
            while (walker.nextNode()) parts.push({ node: walker.currentNode, text: walker.currentNode.data });
            const total = parts.reduce((sum, p) => sum + p.text.length, 0);
            if (total < TYPE_MIN_LENGTH) return;

            parts.forEach(p => { p.node.data = ''; });
            box.classList.add('typing');
            box.title = 'Clicca per mostrare tutto il testo';
            const state = { parts, raf: null, index: 0 };
            typingState.set(box, state);

            const step = () => {
                let budget = gameOptions.textSpeed;
                while (budget > 0 && state.index < parts.length) {
                    const p = parts[state.index];
                    const shown = p.node.data.length;
                    const take = Math.min(budget, p.text.length - shown);
                    p.node.data = p.text.slice(0, shown + take);
                    budget -= take;
                    if (p.node.data.length >= p.text.length) state.index++;
                }
                if (state.index < parts.length) state.raf = requestAnimationFrame(step);
                else stopTypewriter(box, true);
            };
            state.raf = requestAnimationFrame(step);
        }

        // Ogni volta che il gioco scrive un nuovo testo nel riquadro, parte l'effetto
        const typeObserver = new MutationObserver(mutations => {
            const boxes = new Set(mutations.map(m => m.target));
            boxes.forEach(box => {
                if (box.offsetParent === null) {
                    stopTypewriter(box, false);
                    box.dataset.typePending = '1';
                } else {
                    startTypewriter(box);
                }
            });
        });
        document.querySelectorAll('.narrative-desc-box').forEach(box => typeObserver.observe(box, { childList: true }));

        // Testi scritti mentre la schermata era nascosta: partono quando diventa visibile
        function startPendingTypewriters(screen) {
            screen.querySelectorAll('.narrative-desc-box[data-type-pending]').forEach(startTypewriter);
        }

        document.addEventListener('click', e => {
            const box = e.target.closest('.narrative-desc-box.typing');
            if (box) stopTypewriter(box, true);
        });

        /* ---------- 19. Opzioni di gioco ---------- */
        const DEFAULT_OPTIONS = { textSpeed: 2, textSize: 1, musicVolume: 0.5, sfxVolume: 0.8, animations: true, floatingNumbers: true };
        let gameOptions = Object.assign({}, DEFAULT_OPTIONS);
        try { Object.assign(gameOptions, JSON.parse(localStorage.getItem('dignitas_options') || '{}')); } catch (e) {}

        function saveOptions() {
            try { localStorage.setItem('dignitas_options', JSON.stringify(gameOptions)); } catch (e) {}
        }

        function animationsEnabled() {
            return gameOptions.animations && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }

        function applyOptions() {
            document.body.classList.toggle('no-anim', !gameOptions.animations);
            document.body.style.setProperty('--text-scale', gameOptions.textSize);
            const music = document.getElementById('menuMusic');
            if (!music.paused) {
                clearInterval(musicFadeTimer);
                music.volume = gameOptions.musicVolume;
            }
        }

        function openOptions() {
            const speeds = [[1, 'Lenta'], [2, 'Normale'], [4, 'Veloce'], [0, 'Istantanea']];
            const sizes = [[1, 'Normale'], [1.15, 'Grande'], [1.3, 'Molto grande']];
            const pct = v => Math.round(v * 100);
            openModal('Opzioni', `
                <div class="options-grid">
                    <div class="option-row">
                        <span class="option-label">Velocità del testo<small>Descrizioni scritte a macchina</small></span>
                        <select id="optTextSpeed">${speeds.map(([v, l]) => `<option value="${v}" ${gameOptions.textSpeed === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Dimensione del testo<small>Descrizioni, registro, oggetti e finestre</small></span>
                        <select id="optTextSize">${sizes.map(([v, l]) => `<option value="${v}" ${gameOptions.textSize === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Audio<small>Musica ed effetti sonori</small></span>
                        <label class="option-toggle"><input type="checkbox" id="optMuted" ${soundMuted ? 'checked' : ''}> Silenzia tutto</label>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Volume musica</span>
                        <div class="option-range"><input type="range" id="optMusic" min="0" max="100" value="${pct(gameOptions.musicVolume)}"><output id="optMusicOut">${pct(gameOptions.musicVolume)}%</output></div>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Volume effetti</span>
                        <div class="option-range"><input type="range" id="optSfx" min="0" max="100" value="${pct(gameOptions.sfxVolume)}"><output id="optSfxOut">${pct(gameOptions.sfxVolume)}%</output></div>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Effetti animati<small>Titoli degli eventi, scrigno, carte, tremolii</small></span>
                        <label class="option-toggle"><input type="checkbox" id="optAnim" ${gameOptions.animations ? 'checked' : ''}> Attivi</label>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Numeri fluttuanti<small>Danni, cure e armatura sopra i bersagli</small></span>
                        <label class="option-toggle"><input type="checkbox" id="optNumbers" ${gameOptions.floatingNumbers ? 'checked' : ''}> Attivi</label>
                    </div>
                </div>`,
                [
                    { label: 'Chiudi', className: 'btn-proceed' },
                    { label: 'Ripristina predefinite', onClick: () => { gameOptions = Object.assign({}, DEFAULT_OPTIONS); saveOptions(); applyOptions(); openOptions(); } }
                ]);

            const bind = (id, event, handler) => document.getElementById(id).addEventListener(event, e => { handler(e.target); saveOptions(); });
            bind('optTextSpeed', 'change', el => { gameOptions.textSpeed = Number(el.value); });
            bind('optTextSize', 'change', el => { gameOptions.textSize = Number(el.value); applyOptions(); });
            document.getElementById('optMuted').addEventListener('change', e => setSoundMuted(e.target.checked));
            bind('optMusic', 'input', el => {
                gameOptions.musicVolume = el.value / 100;
                document.getElementById('optMusicOut').textContent = `${el.value}%`;
                applyOptions();
            });
            bind('optSfx', 'input', el => {
                gameOptions.sfxVolume = el.value / 100;
                document.getElementById('optSfxOut').textContent = `${el.value}%`;
            });
            document.getElementById('optSfx').addEventListener('change', () => playSfx(CLICK_SFX, 0.8));
            bind('optAnim', 'change', el => { gameOptions.animations = el.checked; applyOptions(); });
            bind('optNumbers', 'change', el => { gameOptions.floatingNumbers = el.checked; });
        }

        /* ---------- Schermata del capitolo prima della mappa ---------- */
        function startExpedition() {
            if (!animationsEnabled() || !currentCampaign) { startMap(); return; }

            const overlay = document.createElement('div');
            overlay.className = 'chapter-overlay';
            overlay.innerHTML = `
                <div class="chapter-content">
                    <div class="chapter-kicker">La spedizione ha inizio</div>
                    <div class="chapter-title">${currentCampaign.title}</div>
                    <div class="chapter-rule"></div>
                    <div class="chapter-sub">${currentCampaign.badge || ''}</div>
                    <div class="chapter-skip">Clicca per continuare</div>
                </div>`;
            document.body.appendChild(overlay);
            void overlay.offsetWidth;
            overlay.classList.add('show');

            // La mappa viene preparata sotto lo schermo nero, poi il titolo sfuma
            let finished = false;
            const finish = () => {
                if (finished) return;
                finished = true;
                clearTimeout(autoTimer);
                startMap();
                overlay.classList.remove('show');
                setTimeout(() => overlay.remove(), 850);
            };
            const autoTimer = setTimeout(finish, 3200);
            setTimeout(() => overlay.addEventListener('click', finish), 400);
        }

        /* ---------- 1 e 6. Eroe di turno e barra dei turni ---------- */
        function heroTurnClass(h) {
            if (currentScreenId !== 'screenCombat' || h.hp <= 0) return '';
            if (combatPhase === 'heroes') {
                if (h === currentActiveHero && !h.hasActed) return 'is-turn';
                if (h.hasActed) return 'has-acted';
                return currentActiveHero ? 'is-waiting' : '';
            }
            if (combatPhase === 'monster') return 'is-waiting';
            return '';
        }

        function renderTurnBar() {
            const bar = document.getElementById('turnOrderBar');
            if (!bar) return;
            if (currentScreenId !== 'screenCombat' || !activeEnemy || combatPhase === 'none') { bar.innerHTML = ''; return; }

            const heroChips = party.filter(h => h.hp > 0).map(h => {
                const state = combatPhase === 'won' || h.hasActed ? 'done' : (h === currentActiveHero ? 'current' : '');
                const note = state === 'done' ? 'Ha già agito in questo round' : (state === 'current' ? 'Sta agendo' : 'Deve ancora agire');
                const inner = HERO_PORTRAITS[h.name] ? heroPortraitInner(h.name, h.hp) : h.name.charAt(0);
                return `<span class="turn-chip ${state}" style="--hue:${heroHue(h.name)}" data-tip="${esc(h.name)}||${note}">${inner}</span>`;
            }).join('');
            const enemyState = combatPhase === 'monster' ? 'current' : (combatPhase === 'won' ? 'done' : '');
            const enemyNote = combatPhase === 'monster' ? 'Sta attaccando' : (combatPhase === 'won' ? 'Sconfitto' : 'Attacca dopo la compagnia');
            bar.innerHTML = `
                <span class="turn-round">Round ${combatRound}</span>
                ${heroChips}
                <span class="turn-sep">▶</span>
                <span class="turn-chip enemy ${enemyState}" data-tip="${esc(activeEnemy.name)}||${enemyNote}">${svgIcon('skull')}</span>`;
        }

        /* ---------- 7. Nemico sconfitto ---------- */
        function onEnemyDefeated(box) {
            combatPhase = 'won';
            expeditionStats.combatsWon++;
            box.classList.add('defeated');
            const stamp = document.createElement('div');
            stamp.className = 'victory-stamp';
            stamp.textContent = 'Vittoria!';
            box.appendChild(stamp);
            document.getElementById('combatLootBtn').classList.add('btn-attention');
        }

        /* ---------- 10. Avanzamento della spedizione ---------- */
        function renderExpeditionProgress(maxLevel) {
            const el = document.getElementById('expeditionProgress');
            const doneLevels = stsMapNodes.filter(n => n.done).map(n => n.level);
            const completed = doneLevels.length ? Math.max(...doneLevels) + 1 : 0;
            const total = maxLevel + 1;
            let segments = '';
            for (let level = 0; level < total; level++) {
                const cls = level < completed ? 'done' : (level === completed ? 'current' : '');
                segments += `<span class="progress-seg ${cls}"></span>`;
            }
            el.innerHTML = `
                <span class="progress-label">Livello ${Math.min(completed + 1, total)} / ${total}</span>
                <div class="progress-track">${segments}</div>
                <span class="progress-boss ${completed >= total ? 'reached' : ''}" data-tip="Meta finale||Livello ${total}">${svgIcon('crown')}</span>`;
        }

        /* ---------- 11. Scrigno che si apre ---------- */
        // Restituisce dopo quanti ms lo scrigno è aperto (0 se le animazioni sono disattivate)
        function playChestAnimation() {
            if (!animationsEnabled()) return 0;
            const overlay = document.createElement('div');
            overlay.className = 'chest-overlay';
            overlay.innerHTML = `
                <div class="chest-stage">
                    <div class="chest-rays"></div>
                    <svg class="chest-svg" viewBox="0 0 220 200" aria-hidden="true">
                        <defs>
                            <linearGradient id="chestWood" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stop-color="#7a4a22"/><stop offset="1" stop-color="#2e1706"/>
                            </linearGradient>
                        </defs>
                        <ellipse class="chest-glow" cx="110" cy="90" rx="72" ry="12" fill="#ffe28a"/>
                        <rect x="30" y="88" width="160" height="82" rx="4" fill="url(#chestWood)" stroke="#000" stroke-width="3"/>
                        <rect x="30" y="100" width="160" height="9" fill="url(#gradGold)" stroke="#000"/>
                        <rect x="30" y="150" width="160" height="9" fill="url(#gradGold)" stroke="#000"/>
                        <rect x="58" y="88" width="12" height="82" fill="url(#gradGold)" stroke="#000"/>
                        <rect x="150" y="88" width="12" height="82" fill="url(#gradGold)" stroke="#000"/>
                        <rect x="97" y="94" width="26" height="28" rx="3" fill="url(#gradGold)" stroke="#000" stroke-width="2"/>
                        <circle cx="110" cy="106" r="4" fill="#000"/><rect x="108.5" y="106" width="3" height="9" fill="#000"/>
                        <g class="chest-lid">
                            <path d="M30 88 V68 Q30 44 62 44 H158 Q190 44 190 68 V88 Z" fill="url(#chestWood)" stroke="#000" stroke-width="3"/>
                            <rect x="58" y="45" width="12" height="43" fill="url(#gradGold)" stroke="#000"/>
                            <rect x="150" y="45" width="12" height="43" fill="url(#gradGold)" stroke="#000"/>
                            <rect x="30" y="78" width="160" height="10" fill="url(#gradGold)" stroke="#000"/>
                        </g>
                    </svg>
                </div>`;
            document.body.appendChild(overlay);
            setTimeout(() => overlay.remove(), 1600);
            return 1250;
        }

        /* ---------- 12. Monete che volano verso il contatore ---------- */
        let displayedCoins = 0;
        let coinFlightDelay = 0;
        let coinTickTimeout = null;
        const COIN_FLY_SCREENS = ['screenLoot', 'screenTreasureLoot', 'screenCombat', 'screenChallenge', 'screenRest'];

        function setCoinText(value) {
            document.getElementById('topBarCoins').textContent = value;
        }

        function coinSourceElement() {
            const sources = { screenLoot: 'lootCoinsText', screenTreasureLoot: 'treasureCoinsText', screenCombat: 'enemyInfo' };
            return document.getElementById(sources[currentScreenId] || 'gameContainer');
        }

        let coinTickInterval = null;

        // Timer invece di requestAnimationFrame: il valore finale arriva anche con la scheda in background
        function tickCoinCounter(from, to, delay, duration, onDone) {
            clearTimeout(coinTickTimeout);
            clearInterval(coinTickInterval);
            coinTickTimeout = setTimeout(() => {
                const start = Date.now();
                coinTickInterval = setInterval(() => {
                    const p = Math.min(1, (Date.now() - start) / duration);
                    setCoinText(Math.round(from + (to - from) * p));
                    if (p >= 1) {
                        clearInterval(coinTickInterval);
                        if (onDone) onDone();
                    }
                }, 30);
            }, delay);
        }

        function spawnFlyingCoins(srcEl, dstEl, count, delay) {
            const s = srcEl.getBoundingClientRect();
            const d = dstEl.getBoundingClientRect();
            for (let i = 0; i < count; i++) {
                const coin = document.createElement('div');
                coin.className = 'fly-coin';
                coin.innerHTML = '<span class="coin"></span>';
                coin.style.left = `${s.left + s.width / 2 + (Math.random() * 60 - 30)}px`;
                coin.style.top = `${s.top + s.height / 2 + (Math.random() * 40 - 20)}px`;
                coin.style.opacity = '0';
                document.body.appendChild(coin);
                setTimeout(() => {
                    coin.style.opacity = '1';
                    coin.style.left = `${d.left + 20}px`;
                    coin.style.top = `${d.top + d.height / 2}px`;
                }, delay + i * 70);
                setTimeout(() => { coin.style.opacity = '0'; }, delay + i * 70 + 720);
                setTimeout(() => coin.remove(), delay + i * 70 + 950);
            }
        }

        function animateCoinCounter(target) {
            const diff = target - displayedCoins;
            if (diff === 0) { setCoinText(target); return; }
            const from = displayedCoins;
            displayedCoins = target;
            const wrap = document.getElementById('topBarCoinsWrap');
            const gained = diff > 0 && COIN_FLY_SCREENS.includes(currentScreenId);
            const spent = diff < 0 && currentScreenId === 'screenMerchant';
            if (gained) expeditionStats.coinsEarned += diff;

            if (!animationsEnabled() || (!gained && !spent)) { setCoinText(target); return; }

            if (gained) {
                spawnFlyingCoins(coinSourceElement(), wrap, Math.min(diff, 10), coinFlightDelay);
                tickCoinCounter(from, target, coinFlightDelay + 650, 500, () => {
                    wrap.classList.remove('coin-bump');
                    void wrap.offsetWidth;
                    wrap.classList.add('coin-bump');
                });
            } else {
                wrap.classList.add('coin-spend');
                tickCoinCounter(from, target, 0, 400, () => wrap.classList.remove('coin-spend'));
            }
        }

        /* ---------- 13. Oggetti rivelati come carte ---------- */
        function revealAsCard(el, delay) {
            if (!el || !animationsEnabled()) return;
            el.classList.remove('card-reveal');
            void el.offsetWidth;
            el.style.animationDelay = `${delay}ms`;
            el.classList.add('card-reveal');
            setTimeout(() => { el.classList.remove('card-reveal'); el.style.animationDelay = ''; }, delay + 700);
        }

        /* ---------- 14. Reliquia ottenuta / maledizione subita ---------- */
        function showOutcomeOverlay(kind, data) {
            const isRelic = kind === 'relic';
            const overlay = document.createElement('div');
            overlay.className = `outcome-overlay ${isRelic ? '' : 'curse'}`;
            overlay.innerHTML = `
                <div class="outcome-card">
                    <div class="${isRelic ? 'outcome-sparkles' : 'outcome-smoke'}"></div>
                    <div class="outcome-icon"><img src="${isRelic ? 'immagini/icone/BTNEnchantedGemstone-Reforged.png' : 'immagini/icone/BTNOrbOfCorruption-Reforged.png'}" alt=""></div>
                    <div class="outcome-kind">${isRelic ? 'Reliquia ottenuta' : 'Maledizione subita'}</div>
                    <div class="outcome-name">${data.name}</div>
                    <div class="outcome-desc">${data.desc || ''}</div>
                    <div class="outcome-hint">Clicca per continuare</div>
                </div>`;

            let closed = false;
            const close = () => {
                if (closed) return;
                closed = true;
                overlay.classList.add('closing');
                setTimeout(() => overlay.remove(), 300);
                const counter = document.getElementById(isRelic ? 'topBarRelicsWrap' : 'topBarCursesWrap');
                counter.classList.remove('relic-flash');
                void counter.offsetWidth;
                counter.classList.add('relic-flash');
                setTimeout(() => counter.classList.remove('relic-flash'), 1900);
            };
            overlay.addEventListener('click', close);
            document.body.appendChild(overlay);
            setTimeout(close, 5000);
        }

        /* ---------- 16. Diario della compagnia ---------- */
        function openJournal() {
            if (party.length === 0) {
                alert('Nessuna spedizione in corso: recluta prima la compagnia.');
                return;
            }

            const heroesHtml = party.map(h => {
                const bonuses = [];
                if (h.att_bonus) bonuses.push(`<span class="stat-chip"><i>ATT</i>+${h.att_bonus}</span>`);
                if (h.att_penalty) bonuses.push(`<span class="stat-chip"><i>ATT</i>-${h.att_penalty}</span>`);
                if (h.def_bonus) bonuses.push(`<span class="stat-chip"><i>DIF</i>+${h.def_bonus}</span>`);
                if (h.help_bonus_val) bonuses.push(`<span class="stat-chip"><i>AIUTO</i>+${h.help_bonus_val}</span>`);
                const items = h.items.length
                    ? h.items.map(it => `<div class="journal-item">${itemIconHtml(it)}<span><b>${it.name}</b> — ${it.desc}</span></div>`).join('')
                    : '<span class="journal-empty">Zaino vuoto</span>';
                return `
                    <div class="journal-hero ${h.hp <= 0 ? 'dead' : ''}">
                        <div class="hero-portrait ${heroPortraitClass(h.name)}" style="--hue:${heroHue(h.name)}">${heroPortraitInner(h.name, h.hp)}</div>
                        <div>
                            <div class="journal-hero-name">${h.name}</div>
                            <div class="journal-hero-hp">HP ${h.hp}/${h.maxHp} · Armatura ${h.current_armor}/${h.base_armor}${h.hp <= 0 ? ' · Caduto' : ''}</div>
                        </div>
                        <span class="stat-chips">
                            <span class="stat-chip"><i>FOR</i>${h.str}</span>
                            <span class="stat-chip"><i>INT</i>${h.int}</span>
                            <span class="stat-chip"><i>FED</i>${h.fth}</span>
                            <span class="stat-chip"><i>DAN</i>${h.dmg}</span>
                            ${bonuses.join('')}
                        </span>
                        ${h.chosenAbility ? `<div class="journal-line">${abilityMarkHtml(h.chosenAbility)} <b>${h.chosenAbility.name}</b>${h.chosenAbility.desc ? ` — ${h.chosenAbility.desc}` : ''}</div>` : ''}
                        <div class="journal-items">${items}</div>
                    </div>`;
            }).join('');

            const relics = unlockedRelics.length
                ? unlockedRelics.map(r => `<div class="relic"><b>${r.name}</b> — ${r.desc}</div>`).join('')
                : '<span class="journal-empty">Nessuna reliquia ottenuta</span>';
            const curses = activeCurses.length
                ? activeCurses.map(c => `<div class="curse">${c}</div>`).join('')
                : '<span class="journal-empty">Nessuna maledizione attiva</span>';

            const doneLevels = stsMapNodes.filter(n => n.done).map(n => n.level);
            const totalLevels = stsMapNodes.length ? Math.max(...stsMapNodes.map(n => n.level)) + 1 : 0;
            const stat = (value, label) => `<div class="journal-stat"><b>${value}</b><span>${label}</span></div>`;

            openModal(`Diario — ${currentCampaign ? currentCampaign.title : 'Spedizione'}`, `
                <div class="journal-section"><h4>La Compagnia</h4><div class="journal-heroes">${heroesHtml}</div></div>
                <div class="journal-section"><h4>Reliquie</h4><div class="journal-list">${relics}</div></div>
                <div class="journal-section"><h4>Maledizioni</h4><div class="journal-list">${curses}</div></div>
                <div class="journal-section"><h4>La Spedizione</h4>
                    <div class="journal-stats">
                        ${stat(`${doneLevels.length ? Math.max(...doneLevels) + 1 : 0} / ${totalLevels}`, 'Livelli superati')}
                        ${stat(expeditionStats.combatsWon, 'Scontri vinti')}
                        ${stat(expeditionStats.challengesPassed, 'Sfide superate')}
                        ${stat(expeditionStats.challengesFailed, 'Sfide fallite')}
                        ${stat(expeditionStats.coinsEarned, 'Monete raccolte')}
                        ${stat(expeditionStats.itemsFound, 'Oggetti trovati')}
                        ${stat(`${party.filter(h => h.hp > 0).length} / ${party.length}`, 'Eroi in piedi')}
                    </div>
                </div>`,
                [{ label: 'Chiudi', className: 'btn-proceed' }],
                { wide: true });
        }

        /* ---------- 17. Conferma prima di lasciare mercante e tesoro ---------- */
        function confirmLeaveMerchant() {
            const affordable = merchantItemsWithPrices.some(entry => entry && partyCoins >= entry.price);
            if (!affordable) { advanceNode(); return; }
            openModal('Lasciare il mercante?',
                `<p>Hai ancora <b style="color:var(--wc-yellow)">${partyCoins}</b> monete e ci sono oggetti che puoi permetterti.</p>`,
                [{ label: 'Resta nel negozio', className: 'btn-proceed' }, { label: 'Esci comunque', className: 'btn-danger', onClick: advanceNode }]);
        }

        function confirmLeaveTreasure() {
            const left = currentTreasureItems.filter(Boolean).length;
            if (left === 0) { advanceNode(); return; }
            openModal('Lasciare il tesoro?',
                `<p>Nello scrigno ${left === 1 ? 'resta ancora <b>1</b> oggetto' : `restano ancora <b>${left}</b> oggetti`} da prelevare.</p>`,
                [{ label: 'Torna allo scrigno', className: 'btn-proceed' }, { label: 'Prosegui comunque', className: 'btn-danger', onClick: advanceNode }]);
        }

        applyOptions();

        /* ---------- Braci di sfondo ---------- */
        (function spawnEmbers() {
            const box = document.getElementById('embers');
            for (let i = 0; i < 22; i++) {
                const ember = document.createElement('span');
                const size = 2 + Math.random() * 3;
                ember.style.left = `${Math.random() * 100}%`;
                ember.style.width = ember.style.height = `${size}px`;
                ember.style.animationDuration = `${9 + Math.random() * 9}s`;
                ember.style.animationDelay = `${-Math.random() * 18}s`;
                ember.style.setProperty('--drift', `${Math.random() * 140 - 70}px`);
                box.appendChild(ember);
            }
        })();

        updatePartyStatusBars();
