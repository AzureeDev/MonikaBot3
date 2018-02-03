const fs = require('fs-jetpack');
const dataPath = "./MembersEXP/";
const double_xp = false;
const stringTable = require('string-table');
const stringTableTest = require('easy-table');
const sanitize = require('sanitize-filename');

exports.InitLevels = function(instigator, clbk, clbk_arg) {
	Init(instigator, clbk);
}

exports.TXP = function() {
	return TableExp();
}

exports.TrackEXP = function(instigator, clbk, clbk_arg) {
	Init(instigator, clbk, clbk_arg);
}

exports.LB = function() {
	return Leaderboard();
}

exports.LBT = function() {
	return LeaderboardTest();
}

var instigator_username = "";
var instigator_id = 0;

function Init(instigator, clbk, clbk_arg) {
	instigator_username = instigator.username;
	instigator_id = instigator.id;

	if (instigator.bot) {
		return;
	}

	UserExists();

	if (clbk == "GiveEXP") {
		GiveEXP(clbk_arg);
	}

	if (clbk == "RemoveEXP") {
	}
}

function UserExists() {
	if (!fs.exists(dataPath + instigator_id + ".data")) {
		CreateUser();
		return;
	}
}

function GetUserDataString() {
	var file = fs.read(dataPath + instigator_id + ".data");
	return file;
}

function GetUserData() {
	var str = GetUserDataString();
	var jsonify = JSON.parse(str);

	return jsonify;
}

function Save(obj) {
	var pretty = JSON.stringify(obj, null, 2); // spacing level = 2
	fs.write(dataPath + instigator_id + ".data", pretty);
}

function CreateUser() {
	var string = "{\"username\":\"" + instigator_username + "\",\"experience\":0,\"infamy\":0,\"nb_characters_posted\":0,\"nb_posts\":0,\"exp_given\":0,\"challenge_post_1\":false,\"challenge_post_2\":false,\"challenge_post_3\":false,\"challenge_post_4\":false,\"challenge_xp_1\":false,\"challenge_xp_2\":false,\"challenge_xp_3\":false,\"challenge_xp_4\":false,\"challenge_talker_1\":false,\"challenge_talker_2\":false,\"challenge_talker_3\":false,\"challenge_talker_4\":false,\"challenge_charity_1\":false,\"challenge_charity_2\":false,\"challenge_charity_3\":false,\"challenge_charity_4\":false,\"challenge_infamy_1\":false,\"challenge_infamy_2\":false,\"challenge_infamy_3\":false,\"challenge_infamy_4\":false,\"challenge_infamy_5\":false}";
	var obj = JSON.parse(string);
	var pretty = JSON.stringify(obj, null, 2); // spacing level = 2
	fs.write(dataPath + instigator_id + ".data", pretty);
}

function GiveEXP(message_data) {
	var exp = 100;
	var bonus_xp_length = 10;
	var UserData = GetUserData();
	var secure_content = message_data.content.replace(/[\u{0080}-\u{FFFF}]/gu, "");
	var msg_length = secure_content.length;

	bonus_xp_length *= msg_length;

	if (double_xp) {
		exp *= 2;
		bonus_xp_length *= 2;
	}

	exp += bonus_xp_length;

	UserData.experience += exp;
	UserData.nb_posts += 1;
	UserData.nb_characters_posted += msg_length;

	Save(UserData);
}

function NumeralSort(a, b) {
	var n = a.infamy - b.infamy;
    if (n !== 0) {
        return n;
    }

	return a.xp - b.xp;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function ReturnLevel(xp) {
	var return_level = 0;
	var level_found = false;
	var total = 0; 
	var level;

	var tnl = 500;
	var factor = 0.65;
	var levels = 100;

	var xp_data = []

	for (level = 1; level <= levels; level++)
	{
		xp_data.push({ level_nb: level, level_xp: total, level_next: tnl })
		total += tnl;
		tnl = tnl * (1 + Math.pow(factor, level));
	}

	xp_data.forEach(function(level) {
		if (level.level_xp >= xp) {
			if(!level_found) {
				return_level = level.level_nb - 1;
				level_found = true;
			}
		}
	});

	return return_level;
}

function Leaderboard() {
	var members_folder = fs.list(dataPath);
	var members_data = [];

	members_folder.forEach(function(file) {
		var str = fs.read(dataPath + file);
		var UserData = JSON.parse(str);
		members_data.push( {name: sanitize(UserData.username), xp: UserData.experience, infamy: UserData.infamy } );
	});

	members_data.sort(NumeralSort);
	members_data.reverse();

	var lb = [];
	var lb_string = "```";

	for (i = 0; i < 10; i++) {
		var position = i + 1;
		var level_data = ReturnLevel(members_data[i].xp);
		lb.push({ Pos: position, Name: sanitize(members_data[i].name), Level: level_data, EXP: numberWithCommas(members_data[i].xp), Infamy: members_data[i].infamy });
	}

	lb_string += stringTable.create(lb);

	lb_string += "```"

	return lb_string;
}

function LeaderboardTest() {
	var members_folder = fs.list(dataPath);
	var members_data = [];

	members_folder.forEach(function(file) {
		var str = fs.read(dataPath + file);
		var UserData = JSON.parse(str);
		members_data.push( {name: sanitize(UserData.username), nb_posts: UserData.nb_posts, xp: UserData.experience, infamy: UserData.infamy } );
	});

	members_data.sort(NumeralSort);
	members_data.reverse();

	var lb = [];
	var lb_string = "```";

	for (i = 0; i < 20; i++) {
		var position = i + 1;
		var level_data = ReturnLevel(members_data[i].xp);
		lb.push({ Pos: position, Name: sanitize(members_data[i].name), NbPosts: members_data[i].nb_posts, Level: level_data, EXP: numberWithCommas(members_data[i].xp), Infamy: members_data[i].infamy });
	}

	lb_string += stringTableTest.print(lb);

	lb_string += "```"

	return lb_string;
}

function TableExp() {
	var total = 0;
	var level;

	var tnl = 500;
	var factor = 0.65;
	var levels = 100;

	var xp_data = []

	for (level = 1; level <= levels; level++)
	{
		xp_data.push({ LVL: level, EXP: numberWithCommas(parseInt(total)) })
		total += tnl;
		tnl = tnl * (1 + Math.pow(factor, level));
	}

	return stringTable.create(xp_data);
}