var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var cookie = require('cookie');

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
    authStatusUI =  `<form action="/topic/logout_process" method="post">
          <input type="submit" value="logout">
      </form>`
  }
  return authStatusUI;
}

router.get('/create', function(request, response){
    var title = 'WEB - create';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
      <form action="/topic/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '',authStatusUI(request, response));
    response.send(html);
  });
   
  router.post('/create_process', function(request, response){
    console.log('Cookies: ', request.cookies)
    if(request.cookies){
      var post = request.body;
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        response.redirect(`/topic/${title}`);
      });
    }else{
      response.send('Please login')
    }
  });
   
  router.get('/update/:pageId', function(request, response){
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      var title = request.params.pageId;
      var list = template.list(request.list);
      var html = template.HTML(title, list,
        `
        <form action="/topic/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`,authStatusUI(request, response)
      );
      response.send(html);
    });
  });
   
  router.post('/update_process', function(request, response){
    var post = request.body;
    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function(error){
      fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        response.redirect(`/topic/${title}`);
      })
    });
  });
   
  router.post('/delete_process', function(request, response){
    var post = request.body;
    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function(error){
      response.redirect('/');
    });
  });

  router.get('/login', function (request,response) {
  var title = 'login';
  var list = template.list(request.list);
  var html = template.HTML(title, list,
  `
  <form action="/topic/login_process" method="post">
      <p><input type="text" name="email" placehold="email"></p>
      <p><input type="password" name="password" placehold="password"></p>
      <p><input type="submit"></p>
  </form>
  `,
  `<a href="/topic/create">create</a>`,
  );

  response.send(html)
});

router.post('/logout_process', function (request,response) {
  console.log(request.cookies.email);
  response.clearCookie('email');
  response.clearCookie('password');
  response.redirect('/');
});

router.post('/login_process', function (request,response) {
  var post = request.body;
  
  if(post.email === 'leeminwok@naver.com' && post.password === 'dhksthxpa12'){
      response.cookie('email', post.email, {
        maxAge: 60*60*1000,
        HttpOnly: true
      });
      response.cookie('password', post.password, {
        maxAge: 60*60*1000,
        HttpOnly: true
      });
      response.redirect('/');
  }else{
      response.send('Who')
  }
});
   
  router.get('/data/:pageId', function(request, response, next) { 
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      if(err){
        next(err);
      } else {
        var title = request.params.pageId;
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(description, {
          allowedTags:['h1']
        });
        var list = template.list(request.list);
        var html = template.HTML(sanitizedTitle, list,
          `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
          ` <a href="/topic/create">create</a>
            <a href="/topic/update/${sanitizedTitle}">update</a>
            <form action="/topic/delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>`,authStatusUI(request, response)
        );
        response.send(html);
      }
    });
  });
  
  module.exports = router;