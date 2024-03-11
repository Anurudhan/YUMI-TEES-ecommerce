const Banner = require('../model/banner');
module.exports={
    getbanner:async (req,res)=>{
        try{
            const banners = await Banner.find()

            const successMessage = req.session.successMessage;
            const errorMessage = req.session.errorMessage;
            delete req.session.successMessage;
            delete req.session.errorMessage;

            res.render('admin/banner', { banners, successMessage, errorMessage })
        }
        catch(err){
            console.log(err);
        }
    }
}