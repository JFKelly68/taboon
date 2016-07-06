(function() {
    let test = 'boners';

    const templateStr = `I love ${test}`;
    let arr = ['a','b'];

    console.log(templateStr);

    let noob = arr.map((char, idx) => char.toUpperCase() + idx);

    console.log(noob);

})();
