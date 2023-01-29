/////////////////////////////////////
//// Import Dependencies         ////
/////////////////////////////////////
const express = require("express");
const Note = require("../models/notes");

/////////////////////////////////////
//// Create Router               ////
/////////////////////////////////////
const router = express.Router();

//////////////////////////////
//// Routes               ////
//////////////////////////////

// index route
// Read-> finds and displays all notes
router.get("/", (req, res) => {
  // find all the notes
  Note.find({})
    // there's a built in function that runs before the rest of the promise chain
   // this function is called populate, and it's able to retrieve info 
  //  from other documents in other collections
        .populate('owner', 'username')
        // .populate('comments.author', '-password')
    // send json if successful
    .then((notes) => {
      res.json({ notes: notes });
    })
    // catch errors if they occur
    // .catch((err) => console.log("The following error occurred: \n", err));
    .catch((err) => {
      console.log(err);
      res.status(404).json(err);
    });
});

// CREATE route
// Create -> receives a request body, and creates a new document in the database
router.post("/", (req, res) => {
  // here, we'll have something called a request body
  // inside this function, that will be called req.body
  // we want to pass our req.body to the create method
  // we want to add an owner field to our note
  // It is great that we saved the user's id on the session object
  // so it is easy for us to access that data.
  req.body.owner = req.session.userId;
  const newNote = req.body;
  Note.create(newNote)
    // send a 201 status, along with the json response of the new note
    .then((note) => {
      res.status(201).json({ note: note.toObject() });
    })
    // send an error if one occurs
    // .catch((err) => console.log(err));
    .catch((err) => {
      console.log(err);
      res.status(404).json(err);
    });
});

// GET route
// Index -> This is a user specific index route
// this will only show the logged in user's notes  

router.get('/mine', (req, res) => {
  // find notes by ownership, using the req.session info
  Note.find({ owner: req.session.userId })
      .populate('owner', 'username')
      // .populate('comments.author', '-password')
      .then(notes => {
          // if found, display the notes
          res.status(200).json({ notes: notes })
      })
      .catch(err => {
          // otherwise throw an error
          console.log(err)
          res.status(400).json(err)
      })
})





// PUT route
// Update -> updates a specific note
// PUT replaces the entire document with a new document from the req.body
// PATCH is able to update specific fields at specific times, but it requires a little more code to ensure that it works properly, so we'll use that later
// router.put("/:id", (req, res) => {
//   // save the id to a variable for easy use later
//   const id = req.params.id;
//   // save the request body to a variable for easy reference later
//   const updatedNote = req.body;
//   // we're going to use the mongoose method:
//   // findByIdAndUpdate
//   // eventually we'll change how this route works, but for now,
//   // we'll do everything in one shot, with findByIdAndUpdate
//   Note.findByIdAndUpdate(id, updatedNote, { new: true })
//     .then((note) => {
//       console.log("the newly updated note", note);
//       // update success message will just be a 204 - no content
//       res.sendStatus(204);
//     })
//     // .catch((err) => console.log(err));
//     .catch((err) => {
//       console.log(err);
//       res.status(404).json(err);
//     });
// });

// PUT route
// Update -> updates a specific note(only if the note's owner is updating)
router.put('/:id', (req, res) => {
  const id = req.params.id
  Note.findById(id)
      .then(note => {
          // if the owner of the note is the person who is logged in
          if (note.owner == req.session.userId) {
              // send success message
              res.sendStatus(204)
              // update and save the note
              return note.updateOne(req.body)
          } else {
              // otherwise send a 401 unauthorized status
              res.sendStatus(401)
          }
      })
      .catch(err => {
          console.log(err)
          res.status(400).json(err)
      })
})



// DELETE route
// Delete -> delete a specific note

// router.delete("/:id", (req, res) => {
//   // get the id from the req
//   const id = req.params.id;
//   // find and delete the note
//   Note.findByIdAndRemove(id)
//     // send a 204 if successful
//     .then(() => {
//       res.sendStatus(204);
//     })
//     // send an error if not
//     // .catch((err) => console.log(err));
//     .catch((err) => {
//       console.log(err);
//       res.status(404).json(err);
//     });
// });


// DELETE route
// Delete -> delete a specific note
router.delete('/:id', (req, res) => {
  const id = req.params.id
  Note.findById(id)
      .then(note => {
          // if the owner of the note is the person who is logged in
          if (note.owner == req.session.userId) {
              // send success message
              res.sendStatus(204)
              // delete the note
              return note.deleteOne()
          } else {
              // otherwise send a 401 unauthorized status
              res.sendStatus(401)
          }
      })
      .catch(err => {
          console.log(err)
          res.status(400).json(err)
      })
})




// SHOW route
// Read -> finds and displays a single resource
router.get("/:id", (req, res) => {
  // get the id -> save to a variable
  const id = req.params.id;
  // use a mongoose method to find using that id
  Note.findById(id)
    // send the note as json upon success
    .then((note) => {
      res.json({ note: note });
    })
    // catch any errors
    .catch((err) => {
      console.log(err);
      res.status(404).json(err);
    });
});

//////////////////////////////
//// Export Router        ////
//////////////////////////////
module.exports = router;
