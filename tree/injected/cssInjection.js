window.hansenExecute(async function cssInjection() {
  const fs = Hansen.mzfs;
  const path = require('path');
  
  // okay, so don't think i need to worry about less doing weird stuff when i require it through nodejs even though it's electron, see https://github.com/less/less.js/tree/3.x/lib/less-browser
  const less = Hansen.require('less');

  less.logger.addListener({
    debug: msg => console.debug('[cssInjection][less][debug]', msg),
    info: msg => console.info('[cssInjection][less][info]', msg),
    warn: msg => console.warn('[cssInjection][less][warn]', msg),
    error: msg => console.error('[cssInjection][less][error]', msg),
  });

  async function render(css, name) {
    try {
      const startTime = new Date().getTime();
      const result = (await less.render(css)).css;
      const endTime = new Date().getTime();
      console.info('[cssInjection][render] rendered', name, 'in', endTime - startTime, 'ms');
      return result;
    } catch (e) {
      console.error('[cssInjection] failed with', e);
      return '';
    }
  }
  async function applyAndWatchCSS(cssPath, name, ext, useLess = false) {
    let cssText = await fs.readFile(cssPath, 'utf-8');
    if (useLess) cssText = await render(cssText, name);
    
    const styleTag = document.createElement('style');
    styleTag.id = 'hansen-css-' + name + '-' + ext;
    const cssNode = document.createTextNode(cssText);
    styleTag.appendChild(cssNode);
    
    document.head.appendChild(styleTag);
    
    console.info('[cssInjection] loaded', name, '(' + ext + ')')
    
    fs.watch(cssPath, { encoding: 'utf-8' }, async eventType => {
      if (eventType != "change") return;
      
      const changed = await fs.readFile(cssPath, 'utf-8'); // should this be sync?
      if (useLess) cssNode.nodeValue = await render(changed, name);
      else cssNode.nodeValue = changed;
      
      console.info('[cssInjection] refreshed', name, '(' + ext + ')')
    });
  };
  
  for (let file of await fs.readdir(window.hansenRoot + '\\css')) {
    const cssPath = window.hansenRoot + '\\css\\' + file;
    const parsed = path.parse(cssPath);
    if (parsed.ext != '.css' && parsed.ext != '.less') continue;
    await applyAndWatchCSS(cssPath, parsed.name, parsed.ext.slice(1), parsed.ext == '.less');
  }
});