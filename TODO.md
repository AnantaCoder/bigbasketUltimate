# TODO: Implement OTP Login Flow

## Backend Changes

- [x] Add request-otp URL in backend/accounts/urls.py

## Frontend Changes

- [x] Add requestOTP async thunk in frontend/src/app/slices/authSlice.jsx
- [x] Update loginUser thunk to handle OTP parameter
- [x] Modify frontend/src/features/LoginSignup.jsx to add OTP request step for login

## Testing

- [x] Test the complete OTP login flow: enter email -> request OTP -> enter OTP -> login
