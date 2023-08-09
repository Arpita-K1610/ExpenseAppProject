const expense=require('../model/expense');
const jwt=require('jsonwebtoken');
const userTabel=require('../model/user');
const sequelize=require('../util/database');
const S3Service=require('../services/S3services');
const fileDownloadTabel=require('../model/filedownloaded');



exports.addexpense= async (req,res,next)=>{
    const t= await sequelize.transaction(); 
    try{
        const token=req.header('Authorization');
    
    
    const amount=req.body.amount1;
    const des=req.body.dis;
    const category=req.body.category;

    const user=jwt.verify(token,process.env.TOKEN_COMPARE);

    const result=await expense.create({
        amount:amount,
        description:des,
        category:category,
        userId:user.userId

    },{transaction:t});
    console.log(result);
    
       
        const amountUser=await userTabel.findByPk(user.userId,{attributes:['totalamount']})
            console.log("amount user----"+amountUser.dataValues.totalamount);
            console.log('type==='+typeof amount);
            const amountParse=parseInt(amount);
            
            amountUser.dataValues.totalamount+=amountParse;
            console.log("total amount="+amountUser.dataValues.totalamount);
            await userTabel.update({totalamount:amountUser.dataValues.totalamount},{where:{id:user.userId},transaction:t})
            //console.log("expense-----------"+expenseData);
            await t.commit();
            const expenseData =await expense.findByPk(result.dataValues.id,{ attributes : ['id','amount','description','category']})
            console.log(expenseData);
            res.send(expenseData.dataValues);
            }
    
    
    catch(err){
        t.rollback()
        .then(()=>{console.log(err);
            res.status(500).send({ message: 'An error occurred while adding the expense.' })})
        .catch((err)=>console.log(err));
        
        
        


}
}





exports.removeexpense= async (req,res,next)=>{
    const t= await sequelize.transaction(); 
    try{
        const idTodelete=req.params.id;
        const amount=await expense.findOne({where :{id:idTodelete},attributes:['amount','userId']})
        await expense.destroy({where: {id:idTodelete },transaction:t})
        
        const totalamount=await userTabel.findByPk(amount.dataValues.userId,{attributes:['totalamount']})
        console.log('type==='+typeof amount);
        console.log(totalamount);
        


        const newamount=totalamount.dataValues.totalamount-amount.dataValues.amount;

        await userTabel.update({totalamount:newamount},{where:{id:amount.dataValues.userId},transaction:t})
        await t.commit();

        console.log('deleted');
        res.send('deleted sucessful')
        
}
catch(err){
    await t.rollback();
    console.log(err);
    return res.status(500).json({success:'fail'});

}
    
}



exports.updateexpense=(req,res,next)=>{
    const IdToUpdate=req.params.id;
    console.log(IdToUpdate);
    const dataToUpdate=req.body;
    console.log(dataToUpdate);
    expense.update({
        amount:dataToUpdate.amount1,
        description:dataToUpdate.dis,
        category:dataToUpdate.category
    },
    {where:{id:IdToUpdate}}
    )
    .then(result=>{console.log('successfully updated'); res.send("updated")})
    .catch(err=>console.log(err));

}


exports.getexpense=(req,res,next)=>{
const items_perpage=+req.query.pageSize;
console.log("helllo i am in get===="+req.user.id);
const page=+req.query.page||1;
let totalItems;

expense.count()
.then((total)=>{
    totalItems=total;
    return expense.findAll({where:{userId:req.user.id},attributes:['id','amount','description','category']
    ,offset:(page-1)*items_perpage,limit:items_perpage});


})
    .then(userdata=>{
        console.log('users are====='+userdata)
        

        return res.json({user:userdata,currentPage:page,hasNextPage:items_perpage*page<totalItems,nextPage:page+1,hasPreviousPage:page>1,previousPage:page-1,lastPage:Math.ceil(totalItems/items_perpage),});
    })
    .catch(err=>console.log(err));
}



exports.download=async (req,res,next)=>{
    const t= await sequelize.transaction(); 

    try{
        const expenses=await expense.findAll({where:{userId:req.user.id}});
    //console.log(expenses);
    const StringExpenses=JSON.stringify(expenses);

    const userid=req.user.id;
    const fileName=`Expense${userid}/${new Date()}.txt`;
    const fileUrl= await S3Service.uploadToS3(StringExpenses,fileName);
    await fileDownloadTabel.create({fileurl:fileUrl,userId:req.user.id},{transaction:t});
    await t.commit();

    res.status(201).json({fileUrl,success:true});
    }
    catch(err){
        await t.rollback();
        console.log(err);
        res.status(500).json({fileUrl:'',success:false,err:err})
    }
    




    
}


exports.showfiledownloaded= async (req,res,next)=>{
    try{
        const files=await fileDownloadTabel.findAll({where:{userId:req.user.id},attributes:['fileurl','createdAt']})
        
        res.status(201).json({data:files});

    }
    catch(err){
        console.log(err);
        res.status(500).json({success:false});
    }
    


}