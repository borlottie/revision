if (typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
    const input = document.getElementById("myTextField")
    input.value = localStorage.data
  } else {
    console.log("No storage support")
  }

function dataSubmit() {
  if (typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
    const input = document.getElementById("myTextField")
    localStorage.setItem("data", input.value);
    console.log("saved data as "+localStorage.data)
  } else {
    console.log("No storage support")
  }
}