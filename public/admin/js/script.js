$(document).ready(function () {
    $(".sideMenuToggler").click(function () {
        $(".sideMenu").toggleClass("active");
        $(".text").toggleClass("text-active");
        $(".icon").toggleClass("icon-active");
        $(".nav-link").toggleClass("nav-link-active");
        $(".main").toggleClass("main-active");
        $(".dropdown").toggleClass("dropdown-active");
        $(".submenu_icon").toggle();
    });
    $(".smm").click(function () {
        $(".sideMenu").toggleClass("smm-active");
        $(".main").toggleClass("main-active");
    });
    $("#home").click(function () {
        $("#home_expand").text() == "expand_less"
            ? $("#home_expand").text("expand_more")
            : $("#home_expand").text("expand_less");
        $("#home_submenu").slideToggle();
    });
    $(".sideMenu-li").each(function (index) {
        $(this).hover(
            function () {
                $(this)
                    .find(".submenu_circle")
                    .css("background-color", "transparent");
            },
            function () {
                $(this).find(".submenu_circle").css("background-color", "#F80");
            }
        );
    });
});

function activeSideBar(name) {
    $("#" + name).addClass("sideMenu-li-active");
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
                        url: "logout",
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
