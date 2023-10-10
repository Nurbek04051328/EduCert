const Category = require("../models/category");
const CategoryTranslate = require("../models/categoryTranslate");
const User = require("../models/user");
const decoded = require("../service/decoded");
const kirilLotin = require("../service/kirilLotin");
const mongoose = require("mongoose");
const fs = require('fs');


const all = async (req, res) => {
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    let login = req.query.login || 'admin'
    if (login) login = login.toLowerCase()
    next = (next-1)*quantity;
    let language = req.query.language || 'uz';
    let user = await User.findOne({login: login }).lean();
    if (!user)  res.status(500).send({message: "Bunday logindagi foydalanuvchi topilmadi"})
    let categories = await Category.find({userId:user._id, status:1}).sort({_id:-1}).limit(quantity).skip(next).lean();
    categories = await Promise.all(categories.map(async item => {
        let categoryTrans = await CategoryTranslate.findOne({catId: item._id, language: language })
        item.title = categoryTrans.title
        return item
    }))
    const count = await Category.find({userId:user._id, status:1}).limit(quantity).count()
    res.status(200).json({ categories, count });
}



// Admin panel
const adminPanelAll = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    let title = req.query.title || null;
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
    let categoryTrans = await CategoryTranslate.find({...fil })
    let categories = await Category.find({userId:userFunction.id, '_id': {$in: categoryTrans.map(val => val.catId)}})
        .sort({_id:-1})
        .limit(quantity)
        .skip(next).lean();
    const count = await Category.find({userId:userFunction.id, '_id': {$in: categoryTrans.map(val => val.catId)}}).limit(quantity).count()

    categories = await Promise.all(categories.map(async cat => {
        cat.categories = await CategoryTranslate.find({catId: cat._id});
        return cat
    }))
    res.status(200).json({ categories, count });
}


const allActive = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let categories = await Category.find({ userId:userFunction.id, status:1 }).sort({_id:-1}).lean();
        categories = await Promise.all(categories.map(async item => {
            let categoryTrans = await CategoryTranslate.find({catId: item._id })
            item.categories = categoryTrans
            return item
        }))
        res.status(200).json(categories);
    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const changeStatus = async (req, res) => {
    try {
        const _id = req.params.id
        let status = req.query.status;
        let category = await Category.findOne({_id}).lean()
        if (!category) {
            res.status(403).send({message: "Категория не найдено"})
        }
        if(req.query.status) {
            category.status = parseInt(status)
        } else {
            category.status = category.status == 0 ? 1 : 0
        }
        await Category.findByIdAndUpdate(_id,category)
        let saveCategory = await Category.findOne({_id:_id}).lean()
        let categoryTrans = await CategoryTranslate.find({catId: saveCategory._id })
        saveCategory.categories = categoryTrans
        res.status(200).send(saveCategory)

    } catch (e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
}


const create = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let categories = req.body.categories;
        let icon = req.body.icon
        const category = await new Category({ userId:userFunction.id, icon, createdAt: Date.now() } );
        await category.validate();
        await category.save();
        if (categories.length > 0) {
            categories = await Promise.all(categories.map(async item => {
                let catTrans = await new CategoryTranslate({ catId:category._id, title: item.title, language: item.language, createdAt: Date.now() });
                await catTrans.validate();
                await catTrans.save();
                return item
            }))
        }
        let newCategory = await Category.findOne({_id:category._id}).lean()
        let newCategoryTrans = await CategoryTranslate.find({catId:category._id}).lean();
        newCategory.categories = newCategoryTrans
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
        let categories = req.body.categories;
        let icon = req.body.icon;
        let findCategory = await Category.findOne({_id:_id}).lean();
        if (icon) {
            findCategory.icon = icon
        }
        let category = await Category.findOneAndUpdate({_id:_id},{ icon:findCategory.icon, updatedAt: Date.now() }, {returnDocument: 'after'});
        let saveCategory = await Category.findOne({_id:_id}).lean();
        if (categories) {
            categories = await Promise.all(categories.map(async item => {
                let catTrans = await CategoryTranslate.findOneAndUpdate({_id:item._id},{ catId:category._id, title: item.title, language: item.language, updatedAt: Date.now() },{returnDocument: 'after'});
                return item
            }))
            let saveCategoryTrans = await CategoryTranslate.find({catId:_id}).lean();
            saveCategory.categories = saveCategoryTrans
        }
        res.status(200).json(saveCategory);
    } else {
        res.status(500).json({message: "Не найдено id"});
    }
}


const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let category = await Category.findOne({_id:_id}).lean();
        if (!category) {
            res.status(403).send({message: "Категория не найдено"})
        }
        category.categories = await CategoryTranslate.find({catId:category._id}).lean();
        res.status(200).json(category);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}


const del = async(req,res)=>{
    const _id = req.params.id;
    let findCategory = await Category.findOne({_id:_id}).lean();
    if (!findCategory) {
        res.status(403).send({message: "Категория не найдено"})
    }
    let category = await Category.findByIdAndDelete(_id);
    let categoryTrans = await CategoryTranslate.find({catId:category._id}).lean();
    categoryTrans.forEach(async item => {
        let category = await CategoryTranslate.findByIdAndDelete(item._id);
    })
    if (category.icon) {
        let delFiles = category.icon
        if (fs.existsSync(delFiles)) {
            fs.unlinkSync(delFiles)
        }
    }
    res.status(200).json(_id);
}


// upload Img

const createPhoto = async  (req,res) =>{
    if (req.files) {
        let file = req.files.file
        console.log("files",req.files)
        uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        filepath = `files/icon/${uniquePreffix}_${file.name}`
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