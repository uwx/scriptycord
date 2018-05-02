//META{"name":"SuppressMentions"}*//

class SuppressMentions 
{
	getName() { return "Suppress Mentions"; }

	getDescription() { return "Plugin for suppressing annoying role mentions from global emote servers. Turn the \"Suppress @everyone and @here\" option on in the guild settings to enable."; }

	getAuthor() { return "ngrst183"; } 

	getVersion() { return "0.3"; }
	
	load() {}

	start() 
	{
		if (!window.DiscordInternals) 
		{
			const message = 'Lib Discord Internals is not installed. Please download and install DiscordInternals from this link: https://betterdiscord.net/ghdl?url=https://github.com/samogot/betterdiscord-plugins/blob/master/v1/1lib_discord_internals.plugin.js';
			alert(message);
			return false;
		}
		
		const {monkeyPatch, WebpackModules} = window.DiscordInternals;

		const isMentionedModule = WebpackModules.findByUniqueProperties(["isMentioned"]);
		const getChannelModule = WebpackModules.findByUniqueProperties(["getChannel"]);
		const isSuppressEveryoneEnabledModule = WebpackModules.findByUniqueProperties(["isSuppressEveryoneEnabled"]);

		this.cancelGlobalPatch = monkeyPatch(isMentionedModule, 'isMentioned', 
		{
			instead: (e) => 
			{					
				let message = e.methodArguments[0];
				let userID = e.methodArguments[1];

				if (!(message.mentions.some(function(e) {return e.id === userID})))
				{
					let guild = getChannelModule.getChannel(message.channel_id).getGuildId();

					if (guild)
					{
						if (isSuppressEveryoneEnabledModule.isSuppressEveryoneEnabled(guild)) 
						{
							return !1;
						}
					}
				}
				e.callOriginalMethod();
			}			
		});
	}

	stop() 
	{		
		if (this.cancelGlobalPatch) 
		{
			this.cancelGlobalPatch();
			delete this.cancelGlobalPatch;
		}
	}
}
/*@end @*/
