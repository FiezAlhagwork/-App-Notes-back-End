const express = require("express")
const router = express.Router()
const {authenticateToken} = require("../utilities")
const {createNotes , editNotes , getNotes , deleteNote, editPinnedNotes, searchNotes } = require("../controllers/Notes.controllers")
const cors = require("cors");
router.use(cors());



router.post("/" , authenticateToken ,createNotes)

router.put("/:NoteId" , authenticateToken , editNotes )

router.get("/", authenticateToken , getNotes)

router.delete("/:NoteId" , authenticateToken , deleteNote )

router.patch("/:NoteId" , authenticateToken , editPinnedNotes )

router.get("/search" , authenticateToken , searchNotes)





module.exports = router
