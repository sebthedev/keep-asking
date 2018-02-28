// Load Express
let express = require('express')
let router = express.Router()
let bodyParser = require('body-parser')

let Cohort = require.main.require('./models/cohort.js')

const emailRE = /\S+@\S+\.\S+/

router.post('/update', bodyParser.urlencoded({ extended: false }), function (req, res) {
  console.log(req.body)

  // Validate name
  if (!req.body.name || typeof (req.body.name) !== 'string' || req.body.name.length === 0) {
    return res.status(400).json({
      message: 'A cohort name is required.',
      invalidField: 'name'
    })
  }

  // Validate members
  if (!req.body['members[]']) {
    return res.status(400).json({
      message: 'A members array is required.',
      invalidField: 'members'
    })
  }

  // Coerce members to array
  if (typeof (req.body['members[]']) === 'string') {
    req.body['members[]'] = [req.body['members[]']]
  }

  // Filter members for non-email addresses
  req.body.members = req.body['members[]'].filter(member => emailRE.test(member))

  // Save the changes to the database
  if (req.body.id) { // Try to update the existing cohort if we believe it exists
    Cohort.update({
      _id: req.body.id,
      owner: res.locals.user.username
    }, {
      name: req.body.name,
      members: req.body.members
    }, function (err) {
      if (err) {
        return res.status(500).json({
          message: 'An error occured while updating the existing cohort.'
        })
      }
      return res.sendStatus(200)
    })
  } else { // Try to create the new cohort
    let newCohort = Cohort({
      name: req.body.name,
      owner: res.locals.user.username,
      members: req.body.members
    })

    newCohort.save(function (err) {
      if (err) {
        return res.status(500).json({
          message: 'An error occured while saving the new cohort.'
        })
      }
      return res.sendStatus(200)
    })
  }
})

module.exports = router
