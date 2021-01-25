//SignUp
const signupForm = document.querySelector('#signup-form');

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.querySelector('#signup-email').value;
    const password = document.querySelector('#signup-password').value;

    auth
        .createUserWithEmailAndPassword(email, password)
        .then(userCredential => {

            signupForm.reset();

            $('signupModal').modal('hide');
        })
});

//Signin
const signinForm = document.querySelector('#login-form');

signinForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.querySelector('#login-email').value;
    const password = document.querySelector('#login-password').value;

    auth
        .signInWithEmailAndPassword(email, password)
        .then(userCredential => {

            signinForm.reset();

            $('signinModal').modal('hide');
        })
})

const logout = document.querySelector('#logout');

logout.addEventListener('click', e => {
    e.preventDefault();
    auth
        .signOut()
        .then(() => {
            alert("Adios")
        })
})

//App
const db = firebase.firestore();

const taskForm = document.getElementById('task-form');
const taskContainer = document.getElementById('tasks-container');

let editStatus = false;
let id = ''

const saveTask = (title, autor, year, editorial, description) =>
    db.collection('tasks').doc().set({
        title,
        autor,
        year,
        editorial,
        description
    })

const getTasks = () => db.collection('tasks').get();

const getTask = (id) => db.collection('tasks').doc(id).get();

const onGetTasks = (callback) => db.collection('tasks').onSnapshot(callback);

const deleteTask = id => db.collection('tasks').doc(id).delete();

const updateTask = (id, updateTask) => db.collection('tasks').doc(id).update(updateTask);

window.addEventListener('DOMContentLoaded', async (e) => {
    onGetTasks((querySnapshot) => {
        taskContainer.innerHTML = '';
        querySnapshot.forEach(doc => {
            console.log(doc.data())

            const task = doc.data();
            task.id = doc.id;

            taskContainer.innerHTML +=
                `<div class="card card-body mt-2 border-primary">
                <h3 class="h5">${task.title}</h3>
                <p>${task.autor}</p>
                <p>${task.year}</p>
                <p>${task.editorial}</p>
                <p>${task.description}</p>
                <div>
                    <button class="btn btn-primary btn-delete" data-id="${task.id}">Delete</button>
                    <button class="btn btn-secondary btn-edit" data-id="${task.id}">Editar</button>
                </div>
            </div>`

            const btnDelete = document.querySelectorAll('.btn-delete');
            btnDelete.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    await deleteTask(e.target.dataset.id)
                })
            })

            const btnsEdit = document.querySelectorAll('.btn-edit');
            btnsEdit.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const doc = await getTask(e.target.dataset.id);
                    const task = doc.data();

                    editStatus = true;
                    id = doc.id;

                    taskForm['book-title'].value = task.title;
                    taskForm['autor-name'].value = task.autor;
                    taskForm['book-year'].value = task.year;
                    taskForm['book-editorial'].value = task.editorial;
                    taskForm['description'].value = task.description;

                    taskForm['btn-task-form'].innerText = 'Update';
                })
            })

        })
    })
})

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = taskForm['book-title'];
    const autor = taskForm['autor-name'];
    const year = taskForm['book-year'];
    const editorial = taskForm['book-editorial'];
    const description = taskForm['description'];

    if (!editStatus) {
        await saveTask(title.value, autor.value, year.value, editorial.value, description.value);
    } else {
        await updateTask(id, {
            title: title.value,
            autor: autor.value,
            year: year.value,
            editorial: editorial.value,
            description: description.value
        })

        editStatus = false;

        taskForm['btn-task-form'].innerText = 'Save';

    }

    await getTasks();

    taskForm.reset();
    title.focus();
})