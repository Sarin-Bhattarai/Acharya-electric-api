var express = require("express");
var router = express.Router();
var multer = require("multer");
const upload = multer();
var Home = require("../models/home");
var { wrapAsync } = require("../helper/catchHandler");

const type = upload.none();

//routes
router.post(
  "/",
  type,
  wrapAsync(async (req, res) => {
    if (!req.body.image || !req.body.icon) {
      return res.status(400).json({
        status: "fail",
        data: { image: "No image or icon selected" },
      });
    }
    const homeDetails = {
      title: req.body.title,
      icon: req.body.icon,
      image: req.body.image,
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
  type,
  wrapAsync(async (req, res) => {
    const homeId = req.params.id;
    const home = await Home.findById(homeId);
    if (!home) {
      return res.status(404).json({
        message: "Home not found",
      });
    }

    if (req.body.image) {
      home.image = req.body.image;
    }

    if (req.body.icon) {
      home.icon = req.body.icon;
    }

    Object.assign(home, req.body);
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
