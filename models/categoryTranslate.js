const {Schema, model} = require('mongoose')

const categoryTranslate = new Schema({
    catId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, "Заполните category"]
    },
    title: {
        type: String,
        required: [true, "Заполните название"]
    },
    language: {
        type: String,
        required: [true, "Заполните название"]
    },
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('CategoryTranslate', categoryTranslate)
