const {Schema, model} = require('mongoose')

const course = new Schema({
    userId: String,
    img: {
        type: Array,
    },
    // Sarlavhasi
    title: {
        type: String,
        required: [true, "Заполните название"]
    },
    // Qisqa tasnifi
    desc: {
        type: String,
        required: [true, "Заполните description"]
    },
    // Kurs matni
    text: {
        type: String,
        required: [true, "Заполните text"]
    },
    // Kurs mobaynida o’quvchilar nimalarni o’rganishadi ?
    learn: {
        type: String,
        required: [true, "Заполните learn"]
    },
    // Talablar
    request: {
        type: String,
        required: [true, "Заполните request"]
    },
    // Kurs darajasi
    degree: {
        type: Schema.Types.ObjectId,
        ref: 'Degree',
        required: [true, "Заполните degree"]
    },
    // Kurs tili
    language: {
        type: String,
        required: [true, "Заполните language"]
    },
    // Kurs turkumi
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, "Заполните category"]
    },
    // Kurs mentori
    mentor: {
        type: Schema.Types.ObjectId,
        ref: 'Mentor',
        required: [true, "Заполните mentor"]
    },
    price: {
        type: Number,
        required: [true, "Заполните price"]
    },
    rates: {
        type: Array,
    },
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Course', course)