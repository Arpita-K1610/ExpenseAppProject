const Sequelize=require('sequelize');
const sequelize=require('../util/database');
const forgot=sequelize.define('ForgotPasswordRequests',{
    id:{
        type:Sequelize.UUID,
        allowNull:false,
        primaryKey:true
},

isactive:{
    type:Sequelize.BOOLEAN
}

})
module.exports=forgot;