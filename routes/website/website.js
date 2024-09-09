const router = require("express").Router();
const { NotLoggedIn } = require("../../middlewares/WebAuth");
const websiteController = require("../../controllers/website/websiteController");

router.get("/category", websiteController.category);
router.get("/category/:parent_id", websiteController.category);
router.post("/products_by_category", websiteController.products_by_category);
router.post("/get_all_products", websiteController.get_all_products);
router.post("/get_product_details", websiteController.get_product_details);
router.get(
    "/get_todaysDeal_products",
    websiteController.get_todaysDeal_products
);
router.post("/get_related_products", websiteController.get_related_products);
router.get("/get_all_brands", websiteController.get_all_brands);
router.post("/filter", websiteController.filter);
router.post("/search_products", websiteController.search_products);

router.get("/get_sliders", websiteController.get_slider);

//#region get all values For Add Product
router.get("/getAllBrands", websiteController.getAllBrands);
router.get("/get_all_categories", websiteController.getAllCategories);
router.get("/get_all_attributes", websiteController.getAllAttributes);
//#endregion

router.get("/get_all_faqs", websiteController.get_all_faqs);
router.get("/get_all_banners", websiteController.get_all_banners);
router.get("/get_webSettings_data", websiteController.get_webSettings_data);
router.get("/get_static_pages", websiteController.get_static_pages);
router.get(
    "/get_static_slug_details",
    websiteController.get_static_slug_details
);
router.get(
    "/get_razorpayConfig",
    NotLoggedIn,
    websiteController.get_razorpayConfig
);
router.get("/get_smtpConfig", NotLoggedIn, websiteController.get_smtpConfig);

module.exports = router;
