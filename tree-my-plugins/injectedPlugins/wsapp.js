'use strict';

var path = require('path');
var electron = require('electron');
var fs = Hansen.mzfs;

function fileUrl(str) {
  if (typeof str !== 'string') {
    throw new Error('Expected a string');
  }

  var pathName = path.resolve(str).replace(/\\/g, '/');

  // Windows drive letter must be prefixed with a slash
  if (pathName[0] !== '/') {
    pathName = '/' + pathName;
  }

  return encodeURI('file://' + pathName);
}

scope.exports = {
  name: 'wsapp',

  description: 'embedded whatsapp/telegram client!',

  version: '1.0.0',

  author: 'hansen',
  
  hooks: [
    ['.guilds', guilds => { // not init! hook every time guilds is reloaded
      console.log('[wsapp] guilds reloaded');
      //<div class="guild">
      //<div class="guild-inner" draggable="false" style="border-radius: 25px;">
      //<a draggable="false" class="avatar-small" href="javascript:void(0)" style="background-image: url('https://cdn.discordapp.com/icons/326099786413506563/07190f4eda9d1f8e0bab712a5a07b98a.webp');"></a>
      //</div>
      //</div>
      //
      //<div class="tooltips"></div>
      //
      //<div class="tooltip tooltip-right tooltip-black" style="left: 70px;top: 200.4901px;">WhatsApp</div>

      var tooltips = document.getElementsByClassName('tooltips')[0];
      
      var oldTooltips = document.getElementsByClassName('hansen-tooltip');
      for (let i = 0; i < oldTooltips.length; i++) {
        tooltips.removeChild(oldTooltips[i]);
      }

      var prevGuild = null;

      var STATE_NONE = -1;

      var lastState = 0;
      var state = STATE_NONE;

      function tidy() { // this function will be called when bubbling is not possible
        //console.log('na',previouslySelectedGuild, guildHolder, isWhatsappShowing);
        
        if (state != STATE_NONE) {
          clients[state].view.className = 'hansen-frame hansen-hide';
          clients[state].guildHolder.className = 'guild';

          if (prevGuild) {
            if (!document.querySelector('.guild.selected')) { // if hasn't selected another guild
              prevGuild.className = 'guild selected';
            }
            prevGuild = null;
          }
        }
        
        state = STATE_NONE;
      }

      function makeButton(tooltipText, imageUrl, viewUrl) {
        const id = tooltipText.toLowerCase();
        const OUR_STATE = lastState++;
        
        //cleanup
        const existing = document.getElementById('hansen-button-' + id);
        if (existing) {
          existing.parentElement.removeChild(existing);
        }
        const existing2 = document.getElementById('hansen-' + id + '-view');
        if (existing2) {
          existing2.parentElement.removeChild(existing2);
        }
        
        const guildHolder = document.createElement('div'); // <div class="guild" id="...">
        guildHolder.className = 'guild';
        guildHolder.id = 'hansen-button-' + id;

        const guildInner = document.createElement('div'); // <div class="guild-inner" draggable="false" style="border-radius: 25px;">
        guildInner.className = 'guild-inner';
        guildInner.setAttribute('draggable', 'false');
        guildInner.style.borderRadius = '25px';

        const link = document.createElement('a'); // <a draggable="false" class="avatar-small" href="javascript:void(0)" style="background-image: url('...');"></a>
        link.setAttribute('draggable', 'false');
        link.className = 'avatar-small';
        link.href = 'javascript:void(0)';
        link.style.backgroundImage = "url('" + imageUrl + "')";

        guildInner.appendChild(link); // put a inside div
        guildHolder.appendChild(guildInner); // put div inside div
        guilds.insertBefore(guildHolder, document.getElementsByClassName('guild-separator')[0]); // put div in guilds before 1st separator

        // initialize tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip tooltip-right tooltip-black hansen-tooltip hansen-' + id + '-tooltip';
        tooltip.appendChild(document.createTextNode(tooltipText));
        // tooltip handler code
        guildHolder.addEventListener('mouseenter', () => {
          tooltips.appendChild(tooltip);
        });
        guildHolder.addEventListener('mouseleave', () => {
          tooltips.removeChild(tooltip);
        });

        // initialize iframe
        const view = document.createElement('webview'); // <webview src="https://web.whatsapp.com/" class="hansen-frame hansen-hide" id="hansen-whatsapp-view"></webview>
        view.src = viewUrl;
        view.className = 'hansen-frame hansen-hide';
        view.id = 'hansen-' + id + '-view';
        // prevent discord from capturing events
        view.addEventListener('keydown', event => event.stopPropagation());
        view.addEventListener('keypress', event => event.stopPropagation());
        view.addEventListener('keyup', event => event.stopPropagation());
        view.setAttribute('preload', fileUrl(window.hansenRoot + '/injected/plugin-data/' + id + 'PreloadScript.js'));
        view.addEventListener('dom-ready', async () => {
          console.log('Injecting css for ' + id);
          const cssPath = window.hansenRoot + '/injected/plugin-data/' + id + '.css';
          view.executeJavaScript(`
            (() => {
              const styleTag = document.createElement('style');
              styleTag.id = 'hansen-css-${id}';
              const cssNode = document.createTextNode(${JSON.stringify(await fs.readFile(cssPath, 'utf-8'))});
              styleTag.appendChild(cssNode);
              
              document.head.appendChild(styleTag);

              window.__hansen_Style = cssNode;
            })();
          `, false, () => {
            console.log('CSS injected for ' + id);
            fs.watch(cssPath, { encoding: 'utf-8' }, async eventType => {
              if (eventType != 'change') return;
              
              const changed = await fs.readFile(cssPath, 'utf-8'); // should this be sync?

              view.executeJavaScript(`window.__hansen_Style.nodeValue = ${JSON.stringify(changed)}`);

              console.info('[wsapp-cssInjection] refreshed', id);
            });
          });

        });

        document.body.appendChild(view);

        const badge = document.createElement('div');
        badge.className = 'badge';
        const badgeText = document.createTextNode('bap');
        badge.appendChild(badgeText);

        let isBadgeShowing = false;
        view.addEventListener('ipc-message', ({channel, args}) => {
          if (channel == 'hansen_got_notification') {
            const count = +args[0];
            if (count > 0) {
              if (!isBadgeShowing) {
                isBadgeShowing = true;
                guildHolder.appendChild(badge);
              }
              badgeText.nodeValue = count;
            } else {
              if (isBadgeShowing) {
                isBadgeShowing = false;
                guildHolder.removeChild(badge);
              }
            }
          }
        });

        guildHolder.addEventListener('click', event => {
          //console.log('ya',prevGuild, guildHolder, isWhatsappShowing);
          event.stopPropagation();
          if (state != OUR_STATE) {
            if (state != STATE_NONE) tidy(); // tidy up since it won't bubble if it's not none
            
            view.className = 'hansen-frame';
            
            if (state == STATE_NONE) {
              prevGuild = document.querySelector('.guild.selected');
              if (prevGuild) {
                prevGuild.className = 'guild';
              }
            }
            
            // AFTER we find the previously selected guild
            guildHolder.className = 'guild selected';
            state = OUR_STATE;
          }
        });

        return { guildHolder, view };
      }

      if (typeof tidy != 'undefined') {
        guilds.removeEventListener('click', tidy);
      }

      // initialize buttons
      const clients = [
        makeButton('WhatsApp', 'https://i.imgur.com/UVxufZv.jpg', 'https://web.whatsapp.com/'),
        makeButton('Telegram', 'https://i.imgur.com/oQP8MPC.png', 'https://web.telegram.org/#/im'),
        makeButton('Skype', 'https://i.imgur.com/wsp4l7z.jpg', 'https://web.skype.com'),
        makeButton('Steam', 'https://i.imgur.com/xxLe5bN.png', 'https://steamcommunity.com/chat'),
      ];

      electron.ipcRenderer.on('NOTIFICATION_CLICK', tidy); // discord message notification click, return to the server it's from

      // TODO:
      //webview.addEventListener('dom-ready', function () {
      //  webview.insertCSS('html,body{ background-color: #FF0000 !important;}')
      //});
      // https://userstyles.org/styles/142096/dark-whatsapp-theme-by-mew
      // https://userstyles.org/styles/137361/dark-transparent-whatsapp-10-fonts
      // https://userstyles.org/styles/132781/web-telegram-dark
      
      // abuse bubbling!
      guilds.addEventListener('click', tidy);
    }]
  ]
};