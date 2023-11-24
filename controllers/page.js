const Page = require("../models/page");
const kirilLotin = require("../service/kirilLotin");
const mongoose = require("mongoose");
const decoded = require("../service/decoded");
const fs = require('fs')

const all = async (req, res) => {
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let language = req.query.language || 'uz';
    let slug = req.query.slug || null;
    console.log(req.query)
    let fil = {};
    if (slug) fil = {...fil, slug};
    let pages = await Page.find({ ...fil, language:language }).sort({_id:-1}).limit(quantity).skip(next).lean();



    const count = await Page.find({language:language, slug: slug}).count()
    res.status(200).json({ pages, count });
}


// // Admin panel
const adminPanelAll = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    console.log(req.query)
    let pages = await Page.find({userId:userFunction.id,}).sort({_id:-1}).limit(quantity).skip(next).lean();

    const count = await Page.find({userId:userFunction.id,}).count()
    res.status(200).json({ pages, count });
}


const allActive = async (req, res) => {
    try {
        let pages = await Page.find({ status:1 }).sort({_id:-1}).lean();

        res.status(200).json(pages);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const changeStatus = async (req, res) => {
    try {
        if (req.params.id) {
            const _id = req.params.id
            let status = req.query.status;
            let page = await Page.findOne({_id}).lean()
            if(req.query.status) {
                page.status = parseInt(status)
            } else {
                page.status = page.status == 0 ? 1 : 0
            }
            await Page.findByIdAndUpdate(_id,page)
            let savePage = await Page.findOne({_id:_id}).lean()
            res.status(200).send(savePage)
        } else {
            res.ststus(400).send({message: "Id не найдено"})
        }
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const create = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let { title, text, img, slug, language } = req.body;
        const page = await new Page({ userId:userFunction.id, title, text, img, slug, language, createdAt: Date.now() } );
        await page.validate();
        await page.save();
        let newPage = await Page.findOne({_id:page._id}).lean()
        return res.status(201).json(newPage);
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            const errors = {};
            for (let key in error.errors) {
                errors[key] = error.errors[key].message;
            }
            res.status(400).send(errors);
        } else {
            res.status(500).send(error);
        }
    }
}


const update = async (req, res) => {
    if (req.body._id) {
        let { _id, title, text, img, slug, language } = req.body;
        let page = await Page.findOneAndUpdate({ _id:_id},{ title, text, img, slug, language, updatedAt: Date.now() }, {returnDocument: 'after'});
        let savePage = await Page.findOne({_id:page._id}).lean()
        res.status(200).json(savePage);
    } else {
        res.status(500).json({message: "Не найдено id"});
    }
}
//
//
const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let page = await Page.findOne({_id:_id}).lean();
        if (!page) {
            res.status(403).send({message: "Page не найдено"})
        }
        res.status(200).json(page);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}


const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let page = await Page.findByIdAndDelete(_id);
        // if (news.img.length > 0) {
        //     let delFiles = news.img[0]
        //     if (fs.existsSync(delFiles)) {
        //         fs.unlinkSync(delFiles)
        //     }
        // }

        res.status(200).json(_id);
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}



const createPhoto = async  (req,res) =>{
    if (req.files) {
        let file = req.files.file
        console.log("files",req.files)
        uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        filepath = `files/page/${uniquePreffix}_${file.name}`
        await file.mv(filepath)
        res.status(200).send(filepath)
    }

}

// delete Img
const deleteImg = async (req,res)=>{

    let delFiles = req.body.file
    if (fs.existsSync(delFiles)) {
        fs.unlinkSync(delFiles)
    }
    res.status(200).send({message: "Успешно"})
}



// module.exports = { all,  allActive, changeStatus, create, update, findOne, del, adminPanelAll, createPhoto, deleteImg }
module.exports = { all, adminPanelAll, changeStatus, del, allActive, create, update, findOne, createPhoto, deleteImg }