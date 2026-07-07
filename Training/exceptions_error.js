try {
    // Some code that might throw an error
    // throw new Error("Something went wrong");

    let x = 0;
    let y = 20;

    if (x == 0) {
        throw {message: "x is not zero"}; // This will throw an error with a custom message
    }

    // console.log(x + y); // This will throw a ReferenceError because 'y' is not defined
} catch (error) {
    console.error(error.message);
}