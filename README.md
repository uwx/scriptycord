# scriptycord
a simple discord injector. short, sweet and customizable.

## version support
***scriptycord does not work on Stable as of March 11 2018.*** supporting both stable and canary is
too much work, you should just use canary instead. PTB support is untested.

## installing
clone the repo, and open a command window in the folder, then type `npm install && node scriptycord.js`,
and follow the graphical install process.
nodejs 8 or above is required.

## OS support
currently windows only, sorry. a significant portion of the code relies on the presence of AppData and
AppData/Local folders, and this would require a lot of changes to work on Linux. i don't have a linux
machine to test on, but anyone willing to port would be absolutely welcome!

## plugins
BetterDiscord plugins can be placed in `%APPDATA%\BetterDiscord\plugins` or `%LOCALAPPDATA%\DiscordCanary\injectedPlugins`

scriptycord comes with the plugins i made for myself, under the same license as the rest of the project.

### API
plugins are evaled with the following global variables:
* `scope`: like `module` but for plugins.
  * `exports`: add your plugin definitions here! they can contain any of the following:
    * `init => ()`: executed instantly after script eval. no longer necessary since scripts no longer run
      on the top level scope, but you can still use it.
    * `start => ()`: called once either `#friends` or `.chat` elements are loaded. use this to run code that
      relies on the DOM being loaded
    * `hooks[selector, callback(element)]`: an array that should contain arrays inside it, to add CSS
    	hooks for element listeners:
    	* `selector`: string selector for the element
      * `callback(element)`: callback that takes the element as the only parameter
    * `onMessageTextLoaded => (element)`: callback for when `.message-text` is loaded
    * `onMessageGroupLoaded => (element)`: callback for when `.message-group` is loaded
    * `css`: CSS string to inject in the webpage
  * `addHook(selector, id, callback[, prettyCallbackName])`: register a CSS hook for an element listener.
    * `selector`: string selector for the element
    * `id`: unique ID for the hook
    * `callback(element)`: callback that takes the element as the only parameter
    * `prettyCallbackName`: since v23, the callback's function will be renamed to this. defaults to
      `scriptycord hook: {id}`, which should suffice for most cases. (hooks done using the array method
      will have a personalized name reflecting the plugin they're from.)
  * `addStyle(css)`: injects a CSS string in the webpage
  * `addScript(code)`: injects a code block in a new script element in the webpage
  * `isLightTheme()`: returns `true` if light theme is enabled, `false` otherwise
  * ~~`getFile`~~: get a text file from the hansen protocol. not recommended due to synchronicity, use fs
    instead
* `fs`: `fsxt` module (originally `mz/fs`)
* `require(path)`: same as electron's regular require. does nothing. maintained for fear of problems.
* `rootPath`: alias for `Hansen.rootPath`
* `log(...anything)`: function to log pretty messages to console, like console.log, but shows what plugin
  it's from.
* `error(...anything)`: function to log pretty errors to console, like console.error, but shows what plugin
  it's from.

### APIs exposed to `window`
(DiscordCanary is provided as an example here, but you can replace it with whatever client version you're
using. Note that the case pattern is important - in %APPDATA% it's lowercase, in %LOCALAPPDATA% it's PascalCase.)
* `window.hansenRoot`: `%LOCALAPPDATA%\DiscordCanary`
* `window.hansenAppRoot`: `%LOCALAPPDATA%\DiscordCanary\app-0.0.YYY`
* `window.hansenLocalStorageRoot`: `%APPDATA%\discordcanary\Local Storage`
* `window.protocolRoot`: `hansen://` protocol root (`%LOCALAPPDATA%\DiscordCanary\injectedProtocol`)
* `window.userDataRoot`: `%LOCALAPPDATA%\DiscordCanary\injectedUserData`
* `window.betterDiscordRoot`: `%APPDATA%\BetterDiscord` (root folder for BetterDiscord data)
* `window.betterDiscordPluginsRoot`: `%APPDATA%\BetterDiscord\plugins` (BD plugins folder)
* `window.Hansen`: 
  * `require(path)`: requires a module relative to `injectedNodeModules\node_modules`
    * Also exposed to ~~`global.__require`~~ for legacy reasons
  * `rlocal(path)`: requires a file relative to `DiscordCanary\injected`
  * `path`: node.js `path` module
  * `mzfs`: `fsxt` module (originally `mz/fs`)
  * `rootPath`: `window.hansenRoot` with a trailing backslash
* `window.hansenExecute(func)`: Executes a function, synchronously or async, and provides a better log to console
  if execution succeeds or fails.
  * function is called with two arguments, aliased to `Hansen.require` and `Hansen.rlocal`.
* `window.BdApi`: polyfill for BetterDiscord API
* `window.bdPluginStorage`: polyfill for BetterDiscord API

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
  
## disclaimer / achtung / waarschuwing / attention / advertencia / atenção / предупреждение / avvertimento
your token is stored in plain text and visible to page and plugin javascript. i am not responsible for bad
things that happen because of this.

modifying your client may be against discord's terms of service: [1](https://www.reddit.com/r/discordapp/comments/82tk0u/staff_resolve_vague_position_on_betterdiscord/dvcv43l/) [2](https://www.reddit.com/r/discordapp/comments/6erhdj/so_discord_doesnt_allow_betterdiscord_to_be_used/dicjjos/)
