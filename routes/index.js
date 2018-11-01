const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator/check');

const router = express.Router();
const Overseer = mongoose.model('Overseer');

const auth = require('http-auth');
const basic = auth.basic(
  {
    realm: "Users"
  }, (username, password, callback) => { 
    callback(username === process.env.BASIC_AUTH_USERNAME
      && password === process.env.BASIC_AUTH_PASSWORD);
  }
);


router.get('/', (req, res) => {
  res.render('home', { title: 'Welcome' });
});

router.get(
  '/overseers',
  auth.connect(basic),
  (req, res) => {
    Overseer.find()
      .then((overseers) => {
        res.render('overseers/index', { title: 'Listing overseers', overseers });
      })
      .catch(() => { res.send('Sorry! Something went wrong.'); });
  }
);

router.get(
  '/overseers/new',
  auth.connect(basic),
  (req, res) => {
    res.render('overseers/new', { title: 'New Overseer' });
  }
);

router.post(
  '/overseers/new',
  [
    body('name')
      .isLength({ min: 1 })
      .withMessage('Please enter a name'),
    body('tags')
      .isLength({ min: 1 })
      .withMessage('Please enter a tag'),
    body('maxweight')
      .isLength({ min: 1 })
      .withMessage('Please enter a weight'),
  ],
  auth.connect(basic), 
  (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const overseer = new Overseer(req.body);
      overseer.save()
        .then(() => { res.redirect('/overseers'); })
        .catch(() => { res.send('Sorry! Something went wrong.'); });
    } else {
      res.render('overseers/new', {
        title: 'Overseer form',
        errors: errors.array(),
        data: req.body,
      });
    }

    console.log(req.body);
  }
);

router.get(
  '/overseers/edit/:userId',
  auth.connect(basic),
  (req, res) => {
    Overseer.findOne({name : req.params.userId})
      .then((overseerObj) => {
        let tagsCsv = overseerObj.tags.join(",")

        res.render('overseers/edit', {
          title: 'Edit Overseer',
          data: overseerObj,
          tagsCsv: tagsCsv
        });
      })
      .catch(() => { res.send('Sorry! Something went wrong.'); });
  }
);

router.post(
  '/overseers/edit/:userId',
  [
    body('name')
      .isLength({ min: 1 })
      .withMessage('Please enter a name'),
    body('tagsCsv')
      .isLength({ min: 1 })
      .withMessage('Please enter a tag'),
    body('maxweight')
      .isLength({ min: 1 })
      .withMessage('Please enter a weight'),
  ],
  auth.connect(basic), 
  (req, res) => {
    const errors = validationResult(req);
    console.log('tag csv: ', req.body.tagsCsv)

    if (errors.isEmpty()) {
      const overseer = new Overseer(req.body);
      const query = { name: req.body.name }
      Overseer.findOneAndUpdate(query, { tags: req.body.tagsCsv.split(","), maxweight: req.body.maxweight})
        .then(() => { res.redirect('/overseers'); })
        .catch(() => { res.send('Sorry! Something went wrong.'); });
    } else {
      res.render('overseers/edit', {
        title: 'Overseer edit form',
        errors: errors.array(),
        data: req.body,
      });
    }

    console.log(req.body);
  }
);

module.exports = router;