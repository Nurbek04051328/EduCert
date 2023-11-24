const fs = require('fs');



// upload
const create = async  (req,res) =>{
    if (req.files) {
        let file = req.files.file
        uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        filepath = `files/${uniquePreffix}_${file.name}`
        await file.mv(filepath)
        res.status(200).send(filepath)
    }

}

// delete
const del = async (req,res)=>{

    let delFiles = req.body.file
    if (fs.existsSync(delFiles)) {
        fs.unlinkSync(delFiles)
    }
    res.status(200).send({message: "Успешно"})
}



module.exports = { create, del }