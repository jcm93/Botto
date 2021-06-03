
client.api.channels("850131066365804564").messages.post({
    data: {
        content: ":checkered_flag: **Multiplayer**\nGet the **Multiplayer** role and get notified when someone's hosting a multiplayer race. Read the multiplayer guide and head to the <#444627151858171934> channel to get started.",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Get the Multiplayer role",
                        style: 1,
                        custom_id: "role_474920988790751232"
                    },
                    {
                        type: 2,
                        label: "View Multiplayer Guide",
                        style: 5,
                        url: "https://bit.ly/34emHqj"
                    }
                ]
            }
        ]
    }
})
client.api.channels("850131066365804564").messages.post({
    data: {
        content: "\u200B\n:crossed_swords: **Tournaments**\nGet the **Tournament Updates** role and get notified of tournament matches and announcements. Check out the latest in the <#536455290091077652> channel.",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Get the Tournament Updates role",
                        style: 1,
                        custom_id: "role_841059665474617353"
                    }
                ]
            }
        ]
    }
})
client.api.channels("850131066365804564").messages.post({
    data: {
        content: "\u200B\n:trophy: **Speedrunning**\nGet the **Speedrunning** role and join the fastest podracers in the galaxy on the speedrun.com leaderboards. Check out the latest strats in the <#449375461886132235> channels.",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Get the Speedrunning role",
                        style: 1,
                        custom_id: "role_535973118578130954"
                    },
                    {
                        type: 2,
                        label: "speedrun.com",
                        style: 5,
                        url: "https://www.speedrun.com/swe1r"
                    }
                ]
            }
        ]
    }
})
client.api.channels("850131066365804564").messages.post({
    data: {
        content: "\u200B\n:joystick: **Platform Roles**\nWhat platform do you use to play Racer? Rep it with a free role.",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "PC Player",
                        emoji: {
                            id: null,
                            name: "💿"
                        },
                        style: 1,
                        custom_id: "role_841404897018380388"
                    },
                    {
                        type: 2,
                        label: "N64 Player",
                        emoji: {
                            id: null,
                            name: "🕹️"
                        },
                        style: 1,
                        custom_id: "role_602246101323612181"

                    },
                    {
                        type: 2,
                        label: "Dreamcast Player",
                        emoji: {
                            id: null,
                            name: "🕹️"
                        },
                        style: 1,
                        custom_id: "role_841405394441338890"
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Switch Player",
                        emoji: {
                            id: null,
                            name: "🎮"
                        },
                        style: 1,
                        custom_id: "role_841405226282909716"
                    },
                    {
                        type: 2,
                        label: "PlayStation Player",
                        emoji: {
                            id: null,
                            name: "🎮"
                        },
                        style: 1,
                        custom_id: "role_841405077470445669"

                    },
                    {
                        type: 2,
                        label: "Xbox Player",
                        emoji: {
                            id: null,
                            name: "🎮"
                        },
                        style: 1,
                        custom_id: "role_841404991784091690"
                    }
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
