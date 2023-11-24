const Part = require("../../models/course/part");
const Chapter = require("../../models/course/chapter");
const User = require("../../models/user");
const decoded = require("../../service/decoded");
const kirilLotin = require("../../service/kirilLotin");
const mongoose = require("mongoose");
const fs = require('fs');


const all = async (req, res) => {
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next - 1) * quantity;
    let title = req.query.title || null;
    let partId = req.query.partId || null;
    let fil = {};
    let othername = kirilLotin.kirlot(title)
    if (title) {
        fil = {
            ...fil, $or: [
                {'title': {$regex: new RegExp(title.toLowerCase(), 'i')}},
                {'title': {$regex: new RegExp(othername.toLowerCase(), 'i')}},
            ]
        }
    }
    if (partId) fil = {...fil, partId};
    let content = await Chapter.find({...fil}).populate('partId').sort({_id: -1})
        .limit(quantity)
        .skip(next).lean();


    res.status(200).json(content);


}
// Admin panel
const adminPanelAll = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let title = req.query.title || null;
    let partId = req.query.partId || null;
    let fil = {};
    let othername = kirilLotin.kirlot(title)
    if (title) {
        fil = {
            ...fil, $or: [
                {'title': {$regex: new RegExp(title.toLowerCase(), 'i')}},
                {'title': {$regex: new RegExp(othername.toLowerCase(), 'i')}},
            ]
        }
    }
    if (partId) fil = {...fil, partId};
    let content = await Chapter.find({...fil }).populate('partId').sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();

    const count = await Chapter.find({...fil }).limit(quantity).count()


    res.status(200).json({ content, count });
}
//
//
const allActive = async (req, res) => {
    try {
        let chapters = await Chapter.find({ status:1 }).populate('partId').sort({_id:-1}).lean();

        res.status(200).json(chapters);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const changeStatus = async (req, res) => {
    try {
        const _id = req.params.id
        let status = req.query.status;
        let chapter = await Chapter.findOne({_id}).lean()
        if (!chapter) {
            res.status(403).send({message: "Chapter не найдено"})
        }
        if(req.query.status) {
            chapter.status = parseInt(status)
        } else {
            chapter.status = chapter.status == 0 ? 1 : 0
        }
        await Chapter.findByIdAndUpdate(_id,chapter)
        let saveChapter = await Chapter.findOne({_id:_id}).populate('partId').lean()

        res.status(200).send(saveChapter)

    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const create = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let {partId, title } = req.body;
        let part = await Part.findOne({_id:partId}).lean();
        if(!part) return res.status(500).json({message: "Part по этому id не найден"});
        const chapter = await new Chapter({ userId:userFunction.id, partId, title, createdAt: Date.now() } );
        await chapter.validate();
        await chapter.save();

        let newChapter = await Chapter.findOne({_id:chapter._id}).populate('partId').lean()

        return res.status(201).json(newChapter);
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
        let _id = req.body._id;
        let findChapter = await Chapter.findOne({_id:_id}).lean();
        if(!findChapter) return res.status(500).json({message: "Chapter по этому id не найден"});
        let {partId, title } = req.body;
        let part = await Part.findOne({_id:partId}).lean();
        if(!part) return res.status(500).json({message: "Part по этому id не найден"});
        let chapter = await Chapter.findOneAndUpdate({_id:_id},{ partId, title, updatedAt: Date.now() }, {returnDocument: 'after'});
        let saveChapter = await Chapter.findOne({_id:_id}).populate('partId').lean();

        res.status(200).json(saveChapter);
    } else {
        res.status(500).json({message: "Не найдено id"});
    }
}
//
//
const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let findChapter = await Chapter.findOne({_id:_id}).lean();
        if(!findChapter) return res.status(500).json({message: "Chapter по этому id не найден"});
        let chapter = await Chapter.findOne({_id:_id}).populate('partId').lean();

        res.status(200).json(chapter);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}


const del = async(req,res)=>{
    const _id = req.params.id;
    let findChapter = await Chapter.findOne({_id:_id}).lean();
    if(!findChapter) return res.status(500).json({message: "Chapter по этому id не найден"});
    await Chapter.findByIdAndDelete(_id);

    res.status(200).json(_id);
}



module.exports = { adminPanelAll, create, update, findOne, del, all, allActive, changeStatus }