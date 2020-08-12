const mongoose = require('mongoose')
const Schema = mongoose.Schema

//create schema
const ShipInfoSchema = new Schema({
    mmsi:{
        type:String,
        required: true
    },
    imo:{
        type:String,
        required: true
    },
    name:{
        type:String,
        required: true
    },
    callsign:{
        type:String,
        required: true
    },
    shiptype:{
        type:String,
        required: true
    },
    length:{
        type:String,
        required: true
    },
    width:{
        type:String,
        required: true
    },
    draught:{
        type:Number,
        required: true
    }
})

module.exports = shipinfo = mongoose.model('shipinfo',ShipInfoSchema,'shipinfo')