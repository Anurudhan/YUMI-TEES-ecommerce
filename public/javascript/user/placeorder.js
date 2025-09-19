document.querySelectorAll('input[name="pay-method"]').forEach(radio => {
    radio.addEventListener('change', function() {
        document.querySelectorAll('.payment-card').forEach(card => {
            card.classList.remove('selected');
        });
        this.closest('.payment-card').classList.add('selected');
        updateProceedButtonState();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const checkedRadio = document.querySelector('input[name="pay-method"]:checked');
    if (checkedRadio) {
        checkedRadio.closest('.payment-card').classList.add('selected');
    }

    const checkedAddressRadio = document.querySelector('input[name="existingAddress"]:checked');
    if (checkedAddressRadio) {
        checkedAddressRadio.closest('.address-card').classList.add('selected');
        const buttonId = checkedAddressRadio.getAttribute('onclick').match(/'([^']+)'/)[1];
        showButton(buttonId);
        
        // If address is already confirmed (from previous selection), enable proceed button
        if (document.querySelector('.selected-check')) {
            isAddressConfirmed = true;
            updateProceedButtonState();
        }
    }
    
    updateProceedButtonState();
});

function toggleHiddenAddresses() {
    var hiddenAddresses = document.querySelectorAll('.hidden-address');
    hiddenAddresses.forEach(function(address) {
        address.classList.toggle('show-hidden-addresses');
    });

    var showAllLink = document.querySelector('.show-all-link');
    if (showAllLink) {
        if (showAllLink.textContent.includes('Show All')) {
            showAllLink.innerHTML = '<i class="bi bi-chevron-up me-1"></i>Show Less';
        } else {
            showAllLink.innerHTML = '<i class="bi bi-chevron-down me-1"></i>Show All Addresses';
        }
    }
}

function showButton(buttonId) {
    // Hide all deliver buttons first
    var buttons = document.querySelectorAll('.deliver-btn');
    buttons.forEach(function(button) {
        button.classList.add('d-none');
    });

    // Show the selected address's deliver button
    var button = document.getElementById(buttonId);
    if (button) {
        button.classList.remove('d-none');
    }

    // Update address card selection
    document.querySelectorAll('.address-card').forEach(card => {
        card.classList.remove('selected');
    });

    const radioId = buttonId.replace('deliverHereBtn', 'address');
    const selectedRadio = document.getElementById(radioId);
    if (selectedRadio) {
        selectedRadio.checked = true;
        selectedRadio.closest('.address-card').classList.add('selected');
    }
    
    // Reset address confirmation when selecting new address
    isAddressConfirmed = false;
    updateProceedButtonState();
    
    // Show instruction to confirm delivery
    showAddressInstructions();
}

function showAddressInstructions() {
    // Remove any existing instruction
    const existingInstruction = document.querySelector('.address-instruction');
    if (existingInstruction) {
        existingInstruction.remove();
    }
    
    // Add instruction near the deliver button
    const deliverBtn = document.querySelector('.deliver-btn:not(.d-none)');
    if (deliverBtn) {
        const instruction = document.createElement('div');
        instruction.className = 'address-instruction alert-custom alert-warning';
        instruction.style.marginTop = '10px';
        instruction.style.fontSize = '0.9rem';
        instruction.innerHTML = '<i class="bi bi-info-circle me-1"></i>Please click "Deliver Here" to confirm this address';
        deliverBtn.parentNode.insertBefore(instruction, deliverBtn.nextSibling);
    }
}

function confirmDelivery(radioId) {
    const selectedRadio = document.getElementById(radioId);
    if (!selectedRadio) return;

    // Remove checkmark from all addresses
    document.querySelectorAll('.selected-check').forEach(check => {
        check.remove();
    });

    // Remove any address instructions
    const instruction = document.querySelector('.address-instruction');
    if (instruction) {
        instruction.remove();
    }

    // Add checkmark to the selected address card
    const addressCard = selectedRadio.closest('.address-card');
    const checkmark = document.createElement('i');
    checkmark.className = 'bi bi-check-circle-fill selected-check';
    addressCard.insertBefore(checkmark, addressCard.querySelector('ul.address-list'));

    // Enable other radios to allow re-selection
    document.querySelectorAll('input[name="existingAddress"]').forEach(radio => {
        radio.disabled = false;
    });

    // Hide all "Deliver Here" buttons
    document.querySelectorAll('.deliver-btn').forEach(button => {
        button.classList.add('d-none');
    });

    // Store the address ID in a hidden input
    let hiddenInput = document.getElementById('selectedAddressId');
    if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = 'selectedAddressId';
        hiddenInput.name = 'selectedAddressId';
        document.querySelector('#existingAddressesContainer').appendChild(hiddenInput);
    }
    hiddenInput.value = selectedRadio.value;

    // Enable the Proceed to Checkout button
    isAddressConfirmed = true;
    updateProceedButtonState();

    // Show confirmation message
    Swal.fire({ 
        icon: "success", 
        title: "Address Confirmed", 
        text: "Delivery address has been set.",
        timer: 2000,
        showConfirmButton: false
    });
}

// New function to update proceed button state
function updateProceedButtonState() {
    const proceedBtn = document.querySelector('#proceedButton button');
    const paymentSelected = document.querySelector('input[name="pay-method"]:checked');
    
    if (isAddressConfirmed && paymentSelected) {
        proceedBtn.disabled = false;
        proceedBtn.style.opacity = '1';
    } else {
        proceedBtn.disabled = true;
        proceedBtn.style.opacity = '0.6';
    }
}

let appliedCoupon = null;
let appliedCouponDiscount = 0;

function updatePriceDetails(couponDiscount = 0) {
    const grandTotal = parseFloat(document.getElementById("grandTotal").value) || 0;
    const productDiscount = parseFloat(document.getElementById("productDiscount").value) || 0;

    const totalDiscount = productDiscount + couponDiscount;
    let deliveryCharge = (grandTotal - totalDiscount < 1000) ? 40 : 0;
    let finalPayable = grandTotal - totalDiscount + deliveryCharge;

    document.getElementById("productDiscountRow").textContent = `-₹ ${productDiscount}`;
    document.getElementById("couponRow").textContent = `-₹ ${couponDiscount}`;
    document.getElementById("deliveryRow").innerHTML =
        deliveryCharge === 0
            ? `<span style="color: #28a745; font-size: 0.9rem;">Free</span>
               <del class="text-muted" style="font-size: 0.9rem; margin-left: 5px;">₹ 40</del>`
            : `<span style="color: #dc3545;">+₹ 40</span>`;
    document.getElementById("totalRow").textContent = `₹ ${finalPayable}`;
}

$(document).on("click", ".apply-button", function () {
    const $btn = $(this);
    const couponCode = $(".coupon-select").val();
    const grandTotal = parseFloat($("#grandTotal").val() || 0);
    const productDiscount = parseFloat($("#productDiscount").val() || 0);

    if (!couponCode) {
        Swal.fire({ icon: "warning", title: "Oops...", text: "Please choose a coupon." });
        return;
    }

    const coupon = window.availableCoupons.find(c => c.couponCode === couponCode);
    if (!coupon) {
        Swal.fire({ icon: "error", title: "Invalid coupon." });
        return;
    }

    const now = new Date();
    if (coupon.status !== "Active" ||
        now < new Date(coupon.validFrom) ||
        now > new Date(coupon.validTo)) {
        Swal.fire({ icon: "error", title: "Coupon not valid right now." });
        return;
    }
    if (grandTotal - productDiscount < coupon.minimumPurchaseAmount) {
        Swal.fire({ icon: "error", title: `Min purchase ₹${coupon.minimumPurchaseAmount} after offer discount` });
        return;
    }

    let couponDiscount = coupon.discountType === "Flat"
        ? coupon.discountValue
        : Math.floor(((grandTotal - productDiscount) * coupon.discountValue) / 100);

    if (couponDiscount > (grandTotal - productDiscount)) {
        couponDiscount = grandTotal - productDiscount;
    }

    appliedCoupon = couponCode;
    appliedCouponDiscount = couponDiscount;

    Swal.fire({ icon: "success", title: "Coupon applied!", text: `Coupon Discount ₹${couponDiscount}` });

    updatePriceDetails(couponDiscount);

    $btn.text("Remove")
        .removeClass("apply-button btn-primary")
        .addClass("remove-button btn-danger");

    $(".coupon-message")
        .removeClass("alert-success")
        .addClass("alert-warning")
        .html(`<i class="bi bi-info-circle"></i> Remove coupon if you don't want to use it`);
});

$(document).on("click", ".remove-button", function () {
    const $btn = $(this);

    appliedCoupon = null;
    appliedCouponDiscount = 0;

    Swal.fire({ icon: "success", title: "Coupon removed." });
    updatePriceDetails(0);

    $(".coupon-select").val("");

    $btn.text("Apply")
        .removeClass("remove-button btn-danger")
        .addClass("apply-button btn-primary");

    const couponCount = window.availableCoupons?.length || 0;
    $(".coupon-message")
        .removeClass("alert-warning")
        .addClass("alert-success")
        .html(`<i class="bi bi-check-circle"></i> ${couponCount} coupon(s) available for your order`);
});

document.addEventListener("DOMContentLoaded", function () {
    updatePriceDetails(appliedCouponDiscount);
});

$("#proceedButton").click(function () {
    // Check address confirmation first with immediate feedback
    if (!isAddressConfirmed) {
        // Highlight the address section
        const addressSection = document.querySelector('.section-card');
        addressSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        addressSection.style.border = '2px solid #dc3545';
        addressSection.style.borderRadius = '8px';
        
        setTimeout(() => {
            addressSection.style.border = '';
        }, 3000);
        
        Swal.fire({ 
            icon: "warning", 
            title: "Address Required", 
            text: "Please select an address and click 'Deliver Here' to confirm.",
            confirmButtonText: "Got it"
        });
        return;
    }

    const paymentType = $('input[name="pay-method"]:checked').val();
    const selectedAddress = document.getElementById('selectedAddressId')?.value;

    if (!paymentType) {
        // Highlight payment section
        const paymentSection = document.querySelectorAll('.section-card')[1];
        paymentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        paymentSection.style.border = '2px solid #dc3545';
        paymentSection.style.borderRadius = '8px';
        
        setTimeout(() => {
            paymentSection.style.border = '';
        }, 3000);
        
        Swal.fire({ 
            icon: "warning", 
            title: "Payment Method Required", 
            text: "Please choose a payment method.",
            confirmButtonText: "Got it"
        });
        return;
    }

    if (!selectedAddress) {
        Swal.fire({ icon: "warning", title: "Oops...", text: "Please select and confirm an address." });
        return;
    }

    const grandTotal = parseFloat($("#grandTotal").val() || 0);
    const productDiscount = parseFloat($("#productDiscount").val() || 0);
    const clientTotal = grandTotal - productDiscount - appliedCouponDiscount;
    if(clientTotal > 1000 && paymentType == "COD"){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Order above Rs 1000 can't allowed for Cash On Delivery`
        });
        return;
    }

    const orderData = {
        paymentType,
        address_id: selectedAddress,
        couponCode: appliedCoupon,
        clientTotal: clientTotal
    };

    // Show loading state
    const proceedBtn = $(this).find('button');
    const originalText = proceedBtn.html();
    proceedBtn.html('<i class="spinner-border spinner-border-sm me-2"></i>Processing...').prop('disabled', true);

    $.ajax({
        type: "POST",
        url: "/confirmorder",
        contentType: "application/json",
        data: JSON.stringify(orderData),
        success: function (response) {
            if (response.success === false && response.error) {
                // ✅ Error coming from backend (handled AppError)
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: response.error
                });
                // Reset button
                proceedBtn.html(originalText).prop('disabled', false);
                return;
            }

            // ✅ Success flow
            if (response.paymentMethod === "COD") {
                window.location.href = "/ordersuccess";
            } else if (response.paymentMethod === "online") {
                createRazorpay(response.order);
            } else if (response.paymentMethod === "wallet") {
                window.location.href = "/ordersuccess";
            }
        },
        error: function (xhr) {
            let errorMessage = "Server error. Please try again later.";

            try {
                const res = JSON.parse(xhr.responseText);
                if (res.error) errorMessage = res.error;
            } catch (e) {
                console.error("Could not parse error:", e);
            }

            Swal.fire({
                icon: "error",
                title: "Error",
                text: errorMessage
            });
            
            // Reset button
            proceedBtn.html(originalText).prop('disabled', false);
        }
    });
});