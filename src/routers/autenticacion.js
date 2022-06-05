/*------------- [requires]-------------*/
const passport = require("passport");
const { Router } = require("express");
const { Strategy: LocalStrategy } = require("passport-local");
const bCrypt = require("bcrypt");
require("dotenv").config();
const mongoose = require("mongoose");
const { model } = require("mongoose");
const { Schema } = require("mongoose");
const URLDB = process.env.URLDB;
const rutaAutenticacion = Router();

const twilio = require("twilio");
const nodemailer = require("nodemailer");
const logger = require("../loggers/logger");

/*------------- [Import carritos y productos]-------------*/
const carritos =
  process.env.DB == "Firebase"
    ? require("../daos/carritos/CarritosDaoFirebase")
    : require("../daos/carritos/CarritosDaoMongoDB");

let productosCargadosAlCarrito;
const setCartProducts = (userMail) => {
  carritos.getProductsById(userMail).then((resp) => (productosCargadosAlCarrito = resp))
}  

const productos =
  process.env.DB == "Firebase"
    ? require("../daos/productos/ProductosDaoFirebase")
    : require("../daos/productos/ProductosDaoMongoDB");
let productosCargados;
productos.getAll().then((resp) => (productosCargados = resp));

/*------------- [Mensajes]-------------*/
const accountSid = process.env.ACCOUNTSID;
const authToken = process.env.AUTHTOKEN;
const adminMail = process.env.ADMIN_MAIL;
const client = twilio(accountSid, authToken);

const enviarSms = async (to) => {
  try {
    const message = await client.messages.create({
      body: "Su pedido ha sido recibido y se encuentra en proceso.",
      from: "+19379362607",
      to: to,
    });
    logger.info(message);
  } catch (error) {
    logger.info(error);
  }
};
const enviarWhatsapp = async (usuarioNombre, usuarioTelefono) => {
  try {
    const message = await client.messages.create({
      body: `nuevo pedido de ${usuarioNombre}`,
      from: "whatsapp:+14155238886",
      to: `whatsapp:${usuarioTelefono}`,
    });
    logger.info(message);
  } catch (error) {
    logger.info(error);
  }
};
const enviarMail = async (usuarioNombre, productosComprados) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: adminMail,
      pass: "ofznioubsfoytlta",
    },
  });

  const mailOptions = {
    from: "Tercera entrega backend",
    to: adminMail,
    subject: `Nuevo pedido de ${usuarioNombre}`,
    html: `<div>${productosComprados}</div>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(info);
  } catch (error) {
    logger.info(error);
  }
}

/*------------- [Mongo Atlas para user]-------------*/
const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  nombre: { type: String, required: true },
  edad: { type: Number, required: true },
  direccion: { type: String, required: true },
  telefono: { type: Number, required: true },
  foto: { type: String, required: true },
});
const User = model("usuarios", userSchema);
mongoose.connect(
  URLDB,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw new Error(`Error de conexion a la base de datos ${err}`);
    logger.info("base de datos conectada");
  }
);
/*------------- [LocalStrategy - Login]-------------*/
passport.use(
  "login",
  new LocalStrategy((username, password, done) => {
    User.findOne({ username }, (err, user) => {
      if (err) return done(err);

      if (!user) {
        logger.info("User Not Found with username " + username);
        return done(null, false);
      }

      if (!isValidPassword(user, password)) {
        logger.info("Invalid Password");
        return done(null, false);
      }

      return done(null, user);
    });
  })
);

function isValidPassword(user, password) {
  return bCrypt.compareSync(password, user.password);
}
/*------------- [LocalStrategy - Signup]-------------*/

passport.use(
  "signup",
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    (req, username, password, done) => {
      User.findOne({ username: username }, function (err, user) {
        logger.info(user);
        logger.info(username);
        if (err) {
          logger.info("Error in SignUp: " + err);
          return done(err);
        }
        if (user) {
          logger.info("User already exists");
          return done(null, false);
        }
        const newUser = {
          username: username,
          password: createHash(password),
          nombre: req.body.nombre,
          edad: req.body.edad,
          direccion: req.body.direccion,
          telefono: req.body.telefono,
          foto: req.body.foto,
        };

        const createCart = () => {
          let array = { productos: [] };
          let idUser = username.toLocaleString();
          carritos.saveCart(array, idUser);
        };

        createCart();

        User.create(newUser, async (err, userWithId) => {
          if (err) {
            logger.info("Error in Saving user: " + err);
            return done(err);
          }
          logger.info(user);
          logger.info("User Registration succesful");

          const asunto = "nuevo registro";
          const mensajeHtml = `
                <div>
                    <h2>Nuevo usuario registrado</h2>
                    <h3>Datos del usuario:</h3>
                    <img src="${newUser.foto}" alt="">
                    <ul>
                        <li>Mail: ${newUser.username}</li>
                        <li>Nombre: ${newUser.nombre}</li>
                        <li>Edad: ${newUser.edad}</li>
                        <li>Direccion: ${newUser.direccion}</li>
                        <li>Telefono: ${newUser.telefono}</li>
                    </ul>
                </div>`;

          const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            auth: {
              user: adminMail,
              pass: "ofznioubsfoytlta",
            },
          });

          const mailOptions = {
            from: "Servidor Node.js",
            to: adminMail,
            subject: asunto,
            html: mensajeHtml,
          };
          await transporter.sendMail(mailOptions);
          return done(null, userWithId);
        });
      });
    }
  )
);
function createHash(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

/*------------- [Serializar y deserializar]-------------*/
passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser((id, done) => {
  User.findById(id, done);
});

/*---------------- [Rutas] ---------------*/
// Index
rutaAutenticacion.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    let user = req.user;
    let userMail = user.username;
    let userName = user.nombre;
    let userAge = user.edad;
    let userAdress = user.direccion;
    let userPhone = user.telefono;
    let userPhoto = user.foto;

    let usuario = {
      userMail,
      userName,
      userAge,
      userAdress,
      userPhone,
      userPhoto,
    };

    res.render("pages/home", { usuario, productosCargados });
  } else {
    res.redirect("/login");
  }
});

//carrito
rutaAutenticacion.get("/carrito", (req, res) => {
  let user = req.user;
  let userMail = user.username;
  let userName = user.nombre;
  let userAge = user.edad;
  let userAdress = user.direccion;
  let userPhone = user.telefono;
  let userPhoto = user.foto;

  let usuario = {
    userMail,
    userName,
    userAge,
    userAdress,
    userPhone,
    userPhoto,
  }

  
  //esto es de prueba//
  // {
    //   nombre:"celular",
    //   precio:"100",
    //   foto:"asd"
    // }
  setCartProducts(userMail)
    
  const renderizar = () => {
    let cartProducts = productosCargadosAlCarrito[0]
    res.render("pages/carrito", { usuario, cartProducts })
  }
  setTimeout(() => {
    renderizar()
  }, 1500);

});

rutaAutenticacion.post("/carrito", async (req, res) => {
  let user = req.user;
  let usuarioTelefono = user.telefono;
  let usuarioNombre = user.nombre;
  let usuarioMail = user.username;

  const vaciarCarrito = async () => {
    let emptyCart = { productos: [] };
    await carritos.updateById(emptyCart, usuarioMail);
  };
  //esto es de prueba//
  // let cartProducts = [{
  //   nombre:"celular",
  //   precio:"100",
  //   foto:"asd"
  // }]

  setCartProducts(usuarioMail)

  const finalizarCompra = async () => {
    let productosComprados = productosCargadosAlCarrito.map(function (producto) {
      return `
      <ul>
          <li>${producto.nombre}</li>             
          <li>$${producto.precio}</li>             
          <li><img style="max-width: 50px;" src="${producto.foto}" alt=""></li>             
      </ul>`;
    });
    enviarSms(`+54${usuarioTelefono}`);
    enviarWhatsapp(usuarioNombre, `+549${usuarioTelefono}`);
    enviarMail(usuarioNombre, productosComprados);
    vaciarCarrito();
    res.redirect("/");
  };
  
  setTimeout(() => {
    finalizarCompra();
  }, 1500);
});

//info
rutaAutenticacion.get("/infoUser", (req, res) => {
  let user = req.user;
  let userMail = user.username;
  let userName = user.nombre;
  let userAge = user.edad;
  let userAdress = user.direccion;
  let userPhone = user.telefono;
  let userPhoto = user.foto;

  let usuario = {
    userMail,
    userName,
    userAge,
    userAdress,
    userPhone,
    userPhoto,
  };

  res.render("pages/infoUser", { usuario });
});

// Login
rutaAutenticacion.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    let user = req.user;
    logger.info("user logueado");
    res.render("pages/home", { user });
  } else {
    logger.info("user NO logueado");
    res.render("pages/login.ejs");
  }
});
rutaAutenticacion.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/login-error",
    successRedirect: "/",
  })
);
rutaAutenticacion.get("/login-error", (req, res) => {
  logger.info("error en login");
  res.render("pages/login-error", {});
});

// signup
rutaAutenticacion.get("/signup", (req, res) => {
  res.render("pages/signup");
});
rutaAutenticacion.post(
  "/signup",
  passport.authenticate("signup", {
    failureRedirect: "/signup-error",
    successRedirect: "/",
  })
);
rutaAutenticacion.get("/signup-error", (req, res) => {
  logger.info("error en signup");
  res.render("pages/signup-error", {});
});

// Logout
rutaAutenticacion.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// Fail route
rutaAutenticacion.get("*", (req, res) => {
  res.status(404).render("pages/routing-error", {});
});

/*---------------- [Autorizar rutas protegidas] ---------------*/
function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}
rutaAutenticacion.get("/ruta-protegida", checkAuthentication, (req, res) => {
  let user = req.user;
  logger.info(user);
  res.send("<h1>Ruta OK!</h1>");
});

module.exports = rutaAutenticacion;
