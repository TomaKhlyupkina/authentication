let xhr = new XMLHttpRequest();
xhr.open("GET", "/getData");
xhr.responseType = "json";

xhr.onload = function() {
    addUsersToTable(xhr.response);
};

xhr.send();

function addUsersToTable(users) {
    let tableBody = document.getElementById("tableBody")
    const columnsValues = ["id", "name", "email", "registrationDate", "lastLoginDate", "status"]

    for (const user of users) {
        let newRow = document.createElement("tr")
        addCheckBoxToRow(newRow)
        for (const value of columnsValues) {
            addTextNodeToRow(newRow, user[value])
        }
        tableBody.appendChild(newRow)
    }
}

function addTextNodeToRow(row, textValue) {
    let cell = document.createElement("td")
    const cellText = document.createTextNode(textValue)
    cell.appendChild(cellText)
    row.appendChild(cell)
}

function addCheckBoxToRow(row) {
    let checkBox = document.createElement("td")
    let checkboxInput = document.createElement("input")
    checkboxInput.setAttribute("class", "form-check-input custom-checkbox")
    checkboxInput.setAttribute("type", "checkbox")
    checkBox.appendChild(checkboxInput)
    row.appendChild(checkBox)
}

function getCheckedUsersId(url) {
    const checkBoxes = document.getElementsByClassName("custom-checkbox")
    let checkedUsersId = [];
    for (const checkBox of checkBoxes) {
        if (checkBox.checked) {
            checkedUsersId.push(checkBox.parentElement.nextElementSibling.textContent)
        }
    }

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("data=" + JSON.stringify(checkedUsersId));
}

document.getElementById("checkAll").onclick = function() {
    const checkBoxes = document.getElementsByClassName("custom-checkbox")
    for (let checkBox of checkBoxes) {
        checkBox.checked = this.checked;
    }
}