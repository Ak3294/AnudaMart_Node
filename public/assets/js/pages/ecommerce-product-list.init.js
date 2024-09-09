var previewTemplate,
    dropzone,
    perPage = 10,
    editlist = !1,
    checkAll = document.getElementById("checkAll"),
    options =
        (checkAll &&
            (checkAll.onclick = function () {
                for (
                    var e = document.querySelectorAll(
                            '.form-check-all input[type="checkbox"]'
                        ),
                        t = document.querySelectorAll(
                            '.form-check-all input[type="checkbox"]:checked'
                        ).length,
                        i = 0;
                    i < e.length;
                    i++
                )
                    (e[i].checked = this.checked),
                        e[i].checked
                            ? e[i].closest("tr").classList.add("table-active")
                            : e[i]
                                  .closest("tr")
                                  .classList.remove("table-active"),
                        e[i].closest("tr").classList.contains("table-active"),
                        0 < t
                            ? document
                                  .getElementById("remove-actions")
                                  .classList.add("d-none")
                            : document
                                  .getElementById("remove-actions")
                                  .classList.remove("d-none");
            }),
        {
            valueNames: [
                "id",
                "products",
                "discount",
                "stock",
                "price",
                "category",
                "orders",
                "rating",
                "published",
            ],
            page: perPage,
            pagination: !0,
            plugins: [ListPagination({ left: 2, right: 2 })],
        }),
    dropzonePreviewNode = document.querySelector("#dropzone-preview-list"),
    productList =
        (dropzonePreviewNode &&
            ((previewTemplate = dropzonePreviewNode.parentNode.innerHTML),
            dropzonePreviewNode.parentNode.removeChild(dropzonePreviewNode),
            (dropzone = new Dropzone("div.my-dropzone", {
                url: "https://httpbin.org/post",
                method: "post",
                previewTemplate: previewTemplate,
                previewsContainer: "#dropzone-preview",
            }))),
        new List("productList", options).on("updated", function (e) {
            0 == e.matchingItems.length
                ? (document.getElementsByClassName(
                      "noresult"
                  )[0].style.display = "block")
                : (document.getElementsByClassName(
                      "noresult"
                  )[0].style.display = "none");
            var t = 1 == e.i,
                i = e.i > e.matchingItems.length - e.page;
            document.querySelector(".pagination-prev.disabled") &&
                document
                    .querySelector(".pagination-prev.disabled")
                    .classList.remove("disabled"),
                document.querySelector(".pagination-next.disabled") &&
                    document
                        .querySelector(".pagination-next.disabled")
                        .classList.remove("disabled"),
                t &&
                    document
                        .querySelector(".pagination-prev")
                        .classList.add("disabled"),
                i &&
                    document
                        .querySelector(".pagination-next")
                        .classList.add("disabled"),
                e.matchingItems.length <= perPage
                    ? (document.getElementById(
                          "pagination-element"
                      ).style.display = "none")
                    : (document.getElementById(
                          "pagination-element"
                      ).style.display = "flex"),
                e.matchingItems.length == perPage &&
                    document
                        .querySelector(".pagination.listjs-pagination")
                        .firstElementChild.children[0].click(),
                0 < e.matchingItems.length
                    ? (document.getElementsByClassName(
                          "noresult"
                      )[0].style.display = "none")
                    : (document.getElementsByClassName(
                          "noresult"
                      )[0].style.display = "block");
        }));
xhttp.onload = function () {
    var e = JSON.parse(this.responseText);
    Array.from(e).forEach(function (e) {
        productList.add({
            id: `<a href="javascript:void(0);" class="fw-medium link-primary">#TB${e.id}</a>`,
            products:
                '<div class="d-flex align-items-center">                <div class="avatar-xs bg-light rounded p-1 me-2">                    <img src="' +
                e.product[0].img +
                '" alt="' +
                e.product[0].img_alt +
                '" class="img-fluid d-block product-img">                </div>                <div>                    <h6 class="mb-0"><a href="apps-ecommerce-product-details.html" class="text-reset text-capitalize product-title">' +
                e.product[0].title +
                "</a></h6>                </div>            </div>",
            discount: e.discount,
            category: e.category,
            stock: e.stock,
            price: e.price,
            orders: e.orders,
            rating:
                '<span class="badge bg-warning-subtle text-warning"><i class="bi bi-star-fill align-baseline me-1"></i> <span class="rate">' +
                e.ratings +
                "</span></span>",
            published: e.publish,
        }),
            productList.sort("id", { order: "desc" });
    }),
        productList.remove(
            "id",
            '<a href="javascript:void(0);" class="fw-medium link-primary">#TB01</a>'
        ),
        refreshCallbacks(),
        ischeckboxcheck();
};
// xhttp.open("GET", "assets/json/product-list.json");
// xhttp.send();

var idField = document.getElementById("id-field"),
    productTitleField = document.getElementById("product-title-input"),
    productCategoryField = document.getElementById("product-category-input"),
    productStockField = document.getElementById("product-stock-input"),
    productPriceField = document.getElementById("product-price-input"),
    removeBtns = document.getElementsByClassName("remove-item-btn"),
    editBtns = document.getElementsByClassName("edit-item-btn"),
    date = (refreshCallbacks(), new Date().toUTCString().slice(5, 16)),
    // categoryVal = new Choices(productCategoryField, { searchEnabled: !1 }),
    count = 13,
    forms = document.querySelectorAll(".tablelist-form");

function ischeckboxcheck() {
    Array.from(document.getElementsByName("chk_child")).forEach(function (i) {
        i.addEventListener("change", function (e) {
            1 == i.checked
                ? e.target.closest("tr").classList.add("table-active")
                : e.target.closest("tr").classList.remove("table-active");
            var t = document.querySelectorAll(
                '[name="chk_child"]:checked'
            ).length;
            e.target.closest("tr").classList.contains("table-active"),
                0 < t
                    ? document
                          .getElementById("remove-actions")
                          .classList.remove("d-none")
                    : document
                          .getElementById("remove-actions")
                          .classList.add("d-none");
        });
    });
}

function refreshCallbacks() {
    removeBtns &&
        Array.from(removeBtns).forEach(function (e) {
            e.addEventListener("click", function (e) {
                e.target.closest("tr").children[1].innerText,
                    (itemId = e.target.closest("tr").children[1].innerText);
                e = productList.get({ id: itemId });
                Array.from(e).forEach(function (e) {
                    var t = (deleteid = new DOMParser().parseFromString(
                        e._values.id,
                        "text/html"
                    )).body.firstElementChild;
                    deleteid.body.firstElementChild.innerHTML == itemId &&
                        document
                            .getElementById("delete-record")
                            .addEventListener("click", function () {
                                productList.remove("id", t.outerHTML),
                                    document
                                        .getElementById("deleteRecord-close")
                                        .click();
                            });
                });
            });
        }),
        editBtns &&
            Array.from(editBtns).forEach(function (e) {
                e.addEventListener("click", function (e) {
                    e.target.closest("tr").children[1].innerText,
                        (itemId = e.target.closest("tr").children[1].innerText);
                    e = productList.get({ id: itemId });
                    Array.from(e).forEach(function (e) {
                        var t,
                            i = (isid = new DOMParser().parseFromString(
                                e._values.id,
                                "text/html"
                            )).body.firstElementChild.innerHTML;
                        i == itemId &&
                            ((editlist = !0),
                            (idField.value = i),
                            (i = new DOMParser().parseFromString(
                                e._values.products,
                                "text/html"
                            )),
                            (productTitleField.value =
                                i.querySelector(".product-title").innerHTML),
                            (document.getElementById(
                                "dropzone-preview"
                            ).innerHTML = ""),
                            (t = {
                                name: i.body
                                    .querySelector("img")
                                    .getAttribute("alt"),
                                size: 12345,
                            }),
                            dropzone.options.addedfile.call(dropzone, t),
                            dropzone.options.thumbnail.call(
                                dropzone,
                                t,
                                i.body.querySelector("img").src
                            ),
                            categoryVal && categoryVal.destroy(),
                            // (categoryVal = new Choices(productCategoryField, {
                            //     searchEnabled: !1,
                            // })),
                            categoryVal.setChoiceByValue(e._values.category),
                            (productStockField.value = e._values.stock),
                            (productPriceField.value = e._values.price),
                            flatpickr("#datepicker-publish-input", {
                                defaultDate: date,
                            }));
                    });
                });
            });
}

function deleteMultiple() {
    ids_array = [];
    var e,
        t = document.getElementsByName("chk_child");
    for (i = 0; i < t.length; i++)
        1 == t[i].checked &&
            ((e =
                t[i].parentNode.parentNode.parentNode.querySelector(
                    "td a"
                ).innerHTML),
            ids_array.push(e));
    "undefined" != typeof ids_array && 0 < ids_array.length
        ? Swal.fire({
              title: "Are you sure?",
              text: "You won't be able to revert this!",
              icon: "warning",
              showCancelButton: !0,
              confirmButtonClass: "btn btn-primary w-xs me-2 mt-2",
              cancelButtonClass: "btn btn-danger w-xs mt-2",
              confirmButtonText: "Yes, delete it!",
              buttonsStyling: !1,
              showCloseButton: !0,
          }).then(function (e) {
              if (e.value) {
                  for (i = 0; i < ids_array.length; i++)
                      productList.remove(
                          "id",
                          `<a href="javascript:void(0);" class="fw-medium link-primary">${ids_array[i]}</a>`
                      );
                  document
                      .getElementById("remove-actions")
                      .classList.add("d-none"),
                      (document.getElementById("checkAll").checked = !1),
                      Swal.fire({
                          title: "Deleted!",
                          text: "Your data has been deleted.",
                          icon: "success",
                          confirmButtonClass: "btn btn-info w-xs mt-2",
                          buttonsStyling: !1,
                      });
              }
          })
        : Swal.fire({
              title: "Please select at least one checkbox",
              confirmButtonClass: "btn btn-info",
              buttonsStyling: !1,
              showCloseButton: !0,
          });
}

function clearFields() {
    (productTitleField.value = ""),
        (productCategoryField.value = ""),
        (productStockField.value = ""),
        (productPriceField.value = "");
}

var productList = new List("products", {
    valueNames: ["products", "category", "stock", "price", "published"],
    item: '<tr><td class="products"></td><td class="category" data-category-id=""></td><td class="stock"></td><td class="price"></td><td class="published"></td></tr>',
});

function filterData() {
    var selectedCategory = document.getElementById("idCategory").value;
    var selectedBrand = document.getElementById("idBrand").value;

    productList.filter(function (item) {
        var itemCategoryId = item.elm
            .querySelector(".category")
            .getAttribute("data-category-id");

        return (
            selectedCategory === "" ||
            selectedCategory === "all" ||
            itemCategoryId === selectedCategory
        );
    });

    productList.update();
}

forms &&
    Array.from(forms).forEach(function (e) {
        e.addEventListener("submit", function (e) {
            if (
                (e.preventDefault(),
                "" === productTitleField.value ||
                    "" === productCategoryField.value ||
                    "" === productStockField.value ||
                    "" === productPriceField.value)
            )
                return (
                    Swal.fire({
                        html: "Please fill all fields",
                        icon: "error",
                        showConfirmButton: !1,
                        timer: 1500,
                    }),
                    !1
                );
            var t;
            (e = productList.get({ id: idField.value })),
                Array.from(e).forEach(function (e) {
                    (isid = new DOMParser().parseFromString(
                        e._values.id,
                        "text/html"
                    )),
                        (t = isid.body.firstElementChild.innerHTML);
                }),
                (t ? Array.from(productList.get({ id: t })) : []).forEach(
                    function (e) {
                        var t,
                            i = new DOMParser().parseFromString(
                                e._values.id,
                                "text/html"
                            ).body.firstElementChild.innerHTML;
                        i == idField.value &&
                            ((t = new DOMParser().parseFromString(
                                e._values.products,
                                "text/html"
                            )),
                            (t.querySelector(".product-title").innerHTML =
                                productTitleField.value),
                            (e.values({
                                id: `<a href="javascript:void(0);" class="fw-medium link-primary">${idField.value}</a>`,
                                products:
                                    '<div class="d-flex align-items-center">                <div class="avatar-xs bg-light rounded p-1 me-2">                    <img src="' +
                                    t.body.querySelector("img").src +
                                    '" alt="' +
                                    t.body
                                        .querySelector("img")
                                        .getAttribute("alt") +
                                    '" class="img-fluid d-block product-img">                </div>                <div>                    <h6 class="mb-0"><a href="apps-ecommerce-product-details.html" class="text-reset text-capitalize product-title">' +
                                    productTitleField.value +
                                    "</a></h6>                </div>            </div>",
                                category: productCategoryField.value,
                                stock: productStockField.value,
                                price: productPriceField.value,
                            }),
                            document.getElementById("close-modal").click()));
                    }
                ),
                editlist ||
                    (productList.add({
                        id: `<a href="javascript:void(0);" class="fw-medium link-primary">#TB${count}</a>`,
                        products:
                            '<div class="d-flex align-items-center">                <div class="avatar-xs bg-light rounded p-1 me-2">                    <img src="' +
                            document
                                .querySelectorAll(
                                    ".dz-preview.dz-processing.dz-image-preview.dz-complete"
                                )[0]
                                .querySelectorAll("img")[0].src +
                            '" alt="' +
                            document
                                .querySelectorAll(
                                    ".dz-preview.dz-processing.dz-image-preview.dz-complete"
                                )[0]
                                .querySelectorAll("img")[0]
                                .getAttribute("alt") +
                            '" class="img-fluid d-block product-img">                </div>                <div>                    <h6 class="mb-0"><a href="apps-ecommerce-product-details.html" class="text-reset text-capitalize product-title">' +
                            productTitleField.value +
                            "</a></h6>                </div>            </div>",
                        discount: "0",
                        category: productCategoryField.value,
                        stock: productStockField.value,
                        price: productPriceField.value,
                        orders: "<div>0</div>",
                        rating: '<span class="badge bg-warning-subtle text-warning"><i class="bi bi-star-fill align-baseline me-1"></i> <span class="rate">0</span></span>',
                        published: date,
                    }),
                    productList.sort("id", { order: "desc" }),
                    count++),
                document.getElementById("close-modal").click(),
                clearFields();
        });
    });

// var example = new Choices("#choices-single-default", {
//     searchEnabled: !1,
//     removeItemButton: !1,
//     choices: [
//         { value: "Choice 1", label: "Choice 1", selected: !0 },
//         { value: "Choice 2", label: "Choice 2" },
//         { value: "Choice 3", label: "Choice 3" },
//     ],
// });

document.querySelectorAll(".filter-list a").forEach(function (t) {
    t.addEventListener("click", function (e) {
        var i = t.querySelector(".filter-key").innerHTML;
        "All" == i
            ? (productList.filter(), productList.update())
            : (productList.filter(function (e) {
                  return (
                      e.values().published.includes(i) ||
                      e.values().stock.includes(i) ||
                      e.values().category.includes(i)
                  );
              }),
              productList.update()),
            document.querySelectorAll(".filter-list a").forEach(function (e) {
                e.classList.remove("active");
            }),
            t.classList.add("active");
    });
});
