const GITHUB_TOKEN = "your_github_token";
let projects = JSON.parse(localStorage.getItem("projects")) || [];
let selectedProjectIndex = null;
function login() {
  document.getElementById("login-section").style.display = "none";
  document.getElementById("app-section").style.display = "block";
  renderProjects();
}
function createProject() {
  const title = document.getElementById("project-title").value.trim();
  if (!title) return alert("Enter a project title.");

  const project = {
    id: `proj_${Date.now()}`,
    title,
    createdDate: new Date().toISOString(),
    todos: []
  };
  
  projects.push(project);
  document.getElementById("project-title").value = "";
  saveProjects();
  renderProjects();
}
function renderProjects() {
  const container = document.getElementById("projects-container");
  container.innerHTML = "";

  projects.forEach((project, index) => {
    const projectDiv = document.createElement("div");
    projectDiv.textContent = project.title;
    projectDiv.onclick = () => viewProject(index);
    container.appendChild(projectDiv);
  });
}
function viewProject(index) {
  selectedProjectIndex = index;
  const project = projects[index];

  document.getElementById("edit-project-title").value = project.title;
  document.getElementById("project-detail").style.display = "block";
  renderTodos();
}
function updateProjectTitle(event) {
  const newTitle = event.target.value.trim();
  if (newTitle) {
    projects[selectedProjectIndex].title = newTitle;
    saveProjects();
    renderProjects();
  }
}
function addTodo() {
  const description = document.getElementById("todo-description").value.trim();
  if (!description) return alert("Enter a todo description.");

  const todo = {
    id: `todo_${Date.now()}`,
    description,
    status: "pending",
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString()
  };
  
  projects[selectedProjectIndex].todos.push(todo);
  document.getElementById("todo-description").value = "";
  saveProjects();
  renderTodos();
}
function renderTodos() {
  const todosContainer = document.getElementById("todos-container");
  todosContainer.innerHTML = "";

  projects[selectedProjectIndex].todos.forEach((todo, todoIndex) => {
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo-item");
    const todoText = document.createElement("span");
    todoText.textContent = `${todo.description} (${new Date(todo.createdDate).toLocaleDateString()}) - ${todo.status}`;
    todoDiv.appendChild(todoText);
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = todo.status === "pending" ? "Complete" : "Pending";
    toggleBtn.onclick = () => toggleTodoStatus(todoIndex);
    todoDiv.appendChild(toggleBtn);
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editTodoDescription(todoIndex);
    todoDiv.appendChild(editBtn);
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.onclick = () => removeTodo(todoIndex);
    todoDiv.appendChild(removeBtn);

    todosContainer.appendChild(todoDiv);
  });
}
function toggleTodoStatus(index) {
  const todo = projects[selectedProjectIndex].todos[index];
  todo.status = todo.status === "completed" ? "pending" : "completed";
  todo.updatedDate = new Date().toISOString();
  saveProjects();
  renderTodos();
}
function editTodoDescription(index) {
  const newDescription = prompt("Edit description:", projects[selectedProjectIndex].todos[index].description);
  if (newDescription) {
    projects[selectedProjectIndex].todos[index].description = newDescription;
    projects[selectedProjectIndex].todos[index].updatedDate = new Date().toISOString();
    saveProjects();
    renderTodos();
  }
}
function removeTodo(index) {
  projects[selectedProjectIndex].todos.splice(index, 1);
  saveProjects();
  renderTodos();
}
function saveProjects() {
  localStorage.setItem("projects", JSON.stringify(projects));
}

function exportProjectAsGist() {
  const project = projects[selectedProjectIndex];
  const completedTodos = project.todos.filter(todo => todo.status === "completed");
  const pendingTodos = project.todos.filter(todo => todo.status === "pending");

  const content = `
${project.title}
Summary: ${completedTodos.length} / ${project.todos.length} completed

Pending 
${pendingTodos.map(todo => `[ ] ${todo.description}`).join("\n")}

Completed 
${completedTodos.map(todo => `[x] ${todo.description}`).join("\n")}
  `;

  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${project.title}.md`;
  link.click();
  URL.revokeObjectURL(url);
}
