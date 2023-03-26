require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const Note = require("./models/note");

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2022-01-10T17:30:31.098Z",
    important: true,
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2022-01-10T18:39:34.091Z",
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2022-01-10T19:20:14.298Z",
    important: true,
  },
];

app.use(express.json());
app.use(cors());
app.use(express.static("build"));

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/notes", (request, response, next) => {
  const body = request.body;

  if (!body.content || body.content === undefined) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  note
    .save()
    .then((savedNote) => {
      response.json(savedNote);
    })
    .catch((error) => next(error));
});

app.get("/api/notes", (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

app.delete("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);
  notes = notes.filter((note) => note.id !== id);
});

app.get("/api/notes/:id", (request, response) => {
  const { content, important } = request.body;
  Note.findById(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: "query" }
  )
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(204).end();
      }
    })
    .catch((error) => {
      console.log(error);
      response.status(400).send({ error: "malformatted id" });
    });
});

app.put("/api/notes/:id", (req, res, next) => {
  const body = content.body;

  const note = {
    content: body.content,
    important: body.important,
  };

  Note.findByIdAndUpdate(req.params.id, note, { new: true })
    .then((updateNote) => {
      res.json(updateNote);
    })
    .catch((error) => next(error));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);
