import mongoose from 'mongoose';
const Schema = mongoose.Schema;

//orders sent from sender to receiver, both are customers
const orderSchema = new Schema({
    senderInfo: 
        {
            senderName:{
                type: String,
                required: true
            },
            senderAddress:{
                type: String,
                required: true
            },
            senderPhoneNumber:{
                type: String,
                required: true
            },
            senderCode:{
                type: String,
            },
            senderPostalCode: {
                type: String,
                required: true
            }
        }
    ,
    receiverInfo: 
        {
            receiverName:{
                type: String,
                required: true
            },
            receiverAddress:{
                type: String,
                required: true
            },
            receiverPhoneNumber:{
                type: String,
                required: true
            },
            receiverPostalCode: {
                type: String,
                required: true
            }
        }
    ,
    //need auto-generation for order code
    orderCode:{
        type: String,
        required: true,
        unique: true
    },
    // members: [mongoose.Types.ObjectId],
    type: {
        type: String,
        enum: ['Tài liệu','Hàng hóa'],
        required: true
    },
    content:[
        {
            content:{
                type: String
            },
            count: {
                type: Number
            },
            value: {
                type: Number
            },
            //might need type changes
            attachedDocument: {
                type: String
            }
        }
    ]
    ,
    instructionOnFailedDelivery:{
        type: String,
        enum: ['Chuyển hoàn ngay',
        'Gọi điện cho người gửi/BC gửi',
         ' Hủy', 'Chuyển hoàn trước ngày',
          'Chuyển hoàn khi hết thời gian lưu trữ']
    },
    //commit should be fixed so no field for that
    timestamp: {
        type: Date,
        default: Date.now()
    },
    //add space for sender's signature
    fee: 
        {
            type: Number,
            required: true
        }
    ,
    weight: 
        {
            grossWeight:{
                type: Number,
                required: true
            },
            volumeWeight:{
                type: Number,
                required: true
            }
        }
    ,
    receiverCharge: 
        {
            type: Number,
            required: true
        }
    ,
    businessNote:{
        type: String
    },
    //add space for teller's signature or delivery point's stamp
    //reference to account of a teller
    teller:{
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    //add space for receiving time and receiver's signature
    status:{
        type: String,
        enum: ["Chờ lấy hàng", "Đang đi lấy",
        "Hủy", "Đang giao hàng", "Đã giao hàng",
        "Chuyển hoàn", "Chờ chuyển hoàn", "Không gặp khách"],
        logs: [
            {
                logTimestamp: {
                    type: Date,
                    required: true
                },
                logMessage: {
                    type: String,
                    required: true
                }
            }
        ]
    }
});
const ORDERS = mongoose.model('Order', orderSchema);
export default ORDERS;