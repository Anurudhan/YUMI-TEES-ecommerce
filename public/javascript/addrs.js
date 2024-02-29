function manageAddresses(element,divId) {
    // Make GET request to '/manageaddress' endpoint
    fetch('/manageaddress', {
        method: 'GET'
    }).then(response => {
        // Handle response if needed
    }).catch(error => {
        console.error('Error:', error);
    });
    var listItems = document.querySelectorAll('.list-group-item');
    listItems.forEach(function(item) {
        item.classList.remove('active');
    });

    // Add 'active' class to the clicked list item
    element.classList.add('active');

    var cardBody = document.querySelector('.card-body-main');
    cardBody.style.display = 'none';

    var divs = document.querySelectorAll('.hidden-div');
    divs.forEach(function(div) {
        div.style.display = 'none';
    });
    // Show the div with the specified ID
    var divToShow = document.getElementById(divId);
    if (divToShow) {
        divToShow.style.display = 'block';
    }
    
}

function showDivAndSendGet(element,url) {
    // Hide all divs
    var divs = document.querySelectorAll('.hidden-div');
    divs.forEach(function(div) {
        div.style.display = 'none';
    });

    var cardBody = document.querySelector('.card-body-main');
    cardBody.style.display = 'none';

    // Show the profile div
    var profileDiv = document.getElementById('div1');
    profileDiv.style.display = 'block';
    
    var listItems = document.querySelectorAll('.list-group-item');
    listItems.forEach(function(item) {
        item.classList.remove('active');
    });

    // Add 'active' class to the clicked list item
    element.classList.add('active');

    // Send GET request
    fetch(url, {
        method: 'GET'
    }).then(response => {
        // Handle response if needed
    }).catch(error => {
        console.error('Error:', error);
    });
}

function confirmDelete(addressId) {
    if (confirm("Are you sure you want to delete this address?")) {
        deleteAddress(addressId);
    }
}

function deleteAddress(addressId) {
    // AJAX request to delete the address without expecting a response
    fetch(`/deleteAddress/${addressId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (response.ok) {
            // Display success message using Toastify
            Toastify({
                text: "Address deleted successfully!",
                duration: 3000, // 3 seconds
                backgroundColor: "green",
                position: "center",
            }).showToast();
            
            // Redirect to the home page after a delay
            setTimeout(() => {
                window.location.href = "/profile";
            }, 3000);
        } else {
            throw new Error('Network response was not ok.');
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        alert("Error deleting address. Please try again later.");
    });
}



