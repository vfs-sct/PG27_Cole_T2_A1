const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs"); //file system
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.json()); // we will be opening, reading, writing to jsons so this body parser helps with that
app.use(express.static("public"));
app.use(cors());

let levels = {};

// loads a level
app.get("/level/:id", (req, res) => {
  const levelId = req.params.id;
  const filePath = path.join(__dirname, "levels", `${levelId}.json`);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading level data: ", err);
      return res.status(404).send("Level not found");
    }
    res.send(data);
  });
});

// Saves a level
app.post("/level/:id", (req, res) => {
  const levelId = req.params.id;
  const filePath = path.join(__dirname, "levels", `${levelId}.json`);
  const levelData = req.body;

  if (!Array.isArray(levelData) || levelData.length === 0) {
    return res.status(404).send("Level data must be an non-empty array");
  }

  // level data, FILTER (NULL = no filter), how many indentation spaces
  fs.writeFile(filePath, JSON.stringify(levelData, null, 2), (err) => {
    if (err) {
      console.error("Error saving level data: ", err);
      return res.status(500).send("Server error");
    }
    res.send("Level saved successfully"); // automatically sends a status of 200
  });
});

// renames a level
app.put("/level/:id", (req, res) => {
  const levelId = req.params.id;
  const oldFilePath = path.join(__dirname, "levels", `${levelId}.json`);
  const newFilePath = path.join(
    __dirname,
    "levels",
    `${req.body["name"]}.json`
  );

  if (fs.existsSync(newFilePath)) {
    res
      .status(500)
      .send(
        "This name already exists. you cannot rename a file to this name wihout first deleting or renaming the already existing file."
      );
    return;
  }

  fs.rename(oldFilePath, newFilePath, (err) => {
    if (err) {
      console.error("Error renaming level: ", err);
      return res.status(500).send("Server error");
    }
    res.send(`Level Successfully renamed to ${req.body["name"]}`);
  });
});

// deletes a level
app.delete("/level/:id", (req, res) => {
  const levelId = req.params.id;
  const filePath = path.join(__dirname, "levels", `${levelId}.json`);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error removing level: ", err);
      return res.status(500).send("Server error");
    }
  });
  res.send("Level successfully deleted");
});

// get all levels at the same time
app.get("/levels", (req, res) => {
  fs.readdir("levels", (err, files) => {
    if (err) {
      console.error("Error reading levels directory:", err);
      return res.status(500).send("Server error");
    }

    const levelIds = files
      .filter((file) => file.endsWith(".json")) // filters out all files that dont end with .json
      .map((file) => path.basename(file, ".json"));

    res.json(levelIds);
  });
});

//checks to make sure levels folder exists, creates it if it doesnt
if (!fs.existsSync("levels")) {
  fs.mkdirSync("levels");
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
