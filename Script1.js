// script.js — Vanilla JS ToDo App (front-end only)
// Features:
// - Add tasks (form submit / Enter key)
// - Toggle complete by clicking item (event delegation)
// - Remove task (trash button)
// - Filter: all / active / completed
// - Clear completed
// - Simple in-memory state (array); UI updates instantly (no reload)
// - Accessible: aria-live for list

(() => {
  // DOM elements
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const itemsLeft = document.getElementById('items-left');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const clearCompletedBtn = document.getElementById('clear-completed');

  // App state
  let todos = []; // { id: number, text: string, completed: boolean }
  let filter = 'all';

  // Helpers
  const uid = () => Date.now() + Math.floor(Math.random() * 1000);

  function addTodo(text) {
    if (!text || !text.trim()) return;
    const todo = { id: uid(), text: text.trim(), completed: false };
    todos.unshift(todo); // newest on top
    render();
  }

  function removeTodo(id) {
    todos = todos.filter(t => t.id !== id);
    render();
  }

  function toggleTodo(id) {
    todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    render();
  }

  function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    render();
  }

  function setFilter(newFilter) {
    filter = newFilter;
    filterButtons.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
    render();
  }

  function filteredTodos() {
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }

  // UI render
  function render() {
    // update counts
    itemsLeft.textContent = todos.filter(t => !t.completed).length;

    // clear list
    list.innerHTML = '';

    const items = filteredTodos();
    if (items.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'todo-item';
      empty.innerHTML = `<div style="color:var(--muted); width:100%; text-align:center; padding:10px 0;">No tasks — add one above.</div>`;
      list.appendChild(empty);
      return;
    }

    for (const t of items) {
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.dataset.id = t.id;

      const left = document.createElement('div');
      left.className = 'left';
      left.setAttribute('role', 'button');
      left.setAttribute('tabindex', '0');

      const checkbox = document.createElement('div');
      checkbox.className = 'checkbox' + (t.completed ? ' checked' : '');
      checkbox.setAttribute('aria-hidden', 'true');
      checkbox.innerHTML = t.completed ? '✓' : '';

      const label = document.createElement('div');
      label.className = 'label' + (t.completed ? ' completed' : '');
      label.textContent = t.text;

      left.appendChild(checkbox);
      left.appendChild(label);

      const right = document.createElement('div');
      right.className = 'right';

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.title = 'Remove';
      removeBtn.setAttribute('aria-label', 'Remove task');
      removeBtn.innerHTML = '🗑';

      right.appendChild(removeBtn);

      li.appendChild(left);
      li.appendChild(right);

      list.appendChild(li);
    }
  }

  // Event listeners

  // Add task (form submit)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo(input.value);
    input.value = '';
    input.focus();
  });

  // Event delegation for list: toggle complete and remove
  list.addEventListener('click', (e) => {
    const li = e.target.closest('li.todo-item');
    if (!li) return;
    const id = Number(li.dataset.id);

    // remove button clicked?
    if (e.target.closest('.remove-btn')) {
      removeTodo(id);
      return;
    }

    // otherwise toggle (click on left area)
    toggleTodo(id);
  });

  // keyboard accessibility for toggling via Enter/Space on item
  list.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const li = e.target.closest('li.todo-item, .left');
      if (!li) return;
      const id = Number(li.dataset?.id || li.parentElement?.dataset?.id);
      if (!id) return;
      e.preventDefault();
      toggleTodo(id);
    }
  });

  // Filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  // Clear completed
  clearCompletedBtn.addEventListener('click', clearCompleted);

  // Initial render
  render();

  // expose a tiny debug API on window (optional)
  window._TODOS = {
    get: () => todos.slice(),
    add: (txt) => { addTodo(txt); },
    clearAll: () => { todos = []; render(); }
  };
})();
