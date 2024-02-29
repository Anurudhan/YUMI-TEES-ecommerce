// blocking customers
function block(id, status) {
    if (confirm("Are you sure you want to change the status?")) {
        console.log('it is working');
        $.ajax({
            url: `/admin/customers/block/${id}/${status}`,
            method: "get",
            success: function(response) {
                window.location.reload();
                alert(response.message);
            },
            error: function(err) {
                alert("Something error detected");
            }
        });
    } else {
        alert("Operation canceled");
    }
}

