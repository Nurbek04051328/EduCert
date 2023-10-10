const Degree = require("../models/degree");
const DegreeTranslate = require("../models/degreeTranslate");
const kirilLotin = require("../service/kirilLotin");
const mongoose = require("mongoose");
const decoded = require("../service/decoded");
const User = require("../models/user");


const all = async (req, res) => {
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    let login = req.query.login || 'admin'
    if (login) login = login.toLowerCase()
    next = (next-1)*quantity;
    let language = req.query.language || 'uz';
    let user = await User.findOne({login: login }).lean();
    if (!user)  res.status(500).send({message: "Bunday logindagi foydalanuvchi topilmadi"})
    let degrees = await Degree.find({userId:user._id, status:1}).sort({_id:-1}).limit(quantity).skip(next).lean();
    degrees = await Promise.all(degrees.map(async item => {
        let degreeTrans = await DegreeTranslate.findOne({degreeId: item._id, language: language  })
        item.title = degreeTrans.title
        return item
    }))
    const count = await Degree.find({userId:user._id, status:1}).limit(quantity).count()
    res.status(200).json({ degrees, count });
}



// Admin panel
const adminPanelAll = async (req, res) => {
    let userFunction = decoded(req,res)
    let quantity = req.query.quantity || 20;
    let next = req.query.next || 1;
    next = (next-1)*quantity;
    console.log(req.query)
    let degrees = await Degree.find({userId:userFunction.id,}).sort({_id:-1}).limit(quantity).skip(next).lean();
    degrees = await Promise.all(degrees.map(async item => {
        let DegreeTrans = await DegreeTranslate.find({degreeId: item._id })
        item.degrees = DegreeTrans
        return item
    }))
    const count = await Degree.find({userId:userFunction.id,}).count()
    res.status(200).json({ degrees, count });
}



const allActive = async (req, res) => {
    try {
        let userFunction = decoded(req,res)
        let degrees = await Degree.find({ userId:userFunction.id, status:1 }).sort({_id:-1}).lean();
        degrees = await Promise.all(degrees.map(async item => {
            let DegreeTrans = await DegreeTranslate.findOne({degreeId: item._id })
            item.degrees = DegreeTrans
            return item
        }))
        res.status(200).json(degrees);
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
            let degree = await Degree.findOne({_id}).lean()
            if(req.query.status) {
                degree.status = parseInt(status)
            } else {
                degree.status = degree.status == 0 ? 1 : 0
            }
            await Degree.findByIdAndUpdate(_id,degree)
            let saveDegree = await Degree.findOne({_id:_id}).lean()
            let degreeTrans = await DegreeTranslate.find({degreeId: saveDegree._id })
            saveDegree.degrees = degreeTrans
            res.status(200).send(saveDegree)
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
        console.log(req.body)
        let userFunction = decoded(req,res)
        let degrees =  req.body.degrees;
        const degree = await new Degree({ userId:userFunction.id, createdAt: Date.now() } );
        await degree.validate();
        await degree.save();
        console.log("degree", degree)
        if (degrees.length > 0) {
            degrees = await Promise.all(degrees.map(async item => {
                let degreeTrans = await new DegreeTranslate({ degreeId:degree._id, title: item.title, language: item.language, createdAt: Date.now() });
                await degreeTrans.validate();
                await degreeTrans.save();
                return item
            }))
        }
        let newDegree = await Degree.findOne({_id:degree._id}).lean()
        let newDegreeTrans = await DegreeTranslate.find({degreeId:degree._id }).lean();
        newDegree.degrees = newDegreeTrans
        return res.status(201).json(newDegree);
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
        let degrees =  req.body.degrees;
        let degree = await Degree.findOneAndUpdate({_id:_id},{ updatedAt: Date.now() }, {returnDocument: 'after'});
        let saveDegree = await Degree.findOne({_id:_id}).lean();
        if (degrees.length> 0) {
            degrees = await Promise.all(degrees.map(async item => {
                let catTrans = await DegreeTranslate.findOneAndUpdate({_id:item._id},{ degreeId:degree._id, title: item.title, language: item.language, updatedAt: Date.now() },{returnDocument: 'after'});
                return item
            }))
            let saveDegreeTrans = await DegreeTranslate.find({degreeId:_id }).lean();
            saveDegree.degrees = saveDegreeTrans
        }
        res.status(200).json(saveDegree);
    } else {
        res.status(500).json({message: "Не найдено id"});
    }
}


const findOne = async (req, res) => {
    try {
        const _id = req.params.id;
        let degree = await Degree.findOne({_id:_id}).lean();
        degree.degrees = await DegreeTranslate.find({degreeId:degree._id}).lean();
        res.status(200).json(degree);
    } catch (e) {
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
}


const del = async(req,res)=>{
    if (req.params.id) {
        let _id = req.params.id;
        console.log( _id)
        let degree = await Degree.findByIdAndDelete(_id);
        console.log(degree)
        let degreeTrans = await DegreeTranslate.find({specId:degree._id}).lean();
        degreeTrans.forEach(async item => {
            await DegreeTranslate.findByIdAndDelete(item._id);
        })
        res.status(200).json(_id);
    } else {
        console.log(e);
        res.status(500).send({message: "Не найдено"});
    }
}


module.exports = { all,  allActive, changeStatus, create, update, findOne, del, adminPanelAll }