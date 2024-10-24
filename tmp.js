async function name() {
  let promise = new Promise(function(resolve, reject) {
    // the function is executed automatically when the promise is constructed
  
    // after 1 second signal that the job is done with the result "done"
    setTimeout(() => resolve("Just messing around"), 1000);
  });
  
  console.log(await promise)
}
name()