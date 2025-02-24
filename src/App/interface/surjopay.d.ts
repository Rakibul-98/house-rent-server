declare module "shurjopay" {
  interface Credentials {
    root_url: string;
    merchant_username: string;
    merchant_password: string;
    merchant_key_prefix: string;
    return_url: string;

    readonly token_url: string;
    readonly verification_url: string;
    readonly payment_status_url: string;
  }

  interface TokenDetails {
    token: string;
    token_type: string;
    token_create_time: string;
    token_valid_duration: number;
  }

  interface PaymentRequest {
    prefix: string;
    token: string;
    return_url: string;
    cancel_url: string;
    store_id: string;
    amount: number;
    order_id: string;
    currency: string;
    customer_name: string;
    customer_address: string;
    customer_email: string;
    customer_phone: string;
    customer_city: string;
  }

  export interface PaymentResponse {
    checkout_url: string;
    amount: number;
    currency: string;
    sp_order_id: string;
    customer_order_id: string;
    customer_name: string;
    customer_address: string;
    customer_city: string;
    customer_phone: string;
    customer_email: string;
    client_ip: string;
    intent: string;
    transactionStatus: string;
  }

  interface VerificationRequest {
    order_id: string;
  }

  export interface VerificationResponse {
    id: number;
    order_id: string;
    currency: string;
    amount: number;
    payable_amount: number;
    discount_amount: number;
    disc_percent: number;
    received_amount: number;
    usd_amt: number;
    usd_rate: number;
    transaction_status: string;
    method: string;
    sp_message: string;
    sp_code: number;
    bank_status: string;
    name: string;
    email: string;
    address: string;
    city: string;
    date_time: string;
    value1?: string;
    value2?: string;
    value3?: string;
    value4?: string;
  }

  type Callback<T> = (response: T) => void;
  type ErrorHandler = (error: any) => void;

  class Shurjopay {
    data: { sp_token?: TokenDetails };
    credentials: Credentials;
    logger: Logger;

    constructor(): Shurjopay;

    config(
      root_url: string,
      merchant_username: string,
      merchant_password: string,
      merchant_key_prefix: string,
      return_url: string
    ): void;

    randomString(length: number): string;

    log(message: string, level: "info" | "warn" | "error"): void;

    authentication(callback: Callback<TokenDetails>): void;

    makePayment(
      checkout_params: PaymentRequest,
      checkout_callback?: Callback<PaymentResponse>,
      error_handler?: ErrorHandler
    ): void;

    verifyPayment(
      order_id: string,
      callback: Callback<VerificationResponse[]>,
      error_handler: ErrorHandler
    ): void;

    paymentStatus(
      order_id: string,
      callback: Callback<VerificationResponse>,
      error_handler: ErrorHandler
    ): void;

    token_valid(): boolean;
  }

  export default Shurjopay;
}
