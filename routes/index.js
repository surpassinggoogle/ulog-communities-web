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
    Overseer.find().sort({name: 'asc'})
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

    if (errors.isEmpty()) {
      const overseer = new Overseer(req.body);
      overseer.tags= req.body.tagsCsv.split(",")
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

  }
);

router.get(
  '/overseers/:userId/edit/',
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
  '/overseers/:userId/edit/',
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

router.post(
  '/overseers/:userId/delete',
  auth.connect(basic), 
  (req, res) => {

    const query = { name: req.params.userId }
    console.log('query', query)
    Overseer.deleteOne(query)
      .then(() => {
        res.redirect('/overseers');
      })
      .catch(() => { res.send('Sorry! Something went wrong.'); });


  }
);


module.exports = router;