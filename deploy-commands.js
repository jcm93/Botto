const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');

//const {commands} = require('./command_register.js');
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
let commands = []
// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	if (command.data && command.data.name !== 'scrape') {
		console.log(command.data)
		commands.push(command.data.toJSON());
	}

}

const clientID = '545798436105224203'
const SWE1R_Guild = '441839750555369474'
const Botto_Guild = '1135800421290627112'

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		// const data = await rest.put(
		// 	Routes.applicationCommands('545798436105224203'),
		// 	{ body: commands },
		// );

		//delete
		await rest.put(Routes.applicationGuildCommands(clientID, SWE1R_Guild), { body: [] })
			.then(() => console.log('Successfully deleted all guild commands.'))
			.catch(console.error);

		// await rest.put(
		// 	Routes.applicationGuildCommands(clientID, Botto_Guild),
		// 	{ body: commands },
		// );

		//console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();