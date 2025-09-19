const Address = require("../model/address");
const AppError = require("./AppError");


async function validateAddress(addressId) {
    if (!addressId) throw new AppError("Address is required", 400);

    const address = await Address.findById(addressId);
    if (!address) throw new AppError("Address not found", 404);
    console.log(address.name,"this is the address you choosed")

    return {
        addressId: address._id,
        name: address.name,
        mobile: address.mobile,
        address: address.address,
        city: address.city,
        district: address.district,
        state: address.state,
        pincode: address.pincode
    };
}

module.exports = { validateAddress };
