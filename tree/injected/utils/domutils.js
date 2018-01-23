function addHook(selector, id, callback) {
  addStyle(`
  @keyframes ${id} {  
    from {  
      outline-color: #fff; 
    }
    to {  
      outline-color: #000;
    }  
  }
  ${selector} {
    animation-duration: 0.01s;
    animation-name: ${id};
  }
  `);
  
  document.addEventListener('animationstart', function(event) {
    if (event.animationName == id) {
      callback(event.target);
    }
  }, true);
}

function addStyle(css) {
  const style = document.createElement('style');

  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));

  document.head.appendChild(style);
}

function addScript(code) {
  try {
    var h = document.createElement('script');
    h.appendChild(document.createTextNode(code));
    document.head.appendChild(h);
    return false;
  } catch (e) {
    return e;
  }
}

function isLightTheme() {
  return document.getElementsByClassName('theme-light').length > document.getElementsByClassName('theme-dark').length;
}

module.exports = { addHook, addStyle, addScript, isLightTheme };