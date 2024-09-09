function getFormData($form) {
    var formData = $form.serializeArray();
    var jsonData = {};

    $.each(formData, function () {
        if (jsonData[this.name]) {
            // If the name already exists, push the new value to the array
            if (Array.isArray(jsonData[this.name])) {
                jsonData[this.name].push(this.value);
            } else {
                jsonData[this.name] = [jsonData[this.name], this.value];
            }
        } else {
            // If the name does not exist, create it
            jsonData[this.name] = this.value;
        }
    });

    return jsonData;
}
