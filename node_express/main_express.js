var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression')
var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');
var authRouter = require('./routes/auth.js');
var helmet = require('helmet')
const cookieParser = require('cookie-parser');
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var cookie = require('cookie');

app.use(helmet());
app.use(cookieParser());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(session({
  secret: 'dhksthxpa12',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}))

var authData = {
  email: 'leeminwok0405@gmail.com',
  pwd: 'dhksthxpa12',
  nickname: 'IMNOOK'
}

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null, user.email);
});

passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id);
  done(null, authData);
});

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordFiled: 'pwd'
  },
  function (username, password, done) {
    console.log('LocalStrategy', username, password);
    if(username === authData.email){
      if(password === authData.pwd){
        console.log('1');
        return done(null, authData);
      }else{
        console.log('2');
        return done(null, false, { message: 'Incorrect password.' });
      }
    }else{
      console.log('3');
      return done(null, false, { message: 'Incorrect email.' });
    }
  }
))

app.post('/auth/login_process', 
  passport.authenticate('local', {
    failureRedirect: '/auth/login'
  }), (request, response) => {
    var post = request.body;
    if(post.email_cookie === 'true'){
      response.cookie('email', post.email, {
          maxAge: 60*60*1000,
          HttpOnly: true
      });
    }else{
      response.clearCookie('email');
      }
    response.redirect('/');
  }
)

app.get('*', function(request, response, next){
  fs.readdir('./data', function(error, filelist){
    request.list = filelist;
    next();
  });
});
 
app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/auth', authRouter);

app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});
 
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});
 
app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
});