const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function escapeHtml(str) {
  return str.replace(/[&<>"'`=\/]/g, s => entityMap[s]);
}

function firstLine(str) {
  let f = str.indexOf('\r\n');
  let s;
  if (f != -1) {
    s = str.substring(0, f);
    f = s.indexOf('\n'); // check no newlines in first line (bad newline encoding)
    if (f == -1) return s; // return \r\n newline (other index will be -1)
    // else
    return str.substring(0, f); // return real first line (\n not \r\n)
  }
  
  f = str.indexOf('\n');
  if (f != -1) return str.substring(0, f);
  
  return f;
}

module.exports = { escapeHtml, firstLine };