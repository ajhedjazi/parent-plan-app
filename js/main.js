const storageKey = "coParentCalendarPrototype";

const formatDate = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const formatMonth = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
});

const today = new Date();
let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const seedData = {
  events: [
    {
      id: "event-1",
      title: "School trip form due",
      child: "Maya",
      date: getIsoDate(4),
      time: "",
      location: "School office",
      notes: "Return the signed form and payment slip.",
      createdBy: "Alex",
    },
    {
      id: "event-2",
      title: "Dentist appointment",
      child: "Leo",
      date: getIsoDate(12),
      time: "16:30",
      location: "North Road Dental",
      notes: "Bring the blue folder from the kitchen drawer.",
      createdBy: "Sam",
    },
    {
      id: "event-3",
      title: "Birthday party",
      child: "Maya",
      date: getIsoDate(22),
      time: "14:00",
      location: "The Green",
      notes: "Present already bought. Card still needed.",
      createdBy: "Alex",
    },
  ],
  requests: [
    {
      id: "request-1",
      title: "Move dentist appointment",
      details: "The clinic has offered a later slot on the same day. Can we move it to 4:30pm?",
      date: getIsoDate(12),
      status: "pending",
      createdBy: "Sam",
      responseNote: "",
    },
    {
      id: "request-2",
      title: "Add school fair date",
      details: "School fair is listed for the last Friday of the month. Add it to the shared calendar?",
      date: getIsoDate(26),
      status: "accepted",
      createdBy: "Alex",
      responseNote: "Agreed. Added to the plan for that week.",
    },
    {
      id: "request-3",
      title: "Swap swimming pickup",
      details: "Can you cover swimming pickup this week? I have a late meeting.",
      date: getIsoDate(18),
      status: "declined",
      createdBy: "Sam",
      responseNote: "I cannot cover that time this week.",
    },
  ],
};

let state = loadState();

const calendarGrid = document.querySelector("#calendar-grid");
const monthLabel = document.querySelector("#month-label");
const upcomingList = document.querySelector("#upcoming-list");
const pendingRequests = document.querySelector("#pending-requests");
const requestList = document.querySelector("#request-list");
const eventForm = document.querySelector("#event-form");
const requestForm = document.querySelector("#request-form");

document.querySelector("#prev-month").addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  render();
});

document.querySelector("#next-month").addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  render();
});

document.querySelectorAll("[data-open-panel]").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = document.querySelector(`#${button.dataset.openPanel}`);
    if (panel) {
      setDefaultFormDate(panel);
      panel.showModal();
    }
  });
});

document.querySelectorAll("[data-close-panel]").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest("dialog")?.close();
  });
});

eventForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(eventForm);
  state.events.push({
    id: createId("event"),
    title: data.get("title").trim(),
    child: data.get("child"),
    date: data.get("date"),
    time: data.get("time"),
    location: data.get("location").trim(),
    notes: data.get("notes").trim(),
    createdBy: "Alex",
  });
  saveState();
  eventForm.reset();
  eventForm.closest("dialog").close();
  render();
});

requestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(requestForm);
  state.requests.unshift({
    id: createId("request"),
    title: data.get("title").trim(),
    details: data.get("details").trim(),
    date: data.get("date"),
    status: "pending",
    createdBy: "Alex",
    responseNote: "",
  });
  saveState();
  requestForm.reset();
  requestForm.closest("dialog").close();
  render();
});

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return structuredClone(seedData);
  }

  try {
    return JSON.parse(saved);
  } catch {
    return structuredClone(seedData);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function getIsoDate(dayOffset) {
  const date = new Date(today.getFullYear(), today.getMonth(), dayOffset);
  return toIsoDate(date);
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function render() {
  renderCalendar();
  renderUpcoming();
  renderPendingRequests();
  renderRequests();
}

function renderCalendar() {
  calendarGrid.innerHTML = "";
  monthLabel.textContent = formatMonth.format(visibleMonth);

  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - offset);

  for (let index = 0; index < 42; index += 1) {
    const cellDate = new Date(gridStart);
    cellDate.setDate(gridStart.getDate() + index);
    const isoDate = toIsoDate(cellDate);
    const dayEvents = state.events.filter((item) => item.date === isoDate);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.setAttribute("aria-label", getCalendarLabel(cellDate, dayEvents));

    if (cellDate.getMonth() !== visibleMonth.getMonth()) {
      button.classList.add("is-muted");
    }

    if (isoDate === toIsoDate(today)) {
      button.classList.add("is-today");
    }

    const number = document.createElement("span");
    number.className = "day-number";
    number.textContent = cellDate.getDate();

    const markers = document.createElement("span");
    markers.className = "day-markers";
    dayEvents.slice(0, 3).forEach(() => {
      const dot = document.createElement("span");
      dot.className = "day-dot";
      markers.append(dot);
    });

    button.append(number, markers);
    button.addEventListener("click", () => openDayEvents(isoDate));
    calendarGrid.append(button);
  }
}

function renderUpcoming() {
  const monthEvents = getEventsForVisibleMonth();
  upcomingList.innerHTML = "";

  if (!monthEvents.length) {
    upcomingList.append(createEmptyState("No child-related dates in this month yet."));
    return;
  }

  monthEvents.forEach((event) => {
    upcomingList.append(createEventCard(event));
  });
}

function renderPendingRequests() {
  const pending = state.requests.filter((request) => request.status === "pending");
  pendingRequests.innerHTML = "";

  if (!pending.length) {
    pendingRequests.append(createEmptyState("No requests need a response right now."));
    return;
  }

  pending.slice(0, 2).forEach((request) => {
    pendingRequests.append(createRequestCard(request, true));
  });
}

function renderRequests() {
  requestList.innerHTML = "";
  state.requests.forEach((request) => {
    requestList.append(createRequestCard(request));
  });
}

function getEventsForVisibleMonth() {
  return state.events
    .filter((event) => {
      const eventDate = new Date(`${event.date}T00:00:00`);
      return (
        eventDate.getFullYear() === visibleMonth.getFullYear() &&
        eventDate.getMonth() === visibleMonth.getMonth()
      );
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

function createEventCard(event) {
  const card = document.createElement("article");
  card.className = "event-card";

  const date = document.createElement("p");
  date.className = "date-pill";
  date.textContent = formatEventDate(event);

  const title = document.createElement("h3");
  title.textContent = event.title;

  const meta = document.createElement("div");
  meta.className = "event-meta";
  meta.append(createTextNode(event.child));
  if (event.location) {
    meta.append(createTextNode(event.location));
  }

  const createdBy = document.createElement("p");
  createdBy.className = "created-by";
  createdBy.textContent = `Created by ${event.createdBy}`;

  const detail = document.createElement("div");
  detail.className = "event-detail";

  if (event.notes) {
    const notes = document.createElement("p");
    notes.innerHTML = `<strong>Event notes:</strong> ${escapeHtml(event.notes)}`;
    detail.append(notes);
  }

  const detailButton = document.createElement("button");
  detailButton.className = "button button-secondary";
  detailButton.type = "button";
  detailButton.textContent = "View details";
  detailButton.addEventListener("click", () => {
    card.classList.toggle("is-open");
    detailButton.textContent = card.classList.contains("is-open") ? "Hide details" : "View details";
  });

  card.append(date, title, meta, createdBy, detailButton, detail);
  return card;
}

function createRequestCard(request, compact = false) {
  const card = document.createElement("article");
  card.className = "request-card";

  const status = document.createElement("span");
  status.className = `status-badge status-${request.status}`;
  status.textContent = getStatusLabel(request.status);

  const title = document.createElement("h3");
  title.textContent = request.title;

  const details = document.createElement("p");
  details.className = "request-details";
  details.textContent = request.details;

  const meta = document.createElement("div");
  meta.className = "request-meta";
  meta.append(createTextNode(`Requested by ${request.createdBy}`));
  if (request.date) {
    meta.append(createTextNode(formatDate.format(new Date(`${request.date}T00:00:00`))));
  }

  card.append(status, title, details, meta);

  if (request.status === "pending") {
    const response = document.createElement("div");
    response.className = "response-note";

    const responseId = `response-${request.id}`;
    const label = document.createElement("label");
    label.setAttribute("for", responseId);
    label.textContent = "Response note";

    const note = document.createElement("textarea");
    note.id = responseId;
    note.rows = compact ? 2 : 3;
    note.placeholder = "Optional short note";

    const actions = document.createElement("div");
    actions.className = "request-actions";
    actions.append(
      createStatusButton(request.id, "accepted", note),
      createStatusButton(request.id, "declined", note),
    );

    response.append(label, note, actions);
    card.append(response);
  } else if (request.responseNote) {
    const response = document.createElement("p");
    response.className = "request-details";
    response.innerHTML = `<strong>Response note:</strong> ${escapeHtml(request.responseNote)}`;
    card.append(response);
  }

  return card;
}

function createStatusButton(requestId, status, noteInput) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = status === "accepted" ? "button button-accept" : "button button-decline";
  button.textContent = status === "accepted" ? "Accept" : "Decline";
  button.addEventListener("click", () => {
    const request = state.requests.find((item) => item.id === requestId);
    if (!request) {
      return;
    }

    request.status = status;
    request.responseNote = noteInput.value.trim();
    saveState();
    render();
  });
  return button;
}

function openDayEvents(isoDate) {
  const event = state.events.find((item) => item.date === isoDate);
  if (!event) {
    const panel = document.querySelector("#event-panel");
    panel.querySelector('[name="date"]').value = isoDate;
    panel.showModal();
    return;
  }

  const card = [...document.querySelectorAll(".event-card")].find((item) =>
    item.querySelector("h3")?.textContent === event.title
  );

  card?.scrollIntoView({ behavior: "smooth", block: "center" });
  card?.classList.add("is-open");
}

function setDefaultFormDate(panel) {
  const dateInput = panel.querySelector('input[type="date"]');
  if (dateInput && !dateInput.value) {
    dateInput.value = toIsoDate(today);
  }
}

function createEmptyState(text) {
  const template = document.querySelector("#empty-state-template");
  const clone = template.content.firstElementChild.cloneNode(true);
  clone.querySelector("p").textContent = text;
  return clone;
}

function createTextNode(text) {
  const span = document.createElement("span");
  span.textContent = text;
  return span;
}

function formatEventDate(event) {
  const dateText = formatDate.format(new Date(`${event.date}T00:00:00`));
  return event.time ? `${dateText}, ${event.time}` : dateText;
}

function getStatusLabel(status) {
  return {
    pending: "Needs response",
    accepted: "Agreed",
    declined: "Not agreed",
  }[status];
}

function getCalendarLabel(date, events) {
  const label = formatDate.format(date);
  if (!events.length) {
    return `${label}, no events. Click to add an event.`;
  }

  return `${label}, ${events.length} event${events.length === 1 ? "" : "s"}.`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[character];
  });
}

render();
