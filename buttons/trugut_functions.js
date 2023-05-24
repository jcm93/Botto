const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { numberWithCommas } = require('../tools.js');

exports.betEmbed = function (bet) {
    const Embed = new EmbedBuilder()
        .setTitle(bet.title)
        .setColor('#5865F2')
        .setDescription("`📀" + numberWithCommas(bet.min) + "` - `📀" + numberWithCommas(bet.max) + "`")
        .setAuthor({ name: bet.type == 'tourney' ? 'Tournament Wager' : bet.author.name + "'s Bet", iconURL: bet.type == 'tourney' ? 'https://em-content.zobj.net/thumbs/120/twitter/322/crossed-swords_2694-fe0f.png' : bet.author.avatar })
        .addFields({ name: (bet.outcome_a.winner ? ":white_check_mark: " : "") + bet.outcome_a.title, value: bet.outcome_a.bets ? bet.outcome_a.bets.map(b => b.name + " - " + (bet.outcome_a.winner === false ? "~~" : "") + "`📀" + numberWithCommas(b.amount) + (b.take ? " +" + b.take : "") + "`" + (bet.outcome_a.winner === false ? "~~" : "")).join("\n") : " ", inline: true })
        .addFields({ name: (bet.outcome_b.winner ? ":white_check_mark: " : "") + bet.outcome_b.title, value: bet.outcome_b.bets ? bet.outcome_b.bets.map(b => b.name + " - " + (bet.outcome_b.winner === false ? "~~" : "") + "`📀" + numberWithCommas(b.amount) + (b.take ? " +" + b.take : "") + "`" + (bet.outcome_b.winner === false ? "~~" : "")).join("\n") : " ", inline: true })
    return Embed
}

exports.betComponents = function (bet) {
    const row1 = new ActionRowBuilder()
    if (bet.status == 'open') {
        row1.addComponents(
            new ButtonBuilder()
                .setCustomId("truguts_bet_a")
                .setLabel(bet.outcome_a.title)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("truguts_bet_b")
                .setLabel(bet.outcome_b.title)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("truguts_bet_close")
                .setLabel("Close")
                .setStyle(ButtonStyle.Secondary)
        )
    } else if (bet.status == 'closed') {
        row1.addComponents(
            new ButtonBuilder()
                .setCustomId("truguts_bet_a")
                .setLabel("Set Outcome: " + bet.outcome_a.title)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("truguts_bet_b")
                .setLabel("Set Outcome: " + bet.outcome_b.title)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("truguts_bet_open")
                .setLabel("Reopen")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("truguts_bet_delete")
                .setLabel("Delete")
                .setStyle(ButtonStyle.Danger)
        )
    }
    return [row1]
}