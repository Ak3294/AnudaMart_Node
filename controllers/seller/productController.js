const Product = require("../../models/Product");
const Category = require("../../models/Category");
const Brand = require("../../models/Brand");
const Status = require("../../models/Status");
const ProductStock = require("../../models/ProductStock");
const AttributeValue = require("../../models/AttributeValue");
const AttributeSets = require("../../models/AttributeSets");
const Unit = require("../../models/Unit");
const multer = require("multer");
const path = require("path");
const root = process.cwd();
const imageFilter = require("../../config/imageFilter");
const pdfFilter = require("../../config/pdfFilter");
const fs = require("fs");
const config = require("../../config/createStatus");

class ProductController {
    static list = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1; // Current page number, default to 1
            const pageSize = parseInt(req.query.pageSize) || 10; // Items per page, default to 10

            const products = await Product.find({
                vendor_id: req.session.seller._id,
            })
                .populate("category_id")
                .sort({ created_at: -1 });

            const totalItems = products.length;

            // Calculate stock for each product
            const productsWithStock = await Promise.all(
                products.map(async (product) => {
                    let totalStock = 0;
                    if (product.variant) {
                        const productStocks = await ProductStock.find({
                            product_id: product._id,
                        });
                        totalStock = productStocks.reduce(
                            (sum, stock) =>
                                sum +
                                stock.current_stock.reduce((a, b) => a + b, 0),
                            0
                        );
                    } else {
                        totalStock = await ProductStock.findOne({
                            product_id: product._id,
                        });
                        totalStock = totalStock
                            ? totalStock.current_stock.reduce(
                                  (a, b) => a + b,
                                  0
                              )
                            : 0;
                    }
                    return {
                        ...product._doc,
                        totalStock,
                    };
                })
            );

            let brand = await Brand.find().sort({ created_at: -1 });
            const categories = await Category.find();
            // Build the category tree
            const buildCategoryTree = (categories, parentId = null) => {
                let categoryTree = [];
                categories
                    .filter(
                        (category) =>
                            String(category.parent_id) === String(parentId)
                    )
                    .forEach((category) => {
                        let categoryItem = {
                            _id: category._id,
                            name: category.name,
                            children: buildCategoryTree(
                                categories,
                                category._id
                            ),
                        };
                        categoryTree.push(categoryItem);
                    });
                return categoryTree;
            };

            // Build the category tree starting with root categories (where parent_id is null)
            const categoryTree = buildCategoryTree(categories);

            // Flatten the category tree for dropdown options
            const flattenCategories = (categoryTree, prefix = "") => {
                let flatCategories = [];
                categoryTree.forEach((category) => {
                    flatCategories.push({
                        _id: category._id,
                        name: category.name,
                        prefix,
                    });
                    if (category.children.length > 0) {
                        flatCategories = flatCategories.concat(
                            flattenCategories(category.children, prefix + "¦--")
                        );
                    }
                });
                return flatCategories;
            };

            // Flatten the tree for simple dropdown options
            const categoriesForDropdown = flattenCategories(categoryTree);

            return res.render("seller/products", {
                products: productsWithStock,
                currentPage: page,
                pageSize,
                totalItems,
                brand,
                categoriesForDropdown,
            });
        } catch (error) {
            console.error("Error fetching Product List:", error);
            return res.status(500).send({
                message: "Error fetching Product List: " + error.message,
            });
        }
    };

    static addGet = async (req, res) => {
        try {
            const categories = await Category.find();
            // Build the category tree
            const buildCategoryTree = (categories, parentId = null) => {
                let categoryTree = [];
                categories
                    .filter(
                        (category) =>
                            String(category.parent_id) === String(parentId)
                    )
                    .forEach((category) => {
                        let categoryItem = {
                            _id: category._id,
                            name: category.name,
                            children: buildCategoryTree(
                                categories,
                                category._id
                            ),
                        };
                        categoryTree.push(categoryItem);
                    });
                return categoryTree;
            };

            // Build the category tree starting with root categories (where parent_id is null)
            const categoryTree = buildCategoryTree(categories);

            // Flatten the category tree for dropdown options
            const flattenCategories = (categoryTree, prefix = "") => {
                let flatCategories = [];
                categoryTree.forEach((category) => {
                    flatCategories.push({
                        _id: category._id,
                        name: category.name,
                        prefix,
                    });
                    if (category.children.length > 0) {
                        flatCategories = flatCategories.concat(
                            flattenCategories(category.children, prefix + "¦--")
                        );
                    }
                });
                return flatCategories;
            };

            // Flatten the tree for simple dropdown options
            const categoriesForDropdown = flattenCategories(categoryTree);

            let vendor = req.session.seller._id;
            let brand = await Brand.find().sort({ created_at: -1 });

            await config.createProductStatus();
            let status = await Status.find({
                type: "product",
            }).sort({ created_at: -1 });

            let attributes = await AttributeSets.find()
                .sort({ created_at: -1 })
                .populate("category_id");
            let attributeValues = await AttributeValue.find()
                .sort({ created_at: -1 })
                .populate("attribute_sets_id");
            let unit = await Unit.find().sort({ created_at: -1 });

            return res.render("seller/add-product", {
                vendor,
                brand,
                status,
                attributes,
                attributeValues,
                categoriesForDropdown,
                unit,
            });
        } catch (error) {
            console.error("Error fetching Product Add:", error);
            return res.status(500).send({
                message: "Error fetching Product Add: " + error.message,
            });
        }
    };

    static getAttributeValues = async (req, res) => {
        try {
            const attributeSetIds = req.body.attributeSetIds; // Assuming you send IDs as a POST request
            const attributeSetIdArr = await AttributeSets.find({
                _id: { $in: attributeSetIds },
            }).sort({ title: 1 });

            if (!attributeSetIdArr || attributeSetIdArr.length === 0) {
                return res.status(404).json({
                    message: "No attribute sets found",
                });
            }
            let allAttributeValues = [];
            let html = "";
            for (const attributeSet of attributeSetIdArr) {
                const attributeValues = await AttributeValue.find({
                    attribute_sets_id: attributeSet._id,
                }).populate("attribute_sets_id");

                // Concatenate the results
                if (attributeValues.length > 0) {
                    allAttributeValues =
                        allAttributeValues.concat(attributeValues);
                }
                html +=
                    '<div class="form-group row">\
                    <div class="col-md-3">\
                        <input type="text" class="form-control" value="' +
                    attributeSet.title +
                    '" disabled>\
                    </div>\
                    <div class="col-md-9">\
                        <select class="form-control select2 variant" name="attribute_values_' +
                    attributeSet._id +
                    '" multiple>';
                for (const attributeValue of attributeValues) {
                    html +=
                        '<option value="' +
                        attributeValue._id +
                        '">' +
                        attributeValue.value +
                        "</option>";
                }
                html +=
                    "</select>\
                    </div>\
                </div>";
            }
            return res.status(200).json(html);
        } catch (error) {
            console.error("Error fetching Prodcuts Attribute Values:", error);
            return res.status(500).send({
                message:
                    "Error fetching Prodcuts Attribute Values: " +
                    error.message,
            });
        }
    };

    static getVariants = async (req, res) => {
        try {
            const variants = [];
            const attributeSetIds = req.body.attribute_sets_id; // Assuming you send IDs as a POST request

            if (attributeSetIds) {
                if (typeof attributeSetIds === "string") {
                    const attribute_values_key =
                        req.body["attribute_values_" + attributeSetIds];

                    const values = [];
                    if (Array.isArray(attribute_values_key)) {
                        attribute_values_key.forEach((value) => {
                            values.push(value);
                        });
                    } else {
                        values.push(attribute_values_key);
                    }

                    // Push values to variants array
                    if (attribute_values_key) {
                        variants.push(values);
                    }
                } else {
                    attributeSetIds.forEach((attribute_set) => {
                        const attribute_values_key =
                            req.body["attribute_values_" + attribute_set];

                        const values = [];
                        if (Array.isArray(attribute_values_key)) {
                            attribute_values_key.forEach((value) => {
                                values.push(value);
                            });
                        } else {
                            values.push(attribute_values_key);
                        }

                        // Push values to variants array
                        if (attribute_values_key) {
                            variants.push(values);
                        }
                    });
                }
            }

            let variants_data = variants;
            let all_variants = [{}]; // Initialize with an empty object

            for (const key of Object.keys(variants_data)) {
                const value = variants_data[key];
                const values = [];

                for (const variant of all_variants) {
                    for (const property_value of value) {
                        // Create a new variant by merging current variant with the new property key-value pair
                        const new_variant = {
                            ...variant,
                            [key]: property_value,
                        };
                        values.push(new_variant);
                    }
                }
                all_variants = values;
            }
            const totalCount = await Product.countDocuments();
            const productId = totalCount ? totalCount + 1 : 1;

            let html =
                '<table class="table table-striped table-bordered product-variant-table">';
            if (attributeSetIds) {
                html +=
                    '<thead>\
                <tr>\
                    <td scope="col">Variant</td>\
                    <td scope="col">Price*</td>\
                    <td scope="col">SKU*</td>\
                    <td scope="col">Current *</td>\
                    <td scope="col">Image</td>\
                    <td>Action</td>\
                </tr>\
                </thead>\
                <tbody>';
                for (const [index, variant] of Object.entries(all_variants)) {
                    let variantName = "";
                    let variantIds = "";
                    let variant_name = "";
                    for (const [key, item] of Object.entries(variant)) {
                        const attributeValue = await AttributeValue.findById(
                            item
                        );

                        if (key > 0) {
                            variantName += `-${attributeValue.value.replace(
                                " ",
                                ""
                            )}`;
                            variantIds += `-${attributeValue.id.replace(
                                " ",
                                ""
                            )}`;
                        } else {
                            variantName += attributeValue.value.replace(
                                " ",
                                ""
                            );
                            variantIds += attributeValue.id.replace(" ", "");
                        }
                    }
                    let price = 0;
                    let current_stock = 0;
                    const variantTitle = variantName;
                    let image = "";
                    let variantSKU = variantTitle + variant_name;
                    if (Array.isArray(req.body.variant_name)) {
                        const index =
                            req.body.variant_name.indexOf(variantTitle);
                        if (index !== -1) {
                            price = req.body.price[index];
                            current_stock = req.body.current_stock[index];
                        }
                    }
                    variantSKU += `-${productId}`;
                    if (req.body.loadtime) {
                        const existingStock = await ProductStock.findOne({
                            product_id: req.body.loadtime,
                        });
                        if (existingStock) {
                            if (Array.isArray(existingStock.name)) {
                                const indexEdit =
                                    existingStock.name.indexOf(variantTitle);
                                if (indexEdit !== -1) {
                                    price = existingStock.price[indexEdit];
                                    current_stock =
                                        existingStock.current_stock[indexEdit];
                                    variantSKU = existingStock.sku[indexEdit];
                                    variantIds =
                                        existingStock.attribute_value_id[
                                            indexEdit
                                        ];
                                    image = existingStock.image[indexEdit];
                                }
                            }
                        }
                    }
                    html += "<tr>";
                    html += '<th scope="row" width="18%">';
                    html +=
                        '<label class="font-normal">' +
                        variantTitle +
                        "</label>";
                    html +=
                        '<input type="hidden" lang="en" name="variant_name" value="' +
                        variantTitle +
                        '" class="form-control">';
                    html +=
                        '<input type="hidden" lang="en" name="variant_ids" value="' +
                        variantIds +
                        '" class="form-control">';
                    html +=
                        '<input type="hidden" lang="en" name="image" value="' +
                        image +
                        '" class="form-control">';
                    html += "</th>";
                    html += '<td width="18%">';
                    html +=
                        '<input type="number" lang="en" name="price" value="' +
                        price +
                        '" min="0" step="any" class="form-control">';
                    html += "</td>";
                    html += '<td width="18%">';
                    html +=
                        '<input type="text" name="sku" value="' +
                        variantSKU +
                        '" class="form-control">';
                    html += "</td>";
                    html += '<td width="18%">';
                    html +=
                        '<input type="number" lang="en" name="current_stock" value="' +
                        current_stock +
                        '" min="0" step="1" class="form-control">';
                    html += "</td>";
                    html += '<td width="22%">';
                    html +=
                        '<input type="file" name="image" id="image' +
                        index +
                        '" multiple class="form-control" />';
                    if (image) {
                        const filePath = path.join(
                            root,
                            "/public/dist/product/",
                            image
                        );
                        if (fs.existsSync(filePath)) {
                            html +=
                                '<div class="mb-2 mt-2" id="previewthumbnailicon" >';
                            html +=
                                '<img src="/dist/product/' +
                                image +
                                '" id="display_preview_thumbnail_icon" style=" margin: 5px; width: 100px; height: 100px; " />';
                            html += "</div>";
                        }
                    }
                    html += "</td>";
                    html += '<td width="6%">';
                    html +=
                        '<button type="button" class="btn btn-icon btn-sm btn-danger remove-menu-row" onclick="$(this).closest(\'tr\').remove();"><i class="bx bx-trash"></i></button>';
                    html += "</td>";
                    html += "</tr>";
                }
                html += "</tbody>";
            }
            html += "</table>";
            return res.status(200).json(html);
        } catch (error) {
            console.log("Error fetching Prodcuts Variants:", error);
            return res.status(500).send({
                message:
                    "Error fetching Prodcuts Attribute Values: " +
                    error.message,
            });
        }
    };

    static add_product = async (req, res) => {
        try {
            upload(req, res, async function (err) {
                if (err) {
                    return res.status(400).send({
                        message: "Error uploading files: " + err.message,
                    });
                }
                if (req.fileValidationError) {
                    return res.status(400).send({
                        message: req.fileValidationError,
                    });
                }

                // Check if slug is unique
                const existingProduct = await Product.findOne({
                    slug: req.body.slug,
                });
                if (existingProduct) {
                    return res.status(400).send({
                        message: `Slug "${req.body.slug}" must be unique. This slug already exists.`,
                    });
                }

                // Fetch the active and inactive statuses
                const activeStatus = await Status.findOne({
                    type: "product",
                    name: { $regex: new RegExp("^active$", "i") },
                });

                const inactiveStatus = await Status.findOne({
                    type: "product",
                    name: { $regex: new RegExp("^inactive$", "i") },
                });

                const data = req.body;
                const files = req.files || {};

                let attribute_sets_id;
                let selected_variants = {};
                let selected_variants_ids = [];

                if (data.attribute_sets_id) {
                    attribute_sets_id = Array.isArray(data.attribute_sets_id)
                        ? data.attribute_sets_id
                        : [data.attribute_sets_id];
                    attribute_sets_id.forEach((item) => {
                        if (!selected_variants[item]) {
                            selected_variants[item] = [];
                        }
                        let attributeValueId = Array.isArray(
                            data["attribute_values_" + item]
                        )
                            ? data["attribute_values_" + item]
                            : [data["attribute_values_" + item]];
                        selected_variants[item] = attributeValueId;
                        attributeValueId.forEach((itemId) => {
                            selected_variants_ids.push(itemId);
                        });
                    });
                } else {
                    attribute_sets_id = [];
                    selected_variants = [];
                    selected_variants_ids = [];
                }

                const insertRecord = new Product({
                    attribute_sets: attribute_sets_id,
                    selected_variants: selected_variants,
                    selected_variants_ids: selected_variants_ids,
                    vendor_id: req.session.seller._id
                        ? req.session.seller._id
                        : "",
                    product_name: data.product_name,
                    category_id: data.category_id,
                    brand_id: data.brand_id,
                    unit_id: data.unit_id,
                    min_order_quantity: data.min_order_quantity,
                    tags: data.tags,
                    slug: data.slug,
                    status_id:
                        data.status_id === "on"
                            ? activeStatus._id
                            : inactiveStatus._id,
                    thumbnail: files.thumbnail
                        ? files.thumbnail[0].filename
                        : "",
                    gallery_image: Array.isArray(files.gallery_image)
                        ? files.gallery_image.map((f) => f.filename)
                        : files.gallery_image
                        ? [files.gallery_image[0].filename]
                        : [],
                    video_url: data.video_url,
                    unit_price: data.unit_price,
                    special_discount_type: data.special_discount_type,
                    special_discount: data.special_discount,
                    special_discount_period: data.special_discount_period,
                    min_stock_quantity: data.min_stock_quantity,
                    stock_visibility: data.stock_visibility,
                    variant: data.variant === "on" ? true : false,
                    short_description: data.short_description.replace(
                        /<\/?[^>]+(>|$)/g,
                        ""
                    ),
                    long_description: data.long_description.replace(
                        /<\/?[^>]+(>|$)/g,
                        ""
                    ),
                    description_image: Array.isArray(files.description_image)
                        ? files.description_image.map((f) => f.filename)
                        : files.description_image
                        ? [files.description_image[0].filename]
                        : [],
                    pdf: files.pdf ? files.pdf[0].filename : "",
                    is_featured: data.is_featured === "on" ? true : false,
                    todays_deal: data.todays_deal === "on" ? true : false,
                    meta_title: data.meta_title,
                    meta_description: data.meta_description,
                    meta_keywords: data.meta_keywords,
                    meta_image: Array.isArray(files.meta_image)
                        ? files.meta_image.map((f) => f.filename)
                        : files.meta_image
                        ? [files.meta_image[0].filename]
                        : [],
                });
                if (data.variant === "on") {
                    const attributeValueIds = Array.isArray(data.variant_ids)
                        ? data.variant_ids
                        : [data.variant_ids];
                    const variant_name = Array.isArray(data.variant_name)
                        ? data.variant_name
                        : [data.variant_name];
                    const skus = Array.isArray(data.sku)
                        ? data.sku
                        : [data.sku];
                    const currentStocks = Array.isArray(data.current_stock)
                        ? data.current_stock
                        : [data.current_stock];
                    const prices = Array.isArray(data.price)
                        ? data.price
                        : [data.price];
                    const images = Array.isArray(files.image)
                        ? files.image.map((f) => f.filename)
                        : [];

                    const filteredAttributeValueIds = attributeValueIds.filter(
                        (val) => val
                    );
                    const filteredSkus = skus.filter((val) => val);
                    const filteredvVariantName = variant_name.filter(
                        (val) => val
                    );
                    const filteredCurrentStocks = currentStocks.filter(
                        (val) => val
                    );
                    const filteredPrices = prices.filter((val) => val);

                    // validate if SKU is unique
                    for (let sku of filteredSkus) {
                        const existingStock = await ProductStock.findOne({
                            sku,
                        });
                        if (existingStock) {
                            return res.status(400).send({
                                message: `SKU "${sku}" must be unique. This SKU already exists.`,
                            });
                        }
                    }

                    const productStock = new ProductStock({
                        attribute_value_id: filteredAttributeValueIds,
                        product_id: insertRecord._id,
                        sku: filteredSkus,
                        name: filteredvVariantName,
                        current_stock: filteredCurrentStocks,
                        price: filteredPrices,
                        image: images,
                    });
                    await productStock.save();
                } else {
                    const existingStock = await ProductStock.findOne({
                        sku: data.sku,
                    });
                    if (existingStock) {
                        return res.status(400).send({
                            message: `SKU "${data.sku}" must be unique. This SKU already exists.`,
                        });
                    }
                    const productStock = new ProductStock({
                        product_id: insertRecord._id,
                        sku: data.sku,
                        current_stock: data.current_stock,
                    });
                    await productStock.save();
                }
                await insertRecord.save();
                return res.send({
                    status: 200,
                    message: "Product added successfully",
                });
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .send({ message: "Error creating Product: " + error.message });
        }
    };

    static editGET = async (req, res) => {
        try {
            const id = req.params.id;
            const categories = await Category.find();
            // Build the category tree
            const buildCategoryTree = (categories, parentId = null) => {
                let categoryTree = [];
                categories
                    .filter(
                        (category) =>
                            String(category.parent_id) === String(parentId)
                    )
                    .forEach((category) => {
                        let categoryItem = {
                            _id: category._id,
                            name: category.name,
                            children: buildCategoryTree(
                                categories,
                                category._id
                            ),
                        };
                        categoryTree.push(categoryItem);
                    });
                return categoryTree;
            };

            // Build the category tree starting with root categories (where parent_id is null)
            const categoryTree = buildCategoryTree(categories);

            // Flatten the category tree for dropdown options
            const flattenCategories = (categoryTree, prefix = "") => {
                let flatCategories = [];
                categoryTree.forEach((category) => {
                    flatCategories.push({
                        _id: category._id,
                        name: category.name,
                        prefix,
                    });
                    if (category.children.length > 0) {
                        flatCategories = flatCategories.concat(
                            flattenCategories(category.children, prefix + "¦--")
                        );
                    }
                });
                return flatCategories;
            };

            // Flatten the tree for simple dropdown options
            const categoriesForDropdown = flattenCategories(categoryTree);

            let vendor = req.session.seller._id;
            let brand = await Brand.find().sort({ created_at: -1 });
            let attributes = await AttributeSets.find()
                .sort({ created_at: -1 })
                .populate("category_id");
            let attributeValues = await AttributeValue.find()
                .sort({ created_at: -1 })
                .populate("attribute_sets_id");

            const product = await Product.findOne({
                _id: id,
            }).populate("category_id brand_id status_id vendor_id unit_id");

            const productStock = await ProductStock.findOne({
                product_id: id,
            });
            let unit = await Unit.find().sort({ created_at: -1 });

            await config.createProductStatus();
            const activeStatus = await Status.findOne({
                type: "product",
                name: { $regex: new RegExp("^active$", "i") },
            });
            return res.render("seller/edit-product", {
                vendor,
                brand,
                attributes,
                attributeValues,
                categoriesForDropdown,
                product,
                productStock,
                unit,
                activeStatus,
            });
        } catch (error) {
            console.error("Error fetching Product Add:", error);
            return res.status(500).send({
                message: "Error fetching Product Add: " + error.message,
            });
        }
    };

    static editPOST = async (req, res) => {
        try {
            editupload(req, res, async function (err) {
                if (err) {
                    return res.status(400).send({
                        message: "Error uploading files: " + err.message,
                    });
                }
                if (req.fileValidationError) {
                    return res.status(400).send({
                        message: req.fileValidationError,
                    });
                }

                const product = await Product.findOne({
                    _id: req.body.editid,
                });
                if (!product) {
                    return res
                        .status(404)
                        .send({ message: "editid not found" });
                }

                // Check if slug is unique
                const existingSlug = await Product.findOne({
                    slug: req.body.slug,
                    _id: { $ne: req.body.editid },
                });
                if (existingSlug) {
                    return res.status(400).send({
                        success: false,
                        message: `Slug "${req.body.slug}" must be unique. This slug already exists.`,
                    });
                }

                // Fetch the active and inactive statuses
                const activeStatus = await Status.findOne({
                    type: "product",
                    name: { $regex: new RegExp("^active$", "i") },
                });

                const inactiveStatus = await Status.findOne({
                    type: "product",
                    name: { $regex: new RegExp("^inactive$", "i") },
                });

                const data = req.body;
                const files = req.files || {};

                let attribute_sets_id;
                let selected_variants = {};
                let selected_variants_ids = [];
                if (data.attribute_sets_id) {
                    attribute_sets_id = Array.isArray(data.attribute_sets_id)
                        ? data.attribute_sets_id
                        : [data.attribute_sets_id];
                    attribute_sets_id.forEach((item) => {
                        if (!selected_variants[item]) {
                            selected_variants[item] = [];
                        }
                        let attributeValueId = Array.isArray(
                            data["attribute_values_" + item]
                        )
                            ? data["attribute_values_" + item]
                            : [data["attribute_values_" + item]];
                        selected_variants[item] = attributeValueId;
                        attributeValueId.forEach((itemId) => {
                            selected_variants_ids.push(itemId);
                        });
                    });
                } else {
                    attribute_sets_id = [];
                    selected_variants = {};
                    selected_variants_ids = [];
                }
                const updatedData = {
                    attribute_sets: attribute_sets_id,
                    selected_variants: selected_variants,
                    selected_variants_ids: selected_variants_ids,
                    vendor_id: req.session.seller._id
                        ? req.session.seller._id
                        : "",
                    product_name: data.product_name,
                    category_id: data.category_id,
                    brand_id: data.brand_id,
                    unit_id: data.unit_id,
                    min_order_quantity: data.min_order_quantity,
                    tags: data.tags,
                    slug: data.slug,
                    status_id:
                        data.status_id === "on"
                            ? activeStatus._id
                            : inactiveStatus._id,
                    thumbnail: files.thumbnail
                        ? files.thumbnail[0].filename
                        : product.thumbnail,
                    gallery_image: Array.isArray(files.gallery_image)
                        ? files.gallery_image.map((f) => f.filename)
                        : files.gallery_image
                        ? [files.gallery_image[0].filename]
                        : product.gallery_image,
                    video_url: data.video_url,
                    unit_price: data.unit_price,
                    special_discount_type: data.special_discount_type,
                    special_discount: data.special_discount,
                    special_discount_period: data.special_discount_period,
                    min_stock_quantity: data.min_stock_quantity,
                    stock_visibility: data.stock_visibility,
                    variant: data.variant === "on" ? true : false,
                    short_description: data.short_description,
                    long_description: data.long_description.replace(
                        /<\/?[^>]+(>|$)/g,
                        ""
                    ),
                    description_image: Array.isArray(files.description_image)
                        ? files.description_image.map((f) => f.filename)
                        : files.description_image
                        ? [files.description_image[0].filename]
                        : product.description_image,
                    pdf: files.pdf ? files.pdf[0].filename : product.pdf,
                    is_featured: data.is_featured === "on" ? true : false,
                    todays_deal: data.todays_deal === "on" ? true : false,
                    meta_title: data.meta_title,
                    meta_description: data.meta_description,
                    meta_keywords: data.meta_keywords,
                    meta_image: Array.isArray(files.meta_image)
                        ? files.meta_image.map((f) => f.filename)
                        : files.meta_image
                        ? [files.meta_image[0].filename]
                        : product.meta_image,
                    updated_at: Date.now(),
                };
                if (data.variant === "on") {
                    const attributeValueIds = Array.isArray(data.variant_ids)
                        ? data.variant_ids
                        : [data.variant_ids];
                    const variant_name = Array.isArray(data.variant_name)
                        ? data.variant_name
                        : [data.variant_name];
                    const skus = Array.isArray(data.sku)
                        ? data.sku
                        : [data.sku];
                    const currentStocks = Array.isArray(data.current_stock)
                        ? data.current_stock
                        : [data.current_stock];
                    const prices = Array.isArray(data.price)
                        ? data.price
                        : [data.price];
                    const images = Array.isArray(files.image)
                        ? files.image.map((f) => f.filename)
                        : [];

                    const filteredAttributeValueIds = attributeValueIds.filter(
                        (val) => val
                    );
                    const filteredSkus = skus.filter((val) => val);
                    const filteredvVariantName = variant_name.filter(
                        (val) => val
                    );
                    const filteredCurrentStocks = currentStocks.filter(
                        (val) => val
                    );
                    const filteredPrices = prices.filter((val) => val);

                    const productStock = await ProductStock.findOne({
                        product_id: product._id,
                    });
                    if (!productStock) {
                        const newProductStock = new ProductStock({
                            attribute_value_id: filteredAttributeValueIds,
                            product_id: product._id,
                            sku: filteredSkus,
                            name: filteredvVariantName,
                            current_stock: filteredCurrentStocks,
                            price: filteredPrices,
                            image: images,
                        });
                        await newProductStock.save();
                    } else {
                        await ProductStock.findByIdAndUpdate(
                            { _id: productStock._id },
                            {
                                attribute_value_id: filteredAttributeValueIds,
                                sku: filteredSkus,
                                name: filteredvVariantName,
                                current_stock: filteredCurrentStocks,
                                price: filteredPrices,
                                image: images,
                            }
                        );
                    }
                } else {
                    const productStock = await ProductStock.findOne({
                        product_id: product._id,
                    });
                    if (!productStock) {
                        return res.status(404).send({
                            message: "Product Stock not found",
                        });
                    }
                    await ProductStock.updateOne(
                        { _id: productStock._id },
                        {
                            sku: data.sku,
                            current_stock: data.current_stock,
                        }
                    );
                }
                await Product.findByIdAndUpdate(
                    { _id: req.body.editid },
                    updatedData
                );
                return res.send({
                    success: true,
                    status: 200,
                    message: "Product updated successfully",
                });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error fetching Product Add: " + error.message,
            });
        }
    };

    static delete = async (req, res) => {
        try {
            if (Array.isArray(req.body.ids)) {
                // Handle multiple deletions
                await Product.deleteMany({ _id: { $in: req.body.ids } });
                return res.send({
                    success: true,
                    status: 200,
                    message: "Products deleted successfully",
                });
            } else if (req.params.id) {
                // Handle single deletion
                await Product.findByIdAndDelete(req.params.id);
                return res.send({
                    success: true,
                    status: 200,
                    message: "Product deleted successfully",
                });
            } else {
                return res.status(400).send({
                    message:
                        "Invalid request. Provide a product ID or a list of IDs.",
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: "Error deleting product(s): " + error.message,
            });
        }
    };
}

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: path.join(root, "/public/dist/product"),
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

// Combined file filter
const fileFilter = function (req, file, cb) {
    const imageFields = [
        "thumbnail",
        "gallery_image",
        "description_image",
        "meta_image",
        "image",
    ];
    if (imageFields.includes(file.fieldname)) {
        imageFilter(req, file, cb);
    } else if (file.fieldname === "pdf") {
        pdfFilter(req, file, cb);
    } else {
        req.fileValidationError = "Unexpected field";
        return cb(new Error("Unexpected field"), false);
    }
};

// Init Upload
const upload = multer({
    storage: storage,
    // limits: {
    //     fileSize: 5000000
    // },
    fileFilter: fileFilter,
}).fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "gallery_image", maxCount: 10 },
    { name: "description_image", maxCount: 10 },
    { name: "pdf", maxCount: 1 },
    { name: "meta_image", maxCount: 10 },
    { name: "image", maxCount: 10 },
]);

// Init Upload
const editupload = multer({
    storage: storage,
    // limits: {
    //     fileSize: 5000000
    // },
    fileFilter: fileFilter,
}).fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "gallery_image", maxCount: 10 },
    { name: "description_image", maxCount: 10 },
    { name: "pdf", maxCount: 1 },
    { name: "meta_image", maxCount: 10 },
    { name: "image", maxCount: 10 },
]);

module.exports = ProductController;
