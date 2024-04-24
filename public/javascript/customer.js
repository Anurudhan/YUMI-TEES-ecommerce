// blocking customers
function block(id, status) {
    Swal.fire({
        title: 'Are you sure?',
        text: "Are you sure you want to change the status?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            console.log('it is working');
            $.ajax({
                url: `/admin/customers/block/${id}/${status}`,
                method: "get",
                success: function(response) {
                    Swal.fire({
                        title: 'Success',
                        text: response.message,
                        icon: 'success'
                    }).then(() => {
                        window.location.reload();
                    });
                },
                error: function(err) {
                    Swal.fire({
                        title: 'Error',
                        text: 'Something error detected',
                        icon: 'error'
                    });
                }
            });
        } else {
            Swal.fire('Operation canceled', '', 'info');
        }
    });
}


