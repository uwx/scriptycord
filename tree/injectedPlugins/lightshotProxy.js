/*var http = require('http'),
    httpProxy = require('http-proxy');

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
var server = http.createServer(function(req, res) {
  console.log(req.url);
  console.log(res.url);
  
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  proxy.web(req, res, { target: req.url });
});

proxy.on('error', function(e) {
  console.error(e);
});

console.log("listening on port 5050")
server.listen(5050);*/
'use strict';

scope.exports = {
  name: 'lightshotProxy',

  description: 'Proxy for lightshot => imgur',

  version: '1.0.0',

  author: 'hansen',
  
  init() {
    try {
      proxy.onError(function(ctx, err) {
        console.error('proxy error:', err);
      });

      proxy.onRequest(function(ctx, callback) {
        console.log(ctx.clientToProxyRequest.body);
        console.log(ctx.clientToProxyRequest.headers.host + ctx.clientToProxyRequest.url);
        //if (ctx.clientToProxyRequest.headers.host == 'www.google.com'
        //  && ctx.clientToProxyRequest.url.indexOf('/search') == 0) {
        //  ctx.use(Proxy.gunzip);
        //
        //  ctx.onResponseData(function(ctx, chunk, callback) {
        //    chunk = new Buffer(chunk.toString().replace(/<h3.*?<\/h3>/g, '<h3>Pwned!</h3>'));
        //    return callback(null, chunk);
        //  });
        //}
        
        var chunks = [];
        ctx.onResponseData(function(ctx, chunk, callback) {
          chunks.push(chunk);
          return callback(null, null); // don't write chunks to client response
        });
        
        ctx.onResponseEnd(function(ctx, callback) {
          var body = Buffer.concat(chunks);
          var str = body.toString();
          
          var match = str.match(/<url>(.*?)<\/url>/);
          //var match = '<url>http://i.prntscr.com/b601ce8911e34ddabcd40c6d37361750.png</url>'.match(/<url>(.*?)<\/url>/);
          if (match&&match[1]) {
            request.post(
              'https://api.imgur.com/3/image.json', {
                formData: { image: match[1] }, 
                headers: {
                  'Authorization': 'Client-ID d8b88dd7493540b'
                }
              }, function (error, response, tbody) {
                if (!error && response.statusCode == 200) {
                  var v = JSON.parse(tbody).data.link;
                  console.log('v',v);
                  ctx.proxyToClientResponse.write(str.replace(/<url>(.*?)<\/url>/, '<url>' + v + '</url>'));
                } else {
                  console.log('error,tbody',error, tbody);
                  ctx.proxyToClientResponse.write(body);
                }
                return callback();
              }
            );
          } else {
            console.log('no match', body);
            ctx.proxyToClientResponse.write(body);
            return callback();
          }
          
          //if(ctx.serverToProxyResponse.headers['content-type'] && ctx.serverToProxyResponse.headers['content-type'].indexOf('text/html') === 0) {
          //  body = body.toString().replace(/Lucky/g, 'Sexy');
          //}
          //ctx.proxyToClientResponse.write(body);
        });
        
        return callback();
      });

      proxy.listen({port: 5055});
      console.log('[lightshotProxy] loaded');
    } catch (e) {
      console.error('[lightshotProxy] failed with', e);
    }
  },
};
const proxy = global.__require('http-mitm-proxy')();
const request = global.__require('request');
