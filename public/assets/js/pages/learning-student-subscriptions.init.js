var options = {
        valueNames: ["plan", "price", "duration", "status", "payment_due"],
    },
    subscriptionList = new List("subscriptionList", options).on(
        "updated",
        function (e) {
            document.getElementsByClassName("noresult") &&
                document.getElementsByClassName("noresult")[0] &&
                (0 == e.matchingItems.length
                    ? (document.getElementsByClassName(
                          "noresult"
                      )[0].style.display = "block")
                    : (document.getElementsByClassName(
                          "noresult"
                      )[0].style.display = "none"),
                0 < e.matchingItems.length
                    ? (document.getElementsByClassName(
                          "noresult"
                      )[0].style.display = "none")
                    : (document.getElementsByClassName(
                          "noresult"
                      )[0].style.display = "block"));
        }
    );