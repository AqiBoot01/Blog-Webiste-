const express = require('express')
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
 
const adminLayout = '../views/layouts/admin'
const jwtSecret = process.env.MySecret; 


router.get('/admin' ,(req, res)=>{
    const locals = {
        title: 'admin'
    }

    res.render('admin/index' ,{ locals, layout: adminLayout})
})


// authehtication middleware -------------------
const authMiddleware = (req, res, next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message: 'Unauthorized'})
    }
    try {
        const decoded =  jwt.verify(token, jwtSecret );
        req.userId = decoded.userId;
        next();


    } catch (error) {
        return res.status(401).json({message: 'Unauthorized'})

    }
}




// router.post('/admin', (req, res)=>{
//     const {username, password} = req.body;
//     console.log(req.body)
//     res.redirect('/')
// })

router.post('/admin', async (req, res)=>{
    try {
        const {username, password} = req.body;
        const user = await User.findOne({ username});
        if(!user){
            return res.status(401).json({message: 'invalied crentendials'})
        }

        const isPasswordValid =   await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(401).json({message:'invalid credentials'});
        }

        const token = jwt.sign({userId: user._id}, jwtSecret);
        res.cookie('token', token, {httpOnly: true})

        res.redirect('/admin/dashboard')

    } catch (error) {
        
    }

})


router.get('/admin/dashboard', authMiddleware, async (req, res)=>{
    try {
        const data = await Post.find();
        res.render('admin/dashboard' , {data , layout: adminLayout})

    } catch (error) {
        res.send(json({message:'failed to get data'}))
    }
})


router.get('/add-post', async (req, res)=>{
   try {
    res.render('admin/add-post', {layout: adminLayout})
   } catch (error) {
    console.log(error)
    }
    
});

router.post('/add-post', async(req, res)=>{
   try {
        try {
            const newPost = new Post({
                title : req.body.title,
                body: req.body.body
            });
            await Post.create(newPost)
            res.redirect('/admin/dashboard')
            
        } catch (error) {
            console.log(error)
        }

        } catch (error) {
            console.log(error)
    
        }    
})




router.post('/register', async (req, res)=>{
    try{
        const {username , password} = req.body
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({username, password: hashedPassword});
            res.status(201).json({message:'User Created', user})
        } catch (error) {
            if(error.code===11000){
                res.status(409).json({message:'user already exist'})
            }
            res.status(500).json({message:'internal server error'});

        }
    }
    catch (error){
        console.log(error)

    }
})



// edit-post get-----------------------------------

router.get('/edit-post/:id' , async (req, res)=>{
    try {
        const data = await Post.findById(req.params.id);
        res.render('admin/edit-post', {data, layout: adminLayout});

    } catch (error) {
        console.log(error);
        
    }
})

// edit-post get-----------------------------------

router.put('/edit-post/:id' , async (req, res)=>{
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt : Date.now()

        });

        res.redirect(`/edit-post/${req.params.id}`)

    } catch (error) {
        console.log(error);
        
    }
})



// delete button route --------------------

router.delete('/delete-post/:id', async (req, res)=>{
    try {
        await Post.deleteOne({_id: req.params.id})
        res.redirect('/admin/dashboard')
    } catch (error) {
        console.log(error)
        
    }

})



// logout router--------------------------
router.get('/logout', async (req, res)=>{
    try {
        await res.clearCookie('token');
        res.redirect('/')
    } catch (error) {
        console.log(error)
        
    }
   
})





module.exports = router;
