const jwt = require('jsonwebtoken');

// 1. Define a secure secret key (keep this safe!)
const MY_SECRET_KEY = "super_secret_key_that_nobody_knows";

// 2. Sign the token
// Structure: jwt.sign(payload, secretOrPrivateKey, [options])
let token = jwt.sign(
    { username: "John" }, // The Payload
    MY_SECRET_KEY,        // The Secret Key
    { algorithm: "HS256", expiresIn: "1h" } // The Options
);

console.log("Generated Token:", token);

// 3. Verify the token
// Structure: jwt.verify(token, secretOrPublicKey)
try {
    let decoded = jwt.verify(token, MY_SECRET_KEY);
    console.log("Decoded Payload:", decoded);
} catch (error) {
    console.error("Token verification failed:", error.message);
}