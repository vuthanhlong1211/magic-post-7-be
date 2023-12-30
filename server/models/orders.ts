import mongoose from 'mongoose';
const Schema = mongoose.Schema;

//orders sent from sender to receiver, both are customers
const orderSchema = new Schema({
    sender:
    {
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        code: {
            type: String,
        },
        postalCode: {
            type: String,
            required: true
        }
    }
    ,
    receiver:
    {
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        }
    }
    ,
    //need auto-generation for order code
    orderCode: {
        type: String,
        required: true,
        unique: true
    },
    // members: [mongoose.Types.ObjectId],
    type: {
        type: String,
        enum: ['Tài liệu', 'Hàng hóa'],
        required: true
    },
    content: [
        {
            content: {
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
    instructionOnFailedDelivery: {
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
        type: Number,
        required: true
    }
    ,
    receiverCharge:
    {
        type: Number,
        required: true
    }
    ,
    //add space for teller's signature or delivery point's stamp
    //reference to account of a teller
    teller: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    //add space for receiving time and receiver's signature
    status: {
        type: String,
        required: true,
        enum: ["Chờ lấy hàng", "Đang đi lấy",
            "Hủy", "Đang giao hàng", "Đã giao hàng",
            "Chuyển hoàn", "Chờ chuyển hoàn", "Không gặp khách"],

    },
    logs: {
        type: [String]
    }
});
const ORDERS = mongoose.model('Order', orderSchema);
export default ORDERS;