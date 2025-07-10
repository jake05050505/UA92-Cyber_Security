function testit(){
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(10);
        }, 2000);
    });
}
async function printx(){
    let x = await testit();
    console.log(x);
}

printx();