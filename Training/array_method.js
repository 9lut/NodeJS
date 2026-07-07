let array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// let sum = array.reduce((curr, next) => {
//     return curr + next;
// });

// console.log(sum);



let some = array.some((element) => {
    return element > 5;
});
console.log(some);