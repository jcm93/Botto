module.exports = {
    name: 'tourney',
    execute(client, interaction, args) {
        const Discord = require('discord.js');
        const tourneyReport = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setURL("https://docs.google.com/spreadsheets/d/1ZyzBNOVxJ5PMyKsqHmzF4kV_6pKAJyRdk3xjkZP_6mU/edit?usp=sharing")
        var trak = null
        var podfilterout = []
        var podfilterin = []
         //filters out other tracks
        for (let i = 0; i<args.length; i++) {
            var input = args[i].value.toLowerCase()
            if (args[i].name == "track") {
                for(let i = 0; i<tracks.length; i++){
                    if(input == tracks[i].name.toLowerCase() || input == tracks[i].name.toLowerCase().replace(/ /g, '')){
                        trak = i
                        i = tracks.length
                    }
                    if(i<tracks.length){
                        tracks[i].nickname.forEach(nick => {
                            if(nick.toLowerCase() == input){
                                trak = i
                                i = tracks.length
                            }
                        })    
                    }
                }
                tourneyReport.setTitle(tracks[trak].name + " | Tournament Times")
                var tourneyfiltered = tourney.filter(element => element.track == tracks[trak].name)
            } else if (args[i].name == "skips") {
                if(input == "skips"){
                    tourneyfiltered = tourneyfiltered.filter(element => element.force == "Skips")
                } else if (input == "ft"){
                    tourneyfiltered = tourneyfiltered.filter(element => element.force !== "Skips")
                }
            } else if (args[i].name == "upgrades") {
                if(input == "mu"){
                    tourneyfiltered = tourneyfiltered.filter(element => element.force !== "NU")
                } else if (input == "nu"){
                    tourneyfiltered = tourneyfiltered.filter(element => element.force == "NU")
                }
            } else if (args[i].name == "pod") {
                var podfilter = args[i].value.split(/[\s,]+/)
                var filterin = true
                for (var p = 0; p < podfilter.length; p++){
                    if(podfilter[p] == "no"){
                        filterin = false
                    } else {
                        var numb = null
                        for(let q = 0; q<racers.length; q++){
                            racers[q].nickname.forEach(nick => {
                                if(nick.toLowerCase() == podfilter[p].toLowerCase()){
                                    numb = q
                                    q = racers.length
                                }
                            })     
                        }
                        if (numb !== null){
                            if(filterin){
                                tourneyfiltered = tourneyfiltered.filter(element => element.pod == racers[podfilterout[numb]].name)
                            } else {
                                tourneyfiltered = tourneyfiltered.filter(element => element.pod !== racers[podfilterout[numb]].name)
                            }
                        }
                    }
                }
            } else if (args[i].name == "deaths") {
                if(input == "deaths"){
                    tourneyfiltered = tourneyfiltered.filter(element => element.totaldeaths > 0)
                } else if (input == "deathless"){
                    tourneyfiltered = tourneyfiltered.filter(element => element.totaldeaths == 0)
                }
            } else if (args[i].name == "year") {
                tourneyfiltered = tourneyfiltered.filter(element => element.year == args[i].value)
            } else if (args[i].name == "player") {
                var player = args[i].value
                tourneyfiltered = tourneyfiltered.filter(element => element.playerid == player.id)
            }
        }      
        var pos = ["<:P1:671601240228233216>", "<:P2:671601321257992204>", "<:P3:671601364794605570>", "4th", "5th"]
        if (trak !== null) {
            var j = 0
            var players = []
            if (tourneyfiltered.length > 0) {
                for (i=0; i<5;){
                    var skip = false
                    for (k = 0; k < players.length; k++) {
                        if (tourneyfiltered[j].player + tourneyfiltered[j].force == players[k]) {
                            skip = true
                        }
                    }
                    if (skip == false && tourneyfiltered[j].hasOwnProperty("totaltime")) {
                        var character = ""
                        var deaths = ""
                        var characterban = ""
                        var link = ""
                        var forc = "MU "
                        if (tourneyfiltered[j].hasOwnProperty("force")) {
                            if (tourneyfiltered[j].force == "Skips") {
                                forc = "Skips "
                            } else if (tourneyfiltered[j].force == "NU") {
                                forc = "NU "
                            }
                        }
                        if (tourneyfiltered[j].hasOwnProperty("url")) {
                            link = tourneyfiltered[j].url
                        }
                        if (tourneyfiltered[j].hasOwnProperty("podtempban")) {
                            characterban = "\n~~" + tourneyfiltered[j].podtempban + "~~"
                        }
                        if (tourneyfiltered[j].totaldeaths > 0) {
                            deaths = ""
                            if (tourneyfiltered[j].totaldeaths > 5) {
                                deaths = ":skull:×"+tourneyfiltered[j].totaldeaths
                            } else {
                                for (d = 0; d< tourneyfiltered[j].totaldeaths; d++){
                                    deaths = deaths + ":skull:"
                                }
                            }
                        }
                        for (let n = 0; n<23; n++){
                            if (tourneyfiltered[j].pod == racers[n].name) {
                                if (racers[n].flag !== "") {
                                    character = racers[n].flag
                                } else {
                                    character = racers[n].name
                                }
                            }
                        } 
                        tourneyReport
                            .addField(pos[i] + " " + tourneyfiltered[j].player, tourneyfiltered[j].year + ", " + tourneyfiltered[j].bracket +": "+tourneyfiltered[j].round + "\nRace " + tourneyfiltered[j].race + ", vs " + tourneyfiltered[j].opponent, true)
                            .addField(tools.timefix(Number(tourneyfiltered[j].totaltime).toFixed(3))," " + character + "[ " + forc + "](" + link + ")" + deaths + characterban, true)
                            .addField('\u200B', '\u200B', true)
                        players.push(tourneyfiltered[j].player + tourneyfiltered[j].force)
                        i++
                    }
                    j++
                    if (j == tourneyfiltered.length) {
                        i = 5
                    }
                }
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 3,
                        data: {
                            //content: "",
                            embeds: [tourneyReport]
                        }
                    }
                })
            } else {
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: {
                            content: "`Error: No tournament runs were found matching that criteria`\n" + error[Math.floor(Math.random()*error.length)],
                            //embeds: [racerEmbed]
                        }
                    }
                })
            }
        } else {
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: "`Error: Track not found`\n" + error[Math.floor(Math.random()*error.length)],
                        //embeds: [racerEmbed]
                    }
                }
            })
        }
    }
    
}


