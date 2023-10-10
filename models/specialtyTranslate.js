const {Schema, model} = require('mongoose')

const specialtyTranslate = new Schema({
    specId: {
        type: Schema.Types.ObjectId,
        ref: 'Specialty',
        required: [true, "Заполните Specialty"]
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


module.exports = model('SpecialtyTranslate', specialtyTranslate)