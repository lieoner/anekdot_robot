const axios = require('axios').default;
const brain = require('brain.js');
const fs = require('fs');

var anekData = require('./baza_anekdotov.json');

var net = new brain.recurrent.GRU({
    activation: 'sigmoid',
    outputSize: 10,
});
net.maxPredictionLength = 9;

var filename = './json_network1k.json';

const normalizeData = (anekData) => {
    anekData = anekData.map((i) => {
        i.input = i.input.replace(/,|\.|-|:|\?|\!|\"/g, '');

        return i;
    });
    return anekData;
};
loadNetFromFile = () => {
    jsonNetwork = JSON.parse(fs.readFileSync(filename));
    if (jsonNetwork.type) {
        net.fromJSON(jsonNetwork);
    }
};
const trainNet = (net, anekData) => {
    console.log('начало урока');
    maxIts = 1000;
    net.train(anekData, {
        iterations: maxIts,
        logPeriod: maxIts / 10,
        layers: [10],
        log: true,
    });

    var jsonNetwork = net.toJSON();
    fs.writeFileSync(filename, JSON.stringify(jsonNetwork));
    console.log('урок окончен');
};

fs.writeFileSync(filename, '{}');
anekData = normalizeData(anekData);
loadNetFromFile();
trainNet(net, anekData);

let anekdot = '';
axios.get('https://www.anekdot.ru/rss/randomu.html').then(function (response) {
    // handle success
    anekdot = response.data
        .split(`\\\",`)[1]
        .split('<br>')
        .join('')
        .split('"')
        .join('')
        .split('\\')
        .join('');
    console.log(anekdot);
    console.log(net.run(anekdot));
});
// console.log('слил базу на двач');
