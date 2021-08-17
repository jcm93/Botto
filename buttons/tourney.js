module.exports = {
    name: 'tourney',
    execute(client, interaction, args) {
        const Discord = require('discord.js');
        const myEmbed = new Discord.MessageEmbed()
        var tools = require('./../tools.js');
        var admin = require('firebase-admin');
        var database = admin.database();
        var firebase = require("firebase/app");
        var tourney_rulesets = database.ref('tourney/rulesets');
        var tourney_rulesets_data = {}
        tourney_rulesets.on("value", function (snapshot) {
            tourney_rulesets_data = snapshot.val();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject);
        });
        if (args[0] == "ranks") {
            if (args[1].startsWith("page")) {
                var ranks = tools.getRanks()
                const tourneyRanks = new Discord.MessageEmbed()
                tourneyRanks.setTitle("Elo Ratings")
                var offset = Number(args[1].replace("page", ""))
                var rnk_keys = Object.keys(ranks)
                var rnk_vals = Object.values(ranks)
                var pages = 0
                if (rnk_vals.length % 5 == 0) {
                    pages = Math.floor(rnk_vals.length / 5)
                } else {
                    pages = Math.floor(rnk_vals.length / 5) + 1
                }
                for (var i = 0; i < rnk_keys.length; i++) {
                    rnk_vals[i].player = rnk_keys[i]
                }
                rnk_vals.sort(function (a, b) {
                    return b.rank - a.rank;
                })
                for (var i = 5 * offset; i < 5 * (1 + offset); i++) {
                    if (i == rnk_vals.length) {
                        i = 5 * (1 + offset)
                    } else {

                        var arrow = "<:green_arrow:852392123093614642>"
                        if (rnk_vals[i].change < 0) {
                            arrow = ":small_red_triangle_down:"
                            rnk_vals[i].change = Math.abs(rnk_vals[i].change)
                        }
                        tourneyRanks
                            .addField(tools.ordinalSuffix(i) + " " + tourney_participants_data[rnk_vals[i].player].name, "`" + rnk_vals[i].matches + " matches`", true)
                            .addField(Math.round(rnk_vals[i].rank), arrow + " " + Math.round(rnk_vals[i].change), true)
                            .addField('\u200B', '\u200B', true)
                    }
                }
                var previous = false, next = false
                if (offset <= 0) {
                    previous = true
                }
                if (offset + 1 == pages) {
                    next = true
                }
                var type = 7
                if (args.includes("initial")) {
                    type = 4
                }
                tourneyRanks
                    .setFooter("Page " + (offset + 1) + " / " + pages)
                    .setColor("#E75A70")
                    .setAuthor("Tournaments", "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/282/crossed-swords_2694-fe0f.png")
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: type,
                        data: {
                            //content: "",
                            embeds: [tourneyRanks],
                            components: [
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2,
                                            label: "",
                                            emoji: {
                                                id: "852392123151679548",
                                                name: "left"
                                            },
                                            style: 2,
                                            custom_id: "tourney_ranks_page" + (offset - 1),
                                            disabled: previous
                                        },
                                        {
                                            type: 2,
                                            label: "",
                                            emoji: {
                                                id: "852392123109998602",
                                                name: "right"
                                            },
                                            style: 2,
                                            custom_id: "tourney_ranks_page" + (offset + 1),
                                            disabled: next
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                })
            }
        } else if (args[0] == "matches") {
            if (args[1] == "browse") {
                if (args[2].startsWith("page")) {
                    var tourney_matches = database.ref('tourney/matches')
                    tourney_matches.on("value", function (snapshot) {
                        tourney_matches_data = snapshot.val();
                    }, function (errorObject) {
                        console.log("The read failed: " + errorObject);
                    });
                    var tourney_participants = database.ref('tourney/participants')
                    tourney_participants.on("value", function (snapshot) {
                        tourney_participants_data = snapshot.val();
                    }, function (errorObject) {
                        console.log("The read failed: " + errorObject);
                    });
                    var tourney_tournaments = database.ref('tourney/tournaments')
                    tourney_tournaments.on("value", function (snapshot) {
                        tourney_tournaments_data = snapshot.val();
                    }, function (errorObject) {
                        console.log("The read failed: " + errorObject);
                    });
                    var offset = Number(args[2].replace("page", ""))
                    var type = 7
                    var pages = 0
                    var mtch = Object.keys(tourney_matches_data)
                    var matches = []
                    for (var i = 0; i < mtch.length; i++) {
                        var m = mtch[i]
                        tourney_matches_data[m].id = m
                        matches.push(tourney_matches_data[m])
                    }
                    matches.sort(function (a, b) {
                        return Date.parse(b.datetime) - Date.parse(a.datetime);
                    })
                    if (matches.length % 5 == 0) {
                        pages = Math.floor(matches.length / 5)
                    } else {
                        pages = Math.floor(matches.length / 5) + 1
                    }
                    const tourneyMatches = new Discord.MessageEmbed()
                        .setTitle("Recent Matches")
                        .setFooter("Page " + (offset + 1) + " / " + pages)
                        .setColor("#E75A70")
                        .setAuthor("Tournaments", "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/282/crossed-swords_2694-fe0f.png")
                    for (var i = 5 * offset; i < 5 * (1 + offset); i++) {
                        if (i == matches.length) {
                            i = 5 * (1 + offset)
                        } else {
                            var date = new Date(matches[i].datetime).toLocaleString("en-US", { timeZone: "America/New_York" }) + " ET"
                            if (matches[i].url !== "") {
                                date = "[" + date + "](" + matches[i].url + ")"
                            }
                            var players = Object.values(matches[i].players)
                            var commentators = Object.values(matches[i].commentators)
                            var score = []
                            var comms = []
                            var player_text = []
                            for (k = 0; k < players.length; k++) {
                                player_text.push(tourney_participants_data[String(players[k].player)].name)
                                if (![undefined, ""].includes(players[k].score)) {
                                    score.push(players[k].score)
                                }
                            }
                            if (commentators.length > 0) {
                                for (k = 0; k < commentators.length; k++) {
                                    if (commentators[k] !== "") {
                                        comms.push(tourney_participants_data[String(commentators[k])].name)
                                    }
                                }
                            }

                            if (score.length > 0) {
                                score = "score: ||`" + score.join(" to ") + "`||"
                            }
                            var bracketround = ""
                            if (matches[i].bracket !== "") {
                                bracketround += " - " + matches[i].bracket
                                if (![undefined, ""].includes(matches[i].round)) {
                                    bracketround += ": " + matches[i].round
                                }
                            }
                            tourneyMatches
                                .addField(tourney_tournaments_data[matches[i].tourney].nickname + bracketround, date + "\nid: `" + matches[i].id + "`", true)
                                .addField(player_text.join(" vs. "), score + "\n" + ":microphone2: " + comms.join(", "), true)
                                .addField('\u200B', '\u200B', true)
                        }
                    }
                    if (args.includes("initial")) {
                        type = 4
                    }
                    var previous = false, next = false
                    if (offset <= 0) {
                        previous = true
                    }
                    if (offset + 1 == pages) {
                        next = true
                    }
                    client.api.interactions(interaction.id, interaction.token).callback.post({
                        data: {
                            type: type,
                            data: {
                                //content: "",
                                embeds: [tourneyMatches],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 2,
                                                label: "",
                                                emoji: {
                                                    id: "852392123151679548",
                                                    name: "left"
                                                },
                                                style: 2,
                                                custom_id: "tourney_matches_browse_page" + (offset - 1),
                                                disabled: previous
                                            },
                                            {
                                                type: 2,
                                                label: "",
                                                emoji: {
                                                    id: "852392123109998602",
                                                    name: "right"
                                                },
                                                style: 2,
                                                custom_id: "tourney_matches_browse_page" + (offset + 1),
                                                disabled: next
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    })
                }
            }
        } else if (args[0] == "schedule") {
            var type = 4
            if (args[1] == "refresh") {
                type = 7
            }
            const rp = require('request-promise');
            const $ = require('cheerio');
            const url = 'http://speedgaming.org/swe1racer/';
            const fs = require('fs');
            rp(url)
                .then(function (html) {
                    var table = $('tbody', html)
                    var schedule = []
                    $('tr', table).each((i, elem) => {
                        var text = $('td', elem).text().replace(/\t/g, "").split(/\n/)
                        for (var i = 0; i < text.length; i++) {
                            if (text[i] == "") {
                                text.splice(i, 1)
                                i = i - 1
                            }
                        }
                        schedule.push(text)
                    })
                    const tourneyReport = new Discord.MessageEmbed()
                    tourneyReport
                        .setAuthor("Tournaments", "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/282/crossed-swords_2694-fe0f.png")
                        .setTitle("Match Schedule")
                        .setURL("http://speedgaming.org/swe1racer/")
                        .setDescription("Upcoming matches on speedgaming.org/swe1racer\n(Current as of <t:" + Math.round(Date.now() / 1000) + ":R>)")
                        .setFooter("Times are displayed in your local time")
                    schedule.splice(0, 1)
                    if (schedule.length > 0) {
                        for (i = 0; i < schedule.length; i++) {
                            var channel = ""
                            var comm = ""
                            if (schedule[i].length > 4) {
                                if (!schedule[i][4].includes("?")) {
                                    channel = "[" + schedule[i][4] + "](https://www.twitch.tv/" + schedule[i][4] + ")"
                                }
                                if (schedule[i][5] !== undefined) {
                                    comm = schedule[i][5]
                                }
                            }
                            var datetime = new Date(schedule[i][0].replace(", ", " " + new Date().getFullYear() + " ") + schedule[i][1].replace(" ", " ") + " EDT").getTime() / 1000
                            tourneyReport
                                .addField("<t:" + datetime + ":F>", schedule[i][2] + "\n" + channel, true)
                                .addField(":crossed_swords: " + schedule[i][3].replace(/,/g, " vs."), ":microphone2: " + comm, true)
                                .addField('\u200B', '\u200B', true)
                        }
                    } else {
                        tourneyReport.setDescription("No matches are currently scheduled")
                    }
                    client.api.interactions(interaction.id, interaction.token).callback.post({
                        data: {
                            type: type,
                            data: {
                                //content: content,
                                //flags: 64
                                embeds: [tourneyReport],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 2,
                                                label: "",
                                                emoji: {
                                                    id: "854097998357987418",
                                                    name: "refresh"
                                                },
                                                style: 2,
                                                custom_id: "tourney_schedule_refresh",
                                            },
                                            {
                                                type: 2,
                                                label: "Schedule Match",
                                                style: 5,
                                                url: "http://speedgaming.org/swe1racer/submit/"
                                            },
                                            {
                                                type: 2,
                                                label: "Sign Up for Commentary",
                                                style: 5,
                                                url: "http://speedgaming.org/swe1racer/crew/"
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    })
                })
        } else if (args[0] == "rulesets") {
            var type = 7
            if (args.includes("initial")) {
                type = 4
            }
            var flags = 0
            var components = []
            const rulesetEmbed = new Discord.MessageEmbed()
                .setAuthor("Tournaments", "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/282/crossed-swords_2694-fe0f.png")
            if (args[1] == "browse") {
                rulesetEmbed.setTitle("Rulesets")
                components.push({
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: "New",
                            style: 3,
                            custom_id: "tourney_rulesets_type",
                        },
                        {
                            type: 2,
                            label: "Edit",
                            style: 2,
                            custom_id: "tourney_rulesets_edit",
                        },
                        {
                            type: 2,
                            label: "Clone",
                            style: 2,
                            custom_id: "tourney_rulesets_clone",
                        },
                        {
                            type: 2,
                            label: "Delete",
                            style: 4,
                            custom_id: "tourney_rulesets_delete",
                        }
                    ]
                })
            } else if (args[1] == "type") {
                flags = 64
                type = 4
                if(![null, undefined].includes(tourney_rulesets_data)){
                    if (tourney_rulesets_data.hasOwnProperty("new")) {
                        if (args[2] == "new") {
                            tourney_rulesets.child("new").child(interaction.member.user.id).remove()
                        }
                        if (tourney_rulesets_data.new.hasOwnProperty(interaction.member.user.id)) {
                            rulesetEmbed
                                .setTitle(":exclamation: Unsaved Ruleset")
                                .setDescription("You have an unsaved ruleset. Would you like to continue editing that one or start a new one?")
    
                            components.push(
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2,
                                            label: "Continue",
                                            style: 3,
                                            custom_id: "tourney_rulesets_general",
                                        },
                                        {
                                            type: 2,
                                            label: "Start New",
                                            style: 4,
                                            custom_id: "tourney_rulesets_type_new",
                                        }
                                    ]
                                }
                            )
    
                            client.api.interactions(interaction.id, interaction.token).callback.post({
                                data: {
                                    type: type,
                                    data: {
                                        flags: flags,
                                        embeds: [rulesetEmbed],
                                        components: components
                                    }
                                }
                            })
                            return
                        }
                    }
                }
                

                //select type
                rulesetEmbed
                    .setTitle("Create a New Ruleset")
                    .setDescription("First, select the type of ruleset you'd like to create.")

                var options = [
                    {
                        label: "Qualifier",
                        value: "qual",
                        description: "Players have a set time limit to get their best time with multiple attempts"
                    },
                    {
                        label: "1v1",
                        value: "1v1",
                        description: "Players face off until one reaches the win limit"
                    },
                    {
                        label: "1vAll",
                        value: "1vall",
                        description: "Players race against all other competitors in a set number of races"
                    }/*,
                    {
                        label: "Team",
                        value: "team",
                        description: "Teams compete for a better score/time than opposing teams"
                    }*/
                ]
                var create = false
                if (interaction.data.hasOwnProperty("values")) {
                    for (i = 0; i < options.length; i++) {
                        if (interaction.data.values.includes(options[i].value)) {
                            options[i].default = true
                        }
                    }
                    type = 7
                    create = true
                }
                components.push(
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_type",
                                options: options,
                                placeholder: "Select Ruleset Type",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    },
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: "Create",
                                style: 3,
                                custom_id: "tourney_rulesets_new",
                                disabled: !create
                            },
                            {
                                type: 2,
                                label: "Cancel",
                                style: 4,
                                custom_id: "tourney_rulesets_browse",
                            }
                        ]
                    }

                )
            } else if (args[1] == "new") {
                var ruleset_type = "1v1"
                for (var i = 0; i < interaction.message.components[0].components[0].options.length; i++) { //track
                    var option = interaction.message.components[0].components[0].options[i]
                    if (option.hasOwnProperty("default")) {
                        if (option.default) {
                            ruleset_type = option.value
                        }
                    }
                }
                flags = 64
                rulesetEmbed
                    .setTitle("New Ruleset")
                    .setDescription("create a ruleset")

                var ruleset = {}
                if (ruleset_type == "qual") {
                    ruleset = {
                        type: "qual",
                        podchoice: "player_choice",
                        races: []
                    }
                } else if (ruleset_type == "1v1") {
                    ruleset = {
                        type: "1v1",
                        name: interaction.member.user.username + "'s Unnamed 1v1 Ruleset",
                        author: interaction.member.user.id,
                        wins: 5,
                        default: ["mu", "ft", "um", "l3"],
                        gents: "disallowed",
                        firstmethod: "poe",
                        firsttrack: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"],
                        ptrackmethod: "disabled",
                        ptracklimit: 1,
                        ppodmethod: "disabled",
                        ppodlimit: 1,
                        pconmethod: "disabled",
                        pconlimit: 1,
                        ttrackmethod: "disabled",
                        ttracklimit: 1,
                        tpodmethod: "disabled",
                        tpodlimit: 1,
                        tconmethod: "disabled",
                        tconlimit: 1,
                        trackmethod: "losers_pick",
                        tracktracks: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"],
                        dupecondition: "disabled",
                        dupelimit: 1,
                        conmethod: "disabled",
                        conlimit: 1,
                        conmax: 1,
                        conoptions: ["sk"],
                        podmethod: "players_pick",
                        podpods: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"],
                        rndlimited: 2,
                        poollimit: 1
                    }
                } if (ruleset_type == "1vall") {
                    ruleset = {
                        type: "qual",
                        podchoice: "player_choice",
                        races: []
                    }
                } //if (ruleset_type == "team") {}
                if (ruleset !== {}) {
                    tourney_rulesets.child("new").child(interaction.member.user.id).set(ruleset)
                }
                args[1] = "general"
            }

            if (args[1] == "navigate") {
                args[1] = interaction.data.values[0]
            } else if (![undefined, "initial", "rename", "save"].includes(args[2])) {
                var data = interaction.data.values
                if (!["default", "firsttrack", "podpods", "tracktracks", "conoptions"].includes(args[2])) {
                    data = interaction.data.values[0]
                }
                tourney_rulesets.child("new").child(interaction.member.user.id).child(args[2]).set(data)
            }
            var options = [
                {
                    label: "General Settings",
                    value: "general",
                    emoji: { name: "🔷" },
                    description: "set win limit, default conditions, and gentleman's agreement",
                },
                {
                    label: "First Track",
                    value: "firsttrack",
                    emoji: { name: "🏁" },
                    description: "configure how the first track is determined",
                },
                {
                    label: "Track Permaban",
                    value: "permatrackban",
                    emoji: { name: "🚫" },
                    description: "set permanent track ban options",
                },
                {
                    label: "Pod Permaban",
                    value: "permapodban",
                    emoji: { name: "🚫" },
                    description: "set permanent pod ban options",
                },
                {
                    label: "Condition Permaban",
                    value: "permaconban",
                    emoji: { name: "🚫" },
                    description: "set permanent condition ban options",
                },
                {
                    label: "Track Tempban",
                    value: "temptrackban",
                    emoji: { name: "❌" },
                    description: "set temporary track ban options",
                },
                {
                    label: "Pod Tempban",
                    value: "temppodban",
                    emoji: { name: "❌" },
                    description: "set temporary pod ban options",
                },
                {
                    label: "Condition Tempban",
                    value: "tempconban",
                    emoji: { name: "❌" },
                    description: "set temporary condition ban options",
                },
                {
                    label: "Track Selection",
                    value: "trackselect",
                    emoji: { name: "🚩" },
                    description: "configure how tracks are selected",
                },
                {
                    label: "Repeat Tracks",
                    value: "trackdup",
                    emoji: { name: "🔁" },
                    description: "set repeat track options",
                },
                {
                    label: "Track Conditions",
                    value: "trackcon",
                    emoji: { name: "*️⃣" },
                    description: "configure track condition options",
                },
                {
                    label: "Pod Selection",
                    value: "podselect",
                    emoji: { name: "Pod1", id: "525755322355417127" },
                    description: "configure how pods are selected",
                },
                {
                    label: "Name and Save",
                    value: "finalize",
                    emoji: { name: "✅" },
                    description: "finalize ruleset and submit changes",
                }
            ]
            for (i = 0; i < options.length; i++) {
                if (args[1] == options[i].value) {
                    options[i].default = true
                }
            }
            if (!["browse", "type"].includes(args[1])) {
                rulesetEmbed
                    .setTitle(tourney_rulesets_data.new[interaction.member.user.id].name)
                    .setFooter(interaction.member.user.username, client.guilds.resolve(interaction.guild_id).members.resolve(interaction.member.user.id).user.avatarURL())

                components.push({
                    type: 1,
                    components: [
                        {
                            type: 3,
                            custom_id: "tourney_rulesets_navigate",
                            options: options,
                            placeholder: "Settings",
                            min_values: 1,
                            max_values: 1
                        }
                    ]
                })
            }
            if (tourney_rulesets_data.hasOwnProperty("new")) {
                if (tourney_rulesets_data.new[interaction.member.user.id].type == "1v1") {
                    rulesetEmbed
                        .setDescription("Ruleset Type: 1v1")
                    var ruleset = tourney_rulesets_data.new[interaction.member.user.id]
                    var fields = []
                    //wins
                    var field = {}
                    field.name = ":trophy: Wins"
                    field.value = "First to " + ruleset.wins + "\nBest of " + (ruleset.wins * 2 - 1)
                    fields.push(field)
                    //default
                    field = {}
                    field.name = ":eight_spoked_asterisk: Default Conditions"
                    var conditions = {
                        mu: "Max Upgrades",
                        nu: "No Upgrades",
                        ft: "Full Track",
                        sk: "Skips",
                        pb: "Pod Ban",
                        pc: "Pod Choice",
                        um: "Unmirrored",
                        mi: "Mirrored",
                        l1: "1 Lap",
                        l2: "2 Laps",
                        l3: "3 Laps",
                        l4: "4 Laps",
                        l5: "5 Laps"
                    }
                    var cond = Object.values(ruleset.default)
                    var cons = []
                    cond.forEach(con => {
                        cons.push(conditions[con])
                    })
                    field.value = cons.join(", ")
                    fields.push(field)
                    //gents
                    field = {}
                    field.name = ":tophat: Gentleman's Agreement"
                    field.value = ruleset.gents
                    fields.push(field)
                    //first track
                    field = {}
                    field.name = ":checkered_flag: First Track"
                    firsttracks = Object.values(ruleset.firsttrack)
                    var methods = {
                        poe: "Process of Elimination",
                        chance_cube: "Chance Cube",
                        random: "Random",
                        player_pick: "Player's Pick",
                        disabled: "Disabled",
                        winners_pick: "Winner's Pick",
                        losers_pick: "Loser's Pick",
                        salty_runback: "Salty Runback",
                        saltier_runback: "Saltier Runback",
                        saltiest_runback: "Saltiest Runback",
                        any: "Any Condition",
                        random_mirrored: "Random Mirrored",
                        limited_choice: "Limited Choice",
                        random_limited_choice: "Random Limited Choice",
                        pod_pool: "Pod Pool"
                    }
                    field.value = methods[ruleset.firstmethod] + "\n"
                    var amc = 0, spc = 0, gal = 0, inv = 0
                    var first_nicks = []
                    for (i = 0; i < firsttracks.length; i++) {
                        if (firsttracks[i] >= 0 && firsttracks[i] < 7) {
                            amc++
                        }
                        if (firsttracks[i] >= 7 && firsttracks[i] < 14) {
                            spc++
                        }
                        if (firsttracks[i] >= 14 && firsttracks[i] < 21) {
                            gal++
                        }
                        if (firsttracks[i] >= 21 && firsttracks[i] < 25) {
                            inv++
                        }
                        first_nicks.push(tracks[Number(firsttracks[i])].nickname[0])
                    }
                    var missing = []
                    for (i = 0; i < 25; i++) {
                        if (!first_nicks.includes(tracks[i].nickname[0])) {
                            missing.push(tracks[i].nickname[0])
                        }
                    }
                    if (firsttracks.length == 25) {
                        field.value += "Any Track"
                    } else if ((firsttracks.length == 7 && [amc, spc, gal].includes(7)) || firsttracks.length == 4 && inv == 4) {
                        if (amc == 7) {
                            field.value += "Amateur Circuit"
                        } else if (spc == 7) {
                            field.value += "Semi-Pro Circuit"
                        } else if (gal == 7) {
                            field.value += "Galactic Circuit"
                        } else if (inv == 4) {
                            field.value += "Invitational Circuit"
                        }
                    } else {
                        if (missing.length < first_nicks.length) {
                            field.value += "No " + missing.join(", ")
                        } else {
                            field.value += first_nicks.join(", ")
                        }

                    }
                    fields.push(field)
                    var styles = {
                        win: "Earned via First Win",
                        loss: "Earned via First Loss",
                        guaranteed: "Guaranteed",
                        either_or: "Either/Or"
                    }
                    //track permabans
                    if (ruleset.ptrackmethod !== "disabled") {
                        field = {}
                        field.name = ":no_entry_sign: Track Permaban"
                        field.value = methods[ruleset.ptrackmethod] + "\n"
                        if (ruleset.ptrackmethod == "random") {
                            field.value += ruleset.ptracklimit + " random ban(s) per match"
                        } else {
                            field.value += ruleset.ptracklimit + " ban(s) per player per match"
                            field.value += "\n" + styles[ruleset.ptrackstyle]
                        }
                        fields.push(field)
                    }
                    //pod permabans
                    if (ruleset.ppodmethod !== "disabled") {
                        field = {}
                        field.name = ":no_entry_sign: Pod Permaban"
                        field.value = methods[ruleset.ppodmethod] + "\n"
                        if (ruleset.ppodmethod == "random") {
                            field.value += ruleset.ppodlimit + " random ban(s) per match"
                        } else {
                            field.value += ruleset.ppodlimit + " ban(s) per player per match"
                            field.value += "\n" + styles[ruleset.ppodstyle]
                        }
                        fields.push(field)
                    }
                    //condition permabans
                    if (ruleset.pconmethod !== "disabled") {
                        field = {}
                        field.name = ":no_entry_sign: Condition Permaban"
                        field.value = methods[ruleset.pconmethod] + "\n"
                        if (ruleset.pconmethod == "random") {
                            field.value += ruleset.pconlimit + " random ban(s) per match"
                        } else {
                            field.value += ruleset.pconlimit + " ban(s) per player per match"
                            field.value += "\n" + styles[ruleset.pconstyle]
                        }
                        fields.push(field)
                    }
                    //track tempbans
                    if (ruleset.ttrackmethod !== "disabled") {
                        field = {}
                        field.name = ":x: Track Tempban"
                        field.value = methods[ruleset.ttrackmethod] + "\n"
                        field.value += ruleset.ttracklimit + " max ban(s) per race"
                        fields.push(field)
                    }
                    //pod tempbans
                    if (ruleset.tpodmethod !== "disabled") {
                        field = {}
                        field.name = ":x: Pod Tempban"
                        field.value = methods[ruleset.tpodmethod] + "\n"
                        field.value += ruleset.tpodlimit + " max ban(s) per race"
                        fields.push(field)
                    }
                    //condition tempbans
                    if (ruleset.tconmethod !== "disabled") {
                        field = {}
                        field.name = ":x: Condition Tempban"
                        field.value = methods[ruleset.tconmethod] + "\n"
                        field.value += ruleset.tconlimit + " max ban(s) per race"
                        fields.push(field)
                    }
                    //track selection
                    field = {}
                    field.name = ":triangular_flag_on_post: Track Selection"
                    track_tracks = Object.values(ruleset.tracktracks)
                    field.value = methods[ruleset.trackmethod] + "\n"
                    var amc = 0, spc = 0, gal = 0, inv = 0
                    var first_nicks = []
                    for (i = 0; i < track_tracks.length; i++) {
                        if (track_tracks[i] >= 0 && track_tracks[i] < 7) {
                            amc++
                        }
                        if (track_tracks[i] >= 7 && track_tracks[i] < 14) {
                            spc++
                        }
                        if (track_tracks[i] >= 14 && track_tracks[i] < 21) {
                            gal++
                        }
                        if (track_tracks[i] >= 21 && track_tracks[i] < 25) {
                            inv++
                        }
                        first_nicks.push(tracks[Number(track_tracks[i])].nickname[0])
                    }
                    var missing = []
                    for (i = 0; i < 25; i++) {
                        if (!first_nicks.includes(tracks[i].nickname[0])) {
                            missing.push(tracks[i].nickname[0])
                        }
                    }
                    if (track_tracks.length == 25) {
                        field.value += "Any Track"
                    } else if ((track_tracks.length == 7 && [amc, spc, gal].includes(7)) || track_tracks.length == 4 && inv == 4) {
                        if (amc == 7) {
                            field.value += "Amateur Circuit"
                        } else if (spc == 7) {
                            field.value += "Semi-Pro Circuit"
                        } else if (gal == 7) {
                            field.value += "Galactic Circuit"
                        } else if (inv == 4) {
                            field.value += "Invitational Circuit"
                        }
                    } else {
                        if (missing.length < first_nicks.length) {
                            field.value += "No " + missing.join(", ")
                        } else {
                            field.value += first_nicks.join(", ")
                        }

                    }
                    fields.push(field)
                    //Repeat Tracks
                    field = {}
                    field.name = ":repeat: Repeat Tracks",
                        field.value = methods[ruleset.dupecondition] + "\n"
                    if (ruleset.dupecondition !== "disabled") {
                        field.value += ruleset.dupelimit + " Per Player Per Match"
                    }
                    //construct fields
                    for (i = 0; i < fields.length; i++) {
                        rulesetEmbed.addField(fields[i].name, fields[i].value, true)
                    }


                }
            }
            if (args[1] == "general") {
                var win_options = []
                for (i = 2; i < 14; i++) {
                    win_options.push(
                        {
                            label: "First to " + i + " Wins",
                            value: i,
                            description: "Best of " + (i * 2 - 1)
                        }
                    )
                }
                for (i = 0; i < win_options.length; i++) {
                    if (win_options[i].value == tourney_rulesets_data.new[interaction.member.user.id].wins) {
                        win_options[i].default = true
                    }
                }
                var con_options = [
                    {
                        label: "Full Track",
                        value: "ft"
                    },
                    {
                        label: "Skips",
                        value: "sk"
                    },
                    {
                        label: "Max Upgrades",
                        value: "mu"
                    },
                    {
                        label: "No Upgrades",
                        value: "nu"
                    },
                    {
                        label: "Unmirrored",
                        value: "um"
                    },
                    {
                        label: "Mirrored",
                        value: "mi"
                    },
                    {
                        label: "1 Lap",
                        value: "l1"
                    },
                    {
                        label: "2 Laps",
                        value: "l2"
                    },
                    {
                        label: "3 Laps",
                        value: "l3"
                    },
                    {
                        label: "4 Laps",
                        value: "l4"
                    },
                    {
                        label: "5 Laps",
                        value: "l5"
                    }
                ]
                for (i = 0; i < con_options.length; i++) {
                    if (Object.values(tourney_rulesets_data.new[interaction.member.user.id].default).includes(con_options[i].value)) {
                        con_options[i].default = true
                    }
                }
                var gent_options = [
                    {
                        label: "Gentleman's Agreement: Allowed",
                        value: "allowed"
                    },
                    {
                        label: "Gentleman's Agreement: Disallowed",
                        value: "disallowed"
                    }
                ]
                for (i = 0; i < gent_options.length; i++) {
                    if (gent_options[i].value == tourney_rulesets_data.new[interaction.member.user.id].gents) {
                        gent_options[i].default = true
                    }
                }
                components.push(
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_general_wins",
                                options: win_options,
                                placeholder: "Set Win Limit",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    },
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_general_default",
                                options: con_options,
                                placeholder: "Set Default Conditions",
                                min_values: 4,
                                max_values: 4
                            }
                        ]
                    },
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_general_gents",
                                options: gent_options,
                                placeholder: "Gentleman's Agreement",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    }
                )
            } else if (args[1] == "firsttrack") {
                var first_options = [
                    /*{
                        label: "Predetermined",
                        value: "predetermined",
                        description: "first track is already determined"
                    },*/
                    {
                        label: "Process of Elimination",
                        value: "poe",
                        description: "players alternate bans until one track is left"
                    },
                    {
                        label: "Chance Cube",
                        value: "chance_cube",
                        description: "winner of chance cube gets to pick the first track"
                    },
                    {
                        label: "Random",
                        value: "random",
                        description: "first track is randomly selected"
                    }
                ]
                for (i = 0; i < first_options.length; i++) {
                    if (first_options[i].value == tourney_rulesets_data.new[interaction.member.user.id].firstmethod) {
                        first_options[i].default = true
                    }
                }
                var first_track = []
                for (var i = 0; i < 25; i++) {
                    var track_option = {
                        label: tracks[i].name,
                        value: i,
                        description: (circuits[tracks[i].circuit].name + " Circuit | Race " + tracks[i].cirnum + " | " + planets[tracks[i].planet].name).substring(0, 50),
                        emoji: {
                            name: planets[tracks[i].planet].emoji.split(":")[1],
                            id: planets[tracks[i].planet].emoji.split(":")[2].replace(">", "")
                        }
                    }
                    if (Object.values(tourney_rulesets_data.new[interaction.member.user.id].firsttrack).includes(String(track_option.value))) {
                        track_option.default = true
                    }
                    first_track.push(track_option)
                }
                components.push(
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_firsttrack_firstmethod",
                                options: first_options,
                                placeholder: "Selection Method",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    },
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_firsttrack_firsttrack",
                                options: first_track,
                                placeholder: "Filter First Track Options",
                                min_values: 1,
                                max_values: 25
                            }
                        ]
                    }
                )
            } else if (args[1] == "permatrackban") {
                var limits = []
                for (i = 1; i < 6; i++) {
                    var limit = {
                        label: i + " Ban(s) Per Player Per Match",
                        value: i
                    }
                    if (tourney_rulesets_data.new[interaction.member.user.id].ptrackmethod == "random") {
                        limit.label = i + " Random Ban(s) Per Match"
                    }
                    if (limit.value == tourney_rulesets_data.new[interaction.member.user.id].ptracklimit) {
                        limit.default = true
                    }
                    limits.push(limit)
                }
                var methods = [
                    {
                        label: "Disabled",
                        value: "disabled",
                        description: "No permanent track ban"
                    },
                    {
                        label: "Player Pick",
                        value: "player_pick",
                        description: "Each player gets to pick a permanent track ban"
                    },
                    {
                        label: "Earned via Win",
                        value: "win",
                        description: "Players get access to this ban if they win the first track"
                    },
                    {
                        label: "Earned via Loss",
                        value: "loss",
                        description: "Players get access to this ban if they lose the first track"
                    },
                    {
                        label: "Either/Or",
                        value: "either_or",
                        description: "Players must choose between this permaban or another permaban with the same setting"
                    },
                    {
                        label: "Random",
                        value: "random",
                        description: "Tracks are permanently banned randomly"
                    }
                ]
                for (i = 0; i < methods.length; i++) {
                    if (methods[i].value == tourney_rulesets_data.new[interaction.member.user.id].ptrackmethod) {
                        methods[i].default = true
                    }
                }
                components.push(
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_permatrackban_ptrackmethod",
                                options: methods,
                                placeholder: "Permanent Track Ban Method",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    },
                )
                if (tourney_rulesets_data.new[interaction.member.user.id].ptrackmethod !== "disabled") {
                    components.push({
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_permatrackban_ptracklimit",
                                options: limits,
                                placeholder: "Permanent Track Bans Per Match",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    })
                }
            } else if (args[1] == "permapodban") {
                var limits = []
                for (i = 1; i < 6; i++) {
                    var limit = {
                        label: i + " Ban(s) Per Player Per Match",
                        value: i
                    }
                    if (tourney_rulesets_data.new[interaction.member.user.id].ppodmethod == "random") {
                        limit.label = i + " Random Ban(s) Per Match"
                    }
                    if (limit.value == tourney_rulesets_data.new[interaction.member.user.id].ppodlimit) {
                        limit.default = true
                    }
                    limits.push(limit)
                }
                var methods = [
                    {
                        label: "Disabled",
                        value: "disabled",
                        description: "No permanent pod ban"
                    },
                    {
                        label: "Player Pick",
                        value: "player_pick",
                        description: "Each player gets to pick a permanent pod ban"
                    },
                    {
                        label: "Earned via Win",
                        value: "win",
                        description: "Players only get access to this permaban if they win the first track"
                    },
                    {
                        label: "Earned via Loss",
                        value: "loss",
                        description: "Players only get access to this permaban if they lose the first track"
                    },
                    {
                        label: "Either/Or",
                        value: "either_or",
                        description: "Players must choose between this permaban or another permaban with the same setting"
                    },
                    {
                        label: "Random",
                        value: "random",
                        description: "Pods are permanently banned randomly"
                    }
                ]
                for (i = 0; i < methods.length; i++) {
                    if (methods[i].value == tourney_rulesets_data.new[interaction.member.user.id].ppodmethod) {
                        methods[i].default = true
                    }
                }
                components.push(
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_permapodban_ppodmethod",
                                options: methods,
                                placeholder: "Permanent Pod Ban Method",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    }
                )
                if (tourney_rulesets_data.new[interaction.member.user.id].ppodmethod !== "disabled") {
                    components.push({
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_permapodban_ppodlimit",
                                options: limits,
                                placeholder: "Permanent Pod Bans Per Match",
                                max_values: 1
                            }
                        ]
                    })
                }
            } else if (args[1] == "permaconban") {
                var limits = []
                for (i = 1; i < 6; i++) {
                    var limit = {
                        label: i + " Ban(s) Per Player Per Match",
                        value: i
                    }
                    if (tourney_rulesets_data.new[interaction.member.user.id].pconmethod == "random") {
                        limit.label = i + " Random Ban(s) Per Match"
                    }
                    if (limit.value == tourney_rulesets_data.new[interaction.member.user.id].pconlimit) {
                        limit.default = true
                    }
                    limits.push(limit)
                }
                var methods = [
                    {
                        label: "Disabled",
                        value: "disabled",
                        description: "No permanent condition ban"
                    },
                    {
                        label: "Player Pick",
                        value: "player_pick",
                        description: "Each player gets to pick a permanent condition ban"
                    },
                    {
                        label: "Earned via Win",
                        value: "win",
                        description: "Players only get access to this permaban if they win the first track"
                    },
                    {
                        label: "Earned via Loss",
                        value: "loss",
                        description: "Players only get access to this permaban if they lose the first track"
                    },
                    {
                        label: "Either/Or",
                        value: "either_or",
                        description: "Players must choose between this permaban or another permaban with the same setting"
                    },
                    {
                        label: "Random",
                        value: "random",
                        description: "Conditions are permanently banned randomly"
                    },
                ]
                for (i = 0; i < methods.length; i++) {
                    if (methods[i].value == tourney_rulesets_data.new[interaction.member.user.id].pconmethod) {
                        methods[i].default = true
                    }
                }
                components.push(
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_permaconban_pconmethod",
                                options: methods,
                                placeholder: "Permanent Condition Ban Method",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    }
                )
                if (tourney_rulesets_data.new[interaction.member.user.id].pconmethod !== "disabled") {
                    components.push({
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_permaconban_pconlimit",
                                options: limits,
                                placeholder: "Permanent Condition Bans Per Match",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    })
                }
            } else if (args[1] == "temptrackban") {
                var limits = []
                for (i = 1; i < 6; i++) {
                    var limit = {
                        label: i + " Ban(s) Per Race",
                        value: i
                    }
                    if (limit.value == tourney_rulesets_data.new[interaction.member.user.id].ttracklimit) {
                        limit.default = true
                    }
                    limits.push(limit)
                }
                var methods = [
                    {
                        label: "Disabled",
                        value: "disabled",
                        description: "No temporary track ban"
                    },
                    {
                        label: "Winner's Pick",
                        value: "winners_pick",
                        description: "Winner gets to select temporary track ban"
                    },
                    {
                        label: "Loser's Pick",
                        value: "losers_pick",
                        description: "Loser gets to select temporary track ban"
                    },
                    {
                        label: "Chance Cube",
                        value: "chance_cube",
                        description: "Winner of Chance Cube gets to select temporary track ban"
                    },
                    {
                        label: "Random",
                        value: "random",
                        description: "Tracks are temporarily banned randomly"
                    }
                ]
                for (i = 0; i < methods.length; i++) {
                    if (methods[i].value == tourney_rulesets_data.new[interaction.member.user.id].ttrackmethod) {
                        methods[i].default = true
                    }
                }
                components.push(
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_temptrackban_ttrackmethod",
                                options: methods,
                                placeholder: "Temporary Track Ban Method",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    }
                )
                if (tourney_rulesets_data.new[interaction.member.user.id].ttrackmethod !== "disabled") {
                    components.push(
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    custom_id: "tourney_rulesets_temptrackban_ttracklimit",
                                    options: limits,
                                    placeholder: "Temporary Track Bans Per Race",
                                    min_values: 1,
                                    max_values: 1
                                }
                            ]
                        }
                    )

                }
            } else if (args[1] == "temppodban") {
                var limits = []
                for (i = 1; i < 6; i++) {
                    var limit = {
                        label: i + " Ban(s) Per Race",
                        value: i
                    }
                    if (limit.value == tourney_rulesets_data.new[interaction.member.user.id].tpodlimit) {
                        limit.default = true
                    }
                    limits.push(limit)
                }
                var methods = [
                    {
                        label: "Disabled",
                        value: "disabled",
                        description: "No temporary pod ban"
                    },
                    {
                        label: "Winner's Pick",
                        value: "winners_pick",
                        description: "Winner gets to pick temporary pod ban"
                    },
                    {
                        label: "Loser's Pick",
                        value: "losers_pick",
                        description: "Loser gets to pick temporary pod ban"
                    },
                    {
                        label: "Chance Cube",
                        value: "chance_cube",
                        description: "Winner of Chance Cube gets to pick temporary pod ban"
                    },
                    {
                        label: "Random",
                        value: "random",
                        description: "Pods are temporarily banned randomly"
                    }
                ]
                for (i = 0; i < methods.length; i++) {
                    if (methods[i].value == tourney_rulesets_data.new[interaction.member.user.id].tpodmethod) {
                        methods[i].default = true
                    }
                }
                components.push(
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_temppodban_tpodmethod",
                                options: methods,
                                placeholder: "Temporary Pod Ban Method",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    }
                )
                if (tourney_rulesets_data.new[interaction.member.user.id].tpodmethod !== "disabled") {
                    components.push(
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    custom_id: "tourney_rulesets_temppodban_tpodlimit",
                                    options: limits,
                                    placeholder: "Temporary Pod Ban Limit",
                                    min_values: 1,
                                    max_values: 1
                                }
                            ]
                        }
                    )
                }
            } else if (args[1] == "tempconban") {
                var limits = []
                for (i = 1; i < 6; i++) {
                    var limit = {
                        label: i + " Max Ban(s) Per Race",
                        value: i
                    }
                    if (limit.value == tourney_rulesets_data.new[interaction.member.user.id].tpodlimit) {
                        limit.default = true
                    }
                    limits.push(limit)
                }
                var methods = [
                    {
                        label: "Disabled",
                        value: "disabled",
                        description: "No temporary pod ban"
                    },
                    {
                        label: "Winner's Pick",
                        value: "winners_pick",
                        description: "Winner of last race gets to pick temporary pod ban"
                    },
                    {
                        label: "Loser's Pick",
                        value: "losers_pick",
                        description: "Loser of last race gets to pick temporary pod ban"
                    },
                    {
                        label: "Chance Cube",
                        value: "chance_cube",
                        description: "Winner of Chance Cube gets to pick temporary pod ban"
                    },
                    {
                        label: "Random",
                        value: "random",
                        description: "Pods are temporarily banned randomly"
                    }
                ]
                for (i = 0; i < methods.length; i++) {
                    if (methods[i].value == tourney_rulesets_data.new[interaction.member.user.id].tpodmethod) {
                        methods[i].default = true
                    }
                }
                var match_limits = [
                    {
                        label: "1 Ban Per Win",
                        value: "wins",
                        description: "players earn this ban for every win"
                    },
                    {
                        label: "1 Ban Per Loss",
                        value: "losses",
                        description: "players earn this ban for every loss"
                    }
                ]
                components.push(
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_temppodban_tpodmethod",
                                options: methods,
                                placeholder: "Temporary Pod Ban Method",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    }
                )
                if (tourney_rulesets_data.new[interaction.member.user.id].tpodmethod !== "disabled") {
                    components.push(
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    custom_id: "tourney_rulesets_temppodban_tpodlimit",
                                    options: limits,
                                    placeholder: "Temporary Pod Ban Limit",
                                    min_values: 1,
                                    max_values: 1
                                }
                            ]
                        }
                    )
                }
            } else if (args[1] == "trackselect") {
                var methods = [
                    {
                        label: "Loser's Pick",
                        value: "losers_pick",
                        description: "Loser gets to pick the track for the next race"
                    },
                    {
                        label: "Winner's Pick",
                        value: "winners_pick",
                        description: "Winner gets to pick the track for the next race"
                    },
                    {
                        label: "Chance Cube",
                        value: "random_pick",
                        description: "Winner of Chance Cube gets to pick the track for the next race"
                    },
                    {
                        label: "Random",
                        value: "random",
                        description: "track for the next race is randomly selected"
                    }
                ]
                for (i = 0; i < methods.length; i++) {
                    if (methods[i].value == tourney_rulesets_data.new[interaction.member.user.id].trackmethod) {
                        methods[i].default = true
                    }
                }
                var track_options = []
                for (var i = 0; i < 25; i++) {
                    var track_option = {
                        label: tracks[i].name,
                        value: i,
                        description: (circuits[tracks[i].circuit].name + " Circuit | Race " + tracks[i].cirnum + " | " + planets[tracks[i].planet].name).substring(0, 50),
                        emoji: {
                            name: planets[tracks[i].planet].emoji.split(":")[1],
                            id: planets[tracks[i].planet].emoji.split(":")[2].replace(">", "")
                        }
                    }
                    if (Object.values(tourney_rulesets_data.new[interaction.member.user.id].tracktracks).includes(String(track_option.value))) {
                        track_option.default = true
                    }
                    track_options.push(track_option)
                }
                components.push(
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_trackselect_trackmethod",
                                options: methods,
                                placeholder: "Track Selection Method",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    },
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_trackselect_tracktracks",
                                options: track_options,
                                placeholder: "Track Selection Options",
                                min_values: 1,
                                max_values: 25
                            }
                        ]
                    }
                )
            } else if (args[1] == "trackdup") {
                var limits = []
                for (i = 1; i < 6; i++) {
                    var limit = {
                        label: i + " Per Player Per Match",
                        value: i
                    }
                    if (limit.value == tourney_rulesets_data.new[interaction.member.user.id].dupelimit) {
                        limit.default = true
                    }
                    limits.push(limit)
                }
                var methods = [
                    {
                        label: "Disabled",
                        value: "disabled",
                        description: "repeat track picks are not allowed"
                    },
                    {
                        label: "Salty Runback",
                        value: "salty_runback",
                        description: "players can runback a track only if they haven’t won"
                    },
                    {
                        label: "Saltier Runback",
                        value: "saltier_runback",
                        description: "players can runback a Salty Runback"
                    },
                    {
                        label: "Saltiest Runback",
                        value: "saltiest_runback",
                        description: "players can runback a Saltier runback"
                    },
                    {
                        label: "Any Condition",
                        value: "any",
                        description: "repeat track picks are allowed under any condition"
                    }
                ]
                for (i = 0; i < methods.length; i++) {
                    if (methods[i].value == tourney_rulesets_data.new[interaction.member.user.id].dupecondition) {
                        methods[i].default = true
                    }
                }
                components.push(
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_trackdup_dupecondition",
                                options: methods,
                                placeholder: "Repeat Track Condition",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    }
                )
                if (tourney_rulesets_data.new[interaction.member.user.id].dupecondition !== "disabled") {
                    components.push(
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    custom_id: "tourney_rulesets_trackdup_dupelimit",
                                    options: limits,
                                    placeholder: "Repeat Track Pick Limit",
                                    min_values: 1,
                                    max_values: 1
                                }
                            ]
                        }
                    )
                }
            } else if (args[1] == "trackcon") {
                var limits = []
                limits.push(
                    {
                        label: "1 Per Win",
                        value: "wins",
                        description: "Players earn forces for each race win"
                    },
                    {
                        label: "1 Per Loss",
                        value: "lossess",
                        description: "Players earn forces for each race loss"
                    }
                )
                for (i = 1; i < 13; i++) {
                    limits.push({
                        label: i + " Per Player Per Match",
                        value: i
                    })
                }
                for (i = 0; i < limits.length; i++) {
                    if (tourney_rulesets_data.new[interaction.member.user.id].conlimit == limits[i].value) {
                        limits[i].default = true
                    }
                }
                var conmax = []
                for (i = 1; i < 6; i++) {
                    conmax.push({
                        label: i + " Max Per Race",
                        value: i
                    })
                }
                for (i = 0; i < conmax.length; i++) {
                    if (tourney_rulesets_data.new[interaction.member.user.id].conmax == conmax[i].value) {
                        conmax[i].default = true
                    }
                }
                var methods = [
                    {
                        label: "Disabled",
                        value: "disabled",
                        description: "No special conditions are allowed"
                    },
                    {
                        label: "Winner's Pick",
                        value: "winners_pick",
                        description: "Winner gets to pick conditions for the next track"
                    },
                    {
                        label: "Loser's Pick",
                        value: "losers_pick",
                        description: "Loser gets to pick conditions for the next track"
                    },
                    {
                        label: "Chance Cube",
                        value: "chance_cube",
                        description: "Winner of Chance Cube gets to pick conditions for the next track"
                    },
                    {
                        label: "Random",
                        value: "random",
                        description: "conditions for the next track are randomly selected"
                    }
                ]
                for (i = 0; i < methods.length; i++) {
                    if (tourney_rulesets_data.new[interaction.member.user.id].conmethod == methods[i].value) {
                        methods[i].default = true
                    }
                }
                var conoptions = [
                    {
                        label: "Full Track",
                        value: "ft"
                    },
                    {
                        label: "Skips",
                        value: "sk"
                    },
                    {
                        label: "Max Upgrades",
                        value: "mu"
                    },
                    {
                        label: "No Upgrades",
                        value: "nu"
                    },
                    {
                        label: "Pod Ban",
                        value: "pb"
                    },
                    {
                        label: "Pod Choice",
                        value: "pc"
                    },
                    {
                        label: "Unmirrored",
                        value: "um"
                    },
                    {
                        label: "Mirrored",
                        value: "mi"
                    },
                    {
                        label: "1 Lap",
                        value: "l1"
                    },
                    {
                        label: "2 Lap",
                        value: "l2"
                    },
                    {
                        label: "3 Lap",
                        value: "l3"
                    },
                    {
                        label: "4 Lap",
                        value: "l4"
                    },
                    {
                        label: "5 Lap",
                        value: "l5"
                    }
                ]
                for (i = 0; i < conoptions.length; i++) {
                    if (Object.values(tourney_rulesets_data.new[interaction.member.user.id].conoptions).includes(conoptions[i].value)) {
                        conoptions[i].default = true
                    }
                }
                components.push(
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_trackcon_conmethod",
                                options: methods,
                                placeholder: "Condition Method",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    }
                )
                if (tourney_rulesets_data.new[interaction.member.user.id].conmethod !== "disabled") {
                    if (tourney_rulesets_data.new[interaction.member.user.id].conmethod !== "random") {
                        components.push(
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 3,
                                        custom_id: "tourney_rulesets_trackcon_conlimit",
                                        options: limits,
                                        placeholder: "Conditions (Forces) Per Match",
                                        min_values: 1,
                                        max_values: 1
                                    }
                                ]
                            }
                        )
                    }
                    components.push({
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_trackcon_conmax",
                                options: conmax,
                                placeholder: "Max Conditions (Forces) Per Race",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    custom_id: "tourney_rulesets_trackcon_conoptions",
                                    options: conoptions,
                                    placeholder: "Condition Options",
                                    min_values: 1,
                                    max_values: 13
                                }
                            ]
                        })
                }
            } else if (args[1] == "podselect") {
                var methods = [
                    {
                        label: "Players' Pick",
                        value: "players_pick",
                        description: "Players get to pick their own pods for the next race"
                    },
                    {
                        label: "Loser's Pick",
                        value: "losers_pick",
                        description: "Loser gets to pick the pod for both players for the next race"
                    },
                    {
                        label: "Winner's Pick",
                        value: "winners_pick",
                        description: "Winner gets to pick the pod for both players for the next race"
                    },
                    {
                        label: "Chance Cube",
                        value: "chance_cube",
                        description: "Winner of Chance Cube gets to pick the pod for both players for the next race"
                    },
                    {
                        label: "Random Mirrored",
                        value: "random_mirrored",
                        description: "players are assigned the same random pod for the next race"
                    },
                    {
                        label: "Limited Choice",
                        value: "limited_choice",
                        description: "players choose their pod from a limited predetermined selection of pods"
                    },
                    {
                        label: "Random Limited Choice",
                        value: "random_limited_choice",
                        description: "players choose their pod from a limited random selection of pods"
                    },
                    {
                        label: "Pod Pool",
                        value: "pod_pool",
                        description: "players can only use each pod a limited number of times"
                    }
                ]
                for (i = 0; i < methods.length; i++) {
                    if (methods[i].value == tourney_rulesets_data.new[interaction.member.user.id].podmethod) {
                        methods[i].default = true
                    }
                }
                var pod_options = []
                for (var i = 0; i < 23; i++) {
                    var racer_option = {
                        label: racers[i].name,
                        value: i,
                        description: racers[i].pod.substring(0, 50),
                        emoji: {
                            name: racers[i].flag.split(":")[1],
                            id: racers[i].flag.split(":")[2].replace(">", "")
                        }
                    }
                    if (Object.values(tourney_rulesets_data.new[interaction.member.user.id].podpods).includes(String(racer_option.value))) {
                        racer_option.default = true
                    }
                    pod_options.push(racer_option)
                }
                components.push(
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_podselect_podmethod",
                                options: methods,
                                placeholder: "Pod Selection Method",
                                min_values: 1,
                                max_values: 1
                            }
                        ]
                    }
                )
                if (tourney_rulesets_data.new[interaction.member.user.id].podmethod == "random_limited_choice") {
                    var limits = []
                    for (i = 2; i < 11; i++) {
                        var limit = {
                            label: i + " Choice(s)",
                            value: i
                        }
                        if (limit.value == tourney_rulesets_data.new[interaction.member.user.id].rndlimited) {
                            limit.default = true
                        }
                        limits.push(limit)
                    }
                    components.push(
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    custom_id: "tourney_rulesets_podselect_rndlimited",
                                    options: limits,
                                    placeholder: "Random Limited Choice Count",
                                    min_values: 1,
                                    max_values: 1
                                }
                            ]

                        }
                    )
                }
                if (tourney_rulesets_data.new[interaction.member.user.id].podmethod == "pod_pool") {
                    var limits = []
                    for (i = 1; i < 6; i++) {
                        var limit = {
                            label: i + " Use(s) Per Pod",
                            value: i
                        }
                        if (limit.value == tourney_rulesets_data.new[interaction.member.user.id].poollimit) {
                            limit.default = true
                        }
                        limits.push(limit)
                    }
                    components.push(
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    custom_id: "tourney_rulesets_podselect_poollimit",
                                    options: limits,
                                    placeholder: "Pod Pool Use Limit",
                                    min_values: 1,
                                    max_values: 1
                                }
                            ]

                        }
                    )
                }
                components.push(
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: "tourney_rulesets_podselect_podpods",
                                options: pod_options,
                                placeholder: "Pod Options",
                                min_values: 1,
                                max_values: 23
                            }
                        ]

                    }
                )
                //add random limited choice limit
                //add pod pool limit
            } else if (args[1] == "finalize") {
                var rename = true
                if (args[2] == "rename") {
                    type = 7
                    rename = false
                    client.api.webhooks(client.user.id, interaction.token).post({
                        data: {
                            content: "Send the new name for your ruleset in this channel",
                            flags: 64
                        }
                    })

                    async function sendResponse() {
                        response = await client.api.webhooks(client.user.id, interaction.token).messages('@original').patch({
                            data: {
                                embeds: [rulesetEmbed],
                                components: components
                            }
                        })
                        return response
                    }
                    //const filter = m => m.author.id == interaction.member.user.id
                    const collector = new Discord.MessageCollector(client.channels.cache.get(interaction.channel_id), m => m.author.id == interaction.member.user.id, { max: 1, time: 300000 }); //messages
                    collector.on('collect', message => {
                        tourney_rulesets.child("new").child(interaction.member.user.id).child("name").set(message.content)
                        rulesetEmbed.setTitle(message.content)
                        components[1].components[0].disabled = false
                        message.delete().then(sendResponse())
                    })
                    //client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 6, data: {} } })
                    //return
                }
                components.push(
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: "Rename",
                                style: 1,
                                custom_id: "tourney_rulesets_finalize_rename",
                                disabled: !rename
                            },
                            {
                                type: 2,
                                label: "Save",
                                style: 3,
                                custom_id: "tourney_rulesets_finalize_save",
                            }
                        ]
                    }
                )

            } else if (args[1] == "qual") {
                //pod select
                //add race
                //track
                //conditions
                //time limit
                //penalty time
            } else if (args[1] == "1vall") {
                //pod select
                //add race
                //track
                //conditions
            }

            //create embed
            rulesetEmbed


            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: type,
                    data: {
                        flags: flags,
                        embeds: [rulesetEmbed],
                        components: components
                    }
                }
            })
        }
    }
}
