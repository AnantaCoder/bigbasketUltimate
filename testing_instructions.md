# Step-by-Step Guide to Test Payment Integration with Postman

## 1. Obtain JWT Token (Login)

- Open Postman.
- Create a new POST request to your login endpoint, e.g.:
  ```
  http://127.0.0.1:8000/api/auth/login/
  ```
- In the **Body** tab, select **raw** and **JSON** format.
- Enter your login credentials:
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```
- Send the request.
- Copy the `access` token from the response.

## 2. Test Payment Intent API with Authentication

- Create a new POST request to the payment intent endpoint:
  ```
  http://127.0.0.1:8000/api/payments/payment-intent/
  ```
- In the **Headers** tab, add:
  - Key: `Authorization`
  - Value: `Bearer <your_access_token>` (replace with the token from step 1)
  - Key: `Content-Type`
  - Value: `application/json`
- In the **Body** tab, select **raw** and **JSON** format.
- Enter the payment data:
  ```json
  {
    "amount": 20.0,
    "currency": "usd"
  }
  ```
- Send the request.
- You should receive a response with the Stripe `clientSecret`.

## 3. Additional Notes

- Use Stripe test card number `4242 4242 4242 4242` for frontend testing.
- Ensure your backend server is running and accessible.
- If you encounter authentication errors, verify your token and login credentials.

---

If you want, I can also help you implement the login and token handling in your frontend code for a seamless experience.
