'use strict';

const servers = [
  '356823991215980544', // gaminglegends
  '379630501708693504', // WLA
  '214249708711837696', // mums house
  '290843998296342529', // WLA again
  '357827314555420675',
  '383670643905921026',
  '286893856572702721',
  '373335566273609728',
  '359050572432932864',
  '228838562500575233',
  '351064956478685184',
  '359480347421048832',
  '366219406776336385',
  '381817124307337222',
  '320896491596283906',
  '231597242388185088',
];

scope.exports = {
  name: 'AntiPing',

  description: 'Blacklist pings!',

  version: '1.0.0',

  author: 'hansen',

  init() {
    var libraryScript = null;
    if (typeof BDfunctionsDevilBro !== 'object' || BDfunctionsDevilBro.isLibraryOutdated()) {
      if (typeof BDfunctionsDevilBro === 'object')
        BDfunctionsDevilBro = '';
      libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]');
      if (libraryScript) libraryScript.remove();
      libraryScript = document.createElement('script');
      libraryScript.setAttribute('type', 'text/javascript');
      libraryScript.setAttribute('src', 'https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js');
      document.head.appendChild(libraryScript);
    }
  },

  hooks: [
    ['.guild > .badge', e => {
      console.log('[antiping] caught notif ' + e);
      if (servers.length) {
        let href = e.parentElement.firstChild.firstChild.firstChild.getAttribute('href');
        href = href.substring('/channels/'.length, href.lastIndexOf('/'));

        const outserver = servers.find(sv => href == sv);

        if (outserver) {
          BDfunctionsDevilBro.clearReadNotifications([outserver], () => {
            console.log('[antiping] cleared for', outserver);
          });
          console.log('[antiping] clearing for', outserver);
        }
      }
    }],
  ],
};