// Check if the pagination-next button exists before adding event listener
const paginationNext = document.querySelector(".pagination-next");
if (paginationNext) {
    paginationNext.addEventListener("click", function () {
        const activePaginationItem = document.querySelector(
            ".pagination.listjs-pagination .active"
        );
        if (activePaginationItem && activePaginationItem.nextElementSibling) {
            activePaginationItem.nextElementSibling.children[0].click();
        }
    });
}

// Check if the pagination-prev button exists before adding event listener
const paginationPrev = document.querySelector(".pagination-prev");
if (paginationPrev) {
    paginationPrev.addEventListener("click", function () {
        const activePaginationItem = document.querySelector(
            ".pagination.listjs-pagination .active"
        );
        if (activePaginationItem && activePaginationItem.previousSibling) {
            activePaginationItem.previousSibling.children[0].click();
        }
    });
}

// Check if the showModal element exists before adding event listener
const showModal = document.getElementById("showModal");
if (showModal) {
    showModal.addEventListener("show.bs.modal", function (e) {
        const modalFooter = document
            .getElementById("showModal")
            .querySelector(".modal-footer");
        if (e.relatedTarget.classList.contains("edit-item-btn")) {
            document.getElementById("exampleModalLabel").innerHTML =
                "Edit " + e.relatedTarget.dataset.name;
            modalFooter.style.display = "block";
            document.getElementById("add-btn").innerHTML = "Update";
        } else if (e.relatedTarget.classList.contains("add-btn")) {
            document.getElementById("exampleModalLabel").innerHTML =
                "Add " + e.relatedTarget.dataset.name;
            modalFooter.style.display = "block";
            document.getElementById("add-btn").innerHTML =
                "Add " + e.relatedTarget.dataset.name;
        } else {
            document.getElementById("exampleModalLabel").innerHTML =
                "List " + e.relatedTarget.dataset.name;
            modalFooter.style.display = "none";
        }
    });
}

// Check if the image-input element exists before adding event listener Category and vendor
const imageInput = document.querySelector("#image-input");
if (imageInput) {
    imageInput.addEventListener("change", function () {
        const e = document.querySelector("#image-preview");
        const t = imageInput.files[0];
        const a = new FileReader();
        a.addEventListener(
            "load",
            function () {
                e.src = a.result;
            },
            false
        );
        if (t) a.readAsDataURL(t);
    });
}

const editImageInput = document.querySelector("#editicon");
if (editImageInput) {
    editImageInput.addEventListener("change", function () {
        const e = document.querySelector("#editimage-preview");
        const t = editImageInput.files[0];
        const a = new FileReader();
        a.addEventListener(
            "load",
            function () {
                e.src = a.result;
            },
            false
        );
        if (t) a.readAsDataURL(t);
    });
}

const UserImageInput = document.querySelector("#image");
if (UserImageInput) {
    UserImageInput.addEventListener("change", function () {
        const e = document.querySelector("#edituserimage-preview");
        const t = UserImageInput.files[0];
        const a = new FileReader();
        a.addEventListener(
            "load",
            function () {
                e.src = a.result;
            },
            false
        );
        if (t) a.readAsDataURL(t);
    });
}
const EditImageInput = document.querySelector("#editimage");
if (EditImageInput) {
    EditImageInput.addEventListener("change", function () {
        const e = document.querySelector("#editimage-preview");
        const t = EditImageInput.files[0];
        const a = new FileReader();
        a.addEventListener(
            "load",
            function () {
                e.src = a.result;
            },
            false
        );
        if (t) a.readAsDataURL(t);
    });
}

function logout() {
    iziToast.question({
        timeout: 20000,
        close: false,
        overlay: true,
        displayMode: "once",
        id: "question",
        zindex: 999,
        title: "Hey",
        message: "Are you sure you want to logout?",
        position: "center",
        buttons: [
            [
                "<button><b>YES</b></button>",
                function (instance, toast) {
                    instance.hide(
                        {
                            transitionOut: "fadeOut",
                        },
                        toast,
                        "button"
                    );
                    $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        url: "/admin/logout",
                    })
                        .done((res) => {
                            iziToast.info({
                                title: "Success",
                                message: res.message,
                                position: "topRight",
                            });
                            setTimeout(function () {
                                window.location.href = "/admin/login";
                            }, 1000);
                        })
                        .fail(function (xhr, status, error) {
                            iziToast.error({
                                title: "Error",
                                message: xhr.responseText,
                                position: "topRight",
                            });
                        });
                },
            ],
            [
                "<button>NO</button>",
                function (instance, toast) {
                    instance.hide(
                        {
                            transitionOut: "fadeOut",
                        },
                        toast,
                        "button"
                    );
                },
            ],
        ],
    });
}

function sellerLogout() {
    iziToast.question({
        timeout: 20000,
        close: false,
        overlay: true,
        displayMode: "once",
        id: "question",
        zindex: 999,
        title: "Hey",
        message: "Are you sure you want to logout?",
        position: "center",
        buttons: [
            [
                "<button><b>YES</b></button>",
                function (instance, toast) {
                    instance.hide(
                        {
                            transitionOut: "fadeOut",
                        },
                        toast,
                        "button"
                    );
                    $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        url: "/seller/logout",
                    })
                        .done((res) => {
                            iziToast.info({
                                title: "Success",
                                message: res.message,
                                position: "topRight",
                            });
                            setTimeout(function () {
                                window.location.href = "/seller/login";
                            }, 1000);
                        })
                        .fail(function (xhr, status, error) {
                            iziToast.error({
                                title: "Error",
                                message: xhr.responseText,
                                position: "topRight",
                            });
                        });
                },
            ],
            [
                "<button>NO</button>",
                function (instance, toast) {
                    instance.hide(
                        {
                            transitionOut: "fadeOut",
                        },
                        toast,
                        "button"
                    );
                },
            ],
        ],
    });
}

//#region image preview remove button
document.addEventListener("DOMContentLoaded", function () {
    const imageContainers = document.getElementsByClassName("image-container");

    Array.from(imageContainers).forEach(function (container) {
        const imageInput = container.querySelector(".image-input");
        const imagePreview = container.querySelector(".image-preview");
        const removeImageButton = container.querySelector(".remove-image");

        // Handle image selection
        imageInput.addEventListener("change", function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    removeImageButton.classList.remove("d-none"); // Show remove button
                };
                reader.readAsDataURL(file);
            }
        });

        // Handle image removal
        removeImageButton.addEventListener("click", function () {
            imagePreview.src = "/assets/images/users/user-dummy-img.jpg"; // Reset to default image
            imageInput.value = ""; // Clear the input
            removeImageButton.classList.add("d-none"); // Hide remove button
        });
    });
});
//#endregion

//#region bulk delete
document.addEventListener("DOMContentLoaded", function () {
    const checkboxes = document.getElementsByName("chk_child");
    const deleteButton = document.getElementById("remove-actions");

    function toggleDeleteButton() {
        const checkedCount = Array.from(checkboxes).filter(
            (checkbox) => checkbox.checked
        ).length;

        // Show the delete button if more than one checkbox is checked
        if (checkedCount > 1) {
            deleteButton.classList.remove("d-none");
        } else {
            deleteButton.classList.add("d-none");
        }
    }

    // Event listener for each individual checkbox
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", toggleDeleteButton);
    });

    // Event listener for "Check All" checkbox
    document.getElementById("checkAll").addEventListener("change", function () {
        checkboxes.forEach((checkbox) => (checkbox.checked = this.checked));
        toggleDeleteButton();
    });
});
//#endregion
