const jwt = require("jsonwebtoken");
const Order = require("../../models/Order");
const OrderHistory = require("../../models/OrderHistory");
const User = require("../../models/User");
const BillingAddress = require("../../models/BillingAddress");
const UserBillingAddress = require("../../models/UserBillingAddress");
const Transaction = require("../../models/Transaction");
const Coupon = require("../../models/Coupon");
const initializeRazorpay = require("../../config/razorpay");
const Status = require("../../models/Status");
const Product = require("../../models/Product");
const ProductStock = require("../../models/ProductStock");
const config = require("../../config/createStatus");

const incrementInvoiceNumber = (lastInvoiceNumber) => {
    const [prefix, number] = lastInvoiceNumber.split("-");
    const incrementedNumber = (parseInt(number) + 1)
        .toString()
        .padStart(number.length, "0");
    return `${prefix}-${incrementedNumber}`;
};

class PaymentController {
    static createOrder = async (req, res) => {
        try {
            const {
                items,
                billingAddress,
                additional_info,
                coupon_code,
                save_address,
            } = req.body;
            const token = req.body.token;

            if (!token) {
                return res.status(400).send({
                    status: 400,
                    key: "token",
                    message: "token is required",
                });
            }

            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const user = await User.findById(payload.id);
            if (!user) return res.status(401).send("User not found");
            req.login_user = user;

            let totalAmount = 0;
            let subTotal = 0;
            let orderItems = [];
            let couponDiscount = 0;

            for (let item of items) {
                // Validate required fields
                if (!item.product_id || !item.sku || !item.quantity) {
                    return res.status(400).send({
                        status: 400,
                        key: !item.product_id
                            ? "product_id"
                            : !item.sku
                            ? "sku"
                            : "quantity",
                        message: !item.product_id
                            ? "product_id is required"
                            : !item.sku
                            ? "sku is required"
                            : "quantity is required",
                    });
                }

                const product = await Product.findById(item.product_id);
                if (!product) {
                    return res.status(400).send({
                        message: "Product not found",
                    });
                }

                // Query ProductStock
                const productStock = await ProductStock.findOne({
                    product_id: item.product_id,
                    sku: item.sku,
                });

                if (!productStock) {
                    return res.status(400).send({
                        message: `Product stock not found for product ID: ${item.product_id} with SKU: ${item.sku}`,
                    });
                }

                // Ensure stock is sufficient
                const skuIndex = productStock.sku.indexOf(item.sku);
                if (
                    skuIndex === -1 ||
                    productStock.current_stock[skuIndex] < item.quantity
                ) {
                    return res.status(400).send({
                        message: `The current stock for product ID (${item.product_id}) is only ${productStock.current_stock[skuIndex]} available.`,
                    });
                }

                // Update stock
                productStock.current_stock[skuIndex] -= item.quantity;
                await ProductStock.updateOne(
                    { _id: productStock._id },
                    {
                        $set: {
                            current_stock: productStock.current_stock,
                        },
                    }
                );

                // Calculate total price
                let totalPrice = 0;
                let specialDiscountApplied = false;
                let specialDiscountValue = null;

                if (
                    product.special_discount &&
                    product.special_discount_period &&
                    !product.variant
                ) {
                    const currentDate = new Date();
                    const [startDateString, endDateString] =
                        product.special_discount_period.split(" - ");

                    const parseDate = (dateString) => {
                        const [datePart, timePart, period] =
                            dateString.split(" ");
                        const [day, month, year] = datePart.split("/");
                        const [hour, minute] = timePart.split(":");
                        let hours = parseInt(hour, 10);
                        if (period === "PM" && hours !== 12) {
                            hours += 12;
                        }
                        if (period === "AM" && hours === 12) {
                            hours = 0;
                        }
                        return new Date(
                            `${year}-${month}-${day}T${hours
                                .toString()
                                .padStart(2, "0")}:${minute}:00Z`
                        );
                    };

                    const startDate = parseDate(startDateString);
                    const endDate = parseDate(endDateString);

                    if (currentDate >= startDate && currentDate <= endDate) {
                        totalPrice = product.special_discount * item.quantity;
                        specialDiscountApplied = true;
                        specialDiscountValue = product.special_discount;
                    } else {
                        totalPrice = product.unit_price * item.quantity;
                    }
                } else if (product.variant || item.attribute_value_id) {
                    totalPrice = productStock.price[skuIndex] * item.quantity;
                } else {
                    totalPrice = product.unit_price * item.quantity;
                }

                // Apply product base coupon discount after calculating totalAmount if discount is provided in product base
                const productCoupons = await Coupon.find({
                    product_id: item.product_id,
                    date_range: { $exists: true, $ne: null },
                    discount: { $exists: true, $ne: null },
                });

                if (productCoupons) {
                    let minDiscountCoupon = null;

                    productCoupons.forEach((coupon) => {
                        const currentDate = new Date();
                        const [startDateString, endDateString] =
                            coupon.date_range.split(" - ");

                        const parseDate = (dateString) => {
                            const [datePart, timePart, period] =
                                dateString.split(" ");
                            const [day, month, year] = datePart.split("/");
                            const [hour, minute] = timePart.split(":");
                            let hours = parseInt(hour, 10);
                            if (period === "PM" && hours !== 12) {
                                hours += 12;
                            }
                            if (period === "AM" && hours === 12) {
                                hours = 0;
                            }
                            return new Date(
                                `${year}-${month}-${day}T${hours
                                    .toString()
                                    .padStart(2, "0")}:${minute}:00Z`
                            );
                        };

                        const startDate = parseDate(startDateString);
                        const endDate = parseDate(endDateString);

                        // Check if the coupon is valid for the current date
                        if (
                            currentDate >= startDate &&
                            currentDate <= endDate
                        ) {
                            // Check if the current coupon has a smaller discount
                            if (
                                !minDiscountCoupon ||
                                coupon.discount < minDiscountCoupon.discount
                            ) {
                                minDiscountCoupon = coupon;
                            }
                        }
                    });

                    if (minDiscountCoupon) {
                        // Apply the smallest discount
                        if (minDiscountCoupon.type === "percentage") {
                            specialDiscountValue =
                                (minDiscountCoupon.discount / 100) * totalPrice;
                        } else if (minDiscountCoupon.type === "flat") {
                            specialDiscountValue = minDiscountCoupon.discount;
                        } else {
                            return res.status(400).send({
                                status: 400,
                                message: "Invalid coupon type",
                            });
                        }

                        if (specialDiscountValue > 0) {
                            totalPrice -= specialDiscountValue;
                            totalPrice = Math.max(totalPrice, 0); // Ensure total amount doesn't go below 0
                            await Coupon.updateOne(
                                { _id: minDiscountCoupon._id },
                                { $set: { is_applied: true } }
                            );
                        }
                    }
                }

                totalAmount += totalPrice;
                subTotal += totalPrice;

                const orderHistory = await OrderHistory.create({
                    order_id: null,
                    product_id: item.product_id,
                    product_name: product.product_name,
                    sku: item.sku,
                    attribute_value_id: item.attribute_value_id || [],
                    variants: item.variants
                        ? item.variants.map((v) => JSON.stringify(v))
                        : [],
                    unit_price: item.attribute_value_id
                        ? productStock.price[skuIndex]
                        : product.unit_price,
                    quantity: item.quantity,
                    special_discount: specialDiscountValue,
                    sub_total: totalPrice,
                });
                orderItems.push(orderHistory);

                await ProductStock.updateOne(
                    { _id: productStock._id },
                    {
                        $set: {
                            current_stock: productStock.current_stock,
                        },
                    }
                );
            }

            // Apply coupon discount after calculating totalAmount if coupon_code is provided
            if (coupon_code) {
                const coupon = await Coupon.findOne({
                    coupon_code,
                    date_range: { $exists: true, $ne: null },
                });
                if (!coupon) {
                    return res.status(400).send({
                        status: 400,
                        message: "Invalid coupon code",
                    });
                }

                const currentDate = new Date();
                const [startDateString, endDateString] =
                    coupon.date_range.split(" - ");

                const parseDate = (dateString) => {
                    const [datePart, timePart, period] = dateString.split(" ");
                    const [day, month, year] = datePart.split("/");
                    const [hour, minute] = timePart.split(":");
                    let hours = parseInt(hour, 10);
                    if (period === "PM" && hours !== 12) {
                        hours += 12;
                    }
                    if (period === "AM" && hours === 12) {
                        hours = 0;
                    }
                    return new Date(
                        `${year}-${month}-${day}T${hours
                            .toString()
                            .padStart(2, "0")}:${minute}:00Z`
                    );
                };

                const startDate = parseDate(startDateString);
                const endDate = parseDate(endDateString);

                if (currentDate < startDate || currentDate > endDate) {
                    return res.status(400).send({
                        status: 400,
                        message: "Coupon code expired",
                    });
                }

                if (coupon.type === "percentage") {
                    couponDiscount = (coupon.discount / 100) * totalAmount;
                } else if (coupon.type === "flat") {
                    couponDiscount = coupon.discount;
                } else {
                    return res.status(400).send({
                        status: 400,
                        message: "Invalid coupon type",
                    });
                }

                if (couponDiscount > 0) {
                    totalAmount -= couponDiscount;
                    totalAmount = Math.max(totalAmount, 0); // Ensure total amount doesn't go below 0
                    await Coupon.updateOne(
                        { coupon_code },
                        { $set: { is_applied: true } }
                    );
                }
            }

            const lastInvoiceNumber = await Order.findOne(
                {},
                { order_no: 1, _id: 0 }
            ).sort({ order_no: -1 });
            let newInvoiceNumber = "INV-0001";
            if (lastInvoiceNumber) {
                newInvoiceNumber = incrementInvoiceNumber(
                    lastInvoiceNumber.order_no
                );
            }

            let razorpayOrder;
            let paymentMode = "online";

            try {
                const razorpay = await initializeRazorpay();

                const options = {
                    amount: totalAmount * 100, // amount in the smallest currency unit
                    currency: "INR",
                    receipt: newInvoiceNumber,
                };

                razorpayOrder = await razorpay.orders.create(options);
            } catch (error) {
                paymentMode = "COD"; // Silently switch to COD if Razorpay fails
            }

            await config.createOrderStatus();
            let order_status = await Status.findOne({
                name: { $regex: new RegExp("^pending$", "i") },
                type: { $regex: new RegExp("^order$", "i") },
            });
            const order = await Order.create({
                user_id: req.login_user ? req.login_user._id : "",
                order_no: newInvoiceNumber,
                order_total_amount: totalAmount,
                order_discount_amount: couponDiscount ? couponDiscount : 0,
                coupon_code: coupon_code ? coupon_code : null,
                order_subtotal_amount: subTotal,
                additional_info: additional_info,
                status_id: order_status._id,
                payment_mode: paymentMode,
                payment_status: "unpaid",
            });

            orderItems = await Promise.all(
                orderItems.map(async (item) => {
                    item.order_id = order._id;
                    await item.save();
                    return item;
                })
            );

            // Check if _id exists in billingAddress and delete it
            if (billingAddress._id) {
                delete billingAddress._id;
            }
            const billingAddr = new BillingAddress({
                ...billingAddress,
                order_id: order._id,
            });
            await billingAddr.save();

            if (save_address) {
                const userBillingAddress = new UserBillingAddress({
                    ...billingAddress,
                    user_id: req.login_user._id,
                });
                await userBillingAddress.save();
            }

            // if payment mode is COD, then save
            if (paymentMode === "COD") {
                res.send({
                    order_id: order._id,
                    amount: totalAmount,
                    currency: "INR",
                });
            } else {
                res.send({
                    orderId: razorpayOrder.id,
                    order_id: order._id,
                    amount: totalAmount,
                    currency: "INR",
                });
            }
        } catch (error) {
            console.error("Error in order", error);
            return res.status(500).send({
                message: "Something went wrong, please try again later",
                error: error.message,
            });
        }
    };

    static checkout = async (req, res) => {
        try {
            const {
                orderId,
                payment_id,
                order_id, // For COD payments, this may be undefined or null
            } = req.body;

            // Fetch order details to get payment_mode from Order table
            const order = await Order.findById(order_id);
            if (!order) {
                return res.status(404).send({
                    message: "Order not found",
                });
            }

            // Get payment_mode and payment_status from the order
            const payment_mode = order.payment_mode;

            if (payment_mode === "COD") {
                // Handle COD case
                await config.createTransactionStatus();
                let status = await Status.findOne({
                    name: { $regex: new RegExp("^success$", "i") },
                    type: { $regex: new RegExp("^transaction$", "i") },
                });

                // create Transaction
                await Transaction.create({
                    order_id: order_id,
                    user_id: order.user_id,
                    orderId: null,
                    payment_id: payment_id,
                    signature: null,
                    amount: order.order_total_amount,
                    currency: "INR",
                    status_id: status._id,
                    payment_mode: payment_mode,
                });

                await Order.updateOne(
                    { _id: order_id },
                    {
                        $set: {
                            payment_status: "paid",
                        },
                    }
                );

                // No need to update OrderHistory in COD case
                res.send({
                    status: 200,
                    message: "Payment verified successfully",
                    orderId: orderId,
                    payment_id: payment_id,
                });
            } else {
                // Handle Razorpay or other payment mode
                await config.createTransactionStatus();
                let status = await Status.findOne({
                    name: { $regex: new RegExp("^success$", "i") },
                    type: { $regex: new RegExp("^transaction$", "i") },
                });

                // create Transaction
                await Transaction.create({
                    order_id: order_id,
                    user_id: order.user_id,
                    orderId: orderId,
                    payment_id: payment_id,
                    signature: null,
                    amount: order.order_total_amount,
                    currency: "INR",
                    status_id: status._id,
                    payment_mode: payment_mode,
                });

                await Order.updateOne(
                    { _id: order_id },
                    {
                        $set: {
                            payment_status: "paid",
                        },
                    }
                );

                await OrderHistory.updateOne(
                    { order_id: order_id },
                    {
                        $set: {
                            orderId: orderId,
                        },
                    }
                );
                res.send({
                    status: 200,
                    message: "Payment verified successfully",
                    payment_id: payment_id,
                });
            }
        } catch (error) {
            console.log("Error in checkout", error);
            return res.status(500).send({
                message: "Something went wrong, please try again later",
                error: error.message,
            });
        }
    };

    static createOrder = async (req, res) => {
        try {
            const {
                items,
                billingAddress,
                additional_info,
                coupon_code,
                save_address,
            } = req.body;
            const token = req.body.token;

            if (!token) {
                return res.status(400).send({
                    status: 400,
                    key: "token",
                    message: "token is required",
                });
            }

            const payload = jwt.decode(token, process.env.TOKEN_SECRET);
            const user = await User.findById(payload.id);
            if (!user) return res.status(401).send("User not found");
            req.login_user = user;

            let totalAmount = 0;
            let subTotal = 0;
            let orderItems = [];
            let couponDiscount = 0;

            for (let item of items) {
                if (!item.product_id || !item.sku || !item.quantity) {
                    return res.status(400).send({
                        status: 400,
                        key: !item.product_id
                            ? "product_id"
                            : !item.sku
                            ? "sku"
                            : "quantity",
                        message: !item.product_id
                            ? "product_id is required"
                            : !item.sku
                            ? "sku is required"
                            : "quantity is required",
                    });
                }

                const product = await Product.findById(item.product_id);
                if (!product) {
                    return res.status(400).send({
                        message: "Product not found",
                    });
                }

                const productStock = await ProductStock.findOne({
                    product_id: item.product_id,
                    sku: item.sku,
                });

                if (!productStock) {
                    return res.status(400).send({
                        message: `Product stock not found for product ID: ${item.product_id} with SKU: ${item.sku}`,
                    });
                }

                const skuIndex = productStock.sku.indexOf(item.sku);
                if (
                    skuIndex === -1 ||
                    productStock.current_stock[skuIndex] < item.quantity
                ) {
                    return res.status(400).send({
                        message: `The current stock for product ID (${item.product_id}) is only ${productStock.current_stock[skuIndex]} available.`,
                    });
                }

                productStock.current_stock[skuIndex] -= item.quantity;
                await ProductStock.updateOne(
                    { _id: productStock._id },
                    {
                        $set: {
                            current_stock: productStock.current_stock,
                        },
                    }
                );

                let totalPrice = 0;
                let specialDiscountApplied = false;
                let specialDiscountValue = null;
                let minDiscountValue = null;

                // Check for special discount
                if (
                    product.special_discount &&
                    product.special_discount_period &&
                    !product.variant
                ) {
                    const currentDate = new Date();
                    const [startDateString, endDateString] =
                        product.special_discount_period.split(" - ");

                    const parseDate = (dateString) => {
                        const [datePart, timePart, period] =
                            dateString.split(" ");
                        const [day, month, year] = datePart.split("/");
                        const [hour, minute] = timePart.split(":");
                        let hours = parseInt(hour, 10);
                        if (period === "PM" && hours !== 12) {
                            hours += 12;
                        }
                        if (period === "AM" && hours === 12) {
                            hours = 0;
                        }
                        return new Date(
                            `${year}-${month}-${day}T${hours
                                .toString()
                                .padStart(2, "0")}:${minute}:00Z`
                        );
                    };

                    const startDate = parseDate(startDateString);
                    const endDate = parseDate(endDateString);

                    if (currentDate >= startDate && currentDate <= endDate) {
                        specialDiscountValue = product.special_discount;
                        totalPrice = product.special_discount * item.quantity;
                        specialDiscountApplied = true;
                    } else {
                        totalPrice = product.unit_price * item.quantity;
                    }
                } else if (product.variant || item.attribute_value_id) {
                    totalPrice = productStock.price[skuIndex] * item.quantity;
                } else {
                    totalPrice = product.unit_price * item.quantity;
                }

                // Check for product-based coupon discounts
                const productCoupons = await Coupon.find({
                    product_id: item.product_id,
                    date_range: { $exists: true, $ne: null },
                    discount: { $exists: true, $ne: null },
                });

                let minDiscountCoupon = null;
                productCoupons.forEach((coupon) => {
                    const currentDate = new Date();
                    const [startDateString, endDateString] =
                        coupon.date_range.split(" - ");
                    const parseDate = (dateString) => {
                        const [datePart, timePart, period] =
                            dateString.split(" ");
                        const [day, month, year] = datePart.split("/");
                        const [hour, minute] = timePart.split(":");
                        let hours = parseInt(hour, 10);
                        if (period === "PM" && hours !== 12) {
                            hours += 12;
                        }
                        if (period === "AM" && hours === 12) {
                            hours = 0;
                        }
                        return new Date(
                            `${year}-${month}-${day}T${hours
                                .toString()
                                .padStart(2, "0")}:${minute}:00Z`
                        );
                    };
                    const startDate = parseDate(startDateString);
                    const endDate = parseDate(endDateString);

                    if (currentDate >= startDate && currentDate <= endDate) {
                        if (
                            !minDiscountCoupon ||
                            coupon.discount < minDiscountCoupon.discount
                        ) {
                            minDiscountCoupon = coupon;
                        }
                    }
                });

                // Apply the lowest discount (special discount vs. coupon discount)
                if (minDiscountCoupon) {
                    let couponDiscountValue = 0;
                    if (minDiscountCoupon.type === "percentage") {
                        couponDiscountValue =
                            (minDiscountCoupon.discount / 100) * totalPrice;
                    } else if (minDiscountCoupon.type === "flat") {
                        couponDiscountValue = minDiscountCoupon.discount;
                    }

                    if (specialDiscountApplied) {
                        minDiscountValue = Math.min(
                            specialDiscountValue,
                            couponDiscountValue
                        );
                    } else {
                        minDiscountValue = couponDiscountValue;
                    }

                    totalPrice -= minDiscountValue;
                    totalPrice = Math.max(totalPrice, 0); // Ensure total amount doesn't go below 0

                    await Coupon.updateOne(
                        { _id: minDiscountCoupon._id },
                        { $set: { is_applied: true } }
                    );
                } else if (specialDiscountApplied) {
                    totalPrice -= specialDiscountValue;
                }

                totalAmount += totalPrice;
                subTotal += totalPrice;

                const orderHistory = await OrderHistory.create({
                    order_id: null,
                    product_id: item.product_id,
                    product_name: product.product_name,
                    sku: item.sku,
                    attribute_value_id: item.attribute_value_id || [],
                    variants: item.variants
                        ? item.variants.map((v) => JSON.stringify(v))
                        : [],
                    unit_price: item.attribute_value_id
                        ? productStock.price[skuIndex]
                        : product.unit_price,
                    quantity: item.quantity,
                    special_discount: minDiscountValue,
                    sub_total: totalPrice,
                });
                orderItems.push(orderHistory);

                await ProductStock.updateOne(
                    { _id: productStock._id },
                    {
                        $set: {
                            current_stock: productStock.current_stock,
                        },
                    }
                );
            }

            // Apply coupon discount after calculating totalAmount if coupon_code is provided
            if (coupon_code) {
                const coupon = await Coupon.findOne({
                    coupon_code,
                    date_range: { $exists: true, $ne: null },
                });
                if (!coupon) {
                    return res.status(400).send({
                        status: 400,
                        message: "Invalid coupon code",
                    });
                }

                const currentDate = new Date();
                const [startDateString, endDateString] =
                    coupon.date_range.split(" - ");

                const parseDate = (dateString) => {
                    const [datePart, timePart, period] = dateString.split(" ");
                    const [day, month, year] = datePart.split("/");
                    const [hour, minute] = timePart.split(":");
                    let hours = parseInt(hour, 10);
                    if (period === "PM" && hours !== 12) {
                        hours += 12;
                    }
                    if (period === "AM" && hours === 12) {
                        hours = 0;
                    }
                    return new Date(
                        `${year}-${month}-${day}T${hours
                            .toString()
                            .padStart(2, "0")}:${minute}:00Z`
                    );
                };

                const startDate = parseDate(startDateString);
                const endDate = parseDate(endDateString);

                if (currentDate < startDate || currentDate > endDate) {
                    return res.status(400).send({
                        status: 400,
                        message: "Coupon code expired",
                    });
                }

                if (coupon.type === "percentage") {
                    couponDiscount = (coupon.discount / 100) * totalAmount;
                } else if (coupon.type === "flat") {
                    couponDiscount = coupon.discount;
                } else {
                    return res.status(400).send({
                        status: 400,
                        message: "Invalid coupon type",
                    });
                }

                if (couponDiscount > 0) {
                    totalAmount -= couponDiscount;
                    totalAmount = Math.max(totalAmount, 0); // Ensure total amount doesn't go below 0
                    await Coupon.updateOne(
                        { coupon_code },
                        { $set: { is_applied: true } }
                    );
                }
            }

            const lastInvoiceNumber = await Order.findOne(
                {},
                { order_no: 1, _id: 0 }
            ).sort({ order_no: -1 });
            let newInvoiceNumber = "INV-0001";
            if (lastInvoiceNumber) {
                newInvoiceNumber = incrementInvoiceNumber(
                    lastInvoiceNumber.order_no
                );
            }

            let razorpayOrder;
            let paymentMode = "online";

            try {
                const razorpay = await initializeRazorpay();

                const options = {
                    amount: totalAmount * 100, // amount in the smallest currency unit
                    currency: "INR",
                    receipt: newInvoiceNumber,
                };

                razorpayOrder = await razorpay.orders.create(options);
            } catch (error) {
                paymentMode = "COD"; // Silently switch to COD if Razorpay fails
            }

            await config.createOrderStatus();
            let order_status = await Status.findOne({
                name: { $regex: new RegExp("^pending$", "i") },
                type: { $regex: new RegExp("^order$", "i") },
            });
            const order = await Order.create({
                user_id: req.login_user ? req.login_user._id : "",
                order_no: newInvoiceNumber,
                order_total_amount: totalAmount,
                order_discount_amount: couponDiscount ? couponDiscount : 0,
                coupon_code: coupon_code ? coupon_code : null,
                order_subtotal_amount: subTotal,
                additional_info: additional_info,
                status_id: order_status._id,
                payment_mode: paymentMode,
                payment_status: "unpaid",
            });

            orderItems = await Promise.all(
                orderItems.map(async (item) => {
                    item.order_id = order._id;
                    await item.save();
                    return item;
                })
            );

            // Check if _id exists in billingAddress and delete it
            if (billingAddress._id) {
                delete billingAddress._id;
            }
            const billingAddr = new BillingAddress({
                ...billingAddress,
                order_id: order._id,
            });
            await billingAddr.save();

            if (save_address) {
                const userBillingAddress = new UserBillingAddress({
                    ...billingAddress,
                    user_id: req.login_user._id,
                });
                await userBillingAddress.save();
            }

            // if payment mode is COD, then save
            if (paymentMode === "COD") {
                res.send({
                    order_id: order._id,
                    amount: totalAmount,
                    currency: "INR",
                });
            } else {
                res.send({
                    orderId: razorpayOrder.id,
                    order_id: order._id,
                    amount: totalAmount,
                    currency: "INR",
                });
            }
        } catch (error) {
            console.error("Error in order", error);
            return res.status(500).send({
                status: 500,
                message: "Internal server error",
            });
        }
    };
}

module.exports = PaymentController;
