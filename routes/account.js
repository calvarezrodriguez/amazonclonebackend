const router = require("express").Router();
const jwt = require("jsonwebtoken");
const checkJWT = require("../middlewares/check-jwt");
const User = require("../models/user");
const Order = require("../models/order");
const config = require("../config");
const { Schema } = require("mongoose");

router.post("/singup", (req, res, next) => {
  let user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;
  user.picture = user.gravatar();
  user.isSeller = req.body.isSeller;

  // Busco si el email del usuario existe en la base de datos
  User.findOne({ email: req.body.email }, (err, userExists) => {
    if (userExists) {
      res.json({
        success: false,
        message: "Ya existe una cuenta con ese correo electrónico.",
      });
    } else {
      // Guardo el usuario en caso de no encontrarlo
      user.save();

      // Genero el token
      var token = jwt.sign(
        {
          user: user,
        },
        config.secret,
        {
          expiresIn: "7d",
        }
      );

      // Envío la respuesta
      res.json({
        success: true,
        message: "Token was generated succefully!",
        token: token,
      });
    }
  });
});

router.post("/login", (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) throw err;

    if (!user) {
      res.json({
        success: false,
        message: "Authenticated false: no se ha encontrado el usuario.",
      });
    } else if (user) {
      var validPassword = user.comparePassword(req.body.password);
      if (!validPassword) {
        res.json({
          success: false,
          message: "Authenticated false: contraseña incorrecta.",
        });
      } else {
        var token = jwt.sign(
          {
            user: user,
          },
          config.secret,
          {
            expiresIn: "7d",
          }
        );
        res.json({
          success: true,
          message: "Token was generated Succefully!",
          token: token,
        });
      }
    }
  });
});

router
  .route("/profile")
  // VERIFICAMOS PRIMERO SI EXISTE EL TOKEN
  .get(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id }, (err, user) => {
      res.json({
        success: true,
        user: user,
        message: "Proceso exitoso.",
      });
    }).select("-password");
  })
  .post(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id }, (err, user) => {
      if (err) return next(err);

      if (req.body.name) user.name = req.body.name;
      if (req.body.email) user.email = req.body.email;
      if (req.body.password) user.password = req.body.password;

      user.isSeller = req.body.isSeller;

      user.save();
      res.json({
        success: true,
        message: "Información del perfil editada exitosamente.",
      });
    });
  });

router
  .route("/address")
  // VERIFICAMOS PRIMERO SI EXISTE EL TOKEN
  .get(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id }, (err, user) => {
      res.json({
        success: true,
        address: user.address,
        message: "Proceso exitoso.",
      });
    });
  })
  .post(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id }, (err, user) => {
      if (err) return next(err);

      if (req.body.addr1) user.address.addr1 = req.body.addr1;
      if (req.body.addr2) user.address.addr2 = req.body.addr2;
      if (req.body.city) user.address.city = req.body.city;
      if (req.body.state) user.address.state = req.body.state;
      if (req.body.country) user.address.country = req.body.country;
      if (req.body.postalCode) user.address.postalCode = req.body.postalCode;

      user.save();
      res.json({
        success: true,
        message: "La direccion fue editada exitosamente.",
      });
    });
  });

router.get("/orders", checkJWT, (req, res, next) => {
  Order.find({ owner: req.decoded.user._id })
    .populate("products.product")
    .populate("owner")
    .exec((err, orders) => {
      if (err) {
        res.json({
          success: false,
          message: "Couldn't find your order.",
        });
      } else {
        res.json({
          success: true,
          message: "Found your order",
          orders: orders,
        });
      }
    });
});

router.get("/orders/:id", checkJWT, (req, res, next) => {
  Order.findOne({ _id: req.params.id })
    .deepPopulate("products.product.owner")
    .populate("owner")
    .exec((err, order) => {
      if (err) {
        res.json({
          success: false,
          message: "Couldn't find your order.",
        });
      } else {
        res.json({
          success: true,
          message: "Found your order",
          order: order,
        });
      }
    });
});

module.exports = router;
