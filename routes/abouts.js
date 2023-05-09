var express = require("express");
var router = express.Router();
var multer = require("multer");
var About = require("../models/abouts");
var { wrapAsync } = require("../helper/catchHandler");

//file or image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

//filtering the requested file
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    console.log("Image should be in jpeg || png || jpg format");
  }
};

//limiting the size of file
const uploads = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

const type = uploads.array("image", 2);

//routes
router.post(
  "/",
  type,
  wrapAsync(async (req, res) => {
    if (!req.files) {
      return res.status(400).json({
        status: "fail",
        data: { image: "No images selected" },
      });
    }
    // console.log(req.files);
    const aboutDetails = {
      title: req.body.title,
      description: req.body.description,
      image: req.files.map((item) => item.path),
    };
    const about = new About(aboutDetails);
    const result = await about.save();
    return res.status(200).json(result);
  })
);

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const about = await About.find();
    return res.json(about);
  })
);

router.patch(
  "/:id",
  type,
  wrapAsync(async (req, res) => {
    const aboutId = req.params.id;
    const about = await About.findById(aboutId);
    if (!about) {
      return res.status(404).json({
        message: "About not found",
      });
    }
    if (req.files) {
      about.image = req.files.map((item) => item.path);
    }
    Object.assign(about, req.body);
    await about.save();
    return res.json(about);
  })
);

router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    const aboutId = req.params.id;
    const about = await About.findById(aboutId);
    if (!about) {
      return res.status(404).json({
        message: "About not found",
      });
    }
    await About.deleteOne({ _id: aboutId });
    return res.json({ status: "success", message: "About deleted" });
  })
);

module.exports = router;
