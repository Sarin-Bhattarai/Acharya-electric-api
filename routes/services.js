var express = require("express");
var router = express.Router();
var multer = require("multer");
const upload = multer();
var Service = require("../models/services");
var { wrapAsync } = require("../helper/catchHandler");

const type = upload.none();

//routes
router.post(
  "/",
  type,
  wrapAsync(async (req, res) => {
    if (!req.body.image) {
      return res.status(400).json({
        status: "fail",
        data: { image: "No image selected" },
      });
    }
    const serviceDetails = {
      title: req.body.title,
      description: req.body.description,
      image: req.body.image,
    };
    const services = new Service(serviceDetails);
    const result = await services.save();
    return res.status(200).json(result);
  })
);

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const services = await Service.find();
    return res.json(services);
  })
);

router.patch(
  "/:id",
  type,
  wrapAsync(async (req, res) => {
    const serviceId = req.params.id;
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }
    // check if a new image file was uploaded
    if (req.body.image) {
      service.image = req.body.image;
    }
    // update the region document with the request body
    Object.assign(service, req.body);
    await service.save();
    return res.json(service);
  })
);

router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    const serviceId = req.params.id;
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }
    await Service.deleteOne({ _id: serviceId });
    return res.json({ status: "success", message: "Service deleted" });
  })
);

module.exports = router;
