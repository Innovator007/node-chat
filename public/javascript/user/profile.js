$(document).ready(function() {

    $("#profile-image").on("change", function() {
        $("#completed").text("");
        var uploadInput = $("#profile-image");
        if(uploadInput.val() !== "") {
            var formData = new FormData();
            formData.append('upload', uploadInput[0].files[0]);
            $.ajax({
                url: "/userUpload",
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function() {
                    console.log("image uploaded successfully");
                }
            });
            $("#completed").text("File Uploaded successfully");
        }
    });
    $("#save-btn").on("click", function(e) {
        e.preventDefault();
        const fullname = $("#fullname").val();
        const desc = $("#desc").val();
        const country = $("#country").val();
        if(fullname === "" || desc === "" || country === "") {
            $("#error").html("<p class='alert alert-danger'>All fields are necessary</p>")
        } else {
            $("#profile-form").submit();
        }
    });
});

