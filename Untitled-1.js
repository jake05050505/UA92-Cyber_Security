arr = "user@domain.com".split('@');
arr[1] = arr[1].split('.');
console.log(arr);
arr = [arr[0],arr[1][0],arr[1][1]];
console.log(arr);