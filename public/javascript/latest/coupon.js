document.getElementById('couponTableContainer').addEventListener('click', function(event) {
    try {
        if (event.target.closest('.view-coupon-btn')) {
            const couponData = event.target.closest('.view-coupon-btn').dataset.coupon;
            console.log('Raw couponData:', couponData);
            if (!couponData) {
                throw new Error('Coupon data not found');
            }
            const coupon = JSON.parse(couponData);
            viewCoupon(coupon);
        }
        if (event.target.closest('.edit-coupon-btn')) {
            const couponData = event.target.closest('.edit-coupon-btn').dataset.coupon;
            console.log('Raw couponData:', couponData);
            if (!couponData) {
                throw new Error('Coupon data not found');
            }
            const coupon = JSON.parse(couponData);
            editCoupon(coupon);
        }
        if (event.target.closest('.delete-coupon-btn')) {
            const couponId = event.target.closest('.delete-coupon-btn').dataset.couponId;
            if (!couponId) {
                throw new Error('Coupon ID not found');
            }
            deleteCoupon(couponId);
        }
    } catch (error) {
        console.error('Error handling coupon table click:', error);
        Swal.fire('Error!', 'Failed to process action: ' + error.message, 'error');
    }
});
// Delete coupon function
async function deleteCoupon(couponId) {
    console.log(couponId)
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/admin/coupon/${couponId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Coupon has been deleted.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    location.reload();
                });
            } else {
                const result = await response.json();
                Swal.fire('Error!', result.message || 'Failed to delete coupon!', 'error');
            }
        } catch (error) {
            Swal.fire('Error!', 'Network error occurred!', 'error');
        }
    }
}

// View coupon function (uses coupon data from EJS)
function viewCoupon(coupon) {
    try {
        const viewContent = `
            <div class="row">
                <div class="col-md-6">
                    <h6><strong>Coupon Code:</strong></h6>
                    <p class="text-primary fs-4">${coupon.couponCode}</p>
                </div>
                <div class="col-md-6">
                    <h6><strong>Status:</strong></h6>
                    <span class="status-badge status-${coupon.status.toLowerCase()}">${coupon.status}</span>
                </div>
            </div>
            <hr>
            <div class="row">
                <div class="col-md-12">
                    <h6><strong>Description:</strong></h6>
                    <p>${coupon.description || 'No description provided'}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <h6><strong>Minimum Purchase:</strong></h6>
                    <p>₹${coupon.minimumPurchaseAmount}</p>
                </div>
                <div class="col-md-6">
                    <h6><strong>Discount:</strong></h6>
                    <p>${coupon.discountType === 'Percentage' ? coupon.discountValue + '%' : '₹' + coupon.discountValue} (${coupon.discountType})</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <h6><strong>Valid From:</strong></h6>
                    <p>${new Date(coupon.validFrom).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div class="col-md-6">
                    <h6><strong>Valid To:</strong></h6>
                    <p>${new Date(coupon.validTo).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <h6><strong>Usage Limit:</strong></h6>
                    <p>${coupon.usageLimit || 'Unlimited'}</p>
                </div>
                <div class="col-md-4">
                    <h6><strong>Used Count:</strong></h6>
                    <p>${coupon.usedCount}</p>
                </div>
                <div class="col-md-4">
                    <h6><strong>Per User Limit:</strong></h6>
                    <p>${coupon.perUserLimit}</p>
                </div>
            </div>
        `;
        
        document.getElementById('viewCouponBody').innerHTML = viewContent;
        const modal = new bootstrap.Modal(document.getElementById('viewCouponModal'));
        modal.show();
    } catch (error) {
        Swal.fire('Error!', 'Failed to load coupon details.', 'error');
    }
}

function editCoupon(coupon) {
    try {
        // Populate form with coupon data
        document.getElementById('couponId').value = coupon._id;
        document.getElementById('couponCode').value = coupon.couponCode;
        document.getElementById('description').value = coupon.description || '';
        document.getElementById('minimumPurchaseAmount').value = coupon.minimumPurchaseAmount;
        document.getElementById('discountType').value = coupon.discountType;
        document.getElementById('discountValue').value = coupon.discountValue;
        document.getElementById('validFrom').value = coupon.validFrom.split('T')[0];
        document.getElementById('validTo').value = coupon.validTo.split('T')[0];


        document.getElementById('couponModalLabel').textContent = 'Edit Coupon';
        updateDiscountLabel();
        document.getElementById('couponForm').classList.remove('was-validated');

        new bootstrap.Modal(document.getElementById('couponModal')).show();
    } catch (error) {
        console.error(error);
        Swal.fire('Error!', 'Failed to load coupon details.', 'error');
    }
}



// Function to generate random coupon code
function generateCouponCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    document.getElementById('couponCode').value = code;
}

// Function to update discount label and symbol based on type
function updateDiscountLabel() {
    const discountType = document.getElementById('discountType').value;
    const discountLabel = document.getElementById('discountLabel');
    const discountSymbol = document.getElementById('discountSymbol');
    
    if (discountType === 'Percentage') {
        discountLabel.textContent = '(%)';
        discountSymbol.textContent = '%';
    } else {
        discountLabel.textContent = '(₹)';
        discountSymbol.textContent = '₹';
    }
}

 // Validate form function
    function validateForm() {
        const form = document.getElementById('couponForm');
        let isValid = form.checkValidity();

        // Get form values
        const couponCode = document.getElementById('couponCode').value.trim();
        const description = document.getElementById('description').value.trim();
        const minPurchase = parseFloat(document.getElementById('minimumPurchaseAmount').value) || 0;
        const discountType = document.getElementById('discountType').value;
        const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
        const validFrom = document.getElementById('validFrom').value;
        const validTo = document.getElementById('validTo').value;
        const today = new Date().toISOString().split('T')[0];

        // Reset invalid states
        const fields = [
            'couponCode',
            'description',
            'minimumPurchaseAmount',
            'discountType',
            'discountValue',
            'validFrom',
            'validTo',
        ];
        fields.forEach(field => {
            const input = document.getElementById(field);
            input.classList.remove('is-invalid');
            const feedback = document.getElementById(`${field}Feedback`);
            if (feedback) {
                feedback.textContent = feedback.dataset.defaultMessage || `Please provide a valid ${field}.`;
            }
        });

        // Store default feedback messages
        document.getElementById('couponCodeFeedback').dataset.defaultMessage = 'Please provide a valid coupon code.';
        document.getElementById('descriptionFeedback').dataset.defaultMessage = 'Please provide a description.';
        document.getElementById('minimumPurchaseAmountFeedback').dataset.defaultMessage = 'Please provide a valid minimum purchase amount.';
        document.getElementById('discountTypeFeedback').dataset.defaultMessage = 'Please select a discount type.';
        document.getElementById('discountValueFeedback').dataset.defaultMessage = 'Please provide a valid discount value.';
        document.getElementById('validFromFeedback').dataset.defaultMessage = 'Please provide a valid start date.';
        document.getElementById('validToFeedback').dataset.defaultMessage = 'Please provide a valid end date.';

        // Validate coupon code
        if (!couponCode) {
            document.getElementById('couponCode').classList.add('is-invalid');
            document.getElementById('couponCodeFeedback').textContent = 'Coupon code is required.';
            isValid = false;
        }

        // Validate description (minimum 4 characters)
        if (description.length < 4) {
            document.getElementById('description').classList.add('is-invalid');
            document.getElementById('descriptionFeedback').textContent = 'Description must be at least 4 characters long.';
            isValid = false;
        }

        // Validate minimum purchase amount (>= 500)
        if (minPurchase < 500) {
            document.getElementById('minimumPurchaseAmount').classList.add('is-invalid');
            document.getElementById('minimumPurchaseAmountFeedback').textContent = 'Minimum purchase amount must be at least ₹500.';
            isValid = false;
        }

        // Validate discount type
        if (!discountType) {
            document.getElementById('discountType').classList.add('is-invalid');
            document.getElementById('discountTypeFeedback').textContent = 'Discount type is required.';
            isValid = false;
        }

        // Validate discount value
        if (discountValue <= 0) {
            document.getElementById('discountValue').classList.add('is-invalid');
            document.getElementById('discountValueFeedback').textContent = 'Discount value must be greater than 0.';
            isValid = false;
        } else if (discountType === 'Percentage' && discountValue > 30) {
            document.getElementById('discountValue').classList.add('is-invalid');
            document.getElementById('discountValueFeedback').textContent = 'Percentage discount cannot exceed 30%.';
            isValid = false;
        } else if (discountType === 'Flat') {
            const maxDiscount = 0.3 * minPurchase;
            if (discountValue > maxDiscount) {
                document.getElementById('discountValue').classList.add('is-invalid');
                document.getElementById('discountValueFeedback').textContent =
                    `Flat discount cannot exceed 30% of minimum purchase (₹${maxDiscount.toFixed(2)}).`;
                isValid = false;
            }
        }



        if (validFrom < today) {
            document.getElementById('validFrom').classList.add('is-invalid');
            document.getElementById('validFromFeedback').textContent = 'Start date must be today or in the future.';
            isValid = false;
        }
        if (validTo < today || validTo < validFrom) {
            document.getElementById('validTo').classList.add('is-invalid');
            document.getElementById('validToFeedback').textContent = 'End date must be after start date and today.';
            isValid = false;
        }


        // Add was-validated class if not valid
        if (!isValid) {
            form.classList.add('was-validated');
        }

        return isValid;
    }

// Add coupon button event listener
document.getElementById('addCouponBtn').addEventListener('click', function() {
    const form = document.getElementById('couponForm');
    form.reset();
    document.getElementById('couponId').value = ''; // Clear coupon ID for new coupon
    document.getElementById('couponModalLabel').textContent = 'Add New Coupon';
    updateDiscountLabel();
    form.classList.remove('was-validated');
    generateCouponCode(); // Auto-generate coupon code
    new bootstrap.Modal(document.getElementById('couponModal')).show();
});

// Save coupon (add or edit)
document.getElementById('saveCouponBtn').addEventListener('click', async function() {
    if (!validateForm()) return;

    const couponId = document.getElementById('couponId').value;
    const formData = {
        couponCode: document.getElementById('couponCode').value.trim(),
        description: document.getElementById('description').value.trim(),
        minimumPurchaseAmount: parseFloat(document.getElementById('minimumPurchaseAmount').value),
        discountType: document.getElementById('discountType').value,
        discountValue: parseFloat(document.getElementById('discountValue').value),
        validFrom: document.getElementById('validFrom').value,
        validTo: document.getElementById('validTo').value
    };

    const url = couponId ? `/admin/coupon/${couponId}` : '/admin/coupon';
    const method = couponId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        console.log(result)

        if (response.ok) {
            Swal.fire({
                title: 'Success!',
                text: couponId ? 'Coupon updated successfully!' : 'Coupon created successfully!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                bootstrap.Modal.getInstance(document.getElementById('couponModal')).hide();
                location.reload();
            });
        } else {
            Swal.fire('Error!', result.message || 'Something went wrong!', 'error');
        }
    } catch (error) {
        Swal.fire('Error!', 'Network error occurred!', 'error');
    }
});