// Post y Get
const express = require("express");
// Midleware
const morgan = require("morgan");
// Comunica front y back
const bodyParser = require("body-parser");
// Comunica facilmente mongodb con nodejs
const mongoose = require("mongoose");
// Middleware to comunicate front and back
const cors = require("cors");

// Importo configuraciones
const config = require("./config");

const app = express();

// Probando conección con base de datos en mlab
mongoose.connect(config.database, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Conectado con la base de datos");
  }
});

// La lectura de información se extraerá de formatos json
app.use(bodyParser.json());
// False because we gonna use img
app.use(bodyParser.urlencoded({ extended: false }));
// Lock all request in the terminal
app.use(morgan("dev"));
app.use(cors());

const mainRoutes = require("./routes/main");
const userRoutes = require("./routes/account");
const sellerRoutes = require("./routes/seller");
const productSearchRoutes = require("./routes/product-search");

app.use("/api", mainRoutes);
app.use("/api/accounts", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/search", productSearchRoutes);

app.listen(config.port, (err) => {
  console.log("Here it's my first server on port " + config.port);
});
