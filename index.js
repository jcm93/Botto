const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const client = new Discord.Client();
var lookup = require("./data.js");
var tourneylookup = require("./tourneydata.js");
var tools = require('./tools.js');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

var firebase = require("firebase/app");
require('firebase/auth');
require('firebase/database');
var admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert({
        "projectId": process.env.FIREBASE_PROJECT_ID,
        "privateKey": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "clientEmail": process.env.FIREBASE_CLIENT_EMAIL
    }),
    databaseURL: "https://botto-efbfd.firebaseio.com"
})

var firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};
firebase.initializeApp(firebaseConfig);

//var database = firebase.database();
var database = admin.database();
var logref = database.ref('log');
var errorlogref = database.ref('log/error');
var weeklychallenges = database.ref('weekly/challenges');
var weeklyapproved = database.ref('weekly/submissions');

var ref = database.ref('challenge/times');
ref.on("value", function (snapshot) {
    challengedata = snapshot.val();
}, function (errorObject) {
    console.log("The read failed: " + errorObject);
});
var profileref = database.ref('challenge/profiles');
profileref.on("value", function (snapshot) {
    profiledata = snapshot.val();
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});
var feedbackref = database.ref('challenge/feedback');
feedbackref.on("value", function (snapshot) {
    feedbackdata = snapshot.val();
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});
var tourney_races = database.ref('tourney/races');
tourney_races.on("value", function (snapshot) {
    tourney_races_data = snapshot.val();
}, function (errorObject) {
    console.log("The read failed: " + errorObject);
});
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
client.ws.on('INTERACTION_CREATE', async interaction => {
    if(interaction.data.hasOwnProperty("name")){
        const command = interaction.data.name.toLowerCase();
        const args = interaction.data.options;
        //command handler
        if (!client.commands.has(command)) return;
        try {
            client.commands.get(command).execute(client, interaction, args);
        } catch (error) {
            console.error(error);
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: "`Error: Command failed to execute `\n" + errorMessage[Math.floor(Math.random() * errorMessage.length)]
                    }
                }
            })
        }
    } else if(interaction.data.hasOwnProperty("custom_id")){
        console.log(interaction.data.custom_id)
    }
})

async function getCommands() {
    const guildcommands = await client.api.applications("545798436105224203").guilds('441839750555369474').commands.get()
    const commands = await client.api.applications("545798436105224203").commands.get()
    console.log(guildcommands)
    console.log(commands)
}

//getCommands()


client.once('ready', () => {
    console.log('Ready!')
    //set bot activity
    client.user.setActivity("/help");
    //client.users.cache.get("256236315144749059").send("Ready!")
    client.channels.cache.get("444208252541075476").send("Ready!");
    try {
        //client.commands.get("scrape").execute();
    } catch {
        console.error(error);
    }
    profileref.get().then(function (snapshot) {
        console.log("checking for incomplete challenges...")
        var profiledata = snapshot.val()
        var keys = Object.keys(profiledata)
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i]
            if (profiledata[k].current !== undefined) {
                if (profiledata[k].current.completed == false) {
                    var recovery_channel = client.channels.cache.get(profiledata[k].current.channel)
                    console.log("dead challenge found for " + profileref.child(k).name)
                    profileref.child(k).child("current").child("completed").set(true)
                    if (profiledata[k].current.message !== undefined) {
                        recovery_channel.messages.fetch(profiledata[k].current.message) //delete old challenge message
                            .then(msg => { msg.delete() }).catch(err => console.log(err));
                    }
                    if (profiledata[k].current.start + 1200000 > Date.now()) {
                        try {
                            var fakeinteraction = {
                                name: "fake",
                                recovery: true,
                                member: {
                                    user: {
                                        id: k,
                                        username: profiledata[k].name
                                    }
                                },
                                guild_id: recovery_channel.guild.id,
                                channel_id: profiledata[k].current.channel
                            }
                            console.log(fakeinteraction)
                            client.commands.get("challenge").execute(client, fakeinteraction, [{ name: "generate" }]);
                        } catch {

                        }
                    }
                }
            }
        }
    });
/*
    var msg = new Discord.Message(client, {
        content: "This is a test message",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Click me!",
                        style: 1,
                        custom_id: "click_one"
                    },
                    {
                        type: 2,
                        label: "Emoji Button!",
                        emoji: {
                            "id": null,
                            "name": "🔥"
                        },
                        style: 1,
                        custom_id: "click_one"
                    }
                ]
            }
        ]
    })
    //client.channels.cache.get("545800310283829270").send(msg)*/

    const testEmbed = new Discord.MessageEmbed()
    testEmbed
        .setTitle("Test")
        .setDescription("this is a test")

    client.api.channels("545800310283829270").messages.post({
        data: {
            embed: testEmbed,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: "🔄",
                            style: 2,
                            custom_id: "click_one"
                        },
                        {
                            type: 2,
                            label: "▶️",
                            style: 2,
                            custom_id: "click_one"
                        },
                        {
                            type: 2,
                            label: "👍",
                            style: 2,
                            custom_id: "click_one"
                        },
                        {
                            type: 2,
                            label: "👎",
                            style: 2,
                            custom_id: "click_one"
                        },
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: "",
                            emoji: {
                                id: null,
                                name: "🔄"
                            },
                            style: 2,
                            custom_id: "click_one"
                        },
                        {
                            type: 2,
                            label: "",
                            emoji: {
                                id: null,
                                name: "▶️"
                            },
                            style: 2,
                            custom_id: "click_one"
                        },
                        {
                            type: 2,
                            label: "",
                            emoji: {
                                id: null,
                                name: "👍"
                            },
                            style: 2,
                            custom_id: "click_one"
                        },
                        {
                            type: 2,
                            label: "",
                            emoji: {
                                id: null,
                                name: "👎"
                            },
                            style: 2,
                            custom_id: "click_one"
                        },
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: "Role 7",
                            style: 2,
                            custom_id: "click_one"
                        },
                        {
                            type: 2,
                            label: "Role 8",
                            style: 2,
                            custom_id: "click_one"
                        },
                        {
                            type: 2,
                            label: "Role 9",
                            style: 2,
                            custom_id: "click_one"
                        },
                    ]
                }
            ]
        }
        
    })
    //set up role claim message
    const channelId = '442116200147714049'

    const getEmoji = (emojiName) =>
        client.emojis.cache.find((emoji) => emoji.name === emojiName)

    const addReactions = (message, reactions) => {
        message.react(reactions[0])
        reactions.shift()
        if (reactions.length > 0) {
            setTimeout(() => addReactions(message, reactions), 750)
        }
    }

    const emojis = {
        "🏁": 'Multiplayer',
        "⚔️": 'Tournament',
        "🏆": 'Speedrunning',
        "💿": '💿 PC Player',
        "🇳": '🕹️ N64 Player',
        "🇩": '🕹️ Dreamcast Player',
        "🇸": '🎮 Switch Player',
        "🇵": '🎮 PlayStation Player',
        "🇽": '🎮 Xbox Player'
    }

    const reactions = []

    let emojiText = ''
    for (const key in emojis) {
        const emoji = key//getEmoji(key)
        reactions.push(emoji)

        const role = emojis[key]
        reactions.push(emoji)
        emojiText += `${emoji} - ${role}\n`
    }
    var messageID = ""
    client.channels.fetch(channelId).then(c => {
        c.messages.fetch({ limit: 1 }).then(messages => {
            let lastMessage = messages.first();
            if (lastMessage.author.bot) {
                lastMessage.edit(':busts_in_silhouette: **Self-Roles** \nAdd/remove reactions or use the `/role` command to manage your roles.\n\n' + emojiText)
                    .then(m => {
                        addReactions(m, reactions)
                        messageID = lastMessage.id
                    })
            } else {
                c.send(':busts_in_silhouette: **Self-Roles** \nAdd/remove reactions or use the `/role` command to manage your roles.\n\n' + emojiText)
                    .then(m => {
                        addReactions(m, reactions)
                        messageID = m.id
                    })
            }
        })
    })

    const handleReaction = (reaction, user, add) => {
        if (user.id === '545798436105224203') {
            return
        }

        const emoji = reaction._emoji.name

        const { guild } = reaction.message
        const roleName = emojis[emoji]
        if (!roleName) {
            return
        }

        const role = guild.roles.cache.find(role => role.name === roleName)
        const member = guild.members.cache.find(member => member.id === user.id)

        if (add) {
            member.roles.add(role)
        } else {
            member.roles.remove(role)
        }
    }



    client.on('messageReactionAdd', (reaction, user) => {
        if (reaction.message.id === messageID) { //message id goes here
            handleReaction(reaction, user, true)
        }
    })

    client.on('messageReactionRemove', (reaction, user) => {
        if (reaction.message.id === messageID) { //message id goes here
            handleReaction(reaction, user, false)
        }
    })


})

client.on("error", (e) => {
    console.error(e)
    var data = {
        date: Date(),
        error: e
    }
    errorlogref.push(data)
});
//client.on("warn", (e) => console.warn(e));
//client.on("debug", (e) => console.info(e));

client.on('guildMemberAdd', (guildMember) => { //join log
    if (guildMember.guild.id == "441839750555369474") {
        var random = Math.floor(Math.random() * welcomeMessages.length)
        var join = welcomeMessages[random]
        client.channels.cache.get("441839751235108875").send(join.replace("replaceme", "<@" + guildMember.user + ">"));
        const guild = client.guilds.cache.get("441839750555369474");
        const role = guild.roles.cache.get("442316203835392001");
        let member = guildMember
        member.roles.add(role).catch(console.error);
    }
})

client.on("messageDelete", (messageDelete) => {
    if (messageDelete.author.bot == false && messageDelete.channel.type == "text" && !messageDelete.content.startsWith("!")) {
        var channelname = ""
        for (var i = 0; i < discordchannels.length; i++) {
            if (discordchannels[i].id == messageDelete.channel.id) {
                channelname = discordchannels[i].name
            }
        }
        var data = {
            user: messageDelete.author.id,
            name: messageDelete.author.username,
            date: messageDelete.createdTimestamp,
            action: "deleted message",
            message: messageDelete.content,
            channel: messageDelete.channel.id,
            channel_name: channelname
        }
        logref.push(data);
    }
});

client.on('messageUpdate', (oldMessage, newMessage) => {
    emb = newMessage.embeds
    for (i = 0; i < emb.length; i++) {
        if (emb[i].url == "" && newMessage.author.bot == false) {
            client.users.cache.get("256236315144749059").send(`potential spambot: ${messageDelete.author.username} detected in ${messageDelete.channel.id}`)
        }
    }
    if (emb.length == 0) {
        if (oldMessage.author.bot == false && oldMessage.channel.type == "text" && oldMessage !== newMessage) {
            var channelname = ""
            for (var i = 0; i < discordchannels.length; i++) {
                if (discordchannels[i].id == newMessage.channel.id) {
                    channelname = discordchannels[i].name
                }
            }
            var data = {
                user: oldMessage.author.id,
                name: oldMessage.author.username,
                date: oldMessage.createdTimestamp,
                action: "edited message",
                message: oldMessage.content,
                edit: newMessage.content,
                channel: oldMessage.channel.id,
                channel_name: channelname
            }
            logref.push(data);
        }
    }
});

// when a user joins/leaves a voice channel
client.on('voiceStateUpdate', (oldState, newState) => {

    let newUserChannel = newState.channel
    let oldUserChannel = oldState.channel
    var chan = client.channels.cache.get('441840193754890250');
    //get list of members in voice channel
    if (chan !== undefined) {
        var mems = chan.members;
        var arr = [];
        for (let [snowflake, guildMember] of mems) {
            if (guildMember.displayName !== "Botto") {
                arr.push(guildMember)
            }

        }

    }

    //if member joins Multiplayer Lobby 1
    if (oldState == undefined && newState.channelID == "441840193754890250" && newState.member.id !== "545798436105224203") {
        //random welcome message based on how many members are in voice channel
        if (arr.length == 1) {
            var random = Math.floor(Math.random() * 2)
        } else if (arr.length == 2) {
            var random = Math.floor(Math.random() * 3) + 2
        } else if (2 < arr.length < 5) {
            var random = Math.floor(Math.random() * 9) + 5
        } else if (4 < arr.length < 8) {
            var random = Math.floor(Math.random() * 6) + 14
        } else if (7 < arr.length) {
            var random = Math.floor(Math.random() * 4) + 17
        }
        var str = welcomeMessages[random]
        client.channels.cache.get("551786988861128714").send(str.replace("replaceme", "<@" + newState.member + ">"))
    }
    //if member is already in any voice channel
    if (oldUserChannel !== undefined) {
        //member leaves multiplayer or troubleshooting channel
        const voicecon = client.guilds.cache.get("441839750555369474")
        if (voicecon.voice !== null) {
            if ((oldState.channelID == "441840193754890250" || oldState.channelID == "441840753111597086") && newState == undefined) {
                random = Math.floor(Math.random() * goodbyeMessages.length)
                random2 = Math.floor(Math.random() * voiceFarewell.length)
                var str = goodbyeMessages[random]
                client.channels.cache.get("551786988861128714").send(str.replace("replaceme", "<@" + oldState.member + ">"))
            }
        }
        //member is moving from one channel to another
        if (newState !== undefined) {
            //member moves from multiplayer to troubleshooting
            if (oldState.channelID == "441840193754890250" && newState.channelID == "441840753111597086" && newState.member.id !== "288258590010245123" && newState.member.id !== "545798436105224203") {
                random = Math.floor(Math.random() * troubleShooting.length)
                random2 = Math.floor(Math.random() * voiceTrouble.length)
                var str = troubleShooting[random]
                client.channels.cache.get("551786988861128714").send(str.replace("replaceme", "<@" + oldState.member + ">"))
            }
            //member moves back from troubleshooting to multiplayer
            if (oldState.channelID == "441840753111597086" && newState.channelID == "441840193754890250" && newState.member.id !== "288258590010245123" && newState.member.id !== "545798436105224203") {
                random = Math.floor(Math.random() * fixed.length)
                random2 = Math.floor(Math.random() * voiceFixed.length)
                var str = fixed[random]
                client.channels.cache.get("551786988861128714").send(str.replace("replaceme", "<@" + oldState.member + ">"))
            }
        }
    }
})

client.on('message', message => {
    if (message.author.bot) return; //trumps any command from executing from a bot message

    if (message.content == `${prefix}guilds`) {
        console.log(client.guilds.cache)
        //console.log(client.guilds.cache.get("697833083201650689"))
    }

    if (message.content.toLowerCase() == `${prefix}botto`) {
        const Discord = require('discord.js');
        const myEmbed = new Discord.MessageEmbed()
            .setTitle("Botto")
            .setFooter("/botto")
            .setDescription("Botto is a protocol droid developed by LightningPirate#5872 for the [Star Wars Episode I: Racer Discord](https://discord.gg/BEJACxXQWz). His purpose is to enhance your Star Wars Episode I: Racer gameplay. This bot can also be found on **" + String(Number(client.guilds.cache.size) - 1) + "** other servers.")
            .addField("Features", "Botto uses Discord's integrated slash commands feature for bots. Type forward slash ('/') to see a full list of commands including several `/lookup` and `/random` commands for SWE1R content. He is also capable of getting leaderboard data from [speedrun.com](https://www.speedrun.com/swe1r) with the `/src` command and tournament leaderboards using the `/tourney` command. Another popular feature is the `/challenge` command which calls randomly generated challenges and saves submitted times.", false)
            .addField("Invite", "To invite Botto to your server with slash commands, [click here](https://discord.com/api/oauth2/authorize?client_id=545798436105224203&permissions=0&scope=bot%20applications.commands).", false)
            .addField("Github", "To view Botto's github page, [click here](https://github.com/louriccia/Botto).", false)
            .addField("Feedback", "[Request a feature](https://github.com/louriccia/Botto/discussions/3) or [give your feedback](https://github.com/louriccia/Botto/discussions/4) on using the bot by commenting on the linked discussion posts.", false)
            .setColor("#7289DA")
            .setThumbnail(client.user.avatarURL())
        message.channel.send(myEmbed)
    }
})


client.api.applications("545798436105224203").commands.post({
    data: {
        name: "tourney",
        description: "get tourney leaderboards, lookup tourney profiles, and more",
        type: 2,
        options: [
            {
                name: 'leaderboards',
                description: 'get top-5 leaderboards for tournament runs of each track',
                type: 1,
                options: [
                    {
                        name: "track",
                        description: "name or abbreviation of the track",
                        type: 3,
                        required: true,
                        choices: [
                            {
                                name: "The Boonta Training Course",
                                value: "0"
                            },
                            {
                                name: "Mon Gazza Speedway",
                                value: "1"
                            },
                            {
                                name: "Beedo's Wild Ride",
                                value: "2"
                            },
                            {
                                name: "Aquilaris Classic",
                                value: "3"
                            },
                            {
                                name: "Malastare 100",
                                value: "4"
                            },
                            {
                                name: "Vengeance",
                                value: "5"
                            },
                            {
                                name: "Spice Mine Run",
                                value: "6"
                            },
                            {
                                name: "Sunken City",
                                value: "7"
                            },
                            {
                                name: "Howler Gorge",
                                value: "8"
                            },
                            {
                                name: "Dug Derby",
                                value: "9"
                            },
                            {
                                name: "Scrapper's Run",
                                value: "10"
                            },
                            {
                                name: "Zugga Challenge",
                                value: "11"
                            },
                            {
                                name: "Baroo Coast",
                                value: "12"
                            },
                            {
                                name: "Bumpy's Breakers",
                                value: "13"
                            },
                            {
                                name: "Executioner",
                                value: "14"
                            },
                            {
                                name: "Sebulba's Legacy",
                                value: "15"
                            },
                            {
                                name: "Grabvine Gateway",
                                value: "16"
                            },
                            {
                                name: "Andobi Mountain Run",
                                value: "17"
                            },
                            {
                                name: "Dethro's Revenge",
                                value: "18"
                            },
                            {
                                name: "Fire Mountain Rally",
                                value: "19"
                            },
                            {
                                name: "The Boonta Classic",
                                value: "20"
                            },
                            {
                                name: "Ando Prime Centrum",
                                value: "21"
                            },
                            {
                                name: "Abyss",
                                value: "22"
                            },
                            {
                                name: "The Gauntlet",
                                value: "23"
                            },
                            {
                                name: "Inferno",
                                value: "24"
                            }
                        ]
                    },
                    {
                        name: "skips",
                        description: "filter by skip runs or full track runs",
                        type: 3,
                        required: false,
                        choices: [
                            {
                                name: "any",
                                value: "any"
                            },
                            {
                                name: "skips",
                                value: "skips"
                            },
                            {
                                name: "full track",
                                value: "ft"
                            }
                        ]
                    },
                    {
                        name: "upgrades",
                        description: "filter by upgrade runs (mu) or no upgrade runs (nu)",
                        type: 3,
                        required: false,
                        choices: [
                            {
                                name: "any",
                                value: "any"
                            },
                            {
                                name: "upgrades",
                                value: "mu"
                            },
                            {
                                name: "no upgrades",
                                value: "nu"
                            }
                        ]
                    },
                    {
                        name: "pod",
                        description: "filter runs by a specific pod or filter out pods with 'no' in front; use racer's first name/initials",
                        type: 3,
                        required: false,
                    },
                    {
                        name: "player",
                        description: "filter runs by player",
                        type: 6,
                        required: false,
                    },
                    {
                        name: "deaths",
                        description: "filter runs by deaths or deathless",
                        type: 3,
                        required: false,
                        choices: [
                            {
                                name: "any",
                                value: "any"
                            },
                            {
                                name: "deaths",
                                value: "deaths"
                            },
                            {
                                name: "deathless",
                                value: "deathless"
                            }
                        ]
                    },
                    {
                        name: "quali",
                        description: "include qualifying times (false by default)",
                        type: 5,
                        required: false
                    },
                    {
                        name: "tourney",
                        description: "filter runs by tournament",
                        type: 3,
                        required: false,
                        choices: [
                            {
                                name: "20th Anniversary Tournament 2019",
                                value: "0"
                            },
                            {
                                name: "Galactic Tournament 2020",
                                value: "1"
                            },
                            {
                                name: "David Stubbs Tribute 2021",
                                value: "2"
                            },
                            {
                                name: "Galactic Tournament 2021",
                                value: "3"
                            }
                        ]
                    }
                ]
            },
            {
                name: "profile",
                description: "get profile stats on tournament participants",
                type: 1,
                options: [
                    {
                        name: "participant",
                        description: "select someone to get their tourney stats",
                        type: 6,
                        required: false
                    }
                ]
            }
        ]
    }
})

client.login(process.env.token);