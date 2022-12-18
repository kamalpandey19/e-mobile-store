var express = require('express');
var router = express.Router();
var User = require('../models/user');
// const cookieParser = require('cookie-parser')

// router.use(cookieParser());
router.post('/hello',(req,res)=>{
	res.json({message:'hello world'})
})

// router.get('/register', function (req, res, next) {
// 	return res.render('index.ejs');
// });


router.post('/register', function(req, res, next) {
	var personInfo = req.body;


	if(!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf){
		res.json({"Error":"Some Data is missing"});
	} else {
		if (personInfo.password === personInfo.passwordConf) {

			User.findOne({email:personInfo.email},function(err,data){
				if(!data){
					var c;
					User.findOne({},function(err,data){
						if (data) {
							c = data.unique_id + 1;
						}else{
							c=1;
						}

						var newPerson = new User({
							unique_id:c,
							email:personInfo.email,
							username: personInfo.username,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf
						});

						newPerson.save(function(err, Person){
							if(err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({_id: -1}).limit(1);
					res.json({"Success":"You are regestered,You can login now."});
				}else{
					res.json({"Error":"Email is already used."});
				}

			});
		}else{
			res.json({"Error":"password is not matched"});
		}
	}
});

// router.get('/login', function (req, res, next) {
// 	return res.render('login.ejs');
// });

router.post('/login', function (req, res, next) {
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		if(data){
			if(data.password==req.body.password){
				//console.log("Done Login");
				req.session.userId = data.unique_id;
				// res.cookie(`token`,data.unique_id);
				//console.log(req.session.userId);
				res.json({"Success":true,
				"message":"user logged in successs",
			userInfo:{
				username:data.username,
				email:data.email
			}});
				
			}else{
				res.json({"Success":false,
				"message":"Wrong password!"});
			}
		}else{
			res.json({"Success":false,
			"message":"This Email Is not regestered!"});
		}
	});
});

router.get('/profile', function (req, res, next) {
	console.log("profile");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/');
		}else{
			//console.log("found");
			res.json(data)
			// return res.render('data.ejs', {"name":data.username,"email":data.email});
		}
	});
});

router.get('/logout', function (req, res, next) {
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});

router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});

router.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		console.log(data);
		if(!data){
			res.send({"Success":"This Email Is not regestered!"});
		}else{
			// res.send({"Success":"Success!"});
			if (req.body.password==req.body.passwordConf) {
			data.password=req.body.password;
			data.passwordConf=req.body.passwordConf;

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					console.log('Success');
					res.send({"Success":"Password changed!"});
			});
		}else{
			res.send({"Success":"Password does not matched! Both Password should be same."});
		}
		}
	});
	
});

module.exports = router;