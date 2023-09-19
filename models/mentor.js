const {Schema, model} = require('mongoose')

const  mentor = new Schema({
    user: {
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    name: {
        type: String,
        required: [true, "Заполните Имя"]
    },
    lname: {
        type: String,
        required: [true, "Заполните Фамилия"]
    },
    special: {
        type: String,
        required: [true, "Заполните специальность"]
    },
    phone: {
        type: String,
        required: [true, "Заполните номер телефона"],
    },
    telegram: {
        type: String,
    },
    avatar: {
        type: Array,
    },
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Mentor', mentor)