var express = require("express");
var router = express.Router();
var multer = require("multer");
var Home = require("../models/home");
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
}).fields([
  { name: "image", maxCount: 1 },
  { name: "icon", maxCount: 1 },
]);

//routes
router.post(
  "/",
  uploads,
  wrapAsync(async (req, res) => {
    if (!req.files || !req.files.image || !req.files.icon) {
      return res.status(400).json({
        status: "fail",
        data: { image: "No image or icon selected" },
      });
    }
    const homeDetails = {
      title: req.body.title,
      icon: req.files.icon[0].path,
      image: req.files.image[0].path,
    };
    const homes = new Home(homeDetails);
    const result = await homes.save();
    return res.status(200).json(result);
  })
);

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const homes = await Home.find();
    return res.json(homes);
  })
);

router.patch(
  "/:id",
  uploads,
  wrapAsync(async (req, res) => {
    const homeId = req.params.id;
    const home = await Home.findById(homeId);
    if (!home) {
      return res.status(404).json({
        message: "Home not found",
      });
    }

    if (req.files) {
      if (req.files.image) {
        home.image = req.files.image[0].path;
      }
      if (req.files.icon) {
        home.icon = req.files.icon[0].path;
      }
    }

    //Object.keys() to get an array of keys in req.body,
    // and then use forEach() to update each key in home.
    Object.keys(req.body).forEach((key) => {
      home[key] = req.body[key];
    });
    await home.save();
    return res.json(home);
  })
);

router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    const homeId = req.params.id;
    const home = await Home.findById(homeId);
    if (!home) {
      return res.status(404).json({
        message: "Home not found",
      });
    }
    await Home.deleteOne({ _id: homeId });
    return res.json({ status: "success", message: "Home deleted" });
  })
);

module.exports = router;
