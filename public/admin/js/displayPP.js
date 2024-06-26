function displayPP(input, el, container) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            el.attr("src", e.target.result);
            container.show();
        };

        reader.readAsDataURL(input.files[0]);
    }
}
