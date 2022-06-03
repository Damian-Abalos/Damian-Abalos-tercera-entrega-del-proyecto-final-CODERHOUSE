const express = require("express")
const session = require("express-session")
const { Server: HttpServer } = require("http");


const path = require("path");
const exphbs = require("express-handlebars")
const ejs = require('ejs')

const logger = require('./src/loggers/logger')
const cluster = require('cluster');
const minimist = require('minimist');
const bodyParser = require('body-parser')
const MongoStore = require('connect-mongo');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local').Strategy;

const rutaProductos = require("./src/routers/productos.js")
const rutaCarrito = require("./src/routers/carrito.js")
const rutaAutenticacion = require("./src/routers/autenticacion")

const app = express();
const httpServer = new HttpServer(app);

// número de CPUs
const options = {
    alias:{
        p: 'port',
        m: 'modo'
    },
    default: {
		port: '8080',
		modo: 'FORK'
	}
}
const args = minimist(process.argv.slice(2), options)
const port = parseInt(args.port) || 8080
const modo = (args.modo).toUpperCase()
const numCPUs = require('os').cpus().length

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors());

// Espacio público del servidor
app.use(express.static("./src/public"))

// Motor de plantillas 

app.set("views", "./src/public/views");
app.set("view engine", "ejs");



//Session Setup
app.use(bodyParser.urlencoded({ extended:true}));

app.use(session({
	store: MongoStore.create({
		mongoUrl: process.env.URLDB
	}),
	secret: 'shh',
	resave: true,
	saveUninitialized: false,
	rolling: true,
	cookie: {
		maxAge: 600000
	}
}))

app.use(passport.initialize());
app.use(passport.session());

app.use((req,res, next) => {
	logger.info(`Ruta: ${req.path}, Método: ${req.method}`)
	next()
})

app.use("/api/productos", rutaProductos);
app.use("/api/carrito", rutaCarrito)
app.use("/", rutaAutenticacion)



//server
if (modo === 'CLUSTER') {
	//modo CLUSTER
	if (cluster.isMaster) {
		logger.info(`Número de CPU: ${numCPUs}`)
		logger.info(`PID MASTER ${process.pid}`)

		for (let i = 0; i < numCPUs; i++) {
			cluster.fork()
		}

		cluster.on('exit', worker => {
			logger.info('Worker', worker.process.pid, 'died', new Date().toLocaleString())
			cluster.fork()
		})
	} else {
		const connectedServer = httpServer.listen(port, function () {
			logger.info(`Servidor escuchando en el puerto ${connectedServer.address().port}, modo: ${modo} - PID: ${process.pid}`)
		})
		connectedServer.on('error', error => logger.error(`Error en servidor: ${error}`))
	}
} else {
	//modo FORK por defecto
	const connectedServer = httpServer.listen(port, function () {
		logger.info(`Servidor escuchando en el puerto ${connectedServer.address().port}, modo: ${modo} - PID: ${process.pid}`)
	})
	connectedServer.on('error', error => logger.error(`Error en servidor: ${error}`))
	process.on('exit', (code) => {
		logger.info('Exit code -> ', code)
	})
}