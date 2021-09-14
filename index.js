const axios = require('axios').default;
const ytToken = require('./token.json').ytToken;
const searchYoutube = require('youtube-api-v3-search');
const ytdl = require('ytdl-core');
const brain = require('brain.js');
const { Client, MessageEmbed } = require('discord.js');
const fs = require('fs');
const auth = require('./config.json');
const token = require('./token.json').token;

const bot = new Client();
const prefix = auth.prefix;

let connection = null;

var emojis = auth.emojis;

var anekData = require('./baza_anekdotov.json');
var curAnekdot = '';

function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}

bot.once('ready', async () => {
    res = await fs.promises.readdir('./playlist');
    console.log('Ready!');
});

bot.on('message', async (message) => {
    if (message.content.startsWith(`${prefix}п`)) {
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('Ты в войс зайди бля');
        }
        connection = await voiceChannel.join();

        const args = message.content.slice(3).trim();
        if (args.length) {
            let url = args;
            try {
                if (!args.startsWith('https://')) {
                    let { videoID } = await searchYouTubeVideoID(args);
                    url = `https://www.youtube.com/watch?v=${videoID}`;
                }

                let info = await ytdl.getInfo(url);
                console.log(info.videoDetails.title);
                connection.play(
                    await ytdl(args, {
                        volume: 0.4,
                        filter: 'audioonly',
                    })
                );
                const botResponse = new MessageEmbed().setDescription(
                    `Играет вот это: [${info.videoDetails.title}](${url})`
                );
                return message.channel.send(botResponse);
            } catch (error) {
                return message.reply('Я уебался блять!');
            }
        } else {
            return message.reply('А чо играть?');
        }
    }

    if (message.content == `${prefix}смешно`) {
        if (curAnekdot.length) {
            var ocenka = { input: curAnekdot, output: 'смешно' };
            console.log(ocenka);
            anekData.push(ocenka);
            curAnekdot = '';
            fs.writeFileSync('./baza_anekdotov.json', JSON.stringify(anekData, null, 2));
        }
    }
    if (message.content == `${prefix}несмешно`) {
        if (curAnekdot.length) {
            var ocenka = { input: curAnekdot, output: 'не смешно' };
            console.log(ocenka);
            anekData.push(ocenka);
            curAnekdot = '';
            fs.writeFileSync('./baza_anekdotov.json', JSON.stringify(anekData, null, 2));
        }
    }
    if (message.content == `${prefix}оценка`) {
        if (curAnekdot.length) {
            var jsonNetwork = JSON.parse(fs.readFileSync('./json_network1k.json'));
            var net = new brain.recurrent.GRU();

            net.fromJSON(jsonNetwork);
            const output = net.run(curAnekdot);
            console.log(output.trim().length ? output : 'не получилось');
            message.reply(output.trim().length ? output : 'хз я еще тупой для такого');
        }
    }

    if (message.content == `${prefix}съеби`) {
        if (randomInteger(1, 7) == 5) {
            message.reply('а может ты?');
        } else {
            console.log('я ушел');
            message.member.voice.channel.leave();
            message.reply('ладно(');
            block = false;
        }
    }
    if (message.content == `${prefix}анекдот`) {
        // message.reply('ладно(');
        if (randomInteger(1, 10) == 5) {
            let answer = '';
            switch (randomInteger(1, 4)) {
                case 1:
                    answer = 'Нет настроения';
                    break;
                case 2:
                    answer = `:peach: :sweat_drops: ${
                        randomInteger(1, 2) == 1 ? ':smirk:' : ':zany_face:'
                    } :call_me:`;
                    break;
                case 3:
                    answer = 'Я что клоун?';
                    break;
                case 4:
                    answer = 'Может лучше ты пошути?';
                    break;
            }
            message.reply(answer);
        } else {
            axios.get('https://www.anekdot.ru/rss/randomu.html').then(function (response) {
                // handle success
                let anekdot = response.data.split(`\\\",`)[1];
                message.reply(
                    anekdot.split('<br>').join('').split('"').join('').split('\\').join('') +
                        ' ' +
                        emojis[randomInteger(0, emojis.length)]
                );
                curAnekdot = anekdot
                    .split('<br>')
                    .join('')
                    .split('"')
                    .join('')
                    .split('\\')
                    .join('');
            });
        }
    }
});

bot.login(token);

async function searchYouTubeVideoID(args) {
    let res = await searchYoutube(ytToken, {
        q: args,
        type: 'video',
    });
    return { videoID: res.items[0].id.videoId, videoName: res.items[0].snippet.title };
}

// bot.on('voiceStateUpdate', async (oldState, newState) => {
//     if (!block) {
//         if (
//             // newState.channel &&
//             // (newState.channel.id == '797048356953260087' ||
//             //     newState.channel.id == '797048356953260086' ||
//             //     newState.channel.id == '766644399253225479' ||
//             //     newState.channel.id == '807909087249170462')
//             // newState.channel.id == 'xxxx' &&
//             // newState.channelID !== null &&
//             // oldState.channelID != newState.channelID
//         ) {
//             console.log(newState.channel);
//             block = true;
//             const connection = await newState.channel.join();
//             let rand = randomInteger(0, res.length);

//             const dispatcher = connection.play(`./playlist/${res[rand]}`, {
//                 volume: 0.4,
//             });
//             dispatcher.on('start', () => {
//                 console.log(res[rand] + ' is now playing!');
//                 delay = setTimeout(() => {
//                     try {
//                         console.log(res[rand] + ' has force finished playing!');
//                         block = false;
//                         connection.disconnect();
//                     } catch (error) {
//                         console.log(error);
//                     }
//                 }, 30000);
//             });

//             dispatcher.on('finish', () => {
//                 clearTimeout(delay);
//                 console.log(res[rand] + ' has finished playing!');
//                 block = false;
//                 connection.disconnect();
//             });
//             // Always remember to handle errors appropriately!
//             dispatcher.on('error', console.error);
//         }
//     }
// });
