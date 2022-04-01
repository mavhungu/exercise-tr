const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { DB_URL } = require('./config');
const User = require('./models/User');

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log('Db connected...');
});

app.use(cors({ optionsSuccessStatus: true }));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname) + '/index.html');
});

app.post('/api/exercise/new-user', (req, res) => {
  const user = new User(req.body);
  user.save().then(user => {
    res.json(user);
  }).catch(err => {
    res.json({error: 'username is taken'});
  });
});

app.get('/api/exercise/users', (req, res) => {
  User.find((err, users) => {
    res.json(users);
  });
});

app.post('/api/exercise/add', (req, res) => {
  const input = req.body;
  if(!input.userId || !input.duration || !input.description){
    res.send('Fill in the necessary fields.');
  }else if(!input.date){
    input.date = new Date();
  }
  const date = new Date(input.date).toDateString();
  const duration = parseInt(input.duration);
  const exercise = {
    description: input.description,
    duration: duration,
    date: date
  }
  User.findByIdAndUpdate(
    input.userId, 
    {$push: {log: exercise}},
    (err, doc) => {
      if(err) return console.log('Error - ', err);
      res.json({
        _id: doc._id,
        username: doc.username,
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date
      });
    });
});

//I can retrieve a full exercise log of any user by getting /api/exercise/log with a parameter of userId(_id). App will return the user object with added array log and count (total exercise count).
app.get('/api/exercise/log', (req, res) => {
  User.findById(req.query.userId).then(user => {
    const from = req.query.from;
    const to = req.query.to;
    const limit = req.query.limit;
    let filtered = null;
    if(from){
      const fromTime = new Date(from).getTime();
      if(to){
        const toTime = new Date(to).getTime();
        filtered = user.log.filter(ex => new Date(ex.date).getTime() >= fromTime && new Date(ex.date).getTime() <= toTime);
      }else{
        filtered = user.log.filter(ex => new Date(ex.date).getTime() >= fromTime);
      }
    }
    if(limit){
      filtered = user.log.slice(0, limit);
    }
    res.json({
      _id: user._id,
      username: user.username,
      count: user.log.length,
      log: filtered || user.log
    });
  });
});

app.listen(3200);