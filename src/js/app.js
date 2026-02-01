document.addEventListener("DOMContentLoaded", function () {
  const board = document.querySelector(".board");
  const addTask = document.querySelectorAll(".add-task");
  const state = new Map();
  let nextId = 1;

  loadStateFromLocalStorage();

  const placeholder = document.createElement("div");
  placeholder.className = "task-placeholder";

  addTask.forEach((task) => {
    task.addEventListener("click", (e) => {
      e.preventDefault;

      const target = e.currentTarget;
      const blockFooter = task.closest(".board__block-footer");

      const taskInfoHTML = `
                <div class="task-info">
                    <textarea name="task-description" id="" rows="5"></textarea>
                    <div class="task-info__control">
                        <a href="#" class="add-card">Add Card</a>
                        <a href="#">x</a>
                        <a href="#">...</a>
                    </div>
                </div>
            `;

      target.classList.add("hidden");
      blockFooter.insertAdjacentHTML("beforeend", taskInfoHTML);

      blockFooter.querySelector("textarea").focus();

      const taskInfo = blockFooter.lastElementChild;
      taskInfo.addEventListener("click", (e) => {
        if (e.target.classList.contains("add-card")) {
          const taskText = taskInfo.querySelector("textarea").value;

          console.log(taskText);

          const blockWrapper = e.target.closest(".board__block");
          const boardContent = blockWrapper.querySelector(".task__list");

          const taskHTML = `
                        <div class="task" draggable="true" id="${nextId}" data-status=${blockWrapper.id}>
                            ${taskText}
                            <a href="#" class="task__remove">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 2.41L13.59 1L8 6.59L2.41 1L1 2.41L6.59 8L1 13.59L2.41 15L8 9.41L13.59 15L15 13.59L9.41 8L15 2.41Z" fill="black"/>
                            </svg>
                        </a>
                        </div>
                    `;

          boardContent.insertAdjacentHTML("beforeend", taskHTML);
          taskInfo.remove();
          target.classList.remove("hidden");

          state.set(nextId, {
            id: nextId,
            status: blockWrapper.id,
            task: taskText,
          });
          nextId++;
          console.log(state);

          saveStateToLocalStorage();
        }
      });
    });
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".task:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY },
    ).element;
  }

  document.addEventListener("click", (e) => {
    console.log("Нажата кнопка:", e.target);
    if (
      e.target.classList.contains("task__remove") ||
      e.target.closest(".task__remove")
    ) {
      const task = e.target.closest(".task");
      console.log("Удаляется задача:", task);
      task.remove();
      state.delete(Number(task.id));
      saveStateToLocalStorage();
    }
  });

  const taskLists = document.querySelectorAll(".task__list");

  taskLists.forEach((list) => {
    list.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("task")) {
        e.target.style.cursor = "grabbing";
        e.dataTransfer.setData("text/plain", "");
        e.target.classList.add("selected");

        e.dataTransfer.setData("taskId", e.target.id);
        e.target.classList.add("dragging");

        placeholder.style.height = `${e.target.offsetHeight}px`;
      }
    });

    list.addEventListener("dragend", (e) => {
      if (e.target.classList.contains("task")) {
        e.target.style.cursor = "";
        e.target.classList.remove("selected");
      }

      placeholder.remove();
      document.querySelector(".dragging")?.classList.remove("dragging");
    });

    list.addEventListener("dragover", (e) => {
      e.preventDefault();

      const dragging = document.querySelector(".dragging");
      if (!dragging) return;

      const afterElement = getDragAfterElement(list, e.clientY);

      if (afterElement == null) {
        list.append(placeholder);
      } else {
        list.insertBefore(placeholder, afterElement);
      }
    });

    list.addEventListener("drop", (e) => {
      e.preventDefault();

      const taskId = e.dataTransfer.getData("taskId");
      const draggedItem = document.getElementById(taskId);

      list.insertBefore(draggedItem, placeholder);
      placeholder.remove();

      draggedItem.classList.remove("dragging");

      const newStatus = list.closest(".board__block").id;

      const item = state.get(Number(taskId));
      if (item) {
        item.status = newStatus;
        draggedItem.dataset.status = newStatus;
        saveStateToLocalStorage();
      }

      console.log("UPDATED STATE:", state);
    });
  });

  function saveStateToLocalStorage() {
    const stateToSave = {
      nextId: nextId,
      tasks: Object.fromEntries(state.entries()),
    };
    localStorage.setItem("trelloBoardState", JSON.stringify(stateToSave));
  }

  function loadStateFromLocalStorage() {
    const saved = localStorage.getItem("trelloBoardState");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      nextId = parsed.nextId || 1;

      state.clear();
      for (const [idStr, task] of Object.entries(parsed.tasks || {})) {
        const id = Number(idStr);
        state.set(id, {
          id: id,
          status: task.status,
          task: task.task,
        });
      }

      renderTasksFromState();
    } catch (e) {
      console.warn("Failed to parse saved state", e);
      localStorage.removeItem("trelloBoardState");
    }
  }

  function renderTasksFromState() {
    document.querySelectorAll(".task__list").forEach((list) => {
      list.innerHTML = "";
    });

    state.forEach((task) => {
      const column = document.getElementById(task.status);
      if (!column) return;

      const taskList = column.querySelector(".task__list");
      if (!taskList) return;

      const taskEl = document.createElement("div");
      taskEl.className = "task";
      taskEl.draggable = true;
      taskEl.id = task.id;
      taskEl.dataset.status = task.status;
      taskEl.innerHTML = `
        ${task.task}
        <a href="#" class="task__remove">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 2.41L13.59 1L8 6.59L2.41 1L1 2.41L6.59 8L1 13.59L2.41 15L8 9.41L13.59 15L15 13.59L9.41 8L15 2.41Z" fill="black"/>
          </svg>
        </a>
    `;
      taskList.append(taskEl);
    });
  }

  // Drag & Drop Task 2
  const formUpload = document.querySelector(".drag-and-drop-form");
  const preview = document.querySelector(".preview");
  const input = formUpload.querySelector('input[type="file"]');

  let selectedFiles = [];

  if (formUpload) {
    let hoverClassName = "hover";

    formUpload.addEventListener("dragenter", function (e) {
      e.preventDefault();
      formUpload.classList.add(hoverClassName);
    });

    formUpload.addEventListener("dragover", function (e) {
      e.preventDefault();
      formUpload.classList.add(hoverClassName);
    });

    formUpload.addEventListener("dragleave", function (e) {
      e.preventDefault();
      formUpload.classList.remove(hoverClassName);
    });

    formUpload.addEventListener("drop", (e) => {
      e.preventDefault();
      addFiles(e.dataTransfer.files);
    });

    input.addEventListener("change", (e) => {
      addFiles(e.target.files);
      input.value = "";
    });

    function addFiles(fileList) {
      Array.from(fileList).forEach((file) => {
        if (!file.type.startsWith("image/")) return;

        selectedFiles.push(file);
      });

      renderPreview();
    }

    function renderPreview() {
      preview.innerHTML = "";

      selectedFiles.forEach((file, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "preview__img-wrapper";

        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src);

        const removeImg = document.createElement("a");
        removeImg.href = "#";
        removeImg.className = "preview__img-remove";
        removeImg.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M15 2.41L13.59 1L8 6.59L2.41 1L1 2.41L6.59 8L1 13.59L2.41 15L8 9.41L13.59 15L15 13.59L9.41 8L15 2.41Z"/>
                </svg>
            `;

        removeImg.addEventListener("click", (e) => {
          e.preventDefault();
          selectedFiles.splice(index, 1);
          renderPreview();
        });

        wrapper.append(img, removeImg);
        preview.append(wrapper);
      });
    }
  }
});
