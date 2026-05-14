const storageKey = "coParentCalendarPrototype";
const legacySeedEvents = new Map([
  ["event-1", "School trip form due"],
  ["event-2", "Dentist appointment"],
  ["event-3", "Birthday party"],
]);

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
const dadWeekendAnchorMs = Date.UTC(2026, 4, 15);

const childOptions = ["Ted", "Gus", "Both"];
const weekdayMap = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};
const monthMap = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const seedData = {
  events: [],
};

let state = loadState();

const calendarGrid = document.querySelector("#calendar-grid");
const monthLabel = document.querySelector("#month-label");
const upcomingList = document.querySelector("#upcoming-list");
const eventsMonthCount = document.querySelector("#events-month-count");
const childrenCount = document.querySelector("#children-count");
const sharedWithCount = document.querySelector("#shared-with-count");
const eventForm = document.querySelector("#event-form");
const eventDetailPanel = document.querySelector("#event-detail-panel");
const eventDetailTitle = document.querySelector("#event-detail-title");
const eventDetailView = document.querySelector("#event-detail-view");
const eventEditForm = document.querySelector("#event-edit-form");
const cancelEditEventButton = document.querySelector("#cancel-edit-event");
const magicDatesPanel = document.querySelector("#magic-dates-panel");
const magicDatesForm = document.querySelector("#magic-dates-form");
const magicClarificationPanel = document.querySelector("#magic-clarification");
const magicClarificationCopy = document.querySelector("#magic-clarification-copy");
const magicPreviewPanel = document.querySelector("#magic-preview");
const magicPreviewList = document.querySelector("#magic-preview-list");
const magicAddAllButton = document.querySelector("#magic-add-all");
const magicEditPreviewButton = document.querySelector("#magic-edit-preview");
const magicCancelButton = document.querySelector("#magic-cancel");
const magicCancelPreviewButton = document.querySelector("#magic-cancel-preview");

let magicPreviewEvents = [];
let magicPreviewIsEditing = false;

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
    status: "active",
  });
  saveState();
  eventForm.reset();
  eventForm.closest("dialog").close();
  render();
});

eventEditForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const eventId = eventDetailPanel.dataset.eventId;
  const eventIndex = state.events.findIndex((item) => item.id === eventId);

  if (eventIndex === -1) {
    eventDetailPanel.close();
    return;
  }

  const data = new FormData(eventEditForm);
  state.events[eventIndex] = {
    ...state.events[eventIndex],
    title: data.get("title").trim(),
    child: data.get("child"),
    date: data.get("date"),
    time: data.get("time"),
    notes: data.get("notes").trim(),
    updatedAt: new Date().toISOString(),
    updatedBy: "Alex",
  };

  saveState();
  render();
  showEventDetails(eventId);
});

cancelEditEventButton.addEventListener("click", () => {
  showEventDetails(eventDetailPanel.dataset.eventId);
});

magicDatesForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const rawText = magicDatesForm.elements.magicText.value.trim();
  const result = parseMagicDates(rawText, getMagicClarifications());

  renderMagicClarifications(result.questions);
  if (result.questions.length) {
    magicPreviewPanel.classList.add("is-hidden");
    return;
  }

  magicPreviewEvents = result.events.map((eventItem) => {
    const previewEvent = {
      ...eventItem,
      previewId: createId("preview"),
    };

    return {
      ...previewEvent,
      duplicate: isDuplicateEvent(previewEvent),
    };
  });
  magicPreviewIsEditing = false;
  renderMagicPreview();
});

magicAddAllButton.addEventListener("click", () => {
  addMagicPreviewEvents();
});

magicEditPreviewButton.addEventListener("click", () => {
  magicPreviewIsEditing = !magicPreviewIsEditing;
  renderMagicPreview();
});

magicCancelButton.addEventListener("click", () => {
  resetMagicImporter();
  magicDatesPanel.close();
});

magicCancelPreviewButton.addEventListener("click", () => {
  resetMagicImporter();
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
  nextState.events = nextState.events.filter(isUserEvent).map((event) => {
    const child = {
      Maya: "Ted",
      Leo: "Gus",
    }[event.child] || event.child;

    const { location, ...eventWithoutLocation } = event;
    return {
      ...eventWithoutLocation,
      child,
      time: event.time || "09:00",
      endTime: event.endTime || "",
      status: event.status || "active",
    };
  });

  return nextState;
}

function isUserEvent(event) {
  return legacySeedEvents.get(event.id) !== event.title;
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
  const monthEvents = getEventsForVisibleMonth();
  renderCalendar();
  renderUpcoming(monthEvents);
  renderStats(monthEvents);
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
    const parentDay = getParentDay(cellDate);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.setAttribute("aria-label", getCalendarLabel(cellDate, dayEvents, parentDay));

    if (parentDay) {
      button.classList.add("is-parent-day", `parent-day-${parentDay.key}`);
    }

    if (cellDate.getMonth() !== visibleMonth.getMonth()) {
      button.classList.add("is-muted");
    }

    if (isoDate === toIsoDate(today)) {
      button.classList.add("is-today");
    }

    const number = document.createElement("span");
    number.className = "day-number";
    number.textContent = cellDate.getDate();

    const header = document.createElement("span");
    header.className = "day-header";
    header.append(number);

    if (parentDay) {
      const parentLabel = document.createElement("span");
      parentLabel.className = "parent-day-label";
      parentLabel.textContent = parentDay.label;
      header.append(parentLabel);
    }

    const markers = document.createElement("span");
    markers.className = "day-markers";
    dayEvents.slice(0, 3).forEach((dayEvent) => {
      const dot = document.createElement("span");
      dot.className = "day-dot";
      if (isSpecialOccasion(dayEvent)) {
        dot.classList.add("tone-gift");
      }
      if (dayEvent.status === "cancelled") {
        dot.classList.add("is-cancelled");
      }
      markers.append(dot);
    });

    button.append(header, markers);
    button.addEventListener("click", () => openDayEvents(isoDate));
    calendarGrid.append(button);
  }
}

function renderUpcoming(monthEvents = getEventsForVisibleMonth()) {
  upcomingList.innerHTML = "";

  if (!monthEvents.length) {
    upcomingList.append(createEmptyState("No child-related dates in this month yet."));
    return;
  }

  monthEvents.forEach((event) => {
    upcomingList.append(createEventCard(event));
  });
}

function renderStats(monthEvents = getEventsForVisibleMonth()) {
  const activeMonthEvents = monthEvents.filter((event) => event.status !== "cancelled");
  const children = childOptions.filter((child) => child !== "Both");
  const sharedWith = new Set(state.events.map((event) => event.createdBy).filter(Boolean));

  eventsMonthCount.textContent = String(activeMonthEvents.length);
  childrenCount.textContent = String(children.length);
  sharedWithCount.textContent = String(sharedWith.size);
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
  if (isSpecialOccasion(event)) {
    card.classList.add("tone-gift");
  }
  if (event.status === "cancelled") {
    card.classList.add("is-cancelled");
  }

  const date = document.createElement("div");
  date.className = "event-date-badge";
  if (event.status === "cancelled") {
    date.classList.add("is-cancelled");
  }

  const dateText = document.createElement("span");
  dateText.textContent = formatDate.format(new Date(`${event.date}T00:00:00`));

  const timeText = document.createElement("strong");
  timeText.textContent = event.time;
  date.append(dateText, timeText);

  const status = document.createElement("span");
  status.className = `status-badge status-${event.status}`;
  status.textContent = getStatusLabel(event.status);

  const body = document.createElement("div");
  body.className = "event-card-body";

  const title = document.createElement("h3");
  title.textContent = event.title;

  const meta = document.createElement("div");
  meta.className = "event-meta";
  meta.append(createBadge(event.child, "child-badge"));
  if (event.source === "ai_import") {
    meta.append(createBadge("Magic Dates", "source-badge"));
  }

  const createdBy = document.createElement("p");
  createdBy.className = "created-by";
  createdBy.textContent = `Created by ${event.createdBy}`;

  body.append(title, meta, createdBy);
  if (event.status === "cancelled") {
    body.append(status);
  }

  const actionWrap = document.createElement("div");
  actionWrap.className = "event-card-actions";

  const detailButton = document.createElement("button");
  detailButton.className = "button button-secondary event-card-action";
  detailButton.type = "button";
  detailButton.textContent = "View / edit";
  detailButton.addEventListener("click", () => {
    openEventDetails(event.id);
  });

  if (isSpecialOccasion(event)) {
    actionWrap.append(createGiftIcon());
  }

  actionWrap.append(detailButton);
  card.append(date, body, actionWrap);
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

  openEventDetails(event.id);
}

function openEventDetails(eventId) {
  if (!getEventById(eventId)) {
    return;
  }

  showEventDetails(eventId);
  eventDetailPanel.showModal();
}

function showEventDetails(eventId) {
  const event = getEventById(eventId);
  if (!event) {
    eventDetailPanel.close();
    return;
  }

  eventDetailPanel.dataset.eventId = event.id;
  eventDetailTitle.textContent = event.title;
  eventDetailView.classList.remove("is-hidden");
  eventEditForm.classList.add("is-hidden");
  renderEventDetailView(event);
}

function renderEventDetailView(event) {
  eventDetailView.innerHTML = "";

  const status = document.createElement("span");
  status.className = `status-badge status-${event.status}`;
  status.textContent = getStatusLabel(event.status);

  const details = document.createElement("dl");
  details.className = "detail-list";
  const detailRows = [
    createDetailRow("Title", event.title),
    createDetailRow("Date", formatDate.format(new Date(`${event.date}T00:00:00`))),
    createDetailRow("Time", event.time),
  ];

  if (event.endTime) {
    detailRows.push(createDetailRow("End time", event.endTime));
  }

  detailRows.push(
    createDetailRow("Child/person", event.child),
    createDetailRow("Notes/details", event.notes || "No notes added"),
    createDetailRow("Created by", event.createdBy),
    createDetailRow("Status", getStatusLabel(event.status)),
  );

  if (event.source === "ai_import") {
    detailRows.push(createDetailRow("Source", "Magic Dates"));
  }

  details.append(...detailRows);

  const actions = document.createElement("div");
  actions.className = "event-detail-actions";

  const editButton = document.createElement("button");
  editButton.className = "button button-primary";
  editButton.type = "button";
  editButton.textContent = "Edit event";
  editButton.addEventListener("click", () => showEditEventForm(event.id));

  const cancelButton = document.createElement("button");
  cancelButton.className = "button button-secondary";
  cancelButton.type = "button";
  cancelButton.textContent = "Cancel event";
  cancelButton.disabled = event.status === "cancelled";
  cancelButton.addEventListener("click", () => cancelEvent(event.id));

  const deleteButton = document.createElement("button");
  deleteButton.className = "button button-secondary button-danger";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete event";
  deleteButton.addEventListener("click", () => deleteEvent(event.id));

  actions.append(editButton, cancelButton, deleteButton);
  eventDetailView.append(status, details, actions);
}

function showEditEventForm(eventId) {
  const event = getEventById(eventId);
  if (!event) {
    eventDetailPanel.close();
    return;
  }

  eventDetailView.classList.add("is-hidden");
  eventEditForm.classList.remove("is-hidden");
  eventEditForm.elements.title.value = event.title;
  eventEditForm.elements.child.value = event.child;
  eventEditForm.elements.date.value = event.date;
  eventEditForm.elements.time.value = event.time;
  eventEditForm.elements.notes.value = event.notes || "";
}

function cancelEvent(eventId) {
  const event = getEventById(eventId);
  if (!event) {
    eventDetailPanel.close();
    return;
  }

  event.status = "cancelled";
  event.updatedAt = new Date().toISOString();
  event.updatedBy = "Alex";
  saveState();
  render();
  showEventDetails(eventId);
}

function deleteEvent(eventId) {
  const event = getEventById(eventId);
  if (!event) {
    eventDetailPanel.close();
    return;
  }

  const confirmed = window.confirm(`Delete "${event.title}"? This removes it from the calendar.`);
  if (!confirmed) {
    return;
  }

  state.events = state.events.filter((item) => item.id !== eventId);
  saveState();
  render();
  eventDetailPanel.close();
}

function getEventById(eventId) {
  return state.events.find((event) => event.id === eventId);
}

function createDetailRow(label, value) {
  const wrapper = document.createElement("div");
  wrapper.className = "detail-row";

  const term = document.createElement("dt");
  term.textContent = label;

  const description = document.createElement("dd");
  description.textContent = value;

  wrapper.append(term, description);
  return wrapper;
}

function parseMagicDates(rawText, clarifications) {
  const questions = [];
  const child = detectChild(rawText) || clarifications.child;
  const timeInfo = parseTime(rawText, clarifications.time);
  const isRecurring = /\bevery\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(rawText);
  const isVagueDate = /\b(next|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(rawText);
  const timeMatters = /\b(appointment|dentist|doctor|meeting|pickup|pick up|football|swimming|club|lesson)\b/i.test(rawText);

  if (!child) {
    questions.push({
      field: "child",
      message: "Who should these dates be for?",
    });
  }

  if (isVagueDate && !clarifications.exactDate) {
    questions.push({
      field: "exactDate",
      message: "Which exact date should be used?",
    });
  }

  if (timeMatters && !timeInfo.startTime) {
    questions.push({
      field: "time",
      message: "What time should be used?",
    });
  }

  if (isRecurring && !hasRecurringEnd(rawText) && !clarifications.recurringEndDate) {
    questions.push({
      field: "recurringEndDate",
      message: "When should the repeating dates stop?",
    });
  }

  if (questions.length) {
    return { events: [], questions };
  }

  const events = isRecurring
    ? parseRecurringEvents(rawText, child, clarifications)
    : parseOneOffEvents(rawText, child, clarifications);

  if (!events.length) {
    return {
      events: [],
      questions: [
        {
          field: "exactDate",
          message: "Which exact date should this be added to?",
        },
      ],
    };
  }

  return { events, questions: [] };
}

function parseRecurringEvents(rawText, child, clarifications) {
  const weekdayMatch = rawText.match(/\bevery\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
  if (!weekdayMatch) {
    return [];
  }

  const weekday = weekdayMap[weekdayMatch[1].toLowerCase()];
  const timeInfo = parseTime(rawText, clarifications.time);
  const endDate = getRecurringEndDate(rawText, clarifications);
  const weeks = getRecurringWeekCount(rawText);
  const title = extractRecurringTitle(rawText, child);
  const assumptions = [...timeInfo.assumptions];
  const firstDate = getNextWeekday(today, weekday);
  const dates = [];

  if (weeks) {
    for (let index = 0; index < weeks; index += 1) {
      const nextDate = new Date(firstDate);
      nextDate.setDate(firstDate.getDate() + index * 7);
      dates.push(nextDate);
    }
  } else if (endDate) {
    for (let nextDate = new Date(firstDate); nextDate <= endDate; nextDate.setDate(nextDate.getDate() + 7)) {
      dates.push(new Date(nextDate));
    }
  }

  return dates.map((date) =>
    createImportedEvent({
      title,
      date: toIsoDate(date),
      time: timeInfo.startTime || "09:00",
      endTime: timeInfo.endTime,
      child,
      notes: `Imported from Magic Dates: ${rawText}`,
      assumptions: timeInfo.startTime ? assumptions : [...assumptions, "Assumed 09:00 because no time was supplied."],
      sourceLine: rawText,
    }),
  );
}

function parseOneOffEvents(rawText, child, clarifications) {
  const segments = splitMagicSegments(rawText);
  const events = [];

  segments.forEach((segment) => {
    const date = parseExplicitDate(segment, clarifications.exactDate);
    if (!date) {
      return;
    }

    const timeInfo = parseTime(segment, clarifications.time);
    const title = extractOneOffTitle(segment);

    events.push(
      createImportedEvent({
        title,
        date,
        time: timeInfo.startTime || "09:00",
        endTime: timeInfo.endTime,
        child,
        notes: `Imported from Magic Dates: ${segment}`,
        assumptions: timeInfo.startTime ? timeInfo.assumptions : [...timeInfo.assumptions, "Assumed 09:00 because no time was supplied."],
        sourceLine: segment,
      }),
    );
  });

  return events;
}

function createImportedEvent(eventData) {
  return {
    title: eventData.title,
    date: eventData.date,
    time: eventData.time,
    endTime: eventData.endTime || "",
    child: eventData.child,
    notes: eventData.notes,
    createdBy: "Alex",
    status: "active",
    source: "ai_import",
    assumptions: eventData.assumptions || [],
    sourceLine: eventData.sourceLine,
  };
}

function renderMagicClarifications(questions) {
  const fields = [...magicClarificationPanel.querySelectorAll("[data-clarification-field]")];
  magicClarificationPanel.classList.toggle("is-hidden", !questions.length);
  magicClarificationCopy.textContent = questions.map((question) => question.message).join(" ");

  fields.forEach((field) => {
    const control = field.querySelector("input, select");
    const isVisible = questions.some((question) => question.field === field.dataset.clarificationField);
    field.classList.toggle("is-hidden", !isVisible);
    control.required = isVisible;
  });
}

function getMagicClarifications() {
  return {
    child: magicDatesForm.elements.clarificationChild.value,
    exactDate: magicDatesForm.elements.clarificationDate.value,
    recurringEndDate: magicDatesForm.elements.clarificationEndDate.value,
    time: magicDatesForm.elements.clarificationTime.value,
  };
}

function renderMagicPreview() {
  renderMagicClarifications([]);
  magicPreviewPanel.classList.remove("is-hidden");
  magicPreviewList.innerHTML = "";
  magicPreviewEvents = magicPreviewEvents.map((eventItem) => ({
    ...eventItem,
    duplicate: isDuplicateEvent(eventItem),
  }));

  if (!magicPreviewEvents.length) {
    magicPreviewList.append(createEmptyState("No dates could be generated yet."));
  } else {
    magicPreviewEvents.forEach((eventItem) => {
      magicPreviewList.append(createMagicPreviewCard(eventItem));
    });
  }

  magicAddAllButton.disabled = !magicPreviewEvents.some((eventItem) => !eventItem.duplicate && isPreviewEventReady(eventItem));
  magicEditPreviewButton.textContent = magicPreviewIsEditing ? "Review preview" : "Edit before adding";
}

function createMagicPreviewCard(eventItem) {
  const card = document.createElement("article");
  card.className = "preview-card";

  if (magicPreviewIsEditing) {
    card.append(createPreviewEditor(eventItem));
    return card;
  }

  const date = document.createElement("p");
  date.className = "date-pill";
  date.textContent = formatEventDate(eventItem);

  const title = document.createElement("h3");
  title.textContent = eventItem.title;

  const meta = document.createElement("div");
  meta.className = "event-meta";
  meta.append(createTextNode(eventItem.child));
  if (eventItem.endTime) {
    meta.append(createTextNode(`Ends ${eventItem.endTime}`));
  }

  const notes = document.createElement("p");
  notes.className = "preview-notes";
  notes.textContent = eventItem.notes;

  card.append(date, title, meta, notes, createPreviewFlags(eventItem));
  return card;
}

function createPreviewEditor(eventItem) {
  const fields = document.createElement("div");
  fields.className = "preview-fields";

  fields.append(
    createPreviewInput(eventItem, "title", "Title", "text", true),
    createPreviewSelect(eventItem),
    createPreviewInput(eventItem, "date", "Date", "date", true),
    createPreviewInput(eventItem, "time", "Start time", "time", true),
    createPreviewInput(eventItem, "endTime", "End time", "time", false),
    createPreviewTextarea(eventItem),
  );

  return fields;
}

function createPreviewInput(eventItem, field, labelText, type, required) {
  const label = document.createElement("label");
  const labelCopy = document.createElement("span");
  const input = document.createElement("input");

  labelCopy.textContent = labelText;
  input.type = type;
  input.value = eventItem[field] || "";
  input.required = required;
  input.addEventListener("input", () => {
    eventItem[field] = input.value;
  });

  label.append(labelCopy, input);
  return label;
}

function createPreviewSelect(eventItem) {
  const label = document.createElement("label");
  const labelCopy = document.createElement("span");
  const select = document.createElement("select");

  labelCopy.textContent = "Child/person";
  childOptions.forEach((optionValue) => {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = optionValue;
    select.append(option);
  });
  select.value = eventItem.child;
  select.required = true;
  select.addEventListener("change", () => {
    eventItem.child = select.value;
  });

  label.append(labelCopy, select);
  return label;
}

function createPreviewTextarea(eventItem) {
  const label = document.createElement("label");
  const labelCopy = document.createElement("span");
  const textarea = document.createElement("textarea");

  labelCopy.textContent = "Notes/details";
  textarea.rows = 3;
  textarea.value = eventItem.notes || "";
  textarea.addEventListener("input", () => {
    eventItem.notes = textarea.value;
  });

  label.append(labelCopy, textarea);
  return label;
}

function createPreviewFlags(eventItem) {
  const messages = [...(eventItem.assumptions || [])];
  const missingFields = getMissingPreviewFields(eventItem);

  if (missingFields.length) {
    messages.push(`${missingFields.join(", ")} missing. This will be skipped.`);
  }

  if (eventItem.duplicate) {
    messages.push("Possible duplicate already on the calendar. This will be skipped.");
  }

  const wrapper = document.createElement("div");
  wrapper.className = "preview-flags";

  messages.forEach((message) => {
    const flag = document.createElement("p");
    flag.textContent = message;
    wrapper.append(flag);
  });

  return wrapper;
}

function addMagicPreviewEvents() {
  magicPreviewEvents = magicPreviewEvents.map((eventItem) => ({
    ...eventItem,
    duplicate: isDuplicateEvent(eventItem),
  }));

  const eventsToAdd = magicPreviewEvents
    .filter((eventItem) => !eventItem.duplicate && isPreviewEventReady(eventItem))
    .map(({ previewId, duplicate, assumptions, sourceLine, ...eventItem }) => ({
      ...eventItem,
      id: createId("event"),
      createdBy: "Alex",
      status: "active",
      source: "ai_import",
    }));

  if (!eventsToAdd.length) {
    renderMagicPreview();
    return;
  }

  state.events.push(...eventsToAdd);
  visibleMonth = new Date(`${eventsToAdd[0].date}T00:00:00`);
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  saveState();
  render();
  resetMagicImporter();
  magicDatesPanel.close();
}

function resetMagicImporter() {
  magicDatesForm.reset();
  magicPreviewEvents = [];
  magicPreviewIsEditing = false;
  magicPreviewPanel.classList.add("is-hidden");
  magicPreviewList.innerHTML = "";
  renderMagicClarifications([]);
}

function isDuplicateEvent(candidate) {
  return state.events.some((eventItem) => {
    return (
      eventItem.status !== "cancelled" &&
      eventItem.date === candidate.date &&
      eventItem.time === candidate.time &&
      eventItem.child === candidate.child &&
      eventItem.title.trim().toLowerCase() === candidate.title.trim().toLowerCase()
    );
  });
}

function isPreviewEventReady(eventItem) {
  return !getMissingPreviewFields(eventItem).length;
}

function getMissingPreviewFields(eventItem) {
  const missingFields = [];
  if (!eventItem.title.trim()) {
    missingFields.push("Title");
  }
  if (!eventItem.date) {
    missingFields.push("Date");
  }
  if (!eventItem.time) {
    missingFields.push("Time");
  }
  if (!eventItem.child) {
    missingFields.push("Child/person");
  }
  return missingFields;
}

function detectChild(text) {
  const lowerText = text.toLowerCase();
  if (/\b(both|boys|kids|children)\b/.test(lowerText)) {
    return "Both";
  }

  return childOptions.find((child) => new RegExp(`\\b${child}\\b`, "i").test(text)) || "";
}

function splitMagicSegments(text) {
  return text
    .split(/\n|;|(?:\.\s+)/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function parseExplicitDate(text, fallbackDate) {
  if (fallbackDate) {
    return fallbackDate;
  }

  const isoMatch = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    return isoMatch[0];
  }

  const slashMatch = text.match(/\b(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2,4}))?\b/);
  if (slashMatch) {
    const year = slashMatch[3] ? normalizeYear(Number(slashMatch[3])) : today.getFullYear();
    return toIsoDate(new Date(year, Number(slashMatch[2]) - 1, Number(slashMatch[1])));
  }

  const dayMonthMatch = text.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(\d{4}))?\b/i,
  );
  if (dayMonthMatch) {
    const month = monthMap[dayMonthMatch[2].toLowerCase()];
    const year = dayMonthMatch[3] ? Number(dayMonthMatch[3]) : today.getFullYear();
    return toIsoDate(new Date(year, month, Number(dayMonthMatch[1])));
  }

  const monthDayMatch = text.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,\s*(\d{4}))?\b/i,
  );
  if (monthDayMatch) {
    const month = monthMap[monthDayMatch[1].toLowerCase()];
    const year = monthDayMatch[3] ? Number(monthDayMatch[3]) : today.getFullYear();
    return toIsoDate(new Date(year, month, Number(monthDayMatch[2])));
  }

  return "";
}

function parseTime(text, fallbackTime) {
  if (fallbackTime) {
    return {
      startTime: fallbackTime,
      endTime: "",
      assumptions: [],
    };
  }

  const assumptions = [];
  const rangeMatch = text.match(
    /\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i,
  );

  if (rangeMatch) {
    const endPeriod = rangeMatch[6] || rangeMatch[3] || "";
    const startPeriod = rangeMatch[3] || endPeriod;
    return {
      startTime: normalizeTime(Number(rangeMatch[1]), rangeMatch[2], startPeriod, assumptions),
      endTime: normalizeTime(Number(rangeMatch[4]), rangeMatch[5], endPeriod, assumptions),
      assumptions,
    };
  }

  const atMatch = text.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (atMatch) {
    return {
      startTime: normalizeTime(Number(atMatch[1]), atMatch[2], atMatch[3], assumptions),
      endTime: "",
      assumptions,
    };
  }

  const periodMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (periodMatch) {
    return {
      startTime: normalizeTime(Number(periodMatch[1]), periodMatch[2], periodMatch[3], assumptions),
      endTime: "",
      assumptions,
    };
  }

  const clockMatch = text.match(/\b(\d{1,2}):(\d{2})\b/);
  if (clockMatch) {
    return {
      startTime: normalizeTime(Number(clockMatch[1]), clockMatch[2], "", assumptions),
      endTime: "",
      assumptions,
    };
  }

  return {
    startTime: "",
    endTime: "",
    assumptions,
  };
}

function normalizeTime(hour, minute = "00", period = "", assumptions = []) {
  let normalizedHour = hour;
  const normalizedMinute = minute || "00";
  const normalizedPeriod = period ? period.toLowerCase() : "";

  if (normalizedPeriod === "pm" && normalizedHour < 12) {
    normalizedHour += 12;
  }

  if (normalizedPeriod === "am" && normalizedHour === 12) {
    normalizedHour = 0;
  }

  if (!normalizedPeriod && normalizedHour >= 1 && normalizedHour <= 7) {
    normalizedHour += 12;
    assumptions.push(`Assumed ${hour}:${normalizedMinute} means ${hour}:${normalizedMinute}pm.`);
  }

  return `${String(normalizedHour).padStart(2, "0")}:${String(normalizedMinute).padStart(2, "0")}`;
}

function hasRecurringEnd(text) {
  return /\buntil\b/i.test(text) || /\bfor\s+\d+\s+weeks?\b/i.test(text);
}

function getRecurringEndDate(text, clarifications) {
  if (clarifications.recurringEndDate) {
    return new Date(`${clarifications.recurringEndDate}T00:00:00`);
  }

  const untilText = text.match(/\buntil\s+(.+)$/i)?.[1] || "";
  const explicitDate = parseExplicitDate(untilText, "");
  if (explicitDate) {
    return new Date(`${explicitDate}T00:00:00`);
  }

  const monthMatch = untilText.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(\d{4}))?\b/i,
  );
  if (!monthMatch) {
    return null;
  }

  const month = monthMap[monthMatch[1].toLowerCase()];
  const year = monthMatch[2] ? Number(monthMatch[2]) : today.getFullYear();
  return new Date(year, month + 1, 0);
}

function getRecurringWeekCount(text) {
  const weeksMatch = text.match(/\bfor\s+(\d+)\s+weeks?\b/i);
  return weeksMatch ? Number(weeksMatch[1]) : 0;
}

function getNextWeekday(fromDate, weekday) {
  const nextDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const diff = (weekday + 7 - nextDate.getDay()) % 7 || 7;
  nextDate.setDate(nextDate.getDate() + diff);
  return nextDate;
}

function extractRecurringTitle(text, child) {
  const beforeEvery = text.split(/\bevery\b/i)[0];
  return cleanEventTitle(beforeEvery.replace(new RegExp(`\\b${child}\\b`, "i"), "")) || "Repeating date";
}

function extractOneOffTitle(text) {
  const titleBeforeDate = text.split(/\bon\s+\d{1,2}/i)[0];
  const source = titleBeforeDate.length < text.length ? titleBeforeDate : text;

  return (
    cleanEventTitle(
      source
        .replace(/\b\d{4}-\d{2}-\d{2}\b/g, "")
        .replace(/\b\d{1,2}[/.]\d{1,2}(?:[/.]\d{2,4})?\b/g, "")
        .replace(
          /\b\d{1,2}(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+\d{4})?\b/gi,
          "",
        )
        .replace(
          /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?\b/gi,
          "",
        )
        .replace(/\bat\s+\d{1,2}(?::\d{2})?\s*(am|pm)?/gi, "")
        .replace(/\b\d{1,2}(?::\d{2})?\s*(am|pm)\b/gi, "")
        .replace(/\b\d{1,2}:\d{2}\b/g, "")
        .replace(/\b(Ted|Gus|Both)\b/gi, ""),
    ) || "Calendar date"
  );
}

function cleanEventTitle(value) {
  return value
    .replace(/\b(add|has|please|calendar|date|dates|from|message)\b/gi, "")
    .replace(/[-:,.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function normalizeYear(year) {
  return year < 100 ? 2000 + year : year;
}

function setDefaultFormDate(panel) {
  if (panel.id !== "event-panel") {
    return;
  }

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

function createBadge(text, className) {
  const badge = document.createElement("span");
  badge.className = className;
  badge.textContent = text;
  return badge;
}

function createGiftIcon() {
  const wrapper = document.createElement("span");
  wrapper.className = "event-card-icon event-icon-gift";
  wrapper.setAttribute("aria-hidden", "true");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("focusable", "false");

  const paths = [
    "M4 11h16",
    "M12 7v14",
    "M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8",
    "M4 7h16v4H4z",
    "M12 7H8.5A2.5 2.5 0 1 1 12 4.5z",
    "M12 7h3.5A2.5 2.5 0 1 0 12 4.5z",
  ];

  paths.forEach((pathData) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    svg.append(path);
  });

  wrapper.append(svg);
  return wrapper;
}

function isSpecialOccasion(event) {
  const title = event.title.toLowerCase();
  return /\b(birthday|party|gift)\b/.test(title);
}

function formatEventDate(event) {
  const dateText = formatDate.format(new Date(`${event.date}T00:00:00`));
  return event.time ? `${dateText}, ${event.time}` : dateText;
}

function getStatusLabel(status) {
  return status === "cancelled" ? "Cancelled" : "Active";
}

function getParentDay(date) {
  const day = date.getDay();
  if ([2, 4].includes(day)) {
    return { key: "dad", label: "Dad", type: "weekday" };
  }

  if (![0, 5, 6].includes(day)) {
    return null;
  }

  const weekendStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysFromFriday = day === 0 ? 2 : day - 5;
  weekendStart.setDate(weekendStart.getDate() - daysFromFriday);

  const dayMs = 24 * 60 * 60 * 1000;
  const weekendStartMs = Date.UTC(weekendStart.getFullYear(), weekendStart.getMonth(), weekendStart.getDate());
  const weekOffset = Math.round((weekendStartMs - dadWeekendAnchorMs) / dayMs / 7);
  return weekOffset % 2 === 0
    ? { key: "dad", label: "Dad", type: "weekend" }
    : { key: "mum", label: "Mum", type: "weekend" };
}

function getCalendarLabel(date, events, parentDay) {
  const label = formatDate.format(date);
  const parentText = parentDay ? ` ${parentDay.label} ${parentDay.type}.` : "";
  if (!events.length) {
    return `${label}, no events.${parentText} Click to add an event.`;
  }

  return `${label}, ${events.length} event${events.length === 1 ? "" : "s"}.${parentText}`;
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
