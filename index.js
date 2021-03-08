const axios = require('axios').default;
const brain = require('brain.js');
const { Client } = require('discord.js');
const fs = require('fs');
const auth = require('./config.json');

const bot = new Client();
const prefix = auth.prefix;
let block = false;
let delay = 0;
let res = [];
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

bot.on('voiceStateUpdate', async (oldState, newState) => {
    if (!block) {
        if (
            newState.channel &&
            (newState.channel.id == '797048356953260087' ||
                newState.channel.id == '766644399253225479' ||
                newState.channel.id == '807909087249170462') &&
            // newState.channel.id == 'xxxx' &&
            newState.channelID !== null &&
            oldState.channelID != newState.channelID
        ) {
            console.log();
            block = true;
            const connection = await newState.channel.join();
            let rand = randomInteger(0, res.length);

            const dispatcher = connection.play(`./playlist/${res[rand]}`, {
                volume: 0.4,
            });
            dispatcher.on('start', () => {
                console.log(res[rand] + ' is now playing!');
                delay = setTimeout(() => {
                    try {
                        console.log(res[rand] + ' has force finished playing!');
                        block = false;
                        connection.disconnect();
                    } catch (error) {
                        console.log(error);
                    }
                }, 30000);
            });

            dispatcher.on('finish', () => {
                clearTimeout(delay);
                console.log(res[rand] + ' has finished playing!');
                block = false;
                connection.disconnect();
            });
            // Always remember to handle errors appropriately!
            dispatcher.on('error', console.error);
        }
    }
});
bot.on('message', (message) => {
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

bot.login(auth.token);
