var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');

function authIsOwner(request, response) {
  var isOwner = false;
  var cookies = {}
  if(request.cookies.email && request.cookies.password){
    isOwner = true;
  }
  return isOwner;
}

function authStatusUI(request, response) {
  var authStatusUI = `<a href="/topic/login">login</a>`
  if(authIsOwner(request, response)){
    authStatusUI =   `<form action="/topic/logout_process" method="post">
          <input type="submit" value="logout">
      </form>`
  }
  return authStatusUI;
}

router.get('/', function(request, response) { 
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(request.list);
    var html = template.HTML(title, list,
      `
      <h2>${title}</h2>${description}
      <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">
      `,
      `<a href="/topic/create">create</a>`,authStatusUI(request, response)
    ); 
    response.send(html);
  });
   
  module.exports = router;