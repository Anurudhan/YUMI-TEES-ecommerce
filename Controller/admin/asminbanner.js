const Banner = require('../../model/banner');
const upload = require("../../middleware/multer");
const MESSAGES = require('../../util/messages');
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
    },
    AddBanner: async (req,res)=>{
        try{
            const imgFiles = req?.files
            console.log(req.files);
            const details = req.body
            console.log("erytwew");
            
            
            let bannerimage = imgFiles.bannerimage[0].filename
            console.log("fg gewrhgffewdahfgcsadfhgasdfghjasd");
            const bannerDtls = { ...details, bannerimage }
            
            console.log("vsdahgsda");
            const bannerExist = await Banner.findOne({ bannername: req.body.bannername })
            console.log("fuck u");

            if (!bannerExist) {

                req.session.successMessage = MESSAGES.BANNER.SUCCESS.ADDED;
                await Banner.create(bannerDtls)
                res.redirect('/admin/banner')
            } else {
                await Banner.updateOne({ bannername: req.body.bannername }, { $set: { bannerimage: bannerimage } })
                req.session.successMessage = MESSAGES.BANNER.SUCCESS.REPLACED;;
                res.redirect('/admin/banner')
            }
        }
        catch(err){
            console.log(err);
        }
    }
}