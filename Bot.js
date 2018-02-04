const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs-jetpack');
const Level = require('./Levels.js');
const sanitize = require('sanitize-filename');

const keys = [
];

client.on('ready', () => {
	console.log('Loaded the bot!');
	client.user.setGame("Hiii~! Monika's here~");
});

client.on('message', message => {

	var instigator = message.author;
	var channel = message.channel;

	if (channel.type == "dm" || channel.type == "group") {
		return;
	}

	if(channel.type == "text") {

		Level.InitLevels(instigator, null, null);

		var command = message.content.toLowerCase();
		var guild = message.guild;
		var guild_member = guild.member(instigator);
		var safe_username = sanitize(instigator.username);
		var msg_lb_target = "402729780287504386";
		var lb = Level.LBT();
		var lbchannel = guild.channels.get("402720348937781248");

		var Infamy_M_Role = "401390152552939522"
		var Infamy_Levels = ["0", "408604999153876992", "408546239710232576", "408546390881599509", "408546428433203200", "408546448993681408"];

		Level.TrackEXP(instigator, "GiveEXP", message);

		if (command == "!monika" || command == "!justmonika") {
			message.reply("<3");
		}

		if (command == "!userid") {
			message.reply(instigator.id);
		}

		if (command == "!hello") {
			message.reply("Hi!");
		}

		if (command == "!startgiveaway") {
			OnGiveawayStarts(instigator, channel);
		}

		if (command == "!reset") {
			// // //
		}

		if (command == "!infamy") {
			var UserData = Level.GetUserData();
			var CurrentInfamy = UserData.infamy;
			var convert_level = Level.GetLevelByExp(UserData.experience);
			var CurrentLevel = convert_level;
			var NewInfamy = CurrentInfamy + 1;

			if (CurrentLevel == 100 && CurrentInfamy < 5) {
				Level.PerformResetOnInfamy();

				if (CurrentInfamy == 0) { guild_member.addRole(Infamy_M_Role); }
				if (CurrentInfamy > 0) { guild_member.removeRole(Infamy_Levels[CurrentInfamy]); } // Clear previous level role

				guild_member.addRole(Infamy_Levels[NewInfamy]);
				message.reply("you are now infamous level " + NewInfamy + "! ♠");

			} else {
				message.reply("you're either not level 100, or you are at the maximum infamy level");
			}
		}

		lbchannel.fetchMessage(msg_lb_target)
		//.then(message => message.edit("Changes are going to be made to the EXP system. For now, it's disabled."));
		.then(message => message.edit(lb));
	}
});

function OnGiveawayStarts(instigator, channel) {
	var allowed_instigator = ["199997315535077376"]

	allowed_instigator.forEach(function(instigator_id) {
		if (instigator.id == allowed_instigator) {
			OnGiveawayAllowed(instigator, channel);
		}
	});
}

function IsDev(instigator) {
	var allowed_instigator = ["199997315535077376"]

	allowed_instigator.forEach(function(instigator_id) {
		if (instigator.id == allowed_instigator) {
			return true;
		}
	});

	return false;
}

function OnGiveawayAllowed(instigator, channel) {
	var instigator_name = instigator.username;
	if(!channel) return;

	if (keys.length == 0) { channel.send("I don't have any keys!"); return; }

	channel.send(instigator_name + " started a giveaway on this channel! 1 key out of " + keys.length + " is gonna be posted every 30 seconds");

	for (var i = keys.length - 1; i >= 0; i--) {
		OnGiveawayTimeout(i, channel);
	}
}

function OnGiveawayTimeout(i, channel) {
	setTimeout(function() {
		channel.send("Key #" + (i + 1) + " : " + keys[i]);
	}, i * 30000)
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

var client_pswd = fs.read("C:/DiscordBot3_Pass/pswd.txt");
client.login(client_pswd);