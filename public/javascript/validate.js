function validateEmail() {
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        emailError.innerText = 'Please enter a valid email address.';
        emailInput.classList.add('is-invalid');
    } else {
        emailError.innerText = '';
        emailInput.classList.remove('is-invalid');
    }
}

function validateCurrentPassword() {
    var currentPassword = document.getElementById("password1").value;
    var passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (currentPassword === "") {
        document.getElementById("current-password-error").innerText = "Please enter your current password.";
    } else if (!passwordRegex.test(currentPassword)) {
        document.getElementById("current-password-error").innerText = "Password must contain at least 8 characters, including one letter, one number, and one special character.";
    } else {
        document.getElementById("current-password-error").innerText = "";
    }
}

function validatePassword() {
    var newPassword = document.getElementById("new-password").value;
    var passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (newPassword === "") {
        document.getElementById("password-error").innerText = "Please enter a new password.";
    } else if (!passwordRegex.test(newPassword)) {
        document.getElementById("password-error").innerText = "Password must contain at least 8 characters, including one letter, one number, and one special character.";
    } else {
        document.getElementById("password-error").innerText = "";
    }
}

function validateConfirmPassword() {
    var confirmPassword = document.getElementById("inputPasswordNew2").value;
    var newPassword = document.getElementById("new-password").value;
    var passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (confirmPassword !== newPassword) {
        document.getElementById("confirmpassword-error").innerText = "Passwords do not match.";
    } else {
        document.getElementById("confirmpassword-error").innerText = "";
    } 
}

function createRazorpay(order) {
    const id = order.id;
    const total = order.amount;
    console.log("Order ID:", id, "Total Amount:", total);
    console.log("gkgkgasb ");
    var options = {
        key: "rzp_test_ZqqOUloxXfd27z",
        amount: total,
        currency: 'INR',
        name: 'YUMI-TEES',
        description: 'Test Transaction',
        image: '../assets/logoblack.png',
        order_id: id,
        handler: function (response) {
            verifyPayment(response, order);
        },
        theme: {
            color: '#3c3c3c'
        }
    };

    var rzp1 = new Razorpay(options);

    rzp1.on('payment.failed', function (response) {
        const error = response.error;
        console.log(error);
        window.location.href = `/failedpayment?error=${error}&id=${order.receipt}`;
    });

    rzp1.open();
}

    
    

function verifyPayment(payment, order) {
    console.log(payment);   
    console.log(order);
    $.ajax({

        url: '/verifypayment',
        method: "post",
        data: {
            payment,
            order
        },
        success: function (response) {
            if (response.success) {
                window.location.href = '/ordersuccess'
            }
        },
        error: function (err) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Online payment is not fulfilled. Your payment is pending.',
                timer: 3000, // 3000 milliseconds
                showConfirmButton: false
            }).then(function () {
                // Redirect to the previous page or perform other actions after alert is closed
                window.location.href="/"
            });
        }
    })
}
