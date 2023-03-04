const readline = require('readline');
const player = require('play-sound')();
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const soundDir = '/Users/macbook/Desktop/random_sound_gen/sonidos_programa/SPEEDY GONZ/01 Inicio';
const sounds = fs.readdirSync(soundDir)
  .filter(file => path.extname(file) === '.wav')
  .map(file => path.join(soundDir, file));

rl.question('What is your name? ', (name) => {
  console.log(`Hello ${name}!`);

  const soundIndex = Math.floor(Math.random() * sounds.length);
  const soundFile = sounds[soundIndex];

  player.play(soundFile, function (err) {
    if (err) throw err;
    console.log(`Playing ${soundFile}`);
    rl.close();
  });
});
