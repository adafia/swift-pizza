/*
 *  Validationas
 *
 */

// Define validations
const validations = {};

// create user validations
validations._userCreate = userInput => {
  // valid email format
  const validEmail = /^[^@\s]+@[^@\s\.]+\.[^@\.\s]+$/g;

  // Check that all required fields are field out
  const firstName =
    typeof userInput.firstName == 'string' &&
    userInput.firstName.trim().length > 0
      ? userInput.firstName.trim()
      : false;
  const lastName =
    typeof userInput.lastName == 'string' &&
    userInput.lastName.trim().length > 0
      ? userInput.lastName.trim()
      : false;
  const phone =
    typeof userInput.phone == 'string' && userInput.phone.trim().length > 10
      ? userInput.phone.trim()
      : false;
  const email =
    typeof userInput.email == 'string' &&
    validEmail.test(userInput.email) &&
    userInput.email.trim().length > 0
      ? userInput.email.trim()
      : false;
  const address =
    typeof userInput.address == 'string' && userInput.address.trim().length > 0
      ? userInput.address.trim()
      : false;
  const password =
    typeof userInput.password == 'string' &&
    userInput.password.trim().length > 0
      ? userInput.password.trim()
      : false;
  const tosAgreement =
    typeof userInput.tosAgreement == 'boolean' && userInput.tosAgreement == true
      ? true
      : false;

  if (
    firstName &&
    lastName &&
    phone &&
    email &&
    address &&
    password &&
    tosAgreement
  ) {
    return true;
  } else {
    const error = [];

    if (!firstName) {
      error.push('First name is required');
    }
    if (!lastName) {
      error.push('Last name is required');
    }
    if (!phone) {
      error.push(
        'Phone number is required and must be greater than 10 digits. Please prefix it with your country code'
      );
    }
    if (!email) {
      error.push(
        'Email is required and must be of the format: example@gmail.com'
      );
    }
    if (!address) {
      error.push('We need your Address to deliver your pizza');
    }
    if (!password) {
      error.push('Password field is required');
    }
    if (!tosAgreement) {
      error.push('Please agree to the terms and conditions before you proceed');
    }
    return error;
  }
};

// update user validations
validations._userUpdate = userInput => {
  // check for the required field
  const phone =
    typeof userInput.phone == 'string' && userInput.phone.trim().length > 10
      ? userInput.phone.trim()
      : false;

  // valid email format
  const validEmail = /^[^@\s]+@[^@\s\.]+\.[^@\.\s]+$/g;

  // check for optional fields
  const firstName =
    typeof userInput.firstName == 'string' &&
    userInput.firstName.trim().length > 0
      ? userInput.firstName.trim()
      : false;
  const lastName =
    typeof userInput.lastName == 'string' &&
    userInput.lastName.trim().length > 0
      ? userInput.lastName.trim()
      : false;
  const password =
    typeof userInput.password == 'string' &&
    userInput.password.trim().length > 0
      ? userInput.password.trim()
      : false;
  const email =
    typeof userInput.email == 'string' &&
    validEmail.test(userInput.email) &&
    userInput.email.trim().length > 0
      ? userInput.email.trim()
      : false;
  const address =
    typeof userInput.address == 'string' && userInput.address.trim().length > 0
      ? userInput.address.trim()
      : false;

  // Error if the phone is invalid
  if (phone) {
    // Error if nothing is sent to update
    if (firstName || lastName || email || address || password) {
      return true;
    } else {
      let error = [];
			if (typeof userInput.firstName !== 'undefined') {
				if (userInput.firstName.trim().length === 0) {
					error.push(
						'Sorry did you want to update your first name, you sent us an empty field'
					);
				}
      }
			if (typeof userInput.lastName !== 'undefined') {
				if (userInput.lastName.trim().length === 0) {
					error.push(
						'Sorry did you want to update your last name, you sent us an empty field'
					);
				}
      }
			if (typeof userInput.email !== 'undefined') {
				if (userInput.email.trim().length === 0) {
					error.push(
						'Sorry did you want to update your email, you sent us an empty field, your new email should be of the format: example@gmail.com'
					);
				}
      }
			if (typeof userInput.address !== 'undefined' ) {
				if (userInput.address.trim().length === 0) {
					error.push(
						'Sorry did you want to update your address, We can not deliver your pizza if you update your password with an empty string'
					);
				}
      }
			if (typeof userInput.password !== 'undefined') {
				if (userInput.password.trim().length === 0) {
					error.push(
						'Sorry did you want to update your password, you sent us an empty field'
					);
				} 
      }
      return error;
    }
  } else {
    return 'Your phone number is required to update your profile';
  }
};

// Export the validations
module.exports = validations;
