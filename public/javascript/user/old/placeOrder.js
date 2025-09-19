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