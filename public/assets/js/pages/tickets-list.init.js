const perPage = 10;
var editList = !1;
const checkAll = document.getElementById("checkAll");
function handleCheckAll() {
    var e = document.querySelectorAll('.form-check-all input[type="checkbox"]'),
        t = document.querySelectorAll(
            '.form-check-all input[type="checkbox"]:checked'
        ).length;
    const a = this.checked;
    e.forEach((e) => {
        (e.checked = a), updateRowStyle(e);
    }),
        updateRemoveActionsVisibility(t);
}
function updateRowStyle(e) {
    var t = e.closest("tr");
    e.checked
        ? t.classList.add("table-active")
        : t.classList.remove("table-active");
}
function updateRemoveActionsVisibility(e) {
    var t = document.getElementById("remove-actions");
    0 < e ? t.classList.add("d-none") : t.classList.remove("d-none");
}
checkAll && checkAll.addEventListener("click", handleCheckAll);
var options = {
    valueNames: [
        "tickets_id",
        "assign",
        "ticket_title",
        "client_name",
        "create_date",
        "due_date",
        "priority",
        "status",
    ],
    page: perPage,
    pagination: !0,
    plugins: [ListPagination({ left: 2, right: 2 })],
};
const ticketsList = new List("ticketsList", options).on("updated", (e) => {
        0 === e.matchingItems.length
            ? (document.getElementsByClassName("noresult")[0].style.display =
                  "block")
            : (document.getElementsByClassName("noresult")[0].style.display =
                  "none");
        var t = 1 === e.i,
            a = e.i > e.matchingItems.length - e.page,
            i = document.querySelector(".pagination-prev.disabled"),
            n = document.querySelector(".pagination-next.disabled"),
            i =
                (i && i.classList.remove("disabled"),
                n && n.classList.remove("disabled"),
                t &&
                    document
                        .querySelector(".pagination-prev")
                        .classList.add("disabled"),
                a &&
                    document
                        .querySelector(".pagination-next")
                        .classList.add("disabled"),
                document.getElementById("pagination-element"));
        e.matchingItems.length <= perPage
            ? (i.style.display = "none")
            : (i.style.display = "flex"),
            0 < e.matchingItems.length
                ? (document.getElementsByClassName(
                      "noresult"
                  )[0].style.display = "none")
                : (document.getElementsByClassName(
                      "noresult"
                  )[0].style.display = "block");
    }),
    xhttp = new XMLHttpRequest(),
    paginationNext =
        ((xhttp.onload = function () {
            var e = JSON.parse(this.responseText);
            Array.from(e).forEach(function (e) {
                var t = e.assignedto,
                    a = '<div class="avatar-group flex-nowrap">';
                Array.from(t.slice(0, 3)).forEach(function (e) {
                    a += `<a href="javascript:void(0);" class="avatar-group-item" data-img="${e.assigneeImg}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="${e.assigneeName}">
          <img src="${e.assigneeImg}" alt="" class="rounded-circle avatar-xxs" />
        </a>`;
                }),
                    3 < t.length &&
                        ((t = t.length - 3),
                        (a += `<a href="javascript:void(0);" class="avatar-group-item" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="${t} More">
            <div class="avatar-xxs">
                <div class="avatar-title rounded-circle">${t}+</div>
            </div>
            </a>`)),
                    (a += "</div>"),
                    ticketsList.add({
                        tickets_id: `<a href="apps-tickets-overview.html" class="fw-medium link-primary">#TBS2430190${e.id}</a>`,
                        assign: a,
                        ticket_title: e.ticketTitle,
                        client_name: e.clientName,
                        create_date: e.createDate,
                        due_date: e.dueDate,
                        priority: isPriority(e.priority).outerHTML,
                        status: isStatus(e.status).outerHTML,
                    }),
                    ticketsList.sort("tickets_id", { order: "desc" });
            }),
                ticketsList.remove(
                    "tickets_id",
                    '<a href="apps-tickets-overview.html" class="fw-medium link-primary">#TBS243019001</a>'
                ),
                tooltipElm(),
                refreshCallbacks(),
                ischeckboxcheck();
        }),
        xhttp.open("GET", "assets/json/ticket-list.json"),
        xhttp.send(),
        (isCount = new DOMParser().parseFromString(
            ticketsList.items.slice(-1)[0]._values.tickets_id,
            "text/html"
        )),
        document.querySelector(".pagination-next")),
    paginationPrev = document.querySelector(".pagination-prev"),
    listjsPagination = document.querySelector(".pagination.listjs-pagination");
function handleClickNext() {
    var e;
    listjsPagination &&
        listjsPagination.querySelector(".active") &&
        (e = listjsPagination.querySelector(".active")).nextElementSibling &&
        e.nextElementSibling.children[0].click();
}
function handleClickPrev() {
    var e;
    listjsPagination &&
        listjsPagination.querySelector(".active") &&
        (e = listjsPagination.querySelector(".active"))
            .previousElementSibling &&
        e.previousElementSibling.children[0].click();
}
function isStatus(e) {
    var t = document.createElement("span");
    switch (e) {
        case "Open":
            t.classList.add("badge", "bg-primary-subtle"),
                t.classList.add("badge", "text-primary"),
                (t.textContent = e);
            break;
        case "New":
            t.classList.add("badge", "bg-info-subtle"),
                t.classList.add("badge", "text-info"),
                (t.textContent = e);
            break;
        case "Close":
            t.classList.add("badge", "bg-danger-subtle"),
                t.classList.add("badge", "text-danger"),
                (t.textContent = e);
            break;
        case "Pending":
            t.classList.add("badge", "bg-warning-subtle"),
                t.classList.add("badge", "text-warning"),
                (t.textContent = e);
            break;
        default:
            t.classList.add("badge", "bg-primary-subtle"),
                t.classList.add("badge", "text-primary"),
                (t.textContent = e);
    }
    return t;
}
function isPriority(e) {
    var t = document.createElement("span");
    switch (e) {
        case "High":
            t.classList.add("badge", "bg-danger"), (t.textContent = e);
            break;
        case "Low":
            t.classList.add("badge", "bg-success"), (t.textContent = e);
            break;
        default:
            t.classList.add("badge", "bg-info"), (t.textContent = e);
    }
    return t;
}
function tooltipElm() {
    [...document.querySelectorAll('[data-bs-toggle="tooltip"]')].map(
        (e) => new bootstrap.Tooltip(e)
    );
}
paginationNext && paginationNext.addEventListener("click", handleClickNext),
    paginationPrev && paginationPrev.addEventListener("click", handleClickPrev);
var idFieldInput = document.getElementById("id-field"),
    clientNameInput = document.getElementById("client-name-input"),
    ticketTitleInput = document.getElementById("ticket-title-input"),
    createDateInput = document.getElementById("create-date-input"),
    dueDateInput = document.getElementById("due-date-input"),
    priorityInput = document.getElementById("priority-input"),
    statusInput = document.getElementById("status-input"),
    priorityVal =
        (flatpickr("#create-date-input", { dateFormat: "d M, Y" }),
        flatpickr("#due-date-input", { dateFormat: "d M, Y" }),
        new Choices(priorityInput, { searchEnabled: !1 })),
    statusVal = new Choices(statusInput, { searchEnabled: !1 }),
    removeBtns = document.getElementsByClassName("remove-item-btn"),
    editBtns = document.getElementsByClassName("edit-item-btn"),
    count = 14,
    forms = document.querySelectorAll(".tablelist-form");
Array.prototype.slice.call(forms).forEach(function (e) {
    e.addEventListener("submit", function (e) {
        e.preventDefault();
        var t = document.getElementById("alert-error-msg");
        t.classList.remove("d-none"),
            setTimeout(() => t.classList.add("d-none"), 2e3);
        let a = !0;
        return (
            [
                {
                    input: clientNameInput,
                    error: "Please enter a client name.",
                },
                {
                    input: ticketTitleInput,
                    error: "Please enter a ticket title.",
                },
                {
                    input: createDateInput,
                    error: "Please select a create date.",
                },
                { input: dueDateInput, error: "Please select a due date." },
                { input: priorityInput, error: "Please select a priority." },
                { input: statusInput, error: "Please select a status." },
            ].forEach(function (e) {
                a && "" === e.input.value.trim()
                    ? ((t.innerHTML = e.error),
                      e.input.classList.add("is-invalid"),
                      (a = !1))
                    : e.input.classList.remove("is-invalid");
            }),
            !editList && a
                ? (ticketsList.add({
                      tickets_id: `<a href="apps-tickets-overview.html" class="fw-medium link-primary">#TBS2430190${count}</a>`,
                      assign: assignToUsers(),
                      ticket_title: ticketTitleInput.value,
                      client_name: clientNameInput.value,
                      create_date: createDateInput.value,
                      due_date: dueDateInput.value,
                      priority: isPriority(priorityInput.value).outerHTML,
                      status: isStatus(statusInput.value).outerHTML,
                  }),
                  ticketsList.sort("tickets_id", { order: "desc" }),
                  document
                      .getElementById("alert-error-msg")
                      .classList.add("d-none"),
                  document.getElementById("close-addTicketModal").click(),
                  count++,
                  clearFields(),
                  refreshCallbacks(),
                  Swal.fire({
                      position: "center",
                      icon: "success",
                      title: "Ticket detail inserted successfully!",
                      showConfirmButton: !1,
                      timer: 2e3,
                      showCloseButton: !0,
                  }))
                : editList &&
                  a &&
                  ((e = ticketsList.get({ tickets_id: idFieldInput.value })),
                  Array.from(e).forEach(function (e) {
                      new DOMParser().parseFromString(
                          e._values.tickets_id,
                          "text/html"
                      ).body.firstElementChild.innerHTML == itemId &&
                          e.values({
                              tickets_id: `<a href="apps-tickets-overview.html" class="fw-medium link-primary">${idFieldInput.value}</a>`,
                              assign: assignToUsers(),
                              ticket_title: ticketTitleInput.value,
                              client_name: clientNameInput.value,
                              create_date: createDateInput.value,
                              due_date: dueDateInput.value,
                              priority: isPriority(priorityInput.value)
                                  .outerHTML,
                              status: isStatus(statusInput.value).outerHTML,
                          });
                  }),
                  document
                      .getElementById("alert-error-msg")
                      .classList.add("d-none"),
                  document.getElementById("close-addTicketModal").click(),
                  clearFields(),
                  Swal.fire({
                      position: "center",
                      icon: "success",
                      title: "Ticket Details updated Successfully!",
                      showConfirmButton: !1,
                      timer: 2e3,
                      showCloseButton: !0,
                  })),
            !0
        );
    });
});
const selectElements = Array.from(
    document.getElementsByClassName("select-element")
);
function assignToUsers() {
    var a = [],
        e = document.querySelectorAll(".option-list.active"),
        e =
            (Array.from(e).forEach(function (e) {
                var t = e.querySelector(".avatar-xs img").getAttribute("src"),
                    e = e.querySelector(".flex-grow-1 .d-block").innerHTML;
                a.push({ assigneeName: e, assigneeImg: t });
            }),
            a),
        t = '<div class="avatar-group flex-nowrap">';
    return (
        Array.from(e.slice(0, 3)).forEach(function (e) {
            t += `<a href="javascript: void(0);" class="avatar-group-item" data-img="${e.assigneeImg}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="${e.assigneeName}">            <img src="${e.assigneeImg}" alt="" class="rounded-circle avatar-xxs" />        </a>`;
        }),
        3 < e.length &&
            ((e = e.length - 3),
            (t += `<a href="javascript: void(0);" class="avatar-group-item" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="${e} More">            <div class="avatar-xxs">                <div class="avatar-title rounded-circle">${e}+</div>            </div>        </a>`)),
        (t += "</div>")
    );
}
function ischeckboxcheck() {
    Array.from(document.getElementsByName("chk_child")).forEach(function (i) {
        i.addEventListener("change", function (e) {
            var e = e.target.closest("tr"),
                t =
                    (i.checked
                        ? e.classList.add("table-active")
                        : e.classList.remove("table-active"),
                    document.querySelectorAll('[name="chk_child"]:checked')
                        .length),
                a = document.getElementById("remove-actions");
            e.classList.contains("table-active"),
                a.classList.toggle("d-none", t <= 0);
        });
    });
}
function refreshCallbacks() {
    editBtns &&
        Array.from(editBtns).forEach(function (e) {
            e.addEventListener("click", function (e) {
                e.target.closest("tr").children[1].innerText;
                var a = e.target.closest("tr").children[1].innerText,
                    e = ticketsList.get({ tickets_id: a });
                Array.from(e).forEach(function (e) {
                    var t = new DOMParser().parseFromString(
                        e._values.tickets_id,
                        "text/html"
                    ).body.firstElementChild.innerHTML;
                    t == a &&
                        ((editList = !0),
                        (document.getElementById(
                            "addTicketModalLabel"
                        ).innerHTML = "Edit Ticket Details"),
                        (document.getElementById("add-btn").innerHTML =
                            "Update"),
                        (idFieldInput.value = t),
                        (ticketTitleInput.value = e._values.ticket_title),
                        (clientNameInput.value = e._values.client_name),
                        (createDateInput.value = e._values.create_date),
                        (dueDateInput.value = e._values.due_date),
                        Array.from(
                            document.querySelectorAll(
                                ".select-element .option-list"
                            )
                        ).forEach(function (a) {
                            var i = a.querySelector(
                                ".flex-grow-1 .d-block"
                            ).innerHTML;
                            new DOMParser()
                                .parseFromString(e._values.assign, "text/html")
                                .querySelectorAll(
                                    ".avatar-group .avatar-group-item"
                                )
                                .forEach(function (e) {
                                    var t;
                                    return (
                                        e.getAttribute("data-bs-title") == i &&
                                            (a.classList.add("active"),
                                            (t =
                                                document.getElementById(
                                                    "assignee-member"
                                                )),
                                            a.classList.contains("active")) &&
                                            ((e =
                                                '<a href="javascript: void(0);" class="avatar-group-item mb-2" data-img="' +
                                                e.getAttribute("data-img") +
                                                '"  data-bs-toggle="tooltip" data -bs-placement="top" data-bs-title="' +
                                                e.getAttribute(
                                                    "data-bs-title"
                                                ) +
                                                '">                                        <img src="' +
                                                e.getAttribute("data-img") +
                                                '" alt="" class="rounded-circle avatar-xs" />                                        </a>'),
                                            t.insertAdjacentHTML(
                                                "beforeend",
                                                e
                                            ),
                                            (a.querySelector(
                                                ".btn-action"
                                            ).innerHTML = "Remove"),
                                            tooltipElm()),
                                        a
                                    );
                                });
                        }),
                        flatpickr("#create-date-input", {
                            dateFormat: "d M, Y",
                            defaultDate: e._values.create_date,
                        }),
                        flatpickr("#due-date-input", {
                            dateFormat: "d M, Y",
                            defaultDate: e._values.due_date,
                        }),
                        (t = new DOMParser().parseFromString(
                            e._values.priority,
                            "text/html"
                        )),
                        (priorityInput.value =
                            t.body.querySelector(".badge").innerHTML),
                        priorityVal && priorityVal.destroy(),
                        (priorityVal = new Choices(priorityInput, {
                            searchEnabled: !1,
                        })).setChoiceByValue(
                            t.body.querySelector(".badge").innerHTML
                        ),
                        (t = new DOMParser().parseFromString(
                            e._values.status,
                            "text/html"
                        )),
                        (statusInput.value =
                            t.body.querySelector(".badge").innerHTML),
                        statusVal && statusVal.destroy(),
                        (statusVal = new Choices(statusInput, {
                            searchEnabled: !1,
                        })).setChoiceByValue(
                            t.body.querySelector(".badge").innerHTML
                        ));
                });
            });
        }),
        removeBtns &&
            Array.from(removeBtns).forEach(function (e) {
                e.addEventListener("click", function (e) {
                    e.target.closest("tr").children[1].innerText,
                        (itemId = e.target.closest("tr").children[1].innerText);
                    e = ticketsList.get({ tickets_id: itemId });
                    Array.from(e).forEach(function (e) {
                        var e = new DOMParser().parseFromString(
                                e._values.tickets_id,
                                "text/html"
                            ),
                            t = e.body.firstElementChild;
                        e.body.firstElementChild.innerHTML == itemId &&
                            document
                                .getElementById("delete-record")
                                .addEventListener("click", function () {
                                    ticketsList.remove(
                                        "tickets_id",
                                        t.outerHTML
                                    ),
                                        document
                                            .getElementById(
                                                "deleteRecord-close"
                                            )
                                            .click();
                                });
                    });
                });
            });
}
function clearFields() {
    (editList = !1),
        (idFieldInput.value = ""),
        (clientNameInput.value = ""),
        (ticketTitleInput.value = ""),
        (createDateInput.value = ""),
        (dueDateInput.value = ""),
        (priorityInput.value = ""),
        (statusInput.value = ""),
        priorityVal && priorityVal.destroy(),
        (priorityVal = new Choices(priorityInput, { searchEnabled: !1 })),
        statusVal && statusVal.destroy(),
        (statusVal = new Choices(statusInput, { searchEnabled: !1 })),
        flatpickr("#create-date-input", { dateFormat: "d M, Y" }),
        flatpickr("#due-date-input", { dateFormat: "d M, Y" }),
        Array.from(document.querySelectorAll(".option-list")).forEach(function (
            e
        ) {
            e.classList.contains("active") && e.classList.remove("active"),
                (e.querySelector(".btn-action").innerHTML = "add");
        }),
        (document.getElementById("assignee-member").innerHTML = "");
}
function deleteMultiple() {
    const t = [];
    var e,
        a = document.getElementsByName("chk_child");
    for (i = 0; i < a.length; i++)
        1 == a[i].checked &&
            ((e =
                a[i].parentNode.parentNode.parentNode.querySelector(
                    "td a"
                ).innerHTML),
            t.push(e));
    void 0 !== t && 0 < t.length
        ? Swal.fire({
              title: "Are you sure?",
              text: "You won't be able to revert this!",
              icon: "warning",
              showCancelButton: !0,
              confirmButtonClass: "btn btn-primary w-xs me-2 mt-2",
              cancelButtonClass: "btn btn-danger w-xs mt-2",
              confirmButtonText: "Yes, delete it!",
              buttonsStyling: !1,
              showCloseButton: !0,
          }).then(function (e) {
              if (e.value) {
                  for (i = 0; i < t.length; i++)
                      ticketsList.remove(
                          "tickets_id",
                          `<a href="apps-tickets-overview.html" class="fw-medium link-primary">${t[i]}</a>`
                      );
                  document
                      .getElementById("remove-actions")
                      .classList.add("d-none"),
                      (document.getElementById("checkAll").checked = !1),
                      Swal.fire({
                          title: "Deleted!",
                          text: "Your data has been deleted.",
                          icon: "success",
                          confirmButtonClass: "btn btn-info w-xs mt-2",
                          buttonsStyling: !1,
                      });
              }
          })
        : Swal.fire({
              title: "Please select at least one checkbox",
              confirmButtonClass: "btn btn-info",
              buttonsStyling: !1,
              showCloseButton: !0,
          });
}
selectElements.forEach(function (e) {
    Array.from(e.querySelectorAll(".option-list")).forEach(function (t) {
        const a = t.querySelector(".btn-action"),
            i = t.querySelector(".avatar-xs img").getAttribute("src"),
            n = document.getElementById("assignee-member");
        a.addEventListener("click", function () {
            var e;
            t.classList.toggle("active"),
                t.classList.contains("active")
                    ? ((e = t.querySelector(".flex-grow-1 .d-block").innerHTML),
                      (e = `<a href="javascript: void(0);" class="avatar-group-item mb-2" data-img="${i}" data-bs-toggle="tooltip" data-bs-placement="top" title="${e}">                    <img src="${i}" alt="" class="rounded-circle avatar-xs" />                    </a>`),
                      n.insertAdjacentHTML("beforeend", e),
                      (a.innerHTML = "Remove"),
                      tooltipElm())
                    : Array.from(
                          n.querySelectorAll(".avatar-group-item")
                      ).forEach(function (e) {
                          var t = e.getAttribute("data-img");
                          i === t && (e.remove(), (a.innerHTML = "Add"));
                      });
        });
    });
}),
    document
        .getElementById("addTickets")
        .addEventListener("hidden.bs.modal", function () {
            clearFields();
        });
