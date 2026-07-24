import './bootstrap';

axios.defaults.headers.common['Accept'] = 'application/json';

const lanes = document.querySelectorAll(".lane");
var tasks = document.querySelectorAll(".task");
var selected = null;
var editing = false;

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const todoLane = document.getElementById("todo-lane");

const editDeleteButtons = document.getElementById("edit-delete-buttons");
const editButton= document.getElementById("edit-button");
const deleteButton = document.getElementById("delete-button");

const taskError = document.getElementById("task-error");


// Drag and Drop

addListeners();

function addListeners() {
    tasks = document.querySelectorAll(".task");

    tasks.forEach((task) => {
        task.addEventListener("dragstart", () => {
            deselectTask();
            task.classList.add("is-dragging");
        });

        task.addEventListener("dragend", () => {
            task.classList.remove("is-dragging");

            lanes.forEach((lane) => {
                updatePositions(lane);
            })


        });

        task.addEventListener("click", (e) => {
            console.log("Task selected: " + task.dataset.name);
            selectTask(task);
        });

    });


    lanes.forEach((lane) => {
        lane.addEventListener("dragover", (e) => {
            e.preventDefault();

            const nextTask = checkNextTask(lane, e.clientY);
            const currentTask = document.querySelector(".is-dragging");

            if (!nextTask) {
                lane.appendChild(currentTask);
            }
            else {
                lane.insertBefore(currentTask, nextTask);
                
            }
        });

        lane.addEventListener("dragleave", (e) => {
            e.preventDefault();
        })
    });
}

const checkNextTask = (lane, mouseY) => {
    const elems = lane.querySelectorAll(".task:not(.is-dragging)");

    let closestTask = null;
    let closestOffset = Number.NEGATIVE_INFINITY;

    elems.forEach((task) => {
        const rect = task.getBoundingClientRect();
        const center = getRectCenter(rect);
        const offset = mouseY - center;

        if (offset < 0 && offset > closestOffset) {
            closestTask = task;
            closestOffset = offset;
        }
    });

    return closestTask;
};


const getRectCenter = (rect) => {
    return (rect.top + rect.bottom) / 2;
};

function updatePositions(lane) {
    const currentLaneTasks = lane.querySelectorAll(".task");

    currentLaneTasks.forEach((task, index) => {
        task.dataset.position = index + 1;
    });

    currentLaneTasks.forEach((task, index) => {
        moveTask(Number(task.dataset.id), lane.dataset.name, task.dataset.position);
    });
}

function moveTask(id, status, position) {
    axios.post('/moveTask', {
        'id': id,
        'status': status,
        'position': position
    })
    .then((response) => {
        form.reset();
    })
    .catch((error) => {
        console.log(error.response.data);
    })
}

// Add Button
if (form != null) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();


        axios.post('/addTask', {
            name: input.value,
            status: 'todo',
            position: Number(todoLane.dataset.size) + 1
        })
        .then((response) => {
            const task = response.data.task;

            const taskElement = document.createElement("div");
    
            taskElement.className = "task";
            taskElement.textContent = taskElement.dataset.name = task.name;
            taskElement.dataset.id = task.id;
            taskElement.dataset.position = task.position;
            taskElement.draggable = true;
            
            todoLane.appendChild(taskElement);
            todoLane.dataset.size = Number(todoLane.dataset.size) + 1;

            addListeners();
            form.reset();
        })
        .catch((error) => {
            console.log(error.response.data);
        })
        
        
        input.value = "";
    });
}

// Edit and Delete
function selectTask(task) {
    if (task != selected){
        deselectTask();
        selected = task;
        selected.classList.add("selected");
        editDeleteButtons.classList.remove("hidden");

        editButton.addEventListener("click", (e) => {
            editing = true;
            editDeleteButtons.classList.add("hidden");
            console.log("Editing: " + selected.dataset.name);
            let editForm = document.createElement("form");
            editForm.id = "editForm";
            let input = document.createElement("input");
            input.type = "text";
            input.value = selected.dataset.name
            editForm.appendChild(input);

            selected.textContent = "";
            selected.appendChild(editForm);


            editForm.addEventListener("submit", (e) => {
                e.preventDefault();

                axios.post("/editTask", {
                    'id': Number(selected.dataset.id),
                    'newName': input.value
                })
                .then((response) => {
                    editForm.remove();
                    selected.textContent = selected.dataset.name = response.data.task.name;
                    editing = false;
                    deselectTask();
                    addListeners();
                })
                .catch((error) => {
                console.log(error.response?.data);
                })
            })
        });

        deleteButton.addEventListener("click", (e) => {
            axios.post("/deleteTask", {
                'id': Number(selected.dataset.id)
            })
            .then((response) => {
                selected.remove();
                deselectTask();
                addListeners();
            })
            .catch((error) => {
                console.log(error.response.data);
            })
        });
    }

}

function deselectTask() {
    if (selected != null){
        if (editing) {
            selected.removeChild(document.querySelector("editForm"));
            selected.textContent = selected.dataset.name;
            editing = false;
        }

        selected.classList.remove("selected");
        console.log(selected.dataset.name + " Deselected");
        editDeleteButtons.classList.add("hidden");
        selected = null;
    }
}


document.addEventListener("click", (e) => {

    if (selected != null) {
        if (!selected.contains(e.target) && !editButton.contains(e.target) && !deleteButton.contains(e.target)){
            deselectTask();
        }
    }
})
