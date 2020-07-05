const router = require("express").Router();
const Product = require("../models/product");

// Conección con aws
const aws = require("aws-sdk");
// Librería para cargar imagen
const multer = require("multer");
// Librería para conectar el path de la imagen directamente
const multerS3 = require("multer-s3");
// Permiso para acceder al bucket
const s3 = new aws.S3({
  accessKeyId: "AKIA5W2PLOZZBTN6TNMO",
  secretAccessKey: "7t/7iADO8xpfJirGUdwDx6qnJikkQNm5UIUDxMtE",
});

const faker = require("faker");

const checkJWT = require("../middlewares/check-jwt");
const product = require("../models/product");

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "amazoncl",
    //Información relacionada con el archivo
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    //Nombre del producto
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

router
  .route("/products")
  .get(checkJWT, (req, res, next) => {
    //ENCUENTRA TODOS LOS PRODUCTOS
    Product.find({ owner: req.decoded.user._id })
      .populate("owner")
      .populate("category")
      .exec((err, products) => {
        if (product) {
          res.json({
            success: true,
            message: "Products",
            products: products,
          });
        }
      });
  })
  .post([checkJWT, upload.single("product_picture")], (req, res, next) => {
    console.log(upload);
    console.log(req.file);
    let product = new Product();
    product.owner = req.decoded.user._id;
    product.category = req.body.categoryId;
    product.title = req.body.title;
    product.price = req.body.price;
    product.description = req.body.description;
    product.image = req.file.location;
    product.save();
    res.json({
      success: true,
      message: "Successfully Added the product",
    });
  });

  /* Para pruebas */
router.get('/faker/test', (req,res,next) => {
  for(i=0; i<20; i++){
    let product = new Product();
    product.category = '5ee907d9d8ae1d590c5fd142';
    product.owner = '5ee6616428002c4a185645bb';
    product.image = faker.image.food();
    product.title = faker.commerce.productName();
    product.description = faker.lorem.words();
    product.price = faker.commerce.price();
    product.save();
  }
  res.json({
    message: "Successfully added 20 pictures"
  });
})

module.exports = router;