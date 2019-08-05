//Функция получает и отправляет на сервер данные
function makeRequest(method, url, cb, userObj) {
  try {
    const body = JSON.stringify(userObj);
    const xhr = new XMLHttpRequest();

    xhr.addEventListener("load", () => {
      if (!String(xhr.status).startsWith("2")) {
        cb(`Error! Status code:${xhr.status}`);
        return;
      }
      const resParse = JSON.parse(xhr.responseText);
      cb(null, resParse);
    });

    xhr.addEventListener("error", () => cb("Error! Error event received."));
    xhr.open(method, url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(body);
  } catch (err) {
    cb(err);
  }
}

//Адресс сервера. Основные списки и форма в документе
const usersURL = "https://jsonplaceholder.typicode.com/users";
const form_addUser = document.querySelector('form[name="add-user"]');
const ul_users = document.querySelector("#list-of-users");
const ul_info = document.querySelector("#user-info");
const usersArr = [];

//Функция выводит список пользователей
function renderUsersList(users) {
  const fragment = document.createDocumentFragment();

  users.forEach(user => fragment.appendChild(listUserItemTemplate(user)));

  ul_users.appendChild(fragment);
}

//Функция оформляет одну запись пользователя согласно шаблону
function listUserItemTemplate(user) {
  const user_li = document.createElement("li");
  user_li.dataset.userId = user.id;
  user_li.className = "list-group-item list-group-item-action";
  user_li.textContent = user.username;

  user_li.addEventListener("click", el => {
    ul_users
      .querySelectorAll("li.active")
      .forEach(el => el.classList.remove("active"));
    el.target.classList.toggle("active");

    ul_info.querySelectorAll("li span").forEach(el => (el.textContent = ""));
    outUserInfo(
      usersArr.find(user => String(user.id) === el.target.dataset.userId)
    );
  });

  return user_li;
}

//Рекурсивная функция выводит информацию о пользователе из вложенных полей
function outUserInfo(user, rootField = "") {
  for (const key in user)
    if (typeof user[key] !== "object") {
      const infoSpan = ul_info.querySelector(
        `span[data-text-field=${rootField + key}]`
      );
      if (infoSpan) infoSpan.textContent = user[key];
    } else {
      outUserInfo(user[key], rootField + key + "-");
    }
}

//Функция проверяет наличие значений в полях с переданными названиями
function checkRequiredFields() {
  let result = true;

  form_addUser.querySelectorAll('[role="alert"]').forEach(el => el.remove());

  for (const field of arguments) {
    const inputField = form_addUser.querySelector(`input[name="${field}"]`);

    if (!inputField.value) {
      result = false;
      console.dir(inputField);
      inputField.parentElement.innerHTML += `
        <div class="alert alert-warning mt-2 mb-0" role="alert">
          <strong>Warning!</strong>
              <p class="text-right m-0">Enter another value in this field.
              </p>
        </div>`;
    }
  }

  return result;
}

//Функция создает объект с новым пользователем, и отправляет на сервер
function OnAddUser(el) {
  el.preventDefault();
  if (!checkRequiredFields("name", "username")) return;

  const userObj = Array.from(form_addUser.querySelectorAll("input")).reduce(
    (acc, inp) => {
      acc[inp.name] = inp.value;
      return acc;
    },
    {}
  );

  makeRequest(
    "POST",
    usersURL,
    (err, res) => {
      if (err) {
        alert(err);
        return;
      }
      //Добавляю (usersArr.length-10), т.к. сервер всегда возвращает id=11
      res.id += usersArr.length - 10;

      usersArr.push(res);
      ul_users.appendChild(listUserItemTemplate(res));
    },
    userObj
  );

  el.target.closest("form").reset();
}

//Получаем список пользователей на сервере, проверяем наличие ошибок
makeRequest("GET", usersURL, (err, res) => {
  if (err) {
    alert(err);
    return;
  }
  usersArr.push(...res);
  renderUsersList(res);
});

//Назначаем обработчик события на кнопку "Add", добавляющий пользователя
document.querySelector("#btnSubmit").addEventListener("click", OnAddUser);
