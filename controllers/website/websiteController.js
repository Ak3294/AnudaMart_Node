const Category = require("../../models/Category");
const Product = require("../../models/Product");
const ProductStock = require("../../models/ProductStock");
const Status = require("../../models/Status");
const AttributeSets = require("../../models/AttributeSets");
const AttributeValue = require("../../models/AttributeValue");
const Brand = require("../../models/Brand");
const Slider = require("../../models/Slider");
const Rating = require("../../models/Rating");
const Wishlist = require("../../models/Wishlist");
const Faq = require("../../models/Faq");
const Banner = require("../../models/Banner");
const WebSetting = require("../../models/WebSetting");
const StaticPage = require("../../models/StaticPage");
const RazorpayConfig = require("../../models/RazorpayConfig");
const SmtpConfig = require("../../models/SmtpConfig");
const mongoose = require("mongoose");
require("dotenv").config();
const baseURL = process.env.BaseURL;
const fs = require("fs");
const path = require("path");
const config = require("../../config/createStatus");
const defaultImage = baseURL + "/assets/images/default/mart-demo-img.jpg";
const vendorDefaultImage =
    baseURL + "/assets/images/default/user-dummy-img.jpg";

class WebsiteController {
    //#region category with parent_id and limit
    static category = async (req, res) => {
        let mediaUrl = baseURL + "/dist/category/";
        try {
            await config.createCategoryStatus();
            let status = await Status.findOne({
                type: { $regex: new RegExp("category", "i") },
                name: { $regex: new RegExp("active", "i") },
            });

            const { parent_id } = req.query;

            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 15;
            let skip = (page - 1) * limit;

            let conditions = { status_id: status._id };
            if (parent_id) {
                conditions.parent_id = parent_id;
            } else {
                conditions.parent_id = null;
            }

            const categories = await Category.find(conditions)
                .populate("parent_id")
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit);

            const totalCount = await Category.countDocuments(conditions);

            // Fetch child categories for each category
            const fetchChildren = async (parentCategory) => {
                const children = await Category.find({
                    parent_id: parentCategory._id,
                });
                return Promise.all(
                    children.map(async (child) => {
                        let childData = {
                            _id: child._id,
                            name: child.name,
                            slug: child.slug,
                            commission: child.commission,
                            commission_type: child.commission_type,
                            icon: child.icon,
                            parent_id: child.parent_id,
                            child: await fetchChildren(child), // Recursively fetch children
                        };

                        // Set default image if necessary for child
                        if (child.icon && child.icon.trim() !== "") {
                            const iconPath = path.join(
                                __dirname,
                                "../../public/dist/category/",
                                child.icon.trim()
                            );
                            try {
                                await fs.promises.access(
                                    iconPath,
                                    fs.constants.F_OK
                                );
                                childData.icon = mediaUrl + child.icon.trim();
                            } catch (err) {
                                childData.icon = defaultImage;
                            }
                        } else {
                            childData.icon = defaultImage;
                        }

                        return childData;
                    })
                );
            };

            // Build the response data with child categories
            const responseData = await Promise.all(
                categories.map(async (category) => {
                    let categoryData = {
                        _id: category._id,
                        name: category.name,
                        slug: category.slug,
                        commission: category.commission,
                        commission_type: category.commission_type,
                        icon: category.icon,
                        parent_id: category.parent_id,
                        child: await fetchChildren(category), // Fetch child categories
                    };

                    // Set default image if necessary
                    if (category.icon && category.icon.trim() !== "") {
                        const iconPath = path.join(
                            __dirname,
                            "../../public/dist/category/",
                            category.icon.trim()
                        );
                        try {
                            await fs.promises.access(
                                iconPath,
                                fs.constants.F_OK
                            );
                            categoryData.icon = mediaUrl + category.icon.trim();
                        } catch (err) {
                            categoryData.icon = defaultImage;
                        }
                    } else {
                        categoryData.icon = defaultImage;
                    }

                    return categoryData;
                })
            );

            return res.send({
                message: "Success",
                success: true,
                data: responseData,
                mediaUrl,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                totalCount,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong please try again later",
                error: error.message,
            });
        }
    };
    //#endregion

    //#region products_by_category with category_id filter
    static products_by_category = async (req, res) => {
        try {
            let mediaUrl = baseURL + "/dist/product/";
            await config.createProductStatus();
            let status = await Status.findOne({
                type: { $regex: new RegExp("product", "i") },
                name: { $regex: new RegExp("active", "i") },
            });

            const _id = req.query._id;
            if (!_id) {
                return res.status(400).send("Category ID is required");
            }

            // Find all child categories recursively within the method
            const findChildCategories = async (categoryId) => {
                let categories = await Category.find({
                    parent_id: categoryId,
                }).select("_id");
                let categoryIds = categories.map((category) =>
                    category._id.toString()
                );

                for (const category of categories) {
                    const childCategoryIds = await findChildCategories(
                        category._id
                    );
                    categoryIds = categoryIds.concat(childCategoryIds);
                }

                return categoryIds;
            };

            const childCategoryIds = await findChildCategories(
                mongoose.Types.ObjectId(_id)
            );
            const categoryIds = [_id].concat(childCategoryIds);

            const products = await Product.find({
                category_id: { $in: categoryIds },
                status_id: status._id,
            })
                .populate("category_id brand_id unit_id")
                .sort({ created_at: -1 });

            const responseData = await Promise.all(
                products.map(async (product) => {
                    let special_price = 0;

                    // Calculate special price based on discount type
                    if (product.special_discount_type === "flat") {
                        special_price =
                            product.unit_price - product.special_discount;
                    } else if (product.special_discount_type === "percentage") {
                        const discountAmount =
                            (product.unit_price * product.special_discount) /
                            100;
                        special_price = product.unit_price - discountAmount;
                    }

                    // Check if thumbnail exists in the public folder, if not set default image
                    if (product.thumbnail && product.thumbnail.trim() !== "") {
                        const thumbnailPath = path.join(
                            __dirname,
                            "../../public/dist/product/",
                            product.thumbnail.trim()
                        );
                        try {
                            await fs.promises.access(
                                thumbnailPath,
                                fs.constants.F_OK
                            );
                            product.thumbnail =
                                mediaUrl + product.thumbnail.trim();
                        } catch (err) {
                            product.thumbnail = defaultImage;
                        }
                    } else {
                        product.thumbnail = defaultImage;
                    }

                    // Prepare the response object
                    let responseObject = {
                        _id: product._id,
                        product_name: product.product_name,
                        unit_price: product.unit_price,
                        special_discount_type: product.special_discount_type,
                        special_discount: product.special_discount,
                        special_discount_period:
                            product.special_discount_period,
                        brand_id: product.brand_id,
                        rating: product.rating || 3,
                        special_price: special_price.toFixed(2) || 0,
                        thumbnail: product.thumbnail,
                        slug: product.slug,
                        variant: product.variant,
                    };

                    // If the product is not a variant, include sku and current_stock
                    if (!product.variant) {
                        const productStock = await ProductStock.findOne({
                            product_id: product._id,
                        });
                        if (productStock) {
                            responseObject.sku = productStock.sku[0];
                            responseObject.current_stock =
                                productStock.current_stock[0];
                        }
                    }

                    return responseObject;
                })
            );

            return res.send({
                message: "Success",
                success: true,
                data: responseData,
                mediaUrl,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong please try again later",
                error: error.message,
            });
        }
    };
    //#endregion

    //#region get_all_products with category_id and brand_id filter
    static get_all_products = async (req, res) => {
        try {
            let mediaUrl = baseURL + "/dist/product/";
            let conditions = {};

            await config.createProductStatus();
            let status = await Status.findOne({
                type: { $regex: new RegExp("product", "i") },
                name: { $regex: new RegExp("active", "i") },
            });
            conditions.status_id = status._id;

            // Check for category_id filter
            const category_id = req.body.category_id;
            if (category_id) {
                conditions.category_id = category_id;
            }

            // Check for brand_id filter
            const brand_id = req.body.brand_id;
            if (brand_id) {
                if (Array.isArray(brand_id)) {
                    conditions.brand_id = { $in: brand_id };
                } else {
                    conditions.brand_id = brand_id;
                }
            }

            // Check for product_name filter
            const { product_name } = req.body;
            if (product_name) {
                conditions.product_name = {
                    $regex: new RegExp(product_name, "i"),
                };
            }

            // Check for price range filter
            const min_price = req.body.min_price;
            const max_price = req.body.max_price;
            if (min_price || max_price) {
                conditions.unit_price = {};
                if (min_price) {
                    conditions.unit_price.$gte = min_price;
                }
                if (max_price) {
                    conditions.unit_price.$lte = max_price;
                }
            }

            // Check for rating filter
            const rating = req.body.rating;
            let productIds = [];
            if (rating) {
                const ratings = await Rating.find({
                    rating: parseFloat(rating),
                });
                productIds = ratings.map((rating) => rating.product_id);
            }

            // Pagination parameters
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 15;
            let skip = (page - 1) * limit;

            // Apply product ID filter if rating is specified
            if (productIds.length > 0) {
                conditions._id = { $in: productIds };
            }

            const productsQuery = Product.find(conditions)
                .populate("category_id brand_id unit_id")
                .sort({ unit_price: 1 })
                .skip(skip)
                .limit(limit);

            const countQuery = Product.countDocuments(conditions);

            const [products, totalCount] = await Promise.all([
                productsQuery,
                countQuery,
            ]);

            // Aggregate ratings for each product
            const productIdsFromProducts = products.map(
                (product) => product._id
            );
            const ratings = await Rating.aggregate([
                { $match: { product_id: { $in: productIdsFromProducts } } },
                {
                    $group: {
                        _id: "$product_id",
                        averageRating: { $avg: "$rating" },
                    },
                },
            ]);

            // Create a map of ratings
            const ratingsMap = ratings.reduce((map, rating) => {
                map[rating._id] = rating;
                return map;
            }, {});

            // Calculate special_price and include ratings
            const productsWithSpecialPrice = products.map((product) => {
                let special_price = 0;

                if (product.special_discount_type === "flat") {
                    special_price =
                        product.unit_price - product.special_discount;
                } else if (product.special_discount_type === "percentage") {
                    const discountAmount =
                        (product.unit_price * product.special_discount) / 100;
                    special_price = product.unit_price - discountAmount;
                }

                // Assign special_price to the product object
                let productData = product.toObject();
                productData.special_price = special_price.toFixed(2) || 0;

                // Include ratings
                const productRating = ratingsMap[product._id] || {
                    averageRating: 0,
                };
                productData.averageRating = Math.min(
                    productRating.averageRating,
                    5
                ).toFixed(2);

                // Set default images if necessary
                const thumbnailPath = path.join(
                    __dirname,
                    "../../public/dist/product/",
                    productData.thumbnail.trim()
                );
                if (
                    productData.thumbnail &&
                    productData.thumbnail.trim() !== ""
                ) {
                    fs.access(thumbnailPath, fs.constants.F_OK, (err) => {
                        if (err) {
                            productData.thumbnail = defaultImage;
                        } else {
                            productData.thumbnail =
                                mediaUrl + productData.thumbnail.trim();
                        }
                    });
                } else {
                    productData.thumbnail = defaultImage;
                }

                // Handle gallery_image
                productData.gallery_image = productData.gallery_image
                    ?.map((image) => {
                        const imagePath = path.join(
                            __dirname,
                            "../../public/dist/product/",
                            image.trim()
                        );
                        try {
                            if (
                                image &&
                                image.trim() !== "" &&
                                fs.existsSync(imagePath)
                            ) {
                                return mediaUrl + image.trim();
                            } else {
                                return null;
                            }
                        } catch (err) {
                            return null;
                        }
                    })
                    .filter(Boolean);

                // Handle description_image
                productData.description_image = productData.description_image
                    ?.map((image) => {
                        const imagePath = path.join(
                            __dirname,
                            "../../public/dist/product/",
                            image.trim()
                        );
                        try {
                            if (
                                image &&
                                image.trim() !== "" &&
                                fs.existsSync(imagePath)
                            ) {
                                return mediaUrl + image.trim();
                            } else {
                                return null;
                            }
                        } catch (err) {
                            return null;
                        }
                    })
                    .filter(Boolean);

                // Handle meta_image
                productData.meta_image = productData.meta_image
                    ?.map((image) => {
                        const imagePath = path.join(
                            __dirname,
                            "../../public/dist/product/",
                            image.trim()
                        );
                        try {
                            if (
                                image &&
                                image.trim() !== "" &&
                                fs.existsSync(imagePath)
                            ) {
                                return mediaUrl + image.trim();
                            } else {
                                return null;
                            }
                        } catch (err) {
                            return null;
                        }
                    })
                    .filter(Boolean);

                return productData;
            });

            const productStocks = await ProductStock.find({
                product_id: { $in: productIdsFromProducts },
                sku: { $regex: new RegExp(product_name, "i") },
            });

            // Create a map of product stocks based on product_id
            const productStockMap = productStocks.reduce((map, stock) => {
                map[stock.product_id.toString()] = stock;
                return map;
            }, {});

            // Reorder productStocks based on the product order in productsWithSpecialPrice
            const orderedProductStocks = productsWithSpecialPrice.map(
                (product) => productStockMap[product._id.toString()] || null
            );

            return res.send({
                message: "Success",
                success: true,
                data: productsWithSpecialPrice,
                mediaUrl,
                productStocks: orderedProductStocks,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
            });
        } catch (error) {
            console.error("Error fetching products:", error);
            return res.status(500).send({
                message: "Something went wrong, please try again later",
                error: error.message,
            });
        }
    };
    //#endregion

    //#region get_product_details by product_id
    static get_product_details = async (req, res) => {
        try {
            const mediaUrl = baseURL + "/dist/product/";
            const imageBaseUrl = baseURL + "/dist/users/";
            const mediaImageUrl = baseURL + "/dist/ratings/";
            const { product_id } = req.body;

            if (!product_id) {
                return res.send({
                    message: "product_id is required",
                    success: false,
                });
            }

            // Fetch the product and populate related data
            const product = await Product.findOne({ _id: product_id })
                .populate("category_id brand_id unit_id vendor_id")
                .sort({ created_at: -1 });

            if (!product) {
                return res.send({
                    message: "Product not found",
                    success: false,
                });
            }

            // Check if the product is in the user's wishlist
            const wishlistItem = await Wishlist.findOne({
                product_id: product_id,
                is_wishlist: true,
            });

            // Calculate special_price for the product
            let special_price = 0;
            if (product.special_discount_type === "flat") {
                special_price = product.unit_price - product.special_discount;
            } else if (product.special_discount_type === "percentage") {
                const discountAmount =
                    (product.unit_price * product.special_discount) / 100;
                special_price = product.unit_price - discountAmount;
            }

            // Convert product to a plain object and add special_price and wishlist keys
            let productData = product.toObject();
            productData.special_price = special_price.toFixed(2) || 0;
            productData.wishlist = !!wishlistItem;

            // Set default image if necessary
            const thumbnailPath = path.join(
                __dirname,
                "../../public/dist/product/",
                productData.thumbnail.trim()
            );
            if (productData.thumbnail && productData.thumbnail.trim() !== "") {
                fs.access(thumbnailPath, fs.constants.F_OK, (err) => {
                    if (err) {
                        productData.thumbnail = defaultImage;
                    } else {
                        productData.thumbnail =
                            mediaUrl + productData.thumbnail;
                    }
                });
            } else {
                productData.thumbnail = defaultImage;
            }

            //set default image if vendor image is not available
            // Check if vendor_id exists before accessing its image property
            if (
                productData.vendor_id &&
                productData.vendor_id.image &&
                productData.vendor_id.image.trim() !== ""
            ) {
                const vendorImagePath = path.join(
                    __dirname,
                    "../../public/dist/users/",
                    productData.vendor_id.image.trim()
                );
                fs.access(vendorImagePath, fs.constants.F_OK, (err) => {
                    if (err) {
                        productData.vendor_id.image = vendorDefaultImage;
                    } else {
                        productData.vendor_id.image =
                            imageBaseUrl + productData.vendor_id.image;
                    }
                });
            } else {
                if (productData.vendor_id && productData.vendor_id.image) {
                    productData.vendor_id.image = vendorDefaultImage;
                }
            }

            // Handle gallery_image
            productData.gallery_image = productData.gallery_image
                ?.map((image) => {
                    const imagePath = path.join(
                        __dirname,
                        "../../public/dist/product/",
                        image.trim()
                    );
                    try {
                        if (
                            image &&
                            image.trim() !== "" &&
                            fs.existsSync(imagePath)
                        ) {
                            return image;
                        } else {
                            return null;
                        }
                    } catch (err) {
                        return null;
                    }
                })
                .filter(Boolean);

            // Handle description_image
            productData.description_image = productData.description_image
                ?.map((image) => {
                    const imagePath = path.join(
                        __dirname,
                        "../../public/dist/product/",
                        image.trim()
                    );
                    try {
                        if (
                            image &&
                            image.trim() !== "" &&
                            fs.existsSync(imagePath)
                        ) {
                            return image;
                        } else {
                            return null;
                        }
                    } catch (err) {
                        return null;
                    }
                })
                .filter(Boolean);

            // Handle meta_image
            productData.meta_image = productData.meta_image
                ?.map((image) => {
                    const imagePath = path.join(
                        __dirname,
                        "../../public/dist/product/",
                        image.trim()
                    );
                    try {
                        if (
                            image &&
                            image.trim() !== "" &&
                            fs.existsSync(imagePath)
                        ) {
                            return image;
                        } else {
                            return null;
                        }
                    } catch (err) {
                        return null;
                    }
                })
                .filter(Boolean);

            // handle product pdf
            productData.product_pdf = productData.product_pdf
                ?.map((pdf) => {
                    const pdfPath = path.join(
                        __dirname,
                        "../../public/dist/product/",
                        pdf.trim()
                    );
                    try {
                        if (
                            pdf &&
                            pdf.trim() !== "" &&
                            fs.existsSync(pdfPath)
                        ) {
                            return pdf;
                        } else {
                            return null;
                        }
                    } catch (err) {
                        return null;
                    }
                })
                .filter(Boolean);

            // Fetching attribute sets names
            const attributeSets = await AttributeSets.find({
                _id: { $in: product.attribute_sets },
            });
            const attributeSetsMap = attributeSets.reduce((acc, set) => {
                acc[set._id] = set.title; // or set.name, based on your schema
                return acc;
            }, {});

            // Fetching attribute values names for selected variants
            const attributeValues = await AttributeValue.find({
                _id: { $in: product.selected_variants_ids },
            });
            const attributeValuesMap = attributeValues.reduce((acc, val) => {
                acc[val._id] = val.value; // Assuming you have a 'value' field
                return acc;
            }, {});

            // Map the selected_variants to their names and values
            let selectedVariants = {};
            if (product.selected_variants.length > 0) {
                product.selected_variants[0].forEach(
                    (valueIds, attributeId) => {
                        selectedVariants[attributeId] = valueIds.map((id) => ({
                            id: id,
                            name: attributeValuesMap[id],
                        }));
                    }
                );
            }

            // Format the attribute_sets and selected_variants for response
            productData.attribute_sets = product.attribute_sets.map(
                (setId) => ({
                    id: setId,
                    name: attributeSetsMap[setId],
                })
            );

            productData.selected_variants = Object.keys(
                selectedVariants
            ).reduce((acc, attributeId) => {
                acc[attributeId] = selectedVariants[attributeId].map(
                    (value) => ({
                        id: value.id,
                        name: value.name,
                    })
                );
                return acc;
            }, {});

            productData.selected_variants_ids =
                product.selected_variants_ids.map((id) => ({
                    id: id,
                    name: attributeValuesMap[id],
                }));

            // Fetching product stock and formatting
            let productStock = [];
            if (product.variant) {
                productStock = await ProductStock.find({
                    product_id: product_id,
                });
            } else {
                const stock = await ProductStock.findOne({
                    product_id: product_id,
                });
                productStock = stock ? [stock] : [];
            }

            // Add sku and current_stock to productData if variant is false and array me nhi aayga [0] se access krna hoga string ko
            if (!product.variant && productStock.length > 0) {
                const stock = productStock[0];
                if (stock) {
                    productData.sku = stock.sku[0];
                    productData.current_stock = stock.current_stock[0];
                } else {
                    productData.sku = null;
                    productData.current_stock = null;
                }
            }

            const formattedProductStock = productStock.map((stock) => {
                const formattedStock = stock.toObject();
                formattedStock.attribute_value_id =
                    formattedStock.attribute_value_id.map((id, index) => ({
                        id: id,
                        name: formattedStock.name[index],
                    }));
                return formattedStock;
            });

            // Fetch ratings for the product
            const ratings = await Rating.aggregate([
                { $match: { product_id: mongoose.Types.ObjectId(product_id) } },
                { $group: { _id: "$rating", count: { $sum: 1 } } },
                { $project: { rating: "$_id", count: 1, _id: 0 } },
            ]);

            // Organize ratings in a structured format with integer keys
            const ratingsMap = ratings.reduce(
                (acc, rating) => {
                    acc[rating.rating] = rating.count;
                    return acc;
                },
                { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            );
            // Convert ratingsMap to the desired format
            const ratingsFormatted = {};
            for (const key in ratingsMap) {
                ratingsFormatted[parseInt(key)] = ratingsMap[key];
            }
            const reviews = await Rating.find({
                product_id: product_id,
            }).populate("user_id");

            const formattedReviews = await Promise.all(
                reviews.map(async (review) => {
                    let reviewImage = defaultImage;

                    if (review.image && review.image.trim() !== "") {
                        const imagePath = path.join(
                            __dirname,
                            "../../public/dist/ratings/",
                            review.image ? review.image.trim() : ""
                        );

                        try {
                            await fsPromises.access(
                                imagePath,
                                fs.constants.F_OK
                            );
                            reviewImage = defaultImage;
                        } catch (err) {
                            reviewImage = mediaImageUrl + review.image.trim();
                        }
                    }

                    return {
                        rating: review.rating,
                        comment: review.comment,
                        image: reviewImage,
                        user: review.user_id.first_name
                            ? review.user_id.first_name +
                              " " +
                              review.user_id.last_name
                            : "",
                    };
                })
            );
            // Calculate the average rating
            const totalRatings = Object.keys(ratingsMap).reduce(
                (acc, key) => acc + ratingsMap[key] * parseInt(key),
                0
            );
            const ratingsCount = Object.keys(ratingsMap).reduce(
                (acc, key) => acc + ratingsMap[key],
                0
            );
            const averageRating = ratingsCount
                ? totalRatings / ratingsCount
                : 0;

            // Add the average rating to productData
            productData.averageRating = averageRating.toFixed(2);

            return res.send({
                message: "Success",
                success: true,
                data: productData,
                productStock: formattedProductStock,
                ratings: ratingsFormatted,
                reviews: formattedReviews,
                mediaUrl,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong please try again later",
                error: error.message,
            });
        }
    };
    //#endregion

    //#region get today's deals products
    static get_todaysDeal_products = async (req, res) => {
        try {
            let mediaUrl = baseURL + "/dist/product/";

            await config.createProductStatus();
            let status = await Status.findOne({
                type: { $regex: new RegExp("product", "i") },
                name: { $regex: new RegExp("active", "i") },
            });

            const products = await Product.find({
                status_id: status._id,
                todays_deal: true,
            })
                .populate("category_id brand_id unit_id")
                .sort({ created_at: -1 });

            // Fetch attribute sets names
            let attributeSets = await AttributeSets.find({
                _id: { $in: products.flatMap((p) => p.attribute_sets) },
            });
            let attributeSetsMap = attributeSets.reduce((acc, set) => {
                acc[set._id] = set.title; // or set.name, based on your schema
                return acc;
            }, {});

            // Fetch attribute values names for selected variants
            let attributeValues = await AttributeValue.find({
                _id: { $in: products.flatMap((p) => p.selected_variants_ids) },
            });
            let attributeValuesMap = attributeValues.reduce((acc, val) => {
                acc[val._id] = val.value; // Assuming you have a 'value' field
                return acc;
            }, {});

            const responseData = await Promise.all(
                products.map(async (product) => {
                    let special_price = 0;

                    if (product.special_discount_type === "flat") {
                        special_price =
                            product.unit_price - product.special_discount;
                    } else if (product.special_discount_type === "percentage") {
                        const discountAmount =
                            (product.unit_price * product.special_discount) /
                            100;
                        special_price = product.unit_price - discountAmount;
                    }

                    // Convert product to a plain object and add special_price key
                    let productData = product.toObject();
                    productData.special_price = special_price.toFixed(2) || 0;

                    // Map the selected_variants to their names and values
                    let selectedVariants = {};
                    if (product.selected_variants.length > 0) {
                        product.selected_variants[0].forEach(
                            (valueIds, attributeId) => {
                                selectedVariants[attributeId] = valueIds.map(
                                    (id) => ({
                                        id: id,
                                        name:
                                            attributeValuesMap[id] || "Unknown",
                                    })
                                );
                            }
                        );
                    }

                    // Format the attribute_sets and selected_variants for response
                    productData.attribute_sets = product.attribute_sets.map(
                        (setId) => ({
                            id: setId,
                            name: attributeSetsMap[setId] || "Unknown",
                        })
                    );

                    productData.selected_variants = Object.keys(
                        selectedVariants
                    ).reduce((acc, attributeId) => {
                        acc[attributeId] = selectedVariants[attributeId];
                        return acc;
                    }, {});

                    productData.selected_variants_ids =
                        product.selected_variants_ids.map((id) => ({
                            id: id,
                            name: attributeValuesMap[id] || "Unknown",
                        }));

                    // Check variant and add SKU and current_stock accordingly
                    if (!product.variant) {
                        // If variant is false, add SKU and current_stock
                        const stock = await ProductStock.findOne({
                            product_id: product._id,
                        });
                        if (stock) {
                            productData.sku = stock.sku;
                            productData.current_stock = stock.current_stock;
                        } else {
                            productData.sku = null;
                            productData.current_stock = null;
                        }
                    }

                    return productData;
                })
            );

            // Set default image if necessary
            for (let product of responseData) {
                if (product.thumbnail && product.thumbnail.trim() !== "") {
                    const thumbnailPath = path.join(
                        __dirname,
                        "../../public/dist/product/",
                        product.thumbnail.trim()
                    );
                    try {
                        await fs.promises.access(
                            thumbnailPath,
                            fs.constants.F_OK
                        );
                        product.thumbnail = mediaUrl + product.thumbnail.trim();
                    } catch (err) {
                        product.thumbnail = defaultImage;
                    }
                }

                // Handle gallery_image
                product.gallery_image = product.gallery_image
                    ?.map((image) => {
                        const imagePath = path.join(
                            __dirname,
                            "../../public/dist/product/",
                            image.trim()
                        );
                        try {
                            if (
                                image &&
                                image.trim() !== "" &&
                                fs.existsSync(imagePath)
                            ) {
                                return image;
                            } else {
                                return null;
                            }
                        } catch (err) {
                            return null;
                        }
                    })
                    .filter(Boolean);

                // Handle description_image
                product.description_image = product.description_image
                    ?.map((image) => {
                        const imagePath = path.join(
                            __dirname,
                            "../../public/dist/product/",
                            image.trim()
                        );
                        try {
                            if (
                                image &&
                                image.trim() !== "" &&
                                fs.existsSync(imagePath)
                            ) {
                                return image;
                            } else {
                                return null;
                            }
                        } catch (err) {
                            return null;
                        }
                    })
                    .filter(Boolean);

                // Handle meta_image
                product.meta_image = product.meta_image
                    ?.map((image) => {
                        const imagePath = path.join(
                            __dirname,
                            "../../public/dist/product/",
                            image.trim()
                        );
                        try {
                            if (
                                image &&
                                image.trim() !== "" &&
                                fs.existsSync(imagePath)
                            ) {
                                return image;
                            } else {
                                return null;
                            }
                        } catch (err) {
                            return null;
                        }
                    })
                    .filter(Boolean);
            }

            return res.send({
                message: "Success",
                success: true,
                data: responseData,
                mediaUrl,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong please try again later",
                error: error.message,
            });
        }
    };
    //#endregion

    //#region get_related_products by category_id brand_id and tags(comma separated)
    static get_related_products = async (req, res) => {
        try {
            const mediaUrl = baseURL + "/dist/product/";
            const imageBaseUrl = baseURL + "/dist/users/";
            const mediaImageUrl = baseURL + "/dist/ratings/";
            const { category_id, brand_id, tags, product_id } = req.query;

            // Creating an empty filter object
            let condition = {};
            // Convert category_id to an array if it's not already
            const categoryIdsArray = Array.isArray(category_id)
                ? category_id
                : [category_id];

            // Find all child categories recursively
            const allCategoryIds = [...categoryIdsArray];
            for (const categoryId of categoryIdsArray) {
                const childCategories = await Category.find({
                    parent_id: categoryId,
                }).select("_id");
                const childCategoryIds = childCategories.map((cat) =>
                    cat._id.toString()
                );
                allCategoryIds.push(...childCategoryIds);
            }

            // Add category_ids to condition if provided
            if (allCategoryIds.length > 0) {
                condition.category_id = { $in: allCategoryIds };
            }

            // Add brand_id to condition if provided
            if (brand_id) {
                condition.brand_id = brand_id;
            }

            // Add tags to condition if provided
            if (tags) {
                const tagsArray = tags.split(",").map((tag) => tag.trim());
                condition.tags = { $in: tagsArray };
            }

            // Exclude the product with product_id if provided
            if (product_id) {
                condition._id = { $ne: product_id };
            }

            // Fetch related products based on the constructed condition
            const relatedProducts = await Product.find(condition)
                .populate("category_id brand_id unit_id vendor_id")
                .sort({ created_at: -1 });

            // Process each related product similar to how get_product_details is handled
            const relatedProductData = await Promise.all(
                relatedProducts.map(async (product) => {
                    let productData = product.toObject();

                    // Calculate special_price for the product
                    let special_price = 0;
                    if (product.special_discount_type === "flat") {
                        special_price =
                            product.unit_price - product.special_discount;
                    } else if (product.special_discount_type === "percentage") {
                        const discountAmount =
                            (product.unit_price * product.special_discount) /
                            100;
                        special_price = product.unit_price - discountAmount;
                    }
                    productData.special_price = special_price.toFixed(2) || 0;

                    // Check if the product is in the user's wishlist
                    const wishlistItem = await Wishlist.findOne({
                        product_id: product._id,
                        is_wishlist: true,
                    });
                    productData.wishlist = !!wishlistItem;

                    // Set default image if necessary
                    const thumbnailPath = path.join(
                        __dirname,
                        "../../public/dist/product/",
                        productData.thumbnail.trim()
                    );
                    if (
                        productData.thumbnail &&
                        productData.thumbnail.trim() !== ""
                    ) {
                        fs.access(thumbnailPath, fs.constants.F_OK, (err) => {
                            if (err) {
                                productData.thumbnail = defaultImage;
                            } else {
                                productData.thumbnail =
                                    mediaUrl + productData.thumbnail;
                            }
                        });
                    } else {
                        productData.thumbnail = defaultImage;
                    }

                    // Handle vendor image
                    if (
                        productData.vendor_id &&
                        productData.vendor_id.image &&
                        productData.vendor_id.image.trim() !== ""
                    ) {
                        const vendorImagePath = path.join(
                            __dirname,
                            "../../public/dist/users/",
                            productData.vendor_id.image.trim()
                        );
                        fs.access(vendorImagePath, fs.constants.F_OK, (err) => {
                            if (err) {
                                productData.vendor_id.image =
                                    vendorDefaultImage;
                            } else {
                                productData.vendor_id.image =
                                    imageBaseUrl + productData.vendor_id.image;
                            }
                        });
                    } else {
                        if (
                            productData.vendor_id &&
                            productData.vendor_id.image
                        ) {
                            productData.vendor_id.image = vendorDefaultImage;
                        }
                    }

                    // Handle gallery_image
                    productData.gallery_image = productData.gallery_image
                        ?.map((image) => {
                            const imagePath = path.join(
                                __dirname,
                                "../../public/dist/product/",
                                image.trim()
                            );
                            try {
                                if (
                                    image &&
                                    image.trim() !== "" &&
                                    fs.existsSync(imagePath)
                                ) {
                                    return image;
                                } else {
                                    return null;
                                }
                            } catch (err) {
                                return null;
                            }
                        })
                        .filter(Boolean);

                    // Handle description_image
                    productData.description_image =
                        productData.description_image
                            ?.map((image) => {
                                const imagePath = path.join(
                                    __dirname,
                                    "../../public/dist/product/",
                                    image.trim()
                                );
                                try {
                                    if (
                                        image &&
                                        image.trim() !== "" &&
                                        fs.existsSync(imagePath)
                                    ) {
                                        return image;
                                    } else {
                                        return null;
                                    }
                                } catch (err) {
                                    return null;
                                }
                            })
                            .filter(Boolean);

                    // Handle meta_image
                    productData.meta_image = productData.meta_image
                        ?.map((image) => {
                            const imagePath = path.join(
                                __dirname,
                                "../../public/dist/product/",
                                image.trim()
                            );
                            try {
                                if (
                                    image &&
                                    image.trim() !== "" &&
                                    fs.existsSync(imagePath)
                                ) {
                                    return image;
                                } else {
                                    return null;
                                }
                            } catch (err) {
                                return null;
                            }
                        })
                        .filter(Boolean);

                    // Handle product pdf
                    productData.product_pdf = productData.product_pdf
                        ?.map((pdf) => {
                            const pdfPath = path.join(
                                __dirname,
                                "../../public/dist/product/",
                                pdf.trim()
                            );
                            try {
                                if (
                                    pdf &&
                                    pdf.trim() !== "" &&
                                    fs.existsSync(pdfPath)
                                ) {
                                    return pdf;
                                } else {
                                    return null;
                                }
                            } catch (err) {
                                return null;
                            }
                        })
                        .filter(Boolean);

                    // Fetching attribute sets names
                    const attributeSets = await AttributeSets.find({
                        _id: { $in: product.attribute_sets },
                    });
                    const attributeSetsMap = attributeSets.reduce(
                        (acc, set) => {
                            acc[set._id] = set.title; // or set.name, based on your schema
                            return acc;
                        },
                        {}
                    );

                    // Fetching attribute values names for selected variants
                    const attributeValues = await AttributeValue.find({
                        _id: { $in: product.selected_variants_ids },
                    });
                    const attributeValuesMap = attributeValues.reduce(
                        (acc, val) => {
                            acc[val._id] = val.value; // Assuming you have a 'value' field
                            return acc;
                        },
                        {}
                    );

                    // Map the selected_variants to their names and values
                    let selectedVariants = {};
                    if (product.selected_variants.length > 0) {
                        product.selected_variants[0].forEach(
                            (valueIds, attributeId) => {
                                selectedVariants[attributeId] = valueIds.map(
                                    (id) => ({
                                        id: id,
                                        name: attributeValuesMap[id],
                                    })
                                );
                            }
                        );
                    }

                    // Format the attribute_sets and selected_variants for response
                    productData.attribute_sets = product.attribute_sets.map(
                        (setId) => ({
                            id: setId,
                            name: attributeSetsMap[setId],
                        })
                    );

                    productData.selected_variants = Object.keys(
                        selectedVariants
                    ).reduce((acc, attributeId) => {
                        acc[attributeId] = selectedVariants[attributeId].map(
                            (value) => ({
                                id: value.id,
                                name: value.name,
                            })
                        );
                        return acc;
                    }, {});

                    productData.selected_variants_ids =
                        product.selected_variants_ids.map((id) => ({
                            id: id,
                            name: attributeValuesMap[id],
                        }));

                    // Fetching product stock and formatting
                    let productStock = [];
                    if (product.variant) {
                        productStock = await ProductStock.find({
                            product_id: product._id,
                        });
                    } else {
                        const stock = await ProductStock.findOne({
                            product_id: product._id,
                        });
                        productStock = stock ? [stock] : [];
                    }

                    // Add sku and current_stock to productData if variant is false
                    if (!product.variant && productStock.length > 0) {
                        const stock = productStock[0];
                        if (stock) {
                            productData.sku = stock.sku[0];
                            productData.current_stock = stock.current_stock[0];
                        } else {
                            productData.sku = null;
                            productData.current_stock = null;
                        }
                    }

                    const formattedProductStock = productStock.map((stock) => {
                        const formattedStock = stock.toObject();
                        formattedStock.attribute_value_id =
                            formattedStock.attribute_value_id.map(
                                (id, index) => ({
                                    id: id,
                                    name: formattedStock.name[index],
                                })
                            );
                        return formattedStock;
                    });

                    // Fetch ratings for the product
                    const ratings = await Rating.aggregate([
                        { $match: { product_id: product._id } },
                        { $group: { _id: "$rating", count: { $sum: 1 } } },
                        { $project: { rating: "$_id", count: 1, _id: 0 } },
                    ]);

                    const ratingsMap = ratings.reduce(
                        (acc, rating) => {
                            acc[rating.rating] = rating.count;
                            return acc;
                        },
                        { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                    );

                    // Convert ratingsMap to the desired format
                    const ratingsFormatted = {};
                    for (const key in ratingsMap) {
                        ratingsFormatted[parseInt(key)] = ratingsMap[key];
                    }
                    const reviews = await Rating.find({
                        product_id: product._id,
                    }).populate("user_id");

                    const checkImageExists = (imagePath) => {
                        return new Promise((resolve) => {
                            fs.access(imagePath, fs.constants.F_OK, (err) => {
                                if (err) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            });
                        });
                    };
                    const formattedReviews = await Promise.all(
                        reviews.map(async (review) => {
                            let reviewImage = defaultImage;

                            if (review.image && review.image.trim() !== "") {
                                const imagePath = path.join(
                                    __dirname,
                                    "../../public/dist/ratings/",
                                    review.image.trim()
                                );

                                const imageExists = await checkImageExists(
                                    imagePath
                                );

                                if (imageExists) {
                                    reviewImage =
                                        mediaImageUrl + review.image.trim();
                                }

                                return {
                                    rating: review.rating,
                                    comment: review.comment,
                                    image: reviewImage,
                                    user: review.user_id.first_name
                                        ? review.user_id.first_name +
                                          " " +
                                          review.user_id.last_name
                                        : "",
                                };
                            }

                            // If review.image is not provided, return default image
                            return {
                                rating: review.rating,
                                comment: review.comment,
                                image: reviewImage,
                                user: review.user_id.first_name
                                    ? review.user_id.first_name +
                                      " " +
                                      review.user_id.last_name
                                    : "",
                            };
                        })
                    );

                    const totalRatings = Object.values(ratingsMap).reduce(
                        (acc, count) => acc + count,
                        0
                    );
                    const averageRating = totalRatings
                        ? (
                              Object.entries(ratingsMap).reduce(
                                  (acc, [rating, count]) =>
                                      acc + rating * count,
                                  0
                              ) / totalRatings
                          ).toFixed(2)
                        : 0;

                    productData.average_rating = averageRating;
                    productData.product_stock = formattedProductStock;
                    productData.ratings = ratingsMap;
                    productData.reviews = formattedReviews;

                    // Return the final product data
                    return productData;
                })
            );

            return res.status(200).send({
                status: true,
                message: "Related products fetched successfully",
                data: relatedProductData,
            });
        } catch (error) {
            console.error("Error in get_related_products:", error);
            res.status(500).json({
                status: false,
                message: "Error fetching related products",
                error: error.message,
            });
        }
    };
    //#endregion

    //#region get_all_brands which contains products
    static get_all_brands = async (req, res) => {
        try {
            await config.createProductStatus();
            let status = await Status.findOne({
                type: { $regex: new RegExp("product", "i") },
                name: { $regex: new RegExp("active", "i") },
            });

            const products = await Product.find({
                status_id: status._id,
            })
                .populate({
                    path: "brand_id",
                    model: "Brand", // Name of the Brand model
                    populate: { path: "status_id", model: "Status" }, // Populate the status of the brand
                    select: "name status_id", // Fields to select from the Brand model
                })
                .populate("unit_id");
            const uniqueBrands = new Set();
            // finds brands which status is active
            products.forEach((product) => {
                if (
                    product.brand_id &&
                    product.brand_id.status_id &&
                    product.brand_id.status_id.name === "active"
                ) {
                    uniqueBrands.add(product.brand_id); // Add brand to Set if status matches
                }
            });
            const brandsArray = [...uniqueBrands];
            return res.send({
                message: "Success",
                success: true,
                data: brandsArray,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong please try again later",
                error: error.message,
            });
        }
    };
    //#endregion

    //#region filter by category_id And get category, brands, price and products
    static filter = async (req, res) => {
        try {
            let mediaUrl = baseURL + "/dist/product/";
            let productIds = [];

            const {
                category_id,
                brand_id,
                rating,
                min_price,
                max_price,
                product_name,
            } = req.query;

            // Convert comma-separated brand_id and rating strings into arrays
            const brandIdsArray = brand_id ? brand_id : [];
            const ratingsArray = rating ? rating : [];

            // Find product_status, category_status, brand_status
            await config.createProductStatus();
            let product_status = await Status.findOne({
                type: { $regex: new RegExp("product", "i") },
                name: { $regex: new RegExp("active", "i") },
            });

            await config.createCategoryStatus();
            let category_status = await Status.findOne({
                type: { $regex: new RegExp("category", "i") },
                name: { $regex: new RegExp("active", "i") },
            });

            await config.createBrandStatus();
            let brand_status = await Status.findOne({
                type: { $regex: new RegExp("brand", "i") },
                name: { $regex: new RegExp("active", "i") },
            });

            // Base query conditions
            let conditions = { status_id: product_status._id };

            if (category_id) {
                const allCategoryIds = await getAllCategoryIds(category_id);
                conditions.category_id = { $in: allCategoryIds };
            }

            if (brandIdsArray.length > 0) {
                conditions.brand_id = { $in: brandIdsArray };
            }

            if (product_name) {
                const productsByName = await Product.find({
                    product_name: { $regex: new RegExp(product_name, "i") },
                });
                productIds = productsByName.map((product) => product._id);

                const productStocks = await ProductStock.find({
                    sku: { $regex: new RegExp(product_name, "i") },
                });
                const productIdsFromStocks = productStocks.map(
                    (stock) => stock.product_id
                );
                productIds = productIds.concat(productIdsFromStocks);
            }

            if (ratingsArray.length > 0) {
                const ratings = await Rating.find({
                    rating: { $in: ratingsArray },
                    ...(productIds.length > 0
                        ? { product_id: { $in: productIds } }
                        : {}),
                });
                productIds = ratings.map((r) => r.product_id);
                conditions._id = { $in: productIds };
            } else if (productIds.length > 0) {
                conditions._id = { $in: productIds };
            }

            // Handle price filters
            let priceConditions = {};
            if (min_price) {
                priceConditions.$gte = parseFloat(min_price);
            }
            if (max_price) {
                priceConditions.$lte = parseFloat(max_price);
            }
            if (Object.keys(priceConditions).length > 0) {
                conditions.unit_price = priceConditions;
            }

            // Query products based on conditions
            const products = await Product.find(conditions)
                .populate({
                    path: "brand_id",
                    model: "Brand",
                    populate: { path: "status_id", model: "Status" },
                    select: "name status_id",
                })
                .populate("unit_id")
                .populate({
                    path: "category_id",
                    model: "Category",
                    populate: { path: "status_id", model: "Status" },
                    select: "name status_id description", // Fetch description along with other fields
                })
                .sort({ unit_price: -1 });

            // Determine brands and categories to return
            let brandsArray = [];
            let categoriesArray = [];
            let categoryDescription = "";

            if ((min_price || max_price) && category_id) {
                // If only min_price or max_price is provided, return all brands and categories
                brandsArray = await Brand.find({ status_id: brand_status._id });
                categoriesArray = await Category.find({
                    status_id: category_status._id,
                });

                // If category_id is provided, return only the brands and categories that have products in that category
                const uniqueBrands = new Set();
                const uniqueCategories = new Set();

                products.forEach((product) => {
                    if (
                        product.brand_id &&
                        product.brand_id.status_id &&
                        product.brand_id.status_id.equals(brand_status._id)
                    ) {
                        uniqueBrands.add(product.brand_id);
                    }

                    if (
                        product.category_id &&
                        product.category_id.status_id &&
                        product.category_id.status_id.equals(
                            category_status._id
                        )
                    ) {
                        uniqueCategories.add(product.category_id);
                    }
                });

                brandsArray = [...uniqueBrands];
                categoriesArray = [...uniqueCategories];
            } else if (category_id || rating || product_name) {
                // Apply existing logic for other filters
                const uniqueBrands = new Set();
                const uniqueCategories = new Set();

                products.forEach((product) => {
                    if (
                        product.brand_id &&
                        product.brand_id.status_id &&
                        product.brand_id.status_id.equals(brand_status._id)
                    ) {
                        uniqueBrands.add(product.brand_id);
                    }

                    if (
                        product.category_id &&
                        product.category_id.status_id &&
                        product.category_id.status_id.equals(
                            category_status._id
                        )
                    ) {
                        uniqueCategories.add(product.category_id);

                        // Set category description if the category_id matches the query parameter
                        if (product.category_id._id.equals(category_id)) {
                            categoryDescription =
                                product.category_id.description;
                        }
                    }
                });
                brandsArray = [...uniqueBrands];
                categoriesArray = [...uniqueCategories];
            } else if (brand_id) {
                brandsArray = await Brand.find({ status_id: brand_status._id });
            } else {
                brandsArray = await Brand.find({ status_id: brand_status._id });
                categoriesArray = await Category.find({
                    status_id: category_status._id,
                });
            }

            // Calculate min and max unit prices
            let min_unit_price = min_price ? parseFloat(min_price) : Infinity;
            let max_unit_price = max_price ? parseFloat(max_price) : -Infinity;

            if (!min_price && !max_price) {
                products.forEach((product) => {
                    if (product.unit_price < min_unit_price) {
                        min_unit_price = product.unit_price;
                    }
                    if (product.unit_price > max_unit_price) {
                        max_unit_price = product.unit_price;
                    }
                });
            } else if (category_id || min_price || max_price) {
                const categoryProducts = await Product.find({
                    category_id: { $in: await getAllCategoryIds(category_id) },
                    status_id: product_status._id,
                }).select("unit_price");
                if (categoryProducts.length > 0) {
                    min_unit_price = Math.min(
                        ...categoryProducts.map((p) => p.unit_price)
                    );
                    max_unit_price = Math.max(
                        ...categoryProducts.map((p) => p.unit_price)
                    );
                }
            }

            if (category_id) {
                const categoryProducts = await Product.find({
                    category_id: { $in: await getAllCategoryIds(category_id) },
                    status_id: product_status._id,
                }).select("unit_price");

                if (categoryProducts.length > 0) {
                    min_unit_price = Math.min(
                        ...categoryProducts.map((p) => p.unit_price)
                    );
                    max_unit_price = Math.max(
                        ...categoryProducts.map((p) => p.unit_price)
                    );
                }
            } else if (min_price || max_price) {
                min_unit_price = min_price
                    ? parseFloat(min_price)
                    : min_unit_price;
                max_unit_price = max_price
                    ? parseFloat(max_price)
                    : max_unit_price;
            } else {
                products.forEach((product) => {
                    if (product.unit_price < min_unit_price) {
                        min_unit_price = product.unit_price;
                    }
                    if (product.unit_price > max_unit_price) {
                        max_unit_price = product.unit_price;
                    }
                });
            }

            // Set default image if necessary and calculate special price
            for (let i = 0; i < products.length; i++) {
                let product = products[i].toObject(); // Convert mongoose object to plain JS object

                let special_price = 0;
                if (product.special_discount_type === "flat") {
                    special_price =
                        product.unit_price - product.special_discount;
                } else if (product.special_discount_type === "percentage") {
                    const discountAmount =
                        (product.unit_price * product.special_discount) / 100;
                    special_price = product.unit_price - discountAmount;
                }

                product.special_price = special_price.toFixed(2) || 0;

                if (product.thumbnail && product.thumbnail.trim() !== "") {
                    const thumbnailPath = path.join(
                        __dirname,
                        "../../public/dist/product/",
                        product.thumbnail.trim()
                    );
                    try {
                        await fs.promises.access(
                            thumbnailPath,
                            fs.constants.F_OK
                        );
                        product.thumbnail = mediaUrl + product.thumbnail.trim();
                    } catch (err) {
                        product.thumbnail = defaultImage;
                    }
                } else {
                    product.thumbnail = defaultImage;
                }

                products[i] = product; // Store modified object back in the array

                // Fetch ratings for the product
                const ratings = await Rating.aggregate([
                    {
                        $match: {
                            product_id: mongoose.Types.ObjectId(product._id),
                        },
                    },
                    { $group: { _id: "$rating", count: { $sum: 1 } } },
                    { $project: { rating: "$_id", count: 1, _id: 0 } },
                ]);

                // Organize ratings in a structured format with integer keys
                const ratingsMap = ratings.reduce(
                    (acc, rating) => {
                        acc[rating.rating] = rating.count;
                        return acc;
                    },
                    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                );
                // Convert ratingsMap to the desired format
                const ratingsFormatted = {};
                for (const key in ratingsMap) {
                    ratingsFormatted[parseInt(key)] = ratingsMap[key];
                }

                // Calculate the average rating
                const totalRatings = Object.keys(ratingsMap).reduce(
                    (acc, key) => acc + ratingsMap[key] * parseInt(key),
                    0
                );
                const ratingsCount = Object.keys(ratingsMap).reduce(
                    (acc, key) => acc + ratingsMap[key],
                    0
                );
                const averageRating = ratingsCount
                    ? totalRatings / ratingsCount
                    : 0;

                // Add the average rating to productData
                product.averageRating = averageRating.toFixed(2);

                // Add sku and current_stock outside the stocks array if variant is false
                if (!product.variant) {
                    // If variant is false, add SKU and current_stock
                    const stock = await ProductStock.findOne({
                        product_id: product._id,
                    });
                    if (stock) {
                        product.sku = stock.sku[0];
                        product.current_stock = stock.current_stock[0];
                    } else {
                        product.sku = null;
                        product.current_stock = null;
                    }
                }

                // Add wishlist status
                const wishlistItem = await Wishlist.findOne({
                    product_id: product._id,
                    is_wishlist: true,
                });
                product.wishlist = !!wishlistItem;
            }

            // Response object
            const response = {
                brands: brandsArray,
                categories: categoriesArray,
                description: categoryDescription,
                price: {
                    min_unit_price:
                        min_unit_price === Infinity ? null : min_unit_price,
                    max_unit_price:
                        max_unit_price === -Infinity ? null : max_unit_price,
                },
                products: products,
                mediaUrl,
            };
            return res.send({
                message: "Success",
                success: true,
                data: response,
            });
        } catch (error) {
            console.error("Error filtering products:", error);
            return res.status(500).send({
                message: "Something went wrong, please try again later",
                error: error.message,
            });
        }
    };
    //#endregion

    //#region search_products by category_id, product_name, sku, order_by - unit_price ...
    static search_products = async (req, res) => {
        try {
            let mediaUrl = baseURL + "/dist/product/";
            const { category_id, product_name } = req.body;

            // Fetch all categories, attribute sets, and attribute values
            const categories = await Category.find();
            const attributeSets = await AttributeSets.find();
            const attributeValues = await AttributeValue.find();

            // Helper function to get all child category ids recursively
            const getAllChildCategoryIds = (categoryId, categories) => {
                let childCategoryIds = [];
                for (let category of categories) {
                    if (
                        category.parent_id &&
                        category.parent_id.toString() === categoryId.toString()
                    ) {
                        childCategoryIds.push(category._id);
                        childCategoryIds = childCategoryIds.concat(
                            getAllChildCategoryIds(category._id, categories)
                        );
                    }
                }
                return childCategoryIds;
            };

            // Build query based on provided fields
            let query = {};
            if (category_id) {
                let categoryIds = [category_id];
                categoryIds = categoryIds.concat(
                    getAllChildCategoryIds(category_id, categories)
                );
                query.category_id = { $in: categoryIds };
            }
            if (product_name) {
                query.product_name = { $regex: new RegExp(product_name, "i") };
            }

            // Find products based on the criteria
            const products = await Product.find(query);

            const productIds = products.map((product) => product._id);
            const productStocks = await ProductStock.find({
                product_id: { $in: productIds },
                sku: { $regex: new RegExp(product_name || "", "i") },
            });

            // Map attribute sets and attribute values for easy lookup
            const attributeSetsMap = attributeSets.reduce((acc, set) => {
                acc[set._id] = set.title; // or set.name, based on your schema
                return acc;
            }, {});

            const attributeValuesMap = attributeValues.reduce((acc, val) => {
                acc[val._id] = val.value; // Assuming you have a 'value' field
                return acc;
            }, {});

            // Map through the products to calculate special_price for each product
            const responseData = products.map((product) => {
                let special_price = 0;

                if (product.special_discount_type === "flat") {
                    special_price =
                        product.unit_price - product.special_discount;
                } else if (product.special_discount_type === "percentage") {
                    const discountAmount =
                        (product.unit_price * product.special_discount) / 100;
                    special_price = product.unit_price - discountAmount;
                }

                // Convert product to a plain object and add special_price key
                let productData = product.toObject();
                productData.special_price = special_price.toFixed(2) || 0;

                // Find the parent and child categories for each product
                let parentCategory = categories.find(
                    (cat) =>
                        cat._id.toString() === product.category_id.toString()
                );
                let childCategories = categories.filter(
                    (cat) =>
                        cat.parent_id &&
                        cat.parent_id.toString() ===
                            product.category_id.toString()
                );

                productData.parent_category = parentCategory
                    ? {
                          id: parentCategory._id,
                          name: parentCategory.name, // Assuming `name` field exists
                      }
                    : null;

                productData.child_categories = childCategories.map((cat) => ({
                    id: cat._id,
                    name: cat.name, // Assuming `name` field exists
                }));

                // Map selected_variants to their names and values
                let selectedVariants = {};
                if (product.selected_variants.length > 0) {
                    product.selected_variants[0].forEach(
                        (valueIds, attributeId) => {
                            selectedVariants[attributeId] = valueIds.map(
                                (id) => ({
                                    id: id,
                                    name: attributeValuesMap[id],
                                })
                            );
                        }
                    );
                }

                // Format the attribute_sets and selected_variants for response
                productData.attribute_sets = product.attribute_sets.map(
                    (setId) => ({
                        id: setId,
                        name: attributeSetsMap[setId],
                    })
                );

                productData.selected_variants = Object.keys(
                    selectedVariants
                ).reduce((acc, attributeId) => {
                    acc[attributeId] = selectedVariants[attributeId].map(
                        (value) => ({
                            id: value.id,
                            name: value.name,
                        })
                    );
                    return acc;
                }, {});

                productData.selected_variants_ids =
                    product.selected_variants_ids.map((id) => ({
                        id: id,
                        name: attributeValuesMap[id],
                    }));

                // Find product stocks related to this product
                let stocks = productStocks.filter(
                    (stock) =>
                        stock.product_id.toString() === product._id.toString()
                );

                // Fetching product stock and formatting
                let formattedStocks = stocks.map((stock) => {
                    let formattedStock = stock.toObject();
                    formattedStock.attribute_value_id =
                        formattedStock.attribute_value_id.map((id, index) => {
                            return {
                                id: id,
                                name: attributeValuesMap[id],
                            };
                        });
                    return formattedStock;
                });

                productData.stocks = formattedStocks;

                // Agar variant false hai to sku aur current_stock ko stocks array ke bahar include karo
                if (!product.variant && productData.stocks.length > 0) {
                    productData.sku = productData.stocks[0].sku;
                    productData.current_stock =
                        productData.stocks[0].current_stock;
                }

                return productData;
            });

            // Set default image if necessary
            for (let product of responseData) {
                if (product.thumbnail && product.thumbnail.trim() !== "") {
                    const thumbnailPath = path.join(
                        __dirname,
                        "../../public/dist/product/",
                        product.thumbnail.trim()
                    );
                    try {
                        await fs.promises.access(
                            thumbnailPath,
                            fs.constants.F_OK
                        );
                        product.thumbnail = mediaUrl + product.thumbnail.trim();
                    } catch (err) {
                        product.thumbnail = defaultImage;
                    }
                } else {
                    product.thumbnail = defaultImage;
                }

                // Handle gallery_image
                product.gallery_image = product.gallery_image
                    ?.map((image) => {
                        const imagePath = path.join(
                            __dirname,
                            "../../public/dist/product/",
                            image.trim()
                        );
                        try {
                            if (
                                image &&
                                image.trim() !== "" &&
                                fs.existsSync(imagePath)
                            ) {
                                return image;
                            } else {
                                return null;
                            }
                        } catch (err) {
                            return null;
                        }
                    })
                    .filter(Boolean);

                // Handle description_image
                product.description_image = product.description_image
                    ?.map((image) => {
                        const imagePath = path.join(
                            __dirname,
                            "../../public/dist/product/",
                            image.trim()
                        );
                        try {
                            if (
                                image &&
                                image.trim() !== "" &&
                                fs.existsSync(imagePath)
                            ) {
                                return image;
                            } else {
                                return null;
                            }
                        } catch (err) {
                            return null;
                        }
                    })
                    .filter(Boolean);

                // Handle meta_image
                product.meta_image = product.meta_image
                    ?.map((image) => {
                        const imagePath = path.join(
                            __dirname,
                            "../../public/dist/product/",
                            image.trim()
                        );
                        try {
                            if (
                                image &&
                                image.trim() !== "" &&
                                fs.existsSync(imagePath)
                            ) {
                                return image;
                            } else {
                                return null;
                            }
                        } catch (err) {
                            return null;
                        }
                    })
                    .filter(Boolean);
            }

            return res.send({
                message: "Success",
                success: true,
                products: responseData,
                mediaUrl,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Something went wrong please try again later",
                error: error.message,
            });
        }
    };
    //#endregion

    //#region get_all_attribute for product Add
    static getAllAttributes = async (req, res) => {
        try {
            let reponseData = [];
            let attributeSet = await AttributeSets.find();

            for (let i = 0; i < attributeSet.length; i++) {
                let attributeSetId = attributeSet[i]._id;

                let attributevalue = await AttributeValue.find({
                    attribute_sets_id: attributeSetId,
                });
                let attributeset = await AttributeSets.findOne({
                    _id: attributeSetId,
                });

                let result = {
                    category_id: attributeset.category_id,
                    _id: attributeset._id,
                    title: attributeset.title,
                    created_at: attributeset.created_at,
                    updated_at: attributeset.updated_at,
                    __v: attributeset.__v,
                    attributeValues: attributevalue,
                };
                reponseData.push(result);
            }

            return res.send({
                message: "Success",
                success: true,
                data: reponseData,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                message: "Error in getting product attribute " + error.message,
            });
        }
    };
    //#endregion

    //#region get_slider
    static get_slider = async (req, res) => {
        try {
            let mediaUrl = baseURL + "/dist/slider/";
            await config.createSliderStatus();
            let status = await Status.findOne({
                type: { $regex: new RegExp("slider", "i") },
                name: { $regex: new RegExp("active", "i") },
            });

            const sliders = await Slider.find({ status_id: status._id })
                .populate("status_id")
                .sort({ created_at: -1 });

            return res.send({
                message: "Success",
                success: true,
                data: sliders,
                mediaUrl,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                message: "Error get all sliders " + error.message,
            });
        }
    };
    //#endregion get_slider

    //#region get_all_brands for product Add
    static getAllBrands = async (req, res) => {
        try {
            await config.createBrandStatus();
            let status = await Status.findOne({
                type: { $regex: new RegExp("brand", "i") },
                name: { $regex: new RegExp("active", "i") },
            });
            const brandData = await Brand.find({ status_id: status._id })
                .populate("status_id")
                .sort({ created_at: -1 });

            return res.send({
                message: "Success",
                success: true,
                data: brandData,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                message: "Error get all brands " + error.message,
            });
        }
    };
    //#endregion

    //#region get_all_categories for product Add
    static getAllCategories = async (req, res) => {
        try {
            await config.createCategoryStatus();
            let status = await Status.findOne({
                type: { $regex: new RegExp("category", "i") },
                name: { $regex: new RegExp("active", "i") },
            });

            const categories = await Category.aggregate([
                {
                    $match: {
                        parent_id: null,
                        status_id: status._id,
                    },
                },
                {
                    $lookup: {
                        from: "Category",
                        localField: "_id",
                        foreignField: "parent_id",
                        as: "children",
                    },
                },
            ]);

            // set default image if necessary
            categories.forEach((category) => {
                category.icon =
                    category.icon && category.icon.trim() !== ""
                        ? category.icon
                        : defaultImage;
            });

            const populateChildren = async (category) => {
                const children = await Category.find({
                    parent_id: category._id,
                    status_id: status._id,
                });
                category.children = children;
            };

            await Promise.all(categories.map(populateChildren));
            return res.send({
                message: "Success",
                success: true,
                data: categories,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                message: "Error get all categories " + error.message,
            });
        }
    };
    //#endregion

    //#region get_all_faqs
    static get_all_faqs = async (req, res) => {
        try {
            const faqs = await Faq.find().sort({ created_at: -1 });
            return res.send({
                message: "Success",
                success: true,
                data: faqs,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                message: "Error get all faqs " + error.message,
            });
        }
    };
    //#endregion

    //#region get_all_banners
    static get_all_banners = async (req, res) => {
        try {
            let mediaUrl = baseURL + "/dist/banner/";
            const banners = await Banner.findOne().sort({ created_at: -1 });

            // Helper function to construct image URL or fallback to default
            const getImageUrl = async (image) => {
                if (image && image.trim() !== "") {
                    const imagePath = path.join(
                        __dirname,
                        "../../public/dist/banner/",
                        image.trim()
                    );

                    try {
                        // Check if the image file exists
                        await fs.promises.access(imagePath, fs.constants.F_OK);
                        return mediaUrl + image.trim();
                    } catch (err) {
                        return defaultImage;
                    }
                } else {
                    return defaultImage;
                }
            };

            // Set the image URLs for each banner, falling back to the default image if necessary
            const response = {
                home_banner_top: {
                    image: await getImageUrl(banners?.home_banner_top?.image),
                    url: banners?.home_banner_top?.url?.trim(),
                    title: banners?.home_banner_top?.title?.trim(),
                    description: banners?.home_banner_top?.description?.trim(),
                },
                home_banner_2: {
                    image: await getImageUrl(banners?.home_banner_2?.image),
                    url: banners?.home_banner_2?.url?.trim(),
                    title: banners?.home_banner_top?.title?.trim(),
                    description: banners?.home_banner_top?.description?.trim(),
                },
                home_banner_3: {
                    image: await getImageUrl(banners?.home_banner_3?.image),
                    url: banners?.home_banner_3?.url?.trim(),
                    title: banners?.home_banner_top?.title?.trim(),
                    description: banners?.home_banner_top?.description?.trim(),
                },
                home_banner_4: {
                    image: await getImageUrl(banners?.home_banner_4?.image),
                    url: banners?.home_banner_4?.url?.trim(),
                    title: banners?.home_banner_top?.title?.trim(),
                    description: banners?.home_banner_top?.description?.trim(),
                },
                subscription_banner: {
                    image: await getImageUrl(
                        banners?.subscription_banner?.image
                    ),
                    url: banners?.subscription_banner?.url?.trim(),
                    title: banners?.home_banner_top?.title?.trim(),
                    description: banners?.home_banner_top?.description?.trim(),
                },
                _id: banners?._id,
                created_at: banners?.created_at,
                updated_at: banners?.updated_at,
            };

            return res.send({
                message: "Success",
                success: true,
                data: response,
                mediaUrl,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                message: "Error getting all banners: " + error.message,
            });
        }
    };
    //#endregion

    //#region get web settings data
    static get_webSettings_data = async (req, res) => {
        try {
            let mediaUrl = baseURL + "/dist/websetting/";
            const data = await WebSetting.findOne().sort({ created_at: -1 });

            // Helper function to construct image URL or fallback to default
            const getLogoUrl = async (logo) => {
                if (logo && logo.trim() !== "") {
                    const logoPath = path.join(
                        __dirname,
                        "../../public/dist/websetting/",
                        logo.trim()
                    );

                    try {
                        // Check if the image file exists
                        await fs.promises.access(logoPath, fs.constants.F_OK);
                        return mediaUrl + logo.trim();
                    } catch (err) {
                        return defaultImage;
                    }
                } else {
                    return defaultImage;
                }
            };

            // Set the image URLs for each banner, falling back to the default image if necessary
            const response = {
                logo: await getLogoUrl(data?.logo),
                address: data?.address ? data?.address : "",
                phone: data?.phone ? data?.phone : "",
                email: data?.email ? data?.email : "",
                toll_number: data?.toll_number ? data?.toll_number : "",
                copyright: data?.copyright ? data?.copyright : "",
                twitter: data?.twitter ? data?.twitter : "",
                facebook: data?.facebook ? data?.facebook : "",
                instagram: data?.instagram ? data?.instagram : "",
            };

            return res.send({
                message: "Success",
                success: true,
                data: response,
                mediaUrl,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                message: "Error getting all banners: " + error.message,
            });
        }
    };

    static get_static_pages = async (req, res) => {
        try {
            await config.createPagesStatus();
            // Find the status object for active pages
            let status = await Status.findOne({
                type: { $regex: new RegExp("pages", "i") },
                name: { $regex: new RegExp("active", "i") },
            });

            // Find the static pages with the matching status_id
            const data = await StaticPage.find({
                status_id: status._id,
            }).populate("status_id");

            const response = data.map((page) => ({
                title: page.title,
                slug: page.slug,
                show_in: page.show_in,
                status: page.status_id,
            }));

            return res.send({
                message: "Success",
                success: true,
                data: response,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                message: "Error getting static pages: " + error.message,
            });
        }
    };

    static get_static_slug_details = async (req, res) => {
        try {
            const { slug } = req.query;
            let mediaUrl = baseURL + "/dist/pages/";
            const data = await StaticPage.findOne({ slug: slug }).populate(
                "status_id"
            );
            if (!data) {
                return res.status(404).send({
                    message: "Data Not Found",
                    success: false,
                });
            }

            // set default image if necessary
            if (data.image && data.image.trim() !== "") {
                const imagePath = path.join(
                    __dirname,
                    "../../public/dist/pages/",
                    data.image.trim()
                );

                try {
                    await fs.promises.access(imagePath, fs.constants.F_OK);
                    data.image = mediaUrl + data.image.trim();
                } catch (err) {
                    data.image = defaultImage;
                }
            }

            return res.send({
                message: "Success",
                success: true,
                data: data,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                message:
                    "Error getting static pages slug details: " + error.message,
            });
        }
    };

    static get_razorpayConfig = async (req, res) => {
        try {
            const data = await RazorpayConfig.findOne().populate("status_id");
            return res.send({
                message: "Success",
                success: true,
                data: data,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                message: "Error getting razorpay config: " + error.message,
            });
        }
    };
    static get_smtpConfig = async (req, res) => {
        try {
            const data = await SmtpConfig.findOne();
            return res.send({
                message: "Success",
                success: true,
                data: data,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                message: "Error getting Smtp config: " + error.message,
            });
        }
    };
}

// Helper function to get all child categories recursively
async function getAllCategoryIds(parentCategoryId) {
    const categories = await Category.find({ parent_id: parentCategoryId });
    const categoryIds = categories.map((cat) => cat._id);

    for (let cat of categories) {
        const childCategoryIds = await getAllCategoryIds(cat._id);
        categoryIds.push(...childCategoryIds);
    }

    categoryIds.push(parentCategoryId); // Include the parent category itself
    return categoryIds;
}

module.exports = WebsiteController;
