const Razorpay=require('razorpay');
const order=require('../model/orders');

 

exports.purchasePremium= async (req,res,next)=>{
    try{
        var rzp=new Razorpay({
            key_id:process.env.RAZORPAY_KEY_ID,
            key_secret:process.env.RAZORPAY_KEY_SECRET
        })
        const amount=2500;
        rzp.orders.create({amount,currency:"INR"},(err,order)=>{
                if(err){
                    console.log('in rzp.orders.create');
                    throw new Error(JSON.stringify(err));
                }
                req.user.createOrder({orderid:order.id,status:'PENDING'})
                .then(()=>{return res.status(201).json({order,key_id:rzp.key_id})})
                .catch(err=>{throw new Error(err)});


        })



    }
    catch(err){
        console.log(err);
        res.status(403).json({message:'something went wrong',error:err})
    }

}

exports.updateTransaction= async (req,res)=>{
    try{

        console.log('payment id=================='+req.body.payment_id);

        
        const updatedTransaction=await order.update({paymentid:req.body.payment_id,status:'SUCCESS'},{where:{userId:req.user.id}})
        console.log(updatedTransaction);
        req.user.update({ispremiumuser:true})
        .then(()=>{return res.status(202).json({sucess:true,message:"Transaction Successful",user:req.user.ispremiumuser})})
        .catch(err=>console.log(err));
        
        

    }
    catch(err){
        console.log(err);

    }

}