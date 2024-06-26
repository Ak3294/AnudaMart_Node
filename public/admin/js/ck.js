ClassicEditor.create(document.querySelector("#editor"), {
    ckfinder: {
        // The URL that the images are uploaded to.
        uploadUrl: "uploadImage",
    },

    toolbar: {
        items: [
            "heading",
            "|",
            "bold",
            "italic",
            "fontBackgroundColor",
            "fontFamily",
            "fontColor",
            "underline",
            "fontSize",
            "strikethrough",
            "link",
            "bulletedList",
            "numberedList",
            "highlight",
            "|",
            "alignment",
            "indent",
            "outdent",
            "|",
            // 'CKFinder',
            "imageUpload",
            "blockQuote",
            "insertTable",
            "mediaEmbed",
            "undo",
            "redo",
            "pageBreak",
        ],
    },
    language: "en",
    image: {
        // Configure the available styles.
        styles: ["alignLeft", "alignCenter", "alignRight"],

        // Configure the available image resize options.
        resizeOptions: [
            {
                name: "imageResize:original",
                label: "Original",
                value: null,
            },
            {
                name: "imageResize:50",
                label: "50%",
                value: "50",
            },
            {
                name: "imageResize:75",
                label: "75%",
                value: "75",
            },
        ],

        // You need to configure the image toolbar, too, so it shows the new style
        // buttons as well as the resize buttons.
        toolbar: [
            "imageStyle:alignLeft",
            "imageStyle:alignCenter",
            "imageStyle:alignRight",
            "|",
            "imageResize",
            "|",
            "imageTextAlternative",
        ],
    },
    table: {
        contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
    },
    licenseKey: "",
})
    .then((editor) => {
        window.editor = editor;
    })
    .catch((error) => {
        console.error("Oops, something went wrong!");
        console.error(
            "Please, report the following error on https://github.com/ckeditor/ckeditor5/issues with the build id and the error stack trace:"
        );
        console.warn("Build id: y6bnc8u8rmq6-ybsdk2x4ah2y");
        console.error(error);
    });
