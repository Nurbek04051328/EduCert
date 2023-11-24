const Part = require("../../models/course/part");
const Course = require("../../models/course/course");
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
    let courseId = req.query.courseId || null;
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
    if (courseId) fil = {...fil, courseId};
    let content = await Part.find({...fil}).populate('courseId').sort({_id: -1})
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
    let courseId = req.query.courseId || null;
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
    if (courseId) fil = {...fil, courseId};
    let content = await Part.find({...fil }).populate('courseId').sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();

    const count = await Part.find({...fil }).limit(quantity).count()


    res.status(200).json({ content, count });
}
//
//
const allActive = async (req, res) => {
    try {
        let contents = await Part.find({ status:1 }).populate('courseId').sort({_id:-1}).lean();

        res.status(200).json(contents);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const changeStatus = async (req, res) => {
    try {
        const _id = req.params.id
        let findPart = await Part.findOne({_id:_id}).lean();
        if(!findPart) return res.status(500).json({message: "Part по этому id не найден"});
        let status = req.query.status;
        let content = await Part.findOne({_id}).lean()
        if (!content) {
            res.status(403).send({message: "Part не найдено"})
        }
        if(req.query.status) {
            content.status = parseInt(status)
        } else {
            content.status = content.status == 0 ? 1 : 0
        }
        await Part.findByIdAndUpdate(_id,content)
        let saveContent = await Part.findOne({_id:_id}).populate('courseId').lean()

        res.status(200).send(saveContent)

    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const create = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let {courseId, title } = req.body;
        let course = await Course.findOne({_id:courseId}).lean();
        console.log("coure", course)
        if(!course) return res.status(500).json({message: "Курс по этому id не найден"});
        const content = await new Part({ userId:userFunction.id, courseId, title, createdAt: Date.now() } );
        await content.validate();
        await content.save();

        let newContent = await Part.findOne({_id:content._id}).populate('courseId').lean()

        return res.status(201).json(newContent);
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
        let findPart = await Part.findOne({_id:_id}).lean();
        if(!findPart) return res.status(500).json({message: "Part по этому id не найден"});
        let {courseId, title } = req.body;
        let course = await Course.findOne({_id:courseId}).lean();
        if(!course) return res.status(500).json({message: "Курс по этому id не найден"});
        let content = await Part.findOneAndUpdate({_id:_id},{ courseId, title, updatedAt: Date.now() }, {returnDocument: 'after'});
        let savecontent = await Part.findOne({_id:_id}).populate('courseId').lean();

        res.status(200).json(savecontent);
    } else {
        res.status(500).json({message: "Не найдено id"});
    }
}
//
//
const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let findPart = await Part.findOne({_id:_id}).lean();
        if(!findPart) return res.status(500).json({message: "Part по этому id не найден"});
        let content = await Part.findOne({_id:_id}).populate('courseId').lean();

        res.status(200).json(content);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}


const del = async(req,res)=>{
    const _id = req.params.id;
    let findPart = await Part.findOne({_id:_id}).lean();
    if(!findPart) return res.status(500).json({message: "Part по этому id не найден"});
    await Part.findByIdAndDelete(_id);

    res.status(200).json(_id);
}



module.exports = { adminPanelAll, create, update, findOne, del, all, allActive, changeStatus }