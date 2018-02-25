'use strict';

const blobEmoji = JSON.parse(fs.readFileSync(rootPath + 'injectedUserData\\emotes.json'));

function avatar(oldElement) {
  var newElement = document.createElement('div');
  newElement.className = 'avatar-large';
  newElement.setAttribute('style', oldElement.getAttribute('style').replace('.gif', '.webp'));
  oldElement.parentNode.replaceChild(newElement, oldElement);
}

scope.exports = {
  name: 'Deanimator',

  description: 'Replaces animated emoji with static emoji',

  version: '1.0.0',

  author: 'hansen',

  init() {
  },
  
  hooks: [
    ['.avatar-large.animate', avatar],
    ['.avatar-large.stop-animation', avatar],
    ['.emoji', oldElement => {
      const s = oldElement.src;
      if (s.endsWith('.gif')) {
        const newElement = document.createElement('img');
        newElement.className = oldElement.className;
        newElement.src = s.slice(0, s.lastIndexOf('.')) + '.png';
        newElement.alt = oldElement.alt;
        oldElement.parentNode.replaceChild(newElement, oldElement);
      }
    }],
  ],
};