const path = require('path');
const fs = require('fs').promises;
const BaseCommand = require('../structures/CommandClass');

module.exports = class CommandClass {
	constructor(client) {
		this.client = client;
	}

	async build(dir) {
		try {
			const slash = [];
			const filePath = path.join(__dirname, dir);
			const files = await fs.readdir(filePath);
			for (const file of files) {
				const stat = await fs.lstat(path.join(filePath, file));
				if (stat.isDirectory()) this.build(path.join(dir, file));
				if (file.endsWith('.js')) {
					const Command = require(path.join(filePath, file));
					if (Command.prototype instanceof BaseCommand) {
						const cmd = new Command(this.client);
						await this.client.commands.set(cmd.name, cmd);
						slash.push(cmd);
						await this.client.guilds.cache
							.get(process.env.GUILD_ID)
							.commands.create(cmd);
					}
				}
			}
			// await this.client.application.commands.set(slash);
		} catch (e) {
			console.log(e);
		}
	}
};