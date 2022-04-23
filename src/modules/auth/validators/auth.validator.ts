import {BaseError, ErrorInput} from "../../../errors/errros";
import {isEmailRegistered} from "../../../DAL/user.dal";
import {validateEmail} from "../../../utils/general.validator";

export async function validateRegister(password: string, email: string) {
  if (!password || password.length < 6) {
    const input: ErrorInput = {
      message: 'password should be at least 6 characters',
      code: 400,
      name: 'Password Policy Error'
    }
    throw new BaseError(input);
  }
  const isValid = validateEmail(email);
  if (!isValid) {
    const input: ErrorInput = {
      message: 'invalid Email',
      code: 400,
      name: 'Invalid Email Error'
    };
    throw new BaseError(input);
  }

  const userExists = await isEmailRegistered(email);
  if (userExists) {
    const input: ErrorInput = {
      message: 'email is already registered',
      code: 400,
      name: 'Duplicate Email'
    };
    throw new BaseError(input);
  }


}