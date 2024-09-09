const Status = require("../models/Status");

const createPagesStatus = async () => {
    const checkAndUpdateStatus = async (name) => {
        let status = await Status.findOne({
            type: "pages",
            name: { $regex: new RegExp(`^${name}$`, "i") },
        });

        if (status) {
            let needsUpdate = false;
            if (status.name.toLowerCase() !== name.toLowerCase()) {
                status.name = name;
                needsUpdate = true;
            }
            if (status.type !== "pages") {
                status.type = "pages";
                needsUpdate = true;
            }
            if (needsUpdate) {
                await status.save();
            }
        } else {
            status = new Status({ name, type: "pages" });
            await status.save();
        }
    };
    await checkAndUpdateStatus("active");
    await checkAndUpdateStatus("inactive");
};

const createCategoryStatus = async () => {
    const checkAndUpdateStatus = async (name) => {
        let status = await Status.findOne({
            type: "category",
            name: { $regex: new RegExp(`^${name}$`, "i") },
        });

        if (status) {
            let needsUpdate = false;
            if (status.name.toLowerCase() !== name.toLowerCase()) {
                status.name = name;
                needsUpdate = true;
            }
            if (status.type !== "category") {
                status.type = "category";
                needsUpdate = true;
            }
            if (needsUpdate) {
                await status.save();
            }
        } else {
            status = new Status({ name, type: "category" });
            await status.save();
        }
    };
    await checkAndUpdateStatus("active");
    await checkAndUpdateStatus("inactive");
};

const createBrandStatus = async () => {
    const checkAndUpdateStatus = async (name) => {
        let status = await Status.findOne({
            type: "brand",
            name: { $regex: new RegExp(`^${name}$`, "i") },
        });

        if (status) {
            let needsUpdate = false;
            if (status.name.toLowerCase() !== name.toLowerCase()) {
                status.name = name;
                needsUpdate = true;
            }
            if (status.type !== "brand") {
                status.type = "brand";
                needsUpdate = true;
            }
            if (needsUpdate) {
                await status.save();
            }
        } else {
            status = new Status({ name, type: "brand" });
            await status.save();
        }
    };
    await checkAndUpdateStatus("active");
    await checkAndUpdateStatus("inactive");
};

const createProductStatus = async () => {
    const checkAndUpdateStatus = async (name) => {
        let status = await Status.findOne({
            type: "product",
            name: { $regex: new RegExp(`^${name}$`, "i") },
        });

        if (status) {
            let needsUpdate = false;
            if (status.name.toLowerCase() !== name.toLowerCase()) {
                status.name = name;
                needsUpdate = true;
            }
            if (status.type !== "product") {
                status.type = "product";
                needsUpdate = true;
            }
            if (needsUpdate) {
                await status.save();
            }
        } else {
            status = new Status({ name, type: "product" });
            await status.save();
        }
    };
    await checkAndUpdateStatus("active");
    await checkAndUpdateStatus("inactive");
};

const createOrderStatus = async () => {
    const checkAndUpdateStatus = async (name) => {
        let status = await Status.findOne({
            type: "order",
            name: { $regex: new RegExp(`^${name}$`, "i") },
        });

        if (status) {
            let needsUpdate = false;
            if (status.name.toLowerCase() !== name.toLowerCase()) {
                status.name = name;
                needsUpdate = true;
            }
            if (status.type !== "order") {
                status.type = "order";
                needsUpdate = true;
            }
            if (needsUpdate) {
                await status.save();
            }
        } else {
            status = new Status({ name, type: "order" });
            await status.save();
        }
    };
    await checkAndUpdateStatus("pending");
    await checkAndUpdateStatus("completed");
    await checkAndUpdateStatus("picked_up");
    await checkAndUpdateStatus("on_the_way");
    await checkAndUpdateStatus("cancelled");
    await checkAndUpdateStatus("delivered");
};

const createTransactionStatus = async () => {
    const checkAndUpdateStatus = async (name) => {
        let status = await Status.findOne({
            type: "transaction",
            name: { $regex: new RegExp(`^${name}$`, "i") },
        });

        if (status) {
            let needsUpdate = false;
            if (status.name.toLowerCase() !== name.toLowerCase()) {
                status.name = name;
                needsUpdate = true;
            }
            if (status.type !== "transaction") {
                status.type = "transaction";
                needsUpdate = true;
            }
            if (needsUpdate) {
                await status.save();
            }
        } else {
            status = new Status({ name, type: "transaction" });
            await status.save();
        }
    };
    await checkAndUpdateStatus("success");
    await checkAndUpdateStatus("failed");
};

const createUserStatus = async () => {
    const checkAndUpdateStatus = async (name) => {
        let status = await Status.findOne({
            type: "user",
            name: { $regex: new RegExp(`^${name}$`, "i") },
        });

        if (status) {
            let needsUpdate = false;
            if (status.name.toLowerCase() !== name.toLowerCase()) {
                status.name = name;
                needsUpdate = true;
            }
            if (status.type !== "user") {
                status.type = "user";
                needsUpdate = true;
            }
            if (needsUpdate) {
                await status.save();
            }
        } else {
            status = new Status({ name, type: "user" });
            await status.save();
        }
    };
    await checkAndUpdateStatus("active");
    await checkAndUpdateStatus("inactive");
    await checkAndUpdateStatus("banned");
};

const createRatingStatus = async () => {
    const checkAndUpdateStatus = async (name) => {
        let status = await Status.findOne({
            type: "rating",
            name: { $regex: new RegExp(`^${name}$`, "i") },
        });

        if (status) {
            let needsUpdate = false;
            if (status.name.toLowerCase() !== name.toLowerCase()) {
                status.name = name;
                needsUpdate = true;
            }
            if (status.type !== "rating") {
                status.type = "rating";
                needsUpdate = true;
            }
            if (needsUpdate) {
                await status.save();
            }
        } else {
            status = new Status({ name, type: "rating" });
            await status.save();
        }
    };
    await checkAndUpdateStatus("active");
    await checkAndUpdateStatus("inactive");
    await checkAndUpdateStatus("show");
    await checkAndUpdateStatus("hide");
};

const createCouponStatus = async () => {
    const checkAndUpdateStatus = async (name) => {
        let status = await Status.findOne({
            type: "coupon",
            name: { $regex: new RegExp(`^${name}$`, "i") },
        });

        if (status) {
            let needsUpdate = false;
            if (status.name.toLowerCase() !== name.toLowerCase()) {
                status.name = name;
                needsUpdate = true;
            }
            if (status.type !== "coupon") {
                status.type = "coupon";
                needsUpdate = true;
            }
            if (needsUpdate) {
                await status.save();
            }
        } else {
            status = new Status({ name, type: "coupon" });
            await status.save();
        }
    };
    await checkAndUpdateStatus("active");
    await checkAndUpdateStatus("inactive");
};

const createSliderStatus = async () => {
    const checkAndUpdateStatus = async (name) => {
        let status = await Status.findOne({
            type: "slider",
            name: { $regex: new RegExp(`^${name}$`, "i") },
        });

        if (status) {
            let needsUpdate = false;
            if (status.name.toLowerCase() !== name.toLowerCase()) {
                status.name = name;
                needsUpdate = true;
            }
            if (status.type !== "slider") {
                status.type = "slider";
                needsUpdate = true;
            }
            if (needsUpdate) {
                await status.save();
            }
        } else {
            status = new Status({ name, type: "slider" });
            await status.save();
        }
    };
    await checkAndUpdateStatus("active");
    await checkAndUpdateStatus("inactive");
};

const createRazorpayStatus = async () => {
    const checkAndUpdateStatus = async (name) => {
        let status = await Status.findOne({
            type: "razorpay",
            name: { $regex: new RegExp(`^${name}$`, "i") },
        });

        if (status) {
            let needsUpdate = false;
            if (status.name.toLowerCase() !== name.toLowerCase()) {
                status.name = name;
                needsUpdate = true;
            }
            if (status.type !== "razorpay") {
                status.type = "razorpay";
                needsUpdate = true;
            }
            if (needsUpdate) {
                await status.save();
            }
        } else {
            status = new Status({ name, type: "razorpay" });
            await status.save();
        }
    };
    await checkAndUpdateStatus("enable");
    await checkAndUpdateStatus("disable");
};
module.exports = {
    createPagesStatus,
    createCategoryStatus,
    createBrandStatus,
    createProductStatus,
    createOrderStatus,
    createTransactionStatus,
    createUserStatus,
    createRatingStatus,
    createCouponStatus,
    createSliderStatus,
    createRazorpayStatus,
};
