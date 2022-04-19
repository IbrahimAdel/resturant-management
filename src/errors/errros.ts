export class BaseError extends Error {
  code: number;
  constructor(
    errorInput: ErrorInput
  ) {
    const {
      message,
      code,
      name,
      stack
    } = errorInput;
    super(message);
    this.code = code;
    this.name = name;
    this.message = message;
    this.stack = stack;
  }

  printDetails() {
    // tslint:disable-next-line:no-console
    console.error(`${this.name} occurred: code = ${this.code}, message = ${this.message}`);
  }
}

export interface ErrorInput {
  name: string;
  message: string;
  code: number;
  stack?: string;
}