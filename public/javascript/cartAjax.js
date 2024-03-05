function addTocart(prdctid){
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

          // Reload the page after 3 seconds
          setTimeout(function () {
              window.location.reload();
          }, 500);
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
    // Send a DELETE request to the backend to remove the item from the cart
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
        // Handle the response if needed
        return response.json();
    })
    .then(data => {
        // Remove the row from the cart in the UI
        var rowToRemove = document.getElementById('cartRow' + productId);
        rowToRemove.parentNode.removeChild(rowToRemove);

        // Show success message using SweetToastify
        Toastify({
            text: "Item removed from cart successfully!",
            duration: 3000, // Duration in milliseconds
            close: true, // Whether to show the close button
            gravity: "top", // Toast position: 'top', 'bottom', 'center'
            position: "center", // Toast position: 'left', 'center', 'right'
            backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)", // Green background color
            className: "success-toast" // Custom CSS class for styling
        }).showToast();
        setTimeout(() => {
            window.location.reload()
        }, 3000);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
        // Show error message using SweetToastify if needed
        Toastify({
            text: "An error occurred while removing the item from the cart.",
            duration: 3000, // Duration in milliseconds
            close: true, // Whether to show the close button
            gravity: "top", // Toast position: 'top', 'bottom', 'center'
            position: "center", // Toast position: 'left', 'center', 'right'
            backgroundColor: "#e74c3c", // Red background color
            className: "error-toast" // Custom CSS class for styling
        }).showToast();
    });
}