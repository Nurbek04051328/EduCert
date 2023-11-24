const News = require("../models/news");
const kirilLotin = require("../service/kirilLotin");
const mongoose = require("mongoose");
const decoded = require("../service/decoded");
const fs = require('fs')

const all = async (req, res) => {
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let language = req.query.language || 'uz';
    console.log(req.query)
    let news = await News.find({language:language}).sort({_id:-1}).limit(quantity).skip(next).lean();

    const count = await News.find().count()
    res.status(200).json({ news, count });
}


// Admin panel
const adminPanelAll = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    console.log(req.query)
    let news = await News.find({userId:userFunction.id,}).sort({_id:-1}).limit(quantity).skip(next).lean();

    const count = await News.find({userId:userFunction.id,}).count()
    res.status(200).json({ news, count });
}



const allActive = async (req, res) => {
    try {
        let specialties = await News.find({ status:1 }).sort({_id:-1}).lean();

        res.status(200).json(specialties);
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
            let news = await News.findOne({_id}).lean()
            if(req.query.status) {
                news.status = parseInt(status)
            } else {
                news.status = news.status == 0 ? 1 : 0
            }
            await News.findByIdAndUpdate(_id,news)
            let saveNews = await News.findOne({_id:_id}).lean()
            res.status(200).send(saveNews)
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
        console.log(req.body)
        let { title, text, img, language } = req.body;
        const news = await new News({ userId:userFunction.id, title, text, img, language, createdAt: Date.now() } );
        await news.validate();
        await news.save();
        let newNews = await News.findOne({_id:news._id}).lean()
        return res.status(201).json(newNews);
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
        let { _id, title, text, img, language } = req.body;
        let news = await News.findOneAndUpdate({ _id:_id},{ title, text, img, language, updatedAt: Date.now() }, {returnDocument: 'after'});
        let saveNews = await News.findOne({_id:news._id}).lean()
        res.status(200).json(saveNews);
    } else {
        res.status(500).json({message: "Не найдено id"});
    }
}


const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let news = await News.findOne({_id:_id}).lean();
        if (!news) {
            res.status(403).send({message: "News не найдено"})
        }
        res.status(200).json(news);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}


const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let news = await News.findByIdAndDelete(_id);
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
        filepath = `files/img/${uniquePreffix}_${file.name}`
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



module.exports = { all,  allActive, changeStatus, create, update, findOne, del, adminPanelAll, createPhoto, deleteImg }