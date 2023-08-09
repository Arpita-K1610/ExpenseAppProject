const Sequelize=require('sequelize');
const sequelize=require('../util/database');
const file =sequelize.define('filedownloaded',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        allowNull:false,
        primaryKey:true
    },
    fileurl:{
        type:Sequelize.STRING,
        allowNull:false
    }
   
});

module.exports=file;