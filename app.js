var bodyParser 	= require('body-parser'),
    methodOverride = require("method-override"),
    mongoose 	= require('mongoose'),
    express 	= require('express'),
    expressSanitizer 	= require('express-sanitizer'),
    app 	= express(); 

//App Config
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/restful_blog_app", {useMongoClient: true});
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body:  String,
	created: {type: Date, default: Date.now}
});

//Mongoose/Model Config
var Blog = mongoose.model("Blog", blogSchema);

//RESTful Routes
//INDEX
app.get("/", function(req,res) {
	res.redirect('/blogs');
});

app.get('/blogs', function(req, res) {
	Blog.find({}, function(err, blogs){
		if(err){
			console.log("THERE WAS AN ERROR");
		} else {
			res.render("index", {blogs: blogs});
		}
	});
});

//NEW ROUTE
app.get("/blogs/new", function(req,res) {
	res.render('new');
});

//CREATE ROUTE
app.post("/blogs", function(req,res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
		  if(err){
		    res.render("new");
		  } else {
			  res.redirect("/blogs");
			}
		});
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
      if(err){
        res.redirect("/blogs");
      } else {
        res.render("show", {blog: foundBlog});
      }

    });
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
      if(err){
        res.redirect("/blogs");
      } else {
        res.render("edit", {blog: foundBlog});
      }

    });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res) {
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
      if(err){
        res.redirect("/blogs");
      } else {
        res.redirect("/blogs/" + req.params.id);
      }

  })       
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
   //destroy blog
   Blog.findById(req.params.id, function(err, blog) {
       if(err){
         console.log(err);
       } else {
         blog.remove();
         res.redirect("/blogs");
       }   
   });
});

const port = 3000;
app.listen(port, () => console.log("SERVER IS RUNNING"));
