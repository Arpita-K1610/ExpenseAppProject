
//document.getElementById('list').addEventListener('click',remove);

let flag=0;
let idtoedit=0;
var list=document.querySelector('#list');
let amount=document.querySelector('#amount');
let description=document.querySelector('#des');
let cat=document.querySelector('#category');
const pagination=document.getElementById('pagination');
let pagein;
//const observer = new MutationObserver(at); 
//observer.observe(document, { childList: true, subtree: true });

document.getElementById('Add').addEventListener('click',add);
const token=localStorage.getItem('token');



 function add(e){
    console
    
    e.preventDefault();
    console.log("hi");
    
    //var li =document.createElement('li');
    let obj={
        amount1:amount.value,
        dis:description.value,
        category:cat.value
    }
    //let myserial=JSON.stringify(obj);

    if(flag==1){
        flag=0;
        updateexpense(idtoedit,obj);

    }
    else{
        post(obj);

    }
    
}


function deleteexpense(id){
    console.log("delelte");
    const nodetodelte=document.getElementById(id);
    if(nodetodelte){
        list.removeChild(nodetodelte);
    }
   
    axios.delete(`http://3.88.226.21/expense/deleteexpense/${id}`)
    .then((result)=>console.log('deleted'))
    .catch((err)=>console.log(err));

}

function post( myserial){
    
    const token=localStorage.getItem('token');
    axios.post('http://3.88.226.21/expense/postexpense',myserial,{headers:{"Authorization":token}})
    .then((result)=>{
        console.log(result);
         showUsersOnScreen(result.data);
        


    })
    .catch((err)=>console.log(err));
}


function showUsersOnScreen(data){
    const childHTML = `<tr id=${data.id}>
    <td>${data.amount}</td>
    <td>${data.description}</td>
    <td>${data.category}</td>
    <td>
      <button onclick=deleteexpense("${data.id}")>Delete</button>
      <button onclick=editexpense("${data.id}", "${data.amount}", "${data.description}", "${data.category}")>Edit</button>
    </td>
  </tr>`;
  
    list.innerHTML=list.innerHTML+childHTML;
    

}

function editexpense(id,amount,description,category){
document.querySelector('#amount').value=amount;
document.querySelector('#des').value=description;
document.querySelector('#category').value=category;
   
    flag=1;
    idtoedit=id;
    

}

function updateexpense(id,obj){
    axios.put(`http://3.88.226.21/expense/updateexpense/${id}`,obj)
    .then((r)=>console.log('updated'))
    .catch(err=>console.log(err));
}



document.addEventListener('DOMContentLoaded',at)
function at(){
    const page=1;
    
    
        const token=localStorage.getItem('token');
        const premium=localStorage.getItem('premium');
        const prebtn=document.getElementById('premium');
        const dynamicPagination=document.getElementById('dynamicpagination');
        dynamicPagination.addEventListener('click',()=>{
            const dynamic=dynamicPagination.value;
            localStorage.setItem('dynamicPagination',dynamic);

        })

        
    
        if(premium=='true'){
            prebtn.classList.add('premium');
            const message=document.getElementById('premiumMessage');
            const div=document.getElementById('leader');
            message.innerText='You are a premium user';
            const button=`<button onclick="showleader()"class="bu" id="leaderboard">Show Leaderboard</button>`;
            //document.getElementById('preexpenses').addEventListener('click',download);
            //const showexpense=`<button onclick="showexpenses()"class="preex" id="preexpenses">Show expenses</button>`          
            div.innerHTML=button;
            axios.get('http://3.88.226.21/premium/showfiledownloaded',{headers:{"Authorization":token}})
            .then((res)=>{
                const head=document.getElementById('filehead');
                head.innerText='Previous files links'
                
                console.log(res.data.data[0].fileurl);
                for(let i=0;i<res.data.data.length;i++){
                    showfiles(res.data.data[i].fileurl,res.data.data[i].createdAt);
                }

                
            })
            .catch((err)=>console.log(err));



           
        
            
            
    
        }
        const pageSize=localStorage.getItem('dynamicPagination');
        console.log(pageSize);
        
    
       
        
       axios.get(`http://3.88.226.21/expense/getexpense?page=${page}&pageSize=${pageSize}`,{headers:{"Authorization":token}})
       .then((result)=>{
               
                console.log(result.data);
            
    
                
                for(let i=0;i<result.data.user.length;i++){
                    
                    showUsersOnScreen(result.data.user[i]);
                }
                    showPagination(result.data);
                
            })
        
        .catch(err=>console.log(err));
    
    
       
    }

document.getElementById('premium').addEventListener('click', premiumPost);

 async function  premiumPost(){
    
    
    
    const response=await axios.get('http://3.88.226.21/purchase/membership',{headers:{"Authorization":token}});
    var options={
        "key_id":response.data.key_id,
        "order_id":response.data.order.id,
        "handler":async function(response){
            console.log(response.razorpay_payment_id);
            const preResponse=await axios.post('http://3.88.226.21/purchase/updatetransactionstatus',{payment_id:response.razorpay_payment_id},{headers:{"Authorization":token}})
            localStorage.setItem('premium',preResponse.data.user);
            const premiumbtn=document.getElementById('premium');
            premiumbtn.remove();
            const message=document.getElementById('premiumMessage');
            message.innerText='You are a premium user';


            alert('you are now a premium user');
            

        }
    

    };
    const razer=new Razorpay(options);
    razer.open();
    //e.preventDefault();
    razer.on('payment.failed',function(response){
        console.log(response);
        alert('somthing went wrong');
    })

    
}
async function showleader(){
    const heading=document.getElementById('phead');
    const ul=document.getElementById('leaderlist');
    heading.innerText='Leader Board';
    const response=await axios.get('http://3.88.226.21/premium/showleaderboard')
    for(const r of response.data){
        if(r.totalamount===null){
            r.totalamount=0;
        }
        const childlist=`<li>Name-${r.name} Expense-${r.totalamount}</li>`;
        ul.innerHTML+=childlist;
        
    }


}
function download(){
    
        axios.get('http://3.88.226.21/user/download', { headers: {"Authorization" : token} })
        .then((response) => {
            
            if(response.status === 201){
               
                var a = document.createElement("a");
                a.href = response.data.fileUrl;
                a.download = 'myexpense.csv';
                a.click();
            } else {
                throw new Error(response.data.message)
            }
    
        })
        .catch((err) => {
            showError(err)
        });
    

}
function showError(err){
    document.body.innerHTML += `<div style="color:red;"> ${err}</div>`
}


//function showexpenses(){
    //window.location.href='./premium/premiumfeature.html';

//}

function showfiles(url,date){
    const list= `<tr><td>${date}</td><td><a href="${url}">${url}</a></td></tr>`;
    const parent=document.getElementById('files');
    parent.innerHTML=parent.innerHTML+list;

}



function showPagination({currentPage,hasNextPage,nextPage,hasPreviousPage,previousPage,lastPage}){
    pagination.innerHTML='';
    const btn3=document.createElement('button');
    btn3.innerHTML=currentPage;
    btn3.addEventListener('click',()=> getExpense(currentPage));
    pagination.appendChild(btn3);

    if(hasPreviousPage){
        const btn=document.createElement('button');
        btn.innerHTML=previousPage;
        btn.addEventListener('click',()=> getExpense(previousPage))
        pagination.appendChild(btn);
    }

    if(hasNextPage)
    {
        const btn2=document.createElement('button');
        btn2.innerHTML=nextPage;
        btn2.addEventListener('click',()=> getExpense(nextPage));
        pagination.appendChild(btn2);
    }
    

}

async function getExpense(page){
    try{list.innerHTML='';
    const pageSize=localStorage.getItem('dynamicPagination');
        
        const res=await axios.get(`http://3.88.226.21/expense/getexpense?page=${page}&pageSize=${pageSize}`,{ headers: {"Authorization" : token} })
        console.log(res);
        for(let i=0;i<res.data.user.length;i++){
        showpagination(res.data.user[i]);
        
    }
    

    }
    catch(err){
        console.log(err);
    }
    
}
function showpagination(data){
    
    const childHTML = `<tr id=${data.id}>
    <td>${data.amount}</td>
    <td>${data.description}</td>
    <td>${data.category}</td>
    <td>
      <button onclick=deleteexpense("${data.id}")>Delete</button>
      <button onclick=editexpense("${data.id}", "${data.amount}", "${data.description}", "${data.category}")>Edit</button>
    </td>
  </tr>`;
  
  list.innerHTML=list.innerHTML+childHTML;
} 