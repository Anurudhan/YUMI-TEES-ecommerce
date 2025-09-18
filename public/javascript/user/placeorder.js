
// Payment method selection
document.querySelectorAll('input[name="pay-method"]').forEach(radio => {
    radio.addEventListener('change', function() {
        document.querySelectorAll('.payment-card').forEach(card => {
            card.classList.remove('selected');
        });
        this.closest('.payment-card').classList.add('selected');
    });
});

// Initialize selected payment method
document.addEventListener('DOMContentLoaded', function() {
    const checkedRadio = document.querySelector('input[name="pay-method"]:checked');
    if (checkedRadio) {
        checkedRadio.closest('.payment-card').classList.add('selected');
    }
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
    var buttons = document.querySelectorAll('.deliver-btn');
    buttons.forEach(function(button) {
        button.classList.add('d-none');
    });
    var button = document.getElementById(buttonId);
    if (button) {
        button.classList.remove('d-none');
    }
    
    // Update address card selection
    document.querySelectorAll('.address-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedRadio = document.querySelector('input[name="existingAddress"]:checked');
    if (selectedRadio) {
        selectedRadio.closest('.address-card').classList.add('selected');
    }
}

let appliedCoupon = null;  
let appliedCouponDiscount = 0;   

// Update price details
function updatePriceDetails(couponDiscount = 0) {
    const totalPrice = parseFloat(document.getElementById("totalPrice").value) || 0;
    const offerDiscount = parseFloat(document.getElementById("offerDiscount").value) || 0;

    // Calculate total discount (offer + coupon)
    const totalDiscount = offerDiscount + couponDiscount;

    // Determine delivery charge based on total price after discounts
    let deliveryCharge = (totalPrice - totalDiscount < 1000) ? 40 : 0;
    let finalPayable = totalPrice - totalDiscount + deliveryCharge;

    // Update UI
    document.getElementById("offerDiscountRow").textContent = `-₹ ${offerDiscount}`;
    document.getElementById("couponRow").textContent = `-₹ ${couponDiscount}`;
    document.getElementById("deliveryRow").innerHTML =
        deliveryCharge === 0
            ? `<span style="color: #28a745; font-size: 0.9rem;">Free</span>
               <del class="text-muted" style="font-size: 0.9rem; margin-left: 5px;">₹ 40</del>`
            : `<span style="color: #dc3545;">+₹ 40</span>`;
    document.getElementById("totalRow").textContent = `₹ ${finalPayable}`;
}

// Apply coupon
$(document).on("click", ".apply-button", function () {
    const $btn = $(this);
    const couponCode = $(".coupon-select").val();
    const totalPrice = parseFloat($("#totalPrice").val() || 0);
    const offerDiscount = parseFloat($("#offerDiscount").val() || 0);

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
    if (totalPrice - offerDiscount < coupon.minimumPurchaseAmount) {
        Swal.fire({ icon: "error", title: `Min purchase ₹${coupon.minimumPurchaseAmount} after offer discount` });
        return;
    }

    let couponDiscount = coupon.discountType === "Flat"
        ? coupon.discountValue
        : Math.floor(((totalPrice - offerDiscount) * coupon.discountValue) / 100);

    if (couponDiscount > (totalPrice - offerDiscount)) {
        couponDiscount = totalPrice - offerDiscount;
    }

    appliedCoupon = couponCode;
    appliedCouponDiscount = couponDiscount;

    Swal.fire({ icon: "success", title: "Coupon applied!", text: `Coupon Discount ₹${couponDiscount}` });

    updatePriceDetails(couponDiscount);

    // Toggle button to Remove
    $btn.text("Remove")
        .removeClass("apply-button btn-primary")
        .addClass("remove-button btn-danger");

    // Update coupon message
    $(".coupon-message")
        .removeClass("alert-success")
        .addClass("alert-warning")
        .html(`<i class="bi bi-info-circle"></i> Remove coupon if you don't want to use it`);
});

// Remove coupon
$(document).on("click", ".remove-button", function () {
    const $btn = $(this);

    appliedCoupon = null;
    appliedCouponDiscount = 0;

    Swal.fire({ icon: "success", title: "Coupon removed." });
    updatePriceDetails(0);

    // Reset coupon select
    $(".coupon-select").val("");

    // Toggle button back to Apply
    $btn.text("Apply")
        .removeClass("remove-button btn-danger")
        .addClass("apply-button btn-primary");

    // Show available coupon message
    const couponCount = window.availableCoupons?.length || 0;
    $(".coupon-message")
        .removeClass("alert-warning")
        .addClass("alert-success")
        .html(`<i class="bi bi-check-circle"></i> ${couponCount} coupon(s) available for your order`);
});

// Initialize price details on page load
document.addEventListener("DOMContentLoaded", function () {
    updatePriceDetails(appliedCouponDiscount);
});         


// When proceeding to order
$("#proceedButton").click(function () {
    const paymentMethod = $('input[name="pay-method"]:checked').val();
    const selectedAddress = $("input[name='existingAddress']:checked").val();

    const orderData = {
        paymentMethod,
        addressId: selectedAddress,
        couponCode: appliedCoupon,  // send applied coupon (if any)
        discount: appliedDiscount
    };

    $.ajax({
        type: "POST",
        url: "/placeorder",
        contentType: "application/json",
        data: JSON.stringify(orderData),
        success: function (response) {
            if (response.paymentMethod === "COD") {
                window.location.href = "/ordersuccess";
            } else if (response.paymentMethod === "OnlinePayment") {
                createRazorpay(response.order);
            }
        },
        error: function (xhr) {
            console.error(xhr.responseText);
        }
    });
});




// $(document).ready(function() {
//     $("#proceedButton").click(function() {
        
//         var paymentMethod = $('input[name="pay-method"]:checked').val();
//         var price = "<%=totalprice%>";
//         var url = `/placeorder/${paymentMethod}`
//         if(price > 1000 && paymentMethod == "cashOnDelivery"){
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Oops...',
//                 text: `Order above Rs 1000 can't allowed for Cash On Delivery`
//             });
//         }
//         else{

//         $.ajax({
//             type: "POST",
//             url: url,
//             contentType: "application/json; charset=utf-8",
//             success: function(response) {
                
//                 if(response.msg){
//                     Swal.fire({
//                     icon: 'error',
//                     title: response.msg,
//                     showConfirmButton: false,
//                     timer: 3000 // Adjust the time the alert is displayed if needed
//                     })
//                 }
//                 if(response.paymentMethod==="COD"){
//                     window.location.href = "/ordersuccess"
//                 }
//                 else if(response.paymentMethod == "online"){
//                     console.log("Hlo I am here----->");
//                     createRazorpay(response.order);
//                 }
//                 else if (response.paymentMethod == "wallet") {
//                     window.location.href = "/ordersuccess";
//                 }
//             },
//             error: function(xhr, status, error) {
//                 // Handle any errors that occur during the request
//                 console.error('Request failed. Status: ' + status + ', Error: ' + error);
//             }
//         });
//         }  
//     });
// });












// $(document).ready(function() {
//     $('.apply-button').click(function() {
//         var couponCode = $('.coupon-select').val();
//         var totalPrice = parseFloat(document.getElementById("totalPrice")?.value || 0);
//         if (!couponCode) {
//             // Display SweetAlert message
//             Swal.fire({
//                 icon: 'warning',
//                 title: 'Oops...',
//                 text: 'Please choose a coupon.',
//             });
//             return; // Exit the function if coupon code is empty
//         }
//         $.ajax({
//             type: 'POST',
//             url: '/couponapply',
//             data: { couponcode: couponCode,totalPrice:totalPrice },
//             success: function(response) {
//                 if(response.successMsg){
//                     Swal.fire({
//                         icon: 'success',
//                         title: 'Success!',
//                         text: response.successMsg,
//                     }).then(function() {
//                         // Reload the window after displaying the success message
//                         window.location.reload();
//                     });
//                 }
//                 else{
//                     Swal.fire({
//                         icon: 'error',
//                         title: 'Oops...',
//                         text: response.errorMsg,
//                     });
//                 }
//             },
//             error: function(xhr, status, error) {
//                 // Handle error
//                 console.error(xhr.responseText);
//             }
//         });
//     });
// });

// $(document).ready(function() {
//     $('.remove-button').click(function() {
//         $.ajax({
//             type: 'POST',
//             url: '/removecouponapply',
//             success: function(response) {
//                 if(response.successMsg){
//                     Swal.fire({
//                         icon: 'success',
//                         title: 'Success!',
//                         text: response.successMsg,
//                     }).then(function() {
//                         // Reload the window after displaying the success message
//                         window.location.reload();
//                     });
//                 }
//                 else{
//                     Swal.fire({
//                         icon: 'error',
//                         title: 'Oops...',
//                         text: response.errorMsg,
//                     });
//                 }
//             },
//             error: function(xhr, status, error) {
//                 // Handle error
//                 console.error(xhr.responseText);
//             }
//         });
//     });
// });
