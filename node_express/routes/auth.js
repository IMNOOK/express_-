var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var cookie = require('cookie');
var auth = require('../lib/auth.js');


  router.get('/login', function (request,response) {
  var title = 'login';
  var list = template.list(request.list);

  if(request.cookies.email){
      var html = template.HTML(title, list,
        `
        <form action="/auth/login_process" method="post">
            <p><input type="text" name="email" value="${request.cookies.email}"></p>
            <p><input type="password" name="pwd" placeholder="password"></p>
            <p><label><input type="checkbox" name="email_cookie" value="true" checked> 이메일 저장  </label><input type="submit"></p>
        </form>
        `,
        `<a href="/topic/create">create</a>`,
        );
  } else{

    var html = template.HTML(title, list,
    `
    <form action="/auth/login_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="password" placeholder="password"></p>
        <p><label><input type="checkbox" name="email_cookie" value="true" checked> 이메일 저장  </label><input type="submit"></p>
    </form>
    `,
    `<a href="/topic/create">create</a>`,
    );
  }

  response.send(html)
});

/*
router.post('/login_process', function (request,response) {
  var post = request.body;

    if(post.email === 'leeminwok0405@gmail.com' && post.password === 'dhksthxpa12'){

        if(post.email_cookie === 'true'){
            response.cookie('email', post.email, {
                maxAge: 60*60*1000,
                HttpOnly: true
            });
        }else{
            response.clearCookie('email');
        }
        request.session.is_logined = true;
        request.session.nickname = 'IMNOOK';
        request.session.save(function () {
            response.redirect('/');  
        })
    } else {
        response.send('Plz login again!');
    }
});


router.get('/logout', function (request,response) {
  request.session.destroy(function (err) {
    response.redirect('/');  
  })
});
*/

router.get('/logout', function (request,response) {
  request.logout();
  request.session.save(function (err) {
    response.redirect('/');  
  })
});
  module.exports = router;