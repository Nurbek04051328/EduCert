const {Schema, model} = require('mongoose')

const news = new Schema({
    userId: String,
    title: {
        type: String,
        required: [true, "Заполните название"]
    },
    text: {
        type: String,
        required: [true, "Заполните название"]
    },
    img:{
        type:Array,
    },
    language: {
        type: String,
        required: [true, "Заполните language"]
    },
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('News', news)