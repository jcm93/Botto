module.exports = {
    name: 'random',
    execute(client, interaction, args) {
        const Discord = require('discord.js');
        const fetch = require('node-fetch');
        var tools = require('./../tools.js');
        const Guild = client.guilds.cache.get(interaction.guild_id); // Getting the guild.
        const Member = Guild.members.cache.get(interaction.member.user.id); // Getting the member.
        if (Member.voice.channel) {
            var mems = client.channels.cache.get(Member.voice.channelID).members;
            var memarray = [];
            var memlist = ""
            for (let [snowflake, guildMember] of mems){
                if(guildMember.displayName !== "Botto"){
                    memarray.push(guildMember.displayName)
                    memlist = memlist + guildMember.displayName + "\n"
                }
            }
        }
        if(args[0].name =="racer") {
            var tier = ""
            var canon = ""
            var vc = false
            var Tiernames = ["Top", "High", "Mid", "Low"]
            if (args[0].hasOwnProperty("options")) {
                for (let i = 0; i<args[0].options.length; i++) {
                    if (args[0].options[i].name == "tier") { //any/top/high/mid/low
                        tier = args[0].options[i].value
                    } else if (args[0].options[i].name == "canon") {
                        if(args[0].options[i].value == "canon") {
                            canon = true
                        } else if (args[0].options[i].value == "non-canon"){
                            canon = false
                        }
                    } else if (args[0].options[i].name == "vc") {
                        vc = args[0].options[i].value
                    }
                }
            }
            console.log(canon, tier)
            var pool = []
            for (let i = 0; i<racers.length; i++) {
                if (tier === "" || tier === "any"){
                    if(canon ==="" || canon === "any") { //any
                        pool.push(i)
                    } else if(canon == racers[i].canon) {
                        pool.push(i)
                    }
                } else if(tier == racers[i].mu_tier) {
                    if(canon ==="" || canon === "any") { //any
                        pool.push(i)
                    } else if(canon == racers[i].canon) {
                        pool.push(i)
                    } 
                } 
            }
            var poolsave = [...pool]
            if(pool.length == 0){
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: {
                            content: "`Error: No racers meet that criteria`\n" + errorMessage[Math.floor(Math.random()*errorMessage.length)],
                        }
                    }
                })
            }
            if (vc) {
                if (!Member.voice.channel) {
                    client.api.interactions(interaction.id, interaction.token).callback.post({
                        data: {
                            type: 4,
                            data: {
                                content: "`Error: To roll a random racer for everyone in the voice channel, you need to be in a voice channel.`\n" +errorMessage[Math.floor(Math.random()*errorMessage.length)],
                            }
                        }
                    })
                } else {
                    var podlist = "";
                    var desc = "Rolled random "
                    for(let i=0; i<memarray.length; i++) {
                        if(pool.length == 0){
                            pool = [...poolsave]
                        }
                        var randompod = Math.floor(Math.random()*pool.length)
                        podlist = podlist + racers[pool[randompod]].flag + " " + racers[pool[randompod]].name + "\n"
                        pool.splice(randompod, 1)
                    }
                    if (canon) {
                        desc = desc + "canonical "
                    } else if(canon===false) {
                        desc = desc + "non-canonical "
                    }
                    if(tier !== "" && tier !== "any") {
                        desc = desc + Tiernames[tier].toLowerCase() + " tier pods"
                    } else {
                        desc = desc + " pods"
                    }
                    const racerEmbed = new Discord.MessageEmbed()
                        .setFooter("/random")
                        .setTitle("Random Racers")
                        .setDescription(desc)
                        .addField("Players", memlist, true)
                        .addField("Pods", podlist, true)
                        .addField('\u200B', '\u200B', true)
                    client.api.interactions(interaction.id, interaction.token).callback.post({
                        data: {
                            type: 3,
                            data: {
                                //content: "",
                                embeds: [racerEmbed]
                            }
                        }
                    })
                }
            } else {
                var randomracer = pool[Math.floor(Math.random()*pool.length)]
                var Tier = ["Top", "High", "Mid", "Low"]
                var boost = racers[randomracer].boost_thrust
                var heatrate = racers[randomracer].heat_rate
                var coolrate = tools.upgradeCooling(racers[randomracer].cool_rate, 5)
                var topspeed = tools.upgradeTopSpeed(racers[randomracer].max_speed, 5)
                var avgspeedmu = tools.avgSpeed(topspeed,boost,heatrate,coolrate)
                var avgspeednu = tools.avgSpeed(racers[randomracer].max_speed,boost,heatrate,racers[randomracer].cool_rate)
                const racerEmbed = new Discord.MessageEmbed()
                    .setFooter("/random")
                    .setThumbnail(racers[randomracer].img)
                    .setColor('#00DE45')
                    .setTitle(racers[randomracer].flag + " " + racers[randomracer].name)
                    .setDescription("(" + (randomracer + 1) + ") " + racers[randomracer].intro)
                    .addField("Pod", racers[randomracer].Pod, false)
                    .addField("Species: " + racers[randomracer].species, "Homeworld: " + racers[randomracer].homeworld, true)
                    .addField("Favorite", tracks[racers[randomracer].favorite].name, true)
                    .addField("Voice Actor", racers[randomracer].voice, true)
                    .addField("Tier", Tier[racers[randomracer].nu_tier] + " | " + Tier[racers[randomracer].mu_tier], true)
                    .addField("Average Speed", Math.round(avgspeednu) + " | " + Math.round(avgspeedmu), true)
                    .addField("Max Turn Rate", racers[randomracer].max_turn_rate + "°/s", true)
                    .setImage(racers[randomracer].stats)
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 3,
                        data: {
                            //content: "",
                            embeds: [racerEmbed]
                        }
                    }
                })
            }
        } else if(args[0].name=="track") {
            var circuit = ""
            var planet = ""
            var length = ""
            var difficulty = ""
            if (args[0].hasOwnProperty("options")) {
                for (let i = 0; i<args[0].options.length; i++) {
                    if (args[0].options[i].name == "circuit") {
                        for(let j=0; j<circuits.length; j++) {
                            if(args[0].options[i].value == circuits[j].name) {
                                circuit = j
                            }
                        }
                    } else if (args[0].options[i].name == "planet") {
                        for(let j=0; j<planets.length; j++) {
                            if(args[0].options[i].value == planets[j].name) {
                                planet = j
                            }
                        }
                    } else if (args[0].options[i].name == "length") {
                        length = args[0].options[i].value
                    } else if (args[0].options[i].name == "difficulty") {
                        for(let j=0; j<difficulties.length; j++) {
                            if(args[0].options[i].value == difficulties[j].name) {
                                difficulty = j
                            }
                        }
                    } 
                }
            }
            console.log(circuit, planet)
            var pool = []
            for(var i=0; i<tracks.length; i++) {
                pool.push(i)
            }
            if(circuit !== "" && circuit !== "any")  {
                for(var i=0; i<pool.length; i++) {
                    if(tracks[pool[i]].circuit !== circuit){
                        if(pool.indexOf(pool[i])>-1){
                            pool.splice(pool.indexOf(pool[i]), 1)
                            i=i-1 //note to self: don't be an idiot and forget stuff like this
                        }
                    }
                }
            }
            if(planet !== "" && planet !== "any")  {
                for(var i=0; i<pool.length; i++) {
                    if(tracks[pool[i]].planet !== planet){
                        if(pool.indexOf(pool[i])>-1){
                            pool.splice(pool.indexOf(pool[i]), 1)
                            i=i-1
                        }
                    }
                }
            }
            if(length !== "" && length !== "any")  {
                for(var i=0; i<pool.length; i++) {
                    if(tracks[pool[i]].lengthclass.replace("Extra ", "").toLowerCase() !== length){
                        if(pool.indexOf(pool[i])>-1){
                            pool.splice(pool.indexOf(pool[i]), 1)
                            i=i-1
                        }
                    }
                }
            }
            if(difficulty !== "" && difficulty !== "any")  {
                for(var i=0; i<pool.length; i++) {
                    if(tracks[pool[i]].difficulty !== difficulty){
                        if(pool.indexOf(pool[i])>-1){
                            pool.splice(pool.indexOf(pool[i]), 1)
                            i=i-1
                        }
                    }
                }
            }
            if(pool.length == 0){
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: {
                            content: "`Error: No tracks meet that criteria`\n" + errorMessage[Math.floor(Math.random()*errorMessage.length)],
                        }
                    }
                })
            }
            var numb = pool[Math.floor(Math.random()*pool.length)]
            const trackEmbed = new Discord.MessageEmbed()
                .setThumbnail(planets[tracks[numb].planet].img)
                .setColor(planets[tracks[numb].planet].color)
                .setImage(tracks[numb].img)
                .setTitle(tracks[numb].name)
                .setFooter("/random")
                .addField("Planet", planets[tracks[numb].planet].name, true)
                .addField("Circuit", circuits[tracks[numb].circuit].name + " - Race " + tracks[numb].cirnum, true)
                .addField("Favorite", racers[tracks[numb].favorite].flag + " " +racers[tracks[numb].favorite].name, true)
                .addField("Length", tracks[numb].lengthclass, true)
                .addField("Difficulty", difficulties[tracks[numb].difficulty].name, true)
                .addField("Abbreviation", tracks[numb].nickname.join(", "), true)
            let muurl = 'https://www.speedrun.com/api/v1/leaderboards/m1mmex12/level/' + tracks[numb].id + "/824owmd5?top=1&embed=players&var-789k49lw=xqkrk919&var-2lgz978p=81p7we17" //mu
            let nuurl = 'https://www.speedrun.com/api/v1/leaderboards/m1mmex12/level/' + tracks[numb].id + "/824owmd5?top=1&embed=players&var-789k49lw=z194gjl4&var-2lgz978p=81p7we17" //nu
            let skurl = 'https://www.speedrun.com/api/v1/leaderboards/m1mmex12/level/' + tracks[numb].id + "/824owmd5?top=1&embed=players&&var-2lgz978p=p125ev1x" //sku
            let settings = {method: "Get"}
            async function getwrData() {
                try {
                    const response1 = await fetch(muurl);
                    const data1 = await response1.json();
                    var mu = data1.data
                    const response2 = await fetch(nuurl);
                    const data2 = await response2.json();
                    var nu = data2.data
                    const response3 = await fetch(skurl);
                    const data3 = await response3.json();
                    var sk = data3.data
                    var character = ""
                    var name = ""
                    if (sk.hasOwnProperty("runs") && sk.runs.length > 0) {
                        if (sk.runs[0].hasOwnProperty("run")) {
                            for (let j = 0; j<23; j++){
                                if (sk.runs[0].run.values.j846d94l == racers[j].id) {
                                    if (racers[j].hasOwnProperty("flag")) {
                                        character = racers[j].flag
                                    } else {
                                        character = racers[j].name
                                    }
                                }
                            } 
                            if (sk.players.data[0].hasOwnProperty("names")) {
                                name = sk.players.data[0].names.international
                            } else {
                                name = sk.players.data[0].name
                            }
                            var vid = sk.runs[0].run.videos.links[0].uri
                            trackEmbed.addField("Skips WR", character + " " + name + "\n[" + tools.timefix(sk.runs[0].run.times.primary_t) + "](" + vid + ")",true)
                        }
                    }
                    for (let j = 0; j<23; j++){
                        if (mu.runs[0].run.values.j846d94l == racers[j].id) {
                            if (racers[j].hasOwnProperty("flag")) {
                                character = racers[j].flag
                            } else {
                                character = racers[j].name
                            }
                        }
                    } 
                    if (mu.players.data[0].hasOwnProperty("names")) {
                        name = mu.players.data[0].names.international
                    } else {
                        name = mu.players.data[0].name
                    }
                    var vid = mu.runs[0].run.videos.links[0].uri
                    trackEmbed.addField("MU WR", character + " " + name + "\n[" + tools.timefix(mu.runs[0].run.times.primary_t) + "](" + vid + ")", true)
                    for (let j = 0; j<23; j++){
                        if (nu.runs[0].run.values.j846d94l == racers[j].id) {
                            if (racers[j].hasOwnProperty("flag")) {
                                character = racers[j].flag
                            } else {
                                character = racers[j].name
                            }
                        }
                    } 
                    if (nu.players.data[0].hasOwnProperty("names")) {
                        name = nu.players.data[0].names.international
                    } else {
                        name = nu.players.data[0].name
                    }
                    var vid = nu.runs[0].run.videos.links[0].uri
                    trackEmbed.addField("NU WR", character + " " + name + "\n[" + tools.timefix(nu.runs[0].run.times.primary_t) + "](" +  vid+ ")",true)
                    client.channels.cache.get(interaction.channel_id).send(trackEmbed).then(sentMessage => {
                        sentMessage.react('⏱️').then(() => {
                            const filter = (reaction, user) => {
                                return ['⏱️'].includes(reaction.emoji.name) && user.id !== "545798436105224203";
                            };
                            sentMessage.awaitReactions(filter, { max: 1})
                                .then(collected => {
                                    const reaction = collected.first();
                                    if (reaction.emoji.name === '⏱️' && reaction.users.id !== "545798436105224203") {
                                        const tracktimesEmbed = new Discord.MessageEmbed()
                                        .setColor(planets[tracks[numb].planet].color)
                                        .setTitle(tracks[numb].name + " | Par Times")
                                        .setURL("https://docs.google.com/spreadsheets/d/1TwDtG6eOyiQZEZ3iTbZaEmthe5zdf9YEGJ-1tfFfQKg/edit?usp=sharing")
                                        .addField("FT 3-Lap", ":gem: " + tracks[numb].partimes[0] + "\n:first_place: " + tracks[numb].partimes[1] + "\n:second_place: " + tracks[numb].partimes[2] + "\n:third_place: " + tracks[numb].partimes[3] + "\n<:bumpythumb:703107780860575875> " + tracks[numb].partimes[4], true)
                                        .addField("FT 1-Lap", ":gem: " + tracks[numb].parlaptimes[0] + "\n:first_place: " + tracks[numb].parlaptimes[1] + "\n:second_place: " + tracks[numb].parlaptimes[2] + "\n:third_place: " + tracks[numb].parlaptimes[3] + "\n<:bumpythumb:703107780860575875> " + tracks[numb].parlaptimes[4], true)
                                        if (tracks[numb].hasOwnProperty("parskiptimes")) {
                                            tracktimesEmbed.addField("Skips 3-Lap", ":gem: " + tracks[numb].parskiptimes[0] + "\n:first_place: " + tracks[numb].parskiptimes[1] + "\n:second_place: " + tracks[numb].parskiptimes[2] + "\n:third_place: " + tracks[numb].parskiptimes[3] + "\n<:bumpythumb:703107780860575875> " + tracks[numb].parskiptimes[4], true)
                                        }
                                        sentMessage.channel.send(tracktimesEmbed);
                                    } 
                                })
                        })
                    
                    }) 
                } catch (error) {
                    console.log(error)
                }
                
            }
            getwrData()
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 2,
                    data: {
                        //content: "",
                        //embeds: [myEmbed]
                    }
                }
            })
        } else if(args[0].name=="challenge") {
            client.commands.get("challenge").execute(client, interaction, args);
        } else if(args[0].name=="teams") {
            var teamnum = args[0].options[0].value
            const teamEmbed = new Discord.MessageEmbed()
                .setFooter("/random")
                .setTitle("Random Teams")
                .setDescription("Everyone in the voice channel has been split into **" + teamnum + "** teams")
                
            var playernum = memarray.length
            if (teamnum > playernum){
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 3,
                        data: {
                            content: "`Error: That's too many teams!`\n" + errorMessage[Math.floor(Math.random()*errorMessage.length)],
                            //embeds: [teamEmbed]
                        }
                    }
                })
            } else {
                var remainder = playernum%teamnum
                var members = ""
                for(let i = 0; i<teamnum; i++){
                    members = ""
                    for(let j = 0; j<(Math.floor(playernum/teamnum)); j++){
                        var random = Math.floor(Math.random()*memarray.length)
                        members = members + memarray[random] + "\n"
                        memarray.splice(random,1)
                        if(remainder > 0){
                            var random = Math.floor(Math.random()*memarray.length)
                            members = members + memarray[random] + "\n"
                            memarray.splice(random,1)
                            remainder = remainder - 1
                        }

                    }
                    teamEmbed.addField("Team " + (i + 1), members, true)
                }
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 3,
                        data: {
                            //content: "",
                            embeds: [teamEmbed]
                        }
                    }
                })
            }
        } else if(args[0].name=="number") {
            if (messageLow.startsWith(`${prefix}random`)) {
            
                var randomnum = (Math.floor(Math.random()*args[0].options[0].value) + 1)
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 3,
                        data: {
                            content: randomnum,
                            //embeds: [myEmbed]
                        }
                    }
                })
                
            }
            
        }
    }
    
}
