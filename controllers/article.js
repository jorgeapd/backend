'use strict'

var validator = require ('validator');
var fs = require('fs');
var path = require('path');

var Article = require ('../models/article');
const article = require('../models/article');


var controller = {

    datosCurso: (req, res) => {
        var hola = req.body.hola;
    
        return res.status(200).send({
            curso: 'Master en Frameworks JS', 
            autor: 'Jorge Pilcante',
            url: 'jorgepilcante.cl',
            hola    
        });    
    },

    test: (req, res) => {
        return res.status(200).send({
            message: 'soy la accion test de mi controlador de articulos'
        });
    },

    save: (req, res) => {
        //Recoger parametros por post
        var params = req.body;

        //Validar datos (validator)
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

        }catch(err){
            return res.status(200).send({
                    message: 'Faltan datos para enviar!!!'
            });
        }
        
        if(validate_title && validate_content){
            
            //Crear el objeto a guardar
            var article = new Article();

            //Asignar valores
            article.title = params.title;
            article.content = params.content;
            article.image = null;
            //Guardar el articulo
            article.save ((err, articleStored) => {

                if(err || !articleStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El articulo no se ha guardado!!!'
                });
                }

                //Devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    article: articleStored
                }); 


            });

        
        }else{
            return res.status(200).send({
                status: 'error',
                message: 'Los datos no son validos!!!'
            });
        }
        
    },
    
    getArticles: (req, res) => {

        var query = Article.find({});
        
        var last = req.params.last;
        if(last || last != undefined){
            query.limit(5);
        }

        //find
        query.sort('-_id').exec((err, articles) => {
            
            if(err){
                return res.status(500).send({
                    status: 'error',
                message: 'error al devolver los articulos!!!'
                });
            }

            if(!articles){
                return res.status(200).send({
                    status: 'error',
                message: 'no hay articulos para mostrar!!!'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });

        });
        
    },

    getArticle: (req, res) => {

        //recoger el id de la url
        var articleId = req.params.id;

        //comprobar que existe
        if(!articleId || articleId == null){
            return res.status(404).send({
                status: 'error',
                message: 'no existe el articulo!!!'
            });
        }

        //buscar el articulo
        Article.findById(articleId, (err, article) => {
            
            if(err || !article){
                return res.status(200).send({
                    status: 'error',
                    message: 'no existe el articulo!!!'
                });
            }
            
            //devolverlo en json
            return res.status(200).send({
                status: 'success',
                article
            });

        });

    },

    update: (req, res) => {
        //recoger el id del articulo por la url
        var articleId = req.params.id;

        //recoger los datos que llegan por put
        var params = req.body;

        //validar datos
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'faltan datos por enviar!!!'
            });
        }

        if(validate_title && validate_content){
             //find and update
             Article.findOneAndUpdate({_id: articleId}, params, {new:true}, (err, articleUpdated) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'error al actualizar!!!'
                    });
                }

                if(!articleUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'no existe el articulo!!!'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });
             }); 
        }else{
            //devolver respuesta
            return res.status(200).send({
                status: 'error',
                message: 'la validacion no es correcta!!!'
            });
        }
       
    },

    delete: (req, res) => {
        //recoger el id de la url
        var articleId = req.params.id;

        //find and delete
        Article.findOneAndDelete({_id:articleId}, (err, articleRemoved) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'error al borrar!!!'
                });
            }

            if(!articleRemoved){
                
            }

            return res.status(200).send({
                status: 'success',
                article: articleRemoved
            });
            
        });                
    },

    upload: (req, res) => {
        //configurar el modulo connect multipart router/article.js

        //recoger el fichero de la peticion
        var file_name = 'Imagen no subida...';

        if(!req.files){
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }
        //conseguir el nombre y la extension del archivo

        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\'); 

        //nombre del archivo
        var file_name = file_split[2];

        //extension del fichero
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        //comprobar la extension, solo imagenes, si es valido borrar el fichero

        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            
            //borrar el archivo subido
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'la extension de la imagen no es valida' 
                });                
            });

        }else{
            //si todo es valido, sacando la id de la url
            var articleId = req.params.id;
            //buscar el articulo, asignarle el nombre de la imagen y actualizarlo
            Article.findOneAndUpdate({_id: articleId}, {image: file_name}, {new:true}, (err, articleUpdated) =>{
                
                if(err || !articleUpdated){
                    return res.status(200).send({
                        status: 'error',
                        message: 'error al guardar la imagen del articulo'
                    });                   
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });
            });
            
        }
       
        
    }, //end uploda file

    getImage: (req, res) => {
        var file = req.params.image;
        var path_file = './upload/articles/'+file;

        // comprobar si el archivo existe
        fs.access(path_file, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).send({
                    status: "error",
                    message: "La imagen no existe !!!"
                });
            } else {
                //devolvemos el fichero, para incrustarlo en etiquetas de imagen
                return res.sendFile(path.resolve(path_file));
            }
        });                   
    },

    search: (req, res) => {
        // Sacar el string a buscar
        var searchString = req.params.search;
 
        // Find or
        Article.find({ "$or": [
            { "title": { "$regex": searchString, "$options": "i"}},
            { "content": { "$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date', 'descending']])
        .exec()
        .then( articles => {
            if (articles && articles.length>0) {
                return res.status(200).send({
                    status: 'success',
                    articles
                });
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos que coincidan con tu búsqueda.',
                    articles
                });
            }
        })
        .catch( err => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición.',
                    err
                });
            }
        });
    }

}; //end controller

module.exports = controller;
