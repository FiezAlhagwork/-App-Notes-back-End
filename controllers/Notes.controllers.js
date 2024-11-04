const Note = require("../models/note.model");

const getNotes = async (req, res) => {
  const { user } = req.user;
  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });

    if (!notes || notes.length === 0) {
      return res.status(404).json({ error: false, message: "No notes found" });
    }

    return res
      .status(200)
      .json({ error: false, notes, message: "Notes retrieved successfully" });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

const createNotes = async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }
  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Notes added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

const editNotes = async (req, res) => {
  const noteId = req.params.NoteId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  // التحقق من أن هناك تغييرات لتحديثها
  if (!title && !content && !tags && isPinned === undefined) {
    return res.status(400).json({
      error: true,
      message: "No changes provided",
    });
  }

  try {
    // البحث عن الملاحظة بناءً على ID الملاحظة وID المستخدم
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    // التحقق من وجود الملاحظة
    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found",
      });
    }

    // تحديث الملاحظة بالقيم الجديدة فقط
    const updatedFields = {};
    if (title) updatedFields.title = title;
    if (content) updatedFields.content = content;
    if (tags) updatedFields.tags = tags;
    if (isPinned !== undefined) updatedFields.isPinned = isPinned;

    // تحديث الملاحظة في قاعدة البيانات باستخدام $set
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { $set: updatedFields },
      { new: true } // الخيار new يعيد الملاحظة المحدثة
    );

    return res.json({
      error: false,
      note: updatedNote,
      message: "Note updated successfully",
    });
  } catch (error) {
    // التعامل مع الأخطاء الداخلية
    console.error(error); // تسجيل الخطأ للمطور
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};


const deleteNote = async (req, res) => {
  const noteId = req.params.NoteId;
  const { user } = req.user;
  try {
    const notes = await Note.findOne({ _id: noteId, userId: user._id });

    if (!notes) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    const note = await Note.findByIdAndDelete(noteId, { new: true });

    return res.status(200).json({
      error: false,
      note,
      message: "Note delete successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Note Delete successfully",
    });
  }
};

const editPinnedNotes = async (req, res) => {
  const noteId = req.params.NoteId;
  const { isPinned } = req.body;
  const { user } = req.user;

  try {
    // البحث عن الملاحظة بناءً على ID الملاحظة وID المستخدم
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    // التحقق من وجود الملاحظة
    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found",
      });
    }

    // تحديث الملاحظة بالقيم الجديدة فقط
    const updatedFields = {};
     updatedFields.isPinned = isPinned || false

    // تحديث الملاحظة في قاعدة البيانات باستخدام $set
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { $set: updatedFields },
      { new: true } // الخيار new يعيد الملاحظة المحدثة
    );

    return res.json({
      error: false,
      note: updatedNote,
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

const searchNotes = async (req,res) => {
  const { user } = req.user
  const { query } = req.query


  if(!query) {
    return res.status(400).json({error:true , message:"search query is required"})
  }


  try {
    const matchingNotes = await Note.find({
      userId:user._id,
      $or : [
        {title: {$regex : new RegExp(query , "i")}},
        {content: {$regex : new RegExp(query , "i")}}
      ]
    })

    return res.json({
      error:false,
      notes:matchingNotes,
      message:"Notes matching the search query retrieves successfully"
    })

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  createNotes,
  editNotes,
  getNotes,
  deleteNote,
  editPinnedNotes,
  searchNotes
};
