import './bootstrap';

axios.defaults.headers.common['Accept'] = 'application/json';

const tasks = document.querySelectorAll(".task");
const lanes = document.querySelectorAll(".lane");

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const todoLane = document.getElementById("todo-lane");

const taskError = document.getElementById("task-error");


// Drag and Drop
tasks.forEach((task) => {
    task.addEventListener("dragstart", () => {
        task.classList.add("is-dragging");
    });

    task.addEventListener("dragend", () => {
        task.classList.remove("is-dragging");

        lanes.forEach((lane) => {
            updatePositions(lane);
        })


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
        moveTask(task.textContent, lane.dataset.name, task.dataset.position);
    });
}

function moveTask(name, status, position) {
    axios.post('/moveTask', {
        'name': name,
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
            taskElement.textContent = task.name;
            taskElement.draggable = true;
            

            taskElement.addEventListener("dragstart", () => {
                taskElement.classList.add("is-dragging");
            });

            taskElement.addEventListener("dragend", () => {
                taskElement.classList.remove("is-dragging");
            });

            todoLane.appendChild(taskElement);
            todoLane.dataset.size = Number(todoLane.dataset.size) + 1;

            form.reset();
        })
        .catch((error) => {
            console.log(error.response.data);
        })
        
        
        input.value = "";
    });
}
