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
    let cellText = document.createTextNode(textValue)
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

let request = new XMLHttpRequest();
request.open("GET", "/getData");
request.responseType = "json";

request.onload = function() {
    addUsersToTable(request.response);
};

request.send();

function getCheckedUsersId(url) {
    let checkBoxes = document.getElementsByClassName("custom-checkbox")
    let checkedUsersId = [];
    for (let i = 0; i < checkBoxes.length; i++) {
        if (checkBoxes[i].checked) {
            checkedUsersId.push(checkBoxes[i].parentElement.nextElementSibling.textContent)
        }
    }

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("data=" + JSON.stringify(checkedUsersId));
}

document.getElementById("checkAll").onclick = function() {
    let checkBoxes = document.getElementsByClassName("custom-checkbox")
    for (let checkBox of checkBoxes) {
        checkBox.checked = this.checked;
    }
}