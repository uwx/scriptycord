# scriptycord
a simple discord injector. short, sweet and customizable.

## OS support
currently windows only, sorry

## plugins
BetterDiscord plugins can be placed in `%APPDATA%\plugins` or `%LOCALAPPDATA%\Discord\injectedPlugins`

there is a custom plugin API but it's not documented yet - look in the existing plugins for reference.
scriptycord comes with the plugins i made for myself, under the same license as the rest of the project.

## custom protocol
Local files can be placed in `%LOCALAPPDATA%\Discord\injectedProtocol` and accessed in javascript
(through XMLHttpRequest) or CSS (through plain urls) through the `hansen://` protocol

## css
place CSS or LESS (to be automatically compiled) in `%LOCALAPPDATA%\Discord\css` and they will be injected
in alphabetical order. the files will automatically be reloaded on changes. scriptycord comes with the CSS
i made for myself, under the same license as the rest of the project.

## node modules
you can install modules using `yarn` in `%LOCALAPPDATA%\Discord\injectedNodeModules`, then access them with
`Hansen.require` in plugins or the chrome dev tools.

## extra goods
* css backdrop filter enabled in chrome experimental options
* token is exposed to `window.hansenToken` (use `window.addTokenReadyCallback` to listen for when the token
  is available, and it will be passed to the function)
* websockets are exposed to `window.__sockets`
* keydown and keypress listeners will look for functions in `window.__key_down_hooks` and
  `window.__key_press_hooks` 
  
## disclaimer
your token is stored in plain text and visible to page and plugin javascript. i am not responsible for bad
things that happen because of this.
