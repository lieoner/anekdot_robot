const fs = require('fs');
const brain = require('brain.js');

var jsonNetwork = JSON.parse(fs.readFileSync('./json_network.json'));
var net = new brain.recurrent.GRU();
var anekdot = `Заходит мужик в магазин обуви 
Его спрашивают размер 
Он говорит 41 45 
Та повторяет не расслышала 
И он 
МОЖЕМ ПОВТОРИТЬ `;
net.fromJSON(jsonNetwork);
const output = net.run(anekdot);
console.log(output);
