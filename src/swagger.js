// const express = require('express');
// const swaggerJSDoc = require('swagger-jsdoc');
// const swaggerUi = require('swagger-ui-express'); 

// const app = express();
// const swaggerOptions = {
//     swaggerDefinition:{
//         openapi : '3.0.0',
// 		info: {
//             title : "wedium App",
// 			version : '1.0.0' 
// 		},
// 		servers : [
//             {
//                 api : 'http://localhost:3030/'
// 			}
// 		]
// 	},
// 	apis: ['./routes/apis.js']
// }
// const swaggerSpec = swaggerJSDoc(swaggerOptions)
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// // exports.swaggerOptions = {
// // 	swaggerDefinition: {
// //         openapi : '3.0.0',
// // 		info: {
// // 			description: 'Api docs for app',
// //             title : "wedium App",
// // 			version: '1.0.0',
// // 		},
// // 		servers : [
// //                         {
// //                             api : 'http://localhost:3030/'
// //             			}
// //             		],
// // 		basePath: '/api',
		
// // 		schemes: ['http', 'https'],
// // 		securityDefinitions: {
// // 		},
// // 	},
// //     apis: ['./routes/apis.js'],
// // 	route: {
// // 		url: '/api/api-docs',
// // 		docs: '/api/api-docs.json',
// // 	},
// // 	basedir: __dirname, // app absolute path
// // 	files: ['./routes/*.js', './../routes/*.js', './routes/**/*.js', './routes/**/**/*.js'], // Path to the API handle folder
// // };
