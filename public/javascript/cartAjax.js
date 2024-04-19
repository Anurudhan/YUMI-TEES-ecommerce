function addTocart(prdctid){
    console.log("hlooo---");
    $.ajax({
        url:`/addtocart/${prdctid}/0`,
        method:'get',
        success: function (response) {
          Toastify({
              text: response.msg,
              duration: 3000,
              gravity: "top",
              position: "center",
              backgroundColor: "green",
              stopOnFocus: true,
          }).showToast();

          setTimeout(function () {
              window.location.reload();
          }, 3000);
      },
      error: function (err) {
          Toastify({
              text: "Something Error",
              duration: 3000,
              gravity: "top",
              position: "center",
              backgroundColor: "red",
              stopOnFocus: true,
          }).showToast();
          console.log(err);
      }
      })
}

function removeFromCart(productId) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/removecart/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                var rowToRemove = document.getElementById('cartRow' + productId);
                rowToRemove.parentNode.removeChild(rowToRemove);

                Swal.fire({
                    icon: 'success',
                    title: 'Item removed from cart successfully!',
                    showConfirmButton: false,
                    timer: 3000
                });
                setTimeout(() => {
                    window.location.reload()
                }, 3000);
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'An error occurred while removing the item from the cart.'
                });
            });
        }
    });
}
