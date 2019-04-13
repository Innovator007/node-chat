$(document).ready(function() {
    $(".favourite-btn").on("click", function() {
        const groupId = $(this)[0].id;
        const groupName = $(this)[0].value;
        $.ajax({
            url: "/home",
            type: "POST",
            data: {
                id: groupId,
                groupName: groupName
            },
            success: function() {
                window.location.reload();
            }
        });
    });
});