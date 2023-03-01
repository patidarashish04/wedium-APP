const { createOrders, getOrderByid, getAllOrder, updateOrderById, deleteOrderById } = require('../Order/function');

// GET Order
const createNewOrder = async (req, res, next) => {  
    try {
        const body = req.body;
        console.log('--------body-----------', body)
        // Validate Order input
        if (!(body.bookingTime && body.phone)) {
            res.status(404).json(" phone and bookingTime Required");
        }
        const Order = await createOrders(body);
        res.status(200).json({ data: Order , message: "success" });
    } catch (error) {
        console.log("ERROR", error);
    }
}
// retrieve and return all Order
const getOrderList = async (req, res, next) => {
        getAllOrder()
            .then(Order => {
                res.status(200).json({
                    data: Order,
                    success: true,
                    message: null
                })
            })
            .catch(err => {
                res.status(500).json({ message: err.message || "Error Occurred while retriving Order information" })
                next(err);
            })
}

// retrive and return a single Order
const getSingleOrder = async (req, res, next) => {
    const id = req.params.id;
    getOrderByid(id)
        .then(async (category) => {
            try {
                if (!category && category.id) {
                    res.status(404).json({ message: "Not found Order with id " + id })
                } else {
                    res.json(category)
                }
            } catch (err) {
                res.status(500).json({ message: "Error retrieving Order with id " + id })
            }
        })
        .catch((err) => res.status(500).json(err));
}

// update Order
const updateOrder = async (req, res, next) => {
    const data = req.body;
    if (!data) {
        return res
            .status(400)
            .json({ message: "Data to update can not be empty" })
    }
    const id = req.params.id;
    await updateOrderById(id, data)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Update Order with ${id}. Maybe Order not found!` })
            } else {
                res.status(200).json({ message: " Successfully Updated Order information" });
            }
        })
        .catch(err => {
            res.status(500).json({ message: "Error Update Order information" })
        })
}

// delete Order
const deleteOrder = async (req, res, next) => {
    const id = req.params.id;
    await deleteOrderById(id)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` })
            } else {
                res.json({
                    message: "Order was deleted successfully!"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "Could not delete Order with id=" + id
            });
        });
}

// assign vendor to order
const assignVendorToOrder = async (req, res, next) => {  
    try {
        const vendorId = req.body.vendorId;
        const orderId = req.body.orderId;
        // Validate Order input
        if (!(body.vendorId && body.orderId)) {
            res.status(404).json("vendorId and orderId Required");
        }
        const Order = await createOrders(body);
        res.status(200).json({ data: Order , message: "success" });
    } catch (error) {
        console.log("ERROR", error);
    }
}

//  UPDATE THE STATUS OF ORDER 
//OPEN , PENDING , COMPLETED , CANCELED 
const updateOrderStatus = async (req, res, next) => {  
    try {
        const reqOrderStatus = req.body.orderStatus;
        const orderId = req.query.orderId;
        const vendorId = req.body.vendorId;
        const status = await getOrderByid(orderId)
        // console.log('------status-------', status)

        if( req.query.action === 1  && reqOrderStatus === 'CANCELED' ){

        }
        if(status.orderStatus === 'COMPLETED' || status.orderStatus === 'CANCELED'){
            let statusData = ''
            if(status.orderStatus === 'COMPLETED') {
                statusData = status.completedDate
            }
            if(status.orderStatus === 'CANCELED') {
                statusData = status.canceledDate
            }
            //ToDO return the completedDate return the CANCELEDDate
            return res.status(200).json({ data: { statusData, orderStatus: status.orderStatus } , message: "success" });
        }

        // TO CHECK VENDER ID IS ASSIGN OR NOT
        if(vendorId && status.orderStatus === 'OPEN' ) {
            //TODO change the status in pending
            console.log('-------status.orderStatus--------', status.orderStatus)
            // const condition =  { vendorId, orderStatus, otp }
            const condition =  { vendorId, orderStatus }
            await updateOrderById(orderId, condition )
            //TODO generate the OTP and save the OTP in DB
            return res.status(200).json({ message: "status Updated successfully" });
        }
        if(reqOrderStatus === 'COMPLETED' || reqOrderStatus === 'CANCELED') {
            let statusDate = ''
            if(reqOrderStatus === 'COMPLETED') {
                statusDate = Date.now()
            }
            if(reqOrderStatus === 'CANCELED') {
                statusDate = Date.now()
            }
            const condition =  { vendorId, orderStatus: reqOrderStatus, statusDate }
            console.log('--------condition----------', condition)
            await updateOrderById(orderId, condition )
           return res.status(200).json({  message: "status Updated successfully" });
            //TODO to update the completedDate in  DB an change the status  
             //TODO to update the CANCELEDDate in  DB an change the status  
        }

        
    } catch (error) {
        console.log("ERROR", error);
    }
}
module.exports = {
    createNewOrder,
    getOrderList,
    getSingleOrder,
    updateOrder,
    deleteOrder,
    assignVendorToOrder,
    updateOrderStatus
};

