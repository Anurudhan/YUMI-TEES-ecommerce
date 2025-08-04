const MESSAGES = {
  // Category-related messages
  CATEGORY: {
    ERROR: {
      EMPTY: "Category cannot contain spaces!",
      HAS_NUMBERS: "Category cannot contain numbers!",
      EXISTS: "Category already exists!",
      DUPLICATE: "This category already exists"
    },
    SUCCESS: {
      ADDED: "Successfully added the category",
      MODIFIED: "Successfully modified the category",
      SHOW: (name) => `Successfully showed ${name} category for user side`,
      HIDE: (name) => `Successfully hid ${name} category for user side`
    }
  },

  // Coupon-related messages
  COUPON: {
    ERROR: {
      EXISTS: "This coupon code already exists",
      SERVER: "Internal server error",
      ALREADY_APPLIED: "This order already has a coupon applied",
      NOT_APPLIED: "There is no coupon applied"
    },
    SUCCESS: {
      ADDED: "Coupon added successfully",
      UPDATED: "Coupon updated successfully",
      DELETED: "Coupon deleted successfully",
      APPLIED: "Coupon applied in your order",
      REMOVED: "Removed applied coupon from your order"
    }
  },

  // User-related messages
  USER: {
    ERROR: {
      NOT_FOUND: "Your email is not registered. Please sign up",
      INVALID_PASSWORD: "Your password is incorrect",
      ACCESS_DENIED: "Your account access is denied due to some issues",
      INVALID_OTP: "The OTP you entered is invalid",
      INVALID_EMAIL: "This email does not exist. Please sign up",
      INVALID_RESET_LINK: "This is an invalid password reset link",
      INVALID_USERNAME: "Username cannot contain numbers or symbols. Please enter valid values",
      EMPTY_USERNAME: "Username cannot contain only spaces"
    },
    SUCCESS: {
      BLOCKED: (name) => `Successfully blocked ${name} from this site`,
      ACTIVATED: (name) => `Successfully activated ${name} from this site`,
      PASSWORD_RESET: "The password was reset successfully",
      RESET_LINK_SENT: "Password reset link has been sent to your email",
      PROFILE_UPDATED: "Successfully modified your profile",
      PASSWORD_CHANGED: "Changed your password successfully"
    }
  },

  // Authentication-related messages
  AUTH: {
    ERROR: {
      INVALID_CREDENTIALS: "Your entered password or email is incorrect"
    }
  },

  // Dashboard-related messages
  DASHBOARD: {
    ERROR: {
      NO_ORDERS: (interval) => interval ? `There is no order for this ${interval}.` : "There is no order in these days"
    }
  },

  // Order-related messages
  ORDER: {
    ERROR: {
      NOT_FOUND: "Order not found",
      PENDING_PAYMENT: "Order cannot be delivered due to pending payment",
      NO_ADDRESS: "Please select an address or add a new address",
      ADDRESS_NOT_FOUND: "Address not found",
      INVOICE_FAILED: "Invoice generation failed",
      PAYMENT_FAILED: "Payment verification failed"
    },
    SUCCESS: {
      STATUS_UPDATED: "Order status updated successfully",
      RETURN_APPROVED: "Return approved successfully",
      RETURN_REQUESTED: "Order returned successfully",
      CANCELLED_ALL: "All orders canceled successfully",
      CANCELLED_SINGLE: "Order item canceled successfully",
      INVOICE_GENERATED: "Invoice generated successfully",
      PLACED: (method) => `Order placed successfully via ${method}`,
      PAYMENT_VERIFIED: "Payment verified successfully"
    }
  },

  // Product-related messages
  PRODUCT: {
    ERROR: {
      NOT_FOUND: "Product is not found",
      NOT_MODIFIED: "Product could not be modified",
      OUT_OF_STOCK: "Out of stock product"
    },
    SUCCESS: {
      ADDED: "You successfully added product",
      MODIFIED: "You successfully modified product",
      DELETED: "Product deleted successfully",
      SHOW: (name) => `Successfully showed ${name} for user side`,
      HIDE: (name) => `Successfully hid ${name} for user side`,
      IMAGE_DELETED: "Product image deleted successfully"
    }
  },

  // Banner-related messages
  BANNER: {
    SUCCESS: {
      ADDED: "New Banner added successfully",
      REPLACED: "Existing Banner replaced successfully"
    }
  },

  // Cart-related messages
  CART: {
    ERROR: {
      EMPTY: "Your cart is empty"
    },
    SUCCESS: {
      ADDED: "Product added to cart successfully",
      QUANTITY_UPDATED: "Product quantity updated",
      NEW_PRODUCT_ADDED: "New product added to cart",
      REMOVED: "Product removed from cart successfully"
    }
  },

  // Wallet-related messages
  WALLET: {
    ERROR: {
      INSUFFICIENT_BALANCE: "Insufficient balance in wallet",
      NOT_FOUND: "Wallet doesn't exist"
    }
  },

  // Address-related messages
  ADDRESS: {
    SUCCESS: {
      CREATED: "Successfully created address",
      UPDATED: "Address updated successfully",
      DELETED: "Address deleted successfully"
    }
  },

  // Wishlist-related messages
  WISHLIST: {
    ERROR: {
      EMPTY: "Your wishlist is empty",
      ALREADY_EXISTS: "This product already exists in your wishlist",
      USER_NOT_FOUND: "This user not found"
    },
    SUCCESS: {
      ADDED: "This product successfully added to your wishlist",
      REMOVED: "Product removed from wishlist successfully"
    }
  }
};

module.exports = MESSAGES;