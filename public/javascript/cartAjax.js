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
    // Make an AJAX request to delete the item from the cart
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", "/removecart/" + productId, true); // Use DELETE method
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // If the item is successfully deleted, you can update the UI or take further action
                // For example, you can remove the item from the DOM
                var removedItem = document.getElementById(itemId);
                removedItem.parentNode.removeChild(removedItem);
                // Display success message using Toastify or any other method
                Toastify({
                    text: "Item removed from cart successfully!",
                    duration: 3000, // 3 seconds
                    backgroundColor: "green",
                    position: "center",
                }).showToast();
            } else {
                // If the request fails, display an error message using Toastify
                Toastify({
                    text: "An error occurred while removing the item from cart.",
                    duration: 3000, // 3 seconds
                    backgroundColor: "red",
                    position: "center",
                }).showToast();
            }
        }
    };
    xhr.send();
}