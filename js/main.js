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
      child: "Ted",
      date: getIsoDate(4),
      time: "09:00",
      notes: "Return the signed form and payment slip.",
      createdBy: "Alex",
    },
    {
      id: "event-2",
      title: "Dentist appointment",
      child: "Gus",
      date: getIsoDate(12),
      time: "16:30",
      notes: "Bring the blue folder from the kitchen drawer.",
      createdBy: "Sam",
    },
    {
      id: "event-3",
      title: "Birthday party",
      child: "Both",
      date: getIsoDate(22),
      time: "14:00",
      notes: "Present already bought. Card still needed.",
      createdBy: "Alex",
    },
  ],
};

let state = loadState();

const calendarGrid = document.querySelector("#calendar-grid");
const monthLabel = document.querySelector("#month-label");
const upcomingList = document.querySelector("#upcoming-list");
const eventForm = document.querySelector("#event-form");

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
    notes: data.get("notes").trim(),
    createdBy: "Alex",
  });
  saveState();
  eventForm.reset();
  eventForm.closest("dialog").close();
  render();
});

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return normalizeState(structuredClone(seedData));
  }

  try {
    return normalizeState(JSON.parse(saved));
  } catch {
    return normalizeState(structuredClone(seedData));
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function normalizeState(nextState) {
  nextState.events = nextState.events.map((event) => {
    const child = {
      Maya: "Ted",
      Leo: "Gus",
    }[event.child] || event.child;

    const { location, ...eventWithoutLocation } = event;
    return {
      ...eventWithoutLocation,
      child,
      time: event.time || "09:00",
    };
  });

  return nextState;
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
