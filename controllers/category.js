const Category = require("../models/category");
const kirilLotin = require("../service/kirilLotin");
const mongoose = require("mongoose")


const all = async (req, res) => {
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let title = req.query.title || null;
    let categories = [];
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
    categories = await Category.find({...fil })
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    const count = await Category.find({...fil }).count()
    res.status(200).json({ categories, count });
}


const allActive = async (req, res) => {
    try {
        let category = await Category.find({ status:1 }).lean()
        res.status(200).json(category);
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
            let category = await Category.findOne({_id}).lean()
            if(req.query.status) {
                category.status = parseInt(status)
            } else {
                category.status = category.status == 0 ? 1 : 0
            }
            await Category.findByIdAndUpdate(_id,category)
            let saveCategory = await Category.findOne({_id:_id}).lean()
            res.status(200).send(saveCategory)
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
        req.body.createdTime = Date.now()
        const category = await new Category({...req.body} );
        await category.validate();
        await category.save();
        let newCategory = await Category.findOne({_id:category._id}).lean()
        return res.status(201).json(newCategory);
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
        req.body.updateTime = Date.now()
        let category = await Category.findOneAndUpdate({_id:_id},{ ...req.body }, {returnDocument: 'after'});
        let saveCategory = await Category.findOne({_id:category._id}).lean();
            res.status(200).json(saveCategory);
    } else {
        res.status(500).json({message: "Не найдено id"});
    }
}


const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let category = await Category.findOne({_id:_id}).lean();
        res.status(200).json(category);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}


const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        let category = await Category.findByIdAndDelete(_id);
        res.status(200).json(_id);
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all,  allActive, changeStatus, create, update, findOne, del }