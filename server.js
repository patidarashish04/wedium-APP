const express = require('express');
const morgan = require('morgan');
const bodyparser = require("body-parser");
const cookieParser = require('cookie-parser');
const cors = require("cors") // import cors
const dotenv = require('dotenv');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

dotenv.config({ path: '.env.local' });
const PORT = process.env.PORT || 8080   // localhost PORT no.  

const connectDB = require('./src/dao/database');   // DB connection logic 


//mongodb connection 
connectDB();
const app = express();

// Swagger SetUp
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: "wedium App",   // Application Name 
            version: '1.0.0',
            description: 'Describing a RESTful API with Swagger',
        },
        components: {
            securitySchemes: {   //security Schemes defination
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',   //jwt bearer scheme
                }
            }
        },
        security: [{
            bearerAuth: []  // security scheme applied globally to API
        }],
        servers: [
            {
                url: 'http://localhost:3030'   // localhost on 3030
            }
        ]
    },
    apis: ['./src/routes/*.js']
};
const swaggerSpec = swaggerJSDoc(options)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => res.send('Hellooooo'))
// app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
    limit: '10gb',
    extended: true,
    parameterLimit: 50000,
}));

app.use(cookieParser());
app.use(cors()) // add cors headers

app.use((req, res, next) => {
    req.path.startsWith('/api/v2/services/')
    next();
});

app.use(morgan('tiny'));
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index')
});

require('./src/routes/apis')(app);    // common route for all api's

app.get('*', (req, res) => res.status(404).send({ error: 'API not found.' }));   // if route not found for any api's

app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`) });   // PORT listening to..
