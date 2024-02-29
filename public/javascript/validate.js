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